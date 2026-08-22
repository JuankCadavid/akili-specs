---
name: kaizen
description: "Trigger: kaizen, retrospective, continuous improvement, mejora continua, /akili-archive Kaizen step, apply pending kaizen standardizations, kaizen apply, aplicar estandarizaciones kaizen. Run the bounded two-phase Kaizen loop: Measure → Learn → Standardize → Record on any branch, then apply the pending backlog on the default branch."
license: MIT
metadata:
  author: Juan Carlos Cadavid — jcadavid.com
  binding: core
  version: "2.0"
  inspired-by: "Kaizen Institute glossary (kaizen.com), 'El Método Kaizen' (small-steps approach, Robert Maurer), 'Emprendiendo Kaizen' (INTI, 2019, ISBN 978-950-532-415-6)"
---

# Kaizen — The AKILI Continuous-Improvement Skill

Kaizen (改善, *kai* = change, *zen* = better) is the Japanese philosophy of continuous improvement through small, disciplined, daily steps. This skill turns that philosophy into an executable retrospective for AI-assisted development: every archived spec must leave the project — and the methodology itself — slightly better than it found them.

> Other methodologies execute specs. AKILI learns from every spec.

## Activation Contract

Load this skill when:

- `/akili-archive` reaches its **Kaizen Retrospective** step (the primary, automatic trigger),
- the user explicitly requests a kaizen retrospective / continuous-improvement pass over a spec or project, or
- **Apply Mode** — the user asks to *apply pending kaizen standardizations* ("kaizen apply", "aplicar estandarizaciones kaizen"), or `/akili-archive` finishes a retrospective with the default branch checked out and offers the pending backlog.

The loop runs in two phases with two different homes:

| Phase | Runs where | Writes |
|---|---|---|
| **Retrospective** (Measure → Learn → Standardize → Record) | any branch | the spec's own entry file under `docs/specs/kaizen/` |
| **Apply** (the pending backlog) | the default branch only | HITL-approved shared files, the digest, and status flips in entry files |

Apply Mode is **standalone**: no spec argument, no active archive — it works over the whole pending backlog, so it stays reachable long after the specs that produced it were archived. Invoked on a spec branch, it declines in one line ("Apply Mode runs only on the default branch — see Branch Context; the pending backlog stays recorded and is re-offered there") and does nothing else. No separate kaizen command exists; this is an activation of this skill.

The retrospective is **bounded**: one pass, at most 3 lessons, one entry file. It must never block the archive or any other command that invoked it.

## Philosophy → Engineering Mapping

Each Kaizen concept maps to a concrete AKILI mechanism. Use this vocabulary in reports so the improvement culture stays visible.

| Concept | Meaning | In AKILI |
|---|---|---|
| **Kai + Zen** | Small changes that make things better, every day, forever | Every `/akili-archive` is an improvement opportunity; the loop never "finishes" |
| **Small steps** (Maurer) | Improvements so small they cannot fail or trigger resistance | Standardization edits are 1–3 lines; never rewrite a document to institutionalize a lesson |
| **Small questions** (Maurer) | Gentle questions unlock root causes better than big alarming ones | Learn step asks: *"What is the smallest rule that would have prevented this rework?"* |
| **PDCA** (Deming) | Plan → Do → Check → Act | Plan = the spec; Do = execute/test; Check = validate + **Measure**; Act = **Standardize**. The retrospective closes the cycle the pipeline opened |
| **MUDA** | Waste: any activity that adds no value | Rework attempts (defects), pivots (planning waste), token waste (oversized context, re-reading), stale docs (drift = inventory waste), quick-escalations (misrouted work). **Measure = hunt MUDA** |
| **Jidoka** | Stop the line the moment a defect appears | AKILI already practices it: the Tester keeps a test red on `PRODUCT_BUG`; the harness HALTs on `FATAL_FAIL`. Name it in reports — the methodology owns this concept |
| **Gemba / 3 GEN** | Real place, real thing, real facts — never speculate | Every lesson must cite evidence from the actual artifacts (`execution.md`, `test-report.md`, `validation-report.md`); use **5W1H** to reach root cause |
| **LUP** (one-point lesson) | One lesson, one page, instantly teachable | The `## Active Lessons` digest row: one lesson, one line, one owner document |
| **Standardize & repeat** | A fix becomes a standard, then the next improvement begins | Applied lessons live in constitution guides/templates; the digest retires them once institutionalized |

