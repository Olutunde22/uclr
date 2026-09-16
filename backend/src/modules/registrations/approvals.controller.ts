import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PERMISSIONS } from '../../common/permissions';
import { AuthenticatedUser } from '../../common/types';
import { RegistrationsService } from './registrations.service';
import { DecisionDto } from './dto/decision.dto';
@ApiTags('Approvals')
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly registrationsService: RegistrationsService) {}
  @Get('adviser-queue')
  @RequirePermissions(PERMISSIONS.APPROVALS_ADVISER)
  @ApiOperation({
    summary: "Registrations pending this adviser's decision",
  })
  adviserQueue(
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.registrationsService.adviserQueue(currentUser.id);
  }
  @Post(':id/adviser-decision')
  @RequirePermissions(PERMISSIONS.APPROVALS_ADVISER)
  @Audit({
    action: 'approvals.adviser_decide',
    resourceType: 'registration',
    resourceIdParam: 'id',
  })
  @ApiOperation({
    summary: "Approve or reject an advisee's registration",
  })
  adviserDecide(
    @Param('id')
    id: string,
    @Body()
    dto: DecisionDto,
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.registrationsService.adviserDecide(
      currentUser,
      id,
      dto.decision,
      dto.comment,
    );
  }
  @Get('hod-queue')
  @RequirePermissions(PERMISSIONS.APPROVALS_HOD)
  @ApiOperation({
    summary: "Registrations pending this HOD's decision, for their department",
  })
  hodQueue(
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.registrationsService.hodQueue(currentUser.id);
  }
  @Post(':id/hod-decision')
  @RequirePermissions(PERMISSIONS.APPROVALS_HOD)
  @Audit({
    action: 'approvals.hod_decide',
    resourceType: 'registration',
    resourceIdParam: 'id',
  })
  @ApiOperation({
    summary: 'Approve or reject a registration for the HOD department',
  })
  hodDecide(
    @Param('id')
    id: string,
    @Body()
    dto: DecisionDto,
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.registrationsService.hodDecide(
      currentUser,
      id,
      dto.decision,
      dto.comment,
    );
  }
}
