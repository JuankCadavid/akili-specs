# Test Report — install-stale-skills

**Overall: PASS.** `npm test` → `# tests 1385 # pass 1385 # fail 0`. Every FR-1–FR-5 clause and NFR-1–NFR-5 has test evidence except one accepted gap (FR-2 "`update` behavior SHALL NOT change", see §9). No `PRODUCT_BUG`.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/install-stale-skills` |
| Date | 2026-10-31 |
| Base | `09bcdc2` (T4) |
| Approval Mode | `pre-approved` (JC 14:23; budget decision 16:51 delegated by JC, option chosen by JC's assistant). Gate: `auto-approved (pre-approved mode)` |
| Models | Leader opus; Tester **opus** (Implementer was sonnet; author ≠ tester holds) |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 1 (integration: the CLI as a subprocess plus the pure module); one Tester, no inline suite |
| Author TDD coverage cited, not rewritten | `test/install-compare.test.js` (14), `test/install-stale-skills.test.js` (22) |
| Added by the Tester | `test/install-stale-skills-gaps.test.js` (134 lines, 4 tests) |
| Mutations executed (scratch copy of the repo) | M1 `Home:` on every global run → test 4 red; M2 `MAX_NAMES` 5 → 6 → test 3 red; M3 CRLF-blind `sameFile` → test 1 red; M4 a foreign skip with `(identical)` → test 2 red |
| Counts (verbatim) | gaps file `# tests 4 # pass 4 # fail 0`; author files `# tests 36 # pass 36 # fail 0`; `npm test` `# tests 1385 # pass 1385 # fail 0` (Tester and Leader re-run) |
| LOC note | The 134 test-phase lines are outside the design §12 execute budget (752 / ceiling ~775), the same accounting as `design-eval-followup`, whose test phase added 123 lines outside its 244 |

## 3. Backend Unit Tests

`test/install-compare.test.js`: FR-1 pure (identical, one-byte differs, symlink and type mismatches, extra target files, CRLF vs LF, sorting, `formatDiffers` cap). PASS.

## 4. Frontend Unit Tests

None: no UI.

## 5. Integration Tests

| File | Tests | Covers |
|---|---|---|
| `test/install-stale-skills.test.js` | 22 | FR-1 S1 end to end, FR-2 (both scenarios, dry-run, `--force`, Codex, Grok Bot, arithmetic), FR-3 (DIFFERS, clean baseline, `--fix`, Antigravity, foreign `impeccable`, Grok Bot, resource, missing + differs, repaired-then-differs), FR-4, FR-5 text |
| `test/install-stale-skills-gaps.test.js` | 4 | (1) `install --tool all` re-run: classes on every desktop target, HOME snapshot byte-equal (NFR-1, NFR-3), CRLF end to end, `doctor --tool all` DIFFERS with exit 0; (2) foreign `impeccable/` keeps `skip foreign`, no class, not counted; (3) >5 differing files → 5 names then `+N more`; (4) no `Home:` when every printed root is outside home (Claude `--target`, Grok Bot box), with a positive control |

## 6. E2E Tests

None needed: the CLI subprocess tests are the user journey.

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test | Result |
|---|---|---|---|
| FR-1 | file/dir classes, extra files, byte-exact, ≤5 names | install-compare (14); gaps 1, 3 | PASS |
| FR-1 | S1 edited skill / S2 extra file | install-stale-skills "an edited skill…", "an extra file…" | PASS |
| FR-2 | class on skip line, I + D = N, hint / "already match" | install-stale-skills; gaps 1 | PASS |
| FR-2 | `--dry-run` classifies, never writes | install-stale-skills | PASS |
| FR-2 | `--force` unchanged | install-stale-skills "--force prints no class…" | PASS |
| FR-2 | `update` unchanged | — | GAP (accepted, §9) |
| FR-2 | foreign / blocked / takeover keep their lines | gaps 2; existing grokbot and foreign suites green | PASS |
| FR-3 | DIFFERS at every location, all targets | install-stale-skills doctor tests; gaps 1 | PASS |
| FR-3 (BUT) | exit code and status unchanged | install-stale-skills; gaps 1 | PASS |
| FR-3 (AND IT MUST NOT) | `--fix` never rewrites a DIFFERS entry | install-stale-skills | PASS |
| FR-3 | foreign `impeccable/` not compared; column only when N > 0; closing-line precedence | install-stale-skills | PASS |
| FR-4 | `Home:` under home, absent with `--local`, absent when all roots outside home | install-stale-skills; gaps 4 | PASS |
| FR-5 | docs and CHANGELOG text, coverage pin | install-stale-skills (4); design-eval-contract-coverage | PASS |
| NFR-1 | no write without `--force` | snapshots; gaps 1 | PASS |
| NFR-2 | all six targets | Claude, Codex, Grok Bot, Antigravity (author); OpenCode, Cursor (gaps 1) | PASS |
| NFR-3 | no new on-disk state | gaps 1 | PASS |
| NFR-4 | suite green | `npm test` 1385/1385 | PASS |
| NFR-5 | executed mutations | T1–T4 falsifiers; M1–M4 | PASS |

## 8. Remediation

None.

## 9. Accepted Gaps

| Gap | Reason |
|---|---|
| FR-2 "`update` behavior SHALL NOT change" has no direct test | `runUpdate` runs a real `npm install -g akili-specs@latest` (network), then calls `runInstall` with `args.force = true` (`bin/akili.js` ~1476), the path the `--force` test covers. A direct test needs a package-manager stub seam the CLI lacks. The T3 Reviewer checked `update` output in a scratch run (execution.md T3) |
| The doctor no-write check in gaps test 1 compares installed files only | `doctor --tool all` invokes host CLIs (cursor, playwright) that write their own caches under HOME; AKILI writes none of them |
