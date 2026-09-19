import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../../database/entities/user.entity';
import { Memory } from '../../database/entities/memory.entity';
import { Project } from '../../database/entities/project.entity';
import { ApiKey } from '../../database/entities/api-key.entity';
import { Workspace } from '../../database/entities/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Memory, Project, ApiKey, Workspace])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
