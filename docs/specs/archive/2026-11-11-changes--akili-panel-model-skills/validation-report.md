# Validation Report — akili-panel-model-skills

**Verdict: PASS with 4 WARN, 0 FAIL, 0 BLOCKED** (7 at audit time; the three figure WARNs were corrected by the Leader after the audit, see *Post-audit corrections* at the end). **Archive-ready once JC accepts the 4 remaining WARNs (R-4 to R-7).**

Every task is `[x]`. Every FR-1 … FR-10 scenario and clause has an owner, code, and test or live evidence. The build is green on my own re-run: `npm test` 1903/1903, `verify:cli` green, and `pack:dry-run` 427 files with no leaks. No requirement fails. The WARNs fall into three groups:

- Two gaps were already accepted earlier in the spec: the FR-1 *resume* re-read and the NFR-4 missing-operation path.
- T5 was closed without a 9th review round, by JC's choice.
- The design gate cannot run on a terminal pane, and three spec-document figures were never updated after amendment A1.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-model-skills` |
| Command | `/akili-validate changes/akili-panel-model-skills` |
| Date | 2026-11-11 |
| Auditor | Independent T3 Auditor on `claude-opus-5-5`. I took no part in implementing or reviewing this spec. The Implementer was `sonnet` and the per-task Reviewers were `opus` (author ≠ auditor holds) |
| Branch / HEAD | `JuankCadavid/akili-panel-model-skills` at `be2a5ca`. Merge base `af41538` = `origin/dev` (the local `dev` ref is stale at `8268cb7` and was not used) |
| Baseline docs | `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`: **N/A** (this is a methodology repo with none of them). `docs/specs/general-setup/`: absent. The format follows the `akili-validate` skill. Root `AGENTS.md` is the reference |
| Inputs read | `proposal.md`, `requirements.md` (A1), `design.md` (A1), `tasks.md`, `judgment.md`, `test-report.md`, `execution.md` (Document Control, every task record, Amendment A1, every ADVISORY), the plugin code and docs diff, `CHANGELOG.md` Unreleased |
| Deliverable | `software` (no video gate) |
| Scope of my own checks | Re-run by me: the build commands, the catalog counts on disk, the LOC figure, the code reading with file:line, the cross-document figures. **Not re-run by me:** `claude plugin test` (cited from the test report: 106/106 on 2.1.322 and 2.1.318), the T1/T5 live screens and logs (cited from `execution.md`, re-checked by the Reviewers), and the Tester's `cmp.mjs` FR-8 comparison |

## 2. Summary

| Area | Result | Key evidence |
|---|---|---|
| Task completion | PASS (T5: WARN, accepted) | T1–T6 `[x]`. Each has a Reviewer PASS, except T5, which JC closed (option B) |
| File existence | PASS | Every file in design §4 is changed or created as planned. Nothing is unexpected or deleted |
| Build integrity | PASS | `npm test` 1903/0; `verify:cli` `14 commands \| 32 skills \| 1 plugin \| 8 resources`; pack 427 files; `git diff --check` clean |
| Requirement coverage | PASS (2 WARN, accepted gaps) | 43 scenario/clause rows: 41 PASS, 2 WARN (FR-1 resume, NFR-4) |
| Code quality (4R) | PASS, advisory notes only | No spec violation found |
| Design review (UI) | WARN | The Impeccable engine cannot run on a terminal pane. Look evidence is JC's light/dark sign-off |
| Design conformance | PASS | DD-1 … DD-9 and the §8.7 size rule match the code. The budget matches (≈1,228 recorded vs 1,221 measured) |
| Cross-document figures | WARN ×3 | design §8.6 `rows: 19`; design §11 count `12`; execution.md Document Control budget |
| Constitution Impact | PASS (N/A) | No notes recorded; no module was created or reshaped |

**Result counts (result cells in §3–§10):** PASS 83 · WARN 7 · FAIL 0 · BLOCKED 0. The 7 WARNs: T5 closing (§3); FR-1 resume and NFR-4 (§6); the design gate (§7); three figure contradictions (§8).

## 3. Task Completion

| Task | Status | Execution notes + evidence | Closing record | Result |
|---|---|---|---|---|
| T1 live probe (P-3, P-4, P-5) | `[x]` | `execution.md` T1: verbatim log lines `t1-debug.run1.log:663`, `:672-:725`, `:803-:804`; non-author re-run `VERIFIED` | Reviewer `opus` `checklist` PASS, attempt 1 | PASS |
| T2 rows + catalog | `[x]` | T2: 287/287 own tests; 6 falsifiers quoted; the red pins handed to T3 under JC's amendment (option A) | Reviewer PASS, attempt 1; JC's ruling «Opción A: cierra T2 con commit…» recorded | PASS |
| T3 wiring | `[x]` | T3: `npm test` 1871/0; kit 92/0 on 2.1.322 and 2.1.318; 5 falsifiers quoted | Reviewer `full` PASS, attempt 1 | PASS |
| T4 docs, version | `[x]` | T4: attempt 1 FAIL (CHANGELOG `/clear` overstatement), fixed; KZ-002 quote-check log | Reviewer PASS, round 2 | PASS |
| T6 AKILI title (A1) | `[x]` | T6: 17 behavioural reds plus 2 missing-export reds; 6 falsifiers; 1895/0; kit 98/0 on both hosts | Reviewer PASS, round 2 | PASS |
| T5 live check (HITL) | `[x]` | Steps 1–19 quoted (screen files `t5-s1.txt` … `f4.txt`). JC's verbatim words: «lo veo bien presione execute sin querer pero lo detuve», then «Sí, lo vi en claro y oscuro» | Reviewer round 8 **FAIL** on one issue (an unsupported "light and dark" claim). The Leader corrected it, and JC's two-theme answer settles it. **No 9th round:** JC «Opción B: cierra T5 sin la ronda 9 y haz commit» | **WARN (accepted)** |

On T5, `execution.md:430-434` records the decision honestly. It states that the corrections made after round 8 "were **not** re-checked by a Reviewer; JC accepted that by choosing option B". The substance is now settled by JC's verbatim answer, which I confirm is quoted at `execution.md:419`. But the corrected record has had no independent re-check, so this cannot be a clean PASS. It is a WARN that JC has already accepted. Separately, the T2 heading at `execution.md:90` still reads "`[~]` awaiting JC", although its closeout at `:156-164` sets `[x]`. That is a readability slip only.

## 4. File Existence

Design §4 file map compared with `git diff --stat origin/dev...HEAD`:

| File | Design | Actual | Result |
|---|---|---|---|
| `.claude/skills/akili-panel/.claude-plugin/plugin.json` | EDIT, version 1.1.0 | +1/−1 | PASS |
| `.claude/skills/akili-panel/hooks/flow.mjs` | EDIT | +137/−24 | PASS |
| `.claude/skills/akili-panel/hooks/register.jsx` | EDIT | +36/−3 | PASS |
| `.claude/skills/akili-panel/types/index.d.ts` | EDIT | +4 | PASS |
| `.claude/skills/akili-panel/tests/panel.test.tsx` | EDIT | +413/−10 | PASS |
| `.claude/skills/akili-panel/README.md` | EDIT | +11/−6 | PASS |
| `test/akili-panel-flow.test.js` | EDIT | +544/−9 | PASS |
| `test/akili-panel-contract.test.js` | EDIT | +13/−12 | PASS |
| `test/akili-panel-catalog.test.js` | NEW | +98 | PASS |
| `docs/plugins/akili-panel.md`, `docs/skills/governance.md`, `CHANGELOG.md` | EDIT | +19/−4, +1, +8/−2 | PASS |
| `test/akili-panel-flow-coverage.test.js` | consumer (P-8, T2 Consumers) | +2/−2 | PASS (named in tasks, not in §4) |
| `test/akili-panel-test-phase.test.js` | — | +228 (new, `/akili-test`) | PASS (test-phase file, outside the execute file map by design) |

No new shipped file, as P-9 and DD-1 require: the catalog lives in `flow.mjs`. `.claude/commands` and `bin/` diffs are empty.

## 5. Build Integrity

Run sequentially by me at `be2a5ca`, with no delegated agent active:

| Command | Result |
|---|---|
| Leftover check (before) | `.claude/skills/akili-panel/.claude-plugin/types/` and `.claude/skills/akili-panel/tsconfig.json`: **absent**. Nothing deleted |
| `npm test` | `# tests 1903 / # pass 1903 / # fail 0` (105 s) — matches the test report |
| `npm run verify:cli` | `Summary: 14 commands \| 32 skills \| 1 plugin \| 8 resources (akili-specs v2.43.0)` |
| `npm run pack:dry-run` | `total files: 427` (unchanged from T4/T6). The plugin ships 7 files: `.claude-plugin/plugin.json`, `hooks/flow.mjs`, `hooks/hooks.json`, `hooks/register.jsx`, `README.md`, `tests/panel.test.tsx`, `types/index.d.ts`. **No** `.claude-plugin/types/` and **no** `tsconfig.json` in the tarball (`grep -c` → 0) |
| `git diff --check` | clean (exit 0) |
| `git diff --stat origin/dev...HEAD -- .claude/commands bin` | empty |
| `claude plugin test` | Not run, by instruction. Cited: 106 pass / 0 fail on 2.1.322 and on 2.1.318 (`test-report.md` §5) |
| Leftover check (after) | Still absent |

