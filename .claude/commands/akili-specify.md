---
name: akili-specify
description: Draft detailed requirements, UI/UX designs, and technical tasks for a proposed feature.
license: MIT
metadata:
  author: Juan Carlos Cadavid (jcadavid.com)
---

# Generate AKILI-SPECS for Module

Generate a clear Spec-Driven Development document set for one bounded module, feature, bugfix, or enhancement inside `docs/specs/`.

The goal is not to create long documents. The goal is to make the intended behavior, design choices, implementation tasks, and verification path easy to review before code is written.

If `proposal.md` already exists for the same spec path, treat it as the approved intent and convert it into full requirements, design, and tasks. If no proposal exists, create the spec directly from the user's request and repository context.

## Usage

```
/akili-specify <spec-path>
```

**Examples:**

- `/akili-specify loan`
- `/akili-specify enhancements/renewals`
- `/akili-specify admin/user-management`

## Arguments

- `$ARGUMENTS` — Relative path under `docs/specs/` where the spec should live. It may be a flat module name or a nested taxonomy path.

## Output

Create or update these files under `docs/specs/$ARGUMENTS/`:

- `proposal.md` — optional prior intent document created by `/akili-propose`
- `requirements.md` — what behavior must exist and why it matters
- `design.md` — how the behavior will be implemented within the current architecture
- `tasks.md` — small executable tasks linked to requirements and design sections

Use the lightest useful depth:

| Depth | Use For | Documentation Style |
|---|---|---|
| Lite | Small bugfixes, copy updates, narrow UI tweaks | Extreme brevity: 1-2 bullet points for requirements, skip architectural boilerplate, 1 strictly focused task. Output tokens must be minimized. |
| Standard | Normal features and enhancements | Full requirements, scenarios, design decisions, task breakdown |
| Full | Risky, cross-cutting, API, data, auth, or migration work | Include alternatives, rollout, risks, observability, rollback |

Lite mode still requires testable requirements, scenarios, and done criteria.

### Bug Mode

When the spec is a **bug** — the proposal's Document Control says `Type: Bug`, the spec path is `bugfix/*`, or the user frames it as a defect — specify runs in **Bug Mode** on top of the chosen depth (usually Lite):

- Treat the proposal's **Bug Diagnosis** (confirmed root cause + reproduction) as the source of truth. If no proposal exists, first confirm the root cause with the `systematic-debugging` skill before writing the fix plan — do not specify a fix for a guessed cause.
- Frame requirements around the **corrected behavior**, with a scenario that encodes the exact failing case from the reproduction steps.
- **A regression test is mandatory.** At least one task must add a test that reproduces the bug — **red before the fix, green after** — and the requirement's scenario must map to it. This is non-negotiable evidence that the bug is actually fixed and stays fixed.
- Keep the fix scoped to the root cause; do not fold unrelated cleanup into a bugfix.

## Behavior

### Step 0: Setup

**Model checkpoint:** This phase runs best on **T1 Architect** for requirements/design **and for the Phase 3 `tasks.md` decomposition** — breaking the design into executable tasks with correct boundaries and dependencies is reasoning, not cheap formatting; a bad decomposition poisons every downstream Implementer (re-check at Phase 3 only to switch to **T6 Multimodal** when visual design is in scope). If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps that tier to a model different from the current session model, tell the user in one line — e.g. *"Phases 1–3 are T1 — the registry recommends `/model opus`; you are on haiku"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode) at the first approval pause. Never block on this; continuing on the current model is always allowed.

**Token Optimization (Prompt Caching):** To maximize prompt caching, always read the constitutional baseline documents FIRST and in the exact same order across all sessions before reading task-specific files.

1. Create directory `docs/specs/$ARGUMENTS/` if it does not exist.
2. Read project-level reference context (IN THIS ORDER):
   - Root `CLAUDE.md`
   - `AGENTS.md`
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - The constitutional templates in `docs/specs/general-setup/` (`requirements.md`, `design.md`, `task.md`)
   - Package-level `CLAUDE.md` files if they exist
3. Read `docs/specs/$ARGUMENTS/proposal.md` if it exists. If it has a **Visual Reference** section, treat the referenced source as approved visual design context and load it:
   - A Figma URL → use the Figma MCP when available.
   - A generated mockup under `docs/specs/$ARGUMENTS/mockup/`, `.stitch/designs`, or a `.stitch/DESIGN.md` reference → read those artifacts (screens, HTML, design tokens) and use `stitch-design` to interpret them.
   - Any mockup produced during `/akili-propose` counts as visual design context for the `Design Impact` steps below, exactly like a Figma link.
