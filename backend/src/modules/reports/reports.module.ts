import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationCourse } from '../registrations/entities/registration-course.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { Department } from '../academics/entities/department.entity';
import { User } from '../users/entities/user.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegistrationCourse,
      Registration,
      Department,
      User,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
