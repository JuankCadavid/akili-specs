# Proposal: Animated AKILI flow figure

> **Answer first.** Add a second figure, `assets/akili-flow-animated.svg`. It is the 2.37.1 SVG with every node, label and edge unchanged, plus a CSS-only overlay: a highlight travels the per-spec loop (propose → … → archive → Kaizen → back to propose), entering from `/akili-constitution`. With `prefers-reduced-motion: reduce`, or in a renderer that drops CSS animation, the file draws exactly the static figure. A small, tested generator script derives the animated file from the static one, so the next figure regeneration does not need hand edits. The README swaps its `<img>` for a `<picture>` that serves the static PNG to reduced-motion readers and the animated SVG to everyone else. The static SVG and PNG stay as they are. A GIF is not worth making. An MP4 is worth making only as a social asset, kept outside the npm package. **Release: patch (2.37.2).**

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/flow-diagram-animated` (literal path from the brief) |
| Type | Change |
| Deliverable | software. The deliverable kind is an **animated image asset** (SVG + CSS), not a rendered video. The optional MP4 is assessed in *Scope* and kept out of this spec |
| Approval Mode | pre-approved (Juan Carlos Cadavid, 2026-10-27). Mandate: "Commit the proposal locally, then run /akili-specify changes/flow-diagram-animated and continue with /akili-execute, /akili-test and /akili-validate. Local commits only, no push." Covers routine gates only; HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG` and destructive actions still stop |
| Proposal Status | **Approved as is** (Juan Carlos Cadavid, 2026-10-27): patch 2.37.2, no GIF, MP4 later as a separate `/akili-marketing` follow-up outside the npm package, click-through stays the PNG |
| Branch | `JuankCadavid/flow-diagram-animated`, off `dev` at `721a5f1` (2.37.1 released) |
| Requirement source | The user's brief (this session). No Jira ticket |
| Visual source | The shipped 2.37.1 figure (`assets/akili-flow.svg`, `assets/akili-flow.png`). No mockup: the layout must not change |
| Depends on | none |
| Parallel-safe | yes |
| Date | 2026-10-27 |

## Intent

Show the AKILI flow *moving* in the README on GitHub and npm, so a first-time reader sees the order of the phases and the Kaizen feedback loop without reading the arrows one by one.

## Problem / Current Behavior

| Claim | Evidence |
|---|---|
| The README shows the figure as a static PNG, loaded and linked from the `master` raw URL | `README.md:50-52` |
| `docs/flow.md` embeds the static SVG by relative path | `docs/flow.md:7` |
| The shipped SVG already carries Archify's 48 `@keyframes` rules (12,686 B), but no element applies any of them, so it does not animate | `grep -o "@keyframes …" assets/akili-flow.svg` → 48; the only `animation*` declarations are `animation-timing-function` inside keyframes; byte count by a brace-matching scan run on 2026-10-27 |
| Every edge already carries sequencing hooks: `data-edge-id`, `data-animate="edge"`, `style="--step: N"` | `assets/akili-flow.svg`, e.g. edge `e1` (constitution → propose) |
| Some of those keyframes read `var(--flow-len)`, which the Archify viewer sets from script. A README `<img>` runs no script | keyframe bodies in `assets/akili-flow.svg`. That the viewer sets it by script: `UNVERIFIED — confirm at source before relying on it` (Archify `template.html`) |
| The SVG is capped at 153,600 B and ships at 144,816 B (8,784 B headroom) | `test/flow-figure-contract.test.js:81`; `ls -la assets/` |
| Tests pin the README figure to the PNG raw URL, its `<p align="center">` block and alt-text rules | `test/docs-overview-contract.test.js:147-153`; `test/docs-overview.test.js:455-456`; `test/flow-figure-contract.test.js:93` |
| A publish does not change the README image: it is a `master` raw URL. npm's page does change on publish, because npm renders the README from the tarball | `README.md:50-52`; kaizen entry `docs/specs/kaizen/2026-10-26-changes--flow-diagram-review.md` (*Noted, not a lesson*) |

## Proposed Outcome

- On GitHub (README and `docs/flow.md`) and on npmjs.com, a reader with default motion settings sees the figure animate: a highlight walks the per-spec loop on a cycle of about 8 to 10 s, and the Kaizen edge pulses back into propose.
- A reader with `prefers-reduced-motion: reduce` sees the static figure, with no motion.
- At any frame, layout, text, colours, fonts and arrows are those of the 2.37.1 figure. The animation adds emphasis; it never moves or hides content.
- Any renderer that ignores CSS animation shows the full static figure, never an empty or half-drawn one.

## Scope

