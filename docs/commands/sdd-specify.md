# `/sdd-specify`

Generate the requirements, design, and task plan for one bounded feature, bugfix, enhancement, or module.

## Usage

```text
/sdd-specify <spec-path>
```

Examples:

```text
/sdd-specify loan
/sdd-specify enhancements/renewals
/sdd-specify admin/user-management
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
- The user approves requirements, design, and tasks before implementation begins.

## Next Step

After approval:

```text
/sdd-execute <spec-path>
```
