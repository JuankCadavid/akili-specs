# Kaizen Entry — changes/akili-panel-model-skills

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-model-skills` |
| Date | 2026-11-11 |
| Branch | `JuankCadavid/akili-panel-model-skills` (spec branch; apply-capable branch is `dev`, per the `Integration Branch: dev` pin) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 6 (T1 live probe, T5 HITL, T6 from amendment A1) | tasks.md |
| Reviewer FAIL rework attempts | 3 (T4 ×1, T6 ×1, T5 checklist round 8 ×1) | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Budget tripwires | 2 (≈784 vs ~750 at T3; ≈1,228 vs ~980 at T6), both accepted by JC | execution.md — T3, T6 *Running totals* |
| Review rounds | 8 of 8; the 9th was declined by JC (option B) | execution.md — *T5 closed* |
| Pivots / spec tensions | 0 / 1 (T2, settled at JC's gate) | execution.md — T2 |
| Amendments | 1 (A1, AKILI title: FR-10, DD-9, T6) | execution.md — *Amendment A1* |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 2 (J-1, J-2) | judgment.md |
| Validation FAIL / WARN | 0 / 7 at audit (4 after three post-audit figure corrections) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 | test-report.md / validation-report.md |
| Drift attributable | none recorded | no newer `drift-*.md` |

## Lessons

No new lesson: all three costly signals repeat root causes already recorded, so each is a `digest-update` pending item (P1–P3).

## Noted, not a lesson

- `claude --plugin-dir` sessions and `claude plugin test` leave `.claude/skills/akili-panel/tsconfig.json` (untracked) and `.claude-plugin/types/` (ignored), which fail the install tests that check "a generated `types/` is never installed". This happened in T5, in JC's look session, and once mid-run during `/akili-test` (4 false failures). Friction only; a candidate for a small fix in the installer or the test.
- During the light/dark look, JC pressed Next by accident and ran `/akili-execute` in his session (stopped, nothing edited). A gate that hands the person a live pane with a working Next can start the command it shows.
- T5's live title check reached 23 columns at the smallest (the dock's minimum), not 14; the 14-column case is covered only by the kit.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--akili-panel-polish-1 |
| Edit | Add source `changes/akili-panel-model-skills` and the recurrence note: the T5 gate asked for "both light and dark"; JC's verbatim answer («lo veo bien presione execute sin querer pero lo detuve») named neither theme, while the relay called it a "light/dark verdict". The Leader logged both themes as passed; Reviewer round 8 FAILed on that, which cost an extra gate question and left the corrected record without a re-check (round 9 declined). Rule addition: a relay's framing of a verdict is not the person's words; record a check as passed only for what the verbatim answer names. |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--kaizen-loop-closure-2 |
| Edit | Add source `changes/akili-panel-model-skills` and the recurrence note: amendment A1 changed rows asked 19 → 21 and added premise P-13. Its edit list fixed `design.md:43` but left §8.6 `rows: 19`, the §11 count "12 settled" and the old budget in the `execution.md` Document Control. All three survived 2 Reviewer PASSes and were caught only by `/akili-validate`'s cross-document figure check. The sweep applies to amendments too: grep every superseded figure across the spec folder before the amendment's commit. |
| Severity | Low |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-bugfix--init-ctrlc-abort-2 |
| Edit | Add source `changes/akili-panel-model-skills` and the recurrence note: two budget tripwires (≈784 vs ~750; ≈1,228 vs ~980). The cause both times was tests at roughly 3× the code (T6: test lines far above code lines; the branch total with `/akili-test` is 1,588 lines for 200 lines of plugin code). |
| Severity | Medium |
| Status | pending |
