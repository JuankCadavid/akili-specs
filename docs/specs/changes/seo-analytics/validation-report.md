# Validation Report — `/akili-seo` optional analytics phase (GA4 + Microsoft Clarity)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/seo-analytics` |
| Date | 2026-10-22 |
| Validated at | `022047e` (branch `feat/seo-analytics`; baseline `84765ff`) |
| Auditor | Independent T3 audit (`opus`, fresh context, author ≠ auditor: Implementers were `sonnet`). The Leader (Claude Opus 5.5) ran build integrity and wrote this report |
| Evidence | `test-report.md` (reused), `execution.md`, the auditor's clause walk (session scratchpad `validate-clausewalk.md`, ~90 rows) |

## 2. Summary

**Verdict: PASS with WARN.** There is no FAIL. Every FR-1…FR-14 and NFR-1…NFR-6 clause has an owning task, shipped text and test or review evidence. Six WARNs remain: one narrowed clause (V-1), wording drift (V-2, V-3, V-6) and stale spec figures (V-4, V-5). None is a dropped obligation that changes run-time safety.

| Area | Result |
|---|---|
| Tasks | 6/6 `[x]`, each with a Reviewer `PASS` |
| Build integrity | PASS |
| Requirement coverage | PASS, with V-1 and V-2 WARN |
| Design conformance | PASS, with V-6 WARN |
| Cross-document figures | WARN (V-4, V-5 stale) |
| Phrase sweep | WARN (V-3) |
| Proposal alignment | PASS |
| Archive readiness | Ready once the user accepts or fixes the WARNs (§12) |

## 3. Task Completion

| Task | Status | Evidence |
|---|---|---|
| T1 reference + test file | PASS | `execution.md` T1: 2 attempts, lenses PASS, source walk, falsifiers 1–5 |
| T2 command part A | PASS | T2: 2 attempts, safety PASS + conformance PASS, falsifiers 1–6, opt-out walk |
| T3 command part B | PASS | T3: 2 attempts, full PASS, falsifiers 1–3 |
| T4 `SKILL.md` | PASS | T4: 2 attempts, full PASS, falsifiers 1–3 |
| T5 docs, README, evals | PASS | T5: 2 attempts, checklist PASS, quote-check |
| T6 CHANGELOG + closure | PASS | T6: 2 attempts, full PASS, 8 FR-11 falsification reds |

## 4. File Existence

| Expected (design §2 / §4) | Present | Note |
|---|---|---|
| `.claude/skills/seo-audit/references/analytics.md` (new) | ✅ 212 lines | packaged (`pack:dry-run`) |
| `test/seo-analytics.test.js` (new) | ✅ 66 tests | — |
| `.claude/commands/akili-seo.md` | ✅ 394 lines | — |
| `.claude/skills/seo-audit/SKILL.md` | ✅ 637 lines | — |
| `evals.json`, `docs/commands/akili-seo.md`, `docs/skills/seo-audit.md`, `docs/skills/README.md`, `README.md`, `CHANGELOG.md` | ✅ | — |
| Not in design §2: `test/install-cursor.test.js` | ✅ | P-16 execute-time amendment (T1) |
| Not in design §2: `test/seo-analytics-contract.test.js` | ✅ 36 tests | added by `/akili-test` |

Actual: 12 files, 9 changed and 3 new. Design §2 says "Eight files change and two are new" (V-4).

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | 608 tests · 608 pass · 0 fail · 0 skipped (Node v25.2.1) |
| `npm run verify:cli` | exit 0 |
| `npm run pack:dry-run` | lists `references/analytics.md` (17.4kB); 310 files |
| `node bin/akili.js install --tool all --dry-run` | exit 0 |
| `git diff --check 84765ff` | clean |
| NFR-1 `git diff --stat 84765ff -- bin package.json scripts docs/model-routing.md .claude/templates` | empty |
| CI Node 18/22 | `UNVERIFIED`: no push this cycle |

## 6. Requirement Coverage

| ID | Area | Result | Evidence | Remediation |
|---|---|---|---|---|
| V-1 | FR-4 table row 1 | **WARN** | requirements FR-4 row 1 asks for consent "before analytics cookies are set **or analytics hits are sent**". The command (`akili-seo.md:272`) and the reference (`analytics.md:119`) say only "a … hit that **sets storage** before the banner is answered", and the reference line omits the jurisdiction qualifier. Recorded as an advisory in T1/T2 | Add "or sends a hit" to both lines, plus the jurisdiction qualifier in the reference |
| V-2 | FR-11 "cover all behavior metrics" | **WARN** (low) | Six surfaces carry all 11 metrics (contract suite). `README.md:801` "(bounce rate, heatmaps, recordings)" and `docs/commands/akili-seo.md:70` "(bounce or engagement rate, heatmaps, recordings)" read as complete lists | Prefix "e.g." or give the full list |
| V-7 | All other clauses | PASS | FR-2 state table rows 1–4, FR-4 rows 2–5, every scenario THEN/BUT/AND clause and NFR-1…6 are present and cited to `test-report.md` §7 | — |

Negative constraints and strict validations are each pinned by `test/seo-analytics-contract.test.js` (55/55 mutation reds) or by the author suite.

## 7. Linting & Code Quality

No linter is configured for markdown. `git diff --check` is clean.

