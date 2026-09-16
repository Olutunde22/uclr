import { INestApplication } from '@nestjs/common';
import {
  createTestApp,
  createFacultyAndDepartment,
  createHod,
  createAdviser,
  createRegistryOfficer,
  createStudent,
  createOpenSemester,
  createCourse,
  setFeeClearance,
  loginAs,
  repo,
} from './utils/fixtures';
import { Registration } from '../src/modules/registrations/entities/registration.entity';
import { RegistryRecord } from '../src/modules/records/entities/registry-record.entity';
describe('Registration happy path (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  it('runs student submit -> adviser approve -> hod approve -> registry finalise', async () => {
    const { department } = await createFacultyAndDepartment(app);
    const hod = await createHod(app, department);
    const adviser = await createAdviser(app);
    const registry = await createRegistryOfficer(app);
    const student = await createStudent(app, department, adviser);
    const { session, semester } = await createOpenSemester(app);
    const course = await createCourse(app, { department, capacity: 5 });
    await setFeeClearance(app, student.id, session.id, true);
    const studentAgent = await loginAs(app, student.email);
    const adviserAgent = await loginAs(app, adviser.email);
    const hodAgent = await loginAs(app, hod.email);
    const registryAgent = await loginAs(app, registry.email);
    const draftRes = await studentAgent
      .post('/api/registrations/draft')
      .send({ semesterId: semester.id, courseIds: [course.id] });
    expect(draftRes.status).toBe(201);
    const submitRes = await studentAgent
      .post('/api/registrations/submit')
      .send({ semesterId: semester.id });
    expect(submitRes.status).toBe(201);
    expect(submitRes.body.data.valid).toBe(true);
    const registrationId = submitRes.body.data.registration.id;
    let registration = await repo(app, Registration).findOne({
      where: { id: registrationId },
    });
    expect(registration?.status).toBe('pending_adviser');
    const rejectRes = await adviserAgent
      .post(`/api/approvals/${registrationId}/adviser-decision`)
      .send({ decision: 'rejected', comment: 'Please double check load' });
    expect(rejectRes.status).toBe(201);
    expect(rejectRes.body.data.status).toBe('rejected');
    const resubmitRes = await studentAgent
      .post('/api/registrations/submit')
      .send({ semesterId: semester.id });
    expect(resubmitRes.status).toBe(201);
    expect(resubmitRes.body.data.valid).toBe(true);
    const adviserApproveRes = await adviserAgent
      .post(`/api/approvals/${registrationId}/adviser-decision`)
      .send({ decision: 'approved' });
    expect(adviserApproveRes.status).toBe(201);
    expect(adviserApproveRes.body.data.status).toBe('pending_hod');
    const hodApproveRes = await hodAgent
      .post(`/api/approvals/${registrationId}/hod-decision`)
      .send({ decision: 'approved' });
    expect(hodApproveRes.status).toBe(201);
    expect(hodApproveRes.body.data.status).toBe('approved');
    const addDropRes = await studentAgent
      .post('/api/registrations/add-drop')
      .send({ semesterId: semester.id, courseIds: [course.id] });
    expect(addDropRes.status).toBe(201);
    expect(addDropRes.body.data.valid).toBe(true);
    expect(addDropRes.body.data.registration.status).toBe('pending_adviser');
    await adviserAgent
      .post(`/api/approvals/${registrationId}/adviser-decision`)
      .send({ decision: 'approved' });
    await hodAgent
      .post(`/api/approvals/${registrationId}/hod-decision`)
      .send({ decision: 'approved' });
    const finaliseRes = await registryAgent
      .post('/api/records/finalise')
      .send({ semesterId: semester.id });
    expect(finaliseRes.status).toBe(201);
    expect(finaliseRes.body.data.finalisedCount).toBe(1);
    expect(finaliseRes.body.data.finalisedRegistrationIds).toContain(
      registrationId,
    );
    registration = await repo(app, Registration).findOne({
      where: { id: registrationId },
    });
    expect(registration?.status).toBe('finalised');
    const registryRecord = await repo(app, RegistryRecord).findOne({
      where: { registrationId },
    });
    expect(registryRecord).not.toBeNull();
    expect(registryRecord?.recordedBy).toBe(registry.id);
  });
});
