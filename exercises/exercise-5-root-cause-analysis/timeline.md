# Event Timeline

## Observed Events

| Time (UTC) | Source | Event |
|------------|--------|-------|
| 09:13:55 | Browser | QA navigated to `/cart.html` — 2 items in cart |
| 09:14:10 | Browser | QA clicked Checkout, filled shipping info |
| 09:14:28 | Browser | QA clicked Finish on checkout step two |
| 09:14:32 | Browser | `/checkout-complete.html` rendered with "Thank you for your order!" |
| 09:14:33 | API logs | `POST /api/v1/orders` received → responded `200 OK` with `orderId: ORD-2026-9981`, `status: queued` |
| 09:14:34 | Browser | QA clicked "Back Home" → returned to `/inventory.html`, cart empty |
| 09:14:40 | Playwright | Automated test `finish button completes the order` passed |
| 09:15:02 | QA | QA checked email inbox — no confirmation email received |
| 09:16:10 | DB | QA queried `staging_orders_db` for `ORD-2026-9981` → 0 rows returned |
| 09:16:14 | DB | QA queried last 5 orders — most recent is `ORD-2026-9975` (created 08:52) |
| 09:17:45 | DB | QA re-queried `staging_orders_db` — still 0 rows for `ORD-2026-9981` |
| 09:18:10 | Dashboard | QA checked order management dashboard — `ORD-2026-9981` not listed |
| 09:18:30 | QA | QA opened a second order (from a previous run) to confirm dashboard access works — visible |

---

## Gap Analysis

- **09:14:33 → 09:16:10** (97 seconds): The API returned `200 OK` with `status: queued`. No further API events observed in this window. The order should have been processed and written to the database within the `estimatedProcessingSeconds: 5` window the API promised — but it was not.
- **No queue consumer logs available** in this evidence package. The message queue infrastructure is managed by the platform team.
- **The dashboard** does show other orders from earlier in the same session, confirming the QA user has read access to the order management system.

---

## What This Timeline Does NOT Tell Us

- Whether the message queue received the job
- Whether the queue consumer attempted to process the job and failed silently
- Whether the staging environment's queue consumer is running at all
- Whether the `queued` → `confirmed` transition writes to the same `staging_orders_db` database that was queried
- Whether the API's `ORD-2026-9981` order ID was written to any persistent store (even temporarily)
