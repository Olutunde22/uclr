import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { CourseSemester } from '../entities/course.entity';
export class CreateCourseDto {
  @ApiProperty()
  @IsUUID()
  departmentId: string;
  @ApiProperty({ example: 'CSC301' })
  @IsString()
  @Length(1, 20)
  code: string;
  @ApiProperty({ example: 'Data Structures and Algorithms' })
  @IsString()
  @Length(1, 200)
  title: string;
  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  creditUnits: number;
  @ApiProperty({ enum: [100, 200, 300, 400, 500] })
  @IsIn([100, 200, 300, 400, 500])
  level: number;
  @ApiProperty({ enum: ['first', 'second'] })
  @IsIn(['first', 'second'])
  semester: CourseSemester;
  @ApiProperty({ example: 120 })
  @IsInt()
  @Min(1)
  capacity: number;
  @ApiProperty({
    required: false,
    description:
      'User id of the assigned lecturer. Must hold the "lecturer" role.',
  })
  @IsOptional()
  @IsUUID()
  lecturerId?: string | null;
}
