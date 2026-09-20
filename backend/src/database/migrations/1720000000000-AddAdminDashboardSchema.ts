import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminDashboardSchema1720000000000 implements MigrationInterface {
  name = 'AddAdminDashboardSchema1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add role and password_hash to users (idempotent)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
          CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
          ALTER TABLE "users" ADD "password_hash" character varying(255);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
          ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'user';
        END IF;
      END $$;
    `);

    // Add session_id to memories (idempotent)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'session_id') THEN
          ALTER TABLE "memories" ADD "session_id" character varying(255);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_memories_session_id') THEN
          CREATE INDEX "IDX_memories_session_id" ON "memories" ("session_id");
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_memories_session_id"`);
    await queryRunner.query(`ALTER TABLE "memories" DROP COLUMN IF EXISTS "session_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "password_hash"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}
