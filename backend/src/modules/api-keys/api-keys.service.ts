import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../../database/entities/api-key.entity';
import { User } from '../../database/entities/user.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(userId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { user_id: userId, revoked_at: null },
      select: ['id', 'name', 'prefix', 'permissions', 'last_used_at', 'expires_at', 'created_at'],
    });
  }

  async create(userId: string, dto: CreateApiKeyDto): Promise<{ apiKey: ApiKey; key: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const key = 'mem_live_' + crypto.randomBytes(32).toString('hex');
    const prefix = key.substring(0, 8);
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    const apiKey = this.apiKeyRepository.create({
      user_id: userId,
      name: dto.name,
      key_hash: keyHash,
      prefix,
      permissions: dto.permissions || ['memory:read', 'memory:write'],
    });

    const saved = await this.apiKeyRepository.save(apiKey);
    return { apiKey: saved, key };
  }

  async revoke(userId: string, id: string): Promise<void> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, user_id: userId },
    });
    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }
    apiKey.revoked_at = new Date();
    await this.apiKeyRepository.save(apiKey);
  }

  async validateKey(key: string): Promise<{ user: User; apiKey: ApiKey } | null> {
    const prefix = key.substring(0, 8);
    const apiKeys = await this.apiKeyRepository.find({
      where: { prefix },
      relations: ['user'],
    });

    for (const apiKey of apiKeys) {
      const hash = crypto.createHash('sha256').update(key).digest('hex');
      if (apiKey.key_hash === hash && !apiKey.revoked_at) {
        if (apiKey.expires_at && new Date() > apiKey.expires_at) {
          continue;
        }
        apiKey.last_used_at = new Date();
        await this.apiKeyRepository.save(apiKey);
        return { user: apiKey.user, apiKey };
      }
    }
    return null;
  }
}
