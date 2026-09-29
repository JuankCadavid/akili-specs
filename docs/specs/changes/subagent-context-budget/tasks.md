# Tasks: Bound What an Implementer Spawn Costs

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/subagent-context-budget` |
| Depth | **Standard** |
| Approval Mode | `pre-approved (user, 2026-09-29)` |
| Status | **Approved** — Step 3.3 gate `auto-approved (pre-approved mode)`, 2026-09-29 |
| Date | 2026-09-29 |
| Source | `requirements.md` (FR-1..FR-10, NFR-1..5, amended: its §10), `design.md` (budget §9: 5 tasks · ~140 lines · 10 review rounds), `judgment.md` (22 rows, corrected, not re-judged) |
| Commit prefix | `[SPEC:changes/subagent-context-budget]` |

**Baselines.** Every count below was run at `c94e6b6` before it was written. T stands for `.claude/templates/`, C for `.claude/commands/`.

| ID | Command | Reading |
|---|---|---|
| B1 | `grep -c "until it passes" T/implementer.md` | 1 |
| B2 | `grep -c "multiple inner-loop attempts" T/implementer.md` | 1 |
| B3 | `grep -c "STATUS: CHECKPOINT"` in `T/implementer.md`, `C/akili-execute.md`, `T/leader.md` | 0 / 0 / 0 |
| B4 | `grep -c -i "checkpoint"` in `T/implementer.md`, `T/tester.md`, `T/reviewer.md`, `T/leader.md`, `C/akili-execute.md` | 0 / 0 / 0 / 0 / 2 (both are Step 5's *Context checkpoint*) |
| B5 | `wc -c` of `T/implementer.md`, `T/reviewer.md`, `T/tester.md` | 10,654 / 10,852 / 8,867. Caps: 14,054 / 11,752 / 10,467, as raised at the T2 Pivot (first written as 13,154 / 11,752 / 10,067) |
| B6 | `grep -c -F "Open a full file when you are about to edit it" T/implementer.md`; `grep -c -F "full files are for what it is about to edit" C/akili-execute.md` | 1; 1 |
| B7 | `grep -c -i "six delegated round trips"` in `C/akili-execute.md`, `T/leader.md`; `grep -c "up to 6 delegated round trips\|up to 12" T/leader.md`; `grep -c "HALTED after 3 attempts" T/leader.md` | 1 / 1; 1; 1 |
| B8 | `grep -c "3 consecutive FAILs"` in `README.md`, `docs/commands/akili-execute.md`, `docs/flow.md` | 1 / 2 / 1 |
| B9 | `grep -rn -i "60 tool calls\|100 lines\|400 lines\|consecutive verification" .claude/commands docs/commands docs/flow.md docs/model-routing.md README.md` | 0 hits |
| B10 | `grep -c "spawns:\|checkpoints:" C/akili-execute.md` | 0 |
| B11 | `grep -c -i "section lookup"` in `T/reviewer.md`, `T/implementer.md`, `T/tester.md` | 0 / 4 / 3 |
| B12 | `grep -c "Output discipline\|Bounded reads"` in the three worker personas | 0 / 0 / 0 |
| B13 | `grep -c -F "and by nothing else" C/akili-execute.md`; `grep -c "2 continuations per task" C/akili-execute.md` | 2; 2 |
| B14 | `grep -c "the turn ran long"` in `T/implementer.md`, `T/tester.md` | 1 / 1 |
| B15 | `grep -c -i "checkpoint\|respawn"` in `docs/commands/akili-execute.md`, `docs/flow.md`, `README.md` | 2 / 5 / 1 |

## 2. Task Graph

```
T1 (implementer.md: bound, checkpoint, stops) ──→ T2 (load rules: implementer, tester, reviewer) ─┐
T3 (akili-execute.md + leader.md) ──→ T4 (mirrors + README) ───────────────────────────────────────┴─→ T5 (CHANGELOG + closure walks)
```

T1 and T2 share `implementer.md` and run in that order. T3 touches other files. The tasks run **one at a time**: this session is also the one that measures, and a measurement beside a running worker is wrong.

**Scope discipline (every task).** Zero hunks in `bin/`, `scripts/`, `package.json`, `.claude/skills/`, `.claude/commands/akili-constitution.md`, `.claude/worktrees/` and `docs/specs/archive/` (NFR-5). Any hunk there is a FAIL regardless of content.

**One rule for every task.** No shipped sentence points at a rule by line number (NFR-4, KZ-005), and none names a host-specific tool or flag (NFR-3). Line numbers in this document locate edits; they are never copied into shipped text.

**`skip-eligible` tasks:** none. Every task edits text other agents execute (override a), or produces derived evidence a later gate consumes (override c).

---

### T1: The Implementer's loop is bounded and has a checkpoint exit

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Review | `full`: persona text is re-read on every spawn in every downstream project; the task **removes delivered behavior** (DD-1, reversion challenge run) and defines a report status the Leader acts on (overrides a, b and d) |
| Depends on | none |
| Requirements | FR-1 (bound of 3 on the same failure; reset on a different failure; the two exits at the bound; *BUT must NOT run a fourth cycle*; planned reds, the falsifier run and a baseline reading are not cycles; completion with a failing verification stays prohibited); FR-2 (checkpoint at either bound and nowhere else; no edit half-written, bounds checked between edits; one verification run at the call bound; a respawn's count starts at zero; `STATUS: CHECKPOINT` first line and **seven** fields and no others; *Don't stop short* keeps the prohibition and names both exits; complete and verified → completion; the last worker carries earlier evidence; *BUT must NOT report completion*; *AND IT MUST NOT leave an edit half-written*; *BUT must NOT write a checkpoint* before a bound) |
| Design refs | §7.1 surfaces 1, 2, 5; DD-1, DD-2, DD-3, DD-4, DD-10; §12; §13 |

**First step — settle P-13 before any edit.** Run one worker on the Implementer's tier through about 80 tool calls of **mixed** work (reads, searches, shell commands, and edits to scratch files outside the working tree), with a stated budget of 60 and no written tally. Count the tool-use blocks in its transcript. Record the count.

| Reading | Outcome |
|---|---|
| The worker stops at 60, give or take 3 | P-13 is confirmed. Continue |
| Anything else | P-13 is **refuted**. Stop. This is a Pivot: DD-10 changes and the user decides |

**Scope.** `.claude/templates/implementer.md` only:

- **Item 4, *Self-Correction Inner Loop* and the sentence after it:** rewritten whole as one rule (DD-1). It keeps the prohibition on reporting completion with a failing verification. It states the loop bound, DD-3's six rows (cycle, same failure, not a cycle, reset, when a bound is checked, the two call-bound cases), the call bound, and the two exits.
- **Item 4, the checkpoint report:** `STATUS: CHECKPOINT` and the seven fields of DD-2, in order.
- **Item 2, *Don't stop short*:** the list of legitimate stops gains both exits at a bound; a checkpoint before a bound is named as a premature stop (DD-4). "the turn ran long" stays.
- ***Reporting Completion*:** one sentence naming the checkpoint report as the other report shape, and the duty to carry earlier evidence.

**Verification** (repo root; T = `.claude/templates`).

| Field | Value |
|---|---|
| Command | **1.** `grep -c "until it passes" T/implementer.md` → **0** (B1 = 1). **2.** `grep -c "multiple inner-loop attempts" T/implementer.md` → **0** (B2 = 1). **3.** `grep -c "STATUS: CHECKPOINT" T/implementer.md` → **≥ 1** (B3 = 0). **4.** Each of the seven field names appears: `for f in "Bound reached" "Done" "Remaining" "Tree state" "Tried and failed" "Next step" "Notes"; do grep -c "$f" T/implementer.md; done` → each **≥ 1**. **5.** `grep -c "the turn ran long" T/implementer.md` → **1** (B14 = 1, a guard). **6.** `grep -c "ABSOLUTELY PROHIBITED" T/implementer.md` → **1** (a guard: the prohibition stays). **7.** `wc -c T/implementer.md` reported against T1's share, **≤ 12,400** (raised from 12,154 during execution, 2026-09-29: the attempt 1 review required four restorations that do not fit in one byte; the requirement's cap for the file was 13,154 then, and 14,054 after the T2 Pivot). **8.** `git diff --stat` → one file |
| Falsifier | Checks 1 to 4 fail on `c94e6b6` (B1 to B3 run). Checks 5 and 6 pass on `c94e6b6`, so they are guards and prove nothing alone. **Executed falsifier required**, on a scratch copy outside the working tree: **(a)** delete the *Notes* row → check 4 must read 0 for `Notes`; **(b)** re-insert the old sentence "until it passes" → check 1 must read 1 |
| Red run | `n/a (no test gate)` |
| Disqualifier | Greps count strings, not meaning. **Read item 2 and item 4 whole** after the edit (KZ-changes--leader-brief-contract-1). The evidence is void if any surviving sentence still tells the worker to keep re-running without limit, if the list of legitimate stops and the list of premature stops contradict each other, or if `FATAL_FAIL`'s terms changed. The P-13 reading is void if the 80 calls were uniform, or if the worker kept a written tally |
| Consumers | No test file pins persona text: `grep -rn -i "until it passes\|STATUS: CHECKPOINT" scripts bin .github` → **0 hits**, run at `c94e6b6`. Design-time readers, from the Premise Ledger: `/akili-execute` Step 2.3 and the loop sketch (T3); the mirrors (T4). `tester.md` carries the same *Don't stop short* sentence and is **not** edited (P-3, DD-4) |

**Pre-review sweep** (KZ-changes--kaizen-loop-closure-2, keyed on the obligation). `grep -n -i "until\|keep \|again\|re-run\|as long as\|never stop" T/implementer.md`: read every hit and confirm none restates an unbounded loop in other words.

**Done.** P-13 settled and its count recorded; all edits land; checks 1 to 8 run and quoted; the falsifier executed with its two reds recorded; items 2 and 4 read whole; bytes reported. If the rule cannot fit its share of the cap, stop and report. Do not drop a row.

**Skills:** `cognitive-doc-design`.

---

### T2: Workers bound what they load

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Review | `full`: three personas re-read on every spawn; the task amends delivered read guidance (overrides a and d) |
| Depends on | T1 (same file) |
| Requirements | FR-5 (limit of 100 lines; full output to a file; the failing part kept whole with name, assertion or error, location; the file outside the diff; no whole-file print through a shell; diff by summary first; evidence quoted verbatim; *BUT it must NOT receive the 2,000 lines*; the count of failures not shown) ; FR-6 (every row of its table, for each role it applies to; the quoting exception; each persona defines its section lookup; the two "full file" sentences brought in line — this task owns the one in `implementer.md`; reference-document rule, diff-first rule and verbatim rule unchanged; *BUT it must NOT read either document whole*; *AND IT MUST NOT open `tasks.md`*; *BUT it must NOT read the file whole*) |
| Design refs | §7.1 surfaces 3, 4, 6, 7, 8, 23, 24; DD-7, DD-8; P-19 |

**Scope.**

- `T/implementer.md`: the *Bounded reads* block after *CodeGraph first* (DD-8, Implementer column, every row); the *Output discipline* block in item 4 (DD-7, every row); the *CodeGraph first* sentence "Open a full file when you are about to edit it" brought in line with the large-file rule.
- `T/tester.md`: *Bounded reads* rows of the Tester column in item 1, beside the slice bullet and consistent with "unless strictly required"; *Output discipline* in item 4.
- `T/reviewer.md`: *Bounded reads* rows of the Reviewer column in item 1, stated under its diff-first rule; its own one-sentence definition of a section lookup.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c "Bounded reads" T/implementer.md T/tester.md T/reviewer.md` → **≥ 1 each** (B12 = 0). **2.** `grep -c "Output discipline" T/implementer.md T/tester.md` → **≥ 1 each**; `T/reviewer.md` → **0**. **3.** `grep -c -F "Open a full file when you are about to edit it" T/implementer.md` → **0** (B6 = 1). **4.** `grep -c -i "section lookup" T/reviewer.md` → **≥ 1** (B11 = 0). **5.** `grep -c "100 lines" T/implementer.md T/tester.md` → **≥ 1 each**; `grep -c "400 lines" T/implementer.md T/tester.md T/reviewer.md` → **≥ 1 each**. **6.** `wc -c` of the three personas → **≤ 14,054 / 11,752 / 10,467** (B5 + caps, as raised at the T2 Pivot). **7.** T1's checks 1 to 6 re-run on `implementer.md` → unchanged. **8.** `git diff --stat` → three files |
| Falsifier | Checks 1 to 5 fail on `c94e6b6` (B6, B11, B12 run). **Executed falsifier required**, on scratch copies: **(a)** delete the quoting exception from the no-second-read row → walk the byte-identity rule of item 4 against it: the two must now contradict; **(b)** delete the "failing part" row of *Output discipline* → walk FR-5's first scenario: the worker may now return "failed" with no assertion |
| Red run | `n/a (no test gate)` |
| Disqualifier | **Read item 1 whole in all three personas, and item 4 in two.** The evidence is void if a surviving sentence still sends a worker to a whole file over 400 lines, if the Reviewer's rows read as a licence to open files its diff-first rule forbids, if the Tester's `tasks.md` row is unconditional, or if any row of DD-8 or DD-7 for that role is missing (KZ-changes--scoped-constitution-reads-1: compare cell by cell with FR-5 and FR-6, not with the design alone) |
| Consumers | No test file pins these sentences: `grep -rn -i "bounded reads\|output discipline\|full file" scripts bin .github` → **0 hits**, run at `c94e6b6`. Design-time readers: `akili-execute.md` Step 2.2 CodeGraph bullet (T3 owns it); `akili-test.md` slice rule, **holds** (P-19) |

