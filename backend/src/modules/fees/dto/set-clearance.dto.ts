import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
export class SetClearanceDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;
  @ApiProperty()
  @IsUUID()
  sessionId: string;
}
