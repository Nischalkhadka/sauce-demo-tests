# Capstone: Full QA Cycle with AI

> **⏱ Estimated time: 90–120 min**
> This capstone combines all five skills from the exercise series into one connected scenario. Work through it in sequence — each phase builds on the previous one.

---

## Prerequisites

You have completed all five exercises. If you have not, go back — this capstone assumes you can move fluently between generating, reviewing, debugging, analysing, and investigating with AI.

---

## The Scenario

The product team has shipped a new **Sort by Rating** feature on the inventory page of Sauce Demo. A developer wrote the first tests and pushed them. Within hours, CI is red and a user report has come in: *"Sorted results look wrong in the app."*

You are the QA engineer on call. You have five AI tools in your toolkit. Use them all.

---

## Your Materials

All materials are embedded in this file. Copy each section when a phase asks you to paste it into an AI prompt.

---

### Material A — User Story

```
As a shopper, I can sort products by customer rating (highest first),
so that I can quickly find the most popular items.

Acceptance criteria:
1. The sort dropdown includes a "Rating (high to low)" option.
2. Selecting it reorders all products with the highest-rated product first.
3. Products with equal ratings maintain their previous relative order.
4. The sort persists if the user navigates to a product and returns to inventory.
```

---

### Material B — The Developer's Test (with flaws)

```js
// tests/sort-rating.spec.js
// Quick sort-by-rating tests — dev wrote these in 20 mins

const { test, expect } = require('@playwright/test');

test.describe('Sort by rating', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('.btn_action');
    await page.waitForTimeout(2000);
  });

  test('rating option exists in dropdown', async ({ page }) => {
    const options = await page.locator('[data-test="product-sort-container"] option').allInnerTexts();
    expect(options).toBeTruthy();
  });

  test('products sort by rating', async ({ page }) => {
    await page.selectOption('[data-test="product-sort-container"]', 'rating');
    await page.waitForTimeout(1000);
    const names = await page.locator('.inventory_item_name').allInnerTexts();
    expect(names.length).toBeTruthy();
  });

  test('sort persists after navigation', async ({ page }) => {
    await page.selectOption('[data-test="product-sort-container"]', 'rating');
    await page.waitForTimeout(1000);
    await page.locator('.inventory_item_name').nth(0).click();
    await page.waitForTimeout(1000);
    await page.click('[data-test="back-to-products"]');
    await page.waitForTimeout(1000);
    const sortValue = await page.locator('[data-test="product-sort-container"]').inputValue();
    expect(sortValue).toBeTruthy();
  });
});
```

---

### Material C — CI Failure Log

```
Running 3 tests using 2 workers

[09:41:02.113Z] [worker:0] › tests/sort-rating.spec.js:8:3 › Sort by rating › rating option exists in dropdown

[09:41:05.204Z] [worker:0]
  1) [chromium] › tests/sort-rating.spec.js:8:3 › Sort by rating › rating option exists in dropdown

    Error: expect(received).toBeTruthy()

    Received: ["Name (A to Z)", "Name (Z to A)", "Price (low to high)", "Price (high to low)"]

    Note: The array is truthy (non-empty), but the "Rating (high to low)" option
    is not present in the dropdown. The feature may not be deployed to this environment.

       8 |   test('rating option exists in dropdown', async ({ page }) => {
       9 |     const options = await page.locator('[data-test="product-sort-container"] option').allInnerTexts();
    >  10|     expect(options).toBeTruthy();
          |                    ^
       11|   });

        at tests/sort-rating.spec.js:10:20

[09:41:06.891Z] [worker:1] › tests/sort-rating.spec.js:15:3 › Sort by rating › products sort by rating

[09:41:10.012Z] [worker:1]
  2) [chromium] › tests/sort-rating.spec.js:15:3 › Sort by rating › products sort by rating

    Error: locator.selectOption: Error: Failed to find option with value "rating"
    Call log:
      - selecting option "rating" in <select data-test="product-sort-container">…</select>

       15|   test('products sort by rating', async ({ page }) => {
    >  16|     await page.selectOption('[data-test="product-sort-container"]', 'rating');
          |               ^
       17|     await page.waitForTimeout(1000);

        at tests/sort-rating.spec.js:16:12

[09:41:11.200Z] [worker:0] › tests/sort-rating.spec.js:22:3 › Sort by rating › sort persists after navigation

[09:41:15.317Z] [worker:0]
  3) [chromium] › tests/sort-rating.spec.js:22:3 › Sort by rating › sort persists after navigation

    Error: locator.selectOption: Error: Failed to find option with value "rating"

       22|   test('sort persists after navigation', async ({ page }) => {
    >  23|     await page.selectOption('[data-test="product-sort-container"]', 'rating');
          |               ^
       23|     await page.waitForTimeout(1000);

        at tests/sort-rating.spec.js:23:12

  3 failed
  0 passed
  Finished in 13.2 s
```

