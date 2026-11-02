# Execution: Backend Skill Routing — one owner per backend decision

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/backend-skill-routing` |
| Approval Mode | `gated` — every task gate stops for JC; no push, PR or merge (JC 2026-11-02: "execute, salgamos de esto"; brief: "Do not push or merge; stop at every HITL gate") |
| Leader | Claude Opus 5.5 (main session) |
| Workers | No Step 8E wrappers in this repo → fallback sub-prompts: Implementer `sonnet` (T2), Reviewer `opus` (author ≠ auditor), each told to read its `.agents/` persona first |
| Persona drift (`akili doctor --agents`, 2026-11-02) | `leader` `primary-instructions` OUTDATED (matched 2.36.0): the only delta vs the template is item 3's UI swap example (`ui-ux-pro-max` / `gsap-animation` → `impeccable-bridge`); no orchestration rule differs. `tester` `context-alignment` OUTDATED (not used by `/akili-execute`). `implementer`, `reviewer` CURRENT. Not fixed (`.agents/` is untracked); reported to JC |
| Budget (design §12) | 9 tasks · ~650 LOC · ~18 review rounds |
| Baseline | `npm test` 1419 pass, 0 fail (tasks.md Document Control) |

## Task Execution History

### T1: Write the Backend Routing Matrix — PASS (attempt 2)

| Field | Value |
|---|---|
| Date | 2026-11-02 |
| Final status | `PASS` |
| Attempts | 2 |
| Requirements covered | FR-1, FR-2, FR-3, FR-4, FR-9 (Go layering route), NFR-1, NFR-5, NFR-6, NFR-7 |
| Skills | `software-architect`, `cognitive-doc-design` (as listed); effort `high` → `xhigh` on rework |

**Attempt 1**
- Files changed: `.claude/skills/software-architect/references/backend-routing.md` (new), `test/install-cursor.test.js` (constant `+ 1`, message `+ 1 backend-routing.md`, comments 317/331 → 318/332).
- Falsifier executed (R1): file created, test untouched → `expected 317 (247 + 58 upstream + 3 LICENSE/NOTICE/UPSTREAM.md + 1 design-routing.md + 8 golang-pro) packaged skill files under .claude/skills; counted 318 instead` (pass 11, fail 1).
- Implementer verification: `node --test test/install-cursor.test.js` 12/12; `npm test` 1419/1419; `git diff --check` clean; no `317|331` hit; no `\.(md|js):\d+` hit; 19 rows, 9 cards; routed-skill folders untouched.
- Evidence re-run (Leader inline): VERIFIED — `npm test` 1419 pass / 0 fail; `git diff --check` clean; no `317|331`; no pointer; 19 `| **` rows; NFR-2/NFR-4 `git diff --stat` empty.
- Reviewer (opus): **FAIL** — verbatim:
  > 1. **Discovered Issue:** In the *Backend route line* field table, the Source column was merged into Values, and two sources were lost: Stack — "project `## Skill Map` / `### Backend routing`"; Activity — "spec `design.md`". Lead and Support sources survived. **Violated Rule:** `design.md` §8.5 ("the form in §5.1 with its field table"); the §5.1 table's `Source` column; KZ-changes--gate-falsifiability-2. **Remediation Suggestion:** Restore the `| Field | Values | Source |` table with the §5.1 Source cells; keep the "activities of the *Matrix* section" wording.
- Reviewer rulings on the five Implementer-declared deviations: all accepted. (1) third evidence heading `*GraphQL Design Patterns*` on the `api-design-principles` card — a faithful over-claim fix, but a **spec tension** (design §8.4 cell vs FR-4 BUT) → amendment at the gate; (2) spec IDs kept verbatim in cells (`DD-4`, `KZ-004`, `B-J-5`, `B-J-6`, `P-15`), prose-only IDs dropped — consistent with the source; (3) Activity "the activities of the *Matrix* section"; (4) Stack `other` "falls through, below"; (5) Attribution names the seven third-party skills.
- runtime events: none.

