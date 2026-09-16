import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';
export class UpdateSessionDto {
  @ApiPropertyOptional({ example: '2025/2026' })
  @IsOptional()
  @Matches(/^\d{4}\/\d{4}$/, {
    message: 'name must look like "2025/2026"',
  })
  name?: string;
}
