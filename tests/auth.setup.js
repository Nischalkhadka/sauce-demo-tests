const { expect } = require('@playwright/test');
const { test: setup } = require('../fixtures');

const authFile = 'playwright/.auth/standard_user.json';

setup('authenticate as standard_user', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await expect(page).toHaveURL(/\/inventory\.html/);

  await page.context().storageState({ path: authFile });
});
