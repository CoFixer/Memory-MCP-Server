import { Injectable } from '@nestjs/common';
import { User } from '../../database/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { McpTool } from './mcp-tool.interface';
import { GetContextTool } from './tools/get-context.tool';
import { AddMemoryTool } from './tools/add-memory.tool';
import { SearchMemoryTool } from './tools/search-memory.tool';
import { EditMemoryTool } from './tools/edit-memory.tool';
import { DeleteMemoryTool } from './tools/delete-memory.tool';
import { ListMemoriesTool } from './tools/list-memories.tool';
import { GetMemoryTool } from './tools/get-memory.tool';
import { GetRulesTool } from './tools/get-rules.tool';
import { RememberDecisionTool } from './tools/remember-decision.tool';

@Injectable()
export class McpService {
  private readonly tools: Map<string, McpTool>;

  constructor(
    private readonly authService: AuthService,
    private readonly getContextTool: GetContextTool,
    private readonly addMemoryTool: AddMemoryTool,
    private readonly searchMemoryTool: SearchMemoryTool,
    private readonly editMemoryTool: EditMemoryTool,
    private readonly deleteMemoryTool: DeleteMemoryTool,
    private readonly listMemoriesTool: ListMemoriesTool,
    private readonly getMemoryTool: GetMemoryTool,
    private readonly getRulesTool: GetRulesTool,
    private readonly rememberDecisionTool: RememberDecisionTool,
  ) {
    this.tools = new Map<string, McpTool>();
    this.tools.set('get_context', this.getContextTool);
    this.tools.set('add_memory', this.addMemoryTool);
    this.tools.set('search_memories', this.searchMemoryTool);
    this.tools.set('edit_memory', this.editMemoryTool);
    this.tools.set('delete_memory', this.deleteMemoryTool);
    this.tools.set('list_memories', this.listMemoriesTool);
    this.tools.set('get_memory', this.getMemoryTool);
    this.tools.set('get_rules', this.getRulesTool);
    this.tools.set('remember_decision', this.rememberDecisionTool);
  }

  async validateApiKey(key: string): Promise<{ user: User } | null> {
    const result = await this.authService.validateApiKey(key);
    return result ? { user: result.user } : null;
  }

  async handleRequest(body: any, user: User): Promise<any> {
    if (body.method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id: body.id,
        result: {
          tools: Array.from(this.tools.entries()).map(([name, tool]) => ({
            name,
            description: tool.getDescription(),
            inputSchema: tool.getInputSchema(),
          })),
        },
      };
    }

    if (body.method === 'tools/call') {
      const toolName = body.params?.name;
      const args = body.params?.arguments || {};
      const tool = this.tools.get(toolName);

      if (!tool) {
        return {
          jsonrpc: '2.0',
          id: body.id,
          error: { code: -32601, message: `Tool not found: ${toolName}` },
        };
      }

      try {
        const result = await tool.execute(user, args);
        return {
          jsonrpc: '2.0',
          id: body.id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          },
        };
      } catch (error) {
        return {
          jsonrpc: '2.0',
          id: body.id,
          error: { code: -32603, message: error instanceof Error ? error.message : 'Internal error' },
        };
      }
    }

    return {
      jsonrpc: '2.0',
      id: body.id,
      error: { code: -32600, message: 'Invalid Request' },
    };
  }
}