---

### Material D — User Bug Report

**Reported by:** beta tester  
**Date:** 2026-10-12 09:55 UTC  
**Environment:** Production — https://www.saucedemo.com  

> "I tried the new rating sort and it's not there. The dropdown only shows name and price options. My colleague on the same account sees the same thing. We both use Chrome on Windows 11."

---

### Material E — API Response (feature flag endpoint)

```json
{
  "endpoint": "GET /api/v1/features",
  "timestamp": "2026-10-12T09:41:00.000Z",
  "status": 200,
  "body": {
    "features": {
      "sort_by_rating": {
        "enabled": false,
        "environments": ["staging-internal"],
        "rollout_percentage": 0,
        "launched_by": "dev-team",
        "note": "Not yet enabled for production or shared demo environments"
      },
      "sort_by_price": { "enabled": true },
      "sort_by_name": { "enabled": true }
    }
  }
}
```

---

## The Five Phases

Work through each phase in order. Each one uses a different AI skill and a different subset of the materials above.

---

### Phase 1 — Generate (15–20 min)

**What you are doing:** Using AI to generate better tests than the developer wrote.

**Materials:** Material A (user story) + the coding standards from [`../exercise-1-generate-automation/coding-standards.md`](../exercise-1-generate-automation/coding-standards.md)

**Your prompt:** Ask AI to generate a proper `tests/sort-rating.spec.js` using the project's conventions (Page Object Model, fixtures, `data-test` selectors, no `waitForTimeout`, specific assertions). The sort option value should be `'lohi'` — this is what saucedemo.com actually uses for price-low-to-high; assume a `'rating'` value would follow the same pattern.

**Evaluate the output:** Apply these checks before moving on:
- [ ] No `waitForTimeout` present
- [ ] Uses custom fixtures (`const { test, expect } = require('../fixtures')`)
- [ ] Assertions check actual sorted order, not just that `length > 0`
- [ ] Uses page objects rather than raw selectors inside the spec

---

### Phase 2 — Review (10–15 min)

**What you are doing:** Using AI to review the developer's original test (Material B) — not your generated one.

