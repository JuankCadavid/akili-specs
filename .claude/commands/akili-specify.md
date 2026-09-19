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

### Approval Mode (inherited)

Read `Approval Mode` from the proposal's Document Control (see `/akili-propose`). Under `pre-approved`, each phase's routine approval gate auto-passes and is **logged as `auto-approved (pre-approved mode)`** in the document produced by that phase — the gate is recorded, never silently skipped. Everything classified as an escalation still stops for the user: severe judgment-day findings, a budget that will not fit the depth, a discovery that invalidates the proposal, destructive actions. Judgment-day itself always runs — pre-approval skips *pauses*, not *review*.

### Delegation During an Interactive Phase

When this command delegates work to a subagent (the design agent in Step 2.1, scouts, judgment-day reviewers), two rules apply — both field lessons:

1. **The mode is declared, never implicit.** Every delegation is either **synchronous with its expected duration announced** ("spawning the design agent — typically a few minutes"), or **backgrounded with an explicit return notice** ("running in background; I will report when the draft is ready"). A silent background wait is indistinguishable from a hang, and the user interrupting it is not their mistake — it is the correct reading of what they were shown. If no signal arrives within the announced window, fall back inline and say so.
2. **Runtime failure degrades to inline, never blocks the phase.** If the harness cannot spawn the subagent at all (spawn errors, terminal/pane failures), retry once, then do the work inline and record the fallback in the affected document's Document Control. Specify's delegated roles (designer, scout) are safe to absorb inline — unlike execute's Reviewer, no independence constraint is broken by doing so.

### Step 0: Setup

**Model checkpoint:** This phase runs best on **T1 Architect** for requirements/design **and for the Phase 3 `tasks.md` decomposition** — breaking the design into executable tasks with correct boundaries and dependencies is reasoning, not cheap formatting; a bad decomposition poisons every downstream Implementer (re-check at Phase 3 only to switch to **T6 Multimodal** when visual design is in scope). If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps that tier to a model different from the current session model, check the direction first — the registry is a floor, not a ceiling: if the session model is the stronger one (e.g. a newer generation than a stale entry), pass silently and flag the registry entry for update instead of recommending a downgrade. Only when the registry model is stronger for this tier, tell the user in one line — e.g. *"Phases 1–3 are T1 — the registry recommends `/model opus`; you are on haiku"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode) at the first approval pause. Never block on this; continuing on the current model is always allowed.

**Token Optimization (Prompt Caching):** To maximize prompt caching, always read the constitutional baseline documents FIRST and in the exact same order across all sessions before reading task-specific files.

1. Create directory `docs/specs/$ARGUMENTS/` if it does not exist.
2. Read project-level reference context (IN THIS ORDER):
   - Root `CLAUDE.md`
   - `AGENTS.md`
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - The constitutional templates in `docs/specs/general-setup/` (`requirements.md`, `design.md`, `task.md`, `family.md`)
   - Package-level `CLAUDE.md` files if they exist
3. Read `docs/specs/$ARGUMENTS/proposal.md` if it exists. If it has a **Visual Reference** section, treat the referenced source as approved visual design context and load it:
   - A Figma URL → use the Figma MCP when available.
   - A generated mockup under `docs/specs/$ARGUMENTS/mockup/`, `.stitch/designs`, or a `.stitch/DESIGN.md` reference → read those artifacts (screens, HTML, design tokens); use `stitch-design` to interpret `.stitch` artifacts. Mockups generated with the Claude Design MCP (`claude-design`) are read directly from their exported HTML/screenshots.
   - Any mockup produced during `/akili-propose` counts as visual design context for the `Design Impact` steps below, exactly like a Figma link.
4. Read nearby or dependent specs under `docs/specs/` that overlap with the requested path.
   - **Non-spec carve-outs.** These directories under `docs/specs/` are never a spec and are never read as one: `archive/`, `general-setup/`, `quick/`, `kaizen/`, `audits/`, plus any family container — a folder whose only spec file is `family.md`. `general-setup/` is still read as the template source named earlier in this step — as templates, never as a nearby spec.
   - Also read `docs/specs/kaizen-log.md` if it exists — ONLY the `## Active Lessons` table (skip `## Entries`).
