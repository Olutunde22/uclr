import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { TimetableSlot } from './entities/timetable-slot.entity';
import { CourseResult } from './entities/course-result.entity';
import { Department } from '../academics/entities/department.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { StudentProfile } from '../users/entities/student-profile.entity';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      TimetableSlot,
      CourseResult,
      Department,
      Registration,
      StudentProfile,
    ]),
    UsersModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [TypeOrmModule],
})
export class CoursesModule {}
