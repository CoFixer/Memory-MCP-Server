import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContextService } from './context.service';
import { RankingService } from './ranking.service';
import { TokenBudgetService } from './token-budget.service';
import { Memory } from '../../database/entities/memory.entity';
import { Project } from '../../database/entities/project.entity';
import { SearchModule } from '../search/search.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([Memory, Project]), SearchModule, CacheModule],
  providers: [ContextService, RankingService, TokenBudgetService],
  exports: [ContextService],
})
export class ContextModule {}
