import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsNumber, IsBoolean, MinLength, IsUUID } from 'class-validator';
import { AdminService } from './admin.service';
import { EmbeddingConfigService } from '../embeddings/embedding-config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { EmbeddingProviderType } from '../../database/entities/embedding-provider-config.entity';

class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

class CreateEmbeddingProviderDto {
  @IsString()
  name: string;

  @IsEnum(EmbeddingProviderType)
  provider: EmbeddingProviderType;

  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  base_url?: string;

  @IsOptional()
  @IsString()
  api_key?: string;

  @IsNumber()
  dimensions: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

class UpdateEmbeddingProviderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(EmbeddingProviderType)
  provider?: EmbeddingProviderType;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  base_url?: string | null;

  @IsOptional()
  @IsString()
  api_key?: string | null;

  @IsOptional()
  @IsNumber()
  dimensions?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

class AdminCreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsUUID()
  workspace_id?: string;

  @IsOptional()
  @IsString()
  git_remote?: string;

  @IsOptional()
  @IsString()
  repository_url?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  prd_content?: string;
}

class AdminCreateApiKeyDto {
  @IsString()
  name: string;

  @IsUUID()
  user_id: string;

  @IsOptional()
  permissions?: string[];
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
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getUsers() {
    return this.adminService.findAllUsers();
  }

  @Post('users')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @Roles(UserRole.ADMIN)
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
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.adminService.findAllMemories({
      session_id,
      project_id,
      user_id,
      scope,
      type,
      limit,
      offset,
    });
  }

  @Get('projects')
  @ApiOperation({ summary: 'List all projects' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async getProjects() {
    return this.adminService.findAllProjects();
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project details' })
  async getProject(@Param('id') id: string) {
    return this.adminService.findProjectById(id);
  }

  @Post('projects')
  @ApiOperation({ summary: 'Create project (admin)' })
  @ApiResponse({ status: 201, description: 'Project created' })
  async createProject(@Body() dto: AdminCreateProjectDto) {
    return this.adminService.createProject(dto);
  }

  @Get('api-keys')
  @ApiOperation({ summary: 'List all API keys' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  async getApiKeys() {
    return this.adminService.findAllApiKeys();
  }

  @Post('api-keys')
  @ApiOperation({ summary: 'Create API key for any user (admin)' })
  @ApiResponse({ status: 201, description: 'API key created' })
  async createApiKey(@Body() dto: AdminCreateApiKeyDto) {
    return this.adminService.createApiKey(dto);
  }

  @Delete('api-keys/:id')
  @ApiOperation({ summary: 'Revoke API key (admin)' })
  @ApiResponse({ status: 200, description: 'API key revoked' })
  async revokeApiKey(@Param('id') id: string) {
    return this.adminService.revokeApiKey(id);
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
