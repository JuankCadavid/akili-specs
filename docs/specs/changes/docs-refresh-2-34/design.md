# Design: public docs refresh for 2.34.1

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-refresh-2-34` |
| Depth | Standard |
| Status | **Approved** — Phase 2 gate: `auto-approved (pre-approved mode)`, 2026-10-19, after `judgment-day` (see `judgment.md`) |
| Requirements | `requirements.md` (FR-1…FR-8, NFR-1…NFR-4) |
| Verified at | `c5d6c3d` |
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
| `README.md` *Contents* | Add `akili-quick.md`, `diagram-design`, `security-audit`, `tdd` in alphabetical order | FR-4 |
| `README.md` *Start Here* | One paragraph: the anytime commands, `/akili-security` → Bug Track | FR-3 |
| `docs/README.md` | Quick Flow followed by anytime-command lines incl. `/akili-quick`, `/akili-security`; two pointer lines (video, diagrams) | FR-6 |
| `docs/flow.md` | *Primary Lifecycle* block gains a `/akili-security` entry under *Independent Auditing*; new §10 *Video Deliverables* and §11 *Diagram Slots* under *Advanced Engineering Capabilities* | FR-6 |
| `docs/commands/akili-{constitution,specify,archive}.md` | One line each naming `diagram-design` at its step | FR-7 |
| `docs/skills/README.md` | Move the `tdd` row after `tailwind-design-system` | FR-8 |
| `CHANGELOG.md` | `[Unreleased]` → `### Changed` note | FR-8 |

### Figure content (FR-1)

Archify `workflow`, five lanes, left to right:

| Lane | Nodes |
|---|---|
| Once per project | `/akili-constitution` (PRD · UX/UI · TRD · personas · routing · Skill Map) |
| Per-spec loop | `/akili-propose` → `/akili-specify` → `/akili-execute` → `/akili-test` → `/akili-validate` → `/akili-archive` → Kaizen (return edge to propose) |
| Video track (`Deliverable: video`) | Video Mode (specify) → render evidence (test) → final look + delivery render (validate); note "video-production + your HyperFrames install" |
| Diagram slots | Mermaid slots at constitution Steps 3–5 · specify Step 2.1 · archive Step 2; note "diagram-design; Archify view optional" |
| Anytime | `/akili-resume` · `/akili-audit` · `/akili-quick` · `/akili-seo` · `/akili-security` → edge "confirmed finding" to `/akili-propose` |

The SVG must be self-contained (no `<script>`, no external `href`/`url(http`, no web-font import) because `docs/flow.md:7` embeds it as an image. Export path: `finalize` → open the HTML with `playwright-cli` → viewer export menu → full-diagram SVG and PNG (light theme) → PNG normalized to 1800 px wide with `magick` when the export differs. All Archify working files stay in the scratchpad.

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
| DD-4 | Figure via Archify workflow export; fallback hand-authored SVG only if export fails (P-5), recorded in `execution.md` | Hand SVG first | user decision |
| DD-5 | Light theme export | Dual-theme SVG as the PNG source — `rsvg-convert` handling of the theme CSS is unknown; README background on npm is light | P-6 |
| DD-6 | Inventory and count checks are run as a one-off membership script in each task's verification, not a new test | A shipped inventory test — `test/` is out of scope (NFR-2) | KZ-002 |
| DD-7 | No link into `docs/specs/` from shipped docs | Linking archived specs | KZ-changes--archify-diagrams-1 |

**Reversion challenge (Step 2.3):** DD-4 replaces the shipped figure. "What does removing it break?" — the README `<img>` URL (`raw.githubusercontent.com/…/master/assets/akili-flow.png`) keeps the same path, so nothing breaks; the old figure's content is a subset of FR-1's. The file name stays. The only other reference is `docs/flow.md:7`, which embeds the SVG (P-7): the exported SVG must therefore render standalone as an image — no script, no external font or URL — and that alt text changes too.

## 11. Premise Ledger

Verified 7 · `UNVERIFIED` 1 (High 1, Low 0).
Blast-radius triggers: `consumer` fires (the figure file is referenced, and README/flow lines are pinned by tests); `live-path` and `shared-state` do not apply — no user action dispatches through code and no state is changed.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | Installs carry 12 commands and 27 skills | existence | `ls .claude/commands \| wc -l` → 12; `ls .claude/skills \| wc -l` → 27; `node bin/akili.js doctor --tool claude` → `ok 47` (12+27+8) | `c5d6c3d` | FR-4 counts change (Low) | — |
| P-2 | README *Contents* misses `akili-quick.md`, `diagram-design`, `security-audit`, `tdd` | existence | membership loop over `sed -n 66,118p README.md` → those four | `c5d6c3d` | T2 scope changes (Low) | — |
| P-3 | `test/akili-security-docs.test.js` checks every README / flow / commands-README line matching `/akili-security\|security-audit\|audits\/security-/` for slug form, run-directory wording, git commands and paraphrased controls | consumer | `test/akili-security-docs.test.js:43-64,99-130,174-210` | `c5d6c3d` | DD-1 wording rules change (High) | — |
| P-4 | No HyperFrames or Archify directory is packaged | existence | `ls .claude/skills \| grep -i -E "hyperframes\|archify"` → 0 | `c5d6c3d` | DD-2 wrong (High) | — |
| P-5 | Archify's viewer exports a full-diagram SVG and PNG that a headless `playwright-cli` session can trigger and save | data-env | `UNVERIFIED — confirm at source before relying on it`. Documented: `references/viewer-runtime.md:38` ("download a dual-theme SVG", "full-diagram PNG") | — | DD-4 falls back to a hand SVG (High) | T1 first step |
| P-6 | `rsvg-convert` and `magick` exist | existence | `command -v rsvg-convert magick` → `/opt/homebrew/bin/…` both | `c5d6c3d` | PNG normalization changes (Low) | — |
| P-7 | The figure is referenced at exactly two sites: `README.md:46` (PNG, by raw URL) and `docs/flow.md:7` (SVG, relative `../assets/akili-flow.svg`, Markdown image — GitHub renders it as an image, so scripts and external resources do not load) | consumer | `grep -rn akili-flow README.md docs/*.md docs/commands docs/skills bin test .claude` → `docs/flow.md:7`, `README.md:46` | `c5d6c3d` | a third alt-text site (Low) | — |
| P-8 | `test/diagram-design.test.js` pins README's Archify paragraph (`npx skills add tt-a1i/archify`, `[Archify](https://github.com/tt-a1i/archify) by tt-a1i (MIT licence)`, `never ships or installs it`) and the `diagram-design` skills-index row cells | consumer | `test/diagram-design.test.js:400-415` | `c5d6c3d` | T2/T4 must keep them (Low) | — |

## 12. Budget

**4 tasks · ~220 LOC (docs + 2 binary assets) · 2 review rounds per task** (rules-free docs, but restatement tests apply). Execute stops and escalates past 5 tasks, ~320 LOC, or 3 rounds on any task.
