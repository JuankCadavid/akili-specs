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
| Verified at | `c5d6c3d` |
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

The figure (`assets/akili-flow.svg` and `assets/akili-flow.png`) SHALL show: `/akili-constitution` once per project; the per-spec loop propose → specify → execute → test → validate → archive with Kaizen feeding back; the five anytime commands, with `/akili-security`'s hand-off of a confirmed finding to `/akili-propose` (Bug Track); the video track (specify Video Mode → test render evidence → validate final look); the diagram slots (constitution, specify, archive). It SHALL be generated with Archify (user decision).

#### Scenario: Reader opens the README figure

- GIVEN the README at this branch
- WHEN the figure renders
- THEN every command of `ls .claude/commands` appears in it by name
- AND the labels `Deliverable: video` (or "video") and `diagram` appear
- AND IT MUST be a PNG 1800 px wide with no clipped text
- BUT it must NOT show any command or skill that is not packaged, and must NOT present HyperFrames or Archify as packaged

### FR-2 — Figure text alternatives match the figure

README's `<img alt>`, the SVG `<title>`/`<desc>` (where the export allows them) SHALL describe the same elements as FR-1.

#### Scenario: Screen-reader user

- GIVEN `README.md:46`
- WHEN the alt text is read
- THEN it names the constitution, the loop, Kaizen, the five anytime commands with `/akili-security`, the video track and diagram slots
- BUT it must NOT claim anything the figure does not show

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
- AND IT MUST hold for every count claim on the in-scope surfaces (KZ-002)

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
- THEN a section names `diagram-design`, `/akili-constitution` Steps 3–5, `/akili-specify` Step 2.1, `/akili-archive` Step 2, and Archify as optional
- AND IT MUST link only to `docs/commands/` or `docs/skills/` pages, never to `docs/specs/changes/…` (KZ-changes--archify-diagrams-1)

### FR-7 — Command pages name the diagram load points

`docs/commands/akili-constitution.md`, `akili-specify.md` and `akili-archive.md` SHALL each name `diagram-design` at the step that loads it.

#### Scenario: Reader of the specify page

- GIVEN `docs/commands/akili-specify.md`
- WHEN the reader looks at Step 2.1 behavior
- THEN it says architecturally significant designs load `diagram-design`
- BUT it must NOT say diagrams are mandatory or that Archify is required

### FR-8 — Skills index order and CHANGELOG

`docs/skills/README.md`'s inventory SHALL be alphabetical (the `tdd` row moved). `CHANGELOG.md` `[Unreleased]` SHALL carry one *Changed* note describing the refresh and saying npm shows the new README only after the next publish.

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
| NFR-4 | `assets/akili-flow.png` ≤ 400 KB (current 187,727 B) so the npm tarball does not grow materially |

### Defect classes and their gates

| Defect class | Gate |
|---|---|
| Inventory/count mismatch | Membership script over `ls .claude/commands`, `ls .claude/skills` vs each surface (task verification), plus `npm run verify:cli` |
| Restatement drift on `/akili-security` | `test/akili-security-docs.test.js` (automated) |
| Broken relative link | Link check: every `](docs/…)`/`](…md)` target in changed lines exists (task verification) |
| Stale-path link to an active spec | `grep -n "docs/specs/changes" ` over changed shipped docs → 0 |
| Figure content wrong or missing a node | Label grep over the exported SVG text **plus** a visual review of the PNG (no automated check reads a raster: substitute = T6 multimodal review of the rendered PNG by the session model, recorded in `execution.md`) |
| Figure legibility (clipped, overlapping, too small at 900 px) | No automated check — substitute: visual review of the PNG at 900 px width; Archify's `finalize` browser-check covers overlap in its own HTML only |
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
