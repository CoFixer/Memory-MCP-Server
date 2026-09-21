import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { PrdChunk } from './prd-chunk.entity';

export enum PrdStatus {
  DRAFT = 'draft',
  VALIDATING = 'validating',
  READY = 'ready',
  ACTIVE = 'active',
  SUPERSEDED = 'superseded',
  ARCHIVED = 'archived',
  FAILED = 'failed',
}

@Entity('prd_documents')
export class PrdDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  project_id: string;

  @ManyToOne(() => Project, (project) => project.prdDocuments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column('varchar', { length: 50 })
  version: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('text')
  content: string;

  @Column('varchar', { length: 64, nullable: true })
  content_hash: string | null;

  @Column('varchar', { length: 50, nullable: true })
  generation_source: string | null;

  @Column('varchar', { length: 100, nullable: true })
  generator_provider: string | null;

  @Column('varchar', { length: 100, nullable: true })
  generator_model: string | null;

  @Column('enum', { enum: PrdStatus, default: PrdStatus.DRAFT })
  status: PrdStatus;

  @Column('boolean', { default: false })
  is_active: boolean;

  @Column('uuid', { nullable: true })
  created_by: string | null;

  @Column('uuid', { nullable: true })
  approved_by: string | null;

  @Column('timestamp', { nullable: true })
  approved_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => PrdChunk, (chunk) => chunk.prdDocument)
  chunks: PrdChunk[];
}
