import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from '../../../../src/modules/search/search.service';
import { Memory } from '../../../../src/database/entities/memory.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SemanticSearchService } from '../../../../src/modules/search/semantic-search.service';
import { FulltextSearchService } from '../../../../src/modules/search/fulltext-search.service';

const mockMemoryRepository = () => ({
  createQueryBuilder: jest.fn(),
});

const mockSemanticSearchService = () => ({
  search: jest.fn(),
});

const mockFulltextSearchService = () => ({
  search: jest.fn(),
});

describe('SearchService', () => {
  let service: SearchService;
  let semanticSearch: jest.Mocked<SemanticSearchService>;
  let fulltextSearch: jest.Mocked<FulltextSearchService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(Memory), useFactory: mockMemoryRepository },
        { provide: SemanticSearchService, useFactory: mockSemanticSearchService },
        { provide: FulltextSearchService, useFactory: mockFulltextSearchService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    semanticSearch = module.get(SemanticSearchService);
    fulltextSearch = module.get(FulltextSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hybridSearch', () => {
    it('should merge and rank results from both search methods', async () => {
      const memory1 = { id: 'm1', content: 'semantic match', importance: 8, scope: 'project', updated_at: new Date() } as Memory;
      const memory2 = { id: 'm2', content: 'fulltext match', importance: 5, scope: 'global', updated_at: new Date() } as Memory;

      semanticSearch.search.mockResolvedValue([
        { memory: memory1, score: 0.9 },
      ]);
      fulltextSearch.search.mockResolvedValue([
        { memory: memory2, score: 0.8 },
      ]);

      const results = await service.hybridSearch('user-1', 'test query', { limit: 10 });

      expect(results).toHaveLength(2);
      expect(semanticSearch.search).toHaveBeenCalled();
      expect(fulltextSearch.search).toHaveBeenCalled();
    });

    it('should combine scores for memories found in both searches', async () => {
      const memory = { id: 'm1', content: 'both match', importance: 7, scope: 'project', updated_at: new Date() } as Memory;

      semanticSearch.search.mockResolvedValue([
        { memory, score: 0.9 },
      ]);
      fulltextSearch.search.mockResolvedValue([
        { memory, score: 0.8 },
      ]);

      const results = await service.hybridSearch('user-1', 'test query', { limit: 10 });

      expect(results).toHaveLength(1);
      expect(results[0].score).toBeGreaterThan(0.7);
    });

    it('should respect limit parameter', async () => {
      const memories = Array.from({ length: 20 }, (_, i) => ({
        id: `m${i}`,
        content: `memory ${i}`,
        importance: 5,
        scope: 'global',
        updated_at: new Date(),
      } as Memory));

      semanticSearch.search.mockResolvedValue(
        memories.map((m) => ({ memory: m, score: 0.5 })),
      );
      fulltextSearch.search.mockResolvedValue([]);

      const results = await service.hybridSearch('user-1', 'query', { limit: 5 });

      expect(results).toHaveLength(5);
    });
  });
});
