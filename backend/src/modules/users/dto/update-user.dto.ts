import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;
  @ApiProperty({ required: false, description: 'Enable/disable the account.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @ApiProperty({
    required: false,
    description: "Replace the user's role assignment entirely, when provided.",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}
