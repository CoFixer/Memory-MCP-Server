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
import { User } from './user.entity';
import { Workspace } from './workspace.entity';
import { Memory } from './memory.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (user) => user.projects)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid', { nullable: true })
  workspace_id: string | null;

  @ManyToOne(() => Workspace, (workspace) => workspace.projects, { nullable: true })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace | null;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 255 })
  slug: string;

  @Column('varchar', { length: 500, nullable: true })
  git_remote: string | null;

  @Column('varchar', { length: 500, nullable: true })
  repository_url: string | null;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Memory, (memory) => memory.project)
  memories: Memory[];
}
