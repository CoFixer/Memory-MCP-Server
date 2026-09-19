import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memory, MemoryType } from '../../database/entities/memory.entity';
import { Project } from '../../database/entities/project.entity';
import { SearchService } from '../search/search.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ContextService {
  constructor(
    @InjectRepository(Memory)
    private readonly memoryRepository: Repository<Memory>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly searchService: SearchService,
    private readonly cacheService: CacheService,
  ) {}

  async getContext(
    userId: string,
    query: string,
    options: {
      project?: string;
      max_tokens?: number;
    } = {},
  ): Promise<{ memories: Memory[]; totalTokens: number }> {
    const maxTokens = options.max_tokens || 4000;
    const cacheKey = `memory:context:${userId}:${options.project || 'global'}:${this.hashQuery(query)}`;

    const cached = await this.cacheService.get<{ memories: Memory[]; totalTokens: number }>(cacheKey);
    if (cached) return cached;

    let projectId: string | undefined;
    if (options.project) {
      const normalized = options.project
        .replace(/^git@/, '')
        .replace(/\.git$/, '')
        .replace(':', '/');
      const project = await this.projectRepository.findOne({
        where: [
          { user_id: userId, git_remote: normalized },
          { user_id: userId, repository_url: normalized },
        ],
      });
      if (project) projectId = project.id;
    }

    const rules = await this.getMandatoryRules(userId, projectId);
    const searchResults = await this.searchService.hybridSearch(userId, query, {
      projectId,
      limit: 50,
    });

    const candidates = [...rules];
    for (const result of searchResults) {
      if (!candidates.find((c) => c.id === result.memory.id)) {
        candidates.push(result.memory);
      }
    }

    const prioritized = this.prioritize(candidates);
    const selected = this.selectWithinTokenBudget(prioritized, maxTokens);

    const result = {
      memories: selected,
      totalTokens: this.estimateTokens(selected),
    };

    await this.cacheService.set(cacheKey, result, 120);
    return result;
  }

  private async getMandatoryRules(userId: string, projectId?: string): Promise<Memory[]> {
    const queryBuilder = this.memoryRepository
      .createQueryBuilder('memory')
      .where('memory.user_id = :userId', { userId })
      .andWhere('memory.is_deleted = false')
      .andWhere('memory.type IN (:...types)', {
        types: [MemoryType.RULE, MemoryType.ARCHITECTURE, MemoryType.CONVENTION],
      })
      .andWhere('memory.importance >= 8')
      .orderBy('memory.importance', 'DESC');

    if (projectId) {
      queryBuilder.andWhere(
        '(memory.project_id = :projectId OR memory.scope = :globalScope)',
        { projectId, globalScope: 'global' },
      );
    }

    return queryBuilder.limit(20).getMany();
  }

  private prioritize(memories: Memory[]): Memory[] {
    const priorityOrder = [
      MemoryType.RULE,
      MemoryType.ARCHITECTURE,
      MemoryType.DECISION,
      MemoryType.FACT,
      MemoryType.CONVENTION,
      MemoryType.PREFERENCE,
      MemoryType.DEPENDENCY,
      MemoryType.CONFIGURATION,
      MemoryType.WORKFLOW,
      MemoryType.SOLUTION,
      MemoryType.ISSUE,
      MemoryType.NOTE,
    ];

    return memories.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.type);
      const bPriority = priorityOrder.indexOf(b.type);
      if (aPriority !== bPriority) return aPriority - bPriority;
      if (b.importance !== a.importance) return b.importance - a.importance;
      return b.updated_at.getTime() - a.updated_at.getTime();
    });
  }

  private selectWithinTokenBudget(memories: Memory[], maxTokens: number): Memory[] {
    const selected: Memory[] = [];
    let currentTokens = 0;

    for (const memory of memories) {
      const tokens = this.estimateMemoryTokens(memory);
      if (currentTokens + tokens > maxTokens) break;
      selected.push(memory);
      currentTokens += tokens;
    }

    return selected;
  }

  private estimateTokens(memories: Memory[]): number {
    return memories.reduce((sum, m) => sum + this.estimateMemoryTokens(m), 0);
  }

  private estimateMemoryTokens(memory: Memory): number {
    const text = `${memory.title || ''} ${memory.content}`;
    return Math.ceil(text.split(/\s+/).length * 1.3);
  }

  private hashQuery(query: string): string {
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}
