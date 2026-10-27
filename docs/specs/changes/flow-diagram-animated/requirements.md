# Requirements: animated AKILI flow figure

> **Answer first.** A new `assets/akili-flow-animated.svg` shows the 2.37.1 figure with a highlight walking the per-spec loop. It runs three 9 s cycles, then rests on the static figure. Turn the animation off and it draws exactly the static figure. It runs on CSS alone: no script, no SMIL, nothing external. A generator script builds it from the static SVG, and a test fails when the committed file is stale. The README serves it through a `<picture>` that gives reduced-motion readers the static PNG; the click-through stays the PNG. `docs/flow.md` embeds it. The static SVG and PNG are unchanged. The release is a patch (2.37.2), prepared by the user.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/flow-diagram-animated` |
| Depth | Standard (re-checked in design §8) |
| Type | Change |
| Deliverable | software (an animated image asset, docs and tests) |
| Approval Mode | `pre-approved (Juan Carlos Cadavid, 2026-10-27)`: "Commit the proposal locally, then run /akili-specify changes/flow-diagram-animated and continue with /akili-execute, /akili-test and /akili-validate. Local commits only, no push." |
| Proposal | `proposal.md`, approved as is on 2026-10-27. Q-1: the click-through stays the PNG. Q-2: the MP4 is a later `/akili-marketing` follow-up, outside the npm package. No GIF |
| Release | patch 2.37.2 (prepared later under the Release Rules, not in this spec) |
| Format source | `docs/specs/general-setup/` does not exist in this repository (`ls docs/specs/general-setup` → no such directory). The format follows the archived `changes/flow-diagram-review` spec |
| Status | Phase 1 gate: `auto-approved (pre-approved mode)`, 2026-10-27. Amended 2026-10-27 after judgment-day round 1 (`judgment.md`): FR-1 runs 3 cycles then rests (user decision on F-11, WCAG 2.2.2); FR-2's threshold is fixed at 0 px (F-3) |

## 2. Executive Summary

The README figure is a still image. A reader has to follow the arrows one by one to see the order of the phases and the Kaizen loop back. This spec adds an animated twin that shows that order in motion and changes nothing else about the figure. It also keeps the animation honest: it is off for readers who ask for reduced motion, and it cannot fall behind the static figure.

## 3. Glossary

| Term | Meaning |
|---|---|
| Static figure | `assets/akili-flow.svg` and `assets/akili-flow.png`, as shipped in 2.37.1 |
| Animated figure | `assets/akili-flow-animated.svg` (new) |
| Overlay | The elements and CSS the generator adds to the static SVG to make the animated one |
| Loop path | Edges `e1`–`e8`: constitution → propose → specify → execute → test → validate → archive → Kaizen → propose |
| Motion off | Any of: the reader's `prefers-reduced-motion: reduce`; a renderer that does not run CSS animation; a renderer that ignores CSS entirely |
| Generator | `scripts/animate-flow.js` (new, not shipped in the npm package) |

## 4. System Context & Scope

Current state, with evidence run at `4ff00a9`:

- The README figure is `<img src>` = the `master` raw PNG URL, linked to the same URL, inside `<p align="center">` (`README.md:49-53`). Three tests pin that block: `test/docs-overview-contract.test.js:143-160`, `test/docs-overview.test.js:454-456` and `test/flow-figure-contract.test.js:92-97`.
- `docs/flow.md:7` embeds the static SVG as a Markdown image. Two tests pin that line by regex: `test/flow-figure.test.js:58` and `test/flow-figure-contract.test.js:87`.
- The static SVG does not animate. It carries 48 `@keyframes` rules (12,686 B) that no element applies (scan run 2026-10-27; the only `animation*` declarations are `animation-timing-function` inside those keyframes).
- The edges carry `data-edge-id` and `--step` 0–9, and every node's main rect carries `data-animate="node"` and `--step` (`assets/akili-flow.svg`; dump run 2026-10-27: edges `e1`–`e8` are the loop, steps 0–7; `s1`/`s2` are the Bug Track edges, steps 8–9).
- `raw.githubusercontent.com` serves an SVG with `content-type: image/svg+xml` and `content-security-policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` (`curl -sI …/master/assets/akili-flow.svg`, run 2026-10-27).
- In headless Chromium 149 and WebKit 26.5, a CSS animation inside an SVG loaded as `<img>` runs. Playwright's `reducedMotion` emulation does **not** reach the SVG's own media query, but it does select a `<picture>` `<source media="(prefers-reduced-motion: reduce)">`. In Chromium, a browser-level `--force-prefers-reduced-motion` stops the SVG's own animation. Probe: scratchpad `probe/run*.js`, run 2026-10-27. Headless Firefox 1534 hung at launch, so Firefox is `UNVERIFIED — confirm at source before relying on it`.
- How npmjs.com renders an animated SVG `<img>` and a `<picture>`: `UNVERIFIED — confirm at source before relying on it` (the package page sits behind a Cloudflare challenge to `curl`).

In scope: the new asset, the generator, the README figure block, the `docs/flow.md` figure line, the five tests that pin them, one new test file, and the CHANGELOG `Unreleased` note.
Out of scope: everything in the proposal's Non-Goals, including the static assets, an MP4 or GIF, pushing and releasing.

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| New reader (GitHub, npm) | See the order of the phases and the Kaizen loop at a glance |
| Reader with reduced motion on | No motion |
| Maintainer | Regenerate the static figure without hand-editing an animated copy |

## 6. Functional Requirements

### FR-1: The animated figure walks the loop path

The animated figure SHALL highlight the loop path edge by edge, in `--step` order, and brighten each loop node as the highlight reaches it. The cycle SHALL run three times and then come to rest on the static figure (user decision, 2026-10-27: WCAG 2.2.2, *Pause, Stop, Hide*, because an `<img>` has no pause control).

#### Scenario: Motion on

- GIVEN `assets/akili-flow-animated.svg` loaded as an `<img>` in a browser with motion allowed
- WHEN frames are captured within the first 25 s, one in the middle of each of two different edge slots
- THEN the frames differ from each other inside the loop path's bounding area
- AND across one cycle, edges `e1`–`e8` each carry the highlight once, in `--step` order, with the dashed Kaizen edge `e8` last
- AND the Bug Track edges `s1`/`s2` pulse at most once per cycle, fainter than the loop highlight
- AND the cycle lasts 8–10 s, runs exactly three times, and after the third cycle every overlay element is back at opacity 0, so the figure draws the static pixels (FR-2's 0 px rule)
- BUT it must NOT animate the Anytime nodes, move, resize or recolour any static element, or hide any text
- AND IT MUST NOT flash more than three times in any one-second period (WCAG 2.3.1)

### FR-2: With motion off, it is the static figure

#### Scenario: Reduced motion and no animation

- GIVEN the animated figure
- WHEN it renders with motion off (FR-2 covers all three cases in the glossary)
- THEN it draws the same pixels as the static SVG rendered the same way: 0 differing pixels (ImageMagick `compare -metric AE`, no fuzz), same engine, each image alone on a page at the same position
- AND every overlay element is invisible by presentation attribute, not by CSS alone, so a renderer that ignores `<style>` also draws the static figure
- AND the SVG's own `@media (prefers-reduced-motion: reduce)` rule stops every animation it declares
- BUT it must NOT rely on that media query alone where a page can choose the image: the README uses `<picture>` (FR-4)

### FR-3: Content, identity and standalone rules carry over

#### Scenario: Static content preserved

- GIVEN the static and the animated SVG
- WHEN both are read
- THEN the animated one holds every element of the static one, byte for byte, except the unapplied `@keyframes` rules the generator removes
- AND its `<title>`, `<desc>`, `role="img"`, viewBox, width and height equal the static one's
- AND IT MUST stay standalone: no `<script>`, no SMIL element (`<animate>`, `<animateTransform>`, `<animateMotion>`, `<set>`), no `href`/`src`/`url(` pointing at `http(s)`, no `@import`, no `prefers-color-scheme`
- AND IT MUST be at most 153,600 B
- AND every overlay group carries `aria-hidden="true"`, and no overlay element carries a static-figure class or a `data-edge-*`, `data-node-*` or `data-animate` attribute, so no static rule restyles it (judgment F-7)
- BUT the overlay must NOT paint over any drawn text: it sits beneath the edge-label groups (judgment F-2)

### FR-4: README serves the animated figure, with the PNG for reduced motion

#### Scenario: README figure block

- GIVEN `README.md` `## How it works`
- WHEN the figure block is read
- THEN it is one `<p align="center">` block holding `<a href="PNG">` around a `<picture>`
- AND the `<picture>` holds `<source media="(prefers-reduced-motion: reduce)" srcset="PNG">` and `<img src="ANIMATED" width="900">`, where PNG and ANIMATED are the `master` raw URLs of `assets/akili-flow.png` and `assets/akili-flow-animated.svg`
- AND the `<img>` keeps today's alt text unchanged
- BUT the click-through must NOT change: `href` stays the PNG URL (proposal Q-1)
- AND IT MUST NOT add any other README line outside the figure block

### FR-5: `docs/flow.md` embeds the animated figure

#### Scenario: Flow page

- GIVEN `docs/flow.md`
- WHEN its figure line is read
- THEN it is `![<alt>](../assets/akili-flow-animated.svg)` with today's alt text unchanged
- AND that alt text still equals the `<desc>` of both SVGs
- BUT it must NOT change any other line of `docs/flow.md`

### FR-6: The generator keeps the animated figure in step with the static one

#### Scenario: Regeneration

- GIVEN the generator
- WHEN it runs on `assets/akili-flow.svg`
- THEN it writes `assets/akili-flow-animated.svg`, and a second run produces identical bytes
- AND a test runs it in memory and fails when the committed animated file differs from its output
- BUT when the static SVG lacks the hooks the overlay needs (loop edges `e1`–`e8` with `--step`, loop nodes with `data-animate="node"`), the generator MUST exit non-zero with a message naming the missing hook, and write nothing
- AND IT MUST use only Node built-ins

### FR-7: The change is recorded

#### Scenario: CHANGELOG

- GIVEN `CHANGELOG.md`
- WHEN `## [Unreleased]` is read
- THEN the placeholder is replaced by notes naming the animated figure, the generator and its staleness test, the README `<picture>` (PNG for reduced motion, click-through unchanged), the `docs/flow.md` embed, the test changes, and `Release class: patch`
- AND it says the static SVG and PNG are unchanged
- AND it says GitHub shows the animation once `master` updates and npm once 2.37.2 is published
- BUT it must NOT edit a released section
- AND IT MUST pass a quote-check at HEAD, with every count and size re-run after `/akili-test` (KZ-002)

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | No change to `bin/`, `package.json`, `.claude/`, `assets/akili-flow.svg` or `assets/akili-flow.png`. No MP4, GIF or Archify file enters the repository |
| NFR-2 | `npm run pack:dry-run` lists `assets/akili-flow-animated.svg` and does not list `scripts/animate-flow.js` |
| NFR-3 | `npm test`, `npm run verify:cli` and `git diff --check` pass |
| NFR-4 | No shipped file or test cites `docs/specs/changes/flow-diagram-animated/` (KZ-changes--archify-diagrams-1) |
| NFR-5 | Changed text is English and follows `cognitive-doc-design` |

### Defect classes and gates

| Defect class | Gate |
|---|---|
| Static content changed or lost in the animated file | New test: the static SVG minus the removed keyframes is a byte-for-byte subsequence of the animated one; identity fields equal (automated) |
| Animated file stale against the static one | New staleness test (automated) |
| Script, SMIL, external fetch, colour-scheme rule, size over the cap | New contract test (automated) |
| Overlay visible with motion off | Automated: every overlay element has `opacity="0"`, and the reduced-motion rule covers every overlay selector. **Rendered:** pixel diff of the animated SVG against the static SVG with animation stopped, in Chromium and WebKit (T2) |
| No motion at all, wrong order, flashing, wrong pace, not coming to rest after three cycles | **No automated check in `npm test`** (no browser in CI). Substitute: T2 frame captures in Chromium and WebKit, plus a model-tier-T6 (Multimodal) visual review of a frame strip by the Leader and the Reviewer |
| Reduced motion ignored | T2: `<picture>` selection under emulation; the in-SVG rule under Chromium's browser-level flag. Firefox, Safari's real reduced-motion setting and npm: **accepted gap**, owned by the user's post-merge and post-publish check (validation records it) |
| README or flow line regressing | Updated tests (automated) |
| CHANGELOG over-claim | Reviewer quote-check at HEAD (KZ-002) |
| Generator writing a non-animated file from a changed figure | Automated: generator test with a hook removed expects a throw and no write |

## 8. Requirement ID Index

| ID | Title | Tasks |
|---|---|---|
| FR-1 | Walks the loop path | T1 (overlay), T2 (rendered evidence) |
| FR-2 | Motion off = static | T1 (attributes, media rule), T2 (pixel diff) |
| FR-3 | Content and standalone rules | T1 |
| FR-4 | README `<picture>` | T3 |
| FR-5 | `docs/flow.md` embed | T3 |
| FR-6 | Generator and staleness | T1 |
| FR-7 | CHANGELOG | T4 |
| NFR-1..5 | Boundaries, packaging, verification | T1–T4 |
