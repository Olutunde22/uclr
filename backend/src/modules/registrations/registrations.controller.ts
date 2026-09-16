import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PERMISSIONS } from '../../common/permissions';
import { AuthenticatedUser } from '../../common/types';
import { RegistrationsService } from './registrations.service';
import { SaveDraftDto } from './dto/save-draft.dto';
import { ValidateRegistrationDto } from './dto/validate-registration.dto';
import { SubmitRegistrationDto } from './dto/submit-registration.dto';
import { AddDropDto } from './dto/add-drop.dto';
@ApiTags('Registrations')
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}
  @Post('draft')
  @RequirePermissions(PERMISSIONS.REGISTRATIONS_SUBMIT)
  @Audit({ action: 'registrations.save_draft', resourceType: 'registration' })
  @ApiOperation({ summary: 'Save a draft registration for a semester' })
  saveDraft(
    @Body()
    dto: SaveDraftDto,
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.registrationsService.saveDraft(
      currentUser.id,
      dto.semesterId,
      dto.courseIds,
    );
  }
  @Post('validate')
  @RequirePermissions(PERMISSIONS.REGISTRATIONS_SUBMIT)
  @ApiOperation({
    summary: 'Live-check a candidate course selection without persisting it',
  })
  validate(
    @Body()
    dto: ValidateRegistrationDto,
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.registrationsService.validate(
      currentUser.id,
      dto.semesterId,
      dto.courseIds,
    );
  }
  @Post('submit')
  @RequirePermissions(PERMISSIONS.REGISTRATIONS_SUBMIT)
  @Audit({ action: 'registrations.submit', resourceType: 'registration' })
  @ApiOperation({
    summary: 'Submit the draft registration for adviser approval',
  })
  submit(
    @Body()
    dto: SubmitRegistrationDto,
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.registrationsService.submit(currentUser.id, dto.semesterId);
  }
  @Post('add-drop')
  @RequirePermissions(PERMISSIONS.REGISTRATIONS_SUBMIT)
  @Audit({ action: 'registrations.add_drop', resourceType: 'registration' })
  @ApiOperation({
    summary:
      'Add/drop courses on an approved registration, sending it back to pending_adviser',
  })
  addDrop(
    @Body()
    dto: AddDropDto,
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.registrationsService.addDrop(
      currentUser.id,
      dto.semesterId,
      dto.courseIds,
    );
  }
  @Get('me')
  @ApiOperation({
    summary:
      "Get the current student's own registration, courses and approval status for a semester (defaults to the current semester)",
  })
  getOwn(
    @CurrentUser()
    currentUser: AuthenticatedUser,
    @Query('semesterId')
    semesterId?: string,
  ) {
    return this.registrationsService.getOwn(currentUser.id, semesterId);
  }
}
