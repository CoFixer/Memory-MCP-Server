import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MemoriesService } from './memories.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { ListMemoriesQueryDto } from './dto/list-memories-query.dto';
import { SearchMemoriesDto } from './dto/search-memories.dto';
import { ApiKeyAuthGuard } from '../../common/guards/api-key-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Memories')
@ApiBearerAuth()
@UseGuards(ApiKeyAuthGuard)
@Controller('memories')
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create memory' })
  @ApiResponse({ status: 201, description: 'Memory created' })
  async create(@CurrentUser() user: User, @Body() dto: CreateMemoryDto) {
    return this.memoriesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List memories' })
  @ApiResponse({ status: 200, description: 'List of memories' })
  async findAll(@CurrentUser() user: User, @Query() query: ListMemoriesQueryDto) {
    return this.memoriesService.findAll(user.id, query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search memories' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@CurrentUser() user: User, @Query() dto: SearchMemoriesDto) {
    return this.memoriesService.search(user.id, dto);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get rules' })
  @ApiResponse({ status: 200, description: 'Rules and conventions' })
  async getRules(@CurrentUser() user: User, @Query('project') project?: string) {
    return this.memoriesService.getRules(user.id, project);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get memory' })
  @ApiResponse({ status: 200, description: 'Memory details' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.memoriesService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update memory' })
  @ApiResponse({ status: 200, description: 'Memory updated' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateMemoryDto,
  ) {
    return this.memoriesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete memory' })
  @ApiResponse({ status: 200, description: 'Memory deleted' })
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.memoriesService.remove(user.id, id);
  }
}
