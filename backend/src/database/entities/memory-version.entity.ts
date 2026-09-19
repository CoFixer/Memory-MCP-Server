import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Memory } from './memory.entity';

@Entity('memory_versions')
export class MemoryVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  memory_id: string;

  @ManyToOne(() => Memory, (memory) => memory.id)
  @JoinColumn({ name: 'memory_id' })
  memory: Memory;

  @Column('integer')
  version: number;

  @Column('text')
  content: string;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Column('varchar', { length: 255, nullable: true })
  changed_by: string | null;

  @CreateDateColumn()
  created_at: Date;
}
