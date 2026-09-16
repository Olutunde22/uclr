import { expect, test } from '@playwright/test';
import { login, logout, SEED_PASSWORD } from './helpers';

// Happy-path registration through approvals (PLAN.md's milestone 14 brief):
// a student submits, their adviser approves, the HOD approves, and the
// student sees the final "Approved" status. One long, sequential test rather
// than several independent ones, since each stage depends on the previous
// stage's real backend state (there's no fixture seam on the frontend the
// way backend/test/utils/fixtures.ts gives the Jest e2e suite).
//
// Student: MTH/25/001 (Mathematics, level 100), chosen deliberately over any
// Computer Science / Mechanical / Electrical student — `bun run seed`
// pre-seeds one registration per workflow state for exactly those three
// departments (see PROGRESS.md's seed-enrichment Decisions rows), so a CSC/
// MEE/EEE student already has a registration in the current semester and
// can't run this walk from a clean slate. Mathematics has none.
//
// Courses: five level-100, first-semester "intro" courses from five
// different departments (MTH101/PHY101/CHM101/CHE101/MEE101) — confirmed
// live via GET /courses/:id (the list endpoint at GET /courses doesn't embed
// `prerequisites`/`timetableSlots` at all, easy to miss) before writing this
// spec: none has a prerequisite, none of these five overlap on the same day,
// and 5 × 3 = 15 credit units exactly meets `min_credit_units` (see backend
// `system_settings` via GET /settings). CVE101 was the original fifth choice
// but was dropped after the live check found it genuinely clashes with
// MTH101 (Mon 09:00-11:00 vs Mon 10:00-12:00) — a real, correct rule
// violation from `RegistrationRulesService`, not a bug.
const ADVISER = 'academic.adviser@ulcrs.edu.ng';
// `hod@ulcrs.edu.ng` (README's listed HOD login) is specifically the
// Computer Science HOD — every department has its own HOD since the
// seed-enrichment session documented in PROGRESS.md's Decisions table, and
// Mathematics's is `hod.mth@ulcrs.edu.ng`, confirmed live via GET /users/:id
// on the department's `hodId` (this was a real mistake caught by actually
// running this test: the first attempt used `hod@ulcrs.edu.ng` and the
// approvals queue correctly showed a *different*, Computer Science student
// instead — proof this account really is scoped to its own department, not
// a bug).
const HOD = 'hod.mth@ulcrs.edu.ng';
const STUDENT_MATRIC = 'MTH/25/001';
const STUDENT_NAME = 'Lawal Ogundele';
const COURSES = ['MTH101', 'PHY101', 'CHM101', 'CHE101', 'MEE101'];
const BACKEND_URL = 'http://localhost:4000/api';

// A previous run of this exact test (including a successful one — confirmed
// live: the first fully-successful run left the registration `approved`,
// which the first version of this reset function didn't handle at all,
// since it only checked the adviser/hod queues, which an approved
// registration has already left) leaves this student's registration in
// whatever real backend state it last reached. This test always wants to
// walk the full submit→adviser→HOD path itself, so it reads the student's
// own actual status directly (`GET /registrations/me`, which conveniently
// already gives the registration's real id, no queue-scanning-by-email
// needed) and drives it back to `rejected` — from which the UI offers the
// same "pick courses, Submit registration" flow as a brand-new registration
// — via the same add-drop/adviser/HOD endpoints the UI itself calls. All
// through Playwright's `request` fixture against the backend directly, not
// `page`, so this reset doesn't depend on (or exercise) the frontend at all.
async function resetToRejectable(request: import('@playwright/test').APIRequestContext) {
  const studentLogin = await request.post(`${BACKEND_URL}/auth/login`, {
    data: { email: STUDENT_MATRIC, password: SEED_PASSWORD },
  });
  expect(studentLogin.ok()).toBeTruthy();

  const semesters = await (await request.get(`${BACKEND_URL}/calendar/semesters`)).json();
  const currentSemester = semesters.data.find((s: { isCurrent: boolean }) => s.isCurrent);
  const own = await (
    await request.get(`${BACKEND_URL}/registrations/me?semesterId=${currentSemester.id}`)
  ).json();
  const registration: {
    id: string;
    status: string;
    courses: { courseId: string }[];
  } | null = own.data;

  if (!registration || registration.status === 'draft' || registration.status === 'rejected') {
    return; // already in a state the UI flow can start fresh from
  }

  if (registration.status === 'finalised') {
    throw new Error(
      `${STUDENT_MATRIC}'s registration for the current semester is already finalised ` +
        'and cannot be reset by this test — reseed the backend (bun run seed) or use a ' +
        'different current semester before rerunning.',
    );
  }

  let status = registration.status;

  if (status === 'approved') {
    const courseIds = registration.courses.map((c) => c.courseId);
    const addDrop = await request.post(`${BACKEND_URL}/registrations/add-drop`, {
      data: { semesterId: currentSemester.id, courseIds },
    });
    expect(addDrop.ok()).toBeTruthy();
    status = 'pending_adviser'; // add-drop always resets to pending_adviser
  }

  if (status === 'pending_adviser') {
    const adviserLogin = await request.post(`${BACKEND_URL}/auth/login`, {
      data: { email: ADVISER, password: SEED_PASSWORD },
    });
    expect(adviserLogin.ok()).toBeTruthy();
    await request.post(`${BACKEND_URL}/approvals/${registration.id}/adviser-decision`, {
      data: { decision: 'rejected', comment: 'e2e reset' },
    });
    return;
  }

  if (status === 'pending_hod') {
    const hodLogin = await request.post(`${BACKEND_URL}/auth/login`, {
      data: { email: HOD, password: SEED_PASSWORD },
    });
    expect(hodLogin.ok()).toBeTruthy();
    await request.post(`${BACKEND_URL}/approvals/${registration.id}/hod-decision`, {
      data: { decision: 'rejected', comment: 'e2e reset' },
    });
  }
}

