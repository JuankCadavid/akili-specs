# Validation Report — Animated AKILI flow figure

> **Verdict: PASS with 3 WARN. Archive-ready once you accept the warnings.** All 4 tasks are `[x]` with Reviewer PASS evidence. The checks pass: `npm test` 1152/1152, `verify:cli`, `pack:dry-run` and `git diff --check`. Every FR and NFR clause has test or rendered evidence. Three stale figures were corrected here (one in the CHANGELOG, two in design §11/§12). The three warnings are the checks this environment could not run: Firefox (P-6), npmjs.com animation (P-7), and the live GitHub README after `master` updates. All three are yours to run after the merge and publish.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/flow-diagram-animated` |
| Date | 2026-10-27 |
| Validated at | `6437e42`, plus this phase's corrections (committed with this report) |
| Auditor model | `opus`. The Implementers were `sonnet`, so author ≠ auditor holds |
| Approval Mode | `pre-approved (Juan Carlos Cadavid, 2026-10-27)` |
| Inputs | `proposal.md`, `requirements.md`, `design.md`, `judgment.md`, `tasks.md`, `execution.md`, `test-report.md`. `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` and `docs/specs/general-setup/` do not exist in this repository |

## 2. Summary

| Area | Result |
|---|---|
| Task completion | PASS: 4/4 `[x]`, each with a Reviewer PASS and a non-author re-run |
| File existence | PASS: every design §3 path exists, and nothing outside it changed |
| Build integrity | PASS |
| Requirement coverage | PASS, with FR-1/FR-2 cross-engine reach WARN (Firefox) |
| Code quality | PASS, with 6 advisory notes |
| Design conformance | PASS. 3 stale figures corrected (R-1..R-3) |
| Proposal alignment | WARN: success criteria 1 (Firefox) and 6 (live GitHub/npm) are pending your checks |
| Constitution impact | PASS: none |

## 3. Task Completion

| Task | Status | Evidence |
|---|---|---|
| T1 generator, asset, test | PASS | `execution.md` T1: 3 attempts (Windows CRLF; missing ceiling, cycle and flash locks; a flash-lock hole). Reviewer PASS on attempt 3; re-run VERIFIED |
| T2 rendered evidence | PASS | 2 attempts (the CSS-less case had no real evidence). Reviewer PASS; re-run VERIFIED |
| T3 README and flow embeds | PASS | Attempt 1. Reviewer PASS; re-run VERIFIED |
| T4 CHANGELOG | PASS | 3 attempts (KZ-002 overstatements, one introduced by the Leader's brief). Reviewer PASS; re-run VERIFIED |

Budget: 4 tasks; LOC ~415 against an estimate of ~360 (tripwire ~500); 9 review rounds against an estimate of 7 (per-task tripwire "past 3": not crossed).

## 4. File Existence

| Design §3 path | Present | Change |
|---|---|---|
| `scripts/animate-flow.js` | yes | new, 124 lines |
| `assets/akili-flow-animated.svg` | yes | new, 134,905 B |
| `test/flow-figure-animated.test.js` | yes | new, 20 tests |
| `README.md` | yes | figure block only (+5/−1) |
| `docs/flow.md` | yes | line 7 only |
| `test/docs-overview-contract.test.js`, `test/docs-overview.test.js`, `test/flow-figure-contract.test.js`, `test/flow-figure.test.js` | yes | pins updated |
| `CHANGELOG.md` | yes | `[Unreleased]` only |
| Not in design §3, justified in `execution.md` | | `.gitattributes` (+10, T1 NFR-3 remediation); `test/flow-figure-animated-contract.test.js` (`/akili-test`, 12 tests) |

`git diff 4ff00a9 --stat -- bin package.json .claude assets/akili-flow.svg assets/akili-flow.png` → empty (NFR-1).

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | 1152 tests, 1152 pass, 0 fail |
| `npm run verify:cli` | exit 0 |
| `npm run pack:dry-run` | lists `assets/akili-flow-animated.svg` (134.9 kB), the static SVG and the PNG; no `animate-flow`; 341 files |
| `git diff --check` | clean |

There is no lint or type-check command in this repository. The project gate is the set above.

## 6. Requirement Coverage

The primary evidence is `test-report.md` §7 (a matrix at clause granularity), cross-checked against `requirements.md`.

| Requirement | Result | Note |
|---|---|---|
| FR-1 motion, order, three cycles, flash bound, nothing static moved | PASS / **WARN** | Static locks are A tests; motion is T2 rendered evidence in Chromium 149 and WebKit 26.5. WARN: Firefox has no evidence (P-6) |
| FR-2 motion off = static | PASS / **WARN** | 0 px with reduced motion (Chromium flag), with no CSS (rsvg and Chromium), and at rest. WARN: on npm and in Firefox, reduced motion relies only on the in-SVG rule, which is proven in Chromium only (accepted, R-2) |
| FR-3 content, identity, standalone, size, isolation, under labels | PASS | A tests |
| FR-4 README `<picture>` | PASS | DOC FR-4 and C. Click-through stays the PNG (approval Q-1) |
| FR-5 `docs/flow.md` | PASS | FF, FFC, C |
| FR-6 generator and staleness | PASS | A (staleness, idempotence, hook failure, CLI); C (built-ins only) |
| FR-7 CHANGELOG | PASS | C, plus the T4 Reviewer quote-check. The count was corrected 1140 → 1152 here and re-run (KZ-002) |
| NFR-1..NFR-5 | PASS | §4, §5, C. NFR-5 by review |

All negative constraints (`BUT`) and strict validations (`AND IT MUST`) are owned and evidenced: `test-report.md` §7. No `PRODUCT_BUG` was recorded.

## 7. Linting & Code Quality

There is no linter. Unresolved `ADVISORY` findings from `execution.md` are carried forward here. They are **advisory** and do not gate the verdict:

| # | Lens | Finding | Source |
|---|---|---|---|
| A-1 | Reliability | `parseKeyframes` in the T1 test throws a TypeError, rather than failing readably, on a keyframe stop without `opacity` | T1 attempt-3 Reviewer |
| A-2 | Reliability | `staticMinusUnusedKeyframes` in the test can loop forever on an unbalanced `{` (the generator bounds its own loop) | T1 attempt-1 Reviewer |
| A-3 | Reliability | `overlayStyle` slices from the last `<style>` to `</svg>`, so stray bytes after `</style>` would be hidden from the subsequence check | T1 attempt-1 Reviewer |
| A-4 | Readability | The trace-order test hardcodes `[0…6.3]` instead of reading `--step` | T1 attempt-1 Reviewer |
| A-5 | Risk | Editing either SVG on Windows with a CRLF editor would commit CRLF and turn the staleness test red. `-text` does not prevent that | T1 attempt-2 Reviewer |
| A-6 | Readability (visual) | The Bug Track pulse is brand green (`--arrow-emphasis`) over red dashed security edges. It conforms to design §7, but reads as a brief recolour of those edges | T2 tier-T6 review |

## 8. Design Conformance

| Check | Result |
|---|---|
| DD-1..DD-11 | PASS: overlay generated from the static figure; CSS only; hidden by attribute; `pathLength`; keyframes-only removal; README `<picture>`; Markdown flow line; staleness test; no spec path; overlay under the label layer; three cycles then rest |
| Design §7 timeline and rules | PASS: the T1 Reviewer checked every keyframe stop and `--d` value; T2 frames confirm order and rest |
| Premise Ledger | PASS. Execute-time settlement recorded (design §11): P-14 and P-11 confirmed (with P-11's proxy wording corrected); P-12's rsvg result marked vacuous and replaced by stripped renders; P-6 and P-7's npm-animation clause carried to you |
| Cross-document figure check | 3 stale figures, all corrected (R-1..R-3). Other figures agree: 134,905 B (CHANGELOG, `execution.md`, contract test); 153,600 B cap (requirements, design, test); 9 s × 3 (requirements, design, asset `:986`) |
| Proposal alignment | PASS for intent, scope and non-goals: no GIF, MP4 deferred, static assets unchanged, click-through PNG, patch release. Two documented changes: the proposal's `docs/flow.md` pointer sentence was dropped on purpose (DD-7, judgment F-12); the loop stops after 3 cycles (your decision at judgment, F-11). Success criterion 1 asked for Firefox, which could not run: WARN. Success criterion 6 is yours after merge and publish: WARN |

## 9. Test Evidence Summary

| Source | Evidence |
|---|---|
| Author tests (T1) | 20 tests in `test/flow-figure-animated.test.js`, each with executed mutation falsifiers |
| Updated pins (T3) | 4 files, falsifiers red |
| Contract suite (`/akili-test`) | 12 tests in `test/flow-figure-animated-contract.test.js`, all falsifiers red |
| Rendered (T2) | Chromium 149 and WebKit 26.5 frames; 0 px with motion off, with no CSS, and at rest; three cycles evidenced at 0.3, 9.3 and 18.3 s; montage reviewed at tier T6 |
| Live-path premises | P-11 GitHub confirmed (Platane/snk). P-7: npm keeps the SVG `<img>` via camo; `<picture>` is half kept |

## 10. Agent Guide / Constitution Impact

None. No `## Constitution Impact` block in `execution.md`. `scripts/animate-flow.js` is a helper script under the existing `scripts/` convention (`AGENTS.md` *Repository Purpose*), not a module. No guide sync is pending. A CodeGraph re-index is the routine archive step.

## 11. Remediation

| # | Finding | Action | Status |
|---|---|---|---|
| R-1 | CHANGELOG `[Unreleased]` said "1140 tests"; the suite has 1152 since `/akili-test` (KZ-002) | Corrected to 1152; `npm test` re-run 1152/1152; `test-report.md` updated | **Fixed** |
| R-2 | Design §11 Count line still showed 4 `UNVERIFIED` after T2 settled P-11 and P-14 | Line extended with the post-T2 count (12 settled, 2 `UNVERIFIED`, user-owned) | **Fixed** |
| R-3 | Design §12 R-2 said "affects `docs/flow.md` only; the README is covered by `<picture>`", which T2 refuted for npm | R-2 now names the npm README and limits the `<picture>` coverage to GitHub | **Fixed** |
| W-1 | Firefox: no evidence of animation or reduced motion (P-6) | **You:** open `docs/flow.md` on GitHub in Firefox after the merge, once with motion allowed and once with *Reduce motion* on in the OS | Accept |
| W-2 | npmjs.com: not checked whether the SVG animates through camo (P-7); there, reduced motion relies only on the in-SVG rule | **You:** after the 2.37.2 publish, open the npm package page and watch the figure (and once with reduced motion) | Accept |
| W-3 | This repository's live GitHub README | **You:** after `dev` → `master`, open the repository front page. The figure should animate three times, then rest | Accept |

## 12. Archive Readiness Recommendation

**Ready to archive** once you accept W-1..W-3, which are post-merge and post-publish checks this environment cannot run. There are no FAIL findings, the corrections are applied with their sweeps run, and the tests cover every requirement.

```text
/akili-archive changes/flow-diagram-animated
```
