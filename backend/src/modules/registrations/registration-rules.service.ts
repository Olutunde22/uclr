import { Injectable } from '@nestjs/common';
export type RegistrationRuleMode = 'submit' | 'add_drop';
export interface RuleTimetableSlot {
  day: string;
  startTime: string;
  endTime: string;
}
export interface RuleCourse {
  id: string;
  code: string;
  isActive: boolean;
  semester: string;
  creditUnits: number;
  capacity: number;
  prerequisiteIds: string[];
  timetableSlots: RuleTimetableSlot[];
  seatsTaken: number;
}
export interface RuleCourseResult {
  courseId: string;
  score: number;
}
export interface RuleSemester {
  name: string;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
  addDropClosesAt: Date | null;
  lockedAt: Date | null;
}
export interface RuleSettings {
  minCreditUnits: number;
  maxCreditUnits: number;
  passMark: number;
}
export interface RegistrationRuleContext {
  now: Date;
  mode: RegistrationRuleMode;
  semester: RuleSemester;
  feeCleared: boolean;
  selectedCourses: RuleCourse[];
  courseResults: RuleCourseResult[];
  settings: RuleSettings;
}
export interface RuleViolation {
  rule: string;
  message: string;
  courseId?: string;
}
export interface RuleResult {
  valid: boolean;
  violations: RuleViolation[];
}
@Injectable()
export class RegistrationRulesService {
  evaluate(context: RegistrationRuleContext): RuleResult {
    const violations: RuleViolation[] = [
      ...this.checkWindow(context),
      ...this.checkFeeClearance(context),
      ...this.checkCourseValidity(context),
      ...this.checkPrerequisites(context),
      ...this.checkClashes(context),
      ...this.checkCapacity(context),
      ...this.checkCreditLoad(context),
    ];
    return { valid: violations.length === 0, violations };
  }
  private checkWindow(context: RegistrationRuleContext): RuleViolation[] {
    const { semester, now, mode } = context;
    const violations: RuleViolation[] = [];
    if (semester.lockedAt) {
      violations.push({
        rule: 'semester_locked',
        message: 'This semester has been finalised and locked by the registry',
      });
      return violations;
    }
    if (mode === 'submit') {
      const opens = semester.registrationOpensAt;
      const closes = semester.registrationClosesAt;
      if (!opens || !closes || now < opens || now > closes) {
        violations.push({
          rule: 'registration_window_closed',
          message: 'The registration window for this semester is not open',
        });
      }
    } else {
      const closes = semester.addDropClosesAt;
      if (!closes || now > closes) {
        violations.push({
          rule: 'add_drop_window_closed',
          message: 'The add/drop window for this semester is not open',
        });
      }
    }
    return violations;
  }
  private checkFeeClearance(context: RegistrationRuleContext): RuleViolation[] {
    if (context.feeCleared) return [];
    return [
      {
        rule: 'fee_not_cleared',
        message: 'You do not have fee clearance for this session',
      },
    ];
  }
  private checkCourseValidity(
    context: RegistrationRuleContext,
  ): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const seen = new Set<string>();
    for (const course of context.selectedCourses) {
      if (seen.has(course.id)) {
        violations.push({
          rule: 'duplicate_course',
          message: `${course.code} is selected more than once`,
          courseId: course.id,
        });
        continue;
      }
      seen.add(course.id);
      if (!course.isActive) {
        violations.push({
          rule: 'course_inactive',
          message: `${course.code} is not active`,
          courseId: course.id,
        });
      }
      if (course.semester !== context.semester.name) {
        violations.push({
          rule: 'course_not_offered_this_semester',
          message: `${course.code} is not offered in the ${context.semester.name} semester`,
          courseId: course.id,
        });
      }
    }
    return violations;
  }
  private checkPrerequisites(
    context: RegistrationRuleContext,
  ): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const bestScoreByCourse = new Map<string, number>();
    for (const result of context.courseResults) {
      const current = bestScoreByCourse.get(result.courseId);
      if (current === undefined || result.score > current) {
        bestScoreByCourse.set(result.courseId, result.score);
      }
    }
    const uniqueCourses = this.uniqueCourses(context.selectedCourses);
    for (const course of uniqueCourses) {
      for (const prerequisiteId of course.prerequisiteIds) {
        const best = bestScoreByCourse.get(prerequisiteId);
        if (best === undefined) {
          violations.push({
            rule: 'missing_prerequisite',
            message: `${course.code} requires a passed prerequisite you have not taken`,
            courseId: course.id,
          });
        } else if (best < context.settings.passMark) {
          violations.push({
            rule: 'failed_prerequisite',
            message: `${course.code} requires a prerequisite you did not pass`,
            courseId: course.id,
          });
        }
      }
    }
    return violations;
  }
  private checkClashes(context: RegistrationRuleContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const courses = this.uniqueCourses(context.selectedCourses);
    for (let i = 0; i < courses.length; i += 1) {
      for (let j = i + 1; j < courses.length; j += 1) {
        const a = courses[i];
        const b = courses[j];
        for (const slotA of a.timetableSlots) {
          for (const slotB of b.timetableSlots) {
            if (
              slotA.day === slotB.day &&
              this.timesOverlap(
                slotA.startTime,
                slotA.endTime,
                slotB.startTime,
                slotB.endTime,
              )
            ) {
              violations.push({
                rule: 'timetable_clash',
                message: `${a.code} clashes with ${b.code} on ${slotA.day}`,
                courseId: a.id,
              });
            }
          }
        }
      }
    }
    return violations;
  }
  private timesOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ): boolean {
    return startA < endB && startB < endA;
  }
  private checkCapacity(context: RegistrationRuleContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    for (const course of this.uniqueCourses(context.selectedCourses)) {
      if (course.seatsTaken >= course.capacity) {
        violations.push({
          rule: 'course_full',
          message: `${course.code} has no seats left`,
          courseId: course.id,
        });
      }
    }
    return violations;
  }
  private checkCreditLoad(context: RegistrationRuleContext): RuleViolation[] {
    const totalUnits = this.uniqueCourses(context.selectedCourses).reduce(
      (sum, course) => sum + course.creditUnits,
      0,
    );
    const { minCreditUnits, maxCreditUnits } = context.settings;
    if (totalUnits < minCreditUnits) {
      return [
        {
          rule: 'credit_load_too_low',
          message: `Total credit units (${totalUnits}) is below the minimum of ${minCreditUnits}`,
        },
      ];
    }
    if (totalUnits > maxCreditUnits) {
      return [
        {
          rule: 'credit_load_too_high',
          message: `Total credit units (${totalUnits}) exceeds the maximum of ${maxCreditUnits}`,
        },
      ];
    }
    return [];
  }
  private uniqueCourses(courses: RuleCourse[]): RuleCourse[] {
    const byId = new Map<string, RuleCourse>();
    for (const course of courses) {
      if (!byId.has(course.id)) byId.set(course.id, course);
    }
    return [...byId.values()];
  }
}
