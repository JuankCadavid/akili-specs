# Validation Report — Bound What an Implementer Spawn Costs

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/subagent-context-budget` |
| Validated at | `b537c18`, 2026-09-30 |
| Validator | This session on Fable 5.1 (T3 Auditor). Implementers ran on `sonnet`, Reviewers on `opus`: author ≠ auditor holds |
| Inputs | `proposal.md`, `requirements.md` (amended §10), `design.md` (§13), `tasks.md`, `execution.md`, `closure.md`, `judgment.md`, `measure/baseline.txt`. No `test-report.md` exists (see W1) |
| Verdict | **PASS with 6 WARN, 0 FAIL, 0 BLOCKED — archive-ready** |

## 2. Summary

Every requirement clause is delivered by shipped text that a Reviewer on another model confirmed, and the closure walks (reviewed three times) reproduce. The warnings are evidence limits and accepted overruns, not defects: no test gate exists for a prose spec, the FR-8 measurement is owed by design, and the run exceeded its review and line budgets with the user's consent.

| Phase | Result |
|---|---|
| Task completion | PASS — 5/5 `[x]`, each with a Reviewer `PASS` in `execution.md` |
| File existence | PASS — all 24 design surfaces present; no unplanned file |
| Build integrity | PASS — `verify:cli`, `pack:dry-run`, `git diff --check` green |
| Requirement coverage | PASS — clause-level, via `closure.md` §5 and an independent spot-walk |
| Quality / 4R | 14 advisories carried, none a spec violation |
| Design conformance | PASS — one execute-time edit (DD-6), one user Pivot (NFR-1), both recorded and swept |
| Constitution impact | n/a — no module created or reshaped |

## 3. Task Completion

| Task | Status | Attempts | Reviewer | Evidence |
|---|---|---|---|---|
| T1 | `[x]` | 2 | PASS (`opus`) | `execution.md` T1 entry; checks 1–9; falsifiers (a)(b) red |
| T2 | `[x]` | 1 | PASS | T2 entry; checks 1–8; two falsifier walks |
| T3 | `[x]` | 5, after a HALT the user lifted | PASS | T3 entry + `## HALT: T3` + attempts 4–5; 15 checks; falsifiers red in every home |
| T4 | `[x]` | 2 | PASS | T4 entry; checks 1–6 |
| T5 | `[x]` | 3 | PASS | T5 entry; `closure.md` |

All five closed on a Reviewer `PASS`; no `REVIEW_WAIVED`, no `REVIEW_SKIPPED`. One continuation (T3 attempt 3). Evidence re-run `VERIFIED` on every attempt.

## 4. File Existence

