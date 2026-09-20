import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from '../../database/entities/project.entity';
import { User } from '../../database/entities/user.entity';
import { Workspace } from '../../database/entities/workspace.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project, User, Workspace]), ApiKeysModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
