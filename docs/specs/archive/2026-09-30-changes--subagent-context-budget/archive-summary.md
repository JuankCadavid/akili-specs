# Archive Summary — Bound What an Implementer Spawn Costs

## 1. Document Control

| Field | Value |
|---|---|
| Original spec path | `changes/subagent-context-budget` |
| Archive date | 2026-09-30 |
| Archived at | `31fac9e` on `master` |
| Final status | **Complete.** 5/5 tasks on a Reviewer `PASS`; validation PASS with 6 WARN, 0 FAIL |
| Approval mode | `pre-approved (user, 2026-09-29)` from the design gate on; three stops for the user (Pivot, HALT, fifth attempt) |
| Release | Not yet. `CHANGELOG.md` `Unreleased` holds the entry (proposed **minor**) |

## 2. Outcome

An Implementer run is now bounded and has an exit:

- The self-correction loop stops at **3** consecutive same-failure cycles or **60** tool calls; at a bound the worker writes a `STATUS: CHECKPOINT` report of seven fields, or `FATAL_FAIL` on its existing terms.
- The Leader respawns a fresh Implementer from the report, at most **2** checkpoints per task; a third is a HALT with the cause named.
- Command output entering the Implementer's or Tester's context is capped at **100** lines; all three workers read spec documents by section and files over **400** lines by range.
- Each spawn's size is on record in `execution.md`, as the host reports it.

Measured basis (two projects, 297 Implementer spawns): Implementer spawns over 100 turns held 53% of cache-read; spec documents were read whole in 99 of 219 reads. The effect is **not yet measured** (FR-8, owed).

## 3. Requirements Delivered

| ID | Title | Result |
|---|---|---|
| FR-1 | Self-correction loop bounded | Delivered — `implementer.md` item 4 |
| FR-2 | Checkpoint exit, seven fields, both stops lists | Delivered |
| FR-3 | One Leader action per report; respawn; cap; accounting; HALT sentences | Delivered — `/akili-execute` Step 2, 2.2, 2.3, 2.4, 4, 5, log format; `leader.md` |
| FR-4 | The brief states the budget | Delivered — *Spawn budget* bullet |
| FR-5 | Output discipline | Delivered — `implementer.md`, `tester.md` |
| FR-6 | Bounded reads | Delivered — three personas; two "full file" sentences amended |
| FR-7 | Per-spawn record | Delivered — `checkpoints:` and `spawns:` lines |
| FR-8 | Effect measured | Scripts kept; measurement **owed** |
| FR-9 | Older projects behave as today | Delivered (structurally) |
| FR-10 | CHANGELOG, migration note, mirrors | Delivered |
| NFR-1…5 | Growth caps (as raised), one home per reader, tool-agnostic, no line pointers, bounded diff | Met |

## 4. Files Changed

Packaged and mirror files, `git diff --stat c94e6b6 31fac9e`: 9 files, 148 insertions, 31 deletions — `.claude/templates/implementer.md`, `tester.md`, `reviewer.md`, `leader.md`; `.claude/commands/akili-execute.md`; `docs/commands/akili-execute.md`; `docs/flow.md`; `README.md`; `CHANGELOG.md`. Spec folder: `proposal.md`, `requirements.md`, `design.md`, `tasks.md`, `judgment.md`, `execution.md`, `closure.md`, `validation-report.md`, `measure/` (3 scripts + baseline), `halt/t3-attempt3.diff`.

## 5. Test Evidence

No `/akili-test` run and no test gate (every `Red run: n/a`). Gates were literal walks with four held-out cases, executed falsifiers (every one red, the T3 ones re-run with the rule deleted in every home), greps with baselines run before writing, and the three build commands. Recorded in `closure.md`.

## 6. Validation

`validation-report.md`: PASS, 6 WARN (no test gate; FR-8 owed; budget overruns accepted; an estimate in the run summary; deployed personas predate the change; a local `doctor` state unrelated to the spec), 0 FAIL, archive-ready.

## 7. Accepted Warnings / Follow-Ups

| # | Item | Route |
|---|---|---|
| 1 | FR-8 measurement after the first 30 Implementer spawns under the new personas (`measure/dist.py`; baselines 14% / 188k–207k / 45%) | The user, with the Leader |
| 2 | Deployed `.agents/` personas in this repository and in downstream projects still carry the old sentences | Hand migration per the CHANGELOG note, before the next `/akili-execute` in each project |
| 3 | Root guides are read whole with no 400-line bound (T2 advisory) | `/akili-propose` if a project's root guide grows past it |
| 4 | R4 (assumptions-only report) has no action under `pre-approved` — pre-existing | `/akili-propose`, small |
| 5 | A task closed after 1–2 checkpoints reads as a clean run in `kaizen` (judgment L-13) | `/akili-propose` if the measurement shows checkpoints are frequent |
| 6 | A third checkpoint carrying a Pivot flag is ordered by the sketch only; the Step 4 heading names only the rework limit; the Reviewer's "full-file escape hatch" sentence | Readability follow-ups, pick up when a later spec touches those lines |
| 7 | Release of `Unreleased` (four entries) | The user |
| 8 | `changes/review-intensity-trial-terms`, paused at its Phase 1 gate; this spec counts as a fourth trial spec with 0 skips (all tasks `full`) | Resume when chosen |

## 8. Historical Notes

- Judgment day ran with two blind judges on `opus` (22 rows, 20 fixed); the user chose to apply the fixes without re-judging. It closes `ESCALATED`.
- The reversion challenge (one `opus` reviewer, one question) found 13 points, 9 of which changed the design before judgment day.
- P-13 (a worker keeps a count to 60 across mixed work) was settled by experiment before T1: exactly 60.
- T2 was Pivoted before its first spawn: NFR-1's byte caps could not hold the designed blocks; the user raised them.
- T3 HALTed after three attempts on a 17-site task and the user lifted the ceiling; it passed on attempt 5. Each of the five FAILs was a different real sentence.
- Review rounds: 14 against a budget of 10, accepted by the user at T3's fifth attempt.
