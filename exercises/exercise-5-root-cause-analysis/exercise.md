# Exercise 5: Root Cause Analysis with AI

> **Learning path position: Step 5 of 5** | **⏱ Estimated time: 45–60 min**
> The final exercise. No automation knowledge needed. You will rank hypotheses about a missing database record using real evidence.

---

## Prerequisites

Before starting, confirm you can answer yes to all of these:

- [ ] I know what an HTTP status code means: `200` = the server accepted the request, `4xx` = client error, `5xx` = server error
- [ ] I can read JSON (key-value pairs inside curly braces)
- [ ] I understand what a database query result means: a table of rows returned from a search
- [ ] I have completed [Exercise 4 (Log Analysis)](../exercise-4-log-analysis/exercise.md) or have equivalent experience reading system outputs

You do NOT need to know Playwright, JavaScript, or how to write tests.

---

## Overview

In this exercise you will give an AI assistant a set of evidence from a production-like defect and ask it to propose ranked root cause hypotheses. Your job is to evaluate the AI's ranking, apply your own judgement, and identify the most diagnostic next investigation step.

---

## Background

During a QA session on the staging environment, an order was placed through the full checkout flow. The UI confirmed the order, the automated test passed — but the order does not appear in the order management dashboard or the database.

Four evidence files have been collected:

| File | What it contains |
|------|-----------------|
| [`ui-evidence.md`](ui-evidence.md) | What the QA engineer observed on the UI and in the Playwright test |
| [`api-response.json`](api-response.json) | The raw API request and response for the order submission |
| [`db-query-result.json`](db-query-result.json) | Database query results for the missing order ID |
| [`timeline.md`](timeline.md) | Chronology of all observed events |

---

## Starter Prompt Template

Copy this template, fill in the placeholders, and submit to your AI assistant.

```
I am investigating a defect on a staging environment. A checkout order was
placed via the UI and appeared successful, but the order does not appear in
the database or the order management dashboard.

I have collected four pieces of evidence. Please provide:

1. HYPOTHESIS LIST — Every plausible root cause, ranked from most to least
   likely based on the evidence (not just generic possibilities).

2. For each hypothesis:
   - State the hypothesis in one sentence
   - Quote the specific evidence that supports it
   - Quote any evidence that weakens or contradicts it
   - Confidence level: High / Medium / Low
   - The single most targeted next action to confirm or rule it out

3. PIVOTAL CLUE — Identify the single most diagnostic piece of evidence and
   explain why it narrows the possibilities more than the others.

## Evidence

### UI observation
[PASTE the full contents of ui-evidence.md HERE]

### API request and response
[PASTE the full contents of api-response.json HERE]

### Database query result
[PASTE the full contents of db-query-result.json HERE]

### Event timeline
[PASTE the full contents of timeline.md HERE]
```

---

## Task

### Step 1 — Read all evidence files first

Before involving AI, read each file. Note:
- What the UI confirmed (and what it did NOT verify)
- What the API said (`status` field — look carefully at the response body, not just the HTTP status code)
- What the DB says about this specific order ID — and what the follow-up query reveals
- How much time elapsed between the API response and the DB query

Form your own ranked list of hypotheses before running the AI prompt.

### Step 2 — Prompt the AI for hypotheses

Write a prompt that:
1. Summarises the defect: *"A checkout order was placed on the staging environment. The UI showed a success page. The Playwright test passed. But the order does not appear in the database or dashboard."*
2. Pastes the full content of all four evidence files
3. Asks the AI to: *"List every possible root cause, ranked from most to least likely based on the evidence. For each hypothesis, state what evidence supports it, what evidence refutes it, and what the next investigation step would be."*

### Step 3 — Compare your ranking to the AI's

Where does the AI agree with your ranking? Where does it differ? Who has the stronger evidence-backed argument?

### Step 4 — Identify the pivotal clue

One piece of evidence is more diagnostic than the others. Identify it and explain why.

### Step 5 — State the next investigation step

