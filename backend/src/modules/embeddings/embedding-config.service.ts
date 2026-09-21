import { Injectable, OnModuleInit, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  EmbeddingProviderConfig,
  EmbeddingProviderType,
} from '../../database/entities/embedding-provider-config.entity';
import { CacheService } from '../cache/cache.service';
import { AuditService } from '../audit/audit.service';
import { encrypt, decrypt } from '../../common/utils/encryption.util';
import { OllamaProvider, OllamaProviderConfig } from './providers/ollama.provider';
import { OpenAIProvider, OpenAIProviderConfig } from './providers/openai.provider';
import { OpenRouterProvider, OpenRouterProviderConfig } from './providers/openrouter.provider';
import { EmbeddingProvider } from './embedding-provider.interface';

const CACHE_KEY = 'embedding:active-config';
const CACHE_TTL = 60; // 60 seconds

export interface ResolvedEmbeddingConfig {
  id: string;
  name: string;
  provider: EmbeddingProviderType;
  model: string;
  baseUrl: string | null;
  apiKey: string | null;
  dimensions: number;
}

@Injectable()
export class EmbeddingConfigService implements OnModuleInit {
  private encryptionSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly auditService: AuditService,
    @InjectRepository(EmbeddingProviderConfig)
    private readonly configRepository: Repository<EmbeddingProviderConfig>,
    private readonly ollamaProvider: OllamaProvider,
    private readonly openAIProvider: OpenAIProvider,
    private readonly openRouterProvider: OpenRouterProvider,
  ) {
    this.encryptionSecret = this.configService.get<string>('API_KEY_SECRET', '');
    if (!this.encryptionSecret || this.encryptionSecret.length < 32) {
      throw new ServiceUnavailableException('API_KEY_SECRET must be at least 32 characters for encryption');
    }
  }

  async onModuleInit(): Promise<void> {
    const count = await this.configRepository.count();
    if (count === 0) {
      await this.seedDefaultConfig();
    }
  }

  private async seedDefaultConfig(): Promise<void> {
    // Hardcoded bootstrap defaults — admins change via dashboard
    const provider = EmbeddingProviderType.OLLAMA;
    const model = 'nomic-embed-text';
    const baseUrl = 'http://localhost:11434';
    const dimensions = 768;

    const config = this.configRepository.create({
      name: 'Default',
      provider,
      model,
      base_url: baseUrl || null,
      api_key_encrypted: null,
      dimensions,
      is_active: true,
      is_default: true,
    });

    await this.configRepository.save(config);
  }

  private encryptKey(key: string | null): string | null {
    if (!key) return null;
    return encrypt(key, this.encryptionSecret);
  }

  private decryptKey(encrypted: string | null): string | null {
    if (!encrypted) return null;
    return decrypt(encrypted, this.encryptionSecret);
  }

  async getActiveConfig(): Promise<ResolvedEmbeddingConfig | null> {
    const cached = await this.cacheService.get<ResolvedEmbeddingConfig>(CACHE_KEY);
    if (cached) return cached;

    const dbConfig = await this.configRepository.findOne({
      where: { is_active: true, is_default: true },
    });

    if (!dbConfig) {
      return null;
    }

    const resolved: ResolvedEmbeddingConfig = {
      id: dbConfig.id,
      name: dbConfig.name,
      provider: dbConfig.provider,
      model: dbConfig.model,
      baseUrl: dbConfig.base_url,
      apiKey: this.decryptKey(dbConfig.api_key_encrypted),
      dimensions: dbConfig.dimensions,
    };

    await this.cacheService.set(CACHE_KEY, resolved, CACHE_TTL);
    return resolved;
  }

  async configureProvider(config: ResolvedEmbeddingConfig): Promise<EmbeddingProvider> {
    switch (config.provider) {
      case EmbeddingProviderType.OLLAMA:
        this.ollamaProvider.setConfig({
          baseUrl: config.baseUrl || 'http://localhost:11434',
          model: config.model,
          dimensions: config.dimensions,
        } as OllamaProviderConfig);
        return this.ollamaProvider;
      case EmbeddingProviderType.OPENAI:
        if (!config.apiKey) {
          throw new BadRequestException('OpenAI provider requires an API key');
        }
        this.openAIProvider.setConfig({
          apiKey: config.apiKey,
          model: config.model,
          dimensions: config.dimensions,
        } as OpenAIProviderConfig);
        return this.openAIProvider;
      case EmbeddingProviderType.OPENROUTER:
        if (!config.apiKey) {
          throw new BadRequestException('OpenRouter provider requires an API key');
        }
        this.openRouterProvider.setConfig({
          apiKey: config.apiKey,
          model: config.model,
          dimensions: config.dimensions,
          baseUrl: config.baseUrl || undefined,
        } as OpenRouterProviderConfig);
        return this.openRouterProvider;
      default:
        throw new BadRequestException(`Unknown embedding provider: ${config.provider}`);
    }
  }

  async invalidateCache(): Promise<void> {
    await this.cacheService.del(CACHE_KEY);
  }

  // Admin CRUD methods
  async findAll(): Promise<EmbeddingProviderConfig[]> {
    return this.configRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string): Promise<EmbeddingProviderConfig | null> {
    return this.configRepository.findOne({ where: { id } });
  }

  async create(data: {
    name: string;
    provider: EmbeddingProviderType;
    model: string;
    base_url?: string | null;
    api_key?: string | null;
    dimensions: number;
    is_active?: boolean;
    is_default?: boolean;
  }): Promise<EmbeddingProviderConfig> {
    if (data.is_default) {
      await this.configRepository.update({}, { is_default: false });
    }

    const config = this.configRepository.create({
      name: data.name,
      provider: data.provider,
      model: data.model,
      base_url: data.base_url || null,
      api_key_encrypted: this.encryptKey(data.api_key || null),
      dimensions: data.dimensions,
      is_active: data.is_active ?? true,
      is_default: data.is_default ?? false,
    });

    const saved = await this.configRepository.save(config);
    await this.invalidateCache();

    await this.auditService.log(null, 'embedding_provider.created', {
      provider_id: saved.id,
      name: saved.name,
      provider: saved.provider,
      model: saved.model,
    });

    return saved;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      provider: EmbeddingProviderType;
      model: string;
      base_url: string | null;
      api_key: string | null;
      dimensions: number;
      is_active: boolean;
      is_default: boolean;
    }>,
  ): Promise<EmbeddingProviderConfig | null> {
    const config = await this.configRepository.findOne({ where: { id } });
    if (!config) return null;

    if (data.is_default) {
      await this.configRepository.update({}, { is_default: false });
    }

    if (data.name !== undefined) config.name = data.name;
    if (data.provider !== undefined) config.provider = data.provider;
    if (data.model !== undefined) config.model = data.model;
    if (data.base_url !== undefined) config.base_url = data.base_url;
    if (data.api_key !== undefined) config.api_key_encrypted = this.encryptKey(data.api_key);
    if (data.dimensions !== undefined) config.dimensions = data.dimensions;
    if (data.is_active !== undefined) config.is_active = data.is_active;
    if (data.is_default !== undefined) config.is_default = data.is_default;

    config.updated_at = new Date();
    const saved = await this.configRepository.save(config);
    await this.invalidateCache();

    await this.auditService.log(null, 'embedding_provider.updated', {
      provider_id: saved.id,
      name: saved.name,
      provider: saved.provider,
      model: saved.model,
    });

    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const config = await this.configRepository.findOne({ where: { id } });
    if (!config) return false;

    await this.configRepository.remove(config);
    await this.invalidateCache();

    await this.auditService.log(null, 'embedding_provider.deleted', {
      provider_id: id,
      name: config.name,
    });

    return true;
  }

  async setDefault(id: string): Promise<EmbeddingProviderConfig | null> {
    const config = await this.configRepository.findOne({ where: { id } });
    if (!config) return null;

    await this.configRepository.update({}, { is_default: false });
    config.is_default = true;
    config.is_active = true;
    config.updated_at = new Date();

    const saved = await this.configRepository.save(config);
    await this.invalidateCache();

    return saved;
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string; dimensions?: number }> {
    const config = await this.findOne(id);
    if (!config) {
      return { success: false, message: 'Provider config not found' };
    }

    const resolved: ResolvedEmbeddingConfig = {
      id: config.id,
      name: config.name,
      provider: config.provider,
      model: config.model,
      baseUrl: config.base_url,
      apiKey: this.decryptKey(config.api_key_encrypted),
      dimensions: config.dimensions,
    };

    try {
      const provider = await this.configureProvider(resolved);
      const embedding = await provider.generateEmbedding('test');
      const actualDimensions = embedding.length;
      return {
        success: true,
        message: `Connection successful. Returned ${actualDimensions} dimensions.`,
        dimensions: actualDimensions,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Connection failed',
      };
    }
  }
}
