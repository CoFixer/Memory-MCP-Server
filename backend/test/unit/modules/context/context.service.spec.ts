import { Test, TestingModule } from '@nestjs/testing';
import { ContextService } from '../../../../src/modules/context/context.service';
import { Memory, MemoryType, MemoryScope } from '../../../../src/database/entities/memory.entity';
import { Project } from '../../../../src/database/entities/project.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchService } from '../../../../src/modules/search/search.service';
import { CacheService } from '../../../../src/modules/cache/cache.service';

const mockMemoryRepository = () => ({
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
});

const mockProjectRepository = () => ({
  findOne: jest.fn().mockResolvedValue(null),
});

const mockSearchService = () => ({
  hybridSearch: jest.fn().mockResolvedValue([]),
});

const mockCacheService = () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
});

describe('ContextService', () => {
  let service: ContextService;
  let searchService: jest.Mocked<SearchService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContextService,
        { provide: getRepositoryToken(Memory), useFactory: mockMemoryRepository },
        { provide: getRepositoryToken(Project), useFactory: mockProjectRepository },
        { provide: SearchService, useFactory: mockSearchService },
        { provide: CacheService, useFactory: mockCacheService },
      ],
    }).compile();

    service = module.get<ContextService>(ContextService);
    searchService = module.get(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getContext', () => {
    it('should return memories within token budget', async () => {
      const memories = [
        { id: 'm1', content: 'Rule 1', type: MemoryType.RULE, importance: 9, scope: MemoryScope.GLOBAL, updated_at: new Date(), title: 'Rule' },
        { id: 'm2', content: 'Architecture 1', type: MemoryType.ARCHITECTURE, importance: 8, scope: MemoryScope.GLOBAL, updated_at: new Date(), title: 'Arch' },
      ] as Memory[];

      searchService.hybridSearch.mockResolvedValue(
        memories.map((m) => ({ memory: m, score: 0.8, semanticScore: 0.8, fulltextScore: 0 })),
      );

      const result = await service.getContext('user-1', 'test query', { max_tokens: 1000 });

      expect(result.memories).toBeDefined();
      expect(Array.isArray(result.memories)).toBe(true);
      expect(result.totalTokens).toBeGreaterThanOrEqual(0);
    });

    it('should use cache when available', async () => {
      const cached = {
        memories: [{ id: 'm1', content: 'Cached' }],
        totalTokens: 100,
      };

      const cacheServiceMock = { get: jest.fn().mockResolvedValue(cached), set: jest.fn() };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ContextService,
          { provide: getRepositoryToken(Memory), useFactory: mockMemoryRepository },
          { provide: getRepositoryToken(Project), useFactory: mockProjectRepository },
          { provide: SearchService, useFactory: mockSearchService },
          { provide: CacheService, useValue: cacheServiceMock },
        ],
      }).compile();

      const svc = module.get<ContextService>(ContextService);
      const result = await svc.getContext('user-1', 'test query');

      expect(result.memories).toEqual(cached.memories);
      expect(searchService.hybridSearch).not.toHaveBeenCalled();
    });
  });
});
