import { Injectable } from '@nestjs/common';
import { MemoriesService } from '../../memories/memories.service';
import { User } from '../../../database/entities/user.entity';
import { MemoryType, MemoryScope } from '../../../database/entities/memory.entity';
import { McpTool } from '../mcp-tool.interface';

@Injectable()
export class RememberDecisionTool implements McpTool {
  constructor(private readonly memoriesService: MemoriesService) {}

  getDescription(): string {
    return 'Convenience tool for storing architectural decisions. Decisions are stored with high importance (9) by default.';
  }

  getInputSchema(): object {
    return {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Decision description' },
        scope: { type: 'string', enum: Object.values(MemoryScope), description: 'Decision scope' },
        project: { type: 'string', description: 'Project identifier (for project scope)' },
        tags: { type: 'object', description: 'Optional tags' },
        metadata: { type: 'object', description: 'Optional metadata' },
      },
      required: ['content', 'scope'],
    };
  }

  async execute(user: User, args: any): Promise<any> {
    const memory = await this.memoriesService.create(user.id, {
      content: args.content,
      type: MemoryType.DECISION,
      scope: args.scope,
      importance: 9,
      tags: args.tags,
      metadata: args.metadata,
      source: 'remember_decision',
    });
    return { id: memory.id, content: memory.content, type: memory.type, scope: memory.scope };
  }
}
