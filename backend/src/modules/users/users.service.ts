import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Raw, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { StudentProfile } from './entities/student-profile.entity';
import { StaffProfile } from './entities/staff-profile.entity';
import { Role } from '../roles/entities/role.entity';
import { Department } from '../academics/entities/department.entity';
import { AuthenticatedUser, Paginated } from '../../common/types';
import { hashPassword } from '../../common/password';
import { sanitizeUser } from '../../common/sanitize-user';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpsertStudentProfileDto } from './dto/upsert-student-profile.dto';
import { UpsertStaffProfileDto } from './dto/upsert-staff-profile.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(StudentProfile)
    private readonly studentProfiles: Repository<StudentProfile>,
    @InjectRepository(StaffProfile)
    private readonly staffProfiles: Repository<StaffProfile>,
    @InjectRepository(Role)
    private readonly roles: Repository<Role>,
    @InjectRepository(Department)
    private readonly departments: Repository<Department>,
  ) {}
  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({
      where: {
        email: Raw((alias) => `LOWER(${alias}) = LOWER(:email)`, { email }),
      },
    });
  }
  private async findByMatricNo(matricNo: string): Promise<User | null> {
    const row = await this.users
      .createQueryBuilder('user')
      .select('user.id')
      .innerJoin(
        StudentProfile,
        'profile',
        'profile.user_id = user.id AND LOWER(profile.matric_no) = LOWER(:matricNo)',
        { matricNo },
      )
      .getOne();
    return row ? this.findById(row.id) : null;
  }
  private async findByStaffId(staffId: string): Promise<User | null> {
    const row = await this.users
      .createQueryBuilder('user')
      .select('user.id')
      .innerJoin(
        StaffProfile,
        'profile',
        'profile.user_id = user.id AND LOWER(profile.staff_id) = LOWER(:staffId)',
        { staffId },
      )
      .getOne();
    return row ? this.findById(row.id) : null;
  }
  async findByIdentifier(identifier: string): Promise<User | null> {
    const trimmed = identifier.trim();
    if (!trimmed) return null;
    if (trimmed.includes('@')) {
      return this.findByEmail(trimmed);
    }
    const byMatric = await this.findByMatricNo(trimmed);
    if (byMatric) return byMatric;
    return this.findByStaffId(trimmed);
  }
  findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }
  async findByIdWithProfile(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const [studentProfile, staffProfile] = await Promise.all([
      this.studentProfiles.findOne({
        where: { userId: id },
        relations: ['department', 'adviser'],
      }),
      this.staffProfiles.findOne({
        where: { userId: id },
        relations: ['department'],
      }),
    ]);
    if (studentProfile?.adviser) {
      studentProfile.adviser = sanitizeUser(studentProfile.adviser);
    }
    return sanitizeUser({
      ...user,
      studentProfile: studentProfile ?? undefined,
      staffProfile: staffProfile ?? undefined,
    });
  }
  hasRole(user: User, roleName: string): boolean {
    return (user.roles ?? []).some((r) => r.name === roleName);
  }
  toAuthenticatedUser(user: User): AuthenticatedUser {
    const roleNames = (user.roles ?? []).map((r) => r.name);
    const permissions = new Set<string>();
    for (const role of user.roles ?? []) {
      for (const perm of role.permissions ?? []) {
        permissions.add(perm.key);
      }
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: roleNames,
      permissions: [...permissions],
    };
  }
  async markLogin(id: string): Promise<void> {
    await this.users.update({ id }, { lastLoginAt: new Date() });
  }
  private async resolveRoles(names: string[]): Promise<Role[]> {
    const unique = [...new Set(names)];
    const found = await this.roles.find({
      where: unique.map((name) => ({ name })),
    });
    if (found.length !== unique.length) {
      const foundNames = new Set(found.map((r) => r.name));
      const missing = unique.filter((n) => !foundNames.has(n));
      throw new BadRequestException(`Unknown role(s): ${missing.join(', ')}`);
    }
    return found;
  }
  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    const roles = await this.resolveRoles(dto.roles);
    const user = this.users.create({
      email: dto.email.trim().toLowerCase(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      passwordHash: await hashPassword(dto.password),
      roles,
      isActive: true,
    });
    return sanitizeUser(await this.users.save(user));
  }
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.roles !== undefined) {
      user.roles = await this.resolveRoles(dto.roles);
    }
    return sanitizeUser(await this.users.save(user));
  }
  async list(query: ListUsersQueryDto): Promise<Paginated<User>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize =
      query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 200) : 25;
    const qb = this.users
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoin(
        StudentProfile,
        'studentProfile',
        'studentProfile.user_id = user.id',
      )
      .leftJoin(StaffProfile, 'staffProfile', 'staffProfile.user_id = user.id')
      .distinct(true);
    if (query.role) {
      qb.andWhere('role.name = :role', { role: query.role });
    }
    if (query.departmentId) {
      qb.andWhere(
        '(studentProfile.department_id = :deptId OR staffProfile.department_id = :deptId)',
        { deptId: query.departmentId },
      );
    }
    if (query.isActive !== undefined) {
      qb.andWhere('user.is_active = :isActive', { isActive: query.isActive });
    }
    if (query.search) {
      const term = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(user.first_name) LIKE :term', { term })
            .orWhere('LOWER(user.last_name) LIKE :term', { term })
            .orWhere('LOWER(user.email) LIKE :term', { term })
            .orWhere('LOWER(studentProfile.matric_no) LIKE :term', { term })
            .orWhere('LOWER(staffProfile.staff_id) LIKE :term', { term });
        }),
      );
    }
    const total = await qb.getCount();
    const rows = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    return { items: rows.map((r) => sanitizeUser(r)), total, page, pageSize };
  }
  private async getDepartmentOrThrow(id: string): Promise<Department> {
    const dept = await this.departments.findOne({ where: { id } });
    if (!dept) throw new BadRequestException('Department not found');
    return dept;
  }
  async upsertStudentProfile(
    userId: string,
    dto: UpsertStudentProfileDto,
  ): Promise<StudentProfile> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    await this.getDepartmentOrThrow(dto.departmentId);
    if (dto.adviserId) {
      const adviser = await this.findById(dto.adviserId);
      if (!adviser || !this.hasRole(adviser, 'academic_adviser')) {
        throw new BadRequestException(
          'Adviser must be a user with the "academic_adviser" role',
        );
      }
    }
    const existingByMatric = await this.studentProfiles.findOne({
      where: { matricNo: dto.matricNo },
    });
    if (existingByMatric && existingByMatric.userId !== userId) {
      throw new ConflictException('This matric no. is already in use');
    }
    let profile = await this.studentProfiles.findOne({ where: { userId } });
    if (!profile) {
      profile = this.studentProfiles.create({ userId });
    }
    profile.matricNo = dto.matricNo;
    profile.departmentId = dto.departmentId;
    profile.level = dto.level;
    profile.programme = dto.programme;
    profile.gender = dto.gender;
    profile.adviserId = dto.adviserId ?? null;
    return this.studentProfiles.save(profile);
  }
  async upsertStaffProfile(
    userId: string,
    dto: UpsertStaffProfileDto,
  ): Promise<StaffProfile> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (dto.departmentId) {
      await this.getDepartmentOrThrow(dto.departmentId);
    }
    const existingByStaffId = await this.staffProfiles.findOne({
      where: { staffId: dto.staffId },
    });
    if (existingByStaffId && existingByStaffId.userId !== userId) {
      throw new ConflictException('This staff ID is already in use');
    }
    let profile = await this.staffProfiles.findOne({ where: { userId } });
    if (!profile) {
      profile = this.staffProfiles.create({ userId });
    }
    profile.staffId = dto.staffId;
    profile.departmentId = dto.departmentId ?? null;
    profile.rank = dto.rank;
    return this.staffProfiles.save(profile);
  }
}
