import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '../../database/entities/workspace.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async findAll(userId: string): Promise<Workspace[]> {
    return this.workspaceRepository.find({
      where: { user_id: userId },
    });
  }

  async findOne(userId: string, id: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id, user_id: userId },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async create(userId: string, dto: CreateWorkspaceDto): Promise<Workspace> {
    const workspace = this.workspaceRepository.create({
      user_id: userId,
      ...dto,
    });
    return this.workspaceRepository.save(workspace);
  }
}
