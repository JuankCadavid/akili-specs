# Archive Summary — Gate Falsifiability

**Outcome:** shipped. `/akili-specify` Step 3.2 now carries a **Falsifiability** block (six rules by defect class) beneath the unchanged KZ-006 falsifying-input rule; every task declares four Verification fields (`Falsifier`, `Red run`, `Disqualifier`, `Consumers`) with an absent-value rule; the `tdd` skill gains the *inert fixture* and *plumbing test* anti-patterns and a red that must fail on the behavioral assertion. 6/6 tasks PASS; closure walkthrough 0 INCONCLUSIVE over five named and three held-out corpus cases; packaging green.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/gate-falsifiability` |
| Archive Date | 2026-09-18 |
| Depth / Type | Standard / Change |
| Approval Mode | `gated` |
| Final Status | **Executed — 6/6 PASS**; `/akili-test` and `/akili-validate` not run (absence accepted, see §7) |
| Release Classification | proposed **patch** (CHANGELOG Unreleased Notes); user decides at release |
| Parallel spec | `changes/leader-brief-contract` — owns `/akili-execute`, `leader.md`, `reviewer.md`; receives this spec's two hand-off lines (§7) |

## 2. Requirements Delivered

| ID | Requirement | Delivered by |
|---|---|---|
| FR-1 | Expressible falsifier — mutation *and* diverging fixture rows or stub behavior; falsifier **executed against the post-change code** *(amended by the T5 Pivot)* | T1, T6 |
| FR-2 | Red run is recorded evidence and fails on the assertion; deferred timing for race classes | T1, T2 |
| FR-3 | Presence/opt-in claims locked to the real artifact; class **or attribute** list *(attribute restored by T6)* | T1, T6 |
| FR-4 | Compile gate when the compiler is stricter than the runner | T1 |
| FR-5 | Consumer Sweep — one grep per changed shared symbol, CI-excluded suites included | T1 |
| FR-6 | Rendered-measurement checklist, conditional; two viewports **differing on the dimension the gate depends on** *(axis restored by T6)* | T1, T6 |
| FR-7 | Four task Verification fields + absent-value rule (specify list, constitution template) | T1, T3 |
| FR-8 | `tdd`: five anti-patterns, red-on-assertion, evidence row | T2 |
| FR-9 | Two defect-class rows in Step 1.2 | T1 |
| FR-10 | Coherence and framework neutrality across command, skill, mirrors | T1, T4, T5 |
| NFR-1..6 | Bounded cost · framework-agnostic · no migration · parallel safety · KZ-006 byte-identical · accepted residual (walkthrough as substitute) | T1–T5 |

## 3. Files Changed Summary (from `execution.md`; 7 shipped files, 42+/6−, 9 commits `[SPEC:changes/gate-falsifiability]`)

| Area | Files |
|---|---|
| Commands | `.claude/commands/akili-specify.md` (Step 1.2 rows, field list, Falsifiability block, presence clause, checklist), `.claude/commands/akili-constitution.md` (Step 7 item 3, one line) |
| Skill | `.claude/skills/tdd/SKILL.md` |
| Mirrors | `docs/commands/akili-specify.md`, `docs/commands/akili-constitution.md`, `docs/skills/tdd.md` |
| Release | `CHANGELOG.md` (Unreleased: Added ×1, patch-classification Note) |
| Untouched by design | `/akili-execute`, `.claude/templates/`, and the execute mirror (NFR-4 — parallel-safety diff empty over the full range); `/akili-test` (DD-8) |

## 4. Test Evidence Summary

No automated test suite exists for command/skill prose; `/akili-test` was not run (accepted). Behavioral evidence is the **T5 retro-fit walkthrough** (`t5-walkthrough.md` in this folder): a literal reader of the shipped text only, against corpus gates read at the source. Attempt 1 (HEAD `c3c7918`): 5/5 named cases rejected; the Leader's held-out challenge then found 1 INCONCLUSIVE + 1 weak rejection → Pivot → T6. Attempt 2 (HEAD `83029ff`): **0 INCONCLUSIVE across five named and three held-out cases**, each rejected by a general sentence with its parenthetical stripped. Packaging: `npm run verify:cli` 0, `npm run pack:dry-run` 0 (275 files), `git diff --check` 0.

## 5. Validation Summary

`/akili-validate` not run (accepted — prose-only change; both predecessor specs archived the same way). Substitutes: 9 Reviewer verdicts (`opus`, author ≠ auditor by model), the framework-neutrality grep (one sanctioned pre-existing `jsdom` hit), the contradiction grep (two enumerating sites, same four fields), and the Reviewer's fixed-string confirmation of every quoted sentence at HEAD.

## 6. Execution Facts

| Signal | Value |
|---|---|
| Reviewer FAIL rework attempts | 1 (T2 — evidence discrepancy caused by the Leader's brief paraphrasing the task's grep) |
| HALTs / FATAL_FAILs / tripwires | 0 / 0 / 0 |
| Pivots | 1 (T5 → T6: executed falsifier; attribute presence; viewport axis; stub behavior; FR-1/FR-6 amended; DD-9) |
| Leader pre-review catches | 1 (T1: the block carried no name while two surfaces cited it — KZ-005) |
| Owed-clause touch | 1 (T1: FR-2's positive obligation, raised as an advisory, adjudicated as a coverage gap; Reviewer-confirmed) |
| Runtime interruptions | 2 (provider session limit — 3 workers; expired login — 1 worker); no attempt consumed; all resumed by message |
| Judgment-day | not requested (user chose Continue at Phase 2); Step 2.3 reversion challenge not triggered |
| Budget vs actual | tasks 5 → 6 (Pivot); ~126 LOC est. vs 42+/6− shipped; review rounds 1/task budgeted, T2 exceeded by one |

## 7. Accepted Warnings Or Follow-Ups

| Item | Disposition |
|---|---|
| `/akili-test`, `/akili-validate` not run | Accepted — the user invoked `/akili-archive` on a prose-only spec whose `execution.md` names the walkthrough as the behavioral evidence; same precedent as `changes/kaizen-loop-closure` |
| `tdd` *Inert fixture* bullet prescribes "a fixture row on which the readings diverge" — the wrong remedy for a broken-selector instance (Reviewer advisory, T6 and T5 re-run) | Follow-up: `/akili-quick` candidate (one clause in `.claude/skills/tdd/SKILL.md` + mirror) |
| Hand-off (1): `reviewer.md` audit checklist verifies the recorded red run and traces the named mutation | Owed by `changes/leader-brief-contract` FR-7 |
| Hand-off (2): `/akili-execute` Step 2.2 brief copies `Falsifier`, `Red run`, `Consumers` | Owed by `changes/leader-brief-contract` FR-1 clause (e) |
| Mirror compressions: rule 2's positive timing obligation and rule 5's CI-skipped clause are absent from `docs/commands/akili-specify.md` | Accepted by the T4 Reviewer as summary altitude (FR-10 asks agreement, not enumeration) |
| Step 1.2 table header still reads "Situation" | Left as is — pre-existing header, outside T1 |
| Globally installed copies under `~/.claude/` lag this repo until release + reinstall | Expected |
| Two kaizen standardizations recorded `pending` | See `docs/specs/kaizen/changes--gate-falsifiability.md`; apply after `changes/leader-brief-contract` lands (both targets sit in or beside that spec's owned or zero-diff files) |

## 8. Historical Notes

- Origin: the tier-2 reading of a 105-entry kaizen corpus from a consuming project — gates that were green and certified a defect. KZ-006 ("name the input that would make the check fail") was necessary and not sufficient: a *named* falsifier still passed on an inert fixture, a plumbing test, a setup-level red, a runner laxer than the compiler, an unswept consumer, or an unmeasured baseline.
- The spec's closure gate PASSed 5/5 and was still wrong. All five walked cases were cited by name inside the rules they tested; the Leader applied the spec's own rule 1 to its gate (strip the parenthetical; walk held-out cases) and found one class the rules admitted and two requirement nouns the shipped text had dropped. DD-9 — a named falsifier is not an executed one — came out of that Pivot.
- T2's only FAIL was caused by the Leader's brief transcribing the task's grep with a shorter pattern; two runtime interruptions killed four workers without consuming an attempt. Both are recorded as field evidence for `changes/leader-brief-contract`.
