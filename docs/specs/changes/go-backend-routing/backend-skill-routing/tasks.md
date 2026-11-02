# Tasks: Backend Skill Routing — one owner per backend decision

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/backend-skill-routing` |
| Status | Phase 3 draft, awaiting JC (2026-11-02), `gated` |
| Requirements / Design | `requirements.md` rev. 2 + A-1 (approved by JC 2026-11-02); `design.md` rev. 2 (fixed, not re-judged — `judgment.md`; approved by JC 2026-11-02: "Sí, aprueba el diseño y sigue a la fase 3 (tasks.md)") |
| Baseline | `0af13bd`. `npm test` → **1419 pass, 0 fail** (run 2026-11-02) |
| Baseline readings | `grep -rn "backend-routing\|Backend route\|Backend routing\|Backend Skills" .claude docs/*.md docs/skills docs/commands AGENTS.md README.md test` → only `golang-skill` spec-path strings (**0** routing hits); `grep -n "317\|331" test/install-cursor.test.js` → `:228`, `:244`, `:347` (+ `:249` constant, `:253` message) |
| Observed reds (run 2026-11-02 on temporary edits, each reverted with `git checkout --`) | **R1** `touch …/software-architect/references/backend-routing.md` → `install-cursor.test.js`: "expected 317 (247 + 58 upstream + 3 LICENSE/NOTICE/UPSTREAM.md + 1 design-routing.md + 8 golang-pro) packaged skill files under .claude/skills; counted 318 instead". **R2** a line naming `golang-pro` after Step 8D item 4 → `design-skill-routing.test.js` FR-3: "Step 8D item names no stack skill". **R3** a line naming `gsap-animation` at the end of specify Step 2.1 → `design-skill-routing-coverage.test.js` FR-7: "Step 2.1 gates gsap: Backend pointer mentions gsap-animation." **R4** delete `` - `golang-pro` `` from specify's fallback list → `golang-skill.test.js` FR-3 "golang-pro is in the four candidate pools" red. **R5** append `See leader.md:25.` to `leader.md` item 3 → `design-skill-routing.test.js` A-15b red |
| Commit prefix | `[SPEC:changes/go-backend-routing/backend-skill-routing]`. Local commits only — no push, PR, merge, tag or publish |
| Budget (design §12) | 9 tasks · **~650 authored LOC** (~330 prose + ~320 tests) · ~18 review rounds. `/akili-execute` stops and escalates when actuals exceed it |
| PR strategy | One PR into `dev` (~650 LOC, one concern: rules text + its contract tests). Not opened in this cycle |
| `skip-eligible` tasks | **None** — every task edits rules text other agents execute, or the tests that guard it |

## Dependency graph

```text
T1 ──► T2 ──► T8 ──► T9
T1 ──► T3 ──► T8
T1 ──► T4 ──► T8
T1 ──► T5 ──► T8
T1 ──► T6 ──► T8
T1 ──► T7 ──► T8
```

No cycles. T2–T7 edit disjoint files and are parallel-safe after T1; this run executes them sequentially (one session per checkout).

## Common verification (every task)

`npm test` green · `git diff --check` clean · `git diff --stat` touches only the task's Scope files · no byte changes under `.claude/skills/impeccable-bridge/`, `.claude/skills/impeccable/`, or the eight routed skills other than `software-architect` (`git diff --stat -- .claude/skills/{impeccable-bridge,impeccable,api-design-principles,error-handling-patterns,tdd,systematic-debugging,nestjs-expert,golang-pro,aws-serverless,ai-agent-development}` empty — NFR-2, NFR-4) · before the Reviewer spawn, grep the edited file for a restated matrix row (`| **<activity>** |`) or a `\.(md|js):\d+` pointer (KZ-changes--kaizen-loop-closure-2, KZ-005).

---

### T1: Write the Backend Routing Matrix

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~170 LOC + 5 count sites) |
| Depends on | — |
| Requirements | FR-1 (both scenarios: every skill placed, held once; BUT two leads / no lead; AND stack lead only `implement` and `framework-selection`), FR-2 (rule; Go + `tdd` scenario incl. BUT coverage; NestJS bug scenario incl. BUT no fix before root cause), FR-3 (rule; not-significant scenario incl. BUT no new style; stack-absent scenario incl. AND no install advice), FR-4 (cards; BUT no line numbers / no over-claim), FR-9 (Go layering route), NFR-1, NFR-5, NFR-6, NFR-7 |
| Design | §8.1–§8.5 content; §5.1 line form + `tdd` ownership; §7.1 fall-through; DD-1, DD-3, DD-4, DD-7–DD-9, DD-14, DD-15; P-6, P-16 |
| Scope | (a) Create `.claude/skills/software-architect/references/backend-routing.md` with sections in this order, named to match the design matrix where shared (NFR-7): title + one-paragraph purpose (who reads it; held once; read without activating the skill; routing only); *Decision rule* (§8.1, eight rules); *Stack table* (§8.2); *Matrix* (§8.3, 19 rows, header `\| Activity \| Context \| Lead \| Support \| Row rule \|`); *Expertise cards* (§8.4, nine cards, header `\| Skill \| Expert at \| Supports \| Must not decide \| Evidence \|`); *Backend route line* (§5.1 form, field table, `tdd` ownership paragraph); *Go layering* (§8.5); *Absent file* (§8.5); *Attribution*. No `file:line` pointer; no third-party text beyond quoted headings; no `install` advice. (b) `test/install-cursor.test.js`: `SKILL_FILE_EXPECTED` `+ 1`; message `:253` names `+ 1 backend-routing.md`; comments `:228` (`14 + 318 = 332`), `:244`, `:347` updated |
| Tests | `node --test test/install-cursor.test.js` green; T8 (held once, skill set, activities, one lead, stack lead closed, card evidence, no pointers, no install advice) |
| Falsifier | Leave `SKILL_FILE_EXPECTED` unchanged after creating the file → red **R1** (observed, Document Control). For the matrix content: T8's falsifiers |
| Red run | R1 observed at baseline (quoted above). The matrix itself: `predicted — greenfield artifact (observed in T8)` — at baseline `ls .claude/skills/software-architect/references/backend-routing.md` → `No such file or directory` |
| Disqualifier | A Lead cell holds two names or none; a stack skill leads any activity other than `implement` / `framework-selection`; a card claim absent from its cited heading's body (quote each heading as found with `grep -n '^#.*<heading>' <file>` in the completion report, and the body line that states the claim); `grep -n "317\|331" test/install-cursor.test.js` returns a hit after the edit |
| Consumers | `test/install-cursor.test.js` `:228`, `:244`, `:249`, `:253`, `:347` (P-6); T2–T7 point at the file |
| Review | `full` — the single source every other surface points at |
| Done criteria | File exists with the nine sections; 19 rows and 9 cards listed in the completion report; each card's heading and claim line quoted; `install-cursor.test.js` green; `npm test` 1419 pass, 0 fail |
| Skills | `software-architect`, `cognitive-doc-design` |

### T2: `software-architect` *Routing* row

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | XS (~3 LOC) |
| Depends on | T1 |
| Requirements | FR-9 (scenario: *Routing* names the file; BUT `architecture-styles.md` unchanged), FR-1 *Held once*, NFR-2 |
| Design | §4 T2 row; DD-2; P-2, P-4 |
| Scope | `.claude/skills/software-architect/SKILL.md` *Routing — load the matching reference* table: one row — "Which skill leads a backend decision (architecture, framework, module design, API contract, error model, implementation, tests, debugging, performance) — read by `/akili-specify` and the Leader for any backend work, architecturally significant or not, without activating this skill" → `references/backend-routing.md`. No other byte of the file changes (no version bump) |
| Tests | T8 wiring ("software-architect *Routing* has the row") |
| Falsifier | Remove the row → T8 wiring red (`predicted — greenfield artifact (observed in T8)`: the test file does not exist yet) |
| Red run | `predicted — greenfield artifact (observed in T8)` |
| Disqualifier | `git diff -- .claude/skills/software-architect/SKILL.md` shows more than the one added row; `git diff --stat -- .claude/skills/software-architect/references/architecture-styles.md` non-empty |
| Consumers | `test/diagram-design.test.js:373` reads `views-documentation.md` only (unaffected) |
| Review | `checklist` — one table row; small but it is the skill's routing contract |
| Done criteria | The row present; diff is one line; `npm test` green |
| Skills | `software-architect` |

### T3: `/akili-specify` — Step 2.1 pointer and Step 3.2 backend rule

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~20 LOC, 3 sites in one file) |
| Depends on | T1 |
| Requirements | FR-6 (scenario: endpoint task carries `Backend route:` with `api-design-principles` lead for the contract; AND skills list ⇔ line for backend skills; BUT no stack load-direction), FR-1 *Held once* (BUT no restated row, no line pointer), FR-3 stack-absent AND IT MUST NOT recommend installing, NFR-3, NFR-4, NFR-5 |
| Design | §5.1, §7.1, §8.5 *Absent file*; DD-2, DD-5; P-7, P-10, P-19, P-20 |
| Scope | `.claude/commands/akili-specify.md`: (a) Step 2.1, after the fallback list and before `#### Step 2.2`: one sentence — when the design has backend work, settle each backend decision's lead from `software-architect` → `references/backend-routing.md` (read it by path, significant or not) and record it next to the decision; when the file is absent, proceed as today and say so once. Keep the `` - `golang-pro` `` list line; name no stack skill and no `gsap-animation`. (b) Step 3.2 skill-inventory sentence: add "backend skills routed by `software-architect` → `references/backend-routing.md`". (c) New **Preferred backend skill rule:** block placed **before** `Preferred UI/UX skill rule:` — every backend task's Scope carries a `Backend route:` line (form in the matrix's *Backend route line*); its skills list names exactly the routed backend skills the line names; `test-first` appears only when the task lists `tdd`, whose final assignment is the Leader's; stack support comes from the project `## Skill Map`, `none — project conventions` when it has none; names no `binding: stack` skill and recommends no install |
| Tests | T8 wiring, governance, `tdd` switch, absent file, no install advice; existing `design-skill-routing.test.js`, `design-skill-routing-coverage.test.js`, `golang-skill.test.js` stay green |
| Falsifier | A `gsap-animation` mention in the Step 2.1 sentence → red **R3** (observed); dropping the `golang-pro` list line → red **R4** (observed); placing the rule after the UI rule and naming `api-design-principles` → `design-skill-routing.test.js` FR-3 red (same assertion family as R2) |
| Red run | R3, R4 observed (Document Control) |
| Disqualifier | The rule text names any skill whose frontmatter says `binding: stack` (compute the list with `grep -l "binding: stack" .claude/skills/*/SKILL.md` and quote it); the backend rule sits between `Preferred UI/UX skill rule:` and `#### Step 3.3`; a restated matrix row |
| Consumers | `test/design-skill-routing.test.js:139`, `:212` (UI-rule slice); `test/design-skill-routing-coverage.test.js:69`, `:112` (Step 2.1), `:151` (UI rule); `test/golang-skill.test.js:126-134` (fallback slice) (P-7, P-19) |
| Review | `full` — command text every future spec runs |
| Done criteria | Three sites edited; the `binding: stack` list quoted with zero hits in the new text; the three consumer tests green; `npm test` green |
| Skills | `cognitive-doc-design` |

