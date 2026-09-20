import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1690000000000 implements MigrationInterface {
  name = 'InitialSchema1690000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "name" character varying(255),
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create workspaces table
    await queryRunner.query(`
      CREATE TABLE "workspaces" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "description" text,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_workspaces" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_workspaces_user_id" ON "workspaces" ("user_id")`);

    // Create projects table
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "workspace_id" uuid,
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "git_remote" character varying(500),
        "repository_url" character varying(500),
        "description" text,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_projects" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_projects_user_id" ON "projects" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_workspace_id" ON "projects" ("workspace_id")`);

    // Create memories table
    await queryRunner.query(`
      CREATE TABLE "memories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "workspace_id" uuid,
        "project_id" uuid,
        "scope" character varying NOT NULL DEFAULT 'global',
        "type" character varying NOT NULL DEFAULT 'note',
        "title" character varying(255),
        "content" text NOT NULL,
        "embedding" vector,
        "importance" smallint NOT NULL DEFAULT 5,
        "confidence" numeric(3,2) NOT NULL DEFAULT 1.0,
        "source" character varying(255),
        "source_client" character varying(255),
        "tags" jsonb NOT NULL DEFAULT '{}',
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "access_count" integer NOT NULL DEFAULT 0,
        "last_accessed_at" TIMESTAMP,
        "expires_at" TIMESTAMP,
        "is_archived" boolean NOT NULL DEFAULT false,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_memories" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_memories_user_id_scope" ON "memories" ("user_id", "scope")`);
    await queryRunner.query(`CREATE INDEX "IDX_memories_project_id_scope" ON "memories" ("project_id", "scope")`);
    await queryRunner.query(`CREATE INDEX "IDX_memories_type" ON "memories" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_memories_is_deleted" ON "memories" ("is_deleted")`);
    await queryRunner.query(`CREATE INDEX "IDX_memories_is_archived" ON "memories" ("is_archived")`);

    // Create memory_versions table
    await queryRunner.query(`
      CREATE TABLE "memory_versions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "memory_id" uuid NOT NULL,
        "version" integer NOT NULL,
        "content" text NOT NULL,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "changed_by" character varying(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_memory_versions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_memory_versions_memory_id" ON "memory_versions" ("memory_id")`);

    // Create api_keys table
    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "key_hash" character varying(255) NOT NULL,
        "prefix" character varying(16) NOT NULL,
        "permissions" jsonb NOT NULL DEFAULT '["memory:read", "memory:write"]',
        "last_used_at" TIMESTAMP,
        "expires_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "revoked_at" TIMESTAMP,
        CONSTRAINT "PK_api_keys" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_api_keys_user_id" ON "api_keys" ("user_id")`);

    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "event" character varying(100) NOT NULL,
        "actor" character varying(50),
        "client" character varying(255),
        "ip_address" character varying(45),
        "resource_type" character varying(100),
        "resource_id" uuid,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_user_id" ON "audit_logs" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_event" ON "audit_logs" ("event")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")`);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "workspaces"
      ADD CONSTRAINT "FK_workspaces_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "projects"
      ADD CONSTRAINT "FK_projects_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "projects"
      ADD CONSTRAINT "FK_projects_workspace_id"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "memories"
      ADD CONSTRAINT "FK_memories_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "memories"
      ADD CONSTRAINT "FK_memories_workspace_id"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "memories"
      ADD CONSTRAINT "FK_memories_project_id"
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "memory_versions"
      ADD CONSTRAINT "FK_memory_versions_memory_id"
      FOREIGN KEY ("memory_id") REFERENCES "memories"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "api_keys"
      ADD CONSTRAINT "FK_api_keys_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_keys" DROP CONSTRAINT "FK_api_keys_user_id"`);
    await queryRunner.query(`ALTER TABLE "memory_versions" DROP CONSTRAINT "FK_memory_versions_memory_id"`);
    await queryRunner.query(`ALTER TABLE "memories" DROP CONSTRAINT "FK_memories_project_id"`);
    await queryRunner.query(`ALTER TABLE "memories" DROP CONSTRAINT "FK_memories_workspace_id"`);
    await queryRunner.query(`ALTER TABLE "memories" DROP CONSTRAINT "FK_memories_user_id"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_projects_workspace_id"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_projects_user_id"`);
    await queryRunner.query(`ALTER TABLE "workspaces" DROP CONSTRAINT "FK_workspaces_user_id"`);

    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
    await queryRunner.query(`DROP TABLE "memory_versions"`);
    await queryRunner.query(`DROP TABLE "memories"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "workspaces"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
