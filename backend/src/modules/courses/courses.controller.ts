import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PERMISSIONS } from '../../common/permissions';
import { AuthenticatedUser } from '../../common/types';
import { toCsv } from '../../common/csv';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ListCoursesQueryDto } from './dto/list-courses-query.dto';
import { AssignLecturerDto } from './dto/assign-lecturer.dto';
import { AddPrerequisiteDto } from './dto/add-prerequisite.dto';
import { CreateTimetableSlotDto } from './dto/create-timetable-slot.dto';
import { UpdateTimetableSlotDto } from './dto/update-timetable-slot.dto';
import { UpdateCapacityDto } from './dto/update-capacity.dto';
@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}
  @Get('mine')
  @ApiOperation({ summary: 'List courses assigned to the current lecturer' })
  listMine(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.coursesService.listMine(user);
  }
  @Put('mine/:id/capacity')
  @Audit({
    action: 'courses.update_own_capacity',
    resourceType: 'course',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: "Update capacity of the lecturer's own course" })
  updateOwnCapacity(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
    @Body()
    dto: UpdateCapacityDto,
  ) {
    return this.coursesService.updateOwnCapacity(user, id, dto.capacity);
  }
  @Post('mine/:id/prerequisites')
  @Audit({
    action: 'courses.add_own_prerequisite',
    resourceType: 'course',
    resourceIdParam: 'id',
  })
  @ApiOperation({
    summary: "Add a prerequisite to the lecturer's own course",
  })
  addOwnPrerequisite(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
    @Body()
    dto: AddPrerequisiteDto,
  ) {
    return this.coursesService.addOwnPrerequisite(user, id, dto.prerequisiteId);
  }
  @Delete('mine/:id/prerequisites/:prerequisiteId')
  @Audit({
    action: 'courses.remove_own_prerequisite',
    resourceType: 'course',
    resourceIdParam: 'id',
  })
  @ApiOperation({
    summary: "Remove a prerequisite from the lecturer's own course",
  })
  removeOwnPrerequisite(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
    @Param('prerequisiteId')
    prerequisiteId: string,
  ) {
    return this.coursesService.removeOwnPrerequisite(user, id, prerequisiteId);
  }
  @Get(':id/class-list')
  @ApiOperation({
    summary:
      'Roster of students with an approved/finalised registration for this course in a semester',
  })
  classList(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
    @Query('semesterId')
    semesterId: string,
  ) {
    return this.coursesService.classList(user, id, semesterId);
  }
  @Get(':id/class-list/export')
  @ApiOperation({ summary: 'Class list as CSV' })
  async classListExport(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
    @Query('semesterId')
    semesterId: string,
    @Res()
    res: Response,
  ): Promise<void> {
    const rows = await this.coursesService.classList(user, id, semesterId);
    const csv = toCsv(rows, [
      { header: 'Matric No.', value: (r) => r.matricNo },
      { header: 'Name', value: (r) => r.name },
      { header: 'Level', value: (r) => r.level },
      { header: 'Programme', value: (r) => r.programme },
      { header: 'Department', value: (r) => r.department },
      { header: 'Registration status', value: (r) => r.registrationStatus },
    ]);
    res
      .set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="class-list.csv"',
      })
      .send(csv);
  }
  @Get()
  @RequirePermissions(PERMISSIONS.COURSES_READ)
  @ApiOperation({
    summary:
      'List courses, filterable by department, level, semester, is_active',
  })
  list(
    @Query()
    query: ListCoursesQueryDto,
  ) {
    return this.coursesService.list(query);
  }
  @Get(':id')
  @RequirePermissions(PERMISSIONS.COURSES_READ)
  @ApiOperation({
    summary: 'Get a course with prerequisites and timetable slots',
  })
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.coursesService.findOne(id);
  }
  @Post()
  @RequirePermissions(PERMISSIONS.COURSES_MANAGE)
  @Audit({ action: 'courses.create', resourceType: 'course' })
  @ApiOperation({ summary: 'Create a course' })
  create(
    @CurrentUser()
    user: AuthenticatedUser,
    @Body()
    dto: CreateCourseDto,
  ) {
    return this.coursesService.create(user, dto);
  }
  @Put(':id')
  @RequirePermissions(PERMISSIONS.COURSES_MANAGE)
  @Audit({
    action: 'courses.update',
    resourceType: 'course',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: 'Update a course (including toggling is_active)' })
  update(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
    @Body()
    dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(user, id, dto);
  }
  @Put(':id/lecturer')
  @RequirePermissions(PERMISSIONS.COURSES_MANAGE)
  @Audit({
    action: 'courses.assign_lecturer',
    resourceType: 'course',
    resourceIdParam: 'id',
  })
  @ApiOperation({
    summary: 'Assign a course lecturer (must hold the "lecturer" role)',
  })
  assignLecturer(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
    @Body()
    dto: AssignLecturerDto,
  ) {
    return this.coursesService.assignLecturer(user, id, dto.userId);
  }
  @Delete(':id/lecturer')
  @RequirePermissions(PERMISSIONS.COURSES_MANAGE)
  @Audit({
    action: 'courses.clear_lecturer',
    resourceType: 'course',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: "Clear a course's lecturer" })
  clearLecturer(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
  ) {
    return this.coursesService.clearLecturer(user, id);
  }
  @Post(':id/prerequisites')
  @RequirePermissions(PERMISSIONS.COURSES_MANAGE)
  @Audit({
    action: 'courses.add_prerequisite',
    resourceType: 'course',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: 'Add a prerequisite course' })
  addPrerequisite(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
    @Body()
    dto: AddPrerequisiteDto,
  ) {
    return this.coursesService.addPrerequisite(user, id, dto.prerequisiteId);
  }
  @Delete(':id/prerequisites/:prerequisiteId')
  @RequirePermissions(PERMISSIONS.COURSES_MANAGE)
  @Audit({
    action: 'courses.remove_prerequisite',
    resourceType: 'course',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: 'Remove a prerequisite course' })
  removePrerequisite(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
    @Param('prerequisiteId')
    prerequisiteId: string,
  ) {
    return this.coursesService.removePrerequisite(user, id, prerequisiteId);
  }
  @Post(':id/timetable-slots')
  @RequirePermissions(PERMISSIONS.COURSES_MANAGE)
  @Audit({
    action: 'courses.add_timetable_slot',
    resourceType: 'course',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: 'Add a timetable slot to a course' })
  addTimetableSlot(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
    @Body()
    dto: CreateTimetableSlotDto,
  ) {
    return this.coursesService.addTimetableSlot(user, id, dto);
  }
  @Put(':id/timetable-slots/:slotId')
  @RequirePermissions(PERMISSIONS.COURSES_MANAGE)
  @Audit({
    action: 'courses.update_timetable_slot',
    resourceType: 'course',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: "Update a course's timetable slot" })
  updateTimetableSlot(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
    @Param('slotId')
    slotId: string,
    @Body()
    dto: UpdateTimetableSlotDto,
  ) {
    return this.coursesService.updateTimetableSlot(user, id, slotId, dto);
  }
  @Delete(':id/timetable-slots/:slotId')
  @RequirePermissions(PERMISSIONS.COURSES_MANAGE)
  @Audit({
    action: 'courses.remove_timetable_slot',
    resourceType: 'course',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: "Remove a course's timetable slot" })
  removeTimetableSlot(
    @CurrentUser()
    user: AuthenticatedUser,
    @Param('id')
    id: string,
    @Param('slotId')
    slotId: string,
  ) {
    return this.coursesService.removeTimetableSlot(user, id, slotId);
  }
}
