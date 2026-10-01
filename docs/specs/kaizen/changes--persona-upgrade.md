# Kaizen Entry — changes/persona-upgrade

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/persona-upgrade` |
| Date | 2026-10-01 |
| Branch | `master` |
| Branch Context | **`default`, apply-capable**. `AGENTS.md` pins `Default Branch: master`. No `Integration Branch:` pin exists |
| Archive Run | 1 |
| Approval Mode | `gated` through T2b, `pre-approved` from T3 |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 14 (13 planned + T2b added at the T2 gate) | tasks.md |
| Implementer spawns | 26 (incl. 3 continuations); 1,190 tool calls | execution.md §3 |
| Reviewer FAIL rework attempts | **8** (T2 ×2, T3 ×1 as a parallel RISK/RELIABILITY pair, T4 ×1, T5 ×1, T7 ×1, T9 ×1, T10 ×1) | execution.md |
| Leader evidence re-run MISMATCH (implicit FAIL) | **2** (T4 attempt 2: a test read a gitignored file; T10 attempt 1: `EXIT: 0` claimed for a command that exits 1) + 1 Disqualifier breach recovered (T6: a worker wrote to the live `.agents/`, restored from the CLI's own backups) | execution.md T4, T10, T6 |
| HALTs / FATAL_FAILs | 0 / 0 | execution.md |
| Pivots | 0. One spec gap → task T2b (fixture `.gitattributes`); budget tripwire fired twice (lines at T2, lines + rounds at T3) | execution.md *Spec gap record*, *Budget tripwire* |
| PRODUCT_BUGs | n/a — no `/akili-test` run; FR-9's own suite (69 tests) is the gate | — |
| Judgment-day severe findings | 7 confirmed by both judges, 2 split, 14 warnings, 3 suggestions; `ESCALATED`, user chose *Fix only*, not re-judged. P-11 refuted and re-measured | judgment.md; design.md §13 |
| Validation FAIL / WARN | 1 / 8 at report time → **0 / 7** after the gate (R1 resolved by amendment A10; R8 executed; R10 found at the gate and resolved by A11) | validation-report.md §2, §11 |
| Tasks closed under `REVIEW_WAIVED` | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` | 0 — no task was `skip-eligible` | tasks.md §2 |
| Escaped defects (§3) | 0 by the definition (no `REVIEW_SKIPPED`). Three spec-internal conflicts flagged by Reviewers as "spec tension, carried" surfaced as validation FAILs (lesson 3) | execution.md T3, T10; validation-report.md |
| Tool-call bound | **7 of 26 spawns past the 60-call bound without a checkpoint** (74, 64, 65, 90, 120, 135, 85 by host count; every self-count lower: "~40", "~57", "~85", "95–100", "73", "~29"→45) | execution.md §3 |
| Budget delta | tasks 14 vs 13 · lines 3,118 vs ~750 (cap removed) · rounds 25 vs 21 → 26 | design.md §9; tasks.md §5 |
| Runtime events | 1 spawn failure (tmux pane) before T1a, recovered at rung 1 | execution.md T1a |
| Drift attributable | — | `docs/specs/audits/` holds no report |

## Lessons

- **KZ-changes--persona-upgrade-1 — A rule that lives in a persona does not reach a worker whose deployed persona predates it, and the brief cannot substitute.** (Methodology, Medium)
  - **Root cause.** The 60-call checkpoint bound shipped in `implementer.md` at v2.29.0; this repository's own `.agents/implementer.md` was an older scaffold (the FR-5 scenario of this very spec), so the bound reached every worker through the brief alone. 7 of 26 spawns ran past it, none checkpointed, and every self-count was below the host's. `/akili-execute` Step 0 checked only that `.agents/` *exists*.
  - **Evidence.** `execution.md` — T2 attempt 1 *Issues encountered*; T3 attempt 2 *Issues encountered* (the four-spawn table); §3 Summary (*Implementer spawns* row). `validation-report.md` §6 R8: the personas read `UNMARKED` ×4 before the gate.
  - **Standardization:** → P1.

- **KZ-changes--persona-upgrade-2 — A red that is a throw is not a red; the rule stood in `tdd` in words and 4 of 4 code tasks still reported throws as red.** (Methodology, Medium)
  - **Root cause.** `tdd` *Red before green* and *Verification evidence* both say a setup failure is not a red, but the report shape asked for a *description* ("names the assertion"), not an artifact. First-attempt Implementers reported `sectionStates` stubbed to throw (T2), "written together, not red-first" (T3), `TypeError: migratePersona is not a function` (T4) and `ENOENT before the file existed` (T5) as reds; each cost a review round or a continuation, and each later red was recorded as an `expected/actual` pair without difficulty.
  - **Evidence.** `execution.md` — T2 attempt 1 Reviewer issue 2; T3 attempt 1 spawn 1 *Not Done* bullet 4 and owed item 1; T4 attempt 1 Reviewer issue 2; T5 attempt 1 spawn 1 *Red run* and owed item 2.
  - **Standardization:** → P2.