Given the evidence, what is the single highest-value next action to take? Be specific — name the system, the command, or the person to contact.

---

## Desired Outcomes

By the end of this exercise you will be able to:

- Provide AI with structured multi-source evidence for a backend defect
- Evaluate AI hypothesis ranking against your own evidence-based reasoning
- Identify when AI anchors on the wrong evidence (e.g., the 200 status vs. the `queued` status)
- Distinguish a "200 OK means success" assumption from reading the actual response body
- Propose a targeted, concrete next investigation step rather than a broad investigation plan

---

## What Good Looks Like

<details>
<summary>Open after completing Step 2 — example of a strong AI response</summary>

A strong AI response would lead with this observation before even listing hypotheses:

> "The key signal in the evidence is not the HTTP `200 OK` status but the response body field `"status": "queued"`. This indicates the API did not write the order to the database directly — it handed it to a message queue for asynchronous processing. The database was queried 97 seconds after the API response, which is well beyond the promised 5-second processing window. This strongly suggests the queue consumer is not running or failed silently."

**Ranked hypotheses (strong response):**

1. **Message queue consumer not running / failing silently** — Supported by: `"status": "queued"` (async path, not synchronous write); 97s elapsed with no DB write; no `queued`-status rows in the DB at all. Next step: check consumer process status and error logs.

2. **Environment/DB mismatch** — Staging API may be writing to a different queue or DB than the one queried. Supported by: the API and DB appear to be separate systems in staging. Next step: confirm the staging queue consumer reads from the same queue the API writes to.

3. **Transaction rollback after write** — The record was briefly written then rolled back. Supported by: order ID was generated (API returned it), which usually implies a write attempt. Partially refuted by: no `queued` rows in the DB at all, suggesting the write never happened. Next step: check DB transaction logs.

4. **Order dashboard uses different query** — Dashboard may filter by a status field or use a different key. Supported by: the test only checked the raw `orders` table. Next step: compare the dashboard's SQL query to the one used.

5. **UI/test false positive** — The UI and test only confirmed the API response, not persistence. Supported weakly: this is always a risk. Largely refuted by: the same pattern worked for 5 previous orders; the test passing is evidence the API responded correctly, not that persistence happened.

---

**What makes this a good response:**
- It reads `"status": "queued"` rather than stopping at `200 OK`
- It uses the timeline gap (97 seconds) as evidence
- It uses the follow-up DB query (no `queued` rows ever) as additional signal
- It does not rank "UI bug" highly because the UI evidence is strong
- Each hypothesis has a concrete, specific next step

If the AI you used ranked "UI bug" or "test false positive" in the top 2, or if it did not mention `"status": "queued"`, those are notable gaps. Note them on the checklist.

</details>

---

## Review Checklist

Work through each item after receiving the AI's response.

### Hypothesis Coverage
- [ ] AI proposes ≥5 distinct hypotheses
- [ ] "Message queue not processing / queue consumer down" hypothesis is present
- [ ] "Silent failure / uncaught exception in queue consumer" hypothesis is present
- [ ] "Wrong database / environment mismatch (staging queue writing to dev DB)" hypothesis is present
- [ ] "Order dashboard uses a different query key or schema" hypothesis is present
- [ ] "Transaction rollback after initial write" hypothesis is present
- [ ] "Order ID generated but record never committed" hypothesis is present

### Evidence Mapping
- [ ] AI uses the `"status": "queued"` field (not just the `200 OK`) as the key signal
- [ ] AI notes the `db-query-result.json` finding: no `queued`-status orders exist in the table at all
- [ ] AI uses the follow-up DB query (last 5 orders are all `confirmed`) to reason about the normal write path
- [ ] AI uses the timeline gap (API at 09:14:33, DB queried at 09:16:10 — 97 seconds, well beyond the promised 5s) as evidence that processing failed
- [ ] AI notes the `ui-evidence.md` scope limitation: the UI only confirmed the *response*, not the *persistence*

