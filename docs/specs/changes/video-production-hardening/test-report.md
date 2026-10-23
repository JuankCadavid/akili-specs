# Test Report: Video Production Hardening

**Overall status: PASS on the reduced scope (T1–T14).** `npm test` 724/724, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` are clean. Every in-scope THEN/BUT/AND clause has a located assertion, proven by mutation walks. FR-11 *Wrapper derivation* and *No distinct model on a host*, FR-11 *Rule text* outside `/akili-test` and the two personas, FR-18 and FR-19 are **not tested**: they were deferred with T15–T21 (owner scope cut, 2026-10-23).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-production-hardening` |
| Type / Deliverable | Change / software (no render evidence suite) |
| Scope tested | T1–T14 (PR 1: video skill + pins; PR 2: commands, personas, judgment-day, contracts) |
| Scope not tested | T15–T21, deferred — see `execution.md` → *Scope cut* |
| Date | 2026-10-23 |
| HEAD at test time | ad09d6a, plus the removal of the parked T15 patch file (T15 work now on local branch `deferred/T15-tester-derivation`, commit ada841b) |
| Approval Mode | pre-approved (Juan Carlos Cadavid, 2026-10-23) |

## 2. Summary

| Item | Result |
|---|---|
| Suites | 1 (regression + contract coverage) |
| Testers | 1, `haiku` (role T2). Model chosen under the rule this spec ships in `/akili-test`: the Implementer models were `sonnet` (T2) and `opus` (recorded ceiling-rung escalations on T5 and T14), and the Leader runs on `opus`, so the suite was neither inline nor on either Implementer model |
| Tests written by the Tester | 0 — the in-scope clauses are covered by the authors' TDD tests (T5, T14), cited, not rewritten |
| Full suite | `npm test`: tests 724, pass 724, fail 0 (655 at 34afbff; +69 = 17 new in `video-production.test.js` + 52 in `command-contracts.test.js`) |
| Product bugs | none |
| Findings | 1 hygiene finding, fixed: `git diff --check b7bdb3b HEAD` exited 2 with 9 trailing-whitespace hits, all in the saved T15 patch file (blank context lines). The patch was moved to a local branch and the file removed; the re-run is clean |
| Lookup note (Tester) | Read `.agents/tester.md`, `execution.md` *Scope cut* only, and test titles via `grep` |

## 3. Backend Unit Tests

Not applicable as a separate layer: the spec ships rules text and text-contract tests, no backend code (the code task, T15, is deferred).

## 4. Frontend Unit Tests

Not applicable: no UI.

## 5. Integration Tests — text contracts and regression

| Command | Result |
|---|---|
| `npm test` | exit 0 · `# tests 724` · `# pass 724` · `# fail 0` · `# cancelled 0` · `# skipped 0` |
| `npm run verify:cli` | exit 0 · `Summary: 12 commands \| 27 skills \| 8 resources (akili-specs v2.35.0)` |
| `npm run pack:dry-run` | exit 0 · `akili-specs-2.35.0.tgz` · `total files: 310` |
| `git diff --check` (working tree) | exit 0, no output |
| `git diff --check b7bdb3b` (spec range) | first run exit 2 (9 hits in the T15 patch file); after moving the patch to a branch: exit 0 |

Author suites (cited):

| File | Tests | Proof of strength |
|---|---|---|
| `test/video-production.test.js` | 33 (16 → 33) | T5 attempt 3: 91 single-term mutations built from `requirements.md`, 91 red / 0 green; `fable` Reviewer added 13 independent mutations, all red |
| `test/command-contracts.test.js` | 52 (new) | T14 attempt 3: 117 mutations, 117 red / 0 green; `fable` Reviewer added 12 independent mutations, 11 red + 1 green control |

## 6. E2E Tests

