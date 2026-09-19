import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { GetContextTool } from './tools/get-context.tool';
import { AddMemoryTool } from './tools/add-memory.tool';
import { SearchMemoryTool } from './tools/search-memory.tool';
import { EditMemoryTool } from './tools/edit-memory.tool';
import { DeleteMemoryTool } from './tools/delete-memory.tool';
import { ListMemoriesTool } from './tools/list-memories.tool';
import { GetMemoryTool } from './tools/get-memory.tool';
import { GetRulesTool } from './tools/get-rules.tool';
import { RememberDecisionTool } from './tools/remember-decision.tool';
import { ContextModule } from '../context/context.module';
import { MemoriesModule } from '../memories/memories.module';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ContextModule, MemoriesModule, AuthModule, ProjectsModule],
  controllers: [McpController],
  providers: [
    McpService,
    GetContextTool,
    AddMemoryTool,
    SearchMemoryTool,
    EditMemoryTool,
    DeleteMemoryTool,
    ListMemoriesTool,
    GetMemoryTool,
    GetRulesTool,
    RememberDecisionTool,
  ],
})
export class McpModule {}
