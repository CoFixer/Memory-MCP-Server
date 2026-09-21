import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrdService } from './prd.service';
import { PrdController } from './prd.controller';
import { PrdDocument } from '../../database/entities/prd-document.entity';
import { PrdChunk } from '../../database/entities/prd-chunk.entity';
import { PrdRelation } from '../../database/entities/prd-relation.entity';
import { Project } from '../../database/entities/project.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PrdDocument, PrdChunk, PrdRelation, Project]), AuthModule],
  controllers: [PrdController],
  providers: [PrdService],
  exports: [PrdService],
})
export class PrdModule {}
