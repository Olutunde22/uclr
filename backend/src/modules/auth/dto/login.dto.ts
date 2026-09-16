import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MinLength } from 'class-validator';
export class LoginDto {
  @ApiProperty({
    description:
      'Login identifier: email if it contains "@", otherwise matric no., then staff ID.',
    example: 'student@ulcrs.local',
  })
  @IsString()
  @Length(1, 254)
  email: string;
  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @MinLength(1)
  password: string;
}
