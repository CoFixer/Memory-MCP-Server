import { IsString, IsOptional, IsEnum, IsNumber, IsObject, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemoryScope, MemoryType } from '../../../database/entities/memory.entity';

export class CreateMemoryDto {
  @ApiProperty({ description: 'Memory content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Memory title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ enum: MemoryType, description: 'Memory type' })
  @IsEnum(MemoryType)
  type: MemoryType;

  @ApiProperty({ enum: MemoryScope, description: 'Memory scope' })
  @IsEnum(MemoryScope)
  scope: MemoryScope;

  @ApiPropertyOptional({ description: 'Project ID for project scope' })
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @ApiPropertyOptional({ description: 'Workspace ID for workspace scope' })
  @IsOptional()
  @IsUUID()
  workspace_id?: string;

  @ApiPropertyOptional({ description: 'Importance 1-10', minimum: 1, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  importance?: number;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsOptional()
  @IsObject()
  tags?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Source' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Source client' })
  @IsOptional()
  @IsString()
  source_client?: string;
}
