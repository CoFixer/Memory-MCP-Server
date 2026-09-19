import { Injectable } from '@nestjs/common';
import { MemoriesService } from '../../memories/memories.service';
import { User } from '../../../database/entities/user.entity';
import { McpTool } from '../mcp-tool.interface';

@Injectable()
export class DeleteMemoryTool implements McpTool {
  constructor(private readonly memoriesService: MemoriesService) {}

  getDescription(): string {
    return 'Soft-delete a memory by ID. The memory is marked as deleted but remains in the database for history.';
  }

  getInputSchema(): object {
    return {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Memory ID to delete' },
      },
      required: ['id'],
    };
  }

  async execute(user: User, args: any): Promise<any> {
    await this.memoriesService.remove(user.id, args.id);
    return { deleted: true, id: args.id };
  }
}