### T4: `/akili-constitution` Step 8D — `### Backend routing` block

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~15 LOC, 2 sites) |
| Depends on | T1 |
| Requirements | FR-7 (rule; Django no-skill scenario incl. AND IT MUST NOT name an uninstalled skill; no-backend scenario; Safe Update scenario incl. BUT no restated rows; coexistence scenario incl. BUT `### Design routing` text unchanged), NFR-3, NFR-4 |
| Design | §5.2; DD-6; P-11, P-19 |
| Scope | `.claude/commands/akili-constitution.md` Step 8D: (a) item **5** after item 4 — "**A `### Backend routing` block under `## Skill Map`, when the project has server-side code** (any stack, packaged skill or not)", fields one line each: stack(s) with evidence path · stack support skill per stack, named only from the Skill Map just built, or `none — project conventions` · one line pointing at `software-architect` → `references/backend-routing.md` by name; "The block holds **no matrix rows**". No stack-skill name, no `file:line`, no install advice. (b) One bullet after the Safe Update bullet of *Mode-specific policy (mirror Step 8B)* — "The `### Backend routing` block follows the same three policies: declared stack (Seed), scan evidence (Discovery), preserved and only newly detected evidence proposed (Safe Update)"; it must not start with `**Active AKILI-SPECS (Safe Update):**`. Item 4 and the three existing bullets stay byte-identical |
| Tests | T8 wiring + governance + no install advice; `design-skill-routing.test.js` FR-3 / A-15b and `design-skill-routing-coverage.test.js` FR-10 stay green |
| Falsifier | A stack-skill name in item 5 → red **R2** (observed) |
| Red run | R2 observed (Document Control) |
| Disqualifier | `git diff` shows any changed (not added) line in item 4 or the three policy bullets; item 5 names any `binding: stack` skill |
| Consumers | `test/design-skill-routing.test.js:141`, `:213`; `test/design-skill-routing-coverage.test.js:120`, `:135-136`; `test/golang-skill.test.js:128-131` (Step 5 / 8D candidate lists, unchanged) (P-7, P-19) |
| Review | `full` |
| Done criteria | Item 5 and the bullet added; diff of item 4 and the three bullets is empty; the three consumer tests green; `npm test` green |
| Skills | `cognitive-doc-design` |

