# Requirements: `diagram-design` — Interactive Methodology Diagrams via Archify

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/archify-diagrams` |
| Depth | Standard |
| Type | Change |
| Approval Mode | gated |
| Status | Draft — awaiting the specify approval gate |
| Date | 2026-10-18 |
| Proposal | `proposal.md` — approved 2026-10-18 by Juan Carlos Cadavid (option C, name `diagram-design`, Mermaid canonical, Archify not vendored, credit to tt-a1i) |
| Gate note | Phase gates 1.3 / 2.5 / 3.3 consolidated into **one** specify approval gate at the user's instruction ("Detente en el gate de aprobación de specify con el resumen", 2026-10-18) — the three documents are presented together; nothing was auto-approved |
| Format source | No `docs/specs/general-setup/` in this repository; format follows the archived precedent `archive/2026-08-10-changes--ai-agent-development-skill/` |

## 2. Executive Summary

Ship one original-authorship **`conditional`** skill, `diagram-design`, that defines the **diagram slots** of every AKILI baseline document and of architecturally significant `design.md` files, keeps each slot as an inline **Mermaid** block (the source of truth), and — only when the developer's environment provides the third-party `archify` skill — renders the slot as a validated, interactive standalone HTML linked under the Mermaid block. Archify is referenced, credited (tt-a1i, MIT), and never copied into the package. Three commands load the skill at their diagram steps.

## 3. Glossary

| Term | Meaning |
|---|---|
| Diagram slot | A named place in an AKILI document that carries one diagram answering one question (e.g. TRD → *C4 Container*) |
| Slot catalog | The table in `diagram-design` listing every slot: document, section, condition, Archify type, Mermaid type |
| Archify | Third-party skill `tt-a1i/archify` (MIT) that renders JSON-IR diagrams as checked standalone HTML; analysed at `208acba`, v3.2.0 |
| Available (Archify) | The `archify` skill is loadable in the current host session, or its directory exists in a known skills root (design §5.3) |
| Interactive view | The Archify HTML file for one slot, plus its candidate JSON |
| Receipt files | Archify's sidecar JSON written beside each HTML (`*.finalize.json`, `*.finalize-summary.json`, `*.delivery.json`, `*.browser-check.json`) |
| Environment-provided skill | A skill a tool or upstream installs, referenced and never vendored (`docs/skills/governance.md:17`) |

## 4. System Context & Scope

Current behavior (cited at `854547f`):

- The only diagram any command requires is the TRD's "C4 Context + Container with legends" (`.claude/commands/akili-constitution.md:256`); `grep -rn -i "diagram\|flowchart\|mermaid" .claude/commands` returns **0 hits**.
- "Mermaid is the default renderer in AKILI docs" is stated once, in `.claude/skills/software-architect/references/views-documentation.md:14`.
- The installer copies every directory under `.claude/skills/` recursively to all five targets (`bin/akili.js:50` `copyTreeSync`, called at `:670`), so a new skill needs no installer change.
- `test/install-cursor.test.js:245` asserts exactly **199** packaged skill files; `docs/cli.md:183`, `:195`, `:216` state "24 packaged skills".

**In scope:** the new skill directory; conditional load lines in `/akili-constitution` Steps 3–5, `/akili-specify` Step 2.1, `/akili-archive` Step 2; one sentence in `software-architect`'s `views-documentation.md`; governance, skills docs, README install note, `docs/cli.md` counts, the install-test literal, `CHANGELOG.md`.
**Out of scope:** vendoring any Archify file; installer code; `/akili-audit` diagram drift; Archify's explainer mode; re-drawing this repository's own docs; `/akili-archive` Step 3 writes (see design DD-6).

## 5. Stakeholders / Personas

| Persona | Interest |
|---|---|
| Developer running AKILI with Archify installed | Interactive, checked diagrams in PRD/UX/TRD/design without extra prompting |
| Developer without Archify (or on Antigravity, or without Chrome) | Same documents, complete Mermaid, no errors, no false "interactive" claims |
| Reviewer on GitHub | Diagrams readable in the PR diff (Mermaid renders inline) |
| Maintainer (Juan Carlos) | Governance-compliant skill, no third-party payload or licence surface in the package |
| Archify author (tt-a1i) | Correct attribution; their update/installer flow untouched |

## 6. Functional Requirements

### FR-1: Packaged original-authorship conditional skill

The package SHALL ship `.claude/skills/diagram-design/SKILL.md` with frontmatter `name: diagram-design`, a trigger-keyword `description`, `license: MIT`, `metadata.author: Juan Carlos Cadavid — jcadavid.com`, `metadata.binding: conditional`, `metadata.version`, and an `inspired-by:` entry crediting Archify (tt-a1i, MIT, `https://github.com/tt-a1i/archify`), the C4 model, and Mermaid.

