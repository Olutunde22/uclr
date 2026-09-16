import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';
export class UpsertStudentProfileDto {
  @ApiProperty({ example: '190404001' })
  @IsString()
  @Length(1, 30)
  matricNo: string;
  @ApiProperty()
  @IsUUID()
  departmentId: string;
  @ApiProperty({ enum: [100, 200, 300, 400, 500] })
  @IsIn([100, 200, 300, 400, 500])
  level: number;
  @ApiProperty({ example: 'B.Sc. Computer Science' })
  @IsString()
  programme: string;
  @ApiProperty({ example: 'female' })
  @IsString()
  gender: string;
  @ApiProperty({
    required: false,
    description:
      'User id of the assigned academic adviser. Must hold the "academic_adviser" role.',
  })
  @IsOptional()
  @IsUUID()
  adviserId?: string | null;
}
