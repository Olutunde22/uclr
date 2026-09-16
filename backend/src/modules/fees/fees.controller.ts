import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PERMISSIONS } from '../../common/permissions';
import { AuthenticatedUser } from '../../common/types';
import { FeesService } from './fees.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsQueryDto } from './dto/list-payments-query.dto';
import { ListClearancesQueryDto } from './dto/list-clearances-query.dto';
import { SetClearanceDto } from './dto/set-clearance.dto';
@ApiTags('Fees')
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}
  @Post('payments')
  @RequirePermissions(PERMISSIONS.FEES_MANAGE)
  @Audit({ action: 'fees.record_payment', resourceType: 'fee_payment' })
  @ApiOperation({ summary: "Record a student's fee payment for a session" })
  recordPayment(
    @Body()
    dto: CreatePaymentDto,
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.feesService.recordPayment(dto, currentUser.id);
  }
  @Get('payments')
  @RequirePermissions(PERMISSIONS.FEES_MANAGE)
  @ApiOperation({
    summary: 'List fee payments, optionally filtered by student and/or session',
  })
  listPayments(
    @Query()
    query: ListPaymentsQueryDto,
  ) {
    return this.feesService.listPayments(query);
  }
  @Get('clearances')
  @RequirePermissions(PERMISSIONS.FEES_MANAGE)
  @ApiOperation({
    summary:
      'List fee clearance records, optionally filtered by student and/or session',
  })
  listClearances(
    @Query()
    query: ListClearancesQueryDto,
  ) {
    return this.feesService.listClearances(query);
  }
  @Put('clearances')
  @RequirePermissions(PERMISSIONS.FEES_MANAGE)
  @Audit({ action: 'fees.issue_clearance', resourceType: 'fee_clearance' })
  @ApiOperation({ summary: 'Issue fee clearance for a student and session' })
  issueClearance(
    @Body()
    dto: SetClearanceDto,
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.feesService.issueClearance(dto, currentUser.id);
  }
  @Put('clearances/revoke')
  @RequirePermissions(PERMISSIONS.FEES_MANAGE)
  @Audit({ action: 'fees.revoke_clearance', resourceType: 'fee_clearance' })
  @ApiOperation({ summary: "Revoke a student's fee clearance" })
  revokeClearance(
    @Body()
    dto: SetClearanceDto,
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.feesService.revokeClearance(dto, currentUser.id);
  }
  @Get('me')
  @ApiOperation({
    summary: "Get the current user's own fee clearance and payment history",
  })
  getOwnFeeStatus(
    @CurrentUser()
    currentUser: AuthenticatedUser,
    @Query('sessionId')
    sessionId?: string,
  ) {
    return this.feesService.getOwnFeeStatus(currentUser, sessionId);
  }
}
