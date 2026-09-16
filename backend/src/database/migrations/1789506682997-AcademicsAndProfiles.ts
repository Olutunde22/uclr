import { MigrationInterface, QueryRunner } from 'typeorm';
export class AcademicsAndProfiles1789506682997 implements MigrationInterface {
  name = 'AcademicsAndProfiles1789506682997';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "faculties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f1b2cd43a96c6fb75c8ad44de88" UNIQUE ("code"), CONSTRAINT "PK_fd83e4a09c7182ccf7bdb3770b9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "faculty_id" uuid NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "hod_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_91fddbe23e927e1e525c152baa3" UNIQUE ("code"), CONSTRAINT "UQ_e23b53ba71d839edcd7f7a527c3" UNIQUE ("hod_id"), CONSTRAINT "REL_e23b53ba71d839edcd7f7a527c" UNIQUE ("hod_id"), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "student_profiles" ("user_id" uuid NOT NULL, "matric_no" character varying NOT NULL, "department_id" uuid NOT NULL, "level" integer NOT NULL, "programme" character varying NOT NULL, "gender" character varying NOT NULL, "adviser_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e6a1667b833f847f17e7c43abdd" UNIQUE ("matric_no"), CONSTRAINT "PK_cef016a0d95e26ae7c0f167ec28" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_profiles" ("user_id" uuid NOT NULL, "staff_id" character varying NOT NULL, "department_id" uuid, "rank" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_4f32f1a897f75bafed4199fb0bf" UNIQUE ("staff_id"), CONSTRAINT "PK_223deb3f390b28562fad70eefed" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_db9cbab5eb895126fc1689dc2ad" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_e23b53ba71d839edcd7f7a527c3" FOREIGN KEY ("hod_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" ADD CONSTRAINT "FK_cef016a0d95e26ae7c0f167ec28" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" ADD CONSTRAINT "FK_e972e1ee34be4748a288067c315" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" ADD CONSTRAINT "FK_1ea3b41465cc376fd7138ae144a" FOREIGN KEY ("adviser_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_profiles" ADD CONSTRAINT "FK_223deb3f390b28562fad70eefed" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_profiles" ADD CONSTRAINT "FK_8abd0fe4e204030245251fb5fc8" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "staff_profiles" DROP CONSTRAINT "FK_8abd0fe4e204030245251fb5fc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_profiles" DROP CONSTRAINT "FK_223deb3f390b28562fad70eefed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" DROP CONSTRAINT "FK_1ea3b41465cc376fd7138ae144a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" DROP CONSTRAINT "FK_e972e1ee34be4748a288067c315"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" DROP CONSTRAINT "FK_cef016a0d95e26ae7c0f167ec28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_e23b53ba71d839edcd7f7a527c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_db9cbab5eb895126fc1689dc2ad"`,
    );
    await queryRunner.query(`DROP TABLE "staff_profiles"`);
    await queryRunner.query(`DROP TABLE "student_profiles"`);
    await queryRunner.query(`DROP TABLE "departments"`);
    await queryRunner.query(`DROP TABLE "faculties"`);
  }
}
