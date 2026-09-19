# Kaizen Entry — changes/gate-falsifiability

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/gate-falsifiability` |
| Date | 2026-09-18 |
| Branch | master (Branch Context: `default`, apply-capable — no `Integration Branch:` pin in this repo) |
| Archive Run | 1 |
| Approval Mode | gated — the Standardize menu was presented in the archive report and **not answered** (autonomous run, user not present); every item stays `pending`, nothing outside this file was edited |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 6 (5 designed + T6 from the T5 Pivot) | tasks.md |
| Reviewer FAIL rework attempts | 1 (T2 ×1) — 9 verdicts total | execution.md — T2 attempt 1 |
| HALTs / FATAL_FAILs / tripwires | 0 / 0 / 0 | execution.md §3 |
| Pivots | 1 (T5 → T6; FR-1/FR-6 amended; DD-9) | execution.md — ## Pivot Record: T5 |
| Leader pre-review catches | 1 (T1: unnamed block cited by two surfaces — KZ-005) | execution.md — T1 attempt 1 |
| Owed-clause touches after a PASS | 1 (T1: FR-2 positive obligation reported as an advisory) | execution.md — T1 Leader adjudication |
| PRODUCT_BUGs | n/a — no `test-report.md` (absence accepted; prose-only spec) | archive-summary.md §4 |
| Judgment-day severe findings | not run (user chose Continue) | tasks.md Document Control |
| Validation FAIL / WARN | n/a — no `validation-report.md` (absence accepted) | archive-summary.md §5 |
| Closure walkthrough | attempt 1: 5/5 named rejected, held-out 1 INCONCLUSIVE + 1 weak → Pivot; attempt 2: 0 INCONCLUSIVE over 5 named + 3 held-out | t5-walkthrough.md |
| Runtime interruptions | 2 (provider session limit, 3 workers; expired login, 1 worker) — no attempt consumed | execution.md — T2, T5 runtime events |
| Drift attributable | no audit report exists under `docs/specs/audits/` | — |

## Lessons

- **KZ-changes--gate-falsifiability-1 — A closure walkthrough over the cases its rules cite is an inert fixture; it needs held-out cases and the parenthetical stripped.** (Methodology, High)
  - Root cause: `design.md` DD-7 and `tasks.md` T5 drew the five retro-fit cases from the same corpus entries the Falsifiability block names inside its parentheticals. A literal reader then finds each case by its citation, so the gate goes 5/5 whether or not the *general sentence* rejects the class — the spec's own rule 1 (a fixture on which the mutation leaves the reading unchanged is no gate), unapplied to its own closure. Only the Leader's unplanned challenge (strip the parenthetical; walk three entries the block does not cite) exposed a class FR-1/FR-3 claimed and the text admitted. Cost: one Pivot, two requirement amendments, one extra task.
  - Evidence: execution.md — T5 attempt 1 ("Leader challenge before accepting the gate"), HELD-OUT findings (b), ## Pivot Record: T5; t5-walkthrough.md — "Held-out cases"; design.md DD-7, DD-9.
  - Related, not a recurrence: KZ-006 (a check no input can fail) — this is its example-selection form; `changes--kaizen-loop-closure` Noted "Fixture discipline" (a fixture must carry one row per population) is the same family, sub-threshold there, and is what raises this one to a lesson.
  - Standardization: → P1

- **KZ-changes--gate-falsifiability-2 — Requirement nouns were dropped in shipping and a full Reviewer sweep passed them: conformance was judged by scenario, never by the FR statement's own terms.** (Methodology, Medium)
  - Root cause: FR-3 says "class/attribute presence"; shipped rule 3 said "a class list". FR-6 scenario 3 requires "a second, shorter height"; shipped rule 6 said "two viewports" with no axis. FR-2's second scenario carries a positive obligation; shipped rule 2 had only the negative form and the Reviewer filed it as an ADVISORY. In all three the Implementer compressed a requirement sentence into a rule and the Reviewer checked that each *scenario* was represented — which a compressed sentence satisfies in spirit — instead of walking every noun and obligation of the FR statement against the shipped sentence. Two of the three survived T1's PASS and T4's parity review and were found only by the held-out challenge.
  - Evidence: execution.md — T1 ADVISORY (RELIABILITY) and Leader adjudication; HELD-OUT findings (b) "Compounded by a T1 under-delivery", (c); ## Pivot Record: T5 Blocker (2), (3); §3 Summary Kaizen candidate (3).
  - Standardization: → P2

## Noted, not a lesson

- **Brief paraphrase changed a gate (T2's only FAIL).** The Leader's brief transcribed T2 verification 2 with the pattern `behavioral assertion` instead of the task's `fails on the behavioral assertion`; the Implementer's claim was true against the brief and false against the task. Not distilled here because an approved, active spec already owns the fix: `changes/leader-brief-contract` FR-1 (the brief is a contract; the verification command is *copied*). If that spec ships and the class recurs, it becomes a lesson.
- **Runtime events are loop events.** Two provider/harness interruptions killed four workers; none consumed an attempt and all resumed by message — handled ad hoc from the runtime-failure rule. Owned by `changes/leader-brief-contract` FR-4.
- **Verification wording:** T1 verification 2 used `grep -c` (lines) where the intent was occurrences; amended at execute to `grep -o … | wc -l`. A count gate should say what it counts. First sighting; feeds recurrence.
- **Advisory that was a coverage gap:** the Leader, not the Reviewer, reclassified FR-2's missing positive obligation from ADVISORY to owed clause. Folded into lesson 2's root cause rather than counted separately.
- **Follow-up (docs):** the `tdd` *Inert fixture* bullet prescribes a diverging fixture row as the fix — the wrong remedy when the instance is a selector that matches nothing. `/akili-quick` candidate.
- **Positive practice:** applying a spec's own rule to its closure gate. Cheap (one Reviewer round) and it found what nine verdicts had not.
- `Kind: upstream` does not apply in this repository: it *is* the methodology, so Methodology lessons take local edits here (precedent: every entry file in this folder).

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — Step 3.2, immediately after the "a presence-assertion is not a behavioral proof" bullet |
| Edit | New bullet: **a walkthrough over the cases its rules cite is an inert fixture.** When a task's gate is a walkthrough or retro-fit of example cases against shipped prose, the task names at least one **held-out** case the text does not cite, and every case is judged against the general sentence with its parenthetical example stripped — a case the reader can find by its citation proves the citation, not the rule. |
| Severity | High |
| Status | applied (2026-09-19) |

### P2

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/reviewer.md` — Audit Checklist, **Requirement Conformance** item (append) |
| Edit | Append: Walk each cited FR **statement** term by term, not only its scenarios — every noun and obligation the requirement names ("class/attribute", "a second, shorter height", a positive `MUST`) appears in the shipped text or is a FAIL issue; a requirement obligation missing from the implementation is never an ADVISORY. |
| Severity | Medium |
| Status | applied (2026-09-19) — with the wording `changes--leader-brief-contract` P3 specified ("statement, table and every paragraph under it") |

