---
description: Draft detailed requirements, UI/UX designs, and technical tasks for a proposed feature.
---

# Generate SDD for Module

Generate a clear Spec-Driven Development document set for one bounded module, feature, bugfix, or enhancement inside `docs/specs/`.

The goal is not to create long documents. The goal is to make the intended behavior, design choices, implementation tasks, and verification path easy to review before code is written.

If `proposal.md` already exists for the same spec path, treat it as the approved intent and convert it into full requirements, design, and tasks. If no proposal exists, create the spec directly from the user's request and repository context.

## Usage

```
/sdd-specify <spec-path>
```

**Examples:**

- `/sdd-specify loan`
- `/sdd-specify enhancements/renewals`
- `/sdd-specify admin/user-management`

## Arguments

- `$ARGUMENTS` — Relative path under `docs/specs/` where the spec should live. It may be a flat module name or a nested taxonomy path.

## Output

Create or update these files under `docs/specs/$ARGUMENTS/`:

- `proposal.md` — optional prior intent document created by `/sdd-propose`
- `requirements.md` — what behavior must exist and why it matters
- `design.md` — how the behavior will be implemented within the current architecture
- `tasks.md` — small executable tasks linked to requirements and design sections

Use the lightest useful depth:

| Depth | Use For | Documentation Style |
|---|---|---|
| Lite | Small bugfixes, copy updates, narrow UI tweaks | Short sections, focused requirements, one or a few tasks |
| Standard | Normal features and enhancements | Full requirements, scenarios, design decisions, task breakdown |
| Full | Risky, cross-cutting, API, data, auth, or migration work | Include alternatives, rollout, risks, observability, rollback |

Lite mode still requires testable requirements, scenarios, and done criteria.

## Behavior

### Step 0: Setup

1. Create directory `docs/specs/$ARGUMENTS/` if it does not exist.
2. Read `docs/specs/$ARGUMENTS/proposal.md` if it exists.
3. Read the constitutional templates in `docs/specs/general-setup/`:
   - `requirements.md`
   - `design.md`
   - `task.md`
4. Read project-level reference context:
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - Root `CLAUDE.md`
   - Package-level `CLAUDE.md` files if they exist
5. Read nearby or dependent specs under `docs/specs/` that overlap with the requested path.
6. Respect the repository's current package layout and naming conventions instead of assuming a fixed stack.

---

### Phase 1: Requirements (`requirements.md`)

**Role:** Product Owner — define what is being built and why.

#### Step 1.1 — Explore & Scope Chunking

Use `brainstorming` and, when helpful, `product-manager-toolkit` to clarify:

- user problem and target actors
- scope boundaries and dependencies
- primary flows and feature areas
- success metrics and constraints

**Scope Chunking:** If the user provides a very large instruction or epic, evaluate if it is too massive for a single spec.
- If it spans multiple distinct modules or features, propose splitting the spec into multiple separate specs.
- If the user agrees, create the separate folders under `docs/specs/` and draft a `proposal.md` or jump straight to the split documents (`requirements.md`, `design.md`, `tasks.md`) for each chunk.

#### Step 1.2 — Write

Generate `requirements.md` using `docs/specs/general-setup/requirements.md` as the format source.

Minimum content:

1. Document Control
2. Executive Summary
3. Glossary
4. System Context & Scope
5. Stakeholders / Personas
6. Functional Requirements
7. Non-Functional Requirements
8. Requirement ID Index

Guidelines:

- follow the repo's established requirement ID pattern from `general-setup`
- align with `docs/prd.md`
- align with `proposal.md` when present
- reference existing specs when this work extends another feature
- use measurable, testable language
- separate goals from requirements
- write behavior contracts, not implementation plans
- include concrete scenarios for key requirements using `GIVEN`, `WHEN`, `THEN`, and optional `AND`
- make requirement strength explicit with `SHALL`, `MUST`, `SHOULD`, or `MAY` where useful

Recommended requirement shape:

```markdown
### Requirement: Short Behavior Name

The system SHALL provide the observable behavior.

#### Scenario: Main case

- GIVEN the relevant starting state
- WHEN the triggering action happens
- THEN the expected outcome occurs
- AND any required side effect is visible
- BUT it must NOT [explicit constraint or negative path]
- AND IT MUST [explicit validation or boundary condition]
```

Avoid putting internal class names, library choices, or step-by-step implementation details in requirements. Those belong in `design.md` or `tasks.md`.

If `proposal.md` includes a Requirement Delta Preview, convert it into full requirements:

- `ADDED` items become new requirements and scenarios
- `MODIFIED` items become updated behavior descriptions with before/after context
- `REMOVED` items become explicit deprecation or removal requirements with migration notes when relevant

#### Step 1.3 — Present & Approve

Present a clear summary of the generated requirements on the screen (including the main scenarios, rules, and any explicit negative constraints) so the user can review what was done before deciding.

Then explicitly ask the user how to proceed, providing these options:

1. **Continue** (Proceed to Phase 2: `design.md`)
2. **Adjust** (Refine or change the requirements)
3. **Stop** (Pause the specification process here)
4. **Type something** (Provide custom instructions or feedback)

Wait for the user's response before moving on.

---

### Phase 2: Design (`design.md`)

**Role:** System Architect — define how the feature will be built.

