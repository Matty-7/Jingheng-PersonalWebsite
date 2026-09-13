import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    actionTimeout: 10_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
    { name: 'short', use: { viewport: { width: 1280, height: 720 } } },
    {
      name: 'webkit_desktop',
      use: { browserName: 'webkit', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'webkit_mobile',
      use: { browserName: 'webkit', viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: 'npm run start -- --ip 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/portfolio/mortgage-map',
    reuseExistingServer: false,
    timeout: 90_000,
    env: { CI: 'true', WRANGLER_SEND_METRICS: 'false' },
  },
});
