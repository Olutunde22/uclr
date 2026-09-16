import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
export class FinaliseSemesterDto {
  @ApiProperty()
  @IsUUID()
  semesterId: string;
}
