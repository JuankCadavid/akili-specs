# Execution Log: Scope the Worker Personas' Constitution Read

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/scoped-constitution-reads` |
| Approval Mode | `gated` |
| Started | 2026-09-29, at `e011068` on `master` |
| Budget (design §9) | 4 tasks · ~55 shipped lines · 6 review rounds. **Review rounds extended to 8 by the user, 2026-09-29** (see *Budget Tripwire*, under T2) |
| Review rounds used | 9 of 9 (T1: 3 · T2: 2 · T3: 2 · T4: 2). Budget extended to 8, then to 9 |
| Workers | No Step 8E wrappers and no `## Model Routing` registry in this repository. Fallback spawns seeded from `.agents/`: Implementer on `sonnet`, Reviewer on `opus` (author ≠ auditor) |
| Sequencing | T1, T2 and T3 are parallel-safe by file, and are run **serially**: each task's verification holds a `git diff --stat` check that lists its own files only, which a sibling editing the same tree would falsify |

## 2. Task Execution History

### T1: The worker personas read by section — PASS on attempt 3

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Skills | `cognitive-doc-design` (the task's list, unchanged) |
| Requirements covered | FR-1, FR-2, FR-3, FR-6, NFR-1, NFR-2, NFR-3 |

#### Attempt 1 — Reviewer `FAIL`

| Field | Value |
|---|---|
| Effort | `high` |
| Files changed | `.claude/templates/implementer.md`, `.claude/templates/tester.md` (28 insertions, 6 deletions) |
| runtime events | spawn failure ×1 (`Could not determine current tmux pane/window`) → rung 1, immediate retry. No partial work; no attempt consumed |
| Implementer verification | Checks 1–11 reported passing: **1** 0/0 · **2** 0/0 · **3** 1/1 · **4** 0, 0 · **5** 1 · **6** 6/3 · **7** S1 1/1, S2 1/1, S3 1/1, S4 1/1, S5 2/2, S6 3/4 · **8** 10,710 and 8,835 bytes · **9** 0/0 · **10** no hit · **11** two persona files only; B10 hashes match |
| Executed falsifier | (a) S4 row deleted → `grep -c S4` read 0 · (b) old sentence re-inserted → check 1 read 1 · (c) `docs/ux-ui/design.md` added to the Tester rule → check 4 read 1. All three red, as reported by the Implementer on scratch copies |
| Evidence re-run | **VERIFIED**. Leader-inline, checks 1–11 re-executed on the working tree; every output identical to the report. `git diff --check` clean |
| Reviewer verdict | `STATUS: FAIL`, two issues (below, verbatim) |

**Implementer's `Not Done / Assumptions`, verbatim:**

> My first draft used "S1–S4" as a collapsed range in both personas' order-of-evaluation rule 2. Running falsifier (a) exposed that this text survives deletion of the S4 table row (the range mention keeps `grep -c S4` ≥1), which would silently defeat the required falsifier. I judged this a defect in my own draft (not a spec ambiguity) and reworded rule 2 to "otherwise, act on whichever row above the entry actually matches" in both files before re-running all checks and the falsifier to confirm the red. Flagging this correction explicitly since it changed shipped wording after initial checks had already passed.

The field names no blocker and no owed item. It records one judgment call. No continuation was started (Step 2.3 item 0, *Precedence*). The Reviewer was asked to judge the reworded rule against DD-3 and found it conforming.

**Reviewer report, verbatim:**

> STATUS: FAIL
>
> SUMMARY: I read `.agents/reviewer.md` and adopted it, then reviewed T1 attempt 1 in lens-checklist mode with one reviewer. Diff class is 50–200 LOC. I re-ran checks 7, 8 and 11 and the caching grep, and got the same results the Implementer reported. Implementer text meets FR-1 and FR-6. It also meets FR-3's six rows, the note placement, the three statements about the note and every scenario, all checked line by line against the shipped text. The Tester's surviving-neighbour rule, its no-path rule and its S3 and S6 rows also conform. Two issues fail the gate. One is in the Tester's S5 path resolution. The other is in the Implementer's *Aesthetics* bullet (the Disqualifier read).
>
> On shipped rule 2 ("otherwise, act on whichever row above the entry actually matches"): **it conforms to DD-3 *Order of evaluation* rule 2** ("S1–S4 by what the entry says"). Rule 1 has already settled S5, and S6 is not an entry state, so the only rows the entry can match are S1–S4. The rewording was forced: naming S4 anywhere outside its row would defeat falsifier (a). See the advisory on its phrasing.
>
> ISSUES:
> 1. **Discovered Issue:** `tester.md` rule (1) says "S5 first, after path resolution (default, then legacy) — absent only when both fail." This drops the entry's path. Take a slice that gives a path the project actually uses, where that path is neither the default nor the legacy path. The Tester concludes S5 and skips. "(default, then legacy)" also points at paths this persona deliberately never names.
>    * **Violated Rule:** `requirements.md` FR-3, *When a document "does not exist" (S5)*: "A document exists when it is found at the path the entry gives, at its default path, or at its legacy path. S5 holds only when all of these fail." The same rule is in `requirements.md` §10 (row FR-3, S5) and `design.md` DD-3 *Order of evaluation* rule 1: "absent only when the entry's path, the default path and the legacy path all fail". §7 adds: "Path — The path the project actually uses."
>    * **Remediation Suggestion:** Reword rule (1) along these lines: "S5 first — absent only when the entry's (or citing scenario's) path, the default path and the legacy path all fail." This fits in the 116-byte margin. Do not add a literal path, because check 4 must stay at 0.
>
> 2. **Discovered Issue:** The `implementer.md` *Aesthetics* bullet reads "…tokens defined in `docs/ux-ui/design.md`, read at the sections item 1's section lookup sends you to. The obligation to comply is unchanged by how little of the document you read." There are two problems.
>    * (a) The referent is too narrow. In S1, the expected state, the brief names the sections and no section lookup runs, so the bullet points at a procedure that never ran.
>    * (b) "unchanged by how little of the document you read" can be read literally as: the tokens in parts you did not read still bind you. That pushes the worker to read the rest to be safe, which is the full-read reading the Disqualifier voids.
>    * Field 1 of *Reporting Completion* ("when item 1's section lookup produced one") has the same narrow referent. The S4 multi-match note comes from no lookup.
>    * **Violated Rule:** `design.md` DD-8 says "the tokens are read at the sections item 1 sends the worker to. The obligation to comply is unchanged." The shipped text says "section lookup", not "item 1". `requirements.md` FR-2 says "The persona SHALL NOT contain two sentences that a literal reader could take as one demanding a full read and one forbidding it" and "BUT it must NOT read the rest … to 'be safe'". The T1 Disqualifier voids the evidence "if any surviving sentence can be read as demanding a full read of a reference document."
>    * **Remediation Suggestion:** Change the *Aesthetics* bullet to "…defined in `docs/ux-ui/design.md`, read at the sections item 1 sends you to; that obligation to comply stays." Change field 1 to "…plus a trailing lookup note when item 1 produced one". Both edits shrink the file.
>
> ADVISORY:
> - READABILITY: The rule 2 phrase "whichever row above the entry actually matches" can be misparsed as "the row positioned above the entry". Consider "otherwise, act on the table row the entry matches." That is still S4-free, so falsifier (a) holds.
> - READABILITY: The Tester's note sentence leaves out FR-3's "not an assumption". "Never a reason to change the report shapes below" is also weaker than "never a reason to report `FAIL`/`TEST_GAP`". If bytes allow, name the status, since that is the Tester's equivalent of "task not complete".

#### Attempt 2 — Reviewer `FAIL`

| Field | Value |
|---|---|
| Effort | `xhigh` (bumped one level after the attempt 1 FAIL) |
| Files changed | `.claude/templates/implementer.md`, `.claude/templates/tester.md`. Three sentences changed against attempt 1: Tester rule (1); Implementer *Aesthetics* bullet; Implementer *Reporting Completion* field 1 |
| runtime events | none |
| Implementer verification | Checks 1–11 reported passing: **1** 0/0 · **2** 0/0 · **3** 1/1 · **4** 0, 0 · **5** 1 · **6** 4/3 · **7** S1 1/1, S2 1/1, S3 1/1, S4 1/1, S5 2/2, S6 3/4 · **8** 10,631 and 8,843 bytes · **9** 0/0 · **10** no hit · **11** two persona files only; B10 hashes match |
| Executed falsifier | Re-executed on scratch copies of the attempt 2 text: (a) S4 row deleted → `grep -c S4` read 0 in both · (b) check 1 read 1 · (c) check 4 read 1 |
| `Not Done / Assumptions` | Reported as "None" |
| Evidence re-run | **VERIFIED**. Leader-inline, checks 1–11 re-executed; every output identical to the report. `git diff --check` clean. The delta against the attempt 1 diff is the three reported sentences and nothing else |
| Reviewer verdict | `STATUS: FAIL`, one issue (below, verbatim). Both attempt 1 issues confirmed fixed |

**Reviewer report, verbatim:**

> STATUS: FAIL
>
> SUMMARY: I audited the full 70-line diff against the working tree in lens-checklist mode, with one reviewer and spec conformance as the gate. Both attempt-1 issues are fixed:
> - **Issue 1:** Tester rule (1) now names the entry's path, the default path and the legacy path.
> - **Issue 2:** The *Aesthetics* bullet ("read at the sections item 1 sends you to; that obligation to comply stays") matches DD-8. Field 1 ("plus a trailing lookup note when item 1 produced one") matches DD-4.
>
> **Implementer persona:** it conforms to FR-1, FR-2, FR-3 (all six rows match DD-3, S5 is evaluated after path resolution, and the three DD-4 statements are present), FR-6 and DD-7. The Disqualifier read is clean: no surviving sentence demands a full read, and the note is explicitly barred from `Not Done / Assumptions`.
>
> **Checks re-run by me:**
> - Byte counts are 10,631 and 8,843, so NFR-1 holds against baselines of 8,805 and 7,451.
> - `caching` returns 0/0, and `ux-ui|trd` in `tester.md` returns 0.
> - `git diff --stat` lists only the two persona files, and `git diff --check` is clean.
>
> **Tester persona:** one FR-2 obligation is missing (below).
>
> ISSUES:
> 1.  **Discovered Issue:** The Tester's item 1 never tells the worker to read named sections *verbatim at the source*. S1 reads only "Read them", and `grep -c verbatim .claude/templates/tester.md` returns 0. Nothing stops a Tester from working from the Leader's slice paraphrase of a design or TRD section instead of the section itself. The Implementer carries the clause; the Tester does not.
>     *   **Violated Rule:** These three passages set it:
>         - `requirements.md` FR-2: "The personas SHALL instruct the worker to read each reference document **only at the sections its brief names**, verbatim at the source". Its scenario adds "AND IT MUST read them as written, not from a paraphrase in the brief".
>         - `design.md` DD-1: "The first bullet of item 1 **in each persona** is replaced … three parts … 2. Read each reference document only at the sections the brief names, verbatim at the source."
>         - `tasks.md` T1, the FR-2 cell of the *Requirements* row: "named sections, verbatim".
>     *   **Remediation Suggestion:** Add the obligation to `tester.md` without naming a path. The cheapest fix is to change row S1 to `| S1 | Sections named | Read them, verbatim at the source |`, which adds 28 bytes against the 108-byte margin. Alternatively, add "read only at the sections your slice names, verbatim at the source" to the lead sentence, if it fits the cap. Then re-run checks 4 and 8 and confirm the byte count stays at or below 8,951.
>
> ADVISORY:
> - **Readability:** Tester rule (1) mentions "the default path and the legacy path", but the persona (correctly, per J-2) names neither. The wording follows DD-3 rule 1, so it is not a violation. A Tester still cannot act on those two paths by itself, which in practice means the Leader's slice path governs. T4's literal walk should confirm this.
> - **Readability:** The Implementer's S3 says only "note it". FR-3's S3 scenario requires the report to say "that the brief named no section". DD-3's cell uses the same wording, so this conforms. T4's walk should confirm that a literal Implementer's note records the brief's silence and not just the section it read.
> - **Risk:** The surviving line in `implementer.md` "re-open it and read past the section you came for" (the *quotation is a claim of byte identity* bullet) sits in the same persona as the new "never the whole document". Both are scoped (quoting versus context loading) and neither demands a full read, so there is no FR-2 contradiction. It is still worth a look in the T4 sweep.

#### Attempt 3 — Reviewer `PASS`

| Field | Value |
|---|---|
| Effort | `xhigh`, flagged correctness-critical in the brief. The Implementer was told to walk FR-1, FR-2, FR-3, DD-1, DD-3 and DD-4 clause by clause against each persona before running checks |
| Files changed | `.claude/templates/tester.md`, one line: the S1 row now reads "Read them, verbatim at the source". `.claude/templates/implementer.md` unchanged since attempt 2 |
| runtime events | none |
| Implementer verification | Checks 1–11 reported passing: **1** 0/0 · **2** 0/0 · **3** 1/1 · **4** 0, 0 · **5** 1 · **6** 4/3 · **7** S1 1/1, S2 1/1, S3 1/1, S4 1/1, S5 2/2, S6 3/4 · **8** 10,631 and 8,867 bytes · **9** 0/0 · **10** no hit · **11** two persona files only; B10 hashes match. Added: `grep -c verbatim` in `tester.md` → 1 |
| Executed falsifier | Re-executed on scratch copies of the attempt 3 text, then discarded: (a) S4 row deleted → `grep -c S4` read 0/0 · (b) old sentence re-inserted → check 1 read 1/1 · (c) `docs/ux-ui/design.md` added to the Tester rule → check 4 read 1 |
| Pre-review sweep | 8 hits, each read by the Implementer; none restates a full read of a reference document |
| `Not Done / Assumptions` | Field absent from the report |
| Evidence re-run | **VERIFIED**. Leader-inline, checks 1–11 and the `verbatim` count re-executed; every output identical to the report. `git diff --check` clean. The delta against the attempt 2 diff is the S1 row and nothing else |
| Reviewer verdict | `STATUS: PASS` |

**Reviewer summary (from the report):** the full 70-line diff was checked clause by clause against FR-1, FR-2, FR-3 (the table, every paragraph under it and all five scenarios), FR-6, NFR-1..3, §10, §7, DD-1..4, DD-7 and DD-8, and against the working tree. Both personas conform. The three conditions of the task's Disqualifier are not met. Order-of-evaluation rule 2 conforms to DD-3; all three Reviewers agreed on this.

**ADVISORY (4R lenses, final verdict; recorded, not acted on):**

- READABILITY: `implementer.md` item 4 has an untouched sentence, "Before pinning or quoting a source, re-open it and read past the section you came for". It applies when quoting and does not demand a full read, but a literal reader could stretch it against FR-2.
- RELIABILITY: Tester rule (1) mentions "the default path and the legacy path", and by design (J-2) the Tester persona names neither. In practice the Tester uses the path from its slice or from the citing scenario. The spec accepts this.

Both Reviewers suggested that T4's walk look at these points. T4's scope is the approved one in `tasks.md` and is not widened by them.

#### T1 closing record

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer, attempt 3) |
| Attempts | 3 Implementer attempts, 3 Reviewer verdicts (FAIL, FAIL, PASS) |
| Models | Implementer `sonnet` · Reviewer `opus` |
| Final verification | Checks 1–11 green on the final tree, re-run by the Leader. `implementer.md` 10,631 bytes (cap 10,805, +1,826 against B7). `tester.md` 8,867 bytes (cap 8,951, +1,416 against B7) |
| Requirements covered | FR-1, FR-2, FR-3, FR-6, NFR-1, NFR-2, NFR-3 |
| Decisions made | Tasks run serially (Document Control). Skill list unchanged from the task. No execute-time spec edit |
| Issues encountered | **1.** Each of the first two reviews found an obligation the pass before it missed. Both were requirement content carried by a sentence and not by a scenario: the entry's path in the Tester's S5 rule, and FR-2's "verbatim at the source" in the Tester persona (the class KZ-changes--gate-falsifiability-2 names). **2.** The design's wording for rule 2, "S1–S4 by what the entry says", cannot ship as written: naming S4 outside its row keeps check 7 green after falsifier (a) deletes the row. The Implementer reworded it and all three Reviewers found the rewording conforming. **3.** Persona growth landed above the design's estimate (Implementer +1.7k estimated, +1,826 actual; Tester +1.1k estimated, +1,416 actual), inside both caps. **4.** No lookup note was reported by any worker: neither reference document exists in this repository (S5) |
| Observation | This repository's deployed `.agents/implementer.md` and `.agents/tester.md` still carry the old sentence. `.agents/` is out of this spec's scope; the migration note is T4's (FR-8) |
| Budget | Review rounds: 3 of 6 used. Three tasks remain, so the budget holds only if each passes on its first review |

