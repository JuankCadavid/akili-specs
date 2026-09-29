# Tasks: Scope the Worker Personas' Constitution Read

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/scoped-constitution-reads` |
| Depth | **Standard** |
| Status | **Approved** — user chose **Continue** at the Step 3.3 gate, 2026-09-29 |
| Date | 2026-09-29 |
| Source | `requirements.md` (FR-1..FR-8, NFR-1..4, amended: its §10), `design.md` (budget §9: 4 tasks · ~55 lines · 6 review rounds), `judgment.md` (J-1..J-16 corrected, not re-judged) |
| Baselines | Every count below was **run at `3b66e40` before it was written**. T stands for `.claude/templates/`, C for `.claude/commands/`. **B1** `grep -c -i caching` in T `implementer/tester` → **2/2** (heading and sentence, each). **B2** `grep -c "consult the project constitution"` → **1/1**. **B3** `grep -c "Context & Skills"` → **0/0**. **B4** `grep -c ux-ui T/tester.md` → **1**; `grep -c trd T/tester.md` → **1**. **B5** `grep -c 'system-design\|detailed-design' T/implementer.md` → **0**. **B6** `grep -c -i "section lookup"` → **0/0**. **B7** `wc -c` → `implementer.md` **8,805**, `tester.md` **7,451**. **B8** in C `akili-execute.md`: `paths only` **1**, `caching-friendly` **1**, `lookup note` (case-insensitive) **0**, `not a valid empty state` **0**, ``and `trd.md` — path`` **1**. **B9** in C `akili-test.md`: `lookup note` **0**, `not a valid empty state` **0**, `reference document` (case-insensitive) **0**. **B10** SHA-256 prefix: `reviewer.md` `e93dafb8633a3e09d3d7`, `leader.md` `a5f0bbf7e5de5f3901d3`. **B11** `grep -c -E '\.md:[0-9]+'` in T `implementer/tester` → **0/0**. **B12** `grep -c "No unreleased changes yet" CHANGELOG.md` → **1**. **B13** `grep -c -E '^- \*\*\([a-e]\) ' C/akili-execute.md` → **5**. **B14** `grep -c "consult the project constitution" CHANGELOG.md` → **0**. **B15** `grep -c "S[1-6]"` in T `implementer/tester` → **0/0** |
| Commit prefix | `[SPEC:changes/scoped-constitution-reads]` |

## 2. Task Graph

```
T1 (implementer.md + tester.md: FR-1, FR-2, FR-3, FR-6) ─┐
T2 (akili-execute.md: FR-4)                              ├─→ T4 (CHANGELOG + literal walk + sweeps)
T3 (akili-test.md: FR-5)                                 ─┘
```

T1, T2 and T3 touch disjoint files, so they are **parallel-safe**. T4 depends on all three.

**Scope discipline (every task).** Zero hunks in `bin/`, `scripts/`, `package.json`, `.claude/templates/reviewer.md`, `.claude/templates/leader.md`, `.claude/commands/akili-constitution.md`, `.claude/commands/akili-audit.md`, `.claude/worktrees/` and `docs/commands/`. Any hunk there is a FAIL regardless of content. A `docs/commands/` edit is owed only if T4's mirror sweep finds a restated sentence, and then it is T4's.

**One rule for every task.** No shipped sentence points at a rule by line number (NFR-3, KZ-005). The line numbers in this document locate edits for the Implementer; they are never copied into shipped text.

---

### T1: The worker personas read by section

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Review | `full`: persona text is re-read on every spawn in every downstream project; the task **removes delivered behavior** (DD-1, reversion challenge run) and defines an obligation others execute (overrides a and d) |
| Depends on | none |
| Requirements | FR-1 (full read of root guides; missing guide skipped; *BUT must NOT be told to read the reference documents whole*); FR-2 (named sections, verbatim; the *Aesthetics* obligation kept; no two contradictory sentences; *AND IT MUST read them as written*; *BUT must NOT read the rest "to be safe"*); FR-3 (S1–S6 per persona; S5 path resolution; Tester names no path; no-match ends the lookup; the note is not a gap; all five scenarios); FR-6 (*BUT must NOT remove the Step 0 caching sentence*); NFR-1, NFR-2, NFR-3 |
| Design refs | §7 (entry contract, path-resolution table), DD-1, DD-2, DD-3 (table, order of evaluation, *surviving neighbour*), DD-4 (report placement and the three statements about the note), DD-7, DD-8 |

**Scope.**

`.claude/templates/implementer.md`:

- **Item 1 heading:** *Strict Context Alignment (Context & Skills)*.
- **Item 1, first bullet:** replaced in place with DD-1's three parts. It names both reference documents with their default and legacy paths (§7). It defines *section lookup* in one sentence (DD-2), including the no-match case. It carries the Implementer's six rows of DD-3, written out, and the order of evaluation in its three rules.
- **The note:** DD-4's three statements, placed with the rule. The note goes in the **Task Completed** field.
- **Item 3, design-token bullet:** gains DD-8's clause. The obligation to comply stays.
- **Reporting Completion, field 1:** its description admits a lookup note (DD-4).

`.claude/templates/tester.md`:

- **Item 1 heading:** the same rename.
- **Item 1, first bullet:** replaced in place. It names **no** reference path. It carries the Tester's six rows of DD-3, written out, and the order of evaluation. It states that reference documents follow this table alone (DD-3, *surviving neighbour*).
- **The note:** one line in the report body, ahead of the status block. The report shapes are not edited.

**Verification** (repo root; T = `.claude/templates`).

| Field | Value |
|---|---|
| Command | **1.** `grep -c "consult the project constitution" T/implementer.md T/tester.md` → **0/0** (B2 = 1/1). **2.** `grep -c -i caching T/implementer.md T/tester.md` → **0/0** (B1 = 2/2). **3.** `grep -c "Context & Skills"` → **1/1** (B3 = 0/0). **4.** `grep -c ux-ui T/tester.md` → **0** and `grep -c trd T/tester.md` → **0** (B4 = 1, 1). **5.** `grep -c 'system-design\|detailed-design' T/implementer.md` ≥ **1** (B5 = 0). **6.** `grep -c -i "section lookup"` ≥ **1/1** (B6 = 0/0). **7.** For each of `S1`..`S6`: `grep -c "S<n>"` ≥ 1 in each persona (B15 = 0/0 for the whole set). **8.** `wc -c`: `implementer.md` ≤ **10,805**; `tester.md` ≤ **8,951** (B7 + the NFR-1 caps). **9.** `grep -c -E '\.md:[0-9]+'` → **0/0** (B11 = 0/0). **10.** `grep -n -E 'Grep\|Glob\|Bash\|Read tool'` in the added lines of `git diff` → no hit. **11.** `git diff --stat` lists the two persona files only; `shasum -a 256 T/reviewer.md T/leader.md` matches B10 |
| Falsifier | Checks 1–7 fail on `3b66e40` (all run: B1–B6, B15). Checks 9 and 11 pass on `3b66e40`, so they are guards and prove nothing alone. **Executed falsifier required**, on a scratch copy of each edited persona, outside the working tree: **(a)** delete the S4 row → check 7 must fail for `S4`; **(b)** re-insert the old four-document sentence → check 1 must read 1; **(c)** in the Tester copy, add `docs/ux-ui/design.md` to the rule → check 4 must read 1. Observe all three, then discard the copies |
| Red run | `n/a (no test gate)` |
| Disqualifier | Greps count strings, not meaning, and check 7 proves a label is present, not that its action is. **Read item 1 whole in both personas** after the edit (KZ-changes--leader-brief-contract-1), and in `implementer.md` also the *Aesthetics* bullet and *Reporting Completion*. The evidence is void if any surviving sentence can be read as demanding a full read of a reference document, if the Implementer's note can be read as belonging in `Not Done / Assumptions`, or if the order of evaluation lets S5 be concluded from the default path alone. What the presence checks cannot prove, the behavior of a worker given this text, is T4's literal walk |
| Consumers | No test file pins persona text: `grep -rn -i "Strict Context\|consult the project" scripts bin .github` → **0 hits**, run at `3b66e40`. Design-time readers, from the Premise Ledger: `akili-execute.md` Step 2.2, the *constitution by reference* bullet (P-2; edited by T2); `akili-audit.md`, *Persona injection bleed*, and `akili-constitution.md`, the injection-scope checklist item (P-16; both are satisfied by check 4, no edit owed); `akili-audit.md`, structural-drift clause (c) (P-15; read, no edit owed) |

**Pre-review sweep** (KZ-changes--kaizen-loop-closure-2, keyed on the obligation). `grep -n -i "in full\|whole\|entire\|all of\|every section\|FIRST" T/implementer.md T/tester.md`: read every hit and confirm none restates a full read of a reference document in other words.

**Done.** All edits land; checks 1–11 run and quoted; the falsifier executed with its three reds recorded; item 1, the *Aesthetics* bullet and *Reporting Completion* read whole; byte counts reported against both caps. If the Implementer's rule cannot fit its cap, stop and report. Do not drop a state.

**Skills:** `cognitive-doc-design`.

---

### T2: The Implementer brief settles the entry

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Review | `full`: edits the brief list every Leader executes, and a record field every task entry carries (override a) |
| Depends on | none |
| Requirements | FR-4 (entry per document: sections or `none`; omitted is invalid; no implied full read; the non-host bullets; the note is recorded; scenario *A backend task*, incl. *AND IT MUST state `none` … in words* and *BUT must NOT leave the UX/UI entry out*); NFR-2, NFR-3 |
| Design refs | §7, DD-5 (both bullet amendments, the non-host table, the five-clause note), DD-4 (*In the record*, `/akili-execute` row) |

**Scope.** Edit `.claude/commands/akili-execute.md` only:

- **Step 2.2, the *pointers* bullet:** names `requirements.md` and `design.md`. `trd.md` leaves this bullet.
- **Step 2.2, the *constitution by reference* bullet:** rewritten per DD-5. Root guides by path. For each reference document, the path and the sections this task touches, or `none`. An omitted entry is not a valid empty state. The non-host case is stated here with DD-5's three substitutions. The sentence about the persona's caching-friendly read sequence is removed.
- **Step 3, task entry field list:** *issues encountered* names the worker's lookup note as one thing it holds.
- The brief contract's five clauses are **not** edited.

**Verification** (C = `.claude/commands`).

| Field | Value |
|---|---|
| Command | **1.** `grep -c "paths only" C/akili-execute.md` → **0** (B8 = 1). **2.** `grep -c "caching-friendly" C/akili-execute.md` → **0** (B8 = 1). **3.** ``grep -c 'and `trd.md` — path' C/akili-execute.md`` → **0** (B8 = 1). **4.** `grep -c "not a valid empty state" C/akili-execute.md` → **1** (B8 = 0). **5.** `grep -c -i "lookup note" C/akili-execute.md` ≥ **1** (B8 = 0). **6.** `grep -c -E '^- \*\*\([a-e]\) ' C/akili-execute.md` → **5**, unchanged (B13 = 5); a guard, since it passes on `3b66e40`. **7.** `git diff --stat` lists `akili-execute.md` only |
| Falsifier | Checks 1–5 fail on `3b66e40` (all run: B8). **Executed falsifier required**, on a scratch copy: **(a)** delete the words "or `none`" from the amended bullet → the FR-4 scenario, walked against the copy, has no way to state an empty entry; record the sentence that fails. **(b)** re-insert "paths only" → check 1 must read 1 |
| Red run | `n/a (no test gate)` |
| Disqualifier | **Read the whole Step 2.2 brief list and the brief contract** after the edit. The evidence is void if the list still offers `trd.md` sections in one bullet and the entry in another, if the non-host text offers the worker a fallback the task lacks (narrow-never-widen), or if the record clause sits where the Leader does not read at the moment it writes the entry |
| Consumers | No test file pins these sentences: `grep -rn -i "paths only\|issues encountered" scripts bin .github` → **0 hits**, run at `3b66e40`. Design-time readers: `docs/commands/akili-execute.md`, the *Brief contract* bullet ("five clauses"; stays true, P-11); the Reviewer brief in Step 2.3 (P-4; unchanged); `.claude/worktrees/authorship/` holds its own copy and is out of scope (P-3) |

**Pre-review sweep.** `grep -n -i "constitution" C/akili-execute.md`: read every hit between the Step 2.2 heading and the Step 2.3 heading and confirm none tells the Leader that the worker reads the reference documents whole.

**Done.** Edits land; checks 1–7 run and quoted; the falsifier executed; the brief list and brief contract read whole.

**Skills:** `cognitive-doc-design`.

---

### T3: The Tester's context slice settles the entry

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Review | `full`: edits what every Leader puts in a Tester's slice, and what the test report records (override a) |
| Depends on | none |
| Requirements | FR-5 (entry per document; omitted is invalid; a UI suite names design sections; the note is recorded; scenario *A UI suite whose scenarios cite no design section*, incl. *BUT must NOT write `none`*; scenario *An E2E suite that asserts visual behavior*, incl. *BUT must NOT hand the Tester the document path alone*); NFR-2, NFR-3 |
| Design refs | §7, DD-6 (three rules), DD-4 (*In the record*, `/akili-test` row) |

**Scope.** Edit `.claude/commands/akili-test.md` only:

- **Phase 1, item 2:** the context slice gains the entry, with DD-6's three rules.
- **Phase 4, the sentence that lists what the Summary records:** gains the Tester's lookup note.
- *UX Testing Guidance* and the pointer rule under *Token discipline* are **not** edited.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c "not a valid empty state" C/akili-test.md` → **1** (B9 = 0). **2.** `grep -c -i "lookup note" C/akili-test.md` ≥ **1** (B9 = 0). **3.** `grep -c -i "reference document" C/akili-test.md` ≥ **1** (B9 = 0). **4.** `git diff C/akili-test.md` shows no hunk under the `## UX Testing Guidance` heading and none in the *Token discipline* block. **5.** `git diff --stat` lists `akili-test.md` only |
| Falsifier | Checks 1–3 fail on `3b66e40` (all run: B9). **Executed falsifier required**, on a scratch copy: delete the UI-suite rule → the FR-5 scenario *A UI suite whose scenarios cite no design section*, walked against the copy, permits `none`; record the walk |
| Red run | `n/a (no test gate)` |
| Disqualifier | **Read Phase 1 whole and *UX Testing Guidance* whole** after the edit. The evidence is void if a Leader can read "`none` is the expected value" as covering a UI suite, or if "meaningful UI/UX behavior" is worded differently in the new rule than in the guidance it answers |
| Consumers | No test file pins these sentences: `grep -rn -i "context slice" scripts bin .github` → **0 hits**, run at `3b66e40`. Design-time readers: `docs/commands/akili-test.md` (names the slice, restates no edited sentence, P-11); `tester.md` item 1 (T1) |

