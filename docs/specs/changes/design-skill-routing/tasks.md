# Tasks: Design Skill Routing — Impeccable builds, and every design skill has a stated job

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/design-skill-routing` |
| Status | Written 2026-11-01 under `pre-approved (JC, 2026-11-01 10:04 UTC-5, via Grok Bot)`; Step 3.3 gate **auto-approved (pre-approved mode)** |
| Requirements / Design | `requirements.md` rev. 2 (Phase 1 approved by JC 10:04); `design.md` rev. 2 (fixed, not re-judged — `judgment.md`) |
| Baseline | `ac1d0db`. `npm test` → **1385 pass, 0 fail** (run 2026-11-01) |
| Baseline readings (run 2026-11-01: `grep -rnF -- '<p>' .claude docs README.md AGENTS.md`, minus `docs/specs/` and `.claude/skills/impeccable/`) | `Implementer loads Impeccable's craft floor` → `akili-specify.md:462`, bridge `:120`; `Craft floor before UI edits` → bridge `:146`; ``Use `frontend-design`, `ui-ux-pro-max` `` → `AGENTS.md:51`; ``Recommend generating the mockup with the `stitch-design` `` → `akili-propose.md:132`; `` `ui-ux-pro-max` if available `` → `akili-seo.md:158`; ``load `gsap-animation` and read the reference file matching the task`` → `akili-specify.md:235`; ``UI → `ui-ux-pro-max` `` and ``animation → `gsap-animation` `` → `leader.md:25`; ``Use `gsap-animation` for animation work`` → `AGENTS.md:52`, `docs/skills/README.md:57` — **10 stale hits**. `design-routing`, `Design route:`, `### Design routing` → **0** |
| Commit prefix | `[SPEC:changes/design-skill-routing]`. Local commits only — no push, PR, merge, tag or publish |
| Budget (design §12) | 11 tasks · **~650 authored LOC** (JC's budget) · ~22 review rounds. `/akili-execute` stops and escalates when actuals exceed it |
| PR strategy | One PR into `dev` (~650 LOC, one concern). Not opened in this cycle |
| `skip-eligible` tasks | **None** — every task edits rules text other agents execute, or the tests that guard it |

## Dependency graph

```text
T1 ──► T2 ──► T3 ──► T9 ──► T10
        T2 ──► T4 ──► T9
        T2 ──► T5 ──► T9
T1 ──► T6 ──► T9
T1 ──► T7 ──► T9
T1 ──► T8a ─► T9
T1 ──► T8b ─► T9
```

No cycles. T3–T8b edit disjoint files and are parallel-safe after their parents; this run executes them sequentially (one session per checkout).

## Common verification (every task)

`npm test` green (except a red a later task owns, named in the task) · `git diff --check` clean · `git diff --stat` touches only the task's Scope files · no byte under `.claude/skills/impeccable/` changes (`git diff --stat -- .claude/skills/impeccable` empty).

---

### T1: Write the Design Routing Matrix

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~160 LOC) |
| Depends on | — |
| Requirements | FR-1 (both scenarios, BUT/AND clauses), FR-2 (ladder, both scenarios), FR-3, FR-4 (direction scenario: code-led, questions from `design.md`, Pivot; ENV-0 scenario), FR-5 (full/light as AKILI scope limit; light and full scenarios), FR-6 (scenario incl. BUT), FR-7 (both scenarios), FR-8 (both scenarios), FR-9 (supporting line), NFR-1, NFR-4, NFR-5, NFR-7 |
| Design | §8.1–§8.6 verbatim content; §7.1; §5.1 (line form, Done-criteria wording); DD-1, DD-3–DD-9, DD-13, DD-14 |
| Scope | Create `.claude/skills/impeccable-bridge/references/design-routing.md`: title + one-paragraph purpose; *Decision rule* (§8.1, six rules); *Environment classification* (§7.1 ladder); *Matrix* (§8.2: eight rows, four `ENV-*` columns, one lead per cell, supporting line); *Expertise cards* (§8.3, nine cards with evidence `file → heading`); *Build route* (§8.4 steps 1–7 incl. code-led, no documenter, questions from `design.md` else Pivot, `finish review: not run (AKILI execute)`, polish limit table); *Motion* (§8.5); *Mockup route* (§8.6); *Design route line* (§5.1 form + Done-criteria sentence + sizing note); *Attribution* (MIT, AKILI; Impeccable credited, no Impeccable text copied). No line-number pointers (KZ-005); host-neutral invocation (`/impeccable`, `$impeccable` in Codex) |
| Tests | T9 (held once, skill set, one lead per cell, card evidence, no line pointers, execute boundary) |
| Falsifier | T9's "one lead per cell" goes red if a cell reads `ui-ux-pro-max + frontend-design`; "card evidence" goes red if a card cites a heading absent from its file; "execute boundary" goes red if the code-led sentence is deleted |
| Red run | `predicted — greenfield artifact (observed in T9)`: at baseline `ls .claude/skills/impeccable-bridge/references/design-routing.md` → `No such file or directory` (observed) |
| Disqualifier | Any cell holds two leads or `—`; any card's evidence heading does not exist in the named file (check each with `grep -n '^#.*<heading>' <file>` and quote the hits in the completion report); any text copied from `.claude/skills/impeccable/` beyond a quoted heading or ≤ 15-word phrase in quotes |
| Consumers | none yet (T2–T8b point at it) |
| Review | `full` — the single source every other surface points at |
| Done criteria | File exists; every card evidence heading quoted as found; completion report lists the eight activities and nine cards |
| Skills | `impeccable-bridge`, `cognitive-doc-design` |

