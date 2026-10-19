# Design: public docs refresh for 2.34.1

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-refresh-2-34` |
| Depth | Standard |
| Status | **Approved** — Phase 2 gate: `auto-approved (pre-approved mode)`, 2026-10-19, after `judgment-day` round 1 and the fixes recorded in `judgment.md` |
| Requirements | `requirements.md` (FR-1…FR-8, NFR-1…NFR-4) |
| Verified at | `729d39f` (premises first run at `c5d6c3d`; only spec files changed since) |
| Architecturally significant | No — no module, integration, data flow or NFR change; `software-architect` and `diagram-design` slot filling do not apply (the figure is a README asset, not a diagram slot) |

## 2. Executive Summary

Edit five Markdown surfaces in place, add one capabilities section to the README, and replace the lifecycle figure with an Archify `workflow` diagram exported from its viewer as SVG and PNG. No new restatement of `/akili-security` rules: new lines link to the command page and reuse the wording the doc tests already pin.

## 3. Architecture Overview

| Surface | Change | FR |
|---|---|---|
| `assets/akili-flow.svg`, `assets/akili-flow.png` | Replaced by the Archify export (light theme) | FR-1, FR-2 |
| `README.md` header | One caveat line under the OS badges | FR-5 |
| `README.md:46`, `docs/flow.md:7` | New alt text at both figure sites | FR-2 |
| `README.md` new section *What AKILI Covers* (between *Docs* and *Repository Structure*) | 3-row table: security audits · video deliverables · diagrams | FR-3 |
| `README.md` *Contents* | Commands list keeps its lifecycle order: `akili-quick.md` after `akili-propose.md`. Skills list stays alphabetical: add `diagram-design`, `security-audit`, `tdd` | FR-4 |
| `README.md` *Start Here* | One paragraph: the anytime commands, `/akili-security` → Bug Track | FR-3 |
| `docs/README.md` | Quick Flow followed by anytime-command lines incl. `/akili-quick`, `/akili-security`; two pointer lines (video, diagrams) | FR-6 |
| `docs/flow.md` | *Primary Lifecycle* block gains a `/akili-security` entry under *Independent Auditing*; new §10 *Video Deliverables* and §11 *Diagram Slots* under *Advanced Engineering Capabilities* | FR-6 |
| `docs/commands/akili-constitution.md` *Skill Map Scaffolding* list · `akili-specify.md` *Key Rules* · `akili-archive.md` *Archive Summary* | One line each naming `diagram-design`, its step and condition. `docs/commands/README.md` is not touched: its `:36` "not part of the spec lifecycle" already matches "anytime" (P-11) | FR-7 |
| `docs/skills/README.md` | Move the `tdd` row after `tailwind-design-system` | FR-8 |
| `CHANGELOG.md` | `[Unreleased]`: the `### Notes` / "No unreleased changes yet." placeholder is replaced by `### Changed` with one bold-lead-in bullet naming `changes/docs-refresh-2-34`, in the `[2.34.1]` style (P-10) | FR-8 |

### Figure content (FR-1)

Archify `workflow`, five lanes, left to right:

| Lane | Nodes |
|---|---|
| Once per project | `/akili-constitution` (PRD · UX/UI · TRD · personas · routing · Skill Map) |
| Per-spec loop | `/akili-propose` → `/akili-specify` → `/akili-execute` → `/akili-test` → `/akili-validate` → `/akili-archive` → Kaizen (return edge to propose) |
| Video track (`Deliverable: video`) | Video Mode (specify) → render evidence (test) → final look + delivery render (validate); note "video-production + your HyperFrames install" |
| Diagram slots | Mermaid slots at constitution Steps 3–5 · specify Step 2.1 (architecturally significant) · archive Step 2 (when the spec has slots); note "diagram-design; Archify view optional" |
| Anytime | `/akili-resume` · `/akili-audit` · `/akili-quick` · `/akili-seo` · `/akili-security` → edge "confirmed finding" to `/akili-propose` |

