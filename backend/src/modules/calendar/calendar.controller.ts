import { Body, Controller, Get, Param, Put, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { PERMISSIONS } from '../../common/permissions';
import { CalendarService } from './calendar.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { UpdateSemesterWindowsDto } from './dto/update-semester-windows.dto';
@ApiTags('Calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}
  @Get('sessions')
  @ApiOperation({
    summary:
      'List academic sessions (any authenticated user — reference data for dropdowns)',
  })
  listSessions() {
    return this.calendarService.listSessions();
  }
  @Post('sessions')
  @RequirePermissions(PERMISSIONS.CALENDAR_MANAGE)
  @Audit({
    action: 'calendar.create_session',
    resourceType: 'academic_session',
  })
  @ApiOperation({ summary: 'Create an academic session' })
  createSession(
    @Body()
    dto: CreateSessionDto,
  ) {
    return this.calendarService.createSession(dto);
  }
  @Put('sessions/:id')
  @RequirePermissions(PERMISSIONS.CALENDAR_MANAGE)
  @Audit({
    action: 'calendar.update_session',
    resourceType: 'academic_session',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: 'Update an academic session' })
  updateSession(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateSessionDto,
  ) {
    return this.calendarService.updateSession(id, dto);
  }
  @Put('sessions/:id/current')
  @RequirePermissions(PERMISSIONS.CALENDAR_MANAGE)
  @Audit({
    action: 'calendar.set_current_session',
    resourceType: 'academic_session',
    resourceIdParam: 'id',
  })
  @ApiOperation({
    summary: 'Mark a session current (clears the flag on every other session)',
  })
  setCurrentSession(
    @Param('id')
    id: string,
  ) {
    return this.calendarService.setCurrentSession(id);
  }
  @Get('semesters')
  @ApiOperation({
    summary:
      'List semesters, optionally filtered by session (any authenticated user — reference data for dropdowns)',
  })
  listSemesters(
    @Query('sessionId')
    sessionId?: string,
  ) {
    return this.calendarService.listSemesters(sessionId);
  }
  @Post('semesters')
  @RequirePermissions(PERMISSIONS.CALENDAR_MANAGE)
  @Audit({ action: 'calendar.create_semester', resourceType: 'semester' })
  @ApiOperation({ summary: 'Create a semester under a session' })
  createSemester(
    @Body()
    dto: CreateSemesterDto,
  ) {
    return this.calendarService.createSemester(dto);
  }
  @Put('semesters/:id')
  @RequirePermissions(PERMISSIONS.CALENDAR_MANAGE)
  @Audit({
    action: 'calendar.update_semester',
    resourceType: 'semester',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: 'Update a semester' })
  updateSemester(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateSemesterDto,
  ) {
    return this.calendarService.updateSemester(id, dto);
  }
  @Put('semesters/:id/windows')
  @RequirePermissions(PERMISSIONS.CALENDAR_MANAGE)
  @Audit({
    action: 'calendar.set_semester_windows',
    resourceType: 'semester',
    resourceIdParam: 'id',
  })
  @ApiOperation({
    summary: "Set a semester's registration and add/drop window timestamps",
  })
  setSemesterWindows(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateSemesterWindowsDto,
  ) {
    return this.calendarService.updateSemesterWindows(id, dto);
  }
  @Put('semesters/:id/current')
  @RequirePermissions(PERMISSIONS.CALENDAR_MANAGE)
  @Audit({
    action: 'calendar.set_current_semester',
    resourceType: 'semester',
    resourceIdParam: 'id',
  })
  @ApiOperation({
    summary:
      'Mark a semester current (clears the flag on every other semester, system-wide)',
  })
  setCurrentSemester(
    @Param('id')
    id: string,
  ) {
    return this.calendarService.setCurrentSemester(id);
  }
}