### T2: Point the bridge at the matrix (and update its two pinned assertions)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~25 LOC) |
| Depends on | T1 |
| Requirements | FR-1 *Held once*, FR-4 (execute row), FR-13 sweep (bridge hits), NFR-1 |
| Design | §2, §4 bridge row, §7.2, §9; DD-12; J-4 |
| Scope | `.claude/skills/impeccable-bridge/SKILL.md`: (a) *Roles* — one line under the table naming `design-routing.md` as the routing authority; add a `gsap-animation` row (motion implementation per the matrix) and a line naming stack skills as implementation layers through the Skill Map; (b) *Who does what* `/akili-execute` row, `vendored`/`user-installed` cell → "The Implementer builds code-led with the task's `Design route:` playbook, reads the craft floor before edits and runs `polish` (`references/design-routing.md` → *Build route*)"; (c) *Phase map* row *Craft floor before UI edits* → *Build (playbook → craft floor → polish)* with the same pointer; (d) frontmatter `version: "2.1"`, description adds "build, design routing". `test/impeccable-bridge.test.js`: `version` regex → `2\.1`; bridge `.md` file list → add `references/design-routing.md`. **Amended (E-1, approved by JC, 2026-11-01 10:41 AM UTC-5, vía Grok Bot: "Sí, aprueba la corrección del conteo a 309 y que siga hasta el archive"):** `test/install-cursor.test.js` packaged skill-file count 308 → 309 (`SKILL_FILE_EXPECTED` and its message/comments, `SHARED_ROOT_FILE_COUNT` comment 322 → 323) and any shared-root fixture the count drives |
| Tests | `node --test test/impeccable-bridge.test.js` green |
| Falsifier | Leave the `version: "2\.0"` assertion unchanged → `impeccable-bridge.test.js` red at the version assertion (observed below) |
| Red run | After T1 only, `node --test test/impeccable-bridge.test.js` must go red on the file-list `deepStrictEqual` (T1 adds a `.md` file) — the Implementer runs it before editing and quotes the failing assertion |
| Disqualifier | The bridge restates any matrix row or card; the *Who does what* table loses a row or a column; any other `impeccable-bridge.test.js` assertion changed |
| Consumers | the six commands reading the bridge (P-15); `impeccable-bridge.test.js` `:33`, `:37`, `:53`, `:87-109`; `ui-ux-pro-max`, `frontend-design` SKILL; `install-cursor.test.js` count (P-19) |
| Review | `full` — shared rules table read by six commands |
| Done criteria | Bridge greps: `Craft floor before UI edits` → 0, `Implementer loads Impeccable's craft floor` → 0, `design-routing` ≥ 2; `impeccable-bridge.test.js` green; red run quoted |
| Skills | `impeccable-bridge` |

