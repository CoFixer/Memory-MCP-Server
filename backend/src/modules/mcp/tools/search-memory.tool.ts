import { Injectable } from '@nestjs/common';
import { MemoriesService } from '../../memories/memories.service';
import { User } from '../../../database/entities/user.entity';
import { McpTool } from '../mcp-tool.interface';

@Injectable()
export class SearchMemoryTool implements McpTool {
  constructor(private readonly memoriesService: MemoriesService) {}

  getDescription(): string {
    return 'Search memories using hybrid semantic + full-text search. Returns ranked results combining vector similarity, keyword relevance, importance, and recency.';
  }

  getInputSchema(): object {
    return {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        project: { type: 'string', description: 'Project identifier' },
        limit: { type: 'number', description: 'Maximum results', default: 10 },
      },
      required: ['query'],
    };
  }

  async execute(user: User, args: any): Promise<any> {
    const results = await this.memoriesService.search(user.id, {
      query: args.query,
      project: args.project,
      limit: args.limit || 10,
    });
    return { results };
  }
}