## The Loop Contract

Run the four phases in order. Beyond the artifacts the invoking command already loaded, read only the kaizen inputs these phases name: the drift report (phase 1), the digest and the entry files under `docs/specs/kaizen/` (phase 2).

### 1. Measure

Extract improvement signals from the spec's own evidence:

| Signal | Source |
|---|---|
| Reviewer FAIL rework attempts, HALTs, FATAL_FAILs | `execution.md` task entries |
| Pivots | `execution.md` `## Pivot Record` blocks |
| PRODUCT_BUG findings | `test-report.md` |
| Severe judgment-day findings | `design.md` / specify review notes, if recorded |
| Validation FAIL / WARN counts | `validation-report.md` |
| Escalations from `/akili-quick` into this spec | `docs/specs/quick/quick-log.md`, if applicable |
| Drift attributable to this spec | the most recent report in `docs/specs/audits/`, legacy `docs/specs/drift-report.md` as fallback |

**Most recent report** means the highest `Date` header *inside* the report files, ties broken by the newest filename in lexical order — never filesystem mtime, which a checkout destroys. A scaffolded `README.md` or `.gitkeep` is not a report: fall back to legacy `docs/specs/drift-report.md` only when the directory holds **no report file at all**. Both reads are optional — a missing drift source is a blank row, not a blocker.

If every signal is clean (zero rework, no pivots, no product bugs, no severe findings), write a one-line **clean run** entry file in phase 4 and skip phases 2–3. A clean spec teaches nothing new — say so.

### 2. Learn

First load the recurrence inputs: the `## Active Lessons` digest **and** every entry file under `docs/specs/kaizen/`, including their `## Noted, not a lesson` sections. Sub-threshold signals now accumulate in entry files across branches; the digest alone no longer sees them.

Then distill **0 to 3** lessons. Hard rules:

- Every lesson names a **root cause** (apply 5W1H) and cites its evidence — file + section, e.g. `execution.md — Task 4, attempts 1–2 (Violated Rule: design.md#tokens)`. Gemba: real facts only.
- Generic lessons are banned ("write better tests", "be more careful"). A lesson must change what a future command concretely does.
- Prefer **zero lessons** over filler.
- Sub-threshold signals that are not yet lessons go under `## Noted, not a lesson` in the entry file — that section is the recurrence feed for later retrospectives.
- If the same root cause already exists — in the digest or in another entry file, under **either** ID grammar (legacy `KZ-###` or `KZ-<safe-spec-slug>-<n>`) — do not duplicate it. Record a **`digest-update` pending item** instead: `Target` = that `KZ-id`, `Severity` = the raised severity, `Edit` = the digest change (this spec added as a source, plus the recurrence note). A repeat is a strong standardization signal, but it is a digest mutation, so it is recorded here and merged at apply time — never written live to the digest from any branch.
- Classify each lesson's **target**:
  - **Product** (default): the root cause lives in this project — its guides, templates, design tokens, or personas.
  - **Methodology**: the root cause is AKILI itself — an ambiguous command step, a template gap, a missing skill. These lessons make the methodology learn from every tool built with it.
  - **Product + Methodology** (dual): the lesson fixes this project *and* names nothing project-specific — no stack, domain, or local convention (a universal persona rule is the standing example). A generalizable lesson is a template gap in disguise: propose the local edit **and** the upstream. The local edit is applied or recorded pending according to Branch Context (phase 3); the upstream recommendation is recorded in the entry file either way.

### 3. Standardize (branch-gated HITL)

For each lesson, propose **exactly one** minimal edit (1–3 lines) targeting the most durable home:

- root `CLAUDE.md` / `AGENTS.md` (or a child module guide) — behavioral rules
- `docs/specs/general-setup/` templates — spec-authoring rules
- `docs/ux-ui/design.md` — missing tokens or visual rules
- `.agents/` personas — harness-role rules (append-only, never rewrite)
- **Methodology lessons:** no local edit — record the proposal in the entry file and recommend upstreaming it to the AKILI methodology repository.
- **Dual (Product + Methodology) lessons:** both, not either — the local edit follows the branch gate below, *and* the upstream recommendation is recorded in the entry file.

