# Archive Summary — Review Intensity and Model Routing by Proven Verification

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/review-intensity-routing` |
| Archive Path | `docs/specs/archive/2026-09-29-changes--review-intensity-routing/` |
| Archive Date | 2026-09-29 |
| Branch | `master`. Branch Context is `default` and apply-capable, resolved from the `Default Branch: master` pin in `AGENTS.md`; no `Integration Branch:` pin exists |
| Final Status | **Complete: 9/9 tasks PASS · 0 Pivots · validation 0 FAIL · 4 WARN resolved · 1 WARN routed as a follow-up** |
| Released in | v2.27.0 (2026-09-20, `minor`) — shipped before validation and archive ran |

## 2. Outcome

A conformance Reviewer is now conditional on proof, not on size:

- A task may close without a Reviewer only when its falsifier was executed and observed red, its verification is fully deterministic, its `Consumers` reads `none`, and none of seven overrides applies.
- The task's evidence is re-run by a non-author on **every** task. That duty is never waived.
- Closure accepts three states. `REVIEW_SKIPPED` (gate never owed) stays separate from `REVIEW_WAIVED` (gate owed and lost).
- Every task carries a `Review` field, and the intended skip list is shown at the Step 3.3 gate.

**Measured yield of the skip so far: zero.** 0 of 12 held-out records qualify, and this spec's own `skip-eligible` task did not earn its claim.

## 3. Requirements Delivered

| Req | Delivered by | Status |
|---|---|---|
| FR-1 Skip predicate | T1 | ✅ |
| FR-2 Overrides | T1 | ✅ |
| FR-3 Evidence re-run, always | T1, T2 | ✅ |
| FR-4 `REVIEW_SKIPPED` and three closure states | T2, T7 | ✅ |
| FR-5 `Review` field and gate visibility | T5, T6 | ✅ |
| FR-6 Depth and effort banding | T4 | ✅ |
| FR-7 Model routing | T3, T8 | ✅ |
| FR-8 Leader authority | T3 | ✅ |
| FR-9 Trial, measurement, abort criterion | T7, T8, T9 | ✅ text · ⚠️ measurement (follow-up 1) |
| FR-10 Backward compatibility | T2, T5 | ✅ |
| FR-11 Coherence sweep | T8 | ✅ |
| NFR-1..8 | T9 gates | ✅ |

## 4. Files Changed

136 insertions and 40 deletions across 17 packaged files. No packaged file added.

| File | Change | Commit |
|---|---|---|
| `.claude/commands/akili-execute.md` | *Review intensity* block; closure states; `REVIEW_SKIPPED` record; `/goal` condition | `a67e115`, `16bec7c` |
| `.claude/templates/leader.md` | Collapse paragraph amended in place; escalation recording | `58d3052` |
| `.claude/templates/reviewer.md` | Category and effort-ceiling columns | `dc6d934` |
| `.claude/commands/akili-specify.md` | `Review` field; Step 3.3 skip list; checklist item | `d7669b3` |
| `.claude/commands/akili-constitution.md` | Step 7 item 3 names the field | `afe3fb9` |
| `.claude/commands/akili-resume.md`, `.claude/skills/kaizen/SKILL.md` | Third closure state; two Measure rows; clean-run clause | `fdbcc7b` |
| `.claude/commands/akili-archive.md`, `docs/model-routing.md`, five mirrors, `README.md`, `docs/flow.md`, `CHANGELOG.md` | Signal list; third routing dimension; mirrors; entry | `1e4fb36` |

## 5. Test Evidence

There is no `test-report.md`, and its absence is **accepted**: the change is prose only and every task records `Red run: n/a`. The behavioral evidence is `closure.md`:

- the predicate walked against 12 held-out task records: 0 qualify;
- inert test and refutation test (NFR-6) both pass;
- the original mutation (delete override c) produced no flip;
- the condition-2 mutation, run at validation, flips T6 from *review required* to *qualifies*.

## 6. Validation

`validation-report.md`: **0 FAIL**. Validated on `fable`, which implemented and reviewed no task. Every global gate reproduced at HEAD. W1–W4 were resolved in `8d31f2f`. `npm run verify:cli`, `pack:dry-run` (275 files) and `git diff --check` pass.

## 7. Accepted Warnings / Follow-Ups

| # | Item | Suggested route |
|---|---|---|
| 1 | **The trial is under-measured and nearly over (W5).** Two of the three trial specs closed with no `skip-eligible` task. No surface collects the falsifier execution rate. Nothing tracks which spec is the third. The abort criterion cannot fire on a trial in which nothing skips | `/akili-propose` — decide extent, restart, and where the rate is collected |
| 2 | A task planned as `checklist` or `full` can clear the predicate and skip, because the rule reads the report and never the `Review` field. The auto-pass rationale assumes the task was on the approved skip list | `/akili-propose` (with 1) |
| 3 | No specify-time check ties `skip-eligible` to a `Disqualifier` that names no read — T6's contradiction was visible in two adjacent fields | `/akili-propose` (with 1) |
| 4 | Condition 3 has no rule for a qualified `none` | `/akili-propose` (with 1) |
| 5 | The option chosen at the three approval gates was never recorded; the headers now say so | — |
| 6 | Budget overrun: 13 review rounds vs 10, 136 lines vs ~120; accepted by the user at the tripwire | — |
| 7 | Readability advisories in `validation-report.md` §7 | Pick up if a later spec touches those lines |

## 8. Historical Notes

- Five severe judgment-day findings were corrected before tasks were written (*Fix only*, re-judgment declined).
- Two premises, P-7 and P-15, had been verified by reading the source only as far as the clause that agreed. Both judges reproduced the P-7 read. Both were refuted during execution.
- Two scope extensions were escalated and approved rather than absorbed: the Step 3.3 presentation list (T5) and `/akili-archive`'s signal list (T8).
- T3 was parked at the budget tripwire and released by the user. T7 was parked when P-7 was refuted.
- The Leader did not use the shipped predicate to skip a review in the run that wrote it.
