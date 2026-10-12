# Exercise 1: Generate Automation with AI

> **Learning path position: Step 1 of 5** | **⏱ Estimated time: 60–90 min**
> This exercise requires you to evaluate generated Playwright code. The Pre-read gives you the foundation.

---

## Prerequisites

Before starting, confirm you can answer yes to all of these:

- [ ] I have completed the [Pre-read (Worked Example)](../pre-read/exercise.md)
- [ ] I know what a Page Object is: a class that wraps a page's selectors and actions so spec files do not need raw selectors
- [ ] I understand the difference between `data-test` selectors and CSS class selectors, and why `data-test` is preferred
- [ ] I know that `waitForTimeout()` is a smell and why (Playwright auto-waits — see the Pre-read)
- [ ] I have a basic understanding of `async`/`await` and Playwright's `expect()` assertion API

If you are not yet comfortable with Page Objects, read through [`../../pages/SideMenu.js`](../../pages/SideMenu.js) and [`../../pages/InventoryPage.js`](../../pages/InventoryPage.js) before starting.

---

## Overview

In this exercise you will use an AI assistant to draft Playwright tests for a **feature not yet covered** in the existing suite. Your job is to write an effective prompt, critically evaluate the AI's output, and decide what to keep, fix, or discard.

---

## Background

