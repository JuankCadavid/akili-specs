# Tasks: Keyboard multi-select for `akili routing` prompts

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/routing-keyboard-select` |
| Depth | Standard (compact) |
| Type | Change |
| Approval Mode | `gated` |
| Status | **Approved** — 2026-10-02 (user, Phase 3 gate: Continue); ready for `/akili-execute` |
| Date | 2026-10-02 |
| Budget (design §11) | **4 tasks · ~430 LOC · 8 review rounds** — `/akili-execute` stops and escalates past 4 tasks, ~520 LOC, or 8 rounds |
| Commit prefix | `[SPEC:changes/routing-keyboard-select]` |
| Format precedent | `docs/specs/archive/2026-10-02-changes--model-routing-configurator/tasks.md` |
| Verified at | `dbdccea` — every baseline reading below was **executed** on 2026-10-02 and is quoted, not predicted (KZ-changes--leader-brief-contract-2) |
| Baseline probes | `node -e` export/seam/message probes (T1) · `printf '' \| node bin/akili.js routing --project <scratch>` (T2) · `scratchpad/b3/keys.exp` — `/bin/sh` on an `expect` pty, CLI inside, keys, Ctrl-C, `echo RC=$?`, `stty -a` (T2, T3) · `grep -c "↑/↓\|toggles all\|TERM" docs/cli.md` (T4) |

## 2. Task Graph

```
T1 (routing.js: keyToken · selectStep · selectLines · orderPicked · promptMultiSelect dispatch · nothing-selected text; unit tests, tdd)
 └─→ T2 (akili.js: canKeySelect · keySelect · makeRoutingIo · runRouting abort code; routing-io fallback lock)
      ├─→ T3 (pty suite: test/routing-pty.test.js + .exp fixtures; ci.yml expect step)
      └─→ T4 (docs/cli.md Routing · CHANGELOG · AGENTS.md:12 clause)        T3 ∥ T4 (disjoint files)
