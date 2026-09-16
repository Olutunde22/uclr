import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import { SemesterName } from '../entities/semester.entity';
export class CreateSemesterDto {
  @ApiProperty()
  @IsUUID()
  sessionId: string;
  @ApiProperty({ enum: ['first', 'second'] })
  @IsIn(['first', 'second'])
  name: SemesterName;
}
