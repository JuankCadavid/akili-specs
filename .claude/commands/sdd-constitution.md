---
description: Establish or strengthen the project-wide SDD foundation and baseline docs (PRD, System Design, Detailed Design).
---

# Establish SDD Constitution

Establish or strengthen the project-wide SDD foundation. This command creates the documentation baseline that all later module-level SDD work depends on.

## Usage

```
/sdd-constitution
```

## Behavior

### Step 0: Determine Project Mode and Foundation Setup

First classify the repository mode:

- **New project**: little or no application code, no stable project documentation, or the user is starting a product baseline from scratch.
- **Existing project**: application code, package manifests, infrastructure, tests, routes, components, or prior docs already exist.

For both modes:

1. Ensure `docs/` exists.
2. Ensure `docs/specs/` exists.
3. Ensure `docs/specs/general-setup/` exists.
4. Ensure root `CLAUDE.md` exists or is enhanced.
5. Ensure root `AGENTS.md` exists or is enhanced.
6. Default behavior is to enhance existing project docs in place instead of creating parallel copies.

The constitutional baseline must cover these files:

- `docs/prd.md`
- `docs/system-design/design.md`
- `docs/detailed-design/detailed-design.md`
- `docs/specs/general-setup/requirements.md`
- `docs/specs/general-setup/design.md`
- `docs/specs/general-setup/task.md`
- `CLAUDE.md`
- `AGENTS.md`

For new projects, draft the baseline from user intent, product assumptions, chosen stack, and explicit open questions.

For existing projects, do not draft the baseline until repository reality has been inspected and summarized.

---

### Step 1: Read Project Context First

Before writing anything, read the repository context carefully:

1. Root `CLAUDE.md` if it exists
2. Root `AGENTS.md` if it exists
3. Package-level `CLAUDE.md` and `AGENTS.md` files if they exist
4. Existing `docs/prd.md`
5. Existing `docs/system-design/design.md`
6. Existing `docs/detailed-design/detailed-design.md`
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

### Step 4: Create or Enhance the System Design Document

Create or enhance `docs/system-design/design.md` as the UI/UX system blueprint.

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

### Step 5: Create or Enhance the Detailed Design Document

Create or enhance `docs/detailed-design/detailed-design.md` as the technical implementation blueprint.

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

### Step 6: Create or Enhance General Setup Templates

Create or enhance the canonical templates under `docs/specs/general-setup/`.

These files define the format that `/sdd-specify` must follow later:

1. `requirements.md` — requirement numbering, structure, and writing standards
2. `design.md` — architecture, data model, API, frontend, and decision-record structure
3. `task.md` — task format, dependency graph format, testing expectations, and execution conventions

These are methodology templates for future specs, not a feature spec themselves.

They must reflect:

- The repo's current architecture and package layout
- The chosen `docs/specs/` taxonomy
- The approved PRD, system design, and detailed design conventions

---

### Step 7: Update Root Agent Guides

Update root `CLAUDE.md` and `AGENTS.md` so they reference:

- `docs/prd.md`
- `docs/system-design/design.md`
- `docs/detailed-design/detailed-design.md`
- `docs/specs/general-setup/`

The update should explain briefly:

- What each document is for
- When Claude should consult each one
- That these documents form the constitutional baseline for future SDD work
- How module specs should be organized under `docs/specs/`
- Which skills should be used for common work in the project
- Whether CodeGraph is initialized and how agents should use it for existing-project analysis

Preserve the repository's existing `CLAUDE.md` and `AGENTS.md` conventions and extend them.

---

### Step 8: Present and Confirm

After drafting or enhancing the documents, present a concise summary covering:

- What was created vs enhanced
- Whether the project was treated as new or existing
- Whether CodeGraph was used, initialized, declined, or unavailable
- The chosen spec taxonomy under `docs/specs/`
- The main problem statement and personas captured in the PRD
- The main UX/system decisions captured in system design
- The main technical decisions captured in detailed design
- Any assumptions and open questions that still need validation

Ask the user whether to approve or request changes. If changes are requested, revise the affected documents and re-present.

---

## Outcome

At the end of `/sdd-constitution`, the repository should have a project-level baseline that future `/sdd-specify`, `/sdd-execute`, `/sdd-validate`, and `/sdd-test` work can rely on without guessing the structure or conventions.