| In | Detail |
|---|---|
| `assets/akili-flow-animated.svg` | New. Derived from `assets/akili-flow.svg`: unapplied Archify keyframes removed (12.7 KB freed), one CSS overlay added. **CSS animations only, no SMIL.** SMIL cannot be switched off by a `prefers-reduced-motion` media query; CSS can |
| Generator script | New, e.g. `scripts/animate-flow.js` (not shipped in the package). Static SVG in, animated SVG out, deterministic. It replaces a hand edit that every future figure regeneration would have to redo |
| README figure block | `<picture>`: `<source media="(prefers-reduced-motion: reduce)">` → static PNG; `<img>` → animated SVG raw URL. The link target and the alt text stay |
| `docs/flow.md` | Embed the animated SVG; one sentence pointing to the static SVG for print or slides |
| Tests | New contract test for the animated SVG; updates to the README figure tests (P-6 of the last spec) |
| CHANGELOG | One `Unreleased` note |
| Release | Patch 2.37.2, prepared by the user |

### GIF / MP4 assessment

| Format | Verdict | Why |
|---|---|---|
| GIF | **Not worth it** | 256 colours blur the JetBrains Mono labels. A 1800 px loop runs to several MB, against a 300 KB PNG. It does nothing the SVG cannot do in the README |
| MP4 | **Worth it, only as a social asset, in a follow-up** | LinkedIn, X and slide decks do not take SVG, and a 6 to 10 s 1080 px H.264 loop is typically under 1 MB. It can be recorded from the animated SVG with `playwright-cli` + `ffmpeg` (both installed). It must stay **outside the npm package**: `assets/` and `docs/` both ship (`package.json` `files`). Best made under `/akili-marketing`, which can draft the announcing post around it |

## Non-Goals

- Changing the layout, nodes, text, colours or fonts of the figure, or regenerating it in Archify.
- Replacing or deleting `assets/akili-flow.svg` or `assets/akili-flow.png`.
- Any JavaScript in the SVG, or any external font, image or URL.
- An interactive (hover or click) figure.
- The MP4/GIF itself (follow-up; see the assessment above).
- Pushing, opening PRs, tagging or publishing. Those stay with the user.

## Affected Users, Systems, And Specs

| Area | Effect |
|---|---|
| README readers on GitHub and npmjs.com | See the animated figure |
| `assets/` | Gains one file. The package size grows by the animated SVG's size (≤ 150 KB) |
| `scripts/` | Gains the generator. Not listed in `package.json` `files`, so not shipped |
| `test/flow-figure*.test.js`, `test/docs-overview*.test.js` | New and updated assertions |
| Related spec | `docs/specs/archive/2026-10-26-changes--flow-diagram-review/` (source of the 2.37.1 figure, its caps and its test pins) |

## Visual Reference

- Source: none new. The reference is the 2.37.1 figure itself.
- Location: `assets/akili-flow.svg`, `assets/akili-flow.png`.
- Notes: the layout is fixed by the brief. Only the motion is designed. `/akili-specify` describes it as a timeline (which edge and node highlight at which step), not as a mockup.

## Requirement Delta Preview

### ADDED Requirements

