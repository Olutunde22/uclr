import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
export class SubmitRegistrationDto {
  @ApiProperty()
  @IsUUID()
  semesterId: string;
}
