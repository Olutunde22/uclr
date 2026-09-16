import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
export class ListUsersQueryDto {
  @ApiPropertyOptional({ description: 'Filter by role name, e.g. "student".' })
  @IsOptional()
  @IsString()
  role?: string;
  @ApiPropertyOptional({
    description: 'Filter by department id (via student or staff profile).',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
  @ApiPropertyOptional({
    description: 'Search by name, email, matric no. or staff ID.',
  })
  @IsOptional()
  @IsString()
  search?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
