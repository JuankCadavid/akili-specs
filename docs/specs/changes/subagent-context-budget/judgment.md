# Judgment: `changes/subagent-context-budget`

**JUDGMENT: ESCALATED ⚠️** — the corrections were applied and, by the user's instruction, not re-judged.

## 1. Transaction

| Field | Value |
|---|---|
| Target | `requirements.md` and `design.md`; `proposal.md` and `measure/` as context |
| Frozen at | `c94e6b6`, 2026-09-29. SHA-256 prefixes: `requirements.md` `efc345d1b6f801d2`, `design.md` `7ff976d708efa7e5`, `proposal.md` `5e68f80eb29aac4c`, `measure/baseline.txt` `3854a87f08592496` |
| Mode | `judgment_day`, invoked from `/akili-specify` Step 2.5, *Review Design* |
| Judges | Two, blind, read-only, on `opus`. The design was authored on another model |
| Round | 1 of 2. No re-judgment ran |
| User decision | 2026-09-29: apply the fixes, do not re-judge, continue to tasks and execution under `pre-approved` |
| Skill resolution | `judgment-day` from `~/.claude/skills/`. Its reference files are not packaged; prompts were derived from its Hard Rules |

## 2. Counts

| | Judge A | Judge B |
|---|---|---|
| Severe | 5 | 8 |
| Warning | 12 | 8 |
| Suggestion | 2 | 2 |

| Merged class | Count |
|---|---|
| Raised by both judges | 11 |
| Raised by one judge, confirmed at the source by the architect | 9 |
| Raised by one judge, partly wrong | 1 |
| Contradictions between judges | 1 (P-17 and P-18, §4) |

## 3. Premise Ledger, as the judges found it

| Row | Judge A | Judge B | Settled |
|---|---|---|---|
| P-1 | reproduces | reproduces; the row omits the rest of the cited sentence | Row corrected (L-12) |
| P-2, P-3, P-4, P-6, P-7, P-8, P-10, P-14, P-16 | reproduce | reproduce | Stand |
| P-5 | does not reproduce | does not reproduce | Row corrected (L-1) |
| P-9 | reproduces; the cap holds under `pre-approved` only | reproduces | Row corrected (L-14) |
| P-11, P-12 | not re-run | not re-run | Stand as cited. The judges could not reach the session logs |
| P-13, P-15 | unverified-stands | unverified-stands | Stand as `UNVERIFIED` |
| P-17 | does not reproduce: six places, not two | reproduces | Row corrected (L-5) |
| P-18 | reproduces: 5 lines, 4 sentences | does not reproduce: a fifth sizing figure at `leader.md:76` | Row corrected (L-5) |

## 4. Frozen findings ledger

Every citation below was opened at the source by the architect before the row was accepted.

