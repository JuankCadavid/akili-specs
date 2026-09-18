# Tasks: Leader Brief Contract

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/leader-brief-contract` |
| Depth | Standard |
| Type | Change |
| Approval Mode | `gated` |
| Status | Approved — batch approval by the user, 2026-09-18 (drafted by a worktree agent on the Leader's behalf) |
| Date | 2026-09-18 |
| Budget (design §12) | 6 tasks · ~210 LOC (prose) · 1 review round per task — trip on the second FAIL of any one task |
| Design review | Step 2.3 reversion challenge run inline (DD-3, DD-6 — both real breakages, both closed); `judgment-day` not run in draft mode |
| Verification fields | Every task carries `Falsifier`, `Red run`, `Disqualifier`, `Consumers` (introduced by `changes/gate-falsifiability`, 2026-09-18); `n/a (no test gate)` and `none (no shared symbol changed)` are the absent values. All gates here are prose edits: `Red run` is `n/a` throughout, and the behavioral substitute is T6's fixture walkthrough |
| Cross-spec hand-offs | Rows 3 and 15 of design §7 carry the two `changes/gate-falsifiability` lines (T1 and T3); T6 byte-compares them against that spec's design §7 consumer-walk rows |
| Format precedent | `docs/specs/archive/2026-09-18-changes--kaizen-loop-closure/tasks.md` |

## 2. Task Graph

```
T1 (akili-execute.md: 2.2 brief contract + copied fields · 2.3 Reviewer brief + report contract)
 │
 ▼
T2 (akili-execute.md: runtime table + pseudocode · 2.4 accounting · Step 3 · Step 4 tree state · Step 5 stops + /goal · Log Format + REVIEW_WAIVED)
 ├─→ T3 (leader.md + reviewer.md: principle paragraph, item 4 clauses, audit item, 4R clause, mode note, report contract)
 ├─→ T4 (consumers, one clause each: akili-resume Step 1 · kaizen Measure/clean-run/Metrics · akili-archive 4.1)
 │
 T3, T4 ──→ T5 (docs/commands mirror · flow/README only if the grep turns a sentence false · CHANGELOG) ──→ T6 (closure greps · fixture walkthrough · packaging)
