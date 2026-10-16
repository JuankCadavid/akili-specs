# Design: Keyboard multi-select for `akili routing` prompts

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/routing-keyboard-select` |
| Depth | Standard (compact) — re-checked at §11 against this design: 4 tasks, ~430 LOC, 8 review rounds |
| Type | Change |
| Approval Mode | `gated` |
| Status | **Approved** — 2026-10-02 (user, Phase 2 gate: Continue; Review Design not requested — no High-impact `UNVERIFIED` row) |
| Date | 2026-10-02 |
| Source | `requirements.md` (FR-1…FR-6, NFR-1…NFR-5) · `proposal.md` Option A |
| Verified at | `dbdccea` (every `file:line` below) |
| Spike | `scratchpad/spike/spike.js` driven by `drive.exp` / `abort.exp` under `/usr/bin/expect` (2026-10-02): per-question `readline` interfaces + a raw-mode select on Node core — `SEL=[0,4]` from space · ↓×4 · space · Enter; `rawAfterSel false kp 0`; the following typed question echoed (`A2=world`); empty Enter → guidance line; `a` → all checked; Ctrl-C → `exit=130`; the process reached `END` (stdin paused, loop drained). The spike is throwaway evidence for P-4/P-5, not shipped code |
| Active Lessons applied | KZ-changes--leader-brief-contract-2 (every present-tense reading below was run before it was written — the spike and the greps in §11); KZ-changes--model-routing-configurator-1 (the predicate is a closed set — DD-3 enumerates it and §10 budgets the enumeration-wide falsifier); KZ-002 (CHANGELOG clauses quote-checked — T4); KZ-changes--kaizen-loop-closure-2 (the `nothing selected` sweep in §11 P-9 is keyed on the phrase, repo-wide) |

## 2. Executive Summary

Three small, separable pieces. **(1)** A pure keypress state machine in `bin/routing.js` — `keyToken`, `selectStep`, `selectLines` — unit-tested without a terminal, plus a one-line dispatch in `promptMultiSelect`: call `io.select` when the injected `io` has one, else the comma form. **(2)** In `bin/akili.js`, an `io` builder that creates a `readline` interface **per question** (instead of one per run) and attaches `select` only when the four-member capable-terminal predicate holds; `select` owns raw mode for exactly one question, redraws in place, and restores the terminal in `finally`; Ctrl-C rejects with a tagged error that `runRouting` turns into exit 130. **(3)** A pty test (`expect`) that drives the real CLI for the defect classes no unit test can see, skipping with a reason where no `expect` exists. No new file in `bin/`, no dependency, no change to flags, answers, or question order.

## 3. Architecture Overview

```
akili routing (TTY)                                   akili routing (pipe / TERM=dumb / --yes)
  │                                                     │
  ▼                                                     ▼
runRouting ── makeRoutingIo(args) ──► io = { ask, select? }       io = { ask }   (select absent)
  │                 │ predicate (DD-3)                             │
  │                 └─ false → { ask } only                        │
  ▼                                                               ▼
collectAnswers(args, previous, registry, io, { isTTY })   ← unchanged signature, order, count
  │
  ├─ promptMultiSelect ── typeof io.select === "function" ? io.select(title, options, checked)
  │                                                        : askValid(…comma form…)   (DD-1)
  │     └─ orderPicked(picked, checked)  — set-equal → pre-checked order; else list order (DD-2)
  └─ every other question ── io.ask  (unchanged)

io.select (akili.js, DD-4)                           pure (routing.js, DD-1)
  emitKeypressEvents · setRawMode(true) · hide cursor   keyToken(str, key) → token | null
  draw ─ on keypress ─► keyToken ─► selectStep ─► draw   selectStep(state, token) → state'
  done → restore → resolve(checked ascending)           selectLines(title, state) → string[]
  abort → restore → reject(code AKILI_SELECT_ABORT) ─► runRouting: exitCode 130, return
  throw → restore (finally) → propagate as today
