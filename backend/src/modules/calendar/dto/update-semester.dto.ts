import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { SemesterName } from '../entities/semester.entity';
export class UpdateSemesterDto {
  @ApiPropertyOptional({ enum: ['first', 'second'] })
  @IsOptional()
  @IsIn(['first', 'second'])
  name?: SemesterName;
}
