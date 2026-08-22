---
name: akili-archive
description: Archive a completed spec task, run the Kaizen retrospective, sync agent guides and CodeGraph, and keep the TRD current.
license: MIT
metadata:
  author: Juan Carlos Cadavid (jcadavid.com)
---

# Archive AKILI-SPECS Spec

Archive a completed AKILI-SPECS spec path after implementation, testing, and validation are done.

Archiving preserves the full decision trail. It keeps active `docs/specs/` easier to scan while retaining proposal, requirements, design, tasks, execution notes, test evidence, and validation evidence for future review.

> **Recommended model tier:** T5 Fast-Cheap. This is a format-following and file-moving job; a deep reasoning model is not required. The Kaizen Learn sub-step (Step 4.2) is a judgment task — if convenient, run it on a T3 Auditor model; otherwise keep the whole command on T5 and keep lessons few.

## Usage

```
/akili-archive <spec-path>
```

**Examples:**

- `/akili-archive changes/add-remember-me`
- `/akili-archive bugfix/login-redirect`
- `/akili-archive enhancements/renewals`

## Arguments

- `$ARGUMENTS` - Relative path under `docs/specs/` that should be archived.

## Output

Move the completed spec folder from:

```text
docs/specs/$ARGUMENTS/
```

to:

```text
docs/specs/archive/YYYY-MM-DD-$SAFE_NAME/
```

Where `$SAFE_NAME` is `$ARGUMENTS` converted to a filesystem-safe flat name by replacing `/` with `--`.

Example:

```text
docs/specs/bugfix/login-redirect/
docs/specs/archive/2026-05-16-bugfix--login-redirect/
```

## Behavior

### Step 0: Load Context

**Model checkpoint:** This phase runs best on **T5 Fast-Cheap** (summarization and bookkeeping). If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps that tier to a model different from the current session model, check the direction first — the registry is a floor, not a ceiling: if the session model is the stronger one (e.g. a newer generation than a stale entry), pass silently and flag the registry entry for update instead of recommending a downgrade. Only when the registry model is stronger for this tier, tell the user in one line — e.g. *"This phase is T5 — the registry recommends `/model haiku`; you are on opus"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode) at the first approval pause. Never block on this; continuing on the current model is always allowed.

**Token Optimization (Prompt Caching):** To maximize prompt caching, always read the constitutional baseline documents FIRST and in the exact same order across all sessions before reading task-specific files.

1. Confirm `docs/specs/$ARGUMENTS/` exists.
2. Read project-level context ONLY if needed to interpret archive readiness (IN THIS ORDER):
   - root `CLAUDE.md`
   - `AGENTS.md`
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - `docs/specs/general-setup/`
3. Read all available files in the spec folder, especially:
   - `proposal.md` if present
   - `requirements.md`
   - `design.md`
   - `tasks.md`
   - `execution.md` if present
   - `test-report.md` if present
   - `validation-report.md` if present
4. Read Kaizen inputs (each only if it exists):
   - `docs/specs/kaizen-log.md` — the `## Active Lessons` digest. Its `## Entries` section is frozen history: readable as a permanent legacy fallback, never written.
   - the entry files under `docs/specs/kaizen/` — the pending backlog and the recurrence feed (their `## Noted, not a lesson` sections included).
   - the most recent report under `docs/specs/audits/`. **Most recent** means the highest `Date` header *inside* the reports, ties broken by the newest filename in lexical order — never filesystem mtime, which a checkout destroys. A scaffolded `README.md` or `.gitkeep` is not a report.
   - `docs/specs/drift-report.md` — the permanent legacy fallback for the drift source, read only when `docs/specs/audits/` holds no report file at all.
   - `docs/specs/quick/quick-log.md` (only if this spec escalated from `/akili-quick`)

### Step 1: Check Archive Readiness

Verify the spec is ready to archive:

- `requirements.md`, `design.md`, and `tasks.md` exist
- all required tasks are marked `[x]`, or incomplete tasks are explicitly accepted as follow-up work
- `test-report.md` exists, or the absence is explicitly accepted
- `validation-report.md` exists, or the absence is explicitly accepted
- no unresolved FAIL findings remain in `validation-report.md`
- WARN findings are either accepted or assigned to follow-up tasks
- implementation drift is reflected in the AKILI-SPECS docs or execution notes
- if this spec is the **parent** of a spec family (its folder contains a `family.md` manifest), every child row's `Status` must be `done`; if any are not, block the parent archive and name the non-terminal children in the readiness message

If readiness is unclear, stop and ask the user whether to proceed, validate first, or keep the spec active.

### Step 2: Create Archive Summary

Write the summary (and later the Kaizen entry file) following `cognitive-doc-design`: lead with the outcome, keep sections small, and prefer tables and checklists over prose.

Before moving the folder, create or update:

```text
docs/specs/$ARGUMENTS/archive-summary.md
```

The summary must include:

1. Document Control
2. Original Spec Path
3. Archive Date
4. Final Status
5. Requirements Delivered
6. Files Changed Summary, based on `execution.md` when available
7. Test Evidence Summary
8. Validation Summary
9. Accepted Warnings Or Follow-Ups
10. Historical Notes

### Step 3: Constitution & Graph Sync

Before moving the folder, sync the project constitution with what the spec actually changed:

**Branch gate — items 2, 3, and 4 only.** Those three items write shared files (root and child guides, the TRD), so they may write **only on the default branch**. Resolve the Branch Context once, here: compare the checked-out branch against the `Default Branch:` pin in the constitution summary of the root `CLAUDE.md`/`AGENTS.md` already loaded in Step 0. No pin, or a comparison that cannot be resolved, counts as a **spec branch** — the `kaizen` skill's Branch Context owns the full fallback resolution and its defer-on-failure default; do not restate that procedure here.

On a spec branch, items 2–4 make no edit at all. Each records what it *would* have written as a typed pending item — `Kind: guide-sync`, `factual-sweep`, or `trd-adr`, with the target file, the verbatim 1–3 lines, and a severity, in the schema the kaizen skill defines. Compose the items here; Step 4.4's Record write puts them in this spec's entry file under `## Pending Items` — one write, not one per item — and Step 6 reports them as pending. Items 5 and 6 are outside this gate and run on any branch: the `family.md` row flip is spec-scoped, and the CodeGraph hook only recommends a re-index.

1. **Read impact notes:** Collect every `## Constitution Impact` block from `execution.md` and the files-changed summary. If none exist but the diff clearly introduced a new module/package, treat that as an implicit impact note.
2. **Agent guide sync:** For each impacted module:
   - Create or update the child `CLAUDE.md`/`AGENTS.md` when the module's conventions diverge from the root (thin, module-specific, never duplicating root rules).
   - Add or refresh the child's entry in the parent guides' `## Module Guides` index.
   - Update any root-guide statements the change made stale (structure descriptions, module lists, key commands).
   - Follow the inheritance convention from `/akili-constitution` Step 7 — if the project has no `## Module Guides` index yet, add it rather than inventing a parallel structure.
   - **On a spec branch:** determine the same edits, then record each one as a `guide-sync` pending item naming the guide and the exact lines. Create no guide, touch no index.
