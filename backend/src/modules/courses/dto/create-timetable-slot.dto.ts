import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Length, Matches } from 'class-validator';
import { Weekday } from '../entities/timetable-slot.entity';
const WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
export class CreateTimetableSlotDto {
  @ApiProperty({ enum: WEEKDAYS })
  @IsIn(WEEKDAYS)
  day: Weekday;
  @ApiProperty({ example: '09:00', description: '24h HH:MM' })
  @Matches(TIME_PATTERN, { message: 'startTime must be in HH:MM 24h format' })
  startTime: string;
  @ApiProperty({ example: '11:00', description: '24h HH:MM' })
  @Matches(TIME_PATTERN, { message: 'endTime must be in HH:MM 24h format' })
  endTime: string;
  @ApiProperty({ example: 'LT1' })
  @IsString()
  @Length(1, 100)
  venue: string;
}
