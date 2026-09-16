import { MigrationInterface, QueryRunner } from 'typeorm';
export class CalendarAndFees1789508473967 implements MigrationInterface {
  name = 'CalendarAndFees1789508473967';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "semesters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_id" uuid NOT NULL, "name" character varying NOT NULL, "registration_opens_at" TIMESTAMP WITH TIME ZONE, "registration_closes_at" TIMESTAMP WITH TIME ZONE, "add_drop_closes_at" TIMESTAMP WITH TIME ZONE, "is_current" boolean NOT NULL DEFAULT false, "locked_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_25c393e2e76b3e32e87a79b1dc2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c82f91dbf45fc3c1284791c200" ON "semesters" ("session_id", "name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "academic_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "is_current" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_5557c033f7a596c8ea80f741841" UNIQUE ("name"), CONSTRAINT "PK_8dba9ed9bef819af7a31769c04b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "fee_payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "student_id" uuid NOT NULL, "session_id" uuid NOT NULL, "amount" numeric(12,2) NOT NULL, "receipt_no" character varying NOT NULL, "payment_date" date NOT NULL, "recorded_by" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_d4d0548b4ba37af6e2585466d63" UNIQUE ("receipt_no"), CONSTRAINT "PK_9bd9fdfc57a96cadaefe822956d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "fee_clearances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "student_id" uuid NOT NULL, "session_id" uuid NOT NULL, "cleared" boolean NOT NULL DEFAULT false, "cleared_by" uuid, "cleared_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_22a88c47e61ef8d65a4add6b5cf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1e0af4978892deb927f9aa8540" ON "fee_clearances" ("student_id", "session_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "semesters" ADD CONSTRAINT "FK_a42cbef24942be4b4f41bffbc29" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_payments" ADD CONSTRAINT "FK_95be930f1a87918852588fa4ad2" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_payments" ADD CONSTRAINT "FK_c54631233cf29220c1f311ef6b9" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_payments" ADD CONSTRAINT "FK_db9dd46a17bafff5c5c38f512c7" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_clearances" ADD CONSTRAINT "FK_db5ef4cae45e6a0ae01c31a5181" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_clearances" ADD CONSTRAINT "FK_e532b8d9ae1d84e3f2e8d26ca79" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_clearances" ADD CONSTRAINT "FK_ca9fd6f59cd0e0528ae887eaed7" FOREIGN KEY ("cleared_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fee_clearances" DROP CONSTRAINT "FK_ca9fd6f59cd0e0528ae887eaed7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_clearances" DROP CONSTRAINT "FK_e532b8d9ae1d84e3f2e8d26ca79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_clearances" DROP CONSTRAINT "FK_db5ef4cae45e6a0ae01c31a5181"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_payments" DROP CONSTRAINT "FK_db9dd46a17bafff5c5c38f512c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_payments" DROP CONSTRAINT "FK_c54631233cf29220c1f311ef6b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_payments" DROP CONSTRAINT "FK_95be930f1a87918852588fa4ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "semesters" DROP CONSTRAINT "FK_a42cbef24942be4b4f41bffbc29"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1e0af4978892deb927f9aa8540"`,
    );
    await queryRunner.query(`DROP TABLE "fee_clearances"`);
    await queryRunner.query(`DROP TABLE "fee_payments"`);
    await queryRunner.query(`DROP TABLE "academic_sessions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c82f91dbf45fc3c1284791c200"`,
    );
    await queryRunner.query(`DROP TABLE "semesters"`);
  }
}
