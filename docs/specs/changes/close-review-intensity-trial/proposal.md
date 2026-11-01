# Proposal: Close the Review-Intensity Trial with Its Data

**Recommendation (Option A):** record the trial's verdict as **"not exercised, no escaped defect"** and end it. Keep the `skip-eligible` / `REVIEW_SKIPPED` predicate as a documented option, with no running trial. Remove nothing. Across 33 specs and 190 tasks with a `Review` field, one task claimed `skip-eligible` and none skipped. The data shows the predicate does not fire in this repository. It does not show whether it fires in product projects, so it is no basis for deleting the predicate from the package.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/close-review-intensity-trial` |
| Slug | `close-review-intensity-trial`, derived from the free-text argument ("Close the review-intensity trial with measured data …") |
| Type | **Change** |
| Deliverable | software (methodology text) |
| Approval Mode | `gated`. JC's decision of 2026-10-31 16:51 UTC-5, verbatim: "Aprueba la versión que mejor se adapte a nuestras necesidades". JC delegated the choice, and JC's assistant chose to **open** this proposal. Approving its content is a separate gate, still open |
| Depends on | none. Replaces `changes/review-intensity-trial-terms`, discarded 2026-10-31 (`df28500`) |
| Parallel-safe | yes. It touches `CHANGELOG.md` `Unreleased` (append-only) and at most one paragraph of `.claude/commands/akili-execute.md` Step 2.3 |
| Date | 2026-10-31 |
| Requirement source | The brief, the 2.27.0 CHANGELOG notes and the archive data below. No Jira ticket. `source questions skipped`: supplied by the brief (methodology text, no visual) |
| Status | **Draft**, awaiting approval |

## 2. Intent

The trial approved on 2026-09-19 promised a verdict. The trial is over and the data is in, so the verdict should be recorded where readers will find it, and the trial should stop being an open obligation.

## 3. Problem / Current Behavior

| # | Claim | Citation (run 2026-10-31) |
|---|---|---|
| 1 | The trial terms say: "Ships as a measured trial over the next 3 complete specs … one escaped defect against a skipped task reverts the change" | `CHANGELOG.md:410` (2.27.0 Notes; added in `1e4fb36`, 2026-09-19) |
| 2 | No shipped command or skill states the trial or its verdict | `grep -rn -i 'trial' .claude/commands .claude/templates` → no review-intensity hit |
| 3 | 33 specs were archived on or after 2026-09-29. All have `tasks.md`, and 26 carry the `Review` field | loop over `docs/specs/archive/2026-09-29…2026-10-31*/tasks.md`, `grep -qE '^\| Review \|'` → `33`, `26` |
| 4 | The `Review` values across the archive: `full` 132, `checklist` 56, `lenses` 1, `skip-eligible` **1** | `grep -rhoE '^\| Review \| \`[a-z-]+\`' */tasks.md \| sort \| uniq -c` |
| 5 | That one claim (`archify-diagrams` T5) was not earned. It was reviewed, because `Consumers` was not `none` and override (a) applied | `archive/2026-10-18-changes--archify-diagrams/execution.md:152`, `:256` ("skip claim not earned → reviewed") |
| 6 | Tasks closed under `## REVIEW_SKIPPED`: **0**. So the revert criterion (an escaped defect against a skipped task) never had a subject | `grep -rl '^## REVIEW_SKIPPED' docs/specs/archive docs/specs/changes` → 0 files |
| 7 | The predicate is defined once, in `/akili-execute` Step 2.3. It is cited in `akili-specify` (3), `akili-archive`, `akili-constitution`, `akili-resume`, the `kaizen` skill (4), `docs/flow.md` (2), `docs/model-routing.md`, and the leader and reviewer templates | `grep -rnc 'REVIEW_SKIPPED\|skip-eligible'`; `grep -rln 'Review intensity'` |

**Why it never fires here:** in this repository almost every task edits an obligation that other readers execute, such as command text, skill rules or installer output. That triggers override (a) or a non-`none` `Consumers`. This is an inference from claims 4–5, `UNVERIFIED — confirm at source before relying on it` for product repositories, where no data was collected.

