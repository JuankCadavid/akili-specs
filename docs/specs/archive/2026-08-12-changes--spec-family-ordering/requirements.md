# Requirements: Spec Family Ordering (Parent→Child Control)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/spec-family-ordering` |
| Depth | Standard |
| Type | Change |
| Approval Mode | gated |
| Status | Draft — Phase 1 |
| Date | 2026-08-12 |
| Proposal | `proposal.md` (Option A — family manifest in the parent folder) |

## 2. Executive Summary

When a large proposal is split into child specs, the decomposition's order, membership, and state currently live only in scattered per-child fields and in conversation memory — which `/clear` destroys. This spec adds a **`family.md` manifest** in the parent folder as the single durable source of truth (ordered, closed child set with status/dependencies/parallel-safety), makes `/akili-propose` and `/akili-specify` write it at decomposition time, `/akili-resume` read it before its flat scan, `/akili-archive` update it on child archive and gate parent archive on it, and `docs/flow.md`'s fleet section consume it. Guidance-only: command text + one runtime-authored template; no installer, hook, or new-command changes.

**Implementation discovery vs proposal:** the proposal's scope table placed the template at `docs/specs/general-setup/family.md` as if it were a shipped file. General-setup templates are **authored at runtime by `/akili-constitution` Step 7**, not packaged — so the template is defined as prose in `akili-constitution.md` (4th template item) and its collateral enumerations. This keeps the proposal's "no installer change" non-goal intact.

## 3. Glossary

| Term | Meaning |
|---|---|
| **Spec family** | A parent spec folder plus the child spec folders produced when its scope was chunked. Qualified as "spec family" everywhere — bare "family" already means *model family* in `akili-constitution.md` and `docs/model-routing.md`. |
| **Family manifest (`family.md`)** | File in the parent spec folder: Document Control + ordered child table. Single source of truth for membership, order, and status. |
| **Closed set** | The manifest's child list is exhaustive. No AKILI command creates a child spec folder under a family without a prior manifest row; adding a row is a HITL-approved manifest edit. |
| **Terminal status** | A child manifest status of `done` (archived) — the only status that permits archiving the parent. |
| **Flat spec** | A spec with no family manifest. Absence of `family.md` means "not a family"; zero new obligations apply. |

## 4. System Context & Scope

### Edited surfaces

| # | Surface | Change class |
|---|---|---|
| 1 | `.claude/commands/akili-constitution.md` | `family.md` template definition (Step 7 4th item) + collateral enumerations (`:37`, `:49-51`, `:325`, `:851`) |
| 2 | `.claude/commands/akili-propose.md` | Scope Chunking (Step 1.1, `:140-144`) writes the manifest; child DC gains `Parent Spec:`; closed-set rule |
| 3 | `.claude/commands/akili-specify.md` | Step 1.1 Scope Chunking mirrors the manifest contract; specify-on-a-child reads the parent manifest; general-setup enumeration at `:85` gains `family.md` |
| 4 | `.claude/commands/akili-resume.md` | Step 0 manifest read before flat scan; family-grouped dashboard; manifest-order next recommendation; error-handling `:132` qualified |
| 5 | `.claude/commands/akili-archive.md` | Step 1 readiness gate (parent blocked while children non-terminal); Step 3 manifest row flip; `:186` write-constraint carve-out |
| 6 | `docs/flow.md` | Fleet preconditions (`:249-251`) read independence and order from the manifest; general-setup table row at `:145` |
| 7 | `docs/commands/akili-propose.md`, `akili-specify.md`, `akili-resume.md`, `akili-archive.md`, `akili-constitution.md` | Mirror summaries updated (hand-maintained; no sync script exists) |
| 8 | `CHANGELOG.md` | `Unreleased` entry, classified **minor** (new methodology behavior) |

### Out of scope (from proposal Non-Goals, unchanged)

No new command; no installer/hook/`bin/akili.js` change; no retroactive migration of archived specs; no cross-repo family support.

## 5. Stakeholders / Personas

| Persona | Stake |
|---|---|
| AKILI user splitting an epic | Order and membership survive `/clear`; resume presents the family correctly |
| `/akili-resume` agent session | Reconstructs control from files, never invents activities |
| Fleet coordinator (`docs/flow.md`) | Reads `Parallel-safe` / order from one artifact instead of re-deriving |
| This repo's maintainer | Mirrors and CHANGELOG stay consistent; no installer churn |

## 6. Functional Requirements

### FR-1: `family.md` manifest template (constitution-defined)

