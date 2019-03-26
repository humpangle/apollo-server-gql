import { MigrationInterface, QueryRunner } from "typeorm";

export class UserFirstLastNamesNullable1553585509629
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "first_name" DROP NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "last_name" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL`
    );
  }
}
