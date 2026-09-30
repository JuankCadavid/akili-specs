# Closure Walks — `changes/subagent-context-budget`, Task T5

Every walk below reads the SHIPPED text at HEAD and judges the **general sentence**, never a case
the text itself cites as an example. A case is void if it is judged by finding its own citation in
the text, if a held-out case turns out to be cited by the shipped text, or if an expected outcome
was adjusted to match what shipped. Any FAIL is stated plainly as a finding for the Leader.

Red run: n/a (no test gate — this task's evidence is document walks and greps, not a code change).

---

## 0. Falsifier (executed) — the *Fall-through* sentence

**Setup.** Copied `.claude/commands/akili-execute.md` to a scratch file
(`/private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/c3c2124c-0322-4667-8d8f-6f10e8fb953c/scratchpad/t5/akili-execute.md`)
and deleted its *Fall-through* line:

> `- **Fall-through.** A report that is neither a completion report (item 0 and the items after it, below) nor any status above is handled as idle-without-report — a completion report carries no status line.`

**Case walked (H1's sibling).** A report with **no status line and no field at all** — arrives, but is
neither `STATUS: CHECKPOINT`/`FATAL_FAIL` nor a shaped completion report (no `Task Completed`, no
`Not Done / Assumptions`).

**Result — RED, as required, but as two conflicting actions, not none.** With the sentence deleted,
the shapeless report (no status line, no field) draws **two contradictory Leader actions** from what
remains — not the absence of one:

1. **Treated as a completion report.** Item 0's rule is *"If present, the task is not complete
   regardless of what else the report says"* — it branches only on **presence** of
   `Not Done / Assumptions`; absent, it does nothing and falls through silently. The Step 2 sketch's
   `if report is STATUS: CHECKPOINT:` branch is then false, so control falls straight to
   `extract git diff` / `evidence re-run` — this shapeless report is **silently treated as a
   completion report**.
2. **Idle-without-report.** `akili-execute.md` line 62 defines the runtime event as *"the worker's
   turn ended without its contracted report"*. A report with no status line and no field is not the
   persona's contracted shape, so this case fits that definition even though something technically
   arrived — R8's "never arrives" framing in §1's table describes the more common case (no report at
   all), it does not rule this reading out.

Both readings are live in the mutated copy at the same time, and they send the Leader down different
paths — evidence re-run versus `leader.md`'s idle-without-report protocol. That is the failure the
Fall-through sentence exists to prevent: not a case with no action, but a case with two, unresolved.
No rule in the mutated copy chooses between them. That confirms the deleted sentence is load-bearing:
it is the only rule in the shipped text that catches a report matching none of R1–R8's positive
conditions and resolves the conflict — routing it to the existing idle-without-report ladder instead
of the completion path.

**Falsifier verdict: PASS** (the falsifier itself behaves as required — its removal produces the
predicted red).

---

## 1. Walk — Report statuses

**Text walked:** `.claude/commands/akili-execute.md` Step 2 sketch (loop pseudocode) + Step 2.3
*Checkpoint report* + item 0 (Implementer completion handling). Shipped, unmodified copy — not the
scratch file above.

| Case | FR-3 row | Sentence(s) applied | Outcome | Verdict |
|---|---|---|---|---|
| R1 — complete, no `Not Done / Assumptions` | Evidence re-run, then Step 2.3 | Item 0 preamble (no branch fires) → sketch: `extract git diff` / `evidence re-run` / Review-intensity or Reviewer spawn | Matches | PASS |
| R2 — names a blocker | `[~]` and escalate | Item 0: *"Names a blocker → `[~]` and escalate, as today."* | Matches | PASS |
| R3 — owed items, no blocker | Continuation rule | Item 0: *"Names no blocker, under `pre-approved`"* / *"under `gated`"* bullets (re-spawn, capped at 2 under `pre-approved`) | Matches | PASS |
| R4 — assumptions only, or inconclusive verification | "As Step 2.3 item 0 says today" — under `pre-approved` names no action; gap predates spec, is a follow-up | Item 0 precedence clause: *"otherwise — no owed item at all, whether assumptions-only or an inconclusive verification — never a continuation."* States what it is **not**; states no alternate action for `pre-approved`. The gap is still open in the shipped text | Gap confirmed present, as the row itself expects | PASS |
| R5 — completion-time report, failing verification, no `STATUS: CHECKPOINT` | Implicit FAIL, consumes attempt | Checkpoint-report block: *"**Failing verification, no blocker, no status line.** An implicit FAIL, never a continuation."* + Step 2.4 accounting rule (implicit FAIL consumes an attempt) | Matches | PASS |
| R6 — `STATUS: FATAL_FAIL` from Implementer | HALT by existing HALT step; **stated** for the Implementer | *"**Implementer `FATAL_FAIL`.** Stated here: it ends the task by Step 4, exactly as the persona has always reported it."* | Matches | PASS |
| R7 — `STATUS: CHECKPOINT` | Respawn (new) | Sketch lines (checkpoint branch) + *Action*/*Files*/*Pivot flag*/*Cap*/*Mode* bullets | Matches | PASS |
| R8 — never arrives | Runtime event, existing ladder | Step 2 preamble's *idle-without-report* definition (line 62) | Matches | PASS |
| Fall-through — fits none of the above | Idle-without-report | *"A report that is neither a completion report … nor any status above is handled as idle-without-report"* | Matches | PASS |
| **H1 (held-out)** — `STATUS: CHECKPOINT`, no files in *Tree state*, a lookup note in *Notes* | (not a text row — held out) | Status line → R7 → *Action* (respawn). *Files*: nothing to record, no rule requires a non-empty *Tree state*. *Pivot flag*: fires only on a **Pivot-Detection flag** in *Notes* — a lookup note is not one, so it does not fire | Respawn proceeds normally; empty *Tree state* and an ordinary lookup note change nothing | PASS |

**Tally: 10/10 PASS**, no FAIL.

---

## 2. Walk — Loop bound

**Text walked:** `.claude/templates/implementer.md` item 4 (*Self-correction loop, bounded* + its
term table).

| Case | Requirement text (`requirements.md` FR-1) | Sentence(s) applied | Outcome | Verdict |
|---|---|---|---|---|
| Scenario 1 — same assertion fails 3× | *"WHEN the third cycle fails on that assertion / THEN the Implementer ends its run with a checkpoint or a `FATAL_FAIL` / BUT it must NOT run a fourth cycle"* | *"Fix and re-run until a bound: **3** consecutive same-failure cycles, or **60 tool calls** … whichever comes first"* + *"At a bound … exit: a **checkpoint** … else `STATUS: FATAL_FAIL`"* | Bound reached at cycle 3 on the same assertion → checkpoint or `FATAL_FAIL`; no 4th cycle since the bound exits immediately | PASS |
| Scenario 2 — a different failure is progress | *"WHEN the third cycle passes A and fails on B / THEN the count restarts at one / AND the Implementer continues"* | Term table: *"Same failure \| Same check, same assertion/error"*; *"Reset \| Fails differently, or passes"* | B differs from A → reset; loop bound not reached → Implementer continues | PASS |
| **H2 (held-out)** — two same failures (A, A), then a pass of that check with a new failure (B), then the first failure again (A) | (no text cites this sequence) | Same two rows above, applied mechanically across 4 cycles: A(1)→A(2, same)→B(differs from A ⇒ reset to 1)→A(differs from B ⇒ reset to 1) | The counter never reaches 3 **consecutive identical** failures — cycle 3 (B) and cycle 4 (A) each reset the streak, since "same failure" is defined as the immediately preceding cycle's signature, not a per-assertion history. No bound trips; the Implementer keeps going | PASS — this is the literal, unforced consequence of "consecutive" + "fails differently, or passes → reset"; nothing else in the persona tracks failures across non-adjacent cycles |

**Tally: 3/3 PASS**, no FAIL.

---

## 3. Walk — Output

**Text walked:** `.claude/templates/implementer.md` *Output discipline* table (identical table also
ships in `tester.md`).

| Case | Requirement text (`requirements.md` FR-5) | Sentence(s) applied | Outcome | Verdict |
|---|---|---|---|---|
| Scenario 1 — 2,000-line output, one failing test | *"THEN the full output goes to a file outside the diff / AND the context receives the pass and fail counts and the failing test's name, assertion and location / BUT it must NOT receive the 2,000 lines"* | *"Limit \| 100 lines … enter context"*; *"Over the limit \| Full output to a file; bring in the result summary and the failing part"*; *"The failing part \| The failing test's name, its assertion or error, and its location — kept whole"*; *"Where the file goes \| … never a tracked path"* | Full 2,000 lines → file outside the tree; only the result summary (pass/fail counts) + the failing part's name/assertion/location enter context | PASS |
| Scenario 2 — 12 failing tests, 300 lines of messages | *"THEN the first 100 lines of failures enter the context, with the count of failures not shown / AND the worker searches the file for the rest as it needs them"* | *"Limit \| 100 lines"*; *"The failing part \| … kept whole up to the limit; **the count of failures not shown**"* (near-verbatim match); *"Reading a file \| Never through a shell command that prints it whole"* (implies searching/grepping the file for more, not printing it whole) | First 100 lines of failure detail enter context, **plus the count of failures not shown**; further detail is read from the file by range/search, not by printing it whole | PASS (the "searches the file for the rest" half is supported by the *Reading a file* row rather than stated as its own affirmative instruction — noted for completeness, not a gap: nothing in the table forbids it and the file's existence is explicit) |
| **H3 (held-out)** — a build that prints 150 lines of warnings and exits zero | (no scenario or example cites a clean exit with over-limit output) | *"Limit"* / *"Over the limit"* rows apply regardless of pass/fail — there is no exemption for a successful command | 150 > 100 → full output to the untracked file; only a result summary (e.g., build succeeded, N lines of warnings) enters context; there is no "failing part" to report since nothing failed, and the table does not require one when none exists | PASS |

**Tally: 3/3 PASS**, no FAIL.

---

## 4. Walk — Reads

**Text walked:** `.claude/templates/implementer.md` and `.claude/templates/reviewer.md`,
*Bounded reads* tables.

| Case | Requirement text (`requirements.md` FR-6) | Sentence(s) applied | Outcome | Verdict |
|---|---|---|---|---|
| Scenario 1 — brief points at two `requirements.md` scenarios + one `design.md` section | *"THEN it reads those three places / BUT it must NOT read either document whole / AND IT MUST NOT open `tasks.md`"* | Implementer *Bounded reads*: *"requirements.md, design.md \| Pointed sections only …"*; *"tasks.md \| Not opened — the brief already carries the task"* | Reads exactly the three pointed places, docs never read whole, `tasks.md` never opened | PASS |
| Scenario 2 — 2,000-line file, one method changed | *"THEN it reads the method and the declarations the method uses / BUT it must NOT read the file whole"* | *"Large file, edited \| The ranges covering the edit and what it depends on"*; *"400 lines or fewer \| May be read whole"* (implying larger files are not) | Reads the edited method's range + its dependencies, not the whole 2,000-line file | PASS |
| **H4 (held-out)** — a Reviewer that needs a 900-line file the diff touches in one hunk | (no example in either persona cites this) | Reviewer *Bounded reads*: *"Large file, not edited \| By range, or through CodeGraph, when the diff already justifies opening it"*; *"400 lines or fewer \| May be read whole, under the same condition"* | 900 > 400, so whole-file reading is unavailable; the diff hunk supplies the "diff already justifies opening it" condition, so the Reviewer reads by range (the touched hunk and what it depends on), never the whole 900 lines | PASS — this is the literal row for "large file, not edited by this worker, diff justifies a read" |

**Advisory note (RELIABILITY):** H4 doesn't address reviewer.md item 1's surviving sentence, *"The
full-file escape hatch remains for when the graph cannot answer."* The outcome above still holds
under the *Bounded reads* table's own terms (CodeGraph or range, never whole, over 400 lines) — the
escape hatch only widens *how* a permitted read is satisfied when CodeGraph itself cannot answer, it
does not lift the ≤400-line cap. The tension between that unconditional-sounding "remains" and the
table's cap is worth recording, not resolved by this walk.

**Tally: 3/3 PASS**, no FAIL.

---

## 5. Walk — Requirement text (every FR-1…FR-10 statement, term by term)

Each row maps a requirement clause to the shipped sentence delivering it, or states "not delivered."

### FR-1 — Self-correction loop bounded

| Clause | Shipped sentence | Status |
|---|---|---|
| Stop at 3 consecutive same-failure cycles | `implementer.md`: *"3 consecutive same-failure cycles, or 60 tool calls … whichever comes first"* | Delivered |
| Differently-failing cycle resets the count | *"Reset \| Fails differently, or passes; a respawn starts at zero"* | Delivered |
| Checkpoint vs `FATAL_FAIL` by content; `FATAL_FAIL` terms unchanged; wrong-spec-is-Leader's-call unchanged | *"exit: a checkpoint … else `STATUS: FATAL_FAIL` — hopelessly stuck and cannot fix the build"* (verbatim phrase carried from the pre-existing text); item 2's unchanged Pivot sentence | Delivered |
| Falsifier run / pre-code red / baseline read are not failed cycles | *"Not a cycle \| First run before any fix; a pre-code red; the falsifier run; a baseline read"* | Delivered |
| No completion report with a failing verification | *"ABSOLUTELY PROHIBITED from reporting completion with a failing verification"* | Delivered |

### FR-2 — Checkpoint exit and its report

| Clause | Shipped sentence | Status |
|---|---|---|
| Checkpoint at loop bound or 60-call bound, task unfinished, no blocker | Item 4 bound definition | Delivered |
| Checkpoint only at a bound; earlier is a premature stop | *Don't stop short*: *"a checkpoint before its bound"* listed as a forbidden premature stop | Delivered |
| No edit left half-written; bound checked between edits | *"Bound checked \| Between edits — finish the edit in hand first"* | Delivered |
| Call bound + complete + unverified → run once, then complete or checkpoint | *"Call bound, task complete \| Verified: complete, never checkpoint. Unverified: run once, then complete or checkpoint on failure"* | Delivered |
| Respawn's same-failure count starts at zero | *"a respawn starts at zero"* | Delivered |
| Seven checkpoint fields, in order | Checkpoint-report table (Bound reached / Done / Remaining / Tree state / Tried and failed / Next step / Notes) | Delivered |
| *Don't stop short* keeps forbidding long-run stops; names checkpoint as legitimate | Same bullet, both halves present | Delivered |
| Call bound + complete + verified → completion, never checkpoint | Same *Call bound* row | Delivered |
| Last worker's completion report carries earlier checkpoints' evidence | *Reporting Completion*: *"the last worker carries earlier checkpoints' Done red-run/falsifier evidence in Verification Output/Evidence"* | Delivered |
| Legitimate-stops list names both bound exits | *"the two bound exits (item 4) — checkpoint, `FATAL_FAIL` on its existing terms"* | Delivered |

### FR-3 — One Leader action per report, respawn, cap, accounting

Table rows R1–R8 + Fall-through: walked and PASSed in §1 above.

| Clause | Shipped sentence | Status |
|---|---|---|
| R7 action: fresh Implementer, brief + report verbatim, tree already holds changes, no re-run/no Reviewer | `akili-execute.md` *Action* + *What does not run* bullets | Delivered |
| Precedence (blocker wins; failing-tree checkpoint stays R7; failing-verification-no-blocker is R5 never R3; Pivot flag before respawn; status line decides the counter) | *Precedence*, *Failing verification…*, *Pivot flag* bullets; checkpoint-report intro sentence | Delivered |
| Files recorded from *Tree state*, confirmed in tree; respawned worker reads only its own listed files | *Files* bullet | Delivered |
| Checkpoint consumes no attempt, not a runtime event, no Budget Tripwire round, recorded on its own line only when it fires | *Accounting* bullet + Execution Log Format `checkpoints:` line | Delivered |
| Cap of 2, third checkpoint → HALT with cause `checkpoint cap`, `[~]`, tree handled by HALT step, user asked; HALT record holds every checkpoint + FAIL report; every "end of 3 attempts" sentence also names the checkpoint cap; cap separate from continuation cap | *Cap* bullet; Step 4 header + rollback table + item 3 (checkpoint-cap HALT record); Step 2 preamble line 121; Step 2.4 *Escalation on HALT*; `leader.md` item 4 | Delivered |
| Respawn never pauses, either mode; every checkpoint reported at the continue gate | *Mode* bullet | Delivered |
| Turn-bound formula accounts for up to 2 respawns per task | Step 5: *"+ 2 checkpoint respawns per task + 2 continuations per task"* | Delivered |
| Command names the status line and the fields the Leader reads | Checkpoint-report intro: *"The Leader reads three of its fields — Tree state, Remaining, and Notes"* | Delivered |

### FR-4 — Brief states the budget

| Clause | Shipped sentence | Status |
|---|---|---|
| Host worker: budget by persona reference; non-host: two numbers + seven fields copied | Step 2.2 *Spawn budget* bullet | Delivered |
| Brief says the task text is already in the brief | Same bullet | Delivered |
| Respawn brief says which checkpoint, first or second | Same bullet | Delivered |

### FR-5 — Command output bounded

| Clause | Shipped sentence | Status |
|---|---|---|
| Applies to Implementer + Tester, any command | Both personas' *Output discipline* tables (generic — "what a command prints") | Delivered |
| 100-line limit | *"Limit \| 100 lines"* | Delivered |
| Over limit → file + summary + failing part | *"Over the limit"* row | Delivered |
| Failing part whole (name, assertion/error, location); no "failed"-only summary | *"The failing part"* row names all three elements; a bare "failed" is excluded implicitly by requiring them always | Delivered (implicitly — no literal "not allowed" sentence, but the positive requirement forecloses it) |
| File outside tree / VCS-ignored, never in diff/commit | *"Where the file goes"* row | Delivered |
| Never print a whole file to read it | *"Reading a file"* row | Delivered |
| Diff read as summary then by file | *"Diffs"* row | Delivered |
| Report quotations stay verbatim | *"Evidence in your report"* row | Delivered |

### FR-6 — File reads bounded

| Clause | Shipped sentence | Status |
|---|---|---|
| Applies to Implementer, Reviewer, Tester | All three personas' *Bounded reads* sections | Delivered |
| `requirements.md`/`design.md`: pointed sections + section lookup | Each persona's matching row | Delivered |
| `tasks.md`: Implementer never opens; Reviewer/Tester only at a pointed block | Each persona's matching row | Delivered |
| `execution.md`: only named entries | Each persona's matching row | Delivered |
| Large unedited file: by range/CodeGraph (Reviewer: only once diff-first already allows) | Each persona's matching row | Delivered |
| Large edited file: ranges covering the edit + dependencies | `implementer.md`, `tester.md` rows (Reviewer doesn't edit — no row needed) | Delivered |
| ≤400 lines: read whole | All three personas' matching row | Delivered |
| Already-read, unchanged: not re-read except to quote/pin | All three personas' matching row | Delivered |
| TRD/UX-UI-design rule unchanged | Confirmed unchanged in the diff against `c94e6b6` (this spec's diff does not touch that table) | Delivered (by non-change) |
| Reviewer's diff-first rule unchanged | Confirmed unchanged in the diff | Delivered (by non-change) |
| Each persona defines its own section lookup | `implementer.md` item 1 table; `reviewer.md` and `tester.md`'s own "A section lookup is…" sentences | Delivered |
| "Open a full file about to be edited" sentence brought in line with the large-file rule | `implementer.md`: *"A file you are about to edit is opened whole at 400 lines or fewer, and by the ranges … when larger"* (was: *"Open a full file when you are about to edit it"*) | Delivered |
| Verbatim-at-the-source rule unchanged | `implementer.md` item 1: *"Read every pointed-at scenario verbatim at the source"* (unchanged in the diff) | Delivered |

### FR-7 — Per-spawn record

| Clause | Shipped sentence | Status |
|---|---|---|
| Role, tool-call count, token total, six end states | Execution Log Format `spawns:` line, all six states listed | Delivered |
| Values come from what the host reports | Same line | Delivered |
| Host reports none → `not reported by host` + worker's own counts; Leader never estimates | Same line | Delivered |
| Information only — gates/fails nothing, no Budget Tripwire round | Same line | Delivered |

### FR-8 — Effect measured

| Clause | Shipped sentence | Status |
|---|---|---|
| Scripts/`baseline.txt` stay in the spec folder, move with it to archive | No dedicated sentence exists (or was added by this task); this is the existing, unmodified behavior of `/akili-archive`, which moves the whole spec folder — `measure/` is already inside it | Delivered structurally, not by new text |
| Three targets measured on the first 30 Implementer spawns under the new personas | Not yet run — by design (see FR-8's own last clause) this is a **follow-up**, not something this task's shipped text executes | Not delivered — correctly deferred; recorded as OWED in §10 below |
| Result reported to the user either way | Same — deferred | Not delivered — OWED, §10 |
| Not a validation gate for this spec | True of this closure: no check above depends on FR-8 having run | Delivered (by omission — nothing here treats it as a gate) |

### FR-9 — Older projects/logs behave as today

| Clause | Shipped sentence | Status |
|---|---|---|
| A project with a pre-change `.agents/` persona runs as today; no command fails on it | No explicit guarantee sentence found. This is an **emergent property** of the design: an old persona never emits `STATUS: CHECKPOINT`, so its reports keep matching R1–R6/R8 exactly as before this spec, and the Step 2 sketch's checkpoint branch is a conditional (`if report is STATUS: CHECKPOINT:`) that simply never fires for such a worker | Delivered (structurally) |
| Nothing in `/akili-execute` depends on a checkpoint arriving | Same — the checkpoint branch is conditional, not required, in both the sketch and the R1–R8 table | Delivered (structurally) |
| `execution.md` entries predating FR-7 read as "not recorded" | Execution Log Format: *"An entry written before this line existed reads as 'not recorded'"* | Delivered |

**Advisory note (RISK):** the table above doesn't say what happens when a host brief written for the
new persona (naming, per FR-4, "the budget its own persona states") reaches an old, pre-change
`.agents/implementer.md` that states no such budget. No sentence in either persona addresses this
directly: the old persona has no self-correction bound to read from the brief and simply keeps
running its existing unbounded loop, exactly as it did before this spec. The mismatch is harmless —
the brief's budget line goes unused, nothing errors — and consistent with "runs as today," but the
table does not say so.

### FR-10 — Documented

| Clause | Shipped sentence | Status |
|---|---|---|
| `CHANGELOG.md` `Unreleased` carries the entry, numbers, classification | This task's Part A bullet in `CHANGELOG.md` | Delivered (by this task) |
| Migration note names sentences to replace by hand | Same bullet's *Migration* clause | Delivered (by this task) |
| Mirrors describe the change at summary level, contradict no command sentence | `docs/commands/akili-execute.md:49`, `README.md:849` both state the checkpoint/respawn/cap mechanism consistent with the command (shipped by an earlier task in this spec, T4 per the commit log — not edited here) | Delivered (by an earlier task) |
| `docs/model-routing.md`, `docs/flow.md`, `README.md` change only where a sentence turns false; falsifying grep run first | `README.md` changed (checkpoint mechanism, confirmed above). `docs/model-routing.md` and `docs/flow.md`'s only "checkpoint" hits are the pre-existing, unrelated *model checkpoint* / *context checkpoint* concept — no sentence there asserted anything about the Implementer's old unbounded loop, so no change was owed and none was made (confirmed by the NFR-2 grep in §7, which hits neither file) | Delivered (by non-change, correctly) |

**FR-1…FR-10 tally:** every clause delivered — two FR-9 clauses delivered **structurally** (emergent
properties of the design, unasserted in prose, per the ruling above) rather than by a stated sentence,
and one FR-8 clause correctly deferred as a follow-up, not yet run. No requirement paragraph was
silently dropped.

---

## 6. Persona size — `wc -c` against caps

```
   13969 .claude/templates/implementer.md   (cap 14,054 — 85 bytes headroom)
   11733 .claude/templates/reviewer.md      (cap 11,752 — 19 bytes headroom)
   10427 .claude/templates/tester.md        (cap 10,467 — 40 bytes headroom)
```

All three under cap. **PASS.**

---

## 7. NFR-2 grep — one home per reader

```
grep -rn -i "60 tool calls\|100 lines\|400 lines\|consecutive verification" .claude/commands docs/commands docs/flow.md docs/model-routing.md README.md
```

One hit:

```
.claude/commands/akili-execute.md:180:- **Spawn budget:** … For a **non-host** worker (the standing exception), the same, with the two
bounds copied — **3** consecutive same-failure cycles, or **60 tool calls** — and the seven checkpoint
fields copied in order …
```

Exactly the non-host clause of *Spawn budget*, as required. `CHANGELOG.md` is exempt by NFR-2 and was
not scoped into this grep. **PASS.**

---

## 8. NFR-4 grep — no line-number rule pointers in shipped prose

```
git diff c94e6b6 -- .claude docs/commands docs/flow.md README.md | grep "^+" | grep -n ":[0-9][0-9]*"
```

Zero hits. No added line in the scoped diff contains a `:<digits>` pattern at all (not a rule pointer,
not a time, not a `file:line` example — none exist in the added text). **PASS.**

---

## 9. NFR-5 — bounded diff

```
git diff --stat c94e6b6 -- bin scripts package.json .claude/skills .claude/commands/akili-constitution.md
```

Empty output. **PASS.**

---

## 10. FR-8 measurement — OWED

Not run by this task, correctly (FR-8's own text: *"a follow-up after adoption … SHALL NOT be a
validation gate for this spec"*). **Recorded as owed to the user** after the first 30 Implementer
spawns run under the new personas:

```
python3 docs/specs/changes/subagent-context-budget/measure/dist.py akili-implementer <project-keys>
```

Targets to compare against (from `requirements.md` FR-8): spawns over 100 turns, baseline 14%, target
under 3%; median peak context, baseline 188k–207k, target under 120k; whole reads of
`tasks.md`/`requirements.md`/`design.md`, baseline 45% (99 of 219), target under 10%. Report to the
user whether met or not, regardless of outcome.

---

## 11. Final verification — `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check`

Run after every edit in this task (`CHANGELOG.md`, this file) — nothing else runs in this tree.

```
$ npm run verify:cli
> akili-specs@2.28.0 verify:cli
> node bin/akili.js list

Commands: 11 listed (akili-archive … akili-validate)
Skills: 24 listed
Resources: 7 listed
Summary: 11 commands | 24 skills | 7 resources (akili-specs v2.28.0)
```
**PASS** — CLI lists cleanly, no errors.

```
$ npm run pack:dry-run
…
npm notice Tarball Details
npm notice name: akili-specs
npm notice version: 2.28.0
npm notice filename: akili-specs-2.28.0.tgz
npm notice package size: 2.1 MB
npm notice unpacked size: 3.8 MB
npm notice total files: 275
akili-specs-2.28.0.tgz
```
**PASS** — packs cleanly; `.claude/templates/implementer.md` (14.0kB), `reviewer.md` (11.7kB),
`tester.md` (10.4kB) and `CHANGELOG.md` (233.3kB) are all included in the listing, confirming this
task's edit is packaged.

```
$ git diff --check
(no output)
```
Exit code 0. **PASS** — no whitespace errors in the diff.
