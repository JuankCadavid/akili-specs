# Validation Report — Review Intensity and Model Routing by Proven Verification

**Verdict: the shipped text conforms; archive-ready. 0 FAIL · 4 WARN resolved · 1 WARN routed as a follow-up · 0 BLOCKED.** Every shipped surface satisfies FR-1..FR-11 and NFR-1..NFR-8 at `HEAD` (`4491d10`), and every global gate re-run here is green. Four WARNs are in the spec's own documents. The fifth is about the trial FR-9 requires: one of its three measurements has no surface that collects it, and two of the three trial specs have already closed without a single `skip-eligible` task.

| Area | Result |
|---|---|
| Tasks | **PASS** — 9/9 `[x]`, each closed on a Reviewer `PASS` |
| Files | **PASS** — every surface in design §7.1 edited; no packaged file added |
| Build | **PASS** — `verify:cli`, `pack:dry-run` (275 files), `git diff --check` exit 0 |
| Requirements | **PASS** on shipped text; **WARN** W5 on FR-9's measurement |
| Design conformance | **PASS**; **WARN** W1, W2, W3 (documents), W4 (closure evidence) |
| Author ≠ auditor | **PASS** — validator `fable`; Implementer `sonnet`, Reviewer `opus` |

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/review-intensity-routing` |
| Validated at | `4491d10` (HEAD, `master`); last spec commit `69632f5` |
| Spec baseline | `c87187f` (task baselines), `0c08abb` (run start) |
| Date | 2026-09-29 |
| Validator model | `fable` (Fable 5.1). It implemented and reviewed no task in this spec |
| Inputs | `proposal.md`, `requirements.md`, `design.md`, `tasks.md`, `execution.md`, `judgment.md`, `closure.md`. No `test-report.md` — prose-only spec; `closure.md` is its behavioral evidence |
| Constitutional docs | `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/specs/general-setup/` do not exist in this repo — recorded in `requirements.md` §1 |
| Release state | Shipped in **v2.27.0** (2026-09-20) as `minor`, before validation ran |

## 2. Summary

One block in `/akili-execute` Step 2.3 defines the skip predicate, its seven overrides, and the always-on evidence re-run. Eight surfaces cite it by name and none restates it. Closure accepts three states, and `REVIEW_SKIPPED` stays a sibling of `REVIEW_WAIVED`. Two later specs edited the same files after `69632f5`; every site read here is intact.

The predicate's measured yield is zero: 0 of 12 held-out records qualify, and this spec's own `skip-eligible` task (T6) did not earn its claim. That is a finding about the rule's strictness, not a conformance failure.

## 3. Task Completion

| Task | Status | Attempts | Result |
|---|---|---|---|
| T1 *Review intensity* block | `[x]` | 2 | PASS |
| T2 Closure states, record, `/goal` | `[x]` | 2 | PASS |
| T3 `leader.md` collapse paragraph | `[x]` | 2 (parked at the budget tripwire, released by the user) | PASS |
| T4 `reviewer.md` bands | `[x]` | 1 | PASS |
| T5 `Review` field, Step 3.3, checklist | `[x]` | 2 (scope extended with user approval) | PASS |
| T6 Constitution clause | `[x]` | 1 — `skip-eligible` claim **not earned**, Reviewer spawned | PASS |
| T7 `/akili-resume`, `kaizen` | `[x]` | 1 (parked when P-7 was refuted) | PASS |
| T8 Mirrors, registry, CHANGELOG, archive list | `[x]` | 1 | PASS |
| T9 Closure gate | `[x]` | 1 | PASS with W4 |

No `REVIEW_WAIVED` and no `REVIEW_SKIPPED` record exists in `execution.md`.

## 4. File Existence

| Surface (design §7.1) | At HEAD | Evidence |
|---|---|---|
| `.claude/commands/akili-execute.md` | ✓ | block at Step 2.3; `REVIEW_SKIPPED` ×8; `REVIEW_WAIVED` ×9 (baseline 6) |
| `.claude/templates/leader.md` | ✓ | `:83` — prohibition, named bias, then the third act |
| `.claude/templates/reviewer.md` | ✓ | `:41–47` — category and effort-ceiling columns, three LOC bands intact |
| `.claude/commands/akili-specify.md` | ✓ | `:393` field, `:437` Step 3.3 list, `:483` checklist item |
| `.claude/commands/akili-constitution.md` | ✓ | `:318` Step 7 item 3 |
| `.claude/commands/akili-resume.md` | ✓ | `:49` |
| `.claude/commands/akili-archive.md` | ✓ | `:151` — both new signals in the inline list |
| `.claude/skills/kaizen/SKILL.md` | ✓ | `:71–72` rows, `:76` clean-run clause, `:162–163` template |
| `docs/model-routing.md` | ✓ | `:460` *Review intensity (third dimension)* |
| Five mirrors | ✓ | `REVIEW_SKIPPED` ≥ 1 in each |
| `CHANGELOG.md` | ✓ | `[2.27.0]` entry and trial note |

`README.md` and `docs/flow.md` were also touched by spec commits; design §4 does not list them, FR-11 permits it.

## 5. Build Integrity

| Command | Exit | Reading |
|---|---|---|
| `npm run verify:cli` | 0 | 11 commands · 24 skills · 7 resources |
| `npm run pack:dry-run` | 0 | total files: 275 |
| `git diff --check` | 0 | — |

## 6. Requirement Coverage

Global gates, re-run independently at HEAD from the repo root:

| Gate | Method | Result |
|---|---|---|
| (a) Frozen paths | files touched by the 20 `[SPEC:changes/review-intensity-routing]` commits, limited to `implementer.md`, `tester.md`, `.claude/skills/tdd`, `bin`, `scripts`, `package.json` | **0** — PASS. A later spec edited the two personas; this one did not |
| (a) Falsifiability block | 8-line block at `c87187f` vs HEAD | **identical** — PASS |
| (b) Defined once | files carrying "fully deterministic" outside `docs/specs` | `akili-execute.md` only — PASS. `leader.md`, `akili-specify.md`, `akili-constitution.md` read 0 for `deterministic` |
| (c) Records distinct | both records greppable per file; distinctness sentence at `akili-execute.md:385` | PASS |
| (d) Held-out discipline | two held-out spec names over shipped command, template, skill and mirror paths | 1 hit, `akili-execute.md:177`, present at `c87187f` — PASS under `requirements.md` §1 (see W2 note) |
| Two-state survivors | `grep -n "PASS or \|PASS nor \|not closable"` | 1 hit, names three states — PASS |

| Requirement | Shipped evidence | Result |
|---|---|---|
| FR-1 | four conditions; report-not-plan rule; claim-not-guarantee; mismatch reported under `pre-approved` | PASS |
| FR-2 | overrides (a)–(g) directly beneath the predicate, "evaluated against what the task does" | PASS |
| FR-3 | re-run duty, two modes, `VERIFIED`/`MISMATCH`, implicit FAIL, never waived (`:219`, `:260`, loop pseudocode) | PASS |
| FR-4 | record with four fields; three closure states (`:38`, `:272`, `:387`); `/goal` (`:327`); resume (`akili-resume.md:49`) | PASS |
| FR-5 | field, Step 3.3 list, checklist item, constitution clause | PASS |
| FR-6 | bands with ceilings; categories never decide existence. `trivial → low` is not a separate row: adjudicated conformant by the T4 Reviewer on FR-6's second bullet and its scenario (`execution.md` T4) | PASS |
| FR-7 | registry section; T2 default with recorded escalation; Reviewer `≠ T2`; re-run at T5 | PASS |
| FR-8 | `leader.md:83` — raise freely, never lower | PASS |
| FR-9 | trial terms recorded; two Measure rows; clean-run clause; archive list | PASS on text — **W5** on measurement |
| FR-10 | Applicability bullet; absent records read as "no skip or waiver recorded" | PASS |
| FR-11 | mirrors, CHANGELOG, classification `minor` | PASS |
| NFR-1..8 | gates above; NFR-6 in `closure.md` §4 (inert: 0/12, refutation: none) | PASS |

Scenario-level coverage: `tasks.md` §3 quotes every `BUT` and `AND IT MUST` clause and names an owner. One clause has an owner whose scope does not contain it — W5.

## 7. Linting & Code Quality

No linter applies to prose. `git diff --check` is clean.

**4R advisory sweep (advisory — does not drive the verdict).**

| Source | Lens | Advisory |
|---|---|---|
| This validation | **Risk** | The predicate is evaluated against the report and never against the `Review` field, so a task planned as `checklist` or `full` can clear it and skip. `akili-execute.md:323` justifies the auto-pass with "the skip list was already approved at the tasks gate" — that holds only for tasks that were on the list. The shipped text is faithful to FR-1; the gap is in the requirement |
| This validation | Reliability | `AGENTS.md`'s *Multi-Agent Harness* bullet still describes an unconditional Leader → Implementer → Reviewer loop. Not false, but it is the constitution's summary of a rule that is now conditional — for `/akili-archive`'s factual sweep |
| T1 | Readability | `#### 2.3 — Spawn Reviewer` names an outcome the block beneath it makes conditional |
| T1 | Readability | "met **and no override applies**" restates condition 4 outside the block at two sites |
| T6 | Reliability | A task can be classified `skip-eligible` while its `Disqualifier` demands a read; nothing at specify time checks the two fields against each other |
| T8 | Risk | `CHANGELOG.md` restates the four conditions — the one place the predicate exists twice |
| T8 | Readability | `docs/flow.md:337` reads as unconditional-Reviewer shorthand; weakened, not falsified |
| T9 | Readability | Condition 3 has no rule for a qualified `none` ("none beyond the mirrors themselves") |
| T9 | Risk | Zero yield: the change's benefit rests on Implementer right-sizing and effort banding, not on skipping |

