# Tasks: Review Intensity and Model Routing by Proven Verification

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/review-intensity-routing` |
| Depth | Standard |
| Status | Draft — awaiting the Step 3.3 gate |
| Date | 2026-09-19 |
| Source | `requirements.md` (FR-1..FR-11, NFR-1..8), `design.md` (budget §13: 9 tasks · ~120 shipped lines · 10 review rounds), `judgment.md` (round 1, **approved**) |
| Baselines | Every count in a `Command` or `Falsifier` cell was **run at `c87187f` before it was written** (KZ-changes--leader-brief-contract-2). Readings: `REVIEW_SKIPPED` = 0 in every target file · `never collapse it` = 1 in `leader.md` · `effort ceiling` = 0 in `reviewer.md` · `skip-eligible` = 0 in `akili-specify.md` and `akili-constitution.md` · `review intensity` = 0 in `docs/model-routing.md` · `REVIEW_WAIVED` = 6 in `akili-execute.md` · `No unreleased changes yet` = 1 in `CHANGELOG.md` |
| Format precedent | `docs/specs/archive/2026-09-19-changes--leader-brief-contract/tasks.md` |
| Commit prefix | `[SPEC:changes/review-intensity-routing]` |
| **Dogfooding note** | This spec defines the `Review` field, so every task below carries one. **Eight of nine are `checklist` or `full`; exactly one is `skip-eligible`.** That ratio is the honest output of applying FR-2's overrides to this spec's own work: almost every task here *defines an obligation other readers execute*, which override (a) forces to review. No task was reclassified downward to demonstrate the feature — doing so would be the predicate-gaming risk `requirements.md` §8 names |

## 2. Task Graph

```
T1 (akili-execute: the Review intensity block — predicate · overrides · re-run duty)
 ├─→ T2 (akili-execute: closure states · record · /goal · Steps 2.2/2.4)
 ├─→ T3 (leader.md: collapse paragraph · thresholds · model+effort recording)
 ├─→ T4 (reviewer.md: depth bands with effort ceilings)
 ├─→ T5 (akili-specify: Review field · Verification Checklist)
 ├─→ T6 (akili-constitution: Step 7 item 3 clause)          ← skip-eligible
 └─→ T7 (akili-resume + kaizen: downstream consumers of the closure state)
 T2..T7 ──→ T8 (mirrors · CHANGELOG) ──→ T9 (closure gate)
