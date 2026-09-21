import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrdDocument, PrdStatus } from '../../database/entities/prd-document.entity';
import { PrdChunk } from '../../database/entities/prd-chunk.entity';
import { PrdRelation } from '../../database/entities/prd-relation.entity';
import { Project } from '../../database/entities/project.entity';

@Injectable()
export class PrdService {
  constructor(
    @InjectRepository(PrdDocument)
    private readonly prdDocumentRepository: Repository<PrdDocument>,
    @InjectRepository(PrdChunk)
    private readonly prdChunkRepository: Repository<PrdChunk>,
    @InjectRepository(PrdRelation)
    private readonly prdRelationRepository: Repository<PrdRelation>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async createPrdDocument(userId: string, projectId: string, data: {
    version: string;
    title: string;
    content: string;
    generation_source?: string;
    generator_provider?: string;
    generator_model?: string;
  }): Promise<PrdDocument> {
    const doc = this.prdDocumentRepository.create({
      project_id: projectId,
      created_by: userId,
      status: PrdStatus.DRAFT,
      ...data,
    });
    return this.prdDocumentRepository.save(doc);
  }

  async getActivePrd(projectId: string): Promise<PrdDocument | null> {
    return this.prdDocumentRepository.findOne({
      where: { project_id: projectId, is_active: true },
    });
  }

  async activatePrdVersion(userId: string, projectId: string, prdId: string): Promise<PrdDocument> {
    // Deactivate current active PRD
    await this.prdDocumentRepository.update(
      { project_id: projectId, is_active: true },
      { is_active: false, status: PrdStatus.SUPERSEDED },
    );

    // Activate new PRD
    await this.prdDocumentRepository.update(
      { id: prdId },
      { is_active: true, status: PrdStatus.ACTIVE, approved_by: userId, approved_at: new Date() },
    );

    // Update project's active_prd_id
    await this.projectRepository.update(projectId, { active_prd_id: prdId });

    return this.prdDocumentRepository.findOneOrFail({ where: { id: prdId } });
  }

  async getPrdVersions(projectId: string): Promise<PrdDocument[]> {
    return this.prdDocumentRepository.find({
      where: { project_id: projectId },
      order: { created_at: 'DESC' },
    });
  }

  async getRequirementById(projectId: string, requirementId: string): Promise<PrdChunk | null> {
    return this.prdChunkRepository.findOne({
      where: {
        project_id: projectId,
        requirement_id: requirementId,
        is_active: true,
      },
    });
  }

  async searchPrdChunks(projectId: string, query: string, options?: {
    chunkType?: string;
    moduleId?: string;
    limit?: number;
  }): Promise<PrdChunk[]> {
    const qb = this.prdChunkRepository.createQueryBuilder('chunk')
      .where('chunk.project_id = :projectId', { projectId })
      .andWhere('chunk.is_active = true');

    if (options?.chunkType) {
      qb.andWhere('chunk.chunk_type = :chunkType', { chunkType: options.chunkType });
    }

    if (options?.moduleId) {
      qb.andWhere('chunk.module_id = :moduleId', { moduleId: options.moduleId });
    }

    // Full-text search if query provided
    if (query?.trim()) {
      qb.andWhere(
        `chunk.search_vector @@ plainto_tsquery('english', :query)`,
        { query: query.trim() },
      );
    }

    qb.orderBy('chunk.importance', 'DESC').addOrderBy('chunk.sequence', 'ASC');
    qb.limit(options?.limit || 20);

    return qb.getMany();
  }
}
