# Requirements: Keyboard multi-select for `akili routing` prompts

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/routing-keyboard-select` |
| Depth | **Standard (compact)** — the proposal estimated Lite; re-based at Phase 1 because the change spans two modules (`bin/routing.js` seam + reducer, `bin/akili.js` raw-mode plumbing), three test files, CI, and docs, and its dominant defect class (a terminal left in raw mode, keys not recognised) has no unit-test gate — it needs a pseudo-TTY. Re-checked against the design at Step 2.4 |
| Type | Change |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Status | **Approved** — 2026-10-02 (user, Phase 1 gate: Continue); two line citations corrected during Phase 2 exploration (`:1082`, `:1224`, `:1337`) |
| Date | 2026-10-02 |
| Source | `proposal.md` (approved 2026-10-02, Option A). Two open questions resolved here: `a` (toggle all) **is included** (FR-1 — three lines of reducer, the convention users expect from checkbox prompts); single-choice prompts **stay typed** (§4 *Out of scope* — their re-ask-with-reason loops do not fit a list cursor and the proposal's ≤ 8-prompt count is unaffected either way). Release class: **patch** |
| Format precedent | `docs/specs/archive/2026-10-02-changes--model-routing-configurator/requirements.md` — this repo has no `docs/specs/general-setup/` (it packages the methodology rather than consuming it) |
| Verified at | `dbdccea` (every `file:line` below) |
| Deviations from proposal | None at Phase 1. One addition the proposal did not name: the fallback predicate also requires the **output** stream to be a TTY (§6 FR-4) — the keyboard path redraws with cursor moves, which must never land in a pipe (`akili routing \| tee`) |

## 2. Executive Summary

On a real terminal, the two multi-select questions of `akili routing` — *Which hosts do you use?* and, per host, *which models do you have?* — become a cursor list: ↑/↓ move, space toggles `[x]`, `a` toggles all, Enter confirms, Ctrl-C aborts without writing. Confirming with nothing marked shows one guidance line instead of today's `nothing selected — try again.` retry. Everywhere the terminal cannot do this — piped stdin or stdout, `TERM=dumb`, a stdin without raw mode, `--yes`/flags — the command behaves **byte-for-byte as today**: the comma form, the same questions, the same answers object, the same files. No runtime dependency is added; the non-interactive contract `/akili-constitution` Step 8C relies on is untouched.

## 3. Glossary

| Term | Meaning |
|---|---|
| **Comma form** | Today's multi-select input: `comma-separated numbers`, parsed by `parseNumberList` (`bin/routing.js:919-929`) |
| **Keyboard path** | The new cursor-list interaction (FR-1), reached only when the **capable-terminal predicate** holds |
| **Capable-terminal predicate** | All four: stdin is a TTY · `process.stdin.setRawMode` is a function · the prompt output stream is a TTY · `TERM` is not `dumb` (FR-4) |
| **`io` seam** | The injected object `collectAnswers` asks through — today only `io.ask(question, default) → Promise<string>` (`bin/routing.js:901-903`, built at `bin/akili.js:2252`); this spec adds `io.select` |
| **Pre-checked** | Options marked `[x]` before the user acts — previous answers (`.agents/model-routing.json`) or flag-derived defaults, exactly as today (`promptMultiSelect`, `:943`) |
| **Guidance line** | `mark at least one option — space toggles, Enter confirms` |
| **Raw mode** | `process.stdin.setRawMode(true)`: keypresses arrive one at a time, unechoed, until `setRawMode(false)` |
| **NFR-1 / NFR-2 (predecessor)** | `changes/model-routing-configurator`: no runtime dependency · a run without a TTY never hangs and exits non-zero with the usage error |

## 4. System Context & Scope

| Surface | Files and current behavior (cited at `dbdccea`) |
|---|---|
| Multi-select prompt | `bin/routing.js:942-950` `promptMultiSelect(io, title, options, preChecked)`: hint `comma-separated numbers[; Enter keeps [x]]`, lines `  [x] n) text`, default = pre-checked numbers joined by `,`; empty reply with pre-checked → keeps them **in pre-checked order** (`checked.slice()`, `:948`); otherwise `parseNumberList` → typed order, duplicates dropped (`:926`) |
| Empty confirm today | `parseNumberList` returns `{ error: "nothing selected" }` (`:921`); `askValid` re-asks once as `nothing selected — try again.` + the question (`:908-916`), a second empty reply → `{ error }` → `fail` (`bin/akili.js:2255`) |
| Callers of the multi-select | Two (`grep -n "promptMultiSelect(" bin/routing.js` → `942` definition, `1082`, `1224`): hosts (`bin/routing.js:1224`, pre-checked = previous hosts) and roster per host (`:1082`, inside `promptRoster`; pre-checked = previous entries). Single-choice prompts (`promptOne` `:953`, `promptTierAdjust` `:970`, the `[A]/[t]/[q]` confirm `:1352`, `[Y/n]` wrappers `:1337`) are typed and **out of scope** |
| Terminal construction | `bin/akili.js:2250-2252`: `isTTY = process.stdin.isTTY === true`; `rl = readline.createInterface({ input: process.stdin, output: args.json ? process.stderr : process.stdout })` once per run; `io = { ask }` over `rl.question`; `rl.close()` in `finally` (`:2275`). `readline` is loaded as `require("readline/promises")` (`:1840`), which exports no `emitKeypressEvents` (`node -p "typeof require('readline/promises').emitKeypressEvents"` → `undefined`; core `readline` → `function`, Node v22.12.0) |
| Raw mode today | None: `grep -rn "setRawMode\|emitKeypressEvents" bin/ scripts/ test/` → 0 hits. A piped stdin has no `setRawMode` (`node -p "typeof process.stdin.setRawMode" < /dev/null` → `undefined`) |
| Ctrl-C today | Probe (expect pty, scratch project, `send "\003"` at the host prompt, 2026-10-02): the process exits **0**, nothing written (`git status --short` empty) — readline closes and the pending `rl.question` promise drains. Not an error path; recorded because FR-5 gives the keyboard path exit 130 |
| Non-TTY guard | `bin/routing.js:1198-1210`: without a TTY `collectAnswers` returns the usage error before any `io.ask`; `test/routing-io.test.js` drives the CLI with `input: ""` (a pipe) and a 10 s timeout |
| Answers identity | `canonicalAnswers` (`bin/routing.js:281-284`) sorts object keys and drops `updatedAt` only — **array order (hosts, roster entries) is part of the identity**, so a re-run that changes nothing must return the pre-checked order unchanged to stay `unchanged` |
| Tests | `test/routing.test.js` (1285 lines; `scriptedIo(replies)` `:896-908` records every `ask` and throws past its script; `promptMultiSelect` cases `:942-962`; `collectAnswers` FR-1/FR-2 cases `:966-1115`) · `test/routing-io.test.js` (278 lines, subprocess, pipe stdin) · `.gitattributes` keeps `test/fixtures/**` byte-exact |
| CI | `.github/workflows/ci.yml`: matrix `ubuntu-latest, macos-latest, windows-latest` × Node `18, 22`; `npm test` step; no `expect`/pty step. `/usr/bin/expect` exists on macOS runners and this machine; ubuntu runners need `apt-get install expect` (UNVERIFIED — confirm at source before relying on it; settled by T3's CI run) |
| Package | `package.json`: no `dependencies` key (`grep -n '"dependencies"' package.json` → 0 hits); `engines.node >= 18.0.0`; `files` includes `bin` |
| Docs | `docs/cli.md:315-455` *Routing* (`### Question order` `:335`; "Previous answers … pre-fill the prompt (Enter keeps them)"); `CHANGELOG.md` Unreleased = "No unreleased changes yet."; `README.md:439` names the command only |
| Out of scope | Single-choice prompts; any runtime dependency; the answers file, question order/count, flags, `--json`, anything Step 8C runs; a full-screen TUI, mouse, colours, search; Ctrl-C on the **comma** path (stays exit 0 — unchanged by the fallback rule); Windows keyboard-path verification (fallback must hold there; keyboard path recorded `not exercised` on Windows) |

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| Developer running `akili routing` in a terminal | Select with arrows and space; never trapped by an empty Enter; same files written |
| Developer in a dumb/piped terminal or CI | Nothing changes — comma form, same prompts, same exit codes |
| The agent running `/akili-constitution` Step 8C | Nothing changes — `--hosts/--models … --yes --json` never reaches a prompt |
| Methodology maintainer | Zero dependencies kept; the prompt logic stays unit-testable through the seam; the terminal plumbing has a real pty gate in CI |

## 6. Functional Requirements

### FR-1: Keyboard multi-select on a capable terminal

When the capable-terminal predicate (FR-4) holds, each multi-select question SHALL render as a cursor list and accept keys instead of a typed line.

| Element | Contract |
|---|---|
| Rendering | Title line (the same title text as today), then one line per option `❯ [x] n) text` / `  [ ] n) text` (cursor marker on the current row; `[x]` on checked rows; the same `n) text` as the comma form), then one hint line: `↑/↓ move · space toggles · a toggles all · Enter confirms` |
| Start state | Cursor on the first option; pre-checked options already `[x]` |
| `↑` / `↓` | Move the cursor one row; wraps at both ends |
| space | Toggles the current row |
| `a` | Toggles all: if every option is checked → all unchecked, else → all checked |
| Enter | Confirms when ≥ 1 option is checked (FR-2 otherwise) |
| Ctrl-C | Aborts (FR-5) |
| Any other key | Ignored — no redraw, no echo |
| Redraw | In place: the list and hint lines are rewritten, never appended below, so one question occupies one block of the scrollback; the final state stays visible after confirm, followed by one newline |
| Result order | The confirmed indices in **list order** — except when the confirmed set equals the pre-checked set, in which case the **pre-checked order** is returned (so an unchanged re-run stays `unchanged` — §4 *Answers identity*) |

#### Scenario: Hosts 1 and 5 by keyboard

- GIVEN a capable terminal, a project with no `.agents/model-routing.json`
- WHEN the host question renders and the user presses space, ↓ ↓ ↓ ↓, space, Enter
- THEN the list shows `[x] 1) Claude Code` and `[x] 5) Cursor`, the question block stays in the scrollback, and the wizard continues with Claude Code's model question
- AND the resulting answers equal those of a comma-form run that typed `1,5`
- BUT it must NOT echo the pressed keys or append a second copy of the list
- AND IT MUST accept the keys without any prior typed input (no `>` line is shown on the keyboard path)

#### Scenario: Pre-checked kept by Enter

- GIVEN a previous answers file with hosts `[cursor, claude]` (entered as `5,1` on an earlier comma run)
- WHEN the host question renders with `[x]` on rows 1 and 5 and the user presses Enter
- THEN the confirmed hosts are `[cursor, claude]` — the pre-checked order — and the re-run ends `unchanged`
- AND IT MUST return list order (`[claude, cursor]`) only when the set actually changed

#### Scenario: `a` toggles all, wrap at the ends

- GIVEN the host question with nothing checked
- WHEN the user presses `a`
- THEN all five rows are `[x]`
- AND WHEN the user presses `a` again THEN all five are `[ ]`
- AND WHEN the cursor is on row 1 and the user presses ↑ THEN the cursor is on row 5

### FR-2: Empty confirm shows guidance

#### Scenario: Keyboard path

- GIVEN the keyboard path with nothing checked
- WHEN the user presses Enter
- THEN the hint line is replaced by the guidance line `mark at least one option — space toggles, Enter confirms` and the question stays open
- AND the guidance line is replaced by the normal hint on the next toggle
- BUT it must NOT count as a retry, error, or exit — the keyboard path has no attempt ceiling

#### Scenario: Comma form (fallback) gains the same guidance

- GIVEN the comma form (predicate false)
- WHEN the user presses Enter with nothing pre-checked
- THEN the re-ask's first line reads `nothing selected: type at least one number, e.g. 1,3 — try again.` (the parse error gains the guidance; `askValid`'s `— try again.` suffix and the one-retry-then-error behavior are unchanged, `bin/routing.js:908-916`)
- AND IT MUST keep the existing test `assert.match(error, /nothing selected/)` green (`test/routing.test.js:961`)

### FR-3: `io.select` seam — identical answers through either seam

`collectAnswers` SHALL accept an `io` that MAY carry a second method `select(title, options, preChecked) → Promise<number[]>` beside `ask`. `promptMultiSelect` SHALL call `io.select` when it is a function, else the comma form. The seam MUST NOT change the question order, the question count, or the shape of the answers object.

#### Scenario: Deep equality through the two seams

- GIVEN `collectAnswers` run once with a scripted `ask`-only `io` (replies `1,4`, `1,2,3`, `1,2,3,4`, then Enter ×4 — the existing FR-1 test shape, `test/routing.test.js:967`) and once with a scripted `io` whose `select` resolves `[0,3]`, `[0,1,2]`, `[0,1,2,3]` and whose `ask` answers the remaining four questions with Enter
- WHEN both complete
- THEN `canonicalAnswers(a) === canonicalAnswers(b)`, `select` was called exactly 3 times with the same titles and option lists the comma form would have printed, and `ask` was never called for a multi-select question on the `select` run
- BUT it must NOT call `io.select` for any single-choice or free-text question — those keep `io.ask`
- AND IT MUST pass `preChecked` to `select` filtered exactly as today (`Number.isInteger(i) && 0 ≤ i < options.length`, `:943`)

### FR-4: Capable-terminal predicate and byte-identical fallback

`bin/akili.js` SHALL attach `io.select` only when **all four** hold: `process.stdin.isTTY === true` · `typeof process.stdin.setRawMode === "function"` · the prompt output stream (`process.stderr` under `--json`, else `process.stdout`) has `isTTY === true` · `process.env.TERM !== "dumb"`. When any member fails, the run SHALL be byte-identical to `dbdccea`: same prompts, same hints, same exit codes.

| Member false | Observable |
|---|---|
| stdin not a TTY (pipe, `</dev/null`) | Unchanged: usage error, exit 1, < 2 s, no prompt (NFR-2) |
| stdin TTY without `setRawMode` | Comma form |
| output stream not a TTY (`akili routing \| tee`, `--json 2>file`) | Comma form |
| `TERM=dumb` | Comma form |

#### Scenario: Piped stdin keeps NFR-2

- GIVEN `printf '' \| akili routing` in a project without answers
- WHEN the process runs
- THEN it exits 1 within 2 s with `stdin is not a TTY and answers are still missing: … ${USAGE_FORM}` and `setRawMode` is never called
- AND IT MUST produce the same stderr text as `dbdccea` (ANSI stripped)

#### Scenario: `TERM=dumb` on a pty

- GIVEN a pty with `TERM=dumb`
- WHEN the host question renders
- THEN it shows `Which hosts do you use? (comma-separated numbers)` with the `> ` line, and `1,5⏎` is accepted
- BUT it must NOT show the `❯` cursor or the keyboard hint line

### FR-5: Terminal restored on every exit of a question

The keyboard path SHALL hold raw mode only for the duration of one question and SHALL restore the terminal — `setRawMode(false)`, keypress listener removed, cursor visible, stdin paused as it was — on confirm, on Ctrl-C, and on any thrown error (the error then propagates as today).

#### Scenario: Ctrl-C aborts without writing

- GIVEN the keyboard path at the host question
- WHEN the user presses Ctrl-C
- THEN the process exits **130** with a trailing newline, no file under the project is created or modified, and the parent shell's terminal is sane (echo on, cursor visible — the next `stty -a` on the pty reports `echo`, not `-echo`)
- BUT it must NOT print a stack trace
- AND IT MUST leave the comma path's Ctrl-C behavior as it is today (exit 0, nothing written — §4)

#### Scenario: Questions alternate between seams

- GIVEN the keyboard path
- WHEN the host question (select) is followed by a model question (select), then the CLI-invocation question (typed `ask`)
- THEN the typed question echoes normally and accepts a line — raw mode from the previous select is off before `ask` begins

### FR-6: Documentation

- `docs/cli.md` → *Routing* SHALL document the keys (↑/↓, space, `a`, Enter, Ctrl-C) and the fallback rule as a closed list of the four predicate members, next to the existing "Previous answers … pre-fill the prompt (Enter keeps them)" sentence.
- `CHANGELOG.md` → Unreleased SHALL gain one entry (release class patch) whose every clause is quote-checked against the shipped text (Active Lesson KZ-002).

## 7. Non-Functional Requirements

| ID | Requirement | Gate |
|---|---|---|
| NFR-1 | No runtime dependency: `package.json` still has no `dependencies` key; only `readline`, `tty`, `process` core APIs are used | `node -e "const p=require('./package.json'); if (p.dependencies) process.exit(1)"` + `grep -n "require(" bin/akili.js bin/routing.js` lists only core modules and `./routing.js` |
| NFR-2 | Non-TTY budget unchanged: piped run exits 1 in < 2 s (predecessor NFR-2) | `test/routing-io.test.js` existing timing assertion stays |
| NFR-3 | Cross-platform: the fallback holds on all three CI OSes; the keyboard path is verified on macOS and Linux ptys; Windows keyboard path recorded `not exercised` | CI matrix green on six jobs; the pty test skips with a printed reason where no `expect` exists |
| NFR-4 | Testability: the keypress state machine (cursor, toggle, toggle-all, empty-confirm guard, result order) is a pure function unit-tested without a terminal; only the raw-mode plumbing needs the pty | `npm test` covers the reducer; the pty test covers the plumbing |
| NFR-5 | Node 18 compatibility: every API used exists in Node 18 (`readline.emitKeypressEvents`, `tty.ReadStream#setRawMode`, `process.exitCode`) | CI Node 18 jobs |

## 8. Defect Classes and Their Gates

| Defect class this spec can produce | Gate that catches it |
|---|---|
| Reducer logic wrong (cursor wrap, toggle, `a`, empty-confirm guard, result order) | Unit tests on the pure reducer (`test/routing.test.js`), with the named falsifiers executed |
| Seam dispatch wrong (`select` not used, `ask` called for a multi-select, answers differ between seams, pre-checked order lost) | `collectAnswers` deep-equality test through scripted `select`+`ask` |
| Fallback predicate wrong on the **non-TTY** member | `test/routing-io.test.js` subprocess (pipe stdin): usage error, exit 1, no `setRawMode` |
| Fallback predicate wrong on the **`TERM=dumb`** / output-not-a-TTY members | pty test (`expect`): `TERM=dumb` → comma prompt text; output piped → comma prompt text. **No unit gate exists** — a pty is required; the test skips with a reason where `expect` is absent (Windows) |
| Terminal left in raw mode / cursor hidden after confirm, Ctrl-C, or error | pty test: after Ctrl-C the child's exit is 130 and `stty -a` on the same pty reports `echo`; after a full run the next typed prompt echoes. **No unit gate exists** — pty only |
| Keys not recognised by the real terminal (arrow escape sequences, Enter as `\r`) | pty test sends the raw byte sequences `\x1b[B`, ` `, `\r` and asserts the rendered `[x]` rows and the written `.agents/model-routing.json` |
| Windows keyboard path | **Accepted risk**: not exercised (no pty on the Windows runner); the predicate falls back when `setRawMode` is absent, and the fallback is CI-gated there |
| Docs claims drift from shipped text (KZ-002) | Reviewer quote-check of each `docs/cli.md` and `CHANGELOG.md` clause at HEAD |
| `emitKeypressEvents` taken from the wrong module (`readline/promises` has none → `TypeError` at the first keyboard question) | pty test reaches the first rendered list; plus `node --check` does not catch it — the pty test is the gate |

## 9. Requirement ID Index

| ID | Name | Proposal delta |
|---|---|---|
| FR-1 | Keyboard multi-select on a capable terminal | ADDED |
| FR-2 | Empty confirm shows guidance (both paths) | ADDED + MODIFIED (`nothing selected` wording) |
| FR-3 | `io.select` seam — identical answers | ADDED (modifies predecessor FR-1's interaction clause; extends DD-14) |
| FR-4 | Capable-terminal predicate and byte-identical fallback | ADDED |
| FR-5 | Terminal restored on every exit; Ctrl-C exit 130 | ADDED |
| FR-6 | Documentation (`docs/cli.md`, `CHANGELOG.md`) | ADDED |
| NFR-1…5 | No dependency · non-TTY budget · cross-platform · testability · Node 18 | NFR-1/NFR-2 inherited unchanged |
