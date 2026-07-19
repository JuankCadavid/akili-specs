# Changelog

All notable changes to this methodology repository should be documented in this file.

The format is inspired by Keep a Changelog and the repository follows semantic versioning in a lightweight way for methodology milestones.

## [Unreleased]

### Added
- **`/akili-resume` command:** New session recovery command that scans all active specs under `docs/specs/` and presents a multi-spec dashboard with phase, progress bars, last action, blockers, and next command recommendation. If only one spec is active, goes directly to a detailed briefing. No arguments required.

### Fixed
- **Documentation drift corrections:** Added `/akili-audit` to README (Contents, Command Map, Auxiliary commands), `docs/commands/README.md` (Command Map, Source Files, Normal Sequence), and `docs/README.md` (Quick Flow). Created `docs/commands/akili-audit.md` reference page.
- **`judgment-day` skill documentation:** Added `judgment-day` to README skills list, AGENTS.md skill usage, and CLAUDE.md skill usage. Created `docs/skills/judgment-day.md` reference page.
- **Plan document rebranding:** Renamed `docs/plans/2026-05-26-multi-agent-sdd-orchestration-design.md` to `2026-05-26-multi-agent-akili-orchestration-design.md` to align with the v2.0.0 AKILI rebranding.

## [2.3.0] - 2026-07-19

### Added
- **Auto-Update Checker:** The `akili` CLI now automatically checks the NPM registry in the background (zero dependencies, 1500ms timeout) to see if a newer version is available. If an update exists, it prominently displays a stylish banner reminding the user to update, ensuring teams always stay on the latest methodology release.

### Fixed
- Changed the CLI behavior so that running `akili` with no arguments defaults to showing the `help` menu instead of launching the interactive `init` wizard. The wizard must now be explicitly invoked via `akili init` (or `npx akili-specs init`).
## [2.2.2] - 2026-07-19

### Fixed
- Replaced `pnpm add -g` with the classic `npm install -g` in the global installation documentation to prevent the `ERR_PNPM_NO_GLOBAL_BIN_DIR` error that occurs in environments without a pre-configured PNPM home directory.
## [2.2.1] - 2026-07-19

### Fixed
- Updated `package.json` repository URLs to point to the new renamed GitHub repository `JuankCadavid/akili-specs`.
## [2.2.0] - 2026-07-19

### Added
- **Legacy Cleanup:** The `akili install` and `akili update` commands now automatically detect and remove legacy `sdd-jc` files and directories (`commands/sdd-*.md` and the `sdd-jc/` template folder) to ensure a clean environment post-rebranding without duplicate slash commands.
## [2.1.1] - 2026-07-18

### Fixed
- Fixed the GitHub repository URL in `package.json` to point to the correct `JuankCadavid/sdd-jc-methodology` repository instead of the non-existent `akili-specs` repo.
## [2.1.0] - 2026-07-18

### Added
- **Interactive Setup Wizard:** Running the CLI without arguments (or using the `akili init` command) now launches an interactive setup wizard that asks which tools to target and whether to install globally or locally.
- **Local Project Installation:** Added the `--local` (`-l`) flag to the CLI. This allows users to install the methodology artifacts directly into their local project workspace (e.g., `./.claude` and `./.config/opencode`) instead of the global home directories, ensuring project-specific isolation when needed.
## [2.0.1] - 2026-07-18

### Fixed
- Fixed remaining `akili-methodology` package references in documentation to correctly point to `akili-specs`.
- Updated the ASCII art in the README to reflect the new AKILI branding instead of the old JCSPECS banner.
## [2.0.0] - 2026-07-18

### Changed
- **Massive Rebranding:** The methodology and CLI have been officially rebranded to **AKILI** and **AKILI-SPECS** (formerly JCSPECS / SDD JC) in honor of Dante 🐶.
- **CLI Rename:** The command line tool is now invoked as `akili` (e.g., `akili install`, `akili doctor`).
- **Command Rename:** All slash commands have been renamed from `/sdd-*` to `/akili-*` (e.g., `/akili-propose`, `/akili-execute`).
- **NPM Package:** The package name is now `akili-specs`.
- Updated all internal documentation, templates, and references to reflect the new brand and CLI instructions.
## [1.0.0] - 2026-07-16

### Added
- **Harness Upgrades (v1.0 Candidate):**
  - **Automatic Rollback:** The Leader now executes `git restore .` and `git clean -fd` automatically upon declaring a `HALT` to ensure the repository remains in a clean state before executing the Pivot Protocol.
  - **Anti-Looping Memory:** The Leader now passes an "Attempt History" summary to the Implementer during rework loops to prevent it from repeating failed approaches.
  - **Dynamic Skill Loading:** The Leader now explicitly commands the Implementer to load necessary methodology skills (e.g., `shadcn-ui`) using the `skill` tool before writing code.
  - **Strict Self-Correction (Pre-Review):** The Implementer is now strictly prohibited from reporting completion to the Leader if the local verification command fails. It must self-correct in an inner loop first, drastically saving Reviewer tokens.
  - **Parallel Execution:** The Leader can now spawn multiple Implementers simultaneously if the eligible tasks are completely independent (touching different domains).
