import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly redis: Redis;
  private readonly defaultTtl: number;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
    this.defaultTtl = parseInt(this.configService.get<string>('CACHE_TTL', '300'), 10);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const seconds = ttl ?? this.defaultTtl;
    await this.redis.setex(key, seconds, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async increment(key: string, ttl?: number): Promise<number> {
    const value = await this.redis.incr(key);
    if (value === 1) {
      await this.redis.expire(key, ttl ?? this.defaultTtl);
    }
    return value;
  }

  async getClient(): Promise<Redis> {
    return this.redis;
  }
}
