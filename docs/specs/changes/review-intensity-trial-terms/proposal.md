# Proposal: Make the Review-Intensity Trial Able to Reach a Verdict

**Recommendation:** count the trial in **skips, not specs**. As approved, the trial ends after three specs, and it is on course to end with zero skips exercised, which supports neither keeping nor reverting the conditional Reviewer. Re-base the extent on tasks closed under `REVIEW_SKIPPED`, give the trial one place where its state is recorded, collect the falsifier execution rate as a Kaizen Measure row, and close the three predicate gaps that change what the trial measures.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/review-intensity-trial-terms` |
| Slug | `review-intensity-trial-terms` — derived from the free-text argument ("review-intensity trial follow-up: the 3-spec trial … has 2 specs closed with zero skips, and nothing collects the falsifier execution rate"); the full text is proposal context, not a directory name |
| Type | **Change** |
| Approval Mode | `gated` (no up-front end-to-end mandate given for this spec) |
| Depends on | none. Follows `changes/review-intensity-routing` (archived 2026-09-29, shipped in v2.27.0) |
| Parallel-safe | **no** with `changes/scoped-constitution-reads` — both edit `.claude/commands/akili-execute.md` Step 2.2–2.3 |
| Date | 2026-09-29 |
| Status | **Approved** (user, 2026-09-29, Option B) — §11 numbers accepted at their proposed defaults; OQ-5: `changes/scoped-constitution-reads` counts toward the stop rule, following the "any spec with the `Review` field" default |
| Requirement source | Archive summary §7 items 1–4 and `validation-report.md` W5 of the archived spec. No Jira ticket |

## 2. Intent

Let the trial the user approved on 2026-09-19 end with evidence. Today it can only end by running out of specs.

## 3. Problem / Current Behavior

All citations run at `3b66e40` on 2026-09-29. `A/` stands for `docs/specs/archive/`.

| # | Claim | Evidence |
|---|---|---|
| 1 | The trial's extent is three specs, and one escaped defect against a skipped task reverts the change | `A/2026-09-29-changes--review-intensity-routing/requirements.md:290–291` |
| 2 | Two specs written with the `Review` field have closed: six tasks, five `full`, one `checklist`, none `skip-eligible` | `grep -n "| Review |"` on `A/2026-09-20-changes--agents-md-canonical/tasks.md` → `:35` `full`, `:71` `checklist`; on `A/2026-09-29-changes--opus-5-5-rebaseline/tasks.md` → `:35`, `:74`, `:109` `full`, `:143` `checklist` |
| 3 | Neither spec closed a task under `REVIEW_SKIPPED` | `opus-5-5-rebaseline/execution.md:205`: *"No HALT, no Pivot, no `REVIEW_WAIVED` / `REVIEW_SKIPPED`"*; `agents-md-canonical/execution.md:219`: both tasks closed on a Reviewer `PASS` |
| 4 | `changes/premise-ledger` ran in the same window but carries no `Review` field, so the shipped rule excludes it | `grep -c "| Review |" A/2026-09-29-changes--premise-ledger/tasks.md` → 0; *Applicability* bullet of the *Review intensity* block in `.claude/commands/akili-execute.md` |
| 5 | Nothing records which spec is the third, or that a trial is running at all, outside the archived spec and one CHANGELOG line | `grep -rn -i "trial" .claude/commands .claude/templates .claude/skills/kaizen docs/commands docs/flow.md` → 0 hits about this trial; `CHANGELOG.md:38` is the only shipped statement |
| 6 | No shipped surface collects the falsifier execution rate that FR-9 and the CHANGELOG promise | `grep -n -i "falsifier execution" .claude/skills/kaizen/SKILL.md .claude/commands/*.md` → 0 hits; the Measure table holds a `REVIEW_SKIPPED` row and an escaped-defects row only (`.claude/skills/kaizen/SKILL.md`, *Measure* table) |
| 7 | The measured yield of the skip is zero | Archive summary §2: *"0 of 12 held-out records qualify, and this spec's own `skip-eligible` task did not earn its claim"* |
| 8 | A task planned `checklist` or `full` can clear the predicate and skip, since the predicate reads the report and never the field | *Review intensity* block, opening sentence: *"never against the task's `Review` field or the plan"* |
| 9 | No specify-time check ties a `skip-eligible` claim to a `Disqualifier` that names no read | `grep -n "skip-eligible" .claude/commands/akili-specify.md` → the field definition, the Step 3.3 list and one checklist item; none compares the two fields |
| 10 | Condition 3 has no action for a `Consumers` value of `none` with a qualifier | *Review intensity* block, condition 3: *"The task's `Consumers` field reads `none`"* |
| 11 | The next spec in line will not skip either | `UNVERIFIED — confirm at source before relying on it`. `changes/scoped-constitution-reads` has no `tasks.md` yet; its scope is persona and command prose, which override (a) routes to a Reviewer. Settled when its `tasks.md` is written |

**Why zero skips is structural here, not bad luck.** Every spec in this repository edits rules that other readers execute. Override (a) catches that by design, so the skip cannot fire on AKILI's own work. The tasks the skip was written for are deterministic code tasks in downstream projects, and a trial counted in this repository's specs never samples them.

**Consequence.** The abort criterion needs a skipped task to fire against. A trial with no skipped task cannot abort and cannot confirm. After the third spec it ends on the calendar, and the behavior becomes the default on no evidence.

## 4. Proposed Outcome

| Outcome | What changes for the reader |
|---|---|
| The trial ends on evidence | Its extent is a number of `REVIEW_SKIPPED` closures, with a stated stop if that number is never reached |
| The trial has a state | One record names the terms, the specs counted so far, the skips and escaped defects so far, and the verdict when it lands |
| The promised rate is collected | Each Kaizen entry reports falsifiers executed against falsifiers declared, from `execution.md` |
| A skip is always one the user saw | A task that never claimed `skip-eligible` does not skip |
| A contradictory claim is caught before execution | `/akili-specify` rejects `skip-eligible` beside a `Disqualifier` that names a read |
| Condition 3 has no gap | A qualified `none` has a stated action |

## 5. Scope

| Surface | Change |
|---|---|
| Trial record (new, location settled at specify; not packaged) | Terms, counted specs, skips, escaped defects, verdict |
| `.claude/skills/kaizen/SKILL.md` | One Measure row: falsifier execution rate. Report template row to match |
| `.claude/commands/akili-archive.md` | Signal list names the new row |
| `.claude/commands/akili-execute.md` | *Review intensity*: the claim requirement (follow-up 2) and condition 3's qualified `none` (follow-up 4) |
| `.claude/commands/akili-specify.md` | Step 3.2 check tying `skip-eligible` to the `Disqualifier` (follow-up 3) |
| `docs/commands/` mirrors, `docs/model-routing.md` where it restates the predicate | Summary-level mirror |
| `CHANGELOG.md` | `Unreleased` entry. It corrects the v2.27.0 trial note, which describes terms this spec replaces |

## 6. Non-Goals

- **No change to the four conditions' meaning or to the seven overrides**, beyond condition 3's missing case.
- **No change to the evidence re-run.** It stays unwaivable.
- **No change to the abort criterion.** One escaped defect still reverts.
- **No verdict on the skip itself.** This spec makes a verdict possible; it does not deliver one.
- **No new command and no installer change.**
- **No telemetry from downstream projects.** Their numbers reach the trial only when a maintainer brings them, the same way Kaizen `upstream` items do.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Every project on v2.27.0 or later | The skip gets narrower: only a claimed task may skip |
| Spec authors | One more specify-time check on `skip-eligible` tasks |
| `changes/scoped-constitution-reads` | Shares `akili-execute.md`. Run the two in sequence, not in parallel |
| Archived `changes/review-intensity-routing` | Untouched. Its FR-9 terms are superseded by reference, never edited in place |

## 8. Visual Reference

- Source: **None**
- Location: n/a
- Notes: methodology prose and one record file; no UI surface.

## 9. Requirement Delta Preview

### ADDED

- A trial record with its terms, running counts and final verdict.
- A Kaizen Measure row for the falsifier execution rate, with its numerator and denominator defined.
- A specify-time check: `skip-eligible` requires a `Disqualifier` naming no read or judgment.
- An action for condition 3 when `Consumers` reads `none` with a qualifier.

### MODIFIED

- Trial extent: three specs → a number of `REVIEW_SKIPPED` closures, with a stop rule.
- Skip eligibility: any task that clears the predicate → only a task whose `Review` field claims `skip-eligible` **and** clears the predicate. The predicate is still evaluated against the report.

### REMOVED

- The v2.27.0 statement that the trial runs "over the next 3 complete specs".

## 10. Approach Options

| | Option | Trade-off |
|---|---|---|
| **A** | **Let the trial end at the third spec as approved** | No work. Ends with zero skips exercised and the behavior confirmed by default. This is the outcome W5 warned about |
| **B** | **Re-base the trial on skips, record its state, collect the rate, close the three gaps** ✅ | Four packaged files and one record. The trial can then abort, confirm, or expire with a stated reason. Costs one Standard spec |
| **C** | **Revert the conditional Reviewer now** | Simplest end state, and defensible: measured yield is zero. It discards a mechanism that has never been tested on the work it was designed for, and it answers the trial's question without running the trial |
| **D** | **Split: trial terms and measurement now, predicate gaps later** | Smaller first spec. But follow-up 2 changes which tasks can skip, so trial data gathered before it and after it would not be comparable |

## 11. Recommended Approach

**Option B**, as a single spec. It is the smallest change after which the trial's three possible endings are all reachable.

Option C is the honest fallback. If the stop rule in the table below fires with no skip ever exercised, the recommendation at that point is to revert: a mechanism nobody uses is cost without benefit.

**Numbers the user sets at approval.** The archived spec's DD-10 fixes trial numbers at approval so they cannot be tuned after the data arrives. The same holds here.

| Term | Proposed default | The user may set |
|---|---|---|
| Extent | The first **10** tasks closed under `REVIEW_SKIPPED` | Any count |
| Stop rule | **6** further specs carrying the `Review` field close with the count still under the extent → the trial expires and the user decides between revert and one extension | Any count, or a date |
| Abort criterion | Unchanged: **one** escaped defect against a skipped task reverts | — |
| Which specs count | Any spec whose `tasks.md` carries the `Review` field, in this repository or brought from a downstream project | Restrict to this repository |
| The two closed specs | Counted toward the stop rule, since they are real trial specs with zero skips | Restart from zero |

## 12. Risks, Dependencies, And Open Questions

| Risk | Mitigation |
|---|---|
| **The re-based trial never reaches its extent either**, because this repository cannot produce a skip | The stop rule. It turns "never" into a dated decision rather than a silent default |
| **Narrowing skip eligibility lowers the yield further** | Accepted. A skip the user never saw on the Step 3.3 list is the case the auto-pass rationale does not cover; yield from it is not yield worth having |
| **KZ-changes--premise-ledger-1**: condition 3's fix is a rule keyed to a field's states | Specify lists every value `Consumers` can hold, a qualified `none` and an empty cell included, before writing the action |
| **KZ-changes--review-intensity-routing-1**: the specify-time check must act before the gate it guards | The check belongs in Step 3.2, which runs before the Step 3.3 skip list is shown |
| **KZ-001**: the predecessor's two refuted premises came from reading a source only as far as the agreeing clause | The *Review intensity* block is read whole at specify, the overrides and the *Applicability* bullet included |
| **Downstream numbers are self-reported** | The trial record marks each counted spec with its source. A brought-in number is never merged with a measured one |
| Collides with `changes/scoped-constitution-reads` on `akili-execute.md` | Sequence them. That spec goes first; it is already at the requirements gate |

**Open questions**

| # | Question | Where it is settled |
|---|---|---|
| OQ-1 | The numbers in §11 | The user, at this approval |
| OQ-2 | Where the trial record lives. A folder under `docs/specs/` adds a carve-out every command's spec scan must know; a file under `docs/` does not | `/akili-specify` design |
| OQ-3 | The denominator of the falsifier execution rate: every task, or only tasks whose `Falsifier` is not `n/a` | `/akili-specify` requirements |
| OQ-4 | Whether the "before" rate is computed from the 12 held-out records or declared unavailable | `/akili-specify` requirements |
| OQ-5 | Whether the in-flight `changes/scoped-constitution-reads` counts toward the stop rule | The user, at this approval |

## 13. Success Criteria

1. A reader can find, in one place, the trial's terms, how many specs and skips it has counted, and whether it has ended.
2. Every Kaizen entry written after this change reports a falsifier execution rate with its numerator and denominator.
3. A task whose `Review` field does not read `skip-eligible` cannot close under `REVIEW_SKIPPED`, walked as a literal agent would against the shipped text.
4. A `tasks.md` carrying `skip-eligible` beside a `Disqualifier` that names a read is caught at `/akili-specify`, shown on a held-out case.
5. Every value `Consumers` can hold has a stated action under condition 3.
6. No shipped sentence still says the trial runs over three specs.

## 14. Next Step

```text
/akili-specify changes/review-intensity-trial-terms
```