3. **Factual-claims sweep of the root guides — runs always, even with zero impact notes.** The per-module sync above only fires for modules the impact notes name, which is exactly how a stale claim survives: a cycle that implements ten components leaves `CLAUDE.md` still asserting *"No application code yet"* because no single module impact pointed at that sentence. Sweep the root `CLAUDE.md`/`AGENTS.md` for **factual assertions this cycle falsified** — CodeGraph/init status lines, "no code yet"/project-stage claims, stack or command statements, counts and lists — and fix the ones that are now false. The test is the same one `/akili-audit` applies to specs: a guide is constitution, and a constitution that states falsehoods trains every future agent on them. **The sweep itself runs on any branch — the gate moves the write, not the detection.** On a spec branch, each falsified claim becomes a `factual-sweep` pending item quoting the stale sentence and its replacement; the guide is left untouched.
4. **TRD & ADR sync (default branch):** if the spec's `design.md` decisions or any `## Pivot Record` overturned an architecture decision recorded in the TRD, append the superseding ADR to the TRD's Architecture Overview & Decisions (new `ADR-MMM` with status `accepted`, its Issue citing the pivot/design evidence) and flip the old entry to `superseded by ADR-MMM` in the ADR index. Never edit or delete the superseded entry — the trail of why the architecture turned is the asset (`software-architect` ADR profile). **On a spec branch:** record a `trd-adr` pending item carrying the superseding decision text and the identifier of the ADR it supersedes, with **no ADR number of its own** — numbering is an apply-time act on the default branch, and allocating one from a branch is exactly the collision this gate exists to prevent. Do not open `docs/trd/trd.md` for writing.
5. **Spec family manifest sync:** if this spec is a child listed in a parent's `family.md` (schema defined once in constitution Step 7 item 4 / `docs/specs/general-setup/family.md` — check the spec's `Parent Spec:` Document Control row, or the parent folder for a manifest naming this spec's path), flip that child's row `Status` to `done` in the parent manifest before the Step 5 move. Precedent: item 2's Module Guides index refresh and item 4's ADR status flip above. This is the one edit the Error Handling write-constraint bullet exempts.
6. **CodeGraph Refresh Hook:** Check if `.codegraph/` exists in the repository root. If it does, recommend that the user or environment runs a fresh CodeGraph indexing/update (e.g. running `codegraph index` or equivalent) so the graph reflects the new or reshaped modules.

### Step 4: Kaizen Retrospective

Before moving the folder, **load the `kaizen` skill and follow its loop contract**: one bounded continuous-improvement pass over the completed spec — **Measure → Learn → Standardize → Record**. The pass reads only files already loaded in Step 0, produces at most 3 lessons and one entry file, and must never block the archive.

#### 4.1 — Measure

Extract the improvement signals listed in the skill's Measure table from the spec's own evidence: Reviewer FAIL rework attempts, HALTs and FATAL_FAILs, `## Pivot Record` blocks, PRODUCT_BUG findings, severe judgment-day findings, validation FAIL/WARN counts, `/akili-quick` escalations, and drift attributable to this spec.

If every signal is clean, record a one-line **clean run** entry in Step 4.4 and skip 4.2–4.3.

#### 4.2 — Learn

Distill **0 to 3** lessons following the skill's hard rules: every lesson names a root cause and cites its evidence (file + section); generic lessons are banned; prefer zero lessons over filler; a root cause that already exists — in the digest or in another entry file — becomes a `digest-update` pending item (recurrence noted, severity raised) instead of a duplicate lesson or a live digest edit. Classify each lesson's target as **Product** (this project) or **Methodology** (the root cause is AKILI itself).

#### 4.3 — Standardize (branch-gated HITL)

For each lesson, propose exactly one minimal edit (1–3 lines) to the most durable home (constitution guides, `docs/specs/general-setup/` templates, `docs/ux-ui/design.md`, or `.agents/` personas — append-only). Methodology lessons get no local edit; record them for upstreaming to the AKILI methodology repository.

What happens to those proposals is the skill's two-phase contract, decided by the same Branch Context Step 3 resolved — follow the skill's Standardize phase for the menu, its recommendation rule, and the severity scale rather than restating them here. In short: on a **spec branch** every proposal is recorded as a `standardization` pending item with `Status: pending` and still presented to the user for review — the gate moves the write, not the review — while no shared file is touched and no menu fires. On the **default branch** the approval menu fires and approved edits are applied in this pass (solo fast path). **Every edit outside this spec's own entry file requires that approval — and on a spec branch no such edit happens, approved or not.**

#### 4.4 — Record