### T3: `/akili-specify` — environment class, direction, motion, `Design route:` rule

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~30 LOC) |
| Depends on | T2 |
| Requirements | FR-2 (recorded per screen with evidence), FR-4 (direction settled at specify; code-led execute), FR-7 (specify rule), FR-9 (no stack-skill load-direction), FR-11 (scenario incl. AND IT MUST NOT `ui-ux-pro-max`), NFR-3 |
| Design | §5.1, §7.1, §8.4 step 3, §8.5; DD-2, DD-4, DD-7, DD-9 |
| Scope | `.claude/commands/akili-specify.md` only: Step 2.1 UI paragraph — record each screen's environment class (`ENV-*`, ladder in `design-routing.md`) with evidence next to the page mode; when a new world or a whole new surface is in scope, the direction (incl. the roll and any locked comp/sketch) is settled here and recorded in `design.md`, because execute is code-led; animation line → "motion per `design-routing.md` → *Motion*: Impeccable `animate` owns purpose; load `gsap-animation` only when the project uses GSAP or the design records it". Step 3.2 skill-inventory sentence → name the matrix; *Preferred UI/UX skill rule* → every UI task's Scope carries a `Design route:` line (form in `design-routing.md`), its Done criteria carry the evidence sentence, its skills list `impeccable-bridge` plus Skill Map stack skills; `ui-ux-pro-max` only for catalog options; ENV-0 → `frontend-design` |
| Tests | T9 wiring + governance + sweep |
| Falsifier | T9 "wiring" red if `Design route:` is absent from `akili-specify.md`; "governance" red if the rule paragraph says `use shadcn-ui` |
| Red run | Baseline `grep -cF 'Design route:' .claude/commands/akili-specify.md` → `0`; `grep -cF 'load \`gsap-animation\` and read the reference file matching the task'` → `1` (both observed) |
| Disqualifier | Any matrix row restated; a stack skill named in the new rule outside a Skill Map deferral; the Premise Ledger, Falsifiability or other Step 3.2 rules altered |
| Consumers | `docs/commands/akili-specify.md` (T8b); `impeccable-bridge.test.js:87-109` (specify must keep `impeccable-bridge` and a skill-source pointer) |
| Review | `full` — the command that writes every UI task |
| Done criteria | Baseline hits for this file → 0; `Design route:` and `design-routing` present; `impeccable-bridge.test.js` green |
| Skills | `impeccable-bridge` |

### T4: `/akili-propose` mockup route and `/akili-seo` UX rule

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~15 LOC; 2 files, ≤ 4 sites — bundled under the 8-site bound) |
| Depends on | T2 |
| Requirements | FR-8 (both scenarios, BUT no Stitch unless asked), FR-12 |
| Design | §8.6; DD-8 |
| Scope | `.claude/commands/akili-propose.md` *Mockup Fallback*: when the skill source is `vendored`/`user-installed`, offer the Impeccable direction picker first (existing image-credit question for comp-led kept), name Stitch as available on request, generate with `stitch-design` only when the user asks; the picker's result is the Visual Reference `/akili-specify`'s `shape` consumes; when `missing`, today's order (`stitch-design` → Claude Design → HTML sketch). Pointer to `design-routing.md` → *Mockup route*. `.claude/commands/akili-seo.md`: replace the two-bullet skill preference with "load `impeccable-bridge`; Impeccable leads UX/UI recommendations, `ui-ux-pro-max` is a catalog, fallback per the bridge when the skill source is `missing`" |
| Tests | T9 wiring (picker before Stitch; seo names `impeccable-bridge`) + sweep |
| Falsifier | T9 "wiring" red if the first Stitch mention precedes the picker in *Mockup Fallback* |
| Red run | Baseline `grep -cF 'Recommend generating the mockup with the \`stitch-design\`' .claude/commands/akili-propose.md` → `1`; `grep -cF '\`ui-ux-pro-max\` if available' .claude/commands/akili-seo.md` → `1` (observed) |
| Disqualifier | Claude Design or HTML-sketch fallbacks removed; Visual Reference *Source* list changed; `impeccable-bridge.test.js:87-109` red |
| Consumers | `docs/commands/akili-propose.md` (T8b) |
| Review | `checklist` |
| Done criteria | Both baseline hits → 0; tests green |
| Skills | `impeccable-bridge` |

