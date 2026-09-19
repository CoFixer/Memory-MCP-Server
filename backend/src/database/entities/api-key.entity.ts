import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (user) => user.api_keys)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 255 })
  key_hash: string;

  @Column('varchar', { length: 16 })
  prefix: string;

  @Column('jsonb', { default: ['memory:read', 'memory:write'] })
  permissions: string[];

  @Column('timestamp', { nullable: true })
  last_used_at: Date | null;

  @Column('timestamp', { nullable: true })
  expires_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('timestamp', { nullable: true })
  revoked_at: Date | null;
}
