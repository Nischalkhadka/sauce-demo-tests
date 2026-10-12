# Exercise 3: Debug Broken Automation with AI

> **Learning path position: Step 3 of 5** | **⏱ Estimated time: 60–90 min**
> This exercise combines code reading, auth session concepts, and snapshot testing. Complete Exercises 1 and 2 first.

---

## Prerequisites

Before starting, confirm you can answer yes to all of these:

- [ ] I have completed the Pre-read, Exercise 1, and Exercise 2 (or have equivalent Playwright experience)
- [ ] I understand what an authentication session is: a saved login state that lets you skip the login step in tests
- [ ] I understand what a snapshot test does: it takes a screenshot and compares it to a previously saved baseline image — any visual difference fails the test
- [ ] I can read a JavaScript stack trace and identify which line caused the failure
- [ ] I know what `storageState` means in Playwright: a saved browser state (cookies, local storage) that can be reused across test runs

**If you are not sure about `storageState`:** Read the first 20 lines of [`../../tests/auth.setup.js`](../../tests/auth.setup.js) and [`../../playwright.config.js`](../../playwright.config.js). The config shows how the saved state is applied; the setup file shows how it is created.

---

## Overview

In this exercise you will feed a failing test plus its supporting evidence to an AI assistant and ask it to generate hypotheses about what went wrong. Your job is to **prove or disprove each hypothesis** using the evidence, then identify the real root cause.

---

## Background

The file [`broken-visual.spec.js`](broken-visual.spec.js) is a modified version of the project's visual regression suite. It was committed to a feature branch and immediately failed in CI.

The CI run produced four pieces of evidence. Read all of them before building your AI prompt:

| File | What it contains |
|------|-----------------|
| [`broken-visual.spec.js`](broken-visual.spec.js) | The failing test code |
| [`console-errors.txt`](console-errors.txt) | Browser console output captured during the failing run |
| [`api-mock-response.json`](api-mock-response.json) | Response from the session validation endpoint |
| [`screenshot-description.md`](screenshot-description.md) | Description of what the CI screenshot actually captured |

For additional context, compare against:
- [`../../tests/visual.spec.js`](../../tests/visual.spec.js) — the working original
- [`../../playwright.config.js`](../../playwright.config.js) — project configuration

**Tip for reading code diffs:** Open `broken-visual.spec.js` and `visual.spec.js` side by side. Look for what is present in the working file but absent in the broken one. That is usually where the bug lives.

---

## Starter Prompt Template

Copy this template, fill in the placeholders with the actual file contents, and submit to your AI assistant.

```
A Playwright visual regression test is failing in CI. I have collected four
pieces of evidence. Please generate a numbered list of hypotheses explaining
why this test might be failing.

For each hypothesis:
1. State the hypothesis in one sentence
2. Quote the specific evidence that supports it
3. Quote any evidence that contradicts or weakens it
4. Rate your confidence: High / Medium / Low
5. What would you check first to confirm or rule out this hypothesis?

## Failing test
Name: "standard_user inventory page matches baseline"
Spec file: broken-visual.spec.js

[PASTE the full contents of broken-visual.spec.js HERE]

## Browser console output
[PASTE the full contents of console-errors.txt HERE]

## Session API response
[PASTE the full contents of api-mock-response.json HERE]

## Screenshot description (what CI actually captured)
[PASTE the full contents of screenshot-description.md HERE]
```

---

## Task

### Step 1 — Read all the evidence first

Before involving AI, read each evidence file. Note what you think is wrong and why. This becomes your hypothesis baseline.

Focus on:
- What does the console show happened (in order)?
- What does the screenshot tell you about what state the browser was in?
- What does the API response tell you about the session?
- What is different between `broken-visual.spec.js` and `visual.spec.js`?

### Step 2 — Build an AI prompt

Construct a prompt that:
1. States the failing test name: *"standard_user inventory page matches baseline"*
2. Pastes the full content of `broken-visual.spec.js`
3. Pastes the full content of `console-errors.txt`
4. Pastes the full content of `api-mock-response.json`
5. Pastes the full content of `screenshot-description.md`
6. Asks the AI to: *"Generate a list of hypotheses explaining why this test fails. For each hypothesis, describe what evidence supports or refutes it."*

