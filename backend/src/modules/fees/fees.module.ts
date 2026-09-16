import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeePayment } from './entities/fee-payment.entity';
import { FeeClearance } from './entities/fee-clearance.entity';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';
import { UsersModule } from '../users/users.module';
import { CalendarModule } from '../calendar/calendar.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([FeePayment, FeeClearance]),
    UsersModule,
    CalendarModule,
  ],
  controllers: [FeesController],
  providers: [FeesService],
  exports: [TypeOrmModule],
})
export class FeesModule {}
