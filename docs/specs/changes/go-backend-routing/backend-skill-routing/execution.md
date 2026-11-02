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

## Amendments A-2 – A-4 (JC, 2026-11-02, gate after T6)

JC answers (widget, verbatim option labels): A-3 → "Add 'project conventions' to rule 4"; A-2 → "Approve A-2 (Recommended)"; spec IDs → "Strip them (Recommended)".

| ID | Change | Spec edits (Leader, at the moment of decision) | Shipped edits (delegated) |
|---|---|---|---|
| A-2 | `api-design-principles` card evidence gains *GraphQL Design Patterns* | `design.md` §8.4 card Evidence cell | none — already shipped in T1 |
| A-3 | Third named source *project conventions* (the project's agent guides and the conventions its existing code follows, where the Skill Map names no skill for the stack or runtime) | `requirements.md` Glossary *Lead*; `design.md` Document Control, §5.1 Lead row, §8.1 rule 4, DD-4 (appended note) | `backend-routing.md` *Decision rule* 4 and *Backend route line* Lead row; `CHANGELOG.md` matrix clause |
| A-4 | Spec-local IDs stripped from the cells that ship | `design.md` §8.3 rows *framework-selection / other stacks, significant* (B-J-5), *api-contract* (P-15), *implement / AI agent* (B-J-6); §8.1 rule 4 (DD-4) | `backend-routing.md`: rule 4 (DD-4), the fall-through paragraph (KZ-004), the three rows above |

Correction-closure sweep (forward): `grep -n "two named sources\|Two named sources"` over the spec folder → only DD-4's historical lead sentence, which now carries the A-3 note; shipped surfaces with the old two-source wording: `backend-routing.md` rule 4 + *Backend route line* Lead row, `CHANGELOG.md` matrix clause. Backward: T8's *One lead* test reads Lead cells for `+`, `,`, ` or `, `/` — unaffected. Carried into the next Reviewer brief as named conformance checks.

**Amendment edits — PASS (attempt 1).** Implementer (sonnet): `backend-routing.md` 6/6, `CHANGELOG.md` 1/1; `npm test` 1419/1419; install-cursor 12/12; ID grep empty; 19 rows. Evidence re-run (Leader inline): VERIFIED — 1419/0; `git diff --check` clean; ID grep empty; 19 rows. Reviewer (opus, resumed): **PASS** — "Amendments A-2 to A-4 are applied faithfully in the spec and on the shipped surfaces. All four named conformance checks hold"; correction-closure sweep clean both directions; no meaning change beyond JC's options. ADVISORY (recorded, not acted on): READABILITY — the *implement / other* row meets rule 4's *project conventions* condition but is led by *existing design*; nothing reads false ("may lead"). runtime events: none. spawns: Implementer 5 calls, 66217 tokens, ended complete; Reviewer (resumed) not reported by host per call. Review rounds running total: 10 / ~18.

### T7: Docs match the matrix — PASS (attempt 2)

| Field | Value |
|---|---|
| Date | 2026-11-02 |
| Final status | `PASS` |
| Attempts | 2 |
| Requirements covered | FR-8 (`software-architect.md`, `governance.md` name the matrix; other role-stating pages do not contradict it), NFR-1 |
| Skills | `cognitive-doc-design`; effort `medium` → `high` on rework |

**Attempt 1**
- Files changed (10): `docs/skills/{software-architect,governance,nestjs-expert,aws-serverless,ai-agent-development,README}.md`, `docs/flow.md`, `docs/overview.md`, `docs/commands/{akili-specify,akili-constitution}.md` (+15/−9).
- Falsifier executed (post-edit P-13 grep): 4 of 5 role-claim hits carry the routing qualifier; the NestJS line reworded off the pattern; `aws-serverless.md` "`/akili-constitution` for serverless architecture baseline." left (P-13-ruled consistent).
- Implementer verification: docs-overview + golang-skill 29/29; `npm test` 1419/1419; first table cells unchanged.
- Evidence re-run (Leader inline): VERIFIED — 1419/0; `git diff --check` clean; falsifier grep output matched.
- Reviewer (opus): **FAIL** — verbatim:
  > 1. **Discovered Issue:** In `docs/skills/governance.md`, "every other surface names the file and section and never copies a row" is false at HEAD. These surfaces name the file only, with no section: `AGENTS.md` (Design/Backend Skills pointers), `akili-constitution.md` Step 8D items 4 and 5, `docs/flow.md`, the new constitution-doc clause. **Violated Rule:** KZ-002. **Remediation Suggestion:** "every other surface names the file (and a section where it points into one), never a line number, and never copies a row".
  > 2. **Discovered Issue:** The *Purpose* of `docs/skills/ai-agent-development.md` still calls the skill "The decision layer for building AI agents: … how to shape the agent (state, tools, memory, human-in-the-loop points, **multi-agent topology**)". Under the matrix, `software-architect` leads agent architecture and pattern choice … the page contradicts itself. P-13's grep pattern missed this sentence ("shape the agent"). **Violated Rule:** requirements FR-8; design DD-7. **Remediation Suggestion:** narrow that clause only.
- Reviewer rulings: the aws-serverless baseline line, the `nestjs-expert` / `aws-serverless` table rows (capability lists, no role claim) and the `nestjs-expert.md` rewrite conform. ADVISORY: specify-doc "settles … next to it" reads oddly.
- runtime events: none.

**Attempt 2** (resumed Implementer; effort `high`)
- Files changed: `governance.md` sentence; `ai-agent-development.md` Purpose; `docs/commands/akili-specify.md` advisory wording ("settles … and records it next to the decision"). Same 10 files, +16/−8.
- Sweep of `ai-agent-development.md` + its overview/README rows: no other lead claim; Use When "Supporting agent architecture … multi-agent boundaries" and Core Rules "load this skill first" left (Reviewer ruled both consistent).
- Implementer verification: 29/29; `npm test` 1419/1419.
- Evidence re-run (Leader inline): VERIFIED — 1419/0; `git diff --check` clean; nothing under `.claude/`.
- Reviewer (opus, resumed): **PASS** — "Both issues from attempt 1 are fixed … exactly three lines changed: the two fixes and the optional specify advisory."
- runtime events: none.

**Issues:** **P-13 premise gap** — the design's role-claim grep (`agent architecture|architecture decisions|…`) missed the `ai-agent-development.md` Purpose sentence ("how to shape the agent … multi-agent topology"); found by the Reviewer. Recorded for the kaizen retrospective.
- spawns: Implementer 10 calls, 79142 tokens, ended fail; Implementer (resumed) 3 calls, 84297 tokens cumulative, ended complete; Reviewer (resumed ×2) not reported by host per call
- Final verification: `npm test` 1419 pass, 0 fail.
- Running totals vs budget: tasks 7 / 9 · LOC ~190 / ~650 · review rounds 12 / ~18 — within budget.
- Gate: auto-approved (JC gate decision after T1).

### T8: Contract tests — PASS (attempt 1)

| Field | Value |
|---|---|
| Date | 2026-11-02 |
| Final status | `PASS` |
| Attempts | 1 |
| Requirements covered | requirements §8 automated defect classes; FR-1, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9; NFR-1, NFR-3 |
| Skills | `tdd`; effort `high` |

- Files changed: `test/backend-skill-routing.test.js` (new, 229 LOC, 14 tests, each tagged `@akili-spec changes/go-backend-routing/backend-skill-routing <FR>`).
- Falsifiers executed (temporary edits reverted with `git checkout --`), red per test: held once (row pasted into `akili-specify.md` → "signatures restated outside the matrix"); skill set (`aws-serverless` card deleted → cards name the nine; `implement`/AWS row deleted → "aws-serverless is named in a Matrix row"); activities (`performance`/not significant deleted → "performance has a not significant row"); one lead (`` `tdd` + `golang-pro` `` → 'no list separator'); stack lead closed (`golang-pro` leads `test-first` → 'stack lead … on an activity that may not have one'); card evidence (*Seams* → 'heading "Seams" exists in tdd/SKILL.md'); no line pointers (`SKILL.md:3` in a card → "matrix holds no line pointer"); wiring (specify 2.1 pointer, 8D heading, leader collision phrase, software-architect Routing row — each red; `project-structure.md` existence not mutated, ruled acceptable); governance (`api-design-principles` in the specify rule → 'specify rule names no stack skill'); legacy task, names only, `tdd` switch (leader + specify), absent file (specify + leader), no install advice — each red on clause deletion/insertion. 31 `not ok` lines in the Implementer's scratchpad log. The first leader-pointer falsifier stayed green (the absent-file clause also names `backend-routing.md`); the assertion was tightened to the collision phrase and re-run red.
- Red run (baseline worktree `0af13bd`, removed afterwards): 0 pass / 14 fail — wiring, legacy, names-only, `tdd` switch, absent-file, governance and install tests red on missing clauses; tests 1–7 red via `ENOENT` (matrix absent). Reviewer ruling: the `ENOENT` reds are setup failures; the behavioral reds are the falsifier runs above.
- Implementer verification: suite 14/14; `npm test` 1433/1433; `npm run verify:cli` green; `npm run pack:dry-run` green (419 files); `git diff --check` clean.
- Evidence re-run (Leader inline): VERIFIED — `npm test` 1433 pass / 0 fail; `verify:cli` "14 commands | 32 skills | 8 resources"; pack "total files: 419"; `git diff --check` clean; no leftover worktree; the file reads `docs/specs` only to skip it.
- Reviewer (opus, resumed): **PASS** — "All 14 design §7.2 rows have a test that asserts what the row says, and the row's falsifier would turn that test red … None of the disqualifiers fires."
- runtime events: none.
- ADVISORY: RELIABILITY — `bare()` in the card-evidence test is unnecessary (no cited heading holds markup); READABILITY — the governance regex matches `binding: stack` anywhere in `SKILL.md`, not only the frontmatter (only the frontmatter line matches today).
- spawns: Implementer 18 calls, 115985 tokens, ended complete; Reviewer (resumed) not reported by host per call
- Final verification: `npm test` 1433 pass, 0 fail.
- Running totals vs budget: tasks 8 / 9 · LOC ~420 (≈190 prose + 229 tests) / ~650 · review rounds 13 / ~18 — within budget.
- Gate: auto-approved (JC gate decision after T1).

### T9: Held-out routing walkthrough (HITL) — evidence

| Field | Value |
|---|---|
| Date | 2026-11-02 |
| Walker | fresh read-only agent, `opus` (authors: `sonnet` Implementers), no spec access; allowed text only: `backend-routing.md` (whole), `akili-specify.md` *Preferred backend skill rule:* block, `leader.md` item 3 |
| Profiles | (a) Go paginated REST endpoint, flaky upstream with retries, `tdd` kept; (b) NestJS on AWS Lambda, SQS consumer double-processes (bug); (c) Python FastAPI (no packaged skill), new background-worker module, significant |
| Source | walker's report in this session's transcript (T9 hand-back), lines quoted below |

**Routes the walker wrote (verbatim):**
- (a) `Backend route: stack Go; api-contract lead api-design-principles support golang-pro; error-model lead error-handling-patterns support golang-pro; implement lead golang-pro support api-design-principles, error-handling-patterns; test-first lead tdd support golang-pro`
- (b) `Backend route: stack AWS serverless; bug-diagnosis lead systematic-debugging support aws-serverless, nestjs-expert; implement lead aws-serverless support error-handling-patterns; test-suite lead the spec's scenarios support aws-serverless` (walker: "If the confirmed root cause sits inside Nest service code, the stack becomes `NestJS` and implement becomes `lead nestjs-expert`.")
- (c) `Backend route: stack other; architecture lead software-architect support none — project conventions; module-design lead software-architect support none — project conventions; implement lead existing design support none — project conventions; test-suite lead the spec's scenarios support none — project conventions`

**Who decides — the walker's answers (verbatim from the T9 hand-back):**
- (a) Retry / resilience: "`error-handling-patterns`. It 'owns the handling philosophy, the error categories and recovery (circuit breaker, aggregation, graceful degradation)'. `golang-pro` only supplies the `%w` idiom." · Error body and status codes: "`api-design-principles`, via the api-contract row: 'status codes and error body belong to `api-contract`'." · Test expected values: "`requirements.md`, never `tdd` or `golang-pro`." · Diagnosis: "not applicable."
- (b) Diagnosis: "`systematic-debugging`. No fix may be proposed before the root cause." · Retry / resilience: "`error-handling-patterns`, if the error-model row is touched. The file says nothing on who leads SQS redrive or visibility-timeout configuration." · Error body: "not applicable, since there is no HTTP contract. If one were touched, `api-design-principles` would lead." · Test expected values: "the spec's scenarios. `tdd` is not listed, so the activity is `test-suite`."
- (c) Retry / resilience: "`error-handling-patterns`, via the error-model row (context 'any'), with support `none — project conventions`." · Error body: "`api-design-principles`, only if an endpoint is touched." · Test expected values: "the spec's scenarios, from `requirements.md`." · Diagnosis: "not applicable." · Install: "none."

**Comparison with the expected leads (tasks.md T9 Falsifier):**

| Expected | Walker | Result |
|---|---|---|
| (a) `api-contract` lead `api-design-principles` | same | match |
| (a) `error-model` lead `error-handling-patterns` (retry / circuit breaker) | same; retry assigned under "recovery" | match (ambiguity A below) |
| (a) `test-first` lead `tdd` | same | match |
| (a) `implement` lead `golang-pro` | same | match |
| (b) `bug-diagnosis` lead `systematic-debugging`, support `nestjs-expert` and `aws-serverless` | same | match |
| (b) no fix before root cause | "No fix before root cause; a stack skill's root-cause list is a hypothesis, not a diagnosis." | match |
| (c) `architecture` / `module-design` lead `software-architect` | same | match |
| (c) support `none — project conventions` | same | match |
| (c) no install advice | "No skill is recommended for install" | match |
| Who decides retries → `error-handling-patterns` (recovery) | (a)(b)(c) `error-handling-patterns` | match (ambiguity A: "retry" not named in the row) |
| Who decides error body / status codes → `api-design-principles` (`api-contract`, DD-9 split) | (a) `api-design-principles`; (b)(c) same when an HTTP contract is touched | match |
| Who decides test values → `requirements.md` / `design.md` (under `tdd` in (a)) | (a) `requirements.md`; (b)(c) the spec's scenarios | match |
| Who decides diagnosis → `systematic-debugging` | (b) `systematic-debugging`; (a)(c) n/a | match |
| Any stack lead outside `implement` / `framework-selection`, or two leads | none written; the walker **reported** one two-lead reading as an ambiguity (C) | no mismatch in the routes; ambiguity C presented to JC |

**Ambiguities the walker reported (verbatim gist, for JC):**
- **A — retry not named.** "'Retry' is never named as such. I counted it under 'recovery', but the shipped list (circuit breaker, aggregation, graceful degradation) does not include retry or backoff."
- **B — implement support cell.** "The implement row's support is 'method skills as constraints already in `design.md`'. The line format allows only 'Skill name(s) or `none — project conventions`', so how to write that support is unspecified."
- **C — two leads for `implement` / other (consequence of A-3).** "The matrix and the Stack table say 'its `implement` row leads with *existing design*'. Rule 4 says *project conventions* may lead 'where the Skill Map names no skill for the stack or runtime'. Both name sources fit a `other` stack, so the text gives two leads." (Same point as the Reviewer's amendment-pass ADVISORY.)
- **D — stack value across rule 6's boundary.** For a NestJS-on-Lambda fix whose side depends on the root cause, the single Stack value is not determined before diagnosis.
- **E — idempotency / at-least-once delivery** appear in no row or card. Walker on (b): "The file says nothing on who leads SQS redrive or visibility-timeout configuration."
- Minor: "existing design" is thin for a brand-new module (rule 5 carries the significant design); architecture support "stack skill" → `none — project conventions` for `other` stacks is consistent but has no worked example.

**T9 closure — PASS (evidence attempt 2).** Attempt 1 (Leader-written record) — Reviewer (opus) **FAIL**: "The T9 evidence does not record the walker's answers for who decides **error body** and **test values** … `tasks.md` T9 Scope says the walker … 'names who decides retries, error body, test values and diagnosis'" (KZ-changes--gate-falsifiability-2). Attempt 2 added the *Who decides* block verbatim from the hand-back and four comparison rows. Reviewer **PASS**: "Issue 1 is fixed … No mismatch is hidden, and no lead outside the matrix appears"; asked that the walker's SQS redrive / visibility-timeout gap be listed with E (done). Evidence re-run: n/a (no command verification — a walkthrough). runtime events: none. spawns: Walker (opus) 3 calls, 67073 tokens, ended complete; Reviewer (resumed ×2) not reported by host per call. Mismatches: **none**; ambiguities A–E presented to JC at the closing HITL pause.

## Summary

| Measure | Budget (design §12) | Actual |
|---|---|---|
| Tasks | 9 | 9 `[x]` + one amendment pass (A-2 – A-4) |
| LOC (shipped, outside `docs/specs/`) | ~650 | 398 insertions / 17 deletions across 19 files (matrix 101, tests 229, rest prose) |
| Review rounds | ~18 | 15 (T1 2, T2 1, T3 1, T4 1, T5 2, T6 2, amendments 1, T7 2, T8 1, T9 2) |

- Final verification: `npm test` 1433 pass / 0 fail (1419 baseline + 14); `npm run verify:cli` green; `npm run pack:dry-run` green (419 files); `git diff --check` clean.
- Amendments: A-2, A-3, A-4 approved by JC 2026-11-02 (gate after T6).
- Rework causes for the retrospective: T1 dropped §5.1 Source column; T5 Scope omitted FR-5's deviation-record clause (Scope gap); T6 CHANGELOG over-claim (KZ-002); T7 governance over-claim (KZ-002) + P-13 grep premise gap; T9 Leader-written evidence dropped a Scope obligation (KZ-changes--gate-falsifiability-2).
- Open for JC: T9 ambiguities A (retry not named in the error-model row/card), B (implement support cell vs line form), C (`implement` / other: *existing design* vs rule 4's *project conventions*), D (stack value across rule 6), E (idempotency; SQS redrive/visibility timeout). Persona drift in `.agents/leader.md` / `tester.md` (not fixed).
- Not done in this cycle (per JC): no push, PR, merge, tag or publish.
