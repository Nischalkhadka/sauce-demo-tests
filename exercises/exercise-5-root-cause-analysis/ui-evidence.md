# UI Evidence: Checkout Complete

**Observed by:** QA Engineer  
**Environment:** Staging — https://staging.saucedemo.internal  
**Browser:** Chrome 131 (macOS Sonoma)  
**Date/Time:** 2026-10-12T09:14:32Z  

---

## Observed UI State (Checklist)

The following UI states were observed and confirmed visually during manual checkout:

- [x] URL: `https://staging.saucedemo.internal/checkout-complete.html`
- [x] Page title (browser tab): "Swag Labs"
- [x] Header text visible: **"Thank you for your order!"**
- [x] Sub-text visible: "Your order has been dispatched, and will arrive just as fast as the pony can get there!"
- [x] Green checkmark illustration rendered below the sub-text
- [x] "Back Home" button present and clickable
- [x] Clicking "Back Home" navigated to `/inventory.html` without error
- [x] Cart badge on `/inventory.html` showed no items (empty cart after order)

---

## Items Ordered

| Product | Qty | Unit Price |
|---------|-----|-----------|
| Sauce Labs Backpack | 1 | $29.99 |
| Sauce Labs Bike Light | 1 | $9.99 |

Checkout info used: First Name: Jane, Last Name: Smith, Postal Code: 10001

---

## Automated Test Result

The Playwright test `finish button completes the order` in `tests/checkout.spec.js` **passed** at the same time:
- Assertion `expect(page).toHaveURL(/\/checkout-complete\.html/)` — PASSED
- Assertion `expect(checkoutCompletePage.header).toHaveText('Thank you for your order!')` — PASSED
- Assertion `expect(checkoutCompletePage.text).toHaveText('Your order has been dispatched...')` — PASSED

---

## What Was NOT Checked at the UI Level

- Whether the order actually persisted in the backend database
- Whether a confirmation email was sent
- Whether the order appeared in the internal order management dashboard