- **KZ-changes--persona-upgrade-3 — A spec tension between two approved clauses is Pivot evidence, not an advisory to carry to closure.** (Methodology, Medium)
  - **Root cause.** T3's Reviewers named two tensions (design §5.1 majority-EOL vs FR-4 "any byte"; untracked `.agents/` vs FR-4 "git-tracked") and the Leader "carried them to the user … to close at T10"; T10 found a third (FR-10 bullet 1 vs DD-11) and recorded it as an open item. No command step owns a carried tension: the Pivot Protocol reads as "spec wrong or unviable", so a tension between two true-enough clauses fell between Pivot and advisory. All three reached `/akili-validate`; two became FAILs, closed by amendments A10/A11 that would have cost one line at a T3 gate.
  - **Evidence.** `execution.md` — T3 attempt 1 RISK/RELIABILITY advisories, *Leader adjudication*, T3 closing record *Advisories*; *Spec tensions carried, not absorbed*; T10 attempt 2 Reviewer issue 2. `validation-report.md` §6 FR-4 rows, §11 R1/R10.
  - **Standardization:** → P3.

- **KZ-002 recurred** (T10: `EXIT: 0` claimed for a command that exits 1; three CHANGELOG clauses overstated the shipped text; FR-10 misquoted) → P4 (digest-update, severity raised to High on the fifth recurrence).
- **KZ-changes--leader-brief-contract-2 recurred** (T1d: "all seven `###` subsections" — six exist; never counted) → P5 (digest-update).
- **KZ-changes--kaizen-loop-closure-2 recurred twice** (T7 Step 0 bullet kept as "compatible"; T9 `README.md` cell left on a scope reading) → P6 (digest-update).

## Noted, not a lesson

- **Worker self-counts of tool calls were wrong in every over-bound spawn** (7 of 7, always under). The checkpoint rule depends on a number the worker cannot produce; only the host count is true. If a later spec can expose the host count to the Leader (or the worker), that is the fix; a text rule cannot be.
- **Dogfooding worked both ways:** the spec's own FR-5 scenario (this repo's older scaffold) was the cause of lesson 1, and the shipped `--fix` closed it at the validation gate (R8). The first real Safe Update run also surfaced lesson 3's second instance (A11).
- **The Leader's evidence re-run caught three defects no Reviewer blocked on** (T4 a2, T10 a1, T6 breach). Positive practice; the rule ("never waived") earned its cost on this spec.
- **A brief tag leaked into shipped prose** (`[advisory-grade]` → two "Advisory:" paragraphs in `docs/cli.md`, follow-up R4). First sighting of brief vocabulary in a reference page.
- **Review rounds budgeted at one per code task "with tests as the gate"** needed three for T2 and T4 and two (plus continuations) for T3 and T5: the tests were the gate for the *code*, not for the evidence shape. Sibling of KZ-changes--scoped-constitution-reads-2 (which budgets prose tasks); feeds recurrence.
- **The `digests.json` entry shape and the `primary-instructions` extent were clarified at execute time** (design §5.2, §5.3) after T1d's forward pointer named the ambiguity before any code. The forward-pointer mechanism worked.
- **Two specs' worth of `CHANGELOG` discipline:** T10 attempt 3's clause → evidence table (every clause with its falsifying command) is the shape KZ-002 asks for; it took two rounds to reach it.
- **Follow-ups that are spec content, not process lessons:** R2, R6 (FR wording), R3, R4, R7, R9 (`/akili-quick`-sized), the 11 execution advisories, and `digests.json` at 347 kB as the largest packaged file.
- `Kind: upstream` does not apply in this repository: it *is* the methodology, so Methodology lessons take local edits here (precedent: every entry file in this folder).

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.claude/commands/akili-execute.md` — prerequisites, new paragraph after "If `.agents/` is missing, run `/akili-constitution` first…" |
| Edit | If `.agents/` exists, run `akili doctor --agents` before the first spawn (when the CLI is available; otherwise compare against the installed templates per `docs/cli.md` → *Persona Drift*). A persona reported `outdated`, `unmarked` or `missing` does not carry the current rules, and a rule stated only in the brief is not enforced: in `changes/persona-upgrade`, 7 of 26 Implementer spawns ran past the 60-call checkpoint bound — every self-count lower than the host's — because the deployed `implementer.md` predated the bound. Run `akili doctor --agents --fix` (or report the drift to the user) before spawning; do not paper over it in the brief. |
| Severity | Medium |
| Status | `applied (2026-10-01)` |

### P2

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.claude/skills/tdd/SKILL.md` — *AKILI-SPECS Integration* table, *Verification evidence* row (appended) |
| Edit | **The red is a quoted artifact, not a description:** per test name, quote the assertion's own expected/actual output (`expected: 'outdated', actual: 'current'`); a `TypeError` from a missing export, an `ENOENT`, or a stub that throws before the assertion is written as "not red" — in `changes/persona-upgrade` every code task lost a round or a continuation to reds of that kind reported as red. |
| Severity | Medium |
| Status | `applied (2026-10-01)` |