### T5: Leader persona item 3

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | XS (~6 LOC, 1 site) |
| Depends on | T1 |
| Requirements | FR-5 (collision scenario; BUT brief carries names only; legacy-task scenario incl. BUT no fail/block), FR-6 `tdd` switch (design §5.1), NFR-5 |
| Design | §5.1 `tdd` ownership; §8.5 *Absent file*; DD-10; P-9, P-20 |
| Scope | `.claude/templates/leader.md`, section `primary-instructions`, item 3 only: (a) in the swap-example parenthesis add "two backend skills claiming one decision → the lead `software-architect` → `references/backend-routing.md` names"; (b) one sentence after the parenthesis: the brief carries only the lead and support names, never the matrix; a task with no `Backend route:` line runs as today; adding or dropping `tdd` switches the line's test activity (`test-first` ⇔ `test-suite`) and is the existing one-line deviation record; when the file is absent, proceed as today and say so once. Keep ``UI → `impeccable-bridge` `` byte-identical; no `file:line`; section markers and ids unchanged |
| Tests | T8 wiring, names only, legacy task, `tdd` switch, absent file; `design-skill-routing.test.js` A-15b and `:203` green; `persona-digests.test.js`, `agents-doctor.test.js` green |
| Falsifier | A `leader.md:25` pointer in the new text → red **R5** (observed) |
| Red run | R5 observed (Document Control) |
| Disqualifier | Any change outside item 3; an `akili:section` marker line changed; ``UI → `impeccable-bridge` `` no longer present |
| Consumers | `test/design-skill-routing.test.js:149-150` (whole-file pointer check), `:203` (UI example); `persona-digests.test.js`, `agents-doctor.test.js` (section ids) |
| Review | `full` — persona text every `/akili-execute` run loads |
| Done criteria | Item 3 edited; `git diff` confined to item 3; consumer tests green; `npm test` green |
| Skills | `cognitive-doc-design` |

