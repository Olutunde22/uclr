import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
export class AssignLecturerDto {
  @ApiProperty({
    description:
      'User id of the incoming lecturer. Must hold the "lecturer" role.',
  })
  @IsUUID()
  userId: string;
}
