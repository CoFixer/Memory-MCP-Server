import { Injectable } from '@nestjs/common';
import { MemoriesService } from '../../memories/memories.service';
import { User } from '../../../database/entities/user.entity';
import { McpTool } from '../mcp-tool.interface';

@Injectable()
export class GetRulesTool implements McpTool {
  constructor(private readonly memoriesService: MemoriesService) {}

  getDescription(): string {
    return 'Optimized retrieval for rules, conventions, architecture, and preferences. Returns the most important rules for the current project or globally.';
  }

  getInputSchema(): object {
    return {
      type: 'object',
      properties: {
        project: { type: 'string', description: 'Project identifier' },
      },
    };
  }

  async execute(user: User, args: any): Promise<any> {
    const rules = await this.memoriesService.getRules(user.id, args.project);
    return { rules };
  }
}
