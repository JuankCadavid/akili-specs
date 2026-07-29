---
name: akili-propose
description: Propose new features or changes by initiating a new detailed technical spec process.
license: MIT
metadata:
  author: Juan Carlos Cadavid (jcadavid.com)
---

# Propose AKILI-SPECS Change

Create a lightweight proposal for one bounded change before generating full AKILI-SPECS documents.

The proposal is the reviewable intent layer. It should help the user decide whether the change is worth specifying before time is spent on requirements, design, tasks, or implementation.

> **Recommended model tier:** T1 Architect (deep reasoning, architecture, trade-offs). Ensure you are using the strongest reasoning model available for this phase.

## Usage

```
/akili-propose <slug-or-path> [free-text context]
```

**Examples:**

- `/akili-propose add-remember-me`
- `/akili-propose bugfix/login-redirect`
- `/akili-propose enhancements/renewals`
- `/akili-propose ui-aesthetic-refresh quiero renovar la estética de todos los componentes con un look premium…`

## Arguments

- `$ARGUMENTS` - A change name or a relative path under `docs/specs/`, optionally followed by free-text context.

Path resolution:

- If the first token contains `/`, treat it as the literal spec path.
- If the first token is a bare kebab-case name, use `changes/<name>` as the spec path.
- **If `$ARGUMENTS` does not look like a slug or path at all** — it reads as a sentence or a paragraph of intent — **never interpolate it into the spec path.** Derive a kebab-case slug of at most 4 words from the core intent, resolve the path from that, and record the derivation in Document Control (`Slug: ui-aesthetic-refresh — derived from free-text argument`). The full text becomes proposal context, not a directory name. A rendered path like `changes/<60-word-paragraph>` is always a parsing failure, never something to present to the user.

Examples:

| Input | Spec Path | Proposal Path |
|---|---|---|
| `add-remember-me` | `changes/add-remember-me` | `docs/specs/changes/add-remember-me/proposal.md` |
| `bugfix/login-redirect` | `bugfix/login-redirect` | `docs/specs/bugfix/login-redirect/proposal.md` |

## Output

Create or update:

```text
docs/specs/$SPEC_PATH/proposal.md
```

Do not create `requirements.md`, `design.md`, or `tasks.md` in this command unless the user explicitly asks. Those belong to `/akili-specify`.

## Behavior

### Step 0: Resolve Path And Load Context

**Model checkpoint:** This phase runs best on **T1 Architect** (deep reasoning). If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps that tier to a model different from the current session model, check the direction first — the registry is a floor, not a ceiling: if the session model is the stronger one (e.g. a newer generation than a stale entry), pass silently and flag the registry entry for update instead of recommending a downgrade. Only when the registry model is stronger for this tier, tell the user in one line — e.g. *"This phase is T1 — the registry recommends `/model opus`; you are on sonnet"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode) at the first approval pause. Never block on this; continuing on the current model is always allowed.

**Token Optimization (Prompt Caching):** To maximize prompt caching, always read the constitutional baseline documents FIRST and in the exact same order across all sessions before reading task-specific files.

1. Resolve `$SPEC_PATH` using the path rules above.
2. Create `docs/specs/$SPEC_PATH/` if it does not exist.
3. Read project-level context when available (IN THIS ORDER):
   - root `CLAUDE.md`
   - `AGENTS.md`
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - `docs/specs/general-setup/`
   - package-level `CLAUDE.md` files
4. Read nearby or related specs under `docs/specs/`.
   - Also read `docs/specs/kaizen-log.md` if it exists — ONLY the `## Active Lessons` table (skip `## Entries`).
5. **CodeGraph over full reads:** If `.codegraph/` exists, use `codegraph_search` and `codegraph_context` to inspect relevant code paths instead of reading full source files or using generic `grep`/`glob`. This drastically reduces input tokens.

### Step 1: Classify Request Type & Route

