# Pre-read: How to Work with AI on Test Code (Worked Example)

> **⏱ Estimated time: 15–20 min** | Read this before any other exercise. This is not a hands-on task — it is a guided walkthrough of one complete AI interaction, from prompt to evaluation. By the end you will know what a good prompt looks like, what a realistic AI response looks like, and how to spot problems in generated code even when you are not yet an expert.

---

## What This Exercise Teaches

Working with AI on test code is a three-part skill:

1. **Prompting** — giving the AI enough context to produce something useful
2. **Evaluating** — reading the output critically, not just accepting it
3. **Correcting** — knowing which issues to fix and why

This walkthrough demonstrates all three using a real example from the `sauce-demo-tests` codebase.

---

## The Scenario

The inventory page of [saucedemo.com](https://www.saucedemo.com) shows a list of products. You want tests that verify:

1. Exactly 6 products appear on the page
2. Every product has a visible name and a visible price

---

## Part 1: The Prompt

A weak prompt gets weak output. Here is the difference:

### Weak prompt (do not do this)
> "Write a Playwright test that checks the inventory page shows 6 products."

**Why it fails:** The AI does not know which framework conventions to follow, which selectors to use, or how the project is structured. It will invent something plausible but wrong for this codebase.

---

### Strong prompt (this is what we used)

The prompt provides three things: **context** (what the project looks like), **standards** (what good code looks like here), and a **specific ask**.

```
I am writing Playwright tests for a project that tests saucedemo.com.
The project uses a Page Object Model with custom fixtures. 

Here is how the test fixture is set up (fixtures/index.js):

const base = require('@playwright/test');
const { LoginPage, InventoryPage, ... } = require('../pages');

const test = base.test.extend({
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  // ... other fixtures
});
module.exports = { test, expect: base.expect };

Here is the InventoryPage page object (pages/InventoryPage.js):

class InventoryPage {
  constructor(page) {
    this.inventoryItems = page.locator('.inventory_item');
    this.productNames  = page.locator('.inventory_item_name');
    this.productPrices = page.locator('.inventory_item_price');
    // ...
  }
  async getProductNames()  { return this.productNames.allTextContents(); }
  async getProductPrices() { return this.productPrices.allTextContents(); }
  // ...
}

Our coding standards:
- Import test and expect from '../../fixtures', not from '@playwright/test'
- Use page object properties and methods — do not write raw selectors in spec files
- Never use page.waitForTimeout() — Playwright waits automatically
- Assertions: use expect(locator).toHaveCount(n) / toBeVisible() / toHaveText()
- Each test must be independent (no shared mutable state between tests)
- beforeEach navigates to the page under test

Please write a test file tests/inventory-count.spec.js with:
1. A test that verifies exactly 6 products are visible on the inventory page
2. A test that verifies every product has a non-empty name and a non-empty price
```

---

## Part 2: The AI's Response

Below is a realistic AI-generated output for the prompt above. Read it carefully before looking at the evaluation.

```js
// tests/inventory-count.spec.js
const { test, expect } = require('../../fixtures');

test.describe('Inventory product count', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
    await page.waitForTimeout(500); // wait for items to load
  });

  test('shows exactly 6 products', async ({ inventoryPage }) => {
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test('every product has a name and a price', async ({ page, inventoryPage }) => {
    const names  = await page.locator('.inventory_item_name').allInnerTexts();
    const prices = await inventoryPage.getProductPrices();

    expect(names.length).toBe(6);
    expect(prices.length).toBe(6);

    for (const name of names) {
      expect(name.trim()).not.toBe('');
    }
    for (const price of prices) {
      expect(price.trim()).not.toBe('');
    }
  });
});
```

---

## Part 3: Evaluation

Read the AI output critically. Here is a line-by-line evaluation.

---

### Issue 1 — Fixed sleep in `beforeEach` (MUST FIX)

```js
await page.waitForTimeout(500); // wait for items to load
```

**What is wrong:** `waitForTimeout` is a fixed 500ms pause. It is a guess — if the page takes longer than 500ms on a slow CI machine, the next action may fail. If the page loads in 50ms, it wastes time.

**Why Playwright does not need it:** When you call `expect(inventoryPage.inventoryItems).toHaveCount(6)` in the next test, Playwright automatically waits up to the configured timeout (30 seconds by default) for the condition to be true. The `waitForTimeout` is redundant and harmful.

**Fix:** Remove the line entirely. The assertion in each test already handles the wait.

```js
// Before
test.beforeEach(async ({ page }) => {
  await page.goto('/inventory.html');
  await page.waitForTimeout(500); // ← remove this
});

// After
test.beforeEach(async ({ page }) => {
  await page.goto('/inventory.html');
});
```

---

### Issue 2 — Raw selector inside a spec file (FIX)

```js
const names = await page.locator('.inventory_item_name').allInnerTexts();
```

**What is wrong:** The test reaches past the page object and writes its own selector (`.inventory_item_name`). If that CSS class changes, this test breaks — and the fix has to happen in every spec file that used it directly, instead of in one place (the page object).

**What to use instead:** `InventoryPage` already has `getProductNames()`, which returns the same data through the page object. Use that.

```js
// Before
const names = await page.locator('.inventory_item_name').allInnerTexts();

// After
const names = await inventoryPage.getProductNames();
```

---

### Issue 3 — Assertions check length but not content (PARTIAL — acceptable)

```js
for (const name of names) {
  expect(name.trim()).not.toBe('');
}
```

**What is right:** Checking that no name is an empty string is a reasonable "not empty" assertion. For this exercise, it is acceptable.

**What could be stronger:** The existing `inventory.spec.js` asserts the exact product names in alphabetical order. If you want to be certain the right products appear (not just any 6 non-empty strings), assert the full list:

```js
expect(names).toEqual([
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Test.allTheThings() T-Shirt (Red)',
]);
```

This is an improvement, but the AI's version is not wrong — it is just less specific.

---

### What the AI got right

- ✅ Imported from `'../../fixtures'`, not from `'@playwright/test'`
- ✅ Used `inventoryPage.inventoryItems` and `inventoryPage.getProductPrices()` through the page object in most places
- ✅ Used `toHaveCount(6)` — a proper count assertion, not `toBeTruthy()`
- ✅ Used `beforeEach` to navigate, keeping tests DRY
- ✅ Tests are independent of each other

---

## Part 4: The Corrected Version

After applying the two must-fix issues:

```js
// tests/inventory-count.spec.js
const { test, expect } = require('../../fixtures');

test.describe('Inventory product count', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
  });

  test('shows exactly 6 products', async ({ inventoryPage }) => {
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test('every product has a non-empty name and price', async ({ inventoryPage }) => {
    const names  = await inventoryPage.getProductNames();
    const prices = await inventoryPage.getProductPrices();

    expect(names.length).toBe(6);
    expect(prices.length).toBe(6);

    for (const name of names) {
      expect(name.trim()).not.toBe('');
    }
    for (const price of prices) {
      expect(price.trim()).not.toBe('');
    }
  });
});
```

Two changes made: removed `waitForTimeout`, replaced the raw selector with `inventoryPage.getProductNames()`. Everything else kept as the AI wrote it.

---

## Key Takeaways

Before moving to the next exercise, make sure you can answer these:

1. **What makes a prompt strong?** Context + standards + specific ask. The AI cannot read your project; you have to paste the relevant code.

2. **What is the most common AI mistake in test code?** Fixed sleeps (`waitForTimeout`). Look for this in every exercise that follows.

3. **Why does going through a page object matter?** One selector, one place to fix it. Raw selectors in spec files spread fragility across the codebase.

4. **What does "AI got it mostly right" mean in practice?** 3 issues: 1 must-fix (sleep), 1 fix (raw selector), 1 acceptable (weak assertion). You keep ~90% of the AI's output and fix the rest. This is normal — the AI is a first draft, not a final answer.

---

## Before You Move On

Check that you can identify the following without looking at the evaluation:

- [ ] I can spot a `waitForTimeout` call and explain why it is a smell
- [ ] I understand what a page object is and why tests should use it instead of raw selectors
- [ ] I know that `toHaveCount(6)` is a stronger assertion than `expect(count).toBeTruthy()`
- [ ] I understand why the import should be `require('../../fixtures')` not `require('@playwright/test')`

If any item is unclear, re-read Part 3 before continuing.

---

## Recommended Next Exercise

**[Exercise 1: Generate Automation](../exercise-1-generate-automation/exercise.md)** — You will ask AI to write Playwright tests for a real feature gap, then evaluate the output against this project's coding standards.
