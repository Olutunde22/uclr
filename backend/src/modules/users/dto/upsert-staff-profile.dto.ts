import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
export class UpsertStaffProfileDto {
  @ApiProperty({ example: 'STF-2024-001' })
  @IsString()
  @Length(1, 30)
  staffId: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  departmentId?: string | null;
  @ApiProperty({ example: 'Senior Lecturer' })
  @IsString()
  rank: string;
}
