# T6 — Closure Walkthrough Record

Persisted by the Leader from the T6 Implementer's scratchpad record (2026-09-18). HEAD at walkthrough: `1dc7894`. The worker wrote no repo file; the fixture lived in the session scratchpad and was deleted. The Reviewer's verdict and any re-walk are appended below the record.

---


Spec: `docs/specs/changes/leader-brief-contract/`. Range for all diffs/logs: `66d4a0d..HEAD` (5 task commits: `21c9831` T1, `097b642` T2, `22d91da` T3, `840cd0e` T4, `1dc7894` T5).

---

## Part (a) — Greps from requirements.md §8, rows 1–2, 4, 6, 9–11 (repo root, exclusions applied)

Rows counted from the first data row of the §8 table.

### Row 1 — surviving unconditional rollback / inline-diff sentence

```
grep -rnE "always inline, the one payload|Run \`git restore \.\` and \`git clean -fd\`|git restore \. and git clean" .claude/commands .claude/templates docs/commands docs/flow.md README.md --exclude-dir=worktrees
```

Raw hit list (1 hit):
```
.claude/commands/akili-execute.md:258:   | **Clean** — only the halted task's changes are uncommitted | Run `git restore .` and `git clean -fd` to revert the working tree to a clean state. Do not leave broken code for the user to clean up | "clean tree — blanket restore" |
```

**Sanctioned.** This is the clean-tree row of Step 4 item 1, kept byte-identical by design (FR-6 clean-tree scenario; confirmed by T2's and T5's Reviewers — forward pointer 4 in `execution.md` against T6). Zero unsanctioned hits.

### Row 2 — `/goal` condition unreachable for a waived task

```
grep -n "matching PASS" .claude/commands/akili-execute.md docs/flow.md
```

Raw hit list (2 hits, both in `akili-execute.md`; `docs/flow.md` had none):
```
.claude/commands/akili-execute.md:240:This also makes the ordering machine-checkable — a gate on `tasks.md` writes can require the matching PASS to already be in `execution.md`, which is impossible under the reverse order because the evidence does not exist yet at the moment of the write. ...
.claude/commands/akili-execute.md:281:> Every task in `docs/specs/<spec-path>/tasks.md` is `[x]` with matching PASS or `REVIEW_WAIVED` evidence in `execution.md`, OR `execution.md` contains a `## HALT:`/`## Pivot Record:`/budget-tripwire block, OR a question is pending for the user. Stop after `<N>` turns.
```

Line 240: **sanctioned** — Step 3's sentence describing the Step 8F tasks-gate hook (the hook greps `PASS`, not extended by this spec, DD-7; forward pointer 1 in `execution.md`). Line 281: the updated `/goal` condition itself, and it already reads "PASS or `REVIEW_WAIVED` evidence" — the gate's required form. Zero unsanctioned hits.

### Row 4 — attempt accounting stated as a rule, not an example

```
grep -n "consumed by a Reviewer" .claude/commands/akili-execute.md .claude/templates/leader.md
```

Raw hit list (2 hits, both in `akili-execute.md`; zero in `leader.md`):
```
.claude/commands/akili-execute.md:64:**Accounting rule:** an attempt is consumed by a Reviewer `FAIL` or an Implementer-reported verification failure, and by nothing else. ...
.claude/commands/akili-execute.md:214:- **Maximum Retries:** ... **Accounting rule** (Step 2 preamble, *Runtime-failure fallback*): an attempt is consumed by a Reviewer `FAIL` or an Implementer-reported verification failure, and by nothing else — a runtime event recovered per that table's ladder never touches this ceiling.
```

One hit sits immediately before the runtime table (line 64, the *Accounting rule* sentence the table itself introduces) and one sits in Step 2.4 *Maximum Retries* (line 214) — satisfying "≥ 1 hit in the runtime table and one in 2.4". `leader.md` carries zero literal hits for this phrase; it instead cross-references by name ("runtime events never consume an attempt (the command's runtime table is canonical)", `leader.md` line 32) rather than restating the sentence — consistent with DD-1's division (command owns mechanics, persona restates principle by pointer, KZ-005). Not a defect.

### Row 6 — idle-without-report restated instead of cited

```
grep -nc "poke" .claude/commands/akili-execute.md
```

Result: `0`. Clean — the command names idle-without-report as a pointer to `leader.md` and never touches the word "poke".

### Row 9 — framework or product name outside a parenthetical (NFR-4)

```
grep -nE "Angular|Jest|Cypress|Orca|tmux|onecgiar|PRMS" .claude/commands/akili-execute.md .claude/templates/leader.md .claude/templates/reviewer.md
```

Result: no hits (exit 1). Clean.

### Row 10 — edit to a file another spec owns (NFR-7)

```
git diff --stat -- .claude/commands/akili-specify.md .claude/skills/tdd .claude/commands/akili-constitution.md .claude/templates/implementer.md .claude/commands/akili-test.md
```

Run both against the working tree and against `66d4a0d..HEAD`: both empty. Clean — zero edits to files this spec does not own.

### Row 11 — invariant sentence rewritten (NFR-8)

Full-diff search over `66d4a0d..HEAD` for `-` lines containing any of the four invariant phrases, across `.claude/commands/akili-execute.md`, `.claude/templates/leader.md`, `.claude/templates/reviewer.md`, `docs/commands/akili-execute.md`:

```
git diff -U0 66d4a0d..HEAD -- .claude/commands/akili-execute.md .claude/templates/leader.md .claude/templates/reviewer.md docs/commands/akili-execute.md | grep -nE '^-.*(3 rework attempts|FATAL_FAIL|Poke once, then replace|author ≠ auditor)'
```

Five `-` lines matched. Each is paired below with its `+` line and a verdict on whether the invariant phrase survives byte-identical:

1. **`.claude/commands/akili-execute.md`, runtime table Reviewer row** (sanctioned rewrite, forward pointer 2 — T2, design §7 row 1):
   - `-`: `| Reviewer | **Never inline** — the Leader reviewing work it supervised breaks \`author ≠ auditor\`, and a runtime failure does not suspend a correctness constraint. Offer the user: a different model (\`/model\`), a cross-host dispatch (per the registry), or an explicit recorded waiver |`
   - `+`: `| Reviewer | **Never inline** — the Leader reviewing work it supervised breaks \`author ≠ auditor\`, and a runtime failure does not suspend a correctness constraint. **1** retry once · **2** retry-after-N (same terms) · **3** a different model (\`/model\`) or the registry's cross-host dispatch · **4** waiver — **is** a \`REVIEW_WAIVED\` record (Execution Log Format, below) — a user stop; **never inline without the record** |`
   - Verdict: `author ≠ auditor` survives byte-identical. Sanctioned by design (the row was widened into five rungs, per FR-4).