Write the retrospective to this spec's entry file, `docs/specs/kaizen/<safe-spec-slug>.md`, following the skill's Record phase and entry-file schema: metrics, lessons, `## Noted, not a lesson`, and the `## Pending Items` queue — which carries Step 3's typed items alongside Standardize's own, including on a clean run that distilled no lessons. Re-run detection is the exact-name existence check the skill defines: update the file in place, never create a second one for the same spec. Never prepend to `## Entries` and never touch `## Active Lessons` in `docs/specs/kaizen-log.md` — the digest's single writer is the apply phase on the default branch.

**Default-branch runs offer the backlog.** When Branch Context resolved to the default branch, then — after this spec's own retrospective is recorded — offer the skill's Apply Mode over the **whole pending backlog**: every entry file under `docs/specs/kaizen/` holding pending or deferred items, not only this spec's. State the item count and the highest severity in the offer, and run the skill's apply loop if the user accepts; declining leaves every item `pending` for the next pass, losing nothing. On a spec branch the offer does not fire — say in one line that the recorded items await the apply phase on the default branch.

### Step 5: Move Folder

1. Ensure `docs/specs/archive/` exists.
2. Move `docs/specs/$ARGUMENTS/` to `docs/specs/archive/YYYY-MM-DD-$SAFE_NAME/`.
3. If the target archive folder already exists, do not overwrite it. Add a numeric suffix such as `-2` and report the final path.

### Step 6: Report To User

Present:

1. archived source path
2. final archive path
3. final validation status
4. unresolved follow-ups, if any
5. whether the active spec directory is now clean
6. constitution sync summary: guides created or updated, parent index entries touched, and whether a CodeGraph re-index is recommended — or, on a spec branch, the guide, sweep, and TRD edits recorded as pending items instead of written
7. Kaizen summary: metrics captured, lessons recorded (IDs), the entry file path, standardization actions **applied, deferred, or pending (awaiting the default-branch apply phase)**, and any Methodology lessons suggested for upstreaming to the AKILI repo
8. `family.md` update, if this spec is a manifest-listed child: the parent path and the row flipped to `done`

**Context checkpoint (post-archive is the cleanest boundary in the whole methodology):** the spec is closed, and everything durable now lives in files — the archive, the kaizen entry file, and either the synced guides or the pending items recorded in their place. Nothing in this session's context is worth carrying forward. If the session has been long, say so in one line and recommend the host's context reset before starting new work — `/clear` in Claude Code (then a fresh session picks up with `/akili-resume` or `/akili-propose`); on other hosts, name the equivalent only if confirmed. You cannot run it — it is the user's command — but recommending it *here*, at the boundary where it costs nothing, beats the user guessing mid-task where it destroys working state.

## Error Handling

- If the spec path does not exist, report the missing path and stop.
- If required docs are missing, ask whether to archive anyway or run the missing command first.
- If validation has unresolved FAIL findings, recommend fixing or explicitly accepting risk before archive.
- If moving the folder fails, leave the original folder in place and report the reason.
- If Step 1's spec family readiness gate blocks a parent archive, leave the parent folder in place and do not move it; report the non-terminal children by name, and proceed only if the user explicitly overrides via the stop-and-ask path.
- Do not delete spec folders as part of archiving; only move them into `docs/specs/archive/`.
- The Kaizen retrospective must never block the archive. If retrospective inputs are missing or the user declines the menu, write a metrics-only (or clean-run) **entry file** at `docs/specs/kaizen/<safe-spec-slug>.md` and continue to Step 5. The fallback write target is always the entry file — never `docs/specs/kaizen-log.md`, whose digest has one writer, on the default branch.
- **Writable set, in branch terms.** On a **spec branch** this command may write only the spec's own folder (`archive-summary.md` included), the spec's kaizen entry file, and Step 3 item 5's flip of the archived child's own row in the parent `family.md` — plus the Step 5 move of the spec folder itself. Everything else is off-limits, shared guides and the TRD included: what would have been written becomes a pending item. On the **default branch** the writable set additionally includes the shared files whose edits the user approved through Step 4.3's menu or Step 4.4's backlog offer. No approval, no edit — on either branch.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