#### Scenario: Frontmatter matches the governance original-authorship variant

- GIVEN the frontmatter schema in `docs/skills/governance.md` (original-authorship variant)
- WHEN `SKILL.md` frontmatter is read
- THEN every field above is present with `binding: conditional`
- BUT it must NOT carry `adapted-by`, `adapted-for`, or `source` (no upstream file is adapted)
- AND IT MUST name Archify, its author `tt-a1i`, its licence `MIT`, and its repository URL

#### Scenario: No Archify file ships

- GIVEN the packed tarball (`npm pack --dry-run --json`)
- WHEN its file list is searched for Archify artifacts (`archify.mjs`, `renderers/`, `schemas/*.schema.json`, `brand-marks`, `THIRD_PARTY_NOTICES`)
- THEN there are zero matches
- AND IT MUST hold that the skill directory contains only files authored for AKILI

### FR-2: Slot catalog

The skill SHALL define a slot catalog with one row per slot naming: target document and section, load condition, Archify type, Mermaid diagram type, and the question the diagram answers. The catalog SHALL cover at least:

| Document | Section | Slot | Condition |
|---|---|---|---|
| `docs/prd.md` | User Stories | Core user journey | when the product has a multi-step primary flow |
| `docs/ux-ui/design.md` | Primary User Flows | One flow per primary flow | when the product has a UI |
| `docs/ux-ui/design.md` | Navigation Model | Screen hierarchy | when the product has ≥ 2 screens |
| `docs/trd/trd.md` | Architecture Overview & Decisions | C4 Context | always |
| `docs/trd/trd.md` | Architecture Overview & Decisions | C4 Container | always |
| `docs/trd/trd.md` | Architecture Overview & Decisions | Deployment view | when there is more than one runtime environment or host |
| `docs/trd/trd.md` | Data Model & Entities | Entity-relationship | when the system persists structured data |
| `docs/trd/trd.md` | Backend Workflows & Business Rules | Critical runtime sequence (1–3) | when a flow crosses ≥ 3 participants or is asynchronous |
| `docs/trd/trd.md` | Backend Workflows & Business Rules | Entity lifecycle | when an entity has ≥ 3 states |
| spec `design.md` | Architecture Overview | Changed-component view and any of sequence / lifecycle / ERD the change alters | when `/akili-specify` classes the design as architecturally significant |

#### Scenario: TRD always carries both C4 slots

- GIVEN `/akili-constitution` Step 5 drafts a TRD
- WHEN the agent applies the slot catalog
- THEN the TRD carries a C4 Context and a C4 Container diagram, each with a legend
- BUT it must NOT add a conditional slot whose condition is false (no empty or placeholder diagrams)
- AND IT MUST record, for each conditional slot it skips, nothing in the document (absence is the signal) — the catalog, not the doc, owns the conditions

### FR-3: Mermaid is the canonical source

Every filled slot SHALL be an inline fenced `mermaid` block with a legend, placed in the slot's section. The Mermaid block is the source of truth; an interactive view is derived from it.

#### Scenario: Slot without Archify

- GIVEN Archify is not available
- WHEN a slot is filled
- THEN the document contains the Mermaid block with a legend and no interactive-view link
- AND IT MUST NOT state or imply that an interactive view exists