Build result: **PASS**.

## 6. Requirement Coverage

The primary evidence is `test-report.md` §7. I cross-checked it clause by clause against `requirements.md` and the code. "TP" means `test/akili-panel-test-phase.test.js`; "kit" means `tests/panel.test.tsx`.

| Req · scenario / clause | Owner | Code | Test / live evidence | Result |
|---|---|---|---|---|
| FR-1 *Shown*: `model` then the id | T2, T5 | `flow.mjs:699-707`, called at `:789` after `session` | flow `FR-1 Shown…`; T5 step 1 `│model            claude-sonnet-5-5` | PASS |
| FR-1 BUT no alias at full width | T2 | `flow.mjs:702` (draws `model` as returned when no width) | TP #8 (falsifier: strip `claude-` → red) | PASS |
| FR-1 AND same label column, default tone | T2 | `pad('model', s.col)` `flow.mjs:700`; no tone on the parts | flow FR-1 ×3 | PASS |
| FR-1 *Model changes* via `/model` within a turn or 30 s | T3, T1, T5 | observer `register.jsx:215-219`; `turn.complete` `:233-238`; tick `:146-148` | kit `FR-1 Model changes…/model`; T5 step 11 (`claude-haiku-5-5` within 4 s, no turn) | PASS |
| FR-1 AND re-read after `/clear` | T3 | `register.jsx:249` → `afterClear` → `runRefresh` → `refreshHost` `:50` | kit `FR-1 AND … after /clear` | PASS |
| FR-1 AND re-read after **resume** | T3, T5 | `session.end` `resume` only runs `resetSums` (`:248`); `startSession` (`:157-163`) does not refresh. Met only by the turn/tick bound | T5 step 12 cannot tell a re-read from the saved default | **WARN** (judgment W-1, not applied by JC's decision; test-report gap 1) |
| FR-1 *Model unknown*: `model —` | T2, T3 | `flow.mjs:701`; `''` → `null` at `register.jsx:62` | flow ×2; kit rejection; TP kit empty id | PASS |
| FR-1 BUT no hide, no toast | T3 | `.catch` → `$.ui.log` only (`:57-58`) | kit rejected-call case | PASS |
| FR-2 *Closed*: `Skills (<n>) ▸`, no group rows | T2, T3 | `flow.mjs:725-727`; reset at `register.jsx:160` and `:190` | flow ×3; kit ×2; T5 step 1 | PASS |
| FR-2 BUT no skill until pressed | T2 | `flow.mjs:727` returns before groups while closed | flow `FR-2 Closed…` | PASS |
| FR-2 *Open and close* `▾`, groups follow, each closed | T2, T3 | `register.jsx:267`; `flow.mjs:728-732` | kit `FR-2/FR-3 Open and close…`; T5 step 5 | PASS |
| FR-2 AND pressing again closes groups too | T3 | `{ open: !s.open, group: null }` `register.jsx:267` | kit; TP kit toggles | PASS |
| FR-2 *Nothing listed*: row not drawn | T2, T3 | `flow.mjs:723` (`total === 0` → `[]`); list rejection → `skills: null` | flow ×2; kit rejected `$.command.list` | PASS |
| FR-2 AND no error line | T2 | no row emitted | flow | PASS |
| FR-3 order `core`, `conditional`, `stack`; empty group not drawn | T2 | `SKILL_BINDINGS` `flow.mjs:632`; `continue` on empty `:729` | flow | PASS |
| FR-3 *Open a group*: alphabetical, deeper indent | T2 | catalog stored sorted, `listedSkills` keeps order `:669-674`; 4-space indent `:735` | flow order test (swap falsifier red); T5 step 6 | PASS |
| FR-3 *Open another* BUT never two open | T2, T3 | single `group` field; `register.jsx:268` | flow; kit; T5 steps 9–10 | PASS |
| FR-3 *Close the open group* | T2, T3 | `s.group === p.binding ? null` `:268` | flow ×2 | PASS |
| FR-4 *Run* `/<skill>` with no arguments as typed | T1, T3, T5 | `register.jsx:269` `press($, { command: p.name, args: '' })` | kit `FR-4 Run…`; T1 P-3; T5 steps 7, 9, 10 (`❯ /caveman`, `/diagram-design`, `/golang-pro`) | PASS |
| FR-4 AND the section stays | T3 | `skillsUi` untouched by `press()` (`:167-183`) | kit; T5 steps 8, 9, 10 | PASS |
| FR-4 *Double press*: no second run (Next or skill) | T3 | one `pending` guard `register.jsx:169-174` (DD-4) | kit across Next and a skill; TP kit ×2; T5 step 7 (two presses, one `8 chars queued`) | PASS |
| FR-4 AND the pending run's row dimmed | T2 | `flow.mjs:734-735` (`dim` when `pending.command === name`); Next keeps `pending` | flow ×2; TP kit "only the running row is dim" | PASS |
| FR-4 *Refused*: toast `Could not run /<skill>: <reason>` | T3 | `register.jsx:178` + `STRINGS.runRefused` `flow.mjs:60` | kit `FR-4 Refused…`; TP kit exact text. Not produced live (T5 obs. 3) | PASS |
| FR-5 listed = catalog ∩ `command.list` | T2, T3 | `register.jsx:61-62`; `flow.mjs:669-674` | flow; kit | PASS |
| FR-5 *Catalog matches* (add/remove/rebind fails naming the skill) | T2 | `SKILL_CATALOG` `flow.mjs:633-666` | `akili-panel-catalog.test.js` ×6; falsifiers "skills missing from SKILL_CATALOG: tdd", rebind red | PASS |
| FR-5 BUT not derived from the same source | T2 | the test's expected side is `fs.readdirSync` / `readFileSync` of `SKILL.md` (`catalog.test.js:19`, `:38`) | read by me | PASS |
| FR-5 *Not installed here* | T2 | intersection | flow ×2 | PASS |
| FR-5 *Read only*: no file outside the project, AND no process | T3 | `refreshHost` has no `$.fs`; contract bans `$.process` | kit `FR-5 Read only…`; contract | PASS |
| FR-6 *Model id too long*: middle cut | T2 | `shortenMiddle` `flow.mjs:703-704` | flow ×3; T5 step 14 `claud…-5-5` | PASS |
| FR-6 BUT not dropped at ≥ 14 columns | T2 | `:704` id keeps the full width when the label is dropped | TP #7 (14–120 × states × ids) | PASS |
| FR-6 *Skills rows too long*: end cut, mark kept | T2 | `markedRow` `flow.mjs:709-717` (J-2 fix) | flow ×5 (`protect` falsifier red) | PASS |
| FR-6 AND no change to existing ladder steps | T2 | `model` and title are outside `governedRows` | flow (governed falsifier → `step at 24`) | PASS |
| FR-7 closed = +2 rows + rule (+ title rows, A1) | T2, T3, T6 | 19 rows untitled; `PANE_ROWS = 21` `register.jsx:13` | contract rows pin; kit `rows` 21 | PASS |
| FR-7 *Tallest open state*: every skill reachable | T1, T5 | Skills after Next (DD-3) | T5 step 6 (inline, 12 core names), step 13 (dock, `systematic-debugging` focused) | PASS |
| FR-7 BUT a person's size stays | T3 | `rows` sent only at `$.ui.open` `:187` | kit size-stays case | PASS |
| FR-8 *Same facts*: pre-existing rows identical | T2, T6 | `build(0)` is the 1.0.0 head | flow ×3; TP #4; Tester `cmp.mjs` 0/1936 vs `v2.43.0` (not re-run by me); T6 Reviewer 0/17,280 | PASS |
| FR-8 BUT no `/akili-*` change | common | — | `.claude/commands` and `bin` diff empty (re-run by me) | PASS |
| FR-9 docs describe model, Skills, title; `plugin.json` 1.1.0 | T4, T6 | README, `docs/plugins/akili-panel.md`, CHANGELOG | quote-checked by me against the code (below) | PASS |
| FR-9 *No stale text* | T4 | — | `grep "one button\|only action"` over README and the docs page → none; the footer is never called `ctx`/`session` only | PASS |
| FR-10 *Wide and tall*: exact glyphs, `planMode`, spec alone next | T6 | `BRAND` `flow.mjs:741`; `headerRows` `:754-767` | flow ×2; kit bodyRows 52; TP #1, #2; T5 step 15 | PASS |
| FR-10 *Narrow pane*: 23 → 2; 5–14 → `AKILI`; < 5 → none, BUT nothing cut | T6 | `titleSize` `:748-752` | flow ×5; TP kit 15/5/4; TP #2 (no cut row); T5 step 16 at 23 | PASS |
| FR-10 *Short terminal*, AND stable when Skills opens | T6 | `n` counted on `build(0)`, Skills appended after (`:798-801`) | flow ×7; TP #3; TP kit 18 open; T5 steps 17–19 | PASS |
| FR-10 *Size unknown*, *No spec or no docs*, *Height asked* (21) | T6 | `!(cols > 0)` / `!(rows > 0)` → unbounded; empty `title` row omitted `:765`; `PANE_ROWS` 21 | TP #4–#6; flow; contract; kit | PASS |
| NFR-1 theme keys only; marks carry state | T2, T6 | tones `inactive`, `subtle`, `planMode`; `▸`/`▾` | contract theme-key set; JC light/dark at T5 | PASS |
| NFR-2 render reads atoms/props only | T3 | `register.jsx:256-262` | contract ×2 | PASS |
| NFR-3 one host call each per refresh | T3 | `Promise.all` of two calls `:56-59` | TP kit `NFR-3 one tick…` | PASS |
| NFR-4 2.1.318 floor; per-field degrade | T3 | `.catch` per call | kit on 2.1.318 106/0. A **missing** operation throws synchronously inside `Promise.all`, so both fields stay `null` (T3 Reviewer advisory 3; test-report gap 2). No 2.1.318+ host lacks them (P-11) | **WARN** (accepted gap) |
| NFR-5 `next(e)` first; observers `.catch(passOn)` | T3 | `register.jsx:215-219` | contract `:46-66` | PASS |

The requirements §8 defect classes map to gates as specified: row text goes to `npm test` (green); tree, press and guard to `claude plugin test` (cited 106/106 on both hosts); catalog drift to the catalog test (falsified); live-only classes to T5 with JC; package hygiene to pack and `verify:cli` (green). Every class has its gate. The live-only classes are covered by T5 and JC's sign-off.

**Docs quote-check (FR-9, by me):** "asks for 21 rows when it opens, up from 16" matches `PANE_ROWS = 21` and 1.0.0's 16. "two rows … from 15 columns when they fit above `Next`, one bold row from 5 to 14 columns or when only one row is spare, none under 5 columns or when even one row would push `Next` out" matches `titleSize` `flow.mjs:748-752`. "The model and the list are read again on each refresh (after `/model`, a finished turn, `/clear`, an `/akili-*` command, and every 30 seconds)" matches `refreshOnce` → `refreshHost` on those triggers. "closed each time the pane opens" matches `register.jsx:190`. The README's "with no arguments" matches `:269`. No skill counts appear in the docs (`<n>` only).

## 7. Linting & Code Quality

The repo has no linter. `node --check` is implied by the test import. The 4R sweep below covers `flow.mjs` and `register.jsx`. **Every item is advisory; none is a spec violation.**

| # | Lens | Finding (advisory) | Where |
|---|---|---|---|
| A-1 | Reliability | `refreshHost` runs only after a successful disk `refresh`. If the disk read throws, the model and the list stay stale until a later refresh succeeds | `register.jsx:47-50` |
| A-2 | Reliability | A synchronous throw from a missing `$.session.model` / `$.command.list` skips the per-call `.catch` (= NFR-4 WARN). The suggested hardening is `Promise.resolve().then(() => $.session.model())` (T3 Reviewer advisory 3) | `register.jsx:56-59` |
| A-3 | Readability | The exported `titleSize({ cols, rows })` without `n` returns 0, because `n + 2 <= rows` is false for `NaN`. Internal callers always pass `n` (T6 advisory) | `flow.mjs:748-752` |
| A-4 | Readability | `paneRows` builds the body twice, `build(0)` to count `n` and then `build(size)`. The comment explains it; the cost is trivial | `flow.mjs:776-800` |
| A-5 | Risk | Next sits directly above the Skills rule, so focus navigation can land on Next. JC pressed Next by accident during the look check (`execution.md:420`), and in T5 `Tab` after `End` landed on `next` once (obs. 1). This is host focus behaviour, and the guard limits harm to one run, but an accidental `/akili-*` run is a real UX risk | layout DD-3 |
| A-6 | Risk | Listing matches by bare name. A person's own skill or a project-level skill with a catalog name would be listed and run (judgment A-6, open) | `register.jsx:61` |
| A-7 | Resilience | `$.ui.log` inside the two `.catch` handlers is neither awaited nor guarded (T3 advisory 4) | `register.jsx:57-58` |
| A-8 | Risk | Contract `:159` lets `update` take `$` anywhere in render. Pinning it to the two toggle forms would be stricter (T3 advisory 1) | `test/akili-panel-contract.test.js` |

**Carried-forward advisories from `execution.md` and `judgment.md` (unresolved, recorded only):**

| Source | Advisory |
|---|---|
| T4 (b) | `plugin.json:4` description "…and offers a Next button." is true but incomplete for 1.1.0 |
| T4 (d) | Docs say "the pane is unchanged" after a refusal, but `press()` still schedules a refresh (FR-4 says "otherwise unchanged") |
| T3 (5) | The FR-5 kit test title says "starts no process"; that guarantee is the static contract test's |
| T6 | FR-8 *Same facts* fixtures compared titled only for `blocked` (since covered by the Tester's `cmp.mjs` 0/1936 untitled draw) |
| judgment B-5 | No premise row for atom survival across `/clear`, resume and hot reload |
| T5 obs. | After a shrink, the host keeps the inline scroll offset (header one row above the window); `End` moves the focus ring |
| test-report run note | Kit runs and `--plugin-dir` sessions regenerate the ignored `.claude-plugin/types/`, which breaks 4–19 install tests in `npm test`. This is a recurring process hazard (absent at my run) |
| docs page | `docs/plugins/akili-panel.md:5` "its tests ran on 2.1.319" is pre-existing 1.0.0 text, now incomplete (1.1.0's kit ran on 2.1.318 and 2.1.322). Not changed by this spec |

### Design Review (UI)

| Field | Value |
|---|---|
| Surface | Claude Code terminal pane (no web app, no dev server, no URL) |
| Skill source | `impeccable-bridge` vendored. Route `ENV-2`, mode Operate, `polish light` (tasks T2/T3/T6 `Design route`; polish W-2 precedent) |
| Engine | **Unavailable for this surface**: the detector scans web pages, and a terminal pane has no DOM or URL to scan |
| Scan matrix | `Unevaluated (engine cannot run on a terminal pane)` for every row |
| Waivers | None |
| Critique/audit | Implementer `polish light` per task: the 80-column render was read against §8.2 state 3 and matched; no new tokens. Reviewer checks per task |
| First-visit pass | Not applicable as a web fold check. The equivalent is FR-10 *Short terminal* and DD-3 (Next stays in the opening view), verified live at T5 steps 3 and 17–19 |
| Look evidence | JC's HITL check, verbatim: «lo veo bien presione execute sin querer pero lo detuve», then to «¿Lo miraste en claro y en oscuro?» «Sí, lo vi en claro y oscuro» (2026-11-11, `execution.md:419`) |
| Design gate | **WARN**: the impeccable-bridge row *engine unavailable* cannot be PASS. The look itself is signed off by JC in both themes |

## 8. Design Conformance

| Item | Check | Result |
|---|---|---|
| DD-1 catalog constant + disk test both ways | `flow.mjs:633-666`; catalog test reads disk | PASS |
| DD-2 `host` atom holds listed names only, filled in refresh | `register.jsx:21`, `:55-63` | PASS |
| DD-3 Skills after Next behind `rule-skills`; Next inside the asked rows | `flow.mjs:801`; contract pin | PASS |
| DD-4 one guard for Next and skills | `register.jsx:269` → `press()` | PASS |
| DD-5 `model` outside `governedRows` | `flow.mjs:789` (not in `governedRows`) | PASS |
| DD-6 `/model` observer: `next` first, `later`, `.catch(passOn)` | `register.jsx:215-219` | PASS |
| DD-7 `skillsUi` reset in `startSession` and `openPane` only | `:160`, `:190` | PASS |
| DD-8 governance checklist line | `docs/skills/governance.md:137` item 6 | PASS |
| DD-9 / §8.7 size rule `min(byWidth, byHeight)`; 15/5 thresholds; `n` excludes Skills; header drops `Akili  ` only while titled; glyphs U+2580/2584/2588 | `flow.mjs:741-767`, `:798-800` | PASS |
| §8.5 marked rows built pre-fitted (J-2) | `markedRow` `:709-717` | PASS |
| Budget §12 (A1 ~980; JC accepted ≈1,230) | Execute-phase changed lines outside `docs/specs/`, `git diff --numstat origin/dev ababb96` → 1,148 added + 73 deleted = **1,221**, vs `execution.md:369` "≈ 1,228". The figures agree (within 7). Acceptance quoted: «Sí, acepta el exceso (~1.230 líneas)…». The `/akili-test` phase adds 367 more (TP file 228 + kit suite B 139), so the branch total is 1,588 | PASS |
| Review rounds | 8 of 8 used (T1 1, T2 1, T3 1, T4 2, T6 2, T5 1); 9th waived by JC | PASS |
| Proposal intent and non-goals | Model shown, never set. No `/akili-*` group. No non-AKILI skills, no arguments, no search. No install/doctor/marketplace/commands change (diff empty). Existing rows not restyled. A1 (title) extends scope through a recorded approval (`execution.md:344-355`) | PASS |

**Cross-document figure check:**

| Figure | Sources compared | Result |
|---|---|---|
| `PANE_ROWS` 21 / rows asked | requirements FR-10 *Height asked* (21), design §8.1 / §8.7 (21), `register.jsx:13` (21), CHANGELOG (21, up from 16), README / docs. **But design §8.6 `:175` still reads "Inline \| `$.ui.open({ rows: 19 })` asks for the closed layout"**, which A1's correction closure missed (T6 fixed only `design.md:43`) | **WARN** |
| 19 → 21 row count | §8.1 lists 19 untitled rows; I counted them: title, branch, rule-top, constitution, cycle, 6 phases, rule-tokens, ctx, session, model, gap, next, rule-skills, skills = 19; +2 brand = 21; 1.0.0 = 16 | PASS |
| Thresholds 15 / 5 columns | requirements FR-10, design §8.7, `flow.mjs:749`, README, docs page, CHANGELOG | PASS |
| Catalog 32 = 12 / 9 / 11 | Disk re-run by me: `9 conditional`, `12 core`, `11 stack`; `ls .claude/skills \| wc -l` → 33 (minus the plugin); `SKILL_CATALOG` 32 entries; `verify:cli` `32 skills`; T5 `Skills (32)`, `core (12)`, `conditional (9)`, `stack (11)` | PASS |
| `Skills (32)` in mockups | design §8.2 matches the disk counts | PASS |
| Version 1.1.0 | `plugin.json`, README `:5`, CHANGELOG, proposal *Release intent* | PASS |
| Test counts 1903 / 106 | test-report (1903/0; kit 106/0 on both hosts) = my `npm test` 1903/0; T6 1895 + 8 TP = 1903; kit 98 + 8 = 106 | PASS |
| Premise Ledger count | **design §11 `:224` "Count: 12 settled"**, but the ledger has 13 rows since A1 added P-13. P-13's row still reads `Verified at —`, settled by "T6 …, T5 (live)" without ✓, although T5 step 18 verified it live (`execution.md:408`) | **WARN** |
| Budget lines | design §12 and tasks.md agree (~750 → ~850 → A1 ~980). **`execution.md:16` Document Control still reads "5 tasks · ~750 LOC … raised … to ~850"**, while the A1 budget (6 tasks, ~980) and the accepted ≈1,230 are recorded only in the A1 and T6 sections (`:354`, `:369`) | **WARN** |
| Coverage table `PANE_ROWS` 19 | `tasks.md:170` (T3, 19) is historical and superseded by `:175` (T6, 21). The proposal's "exactly two rows" was superseded by requirements FR-7 (judgment B-11) | Info |

## 9. Test Evidence Summary

| Suite | Command | Result | Who ran it |
|---|---|---|---|
| Unit / contract | `npm test` | 1903 / 0 | Me (this validation); also the Tester and the Leader |
| New test-phase cases | `node --test test/akili-panel-test-phase.test.js` | 8 / 0 (inside the 1903) | Me, via `npm test` |
| Plugin kit 2.1.322 | `claude plugin test .claude/skills/akili-panel` | 106 / 0 | Tester; cited, not re-run |
| Plugin kit 2.1.318 | `~/.local/share/claude/versions/2.1.318 plugin test …` | 106 / 0 | Tester; cited, not re-run |
| Live (no harness) | T1 probe, T5 steps 1–19 | All PASS, with notes (14 columns not reachable live: the dock floor is 23; the refusal toast was not produced live) | Leader / Implementer; re-checked by the Reviewers |
| FR-8 against 1.0.0 | Tester scratch `cmp.mjs` vs tag `v2.43.0` | 0 differences in 1936 cases | Tester; not re-run |

The test report is current: it covers `ababb96` code plus its own test commit `be2a5ca`, with no product change after it. It records no `PRODUCT_BUG`. Its 3 accepted gaps are carried forward: gap 1 (resume) → WARN, gap 2 (NFR-4) → WARN, gap 3 (live-only items) → covered by T5.

## 10. Agent Guide / Constitution Impact

| Check | Result |
|---|---|
| `## Constitution Impact` notes in `execution.md` | None. No module was created or reshaped: the plugin entry already existed, and AGENTS.md's description of it ("today `akili-panel`, a Claude Code side pane") stays true |
| Child guides / `## Module Guides` index | Not applicable |
| Result | PASS (N/A) |

## 11. Remediation

None is blocking. The three doc corrections (R-1 to R-3) are factual figure fixes with a single correct answer each. I did **not** apply them, because the brief limits me to writing this report.

| # | Kind | Action | Owner |
|---|---|---|---|
| R-1 | WARN fix (doc) | `design.md:175`: `rows: 19` → `rows: 21` (A1 correction closure; grep the folder for `rows: 19` forward and backward, keeping historical lines in tasks/execution as history) | JC / archive |
| R-2 | WARN fix (doc) | `design.md:224` count line → 13 settled; P-13 row `Verified at` `49c75c3`, Settled by "T6 (kit) ✓; T5 step 18 (live) ✓" | JC / archive |
| R-3 | WARN fix (doc) | `execution.md:16` Document Control budget → "A1: 6 tasks, ~980 LOC; overrun to ≈1,228 accepted by JC at the T6 gate" (optionally also the T2 heading `:90` `[~]` → PASS) | JC / archive |
| R-4 | Accept | FR-1 *resume* re-read (W-1). Follow-up option: a `runRefresh` in `startSession` | JC (already declined once) |
| R-5 | Accept | NFR-4 missing-operation sync throw. Follow-up option: wrap each call in `Promise.resolve().then(…)` | JC / follow-up spec |
| R-6 | Accept | T5 closed without a 9th review round (JC option B, recorded) | Accepted by JC |
| R-7 | Accept | Design gate WARN: engine unavailable on a terminal pane; look signed off by JC in both themes | JC |
| R-8 | Follow-up (advisory) | `plugin.json` description; docs page "tests ran on 2.1.319"; A-5 accidental Next press (consider spacing or focus order) | Separate `/akili-quick` or proposal; never widen this spec |

WARN tally: 7 distinct WARNs, matching §2. R-1 to R-3 resolve the three figure WARNs; R-4 to R-7 are acceptances.

## 12. Archive Readiness Recommendation

**Archive-ready, conditional on JC's acknowledgement.** All tasks are `[x]`, the build is green on an independent re-run, and every scenario and clause is covered. No FAIL is open, and the drift that exists is recorded in the spec documents.

Before `/akili-archive`:

1. JC accepts the WARNs R-4 to R-7 (R-4, R-5 and R-6 were already accepted earlier in the spec).
2. JC applies, or tells the archive step to apply, the three doc figure fixes R-1 to R-3.

```text
/akili-archive changes/akili-panel-model-skills
```

## Post-audit corrections (Leader, 2026-11-11)

The Auditor wrote this report without editing any other file. The Leader then checked the three figure findings against the documents, found all three correct, and applied the doc fixes. These are factual corrections with a single right answer, so no gate was needed. The rows above stay as the Auditor wrote them; this table records what changed.

| Item | Fix applied | Closure sweep |
|---|---|---|
| R-1 | `design.md` §8.6: `$.ui.open({ rows: 19 })` → `rows: 21`, noting 19 before A1 | Grepped `rows: 19` across the folder. The remaining hits are in `execution.md` T1/T3/T5 entries and the P-5 ledger row, all records from before A1, kept as history |
| R-2 | `design.md` §11 count → "13 settled: 12 verified"; P-13 `Verified at` → `49c75c3` (kit) and T5 step 18 (`ababb96`); Settled by → ✓ on both | Grepped `12 settled` and `Verified at —`: no other hits |
| R-3 | `execution.md` Document Control budget row: appended the A1 budget (6 tasks, ~980 LOC) and JC's accepted overrun ≈1,228 | Earlier budget text kept; only appended |

**Not re-checked by the Auditor:** these fixes were made by the Leader, who supervised the work. They touch spec documents only, with no code or test change.

**Result after corrections:** PASS 86 · WARN 4 · FAIL 0 · BLOCKED 0. Remaining WARNs: T5 closed without round 9 (JC option B); FR-1 resume re-read (W-1); NFR-4 missing-operation path; design gate unavailable on a terminal pane.