The `sauce-demo-tests` repo tests [saucedemo.com](https://www.saucedemo.com). The side menu has a "Reset App State" link that clears the shopping cart. This feature has **no dedicated tests** in the suite.

The `SideMenu.js` page object already has a locator for the reset link (`this.resetAppStateLink = page.locator('#reset_sidebar_link')`) but does **not** yet have a `resetAppState()` method. You will ask the AI to add it and write tests using it.

Relevant files to read before writing your prompt:
- [`user-story.md`](user-story.md) — acceptance criteria for the Reset App State feature
- [`coding-standards.md`](coding-standards.md) — conventions every test in this repo must follow
- [`../../pages/SideMenu.js`](../../pages/SideMenu.js) — the existing page object (note the missing method)
- [`../../pages/InventoryPage.js`](../../pages/InventoryPage.js) — used to verify cart badge and button states
- [`../../fixtures/index.js`](../../fixtures/index.js) — how fixtures are wired

---

## Before You Write the Prompt

This exercise is Step 1, but it uses some Playwright concepts that may be new. Read this section before touching the prompt — it prevents the most common beginner mistakes.

**What is a fixture?**
A fixture is an object that Playwright creates and passes into your test function automatically. In this project, `inventoryPage` is a fixture — when you write `async ({ inventoryPage }) => { ... }`, Playwright creates an `InventoryPage` instance for you. You do not need to call `new InventoryPage(page)` yourself.

**How does SideMenu connect to InventoryPage?**
Look at `pages/InventoryPage.js` line 6: `this.menu = new SideMenu(page)`. The side menu is created *inside* `InventoryPage`, not as a separate fixture. So in a test you access the menu through `inventoryPage.menu.resetAppState()`, not through a separate `sideMenu` fixture.

**Why does the AI need to see SideMenu.js?**
Because `resetAppState()` does not exist yet. If you do not show the AI the current file, it will invent a method name or wiring that does not match the project's pattern.

**What should `resetAppState()` look like?**
Follow the same pattern as `logout()` which already exists in `SideMenu.js`:
```js
async logout() {
  await this.open();
  await this.logoutLink.click();
}
```
The reset method should do the same: open the menu, then click `this.resetAppStateLink`.

---

## Starter Prompt Template

Copy this template, fill in the `[PASTE ... HERE]` placeholders with the actual file contents, then submit to your AI assistant.

```
I am writing Playwright tests for Sauce Demo (saucedemo.com).
The project uses a Page Object Model with custom fixtures.

## User story
[PASTE the full contents of user-story.md HERE]

## Coding standards
[PASTE the full contents of coding-standards.md HERE]

## Current SideMenu.js — note: resetAppState() method is missing
[PASTE the full contents of pages/SideMenu.js HERE]

## InventoryPage.js — for reference on cart badge and button locators
[PASTE the full contents of pages/InventoryPage.js HERE]

## fixtures/index.js — how fixtures are wired
[PASTE the full contents of fixtures/index.js HERE]

## Task
1. Add a resetAppState() method to SideMenu.js following the same pattern as logout().
2. Write a test file tests/reset.spec.js covering exactly these two scenarios:
   - Scenario A: Add two items to cart → open side menu → reset → verify cart badge
     is hidden and "Add to cart" buttons are visible (not "Remove")
   - Scenario B: Empty cart (nothing added) → reset → verify no error and the
     inventory page is still showing

Rules:
- Import test and expect from '../fixtures', not from '@playwright/test'
- Access SideMenu through inventoryPage.menu — do not create new SideMenu(page) in the test
- No page.waitForTimeout() calls
- Use expect(locator).toBeVisible() / toBeHidden() / toHaveText() for assertions
```

---

## Task

### Step 1 — Read the acceptance criteria

Read `user-story.md`. Identify the two most important scenarios to test:
1. Items in cart → reset → cart empty and "Add to cart" buttons restored
2. Empty cart → reset → no error (idempotent)

You will ask the AI to cover these two scenarios only. Do not try to cover all acceptance criteria in one shot — a scoped prompt produces better output.

### Step 2 — Build the AI prompt

Construct a prompt that gives the AI:
1. The two scenarios you want tested (from Step 1)
2. The relevant coding standards (paste the key rules from `coding-standards.md`)
3. The current `SideMenu.js` source (so the AI knows the method is missing and needs to be added)
4. A clear instruction: *"Write a `resetAppState()` method for `SideMenu.js` and a test file `tests/reset.spec.js` covering these two scenarios, following these coding standards."*

Keep the prompt to one page or less. More context is better, but a focused ask beats a vague one.

### Step 3 — Run the prompt

Use Claude, ChatGPT, or another AI assistant. Capture the full response.

### Step 4 — Review the output

Work through the [Review Checklist](#review-checklist) below. For each item, mark Pass / Fail and note what you observe.

### Step 5 — Fix or note gaps

For each checklist item that fails:
- Decide if you would fix the AI's code or write that part yourself
- If you fix it, write the corrected version

---

## Desired Outcomes

By the end of this exercise you will be able to:

- Write AI prompts that provide sufficient context for generating realistic test code
- Evaluate generated test code against a real project's conventions
- Identify flakiness risks, selector anti-patterns, and missing coverage in AI output
- Distinguish between "fix the AI's output" and "write it yourself"

---

## What Good Looks Like

<details>
<summary>Open after completing Step 3 — example of a strong AI response</summary>

A strong AI response for this exercise would produce two files.

**Addition to `pages/SideMenu.js`:**
```js
async resetAppState() {
  await this.open();
  await this.resetAppStateLink.click();
}
```
Clean, follows the same pattern as `logout()` already in the file.

---

**`tests/reset.spec.js` (strong version):**
```js
const { test, expect } = require('../fixtures');

test.describe('Reset App State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
  });

  test('clears the cart and restores Add-to-cart buttons', async ({ page, inventoryPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.menu.resetAppState();

    await expect(inventoryPage.cartBadge).toBeHidden();
    await expect(inventoryPage.addToCartButton('sauce-labs-backpack')).toBeVisible();
    await expect(inventoryPage.addToCartButton('sauce-labs-bike-light')).toBeVisible();
  });

  test('reset on an empty cart causes no error', async ({ page, inventoryPage }) => {
    await expect(inventoryPage.cartBadge).toBeHidden();

    await inventoryPage.menu.resetAppState();

    await expect(inventoryPage.cartBadge).toBeHidden();
    await expect(page).toHaveURL(/\/inventory\.html/);
  });
});
```

**Key quality markers of this response:**
- Imports from `'../fixtures'` (correct relative path for a file in `tests/`)
- Uses `inventoryPage.menu.resetAppState()` — accesses `SideMenu` through `InventoryPage` (how the project wires it)
- Uses `inventoryPage.addToCartButton()` method for assertions — no raw selectors in the spec
- No `waitForTimeout()`
- `beforeEach` only navigates; each test sets up its own preconditions
- `toHaveText('2')` on the badge — a specific assertion, not `toBeTruthy()`

**Common AI mistakes to watch for:**
- Instantiating `new SideMenu(page)` directly in the test instead of going through `inventoryPage.menu`
- Using `expect(await inventoryPage.cartBadge.isHidden()).toBeTruthy()` instead of `expect(inventoryPage.cartBadge).toBeHidden()`
- Adding `page.waitForTimeout(1000)` after the reset click
- Importing `expect` from `@playwright/test` instead of from the fixtures file

</details>

---

## Review Checklist

Work through each item after you receive the AI's output. Mark **Pass**, **Fail**, or **Partial**.

### Selector Quality
- [ ] All selectors use `data-test` attributes or stable IDs — no CSS class selectors or XPath
- [ ] `#reset_sidebar_link` is used for the reset link (not a text-based or class selector)
- [ ] Cart badge absence is checked with `toBeHidden()` — not with `isHidden()` wrapped in `toBeTruthy()`

### Async & Timing
- [ ] No `page.waitForTimeout()` or `setTimeout()` calls present
- [ ] State changes are awaited using `expect(...).toBeVisible()` / `toBeHidden()` / `toHaveURL()`

### Assertions
- [ ] Assertion checks the cart badge is hidden after reset
- [ ] Assertion checks that "Add to cart" button is visible (not "Remove") for at least one product
- [ ] Assertions use `expect` from the fixtures import, not from `@playwright/test` directly

### Test Structure
- [ ] `beforeEach` navigates to the inventory page; individual tests set up their own cart state
- [ ] `SideMenu` is accessed through `inventoryPage.menu` — not instantiated separately
- [ ] Each test can run independently without relying on another test's side effects

### Page Object Usage
- [ ] `resetAppState()` method added to `SideMenu.js` encapsulates menu open + link click
- [ ] `inventoryPage.addToCartButton(slug)` is used for the post-reset assertion — no raw `[data-test="add-to-cart-..."]` selector in the spec

### Coverage
- [ ] Scenario 1 covered: items in cart → reset → cart empty and buttons restored
- [ ] Scenario 2 covered: empty cart → reset → no error, page unchanged
- [ ] Coverage gaps noted: list any acceptance criteria scenario the AI did not test

---

## Bonus Challenges

1. The AI may access `SideMenu` differently from how the project wires it (e.g., creating `new SideMenu(page)` in the test). If it does this, explain why it is wrong and how you would fix it.
2. Re-prompt the AI and ask it to also cover the third acceptance criterion: "after reset, the user can immediately add items again." Does the extra scope improve or degrade the quality of the first two tests?
3. The existing `logout.spec.js` tests the side menu structure. How do you avoid duplicating those assertions in `reset.spec.js`?

---

## Debrief

Answer these questions after completing the exercise. Write your answers down — they are the most valuable output of the exercise.

1. **Surprise**: What was the most unexpected thing about the AI's output — something it got right or wrong that you did not anticipate? What does that tell you about how the AI reasons about code?

2. **Hardest checklist item**: Which item on the review checklist was hardest to evaluate, and what would you need to know to judge it more confidently next time?

3. **Prompt improvement**: If you ran this prompt a second time, what is the one change you would make to get better output? (Think about: context you left out, instructions that were ambiguous, or scope that was too wide.)

4. **Value judgement**: Based on this exercise, complete these two sentences: *"AI is most useful for test generation when ___."* and *"AI is most likely to mislead you when ___."*

---

## Next Exercise

**[Exercise 2: Code Review](../exercise-2-code-review/exercise.md)** — Now that you have seen AI generate code, you will ask it to review flawed code and judge which of its suggestions are valid.