```

T1 → T2 are **sequential** (same file — two Implementers on `akili-execute.md` collide even on disjoint sections). T3 ∥ T4 after T2 (they cite names T2 defines: the runtime table's ladder rungs, `REVIEW_WAIVED` and its flags, `WAIVED (flag)`). T5 mirrors final text. T6 is the global gate. No circular dependencies.

**Global verification caveat.** Every grep below is a **presence-assertion**: it proves text landed, not that a Leader following it behaves correctly. Prose executability has no automated check (accepted risk, `requirements.md` §8) — the behavioral substitute is T6's fixture walkthrough. **A task may not report PASS on grep-green alone where its Done criteria name a walkthrough clause.**

**Grep hazard (all tasks).** Run from the repo root; exclude `.claude/worktrees/`, `docs/specs/archive/`, and this spec's own folder (`docs/specs/changes/leader-brief-contract/`), which quotes the superseded phrases verbatim. **Environment path that passes for the wrong reason:** a grep run inside a stale worktree or against the archive reports the wrong tree — every grep states repo root and exclusions.

**Pre-review restatement sweep (all rules-document tasks — KZ-changes--kaizen-loop-closure-2).** Before spawning the Reviewer, the Leader greps the edited file for the superseded phrasing and its paraphrases (listed per task); a surviving restatement is brief non-conformance returned to the Implementer, not a Reviewer round.

**Scope discipline (all tasks).** Zero edits to `.claude/commands/akili-specify.md`, `.claude/skills/tdd/`, `.claude/commands/akili-constitution.md`, `.claude/templates/implementer.md`, `.claude/commands/akili-test.md` (NFR-7). Any hunk there is a FAIL regardless of content.

---

### T1 — `/akili-execute` Step 2.2 brief contract and Step 2.3 Reviewer brief + report contract

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L |
| Depends on | none |
| Requirements | FR-1 (a)–(e) and all five scenarios (`BUT NOT` executable fallback · `AND IT MUST` one listing per level · `BUT NOT` zero files with a `CLAUDE.md` present · `BUT NOT` bare fact · `AND IT MUST` respect (a) under the tag · `BUT` absent-fields line); FR-2 scenario (`AND IT MUST` record in decisions made · `BUT NOT` change meaning — Pivot boundary); FR-3 all three scenarios (`AND IT MUST` verdict intact · `BUT NOT` paraphrase the overflow file · `AND IT MUST` write from the extracted diff · `BUT NOT` inside the working tree · non-host inline); NFR-2, NFR-4, NFR-6 |
| Design refs | §5.1, §5.2, §5.3, §7 rows 3–7, DD-2, DD-3, DD-4, DD-10, DD-11 |

**Scope.** Edit `.claude/commands/akili-execute.md`, by section (never by line):

- **Step 2.2**, after the bullet "the verification command to run before reporting completion (copied)": add one bullet — the task's `Falsifier`, `Red run`, and `Consumers` fields copied beside the command, with the instruction to run every suite `Consumers` names and report the assertion the red failed on; when the task has none, the brief states `no Falsifier / Red run / Consumers fields in this task` (hand-off from `changes/gate-falsifiability`, wording per its design §7 row for this consumer).
- **Step 2.2**, new **Brief contract** block after the bullet list: clauses (a) narrow-never-widen (cite `AGENTS.md` *Scope only grows through approval*); (b) the two-step convention-file lookup with "one listing per level; deeper ⇒ scout (Delegation Thresholds)" and the empty-result line; (c) source-or-`UNVERIFIED` with the marker text verbatim; (d) `[advisory-grade]` tagging **with both halves in the same paragraph** (lowers the tier; does not license the addition; (a) still binds); (e) points at the copied-fields bullet. Each clause names its falsifier from design §5.1 (KZ-006). Corpus examples only in parentheticals (NFR-4).
- **Step 2.3 item 2**, the diff bullet: replace "always inline, the one payload that can never become a pointer" with the size rule — ≤ 300 lines inline; above, the Leader writes **the diff it extracted** to a session-scratchpad file outside the working tree and the brief names the path with `Read`; the wrapper-restricted Reviewer keeps `Read` (only `Bash` withheld); a non-host Reviewer keeps inline at any size (the Step 2.2 standing exception, cited).
- **Step 2.3 item 2**, new bullet: execute-time edits to `requirements.md` / `design.md` since the previous PASS listed as named conformance checks; carried once more by the next task's Reviewer brief; recorded in the current entry's *decisions made* at edit time; **boundary sentence**: a meaning-changing edit is a Pivot (existing protocol, cited), not an edit-carry.
- **Step 2.3**, the paragraph "The Reviewer is read-only. It must conclude with…": becomes the report contract — the returned message's first line is `STATUS:`, then summary, issues, `ADVISORY`; ≤ ~600 words; overflow issues to a scratchpad file the Leader reads by path, count on the summary line; the Structured Feedback rule relays report and file verbatim. The three status definitions keep their text.

**Verification** (repo root; exclusions per the hazard note).

| Field | Value |
|---|---|
| Command | 1. `grep -nc "always inline, the one payload" .claude/commands/akili-execute.md` — 0. 2. `grep -n "advisory-grade" .claude/commands/akili-execute.md` — ≥ 2 hits inside Step 2.2, and the paragraph containing the first hit also contains "narrow" (both halves together). 3. `grep -n "UNVERIFIED — confirm at source" .claude/commands/akili-execute.md` — ≥ 1 in Step 2.2. 4. `grep -n "no Falsifier / Red run / Consumers fields" .claude/commands/akili-execute.md` — 1 hit in Step 2.2. 5. `grep -n "300 lines" .claude/commands/akili-execute.md` — hit in Step 2.3 with "non-host" in the same bullet. 6. `grep -n "600 words" .claude/commands/akili-execute.md` — hit in Step 2.3. 7. `grep -nE "Angular|Jest|Cypress|Orca|tmux|onecgiar|PRMS" .claude/commands/akili-execute.md` — every hit inside `(...)` |
| Falsifier | The pre-change file: grep 1 = 1 (the Step 2.3 bullet), greps 2–6 = 0 — all seven fail on current text. A (d) paragraph with the tag but no "narrow" in it fails grep 2's second clause |
| Red run | `n/a (no test gate)` |
| Disqualifier | Greps 2–6 count words: read the Brief contract block — if (b) says "search the repository for convention files" or omits "one listing per level", NFR-6 is violated though every grep passes; if the edit-carry bullet lacks the Pivot boundary sentence, DD-10 is violated with grep-green. If the diff touches the three `STATUS:` definitions' meaning, the 4R mode table, or Step 2.2's pointer-vs-copy bullets other than the one added, stop — outside scope |
| Consumers | `none (no shared symbol changed)` — prose consumers walked in design §7 C; T3 restates the principle, T5 mirrors |

**Pre-review sweep.** `grep -niE "always inline|never become a pointer|one payload" .claude/commands/akili-execute.md` — zero hits outside the new size rule's own sentence.

**Done.** All five scope bullets land; verification 1–7 with disqualifiers read; FR-1 widened-brief and FR-3 large-diff behaviors queued for T6's walkthrough.

**Skills:** `cognitive-doc-design`.

---

### T2 — `/akili-execute` event lane, attempt accounting, Step 3/4/5, Execution Log Format

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L |
| Depends on | T1 (same file; sequential) |
| Requirements | FR-4 all four scenarios (`AND IT MUST` record the event line, counter unchanged · `BUT NOT` count as FAIL / spawn fresh while the old can answer / ask inline early · `BUT NOT` inline or waiver ask before rungs exhausted · `BUT NOT` restate poke mechanics); FR-5 all five scenarios (`AND IT MUST` before `[x]` · `BUT NOT` read 0 FAILs as exercised — record side · `AND IT MUST` keep PASS for degraded-pair · `BUT NOT` auto-approve a waiver · no-migration read); FR-6 all three scenarios (`AND IT MUST` derive from attempt entries · `BUT NOT` blanket on a dirty tree · clean tree byte-identical · `BUT NOT` touch unattributed files); NFR-2, NFR-3, NFR-8 |
| Design refs | §5.4, §5.5, §5.6, §7 rows 1, 2, 8–12, DD-5, DD-6, DD-7, DD-9 |

**Scope.** Edit `.claude/commands/akili-execute.md`, by section:

- **Step 2 preamble, *Runtime-failure fallback***: the paragraph names the event vocabulary (spawn failure · provider-limit death · pane / terminal timeout · idle-without-report → `leader.md` by name, nothing restated) and closes the enumeration with the non-events (verification failure = implicit FAIL, Reviewer FAIL, FATAL_FAIL, Pivot stop, stack outage → Step 2.1 / *Deferring a check*); states the **accounting rule** once, verbatim from design §5.4; the table's Implementer row lists the five rungs in order (tree probe first on a death; retry-after-N = 3 minutes, one retry, background wait, announced — cite *Winding down*'s background-wait rule); the Reviewer row lists four rungs with rung 4 "waiver **is** a `REVIEW_WAIVED` record — a user stop; never inline without it"; the Tester row is unchanged.
- **Step 2 loop pseudocode**: one branch — `on runtime event: recover per the runtime table; attempt unchanged`.
- **Step 2.4 *Maximum Retries***: +1 clause citing the accounting rule by name. ***Budget Tripwire***: +1 clause — review rounds count Reviewer verdicts only.
- **Step 3 opening line**: "Only after a Reviewer `PASS` — or, when the Reviewer ladder was exhausted, after the `REVIEW_WAIVED` record is written —"; the evidence-before-checkbox table's text is unchanged and applies to both.
- **Step 4 item 1**: the three-branch tree-state table from design §5.6 (clean → today's two commands byte-identical; other PASSed work → explicit-file pathspec from the attempt entries' *files changed*, `git restore -- <paths>`, `git clean -f -- <paths>`, never a directory glob; unattributed changes → never restored, listed, escalate); post-restore `git status --porcelain` reported; the residual sentence; the `## HALT` block gains "pathspec used / unattributed — not restored".
- **Step 5 *Approval Mode***: +1 sentence — the `REVIEW_WAIVED` decision and the Leader-inline ask are stops, never auto-passed; the `/goal` canonical condition reads "matching PASS or `REVIEW_WAIVED` evidence".
- **Execution Log Format**: per-attempt `runtime events: <kind> ×n → <rung>` line; *decisions made* gains "execute-time spec edits (file + section + reason)"; final status `PASS / WAIVED (flag) / HALT / pivot`; new record type `## REVIEW_WAIVED: <Task ID>` with the five fields and the three flags defined per design §5.5 (which property was lost; how the task entry reads; `degraded-pair` accompanies a standing PASS); the closability sentence ("a task with neither a PASS nor a `REVIEW_WAIVED` is not closable"); one line: old logs without the block read as "no waiver recorded".