```

Waves: **T1** → **T2** → **T3 ∥ T4**. No circular dependencies. T4 waits for T2 so every documented key and predicate member is quote-checked against shipped code, not design text (KZ-002).

**`skip-eligible` tasks: none.** T1 is logic under `tdd`; T2 edits terminal state; T3 is a timing-sensitive harness; T4 is the KZ-002 recurrence site (CHANGELOG clauses).

**Skills:** T1 `tdd` · T2 `systematic-debugging` (if the pty probe disagrees with the spike) · T3 `tdd` · T4 `cognitive-doc-design`. No UI skill applies (terminal text).

---

### T1 — `bin/routing.js`: pure select reducer, seam dispatch, comma-form message

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~70 LOC product · ~110 LOC tests) |
| Depends on | none |
| Requirements | FR-1 (all three scenarios at the reducer level; *Result order*; *Any other key* ignored), FR-2 keyboard scenario incl. `BUT it must NOT count as a retry`, FR-2 comma scenario incl. `AND IT MUST keep … /nothing selected/ green`, FR-3 (scenario, `BUT it must NOT call io.select for single-choice`, `AND IT MUST pass preChecked filtered`), NFR-4 |
| Design refs | §5.1–§5.5, §7.1, DD-1, DD-2, DD-7, P-1, P-6, P-8, P-9 |
| Review | `full` — the reducer decides what the user's keys do; a wrong order rule silently breaks the predecessor's idempotence |

**Scope.**

- `keyToken(str, key)` → `up | down | space | toggle-all | confirm | abort | null` exactly per design §5.2 (`key.name` `up`/`down`/`space`/`return`/`enter`; `str === " "`; `str === "a"` with no `ctrl`/`meta`; `key.ctrl && key.name === "c"`; everything else `null`).
- `selectStep(state, token)` → new state (no mutation): wrap both ends; toggle clears `guidance`; `toggle-all` all-true unless all already true; `confirm` with 0 checked → `guidance = true`, never `done`; `abort` → `aborted`.
- `selectLines(title, state)` → `options.length + 2` lines per §5.4 (`❯`/two spaces marker, `[x]`/`[ ]`, `n) text`, hint or guidance line).
- `orderPicked(picked, checked)` → `checked.slice()` when the two are set-equal, else `picked`.
- `promptMultiSelect`: after the existing `checked` filter (`:943`), `if (typeof io.select === "function") return { picked: orderPicked(await io.select(title, options, checked), checked) };` — the comma body below it stays byte-identical.
- `parseNumberList` empty reply → `nothing selected: type at least one number, e.g. 1,3` (§5.5).
- Exports: `keyToken`, `selectStep`, `selectLines`, `orderPicked`.
- Tests (`test/routing.test.js`, `tdd` — write red first): `scriptedIo(replies, selects)` gains an optional `selects` script recording `(title, options, preChecked)` and throwing past its script; unit cases for every row of §5.2 and the FR-1/FR-2 reducer scenarios; `orderPicked([0,4],[4,0]) → [4,0]`, `orderPicked([0,4],[0]) → [0,4]`; FR-3 deep-equality: the existing FR-1 shape (`:967`) replayed with `selects = [[0,3],[0,1,2],[0,1,2,3]]` and the four Enters → `canonicalAnswers` equal to the comma run, `selects` called 3× with the comma form's titles and option texts, `asked` holds no multi-select title; `preChecked [-1,0,9]` → `select` receives `[0]`; the adjust-path test (`[t]`) replayed with `select` present → `select` count unchanged (single-choice stays `ask`); previous hosts `[cursor, claude]` + `select → [0,4]` → `answers.hosts` is `[cursor, claude]`; comma empty-twice → `asked[1]` first line `nothing selected: type at least one number, e.g. 1,3 — try again.` and `:961`'s regex still matches.

**Verification.**

| Field | Value |
|---|---|
| Command | `npm test` (all suites green); `node -e "const r=require('./bin/routing.js'); console.log([r.selectStep,r.keyToken,r.selectLines,r.orderPicked].map(x=>typeof x).join(','))"` → `function,function,function,function` |
| Red run (executed at baseline) | exports probe → `undefined,undefined,undefined,undefined` · seam probe (io with `select`, `ask` scripted empty) → `threw: scripted io: no reply for \`Pick (comma-separated numbers)\`` (select never called) · comma empty-twice → `{"error":"Pick: nothing selected"}`, `asked[1]` first line `"nothing selected — try again."` |
| Falsifier | (1) `orderPicked` → always return `picked` → the `[cursor, claude]` case reads `[claude, cursor]` (red). (2) `selectStep` `confirm` with 0 checked sets `done` → the "never done" case red. (3) `keyToken("a", {ctrl:true,name:"a"})` → `toggle-all` instead of `null` → red. (4) `toggle-all` → always set all true → the all-true→all-false case red. (5) drop the `typeof io.select` guard → every existing comma test red at the first `select` call (`TypeError`). Each executed against the post-change code and the red quoted in the closure |
| Disqualifier | A deep-equality case that compares `answers` objects directly instead of `canonicalAnswers` would pass on key order alone — not evidence; the test uses `canonicalAnswers`. A reducer test that reaches the asserted state only through the token the test also constructs (a tautology) proves nothing — every case starts from `selectLines`-visible state and asserts the rendered line too |
| Consumers | `bin/routing.js:1082`, `:1224` (callers — unchanged); `test/routing.test.js:961` (regex, green); `test/routing.test.js:922-926` `Q` hint strings (comma path — unchanged); `bin/akili.js` becomes a consumer of the four exports in T2; single-choice empty reply (`parseOneNumber` → `parseNumberList`, `:931-933`) shows the new text — recorded in design §9, not drift |

