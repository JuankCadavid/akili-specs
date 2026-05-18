# Changelog

All notable changes to this methodology repository should be documented in this file.

The format is inspired by Keep a Changelog and the repository follows semantic versioning in a lightweight way for methodology milestones.

## [Unreleased]

### Notes

- No unreleased changes yet.

## [0.3.0] - 2026-05-18

### Changed

- Added `angular-developer` skill for Angular projects and documented when to use it.
- Expanded README installation instructions with step-by-step flows for Claude, OpenCode, both-tool installation, verification, updates, local checkout usage, and troubleshooting.
- Added controlled release helper scripts for patch, minor, and major version preparation.
- Added official GSAP skills for core animations, timelines, ScrollTrigger, React, Vue/Svelte frameworks, plugins, performance, and utilities.
- Documented release discipline in README, release checklist, `AGENTS.md`, and `CLAUDE.md`.
- Documented required use of relevant packaged skills in `AGENTS.md` and `CLAUDE.md`.

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
