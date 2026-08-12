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

### T6 — Mirrors, CHANGELOG, and closure sweep — PASS (attempt 1)

- **Date:** 2026-08-12
- **Attempts:** 1 (session interrupted mid-task; resumed via `/akili-resume`, edits recovered from the working tree and re-verified from scratch)
- **Files changed:** `docs/commands/akili-propose.md` (+4), `akili-specify.md` (+1), `akili-resume.md` (+1/−1), `akili-archive.md` (+1), `akili-constitution.md` (+1), `CHANGELOG.md` (+2), plus the two approved advisory cleanups in `.claude/commands/akili-propose.md` (+1/−1) and `akili-archive.md` (+1/−1), plus three gate-4 corrections in `.claude/commands/akili-resume.md` (+2/−2 in-line, dashboard block renumbered).
- **What was done:** One summary-level `family.md` mention added to each of the five docs mirrors, matching each mirror's own structure. `CHANGELOG.md` `Unreleased` → `Added` entry written, **classified minor** (new methodology behavior, no installer/hook/command change). Both stale self-referential line pointers removed: `` (`:143`) `` in propose (approved at the wave-1 gate) and `` `:186` `` in archive Step 3 (approved at the wave-2 gate, this session).
- **Gate 4 (HITL walkthrough of FR-4, `bilateral/` shape — 3 children, order 1→2→3, child 1 `done`, plus one flat spec):** walked the final resume text step by step. Grouping (`:88`), manifest-order recommendation of child 2 (`:132` → `/akili-execute bilateral/child-b`), folder-existence verification (`:29`) and read-only effect all derive from the text without assumptions. **Three findings, all fixed before closure:**
  1. **Gap (blocking, FR-4 BUT clause).** Step 0 item 2 listed all directories under `docs/specs/`; the family container folder holds only `family.md`, matches no phase file, and fell through to Error Handling `:149`, whose carve-out covers only manifest-listed `pending` **children**. A literal follower would report `bilateral/` as an incomplete spec and suggest `/akili-specify bilateral/` — an activity absent from the manifest. **Fix:** item 2 now states the family container is not a spec, renders as the Step 2 heading, and is never an `/akili-specify` target.
  2. **T4 advisory confirmed (dashboard counting).** The example mixed a family-as-one-unit header `(2 open)` with per-spec numbering (children `1,2,3`, flat spec `4`). **Fix:** family = one entry in both the header count and the top-level numbering (stated as a rule at `:88`, not left to the example); manifest `#` values number children as a nested list; the flat spec renumbered to `2`.
  3. **Output-contract ambiguity.** "report any mismatch as drift" in a command whose Output contract forbids writes, in a repo that has a real `docs/specs/drift-report.md`. **Fix:** "report … as drift **on screen** … rather than reconciling or repairing the manifest **or writing a drift report**."
  Mirror coherence follow-through: `docs/commands/akili-resume.md` lead-in corrected to "a four-step scan, preceded by a manifest read" (the new `0.` item had made "four-step" false).
- **Closure sweep (the §8 gates):**
  1. `grep -rl "family.md" .claude/commands/ docs/ CHANGELOG.md` → 17 paths = 6 sources (5 commands + `docs/flow.md`) + 5 mirrors + `CHANGELOG.md` + the 5 files of this spec folder (counted as one surface) = **13 surfaces, exactly the design §7 table**. No surface with zero hits; no hit in an unlisted file.
  2. Schema divergence: the full column-definition table exists at exactly one site, `akili-constitution.md:317`. Propose/specify/archive/resume cite columns by reference only. NFR-3 holds.
  3. Naming: every new hit reads "spec family" / `family.md`; the remaining bare-`family` hits in `akili-constitution.md` (473, 541, 572) and `docs/model-routing.md` are pre-existing **model**-family prose, untouched.
  4. HITL walkthrough: executed above — gap found, reported, fixed, re-walked green. Residual risk per `requirements.md` §8 remains **accepted and recorded**: real proof arrives only when a project exercises an actual split.
  5. NFR-4: `git diff --stat` over `.claude/`, `docs/commands/`, `docs/flow.md`, `CHANGELOG.md` from T1's parent = **68 insertions**, well under the ~150 tripwire.
- **Requirements covered:** FR-7; NFR-1, NFR-3, NFR-4 final checks; `requirements.md` §8 gate execution. All prior tasks' advisories discharged — Advisory-Never-Grows queue is empty.
- **Issues encountered:** the gate-4 gap above; fixed in-task per the T6 disqualifier ("do not pass on grep-green alone") rather than deferred.
- **Final verification result:** PASS — all five §8 gates green after the corrections.

---

## Execution Summary

All 6 tasks PASS on first attempt. Spec-family ordering is now defined once in `/akili-constitution` Step 7 and consumed by propose, specify, resume, and archive; `docs/flow.md` reads fleet independence from the manifest instead of re-deriving it. Zero overhead for flat-spec projects (NFR-1 verified at every consuming site). Next: `/akili-test` is not applicable (guidance-only, no executable code) — proceed to `/akili-validate` or `/akili-archive`.
