import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
export class ListRecordsQueryDto {
  @ApiProperty()
  @IsUUID()
  semesterId: string;
  @ApiProperty({
    required: false,
    enum: ['approved', 'finalised'],
    description: 'Defaults to both approved and finalised',
  })
  @IsOptional()
  @IsIn(['approved', 'finalised'])
  status?: 'approved' | 'finalised';
}
