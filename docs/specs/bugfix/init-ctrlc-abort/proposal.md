# Proposal — `akili init`: Ctrl-C prints an AbortError trace (Node ≥ 22.23) or exits 0 (Node ≤ 22.12)

## Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/init-ctrlc-abort` |
| Slug | `init-ctrlc-abort` — derived from free-text argument (Bug report pasted into `/akili-propose`) |
| Type | **Bug** |
| Approval Mode | gated |
| Date | 2026-10-18 |
| Author | AKILI session (proposer) |
| Status | **Approved** — 2026-10-18 (Juan Carlos, via Methodology agent): Option A; EOF case and global `main().catch` out of scope as follow-ups; update-cache decision delegated to `/akili-specify` |
| Related | `docs/specs/archive/2026-10-16-changes--routing-keyboard-select/` (T5 / Pivot B fixed the same defect for `akili routing` only); `bugfix/pty-harness-ubuntu-flake` (pty harness, Ubuntu flake still open) |
| Depends on | none |
| Parallel-safe | yes (touches `bin/akili.js` `runInteractiveInit` + `makeRoutingIo.ask`, `test/`, `docs/cli.md`, `CHANGELOG.md`; no active spec edits these, but `bugfix/pty-harness-ubuntu-flake` owns `test/routing-pty.test.js` — the new test goes in its own file) |
| Constraints (user) | this worktree only; local commits with `[SPEC:bugfix/init-ctrlc-abort]`; no push, no release, no `npm publish`; stop at every gate |

## Intent

Ctrl-C in the `akili init` wizard ends it the way Ctrl-C ends `akili routing`: one newline, no stack trace, exit code **130**, nothing installed. That must hold on every Node version in the CI matrix (18, 22).

## Problem / Current Behavior

- **Node 22.23.3:** Ctrl-C at either wizard question prints `AbortError: Aborted with Ctrl+C` with 10 `    at …` frames and `code: 'ABORT_ERR'`, and the shell reads `RC=1`. Reproduced on both questions with `expect /tmp/akili-init-repro/init.exp <node-22.23.3> bin/akili.js {1|2}`, run 2026-10-18. The trace's top frame is `[_ttyWrite] (node:internal/readline/interface:1148:37)`: `this[kQuestionReject]?.(new AbortError('Aborted with Ctrl+C'))`.
- **Node 22.12.0:** the same script, the same Ctrl-C → no output and `RC=0`. The wizard ends silently and reports *success*, also on both questions (same run).
- **Nothing gets installed in either case.** After all four runs the scratch `HOME` holds only `.akili-specs-update.json` and `.bash_history` (`ls -A /tmp/akili-init-repro/home`, same session).
- `akili routing` already exits 130 cleanly on Ctrl-C. It gets that from `makeRoutingIo.ask` (`bin/akili.js:2319–2344`, close-race + AbortError → `AKILI_SELECT_ABORT`) and `runRouting`'s catch (`bin/akili.js:2384` → `process.exitCode = 130`). `runInteractiveInit` (`bin/akili.js:2039`) uses neither; it calls bare `rl.question` at `:2048` and `:2069`.
- Node 18 behavior: `UNVERIFIED — confirm at source before relying on it`. Node 18 is not installed locally (`nvm ls`). The routing comment at `bin/akili.js:2323–2324` says 18 behaves like 22.12 ("never settles it"), and the CI matrix runs `node: [18, 22]` (`.github/workflows/ci.yml:31`).

## Proposed Outcome

| Situation | Today | After |
|---|---|---|
| Ctrl-C at question 1 or 2, Node ≥ 22.23 | trace + exit 1 | newline, exit 130, no `^\s+at ` lines, nothing installed |
| Ctrl-C at question 1 or 2, Node ≤ 22.12 / 18 | silent exit 0 | newline, exit 130, nothing installed |
| Normal answers | install runs | unchanged (same prompts, same mapping) |
| stdin EOF before answering (`</dev/null`, piped) | silent exit 0, nothing installed | **unchanged** (see Non-Goals) |

## Scope

- `runInteractiveInit`: a Ctrl-C at either question ends the process with exit 130 and no trace, on every supported Node. Nothing gets written.
- Share one abort-mapping helper between `runInteractiveInit` and `makeRoutingIo.ask`, so the two cannot drift apart again.
- A regression test that drives `akili init` on a real pty through `expect`, for each of the two questions. It asserts shell `RC=130`, zero `^\s+at ` lines in the transcript, and no install target created under the scratch `HOME`. It goes in its own test file and fixture, uses the harness conventions from `bugfix/pty-harness-ubuntu-flake` (`AKILI_PTY_LOG_DIR`, tty probe), and skips on Windows with a printed reason.
- `docs/cli.md` → *Init*: one line on Ctrl-C (exit 130, nothing installed). `CHANGELOG.md` → `Unreleased` entry (patch).

## Non-Goals