```

T1 → T2 are **sequential** — same file. T3, T4, T5, T6, T7 run after T1, each on a different file, each citing the block by the name T1 ships. T8 mirrors final text. T9 is the global gate.

**Grep hazard (all tasks).** Run from the repo root. Exclude `.claude/worktrees/`, `docs/specs/archive/`, and this spec's own folder, which quotes superseded phrasing verbatim. Every recursive grep carries `--exclude-dir=worktrees`.

**Held-out discipline (all tasks — DD-11).** The closure gate in T9 evaluates the predicate against the **14 held-out task records** that carry the fields FR-1 reads: `docs/specs/archive/2026-09-18-changes--gate-falsifiability/` (6) and `docs/specs/archive/2026-09-19-changes--leader-brief-contract/` (8). **No shipped file may name either spec or any of its tasks.** Shipped text may cite `changes/premise-ledger` only, because this spec's documents already cite it.

**Pre-review restatement sweep (T1–T8).** Before a Reviewer is spawned, the Leader greps the edited file for the superseded phrasing named per task and reads whole every paragraph that received an insertion (KZ-changes--leader-brief-contract-1).

**Scope discipline (all tasks — NFR-1).** Zero hunks in `.claude/templates/implementer.md`, `.claude/templates/tester.md`, `.claude/skills/tdd/`, `bin/`, `scripts/`, `package.json`, and `/akili-specify`'s Falsifiability block. Any hunk there is a FAIL regardless of content.

---

### T1 — `/akili-execute` Step 2.3: the *Review intensity* block

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L |
| Review | `full` — defines the obligation every other surface cites; override (a) |
| Depends on | none |
| Requirements | FR-1 (four conditions, the report-not-plan rule, the three scenarios incl. `AND IT MUST` record the re-run · `BUT NOT` skip on a merely-named falsifier · `BUT NOT` exempt a one-line change); FR-2 (overrides a–g, evaluated against what the task does); FR-3 (duty, two modes, `VERIFIED`/`MISMATCH`, implicit FAIL, never waived); NFR-2, NFR-4, NFR-8 |
| Design refs | §5.1–§5.3, §7.1 rows 1–3, DD-1, DD-3, DD-4, DD-7 |

**Scope.** Edit `.claude/commands/akili-execute.md`, by section:

- **Step 2.3, before the Reviewer spawn:** the **Review intensity** block carrying, in order: the four-condition predicate; the seven overrides immediately beneath it; the evidence re-run duty with its two modes and its `VERIFIED` / `MISMATCH` outcome; the rule that the predicate is evaluated against the **Implementer's report**, never the plan; and the statement that the re-run is never waived by any mode, category or approval setting.
- **Step 2.2:** one sentence in the brief contract — the brief tells the Implementer when its verification may be the gate.
- **Step 2.4:** one guardrail bullet — a `MISMATCH` is an implicit FAIL consuming an attempt.

**Verification** (repo root, on `.claude/commands/akili-execute.md`).

| Field | Value |
|---|---|
| Command | **1.** `grep -c "Review intensity"` ≥ 1. **2.** All four predicate conditions present: `grep -c "executed"`, `"deterministic"`, `"Consumers"`, `"override"` each ≥ 1 within the block's `sed` range. **3.** `grep -c "VERIFIED"` ≥ 1 and `grep -c "MISMATCH"` ≥ 1. **4.** Overrides (a)–(g): seven lettered rows inside the block. **5.** `grep -c "REVIEW_WAIVED"` = 6 — unchanged from baseline, proving the waiver's text was not edited. **6.** Falsifiability-block identity in `akili-specify.md` untouched: `git diff --stat c87187f -- .claude/commands/akili-specify.md` empty |
| Falsifier | At `c87187f`: checks 1–4 count **0** (run: `Review intensity` 0, `REVIEW_SKIPPED` 0, `skip predicate` 0, `evidence re-run` 0), so each fails on current text. For 5: reword any `REVIEW_WAIVED` sentence → the count moves off 6. **Executed falsifier required:** on a scratch copy, delete override (c) and re-read FR-2's *derived evidence* scenario — the shipped text must stop demanding a review for it; observe and discard |
| Red run | `n/a (no test gate)` |
| Disqualifier | Greps count words. **Read the block:** if the predicate is stated without the "evaluated against the report, never the plan" rule, DD-7 is violated with every grep green. If the re-run duty is written as conditional on anything, FR-3 is violated. If the overrides sit anywhere but immediately beneath the predicate, FR-2's "no reader meets one without the other" is unmet |
| Consumers | Every surface T2–T8 cites this block by name; `akili-specify.md`'s Falsifiability block is **read, never edited** |

**Pre-review sweep.** `grep -n -i "reviewer" .claude/commands/akili-execute.md` around Step 2.3 — the surviving spawn instructions must not contradict the new conditionality.

**Done.** Three scope bullets land; verification 1–6 run; the override falsifier executed and recorded; disqualifier read.

**Skills:** `cognitive-doc-design`.

---

### T2 — `/akili-execute`: closure states, the `REVIEW_SKIPPED` record, `/goal`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Review | `full` — changes the closure-state enumeration other commands read; overrides (a) and (b) |
| Depends on | T1 |
| Requirements | FR-4 (record fields, three closure states, separate countability, `/goal`, the resume clause is T7's); FR-10 (backward compatibility); NFR-3, NFR-5 |
| Design refs | §5.4, §7.1 rows 4–6, §7.2 closure-state walk, DD-5, DD-6, DD-12 |

**Scope.** Edit `.claude/commands/akili-execute.md`:

- **Execution Log Format:** the `## REVIEW_SKIPPED: <Task ID>` record with its four fields; the final-status vocabulary gains `SKIPPED`; the distinctness sentence — a skip is a gate **never owed**, a waiver a gate **owed and lost**, and no report presents them as one.
- **Step 3:** closure accepts exactly three states; a task with none of the three stays not closable.
- **Step 5:** the `/goal` condition accepts the third state; **a skip is routine and auto-passes under `pre-approved`** (DD-6), while a **predicate mismatch is reported at the continue gate even under `pre-approved`** (DD-12).
- A spec with no `Review` field behaves exactly as today (FR-10).

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c "REVIEW_SKIPPED"` ≥ 4 (record heading, closure rule, `/goal` condition, final-status vocabulary). **2.** The closure sentence names all three states on one line. **3.** `grep -c "REVIEW_WAIVED"` ≥ 6 — the waiver's own text is not reduced. **4.** `git diff -U0 c87187f -- <file>` shows no `-` line inside the `REVIEW_WAIVED` record's field table. **5.** `grep -n "pre-approved"` — a hit stating the skip auto-passes **and** a hit stating the mismatch is reported regardless |
| Falsifier | At `c87187f`: check 1 reads **0** (run), check 3 reads **6** (run). For 4: reword a waiver field → a `-` line appears in that table. For 2: leave the closure rule naming two states → the three-state grep fails |
| Red run | `n/a (no test gate)` |
| Disqualifier | **Read the record and the closure rule:** if `REVIEW_SKIPPED` is introduced as a flag or variant of `REVIEW_WAIVED`, DD-5 is violated and the waiver count stops meaning "gates lost" — stop. If the `/goal` condition is widened to accept "any closed task", the human-gate protection is lost with every grep green |
| Consumers | `/akili-resume` and `kaizen` read this enumeration — **T7 owns both**; the mirrors restate closure prose — T8 owns them. Walked in design §7.2 |

**Pre-review sweep.** `grep -n "PASS or \|PASS nor \|not closable" .claude/commands/akili-execute.md` — every surviving two-state phrasing updated.

**Done.** Four scope bullets land; verification 1–5 run; disqualifier read.

**Skills:** `cognitive-doc-design`.

---

### T3 — `leader.md`: the amended collapse paragraph, thresholds, model and effort recording

| Field | Value |
|---|---|
| Status | `[~]` |
| Size | M |
| Review | `full` — **reverts delivered behavior** (override d) and edits the methodology's stated correctness guarantee |
| Depends on | T1 |
| Requirements | FR-8 (raise freely, never lower below the predicate; the amended paragraph keeps the efficiency prohibition and the named bias); FR-7 (Implementer defaults to T2, escalations recorded); NFR-2 |
| Design refs | §5.7, §7.1 rows 7–8, DD-8, §12 reversion-challenge outcome |

**Scope.** Edit `.claude/templates/leader.md`:

- **The *Reviewer is not self-verification* paragraph:** amended **in place**, keeping both surviving halves — the prohibition on collapsing for efficiency, and the named rationalization ("I already verified this, the Reviewer is redundant") — and adding the predicate-cleared skip as a **third, distinct act** that cites the Step 2.3 block. The reader must meet the prohibition before the permission.
- **Delegation Discipline:** the Leader records its Implementer model and effort choice with a one-line reason when it escalates above T2, in the same shape skill deviations are already recorded.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c "never collapse it"` = 1 — the phrase survives, unchanged from baseline. **2.** `grep -c "I already verified this"` = 1 — the named bias survives. **3.** `grep -c "Review intensity"` ≥ 1 — the block is cited by name. **4.** `git diff -U0 c87187f -- <file>` shows no `-` line in the *Delegation Thresholds* table rows. **5.** No restatement: the four predicate conditions are **not** re-listed here (`grep -c "deterministic"` = 0) |
| Falsifier | At `c87187f`: check 1 reads **1** and check 2 reads **1** (both run), so a deletion is detectable; check 3 reads **0**, so it fails today. For 5: copy the predicate into `leader.md` → the count moves off 0 and NFR-2 is caught |
| Red run | `n/a (no test gate)` |
| Disqualifier | **Read the whole paragraph.** If the permission is stated before the prohibition, or the two are split into separate paragraphs, DD-8 and §12's challenge outcome are violated with every grep green. If the amendment deletes rather than keeps the rationalization sentence, the one line naming the bias the Reviewer exists to catch is gone — stop |
| Consumers | `none (no shared symbol changed)` — `reviewer.md` is T4's; the mirrors are T8's |

