# sauce-demo-tests

Automated end-to-end tests for the [SauceDemo](https://www.saucedemo.com/) app, built with [`@playwright/test`](https://playwright.dev/) and authored interactively via the Playwright MCP server in Claude Code.

## Repo architecture

```
.
├── playwright.config.js   # Test runner config: baseURL, reporter, setup project, storageState reuse
├── package.json           # Project manifest + npm scripts
├── fixtures/
│   └── index.js           # Custom test/expect — injects page objects as fixtures
├── pages/                 # Page Object Model — one class per page/component
│   ├── LoginPage.js
│   ├── InventoryPage.js
│   ├── ProductDetailPage.js
│   ├── CartPage.js
│   ├── CheckoutStepOnePage.js
│   ├── CheckoutStepTwoPage.js
│   ├── CheckoutCompletePage.js
│   ├── SideMenu.js        # Burger-menu component, composed into InventoryPage
│   └── index.js           # Re-exports all page objects for a single import site
├── tests/
│   ├── auth.setup.js      # Logs in once as standard_user, saves storageState for reuse
│   ├── login.spec.js      # Login test suite (valid, invalid, and edge-case scenarios)
│   ├── inventory.spec.js  # Inventory/sorting and product detail navigation tests
│   ├── cart.spec.js       # Add-to-cart and cart page tests
│   ├── checkout.spec.js   # Checkout flow: info form, overview, and order completion
│   ├── logout.spec.js     # Logout and session/cart persistence tests
│   ├── visual.spec.js     # Visual regression (screenshot) tests
│   └── visual.spec.js-snapshots/  # Baseline screenshots compared on each run
├── playwright/.auth/      # Saved login session for storageState reuse (generated, gitignored)
├── playwright-report/     # HTML report output (generated, gitignored)
├── test-results/          # Raw test artifacts: traces, screenshots on failure (generated, gitignored)
└── .gitignore
```

- **`playwright.config.js`** sets `baseURL: 'https://www.saucedemo.com'`, configures the `html` reporter, and defines two projects: a `setup` project that runs any `*.setup.js` file first, and the `chromium` project (which `dependencies: ['setup']` on it) that reuses the saved session via `storageState: 'playwright/.auth/standard_user.json'`.
- **`tests/auth.setup.js`** is that setup project's test: it logs in as `standard_user` once per run and writes the authenticated `storageState` to disk. Every other test then starts already logged in, without re-submitting the login form.
- **`fixtures/index.js`** extends Playwright's base `test` with one fixture per page object (`loginPage`, `inventoryPage`, `cartPage`, etc.), each auto-instantiated with the test's `page`. Specs destructure what they need — `async ({ inventoryPage, cartPage }) => { ... }` — instead of writing `new InventoryPage(page)` in every test.
- **`pages/`** holds the Page Object Model. Each class wraps a page's locators as properties and its actions as methods (e.g. `InventoryPage.addToCart('sauce-labs-backpack')`), so selectors live in one place instead of being repeated across spec files. `SideMenu` is a small component (burger menu / logout) composed into `InventoryPage` via `inventoryPage.menu`.
- **`tests/login.spec.js`** and **`tests/visual.spec.js`** each override the project's default storageState with `test.use({ storageState: { cookies: [], origins: [] } })` since they need a clean, unauthenticated context (they test the login form itself, or log in as different users like `problem_user`/`visual_user`).
- **`tests/inventory.spec.js`**, **`tests/cart.spec.js`**, **`tests/checkout.spec.js`**, and **`tests/logout.spec.js`** rely on the project's default authenticated storageState — their `beforeEach` just navigates to `/inventory.html` rather than logging in from scratch.
- Generated folders (`node_modules/`, `test-results/`, `playwright-report/`, `.playwright-mcp/`, `playwright/.auth/`) are excluded from git via `.gitignore`. Baseline screenshots in `tests/visual.spec.js-snapshots/` are *not* excluded — they're meant to be committed and compared against in future runs.

## What the tests cover

All tests live in `tests/login.spec.js` and target SauceDemo's built-in demo accounts (all use password `secret_sauce`).

### Valid credentials
| Test | Verifies |
|---|---|
| `standard_user` login | Redirects to `/inventory.html`, "Products" header and product list render |
| `problem_user` login | Logs in successfully despite this account's known UI bugs |
| `performance_glitch_user` login | Logs in successfully despite an artificial delay (extended timeout) |
| `visual_user` login | Logs in successfully for visual-regression scenarios |

### Invalid credentials
| Test | Verifies |
|---|---|
| `locked_out_user` | Shows "Sorry, this user has been locked out." and stays on the login page |
| Valid user + wrong password | Shows generic username/password mismatch error |
| Nonexistent username | Shows generic username/password mismatch error |
| Empty username | Shows "Username is required" |
| Empty password | Shows "Password is required" |
| Both empty | Shows "Username is required" (username is validated first) |
| Error banner dismiss | Clicking the "×" button hides the error message |

### Edge cases
| Test | Verifies |
|---|---|
| Direct navigation to `/inventory.html` while unauthenticated | Redirects back to `/` with an auth-required error (no auth bypass) |
| Case-sensitive username (`Standard_User`) | Rejected — usernames are case-sensitive |
| Leading/trailing whitespace in username | Rejected — input isn't trimmed server-side |
| SQL-injection-style input (`' OR 1=1--`) | Rejected gracefully, no crash |

### Inventory / sorting

All tests live in `tests/inventory.spec.js`. They reuse the project's authenticated `standard_user` storageState — `beforeEach` just navigates to `/inventory.html`.

| Test | Verifies |
|---|---|
| Default product listing | All 6 products render in A-Z order by default |
| Sort dropdown options | Dropdown offers exactly the 4 expected options (Name A-Z/Z-A, Price low-high/high-low) |
| Sort Z to A | Product name order reverses |
| Sort price low to high | Prices are ascending (checked numerically, not hardcoded) |
| Sort price high to low | Prices are descending (checked numerically, not hardcoded) |
| Click product name | Navigates to that product's detail page (`/inventory-item.html?id=N`) with correct name and a visible back button |
| Back button on detail page | Returns to the product list with all 6 items visible |

### Add to cart / cart page

All tests live in `tests/cart.spec.js`. They reuse the project's authenticated `standard_user` storageState — `beforeEach` just navigates to `/inventory.html`.

| Test | Verifies |
|---|---|
| Empty cart | Cart badge is hidden when no items have been added |
| Add single product | Badge shows count "1" and the button toggles from "Add to cart" to "Remove" |
| Add multiple products | Badge count increments correctly (e.g. "3" after adding 3 items) |
| Remove from inventory page | Button reverts to "Add to cart" and the badge clears |
| Cart page contents | Shows correct product name, price, and quantity for an added item |
| Cart page — multiple items | Lists every product added, in the order added |
| Remove from cart page | Removing one item updates the list and badge count |
| Remove all items | Cart list empties and badge disappears |
| Continue Shopping | Returns to the inventory page from the cart |
| Checkout button | Visible and enabled on the cart page |

### Checkout flow

All tests live in `tests/checkout.spec.js`. The top-level `beforeEach` reuses the authenticated `standard_user` storageState, adds two products, and clicks through to the checkout info step, so each test starts already on `checkout-step-one.html`.

**Step one (your information)**
| Test | Verifies |
|---|---|
| Missing first name | Shows "Error: First Name is required" |
| Missing last name | Shows "Error: Last Name is required" |
| Missing postal code | Shows "Error: Postal Code is required" |
| Valid info | Advances to `checkout-step-two.html` |
| Cancel | Returns to the cart page |

**Step two (overview)** — nested `beforeEach` fills valid info and continues to this step first
| Test | Verifies |
|---|---|
| Item list | Correct product names and prices carried over from the cart |
| Totals | Item total matches expected value ($39.98 for the two seeded products) and `total = item total + tax` (computed, not hardcoded) |
| Cancel | Returns to the inventory page |
| Finish | Completes the order and navigates to `checkout-complete.html` with the correct thank-you message |

**Checkout complete**
| Test | Verifies |
|---|---|
| Back home | Returns to the inventory page and the cart badge is cleared (order is finalized) |

### Logout

All tests live in `tests/logout.spec.js`. They reuse the project's authenticated `standard_user` storageState — `beforeEach` just navigates to `/inventory.html` (already logged in, which is the point: logout has something to log *out* of).

| Test | Verifies |
|---|---|
| Side menu links | Opening the menu shows All Items, About, Logout, and Reset App State |
| Logout action | Redirects to the login page with empty username/password fields |
| Session invalidation | After logout, direct navigation to `/inventory.html` redirects to login with an auth-required error (session is actually cleared server-side, not just hidden client-side) |
| Re-login after logout | Logging back in with the same credentials succeeds and returns to the inventory page |
| Cart persistence | Cart contents survive a logout/login cycle for the same user (cart is stored independently of the session) |

### Visual regression

All tests live in `tests/visual.spec.js` and use `test.use({ storageState: { cookies: [], origins: [] } })` to start from a clean, unauthenticated context (each test logs in as whichever user it needs). Screenshots are compared against baselines committed in `tests/visual.spec.js-snapshots/`.

| Test | Verifies |
|---|---|
| Login page | Full-page screenshot matches baseline |
| `standard_user` inventory page | Full-page screenshot matches baseline |
| `problem_user` inventory page | Full-page screenshot matches baseline — this account has known UI bugs (e.g. broken images), so its baseline documents that known-buggy state; the test catches *further* unintended changes |
| Cart badge | Element-level screenshot of `.shopping_cart_badge` after adding one item |
| Checkout complete page | Full-page screenshot after completing an order matches baseline |

Screenshot baselines are OS/browser-specific (filenames are suffixed e.g. `-chromium-darwin.png`) and were generated on macOS/Chromium — expect the first run on a different OS (e.g. Linux CI) to need its own baseline.

Run `npx playwright show-report` after a test run to see a full HTML report with pass/fail status, timings, and traces per test.

## About Playwright MCP

[Playwright MCP](https://github.com/microsoft/playwright-mcp) is a Model Context Protocol server that exposes a real, controllable browser to an LLM agent (Claude Code, in this repo) as a set of tools — navigate, click, type, snapshot, screenshot, etc. It's what let this test suite be built interactively:

1. The agent drove a live browser via MCP tools (`browser_navigate`, `browser_snapshot`, `browser_type`, `browser_click`) to manually walk through the login flow first.
2. `browser_snapshot` returns an accessibility-tree view of the page with stable element references, which is how form fields and buttons were located without guessing at selectors.
3. Once the manual flow was verified end-to-end, the equivalent steps were codified into a permanent, repeatable `@playwright/test` spec (`tests/login.spec.js`) — the MCP session itself is exploratory/interactive and isn't part of the automated test run.
4. MCP was also used to probe exact error message text and edge-case behavior (e.g., what happens navigating directly to an authenticated page) before writing assertions, so the test expectations reflect real observed app behavior rather than assumptions.

In short: Playwright MCP was the tool used *to build and validate* the tests; `@playwright/test` (via `npx playwright test`) is what actually *runs* them, including in CI.

## Setup

### Prerequisites
- Node.js 16 or later
- npm

### Steps

1. Clone or navigate into the repo:
   ```bash
   cd sauce-demo-tests
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install the Chromium browser binary used by the tests:
   ```bash
   npx playwright install chromium
   ```

## Running the tests

Run the full suite headlessly:
```bash
npm test
```
(equivalent to `npx playwright test`)

This automatically runs the `setup` project first (logging in once and saving `playwright/.auth/standard_user.json`), then runs all spec files against it.

### Quick reference

| Command | What it does |
|---|---|
| `npm test` | Run the full suite headlessly (setup + all spec files) |
| `npx playwright test tests/login.spec.js` | Run a single test file |
| `npx playwright test -g "locked_out_user"` | Run only tests matching a name pattern |
| `npx playwright test --headed` | Run with a visible browser window |
| `npx playwright test --ui` | Interactive UI mode — step through tests, inspect each action |
| `npx playwright test --debug` | Open the Playwright Inspector and pause on the first action |
| `npx playwright test tests/visual.spec.js --update-snapshots` | Regenerate visual regression baselines |
| `npx playwright show-report` | Open the HTML report from the last run |

### Updating visual regression baselines

If a UI change intentionally alters a screenshot, regenerate the baselines:
```bash
npx playwright test tests/visual.spec.js --update-snapshots
```
Review the diffs in `tests/visual.spec.js-snapshots/` before committing them.

### Viewing the HTML report

An HTML report is generated automatically after every run (configured in `playwright.config.js`). To open it:
```bash
npx playwright show-report
```
This starts a local server (default `http://localhost:9223` or the next free port) and opens the report in your browser, showing pass/fail status, durations, and traces for each test.

## Known limitations & caveats

- **Live app, no mocking.** These tests hit the real `https://www.saucedemo.com/` over the network — there's no offline or mocked mode. A test failure could mean either a real regression or that the public demo site itself changed/was down.
- **Visual baselines are OS/browser-specific.** The committed screenshots in `tests/visual.spec.js-snapshots/` were generated on macOS/Chromium (filenames suffixed `-chromium-darwin.png`). Running on a different OS (e.g. Linux CI) will fail on first run until baselines for that platform are generated there — this is expected, not a bug in the suite.
- **Cart persistence across logout is intentional app behavior, not a bug.** SauceDemo stores cart contents independently of the login session, so `tests/logout.spec.js` asserts that persistence rather than a cart reset. If SauceDemo ever changes this, that test's expectation would need updating along with it.
- **`storageState` reuse means most suites assume a fresh cart.** The saved session in `playwright/.auth/standard_user.json` is captured once (before anything is added to the cart) in `tests/auth.setup.js`, so `inventory`, `cart`, and `checkout` tests all start from an empty cart. If the setup file ever adds items before saving state, downstream tests' assumptions would break.
- **`login.spec.js` and `visual.spec.js` opt out of the shared session.** They explicitly reset `storageState` per file since they test different users or the login form itself — if you add a new spec that also needs a different user, remember to do the same rather than relying on the project default.
- **Single browser project.** Only `chromium` is configured; there's no cross-browser (Firefox/WebKit) or mobile-viewport coverage yet.