- **EOF / closed stdin before an answer.** Today that is a silent exit 0 with nothing installed. It is a different input (no TTY, no Ctrl-C) and a different contract question: should non-interactive `init` be a usage error? That change would affect scripted callers, so it is out of scope and listed under Open Questions.
- Redesigning the wizard (keyboard select, defaults, validating answers outside 1–7). The current mapping falls back to `claude` / global and stays as is.
- Root-causing the open Ubuntu pty flake (`bugfix/pty-harness-ubuntu-flake`).
- Release, push, or publish.

## Affected Users, Systems, And Specs

| Area | Effect |
|---|---|
| First-run users (`npx akili-specs init`) on Node ≥ 22.23, which is what new installs and CI runners get | today they see a stack trace on Ctrl-C |
| Scripts that check `init`'s exit code | today a Ctrl-C reads as success (0) on ≤ 22.12 |
| `bin/akili.js` `runInteractiveInit` (`:2039`), `makeRoutingIo.ask` (`:2319`) | code change |
| `test/` | new pty test + `.exp` fixture; no existing test covers `init` (`grep` over `test/*.js` finds only `git init` hits) |
| `docs/cli.md` (`:9–14`, `:77`), `CHANGELOG.md` | doc lines |

## Visual Reference

- Source: None
- Location: n/a
- Notes: CLI-only behavior; the "visual" is the terminal transcript. The before-transcripts are quoted in Bug Diagnosis.

## Bug Diagnosis

### Observed Symptom

`akili init` → Ctrl-C at the tool or scope question. On Node 22.23.3: an `AbortError: Aborted with Ctrl+C` stack trace on the terminal and exit 1. On Node 22.12.0: no output and exit 0.

### Reproduction Steps

1. `source ~/.nvm/nvm.sh`. Write an `expect` script that spawns `/bin/sh` with `HOME=<scratch>`, `TERM=xterm-256color`, `PS1="SH> "`. It sends `'<node>' bin/akili.js init`, waits for `Which tool do you want` and the `> ` prompt (for question 2 it first answers `1` and waits for `globally or locally`), sends `\003`, waits for `SH> `, then sends `echo RC=$?`.
2. Run it with `$(nvm which 22.23.3)` → expected `RC=130`, no trace. **Actual:** trace + `RC=1`.
3. Run it with `$(nvm which 22.12.0)` → expected `RC=130`. **Actual:** `RC=0`, no output.

The session scratch is `/tmp/akili-init-repro/init.exp`. All four version × question combinations were run 2026-10-18, and each reproduced as stated.

### Root Cause (confirmed)

`runInteractiveInit` awaits `readline/promises` `rl.question()` and does nothing for the case where the interface closes before an answer arrives. On Ctrl-C (raw-mode TTY, no `'SIGINT'` listener on the interface), Node's `_ttyWrite` closes the interface. From there it splits by version:

- **Node ≥ 22.23** also rejects the pending question with `AbortError` (`node:internal/readline/interface:1148`, quoted from the reproduction trace). `main()` is called bare at `bin/akili.js:2449` with no `.catch`, so the rejection is unhandled. Node's default `unhandledRejection` mode prints the error and exits 1.
- **Node ≤ 22.12** closes without settling the question. The `await` hangs forever, the closed interface releases stdin, the event loop empties, and the process exits 0 without ever reaching the install code.

`akili routing` was fixed for both branches by the close-race in `makeRoutingIo.ask` (`bin/akili.js:2331–2339`). `init` never got that fix.

### Blast Radius

| Check | Recorded as | Result |
|---|---|---|
| **Already fixed?** | `git log --all --oneline -G"AbortError\|ABORT_ERR" -- bin/akili.js` → only `ae07590` (routing T5, `makeRoutingIo.ask`). Separately, I extracted `runInteractiveInit` from `bin/akili.js` on every local and remote branch (`git for-each-ref refs/heads refs/remotes` + `git show <b>:bin/akili.js` + awk) and grepped it for `AbortError\|ABORT_ERR\|on("close"\|once("close"` → 0 hits. As run 2026-10-18. | **Not fixed** on any branch. Proceed. |
| **Live path?** | `main()` (`:2392`) → `args.command === "init"` (`:2412`) → `printBanner()` → `runInteractiveInit()` (`:2414`) → `rl.question` (`:2048` question 1, `:2069` question 2). The reproduction shows the banner and both prompts' text before the trace, and the trace is a `readline` question reject. | **On path.** The cause is confirmed. |
| **Siblings on the same state** | Every `readline` interface in the package: `grep -rn "createInterface\|readline" bin/ scripts/` → `bin/akili.js:2040` (init, **broken**), `:2321` (`makeRoutingIo.ask`, fixed by T5), `:2302` (`keySelect`, raw keypress with its own Ctrl-C → `AKILI_SELECT_ABORT` at `:2287`, fixed by T5). `bin/routing.js:946` is a pure key reducer with no interface. Also the bare `main()` at `:2449`: no top-level catch, so any future unhandled rejection would trace the same way. | One broken sibling (init). The bare `main()` is recorded as a risk and not widened here. |
| **Downstream consumers** | `docs/cli.md:9–14`, `:77` and `README.md:178–181` document `init` and say nothing about Ctrl-C. No test covers `init` (grep above). `test/routing-pty.test.js` / `test/routing-io.test.js` cover `makeRoutingIo.ask` Ctrl-C (case 4) and must stay green if the helper is extracted. | Docs get one line. The routing pty/io suites are the regression guard for the extraction. |

