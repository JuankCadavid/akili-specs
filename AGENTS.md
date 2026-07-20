# Agent Guidance

This repository packages the AKILI-SPECS methodology for Claude Code, OpenCode, and Google Antigravity.

## Repository Purpose

- `.claude/commands/` contains installable AKILI-SPECS command prompts.
- `.claude/skills/` contains installable methodology skills.
- `.claude/templates/` contains the default Leader, Implementer, Reviewer, and Tester personas used by the AKILI multi-agent harness. `/akili-constitution` copies these into each project's `.agents/` directory.
- `bin/akili.js` installs commands, skills, and helper resources (including the agent templates) into Claude, OpenCode, and Google Antigravity config directories.
- `scripts/release.js` prepares controlled npm package releases.
- `docs/release-checklist.md` documents the release process.

## Development Rules

- Keep command prompts readable and tool-agnostic where possible.
- Do not add project-specific assumptions to reusable commands.
- Keep installer behavior safe: skip existing files by default and require `--force` to overwrite.
- Do not commit generated `.tgz` files or `node_modules/`.
- Do not commit service account keys, npm tokens, `.npmrc`, or local MCP config containing secrets.
- **Spec-to-Code Traceability:** Every commit made during `/akili-execute` must be prefixed with `[SPEC:<spec-path>]` (e.g. `[SPEC:changes/add-remember-me] message`). Trivial fast-tracked changes made via `/akili-quick` use the `[SPEC:quick/<name>]` prefix plus a one-line entry in `docs/specs/quick/quick-log.md`.
- **Trivial Fast-Track (`/akili-quick`):** Genuinely trivial, low-risk changes (copy edits, color/spacing tweaks using existing design tokens, small static text additions) may skip the full specify → execute → test → validate flow via `/akili-quick`, which makes the edit in one step and records minimal traceability. It has a strict triviality gate (cosmetic/copy-only, no behavior/data/API/auth/contract change, ≤ ~20 LOC in one component, design-token safe) and **must auto-escalate** to `/akili-specify` (Lite) or `/akili-propose` when a change exceeds that gate. Never route real features or logic changes through `/akili-quick`.
- **Request Classification & Bug Handling:** `/akili-propose` is the single entry point that classifies each request as **Bug**, **Change**, or **Trivial** (inferring from the request, asking one question if ambiguous) and routes it — the methodology adds no per-type command. Bugs follow a **Bug Track**: diagnose first (reproduction + confirmed root cause via `systematic-debugging`) in the proposal's **Bug Diagnosis** section, then `/akili-specify` runs in **Bug Mode**, which frames requirements around the corrected behavior and **requires a regression test** (red before the fix, green after). A purely cosmetic bug may still use `/akili-quick`; never propose a fix for a guessed root cause.
- **Pivot Protocol:** If execution invalidates approved specs, the agent must mark tasks blocked (`[~]`), record pivot details in `execution.md`, and obtain user sign-off.
- **Drift Auditing:** Run `/akili-audit` to detect differences between active codebase reality and the active UX/UI design and TRD.
- **CodeGraph Re-indexing:** Remind or execute the re-indexing command during `/akili-archive` to keep CodeGraph databases healthy.
- **Agent Guide Inheritance:** Root `CLAUDE.md`/`AGENTS.md` are the parent; modules with divergent conventions carry thin child guides referenced from a `## Module Guides` index in the parent. `/akili-execute` records `## Constitution Impact` notes when tasks create or reshape modules; `/akili-archive` syncs the guides and the CodeGraph; `/akili-audit` flags guide drift.
- **Multi-Agent Harness:** `/akili-execute` runs each task through a Leader → Implementer → Reviewer loop with a hard 3-attempt rework ceiling. `/akili-test` runs a Leader → Tester(s) harness where the Leader partitions testing into suites and delegates each to a Tester subagent (inline for trivial/Lite work; one Tester per independent suite, in parallel, otherwise), each with a bounded self-correction inner loop and a `PASS`/`FAIL`/`PRODUCT_BUG` output contract. Personas live in `.claude/templates/` (source) and project `.agents/` (deployed by `/akili-constitution`). Do not collapse these loops back into a single-agent flow.
- **Kaizen Loop:** `/akili-archive` runs a bounded retrospective (measure → learn → standardize → record) on every archive via the packaged `kaizen` skill, appending to the target project's `docs/specs/kaizen-log.md`. Lessons require a root cause + cited evidence; edits outside the log require HITL approval; `/akili-propose`, `/akili-specify`, `/akili-execute`, and `/akili-resume` read only the `## Active Lessons` digest. Lessons whose root cause is AKILI itself are flagged `Methodology` for upstreaming to this repository — apply the same loop when iterating this repo (dogfooding). Do not add a separate kaizen command.
- **Skill Governance:** the packaged skill set is curated, not accumulated. Every skill under `.claude/skills/` declares original author + license and a `metadata.binding` level — `core` (hard-wired to a command step), `conditional` (loaded when the work touches its domain, e.g. UI or animation), or `stack` (never referenced in command text; reaches agents via the project `## Skill Map` scaffolded by `/akili-constitution` Step 8D and per-task skill lists in `tasks.md`). New skills must pass the acceptance checklist in `docs/skills/governance.md` (need + binding + attribution + size + docs/CHANGELOG); a skill referenced by no command and no Skill Map is dead weight and must be removed or re-bound. Adaptation preserves original authorship (`adapted-by`, never replacing `author`).
- **Model Routing: enforced for subagents, guided for the main loop.** Model selection per AKILI-SPECS phase is documented in `docs/model-routing.md` (capability tiers + a per-tool registry) and scaffolded into each project's `AGENTS.md` / `CLAUDE.md` by `/akili-constitution` (Step 8C). Never add a `model:` key to **command** frontmatter and never inject models in the installer — a single value cannot serve both Claude Code (`opus`/`sonnet`/`haiku`) and OpenCode (`provider/model`), and it would break the model-agnostic install. Enforced bindings live only in the **Step 8E tool-native agent wrappers** (`.claude/agents/akili-*.md` / OpenCode agent config), which pin each persona to its tier's model; `/akili-execute` and `/akili-test` prefer those named agents when present. The Reviewer must run on a different model than the Implementer (author ≠ auditor). **Alias-first rule:** registries use floating aliases (`opus`/`sonnet`/`haiku`) wherever they exist so model generations change without edits; dated pins require a recorded reason. Commands emit a one-line, never-blocking **model checkpoint** in their setup step. `/akili-audit` reports Model Registry Drift; each release refreshes the default registry in `docs/model-routing.md`.

## Skill Usage

When working on tasks in this repository or when using the installed AKILI-SPECS methodology, load and apply the relevant available skills before implementation.

Use the packaged skills in `.claude/skills/` as the source of truth. Examples:

- Use `systematic-debugging` for bugs, test failures, and unexpected behavior.
- Use `frontend-design`, `ui-ux-pro-max`, `tailwind-design-system`, or `shadcn-ui` for UI work.
- Use `gsap-animation` for animation work (read the matching `references/` file for the task).
- Use `judgment-day` for blind adversarial design reviews during `/akili-specify`.
- Use `kaizen` for continuous-improvement retrospectives; `/akili-archive` loads it in its Kaizen Retrospective step.
- Use `cognitive-doc-design` when writing human-facing docs (PRD, TRD, requirements, reports, PR descriptions): lead with the answer, progressive disclosure, tables over prose.
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
