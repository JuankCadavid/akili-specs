# Test Report — design-skill-routing

**Overall: PASS.** `npm test` → **1403 pass, 0 fail** (baseline 1385 + 9 author contract tests from T9 + 9 Tester coverage tests). Every functional requirement has automated text-contract evidence; one defect class (agents actually following the routing) has no automated check and is covered by the T10 walkthrough, with five mismatches carried to the `/akili-validate` HITL pause.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/design-skill-routing` |
| Date | 2026-11-01 |
| Commit under test | `a6b5b5f` + uncommitted `test/design-skill-routing-coverage.test.js` |
| Approval Mode | `pre-approved (JC, 2026-11-01 10:04 UTC-5, via Grok Bot)` |
| Leader | `opus` (writes no tests) |
| Tester | 1 spawned, `opus` — distinct from the Implementer model `sonnet` (author ≠ tester); persona `.agents/tester.md` (local copy, see `execution.md` Document Control) |

## 2. Summary

| Item | Value |
|---|---|
| Suites planned / run | 1 / 1 — integration (text-contract, `node:test`). No backend, frontend-unit or E2E surface: the deliverable is methodology text |
| Testers | 1, not parallel (one suite); none inline |
| Author TDD coverage cited, not rewritten | `test/design-skill-routing.test.js` (T9, 9 tests): held once, skill set, one lead per cell, card evidence, no line pointers, stale-phrase sweep, wiring, governance, execute boundary |
| New tests | `test/design-skill-routing-coverage.test.js` (193 lines, 9 tests) — FR-2, FR-5, FR-7, FR-8 (`missing`), FR-10 (amended), FR-11, FR-14, NFR-5 |
| Inner loop | 1 retry, two test defects (indented-table header lookup; Step 8C heading collision fixed by anchoring after item 4) |
| Product bugs | **0** |
| Design-detector suite | Not applicable — no UI in this repository (UX Testing Guidance) |
| Leader re-run | `node --test test/design-skill-routing-coverage.test.js` 9/0; `npm test` 1403/0; `npm run verify:cli` → "14 commands \| 31 skills \| 8 resources"; `npm run pack:dry-run` lists `.claude/skills/impeccable-bridge/references/design-routing.md` (12.3 kB), 409 files; `git diff --check` clean; `node bin/akili.js install --tool all --dry-run` runs (98 existing local entries differ — the developer's global installs, expected) |

## 3. Backend Unit Tests

Not applicable — no runtime code changed.

## 4. Frontend Unit Tests

Not applicable — no UI.

## 5. Integration Tests (text contract)

| File | Tests | Result |
|---|---|---|
| `test/design-skill-routing.test.js` (author, T9) | 9 | 9 pass |
| `test/design-skill-routing-coverage.test.js` (Tester) | 9 | 9 pass |
| `test/impeccable-bridge.test.js` (updated in T2) | 10 | 10 pass |
| `test/install-cursor.test.js` (count updated in T2, E-1) | 12 | 12 pass |
| Full suite `npm test` | 1403 | 1403 pass |

**Executed falsifier reds (Tester, each restored):** FR-2 rung renumbered → `ladder order` diff; rung 4 rewritten → `'ENV-1 only when nothing earlier matched'`; "never evidence" negated → `'BUT: no ENV-1 on missing DESIGN.md alone'`. FR-5 light fixes tokens → `'BUT light fixes no tokens'`. FR-7 → `'native: no gsap'`, `'Step 2.1 gates gsap…'`, `'gsap skill states the same gate'`. FR-10 → `'block gated on a user interface'`, `'Safe Update preserves the block'`, `'missing: mockup route ('`. FR-11 → `'missing: polish <full|light>'`, `'BUT: ui-ux-pro-max only for catalog options'`. FR-14 → `'ui-ux-pro-max names the matrix'`, `'frontend-design leads only at ENV-0'`, `'**refine**: frontend-design leads nowhere outside ENV-0'`. FR-8 → `'propose missing order…'`. NFR-5 → `'both invocation forms'`. Author falsifiers (a)–(g) and the attempt-2 reds are in `execution.md` → T9.

## 6. E2E Tests

Not applicable. The behavioral substitute is the T10 held-out walkthrough (`execution.md` → T10).

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test type | Test | Result | Notes |
|---|---|---|---|---|---|
| FR-1 | Every skill placed; one lead per cell; ENV-0 lead + support | contract | author: skill set, one lead | PASS | |
| FR-1 | Held once (rows + cards) | contract | author: held once | PASS | |
| FR-2 | Established DS → ENV-2 + evidence; BUT not ENV-1 on missing DESIGN.md | contract | coverage: FR-2 Established | PASS | |
| FR-2 | Precedence ENV-0 / ENV-3 / per screen | contract | coverage: FR-2 Precedence | PASS | |
| FR-3 | Card evidence resolves; BUT no line numbers | contract | author: card evidence, no pointers | PASS | |
| FR-4 | Named playbook; evidence via completion report; only named references | contract | author: execute boundary, wiring | PASS | Agent behavior: T10 |
| FR-4 | Direction settled; code-led; design.md else Pivot | contract | author: execute boundary | PASS | |
| FR-4 | ENV-0 gap; never stops | contract | coverage: FR-14 (ENV-0 lead) | PASS | "never stops" is prose, not machine-checkable |
| FR-5 | Light / full; BUT no redesign; AKILI scope limit | contract | coverage: FR-5 | PASS | |
| FR-6 | Finish review not run; BUT no inline pass | contract | author: execute boundary | PASS | |
| FR-7 | No-GSAP project; native → no gsap | contract | coverage: FR-7 | PASS | |
| FR-8 | Picker first; Stitch on request; BUT no Stitch unless asked | contract | author: wiring (order) | PASS | |
| FR-8 | `missing` → Stitch → Claude Design → HTML | contract | coverage: FR-8 | PASS | |
| FR-9 | No stack-skill load-direction | contract | author: governance | PASS | |
| FR-10 (amended) | UI projects only; six fields; no rows; Safe Update | contract | coverage: FR-10 | PASS | Advisory: no explicit "no-UI → no block, not ENV-1" sentence; locked by the gate |
| FR-11 | Route-line form; Scope + Done evidence; `ui-ux-pro-max` catalog only | contract | coverage: FR-11 | PASS | |
| FR-12 | seo through the bridge | contract | author: wiring | PASS | |
| FR-13 | AGENTS.md set = cards; no surviving old phrasing | contract | author: skill set, sweep | PASS | |
| FR-14 | Adapted skills point at the matrix | contract | coverage: FR-14 | PASS | |
| NFR-1 | Held once; no line pointers | contract | author | PASS | |
| NFR-2 | Vendored untouched | contract | `test/impeccable-vendor.test.js` | PASS | |
| NFR-3 | Governance | contract | author: governance | PASS | |
| NFR-4 | Token economy | — | — | GAP | Prose obligation; T10 + validate |
| NFR-5 | Host-neutral invocation; ships to six targets | contract + pack | coverage: NFR-5; `pack:dry-run` | PASS | |
| NFR-6 | Persona example lines only | contract | author: sweep + wiring; `persona-digests`, `agents-doctor` | PASS | |
| NFR-7 | Consent unchanged | — | — | GAP | Bridge consent text untouched (diff); no new test |

## 8. Remediation

None required — no failures and no product bugs.

## 9. Accepted Gaps

| Gap | Why not automated | Substitute |
|---|---|---|
| Agents follow the routing in practice (requirements §8) | A text test cannot observe agent behavior | T10 walkthrough: ENV, mockup and gsap calls matched on all three profiles; mismatches **M-1 – M-5** (row definitions, `onboard` at ENV-3, page-mode pointer, platform-motion enum value, one over-specified expected cell) go to JC at the `/akili-validate` HITL pause |
| NFR-4 token economy, NFR-7 consent | Prose obligations with no measurable signal in this repository | Diff review (no consent text changed); validate |
| FR-10 explicit no-UI sentence | Advisory only — the gate is locked by test | Recorded for JC |
