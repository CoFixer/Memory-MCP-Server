import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { ApiKeyAuthGuard } from '../../common/guards/api-key-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(ApiKeyAuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  @ApiOperation({ summary: 'List API keys' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  async findAll(@CurrentUser() user: User) {
    return this.apiKeysService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create API key' })
  @ApiResponse({ status: 201, description: 'API key created' })
  async create(@CurrentUser() user: User, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.create(user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke API key' })
  @ApiResponse({ status: 200, description: 'API key revoked' })
  async revoke(@CurrentUser() user: User, @Param('id') id: string) {
    return this.apiKeysService.revoke(user.id, id);
  }
}
