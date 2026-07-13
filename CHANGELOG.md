# Changelog

All notable changes to this methodology repository should be documented in this file.

The format is inspired by Keep a Changelog and the repository follows semantic versioning in a lightweight way for methodology milestones.

## [Unreleased]

### Changed
- Refined the Design and Tasks presentation steps in `/sdd-specify` to explicitly display clear summaries on the screen (architecture, API endpoints, high-level task lists) so the user can understand what was generated without having to read the full markdown documents.

## [0.9.3] - 2026-07-13

### Changed
- Refined the Requirements presentation step in `/sdd-specify` to explicitly display a summary of the generated scenarios and rules on the screen before prompting the user with the approval menu.
## [0.9.2] - 2026-07-12

### Changed
- Updated README.md to fully document recent methodology enhancements (Scope Chunking, BDD, HITL menus, Judgment Day skill, Infrastructure blueprint, and LOC Estimation).
## [0.9.1] - 2026-07-12

### Added
- Added `docs/infrastructure.md` generation to `/sdd-constitution` (new Step 6) to establish deployment environments and cloud architecture rules early.
- Added Estimated Lines of Code (LOC) and PR Strategy recommendations to the Tasks presentation menu in `/sdd-specify` to prevent oversized Pull Requests.

### Changed
- Updated `/sdd-constitution` to explicitly ask for infrastructure expectations (AWS, GCP, Vercel, etc.) during the context clarification phase if they are not provided.
## [0.9.0] - 2026-07-12

### Added
- Integrated the `judgment-day` skill into the methodology and added it as an explicit option in the `/sdd-specify` design phase approval menu, including post-judgment decision routing.
- Added "Human-in-the-loop" approval menus at the end of each phase (Requirements, Design, Tasks) in `/sdd-specify` to give the user explicit control before proceeding.
- Added strict BDD scenario handling (`BUT it must NOT`, `AND IT MUST`) to `/sdd-specify`, `/sdd-test`, and `/sdd-validate` for rigorous negative constraint and boundary validation tracking.
- Added Scope Chunking support to `/sdd-propose` and `/sdd-specify` using the `brainstorming` skill to evaluate large requests and split them into manageable modules.

### Changed
- Updated `/sdd-constitution` to use the `brainstorming` skill at Step 0 to determine if the project is new or legacy, and added an explicit prompt to initialize CodeGraph when analyzing existing projects.
## [0.8.0] - 2026-07-11

### Added

