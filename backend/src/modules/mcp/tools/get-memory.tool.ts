import { Injectable } from '@nestjs/common';
import { MemoriesService } from '../../memories/memories.service';
import { User } from '../../../database/entities/user.entity';
import { McpTool } from '../mcp-tool.interface';

@Injectable()
export class GetMemoryTool implements McpTool {
  constructor(private readonly memoriesService: MemoriesService) {}

  getDescription(): string {
    return 'Retrieve a single memory by ID.';
  }

  getInputSchema(): object {
    return {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Memory ID' },
      },
      required: ['id'],
    };
  }

  async execute(user: User, args: any): Promise<any> {
    const memory = await this.memoriesService.findOne(user.id, args.id);
    return memory;
  }
}