**Pre-review sweep.** Read the Delegation Ceiling section whole: the amended paragraph must not contradict "Never delegate your own verification" or the ceiling's other rows.

**Done.** Two scope bullets land; verification 1–5 run; disqualifier read; the paragraph read whole aloud in the report.

**Skills:** `cognitive-doc-design`.

---

### T4 — `reviewer.md`: depth bands with effort ceilings

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Review | `checklist` — defines an obligation the Reviewer executes; override (a) |
| Depends on | T1 |
| Requirements | FR-6 (category column, effort ceiling per band, categories are depth guidance only, sub-50-LOC cannot exceed `medium` absent an override) |
| Design refs | §5.5, §7.1 row 9, DD-2 |

**Scope.** Edit `.claude/templates/reviewer.md`'s depth-mode table: add a category column and an **effort ceiling** per band; state that categories guide depth and never decide whether a review happens, citing the Step 2.3 block for that decision.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c -i "effort ceiling"` ≥ 1. **2.** The three existing LOC bands survive: `grep -c "< 50 LOC"` = 1, `"50–200 LOC"` = 1, `"> 200 LOC"` = 1. **3.** `grep -c "never decide"` ≥ 1 or equivalent clause present on reading. **4.** `git diff --numstat c87187f -- <file>` touches only the depth section |
| Falsifier | At `c87187f`: check 1 reads **0** and check 2 reads **1 / 1 / 1** (all run). For 2: replace a band instead of extending it → its count drops to 0 |
| Red run | `n/a (no test gate)` |
| Disqualifier | **Read the table:** if a category is given power to decide whether a review runs, DD-2 is violated with every grep green |
| Consumers | `none (no shared symbol changed)` — the Leader's brief cites these bands; T1's block owns the existence decision |

