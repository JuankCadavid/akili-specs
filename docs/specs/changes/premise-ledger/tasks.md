# Tasks: Premise Ledger

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/premise-ledger` |
| Depth | Standard |
| Status | Approved — user chose **Continue** at the Step 3.3 gate, 2026-09-19 |
| Date | 2026-09-19 |
| Source | `requirements.md` (approved), `design.md` (approved; budget §13: 7 tasks · ~150 shipped lines · 9 review rounds) |
| Baselines | Every count in a `Command` or `Falsifier` cell below was **run at `571edaf` before it was written** (KZ-changes--leader-brief-contract-2). Expected post-change outcomes are stated as thresholds the shipped text must meet, never as readings |
| Format precedent | `docs/specs/archive/2026-09-19-changes--leader-brief-contract/tasks.md` |
| Commit prefix | `[SPEC:changes/premise-ledger]` |

## 2. Task Graph

```
T1 (akili-specify.md: Minimum content item 11 + the Premise Ledger block)
 ├─→ T2 (akili-specify.md: Step 1.2 · 2.1 · 2.3 pointer · 2.5 · Verification Checklist)
 ├─→ T3 (judgment-day SKILL.md: Hard Rule · Integration row · version)
 ├─→ T4 (akili-propose.md: Bug Track · Blast Radius · cite-or-mark · checklist · report)
 └─→ T5 (akili-constitution.md: Step 7 item 2 clause)
 T2, T3, T4, T5 ──→ T6 (mirrors · flow.md · README check · CHANGELOG) ──→ T7 (closure: global gates · walkthrough · packaging)