### T6: Repo `AGENTS.md` `## Backend Skills` + CHANGELOG

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~30 LOC) |
| Depends on | T1 |
| Requirements | FR-8 (rule; scenario: section names the same skill set as the cards; BUT no restated rows), NFR-1, NFR-4, NFR-6 |
| Design | §4 T6 row; DD-12; P-12 |
| Scope | `AGENTS.md`: new `## Backend Skills` between `## Design Skills` and `## CodeGraph` — the decision rule in one line, one bullet per routed skill (the nine, one-line role each, worded from its card), and the pointer `.claude/skills/software-architect/references/backend-routing.md`. `## Design Skills` and `## Skill Usage` untouched. `CHANGELOG.md` `## [Unreleased]`: replace "No unreleased changes yet." with an `### Added` entry (matrix, `Backend route:` line, Step 8D block, Leader rule, `## Backend Skills`) and a note that installs holding an older `software-architect` folder get the matrix with `install --force` (P-20) |
| Tests | T8 skill set (`AGENTS.md` names the nine), held once, no pointers; `design-skill-routing.test.js` A-14 (`## Design Skills` names its eight) green |
| Falsifier | Drop `aws-serverless` from the section → T8 skill-set red (`predicted — greenfield artifact (observed in T8)`) |
| Red run | `predicted — greenfield artifact (observed in T8)` |
| Disqualifier | `git diff -- AGENTS.md` touches a line inside `## Design Skills`; a matrix row signature in the section |
| Consumers | `test/design-skill-routing.test.js:92-100`, `:142` (`## Design Skills` section reader) |
| Review | `checklist` — guide text and release notes, low blast radius |
| Done criteria | Section and CHANGELOG entry present; `npm test` green |
| Skills | `cognitive-doc-design` |

