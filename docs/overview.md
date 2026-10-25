# AKILI Overview

The full capability map: every command, every skill, the mechanisms behind them, the install targets, the optional tools and a glossary. New here? Start with the [README](../README.md); the step-by-step flow is in [AKILI Flow](flow.md).

## What AKILI is

AKILI-SPECS is a constitution-first spec-driven methodology, packaged as slash commands and skills for Claude Code, OpenCode, Google Antigravity, OpenAI Codex CLI, Cursor and Grok Bot. It keeps product intent, UX direction, technical design, implementation tasks, tests and validation evidence in repository documentation, so humans and agents work from the same durable context instead of rediscovering it every session. It is 100% local methodology files. Each spec runs a propose, specify, execute, test, validate, archive loop; a Kaizen retrospective at archive time turns each spec's evidence into lessons for the next one. See [AKILI Flow](flow.md) for the lifecycle.

## Commands

Every packaged command, in two groups. The *Command* column is the invocation; the *Page* column links the command reference.

### Every change

The spec loop, in order, for one bounded change.

| Command | Use it to | Page |
|---|---|---|
| `/akili-constitution` | Start a repo or repair weak project context: baseline docs, `CLAUDE.md`, `AGENTS.md`, general spec templates and the `.agents/` multi-agent harness | [commands/akili-constitution.md](commands/akili-constitution.md) |
| `/akili-propose <change-name-or-spec-path>` | Align on intent before full specification; a bug is diagnosed here before any fix | [commands/akili-propose.md](commands/akili-propose.md) |
| `/akili-specify <spec-path>` | Plan one bounded change before code: `requirements.md`, `design.md`, `tasks.md` | [commands/akili-specify.md](commands/akili-specify.md) |
| `/akili-execute <spec-path>` | Implement approved tasks through the Leader → Implementer → Reviewer harness, with `execution.md` as the audit trail | [commands/akili-execute.md](commands/akili-execute.md) |
| `/akili-test <spec-path>` | Prove behavior with test evidence through the Leader → Tester(s) harness: `test-report.md` | [commands/akili-test.md](commands/akili-test.md) |
| `/akili-validate <spec-path>` | Audit conformance before completion: `validation-report.md` | [commands/akili-validate.md](commands/akili-validate.md) |
| `/akili-archive <spec-path>` | Close completed work after validation: an archived spec folder with `archive-summary.md` and one Kaizen entry file | [commands/akili-archive.md](commands/akili-archive.md) |

### Any time

These run outside the per-spec loop.

| Command | Use it to | Page |
|---|---|---|
| `/akili-quick <change-name>` | Make a genuinely trivial, low-risk change (copy edit, color or text tweak) in one step, with a one-line entry in `docs/specs/quick/quick-log.md`; it escalates when the change is bigger than trivial | [commands/akili-quick.md](commands/akili-quick.md) |
| `/akili-audit` | Detect and report drift between the specifications (PRD, UX/UI Design, TRD) and the implementation: one report per run at `docs/specs/audits/drift-<YYYY-MM-DD>[-<safe-branch>][-N].md` with a conformance score, categorized discrepancies, a conformance matrix and recommended remediation paths | [commands/akili-audit.md](commands/akili-audit.md) |
| `/akili-resume` | Resume work after a session break: a multi-spec dashboard with phase, progress, blockers and the next command; no arguments | [commands/akili-resume.md](commands/akili-resume.md) |
| `/akili-seo <site-domain>` | Set up Google Search Console ownership and audit SEO: `seo-setup-report.md` and `seo-audit-report.md` under `docs/specs/seo/<domain>/` | [commands/akili-seo.md](commands/akili-seo.md) |
| `/akili-security [<path>…]` | Audit a repository for security vulnerabilities behind a plan gate. Full findings stay in the run directory (always outside the target); the only tracked repository content written is a redacted index at `docs/specs/audits/security-<YYYY-MM-DD>[-<safe-branch>][-N].md`. Confirmed findings are routed to `/akili-propose bugfix/security-<YYYY-MM-DD>-r<N>-s<n>`. Not supported on native Windows: run it from WSL, Linux or macOS | [commands/akili-security.md](commands/akili-security.md) |
| `/akili-marketing <mode> [args]` | Draft LinkedIn, Instagram and Facebook social marketing as reviewable Markdown under `docs/marketing/` (brand voice, campaigns, calendar, posts); drafts only, it never publishes, and each post ends at a copy-paste block you place by hand | [commands/akili-marketing.md](commands/akili-marketing.md) |

