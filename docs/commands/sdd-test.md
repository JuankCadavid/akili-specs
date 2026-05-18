# `/sdd-test`

Run or create tests for a spec path and produce requirement-level evidence.

## Usage

```text
/sdd-test <spec-path>
```

## Use When

- Implementation tasks are complete or ready for verification.
- You need a requirement-to-test matrix.
- Manual gaps must be documented explicitly.

## Inputs

Reads:

- `docs/specs/<spec-path>/requirements.md`
- `docs/specs/<spec-path>/design.md`
- `docs/specs/<spec-path>/tasks.md`
- project-level constitution docs and agent guidance

## Outputs

Creates or updates:

```text
docs/specs/<spec-path>/test-report.md
```

The report includes:

- commands run and results
- backend unit test evidence
- frontend unit test evidence
- integration test evidence
- E2E test evidence
- requirement-to-test matrix
- scenario coverage status
- failures and remediation
- accepted gaps with reasons

## Skills Commonly Used

- `nestjs-expert`
- `systematic-debugging`
- `vercel-react-best-practices`
- `react-doctor`
- `ui-ux-pro-max`
- `frontend-design`

## Key Rule

Testing must prove the behavior promised in `requirements.md`, not only increase test count.

## Next Step

After test evidence is recorded:

```text
/sdd-validate <spec-path>
```
