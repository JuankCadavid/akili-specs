# Test Report: Modern Web Guidance (`changes/modern-web-guidance`)

> **Status: PASS.** JC ruled on both test-phase decisions on 2026-11-17 (§8).
> - **Results:** `npm test` passed 2109 of 2109 at `/akili-test` (0 fail, 0 skipped); 2111 of 2111 after the `/akili-validate` W-1 fix added 2 tests (§3). Every FR-1 to FR-11 and NFR-1 to NFR-4 clause has test evidence or a recorded reason. No product bugs.
> - **New tests:** 8 gap tests in `test/web-platform-guidance-coverage.test.js` (78 LOC). Each one was shown red against the shipped text before it went green.
> - **JC rulings (§8):**
>   1. The renamed file is kept.
>   2. The LOC budget is raised to ~1,470 to absorb its 78 LOC.

## 1. Document Control

| Field | Value |
|---|---|
| Spec | `docs/specs/changes/modern-web-guidance/` |
| Branch / HEAD tested | `feat/modern-web-guidance` @ `da5b57f`, plus the uncommitted new test file |
| Date | 2026-11-17 |
| Leader | opus (session) |
| Tester | 1 Tester on opus. Every Implementer on this spec ran on sonnet, with no escalations recorded in `execution.md`, so the Tester is not an author |
| Skills | `tdd` (Tester) |
| Status | PASS |
| Budget (spec LOC) | ~1,120 → ~1,400 (JC, T12 tripwire) → **~1,470** (JC, 2026-11-17, `/akili-test` end gate). Actual: ~1,469 |
| JC rulings | D-1 keep `test/web-platform-guidance-coverage.test.js`, NFR-2 allowlist unchanged; D-2 accept the overrun, budget ~1,470 (§8) |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 1: backend unit (text contracts over shipped files, `node:test`) |
| Testers spawned | 1, sequential. No suite ran inline |
| Frontend / Integration / E2E | Not applicable. The product is rule text and docs. The one CLI behavior (`install --tool all --dry-run`) is covered by the author's T14 test |
| Design-detector suite | Not applicable: the spec ships no web UI |
| Author tests cited, not rewritten | `test/modern-web-guidance.test.js` (89 tests, T2–T14), plus the consumer suites below |
| New tests | 8, in `test/web-platform-guidance-coverage.test.js` |
| `npm test` before / after | 2101/2101 → **2109/2109** |
| Non-author re-run (Leader) | VERIFIED. 2109/2109, the new file 8/8, red #5(b) reproduced, shipped file byte-restored |
| Lookup note (Tester) | TRD and UX/UI design: none. Read requirements §6–§8 and the `execution.md` T1 security record |

## 3. Backend Unit Tests

| Command | Result |
|---|---|
| `npm test` | 2109 pass, 0 fail, 0 skipped at `/akili-test`. **2111 pass**, 0 fail, 0 skipped after the `/akili-validate` W-1 fix added 2 tests to `test/modern-web-guidance.test.js` (2026-11-18) |
| `node --test test/modern-web-guidance.test.js` after the W-1 fix | 91/91 (89 + 2) |
| `node --test test/modern-web-guidance.test.js` | 89/89 |
| `node --test test/web-platform-guidance-coverage.test.js` | 8/8 |
| `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` | exit 0, exit 0, clean (Tester run) |

New tests. Each red came from mutating `.claude/skills/impeccable-bridge/references/modern-web.md`, and the file was then byte-restored and checked with `cmp`:

| # | Clause | Red observed |
|---|---|---|
| 1 | FR-6 trigger containment: the upstream "MANDATORY: Execute FIRST" description never triggers MWG off a web UI route | regex `/…that description never triggers it/` did not match |
| 2 | FR-4 gate conditions: plugin-namespaced source, Node major < 22, consent Yes → `ready`, no answer → `declined` | `/absent or major < 22/` did not match |
| 3 | FR-4: consent is asked once per session; install routes are printed once per session, by `missing` only | `/\*\*The consent question\*\* is asked once per session/` did not match |
| 4 | FR-4: `call failed` retries once with the documented remedy | `call failed retries once` |
| 5 | FR-4 AND / BUT: no call before `ready`, nothing installed without consent, every non-ready state finishes with Impeccable or its fallback | (a) "lets the step finish" removed; (b) "No MWG call is made before `ready`" weakened. Both red |
| 6 | FR-5 default pin AND: the default changes only through a spec | ``/`1\.0\.1`\. It changes only through a spec/`` did not match |
| 7 | FR-6 disclosure content: guide ids, what each changed, or why none applied | `/…or why none applied/` did not match |
| 8 | FR-8 scan order and report contents: the gate runs before `legacy-scan`; the report states pin, path, gate state, kept and dropped counts | (a) contents removed; (b) steps swapped; (c) heading renamed. All red, including the heading guard |