```

T1 → T2 are **sequential** — same file. T3 ∥ T4 ∥ T5 after T1: each cites the block by the name T1 ships and touches a different file. T2 may run beside them. T6 mirrors final text. T7 is the global gate. No circular dependencies.

**Global verification caveat.** Every grep below is a **presence-assertion**: it proves text landed, not that an architect or a judge following it behaves correctly. Prose executability has no automated check (`requirements.md` §8, accepted risk). The behavioral substitute is T7's walkthrough. A task may not report PASS on grep-green alone where its Done criteria name a read.

**Grep hazard (all tasks).** Run from the repo root. Exclude `.claude/worktrees/` (a stale `authorship` worktree holds pre-change copies of every file this spec edits), `docs/specs/archive/`, and `docs/specs/changes/premise-ledger/`. **Environment path that passes for the wrong reason:** a grep that walks into the worktree reports the old text as a hit or the new text as missing — every recursive grep carries `--exclude-dir=worktrees`.

**Held-out discipline (all tasks — DD-12, DD-13).** No shipped file may name any of these slugs: `target-tooltip`, `toc-unmapped-orange-notes`, `emerging-creation-hide-indicator-ui`, `result-sidebar-collapse-mobile`, `kp-project-match`, `kp-cgspace-browse`, `global-search-prod-deploy`. The Implementer briefs for T1–T6 **do not list these cases' content** — only the slugs to avoid. Corpus entries a shipped parenthetical may cite are the ones `requirements.md` scenarios cite.

**Pre-review restatement sweep (T1–T6 — KZ-changes--kaizen-loop-closure-2).** Before the Reviewer is spawned, the Leader greps the edited file for the superseded phrasing listed per task, and reads whole every paragraph that received an insertion (KZ-changes--leader-brief-contract-1).

**Scope discipline (all tasks — NFR-1).** Zero hunks in `.claude/commands/akili-execute.md`, `.claude/commands/akili-test.md`, `.claude/templates/`, `.claude/skills/tdd/`, `bin/`, `scripts/`, `package.json`, and the Falsifiability block of `akili-specify.md`. Any hunk there is a FAIL regardless of content.

---

### T1 — `/akili-specify` Step 2.2: *Minimum content* item and the Premise Ledger block

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L |
| Depends on | none |
| Requirements | FR-1 statement, row-shape table, three bullets, and scenarios *sibling as target* (`AND IT MUST` be written before any DD that builds on it · `BUT NOT` satisfied by a component name or field resemblance), *prose-only* (`BUT NOT` omit the section), *trivia*; FR-2 class table, four bullets, and scenarios *shared lifecycle hook* (`AND IT MUST` enumerate all · `BUT NOT` stand with no enumeration), *versioned path* (`BUT NOT` cite only the function's own `file:line`), *changed DOM hook* (`BUT NOT` derive consumers from co-located files), *backend-only*; FR-3 (a)–(e) and scenarios *stronger pattern* (`BUT NOT` record a pattern other than the one executed), *label* (`BUT NOT` cite the label), *user-confirmed* (`BUT NOT` written as verified), *data facts* (`BUT NOT` cite a schema as proof data is written); FR-4 four bullets and scenarios *unreachable environment* (`BUT NOT` dropped from the ledger), *consumer row reaches the task*; NFR-3, NFR-4, NFR-6 (marker bytes) |
| Design refs | §5.1–§5.5, §7.1 rows 1–2, DD-1..DD-6, DD-12 |

**Scope.** Edit `.claude/commands/akili-specify.md`, by section (never by line):

- **Step 2.2 *Minimum content*:** append item 11, `Premise Ledger`. Items 1–10 keep their numbers and text.
- **Step 2.2 *Guidelines*,** after the *New enumerated values walk their consumers* bullet and before *Code Suppression*: add the **Premise Ledger** block. It carries, in this order: what a premise is; the **dependence test** as the admission rule; "written first" as an order of work; the seven-column row shape with each absent-value; the count line and the trigger line; the stated-empty form `Premise Ledger: none — <reason>`; the seven classes with `other` as the stated fall-through (it covers a standing project rule); the three triggers with what each required row must contain, and the line `Blast-radius triggers: none apply — <reason>`; citation rules (a)–(e), each with a one-line falsifier; `UNVERIFIED` with the marker text **byte-identical** to `/akili-execute` Step 2.2 clause (c), *Settled by* naming a check and one owner, `user-stated` for a person's statement; the hand-off — `consumer` rows copied into the owning task's `Consumers` field beside what Step 3.2's Consumer Sweep finds, an `UNVERIFIED` row settled as its owning task's first step with the outcome in Done criteria, a refuted premise to the Pivot Protocol, **all other classes have no hand-off**; every depth carries the same shape with no minimum row count; the Bug Mode source of rows including the branch for a proposal with no Blast Radius section.
- Rules are phrased by mechanism. Corpus entries appear only inside parentheticals, and only entries `requirements.md` scenarios cite.

**Verification** (repo root).

| Field | Value |
|---|---|
| Command | On `.claude/commands/akili-specify.md`: **1.** `grep -c "Premise Ledger"` ≥ 3 and `grep -n "^11\. Premise Ledger"` = 1 hit. **2.** `grep -c "UNVERIFIED — confirm at source before relying on it"` ≥ 1, and the string is byte-identical to the one at `akili-execute.md` Step 2.2 clause (c) (`diff` of the two `grep -o` outputs is empty). **3.** Each of the seven backticked class tokens — `location`, `existence`, `data-env`, `other`, `live-path`, `shared-state`, `consumer` — has ≥ 1 hit. **4.** `grep -c "none apply"` ≥ 1, `grep -c "Premise Ledger: none"` ≥ 1, `grep -c "user-stated"` ≥ 1, `grep -c "dependence test"` ≥ 1. **5.** Falsifiability-block identity: the `sed` range from the `**Falsifiability**` line through rule 6, taken from `git show 571edaf:<file>` and from the working file, `diff` empty (8 lines each). **6.** `sed -n '/^Minimum content:/,/^Guidelines:/p'` on the Step 2.2 list shows items 1–10 unchanged. **7.** Held-out slug grep over the file = 1 hit, the pre-existing `programme-results-created-by-filter` in the Consumer Sweep rule, and none of the seven slugs in the hazard note |
| Falsifier | At `571edaf` every token in 1–4 counts **0** (run: thirteen tokens, thirteen zeros), so each grep fails on current text. For 5: change one character inside rule 3 → `diff` non-empty. For 2: type the marker with a hyphen or an en dash instead of the em dash → the byte `diff` is non-empty while `grep -c UNVERIFIED` still passes. For 6: insert the ledger as item 3 → items 3–10 shift and the list diff shows it |
| Red run | `n/a (no test gate)` |
| Disqualifier | Greps 1–4 count words. Read the block: if the trigger table lacks what a required row **must contain**, or the hand-off sentence omits "all other classes have no hand-off", or the Bug Mode branch for a proposal without Blast Radius is missing, FR-2 / FR-4 / design §5.5 are violated with every grep green. If the block names severities, it has taken the judge rule's content (DD-8) — stop |
| Consumers | `none (no shared symbol changed)` — prose consumers walked in design §7.2; T3, T4, T5 cite the block's name |

**Pre-review sweep.** `grep -n -i "ledger" .claude/commands/akili-specify.md` — every hit reads "Premise Ledger". Read the *New enumerated values* bullet and *Code Suppression* whole: neither lost a word.

**Done.** Both scope bullets land; verification 1–7 run with the disqualifier read; the Falsifier for check 5 **executed** on a scratch copy (mutate, observe `diff` red, discard the copy) and recorded.

**Skills:** `cognitive-doc-design`.

---

### T2 — `/akili-specify`: Step 1.2, Step 2.1, Step 2.3 pointer, Step 2.5, Verification Checklist

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-5 five bullets and scenario *open High-impact premise* (`AND` the user can still choose Continue · `BUT NOT` hide the row inside the document only); FR-6 specify half (Step 1.2 cites or marks; `BUT NOT` a bare fact; cites the block, restates nothing); FR-8 second and third bullets; FR-4 fourth bullet (hand-off named in the checklist, Falsifiability block untouched) |
| Design refs | §5.6, §7.1 rows 3–7, DD-6, DD-10, DD-11 |

**Scope.** Edit `.claude/commands/akili-specify.md`:

- **Step 1.2 guidelines,** after the *numbers from images are not sources* bullet: one bullet — a claim about current behavior in *System Context* carries a citation as run or the `UNVERIFIED` marker inline; at Phase 2 the ones that pass the dependence test become rows; rules are in the Step 2.2 *Premise Ledger* block.
- **Step 2.1:** one paragraph — premises are verified while the code is open; a delegated scout returns citations as run; in Bug Mode with no Blast Radius in the proposal, the four checks run here.
- **Step 2.3:** replace only the phrase "the opt-in Step 2.4 pass" with a pointer to the **Review Design** option of Step 2.5 — *Present & Approve*.
- **Step 2.5:** the summary sentence gains the ledger's count line, every `UNVERIFIED` row in full, and the recommendation sentence for an open `High` row. The five-option menu and the findings menu are unchanged. One clause states that `pre-approved` adds no stop.
- **Verification Checklist:** four items — ledger present or stated-empty; every row cited or `UNVERIFIED` with an owner; every triggered class has a row or the "none apply" line; every `UNVERIFIED` row is owned by a named task or check **and `consumer` rows appear in their task's `Consumers` field**.

**Verification.**

| Field | Value |
|---|---|
| Command | On the same file: **1.** `grep -c "opt-in Step 2.4 pass"` = 0. **2.** `grep -n "Step 2.5"` — a hit inside the Step 2.3 paragraph that also contains "Review Design". **3.** `grep -c "Premise Ledger"` rises by ≥ 4 over T1's recorded count — at least one hit each in Step 1.2, Step 2.1, Step 2.5, and the Verification Checklist, confirmed by reading where each hit sits. **4.** The five Step 2.5 menu lines and the five findings-menu lines are byte-identical to `571edaf` (`diff` of the two `sed` ranges empty). **5.** T1's Falsifiability-block identity check, re-run. **6.** `git diff -U0 571edaf -- <file>` shows, inside Step 2.3, exactly one changed line |
| Falsifier | At `571edaf`: check 1 reads **1** (run), so it fails today. For 4: add a sixth menu option → `diff` non-empty. For 6: reflow the Step 2.3 paragraph → more than one changed line |
| Red run | `n/a (no test gate)` |
| Disqualifier | If Step 2.5's new sentence says an open `High` row "requires" or "blocks until" review, FR-5 is violated with every grep green — read it. If the Step 1.2 bullet restates a citation rule instead of citing the block, NFR-3 is violated |
| Consumers | `none (no shared symbol changed)` — `judgment-day`'s Integration row points at Step 2.5; T3 owns it |

**Pre-review sweep.** `grep -n -E "Step 2\.[345]" .claude/commands/akili-specify.md` — read every hit; each step number names the step its sentence describes. Read the Step 2.3 and Step 2.5 paragraphs whole.

**Done.** Five scope bullets land; verification 1–6 run; disqualifier read.

**Skills:** `cognitive-doc-design`.

---

### T3 — `judgment-day`: ledger-first Hard Rule, Integration row, version

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-7 three actions, severity table (six rows), three bullets, and scenarios *plausible premises* (`BUT NOT` accept a premise because requirements and design agree), *judge without a shell* (`BUT NOT` count the row as confirmed); FR-8 first and third bullets; NFR-5, NFR-6 |
| Design refs | §5.7, §7.1 rows 8–10, §7.2 severities walk, DD-7, DD-8 |

**Scope.** Edit `.claude/skills/judgment-day/SKILL.md`:

- **Hard Rules,** directly after the count-contrast rule: one rule — before any other reading, judges re-run or re-read every Premise Ledger citation at the source, try to refute every `UNVERIFIED` row with their own search, and look for depended-on premises with no row; the six-row severity table from FR-7; read-only means writing nothing — reading, searching, and (where the host allows) reading history are within it; a row a judge could not re-run is reported `not re-run`, never as confirmed; the two-judge protocol is unchanged, and a one-judge contradiction is recorded as suspect **with its command as run**. Row shape and triggers are cited as `/akili-specify` Step 2.2 — *Premise Ledger* block, not restated.
- **AKILI-SPECS Integration,** first row: the moment reads `/akili-specify` Step 2.5 — *Present & Approve*, **Review Design** option; the usage cell gains "the Premise Ledger first".
- **Frontmatter:** `version` 1.7 → 1.8.

**Verification.**

| Field | Value |
|---|---|
| Command | On the skill file: **1.** `grep -c "Step 2\.3"` = 0 and `grep -c "Step 2\.5"` ≥ 1. **2.** `grep -n -i "ledger"` — the six hits present at `571edaf` (three "frozen ledger", one References link line, one "findings ledger" paragraph, one "findings ledger" adaptation rule) are unchanged, and every added hit reads "Premise Ledger". **3.** `grep -c "not re-run"` ≥ 1. **4.** No backticked class token (`live-path`, `shared-state`, `data-env`) appears in the file. **5.** `git diff -U0 571edaf -- <file>` shows no `-` line in Decision Gates, Execution Steps, or Output Contract. **6.** `grep -n 'version: "1.8"'` = 1 hit |
| Falsifier | At `571edaf`: check 1 reads **1 / 0**, check 3 reads **0** (all run) — each fails today. For 2: write "attack the ledger first" → an added hit without "Premise". For 4: list the three blast-radius classes by token in the rule → restatement caught |
| Red run | `n/a (no test gate)` |
| Disqualifier | If the rule lets one judge's contradiction trigger an auto-fix, the protocol changed (FR-7, non-goal) with every grep green — read the rule against the Decision Gates table. If "read-only" is defined in a new section rather than the same bullet, DD-7 is violated |
| Consumers | `kaizen` Measure row *Severe judgment-day findings* and `/akili-specify` Step 2.5 findings menu — both walked in design §7.2 as **holds**; neither file is edited. `docs/skills/judgment-day.md` mirrors in T6 |

**Pre-review sweep.** Read the Hard Rules list whole: the new rule and the count-contrast rule do not contradict each other on what "in-scope documents" means.

**Done.** Three scope bullets land; verification 1–6 run; disqualifier read.

**Skills:** `judgment-day` (read as the artifact under edit), `cognitive-doc-design`.

---

### T4 — `/akili-propose`: Bug Track run order, Blast Radius section, cite-or-mark, checklist, report

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-9 four-check table, four bullets, and scenarios *ticket closed by a teammate* (`AND` a fixing hit ends the proposal · `BUT NOT` search only the current branch), *cosmetic bug* (*Already fixed?* still runs; others may read `n/a — <reason>`); FR-6 propose half and scenario *proposal states current behavior* (`BUT NOT` a bare fact) |
| Design refs | §5.8, §7.1 rows 11–14, DD-9, DD-10, §12 |

**Scope.** Edit `.claude/commands/akili-propose.md`:

- **Bug Track bullets:** the *impact/scope* bullet becomes the Blast Radius bullet — four recorded checks, with the run order (*Already fixed?* first, before root-cause work; *Live path?* as part of confirming the root cause; the two enumerations after) and the two stop outcomes (a fix exists → report and stop, no spec; code off the live path → root cause not confirmed, diagnosis reopens).
- **Step 2,** after the structure list: one sentence — *Problem / Current Behavior* claims carry a citation as run or the `UNVERIFIED` marker, per the Step 2.2 *Premise Ledger* block of `/akili-specify`. All tracks.
- **Bug Diagnosis template:** `### Impact & Scope` → `### Blast Radius` — the four checks, each with its citation as run or the marker, and its result; *Already fixed?* is a history query over the target files **and** the ticket ID **across all branches**; `n/a` carries its reason and *Already fixed?* is never `n/a`; the existing data-integrity and security line stays beneath.
- **Review Checklist:** one item for a bug — the four checks are recorded, *Already fixed?* first. **Report To User:** the bug clause names the Blast Radius result.

