# Test Report: changes/akili-panel-polish

**Status: PASS.** Every automated check is green (`npm test` 1830/0, kit 81/0, validate passed) and no product bug was found. The Tester closed `STATUS: FAIL` only because two clauses had no automated test and no confirmed manual check: FR-4 *a size the person set stays theirs* on the host side, and FR-6 keyboard focus on the Next chip. JC then checked both live in a fresh scratch project and confirmed them in his own words (JC, 2026-11-09 11:34 AM America/Bogota: «si esta funcionan do bien»).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-polish` |
| Date | 2026-11-09 |
| Started by | JC, 2026-11-09: «1: Sí, sigue con /akili-test changes/akili-panel-polish.» |
| Code under test | HEAD `fbcc995` plus the Tester's test additions (this commit) |
| Leader | `claude-opus-5-5`, session `7f15c449-dc64-490b-aee4-512bb50fa437` |
| Tester | 1, Opus, effort `high`, `general-purpose` agent seeded with `.agents/tester.md` (no Step 8E wrapper). Implementers were Sonnet throughout (`execution.md`), so author ≠ tester holds |
| Leader re-run | **VERIFIED**: `npm test` 1830 pass 0 fail; `claude plugin test .claude/skills/akili-panel` 81 pass 0 fail; `claude plugin validate` passed; `git diff --check` clean; `git diff --stat -- .claude/skills/akili-panel/hooks .claude/commands` empty |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 2: A, node row builders and static contract; B, `claude plugin test` kit on four surfaces |
| Testers | 1, covering both suites in sequence: they share `test/fixtures/akili-panel/` |
| Inline | None |
| Leader skill choice | `tdd` conventions via the persona; `impeccable-bridge` not loaded for the Tester: the look (D-5) is JC's check, not a test |
| Author tests | Cited, not rewritten: `test/akili-panel-flow.test.js`, `-flow-coverage`, `-contract`, `panel.test.tsx` |
| Tests added | 8 tests, +202 LOC, each falsified red then restored byte-exact |
| Counts | `npm test` 1824 → 1830; kit 75 → 81 |
| Product bugs | None |
| Design-detector suite | Not run: the pane is drawn in a terminal, with no HTML/CSS surface for the detector to scan. The look is D-5, JC's eyes at T1 and T5 |
| Lookup notes | Reference sections TRD `none`, UX `none`; CodeGraph only for untouched code |

## 3. Backend Unit Tests

n/a: the plugin has no backend. The pure row builder `flow.mjs` is under §4.

## 4. Frontend Unit Tests (suite A: node)

Command: `node --test test/akili-panel-flow.test.js test/akili-panel-flow-coverage.test.js test/akili-panel-contract.test.js test/akili-panel-cli-coverage.test.js test/install-akili-panel.test.js` → `# tests 379 # pass 379 # fail 0` (baseline 373).

| Added test | File | Falsifier → red |
|---|---|---|
| `FR-7 Any width AND IT MUST: every FR-2 state × every token state × pending, widths 1 to 120, longest fixture names: no row wider, none wraps` | `test/akili-panel-flow-coverage.test.js` | `fitParts` `total <= cols + 1` → `'current, constitution all / fresh at 4: title is 5 wide: Akili'` |
| `NFR-2 / FR-7 guarantee table, swept: with colour removed every state, <done>/6 and <p>% read whole at every width from the floor to 120` | same | step-6 column 13→14 → `'current, constitution all, p 0, 14 columns: propose mark'` |
| `FR-5 Fresh session (amended 2026-11-09): … session 0 in / 0 out · $<usd>` | same | `$` only with a fill → expected `'session          0 in / 0 out · $0.00'`, actual `'session          0 in / 0 out'` |
| `NFR-4: ui.render reaches the host only through $.ui.resolve and read($, <atom>)…` | `test/akili-panel-contract.test.js` | `await $.session.root()` in render → `not ok 1 - NFR-4…` |
| `FR-4 Inline pane: the rows asked for equal the rows the full layout draws, so Next is the last asked-for row` | same | `PANE_ROWS = 15` → expected 15, actual 16 |
| `FR-10 No stale format: … no Tokens: line, no one-row header and no [ Next button` | `test/akili-panel-cli-coverage.test.js` | `Tokens:` line in README → `'README.md: the Tokens: line'` |

## 5. Integration Tests (suite B: plugin kit)