### FR-4: Interactive render when Archify is available

When Archify is available, each filled slot SHALL be rendered through Archify's own authoring and delivery procedure (its `SKILL.md`), with the output location named by `diagram-design`: baseline documents → `docs/diagrams/<doc>-<slot>.json` + `.html`; spec documents → `docs/specs/<spec-path>/diagrams/<slot>.json` + `.html`. A single link line SHALL follow the Mermaid block, naming the HTML and crediting Archify.

#### Scenario: Successful render

- GIVEN Archify is available and a browser is installed
- WHEN the TRD C4 Container slot is filled
- THEN `docs/diagrams/trd-c4-container.json` and `.html` exist and Archify's delivery reports all gates passed
- AND the line after the Mermaid block links the HTML by relative path and credits "Archify (tt-a1i, MIT)"
- BUT receipt files must NOT be committed — the skill ensures a `.gitignore` rule covers them in the diagrams folders
- AND IT MUST reuse the slot's existing JSON/HTML paths on re-render (one interactive view per slot, never timestamped duplicates)

#### Scenario: Rendered without the browser gate

- GIVEN Archify is available but no Chrome/Chromium/Edge is found
- WHEN the slot renders and Archify reports its browser check as skipped
- THEN the HTML is kept and linked
- AND IT MUST annotate the link line "browser check not run" and never report the view as verified

### FR-5: Fallback never blocks

If Archify is unavailable, or its delivery fails after its own repair limit, the slot SHALL stand as Mermaid only, the phase SHALL continue, and the command's report SHALL name the slots left without an interactive view and why (one line).

#### Scenario: Archify delivery fails

- GIVEN Archify is available
- WHEN delivery fails after Archify's repair limit
- THEN no HTML link is written for that slot and any partial output for it is deleted
- AND the phase continues to its next step
- BUT it must NOT retry beyond Archify's own repair limit

### FR-6: No stale interactive view

When a slot's Mermaid block changes, its interactive view SHALL be re-rendered in the same run, or its link line and files SHALL be removed. An interactive view whose content diverges from its Mermaid block is a defect.

#### Scenario: Mermaid edited, Archify gone

- GIVEN a slot with an existing interactive view
- WHEN its Mermaid block is edited in a session where Archify is unavailable
- THEN the link line and the slot's `.json`/`.html` are removed
- AND IT MUST report the removal in the command's summary

### FR-7: Archify guard-rails inside AKILI

Inside any AKILI command, `diagram-design` SHALL instruct the agent to:

- never offer Archify's explainer mode and never write an `[archify explainer: …]` line into any rules file;
- never install, update, snooze, or ignore Archify updates on its own initiative, and relay an update notice at most once per command run, as information;
- use no third-party brand marks unless the user asks for them;
- delegate every Archify command, flag, and repair rule to Archify's own `SKILL.md` — `diagram-design` names outcomes and locations, never Archify CLI flags.

#### Scenario: Explainer offer suppressed

- GIVEN Archify's own instructions offer the proactive explainer mode after a page
- WHEN a diagram is rendered during `/akili-constitution`
- THEN no explainer offer appears and no global rules file is modified
- BUT it must NOT alter the user's existing Archify configuration or environment variables

### FR-8: Command wiring

The following SHALL load `diagram-design` with one conditional line each, placed at the step that writes the slot:

| Command | Step | Line obliges |
|---|---|---|
| `/akili-constitution` | Step 3 (PRD) | fill the PRD slots whose condition holds |
| `/akili-constitution` | Step 4 (UX/UI) | fill the UX/UI slots whose condition holds |
| `/akili-constitution` | Step 5 (TRD) | fill the TRD slots (C4 Context + Container always) |
| `/akili-specify` | Step 2.1 (architecturally significant designs) | fill the `design.md` slots the change alters |
| `/akili-archive` | Step 2 (summary) | list the spec's diagram links, and as a follow-up each baseline slot the spec's design made stale |

