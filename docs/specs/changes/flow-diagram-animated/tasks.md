# Tasks: animated AKILI flow figure

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/flow-diagram-animated` |
| Depth | Standard |
| Status | Phase 3 gate: `auto-approved (pre-approved mode)`, 2026-10-27 |
| Budget (design §8) | **4 tasks · ~360 LOC · review rounds T1 2, T2 1, T3 2, T4 2**. Stop and escalate past 5 tasks, ~500 LOC, or 3 rounds on any task |
| Commit prefix | `[SPEC:changes/flow-diagram-animated]`. Local commits only: no push, merge, tag, release or `npm publish` |
| Baselines (as run 2026-10-27 at `4ff00a9`) | `npm test` → 1120 tests, 1120 pass, 0 fail · `grep -c '<picture' README.md` → 0 · `grep -c akili-flow-animated docs/flow.md README.md` → 0 and 0 · `[Unreleased]` holds "No unreleased changes yet." (1 hit) · `scripts/animate-flow.js` and `assets/akili-flow-animated.svg` do not exist · static SVG 144,816 B |
| Harness (T2, scratchpad only) | `playwright-core` from the global `@playwright/cli` install; Chromium `chromium-1228` (149.0.7827.55) launched by `executablePath`; WebKit 2327 (26.5). Starting points: the spike harness `probe/render.js` and `render2.js` (design P-12) |

## 2. Task Graph

```
T1 (generator + asset + test) ──► T2 (rendered evidence + live-path premises)
              └──────────────────► T3 (README + flow embeds + test pins) ──► T4 (CHANGELOG + full verification)
                                     T2 ─────────────────────────────────────►┘
