# Generate SDD for Module

Generate a complete Spec-Driven Development (SDD) document set for a module. Creates three files following the project's established conventions from `docs/specs/general-setup/`.

## Usage

```
/sdd-specify <module-name>
```

**Example:** `/sdd-specify data-intake` creates `docs/specs/data-intake/requirements.md`, `design.md`, and `tasks.md`.

## Arguments

- `$ARGUMENTS` — The module name (e.g., `data-intake`, `risk-engine`, `reporting`). Used as the directory name under `docs/specs/`.

## Behavior

### Step 0: Setup

1. Create directory `docs/specs/$ARGUMENTS/` if it doesn't exist
2. Read the following reference documents for format conventions:
   - `docs/specs/general-setup/requirements.md` — requirement ID conventions, document structure
   - `docs/specs/general-setup/design.md` — architecture section layout, data model format
   - `docs/specs/general-setup/task.md` — task format, skill references, dependency graph
3. Read existing architecture and design context:
   - `docs/architecture/overview.md` — system architecture
   - `docs/figma-design/README.md` — Figma screen inventory (if UI module)
   - `packages/api/prisma/schema.prisma` — current data model
   - `packages/api/CLAUDE.md` — backend conventions
   - `packages/web/CLAUDE.md` — frontend conventions
4. Read any existing SDD documents that this module depends on

---

### Phase 1: Requirements (`requirements.md`)

**Role:** Product Owner — define WHAT we're building and WHY.

#### Step 1.1 — Brainstorm

**Use skill:** `brainstorming` — explore the module's purpose, user needs, scope boundaries, feature areas, and edge cases before writing requirements. Focus on:
- Who are the users and what problems does this module solve?
- What are the key feature areas and their priorities?
- What is in scope vs. deferred?
- What are the edge cases and constraints?

#### Step 1.2 — Write

Generate `requirements.md` following the structure below.

**Structure (follow general-setup/requirements.md format):**

1. **Document Control** — version, date, references table
2. **Executive Summary** — module overview, scope, relationship to prior phases
3. **Glossary** — new terms specific to this module
4. **System Context & Scope** — in-scope vs deferred table, screen coverage
5. **Stakeholders** — who uses this module
6. **Functional Requirements** — organized by feature area with ID conventions:
   - Use prefix `FR-{MODULE_ABBREVIATION}-*` (e.g., `FR-DI-*` for data-intake)
   - Number requirements sequentially within each section
   - Each requirement: ID, description (SHALL language), Priority (Must/Should/Could), Source reference
7. **Non-Functional Requirements** — `NFR-{MODULE_ABBREVIATION}-*` for module-specific NFRs
8. **Requirement ID Index** — summary table of all IDs by section

**Guidelines:**
- Reference Figma screen guides (`docs/figma-design/screens/`) for UI requirements
- Reference component patterns (`docs/figma-design/component-patterns.md`) for component specs
- Cross-reference existing requirements (FR-AUTH-*, FR-PM-*) that this module depends on
- Use SHALL for Must requirements, SHOULD for Should requirements
- Include API endpoint table for backend modules

#### Step 1.3 — Present & Approve

Present a summary to the user covering:
- Total number of functional and non-functional requirements
- Key feature areas and their Must/Should/Could breakdown
- Scope boundaries (in-scope vs deferred)
- Any assumptions or open questions

**Use `AskUserQuestion`** to ask the user to approve the requirements document before proceeding. Offer options:
- **Approve** — proceed to Phase 2
- **Request Changes** — user provides feedback, revise requirements.md, then re-present

**Do NOT proceed to Phase 2 until the user explicitly approves.**

---

### Phase 2: Design (`design.md`)

**Role:** System Architect — define HOW we're building it.

#### Step 2.1 — Brainstorm

**Use skill:** `brainstorming` — explore architecture approaches and trade-offs before writing the design document. Focus on:
- What are the possible architecture approaches? (e.g., sync vs async, monolith module vs microservice)
- What data model changes are needed? Are there alternative schema designs?
- What are the key technical trade-offs and their implications?
- How does this integrate with existing modules and services?
- What are the performance, scalability, and security considerations?

#### Step 2.2 — Write

Generate `design.md` using the approved requirements.

**Use skills:**
- `nestjs-expert` + `api-design-principles` — for backend architecture
- `shadcn-ui` + `tailwind-design-system` + `vercel-react-best-practices` — for frontend architecture

**Structure (follow general-setup/design.md format):**

