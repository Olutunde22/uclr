import { expect, test } from '@playwright/test';

// Example/smoke coverage for milestone 8. Full per-role login coverage and
// the happy-path registration walk are milestone 14 (PLAN.md's delivery
// order) — this just proves the harness and the auth redirect wiring work.
test('unauthenticated visitor is redirected to /login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('logging in with a seeded account reaches the dashboard', async ({
  page,
}) => {
  await page.goto('/login');
  await page
    .getByLabel(/email, matric no\. or staff id/i)
    .fill('hod@ulcrs.edu.ng');
  await page.getByLabel('Password').fill('Seed@12345!');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
});
