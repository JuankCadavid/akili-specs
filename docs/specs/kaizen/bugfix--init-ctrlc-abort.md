# Kaizen Entry — bugfix/init-ctrlc-abort

## Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/init-ctrlc-abort` |
| Date | 2026-10-18 |
| Branch | `JuankCadavid/init-ctrlc-bug`: **spec branch** (`Default Branch: master`, no integration pin). Every item below is `pending` and awaits the apply phase on `master` |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 2 (1 planned + T2 from validation Pivot V-1) | tasks.md |
| Reviewer FAIL rework attempts | 1 (T2: a pre-existing CHANGELOG sentence's scope after an inserted clause, KZ-002) | execution.md — T2 attempt 1 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 1 (V-1: EOF exit 0 → 130 contradicted a declared non-goal) | execution.md — ## Pivot Record: V-1 |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 0 (not requested) | design.md Document Control |
| Validation FAIL / WARN | run 1: 1 / 1 → run 2: 0 / 3 (V-3, V-4 fixed at archive; V-2 CI-settled) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 in skipped tasks (none skipped). One behavior change (V-1) escaped the T1 Reviewer and `/akili-test`; the validator found it | validation-report.md run 1 |
| Review rounds | 3 vs 2 budgeted (round 3 user-approved) | execution.md §3 |
| Budget | tasks 1 → 2; LOC ~180 → ~433 (pty harness: test 199 + fixture 84 vs ~135 budgeted); tripwire fired at T1's report and was escalated at the gate (KZ-changes--routing-keyboard-select-2 standard held) | execution.md T1 |
| Runtime events | 1 (validation run 2: validator died on a provider session limit → fresh worker after the session restarted) | archive-summary.md §10 |
| Drift attributable to this spec | none (no `docs/specs/audits/` report) | — |

## Lessons

- **KZ-bugfix--init-ctrlc-abort-1 — A path the proposal declares "unchanged" is a premise; extracting a shared handler can silently re-route it.** (Methodology; High: caused Pivot V-1)
  - Root cause: DD-1 moved routing's close-race (any `close` before an answer → abort) into a helper that `init` now shares. End-of-input also closes the interface, so `init </dev/null` went from exit 0 to 130. The proposal's Proposed Outcome said "**unchanged**" for that exact path, and design §6 said "the exit codes of every other path are unchanged". The Premise Ledger (P-1..P-9) had no premise for the declared non-goal path, and no baseline/after probe ran on it. T1's Reviewer, `/akili-test` and the falsifiers all exercised only the paths the change targeted. The independent validator's single `</dev/null` probe found it.
  - Evidence: validation-report.md run 1, V-1 (`rc=0` at `ad7022a` → `rc=130` at `22dc7ed`); proposal.md Proposed Outcome EOF row and Non-Goals (pre-amendment text quoted in place); design.md §6, §11; execution.md ## Pivot Record: V-1.
  - Standardization: → P1 (upstream)
- **KZ-bugfix--init-ctrlc-abort-2 — pty/`expect` harness tasks are budgeted at roughly a third of what ships, in consecutive specs.** (Methodology; Medium)
  - Root cause: `/akili-specify`'s budget sizes a pty regression test from its assertions. The shipped harness also carries harness-fault detection, collect-all-checks failure messages, a transcript tail, `AKILI_PTY_LOG_DIR` copying and offline seeding: here 283 lines against ~135. In `changes/routing-keyboard-select` it was ~440 against ~120. Both overruns fired the tripwire and were accepted as-is, so the estimate never learned.
  - Evidence: tasks.md T1 Size (`init-pty.test.js` ~90, `pty-init.exp` ~45) vs execution.md T1 Files changed (199, 84); `docs/specs/kaizen/changes--routing-keyboard-select.md` Metrics → Budget ("the pty harness ~440 vs ~120 budgeted").
  - Standardization: → P2 (upstream)

Recurrence (`digest-update`, not a new lesson): T2 attempt 1 inserted a CHANGELOG clause before a pre-existing sentence whose unscoped subject ("It skips on Windows…") then read as covering the new case, for which it is false. That is KZ-002's CHANGELOG-overstatement class, recurrence 7. It also adds a shape the KZ-002 text does not name: a sentence that was true when written becomes false through an insertion next to it. → P3.

## Noted, not a lesson

- `/akili-test` falsifier TF2 (`> [1] ` default marker) failed at the fixture's prompt wait (`<<TIMEOUT>>`) before reaching the new assertion. The CSI-tolerant wait already refuses text after `>`, so a mutation has to get past the harness to test an assertion (TF2b). This is the harness-layer counterpart of KZ-changes--leader-brief-contract-2; one occurrence, no lesson.
- The first validation's baseline probe ran a copy of `bin/akili.js` outside the repo, which could not resolve its package, and read `rc=1`. The Leader caught and discarded it and re-ran in place. A baseline probe must run the baseline file from its own tree.
- Root `AGENTS.md`'s `test/` bullet names `test/routing-pty.test.js` as the pty suite. It is still true (not falsified), but `test/init-pty.test.js` is now a second pty suite. Not a factual-sweep item.
- `.agents/` is gitignored, so each new worktree starts without personas. The second consecutive worktree spec copied them from the main checkout by hand.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Premise Ledger (Step 2.x): "Every path the proposal declares **unchanged** (Proposed Outcome or Non-Goals), when the change touches a function that path reaches, is a premise of class `live-path`. Its citation is a probe executed at baseline and re-run after the change, and the probe joins the task's Verification." |
| Severity | High |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Budget (Step 2.4): "Size a pty/`expect` harness task from the nearest shipped harness's LOC (`git show --stat` of its commit), not from its assertion count. A harness carries fault detection, failure-evidence plumbing, transcript copying and offline seeding, which assertions do not show." |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add `bugfix/init-ctrlc-abort` as a source. Recurrence note: "**recurred (bugfix/init-ctrlc-abort T2, recurrence 7): a clause inserted into an existing CHANGELOG entry left the next, pre-existing sentence's unscoped subject reading as covering the new case, for which it was false. Quote-check the sentences around an insertion, not only the inserted clause.**" Severity stays High |
| Severity | High |
| Status | pending |

No `guide-sync` item: no `## Constitution Impact` block, no module created or reshaped (an internal helper in `bin/akili.js`). No `factual-sweep` item: root `CLAUDE.md` / `AGENTS.md` were swept and no factual claim was falsified (see Noted). No `trd-adr` item: no TRD in this repository, and no recorded architecture decision was overturned.
