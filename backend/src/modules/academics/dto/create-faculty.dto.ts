import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
export class CreateFacultyDto {
  @ApiProperty({ example: 'SCI' })
  @IsString()
  @Length(1, 20)
  code: string;
  @ApiProperty({ example: 'Faculty of Science' })
  @IsString()
  @Length(1, 200)
  name: string;
}
