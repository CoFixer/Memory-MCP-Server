import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { ApiKeyAuthGuard } from '../../common/guards/api-key-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(ApiKeyAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: 'List workspaces' })
  @ApiResponse({ status: 200, description: 'List of workspaces' })
  async findAll(@CurrentUser() user: User) {
    return this.workspacesService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create workspace' })
  @ApiResponse({ status: 201, description: 'Workspace created' })
  async create(@CurrentUser() user: User, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace' })
  @ApiResponse({ status: 200, description: 'Workspace details' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.workspacesService.findOne(user.id, id);
  }
}
