import { IsString, IsOptional, IsUUID, IsObject, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Project slug' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Workspace ID' })
  @IsOptional()
  @IsUUID()
  workspace_id?: string;

  @ApiPropertyOptional({ description: 'Git remote URL' })
  @IsOptional()
  @IsString()
  git_remote?: string;

  @ApiPropertyOptional({ description: 'Repository URL' })
  @IsOptional()
  @IsString()
  repository_url?: string;

  @ApiPropertyOptional({ description: 'Short description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Project summary for PRD generation' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'Product type (e.g. web-app, mobile-app, api-service)' })
  @IsOptional()
  @IsString()
  product_type?: string;

  @ApiPropertyOptional({ description: 'Target users description' })
  @IsOptional()
  @IsString()
  target_users?: string;

  @ApiPropertyOptional({ description: 'Business goals' })
  @IsOptional()
  @IsString()
  business_goals?: string;

  @ApiPropertyOptional({ description: 'Preferred technology stack' })
  @IsOptional()
  @IsString()
  preferred_stack?: string;

  @ApiPropertyOptional({ description: 'Deployment target' })
  @IsOptional()
  @IsString()
  deployment_target?: string;

  @ApiPropertyOptional({ description: 'Known modules (comma-separated or JSON)' })
  @IsOptional()
  @IsString()
  known_modules?: string;

  @ApiPropertyOptional({ description: 'Known integrations' })
  @IsOptional()
  @IsString()
  known_integrations?: string;

  @ApiPropertyOptional({ description: 'Constraints and limitations' })
  @IsOptional()
  @IsString()
  constraints?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  additional_notes?: string;

  @ApiPropertyOptional({ description: 'PRD markdown content to store as project memory' })
  @IsOptional()
  @IsString()
  prd_content?: string;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
