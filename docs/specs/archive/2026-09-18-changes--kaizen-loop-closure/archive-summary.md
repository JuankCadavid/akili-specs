# Archive Summary — Kaizen Loop Closure

**Outcome:** shipped. The kaizen apply phase now runs on one project-chosen apply-capable branch (an optional `Integration Branch:` pin, exclusive with the default branch), re-verifies every pending item before writing it (`superseded`), and closes Methodology lessons through an upstream report (`upstreamed`). 7/7 tasks PASS; closing-gate walkthrough 0 INCONCLUSIVE; packaging green.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/kaizen-loop-closure` |
| Archive Date | 2026-09-18 |
| Depth / Type | Standard / Change |
| Approval Mode | `pre-approved (user, 2026-09-17)` |
| Final Status | **Executed — 7/7 PASS**; `/akili-test` and `/akili-validate` not run (absence accepted, see §7) |
| Release Classification | proposed **minor** (CHANGELOG Unreleased); user decides at release |
| Predecessor | `changes/branch-safe-kaizen` (archived 2026-08-22) — extended, not reversed |

## 2. Requirements Delivered

| ID | Requirement | Delivered by |
|---|---|---|
| FR-1 | `Integration Branch:` pin (question, confirmed, one name, name elicited, Safe Update rewrites the adjacent sentence) | T4, T7 |
| FR-2 | Three-context Branch Context; exclusive apply-capable predicate; default-while-pinned non-writing at every site | T1, T2, T7 |
| FR-3 | Apply Mode / archive gates / resume on the apply-capable branch; digest bootstrap + normalize | T1, T2, T3 |
| FR-4 | Re-verify probe, `superseded`, unparseable branch, `digest-update` resolution | T1, T7 |
| FR-5 | `Kind: upstream`, upstream report, `upstreamed` | T1, T2 |
| FR-6 | `Kind`/`Status` vocabulary extended once; every counting site enumerates | T1, T2, T3 |
| FR-7 | Backward compatibility (no pin → v2.24.0 behavior; neither pin → fallback) | T1, T3, T6 |
| FR-8 | Documentation coherence sweep (61-hit closure set) | T4, T5, T6 |
| NFR-1..7 | Consumer read cost, compatibility, tool-agnostic, never-block, bounded, single writer, accepted residual | T1–T6 |

## 3. Files Changed Summary (from `execution.md`; 16 files, 144+/85−, 8 commits `[SPEC:changes/kaizen-loop-closure]`)

| Area | Files |
|---|---|
| Skill | `.claude/skills/kaizen/SKILL.md` |
| Commands | `.claude/commands/akili-archive.md`, `akili-resume.md`, `akili-constitution.md` |
| Personas | `.claude/templates/leader.md`, `implementer.md` (one guardrail phrase each) |
| Mirrors | `docs/commands/akili-archive.md`, `akili-resume.md`, `akili-constitution.md`; `docs/skills/kaizen.md`, `docs/skills/README.md` |
| Root docs | `AGENTS.md`, `README.md`, `docs/README.md`, `docs/flow.md` |
| Release | `CHANGELOG.md` (Unreleased: Added ×3, Changed ×4, Notes) |
| Untouched by design | `/akili-propose`, `/akili-specify`, `/akili-execute` and their mirrors (NFR-1); `CLAUDE.md` (no Kaizen Loop bullet in this repo) |

## 4. Test Evidence Summary

No automated test suite exists for command/skill prose; `/akili-test` was not run (accepted). Behavioral evidence is the **T6 fixture walkthrough** (`t6-walkthrough.md` in this folder): a throwaway repo with both pins, branches `master` / `qa-development-2026` / `feat/x`, and three entry-file generations, walked as a literal reader of the shipped text — 11 sub-steps, attempt 1: 8 PASS / 3 INCONCLUSIVE (→ Pivot → T7), attempt 2: **11 PASS**. Packaging: `npm run verify:cli` 0, `npm run pack:dry-run` 0 (275 files), `git diff --check` 0.

## 5. Validation Summary

`/akili-validate` not run (accepted — prose-only change; the predecessor spec archived the same way). Substitutes: 11 Reviewer verdicts (`opus`, author ≠ auditor by model), the two closure greps (FR-8 phrase grep 0; union-semantics grep 0 outside the spec folder), and the Reviewer's independent re-walk of the T6 record.

## 6. Execution Facts

| Signal | Value |
|---|---|
| Reviewer FAIL rework attempts | 4 (T1 ×2, T3 ×1, T5 ×1) |
| HALTs / FATAL_FAILs | 0 / 0 |
| Pivots | 1 (T6 → T7: three walkthrough closures; FR-1/FR-2/FR-4 amended; DD-11) |
| Budget tripwire | 1 (T1, second FAIL) — user chose to proceed |
| Leader pre-review catches | 3 (brief conformance; no Reviewer round consumed) |
| Judgment-day | not run (user chose Continue at Phase 2); Step 2.3 reversion challenge ran and overturned the proposal's union rule pre-design |
| Budget vs actual | tasks 6 → 7 (Pivot); LOC ~236 est. vs ~144+/85− shipped; review rounds 1/task budgeted, exceeded by one on T1, T3, T5 |

## 7. Accepted Warnings Or Follow-Ups

| Item | Disposition |
|---|---|
| `/akili-test`, `/akili-validate` not run | Accepted by the user (invoked `/akili-archive` after being told neither ran); walkthrough + Reviewer chain as substitute |
| `docs/flow.md` artifact table has no row for `docs/specs/kaizen/upstream-<date>[-N].md` | Follow-up: `/akili-quick` candidate (one table row) |
| Apply Mode step 5: no sentence creates a digest row for a `digest-update` whose ID predates the digest (bootstrap case) | Follow-up: one clause in step 5; noted in the kaizen entry |
| `.claude/commands/akili-archive.md` Step 6 item 6 still says "on a spec branch" (reporting side) | Cosmetic; `/akili-quick` candidate |
| Globally installed copies under `~/.claude/` lag this repo until reinstall/release | Expected; `npm run release:*` then reinstall |
| Tier-2 corpus findings (gates, briefs, HITL, metrics comparability) | Deliberately out of scope; next specs |

## 8. Historical Notes

- Origin: a 105-entry kaizen corpus in a consuming project showed 193 pending items, 0 applied, no digest — Apply Mode was unreachable because work lived on a long-lived integration branch that never reached the pinned default branch.
- The proposal's Option B ("apply-capable = default ∪ integration") was overturned at `/akili-specify` Step 2.3 by a reversion challenge: two writer branches reintroduce the textual-merge conflict class the predecessor removed. The exclusive rule ("integration when pinned, else default — never both") is DD-2.
- Three of four FAILs and all three INCONCLUSIVEs shared one root cause: the design named the steps to add but did not walk existing consumer steps against the new enumerated values — recorded as DD-11 and as the retrospective's first lesson.
