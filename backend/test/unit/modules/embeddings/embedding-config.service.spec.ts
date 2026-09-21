import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { EmbeddingConfigService } from '../../../../src/modules/embeddings/embedding-config.service';
import { EmbeddingProviderConfig, EmbeddingProviderType } from '../../../../src/database/entities/embedding-provider-config.entity';
import { CacheService } from '../../../../src/modules/cache/cache.service';
import { AuditService } from '../../../../src/modules/audit/audit.service';
import { OllamaProvider } from '../../../../src/modules/embeddings/providers/ollama.provider';
import { OpenAIProvider } from '../../../../src/modules/embeddings/providers/openai.provider';
import { OpenRouterProvider } from '../../../../src/modules/embeddings/providers/openrouter.provider';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockCacheService = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
});

const mockAuditService = () => ({
  log: jest.fn(),
});

const mockOllamaProvider = () => ({
  setConfig: jest.fn(),
  generateEmbedding: jest.fn(),
  getDimensions: jest.fn().mockReturnValue(768),
});

const mockOpenAIProvider = () => ({
  setConfig: jest.fn(),
  generateEmbedding: jest.fn(),
  getDimensions: jest.fn().mockReturnValue(1536),
});

const mockOpenRouterProvider = () => ({
  setConfig: jest.fn(),
  generateEmbedding: jest.fn(),
  getDimensions: jest.fn().mockReturnValue(1536),
});

describe('EmbeddingConfigService', () => {
  let service: EmbeddingConfigService;
  let repository: jest.Mocked<Repository<EmbeddingProviderConfig>>;
  let cacheService: jest.Mocked<CacheService>;
  let ollamaProvider: jest.Mocked<OllamaProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingConfigService,
        { provide: getRepositoryToken(EmbeddingProviderConfig), useFactory: mockRepository },
        { provide: ConfigService, useValue: { get: jest.fn((key: string, defaultValue: any) => key === 'API_KEY_SECRET' ? 'this-is-a-test-secret-key-32-chars!!' : defaultValue) } },
        { provide: CacheService, useFactory: mockCacheService },
        { provide: AuditService, useFactory: mockAuditService },
        { provide: OllamaProvider, useFactory: mockOllamaProvider },
        { provide: OpenAIProvider, useFactory: mockOpenAIProvider },
        { provide: OpenRouterProvider, useFactory: mockOpenRouterProvider },
      ],
    }).compile();

    service = module.get<EmbeddingConfigService>(EmbeddingConfigService);
    repository = module.get(getRepositoryToken(EmbeddingProviderConfig));
    cacheService = module.get(CacheService);
    ollamaProvider = module.get(OllamaProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActiveConfig', () => {
    it('should return cached config if available', async () => {
      const cached = { id: '1', name: 'Default', provider: 'ollama', model: 'nomic-embed-text', baseUrl: 'http://localhost:11434', apiKey: null, dimensions: 768 };
      cacheService.get.mockResolvedValue(cached);

      const result = await service.getActiveConfig();

      expect(result).toEqual(cached);
      expect(cacheService.get).toHaveBeenCalledWith('embedding:active-config');
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should return null if no active config in DB', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(null);

      const result = await service.getActiveConfig();

      expect(result).toBeNull();
    });

    it('should return config from DB and cache it', async () => {
      cacheService.get.mockResolvedValue(null);
      const dbConfig = {
        id: '1',
        name: 'Default',
        provider: EmbeddingProviderType.OLLAMA,
        model: 'nomic-embed-text',
        base_url: 'http://localhost:11434',
        api_key_encrypted: null,
        dimensions: 768,
        is_active: true,
        is_default: true,
      } as EmbeddingProviderConfig;
      repository.findOne.mockResolvedValue(dbConfig);

      const result = await service.getActiveConfig();

      expect(result).not.toBeNull();
      expect(result?.provider).toBe('ollama');
      expect(result?.dimensions).toBe(768);
      expect(cacheService.set).toHaveBeenCalled();
    });
  });

  describe('configureProvider', () => {
    it('should configure ollama provider', async () => {
      const config = { id: '1', name: 'Default', provider: EmbeddingProviderType.OLLAMA, model: 'nomic-embed-text', baseUrl: 'http://localhost:11434', apiKey: null, dimensions: 768 };
      await service.configureProvider(config);
      expect(ollamaProvider.setConfig).toHaveBeenCalledWith({ baseUrl: 'http://localhost:11434', model: 'nomic-embed-text', dimensions: 768 });
    });

    it('should throw error for openai without api key', async () => {
      const config = { id: '1', name: 'Default', provider: EmbeddingProviderType.OPENAI, model: 'text-embedding-3-small', baseUrl: null, apiKey: null, dimensions: 1536 };
      await expect(service.configureProvider(config)).rejects.toThrow('OpenAI provider requires an API key');
    });
  });

  describe('create', () => {
    it('should create a new provider config', async () => {
      const input = { name: 'Test', provider: EmbeddingProviderType.OLLAMA, model: 'nomic-embed-text', dimensions: 768 };
      repository.create.mockReturnValue({ ...input, id: '1' } as EmbeddingProviderConfig);
      repository.save.mockResolvedValue({ ...input, id: '1' } as EmbeddingProviderConfig);

      const result = await service.create(input);

      expect(result.id).toBe('1');
      expect(cacheService.del).toHaveBeenCalledWith('embedding:active-config');
    });
  });

  describe('setDefault', () => {
    it('should set a provider as default', async () => {
      const config = { id: '1', name: 'Test', is_default: false } as EmbeddingProviderConfig;
      repository.findOne.mockResolvedValue(config);
      repository.save.mockResolvedValue({ ...config, is_default: true } as EmbeddingProviderConfig);

      const result = await service.setDefault('1');

      expect(result?.is_default).toBe(true);
      expect(repository.update).toHaveBeenCalledWith({}, { is_default: false });
    });
  });
});