4. Read nearby or dependent specs under `docs/specs/` that overlap with the requested path.
   - Also read `docs/specs/kaizen-log.md` if it exists — ONLY the `## Active Lessons` table (skip `## Entries`).
5. Respect the repository's current package layout and naming conventions instead of assuming a fixed stack.
6. **CodeGraph over full reads:** If `.codegraph/` exists, use `codegraph_search` and `codegraph_context` to inspect relevant code paths instead of reading full source files or using generic `grep`/`glob`. This drastically reduces input tokens.
7. **Delegation Thresholds (scout research):** Beyond the constitutional docs above, apply the *Delegation Thresholds* from `.agents/leader.md` to source-code exploration in every Explore step of this command — if answering a design question requires reading **4+ full source files**, spawn a scout/Explore subagent with fresh context and consume its conclusions instead of reading the files inline. CodeGraph lookups (rule 6) do not count toward the threshold.

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
- When recommending the build order of the split specs, score them with RICE or MoSCoW from the `product-manager-toolkit` skill (AKILI-SPECS Integration section) instead of guessing.
- If the user agrees, create the separate folders under `docs/specs/` and draft a `proposal.md` or jump straight to the split documents (`requirements.md`, `design.md`, `tasks.md`) for each chunk.

#### Step 1.2 — Write

Generate `requirements.md` using `docs/specs/general-setup/requirements.md` as the format source. Write every spec document (`requirements.md`, `design.md`, `tasks.md`) following `cognitive-doc-design`: lead with the answer, progressive disclosure, and tables/checklists/scenarios over prose.

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
- **Design Impact:** IF the proposal includes any visual design context (Figma, an agent-generated mockup, or a `.stitch/DESIGN.md` reference), ensure UI states (loading, error, empty, success) and responsive behaviors are captured as explicit requirements.
- include concrete scenarios for key requirements using `GIVEN`, `WHEN`, `THEN`, and optional `AND`
- make requirement strength explicit with `SHALL`, `MUST`, `SHOULD`, or `MAY` where useful

**Name the defect classes, then choose the gate against them.** Before settling on verification commands, list the **classes of defect this spec can actually produce**, then state which command catches each one. The failure this prevents is specific and expensive: a gate that passes while the artifact is wrong. An automated check reports green, the Reviewer sees a passing verification, the task advances — and the defect ships or burns rework attempts on a loop that cannot see it.

Visual and rendered output is where this bites hardest. `axe` cannot evaluate contrast over a rasterized image, and no automated checker can tell a *plausible but false* alt text from a true one — both pass every green gate. A spec that produces rendered imagery whose gate is `npm test` + `axe` has **no gate for its dominant defect class**, only a gate for its rarest.

| Situation | What `requirements.md` must say |
|---|---|
| Every defect class has a command that catches it | Nothing extra — the mapping is the gate |
| A class has no automated check | **Say so explicitly** and name the substitute: a human check at the HITL pause, or a phase routed to a model that *can* evaluate it (visual review is **T6 Multimodal** — see the registry's *Cross-host dispatch*, since the strongest column for that tier is often not the session's own host) |
| A class is unmeasurable and unsubstituted | Record it as an accepted risk in the spec. An acknowledged blind spot is recoverable; an unacknowledged one is what consumes rework attempts |

**A gate blind to the defect class the spec most often produces is not a gate.** Do not let the presence of *a* verification command stand in for coverage of the defects that matter.

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

If the feature is architecturally significant (a new module or service, a new integration or data flow, a persistence or communication-topology change, or any stated NFR impact), load `software-architect` and apply its Decision Spine: NFR scenarios with measurable responses, tactics, robust-vs-lite sizing, pattern selection bound to named problems, and ADR-style design decisions.

If the work includes meaningful UI/UX impact, use this skill preference:

- `ui-ux-pro-max` if available
- otherwise `frontend-design` + `stitch-design`

If the work involves animation (scroll effects, transitions, motion design), load `gsap-animation` and read the reference file matching the task.

Use additional stack skills as needed — prefer the project's `## Skill Map` (in root `AGENTS.md`/`CLAUDE.md`) when it exists; otherwise pick from:

