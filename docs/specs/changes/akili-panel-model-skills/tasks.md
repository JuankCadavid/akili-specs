# Tasks: akili-panel-model-skills — the session's model and a collapsed Skills list in the Akili pane

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-model-skills` |
| Status | **Tasks approved** by JC (Juan Carlos Cadavid), 2026-11-10: «Sigue a la verificación final» (option 1, Continue). Verification checklist below: all items pass. **Spec approved** by JC, 2026-11-10: «Apruebo, haz commit y lanza /akili-execute en una sesión limpia». `/akili-execute` to start in a fresh session |
| Design | `design.md`, design gate passed by JC 2026-11-10: «Pasa a las tareas (tasks.md)»; judgment-day `fixed, not re-judged` (J-1, J-2) |
| Format source | `docs/specs/archive/2026-11-09-changes--akili-panel-polish/tasks.md` |
| Baseline | `8e8c5ba` (code identical to `af41538`) |
| Approval Mode | `gated` |
| Budget (design §12) | 5 tasks, ~750 LOC, 8 review rounds. Raised by JC to ~850 LOC at the T3 gate (2026-11-10). *A1 (approved by JC 2026-11-11):* 6 tasks, ~980 LOC, 8 review rounds |

## Dependency graph

```text
T1 (live probe, settles P-3 P-4 P-5) ──► T2 (flow.mjs rows + catalog) ──► T3 (register.jsx wiring) ──► T4 (docs, version) ──► T5 (live check, HITL)
```

*A1:* T4 ──► **T6 (AKILI title)** ──► T5 closes. T5's scripted steps ran before A1 (2026-11-11); after T6 it re-reads the title live (dock at 23 columns and wide; inline in the short 17-row frame, where no title is expected) and takes JC's one light/dark check for everything.

Strictly sequential: T2 is only worth building once T1 shows a skill runs from a press (P-3, **High**).

## Common verification (every code task)

`npm test` · `claude plugin validate .claude/skills/akili-panel` · `claude plugin test .claude/skills/akili-panel` (pass the repo path, never a global copy) · `git diff --check` · `git diff --stat 8e8c5ba -- .claude/commands` empty.

**Amended 2026-11-10 by JC** («Opción A: cierra T2 con commit y que T3 deje todo en verde»): `npm test` and `claude plugin test` are green once T3, the last task touching the P-8 pins, closes; T2 may leave red only the pins T3 owns (contract `:164-176`; kit `:870`, `:888`, `:1003-1004`, `:1033`). Every other check above holds at every code task.

---

### T1: Live probe of the host (settles P-3, P-4, P-5)

| Field | Value |
|---|---|
| Status | `[x]` PASS 2026-11-10 (`execution.md` → T1) |
| Size | S (probe plugin ~60 LOC in the session scratchpad; **no repo code**) |
| Depends on | — |
| Requirements | FR-4 *Run* (premise), FR-1 *Model changes* (premise), FR-7 *Tallest open state* (premise) |
| Design | §8.4, §8.6, DD-4, DD-6; Premise Ledger P-3, P-4, P-5 |
| Scope | Interactive Claude Code session in an Orca terminal (`orca terminal read --screen` only — **no screenshots**), with a throwaway probe plugin loaded by `--plugin-dir <scratchpad>/probe-panel` from a scratch project: (a) a pane with a Button whose press calls `$.command.run({ command: 'caveman', args: '' })` — quote the transcript line showing the skill ran; (b) an observer `on('command.run', { command: 'model' })` logging via `$.ui.log`; type `/model haiku` — quote the debug-log line or its absence; (c) a pane opened with `rows: 4` whose tree grows to 12 rows on a press — read the screen inline and docked, quote the row count seen and whether arrow keys scroll when focused. Record all three results verbatim in `execution.md`. A refuted P-3 stops here and goes to the Pivot Protocol before T2; a refuted P-4 removes DD-6's observer (Pivot, Low); a refuted P-5 goes to Pivot for a re-open with more `rows` (design §8.6) |
| Tests | Manual, quoted in `execution.md` |
| Falsifier | (a) Press with `command: 'no-such-skill-xyz'` → must reject (`types:3270` "Rejects an unknown name"); if it does not reject, the probe cannot tell a run from a no-op and (a) is not evidence. (b) A watched command that is not typed must log nothing. (c) Without the press, the row count must stay 4 |
| Red run | n/a — a probe, not a test; the falsifier outcomes above are quoted in `execution.md` |
| Disqualifier | A headless (`claude -p`) result is not evidence: `$.command.run` is refused there (design P-3). A run that started because the person typed `/caveman` is not a press result: type nothing between the press and the read. A pane read while the person resized it is not (c) evidence |
| Consumers | none (no repo file) |
| Review | `checklist` — the Reviewer checks the three quotes exist, came from an interactive session, and the falsifiers were run |
| Done criteria | Three verdicts (P-3, P-4, P-5) recorded in `execution.md` with verbatim quotes; the design's Premise Ledger rows updated to verified/refuted with those citations (a refutation goes through the Pivot Protocol, never a quiet edit); probe plugin left in the scratchpad, nothing under the repo |
| Skills | `systematic-debugging` |

### T2: Rows and catalog in `flow.mjs`

| Field | Value |
|---|---|
| Status | `[x]` PASS 2026-11-10 (`execution.md` → T2; common verification amended by JC, option A) |
| Size | M (~120 LOC code, ~230 LOC tests) |
| Depends on | T1 (P-3 verified) |
| Requirements | FR-1 (*Shown* incl. BUT no alias, AND same col/tone; *Model unknown* incl. BUT no hide/toast — row text part), FR-2 (*Closed* incl. BUT no skill before press; *Open and close* — row text; *Nothing listed* incl. AND no error line), FR-3 (all scenarios incl. BUT never two open; alphabetical; empty group not drawn), FR-4 *Double press* AND dim (row part), FR-5 (*Catalog matches* incl. BUT not derived from the same source; *Not installed here*), FR-6 (both scenarios incl. BUT not dropped ≥ 14 cols, AND ladder steps unchanged), FR-7 (closed = 3 added rows), FR-8 *Same facts* (row text/tone), NFR-1 |
| Design | §5 (`SKILL_CATALOG`, `listedSkills`), §8.1, §8.2, §8.3, §8.5 (J-2 fitted mark), §9 `paneRows` input; DD-1, DD-3, DD-5, DD-8 (catalog constant); P-6, P-8, P-12 |
| Scope | `hooks/flow.mjs`: frozen `SKILL_CATALOG` (32 `{ name, binding }`); `listedSkills(names)` (catalog ∩ names, grouped `core`/`conditional`/`stack`, alphabetical); `modelRow` (outside `governedRows`, §8.5 fit rule; `null`/empty → `model —`); Skills rows after `next` behind `rule-skills`, with `press` fields `{ kind, binding?, name? }`, marked rows built already fitted (§8.5); `paneRows({ …, host, skillsUi })`, both optional. `test/akili-panel-flow.test.js`: new row tests; update id lists `:969`, `:1009`, `:1016`, `:1128`, `:1414`; width sweep 1–120 over open states. New `test/akili-panel-catalog.test.js`: reads every `.claude/skills/*/SKILL.md` frontmatter (CRLF-normalised), compares names and bindings to `SKILL_CATALOG` both ways, excludes folders without `SKILL.md`. `Design route: load impeccable-bridge → design-routing.md; playbook layout, adapt; ENV-2; mode Operate; polish light; motion none` |
| Tests | `node --test test/akili-panel-flow.test.js test/akili-panel-flow-coverage.test.js test/akili-panel-catalog.test.js` |
| Falsifier | Remove `tdd` from `SKILL_CATALOG` → catalog test red naming `tdd`; rebind `tdd` to `core` in the constant → red naming the binding; open two groups in `skillsUi` input → one-group test red; swap two catalog entries' order → alphabetical test red; set `protect` back on a marked row instead of fitting (§8.5) → the 14-column mark test red on `  conditional (9) ▸`; make `modelRow` governed → the "ladder steps unchanged" test red for a fixture with a 60-char model id |
| Red run | Baseline observed at specify: `grep -c SKILL_CATALOG flow.mjs` → `0`; `grep -c listedSkills flow.mjs` → `0`; `grep -c modelRow flow.mjs` → `0`; `ls test/akili-panel-catalog.test.js` → `No such file or directory`. `predicted — greenfield artifact (observed in T2)` for every new assertion; each red quoted verbatim in `execution.md` |
| Disqualifier | The catalog test must read `SKILL.md` files from disk, never import `SKILL_CATALOG` to build its expected side (that passes by construction). Row tests check text and tone parts, not that a terminal paints them — that is T5. The test never reads `docs/specs/` (KZ-changes--archify-diagrams-1) |
| Consumers | `test/akili-panel-flow.test.js` (`:969`, `:1009`, `:1016`, `:1128`, `:1414`, width sweep), `test/akili-panel-flow-coverage.test.js`, `register.jsx` (`paneRows` caller). Design P-8 |
| Review | `full` — new behaviour across eight requirements |
| Done criteria | All listed tests green; each falsifier observed red and quoted; pre-existing row tests unchanged except the five id lists (diff shows only added ids `model`, `rule-skills`, `skills`); completion report names the playbook(s) run, `polish light` and its result, and `finish review: not run (AKILI execute)` |
| Skills | `tdd`, `impeccable-bridge` |

### T3: Wiring in `register.jsx` and the state contract

| Field | Value |
|---|---|
| Status | `[x]` PASS 2026-11-10 (`execution.md` → T3) |
| Size | M (~100 LOC code, ~240 LOC tests) |
| Depends on | T2 |
| Requirements | FR-1 (*Model changes* incl. AND re-read after `/clear`; *Model unknown* — rejection path), FR-2 (*Closed* at every session start and every pane open; *Open and close*; *Nothing listed* — `command.list` rejection), FR-3 (presses), FR-4 (*Run* incl. AND section stays; *Double press* incl. AND dim; *Refused*), FR-5 *Read only* (no file outside the project, no process), FR-7 (`PANE_ROWS` 19), FR-8 (Next unchanged; no `/akili-*` change), NFR-2, NFR-3, NFR-4, NFR-5 |
| Design | §5 atoms, §8.4, §8.6, §9 types; DD-2, DD-3, DD-4, DD-6, DD-7; P-1, P-2, P-7, P-8, P-10, P-11 |
| Scope | `hooks/register.jsx`: atoms `host` (`shape: 'host-1'`) and `skillsUi`; `refreshOnce` writes `host` from one `$.session.model()` and one `$.command.list()` (each rejection → `null` for its field, `$.ui.log`); reset `skillsUi` in `startSession` and `openPane`; `on('command.run', { command: 'model' })` observer (`next` first, `later(runRefresh)`, `.catch(passOn)`) unless T1 refuted P-4; `PANE_ROWS` 16 → 19; `draw` maps `press` rows to keyed `<Button plain>` on every surface (`skills`/`group` → `update(skillsUi)`, `skill` → `press($, { command: name, args: '' })`). `types/index.d.ts`: `AkiliPanelHost`, `AkiliPanelSkillsUi`, two `PluginState` entries. `test/akili-panel-contract.test.js`: update `:48-49`, `:66` (2 → 3), `:148-149` (+`host`, +`skillsUi`), `:157` (+`host`, +`skillsUi`), `:159` (+`update`), `:160` (press line also allows the skill press), `:164-176` (rows asked = closed layout, Next inside them). `tests/panel.test.tsx`: rig mocks for `$.session.model` and `$.command.list`; update `:870` (19), `:888` and `:1003-1004` (Next inside asked rows, not last), `:1033` (line count); new kit cases: model row, Skills closed at start and reopen, toggle, one group, skill press runs once, double press across Next and a skill, refusal toast, rejection of each host call. **First step:** run `claude plugin test` on 2.1.318 against the new host calls to settle P-11. `Design route: load impeccable-bridge → design-routing.md; playbook layout, adapt; ENV-2; mode Operate; polish light; motion none` |
| Tests | `node --test test/akili-panel-contract.test.js`; `claude plugin validate .claude/skills/akili-panel`; `claude plugin test .claude/skills/akili-panel` on the current host and on 2.1.318 |
| Falsifier | Drop the `skillsUi` reset from `openPane` → kit "closed on reopen" red; give the skill Button its own `$.command.run` call bypassing `press` → kit "double press across Next and a skill" red; call `$.command.list()` inside `ui.render` → contract `:156` red (`a host call besides $.ui.resolve`); remove `.catch(passOn)` from the `/model` observer → contract `:66` red; make `$.session.model` reject in the rig → the kit must show `model —` (if it shows nothing or throws, the fallback is broken) |
| Red run | Baseline observed at specify: `grep -c "session.model" register.jsx` → `0`; `grep -c "command.list" register.jsx` → `0`; `grep -c "key: 'host'" register.jsx` → `0`; `grep -c "key: 'skillsUi'" register.jsx` → `0`; `grep -c "command: 'model'" register.jsx` → `0`. `predicted — greenfield artifact (observed in T3)` for the new kit and contract assertions, quoted in `execution.md` |
| Disqualifier | `claude plugin test` cannot run in CI, so a CI green says nothing about the kit or 2.1.318. A global `~/.claude/skills/akili-panel` must not be what the kit loads. The kit's `$.command.run` is a stub: a green kit proves the wiring, not that a real host runs the skill (that is T1/T5) |
| Consumers | `test/akili-panel-contract.test.js` `:48-49`, `:66`, `:148-149`, `:154-160`, `:164-176`; `.claude/skills/akili-panel/tests/panel.test.tsx` `:870`, `:888`, `:1003-1004`, `:1033` and the rig; `types/index.d.ts`. Design P-8 (judgment J-1) |
| Review | `full` |
| Done criteria | Listed tests green on both hosts; each falsifier observed red and quoted; P-11 row updated with the 2.1.318 run; existing Next, spec-choice and observer tests unchanged in `git diff` apart from the pins above; completion report names the playbook(s), `polish light` result and `finish review: not run (AKILI execute)` |
| Skills | `impeccable-bridge` |

### T4: Docs, version, governance, CHANGELOG

| Field | Value |
|---|---|
| Status | `[x]` PASS (2 attempts; Reviewer `opus` PASS on round 2, 2026-11-10) |
| Size | S (~60 LOC) |
| Depends on | T3 |
| Requirements | FR-9 (incl. *No stale text*), FR-5 (DD-8 governance line) |
| Design | §4; DD-8; KZ-002 |
| Scope | `.claude/skills/akili-panel/README.md` and `docs/plugins/akili-panel.md`: rows table gains `model` and `Skills` (closed/open/group, press runs the skill), *Use* and *Limits* updated (a skill press shares Next's single-run guard and refusal toast; the list is AKILI's catalog ∩ what this session can run); every sentence implying Next is the only action reworded. `.claude-plugin/plugin.json` and the README version line → `1.1.0`. `docs/skills/governance.md`: one checklist line — adding, removing or rebinding a skill updates `SKILL_CATALOG` in `.claude/skills/akili-panel/hooks/flow.mjs` (the catalog test enforces it). `CHANGELOG.md` → `Unreleased` entry |
| Tests | `npm run verify:cli`; `npm run pack:dry-run`; `git diff --check`; quote-check each changed docs/CHANGELOG clause at HEAD |
| Falsifier | `grep -n "one button" .claude/skills/akili-panel/README.md docs/plugins/akili-panel.md` → must return no hit implying a single action (baseline below returns 2); `grep -c '"version": "1.1.0"' .claude/skills/akili-panel/.claude-plugin/plugin.json` → `1`; `grep -c SKILL_CATALOG docs/skills/governance.md` → `1` |
| Red run | Baseline observed at specify: `grep -n "one button"` over both docs → 2 hits (`README.md:3`, `docs/plugins/akili-panel.md:3`); `grep -c '"version": "1.0.0"' plugin.json` → `1`; `grep -c "SKILL_CATALOG\|akili-panel" docs/skills/governance.md` → `0`; README `:5` reads `Version \`1.0.0\`` |
| Disqualifier | A grep shows the old phrase gone, not that the new text is true: every figure or behaviour claim in the new text (counts, row names, guard behaviour) is quote-checked against the shipped code and re-run counts at HEAD (KZ-002). Counts of skills are not written into docs; the docs say "the skills AKILI ships" |
| Consumers | `test/install-akili-panel.test.js` (packed file list — no new file expected), README links in `docs/plugins/akili-panel.md` |
| Review | `full` — KZ-002 (CHANGELOG/doc overstatement, High, recurring) |
| Done criteria | Falsifier readings as stated; verify and pack green; every new doc clause quote-checked and the check logged in `execution.md` |
| Skills | `cognitive-doc-design` |

### T6: AKILI title (A1)

| Field | Value |
|---|---|
| Status | `[ ]` (amendment A1, approved by JC 2026-11-11) |
| Size | S (~130 LOC: code ~35, tests ~80, docs ~15) |
| Depends on | T4 |
| Requirements | FR-10 (all scenarios), FR-7 and FR-8 as amended by A1, FR-9 (title in docs) |
| Design | §8.7 (size rule), §8.1, DD-9, P-13 |
| Scope | `flow.mjs`: pure `brandRows(size)` and `titleSize({ cols, rows, n })`; `paneRows` gains `rows`, draws the title first in every state, and the header's first row drops `Akili  ` only while a title shows. `register.jsx`: pass `rows` from `e.props.scroll.bodyRows`; `PANE_ROWS` 21. Docs: README and `docs/plugins/akili-panel.md` rows table gains the title, its sizes and the header row's text; `CHANGELOG.md` Unreleased Added bullet gains the title and the 21 rows |
| Tests | Flow (one assertion per scenario clause): **width** 80 → 2 rows with exact glyph strings and tone `planMode`; 23 → 2 rows; 15 → 2; 14 → one bold `AKILI`; 5 → `AKILI`; 4 → none and header `Akili…` as `1.0.0`; **height** `rows = n + 2` → 2, `n + 1` → 1, `n` → none, `n − 4` → none; Next stays the last visible row when `rows = n`; **stability** the size is equal with Skills closed, open and a group open; **unknown** `cols` missing → height rule alone, `rows` missing → width rule alone, both missing → 2; **header** without `Akili  ` when a title shows, exactly `1.0.0` when none; **states** no view, empty states, error lines (larger `n`); **ladder** pre-existing ladder steps unchanged at every width tested. Kit: `bodyRows` varied (52 → 2 rows; 17 with the full layout → none, header `Akili  …`); `PANE_ROWS` 21 asked; a render with new `bodyRows` re-sizes the title (P-13). Contract: render still reads props and atoms only. Then common verification (`npm test`, `claude plugin validate`, `claude plugin test` on 2.1.322 and 2.1.318, `git diff --check`, `.claude/commands` diff empty), `npm run verify:cli`, `npm run pack:dry-run` |
| Falsifier | Remove the `planMode` tone → the 80-column test fails; drop the height rule → `rows = n` fails; make the 14-column branch return two rows → the 14-column test fails; keep `Akili  ` with a title → the header test fails; size on the full row count (Skills included) → the stability test fails; `PANE_ROWS` back to 19 → the kit's rows-asked case fails |
| Red run | New tests first, red against T4's code: `titleSize`/`brandRows` absent, header still `Akili  changes/…`, `PANE_ROWS` 19 |
| Disqualifier | Glyph strings asserted without their tone, or the size rule tested only at full width and height, do not cover FR-10. Doc and CHANGELOG lines are quote-checked against the shipped code (KZ-002) |
| Consumers | `test/akili-panel-flow.test.js` header and no-view pins; `tests/panel.test.tsx` layout and rows-asked pins; `test/akili-panel-contract.test.js` (`PANE_ROWS` / asked-rows rule); README, `docs/plugins/akili-panel.md`, `CHANGELOG.md` |
| Review | `full` |
| Done criteria | All checks green; falsifiers observed red, then reverted; docs quote-checked and logged in `execution.md` |
| Skills | `tdd`, `impeccable-bridge`, `cognitive-doc-design` |

### T5: Live check of the real plugin (HITL)

| Field | Value |
|---|---|
| Status | `[~]` scripted checks done 2026-11-11; awaiting JC light/dark sign-off |
| Size | S (no code) |
| Depends on | T4 |
| Requirements | FR-1 (model shown, follows `/model`), FR-2, FR-3, FR-4 (a real skill runs from a press; double press; section stays), FR-6 (narrow pane, 14 columns), FR-7 (*Tallest open state*: every skill reachable inline and docked), FR-8 (look unchanged), NFR-1 (light and dark) |
| Design | §8.2 mockup states 1–3, §8.6; P-3, P-4, P-5 (live confirmation) |
| Scope | The real plugin from this branch in an interactive Orca session (`orca terminal read --screen`, **no screenshots**): walk states 1–3 of §8.2 against the screen; press one skill per group; double-press a skill; `/model` switch; narrow the pane to 14 columns; open the largest group inline and docked and reach its last skill. Then JC's own check in light and dark |
| Tests | Manual; each step's screen text quoted in `execution.md` |
| Falsifier | A step whose screen read shows a pre-existing row changed in text or order fails FR-8; a group's last skill not reachable by any key fails FR-7 |
| Red run | n/a — live check |
| Disqualifier | A screen read taken while a delegated agent runs, or while tests run, is not evidence (AGENTS.md measurement rule). JC's light/dark check is the only gate for look (requirements §8) |
| Consumers | none |
| Review | `checklist` — the Reviewer checks each step has a quote and JC's words are recorded |
| Done criteria | Every step quoted; JC's confirmation recorded verbatim; any failure goes to the Pivot Protocol |
| Skills | `impeccable-bridge` |

---

## Coverage (scenario and clause level)

| Requirement · scenario / clause | Owner |
|---|---|
| FR-1 *Shown*; BUT no alias; AND same col and tone | T2 (row), T5 (live) |
| FR-1 *Model changes*; AND re-read after `/clear` and resume | T3 (`/model` observer, `afterClear` refresh), T1 (P-4), T5 (live). *Resume* re-read: covered only by the turn/tick bound — judgment W-1, recorded, not applied by JC's decision |
| FR-1 *Model unknown*; BUT no hide, no toast | T2 (row text), T3 (rejection path) |
| FR-2 *Closed*; BUT no skill until pressed | T2 (rows), T3 (reset at start and open) |
| FR-2 *Open and close*; AND closes groups too | T2, T3 |
| FR-2 *Nothing listed*; AND no error line | T2 (no listed → no rows), T3 (`command.list` rejection) |
| FR-3 *Open a group* (alphabetical, indented) | T2 |
| FR-3 *Open another*; BUT never two open | T2 (rows from state), T3 (toggle) |
| FR-3 *Close the open group*; empty group not drawn | T2 |
| FR-4 *Run*; AND section stays | T1 (P-3), T3 (wiring), T5 (live) |
| FR-4 *Double press*; AND dim | T2 (dim part), T3 (shared guard), T5 |
| FR-4 *Refused* toast | T3 |
| FR-5 *Catalog matches*; BUT not same-source | T2 (catalog test) |
| FR-5 *Not installed here* | T2 |
| FR-5 *Read only*; AND no process | T3 (contract: no new fs/process call) |
| FR-6 *Model id too long*; BUT not dropped ≥ 14 cols | T2, T5 |
| FR-6 *Skills rows too long*; mark kept; AND ladder steps unchanged | T2 (J-2 fitted mark), T5 |
| FR-7 closed = two rows + one rule | T2 (rows), T3 (`PANE_ROWS` 19) |
| FR-7 *Tallest open state*; BUT person's size stays | T1 (P-5), T5 |
| FR-8 *Same facts*; BUT no `/akili-*` change | T2 (rows), T3 (Next, contract), common verification (`.claude/commands` diff empty), T5 |
| FR-9 *No stale text*; version `1.1.0` | T4; *A1:* title in docs, T6 |
| FR-10 *Wide and tall*, *Narrow pane*, *Short terminal*, *Size unknown*, *No spec or no docs* (A1) | T6 (size rule, rows, tests), T5 (live: dock 23 columns, inline short frame) |
| FR-10 *Height asked*; FR-7 and FR-8 as amended (A1) | T6 (`PANE_ROWS` 21, header pins), T5 |
| NFR-1 for the title (`planMode`) | T6 (tone test), T5 (JC light/dark) |
| NFR-1 | T2 (tones), T5 (JC light/dark) |
| NFR-2, NFR-3 | T3 (contract: render reads atoms only) |
| NFR-4 | T3 (2.1.318 kit, rejection fallbacks) |
| NFR-5 | T3 (contract `:46-66`) |

## Estimates and PR strategy

| Measure | Value |
|---|---|
| LOC | ~750 (code ~220, tests ~470, docs ~60); ~850 by JC at the T3 gate; *A1:* ~980 (T6 ~130) |
| Review rounds | 8 (T1 1, T2 2, T3 2, T4 2, T5 1) |
| PR | One PR into `dev`: one plugin, tests dominate the line count, and the parts cannot ship apart (rows without wiring draw nothing pressable). Review order in the PR: `flow.mjs` → `register.jsx` → tests → docs |
| `skip-eligible` tasks | **None.** Every task has a conformance Reviewer |

## Verification Checklist (`/akili-specify`, run 2026-11-10)

| Item | Result | Evidence |
|---|---|---|
| 3 files exist, non-empty | ✓ | `requirements.md` 263, `design.md` 225, `tasks.md` 163 lines (`wc -l`) |
| Follow conventions | ✓ | Format source: polish spec (no `general-setup/` in this repo), named in each Document Control |
| Depth re-checked against design | ✓ | Standard; design §12 |
| Budget recorded | ✓ | design §12: 5 tasks, ~750 LOC, 8 rounds |
| Reversion DDs challenged | ✓ | DD-3 (Next no longer last row), challenge recorded inline |
| Premise Ledger present | ✓ | 12 rows |
| Each row cited or `UNVERIFIED` with owner | ✓ | 4 `UNVERIFIED`: P-3 → T1, P-4 → T1, P-5 → T1 then T5, P-11 → T3 |
| Triggered classes have rows | ✓ | live-path P-3, P-4, P-10; shared-state P-7; consumer P-8, P-9 |
| Consumer rows in task `Consumers` | ✓ | P-8 → T2, T3; P-9 → T4 |
| Defect classes mapped to gates | ✓ | requirements §8, with live-check and JC substitutes for the unautomatable classes |
| Requirements are behaviour | ✓ | Implementation names live in design only |
| GIVEN/WHEN/THEN with BUT / AND IT MUST | ✓ | FR-1 … FR-9 |
| Clause-level coverage | ✓ | *Coverage* table; FR-1 resume re-read is the recorded W-1 gap, by JC's Fix-only decision |
| Tasks reference requirements and design | ✓ | `grep -c "^| Requirements |"` → 5; `^| Depends on |` → 5 |
| Done criteria and verification with negatives | ✓ | Every task |
| No circular dependencies | ✓ | Linear T1 → T5 |
| Bug Mode | n/a | `Type: Change` |
| Spec path taxonomy | ✓ | `changes/akili-panel-model-skills` |
| Only real skills | ✓ | `systematic-debugging`, `tdd`, `impeccable-bridge`, `cognitive-doc-design` all under `.claude/skills/` |
| Video | n/a | `Deliverable: software` |
| Four verification fields per task | ✓ | Falsifier, Red run, Disqualifier, Consumers: 5 each; greenfield reds marked `predicted — greenfield artifact (observed in <task>)` with the observing task's Done criteria |
| `skip-eligible` named at the tasks gate | ✓ | None, stated at the gate |
| Rendered-measurement checklist | n/a with gap stated | Width gates measure row text length, not rendered geometry; height/reachability (FR-7) has no harness and goes to T1/T5 live checks (requirements §8) |
