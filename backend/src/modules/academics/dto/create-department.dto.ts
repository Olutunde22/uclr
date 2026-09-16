import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';
export class CreateDepartmentDto {
  @ApiProperty()
  @IsUUID()
  facultyId: string;
  @ApiProperty({ example: 'CSC' })
  @IsString()
  @Length(1, 20)
  code: string;
  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @Length(1, 200)
  name: string;
}
