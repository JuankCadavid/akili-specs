# AKILI Flow

AKILI keeps durable product, design, implementation, test, and validation context in repository files so agents do not have to infer the same project reality every session.

The workflow is inspired by OpenSpec's artifact-guided pattern, but AKILI adds a project constitution step, Claude/OpenCode skills, and explicit validation evidence before archive.

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
You: /akili-constitution
AI:  Creates or strengthens the project baseline:
     ✓ docs/prd.md
     ✓ docs/ux-ui/design.md
     ✓ docs/trd/trd.md
     ✓ docs/specs/general-setup/
     ✓ CLAUDE.md and AGENTS.md

You: /akili-propose add-remember-me
AI:  Creates docs/specs/changes/add-remember-me/proposal.md
     ✓ problem, scope, non-goals
     ✓ affected systems
     ✓ requirement delta preview
     ✓ approach options and recommendation

You: /akili-specify changes/add-remember-me
AI:  Creates or updates:
     ✓ requirements.md
     ✓ design.md
     ✓ tasks.md

You: /akili-execute changes/add-remember-me
AI:  Runs the Leader → Implementer → Reviewer harness on the next approved task
     ✓ Implementer writes code and runs verification
     ✓ Reviewer audits the diff and emits STATUS: PASS or STATUS: FAIL
     ✓ Up to 3 rework attempts on FAIL, then HALT for human guidance
     ✓ updates tasks.md
     ✓ appends execution.md with full PASS/FAIL audit trail
     ✓ commits with [SPEC:<spec-path>] and records verification evidence

You: /akili-test changes/add-remember-me
AI:  Creates test-report.md with requirement-to-test traceability (supports automated parsing via `scripts/parse_tests.js`)

You: /akili-validate changes/add-remember-me
AI:  Creates validation-report.md with PASS/WARN/FAIL/BLOCKED findings

You: /akili-archive changes/add-remember-me
AI:  Runs the Kaizen retrospective (appends docs/specs/kaizen-log.md), moves completed work into docs/specs/archive/, and refreshes CodeGraph

Independent Auditing:
You: /akili-audit
AI:  Scans codebase and detects drift against baselines, generating docs/specs/drift-report.md
```

## Fast-Track for Trivial Changes

Not every change needs the full lifecycle. For a genuinely trivial, low-risk change — a button color, a title's text, a small paragraph — use `/akili-quick`:

```text
You: /akili-quick login-button-color use the brand accent token on the primary login button
AI:  ✓ checks the triviality gate (cosmetic/copy-only, no behavior/data/API/auth change,
       ≤ ~20 LOC in one component, design-token safe)
     ✓ makes the edit directly
     ✓ runs a light verification (lint / type-check / existing test / manual note)
     ✓ appends a one-line entry to docs/specs/quick/quick-log.md
     ✓ commits with [SPEC:quick/login-button-color]
```

If the change fails the gate (it has logic, touches data/API/auth, needs a new design token, or is bigger than a tweak), `/akili-quick` stops and escalates to `/akili-specify` (Lite) or `/akili-propose`. This keeps spec-to-code traceability intact while sparing small changes the full flow.

## Handling Bugs

Bugs are **not** treated exactly like normal changes — a bug starts from a *symptom*, not an *intent*, so the root cause must be understood before a fix is proposed. AKILI does this without a separate command: `/akili-propose` classifies the request and, when it detects a bug, follows the **Bug Track**.

```text
You: /akili-propose checkout-total-wrong the cart total is off by one item after removing a product
AI:  ✓ classifies this as a Bug (records Type: Bug)
     ✓ loads systematic-debugging
     ✓ captures: observed symptom, reproduction steps, CONFIRMED root cause, impact/scope
     ✓ recommends a fix strategy and the route

You: /akili-specify bugfix/checkout-total-wrong
AI:  runs in Bug Mode — frames requirements around the corrected behavior and REQUIRES a
     regression test (red before the fix, green after) as a mandatory task
