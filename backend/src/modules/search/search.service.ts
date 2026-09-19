import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memory } from '../../database/entities/memory.entity';
import { SemanticSearchService } from './semantic-search.service';
import { FulltextSearchService } from './fulltext-search.service';

export interface SearchResult {
  memory: Memory;
  score: number;
  semanticScore: number;
  fulltextScore: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Memory)
    private readonly memoryRepository: Repository<Memory>,
    private readonly semanticSearchService: SemanticSearchService,
    private readonly fulltextSearchService: FulltextSearchService,
  ) {}

  async hybridSearch(
    userId: string,
    query: string,
    options: {
      projectId?: string;
      workspaceId?: string;
      limit?: number;
      scope?: string;
    } = {},
  ): Promise<SearchResult[]> {
    const limit = options.limit || 20;

    const semanticResults = await this.semanticSearchService.search(userId, query, options);
    const fulltextResults = await this.fulltextSearchService.search(userId, query, options);

    const merged = new Map<string, SearchResult>();

    for (const result of semanticResults) {
      merged.set(result.memory.id, {
        memory: result.memory,
        score: result.score * 0.45,
        semanticScore: result.score,
        fulltextScore: 0,
      });
    }

    for (const result of fulltextResults) {
      const existing = merged.get(result.memory.id);
      if (existing) {
        existing.score += result.score * 0.25;
        existing.fulltextScore = result.score;
      } else {
        merged.set(result.memory.id, {
          memory: result.memory,
          score: result.score * 0.25,
          semanticScore: 0,
          fulltextScore: result.score,
        });
      }
    }

    const results = Array.from(merged.values());

    for (const result of results) {
      result.score += this.calculateImportanceScore(result.memory.importance);
      result.score += this.calculateRecencyScore(result.memory.updated_at);
      result.score += this.calculateScopeScore(result.memory.scope, options.projectId, options.workspaceId);
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  private calculateImportanceScore(importance: number): number {
    return (importance / 10) * 0.10;
  }

  private calculateRecencyScore(updatedAt: Date): number {
    const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0, 1 - daysSinceUpdate / 365);
    return recencyFactor * 0.05;
  }

  private calculateScopeScore(
    scope: string,
    projectId?: string,
    workspaceId?: string,
  ): number {
    if (projectId && scope === 'project') return 0.15;
    if (workspaceId && scope === 'workspace') return 0.10;
    if (scope === 'global') return 0.05;
    return 0;
  }
}
