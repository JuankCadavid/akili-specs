# Test Report: design-eval-followup

**Status: PASS.** 1345 of 1345 tests pass and there are no product bugs. Every FR clause has a test, except the P-16 fixture outcome. That outcome rests on the Lead's measurement and is walked at `/akili-validate`. FR-3's "neither excluded binary runs" is now proven by running the vendored POSIX launcher, not only by text.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-followup` |
| Date | 2026-10-31 |
| Commit under test | `97b615a` + the new test file (uncommitted at run time) |
| Approval Mode | `pre-approved (JC, 2026-10-31)`: the gate is `auto-approved (pre-approved mode)` |
| Tester | 1 delegated Tester (opus; the code under test was written by sonnet Implementers, so author ≠ tester). No suite run inline |

## 2. Summary

| Measure | Value |
|---|---|
| Suites | 1: clause coverage + launcher behavior (integration) |
| Testers spawned | 1, sequential; 17 tool calls, 116,405 tokens, ended complete (`PASS`), inner loop green on attempt 1 |
| Author TDD tests cited, not rewritten | `test/design-eval-followup.test.js`, 27 tests (T1–T4) |
| New tests | `test/design-eval-followup-launcher.test.js`, 3 tests (POSIX; they skip on Windows with a printed reason) |
| `npm test` | `# tests 1345 # pass 1345 # fail 0` (1315 at spec start) |
| `npm run pack:dry-run` | ok |
| `git diff --check` | clean |
| `git diff --stat -- .claude/` | empty |
| Temp dirs left | 0 (`ls $TMPDIR \| grep -c akili-launcher` → 0) |
| Lookup note | The Tester read the full launcher (263 lines) before writing expectations |

## 3. Backend Unit Tests

n/a: rules text, no backend code.

## 4. Frontend Unit Tests

n/a: no UI.

## 5. Integration Tests

`test/design-eval-followup-launcher.test.js` runs a copy of the shipped `scripts/impeccable` bytes, plus `VERSION` and `engine-checksums.txt`, in a temp dir. It copies them so that a gitignored local sibling engine cannot mask the result. A fake engine under `R/.impeccable/bin` writes a marker whenever it runs, whether as a probe or as an exec. Downloads go to `file:///nonexistent`, so no socket opens.

