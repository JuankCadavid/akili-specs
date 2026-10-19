# Requirements: public docs refresh for 2.34.1 — security, video, diagrams, lifecycle figure

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-refresh-2-34` |
| Depth | **Standard** (docs-only, four surfaces plus one figure) |
| Type | Change |
| Deliverable | software — kind: documentation plus a figure (Video Mode does not apply) |
| Approval Mode | `pre-approved (Juan Carlos Cadavid, 2026-10-19)` — inherited from `proposal.md`. Escalations still stop |
| Status | **Approved** — Phase 1 gate: `auto-approved (pre-approved mode)`, 2026-10-19 |
| Date | 2026-10-19 |
| Source | `proposal.md` (approved `c5d6c3d`: Option A for docs, Archify for the figure) |
| Format precedent | `docs/specs/archive/2026-10-19-bugfix--update-check-deadline/requirements.md`. No `docs/specs/general-setup/`, `docs/prd.md` or `docs/trd/` in this repo (`ls docs docs/specs`, as run 2026-10-19) |
| Verified at | `c5d6c3d`; re-stamped `729d39f` after judgment-day (only spec files changed between them: `git diff --stat c5d6c3d 729d39f`) |
| Amended | 2026-10-19 at T1 (user decision): FR-1 font floor ≥ 5.5 px / labels ≥ 8 px at 900, README links the full-size PNG; FR-2 title/desc wording corrected. 2026-10-19 after judgment-day (`judgment.md`): FR-1 scenario/qualifiers, FR-2 title/desc injection, FR-4 count rule, FR-6/FR-7 anchors and the archive condition, FR-8 wording, NFR-4 SVG cap, §7 tier wording |
| Deviations from proposal | PNG size: the proposal's success criterion said 1800×1200; the figure's aspect now comes from the Archify layout, so the PNG is **1800 px wide**, height per aspect (FR-1). README renders it at `width="900"` either way |

## 2. Executive Summary

The README (GitHub and npm), the docs hub, `docs/flow.md`, the command pages and the skills index SHALL tell a reader that AKILI 2.34.1 audits repository security (`/akili-security`), can carry a spec whose deliverable is a rendered video, and fills diagram slots — and the lifecycle figure SHALL show all three. Every inventory SHALL match what `akili doctor` installs: 12 commands, 27 skills.

## 3. Glossary

| Term | Meaning |
|---|---|
| Anytime command | A command outside the per-spec loop: `/akili-resume`, `/akili-audit`, `/akili-quick`, `/akili-seo`, `/akili-security` |
| Video track | A spec whose Document Control records `Deliverable: video`; packaged bridge `video-production`, rendering by user-installed HyperFrames |
| Diagram slots | Diagram positions in the baseline docs and in `design.md`; packaged skill `diagram-design` writes Mermaid; Archify (user-installed) adds an optional interactive view |
| Restatement | A sentence in a broad doc that repeats a rule owned by a command or skill page |

## 4. System Context & Scope

Current state, each claim cited as run at `c5d6c3d` (details in `proposal.md` → *Problem / Current Behavior*):

- The figure lists four anytime commands and no `/akili-security`, video or diagrams (`grep -o '<text[^>]*>[^<]*</text>' assets/akili-flow.svg`).
- README *Contents* lists 11 commands and 24 skills; missing `akili-quick.md`, `diagram-design`, `security-audit`, `tdd` (membership loop over `ls .claude/commands`, `ls .claude/skills` against `README.md:72-118`).
- `docs/README.md` names neither `/akili-quick` nor `/akili-security` (membership loop).
- `docs/flow.md` never names `diagram-design` (membership loop); its *Primary Lifecycle* block names only `/akili-audit` as an independent command (`sed -n 40,86p docs/flow.md`).
- No page under `docs/commands/` mentions diagrams (`grep -n -i diagram docs/commands/*.md` → 0 hits).
- `akili doctor --tool claude` → `ok 47` = 12 + 27 + 8 resources (as run).
- `npm test` → 413 pass, 0 fail (as run at `c5d6c3d`).

In scope: `README.md`, `docs/README.md`, `docs/flow.md`, `docs/commands/{akili-constitution,akili-specify,akili-archive}.md`, `docs/skills/README.md`, `assets/akili-flow.{svg,png}`, `CHANGELOG.md`.
Out of scope: everything else (see `proposal.md` → *Non-Goals*).

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Evaluator on GitHub/npm | Sees in the first screen what AKILI covers |
| Adopter | Knows where each capability fires in the lifecycle and what it must install |
| Maintainer | Inventories match the package; restatements do not drift from the command pages |

## 6. Functional Requirements

### FR-1 — Lifecycle figure shows the 2.34.1 surface

The figure (`assets/akili-flow.svg` and `assets/akili-flow.png`) SHALL show: `/akili-constitution` once per project; the per-spec loop propose → specify → execute → test → validate → archive with Kaizen feeding back; the five anytime commands, with `/akili-security`'s hand-off of a confirmed finding to `/akili-propose` (Bug Track); the video track (specify Video Mode → test render evidence → validate final look); the diagram slots (constitution Steps 3–5, specify Step 2.1 for architecturally significant designs, archive Step 2 when the spec has diagram slots). It SHALL be generated with Archify (user decision); if Archify cannot produce it, execution stops and asks the user — no silent fallback.

#### Scenario: Reader opens the README figure

- GIVEN `assets/akili-flow.png` and `assets/akili-flow.svg` in the working tree (the README `<img>` points at the `master` raw URL, so the branch figure is not visible through it)
- WHEN the figure is opened
- THEN every command of `ls .claude/commands` appears in it by name
- AND the labels `Deliverable: video` (or "video") and `diagram` appear
- AND IT MUST be a PNG 1800 px wide, with every text element's font size ≥ 5.5 px and every node label ≥ 8 px when the figure is displayed 900 px wide (read from the SVG: font-size × 900 / viewBox width), and no text clipped or overlapped in the visual review; the README image links to the full-size PNG so the small text can be read at 1800 px *(amended 2026-10-19, user decision "Aceptar y ajustar spec": the original ≥ 10 px floor is unreachable with Archify, which caps sublabels at 8 px on a ≥ 1064 px canvas — `execution.md` T1)*
- BUT it must NOT show any command or skill that is not packaged, and must NOT present HyperFrames or Archify as packaged

### FR-2 — Figure text alternatives match the figure

Both figure sites — README's `<img alt>` (`README.md:46`, PNG) and `docs/flow.md:7`'s image alt (SVG) — and the SVG `<title>`/`<desc>` (where the export allows them) SHALL describe the same elements as FR-1. The SVG SHALL render standalone as an image: no external resource fetch — no `<script>`, no `href`/`src`/`url(` pointing at `http(s)`, no `@import`; namespace declarations (`xmlns`) and comments are exempt; embedded `data:` fonts are allowed. Archify's export carries `role="img"`, a `<title>` and a generic `<desc>`; the `<desc>` is replaced with the alt text and the `<title>` set to "AKILI-SPECS methodology lifecycle" after export *(corrected 2026-10-19, `execution.md` T1)*.

#### Scenario: Screen-reader user

- GIVEN `README.md:46` or `docs/flow.md:7`
- WHEN the alt text is read
- THEN it names the constitution, the loop, Kaizen, the five anytime commands with `/akili-security`, the video track and diagram slots
- BUT it must NOT claim anything the figure does not show
- AND IT MUST be the same text at both sites

### FR-3 — README states the three capabilities

README SHALL carry one compact section, placed before *Install*, with one row each for security audits, video deliverables and diagrams: what it does, where it fires in the lifecycle, what the user installs (nothing / HyperFrames / Archify optional), and a link to the command or skill page. *Start Here* SHALL name `/akili-security` as an anytime command whose confirmed findings enter the Bug Track.

#### Scenario: Evaluator scans the README

- GIVEN the README
- WHEN the reader reaches the capabilities section
- THEN each row links to `docs/commands/akili-security.md`, `docs/skills/video-production.md`, `docs/skills/diagram-design.md` respectively
- AND IT MUST say `/akili-security` is not supported on native Windows
- BUT it must NOT restate a `/akili-security` rule in new words: any `/akili-security` line that names the run directory says "run directory (always outside the target)", any routing slug reads exactly `bugfix/security-<YYYY-MM-DD>-r<N>-s<n>` (pinned by `test/akili-security-docs.test.js`)

### FR-4 — README inventory equals the package

README *Contents* SHALL list exactly the 12 files of `.claude/commands/` and the 27 directories of `.claude/skills/`.

#### Scenario: Maintainer audits the list

- GIVEN the *Contents* section
- WHEN it is compared with `ls .claude/commands` and `ls .claude/skills`
- THEN the sets are equal (no missing, no extra)
- AND IT MUST hold for any count of commands or skills written on an in-scope surface: none exists today, and a new one is written only with the membership check run beside it (KZ-002)

### FR-5 — Windows caveat next to the badge

The README SHALL qualify "Windows supported" with a one-line note that `/akili-security` needs WSL, Linux or macOS.

#### Scenario: Windows user

- GIVEN the badge block
- WHEN a Windows user reads it
- THEN the caveat is visible within the header block
- BUT it must NOT remove the Windows badge (the rest of AKILI supports Windows)

### FR-6 — Docs hub and flow page cover the three capabilities

`docs/README.md` SHALL list `/akili-quick` and `/akili-security` among the anytime commands and point to the video and diagram pages. `docs/flow.md` *Primary Lifecycle* SHALL show `/akili-security` beside `/akili-audit`, and the page SHALL carry a short section for the video track and one for diagram slots, each naming the commands/steps where it fires.

#### Scenario: Adopter follows the flow page

- GIVEN `docs/flow.md`
- WHEN the adopter looks for diagrams
- THEN a section names `diagram-design`, `/akili-constitution` Steps 3–5, `/akili-specify` Step 2.1 (architecturally significant designs), `/akili-archive` Step 2 (when the spec has a `diagrams/` folder or slot), and Archify as optional
- AND IT MUST link only to `docs/commands/` or `docs/skills/` pages, never to `docs/specs/changes/…` (KZ-changes--archify-diagrams-1)

### FR-7 — Command pages name the diagram load points

`docs/commands/akili-constitution.md` (*Skill Map Scaffolding* skill list), `akili-specify.md` (*Key Rules*) and `akili-archive.md` (*Archive Summary*) SHALL each name `diagram-design` and the step that loads it, with its condition.

#### Scenario: Reader of the specify page

- GIVEN `docs/commands/akili-specify.md`
- WHEN the reader reads *Key Rules*
- THEN one rule says architecturally significant designs load `diagram-design` at Step 2.1
- BUT it must NOT say diagrams are mandatory or that Archify is required

### FR-8 — Skills index order and CHANGELOG

`docs/skills/README.md`'s inventory SHALL be alphabetical (the `tdd` row moved). `CHANGELOG.md` `[Unreleased]` SHALL replace the `### Notes` placeholder with one `### Changed` note describing the refresh, saying the README text on npm updates at the next publish while the figure (loaded from the `master` raw URL) updates when `master` does.

#### Scenario: Release preparer

- GIVEN `CHANGELOG.md`
- WHEN the next release is prepared
- THEN `[Unreleased]` holds the note and no longer says "No unreleased changes yet."

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | `npm test` stays at 413 pass, 0 fail; `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass |
| NFR-2 | No file under `.claude/`, `bin/`, `test/`, `package.json`, `docs/model-routing.md` changes; no Archify file or HTML enters the repo (`git diff --stat c5d6c3d`) |
| NFR-3 | Local commits only, `[SPEC:changes/docs-refresh-2-34]` prefix; no push, tag, release or publish |
| NFR-4 | `assets/akili-flow.png` ≤ 400 KiB = 409,600 B (current 187,727 B) and `assets/akili-flow.svg` ≤ 150 KiB = 153,600 B (current 6,449 B; Archify embeds ~95 KB of base64 fonts); `npm run pack:dry-run` still lists both |

### Defect classes and their gates

| Defect class | Gate |
|---|---|
| Inventory/count mismatch | Membership script over `ls .claude/commands`, `ls .claude/skills` vs each surface (task verification), plus `npm run verify:cli` |
| Restatement drift on `/akili-security` | `node --test test/akili-security-docs.test.js` after every task that adds a line matching `/akili-security\|security-audit\|audits\/security-/` (alt text, caveat, table row, Start Here, flow) |
| Broken relative link | Link check: every `](docs/…)`/`](…md)` target in changed lines exists (task verification) |
| Stale-path link to an active spec | `grep -n "docs/specs/changes" ` over changed shipped docs → 0 |
| Figure content wrong or missing a node | Label grep over the exported SVG text **plus** a visual review of the PNG (no automated check reads a raster: substitute = tier-T6 multimodal review of the rendered PNG by the session model, recorded in `execution.md`) |
| Figure legibility (clipped, overlapping, too small at 900 px) | Font-size floor computed from the SVG (FR-1) plus the visual review of the PNG at 900 px width for clipping/overlap; Archify's `finalize` browser-check covers overlap in its own HTML only |
| Alt text plausible but false | No automated check — substitute: alt text compared node-by-node with the figure during the visual review |
| Markdown table broken | Render check: column count per row equal (task verification) |

## 8. Requirement ID Index

| ID | Title |
|---|---|
| FR-1 | Lifecycle figure shows the 2.34.1 surface |
| FR-2 | Figure text alternatives match the figure |
| FR-3 | README states the three capabilities |
| FR-4 | README inventory equals the package |
| FR-5 | Windows caveat next to the badge |
| FR-6 | Docs hub and flow page cover the three capabilities |
| FR-7 | Command pages name the diagram load points |
| FR-8 | Skills index order and CHANGELOG |
| NFR-1…4 | Verification, file scope, commit rules, PNG size |