#### Step 2.1 — Explore

Use `brainstorming` to explore trade-offs before writing.

If the work includes meaningful UI/UX impact, use this skill preference:

- `ui-ux-pro-max` if available
- otherwise `frontend-design` + `stitch-design`

Use additional technical skills as needed:

- `nestjs-expert`
- `api-design-principles`
- `shadcn-ui`
- `tailwind-design-system`
- `vercel-react-best-practices`
- `error-handling-patterns`
- `aws-serverless`

#### Step 2.2 — Write

Generate `design.md` using `docs/specs/general-setup/design.md` as the format source.

Minimum content:

1. Document Control
2. Executive Summary
3. Architecture Overview
4. Extended Directory Structure
5. Data Model
6. API Design
7. Backend Module Design
8. Frontend / UX Component Architecture
9. Shared Contracts or Package Extensions
10. Design Decisions

Guidelines:

- extend existing architecture rather than replacing it
- use current repo paths and package names
- include UI/UX decisions when the feature affects screens, flows, or components
- tie design sections back to requirements explicitly
- record meaningful trade-offs and rejected alternatives for non-trivial decisions
- call out data, API, security, error-handling, observability, and rollback concerns when relevant
- keep design decisions practical enough that an implementer can act without re-discovery

#### Step 2.3 — Present & Approve

Present a summary of the generated design and explicitly ask the user how to proceed, providing these options:

1. **Review Design** (Use the `judgment-day` skill to review the design before moving on)
2. **Continue** (Proceed to Phase 3: `tasks.md`)
3. **Adjust** (Refine or change the design)
4. **Stop** (Pause the specification process here)
5. **Type something** (Provide custom instructions or feedback)

If the user selects **Review Design** and the `judgment-day` judges detect issues that need correction, present the following options to handle the findings:

1. **Fix and Re-judge** (Apply fixes for the findings and run the judgment again)
2. **Fix only** (Apply fixes but do not run the judgment again)
3. **Continue** (Accept the design as-is and proceed to Phase 3: `tasks.md`)
4. **Stop** (Pause the specification process here)
5. **Type something** (Provide custom instructions or feedback)

Wait for the user's response before moving on.

---

### Phase 3: Tasks (`tasks.md`)

**Role:** Tech Lead — define the implementation plan.

#### Step 3.1 — Explore

Use `brainstorming` to determine sequencing, dependencies, parallelization, and test strategy.

#### Step 3.2 — Write

Generate `tasks.md` using `docs/specs/general-setup/task.md` as the format source.

Each task should include:

- status
- size
- dependencies
- requirements covered
- design references
- scope
- tests
- done criteria
- relevant skills

Skill inventory should use real, available skills only.

Task quality rules:

- one task should be small enough to complete and verify in one focused session
- every task must reference the requirements it satisfies
- every task must include a concrete verification command or manual check
- tasks should explicitly address the negative constraints (`BUT it must NOT`) and strict validations (`AND IT MUST`) defined in their respective requirement scenarios
- tasks should avoid broad instructions like "implement feature" without scoped subtasks
- tasks may be grouped by phase, but dependencies must remain explicit

Preferred UI/UX skill rule:

- use `ui-ux-pro-max` when available for UI-heavy tasks
- otherwise use `frontend-design` and/or `stitch-design`

#### Step 3.3 — Present & Approve

Present a summary of the generated tasks, including:
- An **Estimated Lines of Code (LOC)** output for the entire spec.
- A **PR Strategy Recommendation**: If the estimate exceeds ~400 LOC or the task graph is highly complex, recommend splitting the implementation into multiple Pull Requests and suggest logical boundaries (e.g., "PR 1: Backend/API, PR 2: Frontend UI").

Then explicitly ask the user how to proceed, providing these options:

1. **Continue** (Proceed to the final Verification Checklist)
2. **Adjust** (Refine or change the tasks or PR strategy)
3. **Stop** (Pause the specification process here)
4. **Type something** (Provide custom instructions or feedback)

Wait for the user's response before moving on.

---

## Verification Checklist

After all three documents are approved, verify:

- [ ] All 3 files exist with non-empty content
- [ ] All documents follow `docs/specs/general-setup/` conventions
- [ ] The chosen depth is appropriate for the risk and size of the work
- [ ] Requirements describe observable behavior, not implementation details
- [ ] Key requirements include Given/When/Then scenarios with strict `BUT` and `AND IT MUST` rules where applicable
- [ ] Every requirement appears in at least one task
- [ ] Every task references requirements and design sections
- [ ] Every task has clear done criteria and verification guidance that accounts for the negative scenarios
- [ ] The task dependency graph has no circular dependencies
- [ ] The spec path matches the repo's chosen taxonomy under `docs/specs/`
- [ ] Only real, available skills are referenced in tasks

---

## Review Handoff

When the spec is ready, present a short handoff summary:

1. Spec path and chosen depth: Lite, Standard, or Full
2. Problem being solved
3. Requirements and key scenarios
4. Important design decisions and risks
5. Task count, estimated LOC, and recommended PR strategy (single vs. multiple PRs)
6. Recommended first task
7. Open questions or assumptions that still need user confirmation

If a proposal existed, mention whether the generated spec stayed aligned with it or changed based on implementation discovery.
