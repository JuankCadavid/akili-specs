<div align="center">

<pre>
 █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝
</pre>

# AKILI

### Supercharge Claude Code, OpenCode, and Google Antigravity with constitution-first spec intelligence

**Durable product context · traceable requirements · governed releases · 100% local methodology files**

<p>
  <a href="https://www.npmjs.com/package/akili-specs"><img alt="npm version" src="https://img.shields.io/npm/v/akili-specs?style=for-the-badge&label=npm"></a>
  <img alt="License MIT" src="https://img.shields.io/npm/l/akili-specs?style=for-the-badge&label=license&color=cfb600">
  <img alt="Node.js 18+" src="https://img.shields.io/badge/Node.js-18%2B-91c714?style=for-the-badge">
</p>

<p>
  <img alt="macOS supported" src="https://img.shields.io/badge/macOS-supported-1686c7?style=for-the-badge">
  <img alt="Linux supported" src="https://img.shields.io/badge/Linux-supported-1686c7?style=for-the-badge">
  <img alt="Windows supported" src="https://img.shields.io/badge/Windows-supported-1686c7?style=for-the-badge">
</p>

<p>
  <img alt="Claude Code supported" src="https://img.shields.io/badge/Claude%20Code-supported-7c3aed?style=for-the-badge">
  <img alt="OpenCode supported" src="https://img.shields.io/badge/OpenCode-supported-7c3aed?style=for-the-badge">
  <img alt="Google Antigravity supported" src="https://img.shields.io/badge/Google%20Antigravity-supported-7c3aed?style=for-the-badge">
  <img alt="CodeGraph aware" src="https://img.shields.io/badge/CodeGraph-aware-7c3aed?style=for-the-badge">
</p>

</div>

Portable Claude Code, OpenCode, and Google Antigravity configuration for the AKILI-SPECS methodology.

AKILI-SPECS is a constitution-first, spec-driven methodology for AI-assisted development. It keeps product intent, UX direction, technical design, implementation tasks, tests, and validation evidence in repository documentation so humans and agents can work from the same durable context.

## Docs

→ **[Documentation Hub](docs/README.md)**: full AKILI documentation<br>
→ **[Flow](docs/flow.md)**: constitution-to-archive lifecycle<br>
→ **[Model Routing](docs/model-routing.md)**: capability-tier model selection per AKILI-SPECS phase (Claude Code + OpenCode)<br>
→ **[Commands](docs/commands/README.md)**: slash command reference<br>
→ **[Skills](docs/skills/README.md)**: packaged skill reference<br>
→ **[CLI](docs/cli.md)**: `akili` install/update/list/doctor reference<br>
→ **[OpenSpec Comparison](docs/openspec-comparison.md)**: what AKILI borrows and how it differs<br>
→ **[Release Checklist](docs/release-checklist.md)**: controlled npm release process

## Repository Structure

- `.claude/commands/` — custom AKILI-SPECS command prompts
- `.claude/skills/` — required and preferred skills used by the methodology
- `.claude/templates/` — default Leader, Implementer, and Reviewer personas used by the multi-agent harness (deployed into project `.agents/`)
- `docs/` — human-facing documentation for the flow, CLI, commands, skills, and release process
- `scripts/` — helper scripts referenced by commands (e.g. `gsc_verify.py`)
- `.mcp.json.example` — reference MCP server configuration (e.g. `gsc`)
- `dotfiles/` — environment snapshots for Neovim and tmux

## Contents

- `.claude/commands/`
  - `akili-constitution.md`
  - `akili-propose.md`
  - `akili-specify.md`
  - `akili-execute.md`
  - `akili-test.md`
  - `akili-validate.md`
  - `akili-archive.md`
  - `akili-audit.md`
  - `akili-resume.md`
  - `akili-seo.md`
