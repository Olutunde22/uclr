import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './entities/faculty.entity';
import { Department } from './entities/department.entity';
import { AcademicsService } from './academics.service';
import { AcademicsController } from './academics.controller';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [TypeOrmModule.forFeature([Faculty, Department]), UsersModule],
  controllers: [AcademicsController],
  providers: [AcademicsService],
  exports: [TypeOrmModule],
})
export class AcademicsModule {}
