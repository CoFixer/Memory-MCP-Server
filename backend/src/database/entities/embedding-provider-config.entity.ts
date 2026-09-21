import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum EmbeddingProviderType {
  OLLAMA = 'ollama',
  OPENAI = 'openai',
  OPENROUTER = 'openrouter',
}

@Entity('embedding_provider_configs')
export class EmbeddingProviderConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: EmbeddingProviderType,
  })
  provider: EmbeddingProviderType;

  @Column('varchar', { length: 255 })
  model: string;

  @Column('varchar', { length: 500, nullable: true })
  base_url: string | null;

  @Column('text', { nullable: true })
  api_key_encrypted: string | null;

  @Column('int')
  dimensions: number;

  @Column('boolean', { default: true })
  is_active: boolean;

  @Index('IDX_embedding_provider_default')
  @Column('boolean', { default: false })
  is_default: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