- `.claude/skills/`
  - `angular-developer`
  - `api-design-principles`
  - `aws-serverless`
  - `brainstorming`
  - `error-handling-patterns`
  - `frontend-design`
  - `gsap-core`
  - `gsap-frameworks`
  - `gsap-performance`
  - `gsap-plugins`
  - `gsap-react`
  - `gsap-scrolltrigger`
  - `gsap-timeline`
  - `gsap-utils`
  - `judgment-day`
  - `nestjs-expert`
  - `product-manager-toolkit`
  - `react-doctor`
  - `seo-audit`
  - `shadcn-ui`
  - `stitch-design`
  - `systematic-debugging`
  - `tailwind-design-system`
  - `ui-ux-pro-max`
  - `vercel-react-best-practices`
- `.claude/templates/`
  - `leader.md`
  - `implementer.md`
  - `reviewer.md`
- `docs/`
  - `flow.md`
  - `cli.md`
  - `commands/`
  - `skills/`
  - `openspec-comparison.md`

## Install

Install the methodology with the bundled CLI. The installer can target Claude, OpenCode, Google Antigravity, or multiple tools.

### Prerequisites

- Node.js 18 or newer
- `pnpm`, `npm`, or another Node package runner
- Claude Code, OpenCode, and/or Google Antigravity installed, depending on where you want to use the methodology

### Step 1: Choose The Target Tool

| Target | Use When | Default Install Path |
|---|---|---|
| Claude | You use Claude Code slash commands and Claude skills | `~/.claude` |
| OpenCode | You use OpenCode commands and skills | `~/.config/opencode` |
| Antigravity | You use Google Antigravity global workflows and skills | `~/.gemini` |
| Both | You switch between Claude Code and OpenCode | Claude + OpenCode paths |
| All | You use Claude, OpenCode, and Google Antigravity | All three paths |

### Step 2: Install

**Interactive Installation (Recommended):**
Run the `init` command to launch the interactive setup wizard, which will ask you about the tool and whether you want a global or local installation:

```bash
npx akili-specs init
```

**Manual Installation via Flags:**

Install globally for Claude (default):

```bash
npx akili-specs install
```

Install globally for OpenCode:

```bash
npx akili-specs install --tool opencode
```

Install locally to the current project workspace:

```bash
npx akili-specs install --tool both --local
```

### Step 3: Verify The Installation

Check Claude installation:

```bash
npx akili-specs doctor --tool claude
```

Check OpenCode installation:

```bash
npx akili-specs doctor --tool opencode
```

Check Antigravity installation:

```bash
npx akili-specs doctor --tool antigravity
```

Check all:

```bash
npx akili-specs doctor --tool all
```

Expected result: every command, skill, and helper resource shows `OK`.

### Step 4: Restart Your Tool

Restart Claude Code, OpenCode, or Antigravity after installation. Running sessions may not pick up new commands or skills until the tool restarts.

### Step 5: Confirm Commands Are Available

In your tool of choice, confirm AKILI commands are available (either as slash commands or workflows):

```text
/akili-constitution
/akili-propose
/akili-specify
/akili-execute
/akili-test
/akili-validate
/akili-archive
/akili-seo
```

Then start a project with:

```text
/akili-constitution
```

Or, if the project already has a strong baseline:

```text
/akili-propose add-my-feature
```

### Local Checkout Install

If you are installing from this repository before publishing to npm, run:

```bash
node bin/akili.js install
node bin/akili.js install --tool opencode
node bin/akili.js install --tool both
```

Verify local checkout install:

```bash
node bin/akili.js doctor --tool both
```

### Global Install

If you prefer a persistent global CLI:

```bash
npm install -g akili-specs
akili install
akili install --tool opencode
akili doctor --tool opencode
```

### Install Paths

Default targets:

```text
Claude:   ~/.claude
OpenCode: ~/.config/opencode
```

For Claude, the installer writes:

```text
~/.claude/commands/
~/.claude/skills/
~/.claude/akili/scripts/
~/.claude/akili/templates/      (leader, implementer, reviewer personas used by /akili-constitution)
~/.claude/akili/.mcp.json.example
```

For OpenCode, the installer writes:

