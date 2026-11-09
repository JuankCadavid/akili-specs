# Kaizen Entry — changes/akili-panel-polish

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-polish` |
| Date | 2026-11-09 |
| Branch | `JuankCadavid/akili-panel` (spec branch; apply-capable branch is `dev`, per the `Integration Branch: dev` pin) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 5 (T1, T5 HITL) | tasks.md |
| Reviewer FAIL rework attempts | 5 (T2 ×2, T3 ×2, T4 ×1) | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Budget tripwires | 2 (T2 LOC 813 vs ~650; review rounds 7 at the T4 FAIL), both raised by JC | execution.md — *Budget tripwire: T2*, *Budget tripwire: T4* |
| Pivots | 0 | execution.md |
| Spec tensions settled at the next gate | 2 (FR-7 at 14 columns; FR-5 `$0.00` on a fresh session) | execution.md |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 1 (J-1, fixed, not re-judged) | judgment.md |
| Validation FAIL / WARN | 0 / 5 | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 | test-report.md / validation-report.md |
| Drift attributable | none recorded | no newer `drift-*.md` |

## Lessons

- **KZ-changes--akili-panel-polish-1 — A HITL task with several checks closes per check, not on one overall verdict.** (Methodology, Medium)
  - Root cause: T5's Scope listed seven checks and its Done criteria said only "JC confirms in his own words". The pause offered five numbered steps; JC answered for the whole ("se ve bien en ambos temas") and the Leader closed T5 with the per-step items unreported. `/akili-test` then left FR-4's host-side resize and FR-6 focus as `AUTOMATION_DEFERRED`, which cost an extra live round, and validation still carried W-1 for the other three steps.
  - Evidence: tasks.md T5 Scope and Done criteria; execution.md — *T5 closeout* (*Scope steps* row); test-report.md §8 items 1–2; validation-report.md W-1.
  - Standardization: → P1

- **KZ-changes--akili-panel-polish-2 — A judgment `info` finding that shows a design sentence is false is a factual correction, fixed in the Fix-only pass.** (Methodology, Low)
  - Root cause: judgment-day recorded I-2 ("the tail is kept" cannot hold) and I-6 ("`blocked` can sit on any current phase" is false, verified by the architect). JC's «Fix only» named J-1 and W-2 … W-8, so both stayed `info` and the false sentences stood through execute and test until validation reported them as W-5.
  - Evidence: judgment.md — *Not fixed* row, I-2, I-6; validation-report.md W-5, C-1, C-2.
  - Standardization: → P2

## Noted, not a lesson

- Test LOC ran about three times code LOC (~800 vs ~260) and tripped the LOC budget at T2: recurrence of KZ-bugfix--init-ctrlc-abort-2 → P3.
- `test-report.md` and `design.md` stated wrong figures (9 tests written as 8, 7 `FR-3` tests as 6, "no 2.1.318 binary", a round split summing to 7) found only at validation: recurrence of KZ-002 → P4.
- Both spec tensions were settled at the next gate as one-line amendments, as KZ-changes--persona-upgrade-3 asks; neither reached validation. Working as designed.
- A desktop screenshot at the T1 HITL pause captured private screen content and raised a macOS permission dialog. All later visual checks used terminal text reads and the human's eyes. One occurrence; feeds the recurrence check for "the HITL visual gate is the human looking, never a desktop capture".
- Reviewer FAILs at T2 and T3 were all for missing assertions on THEN/BUT clauses (bold share, draw order, the FR-5 no-new-call contract); each was caught by the Reviewer, none escaped.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Step 3 (HITL tasks) and `/akili-execute` HITL pause: a HITL task whose Scope lists several checks numbers them in Done criteria, the pause asks for a verdict per number, and any number the human's answer does not cover stays open (`[~]`) or is recorded as an accepted gap in the human's words before the task closes. |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Step 2.5 **Fix only**: an `info` finding the architect has verified shows a design sentence to be false is folded into the fix pass as a factual correction (one-line edit, logged), whatever finding IDs the user's answer names. |
| Severity | Low |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-bugfix--init-ctrlc-abort-2 |
| Edit | Add source `changes/akili-panel-polish`; recurrence note: "recurred (changes/akili-panel-polish: tests ~800 vs code ~260 LOC; the ~650 LOC budget tripped at T2 and was raised to ~1,100 by JC)". Severity stays Medium. |
| Severity | Medium |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add source `changes/akili-panel-polish`; recurrence note: "recurred (changes/akili-panel-polish: test-report said 8 tests added and 6 FR-3 tests, 9 and 7 at HEAD, and 'no 2.1.318 binary' while one was installed; design.md's round split summed to 7 of 8. Found at validation W-3/W-4; count the tables a summary line totals)". Severity stays High. |
| Severity | High |
| Status | pending |
