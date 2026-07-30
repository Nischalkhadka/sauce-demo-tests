class CartPage {
  constructor(page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.itemQuantity = page.locator('.cart_quantity');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  removeButton(productSlug) {
    return this.page.locator(`[data-test="remove-${productSlug}"]`);
  }

  async removeItem(productSlug) {
    await this.removeButton(productSlug).click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}

module.exports = { CartPage };
