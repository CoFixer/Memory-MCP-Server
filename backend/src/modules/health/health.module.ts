import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { Memory } from '../../database/entities/memory.entity';
import { CacheModule } from '../cache/cache.module';
import { EmbeddingsModule } from '../embeddings/embeddings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Memory]), CacheModule, EmbeddingsModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