```

T2 and T3 both need T1's asset. They touch different files and could run in parallel, but under the one-session rule they run in sequence: T2, then T3. T4 needs the final counts and sizes from all three.

## 3. Coverage (clause level)

| Clause | Owner |
|---|---|
| FR-1 THEN frames differ (first 25 s, two slots) · AND `e1`–`e8` in `--step` order, `e8` last · AND Bug Track pulse at most once, fainter · AND 8–10 s, three runs, then rest | T2 (rendered), with T1 asserting the structure: `--d` order, `iteration-count: 3`, opacity ceilings, cycle length |
| FR-1 BUT no Anytime animation, nothing static moved or recoloured, no text hidden · AND IT MUST ≤ 3 flashes/s | T1 (no overlay element for an Anytime node; static bytes kept; one rise and one fall per keyframe set ≥ 300 ms) + T2 (T6 frame-strip review) |
| FR-2 THEN 0 px with motion off · AND hidden by attribute · AND in-SVG reduced-motion rule · BUT `<picture>` in the README | T1 (attribute, rule covers both group selectors), T2 (0 px renders), T3 (`<picture>`) |
| FR-3 THEN byte subsequence · AND identity fields · AND IT MUST standalone · AND IT MUST ≤ 153,600 B · AND `aria-hidden` and no static hooks · BUT beneath the label layer | T1 |
| FR-4 every clause | T3 |
| FR-5 every clause | T3 |
| FR-6 every clause | T1 |
| FR-7 every clause | T4 |
| NFR-1 | T1 (no static asset change), T4 (final `git diff --stat` check) |
| NFR-2 | T4 |
| NFR-3 | T4 (all three), T1–T3 (`npm test` each) |
| NFR-4 | T1, T3 (tests), T4 (CHANGELOG) |
| NFR-5 | T3, T4 |

## 4. Tasks

### T1: generator, animated asset and its test

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~130 LOC script, ~160 LOC test, 1 generated asset) |
| Depends on | none |
| Requirements | FR-1 (structure), FR-2 (attribute, media rule), FR-3 (all), FR-6 (all), NFR-1, NFR-4 |
| Design refs | §4, §5, §7 (timeline, rules, draw order, isolation), DD-1 to DD-5, DD-8 to DD-11, P-1, P-2, P-12, P-13 |
| Consumers | none: new files only. `assets/akili-flow.svg` is read and never written |
| Review | `full`: new code, plus a generated asset whose correctness is partly visual |
| Skills | `tdd` (the generator is pure string → string; expected values come from the FR scenarios), `cognitive-doc-design` (CLI error messages) |

**Scope.**

1. `scripts/animate-flow.js`. It exports `animate(svgText)`, and when run directly it reads `assets/akili-flow.svg` and writes `assets/akili-flow-animated.svg`. It uses Node built-ins only.
   - **Hook check:** find loop edges `e1`–`e8` with `--step`, the Bug Track edges `s1` and `s2`, the `data-animate="node"` rect of each of the 8 loop nodes, the last static edge path, and the first edge-label group (`<g data-edge-from`) after the node groups. If any is missing, throw an `Error` naming it. The CLI then exits 1 and writes nothing.
   - **Remove** every `@keyframes` block whose name no `animation`/`animation-name` declaration uses.
   - **Insert** the trace group (8 trace paths with `pathLength="1"`, plus 2 Bug Track pulse paths) right after the last static edge path. Insert the glow group (8 node outlines) right before the first edge-label group. Insert one `<style>` right before `</svg>`. Apply design §7 exactly: per-element `--d` values; `animation-iteration-count: 3`; `fill-mode: none`; colour in CSS; dasharray 1 and linecap butt; opacity ceilings 0.9 and 0.5; `opacity="0"` attributes; `class="akili-motion"`, `aria-hidden="true"` and `pointer-events="none"` on the groups; `mo-` classes only on the overlay elements; the media rule `.akili-motion, .akili-motion *`.
   - Deterministic: no timestamps or randomness, LF line endings.
2. Run the CLI and commit the generated `assets/akili-flow-animated.svg`.
3. `test/flow-figure-animated.test.js`, with a header that cites no spec folder. One assertion per clause:
   - **Staleness:** `animate(static)` equals the committed file, and a second run is equal too.
   - **Subsequence:** removing the two inserted groups and the inserted `<style>` from the animated file gives exactly the static file minus the removed keyframes. The test computes that independently: the keyframe blocks are named by the same unused-name rule, implemented in the test, never imported.
   - **Identity:** `<title>`, `<desc>`, `role="img"`, viewBox, width and height equal the static file's.
   - **Standalone:** no `<script`, no `<animate`, `<animateTransform`, `<animateMotion` or `<set`, no external `href`/`src`/`url(`, no `@import`, no `prefers-color-scheme`. Size ≤ 153,600 B.
   - **Overlay:** every overlay element has `opacity="0"`. There are no static classes and no `data-edge-*`, `data-node-*` or `data-animate` attributes in the overlay. Both groups are `aria-hidden`, and both come before the first edge-label group. No overlay element exists for an Anytime node. The reduced-motion block contains `animation: none` for `.akili-motion, .akili-motion *`. There is no `infinite`, and the iteration count is 3.
   - **Order:** the trace `--d` values ascend with `--step`, and `e8` is last. Glow starts follow design §7. The `s1`/`s2` start is after `e8`'s.
   - **Hook failure:** an in-memory copy with the `data-animate="node"` attribute removed from the propose rect → `animate` throws a message naming the hook. A spawned CLI on a temp copy exits 1 and leaves no output file.

**Verification.**

- `node scripts/animate-flow.js && git status --porcelain assets/` → only `?? assets/akili-flow-animated.svg`, or ` M` on a rerun with no diff.
- `node --test test/flow-figure-animated.test.js` → all pass. `npm test` → 1120 plus the new tests, 0 fail.
- `stat -f %z assets/akili-flow-animated.svg` → ≤ 153,600; design §8 estimates about 134,800.
- `git diff --quiet assets/akili-flow.svg assets/akili-flow.png` → exit 0.

| Verification field | Value |
|---|---|
| Falsifier | (1) Append one space inside the committed animated file → the staleness assertion red. (2) Delete `opacity="0"` from one overlay element in the committed file → the overlay assertion red, and staleness red. (3) Change `3` to `infinite` in the generator → the iteration assertion red. (4) Remove `data-animate="node"` from the propose rect in a copy → the hook assertion expects a throw; run against a generator that skips the check, it goes red. (5) Change one static byte, for example a node label character, in the animated file → the subsequence assertion red |
| Red run | `predicted — greenfield artifact (observed in T1)`. T1's `execution.md` entry quotes the red output of falsifiers 1–5, verbatim |
| Disqualifier | Structure tests prove presence and order, never motion: a green T1 does not show that the figure moves or that it rests at 0 px. T2 owns that. A staleness test that normalises whitespace or line endings on both sides cannot see falsifier 1, so the comparison is byte-exact. A subsequence check that imports the generator's own keyframe-removal helper is circular, which is why the test re-implements the rule |
| Consumers | none |

**Done.** Every verification line holds. All five falsifier reds are quoted in `execution.md`. One `[SPEC:changes/flow-diagram-animated]` commit holds the script, the asset and the test.

### T2: rendered evidence and live-path premises

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (scratchpad harness ~80 LOC, not committed; evidence written to `execution.md`) |
| Depends on | T1 |
| Requirements | FR-1 (rendered: motion, order, pace, three runs then rest, no flashing, nothing static moved), FR-2 (0 px with motion off), P-6, P-7, P-11, P-14 |
| Design refs | §7, §11 (P-6, P-7, P-11, P-12, P-14), §12 R-1, R-2 |
| Consumers | none |
| Review | `full`: the evidence is visual, and the Reviewer re-reads the frame strip at tier T6 |
| Skills | `claude-in-chrome` (P-7, P-11), `playwright-cli` |

**Scope.**

1. **Settle P-7 and P-11 first**, in the user's Chrome through claude-in-chrome: read-only browsing, no sign-in, no posting.
   - **P-11:** open a public GitHub README that embeds a CSS-animated SVG by raw URL. Confirm that the `<img>` goes through GitHub's image proxy and animates (two screenshots that differ). Check whether a `<picture>` `<source media>` survives GitHub's sanitiser.
   - **P-7:** open an npmjs.com package page whose README embeds an SVG `<img>` by an absolute URL. Confirm that it renders, and inspect whether `<picture>`/`<source>` survive.
   - Record the URLs and the DOM evidence. A refutation of P-7 or P-11 → **stop: Pivot Protocol**.
2. **P-6:** retry headless Firefox once. If it still fails to launch, record the error and leave the row `UNVERIFIED` for the user's validation check.
3. **Motion on**, Chromium and WebKit, the image alone on a page, served with the P-3 headers:
   - Capture mid-slot frames for each of `e1`–`e8` and one at 7.9 s (the Bug Track pulse).
   - Show each frame's difference from the static render inside that edge's bounding box, and outside every loop element's box.
   - Assemble a frame strip (`magick montage`) for the tier-T6 review: order, pace, no text struck through, Anytime nodes still.
4. **Motion off** (no fuzz, `compare -metric AE`, each image alone at the same position):
   - Chromium with `--force-prefers-reduced-motion` against the static render → 0.
   - `rsvg-convert` → 0.
   - After 30 s with motion on, in Chromium and WebKit → 0 (settles P-14).

**Verification.** Every number in step 3 and step 4 is quoted in `execution.md`, with the engine version and the command.

| Verification field | Value |
|---|---|
| Falsifier | (a) Render a copy of the asset with one trace's `opacity="0"` removed, with motion off → AE > 0 (the 0 px gate can fail). (b) Render the static SVG in place of the animated one for the motion-on frames → each edge box shows 0 difference (the motion gate can fail). (c) A copy with `iteration-count: infinite` → the 30 s frame AE > 0 |
| Red run | `predicted — greenfield artifact (observed in T2)`. Falsifiers (a)–(c) are run and their reds quoted before the green numbers are trusted |
| Disqualifier | A diff measured with fuzz, or with both images on one page, is not evidence for the 0 px rule (same-page baseline 1,167 px, P-12). A frame whose only difference lies outside every loop element's box is a rendering artefact, not motion. A Chrome page that never loaded (a challenge or sign-in wall) settles nothing: P-7 and P-11 stay `UNVERIFIED` and the validation report carries them |
| Consumers | none |

**Done.** Steps 1–4 are recorded, P-14 is settled, and P-6, P-7 and P-11 are settled or carried with their owner. The strip is reviewed. No repository file changes except `execution.md`.

### T3: README `<picture>`, `docs/flow.md` embed, test pins

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~12 LOC docs, ~40 LOC test edits) |
| Depends on | T1, T2 (T2's P-7 and P-11 outcome gates the README shape) |
| Requirements | FR-4 (all), FR-5 (all), FR-2 BUT (`<picture>`), NFR-4, NFR-5 |
| Design refs | §7 README block and flow line, DD-6, DD-7, P-8, P-10 |
| Consumers | `test/docs-overview-contract.test.js:143-160`, `test/docs-overview.test.js:454-456`, `test/flow-figure-contract.test.js:87` and `:93`, `test/flow-figure.test.js:58` (P-8, `grep -rn akili-flow test/`) |
| Review | `checklist`: a bounded edit with exact target shapes; the Reviewer checks every consumer pin |
| Skills | `cognitive-doc-design` |

**Scope.**

1. Edit the `README.md` figure block to the exact design §7 shape. The alt text is byte-identical. `href` stays the PNG URL. No other README line changes.
2. Change `docs/flow.md` line 7's target to `../assets/akili-flow-animated.svg`, with the alt unchanged. No other line changes.
3. Update the five pins. Each keeps its original intent:
   - **FR-4 contract:** `href` = PNG; `<source media="(prefers-reduced-motion: reduce)" srcset="PNG">`; `<img src="ANIMATED" width="900">`; alt non-empty, with no Kaizen and no Bug Track.
   - **docs-overview:** the PNG appears in `src` or `srcset` inside the centred block.
   - **flow-figure-contract FR-3 and FR-4:** the regexes follow the new embeds.
   - **flow-figure:** the `<desc>` test reads the new flow line, and asserts that the alt equals the `<desc>` of both SVGs.
   - Comments in the edited tests cite no spec folder.

**Verification.**

- `git diff --stat README.md docs/flow.md` → the figure-block lines and 1 line respectively.
- `grep -c '<picture' README.md` → 1.
- `npm test` → 0 fail.

| Verification field | Value |
|---|---|
| Falsifier | (1) Revert the README block, keeping the test edits → the FR-4 contract test red. (2) Set `href` to the animated URL → red on the click-through assertion. (3) Change one character of the flow alt → the `<desc>` equality red. (4) Point the flow line back at the static SVG → red |
| Red run | Observed at `4ff00a9`: `grep -c '<picture' README.md` → 0 and `grep -c akili-flow-animated docs/flow.md` → 0, so the new pins fail on HEAD. T3 quotes each test's red assertion message before editing the docs |
| Disqualifier | A test edit that loosens a pin, for example dropping the `href` check, makes falsifier 2 inert, so the run of falsifier 2 is mandatory. A green suite with the README unchanged means the pins were not updated |
| Consumers | listed above |

**Done.** Every verification line holds. The falsifier reds are quoted. One commit.

### T4: CHANGELOG and full verification

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | XS (~15 LOC) |
| Depends on | T1, T2, T3 |
| Requirements | FR-7 (all), NFR-1, NFR-2, NFR-3, NFR-5 |
| Design refs | §9, R-4, R-6 (proposal) |
| Consumers | `test/flow-figure-contract.test.js` FR-5 reads `## [2.37.1]`, not `[Unreleased]`, so it is unaffected (P-8 grep) |
| Review | `full`: the CHANGELOG quote-check at HEAD (KZ-002) |
| Skills | `cognitive-doc-design` |

**Scope.** Replace the `[Unreleased]` placeholder with `### Added`, `### Changed` and `### Notes` bullets covering every FR-7 clause. The note states:

- the measured asset size and the final test count, re-run after `/akili-test`;
- that the static SVG and PNG are unchanged;
- that the animation runs three cycles and then rests;
- `Release class: patch`;
- that GitHub shows the animation once `master` updates, and npm once 2.37.2 is published.

**Verification.**

- `npm test`, `npm run verify:cli` and `git diff --check` all pass.
- `npm run pack:dry-run` lists `assets/akili-flow-animated.svg` and not `scripts/animate-flow.js`.
- `git diff 4ff00a9 --stat -- bin package.json .claude assets/akili-flow.svg assets/akili-flow.png` → empty.
- Quote-check every clause against HEAD.

| Verification field | Value |
|---|---|
| Falsifier | Add a clause that claims a count off by one → the quote-check, re-running the count, fails it. Add `scripts/animate-flow.js` to `files` → `pack:dry-run` lists it (NFR-2 red) |
| Red run | Observed at `4ff00a9`: `[Unreleased]` holds "No unreleased changes yet." (1 hit) |
| Disqualifier | A count copied from an earlier phase's output is not evidence: it is re-run at T4 and again after `/akili-test` (KZ-002) |
| Consumers | listed above |

**Done.** Every verification line holds. One commit.

## 5. Skip-eligible tasks

None. Every task carries `full` or `checklist` review.