**Done.** All of the above green; the five falsifiers executed and quoted red; `grep -n "typeof io.select" bin/routing.js` → 1 hit inside `promptMultiSelect`; the comma body's diff is empty apart from the dispatch lines (`git diff -U0 bin/routing.js` shows no change between the `const checked` line and `return r.error ? …`).

---

### T2 — `bin/akili.js`: capable-terminal predicate, raw-mode `select`, per-question `readline`, abort → 130

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~70 LOC product · ~25 LOC tests) |
| Depends on | T1 |
| Requirements | FR-1 *Redraw* and `BUT it must NOT echo … or append a second copy`, `AND IT MUST accept the keys without any prior typed input`; FR-4 (predicate, *stdin not a TTY* row, *Piped stdin keeps NFR-2* scenario incl. `AND IT MUST produce the same stderr text`); FR-5 (restore on confirm/Ctrl-C/throw; exit 130; `BUT it must NOT print a stack trace`; *Questions alternate between seams*); NFR-1, NFR-2, NFR-5 |
| Design refs | §7.2, §6, DD-3, DD-4, DD-5, P-2, P-3, P-4, P-5, P-7, P-12, P-15 |
| Review | `full` — raw-mode and listener lifecycle; a missed restore leaves the user's shell broken |

**Scope.**

- `const readlineCore = require("readline")` beside the existing `readline/promises` (P-3).
- `canKeySelect(out)`: the four members of DD-3, verbatim.
- `keySelect(out)` → `select(title, options, preChecked)`: `readlineCore.emitKeypressEvents(process.stdin)`; remember `isRaw`; `setRawMode(true)`; `resume()`; `ESC[?25l`; initial draw of `routing.selectLines`; on `keypress`: `routing.keyToken` → `null` ⇒ no-op; else `routing.selectStep` → redraw as `ESC[<n>A` + per line `ESC[2K<text>` + `\n` (n = lines drawn); `done` ⇒ final draw, `restore()`, resolve ascending checked indices; `aborted` ⇒ `restore()`, write `\n`, reject `Object.assign(new Error("selection aborted"), { code: "AKILI_SELECT_ABORT" })`; the keypress handler body is wrapped so a throw calls `restore()` then rejects. `restore()`: remove listener, `setRawMode(wasRaw)`, `pause()`, `ESC[?25h`.
- `makeRoutingIo(args)` → `{ ask, select? }`: `out = args.json ? process.stderr : process.stdout`; `ask` creates a `readline/promises` interface per call and closes it in `finally`; `select` attached iff `canKeySelect(out)`.
- `runRouting`: replace `:2250-2252` and `finally { if (rl) rl.close(); }` with the builder (keep `isTTY` for `collectAnswers` and the adopt/skip branch); add the `AKILI_SELECT_ABORT` catch → `process.exitCode = 130; return`.
- `test/routing-io.test.js`: lock the fallback — the no-flags pipe run's stderr (ANSI stripped) **equals** the frozen baseline string below; `tree(project)` unchanged; the same with `--json` (stderr carries the error, stdout empty of JSON); the existing NFR-2 timing diagnostic stays.
- Manual pty check during this task (promoted to `node:test` in T3): re-run `scratchpad/b3/keys.exp` against the modified CLI — expect `❯ [x] 1) Claude Code` … `❯ [x] 3) Antigravity` after space/↓/↓/space (cursor on row 3), then Enter advances to `Claude Code — which models do you have?`; Ctrl-C there → `RC=130`, `STTY: echo`, scratch tree `.git` only.

**Verification.**

