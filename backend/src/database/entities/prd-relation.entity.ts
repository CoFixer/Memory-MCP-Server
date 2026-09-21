import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PrdDocument } from './prd-document.entity';

export enum PrdRelationType {
  PARENT_OF = 'parent_of',
  CHILD_OF = 'child_of',
  DEPENDS_ON = 'depends_on',
  REQUIRED_BY = 'required_by',
  RELATED_TO = 'related_to',
  IMPLEMENTS = 'implements',
  VALIDATED_BY = 'validated_by',
  SECURED_BY = 'secured_by',
  USES = 'uses',
  CONFLICTS_WITH = 'conflicts_with',
  SUPERSEDES = 'supersedes',
  DERIVED_FROM = 'derived_from',
}

@Entity('prd_relations')
export class PrdRelation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  prd_document_id: string;

  @ManyToOne(() => PrdDocument, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prd_document_id' })
  prdDocument: PrdDocument;

  @Column('varchar', { length: 100 })
  source_id: string;

  @Column('enum', { enum: PrdRelationType })
  relation_type: PrdRelationType;

  @Column('varchar', { length: 100 })
  target_id: string;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
