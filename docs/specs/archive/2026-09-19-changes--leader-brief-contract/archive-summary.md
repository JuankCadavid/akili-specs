# Archive Summary — Leader Brief Contract

**Outcome:** shipped. `/akili-execute` now binds the Implementer brief to a five-clause contract, delivers the Reviewer's diff by size, fixes the Reviewer report's order and ceiling, treats runtime events as a lane that never consumes an attempt (per-role recovery ladders with entry rungs and a mid-climb rule), records a waived review as `## REVIEW_WAIVED`, and rolls back a HALT by tree state. 6/6 tasks PASS; one Pivot at the closure gate; closing walkthrough 0 INCONCLUSIVE over seven cases; packaging green.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/leader-brief-contract` |
| Archive Date | 2026-09-19 |
| Depth / Type | Standard / Change |
| Approval Mode | `gated` — run unattended on 2026-09-18 (continued only after each PASS, stopped at the first exception); resumed 2026-09-19 on the user's explicit approval of the escalation |
| Final Status | **Executed — 6/6 PASS**; `/akili-test` and `/akili-validate` not run (absence accepted, see §7) |
| Release Classification | CHANGELOG proposes **patch** (as the task text required); flagged to the user as possibly **minor** — new record type, new final-status value, ladders read by three other commands |
| Sibling spec | `changes/gate-falsifiability` (archived 2026-09-18) — its two hand-off lines were delivered here (FR-1 clause (e), FR-7) |

## 2. Requirements Delivered

| ID | Requirement | Delivered by |
|---|---|---|
| FR-1 | Brief contract: narrow-never-widen · convention files by lookup · source-or-`UNVERIFIED` · `[advisory-grade]` with both halves · copied `Falsifier` / `Red run` / `Consumers` | T1, T3 |
| FR-2 | Execute-time spec edits reach the Reviewer as named checks, carried once more; Pivot boundary | T1, T2 |
| FR-3 | Reviewer report contract (`STATUS:` first, order, ~600 words, overflow file); diff ≤ 300 lines inline, else scratchpad file; non-host inline | T1, T3 |
| FR-4 | Runtime-event vocabulary, one accounting rule, per-role ladders; **entry rung per event kind and the mid-climb rule** *(added by the T6 Pivot)* | T2, T2 owed clause, T3 |
| FR-5 | `## REVIEW_WAIVED` record with three flags; closability; stop under `pre-approved`; `/goal` condition | T2 |
| FR-6 | HALT rollback by tree state — clean · other PASSed work (explicit pathspec) · unattributed (never restored) | T2, T3 |
| FR-7 | `reviewer.md` red-run / mutation-trace item with the absent-`Red run` skip (hand-off) | T3 |
| FR-8 | `/akili-resume`, kaizen Measure + clean-run predicate, `/akili-archive` 4.1 name their `REVIEW_WAIVED` branch | T4 |
| FR-9 | Mirror at parity; root docs only where a sentence turned false (none); CHANGELOG | T5, T6 |
| NFR-1..8 | Bounded consumers · host-neutral · no migration · rules by class · no hook change · bounded brief step · parallel safety · invariants byte-preserved | T1–T6 |

## 3. Files Changed Summary (from `execution.md`; 9 shipped files, 78+/26−, 11 commits `[SPEC:changes/leader-brief-contract]`)

| Area | Files |
|---|---|
| Command | `.claude/commands/akili-execute.md` — *Runtime-failure fallback* (vocabulary, accounting rule, ladders, **Entry rungs**), pseudocode, Steps 2.2, 2.3, 2.4, 3, 4, 5, Execution Log Format |
| Personas | `.claude/templates/leader.md` (brief-contract principle; item 4), `.claude/templates/reviewer.md` (audit item; 4R clause; mode note; report contract) |
| Consumers | `.claude/commands/akili-resume.md`, `.claude/skills/kaizen/SKILL.md`, `.claude/commands/akili-archive.md` — one clause each |
| Mirrors | `docs/commands/akili-execute.md`, `docs/skills/kaizen.md` |
| Release | `CHANGELOG.md` (Unreleased: Added ×1, Changed ×1, classification Note; one clause added at Pivot closure, **not Reviewer-audited**) |
| Untouched by design | `/akili-specify`, `tdd`, `/akili-constitution`, `implementer.md`, `/akili-test` and their mirrors (NFR-7 — diff empty); `docs/flow.md`, `README.md` (no sentence turned false) |

## 4. Test Evidence Summary

No automated test suite exists for command/persona prose; `/akili-test` was not run (accepted). Behavioral evidence is the **T6 closure walkthrough** (`t6-walkthrough.md` in this folder): a literal reader of the shipped text over a throwaway git fixture (nine uncommitted tasks, two unattributed files, an old-style log). Attempt 1 (HEAD `1dc7894`): worker reported 7/7 PASS; the Reviewer, prompted by the Leader's challenge, ruled **Case 2 INCONCLUSIVE** → FAIL for the spec → escalation → Pivot → T2 owed clause. Attempt 2 (HEAD `528c8ad`): Cases 2 and 3 re-walked and CONFIRMED; the other five carried (one shipped change, 2 insertions, every deciding sentence verbatim at HEAD). **0 INCONCLUSIVE over seven cases.** Hand-off lines byte-checked against the archived `gate-falsifiability` design §7. Packaging: `verify:cli` 0, `pack:dry-run` 0 (275 files), `git diff --check` 0.

