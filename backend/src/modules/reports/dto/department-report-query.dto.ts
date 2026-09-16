import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
export class DepartmentReportQueryDto {
  @ApiProperty()
  @IsUUID()
  semesterId: string;
  @ApiProperty({
    required: false,
    description:
      'Required for system_admin (which department to report on); ignored for a HOD, whose own department is always used',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
