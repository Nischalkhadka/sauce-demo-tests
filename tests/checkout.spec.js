const { test, expect } = require('../fixtures');

test.beforeEach(async ({ page, inventoryPage, cartPage }) => {
  await page.goto('/inventory.html');
  await expect(page).toHaveURL(/\/inventory\.html/);

  await inventoryPage.addToCart('sauce-labs-backpack');
  await inventoryPage.addToCart('sauce-labs-bike-light');
  await inventoryPage.goToCart();
  await cartPage.checkout();
  await expect(page).toHaveURL(/\/checkout-step-one\.html/);
});

test.describe('Checkout step one (your information)', () => {
  test('missing first name shows required error', async ({ checkoutStepOnePage }) => {
    await checkoutStepOnePage.continueToOverview();

    await expect(checkoutStepOnePage.errorMessage).toHaveText('Error: First Name is required');
  });

  test('missing last name shows required error', async ({ checkoutStepOnePage }) => {
    await checkoutStepOnePage.fillInfo({ firstName: 'John' });
    await checkoutStepOnePage.continueToOverview();

    await expect(checkoutStepOnePage.errorMessage).toHaveText('Error: Last Name is required');
  });

  test('missing postal code shows required error', async ({ checkoutStepOnePage }) => {
    await checkoutStepOnePage.fillInfo({ firstName: 'John', lastName: 'Doe' });
    await checkoutStepOnePage.continueToOverview();

    await expect(checkoutStepOnePage.errorMessage).toHaveText('Error: Postal Code is required');
  });

  test('valid info advances to step two', async ({ page, checkoutStepOnePage }) => {
    await checkoutStepOnePage.fillInfo({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });
    await checkoutStepOnePage.continueToOverview();

    await expect(page).toHaveURL(/\/checkout-step-two\.html/);
  });

  test('cancel button returns to the cart page', async ({ page, checkoutStepOnePage }) => {
    await checkoutStepOnePage.cancel();

    await expect(page).toHaveURL(/\/cart\.html/);
  });
});

test.describe('Checkout step two (overview)', () => {
  test.beforeEach(async ({ page, checkoutStepOnePage }) => {
    await checkoutStepOnePage.fillInfo({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });
    await checkoutStepOnePage.continueToOverview();
    await expect(page).toHaveURL(/\/checkout-step-two\.html/);
  });

  test('lists the correct items and prices from the cart', async ({ checkoutStepTwoPage }) => {
    const names = await checkoutStepTwoPage.itemNames.allTextContents();
    const prices = await checkoutStepTwoPage.itemPrices.allTextContents();

    expect(names).toEqual(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
    expect(prices).toEqual(['$29.99', '$9.99']);
  });

  test('item total, tax, and total add up correctly', async ({ checkoutStepTwoPage }) => {
    const itemTotalText = await checkoutStepTwoPage.subtotalLabel.textContent();
    const taxText = await checkoutStepTwoPage.taxLabel.textContent();
    const totalText = await checkoutStepTwoPage.totalLabel.textContent();

    const itemTotal = parseFloat(itemTotalText.replace('Item total: $', ''));
    const tax = parseFloat(taxText.replace('Tax: $', ''));
    const total = parseFloat(totalText.replace('Total: $', ''));

    expect(itemTotal).toBeCloseTo(39.98, 2);
    expect(total).toBeCloseTo(itemTotal + tax, 2);
  });

  test('cancel button returns to the inventory page', async ({ page, checkoutStepTwoPage }) => {
    await checkoutStepTwoPage.cancel();

    await expect(page).toHaveURL(/\/inventory\.html/);
  });

  test('finish button completes the order', async ({ page, checkoutStepTwoPage, checkoutCompletePage }) => {
    await checkoutStepTwoPage.finish();

    await expect(page).toHaveURL(/\/checkout-complete\.html/);
    await expect(checkoutCompletePage.header).toHaveText('Thank you for your order!');
    await expect(checkoutCompletePage.text).toHaveText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
    );
  });
});

test.describe('Checkout complete', () => {
  test('back home button returns to inventory page and clears the cart', async ({
    page,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
    inventoryPage,
  }) => {
    await checkoutStepOnePage.fillInfo({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });
    await checkoutStepOnePage.continueToOverview();
    await checkoutStepTwoPage.finish();
    await expect(page).toHaveURL(/\/checkout-complete\.html/);

    await checkoutCompletePage.backHome();

    await expect(page).toHaveURL(/\/inventory\.html/);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });
});
