import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memory, MemoryScope, MemoryType } from '../../database/entities/memory.entity';
import { MemoryVersion } from '../../database/entities/memory-version.entity';
import { Project } from '../../database/entities/project.entity';
import { EmbeddingService } from '../embeddings/embedding.service';
import { SearchService } from '../search/search.service';
import { CacheService } from '../cache/cache.service';
import { AuditService } from '../audit/audit.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { SearchMemoriesDto } from './dto/search-memories.dto';
import { ListMemoriesQueryDto } from './dto/list-memories-query.dto';

@Injectable()
export class MemoriesService {
  constructor(
    @InjectRepository(Memory)
    private readonly memoryRepository: Repository<Memory>,
    @InjectRepository(MemoryVersion)
    private readonly memoryVersionRepository: Repository<MemoryVersion>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly embeddingService: EmbeddingService,
    private readonly searchService: SearchService,
    private readonly cacheService: CacheService,
    private readonly auditService: AuditService,
  ) {}

  async create(userId: string, dto: CreateMemoryDto): Promise<Memory> {
    const embedding = await this.embeddingService.generateEmbedding(dto.content);

    const duplicate = await this.findDuplicate(userId, embedding, dto.content);
    if (duplicate) {
      duplicate.content = dto.content;
      duplicate.importance = Math.max(duplicate.importance, dto.importance || 5);
      duplicate.updated_at = new Date();
      await this.memoryRepository.save(duplicate);
      await this.invalidateCaches(userId, duplicate);
      return duplicate;
    }

    const memory = this.memoryRepository.create({
      user_id: userId,
      content: dto.content,
      title: dto.title || null,
      type: dto.type,
      scope: dto.scope,
      project_id: dto.project_id || null,
      workspace_id: dto.workspace_id || null,
      embedding,
      importance: dto.importance || 5,
      tags: dto.tags || {},
      metadata: dto.metadata || {},
      source: dto.source || null,
      source_client: dto.source_client || null,
    });

    const saved = await this.memoryRepository.save(memory);
    await this.auditService.log(userId, 'memory.created', { memoryId: saved.id });
    await this.invalidateCaches(userId, saved);
    return saved;
  }

  async findAll(userId: string, query: ListMemoriesQueryDto): Promise<{ items: Memory[]; total: number }> {
    const queryBuilder = this.memoryRepository
      .createQueryBuilder('memory')
      .where('memory.user_id = :userId', { userId })
      .andWhere('memory.is_deleted = false');

    if (query.project_id) {
      queryBuilder.andWhere('memory.project_id = :projectId', { projectId: query.project_id });
    }
    if (query.workspace_id) {
      queryBuilder.andWhere('memory.workspace_id = :workspaceId', { workspaceId: query.workspace_id });
    }
    if (query.scope) {
      queryBuilder.andWhere('memory.scope = :scope', { scope: query.scope });
    }
    if (query.type) {
      queryBuilder.andWhere('memory.type = :type', { type: query.type });
    }
    if (query.query) {
      queryBuilder.andWhere(
        "memory.content ILIKE :search OR memory.title ILIKE :search",
        { search: `%${query.query}%` },
      );
    }

    const [items, total] = await queryBuilder
      .orderBy('memory.updated_at', 'DESC')
      .skip(query.offset || 0)
      .take(query.limit || 20)
      .getManyAndCount();

    return { items, total };
  }

  async findOne(userId: string, id: string): Promise<Memory> {
    const memory = await this.memoryRepository.findOne({
      where: { id, user_id: userId, is_deleted: false },
    });
    if (!memory) {
      throw new NotFoundException('Memory not found');
    }
    memory.access_count += 1;
    memory.last_accessed_at = new Date();
    await this.memoryRepository.save(memory);
    return memory;
  }

