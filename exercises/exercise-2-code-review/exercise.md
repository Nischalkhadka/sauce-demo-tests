# Exercise 2: AI Code Review

> **Learning path position: Step 2 of 5** | **⏱ Estimated time: 45–60 min**
> You need to be able to read JavaScript, but you do not need to write any. You will read a flawed test file and ask AI to find problems in it, then judge the AI's suggestions.

---

## Prerequisites

Before starting, confirm you can answer yes to all of these:

- [ ] I can read a JavaScript file and roughly understand what the code is doing
- [ ] I know what `async`/`await` means: `await` pauses execution until a promise resolves — it is how Playwright waits for things
- [ ] I understand what a CSS selector is (e.g., `.btn_action` selects elements with the class `btn_action`)
- [ ] I have read [Pre-read (Worked Example)](../pre-read/exercise.md)

If you have not read the Pre-read, read it first. It introduces the key concepts this checklist uses (fixed sleeps, selector quality, assertion strength).

---

## Overview

In this exercise you will use an AI assistant to review a flawed Playwright test file, then critically evaluate the AI's suggestions. The goal is to build judgment: which issues are real problems, which are style preferences, and which did the AI miss entirely?

---

## Background

The file [`flawed-checkout.spec.js`](flawed-checkout.spec.js) is a checkout test written by a developer unfamiliar with the project's conventions. It has **10 deliberate issues** seeded across the file.

For reference, compare it to the clean version:
- [`../../tests/checkout.spec.js`](../../tests/checkout.spec.js) — the production-quality original
- [`../../pages/CheckoutStepOnePage.js`](../../pages/CheckoutStepOnePage.js) — page object the original uses
- [`../../fixtures/index.js`](../../fixtures/index.js) — how fixtures are supposed to be wired

---

## Starter Prompt Template

Copy this template, fill in the placeholder, and submit to your AI assistant.

```
Please review the following Playwright test file for quality issues.

Look specifically for:
- Flakiness risks (fixed sleeps, timing assumptions)
- Fragile selectors (CSS classes, index-based selectors)
- Weak assertions (toBeTruthy, checking URLs exist rather than their value)
- Missing test cleanup (state that bleeds between tests)
- Code duplication
- Hardcoded credentials or sensitive values
- Missing test coverage (important scenarios not tested)

For each issue you find:
1. Quote the problematic line(s)
2. Name the problem category (e.g. "Flakiness — fixed sleep")
3. Explain the consequence if left unfixed (e.g. "will fail on slow CI machines")
4. Provide a concrete fix

Rank your findings: must-fix | should-fix | nice-to-have

## File to review: flawed-checkout.spec.js

[PASTE the full contents of flawed-checkout.spec.js HERE]
```

---

## Task

### Step 1 — Read the file yourself first

Before involving AI, read `flawed-checkout.spec.js` carefully. Note any issues you spot. This establishes your baseline.

If you are new to Playwright, you may not catch all 10 issues — that is fine. Note the ones that seem wrong or unusual, even if you cannot name the exact problem.

### Step 2 — Prompt the AI for a code review

Write a prompt that asks the AI to:
- Review `flawed-checkout.spec.js` for flakiness, maintainability, and test quality
- Identify selector issues, weak assertions, missing cleanup, and duplication
- Suggest concrete fixes for each issue it finds

Paste the full file content into your prompt.

### Step 3 — Evaluate the AI's suggestions

