import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PERMISSIONS } from '../../common/permissions';
import { AuthenticatedUser } from '../../common/types';
import { AcademicsService } from './academics.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AssignHodDto } from './dto/assign-hod.dto';
@ApiTags('Academics')
@Controller('academics')
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}
  @Get('faculties')
  @RequirePermissions(PERMISSIONS.ACADEMICS_MANAGE)
  @ApiOperation({ summary: 'List faculties' })
  listFaculties() {
    return this.academicsService.listFaculties();
  }
  @Post('faculties')
  @RequirePermissions(PERMISSIONS.ACADEMICS_MANAGE)
  @Audit({ action: 'academics.create_faculty', resourceType: 'faculty' })
  @ApiOperation({ summary: 'Create a faculty' })
  createFaculty(
    @Body()
    dto: CreateFacultyDto,
  ) {
    return this.academicsService.createFaculty(dto);
  }
  @Put('faculties/:id')
  @RequirePermissions(PERMISSIONS.ACADEMICS_MANAGE)
  @Audit({
    action: 'academics.update_faculty',
    resourceType: 'faculty',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: 'Update a faculty' })
  updateFaculty(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateFacultyDto,
  ) {
    return this.academicsService.updateFaculty(id, dto);
  }
  @Delete('faculties/:id')
  @RequirePermissions(PERMISSIONS.ACADEMICS_MANAGE)
  @Audit({
    action: 'academics.delete_faculty',
    resourceType: 'faculty',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: 'Delete a faculty (must have no departments)' })
  deleteFaculty(
    @Param('id')
    id: string,
  ) {
    return this.academicsService.deleteFaculty(id);
  }
  @Get('departments/me')
  @ApiOperation({
    summary:
      "Get the current user's own department (returns null if not an HOD of any department)",
  })
  getOwnDepartment(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.academicsService.getOwnDepartment(user.id);
  }
  @Get('departments')
  @RequirePermissions(PERMISSIONS.ACADEMICS_MANAGE)
  @ApiOperation({ summary: 'List departments, optionally filtered by faculty' })
  listDepartments(
    @Query('facultyId')
    facultyId?: string,
  ) {
    return this.academicsService.listDepartments(facultyId);
  }
  @Post('departments')
  @RequirePermissions(PERMISSIONS.ACADEMICS_MANAGE)
  @Audit({ action: 'academics.create_department', resourceType: 'department' })
  @ApiOperation({ summary: 'Create a department' })
  createDepartment(
    @Body()
    dto: CreateDepartmentDto,
  ) {
    return this.academicsService.createDepartment(dto);
  }
  @Put('departments/:id')
  @RequirePermissions(PERMISSIONS.ACADEMICS_MANAGE)
  @Audit({
    action: 'academics.update_department',
    resourceType: 'department',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: 'Update a department' })
  updateDepartment(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateDepartmentDto,
  ) {
    return this.academicsService.updateDepartment(id, dto);
  }
  @Delete('departments/:id')
  @RequirePermissions(PERMISSIONS.ACADEMICS_MANAGE)
  @Audit({
    action: 'academics.delete_department',
    resourceType: 'department',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: 'Delete a department (must have no students)' })
  deleteDepartment(
    @Param('id')
    id: string,
  ) {
    return this.academicsService.deleteDepartment(id);
  }
  @Put('departments/:id/hod')
  @RequirePermissions(PERMISSIONS.ACADEMICS_MANAGE)
  @Audit({
    action: 'academics.assign_hod',
    resourceType: 'department',
    resourceIdParam: 'id',
  })
  @ApiOperation({
    summary: 'Assign a department HOD (must hold the "hod" role)',
  })
  assignHod(
    @Param('id')
    id: string,
    @Body()
    dto: AssignHodDto,
  ) {
    return this.academicsService.assignHod(id, dto.userId);
  }
  @Delete('departments/:id/hod')
  @RequirePermissions(PERMISSIONS.ACADEMICS_MANAGE)
  @Audit({
    action: 'academics.clear_hod',
    resourceType: 'department',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: "Clear a department's HOD" })
  clearHod(
    @Param('id')
    id: string,
  ) {
    return this.academicsService.clearHod(id);
  }
}
