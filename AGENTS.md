# Agent Guidance

This repository packages the AKILI-SPECS methodology for Claude Code, OpenCode, and Google Antigravity.

## Repository Purpose

- `.claude/commands/` contains installable AKILI-SPECS command prompts.
- `.claude/skills/` contains installable methodology skills.
- `.claude/templates/` contains the default Leader, Implementer, and Reviewer personas used by the AKILI multi-agent harness. `/akili-constitution` copies these into each project's `.agents/` directory.
- `bin/akili.js` installs commands, skills, and helper resources (including the agent templates) into Claude, OpenCode, and Google Antigravity config directories.
- `scripts/release.js` prepares controlled npm package releases.
- `docs/release-checklist.md` documents the release process.

## Development Rules

- Keep command prompts readable and tool-agnostic where possible.
- Do not add project-specific assumptions to reusable commands.
- Keep installer behavior safe: skip existing files by default and require `--force` to overwrite.
- Do not commit generated `.tgz` files or `node_modules/`.
- Do not commit service account keys, npm tokens, `.npmrc`, or local MCP config containing secrets.
- **Spec-to-Code Traceability:** Every commit made during `/akili-execute` must be prefixed with `[SPEC:<spec-path>]` (e.g. `[SPEC:changes/add-remember-me] message`).
- **Pivot Protocol:** If execution invalidates approved specs, the agent must mark tasks blocked (`[~]`), record pivot details in `execution.md`, and obtain user sign-off.
- **Drift Auditing:** Run `/akili-audit` to detect differences between active codebase reality and the active UX/UI design and TRD.
- **CodeGraph Re-indexing:** Remind or execute the re-indexing command during `/akili-archive` to keep CodeGraph databases healthy.
- **Agent Guide Inheritance:** Root `CLAUDE.md`/`AGENTS.md` are the parent; modules with divergent conventions carry thin child guides referenced from a `## Module Guides` index in the parent. `/akili-execute` records `## Constitution Impact` notes when tasks create or reshape modules; `/akili-archive` syncs the guides and the CodeGraph; `/akili-audit` flags guide drift.
- **Multi-Agent Harness:** `/akili-execute` runs each task through a Leader → Implementer → Reviewer loop with a hard 3-attempt rework ceiling. Personas live in `.claude/templates/` (source) and project `.agents/` (deployed by `/akili-constitution`). Do not collapse this loop back into a single-agent flow.
- **Model Routing is guidance-only.** Model selection per AKILI-SPECS phase is documented in `docs/model-routing.md` (capability tiers + a per-tool registry) and scaffolded into each project's `AGENTS.md` / `CLAUDE.md` by `/akili-constitution` (Step 7C). Never add a `model:` key to command frontmatter and never inject models in the installer — a single value cannot serve both Claude Code (`opus`/`sonnet`/`haiku`) and OpenCode (`provider/model`), and it would break the model-agnostic install. The Reviewer must run on a different model than the Implementer (author ≠ auditor).

## Skill Usage

When working on tasks in this repository or when using the installed AKILI-SPECS methodology, load and apply the relevant available skills before implementation.

Use the packaged skills in `.claude/skills/` as the source of truth. Examples:

- Use `systematic-debugging` for bugs, test failures, and unexpected behavior.
- Use `frontend-design`, `ui-ux-pro-max`, `tailwind-design-system`, or `shadcn-ui` for UI work.
- Use `gsap-*` skills for animation work.
- Use `react-doctor` and `vercel-react-best-practices` for React/Next.js changes.
- Use `angular-developer` for Angular projects, components, services, routing, forms, signals, SSR, accessibility, styling, animations, testing, and CLI tooling.
- Use domain skills such as `nestjs-expert`, `aws-serverless`, `api-design-principles`, or `product-manager-toolkit` when the task matches.
- Use `seo-audit` for SEO audits and diagnosis; `/akili-seo` loads it in its audit phase.

If a task document lists required or recommended skills, follow that list first.

## CodeGraph

This repository has CodeGraph initialized under `.codegraph/` for faster semantic code exploration.

- Use CodeGraph for existing-project analysis, symbol lookup, call flow, and impact checks when `.codegraph/` exists.
- Do not commit generated CodeGraph database files; `.codegraph/.gitignore` excludes local database artifacts.
- Keep `.codegraph/config.json` focused on repository source and methodology scripts, not large snapshots or generated outputs.
- If CodeGraph is unavailable in another project, continue with normal `Glob`, `Grep`, and file reads.

## Release Rules

Repository changes do not automatically update the npm package. A package update requires a version bump and publish.

Release governance:

- Do not publish directly from uncommitted changes.
- Every package-affecting repo change must have `CHANGELOG.md` notes before release preparation.
- Every npm update must use `scripts/release.js` through `npm run release:patch`, `npm run release:minor`, or `npm run release:major`.
- Publish only after verification passes and npm authentication is confirmed for a package maintainer.
- Do not claim npm is updated until `npm publish` succeeds and a post-publish smoke test confirms the published version.
- If publish fails, keep the release commit, document the blocker, and do not create a replacement version unless the failed version was actually published.
- Use `npm run release:status` before and after publishing to detect drift between npm, tags, GitHub Releases, and local release files.
- Keep the `Release Status` GitHub Actions workflow aligned with `npm run release:status`.

Use this flow:

1. Add change notes under `CHANGELOG.md` > `Unreleased`.
2. Commit feature, documentation, or fix changes.
3. Run one of:
   - `npm run release:patch`
   - `npm run release:minor`
   - `npm run release:major`
4. Run verification:
   - `npm run verify:cli`
   - `npm run pack:dry-run`
   - `npm run release:status`
   - `git diff --check`
5. Commit the release version update.
6. Confirm npm auth with `npm whoami --registry=https://registry.npmjs.org/`.
7. Publish explicitly with `npm publish --access public --registry=https://registry.npmjs.org/`.
8. Smoke test the published version with `npx akili-specs@<version> list`.

Use patch for small docs/fixes, minor for new commands or install targets, and major for breaking changes.

## Verification

Before committing package or installer changes, run:

```bash
npm run verify:cli
npm run pack:dry-run
git diff --check
```

When installer behavior changes, also test temporary targets:

```bash
node bin/akili.js install --tool all --dry-run
node bin/akili.js doctor --tool all
```
