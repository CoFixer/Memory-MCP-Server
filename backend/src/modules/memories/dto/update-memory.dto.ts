import { IsString, IsOptional, IsEnum, IsNumber, IsObject, Min, Max, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MemoryType } from '../../../database/entities/memory.entity';

export class UpdateMemoryDto {
  @ApiPropertyOptional({ description: 'Memory content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Memory title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: MemoryType, description: 'Memory type' })
  @IsOptional()
  @IsEnum(MemoryType)
  type?: MemoryType;

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
}
