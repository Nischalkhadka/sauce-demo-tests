# User Story: Reset App State

**As a** logged-in shopper,  
**I want to** reset the application state using the side menu,  
**So that** my cart is cleared and all product buttons revert to "Add to cart", giving me a clean slate without logging out.

---

## Acceptance Criteria

1. When the user opens the side menu and clicks "Reset App State":
   - The shopping cart badge disappears (cart is empty)
   - All "Remove" buttons on the inventory page revert to "Add to cart"
   - The user remains on the current page (no redirect)

2. If the cart was already empty before the reset:
   - No error occurs
   - The page remains unchanged (idempotent behaviour)

3. The reset does not log the user out — the session remains active.

4. After a reset, the user can immediately add items to the cart again.

---

## Context

The side menu is accessible from any authenticated page via the hamburger icon (top-left).  
The "Reset App State" link has the DOM id `#reset_sidebar_link`.  
The `SideMenu` page object in `pages/SideMenu.js` already has a locator for this link (`this.resetAppStateLink`) but does **not** yet have a `resetAppState()` method — you will need to add one.

---

## Out of Scope

- Resetting state for a user who is not logged in
- Resetting saved addresses or payment methods (not applicable to this app)
