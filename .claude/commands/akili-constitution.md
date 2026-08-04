---
name: akili-constitution
description: Establish or strengthen the project-wide AKILI-SPECS foundation and baseline docs (PRD, UX/UI Design, TRD).
license: MIT
metadata:
  author: Juan Carlos Cadavid (jcadavid.com)
---

# Establish AKILI-SPECS Constitution

Establish or strengthen the project-wide AKILI-SPECS foundation. This command creates the documentation baseline that all later module-level AKILI-SPECS work depends on.

## Usage

```
/akili-constitution
```

## Behavior

### Step 0: Determine Project Mode and Foundation Setup

**Model checkpoint:** This phase runs best on **T4 Context-Ingest** for repository ingestion and **T1 Architect** for baseline synthesis (if no project registry exists yet, use the packaged default in `docs/model-routing.md`). If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps that tier to a model different from the current session model, check the direction first — the registry is a floor, not a ceiling: if the session model is the stronger one (e.g. a newer generation than a stale entry), pass silently and flag the registry entry for update instead of recommending a downgrade. Only when the registry model is stronger for this tier, tell the user in one line — e.g. *"Baseline synthesis is T1 — the default registry recommends `/model opus`; you are on haiku"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode) at the first approval pause. Never block on this; continuing on the current model is always allowed.

Before classifying the repository, use the `brainstorming` skill to ask the user if this is a new project/MVP starting from 0, or if it is an existing project with an established structure.

Based on the response, classify the repository into one of three modes. The classification is non-destructive — it controls how aggressively the constitution drafts, scans, or preserves existing material.

- **Brand-new project (Seed Setup):** The user is starting from scratch. Prepare the project from 0. There is little or no application code, no stable project documentation, and no prior AKILI-SPECS artifacts.
- **Legacy codebase (Discovery Setup):** The user indicates an existing project structure. Analyze the existing project and explicitly prompt to install CodeGraph (`codegraph init -i`) before proceeding. Meaningful application code, package manifests, infrastructure, tests, routes, components, or prior non-AKILI-SPECS docs exist, but the AKILI-SPECS baseline (`docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/specs/general-setup/`) is missing or skeletal.
- **Active AKILI-SPECS project (Safe Update):** the AKILI-SPECS baseline already exists, prior specs live under `docs/specs/`, and an `.agents/` directory may already contain customized personas. The constitution must upgrade weak sections without overwriting customizations.

For all three modes:

1. Ensure `docs/` exists.
2. Ensure `docs/specs/` exists.
3. Ensure `docs/specs/general-setup/` exists.
4. Ensure root `CLAUDE.md` exists or is enhanced.
5. Ensure root `AGENTS.md` exists or is enhanced.
6. Ensure project-level `.agents/` exists with `leader.md`, `implementer.md`, `reviewer.md`, and `tester.md` (see Step 8B).
7. Default behavior is to enhance existing project docs in place instead of creating parallel copies.

The constitutional baseline must cover these files:

- `docs/prd.md`
- `docs/ux-ui/design.md`
- `docs/trd/trd.md`
- `docs/infrastructure.md`
- `docs/specs/general-setup/requirements.md`
- `docs/specs/general-setup/design.md`
- `docs/specs/general-setup/task.md`
- `CLAUDE.md`
- `AGENTS.md`
- `.agents/leader.md`
- `.agents/implementer.md`
- `.agents/reviewer.md`
- `.agents/tester.md`

**Mode-specific drafting policy:**

- **Brand-new:** prompt the user for a seed intent (product idea, target users, stack preference), then draft baselines and `.agents/` from the default templates plus that intent.
- **Legacy:** do not draft the baseline until repository reality has been inspected and summarized. Use CodeGraph or `Grep` to extract components, API surfaces, styling tokens, and module boundaries; synthesize the baseline from that evidence; tailor `.agents/` personas to the detected stack (frameworks, test runner, design tokens).
- **Active AKILI-SPECS:** read existing files and any custom subagent rules. **Do not overwrite them.** Upgrade only weak sections, fill in missing files, and extend `.agents/` to support the multi-agent loop while preserving custom instructions.

**Legacy path migration (pre-TRD naming):**

Older AKILI-SPECS baselines used `docs/system-design/design.md` for the UX/UI blueprint and `docs/detailed-design/detailed-design.md` for the technical blueprint. When those legacy paths exist:

1. Treat them as the existing UX/UI Design document and TRD — never draft duplicates alongside them.
2. In Active AKILI-SPECS mode, propose migrating them with `git mv` to `docs/ux-ui/design.md` and `docs/trd/trd.md`, then update every reference in `CLAUDE.md`, `AGENTS.md`, `.agents/*.md`, and `docs/specs/` to the new paths.
3. If the user declines migration, keep the legacy paths and note the mapping in `CLAUDE.md` so later AKILI-SPECS commands resolve them correctly.

---

### Step 1: Read Project Context First

Before writing anything, read the repository context carefully:

1. Root `CLAUDE.md` if it exists
2. Root `AGENTS.md` if it exists
3. Package-level `CLAUDE.md` and `AGENTS.md` files if they exist
4. Existing `docs/prd.md`
5. Existing `docs/ux-ui/design.md`
6. Existing `docs/trd/trd.md`
7. Existing `docs/specs/` folders to extract terminology, taxonomy, and prior feature history
8. Any architecture, infrastructure, setup, or product docs already present under `docs/`

Also inspect the codebase to understand:

- Product domain and business model
- Main user roles and workflows
- Current frontend/backend/shared architecture
- Existing visual patterns and design system signals
- Technical constraints already enforced by the repo
- Existing spec taxonomy under `docs/specs/` such as domain, enhancement, bugfix, or epic folders

Do not write generic placeholder documentation when the repository already contains enough context to infer a strong baseline.

**Delegation Thresholds (scout research):** For legacy/existing-project analysis, apply the *Delegation Thresholds* from the packaged `leader.md` template — when inspecting the codebase requires reading **4+ full source files** for a single question (architecture survey, styling-token inventory, module-boundary mapping), spawn a scout/Explore subagent with fresh context and synthesize from its conclusions instead of reading everything inline. CodeGraph lookups (below) do not count toward the threshold.

#### Existing Project CodeGraph Check

For existing projects, prefer CodeGraph for repository analysis when available:

1. If `.codegraph/` exists, use CodeGraph for symbol lookup, architecture context, callers/callees, and impact analysis before broad file scanning.
2. If `.codegraph/` does not exist and the `codegraph` CLI is available, ask the user whether to run `codegraph init -i` before continuing.
3. If the `codegraph` CLI is **not installed**, tell the user in one line — *"CodeGraph CLI not found — install with `npm install -g @colbymchenry/codegraph` (then `codegraph init -i`) for a higher-confidence scan; continuing on `Glob`/`Grep`"* — and continue. Without this line, "unavailable" is a permanent, silent state: the user cannot choose a tool they never hear about, and `akili doctor` only catches it if they think to run it.
4. If CodeGraph is unavailable or the user declines initialization, continue with normal `Glob`, `Grep`, and file reads. **Absence changes the tool, never the scope:** every extraction the scan calls for still runs, at the same depth, via `Glob`/`Grep` and file reads — "no graph" is degraded confidence to *report*, not analysis to *skip*. A scan that silently shrank because the graph was missing is the failure mode this list exists to prevent.
5. Never block the constitution on CodeGraph. Treat it as an optional context accelerator.
6. Do not commit generated CodeGraph databases. Only durable configuration such as `.codegraph/config.json` may be committed when useful.

