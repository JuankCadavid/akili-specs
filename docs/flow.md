# JCSPECS Flow

JCSPECS keeps durable product, design, implementation, test, and validation context in repository files so agents do not have to infer the same project reality every session.

The workflow is inspired by OpenSpec's artifact-guided pattern, but JCSPECS adds a project constitution step, Claude/OpenCode skills, and explicit validation evidence before archive.

## Philosophy

```text
→ constitution before feature work
→ reviewable intent before implementation
→ behavior requirements before code
→ small verified tasks over broad rewrites
→ evidence before archive
```

## Primary Lifecycle

```text
You: /sdd-constitution
AI:  Creates or strengthens the project baseline:
     ✓ docs/prd.md
     ✓ docs/system-design/design.md
     ✓ docs/detailed-design/detailed-design.md
     ✓ docs/specs/general-setup/
     ✓ CLAUDE.md and AGENTS.md

You: /sdd-propose add-remember-me
AI:  Creates docs/specs/changes/add-remember-me/proposal.md
     ✓ problem, scope, non-goals
     ✓ affected systems
     ✓ requirement delta preview
     ✓ approach options and recommendation

You: /sdd-specify changes/add-remember-me
AI:  Creates or updates:
     ✓ requirements.md
     ✓ design.md
     ✓ tasks.md

You: /sdd-execute changes/add-remember-me
AI:  Implements the next approved task only
     ✓ updates tasks.md
     ✓ appends execution.md
     ✓ records verification evidence

You: /sdd-test changes/add-remember-me
AI:  Creates test-report.md with requirement-to-test traceability

You: /sdd-validate changes/add-remember-me
AI:  Creates validation-report.md with PASS/WARN/FAIL/BLOCKED findings

You: /sdd-archive changes/add-remember-me
AI:  Moves completed work into docs/specs/archive/
```

## Project Modes

`/sdd-constitution` begins by classifying the repository.

| Mode | Meaning | Constitution Behavior |
|---|---|---|
| New project | Little or no application code or durable docs exist | Draft baseline from user intent, chosen stack, assumptions, and open questions |
| Existing project | Code, package manifests, routes, tests, infra, or docs already exist | Inspect repository reality before drafting or enhancing baseline docs |

For existing projects, CodeGraph is preferred when `.codegraph/` exists. If CodeGraph is missing but the CLI is available, the agent should ask before running `codegraph init -i`. If CodeGraph is unavailable or declined, normal file and content searches are used.

## Artifacts

| Artifact | Created By | Purpose |
|---|---|---|
| `docs/prd.md` | `/sdd-constitution` | Product purpose, personas, goals, scope, success metrics |
| `docs/system-design/design.md` | `/sdd-constitution` | UX system, flows, screen inventory, tokens, accessibility expectations |
| `docs/detailed-design/detailed-design.md` | `/sdd-constitution` | Technical architecture, modules, data, APIs, integrations, testing strategy |
| `docs/specs/general-setup/` | `/sdd-constitution` | Project-specific templates for future specs |
| `docs/specs/<spec-path>/proposal.md` | `/sdd-propose` | Reviewable intent, scope, options, and risks |
| `docs/specs/<spec-path>/requirements.md` | `/sdd-specify` | Behavior contracts and scenarios |
| `docs/specs/<spec-path>/design.md` | `/sdd-specify` | Implementation approach and trade-offs |
| `docs/specs/<spec-path>/tasks.md` | `/sdd-specify` | Small executable tasks with verification |
| `docs/specs/<spec-path>/execution.md` | `/sdd-execute` | Task execution history and evidence |
| `docs/specs/<spec-path>/test-report.md` | `/sdd-test` | Requirement-to-test matrix and coverage gaps |
| `docs/specs/<spec-path>/validation-report.md` | `/sdd-validate` | Final conformance audit |
| `docs/specs/archive/.../archive-summary.md` | `/sdd-archive` | Historical closure record |

## Review Gates

JCSPECS keeps humans in control at each important transition.

| Gate | Before Moving On, Confirm |
|---|---|
| Constitution | Baseline docs reflect the actual product and architecture |
| Proposal | Problem, scope, non-goals, and recommended approach are approved |
| Requirements | Observable behavior and scenarios are testable |
| Design | Technical approach fits the current repository |
| Tasks | Work is small enough to execute and verify incrementally |
| Execution | Each completed task has verification evidence |
| Testing | Key requirements have automated or accepted manual evidence |
| Validation | No unresolved FAIL findings remain |
| Archive | Warnings and follow-ups are accepted |

## Documentation Depth

Use the lightest documentation that still makes the work clear and verifiable.

| Depth | Use For | Capture |
|---|---|---|
| Lite | Small bugfixes, copy updates, narrow UI tweaks | Problem, scenario, focused task, verification command |
| Standard | Normal features and enhancements | Requirements, scenarios, design decisions, tasks, tests |
| Full | Risky, cross-cutting, API, data, auth, migration, or SEO work | Alternatives, rollout, risks, observability, rollback, explicit traceability |

Lite mode does not skip rigor. Requirements still need scenarios, tasks still need done criteria, and validation still needs evidence.

## Spec Folder Shape

```text
docs/specs/<spec-path>/
├── proposal.md
├── requirements.md
├── design.md
├── tasks.md
├── execution.md
├── test-report.md
├── validation-report.md
└── archive-summary.md
```

Common spec paths:

```text
docs/specs/changes/add-remember-me/
docs/specs/enhancements/renewals/
docs/specs/admin/user-management/
docs/specs/bugfix/login-redirect/
docs/specs/seo/example.com/
```

## Shortcut Paths

For a small, obvious change in a repository with a strong baseline, you may start at `/sdd-specify <spec-path>`.

For unclear, risky, cross-functional, or stakeholder-sensitive work, start at `/sdd-propose <change-name-or-spec-path>`.

For a new repository, stale documentation, or a major product pivot, start at `/sdd-constitution`.