**Attempt 2** (same Implementer context, resumed by message; effort `xhigh`; Attempt History: "attempt 1 merged Source into Values — do not repeat")
- Files changed: `backend-routing.md` (*Backend route line* field table only, three columns restored).
- Implementer verification: install-cursor 12/12; `npm test` 1419/1419; `git diff --check` clean; no pointer; `docs/specs` count 0.
- Evidence re-run (Leader inline): VERIFIED — `npm test` 1419/1419/0; `git diff --check` clean; no pointer; table read at file lines 80–85.
- Reviewer (opus, same context): **PASS** — "Attempt 2 differs from attempt 1 only at file lines 80–85 … the table has its `Source` column back and matches design §5.1 term by term"; everything else byte-identical to the attempt-1 audit.
- runtime events: none.

**ADVISORY (final verdict):** READABILITY — the spec IDs kept in shipped cells (`DD-4`, `KZ-004`, `B-J-5`, `B-J-6`, `P-15`) mean nothing to a reader of an installed copy; removing them needs a design amendment. (Attempt 1 also noted: "names exactly the backend skills the line names" dropped the design's "FR-1" qualifier — reads fine in-file.)

**Decisions made:**
- Diff delivered to the Reviewer by scratchpad path (151 lines, under the 300-line inline threshold) — Leader output economy; the Reviewer kept `Read`.
- Rework run by resuming the attempt-1 Implementer and Reviewer contexts by message, not fresh spawns (context survived; one-cell fix).
- Spec tension raised for JC at the T1 gate as proposed amendment **A-2**: design §8.4 `api-design-principles` Evidence cell gains `→ *GraphQL Design Patterns*` (the shipped file already carries it). Not applied to `design.md` until JC answers.

**Issues encountered:** none beyond the FAIL above.

spawns: Implementer 18 calls, 114445 tokens, ended complete; Implementer (resumed) 2 calls, 117204 tokens cumulative, ended complete; Reviewer 9 calls, 92844 tokens, ended fail; Reviewer (resumed) 2 calls, 95202 tokens cumulative, ended complete

**Final verification:** `npm test` 1419 pass, 0 fail; `node --test test/install-cursor.test.js` 12/12; `git diff --check` clean.

**Running totals vs budget:** tasks 1 / 9 · LOC 114 (101 matrix + 13 test lines changed) / ~650 · review rounds 2 / ~18 — within budget.

### Gate after T1 — JC decision (2026-11-02)

JC (verbatim, via widget): "Sigue con T2 a T9 sin pausar entre tareas; para solo en enmiendas, fallos o al final".

- Routine continue gates T2→T9 are pre-approved by JC; each is logged `auto-approved (JC gate decision after T1)`.
- Stops still fire on: a new amendment / spec tension, a HALT, `FATAL_FAIL`, Pivot, budget tripwire, an unresolved test failure, and the end of the run. Leader reading of "fallos": an in-loop Reviewer `FAIL` that the rework loop resolves is routine; a HALT or a failure the loop cannot resolve stops.
- Pending for the end gate (not answered at this gate): proposed amendment **A-2** (design §8.4 `api-design-principles` Evidence + `*GraphQL Design Patterns*`) and the spec-ID ADVISORY. Neither blocks T2–T8.

### T2: `software-architect` *Routing* row — PASS (attempt 1)

| Field | Value |
|---|---|
| Date | 2026-11-02 |
| Final status | `PASS` |
| Attempts | 1 |
| Requirements covered | FR-9 (row; scenario via T1's *Go layering*; BUT `architecture-styles.md` unchanged), FR-1 *Held once*, NFR-2 |
| Skills | `software-architect`; effort `low` |

- Files changed: `.claude/skills/software-architect/SKILL.md` (+1 row, last row of *Routing — load the matching reference*).
- Falsifier / Red run: `predicted — greenfield artifact (observed in T8)` — not executable before T8 exists.
- Implementer verification: `git diff` one added line; `architecture-styles.md` and routed-skill diffs empty; `git diff --check` clean; `node --test test/diagram-design.test.js` 13/13; `npm test` 1419/1419.
- Evidence re-run (Leader inline): VERIFIED — `npm test` 1419 pass / 0 fail; `git diff --check` clean; diff = one added row.
- Reviewer (opus, resumed T1 context): **PASS** — "The row text matches the tasks.md T2 Scope character for character … Neither disqualifier fires." Ruled the paragraph under the table must stay unchanged (Scope "No other byte", NFR-2, DD-2).
- runtime events: none.
- ADVISORY: none.
- Decisions: Reviewer reused by message (same spec context, fresh task); T3 Implementer spawned while the T2 Reviewer ran (disjoint file; the T2 commit is pathspec-scoped).
- spawns: Implementer 6 calls, 67000 tokens, ended complete; Reviewer (resumed) 2 calls, 102666 tokens cumulative, ended complete
- Final verification: `npm test` 1419 pass, 0 fail.
- Running totals vs budget: tasks 2 / 9 · LOC 115 / ~650 · review rounds 3 / ~18 — within budget.
- Gate: auto-approved (JC gate decision after T1).

### T3: `/akili-specify` — Step 2.1 pointer and Step 3.2 backend rule — PASS (attempt 1)

| Field | Value |
|---|---|
| Date | 2026-11-02 |
| Final status | `PASS` |
| Attempts | 1 |
| Requirements covered | FR-6 (pointer, `Backend route:` line, list ⇔ line, no stack load-direction), FR-1 *Held once*, FR-3 stack-absent, NFR-3, NFR-4, NFR-5 |
| Skills | `cognitive-doc-design`; effort `high` |

- Files changed: `.claude/commands/akili-specify.md` (+10 / −1): Step 2.1 pointer sentence after the fallback list (absent-file clause included); Step 3.2 inventory clause; new *Preferred backend skill rule:* block (4 bullets) before *Preferred UI/UX skill rule:*.
- `binding: stack` list (computed): ai-agent-development, aws-serverless, api-design-principles, angular-developer, golang-pro, error-handling-patterns, nestjs-expert, shadcn-ui, react-doctor, vercel-react-best-practices, tailwind-design-system — zero hits in the added text.
- Falsifiers executed (temporary edits, restored): **R3** gsap in the Step 2.1 sentence → `design-skill-routing-coverage.test.js` "not ok 4 … FR-7" ("Step 2.1 gates gsap: When the design has backend work…"); **R4** delete `` - `golang-pro` `` → `golang-skill.test.js` "not ok 11 … FR-3: golang-pro is in the four candidate pools". Third falsifier (rule after UI rule) not run; placement checked directly by the Reviewer.
- Implementer verification: three consumer files 34/34; `npm test` 1419/1419; `git diff --check` clean; no `\.(md|js):\d+`, `| **` or `install` in added lines.
- Evidence re-run (Leader inline): VERIFIED — `npm test` 1419/0; `git diff --check` clean; only the one file modified.
- Reviewer (opus, resumed): **PASS** — "All three T3 scope edits … match the Scope, FR-6 and the design." Ruled Scope (c)'s "names no `binding: stack` skill and recommends no install" is a prohibition met by absence (DD-5, FR-3, NFR-3; restating would push against held-once).
- runtime events: none. ADVISORY: none.
- spawns: Implementer 11 calls, 80636 tokens, ended complete; Reviewer (resumed) not reported by host per call
- Final verification: `npm test` 1419 pass, 0 fail.
- Running totals vs budget: tasks 3 / 9 · LOC 125 / ~650 · review rounds 4 / ~18 — within budget.
- Gate: auto-approved (JC gate decision after T1).

### T4: `/akili-constitution` Step 8D — `### Backend routing` block — PASS (attempt 1)

| Field | Value |
|---|---|
| Date | 2026-11-02 |
| Final status | `PASS` |
| Attempts | 1 |
| Requirements covered | FR-7 (rule; Django no-skill; no backend; Safe Update; coexists with Design routing), NFR-3, NFR-4 |
| Skills | `cognitive-doc-design`; effort `high` |

- Files changed: `.claude/commands/akili-constitution.md` (+8 / −0): Step 8D item 5 after item 4; one *Mode-specific policy* bullet after the Safe Update bullet.
- Falsifier executed: **R2** `golang-pro` in item 5 → `design-skill-routing.test.js` "not ok 8 … FR-3: the rule paragraph and Step 8D item load-direct no stack skill" (`Step 8D item names no stack skill`); restored.
- Implementer verification: three consumer files 34/34; `npm test` 1419/1419; `git diff --check` clean; additions only; no pointer, row or install advice.
- Evidence re-run (Leader inline): VERIFIED — `npm test` 1419/0; `git diff --check` clean; numstat 8/0.
- Reviewer (opus, resumed): **PASS** — "Neither disqualifier fires … item 4 and the three existing policy bullets have no `-` lines."
- Implementer deviation (logged per Reviewer): added "A project with no server-side code gets no block." — not in the Scope text; states FR-7 *Project with no backend*'s own THEN. Reviewer ruled it does not widen scope.
- runtime events: none. ADVISORY: none.
- spawns: Implementer 11 calls, 75131 tokens, ended complete; Reviewer (resumed) not reported by host per call
- Final verification: `npm test` 1419 pass, 0 fail.
- Running totals vs budget: tasks 4 / 9 · LOC 133 / ~650 · review rounds 5 / ~18 — within budget.
- Gate: auto-approved (JC gate decision after T1).

### T5: Leader persona item 3 — PASS (attempt 2)

| Field | Value |
|---|---|
| Date | 2026-11-02 |
| Final status | `PASS` |
| Attempts | 2 |
| Requirements covered | FR-5 (take the matrix's lead; record a deviation from it; collision BUT names only; legacy task BUT never fail/block), FR-6 `tdd` switch (design §5.1), NFR-5, design §8.5 *Absent file* |
| Skills | `cognitive-doc-design`; effort `high` → `xhigh` on rework |

**Attempt 1**
- Files changed: `.claude/templates/leader.md` (1/1 — item 3's first bullet in `primary-instructions`): swap example added to the parenthesis; one sentence after it.
- Falsifier executed: **R5** `See leader.md:25.` appended → `design-skill-routing.test.js` "not ok 5 … A-15b: no file:line pointers in the matrix or the new text"; restored.
- Implementer verification: `design-skill-routing` + `persona-digests` + `agents-doctor` 75/75; `npm test` 1419/1419; no pointer; UI example count 1; `digests.json` untouched (design §9).
- Evidence re-run (Leader inline): VERIFIED — 1419/0; `git diff --check` clean; numstat 1/1; no `akili:section` line in the diff.
- Reviewer (opus): **FAIL** — verbatim:
  > 1. **Discovered Issue:** The FR-5 statement's second obligation, "record any deviation from it [the lead named by the matrix] with the existing skill-deviation record", is not in the shipped text. The existing record covers only deviations "from the task's list". A Leader can keep both colliding skills, so the list is unchanged, and still give the lead role to the skill the matrix does not name. No text then requires a record. **Violated Rule:** `requirements.md` FR-5 statement: "the Leader SHALL take the lead named by the matrix **and record any deviation from it with the existing skill-deviation record**." (KZ-changes--gate-falsifiability-2). **Remediation Suggestion:** Extend the new sentence: "…, and that switch, like naming a lead other than the matrix's, is a deviation, recorded by the one-line reason below; …". Change nothing else.
- Reviewer rulings: positional "recorded by the one-line reason below" accepted (same-bullet, not a line pointer); FR-5 collision and legacy scenarios carried.
- runtime events: none.

**Attempt 2** (resumed Implementer; effort `xhigh`; Attempt History: "attempt 1 omitted FR-5's deviation-record clause — do not repeat")
- Files changed: same bullet; sentence extended with "like naming a lead other than the matrix's, is a deviation".
- Implementer verification: 75/75; `npm test` 1419/1419; numstat 1/1.
- Evidence re-run (Leader inline): VERIFIED — 1419/0; `git diff --check` clean; numstat 1/1.
- Reviewer (opus, resumed): **PASS** — "Issue 1 is fixed … covers FR-5's 'record any deviation from it with the existing skill-deviation record' even when the colliding skills both stay in the list."
- runtime events: none. ADVISORY: none.

**Decisions / issues:** **Scope gap** — `tasks.md` T5 Scope omitted FR-5's "record any deviation from it" clause; closed in attempt 2 by implementing the approved FR text (no requirement or design meaning changed → not an amendment; no stop under JC's gate decision). Recorded for the kaizen retrospective.
- spawns: Implementer 8 calls, 73732 tokens, ended fail; Implementer (resumed) 2 calls, 75912 tokens cumulative, ended complete; Reviewer (resumed ×2) not reported by host per call
- Final verification: `npm test` 1419 pass, 0 fail.
- Running totals vs budget: tasks 5 / 9 · LOC 135 / ~650 · review rounds 7 / ~18 — within budget.
- Gate: auto-approved (JC gate decision after T1).

### T6: Repo `AGENTS.md` `## Backend Skills` + CHANGELOG — PASS (attempt 2)

| Field | Value |
|---|---|
| Date | 2026-11-02 |
| Final status | `PASS` |
| Attempts | 2 |
| Requirements covered | FR-8 (`## Backend Skills`: rule + nine roles + pointer; same skill set as the cards; BUT no rows), NFR-1, NFR-4, NFR-6 (CHANGELOG `--force` note, P-20) |
| Skills | `cognitive-doc-design`; effort `medium` → `high` on rework |

**Attempt 1**
- Files changed: `AGENTS.md` (+16: `## Backend Skills` before `## CodeGraph`); `CHANGELOG.md` (+9/−1: `### Added` under `## [Unreleased]`, `### Notes` placeholder replaced by the `install --force` note).
- Falsifier / Red run: `predicted — greenfield artifact (observed in T8)`.
- Implementer verification: `design-skill-routing.test.js` 9/9; `npm test` 1419/1419; no `| **` or pointer hits. (Its name-set comparison was broken by a `sed`; Leader re-ran it correctly.)
- Evidence re-run (Leader inline): VERIFIED — 1419/0; `git diff --check` clean; section name set = card name set (`diff` empty).
- Reviewer (opus): **FAIL** — verbatim:
  > 1. **Discovered Issue:** The CHANGELOG says the matrix "maps each backend activity and context to **one lead skill**, the support skills and the expertise cards." At HEAD, `backend-routing.md` → *Matrix* has seven of its 19 rows led by a named source, not a skill … Also, expertise cards are one per skill … so the clause puts them in the wrong place. **Violated Rule:** KZ-002 … Glossary *Lead*, amendment A-1 … DD-4. **Remediation Suggestion:** "maps each backend activity and context to one lead (a skill, or a named source: *existing design* or *the spec's scenarios*) and its support skills, and holds one expertise card per backend skill."
- Reviewer rulings: the third rule-paragraph sentence (Skill Map / task lists) and the FR-2 one-lead sentence conform; omitting the Step 8D policy bullet from the CHANGELOG is acceptable.
- runtime events: none.

**Attempt 2** (resumed Implementer; effort `high`)
- Files changed: `CHANGELOG.md` matrix clause only.
- Implementer verification: quote-check against *Decision rule* 4 and *Expertise cards*; own census 6 named-source rows (the Reviewer's "seven" was an arithmetic slip — 4+1+1); `git diff --check` clean; `docs-overview.test.js` 13/13.
- Evidence re-run (Leader inline): VERIFIED — `npm test` 1419/0; numstat AGENTS 16/0, CHANGELOG 9/1; Lead-column census: 12 skill-led, 5 *existing design*, 1 *the spec's scenarios*, 1 "the agent's runtime skill (from the Skill Map; none → project conventions)".
- Reviewer (opus, resumed): **PASS** — "Issue 1 is fixed … matches *Decision rule* 4 and the Glossary *Lead* definition (A-1)."
- runtime events: none.
- ADVISORY: READABILITY — neither surface mentions the named-source leads; optional.

**Spec tension raised by the Reviewer (→ JC, proposed amendment A-3):** design §8.3 row *implement / AI agent* Lead "the agent's runtime skill (from the Skill Map; none → project conventions)" introduces a third fallback lead, *project conventions*, that A-1 (Glossary *Lead*) and *Decision rule* 4 do not list; FR-1 BUT ("nor leave a row without a lead") holds only if it counts. Options: (a) reword the cell's fallback to *existing design*; (b) extend rule 4 + A-1 to name *project conventions*. Not a T6 defect.

- spawns: Implementer 9 calls, 77816 tokens, ended fail; Implementer (resumed) 2 calls, 80197 tokens cumulative, ended complete; Reviewer (resumed ×2) not reported by host per call
- Final verification: `npm test` 1419 pass, 0 fail.
- Running totals vs budget: tasks 6 / 9 · LOC 160 / ~650 · review rounds 9 / ~18 — within budget.
- Gate: **STOP** — new amendment (JC: "para solo en enmiendas").