- Data integrity: none. Nothing is written in any branch today. Security: none.

### Fix Strategy

The smallest safe fix is to lift `makeRoutingIo.ask`'s close-race + AbortError mapping into one helper that takes the interface, the prompt, and the output stream, and rejects with the tagged `AKILI_SELECT_ABORT` error. Both `makeRoutingIo.ask` and `runInteractiveInit` then call it. `runInteractiveInit` catches the tagged abort, closes the interface, and sets exit 130, the same way `runRouting` does at `:2384`. Route: **`/akili-specify` (Lite) in Bug Mode**. This is logic, not cosmetics, so it needs a regression test that is red at the current HEAD on 22.23.3 (trace, RC=1) and on 22.12.0 (RC=0), and green after the fix.

## Approach Options

| Option | What | Pros | Cons |
|---|---|---|---|
| **A. Shared abort helper (recommended)** | Extract the close-race + AbortError → `AKILI_SELECT_ABORT` mapping from `makeRoutingIo.ask` and use it in `init` | Covers both Node branches with a mechanism already proven in CI. One place to maintain. Routing tests guard the extraction | Touches routing code, which already works; has to stay byte-identical in behavior |
| B. `rl.on("SIGINT", …)` in `init` | Handle Ctrl-C explicitly → close + exit 130 | Small, local to `init` | Whether a SIGINT listener stops the 22.23 reject is `UNVERIFIED`. It adds a second Ctrl-C mechanism next to routing's, so the two drift |
| C. Top-level `main().catch` / `unhandledRejection` → 130 on `ABORT_ERR` | Global net | One line | Leaves the ≤ 22.12 silent exit 0 in place (nothing rejects there). Masks unrelated bugs. Still sends an `ABORT_ERR` from anywhere to 130 |

## Recommended Approach

**Option A.** It is the only option that fixes both version branches (trace + 1, and silent 0) with code the routing pty suite already proves on Node 18 / 22.12 / 22.23. It also removes the duplication that let `init` miss T5's fix in the first place. Option C's net for the bare `main()` is a separate decision and stays out of this spec (see Risks).

## Risks, Dependencies, And Open Questions

- **Ubuntu pty flake (open).** `bugfix/pty-harness-ubuntu-flake` is still unresolved, and its reds land on Ctrl-C cases (`null !== 130`). A new pty Ctrl-C test can inherit that flake. Mitigation: use the same evidence harness (`AKILI_PTY_LOG_DIR`, tty probe, transcript tail on failure), so a red explains itself and cannot be mistaken for this bug.
- **Update check in the pty test.** `init` calls `checkForUpdates()` when stdout is a TTY (`bin/akili.js:1928`), which can make a network call when the cache misses (`readUpdateCache`, `:1911`). The routing pty fixtures already run in the same situation. `/akili-specify` must decide whether to seed the scratch `HOME` cache so the test stays offline.
- **Node 18 evidence.** The 18 branch is `UNVERIFIED` locally. CI (`node: [18, 22]`) is its evidence, and local evidence would need `nvm install 18`. Proposed for specify: install 18 locally for the red/green run, or accept CI as the record.
- **Extraction regression.** Changing `makeRoutingIo.ask` puts routing case 4 (typed-question Ctrl-C) at risk. The guard is `npm test` green on 22.12 and 22.23 before and after.
- **KZ-changes--leader-brief-contract-2 (Executed, not predicted).** Every red/green falsifier in the spec must be *run* at baseline, not predicted. The 22.12 branch is exactly the kind of case where "removing the mapping → red" can be inert, as happened in routing T5.
- **Follow-up 1 (decided out of scope, 2026-10-18):** non-interactive `init` (EOF before an answer) — should it become a usage error (exit 2, the way `akili routing` without a TTY is)? Tracked as a separate future proposal.
- **Follow-up 2 (decided out of scope, 2026-10-18):** a top-level `main().catch` as defense-in-depth for future unhandled rejections. It changes the failure mode for every command; tracked as a separate future proposal.

## Success Criteria

- On Node 22.23.3 and 22.12.0, run locally (plus 18 and 22 in CI), Ctrl-C at `init` question 1 and question 2 → shell `RC=130`, zero `^\s+at ` lines, nothing created under the scratch `HOME`.
- The new pty test is red at current HEAD (22.23.3: trace/RC=1; 22.12.0: RC=0) and green after the fix. Both runs are executed and quoted in `execution.md`.
- `npm test` stays green, including the routing pty and io Ctrl-C cases. `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` stay clean.
- The normal `init` flow is unchanged: same prompts, same answer mapping.

## Next Step

```text
/akili-specify bugfix/init-ctrlc-abort
```

Run it in **Bug Mode** (Lite): the confirmed root cause becomes the fix plan, plus the mandatory pty regression test (red before, green after).
