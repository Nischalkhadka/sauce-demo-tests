# sauce-demo-tests

A Playwright end-to-end test suite for [SauceDemo](https://www.saucedemo.com/), built with [`@playwright/test`](https://playwright.dev/) and extended with a hands-on AI training program. The test suite provides the real codebase that powers six QA exercises, each of which teaches a different AI-assisted QA skill — generating tests, reviewing code, debugging failures, analysing CI logs, performing root cause analysis, and putting all five together in a capstone scenario.

---

> **QA engineers running the tests** — jump to [Setup](#setup) and [Running the tests](#running-the-tests).
>
> **Training participants** — start at [exercises/README.md](exercises/README.md). Read the [pre-read](exercises/pre-read/exercise.md) before anything else. Total time commitment: **6–8 hours** across all six exercises (or 3 hours for the first three). A free-tier AI assistant (Claude.ai or ChatGPT) is sufficient — no API key or paid account required.

---

---

## Project Architecture

```
.
├── README.md                              ← this file
├── playwright.config.js                   ← baseURL, reporter, setup project, storageState reuse
├── package.json
│
├── fixtures/
│   └── index.js                           ← custom test/expect — injects page objects as fixtures
│
├── pages/                                 ← Page Object Model — one class per page/component
│   ├── LoginPage.js
│   ├── InventoryPage.js
│   ├── ProductDetailPage.js
│   ├── CartPage.js
│   ├── CheckoutStepOnePage.js
│   ├── CheckoutStepTwoPage.js
│   ├── CheckoutCompletePage.js
│   ├── SideMenu.js                        ← burger-menu component, composed into InventoryPage
│   └── index.js                           ← re-exports all page objects
│
├── tests/
│   ├── auth.setup.js                      ← logs in once, saves storageState for reuse
│   ├── login.spec.js
│   ├── inventory.spec.js
│   ├── cart.spec.js
│   ├── checkout.spec.js
│   ├── logout.spec.js
│   ├── visual.spec.js
│   └── visual.spec.js-snapshots/          ← committed baseline screenshots
│
├── playwright/.auth/                      ← saved login session (generated, gitignored)
├── playwright-report/                     ← HTML report output (generated, gitignored)
├── test-results/                          ← traces and failure screenshots (generated, gitignored)
│
└── exercises/                             ← AI training program
    ├── README.md                          ← exercises overview and file index
    ├── pre-read/
    ├── exercise-1-generate-automation/
    ├── exercise-2-code-review/
    ├── exercise-3-debug-broken-automation/
    ├── exercise-4-log-analysis/
    ├── exercise-5-root-cause-analysis/
    └── exercise-6-capstone/
```

Key design decisions:
- `playwright.config.js` defines two projects: a `setup` project that runs `auth.setup.js` first, and `chromium` which `depends: ['setup']` and reuses the saved session via `storageState`.
- `fixtures/index.js` extends Playwright's base `test` with one fixture per page object, so specs destructure `{ inventoryPage, cartPage }` instead of calling `new InventoryPage(page)` in every test.
- `login.spec.js` and `visual.spec.js` override the project `storageState` with `test.use({ storageState: { cookies: [], origins: [] } })` because they need an unauthenticated context.
- Visual baselines in `tests/visual.spec.js-snapshots/` are committed and OS/browser-specific (`-chromium-darwin.png`); first run on a different platform needs `--update-snapshots`.

---

## Goals

The exercises program trains QA engineers to use AI effectively across five distinct roles. By the end, participants can:

- Write AI prompts that produce project-specific output rather than generic boilerplate
- Evaluate AI-generated test code against real coding standards and reject or correct it where needed
- Feed structured, multi-source evidence to AI for debugging and root cause analysis
- Validate AI outputs — timelines, hypothesis rankings, causal chains — rather than accepting them at face value
- Distinguish what AI can determine from the evidence given versus what requires further investigation
- Produce a professional bug report that a developer can act on without follow-up questions

---

## What Participants Produce

Each exercise has a concrete output that can be used as a discussion artefact or submitted for review.

| Exercise | Output |
|----------|--------|
| Pre-read | Completed readiness checklist (4 items) |
| 1 — Generate Automation | AI-generated test file evaluated against the coding-standards checklist; list of any gaps AI missed |
| 2 — Code Review | Ranked list of AI findings (must-fix / should-fix / nice-to-have); note of any issue AI missed from the 10 seeded ones |
| 3 — Debug Broken Automation | Hypothesis table (hypothesis → evidence → verdict); root cause chain statement; proposed fix for each bug |
| 4 — Log Analysis | Validated event timeline; corrected failure groupings; one concrete next investigation step |
| 5 — Root Cause Analysis | Ranked hypothesis list with evidence mapping; pivotal clue identification; targeted next step |
| Capstone | Written one-page bug report suitable to send to the development team |

No local Node.js setup is required to complete any exercise. An AI assistant (Claude, ChatGPT, or similar) is the only tool participants need. Setup is only required to actually run the generated or fixed tests.

---

## File Index

### Test suite

| File | Description |
|------|-------------|
| [playwright.config.js](playwright.config.js) | Runner config: baseURL, reporter, setup project, storageState |
| [fixtures/index.js](fixtures/index.js) | Custom fixtures — page objects injected as test arguments |
| [pages/InventoryPage.js](pages/InventoryPage.js) | Inventory page object including `SideMenu` composition |
| [pages/SideMenu.js](pages/SideMenu.js) | Burger menu component with `logout()` method |
| [tests/auth.setup.js](tests/auth.setup.js) | One-time login that saves `standard_user` session to disk |
| [tests/checkout.spec.js](tests/checkout.spec.js) | Full checkout flow — reference for Exercise 2 code review |
| [tests/visual.spec.js](tests/visual.spec.js) | Visual regression tests — reference for Exercise 3 debugging |
| [tests/logout.spec.js](tests/logout.spec.js) | Logout and session tests — reference for Exercise 1 generation |

### Exercises

| File | Description |
|------|-------------|
| [exercises/README.md](exercises/README.md) | Full exercises overview, learning path, and file index |
| [exercises/pre-read/exercise.md](exercises/pre-read/exercise.md) | Worked example — one complete AI interaction from prompt to evaluation. Read first. |
| [exercises/exercise-1-generate-automation/exercise.md](exercises/exercise-1-generate-automation/exercise.md) | Generate tests for the Reset App State feature |
| [exercises/exercise-2-code-review/exercise.md](exercises/exercise-2-code-review/exercise.md) | Review a deliberately flawed checkout test (10 seeded issues) |
| [exercises/exercise-3-debug-broken-automation/exercise.md](exercises/exercise-3-debug-broken-automation/exercise.md) | Debug a failing visual regression test using four evidence files |
| [exercises/exercise-4-log-analysis/exercise.md](exercises/exercise-4-log-analysis/exercise.md) | Analyse a 150-line CI log with five failures |
| [exercises/exercise-5-root-cause-analysis/exercise.md](exercises/exercise-5-root-cause-analysis/exercise.md) | Investigate a missing order using API, DB, and timeline evidence |
| [exercises/exercise-6-capstone/exercise.md](exercises/exercise-6-capstone/exercise.md) | All five AI roles in one scenario, ending in a written bug report |

---

## Setup

### Prerequisites

- Node.js 16 or later
- npm

### Steps

```bash
npm install
npx playwright install chromium
```

---

## Running the tests

```bash
npm test                                                        # full suite headlessly
npx playwright test tests/login.spec.js                        # single file
npx playwright test -g "locked_out_user"                       # filter by name
npx playwright test --headed                                    # visible browser
npx playwright test --ui                                        # interactive UI mode
npx playwright test --debug                                     # Playwright Inspector
npx playwright test tests/visual.spec.js --update-snapshots    # regenerate baselines
npx playwright show-report                                      # open HTML report
```

The `setup` project (`auth.setup.js`) runs automatically before any spec file, logs in once as `standard_user`, and saves the session to `playwright/.auth/standard_user.json`. Every other spec reuses that session via `storageState` — no repeated login.

---

## What the tests cover

<details>
<summary>Expand for full test coverage summary</summary>

| Suite | Tests |
|-------|-------|
| `login.spec.js` | Valid logins (4 user types), invalid credentials (7 cases), edge cases (SQL injection, case sensitivity, whitespace) |
| `inventory.spec.js` | Product listing count, sort dropdown options, all 4 sort orders, product detail navigation |
| `cart.spec.js` | Empty cart, add/remove single and multiple items, cart page contents, Continue Shopping |
| `checkout.spec.js` | Step 1 validation (3 fields), step 2 totals (item total + computed tax), Finish, Back Home |
| `logout.spec.js` | Side menu links, logout redirect, session invalidation, re-login, cart persistence |
| `visual.spec.js` | Login page, inventory page (standard_user + problem_user), cart badge, checkout complete |

</details>

---

## Known limitations

- **Live app, no mocking.** Tests hit the real `https://www.saucedemo.com/` — a failure could be a regression or the demo site changing or being down.
- **Visual baselines are OS/browser-specific.** Committed baselines are macOS/Chromium. First run on Linux CI needs `--update-snapshots` to generate that platform's baselines.
- **Single browser project.** Only `chromium` is configured; no Firefox/WebKit or mobile-viewport coverage.
- **Cart persistence across logout is intentional.** SauceDemo stores cart contents independently of the session — `logout.spec.js` asserts this as expected behaviour.
