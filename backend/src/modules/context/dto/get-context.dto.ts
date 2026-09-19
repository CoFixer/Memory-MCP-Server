import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetContextDto {
  @ApiProperty({ description: 'Context query' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Project identifier (e.g. github.com/company/project)' })
  @IsOptional()
  @IsString()
  project?: string;

  @ApiPropertyOptional({ description: 'Max tokens for context', default: 4000 })
  @IsOptional()
  @IsNumber()
  max_tokens?: number;
}
