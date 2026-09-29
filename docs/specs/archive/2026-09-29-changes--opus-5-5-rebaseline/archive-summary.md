# Archive Summary — Re-baseline AKILI for Claude Opus 5.5

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/opus-5-5-rebaseline` |
| Archive Path | `docs/specs/archive/2026-09-29-changes--opus-5-5-rebaseline/` |
| Archive Date | 2026-09-29 |
| Branch | `master`. Branch Context is `default` and apply-capable, resolved by the unique `main`/`master` fallback because no pin exists |
| Final Status | **Complete: 4/4 tasks PASS · validation 0 FAIL · 3 WARN resolved** |

## 2. Outcome

AKILI's Opus guidance now matches the current `opus` alias (Opus 5.5):
- It starts at `medium` and reserves `xhigh`/`max` for measured gains.
- It is labelled vendor-measured, and AKILI has not measured it yet.

Workers now name the premature stops they must avoid. `/akili-execute` splits `Not Done` handling by blocker and caps unattended continuations at 2 per task.

## 3. Requirements Delivered

| Req | Delivered by | Status |
|---|---|---|
| FR-1 Opus guidance matches 5.5 | T1 | ✅ |
| FR-2 No current-Opus-5 claims | T1 + `quick/model-routing-history-wording` | ✅ |
| FR-3 Role table values kept + pointer | T1 | ✅ |
| FR-4 "Don't stop short" worker rule | T2 | ✅ |
| FR-5 `Not Done` split, ordered, bounded | T3 | ✅ |
| FR-6 Time-signal note | T1 | ✅ |
| FR-7 CHANGELOG | T4 | ✅ |
| NFR-1..5 | all | ✅ |

## 4. Files Changed

| File | Change | Commit |
|---|---|---|
| `docs/model-routing.md` | *Opus specifics* rewritten; reconciliation re-anchored; history labelled; *Time signals* section added | `1894da6`, `a4f1241` |
| `.claude/templates/implementer.md` | "Don't stop short" bullet | `53bc9d3` |
| `.claude/templates/tester.md` | "Don't stop short" bullet | `53bc9d3` |
| `.claude/commands/akili-execute.md` | Step 2.3 item 0 split + accounting; `/goal` `<N>` + 2 continuations | `b58bbfd` |
| `CHANGELOG.md` | `Unreleased` → `### Changed` entry | `f291f17`, `a4f1241` |

## 5. Test Evidence

There is no `test-report.md`, and its absence is **accepted**: this is a prose-only change with no runnable surface, and every task records `Red run: n/a`. The evidence consists of:
- executed falsifiers (T1: 2 reds; T2: 1 red);
- a four-case walk including a held-out case (T3);
- non-author evidence re-runs on every attempt;
- the independent gate re-run in `validation-report.md`.

## 6. Validation

`validation-report.md`: **0 FAIL**. The 3 WARNs (history wording and provenance in `model-routing.md`) were resolved in `a4f1241` via `/akili-quick`. `npm run verify:cli`, `pack:dry-run` and `git diff --check` pass.

## 7. Accepted Warnings / Follow-Ups

| # | Item | Suggested route |
|---|---|---|
| 1 | *Effort dial* still prescribes unmeasured `xhigh` in four places beside the new "measured gains only" rule | `/akili-propose` (next re-baseline, or the first AKILI sweep) |
| 2 | A `Not Done` field with no owed item names no next action; an unattended run could idle on it | `/akili-propose` |
| 3 | This repo's untracked `.agents/implementer.md` / `tester.md` lack the new rule | Re-sync via `/akili-constitution` |
| 4 | Budget overrun: ~90 lines vs ~75, 7 review rounds vs 6. The user accepted both at the tripwire | — |

## 8. Historical Notes

- T2 attempt 1 failed on two issues. Porting the Glossary's Leader-side stop list into the worker persona put in a Leader-only stop (Pivot-Detection) and dropped the Tester's `PASS`. See the kaizen entry, lesson 1.
- T4 attempt 1 failed because the CHANGELOG described a "historical note" that never shipped and paraphrased the stop lists from memory.
- The Leader ran without Step 8E wrappers: fallback spawns, Implementer `sonnet`, Reviewer `opus`. T1–T3 ran in parallel (width 3).
