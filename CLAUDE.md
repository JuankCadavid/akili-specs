# Claude Guidance

This repository packages the AKILI-SPECS methodology for reuse in Claude Code and OpenCode.

## Start Here

- Read `AGENTS.md` for repository-wide development and release rules.
- Read `README.md` for installation and methodology usage.
- Read `docs/release-checklist.md` before preparing or publishing a package release.

## Methodology Files

- Commands live in `.claude/commands/`.
- Skills live in `.claude/skills/`.
- The installer lives in `bin/akili.js`.
- Helper scripts live in `scripts/`.

## Skill Usage

When working on tasks in this repository or when using the installed AKILI-SPECS methodology, load and apply the relevant available skills before implementation.

Use the packaged skills in `.claude/skills/` as the source of truth. Examples:

- Use `systematic-debugging` for bugs, test failures, and unexpected behavior.
- Use `tdd` for test-first implementation of logic-heavy tasks (algorithms, business rules, contracts); the `/akili-execute` Leader assigns it per task — expected values come from `requirements.md` scenarios, seams from `design.md`.
- Use `frontend-design`, `ui-ux-pro-max`, `tailwind-design-system`, or `shadcn-ui` for UI work.
- Use `gsap-animation` for animation work (read the matching `references/` file for the task).
- Use `judgment-day` for blind adversarial design reviews during `/akili-specify`.
- Use `kaizen` for continuous-improvement retrospectives; `/akili-archive` loads it in its Kaizen Retrospective step.
- Use `software-architect` for TRD creation, NFR/quality-attribute identification, architecture style and pattern selection, and robust-vs-lite stack sizing; `/akili-constitution` loads it in its TRD step and `/akili-specify` for architecturally significant designs (read only the matching `references/` file per task).
- Use `cognitive-doc-design` when writing human-facing docs (PRD, TRD, requirements, reports, PR descriptions): lead with the answer, progressive disclosure, tables over prose.
- Use `caveman` for transient agent output only (inter-agent messages and progress narration in `/akili-execute` and `/akili-test`): compress style, never documents, HITL gates, or verbatim evidence — `cognitive-doc-design` owns artifacts; `caveman` owns transient agent output.
- Use `react-doctor` and `vercel-react-best-practices` for React/Next.js changes.
- Use `angular-developer` for Angular projects, components, services, routing, forms, signals, SSR, accessibility, styling, animations, testing, and CLI tooling.
- Use domain skills such as `nestjs-expert`, `aws-serverless`, `api-design-principles`, or `product-manager-toolkit` when the task matches.
- Use `seo-audit` for SEO audits and diagnosis; `/akili-seo` loads it in its audit phase.

If a task document lists required or recommended skills, follow that list first.

Skill curation follows `docs/skills/governance.md`: every skill declares original authorship and a `binding` level (`core` / `conditional` / `stack`); stack skills reach agents via the project `## Skill Map`, never via hardcoded command references. New skills must pass the governance acceptance checklist before entering `.claude/skills/`.

## CodeGraph

This repository has CodeGraph initialized under `.codegraph/` for faster semantic code exploration.

- Use CodeGraph for existing-project analysis, symbol lookup, call flow, and impact checks when `.codegraph/` exists.
- Do not commit generated CodeGraph database files; `.codegraph/.gitignore` excludes local database artifacts.
- Keep `.codegraph/config.json` focused on repository source and methodology scripts, not large snapshots or generated outputs.
- If CodeGraph is unavailable in another project, continue with normal `Glob`, `Grep`, and file reads.

## Release Discipline

Every user-facing methodology or installer change should be reflected in `CHANGELOG.md` under `Unreleased`.

Repository changes and npm package updates are controlled separately. Do not publish from uncommitted changes. Do not claim the npm package is updated until `npm publish` succeeds and a post-publish smoke test confirms the published version.

Use:

```bash
npm run release:patch
npm run verify:cli
npm run pack:dry-run
npm run release:status
git diff --check
npm whoami --registry=https://registry.npmjs.org/
```

Choose `release:minor` for new commands or install targets and `release:major` for breaking changes.

If publish fails, keep the release commit, document the blocker, and do not create a replacement version unless the failed version was actually published.

## Safety

- Never commit npm tokens, service account keys, `.npmrc`, or local MCP secrets.
- Never commit generated `.tgz` package files.
- Installer changes must preserve skip-by-default behavior unless the user passes `--force`.
