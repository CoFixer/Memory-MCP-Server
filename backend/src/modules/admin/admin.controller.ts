import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { EmbeddingConfigService } from '../embeddings/embedding-config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { EmbeddingProviderType } from '../../database/entities/embedding-provider-config.entity';

class CreateUserDto {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

class UpdateUserDto {
  name?: string;
  role?: UserRole;
  password?: string;
}

class CreateEmbeddingProviderDto {
  name: string;
  provider: EmbeddingProviderType;
  model: string;
  base_url?: string;
  api_key?: string;
  dimensions: number;
  is_active?: boolean;
  is_default?: boolean;
}

class UpdateEmbeddingProviderDto {
  name?: string;
  provider?: EmbeddingProviderType;
  model?: string;
  base_url?: string | null;
  api_key?: string | null;
  dimensions?: number;
  is_active?: boolean;
  is_default?: boolean;
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly embeddingConfigService: EmbeddingConfigService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats' })
  @ApiResponse({ status: 200, description: 'Stats data' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getUsers() {
    return this.adminService.findAllUsers();
  }

  @Post('users')
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('memories')
  @ApiOperation({ summary: 'List all memories (admin)' })
  @ApiResponse({ status: 200, description: 'List of memories' })
  async getMemories(
    @Query('session_id') session_id?: string,
    @Query('project_id') project_id?: string,
    @Query('user_id') user_id?: string,
    @Query('scope') scope?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.adminService.findAllMemories({
      session_id,
      project_id,
      user_id,
      scope,
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('projects')
  @ApiOperation({ summary: 'List all projects' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async getProjects() {
    return this.adminService.findAllProjects();
  }

  @Get('api-keys')
  @ApiOperation({ summary: 'List all API keys' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  async getApiKeys() {
    return this.adminService.findAllApiKeys();
  }

  @Get('workspaces')
  @ApiOperation({ summary: 'List all workspaces' })
  @ApiResponse({ status: 200, description: 'List of workspaces' })
  async getWorkspaces() {
    return this.adminService.findAllWorkspaces();
  }

  // Embedding Provider Management (Admin Only)
  @Get('embedding-providers')
  @ApiOperation({ summary: 'List all embedding providers' })
  @ApiResponse({ status: 200, description: 'List of embedding providers' })
  async getEmbeddingProviders() {
    const providers = await this.embeddingConfigService.findAll();
    return providers.map((p) => ({
      ...p,
      api_key_encrypted: p.api_key_encrypted ? '***encrypted***' : null,
    }));
  }

  @Post('embedding-providers')
  @ApiOperation({ summary: 'Create embedding provider' })
  @ApiResponse({ status: 201, description: 'Provider created' })
  async createEmbeddingProvider(@Body() dto: CreateEmbeddingProviderDto) {
    return this.embeddingConfigService.create(dto);
  }

  @Patch('embedding-providers/:id')
  @ApiOperation({ summary: 'Update embedding provider' })
  @ApiResponse({ status: 200, description: 'Provider updated' })
  async updateEmbeddingProvider(@Param('id') id: string, @Body() dto: UpdateEmbeddingProviderDto) {
    return this.embeddingConfigService.update(id, dto);
  }

  @Delete('embedding-providers/:id')
  @ApiOperation({ summary: 'Delete embedding provider' })
  @ApiResponse({ status: 200, description: 'Provider deleted' })
  async deleteEmbeddingProvider(@Param('id') id: string) {
    return this.embeddingConfigService.delete(id);
  }

  @Post('embedding-providers/:id/set-default')
  @ApiOperation({ summary: 'Set default embedding provider' })
  @ApiResponse({ status: 200, description: 'Default provider set' })
  async setDefaultEmbeddingProvider(@Param('id') id: string) {
    return this.embeddingConfigService.setDefault(id);
  }

  @Post('embedding-providers/:id/test')
  @ApiOperation({ summary: 'Test embedding provider connection' })
  @ApiResponse({ status: 200, description: 'Test result' })
  async testEmbeddingProvider(@Param('id') id: string) {
    return this.embeddingConfigService.testConnection(id);
  }
}
