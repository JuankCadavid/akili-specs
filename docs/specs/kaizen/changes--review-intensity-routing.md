# Kaizen Entry — changes/review-intensity-routing

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/review-intensity-routing` |
| Date | 2026-09-29 |
| Branch | `master` |
| Branch Context | **`default`, apply-capable** — resolved from the `Default Branch: master` pin in `AGENTS.md`; no `Integration Branch:` pin exists |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 9 | tasks.md |
| Reviewer FAIL rework attempts | **4** (T1, T2, T5, T3 — attempt 1 each) | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0. Two tasks parked `[~]` and released: T3 (budget tripwire), T7 (premise P-7 refuted) | execution.md |
| PRODUCT_BUGs | — | no `test-report.md`; absence accepted (prose only) |
| Judgment-day severe findings | **5** (S-1..S-5, all corrected before tasks) | judgment.md |
| Validation FAIL / WARN | 0 / 5 (4 resolved in `8d31f2f`, 1 routed) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` | 0. One `skip-eligible` claim (T6), not earned | execution.md — T6 |
| Escaped defects (§3) | 0 (no skipped task) | validation-report.md |
| Falsifier execution rate | not collected — no surface records it | validation-report.md W5 |
| Budget delta | lines **136 vs ~120**; review rounds **13 vs 10**. Tripwire fired; the user accepted | design.md §13 vs execution.md §3 |
| Drift attributable | — | `docs/specs/audits/` holds no report |

## Lessons

- **KZ-changes--review-intensity-routing-1 — A requirement named the mechanism that delivers an obligation without checking that the mechanism runs where the obligation is owed.** (Methodology, Medium)
  - **Root cause.** FR-5 required the skip list to be visible *at* the Step 3.3 gate and named the Verification Checklist as the mechanism. The checklist runs after that gate, so it could only detect afterwards that the user was never shown the list. FR-10's first bullet had the same shape: no shipped sentence delivered it. Both passed requirements and design approval and a two-judge review, and cost a rework round each.
  - **Evidence.** `execution.md` — T5 attempt 1, Reviewer FAIL Issue 2; T2 attempt 1; `requirements.md` FR-5 (amendment note).
  - **Why it is not a duplicate.** KZ-changes--gate-falsifiability-2 is about content dropped between a requirement and the shipped text. Here the content shipped as required; the requirement itself pointed at a step that cannot do the job.
  - **Standardization:** → P1.

## Noted, not a lesson

- **Two premises were verified by reading the source only as far as the clause that agreed** (P-7 stopped at a colon; P-15 counted headers instead of task records). Both judges repeated the P-7 read. Recurrence of KZ-001 → P2.
- **Three Leader-added brief checks stated absolute thresholds that existing text already violated**, and none was tagged `[advisory-grade]`. A threshold written without running it at baseline is the class KZ-changes--leader-brief-contract-2 names → P3.
- **Four document headers stayed at "Draft" through nine executed tasks**, and the option chosen at each gate was never recorded. Single occurrence; the previous spec's headers were updated correctly.
- **A mutation falsifier that mutates a condition which does not decide the case cannot move the verdict.** T9's prescribed mutation removed override (c) where condition 2 failed first. Single occurrence.
- **The run's totals disagreed across its own documents** (12 vs 13 rounds; "five" vs four FAILs). The class is KZ-002's; `changes--premise-ledger.md` noted the same shape for a budget figure. Second sighting in two archives — a candidate if it recurs.
- **The spec shipped in a release before it was validated.** Second occurrence (`changes--premise-ledger.md` noted the first). No harm came of either; a candidate for a release-gate lesson on a third.
- **The trial's measurement gaps** and the three predicate gaps in the archive summary are spec content and belong in a proposal.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.claude/commands/akili-specify.md` — Step 2.2 *Guidelines*, after the *A rule keyed to a field's states* bullet |
| Edit | **A named mechanism is checked against the moment it must act.** When a requirement names the step, list, or check that delivers an obligation at a gate, open the command text and confirm that step runs before the gate it guards; a mechanism that runs after can only report that the obligation was missed. |
| Severity | Medium |
| Status | `pending` |

### P2

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-001` |
| Edit | Add `changes/review-intensity-routing` as a source spec and append: *"recurred: two Premise Ledger rows (P-7, P-15) were verified by reading the source only as far as the clause that agreed; both judgment-day judges repeated the P-7 read; one refutation parked a task and added a sixteenth surface."* Severity stays **High**. The row returns to the digest |
| Severity | High |
| Status | `pending` |

### P3

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-changes--leader-brief-contract-2` |
| Edit | Add `changes/review-intensity-routing` as a source spec and append: *"recurred: three Leader-added brief checks (T2, T7, T8) asserted thresholds never run at baseline, which existing text already violated; the Implementer flagged each, so none cost an attempt."* Severity stays **Medium**. The row returns to the digest, from which it was retired on 2026-09-29 |
| Severity | Medium |
| Status | `pending` |

### P4

| Field | Value |
|---|---|
| Kind | `factual-sweep` |
| Target | `AGENTS.md` — Development Rules, *Multi-Agent Harness* bullet |
| Edit | Replace "`/akili-execute` runs each task through a Leader → Implementer → Reviewer loop with a hard 3-attempt rework ceiling." with "`/akili-execute` runs each task through a Leader → Implementer → Reviewer loop with a hard 3-attempt rework ceiling; the Reviewer is owed unless the task clears the *Review intensity* predicate (`/akili-execute` Step 2.3), and the non-author evidence re-run is never waived." |
| Severity | Low |
| Status | `pending` |