```

Routing by size:

- **Cosmetic bug** (e.g. a visible typo, wrong static label) → `/akili-quick`.
- **Bug with logic/behavior** → `/akili-propose` (diagnose) → `/akili-specify` Bug Mode (fix + regression test) → `/akili-execute` → `/akili-test` → `/akili-validate`.

The regression test is the non-negotiable evidence that the bug is actually fixed and stays fixed. `/akili-validate` then carries any unresolved `PRODUCT_BUG` from the test evidence through as a FAIL.

## Project Modes

`/akili-constitution` begins by classifying the repository into one of three modes. Each mode adjusts how aggressively the constitution drafts, scans, or preserves existing material — and how the project `.agents/` harness is scaffolded.

| Mode | Meaning | Constitution Behavior | `.agents/` Behavior |
|---|---|---|---|
| Brand-new (Seed Setup) | Little or no application code, no AKILI-SPECS docs, starting from scratch | Draft baseline from user intent, chosen stack, assumptions, and open questions | Copy default Leader / Implementer / Reviewer personas verbatim |
| Legacy (Discovery Setup) | Real code, package manifests, routes, tests exist; AKILI-SPECS baseline missing or skeletal | Inspect repository reality (CodeGraph preferred) before drafting; synthesize baseline from evidence | Copy defaults then customize with detected stack, design tokens, lint and test commands |
| Active AKILI-SPECS (Safe Update) | AKILI-SPECS baseline and possibly customized `.agents/` already in place | Upgrade weak sections, fill missing files, preserve custom rules | Never overwrite existing personas — append only the minimal upgrade blocks needed |

For Legacy and Active-AKILI-SPECS modes, CodeGraph is preferred when `.codegraph/` exists. If CodeGraph is missing but the CLI is available, the agent should ask before running `codegraph init -i`. If CodeGraph is unavailable or declined, normal file and content searches are used.

## Artifacts

| Artifact | Created By | Purpose |
|---|---|---|
| `docs/prd.md` | `/akili-constitution` | Product purpose, personas, goals, scope, success metrics |
| `docs/ux-ui/design.md` | `/akili-constitution` | UX system, flows, screen inventory, tokens, accessibility expectations |
| `docs/trd/trd.md` | `/akili-constitution` | Technical architecture, modules, data, APIs, integrations, testing strategy |
| `docs/specs/general-setup/` | `/akili-constitution` | Project-specific templates for future specs |
| `docs/specs/<spec-path>/proposal.md` | `/akili-propose` | Reviewable intent, scope, options, and risks |
| `docs/specs/<spec-path>/requirements.md` | `/akili-specify` | Behavior contracts and scenarios |
| `docs/specs/<spec-path>/design.md` | `/akili-specify` | Implementation approach and trade-offs |
| `docs/specs/<spec-path>/tasks.md` | `/akili-specify` | Small executable tasks with verification |
| `docs/specs/<spec-path>/execution.md` | `/akili-execute` | Task execution history and evidence |
| `docs/specs/<spec-path>/test-report.md` | `/akili-test` | Requirement-to-test matrix and coverage gaps |
| `docs/specs/<spec-path>/validation-report.md` | `/akili-validate` | Final conformance audit |
| `docs/specs/drift-report.md` | `/akili-audit` | Conformance auditing of documentation vs. codebase reality |
| `docs/specs/kaizen-log.md` | `/akili-archive` | Accumulated metrics and root-cause lessons; the `## Active Lessons` digest is read by `/akili-propose`, `/akili-specify`, `/akili-execute`, and `/akili-resume` |
| `docs/specs/archive/.../archive-summary.md` | `/akili-archive` | Historical closure record |

## Review Gates

AKILI keeps humans in control at each important transition.

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
| Archive | Warnings and follow-ups are accepted; Kaizen lessons are recorded and standardizations approved or deferred |

## Documentation Depth

Use the lightest documentation that still makes the work clear and verifiable.

| Depth | Use For | Capture |
|---|---|---|
| Quick (`/akili-quick`) | Genuinely trivial cosmetic/copy changes (button color, title text, small paragraph) | No spec docs — a one-line `quick-log.md` entry + `[SPEC:quick/<name>]` commit; escalates if not trivial |
| Lite | Small bugfixes, copy updates, narrow UI tweaks | Problem, scenario, focused task, verification command |
| Standard | Normal features and enhancements | Requirements, scenarios, design decisions, tasks, tests |
| Full | Risky, cross-cutting, API, data, auth, migration, or SEO work | Alternatives, rollout, risks, observability, rollback, explicit traceability |

Lite mode does not skip rigor. Requirements still need scenarios, tasks still need done criteria, and validation still needs evidence. `/akili-quick` is the only path that skips the spec documents — gated to genuinely trivial changes, and it auto-escalates anything larger to `/akili-specify` (Lite) or `/akili-propose`.

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

For a small, obvious change in a repository with a strong baseline, you may start at `/akili-specify <spec-path>`.

