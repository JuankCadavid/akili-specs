# `/akili-propose`

Create a lightweight, reviewable proposal before full specification.

## Usage

```text
/akili-propose <change-name-or-spec-path>
```

Examples:

```text
/akili-propose add-remember-me
/akili-propose bugfix/login-redirect
/akili-propose enhancements/renewals
```

## Path Rules

| Input | Spec Path | Proposal Path |
|---|---|---|
| `add-remember-me` | `changes/add-remember-me` | `docs/specs/changes/add-remember-me/proposal.md` |
| `bugfix/login-redirect` | `bugfix/login-redirect` | `docs/specs/bugfix/login-redirect/proposal.md` |

Bare names default to `changes/<name>`. Paths containing `/` are used as provided under `docs/specs/`.

## Use When

- The change needs stakeholder review before detailed specs.
- Scope, non-goals, risks, or affected systems are uncertain.
- Multiple implementation approaches are possible.
- Existing behavior may need added, modified, or removed requirements.
- A **bug** needs its root cause diagnosed before a fix is planned.

## Request Classification & Routing

`/akili-propose` is the single entry point that classifies the request and routes it — so the methodology does not need a separate command per work type. It infers the type from the request (and asks one short question if ambiguous):

| Type | Route |
|---|---|
| **Trivial** (cosmetic/copy tweak) | Recommends `/akili-quick <name>` instead of a full proposal |
| **Feature / Change** | Standard proposal → `/akili-specify` |
| **Bug** | **Bug Track**: diagnose first (reproduction + confirmed root cause via `systematic-debugging`) in the proposal, then `/akili-specify` in **Bug Mode** with a mandatory regression test |

The detected type is recorded as `Type: Bug | Change | Trivial` in the proposal's Document Control so `/akili-specify` inherits it.

## Output

Creates or updates:

```text
docs/specs/<spec-path>/proposal.md
```

If `docs/specs/kaizen-log.md` exists, the command reads its `## Active Lessons` digest and reflects applicable lessons in the proposal's Scope or Risks, citing their IDs (e.g. `KZ-003`).

## Proposal Sections

- Document Control (records `Type: Bug | Change | Trivial`)
- Intent
- Problem / Current Behavior
- Proposed Outcome
- Scope
- Non-Goals
- Affected Users, Systems, And Specs
- Visual Reference
- Bug Diagnosis (Bug track) *or* Requirement Delta Preview (Change track)
- Approach Options
- Recommended Approach
- Risks, Dependencies, And Open Questions
- Success Criteria
- Next Step

## Bug Track

For a bug, the proposal replaces the Requirement Delta Preview with a **Bug Diagnosis** produced with the `systematic-debugging` skill: observed symptom, reproduction steps, **confirmed** root cause (not a guess), impact/scope, and a fix strategy. No fix is proposed until the root cause is confirmed. The fix then routes by size — a purely cosmetic one-liner to `/akili-quick`, anything with logic to `/akili-specify` (Lite) in Bug Mode, which requires a regression test (red before the fix, green after).

## Visual Input & Mockup Fallback

During intent clarification the command asks for the requirement source (e.g. Jira MCP) and any visual design (Figma MCP).

When the change has a UI surface and **no** Figma link, image, or existing design is provided, the command offers an **opt-in, recommended** fallback: generate a mockup directly in the agent using the `stitch-design` skill (Stitch MCP). Accepted mockups are saved under `docs/specs/<spec-path>/mockup/` (or the `.stitch/designs` / `.stitch/DESIGN.md` location) and recorded in the proposal's **Visual Reference** section. This mockup then counts as approved visual design context for `/akili-specify`, exactly like a Figma link. The user can always decline and continue without a visual.

## Next Step

After approval:

```text
/akili-specify <spec-path>
```
