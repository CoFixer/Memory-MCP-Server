import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../database/entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(userId: string): Promise<Project[]> {
    return this.projectRepository.find({
      where: { user_id: userId },
    });
  }

  async findOne(userId: string, id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id, user_id: userId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async findByGitRemote(userId: string, gitRemote: string): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: { user_id: userId, git_remote: gitRemote },
    });
  }

  async findOrCreateByIdentifier(userId: string, identifier: string): Promise<Project> {
    const normalized = this.normalizeGitRemote(identifier);
    let project = await this.projectRepository.findOne({
      where: [
        { user_id: userId, git_remote: normalized },
        { user_id: userId, repository_url: normalized },
      ],
    });
    if (!project) {
      project = this.projectRepository.create({
        user_id: userId,
        name: identifier.split('/').pop() || identifier,
        slug: normalized.replace(/[^a-z0-9-]/g, '-'),
        git_remote: normalized,
        repository_url: normalized,
      });
      project = await this.projectRepository.save(project);
    }
    return project;
  }

  async create(userId: string, dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create({
      user_id: userId,
      ...dto,
    });
    return this.projectRepository.save(project);
  }

  async update(userId: string, id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(userId, id);
    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  normalizeGitRemote(remote: string): string {
    return remote
      .replace(/^git@/, '')
      .replace(/\.git$/, '')
      .replace(':', '/');
  }
}