For unclear, risky, cross-functional, or stakeholder-sensitive work, start at `/akili-propose <change-name-or-spec-path>`.

For a new repository, stale documentation, or a major product pivot, start at `/akili-constitution`.

---

## Advanced Engineering Capabilities

To support robust, long-term development cycles, AKILI includes the following specialized workflows:

### 1. Spec-to-Code Traceability (Git & Comments)
To establish high-traceability between spec files and source code:
* **Commit Messages:** Every commit made during `/akili-execute` must be prefixed with `[SPEC:<spec-path>]` (e.g. `git commit -m "[SPEC:changes/add-remember-me] implement secure cookie storage"`).
* **Comment Tracing:** For complex algorithms, API entry points, or core models, developers/agents should place a reference comment: `// @akili-spec <spec-path>`.

### 2. Specification Drift Auditing (`/akili-audit`)
Run `/akili-audit` independently to verify that the active codebase reflects active documentation. The command produces `docs/specs/drift-report.md` detailing:
* **Stale Specifications:** Documented endpoints/modules missing from code.
* **Undocumented Code:** Active code additions completely missing from the PRD, UX/UI design, or TRD docs.
* **Styling/Architecture Violations:** Active code violating styling tokens or engineering guidelines.
* **Agent Guide Drift:** Modules lacking a needed child `CLAUDE.md`/`AGENTS.md`, child guides missing from the parent's `## Module Guides` index, or root-guide structure descriptions that no longer match the codebase.

### 3. The Pivot Protocol
If discovery during `/akili-execute` invalidates requirements or design rules:
1. Mark the current task in `tasks.md` as `[~]` (blocked).
2. Append a `## Pivot Record: <Task ID>` under `execution.md` explaining the conflict, technical constraints, and proposed options.
3. Update `requirements.md`, `design.md`, and/or `tasks.md` in the spec folder.
4. Obtain user sign-off on the pivot before resuming execution.

### 4. CodeGraph Refresh Trigger
When compiling the `archive-summary.md` and moving folders to the archive via `/akili-archive`:
* The agent detects if `.codegraph/` configuration folders are present.
* The agent reminds or executes the re-indexing command (e.g., `codegraph index`) to guarantee semantic search utilities remain highly functional for subsequent sessions.

### 5. Automated Test Reporting (`scripts/parse_tests.js`)
Rather than manually compiling assertion results during `/akili-test`:
1. Execute tests outputting to JSON (e.g. `jest --json --outputFile=jest-results.json` or `vitest --reporter=json`).
2. Run `node <path-to-akili>/scripts/parse_tests.js jest-results.json` to generate the AKILI matrix table automatically for inclusion inside `test-report.md`.

### 6. Multi-Agent Harness (`/akili-execute` Triad and `/akili-test` Testers)

`/akili-execute` is implemented as a multi-agent orchestration rather than a single-agent script. The Leader role does not write production code; it delegates implementation and audit to two subordinate roles, then enforces a strict PASS/FAIL gate before the task advances.

**Roles** — all three live in the project's `.agents/` directory, scaffolded by `/akili-constitution`:

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

**`/akili-test` — Leader → Tester(s):**

`/akili-test` uses the same Leader pattern with a fourth persona, `.agents/tester.md`, and a token-aware **Deployment Rule**. The Leader partitions testing into suites (backend unit, frontend unit, integration, E2E) and decides how many Testers to spawn:

| Situation | Action |
|---|---|
| Lite depth or a single trivial suite | Run **inline** — no spawn (cheaper than delegating) |
| Standard/Full with one substantial suite | One Tester |
| Multiple **independent** suites | One Tester per suite, **in parallel** |
| Suites sharing files/fixtures | Testers run sequentially |

Each Tester gets only its suite's requirements, scenarios, and test command (never the full spec set), runs a bounded 3-attempt self-correction inner loop, and returns `STATUS: PASS`, `STATUS: FAIL`, or `STATUS: PRODUCT_BUG` — keeping a correct test red on a genuine product defect instead of rewriting it to pass. The Leader aggregates the per-suite coverage slices into the `test-report.md` requirement-to-test matrix. Ideally a Tester runs on a different model than the Implementer that wrote the code (author ≠ tester).

### 7. Capability-Tier Model Routing

Each AKILI-SPECS phase has a different dominant demand, so AKILI routes phases to models by **capability
tier** rather than using one model everywhere. Six tiers — **T1 Architect, T2 Coder, T3 Auditor,
T4 Context-Ingest, T5 Fast-Cheap, T6 Multimodal** — map to the phases:

| Phase / Role | Tier |
|---|---|
| `/akili-constitution` | T4 + T1 |
| `/akili-propose`, `/akili-specify` (requirements/design/tasks) | T1 |
| `/akili-quick` | T2 |
| `/akili-specify` (UX/UI design) | T6 |
| `/akili-execute` Leader / Implementer / Reviewer | T1 / T2 / T3 |
| `/akili-test` Leader / Tester(s) | T1 / T2 |
| `/akili-validate` | T3 |
| `/akili-audit` | T4 + T3 |
| `/akili-archive` | T5 |

A single editable registry binds each tier to a model **per tool** (Claude Code and OpenCode),
using **floating aliases** (`opus`/`sonnet`/`haiku`) wherever they exist so the registry survives
model generations without edits. `/akili-constitution` (Step 8C) scaffolds a `## Model Routing`
copy into the project's `AGENTS.md` / `CLAUDE.md`.

Routing operates at two levels:

* **Enforced (subagents):** `/akili-constitution` Step 8E can generate tool-native agent wrappers
  (`.claude/agents/akili-{leader,implementer,reviewer,tester}.md` in Claude Code, agent config in
  OpenCode) that pin each persona to its tier's model. `/akili-execute` and `/akili-test` prefer
  those named agents — so **author ≠ auditor** (Reviewer model ≠ Implementer model) holds by
  configuration on the fan-out where most tokens are spent.
* **Guided (main loop):** every command emits a one-line, never-blocking **model checkpoint** in
  its setup step when the phase's tier maps to a different model than the current session.

No `model:` frontmatter on commands and no installer changes. `/akili-audit` reports **Model
Registry Drift** (stale model names, dated pins where an alias exists, wrappers contradicting the
registry). See [model-routing.md](model-routing.md) for the tiers, principles, and the default
registry.

### 8. The Kaizen Loop

AKILI embeds Kaizen — continuous improvement through small, disciplined steps — as an executable
retrospective inside `/akili-archive`, powered by the packaged `kaizen` skill (authored by
Juan Carlos Cadavid — jcadavid.com). Every archive runs one bounded pass:

* **Measure:** hunt waste (MUDA) in the spec's own evidence — Reviewer rework attempts, pivots,
  PRODUCT_BUGs, severe judgment-day findings, validation WARN/FAIL, drift.
* **Learn:** distill 0–3 lessons, each with a named root cause and cited evidence. Generic lessons
  are banned; a clean spec records a one-line clean-run entry instead.
* **Standardize:** propose 1–3 line edits to constitution guides, `general-setup` templates, design
  tokens, or `.agents/` personas. **Every edit outside the kaizen log requires human approval.**
* **Record:** append to the accumulative `docs/specs/kaizen-log.md`. Its capped `## Active Lessons`
  digest (10 rows max) is the only part other commands read.

Lessons target either the **Product** (this project) or the **Methodology** itself — Methodology
lessons are flagged for upstreaming to the AKILI repository, so the methodology learns from every
tool built with it. The retrospective never blocks the archive.

### 9. Skill Binding (Governance)

The packaged skills are curated under a three-level binding taxonomy (see `docs/skills/governance.md`),
which answers *when and how each skill loads*:

* **core** — hard-wired to a precise command step: `kaizen` in `/akili-archive`, `judgment-day` in
  `/akili-specify`'s Review Design gate, `cognitive-doc-design` for every human-facing document,
  `brainstorming` for exploration, `product-manager-toolkit` in `/akili-constitution`,
  `systematic-debugging` in bug flows, `seo-audit` in `/akili-seo`.
* **conditional** — loaded when the work touches its domain: `ui-ux-pro-max` / `frontend-design` /
  `stitch-design` for UI work, `gsap-animation` for animation work.
* **stack** — framework/platform skills (`angular-developer`, `nestjs-expert`, `shadcn-ui`,
  `aws-serverless`, …) are never hardcoded into commands. `/akili-constitution` Step 8D writes a
  `## Skill Map` into the project's `AGENTS.md`/`CLAUDE.md` from the detected stack;
  `/akili-specify` derives each task's required skills from that map; the Leader passes them to the
  Implementer/Tester via dynamic skill loading.

Every skill preserves its original author and license; AKILI adaptation is recorded as `adapted-by`
in the skill frontmatter. Curation by Juan Carlos Cadavid — jcadavid.com.
