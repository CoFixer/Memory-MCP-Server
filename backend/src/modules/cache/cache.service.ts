import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly redis: Redis;
  private readonly defaultTtl: number;
  private readonly prefix: string;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
    this.defaultTtl = parseInt(this.configService.get<string>('CACHE_TTL', '300'), 10);
    this.prefix = this.configService.get<string>('REDIS_PREFIX', '');
  }

  private buildKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(this.buildKey(key));
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const seconds = ttl ?? this.defaultTtl;
    await this.redis.setex(this.buildKey(key), seconds, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(this.buildKey(key));
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(this.buildKey(pattern));
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async increment(key: string, ttl?: number): Promise<number> {
    const value = await this.redis.incr(this.buildKey(key));
    if (value === 1) {
      await this.redis.expire(this.buildKey(key), ttl ?? this.defaultTtl);
    }
    return value;
  }

  async getClient(): Promise<Redis> {
    return this.redis;
  }
}
