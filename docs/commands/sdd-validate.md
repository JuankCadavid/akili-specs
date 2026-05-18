# `/sdd-validate`

Audit whether implementation matches the approved spec and constitutional baseline.

## Usage

```text
/sdd-validate <spec-path>
```

## Use When

- Implementation and test evidence are ready for final conformance review.
- You need a clear PASS/WARN/FAIL/BLOCKED report.
- You want to know whether a spec is archive-ready.

## Inputs

Reads:

- `proposal.md` when present
- `requirements.md`
- `design.md`
- `tasks.md`
- `execution.md` when present
- `test-report.md` when present
- constitution docs and agent guidance

## Outputs

Creates or updates:

```text
docs/specs/<spec-path>/validation-report.md
```

## Result Levels

| Result | Meaning |
|---|---|
| PASS | Requirement, task, or check is satisfied with evidence |
| WARN | Acceptable but risky, missing evidence, or minor drift |
| FAIL | Does not satisfy the requirement, task, or check |
| BLOCKED | Validation could not complete because context, tooling, or access is missing |

## Checks

- task completion and execution notes
- expected file existence
- build, lint, and type-check integrity
- requirement coverage
- test evidence summary
- architecture and design conformance
- UI/UX, API, security, accessibility, error handling, and observability as relevant

## Next Step

If archive-ready:

```text
/sdd-archive <spec-path>
```

If not archive-ready, fix the critical findings or update the spec with accepted drift before archiving.
