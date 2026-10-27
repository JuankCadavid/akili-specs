# Test Report: `changes/flow-diagram-animated`

> **Post-validation amendment (2026-10-27):** one test was added (Bug Track pulse colour), so the suite is now **1153/1153**. See `validation-report.md` §13.
>
> **Status: PASS.** `npm test` → **1152 tests, 1152 pass, 0 fail**: the 1120 baseline, plus 20 author tests from T1, plus 12 requirement-contract tests from this phase. Every FR and NFR clause has test evidence, rendered evidence from T2, or a named accepted gap. No product bug was found. **One owed item, since resolved:** the CHANGELOG said "1140 tests"; `/akili-validate` corrected it to 1152 and re-ran `npm test` (1152/1152) (KZ-002).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/flow-diagram-animated` |
| Date | 2026-10-27 |
| Commit under test | `4df9696` (all four tasks `[x]`) |
| Approval Mode | `pre-approved (Juan Carlos Cadavid, 2026-10-27)` |
| Leader | `opus` |
| Tester | `opus`, one spawn. The Implementers were `sonnet` in every task, so author ≠ tester holds |
| Command | `npm test` (`node --test`, Node 22.12.0 locally; CI runs Node 18 and 22 on Linux, macOS and Windows) |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 1: a requirement-contract integration suite (Node `node:test`) |
| Testers | 1, `opus`, not parallel (a single suite), effort `medium`, skills `tdd` |
| Inline suites | none |
| New tests this phase | 12, in `test/flow-figure-animated-contract.test.js` (11 clause locks, plus 1 in-test falsifier) |
| Author tests cited, not rewritten | `test/flow-figure-animated.test.js` (T1, 20 tests); the T3 pins in `test/docs-overview-contract.test.js`, `test/docs-overview.test.js`, `test/flow-figure-contract.test.js` and `test/flow-figure.test.js` |
| Rendered evidence cited | `execution.md` T2: Chromium 149 and WebKit 26.5 frames; 0 px with motion off and at rest; montage reviewed at tier T6 |
| Result | **PASS**: 1152/1152. Tester inner loop: 1 test defect fixed (the FR-4 falsifier anchor matched an earlier `</p>`); 0 product bugs |
| Leader re-run | `node --test test/flow-figure-animated-contract.test.js` → 12/12; `npm test` → 1152/1152, no `not ok` |

Backend unit, frontend unit and E2E suites do not apply: the spec ships an SVG asset, a Node script, docs and tests, with no UI runtime and no server.

## 3. Backend Unit Tests

`n/a`: there is no backend. The generator's unit behaviour (a pure string-to-string transform, plus its hook-failure throw) is covered by the T1 author tests (§7).

## 4. Frontend Unit Tests

`n/a`: there is no frontend runtime. The SVG's motion is evidenced by rendering (§6).

## 5. Integration Tests: requirement-contract suite

| Test (FR or NFR clause) | Falsifier, run on a temp copy (red output verbatim) |
|---|---|
| FR-4 AND IT MUST NOT: exactly one figure block, the exact tag sequence, and only the two `master` raw URLs | extra `<img>` after the block → `'HTML outside the figure block: <img src="x.gif">'` |
| FR-5 BUT: one figure line, at line 7; no static-SVG embed left | second figure line → `[ 7, +   9 ]` |
| FR-6 AND IT MUST: generator requires Node built-ins only | `require("sharp")` → `'sharp'` |
| FR-7 THEN: `[Unreleased]` (or the dated 2.37.2 section) names the figure, generator, staleness test, `<picture>`, `docs/flow.md`, the test changes and `Release class: patch`; no placeholder | generator name dropped → `notes lack \`scripts/animate-flow.js\`` |
| FR-7 AND: static SVG and PNG stated unchanged; `master` and 2.37.2 named | "unchanged" → "refreshed" → `The input did not match the regular expression /static \`assets\/akili-flow\.svg\` and \`assets\/akili-flow\.png\` are unchanged/.` |
| FR-7 AND IT MUST: the stated byte size equals the asset's size (real-artifact lock) | 134905 → 134000 → `134000 !== 134905` |
| FR-7 BUT: no released section edited | a line moved into `[2.37.1]` → `'## [2.37.1] - 2026-10-26'` |
| NFR-1: no video, GIF or Archify file in `assets/` | `touch assets/akili-flow.gif` → `'akili-flow.gif'` |
| NFR-2: `files` ships `assets`, never the generator | `files += scripts/animate-flow.js` → `true !== false` |
| NFR-3: `.gitattributes` keeps both SVGs `-text` | `-text` → `text` → `'assets/akili-flow-animated.svg lacks -text'` |
| NFR-4: no shipped file or test cites the spec folder path | spec path added to a generator comment → `'scripts/animate-flow.js'` |

Dropped as already covered: the exact `<source media>` value (`test/docs-overview-contract.test.js:156`).

## 6. E2E Tests: rendered evidence

There is no browser in CI, so these clauses are covered by T2's harness. Its numbers are quoted in `execution.md` under T2.