**Pre-review sweep.** `grep -n -i "whole\|full file\|entire\|full source\|all of" T/implementer.md T/tester.md T/reviewer.md`: read every hit; each is either within the rule or names an exception the rule states.

**Done.** All edits land; checks 1 to 8 quoted; both falsifier walks recorded; the paragraphs read whole; bytes reported against the three caps. If a persona cannot fit its cap, stop and report. Do not drop a row.

**Skills:** `cognitive-doc-design`.

---

### T3: The Leader handles a checkpoint

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L |
| Review | `full`: edits the loop every Leader executes, the accounting rule, the HALT step and a record every task entry carries (overrides a and b) |
| Depends on | T1 (the report's field names) |
| Requirements | FR-3 (R7's action in its four parts; R6 stated for the Implementer; R5 over R3; precedence of a blocker; a failing tree is still R7; the status line decides the counter; a Pivot flag goes to Pivot Detection first; files from the report, confirmed in the tree; the listed files and no other uncommitted change; no attempt, no runtime event, no tripwire round; its own line; cap of 2 across attempts; third → HALT with cause and record content; every HALT sentence names the cap; no pause in either mode, reported at the gate; the turn bound and every sizing sentence; the command carries the contract; fall-through; *BUT the Leader must NOT spawn a Reviewer*; *BUT it must NOT be respawned* ×2; *BUT the attempt counter must NOT advance*); FR-4 (budget by reference for a host worker, copied for a non-host worker; the task text is in the brief; which checkpoint this is); FR-6 (the Step 2.2 "full files" sentence); FR-7 (the `spawns:` line, six *ended* values, host-reported or `not reported by host` with the worker's own counts; no estimate; *BUT it must NOT hold an estimated number*; gates nothing); FR-9 (nothing waits for a checkpoint; older entries read "not recorded") |
| Design refs | §7.1 surfaces 9 to 17, 20 to 22; §7.2; DD-5, DD-6, DD-9; P-7, P-8, P-16, P-17, P-18, P-20, P-21 |

**Scope.**

`.claude/commands/akili-execute.md`:

- **Step 2 opening sentence and loop sketch:** the loop's endings name the checkpoint cap; the sketch gains the checkpoint branch.
- **Step 2 preamble, *Accounting rule*:** one clause (surface 20).
- **Step 2.2 brief list:** the *Spawn budget* bullet (DD-6, both rows); the CodeGraph bullet's "full files" sentence (surface 22).
- **Step 2.3:** the *Checkpoint report* paragraph before "When the Implementer reports completion", with every element of DD-5's table.
- **Step 2.4:** *Wind Down* and *Escalation on HALT*.
- **Step 4:** opening sentence; item 3's record list.
- **Step 5:** the turn-bound sentence; the continue gate reports checkpoints.
- ***Execution Log Format*:** the two lines and DD-9's four rules.
- ***Error Handling*:** the sentence on a verification that fails inside the Implementer.

`.claude/templates/leader.md`: the five places of surface 17.

**Verification** (C = `.claude/commands`).

| Field | Value |
|---|---|
| Command | **1.** `grep -c "STATUS: CHECKPOINT" C/akili-execute.md` → **≥ 1** (B3 = 0). **2.** `grep -c "spawns:" C/akili-execute.md` → **≥ 1** and `grep -c "checkpoints:" C/akili-execute.md` → **≥ 1** (B10 = 0). **3.** `grep -c "not reported by host" C/akili-execute.md` → **≥ 1**. **4.** `grep -c -F "full files are for what it is about to edit" C/akili-execute.md` → **0** (B6 = 1). **5.** `grep -c -F "and by nothing else" C/akili-execute.md` → **2** (B13 = 2, a guard). **6.** `grep -c -i "checkpoint cap" C/akili-execute.md` → **≥ 3** (Step 2.3, Step 2.4, Step 4). **7.** `grep -c -i "checkpoint\|respawn" T/leader.md` → **≥ 4** (B4 = 0). **8.** B9's grep over `.claude/commands` → hits only inside the non-host clause of the *Spawn budget* bullet. **9.** `git diff --stat` → two files |
| Falsifier | Checks 1 to 4, 6 and 7 fail on `c94e6b6`. **Executed falsifier required**, on a scratch copy: **(a)** delete the precedence sentence from the *Checkpoint report* paragraph → walk the scenario *A checkpoint with a blocker inside*: the literal reading must now respawn; **(b)** delete the accounting clause of surface 20 → walk *A checkpoint with a failing tree*: the literal reading must now consume an attempt |
| Red run | `n/a (no test gate)` |
| Disqualifier | **Read Step 2 through Step 2.4, Step 4 and the *Execution Log Format* whole** after the edit. The evidence is void if any surviving sentence gives a checkpoint a second action, if a sentence still describes a HALT as only the end of three attempts, if the numbers 60, 100, 400 or the loop bound appear outside the non-host clause, or if the paragraph restates a checkpoint field's definition |
| Consumers | `/akili-resume` reports `[~]` as blocked and reads HALT blocks: **holds** (§7.2). `kaizen` counts HALTs: **holds**. No command reads the `continuations:` line or will read the new ones (P-6). The mirrors restate the loop: T4. No test file pins these sentences: `grep -rn -i "checkpoint\|round trips" scripts bin .github` → **0 hits**, run at `c94e6b6` |

**Pre-review sweep.** `grep -n -i "3 attempts\|three attempts\|3 failed\|six \|round trip\|after 3" C/akili-execute.md T/leader.md`: read every hit; each either names the checkpoint cap where it describes how a task ends, or is about the rework ceiling alone.

**Done.** All edits land; checks 1 to 9 quoted; both falsifier walks recorded; the named steps read whole. The Implementer reports every HALT or sizing sentence it found that this task's scope did not list.

**Skills:** `cognitive-doc-design`.

---

### T4: Mirrors and the README

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Review | `full`: summary surfaces inherit the evidence bar of what they summarize (KZ-002), and downstream readers act on them (override a) |
| Depends on | T3 |
| Requirements | FR-10 (mirrors at summary level, contradicting no command sentence; `docs/model-routing.md`, `docs/flow.md`, `README.md` change only where a sentence turns false, with the falsifying grep run before "no change" is written); NFR-2 (no worker number restated) |
| Design refs | §7.1 surface 18; P-21 |

**Scope.** `docs/commands/akili-execute.md`, `docs/flow.md`, `README.md`: each loop summary gains one line for the checkpoint and its cap, and the Implementer's row or line no longer implies an unbounded run. `docs/model-routing.md`: **no edit unless the grep below finds a sentence that turns false.**

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c -i "checkpoint" docs/commands/akili-execute.md docs/flow.md README.md` → each **above its B15 reading** (2 / 5 / 1). **2.** `grep -c "3 consecutive FAILs"` in the three files → **1 / 2 / 1** (B8, a guard: the line stays true and stays). **3.** B9's grep → **0 hits** in `docs/` and `README.md`. **4.** Falsifying grep for `docs/model-routing.md`: `grep -n -i "until it passes\|round trips\|rework loop\|inner loop" docs/model-routing.md`, every hit read and quoted with a verdict. **5.** `git diff --stat` → three files, or four with a recorded reason |
| Falsifier | Check 1 fails on `c94e6b6` (B15 run). The input that would fail check 3: a mirror sentence that says "60 tool calls" |
| Red run | `n/a (no test gate)` |
| Disqualifier | A mirror that is true and contradicts the command's wording on who acts is a FAIL with every grep green. **Read each edited block beside the command text it summarizes** |
| Consumers | `none (no shared symbol changed)` |

**Done.** Edits land; checks 1 to 5 quoted, check 4 with each hit and its verdict.

**Skills:** `cognitive-doc-design`.

---

### T5: CHANGELOG and closure walks

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Review | `full`: produces derived evidence the closure gate consumes, and a release note readers act on (override c) |
| Depends on | T1, T2, T3, T4 |
| Requirements | FR-10 (entry, numbers, classification, migration note as amended); FR-8 (scripts stay in the folder; the measurement is recorded as owed to the user); FR-9; NFR-1 to NFR-5; requirements §8, every gate |
| Design refs | DD-11; §7.2; §9 |

**Scope.** `CHANGELOG.md` `Unreleased`: the entry with every element of DD-11. `docs/specs/changes/subagent-context-budget/closure.md`: the walks below.

**The walks**, each against the **shipped** text and judged on the general sentence, never on a case the text cites:

| Walk | Cases |
|---|---|
| Report statuses | R1 to R8 of FR-3, plus **held-out H1**: a report headed `STATUS: CHECKPOINT` that lists no files in *Tree state* and carries a lookup note in *Notes* |
| Loop bound | FR-1's two scenarios, plus **held-out H2**: two same failures, then a pass of that check with a new failure, then the first failure again |
| Output | FR-5's two scenarios, plus **held-out H3**: a build that prints 150 lines of warnings and exits zero |
| Reads | FR-6's two scenarios, plus **held-out H4**: a Reviewer that needs a 900-line file the diff touches in one hunk |
| Requirement text | Every FR statement, table row and bullet, term by term (KZ-changes--gate-falsifiability-2) |

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `npm run verify:cli`. **2.** `npm run pack:dry-run`. **3.** `git diff --check`. **4.** `wc -c` of the three personas against the caps. **5.** B9's grep → the non-host clause only. **6.** `grep -rn ":[0-9][0-9]*" ` over the added lines of the diff (`git diff c94e6b6 -- .claude docs/commands docs/flow.md README.md \| grep "^+"`) → no rule pointed at by line number. **7.** `git diff --stat c94e6b6 -- bin scripts package.json .claude/skills .claude/commands/akili-constitution.md` → empty. **8.** Each CHANGELOG clause checked against the shipped text |
| Falsifier | **Executed falsifier required** for the status walk: on a scratch copy of `akili-execute.md`, delete the fall-through sentence → H1's sibling case, a report with no status line and no field, must have no action |
| Red run | `n/a (no test gate)` |
| Disqualifier | A walk is a read. It is void if a case was judged by finding its own citation in the text, if a held-out case turns out to be cited by the shipped text, or if an expected outcome was adjusted to match what shipped |
| Consumers | `scripts/release.js` reads `Unreleased` at release time, and `scripts/notify-slack.js` digests the bold headline of each bullet. Both are release-time consumers; no edit is owed |

**Done.** The entry lands; every walk recorded case by case with its verdict; checks 1 to 8 quoted; FR-8's measurement recorded in `closure.md` as owed after the first 30 Implementer spawns under the new personas.

**Skills:** `cognitive-doc-design`.

---

## 3. Coverage

Every scenario and every `BUT` / `AND IT MUST` clause, with its owner.

| Requirement | Clause | Owner |
|---|---|---|
| FR-1 | *The same assertion fails three times*: "BUT it must NOT run a fourth cycle" | T1 |
| FR-1 | *A different failure is progress* | T1 |
| FR-2 | *Sixty tool calls*: "BUT it must NOT report completion"; "AND IT MUST NOT leave an edit half-written" | T1 |
| FR-2 | *A worker tired of a hard task*: "BUT it must NOT write a checkpoint" | T1 |
| FR-3 | *A checkpoint is respawned*: "BUT the Leader must NOT spawn a Reviewer on the unfinished work" | T3 |
| FR-3 | *A third checkpoint*: "BUT it must NOT be respawned" | T3 |
| FR-3 | *A checkpoint with a failing tree*: "BUT the attempt counter must NOT advance" | T3 |
| FR-3 | *A checkpoint with a blocker inside*: "BUT it must NOT be respawned" | T3 |
| FR-4 | No scenario; four bullets | T3 |
| FR-5 | *A test run prints 2,000 lines*: "BUT it must NOT receive the 2,000 lines" | T2 |
| FR-5 | *The failure is longer than the limit* | T2 |
| FR-6 | *A brief that points at two scenarios*: "BUT it must NOT read either document whole"; "AND IT MUST NOT open `tasks.md`" | T2 |
| FR-6 | *A 2,000-line component to edit*: "BUT it must NOT read the file whole" | T2; the Step 2.2 sentence, T3 |
| FR-7 | *A host that reports nothing*: "BUT it must NOT hold an estimated number" | T3 |
| FR-8 | No scenario; the measurement owed | T5 records it; the user receives it |
| FR-9 | No scenario; three bullets | T3; walked in T5 |
| FR-10 | *A downstream maintainer reads the release notes* | T5; mirrors T4 |
| NFR-1 | Byte caps | T1, T2; totalled in T5 |
| NFR-2 to NFR-5 | Measures | T3, T4; totalled in T5 |

## 4. Estimate and PR Strategy

| | Value |
|---|---|
| Tasks | 5 |
| Estimated lines | ~140 |
| Review rounds budgeted | 10 |
| PR strategy | Single change set, direct to `master` as this repository's specs have gone. Under 400 lines |
| First task | T1, starting with the P-13 run |
