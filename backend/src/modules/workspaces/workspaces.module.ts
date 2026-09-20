import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { Workspace } from '../../database/entities/workspace.entity';
import { User } from '../../database/entities/user.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, User]), ApiKeysModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