### Ranking Quality
- [ ] AI ranks "queue consumer issue" or "async processing failure" in the top 2 hypotheses
- [ ] AI does NOT rank "UI bug" or "Playwright test false positive" highly (the UI evidence is strong)
- [ ] AI does NOT rank "API returned the wrong status code" as a top hypothesis (the API returned 200 for a `queued` state — that may be a design issue but is not the root cause of missing data)

### Pivotal Clue Identification
- [ ] QA identifies `"status": "queued"` in the API response body as the pivotal clue — it signals the order was not yet written to DB at response time
- [ ] QA explains why `200 OK` alone is misleading (it confirms receipt, not persistence)
- [ ] QA notes that the DB shows zero `queued`-status rows — meaning the queue-to-DB path has never been observed to work for any order

### Next Step Quality
- [ ] QA proposes a specific next step (not just "investigate further")
- [ ] Acceptable next steps include: check message queue depth/consumer status, inspect queue consumer logs, re-query DB after longer wait (>60s), ask platform team about staging queue health
- [ ] QA explains why this step would confirm or eliminate the top hypothesis faster than any other action

---

## Pivotal Clue (do not read until after Step 4)

<details>
<summary>Reveal the pivotal clue analysis after completing Step 4</summary>

**The pivotal clue is `"status": "queued"` in the API response body.**

Here is why:

1. The API returned `200 OK` — but `200` means "I received your request", not "I saved your order". The actual status is in the body.
2. `"status": "queued"` means the API handed the order to a message queue for asynchronous processing. The API has not yet written anything to the database at the point of the response.
3. The DB shows `0` rows for `ORD-2026-9981` even after 97 seconds — well beyond the promised 5-second processing window.
4. The DB follow-up query reveals no `queued`-status rows at all in the table — meaning the normal queue-to-DB write path never produces a `queued` intermediate state. Either processing is instant and writes `confirmed` directly, or the queue consumer is not running.

**Most likely cause:** The staging message queue consumer is not running or is failing silently. The order was enqueued but never dequeued and processed, so no DB write occurred.

**Next investigation step:** Ask the platform team to verify the staging queue consumer is running (`systemctl status order-processor` or equivalent), and check the consumer's error logs for the 09:14:33 window.

**Secondary possibility:** The staging API and the staging DB are misconfigured to point to different environments — i.e., the API writes to one queue that the dashboard/DB does not read from. The `status` field design also suggests the API team may have never fully implemented the async flow in staging.

</details>

---

## Bonus Challenges

1. The existing Playwright test `finish button completes the order` passed — but it only checks the UI. How would you rewrite it to also verify backend persistence? What trade-offs does that introduce?
2. If the `"status"` field had said `"confirmed"` instead of `"queued"`, how would your hypothesis ranking change?
3. Write a list of questions you would ask the platform team in a 15-minute sync to resolve this fastest.

---

## Debrief

Answer these questions after completing the exercise. Write your answers down.

1. **Pivotal clue agreement**: Did you and the AI identify the same pivotal clue (`"status": "queued"`)? If the AI anchored on `200 OK` instead, what does that tell you about a common AI reasoning pattern — and how would you catch it in a real investigation?

2. **Ranking divergence**: Where did your hypothesis ranking differ from the AI's? Whose ranking do you think was better supported by the evidence, and why?

3. **Two-minute brief**: How would you summarise this defect and your recommended next step to a developer or product manager in two minutes? Write the brief. Compare it to what the AI produced — is AI output ready to send directly, or does it need editing?

4. **Series reflection**: You have now used AI as a generator, reviewer, debugger, analyst, and investigator across five exercises. Write one sentence completing each of these: *"AI saves the most time when ___."* / *"AI needs the most oversight when ___."* / *"The most important habit for working with AI on QA tasks is ___."*

---

## Capstone

Ready to put it all together? **[Capstone: Full QA Cycle](../exercise-6-capstone/exercise.md)** — A single scenario that requires all five skills in sequence, ending in a written bug report.
