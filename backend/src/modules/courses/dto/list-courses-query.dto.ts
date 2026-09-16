import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsUUID } from 'class-validator';
import { CourseSemester } from '../entities/course.entity';
export class ListCoursesQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  departmentId?: string;
  @ApiProperty({ required: false, enum: [100, 200, 300, 400, 500] })
  @IsOptional()
  @IsIn([100, 200, 300, 400, 500])
  @Transform(({ value }) => (value === undefined ? value : Number(value)))
  level?: number;
  @ApiProperty({ required: false, enum: ['first', 'second'] })
  @IsOptional()
  @IsIn(['first', 'second'])
  semester?: CourseSemester;
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
