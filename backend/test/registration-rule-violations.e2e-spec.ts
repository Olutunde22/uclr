import { INestApplication } from '@nestjs/common';
import {
  createTestApp,
  createFacultyAndDepartment,
  createAdviser,
  createStudent,
  createOpenSemester,
  createCourse,
  setFeeClearance,
  loginAs,
} from './utils/fixtures';
describe('Registration rule violations (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  it('blocks submit when a prerequisite has not been passed', async () => {
    const { department } = await createFacultyAndDepartment(app);
    const adviser = await createAdviser(app);
    const student = await createStudent(app, department, adviser, {
      level: 200,
    });
    const { session, semester } = await createOpenSemester(app);
    await setFeeClearance(app, student.id, session.id, true);
    const prerequisite = await createCourse(app, {
      department,
      level: 100,
      creditUnits: 9,
    });
    const dependent = await createCourse(app, {
      department,
      level: 200,
      creditUnits: 18,
      prerequisites: [prerequisite],
    });
    const agent = await loginAs(app, student.email);
    await agent
      .post('/api/registrations/draft')
      .send({ semesterId: semester.id, courseIds: [dependent.id] });
    const res = await agent
      .post('/api/registrations/submit')
      .send({ semesterId: semester.id });
    expect(res.status).toBe(201);
    expect(res.body.data.valid).toBe(false);
    expect(
      res.body.data.violations.some(
        (v: { rule: string }) => v.rule === 'missing_prerequisite',
      ),
    ).toBe(true);
  });
  it('blocks submit when two selected courses clash on the timetable', async () => {
    const { department } = await createFacultyAndDepartment(app);
    const adviser = await createAdviser(app);
    const student = await createStudent(app, department, adviser);
    const { session, semester } = await createOpenSemester(app);
    await setFeeClearance(app, student.id, session.id, true);
    const courseA = await createCourse(app, {
      department,
      creditUnits: 9,
      slots: [{ day: 'monday', startTime: '08:00', endTime: '10:00' }],
    });
    const courseB = await createCourse(app, {
      department,
      creditUnits: 9,
      slots: [{ day: 'monday', startTime: '09:00', endTime: '11:00' }],
    });
    const agent = await loginAs(app, student.email);
    await agent
      .post('/api/registrations/draft')
      .send({ semesterId: semester.id, courseIds: [courseA.id, courseB.id] });
    const res = await agent
      .post('/api/registrations/submit')
      .send({ semesterId: semester.id });
    expect(res.status).toBe(201);
    expect(res.body.data.valid).toBe(false);
    expect(
      res.body.data.violations.some(
        (v: { rule: string }) => v.rule === 'timetable_clash',
      ),
    ).toBe(true);
  });
  it('blocks submit for a student without fee clearance', async () => {
    const { department } = await createFacultyAndDepartment(app);
    const adviser = await createAdviser(app);
    const student = await createStudent(app, department, adviser);
    const { semester } = await createOpenSemester(app);
    const course = await createCourse(app, { department });
    const agent = await loginAs(app, student.email);
    await agent
      .post('/api/registrations/draft')
      .send({ semesterId: semester.id, courseIds: [course.id] });
    const res = await agent
      .post('/api/registrations/submit')
      .send({ semesterId: semester.id });
    expect(res.status).toBe(201);
    expect(res.body.data.valid).toBe(false);
    expect(
      res.body.data.violations.some(
        (v: { rule: string }) => v.rule === 'fee_not_cleared',
      ),
    ).toBe(true);
  });
});
