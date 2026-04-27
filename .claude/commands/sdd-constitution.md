# Establish SDD Constitution

Establish or strengthen the project-wide SDD foundation. This command ensures the base documentation exists, upgrades it in place when already present, and aligns the repository guidance with the product, UI/UX, and technical blueprint.

## Usage

```
/sdd-constitution
```

## Behavior

### Step 0: Foundation Setup

1. Ensure `docs/` exists. Create it if missing.
2. Ensure `docs/specs/` exists. Create it if missing.
3. Identify whether these files already exist:
   - `docs/prd.md`
   - `docs/system-design/design.md`
   - `docs/detailed-design/detailed-design.md`
   - `CLAUDE.md`
4. Default behavior is to **enhance existing documents in place**, not create parallel copies.

---

### Step 1: Read Project Context First

Before writing anything, read the repository context carefully:

1. Root `CLAUDE.md` if it exists
2. Package-level `CLAUDE.md` files if they exist
3. Existing `docs/prd.md`
4. Existing `docs/system-design/design.md`
5. Existing `docs/detailed-design/detailed-design.md`
6. Existing `docs/specs/` folders to extract terminology, feature history, and current scope
7. Any architecture, infrastructure, setup, or product docs already present under `docs/`

Also inspect the codebase to understand:

- Product domain and business model
- Main user roles and workflows
- Current frontend/backend/shared architecture
- Existing design system patterns
- Technical constraints already enforced by the repo

Do not write weak placeholder documentation when the repository already contains enough context to infer the baseline.

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

Ask only what is needed to avoid making unstable assumptions.

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

**Use skills:**

- `frontend-design`
- `stitch-design`

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

**Document intent:**

- Translate product and system design into implementation-ready guidance
- Define data structures, APIs, workflows, and module responsibilities
- Describe how the system works internally so engineering and QA can execute consistently

When the file already exists, strengthen missing or weak sections while preserving valid repository-specific decisions.

---

### Step 6: Update the Root CLAUDE Guide

Update root `CLAUDE.md` so it references the three core foundation documents:

- `docs/prd.md`
- `docs/system-design/design.md`
- `docs/detailed-design/detailed-design.md`

The update should explain briefly:

- What each document is for
- When Claude should consult each one
- That these documents form the constitutional baseline for future SDD work

Preserve the repository's existing `CLAUDE.md` conventions and extend them, do not replace them with a generic template.

---

### Step 7: Present and Confirm

After drafting or enhancing the documents, present a concise summary covering:

- What was created vs enhanced
- The main problem statement and personas captured in the PRD
- The main UX/system decisions captured in system design
- The main technical decisions captured in detailed design
- Any assumptions and open questions that still need validation

Ask the user whether to:

- Approve
- Request Changes

If changes are requested, revise the affected documents and re-present.

---

## Outcome

At the end of `/sdd-constitution`, the repository should have a project-level documentation baseline that future `/sdd-specify`, `/sdd-execute`, `/sdd-validate`, and `/sdd-test` work can rely on.