| Field | Value |
|---|---|
| Command | `npm test`; `node --check bin/akili.js`; `node -e "const p=require('./package.json'); if (p.dependencies) process.exit(1)"` → exit 0; `grep -n "require(" bin/akili.js bin/routing.js` lists only core modules and `./routing.js` / `./persona.js`; the `keys.exp` manual run above |
| Red run (executed at baseline) | `keys.exp` at `dbdccea`: `<<P1: Which hosts do you use? (comma-separated numbers)>>` · after space/↓/↓/space/Enter → `<<AFTER-KEYS: nothing selected — try again.>>` · Ctrl-C → `<<RC=0>>` · `<<STTY: echo>>` — the keyboard keys are not understood and the exit code is 0, both red against FR-1/FR-5 |
| Frozen fallback baseline (executed) | `printf '' \| node bin/akili.js routing --project <scratch>` → stderr (ANSI stripped) `ERROR: stdin is not a TTY and answers are still missing: --hosts, --models, --yes — use the non-interactive form: akili routing --hosts <h1,h2> --models <host>=<id>[@T<n>[+T<m>]],… --cli <host>=<binary> --wrappers yes|no --yes` · `exit=1` · `155 ms` · stdout 485 bytes (banner) · tree `.git` only |
| Falsifier | (1) Remove `restore()` from the `done` branch → after the first select the typed CLI-invocation question does not echo (`keys.exp` extension: send `claude\r` and expect the echo) — red. (2) Replace `process.exitCode = 130` with `0` → `RC=0` — red. (3) Drop member 3 (`out.isTTY`) → `node bin/akili.js routing \| cat` inside the pty shows `❯` in the piped output — red (T3 automates this). (4) Change the usage text by one character → the frozen-baseline lock red. (5) Use `readline` (promises) for `emitKeypressEvents` → `TypeError` at the first keyboard question — red at the `keys.exp` run |
| Disqualifier | A `keys.exp` run that **times out** is inconclusive, not a product red, unless it reproduces 3/3 with a 15 s timeout (pty timing — T8 precedent). A fallback lock that strips more than ANSI (e.g. collapses whitespace) could hide a changed usage line — the lock strips `ESC[…m` only, exactly as `stripAnsi` at `test/routing-io.test.js:30-32`. The 155 ms figure is a hang guard, not the claim: a single run over 2 s is reported, not failed |
| Consumers | `bin/akili.js:2266` (adopt/skip `io.ask` — keeps working through the builder); `bin/routing.js` exports from T1; `test/routing-io.test.js` all existing runs (pipe stdin — `select` never attached); `/akili-constitution` Step 8C (`--yes --json`, no prompt — unaffected by construction) |

**Done.** `npm test` green on this machine; the manual `keys.exp` run shows `❯`, `RC=130`, `STTY: echo`, empty tree; falsifiers (1), (2), (4), (5) executed and quoted; `grep -c 'setRawMode(' bin/akili.js` → 2 (set true, restore) and both sit inside `keySelect` — corrected at execute (2026-10-02): the predicate's `typeof process.stdin.setRawMode` member is a third textual hit of the bare word; `grep -n "AKILI_SELECT_ABORT" bin/akili.js` → 2 hits (throw site, catch site).

---

### T3 — pty suite: `test/routing-pty.test.js`, `.exp` fixtures, CI `expect` step

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~120 LOC test + fixtures · 4 LOC CI) |
| Depends on | T2 |
| Requirements | FR-1 *Hosts 1 and 5 by keyboard* on a real pty (rows, `❯`, no `> ` line, in-place redraw via `ESC[7A`); FR-2 keyboard scenario on a real pty; FR-4 rows *stdin TTY without setRawMode*, *output stream not a TTY*, *`TERM=dumb`* + scenario *`TERM=dumb` on a pty* incl. `BUT it must NOT show the ❯ cursor`; FR-5 *Ctrl-C aborts without writing* (exit 130, tree unchanged, `stty` echo, `BUT no stack trace`, `AND IT MUST leave the comma path's Ctrl-C … exit 0`), *Questions alternate between seams*; NFR-3, NFR-5 |
| Design refs | §7.3, DD-3 (enumeration-wide), DD-6, P-10, P-11 |
| Review | `full` — the only gate for the dominant defect class; a harness that passes vacuously (matching text that appears in both forms) is the KZ-changes--model-routing-configurator-1 failure |

