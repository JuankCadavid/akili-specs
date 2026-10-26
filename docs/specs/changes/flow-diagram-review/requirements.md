# Requirements: refresh the lifecycle figure for `/akili-review` and `/akili-marketing`

> **Answer first.** The lifecycle figure (SVG and PNG) draws all 14 packaged commands, with seven in the *Anytime* lane. `/akili-review` sits beside `/akili-security`, shows a "local or CI" cue, and shares the Bug Track hand-off. The `docs/flow.md` and README alt text describe the new figure. The CHANGELOG and release-notes debt bullet for 2.37.0 is gone, and a 2.37.1 note records the change. A new test pins the figure to the command set.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/flow-diagram-review` |
| Depth | Lite (re-checked in design §8) |
| Type | Change |
| Deliverable | software (docs figure and docs text) |
| Approval Mode | `pre-approved (Juan Carlos Cadavid, 2026-10-26)`: "Answer process gates with the recommended option and stop for product decisions." |
| Proposal | `proposal.md`, approved 2026-10-26. Q1 = Archify in the session scratchpad. Q2 = leave CHANGELOG `[2.36.0]` as written. Q3 = leave the published GitHub Release v2.37.0 text untouched and report it at the end |
| Release | patch 2.37.1 (prepared later under the Release Rules, not in this spec) |
| Status | Phase 1 gate: `auto-approved (pre-approved mode)`, 2026-10-26 |

## 2. Executive Summary

The figure is a few releases behind: it draws 12 of the 14 commands. The rest of the docs already list `/akili-review` and `/akili-marketing`. This spec brings the figure and its alt texts up to date, closes the recorded debt, and adds a test so the figure cannot fall behind the command set again without a red test.

## 3. Glossary

| Term | Meaning |
|---|---|
| Figure | `assets/akili-flow.svg` (embedded by `docs/flow.md`) and `assets/akili-flow.png` (embedded by `README.md` from the `master` raw URL) |
| Anytime lane | The figure's third lane, *03 / Anytime* |
| Bug Track hand-off | The dashed edge from an anytime command into `/akili-propose`, labelled "confirmed finding → Bug Track" |
| Drawn text | The text of the SVG's `<text>` elements (what a viewer sees), as opposed to `<title>`/`<desc>` |
| Font floor | Smallest drawn font size × 900 / viewBox width ≥ 5.5 px, and node labels ≥ 8 px. This is the floor the user amended on 2026-10-19 in `changes/docs-refresh-2-34` |

## 4. System Context & Scope

Current state, with evidence (run at `66c91de`):

- The figure draws 12 command names. `/akili-review` and `/akili-marketing` are missing (`grep -o '<title>[^<]*' assets/akili-flow.svg` lists 13 node titles, Kaizen included).
- `ls .claude/commands | wc -l` → 14.
- `docs/flow.md:7` alt text names five anytime commands.
- `docs/flow.md:21` names all seven, but names only `/akili-security` as a Bug Track source. `docs/flow.md:450` and `docs/commands/akili-review.md:41` route confirmed `/akili-review` criticals to `/akili-propose` in a local run.
- The SVG `<desc>` equals the `docs/flow.md:7` alt text today.
- `CHANGELOG.md:33` and `releases/v2.37.0.md:23` carry the 2.37.0 figure-debt bullet. `test/akili-review-contract-coverage.test.js:349-360` requires it.

In scope: the two assets; `docs/flow.md` lines 7 and 21; the README figure alt text; `CHANGELOG.md`; `releases/v2.37.0.md`; two test files.
Out of scope: everything in the proposal's Non-Goals, including the GitHub Release body, CHANGELOG `[2.36.0]` and running the release.

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| New user (GitHub, npm) | One picture of every command and where it fits |
| Maintainer | A figure that cannot silently drift from the command set |

## 6. Functional Requirements

### FR-1: The figure draws every packaged command, with seven in the Anytime lane

The figure SHALL keep its three lanes, lane titles, per-spec loop and Kaizen back-edge as they are today. Its Anytime lane SHALL draw `/akili-security`, `/akili-review`, `/akili-resume`, `/akili-audit`, `/akili-quick`, `/akili-seo` and `/akili-marketing`.

#### Scenario: Figure content

- GIVEN the regenerated `assets/akili-flow.svg` in the working tree
- WHEN its drawn text is read
- THEN every `.claude/commands/akili-*.md` name appears, 14 of 14, and "Kaizen" appears
- AND `/akili-review` is drawn next to `/akili-security`, in the same colour family, with a sublabel that contains "CI"
- AND both `/akili-security` and `/akili-review` have a dashed edge into `/akili-propose`, and at least one of them carries the label "confirmed finding → Bug Track"
- AND `/akili-marketing` has a sublabel that says it drafts and never publishes
- BUT it must NOT add a lane, add a video or diagram track, or draw any name that is not a packaged command (Kaizen excepted)
- BUT it must NOT name Archify anywhere in the drawn text
- AND IT MUST meet the font floor, keep the light theme only (no `prefers-color-scheme`), and stay standalone: no `<script>`, no external resource fetch through `href`, `src` or `url(` pointing at `http(s)`, and no `@import` (`xmlns` and comments are exempt; embedded `data:` fonts are allowed)
- AND IT MUST keep `<title>` = "AKILI-SPECS methodology lifecycle" and `role="img"`

### FR-2: SVG and PNG show the same figure

#### Scenario: Assets in sync

- GIVEN the two regenerated assets
- WHEN they are compared
- THEN both come from the same Archify source and the same run, and the PNG is 1800 px wide
- AND a visual review of the PNG and of the SVG rendered in a browser finds the same nodes, edges and labels, with no clipped or overlapping text
- AND IT MUST stay within size: PNG ≤ 409,600 B, SVG ≤ 153,600 B

### FR-3: `docs/flow.md` describes the new figure

#### Scenario: Flow page

- GIVEN `docs/flow.md`
- WHEN line 7 (the figure) and the anytime sentence are read
- THEN the alt text names all seven anytime commands and says that confirmed `/akili-security` and `/akili-review` findings enter the Bug Track through `/akili-propose`
- AND the alt text is byte-identical to the SVG `<desc>`
- AND the anytime sentence still starts with "Seven anytime commands run outside this loop" and names both Bug Track sources, noting that `/akili-review` routes findings in a local run
- BUT it must NOT change any other line of `docs/flow.md`

### FR-4: The README alt text stays short and accurate

#### Scenario: README figure

- GIVEN `README.md` `## How it works`
- WHEN the figure block is read
- THEN the link and `src` stay on the `master` raw PNG URL, inside `<p align="center">`
- AND the alt text says, in plain words, that seven commands run any time, among them a security audit and a pull-request review that can also run in CI
- BUT it must NOT contain "Kaizen" or "Bug Track", and the README must NOT grow by more than one line

### FR-5: The debt note is closed and the change is recorded

#### Scenario: Release notes

- GIVEN `CHANGELOG.md` and `releases/v2.37.0.md`
- WHEN they are read after the change
- THEN neither `[2.37.0]` nor `releases/v2.37.0.md` carries the "Known debt: the lifecycle figure was not updated" bullet
- AND `## [Unreleased]` replaces "No unreleased changes yet." with a note that names the figure refresh (both commands, the CI cue, the shared hand-off), the alt-text edits, the debt removal, the test changes and the release class (patch)
- AND the note says that README viewers on GitHub and npm see the new figure once `master` updates, because the image loads from the `master` raw URL
- BUT it must NOT edit `[2.36.0]`, `releases/v2.36.0.md` or any other released section
- AND IT MUST pass a quote-check at HEAD: every clause in the note matches the shipped files (KZ-002)

### FR-6: Tests pin the new state

#### Scenario: Test suite

- GIVEN the test suite
- WHEN `npm test` runs
- THEN a figure test fails if any `.claude/commands/akili-*.md` name is missing from the SVG drawn text, or if the SVG `<desc>` differs from the `docs/flow.md` alt text
- AND `test/akili-review-contract-coverage.test.js` FR-14 reads the `## [2.37.0]` section by its heading, still checks that section's other needles, and no longer requires the figure-debt needle
- AND the whole suite passes
- BUT no test may read `docs/specs/changes/flow-diagram-review/` (KZ-changes--archify-diagrams-1)

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | No change to `bin/`, `package.json`, `.claude/commands/`, `.claude/skills/` or `.claude/templates/`. No Archify file enters the repository |
| NFR-2 | Every changed text is in English and follows `cognitive-doc-design` |
| NFR-3 | `npm run verify:cli`, `npm run pack:dry-run` (lists both assets) and `git diff --check` pass |

### Defect classes and gates

| Defect class | Gate |
|---|---|
| A command missing from the figure | FR-6 figure test (automated) |
| The SVG `<desc>` drifting from the flow alt text | FR-6 figure test (automated) |
| Layout defects: overlap, clipping, misrouted edge, wrong colour family | **No automated check.** Substitute: a tier-T6 visual review of the PNG and of the browser-rendered SVG by the Leader, then by the Reviewer |
| The PNG out of sync with the SVG | **No automated check.** The same-run export rule (FR-2) plus the T6 visual comparison |
| Font below the floor | Measured: smallest drawn `font-size` and node-label size × 900 / viewBox width |
| SVG not standalone, or dual-theme | grep for `<script`, external `http(s)` fetches, `@import`, `prefers-color-scheme` |
| CHANGELOG over-claim | Reviewer quote-check at HEAD (KZ-002). No automated check |
| A pinned doc test breaking | `npm test` |

## 8. Requirement ID Index

| ID | Title | Tasks |
|---|---|---|
| FR-1 | Figure draws every command | T1 |
| FR-2 | SVG and PNG in sync | T1 |
| FR-3 | `docs/flow.md` describes the figure | T2 |
| FR-4 | README alt text | T2 |
| FR-5 | Debt closed, change recorded | T3 |
| FR-6 | Tests pin the new state | T2 (figure test), T3 (FR-14 pin) |
| NFR-1..3 | Boundaries, language, verification | T1–T3 |
