---
description: Validate that the implemented feature strictly matches all requirements, design tokens, and user flows.
---

# Validate SDD Implementation

Validate that a spec path's implementation matches its SDD documents. Produce `validation-report.md` with pass, warning, fail, and remediation details.

Validation is the final conformance audit. It checks whether the implementation still matches the approved requirements, scenarios, design decisions, tasks, tests, and constitutional baseline.

## Usage

```
/sdd-validate <spec-path>
```

**Examples:**

- `/sdd-validate loan`
- `/sdd-validate enhancements/renewals`

## Arguments

- `$ARGUMENTS` — Relative path under `docs/specs/` containing `requirements.md`, `design.md`, `tasks.md`, and optionally `execution.md`.

## Output

Create or update `docs/specs/$ARGUMENTS/validation-report.md`.

Validation should produce a clear recommendation for whether the spec can be archived with `/sdd-archive $ARGUMENTS`.

Use these result levels consistently:

| Result | Meaning |
|---|---|
| PASS | The implementation satisfies the requirement, task, or check with evidence |
| WARN | The implementation is acceptable but has risk, missing evidence, or minor drift |
| FAIL | The implementation does not satisfy the requirement, task, or check |
| BLOCKED | Validation could not complete because required context, tooling, or access is missing |

---

## Behavior

### Phase 0: Load Context

1. Read:
   - `docs/specs/$ARGUMENTS/proposal.md` if present
   - `docs/specs/$ARGUMENTS/requirements.md`
   - `docs/specs/$ARGUMENTS/design.md`
   - `docs/specs/$ARGUMENTS/tasks.md`
   - `docs/specs/$ARGUMENTS/execution.md` if present
2. Read constitutional context:
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - `docs/specs/general-setup/`
3. Read root and package-level `CLAUDE.md` files if they exist.

### Phase 1: Task Completion Check

Verify task status coverage and report PASS, WARN, or FAIL per task.

Check that completed tasks include execution notes and verification evidence.

### Phase 2: File Existence Check

Parse the design file tree and verify expected new, modified, and deleted files.

### Phase 3: Build Integrity

Run the project's relevant build, type-check, and lint commands.

Prefer the commands defined by the repo rather than assuming a fixed stack.

If no command exists, record the gap and recommend the smallest useful command to add.

### Phase 4: Requirement Coverage Verification

For every requirement in `requirements.md`, verify:

1. it appears in at least one task
2. mapped tasks are complete when full implementation is claimed
3. code evidence exists
4. key scenarios have automated or documented manual test evidence
5. negative constraints (`BUT it must NOT`) and strict validations (`AND IT MUST`) have been explicitly implemented and verified
6. behavior matches the requirement intent, not only the task wording

### Phase 5: Quality Audit

Use skills as needed:

- `nestjs-expert`
- `react-doctor`
- `api-design-principles`
- `tailwind-design-system`
- `frontend-design`
- `ui-ux-pro-max` if available for UX/UI-heavy validation
- `systematic-debugging` when failures or inconsistencies appear

Check for:

- architecture compliance
- API quality
- frontend quality
- design-system compliance
- UX consistency with the UX/UI design document
- error handling and observability where relevant
- accessibility and responsive behavior for UI work
- security and authorization boundaries for protected flows

### Phase 6: Design Conformance

Compare the implementation against the module design and the constitutional docs where relevant.

If the implementation intentionally differs from the design, verify that the design or execution notes explain the change. Otherwise mark the drift as WARN or FAIL depending on risk.

If `proposal.md` exists, also verify that final behavior remains aligned with the approved intent, scope, non-goals, and success criteria.

### Phase 7: Generate Validation Report

Create `docs/specs/$ARGUMENTS/validation-report.md`.

The report must include:

1. Document Control
2. Summary
3. Task Completion
4. File Existence
5. Build Integrity
6. Requirement Coverage
7. Linting & Code Quality
8. Design Conformance
9. Test Evidence Summary
10. Remediation
11. Archive Readiness Recommendation

The report title must be `# Validation Report — {Spec Name}`.

### Phase 8: Report to User

Generate a short, easy-to-understand summary (summary facil de entender de lo que se hizo) of the overall status, key findings, remediation count, and archive readiness. If issues exist, ask whether to fix all, fix critical only, or keep only the report. If the work is archive-ready, show the exact next command:

```text
/sdd-archive $ARGUMENTS
```

---

## Error Handling

- If SDD documents are missing, report the missing files and stop.
- If build fails, continue other checks when possible.
- If a skill is unavailable, fall back to the next documented skill and note it in the report.
- If no tasks are complete, still allow partial validation but make the incompleteness explicit.
- If implementation evidence is inconclusive, mark WARN or BLOCKED instead of guessing.
- If validation finds spec drift, recommend whether to update the spec, update implementation, or split follow-up work.

---

## Archive Readiness Guidance

The work is ready to consider complete when:

- all required tasks are `[x]`
- no FAIL findings remain unresolved
- WARN findings are accepted or have follow-up tasks
- tests cover the key requirements and scenarios
- implementation drift is reflected in the SDD docs or execution notes
- the user has reviewed the validation summary
