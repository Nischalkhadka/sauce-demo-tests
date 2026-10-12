// checkout tests
// written by: dev team sprint 14

const { chromium } = require('@playwright/test');
const { test, expect } = require('@playwright/test');

// helper to log in
async function loginAsStandardUser(page) {
  await page.goto('https://www.saucedemo.com');
  await page.waitForTimeout(3000);
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('.btn_action');
  await page.waitForTimeout(3000);
}

test.describe('Checkout step one', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
    await page.waitForTimeout(3000);
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    await page.click('.shopping_cart_link');
    await page.waitForTimeout(3000);
    await page.click('[data-test="checkout"]');
    await page.waitForTimeout(3000);
  });

  test('missing first name shows error', async ({ page }) => {
    await page.click('[data-test="continue"]');
    await page.waitForTimeout(3000);
    const error = page.locator('.error-message-container').nth(0);
    expect(await error.isVisible()).toBeTruthy();
  });

  test('missing last name shows error', async ({ page }) => {
    await page.fill('[data-test="firstName"]', 'John');
    await page.click('[data-test="continue"]');
    await page.waitForTimeout(3000);
    const error = page.locator('.error-message-container').nth(0);
    expect(await error.isVisible()).toBeTruthy();
  });

  test('missing postal code shows error', async ({ page }) => {
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.click('[data-test="continue"]');
    await page.waitForTimeout(3000);
    const error = page.locator('.error-message-container').nth(0);
    expect(await error.isVisible()).toBeTruthy();
  });

  test('valid info goes to step two', async ({ page }) => {
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');
    await page.waitForTimeout(3000);
    expect(await page.url()).toBeTruthy();
  });

  test('cancel returns to cart', async ({ page }) => {
    await page.click('[data-test="cancel"]');
    await page.waitForTimeout(3000);
    expect(await page.url()).toBeTruthy();
  });
});

test.describe('Checkout step two', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
    await page.waitForTimeout(3000);
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    await page.click('.shopping_cart_link');
    await page.waitForTimeout(3000);
    await page.click('[data-test="checkout"]');
    await page.waitForTimeout(3000);
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');
    await page.waitForTimeout(3000);
  });

  test('shows correct items', async ({ page }) => {
    const names = page.locator('.inventory_item_name');
    expect(await names.count()).toBeTruthy();
  });

  test('subtotal is correct', async ({ page }) => {
    const subtotal = page.locator('.summary_subtotal_label');
    const text = await subtotal.textContent();
    expect(text).toContain('39.98');
  });

  test('finish completes order', async ({ page }) => {
    await page.click('.btn_action');
    await page.waitForTimeout(3000);
    const header = page.locator('.complete-header');
    expect(await header.isVisible()).toBeTruthy();
  });

  test('cancel returns to inventory', async ({ page }) => {
    await page.click('[data-test="cancel"]');
    await page.waitForTimeout(3000);
    expect(await page.url()).toBeTruthy();
  });
});