test('registration walks draft through submit, adviser approval and HOD approval', async ({
  page,
  request,
}) => {
  await resetToRejectable(request);

  // 1. Student picks courses and submits.
  await login(page, STUDENT_MATRIC, SEED_PASSWORD);
  await page.goto('/registration', { waitUntil: 'networkidle' });

  // A saved draft is real backend state too — clear whatever is currently
  // checked before picking exactly COURSES, so this test doesn't depend on
  // what course selection a previous run happened to leave behind.
  const checkedBox = page.locator('[role="checkbox"][aria-checked="true"]').first();
  while (await checkedBox.count() > 0) {
    await checkedBox.uncheck();
  }
  for (const code of COURSES) {
    await page.getByRole('checkbox', { name: `Select ${code}` }).check();
  }
  await expect(page.getByText('15 credit units')).toBeVisible();

  await page.getByRole('button', { name: 'Submit registration' }).click();
  await expect(page).toHaveURL('/registration/status');
  await expect(page.getByText('Pending adviser approval')).toBeVisible();
  await logout(page);

  // 2. Adviser approves from their queue.
  await login(page, ADVISER, SEED_PASSWORD);
  await page.goto('/approvals', { waitUntil: 'networkidle' });
  await page
    .getByRole('row', { name: new RegExp(STUDENT_NAME) })
    .getByRole('link', { name: 'Review' })
    .click();
  // `CardTitle` (shadcn) renders the student's name as a plain styled `<div>`,
  // not a semantic heading — same gotcha as the login page's "Log in" title
  // (see login.spec.ts's comment). "Pending adviser approval" is the actual
  // real signal this is the right registration, rendered as a status badge.
  await expect(page.getByText('Pending adviser approval')).toBeVisible();
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect(page).toHaveURL('/approvals');
  await logout(page);

  // 3. HOD approves from their queue.
  await login(page, HOD, SEED_PASSWORD);
  await page.goto('/approvals', { waitUntil: 'networkidle' });
  await page
    .getByRole('row', { name: new RegExp(STUDENT_NAME) })
    .getByRole('link', { name: 'Review' })
    .click();
  await expect(page.getByText('Pending HOD approval')).toBeVisible();
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect(page).toHaveURL('/approvals');
  await logout(page);

  // 4. Student sees the final approved status and can reach the course form.
  await login(page, STUDENT_MATRIC, SEED_PASSWORD);
  await page.goto('/registration/status', { waitUntil: 'networkidle' });
  // The approval trail legitimately shows "Approved" more than once (the
  // overall status plus each of the adviser's and HOD's own decisions) —
  // `.first()` just confirms at least one is there.
  await expect(page.getByText('Approved', { exact: true }).first()).toBeVisible();
  await page.goto('/registration', { waitUntil: 'networkidle' });
  await expect(
    page.getByRole('link', { name: /download your course form/i }),
  ).toBeVisible();
});