## 8. Design Conformance

**W1 — four documents still say "Draft".** `proposal.md:22`, `requirements.md:11`, `design.md:9` and `tasks.md:9` each read "Draft — awaiting …". The gates were passed: `judgment.md:12` reads **approved**, `execution.md` records the user's approvals of two scope extensions and the trial's terms, and nine tasks ran. No document records which option the user chose at Steps 1.3, 2.5 and 3.3. `design.md` DD-10 confirms the Step 2.5 gate "passed".

**W2 — the held-out count is 14 in three documents and 12 in the evidence.** `closure.md` §1 established 12 by counting task headers and `execution.md` recorded P-15 as refuted, but the documents were left as written: `requirements.md` §1 and FR-9; `design.md` DD-11, P-15 and the §11 count line ("13 verified · 1 REFUTED · 1 UNVERIFIED", which still counts P-15 as verified and P-14 as unverified although the closure task settled it); `tasks.md` §2 and T9. Related: `tasks.md` §2 forbids naming either held-out **spec**, where `requirements.md` §1 forbids naming their **tasks**. `closure.md` resolved gate (d) under the requirement; the task text was not aligned.

**W3 — the run's own totals disagree across documents.**

| Figure | `closure.md` §7 | `execution.md` §3 | Recorded evidence |
|---|---|---|---|
| Review rounds | 12 | 13 | 13 — nine tasks plus four rework rounds |
| Reviewer FAILs | — | "Five Reviewer FAILs" | **four** `Attempt 1 — Reviewer FAIL` records: T1, T2, T5, T3 |
| Tasks reworked | T1, T2, T3 | "3 (T1, T2, T5), plus T3" | four: T1, T2, T3, T5 |