**Done.** Edits land; checks 1–5 run and quoted; the falsifier executed; Phase 1 and the guidance read whole.

**Skills:** `cognitive-doc-design`.

---

### T4: CHANGELOG, literal walk, and closure sweeps

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Review | `full`: produces derived evidence that the closure gate consumes, a walkthrough and a byte computation (override c) |
| Depends on | T1, T2, T3 |
| Requirements | FR-7; FR-8 (all clauses; scenario *A maintainer of an older project*, incl. *AND IT MUST say that nothing updates it automatically* and *BUT must NOT promise a token saving as a fixed figure*); NFR-4; the cross-document gates of `requirements.md` §8 |
| Design refs | DD-9 (seven rows and the audit table), DD-10, P-13, P-14, §9 |

**Scope.**

1. **Settle P-14 first.** Read the vendor's prompt-caching documentation and record what it says about cache sharing between separate requests. Whatever it says, the entry stays silent on cache behavior across workers (DD-9 row 7).
2. **`CHANGELOG.md` → `Unreleased` → `### Changed`:** one entry with DD-9's seven rows. The old sentence is quoted byte for byte from `3b66e40`. The range is computed, not copied: root guides 31,710 bytes, plus two to four sections of 822 to 5,740 bytes, at 4 bytes per token. The placeholder line under `### Notes` is removed.
3. **Literal walk.** For each persona, walk S1–S6 and the cases below against the **shipped text**, as a literal-minded agent would, and record each outcome in `closure.md` in the spec folder. Every case is judged against the rule's general sentence. Three cases are **held out**: the shipped text does not cite them.

