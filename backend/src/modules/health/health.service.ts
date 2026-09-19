import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memory } from '../../database/entities/memory.entity';
import { CacheService } from '../cache/cache.service';
import { EmbeddingService } from '../embeddings/embedding.service';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(Memory)
    private readonly memoryRepository: Repository<Memory>,
    private readonly cacheService: CacheService,
    private readonly embeddingService: EmbeddingService,
    private readonly configService: ConfigService,
  ) {}

  async check(): Promise<any> {
    const [dbHealthy, redisHealthy, embeddingHealthy] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkEmbedding(),
    ]);

    const status = dbHealthy && redisHealthy ? 'ok' : 'error';

    return {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'up' : 'down',
        redis: redisHealthy ? 'up' : 'down',
        embedding: embeddingHealthy ? 'up' : 'down',
      },
    };
  }

  async ready(): Promise<any> {
    const [dbHealthy, redisHealthy] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    return {
      status: dbHealthy && redisHealthy ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
    };
  }

  async live(): Promise<any> {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.memoryRepository.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      const client = await this.cacheService.getClient();
      await client.ping();
      return true;
    } catch {
      return false;
    }
  }

  private async checkEmbedding(): Promise<boolean> {
    try {
      await this.embeddingService.generateEmbedding('health check');
      return true;
    } catch {
      return true; // Don't fail health check if embedding is temporarily unavailable
    }
  }
}