- `nestjs-expert`
- `api-design-principles`
- `shadcn-ui`
- `tailwind-design-system`
- `vercel-react-best-practices`
- `error-handling-patterns`
- `aws-serverless`
- `angular-developer`

#### Step 2.2 — Write

Generate `design.md` using `docs/specs/general-setup/design.md` as the format source. Apply relevant Active Lessons from `docs/specs/kaizen-log.md` and cite the lesson ID next to the design decision it shaped.

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
- **Design Impact:** IF the proposal includes any visual design context (Figma, an agent-generated mockup, or a `.stitch/DESIGN.md` reference), break down the visual design into a clear Frontend Component Architecture (e.g., atomic components) and define the necessary Design Tokens (colors, typography). When the source is a generated mockup, derive the tokens from its artifacts (HTML/screens or `.stitch/DESIGN.md`).
- tie design sections back to requirements explicitly
- record meaningful trade-offs and rejected alternatives for non-trivial decisions
- call out data, API, security, error-handling, observability, and rollback concerns when relevant
- keep design decisions practical enough that an implementer can act without re-discovery
- **Code Suppression:** DO NOT generate code snippets or implementation examples in `design.md`. Design decisions must remain conceptual to conserve output tokens. The actual code will be written during execution.

#### Step 2.3 — Challenge Reversions

**Every design decision that reverts behavior already delivered gets one cheap challenge before it reaches `tasks.md`.** The Implementer has an auditor; the Reviewer audits its diff on a different model. **The Leader's own design decisions have none** — they go from judgment straight to implementation, and a wrong one is not caught by a FAIL, it is *implemented correctly* and discovered two rework rounds later.

Trigger: a DD that removes, disables, or inverts something the codebase already ships — a blend mode, a fallback, a guard, a cache, a retry, a defaulted prop. Adding is not a reversion; taking away is.

The challenge is deliberately small — **one reviewer, one question: "what does removing this break?"** Not a `judgment-day` panel (that stays the opt-in Step 2.4 pass for the design as a whole), not a fan-out. The Delegation Ceiling applies: this is a two-minute pass bought to avoid two rework rounds, and it stops being worth it the moment it grows.

Record the answer next to the DD. If the challenge names a concrete breakage the design does not address, fix the design now — reaching `tasks.md` with it costs an Implementer spawn, a Reviewer spawn, and a rework attempt to learn the same thing.

Skip only in **Lite** depth *and* when the reverted behavior has no test covering it and no visible surface. When in doubt, run it: one question is cheaper than one rework attempt.

#### Step 2.4 — Size Against the Design

**The depth chosen in Phase 0 was a guess made before the design existed. Now it can be checked.** This is the only point in the flow where the estimate is knowable and still free to act on.

State three numbers from the design just written: **expected tasks, expected LOC, expected review rounds.** Then compare them to the declared depth:

| Signal | Action |
|---|---|
| Estimate lands far **below** the depth (e.g. `Standard` chosen, design resolves to one task under ~50 LOC) | Say so plainly and offer to drop a level — or, for a genuinely cosmetic one-liner, to abandon the spec for `/akili-quick`. `/akili-propose` routes by size *before* the design exists; this is the re-check *after* |
| Estimate lands far **above** the depth | Recommend the higher depth, or splitting the spec. A `Lite` spec that resolves to eight tasks was mis-scoped, not ambitious |
| Estimate matches | Say nothing beyond recording the numbers |

Write the three numbers into `design.md` as a **budget**. They are not a cap on quality — they are a **tripwire**: `/akili-execute` compares actuals against them and, when execution exceeds the budget, the Leader **stops and escalates to the user** rather than continuing. Exceeding a budget is information, not failure; continuing past one silently is how a twenty-line change consumes a fourteen-task machinery.

#### Step 2.5 — Present & Approve

Present a clear summary of the generated design on the screen (including the architecture, data models, API endpoints, and main design decisions) so the user can review what was done before deciding. Include the **budget** from Step 2.4 and the outcome of any **reversion challenge** from Step 2.3 — both are decisions the user is entitled to overrule.

Then explicitly ask the user how to proceed, providing these options:

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

Skill inventory should use real, available skills only. Derive each task's required skills from the project's `## Skill Map` (root `AGENTS.md`/`CLAUDE.md`) plus the conditional skills that match the task (`ui-ux-pro-max`/`frontend-design` for UI, `gsap-animation` for animation).