No `guide-sync` item (no `## Constitution Impact` blocks — no module created or reshaped). No `factual-sweep` item (root `CLAUDE.md` / `AGENTS.md` swept: no statement about Step 3.2, task fields, or the `tdd` anti-pattern count exists to falsify). No `trd-adr` item (no TRD in this repo; Pivot ADR impact: none). No `digest-update` item (no root cause repeats an existing lesson).

## Apply pass

Not run. Backlog across `docs/specs/kaizen/`: **2 pending** (this file), highest severity **High** — recommendation would be option 1 (Apply all). Sequencing note for whoever applies: P2's target, `reviewer.md`, is owned by `changes/leader-brief-contract` (its FR-7 edits the same checklist), and P1's target, `/akili-specify`, is under that spec's zero-diff constraint (NFR-1/NFR-7). Apply both **after** that spec lands, so its parallel-safety gates are not tripped by an unrelated hunk; the re-verify probe (step 3b) will confirm both targets still read as quoted.


## Apply pass (2026-09-19, default branch)

Run from `/akili-archive changes/leader-brief-contract`, after that spec landed (the sequencing note above). Menu: option 1 (Apply all) — chosen by the user. Re-verify (step 3b): P1 — the presence-assertion bullet exists in `/akili-specify` Step 3.2; P2 — the **Requirement Conformance** item exists in `reviewer.md`'s Audit Checklist; both written. The "Not run" section above is superseded by this pass.
