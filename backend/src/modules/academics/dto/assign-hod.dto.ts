import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
export class AssignHodDto {
  @ApiProperty({
    description: 'User id of the incoming HOD. Must hold the "hod" role.',
  })
  @IsUUID()
  userId: string;
}