- An animated SVG of the flow figure exists. With motion off, it is identical in content to the static SVG, and it uses CSS animation only.
- The animation stops under `prefers-reduced-motion: reduce`, both inside the SVG (media query) and in the README (`<picture>` source).
- The animated SVG loads nothing external, runs no script, and stays under a size cap (proposed 153,600 B, the static SVG's cap).
- A generator rebuilds the animated SVG from the static one. A test fails when the committed animated file is stale.

### MODIFIED Requirements

- The README figure block (pinned by `test/docs-overview-contract.test.js`) moves from a single PNG `<img>` to a `<picture>`. The PNG keeps its role as the link target and the reduced-motion image.
- `docs/flow.md` embeds the animated SVG (its alt-text contract carries over).

### REMOVED Requirements

- None.

## Approach Options

| Option | How | For | Against |
|---|---|---|---|
| **A. Generated CSS overlay (recommended)** | A script copies the static SVG, strips the unapplied keyframes, and adds a `<style>` block plus duplicated edge paths (`pathLength="1"`, animated `stroke-dashoffset`) and node-outline highlights, timed by each edge's `--step` | Layout identical by construction. Lengths are normalised by `pathLength`, so no script-set `--flow-len` is needed. Small. Reproducible on the next regeneration. Testable | We own the motion design and the script (~120 LOC plus tests) |
| B. Archify's own animation | Re-export with the viewer's `trace` animation applied | Brand-native motion, no new code | Today's export applies none of it. The keyframes read script-set variables an `<img>` never gets. Needs Archify re-installed and a re-export, which risks layout drift. Unproven |
| C. Raster loop (GIF/APNG/MP4) in the README | Record the figure and embed the file | Renders everywhere | Several MB, blurred text, no reduced-motion control from an `<img>`, the brand fonts lost to compression. Rejected as primary |

## Recommended Approach

**Option A.** It is the smallest safe path: the static figure stays the single source of the layout, the animated file can never drift from it (a test regenerates and compares), and nothing depends on unproven Archify behaviour. Option B is kept as a 15-minute probe at specify time. If Archify can export an `<img>`-safe animated SVG with zero layout change, the design may switch to it, and that choice is recorded in the Premise Ledger.

Motion sketch for `/akili-specify` to pin down:

1. `/akili-constitution` → `/akili-propose`: one highlight run, once per cycle.
2. propose → specify → execute → test → validate → archive: the highlight runs edge by edge (`--step` order) and each node outline brightens as it arrives.
3. archive → Kaizen → propose ("next spec starts smarter"): the dashed feedback edge pulses.
4. Anytime lane: still, apart from one faint pulse on "confirmed finding → Bug Track" per cycle. It stays calm so the eye follows the loop.
5. Cycle about 8 to 10 s, then repeats. No flashing: keep under 3 flashes per second (WCAG 2.3.1).

## Risks, Dependencies, And Open Questions

| # | Risk / question | Handling |
|---|---|---|
| R-1 | **GitHub and npm rendering of an animated SVG `<img>` from `raw.githubusercontent.com`.** Commonly reported to work on GitHub (CSS animation runs in `<img>`, scripts do not). For npmjs.com: `UNVERIFIED — confirm at source before relying on it` | Specify adds a Premise Ledger row and a local check that serves the file with raw.githubusercontent's response headers (`Content-Type`, CSP `sandbox`) to Chromium, Firefox and WebKit as an `<img>`. The **live checks need a push and a publish, which the brief reserves for the user.** Validation records them as user-run steps: GitHub after the merge to `master`, npm after the 2.37.2 publish |
| R-2 | `<picture>`/`<source media>` support on npmjs.com's README sanitizer: `UNVERIFIED` | If npm strips `<picture>`, its `<img>` (the animated SVG) still renders, and the in-SVG media query still honours reduced motion. Low |
| R-3 | `prefers-reduced-motion` inside an SVG loaded as `<img>`: `UNVERIFIED` per browser | Tested with Playwright's `reducedMotion: 'reduce'` emulation in all three engines. The README `<picture>` covers any engine that ignores it |
| R-4 | Size: 144,816 B today, cap 153,600 B | Removing the dead keyframes frees 12,686 B, so the overlay has about 21 KB. Measured, not estimated, at T1 |
| R-5 | The figure gets regenerated each time a command is added. A hand-edited animated file would silently fall behind | Generator script + staleness test (regenerate, then compare bytes) |
| R-6 | The README image is the `master` URL: the animation appears on GitHub only after `dev` → `master`, and on npm only after a publish | Stated in the CHANGELOG note and the release hand-off. Not a defect |
| Q-1 | Should the README link target (click-through) stay the PNG, or become the animated SVG? | **Resolved at approval:** keep the PNG |
| Q-2 | Does the MP4 follow-up go ahead under `/akili-marketing`? | **Resolved at approval:** yes, later, as a separate follow-up outside the npm package. Not in this spec |

Active Lessons applied:

- **KZ-002** (summary claims inherit the evidence bar): the CHANGELOG note states only measured sizes and counts, re-run after `/akili-test`.
- **KZ-changes--archify-diagrams-1** (shipped files never cite an active spec path): tests and docs cite no `docs/specs/changes/flow-diagram-animated/` path.
- **KZ-changes--leader-brief-contract-2** (falsifiers executed, not predicted): the staleness and reduced-motion falsifiers are run before they are written into `tasks.md`.

Tooling: `/akili-review` runs read-only on the branch diff before hand-off. `/akili-marketing` is for the optional MP4 and announcement post. Neither changes this spec's scope.

## Success Criteria

1. With motion on, `assets/akili-flow-animated.svg` animates as an `<img>` in headless Chromium, Firefox and WebKit, served with raw.githubusercontent's headers. Evidence: frame captures at two times that differ.
2. With reduced motion emulated, and with animation stripped, the animated SVG's render matches the static SVG's render pixel for pixel (or within a stated tolerance limited to antialiasing).
3. No `<script>`, no SMIL element, no external URL, no `@import`. Size ≤ the cap.
4. Running the generator on HEAD's static SVG reproduces the committed animated file byte for byte.
5. README and `docs/flow.md` tests pass with the new embed. `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` are green. The pack shows the new asset and no MP4/GIF.
6. User-run, after merge and publish: the animation is seen on the GitHub README and on the npmjs.com 2.37.2 page, and is still under reduced motion (OS setting).

## Next Step

Patch release recommended (2.37.2): a docs asset and README embed, with no command, skill, installer or behaviour change. That matches the repo's semver rule that new commands, targets or behaviour earn a minor, and nothing here does.

```text
/akili-specify changes/flow-diagram-animated
```
