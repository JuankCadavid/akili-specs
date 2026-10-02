# Proposal: Keyboard multi-select for `akili routing` prompts

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/routing-keyboard-select` |
| Slug | `routing-keyboard-select` — derived from a free-text argument (user feedback with a screenshot, right after the v2.32.0 release) |
| Type | **Change** |
| Approval Mode | `gated` |
| Status | **Approved** — 2026-10-02 (user, via the propose gate); next `/akili-specify changes/routing-keyboard-select` |
| Date | 2026-10-02 |
| Depends on | none (builds on the archived `changes/model-routing-configurator`, shipped in v2.32.0) |
| Parallel-safe | yes — touches only `bin/routing.js`'s prompt helpers, `bin/akili.js`'s `io` construction, and their tests |
| Release class (estimate) | **patch** (UX of an existing command; no new command, flag, or install target) — confirm at release |

## 2. Intent

Let a user answer `akili routing`'s multi-select questions (hosts; models per host) by **moving with ↑/↓, toggling with space, and confirming with Enter**, the way modern CLI prompts do — without adding a runtime dependency and without changing what the command writes.

## 3. Problem / Current Behavior

- The two multi-select questions accept only **comma-separated numbers**: `promptMultiSelect` builds the hint `comma-separated numbers; Enter keeps [x]` and parses the reply with `parseNumberList` (`bin/routing.js:942-948`, as read 2026-10-02).
- A bare **Enter with nothing pre-checked** returns `{ error: "nothing selected" }` (`bin/routing.js:921`), which `askValid` re-asks once with the reason as the first line (`:906-908`) and then hard-errors — the user's screenshot shows exactly that first retry: `nothing selected — try again.` above the host list.
- The wizard's only terminal seam is `io.ask(question, default) -> Promise<string>` (`bin/routing.js:894-902`); `bin/akili.js` builds it over `readline/promises` only when `process.stdin.isTTY === true` (`bin/akili.js:2250-2251`). There is no keypress or raw-mode handling anywhere in `bin/` or `scripts/` (`grep -rn "setRawMode\|emitKeypressEvents" bin/ scripts/` → none).
- The package declares no `dependencies` and `engines.node >= 18` (`package.json`, as read).
- This interaction was a **deliberate choice** of the shipped spec: FR-1 of `changes/model-routing-configurator` fixed "comma-separated numbers (`1,3,5`) — `akili init`'s numbered style … extended to comma lists; no runtime dependency is added" (`docs/specs/archive/2026-10-02-changes--model-routing-configurator/requirements.md:72`). The choice was made for zero-dependency and testability, not because a keyboard UI is impossible.

## 4. Proposed Outcome

On a real terminal, each multi-select question renders the option list with a cursor; ↑/↓ move, space toggles `[x]`, `a` toggles all, Enter confirms; a confirm with nothing checked shows one guidance line (*mark at least one option — space toggles, Enter confirms*) instead of `nothing selected — try again.`. Everywhere else — piped stdin, `TERM=dumb`, a terminal whose stdin cannot enter raw mode, or `--yes`/flags — the behavior is **byte-identical to today**: the comma form, the same answers object, the same files.

## 5. Scope

- `bin/routing.js`: a second injectable seam **`io.select(title, options, preChecked) -> Promise<number[]>`** beside `io.ask`; `promptMultiSelect` calls `io.select` when the injected `io` provides it, else the current comma path (the comma parser stays as the fallback, not a second implementation of the question).
- `bin/akili.js` `runRouting`: a keyboard `select` implementation on Node core only — `readline.emitKeypressEvents(process.stdin)`, `process.stdin.setRawMode(true)` for the duration of one question, cursor-up/clear-line redraw, restore the terminal on confirm, `Ctrl-C` (exit 130, nothing written) and on any error; attached to `io` **only** when `process.stdin.isTTY && typeof process.stdin.setRawMode === "function" && process.env.TERM !== "dumb"`.
- Single-choice prompts (`parseOneNumber` callers: tier adjust, placement, *other*) keep the typed form — out of this change unless specify finds it free.
- Tests: `test/routing.test.js` — a scripted `io.select` (returns indices; records the call) proving `collectAnswers` is unchanged in order, count and answers with either seam; `test/routing-io.test.js` — the non-TTY fallback still exits 1 with the usage error and never enters raw mode; a pty-driven case (`expect`, as T8 did) proving ↓, space, Enter select host 1 and 5 and the resulting `.agents/model-routing.json` equals the comma-driven one.
- Docs: `docs/cli.md` → *Routing* (the keys; the fallback rule), the constitution text does **not** change (it runs the non-interactive form).

## 6. Non-Goals

- Any runtime dependency (`inquirer`, `prompts`, `enquirer`, …) — NFR-1 of the shipped spec stands.
- Changing the answers file, the question order or count, the non-interactive flags, the `--json` output, or anything `/akili-constitution` Step 8C runs.
- A full-screen TUI, mouse support, colors beyond the existing palette, or fuzzy search.
- Windows console edge cases beyond what Node's `readline` keypress handles — recorded as a known limit if the CI matrix shows one (the fallback must still hold there).

## 7. Affected Users, Systems, And Specs

| Who / what | Effect |
|---|---|
| A developer running `akili routing` in a terminal | Keyboard selection; same results |
| `/akili-constitution` (agent-driven) | None — uses `--hosts/--models … --yes` |
| `changes/model-routing-configurator` (archived) | FR-1's interaction clause is **modified** (see delta); DD-14 (seam) extended with `io.select`; NFR-1/NFR-2 unchanged |
| `test/routing*.test.js`, the T8-style pty evidence | New cases; the comma cases stay as fallback coverage |

## 8. Visual Reference

- Source: None — a terminal prompt; the user's screenshot of the current prompt (`nothing selected — try again.` above the host list) is the before-state.
- Location: n/a
- Notes: the target rendering is a conventional checkbox list (`❯ [x] 1) Claude Code` …); no mockup needed.

## 9. Requirement Delta Preview

### ADDED Requirements

- Keyboard multi-select on a raw-mode-capable TTY: ↑/↓ move, space toggles, `a` toggles all, Enter confirms, Ctrl-C aborts without writing (exit 130).
- Guidance line on an empty confirm (replaces the retry message on the keyboard path).
- `io.select` seam; `collectAnswers` produces the identical answers object through either seam (deep-equality test).
- Fallback predicate (TTY + `setRawMode` + `TERM != dumb`) and a test that the comma form still works when it fails.

### MODIFIED Requirements

- FR-1 of the archived spec: "Multi-select input is comma-separated numbers" → "keyboard selection on a capable TTY; comma-separated numbers otherwise". The ≤ 8-prompt count and the question order are unchanged.
- `nothing selected — try again.` wording (comma path keeps a retry; its text gains the same guidance).

### REMOVED Requirements

- none.

## 10. Approach Options

| Option | How | Trade-offs |
|---|---|---|
| **A — Node-core keypress select behind an `io.select` seam (recommended)** | `emitKeypressEvents` + `setRawMode` for one question at a time; redraw with ANSI cursor moves; fallback to the comma path when raw mode is unavailable | ~120–180 LOC incl. terminal restore; no dependency; testable through the seam; the only real risk is terminal restore on abort — bounded by always restoring in `finally` |
| B — Add `@inquirer/checkbox` (or `prompts`) | Mature UI, less code | Breaks NFR-1 (first runtime dependency of the package), pulls transitive deps into every `npx akili-specs` run, a second prompt style beside `akili init` |
| C — Keep the comma form, improve the message only | One line | Does not address the feedback; the Enter-with-nothing-checked trap stays |

## 11. Recommended Approach

**A.** It honors the two constraints that made the comma form the original choice (zero dependencies, a testable seam) while giving the interaction the user asked for. The fallback keeps every existing guarantee: NFR-2 (never hangs without a TTY) is untouched because the keyboard path is only attached when stdin is a raw-mode-capable TTY, and the non-interactive contract the constitution depends on never sees the change.

## 12. Risks, Dependencies, And Open Questions

| Risk / question | Mitigation |
|---|---|
| Terminal left in raw mode after an exception or Ctrl-C | `setRawMode(false)` + `resume`/`pause` in a `finally`; a pty test that sends Ctrl-C and asserts the shell prompt is sane afterwards |
| Windows console keypress differences (CI matrix has `windows-latest`) | the predicate falls back to the comma form when `setRawMode` is absent; CI runs the non-TTY fallback on all three OSes — the keyboard path itself is verified on macOS/Linux ptys and recorded as `not exercised` on Windows if no pty is available there |
| `expect`-driven pty tests are timing-sensitive | anchor on rendered text, generous timeouts (T8 precedent) |
| The single-choice prompts stay typed — inconsistent feel | explicitly out of scope; a follow-up if the pattern proves itself |
| **KZ-changes--leader-brief-contract-2 / `/akili-specify` Falsifiability item 8 (*Executed, not predicted*)** | every falsifier in `tasks.md` is run at baseline before it is written — this spec's predecessor wrote four that were wrong |
| **KZ-changes--model-routing-configurator-1 (*Enumeration-wide falsifier*)** | the fallback predicate is a closed set (TTY × raw-mode × TERM) — the task falsifier enumerates it |

Open: should `a` (toggle all) exist, or is it noise for a 5-item list? Should the keyboard path also serve single-choice prompts in this change (adds ~40 LOC) — specify decides with the ≤ 8-prompt count in view.

## 13. Success Criteria

- On macOS/Linux terminals, both multi-select questions are answerable with ↑/↓, space, Enter; an empty confirm shows the guidance line; `.agents/model-routing.json` is byte-identical to the comma-driven run with the same choices.
- `printf '' | akili routing` still exits 1 in < 2 s with the usage error (NFR-2); `TERM=dumb akili routing` uses the comma form.
- `package.json` still has no `dependencies`; `npm test` green on the six-job CI matrix; `akili routing --yes` re-run still prints `no changes`.
- `docs/cli.md` *Routing* documents the keys and the fallback rule.

## 14. Next Step

```text
/akili-specify changes/routing-keyboard-select
```

(Lite depth is likely sufficient: one module, one seam, one fallback predicate.)
