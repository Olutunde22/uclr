import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
export class AddPrerequisiteDto {
  @ApiProperty({ description: 'Course id of the prerequisite course.' })
  @IsUUID()
  prerequisiteId: string;
}
