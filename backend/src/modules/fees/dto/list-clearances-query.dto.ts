import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
export class ListClearancesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sessionId?: string;
}
