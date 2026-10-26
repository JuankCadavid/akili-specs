# Test Report: `changes/flow-diagram-review`

> **Overall status: PASS.** The full suite passes 1120/1120 on three consecutive runs, and no product bugs were found. Every functional requirement has automated evidence. The visual-only defect classes (layout and PNG/SVG parity) have no automated check; they are covered by the T6 visual reviews recorded in `execution.md`.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/flow-diagram-review` |
| Depth | Lite |
| Date | 2026-10-26 |
| Code under test | `5f8de65` (T1), `e54be25` (T2), `9bde8d2` (T3) |
| Leader / Tester | Leader `opus`, running inline under the Deployment Rule (Lite, one small suite). The Implementer model was `sonnet` and there were no escalations, so the Tester model differs from the author model |
| Approval Mode | `pre-approved`; the gate is `auto-approved (pre-approved mode)` |

## 2. Summary

| Item | Result |
|---|---|
| Suites | 1 docs/asset contract suite (`node:test`). Backend, frontend, integration and E2E suites do not apply: there is no runtime code change |
| Testers spawned | 0. Run inline by the Leader (Lite depth, single suite) |
| Author coverage cited, not rewritten | `test/flow-figure.test.js` (T2, 3 tests) and `test/akili-review-contract-coverage.test.js` FR-14 (T3) |
| New tests | `test/flow-figure-contract.test.js`, 9 tests, all pass |
| Full suite | `npm test` → 1120 tests, 1120 pass, 0 fail, ×3 runs (1111 before plus 9 new) |
| Other gates | `npm run verify:cli` → 14 commands, 29 skills, 8 resources. `npm run pack:dry-run` lists both assets. `git diff --check` is clean |
| Mutation evidence | 6 mutations each turned the targeted test red (§7) |
| Product bugs | 0 |
| Flake note | During T3, one `npm test` run reported 1110 pass / 1 fail; the failing test was not captured. It has not reproduced in 9 full runs since (3 Implementer, 2 Leader during execute, 1 Reviewer, 3 here). It is recorded as an unidentified flake; that run is not counted as passing evidence |

## 3. Backend Unit Tests

Not applicable: the change touches no `bin/` or `scripts/` code.

## 4. Frontend Unit Tests

Not applicable: there is no frontend.

## 5. Integration Tests

Not applicable. The packaging check stands in: `npm run pack:dry-run` lists `assets/akili-flow.png` (300.8 kB) and `assets/akili-flow.svg` (144.8 kB).

## 6. E2E Tests

Not applicable. The rendered figure is checked visually (§9).

## 7. Coverage & Traceability

| Requirement | Scenario clause | Test type | Test or command | Result | Notes |
|---|---|---|---|---|---|
| FR-1 | THEN 14 of 14 names plus Kaizen | contract | `flow-figure.test.js` test 1 (author) | PASS | Whole-`<text>` match |
| FR-1 | AND review beside security, same colour family, CI cue | contract | `flow-figure-contract` test 2 | PASS | Same `data-node-kind`, both in the Anytime lane, sublabel `/\bCI\b/`. Red on the pre-T1 SVG (M1) |
| FR-1 | AND both dashed edges into propose, ≥ 1 labelled | contract | `flow-figure-contract` test 3 | PASS | Red with M1, and with M2 (review edge class changed to one without a dash) |
| FR-1 | AND marketing sublabel | contract | `flow-figure-contract` test 4 | PASS | Red with M1 |
| FR-1 | BUT no added lane, track or unpackaged name | contract | `flow-figure-contract` test 1 | PASS | Lanes are exactly 01/02/03. Red with M3 (`/akili-foo` drawn) |
| FR-1 | BUT no Archify in drawn text | contract | `flow-figure.test.js` test 3 (author) | PASS | — |
| FR-1 | AND IT MUST font floor | contract | `flow-figure-contract` test 5 | PASS | 6.6 × 900 / 1009 = 5.89 ≥ 5.5; labels 10 → 8.92 ≥ 8. Red with M1 (fewer node labels than commands) |
| FR-1 | AND IT MUST light only, standalone, `<title>`, `role="img"` | contract | `flow-figure.test.js` test 3 (author) | PASS | — |
| FR-2 | THEN 1800 px; AND IT MUST size caps | contract | `flow-figure-contract` test 6 | PASS | PNG IHDR width 1800, PNG ≤ 409,600 B, SVG ≤ 153,600 B. Red with M6 (PNG resized to 1700: `actual: 1700`) |
| FR-2 | THEN same source and run; AND visual parity, no clipping or overlap | manual (T6) | T1 visual reviews by the Leader and the Reviewer (`execution.md` T1) | PASS | No automated check exists; accepted gap (§9) |
| FR-3 | THEN alt names seven commands and both hand-offs | contract | `flow-figure-contract` test 7 | PASS | Red with M4 (pre-change `docs/flow.md`) |
| FR-3 | AND alt = `<desc>` | contract | `flow-figure.test.js` test 2 (author) | PASS | — |
| FR-3 | AND line 21 prefix and both sources | contract | `flow-figure-contract` test 7; `akili-marketing-docs.test.js:100-104` | PASS | — |
| FR-3 | BUT no other `docs/flow.md` line changes | diff check | `git diff 9bde8d2~3 9bde8d2 -- docs/flow.md` → lines 7 and 21 only (T2 Reviewer) | PASS | A one-off diff check; it cannot be a durable test |
| FR-4 | THEN URL and block unchanged | contract | `docs-overview-contract.test.js:143-160`, `docs-overview.test.js:455` | PASS | — |
| FR-4 | AND plain-words alt (seven commands, security audit, CI-capable PR review) | contract | `flow-figure-contract` test 8 | PASS | Red with M4 |
| FR-4 | BUT no "Kaizen" or "Bug Track"; README ≤ +1 line | contract + diff | `docs-overview-contract.test.js:156-157`; T2 diff +1/−1 | PASS | The line-count clause is a one-off diff check |
| FR-5 | THEN no debt bullet in `[2.37.0]` or `releases/v2.37.0.md` | contract | `flow-figure-contract` test 9; FR-14 (author) | PASS | Red with M5 |
| FR-5 | AND `[Unreleased]` note content, patch, `master` URL | contract | `flow-figure-contract` test 9 | PASS | Survives the release rename to `[2.37.1]`. Red with M5 (placeholder) |
| FR-5 | BUT `[2.36.0]` and `releases/v2.36.0.md` untouched | diff check | `git diff 3f718cb -- releases/v2.36.0.md` → empty; T3 CHANGELOG hunks only in `[Unreleased]` and `[2.37.0]` | PASS | One-off diff check |
| FR-5 | AND IT MUST quote-check | review | T3 Reviewer, KZ-002 clause-by-clause check (`execution.md` T3) | PASS | No automated check exists |
| FR-6 | THEN the figure test fails on a missing name, a `<desc>` drift or an identity break | contract | `flow-figure.test.js` 1–3; red runs in `execution.md` T2 | PASS | — |
| FR-6 | AND FR-14 reads `[2.37.0]` by heading | contract | `akili-review-contract-coverage.test.js` FR-14 | PASS | Red run quoted in `execution.md` T3 |
| FR-6 | AND whole suite passes | suite | `npm test` ×3 | PASS | 1120/1120 |
| FR-6 | BUT no read of the spec folder | grep | `grep -n "docs/specs" test/flow-figure*.test.js` → empty | PASS | — |
| NFR-1 | No change to `bin/`, `package.json`, `.claude/`; no Archify file in the repo | diff | `git diff 3f718cb --stat -- bin package.json package-lock.json .claude` → empty | PASS | — |
| NFR-2 | English, cognitive-doc-design | review | T2 and T3 Reviewers | PASS | — |
| NFR-3 | `verify:cli`, `pack:dry-run`, `git diff --check` | command | as in §2 | PASS | — |

**Mutations run** (each restored with `git checkout` afterwards; final `git status` shows only the new test file):

| ID | Mutation | Tests turned red |
|---|---|---|
| M1 | Pre-change SVG and PNG | 2, 3, 4, 5 |
| M2 | Review edge class `a-security` → `a-plain` | 3 |
| M3 | `/akili-seo` label → `/akili-foo` | 1 |
| M4 | Pre-change `docs/flow.md` and `README.md` | 7, 8 |
| M5 | Pre-change `CHANGELOG.md` and `releases/v2.37.0.md` | 9 |
| M6 | PNG resized to 1700 px | 6 |

## 8. Remediation

None required.

## 9. Accepted Gaps

| Gap | Why it is not automated | Substitute evidence |
|---|---|---|
| Layout quality (overlap, clipping, edge routing) and PNG/SVG visual parity (FR-2) | The repository has no image-diff or layout harness, and adding one is a TRD and test-infrastructure decision, outside this spec | T6 visual reviews: the Leader read the PNG; the T1 Reviewer compared the PNG, a headless-Chromium render of the SVG, and the old PNG (`execution.md` T1). Recommended in `/akili-validate`: one more look at the PNG |
| FR-3 BUT, FR-4 line count, FR-5 BUT `[2.36.0]` untouched | They are properties of a diff, not of a file state, so no durable test can hold them | One-off diff checks recorded above and in the T2 and T3 Reviewer verdicts |
| FR-5 quote-check | A semantic match between the note's wording and the shipped text | T3 Reviewer KZ-002 walk |
| The unidentified T3 flake | It has not reproduced, so there is no test to point at | 9 clean full runs since; recorded, not counted as evidence |
