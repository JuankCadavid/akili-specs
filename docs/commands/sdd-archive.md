# `/sdd-archive`

Move a completed spec into historical archive after implementation, testing, and validation.

## Usage

```text
/sdd-archive <spec-path>
```

Examples:

```text
/sdd-archive changes/add-remember-me
/sdd-archive bugfix/login-redirect
/sdd-archive enhancements/renewals
```

## Use When

- The spec is complete.
- Required tasks are `[x]`, or incomplete work is explicitly accepted as follow-up.
- Test and validation evidence exist or their absence is explicitly accepted.
- No unresolved FAIL findings remain.

## Output

Moves:

```text
docs/specs/<spec-path>/
```

to:

```text
docs/specs/archive/YYYY-MM-DD-<safe-name>/
```

`<safe-name>` replaces `/` with `--`.

## Archive Summary

Before moving, the command creates or updates:

```text
docs/specs/<spec-path>/archive-summary.md
```

The summary captures delivered requirements, files changed, test evidence, validation summary, accepted warnings, follow-ups, and historical notes.

## Constitution & Graph Sync

Before moving the folder, the command consumes the `## Constitution Impact` notes recorded in `execution.md` during `/sdd-execute`:

- creates or updates child `CLAUDE.md`/`AGENTS.md` guides for new or reshaped modules (thin, module-specific, never duplicating root rules)
- adds or refreshes the child entries in the parent guides' `## Module Guides` index
- updates root-guide statements the change made stale
- recommends a CodeGraph re-index when `.codegraph/` exists

## Guardrails

- Do not delete completed specs.
- Do not overwrite an existing archive folder.
- If archive readiness is unclear, ask whether to validate first, proceed with accepted risk, or keep the spec active.