When CodeGraph is used, summarize the evidence it revealed in the constitution output: dominant languages/frameworks, important modules, entry points, routes/API surfaces, test layout, and high-impact dependencies.

---

### Step 2: Clarify Missing Business Context

If essential product context is missing or ambiguous, ask focused user questions before drafting the documents.

Focus especially on:

- The core problem the product solves
- Primary personas and user roles
- Business goals and expected outcomes
- Success metrics or KPIs
- Scope boundaries and non-goals
- Known constraints, dependencies, and risks
- Infrastructure expectations (e.g., AWS, deployment platforms, architectural rules, specific cloud components required)
- Preferred `docs/specs/` taxonomy when the repo does not already imply one

Use the `product-manager-toolkit` skill's **Customer Interview Guide** and **Hypothesis Template** as the question script. If the user has interview transcripts or raw customer feedback available, offer its `customer_interview_analyzer.py` helper to extract pain points, jobs-to-be-done, and themes before drafting.

Ask only what is needed to avoid unstable assumptions.

**Thin-seed protocol (Brand-new mode):** a one-line seed — *"necesito una app para vender carros"* — cannot support a PRD, and the two failure modes are opposite: an unbounded interrogation that exhausts the user, or a fully fabricated product the Step 9 gate rubber-stamps in one "approve". The second is the dangerous one: **everything downstream treats the PRD as constitution, so invented details become binding** — a fabricated PRD is not a draft, it is a false constitution that `/akili-specify` and `/akili-execute` will faithfully obey. Run this instead:

1. **Sufficiency check.** A seed is thin when it leaves ≥2 of these undecided: **(a)** who the users/actors are and which product shape this is (the car-sales seed alone spans C2C marketplace, dealer inventory platform, and classifieds — three different products), **(b)** the 2–4 core v1 flows, **(c)** how success is measured / monetization, **(d)** stack or platform preference, **(e)** hard constraints (region, compliance, integrations).
2. **One bounded clarification round — never an interrogation.** Batch at most **7 questions in a single message**, each carrying a **proposed default** so the user can answer with one word, answer partially, or say "decide tú". No second round unless the answers contradict each other. The defaults are your best product judgment made visible — the user vetoes cheaply instead of authoring from scratch.
3. **Everything the user did not decide lands as a labeled Assumption**, written with the Hypothesis Template, in the PRD's Assumptions section — never silently woven into the prose as settled fact. Step 9's summary lists them so the approval covers what was *decided* and what was *assumed*, distinctly.
4. **A thin seed yields a thin PRD, honestly.** Scope it as an MVP with open questions rather than inventing an enterprise-grade product to fill the template. Fabricated specificity is worse than acknowledged uncertainty: the uncertainty gets resolved in the next cycle; the fabrication gets *built*.

---

### Step 3: Create or Enhance the General PRD

Create or enhance `docs/prd.md` as a concise living document.

