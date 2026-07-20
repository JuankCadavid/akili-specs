# `/akili-archive`

Move a completed spec into historical archive after implementation, testing, and validation, running the Kaizen retrospective along the way.

## Usage

```text
/akili-archive <spec-path>
```

Examples:

```text
/akili-archive changes/add-remember-me
/akili-archive bugfix/login-redirect
/akili-archive enhancements/renewals
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

Before moving the folder, the command consumes the `## Constitution Impact` notes recorded in `execution.md` during `/akili-execute`:

- creates or updates child `CLAUDE.md`/`AGENTS.md` guides for new or reshaped modules (thin, module-specific, never duplicating root rules)
- adds or refreshes the child entries in the parent guides' `## Module Guides` index
- updates root-guide statements the change made stale
- recommends a CodeGraph re-index when `.codegraph/` exists

## Kaizen Retrospective

Before moving the folder, the command loads the packaged `kaizen` skill and runs one bounded continuous-improvement pass — **Measure → Learn → Standardize → Record**:

- **Measure:** extracts improvement signals from the spec's evidence (Reviewer rework attempts, pivots, PRODUCT_BUGs, severe judgment-day findings, validation WARN/FAIL, quick escalations, drift).
- **Learn:** distills 0–3 lessons, each with a named root cause and cited evidence; generic lessons are banned. Lessons target the **Product** or the **Methodology** (flagged for upstreaming to the AKILI repo).
- **Standardize:** proposes 1–3 line edits to constitution guides, `general-setup` templates, design tokens, or `.agents/` personas via an approval menu. Every edit outside the kaizen log requires approval.
- **Record:** appends the entry to the accumulative `docs/specs/kaizen-log.md` and refreshes its `## Active Lessons` digest (10 rows max), which `/akili-propose`, `/akili-specify`, `/akili-execute`, and `/akili-resume` read.

A clean spec records a one-line clean-run entry. The retrospective never blocks the archive.

## Guardrails

- Do not delete completed specs.
- Do not overwrite an existing archive folder.
- If archive readiness is unclear, ask whether to validate first, proceed with accepted risk, or keep the spec active.
- The Kaizen retrospective never blocks the archive and never edits files outside `docs/specs/kaizen-log.md` without approval.
