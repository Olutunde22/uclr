import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';
export class UpdateSemesterWindowsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  registrationOpensAt?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  registrationClosesAt?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  addDropClosesAt?: string;
}
