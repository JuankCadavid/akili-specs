# Spec Family: go-backend-routing

> **Answer first.** Two bounded changes, not one. **Child 1** admits one Go stack skill (`golang-pro`, Jeffallan, MIT) behind a security-vetting gate. It shares no logic with anything in flight and can land first. **Child 2** adds a **Backend & Architecture Routing Matrix** with the same shape as `design-skill-routing` (activity × context → lead / support / must-not-decide, expertise cards, lead/support rule). It edits the same command steps as that spec, so it waits for it to merge.

## Document Control

| Field | Value |
|---|---|
| Parent Spec Path | `changes/go-backend-routing` (slug derived from the free-text argument; it matches the worktree name) |
| Created | 2026-11-01 |
| Last Updated | 2026-11-01 (child 1 archived) |
| Family Status | `open` (both proposals approved by JC, 2026-11-01 9:56 UTC-5: child 1 Option A, child 2 Option B, minor for both) |
| Source | JC brief, 2026-11-01 (pasted into the session): Go skill + backend/architecture skill routing; Claude (Opus) to decide spec vs family |
| Decided by | Claude (Opus 5.5), on JC's delegation in the brief |

## Children

| # | Spec Path | Depends on | Parallel-safe | Status |
|---|---|---|---|---|
| 1 | `changes/go-backend-routing/golang-skill` | none | no (shares the stack-skill candidate lists in `akili-constitution` Steps 5/8D and `akili-specify` Step 2.1 with `changes/design-skill-routing`; expected conflicts are one-line list merges) | done (archived 2026-11-01 to `docs/specs/archive/2026-11-01-changes--go-backend-routing--golang-skill/`) |
| 2 | `changes/go-backend-routing/backend-skill-routing` | `changes/go-backend-routing/golang-skill` · `changes/design-skill-routing` (merged into `dev`) | no (same command steps, `leader.md` item 3, repo `AGENTS.md` and `docs/skills/governance.md` as `changes/design-skill-routing`) | pending |

**Closed-set rule:** this table is the exhaustive child set of the spec family. No AKILI command creates a child spec folder without a prior row here, and adding a row is a HITL-approved manifest edit.

## Build order (RICE)

| # | Reach | Impact | Confidence | Effort | Why this position |
|---|---|---|---|---|---|
| 1 | Every AKILI project with a Go backend (today: none get a Go skill) | 2: Go tasks run with no stack guidance, while NestJS and Angular tasks have it | 85 % (upstream read 2026-11-01; Trust Hub verdict unexplained) | S (one vendored folder, attribution, docs rows, candidate lists, tests) | Small, independent, and child 2's matrix needs it to exist |
| 2 | Every `/akili-specify` design and `/akili-execute` backend task | 2: overlapping skills load together with no owner per decision | 70 % (the overlap is argued from skill text; no measured mis-routing yet) | M (one reference file, five command and persona pointers, contract tests) | Larger, and blocked on `changes/design-skill-routing` |

## Why a family, not one spec

| Reason | Detail |
|---|---|
| Different risk | Child 1 brings third-party text into the package and needs a security gate. Child 2 changes methodology routing and needs a design review (`judgment-day`) |
| Different blockers | Child 2 waits for `changes/design-skill-routing`, which itself waits for PR #111. One spec would hold the Go skill behind both |
| Coherence by design | Child 2 copies the matrix schema of `changes/design-skill-routing` (§9 of its proposal), holds its table in a different file, and never edits that spec's files |
