import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from '../../database/entities/project.entity';
import { ProjectAssignment } from '../../database/entities/project-assignment.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectAssignment)
    private readonly assignmentRepository: Repository<ProjectAssignment>,
  ) {}

  private async getAssignedProjectIds(userId: string): Promise<string[]> {
    const assignments = await this.assignmentRepository.find({
      where: { user_id: userId },
      select: ['project_id'],
    });
    return assignments.map((a) => a.project_id);
  }

  private async ensureAssigned(userId: string, projectId: string): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: { project_id: projectId, user_id: userId },
    });
    if (!assignment) {
      throw new NotFoundException('Project not found');
    }
  }

  async findAll(userId: string): Promise<Project[]> {
    const projectIds = await this.getAssignedProjectIds(userId);
    if (projectIds.length === 0) return [];
    return this.projectRepository.find({
      where: { id: In(projectIds) },
      relations: ['user', 'workspace'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Project> {
    await this.ensureAssigned(userId, id);
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['user', 'workspace'],
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async findByGitRemote(userId: string, gitRemote: string): Promise<Project | null> {
    const projectIds = await this.getAssignedProjectIds(userId);
    if (projectIds.length === 0) return null;
    return this.projectRepository.findOne({
      where: { id: In(projectIds), git_remote: gitRemote },
    });
  }

  async findOrCreateByIdentifier(userId: string, identifier: string): Promise<Project> {
    const normalized = this.normalizeGitRemote(identifier);
    const projectIds = await this.getAssignedProjectIds(userId);

    let project: Project | null = null;
    if (projectIds.length > 0) {
      project = await this.projectRepository.findOne({
        where: [
          { id: In(projectIds), git_remote: normalized },
          { id: In(projectIds), repository_url: normalized },
        ],
      });
    }

    if (!project) {
      project = this.projectRepository.create({
        user_id: userId,
        name: identifier.split('/').pop() || identifier,
        slug: normalized.replace(/[^a-z0-9-]/g, '-'),
        git_remote: normalized,
        repository_url: normalized,
      });
      project = await this.projectRepository.save(project);
      // Auto-assign creator
      await this.assignmentRepository.save({
        project_id: project.id,
        user_id: userId,
      });
    }
    return project;
  }

  async create(userId: string, dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create({
      user_id: userId,
      ...dto,
    });
    const saved = await this.projectRepository.save(project);
    // Auto-assign creator
    await this.assignmentRepository.save({
      project_id: saved.id,
      user_id: userId,
    });
    return saved;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto): Promise<Project> {
    await this.ensureAssigned(userId, id);
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  // Assignment management (for admin)
  async assignUser(projectId: string, userId: string): Promise<void> {
    const exists = await this.assignmentRepository.findOne({
      where: { project_id: projectId, user_id: userId },
    });
    if (!exists) {
      await this.assignmentRepository.save({
        project_id: projectId,
        user_id: userId,
      });
    }
  }

  async unassignUser(projectId: string, userId: string): Promise<void> {
    await this.assignmentRepository.delete({
      project_id: projectId,
      user_id: userId,
    });
  }

  async getAssignedUsers(projectId: string): Promise<string[]> {
    const assignments = await this.assignmentRepository.find({
      where: { project_id: projectId },
      relations: ['user'],
    });
    return assignments.map((a) => a.user_id);
  }

  normalizeGitRemote(remote: string): string {
    return remote
      .replace(/^git@/, '')
      .replace(/\.git$/, '')
      .replace(':', '/');
  }
}
