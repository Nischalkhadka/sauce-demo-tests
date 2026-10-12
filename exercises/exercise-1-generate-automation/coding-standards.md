# Coding Standards: sauce-demo-tests Playwright Suite

These are the conventions used in this codebase. Any AI-generated test must follow them.

---

## 1. Framework & Entry Point

- Framework: **Playwright** (`@playwright/test`)
- Always import `test` and `expect` from the custom fixtures file:
  ```js
  const { test, expect } = require('../../fixtures');
  ```
- Never import directly from `@playwright/test` in spec files.

---

## 2. Selector Strategy (Priority Order)

| Priority | Strategy | Example |
|----------|----------|---------|
| 1st | `data-test` attribute | `[data-test="login-button"]` |
| 2nd | Stable DOM id | `#react-burger-menu-btn` |
| 3rd | Semantic role | `page.getByRole('button', { name: 'Login' })` |
| Avoid | CSS class | `.btn_action`, `.inventory_item` |
| Avoid | XPath | `//button[@class='btn']` |
| Avoid | Index-based | `.nth(0)` without an explicit comment explaining why |

All `data-test` selectors on saucedemo.com use the `data-test` attribute (not `data-testid`).

---

## 3. Page Object Model

- One class per page or major component, located in `pages/`.
- Page objects expose **named locators** as instance properties and **action methods** as async functions.
- Tests interact with pages only through page object methods — never with raw selectors inside a spec file.
- Example:
  ```js
  // pages/SideMenu.js
  async resetAppState() {
    await this.open();
    await this.resetAppStateLink.click();
  }
  ```
- The `SideMenu` object is instantiated inside `InventoryPage` — access it from there.

---

## 4. Fixtures

- All page object instances are provided via the custom fixture in `fixtures/index.js`.
- Use destructured fixture parameters in test functions:
  ```js
  test('example', async ({ inventoryPage, cartPage }) => { ... });
  ```
- Never instantiate page objects manually inside a spec file.

---

## 5. Async / Waits

- **Never use `page.waitForTimeout()`** — fixed sleeps are forbidden.
- Let Playwright's auto-waiting handle element readiness.
- Use explicit wait assertions only when you need to wait for a state transition:
  ```js
  await expect(locator).toBeVisible();
  await expect(locator).toBeHidden();
  await expect(page).toHaveURL(/pattern/);
  ```

---

## 6. Assertions

- Use `expect` from the fixtures import.
- Prefer specific assertions over generic ones:
  ```js
  // Good
  await expect(inventoryPage.cartBadge).toHaveText('2');
  await expect(inventoryPage.cartBadge).toBeHidden();

  // Bad
  expect(await inventoryPage.cartBadge.isVisible()).toBeTruthy();
  ```
- For text content, use `toHaveText()` or `toContainText()`, not `textContent()` + `toBe()`.

---

## 7. Test Isolation

- Each test must be independently runnable — no shared mutable state between tests.
- `beforeEach` sets up the required preconditions; `afterEach` is used when cleanup is needed.
- Do not depend on the side effects of a previous test.
- The suite uses a shared auth state (`playwright/.auth/standard_user.json`) saved by `auth.setup.js`. Tests that need a different auth state must override it with `test.use({ storageState: ... })`.

---

## 8. Test Data

- User credentials live in `auth.setup.js` only — do not hardcode them in spec files.
- Product slugs (e.g., `'sauce-labs-backpack'`) are acceptable in spec files as they are stable identifiers.
- Avoid magic numbers for prices; use descriptive variable names or inline comments.

---

## 9. File & Naming Conventions

- Spec files: `tests/<feature>.spec.js`
- Page objects: `pages/<PageName>.js` (PascalCase class, camelCase file name optional)
- `test.describe()` groups logically related tests; top-level describe matches the feature name.
- Test names are written as sentences describing observable behaviour, e.g.:
  - `'cart badge disappears after reset'`
  - `'add-to-cart buttons restore after reset'`
