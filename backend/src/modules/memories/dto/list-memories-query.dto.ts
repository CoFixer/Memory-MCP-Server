import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MemoryScope, MemoryType } from '../../../database/entities/memory.entity';

export class ListMemoriesQueryDto {
  @ApiPropertyOptional({ description: 'Project ID filter' })
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @ApiPropertyOptional({ description: 'Workspace ID filter' })
  @IsOptional()
  @IsUUID()
  workspace_id?: string;

  @ApiPropertyOptional({ enum: MemoryScope, description: 'Scope filter' })
  @IsOptional()
  @IsEnum(MemoryScope)
  scope?: MemoryScope;

  @ApiPropertyOptional({ enum: MemoryType, description: 'Type filter' })
  @IsOptional()
  @IsEnum(MemoryType)
  type?: MemoryType;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Limit', default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset', default: 0 })
  @IsOptional()
  @IsNumber()
  offset?: number;
}
