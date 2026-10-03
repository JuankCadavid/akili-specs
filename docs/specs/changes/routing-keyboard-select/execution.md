# Execution Log: Keyboard multi-select for `akili routing` prompts

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/routing-keyboard-select` |
| Depth | Standard (compact) |
| Approval Mode | `gated` |
| Budget (design §11) | 4 tasks · ~430 LOC · 8 review rounds — tripwire at 4 tasks / ~520 LOC / 8 rounds |
| Started | 2026-10-02 (`83a80dc` — spec docs committed) |
| Leader | Claude Fable 5.1 (session model; no `## Model Routing` registry in this repo's `AGENTS.md` — the repo packages the methodology and has not run `/akili-constitution` Step 8C; default tiers from `docs/model-routing.md:120-122` apply: T2 `sonnet`, T3 `opus`) |
| Spawn mechanism | No Step 8E wrappers (`.claude/agents/` absent) — fallback sub-prompts seeded with `.agents/implementer.md` / `.agents/reviewer.md` by pointer; model set per spawn (`author ≠ auditor`) |
| Persona drift | `akili doctor --agents` before the first spawn: leader `primary-instructions` OUTDATED (2.30.0) → **FIXED** by `--fix` (backup `.agents/.backup/leader.md.20261002-194104`); `delegation` CUSTOM-EDITED and `shared-file-discipline` UNLOCATED (leader, implementer) left as the maintainer's call. `.agents/` is gitignored — nothing to commit |
| Runtime events | T1 attempt 1: spawn failure (`Could not determine current tmux pane/window`) ×1 → rung 1 (immediate retry) recovered |

## 2. Task Execution History

### T1 — `bin/routing.js`: pure select reducer, seam dispatch, comma-form message

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1) |
| Date | 2026-10-02 |
| Attempts | 1 |
| Models | Implementer `sonnet` (T2, effort medium, skill `tdd`) · Reviewer `opus` (T3, effort high, lens checklist) |
| Files changed | `bin/routing.js` (+71/−2: `keyToken`, `selectStep`, `selectLines`, `orderPicked` block with `// @akili-spec changes/routing-keyboard-select`; one dispatch line in `promptMultiSelect`; `parseNumberList` empty-reply text; four exports) · `test/routing.test.js` (+218: `scriptedIo(replies, selects)`, §5.2 token rows, FR-1/FR-2 reducer scenarios with rendered-output assertions, `orderPicked` cases, FR-3 deep-equality via `canonicalAnswers`, preChecked filter `[-1,0,9]→[0]`, adjust-path replay with `select` uncalled, `[cursor, claude]` order case, guidance text) |
| Implementer verification | `npm test` → `# tests 250 / # pass 250 / # fail 0`; `node --test test/routing.test.js` → 136/136; export probe → `function,function,function,function`; `grep -n "typeof io.select" bin/routing.js` → 1 hit (`:1008`, inside `promptMultiSelect`); `git diff -U0 bin/routing.js` → 4 hunks (string, reducer block, dispatch line, exports) — comma body byte-identical |
| Red run (pre-code, quoted) | 18 new tests red: `routing.keyToken is not a function` / `routing.selectStep is not a function` / `routing.orderPicked is not a function`; guidance text `+ 'nothing selected — try again.' - 'nothing selected: type at least one number, e.g. 1,3 — try again.'`; preChecked-order `expected: 1, actual: 0` |
| Falsifiers (executed post-green, each red then reverted; `diff` vs backup → identical) | (1) `orderPicked` always `picked` → deep-equal failure on `hosts` · (2) `confirm` sets `done` at 0 checked → `false !== true` on `s.guidance` · (3) ctrl+`a` → `+ 'toggle-all' - null` · (4) `toggle-all` always all-true → `checked[...]` stayed `true` on second press · (5) `typeof io.select` guard dropped → `TypeError: io.select is not a function` on the first comma test |
| Evidence re-run (Leader-inline, non-author) | `npm test` → 250/250 · export probe → `function,function,function,function` · grep → 1 hit — **VERIFIED** (the Reviewer also re-ran `npm test` → 250/250) |
| Reviewer verdict | **PASS** — "T1 meets FR-1, FR-2, FR-3 and NFR-4 at the reducer and seam level, and the falsifiers are real"; conformance walk term by term over FR-1 rows/scenarios, FR-2 both paths, FR-3 incl. BUT/AND IT MUST; mutation trace: each of the five falsifiers reaches a fixture where the mutated code diverges |
| ADVISORY (recorded, never gating) | Readability: three reducer cases (abort, null-key, second `a` press) assert state but not `selectLines` output — the disqualifier's literal wording; none is a tautology. Reliability: `selectStep` with empty `options` → cursor `% 0` = `NaN`; no caller passes an empty list. Resilience: `promptMultiSelect` trusts §5.3's never-empty promise — worth one assertion in T2's tests (carried as a forward pointer to T2, `[advisory-grade]`). Risk: `e.g. 1,3` text also shows on single-choice empty replies — design §9 records it, not drift |
| Requirements covered | FR-1 (reducer level, all rows and scenarios), FR-2 (both scenarios), FR-3 (scenario + BUT + AND IT MUST), NFR-4 |
| Decisions | Skills per task list (`tdd`), no deviation. Implementer on `sonnet` (registry T2 default), Reviewer on `opus` (T3) — author ≠ auditor held. Review intensity not met (Consumers non-`none`) → conformance Reviewer owed and run |
| Issues encountered | Spawn failure on the first Implementer launch (`Could not determine current tmux pane/window`) → rung 1 immediate retry recovered. Implementer left two unreported backup files `bin/routing.js.bak1`/`.bak2` in the tree (its report named `/tmp/routing.js.bak`); Leader removed them before the Reviewer spawn and records the residual here |
| runtime events | spawn-failure ×1 → rung 1 |
| spawns | implementer 52 calls, 146,529 tokens, ended complete; reviewer 7 calls, 78,374 tokens, ended complete |
| Final verification | `npm test` 250/250 green; tree holds only `bin/routing.js`, `test/routing.test.js`, and this log |

