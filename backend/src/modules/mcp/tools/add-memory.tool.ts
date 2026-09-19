import { Injectable } from '@nestjs/common';
import { MemoriesService } from '../../memories/memories.service';
import { User } from '../../../database/entities/user.entity';
import { MemoryType, MemoryScope } from '../../../database/entities/memory.entity';
import { McpTool } from '../mcp-tool.interface';

@Injectable()
export class AddMemoryTool implements McpTool {
  constructor(private readonly memoriesService: MemoriesService) {}

  getDescription(): string {
    return 'Add a new memory to the system. The server will generate an embedding and store the memory.';
  }

  getInputSchema(): object {
    return {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'The memory content' },
        type: { type: 'string', enum: Object.values(MemoryType), description: 'Memory type' },
        scope: { type: 'string', enum: Object.values(MemoryScope), description: 'Memory scope' },
        project: { type: 'string', description: 'Project identifier (for project scope)' },
        importance: { type: 'number', minimum: 1, maximum: 10, description: 'Importance 1-10', default: 5 },
        tags: { type: 'object', description: 'Optional tags' },
        metadata: { type: 'object', description: 'Optional metadata' },
        source: { type: 'string', description: 'Source of the memory' },
      },
      required: ['content', 'type', 'scope'],
    };
  }

  async execute(user: User, args: any): Promise<any> {
    const memory = await this.memoriesService.create(user.id, {
      content: args.content,
      type: args.type,
      scope: args.scope,
      importance: args.importance,
      tags: args.tags,
      metadata: args.metadata,
      source: args.source,
      title: args.title,
    });
    return { id: memory.id, content: memory.content, type: memory.type, scope: memory.scope };
  }
}
