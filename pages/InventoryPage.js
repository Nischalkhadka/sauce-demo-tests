const { SideMenu } = require('./SideMenu');

class InventoryPage {
  constructor(page) {
    this.page = page;
    this.menu = new SideMenu(page);
    this.title = page.locator('.title');
    this.inventoryList = page.locator('.inventory_list');
    this.inventoryItems = page.locator('.inventory_item');
    this.productNames = page.locator('.inventory_item_name');
    this.productPrices = page.locator('.inventory_item_price');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.sortOptions = page.locator('[data-test="product-sort-container"] option');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
  }

  addToCartButton(productSlug) {
    return this.page.locator(`[data-test="add-to-cart-${productSlug}"]`);
  }

  removeButton(productSlug) {
    return this.page.locator(`[data-test="remove-${productSlug}"]`);
  }

  async addToCart(productSlug) {
    await this.addToCartButton(productSlug).click();
  }

  async removeFromCart(productSlug) {
    await this.removeButton(productSlug).click();
  }

  async sortBy(value) {
    await this.sortDropdown.selectOption(value);
  }

  async getProductNames() {
    return this.productNames.allTextContents();
  }

  async getProductPrices() {
    return this.productPrices.allTextContents();
  }

  async openProduct(index) {
    await this.productNames.nth(index).click();
  }

  async goToCart() {
    await this.cartLink.click();
  }
}

module.exports = { InventoryPage };
