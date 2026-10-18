# Tasks: `akili init` — Ctrl-C exits 130, cleanly, on every Node

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/init-ctrlc-abort` |
| Depth | **Lite** (Bug Mode) |
| Status | **Approved** — 2026-10-18 (Juan Carlos, Phase 3 gate: Continue). Checklist amendment: FR-1 newline assertion + falsifier (6) added (coverage closure) |
| Date | 2026-10-18 |
| Budget (design §12) | **1 task · ~180 LOC · 2 review rounds**. `/akili-execute` stops and escalates past 1 task, ~230 LOC, or 2 rounds |
| Commit prefix | `[SPEC:bugfix/init-ctrlc-abort]`. Local commits only: no push, no release, no `npm publish` |
| Format precedent | `docs/specs/bugfix/pty-harness-ubuntu-flake/tasks.md` |
| Verified at | `dd23554`. Every baseline reading below was **executed** on 2026-10-18 and is quoted, not predicted (KZ-changes--leader-brief-contract-2) |
| Baseline probes (session scratchpad) | `init.exp` Q1/Q2 × Node 22.23.3/22.12.0 (proposal Reproduction) · `ans.exp` / `ans2.exp` answered path · `q.exp` + `nonet.js` cache/preload falsifier (design DD-4) · `mut-*.tap`, `mut2-*.tap` routing-pty under two `makeRoutingIo.ask` mutations, reverted with `git checkout bin/akili.js` (tree clean afterwards) |

## 2. Task Graph

```
T1 (regression test first → red · questionOrAbort + init catch → green · docs/changelog)
```

One task, no dependencies. **`skip-eligible` tasks: none.** T1 changes a function `akili routing` shares and adds the harness its own verdict rests on.

**Skills:** `tdd` (test first, red quoted below) · `systematic-debugging` if a real pty disagrees with a baseline reading · `cognitive-doc-design` (CHANGELOG entry, `docs/cli.md` line). No UI skill applies.

---

### T1 — Regression pty test, shared `questionOrAbort`, `init` exits 130

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~180 LOC: `bin/akili.js` ±25 · `test/init-pty.test.js` ~90 · `test/fixtures/init/pty-init.exp` ~45 · `test/fixtures/init/no-network.js` ~10 · `docs/cli.md` 1 · `CHANGELOG.md` ~4) |
| Depends on | none |
| Requirements | FR-1 (statement: one newline, exit 130; both scenarios plus the swapped-version clause; `BUT` no `AbortError`/trace line; `AND IT MUST` no install target, in `HOME` and cwd); FR-2 (scenario; `BUT` no added prompt, default marker or trailing text); FR-3 (scenario: `pty-fallback.exp dumb` stays `RC=130`); NFR-1 (seed byte-identical **and** no `https` call); NFR-2 (real pty, own files, `win32`/no-`expect` skip with a printed reason, `AKILI_PTY_LOG_DIR` copy); NFR-3 |
| Design refs | §3, §4, DD-1–DD-5, P-2, P-3, P-5–P-9. **P-4 `UNVERIFIED`** (Node 18): see *Done* |
| Review | `full`: product code in a function routing shares, plus the harness the regression verdict rests on |

**Scope (in this order; `tdd`).**

1. **Test first.**
   - `test/fixtures/init/no-network.js`: a `--require` preload that wraps `https.get` and `https.request` and appends `get` or `request` to `$AKILI_NET_MARKER` before delegating.
   - `test/fixtures/init/pty-init.exp`, with argv `node bin home cwd log mode` and `mode ∈ q1 | q2 | answer`. Rules:
     - `log_user 0`, `log_file` to `<log>`; `HOME` and `USERPROFILE` set to `<home>`; `PS1="SH> "`; `TERM` defaulted to `xterm-256color`; `NODE_OPTIONS=--require <no-network.js>`; `AKILI_NET_MARKER=<home>/../net.log`.
     - `expect_after` holds `timeout` → `<<TIMEOUT: unmatched wait>>` + `exit 2`, and `eof` → `<<EOF>>` + `exit 2`. It is placed after `spawn /bin/sh`.
     - The prompt wait is `expect -re {>(\x1b\[[0-9;]*[A-Za-z]| )*$}`, never `{> $}` (see Disqualifier).
     - Ctrl-C goes through the same `ctrl_c_to_shell` two-stage wait as `pty-ctrl-c.exp` (`<<BACK-IN n ms>>`).
     - `q1`: Ctrl-C at `Which tool`. `q2`: answer `1`, then Ctrl-C at `globally or locally`. `answer`: `1`, `1`, then wait for `SH> `.
     - Every mode ends with the one-line `\n`-terminated probe from `pty-ctrl-c.exp`, which saves `$?` first and prints `T""TY=…` then `RC=<n>`, followed by `exit\n`.
   - `test/init-pty.test.js`:
     - Skip with a printed reason on `win32` or when `expect` is not on `PATH` (same rule as `test/routing-pty.test.js:33–38`).
     - `withScratch` creates `<root>/{home,cwd}` and seeds `home/.akili-specs-update.json` with `{"checkedAt": Date.now(), "latest": <package.json version>}`. Like `routing-pty.test.js:47–68`, it copies `*.log` to `AKILI_PTY_LOG_DIR` when that is set, and only then removes the root.
     - `runExpect` uses `process.execPath`.
     - Every failure message carries the reason, the `expect` exit status/signal, the `<<…>>` markers and the last 30 ANSI-stripped lines. The tail is emitted through `t.diagnostic` before `assert.fail`, the shape of the flake spec's FR-1.
     - Case **(a)** `q1` and case **(b)** `q2` assert: the newline from FR-1 (after the last question's text, the stripped transcript shows `SH> ` at the start of a line, never on the prompt's own `> ` line); `RC=130`; zero lines matching `^\s+at ` and no `AbortError` in the stripped transcript; none of `.claude`, `.config`, `.gemini`, `.codex`, `.cursor`, `.agents` in `home` or `cwd`.
     - Case **(c)** `answer` asserts: `RC=0`; the seven tool option lines and two scope option lines verbatim as in `bin/akili.js:2049–2073` at `dd23554`; `home/.claude/commands` present; nothing created in `cwd`.
     - All three cases assert `net.log` absent and the seed byte-identical (`Buffer.equals`).
2. **Red.** Run the new file on Node 22.23.3 **and** 22.12.0 (`$(nvm which <v>) --test --test-reporter=tap test/init-pty.test.js`) before touching `bin/`. Quote each `not ok` block in `execution.md`.
3. **Fix (DD-1, DD-2).**
   - Add `questionOrAbort(rl, prompt, out)` just above `makeRoutingIo`. It contains the body of today's `ask` body (`:2321–2344`) minus the interface creation/closing: the `abort()` newline, the `close` listener, the `ABORT_ERR`/`AbortError` mapping, and the listener removal in `finally`.
   - `makeRoutingIo.ask` keeps `createInterface` and its `finally { rl.close() }` and calls the helper with today's prompt string.
   - `runInteractiveInit` passes both of today's prompt strings, unchanged, through the helper with `process.stdout`. It wraps both awaits in one `try`. On `e.code === "AKILI_SELECT_ABORT"` it runs `rl.close()`, sets `process.exitCode = 130` and returns. Anything else is rethrown.
4. **Green.** Rerun the same two commands, then rerun them with the falsifiers below.
5. **Docs (DD-5).**
   - `docs/cli.md` *Init* (after the code block at `:11–15`): "Ctrl-C at either question exits with code 130; nothing is installed."
   - `CHANGELOG.md` `## [Unreleased]`: replace `- No unreleased changes yet.` with a patch entry. It names the old behaviors (Node ≥ 22.23: `AbortError` trace, exit 1; Node ≤ 22.12: silent exit 0), the new one (newline, exit 130, nothing installed), the new test file, and that routing's Ctrl-C is unchanged. Every clause is quote-checked against HEAD before the Reviewer (KZ-002).

**Verification.**

| Field | Value |
|---|---|
| Command | `$(nvm which 22.23.3) --test test/init-pty.test.js` and `$(nvm which 22.12.0) --test test/init-pty.test.js`: 3/3 green each. `npm test` under each of the two versions: all suites green, including `routing-pty.test.js` 6/6 (FR-3), and the TAP lists the three `init-pty` cases (P-9). `npm run verify:cli` · `npm run pack:dry-run` (the tarball gains no `test/` file) · `git diff --check` · `git diff --stat dd23554..HEAD -- package.json` → empty (NFR-3) |
| Red run | **Observed at baseline** (same code as `dd23554`, `expect` repro on a real pty, 2026-10-18). **Node 22.23.3:** Q1 and Q2 → `AbortError: Aborted with Ctrl+C`, 10 `    at …` frames from `[_ttyWrite] (node:internal/readline/interface:1148:37)`, `code: 'ABORT_ERR'`, `RC=1`. **Node 22.12.0:** Q1 and Q2 → no output, `RC=0`. Answered path (`ans2.exp`, Node 22.23.3) → `RC=0`, `home/.claude/{akili,commands,skills}`, `cwd` empty, seed `cmp`-identical, 0 s. So T1's test must show (a) and (b) **red on the RC assertion** on both versions (22.23.3: RC=1 + trace lines; 22.12.0: RC=0), and (c) green on both. A red on any other assertion, or on a `<<TIMEOUT`, is not this red |
| Falsifier | **(1) Catch removed** (post-change: drop `runInteractiveInit`'s `AKILI_SELECT_ABORT` branch): (a)/(b) red on **both** versions with `RC=1` + `Error: question aborted` frames. Baseline analog **observed**: with `makeRoutingIo.ask`'s tagged rejection left unhandled, routing case 4 read `RC=1` with `at abort (bin/akili.js:2328:30)` on 22.12.0 and 22.23.3 (`mut-*.tap`). **(2) Close-race removed** (post-change: drop the `Promise.race` and the `rl.once("close", …)` in `questionOrAbort`): red **on 22.12.0 only**. Init (a)/(b) and routing case 4 read `RC=0`; 22.23.3 stays green because the AbortError mapping covers it. Baseline analog **observed** on `makeRoutingIo.ask`: 22.12.0 → `not ok 4 … the transcript reads RC=0 (expected RC=130)`; 22.23.3 → 6/6 ok (`mut2-*.tap`). This is why the 22.12.0 run is a required gate, not a courtesy. **(3) AbortError mapping removed alone: known-inert, not a gate.** On 22.23.3 the interface emits `close` (`interface:1147`) before the reject (`interface:1148`), so the close-race wins (frame order in `mut-22.23.3.tap`). This matches routing-keyboard-select T5's finding. **(4) Seed removed** (test mutation): `net.log` holds `get` and the NFR-1 assertion goes red. **Observed** at design time (`q.exp` without seed → `get`; with seed → absent). **(6) Newline removed** (post-change: drop the `\n` write in the helper's abort): (a)/(b) red on the newline assertion. Baseline analog **observed**: on Node 22.12.0 (no newline written) the repro transcript reads `> SH> echo RC=$?`, with the shell prompt on the question's own line. On 22.23.3 the trace's own line breaks hide it, so the gate is the 22.12.0 run. **(5) Prompt drift** (post-change: edit `All five` → `All 5` in `bin/akili.js`): case (c) red on its verbatim-option assertion. Run and quoted in `execution.md`, then restored. Each post-change falsifier is applied, observed red, restored, and observed green again |
| Disqualifier | **A wait that times out silently is not a step.** At baseline a scratch fixture waiting on `{> $}` never matched: the prompt ends `>\x1b[0m \x1b[3G`. Each wait burned its full 60 s and then proceeded, so the answered path "passed" in 121 s instead of 0 s. The fixture must use the CSI-tolerant prompt regex and an `expect_after` timeout that exits 2. Any case whose duration nears its `expect` timeout is a fixture fault, not evidence. **A run under the wrong Node is not evidence:** the red/green pair counts only with `process.version` printed via `t.diagnostic` and matching the `nvm which` binary (a global `node` on `PATH` would shadow it). **A red from `<<TIMEOUT>>`, `<<EOF>>` or a missing `RC=` line is not the regression red** (assertion-level rule). **On Ubuntu CI**, an `RC=` that never arrives after `<<BACK-IN ≤10 ms>>` is the open `bugfix/pty-harness-ubuntu-flake` signature and is read from the transcript artifact, never counted for or against this fix (requirements → accepted risk) |
| Consumers | `test/routing-pty.test.js` (cases at `:241`, `:256`, `:271`, `:289`, `:303`; case 4 `pty-fallback.exp dumb` is the typed-question Ctrl-C that FR-3 guards) · `test/routing-io.test.js:53` (no TTY → `ask` never called; must stay green) · `test/routing.test.js:1170`, `:1301` (scripted `io`; unaffected, must stay green) · `docs/cli.md:9–15`, `:77` · `README.md:178–181` (no Ctrl-C claim; unchanged) · `bin/akili.js:253` help text (unchanged) · `CHANGELOG.md`. Sweep: `git grep -n -E "AKILI_SELECT_ABORT\|question aborted\|makeRoutingIo\|questionOrAbort"` after the change → only `bin/akili.js` and this spec folder |

**Done.**
- [ ] (a)/(b) red at baseline on 22.23.3 and 22.12.0 on the RC assertion, quoted. (c) green at baseline.
- [ ] 3/3 green after the fix on both versions, with `process.version` in the TAP diagnostics.
- [ ] Falsifiers (1), (2), (4), (5), (6) observed red and restored green, quoted in `execution.md`. (3) recorded as known-inert.
- [ ] `npm test` green on both versions (routing-pty 6/6). `verify:cli`, `pack:dry-run` and `git diff --check` clean. No `package.json` diff.
- [ ] `docs/cli.md` line and CHANGELOG entry quote-checked.
- [ ] **P-4 left open, not faked:** `execution.md` records that the Node 18 leg runs at the first push, which is Juan Carlos's, and that its result settles P-4. If that leg is red, it is a Pivot, not a follow-up edit.
- [ ] Local commits with the `[SPEC:bugfix/init-ctrlc-abort]` prefix. No push.
