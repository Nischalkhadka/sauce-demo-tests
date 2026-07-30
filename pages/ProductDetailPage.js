class ProductDetailPage {
  constructor(page) {
    this.page = page;
    this.name = page.locator('.inventory_details_name');
    this.backButton = page.locator('[data-test="back-to-products"]');
  }

  async goBack() {
    await this.backButton.click();
  }
}

module.exports = { ProductDetailPage };