**Verification** (repo root; exclusions per the hazard note).

| Field | Value |
|---|---|
| Command | 1. `grep -n "consumed by a Reviewer" .claude/commands/akili-execute.md` — ≥ 2 hits (preamble table, 2.4), identical sentence. 2. `grep -nc "poke" .claude/commands/akili-execute.md` — 0 (the mechanics live in `leader.md`). 3. `grep -n "REVIEW_WAIVED" .claude/commands/akili-execute.md` — hits in the preamble table, Step 3, Step 5 condition, Execution Log Format; `grep -nE "inline|same-model|degraded-pair" …` — all three flags inside the Log Format. 4. `grep -nE "git restore \. and git clean|Run \`git restore \.\`" .claude/commands/akili-execute.md` — 0 outside the clean-tree row. 5. `grep -n "matching PASS" .claude/commands/akili-execute.md` — every hit reads "PASS or \`REVIEW_WAIVED\`". 6. `grep -n "3 min" .claude/commands/akili-execute.md` — hit in the Implementer row with "background" in the same cell. 7. `git diff -U0 -- .claude/commands/akili-execute.md \| grep -E "^-.*(3 rework attempts|FATAL_FAIL|author ≠ auditor)"` — no `-` line rewrites those sentences (NFR-8) |
| Falsifier | The pre-change file: grep 1 = 0, grep 3 = 0, grep 4 = 1 (Step 4 item 1), grep 5 hits "matching PASS evidence" alone. A Reviewer row whose last rung reads "inline" fails the ladder parity read; a table row that says "poke once, then replace" fails grep 2 |
| Red run | `n/a (no test gate)` |
| Disqualifier | Grep 3 proves the heading landed, not the flags' semantics — read the Log Format: if `degraded-pair` is defined as a lost independence rather than a tier degradation with a standing PASS, or if the closability sentence is missing, the record is wrong with grep-green. Grep 4 green while Step 4 uses `git clean -fd -- <dir>` on a directory = DD-6 breakage (i) reintroduced — read the row. If the diff changes the Pivot Protocol steps, the Delegation Ceiling paragraph, or the idle-protocol pointer into a restatement, stop — NFR-8 |
| Consumers | `none (no shared symbol changed)` — record-type consumers walked in design §7 B; T4 edits three of them |

