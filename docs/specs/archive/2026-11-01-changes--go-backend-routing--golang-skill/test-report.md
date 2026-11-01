# Test Report: Go stack skill (`golang-pro`)

> **Status: PASS.** `npm test` gives 1249 pass / 0 fail, including 16 contract tests in `test/golang-skill.test.js`. One test was added at this phase, the FR-4 docs-page test, and each of its falsifiers was observed red. Install and doctor carry `golang-pro` on every target. No product bug was found. One accepted gap: FR-1's security review has no automated gate by design, so its evidence is the recorded T1 verdict.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/golang-skill` |
| Date | 2026-11-01 |
| HEAD at run | `51b5bed` + this phase's uncommitted test addition |
| Approval Mode | pre-approved (JC 9:56); budget raised by JC (11:08) to 9 rounds / ~330 LOC |
| Leader / Tester | Leader inline (Claude Opus 5.5), per the Deployment Rule: Lite depth, one suite. Author ≠ tester holds because every Implementer ran on `sonnet` (`execution.md` Document Control), with no escalation recorded |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 1 (repository contract / unit suite, `node:test`); run inline, no Tester spawned |
| Commands | `npm test`; `node --test test/golang-skill.test.js`; `node bin/akili.js install --tool all --dry-run`; `install --tool all` and `doctor --tool all` under a scratch `HOME`; `diff -r` of each installed copy against the source; `git diff --check` |
| Result | 1249 / 0 (was 1248 at execute close; +1 test) |
| Tests added | 1: FR-4 docs page, samber note, security-claim bound (~20 LOC; LOC total ≈300 vs ~330) |
| Author TDD coverage | Cited, not rewritten: T4's 15 tests and their four falsifier reds (`execution.md` T4) |
| Product bugs | 0 |
| Skills | none loaded (a text-contract suite; `tdd` was already applied at T4) |

## 3. Backend Unit Tests

The repository has no backend; its "unit" layer is the `node:test` contract suite.

| Test (in `test/golang-skill.test.js`) | Proves | Falsifier (observed red) |
|---|---|---|
| 1 folder holds exactly 8 files | FR-2 (count first, so an absent folder fails) | T4 |
| 2–7 each reference and `LICENSE` equals its pinned blob SHA (raw bytes) | FR-2 body kept; CRLF class | T4 (a) `not ok 3 … generics.md` |
| 8 four added lines follow `related-skills`, and the strip-hash equals `99ef50f…` | FR-2 BUT, DD-3 | T4 (b) `not ok 8` |
| 9 frontmatter schema keys | FR-2 AND IT MUST (governance schema) | — |
| 10 NOTICE provenance facts | FR-2 license/notice + holder-name source | — |
| 11 four candidate pools, section-bounded and guarded | FR-3 | T4 (c) `not ok 11`; guard proof `section end not found` |
| 12 governance `stack` row | FR-4 | — |
| 13 no `samber` path | NFR-2 | — |
| 14 `.gitattributes` `-text` | FR-2 cross-platform (P-9) | T4 (d) `not ok 14` |
| 15 under 60 KB | NFR-1 | — |
| **16 docs page facts, samber note, security-claim bound (added here)** | FR-4 AND IT MUST, FR-4 BUT | see below |

**Test 16 falsifiers.** The Leader ran both against a backup in the scratchpad; the file was restored and `shasum` matched.
- "AKILI never vendors it" → "AKILI may vendor it": `not ok 16 … The input did not match the regular expression /AKILI never vendors it/`.
- The line "This skill is safe to use." appended: `not ok 16 … error: 'page asserts a security property beyond the verdict'`.

Existing suites that pin the inventory, kept green: `docs-overview` (a), (c), (d), `install-cursor` (308 → 316 files, doctor fixture), `install-grokbot` (doctor fixture), `akili-marketing-docs` and `diagram-design` (`32 packaged skills`).

## 4. Frontend Unit Tests

