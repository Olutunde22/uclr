import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AcademicSession } from './entities/academic-session.entity';
import { Semester } from './entities/semester.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { UpdateSemesterWindowsDto } from './dto/update-semester-windows.dto';
@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(AcademicSession)
    private readonly sessions: Repository<AcademicSession>,
    @InjectRepository(Semester)
    private readonly semesters: Repository<Semester>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
  listSessions(): Promise<AcademicSession[]> {
    return this.sessions.find({ order: { name: 'DESC' } });
  }
  async createSession(dto: CreateSessionDto): Promise<AcademicSession> {
    const session = this.sessions.create(dto);
    return this.sessions.save(session);
  }
  async updateSession(
    id: string,
    dto: UpdateSessionDto,
  ): Promise<AcademicSession> {
    const session = await this.sessions.findOne({ where: { id } });
    if (!session) throw new NotFoundException('Academic session not found');
    Object.assign(session, dto);
    return this.sessions.save(session);
  }
  async setCurrentSession(id: string): Promise<AcademicSession> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(AcademicSession);
      const session = await repo.findOne({ where: { id } });
      if (!session) throw new NotFoundException('Academic session not found');
      await repo
        .createQueryBuilder()
        .update(AcademicSession)
        .set({ isCurrent: false })
        .where('is_current = true')
        .execute();
      session.isCurrent = true;
      return repo.save(session);
    });
  }
  listSemesters(sessionId?: string): Promise<Semester[]> {
    return this.semesters.find({
      where: sessionId ? { sessionId } : {},
      relations: ['session'],
      order: { createdAt: 'ASC' },
    });
  }
  async createSemester(dto: CreateSemesterDto): Promise<Semester> {
    const session = await this.sessions.findOne({
      where: { id: dto.sessionId },
    });
    if (!session) throw new BadRequestException('Academic session not found');
    const existing = await this.semesters.findOne({
      where: { sessionId: dto.sessionId, name: dto.name },
    });
    if (existing) {
      throw new BadRequestException(
        `A "${dto.name}" semester already exists for this session`,
      );
    }
    const semester = this.semesters.create(dto);
    return this.semesters.save(semester);
  }
  async updateSemester(id: string, dto: UpdateSemesterDto): Promise<Semester> {
    const semester = await this.semesters.findOne({ where: { id } });
    if (!semester) throw new NotFoundException('Semester not found');
    Object.assign(semester, dto);
    return this.semesters.save(semester);
  }
  async updateSemesterWindows(
    id: string,
    dto: UpdateSemesterWindowsDto,
  ): Promise<Semester> {
    const semester = await this.semesters.findOne({ where: { id } });
    if (!semester) throw new NotFoundException('Semester not found');
    if (dto.registrationOpensAt !== undefined) {
      semester.registrationOpensAt = new Date(dto.registrationOpensAt);
    }
    if (dto.registrationClosesAt !== undefined) {
      semester.registrationClosesAt = new Date(dto.registrationClosesAt);
    }
    if (dto.addDropClosesAt !== undefined) {
      semester.addDropClosesAt = new Date(dto.addDropClosesAt);
    }
    return this.semesters.save(semester);
  }
  async setCurrentSemester(id: string): Promise<Semester> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Semester);
      const semester = await repo.findOne({ where: { id } });
      if (!semester) throw new NotFoundException('Semester not found');
      await repo
        .createQueryBuilder()
        .update(Semester)
        .set({ isCurrent: false })
        .where('is_current = true')
        .execute();
      semester.isCurrent = true;
      return repo.save(semester);
    });
  }
}