| Evidence | Result |
|---|---|
| Motion on: each edge's box differs from the static render at its mid-slot (Chromium and WebKit) | e1–e8 all non-zero. s1/s2 pulse visible at 7.9 s. Label strips 0 |
| Motion off: Chromium `--force-prefers-reduced-motion` | AE 0 (no fuzz) |
| No CSS: `<style>` stripped, rsvg and Chromium | AE 0. Falsifier 12968/12960. Control (red fill, `opacity="0"` kept) 0 |
| Three cycles, then rest | e1 box 276 / 268 / 275 at 0.3 / 9.3 / 18.3 s; 0 at 27.3, 28.3 and 30 s |
| Tier-T6 montage review (Leader and Reviewer) | Order and pace as in design §7; no text struck through; Anytime lane still |

## 7. Coverage & Traceability

Key: A = `test/flow-figure-animated.test.js` (T1). C = `test/flow-figure-animated-contract.test.js` (this phase). DOC = `test/docs-overview-contract.test.js`. FF = `test/flow-figure.test.js`. FFC = `test/flow-figure-contract.test.js`. T2 = rendered evidence in `execution.md`.

| Requirement | Scenario clause | Test type | File or evidence | Result | Gap or notes |
|---|---|---|---|---|---|
| FR-1 | THEN frames differ (motion) | rendered | T2 | PASS | Not automatable in CI |
| FR-1 | AND e1–e8 once each, `--step` order, e8 last | static + rendered | A (order), T2 | PASS | |
| FR-1 | AND Bug Track pulses once, fainter | static + rendered | A (start after e8, ceilings), T2 | PASS | |
| FR-1 | AND 8–10 s, ×3, then rest | static + rendered | A (cycle, iterations, fill-mode), T2 | PASS | |
| FR-1 | BUT no Anytime motion; nothing static moved or recoloured; no text hidden | static + rendered | A (no Anytime overlay, subsequence, under labels), T2 | PASS | Chromium anti-aliasing on Anytime borders during motion is a ruled artefact (T2) |
| FR-1 | AND IT MUST ≤ 3 flashes/s | static | A (flash bound, plus in-test mutations) | PASS | |
| FR-2 | THEN 0 px with motion off | rendered | T2 | PASS | Firefox: accepted gap (P-6) |
| FR-2 | AND hidden by attribute | static + rendered | A, T2 (stripped render and control) | PASS | |
| FR-2 | AND in-SVG reduced-motion rule | static | A | PASS | |
| FR-2 | BUT README uses `<picture>` | static | DOC FR-4 | PASS | npm moves the `<img>` out of `<picture>`, so only the in-SVG rule applies there (T2, P-7) |
| FR-3 | every clause | static | A | PASS | |
| FR-4 | THEN, AND (shape, URLs, `width`) | static | DOC FR-4, C | PASS | |
| FR-4 | AND alt unchanged | static | FFC FR-4, DOC FR-4 | PASS | |
| FR-4 | BUT `href` stays PNG | static | DOC FR-4 | PASS | |
| FR-4 | AND IT MUST NOT add another README line | static (structural) | C | PASS | The "no line elsewhere" diff claim: accepted gap (§9) |
| FR-5 | THEN, AND (target, alt equals `<desc>` of both) | static | FF, FFC, C | PASS | |
| FR-5 | BUT no other line changed | static (structural) | C | PASS | Diff claim: accepted gap (§9) |
| FR-6 | every clause | static | A (staleness, hook failure, CLI), C (built-ins) | PASS | |
| FR-7 | THEN, AND, BUT | static | C | PASS | Falls back to the dated 2.37.2 section after release |
| FR-7 | AND IT MUST quote-check; counts and sizes re-run | static + manual | C (size lock); count re-run at validation | PASS | The count was stale (1140); corrected to 1152 at validation (§8 R-1) |
| NFR-1 | no change to `bin/`, `package.json`, `.claude/` or the static assets | manual + static | `git diff --stat 88d4b67^ HEAD`, C (no GIF, MP4 or Archify) | PASS | Diff claim is manual |
| NFR-2 | pack lists the SVG, not the generator | static + manual | C, `npm pack --dry-run` | PASS | |
| NFR-3 | `npm test`; Windows byte-exactness | run + static | 1152/1152, C | PASS | `verify:cli` and `git diff --check` are re-run at validation |
| NFR-4 | no spec-path citation | static | C | PASS | |
| NFR-5 | English, `cognitive-doc-design` | review | T3 and T4 Reviewers | PASS (review) | Not automatable |

## 8. Remediation

| # | Item | Owner |
|---|---|---|
| R-1 | Change the CHANGELOG `[Unreleased]` Tests note from "1140 tests" to the count at validation (1152 now), then re-run `npm test` (KZ-002) | `/akili-validate`. **Done 2026-10-27:** CHANGELOG reads 1152; `npm test` 1152/1152 |

No product bug was found.

## 9. Accepted Gaps

| Gap | Why it is not automated | Where it is covered instead |
|---|---|---|
| Motion, order and the 0 px motion-off rule in a real browser | No browser in `npm test` or CI | T2 rendered evidence (Chromium 149, WebKit 26.5) |
| Firefox (P-6) | Headless Firefox hung at launch three times | The user's Firefox with reduced motion, at validation |
| npmjs.com animation (P-7, the "still animates" clause) | Cloudflare blocks headless access, and the page shows only after a publish | The user, after the 2.37.2 publish |
| Live GitHub README of this repository | The animation appears only after `master` updates | The user, after the merge; P-11 is settled for the same URL pattern |
| "No other README line" and "no other `docs/flow.md` line" diff claims | Tests do not read git history | `git diff` at the T3 review: README +5/−1 inside the block, `docs/flow.md` 1 line |
