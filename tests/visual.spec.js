const { test, expect } = require('../fixtures');

// Visual tests each log in as a specific user, so they need their own clean
// context rather than the project's default standard_user storageState.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Visual regression', () => {
  test('login page matches baseline', async ({ page, loginPage }) => {
    await loginPage.goto();

    await expect(page).toHaveScreenshot('login-page.png', { fullPage: true });
  });

  test('standard_user inventory page matches baseline', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/\/inventory\.html/);

    await expect(page).toHaveScreenshot('inventory-standard-user.png', { fullPage: true });
  });

  test('problem_user inventory page matches baseline (tracks known UI bugs)', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('problem_user', 'secret_sauce');
    await expect(page).toHaveURL(/\/inventory\.html/);

    await expect(page).toHaveScreenshot('inventory-problem-user.png', { fullPage: true });
  });

  test('cart badge renders correctly after adding an item', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(inventoryPage.cartBadge).toHaveScreenshot('cart-badge.png');
  });

  test('checkout complete page matches baseline', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await checkoutStepOnePage.fillInfo({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });
    await checkoutStepOnePage.continueToOverview();
    await checkoutStepTwoPage.finish();
    await expect(page).toHaveURL(/\/checkout-complete\.html/);

    await expect(page).toHaveScreenshot('checkout-complete.png', { fullPage: true });
  });
});