## Skills by purpose

Every packaged skill, in five groups. *Binding* says how a skill loads: `core` is hard-wired to a command step, `conditional` loads when the work touches its domain, `stack` is chosen per project through the `## Skill Map` that `/akili-constitution` writes. The rules are in [Skill Governance](skills/governance.md); the table with origins is in the [Skill Reference](skills/README.md).

### Quality and process

| Skill | Binding | Use it for |
|---|---|---|
| [`brainstorming`](skills/brainstorming.md) | core | Clarifying ideas, scope, options and trade-offs before implementation |
| [`caveman`](skills/caveman.md) | core | Token-economy compression of transient agent output, never documents, HITL gates or verbatim evidence |
| [`cognitive-doc-design`](skills/cognitive-doc-design.md) | core | Human-facing docs that reduce cognitive load: lead with the answer, progressive disclosure, tables over prose |
| [`judgment-day`](skills/judgment-day.md) | core | Blind adversarial dual review of designs with bounded fix rounds |
| [`kaizen`](skills/kaizen.md) | core | The bounded two-phase continuous-improvement loop run by `/akili-archive`, plus Apply Mode for the pending backlog |
| [`systematic-debugging`](skills/systematic-debugging.md) | core | Root-cause investigation for bugs, test failures and unexpected behavior |
| [`tdd`](skills/tdd.md) | conditional | A red, then green loop with tests worth keeping, assigned per logic-heavy task |

### Frontend and design

| Skill | Binding | Use it for |
|---|---|---|
| [`angular-developer`](skills/angular-developer.md) | stack | Angular architecture, components, services, signals, forms, routing, testing, CLI |
| [`frontend-design`](skills/frontend-design.md) | conditional | Distinctive frontend UI and UX implementation (fallback when `ui-ux-pro-max` is unavailable), and for UI validation and testing support |
| [`gsap-animation`](skills/gsap-animation.md) | conditional | All GSAP animation work: a router `SKILL.md` plus per-topic references |
| [`react-doctor`](skills/react-doctor.md) | stack | React diagnostics after changes |
| [`shadcn-ui`](skills/shadcn-ui.md) | stack | shadcn/ui components, forms, themes, Tailwind integration |
| [`stitch-design`](skills/stitch-design.md) | conditional | Stitch prompt enhancement and design generation workflows (fallback UI chain with `frontend-design`) |
| [`tailwind-design-system`](skills/tailwind-design-system.md) | stack | Tailwind CSS v4 tokens, component systems, responsive patterns |
| [`ui-ux-pro-max`](skills/ui-ux-pro-max.md) | conditional | UI/UX design intelligence, palettes, typography, accessibility: the preferred UI/UX skill |
| [`vercel-react-best-practices`](skills/vercel-react-best-practices.md) | stack | React and Next.js performance and architecture guidance |

### Backend and architecture

| Skill | Binding | Use it for |
|---|---|---|
| [`ai-agent-development`](skills/ai-agent-development.md) | stack | Agent framework and runtime selection, agent architecture, AWS hosting choice, and the bridge from agent behavior to AKILI spec documents |
| [`api-design-principles`](skills/api-design-principles.md) | stack | REST and GraphQL API design and review |
| [`aws-serverless`](skills/aws-serverless.md) | stack | Lambda, API Gateway, DynamoDB, SQS/SNS, SAM/CDK |
| [`error-handling-patterns`](skills/error-handling-patterns.md) | stack | Exceptions, Result patterns, graceful degradation, reliability |
| [`nestjs-expert`](skills/nestjs-expert.md) | stack | NestJS modules, DI, guards, interceptors, testing, TypeORM/Mongoose |
| [`software-architect`](skills/software-architect.md) | core | NFRs as measurable quality-attribute scenarios, tactics, robust-vs-lite tier sizing, architecture styles, GoF pattern selection, C4 views and ADRs |

### Product

| Skill | Binding | Use it for |
|---|---|---|
| [`product-manager-toolkit`](skills/product-manager-toolkit.md) | core | Product discovery, PRDs, prioritization, interview analysis |

### Deliverables

Security audits, SEO audits, diagrams, social marketing and video deliverables sit beside the core spec loop; each fires at a specific point and tells you what, if anything, to install.

