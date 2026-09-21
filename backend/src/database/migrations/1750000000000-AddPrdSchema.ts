import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrdSchema1750000000000 implements MigrationInterface {
  name = 'AddPrdSchema1750000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add summary and active_prd_id to projects
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "summary" text`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "active_prd_id" uuid`);

    // Create prd_documents table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "prd_documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" uuid NOT NULL,
        "version" character varying(50) NOT NULL,
        "title" character varying(255) NOT NULL,
        "content" text NOT NULL,
        "content_hash" character varying(64),
        "generation_source" character varying(50),
        "generator_provider" character varying(100),
        "generator_model" character varying(100),
        "status" character varying NOT NULL DEFAULT 'draft',
        "is_active" boolean NOT NULL DEFAULT false,
        "created_by" uuid,
        "approved_by" uuid,
        "approved_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prd_documents" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prd_documents_project_id" ON "prd_documents" ("project_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prd_documents_status" ON "prd_documents" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prd_documents_is_active" ON "prd_documents" ("is_active")`);

    // Create prd_chunks table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "prd_chunks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "prd_document_id" uuid NOT NULL,
        "project_id" uuid NOT NULL,
        "parent_chunk_id" uuid,
        "section_id" character varying(100),
        "module_id" character varying(100),
        "feature_id" character varying(100),
        "requirement_id" character varying(100),
        "chunk_type" character varying(50) NOT NULL,
        "title" character varying(255),
        "content" text NOT NULL,
        "embedding" vector,
        "embedding_model" character varying(100),
        "embedding_dimensions" integer,
        "search_vector" tsvector,
        "token_count" integer,
        "importance" smallint NOT NULL DEFAULT 5,
        "sequence" integer NOT NULL DEFAULT 0,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prd_chunks" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prd_chunks_project_id" ON "prd_chunks" ("project_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prd_chunks_prd_document_id" ON "prd_chunks" ("prd_document_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prd_chunks_chunk_type" ON "prd_chunks" ("chunk_type")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prd_chunks_requirement_id" ON "prd_chunks" ("requirement_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prd_chunks_module_id" ON "prd_chunks" ("module_id")`);

    // Create GIN index for full-text search on prd_chunks
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prd_chunks_fts" ON "prd_chunks" USING GIN ("search_vector")`);

    // Create prd_relations table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "prd_relations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "prd_document_id" uuid NOT NULL,
        "source_id" character varying(100) NOT NULL,
        "relation_type" character varying NOT NULL,
        "target_id" character varying(100) NOT NULL,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prd_relations" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prd_relations_prd_document_id" ON "prd_relations" ("prd_document_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prd_relations_source_id" ON "prd_relations" ("source_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_prd_relations_target_id" ON "prd_relations" ("target_id")`);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "prd_documents"
      ADD CONSTRAINT "FK_prd_documents_project_id"
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "prd_chunks"
      ADD CONSTRAINT "FK_prd_chunks_prd_document_id"
      FOREIGN KEY ("prd_document_id") REFERENCES "prd_documents"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "prd_chunks"
      ADD CONSTRAINT "FK_prd_chunks_project_id"
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "prd_relations"
      ADD CONSTRAINT "FK_prd_relations_prd_document_id"
      FOREIGN KEY ("prd_document_id") REFERENCES "prd_documents"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prd_relations" DROP CONSTRAINT IF EXISTS "FK_prd_relations_prd_document_id"`);
    await queryRunner.query(`ALTER TABLE "prd_chunks" DROP CONSTRAINT IF EXISTS "FK_prd_chunks_project_id"`);
    await queryRunner.query(`ALTER TABLE "prd_chunks" DROP CONSTRAINT IF EXISTS "FK_prd_chunks_prd_document_id"`);
    await queryRunner.query(`ALTER TABLE "prd_documents" DROP CONSTRAINT IF EXISTS "FK_prd_documents_project_id"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "prd_relations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "prd_chunks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "prd_documents"`);

    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "active_prd_id"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "summary"`);
  }
}