### T2: The Implementer brief settles the entry — PASS on attempt 2

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Continue gate | User: "continue with T2" (after the T1 summary) |
| Skills | `cognitive-doc-design` (the task's list, unchanged) |
| Requirements covered | FR-4, NFR-2, NFR-3 |
| Baselines | B8 and B13 re-confirmed by the Leader at `917880c` before the spawn: 1, 1, 1, 0, 0 and 5 |

#### Attempt 1 — Reviewer `FAIL`

| Field | Value |
|---|---|
| Effort | `high`. Raised from the `medium` default: T1 failed twice on requirement text carried by a sentence, and the review budget has no slack |
| Files changed | `.claude/commands/akili-execute.md` (3 insertions, 3 deletions): Step 2.2 *pointers* bullet, Step 2.2 *constitution by reference* bullet, the *issues encountered* bullet of the task entry field list |
| runtime events | none |
| Implementer verification | Checks 1–7 reported passing: **1** 0 · **2** 0 · **3** 0 · **4** 1 · **5** 1 · **6** 5 · **7** `akili-execute.md` only |
| Executed falsifier | (a) "or the word `none`" deleted on a scratch copy; scenario *A backend task* walked; the mutated sentence leaves no way to state an empty entry · (b) "paths only" re-inserted → check 1 read 1 |
| Pre-review sweep | 4 hits between the Step 2.2 and Step 2.3 headings; none tells the Leader that the worker reads the reference documents whole |
| `Not Done / Assumptions` | Field absent from the report |
| Evidence re-run | **VERIFIED**. Leader-inline, checks 1–7 re-executed; every output identical to the report. `git diff --check` clean |
| Reviewer verdict | `STATUS: FAIL`, one issue (below, verbatim) |

**Reviewer report, verbatim:**

> STATUS: FAIL
>
> SUMMARY: One pass, since the diff is under 50 LOC. The scoped hunks match nearly all of FR-4 and DD-5. The *pointers* bullet drops `trd.md`. The two-part constitution bullet is there: root guides by path, then for each of TRD and UX/UI the sections or the word `none`, with "an omitted entry is not a valid empty state". The caching-friendly / "paths only" sentence is gone. The non-host text gives all three DD-5 substitutions and says the S6 instruction is "a stop, not a fallback". The *issues encountered* field now names the lookup note, as the DD-4 *In the record* row asks. The brief contract still has its five clauses, `git diff --stat` shows only `akili-execute.md`, and I found no host tool name (NFR-2) and no line-number pointer (NFR-3). The Disqualifier read holds on all three counts: no bullet offers TRD sections separately from the entry, the non-host text adds no fallback, and the record clause is in the field list the Leader writes from. The pre-review sweep confirms nothing between 2.2 and 2.3 tells the Leader the worker reads the reference documents whole.
>
> The one failure is the reason the new bullet gives for the omitted-entry rule. It says the opposite of the shared contract and of the persona T1 shipped.
>
> ISSUES:
> 1. **Discovered Issue:** The constitution bullet explains why an omitted entry is invalid with: "since the worker's persona has an action for every stated state but none for a document the brief is silent on." That is false for a host worker. `.claude/templates/implementer.md` item 1 (T1, `917880c`) has row **S3 | Entry absent | Resolve the path (default, then legacy). Section lookup for what the task touches; note it**. So the persona does have an action for a document the brief says nothing about. A Leader reading this sentence learns a wrong model of the contract: it would think an omission leaves the worker with no action, when in fact it triggers a lookup plus a note. This is exactly the restatement drift the budget warns about.
>    * **Violated Rule:** `design.md` → `## 7. Shared Contracts`, row **Invalid**: "An omitted entry, in a brief and in a slice alike. The command rule forbids it; **the persona still has an action for it (S3)**, since a brief composed by an older command copy will omit it." Also contradicted: DD-5's non-host table, which lists "Actions for S3, S4 and S6" as "What a host worker gets from its persona".
>    * **Remediation Suggestion:** Delete the clause from "since the worker's persona has an action…" up to the sentence's end, and end the sentence at "not a valid empty state". Or replace it with a reason that agrees with §7. One option: the stated-empty rule comes from FR-4, and the persona's fallback for an absent entry costs a section lookup and a note. Keep the non-host sentence "since no persona gives that worker an action for any other state". It is correct and follows FR-4 and DD-5. Re-run checks 1–7 afterwards. Check 4 must still read 1.

#### Budget Tripwire — review rounds (raised after T2 attempt 1)

| Field | Value |
|---|---|
| Measure | Review rounds. Budget 6 (`design.md` §9) |
| State when raised | 4 used (T1: 3 · T2: 1). At least 3 more are needed if every remaining review passes first time: T2 rework, T3, T4. Minimum total 7 |
| Cause | The design budgeted two rework rounds for the spec. Three were needed across T1 and T2. Each FAIL was a defect in rule text that the task's greps could not see |
| Action | The Leader stopped before spawning the T2 rework and put three options to the user |
| Decision | **User, 2026-09-29: "option 1, extend to 8 and continue".** Review-round budget is now 8. Tasks and shipped-lines budgets are unchanged |
| Spec edit | None. `design.md` §9 keeps its approved estimate; this block is the record of the extension |

#### Attempt 2 — Reviewer `PASS`

| Field | Value |
|---|---|
| Effort | `xhigh` (bumped one level after the attempt 1 FAIL) |
| Files changed | `.claude/commands/akili-execute.md`. One clause deleted against attempt 1: the sentence in the *constitution by reference* bullet now ends at "an omitted entry is not a valid empty state." |
| runtime events | none |
| Implementer verification | Checks 1–7 reported passing: **1** 0 · **2** 0 · **3** 0 · **4** 1 · **5** 1 · **6** 5 · **7** `akili-execute.md`, plus the Leader's `execution.md` |
| Executed falsifier | Re-executed on scratch copies of the attempt 2 text, then discarded: (a) "or the word `none`" deleted; scenario *A backend task*, clause "AND IT MUST state `none` for `docs/ux-ui/design.md` in words", cannot be met · (b) "paths only" re-inserted → check 1 read 1 |
| Pre-review sweep | 4 hits between the Step 2.2 and Step 2.3 headings; none tells the Leader that the worker reads the reference documents whole |
| `Not Done / Assumptions` | Field absent from the report |
| Evidence re-run | **VERIFIED**. Leader-inline, checks 1–7 re-executed; every output identical to the report. `git diff --check` clean. The delta against the attempt 1 diff is the deleted clause and nothing else |
| Reviewer verdict | `STATUS: PASS`. No issues. No ADVISORY block (diff under 50 lines) |

**Reviewer summary (from the report):** the whole diff was audited again from fresh context against FR-4, DD-5, §7, DD-4 and the shipped Implementer persona. The entry sentence matches DD-5's *After* cell. All three non-host substitutions are present, and the S6 instruction is a stop. The *pointers* bullet names `requirements.md` and `design.md` only. The lookup note is named in the field list that Step 3 sends the Leader to. The brief contract keeps its five clauses. The three conditions of the task's Disqualifier are not met.

#### T2 closing record

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer, attempt 2) |
| Attempts | 2 Implementer attempts, 2 Reviewer verdicts (FAIL, PASS) |
| Models | Implementer `sonnet` · Reviewer `opus` |
| Final verification | Checks 1–7 green on the final tree, re-run by the Leader |
| Requirements covered | FR-4, NFR-2, NFR-3 |
| Decisions made | Review-round budget extended from 6 to 8 by the user (*Budget Tripwire*, above). Skill list unchanged from the task. No execute-time spec edit |
| Issues encountered | **1.** Attempt 1 added a reason for the omitted-entry rule that the spec does not state, and the reason was false against `design.md` §7 and the persona's S3 row. The attempt 2 brief forbade any explanation the spec does not give. **2.** No lookup note was reported by any worker: neither reference document exists in this repository (S5) |
| Shipped lines | 3 insertions, 3 deletions. The design estimated about 8 for T2; the three edits are long single-line bullets |
| Budget | Review rounds: 5 of 8 used. T3 and T4 remain |

