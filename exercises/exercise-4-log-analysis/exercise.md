# Exercise 4: Log Analysis with AI

> **Learning path position: Step 4 of 5** | **⏱ Estimated time: 45–60 min**
> No Playwright experience needed here. You will read a CI log and ask AI to summarise it, then validate the result.

---

## Prerequisites

Before starting, confirm you can answer yes to all of these:

- [ ] I can read a log file and understand that each line has a timestamp, a severity level, and a message
- [ ] I know what CI/CD means (automated tests that run on a server when code is pushed)
- [ ] I understand that a test suite runs multiple tests and can have both passing and failing tests
- [ ] I have read [Pre-read (Worked Example)](../pre-read/exercise.md)

No Playwright experience is needed. No JavaScript knowledge is needed.

---

## Overview

In this exercise you will give a CI run log to an AI assistant and ask it to make sense of the failures. Your job is to validate the AI's event timeline and error groupings, correct any mistakes in its causal reasoning, and identify what it missed.

---

## Background

The file [`ci-run.log`](ci-run.log) contains the full output of a Playwright CI run on the `feature/update-checkout-flow` branch. The run completed with 5 failures across 45 tests. The failures span three different spec files.

Your task is not just to know *which* tests failed — that's already in the summary. The task is to understand *why* they failed and whether the failures are causally related.

---

## Starter Prompt Template

Copy this template, fill in the placeholder, and submit to your AI assistant.

```
Below is a CI run log from a Playwright test suite. Please analyse it and
provide the following:

1. TIMELINE — A chronological table of significant events:
   | Timestamp | Spec file | Event | Severity |
   List every test start, pass, fail, and error. Include timestamps from the log.

2. FAILURE GROUPS — Group the failures by likely root cause (not just by error
   type). Explain your reasoning for each group.

3. CAUSAL CHAIN — Identify which failures might be causally related vs.
   independent. For failures you believe are related, explain the mechanism.

4. KEY LINES — Quote the 5 most important lines in the log and explain why each
   one matters more than the surrounding noise.

5. NEXT STEP — Given the evidence, what is the single highest-value
   investigation action to take next? Be specific.

## CI run log

[PASTE the full contents of ci-run.log HERE]
```

---

## Task

### Step 1 — Read the log yourself first

Skim the full log before involving AI. Identify:
- Which spec files had failures
- What error type each failure produced (timeout, assertion mismatch, redirect error, etc.)
- Whether any failures look like they might share a root cause

### Step 2 — Prompt the AI for analysis

Construct a prompt that:
1. Pastes the full content of `ci-run.log`
2. Asks the AI to:
   - Create a **chronological event timeline** of the CI run
   - **Group the failures** by error type or likely cause
   - **Identify the most likely failure sequence** — i.e., which failure might have caused or influenced another
   - **Highlight the most relevant log lines** (the ones QA should focus on)

### Step 3 — Evaluate the AI's timeline

Compare the AI's event timeline to the actual log. Check:
- Are the timestamps in the correct order?
- Did the AI miss any significant events?
- Did the AI include irrelevant noise?

### Step 4 — Evaluate the AI's groupings

Does the AI correctly group:
- `performance_glitch_user` timeout → isolated expected flakiness (not related to other failures)
- `problem_user` redirect → upstream demo-app behaviour (not a test bug)
- Cart badge timeouts → potentially related to shared app state
- Checkout `$0.00` price → potentially caused by cart state contamination from a parallel worker

### Step 5 — Validate the causal chain

The log contains an inline note: *"a prior cart.spec.js worker may have triggered a reset"*. Does the AI pick this up? Does it correctly reason about why parallel workers sharing app state on `saucedemo.com` could cause the cart and checkout failures?

---

## Desired Outcomes

By the end of this exercise you will be able to:

- Extract structured insight from a long, noisy log using AI
- Validate AI-generated timelines for chronological accuracy
- Identify when AI is grouping by symptom vs. by root cause
- Correct causal reasoning that conflates isolated flakiness with systemic failures
- Distinguish "next step to investigate" from "already proven by the log"

---

## What Good Looks Like

<details>
<summary>Open after completing Step 2 — example of a strong AI response</summary>

A strong AI response to this log would look like this (abbreviated):

---

**Event Timeline**

| Time | Event |
|------|-------|
| 09:22:58 | CI run started; auth setup began |
| 09:23:03 | Auth setup complete; standard_user session saved |
| 09:23:04–09:24:09 | login.spec.js — 13 pass, 2 fail |
| 09:23:25–09:23:51 | inventory.spec.js — all 7 pass |
| 09:23:32–09:23:52 | cart.spec.js — 8 pass, 2 fail (badge timeout) |
| 09:23:52–09:24:05 | checkout.spec.js — 7 pass, 1 fail ($0.00 price) |
| 09:24:05–09:24:09 | logout.spec.js — all 5 pass |

**Failure Groups**

*Group A — Expected/known flakiness (isolated):*
- `performance_glitch_user` login timeout (15s limit; this user always loads slowly)
- `problem_user` redirect (known upstream app behaviour on CI IP ranges)

*Group B — Likely shared cause (state contamination):*
- 2× cart badge `TimeoutError` (cart badge not visible after addToCart)
- 1× checkout price mismatch ($0.00 instead of $39.98)

**Causal reasoning:** Group B failures likely share a root cause. The log note on the checkout failure states "a prior cart.spec.js worker may have triggered a reset." Because saucedemo.com is a shared backend, concurrent Playwright workers operate on the same server-side session. A reset action by one worker would clear another worker's cart, causing the badge to disappear and the checkout total to be $0.00.