The SVG must render standalone because `docs/flow.md:7` embeds it as an image: no external resource fetch — no `<script>`, no `href`/`src`/`url(` pointing at `http(s)`, no `@import`; namespace declarations (`xmlns`) and comments are exempt; Archify's embedded `data:font/woff2` `@font-face` rules (JetBrains Mono, OFL) are accepted; only the latin subset is kept so the SVG fits NFR-4's 150 KB cap (raw export 180,348 B — T1). Export path: `finalize` → open the HTML with `playwright-cli` → export menu item `svg-light` (theme-locked; the default "Download SVG" is dual-theme) → force the viewer theme to light, then export the full-diagram PNG (PNG uses the current viewer theme) → capture both through the download event → PNG normalized to 1800 px wide with `magick` when the export differs → set the SVG root's `<title>` and replace its generic `<desc>` (the export already carries `role="img"`, `<title>` and `<desc>` — corrected at T1). All Archify working files stay in the scratchpad.

## 4. Extended Directory Structure

No new files in the repo. Working folder: `<scratchpad>/.archify/workflow-akili-lifecycle-<ts>/`.

## 5–9. Data Model · API · Backend · Frontend · Shared Contracts

n/a — documentation change; no data, API, code or contract.

## 10. Design Decisions

| DD | Decision | Rejected alternative | Shaped by |
|---|---|---|---|
| DD-1 | New `/akili-security` lines reuse existing pinned phrases verbatim or carry no rule at all (link only) | Fresh summary sentences — would enter `securityLines()` scope of `test/akili-security-docs.test.js` and risk drift | KZ-changes--gate-falsifiability-2, P-3 |
| DD-2 | HyperFrames and Archify are named as user-installed tools behind the packaged bridges | Calling them AKILI skills | P-4, governance rule (referenced, never vendored) |
| DD-3 | One capabilities table, not three new sections | Three sections — triples the restatement surface | proposal Option A |
| DD-4 | Figure via Archify workflow export. If the export cannot be produced (P-5 refuted), execution **stops and asks the user**; a hand-authored SVG is offered then, never substituted silently | Hand SVG first; silent fallback (would override the user decision) | user decision, judgment B-04 |
| DD-5 | Light theme: `svg-light` menu item and a light-forced PNG | Default dual-theme SVG — `docs/flow.md:7` would turn dark on dark-mode hosts | P-5 |
| DD-6 | Inventory and count checks are run as a one-off membership script in each task's verification, not a new test | A shipped inventory test — `test/` is out of scope (NFR-2) | KZ-002 |
| DD-7 | No link into `docs/specs/` from shipped docs | Linking archived specs | KZ-changes--archify-diagrams-1 |

**Reversion challenge (Step 2.3):** DD-4 replaces the shipped figure. "What does removing it break?" — the README `<img>` URL (`raw.githubusercontent.com/…/master/assets/akili-flow.png`) keeps the same path, so nothing breaks; the old figure's content is a subset of FR-1's. The file name stays. The only other reference is `docs/flow.md:7`, which embeds the SVG (P-7): the exported SVG must therefore render standalone as an image — no script, no external font or URL — and that alt text changes too.

## 11. Premise Ledger

