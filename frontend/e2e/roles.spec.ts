import { expect, test } from '@playwright/test';
import { login, logout, SEED_PASSWORD } from './helpers';

// One login per role (PLAN.md's milestone 14 brief), against the real seeded
// accounts documented in root README.md's "Seeded logins" table. Each check
// is deliberately shallow (name + role badge + a working logout) — deeper
// per-role behaviour (registration, approvals, records, ...) is covered by
// registration-flow.spec.ts and by each feature's own manual verification
// recorded in PROGRESS.md, not re-asserted here.
//
// System admin is the one exception to the shared seed password: it comes
// from `BOOTSTRAP_ADMIN_PASSWORD` (backend/.env.example's default,
// `ChangeMe123!`), not `bun run seed`'s shared `Seed@12345!` — the admin
// account is created by BootstrapService on app boot, before the seed script
// ever runs, and the seed deliberately leaves it alone.
const ROLES: { label: string; identifier: string; password: string; roleBadge: string }[] = [
  {
    label: 'system admin',
    identifier: 'admin@ulcrs.edu.ng',
    password: 'ChangeMe123!',
    roleBadge: 'System Admin',
  },
  {
    label: 'academic adviser',
    identifier: 'academic.adviser@ulcrs.edu.ng',
    password: SEED_PASSWORD,
    roleBadge: 'Academic Adviser',
  },
  {
    label: 'HOD',
    identifier: 'hod@ulcrs.edu.ng',
    password: SEED_PASSWORD,
    roleBadge: 'Hod',
  },
  {
    label: 'registry officer',
    identifier: 'registry@ulcrs.edu.ng',
    password: SEED_PASSWORD,
    roleBadge: 'Registry Officer',
  },
  {
    label: 'bursary officer',
    identifier: 'bursary@ulcrs.edu.ng',
    password: SEED_PASSWORD,
    roleBadge: 'Bursary Officer',
  },
  {
    label: 'lecturer',
    identifier: 'lecturer@ulcrs.edu.ng',
    password: SEED_PASSWORD,
    roleBadge: 'Lecturer',
  },
  {
    label: 'student (by matric no.)',
    identifier: 'MTH/25/001',
    password: SEED_PASSWORD,
    roleBadge: 'Student',
  },
];

for (const { label, identifier, password, roleBadge } of ROLES) {
  test(`${label} can log in and out`, async ({ page }) => {
    await login(page, identifier, password);
    // The role name can legitimately appear more than once on the dashboard
    // (the topbar, the role badge, and for lecturer/hod even a card's own
    // description text) — scope to the actual shadcn Badge element itself
    // (`data-slot="badge"`) rather than any text match.
    await expect(
      page.locator('[data-slot="badge"]', { hasText: roleBadge }).first(),
    ).toBeVisible();
    await logout(page);
  });
}

test('a wrong password shows the real backend error, not a crash', async ({ page }) => {
  // Regression check for the redaction bug fixed this session (see
  // services/auth.ts's comment on loginAction and PROGRESS.md's session
  // log): a failed login must render "Invalid credentials" inline, never
  // Next's generic "error occurred in the Server Components render..." text.
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.getByLabel(/email, matric no\. or staff id/i).fill('hod@ulcrs.edu.ng');
  await page.getByLabel('Password').fill('definitely-wrong');
  await page.getByRole('button', { name: 'Log in' }).click();
  // Next.js's own route announcer also carries `role="alert"` — target the
  // login form's actual error paragraph by its text instead.
  await expect(page.getByText('Invalid credentials')).toBeVisible();
  await expect(page).toHaveURL('/login');
});
