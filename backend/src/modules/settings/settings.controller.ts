import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { PERMISSIONS } from '../../common/permissions';
import { SettingsService } from './settings.service';
@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}
  @Get()
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'List system settings' })
  list() {
    return this.settingsService.findAll();
  }
  @Put(':key')
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  @Audit({
    action: 'settings.update',
    resourceType: 'system_setting',
    resourceIdParam: 'key',
  })
  @ApiOperation({ summary: 'Update a system setting' })
  update(
    @Param('key')
    key: string,
    @Body('value')
    value: string,
  ) {
    return this.settingsService.set(key, value);
  }
}
