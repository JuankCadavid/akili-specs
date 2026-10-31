# Spec Family: impeccable-audit-fixes

## Document Control

| Field | Value |
|---|---|
| Parent Spec Path | `changes/impeccable-audit-fixes` (slug derived from the free-text argument; it matches the worktree name) |
| Created | 2026-10-30 |
| Last Updated | 2026-10-31 (row 2 added, install-stale-skills moved to 3; JC) |
| Family Status | `open` (both proposals approved by JC, 2026-10-30 16:21) |
| Source | `~/akili-audits/2026-10-30-akili-web-design-2.40.0.md`, section *Fallos y vacíos de la metodología* (M1–M14), plus the installer item of the brief |

## Children

| # | Spec Path | Depends on | Parallel-safe | Status |
|---|---|---|---|---|
| 1 | `changes/impeccable-audit-fixes/design-eval-contract` | none | yes | done (archived 2026-10-31 to `docs/specs/archive/2026-10-31-changes--impeccable-audit-fixes--design-eval-contract/`) |
| 2 | `changes/impeccable-audit-fixes/design-eval-followup` | none | yes | pending (row added with JC's approval, 2026-10-31: the W-1, W-2 and W-4 follow-up from child 1's validation report) |
| 3 | `changes/impeccable-audit-fixes/install-stale-skills` | none | yes | pending |

**Closed-set rule:** this table is the exhaustive child set of the spec family. No AKILI command creates a child spec folder without a prior row here, and adding a row is a HITL-approved manifest edit.

Parallel-safe note: children 2 and 3 share no module (child 2 edits the bridge rules text and its tests; child 3 edits the installer). They share only the `CHANGELOG.md` `Unreleased` block, which is append-only.

## Build order (RICE)

| # | Reach | Impact | Confidence | Effort | Why this position |
|---|---|---|---|---|---|
| 1 | Every `/akili-audit design` and `/akili-validate` design gate | 3: false `PASS` verdicts and contradictory instructions | 90 % | M (rules text plus text-contract tests) | It fixes wrong verdicts, the costliest failure |
| 2 | Every `/akili-audit design` and `/akili-validate` run on a Persuade/Operate screen with a consent banner, every vendored-copy check, every excluded-home download | 3: W-1 can turn a P1 into `Unevaluated` | 95 % (W-2 and W-4 reproduced 2026-10-31) | S (rules text plus a few assertions) | It closes a hidden-P1 gap left by child 1, at small effort |
| 3 | Every user who re-runs `akili install` after an upgrade | 2: a stale skill runs without anyone noticing | 90 % | M (installer code, tests on six targets) | `akili update` already forces a refresh, so a workaround exists |
