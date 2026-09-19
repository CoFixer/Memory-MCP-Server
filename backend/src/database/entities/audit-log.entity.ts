import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum AuditEventType {
  MEMORY_CREATED = 'memory.created',
  MEMORY_UPDATED = 'memory.updated',
  MEMORY_DELETED = 'memory.deleted',
  MEMORY_RECALLED = 'memory.recalled',
  PROJECT_CREATED = 'project.created',
  API_KEY_CREATED = 'api_key.created',
  API_KEY_REVOKED = 'api_key.revoked',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  user_id: string | null;

  @Column('varchar', { length: 100 })
  event: string;

  @Column('varchar', { length: 50, nullable: true })
  actor: string | null;

  @Column('varchar', { length: 255, nullable: true })
  client: string | null;

  @Column('varchar', { length: 45, nullable: true })
  ip_address: string | null;

  @Column('varchar', { length: 100, nullable: true })
  resource_type: string | null;

  @Column('uuid', { nullable: true })
  resource_id: string | null;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
