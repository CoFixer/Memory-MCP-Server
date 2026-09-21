import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoriesService } from './memories.service';
import { MemoriesController } from './memories.controller';
import { Memory } from '../../database/entities/memory.entity';
import { MemoryVersion } from '../../database/entities/memory-version.entity';
import { Project } from '../../database/entities/project.entity';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { SearchModule } from '../search/search.module';
import { CacheModule } from '../cache/cache.module';
import { AuditModule } from '../audit/audit.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Memory, MemoryVersion, Project]),
    EmbeddingsModule,
    SearchModule,
    CacheModule,
    AuditModule,
    ApiKeysModule,
  ],
  controllers: [MemoriesController],
  providers: [MemoriesService],
  exports: [MemoriesService],
})
export class MemoriesModule {}
