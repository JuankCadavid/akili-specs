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

### T4 — `/akili-resume` family-aware scan, dashboard, and recommendation — PASS (attempt 1)

- **Date:** 2026-08-12
- **Attempts:** 1 (wave 2, parallel with T5 — disjoint files)
- **Files changed:** `.claude/commands/akili-resume.md` (+20/−3)
- **What was done:** Step 0 gains leading item 1 — read every `family.md` first (schema by reference), verify each listed folder exists, report mismatch as drift (KZ-002), never reconcile; skipped entirely when no manifest exists (NFR-1). Step 2 gains a conditional family-grouped dashboard block (Kaizen-footer augmentation pattern). Step 4 recommends the next non-`done` child with satisfied `Depends on` by manifest order. Error handling qualified: manifest-listed `pending` children → "pending by family order"; unlisted folders keep the `/akili-specify` suggestion verbatim (reversion challenge 1).
- **Reviewer verdict:** `STATUS: PASS` — all four FR-4 clauses, NFR-1, NFR-3, and reversion challenge 1 satisfied at source; diff read-only in prose and effect; Output contract untouched.
- **ADVISORY (non-gating):** new dashboard example header "(2 open)" vs 4 numbered lines — coherent only if a spec family counts as one unit; pre-existing example uses per-entry counting. Confirm in T6's HITL walkthrough.
- **Requirements covered:** FR-4 (all clauses), NFR-1.
- **Final verification result:** PASS.

### T5 — `/akili-archive` row flip, parent gate, `:186` carve-out — PASS (attempt 1)

- **Date:** 2026-08-12
- **Attempts:** 1 (wave 2, parallel with T4 — disjoint files)
- **Files changed:** `.claude/commands/akili-archive.md` (+6/−2; Implementer reported +8/−2 — Reviewer corrected the stat, scope claim unaffected)
- **What was done:** Step 1 readiness bullet blocks parent archive while any child row is non-`done` (names the children; stop-and-ask override preserved byte-unchanged). Step 3 gains item 5 "Spec family manifest sync" — flips the archived child's row to `done` before the Step 5 move (schema by reference; CodeGraph hook renumbered to 6). Step 6 gains report item 8. Error Handling: blocked-parent bullet added; write-constraint bullet amended with the DD-5 carve-out naming exactly "the archived child's own row in the parent `family.md`".
- **Implementer assumption (accepted by Leader + Reviewer):** added the child-detection mechanism ("check the spec's `Parent Spec:` DC row, or the parent folder for a manifest naming this spec's path") — needed for executability; verified against real T1/T2 artifacts; widens nothing.
- **Reviewer verdict:** `STATUS: PASS` — all FR-5 clauses land; carve-out clears the DD-5 broader-wording disqualifier.
- **ADVISORY (non-gating):** the new Step 3 sentence "This is the one edit the Error Handling `:186` write-constraint bullet exempts" hardcodes a line pointer that this very diff made stale (bullet now at `:190`). Same class as T2's `` (`:143`) `` pointer; queued for the same cleanup, pending user approval.
- **Requirements covered:** FR-5 (both scenarios, all clauses), NFR-1, NFR-3.
- **Final verification result:** PASS.

### Scope note — user-approved additions to T6 (gate after wave 1)

At the wave-1 HITL gate the user approved folding the T2 advisory fix (delete the `` (`:143`) `` self-pointer in `akili-propose.md`) into T6's closure sweep. The equivalent T5 pointer (`` `:186` `` in `akili-archive.md` Step 3, now stale) is queued pending the same approval at the wave-2 gate.
