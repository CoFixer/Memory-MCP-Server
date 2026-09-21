import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PrdService } from './prd.service';
import { CombinedAuthGuard } from '../auth/combined-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('PRD')
@ApiBearerAuth()
@UseGuards(CombinedAuthGuard)
@Controller('projects/:projectId/prd')
export class PrdController {
  constructor(private readonly prdService: PrdService) {}

  @Get()
  @ApiOperation({ summary: 'List PRD versions for a project' })
  @ApiResponse({ status: 200, description: 'List of PRD versions' })
  async listVersions(@Param('projectId') projectId: string) {
    return this.prdService.getPrdVersions(projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Upload/create a PRD version' })
  @ApiResponse({ status: 201, description: 'PRD document created' })
  async createVersion(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: {
      version: string;
      title: string;
      content: string;
      generation_source?: string;
      generator_provider?: string;
      generator_model?: string;
    },
  ) {
    return this.prdService.createPrdDocument(user.id, projectId, dto);
  }

  @Post(':prdId/activate')
  @ApiOperation({ summary: 'Activate a PRD version' })
  @ApiResponse({ status: 200, description: 'PRD version activated' })
  async activateVersion(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Param('prdId') prdId: string,
  ) {
    return this.prdService.activatePrdVersion(user.id, projectId, prdId);
  }

  @Get('requirements/:requirementId')
  @ApiOperation({ summary: 'Get a requirement by ID' })
  @ApiResponse({ status: 200, description: 'Requirement chunk' })
  async getRequirement(
    @Param('projectId') projectId: string,
    @Param('requirementId') requirementId: string,
  ) {
    return this.prdService.getRequirementById(projectId, requirementId);
  }
}