n/a. The repository has no frontend surface.

## 5. Integration Tests

| Check | Result |
|---|---|
| `install --tool all --dry-run` (scratch HOME) | `would install` at 7 paths: `.claude/skills`, `.config/opencode/skills`, `.gemini/config/skills`, `.gemini/skills`, `.gemini/antigravity-cli/skills`, and `.agents/skills` twice (the shared root) |
| `install --tool all` | exit 0 |
| `doctor --tool all` | `OK golang-pro` ×5; CLAUDE, OPENCODE, ANTIGRAVITY, CODEX, CURSOR `HEALTHY ok 54 \| missing 0 \| fixed 0` |
| `diff -r .claude/skills/golang-pro <installed>` | identical for all 6 installed directories, so bytes are kept through install |
| `git diff --stat bin/` (at T3b) | empty: FR-5 BUT holds, no installer change |

## 6. E2E Tests

n/a. There is no user journey; install and doctor above are the end-to-end path.

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test type | Test or command | Result | Gap / notes |
|---|---|---|---|---|---|
| FR-1 | Review passes; BUT no byte before verdict; AND IT MUST Trust Hub disposition | Manual (agent review) | `execution.md` T1: hashes, battery verbatim, perl C1/C1b, falsifiers, Reviewer PASS | PASS | Accepted gap §9: no automated gate by design (requirements §8) |
| FR-1 | Review fails → stop | Process | T1 stop path. The HITL stop fired on the flagged link and JC chose Option A | n/a | — |
| FR-2 | Upstream body kept; BUT no line changed; AND IT MUST schema | Contract | tests 1–9 | PASS | — |
| FR-2 | License and notice; AND IT MUST holder-name source | Contract | tests 2–7 (`LICENSE`), 10 | PASS | — |
| FR-3 | Pools list it; BUT no load-direct | Contract + grep | test 11; `grep -E "load .golang-pro\|use .golang-pro"` → 0 (T3a) | PASS | The load-direct BUT clause is a grep at T3a, not a suite test. Recorded, not a gap: the governance rule is also reviewed by the persona |
| FR-4 | Page, rows, governance row, counts 32, CHANGELOG | Contract | test 12, 16; `docs-overview` (a)(c)(d); count tests | PASS | The CHANGELOG clause was quote-checked by the Reviewer (T4), not by a test |
| FR-4 | AND IT MUST samber note | Contract | test 16 | PASS | Added at this phase |
| FR-4 | BUT no security claim beyond verdict | Contract (heuristic) + Reviewer | test 16 (`safe\|secure\|verified safe\|no risk` absent; bound sentence present); T3b Reviewer quote-check | PASS | The heuristic sees only those words. The Reviewer quote-check is the full gate |
| FR-5 | Every target; existing tests pass; BUT no installer change | Integration | §5 | PASS | Grok Bot is box-only and does not report skills in `doctor --tool all` |
| NFR-1 | < 60 KB | Contract | test 15 (52,775 B) | PASS | — |
| NFR-2 | no samber file | Contract | test 13 | PASS | — |
| NFR-3 | gates green | Commands | `npm test` 1249/0; `verify:cli` exit 0 and `pack:dry-run` (T4, quiet); `git diff --check` clean | PASS | `verify:cli`/`pack:dry-run` were not re-run after the +1 test, since only `test/` changed and `test/` is not packaged |

## 8. Remediation

None required.

## 9. Accepted Gaps

| Gap | Reason | Substitute |
|---|---|---|
| FR-1 unsafe-content class has no automated test | Recognizing prompt injection or misleading guidance in prose is a judgment (requirements §8) | T1 agent review with the battery quoted verbatim, a Reviewer PASS on attempt 2, and the hash lock (tests 2–8), which guarantees the shipped bytes are the reviewed bytes |
| FR-4 BUT is checked by a word heuristic | No test can classify every overclaim | Reviewer quote-checks at T2, T3b and T4 |