### T5: `/akili-constitution` Step 8D — `### Design routing` block

| Field | Value |
|---|---|
| Status | `[x]` — closed after E-2 (FR-10 amended, JC, 2026-11-01 11:08 AM UTC-5: "Opción A: enmienda FR-10 para que la sección de diseño se genere solo en proyectos con interfaz") |
| Size | S (~25 LOC) |
| Depends on | T2 |
| Requirements | FR-10 (block fields; Safe Update scenario incl. BUT no matrix rows), FR-9, NFR-3 |
| Design | §5.2; DD-10 |
| Scope | `.claude/commands/akili-constitution.md` Step 8D: new item 4 — scaffold `### Design routing` under `## Skill Map` with the §5.2 fields, resolved from the stack + design-system evidence (ladder in `design-routing.md`); stack skills named only from the Skill Map just built (carve-out 1); one line pointing at the matrix; mode policy: Seed → from declared stack, Discovery → from scan evidence, Safe Update → preserve a customized block, propose only newly detected evidence |
| Tests | T9 wiring + governance |
| Falsifier | T9 "wiring" red if `### Design routing` is absent from Step 8D |
| Red run | Baseline `grep -cF '### Design routing' .claude/commands/akili-constitution.md` → `0` (observed) |
| Disqualifier | Matrix rows restated; items 1–3 of Step 8D altered; `impeccable-bridge.test.js:109` red |
| Consumers | `docs/commands/akili-constitution.md` (T8b) |
| Review | `checklist` |
| Done criteria | Item 4 present with all §5.2 fields; tests green |
| Skills | `impeccable-bridge` |

### T6: Persona skill examples (Leader, Tester)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | XS (~4 LOC; 2 lines) |
| Depends on | T1 |
| Requirements | NFR-6 (rev. 2), FR-13 sweep (persona hits), FR-7 |
| Design | §3 live path, §4 persona rows; DD-2; P-13, P-18 |
| Scope | `.claude/templates/leader.md` *primary-instructions* section, the swap parenthesis only: `UI → \`ui-ux-pro-max\`, animation → \`gsap-animation\`` → `UI → \`impeccable-bridge\` (its Design Routing Matrix routes the rest, motion included)`; keep `video-deliverable → video-production` and `tdd` examples. `.claude/templates/tester.md` *context-alignment* Skill Loading example: `ui-ux-pro-max` → `impeccable-bridge`. Section markers, ids and `since=` untouched (release step rewrites them) |
| Tests | T9 sweep + wiring (`leader.md` names `impeccable-bridge`); `persona-digests.test.js`, `agents-doctor.test.js` green |
| Falsifier | T9 sweep red if ``UI → `ui-ux-pro-max` `` survives |
| Red run | Baseline `grep -cF 'UI → \`ui-ux-pro-max\`' .claude/templates/leader.md` → `1` (observed) |
| Disqualifier | Any other persona line changed (`git diff -U0` shows exactly two changed lines); any `akili:section` marker changed |
| Consumers | deployed project `.agents/` copies (upgraded by `akili doctor --agents --fix` after release); `digests.json` (release step) |
| Review | `checklist` |
| Done criteria | Two-line diff; tests green |
| Skills | — |