## 5. Validation Summary

`/akili-validate` not run (accepted — prose-only change; three predecessor specs archived the same way). Substitutes: 10 Reviewer verdicts (`opus`, author ≠ auditor by model), the §8 closure greps with two enumerated sanctioned hits (the Step 4 clean-tree row; Step 3's Step 8F hook sentence, DD-7), the NFR-8 invariant check read as "wording unchanged" over five `-`/`+` pairs, and the Reviewer's fixed-string confirmation of every quoted deciding sentence.

## 6. Execution Facts

| Signal | Value |
|---|---|
| Reviewer FAIL rework attempts | 2 (T1 ×1 — surviving verb contradicting the inserted first-line rule; T6 ×1 — Case 2 INCONCLUSIVE) |
| HALTs / FATAL_FAILs / waivers | 0 / 0 / 0 |
| Pivots | 1 (T6 → FR-4 *Mid-climb events* + scenario, DD-12, T2 re-opened for the *Entry rungs* paragraph, T6 Case 2 outcome amended to `→ fresh worker`) — user decision 2026-09-19 |
| Budget tripwire | not reached (no task had a second FAIL); T2's and T6's extra rounds were approved with the Pivot; tasks stayed at 6 |
| Leader pre-review returns | 4, none consuming an attempt (T2 ×3 items, T3 ×3 items, T2 owed clause ×1) + one Leader challenge on T6 that named the Case 2 gap before the Reviewer ruled |
| Runtime events | 1 provider-limit death (T2's Reviewer) → resume-by-message; 1 harness truncation of a report (T5) → tail by message |
| Execute-time spec edits | 3 — two verification baselines in `tasks.md` (T2 v5, T3 v1); the FR-4 "higher of rung reached and entry rung" clarification (Reviewer-ruled an edit-carry) |
| Judgment-day | not run (draft mode); Step 2.3 reversion challenge ran inline at specify (DD-3, DD-6) |
| Budget vs actual | 6 tasks / 6; ~210 LOC est. vs 78+/26− shipped; review rounds 1/task budgeted, T1, T2, T6 used 2 |

## 7. Accepted Warnings Or Follow-Ups

| Item | Disposition |
|---|---|
| `/akili-test`, `/akili-validate` not run | Accepted — the user invoked `/akili-archive` on a prose-only spec after the run report stated neither ran; walkthrough + Reviewer chain as substitute |
| Release class (patch vs minor) | **User decision at release** |
| *Entry rungs* death branch is numbered from the Implementer row; on the Reviewer row rung 4 is the waiver | Follow-up: `/akili-quick` candidate (one clause scoping the branch to the Implementer row); the shipped sentence self-scopes via "rung 1's tree probe" |
| T2 advisories: pseudocode's event branch sits after the Reviewer verdict only; Step 5 opens "After a task PASSes or HALTs"; Step 3 headed "Finalize on PASS" | Recorded, not fixed (advisories never become tasks); `/akili-quick` candidates |
| CHANGELOG clause for entry rungs / mid-climb rule was written by the Leader at Pivot closure | Not Reviewer-audited — read at release |
| Known Step 8F hook interaction: a waived *first* task in a fresh `execution.md` stays `[~]` (the hook greps `PASS`) | Accepted at design (DD-7); hook not extended |
| Deployed `.agents/*` copies and `~/.claude/` installs lag this repo | Expected — next release + `--force` install |
| Kaizen: 3 new pending items + 2 from `gate-falsifiability` | See `docs/specs/kaizen/changes--leader-brief-contract.md`; Apply Mode offered at this archive |

## 8. Historical Notes

- Origin: the tier-2 reading of a 105-entry kaizen corpus from a consuming project — briefs that widened tasks or dropped convention files, Reviewer verdicts truncated by the harness, quota deaths counted as attempts, tasks closed with no Reviewer and no record, and a blanket HALT restore that destroyed nine PASSed tasks.
- This run exercised its own subject matter: a provider-limit death hit T2's Reviewer and was recovered by message with no attempt consumed — handled by the ladder T2 was in the middle of shipping. A harness truncation cut T5's report after the fourth check, which is the case the report contract's ceiling exists for.
- The closure gate reported 7/7 PASS and was wrong, for the second spec in a row. The worker had landed on the task's *Expected recorded outcome* instead of deriving it; the Leader's challenge (strip the parenthetical; does any shipped sentence decide this step?) exposed that FR-4's terminal-branches paragraph had never shipped and that no approved text decided a mid-climb event. The approved expected outcome itself turned out to be derivable from neither reading.
- The rule the user approved ("continue the climb") and the entry rungs the user approved disagreed for one sequence — a death with a surviving context arriving mid-climb. "The higher of the two" was the only reading that left every approved sentence standing; the owed-clause Reviewer ruled it an edit-carry, not a Pivot.
