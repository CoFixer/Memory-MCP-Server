import { Injectable } from '@nestjs/common';
import { MemoriesService } from '../../memories/memories.service';
import { User } from '../../../database/entities/user.entity';
import { McpTool } from '../mcp-tool.interface';

@Injectable()
export class EditMemoryTool implements McpTool {
  constructor(private readonly memoriesService: MemoriesService) {}

  getDescription(): string {
    return 'Edit an existing memory by ID. Changing content will regenerate the embedding. A version history entry is created.';
  }

  getInputSchema(): object {
    return {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Memory ID' },
        content: { type: 'string', description: 'New content' },
        type: { type: 'string', description: 'New type' },
        importance: { type: 'number', minimum: 1, maximum: 10, description: 'New importance' },
        tags: { type: 'object', description: 'New tags' },
        metadata: { type: 'object', description: 'New metadata' },
      },
      required: ['id'],
    };
  }

  async execute(user: User, args: any): Promise<any> {
    const memory = await this.memoriesService.update(user.id, args.id, {
      content: args.content,
      type: args.type,
      importance: args.importance,
      tags: args.tags,
      metadata: args.metadata,
    });
    return { id: memory.id, content: memory.content, updated_at: memory.updated_at };
  }
}
