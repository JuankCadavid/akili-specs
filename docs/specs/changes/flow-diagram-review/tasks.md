# Tasks: refresh the lifecycle figure for `/akili-review` and `/akili-marketing`

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/flow-diagram-review` |
| Depth | Lite |
| Status | Phase 3 gate: `auto-approved (pre-approved mode)`, 2026-10-26 |
| Budget (design §8) | **3 tasks · ~95 LOC (assets counted as files) · review rounds T1 2, T2 1, T3 2**. Stop and escalate past 4 tasks, ~150 LOC, or 3 rounds on any task |
| Commit prefix | `[SPEC:changes/flow-diagram-review]`. Local commits only: no push, merge, tag, release or `npm publish` |
| Baselines (as run 2026-10-26 at `66c91de`) | `npm test` → 1108 pass / 0 fail · `ls .claude/commands \| wc -l` → 14 · SVG 121,501 B, viewBox width 1005, min font 6.6 → 5.91 at 900 · PNG 285,229 B, 1800×1311 |

**Drawn-text check (DT).** Run from the repository root. It prints the commands missing from the SVG drawn text and whether "Kaizen" is present:

`node -e 'const fs=require("fs");const s=fs.readFileSync("assets/akili-flow.svg","utf8");const d=[...s.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map(m=>m[1].replace(/<[^>]+>/g,"")).join("\n");console.log("missing:",fs.readdirSync(".claude/commands").map(f=>"/"+f.replace(/\.md$/,"")).filter(c=>!d.includes(c)),"kaizen:",d.includes("Kaizen"))'`

Baseline output at `66c91de`: `missing: [ '/akili-marketing', '/akili-review' ] kaizen: true`.

## 2. Task Graph

```
T1 (figure) ──► T2 (alt texts + figure test) ──► T3 (release notes + FR-14 pin)
```

T2 depends on T1 because the figure test reads the new SVG. T3 depends on T2 because the CHANGELOG note describes what T1 and T2 shipped and states the measured suite count.

## 3. Tasks

### T1: regenerate the figure with Archify

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (2 binary assets, 0 LOC Markdown) |
| Depends on | none |
| Requirements | FR-1 (every clause: 14 of 14 names plus Kaizen; `/akili-review` beside `/akili-security`, same colour family, sublabel with "CI"; both dashed edges, at least one labelled; `/akili-marketing` sublabel; BUT no new lane, track or unpackaged name; BUT no Archify in drawn text; AND IT MUST font floor, light only, standalone, `<title>`, `role="img"`) · FR-2 (same source and run, 1800 px, visual parity, size caps) · NFR-1 (no Archify file in the repo) |
| Design refs | §3, DD-1 to DD-4, P-1 to P-4 |
| Consumers | `README.md:50-52` (PNG by raw URL), `docs/flow.md:7` (SVG), `test/docs-overview.test.js:455`, `test/docs-overview-contract.test.js:143-160` (URL only, not changed) |
| Review | `full`: layout defects are visible only to a reviewer looking at the image |
| Skills | `diagram-design` (Archify relation), `playwright-cli` |

**Scope.**

1. **Settle P-3 first.** In the scratchpad, `finalize` a minimal candidate, open it with `playwright-cli`, force the light theme, and trigger the `svg-light` and PNG exports, capturing both downloads. If either export cannot be captured, **stop and ask the user** (DD-4).
2. Write the source JSON in the scratchpad with the lanes, nodes, sublabels, styles and edges of design §3. Run `finalize` until its gates pass, within Archify's repair limit. This settles P-14; if two rows cannot be expressed, arrange the rows another way within FR-1, keeping `/akili-security` and `/akili-review` adjacent.
3. Export `svg-light` and the PNG from the same viewer session. Normalize the PNG to 1800 px wide with `magick` if needed.
4. Post-process the SVG: keep the `<title>`, set `<desc>` to the design §4 alt text byte for byte, keep only the latin font subset, and strip trailing spaces.
5. Replace `assets/akili-flow.svg` and `assets/akili-flow.png`. Nothing else from Archify enters the repository.
6. Do the tier-T6 visual review: read the PNG, and render the SVG as `<img width="900">` in headless Chromium. Record in `execution.md` each FR-1 element found, and any clipping, overlap or misrouted edge.

**Verification.**

- DT → `missing: [] kaizen: true`. "Archify" absent from drawn text.
- `grep -c '<script\|@import\|prefers-color-scheme' assets/akili-flow.svg` → 0. `grep -oE '(href|src)="https?://|url\(https?:' assets/akili-flow.svg` → no output.
- Font floor (settles P-13): smallest drawn `font-size` × 900 / viewBox width ≥ 5.5, and the smallest node-label size × 900 / width ≥ 8. Below either, stop and ask (DD-4).
- `magick identify assets/akili-flow.png` → width 1800. `stat -f %z` → PNG ≤ 409,600, SVG ≤ 153,600 (P-12; over the cap → lossless re-encode, then stop and ask).
- `git status --porcelain` shows only the two assets changed (plus spec docs).
- `npm test` passes. No test reads `<desc>` yet, so a temporary mismatch with `docs/flow.md:7` is expected until T2.

| Verification field | Value |
|---|---|
| Falsifier | The current SVG under DT → `missing: [ '/akili-marketing', '/akili-review' ]` (observed). For the font floor: a candidate whose min font gives < 5.5 at 900 → the floor check fails |
| Red run | Observed at `66c91de`: DT → `missing: [ '/akili-marketing', '/akili-review' ] kaizen: true` |
| Disqualifier | DT and the greps prove presence, not layout. A clean DT with overlapping or clipped nodes is **not** a pass: the T6 visual review is the gate for layout. A PNG not exported in the same session as the SVG is not evidence of parity. A Chromium render that fails to decode the SVG is not a pass, even if the greps are clean |
| Consumers | listed above. URLs and paths are unchanged, so no consumer edit is needed |

**Done.** Every verification line holds. The visual review is recorded. `[SPEC:changes/flow-diagram-review]` commit with the two assets only.

### T2: alt texts and the figure test

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~10 LOC Markdown, ~60 LOC test) |
| Depends on | T1 |
| Requirements | FR-3 (alt text names seven anytime commands and both hand-offs; byte-identical to `<desc>`; the line-21 prefix is kept and both sources are named; BUT no other `docs/flow.md` line changes) · FR-4 (URL and block unchanged; plain-words alt; BUT no "Kaizen" or "Bug Track"; README grows by ≤ 1 line) · FR-6 (figure test: missing command → red; `<desc>` ≠ alt → red; BUT no read of the spec folder) · NFR-2 |
| Design refs | §4, §6 (`test/flow-figure.test.js`), DD-5, P-6, P-7 |
| Consumers | `test/akili-security-docs.test.js:45-46,105-135,195-210` (`docs/flow.md` lines naming `akili-security`), `test/akili-marketing-docs.test.js:100-104` (line-21 prefix and names), `test/docs-overview-contract.test.js:143-160` and `test/docs-overview.test.js:455-456` (README block) |
| Review | `checklist`: text with fixed wording plus one new test |
| Skills | `cognitive-doc-design`, `tdd` (test written first against the T1 SVG) |

**Scope.**

1. Write `test/flow-figure.test.js` (`node:test`) with tests 1–3 exactly as design §6 defines them: whole-`<text>` name match, `<desc>` = alt, and the standalone and identity rules. It reads only `assets/akili-flow.svg`, `docs/flow.md` and `.claude/commands/`.
2. Run it before the text edit: test 2 must be red (`<desc>` is new, `docs/flow.md:7` is old).
3. Replace the `docs/flow.md:7` alt text and the second sentence of `docs/flow.md:21` with the design §4 wording.
4. Replace the README `<img alt>` with the design §4 wording.

**Verification.**

- `node --test test/flow-figure.test.js` → all pass. `git diff --stat docs/flow.md` → 2 lines changed. `git diff README.md` → the alt attribute only.
- `node --test test/akili-security-docs.test.js test/akili-marketing-docs.test.js test/docs-overview.test.js test/docs-overview-contract.test.js` → all pass.
- `grep -c "Kaizen\|Bug Track"` on the README alt line → 0.
- `grep -n "docs/specs" test/flow-figure.test.js` → no output.
- `npm test` passes.

| Verification field | Value |
|---|---|
| Falsifier | (1) Run the test 1 logic against the pre-T1 SVG → missing `/akili-marketing`, `/akili-review` (observed with DT at `66c91de`). (2) Change one word of the `docs/flow.md:7` alt text → test 2 red; restore. (3) Add `<script>` to a temporary copy of the SVG in the test's input → test 3 red. Falsifiers (2) and (3) are `predicted — greenfield artifact (observed in T2)` |
| Red run | Test 2 red before step 3, quoted verbatim in `execution.md`. `predicted — greenfield artifact (observed in T2)` |
| Disqualifier | A test 1 that matches names anywhere in the file, `<title>` or `<desc>` included, instead of drawn text only, proves nothing about what a viewer sees. If test 2 is green before step 3, it compares the wrong strings |
| Consumers | listed above, all run in Verification |

**Done.** The quoted red, then all green. One `[SPEC:…]` commit.

### T3: release notes and the FR-14 pin

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~15 LOC Markdown, ~10 LOC test) |
| Depends on | T2 |
| Requirements | FR-5 (no debt bullet in `[2.37.0]` or `releases/v2.37.0.md`; `[Unreleased]` note covers figure, CI cue, shared hand-off, alt texts, debt removal, tests, patch class, and the `master` raw-URL behaviour; BUT `[2.36.0]`, `releases/v2.36.0.md` and other released sections untouched; AND IT MUST pass a quote-check) · FR-6 (FR-14 reads `## [2.37.0]` by heading, keeps the other four needles, drops the figure needle, asserts no debt bullet; the whole suite passes) · NFR-3 |
| Design refs | §5, §6, DD-6, DD-7, P-8, P-9, P-10 |
| Consumers | `test/akili-review-contract-coverage.test.js:348-360` (edited here); `scripts/release-status.js:147` (file-existence check, unaffected); `scripts/release.js` reads `[Unreleased]` at the next release prep |
| Review | `full`: CHANGELOG clauses are a recurring over-claim site (KZ-002) |
| Skills | `cognitive-doc-design` |