| Skill | Binding | Use it for |
|---|---|---|
| [`diagram-design`](skills/diagram-design.md) | conditional | Diagram slots as inline Mermaid, filled at `/akili-constitution` Steps 3-5 and `/akili-specify` Step 2.1, plus an optional Archify interactive view; nothing to install, Archify is optional |
| [`security-audit`](skills/security-audit.md) | core | The defensive, source-first full-repository security audit that `/akili-security` loads, with validated findings and a coverage ledger; nothing extra to install |
| [`seo-audit`](skills/seo-audit.md) | core | Technical, on-page, structured-data, international, generative-engine (GEO) and optional GA4/Clarity analytics audits, loaded by `/akili-seo`; its domain verification needs Python 3 with `google-auth` and `google-api-python-client` |
| [`social-marketing`](skills/social-marketing.md) | core | Native LinkedIn, Instagram and Facebook drafts (brand voice, hooks, campaign planning, per-platform rules), loaded by `/akili-marketing`; adapted from Sergey Bulaev's MIT skill packs. Draft-only: it never publishes; nothing extra to install |
| [`video-production`](skills/video-production.md) | conditional | The bridge between AKILI phases and the HyperFrames skills for specs whose Document Control records `Deliverable: video`; it fires at `/akili-specify` Video Mode, `/akili-test` render evidence and `/akili-validate`, and you install HyperFrames yourself; it never vendors HyperFrames |

## How AKILI works under the hood

The mechanisms behind the commands. Each line says what it does; the link goes to the page that owns the detail.