| Case | Setup | Expected, derived from `design.md` DD-3 and §7 |
|---|---|---|
| H1 (held out) | Implementer. Brief names two TRD sections and is silent on the UX/UI design. Backend task | TRD: S1, read both. Design: S3, path resolved, section lookup finds nothing the task touches, reads nothing further, note in **Task Completed**. No `Not Done / Assumptions` |
| H2 (held out) | Implementer. Project has `AGENTS.md` only; the design lives at `docs/system-design/design.md`. Brief silent. Task changes a visible component | Missing root guide skipped. Default path fails, legacy path found, so **not** S5. S3: section lookup, tokens read, note |
| H3 (held out) | Tester. Slice says `none` for both documents. One scenario in the slice cites a TRD section | S2, then S6: section lookup at the cited section; one note line ahead of the status block |
| S5 then S6 | Implementer. No design document at any path. Task touches UI | S5. S6 does not fire. No note |
| Non-host | Leader briefing a non-host Implementer, walked against `akili-execute.md` | Sections copied; entry settled to S1 or S2; the stop-and-report instruction present |

4. **Cross-read.** For each of `none`, silence, and a stale name, confirm the two command texts and the two personas agree on what it means.
5. **Mirror sweep.** `grep -n -i "paths only\|by reference\|reference document\|lookup note\|issues encountered" docs/commands/akili-execute.md docs/commands/akili-test.md`. A restated edited sentence is updated; zero hits is recorded as zero.
6. **Summary-surface check (KZ-002).** Every clause of the CHANGELOG entry is checked against the shipped text it describes.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c "No unreleased changes yet" CHANGELOG.md` → **0** (B12 = 1). **2.** `grep -c "consult the project constitution" CHANGELOG.md` ≥ **1** (the quoted old sentence; B14 = 0). **3.** Re-run T1 checks 1–9, T2 checks 1–5 and T3 checks 1–3 on the final tree. **4.** `git diff --stat 3b66e40` lists exactly: `CHANGELOG.md`, `.claude/templates/implementer.md`, `.claude/templates/tester.md`, `.claude/commands/akili-execute.md`, `.claude/commands/akili-test.md`, plus `docs/specs/changes/**`. **5.** `shasum -a 256 .claude/templates/reviewer.md .claude/templates/leader.md` matches B10 (FR-7). **6.** `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` |
| Falsifier | Check 1 reads 1 on `3b66e40`. Check 4 fails if any frozen path appears. **Executed falsifier required for the walk:** on a scratch copy of `implementer.md`, remove the legacy path from the rule and re-walk H2; the outcome must change to S5, "skip; no note". A walk whose outcome does not move under that mutation is an inert fixture and is reported as such |
| Red run | `n/a (no test gate)` |
| Disqualifier | A walk is a read. It is void if a case was judged by finding its own citation in the text and not by the general sentence, if a held-out case turns out to be cited by the shipped text, or if an expected outcome above was adjusted to match what the text does. A CHANGELOG entry that states a fixed saving, or that says `/akili-audit` reports nothing, contradicts FR-8 and DD-9 whatever the greps say. Check 6 proves the package installs; it proves nothing about the rule |
| Consumers | `scripts/release.js` reads `Unreleased` at release time, and `scripts/notify-slack.js` digests the bold headline of each bullet. Both are release-time consumers; no edit is owed, and the entry opens with a bold headline |

**Done.** Entry written; P-14 settled and recorded; the walk recorded with all five cases and the executed falsifier; cross-read and mirror sweep recorded; checks 1–6 run and quoted; proposal Success Criteria 1–4 each ticked with its evidence. Success Criterion 5 is recorded as not evaluable in this spec (`requirements.md` §8).

**Skills:** `cognitive-doc-design`.

---

## 3. Coverage (scenario and clause granularity)

| Requirement · scenario / clause | Owner |
|---|---|
| FR-1 · full read; missing guide skipped; non-host exception; *A worker starts a task*, incl. *BUT must NOT be told to read … whole* | T1 (checks 1, 2; disqualifier read); non-host: T2 |
| FR-2 · named sections verbatim; *Aesthetics* obligation kept; no contradictory pair; *The brief names two TRD sections*, incl. *AND IT MUST read them as written* and *BUT must NOT read the rest* | T1 (disqualifier read of item 1 and the *Aesthetics* bullet; pre-review sweep) |
| FR-3 · S1–S6, both columns | T1 (check 7); T4 (walk) |
| FR-3 · S5 path resolution | T1 (check 5, disqualifier); T4 (H2 and its falsifier) |
| FR-3 · Tester names no path | T1 (check 4, falsifier c) |
| FR-3 · no-match ends the lookup; the note is not a gap | T1 (disqualifier); T4 (H1) |
| FR-3 · note lands in the existing report | T1 (scope, *Reporting Completion*); T4 (H1, H3) |
| FR-3 · *A silent brief and a UI task*, incl. *AND IT MUST state in its report* and *BUT must NOT ship styling without … tokens* | T4 (H2) |
| FR-3 · *`none` stated, then the task touches UI anyway*, incl. *AND IT MUST report the mismatch* and *BUT must NOT treat `none` as permission* | T4 (walk, S2 → S6) |
| FR-3 · *A stale section name*, incl. *BUT must NOT fall back to reading the whole document* | T4 (walk, S4) |
| FR-3 · *A project with no reference documents*, incl. *BUT must NOT report the absence as a blocker* | T4 (walk, S5 then S6) |
| FR-3 · *A Tester with a silent slice*, incl. *BUT must NOT skip a reference section that a scenario … cites* | T4 (walk, S3 Tester; H3) |
| FR-4 · entry per document; omitted invalid; no implied full read; *A backend task*, incl. both clauses | T2 (checks 1–4; falsifier a) |
| FR-4 · non-host bullets | T2 (disqualifier); T4 (non-host case) |
| FR-4 · the note is recorded | T2 (check 5) |
| FR-5 · entry; omitted invalid | T3 (check 1) |
| FR-5 · UI suite names sections; *A UI suite whose scenarios cite no design section*, incl. *BUT must NOT write `none`* | T3 (falsifier; disqualifier) |
| FR-5 · *An E2E suite that asserts visual behavior*, incl. *BUT must NOT hand … the document path alone* | T3 (check 3; disqualifier read of Phase 1) |
| FR-5 · the note is recorded | T3 (check 2) |
| FR-6 · no caching rationale; *A later author reads the rule*, incl. *BUT must NOT remove the Step 0 caching sentence* | T1 (check 2); T2 and T3 scope discipline (no hunk at Step 0); T4 (check 4) |
| FR-7 | T1 (check 11); T4 (check 5) |
| FR-8 · every clause; *A maintainer of an older project*, incl. both clauses | T4 (scope 2 and 6; disqualifier) |
| FR-8 · `docs/commands/` mirrors | T4 (scope 5) |
| NFR-1 | T1 (check 8) |
| NFR-2 | T1 (check 10); T2, T3 disqualifier reads |
| NFR-3 | T1 (check 9); the rule in §2 |
| NFR-4 | T4 (scope 2, the computed range) |
| §8 defect classes | Old mandate survives: T1 pre-review sweep, T4 check 3 · state with no action: T4 walk · contradicted neighbour: T1–T3 disqualifier reads · brief and persona disagree: T4 cross-read · package no longer installs: T4 check 6 · summary surface: T4 scope 6 |

**No task is `skip-eligible`.** Every task edits a rule that others execute, or produces evidence a later gate consumes, and each one's `Disqualifier` names a read.

## 4. Estimate and PR Strategy

| Measure | Value |
|---|---|
| Shipped lines | about 55 (T1 ≈ 32, T2 ≈ 8, T3 ≈ 6, T4 ≈ 9) |
| Spec-folder lines | `closure.md`, about 60 |
| PR strategy | **Single change set**, committed per task on `master` with the `[SPEC:…]` prefix, as this repository does. Well under 400 lines |
| Sequencing | Run before `changes/review-intensity-trial-terms`, which also edits `akili-execute.md` |
