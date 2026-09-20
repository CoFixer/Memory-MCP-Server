import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmbeddingProviderConfig1730000000000 implements MigrationInterface {
  name = 'AddEmbeddingProviderConfig1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'embedding_provider_configs_provider_enum') THEN
          CREATE TYPE "public"."embedding_provider_configs_provider_enum" AS ENUM('ollama', 'openai', 'openrouter');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'embedding_provider_configs') THEN
          CREATE TABLE "embedding_provider_configs" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying(100) NOT NULL,
            "provider" "public"."embedding_provider_configs_provider_enum" NOT NULL,
            "model" character varying(255) NOT NULL,
            "base_url" character varying(500),
            "api_key_encrypted" text,
            "dimensions" integer NOT NULL,
            "is_active" boolean NOT NULL DEFAULT true,
            "is_default" boolean NOT NULL DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_embedding_provider_configs" PRIMARY KEY ("id")
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_embedding_provider_default') THEN
          CREATE INDEX "IDX_embedding_provider_default" ON "embedding_provider_configs" ("is_default");
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_embedding_provider_active') THEN
          CREATE INDEX "IDX_embedding_provider_active" ON "embedding_provider_configs" ("is_active");
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_embedding_provider_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_embedding_provider_default"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "embedding_provider_configs"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."embedding_provider_configs_provider_enum"`);
  }
}