**Primary skill:** `product-manager-toolkit` — follow its **AKILI-SPECS Integration** section: the Required PRD structure below is canonical (never substitute the toolkit's own PRD templates); use its North Star Metric framework for "Goals & Success Metrics", jobs-to-be-done for "Target Personas", and its Hypothesis Template for "Assumptions". Write the document following `cognitive-doc-design`: lead with the answer, progressive disclosure, tables and checklists over prose.

**PRD rules:**

- Lead with the why: problem statement, business context, user need
- Keep it concise and maintainable
- Define measurable success metrics before implementation begins
- Define explicit out-of-scope items
- Use user-centric requirements and user stories
- Use testable acceptance criteria
- Collaborate through assumptions and open questions rather than pretending certainty
- Keep it AI-ready with clean headings and concise bullets

**Pitfalls to avoid:**

- Do not mix goals with requirements
- Do not use vague language like "fast" or "intuitive" without measurable meaning
- Do not treat the PRD as static
- Do not force a predetermined technical solution into the PRD

**Required PRD structure:**

1. Overview & Purpose
2. Problem Statement
3. Target Personas
4. Goals & Success Metrics
5. Scope (In / Out)
6. User Stories
7. Acceptance Criteria
8. Assumptions, Dependencies, & Constraints
9. Open Questions

When `docs/prd.md` already exists, preserve useful content and upgrade weak sections to follow the rules above.

---

### Step 4: Create or Enhance the UX/UI Design Document

Create or enhance `docs/ux-ui/design.md` as the UI/UX system blueprint.

**Preferred skill chain:**

- `ui-ux-pro-max` if available
- otherwise `frontend-design` + `stitch-design`

This document represents the visual and interaction system, not the low-level technical implementation.

**Required structure:**

1. Product Experience Principles
2. Information Architecture
3. Primary User Flows
4. Screen Inventory
5. Navigation Model
6. Layout Patterns
7. Design Tokens
8. Component Inventory
9. Responsive Behavior
10. Accessibility Expectations
11. Dark Mode Behavior
12. Design Decisions
13. Open Gaps / Open Questions

**Document intent:**

- Define a reusable, consistent UI/UX system
- Capture visual consistency, accessibility, and interaction rules
- Reference existing brand, color, typography, and component patterns from the repository when available
- Prefer clarity over decorative language

When the file already exists, refine it in place instead of replacing established valid patterns.

---

### Step 5: Create or Enhance the TRD (Technical Requirements Document)

Create or enhance `docs/trd/trd.md` as the technical implementation blueprint.

**Required skill:** load `software-architect` before drafting the TRD and apply its Decision Spine throughout this step — capture NFRs as six-part quality-attribute scenarios with measurable responses, choose tactics, decide the robust-vs-lite tier and architecture style, bind design patterns to named problems, and document with C4 views plus ADRs.

**Use skills when relevant** (stack skills — load only the ones matching the project's stack; the same set feeds the `## Skill Map` in Step 8D):

- `nestjs-expert`
- `api-design-principles`
- `error-handling-patterns`
- `aws-serverless`
- `shadcn-ui`
- `tailwind-design-system`
- `vercel-react-best-practices`
- `angular-developer`

**Required structure:**

1. System Overview
2. Architecture Overview & Decisions (C4 Context + Container with legends, style choice, robust-vs-lite tier decision, ADR index)
3. Quality Attribute Scenarios (Non-Functional Requirements — six-part scenarios with measurable responses and chosen tactics; security, performance, scalability, and availability always evaluated)
4. Domain Modules & Responsibilities
5. Data Model & Entities
6. API Surface & Contracts
7. Backend Workflows & Business Rules
8. Frontend Architecture & State Boundaries
9. Integration Points
10. Security & Authorization Model
11. Error Handling & Observability
12. Testing Strategy
13. Technical Constraints & Assumptions

---

### Step 6: Create or Enhance the Infrastructure Document

Create or enhance `docs/infrastructure.md` as the environments blueprint — from the developer's laptop to PROD.

The infrastructure shape derives from the TRD's robust-vs-lite tier decision (Step 5, `software-architect` skill) — never precedes it. Cite the tier decision and its ADR at the top of the document.

**Required structure:**

1. Target Environment (e.g., AWS, GCP, Vercel, On-prem)
2. Core Cloud Components (e.g., Lambda, S3, RDS, ECS)
3. Deployment Strategy (e.g., CI/CD, Terraform, CDK)
4. Network & Security Architecture
5. Infrastructure Rules & Constraints
6. Local Environment (the contract below)

If this information is missing during the initial setup or discovery phase, explicitly ask the user for the intended infrastructure specifications before drafting this document.

#### Step 6B: The Local Environment Contract

Scaffold a `## Local Environment` section that captures how to start the project's local stack (database, backend, frontend). The methodology defines a **contract, not a tool** — Docker Compose is the recommended primary route, but the contract must always document a fallback for users without Docker:

| Element | What to record |
|---------|----------------|
| Primary route (recommended) | e.g. `docker compose up -d` |
| Fallback route (no Docker) | e.g. `npm run dev` per service + a local or cloud dev database |
| Pre-check | e.g. `docker info` — on failure (daemon off, not installed), surface it and offer: start Docker, or use the fallback. Never block silently |
| Seed / reset data | explicit commands |
| Health check | how to verify the stack is up |
| URLs / ports | frontend, backend, database |

Mode-specific behavior:

- **Legacy / Active:** derive the contract from evidence — existing `docker-compose*.yml`, `Makefile`, `package.json` scripts, README run instructions. Do not invent commands; ask the user to confirm anything ambiguous.
- **Brand-new:** offer to scaffold a development compose file (db + backend + frontend) matching the TRD stack. If the user declines or has no Docker, record the native fallback as the primary route.

**Boundary rule (record it in the section):** the local environment is **disposable** — agents may freely start, seed, and reset it to verify work. Deployments to cloud/PROD are **governed** — they follow this document's sections 1–5 (components, IaC, CI/CD defined at constitution time) and are never improvised by agents.

---

### Step 7: Create or Enhance General Setup Templates

Create or enhance the canonical templates under `docs/specs/general-setup/`.

These files define the format that `/akili-specify` must follow later:

1. `requirements.md` — requirement numbering, structure, and writing standards
2. `design.md` — architecture, data model, API, frontend, and decision-record structure
3. `task.md` — task format, dependency graph format, testing expectations, and execution conventions

These are methodology templates for future specs, not a feature spec themselves.

They must reflect:

- The repo's current architecture and package layout
- The chosen `docs/specs/` taxonomy
- The approved PRD, UX/UI design, and TRD conventions

---

### Step 8: Update Root Agent Guides

Update root `CLAUDE.md` and `AGENTS.md` so they reference:

- `docs/prd.md`
- `docs/ux-ui/design.md`
- `docs/trd/trd.md`
- `docs/infrastructure.md`
- `docs/specs/general-setup/`

The update should explain briefly:

- What each document is for
- When Claude should consult each one
- That these documents form the constitutional baseline for future AKILI-SPECS work
- How module specs should be organized under `docs/specs/`
- Which skills should be used for common work in the project (the `## Skill Map` added in Step 8D)
- Whether CodeGraph is initialized and how agents should use it for existing-project analysis
- Which model to switch to per AKILI-SPECS phase (the `## Model Routing` registry added in Step 8C)
- How to start the local stack: point at the `## Local Environment` contract in `docs/infrastructure.md` (Step 6B) — agents consult it instead of guessing start commands
- **Agent-lean verification commands:** record the canonical test/lint commands in their failure-only variant (a `test:agent` script, `--reporter=dot`/`--silent`, `eslint --quiet`) — a green run needs one summary line, and everything above it is waste paid on every verification of every task. The asymmetry rule travels with the commands: **failures always print complete and verbatim** (they are evidence — the Structured Feedback rule), only passing noise is suppressed. Personas inherit this automatically: Implementer and Tester run "the project's real command", so making the canonical command lean is the whole change
- **The concurrency convention:** one AKILI session per checkout, additional sessions on `git worktree`, and no measurement command (build, benchmark, Lighthouse, E2E) run while a delegated agent is active. This belongs in the root guides rather than only in `.agents/leader.md` because it binds **every** session that opens the repo, including ones that never load a persona — and its failures are filesystem-level, so no diff review can catch them

Preserve the repository's existing `CLAUDE.md` and `AGENTS.md` conventions and extend them.

**Nested agent guide inheritance:**

Root guides are the parent; major modules or packages may carry child guides. Establish this convention explicitly:

1. A module/package gets a child `CLAUDE.md` and/or `AGENTS.md` **only when its conventions genuinely diverge from the root** (different stack, test runner, boundaries, or domain rules). Do not scaffold empty child guides for every folder.
2. Child guides stay thin and module-specific. They must never duplicate root rules — inheritance means the root guide always applies and children only add or narrow.
3. The root guides must carry a `## Module Guides` index: one line per child guide (`- <path> — <one-line scope>`). A child guide that is not referenced from the parent index is considered drift.
4. **Legacy mode:** create child guides only where the codebase scan shows divergent conventions, and build the parent index from what exists. **Active AKILI-SPECS mode:** preserve existing child guides, add missing parent index entries, and never overwrite customized children.

This index is what keeps agent context inheritance working: agents load the root guide plus the child guide of the module they are touching.

---

### Step 8B: Scaffold the `.agents/` Personas

Establish or upgrade the project-level `.agents/` directory that powers the AKILI multi-agent harness: the Leader → Implementer → Reviewer loop used by `/akili-execute`, and the Leader → Tester(s) harness used by `/akili-test`.

Target layout:

```text
<project-root>/
├── .agents/
│   ├── leader.md        # Orchestration playbook, task tracking, .agents references
│   ├── implementer.md   # Coding guidelines, testing standards, design-token discipline
│   ├── reviewer.md      # Spec conformance audit, design-token compliance, structured FAIL output
│   └── tester.md        # Per-suite QA authoring/execution, bounded inner loop, PASS/FAIL/PRODUCT_BUG output
```

**Source of truth for templates:**

The packaged methodology ships default personas under `akili/templates/` inside the active tool's config directory:

- Claude Code: `~/.claude/akili/templates/{leader,implementer,reviewer,tester}.md`
- OpenCode: `~/.config/opencode/akili/templates/{leader,implementer,reviewer,tester}.md`
- Antigravity: `~/.gemini/config/akili/templates/{leader,implementer,reviewer,tester}.md`

If the packaged templates are available, prefer copying them as the seed; otherwise draft equivalent personas inline using the structure documented in this command and the `/akili-execute` and `/akili-test` commands.

**Mode-specific scaffolding policy:**

- **Brand-new (Seed Setup):** copy the four default templates verbatim into `.agents/`. Tailor only the project name and detected stack if known.
- **Legacy (Discovery Setup):** copy the four default templates, then customize **each one individually** from the codebase scan, following the *Injection scope* table below. Give a persona only what its role consumes.
- **Active AKILI-SPECS (Safe Update):** **do not overwrite** existing `.agents/*.md` files. For each missing file, install the default template (customized per the *Injection scope* table). For each existing file, read it, identify gaps versus the current packaged template (e.g. missing rework-loop instructions, missing PASS/FAIL output contract, missing AKILI commit standard), and append a minimal upgrade block that preserves all existing custom instructions.

**Injection scope — what the scan writes into which persona:**

| Detected by the scan | `leader.md` | `implementer.md` | `reviewer.md` | `tester.md` |
| :--- | :---: | :---: | :---: | :---: |
| Design-token path (`docs/ux-ui/design.md`) | — | ✅ must comply | ✅ must audit | — |
| `trd.md` path | — | — | ✅ cites it in FAIL items | — |
| Test / verification command | — | ✅ runs it before reporting | — | ✅ runs the suite |
| Lint command | — | ✅ | — | — |
| Real test runner and its invocation | — | — | — | ✅ |
| Framework conventions | — | ✅ writes to them | ✅ audits conformance | ✅ test idioms |
| Directory boundaries | ✅ judges task independence | ✅ stays inside scope | ✅ flags violations | — |

**Never inject the whole bundle into all four.** Scoping is not tidiness — it is correctness and cost:

1. **The packaged templates already forbid some of it.** `tester.md` states it does *not* audit design-token conformance; writing the token path into it contradicts the very file being copied.
2. **Personas are re-read on every subagent spawn.** An injection copied into all four is paid on every task of every spec, not once at scaffold time.
3. **Every extra copy is a place to drift.** Change the test command later and three personas start describing a command that no longer exists — silently, until an agent runs the stale one.
4. **Irrelevant context competes with relevant context.** A Reviewer handed the lint command must first decide it does not apply.

The Leader's row is the one most often dropped: it writes no code, so scans tend to give it nothing. It needs **directory boundaries** specifically, because that is what it judges task independence against when deciding whether two tasks may run in parallel (see the *Delegation Thresholds* row on concurrent writers in `leader.md`).

**Required content per persona:**

- **`leader.md`** — orchestration sequence, rework loop with 3-attempt ceiling, structured FAIL handoff to the next Implementer spawn, `execution.md` audit-trail format, `tasks.md` status transitions, AKILI commit standard, Pivot Protocol escalation, **exemplar-file briefing** (each Implementer brief names the closest existing file as the pattern to imitate when one exists — a worked example steers a model better than a list of conventions; skip when nothing comparable exists), the **Delegation Thresholds** floor *and* the **Delegation Ceiling** (one subagent beats several for one task; commit to the delegation; brief precisely once; bounded fan-out; never delegate your own verification — with the explicit carve-out that the independent Reviewer is `author ≠ auditor`, not self-verification, and must never be collapsed).
- **`implementer.md`** — strict context alignment to constitution + spec, **scope discipline in both directions** (no scope creep, but also no silent narrowing — finish the whole task and report completion only when it is actually complete, listing what is missing and why when it is not), **exemplar mimicry** (when the brief names an exemplar file, match its structure, naming, and idiom over personal preference — constitution and design spec still win on conflict), aesthetics and design-token compliance from `docs/ux-ui/design.md`, verification rigor (must run the task's verification command before reporting), structured completion report with an optional `Not Done / Assumptions` field.
- **`reviewer.md`** — read-only role, audit checklist (requirement conformance, design-token compliance, technical compliance, stability), structured PASS/FAIL output where every FAIL item lists *Discovered Issue*, *Violated Rule*, and *Remediation Suggestion*, and **inherited-claim re-check**: an `UNVERIFIABLE` claim inherited from an earlier task is a claim to re-check, not to accept — verify the premise (interpreter, tool, credential) still holds before it becomes a permanently accepted gap.
- **`tester.md`** — single-suite scope (backend unit, frontend unit, integration, or E2E), thin per-suite context, explicit coverage of negative constraints (`BUT it must NOT`) and strict validations (`AND IT MUST`), bounded self-correction inner loop (max 3), distinction between a test defect (fix the test) and a product defect (keep the test red, report `PRODUCT_BUG`), **destructive-probe hygiene**: a probe that mutates a contract, config, or tracked source reverts immediately after each run — never batch reverts to the end — and `git status` must be clean before the next probe (a killed turn leaves a mutated gate that a later green run reads as health), and structured `PASS`/`FAIL`/`PRODUCT_BUG` output with a per-scenario coverage slice. Author ≠ tester: prefer a different model than the Implementer.

**Cross-tool compatibility:**

The `.agents/` directory must be tool-agnostic:

- Pure Markdown + YAML frontmatter, natively compatible with Antigravity, Claude Code, and OpenCode.
- All AKILI commands resolve the `.agents/` path relative to the active terminal's current working directory, binding it strictly to the current workspace (no global agents directory).
- Claude Code and OpenCode delegate via sub-prompt contexts seeded with the persona content, so they read `.agents/<role>.md` directly. **Antigravity does not** — it discovers agents under `.agents/agents/` and reaches them via `invoke_subagent`, which additionally requires `subagent: true` in the wrapper's frontmatter. A persona left at `.agents/<role>.md` is therefore invisible to it; Step 8E generates the nested wrappers that point back at these files.

---

### Step 8C: Scaffold Model Routing

Add or upgrade a `## Model Routing` section in the project's root `AGENTS.md` **and** `CLAUDE.md`
so each project carries its own editable, per-tool model-selection registry. This is **guidance
only** — it tells humans and agents which model to switch to per phase. Do not add `model:`
frontmatter to any command and do not change the installer.

The canonical reference is the packaged `docs/model-routing.md` (criteria-first philosophy, the six
capability tiers, the phase→tier mapping, and the model registry). Mirror its content into the
project guides so the project does not depend on the package's `docs/` after install.

**The scaffolded `## Model Routing` section must contain:**

1. A one-line statement of the criteria-first philosophy and the guiding principles
   (match the dominant demand; ARCHITECT = BUILDER; **author ≠ auditor**; reserve deep-reasoning for
   propose/specify/verify **and the orchestrating Leader**; fast & cheap for archive/formatting only
   — **`tasks.md` decomposition is T1, not cheap formatting**).
2. The six capability tiers (T1 Architect, T2 Coder, T3 Auditor, T4 Context-Ingest, T5 Fast-Cheap,
   T6 Multimodal) with one-line definitions — T1 covers architecture reasoning, **task decomposition**,
   **and live orchestration judgment** (decomposition in flight, runtime skill selection, FAIL
   adjudication, pivot).
3. The phase→tier mapping for the real AKILI phases, with the `/akili-execute` triad split into
   Leader (T1, orchestration judgment — writes no code but selects skills, adjudicates FAILs, and
   decides pivots), Implementer (T2), and Reviewer (T3), and an explicit note that the Reviewer model
   must differ from the Implementer model. `/akili-test` is likewise split into its Leader (T1,
   orchestration) and Tester(s) (T2, test authoring), with a note to prefer a Tester model different
   from the Implementer (author ≠ tester).
4. The editable model registry table with columns `Tier | Claude Code | OpenCode | Fallback`, plus
   an `Updated: <YYYY-MM>` stamp. **Alias-first rule:** the Claude Code column uses floating aliases
   (`opus`, `sonnet`, `haiku`) — they always resolve to the latest generation, so the registry
   survives model churn with zero edits; pin a dated model ID only when the user deliberately wants
   to freeze a version, and record why. Fill the OpenCode column from the user's confirmed roster
   (slugs are concrete — no alias mechanism); if it is unknown, leave clearly-marked
   `<CONFIRM SLUG>` placeholders rather than guessing. Fill the **Antigravity** column the same way —
   its picker labels versions rather than exposing stable aliases, so name the family (Gemini Pro /
   Gemini Flash) and confirm the exact identifier with the user, placeholdering what they cannot
   confirm.

   **Emit every host column, always — including the hosts you are not currently running in.** The
   registry belongs to the *project*, not to the session that scaffolded it: the repository outlives
   any one tool, and the same repo is routinely opened in a different host later (or by a different
   teammate, or by a planning layer that delegates to whichever agent it prefers). A registry
   scaffolded from OpenCode that omits the Claude Code column leaves the next Claude Code session
   with nothing to read, and silently breaks the Step 8E wrappers and every command's model
   checkpoint. **An unknown roster is a `<CONFIRM SLUG>` placeholder, never a dropped column.**
   The supported hosts are **Claude Code, OpenCode, and Antigravity** — all three are install
   targets of the packaged CLI, so all three get a column.

   **The CLI invocation for every host column.** A registry naming *which* host to reach without
   naming *how* forces every future session to guess a binary, and the product name is not
   reliably the command — Antigravity's CLI is **`agy`**, not `antigravity`. That guess does not
   fail loudly: it yields a confident "this host is unreachable" that then shapes the plan.
   **Ask the user for each invocation rather than probing the filesystem** — binaries vary with
   install method, live outside the repo, and an absent one may simply not be installed *here*
   while the column stays valid for a teammate. Record confirmed values; placeholder the rest.

   **A `Cross-host dispatch` line.** State which host owns which capability when they differ —
   most commonly *"T6 Multimodal → Antigravity (Gemini vision)"*, since that is the one tier where
   another host beats the session's own column. Record the **routing preference only, never the
   dispatcher**: whether the user has an agent orchestrator installed is a property of their
   machine, not of the project, and naming a specific tool here would date the registry and couple
   the project to it. The rule the line encodes: *reach across hosts before degrading within one,
   but only for a real capability gap — a cross-host spawn costs a fresh context, which a
   one-tier difference does not repay.* This is what gives every command's model checkpoint its
   third option (dispatch the phase) alongside switch-model and continue-as-is.
5. The instruction: *"To change models, edit only this registry table. Never pin a dated model name
   where a floating alias exists. Model selection is guidance only in command prompts — never add
   `model:` to command frontmatter; enforced bindings live only in the Step 8E agent wrappers."*
6. A compact **Effort dial** subsection (mirroring the packaged `docs/model-routing.md` → *Effort
   dial*): effort is the second, **per-task** routing dimension, orthogonal to the tier — the tier
   picks the model, effort picks how hard it thinks on *this* task. Include: (a) the effort-by-signal
   table (trivial/mechanical → `low`; standard scope → `medium`; complex — algorithm, concurrency,
   security, ambiguity → `xhigh`; correctness-critical → `max`); (b) default effort by role (T1
   propose/specify/Leader `high`; T2 Implementer/Tester `medium`, flex by task; T3 Reviewer `high`;
   T5 archive `low`); (c) the rework rule (*bump effort one level on every retry*); (d) the
   tier↔effort rule (*never `max` a cheaper tier — escalate the tier instead*); (e) the
   **re-baseline rule** (*effort defaults are per-generation and must be swept — `medium`/`high`/`xhigh`
   on a real spec — whenever the underlying model generation changes; the tier mapping survives model
   churn, these defaults do not, and a task that arrives under-specified — a `[~]` resume or a
   post-Pivot retry — starts one level higher*); and (f) **effort is not a verbosity dial** (*lowering
   effort does not reliably shorten output — fix long reports in the brief via `caveman` /
   `cognitive-doc-design`, never by dropping effort*). The `/akili-execute` and `/akili-test` Leaders
   read this subsection to set each worker's effort.

**Mode-specific policy (mirror Step 8B):**

- **Brand-new (Seed Setup):** insert the full `## Model Routing` section using the packaged defaults.
- **Legacy (Discovery Setup):** insert the section and, where detected, annotate the registry with
  the project's actual tooling (e.g. note if the team already standardizes on a specific model).
- **Active AKILI-SPECS (Safe Update):** **do not overwrite** an existing customized registry. If the section
  is missing, add it; if it exists, only fill gaps (missing tiers, **a missing host column**, missing
  author ≠ auditor note) without changing the user's pinned models. A registry carrying only the host
  it was scaffolded from is the common case here — restore the missing column with packaged defaults
  or `<CONFIRM SLUG>` placeholders, and leave every existing value untouched. Additionally, **flag stale entries**: compare the
  project registry against the packaged default in `docs/model-routing.md` and list (do not edit)
  entries that name models the tool no longer offers or dated pins that an alias would now cover —
  the user decides whether to refresh them.

Confirm the user's available models before writing concrete identifiers: which tier they run in
Claude Code (and their plan's rate limits) and which models their OpenCode roster exposes. Ask about
**both** even when the user is clearly working in only one of them today — an unanswered host gets
`<CONFIRM SLUG>` placeholders, not a deleted column (see the emit-every-host rule above). Note that
**rate limits are per-generation, not per-family** — a new top-tier generation draws on its own quota
rather than inheriting the previous one's pool, so moving T1/T3 onto it neither frees nor inherits
headroom. If the user carries a **frontier escalation pin** (Step 8C item 4), flag it for
re-justification whenever the `opus` alias advances a generation: each generation narrows the gap the
pin was bought to close, so try the alias at `xhigh`/`max` before renewing the pin.

---

### Step 8D: Scaffold the Skill Map

Add or upgrade a `## Skill Map` section in the project's root `AGENTS.md` **and** `CLAUDE.md` so the
project declares which stack-dependent skills apply to it. AKILI binds skills at three levels
(see the packaged `docs/skills/governance.md`): `core` and `conditional` skills are already wired
into the command prompts; **`stack` skills are never hard-referenced by commands** — this Skill Map
is how they reach the agents.

**The scaffolded `## Skill Map` section must contain:**

1. A table `Skill | Applies To | When to load` listing only the stack skills that match the
   detected or declared stack. Candidates shipped with AKILI: `angular-developer`, `nestjs-expert`,
   `shadcn-ui`, `tailwind-design-system`, `react-doctor`, `vercel-react-best-practices`,
   `aws-serverless`, `api-design-principles`, `error-handling-patterns`. Projects may add their own.
2. The instruction: *"During `/akili-specify`, derive each task's required skills from this map.
   During `/akili-execute` and `/akili-test`, the Leader assigns these skills and the
   Implementer/Tester must load them before writing code or tests."*
3. **Environment-provided rows, when the user confirms the tooling.** A skill shipped by a *tool*
   rather than by AKILI belongs in this map too. Standing examples: an agent orchestrator's
   coordination skill (e.g. `orchestration`), loaded by the **Leader** before it dispatches
   cross-host or parallel work; `playwright-cli` (Microsoft's browser-automation skill), assigned
   to **E2E Testers** and browser-verification tasks when installed — the token-lean alternative
   to loading the Playwright MCP schemas into every session; and the `hyperframes` family
   (HTML-based video composition), when the project's work includes producing explainer, demo, or
   launch-video content. Ask the user before adding one; never infer it from the filesystem.
   Mark the row's *When to load* with the availability condition, because the map is **committed and
   shared while the tooling is per-developer** — a teammate without that tool must still be able to
   run every command. Never copy the skill into the repository: these stubs are thin on purpose
   because the tool's binary serves the version-matched guide, so a vendored copy goes stale and
   starts instructing agents to call flags that no longer exist (see the packaged
   `docs/skills/governance.md` → *Environment-provided skills*).

**Mode-specific policy (mirror Step 8B):**

- **Brand-new (Seed Setup):** build the map from the seed intent's declared stack.
- **Legacy (Discovery Setup):** build the map from the codebase scan evidence (frameworks, UI
  library, cloud tooling actually present). Do not list skills for frameworks the repo does not use.
- **Active AKILI-SPECS (Safe Update):** preserve an existing customized map; only add rows for
  newly detected stack elements and remove rows the user confirms are obsolete.

---

### Step 8E: Bind Personas to Models (Tool-Native Agent Wrappers)

Offer to generate **tool-native agent definitions** that bind the `.agents/` personas to the models
in the `## Model Routing` registry (Step 8C). This turns model routing from guidance into
enforcement for the multi-agent fan-out — where most tokens are spent — and makes
**author ≠ auditor structural**: the Reviewer wrapper is pinned to a different model than the
Implementer wrapper in configuration, not by human discipline.

Ask the user first (one question): *"Bind the AKILI personas to models with native agent wrappers,
so the Implementer/Reviewer/Tester automatically run on their tier's model?"* If declined, skip
this step — the guidance-only flow keeps working.

**Per tool:**

- **Claude Code:** create project-level `.claude/agents/akili-leader.md`, `akili-implementer.md`,
  `akili-reviewer.md`, and `akili-tester.md`. Each wrapper is thin:

  ```markdown
  ---
  name: akili-implementer
  description: AKILI Implementer — executes one spec task with strict scope and verification.
  model: sonnet
  ---
  Read `.agents/implementer.md` in the project root and adopt it fully as your persona and
  operating contract before doing anything else.
  ```

  Models come from the registry's Claude Code column as **aliases** (default: leader `opus` (T1 —
  orchestration judgment), implementer `sonnet`, reviewer `opus`, tester `sonnet`). Never copy the
  persona body into the wrapper — `.agents/` stays the single source of truth.

  **The Reviewer wrapper additionally carries a `tools` allowlist — it is the one wrapper that
  gets one.** `.agents/reviewer.md` opens by declaring the role read-only, but an instruction is
  something the model *complies with*, and a diff that looks one edit away from passing is exactly
  the moment compliance is most tempting. `author ≠ auditor` is already structural on the model
  axis (a different model than the Implementer); this makes it structural on the **write** axis too,
  so an auditor that starts fixing what it is auditing is stopped by configuration rather than by
  discipline:

  ```markdown
  ---
  name: akili-reviewer
  description: AKILI Reviewer — independent audit of the Implementer's diff against the spec.
  model: opus
  tools: Read, Grep, Glob
  ---
  Read `.agents/reviewer.md` in the project root and adopt it fully as your persona and
  operating contract before doing anything else.
  ```

  Those three are what the role actually consumes. **No `Bash`** — the Leader extracts the git diff
  and passes it in (`/akili-execute` Step 2.3), so the Reviewer never runs a command. **No
  `Write`/`Edit`** — that is the whole point. `Read`/`Grep`/`Glob` stay because the persona permits
  reading a full source file *"unless absolutely necessary to verify the diff"*, and removing that
  escape hatch would force a FAIL whenever the diff alone is genuinely ambiguous. Restrict the
  Reviewer and **nowhere else**: the Leader orchestrates, the Implementer writes and verifies, and
  the Tester authors and runs suites — all three need broad access, and an allowlist on them buys
  nothing and breaks the role.

- **OpenCode:** create the equivalent project agent definitions (`.opencode/agent/akili-*.md` or
  the `agent` block of `opencode.json`, matching the user's OpenCode version) with `model:` set to
  the registry's OpenCode slugs (default: implementer `opencode-go/glm-5.2`, reviewer
  `opencode-go/deepseek-v4-pro`, leader `opencode-go/kimi-k3` (T1 — orchestration judgment),
  tester `opencode-go/deepseek-v4-flash` — the T2 fallback rather than the T2 primary, so the
  Tester lands on a **different model than the Implementer** (author ≠ tester)).

  Apply the same **read-only restriction to the Reviewer wrapper only**, for the reason given in the
  Claude Code bullet. OpenCode's mechanism for this has changed across versions — it has been both a
  `tools` map and a `permission` block — so **confirm the field name and shape against the user's
  installed version before writing it**, exactly as you already do for the agent-definition location
  itself. If it cannot be confirmed, **omit the restriction** rather than guessing, and record in the
  Step 9 summary that the OpenCode Reviewer is read-only by instruction rather than by
  configuration. A wrapper that fails to load is worse than one that relies on the persona.

- **Google Antigravity:** create `.agents/agents/akili-leader/agent.md`, `akili-implementer/`,
  `akili-reviewer/`, and `akili-tester/` (the flat form `.agents/agents/<name>.md` is equivalent).
  **The nesting is required** — Antigravity discovers agents under `.agents/agents/`, so a persona
  left at `.agents/<role>.md` is invisible to it. Same thin wrapper, richer frontmatter:

  ```markdown
  ---
  name: akili-reviewer
  description: AKILI Reviewer — independent audit of the Implementer's diff against the spec.
  model: pro
  subagent: true
  mainAgent: false
  tools:
    - view_file
    - grep_search
  ---
  Read `.agents/reviewer.md` in the project root and adopt it fully as your persona and
  operating contract before doing anything else.
  ```

  | Field | Why AKILI sets it |
  |---|---|
  | `model` | `inherit` \| `flash` \| `pro` — the registry's Antigravity column. Leader/Reviewer `pro` (T1/T3), Implementer/Tester `flash` (T2) |
  | `subagent: true` | **Required** for the Leader to reach it via `invoke_subagent`. Without it the wrapper exists and is never invocable |
  | `mainAgent: false` | Keeps Implementer/Reviewer/Tester out of the primary-agent picker — they are only ever dispatched. The Leader keeps `mainAgent: true` |
  | `tools` | The Reviewer's read-only role stops being an instruction and becomes a **restriction** |

  **All three hosts restrict the Reviewer; what differs here is the failure mode.** Apply `tools`
  to the Reviewer and nowhere else — every other wrapper needs broad tool access — but note that on
  this host a mistake is far more expensive than on the other two. The vendor documents that an
  unmapped or misspelled tool name **hangs the subagent process**, so a wrong guess fails silently
  rather than erroring. **Confirm every name against the installed binary, not against the vendor's
  documentation** — the published example has been observed naming a tool absent from the shipped
  CLI, so copying it verbatim is itself a way to hang the Reviewer. When the names cannot be
  confirmed, **omit `tools` entirely** and record in the summary that the Reviewer is read-only by
  instruction rather than by restriction. A hung Reviewer is worse than an unenforced one.

  **Verifying the wrappers — `agy agents` gives a false negative.** That subcommand enumerates only
  **global** agents (`~/.gemini/config/agents/`); it takes no workspace flag and never reports
  project-level ones, so an empty listing says nothing about wrappers written under `.agents/agents/`.
  Verify in-session instead: open the CLI in the project and run **`/agents`**. Tell the user what a
  correct result looks like, because it is counter-intuitive — **only `akili-leader` appears.** That
  picker selects the *primary* agent, and Implementer / Reviewer / Tester carry `mainAgent: false`
  precisely so they stay out of it. One entry is the success condition; four would mean the roles
  meant to be dispatch-only are selectable as main agents.

**Rules:**

1. The Reviewer wrapper's model MUST differ from the Implementer wrapper's model. If the registry
   collapses them, escalate the Reviewer one tier before writing the wrappers. The Tester wrapper
   should also **prefer** a model different from the Implementer's (author ≠ tester — a preference,
   not a hard rule); if they collapse, note it in the summary rather than blocking.
2. The Reviewer wrapper SHOULD carry the host's read-only restriction, and it is the **only**
   wrapper that carries one. This is the write-axis half of `author ≠ auditor`; rule 1 is the model
   axis. Unlike rule 1 it is not blocking — where the syntax cannot be confirmed, or naming a tool
   wrong would hang the agent, **omit it and say so**. An omitted restriction leaves the Reviewer
   read-only by instruction, which is the status quo and works; an **unreported** omission is the
   real defect, because it is indistinguishable from an enforced one.
3. Wrappers reference `.agents/<role>.md`; they never duplicate persona content. Editing a persona
   requires no wrapper change; changing a model requires editing only the wrapper (or re-running
   this step).
4. **Mode policy:** Brand-new/Legacy — create the wrappers when accepted. Active AKILI-SPECS —
   never overwrite existing wrapper files; create only missing ones and flag model drift between
   existing wrappers and the current registry.

---

### Step 8F: Scaffold Guardrail Hooks (Claude Code only, opt-in)

Offer to scaffold **guardrail hooks** into the project's `.claude/settings.json` — harness-level
enforcement of methodology invariants that today live only as prose. The design rule that gates
what belongs here: **a hook may block a violation; it must never perform an action the methodology
routes through judgment.** Auto-committing, auto-formatting into the diff, auto-syncing state are
*actors* and stay out — they would automate the exact moments the gates exist to protect (an
auto-commit per edit would even empty the working-tree diff the Reviewer audits). Guardrails only.

Ask the user first (one question): *"Scaffold the AKILI guardrail hook, so a task cannot be marked
`[x]` without Reviewer PASS evidence in `execution.md` — enforced by the harness, not by prompt
discipline?"* If declined, skip — the prose rules keep working as before.

**When accepted:**

1. Write `.claude/hooks/akili-tasks-gate.sh` (executable) with exactly this content:

   ```bash
   #!/bin/bash
   # AKILI guardrail: a task cannot flip to [x] without Reviewer PASS evidence
   # in the same spec's execution.md (evidence before checkbox).
   # Scaffolded by /akili-constitution Step 8F. Claude Code PreToolUse hook.
   input=$(cat)
   fp=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
   case "$fp" in
     */docs/specs/*/tasks.md) ;;
     docs/specs/*/tasks.md) ;;
     *) exit 0 ;;
   esac
   tool=$(printf '%s' "$input" | jq -r '.tool_name // empty')
   if [ "$tool" = "Edit" ]; then
     old=$(printf '%s' "$input" | jq -r '.tool_input.old_string // ""')
     new=$(printf '%s' "$input" | jq -r '.tool_input.new_string // ""')
   else
     old=$(cat "$fp" 2>/dev/null || printf '')
     new=$(printf '%s' "$input" | jq -r '.tool_input.content // ""')
   fi
   count_x() { printf '%s' "$1" | grep -o '\[x\]' | wc -l | tr -d ' '; }
   [ "$(count_x "$new")" -le "$(count_x "$old")" ] && exit 0
   exec_md="$(dirname "$fp")/execution.md"
   if [ ! -f "$exec_md" ]; then
     echo "BLOCKED (AKILI guardrail): flipping a task to [x] but $exec_md does not exist. Evidence first: append the execution.md entry with the Reviewer PASS before updating tasks.md (/akili-execute Step 3 order)." >&2
     exit 2
   fi
   if ! grep -q "PASS" "$exec_md"; then
     echo "BLOCKED (AKILI guardrail): $exec_md contains no PASS evidence. A task reaches [x] only after a Reviewer PASS is recorded (evidence before checkbox)." >&2
     exit 2
   fi
   exit 0
   ```

2. Merge into the project's `.claude/settings.json` (**read it first; if it exists but is invalid
   JSON, stop and report — never overwrite a file you could not parse**):

   ```json
   {
     "hooks": {
       "PreToolUse": [
         {
           "matcher": "Edit|Write",
           "hooks": [
             { "type": "command", "command": "bash .claude/hooks/akili-tasks-gate.sh" }
           ]
         }
       ]
     }
   }
   ```

   Merge, never replace: preserve every existing hook and setting. Project scope on purpose — the
   file is committed, so the guardrail binds every teammate's session in this repo, which is the
   point.

**What the gate enforces and what it deliberately tolerates:** it blocks the `[x]`-without-evidence
write for *everyone* in the checkout — agents mid-loop and humans alike; a human with a legitimate
reason records the evidence or disables the hook, both of which are visible acts. The PASS check is
a **v1 heuristic** (any `PASS` in the spec's `execution.md`) — coarse, but it catches the failure
that matters (a checkbox with no audit trail at all), and its ordering premise is exactly
`/akili-execute` Step 3's evidence-first rule, which is what makes this gate *possible*. Projects
wanting a sharper marker (per-task-ID matching) can harden the script; note the heuristic in the
Step 9 summary either way.

**Honesty across hosts:** hooks are Claude Code's mechanism. On OpenCode and Antigravity the same
invariant remains prose (the commands' own rules) — record in the summary that the guardrail is
*enforced* on Claude Code and *instructional* elsewhere, the same asymmetry Step 8E already
documents for the Reviewer's `tools` restriction. On Windows the hook additionally depends on
git-bash (`bash .claude/hooks/akili-tasks-gate.sh`) — normally already present because Claude Code
on Windows requires Git for Windows, but name it if the project has Windows teammates.

**Mode policy:** Brand-new/Legacy — scaffold when accepted. Active AKILI-SPECS — never overwrite an
existing `akili-tasks-gate.sh` (the project may have hardened it); create only if missing, and flag
drift between an existing script and this template without touching it.

---

### Step 9: Present and Confirm

After drafting or enhancing the documents, generate a short, easy-to-understand summary (summary facil de entender de lo que se hizo) covering:

- What was created vs enhanced
- Which of the three modes was applied (Brand-new / Legacy / Active AKILI-SPECS) and why
- Whether CodeGraph was used, initialized, declined, or unavailable
- The chosen spec taxonomy under `docs/specs/`
- The main problem statement and personas captured in the PRD
- The main UX/system decisions captured in the UX/UI design document
- The main technical decisions captured in the TRD
- The core infrastructure decisions captured in the Infrastructure document
- The state of `.agents/` (created from defaults, customized to detected stack, or preserved with upgrades) and any customizations applied
- The `## Model Routing` registry (Step 8C): that it was written to **both** root guides, which host columns it carries, and any `<CONFIRM SLUG>` placeholders left for the user to fill
- The `## Skill Map` (Step 8D): which stack skills were mapped, and on what evidence
- The Step 8E agent wrappers: generated (and for which tool), or declined — and whether the Reviewer wrapper carries the host's **read-only restriction** or is read-only by instruction only (name which, per Step 8E rule 2)
- The Step 8F guardrail hook: scaffolded (noting it is enforced on Claude Code and instructional on other hosts, and that the PASS check is the v1 heuristic), or declined
- Any assumptions and open questions that still need validation

Report a step that was **skipped** as explicitly as one that ran — a silently omitted Step 8C is the failure this summary exists to catch.

**Close with the next step, by mode** — the handoff out of the constitution is where new users get lost, so never end at "baseline created" without saying what comes now:

| Mode | Next step to recommend |
|---|---|
| **Brand-new** | **Do not re-propose the seed** — the PRD *is* that intent, already reviewed here. Run `/akili-propose <first-milestone>` in its **Greenfield track**: it reads the PRD and decomposes the v1 scope into bounded changes with a build order (no re-pasting the seed prompt). If v1 is genuinely one bounded piece, go straight to `/akili-specify <spec-path>` |
| **Legacy** | Normal flow: `/akili-propose <change>` for the first piece of work — or `/akili-audit` first if the goal is understanding drift before touching anything |
| **Active AKILI-SPECS** | `/akili-resume` to pick up in-flight specs, or `/akili-propose <change>` for new work |

Ask the user whether to approve or request changes. If changes are requested, revise the affected documents and re-present.

---

## Verification Checklist

Before presenting the summary, confirm each of these. Report any that fail rather than closing the command silently.

- [ ] `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, and `docs/infrastructure.md` exist and are non-empty.
- [ ] `docs/specs/general-setup/` templates exist.
- [ ] `.agents/` contains `leader.md`, `implementer.md`, `reviewer.md`, and `tester.md`.
- [ ] **CodeGraph was explicitly resolved, not silently skipped** — in Legacy/Discovery mode especially, where it is the difference between synthesizing the baseline from a graph and synthesizing it from `grep` output. Exactly one of: `.codegraph/` exists and was used; the user was offered `codegraph init -i` and **declined**; or the CLI is unavailable. **"Optional" means the user chooses, not that the step may disappear** — an unreported skip is indistinguishable from a considered decision, and Step 9 must name which of the four states applies.
- [ ] If Step 8E wrappers were generated for **Antigravity**, they live under `.agents/agents/` (not at the root of `.agents/`, where Antigravity cannot see them) and every dispatched role carries `subagent: true`. A wrapper missing either is inert without erroring.
- [ ] If Step 8E wrappers were generated, the **Reviewer** wrapper's state is named in the summary: either it carries the host's read-only restriction, or it was deliberately omitted (syntax unconfirmable, or a wrong tool name would hang the agent). Verify no *other* wrapper carries one — a restricted Leader, Implementer, or Tester is a broken role, not a stricter one. Both `author ≠ auditor` axes should hold: a Reviewer model different from the Implementer's (rule 1) **and** no write tools (rule 2).
- [ ] The Step 8F guardrail was **explicitly resolved** — scaffolded (script exists at `.claude/hooks/akili-tasks-gate.sh`, settings entry merged without clobbering existing hooks, cross-host asymmetry named) or declined and said so. If scaffolded into a project whose `.claude/settings.json` was invalid JSON, the step must have stopped rather than written.
- [ ] Scan-derived context was injected **per the Step 8B injection-scope table**, not as one bundle copied into all four personas. Two spot-checks settle it: `tester.md` must **not** carry the design-token path (it does not audit tokens), and `leader.md` **must** carry the directory boundaries (it judges task independence against them).
- [ ] **A `## Model Routing` section exists in `AGENTS.md` AND in `CLAUDE.md`** — both files, not one. The registry is mirrored into the project guides on purpose; `docs/model-routing.md` is the packaged reference and is deliberately **not** copied into the project.
- [ ] That registry carries **every supported host column** (Claude Code, OpenCode, and Antigravity — all three are CLI install targets), with `<CONFIRM SLUG>` placeholders for any roster the user could not confirm — never a dropped column.
- [ ] The registry includes the six tiers, the `Updated: <YYYY-MM>` stamp, the author ≠ auditor note, and the Effort dial subsection.
- [ ] A `## Skill Map` section exists in both root guides.
- [ ] In Safe Update mode, no pre-existing user customization was overwritten in the baseline docs, `.agents/`, the registry, or the Skill Map.
- [ ] Every legacy path migration proposed in Step 1 was either applied with references updated, or explicitly declined by the user.

---

## Outcome

At the end of `/akili-constitution`, the repository should have a project-level baseline that future `/akili-specify`, `/akili-execute`, `/akili-validate`, and `/akili-test` work can rely on without guessing the structure or conventions. The `.agents/` personas must be in place so that `/akili-execute` can run the Leader → Implementer → Reviewer rework loop and `/akili-test` can run the Leader → Tester(s) harness without falling back to inline personas. The root guides must also carry a `## Model Routing` registry (Step 8C) so each phase runs on a model matched to its demand, with the Reviewer on a different model than the Implementer, and a `## Skill Map` (Step 8D) so stack-dependent skills reach the agents without being hardcoded into commands.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
