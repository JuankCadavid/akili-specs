---
description: Establish or strengthen the project-wide SDD foundation and baseline docs (PRD, UX/UI Design, TRD).
---

# Establish SDD Constitution

Establish or strengthen the project-wide SDD foundation. This command creates the documentation baseline that all later module-level SDD work depends on.

## Usage

```
/sdd-constitution
```

## Behavior

### Step 0: Determine Project Mode and Foundation Setup

Before classifying the repository, use the `brainstorming` skill to ask the user if this is a new project/MVP starting from 0, or if it is an existing project with an established structure.

Based on the response, classify the repository into one of three modes. The classification is non-destructive — it controls how aggressively the constitution drafts, scans, or preserves existing material.

- **Brand-new project (Seed Setup):** The user is starting from scratch. Prepare the project from 0. There is little or no application code, no stable project documentation, and no prior SDD artifacts.
- **Legacy codebase (Discovery Setup):** The user indicates an existing project structure. Analyze the existing project and explicitly prompt to install CodeGraph (`codegraph init -i`) before proceeding. Meaningful application code, package manifests, infrastructure, tests, routes, components, or prior non-SDD docs exist, but the JCSPECS SDD baseline (`docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/specs/general-setup/`) is missing or skeletal.
- **Active SDD project (Safe Update):** the SDD baseline already exists, prior specs live under `docs/specs/`, and an `.agents/` directory may already contain customized personas. The constitution must upgrade weak sections without overwriting customizations.

For all three modes:

1. Ensure `docs/` exists.
2. Ensure `docs/specs/` exists.
3. Ensure `docs/specs/general-setup/` exists.
4. Ensure root `CLAUDE.md` exists or is enhanced.
5. Ensure root `AGENTS.md` exists or is enhanced.
6. Ensure project-level `.agents/` exists with `leader.md`, `implementer.md`, and `reviewer.md` (see Step 7B).
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

**Mode-specific drafting policy:**

- **Brand-new:** prompt the user for a seed intent (product idea, target users, stack preference), then draft baselines and `.agents/` from the default templates plus that intent.
- **Legacy:** do not draft the baseline until repository reality has been inspected and summarized. Use CodeGraph or `Grep` to extract components, API surfaces, styling tokens, and module boundaries; synthesize the baseline from that evidence; tailor `.agents/` personas to the detected stack (frameworks, test runner, design tokens).
- **Active SDD:** read existing files and any custom subagent rules. **Do not overwrite them.** Upgrade only weak sections, fill in missing files, and extend `.agents/` to support the multi-agent loop while preserving custom instructions.

**Legacy path migration (pre-TRD naming):**

Older SDD baselines used `docs/system-design/design.md` for the UX/UI blueprint and `docs/detailed-design/detailed-design.md` for the technical blueprint. When those legacy paths exist:

1. Treat them as the existing UX/UI Design document and TRD — never draft duplicates alongside them.
2. In Active SDD mode, propose migrating them with `git mv` to `docs/ux-ui/design.md` and `docs/trd/trd.md`, then update every reference in `CLAUDE.md`, `AGENTS.md`, `.agents/*.md`, and `docs/specs/` to the new paths.
3. If the user declines migration, keep the legacy paths and note the mapping in `CLAUDE.md` so later SDD commands resolve them correctly.

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

#### Existing Project CodeGraph Check

For existing projects, prefer CodeGraph for repository analysis when available:

1. If `.codegraph/` exists, use CodeGraph for symbol lookup, architecture context, callers/callees, and impact analysis before broad file scanning.
2. If `.codegraph/` does not exist and the `codegraph` CLI is available, ask the user whether to run `codegraph init -i` before continuing.
3. If CodeGraph is unavailable or the user declines initialization, continue with normal `Glob`, `Grep`, and file reads.
4. Never block the constitution on CodeGraph. Treat it as an optional context accelerator.
5. Do not commit generated CodeGraph databases. Only durable configuration such as `.codegraph/config.json` may be committed when useful.

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

Ask only what is needed to avoid unstable assumptions.

---

### Step 3: Create or Enhance the General PRD

Create or enhance `docs/prd.md` as a concise living document.

**Primary skill:** `product-manager-toolkit`

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

**Use skills when relevant:**

- `nestjs-expert`
- `api-design-principles`
- `error-handling-patterns`
- `aws-serverless`
- `shadcn-ui`
- `tailwind-design-system`
- `vercel-react-best-practices`