Command: `claude plugin test .claude/skills/akili-panel` → `81 pass 0 fail` (baseline 75); `claude plugin validate .claude/skills/akili-panel` → `✔ Validation passed` (2.1.319).

| Added test | Falsifier → red |
|---|---|
| `FR-4 Inline pane: the rows asked for are the rows the full layout draws, Next the last of them` (terminal, desktop, vscode, mobile) | `PANE_ROWS = 15` → 4 fails, `76 pass 5 fail` |
| `FR-4 Inline pane BUT a size the person set stays theirs: after the open, nothing the plugin does on its own asks for a size again` | `$.ui.open` in `refreshOnce` → `Expected: 1 Received: 8` |
| `FR-1 A surface keeps its own look: every row draws on every surface BUT no reply, toast or row mentions the background` | toast on open → `77 pass 4 fail` |

## 6. E2E Tests

No automated E2E: the real pane in a real terminal is T5, JC's live check (PASS 2026-11-09, «T5: se ve bien en ambos temas, cierra T5 con mis palabras»).

## 7. Coverage & Traceability

| Requirement | Clause | Type | Test | Result | Gap or notes |
|---|---|---|---|---|---|
| FR-1 | Open: transparent body; AND reply and placement same | kit + static | panel.test.tsx `FR-1: the one open asks for a transparent body…`, `/akili-panel opens pane akili…`; contract `FR-1: the one $.ui.open asks for backgroundColor transparent…` | PASS | Paint: T1/T5 |
| FR-1 | Surface keeps its look BUT no message mentions it | kit | new `FR-1 A surface keeps its own look…` | PASS | `ui.log` not captured by the kit; static check: only 2 log strings |
| FR-2 | Tone table, 8 rows | node | flow `FR-2 …` (11 tests) | PASS | |
| FR-2 | Spec in execute BUT no fourth glyph | node | `FR-2 BUT the marks are still ✓, ▶ and ○…` | PASS | |
| FR-2 | Blocked AND IT MUST read the same with colour removed | node | `FR-2 blocked AND IT MUST…`; new NFR-2 sweep | PASS | |
| FR-3 | Mid-cycle, blocked, no task status, archived, no spec | node | `FR-3 …` (6 tests) | PASS | |
| FR-4 | Block order; errors before the second rule | node + kit | `FR-4 block order…`, `FR-4 the second rule…`; kit `FR-2/FR-4 drawn as built…` | PASS | |
| FR-4 | Header rows, rule, one column, `02` moves, `…` kept | node | `FR-4 header row 1/2…`, `02 label…`, `FR-7 any width…` | PASS | |
| FR-4 | Inline: asks for the rows; Next visible | static + kit | new contract and kit `FR-4 Inline pane…` | PASS | |
| FR-4 | **BUT a size the person set stays theirs** | kit | new `FR-4 Inline pane BUT a size…` | PASS | Plugin half automated. Host half manual: JC, 2026-11-09 11:34 AM America/Bogota: «si esta funcionan do bien» |
| FR-4 | First refresh BUT no rule; no repository; detached | node + kit | `FR-4 header before the first refresh…`, `FR-4 no repository…`, `FR-4 a detached HEAD…` | PASS | |
| FR-5 | Rows, missing values, `Tokens:` gone, fill, thresholds | node | `FR-5 …` (14 tests) | PASS | |
| FR-5 | High fill `error` BUT no toast, status, sound or block | node + static | `FR-5 high context fill…`; contract `FR-5: no new call…` | PASS | |
| FR-5 | Fresh session (amended) | node + kit | `FR-5 fresh session…` ×2, new amended test; kit `FR-12 fresh session…` | PASS | |
| FR-6 | Surface table; label kept and cut | kit + node | `FR-6 the Next button: a chip on the terminal…` ×4; `FR-6 label is cut…` | PASS | |
| FR-6 | Press once AND a second press adds nothing | kit | `FR-7: a double press queues one run…`, `FR-7 double press…` | PASS | |
| FR-6 | Run in progress: dim, no fill BUT same words; no next step | node + kit | `FR-6 run in progress…`, `FR-6 no next step…`; kit chip test | PASS | |
| FR-6 | Keyboard focus on Next visible | human | Live check, `dark-ansi`, `Tab` to the chip | PASS (manual) | JC, 2026-11-09 11:34 AM America/Bogota: «si esta funcionan do bien» |
| FR-7 | Ladder, last step, `…`, guarantee table, 14-column rule | node | `FR-7 step 1…7`, `the guarantee at 31/24/17/14`, `exactly 14…`; new sweep | PASS | |
| FR-7 | At 24; below 24; no width; under 60 | node | `FR-7 at 24…`, `below 24…`, `no width given…` ×4, `under 60…` | PASS | |
| FR-7 | Any width AND IT MUST hold for the longest fixtures | node + kit | `FR-7 any width…`; new full sweep (>100k rows); kit `FR-16 narrow pane…` | PASS | |
| FR-8 | Error tone, wording, limit, empty text dim; AND the rest still draws | node + kit | `FR-8 …` ×3; kit `FR-8: a read failure…` ×2, `FR-16 a read fails…` ×2 | PASS | |
| FR-9 | Same facts BUT nothing new | node + static | refresh tests unchanged; contract `registers akili-panel, and only…`, `FR-9: no new atom…` | PASS | |
| FR-9 | AND `.claude/commands/` identical | git | `git diff --stat d28c31d~1 HEAD -- .claude/commands/` → empty | PASS (evidence) | No shipped test: a frozen hash would break legitimate later edits |
| FR-10 | No stale format | node | new `FR-10 No stale format…` | PASS | |
| NFR-1 | Theme keys only | static | contract `NFR-1: every tone, color and backgroundColor literal…` | PASS | |
| NFR-2 | Colour never alone | node | new NFR-2 sweep (6 states × 6 fills × widths 14–120) | PASS | |
| NFR-3 | Light and dark | human | T1, T5 (JC) | PASS (manual) | |
| NFR-4 | Render reads atoms only | static + kit | new contract `NFR-4…`; kit `NFR-1: drawing reads neither the disk nor the store` | PASS | |
| NFR-5 | Minimum 2.1.318 | validate | validate on 2.1.319 | PARTIAL | No 2.1.318 binary here; 2.1.318 types read at specify (P-11). The T3 Reviewer ran the kit on 2.1.318 (`execution.md`) |
| D-1 … D-4, D-6, D-7 | | node, static, kit | rows above | PASS | D-4 local only: CI has no `claude` |
| D-5 | Painted look | human | T1, T5 | PASS (manual) | |

