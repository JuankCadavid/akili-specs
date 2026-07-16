---
description: Propose new features or changes by initiating a new detailed technical spec process.
---

# Propose SDD Change

Create a lightweight proposal for one bounded change before generating full SDD documents.

The proposal is the reviewable intent layer. It should help the user decide whether the change is worth specifying before time is spent on requirements, design, tasks, or implementation.

## Usage

```
/sdd-propose <change-name-or-spec-path>
```

**Examples:**

- `/sdd-propose add-remember-me`
- `/sdd-propose bugfix/login-redirect`
- `/sdd-propose enhancements/renewals`

## Arguments

- `$ARGUMENTS` - A change name or a relative path under `docs/specs/`.

Path resolution:

- If `$ARGUMENTS` contains `/`, treat it as the literal spec path.
- If `$ARGUMENTS` is a bare name, use `changes/$ARGUMENTS` as the spec path.

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

Do not create `requirements.md`, `design.md`, or `tasks.md` in this command unless the user explicitly asks. Those belong to `/sdd-specify`.

## Behavior

### Step 0: Resolve Path And Load Context

1. Resolve `$SPEC_PATH` using the path rules above.
2. Create `docs/specs/$SPEC_PATH/` if it does not exist.
3. Read project-level context when available:
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - `docs/specs/general-setup/`
   - root `CLAUDE.md`
   - package-level `CLAUDE.md` files
4. Read nearby or related specs under `docs/specs/`.
5. Inspect relevant code paths only enough to understand current behavior and likely impact.

### Step 1: Clarify Intent, Sources & Scope Chunking

Before diving into the problem, ask the user about the source of the requirements and any visual designs:

1. **Requirement Source:** Ask if they have a **Jira ticket** (if they do, suggest using the **Jira MCP** to automatically extract the description, acceptance criteria, and comments created by the BA) or if they prefer to paste/write the context directly.
2. **Visual Designs / Mockups:** Ask if there is a **Figma link** or any visual mockup available. If they provide a Figma URL, suggest using the **Figma MCP** to extract the design details, components, and layout information.

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
- Upon agreement, create the respective folders for each bounded change under `docs/specs/` and generate a `proposal.md` for each.

Ask focused questions only when the proposal would otherwise depend on unstable assumptions.

### Step 2: Write `proposal.md`

Create a concise proposal with this structure:

1. Document Control
2. Intent
3. Problem / Current Behavior
4. Proposed Outcome
5. Scope
6. Non-Goals
7. Affected Users, Systems, And Specs
8. Requirement Delta Preview
9. Approach Options
10. Recommended Approach
11. Risks, Dependencies, And Open Questions
12. Success Criteria
13. Next Step

### Requirement Delta Preview

When the change affects existing behavior, include a lightweight preview using these sections where relevant:

```markdown
## Requirement Delta Preview

### ADDED Requirements

- New behavior that does not exist today.

### MODIFIED Requirements

- Existing behavior that will change.

### REMOVED Requirements

- Existing behavior that will be deprecated or deleted.
```

This preview is not the final spec. `/sdd-specify` converts approved intent into full requirements, scenarios, design, and tasks.

### Approach Options

For non-trivial work, include 2 or 3 options with trade-offs. Recommend one option and explain why it is the smallest safe path.

### Next Step

End the proposal with the exact next command:

```text
/sdd-specify $SPEC_PATH
```

## Review Checklist

Before presenting the proposal, verify:

- [ ] The problem is clear.
- [ ] Scope and non-goals are explicit.
- [ ] The proposed outcome is behavior-focused.
- [ ] Affected specs or code areas are listed.
- [ ] Risks and open questions are visible.
- [ ] The next command uses the resolved spec path.

## Report To User

Generate a short, easy-to-understand summary (summary facil de entender de lo que se hizo) that reflects what was done. It must include:

1. proposal path
2. resolved spec path
3. recommended approach
4. main risks or open questions
5. next command to run after approval

Ask whether to approve the proposal, revise it, or stop.