### T3: The Tester's context slice settles the entry — PASS on attempt 2

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Continue gate | User: "continue with T3" (after the T2 summary). While T3 ran, the user added: "continue with T4 once T3 passes" |
| Skills | `cognitive-doc-design` (the task's list, unchanged) |
| Requirements covered | FR-5, NFR-2, NFR-3 |
| Baselines | B9 re-confirmed by the Leader at `70d5330` before the spawn: 0, 0, 0 |

#### Attempt 1 — Reviewer `FAIL`

| Field | Value |
|---|---|
| Effort | `high` |
| Files changed | `.claude/commands/akili-test.md` (2 insertions, 1 deletion): a new bullet under Phase 1 item 2, and the Phase 4 Summary sentence |
| runtime events | none |
| Implementer verification | Checks 1–5 reported passing: **1** 1 · **2** 1 · **3** 1 · **4** two hunks, Phase 1 item 2 and Phase 4; none under *UX Testing Guidance* or in the *Token discipline* block · **5** `akili-test.md` only |
| Executed falsifier | The UI-suite sentence deleted on a scratch copy; scenario *A UI suite whose scenarios cite no design section* walked against it. The remaining text no longer forbids `none` for a UI suite |
| `Not Done / Assumptions` | Field absent from the report |
| Evidence re-run | **VERIFIED**. Leader-inline, checks 1–5 re-executed; every output identical to the report. `git diff --check` clean |
| Reviewer verdict | `STATUS: FAIL`, one issue (below, verbatim) |

**Reviewer report, verbatim:**

> STATUS: FAIL
>
> SUMMARY: One pass over a 3-line diff, since it is under 50 LOC. The shipped text meets most of the task:
> - **Phase 4:** the Summary clause matches DD-4 *In the record*, and it sits where the Leader reads when it writes the report.
> - **Phase 1:** three of DD-6's rules are present. An omitted entry is invalid. `none` is scoped to "a suite with no UI behavior". A UI suite must name design sections and cannot write `none`.
> - **Wording:** "meaningful UI/UX behavior" matches *UX Testing Guidance* byte for byte.
> - **Scope:** no hunk touches *Token discipline* or *UX Testing Guidance*. Only `akili-test.md` changed, and `git diff --check` is clean.
> - **Disqualifier:** a Leader cannot read "`none` is the expected value" as covering a UI suite, so it is not triggered.
> - **NFR-2 and NFR-3:** met. There is no host tool name and no line-number pointer.
> - **Implementer's per-document scoping:** writing "no scenario in the slice that cites **that** document" instead of DD-6's "a reference document" is an acceptable narrowing. §7 sets granularity at one entry per document, and it matches FR-3's S6 Tester column.
>
> One obligation is missing: what the entry actually contains.
>
> ISSUES:
> 1. **Discovered Issue:** The new bullet says the entry is "named sections, or the word `none`". It never requires each named section to come with the document's path, and never says the Leader resolves that path, legacy paths included. The two default paths appear only as labels for which document is meant.
>    - The sibling bullet that already shipped, `/akili-execute` Step 2.2 *constitution by reference*, says "the path and the sections this task touches, or the word `none`". So the two commands now describe one contract differently.
>    - The shipped Tester persona (`tester.md` item 1) checks "the entry's path" first when it decides S5. This slice never has to carry one.
>    - The FR-5 scenario *An E2E suite that asserts visual behavior* ("BUT it must NOT hand the Tester the document path alone") assumes an entry made of path plus sections. The shipped text says nothing about path at all.
>    - **Violated Rule:**
>      - `requirements.md` → *FR-5*: "carry the same per-document entry as FR-4".
>      - `requirements.md` → *FR-4*: "either the sections the task touches (path + section name) or the word `none`".
>      - `design.md` → *§7 Shared Contracts*, *Valid values* row: "One or more section names, each with the document's path; or the word `none`".
>      - `design.md` → *§7 Shared Contracts*, *Path* row: "The path the project actually uses. The Leader resolves it, legacy paths included."
>    - **Remediation Suggestion:** Edit only the one inserted bullet in Phase 1 item 2. Replace "named sections, or the word `none`" with wording equivalent to "the path the project uses (the Leader resolves it, legacy paths included) and the named sections, or the word `none`", matching the `/akili-execute` sibling. Leave the three DD-6 rules and the "meaningful UI/UX behavior" phrase as they are. Then re-run checks 1–5 and the Disqualifier read of Phase 1 and *UX Testing Guidance* in full.
>
> ADVISORY: none. It is suppressed because the diff is under 50 LOC.

#### Attempt 2 — Reviewer `PASS`

| Field | Value |
|---|---|
| Effort | `xhigh` (bumped one level after the attempt 1 FAIL) |
| Files changed | `.claude/commands/akili-test.md`. One phrase changed against attempt 1: the entry is now "the path the project uses (the Leader resolves it, legacy paths included) and the named sections, or the word `none`" |
| runtime events | none |
| Implementer verification | Checks 1–5 reported passing: **1** 1 · **2** 1 · **3** 1 · **4** two hunks, Phase 1 item 2 and Phase 4; none under *UX Testing Guidance* or in the *Token discipline* block · **5** `akili-test.md`, plus the Leader's `execution.md` |
| Executed falsifier | Re-executed on a scratch copy of the attempt 2 text, then discarded: UI-suite sentence deleted; scenario *A UI suite whose scenarios cite no design section* walked; the remaining text no longer forbids `none` for a UI suite |
| `Not Done / Assumptions` | Field absent from the report |
| Evidence re-run | **VERIFIED**. Leader-inline, checks 1–5 re-executed; every output identical to the report. `git diff --check` clean. The delta against the attempt 1 diff is the one phrase and nothing else |
| Reviewer verdict | `STATUS: PASS`. No issues. No ADVISORY block (diff under 50 lines) |

**Reviewer summary (from the report):** the whole diff was audited again from fresh context against FR-5, FR-4, DD-6, §7 and DD-4, both FR-5 scenarios, and the shipped Tester persona. The entry now carries path and sections, which meets FR-4, FR-5 and the §7 *Valid values* and *Path* rows. §7 rows *Section name* and *Extent of a section* are not carried, as in the `/akili-execute` bullet that passed review. The non-host case stays with the untouched pointer rule under *Token discipline*, as DD-6 says. Both conditions of the task's Disqualifier are not met.

#### T3 closing record

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer, attempt 2) |
| Attempts | 2 Implementer attempts, 2 Reviewer verdicts (FAIL, PASS) |
| Models | Implementer `sonnet` · Reviewer `opus` |
| Final verification | Checks 1–5 green on the final tree, re-run by the Leader |
| Requirements covered | FR-5, NFR-2, NFR-3 |
| Decisions made | Skill list unchanged from the task. No execute-time spec edit. The rework fitted the extended budget, so no stop was owed before attempt 2 |
| Issues encountered | **1.** Attempt 1 dropped the path from the entry. It is contract content held in two rows of the `design.md` §7 table and in FR-4's parenthesis, not in a scenario. **2.** One Leader command hit a transient permission-check failure during the attempt 1 re-run and passed on a single retry. It was the Leader's own command, not a worker, so it is not a runtime event of the task. **3.** No lookup note was reported by any worker: neither reference document exists in this repository (S5) |
| Shipped lines | 2 insertions, 1 deletion. The design estimated about 6 for T3 |
| Continue gate | Passed without a pause, on the user's instruction "continue with T4 once T3 passes" |
| Budget | Review rounds: 7 of 8 used. T4 remains, with one round |

