# Kaizen Entry — changes/akili-panel

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel` |
| Date | 2026-11-06 |
| Branch | JuankCadavid/akili-panel |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 9 | tasks.md |
| Reviewer FAIL rework attempts | 10 of 20 rounds (T1 x2, T3 x1, T4 x2, T5 x1, T6 x1, T7 x1, T8 x1, FR-12 fix x1) | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 1 (T1: A1, B1, C1, D1) | execution.md — ## Pivot Record: T1 |
| Budget tripwires | 2 (T4 LOC; FR-12 fix rounds). Rounds 15 to 20, LOC ~2,100 to ~4,000 | execution.md |
| PRODUCT_BUGs | 2 (both resolved) | test-report.md §8 |
| Judgment-day severe findings | 5 confirmed (J-1 … J-5), 2 suspect (A-1, A-2) | judgment.md |
| Validation FAIL / WARN | 0 / 4 (accepted by JC) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 (no task carries a `REVIEW_SKIPPED` record) | execution.md |

## Lessons

- **KZ-changes--akili-panel-1 — A host lifecycle event named in a scenario must be a step of the live check.** (Methodology, High)
  - Root cause: FR-12's *After `/clear` or a resume* scenario existed, but T9's 12-step script never ran `/clear`. The engine kit keeps atoms across its simulated `session.end`, so the kit stayed green while the real host left the pane blank. Only JC's added live check found it.
  - Evidence: test-report.md §8 *Fixed: pane body lost after `/clear`* (*Why it was missed*); execution.md — *Live `/clear` check (JC's 2A)*; tasks.md T9 Scope.
  - Standardization: → P1

- **KZ-changes--akili-panel-2 — A clause about what the host reports after an event needs a probe, or it is a premise, not a requirement.** (Methodology, High)
  - Root cause: FR-12 said `$` "stays Claude Code's own total" after `/clear`, while design §5.2 cleared `usage`, and no Premise Ledger row observed what `$.session.usage()` answers after `/clear`. W-12 was folded in by the «Fix only» pass with no re-judgment, so the disagreement reached `/akili-test`. The live check then showed the host restarts `$`, so the clause had to be clarified as well as the code fixed.
  - Evidence: test-report.md §8 *Fixed: `$` disappears after `/clear`* (*Spec conflict*); execution.md — *Live `/clear` check*; judgment.md W-12.
  - Standardization: → P2

## Noted, not a lesson

- Tests and fixtures are 4,200 of 5,447 lines. Recurrence of KZ-bugfix--init-ctrlc-abort-2: → P3.
- Running the live check before the last review round kept a failure reworkable. One use; feeds the recurrence check.
- Two parallel Testers raced: one edited `panel.test.tsx` while the other's byte-compare ran, giving one explained Node 18 red.
- Mutation at review found two tests that named a `later` path but could not fail without it. Both closed; a hang case exposed each.
- Reviewer round 18 FAILed a green fix on a property the kit could not evaluate. The evidence rule worked as designed.
- `execution.md` cites `.run/akili-execute-panel/T9-observations.md`, untracked, so the link dangles after a fresh clone; the table is copied.
- `changes/akili-panel-polish` cites `docs/specs/changes/akili-panel/` paths that this archive moved. Left unedited, as it is out of this spec's scope.
- Subagents could not write report files, and long idle reports truncated, so each cost an extra message.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Step 2 tasks rule for a manual live-check task: "Every host lifecycle event a scenario names (`/clear`, resume, reload) is a step of the live check, because a simulated event proves only what the kit simulates." |
| Severity | High |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Premise Ledger: "A clause stating what a host reports after a lifecycle event carries a `live-path` row with an observed value, or stays `UNVERIFIED` and is owned by a live-check step." |
| Severity | High |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-bugfix--init-ctrlc-abort-2 |
| Edit | Add source spec `changes/akili-panel` and the recurrence note: "recurred (changes/akili-panel: T4 ×2.7 against plan, fixtures unbudgeted, tripwire fired; tests and fixtures ended at 4,200 of 5,447 lines)." |
| Severity | Medium |
| Status | pending |
