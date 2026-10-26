# Archive Summary: `changes/flow-diagram-review`

**Outcome: delivered and validated (PASS).** The lifecycle figure (`assets/akili-flow.svg`, `assets/akili-flow.png`) now draws all 14 commands. `/akili-review` is stacked under `/akili-security`, carries a "local or CI" cue and shares the Bug Track hand-off; `/akili-marketing` is in the Anytime lane. The `docs/flow.md` and README alt texts describe the new figure. The 2.37.0 "figure not updated" debt bullet is gone from the CHANGELOG and the release notes. Two new test files pin the figure to the command set. Target release: patch 2.37.1.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `docs/specs/changes/flow-diagram-review/` |
| Archive Path | `docs/specs/archive/2026-10-26-changes--flow-diagram-review/` |
| Archive Date | 2026-10-26 |
| Branch | `JuankCadavid/flow-diagram-review` (off `dev` at `3f718cb`; local commits only, not pushed) |
| Type / Depth | Change / Lite |
| Approval Mode | `pre-approved (Juan Carlos Cadavid, 2026-10-26)` |
| Final Status | **PASS**: 3/3 tasks `[x]`; validation 0 FAIL, 2 WARN accepted |

## 2. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | All 14 commands plus Kaizen drawn; three lanes; review beside security (same column, same red style, "PR review · local or CI"); both dashed Bug Track edges; marketing "social drafts · never publishes"; font floor 5.89 / labels 8.92 at 900 px; light-only, standalone |
| FR-2 | SVG and PNG from one Archify session; PNG 1800×1397, 300,763 B; SVG 144,816 B |
| FR-3 | `docs/flow.md:7` alt text (equal to the SVG `<desc>`) and the second sentence of `:21` name both Bug Track sources |
| FR-4 | README alt text: "seven commands run any time, among them a security audit and a pull-request review that can also run in CI"; line count unchanged |
| FR-5 | Debt bullet removed from `CHANGELOG.md` `[2.37.0]` and `releases/v2.37.0.md`; `[Unreleased]` patch note added; `[2.36.0]` untouched |
| FR-6 | `test/flow-figure.test.js` (3 tests); FR-14 re-pinned to `[2.37.0]`; whole suite passes |
| NFR-1..3 | No `bin/`, `package.json` or `.claude/` change; English; `verify:cli`, `pack:dry-run` and `git diff --check` pass |

## 3. Files Changed

| File | Change | Commit |
|---|---|---|
| `assets/akili-flow.svg`, `assets/akili-flow.png` | Regenerated with Archify (scratchpad only, not shipped) | `5f8de65` (T1) |
| `docs/flow.md` (lines 7, 21), `README.md` (alt) | Alt texts and the Bug Track sentence | `e54be25` (T2) |
| `test/flow-figure.test.js` | New: figure coverage, `<desc>` = alt, standalone and identity | `e54be25` (T2) |
| `CHANGELOG.md`, `releases/v2.37.0.md`, `test/akili-review-contract-coverage.test.js` | `[Unreleased]` note, debt removal, FR-14 pin | `9bde8d2` (T3) |
| `test/flow-figure-contract.test.js` | New: 9 contract tests for clauses the task tests did not prove | `9a62d3f` (`/akili-test`) |
| `CHANGELOG.md` | Suite count 1111 → 1120, and the new test file named | `ac453d9` (`/akili-validate`) |

## 4. Test Evidence

| Item | Result |
|---|---|
| Suite | `npm test` → 1120/1120, over several clean runs |
| Mutations | 6 mutations each turned their targeted test red (`test-report.md` §7) |
| Visual | T6 reviews by the Leader and the T1 Reviewer, plus a final look at `/akili-validate` |
| Report | `test-report.md`: PASS, 0 `PRODUCT_BUG` |

## 5. Validation Summary

`validation-report.md`: **PASS**.
- **Corrected during validation (R-1):** the CHANGELOG suite count was stale.
- **W-1, accepted:** the proposal sketch differs from the amended DD-2.
- **W-2, accepted:** one unidentified `npm test` failure during T3 that did not reproduce.

## 6. Accepted Warnings and Follow-Ups

| Item | Owner |
|---|---|
| W-2: watch the Linux and Windows CI legs on the PR for the unreproduced failure | User, at PR time |
| The published GitHub Release v2.37.0 body still carries the removed debt bullet (proposal Q3, left untouched) | Juan Carlos |
| Release: push, open a PR into `dev`, then `npm run release:patch` (2.37.1) per the Release Rules | User |
| 4R advisories (`execution.md` T1): Archify notices metadata (~8.8 KB headroom under the SVG cap), empty canvas below the Anytime lane, edge 18 px from the image edge | Recorded only |

## 7. Historical Notes

| Phase | Note |
|---|---|
| Proposal | The brief's premise was corrected: the npm README figure loads from the `master` raw URL, so it updates on merge to `master`, not on publish |
| Judgment-day | Two rounds. 1 single-judge severe finding (a citation line number), settled by a re-run. `JUDGMENT: APPROVED` |
| Execution | All three tasks passed their first Reviewer. One execute-time spec edit: DD-2, the column-0 stack |
| Archify | Installed in the session scratchpad with `npx skills add`, by user decision (Q1) |

## 8. Diagrams

The spec has no `diagrams/` folder and no baseline diagram slot, so there are no interactive views to link. The figure itself is a docs asset, not a `diagram-design` slot.
