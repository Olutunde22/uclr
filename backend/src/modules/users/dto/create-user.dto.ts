import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
export class CreateUserDto {
  @ApiProperty({ example: 'jane.doe@ulcrs.local' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @MinLength(8)
  password: string;
  @ApiProperty({ example: 'Jane' })
  @IsString()
  firstName: string;
  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;
  @ApiProperty({ required: false, example: '+2348012345678' })
  @IsOptional()
  @IsString()
  phone?: string;
  @ApiProperty({
    description:
      'Role names to assign, e.g. ["student"], ["academic_adviser", "lecturer"].',
    example: ['student'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  roles: string[];
}
