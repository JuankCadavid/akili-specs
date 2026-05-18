# `/sdd-propose`

Create a lightweight, reviewable proposal before full specification.

## Usage

```text
/sdd-propose <change-name-or-spec-path>
```

Examples:

```text
/sdd-propose add-remember-me
/sdd-propose bugfix/login-redirect
/sdd-propose enhancements/renewals
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

## Output

Creates or updates:

```text
docs/specs/<spec-path>/proposal.md
```

## Proposal Sections

- Document Control
- Intent
- Problem / Current Behavior
- Proposed Outcome
- Scope
- Non-Goals
- Affected Users, Systems, And Specs
- Requirement Delta Preview
- Approach Options
- Recommended Approach
- Risks, Dependencies, And Open Questions
- Success Criteria
- Next Step

## Next Step

After approval:

```text
/sdd-specify <spec-path>
```
