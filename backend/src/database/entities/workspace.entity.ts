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
import { Project } from './project.entity';
import { Memory } from './memory.entity';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (user) => user.workspaces)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 255 })
  slug: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Project, (project) => project.workspace)
  projects: Project[];

  @OneToMany(() => Memory, (memory) => memory.workspace)
  memories: Memory[];
}
