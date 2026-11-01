# Archive Summary — review-intensity-trial-terms (DISCARDED)

**Outcome:** **discarded, not implemented.** The proposal (approved 2026-09-29, Option B) re-based the review-intensity trial on skips instead of specs. It never left Phase 1: `requirements.md` stayed **Draft**, and no design, tasks or code exist. The data since then makes its premise moot, so a short trial-closing proposal replaces it.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/review-intensity-trial-terms` |
| Archive Date | 2026-10-31 |
| Final Status | **Discarded** (proposal + draft requirements; no implementation) |
| Decision | JC, 2026-10-31 16:51 UTC-5, verbatim: "Aprueba la versión que mejor se adapte a nuestras necesidades". JC delegated the choice; JC's assistant (Methodology) chose to discard this spec and open a short trial-closing proposal |
| Archived on | `JuankCadavid/impeccable-audit-fixes` (a spec branch). Local commit only |
| Why archived, not deleted | The folder is moved, never deleted, so the approved proposal and its reasoning stay readable |

## 2. Why it is discarded

| Measure (run 2026-10-31) | Value |
|---|---|
| Specs archived since 2026-09-29 | 33 (`ls docs/specs/archive`, dates ≥ 2026-09-29) |
| Tasks declared `skip-eligible` in those specs | 1: `archify-diagrams` T5, reviewed anyway ("skip claim not earned → reviewed", its `execution.md`) |
| Tasks closed under `## REVIEW_SKIPPED` | **0** (`grep -rl '^## REVIEW_SKIPPED' docs/specs/archive docs/specs/changes` → 0 files) |
| Where the trial terms live | Only `CHANGELOG.md` (the 2.27.0 entry: "a measured trial over the next 3 complete specs") and the archived `changes/review-intensity-routing` |

The three-spec trial ended long ago with zero skips. Re-counting it in skips, as this proposal wanted, would keep a trial open that a month of data shows nobody exercises. The useful next step is to close the trial with these numbers and decide what to do with the `skip-eligible` predicate.

## 3. Requirements Delivered

None.

## 4. Follow-Up

A new proposal closes the trial with the measured data (`/akili-propose`, 2026-10-31).
