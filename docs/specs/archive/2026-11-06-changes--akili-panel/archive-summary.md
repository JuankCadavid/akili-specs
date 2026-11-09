# Archive Summary — akili-panel

**Outcome: delivered and validated.** A Claude Code side pane, opened with `/akili-panel`, shows where the active spec stands, the branch and token use, and offers one Next button. It installs for Claude Code only. Validation: PASS with 4 accepted WARNs, 0 FAIL.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/akili-panel` |
| Archive Date | 2026-11-06 |
| Final Status | Archived, local only: no push, PR, merge, tag or publish |
| Branch | `JuankCadavid/akili-panel` |
| Release | Minor when released (recorded only) |

## 2. Final Status

| Measure | Result |
|---|---|
| Tasks | 9 of 9 `[x]` |
| Review rounds | 20 of 20, budget raised twice by JC (15, 18, 20) |
| `npm test` | 1740 pass, 0 fail |
| `claude plugin test` | 64 pass, 0 fail |
| Live checks | T9 and two `/clear` runs in Orca |

## 3. Requirements Delivered

| Area | Requirements |
|---|---|
| Install, `update`, `list`, `doctor`, leaked-copy removal | FR-1 … FR-4 |
| Spec choice, phase marks, Next, `/akili-panel` | FR-5 … FR-8 |
| Observers that never interfere, read-only, branch, token line | FR-9 … FR-12 |
| Governance carve-out, marketplace file, package hygiene, empty states | FR-13 … FR-16 |
| Non-functional | NFR-1 … NFR-8 |

## 4. Files Changed Summary

161 files, +5,447 / −23 excluding `docs/specs`; 4,200 of those lines are tests and fixtures.

| Area | Files |
|---|---|
| Plugin | `.claude/skills/akili-panel/` (7 files) |
| Installer | `bin/akili.js`, `bin/install-compare.js`, `package.json`, `.gitignore` |
| Marketplace | `.claude-plugin/marketplace.json` |
| Docs | `docs/plugins/akili-panel.md`, `docs/skills/governance.md`, `docs/cli.md`, `docs/release-checklist.md`, `README.md`, `AGENTS.md`, `CHANGELOG.md` |
| Tests | `test/akili-panel-*.test.js`, `test/install-akili-panel.test.js`, fixtures, edits to 5 existing test files |

## 5. Test Evidence Summary

`test-report.md`: PASS at `8098a44`. Two `PRODUCT_BUG`s were found and fixed:

| Bug | Found by | Fix |
|---|---|---|
| `$` vanished from the token line after `/clear` | Tester | `55321a4` |
| Pane body lost after `/clear` | Live check | `0788c8e` |

## 6. Validation Summary

`validation-report.md`: PASS with 4 WARN, 0 FAIL, 0 BLOCKED.

## 7. Accepted Warnings Or Follow-Ups

JC accepted the 4 WARNs, 2026-11-06 7:22 PM America/Bogota: «A: acepto los 4 WARN, archiva changes/akili-panel»

| WARN | Follow-up |
|---|---|
| Design gate unevaluated (no web target) | `changes/akili-panel-polish` |
| Not seen live: Cursor (P-27), `/plugin install`, resume, real host refusal wording | Check after release |
| Linux and Windows CI not run | The PR's six checks |
| Removing the `try` in `later` survives the kit | Accepted |

Other follow-ups: D-B's possible exclusion of `tests/` from the package; advisory A1 on `parseTaskTokens` edges; a release needs a push, a PR into `dev` and a version bump, all JC's.

## 8. Historical Notes

- **T1 Pivot (A1, B1, C1, D1):** the plugin's own runs bypass its observers, which reshaped Next and the double-press guard.
- **D-A (b), D-B accepted:** `session.start` work stays on the clock; `tests/panel.test.tsx` ships in the package for v1.
- **FR-12 clarified:** `$` is Claude Code's own figure and restarts at `/clear`, observed live (`$0.01` became `$0.00`).
- **Pane body bug:** the root cause was never confirmed, because the host docs do not say what survives `/clear`. The fix holds under each answer.
- `execution.md` cites `.run/akili-execute-panel/T9-observations.md`, which is untracked; its per-step table is copied into `execution.md`.

## 9. Diagrams

The spec has no `diagrams/` folder. No baseline docs exist in this repo, so no diagram slot went stale.