**Required structure:**

1. System Overview
2. Domain Modules & Responsibilities
3. Data Model & Entities
4. API Surface & Contracts
5. Backend Workflows & Business Rules
6. Frontend Architecture & State Boundaries
7. Integration Points
8. Security & Authorization Model
9. Error Handling & Observability
10. Testing Strategy
11. Technical Constraints & Assumptions

---

### Step 6: Create or Enhance the Infrastructure Document

Create or enhance `docs/infrastructure.md` as the deployment and hosting blueprint.

**Required structure:**

1. Target Environment (e.g., AWS, GCP, Vercel, On-prem)
2. Core Cloud Components (e.g., Lambda, S3, RDS, ECS)
3. Deployment Strategy (e.g., CI/CD, Terraform, CDK)
4. Network & Security Architecture
5. Infrastructure Rules & Constraints

If this information is missing during the initial setup or discovery phase, explicitly ask the user for the intended infrastructure specifications before drafting this document.

---

### Step 7: Create or Enhance General Setup Templates

Create or enhance the canonical templates under `docs/specs/general-setup/`.

These files define the format that `/sdd-specify` must follow later:

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
- That these documents form the constitutional baseline for future SDD work
- How module specs should be organized under `docs/specs/`
- Which skills should be used for common work in the project
- Whether CodeGraph is initialized and how agents should use it for existing-project analysis
- Which model to switch to per SDD phase (the `## Model Routing` registry added in Step 7C)

Preserve the repository's existing `CLAUDE.md` and `AGENTS.md` conventions and extend them.

**Nested agent guide inheritance:**

Root guides are the parent; major modules or packages may carry child guides. Establish this convention explicitly:

1. A module/package gets a child `CLAUDE.md` and/or `AGENTS.md` **only when its conventions genuinely diverge from the root** (different stack, test runner, boundaries, or domain rules). Do not scaffold empty child guides for every folder.
2. Child guides stay thin and module-specific. They must never duplicate root rules — inheritance means the root guide always applies and children only add or narrow.
3. The root guides must carry a `## Module Guides` index: one line per child guide (`- <path> — <one-line scope>`). A child guide that is not referenced from the parent index is considered drift.
4. **Legacy mode:** create child guides only where the codebase scan shows divergent conventions, and build the parent index from what exists. **Active SDD mode:** preserve existing child guides, add missing parent index entries, and never overwrite customized children.

This index is what keeps agent context inheritance working: agents load the root guide plus the child guide of the module they are touching.

---

### Step 8B: Scaffold the `.agents/` Triad

Establish or upgrade the project-level `.agents/` directory that powers the JCSPECS multi-agent execution loop (Leader → Implementer → Reviewer used by `/sdd-execute`).

Target layout:

```text
<project-root>/
├── .agents/
│   ├── leader.md        # Orchestration playbook, task tracking, .agents references
│   ├── implementer.md   # Coding guidelines, testing standards, design-token discipline
│   └── reviewer.md      # Spec conformance audit, design-token compliance, structured FAIL output
```

**Source of truth for templates:**

The packaged methodology ships default personas under `sdd-jc/templates/` inside the active tool's config directory:

- Claude Code: `~/.claude/sdd-jc/templates/{leader,implementer,reviewer}.md`
- OpenCode: `~/.config/opencode/sdd-jc/templates/{leader,implementer,reviewer}.md`
- Antigravity: `~/.gemini/config/sdd-jc/templates/{leader,implementer,reviewer}.md`

If the packaged templates are available, prefer copying them as the seed; otherwise draft equivalent personas inline using the structure documented in this command and the `/sdd-execute` command.

**Mode-specific scaffolding policy:**

- **Brand-new (Seed Setup):** copy the three default templates verbatim into `.agents/`. Tailor only the project name and detected stack if known.
- **Legacy (Discovery Setup):** copy the three default templates, then customize them based on the codebase scan — inject detected design-token paths, the test command, the lint command, framework conventions, and any directory boundaries discovered. The Reviewer persona in particular should know which `design.md` and `trd.md` paths to cite.
- **Active SDD (Safe Update):** **do not overwrite** existing `.agents/*.md` files. For each missing file, install the default template (customized to the detected stack). For each existing file, read it, identify gaps versus the current packaged template (e.g. missing rework-loop instructions, missing PASS/FAIL output contract, missing JCSPECS commit standard), and append a minimal upgrade block that preserves all existing custom instructions.

