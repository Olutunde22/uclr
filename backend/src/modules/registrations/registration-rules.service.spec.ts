import {
  RegistrationRuleContext,
  RegistrationRulesService,
  RuleCourse,
} from './registration-rules.service';
describe('RegistrationRulesService', () => {
  let service: RegistrationRulesService;
  const now = new Date('2026-01-15T00:00:00Z');
  beforeEach(() => {
    service = new RegistrationRulesService();
  });
  function makeCourse(overrides: Partial<RuleCourse> = {}): RuleCourse {
    return {
      id: 'course-1',
      code: 'CSC301',
      isActive: true,
      semester: 'first',
      creditUnits: 3,
      capacity: 50,
      prerequisiteIds: [],
      timetableSlots: [],
      seatsTaken: 0,
      ...overrides,
    };
  }
  function makeContext(
    overrides: Partial<RegistrationRuleContext> = {},
  ): RegistrationRuleContext {
    return {
      now,
      mode: 'submit',
      semester: {
        name: 'first',
        registrationOpensAt: new Date('2026-01-01T00:00:00Z'),
        registrationClosesAt: new Date('2026-02-01T00:00:00Z'),
        addDropClosesAt: new Date('2026-02-15T00:00:00Z'),
        lockedAt: null,
      },
      feeCleared: true,
      selectedCourses: [makeCourse()],
      courseResults: [],
      settings: { minCreditUnits: 15, maxCreditUnits: 24, passMark: 40 },
      ...overrides,
    };
  }
  it('is valid for a fully compliant selection with credit load in range', () => {
    const context = makeContext({
      selectedCourses: [
        makeCourse({ id: 'c1', code: 'CSC301', creditUnits: 9 }),
        makeCourse({ id: 'c2', code: 'CSC302', creditUnits: 9 }),
      ],
    });
    const result = service.evaluate(context);
    expect(result.valid).toBe(true);
    expect(result.violations).toEqual([]);
  });
  it('flags a closed registration window (submit mode)', () => {
    const context = makeContext({
      selectedCourses: [makeCourse({ creditUnits: 18 })],
      now: new Date('2025-12-01T00:00:00Z'),
    });
    const result = service.evaluate(context);
    expect(result.valid).toBe(false);
    expect(result.violations.map((v) => v.rule)).toContain(
      'registration_window_closed',
    );
  });
  it('flags a closed add/drop window (add_drop mode)', () => {
    const context = makeContext({
      mode: 'add_drop',
      selectedCourses: [makeCourse({ creditUnits: 18 })],
      now: new Date('2026-03-01T00:00:00Z'),
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).toContain(
      'add_drop_window_closed',
    );
  });
  it('flags a locked semester and skips further window checks', () => {
    const context = makeContext({
      semester: {
        name: 'first',
        registrationOpensAt: new Date('2026-01-01T00:00:00Z'),
        registrationClosesAt: new Date('2026-02-01T00:00:00Z'),
        addDropClosesAt: null,
        lockedAt: new Date('2026-01-10T00:00:00Z'),
      },
      selectedCourses: [makeCourse({ creditUnits: 18 })],
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).toEqual(['semester_locked']);
  });
  it('flags missing fee clearance', () => {
    const context = makeContext({
      feeCleared: false,
      selectedCourses: [makeCourse({ creditUnits: 18 })],
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).toContain('fee_not_cleared');
  });
  it('flags an inactive course', () => {
    const context = makeContext({
      selectedCourses: [makeCourse({ isActive: false, creditUnits: 18 })],
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).toContain('course_inactive');
  });
  it('flags a course not offered this semester', () => {
    const context = makeContext({
      selectedCourses: [makeCourse({ semester: 'second', creditUnits: 18 })],
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).toContain(
      'course_not_offered_this_semester',
    );
  });
  it('flags a duplicated course selection', () => {
    const course = makeCourse({ creditUnits: 18 });
    const context = makeContext({ selectedCourses: [course, course] });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).toContain('duplicate_course');
  });
  it('flags a missing prerequisite', () => {
    const context = makeContext({
      selectedCourses: [
        makeCourse({ prerequisiteIds: ['prereq-1'], creditUnits: 18 }),
      ],
      courseResults: [],
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).toContain(
      'missing_prerequisite',
    );
  });
  it('flags a failed prerequisite (score below pass mark)', () => {
    const context = makeContext({
      selectedCourses: [
        makeCourse({ prerequisiteIds: ['prereq-1'], creditUnits: 18 }),
      ],
      courseResults: [{ courseId: 'prereq-1', score: 30 }],
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).toContain(
      'failed_prerequisite',
    );
  });
  it('passes prerequisite check when score meets the pass mark', () => {
    const context = makeContext({
      selectedCourses: [
        makeCourse({ prerequisiteIds: ['prereq-1'], creditUnits: 18 }),
      ],
      courseResults: [{ courseId: 'prereq-1', score: 40 }],
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).not.toContain(
      'missing_prerequisite',
    );
    expect(result.violations.map((v) => v.rule)).not.toContain(
      'failed_prerequisite',
    );
  });
  it('flags a timetable clash between two selected courses', () => {
    const context = makeContext({
      selectedCourses: [
        makeCourse({
          id: 'c1',
          code: 'CSC301',
          creditUnits: 9,
          timetableSlots: [
            { day: 'monday', startTime: '09:00', endTime: '11:00' },
          ],
        }),
        makeCourse({
          id: 'c2',
          code: 'CSC302',
          creditUnits: 9,
          timetableSlots: [
            { day: 'monday', startTime: '10:00', endTime: '12:00' },
          ],
        }),
      ],
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).toContain('timetable_clash');
  });
  it('does not flag a clash for non-overlapping slots on the same day', () => {
    const context = makeContext({
      selectedCourses: [
        makeCourse({
          id: 'c1',
          code: 'CSC301',
          creditUnits: 9,
          timetableSlots: [
            { day: 'monday', startTime: '09:00', endTime: '10:00' },
          ],
        }),
        makeCourse({
          id: 'c2',
          code: 'CSC302',
          creditUnits: 9,
          timetableSlots: [
            { day: 'monday', startTime: '10:00', endTime: '11:00' },
          ],
        }),
      ],
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).not.toContain(
      'timetable_clash',
    );
  });
  it('flags a course at full capacity', () => {
    const context = makeContext({
      selectedCourses: [
        makeCourse({ capacity: 1, seatsTaken: 1, creditUnits: 18 }),
      ],
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).toContain('course_full');
  });
  it('flags credit load below the minimum', () => {
    const context = makeContext({
      selectedCourses: [makeCourse({ creditUnits: 3 })],
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).toContain(
      'credit_load_too_low',
    );
  });
  it('flags credit load above the maximum', () => {
    const context = makeContext({
      selectedCourses: [
        makeCourse({ id: 'c1', code: 'CSC301', creditUnits: 15 }),
        makeCourse({ id: 'c2', code: 'CSC302', creditUnits: 15 }),
      ],
    });
    const result = service.evaluate(context);
    expect(result.violations.map((v) => v.rule)).toContain(
      'credit_load_too_high',
    );
  });
  it('returns every violation at once, not just the first', () => {
    const context = makeContext({
      feeCleared: false,
      semester: {
        name: 'first',
        registrationOpensAt: new Date('2026-01-01T00:00:00Z'),
        registrationClosesAt: new Date('2026-02-01T00:00:00Z'),
        addDropClosesAt: new Date('2026-02-15T00:00:00Z'),
        lockedAt: null,
      },
      selectedCourses: [
        makeCourse({
          id: 'c1',
          code: 'CSC301',
          isActive: false,
          creditUnits: 3,
          capacity: 1,
          seatsTaken: 1,
          prerequisiteIds: ['prereq-1'],
        }),
      ],
      courseResults: [],
    });
    const result = service.evaluate(context);
    expect(result.valid).toBe(false);
    const rules = result.violations.map((v) => v.rule);
    expect(rules).toEqual(
      expect.arrayContaining([
        'fee_not_cleared',
        'course_inactive',
        'missing_prerequisite',
        'course_full',
        'credit_load_too_low',
      ]),
    );
    expect(result.violations.length).toBeGreaterThanOrEqual(5);
  });
});
