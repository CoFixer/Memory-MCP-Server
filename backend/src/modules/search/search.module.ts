import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SemanticSearchService } from './semantic-search.service';
import { FulltextSearchService } from './fulltext-search.service';
import { Memory } from '../../database/entities/memory.entity';
import { EmbeddingsModule } from '../embeddings/embeddings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Memory]), EmbeddingsModule],
  providers: [SearchService, SemanticSearchService, FulltextSearchService],
  exports: [SearchService],
})
export class SearchModule {}
