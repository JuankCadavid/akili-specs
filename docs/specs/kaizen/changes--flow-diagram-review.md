# Kaizen Entry: changes/flow-diagram-review

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/flow-diagram-review` |
| Date | 2026-10-26 |
| Branch | `JuankCadavid/flow-diagram-review`. Branch Context: **spec**. The `Integration Branch: dev` pin exists, so the apply-capable branch is `dev` |
| Archive Run | 1 |
| Approval Mode | pre-approved (Juan Carlos Cadavid, 2026-10-26) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 3 | tasks.md |
| Reviewer FAIL rework attempts | 0 | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0. One execute-time design edit (DD-2, column-0 stack); FR-1's meaning unchanged | execution.md, T1 decisions |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 0 confirmed. 1 single-judge severe (P-3 citation line `:22` vs `:24`), settled by a re-run | judgment.md, L-1 |
| Validation FAIL / WARN | 0 / 2 (W-1, W-2 accepted). 1 stale figure corrected (R-1) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects | 1. R-1: the CHANGELOG note stated "1111 tests". `/akili-test` then added 9 tests, and validation found the count stale. The T3 Reviewer had passed the note before the count changed | validation-report.md, R-1 |

## Lessons

- **KZ-changes--flow-diagram-review-1: worktree specs start without their agent personas.** `.agents/` is gitignored, so every fresh worktree lacks the personas `/akili-execute` requires. The Leader copies them by hand from the main checkout every time. (Product, Low)
  - Root cause: the repository's `AGENTS.md` names `git worktree` as the way to run extra sessions, but says nothing about `.agents/` being local-only. The setup step is rediscovered each spec.
  - Evidence: `execution.md` Document Control, *Spawn path* row (copied from `/Users/jcadavid/Development/sdd-jc-methodology/.agents`, then `doctor --agents --fix --allow-branch`). It is the same note, never standardized, in the entry files of `bugfix--init-ctrlc-abort`, `bugfix--update-check-deadline`, `changes--antigravity-argon-registry`, `changes--akili-security`, `changes--akili-security-followup`, `changes--branching-flow-dev-next` and `changes--docs-refresh-2-34`.
  - Standardization: → P1

## Noted, not a lesson

- **Recurrence of KZ-002** → P2 (digest-update). A summary count went stale after a later phase added tests. Validation also caught two over-broad claims in the validation report itself, both corrected after a re-run before the report was final: "no Archify file tracked" (9 archived docs carry the name) and "no other 1111 hits" (test fixtures contain the digits).
- The Premise Ledger's `UNVERIFIED` rows worked as designed. P-14 (the multi-column Archify layout) was owned by T1 with a fallback, and T1 found that the planned row placement would route an edge through `/akili-specify`. The fallback absorbed it as a recorded design edit, not a Pivot.
- One `npm test` run failed a single test that was not captured, then passed in 10+ runs. The test name was lost because the Implementer piped only the summary lines. Capturing `^not ok` lines on every suite run would have identified it.
- The proposal's premise "patch release so npm's README shows the new diagram" was refuted at proposal time. The README image is a `master` raw URL, so a publish does not change it.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `AGENTS.md`, *Development Rules* › **Concurrency: one AKILI session per checkout.** bullet (append one sentence) |
| Edit | "`.agents/` is gitignored, so a new worktree starts without personas: copy it from the main checkout and run `node bin/akili.js doctor --agents --fix --allow-branch` before the first `/akili-execute` spawn." |
| Severity | Low |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add `changes/flow-diagram-review` as a source. Recurrence note: "recurred (changes/flow-diagram-review: the CHANGELOG note stated 1111 tests at T3, which went stale when `/akili-test` added 9; caught at validation R-1. The validation report then over-stated two of its own checks, 'no Archify file tracked' and 'no other 1111 hits', and was corrected by re-running each as a scoped command)". Severity stays High. |
| Severity | High |
| Status | pending |