Not applicable: no user journey; the rules are read by agents, and their wording is pinned by the contract tests above.

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test type | Test file | Result | Notes |
|---|---|---|---|---|---|
| FR-1 | *Default snapshot* (THEN, BUT every line, AND IT MUST consent line); *Consent per use* | contract | `video-production.test.js` | PASS | |
| FR-2 | *Output flag*, *Sanitize*, *Logs `.txt`*, *Skill refresh* (incl. the stated reason) | contract | `video-production.test.js` | PASS | |
| FR-3 | *Route per host*, *Lock mismatch* (incl. "still pass on a found router"), *No stale names* | contract | `video-production.test.js` | PASS | |
| FR-4 | *Film artifacts* (owner and storage of `story.md`, `SPEC.md`, `snapshot --review`, `REVIEW.md`); *Music bed* | contract | `video-production.test.js` | PASS | |
| FR-5 | *Bundled is not local*; *Brand source* | contract | `video-production.test.js` | PASS | |
| FR-6 | *Deferred*, *Default*, *Recorded downstream* | contract | `command-contracts.test.js` | PASS | skill side (render-evidence final-look step 4, SKILL.md delivery row, phase-map delivery row) has **no pin** — text present, verified by validation (W-4); pin deferred |
| FR-7 | *Outline replaces the delta*; *Specify converts it* | contract | `command-contracts.test.js` | PASS | |
| FR-8 | *No n/a software sections* (THEN with section contents, BUT, AND mixed) | contract | `command-contracts.test.js` | PASS | |
| FR-9 | *Greenfield* (THEN, AND IT MUST, BUT) | contract | `command-contracts.test.js` | PASS | |
| FR-10 | *Daemon present*; *One render* | contract | `video-production.test.js` | PASS | |
| FR-11 | *Runtime spawn* (THEN, AND IT MUST stop, BUT inline) | contract | `command-contracts.test.js` | PASS | |
| FR-11 | *Rule text* in `akili-test.md`, `leader.md`, `tester.md` | contract | `command-contracts.test.js` | PASS | |
| FR-11 | *Wrapper derivation*; *No distinct model on a host*; *Rule text* elsewhere | — | — | NOT TESTED | deferred (T15–T19) |
| FR-12 | *Owner mandate* (identical at three sites); *Video gate multiplier* | contract | `command-contracts.test.js` | PASS | |
| FR-13 | *Ceiling with a distinct Reviewer*; *No distinct Reviewer* | contract | `command-contracts.test.js` | PASS | exercised live on T5 and T14 (see `execution.md`) |
| FR-14 | *Missing exit fade* | contract | `video-production.test.js` | PASS | |
| FR-15 | *Multi-line brief* (four commands) | contract | `command-contracts.test.js` | PASS | |
| FR-16 | *Literal path mandated*; *Source supplied* | contract | `command-contracts.test.js` | PASS | |
| FR-17 | *Fix only* (specify, judgment-day) | contract | `command-contracts.test.js` | PASS | |
| FR-18 | `akili --version` | — | — | NOT TESTED | deferred (T20) |
| FR-19 | CHANGELOG, docs mirrors, issue cites, tests, summary surfaces | partial | — | PARTIAL | issue cites (#6136–#6139) shipped and pinned; CHANGELOG, docs mirrors and closing sweep deferred (T18, T21) |
| NFR-1 | software specs unaffected | contract + grep | `video-production.test.js` | PASS | `Deliverable: video` counts: specify 7 (≥5), test 4 (≥3), validate 4 (≥4) |
| NFR-2 | 3 files, ≤ 20,000 bytes | contract + measure | `video-production.test.js` | PASS | 3 files, 17,306 bytes |
| NFR-3 | no HyperFrames text copied | review | T1/T2 Reviewer walks | PASS (review) | not executable |
| NFR-4 | four commands green | command | §5 | PASS | owned by T21 (deferred); run here anyway |
| NFR-5 | tool-agnostic wording | review | every rules task's Reviewer | PASS (review) | not executable |
| NFR-6 | no test reads `docs/specs/changes` | grep + self-check | both files | PASS | `grep -rn "docs/specs/changes" test/` → no hits |

## 8. Remediation

None required for the tested scope. The one finding (whitespace in the parked patch) was fixed by moving the T15 work to the local branch `deferred/T15-tester-derivation`.

## 9. Accepted Gaps

| Gap | Reason | Owner |
|---|---|---|
| FR-11 *Wrapper derivation*, *No distinct model on a host* | Code deferred (T15, parked unreviewed on `deferred/T15-tester-derivation`) | future spec |
| FR-11 *Rule text* in the constitution, `docs/model-routing.md`, `docs/cli.md`, `README.md`, `docs/flow.md`, `docs/commands/akili-test.md` | Deferred (T16–T19); these docs still state the Tester model as a preference while `/akili-test` and the personas state a MUST | future spec |
| FR-18 | Deferred (T20) | future spec |
| FR-19 CHANGELOG, docs mirrors, closing sweep | Deferred (T18, T21); a CHANGELOG entry is owed before any release that ships this scope | future spec / release prep |
| NFR-3, NFR-5 | Not executable; covered by Reviewer walks | — |