`git diff --stat c94e6b6 HEAD`: 21 files. Packaged and mirror files as the design's surface table lists — `implementer.md`, `tester.md`, `reviewer.md`, `leader.md`, `akili-execute.md`, `docs/commands/akili-execute.md`, `docs/flow.md`, `README.md`, `CHANGELOG.md` — plus the spec folder (`measure/`, `halt/`, `closure.md`, `judgment.md`, `execution.md`). `docs/model-routing.md` untouched after the falsifying grep (T4). Surface presence re-checked by grep at `b537c18`: every named block, bullet and line found once where the design places it.

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm run verify:cli` | 11 commands / 24 skills / 7 resources, no errors |
| `npm run pack:dry-run` | 275 files, 2.1 MB; personas and CHANGELOG included |
| `git diff --check` | clean |
| `node bin/akili.js doctor --tool all` | CODEX target `INCOMPLETE` (7 files missing in a local orca runtime home) — a local install state, not this spec's (W6) |

No test runner applies: every task's `Red run` is `n/a (no test gate)`.

## 6. Requirement Coverage

Primary evidence: `closure.md` §1–§5 (five walks, four held-out cases, term-by-term FR-1…FR-10), audited by three Reviewers; `tasks.md` §3 clause ownership.

| Requirement | Result | Note |
|---|---|---|
| FR-1 loop bound | PASS | Scenarios + H2 walked; `implementer.md` item 4 term table |
| FR-2 checkpoint exit | PASS | Seven fields in order; both exits; premature-stop clause; evidence carried |
| FR-3 Leader action | PASS | R1–R8 + fall-through + H1 one action each; sketch order = paragraph order; independent spot-walk H5 (a checkpoint on attempt 3 after two FAILs: one spawn, FAIL feedback kept, attempt stays 3) reproduces |
| FR-4 brief | PASS | *Spawn budget* bullet, both rows |
| FR-5 output | PASS | Scenarios + H3; the failing part and the count not shown |
| FR-6 reads | PASS | Scenarios + H4; every DD-8 row per role; the two "full file" sentences amended |
| FR-7 record | PASS | `spawns:` per spawn, six *ended* values, no estimate, gates nothing |
| FR-8 measurement | WARN (W2) | Scripts kept; measurement owed after 30 spawns, by the FR's own text |
| FR-9 compatibility | PASS | Two bullets delivered structurally (Reviewer ruling, T5); "not recorded" delivered in the log format |
| FR-10 docs | PASS | CHANGELOG clause-checked against HEAD; mirrors; migration note complete against the four-persona diff |
| NFR-1 growth | PASS | 13,969 / 11,733 / 10,427 vs 14,054 / 11,752 / 10,467 (caps as raised at the Pivot) |
| NFR-2 one home | PASS | Grep hits only the non-host clause |
| NFR-3, NFR-4, NFR-5 | PASS | No host tool names; 0 line pointers in shipped prose; empty diff in the bounded paths |

Negative constraints: each `BUT` / `AND IT MUST` clause has a named owner in `tasks.md` §3 and a walked case in `closure.md`; none was discharged by citing a different requirement.

## 7. Linting & Code Quality (4R, advisory)

Carried from `execution.md`; none is a spec violation, none became work.

| Source | Advisory |
|---|---|
| T1 | "Fix and re-run until a bound" no longer says a passing run ends the loop (the *Reset* row implies it); "a pre-code red" is shorter than DD-3's wording; at the call bound with nothing failing the `FATAL_FAIL` terms do not fit |
| T2 | Root guides are read whole with no 400-line bound (spec gap); the Reviewer keeps "The full-file escape hatch remains"; the merged Tester row parses only in order; the Implementer's `tasks.md` row is stricter than DD-8 |
| T3 | A third checkpoint carrying a Pivot flag is ordered by the sketch only (Pivot first); the Step 4 heading names only the rework limit; two "which checkpoint" labels accumulate on a second checkpoint; the sketch has no R5/R6 branch (pre-existing; prose governs) |
| T5 | Migration note could say "block (table and section-lookup sentence)" for the Reviewer; the old item-4 opening sentence is not named for replacement (redundant, not contradictory); `closure.md` cites one line number |
| Judgment L-13 | A task closed after 1–2 checkpoints reads as a clean run in `kaizen` |

## 8. Design Conformance

| Check | Result |
|---|---|
| Surfaces 1–24 | All present (§4) |
| DD-1…DD-12 | Delivered as designed; DD-6 corrected at execute time ("six" → "seven" fields), recorded in T3's entry and committed with the HALT record |
| Budget | Tasks 5 = 5. Review rounds **14 vs 10**; lines ~175 estimated vs 9 packaged/mirror files changed by 31 deletions and 148 insertions (`git diff --stat c94e6b6 HEAD` on those paths). Both overruns accepted by the user at T3's fifth attempt (W3) |
| Premise Ledger | P-13 confirmed by the T1 experiment (60 of 60, mixed work); P-15 stays open, owned by the next two Kaizen retrospectives. The count line still reads "2 UNVERIFIED" as written at design time; `execution.md` records the settlement |
| Pivot | NFR-1 caps raised by the user; forward and backward sweeps recorded; no brief re-issued (none had been dispatched) |
| Proposal alignment | Option C delivered in full; non-goals respected (no tier, wrapper, registry, task-sizing, `kaizen`, installer or command change); success criteria 1–5 met, 6 owed (FR-8) |
| Cross-document figures | Consistent: 7 fields, caps, 5 tasks, 10-round budget, 22/20/2 judgment rows, 19+2 ledger rows. One estimate-vs-measure gap (W4) |

## 9. Test Evidence Summary

No `test-report.md`: `/akili-test` was not run and no task carries a test gate (all `Red run: n/a`). The spec's gates are literal walks with held-out cases, executed falsifiers, greps with baselines run before writing, and the three build commands — as `requirements.md` §8 planned. Every falsifier ended red, including the T3 walks re-run with the rule deleted in every home (W1).

## 10. Agent Guide / Constitution Impact

No `## Constitution Impact` note; no module or boundary changed. The deployed `.agents/` personas of this repository (gitignored) and of downstream projects still carry the pre-change sentences; the CHANGELOG's migration note names what to replace (W5).

## 11. Remediation

| ID | Level | Finding | Action |
|---|---|---|---|
| W1 | WARN | No automated test evidence; prose spec with no test gate | Accept: the walks and falsifiers are the planned gate |
| W2 | WARN | FR-8 measurement owed | Run `measure/dist.py` after the first 30 Implementer spawns under the new personas; report met/unmet |
| W3 | WARN | Review rounds 14 vs 10; lines over estimate | Accepted by the user; Kaizen input (task size, rules-document rounds) |
| W4 | WARN | `execution.md` summary states "~175 lines" as an estimate | Cosmetic; the measured figure is in §8 here. No edit |
| W5 | WARN | Deployed `.agents/` personas (this repo, STAR) predate the change | Apply the migration note by hand before the next `/akili-execute` in each project |
| W6 | WARN | `doctor --tool all` reports the CODEX target incomplete in a local runtime home | Unrelated to this spec; `akili doctor --tool all --fix` when convenient |

No FAIL. No BLOCKED.

## 12. Archive Readiness Recommendation

**Ready.** All tasks `[x]` with Reviewer `PASS`; no FAIL; every WARN accepted or assigned a follow-up; drift recorded in the spec documents and `execution.md`.

```text
/akili-archive changes/subagent-context-budget
```
