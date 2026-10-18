# Proposal: Interactive Methodology Diagrams with Archify

## 1. Document Control

| Field | Value |
|---|---|
| Type | Change |
| Spec Path | `changes/archify-diagrams` |
| Slug | `archify-diagrams` — derived from free-text argument ("Skill Archify … que con este skill se creen todos los diagramas de la metodología") |
| Approval Mode | gated |
| Status | Draft — awaiting approval (Juan Carlos Cadavid) |
| Date | 2026-10-18 |
| Author | Juan Carlos Cadavid (intent) / agent (draft) |
| Depends on | none |
| Parallel-safe | yes — touches command prose, one new skill, governance/skills docs; no `bin/` code in the recommended option |
| Upstream analysed | `tt-a1i/archify` @ `208acba` (2026-10-18, PR #1002), skill `archify/` v3.2.0, MIT |

## 2. Intent

**Recommendation in one line:** ship a thin, AKILI-authored `conditional` skill (working name `diagram-design`) that owns *which* diagrams each AKILI artifact carries and *how* they are stored, and that renders them as interactive Archify HTML **when the developer's environment provides the `archify` skill** — keeping Mermaid inline as the source of truth and the fallback. Do **not** vendor Archify's 5.3 MB runtime into the package.

The user goal: every diagram the methodology produces (architecture, flows, TRD/system design, PRD) becomes a quality interactive diagram instead of a static Mermaid block.

## 3. Problem / Current Behavior

| # | Current behavior | Evidence |
|---|---|---|
| P1 | The only diagram the commands ask for is the TRD's **C4 Context + Container** view. | `.claude/commands/akili-constitution.md:256` |
| P2 | Mermaid is the declared default renderer, stated once, inside a skill reference — not in any command. | `.claude/skills/software-architect/references/views-documentation.md:14` ("Mermaid is the default renderer in AKILI docs.") |
| P3 | The PRD (Step 3), UX/UI design (Step 4), `/akili-specify`'s `design.md`, and `/akili-archive`'s summary have **no diagram slot**: the words `diagram`, `flowchart`, `mermaid` do not occur in any of them. | `grep -rn -i "diagram\|flowchart\|mermaid" .claude/commands` → only constitution `:239`/`:256` (C4) |
| P4 | Governance already forbids vendoring a skill whose own tool serves a version-matched copy. | `docs/skills/governance.md:17`, `:23` |
| P5 | Codex and Cursor install AKILI skills into the **shared** `~/.agents/skills` root — the same root Archify's own installer (`npx skills add tt-a1i/archify`) targets for Codex. | `bin/akili.js:127`, `:139`; upstream `README_EN.md:444` |

So today diagrams are optional, static, inconsistent across phases, and there is no contract for what a "methodology diagram" is.

## 4. Proposed Outcome

- Every AKILI baseline doc and every architecturally significant `design.md` has **named diagram slots** (which diagram type, which question it answers).
- Each slot is written as an inline **Mermaid block** (renders on GitHub, diffable, zero dependencies) and, when `archify` is available, also rendered as a **validated, interactive standalone HTML** (dark/light, motion, path exploration, SVG/PNG export) linked right under the Mermaid block.
- A developer without Archify (or without Chrome/Node) loses nothing: Mermaid remains complete. The same committed `## Skill Map` works for both.
- Archify is credited (author `tt-a1i`, MIT) in the new skill and its docs page; its install is documented, never automated.

## 5. Scope

| Deliverable | Location |
|---|---|
| New skill: diagram slot catalog per artifact, Mermaid→Archify type mapping, storage layout, fallback rules, Archify guard-rails inside AKILI | `.claude/skills/diagram-design/SKILL.md` (+ one `references/` file if the slot catalog exceeds the body budget) |
| Conditional wiring — PRD core-flow slot | `.claude/commands/akili-constitution.md` Step 3 |
| Conditional wiring — UX/UI navigation/screen-flow slot | `.claude/commands/akili-constitution.md` Step 4 |
| Conditional wiring — TRD: C4 Context + Container, deployment, critical sequence, data model (ERD), key state machines | `.claude/commands/akili-constitution.md` Step 5 |
| Conditional wiring — `design.md` diagrams for architecturally significant changes | `.claude/commands/akili-specify.md` (design phase) |
| Archive: summary links the spec's diagrams; TRD sync refreshes the affected baseline diagram | `.claude/commands/akili-archive.md` Steps 2–3 |
| Point `software-architect`'s "Mermaid is the default renderer" sentence at the new skill | `.claude/skills/software-architect/references/views-documentation.md:14` |
| Governance: add `diagram-design` to the `conditional` row; add `archify` to the environment-provided examples | `docs/skills/governance.md` |
| Docs: `docs/skills/diagram-design.md`, row in `docs/skills/README.md`, install note for Archify | `docs/skills/`, `README.md` |
| `CHANGELOG.md` → `Unreleased` | `CHANGELOG.md` |

## 6. Non-Goals

- **Vendoring Archify** (its renderers, `bin/`, brand marks, examples) into `.claude/skills/` — see §10 option A for the costed alternative.
- Installing Archify from `akili install` (no `npx` call, no network from the installer).
- Re-drawing the diagrams of *this* repository's own docs (`docs/flow.md` etc.) — a possible follow-up `/akili-quick`/proposal once the contract exists.
- Archify's **explainer** mode and its offer to write `[archify explainer: …]` into global rules files (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`) — suppressed inside AKILI flows.
- `/akili-audit` diagram-drift detection (follow-up candidate).
- Removing Mermaid.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Projects running `/akili-constitution`, `/akili-specify`, `/akili-archive` | Gain diagram slots; interactive renders when Archify is present |
| All 5 install targets | One more small skill directory copied by the existing installer path; no installer code change |
| `software-architect` skill | One sentence re-pointed |
| Related specs | `archive/*ai-agent-development-skill` (precedent: environment-provided skill referenced, not vendored); no active spec touches these steps (`changes/review-intensity-trial-terms` is unrelated) |

## 8. Visual Reference

- Source: None
- Location: n/a
- Notes: no UI surface in the AKILI package itself. A rendered Archify sample (workflow, 812 KB HTML) was produced during analysis in a throw-away temp dir to measure output size; `/akili-specify` may attach one sample per slot type under `docs/specs/changes/archify-diagrams/samples/` if useful.

## 9. Requirement Delta Preview

### ADDED Requirements

- A packaged `conditional` skill defines the diagram slot catalog for PRD, UX/UI design, TRD and `design.md`, each slot naming its Archify type (`architecture`, `workflow`, `sequence`, `dataflow`, `lifecycle`, `erd`, …) and its Mermaid equivalent.
- When `archify` is available, each filled slot produces an Archify candidate JSON + HTML via `finalize`, stored at a fixed path next to the doc; the doc links the HTML below its Mermaid block.
- When `archify` is unavailable, or `finalize` exits non-zero, the Mermaid block stands alone and the doc records nothing as "interactive"; delivery is never blocked.
- A render whose `browser-check` was skipped (exit 2, no Chrome/Edge) is reported as "automated checks passed except browser-check", never as verified.
- Inside AKILI flows the skill never offers or writes Archify's explainer rules lines, and never installs or updates Archify; an Archify update notice is relayed once, as information.

### MODIFIED Requirements

- `/akili-constitution` Steps 3/4/5: diagram slots become explicit (TRD keeps C4 Context + Container, adds the conditional supplementary views already named in `views-documentation.md:14`).
- `/akili-specify` design phase: architecturally significant designs carry the slot diagrams of what they change.
- `/akili-archive`: summary links spec diagrams; TRD sync updates the baseline diagram it touches.

### REMOVED Requirements

- None.

## 10. Approach Options

| | **A — Vendor Archify** | **B — Reference only** | **C — Thin AKILI skill + referenced Archify** (recommended) |
|---|---|---|---|
| What ships | Trimmed `archify/` copy (SKILL.md, LICENSE, THIRD_PARTY_NOTICES, `bin/`, `renderers/`, `explainer/` incl. `vendor/pele`, `schemas/`, `references/`, `locales/`, `brand-marks/`, `assets/`, runtime `scripts/`, `examples/*.json`; drop `examples/*.html` ≈ 11 MB and generator scripts) | Governance row + Skill Map row + install note | ~10 KB original skill + command wiring + governance/docs |
| Package size | ≈ +5.3 MB unpacked (4.49 MB → ~9.8 MB, **+120%**), ≈ +1.3 MB packed | 0 | ≈ +10 KB |
| Always available | Yes (still needs Chrome/Edge for `browser-check`) | Only if installed | Only if installed; Mermaid fallback always |
| Governance fit | Conflicts with `governance.md:17–23` (tool ships version-matched copy + own updater) | Fits, but env skills reach agents only via the Skill Map, so the **commands cannot name diagram slots** — goal not met | Fits: shipped skill is wired in commands; Archify stays environment-provided |
| Staleness | High: upstream at v3.2.0 with PR #1002 merged the day of analysis; Archify's own update checker would tell users to `npx skills add`, overwriting AKILI's adapted copy | None | None (contract is ours; renderer version is the user's) |
| Install collision (Codex/Cursor shared root) | `archify` name collides with a user's own install: skip-existing → whichever came first wins; `--force` downgrades a newer user copy | None | None (different name) |
| Licence work | Repo-level `THIRD_PARTY_NOTICES.md`: Archify MIT (© tt-a1i, © Cocoon AI), Pele MIT, JetBrains Mono OFL-1.1, Simple Icons CC0 + per-mark licences incl. **Vue CC-BY-NC-SA-4.0**, Rust CC-BY-SA-4.0, OpenAI brand terms | Credit only | Credit only (`inspired-by` / referenced tool, no code redistributed) |

**Why C is the smallest safe path:** it is the only option that both meets the goal (commands own the diagram slots) and respects the vendoring rule; it adds no runtime, no licence-of-third-party-marks surface, and degrades to today's Mermaid behavior on any host. If the maintainer prefers guaranteed availability, A is viable with the trim list above, but it should be its own follow-up proposal because it changes the package's licence and size profile.

## 11. Recommended Approach

Option **C**. Key design points to settle in `/akili-specify`:

1. **Skill name and binding:** `diagram-design`, `conditional` (loaded at the diagram slots of constitution Steps 3–5, specify design, archive), original authorship (`author: Juan Carlos Cadavid — jcadavid.com`), crediting Archify (tt-a1i, MIT) as the referenced renderer.
2. **Mermaid is canonical.** Archify's own SKILL.md treats Mermaid as an input it re-authors into fresh JSON ("Read Mermaid for topology and meaning, then author fresh Archify JSON"), so the Mermaid block is the single source; the Archify candidate JSON is the interactive view's source.
3. **Storage:** baseline docs → `docs/diagrams/<doc>-<slot>.{json,html}`; spec docs → `docs/specs/<spec>/diagrams/`; receipt files (`*.finalize.json`, `*.browser-check.json`, `*.delivery.json`, `*.finalize-summary.json`, ~90 KB per render) are not committed. Override Archify's default `.archify/<type>-<slug>-<timestamp>/` folder by naming the location (its SKILL.md allows it).
4. **Command wiring style:** one conditional line per slot ("load `diagram-design` …"), mirroring how `stitch-design` is wired for UI.
5. **Host coverage:** the new skill installs through the existing skill path on all 5 targets; Archify itself is supported upstream on Claude Code, Codex and OpenCode (`README_EN.md:443–445`) and on Cursor via `npx skills add … --agent cursor` (`README_EN.md:228`); **Antigravity is not an upstream-listed surface** — the fallback covers it.

## 12. Risks, Dependencies, And Open Questions

| # | Risk / question | Mitigation / owner |
|---|---|---|
| R1 | HTML weight: one workflow render = **812 KB** (measured); a TRD with 5 slots ≈ 4 MB in git per regeneration | Open question Q1 below; regenerate only on content change |
| R2 | `finalize` needs Node ≥ 18 (AKILI already requires it) and Chrome/Chromium/Edge; without a browser it **exits 2** with `browser-check:skipped` but still writes the HTML (measured with `ARCHIFY_CHROME=/nonexistent`) | Skill treats exit 2 as "rendered, not browser-verified"; never claims verification |
| R3 | Network: Archify GETs `tt-a1i.github.io/archify/skill-updates/archify/stable.json` (~24 h cadence) during delivery; brand-mark lookup can fetch a user-provided URL | Documented; `ARCHIFY_UPDATE_CHECK_DISABLED=1` disables it; AKILI never sets user env |
| R4 | Archify's explainer flow can write a line into the agent's **global rules file** | Skill forbids explainer offers inside AKILI flows (Non-Goals) |
| R5 | Third-party brand marks with restrictive licences (Vue CC-BY-NC-SA) can appear in generated diagrams | Skill: no brand marks in methodology diagrams unless the user asks |
| R6 | Agent cost: Archify's authoring path reads its defaults, example and schemas per diagram; 5 TRD slots multiply that | Skill caps renders to the slots in scope; Mermaid-only path costs nothing extra |
| R7 | Upstream drift in Archify's CLI (`finalize` flags) breaks the skill's instructions | Skill delegates CLI usage to Archify's own SKILL.md; it names only the outcome contract, never flags |
| Q1 | Commit the HTML renders, or commit only Mermaid + candidate JSON and regenerate HTML on demand (gitignored)? | **Juan Carlos** — decide at `/akili-specify` |
| Q2 | Skill name: `diagram-design` vs `akili-diagrams` vs `architecture-diagrams`? | Juan Carlos |
| Q3 | Do you want option A (vendoring) instead, accepting +120% package size and the licence notices? | Juan Carlos — this proposal's approval gate |
| Q4 | Should PRD/UX slots be mandatory or "when the product has a multi-step flow"? | Specify (default: conditional) |

Active Lessons that apply: **KZ-002** (aggregate claims in CHANGELOG/docs are quote-checked at HEAD — the size and licence statements above must be re-measured in the CHANGELOG task) and **KZ-changes--leader-brief-contract-2** (the exit-2/no-browser behavior is stated here because it was executed, not predicted).

## 13. Success Criteria

- Running `/akili-constitution` on a project with Archify installed yields a TRD whose C4 Context + Container slots each have Mermaid + a linked interactive HTML that passed `finalize`.
- The same run without Archify yields the same doc with Mermaid only, no error, no "interactive" claim.
- `docs/skills/governance.md` lists `diagram-design` (conditional) and `archify` (environment-provided); `docs/skills/diagram-design.md` exists; `CHANGELOG.md` has the entry.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run` (size growth ≤ ~20 KB) and `git diff --check` pass.
- No file from the Archify repository is present in the package.

## 14. Next Step

```text
/akili-specify changes/archify-diagrams
```