```text
~/.config/opencode/commands/
~/.config/opencode/skills/
~/.config/opencode/akili/scripts/
~/.config/opencode/akili/templates/
~/.config/opencode/akili/.mcp.json.example
```

OpenCode loads global command markdown files from `~/.config/opencode/commands/` and skills from `~/.config/opencode/skills/`. Restart OpenCode after install or update so it loads the new files.

### Updating

Update Claude:

```bash
npx akili-specs update --tool claude --force
```

Update OpenCode:

```bash
npx akili-specs update --tool opencode --force
```

Update both:

```bash
npx akili-specs update --tool both --force
```

Use `--force` when you want packaged files to replace older installed files. Without `--force`, existing files are skipped.

### Releasing Package Updates

Repository changes do not update the published npm package automatically. Every published package update must have a new version.

Release policy:

- Commit repository changes separately from release version changes.
- Add `CHANGELOG.md` notes before preparing a release.
- Use `npm run release:status` to detect drift between local release files, npm, tags, and GitHub Releases.
- The `Release Status` GitHub Actions workflow runs the same drift check on pushes, pull requests, and manual dispatches.
- Publish only from a clean working tree after verification passes.
- Confirm npm authentication before publishing.
- Do not claim npm is updated until publish and smoke tests succeed.
- If publish fails, fix the blocker and retry the same unpublished version.

Use semantic versioning:

| Bump | Use For | Example |
|---|---|---|
| Patch | Documentation fixes, small command clarifications, installer fixes | `0.2.0` to `0.2.1` |
| Minor | New commands, new install targets, meaningful workflow additions | `0.2.0` to `0.3.0` |
| Major | Breaking command behavior or package install changes | `0.2.0` to `1.0.0` |

Controlled release flow:

1. Make repo changes.
2. Add notes under `CHANGELOG.md` > `Unreleased`.
3. Commit the changes.
4. Prepare the next version:

```bash
npm run release:patch
```

Or use `release:minor` / `release:major` when appropriate.

The release script updates `package.json`, moves the `Unreleased` changelog notes into a dated version section, and creates `releases/vX.Y.Z.md`.

Then verify and publish:

```bash
npm run verify:cli
npm run pack:dry-run
npm run release:status
git diff --check
git add package.json CHANGELOG.md releases/vX.Y.Z.md
git commit -m "chore(release): vX.Y.Z"
git tag vX.Y.Z
npm whoami --registry=https://registry.npmjs.org/
npm publish --access public --registry=https://registry.npmjs.org/
```

After publish, smoke test:

```bash
npx akili-specs@X.Y.Z list
npx akili-specs@X.Y.Z install --tool both --dry-run
npm view akili-specs version --registry=https://registry.npmjs.org/
npm run release:status
```

### CLI Commands

See the full [CLI Reference](docs/cli.md) for options, install paths, examples, safety rules, and troubleshooting.

| Command | Purpose |
|---|---|
| `akili install` | Install commands, skills, and helper resources |
| `akili update` | Reinstall packaged commands, skills, and helper resources |
| `akili list` | Show packaged commands, skills, and helper resources |
| `akili doctor` | Check whether expected files are installed |

Useful options:

```bash
akili install --dry-run
akili install --tool claude --target ./.claude
akili install --tool opencode --target ./.config/opencode
akili install --tool both --claude-target ./.claude --opencode-target ./.config/opencode
akili update --force
akili update --tool both --force
akili doctor --commands-only
akili doctor --tool opencode --skills-only
```

Installer safety rules:

- existing files are skipped by default
- use `--force` to overwrite existing files
- use `--dry-run` to preview changes
- use `--tool claude`, `--tool opencode`, or `--tool both` to choose the destination
- use `--target <path>` to install a single selected tool somewhere custom
- use `--claude-target <path>` and `--opencode-target <path>` with `--tool both`

The helper resources under the target `akili/` folder support commands such as `/akili-seo`, including the bundled Google Search Console verification helper.

### Troubleshooting

If commands do not appear:

- run `akili doctor --tool <claude|opencode|both>`
- restart Claude Code or OpenCode
- confirm you installed into the expected target path
- rerun install with `--force` if old files should be replaced

If you want to preview installation without writing files:

```bash
akili install --tool both --dry-run
```

### Manual Install

If you do not want to use the CLI, copy the repository `.claude/commands` and `.claude/skills` folders into your tool configuration location.

Typical global install target:

- `~/.claude/commands/`
- `~/.claude/skills/`

Typical OpenCode global install target:

- `~/.config/opencode/commands/`
- `~/.config/opencode/skills/`

Example:

```bash
cp -R .claude/commands/* ~/.claude/commands/
cp -R .claude/skills/* ~/.claude/skills/
```

Manual OpenCode example:

```bash
mkdir -p ~/.config/opencode/commands ~/.config/opencode/skills
cp -R .claude/commands/* ~/.config/opencode/commands/
cp -R .claude/skills/* ~/.config/opencode/skills/
```

## Dotfiles

The repository also includes editor and terminal configuration snapshots under `dotfiles/`:

- `dotfiles/.config/nvim/`
- `dotfiles/.tmux/`
- `dotfiles/.tmux.conf`

These are stored as portable references or backup material for the environment used with this methodology.

### Restore Neovim

```bash
mkdir -p ~/.config
cp -R dotfiles/.config/nvim ~/.config/
```

### Restore tmux

```bash
cp dotfiles/.tmux.conf ~/.tmux.conf
cp -R dotfiles/.tmux ~/.tmux
```

If you prefer a lighter restore, keep `~/.tmux.conf` and reinstall plugins separately instead of copying the full plugin snapshot.

## Start Here

See the full [Flow documentation](docs/flow.md) for artifacts, review gates, project modes, and spec folder shape.

Use this flow for normal feature work:

1. `/akili-constitution` - create or strengthen the project baseline.
2. `/akili-propose <change-name-or-spec-path>` - capture intent, scope, and reviewable direction.
3. `/akili-specify <spec-path>` - define one feature, module, bugfix, or enhancement.
4. `/akili-execute <spec-path>` - implement the next approved task.
5. `/akili-test <spec-path>` - prove the behavior with tests and traceability.
6. `/akili-validate <spec-path>` - audit conformance before calling the work done.
7. `/akili-archive <spec-path>` - preserve completed work and remove it from active specs.

Run `/akili-constitution` first in a new repository, after a major product pivot, or when the baseline docs are missing. For an established repository with a good baseline, start at `/akili-propose <change-name>` or `/akili-specify <spec-path>`.

`/akili-constitution` classifies the repository into one of three project modes:

- **Brand-new (Seed Setup):** little or no code or durable docs. Creates the baseline from user intent, chosen stack, assumptions, and open questions, and copies default `.agents/` personas verbatim.
- **Legacy (Discovery Setup):** real code exists but the AKILI-SPECS baseline does not. Inspects code, docs, architecture, tests, package manifests, and routes before drafting baseline docs, and customizes `.agents/` personas to the detected stack and design tokens.
- **Active AKILI-SPECS (Safe Update):** the AKILI-SPECS baseline and possibly customized `.agents/` already exist. Upgrades weak sections, fills missing files, and extends `.agents/` non-destructively — never overwrites custom persona rules.

For all three modes, `/akili-constitution` creates or enhances root `CLAUDE.md` and root `AGENTS.md` so Claude Code, OpenCode, and Google Antigravity receive the same project guidance.

For existing projects, CodeGraph is an optional acceleration path. If `.codegraph/` exists, agents should use it for semantic code exploration, symbol lookup, callers/callees, and impact checks. If `.codegraph/` is missing and the `codegraph` CLI is available, the agent should ask whether to run `codegraph init -i`. If CodeGraph is unavailable or declined, the methodology continues with normal `Glob`, `Grep`, and file reads.

Use `/akili-propose` when the change needs review before full specification. For very small, obvious work, you may start directly with `/akili-specify <spec-path>`.

## Command Map

See the full [Command Reference](docs/commands/README.md) for detailed pages per command.