5. **Spec family membership:** if `docs/specs/$ARGUMENTS` is listed as a child row in a parent `family.md` (the spec-family manifest — schema defined once in `akili-constitution.md` Step 7 item 4; do not restate it here), read that manifest and let the child's order, `Depends on`, and `Status` inform this spec. **Warn (never block)** when a `Depends on` child's `Status` is not `done`. Do not create sibling spec folders outside the manifest's closed set.
6. Respect the repository's current package layout and naming conventions instead of assuming a fixed stack.
7. **CodeGraph over full reads:** If `.codegraph/` exists, use `codegraph_search` and `codegraph_context` to inspect relevant code paths instead of reading full source files or using generic `grep`/`glob`. This drastically reduces input tokens.
8. **Delegation Thresholds (scout research):** Beyond the constitutional docs above, apply the *Delegation Thresholds* from `.agents/leader.md` to source-code exploration in every Explore step of this command — if answering a design question requires reading **4+ full source files**, spawn a scout/Explore subagent with fresh context and consume its conclusions instead of reading the files inline. CodeGraph lookups (rule 7) do not count toward the threshold.

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
- If the user agrees, this command carries the **same spec-family manifest contract as `/akili-propose`'s Scope Chunking**: before creating any child folder, write `family.md` in the parent folder (schema defined once in `akili-constitution.md` Step 7 item 4 — reference it, do not restate the table) seeded with the agreed order, `Depends on`, `Parallel-safe`, and `Status: pending` for every chunk. The manifest's child set is **closed** — never create a folder without a prior manifest row; a late addition first proposes a manifest edit and gets HITL approval before its folder exists. Then draft a `proposal.md` or jump straight to the split documents (`requirements.md`, `design.md`, `tasks.md`) for each chunk.

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
- **numbers from images are not sources** — a figure transcribed from a screenshot or a pasted table is proposal context; before it enters a requirement, scenario, or design cell, open the page (or run the command) it came from, confirm the column and unit, and pin it — the unit error the screenshot hides is the one no downstream grep can see
- **claims about current behavior cite or mark** — a statement in *System Context & Scope* about how the system behaves today carries its evidence inline: a citation as run, or the marker `UNVERIFIED — confirm at source before relying on it` when nothing here settles it. `requirements.md` holds no table of these claims — at Phase 2 the ones that pass the dependence test become rows of the **Premise Ledger**, whose citation rules, classes, and row shape are defined once in the Step 2.2 *Premise Ledger* block
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
| *Compiler-only defect* | Gate: the project's build/type-check command — needed when the compiler is stricter than the test runner; no substitute needed, it is automated |
| *Layout/geometry defect* | Gate: a rendered measurement in a real browser or component-test harness per Step 3.2's rendered-measurement checklist; when unavailable, the existing substitute — a human check at the HITL pause or a T6 visual review |

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

**Verify premises while the code is open.** A claim the design will take as given about the existing system is cheapest to check now, in the pass that already has the file open — checking it at Step 2.2, after the decision resting on it is drafted, tests a premise against a design that already reads as its own justification. Record each check as a citation as run and carry it into the **Premise Ledger** the design writes (Step 2.2 — *Premise Ledger* block, which defines what a citation must contain). When exploration is delegated, the scout returns its findings as citations as run, never as a summary the architect would have to re-derive. In **Bug Mode** the proposal's **Blast Radius** results are those citations; when the proposal carries no Blast Radius section, run its four checks — already fixed · live path · siblings · consumers, defined in `/akili-propose` — here, during exploration.