`.claude/commands/akili-constitution.md` Step 7 SHALL define `family.md` as a fourth general-setup template: Document Control (parent spec path, date, status) plus an **ordered child table** with columns `#`, `Spec Path`, `Depends on`, `Parallel-safe`, `Status`, followed by the **closed-set rule** stated in the template itself. The status vocabulary SHALL be the small set `pending / active / done / blocked` (phase detail lives in each child's own documents).

#### Scenario: Template scaffolded into a target project

- GIVEN a project running `/akili-constitution`
- WHEN Step 7 creates the general-setup templates
- THEN `docs/specs/general-setup/family.md` is authored alongside `requirements.md`, `design.md`, `task.md`
- AND every enumeration of the general-setup set in `akili-constitution.md` (`:37`, `:49-51`, `:325`, `:851`), `akili-specify.md:85`, and `docs/flow.md:145` includes it
- BUT it must NOT be added as a packaged file or to any `bin/akili.js` manifest constant
- AND IT MUST use the qualified term "spec family" in any prose added to `akili-constitution.md` (model-family collision)

### FR-2: Manifest written at decomposition time (`/akili-propose`)

`/akili-propose` Scope Chunking (Step 1.1) SHALL, upon user agreement to split, write `family.md` in the parent folder **before** creating child folders, seeded with the agreed order (RICE/MoSCoW result), `Depends on`, and `Parallel-safe` per child. Each child proposal's Document Control SHALL gain a **`Parent Spec: <family-path>`** row. The Greenfield track (which invokes the same chunking mechanics) inherits this duty.

#### Scenario: Epic split into three children

- GIVEN a proposal the user agrees to split into three chunks
- WHEN the folders are created
- THEN the parent folder contains `family.md` listing exactly those three children in build order with `Depends on` / `Parallel-safe` / `Status: pending`
- AND each child `proposal.md` Document Control contains `Parent Spec:` pointing at the parent
- BUT it must NOT create any child folder that lacks a manifest row (closed set)
- AND IT MUST keep recording `Depends on:` / `Parallel-safe:` per child proposal (existing `:143` behavior), with the manifest as the aggregate authority when they disagree

#### Scenario: Late child addition

- GIVEN an existing family manifest with a closed child set
- WHEN new work surfaces that belongs to the family
- THEN the command first proposes a manifest edit (new row, position in order) and obtains HITL approval
- BUT it must NOT create the child folder before the approved row exists

### FR-3: `/akili-specify` mirrors the contract and reads it back

`/akili-specify` Step 1.1 Scope Chunking SHALL carry the same manifest-write duty and closed-set rule as FR-2 (today it has no `Depends on:`/`Parallel-safe:` bullet at all — an existing asymmetry with propose). When `/akili-specify` targets a child listed in a family manifest, Step 0 SHALL read the parent `family.md` (and flag if the child's dependencies are not `done`).

#### Scenario: Specify on a child after `/clear`

- GIVEN a fresh session and `/akili-specify` on a manifest-listed child
- WHEN Step 0 loads context
- THEN the parent manifest is read and the child's position, dependencies, and status inform the spec
- AND IT MUST warn (not block) when a `Depends on` child is not `done`
- BUT it must NOT create sibling spec folders outside the manifest's closed set

### FR-4: `/akili-resume` reconstructs family control from the manifest

`/akili-resume` SHALL read `family.md` manifests **before** the flat directory scan (new item ahead of Step 0's current list), group the dashboard by family with manifest order and blocked-by information, and recommend the next child **by manifest order** in Step 4 — never by folder-discovery order. Error handling line `:132` SHALL be qualified: a child folder with no readable files that is listed in a manifest as `pending` is reported as **"pending by family order"**, not met with an unconditional "run `/akili-specify <spec-path>`".

#### Scenario: Resume after `/clear` on a split family

- GIVEN a project with family `bilateral/` (three children, manifest order 1→2→3, child 1 `done`)
- WHEN `/akili-resume` runs in a fresh session
- THEN the dashboard groups the three children under the family with their order and statuses
- AND the next-command recommendation targets child 2 (next non-done, dependencies satisfied)
- BUT it must NOT recommend creating or specifying any activity absent from the manifest
- AND IT MUST verify each manifest-listed folder actually exists (KZ-002: aggregate claims are grep-falsified, not trusted) and report any manifest↔folder mismatch as drift instead of silently reconciling
- AND IT MUST remain read-only (the command's Output contract: "No files are created or modified")

### FR-5: `/akili-archive` maintains the manifest and gates the parent

`/akili-archive` SHALL: (a) in Step 3 (Constitution & Graph Sync, before the folder move), flip the archived child's manifest row to `done`; (b) in Step 1 (Archive Readiness), block archiving a **parent** while any child row is non-terminal, with a clear message and the existing stop-and-ask escape hatch; (c) amend the `:186` write-constraint bullet ("Never edit files outside `kaizen-log.md`…") with an explicit carve-out for the parent `family.md` row flip — otherwise (a) contradicts a standing rule.

#### Scenario: Archiving a child

- GIVEN a manifest-listed child that passes archive readiness
- WHEN `/akili-archive` runs Step 3
- THEN the parent `family.md` row for that child flips to `done` before the folder moves to `archive/`
- AND Step 6's report mentions the manifest update

#### Scenario: Archiving the parent too early

- GIVEN a family with any child row not `done`
- WHEN `/akili-archive` targets the parent
- THEN readiness fails with a message naming the non-terminal children
- BUT it must NOT move the parent folder
- AND IT MUST still allow the user to explicitly override via the existing stop-and-ask path

### FR-6: Fleet consumes the manifest (`docs/flow.md`)

The *Multi-Spec Parallel Execution* preconditions SHALL read spec-level independence and serial-merge order **from the family manifest** (`Parallel-safe`, `Depends on`, order) instead of re-deriving them, and the section's "decided at specify time" wording SHALL be reconciled with propose-time chunking (decided at decomposition time, wherever the split happens, and **persisted in `family.md`**).

#### Scenario: Coordinator dispatches a wave

- GIVEN a family manifest with `Parallel-safe: yes` children
- WHEN the coordinator selects the next wave
- THEN eligibility and merge order come from the manifest
- BUT it must NOT re-derive independence at dispatch time

### FR-7: Documentation closure

The change SHALL update the five hand-maintained mirrors (`docs/commands/akili-propose.md`, `akili-specify.md`, `akili-resume.md`, `akili-archive.md`, `akili-constitution.md`) with summary-level mentions consistent with the command text, and add a `CHANGELOG.md` `Unreleased` entry classified **minor**.

## 7. Non-Functional Requirements

- **NFR-1 (Zero flat-spec overhead):** `family.md` exists only when a decomposition happens. No command SHALL require it, mention it as missing, or add steps for flat specs. Absence = flat spec.
- **NFR-2 (Guidance-only):** no edits to `bin/akili.js`, hooks, installers, or packaged file manifests. The template is runtime-authored prose (FR-1).
- **NFR-3 (Single canonical contract):** the manifest's table schema and status vocabulary are defined **once** (constitution Step 7 template); every other surface references or excerpts it. Two independently-worded schemas is the defect, not a style choice.
- **NFR-4 (Bounded size):** guidance text across all surfaces; target ≤ ~120 added lines total (multi-surface Standard change; final budget set in `design.md`).

## 8. Defect Classes → Gates

| Defect class | Gate |
|---|---|
| **Stale enumeration / missed mirror** (the CS-2 class: a closed list somewhere doesn't gain `family.md`) | `grep -rn "family.md" .claude/commands/ docs/` → expected-hit checklist per surface (exact count fixed in `tasks.md`); every general-setup enumeration found by the scout must hit |
| **Contradictory standing rules** (e.g. archive `:186` still forbids the Step 3 manifest write; resume Output contract vs new behavior) | grep the amended bullets + human read of both rule sites at the HITL gate — no automated check can judge semantic contradiction; substituted per this table |
| **Schema divergence** (propose and specify describe different manifest tables) | grep the column list (`Depends on`, `Parallel-safe`, `Status`) in both commands; NFR-3 requires reference-not-restate |
| **Prose that agents cannot execute** (rule text present but procedure ambiguous — the "presence ≠ behavior" class) | No automated harness exists for LLM command-following. Substitute: HITL walkthrough of the FR-4 resume scenario against the final text at the Phase 3 gate; optional `judgment-day` review. Residual risk **accepted and recorded**: real proof arrives only when a project exercises a split. |
| **Model-family naming collision** in `akili-constitution.md` | `grep -n "family" .claude/commands/akili-constitution.md` — every new hit reads "spec family" or `family.md` |

## 9. Requirement ID Index

| ID | Name | Priority |
|---|---|---|
| FR-1 | `family.md` template (constitution-defined) | MUST |
| FR-2 | Manifest write at propose-time chunking + `Parent Spec:` | MUST |
| FR-3 | Specify mirrors contract + reads parent manifest | MUST |
| FR-4 | Resume family-aware scan, dashboard, order-based recommendation | MUST |
| FR-5 | Archive row flip + parent gate + `:186` carve-out | MUST |
| FR-6 | Fleet consumes manifest | MUST |
| FR-7 | Mirrors + CHANGELOG closure | MUST |
| NFR-1 | Zero flat-spec overhead | MUST |
| NFR-2 | Guidance-only | MUST |
| NFR-3 | Single canonical schema | MUST |
| NFR-4 | Bounded size | SHOULD |