| Mechanism | One line | Read more |
|---|---|---|
| Multi-agent harness | `/akili-execute` runs each task through a Leader → Implementer → Reviewer loop with a hard ceiling of 3 rework attempts; `/akili-test` runs a Leader → Tester(s) loop | [Flow: Multi-Agent Harness](flow.md#6-multi-agent-harness-akili-execute-triad-and-akili-test-testers) |
| `.agents/` personas | The Leader, Implementer, Reviewer and Tester personas live in the project's `.agents/` directory, scaffolded by `/akili-constitution` | [Flow: Multi-Agent Harness](flow.md#6-multi-agent-harness-akili-execute-triad-and-akili-test-testers) |
| Kaizen Loop | Every `/akili-archive` runs a bounded retrospective that turns each spec's evidence into lessons and standards, no extra command | [Flow: The Kaizen Loop](flow.md#8-the-kaizen-loop) |
| Model routing (`akili routing`) | Capability tiers per phase; `akili routing` writes the project's model registry and, when you opt in, agent wrappers for the hosts you select | [CLI: Routing](cli.md#routing-akili-routing), [Model Routing](model-routing.md) |
| `akili doctor --agents` | Compares the project's `.agents/` personas to the packaged templates section by section; `--fix` upgrades them | [CLI: Persona Drift](cli.md#persona-drift-doctor---agents) |
| CodeGraph | A semantic code graph the commands prefer when `.codegraph/` exists; without it they fall back to `Glob` and `Grep` | [CLI: Prerequisites](cli.md#prerequisites) |
| Bug Track | `/akili-propose` classifies a request as a bug and diagnoses it first; `/akili-specify` then runs in Bug Mode and requires a regression test | [Flow: Handling Bugs](flow.md#handling-bugs) |
| Triviality gate (`/akili-quick`) | A change that is not cosmetic or copy-only, or is bigger than a tweak, stops and escalates to `/akili-specify` (Lite) or `/akili-propose` | [Flow: Fast-Track](flow.md#fast-track-for-trivial-changes) |
| Pivot Protocol | When execution invalidates approved specs, the task is marked blocked `[~]`, the pivot is recorded in `execution.md`, and the user signs off before work resumes | [Flow: The Pivot Protocol](flow.md#3-the-pivot-protocol) |
| Fleet execution | Independent specs can run in parallel, each in its own git worktree and branch with a complete AKILI session | [Flow: Multi-Spec Parallel Execution](flow.md#multi-spec-parallel-execution-fleet-of-sessions) |
| Context Discipline | Commands recommend `/compact` or `/clear` at the right boundary, because everything durable lives in repository files | [Flow: Context Discipline](flow.md#context-discipline-when-to-compact-when-to-clear) |
| Constitution's 3 project modes | `/akili-constitution` classifies the repo as Brand-new, Legacy or Active AKILI-SPECS and adjusts how it drafts, scans and preserves | [Flow: Project Modes](flow.md#project-modes) |
| Analytics phase (`/akili-seo`) | An opt-in, read-only Phase 2B audits GA4 and Microsoft Clarity (installation, consent signals, conversion events); behavior metrics are never claimed to affect ranking | [commands/akili-seo.md](commands/akili-seo.md) |

## Install targets

`akili init` and `akili install --tool all` cover the five desktop tools. Grok Bot is selected explicitly and is covered by neither.

| Target | Default path | In init | In --tool all | Routing wrappers | doctor |
|---|---|---|---|---|---|
| Claude Code | `~/.claude` | yes | yes | yes | yes |
| OpenCode | `~/.config/opencode` | yes | yes | yes | yes |
| Google Antigravity | `~/.gemini` | yes | yes | yes | yes |
| OpenAI Codex CLI | `$CODEX_HOME` if set, else `~/.codex` (resources) and `~/.agents/skills` (commands and skills) | yes | yes | yes | yes |
| Cursor | `$CURSOR_CONFIG_DIR` if set, else `~/.cursor` (resources) and `~/.agents/skills` (commands and skills) | yes | yes | yes | yes |
| [Grok Bot](cli.md#grok-bot---tool-grokbot) | `$AKILI_GROKBOT_TARGET` if set, else `/home/box/agent-data/workflows` (run on the box) | no | no | no | yes |

The full flag list and layouts are in the [CLI Reference](cli.md#install-targets).

## Optional tools

Every command runs without these; each row says what you lose.

| Tool | Used by | Without it |
|---|---|---|
| [CodeGraph](https://www.npmjs.com/package/@colbymchenry/codegraph) | `/akili-constitution` discovery scans, `/akili-audit` drift detection, `/akili-execute` and `/akili-test` worker briefs | Commands fall back to `Glob` and `Grep`; reports flag the lower-confidence scan |
| GitHub CLI (`gh`) | PR strategy in `/akili-execute` delivery, external-PR review flows | Manual PR creation and review in the browser |
| Python 3 with `google-auth` and `google-api-python-client` | `/akili-seo` domain verification (`scripts/gsc_verify.py`) | The rest of `/akili-seo` still runs; setup steps are in [CLI: `/akili-seo` Setup](cli.md#akili-seo-setup) |
| HyperFrames (installed by you) | `video-production`, for specs with `Deliverable: video` | A video spec stops at the skill's availability gate and prints the install route |
| [Archify](https://github.com/tt-a1i/archify) by tt-a1i (MIT licence): `npx skills add tt-a1i/archify` | `diagram-design`, for interactive diagram views | Install it yourself; AKILI references it and never ships or installs it. Without it, diagrams stay inline Mermaid and every command works unchanged |

## Glossary

| Term | Meaning |
|---|---|
| Spec | One bounded piece of work, described in a folder under `docs/specs/` by `requirements.md`, `design.md` and `tasks.md` |
| Spec path | The folder under `docs/specs/` for one spec, for example `changes/add-remember-me` |
| Constitution | Project-wide context that should not be rediscovered every session; `/akili-constitution` creates it |
| Proposal | A lightweight review document for intent, scope, options and risks |
| Requirement | A testable statement of expected behavior |
| Scenario | A concrete Given/When/Then example that proves a requirement |
| Task | A small executable unit linked to requirements and design sections |
| Archive | Completed AKILI-SPECS history moved under `docs/specs/archive/` by `/akili-archive` |
| Slash command | A command prompt you invoke by name, such as `/akili-specify`; the host tool loads it from a Markdown file |
| Anytime command | A command that runs outside the per-spec loop: `/akili-resume`, `/akili-audit`, `/akili-quick`, `/akili-seo`, `/akili-security`, `/akili-marketing` |
| Skill | A packaged Markdown guide an agent loads when a task needs domain-specific guidance |
| Binding | How a skill loads: `core`, `conditional` or `stack` (see *Skills by purpose*) |
| Kaizen | The continuous-improvement loop that turns each spec's evidence into lessons and standards |
| Harness | The multi-agent loop that runs a task: Leader → Implementer → Reviewer for `/akili-execute`, Leader → Tester(s) for `/akili-test` |
| Persona | A role definition file in the project's `.agents/` directory that a harness agent follows |
| Leader | The persona that picks the next task, delegates work, enforces the rework loop and updates `tasks.md` and `execution.md`; it does not write production code |
| Implementer | The persona that writes code strictly within the task's scope and runs the verification command before reporting |
| Reviewer | The persona that audits the diff read-only against requirements, design tokens and the TRD, and returns a structured PASS or FAIL |
| Tester | The persona `/akili-test` spawns per test suite to write and run the tests |
| Model routing | Choosing a model per phase by capability tier instead of by name; see [Model Routing](model-routing.md) |
| Tier | A capability class of model (T1 Architect, T2 Coder, T3 Auditor, T4 Context-Ingest, T5 Fast-Cheap, T6 Multimodal) |
| Bug Track | The path where `/akili-propose` diagnoses a bug and confirms its root cause before `/akili-specify` runs in Bug Mode with a required regression test |
| HITL | Human-in-the-loop: an approval pause where you decide before work continues, for example after Requirements, Design and Tasks in `/akili-specify` |
| Worktree | A separate git checkout on its own branch, used to run a second AKILI session in parallel |
| CodeGraph | A semantic knowledge graph of the codebase used for symbol lookup, call flow and impact checks |
| Drift | A difference between what the specifications say and what the codebase does, reported by `/akili-audit` |
| Pivot Protocol | The rule that execution which invalidates approved specs stops, records the pivot and waits for user sign-off |
| Apply Mode | The Kaizen mode in which you ask to apply the pending kaizen standardizations; it runs on the apply-capable branch (the pinned integration branch when one exists, otherwise the default branch) |
| Skill Map | The `## Skill Map` that `/akili-constitution` writes into the project's `AGENTS.md` and `CLAUDE.md`; it is how `stack` skills reach a project |
| Lite | The short spec depth for small bugfixes, copy updates and narrow UI tweaks: problem, affected requirement, scenario, focused task, verification command |
| Bug Mode | How `/akili-specify` runs for a bug: it frames requirements around the corrected behavior from the confirmed root cause and requires a regression test |
| Video Mode | How `/akili-specify` runs when the proposal's Document Control says `Deliverable: video`: it loads `video-production` before writing `requirements.md` |
| Document Control | The part of a proposal or spec where fields such as `Deliverable: video` and `Approval Mode` are recorded |
| Plan gate | The approval stop of `/akili-security`; it stops on every run |
| Run directory | The run directory (always outside the target) where `/akili-security` keeps its full findings; the redacted index is the only tracked content it writes |
| Project mode | How `/akili-constitution` classifies a repository: Brand-new (Seed Setup), Legacy (Discovery Setup) or Active AKILI-SPECS (Safe Update) |
| Triviality gate | The `/akili-quick` check that a change is cosmetic or copy-only, with no behavior, data, API or auth change; a change that fails it escalates |
| Agent wrapper | A tool-native agent file that pins a persona to its tier's model, written by `akili routing` only when you opt in |
| Phase 2B | The opt-in, read-only analytics phase of `/akili-seo` that audits GA4 and Microsoft Clarity |
| Context Discipline | Commands recommend `/compact` or `/clear` at the right boundary, because everything durable lives in repository files |
| Fleet execution | Running independent specs in parallel, each in its own worktree and branch with a complete AKILI session |

## I want to…

| I want to… | Use |
|---|---|
| Set up AKILI on a new or existing repository | `/akili-constitution` |
| Plan and ship a feature | `/akili-propose`, then `/akili-specify`, `/akili-execute`, `/akili-test`, `/akili-validate`, `/akili-archive` |
| Fix a bug properly | `/akili-propose` (Bug Track), then `/akili-specify` in Bug Mode |
| Change a button color or a line of copy | `/akili-quick <change-name>` |
| Pick up after a break | `/akili-resume` |
| Check whether the code still matches the specs | `/akili-audit` |
| Audit a repository for security vulnerabilities | `/akili-security` |
| Audit a site's SEO | `/akili-seo <site-domain>` |
| Draft LinkedIn, Instagram or Facebook posts | `/akili-marketing <mode> [args]` |
| Install AKILI into my tool | `akili init` |
| Choose models per phase | `akili routing` |
| Upgrade a project's personas | `akili doctor --agents --fix` |
| Run several specs in parallel | [Fleet execution](flow.md#multi-spec-parallel-execution-fleet-of-sessions) |
| Produce a video deliverable | Set `Deliverable: video` in the spec; the `video-production` skill takes over |
