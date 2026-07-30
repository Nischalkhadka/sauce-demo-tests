const { test, expect } = require('../fixtures');

// This suite tests the login form itself across multiple different users and
// invalid-credential scenarios, so it needs a clean, unauthenticated context —
// override the project's default (already-authenticated) storageState.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('SauceDemo login - valid credentials', () => {
  test('standard_user redirects to inventory page', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/\/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.inventoryList).toBeVisible();
  });

  test('problem_user logs in successfully', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login('problem_user', 'secret_sauce');

    await expect(page).toHaveURL(/\/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('performance_glitch_user logs in successfully despite delay', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login('performance_glitch_user', 'secret_sauce');

    await expect(page).toHaveURL(/\/inventory\.html/, { timeout: 15000 });
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('visual_user logs in successfully', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login('visual_user', 'secret_sauce');

    await expect(page).toHaveURL(/\/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });
});

test.describe('SauceDemo login - invalid credentials', () => {
  test('locked_out_user is rejected with locked-out message', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('locked_out_user', 'secret_sauce');

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Sorry, this user has been locked out.'
    );
  });

  test('valid username with wrong password is rejected', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'wrong_password');

    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Username and password do not match any user in this service'
    );
  });

  test('nonexistent username is rejected', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('no_such_user', 'secret_sauce');

    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Username and password do not match any user in this service'
    );
  });

  test('empty username shows required error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', 'secret_sauce');

    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Username is required');
  });

  test('empty password shows required error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', '');

    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Password is required');
  });

  test('empty username and password shows username-required error first', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', '');

    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Username is required');
  });

  test('error banner can be dismissed', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', '');

    await expect(loginPage.errorMessage).toBeVisible();
    await loginPage.dismissError();
    await expect(loginPage.errorMessage).toBeHidden();
  });
});

test.describe('SauceDemo login - edge cases', () => {
  test('direct navigation to inventory page without login redirects with error', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorMessage).toHaveText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in."
    );
  });

  test('username is case-sensitive', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('Standard_User', 'secret_sauce');

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Username and password do not match any user in this service'
    );
  });

  test('leading/trailing whitespace in username is rejected', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(' standard_user ', 'secret_sauce');

    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Username and password do not match any user in this service'
    );
  });

  test('SQL-injection-style input is rejected without crashing', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login("' OR 1=1--", "' OR 1=1--");

    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Username and password do not match any user in this service'
    );
  });
});