### T2 — `bin/akili.js`: capable-terminal predicate, raw-mode `select`, per-question `readline`, abort → 130

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1) |
| Date | 2026-10-02 |
| Attempts | 1 |
| Models | Implementer `opus` (escalated from the T2 `sonnet` default — raw-mode/listener lifecycle plus a manual pty check; effort high; skill `systematic-debugging`) · Reviewer `fable` (T3 ≠ `opus`; effort high, lens checklist) |
| Files changed | `bin/akili.js` (+108/−6: `readlineCore` require; `canKeySelect`, `keySelect`, `makeRoutingIo` under `// @akili-spec changes/routing-keyboard-select`; `runRouting` uses the builder, `catch` on `AKILI_SELECT_ABORT` → `exitCode 130`, rethrow otherwise) · `test/routing-io.test.js` (+23: frozen non-TTY stderr lock, exact string; `--json` variant: exit 1, no JSON on stdout, tree unchanged) |
| Implementer verification | `npm test` → `# tests 251 / # pass 251 / # fail 0` (`NFR-2 usage-error runs (ms): 119, 74, 71`); `node --check` ok; `dependencies` probe exit 0; requires = core + `./routing.js` / `./persona.js` / `../package.json`; lock green before and after the product change; pty (`keys2.exp`): `<<P1: Which hosts do you use?>>` · `<<AFTER-KEYS: advanced to roster: Claude Code — which models do you have?>>` · `<<RC=130>>` · `<<STTY: echo>>` · tree `.git` only · 0 stack lines; final frame `  [x] 1) Claude Code` / `❯ [x] 3) Antigravity` redrawn with `ESC[7A`; `AKILI_SELECT_ABORT` at `:2287` (throw), `:2367` (catch) |
| Red run (baseline, Leader-executed at `dbdccea`) | `keys.exp`: `<<AFTER-KEYS: nothing selected — try again.>>`, `<<RC=0>>` — keys not understood, exit 0 |
| Falsifiers (executed, quoted red, reverted — `cmp` vs backup identical) | (1) no `restore()` on done → `<<ECHO: timeout — typed answer not echoed>>` (stale listeners caught the `a` in `claude` and redrew earlier blocks); delivered code → `<<ECHO: claude echoed>>`, `<<RC=0>>` (also confirms typed-path Ctrl-C stays exit 0) · (2) `exitCode = 0` → `<<RC=0>>` · (4) one extra space in `USAGE_FORM` → `not ok 1 - non-TTY fallback lock`, `+ '…--wrappers yes|no  --yes\n'` vs `- '…yes|no --yes\n'` · (5) `readline/promises` for `emitKeypressEvents` → `TypeError: readline.emitKeypressEvents is not a function` at `bin/akili.js:2302:16`, `<<RC=1>>`, `<<STTY: echo>>` · (3) deferred to T3 per task text |
| Evidence re-run (Leader-inline, non-author) | `npm test` → 251/251 · `node --check` ok · deps ok · `grep -c 'setRawMode(' bin/akili.js` → 2 · `AKILI_SELECT_ABORT` → `:2287`, `:2367` · own pty run of `keys2.exp` on a fresh scratch project → `❯ [x] 1) Claude Code`, `❯ [x] 3) Antigravity`, roster list reached, `<<RC=130>>`, `<<STTY: echo>>`, tree `.git` only — **VERIFIED** |
| Reviewer verdict | **PASS** — "matches design §7.2 row by row and the cited FR-1/FR-4/FR-5 clauses term by term; the fallback lock is a true exact-string pin (mutation 4 traceably red), the recorded red run failed on behavior, and nothing else in `runRouting` changed semantics". Walk: DD-3 members verbatim, `out` = stderr under `--json`; DD-4 per-question interface closed in `finally`, prompt format byte-identical to `dbdccea:2252`; `restore()` idempotent and reached on confirm/abort/handler throw/setup throw; no `process.exit` in the prompt; typed-path Ctrl-C unchanged |
| ADVISORY (recorded, never gating) | Resilience: `ESC[nA` assumes no soft wrapping — a terminal narrower than the longest row/hint (~60 cols) leaves stale lines; spec-conformant (design mandates the sequence); a doc note or a future `columns` clamp. Reliability: concurrent `select` calls would double-attach listeners — unreachable (sequential `await`s); `restore()` throwing inside the setup catch still rejects once but may leave cursor state. Readability: the task's Done line `grep -c "setRawMode" → 2` is inconsistent with its Scope (the `typeof` member is a third textual hit) — corrected below |
| Requirements covered | FR-1 *Redraw* / no echo / no `>` line; FR-4 predicate + *stdin not a TTY* row + *Piped stdin keeps NFR-2* (exact stderr); FR-5 all clauses incl. exit 130, no stack trace, typed-path Ctrl-C exit 0, *Questions alternate*; NFR-1, NFR-2, NFR-5 |
| Decisions | Model escalation `sonnet` → `opus` for the Implementer (reason above); Reviewer on `fable` to keep author ≠ auditor. **Execute-time edit to `tasks.md` T2 Done line:** `grep -c "setRawMode" bin/akili.js → 2` corrected to `grep -c 'setRawMode(' bin/akili.js → 2` (the predicate's `typeof process.stdin.setRawMode` member is a third textual hit of the bare word) — a verification-phrasing fix, no requirement meaning changed. Diff delivered to the Reviewer by scratchpad path (173 lines, under the 300-line inline threshold — chosen to spare Leader output tokens; the file sits outside the tree). Forward pointer from T1 (`io.select` never resolves empty) confirmed by construction: `done` only when `checked.some(Boolean)` |
| Implementer `Not Done / Assumptions` (verbatim, assumptions only — no owed item, no continuation) | "`grep -c "setRawMode" bin/akili.js` returns 3, not 2. The third line is the `typeof process.stdin.setRawMode` member that the brief requires verbatim in `canKeySelect`. The two actual calls (`setRawMode(` at `:2274` and `:2304`) are both inside `keySelect`." · "The original `keys.exp` waits for `> ` at line 11, which the keyboard list never prints. My copy `scratchpad/t2/keys2.exp` waits for `Enter confirms` instead; the original is untouched." · "Falsifier (1) needed my own script, `scratchpad/t2/echo.exp`. It reaches a typed question by picking `other (type id)` (`a` then Enter), because that is the first typed question after the roster." |
| Issues encountered | none (no stray files this time) |
| runtime events | none |
| spawns | implementer 32 calls, 105,306 tokens, ended complete; reviewer not reported by host at the time of writing |
| Final verification | `npm test` 251/251; pty keyboard path live on macOS; tree holds `bin/akili.js`, `test/routing-io.test.js`, this log, `tasks.md` |
