import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../../database/entities/user.entity';
import { Memory } from '../../database/entities/memory.entity';
import { Project } from '../../database/entities/project.entity';
import { ApiKey } from '../../database/entities/api-key.entity';
import { Workspace } from '../../database/entities/workspace.entity';
import { EmbeddingProviderConfig } from '../../database/entities/embedding-provider-config.entity';
import { EmbeddingConfigService } from '../embeddings/embedding-config.service';
import { OllamaProvider } from '../embeddings/providers/ollama.provider';
import { OpenAIProvider } from '../embeddings/providers/openai.provider';
import { OpenRouterProvider } from '../embeddings/providers/openrouter.provider';
import { CacheModule } from '../cache/cache.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Memory, Project, ApiKey, Workspace, EmbeddingProviderConfig]),
    CacheModule,
    AuditModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, EmbeddingConfigService, OllamaProvider, OpenAIProvider, OpenRouterProvider],
})
export class AdminModule {}
