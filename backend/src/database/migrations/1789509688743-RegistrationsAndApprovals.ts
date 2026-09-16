import { MigrationInterface, QueryRunner } from 'typeorm';
export class RegistrationsAndApprovals1789509688743 implements MigrationInterface {
  name = 'RegistrationsAndApprovals1789509688743';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "course_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "student_id" uuid NOT NULL, "course_id" uuid NOT NULL, "session_id" uuid NOT NULL, "score" numeric NOT NULL, "grade" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_40df244272069607bcbd611e513" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_32791b31d4c8d865f4b5feebb2" ON "course_results" ("student_id", "course_id", "session_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "registration_courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "registration_id" uuid NOT NULL, "course_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f643dbebf95028a94859d79fdaa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a47d286603181f917a94228f27" ON "registration_courses" ("registration_id", "course_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "approvals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "registration_id" uuid NOT NULL, "adviser_id" uuid NOT NULL, "adviser_status" character varying NOT NULL DEFAULT 'pending', "adviser_comment" text, "adviser_decided_at" TIMESTAMP WITH TIME ZONE, "hod_id" uuid, "hod_status" character varying NOT NULL DEFAULT 'pending', "hod_comment" text, "hod_decided_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_8beb7d758f01a5d4337d89ec41c" UNIQUE ("registration_id"), CONSTRAINT "REL_8beb7d758f01a5d4337d89ec41" UNIQUE ("registration_id"), CONSTRAINT "PK_690417aaefa84d18b1a59e2a499" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "registrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "student_id" uuid NOT NULL, "semester_id" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'draft', "total_units" integer NOT NULL DEFAULT '0', "submitted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6013e724d7b22929da9cd7282d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ff85a352cfa2ed8cb5f58d87c8" ON "registrations" ("student_id", "semester_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "course_results" ADD CONSTRAINT "FK_995bd226231f510089bc8f54cf3" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_results" ADD CONSTRAINT "FK_9ec1a8e40b2626a9aeea210941a" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_results" ADD CONSTRAINT "FK_62771b7f1254dd71ba6ec9c9ba5" FOREIGN KEY ("session_id") REFERENCES "academic_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "registration_courses" ADD CONSTRAINT "FK_4c0642bbdc810ff7bbd2aa217cf" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "registration_courses" ADD CONSTRAINT "FK_bf3c4f171a509a201f76192566f" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals" ADD CONSTRAINT "FK_8beb7d758f01a5d4337d89ec41c" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals" ADD CONSTRAINT "FK_936d9c7b712b1f570058909e053" FOREIGN KEY ("adviser_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals" ADD CONSTRAINT "FK_69baff7df1108ca792e8791d174" FOREIGN KEY ("hod_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "registrations" ADD CONSTRAINT "FK_a42df5f11116b3a8db20c0c6392" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "registrations" ADD CONSTRAINT "FK_3a885faf487d4632f6da7e20e15" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "registrations" DROP CONSTRAINT "FK_3a885faf487d4632f6da7e20e15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "registrations" DROP CONSTRAINT "FK_a42df5f11116b3a8db20c0c6392"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals" DROP CONSTRAINT "FK_69baff7df1108ca792e8791d174"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals" DROP CONSTRAINT "FK_936d9c7b712b1f570058909e053"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals" DROP CONSTRAINT "FK_8beb7d758f01a5d4337d89ec41c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "registration_courses" DROP CONSTRAINT "FK_bf3c4f171a509a201f76192566f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "registration_courses" DROP CONSTRAINT "FK_4c0642bbdc810ff7bbd2aa217cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_results" DROP CONSTRAINT "FK_62771b7f1254dd71ba6ec9c9ba5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_results" DROP CONSTRAINT "FK_9ec1a8e40b2626a9aeea210941a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_results" DROP CONSTRAINT "FK_995bd226231f510089bc8f54cf3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff85a352cfa2ed8cb5f58d87c8"`,
    );
    await queryRunner.query(`DROP TABLE "registrations"`);
    await queryRunner.query(`DROP TABLE "approvals"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a47d286603181f917a94228f27"`,
    );
    await queryRunner.query(`DROP TABLE "registration_courses"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_32791b31d4c8d865f4b5feebb2"`,
    );
    await queryRunner.query(`DROP TABLE "course_results"`);
  }
}
