import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PERMISSIONS } from '../../common/permissions';
import { AuthenticatedUser } from '../../common/types';
import { toCsv } from '../../common/csv';
import { ReportsService, DepartmentReportCourseRow } from './reports.service';
import { DepartmentReportQueryDto } from './dto/department-report-query.dto';
import { SystemReportQueryDto } from './dto/system-report-query.dto';
@ApiTags('Reports')
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
  @Get('department/report')
  @RequirePermissions(PERMISSIONS.REPORTS_READ)
  @ApiOperation({
    summary:
      "Registration health report for the caller's department (HOD) or a chosen department (system_admin): counts by course, level and status",
  })
  departmentReport(
    @CurrentUser()
    user: AuthenticatedUser,
    @Query()
    query: DepartmentReportQueryDto,
  ) {
    return this.reportsService.departmentReport(
      user,
      query.semesterId,
      query.departmentId,
    );
  }
  @Get('department/report/export')
  @RequirePermissions(PERMISSIONS.REPORTS_READ)
  @ApiOperation({ summary: 'Department report as CSV, one row per course' })
  async departmentReportExport(
    @CurrentUser()
    user: AuthenticatedUser,
    @Query()
    query: DepartmentReportQueryDto,
    @Res()
    res: Response,
  ): Promise<void> {
    const report = await this.reportsService.departmentReport(
      user,
      query.semesterId,
      query.departmentId,
    );
    const csv = toCsv<DepartmentReportCourseRow>(report.courses, [
      { header: 'Course code', value: (r) => r.code },
      { header: 'Course title', value: (r) => r.title },
      { header: 'Level', value: (r) => r.level },
      { header: 'Draft', value: (r) => r.counts.draft },
      { header: 'Pending adviser', value: (r) => r.counts.pending_adviser },
      { header: 'Pending HOD', value: (r) => r.counts.pending_hod },
      { header: 'Approved', value: (r) => r.counts.approved },
      { header: 'Rejected', value: (r) => r.counts.rejected },
      { header: 'Finalised', value: (r) => r.counts.finalised },
      { header: 'Total', value: (r) => r.total },
    ]);
    res
      .set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="department-report.csv"',
      })
      .send(csv);
  }
  @Get('admin/reports')
  @RequirePermissions(PERMISSIONS.REPORTS_READ)
  @ApiOperation({
    summary:
      'System-wide report for the ICT admin: login totals (from users.last_login_at) and registration totals by status',
  })
  systemReport(
    @CurrentUser()
    user: AuthenticatedUser,
    @Query()
    query: SystemReportQueryDto,
  ) {
    return this.reportsService.systemReport(user, query.semesterId);
  }
}
