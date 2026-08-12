# Design: Spec Family Ordering (Parent→Child Control)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/spec-family-ordering` |
| Depth | Standard |
| Type | Change |
| Approval Mode | gated |
| Status | Draft — Phase 2 |
| Date | 2026-08-12 |
| Requirements | `requirements.md` (FR-1…FR-7, NFR-1…NFR-4) |

## 2. Executive Summary

`family.md` is a **file-based state record with exactly one writer per transition**: `/akili-propose` (or `/akili-specify` chunking) creates it, `/akili-archive` flips rows to `done`, `/akili-resume` only reads, `/akili-audit` flags drift. The schema is defined once — in `/akili-constitution` Step 7 as a fourth runtime-authored general-setup template — and every other surface references that definition (NFR-3). All edits are prose in six existing files plus five mirrors and CHANGELOG; no installer, hooks, or packaged files change (NFR-2).

## 3. Architecture Overview

**Ownership matrix — each command owns exactly one manifest transition** (the proposal's Option A mitigation, made explicit):

| Command | Manifest interaction | Transition owned |
|---|---|---|
| `/akili-propose` (Scope Chunking + Greenfield) | **Create** — writes `family.md` before child folders exist; seeds order/deps/parallel-safety; adds rows only via HITL edit | `∅ → pending` (FR-2) |
| `/akili-specify` (chunking path) | **Create** (same contract, when the split happens here); otherwise **read** parent manifest when targeting a child | `∅ → pending` / read (FR-3) |
| `/akili-execute` | none — untouched surface; a child's `active` state is observable from its own `execution.md` | — |
| `/akili-archive` | **Update** — flips the archived child's row; **gates** parent archive | `* → done` (FR-5) |
| `/akili-resume` | **Read-only** — manifest before flat scan; drift reported, never repaired | — (FR-4) |
| `/akili-audit` | **Read-only** — manifest↔folder drift check (already in its charter as drift auditing; one line added at most) | — |

`Status: active` / `blocked` are set by the user or during manifest HITL edits, not by an automated writer — no command claims that transition, which keeps the writer set minimal. Resume *derives* effective activity from child artifacts (`execution.md` present, tasks open) and reports mismatch with the manifest as drift rather than resolving it (KZ-002: aggregate claims are grep-falsified, not trusted).

## 4. Extended Directory Structure

```
docs/specs/<family-parent>/
├── proposal.md          # the epic-level proposal that got split
├── family.md            # NEW — ordered, closed child manifest
docs/specs/<family-parent>/<child-a>/
├── proposal.md          # Document Control gains: Parent Spec: <family-parent>
└── …
docs/specs/general-setup/family.md   # target projects only — runtime-authored by /akili-constitution Step 7
```

Flat specs (no split) gain nothing — absence of `family.md` is the "not a family" signal (NFR-1).

## 5. Data Model — `family.md` schema (canonical, defined once in constitution Step 7)

**Document Control block:** parent spec path, date created, last updated, status of the family (`open` / `complete`).

**Child table columns:**

| Column | Values | Semantics |
|---|---|---|
| `#` | 1..n | Build order (RICE/MoSCoW result from chunking) — the order resume recommends by |
| `Spec Path` | `<family>/<child>` | Must correspond to a real folder (KZ-002 check in resume/audit) |
| `Depends on` | spec path(s) \| `none` | Serial ordering constraint; archive-gates nothing, resume-warns |
| `Parallel-safe` | `yes` / `no` | Fleet eligibility (consumed by `docs/flow.md`, decided at decomposition time) |
| `Status` | `pending` / `active` / `done` / `blocked` | Small vocabulary — phase detail lives in the child's own documents (proposal open question resolved) |

**Closed-set rule (stated inside the template itself):** the table is the exhaustive child set; no AKILI command creates a child folder without a prior row; adding a row is a HITL-approved manifest edit.

## 6. API Design

N/A — no runtime API. The "interface" is the schema above plus the per-command prose contracts in §7.

## 7. Surface Edit Design (per-command)

| # | Surface | Anchor | Edit (conceptual) | FR |
|---|---|---|---|---|
| 1 | `.claude/commands/akili-constitution.md` | Step 7 list `:303-305`; enumerations `:37`, `:49-51`, `:325`, `:851` | 4th template item defining the §5 schema + closed-set rule; add `family.md` to each enumeration of the general-setup set. All new prose says "spec family" (model-family collision) | FR-1 |
| 2 | `.claude/commands/akili-propose.md` | Scope Chunking `:140-144`; Greenfield `:107`; DC structure `:152` | Manifest write inserted before folder creation (`:144`); `Parent Spec:` DC row for children; closed-set + late-addition HITL rule; existing `:143` `Depends on`/`Parallel-safe` bullet now also feeds the manifest (manifest = aggregate authority) | FR-2 |
| 3 | `.claude/commands/akili-specify.md` | Step 1.1 `:113-115`; Step 0; general-setup enumeration `:85` | Chunking bullet gains the same manifest contract (fixes the existing asymmetry — specify today records no deps at all); Step 0 reads parent manifest when the target is a manifest-listed child, warns on unmet deps; `:85` enumeration gains `family.md` | FR-3 |
| 4 | `.claude/commands/akili-resume.md` | Step 0 `:29`; Step 2 `:67-91`; Step 4 `:106-115`; Error Handling `:132` | New scan item before the flat listing: read every `family.md` first. Dashboard: family-grouped block (mirrors the Kaizen-footer conditional-augmentation pattern at `:87`). Step 4: when families exist, next command targets the next non-`done` child with satisfied deps, by manifest order. `:132` qualified for manifest-listed `pending` children. Output contract (`:117-119`, read-only) unchanged | FR-4 |
| 5 | `.claude/commands/akili-archive.md` | Step 1 `:89-95`; Step 3 `:122-134`; Step 6 `:168-174`; Error Handling `:183`, `:186` | New readiness bullet: parent archive requires all child rows `done` (existing `:97` stop-and-ask is the override path). New Step 3 item (before the Step 5 move): flip the child's row — precedent is the `:129` Module Guides index refresh and `:133` ADR status flip. Step 6 report line. `:186` carve-out (see DD-5) | FR-5 |
| 6 | `docs/flow.md` | Fleet precondition 1 `:249-251`; waves `:267`; general-setup table `:145` | Precondition reads independence/order from `family.md` ("decided at decomposition time and persisted in `family.md`" — reconciles the `specify time` vs propose-time wording mismatch with `akili-propose.md:143`); wave selection cites manifest order; `:145` table row mentions `family.md` | FR-6 |
| 7 | `docs/commands/akili-{propose,specify,resume,archive,constitution}.md` | Each mirror's relevant summary section | One summary-level mention each, consistent with command text (mirrors are hand-written summaries; no sync script) | FR-7 |
| 8 | `CHANGELOG.md` | `Unreleased` | One entry, classified **minor** | FR-7 |

## 8. Frontend / UX Component Architecture

N/A — no UI surface. The dashboard change in resume is terminal text (family-grouped block with order and blocked-by, modeled on the existing multi-spec fenced example).

## 9. Shared Contracts

The §5 schema is the single shared contract. Rule for every consuming surface (NFR-3): **reference or excerpt, never restate** — propose/specify/resume/archive/flow name the columns they consume but point to the constitution template as the definition. Divergent restatement is the defect class gated by the schema-divergence grep in `requirements.md` §8.

## 10. Design Decisions

| ID | Decision | Alternatives rejected | Rationale |
|---|---|---|---|
| DD-1 | Manifest lives in the parent spec folder (proposal Option A) | B: per-child fields only (no closure, no aggregate); C: global backlog index (oversized, contention) | Smallest artifact fixing order + closure + session-independence at once; approved in proposal |
| DD-2 | Template = runtime-authored prose in constitution Step 7, **not** a packaged file | Shipping `.claude/templates/family.md` + new installer constant wired into install/doctor/listing | Implementation discovery: general-setup templates are authored at runtime; packaged route would require a new `bin/akili.js` manifest constant, violating NFR-2 for zero benefit |
| DD-3 | Status vocabulary `pending/active/done/blocked` | Reusing phase names (PROPOSE/SPECIFY/…) | Phase detail already lives in each child; duplicate state invites drift (proposal open question, resolved as leaned) |
| DD-4 | One writer per transition; `active`/`blocked` are HITL-set, not command-set | Resume auto-updating statuses during scan | Preserves resume's read-only Output contract; fewer writers = fewer drift sources. KZ-002 applied: resume verifies listed folders exist and reports drift instead of trusting or repairing the table |
| DD-5 | Narrow carve-out in archive `:186`: Step 3 may edit **only the archived child's row** in the parent `family.md` | Rewriting the write-constraint rule; treating the flip as a Step 4.3 HITL approval each time | The rule's intent (no uncontrolled edits outside the spec folder) survives; a per-archive HITL prompt for a deterministic one-cell flip is ceremony without protection |
| DD-6 | flow.md wording becomes "decided at decomposition time, persisted in `family.md`" | Leaving "decided at specify time" | Current text and `akili-propose.md:143` point at each other with no persisted artifact — the exact circular reference the manifest closes |

### Reversion challenges (Step 2.3 — both delivered behaviors being conditioned)

| Reverted behavior | Challenge: "what does removing this break?" | Outcome |
|---|---|---|
| Resume `:132` unconditional "run `/akili-specify <spec-path>`" for file-less folders | An orphan/broken folder **not listed in any manifest** would lose its recovery nudge | **Addressed:** the qualification applies only to manifest-listed `pending` children; unlisted folders keep the existing suggestion verbatim. Nothing breaks |
| Archive `:186` absolute "never edit files outside `kaizen-log.md`" | Widening the carve-out could license agent overreach on other files or other manifest cells during archive | **Addressed:** DD-5 scopes it to the archived child's row in the parent `family.md`, named explicitly in the amended bullet. The absolute rule stands for everything else |

## 11. Budget (Step 2.4 — sized against this design)

| Metric | Estimate |
|---|---|
| Expected tasks | 6 |
| Expected LOC | ~110–150 added lines (all markdown prose, across 13 files) |
| Expected review rounds | 1 |

Depth re-check: matches **Standard** — 7 FRs across 6 command/doc surfaces plus mirrors is above Lite, and there is no code/data/auth risk that would demand Full. No depth change proposed.
