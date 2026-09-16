import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicSession } from './entities/academic-session.entity';
import { Semester } from './entities/semester.entity';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
@Module({
  imports: [TypeOrmModule.forFeature([AcademicSession, Semester])],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [TypeOrmModule],
})
export class CalendarModule {}
