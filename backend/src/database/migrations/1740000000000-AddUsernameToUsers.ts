import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameToUsers1740000000000 implements MigrationInterface {
  name = 'AddUsernameToUsers1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
          ALTER TABLE "users" ADD "username" character varying(255);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'UQ_users_username') THEN
          CREATE UNIQUE INDEX "UQ_users_username" ON "users" ("username");
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."UQ_users_username"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "username"`);
  }
}
