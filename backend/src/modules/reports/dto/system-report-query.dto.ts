import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
export class SystemReportQueryDto {
  @ApiProperty({
    required: false,
    description: 'Restrict registration totals to one semester; omit for all',
  })
  @IsOptional()
  @IsUUID()
  semesterId?: string;
}
