import { MigrationInterface, QueryRunner } from 'typeorm';
export class RegistryRecords1789510639288 implements MigrationInterface {
  name = 'RegistryRecords1789510639288';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "registry_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "registration_id" uuid NOT NULL, "recorded_by" uuid NOT NULL, "recorded_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_9dfc792206595fa93964d194919" UNIQUE ("registration_id"), CONSTRAINT "REL_9dfc792206595fa93964d19491" UNIQUE ("registration_id"), CONSTRAINT "PK_8119e3c0b9679132fb0e2b20da1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "registry_records" ADD CONSTRAINT "FK_9dfc792206595fa93964d194919" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "registry_records" ADD CONSTRAINT "FK_6f18f453d39687da6586997dab7" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "registry_records" DROP CONSTRAINT "FK_6f18f453d39687da6586997dab7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "registry_records" DROP CONSTRAINT "FK_9dfc792206595fa93964d194919"`,
    );
    await queryRunner.query(`DROP TABLE "registry_records"`);
  }
}