`software-architect`'s `views-documentation.md` SHALL keep "Mermaid is the default renderer" and point to `diagram-design` for slots, storage, and the interactive view.

#### Scenario: Wiring is conditional, not stack

- GIVEN `docs/skills/governance.md` binding rules
- WHEN each wired line is read
- THEN it names `diagram-design` and states the condition under which it loads
- BUT no command line may name `archify` as a skill to load — Archify is reached only through `diagram-design`
- AND IT MUST leave `/akili-archive` Step 3 unchanged (no new pending-item `Kind`)

### FR-9: Governance, docs, CHANGELOG

- `docs/skills/governance.md`: `diagram-design` added to the `conditional` row; `archify` added as an environment-provided example.
- `docs/skills/diagram-design.md` exists; `docs/skills/README.md` has a truthful row (Binding `conditional`, Origin, Wired In).
- `README.md` documents the optional Archify install (`npx skills add tt-a1i/archify`) as the user's choice, with credit and licence.
- `docs/cli.md` counts updated from 24 to 25 packaged skills at every site.
- `CHANGELOG.md` → `[Unreleased]` entry, every clause quote-checked against shipped text (KZ-002).

### FR-10: Package and test hygiene

- `test/install-cursor.test.js` literal 199 and its count comments updated to the real post-change numbers; `test/fixtures/doctor-codex-baseline.txt` updated for the new skill (amended 2026-10-18); `npm test` passes.
- `npm run pack:dry-run` grows by ≤ 20 KB unpacked; `npm run verify:cli` lists `diagram-design`; `git diff --check` is clean.

## 7. Non-Functional Requirements

| ID | Requirement | Measure |
|---|---|---|
| NFR-1 | Size | `SKILL.md` ≤ 8 KB; whole skill directory ≤ 16 KB (`wc -c`) |
| NFR-2 | Progressive disclosure | The slot catalog lives in `references/slot-catalog.md`, read only at a slot step |
| NFR-3 | Host-agnostic prose | No host-specific path in command lines; host skill roots appear only in the skill's availability check |
| NFR-4 | No network from AKILI | No command or skill text runs an install, `npx`, or fetch; Archify's own update check is Archify's behaviour, documented |
| NFR-5 | Model-agnostic | No `model:` key anywhere in the change |

## 8. Defect Classes and Their Gates

| Defect class | Gate | Automated? |
|---|---|---|
| A wired line missing or at the wrong step | `grep -n "diagram-design"` per command, with the step heading above each hit | Yes |
| Inventory/count drift (24→25, 199→N) | `npm test` (install test) + `grep -rn "24 packaged"` | Yes |
| Frontmatter non-compliance | Static read against governance schema | Yes (grep) |
| Archify payload shipped | `npm pack --dry-run --json` file list search (FR-1) | Yes |
| **Skill text contradicts Archify's real behaviour** (paths, receipts, browser-skipped, failure) — the dominant class | **Executed walkthrough** in a scratch project with Archify present, absent, and browser-less (T7), including a held-out slot type | No — executed procedure, judged at the HITL pause |
| Visual quality of rendered diagrams | Archify's own gates + human look at the HITL pause; perceptual review otherwise **accepted risk** | No |
| CHANGELOG/doc clause overstates shipped text | Quote-check each clause at HEAD (KZ-002) | No — Reviewer |

## 9. Requirement ID Index

| ID | Title |
|---|---|
| FR-1 | Packaged original-authorship conditional skill |
| FR-2 | Slot catalog |
| FR-3 | Mermaid is the canonical source |
| FR-4 | Interactive render when Archify is available |
| FR-5 | Fallback never blocks |
| FR-6 | No stale interactive view |
| FR-7 | Archify guard-rails inside AKILI |
| FR-8 | Command wiring |
| FR-9 | Governance, docs, CHANGELOG |
| FR-10 | Package and test hygiene |
| NFR-1…5 | Size, progressive disclosure, host-agnostic, no network, model-agnostic |
