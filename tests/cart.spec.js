const { test, expect } = require('../fixtures');

test.beforeEach(async ({ page }) => {
  await page.goto('/inventory.html');
  await expect(page).toHaveURL(/\/inventory\.html/);
});

test.describe('Add to cart (inventory page)', () => {
  test('cart badge is hidden when cart is empty', async ({ inventoryPage }) => {
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('adding a product shows badge count and toggles button to Remove', async ({ inventoryPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton('sauce-labs-backpack')).toHaveText('Remove');
    await expect(inventoryPage.addToCartButton('sauce-labs-backpack')).toHaveCount(0);
  });

  test('adding multiple products increments the badge count', async ({ inventoryPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');

    await expect(inventoryPage.cartBadge).toHaveText('3');
  });

  test('removing a product from the inventory page restores Add to cart and clears the badge', async ({ inventoryPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.removeFromCart('sauce-labs-backpack');

    await expect(inventoryPage.addToCartButton('sauce-labs-backpack')).toBeVisible();
    await expect(inventoryPage.cartBadge).toBeHidden();
  });
});

test.describe('Cart page', () => {
  test('shows added products with correct name, price, and quantity', async ({ page, inventoryPage, cartPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.goToCart();

    await expect(page).toHaveURL(/\/cart\.html/);
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.itemNames).toHaveText('Sauce Labs Backpack');
    await expect(cartPage.itemPrices).toHaveText('$29.99');
    await expect(cartPage.itemQuantity).toHaveText('1');
  });

  test('lists every product added from the inventory page', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.goToCart();

    const names = await cartPage.itemNames.allTextContents();
    expect(names).toEqual(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
  });

  test('removing an item from the cart page updates the list and badge', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.goToCart();

    await cartPage.removeItem('sauce-labs-backpack');

    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.itemNames).toHaveText('Sauce Labs Bike Light');
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('removing all items empties the cart and hides the badge', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.goToCart();

    await cartPage.removeItem('sauce-labs-backpack');

    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.cartBadge).toBeHidden();
  });

  test('Continue Shopping button returns to the inventory page', async ({ page, inventoryPage, cartPage }) => {
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/\/cart\.html/);

    await cartPage.continueShopping();

    await expect(page).toHaveURL(/\/inventory\.html/);
  });

  test('Checkout button is visible and enabled', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.goToCart();

    await expect(cartPage.checkoutButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeEnabled();
  });
});