If the feature is architecturally significant (a new module or service, a new integration or data flow, a persistence or communication-topology change, or any stated NFR impact), load `software-architect` and apply its Decision Spine: NFR scenarios with measurable responses, tactics, robust-vs-lite sizing, pattern selection bound to named problems, and ADR-style design decisions. When a design decision overturns an existing TRD ADR, record it as **superseding** (name the old `ADR-NNN`; the archive sync writes the new entry and flips the old one to `superseded`) — never rewrite an accepted ADR in place.

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
- `ai-agent-development`

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
11. Premise Ledger

Guidelines:

- extend existing architecture rather than replacing it
- use current repo paths and package names
- include UI/UX decisions when the feature affects screens, flows, or components
- **Design Impact:** IF the proposal includes any visual design context (Figma, an agent-generated mockup, or a `.stitch/DESIGN.md` reference), break down the visual design into a clear Frontend Component Architecture (e.g., atomic components) and define the necessary Design Tokens (colors, typography). When the source is a generated mockup, derive the tokens from its artifacts (HTML/screens or `.stitch/DESIGN.md`).
- tie design sections back to requirements explicitly
- record meaningful trade-offs and rejected alternatives for non-trivial decisions
- call out data, API, security, error-handling, observability, and rollback concerns when relevant
- keep design decisions practical enough that an implementer can act without re-discovery
- **New enumerated values walk their consumers.** When the design adds a value to an existing enumerated type (a status, a kind, a mode, a branch context), the surface table lists every existing step that consumes that type and states what the new value does there — a step written for the old value set is read literally against the new one, and naming only the steps you *add* is the KZ-004 fall-through class applied to a design instead of a scan (three of four Reviewer FAILs in `changes/kaizen-loop-closure`).
- **Premise Ledger.** A **premise** is a statement the design makes about the **existing** system — code, data, environment, contract, or standing rule — that the design takes as given rather than creates. `design.md` carries a **Premise Ledger** section holding one row per premise the design depends on. This block is the single definition of its row shape, classes, triggers, and citation rules; every other surface cites it by name and restates none of it.

  - **Admission — the dependence test.** A claim earns a row only when *if this claim were false, a design decision, a task, or the scope would change*. Yes → row; no → no row. A true statement about the repository whose falsity changes no decision, task, or scope item is trivia and stays out.
  - **Written first.** The Premise Ledger is written **before** the design decisions that build on it. That is an order of work, not a position in the document: a premise discovered while a decision is being written is admitted before that decision is finished, because a decision already written reads as its own justification (a design that named a sibling form as the target "with matching fields" never wrote the row that would have tested which component the URL actually mounts — `changes--kp-report-modal-auto-create`).
  - **Row shape — seven columns.**

    | Column | Content | Absent-value |
    |---|---|---|
    | `#` | `P-n`, stable within the spec | — |
    | Claim | One sentence about the existing system, stated so it can be false | — |
    | Class | One value from the closed set below | — |
    | Citation (as run) | Per the citation rules below | `UNVERIFIED — confirm at source before relying on it` |
    | Verified at | Short commit SHA the citation was run against | `—` when `UNVERIFIED` |
    | If false | The design decision, task, or scope item that changes, with Impact `High` or `Low` | — |
    | Settled by | For `UNVERIFIED` rows: the settling check and its owner | `—` when verified |

    `#`, Claim, Class, and *If false* have no absent value — every row fills them. Impact is `High` when a false premise overturns a design decision, discards a task, or makes the spec unnecessary, and `Low` when a task adjusts and the approach stands.
  - **Two fixed lines open the section:** the **count line** — verified, `UNVERIFIED`, and the `UNVERIFIED` split by Impact — and the **trigger line**, naming which blast-radius triggers fired, or reading `Blast-radius triggers: none apply — <reason>` when none did.
  - **Stated-empty.** A design that names no existing code, data, contract, or rule replaces the table with one line: `Premise Ledger: none — <reason>`. An absent section is never a valid empty state (KZ-004).
  - **Classes — a closed set of seven.**

    | Class | The claim says | Row required when |
    |---|---|---|
    | `location` | Where a behavior lives, or who owns it | the dependence test admits it |
    | `existence` | Something exists, does not exist, or is already fixed | the dependence test admits it |
    | `data-env` | A fact about data, vocabulary, configuration, or an environment | the dependence test admits it |
    | `other` | Any other premise, including a standing project rule the design relies on or must obey | the dependence test admits it |
    | `live-path` | The code the design changes is what the named user action actually reaches | its trigger below fires |
    | `shared-state` | Which siblings share the state or lifecycle the design changes, and what each does with it | its trigger below fires |
    | `consumer` | Who reads the contract the design changes | its trigger below fires |

    `other` is the stated fall-through: a premise the six named classes do not fit is still a row, classed `other` — the set is closed without being brittle (KZ-004). "Secondary source" is not a class; it is what citation rule (d) forbids.
  - **Blast-radius triggers.** The last three classes are required only when their trigger fires. A triggered class with no row is a defect; an untriggered class with no row is correct, and the trigger line is what makes the two distinguishable.

    | Trigger — the design… | Required row | The row must contain |
    |---|---|---|
    | names a user action, or a branch point (a portfolio, an API version, a flag) | `live-path` | the dispatch chain from the entry point to the changed code, naming each branch point and the branch taken; the changed code's own `file:line` proves the code exists, not that the user reaches it (`bugfix--evidence-storage-link-validation` KZ-EVL-1) |
    | changes state, a service, a base class, or a lifecycle hook that more than one component uses, or a condition or signal more than one block or component reads | `shared-state` | every sibling, each with its mechanism at `file:line` — a sibling is any reader of that state, condition, or signal, a conditional block in the same template included; all of them, never a sample, and a count without the list is not a row (`changes--realtime-section-completion`) |
    | changes an exported symbol, a selector or DOM hook, an emitted event, a response shape, or a stored field | `consumer` | every reader found by a search over the whole repository, with the command, pattern, and scope as run — end-to-end suites and suites CI skips included, never a list derived from the files sitting beside the changed component (`changes--sidebar-toggle-consolidation` KZ-STC-1) |

    When no trigger fires, write the line in full: `Blast-radius triggers: none apply — <reason>`.
  - **Citation rules.** Each rule ships with the reading that falsifies a row claiming to meet it.
    - **(a) As run.** A citation is a `file:line`, or a command with its pattern, its scope, and the hit or count it returned, and it reproduces from the repository root at the row's *Verified at* commit. **Falsifier:** a citation a reader cannot re-run because its scope or its pattern is unstated.
    - **(b) Negative existence.** A "no X exists" claim — no coverage, no consumer, no prior fix, no writer — quotes the command, pattern, and scope **verbatim as run** and includes the concept's known alternate names, because a "verified absent" claim is only as true as its search pattern. **Falsifier:** the row records a pattern other than the one executed (`changes--clear-filters` KZ-changes--clear-filters-1).
    - **(c) Parity.** A "same as the sibling" claim names the sibling's mechanism at `file:line`. **Falsifier:** a parity row whose evidence is a component name, a comment, or a resemblance between two field lists.
    - **(d) Primary source.** A citation points at the code that writes or reads the thing, the definition of the contract, or the route or dispatch table. A UI label, a comment, a component name, a document, another spec's summary, and a person's recollection are **secondary**. A fact stated by a person, **including the user**, is recorded `UNVERIFIED` with `user-stated` in *Settled by* until a primary source confirms it. **Falsifier:** a response field cited to the label the UI paints (`changes--result-indicator-back-link`), a reachability fact written as verified on the strength of the statement that produced it (`bugfix--emerging-result-contributor-catalog`), or a schema cited as proof that the data is written (`changes--my-work-board`).
    - **(e) Run before written.** A citation stating a present-tense reading is executed **before** it is written, never reconstructed afterwards (KZ-changes--leader-brief-contract-2). **Falsifier:** a count in a row that no command run in the session produced.
  - **`UNVERIFIED` is a visible state, never a blank and never an omitted row.** A premise the architect cannot verify keeps its row and carries the row shape's `UNVERIFIED` marker in its citation cell — byte for byte the string `/akili-execute` Step 2.2 clause (c) gives the brief contract, so one grep finds every open fact in a spec folder. A premise about an environment no command in the repository can reach is still a row (`changes--cognito-email-otp-login`). *Settled by* names the **settling check** — the first check able to confirm or refute the claim — and **one owner**: a task ID, `judgment-day`, the HITL pause, or a named person. "To be confirmed" with no owner is not a row.
  - **Hand-off — what leaves the Premise Ledger.** Three cases reach `tasks.md` through fields that already exist; no new task field is added.
    - A `consumer` row is copied into the owning task's existing `Consumers` field, beside the test files Step 3.2's **Consumer Sweep** rule finds. One owner per sweep: that rule owns the test-file sweep, the Premise Ledger owns the design-time readers (other apps, reports, siblings), and the field holds the union.
    - An `UNVERIFIED` row is settled by its owning task **as that task's first step**, before anything is built on it, and the task's Done criteria record the outcome.
    - A premise a check **refutes** goes to the Pivot Protocol (`/akili-execute` — *Error Handling & Pivot Protocol*), never into a quiet edit of the approved design.
    - **All other classes have no hand-off** — they act through their *If false* cell, which is why that cell names a decision, a task, or a scope item rather than a consequence in the abstract.
  - **Every depth, no minimum.** Lite, Standard, and Full carry the same row shape and the same two opening lines. There is no minimum row count — a design writes the rows its dependence test admits and no others.
  - **Bug Mode source of rows.** The proposal's **Blast Radius** results become rows, each cited with the commit it was verified at. When the proposal carries no Blast Radius section — an older proposal, or a bug specified without a proposal — the architect runs those same four checks (already fixed · live path · siblings · consumers, defined in `/akili-propose`) during Step 2.1 and writes the results as rows here.