- Packaged the `seo-audit` skill (from [marketingskills](https://github.com/coreyhaines31/marketingskills), v2.0.0) under `.claude/skills/seo-audit/` with its `references/` and `evals/`, and added its human-facing page at `docs/skills/seo-audit.md`.

### Changed

- `/sdd-seo` Phase 2 now requires loading the `seo-audit` skill: findings use its Issue / Impact / Evidence / Fix / Priority format, are weighted by its priority order (crawlability → technical → on-page → content → authority), and its schema-detection limitation (static fetches cannot see JS-injected JSON-LD) and International SEO checklist apply throughout. Added Step 2.7 (on-page audit of the render-sampled pages) and a matching `On-Page SEO Findings` report section.
## [0.7.0] - 2026-07-10

### Added

- Added a nested agent-guide inheritance convention across the lifecycle: `/sdd-constitution` (Step 7) defines it — modules with divergent conventions get a thin child `CLAUDE.md`/`AGENTS.md`, always referenced from a `## Module Guides` index in the root guides; `/sdd-execute` (Step 3) records `## Constitution Impact` notes in `execution.md` when a task creates or reshapes a module; `/sdd-archive` (new Step 3: Constitution & Graph Sync) consumes those notes to create/update child guides, refresh the parent index, and recommend a CodeGraph re-index; `/sdd-audit` gained an **Agent Guide Drift** category and a conformance-matrix row. The Leader persona template (`.claude/templates/leader.md`) carries the same Constitution Impact duty.

### Changed

- **Breaking (naming):** Renamed the two constitution baseline documents to remove the System Design / Detailed Design ambiguity. The UX/UI blueprint moved from `docs/system-design/design.md` to `docs/ux-ui/design.md` (now the "UX/UI Design Document"), and the technical blueprint moved from `docs/detailed-design/detailed-design.md` to `docs/trd/trd.md` (now the "TRD — Technical Requirements Document"). Document structures are unchanged; only names and paths changed.
- Updated every command, persona template, and doc page to the new names and paths (`.claude/commands/`, `.claude/templates/{leader,implementer,reviewer}.md`, `README.md`, `AGENTS.md`, `docs/flow.md`, `docs/model-routing.md`, `docs/commands/`, `docs/skills/`).
- Added legacy-path handling: commands that read the baseline fall back to the old `docs/system-design/` and `docs/detailed-design/` paths when the new ones are missing, and `/sdd-constitution` (Active SDD mode) offers a `git mv` migration to the new layout.
## [0.6.0] - 2026-06-09

### Added

- Added capability-tier model routing guidance under `docs/model-routing.md`: six tiers (Architect, Coder, Auditor, Context-Ingest, Fast-Cheap, Multimodal), a phase→tier mapping for every SDD phase (with the `/sdd-execute` triad split), and an editable per-tool model registry for Claude Code (PRO) and OpenCode Go.
- Added a `## Recommended Model Tier` note to the `.claude/templates/{leader,implementer,reviewer}.md` personas, reinforcing the author ≠ auditor constraint (Reviewer model ≠ Implementer model).

### Changed

- Updated `/sdd-constitution` with Step 7C to scaffold a non-destructive `## Model Routing` registry into each project's `AGENTS.md` / `CLAUDE.md`.
- Documented the capability-tier model routing in `README.md`, `docs/flow.md`, `docs/README.md`, and the `/sdd-constitution` command reference, and added a governance rule to `AGENTS.md` that model selection is guidance-only (no `model:` frontmatter, no installer injection).
## [0.5.0] - 2026-05-26

### Added

- Added a JCSPECS multi-agent execution triad (Leader → Implementer → Reviewer) with default personas packaged under `.claude/templates/{leader,implementer,reviewer}.md`.
- Added the `sdd-jc` installer support for deploying agent templates to `<tool>/sdd-jc/templates/` and doctor diagnostics that check them.
- Added a design document for the multi-agent orchestration under `docs/plans/2026-05-26-multi-agent-sdd-orchestration-design.md`.

### Changed

- Updated `/sdd-execute` to orchestrate the Leader → Implementer → Reviewer rework loop with a hard 3-attempt ceiling, structured FAIL feedback (Discovered Issue / Violated Rule / Remediation Suggestion), HALT escalation, and a richer `execution.md` audit-trail format.
- Updated `/sdd-constitution` with a 3-mode classification (Brand-new / Legacy / Active SDD), non-destructive `.agents/` scaffolding policy, and cross-tool compatibility guidance for Claude Code, OpenCode, and Antigravity.
## [0.4.0] - 2026-05-23

### Added

- Added support for Google Antigravity (IDE and CLI) in the `sdd-jc` installer and doctor diagnostics checks.
- Added a new JCSPECS command `/sdd-audit` to detect drift between active codebase reality and active design specifications.
- Added a new JCSPECS automated test parser utility (`scripts/parse_tests.js`) to parse Jest/Vitest JSON test suite output and build Markdown matrices inside `test-report.md` automatically.

### Changed

- Updated `/sdd-execute` with JCSPECS Spec Reference git commit format conventions and a formal Pivot Protocol loop.
- Updated `/sdd-test` with guidelines on using the automated test parser helper.
- Updated `/sdd-archive` to refresh and re-index CodeGraph databases when archiving completed specs.
- Enriched `docs/flow.md` and `AGENTS.md` to document and govern JCSPECS advanced engineering features.
## [0.3.3] - 2026-05-18

### Changed

- Added a `docs/` documentation hub with flow, CLI, command, skill, and OpenSpec comparison references.

## [0.3.2] - 2026-05-18

### Changed

- Added the `JCSPECS` ASCII banner to the CLI output.
- Replaced the README badge image with a Markdown hero that combines the `JCSPECS` ASCII mark, methodology positioning, and support badges.
- Updated the README skills inventory to include `angular-developer` and the GSAP skill suite.

## [0.3.1] - 2026-05-18

### Changed

- Added explicit release governance policy for controlled repository and npm package updates.
- Added `npm run release:status` automation to detect drift across local release notes, npm versions, tags, and GitHub Releases.
- Added a `Release Status` GitHub Actions workflow for automated release drift checks.
- Added CodeGraph guidance for existing-project constitution analysis.
- Updated `/sdd-constitution` to distinguish new vs existing projects and maintain both `CLAUDE.md` and `AGENTS.md`.
- Initialized CodeGraph configuration for this methodology repository.

## [0.3.0] - 2026-05-18

### Changed

- Added `angular-developer` skill for Angular projects and documented when to use it.
- Expanded README installation instructions with step-by-step flows for Claude, OpenCode, both-tool installation, verification, updates, local checkout usage, and troubleshooting.
- Added controlled release helper scripts for patch, minor, and major version preparation.
- Added official GSAP skills for core animations, timelines, ScrollTrigger, React, Vue/Svelte frameworks, plugins, performance, and utilities.
- Documented release discipline in README, release checklist, `AGENTS.md`, and `CLAUDE.md`.
- Documented required use of relevant packaged skills in `AGENTS.md` and `CLAUDE.md`.

### Fixed

- Preserved executable CLI metadata for the published `sdd-jc` binary.

## [0.2.0] - 2026-05-17

### Added

- `/sdd-propose` command prompt for lightweight change proposals before full specification.
- `/sdd-archive` command prompt for preserving completed specs under `docs/specs/archive/` after validation.
- Node package metadata and `sdd-jc` CLI for installing, updating, listing, and checking bundled commands and skills.
- `sdd-jc --tool` support for installing into Claude, OpenCode, or both.
- MIT license for public package distribution.
- README guidance for applying SDD JC with Lite, Standard, and Full documentation depth.
- Practical spec folder shape, requirement scenario examples, review points, and command map.
- OpenSpec-inspired proposal, requirement delta preview, and archive lifecycle guidance.

### Changed

- Updated README flow to include optional proposal and final archive steps.
- Updated README install instructions for Claude and OpenCode targets, `pnpm dlx`, global install, local checkout usage, dry-run, force, and target options.
- Clarified `/sdd-specify` around bounded specs, behavior-first requirements, Given/When/Then scenarios, and task quality rules.
- Clarified `/sdd-specify` to consume `proposal.md` when it exists and convert delta previews into full requirements.
- Clarified `/sdd-execute` around incremental task execution, scope control, execution evidence, and spec-drift handling.
- Clarified `/sdd-test` around requirement-to-test traceability, scenario coverage, accepted gaps, and test evidence.
- Clarified `/sdd-validate` around PASS/WARN/FAIL/BLOCKED results, archive readiness, conformance evidence, and remediation guidance.
- Clarified `/sdd-validate` to recommend `/sdd-archive <spec-path>` when work is ready to close.

## [0.1.0] - 2026-04-27

### Added

- Initial reusable SDD command set:
  - `sdd-constitution`
  - `sdd-specify`
  - `sdd-execute`
  - `sdd-test`
  - `sdd-validate`
- Bundled Claude skills required by the methodology, including `ui-ux-pro-max`
- Constitution-first workflow for project-level documentation baselines
- Nested spec path support such as `enhancements/renewals`
- Portable methodology README with install and restore instructions
- Environment snapshots for Neovim and tmux under `dotfiles/`

### Changed

- Aligned command behavior around project constitutional docs and `docs/specs/general-setup/`
- Removed stale project-specific assumptions from the SDD prompts
- Standardized command guidance around reusable spec-path workflows instead of flat module-only paths

### Notes

- This is the first stable reusable baseline of the SDD JC methodology repository.
