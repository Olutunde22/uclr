import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Faculty } from './entities/faculty.entity';
import { Department } from './entities/department.entity';
import { UsersService } from '../users/users.service';
import { sanitizeUser } from '../../common/sanitize-user';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
const FK_VIOLATION = '23503';
@Injectable()
export class AcademicsService {
  constructor(
    @InjectRepository(Faculty)
    private readonly faculties: Repository<Faculty>,
    @InjectRepository(Department)
    private readonly departments: Repository<Department>,
    private readonly usersService: UsersService,
  ) {}
  listFaculties(): Promise<Faculty[]> {
    return this.faculties.find({ order: { name: 'ASC' } });
  }
  async createFaculty(dto: CreateFacultyDto): Promise<Faculty> {
    const faculty = this.faculties.create(dto);
    return this.faculties.save(faculty);
  }
  async updateFaculty(id: string, dto: UpdateFacultyDto): Promise<Faculty> {
    const faculty = await this.faculties.findOne({ where: { id } });
    if (!faculty) throw new NotFoundException('Faculty not found');
    Object.assign(faculty, dto);
    return this.faculties.save(faculty);
  }
  async deleteFaculty(id: string): Promise<void> {
    const faculty = await this.faculties.findOne({ where: { id } });
    if (!faculty) throw new NotFoundException('Faculty not found');
    try {
      await this.faculties.delete(id);
    } catch (err) {
      throw this.mapFkError(
        err,
        'Cannot delete a faculty that still has departments',
      );
    }
  }
  async listDepartments(facultyId?: string): Promise<Department[]> {
    const rows = await this.departments.find({
      where: facultyId ? { facultyId } : {},
      relations: ['faculty', 'hod'],
      order: { name: 'ASC' },
    });
    return rows.map((d) => (d.hod ? { ...d, hod: sanitizeUser(d.hod) } : d));
  }
  async getOwnDepartment(userId: string): Promise<Department | null> {
    const department = await this.departments.findOne({
      where: { hodId: userId },
      relations: ['faculty', 'hod'],
    });
    if (!department) return null;
    return department.hod
      ? { ...department, hod: sanitizeUser(department.hod) }
      : department;
  }
  async createDepartment(dto: CreateDepartmentDto): Promise<Department> {
    const faculty = await this.faculties.findOne({
      where: { id: dto.facultyId },
    });
    if (!faculty) throw new BadRequestException('Faculty not found');
    const department = this.departments.create(dto);
    return this.departments.save(department);
  }
  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<Department> {
    const department = await this.departments.findOne({ where: { id } });
    if (!department) throw new NotFoundException('Department not found');
    if (dto.facultyId) {
      const faculty = await this.faculties.findOne({
        where: { id: dto.facultyId },
      });
      if (!faculty) throw new BadRequestException('Faculty not found');
    }
    Object.assign(department, dto);
    return this.departments.save(department);
  }
  async deleteDepartment(id: string): Promise<void> {
    const department = await this.departments.findOne({ where: { id } });
    if (!department) throw new NotFoundException('Department not found');
    try {
      await this.departments.delete(id);
    } catch (err) {
      throw this.mapFkError(
        err,
        'Cannot delete a department that still has students assigned',
      );
    }
  }
  async assignHod(
    departmentId: string,
    hodUserId: string,
  ): Promise<Department> {
    const department = await this.departments.findOne({
      where: { id: departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');
    const candidate = await this.usersService.findById(hodUserId);
    if (!candidate) throw new BadRequestException('User not found');
    if (!this.usersService.hasRole(candidate, 'hod')) {
      throw new BadRequestException(
        'The target user must hold the "hod" role before being assigned',
      );
    }
    const existingHodDept = await this.departments.findOne({
      where: { hodId: hodUserId },
    });
    if (existingHodDept && existingHodDept.id !== departmentId) {
      throw new ConflictException(
        'This user is already the HOD of another department',
      );
    }
    department.hodId = hodUserId;
    return this.departments.save(department);
  }
  async clearHod(departmentId: string): Promise<Department> {
    const department = await this.departments.findOne({
      where: { id: departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');
    department.hodId = null;
    return this.departments.save(department);
  }
  private mapFkError(err: unknown, message: string): Error {
    if (
      err instanceof QueryFailedError &&
      (
        err as unknown as {
          code?: string;
        }
      ).code === FK_VIOLATION
    ) {
      return new ConflictException(message);
    }
    return err as Error;
  }
}