1. **Document Control** — references to requirements.md
2. **Executive Summary** — technical approach summary
3. **Architecture Overview** — extended system diagram showing new components
4. **Extended Directory Structure** — file tree with [E]xisting / [M]odified / [N]ew markers
5. **Data Model** — new Prisma models, enums, and relations to existing models
6. **API Design** — new endpoints table (Method, Endpoint, Auth, Controller, Service Method, Req ID)
7. **Backend Module Design** — module dependency graph, service method signatures
8. **Frontend Component Architecture** — component hierarchy tree, React Query hooks, route structure
9. **Shared Package Extensions** — new enums and types for `@alliance-risk/shared`
10. **Design Decisions** — decisions made in this phase with rationale

**Guidelines:**
- EXTEND existing architecture, never replace
- Follow Module > Service > Controller pattern for backend
- Follow React Query hooks pattern for data fetching
- Follow React Hook Form + Zod for forms
- All assessment endpoints must validate ownership
- Use shadcn/ui components as building blocks
- Reference existing patterns from the codebase

#### Step 2.3 — Present & Approve

Present a summary to the user covering:
- Architecture approach chosen and key rationale
- New/modified data models
- API endpoints being added
- New frontend components and their hierarchy
- Key design decisions and trade-offs made

**Use `AskUserQuestion`** to ask the user to approve the design document before proceeding. Offer options:
- **Approve** — proceed to Phase 3
- **Request Changes** — user provides feedback, revise design.md, then re-present

**Do NOT proceed to Phase 3 until the user explicitly approves.**

---

### Phase 3: Tasks (`tasks.md`)

**Role:** Tech Lead — define the step-by-step implementation plan.

#### Step 3.1 — Brainstorm

**Use skill:** `brainstorming` — explore task breakdown strategy before writing the tasks document. Focus on:
- What is the optimal task sequencing and dependency graph?
- Which tasks can be parallelized (e.g., backend and frontend work)?
- What are the riskiest or most complex tasks that need careful scoping?
- Are there foundation tasks that unblock everything else?
- What testing strategy covers the most critical paths?

#### Step 3.2 — Write

Generate `tasks.md` using the approved requirements and design.

**Structure (follow general-setup/task.md format):**

1. **Document Control** — source references
2. **Legend** — expertise tags, status markers, skill references
3. **Tasks grouped by phase** — each task has:
   - Status: `[ ]` (not started)
   - Skills: from the skill inventory below
   - Size: S/M/L/XL
   - Dependencies: other task IDs
   - Requirements: FR-* IDs covered
   - Design Ref: section in design.md
   - Scope: bullet list of implementation details
   - Tests: what to test
   - Done when: acceptance criteria
4. **Dependency Graph** — ASCII art showing task dependencies
5. **Task Summary** — table with phase, task count, total size, expertise
6. **Requirement Coverage Matrix** — every FR-* appears in at least one task

**Skill Inventory:**
- `nestjs-expert` — NestJS modules, DI, guards, interceptors, testing
- `api-design-principles` — REST endpoint design, DTOs, validation
- `error-handling-patterns` — Exception mapping, error propagation
- `aws-serverless` — Lambda, S3, Cognito, CDK
- `shadcn-ui` — Component installation, forms, dialogs, tables
- `tailwind-design-system` — Design tokens, responsive layout, theming
- `frontend-design` — Page layout, visual hierarchy, UX patterns
- `vercel-react-best-practices` — React Query, hooks, state management
- `systematic-debugging` — Test failures, runtime debugging
- `figma:implement-design` — Translate Figma mockups to code
- `brainstorming` — Explore requirements and design before implementation

**Guidelines:**
- Each task should be completable in a single Claude session
- S = ~1-2h, M = ~2-4h, L = ~4-8h, XL = ~8h+
- Foundation tasks come first (shared types, models, layout shell)
- Backend and frontend phases can often run in parallel
- Every FR-* requirement must be covered by at least one task
- No circular dependencies in the task DAG

#### Step 3.3 — Present & Approve

Present a summary to the user covering:
- Total number of tasks and estimated effort
- Phase breakdown and parallelization opportunities
- Critical path through the dependency graph
- Riskiest tasks and mitigation approach
- Requirement coverage confirmation

**Use `AskUserQuestion`** to ask the user to confirm the tasks document. Offer options:
- **Approve** — finalize and run verification checklist
- **Request Changes** — user provides feedback, revise tasks.md, then re-present

---

## Verification Checklist

After all three documents are approved, verify:

- [ ] All 3 files created with non-empty content
- [ ] Document Control tables present in all files
- [ ] Every FR-* ID in requirements.md appears in at least one task
- [ ] Every task references specific requirements and design sections
- [ ] No circular dependencies in task dependency graph
- [ ] New models extend (don't replace) existing Prisma schema
- [ ] New modules follow NestJS Module > Service > Controller pattern
- [ ] New components use shadcn/ui + Tailwind patterns
- [ ] Every task has at least one skill from the inventory
- [ ] Requirement ID Index totals are correct