**Most relevant lines to focus on:**
- Line showing `TimeoutError` on `.shopping_cart_badge` (cart failure)
- Checkout error: `Expected: 39.98 / Received: 0` with the inline note
- These two types of failure are likely symptoms of the same cause

---

**Key quality markers of this response:**
- Puts Group A and Group B in separate buckets — does not claim login failures caused cart failures
- Reads the inline note in the log (not just the error type)
- Recommends re-running with `--workers=1` as the next step to confirm the hypothesis

If the AI you used did NOT separate Group A from Group B, or did NOT mention the inline note, those are meaningful gaps. Note them and move on to the checklist.

</details>

---

## Review Checklist

Work through each item after receiving the AI's analysis.

### Timeline Accuracy
- [ ] AI's timeline lists events in chronological order matching the log timestamps
- [ ] Auth setup (09:22:58 – 09:23:03) is correctly placed as the first phase
- [ ] Each spec file's run window is correctly identified (login → inventory → cart → checkout → logout)
- [ ] The two cart failures (09:23:36 and 09:23:42) are placed before the checkout failure (09:23:57)

### Error Grouping
- [ ] AI groups the two `performance_glitch_user` / `problem_user` failures separately from the cart/checkout failures
- [ ] AI does NOT incorrectly claim the login failures caused the cart failures
- [ ] AI groups the two cart badge `TimeoutError` failures together as likely sharing a cause
- [ ] AI groups the checkout `$0.00` price failure as potentially related to the cart failures (not as an isolated checkout bug)

### Causal Reasoning
- [ ] AI identifies that parallel workers sharing the `saucedemo.com` backend state is a risk factor
- [ ] AI notes the inline log message: *"prior cart.spec.js worker may have triggered a reset"*
- [ ] AI distinguishes between: (a) flakiness inherent to `performance_glitch_user` and (b) environmental state contamination
- [ ] AI does NOT claim the `problem_user` redirect failure caused anything downstream

### Highlighted Lines
- [ ] AI highlights the two cart `TimeoutError` stack traces as highest priority
- [ ] AI highlights the checkout `$0.00` assertion error with the inline note
- [ ] AI highlights the `problem_user` 401-redirect note as a known upstream issue
- [ ] AI correctly de-prioritises the `performance_glitch_user` timeout as an expected/known flakiness

### Next Steps
- [ ] AI proposes at least one concrete next investigation step (e.g., re-run cart tests in isolation, check worker concurrency settings)
- [ ] AI suggests verifying whether the checkout failure reproduces when cart tests do not run in parallel
- [ ] QA identifies at least one log line the AI dismissed as noise that is actually significant
- [ ] QA identifies at least one line the AI highlighted that is not relevant to the root cause

---

## Key Facts (do not read until after Step 5)

<details>
<summary>Reveal the actual root cause analysis after completing Step 5</summary>

**The two login failures are independent:**
- `performance_glitch_user` timeout: this user deliberately simulates a slow login. The 15-second timeout is tight; this is known flakiness, not a regression.
- `problem_user` redirect: this is a known upstream bug in the demo app on certain CI IP ranges — the user authenticates but is redirected to root instead of `/inventory.html`. Not caused by the branch change.

**The cart and checkout failures share a likely cause — parallel worker state contamination:**
- `saucedemo.com` is a shared demo backend. When multiple Playwright workers run concurrently (4 workers in this run), they all operate on the *same* server-side session state.
- A `cart.spec.js` worker that adds items in one test may see stale state in another, because a *different* worker's `beforeEach` can interfere.
- The checkout test failure (`$0.00` price) occurs because the cart was empty when the checkout overview rendered — the items added in `beforeEach` were not present, likely cleared by a concurrent worker.

**Recommended next steps:**
1. Re-run with `--workers=1` to confirm the cart/checkout failures disappear in serial mode
2. If confirmed, add `test.use({ storageState })` scoping or use isolated user accounts per worker
3. File the `problem_user` redirect issue against the upstream demo app (not the test suite)
4. Consider increasing the `performance_glitch_user` timeout to 30 s or marking the test `test.slow()`

</details>

---

## Bonus Challenges

1. The AI may not know that `saucedemo.com` is a shared backend. How does that hidden assumption affect its causal reasoning?
2. If you had to reduce this 150-line log to a 10-line summary for a manager, which lines would you keep? Does the AI's highlight list match yours?
3. Can you write a Playwright `globalSetup` hook that detects `problem_user` redirect failures and marks them as known issues rather than failures?

---

## Debrief

Answer these questions after completing the exercise. Write your answers down.

1. **Timeline accuracy**: Did the AI's timeline match your own reading of the log? Where did it add something useful you had not noticed, and where did it get the sequence wrong or miss an event?

2. **Grouping logic**: Did the AI correctly separate the login failures from the cart/checkout failures? If it grouped them together, what false assumption was it making — and why does that assumption matter for how you act on the results?

3. **The 10-line manager summary**: If you had to reduce this log to 10 lines for a non-technical stakeholder, which lines would you keep? Compare your selection to what the AI highlighted. Where do your priorities differ, and why?

4. **Broader takeaway**: After Exercises 1–4, you have seen AI generate, review, debug, and analyse. Which role has AI played most reliably so far? Which has felt most risky to trust without verification?

---

## Next Exercise

**[Exercise 5: Root Cause Analysis](../exercise-5-root-cause-analysis/exercise.md)** — No automation knowledge needed. You will read API responses, database results, and a timeline, then rank hypotheses about a missing database record.