### T7: Adapted skills point at the matrix

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~20 LOC; 3 sections) |
| Depends on | T1 |
| Requirements | FR-14, FR-7 (gsap), FR-3 (no over-claim) |
| Design | §4 adapted-skills row; §8.3, §8.5 |
| Scope | AKILI-integration sections only: `ui-ux-pro-max/SKILL.md` *AKILI-SPECS Integration* (catalog role; `/akili-execute` row → "when a task's `Design route:` needs catalog options"; pointer to the matrix); `gsap-animation/SKILL.md` *AKILI-SPECS Integration* (loaded when the matrix *Motion* selects GSAP; Impeccable `animate` owns purpose); `frontend-design/SKILL.md` *8. Integration With Other Skills* (ENV-0 lead; pointer). Upstream sections untouched |
| Tests | `impeccable-bridge.test.js:122-124` green (`frontend-design` keeps `impeccable-bridge`; `ui-ux-pro-max` never "AKILI's preferred UI/UX skill"); T9 sweep |
| Falsifier | Deleting `impeccable-bridge` from `frontend-design` §8 → `impeccable-bridge.test.js:124` red |
| Red run | Baseline `grep -cF 'design-routing' .claude/skills/{ui-ux-pro-max,gsap-animation,frontend-design}/SKILL.md` → `0` each (observed) |
| Disqualifier | Any line outside the three named sections changed |
| Consumers | `docs/skills/{ui-ux-pro-max,gsap-animation,frontend-design}.md` (T8b) |
| Review | `checklist` |
| Done criteria | Each section names `design-routing.md`; tests green |
| Skills | — |

### T8a: Repo `AGENTS.md` `## Design Skills` + CHANGELOG

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~30 LOC) |
| Depends on | T1 |
| Requirements | FR-13 (*AGENTS.md matches the matrix* incl. BUT no rows), NFR-1 |
| Design | DD-11; §9 (`--force` note) |
| Scope | `AGENTS.md`: remove the two `## Skill Usage` bullets (UI work, `gsap-animation`) and add `## Design Skills` after `## Skill Usage`: the decision rule (≤ 5 lines), one line per design skill (the eight) naming its role, and a pointer to `.claude/skills/impeccable-bridge/references/design-routing.md`. `CHANGELOG.md` `Unreleased`: Added (matrix, `Design route:`, Step 8D block, `## Design Skills`), Changed (bridge build row, specify, propose, seo, persona examples, adapted skills), Note (existing installs keep a differing `impeccable-bridge` until `akili install --force`; deployed personas upgrade with `akili doctor --agents --fix`) |
| Tests | T9 skill set (AGENTS.md set = eight) + sweep |
| Falsifier | T9 "skill set" red if `stitch-design` is missing from `## Design Skills` |
| Red run | Baseline `grep -cF '## Design Skills' AGENTS.md` → `0`; ``grep -cF 'Use `frontend-design`, `ui-ux-pro-max`' AGENTS.md`` → `1` (observed) |
| Disqualifier | Any other `AGENTS.md` section changed; CHANGELOG entry claims a count no command produced (KZ-002 — run the grep before writing any number) |
| Consumers | `CLAUDE.md` (imports `AGENTS.md`) |
| Review | `checklist` |
| Done criteria | Section present; baseline hits for `AGENTS.md` → 0 |
| Skills | `cognitive-doc-design` |