### T7: Docs match the matrix

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~40 LOC, 10 files, one clause each) |
| Depends on | T1 |
| Requirements | FR-8 (`software-architect.md` and `governance.md` name the matrix; every other role-stating page does not contradict it), NFR-1 |
| Design | §4 T7 rows; P-13, P-21 |
| Scope | Name the matrix in `docs/skills/software-architect.md`, `docs/skills/governance.md` (one sentence: routing matrices — design and backend — each held once in the skill owning the decisions), `docs/flow.md` §9 `stack` bullet, `docs/commands/akili-specify.md` (the `Backend route:` line), `docs/commands/akili-constitution.md` (the Step 8D block). Narrow the stated role, one clause each, in `docs/skills/nestjs-expert.md:5`, `docs/skills/aws-serverless.md:9`, `docs/skills/ai-agent-development.md:12`, `docs/overview.md:78`, `docs/skills/README.md:21` (e.g. "supports architecture under the backend routing matrix; leads framework selection for agents"). First-cell names and links unchanged |
| Tests | T8 held once (no restated row under `docs/`); `docs-overview.test.js` green |
| Falsifier | Re-run the P-13 grep after the edit: a role claim that still says a stack skill *decides* architecture, testing strategy or debugging is a mismatch (`grep -nE "agent architecture\|architecture decisions\|Guides NestJS architecture\|serverless architecture" docs/*.md docs/skills/*.md` — each hit must carry the routing qualifier) |
| Red run | Baseline: the P-13 grep returns the five role-claim lines without a qualifier (observed 2026-11-02; design P-13) |
| Disqualifier | A first table cell changed in `docs/overview.md` or `docs/skills/README.md`; a matrix row pasted into a doc |
| Consumers | `test/docs-overview.test.js:112-119` (P-21); `test/golang-skill.test.js:135-137` (`docs/commands/akili-constitution.md` stack-skills line, keep `golang-pro`) |
| Review | `checklist` — descriptive docs |
| Done criteria | Ten files edited; post-edit P-13 grep quoted with every hit qualified; `npm test` green |
| Skills | `cognitive-doc-design` |

