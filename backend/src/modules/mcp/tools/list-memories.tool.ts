import { Injectable } from '@nestjs/common';
import { MemoriesService } from '../../memories/memories.service';
import { User } from '../../../database/entities/user.entity';
import { McpTool } from '../mcp-tool.interface';

@Injectable()
export class ListMemoriesTool implements McpTool {
  constructor(private readonly memoriesService: MemoriesService) {}

  getDescription(): string {
    return 'List memories with optional filters for project, workspace, scope, type, and pagination.';
  }

  getInputSchema(): object {
    return {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: 'Filter by project ID' },
        workspace_id: { type: 'string', description: 'Filter by workspace ID' },
        scope: { type: 'string', enum: ['global', 'workspace', 'project'], description: 'Filter by scope' },
        type: { type: 'string', description: 'Filter by type' },
        limit: { type: 'number', description: 'Limit', default: 20 },
        offset: { type: 'number', description: 'Offset', default: 0 },
      },
    };
  }

  async execute(user: User, args: any): Promise<any> {
    return this.memoriesService.findAll(user.id, {
      project_id: args.project_id,
      workspace_id: args.workspace_id,
      scope: args.scope,
      type: args.type,
      limit: args.limit || 20,
      offset: args.offset || 0,
    });
  }
}