- **Code Suppression:** DO NOT generate code snippets or implementation examples in `design.md`. Design decisions must remain conceptual to conserve output tokens. The actual code will be written during execution.

#### Step 2.3 — Challenge Reversions

**Every design decision that reverts behavior already delivered gets one cheap challenge before it reaches `tasks.md`.** The Implementer has an auditor; the Reviewer audits its diff on a different model. **The Leader's own design decisions have none** — they go from judgment straight to implementation, and a wrong one is not caught by a FAIL, it is *implemented correctly* and discovered two rework rounds later.

Trigger: a DD that removes, disables, or inverts something the codebase already ships — a blend mode, a fallback, a guard, a cache, a retry, a defaulted prop. Adding is not a reversion; taking away is.

The challenge is deliberately small — **one reviewer, one question: "what does removing this break?"** Not a `judgment-day` panel (that stays the **Review Design** option of Step 2.5 — *Present & Approve* for the design as a whole), not a fan-out. The Delegation Ceiling applies: this is a two-minute pass bought to avoid two rework rounds, and it stops being worth it the moment it grows.

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

Present a clear summary of the generated design on the screen (including the architecture, data models, API endpoints, and main design decisions) so the user can review what was done before deciding. Include the **budget** from Step 2.4 and the outcome of any **reversion challenge** from Step 2.3 — both are decisions the user is entitled to overrule. Print the **Premise Ledger**'s count line as written, and every `UNVERIFIED` row in full — claim, Impact, and the *Settled by* owner — since a row that stays inside the document is a row the user cannot correct. When any open row carries `High` Impact, recommend **Review Design** and name the rows that drove the recommendation; the recommendation does not gate the menu, and **Continue** stays available because the user may hold knowledge the repository does not. Under `pre-approved` this adds no stop — judgment-day always runs in that mode, so the Premise Ledger is attacked either way.

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
- verification fields — Falsifier, Red run, Disqualifier, Consumers (see the Falsifiability block below; absent values are written as n/a or none, never left blank)
- done criteria
- relevant skills

