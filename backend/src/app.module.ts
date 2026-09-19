import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { MemoriesModule } from './modules/memories/memories.module';
import { SearchModule } from './modules/search/search.module';
import { EmbeddingsModule } from './modules/embeddings/embeddings.module';
import { ContextModule } from './modules/context/context.module';
import { McpModule } from './modules/mcp/mcp.module';
import { CacheModule } from './modules/cache/cache.module';
import { HealthModule } from './modules/health/health.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'dashboard', 'dist'),
      serveRoot: '/dashboard',
    }),
    AuthModule,
    ApiKeysModule,
    UsersModule,
    WorkspacesModule,
    ProjectsModule,
    MemoriesModule,
    SearchModule,
    EmbeddingsModule,
    ContextModule,
    McpModule,
    CacheModule,
    HealthModule,
    AuditModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
