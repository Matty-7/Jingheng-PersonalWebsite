import { defineConfig, devices } from '@playwright/test';

const standard_tests = { testIgnore: '**/mobile_device.spec.ts' };

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : 1,
  timeout: 60_000,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/browser_results.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    actionTimeout: 10_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      ...standard_tests,
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      ...standard_tests,
      use: { viewport: { width: 390, height: 844 } },
    },
    {
      name: 'short',
      ...standard_tests,
      use: { viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'webkit_desktop',
      ...standard_tests,
      use: { browserName: 'webkit', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'webkit_mobile',
      ...standard_tests,
      use: { browserName: 'webkit', viewport: { width: 390, height: 844 } },
    },
    {
      name: 'touch_chromium',
      testMatch: '**/mobile_device.spec.ts',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'touch_webkit',
      testMatch: '**/mobile_device.spec.ts',
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
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