**Verification.**

| Field | Value |
|---|---|
| Command | On the command file: **1.** `grep -c "Impact & Scope"` = 0 and `grep -c "impact/scope"` = 0. **2.** `grep -n -i "blast radius"` — ≥ 4 hits (Bug Track, template heading, checklist, report), all naming the same section. **3.** `grep -c -i "already fixed"` ≥ 2; one hit's sentence contains "first". **4.** `grep -c "UNVERIFIED — confirm at source before relying on it"` ≥ 1, byte-identical to `akili-execute.md`'s. **5.** `grep -c "Premise Ledger"` ≥ 2, each in a citing sentence. **6.** `grep -n "data integrity"` = 1 hit, inside the Blast Radius section |
| Falsifier | At `571edaf`: check 1 reads **1 / 1**, check 2 reads **1**, checks 3–5 read **0** (all run) — each fails today. For 6: drop the data-integrity line in the rename → 0 hits. For 2: add the block beside an untouched `Impact & Scope` → check 1 stays 1 |
| Red run | `n/a (no test gate)` |
| Disqualifier | If the template says "check `git log`" without "all branches" or without the ticket ID, the *ticket closed by a teammate* scenario's `BUT NOT` is unmet with every grep green — read it. If the section restates citation rules (a)–(e), NFR-3 is violated |
| Consumers | Four prose readers of the old heading (design §11 P-6): two in this file (this task), `docs/commands/akili-propose.md` and `docs/flow.md` (T6). `/akili-specify` Bug Mode reads "confirmed root cause + reproduction" and never the heading — holds |

