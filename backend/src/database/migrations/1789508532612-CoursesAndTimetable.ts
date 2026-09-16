import { MigrationInterface, QueryRunner } from 'typeorm';
export class CoursesAndTimetable1789508532612 implements MigrationInterface {
  name = 'CoursesAndTimetable1789508532612';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "timetable_slots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "course_id" uuid NOT NULL, "day" character varying NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "venue" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b2253a56b9d36d00f84aff7efcc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "department_id" uuid NOT NULL, "code" character varying NOT NULL, "title" character varying NOT NULL, "credit_units" integer NOT NULL, "level" integer NOT NULL, "semester" character varying NOT NULL, "capacity" integer NOT NULL, "lecturer_id" uuid, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_86b3589486bac01d2903e22471c" UNIQUE ("code"), CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_prerequisites" ("course_id" uuid NOT NULL, "prerequisite_id" uuid NOT NULL, CONSTRAINT "PK_706e83b86d0099af2e566fc8020" PRIMARY KEY ("course_id", "prerequisite_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2caff7cd02b6e0bb6f87a7b7ac" ON "course_prerequisites" ("course_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_62edaabbf461a782f824e98a60" ON "course_prerequisites" ("prerequisite_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "timetable_slots" ADD CONSTRAINT "FK_e66bfb0ec5e5c11c8fef4b7a6d4" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD CONSTRAINT "FK_b0a306ca76ad64906bf5082775f" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD CONSTRAINT "FK_667f9ddd37aab68ff127dca9de2" FOREIGN KEY ("lecturer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_prerequisites" ADD CONSTRAINT "FK_2caff7cd02b6e0bb6f87a7b7ac4" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_prerequisites" ADD CONSTRAINT "FK_62edaabbf461a782f824e98a602" FOREIGN KEY ("prerequisite_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_prerequisites" DROP CONSTRAINT "FK_62edaabbf461a782f824e98a602"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_prerequisites" DROP CONSTRAINT "FK_2caff7cd02b6e0bb6f87a7b7ac4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_667f9ddd37aab68ff127dca9de2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_b0a306ca76ad64906bf5082775f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetable_slots" DROP CONSTRAINT "FK_e66bfb0ec5e5c11c8fef4b7a6d4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_62edaabbf461a782f824e98a60"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2caff7cd02b6e0bb6f87a7b7ac"`,
    );
    await queryRunner.query(`DROP TABLE "course_prerequisites"`);
    await queryRunner.query(`DROP TABLE "courses"`);
    await queryRunner.query(`DROP TABLE "timetable_slots"`);
  }
}
