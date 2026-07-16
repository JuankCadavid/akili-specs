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
     ✓ docs/ux-ui/design.md
     ✓ docs/trd/trd.md
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
AI:  Runs the Leader → Implementer → Reviewer harness on the next approved task
     ✓ Implementer writes code and runs verification
     ✓ Reviewer audits the diff and emits STATUS: PASS or STATUS: FAIL
     ✓ Up to 3 rework attempts on FAIL, then HALT for human guidance
     ✓ updates tasks.md
     ✓ appends execution.md with full PASS/FAIL audit trail
     ✓ commits with [SPEC:<spec-path>] and records verification evidence

You: /sdd-test changes/add-remember-me
AI:  Creates test-report.md with requirement-to-test traceability (supports automated parsing via `scripts/parse_tests.js`)

You: /sdd-validate changes/add-remember-me
AI:  Creates validation-report.md with PASS/WARN/FAIL/BLOCKED findings

You: /sdd-archive changes/add-remember-me
AI:  Moves completed work into docs/specs/archive/ and refreshes CodeGraph

Independent Auditing:
You: /sdd-audit
AI:  Scans codebase and detects drift against baselines, generating docs/specs/drift-report.md
```

## Project Modes

`/sdd-constitution` begins by classifying the repository into one of three modes. Each mode adjusts how aggressively the constitution drafts, scans, or preserves existing material — and how the project `.agents/` harness is scaffolded.

| Mode | Meaning | Constitution Behavior | `.agents/` Behavior |
|---|---|---|---|
| Brand-new (Seed Setup) | Little or no application code, no SDD docs, starting from scratch | Draft baseline from user intent, chosen stack, assumptions, and open questions | Copy default Leader / Implementer / Reviewer personas verbatim |
| Legacy (Discovery Setup) | Real code, package manifests, routes, tests exist; SDD baseline missing or skeletal | Inspect repository reality (CodeGraph preferred) before drafting; synthesize baseline from evidence | Copy defaults then customize with detected stack, design tokens, lint and test commands |
| Active SDD (Safe Update) | SDD baseline and possibly customized `.agents/` already in place | Upgrade weak sections, fill missing files, preserve custom rules | Never overwrite existing personas — append only the minimal upgrade blocks needed |

For Legacy and Active-SDD modes, CodeGraph is preferred when `.codegraph/` exists. If CodeGraph is missing but the CLI is available, the agent should ask before running `codegraph init -i`. If CodeGraph is unavailable or declined, normal file and content searches are used.

## Artifacts

| Artifact | Created By | Purpose |
|---|---|---|
| `docs/prd.md` | `/sdd-constitution` | Product purpose, personas, goals, scope, success metrics |
| `docs/ux-ui/design.md` | `/sdd-constitution` | UX system, flows, screen inventory, tokens, accessibility expectations |
| `docs/trd/trd.md` | `/sdd-constitution` | Technical architecture, modules, data, APIs, integrations, testing strategy |
| `docs/specs/general-setup/` | `/sdd-constitution` | Project-specific templates for future specs |
| `docs/specs/<spec-path>/proposal.md` | `/sdd-propose` | Reviewable intent, scope, options, and risks |
| `docs/specs/<spec-path>/requirements.md` | `/sdd-specify` | Behavior contracts and scenarios |
| `docs/specs/<spec-path>/design.md` | `/sdd-specify` | Implementation approach and trade-offs |
| `docs/specs/<spec-path>/tasks.md` | `/sdd-specify` | Small executable tasks with verification |
| `docs/specs/<spec-path>/execution.md` | `/sdd-execute` | Task execution history and evidence |
| `docs/specs/<spec-path>/test-report.md` | `/sdd-test` | Requirement-to-test matrix and coverage gaps |
| `docs/specs/<spec-path>/validation-report.md` | `/sdd-validate` | Final conformance audit |
| `docs/specs/drift-report.md` | `/sdd-audit` | Conformance auditing of documentation vs. codebase reality |
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

---

## Advanced Engineering Capabilities

To support robust, long-term development cycles, JCSPECS includes the following specialized workflows:

### 1. Spec-to-Code Traceability (Git & Comments)
To establish high-traceability between spec files and source code:
* **Commit Messages:** Every commit made during `/sdd-execute` must be prefixed with `[SPEC:<spec-path>]` (e.g. `git commit -m "[SPEC:changes/add-remember-me] implement secure cookie storage"`).
* **Comment Tracing:** For complex algorithms, API entry points, or core models, developers/agents should place a reference comment: `// @sdd-spec <spec-path>`.

### 2. Specification Drift Auditing (`/sdd-audit`)
Run `/sdd-audit` independently to verify that the active codebase reflects active documentation. The command produces `docs/specs/drift-report.md` detailing:
* **Stale Specifications:** Documented endpoints/modules missing from code.
* **Undocumented Code:** Active code additions completely missing from the PRD, UX/UI design, or TRD docs.
* **Styling/Architecture Violations:** Active code violating styling tokens or engineering guidelines.
* **Agent Guide Drift:** Modules lacking a needed child `CLAUDE.md`/`AGENTS.md`, child guides missing from the parent's `## Module Guides` index, or root-guide structure descriptions that no longer match the codebase.