### Step 3 — Collect the AI's hypotheses

List every hypothesis the AI produces. Assign each a short label (H1, H2, H3, …).

### Step 4 — Prove or disprove each hypothesis

For each hypothesis:
- Which piece of evidence supports it?
- Which piece of evidence contradicts it?
- Final verdict: Confirmed / Refuted / Inconclusive

### Step 5 — Identify the root cause chain

State the actual root cause and the chain of events that led to the failure. Then state the fix.

---

## Desired Outcomes

By the end of this exercise you will be able to:

- Provide AI with structured, multi-source evidence for debugging
- Evaluate AI-generated hypotheses critically against real evidence
- Map evidence to hypotheses (not just accept the AI's conclusion)
- Distinguish a proximate failure (assertion error) from a root cause (expired auth)
- Propose targeted fixes rather than scattershot changes

---

## What Good Looks Like

<details>
<summary>Open after completing Step 2 — example of a strong AI response</summary>

A strong AI response for this exercise would produce a structured hypothesis table:

---

**H1 — Auth session expired / missing storageState override**
- Supporting evidence: `api-mock-response.json` → `"authenticated": false, "reason": "token_expired"`; console log shows `401 Unauthorized` on `/api/v1/session`; screenshot shows login page (not inventory)
- Refuting evidence: none
- Verdict: **Confirmed** — the primary root cause
- Code cause: `broken-visual.spec.js` is missing the `test.use({ storageState: { cookies: [], origins: [] } })` line that exists in the working `visual.spec.js`. Without this override, Playwright loads the saved `standard_user` session, which has expired.

**H2 — Wrong snapshot name / no matching baseline**
- Supporting evidence: `broken-visual.spec.js` line 12 uses `'login-page-linux-chromium.png'`; the committed baseline is `'login-page.png'`
- Refuting evidence: none
- Verdict: **Confirmed** — a secondary, independent bug
- This would fail even if the auth issue were fixed.

**H3 — URL assertion format incorrect**
- Supporting evidence: `expect(page.url()).toEqual('/inventory.html')` — `page.url()` returns the full URL including domain; bare path comparison will always fail. Also missing `await`.
- Refuting evidence: none
- Verdict: **Confirmed** — a tertiary bug

**H4 — Network error caused the failure**
- Supporting evidence: console shows `ERR_NETWORK_CHANGED` on line 1 of the sequence
- Refuting evidence: The network error is followed immediately by a successful retry (401 Unauthorized received), meaning the network issue resolved. The 401 is the real failure, not the network change.
- Verdict: **Refuted** as root cause (it is noise in this case)

---

**Root cause chain the AI should state:**
> Missing `storageState` override → Playwright loads expired session → server rejects session (401) → browser redirected to login page → URL assertion fails (login page URL, not inventory) → screenshot taken on login page → snapshot comparison fails (login page vs. inventory baseline). Secondary: snapshot name mismatch would cause a separate failure even if auth were working.

**Key quality marker:** The AI separates the three bugs as independent (not one causing the others), and identifies the network error as noise rather than a root cause.

If the AI blames the network error as the root cause, or if it does not identify the missing `test.use()` line, those are significant gaps to note.

</details>

---

## Known Issues (for facilitator reference — do not read until after Step 4)

<details>
<summary>Reveal seeded bugs after completing Step 4</summary>

The file has three seeded bugs:

1. **Missing `storageState` override** — The original `visual.spec.js` has `test.use({ storageState: { cookies: [], origins: [] } })` at the top, ensuring each visual test starts with a fresh unauthenticated context. This line was removed from `broken-visual.spec.js`. As a result, Playwright loads the saved `standard_user` session — but that session token expired (confirmed by `api-mock-response.json`). The server rejects it and redirects to the login page.

2. **Wrong snapshot name** — The first test references `'login-page-linux-chromium.png'` but the committed baseline is `'login-page.png'`. Even if the auth issue were fixed, this test would fail with a "no baseline found" error on any platform.

3. **Incorrect URL assertion** — `expect(page.url()).toEqual('/inventory.html')` is a plain string comparison against a bare path. `page.url()` returns the full URL (`https://www.saucedemo.com/inventory.html`). This also skips `await`, meaning the assertion runs synchronously and cannot detect a race condition. The working version uses `await expect(page).toHaveURL(/\/inventory\.html/)`.

**Root cause chain:** expired auth token → session rejected → redirect to login page → URL assertion fails (bare path vs. full URL) → screenshot taken on login page → snapshot comparison fails (and would fail again for the wrong-name baseline).

**Fixes:**
- Restore `test.use({ storageState: { cookies: [], origins: [] } })` at the top of the file
- Rename `'login-page-linux-chromium.png'` to `'login-page.png'`
- Change `expect(page.url()).toEqual('/inventory.html')` to `await expect(page).toHaveURL(/\/inventory\.html/)`
- Re-run `auth.setup.js` to refresh the session file if the token is expired in your own environment

</details>

---

## Review Checklist

Work through each item after completing the exercise.

### Hypothesis Coverage
- [ ] AI generated ≥5 distinct hypotheses
- [ ] "Auth / session token expired" hypothesis is present
- [ ] "Snapshot name mismatch / wrong baseline" hypothesis is present
- [ ] "Race condition on navigation assertion" hypothesis is present
- [ ] "Platform difference (linux vs darwin snapshot)" hypothesis is present
- [ ] "Network error causing redirect" hypothesis is present

### Evidence Mapping
- [ ] Each hypothesis is linked to at least one specific evidence file
- [ ] `api-mock-response.json` (`401` + `"token_expired"`) is used to prove/refute the auth hypothesis
- [ ] `console-errors.txt` (`ERR_NETWORK_CHANGED`, `401 Unauthorized`, redirect) is used to build the event sequence
- [ ] `screenshot-description.md` (login page shown, not inventory) is used to confirm the auth redirect
- [ ] `broken-visual.spec.js` code is inspected to find the missing `test.use()` override

### Root Cause Quality
- [ ] QA identifies "expired auth token" + "missing storageState override" as the primary root cause
- [ ] QA identifies the snapshot name bug as a secondary, independent issue
- [ ] QA identifies the URL assertion bug as a tertiary issue
- [ ] QA distinguishes proximate failure (assertion error on URL/screenshot) from root cause (auth)

### Fix Correctness
- [ ] Proposed fix restores `test.use({ storageState: { cookies: [], origins: [] } })`
- [ ] Proposed fix corrects the snapshot filename
- [ ] Proposed fix corrects the URL assertion to `await expect(page).toHaveURL(/\/inventory\.html/)`

### AI Gaps
- [ ] QA identifies at least one hypothesis the AI proposed that is a red herring (not supported by evidence)
- [ ] QA identifies at least one issue in the code that the AI did not flag

---

## Bonus Challenges

1. Which single piece of evidence is most diagnostic? Could you have found the root cause from it alone?
2. If you only had the screenshot (and not the console log or API response), how would your debugging process change?
3. The `auth.setup.js` file saves credentials to `playwright/.auth/standard_user.json`. How would you add a mechanism to automatically detect token expiry before the visual tests run?

---

## Debrief

Answer these questions after completing the exercise. Write your answers down.

1. **Hypothesis quality**: How many of the AI's hypotheses turned out to be red herrings (not supported by the evidence)? What does the ratio of valid to invalid hypotheses tell you about how much to trust AI debugging output at face value?

2. **Evidence gap**: Was there a moment where you wanted more evidence than you had? What single additional piece of information would have made this exercise much easier to resolve?

3. **Root cause vs. symptom**: The test fails with an assertion error — but that is not the root cause. How did working through the hypotheses help you distinguish the proximate failure from the underlying cause? How would you apply this distinction in a real debugging session?

4. **Process reflection**: Compare debugging with AI hypotheses to debugging alone. Where did the AI speed you up? Where did it slow you down or send you down a wrong path?
