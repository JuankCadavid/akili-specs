# Execution Log: Spec Family Ordering (Parent→Child Control)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/spec-family-ordering` |
| Depth | Standard |
| Approval Mode | gated |
| Started | 2026-08-12 |
| Leader | Fable 5 (session model, T1) |
| Implementer | sonnet (T2, fallback sub-prompt — no Step 8E wrappers in repo) |
| Reviewer | opus (T3, fallback sub-prompt; author ≠ auditor held: sonnet vs opus) |

## 2. Task Execution History

### T1 — Canonical `family.md` template in `/akili-constitution` — PASS (attempt 1)

- **Date:** 2026-08-12
- **Attempts:** 1
- **Files changed:** `.claude/commands/akili-constitution.md` (+18/−3)
- **What was done:** `family.md` added as 4th Step 7 general-setup template defining the canonical spec-family manifest schema (Document Control: parent spec path, created, last updated, family status `open`/`complete`; child table `#` / `Spec Path` / `Depends on` / `Parallel-safe` / `Status(pending/active/done/blocked)`; closed-set rule stated inside the template text). Enumerations updated at lines 37, 52, 340, 866.
- **Implementer verification:** `grep -n "family" .claude/commands/akili-constitution.md` + `git diff --stat` — all new hits read "spec family"/`family.md`; pre-existing model-family hits (473/541/572, shifted +15 by insertions) unchanged; single file in diff. Disqualifier applied: each enumeration hit confirmed inside its enumeration.
- **Implementer assumptions (verbatim):** (1) "Line 315 (`<family>/<child>`) is a path-placeholder token, not free prose — it mirrors design.md §5's own canonical notation for `Spec Path` values verbatim (required by NFR-3, reference-not-restate)… I left it rather than forcing an awkward `<spec-family>/<child>` rewrite that would diverge from the design's literal schema." (2) "Line 309 uses the hyphenated compound 'spec-family status'… flagging in case the Leader wants the unhyphenated form." Leader adjudication: both accepted — (1) satisfies NFR-3; (2) qualified compound, no collision. Reviewer independently confirmed both.
- **Reviewer verdict:** `STATUS: PASS` — "The Step 7 addition defines the family.md schema exactly once and exactly as design.md §5 specifies — Document Control, all five child-table columns, the pending/active/done/blocked vocabulary, and the closed-set rule stated inside the template text — and all four in-file enumerations gained family.md at their correct sites. Negative constraints hold: single file touched (no packaged file, no bin/akili.js), and every new prose mention uses the qualified 'spec family' with the three pre-existing model-family hits unchanged."
- **Requirements covered:** FR-1 (all clauses except the `akili-specify.md:85` / `docs/flow.md:145` enumeration clauses, owned by T3/T2), NFR-2, NFR-3.
- **Issues encountered:** none.
- **Final verification result:** PASS (grep + diff-stat checks green, disqualifiers applied).

### T2 — `/akili-propose` chunking writes the manifest + `docs/flow.md` consumes it — PASS (attempt 1)

- **Date:** 2026-08-12
- **Attempts:** 1 (wave 1, parallel with T3 — disjoint files)
- **Files changed:** `.claude/commands/akili-propose.md` (+4/−2), `docs/flow.md` (+3/−3)
- **What was done:** Scope Chunking now writes `family.md` (schema by reference to constitution Step 7) before any child folder, seeded with RICE/MoSCoW order + `Depends on`/`Parallel-safe`/`Status: pending`; closed-set + late-addition-HITL rules stated; children gain `Parent Spec:` Document Control row (chunking bullet + proposal structure item 1); Greenfield inheritance explicit. `docs/flow.md`: fleet precondition 1 reads independence from the manifest ("decided at decomposition time, persisted in `family.md`" — DD-6; "specify time" gone), waves cite manifest `#`/`Depends on` order, general-setup artifacts row mentions the schema.
- **Implementer verification:** greps — `family.md` hits at all 5 expected sites; `Parent Spec` ×2; `specify time` in flow.md = 0; diff isolated to the 2 in-scope files.
- **Reviewer verdict:** `STATUS: PASS` — all FR-2/FR-6 clauses + FR-1's `flow.md:145` clause satisfied at source; NFR-3 disqualifier does not fire (reference, not restatement); flat-spec behavior preserved (NFR-1).
- **ADVISORY (non-gating, recorded per Advisory-Never-Grows):** `akili-propose.md:144` ends with a self-referential line-number pointer `` (`:143`) `` — not an existing convention in shipped command prose, will rot on next edit, redundant (the fields are named in the same sentence). Reviewer suggests deleting the parenthetical; not folded into any task without user approval.
- **Requirements covered:** FR-2 (both scenarios, all clauses), FR-6, FR-1 `flow.md:145` clause, NFR-1, NFR-3.
- **Final verification result:** PASS.

### T3 — `/akili-specify` mirrors the contract and reads the parent manifest — PASS (attempt 1)

- **Date:** 2026-08-12
- **Attempts:** 1 (wave 1, parallel with T2 — disjoint files)
- **Files changed:** `.claude/commands/akili-specify.md` (+6/−5)
- **What was done:** Step 0 gains item 5 "Spec family membership" (read parent `family.md` when the target is a listed child; warn-never-block on unmet `Depends on`; no sibling creation outside the closed set) with items renumbered 5→8 and the internal "rule 6"→"rule 7" cross-reference updated; Step 1.1 chunking carries the same manifest contract as propose by reference; `:85` general-setup enumeration gains `family.md`.
- **Implementer verification:** `grep -n "family.md"` hits at :85, :93, :116; warning wording confirmed; diff isolated to the file.
- **Reviewer verdict:** `STATUS: PASS` — all FR-3 clauses + FR-1 `:85` clause + NFR-3 satisfied; renumbering left no stale cross-reference in the file or any consumer; flat-spec overhead zero (conditional step).
- **Requirements covered:** FR-3 (all clauses), FR-1 `:85` clause, NFR-1, NFR-3.
- **Issues encountered:** none.
- **Final verification result:** PASS.