| Command | Use When | Main Output |
|---|---|---|
| `/akili-constitution` | Starting a repo or repairing weak project context | `docs/prd.md`, UX/UI design, TRD, `docs/infrastructure.md`, general spec templates, `CLAUDE.md`, `AGENTS.md` guidance |
| `/akili-propose <change-name-or-spec-path>` | Aligning on intent before full specification (supports Figma/Jira MCP context) | `proposal.md` under `docs/specs/<spec-path>/` |
| `/akili-specify <spec-path>` | Planning one bounded change before code | `requirements.md`, `design.md`, `tasks.md` under `docs/specs/<spec-path>/` (includes Design Impact injection, LOC estimation and HITL menus) |
| `/akili-execute <spec-path>` | Implementing approved tasks via the Leader → Implementer → Reviewer harness | Code changes, updated `tasks.md`, `execution.md` with full PASS/FAIL audit trail |
| `/akili-test <spec-path>` | Adding or running test evidence | `test-report.md` with requirement-to-test traceability |
| `/akili-validate <spec-path>` | Checking implementation against the spec | `validation-report.md` with pass, warning, failure, and remediation items |
| `/akili-archive <spec-path>` | Closing completed work after validation | Archived spec folder under `docs/specs/archive/` with `archive-summary.md`, synced agent guides, CodeGraph re-index reminder |
| `/akili-audit` | Detecting drift between specs and codebase reality | `docs/specs/drift-report.md` with conformance score and discrepancy matrix |
| `/akili-resume` | Resuming work after a session break | Multi-spec dashboard with phase, progress, and next command recommendation |
| `/akili-seo <site-domain>` | Auditing deployed SEO and Search Console state | `seo-setup-report.md`, `seo-audit-report.md` |

## How To Choose The Right Depth

Use the lightest documentation that still makes the work clear and verifiable.

| Work Type | Recommended Depth | What To Capture |
|---|---|---|
| Small bugfix or UI tweak | Lite | Problem, affected requirement, scenario, focused task, verification command |
| Normal feature | Standard | Requirements, scenarios, design decisions, task breakdown, tests |
| High-risk change | Full | Business context, alternatives, data/API contracts, rollout, risks, observability, rollback |
| Cross-cutting architecture | Full plus constitution review | Updates to project baseline docs and affected specs |

Lite mode does not skip rigor. It keeps the documents short, but every requirement still needs a testable scenario and every task still needs a done criterion.

## Core Concepts

| Concept | Meaning |
|---|---|
| Constitution | Project-wide context that should not be rediscovered every session |
| Proposal | A lightweight review document for intent, scope, options, and risks |
| Spec path | A folder under `docs/specs/` for one bounded piece of work |
| Requirement | A testable statement of expected behavior |
| Scenario | A concrete Given/When/Then example that proves a requirement |
| Design | The technical and UX approach for satisfying requirements |
| Task | A small executable unit linked to requirements and design sections |
| Report | Evidence that the implementation was tested and validated |
| Archive | Completed AKILI-SPECS history moved under `docs/specs/archive/` |

## Spec Folder Shape

Each feature or change should live in one folder:

```text
docs/specs/<spec-path>/
├── proposal.md           # created by /akili-propose, optional but recommended
├── requirements.md
├── design.md
├── tasks.md
├── execution.md          # created by /akili-execute
├── test-report.md        # created by /akili-test
├── validation-report.md  # created by /akili-validate
└── archive-summary.md    # created by /akili-archive before moving
```

Choose paths that describe the domain and intent:

```text
docs/specs/loan/
docs/specs/enhancements/renewals/
docs/specs/admin/user-management/
docs/specs/bugfix/login-redirect/
docs/specs/changes/add-remember-me/
```

When `/akili-propose add-remember-me` receives a bare change name, it defaults to `docs/specs/changes/add-remember-me/`. When it receives a nested path such as `bugfix/login-redirect`, it uses that path directly.

## Requirement Delta Preview

Proposals can include a lightweight delta preview. This makes reviews faster for brownfield work:

