import { Injectable } from '@nestjs/common';
import { ContextService } from '../../context/context.service';
import { User } from '../../../database/entities/user.entity';
import { McpTool } from '../mcp-tool.interface';

@Injectable()
export class GetContextTool implements McpTool {
  constructor(private readonly contextService: ContextService) {}

  getDescription(): string {
    return 'Retrieve relevant context memories for a given query. Returns curated global, workspace, and project memories optimized for LLM token usage.';
  }

  getInputSchema(): object {
    return {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The query to retrieve context for' },
        project: { type: 'string', description: 'Project identifier (e.g. github.com/company/project)' },
        max_tokens: { type: 'number', description: 'Maximum tokens for context', default: 4000 },
      },
      required: ['query'],
    };
  }

  async execute(user: User, args: any): Promise<any> {
    const result = await this.contextService.getContext(user.id, args.query, {
      project: args.project,
      max_tokens: args.max_tokens,
    });
    return {
      memories: result.memories.map((m) => ({
        id: m.id,
        type: m.type,
        scope: m.scope,
        title: m.title,
        content: m.content,
        importance: m.importance,
        tags: m.tags,
      })),
      totalTokens: result.totalTokens,
    };
  }
}
