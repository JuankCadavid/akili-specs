# Kaizen Entry — changes/seo-analytics

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/seo-analytics` |
| Date | 2026-10-22 |
| Branch | feat/seo-analytics (spec branch: `Default Branch: master`, `Integration Branch: dev`) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 6 | tasks.md |
| Reviewer FAIL rework attempts | 6, one per task. T1 ×1 (FR-7 Relaxed, FR-13 credentials, `hostName`; Mueller date, unlabelled Clarity tag URL) · T2 ×1 (FR-7 Relaxed, FR-4 "finding or a pass") · T3 ×1 (GSC probe error skipped owner confirmation) · T4 ×1 (`:414` untiered all-behavior-data claim) · T5 ×1 (eval 10 overstated the signal wording) · T6 ×1 (CHANGELOG claimed the full metric list on a surface missing `engagement time`) | execution.md, T1–T6 entries |
| HALTs / FATAL_FAILs | 0 / 0 | execution.md |
| Pivots | 0. Three execute-time design edits (P-16 consumer; §7 Error Handling; §9.2), none changing a requirement's meaning | execution.md, T1/T3/T4 *Decisions made* |
| Budget | 6 of 7 tasks · 811 of ~900 LOC · review rounds 14 of 14 (exactly at cap), then +1 user-authorized round for the post-validation rework (15) | design.md §11; execution.md §3 and *Post-validation rework* |
| PRODUCT_BUGs | 0. Contract suite: 55 of 55 mutations red | test-report.md |
| Judgment-day severe findings | 10 (5 confirmed by both judges, 5 single-judge settled by re-run); APPROVED after 2 rounds | judgment.md |
| Validation FAIL / WARN | 0 / 6. V-1, V-2, V-3, V-6 fixed post-validation; V-4, V-5 synced at archive. One correction during `/akili-test`: CHANGELOG count stale (572 → 608) | validation-report.md; execution.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 against a skip record (no skips) | — |
| Drift attributable | None. `docs/specs/audits/` holds no `drift-*.md` | docs/specs/audits/ |

## Lessons

No new lesson. Every root cause found here already has a lesson, so each is recorded as a `digest-update` (P1–P4) rather than duplicated.

- **Recurrence: KZ-changes--scoped-constitution-reads-1.** A design or test-contract cell restated a requirement more narrowly, and work built on it faithfully. This happened four times:
  - Design §7 Error Handling shorthand ("errors → link `not determined`") skipped FR-6 step 2. T3 shipped it and the Reviewer failed it.
  - The literal wording in §9.2 ("extends to … and all behavior data") produced an untiered claim contradicting P-21. T4 failed on it.
  - The §9.3 test contract pinned metric coverage on 2 of the 6 list-bearing surfaces although FR-11 says "every surface". The `docs/skills/seo-audit.md` gap passed the tests and was caught only by the T6 CHANGELOG quote-check.
  - FR-4 row 1 "or analytics hits are sent" was narrowed to "sets storage" in the reference and the command. It was recorded as an ADVISORY in T1 and T2 and surfaced as validation V-1.
  → P1
- **Recurrence: KZ-changes--gate-falsifiability-2.** First Reviewers found dropped clauses: T1 (FR-7 bullet 2, FR-13 bullet 1) and T2 (FR-7 bullet 2, FR-4 opening sentence). Two missing obligations (V-1, V-3) were classed as ADVISORY by Reviewers and came back as validation WARNs. → P2
- **Recurrence: KZ-002.** Summary surfaces overstated, three times. The T5 eval 10 applied a one-case wording to all consent findings. The T6 CHANGELOG claimed the full list on a surface that lacked it. The CHANGELOG test count went stale after `/akili-test`; the Leader caught it before validation. → P3
- **Recurrence: KZ-changes--scoped-constitution-reads-2.** The review-round budget under-runs on rules-document specs. Design §11 set 14 rounds for 6 tasks. Every task's first verdict was FAIL, and `lenses` tasks spend 2 parallel verdicts per attempt (T1 and T2 used 3 rounds each). The run landed exactly on the cap and needed a user-authorized 15th round to fix validation WARNs. → P4

## Noted, not a lesson

- `.agents/` is gitignored, so each worktree needs a copy from the main checkout plus `doctor --agents --fix --allow-branch`. Same as `changes--akili-security-followup`. Three OUTDATED sections were fixed on the copy again here.
- Falsifier hygiene. A T1 Implementer backup `cp` wrote into another session's `/tmp/x`, and it deleted only its own file. The T6 attempt-1 falsifications mutated repo files in place and restored them (`cmp` identical). The Tester's `SEO_ROOT` scratch-copy pattern (`test/seo-analytics-contract.test.js`) avoids both and could become the house pattern for text-contract mutations.
- Reworks were delivered by message to the surviving Implementer context, which was cheaper than a fresh spawn and carried the feedback verbatim. In 6 of 6 tasks it closed on the next verdict.
- `AGENTS.md:62` ("Use `seo-audit` for SEO audits and diagnosis; `/akili-seo` loads it in its audit phase") is still true but does not mention the optional analytics phase. It is not falsified, so no factual-sweep item was recorded.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--scoped-constitution-reads-1 |
| Edit | Add `changes/seo-analytics` as a source spec, with the recurrence note "recurred ×4 (changes/seo-analytics: design §7 Error Handling shorthand skipped FR-6 step 2 (T3 FAIL); §9.2's literal extension asserted an untiered fact (T4 FAIL); §9.3 pinned FR-11 metric coverage on 2 of 6 surfaces, so a docs gap passed the suite; FR-4 row 1 'or hits are sent' narrowed in reference and command, ADVISORY ×2, validation V-1). A test contract is a design cell too: its per-surface scope must equal the requirement's" |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--gate-falsifiability-2 |
| Edit | Add `changes/seo-analytics` as a source spec, with the recurrence note "recurred (changes/seo-analytics: T1/T2 first verdicts FAILed on dropped FR-7 bullet 2, FR-13 bullet 1 and the FR-4 opening sentence; two missing obligations (FR-4 row 1, the SKILL `:419` denial) were classed ADVISORY by Reviewers and returned as validation WARNs V-1/V-3)" |
| Severity | High |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add `changes/seo-analytics` as a source spec, with the recurrence note "recurred (changes/seo-analytics: T5 eval 10 widened a one-case wording to every consent finding; the T6 CHANGELOG claimed the full metric list on a surface missing one term; the CHANGELOG test count went stale after `/akili-test` added a suite, caught by the Leader before validation)" |
| Severity | High |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--scoped-constitution-reads-2 |
| Edit | Add `changes/seo-analytics` as a source spec, with the recurrence note "recurred (changes/seo-analytics: 14 rounds for 6 tasks; first verdict FAIL on 6 of 6 tasks; `lenses` tasks spend 2 verdicts per attempt; landed exactly at the cap and needed a user-authorized 15th round. Budget rounds as Σ(reviewers per task × 2) for rules-document specs)". Severity raised Low → Medium |
| Severity | Medium |
| Status | pending |
