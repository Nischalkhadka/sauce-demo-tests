const { defineConfig, devices } = require('@playwright/test');

const STANDARD_USER_AUTH_FILE = 'playwright/.auth/standard_user.json';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: STANDARD_USER_AUTH_FILE },
      dependencies: ['setup'],
    },
  ],
});
