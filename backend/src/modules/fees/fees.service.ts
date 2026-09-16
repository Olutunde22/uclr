import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { FeePayment } from './entities/fee-payment.entity';
import { FeeClearance } from './entities/fee-clearance.entity';
import { AcademicSession } from '../calendar/entities/academic-session.entity';
import { UsersService } from '../users/users.service';
import { sanitizeUser } from '../../common/sanitize-user';
import { AuthenticatedUser } from '../../common/types';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsQueryDto } from './dto/list-payments-query.dto';
import { ListClearancesQueryDto } from './dto/list-clearances-query.dto';
import { SetClearanceDto } from './dto/set-clearance.dto';
const UNIQUE_VIOLATION = '23505';
@Injectable()
export class FeesService {
  constructor(
    @InjectRepository(FeePayment)
    private readonly payments: Repository<FeePayment>,
    @InjectRepository(FeeClearance)
    private readonly clearances: Repository<FeeClearance>,
    @InjectRepository(AcademicSession)
    private readonly sessions: Repository<AcademicSession>,
    private readonly usersService: UsersService,
  ) {}
  private async assertStudent(studentId: string): Promise<void> {
    const student = await this.usersService.findById(studentId);
    if (!student) throw new BadRequestException('Student not found');
    if (!this.usersService.hasRole(student, 'student')) {
      throw new BadRequestException(
        'The target user must hold the "student" role',
      );
    }
    const withProfile = await this.usersService.findByIdWithProfile(studentId);
    if (!withProfile.studentProfile) {
      throw new BadRequestException('The target user has no student profile');
    }
  }
  private async assertSession(sessionId: string): Promise<void> {
    const session = await this.sessions.findOne({ where: { id: sessionId } });
    if (!session) throw new BadRequestException('Academic session not found');
  }
  async recordPayment(
    dto: CreatePaymentDto,
    recordedBy: string,
  ): Promise<FeePayment> {
    await this.assertStudent(dto.studentId);
    await this.assertSession(dto.sessionId);
    const payment = this.payments.create({
      studentId: dto.studentId,
      sessionId: dto.sessionId,
      amount: dto.amount,
      receiptNo: dto.receiptNo,
      paymentDate: dto.paymentDate,
      recordedBy,
    });
    try {
      return await this.payments.save(payment);
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (
          err as unknown as {
            code?: string;
          }
        ).code === UNIQUE_VIOLATION
      ) {
        throw new ConflictException(
          'A payment with this receipt number already exists',
        );
      }
      throw err;
    }
  }
  async listPayments(query: ListPaymentsQueryDto): Promise<FeePayment[]> {
    const where: Partial<Record<'studentId' | 'sessionId', string>> = {};
    if (query.studentId) where.studentId = query.studentId;
    if (query.sessionId) where.sessionId = query.sessionId;
    const rows = await this.payments.find({
      where,
      relations: ['student', 'session', 'recordedByUser'],
      order: { paymentDate: 'DESC' },
    });
    return rows.map((p) => ({
      ...p,
      student: sanitizeUser(p.student),
      recordedByUser: sanitizeUser(p.recordedByUser),
    }));
  }
  async listClearances(query: ListClearancesQueryDto): Promise<FeeClearance[]> {
    const where: Partial<Record<'studentId' | 'sessionId', string>> = {};
    if (query.studentId) where.studentId = query.studentId;
    if (query.sessionId) where.sessionId = query.sessionId;
    const rows = await this.clearances.find({
      where,
      relations: ['student', 'session', 'clearedByUser'],
      order: { updatedAt: 'DESC' },
    });
    return rows.map((c) => ({
      ...c,
      student: sanitizeUser(c.student),
      clearedByUser: c.clearedByUser
        ? sanitizeUser(c.clearedByUser)
        : c.clearedByUser,
    }));
  }
  async issueClearance(
    dto: SetClearanceDto,
    clearedBy: string,
  ): Promise<FeeClearance> {
    await this.assertStudent(dto.studentId);
    await this.assertSession(dto.sessionId);
    let clearance = await this.clearances.findOne({
      where: { studentId: dto.studentId, sessionId: dto.sessionId },
    });
    if (!clearance) {
      clearance = this.clearances.create({
        studentId: dto.studentId,
        sessionId: dto.sessionId,
      });
    }
    clearance.cleared = true;
    clearance.clearedBy = clearedBy;
    clearance.clearedAt = new Date();
    return this.clearances.save(clearance);
  }
  async revokeClearance(
    dto: SetClearanceDto,
    revokedBy: string,
  ): Promise<FeeClearance> {
    const clearance = await this.clearances.findOne({
      where: { studentId: dto.studentId, sessionId: dto.sessionId },
    });
    if (!clearance) {
      throw new NotFoundException(
        'No clearance record exists for this student and session',
      );
    }
    clearance.cleared = false;
    clearance.clearedBy = revokedBy;
    clearance.clearedAt = new Date();
    return this.clearances.save(clearance);
  }
  async getOwnFeeStatus(
    currentUser: AuthenticatedUser,
    sessionId?: string,
  ): Promise<{
    clearances: FeeClearance[];
    payments: FeePayment[];
  }> {
    const where: Partial<Record<'studentId' | 'sessionId', string>> = {
      studentId: currentUser.id,
    };
    if (sessionId) where.sessionId = sessionId;
    const [clearances, payments] = await Promise.all([
      this.clearances.find({ where, relations: ['session'] }),
      this.payments.find({
        where,
        relations: ['session'],
        order: { paymentDate: 'DESC' },
      }),
    ]);
    return { clearances, payments };
  }
}
