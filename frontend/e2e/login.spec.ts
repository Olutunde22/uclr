import { expect, test } from '@playwright/test';

// Example/smoke coverage for milestone 8, actually executed for the first
// time in milestone 14 (this environment couldn't install Playwright's own
// Chromium build — see playwright.config.ts's comment on `channel: 'chrome'`
// — so this spec was written but never run until now). Running it surfaced
// two real issues, both fixed here rather than in application code:
// - `CardTitle` (shadcn) renders "Log in" as a plain styled `<div>`, not a
//   semantic heading — `getByRole('heading', ...)` never matched it. Swapped
//   for the submit button's accessible name, which the second test already
//   relied on successfully.
// - `page.goto('/login')` only waits for the `load` event, not for React to
//   hydrate and attach the form's `onSubmit`. Playwright's own actionability
//   checks only look at the DOM (visible/enabled/stable), not hydration
//   state, so a fast `fill` + `click` right after `goto` could win the race
//   and submit the plain HTML `<form>` before its handler existed — as a
//   native GET, which is exactly what happened (the credentials ended up in
//   the URL's query string instead of a POST body). Waiting for
//   `networkidle` after `goto` reliably clears the race in this app: it also
//   waits out the RSC payload / hydration script Next.js loads immediately
//   after the initial HTML.
test('unauthenticated visitor is redirected to /login', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
});

test('logging in with a seeded account reaches the dashboard', async ({
  page,
}) => {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page
    .getByLabel(/email, matric no\. or staff id/i)
    .fill('hod@ulcrs.edu.ng');
  await page.getByLabel('Password').fill('Seed@12345!');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
});