### T8b: Docs match the matrix

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S–M (~45 LOC across docs) |
| Depends on | T1 |
| Requirements | FR-13 (*No surviving old routing phrasing*), W-4 |
| Design | §4 docs row; P-10 |
| Scope | `docs/flow.md` §9 conditional bullet (Impeccable via the bridge leads UI; others per the matrix); `docs/overview.md` rows for `frontend-design`, `gsap-animation`, `impeccable-bridge`, `stitch-design`, `ui-ux-pro-max` (role text only, row form kept); `docs/skills/README.md:57` bullet; `docs/skills/governance.md` (conditional-row parentheses only — row must still start ``| `conditional` | `ui-ux-pro-max` ``); `docs/skills/{impeccable,impeccable-bridge,frontend-design,stitch-design,ui-ux-pro-max,gsap-animation}.md` (one line each pointing at the matrix where they describe roles); `docs/commands/akili-constitution.md:121`, `akili-propose.md:96`, `akili-specify.md` (the UI skill line), `akili-test.md`, `akili-audit.md` — only where they state routing that now contradicts the matrix; ENV-0 fallback statements stay |
| Tests | T9 sweep; `diagram-design.test.js`, `docs-overview.test.js` green |
| Falsifier | T9 sweep red if ``Use `gsap-animation` for animation work`` survives in `docs/skills/README.md` |
| Red run | Baseline ``grep -cF 'Use `gsap-animation` for animation work' docs/skills/README.md`` → `1` (observed) |
| Disqualifier | A doc gains a matrix row or card; `diagram-design.test.js` or `docs-overview.test.js` red |
| Consumers | `test/docs-overview.test.js`, `test/diagram-design.test.js:393-394` |
| Review | `checklist` |
| Done criteria | All 10 baseline stale hits → 0 across the shipped tree after T2–T8b (checked here with the baseline grep); tests green |
| Skills | `cognitive-doc-design` |

### T9: Contract tests

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~300 LOC — KZ-bugfix--init-ctrlc-abort-2) |
| Depends on | T1–T8b |
| Requirements | requirements §8 defect classes (all automated rows); NFR-1, NFR-2, NFR-3 |
| Design | §7.3 (nine tests, falsifiers) |
| Scope | `test/design-skill-routing.test.js` (new), tagged `@akili-spec changes/design-skill-routing <FR>`: held once (rows + cards), skill set (folders + cards + `AGENTS.md`), one lead per cell, card evidence resolves, no `\.(md\|js):\d+` pointers in the matrix and new text, stale-phrase sweep (the 10 baseline patterns, walk as `impeccable-bridge.test.js` FR-11/FR-14), wiring (specify, bridge, propose order, seo, Step 8D, leader), governance, execute boundary |
| Tests | itself |
| Falsifier | Each §7.3 falsifier, **executed**: apply each mutation in a scratch copy and observe red, then restore |
| Red run | Create a detached worktree of the baseline in the scratchpad (`git worktree add <scratch>/base ac1d0db`), copy the new test file in, run it → quote the red assertions (expected: every wiring/sweep/held-once test red); remove the worktree afterwards (`git worktree remove`) |
| Disqualifier | A test that cannot fail on any input (the falsifier run shows no red); a test reading `docs/specs/` (KZ-changes--archify-diagrams-1); normalizing both sides before comparing |
| Consumers | none |
| Review | `full` |
| Done criteria | Suite green on the post-change tree; baseline red quoted; each falsifier's red quoted; `npm test` total = 1385 + new tests, 0 fail |
| Skills | `tdd` |

