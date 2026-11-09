# Tasks: akili-panel-polish — make the Akili pane easier to read and nicer to look at

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-polish` |
| Status | **Design / tasks approved by JC (Juan Carlos Cadavid), 2026-11-06:** «Continue: apruebo requirements, design y tasks de akili-panel-polish». The time was not relayed. Approval Mode stays `gated`. Earlier at this gate: «Review Design: corre judgment-day sobre akili-panel-polish» (2026-11-06 10:01 AM America/Bogota) and «Fix only: corrige J-1 y W-2…W-8 sin re-juzgar» (10:17 AM). `judgment.md` closes `fixed, not re-judged`, not `JUDGMENT: APPROVED`; W-1 and I-1 … I-13 stay `info` |
| Specify closed | 2026-11-06. Verification Checklist: 20 pass, 2 n/a (bug, video), 1 gap: FR-4's *a size the person set stays theirs* names T5 as its owner, but T5's scope has no step for it (I-13, not fixed). Premise citations and observed reds re-run at `c14e344` |
| Requirements / Design | `requirements.md`, `design.md` |
| Baseline | `c14e344`. `node --test test/akili-panel-flow.test.js test/akili-panel-contract.test.js` → **108 pass, 0 fail**. `claude plugin test .claude/skills/akili-panel` → **17 pass, 0 fail** (2026-11-06) |
| Start condition | **Met.** The parent closed T9, test, validate and archive (decision D2): `docs/specs/archive/2026-11-06-changes--akili-panel/`, archived at `b7d1738`. Start authorized by JC, 2026-11-06 7:30 PM America/Bogota: «adelante» |
| Commit prefix | `[SPEC:changes/akili-panel-polish]`. Local commits only |
| Budget (design §12) | 5 tasks · ~1,100 LOC · 8 review rounds. LOC raised from ~650 by JC at the T2 tripwire, rounds from 7 at the T4 tripwire (`execution.md`) |
| PR strategy | One PR after the parent's PRs, stacked on them. At ~1,100 LOC it is past the ~400 mark, but ~800 of it is tests and it is one surface. Not opened in this cycle |
| `skip-eligible` tasks | **None.** T1 and T5 are JC's checks, and T2, T3 and T4 all have consumers or shipped claims |
| Backend route | No task is a backend task; no `Backend route:` line |

## Dependency graph

```text
parent archived ─► T1 paint check (JC) ─► T2 row builders ─► T3 draw the rows ─► T4 docs ─► T5 live check (JC)
```

## Common verification (every code task)

`npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check`. Code tasks also run `claude plugin validate .claude/skills/akili-panel`.

---

### T1: Paint check on JC's terminal (HITL)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | XS (no repo change) |
| Depends on | The parent, archived at `b7d1738` (met) |
| Requirements | FR-1 (open; a surface keeps its own look), NFR-3, D-5 |
| Design | §2, §8; P-3, P-4 |
| Scope | Settles P-3 and P-4 as its first and only step. Load `docs/specs/changes/akili-panel-polish/probe/mod` with `claude --plugin-dir` in Orca and run `/probe-clear`; it draws the state tones, both bars and the chip on a transparent pane. JC looks at it in `dark-ansi`, then in a light theme, and says whether done, current, blocked and not reached read as different states. Nothing is committed |
| Tests | Manual, at a HITL pause; a screenshot per theme recorded in `execution.md` |
| Falsifier | Run `/probe-gray` in the same terminal: the gray must return, or the check cannot tell the two apart |
| Red run | Observed at specify, Claude Code 2.1.319: `probe/captures/gray.ansi` holds `\x1b[100m` 73 times; `clear.ansi` holds it 2 times, on chat rows only |
| Disqualifier | SGR codes or a `tmux` capture standing in for JC's eyes: they show which colour was asked for, not how it looks. A check not run in Orca, or not under `dark-ansi` |
| Consumers | none |
| Review | `checklist` — JC is the gate |
| Done criteria | `execution.md` records JC's words for both themes and one outcome. **Transparent refused in Orca:** Pivot Protocol, Option B, stop. **Transparent works, states too close to tell apart:** stop; JC chooses between accepting marks and weight, or changing his theme or palette. **Reads well:** continue to T2. No repo file changes |
| Skills | `impeccable-bridge` |

### T2: Row builders in `flow.mjs`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L (~195 LOC code, ~625 LOC tests) |
| Depends on | T1 |
| Requirements | FR-2 (all scenarios), FR-3 (all scenarios), FR-4 (block order, table, first-refresh and no-repository scenarios), FR-5 (all scenarios), FR-6 (label fit), FR-7 (all scenarios), FR-8 (tone), NFR-2 |
| Design | §5, §8 (tone table, layout, mark column, assembly, bars, ladder, fit, first-draw states); DD-P3, DD-P5 to DD-P8, DD-P10, DD-P11 |
| Scope | `.claude/skills/akili-panel/hooks/flow.mjs`: add the tone table, row and part shape, header, constitution, cycle, phase, token and rule rows, both bars, the ladder, the fit rule, and `paneRows`, which assembles them in order with the empty and first-draw states, the error rows and the blank row above Next. **Additive:** the old formatters stay until T3 switches over, so no commit leaves the plugin broken. `test/akili-panel-flow.test.js`: new tests, one assertion per clause, on fixtures under `test/fixtures/akili-panel/`. `Design route: load impeccable-bridge → design-routing.md; playbook colorize, layout, adapt; ENV-2; mode Operate; polish light; motion none` |
| Tests | `node --test test/akili-panel-flow.test.js` |
| Falsifier | Each on the fixture where the readings diverge: swap the `success` and `inactive` tones → the tone test red on a spec with one done and one not-reached phase; compare raw percent, not rounded → red at `79.6`; `>` for `>=` → red at `80` and at `95`; drop the one-cell minimum → red at `1`; let `blocked` keep the `suggestion` share → red on a blocked spec with the note on a phase other than execute; let `no-task-status` keep the `suggestion` share → red on fixture `no-status`; swap ladder steps 3 and 4 → the order test red at a width between them; hold the mark column at 17 → the 24-column test red on `▶ (blocked)`; swap steps 6 and 7 → the 24-column test red on the bars; move an error row after the second rule → the order test red; remove the missing-width guard → red with `bodyColumns` undefined; remove the fit cut → the width sweep red on the longest-path fixture; count `current` as done → `2/6` reads `3/6` |
| Red run | `predicted — greenfield artifact (observed in T2)`: the new tests run red against the current module with `F.paneRows is not a function` or the name T2 settles on; each falsifier's red is quoted in `execution.md` |
| Disqualifier | A width sweep whose longest strings never force a cut. A tone test on a fixture with one state. Any test reading the live `docs/specs/` tree (KZ-changes--archify-diagrams-1). A pass on Node 22 only |
| Consumers | `test/akili-panel-flow.test.js`; `register.jsx` (T3). P-5 |
| Review | `full` |
| Done criteria | All new tests green with each falsifier observed red; every existing test still green; completion report names the playbook(s) run, `polish light` and its result, and `finish review: not run (AKILI execute)`; the Leader logs it in `execution.md` and names that entry in the Reviewer brief |
| Skills | `tdd`, `impeccable-bridge` |

### T3: Draw the rows

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~65 LOC code, ~175 LOC tests) |
| Depends on | T2 |
| Requirements | FR-1 (open; surface keeps its look incl. BUT no error), FR-4 (order; inline pane asks for rows), FR-6 (all scenarios), FR-8 (scenario), FR-9 (incl. BUT no new command, hook event, atom, file read or process; AND `.claude/commands/` identical), NFR-1, NFR-4, NFR-5, D-3, D-4 |
| Design | §6, §8 (Next table, layout); DD-P1, DD-P2, DD-P4, DD-P9, DD-P12; P-1, P-2, P-6, P-8, P-9, P-10 |
| Scope | `hooks/register.jsx`: `backgroundColor: 'transparent'` and `rows` (DD-P12) on the one `$.ui.open`; `ui.render` maps the rows of `paneRows` to `Text`; chip on the terminal, primary elsewhere, `key="next"` kept. Remove the replaced formatters from `flow.mjs`, and every test that names one (`git grep -n -E 'formatHeader|formatConstitution|formatPhaseLines|formatTokens' test/`, the export list at `:147` included), each with a new row test already covering its clause. The existing width sweep (`test/akili-panel-flow.test.js:765`, 1 to 120) moves to the new rows and is never narrowed. `test/akili-panel-contract.test.js`: no raw colour in `hooks/`; transparent and `rows` present; no new hook or atom. `tests/panel.test.tsx`: all four surfaces, the chip, the press. `Design route: load impeccable-bridge → design-routing.md; playbook colorize, layout, adapt; ENV-2; mode Operate; polish light; motion none` |
| Tests | `node --test test/akili-panel-flow.test.js test/akili-panel-contract.test.js`; `claude plugin validate .claude/skills/akili-panel`; `claude plugin test .claude/skills/akili-panel` |
| Falsifier | Plant `'#ff0000'` in `flow.mjs`, then in `register.jsx`, then a colour name `'red'` in each → the contract test red four times (NFR-1 is over every file in `hooks/`); remove `backgroundColor` → contract red; remove `rows` → contract red; drop `key="next"` → the kit's press tests red; give the chip branch its own handler that skips `press` → the kit's single-run test red; add an atom → contract red |
| Red run | Baseline observed at specify: `grep -c "backgroundColor: 'transparent'" register.jsx` → `0`; `grep -c 'color=' register.jsx` → `0`. `predicted — greenfield artifact (observed in T3)` for the new contract and kit assertions, quoted in `execution.md` |
| Disqualifier | The contract test is a presence check: it cannot prove the pane looks right or that a surface honours the request. That is T1 and T5. `claude plugin test` cannot run in CI, so a CI green says nothing about D-4. A global `~/.claude/skills/akili-panel` must not be what the kit loads: pass the repo path |
| Consumers | `tests/panel.test.tsx:69,154,166,168,173,184,187,200,204,209,214` (`key: 'next'`), `tests/panel.test.tsx:68,94,104` (`Text` by its words, two of them by exact text), `test/akili-panel-flow.test.js`, `test/akili-panel-contract.test.js`. P-5, P-6 |
| Review | `full` |
| Done criteria | Contract and kit tests green with each falsifier observed red; `claude plugin validate` → `✔ Validation passed`; existing tests of phases, spec choice and Next unchanged in `git diff`; `git diff --stat c14e344 -- .claude/commands` empty; completion report names the playbook(s) run, `polish light` and its result, and `finish review: not run (AKILI execute)`; the Leader logs it in `execution.md` and names that entry in the Reviewer brief |
| Skills | `impeccable-bridge` |

### T4: Docs

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~30 LOC) |
| Depends on | T3 |
| Requirements | FR-10 (scenario) |
| Design | §4; P-5; D-7 |
| Scope | `.claude/skills/akili-panel/README.md` *What each row means* (`:30`, `:32-36`), `docs/plugins/akili-panel.md` (`:33`, `:35-39`), `CHANGELOG.md` → `Unreleased` plugin entry. Plain language, with the rows as shipped. Keyed on the claim, sweep `README.md`, `docs/plugins/` and `CHANGELOG.md` for any description of the old look: the token line, the one-row header, the bracketed button, dim failures |
| Tests | `git grep -n -E 'Tokens: ctx\|Akili · \|\[ Next' -- .claude/skills/akili-panel docs/plugins CHANGELOG.md README.md` → no hit; `npm test` |
| Falsifier | Leave one old row in → the grep hits it. Observed at specify: `README.md:35`, `docs/plugins/akili-panel.md:38` |
| Red run | Observed at specify: the grep above returns the two lines named in the Falsifier, plus the header rows `README.md:30` and `docs/plugins/akili-panel.md:33`, and `hooks/flow.mjs:495,496,504`, which T3 removes |
| Disqualifier | A clean grep alone: it finds strings, not paraphrases. Each doc sentence about the rows is quote-checked against the code at HEAD (KZ-002). Counts stated in docs are re-run after T3 |
| Consumers | `test/docs-overview.test.js` |
| Review | `checklist` |
| Done criteria | Grep clean; every row in both tables quote-checked against a real render; `CHANGELOG.md` carries no claim beyond what shipped |
| Skills | `cognitive-doc-design` |

### T5: Live check of the real plugin (HITL)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (no code) |
| Depends on | T3, T4 |
| Requirements | FR-1 (open), FR-2 (spec in execute, blocked), FR-3 (mid-cycle), FR-4, FR-5 (fresh session), FR-6 (press, run in progress), FR-7 (under 60 columns), NFR-3, D-5, D-6 |
| Design | §8, §13 |
| Scope | With JC, in a scratch project with a small `docs/specs/` tree: `node bin/akili.js install --tool claude --local`, open Claude Code in Orca, `/akili-panel`. Check in `dark-ansi` and in a light theme, at one width under 60 columns and one wide: states are easy to tell apart, nothing wraps, the pane reads apart from the chat, Next is visible with no scrolling when the pane sits inline, keyboard focus on Next is visible, one click runs once, and the disabled look shows while it runs. Add `[~]` to a task to see the blocked tone |
| Tests | Manual, at a HITL pause; a screenshot per theme in `execution.md` |
| Falsifier | Delete `tasks.md` from the scratch spec → the pane moves the current phase back to specify within 30 s; if it does not, refresh broke |
| Red run | n/a — manual acceptance |
| Disqualifier | A check run in this repo's working tree, or with `--plugin-dir`: neither is the install path. A check by anyone but JC: D-5's gate is his eyes |
| Consumers | none |
| Review | `checklist` — JC is the gate |
| Done criteria | JC confirms in his own words at the pause; `execution.md` records them and the screenshots |
| Skills | `impeccable-bridge` |

## Coverage (scenario and clause level)

| Requirement clause | Owner |
|---|---|
| FR-1 Open: no background of its own; AND reply and placement unchanged | T3 (request, reply), T1 and T5 (paint) |
| FR-1 Surface keeps its look: still opens; BUT no message mentions it | T3 |
| FR-2 Tone table, all eight rows | T2 |
| FR-2 Spec in execute: tones; BUT no fourth glyph | T2, T5 |
| FR-2 Blocked: `warning`; AND IT MUST read the same with colour removed | T2, T5 |
| FR-3 Mid-cycle: `2/6`; AND shares in order | T2, T5 |
| FR-3 Blocked share | T2 |
| FR-3 No task status share | T2 |
| FR-3 Archived `6/6` | T2 |
| FR-3 No spec: no row; AND empty text stays | T2 |
| FR-4 Order of blocks; errors before the second rule | T2 (assembly), T3 (drawn as built) |
| FR-4 Header rows, rule, one column; `02` moves; `…` rule stays | T2 |
| FR-4 Inline pane: asks for the rows; Next visible; BUT a person's size stays | T3 (request), T5 (live) |
| FR-4 First refresh: `Akili` and tokens; BUT no rule above an empty block | T2 |
| FR-4 No repository; AND detached with no `⎇` | T2 |
| FR-5 Rows and missing values; `Tokens:` prefix gone; sources and shortening kept | T2 |
| FR-5 Fill: rounded, at least one cell above 0, full at 100+ | T2 |
| FR-5 Thresholds; AND `79.6` reads `80%` in `warning` | T2 |
| FR-5 High fill: `error`; BUT no toast, status line, sound or block | T2 (tone), T3 (no new call, contract) |
| FR-5 Fresh session | T2, T5 |
| FR-6 Surface table | T3 |
| FR-6 Label text kept, cut to fit | T2 |
| FR-6 Press: same command, once; AND second press adds nothing | T3, T5 |
| FR-6 Run in progress: dim, no fill; BUT same words | T3, T5 |
| FR-6 No next step | T3 |
| FR-7 Ladder order; last step when none fits; `…` after it; guarantee table; middle shortening kept | T2 |
| FR-7 At 24 columns; AND words whole | T2 |
| FR-7 Below 24 columns; BUT mark and figures whole | T2 |
| FR-7 No width given; AND rule of 40 | T2 |
| FR-7 Under 60 columns; AND facts readable | T2, T5 |
| FR-7 Any width; AND IT MUST hold for the longest fixtures | T2 |
| FR-8 Error tone; wording and limit kept; empty text stays dim | T2 (tone), T3 (draw) |
| FR-8 A read fails: AND the rest still draws | T3 |
| FR-9 Same facts; BUT nothing new; AND `.claude/commands/` identical | T3 |
| FR-10 No stale format | T4 |
| NFR-1 | T3 |
| NFR-2 | T2 |
| NFR-3 | T1, T5 |
| NFR-4 | T3 |
| NFR-5 | T3 |
| D-5 | T1, T5 |