| ID | Finding | A | B | Status |
|---|---|---|---|---|
| L-1 | P-5's statement about the grep's other hits is false: `leader.md:329`, `docs/commands/akili-execute.md:88` and `docs/commands/akili-constitution.md:100` are not about the Tester | warning | severe | **Fixed** |
| L-2 | Requirement clauses with no owner in the design: FR-2 "no edit half-written" and "complete and verified → completion"; FR-7 own counts, no estimate, no gate; FR-9 "not recorded"; FR-8 report to the user; FR-10 falsifying grep for `README.md` and `docs/model-routing.md` | severe | severe | **Fixed** |
| L-3 | DD-8's "large file, edited: the ranges" contradicts two sentences that survive: `implementer.md:31` "Open a full file when you are about to edit it", and `akili-execute.md:169` "full files are for what it is about to edit". The shared-state trigger named no row that walks the read rules | severe | severe | **Fixed** |
| L-4 | HALT is described as "after 3 failed attempts" in sentences with no surface: `akili-execute.md:121`, `:267`, Step 4's record list at `:311`; `leader.md:33`, `:335`; `README.md:854`, `docs/commands/akili-execute.md:57`, `docs/flow.md:330` | severe | warning | **Fixed** |
| L-5 | Sizing and accounting sentences undercounted: `leader.md:75–76` also sizes two loops at 12 round trips; the implicit FAIL is stated at six lines, not two | finding | severe | **Fixed** |
| L-6 | NFR-2's measure cannot be run: a grep for the numbers hits everywhere, the design itself puts the cap into three command sentences, and `CHANGELOG.md` is outside the grep's paths | severe | warning | **Fixed** |
| L-7 | R4 has no action under `pre-approved`; a report naming a failing verification and no blocker fits both R3 and R5 | warning | warning | **Fixed** for R3 against R5. R4's gap predates this spec and is recorded as a follow-up |
| L-8 | DD-8's Tester column drops FR-6's `execution.md` row and adds an unconditional "`tasks.md` not opened" against `akili-test.md:60` and `tester.md:26` | warning | warning | **Fixed** |
| L-9 | `reviewer.md` does not define a section lookup, and "400 lines or fewer may be read whole" conflicts with `reviewer.md:16` | warning, partly wrong: `implementer.md:14` does define it | warning | **Fixed** |
| L-10 | Requirements §4 claim 4 does not match the baseline: first-turn medians are 46k to 56k, peak medians 188k to 207k | warning | warning | **Fixed**, in `proposal.md` too |
| L-11 | Requirements §11 still says "defined once" | warning | warning | **Fixed** |
| L-12 | Safe Update does not only skip a deployed persona: it appends an upgrade block. The migration note as designed would be wrong | — | severe | **Fixed**. Confirmed at `akili-constitution.md:424` |
| L-13 | The command defines `FATAL_FAIL` for the Reviewer only. FR-1 sends Implementer traffic there at every bound | — | severe | **Fixed**. Confirmed at `akili-execute.md:255`, `:265` |
| L-14 | The continuation cap of 2 holds under `pre-approved` only; "up to 4 extra spawns" is a `pre-approved` figure | warning | — | **Fixed** |
| L-15 | "No second read of an unchanged file" contradicts `implementer.md:46`, which requires re-opening a source before quoting it | — | severe | **Fixed** |
| L-16 | The checkpoint report has no place for a Pivot-Detection flag or a lookup note, which the persona requires in a report and Step 2.4 reads | — | severe | **Fixed**: a seventh field |
| L-17 | The closed list of legitimate stops at `implementer.md:36` does not hold `FATAL_FAIL` | warning | — | **Fixed** |
| L-18 | The `spawns:` line's *ended* values leave out a partial report and a runtime death | warning | — | **Fixed** |
| L-19 | With parallel Implementers the working tree cannot say which spawn changed a file | warning | — | **Fixed**: the list comes from the report |
| L-20 | A checkpoint whose tree fails its verification is, read literally, an Implementer-reported verification failure at `akili-execute.md:64` | — | warning | **Fixed**: the *Accounting rule* becomes a surface |
| L-21 | Requirements claim 21 said "settled at design" and the design defers P-13 to T1; claim 22 has no row | warning | — | **Recorded**. The user's mandate covers the deferral; a refuted P-13 is a Pivot and stops. Claim 22 is not depended on, since DD-10 rejects the host cap |
| L-22 | Unowned states: call bound reached with the task complete and not yet verified; whether a respawn inherits the same-failure count; whether the last spawn must copy earlier evidence; the bound checked mid-edit; the Reviewer brief names no task ID | suggestion | suggestion | **Fixed** |

## 5. Corrections

Work units and where each landed: `design.md` §13 and `requirements.md` §10, second table.

## 6. Re-judgment

None. The user chose to apply the fixes without a second round. The corrected documents have been read by their author only.

## 7. Terminal receipt

`JUDGMENT: ESCALATED ⚠️` — 22 ledger rows, 20 fixed, 2 recorded. No independent verification of the corrections ran.