**Scope.**

- `test/fixtures/routing/pty-*.exp` (byte-exact under `.gitattributes`, P-11), each spawning `/bin/sh` with `PS1=SH> `, running `node <bin> routing --project <proj>` inside it, and reading `echo RC=$?` and `stty -a` **on the same pty** afterwards; paths/env from `argv`.
- `test/routing-pty.test.js` (`node:test`): `t.skip("expect not on PATH")` / `t.skip("win32: no pty")` when `process.platform === "win32"` or `which expect` fails — the skip reason prints in the run; otherwise `spawnSync("expect", [fixture, …], { timeout: 30000 })`, assertions on the stripped log and on the scratch project tree:
  1. **Keyboard happy path**: space · `\x1b[B`×4 · space · Enter; then Claude Code roster `a` · Enter; then the CLI-invocation typed question `claude\r` (echo asserted — *Questions alternate*); remaining questions Enter/`Y`/`A` → log contains `❯ [x] 5) Cursor`, contains `\x1b[7A` (in-place redraw for 5 options + 2 lines), does **not** contain `> ` between the host title and the roster title, does not contain `nothing selected`; `.agents/model-routing.json` byte-equals the file written by the flags run `--hosts claude,cursor --models claude=opus,sonnet,haiku --models cursor=… --cli claude=claude --wrappers yes --yes` in a second scratch project **on the same UTC day** (P-6: `updatedAt` is a date).
  2. **Empty confirm**: Enter with nothing marked → log contains `mark at least one option — space toggles, Enter confirms`; then space · Enter proceeds (question stayed open).
  3. **Ctrl-C**: at the host question → `RC=130`, `stty -a` reports `echo` (not `-echo`), tree unchanged, log has no line matching `^\s+at ` (stack trace).
  4. **`TERM=dumb`**: host prompt reads `Which hosts do you use? (comma-separated numbers)` with a `> ` line, no `❯`; `1,5\r` accepted; Ctrl-C at the roster question → `RC=0` (comma path unchanged, P-5).
  5. **No `setRawMode`**: `node -r <fixture>/no-rawmode.js <bin> routing …` where the preload does `delete require("tty").ReadStream.prototype.setRawMode` → comma prompt, no `❯`.
  6. **Output not a TTY**: `node <bin> routing … | cat` inside the pty → comma prompt in the piped output, no `❯`.
- `.github/workflows/ci.yml`: one step before *Unit tests*, `if: runner.os == 'Linux'`, `run: sudo apt-get update && sudo apt-get install -y expect` (P-10).

**Verification.**

