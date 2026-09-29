# Kaizen Entry — changes/premise-ledger

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/premise-ledger` |
| Date | 2026-09-29 |
| Branch | `master` |
| Branch Context | **`default`, apply-capable** — resolved from the `Default Branch: master` pin in `AGENTS.md`; no `Integration Branch:` pin exists |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 10 | tasks.md |
| Reviewer FAIL rework attempts | **4** (T7 ×1, T9 ×1, T10 ×2) | execution.md; walkthrough.md §6 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | **1** (T7 — closure gate fired on F1, F2, F3) | execution.md — ## Pivot Record: T7 |
| PRODUCT_BUGs | — | no `test-report.md`; absence accepted (prose only) |
| Judgment-day severe findings | — | offered at Step 2.5, not selected (design.md §1) |
| Validation FAIL / WARN | 0 / 4 (all resolved in `9f40710`) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` | 1 (T8, `degraded-pair` — gate exercised) | execution.md — ## REVIEW_WAIVED: T8 |
| Tasks closed under `REVIEW_SKIPPED` | 0 | execution.md |
| Escaped defects (§3) | 0 (no skipped task). Two defects escaped Reviewer PASSes to validation: W1, W3 | validation-report.md §8 |
| Budget delta | lines **132 vs ~160**; review rounds **15 vs 12**; rework **4 vs 2**. Tripwire fired and was escalated | walkthrough.md §6 |
| Drift attributable | — | `docs/specs/audits/` holds no report |

## Lessons

- **KZ-changes--premise-ledger-1 — A rule whose actions are keyed to a field's states was written without listing every state the field can hold.** (Methodology, **High**)
  - **Root cause.** FR-7 gave the judge three actions: one for a cell holding a citation, one for a cell holding the `UNVERIFIED` marker, one for a missing row. The citation cell can hold two more states — empty, and a citation to a secondary source — and both fell between the actions. The block forbids those states for the author, so the requirement was written for conforming ledgers only, while a judge exists to read non-conforming ones. T3 shipped the rule faithfully and passed term for term; only the blind walkthrough found it.
  - **Evidence.** `execution.md` — *Pivot Record: T7*, findings F1 and F2; `walkthrough.md` §3 Cases 11 and 12; `requirements.md` FR-7 as amended; `design.md` DD-14.
  - **Why it is not a duplicate.** KZ-004 covers a scan that gains a new artifact type and must say which terminal branch it lands in. Here nothing new was added to an existing scan: a new rule was written with an incomplete case split. Related class, different entry point.
  - **Standardization:** → P1.

- **KZ-changes--premise-ledger-2 — A Pivot amendment to an approved document is reviewed by nobody and its sweep cannot see what it destroyed.** (Methodology, Low)
  - **Root cause.** The Leader's Pivot edit to `requirements.md` replaced the heading of an existing scenario with the new scenario's heading. Correction Closure greps the superseded *value* forward and backward; a heading removed by accident is not a superseded value, so both sweeps ran green. No Reviewer reads a Pivot amendment's diff. The orphaned scenario and its misplaced `KZ-EVL-1` citation survived three later tasks and were found at validation.
  - **Evidence.** `git show f93f7d7 -- docs/specs/changes/premise-ledger/requirements.md`; `execution.md` — *Pivot resolution*, *Correction Closure sweep* row; `validation-report.md` W1.
  - **Why it is not a duplicate.** KZ-changes--leader-brief-contract-1 (read the paragraph that received an insertion whole) is a pre-review rule for shipped files. This edit was to a spec document, at the Pivot, where no review follows.
  - **Standardization:** → P2.

## Noted, not a lesson

- **A task scope bullet was never delivered and passed three Reviewer verdicts.** T10's scope named "§3's three rows and the headline counts"; `walkthrough.md` §3 was left at its first-gate reading, and the attempt-3 Reviewer confirmed §3 "byte-identical to the prior attempt". Recurrence of KZ-changes--gate-falsifiability-2 → P3.
- **A budget figure whose stated parts do not sum** (`design.md` §13: "~160 — 126 plus ~10"). It was copied to `tasks.md` and measured against in `walkthrough.md`. Single occurrence; the class is KZ-002's.
- **The spec shipped in two releases before it was validated or archived** (v2.26.0 on 2026-09-19; validation on 2026-09-29). Nothing in validation touched packaged text, so no harm came of it. Candidate for a release-gate lesson if it recurs.
- **The grep hazard reproduced in the validator's own run.** An unsplit zsh variable dropped the `--exclude-dir` flags and reported four stale hits from `.claude/worktrees/authorship/`. The task text warned about it and the re-run was clean. The stale worktree is the standing cause.
- **Audit volume, not task size, drove the budget overrun**: a redundant Reviewer after a session limit, and two rework rounds on evidence fidelity in `walkthrough.md`. Single occurrence.
- **F9, F14, F15** are spec-content gaps and belong in follow-up proposals, not process lessons.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.claude/commands/akili-specify.md` — Step 2.2 *Guidelines*, after the *New enumerated values walk their consumers* bullet |
| Edit | **A rule keyed to a field's states lists every state the field can hold.** When a requirement or design gives a reader one action per state of a cell, status, or field, enumerate the states first — the ones another rule forbids included, because an auditor reads non-conforming input — and give each an action or a stated fall-through. |
| Severity | High |
| Status | `applied (2026-09-29)` |

### P2

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.claude/commands/akili-execute.md` — *Error Handling & Pivot Protocol*, step 3 (after the two-direction sweep) |
| Edit | Then read the `git diff` of each amended document: every removed line is a removal the amendment intended. The sweep finds stale values; only the diff shows a heading or clause the edit destroyed. |
| Severity | Low |
| Status | `applied (2026-09-29)` |

### P3

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-changes--gate-falsifiability-2` |
| Edit | Add `changes/premise-ledger` as a source spec and append: *"recurred (T10): a scope bullet naming three rows and a headline to update was never delivered and passed three Reviewer verdicts; found at validation. The dropped obligation sat in a task's Scope, not in an FR."* Severity stays **High** |
| Severity | High |
| Status | `applied (2026-09-29)` |

## Apply Pass (2026-09-29)

The user chose **Apply all** on `master` (Branch Context `default`, apply-capable). All three probes held: the P1 anchor bullet exists and no such rule was present, the P2 sweep sentence exists in Pivot Protocol step 3, and the P3 digest row exists.

- P1 and P2 were written, with a `CHANGELOG.md` `Unreleased` note for each.
- P3 was merged into the digest.
- New digest rows were added for lessons 1 and 2.

To stay at 10 rows, the digest retired `KZ-changes--leader-brief-contract-2` (2026-09-19) and `KZ-changes--agents-md-canonical-1` (2026-09-20). Both are single-occurrence rules already standardized in `/akili-specify` Step 3.2, and the second survives inside `KZ-changes--kaizen-loop-closure-2`'s row. `KZ-changes--leader-brief-contract-1` is as old as the first but recurred on 2026-09-29, so recurrence broke the tie, as in the previous pass. No upstream items, so no upstream report was written.
