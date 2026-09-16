import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
export class UpdateCapacityDto {
  @ApiProperty({ example: 120 })
  @IsInt()
  @Min(1)
  capacity: number;
}