### T8: Contract tests

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~320 LOC — KZ-bugfix--init-ctrlc-abort-2) |
| Depends on | T1–T7 |
| Requirements | requirements §8 defect classes (all automated rows); FR-1, FR-3 (no install advice), FR-4, FR-5 (names only, legacy), FR-6, FR-7, FR-8, FR-9; NFR-1, NFR-3 |
| Design | §7.2 (all rows, rev. 2) |
| Scope | `test/backend-skill-routing.test.js` (new), each test tagged `@akili-spec changes/go-backend-routing/backend-skill-routing <FR>`: held once (rows + cards over `.claude/`, `docs/` minus `docs/specs/`, `AGENTS.md`, `README.md`); skill set (folders, cards, Matrix rows, `AGENTS.md`); activities (10, three significant/not pairs, one `implement` row per stack); one lead; stack lead closed; card evidence resolves (heading exists in the named file); no line pointers; wiring (specify 2.1 + 3.2, 8D, leader, `software-architect` *Routing*, `project-structure.md` exists); governance (`binding: stack` computed from frontmatter); legacy task; names only; `tdd` switch; absent file; no install advice. Never read `docs/specs/` (KZ-changes--archify-diagrams-1) |
| Tests | itself |
| Falsifier | Each §7.2 falsifier, **executed** on a temporary edit and reverted with `git checkout --` (the same method as R1–R5), red quoted per test |
| Red run | `predicted — greenfield artifact (observed in T8)`: create a detached worktree of `0af13bd` in the scratchpad (`git worktree add <scratch>/base 0af13bd`), copy the new test file in, run it, quote the red assertions (expected: every wiring/held-once/skill-set test red); `git worktree remove` afterwards |
| Disqualifier | A test that stays green under its own falsifier; a test reading `docs/specs/`; both sides normalized before comparing |
| Consumers | none |
| Review | `full` |
| Done criteria | Suite green on the post-change tree; baseline red and every falsifier red quoted in `execution.md`; `npm test` = 1419 + new tests, 0 fail; `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green |
| Skills | `tdd` |

### T9: Held-out routing walkthrough (HITL)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | XS (no shipped LOC; evidence in `execution.md`) |
| Depends on | T8 |
| Requirements | requirements §8 "Agents do not follow the routing" (substitute check); FR-2, FR-3, FR-5, FR-6 |
| Design | §5.1, §8.1–§8.3 |
| Scope | A fresh read-only agent on a different model from the authors gets only the shipped text (`backend-routing.md`, `akili-specify.md` Step 3.2, `leader.md` item 3) and three profiles **not cited in the matrix**: (a) a Go service adding a paginated REST endpoint with retries to a flaky upstream, task lists `tdd`; (b) a NestJS app on AWS Lambda fixing a production bug where an SQS consumer double-processes messages; (c) a Python FastAPI service (no packaged skill) adding a new background worker module, architecturally significant. It writes the `Backend route:` line for each and names who decides retries, error body, test values and diagnosis |
| Tests | — |
| Falsifier | Expected: (a) `api-contract` lead `api-design-principles`, `error-model` lead `error-handling-patterns` (retry/circuit breaker), `test-first` lead `tdd`, `implement` lead `golang-pro`; (b) `bug-diagnosis` lead `systematic-debugging`, support `nestjs-expert` and `aws-serverless`, no fix before root cause; (c) `architecture` / `module-design` lead `software-architect`, support `none — project conventions`, no install advice. Any other lead, two leads, or a stack lead outside `implement` / `framework-selection` → mismatch recorded |
| Red run | n/a — a walkthrough, not a test |
| Disqualifier | The agent saw this spec folder or the expected answers; a mismatch re-prompted away instead of reported |
| Consumers | none |
| Review | `checklist` |
| Done criteria | Three routings and their comparison with the expected leads logged in `execution.md`; mismatches presented to JC at the HITL pause |
| Skills | — |

## Coverage (scenario and clause level)

| Requirement clause | Task(s) |
|---|---|
| FR-1 every skill placed (each in ≥ 1 row, one card) | T1, T8 (skill set incl. Matrix rows) |
| FR-1 BUT no two leads, no row without a lead | T1, T8 (one lead) |
| FR-1 AND stack lead only `implement`, `framework-selection` | T1, T8 (stack lead closed), T9 |
| FR-1 held once; BUT no restated row, no line pointer | T1, T2–T7 (pointers only), T8 (held once, no pointers) |
| FR-2 rule | T1 (*Decision rule*) |
| FR-2 Go + `tdd`: values from spec, idiom from `golang-pro`; BUT coverage never overrides | T1 (`test-first` row), T9 (a) |
| FR-2 NestJS bug: `systematic-debugging` leads; BUT no fix before root cause | T1 (`bug-diagnosis` row), T9 (b) |
| FR-3 context selects the variant | T1 (rows keyed by context) |
| FR-3 not significant: `software-architect` not loaded; BUT no new style | T1 (not-significant rows), T3 (pointer reads the file without activating) |
| FR-3 stack absent: support `none — project conventions`; AND IT MUST NOT recommend installing | T1 (stack table, `implement` / other), T3, T8 (no install advice), T9 (c) |
| FR-4 card evidence resolves; BUT no line number, no over-claim | T1 (claims quoted), T8 (card evidence, no pointers) |
| FR-5 collision: lead named in brief | T5, T9 |
| FR-5 BUT brief carries names only | T5, T8 (names only) |
| FR-5 legacy task; BUT missing line never fails | T5, T8 (legacy task) |
| FR-6 Step 2.1 pointer, Step 3.2 `Backend route:` | T3, T8 (wiring) |
| FR-6 AND skills list ⇔ line (backend skills only) | T3, T5 (`tdd` switch), T8 |
| FR-6 BUT no stack load-direction | T3, T8 (governance) |
| FR-7 block for backend projects | T4, T8 |
| FR-7 Django: support `none`; AND IT MUST NOT name an uninstalled skill | T4, T8 (no install advice) |
| FR-7 no backend → no block | T4 |
| FR-7 Safe Update preserves; BUT no rows | T4, T8 (held once) |
| FR-7 coexists; BUT `### Design routing` unchanged | T4 (diff empty), existing design tests |
| FR-8 `## Backend Skills` names same set; BUT no rows | T6, T8 |
| FR-8 `software-architect.md`, `governance.md` name the matrix; others do not contradict | T7 |
| FR-9 *Routing* row; Go layering → `project-structure.md`; BUT `architecture-styles.md` unchanged | T1 (*Go layering*), T2, T8 (wiring) |
| NFR-1 held once | T8 |
| NFR-2 routed skills untouched; hash lock green | every task (common verification), `golang-skill.test.js` |
| NFR-3 governance | T3, T4, T8 |
| NFR-4 design spec untouched | every task (common verification), T4 diff check |
| NFR-5 token economy | T1 (route line), T5 (names only) |
| NFR-6 ships to six targets | T1 (whole-folder copy, P-5), T6 (CHANGELOG `--force` note) |
| NFR-7 same schema as design | T1 (section names) |
| §8 "agents do not follow the routing" | T9 |
| §8 "routing cell is wrong judgment" | judgment-day (done, `judgment.md`); JC at this gate |
