# `/sdd-execute`

Implement the next eligible task from an approved spec path.

## Usage

```text
/sdd-execute <spec-path>
```

## Use When

- `requirements.md`, `design.md`, and `tasks.md` are approved.
- You want incremental execution instead of broad untracked implementation.
- A previous task is marked `[~]` and should be resumed.

## Inputs

Reads:

- `docs/specs/<spec-path>/requirements.md`
- `docs/specs/<spec-path>/design.md`
- `docs/specs/<spec-path>/tasks.md`
- `docs/specs/<spec-path>/execution.md` when present
- constitution docs and agent guidance

## Behavior

1. Select the next `[ ]` or `[~]` task whose dependencies are complete.
2. Re-read the task's requirements and design references.
3. Load only the relevant skills listed by the task.
4. Make the smallest safe implementation change within task scope.
5. Run the task's verification command or closest repository-specific substitute.
6. Update `tasks.md` and append `execution.md`.

## Outputs

- Focused code or documentation changes.
- Updated `tasks.md` with `[x]`, `[~]`, or `[ ]` status.
- Updated `execution.md` with files changed, requirements covered, decisions, issues, and verification result.

## Guardrails

- Do not expand scope without user approval.
- Do not mark a task complete until verification passes or an accepted gap is documented.
- If implementation discovery invalidates the spec, pause and propose a spec update.

## Next Step

Continue executing tasks until implementation is complete, then run:

```text
/sdd-test <spec-path>
```
