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

---

# Attempt 2 — after the T6 Pivot and T2's owed clause (2026-09-19, HEAD `528c8ad`)

Persisted by the Leader from the attempt-2 Implementer's scratchpad record. Scope: Cases 2 and 3 re-walked on the shipped *Entry rungs* paragraph; §8 rows 6 and 11; packaging; isolation check for Cases 1, 4–7. The worker wrote no repo file.


No repo file written by this task. All authority quoted below is `.claude/commands/akili-execute.md` at HEAD (`528c8ad`), confirmed byte-verbatim by fixed-string `grep` before being written down. `requirements.md` FR-4 text is named-conformance context only (per the brief), never the deciding authority.

## Case 2 — Spawn failure mid-task (amended)

**Input** (task's amended row): the spawn failed, the rung-1 retry failed again, the rung-2 retry hit a pane timeout.

### Step-by-step walk

**Event 1 — spawn failure, entry.**
Deciding sentence, *Entry rungs* paragraph:
> "a spawn failure leaves no partial work and starts at rung 1"
Rung: **1**. Action, ladder table Implementer row:
> "**1** retry once immediately (spawn failure, pane timeout) …"
Leader retries once immediately. Announced: no (rung 1 is immediate, not the announced background wait — that is rung 2's clause).

**Event 2 — the rung-1 retry fails again (a second spawn failure).**
Deciding sentence, *Entry rungs* mid-climb clause:
> "A later event in the same attempt, of any kind, **continues the climb** from whichever is higher — the rung already reached, or the new event's own entry rung … the climb never moves backwards … A spent rung is never re-run"
Rung already reached = 1 (spent). New event's own entry rung (spawn failure) = 1. Higher of (1, 1) = 1, already spent → climb continues to the next rung: **2**. Action, ladder table:
> "**2** retry-after-N (N = 3 minutes, one retry, background wait, announced — the background-wait rule in `leader.md` → *Winding down*)"
Leader waits 3 minutes in the background, announced, then retries once.

**Event 3 — that rung-2 retry hits a pane timeout.**
Deciding sentence, *Entry rungs* mid-climb clause (same sentence as above): rung already reached = 2 (just spent). New event's own entry rung (pane timeout) per:
> "a pane / terminal timeout starts at rung 1 and is usually cleared by rung 2"
= 1. Higher of (2, 1) = **2** — already spent, never re-run. Climb continues to **3**. Ladder table rung 3:
> "**3** resume-by-message when the worker's context survives (message the worker; the contracted report is the terminating act; verify delivery per `leader.md`)"
Condition ("when the worker's context survives") does not hold — no worker was ever running (every event so far has been a spawn failure or a timeout on a retry attempt, never a live worker). Deciding sentence for the skip:
> "a rung whose condition does not hold (rung 3, when no worker context exists to message) is skipped"
Rung 3 **skipped**. Climb continues to **4**:
> "**4** a fresh worker audits the partial diff and continues (the brief carries the partial diff as the starting state)"
Rung 4 recovers the attempt: a fresh worker is spawned, briefed with the partial diff as starting state.

### Recorded line and accounting
Deciding sentence, Log Format:
> "a `runtime events: <kind> ×n → <rung>` line naming any runtime events recovered on that attempt and the rung that recovered them"
Recorded: `runtime events: spawn failure ×2, pane timeout ×1 → fresh worker`.
Attempt counter: deciding sentence —
> "an attempt is consumed by a Reviewer `FAIL` or an Implementer-reported verification failure, and by nothing else. No runtime event touches the attempt counter."
→ unchanged. No re-run of rung 1 or 2: "A spent rung is never re-run" (quoted above). No inline ask: rung 5 ("the existing Leader-inline ask") is never reached because rung 4 recovers the attempt.

### Parenthetical-stripping check
- Entry-rungs clauses for spawn failure and pane timeout carry no parentheticals — nothing to strip, both still decide their entry rungs as written.
- Ladder rung 1 cell: `(spawn failure, pane timeout)` is a true parenthetical. Stripped: "retry once immediately — for a provider-limit death, first probe the tree for partial edits and record them." The general sentence still decides rung 1 = retry-once for this event, by elimination (the only named exception is provider-limit death, which this isn't).
- Mid-climb sentence's rung-3-skip clause carries the parenthetical `(rung 3, when no worker context exists to message)`. Stripped: "a rung whose condition does not hold … is skipped." Still decides the skip, because rung 3's *condition* is independently stated in the ladder table itself ("when the worker's context survives") — the parenthetical is a restatement/example, not the sole carrier of the rule.
- Accounting rule and "spent rung never re-run" carry no parentheticals.

**No other shipped sentence supports a different outcome.** The only candidate tension is the paragraph's opening clause "the ladder is climbed in order as the table above states" versus the mid-climb clause allowing rung skips — these do not conflict: "climbed in order" means rungs are never revisited or taken out of sequence, and the mid-climb clause is the stated mechanism for *which* rung is next, including a stated skip condition. No sentence anywhere says a second event of a different kind re-enters at its own lower rung, or that rung 3 must be attempted even with no worker context.

**Verdict: PASS.** Final recorded line: `runtime events: spawn failure ×2, pane timeout ×1 → fresh worker`. This matches the task's amended Expected recorded outcome exactly (derived independently, not read off that column — the column was consulted only after the derivation above was complete).

---

## Case 3 — Provider-limit death, context alive

**Input**: an Implementer is killed by a provider limit mid-task; its context survives (addressable/resumable).

### Step-by-step walk

**Event — provider-limit death, entry.**
Deciding sentence, *Entry rungs* paragraph:
> "a provider-limit death starts at rung 1's tree probe, then continues to rung 3 when the worker's context survives the death, or to rung 4 when it does not"
Rung 1 action, ladder table:
> "**1** … for a provider-limit death, first **probe the tree** for partial edits and record them"
Leader probes the tree, records partial edits. Context survives (given) → the entry-rungs sentence names the next step directly: **rung 3**.

**Rung 3.** Ladder table:
> "**3** resume-by-message when the worker's context survives (message the worker; the contracted report is the terminating act; verify delivery per `leader.md`)"
Condition ("worker's context survives") holds. Leader messages the worker; the contracted report is the terminating act; delivery is verified per `leader.md`. This recovers the attempt — Log Format: "the rung that recovered them" (singular) — so the climb ends here.

**Rung 2 and rung 4 — not reached.**
- *Which shipped sentence says the death does not pass through rung 2?* The entry-rungs sentence itself: "…starts at rung 1's tree probe, **then continues to rung 3**…" names rung 3, not rung 2, as the direct continuation from the tree probe. No rung-2 step is named in this event kind's routing.
- *Which shipped sentence says no fresh worker is spawned?* Two shipped facts combine: (a) the entry-rungs sentence routes this death to rung 3, which recovers the attempt (ends the climb, per the Log Format's "the rung that recovered them"); (b) rung 4 is the only rung the ladder table labels "a fresh worker audits the partial diff and continues" — the sole occurrence of "fresh worker" in the ladder row. Since the climb ends at rung 3, rung 4 is never reached, so no fresh worker is spawned. (The mid-climb clause's phrase "never detouring through a lower rung's fresh spawn" also exists in this same paragraph and would reinforce this for a *later* event arriving mid-climb, but Case 3 as stated is a single first event, not a composed mid-climb sequence, so I rest the "no fresh spawn" conclusion on (a)+(b) above rather than stretch that clause's stated scope.)

### Parenthetical-stripping check
- Entry-rungs clause for provider-limit death carries no parenthetical — nothing to strip, still decides the rung-1-then-rung-3 route.
- Ladder rung 1 cell: `(spawn failure, pane timeout)` is a parenthetical attached to a different clause (rung 1's default action); the provider-limit-death clause follows it via em-dash, outside the parens, and survives stripping unchanged.
- Ladder rung 3 cell: `(message the worker; the contracted report is the terminating act; verify delivery per \`leader.md\`)` is a parenthetical. Stripped, the sentence reads "resume-by-message when the worker's context survives" — this still decides the **rung** (3) and the **route**, but the specific operational detail "the contracted report is the terminating act" lives only inside the parenthetical and does not survive stripping. I flag this rather than silently treating the parenthetical as ordinary shipped prose: the *rung* is general-sentence-decided; the *terminating-act mechanic* is parenthetical-only.
- Ladder rung 4 cell: `(the brief carries the partial diff as the starting state)` is a parenthetical; stripped, "a fresh worker audits the partial diff and continues" still stands and still labels rung 4 as the fresh-spawn rung.

**Does any other shipped sentence support a different outcome?** The paragraph's opening clause — "each event kind starts the climb at a fixed rung, and from there the ladder is climbed in order as the table above states" — could be read as requiring every event to pass through every rung in sequence (1, 2, 3, 4…), which would force this death through rung 2 before rung 3. I record this as the competing reading rather than silently discard it. But no sentence anywhere states that reading explicitly for this event kind, while the entry-rungs sentence explicitly and specifically routes a provider-limit death straight from "rung 1's tree probe" to "rung 3" — the more specific clause, addressed to this exact event kind, immediately following the general one in the same paragraph. Reading "climbed in order" as "never regresses, and each kind's own stated path is its order" (rather than "visits every numbered rung") is the only reading that leaves the entry-rungs sentence's explicit "then continues to rung 3" from doing any work at all — a reading that makes an approved sentence surplusage is disfavored. Under the specific clause, rung 2 is not visited.

**Verdict: PASS** (CONFIRMED, converging independently with the T2 owed-clause Reviewer's sequence (a): "death with context first → probe, rung 3"). Recorded outcome: tree probe (rung 1) → rung 3 resume-by-message → the contracted report is the terminating act (rung 3's parenthetical) → no fresh spawn (rung 4 never reached). Matches the task's Expected recorded outcome.

---

## §8 row 6 — idle-without-report / "poke" restated

```
$ grep -nc "poke" .claude/commands/akili-execute.md
0
```
0 occurrences total (a fortiori 0 outside a pointer phrase). PASS.

## §8 row 11 — invariant wording unchanged, re-run over `66d4a0d..HEAD`

```
$ git diff -U0 66d4a0d..HEAD -- .claude/commands/akili-execute.md .claude/templates/leader.md .claude/templates/reviewer.md docs/commands/akili-execute.md \
  | grep -nE '^-.*(3 rework attempts|FATAL_FAIL|Poke once, then replace|author ≠ auditor)'
```
Five `-` lines returned, identical in count and content to the five attempt 1 recorded (confirmed by direct comparison against `docs/specs/changes/leader-brief-contract/t6-walkthrough.md` rows 92–114):

1. `-| Reviewer | **Never inline** … breaks \`author ≠ auditor\` …` → `+` widens the row into five rungs (sanctioned, FR-4); `author ≠ auditor` byte-identical.
2. `-- **Maximum Retries:** A hard ceiling of **3 rework attempts** per task. This prevents infinite loops and token waste.` → `+` appends the Accounting-rule clause; "3 rework attempts" byte-identical.
3. `-**Approval Mode …` (the `FATAL_FAIL` sentence) → `+` appends the REVIEW_WAIVED/inline-ask carve-out; `FATAL_FAIL` byte-identical.
4. `-   * Run the loop exactly as … HALT + Automatic Rollback after 3.` → `+` changes only "Automatic Rollback" → "rollback by tree state" (FR-6's own intentional change, not one of the four protected phrases); `FATAL_FAIL` byte-identical.
5. `-- **Maximum retries.** Hard ceiling of 3 rework attempts per task. After 3 consecutive FAILs the loop HALTS …` → `+` appends the runtime-event carve-out; "3 rework attempts" byte-identical.

`git diff --stat 528c8ad~1..528c8ad` confirms the T2 owed-clause commit touched only `.claude/commands/akili-execute.md` with `2 ++` / `0 --` — a pure insertion, so it could not have produced a sixth pair. Confirmed, not assumed: **PASS, unchanged**.

## Packaging chain

```
$ npm run verify:cli && npm run pack:dry-run && git diff --check
```
`verify:cli` → lists 11 commands / 24 skills / 7 resources, exit 0. `pack:dry-run` → `npm pack --dry-run` succeeds, 275 files, `akili-specs-2.24.0.tgz`, exit 0. `git diff --check` → no output, exit 0 (no whitespace errors). Combined exit: **0**.

```
$ git status --short
```
No output — **working tree clean**.

## Step 4 — Entry-rungs isolation check for Cases 1, 4–7

Claim under test (attempt-2 scope block): the *Entry rungs* paragraph touches none of the deciding sentences of Cases 1 and 4–7. Deciding sentences pulled from `t6-walkthrough.md` (attempt-1 record §Part (c) + Reviewer rulings §4), each re-confirmed verbatim at HEAD by fixed-string `grep`:

| Case | Deciding sentence(s) | Verbatim at HEAD? |
|---|---|---|
| 1 — HALT dirty tree | Step 4 table rows 2–3 ("Holds other PASSed work…", "Holds unattributed changes…") + item 3 ("the tree-state branch taken, the pathspec used…") | Confirmed unchanged |
| 4 — Reviewer waiver | Reviewer ladder rung 4 row; Step 5 `pre-approved` REVIEW_WAIVED-stop sentence; Log Format `## REVIEW_WAIVED` header sentence; Step 3 "Only after a Reviewer `PASS` — or …" ; `reviewer.md` "first line is `STATUS:`" | Confirmed unchanged |
| 5 — Widened brief | Brief-contract clause (a) and (b) Falsifiers; the absent-fields line ("the brief says so instead of copying nothing silently…") | Confirmed unchanged |
| 6 — 400-line diff | The diff-delivered-by-size sentence (≤300 inline / >300 to scratchpad file / non-host exception) | Confirmed unchanged |
| 7 — Old log | "its absence reads as 'no waiver recorded', never as an inferred PASS"; `akili-resume.md`'s REVIEW_WAIVED-block clause; `kaizen/SKILL.md` Measure row + clean-run sentence | Confirmed unchanged |

None of these sentences live inside, quote, or reference the *Entry rungs* paragraph (they sit in Step 4, the Reviewer ladder row, Step 5, the Log Format, the Brief-contract block, the diff-delivery bullet, `reviewer.md`, `akili-resume.md`, and `kaizen/SKILL.md` — all sections other than the *Entry rungs* paragraph itself, which sits solely inside the Implementer-ladder discussion). Claim confirmed: no case among 1, 4–7 moved or changed as a result of the T2 owed-clause insertion. (The `leader.md` item-4 idle-without-report protocol and the command's pointer to it were also re-checked: `.claude/commands/akili-execute.md` line 62 still points to it by name — "handled entirely by `leader.md`'s idle-without-report protocol, cited by name, nothing restated here" — and restates nothing, matching row 6's 0-hit grep above.)

## Not Done / Assumptions
None. Case 2 and Case 3 were each derived from the shipped command text alone before being compared to the task's expected column; both land PASS. Rows 6 and 11, packaging, and the Case 1/4–7 isolation check all re-ran clean.

---

# Reviewer verdict on attempt 2 (2026-09-19, `opus`, HEAD `528c8ad`)

Persisted verbatim by the Leader from the Reviewer's scratchpad verdict file. **PASS — Cases 2 and 3 CONFIRMED; the carry for Cases 1, 4–7 holds; gates reproduce. 0 FAIL issues, 4 advisories.**


STATUS: PASS. Cases 2 and 3 CONFIRMED. Q4 carry holds. Q5 reproduces. 0 FAIL issues, 4 advisories.

All 15 sentences the record quotes were confirmed byte-verbatim at HEAD by fixed-string `grep` before any judging. No MISS.

---

## Q1 — Case 2, rung 4 with nothing to audit — **decided; one reading only**

Ruling: the shipped text decides that the climb lands on rung 4 and a fresh worker is spawned. "audits the partial diff" is a description of the fresh worker's brief, not a condition of the rung. Three independent grounds, each surviving parenthetical-stripping:

1. **Conditions in this block are marked with "when", and rung 4 carries none.** The Implementer ladder row contains exactly one occurrence of "when" (`grep -c` on the row = 1), and it is rung 3's: "**3** resume-by-message **when** the worker's context survives". The entry-rungs sentence uses the same marker twice: "continues to rung 3 **when** the worker's context survives the death, or to rung 4 **when** it does not". Rung 4's cell has no "when" and no other conditional. Neither marker sits in a parenthetical, so the convention survives stripping.
2. **The entry-rungs sentence enters rung 4 on a property of the event, not on a diff existing.** "…or to rung 4 when it does not" routes a context-less provider-limit death to rung 4 with no requirement that the rung-1 tree probe found anything. A death seconds after spawn probes an empty tree and still goes to rung 4. So rung 4 is not gated on a partial diff.
3. **The task's own INCONCLUSIVE test is not met.** tasks.md T6: "Any step where two shipped sentences can be read to disagree is recorded INCONCLUSIVE." Reading B (rung 4 skipped for want of a diff, landing on rung 5's user stop) rests on no second shipped sentence. It requires reading an unmarked condition into rung 4's cell. No shipped sentence states it.

Note the shipped text names the no-partial-work case exactly once — "a spawn failure leaves no partial work and starts at rung 1" — and uses that fact only to justify the entry rung, never to limit rung 4. Reading B would also leave a spawn failure with no rung in its own ladder that ever starts a worker.

Consistent with FR-4's mid-climb scenario `BUT` ("must NOT put the Leader-inline ask to the user before rung 4"), though that requirement was not used to decide the step.

**Advisory 1.** The record never ran this test. It asserts rung 4 is briefed "with the partial diff as starting state" when the fixture has none — a situational claim that is false on its own inputs. Not outcome-bearing (the rung and the recorded line are right), but it is the same species as the mis-attribution the attempt-1 verdict flagged, and it left the Leader's sharpest question unanswered in the record itself.

## Q2 — "announced", and the recorded line's shape

**Announcement: shipped, but parenthetical-only.** Rung 2's cell: "**2** retry-after-N (N = 3 minutes, one retry, background wait, announced — the background-wait rule in `leader.md` → *Winding down*)". Everything operative — the 3 minutes, the background wait, the announcement — sits inside the parenthesis. Stripped, rung 2 reads "retry-after-N": still decides the rung, decides no detail. Identical status to rung 3's terminating act, which the record *did* flag in Case 3.

**Advisory 2.** The record's Case 2 parenthetical-stripping check enumerates rung 1, the mid-climb skip clause, the accounting rule and the spent-rung clause, and omits rung 2's parenthetical — the one carrying a detail the walk asserts ("Leader waits 3 minutes in the background, announced"). Its own test applied unevenly across the two cases. Not outcome-bearing: neither the rung nor the recorded line moves.

**Line shape: admitted by a general sentence.** Entry rungs, final clause: "the attempt's `runtime events:` line names **every event that occurred** and **the single rung** that recovered the attempt." Several kinds, one rung — exactly `spawn failure ×2, pane timeout ×1 → fresh worker`. The Log Format's prose gloss agrees ("naming any runtime events recovered on that attempt and the rung that recovered them"). The template `<kind> ×n → <rung>` is a placeholder; naming rung 4 by its label ("fresh worker") rather than its number matches the form the user-approved Pivot wrote into T6's amended Expected column.

## Q3 — Case 3

**Past rung 2:** the entry-rungs sentence, general and unparenthesised — "a provider-limit death starts at rung 1's tree probe, **then continues to rung 3** when the worker's context survives the death". Rung 2 is named nowhere in this kind's routing. Reinforced by the mid-climb clause: "still goes to rung 3 even when the attempt is only at rung 1 or 2".

**Excluding a fresh spawn:** rung 3's condition holds and rung 3 recovers the attempt; the climb ends there, by the entry-rungs clause "the single rung that recovered the attempt" (and the Log Format's "the rung that recovered them"). Rung 4 is the only rung the ladder labels a fresh worker, and it is never reached.

**Attempt-1 mis-attribution not repeated.** Checked directly: the record attributes no context condition to rung 4. It identifies rung 4 only as "the only rung the ladder table labels 'a fresh worker audits the partial diff and continues'". Clean.

**The flagged parenthetical — advisory-grade, not a FAIL.** "the contracted report is the terminating act" does live only inside rung 3's parenthetical. Stripping it removes detail and raises no competing reading: the rung, the route and the no-fresh-spawn conclusion all stand on the general text. FR-4's own ladder states the same phrase parenthetically, so shipped is at parity with the approved requirement, not below it. The worker was right to flag rather than to launder it.

**"Climbed in order" vs "continues to rung 3" — not two sentences.** Both clauses are in one sentence, the general clause followed by its own per-kind enumeration after the em-dash. The enumeration *is* that sentence's definition of each kind's order. The shipped skip rule ("a rung whose condition does not hold … is skipped") independently proves "in order" tolerates omission rather than requiring every numbered rung. The record's anti-surplusage reasoning reaches the same place and is sound.

**Advisory 3.** The record's Case 3 conclusion is sound but longer than the text needs; the mid-climb clause "never detouring through a lower rung's fresh spawn" that it declines to lean on in fact concerns rungs *below* 3 (the rung-1/2 retries are themselves fresh spawns), not rung 4. Declining to stretch it was the right call for the wrong reason.

## Q4 — scope claim: **carries**

```
git diff --stat 1dc7894..HEAD -- .claude docs/commands docs/skills CHANGELOG.md README.md docs/flow.md
 .claude/commands/akili-execute.md | 2 ++
 1 file changed, 2 insertions(+)
```
Exactly one shipped change: the *Entry rungs* paragraph plus its blank line. Zero deletions.

Every deciding sentence the attempt-1 verdict relied on, re-confirmed verbatim at HEAD by fixed-string `grep`:

| Case | Deciding sentence | At HEAD |
|---|---|---|
| 1 | Step 4 item 3 "the tree-state branch taken, the pathspec used…" | verbatim |
| 4 | Step 5 "A `REVIEW_WAIVED` decision and the Leader-inline ask … never auto-passed"; Log Format `## REVIEW_WAIVED: <Task ID>` header; Step 3 "Only after a Reviewer `PASS` — or…"; `reviewer.md` `STATUS:` | verbatim |
| 5 | "(a) Narrow-never-widen"; "(b) Convention files, by lookup"; absent-fields line "no Falsifier / Red run / Consumers fields in this task" | verbatim |
| 6 | "Above 300 lines, the Leader writes the diff it extracted to a file in the session scratchpad, outside the working tree" | verbatim |
| 7 | "its absence reads as \"no waiver recorded\", never as an inferred PASS"; `akili-resume.md` waiver clause; `kaizen/SKILL.md` REVIEW_WAIVED | verbatim |

Only line *numbers* moved: the insertion at line 72 shifts everything below it by +2, so the attempt-1 verdict's `:169`, `:175`, `:176` are now 171, 177, 178. Sentences unchanged. Rulings for Cases 1, 4–7 and parts (a) rows 1–2, 4, 9–10 and (b) carry. Nothing must be re-walked.

**Also checked, beyond the brief: §8 row 12 (mirror contradiction).** The paragraph landed only in `.claude/commands/akili-execute.md`. `docs/commands/akili-execute.md` (105 lines) never enumerates rungs at all — it cites the ladder by name ("recovers per the Leader's per-role ladder") and carries no "Runtime-failure fallback", "Accounting rule", "retry-after-N" or "runtime events" text. So no mirror contradiction is possible from this insertion, and the Leader's claim that rows 6 and 11 are the only gates the paragraph can disturb holds for row 12 too.

## Q5 — gates: **reproduce**

| Gate | Result |
|---|---|
| §8 row 6 — `grep -nc "poke" .claude/commands/akili-execute.md` | 0 |
| §8 row 11 — five `-`/`+` pairs over `66d4a0d..HEAD`, no sixth | 5, confirmed |
| `npm run verify:cli` | exit 0 — 11 commands, 24 skills, 7 resources, v2.24.0 |
| `npm run pack:dry-run` | exit 0 — 275 files, `akili-specs-2.24.0.tgz`, 2.1 MB |
| `git diff --check` | exit 0 |

Row 11's five pairs match the five attempt 1 recorded, in the same order. A sixth was structurally impossible: `git diff --stat 528c8ad~1..528c8ad` shows the shipped file changed by `2 ++` with zero deletions — a pure insertion cannot add a `-` line. Confirmed, not assumed.

`git diff --check` passes with the Leader's uncommitted append to `t6-walkthrough.md` present, so the record's "working tree clean" line (true when the worker ran it, before the Leader persisted) does not affect the gate either way.

## Q6 — CHANGELOG — **advisory, not a FAIL**

No sentence of the `Unreleased` bullet becomes false. It describes "a per-role recovery ladder (Implementer: five rungs ending in a Leader-inline ask; Reviewer: four rungs, never inline, ending in the waiver record)" — still exactly true after the insertion, which adds no rung and reorders none.

**Advisory 4.** Unmentioned user-facing behavior. The paragraph ships four rules no CHANGELOG sentence covers: per-event-kind entry rungs; the mid-climb continue-from-the-higher rule; spent-rung-never-re-run and condition-skip; and the `runtime events:` line naming every event and the single recovering rung. The repo's Release Discipline ("every user-facing methodology … change should be reflected in `CHANGELOG.md`") reaches this.

Routed as advisory, not a FAIL issue, because CHANGELOG parity appears in none of T6's gates: not in its Verification `Command`, not in its `Falsifier`, not in its `Done`, and §8 has no CHANGELOG row. It is a T2-owed-clause omission surfacing at the closure gate, not a T6 defect. Suggested fix, one clause appended to the existing leader-brief-contract bullet under `### Added`: name the per-kind entry rungs and the mid-climb continuation rule, and the `runtime events:` line's shape. The Leader should close it before the spec ships.

---

## Advisory summary

1. Case 2's walk never tests whether rung 4 is skippable, and asserts a partial diff the fixture does not have.
2. Case 2's parenthetical-stripping check omits rung 2's parenthetical, the sole carrier of "3 minutes / background / announced" that the walk asserts.
3. Case 3's reason for declining the "lower rung's fresh spawn" clause is wrong, though the decision to decline was right.
4. CHANGELOG `Unreleased` does not mention the entry-rung and mid-climb rules (Release Discipline).

None is outcome-bearing. None consumes a rework attempt.
