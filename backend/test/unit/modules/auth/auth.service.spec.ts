import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { ApiKey } from '../../../../src/database/entities/api-key.entity';
import { User } from '../../../../src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockApiKeyRepository = () => ({
  find: jest.fn(),
  save: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let apiKeyRepo: jest.Mocked<Repository<ApiKey>>;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(ApiKey), useFactory: mockApiKeyRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'test-token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    apiKeyRepo = module.get(getRepositoryToken(ApiKey));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateApiKey', () => {
    it('should return null for invalid key', async () => {
      apiKeyRepo.find.mockResolvedValue([]);
      const result = await service.validateApiKey('invalid_key');
      expect(result).toBeNull();
    });

    it('should return user and apiKey for valid key', async () => {
      const user = { id: 'user-1', email: 'test@example.com' } as User;
      const apiKey = {
        id: 'key-1',
        key_hash: 'cac50ff3e0382708a91225907aa63317c6d8194f65aba64e46044892de4a9022',
        prefix: 'mem_live',
        revoked_at: null,
        expires_at: null,
        user,
      } as ApiKey;

      apiKeyRepo.find.mockResolvedValue([apiKey]);
      apiKeyRepo.save.mockResolvedValue(apiKey);

      const result = await service.validateApiKey('mem_live_123');
      expect(result).not.toBeNull();
      expect(result.user.id).toBe('user-1');
    });

    it('should return null for revoked key', async () => {
      const apiKey = {
        id: 'key-1',
        key_hash: 'cac50ff3e0382708a91225907aa63317c6d8194f65aba64e46044892de4a9022',
        prefix: 'mem_live',
        revoked_at: new Date(),
        user: { id: 'user-1' } as User,
      } as ApiKey;

      apiKeyRepo.find.mockResolvedValue([apiKey]);

      const result = await service.validateApiKey('mem_live_123');
      expect(result).toBeNull();
    });
  });
});
