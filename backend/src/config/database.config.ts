import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Memory } from '../database/entities/memory.entity';
import { Project } from '../database/entities/project.entity';
import { Workspace } from '../database/entities/workspace.entity';
import { ApiKey } from '../database/entities/api-key.entity';
import { User } from '../database/entities/user.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { MemoryVersion } from '../database/entities/memory-version.entity';
import { EmbeddingProviderConfig } from '../database/entities/embedding-provider-config.entity';
import { ProjectAssignment } from '../database/entities/project-assignment.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get<string>('DATABASE_URL'),
      entities: [
        Memory,
        Project,
        Workspace,
        ApiKey,
        User,
        AuditLog,
        MemoryVersion,
        EmbeddingProviderConfig,
        ProjectAssignment,
      ],
      synchronize: this.configService.get<string>('NODE_ENV') !== 'production',
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      migrationsRun: true,
    };
  }
}
