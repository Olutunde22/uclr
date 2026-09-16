import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';
export class DecisionDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsIn(['approved', 'rejected'])
  decision: 'approved' | 'rejected';
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  comment?: string;
}
