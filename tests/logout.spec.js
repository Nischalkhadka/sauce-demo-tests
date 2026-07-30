const { test, expect } = require('../fixtures');

test.beforeEach(async ({ page }) => {
  await page.goto('/inventory.html');
  await expect(page).toHaveURL(/\/inventory\.html/);
});

test.describe('Logout', () => {
  test('menu exposes All Items, About, Logout, and Reset App State links', async ({ inventoryPage }) => {
    await inventoryPage.menu.open();

    await expect(inventoryPage.menu.allItemsLink).toHaveText('All Items');
    await expect(inventoryPage.menu.aboutLink).toHaveText('About');
    await expect(inventoryPage.menu.logoutLink).toHaveText('Logout');
    await expect(inventoryPage.menu.resetAppStateLink).toHaveText('Reset App State');
  });

  test('clicking Logout redirects to the login page with empty credentials', async ({ page, inventoryPage, loginPage }) => {
    await inventoryPage.menu.logout();

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.usernameInput).toHaveValue('');
    await expect(loginPage.passwordInput).toHaveValue('');
  });

  test('session is invalidated: protected pages are inaccessible after logout', async ({ page, inventoryPage, loginPage }) => {
    await inventoryPage.menu.logout();
    await page.goto('/inventory.html');

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorMessage).toHaveText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in."
    );
  });

  test('logging back in after logout works and returns to the inventory page', async ({ page, inventoryPage, loginPage }) => {
    await inventoryPage.menu.logout();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/\/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('cart contents persist across logout and re-login for the same user', async ({ inventoryPage, loginPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.menu.logout();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(inventoryPage.cartBadge).toHaveText('1');
  });
});