## [0.11.0] - 2026-07-16

### Added
- Rewrote the `akili` CLI argument parser to use the native Node.js `util.parseArgs` (Node >= 18.0.0) for stronger type safety, default values, and better error handling.
- Added native ANSI colors to the CLI interface for high-visibility terminal output (`akili doctor` and `akili list`).
- Added an auto-repair `--fix` flag to `akili doctor` which instantly installs any missing commands, skills, or templates detected during the audit without requiring a full `--force` update.

### Changed
- Refactored the `akili` CLI core architecture to use a unified `TOOL_REGISTRY` pattern, eliminating duplicate tool-specific conditionals and vastly improving the scalability of adding future IDE/Tool targets.
- Improved CLI cross-platform compatibility (Windows-first) by strictly normalizing all console path outputs and `~` directory resolutions to work flawlessly in PowerShell and CMD.
- Removed the circular self-dependency from `package.json` to guarantee zero-dependency execution for faster `npx`/`pnpm dlx` global installs.
## [0.10.2] - 2026-07-16

### Changed
- Refined prompt caching across all commands and templates: reading constitutional baseline docs FIRST in a consistent order drastically reduces API token cost.
- Reinforced model tier assignments (`> **Recommended model tier:**`) across commands so users only expend expensive T1/T3 tokens when deep reasoning is actually required, avoiding token waste on format-following tasks like `/akili-archive`.
- Expanded `.codegraph/` integration: agents are now explicitly instructed to use `codegraph_search` and `codegraph_context` over full file reads (`grep`/`glob`) during `/akili-propose` and `/akili-specify`, significantly reducing input tokens.
## [0.10.1] - 2026-07-16

### Changed
- Refined `/akili-specify` rules: Mode "Lite" now strictly enforces extreme brevity (1-2 bullet points, minimal output tokens) and code snippet generation is explicitly banned in `design.md` to conserve tokens.
- Refined the multi-agent harness in `/akili-execute` and `.claude/templates/reviewer.md` for token optimization: the Reviewer now enforces a strict **Diff-Only** audit constraint (reading only the git diff, not full source files) and supports a new **`STATUS: FATAL_FAIL`** (Fail-Fast) verdict to immediately abort the rework loop on unviable approaches without exhausting the 3-attempt ceiling.
## [0.10.0] - 2026-07-16

### Added
- Integrated Figma MCP and Jira MCP awareness into `/akili-propose` (Step 1) to extract requirements and visual context from existing tickets and designs.
- Added "Design Impact" rules to `/akili-specify` ensuring UI states, Frontend Component Architecture, and atomic frontend tasks are generated when Figma or visual design context is present.
- Added explicit "Report To User" short summaries across all major commands (`/akili-propose`, `/akili-specify`, `/akili-execute`, `/akili-validate`, `/akili-test`, `/akili-constitution`) so users receive a clear, digestible recap ("summary facil de entender de lo que se hizo") before the next step.
## [0.9.4] - 2026-07-13

### Changed
- Refined the Design and Tasks presentation steps in `/akili-specify` to explicitly display clear summaries on the screen (architecture, API endpoints, high-level task lists) so the user can understand what was generated without having to read the full markdown documents.
## [0.9.3] - 2026-07-13

### Changed
- Refined the Requirements presentation step in `/akili-specify` to explicitly display a summary of the generated scenarios and rules on the screen before prompting the user with the approval menu.
## [0.9.2] - 2026-07-12

### Changed
- Updated README.md to fully document recent methodology enhancements (Scope Chunking, BDD, HITL menus, Judgment Day skill, Infrastructure blueprint, and LOC Estimation).
## [0.9.1] - 2026-07-12

### Added
- Added `docs/infrastructure.md` generation to `/akili-constitution` (new Step 6) to establish deployment environments and cloud architecture rules early.
- Added Estimated Lines of Code (LOC) and PR Strategy recommendations to the Tasks presentation menu in `/akili-specify` to prevent oversized Pull Requests.

### Changed
- Updated `/akili-constitution` to explicitly ask for infrastructure expectations (AWS, GCP, Vercel, etc.) during the context clarification phase if they are not provided.
## [0.9.0] - 2026-07-12

