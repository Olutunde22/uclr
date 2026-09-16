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
describe('Registration capacity (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  it('rejects a submit once the course is at capacity', async () => {
    const { department } = await createFacultyAndDepartment(app);
    const adviser = await createAdviser(app);
    const { session, semester } = await createOpenSemester(app);
    const course = await createCourse(app, { department, capacity: 1 });
    const first = await createStudent(app, department, adviser);
    await setFeeClearance(app, first.id, session.id, true);
    const firstAgent = await loginAs(app, first.email);
    await firstAgent
      .post('/api/registrations/draft')
      .send({ semesterId: semester.id, courseIds: [course.id] });
    const firstSubmit = await firstAgent
      .post('/api/registrations/submit')
      .send({ semesterId: semester.id });
    expect(firstSubmit.body.data.valid).toBe(true);
    const second = await createStudent(app, department, adviser);
    await setFeeClearance(app, second.id, session.id, true);
    const secondAgent = await loginAs(app, second.email);
    await secondAgent
      .post('/api/registrations/draft')
      .send({ semesterId: semester.id, courseIds: [course.id] });
    const secondSubmit = await secondAgent
      .post('/api/registrations/submit')
      .send({ semesterId: semester.id });
    expect(secondSubmit.body.data.valid).toBe(false);
    expect(
      secondSubmit.body.data.violations.some(
        (v: { rule: string }) => v.rule === 'course_full',
      ),
    ).toBe(true);
  });
  it('lets exactly one of two concurrent submits win the last seat', async () => {
    const { department } = await createFacultyAndDepartment(app);
    const adviser = await createAdviser(app);
    const { session, semester } = await createOpenSemester(app);
    const course = await createCourse(app, { department, capacity: 1 });
    const studentA = await createStudent(app, department, adviser);
    const studentB = await createStudent(app, department, adviser);
    await setFeeClearance(app, studentA.id, session.id, true);
    await setFeeClearance(app, studentB.id, session.id, true);
    const agentA = await loginAs(app, studentA.email);
    const agentB = await loginAs(app, studentB.email);
    await Promise.all([
      agentA
        .post('/api/registrations/draft')
        .send({ semesterId: semester.id, courseIds: [course.id] }),
      agentB
        .post('/api/registrations/draft')
        .send({ semesterId: semester.id, courseIds: [course.id] }),
    ]);
    const [resA, resB] = await Promise.all([
      agentA
        .post('/api/registrations/submit')
        .send({ semesterId: semester.id }),
      agentB
        .post('/api/registrations/submit')
        .send({ semesterId: semester.id }),
    ]);
    const outcomes = [resA.body.data.valid, resB.body.data.valid];
    const winners = outcomes.filter((valid) => valid === true).length;
    const losers = outcomes.filter((valid) => valid === false).length;
    expect(winners).toBe(1);
    expect(losers).toBe(1);
  });
});