Verified 10 · `UNVERIFIED` 1 (High 1, Low 0).
Blast-radius triggers: `consumer` fires (the figure file is referenced, and README/flow lines are pinned by tests); `live-path` and `shared-state` do not apply — no user action dispatches through code and no state is changed.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | Installs carry 12 commands and 27 skills | existence | `ls .claude/commands \| wc -l` → 12; `ls .claude/skills \| wc -l` → 27; `node bin/akili.js doctor --tool claude` → `ok 47` (12+27+8) | `c5d6c3d` | FR-4 counts change (Low) | — |
| P-2 | README *Contents* misses `akili-quick.md`, `diagram-design`, `security-audit`, `tdd` | existence | membership loop over `sed -n 72,118p README.md` → those four | `c5d6c3d` | T2 scope changes (Low) | — |
| P-3 | `test/akili-security-docs.test.js` checks every README / flow / commands-README line matching `/akili-security\|security-audit\|audits\/security-/` for slug form, run-directory wording, git commands and paraphrased controls | consumer | `test/akili-security-docs.test.js:44-64,99-130,174-210` | `c5d6c3d` | DD-1 wording rules change (High) | — |
| P-4 | No HyperFrames or Archify directory is packaged | existence | `ls .claude/skills \| grep -i -E "hyperframes\|archify"` → 0 | `c5d6c3d` | DD-2 wrong (High) | — |
| P-5 | A headless `playwright-cli` session can trigger the viewer's `svg-light` and PNG exports and capture both files through the download event | data-env | `UNVERIFIED — confirm at source before relying on it`. At source (Archify 3.2, scratchpad): menu items `data-format="svg-light"`/`"svg-dark"` at `assets/template.html:5179-5181`, mapped to `serializeSvg({theme:'light'})` at `:7229-7240`; PNG uses the current theme (`:6080-6090`), initial theme from `matchMedia` (`:29`); download via a Blob `<a download>` click (`:6454-6465`); fonts embedded as `data:` `@font-face` (`:145-166`); no `<title>`/`<desc>` injected by `serializeSvg` (`:6355-6385`). The headless trigger itself is not run | — | DD-4 stops and asks the user (High) | T1 first step |
| P-6 | `rsvg-convert` and `magick` exist | existence | `command -v rsvg-convert magick` → `/opt/homebrew/bin/…` both | `c5d6c3d` | PNG normalization changes (Low) | — |
| P-7 | Within `README.md docs/*.md docs/commands docs/skills bin test .claude`, the figure is referenced at exactly two sites (`CHANGELOG.md:486` and `releases/v2.17.1.md` mention it historically, not as embeds): `README.md:46` (PNG, by raw URL) and `docs/flow.md:7` (SVG, relative `../assets/akili-flow.svg`, Markdown image — GitHub renders it as an image, so scripts and external resources do not load) | consumer | `grep -rn akili-flow README.md docs/*.md docs/commands docs/skills bin test .claude` → `docs/flow.md:7`, `README.md:46` | `c5d6c3d` | a third alt-text site (Low) | — |
| P-8 | `test/diagram-design.test.js` pins README's Archify paragraph (`npx skills add tt-a1i/archify`, `[Archify](https://github.com/tt-a1i/archify) by tt-a1i (MIT licence)`, `never ships or installs it`) and the `diagram-design` skills-index row cells | consumer | `test/diagram-design.test.js:400-415` | `c5d6c3d` | T2/T4 must keep them (Low) | — |
| P-9 | Every new line that names `/akili-security` (alt text at both sites, the badge caveat, the capabilities row, *Start Here*, the flow block) enters `securityLines()` scope and must avoid the pinned phrase families (in-target run directory, "four controls", `install --force`, `git status/check-ignore/rev-parse`, a `run directory` mention without "(always outside the target)", a slug other than `bugfix/security-<YYYY-MM-DD>-r<N>-s<n>`) | consumer | `test/akili-security-docs.test.js:44-45` (filter), `:99-130`, `:174-210` | `729d39f` | wording rules for T1–T3 change (Low) | — |
| P-10 | `scripts/release.js` refuses a release while `[Unreleased]` contains "No unreleased changes yet." and re-inserts that placeholder under `### Notes` after a release; a `### Changed` block is compatible | consumer | `scripts/release.js:75-91` | `729d39f` | FR-8 note shape changes (Low) | — |
| P-11 | `docs/commands/README.md:36` already says `/akili-security` "is not part of the spec lifecycle", consistent with "anytime" | other | `sed -n 36p docs/commands/README.md` | `729d39f` | `docs/commands/README.md` joins the scope (Low) | — |

## 12. Budget

**4 tasks · ~180 LOC of Markdown · 2 review rounds per task.** The two generated assets are counted as files with their NFR-4 byte caps, not as LOC (the SVG's base64 font lines would otherwise dominate). Execute stops and escalates past 5 tasks, ~260 LOC of Markdown, or 3 rounds on any task.

| Task | Surfaces |
|---|---|
| T1 | Figure: Archify candidate → export → `assets/akili-flow.{svg,png}` (FR-1, FR-2 SVG part, NFR-4) |
| T2 | `README.md`: alt text, caveat, capabilities section, *Contents*, *Start Here* (FR-2, FR-3, FR-4, FR-5) |
| T3 | `docs/README.md`, `docs/flow.md` incl. `:7` alt text (FR-2, FR-6) |
| T4 | Command pages, skills index order, `CHANGELOG.md` (FR-7, FR-8) |