**Required content per persona:**

- **`leader.md`** — orchestration sequence, rework loop with 3-attempt ceiling, structured FAIL handoff to the next Implementer spawn, `execution.md` audit-trail format, `tasks.md` status transitions, JCSPECS commit standard, Pivot Protocol escalation.
- **`implementer.md`** — strict context alignment to constitution + spec, incremental focus (no scope creep), aesthetics and design-token compliance from `docs/ux-ui/design.md`, verification rigor (must run the task's verification command before reporting), structured completion report.
- **`reviewer.md`** — read-only role, audit checklist (requirement conformance, design-token compliance, technical compliance, stability), structured PASS/FAIL output where every FAIL item lists *Discovered Issue*, *Violated Rule*, and *Remediation Suggestion*.

**Cross-tool compatibility:**

The `.agents/` directory must be tool-agnostic:

- Pure Markdown + YAML frontmatter, natively compatible with Antigravity, Claude Code, and OpenCode.
- All JCSPECS commands resolve the `.agents/` path relative to the active terminal's current working directory, binding it strictly to the current workspace (no global agents directory).
- Antigravity invokes `invoke_subagent` using prompts read from `.agents/`; Claude Code and OpenCode delegate via sub-prompt contexts seeded with the persona content.

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
   propose/verify; fast & cheap for tasks/archive).
2. The six capability tiers (T1 Architect, T2 Coder, T3 Auditor, T4 Context-Ingest, T5 Fast-Cheap,
   T6 Multimodal) with one-line definitions.
3. The phase→tier mapping for the real JCSPECS phases, with the `/sdd-execute` triad split into
   Leader (T5), Implementer (T2), and Reviewer (T3), and an explicit note that the Reviewer model
   must differ from the Implementer model.
4. The editable model registry table with columns `Tier | Claude Code | OpenCode | Fallback`.
   Fill the Claude Code column for the user's plan (e.g. PRO: Opus reserved for T1/T3, Sonnet as the
   T2/T4/T6 workhorse, Haiku for T5). Fill the OpenCode column from the user's confirmed roster; if
   it is unknown, leave clearly-marked `<CONFIRM SLUG>` placeholders rather than guessing.
5. The instruction: *"To change models, edit only this registry table. Model selection is guidance
   only — never add `model:` to command frontmatter."*

**Mode-specific policy (mirror Step 7B):**

- **Brand-new (Seed Setup):** insert the full `## Model Routing` section using the packaged defaults.
- **Legacy (Discovery Setup):** insert the section and, where detected, annotate the registry with
  the project's actual tooling (e.g. note if the team already standardizes on a specific model).
- **Active SDD (Safe Update):** **do not overwrite** an existing customized registry. If the section
  is missing, add it; if it exists, only fill gaps (missing tiers, missing author ≠ auditor note)
  without changing the user's pinned models.

Confirm the user's available models before writing concrete identifiers: which tier they run in
Claude Code (and their plan's rate limits) and which models their OpenCode roster exposes.

---

### Step 9: Present and Confirm

After drafting or enhancing the documents, generate a short, easy-to-understand summary (summary facil de entender de lo que se hizo) covering:

- What was created vs enhanced
- Which of the three modes was applied (Brand-new / Legacy / Active SDD) and why
- Whether CodeGraph was used, initialized, declined, or unavailable
- The chosen spec taxonomy under `docs/specs/`
- The main problem statement and personas captured in the PRD
- The main UX/system decisions captured in the UX/UI design document
- The main technical decisions captured in the TRD
- The core infrastructure decisions captured in the Infrastructure document
- The state of `.agents/` (created from defaults, customized to detected stack, or preserved with upgrades) and any customizations applied
- Any assumptions and open questions that still need validation

Ask the user whether to approve or request changes. If changes are requested, revise the affected documents and re-present.

---

## Outcome

At the end of `/sdd-constitution`, the repository should have a project-level baseline that future `/sdd-specify`, `/sdd-execute`, `/sdd-validate`, and `/sdd-test` work can rely on without guessing the structure or conventions. The `.agents/` triad must be in place so that `/sdd-execute` can run the Leader → Implementer → Reviewer rework loop without falling back to inline personas. The root guides must also carry a `## Model Routing` registry (Step 8C) so each phase runs on a model matched to its demand, with the Reviewer on a different model than the Implementer.
