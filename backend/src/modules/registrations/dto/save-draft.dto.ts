import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
export class SaveDraftDto {
  @ApiProperty()
  @IsUUID()
  semesterId: string;
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  courseIds: string[];
}