## 4. Proposed Outcome

- The trial has a recorded verdict: **not exercised; no escaped defect; ended 2026-10-31**, with the numbers above.
- No surface implies the trial is still running.
- The predicate's behavior is unchanged (Option A).

## 5. Scope

| In | Out |
|---|---|
| A `CHANGELOG.md` `Unreleased` note recording the verdict and the data | Any change to the four conditions or the overrides |
| One sentence in `/akili-execute` Step 2.3 stating the predicate is a standing option (trial closed 2026-10-31, never exercised in this repository) | Removing `REVIEW_SKIPPED`, `skip-eligible` or the `Review` field (Option B) |
| A text-contract test pinning the sentence and the note | Persona template edits, which would trigger digest sections and a `since=` bump |

## 6. Non-Goals

- Measuring the predicate in product projects. If that data is ever wanted, it needs its own proposal.
- Reopening the discarded `review-intensity-trial-terms`, which re-based the trial on skips.

## 7. Affected Users, Systems, And Specs

`/akili-execute` readers (Leaders), the release notes, and the archived `changes/review-intensity-routing` and `changes/review-intensity-trial-terms`, which this closes.

## 8. Visual Reference

- Source: None
- Notes: methodology text only; no UI.

## 9. Requirement Delta Preview

### ADDED Requirements

- `/akili-execute` Step 2.3 states the review-intensity trial is closed (2026-10-31) and the predicate remains a standing option.
- `CHANGELOG.md` records the trial verdict with its data.

### MODIFIED Requirements

- None to behavior.

### REMOVED Requirements

- The open obligation from the 2.27.0 trial terms ("one escaped defect against a skipped task reverts the change") ends with the trial. A defect against a future skipped task is handled by the normal Kaizen and Bug Track instead.

## 10. Approach Options

| Option | Change | Cost | Risk |
|---|---|---|---|
| **A. Close, keep (recommended)** | Verdict note plus one sentence in Step 2.3 plus a pin | ~20 LOC, 1–2 tasks | Low. It keeps ~25 lines of predicate text that every `/akili-execute` run reads but that never fires here |
| B. Close, remove | Delete Step 2.3's predicate and every citation in 8+ files and 2 templates (digest sections, `since=` markers), the `skip-eligible` option in `/akili-specify`, the `REVIEW_SKIPPED` signal in `kaizen` and `/akili-resume` | ~150–250 LOC, 4–6 tasks, minor or major release class to decide | Medium. It removes behavior from the package based on dogfood data alone; projects that use it lose it |
| C. Close, demote | Move the predicate to an appendix that `/akili-execute` reads only when a task claims `skip-eligible` | ~60–100 LOC | Medium. It adds a conditional read path, a scoped-read rule of its own |

## 11. Recommended Approach

**Option A.** It closes the open obligation with the smallest change. It records the evidence honestly: the predicate is unused here, there is no data from elsewhere, and there was no defect. It also leaves B or C open if product data or token measurements later justify them. B is the right call only if JC wants the token saving on every execute run more than the option itself.

## 12. Risks, Dependencies, And Open Questions

| # | Item |
|---|---|
| R-1 | Option A keeps a rule that, by this data, never fires in this repository. Whether that is dead weight is JC's call (Q-1) |
| Q-1 | **For JC:** A (keep), B (remove) or C (demote)? |
| Q-2 | Release class: A is a patch (text only) |
| KZ | KZ-002 applies: the CHANGELOG note's numbers must be the grep results quoted in §3, re-run at execute |

## 13. Success Criteria

- `grep` for the trial verdict finds it in `CHANGELOG.md` `Unreleased` and in `/akili-execute` Step 2.3.
- The predicate's four conditions and overrides are byte-identical before and after (Option A).
- `npm test` is green, with a pin on the new sentence.

## 14. Next Step

After approval:

```text
/akili-specify changes/close-review-intensity-trial
```