### T4: CHANGELOG, literal walk, and closure sweeps — PASS on attempt 3

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Continue gate | Entered on the user's instruction "continue with T4 once T3 passes" |
| Skills | `cognitive-doc-design` (the task's list, unchanged) |
| Requirements covered | FR-7, FR-8, NFR-4, and the cross-document gates of `requirements.md` §8 |

#### Attempt 1 — Reviewer `FAIL`

| Field | Value |
|---|---|
| Effort | `xhigh`. The task produces derived evidence that a later gate consumes |
| Review mode | Lens checklist, one Reviewer. The mode table offers parallel lens Reviewers at `xhigh`; one was used because the shipped diff is one CHANGELOG bullet and one round remained in the budget |
| Files changed | `CHANGELOG.md` (entry added under `Unreleased` → `### Changed`; placeholder line removed) · `docs/specs/changes/scoped-constitution-reads/closure.md` (new, 169 lines). No `docs/commands/` page edited |
| runtime events | none |
| Implementer verification | Checks 1–6 reported passing: **1** 0 · **2** 1 · **3** T1 checks 1–9, T2 checks 1–5 and T3 checks 1–3 all at their targets · **4** the five shipped files plus files under `docs/specs/changes/` · **5** B10 hashes match · **6** `npm run verify:cli` exit 0, `npm run pack:dry-run` exit 0, `git diff --check` exit 0 |
| Executed falsifier | Legacy path removed from a scratch copy of `implementer.md`; case H2 moved from S3 (lookup, note) to S5, "skip; no note" |
| P-14 | Settled by the Implementer from the vendor's prompt-caching documentation, read 2026-09-29; recorded in `closure.md` §1 |
| Walk | S1–S6 for both personas and the five named cases; every recorded outcome matches the Expected column of `tasks.md` |
| Mirror sweep | 0 hits |
| `Not Done / Assumptions` | Field absent from the report |
| Evidence re-run | **VERIFIED**. Leader-inline, checks 1–6 re-executed with the tree quiet; every output identical to the report. Mirror sweep re-run: 0 hits |
| Reviewer verdict | `STATUS: FAIL`, one issue (below, verbatim) |

**Reviewer report, verbatim:**

> STATUS: FAIL
>
> SUMMARY: One spec violation, found in the CHANGELOG entry's last sentence. Everything else checks out at source, one item at a time:
> - **Quoted old sentence:** `cmp` shows line 14 of both 3b66e40 personas is identical, and the entry's quotation matches it byte for byte.
> - **Safe Update:** confirmed at akili-constitution.md:424, where it appends only.
> - **Audit claims:** the Tester bleed claim matches akili-audit.md:55, and the Implementer "lacks only" claim matches clause (c).
> - **"Nothing updates… automatically":** present.
> - **FR-8:** all three bullets met.
> - **Range:** a labeled range, with no fixed saving figure.
> - **Arithmetic:** recomputed and correct. 33,354/4 = 8,338.5; 54,670/4 = 13,667.5; 112,149/4 = 28,037.25.
> - **Walk:** I re-walked H1, H2, H3, "S5 then S6" and Non-host independently and got the same outcomes as closure.md. All match the Expected column as written in tasks.md.
> - **Disqualifier:** not triggered. H1–H3 are not cited in the item-1 text of either persona, and each case follows from the table plus its order-of-evaluation clause.
> - **Falsifier:** the reasoning is sound. With the legacy leg removed, clause (1) is met for H2, which gives S5, "skip; no note".
> - **Mirror sweep:** 0 hits (grep exit 1), re-run by me.
> - **Cross-read:** accurate. The S3 difference between personas is the deliberate one FR-3 names.
> - **Criterion 4:** accurately recorded (see issue 2).
>
> ISSUES:
>
> 1. **Discovered Issue:** The entry ends with *"The entry states nothing about whether sibling workers' separate cache entries share any of that saving."* That sentence is itself a statement about cache behavior across workers. The phrase "sibling workers' separate cache entries" assumes that sibling workers hold separate cache entries. That is exactly the claim that is UNVERIFIED in P-14, and it is the conclusion of closure.md §1's reading of the vendor documentation. So the entry does rely on the P-14 read, and the sentence contradicts itself: it claims silence while making the statement. closure.md §1 ("Effect on the entry… It does" stay silent), §2b row 7 and §6 ("No clause was found unsupported") all record silence that did not ship. That is a KZ-002 summary-surface miss inside the task's own evidence.
>    * **Violated Rule:** design.md → DD-9 row 7: *"No fixed figure, and no statement about cache behavior across workers (P-14)"*. tasks.md → T4 Scope 1: *"Whatever it says, the entry stays silent on cache behavior across workers (DD-9 row 7)."* requirements.md §8: *"The CHANGELOG entry is checked clause by clause against the shipped text"*.
>    * **Remediation Suggestion:** Delete the final sentence of the entry. Silence means no sentence on the topic, not a sentence saying there is none. Then correct closure.md §1 "Effect on the entry", §2b row 7 and §6 so they match. The headline clause "the cross-worker caching claim is removed" describes FR-6's text removal, not cache behavior, and can stay.
>
> 2. **Not an implementation defect (recorded for the Leader). Criterion 4 is a spec-level inconsistency.** closure.md §8 is accurate: 13,668 is above the proposal's "under ~12k". The approved requirements, §2 finding 3 and NFR-4, already replaced that ceiling with "about 9k–13k", and the computed range is within "about" of it. The Done clause "Success Criteria 1–4 each ticked" takes the proposal's wording as still in force, which the requirements superseded. Recording the criterion as "not met as literally worded", with the superseding measure cited, is the honest record, and adjusting it to fit would breach the Disqualifier. Criterion 4 is not a FAIL. The inconsistency belongs in the Kaizen retrospective, or a note to the user at closure, not in rework.
>
> ADVISORY:
> - READABILITY: The entry's parenthetical *"(the TRD at `docs/trd/trd.md`, … legacy paths included)"* sits under "Both personas". A reader could infer that `tester.md` now carries those paths, but it deliberately names none (DD-3, P-16). Consider "(the TRD and the UX/UI design; the Implementer's rule names their default and legacy paths, the Tester's names none)".
> - READABILITY: "a slot each report already has" covers `/akili-execute`'s task entry, which is a record in execution.md, not a report. "Each record" would be exact.
>
> Outside this diff (T1–T3): no defect found.

#### Budget Tripwire — review rounds (raised after T4 attempt 1)

| Field | Value |
|---|---|
| Measure | Review rounds. Budget 8, as extended by the user on 2026-09-29 |
| State when raised | 8 used (T1: 3 · T2: 2 · T3: 2 · T4: 1). The T4 rework needs a ninth |
| Cause | Every task needed one rework round or more. Five Reviewer FAIL verdicts, each a single defect in prose that the task's greps could not see |
| Action | The Leader recorded the FAIL, marked T4 `[~]`, spawned no rework, and stopped for the user |
| Tree state at the stop | T1, T2 and T3 committed (`917880c`, `70d5330`, `29d1171`). Uncommitted: `CHANGELOG.md` and `closure.md` as attempt 1 left them, this log, and the T4 status in `tasks.md` |
| T4 attempts | 1 of 3 used |
| Decision | **User, 2026-09-29: "run /akili-test once T4 passes".** The message names no option. The Leader read it as approval to continue T4 and took the smallest extension offered: review-round budget 9 (option 1). A FAIL on the ninth round stops the run again. `/akili-test` is queued for after a T4 PASS |

#### Attempt 2 — evidence re-run `MISMATCH` (implicit FAIL; no Reviewer spawned)

| Field | Value |
|---|---|
| Effort | `xhigh` (unchanged; attempt 1 already ran at `xhigh`) |
| Files changed | `CHANGELOG.md`: the last sentence of the entry deleted, nothing added in its place · `closure.md`: §1 *Effect on the entry*, the quoted entry in §2, and §2b row 7 corrected to match |
| runtime events | none |
| Implementer verification | Reported as passing. Checks 1, 2, 4, 5 and 6 as in attempt 1. Check 3 reported as: T1 checks 1–9 "0/0, 0/0, 1/1, 0, 1, 3/4, 1/1·1/1·1/1·1/1·2/2·3/4, 10631/8867 bytes, 0/0" · T2 checks 1–5 "0, 0, 3, 1, 1" · T3 checks 1–3 "1, 1, 1" |
| Executed falsifier | Re-executed on a fresh scratch copy: legacy path removed; H2 moved from S3 to S5, "skip; no note" |
| `Not Done / Assumptions` | Field absent from the report |
| Evidence re-run | **MISMATCH**. Leader-inline, checks 1–6 re-executed with the tree quiet |
| Reviewer verdict | None. The loop sends a MISMATCH back to the Implementer without a Reviewer |

**The mismatch, command by command:**

| Command | Reported by the Implementer | Re-run by the Leader | Target |
|---|---|---|---|
| T2 check 3: ``grep -c 'and `trd.md` — path' .claude/commands/akili-execute.md`` | 3 | 0 | 0 |
| T1 check 6: `grep -c -i "section lookup"`, `implementer.md` / `tester.md` | 3/4 | 4/3 | ≥ 1 each |

Every other output matched: check 1 → 0 · check 2 → 1 · T1 checks 1–5 and 7–9 · T2 checks 1, 2, 4, 5 → 0, 0, 1, 1 · T3 checks 1–3 → 1, 1, 1 · check 4, the five shipped files plus `docs/specs/changes/` · check 5, B10 hashes match · check 6, `verify:cli` exit 0, `pack:dry-run` exit 0, `git diff --check` exit 0.

**What the Leader observed in the tree (inline, not a conformance judgment):** the re-executed value of T2 check 3 is 0, which is the target, and `closure.md` §7a records 0. The entry now ends at "(112,149 bytes ÷ 4)." Its two remaining `caching` hits are the headline clause and the quoted old sentence. The difference is between the worker's report and the tree, not between the tree and the target. The re-run is mechanical and is never waived, so the attempt is recorded as an implicit FAIL and the Leader's observation does not stand in for the comparison.

#### Attempt 3 — Reviewer `PASS`

| Field | Value |
|---|---|
| Effort | `xhigh`, flagged correctness-critical in the brief |
| Feedback carried | The MISMATCH table of attempt 2, and the attempt 1 Reviewer issue, both verbatim |
| Files changed | None in this attempt. The Implementer re-executed every command, compared `closure.md` against fresh output, and found no correction owed. `CHANGELOG.md` is byte-identical to attempt 2 (Leader, by diffing the two attempt diffs) |
| runtime events | none |
| Implementer verification | Every command reported with its output as printed, each number labeled by file: **1** 0 · **2** 1 · **3** T1 checks 1–9: 0/0, 0/0, 1/1, 0 and 0, 1, `section lookup` 4 in `implementer.md` and 3 in `tester.md`, S1 1/1, S2 1/1, S3 1/1, S4 1/1, S5 2/2, S6 3/4, 10,631 and 8,867 bytes, 0/0; T2 checks 1–5: 0, 0, 0, 1, 1; T3 checks 1–3: 1, 1, 1 · **4** the five shipped files plus files under `docs/specs/changes/` · **5** B10 hashes match · **6** `npm run verify:cli` exit 0, `npm run pack:dry-run` exit 0, `git diff --check` exit 0 |
| Executed falsifier | Re-executed on a fresh scratch copy, then discarded: legacy path removed from the Implementer rule; H2 moved from S3 (lookup, note) to S5, "skip; no note" |
| `Not Done / Assumptions` | Field absent from the report |
| Evidence re-run | **VERIFIED**. Leader-inline, checks 1–6 re-executed with the tree quiet; every output identical to the report |
| Reviewer verdict | `STATUS: PASS`. No issues |

**Reviewer summary (from the report):** the whole T4 product was audited from fresh context. The entry carries every clause of FR-8 and all seven rows of DD-9, and every fact in it was confirmed at its source: the old sentence byte for byte at `3b66e40`, Safe Update, and both `/akili-audit` claims. The entry has no statement about cache behavior across workers; its two `caching` words are the headline and the quoted old sentence. `closure.md` describes the final entry accurately, and its numbers are the ones the commands print. The Reviewer re-walked H1, H2, H3, "S5 then S6" and Non-host independently and got the recorded outcomes. The Disqualifier is not triggered. No defect was found in the T1–T3 text.

**ADVISORY (4R lenses, final verdict; recorded, not acted on):**

- READABILITY: the entry says "only at the sections the brief names" just before the table, and the table lets the Implementer run a section lookup in S3 and S6. The table qualifies the sentence, so it is true; a skimming reader could take it as absolute.

Advisories from the attempt 1 verdict, also recorded and not acted on: the entry's parenthetical on paths sits under "Both personas" and could be read as saying `tester.md` carries the reference paths; "a slot each report already has" covers the `/akili-execute` task entry, which is a record.

#### T4 closing record

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer, attempt 3) |
| Attempts | 3 Implementer attempts. 2 Reviewer verdicts (FAIL, PASS) and 1 evidence-re-run MISMATCH |
| Models | Implementer `sonnet` · Reviewer `opus` |
| Final verification | Checks 1–6 green on the final tree, re-run by the Leader |
| Requirements covered | FR-7, FR-8, NFR-4, and the cross-document gates of `requirements.md` §8 |
| Decisions made | Review-round budget extended from 8 to 9 (*Budget Tripwire*, above). One Reviewer used at `xhigh` where the mode table offers parallel lens Reviewers. The attempt 2 MISMATCH was applied as the rule states, with no Reviewer spawned on it. No execute-time spec edit |
| Issues encountered | **1.** Attempt 1 shipped a sentence that claimed silence on a topic while making a statement about it, and `closure.md` recorded the silence as delivered (the class KZ-002 names, inside the task's own evidence). **2.** Attempt 2's report stated two numbers the commands do not print; the tree and `closure.md` were correct. **3.** Proposal Success Criterion 4 is not met as literally worded (below). **4.** No lookup note was reported by any worker: neither reference document exists in this repository (S5) |
| P-14 | Settled from the vendor's prompt-caching documentation, read by the attempt 1 Implementer on 2026-09-29; recorded in `closure.md` §1. The entry relies on nothing from it |
| Mirror sweep | 0 hits. No `docs/commands/` page edited |

## 3. Summary

All four tasks are `[x]`, each closed by a Reviewer `PASS`. No task was skipped or waived.

| Task | Closing record | Commit | Implementer attempts | Review rounds |
|---|---|---|---|---|
| T1 The worker personas read by section | PASS, attempt 3 | `917880c` | 3 | 3 |
| T2 The Implementer brief settles the entry | PASS, attempt 2 | `70d5330` | 2 | 2 |
| T3 The Tester's context slice settles the entry | PASS, attempt 2 | `29d1171` | 2 | 2 |
| T4 CHANGELOG, literal walk, and closure sweeps | PASS, attempt 3 | this commit | 3 | 2 |

**Against the budget (`design.md` §9):**

| Measure | Budget | Actual |
|---|---|---|
| Tasks | 4 | 4 |
| Shipped lines | about 55 | 35 insertions and 12 deletions across the five shipped files |
| Persona growth | Implementer +1.7k of 2,000 bytes · Tester +1.1k of 1,500 | Implementer +1,826 · Tester +1,416 |
| Review rounds | 6 | 9. Extended by the user to 8, then to 9 |

**Requirements delivered:** FR-1 to FR-8 and NFR-1 to NFR-4. `reviewer.md` and `leader.md` are byte-identical to `3b66e40` (FR-7).

**Proposal Success Criteria:**

| # | Result | Evidence |
|---|---|---|
| 1 | Met | T1 checks 1 and 2; `closure.md` §8 |
| 2 | Met | T2 checks 4 and 5 |
| 3 | Met | The walk and its executed falsifier, `closure.md` §3 |
| 4 | **Not met as literally worded** | Computed 8,338–13,668 tokens, against the proposal's "under ~12k". `requirements.md` §2 finding 3 replaced that ceiling with a range of about 9k–13k. Both Reviewers of T4 judged it a mismatch between spec documents and not a defect in the work |
| 5 | Not evaluable in this spec | `requirements.md` §8: observed over the next two specs |

**For the Kaizen retrospective at archive:**

- Five Reviewer FAILs and one evidence MISMATCH across four tasks. Each FAIL was one defect in prose that the task's greps could not see. Three were requirement content held in a sentence or a table row and not in a scenario: the entry's path in the Tester's S5 rule, "verbatim at the source" in the Tester persona, and the path in the slice entry.
- The design's wording for order-of-evaluation rule 2, "S1–S4 by what the entry says", cannot ship as written without defeating the task's own falsifier.
- Success Criterion 4 kept the proposal's ceiling after the requirements had replaced it.
- The review-round budget was set at 6 and the run needed 9.

**Not covered by any gate in this spec (`requirements.md` §8, accepted risks):** whether a real worker given the new text reads by section, and whether Reviewer FAILs for token or convention violations rise afterwards.

**Open after this run:** this repository's deployed `.agents/implementer.md` and `.agents/tester.md` still carry the old sentence; `.agents/` is ignored by git and outside this spec. `/akili-test` is queued at the user's instruction.

## 4. Corrections After Validation (2026-09-29)

Three figures in this log were wrong as first written. All three were the Leader's, not a worker's. Found by the independent audit run for `/akili-validate`, and confirmed against `git diff --numstat 3b66e40 HEAD` and the task entries above.

| Where | Was | Is | Basis |
|---|---|---|---|
| §3 Summary, *Shipped lines* | 36 insertions | 35 insertions | `git diff --stat`: 5 files changed, 35 insertions, 12 deletions |
| T4 *Budget Tripwire*, *Cause*; §3 Kaizen list | Six Reviewer FAILs | Five | T1 two, T2 one, T3 one, T4 one. The sixth event was the T4 evidence MISMATCH, which is not a Reviewer verdict |
| §3 Kaizen list | Four were content held in a sentence or row | Three, now named | T2's FAIL was an added reason clause, and T4's was an added sentence; neither was dropped content |

Correction closure: the superseded values were searched across the spec folder. `36 insertions` and `Six` had no other site. `test-report.md` and `closure.md` do not cite them.
