import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingService } from './embedding.service';
import { EmbeddingConfigService } from './embedding-config.service';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { EmbeddingProviderConfig } from '../../database/entities/embedding-provider-config.entity';
import { CacheModule } from '../cache/cache.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([EmbeddingProviderConfig]),
    CacheModule,
    AuditModule,
  ],
  providers: [EmbeddingService, EmbeddingConfigService, OllamaProvider, OpenAIProvider, OpenRouterProvider],
  exports: [EmbeddingService, EmbeddingConfigService],
})
export class EmbeddingsModule {}