### 3. The Pivot Protocol
If discovery during `/sdd-execute` invalidates requirements or design rules:
1. Mark the current task in `tasks.md` as `[~]` (blocked).
2. Append a `## Pivot Record: <Task ID>` under `execution.md` explaining the conflict, technical constraints, and proposed options.
3. Update `requirements.md`, `design.md`, and/or `tasks.md` in the spec folder.
4. Obtain user sign-off on the pivot before resuming execution.

### 4. CodeGraph Refresh Trigger
When compiling the `archive-summary.md` and moving folders to the archive via `/sdd-archive`:
* The agent detects if `.codegraph/` configuration folders are present.
* The agent reminds or executes the re-indexing command (e.g., `codegraph index`) to guarantee semantic search utilities remain highly functional for subsequent sessions.

### 5. Automated Test Reporting (`scripts/parse_tests.js`)
Rather than manually compiling assertion results during `/sdd-test`:
1. Execute tests outputting to JSON (e.g. `jest --json --outputFile=jest-results.json` or `vitest --reporter=json`).
2. Run `node <path-to-sdd-jc>/scripts/parse_tests.js jest-results.json` to generate the JCSPECS matrix table automatically for inclusion inside `test-report.md`.

### 6. Multi-Agent Harness (`/sdd-execute` Triad)

`/sdd-execute` is implemented as a multi-agent orchestration rather than a single-agent script. The Leader role does not write production code; it delegates implementation and audit to two subordinate roles, then enforces a strict PASS/FAIL gate before the task advances.

**Roles** — all three live in the project's `.agents/` directory, scaffolded by `/sdd-constitution`:

| Role | File | Responsibilities |
|---|---|---|
| Leader | `.agents/leader.md` | Picks the next eligible task, delegates work, enforces the rework loop, updates `tasks.md` and `execution.md`, commits with `[SPEC:<spec-path>]` |
| Implementer | `.agents/implementer.md` | Writes code strictly within task scope, applies design tokens from `docs/ux-ui/design.md`, runs the verification command before reporting |
| Reviewer | `.agents/reviewer.md` | Read-only diff audit against requirements, design tokens, and the TRD; outputs a structured PASS or FAIL with *Discovered Issue*, *Violated Rule*, and *Remediation Suggestion* |

**Loop:**

```text
Leader picks the next task → spawns Implementer with task + persona
Implementer writes code, runs verification → reports back
Leader extracts git diff → spawns Reviewer with diff + persona
Reviewer returns STATUS: PASS, STATUS: FAIL, or STATUS: FATAL_FAIL

if PASS → update tasks.md, append execution.md, commit, advance
if FAIL and attempts < 3 → respawn Implementer with the Reviewer's structured findings
if FATAL_FAIL → abort loop immediately, mark task [~], trigger Pivot Protocol
if 3 consecutive FAILs → HALT, mark task [~], present audit trail
```

**Why this exists:**

- **Eliminates confirmation bias.** The same agent that writes code does not also approve it.
- **Keeps each context tight.** Each role sees only the slice of spec it needs.
- **Hard PASS/FAIL gate.** Design tokens, requirements conformance, and stability are enforced before the task is marked `[x]`.

**Guardrails & Token Optimization:**

- **Maximum retries.** A hard ceiling of 3 rework attempts per task.
- **Fail-Fast (FATAL_FAIL).** Reviewer aborts the loop on critical architectural violations to save tokens.
- **Diff-Only Review.** The Reviewer reads only the git diff to drastically reduce context window size.
- **Structured feedback.** The Reviewer's FAIL report is forwarded unchanged to the next Implementer spawn.
- **Pivot Protocol takes precedence.** If discovery proves the spec itself is wrong, the loop stops immediately; rework retries are not consumed on a broken spec.

**Cross-tool compatibility:**

The `.agents/` directory is pure Markdown + YAML frontmatter and is resolved relative to the active workspace, so the harness runs under Claude Code, OpenCode, and Google Antigravity. Antigravity invokes `invoke_subagent` with prompts read from `.agents/`; Claude Code and OpenCode delegate via sub-prompt contexts seeded with the persona files.

### 7. Capability-Tier Model Routing

Each SDD phase has a different dominant demand, so JCSPECS routes phases to models by **capability
tier** rather than using one model everywhere. Six tiers — **T1 Architect, T2 Coder, T3 Auditor,
T4 Context-Ingest, T5 Fast-Cheap, T6 Multimodal** — map to the phases:

| Phase / Role | Tier |
|---|---|
| `/sdd-constitution` | T4 + T1 |
| `/sdd-propose`, `/sdd-specify` (requirements/design) | T1 |
| `/sdd-specify` (tasks) | T5 |
| `/sdd-specify` (UX/UI design) | T6 |
| `/sdd-execute` Leader / Implementer / Reviewer | T5 / T2 / T3 |
| `/sdd-test` | T2 |
| `/sdd-validate` | T3 |
| `/sdd-audit` | T4 + T3 |
| `/sdd-archive` | T5 |

A single editable registry binds each tier to a concrete model **per tool** (Claude Code and
OpenCode). `/sdd-constitution` (Step 7C) scaffolds a `## Model Routing` copy of that registry into
the project's `AGENTS.md` / `CLAUDE.md`. It is **guidance only** — no `model:` frontmatter, no
installer changes — and it enforces **author ≠ auditor** (Reviewer model ≠ Implementer model). See
[model-routing.md](model-routing.md) for the tiers, principles, and the default registry.
