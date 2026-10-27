# Archive Summary: animated AKILI flow figure

> **Delivered.** The README and `docs/flow.md` show an animated twin of the 2.37.1 flow figure: CSS only, three 9 s cycles, then rest; static under reduced motion. The static SVG and PNG are unchanged. 4/4 tasks PASS, 1153/1153 tests, validation PASS with 3 warnings that the user accepted. Release: patch 2.37.2, the user's to prepare.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/flow-diagram-animated` |
| Archive Date | 2026-10-27 |
| Archive Path | `docs/specs/archive/2026-10-27-changes--flow-diagram-animated/` |
| Branch | `JuankCadavid/flow-diagram-animated` (Branch Context: **spec**; `Integration Branch: dev` is pinned). Local commits only |
| Approval Mode | `pre-approved (Juan Carlos Cadavid, 2026-10-27)` |

## 2. Original Spec Path

`docs/specs/changes/flow-diagram-animated/`

## 3. Archive Date

2026-10-27

## 4. Final Status

**PASS**. Every task is `[x]` with a Reviewer PASS. Validation found 0 FAIL and 3 WARN; the user accepted the warnings on 2026-10-27 at 10:33.

## 5. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | The highlight walks e1–e8 in step order, with Kaizen last. The Bug Track pulses once per cycle in its own red (a post-validation user decision). Three cycles, then rest |
| FR-2 | With motion off, the figure renders the static pixels: reduced motion, no CSS, and at rest all measure 0 px. The README uses `<picture>` |
| FR-3 | The static content is kept byte for byte. The asset is standalone, 134,935 B, with the overlay isolated beneath the labels |
| FR-4 | README `<picture>`: the PNG for reduced motion, the animated SVG otherwise. The click-through is still the PNG |
| FR-5 | `docs/flow.md` embeds the animated SVG; the alt text equals both `<desc>` elements |
| FR-6 | `scripts/animate-flow.js` (Node built-ins only), with staleness and hook-failure tests |
| FR-7 | CHANGELOG `[Unreleased]` notes, quote-checked, with counts re-run |
| NFR-1..5 | No change to `bin/`, `package.json`, `.claude/` or the static assets. The generator is not packaged. `npm test`, `verify:cli` and `--check` pass. No spec-path citations. English |

## 6. Files Changed Summary

`git diff --stat 4ff00a9 HEAD -- . ':!docs/specs'` → 12 files, +1575/−10.

| File | Change |
|---|---|
| `assets/akili-flow-animated.svg` | new (generated) |
| `scripts/animate-flow.js` | new, 124 lines |
| `test/flow-figure-animated.test.js` | new, 21 tests |
| `test/flow-figure-animated-contract.test.js` | new, 12 tests (`/akili-test`) |
| `README.md`, `docs/flow.md` | figure block; line 7 |
| 4 existing test files | pins updated |
| `.gitattributes` | both SVGs `-text` (Windows byte-exactness) |
| `CHANGELOG.md` | `[Unreleased]` |

## 7. Test Evidence Summary

The suite went from 1120 to 1153 tests, all passing. The figure's motion has no browser in CI, so it was evidenced by renders in Chromium 149 and WebKit 26.5 (T2): frames per slot, 0 px with motion off, no CSS and at rest, and three cycles. See `test-report.md`.

## 8. Validation Summary

PASS, with 3 WARN. Three stale figures were corrected during validation: the CHANGELOG count, and the design §11 count and §12 R-2. A post-validation amendment made the Bug Track pulse red (`validation-report.md` §13). It was locked by a test that went red first and was verified by rendering. It was applied by the Leader on the user's instruction, with no separate Reviewer spawn, and that is recorded in `execution.md`.

## 9. Accepted Warnings Or Follow-Ups

| # | Item | Owner |
|---|---|---|
| W-1 | Firefox: animation and reduced motion are unverified (headless Firefox hung at launch) | User, after the merge |
| W-2 | npmjs.com: it is not checked whether the figure animates; npm drops `<picture>` switching, so only the in-SVG rule applies there | User, after the 2.37.2 publish |
| W-3 | The live GitHub README of this repository | User, after `dev` → `master` |
| F-1 | MP4 social asset, outside the npm package (proposal Q-2) | Separate `/akili-marketing` follow-up |
| F-2 | Release patch 2.37.2: push, PR into `dev`, `npm run release:patch`, publish | User |
| F-3 | Advisory notes A-1..A-5 (test robustness, Windows CRLF editor risk) | Optional future quick fixes; `validation-report.md` §7 |

## 10. Historical Notes

- Judgment-day caught the design's dependence on overlay mechanisms that no probe had tested (F-1). The architect's spike settled them before any task ran. The same review moved the overlay beneath the label layer (F-2) and led the user to cap the loop at three cycles (WCAG 2.2.2).
- T2 found that npm moves the `<img>` out of `<picture>`. That was not a Pivot: the case was anticipated in the approved proposal (R-2).
- The Chrome extension was not connected, so the live-path premises were settled with headless Playwright.

## 11. Diagrams

The spec has no `diagrams/` folder. Its only diagram is the inline Mermaid in `design.md` §2, archived with it. No baseline diagram slot went stale: the repository has no PRD, UX/UI or TRD baseline documents. The lifecycle figure's layout did not change.
