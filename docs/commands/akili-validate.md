# `/akili-validate`

Audit whether implementation matches the approved spec and constitutional baseline.

## Usage

```text
/akili-validate <spec-path>
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
- requirement coverage — **reuses `test-report.md`** as the primary evidence (its requirement-to-test matrix and `PASS`/`FAIL`/`PRODUCT_BUG` verdicts) instead of re-deriving coverage; an unresolved `PRODUCT_BUG` forces a FAIL
- test evidence summary
- architecture and design conformance, including UI consistency with the proposal's **Visual Reference** (Figma or a generated mockup) when the spec was designed against one
- a lightweight **Agent Guide / Constitution Impact** check: if `execution.md` records module-boundary changes, confirm the child guides and the parent `## Module Guides` index are not stale (flagged WARN and left for `/akili-archive`)
- UI/UX, API, security, accessibility, error handling, and observability as relevant

## Video Specs

When `requirements.md` records `Deliverable: video` (an absent row means software), validate loads `video-production` in its setup so the availability gate fires here too; if the gate stops, validation is BLOCKED. Then:

- `check` is the build-integrity command, and a passing `check` never replaces the final look.
- **Final look:** validate does not report PASS for the spec without one, whatever else is green. Decoded frames of the draft render are reviewed against every acceptance criterion and the storyboard in `design.md`, by a human at the HITL pause or a tier-T6 multimodal review. The look and its verdict are recorded in the report.
- **Delivery render:** run only after the final look is approved, locally, and never while a delegated agent is active.

## Next Step

If archive-ready:

```text
/akili-archive <spec-path>
```

If not archive-ready, fix the critical findings or update the spec with accepted drift before archiving.
