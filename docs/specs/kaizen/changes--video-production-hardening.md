# Kaizen Entry — changes/video-production-hardening

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-production-hardening` |
| Date | 2026-10-23 |
| Branch | JuankCadavid/video-hardening (spec branch; apply-capable branch: `dev`) |
| Archive Run | 1 |
| Approval Mode | pre-approved (Juan Carlos Cadavid, 2026-10-23) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 14 of 21 (T15–T21 deferred by owner scope cut) | tasks.md; execution.md — Scope cut |
| Reviewer FAIL rework attempts | 4 (T5 ×2, T14 ×2); both passed on attempt 3 after the ceiling rung escalated to `opus` / `fable` | execution.md — T5, T14 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 (one execute-time factual correction of design §6 / §7.1 Cursor rows) | execution.md — Execute-time spec edit |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 8 in round 1 (corrected before approval) | judgment.md; design.md §14 |
| Validation FAIL / WARN | 0 / 8 (W-1–W-8) | validation-report.md §11 |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 2 — W-4 (FR-6 skill side unpinned, claimed pinned) and W-5 (`tester.md` edit outside every persona fence), both found at validation | validation-report.md |
| Review rounds | 21 of ~38 budgeted | execution.md — Scope cut |

## Lessons

- **KZ-changes--video-production-hardening-1 — Clause-coverage test tasks pass review only when their mutation walk is built from the requirement text.** (Methodology, Medium)
  - Root cause: T5 and T14's Done criteria asked for "one assertion per THEN/BUT/AND clause" and a mutation per *pin*. Attempts 1–2 walked the pins the worker had already written, so every unpinned term stayed invisible until a Reviewer mutated the shipped text itself; 4 FAILs followed. Each attempt 3 listed every requirement term first, mutated the shipped phrase carrying it, and passed (91/91, 117/117 red).
  - Evidence: execution.md — T5 attempts 1–3, T14 attempts 1–3 (Reviewer FAILs: FR-2 *Skill refresh* reason, FR-4 storage, FR-3 lock "still pass", FR-7 columns, FR-8 contents, FR-11 THEN, FR-6 *Default*, FR-12 parenthetical).
  - Standardization: → P1 (upstream); recurrence of KZ-changes--gate-falsifiability-2 → P4
- **KZ-changes--video-production-hardening-2 — A persona-template edit outside every `akili:section` fence never reaches deployed copies.** (Methodology, Medium)
  - Root cause: design §8.5 assumed that editing `tester.md:7` makes deployed copies read `outdated` and upgradable by `doctor --agents --fix`. The line sits outside every fence, so doctor reads deployed copies `CURRENT` and `--fix` never upgrades them. P-26 measured that the suites stay green, not that the edit is deployable.
  - Evidence: validation-report.md W-5; design.md §8.5 *Persona churn*; execution.md — T12.
  - Standardization: → P2 (upstream)
- **KZ-changes--video-production-hardening-3 — A phase runner must judge completion by artifacts, never by the host's exit status.** (Methodology, Medium)
  - Root cause: the owner's `run.sh` chains phases on exit status; Claude exits 0 when it stops at a session limit, so a phase that never finished is recorded as passed. AKILI's unattended guidance names a `/goal` condition keyed on `execution.md` / `tasks.md` state, but says nothing for shell runners.
  - Evidence: execution.md — Scope cut, *New friction (owner-reported, 2026-10-23)*.
  - Standardization: → P3 (upstream)

## Noted, not a lesson

- **Ceiling rung, first use, worked as designed:** escalation with a distinct auditor (`opus` Implementer, `fable` Reviewer) closed both twice-failed test tasks on attempt 3. One data point; watch for cost.
- **Mid-run scope cut** left the package internally inconsistent (MUST in `/akili-test` and personas, "prefer" in the constitution and docs — W-2). Ordering idea for future specs: land a rule's restatement sweep in the same PR as the rule.
- **Requirement wording lagging an adopted judgment correction** (FR-13 sources, W-6): judgment-day round-1 fixes updated design but not the requirement parenthetical. Single occurrence.
- **Leader-side summary error:** `test-report.md` claimed a `video-production.test.js` pin for FR-6's skill side that did not exist (W-4); feeds KZ-002 → P5.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Step 3.2, for a task whose deliverable is clause-level tests: its Done criteria require a mutation walk built from the requirement text — list every THEN/BUT/AND term, remove the shipped phrase carrying it in a scratch copy, and record the red assertion per term; a walk over the task's own pins does not satisfy it. |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` (Design Impact, persona edits): a design that edits `.claude/templates/<persona>.md` names, per edited line, the `akili:section` that contains it; a line outside every fence is not deployable by `doctor --agents --fix` and needs either a fence change or a documented manual re-copy. |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-execute` *Unattended Mode*: a script or runner that chains AKILI phases judges each phase by the artifacts it was meant to produce (`tasks.md` state, `execution.md` closing records, `test-report.md` / `validation-report.md` existence and status), never by the host's exit status — a host stopped at a session or usage limit can exit 0. |
| Severity | Medium |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--gate-falsifiability-2 |
| Edit | Add source `changes/video-production-hardening`; recurrence note: "recurred on the test side (T5, T14: 4 Reviewer FAILs — clause terms unpinned while every walked pin was red; closed only by a walk built from the requirement text, KZ-changes--video-production-hardening-1)". Severity stays High. |
| Severity | High |
| Status | pending |

### P5

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add source `changes/video-production-hardening`; recurrence note: "recurred (test-report.md claimed a `video-production.test.js` pin for FR-6's skill side that did not exist — validation W-4; a worker reported 482 LOC for a 338-line file; design P-15 / T14 called 11 lines '11 occurrences' of a 12-occurrence count — W-7)". |
| Severity | High |
| Status | pending |

### P6

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--leader-brief-contract-2 |
| Edit | Add source `changes/video-production-hardening`; recurrence note: "recurred ×4 (T6 and T13 falsifiers predicted a red that did not occur as worded; T15's falsifier missed its predicted OpenCode red; design §7.1's Cursor 'Tester today' cell was never observed and was false — corrected at execute)". |
| Severity | High |
| Status | pending |
