# Kaizen Entry — changes/grokbot-target

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/grokbot-target` |
| Date | 2026-10-21 |
| Branch | `feat/grokbot-target`. This is a spec branch: `Integration Branch: dev` is pinned, so every item below waits for Apply Mode on `dev` |
| Archive Run | 1 |
| Approval Mode | `gated`. From T2 onward the user pre-authorized continue gates ("stop only for product/risk decisions") |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 7 (5 planned, plus T2b and T6, both added with user approval) | tasks.md |
| Reviewer FAIL rework attempts | 4: T1 (blank env pin), T2b (no restore on a record-write failure), T5 (three doc overstatements and a missed multi-line target list), T6 (plain install replaced owned entries) | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots / spec amendments | 0 Pivot Records. 3 Leader one-line amendments (FR-4 T2b, FR-7 T4, FR-1 at validation). 2 user-approved scope changes (T2b, T6) | execution.md, validation-report.md |
| PRODUCT_BUGs | 1 (BUG-1, an owned entry that is not a real directory; found by the `/akili-test` Tester, fixed in T6) | test-report.md §8 |
| Judgment-day severe findings | Round 1: 2 confirmed (J-1, J-2) plus 1 suspect (J-3). Round-1 re-judgment: 1 confirmed (R-1). Round 2: 0 | judgment.md |
| Validation FAIL / WARN | 0 / 3 (closed in validation) plus the advisory N1/N2 | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` | 0 | execution.md |
| Escaped defects | 1 (BUG-1): it reached `/akili-test` after T3's Reviewer advisory had named the untested path | execution.md T3 ADVISORY; test-report.md §8 |
| Budget tripwires | 2 (after T2 at ~960/790 LOC; after T3 at ~1,380/1,300). Final ≈1,628/1,600 LOC, 11/10 review rounds | execution.md |
| Incidents | 1: a read-only Reviewer ran `akili update`, which ran a real `npm install -g` | execution.md T5 |

## Lessons

- **KZ-changes--grokbot-target-1 — A read-only auditor ran a product command with machine-wide side effects.** (Methodology, High)
  - **Root cause:** "read-only" in the Reviewer persona and the brief was understood as "no repository edits". The T5 Reviewer gathered evidence by running the CLI under test in a scratch HOME. Its `update` subcommand runs `npm install -g` before anything else, and no HOME pin contains that. Neither the persona nor the brief named the product's own globally side-effecting subcommands as forbidden. The brief for the next round did name it, but only after the incident.
  - **Evidence:**
    - execution.md T5 Attempt 1, the "Side effect outside the sandbox" entry;
    - `scratchpad/rev5/u.out` ("Updating package via npm… changed 1 package");
    - test/install-cursor.test.js:44-57, which already documents that `update` cannot be spawned safely.
  - **Standardization:** → P1 (upstream)

## Noted, not a lesson

- **BUG-1 was flagged before it escaped.** T3's Reviewer advisory named "an owned entry that is a file or a dangling symlink is restored through copy, and no test covers it". The advisory-never-becomes-a-task rule kept it out of execute. The Leader's `/akili-test` gap list then routed it to the Tester, which caught it. The process worked: the gap list is the right outlet. Not a lesson.
- **Test LOC again ran about 2× the estimate**, from per-state CLI fixtures, crash guards and permission-test skips. Two budget tripwires fired. Recurrence of KZ-bugfix--init-ctrlc-abort-2 → P2.
- **Two approved clauses stated a present-tense CLI reading that was never executed:**
  - FR-1 "must print `akili doctor --tool all`" under `--dry-run`: no hint prints at baseline.
  - FR-7 "must NOT open any network connection", although the update check runs on every TTY command.

  Both surfaced only at review or validation. Recurrence of KZ-changes--leader-brief-contract-2 → P3.
- **T5's CHANGELOG stated `doctor --fix` prints `skip foreign`, and a docs row said "never touched".** Both were caught by the Reviewer's quote-check. The claim-family grep also missed a target list spread over several lines. Recurrence of KZ-002 and KZ-changes--kaizen-loop-closure-2 → P4.
- **Judgment Day caught two data-safety design defects before tasks:** the takeover merge (J-1) and overwriting an invalid record (J-2). Its re-judgment then caught a defect the round-1 fix introduced, the `rsync --ignore-existing` semantics (R-1). The protocol worked as designed.

## Pending Items

Step 3 (constitution sync) recorded no `guide-sync`, `factual-sweep` or `trd-adr` items. There was no Constitution Impact block. FR-8 already updated the root-guide target counts inside the spec. The project has no TRD. The factual sweep of `AGENTS.md` found no other falsified claim.

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `.claude/templates/reviewer.md` *Read-only role* and `tester.md`, append: "Read-only means no state change anywhere on the machine, not only in the repository. Never run a subcommand of the product under test that installs, updates, publishes or contacts a registry (for example `akili update`, `npm publish`, `git push`), even in a scratch HOME: verify those paths by reading the code or by reusing recorded evidence." `/akili-execute` Step 2.3 Reviewer brief: name the project's side-effecting subcommands explicitly. |
| Severity | High |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-bugfix--init-ctrlc-abort-2 |
| Edit | Add source `changes/grokbot-target`. Recurrence note: "recurred (changes/grokbot-target: test LOC about 2× the estimate across T1–T3, from per-state CLI install fixtures with crash guards and permission skips; two budget tripwires fired, 790 → 1,300 → 1,600)". Severity stays Medium. |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--leader-brief-contract-2 |
| Edit | Add source `changes/grokbot-target`. Recurrence note: "recurred in requirements, not in a brief (changes/grokbot-target): FR-1 asserted a verify hint under `--dry-run` that the CLI never prints, and FR-7 forbade any network connection although the existing update check runs on every TTY command. Both were present-tense readings of existing CLI behaviour never executed at specify, and each cost a spec amendment, at T4 and at validation." Severity stays High. |
| Severity | High |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add source `changes/grokbot-target`. Recurrence note: "recurred (changes/grokbot-target T5: a CHANGELOG clause said `doctor --fix` prints `skip foreign` and a docs row said foreign folders are 'never touched' despite `--force` takeover; a target list split across lines escaped the claim-family grep. Caught by the Reviewer's quote-check; one rework attempt)". Severity stays High. |
| Severity | High |
| Status | pending |