`/akili-propose` is the single entry point for change work. Before clarifying details, **classify the request** so it takes the right track. Infer the type from the user's wording; if it is ambiguous, ask **one** short question: *"Is this a bug to fix, a new feature/change, or a trivial cosmetic tweak?"*

| Type | Signals | Route |
|---|---|---|
| **Trivial** | Cosmetic/copy-only, one-line, a color/text/label tweak using existing tokens | Recommend `/akili-quick <name>` instead of a full proposal. Stop here unless the user still wants a proposal. |
| **Feature / Change** | An intent ("I want X", "add/support/enable Y") | Continue with the standard proposal flow below. |
| **Bug** | A symptom ("X is broken/failing/wrong", "regression", "error", "used to work") | Continue with the proposal flow, but follow the **Bug Track** (diagnosis-first) described below. |

The proposal `frontmatter`/header should record the detected type as `Type: Bug | Change | Trivial` in Document Control so `/akili-specify` and `/akili-execute` inherit it. For bugs, prefer the `bugfix/<name>` spec path taxonomy.

**Approval Mode (recorded in the same Document Control block, inherited downstream):**

- `Approval Mode: gated` (default) — every phase gate pauses for the user, as today.
- `Approval Mode: pre-approved (<who>, <date>)` — **only on an explicit up-front user mandate** ("run the whole cycle", "work it end to end without pauses"). Downstream commands honor it: routine continue/approve gates auto-pass and are **logged as `auto-approved (pre-approved mode)`** at the point where the pause would have happened — the decision stays auditable instead of the agent silently improvising past each gate.
- **Pre-approval covers routine progress, never exceptions.** HALT, Pivot Protocol, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG`, destructive or irreversible actions, and `/akili-quick` escalations **always stop for the user regardless of mode** — those gates exist precisely for the cases no one can pre-approve, because their content is unknown until they fire.

**Bug Track (diagnosis before fix):** A bug is not a feature — you start from a symptom, not an intent, so you must understand *why* before proposing *how*. For a bug:

- Load the `systematic-debugging` skill.
- Capture the **observed symptom**, concrete **reproduction steps**, and the **confirmed root cause** (not a guess) before recommending any fix.
- Assess **impact/scope** (what else the root cause touches).
- Recommend a **fix strategy** and route it by size: a genuinely cosmetic one-liner → `/akili-quick`; anything with logic, data, or a behavior change → `/akili-specify` (Lite) in Bug Mode, which requires a regression test.
- These go in the proposal's **Bug Diagnosis** section (Step 2), which replaces the Requirement Delta Preview for bugs.

### Step 1.1: Clarify Intent, Sources & Scope Chunking

**Greenfield track (fresh constitution, no application code):** when the repo has a just-scaffolded baseline (`docs/prd.md` exists, meaningful application code does not), **the PRD is the approved intent — do not ask the user to restate the seed, and do not write a proposal that duplicates the PRD.** Re-proposing the seed is the classic day-1 confusion: the intent already went through the constitution's own review gate. The proposal's job here shifts to **decomposition**: read the PRD's v1/MVP scope, chunk it into bounded changes with the Scope Chunking mechanics below (RICE/MoSCoW build order, one folder + `proposal.md` per chunk), and have each proposal **reference PRD sections instead of restating them** — its Intent/Problem sections point at `docs/prd.md#...`; its own content is the *slice boundary*: what this chunk delivers, what it explicitly leaves to later chunks, and what it depends on. If the whole v1 is genuinely one bounded piece, say so and recommend skipping straight to `/akili-specify`.

For **Feature / Change** and **Bug** requests, clarify the details. Ask the user about the source of the requirements and any visual designs:

1. **Requirement Source:** Ask if they have a **Jira ticket** (if they do, suggest using the **Jira MCP** to automatically extract the description, acceptance criteria, and comments created by the BA) or if they prefer to paste/write the context directly.
2. **Visual Designs / Mockups:** Ask if there is a **Figma link** or any visual mockup available. If they provide a Figma URL, suggest using the **Figma MCP** to extract the design details, components, and layout information.

