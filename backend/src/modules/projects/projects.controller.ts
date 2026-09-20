import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { MemoriesService } from '../memories/memories.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CombinedAuthGuard } from '../auth/combined-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { MemoryScope, MemoryType } from '../../database/entities/memory.entity';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(CombinedAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly memoriesService: MemoriesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List projects' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async findAll(@CurrentUser() user: User) {
    return this.projectsService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create project' })
  @ApiResponse({ status: 201, description: 'Project created' })
  async create(@CurrentUser() user: User, @Body() dto: CreateProjectDto) {
    const { prd_content, ...projectDto } = dto;
    const project = await this.projectsService.create(user.id, projectDto);

    if (prd_content?.trim()) {
      await this.memoriesService.create(user.id, {
        content: prd_content.trim(),
        title: `PRD: ${project.name}`,
        type: MemoryType.RULE,
        scope: MemoryScope.PROJECT,
        project_id: project.id,
        importance: 10,
        source: 'prd-upload',
      });
    }

    return project;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project' })
  @ApiResponse({ status: 200, description: 'Project details' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.projectsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(user.id, id, dto);
  }
}
