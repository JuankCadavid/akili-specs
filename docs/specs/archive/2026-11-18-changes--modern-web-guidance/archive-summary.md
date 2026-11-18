# Archive Summary — Modern Web Guidance (`changes/modern-web-guidance`)

> **Outcome: delivered and archived.** All 14 tasks PASS, `/akili-test` PASS, `/akili-validate` PASS after remediation (9 PASS · 0 WARN · 0 FAIL · 0 BLOCKED). `npm test` 2111/2111. CI green on #146 at `973c12c`. Budget met: 1,467 added lines of ~1,470 (`git diff --numstat`, JC Q-1 ruling).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/modern-web-guidance` |
| Branch | `feat/modern-web-guidance` (spec branch; apply-capable branch: `dev`) |
| Archive Date | 2026-11-18 |
| Archived by | `/akili-archive`, Claude Code session (`opus`) |
| Maintainer | JC |
| PRs | PR 1 (T1–T8) merged into `dev` as #145 (`6698b17`). PR 2 (T9–T14 + test + validate) open as #146, tip `973c12c`, not merged |

## 2. Original Spec Path

`docs/specs/changes/modern-web-guidance/`

## 3. Archive Date

2026-11-18

## 4. Final Status

| Phase | Result |
|---|---|
| `/akili-execute` | 14/14 PASS. First attempt: T3–T9, T12, T13. Attempt 2: T1, T2, T10, T11. Attempt 3: T14. No HALT, pivot, REVIEW_WAIVED or REVIEW_SKIPPED |
| `/akili-test` | PASS, 2109/2109 (8 gap tests in `test/web-platform-guidance-coverage.test.js`), no PRODUCT_BUG |
| `/akili-validate` | First run PASS WITH WARNINGS (W-1, W-2). Remediated per JC rulings; re-validation PASS 9/0/0/0, `npm test` 2111/2111 |
| CI (#146 at `973c12c`) | Six `CLI on <os> / Node <18\|22>` legs and `release-status` green. macOS / Node 22 failed once on `update-check.test.js` timing (`exited 35032 ms…`) and passed on a JC-approved rerun of that job only |

## 5. Requirements Delivered

| Req | Delivered as |
|---|---|
| FR-1 | Security review of the pinned upstream (`1.0.1`, Apache-2.0, telemetry found and disabled by default) recorded in `execution.md` |
| FR-2 | Governance rule 4 admits MWG as environment-provided with three selectors; never vendored, never in a skills list |
| FR-3 | Design matrix: one job, platform implementation for web UI; route field `platform mwg` / `platform none — <reason>` with pin source |
| FR-4 | Six-state MWG gate before every AKILI-directed call; a non-ready state may WARN, never fails, stops or blocks (JC ruling) |
| FR-5 | Exact pin `1.0.1`, Skill Map `pin <x.y.z>` override, pin source `default` / `skill-map`; `ENABLE_FILE_LOGGING=false` and `DISABLE_TELEMETRY=1` on every call |
| FR-6 | Disclosure in completion reports; trigger contained to AKILI contracts |
| FR-7 | Phase wiring through `impeccable-bridge/references/modern-web.md`; execute-time check runs **after** the UI edits (W-1 fix); non-web specs unchanged |
| FR-8 | Opt-in `legacy-scan` only in `/akili-audit modern-web` |
| FR-9 | Step 8D Skill Map row: an availability and pin note, never a skill to assign (amended at validate, W-2) |
| FR-10 | No MWG files installed or packed (430-file pack unchanged in kind) |
| FR-11 | Docs pages and CHANGELOG `Unreleased` entry state verified facts only |
| NFR-1–NFR-4 | Covered by the cross-cutting suite (T14) and the gap tests; see `test-report.md` §7 |

## 6. Files Changed Summary

26 files outside `docs/specs/`, +1,467 / −48 (`git diff --numstat 688b35a~1`).

| Area | Files |
|---|---|
| New rules file | `.claude/skills/impeccable-bridge/references/modern-web.md` (148) |
| Bridge and routing | `impeccable-bridge/SKILL.md` (version), `references/design-routing.md` |
| Commands | `akili-audit.md` (modern-web mode), `akili-constitution.md` (Step 8D), `akili-propose.md`, `akili-specify.md`, `akili-test.md`, `akili-validate.md` |
| Guides and docs | `AGENTS.md`, `CHANGELOG.md`, `docs/cli.md`, `docs/commands/README.md`, `docs/commands/akili-audit.md`, `docs/flow.md`, `docs/overview.md`, `docs/skills/README.md`, `docs/skills/governance.md`, `docs/skills/impeccable-bridge.md` (new), `docs/skills/video-production.md` |
| Tests | `test/modern-web-guidance.test.js` (new, 91 tests), `test/web-platform-guidance-coverage.test.js` (new, 8), consumer updates in `design-skill-routing*.test.js`, `impeccable-bridge.test.js`, `install-cursor.test.js` |

## 7. Test Evidence Summary

`npm test` 2111 pass, 0 fail, 0 skipped (2101 after T14 → 2109 after `/akili-test` → 2111 after the W-1 tests). Every FR and NFR clause has a pinning test or a recorded reason (`test-report.md` §7). `verify:cli`, `pack:dry-run` (430 files), `git diff --check`, `install --tool all --dry-run` and `doctor --tool all` all pass.

## 8. Validation Summary

| Item | Status |
|---|---|
| W-1 (check ran before the UI edits) | Resolved, JC option A: `modern-web.md` *In a task* and `design-routing.md` step 4 / *Platform guidance* fixed; 2 tests pin the order |
| W-2 (FR-9 "use when present") | Resolved, JC option A: FR-9 amended, Document Control row records approval |
| Q-1 (LOC budget measure) | JC option A: `git diff --numstat` 1,467 meets ~1,470 |
| N-3 | Closed by `973c12c` and its `execution.md` entry |
| N-1, N-2, N-4, A-1, A-2 | Notes and advisories, non-gating; recorded in `validation-report.md` |

## 9. Accepted Warnings Or Follow-Ups

- **#146** is open and not merged; merging and the minor release (same release as PRs #142–#144) are JC's.
- **Kaizen:** 3 lessons and their pending items recorded in `docs/specs/kaizen/changes--modern-web-guidance.md`, awaiting Apply Mode on `dev`.
- **CI flake:** `test/update-check.test.js` "healthy registry is unchanged and exits promptly" failed once on macOS / Node 22 (35 s exit) and passed on rerun. Not caused by this spec; noted in the Kaizen entry, no task created.
- **CodeGraph:** re-index recommended after merge (`.codegraph/` exists); not run.

## 10. Historical Notes

- Budget raised twice by JC: ~1,120 → ~1,400 (T12 tripwire) → ~1,470 (`/akili-test` end gate).
- JC rulings during execute: F-5 call form (`ENABLE_FILE_LOGGING=false`), FR-7 "unchanged in behavior", FR-4 stays as written, `akili-audit.md` frontmatter fix folded into T12.
- T12 incident: a Leader `git checkout -- docs/cli.md` reverted an Implementer's uncommitted edit; re-applied byte-identical and confirmed by the Reviewer.
- Archive-time test fix (JC ruling, option A, 2026-11-18 9:05 AM America/Bogota): moving the spec into `docs/specs/archive/` and adding its Kaizen entry failed the NFR-2 test in `test/modern-web-guidance.test.js`, which exempted only `docs/specs/changes/modern-web-guidance/`. The exemption now covers everything under `docs/specs/`; the test still asserts no MWG-named file ships outside the rules file and the suite. `npm test` 2111/2111; LOC unchanged at 1,467 (two lines modified, none added).
- `judgment.md`: judgment-day round 1, 8 confirmed severe and 9 warnings, closed "fixed, not re-judged".

## 11. Diagrams

None. The spec has no `diagrams/` folder and its design fills no baseline diagram slot.