**Pre-review sweep.** Read the mode table and the paragraph beneath it whole: the "excellent eight-hundred-line review of a twenty-eight-line diff" warning must still read coherently beside the new ceilings.

**Done.** One scope bullet lands; verification 1–4 run; disqualifier read.

**Skills:** `cognitive-doc-design`.

---

### T5 — `/akili-specify`: the `Review` field and the Verification Checklist

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Review | `full` — defines a task field every future spec author executes; override (a) |
| Depends on | T1 |
| Requirements | FR-5 (four values, one-line reason, `skip-eligible` as a claim to be proved, absent-value `checklist`, the skip list visible at the Step 3.3 gate via **both** the presentation list and a checklist item); FR-10 |
| Design refs | §5.6, §7.1 rows 10–11, DD-7 |

**Scope.** Edit `.claude/commands/akili-specify.md`:

- **Step 3.2 task-field list:** the `Review` field with its four values and its absent-value rule, stated so `skip-eligible` reads as a **claim the task must prove at execute time**, never as an instruction to skip. Cites the Step 2.3 block; restates no predicate condition.
- **Step 3.3 presentation list:** a bullet naming every `skip-eligible` task with its reason, so the user sees the list **at** the gate and can reject the classification there. *(Added during execution, 2026-09-19 — Leader scope extension approved by the user; the checklist below runs after the gate and cannot deliver FR-5's scenario alone.)*
- **Verification Checklist:** one matching item requiring every `skip-eligible` task to be named with its reason at the Step 3.3 gate.
- **Zero hunks** in the Falsifiability block (NFR-1).

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c "skip-eligible"` ≥ 3 (field definition, Step 3.3 presentation bullet, checklist item). **2.** `grep -c "Review intensity"` ≥ 1 — the block cited by name. **3.** Falsifiability-block identity: the `sed` range from the `**Falsifiability**` line through rule 6 from `git show c87187f:<file>` and from the working file, `diff` empty. **4.** `grep -c "deterministic"` = 0 in this file — the predicate is not restated (NFR-2). **5.** The four values appear together on one line |
| Falsifier | At `c87187f`: check 1 reads **0** (run), so it fails today; check 3's ranges are identical today by construction. For 4: copy the predicate into Step 3.2 → count moves off 0. For 3: change one character in Falsifiability rule 3 → `diff` non-empty |
| Red run | `n/a (no test gate)` |
| Disqualifier | **Read the field's definition:** if `skip-eligible` is phrased as a decision rather than a claim, DD-7 is violated and a spec author can grant skips in advance — the exact failure the design exists to prevent. Stop |
| Consumers | `/akili-execute` Step 2.3 reads the field (T1/T2); `/akili-constitution` Step 7 item 3 describes it (T6); the mirror is T8's |

**Pre-review sweep.** `grep -n "verification fields" .claude/commands/akili-specify.md` — the four-field list and the new field must not be described as five verification fields; `Review` is a task field, not a verification field.

**Done.** Three scope bullets land; verification 1–5 run; disqualifier read.

**Skills:** `cognitive-doc-design`.

---

### T6 — `/akili-constitution` Step 7 item 3: the template description names the `Review` field

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Review | **`skip-eligible`** — this task **cites** an obligation defined in `/akili-specify` Step 3.2 and creates none; `Consumers: none`; its verification is three greps and a `numstat`, all deterministic. **The claim is proved at execute time by FR-1, not granted here.** If the Implementer does not execute the falsifier, a `checklist` review follows and the mismatch is reported (DD-12) |
| Depends on | T5 (the field must exist before the template can name it) |
| Requirements | FR-5 (constitution half); NFR-2 (cites, never redefines) |
| Design refs | §7.1 row 12, DD-7 |

**Scope.** Edit `.claude/commands/akili-constitution.md`, **Step 7 item 3 only**: the `task.md` template description gains a clause naming the `Review` field and citing `/akili-specify` Step 3.2 for its values and absent-value, in the same shape the item already uses for the four Verification fields.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c "Review"` in the Step 7 item 3 line ≥ 1 and `grep -c "skip-eligible"` ≥ 1. **2.** `git diff --numstat c87187f -- <file>` reads `1  1` — one line replaced. **3.** The four predicate conditions are not restated: `grep -c "deterministic"` = 0. **4.** `grep -c "skip-eligible"` file-wide = 1 — the clause is the only mention |
| Falsifier | At `c87187f`: check 1 reads **0** and check 4 reads **0** (both run), so each fails today. For 2: edit Step 7's intro as well → `numstat` exceeds `1 1`. For 3: copy the predicate into the clause → count moves off 0 |
| Red run | `n/a (no test gate)` |
| Disqualifier | A clause that says "a review field" without naming `/akili-specify` Step 3.2 cites nothing — check 1 catches the name but **read it** to confirm the citation. If the clause restates the four values' meaning rather than naming them, NFR-2 is violated |
| Consumers | `none (no shared symbol changed)` — the mirror is T8's |

**Done.** One line changed; verification 1–4 run; **the falsifier executed and its red observed and recorded** — required for the `skip-eligible` claim to be earned.

**Skills:** `cognitive-doc-design`.

---

### T7 — `/akili-resume` and `kaizen`: downstream consumers of the closure state

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Review | `full` — the kaizen clean-run predicate decides whether a retrospective runs at all; overrides (a) and (c) |
| Depends on | T2 (the record must exist before its consumers can read it) |
| Requirements | FR-4 (resume reports a skip as closed, never blocked); FR-9 (Measure rows for skipped tasks and escaped defects; the clean-run predicate must not call a run clean when it holds a skipped task with an escaped defect); NFR-3 |
| Design refs | §5.9, §7.1 rows 13–14, §7.2 closure-state walk |

**Scope.**

- `.claude/commands/akili-resume.md`: the closed-task reporting line gains `REVIEW_SKIPPED`, reported with its predicate basis as a **closed** task's last action, never as a *Blocked* item.
- `.claude/skills/kaizen/SKILL.md`: the Measure table gains a **`REVIEW_SKIPPED` by-task row** and an **escaped-defect row**; the **clean-run predicate** gains a clause so a run containing a skipped task with an escaped defect is never classified clean; the report template gains the matching rows.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c "REVIEW_SKIPPED" .claude/commands/akili-resume.md` ≥ 1. **2.** `grep -c "REVIEW_SKIPPED" .claude/skills/kaizen/SKILL.md` ≥ 2 (Measure row, report template). **3.** `grep -c -i "escaped defect" .claude/skills/kaizen/SKILL.md` ≥ 2. **4.** The clean-run sentence names the skipped-with-escaped-defect case: `grep -n "clean run\|every signal is clean"` and read the hit. **5.** `grep -c "REVIEW_WAIVED" .claude/skills/kaizen/SKILL.md` ≥ 2 — the waiver rows survive |
| Falsifier | At `c87187f`: checks 1–3 read **0 / 0 / 0** (all run), so each fails today. For 4: leave the clean-run predicate keyed only to waiver flags → a run with a skipped task and an escaped defect still reads clean; walk that case and observe it. For 5: replace the waiver row instead of adding beside it → count drops |
| Red run | `n/a (no test gate)` |
| Disqualifier | **Read the clean-run predicate whole.** If it now reads as clean for any run containing an escaped defect, FR-9 is violated with every grep green — this is the finding the design's own consumer walk exists to prevent, and it is the reason this task is not skippable |
| Consumers | `/akili-archive` Step 3 cites the skill's Measure table rather than restating it — **holds**, walked in design §7.2; `docs/skills/kaizen.md` mirrors in T8 |

**Pre-review sweep.** Read the Measure table and the clean-run paragraph whole: the new rows must not contradict the surviving "a clean spec teaches nothing new" sentence.

**Done.** Two scope bullets land; verification 1–5 run; disqualifier read.

**Skills:** `cognitive-doc-design`, `kaizen` (read as the artifact under edit, not run).

---

### T8 — Mirrors, `docs/model-routing.md`, CHANGELOG

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Review | `full` — the routing registry defines guidance others follow (override a); the CHANGELOG is a summary surface inheriting the artifacts' evidence bar (KZ-002) |
| Depends on | T2, T3, T4, T5, T6, T7 |
| Requirements | FR-7 (review intensity as a third dimension; the Verifier at T5); FR-11 (mirrors in their own register, README and flow only where a sentence turns false, CHANGELOG entry and classification); NFR-5 |
| Design refs | §5.8, §7.1 rows 15–17, §7.2 |

**Scope.**

- `docs/model-routing.md`: **review intensity** as a third dimension beside tier and effort; the evidence re-run mapped to **T5 Fast-Cheap** because it exercises no judgment; the Implementer's T2 default and the recording rule for escalations.
- Mirrors — `docs/commands/akili-execute.md`, `akili-specify.md`, `akili-constitution.md`, `akili-resume.md`, `docs/skills/kaizen.md` — describe the new behavior in their own register. **`docs/commands/akili-execute.md` restates closure-state prose at four sites** (judgment finding I-2); all four are brought to parity.
- `README.md` and `docs/flow.md`: **run the falsifying grep first** (KZ-002) — `grep -n -i "reviewer\|review" README.md docs/flow.md` scoped to sentences asserting a Reviewer always runs. Edit only a sentence a hit shows to be false; otherwise record "no change" with the command and its output.
- `CHANGELOG.md` `Unreleased`: replace the "No unreleased changes yet." note with the entry and the proposed classification **minor**.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c -i "review intensity" docs/model-routing.md` ≥ 1. **2.** `grep -c "REVIEW_SKIPPED"` ≥ 1 in each of the five mirrors. **3.** `grep -c "No unreleased changes yet" CHANGELOG.md` = 0 and `grep -n "review-intensity-routing" CHANGELOG.md` ≥ 1 under `Unreleased`. **4.** The four closure-state sites in `docs/commands/akili-execute.md` each name three states. **5.** Parity read: each mirror beside its command for the closure states, the predicate, and the `Review` field |
| Falsifier | At `c87187f`: check 1 reads **0**, check 2 reads **0** in all five mirrors, check 3 reads **1** and **0** (all run). A mirror left describing the Reviewer as unconditional keeps check 5 red on the read |
| Red run | `n/a (no test gate)` |
| Disqualifier | Checks 1–4 see literal strings only. A mirror that paraphrases the old behavior ("a Reviewer audits every task") survives them — **the parity read is the gate for that, and a PASS without it recorded is not a PASS** |
| Consumers | `none (no shared symbol changed)` |

**Done.** Four scope bullets land or are recorded "no change" with evidence; verification 1–5 run; parity read recorded per mirror.

**Skills:** `cognitive-doc-design`.

---

### T9 — Closure gate: the predicate walked against held-out records, global gates, packaging

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L |
| Review | `full` — produces **derived evidence a gate consumes**; override (c), the same class that failed twice in the `premise-ledger` run |
| Depends on | T8 |
| Requirements | NFR-1, NFR-2, NFR-3, NFR-4, NFR-5, NFR-6 (**the predicate must not qualify everything, and must not qualify any task whose review caught a real defect**), NFR-8; FR-9 (the trial's terms recorded); `requirements.md` §8 rows *rule a literal reader cannot execute* and *over-application* |
| Design refs | DD-11, §7.2, §13 |

**Scope.** No packaged file is edited. Produce `docs/specs/changes/review-intensity-routing/closure.md`.

- **Global gates.** (a) Frozen paths: `git diff --stat c87187f -- .claude/templates/implementer.md .claude/templates/tester.md .claude/skills/tdd bin scripts package.json` empty, plus the `akili-specify.md` Falsifiability-block identity check. (b) Defined once: the four predicate conditions appear only in `.claude/commands/akili-execute.md`. (c) Records distinct: `REVIEW_SKIPPED` and `REVIEW_WAIVED` are separately greppable and no surface sums them. (d) Held-out discipline: neither held-out spec is named in any shipped file. (e) Rules by mechanism: corpus and product names only inside parentheticals. (f) Backward compatibility read: no command fails on a spec with no `Review` field. (g) Packaging: `npm run verify:cli && npm run pack:dry-run && git diff --check`.
- **The predicate walk — the task's real gate.** Apply FR-1 and FR-2 to the **14 held-out task records** named in §2's held-out discipline, using only each task's own fields and its execution record. For each: qualifies or not, and which condition or override decided it. Then the two tests NFR-6 names:
  - **Inert test:** if all 14 qualify, the predicate is worthless — report it as a failure.
  - **Refutation test:** for every held-out task whose Reviewer returned a **real FAIL**, the predicate must say *review required*. Any such task that qualifies **refutes the predicate** and goes to the user as a spec gap under the Pivot Protocol, never patched by widening an override.
- **The trial's terms**, as approved by the user at the Step 3.3 gate: extent and abort criterion, recorded verbatim (FR-9, DD-10).

**Verification.**

| Field | Value |
|---|---|
| Command | Gates (a)–(g) each with its output recorded; the predicate walk complete for all 14 held-out records with a decision and its deciding condition per record; the inert and refutation tests each stated with their counts |
| Falsifier | **Executed, not named:** on a scratch copy of the shipped block, delete override (c) — *derived evidence* — and re-walk the held-out records that produce reports or counts; their decision must flip from *review required* to *qualifies*. A walk whose decisions do not move under that mutation was reading the tasks, not the text. Discard the copy |
| Red run | `n/a (no test gate)` |
| Disqualifier | The walk is **not evidence** if it uses any task record outside the 14 that carry the fields FR-1 reads, or if a decision is justified by the spec's own prose rather than by the task's fields. **A refuted predicate is reported, never repaired by adding an override** — that would be fitting the rule to the data it was meant to be tested against |
| Consumers | `none (no shared symbol changed)` |

**Done.** Gates (a)–(g) green with outputs recorded; 14 held-out records walked with their deciding condition; inert and refutation tests reported; the mutation falsifier executed and its flip recorded; the trial's terms recorded; budget actuals compared with design §13.

**Skills:** `cognitive-doc-design`.

---

## 3. Coverage — scenario and clause level

| Requirement · scenario or clause (quoted) | Owner |
|---|---|
| FR-1 · four conditions · "evaluated by the Leader against the Implementer's actual report, never against the plan" | T1 |
| FR-1 *one-line pointer edit that proved its gate* · "`AND IT MUST` still record the evidence re-run" · "`BUT NOT` skip when the falsifier was merely *named*" | T1; walked in T9 |
| FR-1 *one-line edit to a rule others execute* · "`BUT NOT` exempted because the diff is one line" | T1; walked in T9 |
| FR-1 *plan says skip, report does not earn it* · "`BUT NOT` recorded as a `REVIEW_SKIPPED`" · mismatch reported under `pre-approved` | T1, T2 (DD-12) |
| FR-2 · overrides (a)–(g) · "evaluated against **what the task does**" | T1; refutation test in T9 |
| FR-2 *derived evidence is never skippable* | T1; T9's mutation falsifier |
| FR-3 · duty · two modes · `VERIFIED`/`MISMATCH` · implicit FAIL · "SHALL NOT be waived by any category, predicate, mode, or approval setting" | T1, T2 |
| FR-3 *author reports green on a red check* · *skipped review still re-runs evidence* | T1, T2 |
| FR-4 · record fields · three closure states · separate countability · `/goal` | T2 |
| FR-4 · resume reports a skip as closed | T7 |
| FR-4 *a reader distinguishes the two records* | T2, T7; gate (c) in T9 |
| FR-5 · four values · absent-value · claim-not-guarantee · checklist item | T5 |
| FR-5 *the user sees the skip list before execution* | T5 |
| FR-5 · constitution half | T6 |
| FR-6 · category column · effort ceilings · "categories SHALL NOT decide whether a review happens" | T4 |
| FR-6 *a one-line diff does not draw a maximal sweep* | T4 |
| FR-7 · Implementer T2 default · reviewer ≠ Implementer · no same-model substitute · Verifier at T5 | T3 (recording), T8 (registry) |
| FR-7 *cheap tasks do not get a same-model reviewer* | T8 |
| FR-8 · raise freely · never lower · amended paragraph keeps both halves | T3 |
| FR-8 *efficiency is still not a reason* | T3 (disqualifier) |
| FR-9 · trial extent · escaped defects · falsifier rate · abort criterion · the 14-record limit | T7 (measure surfaces), T9 (terms recorded) |
| FR-9 *the trial produces a reportable negative* | T7 |
| FR-10 · backward compatibility | T2, T5; gate (f) in T9 |
| FR-11 · mirrors · README/flow only where false · CHANGELOG | T8 |
| NFR-1 | every task's scope discipline; gate (a) in T9 |
| NFR-2 | T3 check 5, T5 check 4, T6 check 3; gate (b) in T9 |
| NFR-3 | T2, T7; gate (c) in T9 |
| NFR-4 | gate (e) in T9 |
| NFR-5 | T2, T5; gate (f) in T9 |
| NFR-6 | **T9's inert and refutation tests** |
| NFR-7 | no task touches `implementer.md` or `tester.md`; gate (a) in T9 |
| NFR-8 | T1 (the duty's two modes are host-neutral) |

No requirement is cleared by citing a different one. Every `BUT` and `AND IT MUST` clause above is quoted from `requirements.md`.

## 4. Estimate and PR strategy

| Task | Shipped lines (est.) |
|---|---|
| T1 | ~35 |
| T2 | ~22 |
| T3 | ~8 |
| T4 | ~6 |
| T5 | ~10 |
| T6 | ~1 |
| T7 | ~12 |
| T8 | ~30 |
| T9 | 0 shipped · ~130 spec-local (`closure.md`) |
| **Total** | **~124 shipped** |

**PR strategy: single.** Well under ~400 lines, prose only, one definition with eight citing surfaces that must land together — a split would ship a closure state two commands cannot read. This repo commits to `master` per task with the `[SPEC:changes/review-intensity-routing]` prefix; one commit per task keeps each Reviewer diff inside the `< 50 LOC` checklist band except T1 and T8.
