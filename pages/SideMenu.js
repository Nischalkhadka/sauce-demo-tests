class SideMenu {
  constructor(page) {
    this.page = page;
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.closeButton = page.locator('#react-burger-cross-btn');
    this.allItemsLink = page.locator('#inventory_sidebar_link');
    this.aboutLink = page.locator('#about_sidebar_link');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.resetAppStateLink = page.locator('#reset_sidebar_link');
  }

  async open() {
    await this.menuButton.click();
  }

  async logout() {
    await this.open();
    await this.logoutLink.click();
  }
}

module.exports = { SideMenu };
