# Execution Log: Scope the Worker Personas' Constitution Read

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/scoped-constitution-reads` |
| Approval Mode | `gated` |
| Started | 2026-09-29, at `e011068` on `master` |
| Budget (design §9) | 4 tasks · ~55 shipped lines · 6 review rounds |
| Review rounds used | 3 (all on T1) |
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