| Test | Environment | Observed |
|---|---|---|
| Control 1 (W-4 reproduced) | `HOME=E`, `IMPECCABLE_BIN` excluded, excluded `PATH` entry | marker `engine-probe probe=` (exec'd via `IMPECCABLE_BIN`), exit 0 |
| Control 2 (`PATH` only) | `IMPECCABLE_BIN` unset, excluded `PATH` entry kept | marker `engine-probe probe=1` then `engine-probe probe=` (probed, then exec'd), exit 0 |
| Rule env (FR-3 THEN) | `HOME=E`, `IMPECCABLE_BIN` unset, excluded entry filtered | no marker; exit ≠ 0; stderr `could not download engine <VERSION> from file:///nonexistent/…`; `H/bin/<VERSION>/` exists and is empty |

**Falsifier (executed on a temp copy, then deleted):** keeping the excluded entry on `PATH` in the rule env gives `not ok 3 … the excluded binary must not run; marker: engine-probe probe=1 / engine-probe probe=`, `# pass 2 # fail 1`. Keeping `IMPECCABLE_BIN` exported gives `not ok 3`, `# fail 1`.

## 6. E2E Tests

n/a.

## 7. Coverage & Traceability

F = `test/design-eval-followup.test.js`, C = `test/design-eval-contract.test.js`, L = `test/design-eval-followup-launcher.test.js`.

| Requirement | Scenario or clause | Test type | Test | Result | Gap or notes |
|---|---|---|---|---|---|
| FR-1 b1 | banner state recorded separately | text contract | F "banner state … `not rendered: <reason>`" | PASS | "recorded beside the CTA outcome" not pinned (advisory) |
| FR-1 b2, S2 THEN/BUT | only a would-be `pass` changes; never reads `pass` | text contract | F | PASS | — |
| FR-1 b3, S1 THEN/BUT | `below fold`/`covered` stand, with the reason | text contract | F | PASS | "with its P1 or FAIL" not pinned (advisory) |
| FR-1 b4 | item 3 `Unevaluated` keeps its reason | text contract | F | PASS | — |
| FR-1 b5, S1 AND | remedy whatever the outcome | text contract | F | PASS | — |
| FR-1 S1 AND IT MUST NOT read `pass` | — | text contract | F "stands" | PASS (indirect) | No direct assertion |
| FR-1 P-16 THEN/AND | 8 viewports `pass`, banner `visible`, per-viewport report | walkthrough | — | **Gap** | §9 accepted gap |
| FR-1 P-16 BUT | identification not text-based | text guard | F | PASS | A regression guard |
| FR-2 b1–b3, THEN/BUT | byte-exact; non-conformance; reference command prints the `UPSTREAM.md` hash | text + behavioral | F (runs the extracted command) | PASS | Windows quoting `UNVERIFIED` (P-8) |
| FR-2 AND IT MUST | range rule kept | text contract | C "metadata range" | PASS | — |
| FR-3 b1 | home variable | text contract | C:74-81 | PASS | — |
| FR-3 b2, b3 | `IMPECCABLE_BIN` unset; `PATH` filter | text + integration | F; L rule env, controls 1–2 | PASS | "resolved against the real home before the override" is text only |
| FR-3 b4 | the reason | text + integration | F; L controls prove the reason true of the launcher | PASS | — |
| FR-3 no-other-call, BUT | — | text contract | F; C:60 | PASS | — |
| FR-3 S THEN | neither excluded binary runs; download under `IMPECCABLE_HOME` | integration | L rule env + falsifier | PASS | `.cmd` not run; a successful download is not run (offline) |
| FR-3 S AND | later calls carry the pin | text contract | F | PASS | Agent behavior, not code |
| FR-3 S AND IT MUST | record all three | text contract | F | PASS | — |
| FR-4 | reference line, doc, 2 CHANGELOG clauses, new bullet | text contract | F (5 tests) | PASS | — |
| FR-4 sweep | retired strings absent, CHANGELOG in scope | sweep | F | PASS | The third pattern is inert at baseline; test 22 covers the line by shape (T4 advisory) |
| NFR-1 | no vendored byte changed | existing | `test/impeccable-vendor.test.js`; `git diff --stat -- .claude/` | PASS | — |
| NFR-2 | no bridge strings in commands | existing | `test/impeccable-bridge.test.js:102-105` | PASS | — |
| NFR-3 | an executed mutation per clause | — | `execution.md` T1–T4 reds; L falsifier above | PASS | — |
| NFR-4 | release checks | commands | `npm test`, `pack:dry-run`, `git diff --check` here; `verify:cli` at T4 | PASS | — |
| NFR-5 | no test reads the spec path | guard | F guard; L reads nothing under the spec folder | PASS | — |

## 8. Remediation

None: no failure and no product bug.

## 9. Accepted Gaps

| Gap | Why it is not automated | Where it is settled |
|---|---|---|
| FR-1 P-16 THEN/AND (8 viewports `pass`) | Needs a browser on the live site; the outcome is the Lead's measurement (P-7b) | `/akili-validate` walkthrough; the Lead |
| FR-3 on `scripts/impeccable.cmd` | No Windows host in this cycle | Accepted risk (requirements §7); the CI Windows leg skips the launcher test with a printed reason |
| A successful download into `IMPECCABLE_HOME` | Needs the network or the real engine binary | The launcher's own checksum path; out of scope |
| Text pins: "with its P1 or FAIL", "recorded beside the CTA outcome", the direct S1 "not `Unevaluated`" | Covered by surrounding assertions; recorded as advisories, not added (no scope growth) | Recorded for the archive's kaizen measure |
