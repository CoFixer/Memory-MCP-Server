import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmbeddingProviderConfig1730000000000 implements MigrationInterface {
  name = 'AddEmbeddingProviderConfig1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."embedding_provider_configs_provider_enum" AS ENUM('ollama', 'openai', 'openrouter')`,
    );

    await queryRunner.query(
      `CREATE TABLE "embedding_provider_configs" (
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
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_embedding_provider_default" ON "embedding_provider_configs" ("is_default")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_embedding_provider_active" ON "embedding_provider_configs" ("is_active")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_embedding_provider_active"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_embedding_provider_default"`);
    await queryRunner.query(`DROP TABLE "embedding_provider_configs"`);
    await queryRunner.query(`DROP TYPE "public"."embedding_provider_configs_provider_enum"`);
  }
}
