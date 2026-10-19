# Test Report: public docs refresh for 2.34.1

**Overall: PASS** — 35/35 acceptance checks green at HEAD (22 of them red at the base `9be733a`), `npm test` 413/413, `verify:cli`, `pack:dry-run` and `git diff --check` clean. 0 product bugs. 3 accepted gaps (visual judgement).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-refresh-2-34` |
| Date | 2026-10-19 |
| Tested at | `a731f60` (all four tasks committed; clean tree) |
| Leader | Opus 5.5 (`claude-opus-5-5`) |
| Approval Mode | `pre-approved` — report gate `auto-approved (pre-approved mode)` |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 2: **Docs acceptance** (new, scripted, per FR/NFR) · **Repository regression** (existing `npm test` + release verification) |
| Testers spawned | 0 — both suites run **inline** by the Leader (Deployment Rule: docs-only, no test authoring allowed in `test/` by NFR-2; one scripted check + existing commands) |
| Author ≠ tester | The acceptance script was written by the Leader, who wrote none of the shipped docs (Implementers `sonnet`) |
| Skill deviations | none |
| Measurement discipline | All commands run with no delegated agent active |

Commands run (from the repo root):

| Command | Result |
|---|---|
| `python3 -I docs/specs/changes/docs-refresh-2-34/acceptance-check.py` | `TOTAL 35 FAIL 0` |
| same script over `git archive 9be733a` (pre-change base) | `TOTAL 35 FAIL 22` — the suite discriminates |
| `npm test` | `# tests 413 · # pass 413 · # fail 0 · # skipped 0` |
| `npm run verify:cli` | `12 commands \| 27 skills \| 8 resources (akili-specs v2.34.1)` |
| `npm run pack:dry-run` | lists `403.9kB assets/akili-flow.png`, `132.9kB assets/akili-flow.svg`; 309 files, 2.6 MB packed / 5.2 MB unpacked |
| `git diff --check` | clean |
| `git diff --stat 9be733a -- .claude bin test package.json docs/model-routing.md` | empty (NFR-2) |
| `diff <(git ls-tree -r --name-only 9be733a \| grep -i archify) <(git ls-files \| grep -i archify)` | identical — no Archify file entered the repo (NFR-2) |

## 3–6. Backend Unit · Frontend Unit · Integration · E2E

n/a — no code changed. The installer is unchanged (NFR-2 diff empty), so the temporary-target install checks in `AGENTS.md` → *Verification* do not apply; `verify:cli` and `pack:dry-run` cover the package surface.

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test | Result | Notes |
|---|---|---|---|---|
| FR-1 | every packaged command drawn | acceptance: drawn `<text>` ⊇ `/akili-*` of `.claude/commands` (12/12) | PASS | base: 11/12 |
| FR-1 | AND video + diagram labels | acceptance | PASS | |
| FR-1 | AND IT MUST PNG 1800 wide | `magick identify` → 1800×1610 | PASS | |
| FR-1 | AND IT MUST font floor (amended) | min font 6.9 × 900 / 1081 = 5.74 ≥ 5.5; min node label 9.7 → 8.08 ≥ 8 | PASS | amended by user decision at T1 |
| FR-1 | AND IT MUST no clipped/overlapping text | — | GAP-1 | visual; covered by T1 Leader + Reviewer review |
| FR-1 | BUT no unpackaged command/skill | acceptance: set of drawn `/akili-*` ⊆ package | PASS | |
| FR-1 | BUT HyperFrames/Archify not presented as packaged | acceptance: every mention in an install/optional note | PASS | |
| FR-1 (amended) | README links the full-size PNG | acceptance: `<a href=…akili-flow.png><img` | PASS | |
| FR-2 | alt at both sites = SVG `<desc>` (AND IT MUST same text) | acceptance: byte equality README ↔ flow ↔ desc | PASS | |
| FR-2 | names constitution/loop/Kaizen/anytime/video/diagrams | acceptance (key terms) | PASS | |
| FR-2 | BUT no claim the figure lacks | — | GAP-2 | semantic; Reviewer T1/T2 walked each claim against the PNG |
| FR-2 | SVG standalone, `role`, `<title>` | acceptance; Chromium `<img>` render (T1) | PASS | librsvg cannot render it (known limit, `execution.md` T1) |
| FR-3 | section before *Install*, three linked rows | acceptance | PASS | |
| FR-3 | AND IT MUST native-Windows statement | acceptance | PASS | |
| FR-3 | BUT no new `/akili-security` rule wording | `test/akili-security-docs.test.js` (in `npm test`) | PASS | pinned phrase families |
| FR-3 | *Start Here* `/akili-security` → Bug Track | acceptance | PASS | |
| FR-4 | *Contents* sets equal to package | acceptance: commands 12 = 12, skills 27 = 27 | PASS | base: 11 / 24 |
| FR-4 | AND IT MUST new counts checked | `verify:cli` 12 / 27; T2 Reviewer checked "Five anytime commands" | PASS | |
| FR-5 | caveat in header, BUT badge kept | acceptance | PASS | |
| FR-6 | hub names all commands; video/diagram pointers | acceptance | PASS | base: hub missing `/akili-quick`, `/akili-security` |
| FR-6 | flow lifecycle shows `/akili-security`; §10, §11 with conditions | acceptance | PASS | |
| FR-6 | AND IT MUST links only to `skills/`/`commands/` | acceptance: §10–§11 links | PASS | |
| FR-7 | three pages name `diagram-design` + condition | acceptance per anchor section | PASS | T4 attempt 1 FAILed review on the constitution condition; fixed |
| FR-7 | BUT not mandatory / Archify not required | acceptance (negative regex per section) | PASS | |
| FR-8 | skills index alphabetical | acceptance: inventory == sorted | PASS | |
| FR-8 | `[Unreleased]` `### Changed`, no placeholder, npm vs `master` wording | acceptance | PASS | compatible with `scripts/release.js:75-91` (T4 Reviewer) |
| NFR-1 | suite + verify + pack + diff-check | commands above | PASS | |
| NFR-2 | file scope; no Archify file | diff + ls-files above | PASS | |
| NFR-3 | local commits, prefix | `git log 9be733a..HEAD` all `[SPEC:changes/docs-refresh-2-34]`; no push/tag | PASS | |
| NFR-4 | PNG ≤ 409,600 B, SVG ≤ 153,600 B, both packed | acceptance + `pack:dry-run` | PASS | 403,861 / 132,913 |
| KZ-changes--archify-diagrams-1 | no shipped link into `docs/specs/changes` | acceptance on README, hub, flow | PASS | 2 pre-existing illustrative paths are prose, not links |

## 8. Remediation

None required.

## 9. Accepted Gaps

| ID | Gap | Why not automated | Substitute evidence |
|---|---|---|---|
| GAP-1 | No clipped/overlapping text in the figure | A raster check cannot judge legibility | Tier-T6 visual review by the Leader (T1) and the T1 Reviewer on the PNG and the Chromium `<img width=900>` render; one cosmetic collision recorded (Bug Track pill on the lane border) |
| GAP-2 | Alt text makes no claim the figure lacks | Semantic | T1 and T2 Reviewers walked each alt-text claim against the figure |
| GAP-3 | Rendering on github.com and npmjs.com themselves | Requires a push, which the user rule forbids | Headless Chromium render of the SVG as `<img>`; the README PNG updates only once it reaches `master` |