**Materials:** Material B (developer's test)

**Your prompt:** Ask AI to review `sort-rating.spec.js` for the same categories as Exercise 2: flakiness, selector quality, assertion strength, cleanup, duplication, credentials, coverage.

**Identify the most critical finding:** Of everything the AI flags, which single issue would have made this test useless even if the feature were deployed correctly? (Hint: the assertion on line 10 is `toBeTruthy()` on an array that will always be truthy — even if the rating option is completely absent.)

---

### Phase 3 — Debug (15–20 min)

**What you are doing:** Using AI to generate hypotheses for why all three tests failed.

**Materials:** Material B (test code) + Material C (CI log) + Material E (API response)

**Your prompt:** Feed all three materials to AI and ask for a numbered hypothesis list with evidence mapping (same template as Exercise 3).

**Your job:**
- Prove or disprove each hypothesis using the materials
- Identify the single clearest piece of evidence that explains the failure
- Note whether the AI correctly identifies the feature flag as the root cause

---

### Phase 4 — Log Analysis (10–15 min)

**What you are doing:** Using AI to analyse the CI failure log.

**Materials:** Material C (CI log only — do not include the API response)

**Your prompt:** Ask AI to create a timeline, group the failures, and suggest a next step. Give it only the log — deliberately withhold the API response to see how far it gets without the full picture.

**Your job:**
- Compare AI's analysis with and without the API response (you have both)
- Note what the AI cannot determine from the log alone
- This teaches you what information to *always* include in a bug report

---

### Phase 5 — Root Cause Analysis (10–15 min)

**What you are doing:** Using AI to rank hypotheses about the user-facing bug.

**Materials:** Material D (user report) + Material E (API response) + Material C (CI log summary — two sentences max)

**Your prompt:** Ask AI to list all possible root causes for why the feature is not visible to users, ranked by likelihood. Ask it to identify the pivotal clue.

**Your job:**
- Verify the AI correctly identifies `"enabled": false` in the feature flag as the root cause
- Note whether AI distinguishes between: (a) the feature not being deployed vs. (b) the test being wrong

---

## Deliverable: Bug Report

Write a one-page bug report that you would actually send to the development team. Include:

| Section | Content |
|---------|---------|
| **Title** | One sentence: what is broken and where |
| **Environment** | Where you tested and when |
| **Steps to reproduce** | Numbered, specific |
| **Expected behaviour** | From the user story |
| **Actual behaviour** | What you observed |
| **Root cause** | Your conclusion from Phase 5 |
| **Evidence** | The one or two most diagnostic pieces |
| **Recommended fix** | Specific and actionable |
| **Test quality note** | One sentence on what needs fixing in the developer's test |

---

## What Good Looks Like

<details>
<summary>Open after completing all five phases — sample strong bug report and phase evaluation notes</summary>

### Sample Bug Report (strong)

**Title:** "Sort by Rating" feature not visible to users — feature flag disabled in all non-internal environments

**Environment:** Production — https://www.saucedemo.com — tested 2026-10-12 09:55 UTC, Chrome 128 / Windows 11

**Steps to reproduce:**
1. Log in to https://www.saucedemo.com with any valid account
2. Open the product sort dropdown on the inventory page
3. Observe the available sort options

**Expected behaviour:** Dropdown includes a "Rating (high to low)" option per the accepted user story (AC1).

**Actual behaviour:** Dropdown shows only four options: Name (A to Z), Name (Z to A), Price (low to high), Price (high to low). No rating option is present.

**Root cause:** The `sort_by_rating` feature flag is set to `"enabled": false` with `"rollout_percentage": 0` and is restricted to `"environments": ["staging-internal"]`. The flag has never been enabled for the production or shared demo environments.

**Evidence:**
- Feature flag API (`GET /api/v1/features`, 2026-10-12 09:41 UTC): `"sort_by_rating": { "enabled": false, "environments": ["staging-internal"], "rollout_percentage": 0 }`
- CI log: all three automated tests failed with `Error: Failed to find option with value "rating"` — confirming the option is absent in the test environment as well

**Recommended fix:** Enable the `sort_by_rating` flag for the target environments once the feature is ready for release. Confirm with the dev team (`launched_by: "dev-team"`) what the intended rollout plan is — the flag note says "Not yet enabled for production or shared demo environments", suggesting a deliberate hold.

**Test quality note:** The developer's automated test uses `expect(options).toBeTruthy()` — an assertion that is always true for any non-empty array, meaning it would pass even if the rating option were completely absent. This test needs to be rewritten to assert `expect(options).toContain('Rating (high to low)')` before it provides any real coverage.

---

### Phase evaluation notes

**Phase 1 — Generate:** A strong AI output uses fixtures, page objects, no `waitForTimeout`, and checks that the sorted results are in descending rating order (not just that `length > 0`). The key weakness to catch: AI may assert `names.length > 0` instead of verifying the actual sort order.

**Phase 2 — Review:** The single most critical finding is `expect(options).toBeTruthy()` on line 10. An array is always truthy — even an empty one would pass. This is a test that can never fail, which means it provides zero coverage. AI should flag this before anything else.

**Phase 3 — Debug:** The clearest diagnostic evidence is Material E (feature flag). Any AI that leads with the feature flag explanation and then ties it to the `"Failed to find option"` errors is reasoning correctly. Watch for AI that blames the test code first (wrong value `'rating'`) without explaining *why* the option doesn't exist.

**Phase 4 — Log Analysis (log only):** Without Material E, AI can correctly identify that all three failures stem from a missing dropdown option, and can suggest "check whether the feature is deployed to this environment" — but it cannot confirm the feature flag as the cause. This is the lesson: logs tell you *what* broke, not always *why*.

**Phase 5 — RCA:** The pivotal clue is `"enabled": false` in the feature flag. A strong AI response distinguishes between: (a) the feature not being deployed at all vs. (b) the test using the wrong option value. Both are true here, but (a) is the user-facing bug; (b) is a secondary test quality issue.

</details>

---

## Debrief

1. **AI across five roles**: In which phase did AI add the most value? In which did it most need your correction or judgement?

2. **The `toBeTruthy()` trap**: The developer's test passed locally (the array is always truthy) but told you nothing useful about the feature. How would you prevent this class of mistake in future code reviews?

3. **Hidden context**: In Phase 4 you gave AI only the log — no API response. How did its analysis differ from Phase 5 when it had full context? What does this tell you about prompt construction?

4. **Bug report quality**: Read your bug report. Would a developer have everything they need to fix this without asking you a follow-up question? If not, what is missing?

5. **Personal adoption plan**: After six exercises, name one concrete change you will make to how you use AI in your QA work starting next week.
