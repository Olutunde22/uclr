import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { PERMISSIONS } from '../../common/permissions';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpsertStudentProfileDto } from './dto/upsert-student-profile.dto';
import { UpsertStaffProfileDto } from './dto/upsert-staff-profile.dto';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  @RequirePermissions(PERMISSIONS.USERS_READ)
  @ApiOperation({ summary: 'List/search users' })
  list(
    @Query()
    query: ListUsersQueryDto,
  ) {
    return this.usersService.list(query);
  }
  @Get(':id')
  @RequirePermissions(PERMISSIONS.USERS_READ)
  @ApiOperation({ summary: 'Get a user, with profile if student/staff' })
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.usersService.findByIdWithProfile(id);
  }
  @Post()
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  @Audit({ action: 'users.create', resourceType: 'user' })
  @ApiOperation({ summary: 'Create a user account with role assignment' })
  create(
    @Body()
    dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }
  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  @Audit({
    action: 'users.update',
    resourceType: 'user',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: 'Update a user (name, phone, active, roles)' })
  update(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }
  @Put(':id/student-profile')
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  @Audit({
    action: 'users.upsert_student_profile',
    resourceType: 'student_profile',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: "Create or update a user's student profile" })
  upsertStudentProfile(
    @Param('id')
    id: string,
    @Body()
    dto: UpsertStudentProfileDto,
  ) {
    return this.usersService.upsertStudentProfile(id, dto);
  }
  @Put(':id/staff-profile')
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  @Audit({
    action: 'users.upsert_staff_profile',
    resourceType: 'staff_profile',
    resourceIdParam: 'id',
  })
  @ApiOperation({ summary: "Create or update a user's staff profile" })
  upsertStaffProfile(
    @Param('id')
    id: string,
    @Body()
    dto: UpsertStaffProfileDto,
  ) {
    return this.usersService.upsertStaffProfile(id, dto);
  }
}