```

## 4. Extended Directory Structure

| Path | Change |
|---|---|
| `bin/routing.js` | + `keyToken`, `selectStep`, `selectLines`, `orderPicked` (pure, exported); `promptMultiSelect` dispatch; `parseNumberList` empty-reply text (FR-2) |
| `bin/akili.js` | + `require("readline")` (core — `readline/promises` lacks `emitKeypressEvents`, P-3); `canKeySelect(out)`, `keySelect(out)`, `makeRoutingIo(args)`; `runRouting` uses the builder and catches the abort code |
| `test/routing.test.js` | + reducer/token/order unit tests; + `select`-seam `collectAnswers` deep-equality; `scriptedIo` gains an optional `select` script |
| `test/routing-io.test.js` | + fallback assertions on the existing pipe runs (stderr identical to a frozen baseline; no `setRawMode` call observable — see T2 falsifier) |
| `test/routing-pty.test.js` (new) | `expect`-driven: keyboard happy path, `TERM=dumb`, Ctrl-C + `stty` sanity; skips with a reason when `expect` is absent or `process.platform === "win32"` |
| `test/fixtures/routing/*.exp` (new) | The expect scripts (byte-exact under `.gitattributes`, P-11) |
| `.github/workflows/ci.yml` | + one step, Linux only: `sudo apt-get install -y expect` (P-10) |
| `docs/cli.md` | *Routing* → keys + four-member fallback rule (FR-6) |
| `CHANGELOG.md` | Unreleased entry, patch |
| `AGENTS.md:12` | Append to the `bin/routing.js` bullet: "and the pure keyboard-select reducer" — a one-clause factual sync, since the bullet enumerates the module's contents (`/akili-archive` would otherwise flag it) |

No new module under `bin/`: the reducer is ~40 lines and belongs with the prompt helpers it serves; a `bin/select.js` would add a package-surface bullet and an archive-sync target for no isolation gain.

## 5. Data Model

### 5.1 Select state (pure, in-memory only)

| Field | Type | Meaning |
|---|---|---|
| `options` | `string[]` | Option texts, as `promptMultiSelect` already builds them (`n) text` numbering is applied by `selectLines`) |
| `checked` | `boolean[]` (length = options) | Current marks; seeded from `preChecked` |
| `cursor` | `number` | Current row, `0 ≤ cursor < options.length` |
| `guidance` | `boolean` | Hint line shows the guidance text (set by an empty confirm, cleared by any toggle) |
| `done` | `boolean` | Confirmed with ≥ 1 checked |
| `aborted` | `boolean` | Ctrl-C |

### 5.2 Key tokens (closed set)

| Token | From readline `(str, key)` | Reducer effect |
|---|---|---|
| `up` / `down` | `key.name === "up"` / `"down"` | `cursor ± 1`, wrapping |
| `space` | `key.name === "space"` or `str === " "` | toggle `checked[cursor]`; `guidance = false` |
| `toggle-all` | `str === "a"` (no ctrl/meta) | all true unless all already true → all false; `guidance = false` |
| `confirm` | `key.name === "return"` (also `"enter"`) | ≥ 1 checked → `done`; else `guidance = true` |
| `abort` | `key.ctrl && key.name === "c"` | `aborted` |
| `null` | anything else | no state change, **no redraw** |

### 5.3 `io.select` contract

`select(title: string, options: string[], preChecked: number[]) → Promise<number[]>` — resolves the checked indices **in ascending list order**; never resolves empty; rejects with an `Error` whose `code === "AKILI_SELECT_ABORT"` on Ctrl-C; any other rejection is a bug and propagates. `promptMultiSelect` applies the order rule (DD-2) on top, so a scripted `select` in tests needs no knowledge of it.

### 5.4 Rendered block (`selectLines`)

```
<title>
❯ [x] 1) Claude Code
  [ ] 2) OpenCode
  …
↑/↓ move · space toggles · a toggles all · Enter confirms      ← or the guidance line
```

Exactly `options.length + 2` lines, every redraw. The cursor marker is `❯` (U+276F) — the same glyph the proposal's target rendering shows; the comma form's `  [x] n) text` rows are kept byte-identical so the two forms differ only in the marker column and the hint line.

### 5.5 `nothing selected` text (FR-2, comma form)

`parseNumberList` empty-reply error becomes `nothing selected: type at least one number, e.g. 1,3`; `askValid` still appends ` — try again.`. Both existing consumers of the string are regex matches on `nothing selected` (P-9) and stay green.

## 6. API Design

No HTTP/CLI flag surface changes. CLI-visible deltas:

| Surface | Before (`dbdccea`) | After |
|---|---|---|
| Multi-select prompt on a capable terminal | `Title (comma-separated numbers)` + rows + `> ` | §5.4 block, keys |
| Multi-select prompt elsewhere | as before | **unchanged** (except the empty-reply error text, next row but one — FR-4 as amended 2026-10-16) |
| Empty Enter, keyboard | n/a | guidance line, question stays open |
| Empty Enter, comma, nothing pre-checked | `nothing selected — try again.` | `nothing selected: type at least one number, e.g. 1,3 — try again.` |
| Ctrl-C during a keyboard question | n/a | exit 130, newline, nothing written |
| Ctrl-C during a typed question | exit 0, nothing written (P-5) | **unchanged** |
| `--json` | prompts on stderr | prompts (both forms) on stderr; predicate tests `stderr.isTTY` |

## 7. Backend Module Design

### 7.1 `bin/routing.js` (pure)

| Function | In → Out | FR |
|---|---|---|
| `keyToken(str, key)` | readline keypress args → token from §5.2 or `null` | FR-1 |
| `selectStep(state, token)` | → new state (never mutates the input) | FR-1, FR-2 |
| `selectLines(title, state)` | → `string[]` per §5.4 | FR-1, FR-2 |
| `orderPicked(picked, checked)` | `picked` ascending; `checked` = filtered `preChecked` → same set ⇒ `checked.slice()`, else `picked` | FR-1 *Result order* |
| `promptMultiSelect(io, title, options, preChecked)` | unchanged signature; `checked` filtered as today (`:943`); **if `typeof io.select === "function"`** → `{ picked: orderPicked(await io.select(title, options, checked), checked) }`; else the existing comma body verbatim | FR-3 |
| `parseNumberList` | only the empty-reply error string changes (§5.5) | FR-2 |

Exports gain `keyToken`, `selectStep`, `selectLines`, `orderPicked`. Everything else in the module is untouched; `collectAnswers` is not edited (its two `promptMultiSelect` calls, `:1082` and `:1224`, carry the change).

### 7.2 `bin/akili.js` (I/O)

| Function | Behavior |
|---|---|
| `canKeySelect(out)` | `process.stdin.isTTY === true && typeof process.stdin.setRawMode === "function" && out.isTTY === true && process.env.TERM !== "dumb"` — the four members, evaluated once per run (DD-3) |
| `keySelect(out)` → `select(title, options, preChecked)` | `readline.emitKeypressEvents(process.stdin)` (idempotent, P-4) · remember `isRaw` · `setRawMode(true)` · `stdin.resume()` · hide cursor (`ESC[?25l`) · draw; on each keypress: `keyToken` → `null` ⇒ return; else `selectStep` → redraw (`ESC[<n>A` then per line `ESC[2K` + text) · `done` ⇒ final draw, restore, resolve · `aborted` ⇒ restore, write `\n`, reject with `code = "AKILI_SELECT_ABORT"`. **`restore`** (also in a `finally`/catch around the listener body): remove the listener, `setRawMode(wasRaw)`, `stdin.pause()`, show cursor (`ESC[?25h`) |
| `makeRoutingIo(args)` → `{ ask, select? }` | `out = args.json ? process.stderr : process.stdout`; `ask(question, def)`: create `readline/promises` interface over `(stdin, out)`, `question(def ? "${q} [${def}] " : "${q} ")`, **close in `finally`** — one interface per question (DD-4); `select` attached iff `canKeySelect(out)`. Without a TTY on stdin, `ask` is never reached (`collectAnswers`' guard, `:1198-1209`) — the builder still returns `{ ask }` so the shape is constant |
| `runRouting(args)` | replaces `:2250-2252` and the `finally { rl.close() }` with the builder; adds `catch (e) { if (e && e.code === "AKILI_SELECT_ABORT") { process.exitCode = 130; return; } throw e; }`. The adopt/skip question (`:2266`) keeps using `io.ask` |

### 7.3 Test seams

- `scriptedIo(replies, selects?)` in `test/routing.test.js`: when `selects` is given, `io.select` records `(title, options, preChecked)` and shifts the next array from `selects` (throws past its script, like `ask`); otherwise `io` has no `select` key so every existing test runs the comma form unchanged (P-8).
- The pty test drives `bin/akili.js` through `/usr/bin/expect` with `.exp` fixtures that take the project dir, HOME, and TERM from `argv`/env; it spawns `/bin/sh` and runs the CLI inside it so `$?` and `stty -a` can be read **on the same pty** after the CLI exits (FR-5 scenario).

## 8. Frontend / UX Component Architecture

Terminal only — §5.4 is the whole visual contract. Keys follow the checkbox-prompt convention (`inquirer`/`prompts`): cursor row marker, space toggles, `a` toggles all, Enter confirms. No colour is added (the existing `colors` palette is not used inside the block, so the pty assertions can match plain text).

## 9. Shared Contracts or Package Extensions

| Contract | Change | Consumers walked |
|---|---|---|
| `io` seam | **extended** by an optional `select`; `ask` unchanged | `bin/akili.js:2252` (builder replaces it), `:2266` (adopt/skip — `ask`, unchanged); `test/routing.test.js` `scriptedIo` (`ask` only → comma path, P-8) |
| `promptMultiSelect` return | unchanged `{ picked } \| { error }`; order rule now explicit (DD-2) | `:1082`, `:1224` |
| `parseNumberList` empty error | text changed | `test/routing.test.js:961` (regex, green); `promptOne`→`parseOneNumber`→`parseNumberList` (`:931-933`): a single-choice empty reply now shows the new text too — acceptable and consistent (the hint "type at least one number" is true there as well), recorded so the Reviewer does not read it as drift |
| `routing.js` exports | + 4 pure functions | `bin/akili.js` (new consumer); tests |
| Package `files` | none — `bin` is already shipped; tests are not | — |
| Node engines | none — every API exists in Node 18 (NFR-5) | CI Node 18 jobs |

## 10. Design Decisions

### DD-1 — Pure reducer in `routing.js`, plumbing in `akili.js`
The keypress logic (cursor, toggle, toggle-all, guidance, result) is a pure `(state, token) → state` function with a pure renderer, so every FR-1/FR-2 rule is unit-tested in `node:test` without a terminal; `akili.js` (not `require`-able — it runs `main()` on load) holds only `emitKeypressEvents`/`setRawMode`/write/restore. **Rejected:** reducer inside `akili.js` (untestable except by pty — the predecessor's DD-14 lesson); a new `bin/select.js` (adds a package-surface bullet and an archive-sync target for ~40 lines).

### DD-2 — Order rule lives in `promptMultiSelect`, not in `io.select`
`io.select` resolves ascending indices — the simplest contract for both the real implementation and a scripted test double. `orderPicked` then keeps the pre-checked order when the set is unchanged, because `canonicalAnswers` keeps array order (P-6): without this, an Enter on a pre-filled host list entered as `5,1` earlier would flip `hosts` to `[claude, cursor]` and a no-change re-run would print `replaced`, breaking the predecessor's idempotence (FR-6 there). **Rejected:** always ascending (breaks idempotence); always pre-checked-first (invents an order the comma form never produced).

### DD-3 — Four-member predicate, evaluated once, closed set
stdin TTY · `setRawMode` present · **output stream** TTY · `TERM !== "dumb"`. The output member is the one addition over the proposal: the block redraws with cursor-up/clear-line, and a redraw written into `| tee` or `2>file` under `--json` corrupts the capture. The set is closed and enumerated so the task falsifier can run the mutation on **every** member (KZ-changes--model-routing-configurator-1). **Rejected:** `CI` env or `NO_COLOR` as members (neither says anything about raw mode); probing by attempting `setRawMode` in a try/catch (a probe that succeeds leaves the terminal raw before the first question is even reached).

### DD-4 — One `readline` interface per question; raw mode held per question
A `readline` interface on a TTY already owns raw mode and keypress events for its lifetime, so a single run-long interface and a hand-rolled select would both read the same keys (P-4). Creating the interface inside `ask` and closing it in `finally` means each question — typed or keyboard — owns the terminal alone for its duration, and the terminal is restored at every question boundary, not only at the end of the run. The spike shows the two alternate cleanly and the process exits (stdin paused). **Rejected:** `rl.pause()` around the select (readline's keypress listener stays attached; its `_ttyWrite` would echo and interpret the keys); removing and re-adding readline's listeners (private API).

### DD-5 — Ctrl-C is a tagged rejection, not `process.exit` inside the prompt
`select` restores the terminal, writes `\n`, and rejects with `code = "AKILI_SELECT_ABORT"`; `collectAnswers` has no try/catch in its body (P-7) so the rejection reaches `runRouting`, which sets `process.exitCode = 130` and returns — nothing is written because the plan is built only after `collectAnswers` resolves. The typed path's Ctrl-C (exit 0, P-5) is left alone: changing it is outside the approved delta, and the byte-identical fallback rule forbids it. **Rejected:** `process.exit(130)` inside the keypress handler (skips `runRouting`'s `finally`, and a future caller of `select` could not intercept it).

### DD-6 — pty gate through `expect`, in `npm test`, skip-with-reason elsewhere
Terminal restore, real key bytes, `TERM=dumb`, and output-not-a-TTY have no unit gate (requirements §8). `expect` exists on macOS and on this machine, is one `apt-get` away on Linux, and is the tool the predecessor's T8 evidence already used; the test spawns a shell so `$?` and `stty -a` are read on the same pty. On Windows, or when `expect` is absent, the test calls `t.skip(reason)` so the skip is visible in the run, never silent. **Rejected:** `script -q` (BSD/util-linux flag incompatibility, no scripted waiting); `node-pty` (dependency — NFR-1, and a devDependency with native build on three OSes); manual evidence only (the predecessor did this and the keyboard path's defects are exactly the kind that regress silently).

### DD-7 — `a` toggles all; single-choice prompts stay typed
Three reducer lines buy the convention users expect; it costs one hint-line token. Single-choice prompts (`promptOne`, `promptTierAdjust`, `[A]/[t]/[q]`, `[Y/n]`) keep `io.ask`: their re-ask-with-reason loops (`adjustRejection`, `:988-1001`) prepend a reason to the question text, which has no slot in a cursor list, and the proposal left them out. Recorded as a possible follow-up, not a task.

### Reversion challenge (Step 2.3)
**None triggered** — no DD removes, disables, or inverts delivered behavior: the comma form, its retry, the question order, the answers file, and the typed path's Ctrl-C all stand; the run-long `readline` interface becomes per-question interfaces (a restructure whose observable prompt text is unchanged, verified by the spike's echoed typed questions), and the `nothing selected` text gains words without losing its matched phrase.

## 11. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Measure | Expected | Basis |
|---|---|---|
| Tasks | **4** | T1 `routing.js` (tdd) · T2 `akili.js` + fallback tests · T3 pty test + CI step · T4 docs + CHANGELOG + `AGENTS.md:12` clause |
| LOC | **~430** | `routing.js` ~70 · `akili.js` ~70 · unit tests ~110 · `routing-io` ~25 · pty test + `.exp` ~120 · `ci.yml` 4 · docs ~30 |
| Review rounds | **8** | code tasks 3 × 2 (the pty task is timing-sensitive; the `akili.js` task touches terminal state) · docs 1 · margin 1 |

Depth check: the proposal guessed Lite; four tasks and a pty harness are Standard-sized, not Lite — the Phase 1 re-base holds. Not Full: no data, API, auth, or migration surface. `/akili-execute` stops and escalates past 4 tasks, ~520 LOC (+20 %), or 8 rounds.

## 12. Premise Ledger

**Count:** 15 rows — 14 verified, 1 `UNVERIFIED` (0 High, 1 Low).
**Blast-radius triggers:** `live-path` fires (user action `akili routing` → the two multi-select questions); `shared-state` fires (`process.stdin` raw-mode/keypress state is shared by the `readline` interface and the new select); `consumer` fires (the `io` seam gains a method; `routing.js` gains exports; the `nothing selected` string changes).

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | `promptMultiSelect` is the only multi-select helper and has exactly two callers | `location` | `grep -n "promptMultiSelect(" bin/routing.js` → `942` (def), `1082` (roster, in `promptRoster`), `1224` (hosts) | `dbdccea` | a third caller would need the dispatch too — Low | — |
| P-2 | `io` is built once at `bin/akili.js:2252` with `ask` only; `io.ask` has one other call site (adopt/skip) | `consumer` | `grep -n "io\.\|const io" bin/akili.js` → `2252`, `2266` | `dbdccea` | the builder must cover another site — Low | — |
| P-3 | `readline/promises` exports no `emitKeypressEvents`; core `readline` does; a piped stdin has no `setRawMode` | `data-env` | `node -p "[typeof require('readline').emitKeypressEvents, typeof require('readline/promises').emitKeypressEvents]"` → `['function','undefined']` · `node -p "typeof process.stdin.setRawMode" < /dev/null` → `undefined` (Node v22.12.0) | `dbdccea` | DD-3 member 2 is vacuous / the extra `require` is unneeded — Low | — |
| P-4 | A `readline` interface over a TTY owns raw mode and keypress listeners for its lifetime; creating one per question and closing it leaves `isRaw false`, 0 keypress listeners; a raw-mode select between two interfaces receives arrow/space/Enter and the next typed question echoes; `stdin.pause()` after the select lets the process exit | `shared-state` | spike `scratchpad/spike/spike.js` + `drive.exp` → `rawAfterAsk false kp 0` · `SEL=[0,4] rawAfterSel false kp 0` · `A2=world` · `SEL2=[0,1]` · `END` · `exit=0`. Siblings sharing the state: `readline/promises` `createInterface`/`close` (`bin/akili.js:2251`, `:2275`) and the new `keySelect` | `dbdccea` | DD-4 falls — a run-long interface must be paused/suspended instead — **High** (overturns DD-4) — but verified | — |
| P-5 | Ctrl-C during a typed question today exits 0 and writes nothing | `data-env` | expect probe `scratchpad/ctrlc/probe.exp`: `send "\003"` at the host prompt → `<<exit=0>>`; `git status --short` in the scratch project → empty | `dbdccea` | DD-5's "unchanged" cell would restate a different baseline — Low | — |
| P-6 | `canonicalAnswers` sorts object keys and drops `updatedAt` only; array order is identity | `data-env` | `bin/routing.js:281-284` (`sortKeys(rest)`, no array sort) · `:764-766` `updatedAt` moves only when the canonical form moved | `dbdccea` | DD-2's order rule is unnecessary — Low | — |
| P-7 | `collectAnswers` has no `try`/`catch` of its own — a rejection from any prompt propagates to `runRouting` | `location` | `sed -n '1186,1398p' bin/routing.js \| grep -c 'try {\|catch ('` → `0` | `dbdccea` | DD-5's abort would be swallowed — High | — |
| P-8 | The test double `scriptedIo` builds `io` with `ask` only, so `typeof io.select` is `undefined` for every existing test | `consumer` | `test/routing.test.js:896-908` (`ask:` at `:901`; no `select`) | `dbdccea` | existing tests would hit the select branch — Low | — |
| P-9 | The string `nothing selected` has exactly two code/test consumers, both tolerant of the new wording (one producer, one regex) | `consumer` | `grep -rn "nothing selected" --include="*.js" --include="*.md" --include="*.json" . \| grep -v node_modules \| grep -v docs/specs/archive` → `bin/routing.js:921` (producer), `test/routing.test.js:961` (`/nothing selected/`), plus this spec's `proposal.md`/`requirements.md` prose | `dbdccea` | an exact-match assertion breaks — Low | — |
| P-10 | `expect` is present on `macos-latest` runners and on this machine; **`ubuntu-latest` runners need `apt-get install expect`**; `windows-latest` has none | `data-env` | `which expect` → `/usr/bin/expect` (this machine); `.github/workflows/ci.yml:20` matrix; ubuntu/windows availability: `UNVERIFIED — confirm at source before relying on it` | — | the Linux install step is redundant (harmless) or Windows unexpectedly has one (the skip predicate uses `which`/`where`, so it would run) — Low | T3's first CI run (the step's log and the test's skip/ran line) |
| P-11 | `test/fixtures/**` is byte-exact on every checkout | `data-env` | `.gitattributes` → `test/fixtures/** -text` | `dbdccea` | `.exp` fixtures could arrive CRLF on Windows — Low (the pty test skips there anyway) | — |
| P-12 | `fail()` prints `ERROR: …` and exits 1; the non-TTY usage error flows through it | `location` | `bin/akili.js:278-281` · `:2255` `if (collected.error) fail(collected.error)` | `dbdccea` | fallback stderr baseline differs — Low | — |
| P-13 | The only documentation sentence describing the multi-select interaction is `docs/cli.md:339` ("Previous answers … pre-fill the prompt (Enter keeps them)"); no doc states "comma-separated numbers" | `existence` | `grep -rn "comma-separated numbers\|Enter keeps\|numbered style\|type the numbers" docs/cli.md README.md docs/commands/ .claude/commands/ docs/model-routing.md docs/flow.md` → `docs/cli.md:339` only | `dbdccea` | FR-6 needs another doc site — Low | — |
| P-14 | Standing rule: the package has no runtime dependencies and must not gain one (predecessor NFR-1; `AGENTS.md` keeps the installer model-agnostic) | `other` | `grep -n '"dependencies"' package.json` → 0 hits; `package.json:49-50` `engines.node >= 18.0.0` | `dbdccea` | DD-6's `node-pty` rejection could be revisited — Low | — |
| P-15 | Live path: `akili routing` → `main` `switch` `case "routing"` → `runRouting` → `collectAnswers` → `promptMultiSelect` (hosts, then per host roster) → `askValid` → `io.ask` | `live-path` | `bin/akili.js:2319-2320` → `:2243` → `:2254` → `bin/routing.js:1224` / `:1082` → `:948` → `:908-911` → `:902`; branch points: `a.hosts !== undefined` (`:1214`, flag skips the host question), `usePrev && prevRoster(h) !== undefined` (`:1270`, previous file skips a roster question), `!isTTY` (`:1198`, usage error before any prompt) | `dbdccea` | the dispatch would sit on a path the user does not reach — High — but verified | — |