| ID | Area | Result | Evidence | Remediation |
|---|---|---|---|---|
| V-3 | Ranking-rule wording | **WARN** | `SKILL.md:419` "Google has explicitly denied it" follows "Never claim that any behavior metric affects Google or Bing ranking", so it can be read as a Google denial covering all behavior data. That is the claim class T4 attempt 1 failed on. `:416` "Google has denied this for roughly a decade" is untiered (pre-existing). Softened by `:414`, which tiers the statement `[INDUSTRY]` | `:419` → "…the bounce-rate claim, which Google has said it does not use (`[INDUSTRY]`)"; `:416` → add a tier or delete |

**4R advisory findings (advisory, not verdicts), still true at HEAD:**
- Reliability: no redaction rule for `cid`/`sid`/payload when a GA4 collect URL is used as consent Evidence (FR-4 vs FR-13). The command's Clarity consent check omits EEA/UK/CH. `analytics.readonly` is not named in the command.
- Readability: the masking sentence "surrounding text is not" holds only under unmask or Relaxed. The test-traffic disclosure sits inside the Conversion bullet. `akili-seo.md:152` says "**Analytics** section" while the heading is "Analytics & Conversion Measurement". The token rule is stated twice in the reference. The CHANGELOG Mueller clause omits SERoundtable and the conflicting dates.
- Risk: the GDPR links serve the UK GDPR reproduction with no note. The ePrivacy row omits the transmission exception.
- Reliability (tests): the GEO-stop guard proves the stop, not isolation. README/docs omit the single Low finding. Eval 10 omits the jurisdiction qualifier.

## 8. Design Conformance

| ID | Area | Result | Evidence | Remediation |
|---|---|---|---|---|
| V-8 | §5.1, §6, §7, §9.1, §9.2, DD-1…DD-13 | PASS | items 11–15 and disclosure `akili-seo.md:310-315`; every §7 site present; reference §1–9. The three execute-time amendments (P-16; §7 Error Handling; §9.2) are recorded in `execution.md` and match what shipped | — |
| V-6 | §5.2 closed vocabulary | **WARN** (low) | `akili-seo.md:316` "Use only the Phase 2B state strings", but the declined string is defined in Phase 0. GA4 403 (`:385`) does not use the §5.2 template `GA4: data audit skipped — …; obtain: …`. Clarity 401/403 (`:386`) give no skip state | Point `:316` at "the Phase 0 and Phase 2B states"; phrase `:385-386` with the template |
| V-4 | Cross-document figures | **WARN** (stale) | design §2 "Eight files change and two are new"; requirements §4 "one new test file"; execution T6 "11 files, 784+, 27−". At HEAD: 12 files, 1204+ / 27− | Update at archive |
| V-5 | Premise Ledger | **WARN** (low) | design §12 count line still reads "24 verified · 3 `UNVERIFIED`", and the P-21/P-23/P-27 rows still carry the marker; `execution.md` T1 settled all three | Update the rows and the count at archive |
| V-9 | Figures that agree | PASS | 66 + 36 + 506 = 608; 572 after execute; 65 → 66 assertions reconciled; 394/637/212 lines; 14 rounds; eval ids 1–11; every CHANGELOG count holds | — |
| V-10 | Proposal | PASS | Option A; Q1–Q8 and D-1 honored; non-goals respected (read-only, no installer change) | — |
| V-11 | Spec-path leakage | PASS | No shipped file contains `docs/specs/changes/seo-analytics` | — |

## 9. Test Evidence Summary

`test-report.md` is PASS: 608/608, no PRODUCT_BUG, 55/55 mutation reds in the contract suite, and the Leader's spot mutation was red. Accepted gaps: run-time agent behavior, legal accuracy (covered by the T1 source walk) and the CI Node 18/22 legs. The report is current at `022047e`.

## 10. Agent Guide / Constitution Impact

No `## Constitution Impact` block in `execution.md`: no module was created or reshaped, and no public CLI surface changed (NFR-1). Nothing pending for `/akili-archive` guide sync. A CodeGraph re-index is routine at archive.

## 11. Remediation

| # | Finding | Fix | Size | Recommendation |
|---|---|---|---|---|
| 1 | V-1 | Add "or sends a hit" to `akili-seo.md:272` and `analytics.md:119`, plus the jurisdiction qualifier in the reference | 2 lines | Fix: closes an FR-4 clause |
| 2 | V-3 | Reword `SKILL.md:419`; tier or delete `:416` | 2 lines | Fix: same claim class as the T4 FAIL |
| 3 | V-6 | `akili-seo.md:316` wording; `:385-386` use the §5.2 skip template | 3 lines | Fix |
| 4 | V-2 | "e.g." before the metric lists in `README.md:801` and `docs/commands/akili-seo.md:70` | 2 lines | Fix |
| 5 | V-4, V-5 | Update design §2, requirements §4, the §12 ledger rows and count | spec docs | At archive (spec-sync) |

Items 1–4 are text-only, about 9 lines, under the approved requirements. Fixing them needs a review pass, but the execute review budget is spent (14/14 rounds). Either accept them as WARN, or fix them as a post-validation rework with one Reviewer pass that the user approves.

## 12. Archive Readiness Recommendation

**Ready to archive once the user decides on the WARNs.** All tasks are `[x]`, there is no FAIL, tests cover every requirement, and drift is recorded in `execution.md`. Recommended: fix items 1–4 (one rework plus one review), then `/akili-archive changes/seo-analytics`, which syncs item 5.