## 8. Remediation

No product fix is owed. The two items the Tester left open were checks, not defects; both are closed:

| # | Clause | Manual check | Result |
|---|---|---|---|
| 1 | FR-4 *a size the person set stays theirs*, host side (spec I-13: no task step owned it) | In an inline pane, drag-resize it, run `/akili-panel` again, wait 30 s and one turn: the size is kept | **Closed:** JC, 2026-11-09 11:34 AM America/Bogota: «si esta funcionan do bien» |
| 2 | FR-6 keyboard focus on the Next chip visible | Tab to the chip: the focus shows (probe P-10 on 2.1.319 showed inverse video). Checked in `dark-ansi` only; the light theme was seen at T5 as a whole, not this item | **Closed:** JC, 2026-11-09 11:34 AM America/Bogota: «si esta funcionan do bien» |

**Manual check setup.** JC answered, 2026-11-09: «A: arma una pestaña con el panel en dark-ansi y un proyecto de prueba nuevo, y reviso los dos puntos. Sin screencapture.» Fresh scratch project at the session scratchpad (`akili-t5`, branch `feat/demo-spec`, `changes/demo-spec` in execute), plugin installed with `install --tool claude --local` (identical to the repo copy), Orca tab `Test: dark-ansi` (`term_19713d02-0b4f-4cf8-8fb9-a8533aabd50d`), Claude Code 2.1.319, `/akili-panel` drew all 16 rows inline at 98 columns. No screenshot was taken; JC's words are the record. JC's full answer: «1 y 2: sí, está funcionando bien (el foco se ve y el tamaño se mantiene). Cierra test-report.md con mis palabras: "si esta funcionan do bien". Sin screencapture.»

## 9. Accepted Gaps

| Gap | Reason | Substitute |
|---|---|---|
| D-5 / NFR-3 painted look | No automated check can see it | JC at T1 and T5, both PASS |
| NFR-5 on 2.1.318 | Only 2.1.319 installed here | 2.1.318 types read at specify; T3 Reviewer's kit run on 2.1.318 |
| FR-9 `.claude/commands/` byte-identical | A shipped hash would break later legitimate edits | `git diff` evidence above |
| `ui.log` content | The kit rig does not capture it | Static: only two log strings exist |
| Look on terminals other than JC's | Spec's accepted risk (requirements §8) | Theme keys and marks |
