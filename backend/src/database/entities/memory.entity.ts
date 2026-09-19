import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Workspace } from './workspace.entity';
import { Project } from './project.entity';

export enum MemoryScope {
  GLOBAL = 'global',
  WORKSPACE = 'workspace',
  PROJECT = 'project',
}

export enum MemoryType {
  FACT = 'fact',
  RULE = 'rule',
  DECISION = 'decision',
  PREFERENCE = 'preference',
  ARCHITECTURE = 'architecture',
  CONVENTION = 'convention',
  DEPENDENCY = 'dependency',
  CONFIGURATION = 'configuration',
  WORKFLOW = 'workflow',
  ISSUE = 'issue',
  SOLUTION = 'solution',
  NOTE = 'note',
}

@Entity('memories')
@Index(['user_id', 'scope'])
@Index(['project_id', 'scope'])
@Index(['type'])
@Index(['is_deleted'])
@Index(['is_archived'])
@Index(['session_id'])
export class Memory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (user) => user.memories)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('varchar', { length: 255, nullable: true })
  session_id: string | null;

  @Column('uuid', { nullable: true })
  workspace_id: string | null;

  @ManyToOne(() => Workspace, (workspace) => workspace.memories, { nullable: true })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace | null;

  @Column('uuid', { nullable: true })
  project_id: string | null;

  @ManyToOne(() => Project, (project) => project.memories, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project | null;

  @Column({
    type: 'enum',
    enum: MemoryScope,
    default: MemoryScope.GLOBAL,
  })
  scope: MemoryScope;

  @Column({
    type: 'enum',
    enum: MemoryType,
    default: MemoryType.NOTE,
  })
  type: MemoryType;

  @Column('varchar', { length: 255, nullable: true })
  title: string | null;

  @Column('text')
  content: string;

  @Column('vector', { nullable: true })
  embedding: number[] | null;

  @Column('smallint', { default: 5 })
  importance: number;

  @Column('decimal', { precision: 3, scale: 2, default: 1.0 })
  confidence: number;

  @Column('varchar', { length: 255, nullable: true })
  source: string | null;

  @Column('varchar', { length: 255, nullable: true })
  source_client: string | null;

  @Column('jsonb', { default: {} })
  tags: Record<string, any>;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Column('integer', { default: 0 })
  access_count: number;

  @Column('timestamp', { nullable: true })
  last_accessed_at: Date | null;

  @Column('timestamp', { nullable: true })
  expires_at: Date | null;

  @Column('boolean', { default: false })
  is_archived: boolean;

  @Column('boolean', { default: false })
  is_deleted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