```markdown
## Requirement Delta Preview

### ADDED Requirements

- The system SHALL allow users to opt into extended sessions.

### MODIFIED Requirements

- Session expiration changes from a fixed timeout to configurable timeout policies.

### REMOVED Requirements

- Legacy session persistence behavior is removed after migration.
```

During `/akili-specify`, these previews become full requirements, scenarios, design decisions, and tasks.

## Writing Good Requirements

Write requirements as behavior contracts, not implementation plans.

Use this shape when possible:

```markdown
### Requirement: Session Expiration

The system SHALL expire inactive user sessions after the configured timeout.

#### Scenario: Idle timeout

- GIVEN an authenticated user has an active session
- WHEN the session remains inactive past the configured timeout
- THEN the system invalidates the session
- AND the user must authenticate again before accessing protected pages
- BUT it must NOT invalidate the session if a keep-alive ping was received
- AND IT MUST log the expiration event in the audit trail
```

Good requirements are:

- observable by a user, system, API client, or operator
- measurable enough to test
- equipped with rigorous negative constraints (`BUT it must NOT`) and strict validations (`AND IT MUST`) for boundary cases
- independent from internal class names or library choices
- linked to at least one implementation task
- covered by test evidence or an explicit accepted gap

## Review Points

Before implementation, review:

- whether the problem and scope are clear
- whether every requirement has at least one scenario
- whether design decisions explain trade-offs instead of only listing files
- whether tasks are small enough to execute independently
- whether every task has verification criteria

Before completion, review:

- whether all intended tasks are complete
- whether tests cover the key scenarios
- whether validation found unresolved failures
- whether the spec should be updated based on implementation discoveries

## Practical Example

For a new admin user-management feature:

```text
/akili-constitution
/akili-propose admin/user-management
/akili-specify admin/user-management
/akili-execute admin/user-management
/akili-test admin/user-management
/akili-validate admin/user-management
/akili-archive admin/user-management
```

For a small login redirect bugfix in an established repo:

```text
/akili-specify bugfix/login-redirect
/akili-execute bugfix/login-redirect
/akili-test bugfix/login-redirect
/akili-validate bugfix/login-redirect
/akili-archive bugfix/login-redirect
```

For a reviewable named change using the default `changes/` path:

```text
/akili-propose add-remember-me
/akili-specify changes/add-remember-me
/akili-execute changes/add-remember-me
/akili-test changes/add-remember-me
/akili-validate changes/add-remember-me
/akili-archive changes/add-remember-me
```

## Planned Improvements Inspired By OpenSpec

OpenSpec has useful ideas that fit this methodology well. Some are now supported through `/akili-propose` and `/akili-archive`. Remaining planned improvements:

See [OpenSpec Comparison](docs/openspec-comparison.md) for the current AKILI comparison and documentation-pattern notes.

- automated sync lifecycle for completed specs
- schema-style workflow templates for feature, bugfix, migration, SEO, and research-first work
- broader command portability beyond Claude-specific command files

### Auxiliary commands

- `/akili-audit` — Detect and report drift between the project's specifications (PRD, UX/UI Design, TRD) and the actual implementation. Produces `docs/specs/drift-report.md` with a conformance score, categorized discrepancies (High/Medium/Low), a conformance matrix, and recommended remediation paths. Run independently or after major implementation milestones.

- `/akili-resume` — Resume work after a session break by scanning all active specs under `docs/specs/` and presenting a multi-spec dashboard. Shows current phase, progress bars, last action, blockers, and recommends the next command. If only one spec is active, goes directly to a detailed briefing. No arguments required.