Work through the [Review Checklist](#review-checklist) below. For each item:
- Did the AI catch it? (Yes / No / Partially)
- Is the AI's suggested fix correct and proportionate?
- Is it a must-fix or a nice-to-have?

### Step 4 — Find what the AI missed

Compare the AI's findings to the full list of seeded issues (revealed in the checklist). Note any the AI overlooked and explain why they still matter.

---

## Desired Outcomes

By the end of this exercise you will be able to:

- Prompt an AI effectively for a structured code review
- Distinguish real defects from stylistic preferences in AI review output
- Prioritise findings by risk (flakiness, security, maintainability)
- Identify issues that AI consistently misses and explain why
- Apply the project's coding standards as the acceptance bar for a review

---

## What Good Looks Like

<details>
<summary>Open after completing Step 2 — example of a strong AI response</summary>

A strong AI response would look something like this (abbreviated):

---

**Issue 1 — Fixed sleeps (HIGH PRIORITY)**
> "`page.waitForTimeout(3000)` appears 8 times in this file. This is a major flakiness risk — if the page responds in less than 3 seconds, you are wasting time; if it is slower, the test fails. Playwright auto-waits for elements to be actionable, so these delays are unnecessary. Remove them and use `expect(locator).toBeVisible()` or `toHaveURL()` to assert state instead of sleeping."

**Issue 2 — CSS class selector (MEDIUM)**
> "`.btn_action` is used to click the Login and Finish buttons. CSS class selectors break whenever a developer renames a class during a refactor, even if the button's behaviour is unchanged. Use `[data-test="login-button"]` and `[data-test="finish"]` instead — these are stable attributes added for testing."

**Issue 3 — Hardcoded credentials (MEDIUM)**
> "'`standard_user`' and '`secret_sauce`' are hardcoded inline. If the password changes in the test environment, every file that contains it must be updated. Use environment variables (`process.env.TEST_PASSWORD`) or the auth setup pattern this project already uses (`playwright/.auth/standard_user.json`)."

**Issue 4 — Weak `toBeTruthy()` assertion (MEDIUM)**
> "`expect(await error.isVisible()).toBeTruthy()` tells you nothing about what element was visible or what text it contained. When this fails, you see 'expected false to be truthy' — no context whatsoever. Use `expect(locator).toBeVisible()` or `expect(locator).toHaveText('Error: ...')` to get meaningful failure messages."

---

**Key quality markers:**
- Issues are ranked by risk, not alphabetically
- Each fix is concrete (names the replacement, not just "use a better selector")
- The response does not flag purely stylistic issues as high priority
- It identifies both the symptom (the bad pattern) and the consequence (why it matters in practice)

If the AI you used flagged all 10 issues but gave equal weight to all of them (e.g., ranked the magic number the same as `waitForTimeout`), that is a quality gap. Part of your job is to re-rank the findings.

</details>

---

## Review Checklist

Each item corresponds to one seeded issue. Mark whether the AI caught it, and assess the suggested fix.

### Flakiness
- [ ] **Fixed sleeps** — `page.waitForTimeout(3000)` appears before nearly every action. AI should flag these as flakiness risks and suggest replacing them with explicit `expect(...).toBeVisible()` waits or removing them entirely (Playwright auto-waits).
- [ ] **URL assertion** — `expect(await page.url()).toBeTruthy()` only checks that a URL string exists, not that the page navigated correctly. AI should flag this as a meaningless assertion.

### Selectors
- [ ] **CSS class selector** — `.btn_action` is used to click the login button and the finish button. AI should flag this as fragile (class names change frequently during refactoring) and recommend `[data-test="login-button"]` / `[data-test="finish"]` instead.
- [ ] **Index selector** — `.error-message-container.nth(0)` uses a positional index without explanation. AI should note this is fragile if more containers are added, and suggest `[data-test="error"]` instead.

### Assertions
- [ ] **Weak `toBeTruthy()` assertion** — Multiple assertions check only that a value is truthy (e.g., `expect(await error.isVisible()).toBeTruthy()`). AI should flag these as providing minimal signal on failure and recommend `expect(locator).toBeVisible()` or `expect(locator).toHaveText(...)`.
- [ ] **Subtotal magic number** — `expect(text).toContain('39.98')` embeds a magic number with no variable name. AI should suggest extracting it to a named constant like `const EXPECTED_SUBTOTAL = 39.98`.

### Test Structure & Isolation
- [ ] **No cleanup** — The `afterEach` hook is absent. Cart state accumulates across tests because each `beforeEach` logs in fresh but adds more items on top of an already-populated cart from the previous run. AI should flag the missing cleanup and suggest `await page.goto('/')` or using `storageState` reset.
- [ ] **Duplicated `beforeEach` block** — The `beforeEach` in "Checkout step two" is a near-identical copy of the one in "Checkout step one" (login + add items + go to cart + proceed to checkout), with extra steps added on. AI should flag this duplication and suggest a shared helper or a nested `describe`.

### Security & Maintainability
- [ ] **Hardcoded credentials** — `'standard_user'` and `'secret_sauce'` are inline in the `loginAsStandardUser` helper. AI should flag this as a security/maintenance risk and suggest moving credentials to environment variables or the `auth.setup.js` pattern already used by the project.

### Coverage Gaps
- [ ] **Missing edge cases** — There is no test for: (a) completing checkout and returning to inventory via the "back home" button, (b) verifying the tax + item total = grand total calculation. AI may or may not flag these. Note whether it does and whether those gaps are critical.

---

## Scoring Guide

Use this to rate the AI's review:

| Score | Criteria |
|-------|----------|
| Excellent | Caught 8–10 issues with accurate, actionable fixes |
| Good | Caught 6–7 issues; fixes are mostly correct |
| Adequate | Caught 4–5 issues; some fixes are vague or wrong |
| Poor | Caught fewer than 4; major issues missed |

---

## Bonus Challenges

1. Re-run the prompt with a different AI model. Does it catch more or fewer issues? Which ones does each consistently miss?
2. Ask the AI to produce a fixed version of the file. Does it apply all its own suggestions correctly?
3. What would a *false positive* look like from the AI — a suggestion that sounds reasonable but would actually make the test worse?

---

## Debrief

Answer these questions after completing the exercise. Write your answers down.

1. **AI vs. your own read**: Did the AI catch anything you missed in Step 1? Did you catch anything the AI missed? What does this suggest about using AI as a *complement* to your own review rather than a *replacement*?

2. **Signal vs. noise**: Of all the suggestions the AI made, which one would you act on first in a real codebase, and which one would you deprioritise or ignore? What is your reasoning?

3. **False positive test**: Did the AI flag anything that was actually correct, or suggest a "fix" that would have made the code worse? If yes, describe it. If no, what kind of suggestion would constitute a false positive in a code review?

4. **Category blind spots**: Looking at the 10 seeded issues, which *category* of problem (flakiness, selectors, assertions, structure, security) does the AI seem most and least reliable at finding? Is that what you expected?

---

## Next Exercise

**[Exercise 3: Debug Broken Automation](../exercise-3-debug-broken-automation/exercise.md)** — You will feed a failing test plus evidence files to AI and evaluate its debugging hypotheses.
