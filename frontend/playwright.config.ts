import { defineConfig, devices } from '@playwright/test';

// Configured now (milestone 8); full e2e coverage (login per role,
// happy-path registration through approvals) is milestone 14 per PLAN.md's
// delivery order. `bun run test:e2e` expects both the backend (:4000, real
// Postgres + seed) and this app (:3000) already running — see
// frontend/CLAUDE.md's verification section.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
