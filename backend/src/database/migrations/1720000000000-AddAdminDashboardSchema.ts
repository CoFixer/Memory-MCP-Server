import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminDashboardSchema1720000000000 implements MigrationInterface {
  name = 'AddAdminDashboardSchema1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add role and password_hash to users
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')`);
    await queryRunner.query(`ALTER TABLE "users" ADD "password_hash" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'user'`);

    // Add session_id to memories
    await queryRunner.query(`ALTER TABLE "memories" ADD "session_id" character varying(255)`);
    await queryRunner.query(`CREATE INDEX "IDX_memories_session_id" ON "memories" ("session_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_memories_session_id"`);
    await queryRunner.query(`ALTER TABLE "memories" DROP COLUMN "session_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
