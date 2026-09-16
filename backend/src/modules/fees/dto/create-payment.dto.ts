import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumberString, IsUUID, Length } from 'class-validator';
export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;
  @ApiProperty()
  @IsUUID()
  sessionId: string;
  @ApiProperty({
    example: '50000.00',
    description: 'Decimal amount, as a string',
  })
  @IsNumberString()
  amount: string;
  @ApiProperty({ example: 'RCPT-2025-00042' })
  @Length(1, 100)
  receiptNo: string;
  @ApiProperty({ example: '2025-09-15' })
  @IsDateString()
  paymentDate: string;
}
