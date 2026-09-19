import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import request from 'supertest';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';
import { HealthController } from '../../src/modules/health/health.controller';
import { HealthService } from '../../src/modules/health/health.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Memory } from '../../src/database/entities/memory.entity';
import { CacheService } from '../../src/modules/cache/cache.service';
import { EmbeddingService } from '../../src/modules/embeddings/embedding.service';

jest.setTimeout(30000);

describe('MemoryMcpServer (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [AppController, HealthController],
      providers: [
        AppService,
        HealthService,
        {
          provide: getRepositoryToken(Memory),
          useValue: {
            query: jest.fn().mockResolvedValue([[{ 1: 1 }]]),
          },
        },
        {
          provide: CacheService,
          useValue: {
            getClient: jest.fn().mockResolvedValue({
              ping: jest.fn().mockResolvedValue('PONG'),
            }),
          },
        },
        {
          provide: EmbeddingService,
          useValue: {
            generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: ['/', '/health', '/health/(.*)'],
    });
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Health Endpoints', () => {
    it('/health/live (GET) should return alive', () => {
      return request(app.getHttpServer())
        .get('/health/live')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('alive');
        });
    });

    it('/health/ready (GET) should return readiness status', () => {
      return request(app.getHttpServer())
        .get('/health/ready')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined();
        });
    });
  });

  describe('App Controller', () => {
    it('/ (GET) should return service information', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Memory MCP Server');
          expect(res.body.protocol).toBe('MCP Streamable HTTP');
          expect(res.body.endpoint).toBe('/mcp');
        });
    });
  });
});
