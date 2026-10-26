# Archive Summary — `/akili-review` (changes/akili-review)

**Outcome: archived complete, with T12 (pilot) explicitly deferred.** `/akili-review` and the `pr-review` skill shipped with deterministic scripts, CI templates for Claude and Codex, and docs. Validation was PASS with 9 WARN and 0 FAIL; 8 WARNs were closed before archive, and the 9th (W-5, a pre-existing pty CI flake) is an ops item. The suite is green: 1108/1108 on Node 22 and 18.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-review` |
| Archive Path | `docs/specs/archive/2026-10-26-changes--akili-review/` |
| Archive Date | 2026-10-26 |
| Branch | `feat/akili-review-pr2` (PR #77 into `dev`, open; PR 1 = #75, merged as `dda3d5d`) |
| Approved by | Juan Carlos, 2026-10-26 ("run /akili-archive changes/akili-review now") |
| Release | Minor, recorded only: the templates pin `akili-specs@2.37.0`, and the release must publish exactly that version |

## 2. Original Spec Path

`docs/specs/changes/akili-review/` (proposal, requirements, design, judgment, tasks, execution, test-report, validation-report, this summary).

## 3. Archive Date

2026-10-26.

## 4. Final Status

| Item | Status |
|---|---|
| Tasks | T1–T11 `[x]` (14 entries incl. T3b, T9a–T9c), plus post-validation R1 PASS; **T12 `[ ]` deferred, accepted by the user 2026-10-26** |
| Tests | `npm test` 1108/1108 on Node 22.23.3 and 18.20.8; `verify:cli` 14 commands, 29 skills, 8 resources |
| Validation | PASS, 9 WARN / 0 FAIL → W-1..W-4, W-6..W-9 closed; W-5 open (ops) |
| Budget | 15 tasks planned, 14 executed (T12 deferred) · ~5,793 LOC by the execution ledger, under the ~6,200 tripwire · 27/27 review rounds (raised 25 → 27 by the user) + 1 remediation round |

## 5. Requirements Delivered

| Requirement | Delivered |
|---|---|
| FR-1 | `pr-review` skill: SKILL.md, references (lenses, large-prs, ci), NOTICE, schema and two scripts. AKILI-authored, with attribution; byte-identical install on every target |
| FR-2 | `/akili-review [<pr> \| <base>..<head> \| --staged] … [--ci [--input <dir>]]`, read-only boundary |
| FR-3, FR-4 | `check-skip` (draft, closed/merged, bot, label, trusted marker, `--force`), filtering, tiers 10 / 100 lines / 20 files, sensitive paths → `full` |
| FR-5, FR-6 | Lenses run as the existing Reviewer persona, with a drift guard; spec-conformance lens |
| FR-7 | Finding contract, threshold 80, validator, verification by tier, suspect downgrade |
| FR-8 | Local run directory + `REVIEW.md`; CI writes `findings.json` only, and the PR comment is the report (corrected at validation, W-2); opt-in history; `reviews/` carve-out at 6 sites |
| FR-9, FR-10 | One sticky summary, ≤ 10 inline comments, event `COMMENT`, neutralization and redaction, marker trust allowlist; 10-row incremental reconcile |
| FR-11 | Exit table, `--fail-on` default `none`, break-glass label; failures in the job log under `none` (corrected, W-3) |
| FR-12 | CI templates (claude-code-action, codex-action): read-only `review` job on a base-SHA checkout, head tarball under `$RUNNER_TEMP`, separate `post` job, SHA-pinned actions |
| FR-13 | Routing of confirmed criticals to `/akili-propose`, local only |
| FR-14 | Docs pages, governance, judgment-day row, README/overview/hub/commands rows, flow §2d, `docs/cli.md` totals, AGENTS line, CHANGELOG (figure and alt-text debt stated) |
| NFR-1–NFR-6 | No `bin/` or dependency change; Node 18 + 22; offline with a fake `gh`; size caps; suite green; cost bounded by configuration |

## 6. Files Changed Summary

`git diff --stat 708020e..HEAD -- ':!docs/specs'` → 52 files, +6,367 / −34. Details per task are in `execution.md`.

| Group | Files |
|---|---|
| Skill | `.claude/skills/pr-review/{SKILL.md, NOTICE, review-schema.json, validate-review.cjs, post-review.cjs, references/{lenses,large-prs,ci}.md}` |
| Command | `.claude/commands/akili-review.md`; carve-outs in `akili-{audit,resume,specify,propose}.md` |
| CI | `docs/ci/akili-review.{claude,codex}.yml`, `docs/ci/README.md` |
| Docs | `docs/commands/akili-review.md`, `docs/skills/pr-review.md`, skills README, governance, judgment-day row, README, `docs/README.md`, overview, commands README, flow, cli, AGENTS.md, CHANGELOG |
| Tests | `test/pr-review-scripts.test.js` (167), `test/pr-review-scripts-coverage.test.js` (13), `test/akili-review-command.test.js` (33), `test/akili-review-contract-coverage.test.js` (20), `test/akili-review-ci.test.js` (30), fixtures incl. `fake-gh.js`; count pins (install-cursor, marketing-docs, diagram-design, doctor baseline) |

## 7. Test Evidence Summary

`test-report.md`: PASS. 2 suites, 2 opus Testers, 33 new tests each falsified by a mutation, 0 product bugs. Accepted gaps: CI runtime wiring and host behavior (T12), review quality, agent-side text-only clauses, Linux/Windows (covered by PR CI), and upstream content comparison (clean room).

## 8. Validation Summary

`validation-report.md`: PASS, 9 WARN / 0 FAIL, by an independent opus auditor. §13 records the remediation applied on 2026-10-26.

## 9. Accepted Warnings Or Follow-Ups

| Item | Owner / route |
|---|---|
| **T12 pilot** (P-12, P-13, P-22, P-23; CI-wiring and host-behavior defect classes) | Deferred, accepted by the user; needs a scratch repo and API keys |
| **W-5**: PR #77 Ubuntu / Node 22 pty Ctrl-C flake (also red on `dev`) | Re-run before merge; separate Bug track (pty harness) |
| **Release**: templates pin `akili-specs@2.37.0`; npm latest is 2.36.1 | Release prep must publish exactly 2.37.0 |
| Execution advisories (T1–T9c; listed in validation-report §7) | Never gating; candidates for a follow-up proposal |
| Kaizen pending items | `docs/specs/kaizen/changes--akili-review.md`, applied on `dev` |

## 10. Historical Notes

- Judgment-day review at specify: 6 severe findings (C-1 to C-6), all folded into the design before tasks.
- Execution amendments, each recorded in execution.md:
  - **T3b** moved consumer edits into PR 1 so CI was green.
  - **PR 2 and PR 3 were merged** for the same reason.
  - **Line tripwire** raised from ~5,700 to ~6,200.
  - **Round tripwire** raised from 25 to 27, after a HALT before T11.
  - **`--input <dir>`** replaced `$AKILI_REVIEW_INPUT`.
- The clean room held throughout (DD-11): no `anthropics/claude-code` file was opened.

## 11. Diagrams

The spec has no `diagrams/` folder. The baseline lifecycle figure `assets/akili-flow.svg`/`.png` and its alt text in `docs/flow.md` are **stale by design (DD-12)**: they still show five anytime commands. This is a follow-up for a figure-regeneration change.