### Added
- Integrated the `judgment-day` skill into the methodology and added it as an explicit option in the `/akili-specify` design phase approval menu, including post-judgment decision routing.
- Added "Human-in-the-loop" approval menus at the end of each phase (Requirements, Design, Tasks) in `/akili-specify` to give the user explicit control before proceeding.
- Added strict BDD scenario handling (`BUT it must NOT`, `AND IT MUST`) to `/akili-specify`, `/akili-test`, and `/akili-validate` for rigorous negative constraint and boundary validation tracking.
- Added Scope Chunking support to `/akili-propose` and `/akili-specify` using the `brainstorming` skill to evaluate large requests and split them into manageable modules.

### Changed
- Updated `/akili-constitution` to use the `brainstorming` skill at Step 0 to determine if the project is new or legacy, and added an explicit prompt to initialize CodeGraph when analyzing existing projects.
## [0.8.0] - 2026-07-11

### Added

- Packaged the `seo-audit` skill (from [marketingskills](https://github.com/coreyhaines31/marketingskills), v2.0.0) under `.claude/skills/seo-audit/` with its `references/` and `evals/`, and added its human-facing page at `docs/skills/seo-audit.md`.

### Changed

- `/akili-seo` Phase 2 now requires loading the `seo-audit` skill: findings use its Issue / Impact / Evidence / Fix / Priority format, are weighted by its priority order (crawlability → technical → on-page → content → authority), and its schema-detection limitation (static fetches cannot see JS-injected JSON-LD) and International SEO checklist apply throughout. Added Step 2.7 (on-page audit of the render-sampled pages) and a matching `On-Page SEO Findings` report section.
## [0.7.0] - 2026-07-10

### Added

- Added a nested agent-guide inheritance convention across the lifecycle: `/akili-constitution` (Step 7) defines it — modules with divergent conventions get a thin child `CLAUDE.md`/`AGENTS.md`, always referenced from a `## Module Guides` index in the root guides; `/akili-execute` (Step 3) records `## Constitution Impact` notes in `execution.md` when a task creates or reshapes a module; `/akili-archive` (new Step 3: Constitution & Graph Sync) consumes those notes to create/update child guides, refresh the parent index, and recommend a CodeGraph re-index; `/akili-audit` gained an **Agent Guide Drift** category and a conformance-matrix row. The Leader persona template (`.claude/templates/leader.md`) carries the same Constitution Impact duty.

### Changed

- **Breaking (naming):** Renamed the two constitution baseline documents to remove the System Design / Detailed Design ambiguity. The UX/UI blueprint moved from `docs/system-design/design.md` to `docs/ux-ui/design.md` (now the "UX/UI Design Document"), and the technical blueprint moved from `docs/detailed-design/detailed-design.md` to `docs/trd/trd.md` (now the "TRD — Technical Requirements Document"). Document structures are unchanged; only names and paths changed.
- Updated every command, persona template, and doc page to the new names and paths (`.claude/commands/`, `.claude/templates/{leader,implementer,reviewer}.md`, `README.md`, `AGENTS.md`, `docs/flow.md`, `docs/model-routing.md`, `docs/commands/`, `docs/skills/`).
- Added legacy-path handling: commands that read the baseline fall back to the old `docs/system-design/` and `docs/detailed-design/` paths when the new ones are missing, and `/akili-constitution` (Active AKILI-SPECS mode) offers a `git mv` migration to the new layout.
## [0.6.0] - 2026-06-09

### Added

- Added capability-tier model routing guidance under `docs/model-routing.md`: six tiers (Architect, Coder, Auditor, Context-Ingest, Fast-Cheap, Multimodal), a phase→tier mapping for every AKILI-SPECS phase (with the `/akili-execute` triad split), and an editable per-tool model registry for Claude Code (PRO) and OpenCode Go.
- Added a `## Recommended Model Tier` note to the `.claude/templates/{leader,implementer,reviewer}.md` personas, reinforcing the author ≠ auditor constraint (Reviewer model ≠ Implementer model).

### Changed

- Updated `/akili-constitution` with Step 7C to scaffold a non-destructive `## Model Routing` registry into each project's `AGENTS.md` / `CLAUDE.md`.
- Documented the capability-tier model routing in `README.md`, `docs/flow.md`, `docs/README.md`, and the `/akili-constitution` command reference, and added a governance rule to `AGENTS.md` that model selection is guidance-only (no `model:` frontmatter, no installer injection).
## [0.5.0] - 2026-05-26

### Added

- Added a AKILI multi-agent execution triad (Leader → Implementer → Reviewer) with default personas packaged under `.claude/templates/{leader,implementer,reviewer}.md`.
- Added the `akili` installer support for deploying agent templates to `<tool>/akili/templates/` and doctor diagnostics that check them.
- Added a design document for the multi-agent orchestration under `docs/plans/2026-05-26-multi-agent-akili-orchestration-design.md`.

### Changed

- Updated `/akili-execute` to orchestrate the Leader → Implementer → Reviewer rework loop with a hard 3-attempt ceiling, structured FAIL feedback (Discovered Issue / Violated Rule / Remediation Suggestion), HALT escalation, and a richer `execution.md` audit-trail format.
- Updated `/akili-constitution` with a 3-mode classification (Brand-new / Legacy / Active AKILI-SPECS), non-destructive `.agents/` scaffolding policy, and cross-tool compatibility guidance for Claude Code, OpenCode, and Antigravity.
## [0.4.0] - 2026-05-23

### Added

- Added support for Google Antigravity (IDE and CLI) in the `akili` installer and doctor diagnostics checks.
- Added a new AKILI command `/akili-audit` to detect drift between active codebase reality and active design specifications.
- Added a new AKILI automated test parser utility (`scripts/parse_tests.js`) to parse Jest/Vitest JSON test suite output and build Markdown matrices inside `test-report.md` automatically.

### Changed

- Updated `/akili-execute` with AKILI Spec Reference git commit format conventions and a formal Pivot Protocol loop.
- Updated `/akili-test` with guidelines on using the automated test parser helper.
- Updated `/akili-archive` to refresh and re-index CodeGraph databases when archiving completed specs.
- Enriched `docs/flow.md` and `AGENTS.md` to document and govern AKILI advanced engineering features.
## [0.3.3] - 2026-05-18

### Changed

- Added a `docs/` documentation hub with flow, CLI, command, skill, and OpenSpec comparison references.

## [0.3.2] - 2026-05-18

### Changed

- Added the `AKILI` ASCII banner to the CLI output.
- Replaced the README badge image with a Markdown hero that combines the `AKILI` ASCII mark, methodology positioning, and support badges.
- Updated the README skills inventory to include `angular-developer` and the GSAP skill suite.

## [0.3.1] - 2026-05-18

### Changed

- Added explicit release governance policy for controlled repository and npm package updates.
- Added `npm run release:status` automation to detect drift across local release notes, npm versions, tags, and GitHub Releases.
- Added a `Release Status` GitHub Actions workflow for automated release drift checks.
- Added CodeGraph guidance for existing-project constitution analysis.
- Updated `/akili-constitution` to distinguish new vs existing projects and maintain both `CLAUDE.md` and `AGENTS.md`.
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

- Preserved executable CLI metadata for the published `akili` binary.

## [0.2.0] - 2026-05-17

### Added

- `/akili-propose` command prompt for lightweight change proposals before full specification.
- `/akili-archive` command prompt for preserving completed specs under `docs/specs/archive/` after validation.
- Node package metadata and `akili` CLI for installing, updating, listing, and checking bundled commands and skills.
- `akili --tool` support for installing into Claude, OpenCode, or both.
- MIT license for public package distribution.
- README guidance for applying AKILI-SPECS with Lite, Standard, and Full documentation depth.
- Practical spec folder shape, requirement scenario examples, review points, and command map.
- OpenSpec-inspired proposal, requirement delta preview, and archive lifecycle guidance.

### Changed

- Updated README flow to include optional proposal and final archive steps.
- Updated README install instructions for Claude and OpenCode targets, `pnpm dlx`, global install, local checkout usage, dry-run, force, and target options.
- Clarified `/akili-specify` around bounded specs, behavior-first requirements, Given/When/Then scenarios, and task quality rules.
- Clarified `/akili-specify` to consume `proposal.md` when it exists and convert delta previews into full requirements.
- Clarified `/akili-execute` around incremental task execution, scope control, execution evidence, and spec-drift handling.
- Clarified `/akili-test` around requirement-to-test traceability, scenario coverage, accepted gaps, and test evidence.
- Clarified `/akili-validate` around PASS/WARN/FAIL/BLOCKED results, archive readiness, conformance evidence, and remediation guidance.
- Clarified `/akili-validate` to recommend `/akili-archive <spec-path>` when work is ready to close.

## [0.1.0] - 2026-04-27

### Added

- Initial reusable AKILI-SPECS command set:
  - `akili-constitution`
  - `akili-specify`
  - `akili-execute`
  - `akili-test`
  - `akili-validate`
- Bundled Claude skills required by the methodology, including `ui-ux-pro-max`
- Constitution-first workflow for project-level documentation baselines
- Nested spec path support such as `enhancements/renewals`
- Portable methodology README with install and restore instructions
- Environment snapshots for Neovim and tmux under `dotfiles/`

### Changed

- Aligned command behavior around project constitutional docs and `docs/specs/general-setup/`
- Removed stale project-specific assumptions from the AKILI-SPECS prompts
- Standardized command guidance around reusable spec-path workflows instead of flat module-only paths

### Notes

- This is the first stable reusable baseline of the AKILI-SPECS methodology repository.
