import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity';
import { RegistrationCourse } from './entities/registration-course.entity';
import { Approval } from './entities/approval.entity';
import { Course } from '../courses/entities/course.entity';
import { CourseResult } from '../courses/entities/course-result.entity';
import { Semester } from '../calendar/entities/semester.entity';
import { FeeClearance } from '../fees/entities/fee-clearance.entity';
import { StudentProfile } from '../users/entities/student-profile.entity';
import { Department } from '../academics/entities/department.entity';
import { RegistryRecord } from '../records/entities/registry-record.entity';
import { RegistrationRulesService } from './registration-rules.service';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { ApprovalsController } from './approvals.controller';
import { SettingsModule } from '../settings/settings.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Registration,
      RegistrationCourse,
      Approval,
      Course,
      CourseResult,
      Semester,
      FeeClearance,
      StudentProfile,
      Department,
      RegistryRecord,
    ]),
    SettingsModule,
  ],
  controllers: [RegistrationsController, ApprovalsController],
  providers: [RegistrationRulesService, RegistrationsService],
  exports: [TypeOrmModule, RegistrationsService],
})
export class RegistrationsModule {}