2. **`.claude/commands/akili-execute.md`, Step 2.4 Maximum Retries** (append, not a rewrite of the invariant):
   - `-`: `- **Maximum Retries:** A hard ceiling of **3 rework attempts** per task. This prevents infinite loops and token waste.`
   - `+`: same sentence + `**Accounting rule** (Step 2 preamble, *Runtime-failure fallback*): an attempt is consumed by a Reviewer \`FAIL\` or an Implementer-reported verification failure, and by nothing else — a runtime event recovered per that table's ladder never touches this ceiling.`
   - Verdict: "3 rework attempts" survives byte-identical; the diff shows as a full-line replacement only because trailing text was appended.

3. **`.claude/commands/akili-execute.md`, Step 5 Approval Mode** (append):
   - `-`: `...a **HALT**, a Pivot, a budget tripwire, or a \`FATAL_FAIL\` always stops for the user — pre-approval covers routine progress, not the cases whose content nobody could know in advance.`
   - `+`: same sentence + `A \`REVIEW_WAIVED\` decision and the Leader-inline ask (Implementer ladder rung 5) are stops for the user too, never auto-passed — both remove or replace the correctness gate, the same class of exception the list above already covers.`
   - Verdict: `FATAL_FAIL` survives byte-identical.

4. **`.claude/templates/leader.md`, item 4 first bullet** (sanctioned rewrite, forward pointer 2 — T3, design §7 row 14):
   - `-`: `Run the loop exactly as \`/akili-execute\` Step 2 defines it: 3-attempt ceiling, \`FATAL_FAIL\` fail-fast, verbatim structured feedback + Attempt History on retries, **effort bumped one level per retry** (a fix that failed is usually under-thinking, not missing instructions), HALT + Automatic Rollback after 3.`
   - `+`: same lead + `...runtime events never consume an attempt (the command's runtime table is canonical), HALT + rollback **by tree state** after 3.`
   - Verdict: `FATAL_FAIL` survives byte-identical. Only "HALT + Automatic Rollback after 3" → "HALT + rollback by tree state after 3" changed — that phrase is not one of the four protected invariants (FR-6 explicitly changes the rollback rule).

5. **`docs/commands/akili-execute.md`, Maximum retries mirror** (append):
   - `-`: `- **Maximum retries.** Hard ceiling of 3 rework attempts per task. After 3 consecutive FAILs the loop HALTS and presents the audit trail.`
   - `+`: same sentence with an accounting clause inserted mid-sentence + unchanged tail.
   - Verdict: "3 rework attempts" survives byte-identical.

**Row 11 verdict: clean.** All five `-`/`+` pairs preserve their invariant phrase byte-identical; two are the specifically sanctioned rewrites, three are simple insertions around an unchanged invariant sentence.

