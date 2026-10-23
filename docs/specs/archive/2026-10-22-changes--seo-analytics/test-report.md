# Test Report: `/akili-seo` optional analytics phase — GA4 + Microsoft Clarity

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/seo-analytics` |
| Date | 2026-10-22 |
| Tested at | `91d8080` plus `test/seo-analytics-contract.test.js` (new) |
| Leader | Claude Opus 5.5 |
| Tester | 1 spawned (`opus`, general-purpose sub-prompt seeded with `.agents/tester.md`; Implementers were `sonnet`, so author ≠ tester) |
| Runtime | Node v25.2.1 local. CI Node 18/22 legs are `UNVERIFIED` (no push this cycle) |

## 2. Summary

**Status: PASS.** `npm test` gives **608 tests, 608 pass, 0 fail, 0 skipped**, against a baseline of 506 before the spec and 572 after `/akili-execute`.

| Item | Result |
|---|---|
| Suites | 1 delegated: text-contract negative constraints (36 tests, new file). The author TDD suite (66 tests) is cited, not rewritten |
| Mutation evidence | Tester: 55 of 55 scratch-copy mutations red on their target test (`SEO_ROOT` points the suite at a copy, so no repo file is mutated). Leader spot check: removing "Never submit a form with real data" from a copy of the command gave 35 pass / 1 fail |
| Product bugs | none |
| Requirement coverage | FR-1…FR-14 and NFR-1…NFR-6 each have test or command evidence (§7). Run-time agent behavior is an accepted gap (§9) |
| Delegation | 1 suite, 1 Tester, not parallel (single suite). Nothing run inline. Skills: `tdd`. Effort: high |

What the new suite closes: the Reviewers' recorded gaps from `/akili-execute`. These are the `BUT must NOT` and `AND IT MUST` clauses the author tests left unpinned:
- "violates" and "compliant" verdicts
- Ley 1581 as a cookie-banner mandate
- real form submission
- Relaxed masking
- FR-8's no-conversion-action case
- the FR-9 quota, window and truncation rules
- "causing" wording in FR-10
- the FR-6 fallback order
- the full 11-term metric list on six surfaces
- read-only (NFR-6)
- FR-1 gating

## 3. Backend Unit Tests

The deliverable is markdown rules text plus text-contract tests run by `node --test`. "Unit" here means a heading-scoped assertion over a shipped file.

| Suite | File | Tests | Result |
|---|---|---|---|
| Author TDD (T1–T5) | `test/seo-analytics.test.js` | 66 | 66/66 PASS |
| Negative constraints (`/akili-test`) | `test/seo-analytics-contract.test.js` | 36 | 36/36 PASS |
| Existing suite, including the `install-cursor` count pin updated in T1 | `test/*.test.js` | 506 | 506/506 PASS |

Commands: `node --test test/seo-analytics.test.js` · `node --test test/seo-analytics-contract.test.js` · `npm test`.

## 4. Frontend Unit Tests

n/a. No UI surface.

## 5. Integration Tests

| Check | Command | Result |
|---|---|---|
| Package contents (NFR-5) | `npm run pack:dry-run` | lists `.claude/skills/seo-audit/references/analytics.md` (17.4kB) |
| CLI verify (NFR-5) | `npm run verify:cli` | exit 0 (12 commands, 27 skills, 8 resources) |
| No installer/runtime change (NFR-1) | `git diff --stat 84765ff -- bin package.json scripts docs/model-routing.md .claude/templates` | empty |
| Whitespace | `git diff --check` | clean |

These were run during `/akili-execute` T6 and re-run by the Leader. Nothing outside `test/` has changed since then.

## 6. E2E Tests

n/a for automation: an end-to-end run needs a live site with GA4/Clarity, credentials and an agent. `evals.json` ids 10 and 11 are the behavioral proxy, and CI does not run them (§9).

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test type | Test file or command | Result | Gap or notes |
|---|---|---|---|---|---|
| FR-1 | Declined state, asked once, Phase 2B position, `:57` scoped | text contract | `seo-analytics.test.js` (FR-1 ×4) | PASS | — |
| FR-1 | Phase 2B gated on Phase 0; Phases 1–5 complete; sections 11–13 accept the declined string; Phase 5 names the state | text contract | `seo-analytics-contract.test.js` (FR-1 ×4) | PASS | run-time skip is §9 |
| FR-2 | Static fetch alone never reports absence; `obtain:` suffix | text contract | `seo-analytics.test.js` | PASS | — |
| FR-3 | Measurement-ID consistency; no ms/score claim | text contract | `seo-analytics.test.js` | PASS | — |
| FR-4 | Not legal advice; Other jurisdictions; Ley 1581 Arts. 3/9/12; four Consent Mode parameters; datos personales | text contract | `seo-analytics.test.js` | PASS | legal accuracy verified by the T1 source walk |
| FR-4 | BUT no "violates"/"compliant" verdict; signal phrase names rule and tier; never a cookie-banner mandate; finding or pass | text contract | `seo-analytics-contract.test.js` (FR-4 ×6) | PASS | — |
| FR-5 | Intercepted click; test-traffic disclosure | text contract | `seo-analytics.test.js` | PASS | — |
| FR-5 | BUT never submit a real form (command + reference) | text contract | `seo-analytics-contract.test.js` (FR-5 ×2) | PASS | Leader mutation red |
| FR-6 | No Admin link resource; probe; evidence suffix | text contract | `seo-analytics.test.js` | PASS | — |
| FR-6 | Probe error → owner confirmation before `not determined` | text contract | `seo-analytics-contract.test.js` | PASS | — |
| FR-7 | Strict/Balanced pass, Relaxed is a finding; inputs masked in all modes | text contract | `seo-analytics-contract.test.js` (FR-7 ×3) | PASS | "Relaxed is a finding" derives from design P-7, not FR-7 verbatim |
| FR-8 | Skip string; exactly one Low | text contract | `seo-analytics.test.js` | PASS | — |
| FR-8 | AND IT MUST NOT raise when no conversion action exists; never more than one | text contract | `seo-analytics-contract.test.js` (FR-8 ×2) | PASS | closes the M4 gap |
| FR-9 | Quota, ≤ 3 requests, number used, window, 1,000-row truncation, 400/429 handling | text contract | `seo-analytics-contract.test.js` (FR-9 ×4) | PASS | — |
| FR-10 | BUT no "causing"; normalization, unmatched rows, 3 caveats; item 13 | text contract | `seo-analytics-contract.test.js` (FR-10 ×4) | PASS | — |
| FR-11 | (a) + (b) on 8 surfaces | text contract + falsification | `seo-analytics.test.js`; T6 falsification (8 reds) | PASS | — |
| FR-11 | All 11 Glossary metrics on 6 list-bearing surfaces | text contract | `seo-analytics-contract.test.js` (×6) | PASS | closes the `engagement time` gap |
| FR-12 | Items 11–15 in order; M&C in item 14 and Phase 4 | text contract | `seo-analytics.test.js` | PASS | — |
| FR-13 | Token, key contents and OAuth credential never in the report | text contract | `seo-analytics.test.js` | PASS | — |
| FR-14 | Docs Core Rules; evals ids 1–11; CHANGELOG quote-check | text contract + review | `seo-analytics.test.js`; T6 Reviewer quote-check | PASS | — |
| NFR-1 | No change in bin/package/scripts/templates | command | `git diff --stat 84765ff -- …` | PASS | — |
| NFR-2 / NFR-3 | Command ≤ 440 (394); SKILL ≤ 658 (637) | text contract | `seo-analytics.test.js` | PASS | — |
| NFR-4 | Every Sources line tiered and dated, ≥ 8 lines | text contract | `seo-analytics.test.js` | PASS | — |
| NFR-5 | verify:cli, pack:dry-run | command | §5 | PASS | — |
| NFR-6 | Write tool and `--allow-write` only in prohibitions; Phase 2B read-only; `analytics.readonly` | text contract | `seo-analytics.test.js`; `seo-analytics-contract.test.js` (NFR-6 ×4) | PASS | — |

## 8. Remediation

None required. No FAIL and no PRODUCT_BUG.

## 9. Accepted Gaps

| Gap | Why not automated | Substitute |
|---|---|---|
| Run-time agent behavior: avoids verdict and "causing" wording in a real report; intercepts the WhatsApp click; never submits a form; stays within the Clarity quota; never calls MCP write tools; asks the Phase 0 question once; a declined run matches a run without this change | Needs a live site, credentials and an agent run; no harness exists (requirements §8 accepted risk) | Text-contract tests prove the instructions; `evals.json` ids 10–11 are a manual proxy; T2 opt-out walk |
| Legal and vendor accuracy | No checker can judge a law quote | T1 source walk plus an independent Reviewer re-fetch of every source (`execution.md` T1) |
| CI Node 18/22 | No push this cycle | The user's first push runs the six `CLI on <os> / Node <18\|22>` checks |
