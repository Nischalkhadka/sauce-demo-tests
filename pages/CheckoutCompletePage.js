class CheckoutCompletePage {
  constructor(page) {
    this.page = page;
    this.header = page.locator('.complete-header');
    this.text = page.locator('.complete-text');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async backHome() {
    await this.backHomeButton.click();
  }
}

module.exports = { CheckoutCompletePage };
