const { test, expect } = require('../fixtures');

test.beforeEach(async ({ page }) => {
  await page.goto('/inventory.html');
  await expect(page).toHaveURL(/\/inventory\.html/);
});

test.describe('Inventory page', () => {
  test('displays all six products by default in A-Z order', async ({ inventoryPage }) => {
    const names = await inventoryPage.getProductNames();

    expect(names).toHaveLength(6);
    expect(names).toEqual([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Test.allTheThings() T-Shirt (Red)',
    ]);
  });

  test('sort dropdown offers all four options', async ({ inventoryPage }) => {
    const options = await inventoryPage.sortOptions.allTextContents();

    expect(options).toEqual([
      'Name (A to Z)',
      'Name (Z to A)',
      'Price (low to high)',
      'Price (high to low)',
    ]);
  });

  test('sorting Z to A reverses product name order', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');

    const names = await inventoryPage.getProductNames();
    expect(names).toEqual([
      'Test.allTheThings() T-Shirt (Red)',
      'Sauce Labs Onesie',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Bike Light',
      'Sauce Labs Backpack',
    ]);
  });

  test('sorting price low to high orders items ascending', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.getProductPrices();
    const values = prices.map((p) => parseFloat(p.replace('$', '')));
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).toEqual(sorted);
  });

  test('sorting price high to low orders items descending', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');

    const prices = await inventoryPage.getProductPrices();
    const values = prices.map((p) => parseFloat(p.replace('$', '')));
    const sorted = [...values].sort((a, b) => b - a);
    expect(values).toEqual(sorted);
  });

  test('clicking a product name navigates to its detail page', async ({ page, inventoryPage, productDetailPage }) => {
    await inventoryPage.openProduct(0);

    await expect(page).toHaveURL(/\/inventory-item\.html\?id=\d+/);
    await expect(productDetailPage.name).toHaveText('Sauce Labs Backpack');
    await expect(productDetailPage.backButton).toBeVisible();
  });

  test('back button on detail page returns to the product list', async ({ page, inventoryPage, productDetailPage }) => {
    await inventoryPage.openProduct(0);
    await expect(page).toHaveURL(/\/inventory-item\.html/);

    await productDetailPage.goBack();

    await expect(page).toHaveURL(/\/inventory\.html/);
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });
});
