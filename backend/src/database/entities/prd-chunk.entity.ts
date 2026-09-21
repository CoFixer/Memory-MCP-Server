import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PrdDocument } from './prd-document.entity';
import { Project } from './project.entity';

@Entity('prd_chunks')
export class PrdChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  prd_document_id: string;

  @ManyToOne(() => PrdDocument, (doc) => doc.chunks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prd_document_id' })
  prdDocument: PrdDocument;

  @Column('uuid')
  project_id: string;

  @ManyToOne(() => Project, (project) => project.prdChunks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column('uuid', { nullable: true })
  parent_chunk_id: string | null;

  @Column('varchar', { length: 100, nullable: true })
  section_id: string | null;

  @Column('varchar', { length: 100, nullable: true })
  module_id: string | null;

  @Column('varchar', { length: 100, nullable: true })
  feature_id: string | null;

  @Column('varchar', { length: 100, nullable: true })
  requirement_id: string | null;

  @Column('varchar', { length: 50 })
  chunk_type: string;

  @Column('varchar', { length: 255, nullable: true })
  title: string | null;

  @Column('text')
  content: string;

  @Column('vector', { nullable: true })
  embedding: number[] | null;

  @Column('varchar', { length: 100, nullable: true })
  embedding_model: string | null;

  @Column('integer', { nullable: true })
  embedding_dimensions: number | null;

  @Column('tsvector', { nullable: true })
  search_vector: string | null;

  @Column('integer', { nullable: true })
  token_count: number | null;

  @Column('smallint', { default: 5 })
  importance: number;

  @Column('integer', { default: 0 })
  sequence: number;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Column('boolean', { default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
