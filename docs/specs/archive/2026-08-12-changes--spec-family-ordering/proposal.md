# Proposal: Spec Family Ordering (Parent→Child Control)

## 1. Document Control

| Field | Value |
|---|---|
| Type | Change |
| Spec Path | `changes/spec-family-ordering` |
| Slug | `spec-family-ordering` — derived from free-text argument ("spec family ordering — control padre→hijas…") |
| Approval Mode | gated |
| Status | Draft — awaiting approval |
| Date | 2026-08-12 |
| Author | Juan Carlos Cadavid (intent) / agent (draft) |

## 2. Intent

When a large proposal is split into child specs in subfolders, give the methodology a **durable, session-independent record of the family**: which children exist (a closed set), in what order they execute, and where each one stands — so `/akili-resume` and `/akili-specify` reconstruct control after a `/clear` instead of losing the order or inventing new activities.

## 3. Problem / Current Behavior

- **Field case (STAR, statistics-module revamp):** family `bilateral/` with children `mapping-adjustments`, `primary-contributing-sp`, `toc-optional-mapping`. After `/clear`, the session lost parent→child execution order and at times created new activities that were never part of the decomposition.
- The decomposition state today lives only in two places, both insufficient:
  - Per-child `Depends on:` / `Parallel-safe:` fields (`/akili-propose` Step 1.1) — scattered across children, no aggregate view, and nothing marks the set as **closed**.
  - The session's conversation memory — destroyed by `/clear` by design.
- `/akili-resume` scans `docs/specs/` **flat** (Step 0: "List all directories"), treats every folder as an independent spec, and has no dependency or parent awareness. Its error handling actively worsens the failure: a child folder that looks incomplete gets "suggest running `/akili-specify <spec-path>`" — the exact path that re-derives (invents) scope.
- `/akili-specify` Scope Chunking creates the child folders but records no parent-level manifest and imposes no rule against creating chunks outside the agreed set later.

## 4. Proposed Outcome

- A **family manifest** (`family.md`) in the parent folder is the single source of truth for the decomposition: ordered child table with status, dependencies, and parallel-safety. The child set is **closed** — no command creates a child outside it without a HITL-approved manifest edit first.
- Each child's Document Control carries **`Parent Spec: <family-path>`** (bidirectional traceability).
- `/akili-resume` reads manifests **before** the flat scan, groups the dashboard by family, and recommends the next child **by manifest order**, never by folder discovery.
- `/akili-specify` and `/akili-propose` chunking write the manifest at decomposition time; `/akili-archive` updates the child's manifest row on archive; `/akili-audit` flags manifest↔folder drift.
- Guidance-only: command text + one template. No installer change, no new command, no hooks.

## 5. Scope

| Surface | Change |
|---|---|
| `docs/specs/general-setup/` | New `family.md` template (Document Control + ordered child table: `#`, spec path, `Depends on`, `Parallel-safe`, `Status`, plus the closed-set rule) |
| `.claude/commands/akili-propose.md` | Scope Chunking writes `family.md` at split time; each child proposal gets `Parent Spec:`; new children require manifest edit + HITL |
| `.claude/commands/akili-specify.md` | Step 1.1 Scope Chunking mirrors the same manifest contract; specify on a child starts by reading the parent manifest |
| `.claude/commands/akili-resume.md` | Step 0 reads `family.md` first; dashboard groups by family with order/blocked-by; error handling stops suggesting `/akili-specify` for manifest-listed children pending by order |
| `.claude/commands/akili-archive.md` | On archiving a child, flip its manifest row status; archiving the parent requires all children terminal |
| `docs/flow.md` | Fleet section consumes `Parallel-safe` from the manifest instead of re-deriving independence |
| `CHANGELOG.md` + docs mirrors | Closure entries for the touched command mirrors |

## 6. Non-Goals

- No new command (`/akili-family` etc.) — the manifest is consumed by existing commands.
- No installer, hook, or `bin/akili.js` change.
- No retroactive migration of existing archived specs.
- No cross-repo/multi-project family support.

## 7. Affected Users, Systems, And Specs

- Every AKILI project that splits an epic into child specs (STAR is the motivating case).
- Commands: `akili-propose`, `akili-specify`, `akili-resume`, `akili-archive`, plus `docs/flow.md` and mirrors.
- Related shipped work: `changes/goal-driven-execution` (archived 2026-08-12) — unattended `/goal` runs make session-independent ordering **more** critical, since no human is watching to correct a wrong next-spec choice.

## 8. Visual Reference

- Source: None
- Location: n/a
- Notes: methodology/docs-only change; no UI surface.

## 9. Requirement Delta Preview

### ADDED Requirements

- `family.md` manifest template and its closed-set rule.
- `Parent Spec:` field in child Document Control.
- `/akili-resume` family-aware scan, grouped dashboard, and order-based next-command recommendation.
- Manifest write duty in `/akili-propose` + `/akili-specify` chunking; manifest update duty in `/akili-archive`.

### MODIFIED Requirements

- `/akili-resume` error handling: an incomplete-looking child listed in a manifest is "pending by order", not "run `/akili-specify`".
- `docs/flow.md` fleet preconditions: independence read from the manifest.

### REMOVED Requirements

- None.

## 10. Approach Options

| Option | Description | Trade-off |
|---|---|---|
| **A — Family manifest in the parent folder (recommended)** | `family.md` as closed-set, ordered source of truth; children point back via `Parent Spec:` | One new artifact to keep in sync (mitigated: each command owns exactly one transition of it) |
| B — Enrich child Document Control only | `Parent Spec:` + `Depends on:` per child, no manifest; resume reconstructs by scanning all children | No closed set — the invented-activities failure survives; reconstruction cost every resume; aggregate state still lives nowhere |
| C — Global `docs/specs/backlog.md` index of all specs | One index for everything | Oversized for the problem; single contention point across unrelated specs; duplicates per-spec state at repo scale |

## 11. Recommended Approach

**Option A.** It is the smallest artifact that fixes all three observed failures at once: order (the table is ordered), closure (the set is declared, so new children require an approved manifest edit), and session-independence (the manifest is a file, so `/clear` destroys nothing). Options B/C each leave at least one failure standing.

## 12. Risks, Dependencies, And Open Questions

- **Manifest↔folder drift** is the new failure mode this introduces; mitigated by `/akili-audit` drift check and by KZ-002 (aggregate claims must be falsified by grep — the manifest is exactly an aggregate surface; resume should verify listed folders exist rather than trust the table).
- **Open question:** should single-spec work (no family) require anything? Proposed: no — the manifest exists only when a decomposition happens; absence means "flat spec", zero overhead for the common case.
- **Open question:** manifest status vocabulary — reuse the spec phase names (PROPOSE/SPECIFY/EXECUTE/…) or a smaller set (`pending / active / done / blocked`)? Lean: the smaller set; phase detail already lives in each child.
- Dependency: none — builds on fields `/akili-propose` already records.

## 13. Success Criteria

- After `/clear`, `/akili-resume` on a project with a split family presents the children **in manifest order** with the correct next child, with zero reliance on conversation memory.
- No AKILI command creates a child spec folder under a family without a prior manifest row (grep-verifiable rule text in all three creating commands).
- Archiving a child updates the manifest; archiving a parent with non-terminal children is blocked with a clear message.
- Total addition small and bounded (guidance text + one template); mirrors and CHANGELOG consistent.

## 14. Next Step

```text
/akili-specify changes/spec-family-ordering
```

Change track, suggested depth: **Standard** (multi-surface command changes with a new template — larger than Lite, no code risk).
