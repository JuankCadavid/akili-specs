# Design: refresh the lifecycle figure for `/akili-review` and `/akili-marketing`

> **Answer first.** Rebuild the figure as an Archify `workflow` from a source JSON written in the scratchpad. It keeps today's three lanes and node text. The Anytime lane becomes two rows: `/akili-security`, `/akili-review`, `/akili-resume` and `/akili-audit` on top; `/akili-quick`, `/akili-seo` and `/akili-marketing` below. Export `svg-light` and the PNG from one viewer session, then set `<desc>` to the new `docs/flow.md` alt text. The text edits are three sentences and a CHANGELOG note. A new `test/flow-figure.test.js` pins the figure to `.claude/commands/`. Budget: 3 tasks, about 110 LOC plus 2 assets.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/flow-diagram-review` |
| Depth | Lite (re-checked in §8: matches) |
| Inputs | `proposal.md`, `requirements.md` |
| Status | Phase 2 gate: `auto-approved (pre-approved mode)`, 2026-10-26, after judgment-day (see `judgment.md`) |

## 2. Executive Summary

| Requirement | Design element |
|---|---|
| FR-1, FR-2 | §3 figure source, layout and export path (DD-1 to DD-4) |
| FR-3, FR-4 | §4 text changes, wording fixed here (DD-5) |
| FR-5 | §5 release notes (DD-6) |
| FR-6 | §6 tests (DD-7) |

## 3. Architecture Overview: the figure

**Source.** Archify 3.2 (`tt-a1i/archify`, MIT) installed only in the session scratchpad (P-1). The `workflow` type, `showcase` quality profile, schema v2. The source JSON and every Archify working file stay in the scratchpad.

**Lanes and nodes.** The node text is copied from today's SVG node titles (P-4). The two new nodes are marked *new*.

| Lane | Node | Sublabel | Style |
|---|---|---|---|
| 01 / Once per project | `/akili-constitution` | PRD · UX/UI · TRD · personas · routing · Skill Map | as today |
| 02 / Per-spec loop | `/akili-propose` → `/akili-specify` → `/akili-execute` → `/akili-test` → `/akili-validate` → `/akili-archive` → `Kaizen` | as today | as today. Kaizen sits under `/akili-archive` (six-column limit, P-2) |
| 03 / Anytime, row 1 | `/akili-security` | repository vulnerability audit | as today (red, shield) |
| | `/akili-review` *new* | PR review · local or CI | same style as `/akili-security` |
| | `/akili-resume` | multi-spec dashboard | as today (grey) |
| | `/akili-audit` | spec ↔ code drift | as today |
| 03 / Anytime, row 2 | `/akili-quick` | trivial, low-risk change | as today |
| | `/akili-seo` | SEO + GEO audit | as today |
| | `/akili-marketing` *new* | social drafts · never publishes | grey, like the other anytime nodes |

**Edges.** As today: `/akili-constitution` → `/akili-propose`, the loop chain, `/akili-archive` → `Kaizen`, and the dashed `Kaizen` → `/akili-propose` labelled "next spec starts smarter". The dashed `/akili-security` → `/akili-propose` labelled "confirmed finding → Bug Track" stays, and a dashed `/akili-review` → `/akili-propose` in the same colour is added. Label it too, or leave it unlabelled if two labels collide; FR-1 needs only one label. The legend stays hidden, as today.

