import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/permissions';
import { AuditService } from './audit.service';
@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}
  @Get()
  @RequirePermissions(PERMISSIONS.AUDIT_READ)
  @ApiOperation({ summary: 'List audit log entries' })
  list(
    @Query('page')
    page?: string,
    @Query('pageSize')
    pageSize?: string,
    @Query('action')
    action?: string,
    @Query('resourceType')
    resourceType?: string,
  ) {
    return this.auditService.query({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      action,
      resourceType,
    });
  }
}
