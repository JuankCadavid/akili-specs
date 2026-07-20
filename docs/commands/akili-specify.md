# `/akili-specify`

Generate the requirements, design, and task plan for one bounded feature, bugfix, enhancement, or module.

## Usage

```text
/akili-specify <spec-path>
```

Examples:

```text
/akili-specify loan
/akili-specify enhancements/renewals
/akili-specify admin/user-management
```

## Use When

- A proposal has been approved and needs full specification.
- A small change is clear enough to specify directly.
- A feature needs behavior, design, task, and verification traceability before coding.

## Inputs

Reads context from:

- `docs/specs/<spec-path>/proposal.md` when present
- `docs/specs/general-setup/`
- `docs/prd.md`
- `docs/ux-ui/design.md`
- `docs/trd/trd.md`
- related specs under `docs/specs/`
- `docs/specs/kaizen-log.md` when present — only the `## Active Lessons` digest; relevant lessons are applied and cited by ID in design decisions
- root and package-level agent guidance files

## Outputs

Creates or updates:

```text
docs/specs/<spec-path>/requirements.md
docs/specs/<spec-path>/design.md
docs/specs/<spec-path>/tasks.md
```

## Documentation Depth

| Depth | Use For |
|---|---|
| Lite | Small bugfixes, copy updates, narrow UI tweaks |
| Standard | Normal features and enhancements |
| Full | Risky, cross-cutting, API, data, auth, migration, or high-impact work |

## Key Rules

- Requirements describe observable behavior, not implementation details.
- Key requirements include Given/When/Then scenarios.
- Design extends the current architecture instead of replacing it.
- Tasks reference requirements, design sections, dependencies, done criteria, verification, and relevant skills.
- Any visual design context in the proposal — a Figma link, an agent-generated mockup under `docs/specs/<spec-path>/mockup/`, or a `.stitch/DESIGN.md` reference — is treated as approved input and drives the `Design Impact` guidance across requirements, design, and tasks.
- **Bug Mode:** when the spec is a bug (`Type: Bug`, a `bugfix/*` path, or framed as a defect), specify frames requirements around the corrected behavior from the confirmed root cause and **requires a regression test** — at least one task adds a test that is red before the fix and green after. The root cause is confirmed with `systematic-debugging` if no proposal diagnosis exists.
- The user approves requirements, design, and tasks before implementation begins.

## Next Step

After approval:

```text
/akili-execute <spec-path>
```
