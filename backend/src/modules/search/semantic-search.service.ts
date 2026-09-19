import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memory } from '../../database/entities/memory.entity';
import { EmbeddingService } from '../embeddings/embedding.service';

@Injectable()
export class SemanticSearchService {
  constructor(
    @InjectRepository(Memory)
    private readonly memoryRepository: Repository<Memory>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async search(
    userId: string,
    query: string,
    options: {
      projectId?: string;
      workspaceId?: string;
      limit?: number;
      scope?: string;
    } = {},
  ): Promise<Array<{ memory: Memory; score: number }>> {
    const embedding = await this.embeddingService.generateEmbedding(query);
    const limit = options.limit || 20;

    const queryBuilder = this.memoryRepository
      .createQueryBuilder('memory')
      .where('memory.user_id = :userId', { userId })
      .andWhere('memory.is_deleted = false')
      .andWhere('memory.is_archived = false')
      .orderBy('memory.embedding <-> :embedding', 'ASC')
      .setParameter('embedding', `{${embedding.join(',')}}`)
      .limit(limit);

    if (options.projectId) {
      queryBuilder.andWhere(
        '(memory.project_id = :projectId OR memory.scope = :globalScope)',
        { projectId: options.projectId, globalScope: 'global' },
      );
    }

    if (options.workspaceId && !options.projectId) {
      queryBuilder.andWhere(
        '(memory.workspace_id = :workspaceId OR memory.scope = :globalScope)',
        { workspaceId: options.workspaceId, globalScope: 'global' },
      );
    }

    if (options.scope) {
      queryBuilder.andWhere('memory.scope = :scope', { scope: options.scope });
    }

    const memories = await queryBuilder.getMany();

    return memories.map((memory, index) => ({
      memory,
      score: Math.max(0, 1 - index / limit),
    }));
  }
}