  async update(userId: string, id: string, dto: UpdateMemoryDto): Promise<Memory> {
    const memory = await this.findOne(userId, id);

    if (dto.content && dto.content !== memory.content) {
      await this.saveVersion(memory);
      memory.embedding = await this.embeddingService.generateEmbedding(dto.content);
      memory.content = dto.content;
    }

    if (dto.title !== undefined) memory.title = dto.title || null;
    if (dto.type) memory.type = dto.type;
    if (dto.importance !== undefined) memory.importance = dto.importance;
    if (dto.tags) memory.tags = dto.tags;
    if (dto.metadata) memory.metadata = dto.metadata;

    memory.updated_at = new Date();
    const saved = await this.memoryRepository.save(memory);
    await this.auditService.log(userId, 'memory.updated', { memoryId: saved.id });
    await this.invalidateCaches(userId, saved);
    return saved;
  }

  async remove(userId: string, id: string): Promise<void> {
    const memory = await this.findOne(userId, id);
    memory.is_deleted = true;
    memory.deleted_at = new Date();
    await this.memoryRepository.save(memory);
    await this.auditService.log(userId, 'memory.deleted', { memoryId: id });
    await this.invalidateCaches(userId, memory);
  }

  async search(userId: string, dto: SearchMemoriesDto): Promise<any[]> {
    const cacheKey = `memory:search:${userId}:${dto.query}:${dto.project_id || 'all'}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    let projectId = dto.project_id;
    if (dto.project && !projectId) {
      const project = await this.findProjectByIdentifier(userId, dto.project);
      if (project) projectId = project.id;
    }

    const results = await this.searchService.hybridSearch(userId, dto.query, {
      projectId,
      limit: dto.limit || 20,
    });

    const memories = results.map((r) => ({
      ...r.memory,
      score: r.score,
    }));

    await this.cacheService.set(cacheKey, memories, 60);
    return memories;
  }

  async getRules(userId: string, projectIdentifier?: string): Promise<Memory[]> {
    let projectId: string | undefined;
    if (projectIdentifier) {
      const project = await this.findProjectByIdentifier(userId, projectIdentifier);
      if (project) projectId = project.id;
    }

    const types = [MemoryType.RULE, MemoryType.CONVENTION, MemoryType.ARCHITECTURE, MemoryType.PREFERENCE];

    const queryBuilder = this.memoryRepository
      .createQueryBuilder('memory')
      .where('memory.user_id = :userId', { userId })
      .andWhere('memory.is_deleted = false')
      .andWhere('memory.type IN (:...types)', { types })
      .orderBy('memory.importance', 'DESC')
      .addOrderBy('memory.updated_at', 'DESC')
      .limit(50);

    if (projectId) {
      queryBuilder.andWhere(
        '(memory.project_id = :projectId OR memory.scope = :globalScope)',
        { projectId, globalScope: MemoryScope.GLOBAL },
      );
    }

    return queryBuilder.getMany();
  }

  private async findDuplicate(userId: string, embedding: number[], content: string): Promise<Memory | null> {
    const results = await this.searchService.hybridSearch(userId, content, { limit: 5 });
    for (const result of results) {
      if (result.score > 0.92) {
        return result.memory;
      }
    }
    return null;
  }

  private async saveVersion(memory: Memory): Promise<void> {
    const version = this.memoryVersionRepository.create({
      memory_id: memory.id,
      version: (memory.metadata?.version || 0) + 1,
      content: memory.content,
      metadata: memory.metadata,
    });
    await this.memoryVersionRepository.save(version);
  }

  private async invalidateCaches(userId: string, memory: Memory): Promise<void> {
    await this.cacheService.delPattern(`memory:search:${userId}:*`);
    await this.cacheService.delPattern(`memory:context:${userId}:*`);
    if (memory.project_id) {
      await this.cacheService.delPattern(`memory:context:${memory.project_id}:*`);
    }
  }

  private async findProjectByIdentifier(userId: string, identifier: string): Promise<Project | null> {
    const normalized = identifier
      .replace(/^git@/, '')
      .replace(/\.git$/, '')
      .replace(':', '/');
    return this.projectRepository.findOne({
      where: [
        { user_id: userId, git_remote: normalized },
        { user_id: userId, repository_url: normalized },
      ],
    });
  }
}
