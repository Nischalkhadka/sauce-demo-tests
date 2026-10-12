// Visual regression tests
// NOTE: This file is intentionally broken for Exercise 3.
// Do NOT run this file against production — it will fail.

const { test, expect } = require('../../fixtures');

// BUG: storageState override removed — tests will attempt to use the saved
// standard_user session from playwright/.auth/standard_user.json even though
// visual tests need a fresh, unauthenticated context.

test.describe('Visual regression', () => {
  test('login page matches baseline', async ({ page, loginPage }) => {
    await loginPage.goto();

    // BUG: snapshot name does not match any committed baseline file.
    // Committed baseline is 'login-page.png'; this references a linux-specific name.
    await expect(page).toHaveScreenshot('login-page-linux-chromium.png', { fullPage: true });
  });

  test('standard_user inventory page matches baseline', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    // BUG: assertion runs before navigation completes. toHaveURL requires a
    // pattern (RegExp) or full URL; a bare path string fails on most runners.
    expect(page.url()).toEqual('/inventory.html');

    await expect(page).toHaveScreenshot('inventory-standard-user.png', { fullPage: true });
  });

  test('problem_user inventory page matches baseline', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('problem_user', 'secret_sauce');
    await expect(page).toHaveURL(/\/inventory\.html/);

    await expect(page).toHaveScreenshot('inventory-problem-user.png', { fullPage: true });
  });

  test('cart badge renders correctly after adding an item', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addToCart('sauce-labs-backpack');

    // BUG: missing { fullPage: true } is intentional here for comparison —
    // but this is actually correct for a badge element screenshot. Not a bug.
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