**Part (a) overall: greps clean, zero unsanctioned hits. Sanctioned list:** Step 4 clean-tree restore sentence (row 1); Step 3's Step-8F-hook sentence (row 2).

---

## Part (b) — Hand-off byte check

Compared: `reviewer.md` audit item + Step 2.2 copied-fields bullet (this spec, shipped) vs. `docs/specs/archive/2026-09-18-changes--gate-falsifiability/design.md` §7 consumer-walk rows + DD-6 (that spec's current archived path).

### Match 1 — Step 2.2 copied-fields bullet

Archived spec's consumer-walk row (`design.md` §7):
> "`/akili-execute` Step 2.2 brief — 'the verification command to run before reporting completion (copied)' | `changes/leader-brief-contract` | **hand-off:** the brief copies `Falsifier`, `Red run`, `Consumers` with the command, so the Implementer runs the consumer suites and reports the red (DD-6)"

Shipped text, `.claude/commands/akili-execute.md` line 169:
> "the task's `Falsifier`, `Red run`, and `Consumers` fields, copied beside the verification command (hand-off from `changes/gate-falsifiability`): instruct the Implementer to run every suite `Consumers` names and to report the assertion the red failed on. When the task carries none of these fields, the brief says so instead of copying nothing silently: `no Falsifier / Red run / Consumers fields in this task`"

**Verdict: MATCH.** Rule content is identical — fields copied beside the command, Implementer runs the consumer suites, reports the red. Wording differs only by the absent-value clause (`no Falsifier / Red run / Consumers fields in this task`) that this spec adds — exactly the allowed divergence.

### Match 2 — `reviewer.md` audit item

Archived spec's consumer-walk row (`design.md` §7):
> "`reviewer.md` audit checklist | `changes/leader-brief-contract` | **hand-off (already in that proposal):** verify the recorded red run failed on the assertion; trace the mutation through the fixture"

Shipped text, `.claude/templates/reviewer.md` line 24 (Audit Checklist item 2, *Red Run & Mutation Trace*):
> "**Red Run & Mutation Trace:** Verify the recorded red run failed on the behavioral assertion (not on setup, an intercept, a timeout, or a mock that never reaches the timing under test), and trace the named mutation through the fixture — a test named after a mutation is not evidence it exercises it. When the task carries no `Red run` field or it reads `n/a (no test gate)`, skip this item and say so in the summary."

**Verdict: MATCH.** Rule content is identical — verify the red failed on the behavioral assertion, trace the mutation through the fixture. Wording differs only by the absent-value skip clause this spec adds.

**Part (b) overall: both hand-off lines match; two divergences, both the sanctioned absent-value clauses.**

---

## Part (c) — Fixture walkthrough

Fixture built at `/private/tmp/claude-501/.../scratchpad/t6-fixture/` (throwaway `git init` repo, one branch `master`, base commit only): `tasks.md` with T-1..T-9 (T-1..T-8 `[x]`, T-9 started `[~]`), T-4 carrying `Falsifier`/`Red run`/`Disqualifier`/`Consumers` fields and T-9 carrying none; `execution.md` with a Document Control block shaped like the archived `changes--kaizen-loop-closure` log (Spec Path, Depth, Approval Mode, Started, per-role models, Budget, Commit prefix, Wave plan, Brief discipline), eight PASS entries (T-1..T-8) each listing files changed per attempt, and a T-9 entry with three FAIL attempts listing its own files (`src/base.txt` modified, `src/module9-scratch.txt` created/modified); all nine tasks' files left uncommitted (no per-task commits); two stray files no entry names (`stray-notes.txt`, `src/stray-leftover.txt`); a `src/CLAUDE.md` + `docs/module-cap.md` governing T-9's target folder (for the widened-brief case); a separate old-style `execution.md` at `t6-fixture-old/execution.md` with zero `REVIEW_WAIVED` occurrences anywhere in the file.

Deleted after recording, per Done criteria.

### Case 1 — HALT on a dirty tree (FR-6)

**Deciding sentences**, `.claude/commands/akili-execute.md` Step 4 item 1 table:
> "**Holds other PASSed work** — uncommitted changes attributable to earlier PASSed task entries | Restore scoped to the halted task's pathspec: the explicit file paths from its attempt entries' *files changed* lines — `git restore -- <paths>` for tracked files, `git clean -f -- <paths>` for the listed untracked files, **never a directory glob**"
> "**Holds unattributed changes** — paths no task entry accounts for (another session, the user) | Run the pathspec restore above; the unattributed paths are **never restored** — escalate to the user"

The fixture tree satisfies both row conditions at once (T-1..T-8's files are "other PASSed work"; the two stray files are "unattributed"). The rows are not worded as mutually exclusive, but they do not disagree: the third row's action clause textually reuses the second row's mechanism ("the pathspec restore above"), so applying both in combination — restore T-9's own pathspec, leave the stray files untouched and escalate — is a coherent single reading, not two conflicting sentences. Recorded as **PASS**, with this compositional nuance stated rather than silently resolved.

**Ran literally, from `git status --porcelain` before, T-9's pathspec taken from its attempt-3 `execution.md` line (`src/base.txt` tracked, `src/module9-scratch.txt` untracked), to `git status --porcelain` after:**

Before:
```
 M execution.md
 M src/base.txt
 M tasks.md
?? docs/
?? src/module1.txt ... src/module8.txt
?? src/module9-scratch.txt
?? src/stray-leftover.txt
?? stray-notes.txt
```

Commands run (explicit paths, never a glob):
```
git restore -- src/base.txt
git clean -f -- src/module9-scratch.txt
```

After:
```
 M execution.md
 M tasks.md
?? docs/
?? src/module1.txt ... src/module8.txt
?? src/stray-leftover.txt
?? stray-notes.txt
```

`src/base.txt` restored, `src/module9-scratch.txt` removed; T-1..T-8's files and T-4's `docs/module4-notes.txt` untouched; the two stray files untouched and remain listed as unattributed — matches FR-6's "Unattributed changes present" scenario exactly, and never used a directory glob.

### Case 2 — Spawn failure mid-task (FR-4)

**Deciding sentence**, `.claude/commands/akili-execute.md` line 68 (Implementer ladder row):
> "**1** retry once immediately (spawn failure, pane timeout) ... · **2** retry-after-N (N = 3 minutes, one retry, background wait, announced ...) · **3** resume-by-message ... · **4** a fresh worker ... · **5** the existing Leader-inline ask — a user stop"

Plus line 64 (climbed in order) and the Log Format line 309 ("a `runtime events: <kind> ×n → <rung>` line naming any runtime events recovered on that attempt and the rung that recovered them") and line 64's accounting rule ("No runtime event touches the attempt counter").

For "spawn failed twice, then a pane timeout": rung 1 (retry once) absorbs the first spawn failure; it fails again (second spawn failure), climbing to rung 2 (retry-after-N, 3 min, background, announced); the pane timeout occurs within that same climb and rung 2's retry is what ultimately recovers it. Recorded line: `runtime events: spawn failure ×2, pane timeout ×1 → retry-after-N`. Attempt counter unchanged (accounting rule). No inline ask: rung 5 is never reached because recovery happened at rung 2. **PASS** — no two shipped sentences disagree here.

### Case 3 — Provider-limit death, context alive (FR-4)

**Deciding sentence**, same row:
> "for a provider-limit death, first **probe the tree** for partial edits and record them ... **3** resume-by-message when the worker's context survives (message the worker; the contracted report is the terminating act; verify delivery per `leader.md`)"

Tree probe happens at rung 1 (per the provider-limit-death clause embedded in rung 1); context survives, so rung 3 is reached (skipping rung 4, which is reserved for the no-context branch: "**4** a fresh worker audits the partial diff and continues"). The contracted report is explicitly named as the terminating act, and no fresh spawn occurs since rung 4 is never reached. **PASS**.

### Case 4 — Reviewer waiver (FR-5, FR-8, FR-3)

**Deciding sentences**, walked across: `.claude/commands/akili-execute.md` line 69 (Reviewer ladder: "**Never inline** ... **4** waiver — **is** a `REVIEW_WAIVED` record ... — a user stop; **never inline without the record**"); line 277 (Step 5, `pre-approved`: "A `REVIEW_WAIVED` decision and the Leader-inline ask ... are stops for the user too, never auto-passed"); lines 318–328 (Log Format: the `## REVIEW_WAIVED: <Task ID>` block with 5 fields — `flag`, cause, approved by, verification that stood in, models; "The task entry's Reviewer field reads `WAIVED (inline)`..."; "written by the Leader, before `[x]`"); Step 3 line 226 ("Only after a Reviewer `PASS` — or ... after the `REVIEW_WAIVED` record is written —") and the evidence-before-checkbox table; `akili-resume.md` Step 1 ("A `## REVIEW_WAIVED: <Task ID>` block is a closed task's last action — report it there with its flag ..., never as a *Blocked* item"); `kaizen/SKILL.md` Measure row ("Tasks closed under `REVIEW_WAIVED` (by flag) | ... `inline` / `same-model` = no exercised gate") and the clean-run sentence ("no `REVIEW_WAIVED` waiver flagged `inline` or `same-model`"); `reviewer.md` line 56 ("the **first line** is `STATUS:` — nothing before it").

Ran on the fixture: appended a `## REVIEW_WAIVED: T-9` block (flag `inline`, since rungs 1–3 all exhausted with no independent context ever obtained — matching "no independent context (the Leader audited work it supervised)") to `execution.md`, then flipped T-9's tasks.md status to `[x]` — write order followed literally. Resulting entry-field reading is `WAIVED (inline)` per the flag table. Under `execution.md`'s Measure signal this run counts 1 `REVIEW_WAIVED` (`inline`) and is **not** a clean run per the clean-run sentence. `/akili-resume` Step 1 would report "T-9 closed — REVIEW_WAIVED (inline)" as Last Action, never Blocked. All three FAIL reports in the fixture's T-9 entry open `STATUS: FAIL` per the report-contract line. **PASS** — every clause decided by a single unambiguous shipped sentence, no disagreement found.

### Case 5 — Widened brief (FR-1)

**Deciding sentences**, `.claude/commands/akili-execute.md` Brief contract clauses:
> (a) "**Falsifier:** a brief line offering to record an unmeasurable value 'as not measurable' for a task that requires the measurement." (line 175)
> (b) "**Falsifier:** zero convention files named for a target whose folder holds a `CLAUDE.md`." (line 176)
> (e) "the brief says so instead of copying nothing silently: `no Falsifier / Red run / Consumers fields in this task`" (line 169/179)

Walked a hypothetical draft brief for T-9 offering "record it as not measurable" and naming zero convention files, against the fixture's `src/CLAUDE.md` (T-9's target folder). Clause (a)'s falsifier flags the fallback line directly; clause (b)'s falsifier flags the zero-convention-files line directly, since `src/CLAUDE.md` exists in the target's folder. T-4's brief (which does carry the four verification fields) copies `Falsifier`/`Red run`/`Consumers` beside the command per line 169; T-9's brief (no such fields in `tasks.md`) states "no Falsifier / Red run / Consumers fields in this task" per the same line's absent-value clause. **PASS** — both clauses flag the draft brief by name, no disagreement.

### Case 6 — 400-line diff (FR-3)

**Deciding sentence**, `.claude/commands/akili-execute.md` line 189:
> "a diff of ≤ 300 lines stays inline ... Above 300 lines, the Leader writes the diff it extracted to a file in the session scratchpad, outside the working tree, and the brief names the path with the instruction to `Read` it ... A **non-host** Reviewer keeps the inline diff at any size — the same standing exception Step 2.2 already names for non-host workers"

Created a synthetic 344-line diff file at `t6-diff-demo/T-9-attempt2.diff` in the session scratchpad (outside the fixture's working tree) to demonstrate the mechanism the sentence describes. For a host Reviewer with `Read`: file + path, per this sentence. For a non-host Reviewer: inline at any size, per the same sentence's exception clause. **PASS** — one sentence decides both branches, no disagreement.

### Case 7 — Old log (NFR-3)

**Deciding sentences**: `.claude/commands/akili-execute.md` line 328 (Log Format): "An `execution.md` written before this record existed carries no `## REVIEW_WAIVED` blocks — its absence reads as 'no waiver recorded', never as an inferred PASS." `.claude/skills/kaizen/SKILL.md` clean-run sentence: "If every signal is clean (zero rework, no pivots, no product bugs, no severe findings, and no `REVIEW_WAIVED` waiver flagged `inline` or `same-model`), write a one-line clean run entry..." `.claude/commands/akili-resume.md` Step 1's `REVIEW_WAIVED` clause (silent when no such block exists — it simply does not fire).

Read the old-style fixture (`t6-fixture-old/execution.md`, 0 occurrences of `REVIEW_WAIVED` confirmed by grep) as each of these three readers: `/akili-resume` reports Last Action from the most recent entry normally, with no waiver-related clause triggered; the kaizen Measure row for waived tasks reads 0/none since no block exists; the absence reads as "no waiver recorded," not an inferred PASS. **PASS** — no error, no inference beyond what the sentence explicitly licenses.

### Walkthrough summary

| Case | Outcome |
|---|---|
| 1. HALT on a dirty tree | PASS (compositional reading of rows 2+3 stated explicitly) |
| 2. Spawn failure mid-task | PASS |
| 3. Provider-limit death, context alive | PASS |
| 4. Reviewer waiver | PASS |
| 5. Widened brief | PASS |
| 6. 400-line diff | PASS |
| 7. Old log | PASS |

**Zero INCONCLUSIVE steps.**

---

## Part (d) — Packaging

```
npm run verify:cli && npm run pack:dry-run && git diff --check
```

Combined exit code: `0`. `verify:cli` listed 11 commands / 24 skills / 7 resources; `pack:dry-run` produced a 275-file, 2.1 MB tarball with no unexpected or renamed packaged file (all names match existing conventions — `.claude/commands/*.md`, `.claude/templates/*.md`, `docs/commands/*.md`, etc.); `git diff --check` produced no output (no whitespace errors).

`git status --short` in the repo (`/Users/jcadavid/Development/sdd-jc-methodology`): **empty — clean.** No repo file was written or modified by this task.

---

## Not Done / Assumptions

- None. All four verification items ran as specified; zero unsanctioned grep hits; both hand-off lines matched; all seven walkthrough cases resolved PASS with zero INCONCLUSIVE; packaging exited 0 with a clean repo tree.
- Assumption: for Case 1, where the fixture tree matched both "holds other PASSed work" and "holds unattributed changes" simultaneously (deliberately, per the Scope's fixture rules), the record treats this as a single coherent composition rather than a genuine disagreement between two shipped sentences, because the "unattributed" row's action clause explicitly reuses the "other PASSed work" row's restore mechanism. This is stated explicitly above rather than silently resolved, per the walkthrough's own discipline.
- Fixture (`t6-fixture/`, `t6-fixture-old/`, `t6-diff-demo/`) deleted from the scratchpad after this record was written, per Done criteria.

---

# Reviewer verdict on the record above — attempt 1 (2026-09-18, `opus`, HEAD `1dc7894`)

Persisted verbatim by the Leader from the Reviewer's scratchpad verdict file. **FAIL — 1 issue: Case 2 REJECTED AS INCONCLUSIVE.** Parts (a), (b), (d) reproduce; six of seven cases CONFIRMED.

---

## 1. Independent re-run of part (a) — §8 rows 1–2, 4, 6, 9–11

Run from repo root at `1dc7894`, exclusions per the tasks.md hazard note.

| §8 row | Result | Matches record? |
|---|---|---|
| 1 — surviving blanket rollback / inline-diff | 1 hit: `akili-execute.md:258` (Step 4 clean-tree row) | yes — sanctioned (FR-6 clean-tree scenario, byte-identical by design) |
| 2 — `matching PASS` | 2 hits: `akili-execute.md:240` (Step 8F hook sentence, DD-7), `:281` (`/goal`, already reads "PASS or `REVIEW_WAIVED`"); `docs/flow.md` 0 | yes |
| 4 — `consumed by a Reviewer` | 2 hits: `akili-execute.md:64`, `:214`; `leader.md` 0 | yes |
| 6 — `poke` in the command | `0` | yes |
| 9 — framework/product names | no hits (rc 1) | yes |
| 10 — foreign-spec files | `git diff --stat` empty both against the tree and `66d4a0d..HEAD` | yes |
| 11 — invariant `-` lines | 5 matches | yes |

Row 11: each `-`/`+` pair re-read. `author ≠ auditor`, `3 rework attempts` (×2 surfaces), `FATAL_FAIL` (×2) all survive byte-identical; the only altered phrase is "HALT + Automatic Rollback after 3" → "HALT + rollback by tree state after 3", which FR-6 changes on purpose and NFR-8 does not protect. Clean.

Note (not an issue): the only surviving pre-change clean-run predicate is
`.claude/worktrees/authorship/.claude/skills/kaizen/SKILL.md:60`, inside the directory the hazard note excludes.

## 2. Part (b) — hand-off byte check, re-verified at the source

`docs/specs/archive/2026-09-18-changes--gate-falsifiability/design.md` lines 101 and 102 carry exactly the two consumer-walk rows the record quotes. Compared against `.claude/commands/akili-execute.md:169` and `.claude/templates/reviewer.md:24`. Both **MATCH**: rule content identical, divergence limited to the absent-value clauses this spec adds (`no Falsifier / Red run / Consumers fields in this task`; the `n/a (no test gate)` skip-and-say). DD-6 at line 137 of the archived design confirms the division of ownership the record assumes.

## 3. Part (d) — packaging

`npm run verify:cli && npm run pack:dry-run && git diff --check` → combined rc **0**. `git status --short` shows only the untracked `docs/specs/changes/leader-brief-contract/t6-walkthrough.md`, which the Leader persisted after the record was written. No repo file changed by T6.

---

## 4. Per-case rulings

### Case 1 — HALT on a dirty tree (FR-6) — **CONFIRMED**

Q2 answered. The three-row table at `akili-execute.md:256–260` is not worded as an exclusive choice, and it does not have to be, because a **third shipped sentence** settles the record contents unconditionally — Step 4 item 3, `akili-execute.md:269`:

> "the tree-state branch taken, the pathspec used (if any), and any paths listed \"unattributed — not restored\""

Under either reading — "pick the *holds other PASSed work* row" (the task's Expected column) or "compose rows 2 and 3" (the record) — the actions are identical: the pathspec restore from T-9's attempt entries runs with explicit paths, the two stray files are never touched, `git status --porcelain` is reported. The HALT block contents are also identical, because item 3 requires branch + pathspec + unattributed list in every case. The only difference between the two readings is which label goes in the "branch taken" field. A label difference that changes no action and no required field is not two sentences disagreeing. Ruled CONFIRMED.

The record's fixture run is reproducible from the before/after `git status --porcelain` it prints, and it used explicit paths (`git restore -- src/base.txt`, `git clean -f -- src/module9-scratch.txt`), never a directory glob.

Weakness, not a defect: the record quotes rows 2 and 3 truncated before their "`## HALT` records" column, and never cites item 3. The composing sentence was available and unquoted.

### Case 2 — spawn failure ×2 then a pane timeout (FR-4) — **REJECTED AS INCONCLUSIVE**

Q1 answered. This is the spec's one failing step. See §5.

### Case 3 — provider-limit death, context alive (FR-4) — **CONFIRMED**

Q1's second half answered. **No shipped sentence says a death skips rung 2.** The design's "Enters ladder at" column (`design.md` §5.4: "rung 1 (probe) → 3 if context survives, else 4") did not ship anywhere — see §5. The shipped text gives only "climbed in order" (`:66`) and "rung by rung, never improvising" (`:64`), so a literal Leader climbs 1 → 2 → 3, inserting a 3-minute wait the FR-4 scenario does not mention.

That does not make the *recorded outcome* undecidable. The record does not claim a skip; it records rung 3 as the recovering rung and "no fresh spawn". Both hold under the climb-in-order reading, because rung 3's condition ("when the worker's context survives") is met and a recovered rung ends the climb (`:309`, "the rung that recovered them"). Ruled CONFIRMED.

Mis-attribution to note: the record writes that rung 4 is "reserved for the no-context branch". Shipped rung 4 reads "**4** a fresh worker audits the partial diff and continues (the brief carries the partial diff as the starting state)" — no context condition. That condition comes from `design.md` §5.4, not from the command. It is the Disqualifier's named failure mode (design paraphrased as shipped text), but it is not outcome-bearing here, since rung 3 recovering already ends the climb.

### Case 4 — Reviewer waiver (FR-5, FR-8, FR-3) — **CONFIRMED**

Q4 answered, three parts:

1. **Stop under `pre-approved` by a shipped sentence?** Yes, `akili-execute.md:277`, Step 5: "A `REVIEW_WAIVED` decision and the Leader-inline ask (Implementer ladder rung 5) are stops for the user too, never auto-passed". General, no parenthetical carrying the decision.
2. **Write order decided by shipped text?** Yes, twice. Log Format `:318`: "**`## REVIEW_WAIVED: <Task ID>`** — written by the Leader, **before `[x]`**". Step 3 `:226`: "Only after a Reviewer `PASS` — or, when the Reviewer ladder was exhausted, after the `REVIEW_WAIVED` record is written —:" followed by the ordered 1. append / 2. flip and the evidence-before-checkbox table.
3. **Any surviving sentence letting a waived run file as clean?** No. `kaizen/SKILL.md:74` carries the waiver term inside the predicate; `:70` carries the Measure row; `:159` carries the Metrics example row; `akili-archive.md:151` carries the signal phrase; `docs/skills/kaizen.md:24` mirrors it. The only pre-change predicate left in the repo is in the excluded `.claude/worktrees/authorship/` copy.

`reviewer.md:56` carries the first-line `STATUS:` contract as a general sentence. All clauses decided.

### Case 5 — widened brief (FR-1) — **CONFIRMED**

Clause (a)'s falsifier at `:175` and clause (b)'s at `:176` are general sentences naming a defect class; stripping their parentheticals removes nothing load-bearing. Clause (b) fires on the fixture because `src/CLAUDE.md` sits in T-9's target folder — exactly the falsifier's stated condition. The absent-value line at `:169` decides T-9's brief and the copy rule decides T-4's. No competing sentence.

### Case 6 — 400-line diff (FR-3) — **CONFIRMED**

`:189` decides both branches in one sentence: "≤ 300 lines stays inline … Above 300 lines, the Leader writes the diff it extracted to a file in the session scratchpad, outside the working tree … A **non-host** Reviewer keeps the inline diff at any size". Generic, no example does the deciding. The record's demonstration file was 344 lines rather than 400; both are above the single threshold the sentence names, so the branch exercised is the same one.

### Case 7 — old log (NFR-3) — **CONFIRMED**

Q5 answered. The Leader's suspicion is correct that the explicit no-inference sentence (`akili-execute.md:328`, "its absence reads as 'no waiver recorded', never as an inferred PASS") lives in a file neither consumer loads. It is not needed, because each consumer's own shipped clause is **conditional on a block existing**, and a conditional that does not fire produces neither an error nor an inference:

- `akili-resume.md:48` — "A `## REVIEW_WAIVED: <Task ID>` block is a closed task's last action — report it there with its flag … never as a *Blocked* item." Antecedent absent ⇒ the clause is silent.
- `kaizen/SKILL.md:70` — the Measure row's source is "`execution.md` `## REVIEW_WAIVED` blocks"; zero blocks counts 0, and the Metrics example at `:159` prints that very row as `0`.

FR-8 bounds each consumer to one clause and NFR-1 forbids further hunks there, so nothing more was owed. Ruled CONFIRMED. Advisory only: the no-inference statement is unreachable from the consumer files, so the property holds by the shape of each clause rather than by a stated rule.

---

## 5. Issue 1 — Case 2 is INCONCLUSIVE; the ladder has no entry-point rule

**Discovered issue.** The record lands on the task's *Expected recorded outcome* (`runtime events: spawn failure ×2, pane timeout ×1 → retry-after-N`), but no shipped general sentence decides which rung a **new event kind** enters at once the climb is under way. Two readings of the shipped text produce different recorded lines.

**Reading A (the record's).** The climb is per attempt and spans every event in it, so the pane timeout is absorbed mid-climb and the recovering rung is rung 2:

> `:64` "Each role climbs its own fixed ladder, rung by rung, never improvising"
> `:66` "Ladder (climbed in order; each rung recorded per attempt)"
> `:309` "a `runtime events: <kind> ×n → <rung>` line naming any runtime events recovered on that attempt and the rung that recovered them"

**Reading B.** Rung 1 is the handler for that event kind, so the pane timeout is retried once immediately and its recovering rung is rung 1:

> `:68` "**1** retry once immediately (spawn failure, pane timeout)"

Reading B also has requirements backing. FR-4's *Seven pane timeouts* scenario starts a pane timeout at rung 1 ("THEN it retries once, then waits N = 3 minutes…"), and `design.md` §5.4's "Enters ladder at" column assigns the pane timeout "rungs 1–2".

**Why the record's reading does not survive the method.** Strip the parenthetical from rung 1 and it reads "retry once immediately" — nothing then attaches any event kind to any rung, and the shipped text is silent on entry points. Restore the parenthetical and the only shipped text that touches the question points at rung 1, against the recorded `→ retry-after-N`. The deciding step therefore came from the *Expected recorded outcome* column, not from the command.

The recorded sequence is also internally strained. Rung 2 is "retry-after-N (N = 3 minutes, **one retry**, background wait, announced)". Walked literally — failure #1, rung-1 retry, failure #2, rung-2 wait and its one retry, then the pane timeout — that single retry is already spent when the timeout arrives, so "rung 2's retry is what ultimately recovers it" requires an event order the case does not state.

**Root cause — content that did not ship.** FR-4's terminal-branches paragraph and `design.md` §5.4's "Enters ladder at" column exist nowhere in the repository. Verified by fixed-string search at `1dc7894` over `.claude/`, `docs/commands/`, `docs/flow.md`, `README.md` for `starts at rung`, `usually clears`, `rung 3 if it does`, `Enters ladder at`, `Terminal branches`: zero hits (the only `terminal branch` hits are unrelated hook prose in `akili-constitution.md`). The command's event vocabulary shipped as a prose paragraph naming the four kinds with no entry points.

**Classification: task defect, not a spec gap.** The requirement stated it (FR-4, terminal-branches paragraph), the design stated it (§5.4, the table's fifth column, which design §7 row 1 routes into the command as "Event vocabulary (§5.4)"), and the shipped text under-delivers it. Rework, not the Pivot Protocol.

**Where a fix lands.**

- `.claude/commands/akili-execute.md`, Step 2 preamble *Runtime-failure fallback* (around `:63–70`) — one sentence giving each event kind its entry rung and stating whether a later event of a different kind re-enters at its own rung or continues the current climb. That one sentence decides Case 2 and removes Case 3's reliance on unshipped design text.
- `docs/commands/akili-execute.md` — summary-level mirror, if the added sentence turns a mirror sentence false (design §7 row 22).
- T6's record is then re-walked for Cases 2 and 3 only.

Owning task by section: T2 (runtime table). T6 is the gate that surfaced it.

---

## 6. Advisory

- **RELIABILITY.** The record's Case 3 attributes a context condition to rung 4 that the shipped rung 4 does not carry. Not outcome-bearing here, but it is the Disqualifier's exact pattern and would have hidden a real gap in a case that turned on it.
- **READABILITY.** Case 1 quotes the Step 4 rows truncated before their `## HALT` records column and never cites item 3 at `:269`, which is the sentence that actually resolves the composition question the record raised as its one stated assumption.
- **READABILITY.** The Case 6 demonstration file is 344 lines for a case the task names "400-line". Same branch, but the record reads as though it walked the stated input.
