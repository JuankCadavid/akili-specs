# Archive Summary — Grok Bot install target (`--tool grokbot`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec | `changes/grokbot-target` |
| Archive path | `docs/specs/archive/2026-10-21-changes--grokbot-target/` |
| Branch | `feat/grokbot-target` (a spec branch; `Integration Branch: dev` is pinned). All commits are local and unpushed |
| Release classification | minor (new install target), not released |

## 2. Original Spec Path

`docs/specs/changes/grokbot-target/`

## 3. Archive Date

2026-10-21

## 4. Final Status

**Delivered and validated: PASS with warnings.** All 7 tasks closed, 553/553 tests pass, and the live check on the Grok Bot box passed (NFR-6; P-10 and P-11 verified).

## 5. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | `--tool grokbot` for install, update and doctor. `all` and `both` are unchanged |
| FR-2 | Workflows and resources roots: `--target` > `--grokbot-target` > `--local` > `AKILI_GROKBOT_TARGET` > `/home/box/agent-data/workflows`; resources go to the `akili/` sibling unless `--grokbot-resources-target` is set |
| FR-3 | 27 skills and 12 command-skills, verbatim; ownership record; dry run; partial installs; shared-directory hygiene |
| FR-4 | Foreign entries are protected. Takeover only with an explicit `install --force`: move aside, record, copy, delete, and restore if the record write fails. An invalid record blocks every write. Owned entries that are not real directories are handled safely (T6) |
| FR-5 | Doctor OK / MISSING / FOREIGN / BLOCKED, `foreign N`, INCOMPLETE, exit status |
| FR-6 | Detection by the resources root only (`DETECTABLE_TOOLS`) |
| FR-7 | Next steps: the read directory, the foreign count and takeover command, and a doctor hint with root flags. No copy, `rsync` or `ssh` |
| FR-8 | README, `docs/cli.md`, AGENTS.md, CONTRIBUTING.md, `.claude/README.md` and CHANGELOG (Unreleased) |
| NFR-1 … NFR-6 | All PASS. NFR-6 was checked live on the box |

## 6. Files Changed Summary

| Area | Files |
|---|---|
| Code | `bin/akili.js` |
| Tests | `test/install-grokbot.test.js` (new, 33 tests), `test/install-grokbot-edge.test.js` (new, 14 tests), and env pins in `test/install-cursor.test.js`, `test/agents-doctor-io.test.js`, `test/agents-doctor.test.js`, `scripts/ci/install-layout-regression.js` |
| Docs | `README.md`, `docs/cli.md`, `docs/README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `.claude/README.md`, `CHANGELOG.md` |
| Size | `git diff --numstat c265b03`: +1,921/−66. About 1,628 lines of implementation, plus the 359-line Tester edge suite |

## 7. Test Evidence Summary

`npm test` 553/553 pass (0 skipped). The grokbot suites pass 47/47. Accepted gaps:
- `update` cannot be spawned in a test, because it runs a real `npm install -g`. It was checked by a static trace plus one live run.
- The takeover "restore also fails" branch has no test.

See `test-report.md` (run 1 found BUG-1; run 2, after T6, is all green).

## 8. Validation Summary

`validation-report.md`: 0 FAIL. The spec-doc WARNs (FR-1 dry-run clause, proposal staging references, figure drift) were closed during validation. The live box run (user, 2026-10-21 12:22 Bogotá) passed: `install` 47; `doctor` HEALTHY ok 47; Grok Bot loaded `tdd` and `akili-propose`, including their auxiliary files; the extra frontmatter caused no error.

## 9. Accepted Warnings Or Follow-Ups

| # | Item | Route |
|---|---|---|
| 1 | N1/N2: the install recovery text and doctor's generic `--fix` hint omit the grokbot root flags (`bin/akili.js:1093`, `:2264`) | Follow-up `/akili-quick` or a small fix spec |
| 2 | N3–N5: stale comments, a plural mismatch, `classifyEntry` rethrowing non-ENOENT errors | Backlog |
| 3 | Silent `.takeover/` orphans after a copy failure or a crash; EXDEV with a resources root on another filesystem (documented) | Backlog / future doctor line |
| 4 | Budget: ≈1,628 LOC against the approved ~1,600; 11 review rounds against 10 | Accepted; recorded in Kaizen |
| 5 | Release: package-affecting change; needs `release:minor` through the `dev` flow (user) | User |
| 6 | CodeGraph re-index (`bin/akili.js` changed heavily) | Recommended |

## 10. Historical Notes

- **Q1 changed mid-spec:** "box or staging + `rsync`" became **box only**, a user decision at the design gate after Judgment Day round 2. The whole off-box failure class was removed.
- **Judgment Day:** APPROVED after 2 rounds (`judgment.md`).
- **User-approved scope changes:**
  - T2b, safe takeover, after a T2 Reviewer RISK advisory;
  - T6, BUG-1, found by the `/akili-test` Tester;
  - budget raises 790 → 1,300 → 1,600 LOC.
- **Leader one-line spec amendments,** applied under the user's "stop only for product/risk decisions":
  - FR-4: delete-failure leaves "whatever remains";
  - FR-7: the network clause is narrowed to copy/transfer, with the update check unaffected;
  - FR-1 (at validation): the verify hint appears only after a real, not dry-run, install.
- **Incident:** the T5 Reviewer ran `akili update`, which ran a real `npm install -g akili-specs@latest`. The global version stayed 2.34.2, with no lasting change.

## 11. Diagrams

None. This spec has no diagram slots and no `diagrams/` folder. No baseline diagram went stale (the project has no TRD).
