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
