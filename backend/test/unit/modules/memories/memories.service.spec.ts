import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MemoriesService } from '../../../../src/modules/memories/memories.service';
import { Memory, MemoryScope, MemoryType } from '../../../../src/database/entities/memory.entity';
import { MemoryVersion } from '../../../../src/database/entities/memory-version.entity';
import { Project } from '../../../../src/database/entities/project.entity';
import { EmbeddingService } from '../../../../src/modules/embeddings/embedding.service';
import { SearchService } from '../../../../src/modules/search/search.service';
import { CacheService } from '../../../../src/modules/cache/cache.service';
import { AuditService } from '../../../../src/modules/audit/audit.service';

const mockMemoryRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  })),
});

const mockMemoryVersionRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

const mockProjectRepository = () => ({
  findOne: jest.fn(),
});

const mockEmbeddingService = () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
});

const mockSearchService = () => ({
  hybridSearch: jest.fn().mockResolvedValue([]),
});

const mockCacheService = () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  delPattern: jest.fn().mockResolvedValue(undefined),
});

const mockAuditService = () => ({
  log: jest.fn().mockResolvedValue(undefined),
});

describe('MemoriesService', () => {
  let service: MemoriesService;
  let memoryRepo: jest.Mocked<Repository<Memory>>;
  let embeddingService: jest.Mocked<EmbeddingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoriesService,
        { provide: getRepositoryToken(Memory), useFactory: mockMemoryRepository },
        { provide: getRepositoryToken(MemoryVersion), useFactory: mockMemoryVersionRepository },
        { provide: getRepositoryToken(Project), useFactory: mockProjectRepository },
        { provide: EmbeddingService, useFactory: mockEmbeddingService },
        { provide: SearchService, useFactory: mockSearchService },
        { provide: CacheService, useFactory: mockCacheService },
        { provide: AuditService, useFactory: mockAuditService },
      ],
    }).compile();

    service = module.get<MemoriesService>(MemoriesService);
    memoryRepo = module.get(getRepositoryToken(Memory));
    embeddingService = module.get(EmbeddingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a memory with embedding', async () => {
      const dto = {
        content: 'Test memory',
        type: MemoryType.FACT,
        scope: MemoryScope.PROJECT,
        importance: 8,
      };

      const savedMemory = {
        id: 'mem-1',
        ...dto,
        embedding: [0.1, 0.2, 0.3],
        user_id: 'user-1',
      } as Memory;

      memoryRepo.create.mockReturnValue(savedMemory);
      memoryRepo.save.mockResolvedValue(savedMemory);

      const result = await service.create('user-1', dto);

      expect(embeddingService.generateEmbedding).toHaveBeenCalledWith('Test memory');
      expect(result.id).toBe('mem-1');
      expect(result.content).toBe('Test memory');
    });
  });

  describe('findOne', () => {
    it('should return a memory and increment access count', async () => {
      const memory = {
        id: 'mem-1',
        content: 'Test',
        access_count: 5,
        user_id: 'user-1',
        is_deleted: false,
      } as Memory;

      memoryRepo.findOne.mockResolvedValue(memory);
      memoryRepo.save.mockResolvedValue({ ...memory, access_count: 6 });

      const result = await service.findOne('user-1', 'mem-1');

      expect(result.access_count).toBe(6);
      expect(memoryRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for missing memory', async () => {
      memoryRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('user-1', 'missing')).rejects.toThrow('Memory not found');
    });
  });

  describe('remove', () => {
    it('should soft delete a memory', async () => {
      const memory = {
        id: 'mem-1',
        content: 'Test',
        user_id: 'user-1',
        is_deleted: false,
      } as Memory;

      memoryRepo.findOne.mockResolvedValue(memory);
      memoryRepo.save.mockResolvedValue({ ...memory, is_deleted: true });

      await service.remove('user-1', 'mem-1');

      expect(memoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_deleted: true }),
      );
    });
  });
});
