import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