#### Mockup Fallback (No Visual Input)

If the change has any UI surface AND the user provides **no** Figma link, image, or existing design, offer to generate a mockup directly in the agent before specifying. This is **opt-in and recommended** — never mandatory. The user can always decline and continue without a visual.

- Recommend generating the mockup with the `stitch-design` skill (Stitch MCP), which produces high-fidelity HTML + screenshots and can synthesize a `.stitch/DESIGN.md` source of truth.
- If the user accepts, load `stitch-design` and generate the mockup for the primary screens/flows in scope. Persist the artifacts under the spec so `/akili-specify` can consume them:
  - Save the generated screens under `docs/specs/$SPEC_PATH/mockup/` (or reference the `.stitch/designs` location if the skill writes there).
  - Record the exact paths and any `.stitch/DESIGN.md` reference in the proposal's **Visual Reference** section (see Step 2).
- If the user declines, note "no visual reference" in the proposal and continue. Do not block the proposal on a mockup.
- If Stitch MCP is unavailable, still offer to sketch a lightweight self-contained HTML mockup saved under `docs/specs/$SPEC_PATH/mockup/` so intent stays reviewable.

A generated mockup counts as **visual design context** for `/akili-specify`, exactly like a Figma link would.

Use `brainstorming` and, when helpful, `product-manager-toolkit` to clarify:

- problem being solved
- target users, actors, or systems
- current behavior
- desired behavior
- scope boundaries
- non-goals
- dependencies and constraints
- success criteria

**Scope Chunking:** If the user provides a very large or multi-faceted instruction (e.g., an entire epic or multiple distinct features), analyze whether the request should be split into multiple bounded proposals.
- If it should be split, propose breaking it down to the user.
- When recommending the build order of the resulting chunks, score them with RICE or MoSCoW from the `product-manager-toolkit` skill (AKILI-SPECS Integration section) instead of guessing.
- **Record inter-chunk dependencies explicitly in each proposal** (`Depends on: <spec-path> | none`), and mark chunks with no shared modules, migrations, or API contracts as **`Parallel-safe: yes`**. This single field is what later enables the fleet pattern (`docs/flow.md` → *Multi-Spec Parallel Execution*) to run independent specs concurrently in separate worktrees — independence is decided here, where the decomposition judgment is fresh, not re-derived at dispatch time.
- Upon agreement, create the respective folders for each bounded change under `docs/specs/` and generate a `proposal.md` for each.

Ask focused questions only when the proposal would otherwise depend on unstable assumptions.

### Step 2: Write `proposal.md`

Create a concise proposal following `cognitive-doc-design` (lead with the answer, progressive disclosure, tables over prose) with this structure:

1. Document Control (include `Type: Bug | Change | Trivial`)
2. Intent
3. Problem / Current Behavior
4. Proposed Outcome
5. Scope
6. Non-Goals
7. Affected Users, Systems, And Specs
8. Visual Reference
9. **Bug Diagnosis** (Bug track) *or* **Requirement Delta Preview** (Change track)
10. Approach Options
11. Recommended Approach
12. Risks, Dependencies, And Open Questions
13. Success Criteria
14. Next Step

If an Active Lesson from `docs/specs/kaizen-log.md` applies to this change's domain, reflect it in Scope or Risks and cite its ID (e.g. `KZ-003`).

### Visual Reference

Capture whatever visual source backs this change so `/akili-specify` can convert it into requirements, design, and tasks. Use the state that applies:

```markdown
## Visual Reference

- Source: [Figma | Generated mockup (stitch-design) | Self-contained HTML mockup | None]
- Location: <e.g. Figma URL, docs/specs/<spec-path>/mockup/, .stitch/designs, or .stitch/DESIGN.md>
- Notes: screens/flows covered, or why no visual is needed (e.g. backend-only change).
```

