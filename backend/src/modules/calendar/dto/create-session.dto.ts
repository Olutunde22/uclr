import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
export class CreateSessionDto {
  @ApiProperty({ example: '2025/2026' })
  @Matches(/^\d{4}\/\d{4}$/, {
    message: 'name must look like "2025/2026"',
  })
  name: string;
}
