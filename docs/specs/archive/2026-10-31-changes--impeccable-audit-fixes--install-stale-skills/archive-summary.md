# Archive Summary — install-stale-skills

**Outcome:** delivered. `akili install` now tells a stale or locally edited skill from a current one, and `akili doctor` warns on it, without writing anything unless `--force` is given. Validation: PASS with 3 accepted WARN.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/impeccable-audit-fixes/install-stale-skills` |
| Parent | `changes/impeccable-audit-fixes` (`family.md`, child 3 → `done`) |
| Archive Date | 2026-10-31 |
| Final Status | **Done** (validation PASS with WARN) |
| Branch | `JuankCadavid/impeccable-audit-fixes` (a spec branch; the apply-capable branch is `dev`). Local commits only |
| Release | Patch, recorded only (installer output gains labels; no new command or target) |

## 2. Requirements Delivered

| ID | What ships |
|---|---|
| FR-1 | `bin/install-compare.js`: byte-exact `identical` / `differs` per entry, package files only, ≤5 names then `+N more` |
| FR-2 | Skip lines `(identical)` / `(differs: <names>)`; `skipped N (identical I, differs D)`; replace hint only when D > 0 |
| FR-3 | Doctor `DIFFERS` at every location, all six targets; exit code and status unchanged; `--fix` never overwrites; foreign `impeccable/` not compared |
| FR-4 | `Home: <dir>` on a non-`--local` run whose printed roots lie under home |
| FR-5 | `docs/cli.md` (8 sites), `CHANGELOG.md` (reworded sentence + new bullet), coverage pin |

## 3. Files Changed Summary

| File | Change |
|---|---|
| `bin/install-compare.js` | New, 67 lines |
| `bin/akili.js` | +119 −25 (install T2, doctor T3) |
| `test/install-compare.test.js`, `test/install-stale-skills.test.js`, `test/install-stale-skills-gaps.test.js` | New: 14 + 22 + 4 tests |
| `docs/cli.md`, `CHANGELOG.md`, `test/design-eval-contract-coverage.test.js` | T4 |

Commits: `af95377` specify · `51fb519` escalation resolved · `1a593d4` provenance · `01318f9` T1 · `854b568` T2 · `3e6a6ff` T3 + tripwire · `09bcdc2` T4 · `0699780` test · `23743e5` validate · this archive commit.

## 4. Test Evidence Summary

`npm test` 1385/1385. One Tester (opus), 4 gap tests, 4 executed mutations, 0 `PRODUCT_BUG`. Accepted gap: FR-2 `update` path (no stub seam; the `--force` half is covered).

## 5. Validation Summary

PASS, 0 FAIL. WARN: W-1 FR-2 `update` untested (accepted); W-2 pre-existing `docs/cli.md:486` false for `update` (follow-up); W-3 budget 752 vs ~650 LOC (+16 %, tests), accepted on 2026-10-31 16:51 by a decision JC delegated to his assistant.

## 6. Accepted Warnings Or Follow-Ups

| Item | Route |
|---|---|
| W-2 `docs/cli.md:486` | Follow-up change |
| 4R advisories (hint "them" for one entry, §6 "outside" wording, mixed Antigravity note, broken-symlink check, unpinned doc sentences) | Recorded in `validation-report.md` §7 |
| `AGENTS.md` does not list `bin/install-compare.js` | `factual-sweep` pending item (kaizen entry) |

## 7. Historical Notes

- Judgment-day **ESCALATED** after two rounds; the open findings were in two specify-time refinements (hints that rebuild flags, the `Home:` rule). JC chose "Simplify both" (approved 14:23 UTC-5); no third round.
- Provenance correction: an earlier record attributed a decision to JC before JC approved it; corrected in new commits (`a9793af`, `1a593d4`), no history rewritten.
- Budget tripwire fired after T3 (696 vs ~650); the run stopped and resumed on the 16:51 decision.

## 8. Diagrams

None.
