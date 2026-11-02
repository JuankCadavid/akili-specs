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