Task quality rules:

- one task should be small enough to complete and verify in one focused session
- every task must reference the requirements it satisfies
- every task must include a concrete verification command or manual check
- **every task must state what *disqualifies* the evidence, not only what satisfies it.** A gate that defines only when to pass **invites passing**: given a criterion for success and none for doubt, an agent that produces *a* number will read it as *the* number. Write the no-pass clause next to the pass clause — *"if the three runs vary by more than the effect you are measuring, the number is not evidence; report the spread instead of committing."* This matters most for **measured** signals (performance, timing, layout metrics, flake-prone suites), where a value can be produced without meaning anything, and it is a different blindness from the defect-class mapping above: that one asks whether the gate can *see* the defect, this one asks whether the gate knows when its own reading is **worthless**. An inconclusive verification is a legitimate outcome and must be reportable as one — never collapsed into a pass because the command exited `0`
- tasks should explicitly address the negative constraints (`BUT it must NOT`) and strict validations (`AND IT MUST`) defined in their respective requirement scenarios
- **Bug Mode:** IF this is a bug, one task MUST add a regression test that reproduces the defect (red before the fix, green after) and reference the corrected-behavior requirement. Its verification is that the test fails on current code and passes after the fix.
- **Design Impact:** IF the proposal includes any visual design context (Figma, an agent-generated mockup, or a `.stitch/DESIGN.md` reference), ensure frontend tasks are atomic, focusing on specific UI components, layouts, styling, and states extracted from the design or mockup artifacts.
- tasks should avoid broad instructions like "implement feature" without scoped subtasks
- tasks may be grouped by phase, but dependencies must remain explicit

Preferred UI/UX skill rule:

- use `ui-ux-pro-max` when available for UI-heavy tasks
- otherwise use `frontend-design` and/or `stitch-design`

#### Step 3.3 — Present & Approve

Present a clear summary of the generated tasks on the screen, including:
- A high-level list of the tasks to be implemented so the user understands the plan without reading the full document.
- An **Estimated Lines of Code (LOC)** output for the entire spec.
- A **PR Strategy Recommendation**: If the estimate exceeds ~400 LOC or the task graph is highly complex, recommend splitting the implementation into multiple Pull Requests and suggest logical boundaries (e.g., "PR 1: Backend/API, PR 2: Frontend UI"). When PRs are chained, note that their descriptions should follow `cognitive-doc-design` review-empathy rules (what to review first, what is out of scope, link previous/next PR).

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
- [ ] The chosen depth is appropriate for the risk and size of the work — and was **re-checked against the finished design** (Step 2.4), not left as the Phase 0 guess
- [ ] `design.md` records a **budget** (expected tasks, LOC, review rounds) that `/akili-execute` can trip against
- [ ] Every DD that **reverts already-delivered behavior** carries the outcome of its Step 2.3 challenge
- [ ] `requirements.md` names the **defect classes this spec can produce** and maps each to the command that catches it — with any class lacking an automated check either substituted (human check at a HITL pause, or a T6 visual review) or recorded as an accepted risk
- [ ] Requirements describe observable behavior, not implementation details
- [ ] Key requirements include Given/When/Then scenarios with strict `BUT` and `AND IT MUST` rules where applicable
- [ ] Every requirement appears in at least one task
- [ ] Every task references requirements and design sections
- [ ] Every task has clear done criteria and verification guidance that accounts for the negative scenarios
- [ ] The task dependency graph has no circular dependencies
- [ ] For a bug (Bug Mode): the root cause is reflected in the requirements and at least one task adds a regression test (red before, green after)
- [ ] The spec path matches the repo's chosen taxonomy under `docs/specs/`
- [ ] Only real, available skills are referenced in tasks

---

## Review Handoff

When the spec is ready, generate a short, easy-to-understand summary (summary facil de entender de lo que se hizo) that reflects what was done. It must include:

1. Spec path and chosen depth: Lite, Standard, or Full
2. Problem being solved
3. Requirements and key scenarios
4. Important design decisions and risks
5. Task count, estimated LOC, and recommended PR strategy (single vs. multiple PRs)
6. Recommended first task
7. Open questions or assumptions that still need user confirmation

If a proposal existed, mention whether the generated spec stayed aligned with it or changed based on implementation discovery.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