**Pre-review sweep.** `grep -niE "restore \.|clean -fd|retry once, then degrade|explicit recorded waiver" .claude/commands/akili-execute.md` — every hit is inside the clean-tree row or the rewritten table; a survivor elsewhere is brief non-conformance.

**Done.** All seven scope bullets land; verification 1–7 with disqualifiers; FR-4 spawn-failure, FR-5 waiver, FR-6 dirty-tree behaviors queued for T6's walkthrough.

**Skills:** `cognitive-doc-design`.

---

### T3 — Personas: `leader.md` principle + item 4 clauses; `reviewer.md` audit item, 4R clause, mode note, report contract

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T2 |
| Requirements | FR-1 (`leader.md` restates the principle without re-deriving mechanics); FR-3 (`reviewer.md` restates the report contract where the options are defined; mode-table note); FR-4 (item 4 accounting clause; "by tree state"); FR-6 (item 4 wording); FR-7 both scenarios (`BUT NOT` accept the test's name · diverging-values remediation) + the absent-`Red run` skip clause; FR-1 (d) consumer — advisory-grade audited as `ADVISORY` (design §7 C); NFR-4, NFR-8 |
| Design refs | §7 rows 13–18, DD-1, DD-4, DD-11 |

**Scope.**

- `.claude/templates/leader.md` **Delegation Discipline**: one new bullet after the spawn-mechanics bullet — the brief-contract principle (narrow-never-widen; convention files by lookup; source-or-`UNVERIFIED`; advisory-grade with both halves; carry execute-time edits as Reviewer checks) ending "mechanics in `/akili-execute` Steps 2.2–2.3 — follow, do not re-derive". **Item 4**, first bullet: add "runtime events never consume an attempt — the command's runtime table is canonical" and change "HALT + Automatic Rollback after 3" to "HALT + rollback **by tree state** after 3". Nothing else in the file (the pre-review restatement sweep paragraph on main stays verbatim).
- `.claude/templates/reviewer.md` **Audit Checklist**: +1 item — *verify the recorded red run failed on the behavioral assertion (not on setup, an intercept, a timeout, or a mock that never reaches the timing under test), and trace the named mutation through the fixture — a test named after a mutation is not evidence it exercises it*; when the task has no `Red run` field or it reads `n/a (no test gate)`, skip and say so. **4R section**: +1 clause — a brief item tagged `[advisory-grade]` is audited in `ADVISORY` only. **Item 5 mode table**: +1 note — a diff delivered as a file path is `Read` first, then sized. **Structured Review Output** lead paragraph: the report contract (first line `STATUS:`; order; ~600 words; overflow file with count on the summary line); the three option blocks unchanged.

**Verification** (repo root).

| Field | Value |
|---|---|
| Command | 1. `grep -n "narrow" .claude/templates/leader.md` — 1 hit, inside Delegation Discipline, same bullet as "UNVERIFIED" and "advisory-grade". 2. `grep -n "by tree state" .claude/templates/leader.md` — 1 hit in item 4. 3. `grep -n "mutation" .claude/templates/reviewer.md` — ≥ 1 in the Audit Checklist with "fixture" in the same item and "n/a" in the same item. 4. `grep -n "advisory-grade" .claude/templates/reviewer.md` — 1 hit in the 4R section. 5. `grep -n "600 words" .claude/templates/reviewer.md` — 1 hit above Option A. 6. `git diff --stat -- .claude/templates/` — exactly two files; `implementer.md` and `tester.md` absent (NFR-7). 7. `git diff -U0 -- .claude/templates/leader.md \| grep -E "^-.*(Poke once|replace on the second idle|Pre-review restatement)"` — empty |
| Falsifier | Pre-change files: greps 1–5 all 0. A checklist item reading "check that the red test exists" passes a naive grep for "red" but fails grep 3's "mutation" + "fixture" clause; an `implementer.md` hunk fails grep 6 |
| Red run | `n/a (no test gate)` |
| Disqualifier | Grep 1 proves the words landed, not that the paragraph stops at principle — read it: if it restates the two-step lookup or the 300-line rule operationally, DD-1's division is broken with grep-green. Grep 3 cannot see wording drift from the source spec — T6 byte-compares. If the diff reorders `reviewer.md`'s three option blocks or edits their text, stop |
| Consumers | `none (no shared symbol changed)` — deployed `.agents/*` copies pick the change up on the next `--force` install (NFR-3) |

**Pre-review sweep.** `grep -niE "Automatic Rollback|always inline|diff-inline rule" .claude/templates/leader.md` — the spawn-mechanics bullet's "the diff-inline rule for the Reviewer" must now read "the diff-delivery rule"; any other survivor is non-conformance.

**Done.** Six sites land across two files; verification 1–7; behaviors queued for T6 (the waiver case reads `reviewer.md`'s contract as the Reviewer would).

**Skills:** `cognitive-doc-design`.

---

### T4 — Consumers name their `REVIEW_WAIVED` branch (one clause each)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Depends on | T2 |
| Requirements | FR-8 both scenarios (`BUT NOT` write a clean-run entry · `BUT NOT` write any file from resume) and the per-site enumeration; NFR-1 (one clause per file, no other hunk) |
| Design refs | §7 rows 19–21, consumer walk B, DD-8 |

**Scope.** Three one-clause edits, nothing else in each file:

1. `.claude/commands/akili-resume.md` Step 1, *Last Action* / *Blocked* bullets: a `## REVIEW_WAIVED: <Task ID>` block is a closed task's last action, reported with its flag ("T-4 closed — REVIEW_WAIVED (inline)"); it is not a *Blocked* item. The read-only sentence stays verbatim.
2. `.claude/skills/kaizen/SKILL.md`: Measure table +1 row `Tasks closed under \`REVIEW_WAIVED\` (by flag) | \`execution.md\` \`## REVIEW_WAIVED\` blocks — \`inline\` / \`same-model\` = no exercised gate; \`degraded-pair\` = exercised, noted`; the clean-run sentence gains "and no `inline` / `same-model` waiver"; the Metrics example gains the row with a `0` value.
3. `.claude/commands/akili-archive.md` Step 4.1: the signal list gains "tasks closed under `REVIEW_WAIVED` (by flag)".

**Verification** (repo root).

| Field | Value |
|---|---|
| Command | 1. `grep -n "REVIEW_WAIVED" .claude/commands/akili-resume.md .claude/skills/kaizen/SKILL.md .claude/commands/akili-archive.md` — resume ≥ 1 in Step 1; kaizen ≥ 3 (table row, clean-run sentence, Metrics example); archive 1 in Step 4.1. 2. `grep -n "every signal is clean" .claude/skills/kaizen/SKILL.md` — the sentence contains "waiver". 3. `git diff --stat -- .claude/commands/akili-resume.md .claude/skills/kaizen/SKILL.md .claude/commands/akili-archive.md` — three files; `git diff -U0` shows hunks only in the named sections (NFR-1). 4. `git diff -U0 -- .claude/skills/kaizen/SKILL.md \| grep -E "^-description:"` — empty (no trigger change) |
| Falsifier | Pre-change files: grep 1 = 0 everywhere; grep 2's sentence reads "zero rework, no pivots, no product bugs, no severe findings" with no waiver clause — the walk's reference falsifier (a waived run files as clean today). A hunk in the kaizen skill's Apply Mode or Standardize fails grep 3 |
| Red run | `n/a (no test gate)` |
| Disqualifier | Grep 1 counts the heading; it cannot see whether resume files the block under *Blocked* — read the bullet. If the kaizen row folds `degraded-pair` into "no exercised gate", the flag semantics from T2 are contradicted with grep-green — read the row against design §5.5. If the diff removes or renames any existing Measure signal, stop |
| Consumers | `none (no shared symbol changed)` — `docs/skills/kaizen.md` mirror checked by T5 |

**Pre-review sweep.** `grep -niE "zero rework, no pivots" .claude/skills/kaizen/SKILL.md` — the one hit is the amended sentence; no second copy elsewhere in the file.

**Done.** Three clauses land; verification 1–4; the waived-run Measure behavior queued for T6's walkthrough.

**Skills:** `cognitive-doc-design`.

---

### T5 — Mirror, root docs, CHANGELOG

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T3, T4 |
| Requirements | FR-9 post-sweep scenario (`BUT` no surviving restatement; sanctioned hits enumerated); NFR-4; NFR-7 |
| Design refs | §7 rows 22–24, DD-11 |

**Scope.** Bring `docs/commands/akili-execute.md` to summary-level parity: *Per-task loop* (event lane line; waiver close), *Reviewer output contract* (`STATUS:` first, ceiling, overflow), *Outputs* (final status `PASS / WAIVED (flag) / HALT / pivot`; `## REVIEW_WAIVED` record), *Guardrails* (attempt accounting; rollback by tree state; brief contract in one bullet). Run the FR-9 grep over `docs/flow.md`, `README.md`, `docs/README.md`, `docs/skills/kaizen.md`: edit only a sentence the grep turns false (expected none — the loop diagrams show the happy path and README's Git cell stays true); enumerate every checked hit in Done. `CHANGELOG.md` `Unreleased`: Added (brief contract; report contract; runtime-event class with attempt rule and ladders; `REVIEW_WAIVED` record; audit-checklist item on behalf of `changes/gate-falsifiability`), Changed (diff delivery by size; HALT rollback by tree state; `/goal` condition; three consumer clauses), classification line as the user decides (patch proposed).

**Verification** (repo root; exclusions per the hazard note).

| Field | Value |
|---|---|
| Command | 1. `grep -rnE "always inline, the one payload|git restore \. and git clean|Run \`git restore \.\`" .claude/commands .claude/templates docs/commands docs/flow.md README.md docs/README.md --exclude-dir=worktrees` — 0 unsanctioned hits. 2. `grep -n "REVIEW_WAIVED" docs/commands/akili-execute.md` — ≥ 2 (loop, Outputs). 3. `grep -rn "matching PASS" docs/ README.md --exclude-dir=archive` — every hit reads "PASS or \`REVIEW_WAIVED\`" or is a by-reference sentence naming the canonical condition (enumerated). 4. `grep -n "REVIEW_WAIVED\|brief contract" CHANGELOG.md` — both under `## [Unreleased]`. 5. `git diff --stat -- .claude/commands/akili-specify.md .claude/skills/tdd .claude/commands/akili-constitution.md .claude/templates/implementer.md .claude/commands/akili-test.md docs/commands/akili-specify.md docs/skills/tdd.md` — empty (NFR-7) |
| Falsifier | `docs/commands/akili-execute.md` today: grep 2 = 0; its *Outputs* line reads "final status (PASS / HALT / pivot)". Any hunk in grep 5's list |
| Red run | `n/a (no test gate)` |
| Disqualifier | Grep 1 finds phrases, not contradictions: a mirror can avoid the phrase and still describe "retry once, then ask the user" as the whole Implementer fallback — per-surface parity read (command vs mirror) for the four rewritten sections, recorded per section. CHANGELOG bullets are aggregate claims (KZ-002): each names a surface T1–T4's diffs actually touched — run `git diff --stat` and match |
| Consumers | `none (no shared symbol changed)` |

**Pre-review sweep.** `grep -niE "retry once, then|Automatic Rollback|always inline" docs/commands/akili-execute.md docs/flow.md README.md` — each hit enumerated as rewritten or sanctioned.

**Done.** Mirror at parity; every FR-9 candidate hit enumerated with its disposition; CHANGELOG entry present; grep 5 empty.

**Skills:** `cognitive-doc-design`.

---

### T6 — Closure gate: greps, hand-off byte check, fixture walkthrough, packaging

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T5 |
| Requirements | FR-1 widened-brief scenario (walked); FR-3 400-line-diff scenario (walked); FR-4 provider-limit-death and spawn-failure scenarios (walked, `BUT NOT` count as FAIL); FR-5 quota-block and `pre-approved` scenarios (walked, `BUT NOT` auto-approve); FR-6 nine-PASSed-tasks and unattributed scenarios (walked, `BUT NOT` blanket restore / touch unattributed); FR-7 hand-off wording; FR-8 waived-run Measure scenario (walked); FR-9 post-sweep scenario; NFR-3 (old log reads as no waiver); the `requirements.md` §8 accepted risk discharged as far as a walkthrough can |
| Design refs | §5.4–§5.6, §7 consumer walks A–C, §11, §12 budget |

**Scope.** (a) Run the FR-9 greps repo-wide and record every sanctioned hit in `execution.md`. (b) **Hand-off byte check:** compare the `reviewer.md` audit item and the Step 2.2 copied-fields bullet against `changes/gate-falsifiability` `design.md` §7 consumer-walk rows — the rule content must match; wording may differ only by the absent-value clauses this spec adds. (c) Build a throwaway fixture in the session scratchpad (never in the repo): a git repo with one branch; a `tasks.md` with T-1..T-9 (T-1..T-8 `[x]`, T-9 `[~]`) where T-4 carries `Falsifier` / `Red run` / `Consumers` fields and T-9 does not; an `execution.md` whose Document Control is shaped like the 2026-09-17 `kaizen-loop-closure` log, with eight PASS entries listing *files changed* per attempt, a T-9 entry with three FAIL attempts listing its own files, and **two files in the tree no entry names**; plus one **old-style** `execution.md` (pre-change, no `REVIEW_WAIVED`). Walk, **as a literal agent reading only the shipped text** (no memory of this spec), quoting the sentence that decides each step:

| Case | Steps walked | Expected recorded outcome |
|---|---|---|
| **HALT on a dirty tree** (FR-6) | Step 4 item 1 on the fixture tree | branch "holds other PASSed work" chosen; pathspec = T-9's files only, explicit paths; the two unattributed files listed, not restored; `git status --porcelain` reported; HALT block names both |
| **Spawn failure mid-task** (FR-4) | Runtime table Implementer row on "spawn failed twice, then a pane timeout" | rungs 1 → 2 (3 min, background, announced) → recorded `runtime events: spawn failure ×2, pane timeout ×1 → retry-after-N`; attempt counter unchanged; no inline ask |
| **Provider-limit death, context alive** (FR-4) | same row | tree probe → rung 3 resume-by-message; the contracted report as terminating act; no fresh spawn |
| **Reviewer waiver** (FR-5, FR-8, FR-3) | Reviewer row → Step 5 under `pre-approved` → Log Format → Step 3 → `/akili-resume` Step 1 → kaizen Measure + clean-run | rungs 1–3 exhausted; stop (no auto-approve); `## REVIEW_WAIVED: T-9` with `flag: inline`, five fields; entry reads `WAIVED (inline)`; written before `[x]`; resume reports it as last action, not blocked; Measure counts 1, run not clean. Also: `reviewer.md` read as the Reviewer — first line `STATUS:` |
| **Widened brief** (FR-1) | Step 2.2 block against a draft brief offering "record as not measurable" for T-9 and naming zero convention files for a target whose fixture folder holds a `CLAUDE.md` | both clauses flag it, each by its falsifier sentence; T-4's brief copies the three fields; T-9's brief says `no Falsifier / Red run / Consumers fields in this task` |
| **400-line diff** (FR-3) | Step 2.3 diff bullet | scratchpad file + `Read`; non-host ⇒ inline |
| **Old log** (NFR-3) | resume + kaizen on the old-style `execution.md` | "no waiver recorded"; no error, no inference |

Any step where two shipped sentences can be read to disagree is recorded **INCONCLUSIVE** — never PASS. (d) `npm run verify:cli && npm run pack:dry-run && git diff --check`.

**Verification** (repo root; exclusions per the hazard note).

| Field | Value |
|---|---|
| Command | 1. Greps from `requirements.md` §8 rows 1–2, 4, 6, 9–11 — zero unsanctioned hits; sanctioned list recorded. 2. Hand-off byte check (b) — two matches recorded with the compared text. 3. Walkthrough record — every case above has an outcome and a quoted deciding sentence. 4. `npm run verify:cli && npm run pack:dry-run && git diff --check` — exit 0 |
| Falsifier | Grep 1: the pre-change sentences named in §8. Walkthrough: a fixture where the HALT case runs `git restore .` (the blanket rule survived somewhere the greps missed); a waiver case that finds no sentence saying it is a stop under `pre-approved` (INCONCLUSIVE); a kaizen clean-run read that files the waived run as clean. Packaging: a renamed packaged file |
| Red run | `n/a (no test gate)` |
| Disqualifier | A walkthrough performed from memory of this spec proves nothing — the record must quote the sentence, not paraphrase the design. Grep-green plus one INCONCLUSIVE step is a **FAIL for the spec**, reported to the user (Pivot or amendment), never absorbed. **Environment path that passes for the wrong reason:** a fixture tree with no unattributed files (the third branch is never exercised) or with per-task commits (the dirty-tree branch is never reached) — the fixture must hold all nine tasks uncommitted plus the two stray files |
| Consumers | `none (no shared symbol changed)` |

**Done.** Greps clean with enumerated sanctions; hand-off lines match; walkthrough record complete with zero INCONCLUSIVE steps or an escalation; packaging green; fixture deleted from the scratchpad.

**Skills:** `cognitive-doc-design`, `systematic-debugging` (if a walkthrough step is INCONCLUSIVE).

---

## 3. Coverage — scenario and clause level

| Requirement · scenario / clause | Owner |
|---|---|
| FR-1 (a) fallback scenario (`BUT NOT` executable alternative) | T1 · T6 (widened-brief walk) |
| FR-1 (b) cap-file scenario (`AND IT MUST` one listing per level · `BUT NOT` zero files with `CLAUDE.md`) | T1 · T6 |
| FR-1 (c) infra-fact scenario (`BUT NOT` bare fact) | T1 |
| FR-1 (d) Leader-added test scenario (`AND IT MUST` respect (a)) | T1 (both halves) · T3 (Reviewer 4R clause) |
| FR-1 (e) copied-fields scenario (`BUT` absent-fields line) | T1 · T6 (T-4 vs T-9 briefs) |
| FR-1 `leader.md` principle without mechanics | T3 |
| FR-2 spawn-time clarification (`AND IT MUST` record · `BUT NOT` change meaning) | T1 (bullet + boundary) · T2 (Log Format *decisions made*) |
| FR-3 long-FAIL scenario (`AND IT MUST` verdict intact · `BUT NOT` paraphrase) | T1 · T3 (`reviewer.md` contract) |
| FR-3 400-line scenario (`AND IT MUST` from the extracted diff · `BUT NOT` inside the tree) | T1 · T6 |
| FR-3 non-host scenario | T1 · T6 |
| FR-4 death-with-context (`AND IT MUST` event line · `BUT NOT` FAIL / fresh spawn / early inline) | T2 · T6 |
| FR-4 pane-timeouts (`BUT NOT` inline or waiver ask early) | T2 · T6 |
| FR-4 spawn-dies-first (counter reads 1) | T2 · T6 |
| FR-4 idle-without-report (`BUT NOT` restate poke) | T2 (pointer; grep 2) |
| FR-4 accounting rule in 2.4 and `leader.md` item 4 | T2 · T3 |
| FR-5 quota-block scenario (`AND IT MUST` before `[x]` · `BUT NOT` read as exercised) | T2 · T4 · T6 |
| FR-5 same-model · degraded-pair (`AND IT MUST` keep PASS) | T2 |
| FR-5 `pre-approved` (`BUT NOT` auto-approve) | T2 · T6 |
| FR-5 old log (no inference) | T2 (one line) · T6 (old-log walk) |
| FR-5 `/goal` condition | T2 · T5 (by-reference hits) |
| FR-6 nine-PASSed (`AND IT MUST` from entries · `BUT NOT` blanket) | T2 · T6 |
| FR-6 clean tree (byte-identical) | T2 |
| FR-6 unattributed (`BUT NOT` delete or restore) | T2 · T6 |
| FR-7 both scenarios + absent-`Red run` skip | T3 · T6 (byte check) |
| FR-8 waived-run Measure (`BUT NOT` clean-run entry) | T4 · T6 |
| FR-8 resume after waived close (`BUT NOT` write) | T4 · T6 |
| FR-9 post-sweep (`BUT` no restatement survives) | T5 · T6 |
| NFR-1 · NFR-2 · NFR-3 · NFR-4 · NFR-5 · NFR-6 · NFR-7 · NFR-8 | T4 · T1+T2 · T2+T6 · T1+T3+T5 · T2 (no hook text) · T1 · T3+T5 · T2+T3 |
| Known 8F-hook interaction (DD-7) | No task — recorded in `requirements.md` §4 and design DD-7; accepted, out of scope |

No gap is discharged by citing a different requirement; every row quotes the clause it owns.

## 4. Estimate and PR strategy

**Estimated LOC:** ~210 lines of prose across 24 surface rows (design §12), plus the throwaway fixture in the scratchpad (not shipped).

**PR strategy: one PR.** The command, the two personas, and the three consumer clauses describe one contract and must land together — a split would ship a persona citing a ladder the command does not define, or a kaizen row for a record the log format does not yet name. Prose-only, under ~400 LOC. Review order for the PR description (`cognitive-doc-design`): T2's runtime table and Log Format first, then T1's Step 2.2 block, then T3/T4, then the mirror. Out of scope to state explicitly: `implementer.md`, `/akili-specify`, `tdd` — the parallel spec's files.

**Recommended first task:** T1 — T2 follows in the same file and every later task cites names the two define.

**Merge note:** `changes/scoped-constitution-reads` also plans one added item in the Step 2.2/2.3 brief lists; merge serially and re-run T5's grep 1 and T6's greps after the merge.