Process caveat (Tester): this file's first green run happened before its reds. Every assertion was then proven red by mutating the shipped text.

## 4. Frontend Unit Tests

Not applicable: no frontend code.

## 5. Integration Tests

Not applicable as a separate suite. The single CLI path, `node bin/akili.js install --tool all --dry-run` on a clean HOME, is asserted by `cross-cutting (FR-10 THEN)` in the author suite.

## 6. E2E Tests

Not applicable: no user journey in a UI.

## 7. Coverage & Traceability

Author tests are cited by title prefix from `test/modern-web-guidance.test.js`. New tests are cited by "new #n". Every row passes.

| Requirement | Clauses | Test evidence | Result |
|---|---|---|---|
| FR-1 Security verdict | THEN verdict, AND classification, BUT (review fails → Pivot) | Recorded evidence: `execution.md` → *T1 security review record* (Verdict `PASS`, F-5 handled by the JC amendment). Shipped claims are checked by `docs (FR-11 BUT): the security record…` and `changelog (FR-11 BUT, DD-11)`. No test reads the spec folder (KZ-changes--archify-diagrams-1) | Covered (recorded) |
| FR-2 Governance | Category, Apache-2.0, never vendored; three selectors; per-selector outcome; BUT no direct load, not vendored, never in a skills list, brief or Skill Map; AND restatements | `governance (FR-2, DD-1)`, `governance (FR-2)` ×2, `constitution (FR-2 AND)`, `bridge entry (FR-2 BUT)`, `governance (FR-2, DD-15)`, `rules file (DD-15, FR-2 BUT)`, `specify (FR-2 BUT, DD-15)`, `constitution (FR-9, FR-2 BUT, DD-15)`, `docs (FR-2 AND, P-16)` ×3, `changelog (FR-2 AND)` | PASS |
| FR-3 Design matrix | Route field and pin source; card limits; Impeccable stays lead; non-web field absent or `none — <reason>`; BUT no load, gate or install | `matrix (FR-3)` ×2, `matrix (DD-4)`, `rules file (design §8.1)` | PASS |
| FR-4 Gate | Six states, one line each; conditions; once per session; retry; AND finish with fallback; AND telemetry off; BUT no call before ready or install without consent; BUT pre-approved is not consent; BUT no unpinned fallback; AND IT MUST NOT block; F-5 amendment | `rules file (FR-4 Gate)` ×2, new #2–#5, `rules file (DD-5)`, `(DD-14, FR-4 MUST)`, `(FR-4 BUT)` ×2, `(DD-6)`, `(T1 F-5 amendment)`, `(T1 F-3)`, `test (FR-7)`, `validate (FR-7)`, `audit (FR-8, FR-4)`. The JC ruling holds: no shipped text fails, stops or blocks | PASS |
| FR-5 Pin | Default `1.0.1`; spec-only change; override and pin source; AND IT MUST grammar and invalid-pin fallback; upstream `@latest` loses to the pin; BUT no `@latest` shipped | `rules file (FR-5, DD-7)`, new #6, `rules file (FR-4 Gate)`, `constitution (FR-9, FR-5, DD-7)`, `constitution (FR-5, FR-9)`, `rules file (FR-5)` grammar, `rules file (FR-5, FR-6, T1 F-2)`, `rules file (FR-5 BUT)`, `cross-cutting (FR-5 BUT)` (packed-file parity 430/430), `docs (FR-11, KZ-…)` | PASS |
| FR-6 Disclosure and trigger | Placement allowed and forbidden; content; done-criteria; trigger containment | `rules file (FR-6)`, new #7, `matrix (FR-6)`, new #1 | PASS |
| FR-7 Phase wiring | Specify; execute Build route; test; validate; BUT no copied rules; AND IT MUST non-web unchanged (amended) | `specify (FR-3, FR-7)`, `matrix (DD-16)` ×2, `rules file (FR-7)`, `test (FR-7)` ×2, `validate (FR-7)` ×2, `cross-cutting (FR-7 BUT, NFR-3)`, `specify (NFR-3)`, `audit (FR-8, DD-9)`, `cross-cutting (FR-7 AND IT MUST)` | PASS |
| FR-8 Audit scan | Opt-in, pinned; keepWhen/dropWhen; gate first; report contents, path, 20% caveat; routing; BUT report-only, no *Modernize*, never tasks; not applicable / not ready; not a drift report | `audit (FR-8, P-26)`, `rules file (FR-8…)`, new #8, `audit (FR-8)` path, `propose (FR-8)` ×4, `audit (FR-8 BUT)`, `audit (FR-8, FR-4)`, `audit (P-23)` | PASS |
| FR-9 Skill Map row | Web UI only, ask first, *When to load* text, optional pin; BUT never asserts installed; item 4 field | `constitution (FR-9…)` ×5, plus `design-skill-routing-coverage` (seven fields, pointer last) | PASS |
| FR-10 Install | No installer or package change; install routes (verified, unverified, pinned); no Grok Bot route | `cross-cutting (FR-10 THEN)`, `install-cursor.test.js` `SKILL_FILE_EXPECTED`, `rules file (FR-10)`, `rules file (design §8.5, FR-10)`, `docs (FR-10)`, `changelog (FR-11 BUT)`, `docs (FR-11 BUT, P-10)` | PASS |
| FR-11 Docs and CHANGELOG | Docs present; CHANGELOG; Apache-2.0 and Google Chrome; BUT no Grok, eval figures and MDN only cited, no claim beyond the verdict | `docs (FR-11)`, `docs (FR-11 AND)`, `changelog (FR-11 THEN, AND)`, `docs (FR-11 BUT, P-10)`, `docs (FR-11 BUT, DD-11…)` ×2, `docs (FR-11 BUT): security record` | PASS |
| NFR-1 | Node `>=18`, no `npx` or network in tests | `cross-cutting (NFR-1)` | PASS |
| NFR-2 | No MWG file in the repo | `cross-cutting (NFR-2)` | PASS |
| NFR-3 | Rules held once | `cross-cutting (FR-7 BUT, NFR-3)`, `specify (NFR-3)` | PASS |
| NFR-4 | All gates green | This run: `npm test`, `verify:cli`, `pack:dry-run`, `git diff --check` | PASS |