### P3

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.claude/commands/akili-execute.md` — Loop Rules, *Pivot Detection* bullet (appended) |
| Edit | **A spec tension is the lightest Pivot evidence, not an advisory:** when a Reviewer shows two approved clauses the code cannot both satisfy (a requirement sentence against a design decision, or two requirement clauses), present it at the next gate as a one-line amendment proposal and record the user's answer in the spec document. Never "carry it to the user at closure" — in `changes/persona-upgrade` three carried tensions (FR-4 vs design §5.1, FR-4 vs FR-5, FR-10 vs DD-11) passed every Reviewer and surfaced as validation FAILs. |
| Severity | Medium |
| Status | `applied (2026-10-01)` |

### P4

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-002` |
| Edit | Add `changes/subagent-context-budget` (missed by the previous pass's source column) and `changes/persona-upgrade` as source specs; append the T10 recurrence (false `EXIT: 0`, three overstated CHANGELOG clauses, a misquoted FR-10); raise severity Medium → **High** on the fifth recurrence. |
| Severity | High |
| Status | `applied (2026-10-01)` |

### P5

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-changes--leader-brief-contract-2` |
| Edit | Add `changes/persona-upgrade` as a source spec; append the T1d recurrence (a Disqualifier count of seven `###` subsections never run; six exist; the brief's measured count prevented a lost attempt). Severity stays Medium. |
| Severity | Medium |
| Status | `applied (2026-10-01)` |

### P6

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-changes--kaizen-loop-closure-2` |
| Edit | Add `changes/persona-upgrade` as a source spec; append the double recurrence (T7's Step 0 bullet kept as "compatible"; T9's `README.md` cell left on a scope reading) — the sweep now finds the hit and the failure has moved to judging it. Severity stays High. |
| Severity | High |
| Status | `applied (2026-10-01)` |

## Constitution Sync (Step 3 of `/akili-archive`)

| Item | Result |
|---|---|
| Agent guide sync | Two `## Constitution Impact` notes (T2, T5). Root `AGENTS.md` *Repository Purpose*: `.claude/templates/` bullet now names the markers and `digests.json`; `bin/akili.js` bullet names `digests.json` and `doctor --agents`; new bullet for `bin/persona.js` and `test/`. No child guide needed (one module, no divergent conventions); no `## Module Guides` index exists and none is owed |
| Factual-claims sweep | Root `AGENTS.md` at `3a5913e`: *Verification* block gained `npm test` (the three-command list was stale); *Release Rules* step 5 now notes the wider `git add` hint. `docs/release-checklist.md` *Verify Locally* gained `npm test` and the digests note. `CLAUDE.md` is `@AGENTS.md` — nothing separate |
| TRD and ADR sync | Not applicable. No TRD exists |
| Spec family | Not a manifest-listed child |
| CodeGraph | `.codegraph/` exists; `codegraph sync` run after the archive move (see the archive report) |

## Apply Pass (2026-10-01, same run)

| Item | Re-verified against | Result |
|---|---|---|
| P1 | `execution.md` §3 *Implementer spawns* row (7 of 26 past the bound; host counts listed); `akili-execute.md` prerequisites paragraph exists at HEAD | Holds. Applied |
| P2 | `execution.md` T2 a1 issue 2, T3 s1 owed item 1, T4 a1 issue 2, T5 s1 owed item 2; `tdd/SKILL.md` *Verification evidence* row exists at HEAD | Holds. Applied |
| P3 | `execution.md` *Spec tensions carried, not absorbed*; `validation-report.md` R1, R10; `akili-execute.md` *Pivot Detection* bullet exists at HEAD | Holds. Applied |
| P4–P6 | Rows present in `## Active Lessons`; the recurrence claims cite this entry file | Hold. Digest rows updated |
| Digest cap | 10 rows before; +3 new → retired `KZ-001`, `KZ-changes--leader-brief-contract-1`, `KZ-changes--scoped-constitution-reads-2` (Applied, no pending item, no recurrence since application). `KZ-changes--gate-falsifiability-2` kept despite its 2026-09-19 application date: it recurred in five specs since, so it is not institutionalized | 10 rows after |

Backlog after this pass: 0 pending across `docs/specs/kaizen/`. `CHANGELOG.md` `Unreleased` carries the three standardizations and the constitution sync.
