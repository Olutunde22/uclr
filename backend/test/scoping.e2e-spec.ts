import { INestApplication } from '@nestjs/common';
import {
  createTestApp,
  createFacultyAndDepartment,
  createAdviser,
  createStudent,
  createOpenSemester,
  createCourse,
  createLecturer,
  setFeeClearance,
  loginAs,
} from './utils/fixtures';
describe('Data scoping (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  it('403s an adviser acting on a registration they do not advise', async () => {
    const { department } = await createFacultyAndDepartment(app);
    const realAdviser = await createAdviser(app);
    const otherAdviser = await createAdviser(app);
    const student = await createStudent(app, department, realAdviser);
    const { session, semester } = await createOpenSemester(app);
    await setFeeClearance(app, student.id, session.id, true);
    const course = await createCourse(app, { department });
    const studentAgent = await loginAs(app, student.email);
    await studentAgent
      .post('/api/registrations/draft')
      .send({ semesterId: semester.id, courseIds: [course.id] });
    const submitRes = await studentAgent
      .post('/api/registrations/submit')
      .send({ semesterId: semester.id });
    expect(submitRes.body.data.valid).toBe(true);
    const registrationId = submitRes.body.data.registration.id;
    const otherAdviserAgent = await loginAs(app, otherAdviser.email);
    const decisionRes = await otherAdviserAgent
      .post(`/api/approvals/${registrationId}/adviser-decision`)
      .send({ decision: 'approved' });
    expect(decisionRes.status).toBe(403);
  });
  it('403s a lecturer reading the class list of a course that is not theirs', async () => {
    const { department } = await createFacultyAndDepartment(app);
    const ownerLecturer = await createLecturer(app);
    const otherLecturer = await createLecturer(app);
    const course = await createCourse(app, {
      department,
      lecturerId: ownerLecturer.id,
    });
    const { semester } = await createOpenSemester(app);
    const otherLecturerAgent = await loginAs(app, otherLecturer.email);
    const res = await otherLecturerAgent.get(
      `/api/courses/${course.id}/class-list?semesterId=${semester.id}`,
    );
    expect(res.status).toBe(403);
  });
});