- `/akili-seo <site-domain>` — SEO setup & audit via Google Search Console. Verifies a domain through DNS TXT using a service account, adds the property to GSC, then audits index coverage, sitemaps, structured data, search analytics, server-side render, internal linking, and on-page SEO (titles, metas, headings, canonicals, hreflang) using the packaged `seo-audit` skill. Produces `seo-setup-report.md` and `seo-audit-report.md` under `docs/specs/seo/<domain>/`, including a copy-paste implementation prompt for fixing every High-severity finding.

  Dependencies bundled with this repo:

  - `scripts/gsc_verify.py` — Site Verification API helper (token + verify), because the `gsc` MCP only wraps Search Console, not Site Verification.
  - `.mcp.json.example` — reference MCP server entry for `@mikusnuz/gsc-mcp`.

  Setup once per environment:

  1. Enable **Site Verification API** and **Search Console API** in your Google Cloud project.
  2. Create a service account, download its JSON key, store outside the repo.
  3. Install Python deps: `pip install google-auth google-api-python-client`.
  4. Copy the `gsc` block from `.mcp.json.example` into your global `~/.claude.json` (or a project `.mcp.json`) and set `GSC_SERVICE_ACCOUNT_KEY_PATH` to the absolute path of the key.

## Spec Paths

Commands accept a relative path under `docs/specs/`, not only a flat module name.

Examples:

- `loan`
- `enhancements/renewals`
- `admin/user-management`

## Dependencies

Included skills cover the default methodology path, including `ui-ux-pro-max`.

Fallback rule:

- when `ui-ux-pro-max` is unavailable, use `frontend-design` + `stitch-design` for UX/UI design work and `frontend-design` for UI validation/testing support.

## Methodology Contract

- **User-Facing Summaries:** All major commands (`/akili-propose`, `/akili-specify`, `/akili-execute`, `/akili-validate`, `/akili-test`, `/akili-constitution`) generate a short, digestible summary on the screen before proceeding to the next step, ensuring developers always understand what the agent just did.
- `/akili-constitution` establishes the project baseline docs (`docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/infrastructure.md`) and `docs/specs/general-setup/` templates, and scaffolds the project `.agents/` harness (Leader, Implementer, Reviewer).
- `/akili-propose` creates a lightweight proposal before full specification. Evaluates massive instructions for **Scope Chunking** to split work into manageable modules. Integrates with **Figma MCP** and **Jira MCP** to extract visual context, requirements, and user stories.
- `/akili-specify` must follow those templates when generating module specs. Enforces **Human-in-the-loop (HITL)** approval pauses after Requirements, Design, and Tasks. Promotes rigorous BDD scenarios (`BUT it must NOT`, `AND IT MUST`), allows blind adversarial design reviews via the `judgment-day` skill, outputs a final **Lines of Code (LOC) estimate** to recommend a safe Pull Request strategy, and explicitly injects **Design Impact** rules (from Figma contexts) into UI tasks and components.
- `/akili-execute` orchestrates a Leader → Implementer → Reviewer rework loop (max 3 retries) to implement tasks from an approved spec path.
- `/akili-test` validates requirement-to-test traceability, explicitly checking for negative constraints and strict boundaries.
- `/akili-validate` audits implementation conformance against the spec (including rigorous boundary validations) and constitutional baseline.
- `/akili-archive` preserves completed specs under `docs/specs/archive/` after validation, syncs agent guides (child `CLAUDE.md`/`AGENTS.md` + the parent `## Module Guides` index) from the spec's `## Constitution Impact` notes, and recommends a CodeGraph re-index.
- `/akili-seo` operates outside the main spec lifecycle: it provisions Google Search Console ownership for a domain and produces a standalone SEO audit under `docs/specs/seo/<domain>/`. Run it any time after deployment; rerun after major content or schema changes.

## Multi-Agent Harness Engineering

`/akili-execute` is not a single-agent script. It is a coordinated triad of specialized roles that share the same spec, the same constitution, and the same audit trail. The harness exists to remove confirmation bias from review (an independent auditor instead of the same agent that wrote the code), to keep each role's context window small and focused, and to enforce design-token and constitutional discipline through a hard PASS/FAIL gate.

Roles live in the project's `.agents/` directory (scaffolded by `/akili-constitution`):