**Export path** (P-3). Run `finalize` until its validate, deliver, check and browser-check gates pass (within Archify's own repair limit). Then:
1. Open the HTML with `playwright-cli` and force the light theme.
2. Export `svg-light` and the PNG through the export menu, and capture both downloads.
3. Normalize the PNG to 1800 px wide with `magick` if needed.
4. In the SVG: keep `<title>`; set `<desc>` to the §4 alt text byte for byte; strip every embedded font subset except latin, to fit the size cap (precedent: 2026-10-19).

**Visual check.** Read the PNG, and render the SVG in headless Chromium as an `<img>`. `rsvg-convert` cannot draw Archify's CSS variables (P-4), so it is not used.

## 4. Text changes (fixed wording)

| Site | New text |
|---|---|
| `docs/flow.md:7` alt text = SVG `<desc>` | `AKILI-SPECS lifecycle: /akili-constitution sets the baseline once; each spec then runs /akili-propose, /akili-specify, /akili-execute, /akili-test, /akili-validate and /akili-archive, and a Kaizen retrospective feeds the next spec. Anytime commands: /akili-security, /akili-review (local or in CI), /akili-resume, /akili-audit, /akili-quick, /akili-seo and /akili-marketing; confirmed /akili-security and /akili-review findings enter the Bug Track through /akili-propose.` |
| `docs/flow.md:21`, second sentence (the first stays) | ``Confirmed `/akili-security` findings, and confirmed critical `/akili-review` findings from a local run, re-enter the loop through `/akili-propose` on the Bug Track.`` |
| `README.md` `<img alt>` | `The AKILI flow: set up the project once, then each change is proposed, specified, built, tested, validated and archived; seven commands run any time, among them a security audit and a pull-request review that can also run in CI.` |

Both `docs/flow.md` lines contain `akili-security`, so `test/akili-security-docs.test.js` reads them (P-7). The new wording has no run-directory, slug, `--force` or git-command phrase.

## 5. Release notes

- `CHANGELOG.md` `[2.37.0]` and `releases/v2.37.0.md`: delete the single bullet that starts `- **Known debt: the lifecycle figure was not updated.**`. Nothing else in either file changes.
- `CHANGELOG.md` `## [Unreleased]`: replace `- No unreleased changes yet.` under `### Notes` with a `### Changed` bullet and `### Notes` bullets covering FR-5. The note is written after T1 and T2 land, and every clause is quote-checked against HEAD (KZ-002). It names the test files and the suite count measured at that point. It does not mention the GitHub Release body (Q3 is reported to the user, not shipped).

## 6. Tests

| File | Change |
|---|---|
| `test/flow-figure.test.js` (new) | Test 1: every `.claude/commands/akili-*.md` basename appears in the SVG drawn text, plus "Kaizen". Test 2: the SVG `<desc>` equals the `docs/flow.md` figure alt text. Test 3: the standalone rules of FR-1 (`<script`, external `http(s)` fetch, `@import`, `prefers-color-scheme`). Reads only `assets/`, `docs/flow.md` and `.claude/commands/` |
| `test/akili-review-contract-coverage.test.js` FR-14 | Select the section whose heading starts `## [2.37.0]` instead of the first section naming `` `/akili-review` ``. Keep the other four needles and drop the `` `assets/akili-flow.svg` `` needle. Add an assertion that the section no longer contains `Known debt: the lifecycle figure` |

**Why pin by heading.** The 2.37.1 note will name `` `/akili-review` `` and sit above `[2.37.0]`. The old "first section that names `/akili-review`" lookup would then check the wrong section (P-8).

## 7. Design Decisions

| ID | Decision | Rejected | Driver |
|---|---|---|---|
| DD-1 | Regenerate with Archify from a rebuilt source JSON | Hand-editing the export; a hand-authored SVG | Proposal Q1 (user) |
| DD-2 | Two rows in the Anytime lane, with the two Bug Track sources first in row 1 | Seven columns (Archify allows six, P-2); dropping a command | FR-1, P-2 |
| DD-3 | `/akili-review` uses the same style as `/akili-security` | Grey like the others | Brief: "parallel to /akili-security"; both hand off to the Bug Track |
| DD-4 | If the export path fails (P-3 refuted) or the font floor fails, stop and ask the user. Never hand-author silently | Silent fallback | Precedent DD-4 and the amended floor from 2026-10-19 |
| DD-5 | One alt text, shared by `docs/flow.md:7` and the SVG `<desc>`, with a test pinning their identity | Separate texts | FR-3 |
| DD-6 | Delete the 2.37.0 debt bullet. Leave `[2.36.0]` as written | Strike-through, or a "resolved in 2.37.1" annotation | Brief; proposal Q2 (user) |
| DD-7 | Pin FR-14 to the `[2.37.0]` heading | Deleting the FR-14 test | P-8; keep the archived spec's other contract checks |

**Reversion challenge (Step 2.3).** DD-6 removes delivered text, a released CHANGELOG bullet. Question: what does removing it break? Answer:
- (1) FR-14's needle. DD-7 addresses it.
- (2) Agreement with the published GitHub Release v2.37.0 body, which keeps the bullet. This is accepted: Q3 is the user's call, and it is reported at the end.
- (3) `scripts/release-status.js` checks only that `releases/v${version}.md` exists (P-10), so it is not affected.
- (4) `notify-slack.js` reads `releases/v<version>.md` only when a release is announced, and 2.37.0 has already been announced.

No breakage is left unaddressed. A one-question reviewer confirmed this (`judgment.md`).

## 8. Budget (Step 2.4)

| Measure | Estimate | Tripwire |
|---|---|---|
| Tasks | 3 | 4 |
| LOC | ~110: about 10 Markdown in flow/README, 15 in the CHANGELOG and release notes, 85 in tests. The 2 assets count as files | ~170 |
| Review rounds | T1 2, T2 1, T3 2 | 3 on any task |

Depth check: Lite with three tasks matches. They are split by review lens (visual, text plus test, release notes), not by size.

## 9. Premise Ledger

Count: 10 verified, 1 `UNVERIFIED` (High 1, Low 0).
Blast-radius triggers: `consumer` fired. The alt text, `docs/flow.md:21`, CHANGELOG sections and a test's lookup all change, so P-6, P-7, P-8 and P-11 cover it. `live-path` and `shared-state`: none apply. No user action or runtime branch is changed; these are docs and assets only.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | Archify 3.2 is installed in the session scratchpad and ready | data-env | `<scratchpad>/.agents/skills/archify/SKILL.md:6` `version: "3.2"`; `node <archify>/bin/archify.mjs doctor` → "Archify is ready." | `66c91de` | DD-1 cannot run; ask the user (High) | — |
| P-2 | An Archify workflow allows six columns (`col` 0–5) and supports a vertical stack inside a lane through `yOffset` | data-env | `<archify>/renderers/workflow/README.md:135,154,161,239` | `66c91de` | DD-2 layout changes (Low) | — |
| P-3 | A headless `playwright-cli` session can trigger the `svg-light` and PNG exports and capture both downloads | data-env | `UNVERIFIED — confirm at source before relying on it`. Menu items exist: `<archify>/assets/template.html:5152` (`#btn-export`), `:5173` (`png`), `:5180` (`svg-light`); `playwright-cli --version` → 0.1.17. The trigger itself ran on Archify 3.2 on 2026-10-19 (`docs/specs/archive/2026-10-19-changes--docs-refresh-2-34/execution.md:22`), not in this session | — | DD-4: stop and ask (High) | T1, first step |
| P-4 | Today's figure is an Archify export with viewBox 1005×654 and 13 node titles (12 commands plus Kaizen); `<desc>` equals the `docs/flow.md:7` alt text; `rsvg-convert` cannot render it | existence | `head -c 300 assets/akili-flow.svg` → `viewBox="0 0 1005 654"`; `grep -o '<title>[^<]*' assets/akili-flow.svg` → 13; `node -e` comparing the SVG `<desc>` text with the `docs/flow.md` figure alt text → `desc==alt true`; rsvg result recorded at `…docs-refresh-2-34/execution.md:33` | `66c91de` | §3 node table or visual check changes (Low) | — |
| P-5 | 14 packaged commands | existence | `ls .claude/commands \| wc -l` → 14 | `66c91de` | FR-1 count changes (Low) | — |
| P-6 | The README figure is linked and loaded from the `master` raw PNG URL; tests pin the URL, the `<p align="center">` block and the alt text's banned words | consumer | `README.md:50-52`; `test/docs-overview-contract.test.js:143-160`; `test/docs-overview.test.js:455-456`. Search: `grep -rn "akili-flow" test/` → 4 hits in 3 files | `66c91de` | T2 README edit must change (Low) | — |
| P-7 | `docs/flow.md:21` is pinned by `test/akili-marketing-docs.test.js:100-104` (line prefix and all seven names); every `docs/flow.md` line containing `akili-security` is read by `test/akili-security-docs.test.js` (`securityLines`, `:45-46`) for banned phrase families | consumer | `grep -n "flow.md" test/*.js` → those files; `test/akili-security-docs.test.js:45-46,105-135,195-210` | `66c91de` | T2 wording changes (Low) | — |
| P-8 | FR-14 in `test/akili-review-contract-coverage.test.js:349-360` picks the first CHANGELOG section that names `` `/akili-review` `` and requires `` `assets/akili-flow.svg` `` in it | consumer | file at those lines | `66c91de` | DD-7 changes (Low) | — |
| P-9 | No other test, script or bin file references the debt wording | consumer | `grep -rn "Known debt\|known debt" test/ scripts/ bin/` → only `test/akili-review-contract-coverage.test.js:358` | `66c91de` | T3 consumer list grows (Low) | — |
| P-10 | `release:status` checks that the release-notes file exists, not its body | other | `package.json` `release:status` → `node scripts/release-status.js`; `scripts/release-status.js:147` prints `releases/v${version}.md` status | `66c91de` | the DD-6 challenge reopens (Low) | — |
| P-11 | The anytime lists in `docs/README.md`, `docs/overview.md` and `docs/commands/README.md` already name both commands, and none of them describes the figure | existence | `docs/README.md:43-44`, `docs/overview.md:38-39,161`, `docs/commands/README.md:21-22,38`; `grep -rn "akili-flow" docs/README.md docs/overview.md docs/commands/README.md` → 0 | `66c91de` | scope grows by those files (Low) | — |