**Scope.**

1. Edit FR-14 in `test/akili-review-contract-coverage.test.js` as design §6 says, including the renamed title. Run it: red (the `[2.37.0]` section still holds the bullet).
2. Delete the debt bullet from `CHANGELOG.md` `[2.37.0]` and from `releases/v2.37.0.md`.
3. Measure the suite (`npm test`), then write the `[Unreleased]` note: `### Changed` plus `### Notes` (release class patch, tests and counts as measured, the `master` raw-URL behaviour).
4. Quote-check every clause of the note against HEAD, including the sentences around each insertion (KZ-002). The note must not restate the inline-comment cap, the `--fail-on` default or the carve-out lists (design §5).

**Verification.**

- `node --test test/akili-review-contract-coverage.test.js` → red after step 1 (quote it), green after step 2.
- `grep -c "Known debt: the lifecycle figure" CHANGELOG.md releases/v2.37.0.md` → 0 and 0.
- `git diff --stat` → `[2.36.0]` lines untouched: `git diff CHANGELOG.md` shows hunks only in `[Unreleased]` and `[2.37.0]`, and `releases/v2.36.0.md` is unchanged.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run` (lists both assets) and `git diff --check` all pass.

| Verification field | Value |
|---|---|
| Falsifier | Restore the bullet into `[2.37.0]` → the new FR-14 assertion goes red. Baseline observed at `66c91de`: the `[2.37.0]` section contains the debt text → `2.37.0 has debt: true` |
| Red run | Step 1 red, quoted verbatim in `execution.md` |
| Disqualifier | A suite count written before the final `npm test` run is not evidence. A note clause that cannot be matched to a shipped line is a FAIL, not an ADVISORY |
| Consumers | listed above |

**Done.** All green, the note is quote-checked, one `[SPEC:…]` commit.

## 4. Coverage closure

| Clause | Task |
|---|---|
| FR-1, every THEN, AND, BUT and AND IT MUST | T1 (DT, greps, floor, visual review); T2 test 1 and test 3 lock names and the standalone rules |
| FR-2 THEN, AND, AND IT MUST | T1 |
| FR-3 THEN, AND (×2), BUT | T2 |
| FR-4 THEN, AND, BUT | T2 |
| FR-5 THEN, AND (×2), BUT, AND IT MUST | T3 |
| FR-6 THEN (figure test), AND (FR-14), AND (suite), BUT (no spec-folder read) | T2 (figure test, BUT), T3 (FR-14, final suite) |
| NFR-1, NFR-2, NFR-3 | T1 (NFR-1), T2 and T3 (NFR-2), T3 (NFR-3) |

`skip-eligible` tasks: none.