| Role | File | Responsibilities |
|---|---|---|
| Leader | `.agents/leader.md` | Orchestration. Picks the next eligible task, delegates, enforces the rework loop, updates `tasks.md` and `execution.md`, commits with `[SPEC:<spec-path>]`. |
| Implementer | `.agents/implementer.md` | Writes and tests the code. Strictly task-scoped, must follow design tokens from `docs/ux-ui/design.md`, must run the verification command before reporting. |
| Reviewer | `.agents/reviewer.md` | Read-only spec audit. Compares the diff against requirements, design tokens, the TRD, and stability. Outputs a structured PASS or FAIL with *Discovered Issue*, *Violated Rule*, and *Remediation Suggestion* for each finding. |

The Leader runs each task through this loop:

```text
Leader picks the next task → spawns Implementer with task + persona
Implementer writes code and runs verification → reports back
Leader extracts git diff → spawns Reviewer with diff + persona
Reviewer emits STATUS: PASS or STATUS: FAIL

if PASS  → update tasks.md, append execution.md, commit, advance
if FAIL  → log feedback; if attempts < 3, respawn Implementer with the Reviewer's findings
if 3 consecutive FAILs → HALT, mark task [~], present full audit trail for human guidance
```

**Guardrails:**

- **Maximum retries.** A hard ceiling of 3 rework attempts per task prevents infinite loops and token waste.
- **Structured feedback.** The Reviewer's report is passed back unchanged to the next Implementer spawn — no paraphrasing.
- **Pivot protocol.** If discovery proves the spec itself is wrong (not the implementation), the loop stops immediately and a `## Pivot Record` is opened in `execution.md` for user sign-off — rework retries are not consumed on a broken spec.
- **Cross-tool.** `.agents/` is pure Markdown + YAML frontmatter and is resolved relative to the active workspace, so the same harness runs under Claude Code, OpenCode, and Google Antigravity (the latter invokes `invoke_subagent` using the same persona files).

`/akili-constitution` classifies the repository into one of three modes and seeds `.agents/` accordingly:

| Mode | When | `.agents/` Behavior |
|---|---|---|
| Brand-new | No code, no docs | Copies the default Leader/Implementer/Reviewer templates verbatim |
| Legacy | Real code, no AKILI-SPECS baseline | Copies defaults and customizes them with detected stack, design tokens, lint and test commands |
| Active AKILI-SPECS | Baseline already exists | Preserves customized `.agents/` files in place and only upgrades or fills gaps non-destructively |

## Capability-Tier Model Routing

Not every model is best at every job. AKILI routes each AKILI-SPECS phase to the model matched to its
dominant demand using six **capability tiers** — Architect, Coder, Auditor, Context-Ingest,
Fast-Cheap, and Multimodal. A single editable **registry** binds each tier to a concrete model
**per tool**, so model upgrades are a one-line edit rather than a rewrite.

This is **guidance-first and model-agnostic**: no `model:` frontmatter is added to commands and the
installer injects nothing. You switch models yourself (Claude Code `/model`, OpenCode model
selector), and `/akili-constitution` scaffolds a `## Model Routing` registry into each project's
`AGENTS.md` / `CLAUDE.md`.

Key principles: **ARCHITECT = BUILDER** (the model that designs also builds), **author ≠ auditor**
(the Reviewer runs on a different model than the Implementer), reserve deep-reasoning models for
`/akili-propose` and `/akili-validate`, and use fast/cheap models for the tasks split and `/akili-archive`.

See **[docs/model-routing.md](docs/model-routing.md)** for the tiers, the full phase→tier mapping,
and the default registry for Claude Code (PRO) and OpenCode Go.

## Host Assumptions

- The host Claude environment can ask follow-up questions to the user during command execution.
- The host environment can load local skills referenced by the commands.
- Repository-specific build, lint, and test commands should be preferred over hardcoded stack assumptions.

## Notes

- Commands were sourced from the current global Claude command setup.
- Skills were copied with their bundled references and helper assets.
- This repository stores the current methodology baseline so it can be reused or versioned independently.
- Dotfiles are snapshots of the working environment and may include plugin source copies for portability.