`closure.md` was written before T9's own review round, so its 12 was true when written and is stale now. "Five" cannot be reconciled with the log.

**W4 — the closure walk's text-sensitivity was never demonstrated.** T9's Falsifier required that deleting override (c) flip the two report-producing records to *qualifies*, and states that "a walk whose decisions do not move under that mutation was reading the tasks, not the text". The mutation was executed and nothing flipped, because condition 2 fails first on both records. `closure.md` §5 reports this honestly, and the T9 Done criterion "its flip recorded" is therefore unmet as written. The walk's verdicts are credible on independent grounds (the Reviewer spot-checked two records), but no mutation has shown a verdict moving with the text.

**Constitution Impact:** `execution.md` carries no `## Constitution Impact` block. See the `AGENTS.md` advisory in §7.

## 9. Test Evidence Summary

No `test-report.md`: prose-only, `Red run: n/a (no test gate)` on every task.

| Evidence | Reading |
|---|---|
| Predicate walk | 12 held-out records, 0 qualify. Condition 2 fails on all 12 |
| Inert test (NFR-6) | PASS — not everything qualifies |
| Refutation test (NFR-6) | PASS — no task with a real Reviewer FAIL qualifies |
| Mutation falsifier | Executed, **no flip** — W4 |
| Dogfooding | T6 claimed `skip-eligible`, failed condition 2, was reviewed; mismatch reported at the continue gate |
| Evidence re-run | Recorded `VERIFIED` by the Leader on every task |