Consumer suites, all green in the full run: `impeccable-bridge`, `install-cursor`, `design-skill-routing`, `design-skill-routing-coverage`, `backend-skill-routing-coverage`, `design-eval-contract` (pattern 7), `docs-overview`, `akili-security-command`.

## 8. Remediation

There are no failures and no product bugs. JC ruled on both test-phase decisions (2026-11-17):

| # | Decision | Detail | Ruling (JC) |
|---|---|---|---|
| D-1 | New file name | The brief named `test/modern-web-guidance-coverage.test.js`. Once committed, that name fails `cross-cutting (NFR-2)` (`test/modern-web-guidance.test.js:1028`), which allows only two tracked paths matching `/modern-web\|mwg/i`. The Tester renamed it to `test/web-platform-guidance-coverage.test.js` | **A: keep the rename.** The original name is not used, and the NFR-2 allowlist is unchanged |
| D-2 | LOC budget | The spec ran ~1,391 of ~1,400 LOC at T14. The 78 new test LOC bring it to **~1,469**, +69 over. `/akili-test` has no tripwire rule of its own, but the spec budget is the one JC raised at T12, so the overrun goes to JC | **A: accept the overrun.** The spec LOC budget is raised to **~1,470** |

## 9. Accepted Gaps

| Gap | Reason |
|---|---|
| Agent behavior: whether an agent actually writes the route field, keeps disclosures out of spec docs, or skips the gate on non-web work | Not testable in this harness. Requirements §8 accepts this risk; the tests cover the rule text |
| FR-1 BUT, the "review fails → Pivot" path | A process step that never fired (verdict `PASS`) |
| FR-10 "verified at the pin", whether upstream accepts each install route | Needs the network, which NFR-1 forbids. The text is tested; the upstream fact rests on the T1 record |
| Exact `<x.y.z>` grammar in the Step 8D scaffold text | Covered by the author's pin-grammar test; a second test would be a duplicate |
