import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registration } from '../registrations/entities/registration.entity';
import { CourseResult } from '../courses/entities/course-result.entity';
import { StudentProfile } from '../users/entities/student-profile.entity';
import { RegistryRecord } from './entities/registry-record.entity';
import { RegistrationsModule } from '../registrations/registrations.module';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Registration,
      CourseResult,
      StudentProfile,
      RegistryRecord,
    ]),
    RegistrationsModule,
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [TypeOrmModule],
})
export class RecordsModule {}
