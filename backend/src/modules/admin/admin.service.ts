import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import { Memory } from '../../database/entities/memory.entity';
import { Project } from '../../database/entities/project.entity';
import { ApiKey } from '../../database/entities/api-key.entity';
import { Workspace } from '../../database/entities/workspace.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Memory)
    private readonly memoryRepository: Repository<Memory>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async getStats() {
    const [userCount, memoryCount, projectCount, apiKeyCount, workspaceCount] =
      await Promise.all([
        this.userRepository.count(),
        this.memoryRepository.count({ where: { is_deleted: false } }),
        this.projectRepository.count(),
        this.apiKeyRepository.count({ where: { revoked_at: null } }),
        this.workspaceRepository.count(),
      ]);

    const recentMemories = await this.memoryRepository.find({
      where: { is_deleted: false },
      order: { created_at: 'DESC' },
      take: 5,
      relations: ['user', 'project'],
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        scope: true,
        session_id: true,
        created_at: true,
      },
    });

    return {
      counts: { users: userCount, memories: memoryCount, projects: projectCount, apiKeys: apiKeyCount, workspaces: workspaceCount },
      recentMemories,
    };
  }

  async findAllUsers() {
    return this.userRepository.find({
      select: ['id', 'email', 'name', 'role', 'metadata', 'created_at', 'updated_at'],
      order: { created_at: 'DESC' },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    name?: string;
    role?: UserRole;
  }) {
    const password_hash = await bcrypt.hash(data.password, 12);
    const user = this.userRepository.create({
      email: data.email,
      name: data.name || null,
      password_hash,
      role: data.role || UserRole.USER,
    });
    const saved = await this.userRepository.save(user);
    const { password_hash: _, ...result } = saved as any;
    return result;
  }

  async updateUser(
    id: string,
    data: Partial<{ name: string; role: UserRole; password: string }>,
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (data.name !== undefined) user.name = data.name || null;
    if (data.role !== undefined) user.role = data.role;
    if (data.password) user.password_hash = await bcrypt.hash(data.password, 12);
    user.updated_at = new Date();
    const saved = await this.userRepository.save(user);
    const { password_hash: _, ...result } = saved as any;
    return result;
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.remove(user);
    return { success: true };
  }

  async findAllMemories(query: {
    session_id?: string;
    project_id?: string;
    user_id?: string;
    scope?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }) {
    const qb = this.memoryRepository
      .createQueryBuilder('memory')
      .leftJoinAndSelect('memory.user', 'user')
      .leftJoinAndSelect('memory.project', 'project')
      .where('memory.is_deleted = false')
      .orderBy('memory.created_at', 'DESC');

    if (query.session_id) {
      qb.andWhere('memory.session_id = :sessionId', { sessionId: query.session_id });
    }
    if (query.project_id) {
      qb.andWhere('memory.project_id = :projectId', { projectId: query.project_id });
    }
    if (query.user_id) {
      qb.andWhere('memory.user_id = :userId', { userId: query.user_id });
    }
    if (query.scope) {
      qb.andWhere('memory.scope = :scope', { scope: query.scope });
    }
    if (query.type) {
      qb.andWhere('memory.type = :type', { type: query.type });
    }

    const limit = query.limit || 20;
    const offset = query.offset || 0;
    const [items, total] = await qb.skip(offset).take(limit).getManyAndCount();
    return { items, total, limit, offset };
  }

  async findAllProjects() {
    return this.projectRepository.find({
      relations: ['user', 'workspace'],
      order: { created_at: 'DESC' },
    });
  }

  async findAllApiKeys() {
    return this.apiKeyRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async findAllWorkspaces() {
    return this.workspaceRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }
}
