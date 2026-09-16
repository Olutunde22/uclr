import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PERMISSIONS } from '../../common/permissions';
import { AuthenticatedUser } from '../../common/types';
import { toCsv } from '../../common/csv';
import { RecordsService, RecordRow } from './records.service';
import { FinaliseSemesterDto } from './dto/finalise-semester.dto';
import { ListRecordsQueryDto } from './dto/list-records-query.dto';
@ApiTags('Records')
@Controller()
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}
  @Post('records/finalise')
  @RequirePermissions(PERMISSIONS.RECORDS_FINALISE)
  @Audit({ action: 'records.finalise_semester', resourceType: 'semester' })
  @ApiOperation({
    summary:
      'Finalise and lock a semester: approved registrations become finalised, everything else pending is reported as outstanding',
  })
  finalise(
    @Body()
    dto: FinaliseSemesterDto,
    @CurrentUser()
    currentUser: AuthenticatedUser,
  ) {
    return this.recordsService.finaliseSemester(currentUser.id, dto.semesterId);
  }
  @Get('records')
  @RequirePermissions(PERMISSIONS.RECORDS_READ)
  @ApiOperation({
    summary:
      'Final registered list for a semester: approved and/or finalised registrations with student and course details',
  })
  list(
    @Query()
    query: ListRecordsQueryDto,
  ) {
    return this.recordsService.listFinal(query.semesterId, query.status);
  }
  @Get('records/export')
  @RequirePermissions(PERMISSIONS.RECORDS_READ)
  @ApiOperation({ summary: 'Final registered list as CSV, one row per course' })
  async export(
    @Query()
    query: ListRecordsQueryDto,
    @Res()
    res: Response,
  ): Promise<void> {
    const rows = await this.recordsService.listFinal(
      query.semesterId,
      query.status,
    );
    const flat: (RecordRow & {
      course: RecordRow['courses'][number];
    })[] = [];
    for (const row of rows) {
      for (const course of row.courses) {
        flat.push({ ...row, course });
      }
    }
    const csv = toCsv(flat, [
      { header: 'Matric No.', value: (r) => r.matricNo },
      { header: 'Student name', value: (r) => r.studentName },
      { header: 'Department', value: (r) => r.department },
      { header: 'Level', value: (r) => r.level },
      { header: 'Programme', value: (r) => r.programme },
      { header: 'Course code', value: (r) => r.course.code },
      { header: 'Course title', value: (r) => r.course.title },
      { header: 'Credit units', value: (r) => r.course.creditUnits },
      { header: 'Status', value: (r) => r.status },
    ]);
    res
      .set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="records.csv"',
      })
      .send(csv);
  }
  @Get('records/transcripts/:studentId')
  @RequirePermissions(PERMISSIONS.RECORDS_READ)
  @ApiOperation({
    summary:
      "A student's transcript: all course_results rows and a computed GPA (5-point scale)",
  })
  transcript(
    @Param('studentId')
    studentId: string,
  ) {
    return this.recordsService.transcript(studentId);
  }
}
