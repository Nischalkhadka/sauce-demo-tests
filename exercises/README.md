# AI-Assisted QA Exercises

A hands-on training program for QA engineers learning to work effectively with AI. Participants use a real Playwright test suite — [`sauce-demo-tests`](https://github.com/Nischalkhadka/sauce-demo-tests), targeting [saucedemo.com](https://www.saucedemo.com) — as the shared codebase throughout. Every exercise is self-contained: no local Node.js setup required to complete the core tasks.

**Total time:** 6–8 hours for all six exercises, or ~3 hours for Exercises 1–3 alone.

**AI access required:** A free-tier account on [Claude.ai](https://claude.ai) or [ChatGPT](https://chat.openai.com) is sufficient for every exercise. No API key or paid plan needed.

---

## Start Here

**[Read the pre-read first →](pre-read/exercise.md)**

It walks through one complete AI interaction — prompt, response, evaluation, correction — in about 15 minutes. Every exercise that follows uses the same vocabulary and evaluation approach. Skipping it means arriving at Exercise 1 without the shared frame of reference.

One expectation to set before you begin: **AI output is a first draft, not a final answer.** Every exercise asks you to evaluate what the AI produces against real evidence or project standards. The checklist in each exercise is the correction mechanism — your job is to use it, not skip it.

---

## Learning Path

Work through the exercises in order. Each one practises a different AI role and builds on the previous one.

| Step | Exercise | AI's Role | Time |
|------|----------|-----------|------|
| Pre-read | [Worked Example](pre-read/exercise.md) | Generator (guided walkthrough) | 15–20 min |
| 1 | [Generate Automation](exercise-1-generate-automation/exercise.md) | Generator | 60–90 min |
| 2 | [Code Review](exercise-2-code-review/exercise.md) | Reviewer | 45–60 min |
| 3 | [Debug Broken Automation](exercise-3-debug-broken-automation/exercise.md) | Debugger | 60–90 min |
| 4 | [Log Analysis](exercise-4-log-analysis/exercise.md) | Analyst | 45–60 min |
| 5 | [Root Cause Analysis](exercise-5-root-cause-analysis/exercise.md) | Investigator | 45–60 min |
| Capstone | [Full QA Cycle](exercise-6-capstone/exercise.md) | All five roles | 90–120 min |

The folder numbers match the exercise order. Do the capstone last — it assumes fluency in all five roles.

---

## Goals

By the end of this program, participants will be able to:

- Write AI prompts that produce useful, project-specific output rather than generic boilerplate
- Evaluate AI-generated test code against real coding standards and reject or correct it where needed
- Feed structured, multi-source evidence to AI for debugging and root cause analysis
- Validate AI outputs — timelines, hypothesis rankings, causal chains — rather than accepting them at face value
- Distinguish between what AI can determine from the evidence given and what requires additional investigation
- Produce a professional bug report that a developer can act on without follow-up questions

---

## What Participants Produce

Each exercise has a concrete output that can be used as a discussion artefact in a group session or submitted for review in a self-paced program.

| Exercise | Output |
|----------|--------|
| Pre-read | Completed readiness checklist (4 items) |
| 1 — Generate Automation | AI-generated test file evaluated against the coding-standards checklist; list of any gaps AI missed |
| 2 — Code Review | Ranked list of AI findings (must-fix / should-fix / nice-to-have); note of any issue AI missed from the 10 seeded ones |
| 3 — Debug Broken Automation | Hypothesis table (hypothesis → evidence → verdict); root cause chain statement; proposed fix for each bug |
| 4 — Log Analysis | Validated event timeline; corrected failure groupings; one concrete next investigation step |
| 5 — Root Cause Analysis | Ranked hypothesis list with evidence mapping; pivotal clue identification; targeted next step |
| Capstone | Written one-page bug report suitable to send to the development team |

---

## Folder Structure

```
exercises/
├── README.md                              ← this file
├── facilitator-notes.md                   ← session formats, stumbling points, debrief prompts
│
├── pre-read/
│   └── exercise.md                        ← worked example; read before any exercise
│
├── exercise-1-generate-automation/
│   ├── exercise.md
│   ├── user-story.md
│   └── coding-standards.md
│
├── exercise-2-code-review/
│   ├── exercise.md
│   └── flawed-checkout.spec.js            ← deliberately flawed test (10 seeded issues)
│
├── exercise-3-debug-broken-automation/
│   ├── exercise.md
│   ├── broken-visual.spec.js              ← failing test (3 seeded bugs)
│   ├── console-errors.txt
│   ├── api-mock-response.json
│   └── screenshot-description.md
│
├── exercise-4-log-analysis/
│   ├── exercise.md
│   └── ci-run.log                         ← 150-line CI run with 5 failures
│
├── exercise-5-root-cause-analysis/
│   ├── exercise.md
│   ├── ui-evidence.md
│   ├── api-response.json
│   ├── db-query-result.json
│   └── timeline.md
│
└── exercise-6-capstone/
    └── exercise.md                        ← all five roles in one connected scenario
```

Each exercise folder is self-contained. All materials are either embedded in `exercise.md` or present as sibling files in the same folder.

---

## Running This as a Training Session

Facilitator notes are provided separately (not included in this repo). They cover session format options (half-day, full-day, two-day, self-paced), common stumbling points per exercise, debrief prompts, and timing splits for the capstone. Contact the program owner to request a copy.

---

## File Index

### Entry points

| File | Description |
|------|-------------|
| [pre-read/exercise.md](pre-read/exercise.md) | Worked example — one complete AI interaction, from prompt to evaluation. Read this first. |

### Exercise 1 — Generate Automation

| File | Description |
|------|-------------|
| [exercise-1-generate-automation/exercise.md](exercise-1-generate-automation/exercise.md) | Task, scaffolding, starter prompt template, checklist, debrief |
| [exercise-1-generate-automation/user-story.md](exercise-1-generate-automation/user-story.md) | Reset App State user story with acceptance criteria — paste into the AI prompt |
| [exercise-1-generate-automation/coding-standards.md](exercise-1-generate-automation/coding-standards.md) | Project coding standards extracted from the real repo — paste into the AI prompt |

### Exercise 2 — Code Review

| File | Description |
|------|-------------|
| [exercise-2-code-review/exercise.md](exercise-2-code-review/exercise.md) | Task, starter prompt template, scoring guide, checklist, debrief |
| [exercise-2-code-review/flawed-checkout.spec.js](exercise-2-code-review/flawed-checkout.spec.js) | Checkout test with 10 seeded issues — the file participants ask AI to review |

### Exercise 3 — Debug Broken Automation

| File | Description |
|------|-------------|
| [exercise-3-debug-broken-automation/exercise.md](exercise-3-debug-broken-automation/exercise.md) | Task, starter prompt template, hypothesis framework, checklist, debrief |
| [exercise-3-debug-broken-automation/broken-visual.spec.js](exercise-3-debug-broken-automation/broken-visual.spec.js) | Visual regression test with 3 seeded bugs |
| [exercise-3-debug-broken-automation/console-errors.txt](exercise-3-debug-broken-automation/console-errors.txt) | Browser console output from the failing CI run |
| [exercise-3-debug-broken-automation/api-mock-response.json](exercise-3-debug-broken-automation/api-mock-response.json) | Session endpoint response showing `"authenticated": false` |
| [exercise-3-debug-broken-automation/screenshot-description.md](exercise-3-debug-broken-automation/screenshot-description.md) | Description of what CI actually captured (login page, not inventory) |

### Exercise 4 — Log Analysis

| File | Description |
|------|-------------|
| [exercise-4-log-analysis/exercise.md](exercise-4-log-analysis/exercise.md) | Task, starter prompt template, evaluation steps, checklist, debrief |
| [exercise-4-log-analysis/ci-run.log](exercise-4-log-analysis/ci-run.log) | 150-line Playwright CI run with 5 failures across 3 spec files |

### Exercise 5 — Root Cause Analysis

| File | Description |
|------|-------------|
| [exercise-5-root-cause-analysis/exercise.md](exercise-5-root-cause-analysis/exercise.md) | Task, starter prompt template, hypothesis framework, checklist, debrief |
| [exercise-5-root-cause-analysis/ui-evidence.md](exercise-5-root-cause-analysis/ui-evidence.md) | What the QA engineer observed on the UI and what was NOT verified |
| [exercise-5-root-cause-analysis/api-response.json](exercise-5-root-cause-analysis/api-response.json) | `POST /api/v1/orders` response — `200 OK` with `"status": "queued"` (the pivotal clue) |
| [exercise-5-root-cause-analysis/db-query-result.json](exercise-5-root-cause-analysis/db-query-result.json) | Database query showing zero rows for the order ID |
| [exercise-5-root-cause-analysis/timeline.md](exercise-5-root-cause-analysis/timeline.md) | 97-second gap between API response and DB query |

### Exercise 6 — Capstone

| File | Description |
|------|-------------|
| [exercise-6-capstone/exercise.md](exercise-6-capstone/exercise.md) | All five AI roles in one scenario — generate, review, debug, analyse, investigate — ending in a written bug report. All materials embedded. |