Skill inventory should use real, available skills only. Derive each task's required skills from the project's `## Skill Map` (root `AGENTS.md`/`CLAUDE.md`) plus the conditional skills that match the task (`ui-ux-pro-max`/`frontend-design` for UI, `gsap-animation` for animation).

Task quality rules:

- one task should be small enough to complete and verify in one focused session
- every task must reference the requirements it satisfies
- **coverage closes at scenario and clause granularity, not requirement ID.** A requirement "appearing in a task" is the weakest possible claim: every scenario and every `BUT` / `AND IT MUST` clause of every requirement must be owned by a named task, and the decomposition is not complete until that mapping closes. The failure an ID-keyed table invites is specific: a spec shipped three scenario-level orphans that its requirement-ID traceability table read as covered — and twice, an apparent gap was "cleared" by citing a *different* requirement that was satisfied. **A gap may never be discharged by citing a different requirement**; a clearance must quote the exact clause it claims to cover
- every task must include a concrete verification command or manual check
- **every task must state what *disqualifies* the evidence, not only what satisfies it.** A gate that defines only when to pass **invites passing**: given a criterion for success and none for doubt, an agent that produces *a* number will read it as *the* number. Write the no-pass clause next to the pass clause — *"if the three runs vary by more than the effect you are measuring, the number is not evidence; report the spread instead of committing."* This matters most for **measured** signals (performance, timing, layout metrics, flake-prone suites), where a value can be produced without meaning anything, and it is a different blindness from the defect-class mapping above: that one asks whether the gate can *see* the defect, this one asks whether the gate knows when its own reading is **worthless**. An inconclusive verification is a legitimate outcome and must be reportable as one — never collapsed into a pass because the command exited `0`
- **name the input that would make the check fail.** The disqualifier above asks whether a *produced reading* is worthless; this asks the prior question — **could any input make this check report failure at all?** A check chosen from the same frame as the claim cannot falsify it, and reports green forever: a path claim evidenced only in the repo where that path exists by construction; a byte-comparison that normalizes both sides before comparing; an authority cited for a fact it does not contain; a budget reported in the one unit under which it cannot be exceeded. Each passed its own gate and failed the world. So next to each verification, write the concrete input that would produce a FAIL — **if you cannot name one, the check is not evidence, however green it reports**, and the task needs a different check or an explicit gap. Name also the **environment path that could make it pass for the wrong reason** — a global install shadowing the artifact under test, a warm cache, a binary already on PATH — and have the task mask it; a local green that a cold runner cannot reproduce was never evidence

  **Falsifiability** — this rule is necessary and not sufficient: the field shows five ways a named falsifier still certifies a defect, plus the case of gates that measure rendered output:

  1. **Expressible falsifier** — the task names the mutation *and* the fixture row(s) or stub behavior on which correct and mutated readings diverge; a fixture on which the named mutation leaves the reading unchanged is no gate (the `tdd` skill's *inert fixture*; a counting gate whose fixture held one "Other" element let the naive and the cascade count coincide — `changes--toc-center-guard` KZ-2; an attribute selector that silently stopped matching once the fix turned the attribute into a binding read the same on the buggy and the fixed code — `bugfix--other-fields-toc-visibility` KZ-OTV-2). The Done criteria require the falsifier **executed against the post-change code**: revert the change or apply the named mutation and observe the gate go red — a gate that stays green under its own falsifier asserts nothing. A `Falsifier`, a verification count, or an expected outcome that states a **present-tense reading** ("the pre-change file: grep = 1", "1 hit", "→ rung 2") is **run or walked before it is written** — the count names its baseline (pre-existing hits enumerated), and an expected outcome is derived from the text the task will ship, never from the intent behind it.
  2. **Assertion-level red run** — the Done criteria require the test observed failing *on the behavioral assertion*; a red from setup, an unmatched intercept, a timeout, or a synchronous mock that never reaches the timing under test is not a red. When the defect is a timing race, the task requires deferred timing in the test (deferred observables, or the harness's equivalent) so the race is actually exercised — a green under synchronous mocks is not evidence for this class (`bugfix--confirm-submission-title-and-disclaimer` — the pre-fix code never issued the intercepted request, so the red was a timeout, not the assertion; `bugfix--phase-filter-missing-phases-prod` — synchronous mocks resolved during first change detection and hid the race).
  3. **Real-artifact lock** — a presence or opt-in claim is bound to the shipped artifact: a static read of the real file or a rendered measurement of the real element, never a fragment authored in the test (the `tdd` skill's *plumbing test*) or a class or attribute list; visibility near a clipping ancestor is a bounding-rect comparison against that ancestor, because a visibility heuristic checks paintability, not containment (deleting `[scrollHost]` from the real template left 210 fragment tests green — `changes--sp-shell-app-viewport` KZ-3; a 76 %-clipped popover passed `be.visible` — `bugfix--reporting-table-actions-clipped` KZ-RTA-2).
  4. **Compile gate** — when the project's build or type-check is stricter than its test runner, any task that assigns into a typed contract includes the build/type-check command in its Verification, with the falsifier "assign a value of the wrong shape → build red, tests still green" (169/169 green under a runner that erases type-only imports, five Reviewer PASSes, code never compiled — `bugfix--lead-center-full-catalog` KZ-1).
  5. **Consumer Sweep** — when a task extends or changes a shared exported symbol, a DOM hook or selector, or an emitted event, run one grep per changed symbol over the project's test files — unit, component, and E2E, including suites CI skips or a token gates — and list every file that pins it in the task's `Consumers` field; those files are part of the Verification, and "no automated coverage exists" is never asserted without that grep in hand (a sibling suite pinned an exported map's exact key list — `result-framework-reporting--programme-results-created-by-filter` KZ-1; a token-gated E2E suite broke silently — `changes--sidebar-toggle-consolidation` KZ-STC-1).
  6. **Rendered-measurement checklist** — *only when a gate asserts size, overflow, visibility, position, or containment of a rendered element*: measure the **baseline** of the pre-existing element before any zero-overflow assertion (a container that is a swipe strip by design already overflows); assert the production **fonts** — text and icon faces — are loaded in the harness, or self-host them; read **geometry** (bounding rects, scroll metrics, computed style), never class presence; use at least **two viewports** that differ on the dimension the gate depends on — a second width including the squeeze band where columns starve, or a second, shorter height that forces the intended scrolling ancestor; state viewport ACs in **effective CSS px** with the host zoom named; check **clip containment** where a scroll boundary is near (`bilateral--ai-processing-feedback` L1 — a zero-overflow gate on a swipe strip cost a Pivot; `changes--aow-identity-column-starvation` KZ-2 — a missing icon font produced a false red).
- **a presence-assertion is not a behavioral proof.** A check that an artifact exists — a CSS class in the markup, a config key, an attribute, a `MUST` clause in a document — proves presence, not effect. A green test has certified a truncation clamp whose classes were all present and whose effect was a no-op, and five `MUST` clauses have sat in a document describing a procedure that could not be executed. When a task's verification is a presence-assertion, the task must record **what that assertion cannot prove** and name the check that proves the behavior itself (a rendered measurement, an executed procedure). And **a property the harness structurally cannot evaluate is not covered**: jsdom cannot measure layout or contrast, and a checker that returns "incomplete" without failing has evaluated nothing — record such properties as explicit gaps or route them to a harness that can (a visual check at a HITL pause, a T6 review, a real browser run). The real-artifact-lock rule in the Falsifiability block names the check that proves the behavior.
- **a walkthrough over the cases its rules cite is an inert fixture.** When a task's gate is a walkthrough or retro-fit of example cases against shipped prose, the task names at least one **held-out** case the text does not cite, and every case is judged against the general sentence with its parenthetical example stripped — a case the reader can find by its citation proves the citation, not the rule.
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

## Correction Closure (every Adjust round)

A correction is not applied when the cited site is fixed — it is applied when the superseded value is gone from everywhere it lived. Amendments guided only by a finding's list of sites fail in **both directions**: *forward* (the old value survives at sites the finding did not cite) and *backward* (fixing one document falsifies what other documents asserted by citing it — a class of defect that has cost extra review rounds in the field). On every Adjust round that changes a value, name, count, or behavior claim:

1. **Sweep forward:** grep the superseded value across the whole spec folder and the baseline docs it cites. The correction closes only when every hit is updated or recorded as intentionally kept. The forward sweep greps the superseded concept's paraphrase terms as well as its literal strings — a paraphrase that survives the literal grep is the KZ-006 blindness in sweep form.
2. **Sweep backward:** grep for references *to* the corrected section and re-read what each referrer asserts — a document that cited the old text may now state a falsehood.

This is the same sweep `/akili-archive` mandates for root guides (its factual-claims sweep exists because per-item syncs only fire where a finding points — which is exactly how a stale claim survives). A spec Adjust round earns it for the same reason.

## Verification Checklist

After all three documents are approved, verify:

- [ ] All 3 files exist with non-empty content
- [ ] All documents follow `docs/specs/general-setup/` conventions
- [ ] The chosen depth is appropriate for the risk and size of the work — and was **re-checked against the finished design** (Step 2.4), not left as the Phase 0 guess
- [ ] `design.md` records a **budget** (expected tasks, LOC, review rounds) that `/akili-execute` can trip against
- [ ] Every DD that **reverts already-delivered behavior** carries the outcome of its Step 2.3 challenge
- [ ] `design.md` carries a **Premise Ledger** — the table, or the stated-empty line with its reason; an absent section is not an empty one
- [ ] Every Premise Ledger row carries a citation as run, or the `UNVERIFIED` marker with a named owner in *Settled by*
- [ ] Every blast-radius trigger the design fires has its row, and a design that fires none carries the `Blast-radius triggers: none apply — <reason>` line
- [ ] Every `UNVERIFIED` row is owned by a named task or check — and every `consumer` row also appears in its owning task's `Consumers` field
- [ ] `requirements.md` names the **defect classes this spec can produce** and maps each to the command that catches it — with any class lacking an automated check either substituted (human check at a HITL pause, or a T6 visual review) or recorded as an accepted risk
- [ ] Requirements describe observable behavior, not implementation details
- [ ] Key requirements include Given/When/Then scenarios with strict `BUT` and `AND IT MUST` rules where applicable
- [ ] Every requirement appears in at least one task — **and every scenario and `BUT` / `AND IT MUST` clause within it is owned by a named task** (ID-level presence is not closure; see the coverage rule in Step 3.2)
- [ ] Every task references requirements and design sections
- [ ] Every task has clear done criteria and verification guidance that accounts for the negative scenarios
- [ ] The task dependency graph has no circular dependencies
- [ ] For a bug (Bug Mode): the root cause is reflected in the requirements and at least one task adds a regression test (red before, green after)
- [ ] The spec path matches the repo's chosen taxonomy under `docs/specs/`
- [ ] Only real, available skills are referenced in tasks
- [ ] Every task carries the four verification fields — Falsifier, Red run, Disqualifier, Consumers — with n/a or none written for the ones that do not apply, never blank
- [ ] Every gate that asserts size, overflow, visibility, position, or containment satisfies the rendered-measurement checklist in Step 3.2

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

**Context checkpoint:** the spec documents are now the durable context — `/akili-execute` reloads everything it needs from files, not from this conversation. If this session ran long (heavy exploration, judgment-day rounds, mockups), recommend starting execution in a fresh session: `/clear` in Claude Code, then `/akili-execute <spec-path>` — the handoff costs nothing because nothing execution needs lives only in chat. You can only recommend, not run it; recommend it here, at the boundary, not mid-loop.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
