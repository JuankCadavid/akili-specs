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

Before moving the folder, the command syncs the project constitution with what the spec actually changed, starting from the `## Constitution Impact` notes recorded in `execution.md` during `/akili-execute`.

**Branch gate.** The three items below — the agent guide sync, the factual-claims sweep, and the TRD & ADR sync — write shared files, so they may write **only on the default branch**. The Branch Context is resolved once here, by comparing the checked-out branch against the `Default Branch:` pin in the constitution summary of the root `CLAUDE.md`/`AGENTS.md` already loaded; no pin, or a comparison that cannot be resolved, counts as a spec branch, and the `kaizen` skill's Branch Context owns the full fallback resolution. On a spec branch none of them edits anything — each records what it *would* have written as a typed pending item in this spec's kaizen entry file, with the target file, the verbatim 1–3 lines, and a severity.

| Sync item | On the default branch | On a spec branch |
|---|---|---|
| Agent guide sync | Creates or updates child `CLAUDE.md`/`AGENTS.md` guides for new or reshaped modules (thin, module-specific, never duplicating root rules), adds or refreshes their entries in the parent guides' `## Module Guides` index, and updates root-guide statements the change made stale | A `guide-sync` pending item naming the guide and the exact lines; no guide is created and no index is touched |
| Factual-claims sweep | Runs always, even with zero impact notes: sweeps the root guides for factual assertions this cycle falsified — CodeGraph/init status lines, "no code yet" or project-stage claims, stack and command statements, counts and lists — and fixes the ones that are now false | A `factual-sweep` pending item quoting the stale sentence and its replacement. The sweep itself still runs on any branch: the gate moves the write, not the detection |
| TRD & ADR sync | When a `design.md` decision or a `## Pivot Record` overturned an architecture decision, appends the superseding `ADR-MMM` to the TRD and flips the old entry to `superseded by ADR-MMM`, never editing or deleting the superseded text | A `trd-adr` pending item carrying the superseding decision and the identifier of the ADR it supersedes, with **no number of its own** — numbering is an apply-time act on the default branch |

Two items sit outside the gate and run on either branch: the `family.md` child-row flip (spec-scoped, see Guardrails) and the CodeGraph re-index recommendation when `.codegraph/` exists.

## Kaizen Retrospective

Before moving the folder, the command loads the packaged `kaizen` skill and runs one bounded continuous-improvement pass — **Measure → Learn → Standardize → Record**. Its inputs are read up front: the `## Active Lessons` digest in `docs/specs/kaizen-log.md` (whose `## Entries` section is frozen history — readable, never written), the entry files under `docs/specs/kaizen/` (the pending backlog and the recurrence feed), and the most recent report under `docs/specs/audits/`, with legacy `docs/specs/drift-report.md` as the permanent fallback when that directory holds no report at all.

- **Measure:** extracts improvement signals from the spec's evidence (Reviewer rework attempts, pivots, PRODUCT_BUGs, severe judgment-day findings, validation WARN/FAIL, quick escalations, drift).
- **Learn:** distills 0–3 lessons, each with a named root cause and cited evidence; generic lessons are banned. A root cause that already exists — in the digest or in another entry file — becomes a `digest-update` pending item instead of a duplicate lesson or a live digest edit. Lessons target the **Product** or the **Methodology** (flagged for upstreaming to the AKILI repo).
- **Standardize (branch-gated):** proposes one 1–3 line edit per lesson to constitution guides, `general-setup` templates, design tokens, or `.agents/` personas. On a **spec branch** every proposal is recorded as a `standardization` pending item with `Status: pending` and is still presented to the user — the gate moves the write, not the review — while no shared file is touched and no menu fires. On the **default branch** the approval menu fires and approved edits are applied in the same pass (solo fast path).
- **Record:** writes this spec's entry file, `docs/specs/kaizen/<safe-spec-slug>.md` — one file per spec, re-run detection being an exact-name existence check that updates the file in place. It carries the metrics, the lessons, the `## Noted, not a lesson` sub-threshold signals, and the `## Pending Items` queue holding the Constitution & Graph Sync items alongside Standardize's own. It never prepends to `## Entries` and never touches `## Active Lessons` in `docs/specs/kaizen-log.md`: the digest's single writer is the apply phase on the default branch.

**Default-branch runs offer the backlog.** After recording its own retrospective, an archive that ran on the default branch offers the skill's **Apply Mode** over the whole pending backlog — every entry file under `docs/specs/kaizen/` holding pending or deferred items, not only this spec's — stating the item count and the highest severity. Declining leaves every item `pending` for the next pass, losing nothing. On a spec branch the offer does not fire; the run says in one line that the recorded items await the apply phase on the default branch.

The closing report states the Kaizen outcome in three possible standardization states — **applied, deferred, or pending (awaiting the default-branch apply phase)** — alongside the entry file path, the lesson IDs, and any Methodology lessons suggested for upstreaming. Its constitution-sync line reports either the guides written or, on a spec branch, the guide, sweep, and TRD edits recorded as pending items instead.

A clean spec records a one-line clean-run entry file. The retrospective never blocks the archive.

## Guardrails

- Do not delete completed specs.
- Do not overwrite an existing archive folder.
- If archive readiness is unclear, ask whether to validate first, proceed with accepted risk, or keep the spec active.
- **Writable set, in branch terms.** On a spec branch the command writes only the spec's own folder (`archive-summary.md` included), the spec's kaizen entry file, and the archived child's own row in the parent `family.md` — plus the folder move itself. Everything else is off-limits, shared guides and the TRD included: what would have been written becomes a pending item. On the default branch the writable set additionally includes the shared files whose edits the user approved. No approval, no edit — on either branch.
- The Kaizen retrospective never blocks the archive. Missing inputs or a declined menu still produce a metrics-only or clean-run **entry file** at `docs/specs/kaizen/<safe-spec-slug>.md`; the fallback write target is always the entry file, never `docs/specs/kaizen-log.md`, whose digest has one writer on the default branch.
- **Spec families:** archiving a manifest-listed child flips its row to `done` in the parent's `family.md` before the folder moves. Archiving a family's parent is blocked while any child row is non-terminal, with the non-terminal children named in the message (override via the same stop-and-ask escape hatch).
