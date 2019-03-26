import { MigrationInterface, QueryRunner } from "typeorm";

export class UsernameColumnCitext1553583643886 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "citext";');

    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`
    );

    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "username" TYPE citext`
    );

    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`
    );

    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "username" TYPE character varying`
    );

    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`
    );
  }
}
