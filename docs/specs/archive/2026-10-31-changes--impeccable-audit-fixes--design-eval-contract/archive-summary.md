# Archive Summary: Close the design-evaluation gaps found in the 2.40.0 audit

**Outcome:** delivered. All 11 tasks closed with a Reviewer PASS. Tests pass 1315/1315. Validation is PASS with WARN (0 FAIL, 7 WARN, all accepted or fixed). The vendored Impeccable copy is untouched.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-contract` |
| Parent | `changes/impeccable-audit-fixes` (`family.md`, child 1) |
| Branch | `JuankCadavid/impeccable-audit-fixes` (spec branch; Integration Branch: `dev`) |
| Archived by | Claude Opus 5.5 under JC's mandate: take the recommended option at each gate; local commits only |

## 2. Original Spec Path

`docs/specs/changes/impeccable-audit-fixes/design-eval-contract/`

## 3. Archive Date

2026-10-31

## 4. Final Status

| Gate | Result |
|---|---|
| Tasks | 11/11 `[x]` (T1, T6, T7 and T11 on attempt 2; the rest on attempt 1). No HALT, no Pivot, no tripwire, no waiver |
| Tests | `npm test` 1315/1315 (`test-report.md`, PASS, 0 PRODUCT_BUG) |
| Validation | PASS with WARN: 0 FAIL, 7 WARN (`validation-report.md`) |
| Budget | 11 tasks against 11; 814 authored LOC against a ~900 ceiling (721 at execute plus the Tester file of 93); 16 review rounds against ~18 |

## 5. Requirements Delivered

| Requirement | Delivered in |
|---|---|
| FR-1 Engine isolation, one-call home change | Bridge *Step 0*, *Engine consent*, *Launcher form* |
| FR-2 Verified skill copy | Bridge *Step 0* Verify |
| FR-3 `WxH` viewports, short-height pair | Bridge *Detector gate*; `/akili-validate`; `/akili-constitution` Step 4 |
| FR-4 CTA order, measurement, outcomes, priority | Bridge *First-visit pass*; constitution `Primary CTA` column |
| FR-5 Consent banner must be seen | Bridge *First-visit pass* item 4 |
| FR-6 Priority mapping | Reference *Priorities* and the template note |
| FR-7 Report-only suppression, Assessment A isolation | Bridge *Suppressed in `/akili-audit design`*; reference E2b and E4 |
| FR-8 Bounded delegated return | Reference E4 |
| FR-9 `npm ci` with consent; run validity by JSON | Reference E3b |
| FR-10 Machine load | Reference E3b and the template |
| FR-11 Clause IDs, routed backfill | Constitution Step 4; reference E1; bridge *Design Waivers* |
| FR-12 Template coverage | Reference E2 and the template |
| FR-13 One report-location rule | `/akili-audit`, `/akili-propose`, reference checklist, docs |
| FR-14 Bounded `false positive` | Bridge *Design Waivers*; reference template |
| FR-15 Upstream request draft | `upstream-request.md` (not shipped, not filed) |
| FR-16 Restatements in step | Docs, CHANGELOG, and the retired-phrase sweep test |
| NFR-1 to NFR-5 | All PASS (`validation-report.md` §6) |

## 6. Files Changed Summary

| File | Change |
|---|---|
| `.claude/skills/impeccable-bridge/SKILL.md` | +50/−13: Step 0, Engine consent, Launcher form, Detector gate, Design Waivers, new *Suppressed* section |
| `.claude/skills/impeccable-bridge/references/design-evaluation.md` | +56/−20: E1, E2, E2b, E3b, E4, Priorities, template, checklist |
| `.claude/commands/akili-{audit,validate,constitution,propose}.md` | Pointer edits (5 lines) |
| `docs/skills/impeccable-bridge.md`, `docs/commands/akili-audit.md` | Restatements |
| `CHANGELOG.md` | `## [Unreleased]` notes (patch class) |
| `test/design-eval-contract.test.js` | New: 72 tests (71 clause assertions plus walker reach) |
| `test/design-eval-contract-coverage.test.js` | New: 10 tests (Tester coverage) |

## 7. Test Evidence Summary

The author suite has 72 tests, each written red→green with an executed mutation. The Tester added 10 tests for 9 clauses the author suite did not pin; none of the 9 was a text defect. FR-15 and `docs/skills/impeccable.md` were checked by hand. See `test-report.md`.

## 8. Validation Summary

An independent auditor ran on Opus. The walkthrough of the 16 FR scenarios reached their THEN/BUT literally, except FR-2, which reached it only on some hosts (W-2). It found three held-out-case findings and one cross-FR finding. P-16 evidence from akili.com.co `/es/` supports the CTA order (pending JC). W-6 (cross-document counts) and W-7 (CHANGELOG tense) were fixed before archive.

## 9. Accepted Warnings Or Follow-Ups

| ID | Follow-up | Route |
|---|---|---|
| W-1 | FR-4/FR-5 outcome precedence: a missing banner must replace only `pass`, never hide `below fold`. It amends FR-5 | New `/akili-propose` (do this one first) |
| W-2 | Hash-tool determinism for `SKILL.md`, which has no trailing newline | Same follow-up spec |
| W-4 | The download call under an exclusion must unset `IMPECCABLE_BIN` and drop excluded `PATH` entries | Same follow-up spec |
| W-3 | Outcome (c) checks only the bottom edge; an off-edge CTA reads `covered (none)` | Future spec |
| W-5 | P-16: JC confirms the CTA order on the rendered `/es/` page | JC |
| — | Sibling child `install-stale-skills` is still unspecified | `/akili-specify` |
| — | `upstream-request.md`: JC files it upstream | JC |
| — | Release (patch) and PRs into `dev` | JC (none in this cycle) |

## 10. Historical Notes

- Execute-time spec edits, each auto-approved under the mandate: `design.md` §7.1 rows 1 and 4 (T1); §7.3 *False positive* row, exit `2` (T3); §7.6 counts 68 → 71.
- T6–T9 shared one Implementer spawn, one Reviewer spawn with a verdict per task, and one commit.
- No `## Constitution Impact` block: the spec created no module.

## 11. Diagrams

None. The spec has no diagram slot and no `diagrams/` folder.
