import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

// Shared between every milestone-14 spec. `waitUntil: 'networkidle'` on every
// goto is deliberate, not decoration — see login.spec.ts's top comment for
// the hydration race it avoids (a fast fill+click right after `goto` can
// submit the login form as a native, unhandled HTML GET before React
// attaches `onSubmit`).
export async function login(page: Page, identifier: string, password: string) {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.getByLabel(/email, matric no\. or staff id/i).fill(identifier);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
}

// The topbar's avatar dropdown is the only way to log out (components/shell/
// app-topbar.tsx) — `aria-label="Account menu"` was added to it during this
// milestone specifically because it had no accessible name at all before.
export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitem', { name: /log out/i }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
}

export const SEED_PASSWORD = 'Seed@12345!';