### T10: Held-out routing walkthrough

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | XS (no shipped LOC; evidence in `execution.md`) |
| Depends on | T9 |
| Requirements | requirements §8 "Agents do not follow the routing" (substitute check); FR-2, FR-4, FR-7, FR-8 |
| Design | §7.1, §8.2, §8.5, §8.6 |
| Scope | A fresh read-only agent (different model from the authors) gets only the shipped text (`design-routing.md`, bridge, `akili-specify.md`) and three held-out profiles **not cited in the matrix**: (a) Vue 3 + Vuetify admin app adding a reports screen with animated chart transitions; (b) Astro marketing site with no tokens, a new pricing page; (c) Flutter mobile app adding an onboarding flow. For each it returns ENV class, lead + playbook(s), polish limit, motion route, mockup route. Expected (written here, before the run): (a) ENV-2, `impeccable` `layout`/`typeset` (build-within-system), polish light, `animate` → CSS/WAAPI unless Vuetify transitions are the project library (then that); (b) ENV-1, `new-work` code-led after direction at specify, polish full, motion `animate` → CSS/WAAPI, mockup picker first; (c) ENV-3 (adaptive), `new-work` + platform reference, `onboard` playbook, polish full or light by mode, platform motion, no `gsap-animation` |
| Tests | — |
| Falsifier | A profile routed to two leads, to `ui-ux-pro-max` as lead, or to `gsap-animation` on (c) → mismatch recorded |
| Red run | n/a — a walkthrough, not a test |
| Disqualifier | The agent saw this spec folder or the expected answers; any mismatch is reported, never re-prompted away |
| Consumers | none |
| Review | `checklist` |
| Done criteria | Three routings and their comparison with the expected cells logged in `execution.md`; mismatches reported to the user at the HITL pause of `/akili-validate` |
| Skills | — |

## Coverage (scenario and clause level)

| Requirement clause | Task(s) |
|---|---|
| FR-1 every skill placed; BUT one lead/no empty cell; AND ENV-0 lead + support | T1 (content), T9 (skill set, one lead) |
| FR-1 held once; BUT no restated rows | T1, T2–T8b (pointers only), T9 (held once) |
| FR-2 established DS → ENV-2 + evidence; BUT not ENV-1 for missing `DESIGN.md` | T1 (ladder), T3 (recorded per screen), T10 (a) |
| FR-2 precedence ENV-0 / ENV-3 / per screen | T1, T10 (c) |
| FR-3 card evidence resolves; BUT no line numbers / over-claim | T1, T9 (card evidence, no pointers) |
| FR-4 named playbook; AND completion report → Leader logs; BUT only named references | T1 (Build route, line form), T2 (execute row), T3 (rule + Done criteria) |
| FR-4 direction settled; code-led; questions from `design.md`, else Pivot | T1, T3 (direction at specify), T9 (execute boundary) |
| FR-4 ENV-0; gap reported; BUT never stops | T1, T3 |
| FR-5 light / full; BUT no redesign | T1, T3 (polish in Done criteria) |
| FR-6 finish review not run; AND Reviewer spawned; BUT no inline pass | T1, T2, T9 (execute boundary) |
| FR-7 no-GSAP project; BUT no GSAP unless DD | T1, T3, T6, T7, T10 (a) |
| FR-7 native → no `gsap-animation` | T1, T10 (c) |
| FR-8 picker first; Stitch on request; BUT no Stitch unless asked | T1, T4, T9 (order) |
| FR-8 missing → today's order | T1, T4 |
| FR-9 shadcn project; BUT no stack load-direction | T1 (supporting line, cards), T3, T5, T9 (governance) |
| FR-10 block fields; Safe Update preserve; BUT no rows | T5, T9 |
| FR-10 no-UI project → no block; BUT no ENV-1 fall-through (E-2) | T5 (guard shipped), T8b (docs) |
| FR-11 UI task entry; AND IT MUST NOT `ui-ux-pro-max` unless catalog | T3 |
| FR-12 seo via bridge | T4 |
| FR-13 AGENTS.md matches; BUT no rows | T8a, T9 |
| FR-13 no surviving old phrasing | T2–T8b, T9 (sweep) |
| FR-14 adapted skills point, no contradiction | T7 |
| NFR-1 held once, no line pointers | T9 |
| NFR-2 vendored untouched | every task (common verification), `impeccable-vendor.test.js` |
| NFR-3 governance | T3, T5, T9 |
| NFR-4 token economy | T1 (Build route step 2), T3 |
| NFR-5 host-neutral; ships to six targets | T1, T8a (CHANGELOG `--force` note) |
| NFR-6 persona examples only | T6 |
| NFR-7 consent unchanged | T1 (code-led: no image generation in execute), T4 (credit question kept) |