**Pre-review sweep.** `grep -n -i "impact" .claude/commands/akili-propose.md` — read every hit. Read the Bug Track paragraph whole after the edit: the bullets still run symptom → reproduction → root cause → fix strategy, with the run-order sentence contradicting none of them.

**Done.** Four scope bullets land; verification 1–6 run; disqualifier read.

**Skills:** `cognitive-doc-design`, `systematic-debugging` (read for the Bug Track's vocabulary, not run).

---

### T5 — `/akili-constitution` Step 7: the `design.md` template description names the ledger

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Depends on | T1 |
| Requirements | FR-10 statement and scenario *new project constitution* (`BUT NOT` redefine classes or triggers locally) |
| Design refs | §7.1 row 15, DD-1 |

**Scope.** Edit `.claude/commands/akili-constitution.md`, **Step 7 item 2** only: the description gains a clause — the template includes the Premise Ledger section named in `/akili-specify` Step 2.2's *Premise Ledger* block, with its row shape and absent-values, in the shape item 3 uses for the Verification fields.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c "Premise Ledger" .claude/commands/akili-constitution.md` ≥ 1, first hit on the Step 7 item 2 line. **2.** `git diff --numstat 571edaf -- <file>` reads `1  1` (one line replaced). **3.** No backticked class token in the file |
| Falsifier | At `571edaf` check 1 reads **0** (run). For 2: edit Step 7's intro as well → more than one line. For 3: list the classes in the clause |
| Red run | `n/a (no test gate)` |
| Disqualifier | A clause that says "a premises table" without the block's name passes nothing above but also cites nothing — check 1 catches it; if the clause instead copies the seven columns, check 3 does not — read it |
| Consumers | `docs/commands/akili-constitution.md` lists the templates (T6) |

**Done.** One line changed; verification 1–3 run.

**Skills:** `cognitive-doc-design`.

---

### T6 — Mirrors, `docs/flow.md`, README check, CHANGELOG

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | T2, T3, T4, T5 |
| Requirements | FR-11 three bullets and scenario *post-sweep read*; NFR-3 (mirrors cite, never redefine); NFR-8 |
| Design refs | §7.1 rows 16–19, §11 P-6, P-7 |

**Scope.**

- `docs/commands/akili-specify.md`: the design phase gains the Premise Ledger in its own register; the approval step shows the counts. Class names may appear here and nowhere else outside the command.
- `docs/commands/akili-propose.md`: the Bug Track paragraph's "impact/scope" becomes the four-check Blast Radius, *already fixed* first; current-behavior claims cite or mark.
- `docs/commands/akili-constitution.md`: the `general-setup/design.md` line names the ledger.
- `docs/skills/judgment-day.md`: Core Rules gains the ledger-first rule in one line.
- `docs/flow.md`: the Bug walkthrough "captures" line — "impact/scope" → "blast radius".
- `README.md`: **run the falsifying greps first** (KZ-002) — `grep -n -i "impact/scope\|impact & scope\|Step 2\.[345]\|premise" README.md`. Edit only a sentence a hit shows to be false; otherwise record "no change" with the command and its output.
- `CHANGELOG.md` `Unreleased`: replace the "No unreleased changes yet." note with the entry (Added: Premise Ledger, ledger-first judging, Blast Radius; Fixed: two stale step pointers) and the proposed classification **minor**.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -rn -i "impact/scope\|impact & scope" .claude docs README.md --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger` = 0. **2.** `grep -c "Premise Ledger"` ≥ 1 in each of the four mirrors. **3.** `grep -c "No unreleased changes yet" CHANGELOG.md` = 0 and `grep -n "premise-ledger" CHANGELOG.md` ≥ 1 under `Unreleased`. **4.** Held-out slug grep over `docs/commands docs/skills docs/flow.md README.md CHANGELOG.md` = 0. **5.** Parity read: each mirror beside its command for the Bug Diagnosis contents, the design contents, and the Review Design step |
| Falsifier | At `571edaf`: check 1 reads **4** (`akili-propose.md` ×2, its mirror, `flow.md` — run as design §11 P-6); check 2 reads **0** in all four mirrors; check 3 reads **1** and **0**; the README grep in scope returns no hit today (all run). A mirror left saying "impact/scope" keeps check 1 above 0 |
| Red run | `n/a (no test gate)` |
| Disqualifier | Check 1 sees literal strings only. A mirror that paraphrases the old content ("what else the root cause touches") survives it — the parity read is the gate for that, and a PASS without it recorded is not a PASS |
| Consumers | `none (no shared symbol changed)` |

**Done.** Seven scope bullets land or are recorded "no change" with evidence; verification 1–5 run.

**Skills:** `cognitive-doc-design`.

---

### T7 — Closure gate: global greps, literal-reader walkthrough, packaging

| Field | Value |
|---|---|
| Status | `[~]` — blocked: the closure gate fired. Gates (a)–(g) green; the literal-reader walkthrough fails this task's own Disqualifier. See `## Pivot Record: T7` in `execution.md` — user decision pending |
| Size | L |
| Depends on | T6 |
| Requirements | NFR-1, NFR-2, NFR-3, NFR-4, NFR-6, NFR-7; `requirements.md` §8 rows *rule a literal reader cannot execute* and *ceremony*; FR-2 last bullet (class × reader enumeration); proposal success criteria 1–6 |
| Design refs | DD-13, §7.2, §13 |

**Scope.** No packaged file is edited. Produce `docs/specs/changes/premise-ledger/walkthrough.md`.

- **Global gates.** (a) Frozen paths: `git diff --stat 571edaf -- .claude/commands/akili-execute.md .claude/commands/akili-test.md .claude/templates .claude/skills/tdd bin scripts package.json` — empty; T1's Falsifiability-block identity check. (b) Defined once: the backticked tokens `live-path`, `shared-state`, `data-env` appear only in `.claude/commands/akili-specify.md` and `docs/commands/akili-specify.md`. (c) Marker bytes: every `UNVERIFIED —` string under `.claude` and `docs/commands` is byte-identical to `/akili-execute`'s. (d) Held-out slugs: 0 added hits anywhere shipped. (e) Rules by class: `grep -nE "onecgiar|PRMS|CGSpace|Cypress|Angular|Jest|Cognito|driver\.js"` over the four edited packaged files — every hit inside a parenthetical. (f) Class × reader enumeration: read the block, Step 2.5, the judge rule — all seven classes and the `UNVERIFIED` state have a stated behavior at each of the three readers. (g) Packaging: `npm run verify:cli && npm run pack:dry-run && git diff --check`.
- **Walkthrough.** A **fresh-context literal reader** — not the context that implemented T1–T4 — is given only the shipped text and, per case, the design situation as the corpus entry describes it *before* the defect was found. For each case it quotes the general sentence, **parenthetical stripped**, that demands the row or check that would have exposed the premise, and gives a verdict.

| Set | Cases | Surface judged |
|---|---|---|
| Cited | `changes--kp-report-modal-auto-create` · `bugfix--evidence-storage-link-validation` · `changes--realtime-section-completion` · `changes--sidebar-toggle-consolidation` · `changes--my-work-board` | the block |
| Cited | `changes--bilateral-review-ux-polish` | judge rule |
| Cited | `bugfix--innovation-dev-p25-save-500` | Blast Radius |
| **Held out** | `results--intermediate-outcome-aow-visibility--target-tooltip` · `bugfix--toc-unmapped-orange-notes` · `changes--emerging-creation-hide-indicator-ui` · `changes--result-sidebar-collapse-mobile` · `changes--kp-project-match` | the block |
| **Held out** | `changes--kp-cgspace-browse` | judge rule |
| **Held out** | `bugfix--global-search-prod-deploy` | Blast Radius |
| Negative controls | a prose-only design · a one-caller private-function change | the block — must demand **zero** blast-radius rows |

- **Verdicts:** `DEMANDED` (sentence quoted) · `NOT DEMANDED` · `INCONCLUSIVE`. For each retro-fitted design the walkthrough also reports the **row count** the text would require (NFR-2), beside this spec's own thirteen.
- **Expected outcomes are not written here.** They are derived from the shipped text when this task runs. One case is known to be hard: in `result-sidebar-collapse-mobile` the false premise lived in a task's selector, not the design, so `NOT DEMANDED` there is a finding to report, not to argue away.

**Verification.**

| Field | Value |
|---|---|
| Command | Gates (a)–(g) each with its output recorded; the walkthrough table complete for all 14 cases and 2 controls |
| Falsifier | **Executed, not named:** on a scratch copy of the shipped block, delete the `shared-state` trigger row and re-walk `bugfix--toc-unmapped-orange-notes` — the verdict must flip from its recorded value to `NOT DEMANDED`. A walkthrough whose verdict does not move under that mutation was reading the case, not the text. For gate (b): paste the class list into the judge rule on a scratch copy → gate red |
| Red run | `n/a (no test gate)` |
| Disqualifier | The walkthrough is **not evidence** if the reader was shown the entry's lesson text, the requirements' scenarios, or this spec's design — it must see the shipped files and the pre-defect situation only. A verdict justified by a parenthetical example is struck. Any `INCONCLUSIVE` or any held-out `NOT DEMANDED` other than the known-hard case **fails this task** and goes to the user as a spec gap (Pivot Protocol), never patched by widening a task |
| Consumers | `none (no shared symbol changed)` |

**Done.** Gates (a)–(g) green with outputs recorded; 16 walkthrough rows with quoted sentences; the falsifier executed and its flip recorded; row counts reported; budget actuals compared with design §13.

**Skills:** `cognitive-doc-design`.

---

## 3. Coverage — scenario and clause level

| Requirement · scenario or clause (quoted) | Owner |
|---|---|
| FR-1 · "SHALL list the **Premise Ledger** in *Minimum content*" · row-shape table · dependence test · "An absent section is never a valid empty state" · every depth | T1 |
| FR-1 *sibling as target* · "AND IT MUST be written before any design decision that builds on it" · "BUT it must NOT be satisfied by the component's name or a field-list resemblance" | T1 (rule c, "written first"); walked in T7 |
| FR-1 *prose-only* · "BUT it must NOT omit the section" · *trivia* | T1; T7 negative control |
| FR-2 · class table · "none apply" line · sibling enumeration · dispatch chain | T1 |
| FR-2 · "Every class value SHALL be walked against its three readers" | design §7.2; verified T7 gate (f) |
| FR-2 *shared lifecycle hook* · "AND IT MUST enumerate all of them, not a sample" · "BUT it must NOT stand as "no section has a save side effect" with no enumeration" | T1; T7 |
| FR-2 *versioned path* · "BUT it must NOT cite only the function's own `file:line`" | T1; T7 |
| FR-2 *changed DOM hook* · "BUT it must NOT derive the consumer list from the files that sit beside the changed component" | T1; T7 |
| FR-2 *backend-only* | T1; T7 negative control |
| FR-3 (a)–(e) | T1 |
| FR-3 *stronger pattern* · "BUT it must NOT record a pattern other than the one executed" | T1 (rules b, e) |
| FR-3 *label* · "BUT it must NOT cite the label" · *user-confirmed* · "BUT it must NOT be written as verified on the strength of the statement" · *data facts* · "BUT it must NOT cite a schema or a document as proof that data is written" | T1 (rule d); *data facts* walked in T7 |
| FR-4 · owner named · first-step settling · `consumer` → `Consumers` · one owner per sweep | T1 |
| FR-4 · "The hand-off sentence SHALL live in the Step 2.2 block. The Falsifiability block receives no edit" | T1 (check 5), T2 (checklist item), T7 gate (a) |
| FR-4 *unreachable environment* · "BUT it must NOT be dropped from the ledger" · *consumer row reaches the task* | T1 |
| FR-5 · Step 2.1 · Step 2.5 counts and open rows · recommendation "SHALL NOT block" · `pre-approved` · four checklist items | T2 |
| FR-5 *open High-impact premise* · "AND the user can still choose **Continue**" · "BUT it must NOT hide the row inside the document only" | T2 (check 4 + disqualifier) |
| FR-6 · Step 1.2 half | T2 |
| FR-6 · propose half · *proposal states current behavior* · "BUT it must NOT appear as a bare fact" | T4 |
| FR-6 · "Neither restates them" | T2, T4 disqualifiers; T7 gate (b) |
| FR-7 · three actions · six severity rows · read-only clarification · protocol unchanged · full name | T3 |
| FR-7 *plausible premises* · "BUT it must NOT accept a premise because the requirements and the design agree on it" | T3; T7 |
| FR-7 *judge without a shell* · "BUT it must NOT count the row as confirmed" | T3 (check 3) |
| FR-8 · `judgment-day` row | T3 |
| FR-8 · Step 2.3 sentence · "by option and step name" | T2 |
| FR-9 · four checks · *Already fixed?* first · citation or marker · `n/a` with reason · one owner · cites the block | T4 |
| FR-9 *ticket closed by a teammate* · "AND a hit that fixes the symptom ends the proposal" · "BUT it must NOT search only the current branch" | T4 (disqualifier); T7 |
| FR-9 *cosmetic bug* | T4 |
| FR-10 · *new project constitution* · "BUT it must NOT redefine classes or triggers locally" | T5 (check 3) |
| FR-11 · mirrors · README and flow "only where a sentence turns false" · CHANGELOG · *post-sweep read* | T6 |
| NFR-1 | every task's scope discipline; T7 gate (a) |
| NFR-2 | T7 row counts and negative controls |
| NFR-3 | T3 check 4, T5 check 3, T7 gate (b) |
| NFR-4 | T1 scope; T7 gate (e) |
| NFR-5 | T3 (capability wording) |
| NFR-6 | T1 check 2, T3 check 2, T4 check 4, T7 gate (c) |
| NFR-7 | T7 — read: no shipped sentence makes a command fail on a design without the section |
| NFR-8 | T6 (CHANGELOG merged serially) |

No requirement is cleared by citing a different one. Every `BUT` and `AND IT MUST` clause above is quoted from `requirements.md`.

## 4. Estimate and PR strategy

| Task | Shipped lines (est.) |
|---|---|
| T1 | ~45 |
| T2 | ~18 |
| T3 | ~14 |
| T4 | ~30 |
| T5 | ~1 |
| T6 | ~40 |
| T7 | 0 shipped · ~120 spec-local (`walkthrough.md`) |
| **Total** | **~150 shipped** |

**PR strategy: single.** Well under ~400 lines, prose only, one definition with citing surfaces that must land together — a split would ship surfaces that cite a block that does not exist yet. This repo's flow commits to `master` per task with the `[SPEC:changes/premise-ledger]` prefix; one commit per task keeps each Reviewer diff under the 300-line inline threshold.