Assign a severity: **High** = caused a HALT, pivot, or PRODUCT_BUG; **Medium** = caused rework or a severe finding; **Low** = friction only.

Then resolve **Branch Context** (Hard Rules). It decides whether each proposed edit is *written* or *recorded*:

| Branch Context | What Standardize does |
|---|---|
| **Spec branch** (or unresolved) | Record every proposed edit as a pending item (`Kind: standardization`, `Status: pending`) with its exact target and verbatim text. **Present the lessons and their proposed edits to the user anyway** — the gate moves the *write*, not the *review* — and say in one line that they await the apply phase on the default branch. No HITL apply menu fires. No shared file is edited: not a persona, guide, template, design doc, TRD, or the digest. |
| **Default branch** | Run the HITL menu below and apply approved edits in this pass (solo fast path — today's behavior), then stamp each item's `Status` in the entry file. |

The menu, on the default branch:

1. **Apply all** — make every proposed edit in this pass
2. **Apply selected** — user picks by lesson ID
3. **Defer all** — record the proposals as `deferred`; they stay in the backlog and are re-offered at every later apply pass
4. **Type something** — adjust a proposal before applying

Recommend option 1 when any High-severity lesson exists, otherwise option 3. Writing the entry file is automatic; **every edit outside the entry file requires this approval** — and on a spec branch no such edit happens at all, approved or not.

Standardize decides; Record writes. On a spec branch the pending items are composed here and land in the entry file in phase 4; on the default branch the edits are applied here and their resulting statuses are stamped into the same entry file in phase 4 — one write, not two.

### 4. Record

Write the retrospective to `docs/specs/kaizen/<safe-spec-slug>.md` — one file per spec, outside the spec folder so it survives archiving:

1. Derive the filename from the spec path with the archive's `$SAFE_NAME` rule (`/` → `--`): `changes/feature-a` → `changes--feature-a.md`. **No date prefix** — the date lives in the entry's Document Control.
2. Re-run detection is an **exact-name existence check** on that path — never a glob. If the file exists (the archive was re-run for the same spec), update it in place; never create a second file for the same spec.
3. Create `docs/specs/kaizen/` if it does not exist. In a legacy project this is the only structural change the retrospective makes.
4. Never prepend to `## Entries` and never touch `## Active Lessons` in `docs/specs/kaizen-log.md` — the apply phase on the default branch is the digest's single writer, and the legacy entries are frozen.

#### The entry file

```markdown
# Kaizen Entry — changes/feature-a

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/feature-a` |
| Date | 2026-08-21 |
| Branch | feat-a |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 8 | tasks.md |
| Reviewer FAIL rework attempts | 3 (Task 4 x2, Task 7 x1) | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 1 (Task 5 — storage approach) | execution.md — ## Pivot Record: Task 5 |
| PRODUCT_BUGs | 1 (resolved) | test-report.md |
| Judgment-day severe findings | 2 | design.md review notes |
| Validation FAIL / WARN | 0 / 2 | validation-report.md |

## Lessons

- **KZ-changes--feature-a-1 — Empty-state tokens were missing from the design phase.** (Product, Medium)
  - Root cause: `design.md` specified list components without empty-state tokens, so the
    Implementer improvised styles and the Reviewer failed Task 4 twice on token compliance.
  - Evidence: execution.md — Task 4, attempts 1–2 (Violated Rule: design.md#tokens).
  - Standardization: → P1

## Noted, not a lesson

- Two validation WARNs on copy tone — below the lesson bar; feeds the recurrence check.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `docs/specs/general-setup/design.md` |
| Edit | Add an empty-state token check to the Design Impact checklist. |
| Severity | Medium |
| Status | pending |
```

A clean run keeps the same shape with the Metrics table and a one-line statement in place of `## Lessons`.

**Lesson IDs** are `KZ-<safe-spec-slug>-<n>` — the same `$SAFE_NAME` slug as the filename, so the ID is legal in the digest's ID column and in inline citations. The global `KZ-###` counter is retired for new lessons; existing `KZ-###` IDs are never renumbered and stay valid targets for recurrence.

**`Kind` values** — one schema covers every write a spec branch defers:

| Kind | Origin |
|---|---|
| `standardization` | A lesson's proposed edit (phase 3) |
| `digest-update` | A recurrence of an existing lesson (phase 2) — `Target` is the `KZ-id`, not a file |
| `guide-sync` | `/akili-archive`'s agent-guide sync, deferred from a spec branch |
| `factual-sweep` | `/akili-archive`'s factual-claims sweep, deferred from a spec branch |
| `trd-adr` | `/akili-archive`'s TRD & ADR sync — the superseding decision text, carrying **no ADR number** (numbers are allocated at apply time) |

**`Status` values:**

| Status | Meaning |
|---|---|
| `pending` | Awaiting an apply pass — the default on a spec branch |
| `applied (date)` | Written by an apply menu, with the date it was applied |
| `rejected (reason)` | Declined by the user; the reason is recorded so it is not blindly re-proposed |
| `deferred` | The user chose **Defer** in an apply menu (solo fast path included): the item stays in the backlog, keeps being counted by `/akili-resume`, and is re-offered at every later apply pass. Deferral is a visible postponement, never a terminal state |

## Apply Mode — Working the Pending Backlog

Runs **only on the default branch** (Branch Context). Invocation: *"apply pending kaizen standardizations"* (also "kaizen apply", "aplicar estandarizaciones kaizen"); `/akili-archive` offers it automatically when its own retrospective ran on the default branch, and `/akili-resume` recommends it. Input: every pending item in every entry file — not one spec's. Output: HITL-approved edits, a refreshed digest, and stamped statuses.

1. **Collect.** Scan `docs/specs/kaizen/*.md` for items whose `Status` is `pending` or `deferred`. Process them in **entry-filename lexical order** — one deterministic order, so the same backlog yields the same result on any run. If there is nothing to apply, say so in one line and stop.

2. **Group by `Target`** — a file path, or a `KZ-id` for `digest-update` items. Three outcomes, in this order:

   | Case | Rule |
   |---|---|
   | `digest-update` items on the same `KZ-id` | **Merge**, never prompt: the highest proposed severity wins, source specs union, one digest row updated. Two branches hitting the same root cause is the expected case, not a conflict |
   | Byte-identical `Edit` text targeting the same file | **Dedupe**: apply once; every contributing item flips to `applied` citing that single application |
   | Differing `Edit` text targeting the same file | **Decide**: quote both proposals side by side with their source entry files and let the user choose. Never apply both silently; never auto-pick a winner |

3. **Present the HITL menu** over the grouped items — the same four options as the Standardize phase (Apply all / Apply selected / Defer / adjust).

4. **Apply what was approved**, per `Kind`:
   - `standardization`, `guide-sync`, `factual-sweep` — write the recorded 1–3 lines to the recorded target.
   - `trd-adr` — allocate the next free `ADR-MMM` **at this moment**, sequentially in the processing order above, append the decision to `docs/trd/trd.md`, and flip the ADR it supersedes to `superseded by ADR-MMM`. If `docs/trd/trd.md` does not exist, leave the item `pending`, add a one-line note in the item block saying why, and move on — never invent the file.
   - `digest-update` — handled in step 5.

5. **Refresh the digest in the same pass.** This step is the `## Active Lessons` table's only writer:
   1. Apply the merged `digest-update` items first (severity raises, added source specs, recurrence notes).
   2. Then add a row for each newly applied lesson.
   3. Keep the table at **10 rows or fewer**. If it would exceed 10, retire `Applied` rows — the ones institutionalized longest first. Never retire a `Deferred` row or a row still linked to a pending item.
   4. If `docs/specs/kaizen-log.md` does not exist, create it with the header and the digest section only.
   5. If it still carries a populated legacy `## Entries` section without the freeze note, add the freeze note (below) on this first apply pass. Historical entries are never rewritten, renumbered, or deleted.

6. **Stamp statuses** back into each source entry file: `applied (date)`, `rejected (reason)`, or `deferred`. Nothing is silently dropped — a declined menu leaves every item `pending`, and the backlog is re-offered next pass.

## Kaizen Log Format

`docs/specs/kaizen-log.md` holds one live section: the `## Active Lessons` digest — same path, same columns, same semantics as before, and still the only kaizen content other AKILI commands read. Its single writer is Apply Mode. Per-retrospective content lives in the entry file (phase 4), not here.

```markdown
# Kaizen Log

Continuous-improvement record for this project. The `## Active Lessons` digest below is
refreshed only by the `kaizen` skill's Apply Mode, on the default branch. Other AKILI
commands read only this table — keep it at 10 rows or fewer. Per-retrospective entries
live in `docs/specs/kaizen/`, one file per spec.

## Active Lessons

| ID | Lesson | Source Spec | Severity | Target | Standardized In | Status |
|---|---|---|---|---|---|---|
| KZ-changes--add-remember-me-1 | Define empty-state design tokens before any UI task that renders lists | changes/add-remember-me | Medium | Product | docs/specs/general-setup/design.md | Applied |
| KZ-002 | DTO boundary validations must be written as `AND IT MUST` constraints in requirements, never left implicit | bugfix/login-redirect | High | Product | docs/specs/general-setup/requirements.md | Applied |

## Entries

> **Frozen.** The entries below are historical. New retrospectives write one file per spec
> under `docs/specs/kaizen/`. Nothing here is rewritten, renumbered, or deleted.

### 2026-07-20 — changes/add-remember-me

<!-- historical entry, left exactly as written -->
```

Both ID grammars coexist in the digest: legacy `KZ-###` rows keep their IDs, new rows carry `KZ-<safe-spec-slug>-<n>`.

## Hard Rules

### Branch Context

Every write decision in this skill turns on one question: **is the checked-out branch the default branch?** Resolve it once per run and refer to the answer by name ("Branch Context") everywhere else. Plain `git` only — no host-specific API.

1. **Current branch:** `git rev-parse --abbrev-ref HEAD`.
2. **Default branch — the pin first.** The `Default Branch:` line in the constitution summary of the root `AGENTS.md` / `CLAUDE.md`. `/akili-constitution` writes it, and every command already loads those files, so in a pinned project the resolution ends here.
3. **No pin (legacy projects):** `git symbolic-ref refs/remotes/origin/HEAD --short`, stripping the leading `origin/`. This ref is unset in many clones until someone runs `git remote set-head origin --auto` — an error here is normal, not exceptional; fall through quietly.
4. **Still unresolved — the unique `main`/`master` rule.** Among local and `origin/` branches, if exactly one of `main` or `master` exists, that is the default branch. If **both** exist, the result is *unresolved* — never guess.

`git config init.defaultBranch` is **never consulted** at any step: it describes the name *newly created* repositories get, not the branch this repository integrates into, so it resolves the wrong branch silently.

**On unresolved or failure** — both `main` and `master` present, detached HEAD, no git repository — **treat the context as a spec branch and defer**: deferring is always safe, applying is not. Say so in one line and name the remedy — pin `Default Branch: <name>` in the constitution summary.

### Writable set

| Branch Context | What this skill may write |
|---|---|
| Spec branch (or unresolved) | The spec's own entry file `docs/specs/kaizen/<safe-spec-slug>.md` — nothing else. No persona, guide, template, design doc, TRD, or digest |
| Default branch | The above, plus HITL-approved shared files and the digest, through the Standardize menu or Apply Mode |

### Standing rules

- **Never block the archive** (or any invoking command). Missing inputs or a declined menu → write a metrics-only or clean-run **entry file** and continue. The fallback write target is always the entry file, never the log.
- **The digest has one writer:** Apply Mode, on the default branch. No retrospective phase writes `## Active Lessons` on any branch for any reason — recurrence included; it becomes a `digest-update` pending item.
- **Never edit a shared file without explicit HITL approval** — and never from a spec branch, approval or not.
- Legacy `## Entries` are **frozen**: read them as history, never rewrite, renumber, or delete them. There is no migration step.
- Digest capped at **10 Active Lessons**; retire institutionalized lessons instead of letting the table grow.
- At most **3 lessons per retrospective**; prefer zero over filler.
- Standardization edits are **1–3 lines**; never rewrite whole documents.
- Consumers (`/akili-propose`, `/akili-specify`, `/akili-execute`, `/akili-resume`) read **only** the `## Active Lessons` digest for lesson content, never `## Entries` and never entry files. The single addition: `/akili-resume` counts pending items under `docs/specs/kaizen/` for its dashboard footer — a read-only count, not a lesson read.