| Field | Value |
|---|---|
| Command | `node --test test/routing-pty.test.js` (macOS: all six cases run); `npm test`; CI: six jobs green, the Windows jobs' log shows the two skip lines, the Linux jobs' log shows the `expect` install step and six cases run |
| Red run (executed at baseline, `keys.exp` at `dbdccea`) | case 1/2 shape: `<<AFTER-KEYS: nothing selected — try again.>>` (no `❯`, no guidance line); case 3: `<<RC=0>>`; cases 4–6 are **green at baseline by construction** (the comma form is today's only form) — they are regression locks on the fallback, and their falsifier is (3) below |
| Falsifier | (1) Case 1: mutate `keyToken` to return `null` for `down` → the log never shows `❯ [x] 5) Cursor` — red. (2) Case 3: set exit code 0 → `RC=0` — red. (3) **Enumeration-wide (DD-3):** remove each predicate member in turn and run cases 4, 5, 6 — each removal must turn exactly its case red (`❯` appears) while the other two stay green; a member whose removal reds nothing is not enforced. (4) Case 1's `ESC[7A` assertion: replace the cursor-up write with nothing → count 0 — red. (5) Byte-equality: run the flags project with `--models claude=opus,sonnet` (one fewer) → files differ — red |
| Disqualifier | An `expect` timeout is inconclusive (report the spread, 3 runs) unless 3/3; a case whose expected text also appears in the other form (e.g. matching `Which hosts do you use?` alone) is **not** a gate — every keyboard case asserts a keyboard-only token (`❯`, `ESC[7A`, the guidance line) and every fallback case asserts a comma-only token (`(comma-separated numbers)` **and** absence of `❯`). Byte-equality across a UTC-midnight boundary is inconclusive — compare with `updatedAt` stripped and say so |
| Consumers | `.github/workflows/ci.yml` (new step; `npm test` step unchanged); `.gitattributes` (`test/fixtures/** -text` already covers the `.exp` files); `package.json` `files` — `test/` is not shipped, nothing to change |

**Done.** Six cases green locally; falsifiers (1), (2), (3 — all three members), (4) executed and quoted red; CI run id recorded with the Windows skip lines and the Linux `expect` step quoted — this settles **P-10** (write the outcome into design §12's row: `Verified at` = the CI commit, `Settled by` = the run id).

---

### T4 — Docs: `docs/cli.md` *Routing*, `CHANGELOG.md`, `AGENTS.md:12` clause

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~30 LOC) |
| Depends on | T2 (documents shipped behavior; may run parallel with T3) |
| Requirements | FR-6 (both bullets); design §4 `AGENTS.md:12` clause |
| Design refs | §4, §6, DD-3, DD-7, P-13 |
| Review | `full` — KZ-002 has recurred six times on CHANGELOG clauses; every clause is quote-checked at HEAD |

**Scope.**

- `docs/cli.md` → *Routing* → after the sentence ending `(Enter keeps them).` (`:339`): one short paragraph + one table — keys (↑/↓ move, wraps · space toggles · `a` toggles all · Enter confirms, ≥ 1 required, guidance line otherwise · Ctrl-C exits 130, nothing written) and the fallback rule as the closed list of the four members (stdin TTY · raw mode available · the prompt's output stream a TTY · `TERM` not `dumb`), stating that when any member fails the comma form is used unchanged and that single-choice prompts stay typed.
- `CHANGELOG.md` → Unreleased → replace `- No unreleased changes yet.` with a `### Changed` entry (release class **patch**) — each clause quote-checked against `bin/routing.js`, `bin/akili.js`, `docs/cli.md` at HEAD; no claim about Windows beyond "the keyboard path is not exercised on Windows CI; the fallback is".
- `AGENTS.md:12`: append to the parenthesised list of `bin/routing.js` contents: `and the pure keyboard-select reducer behind the interactive prompts`.

**Verification.**

| Field | Value |
|---|---|
| Command | `grep -c "↑/↓\|toggles all\|TERM" docs/cli.md` → ≥ 3; `grep -n "No unreleased changes yet" CHANGELOG.md` → 0 hits; `grep -n "keyboard-select reducer" AGENTS.md` → 1 hit on line 12; `git diff --check`; the Reviewer re-reads each CHANGELOG and `cli.md` clause against the shipped line it describes |
| Red run (executed at baseline) | `grep -c "↑/↓\|toggles all\|TERM" docs/cli.md` → `0` · `grep -n "No unreleased changes yet" CHANGELOG.md` → `11:- No unreleased changes yet.` |
| Falsifier | (1) State a fifth key (e.g. `q` quits) in `cli.md` → the Reviewer's quote-check finds no `q` token in `keyToken` — red. (2) Write "exits 1 on Ctrl-C" → contradicts `process.exitCode = 130` — red. (3) Omit the output-stream member from the four → the list has three items against DD-3's four — red. Held-out case for the quote-check: the sentence about single-choice prompts must match the code's unchanged `promptOne` (`bin/routing.js:953`), which the design cites only indirectly |
| Disqualifier | A grep count ≥ 3 says the words exist, not that the claims are true — the presence-grep is the smoke, the clause-by-clause quote-check is the gate. A CHANGELOG clause paraphrased from `design.md` rather than from HEAD is disqualified even when it reads correctly (KZ-002 recurrence 3: quoted design text as shipped) |
| Consumers | `docs/cli.md:339` (the only existing interaction sentence — P-13); `README.md:439` (names the command only — no change); `docs/commands/akili-constitution.md` and `.claude/commands/akili-constitution.md` (non-interactive form — no change, confirmed by P-13's grep) |

**Done.** The three greps read as stated; `git diff --check` clean; the Reviewer's closure lists each CHANGELOG clause with the HEAD line it was checked against.

---

## 3. Coverage Closure (scenario / clause → task)

| Requirement clause | Owner |
|---|---|
| FR-1 table rows (rendering, start, ↑/↓ wrap, space, `a`, Enter, Ctrl-C, other key, redraw, result order) | T1 (reducer + lines + order) · T2 (redraw, Ctrl-C plumbing) · T3 case 1 (real pty) |
| FR-1 *Hosts 1 and 5* — THEN rows / continues / AND equals comma run / BUT no echo or second copy / AND IT MUST no `>` line | T3 case 1 (`❯ [x] 5) Cursor`, roster title follows, byte-equal file, `ESC[7A`, no `> `) |
| FR-1 *Pre-checked kept by Enter* — THEN pre-checked order / AND IT MUST list order only on change | T1 (`orderPicked`, `[cursor, claude]` case) |
| FR-1 *`a` toggles all, wrap* | T1 |
| FR-2 keyboard — THEN guidance / AND cleared on toggle / BUT not a retry | T1 (reducer) · T3 case 2 (pty) |
| FR-2 comma — THEN new first line / AND IT MUST keep `:961` green | T1 |
| FR-3 — THEN deep equality, 3 calls, titles/options, no `ask` for multi-select / BUT not single-choice / AND IT MUST filtered `preChecked` | T1 |
| FR-4 predicate table — stdin pipe / no `setRawMode` / output not TTY / `TERM=dumb` | T2 (pipe lock) · T3 cases 5, 6, 4 |
| FR-4 *Piped stdin keeps NFR-2* — THEN exit 1 < 2 s, usage text, no `setRawMode` / AND IT MUST same stderr | T2 (frozen baseline lock; `setRawMode` absent on a pipe, P-3) |
| FR-4 *`TERM=dumb` on a pty* — THEN comma prompt accepts `1,5` / BUT no `❯` or hint | T3 case 4 |
| FR-5 restore on confirm / Ctrl-C / throw | T2 (`restore()` in all three branches) · T3 cases 1, 3; **throw path: no automated gate** — the Reviewer verifies `restore()` runs on the handler's throw path (accepted gap, recorded) |
| FR-5 *Ctrl-C aborts* — THEN 130, nothing written, `stty` echo / BUT no stack trace / AND IT MUST comma Ctrl-C exit 0 | T3 case 3 · case 4's Ctrl-C |
| FR-5 *Questions alternate* | T3 case 1 (typed `claude` echoes after two selects) |
| FR-6 both bullets | T4 |
| NFR-1 | T2 (`dependencies` probe, `require(` grep) |
| NFR-2 | T2 (existing timing diagnostic) |
| NFR-3 | T3 (six CI jobs; Windows skip lines) |
| NFR-4 | T1 |
| NFR-5 | T3 (Node 18 CI jobs) |

No clause is cleared by citing a different requirement. Two recorded gaps: the FR-5 throw-path restore (Reviewer-read, no automated input can inject the throw without product hooks) and the Windows keyboard path (requirements §8 accepted risk).

## 4. PR Strategy

~430 LOC in four tasks on two product files and three test files: **one PR**. Review order for the reader: T1 (pure logic) → T2 (plumbing) → T3 (harness) → T4 (docs). Out of scope for the reviewer: single-choice prompts, the typed path's Ctrl-C code, anything under `--yes`.