When a mockup was generated during Step 1, list the concrete artifact paths here so downstream commands treat it as approved visual design context.

### Bug Diagnosis (Bug track only)

For a **Bug** request, replace the Requirement Delta Preview with a diagnosis produced using the `systematic-debugging` skill. Do not propose a fix until the root cause is confirmed — a fix built on a guessed cause is the top source of non-fixes and regressions.

```markdown
## Bug Diagnosis

### Observed Symptom
- What is broken, from the user's perspective (error, wrong output, crash, regression).

### Reproduction Steps
- Deterministic steps to reproduce (environment, inputs, expected vs actual).

### Root Cause (confirmed)
- The actual underlying cause, confirmed by investigation — not a hypothesis. Cite the code path / commit / condition responsible.

### Impact & Scope
- What else the same root cause affects; blast radius; data integrity or security implications.

### Fix Strategy
- The smallest safe correction, and the route: `/akili-quick` only if the fix is genuinely cosmetic with no logic; otherwise `/akili-specify` (Lite) in Bug Mode, which requires a regression test (red before the fix, green after).
```

If the root cause cannot be confirmed yet, say so explicitly and keep the proposal open for further investigation rather than proposing a speculative fix.

### Requirement Delta Preview (Change track only)

When a **Feature / Change** affects existing behavior, include a lightweight preview using these sections where relevant:

```markdown
## Requirement Delta Preview

### ADDED Requirements

- New behavior that does not exist today.

### MODIFIED Requirements

- Existing behavior that will change.

### REMOVED Requirements

- Existing behavior that will be deprecated or deleted.
```

This preview is not the final spec. `/akili-specify` converts approved intent into full requirements, scenarios, design, and tasks.

### Approach Options

For non-trivial work, include 2 or 3 options with trade-offs. Recommend one option and explain why it is the smallest safe path.

### Next Step

End the proposal with the exact next command, matched to the detected type:

```text
/akili-specify $SPEC_PATH
```

- **Change track:** `/akili-specify $SPEC_PATH` (standard depth for the work).
- **Bug track:** `/akili-specify $SPEC_PATH` in **Bug Mode** — specify converts the confirmed root cause into a fix plan and a mandatory regression test. If the diagnosis showed the fix is genuinely cosmetic with no logic, recommend `/akili-quick <name>` instead.
- **Trivial track:** the request should not have reached a full proposal — recommend `/akili-quick <name>`.

## Review Checklist

Before presenting the proposal, verify:

- [ ] The problem is clear.
- [ ] The request type (Bug / Change / Trivial) is detected and recorded in Document Control.
- [ ] The spec slug is kebab-case; when derived from a free-text argument, the derivation is recorded in Document Control (never a sentence interpolated into a path).
- [ ] Approval Mode is recorded — `gated` by default; `pre-approved` only on an explicit user mandate, with who and when.
- [ ] For a bug: reproduction steps and a **confirmed** root cause are documented (not a guess).
- [ ] Scope and non-goals are explicit.
- [ ] The proposed outcome is behavior-focused.
- [ ] Affected specs or code areas are listed.
- [ ] The Visual Reference records the design source (Figma, generated mockup, or none) with its location.
- [ ] Risks and open questions are visible.
- [ ] The next command matches the detected type (specify, specify Bug Mode, or quick).

## Report To User

Generate a short, easy-to-understand summary (summary facil de entender de lo que se hizo) that reflects what was done. It must include:

1. proposal path
2. resolved spec path
3. detected request type (Bug / Change / Trivial)
4. recommended approach (for a bug: the confirmed root cause and fix strategy)
5. visual reference status (Figma, generated mockup with its path, or none)
6. main risks or open questions
7. next command to run after approval (matched to the type)

Ask whether to approve the proposal, revise it, or stop.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
