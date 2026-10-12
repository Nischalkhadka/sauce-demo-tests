# Screenshot Description

**Test:** `standard_user inventory page matches baseline`  
**Captured at:** `2026-10-12T09:31:14Z`  
**Path:** `test-results/visual-regression-standard-user/screenshot.png`  
**Platform:** GitHub Actions (ubuntu-22.04) / Chromium 131

---

## What the Screenshot Shows

The captured screenshot does **not** show the inventory page. Instead it shows:

- **URL bar:** `https://www.saucedemo.com/` (root, not `/inventory.html`)
- **Page content:** The Swag Labs **login form** — username field, password field, and Login button are all visible and empty
- **Top-right corner:** A loading spinner is visible, suggesting the page was still initialising when the screenshot was taken
- **No cart icon:** The shopping cart header (normally present on authenticated pages) is absent
- **No "Products" heading:** The inventory page title is absent

---

## What the Screenshot Should Show (Expected Baseline)

The committed baseline (`visual.spec.js-snapshots/inventory-standard-user-chromium-darwin.png`) shows:

- URL: `/inventory.html`
- Page title: "Products" (visible in the header)
- All 6 product cards listed with images, names, prices, and "Add to cart" buttons
- Cart icon in the top-right with no badge (empty cart)

---

## Comparison

| Attribute | Expected | Actual (screenshot) |
|-----------|----------|---------------------|
| Page shown | Inventory (Products) | Login form |
| URL path | `/inventory.html` | `/` |
| Cart icon | Visible | Not present |
| Login form | Not visible | Fully visible |
| Spinner | Absent | Present (top-right) |

---

## Significance

The screenshot proves the browser was on the **login page**, not the inventory page, when the test attempted to take the snapshot. This is inconsistent with a working authenticated session. The session stored in `playwright/.auth/standard_user.json` was not accepted by the server.