## 10. Agent Guide / Constitution Impact

No impact note recorded and no module created. One root-guide sentence is a candidate for `/akili-archive`'s factual sweep (`AGENTS.md`, *Multi-Agent Harness*).

**W5 — FR-9's trial is under-measured and nearly over.**

| FR-9 clause | State |
|---|---|
| "every trial spec reports its escaped defects alongside its `REVIEW_SKIPPED` count" | `opus-5-5-rebaseline` and `premise-ledger` report both rows. `agents-md-canonical` (archived 2026-09-20) reports neither |
| "the trial reports the **falsifier execution rate** before and after" | **No shipped surface collects it.** `tasks.md` §3 assigns the clause to T7, whose scope holds only the skip and escaped-defect rows. No trial spec has reported it |
| Extent: 3 complete specs | Two specs written with the `Review` field have closed (`agents-md-canonical`, `opus-5-5-rebaseline`): six tasks, none `skip-eligible`, zero skips. Nothing tracks which spec is the third |

The abort criterion cannot fire on a trial in which no task skips. After the third spec the trial will end with zero skips exercised, which supports neither confirming nor reverting the behavior.

## 11. Remediation

| # | Level | Fix | Touches shipped text? |
|---|---|---|---|
| W1 | **Fixed 2026-09-29** (on the user's instruction; the option chosen at each gate stays unrecorded and the headers say so) | Set the four Status rows to approved, citing the evidence for each gate. **Needs the user's confirmation** of what was chosen at Steps 1.3, 2.5 and 3.3 — validation will not infer an approval | No |
| W2 | **Fixed 2026-09-29** (annotated in place) | Annotate the 14 → 12 correction at each site, mark P-15 refuted and P-14 settled in the §11 count line, and align `tasks.md` §2 to the requirement's wording. Correction closure in both directions | No |
| W3 | **Fixed 2026-09-29** (annotated in place) | `closure.md` §7: note that 12 predates T9's review round; final is 13. `execution.md` §3: "Five" → four, and list the four reworked tasks | No |
| W4 | **Resolved 2026-09-29** — the condition-2 mutation was executed and T6 flipped; recorded in `closure.md` §5, *Validation addendum* | Accept with the limitation recorded, or run the condition-2 mutation `execution.md` open item 4 proposes and record the result in `closure.md` §5 | No |
| W5 | **Routed** — follow-up for `/akili-propose`, carried in the archive summary | A decision for the user: extend or restart the trial so it exercises real skips, and decide where the falsifier execution rate is collected. Both change scope and belong in a proposal | Yes, if taken up |
| — | Follow-ups | The Risk advisory in §7 (skip without a `skip-eligible` claim) and the Step 3.2 authoring check are proposal candidates | — |

## 12. Archive Readiness Recommendation

**Ready for `/akili-archive changes/review-intensity-routing`.** W1–W4 were resolved on 2026-09-29 and W5 is routed as a follow-up. All tasks are `[x]`, no FAIL remains, and the shipped text holds at HEAD. W1–W3 are document corrections. W4 is an evidence limitation that can be accepted as recorded. W5 does not block the archive, but it should not be lost in it: it is the open question of whether the trial this spec promised will produce any data.
