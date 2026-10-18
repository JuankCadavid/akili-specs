# Tasks: pty harness — a red Ctrl-C case carries its own evidence

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/pty-harness-ubuntu-flake` |
| Depth | **Lite** (Bug Mode) |
| Status | **Approved** — 2026-10-17 (user, Phase 3 gate: Continue) |
| Date | 2026-10-17 |
| Budget (design §11) | **2 tasks · ~190 LOC · 3 review rounds** — `/akili-execute` stops and escalates past 2 tasks, ~230 LOC, or 3 rounds |
| Commit prefix | `[SPEC:bugfix/pty-harness-ubuntu-flake]` |
| Format precedent | `docs/specs/archive/2026-10-16-changes--routing-keyboard-select/tasks.md` |
| Verified at | `cabd04d` — every baseline reading below was **executed** on 2026-10-17 and is quoted, not predicted (KZ-changes--leader-brief-contract-2) |
| Baseline probes | `scratchpad/fakebin/expect` + `PATH=… AKILI_PTY_LOG_DIR=… node --test --test-reporter=tap test/routing-pty.test.js` → `scratchpad/baseline-red.tap` (T1 Red run) · `scratchpad/lf.exp` / `lf-mut.exp` on `/bin/sh`, `/bin/dash`, Docker `node:22` (T1 probe + falsifier 2) · `scratchpad/rep.test.js` on Node 18.20.8 / 22.23.3 (P-9) |

## 2. Task Graph

```
T1 (harness: helpers · four fixtures · fake-expect.sh · regression test)
 └─→ T2 (ci.yml dispatch inputs · versions · env · inject · loop · artifact; AGENTS.md:13 clause)
```

Waves: **T1** → **T2**. No circular dependencies. T2 waits for T1 because its inject step installs the shim T1 ships and its artifact step uploads the directory T1 fills.

**`skip-eligible` tasks: none.** T1 edits every fixture the six pty cases run through; T2's only proof is a CI run the Reviewer must read.

**Skills:** T1 `tdd` (regression test first, red quoted below) · `systematic-debugging` if a real pty disagrees with the probe · T2 `cognitive-doc-design` (the `AGENTS.md` sentence). No UI skill applies.

---

### T1 — Harness: evidence-carrying assertions, `\n` probe line, transcript copy, regression test

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~155 LOC: `test/routing-pty.test.js` ~55 · four `.exp` ~32 · `fake-expect.sh` ~15 · `test/routing-pty-evidence.test.js` ~55) |
| Depends on | none |
| Requirements | FR-1 (scenario + `BUT` healthy run unchanged + `AND IT MUST` every site incl. `:153`), FR-2 copy half (`THEN` copied before removal; `AND IT MUST` unset → unchanged), FR-3 (both scenarios; `BUT` `$?` not clobbered; `AND IT MUST` `<<BACK-IN>>` untouched; echo-safe marker clause), FR-4 (scenario; `BUT` no real pty, `win32` skip; `AND IT MUST` shim via `PATH` only), NFR-1, NFR-2, NFR-3 |
| Design refs | §4, §5.1–§5.4, §7.1–§7.3, DD-1, DD-2, DD-3, DD-4, P-1, P-4–P-11 |
| Review | `full` — it changes the fixtures and assertions every pty verdict runs through |

**Scope.**

- `test/routing-pty.test.js`: add `ttyProbe(log)` (parse `<<TTY: …>>` → `{ flags: Set, pg, fg }`), `rcFailure(run, expected, why)` (§5.3 message: why · `expect <fixture> exited with status <status> (signal <signal>)` · `markers: …`/`none` · `last 30 transcript lines:` + `logTail(run)`), `assertShellRc(t, run, expected, why)` and `assertTtySane(t, run)` (probe present; `flags ⊇ {icrnl, icanon, isig, echo}`; `pg === fg`), each doing `t.diagnostic(msg)` then `assert.fail(msg)`. Replace the ten sites in P-1 (`:153–154`, `:188–189`, `:201–202`, `:219–220`, `:236`, `:249`); keep every case's assertion order and `assertFinished` last. Remove `sttyEcho` (P-6). `withProject`: in `finally`, when `AKILI_PTY_LOG_DIR` is set, `mkdirSync` it and copy each `*.log` under `root` as `<basename(root)>-<file>` **before** `rmSync`; unset → no other change.
- The four fixtures: replace the `echo RC=$?` / `stty -a … echo` / `<<STTY:` exchanges (`pty-ctrl-c.exp:54–59` and their twins) with the §5.1 probe line (`\n`-terminated; `$?` saved first; `T""TY=` typed), `expect -re {TTY=([^\r\n]*)\r?\n}` → `send_log "\n<<TTY: $expect_out(1,string)>>\n"`, `expect -re {RC=\d+}`, `send "exit\n"`. `ctrl_c_to_shell` and every earlier wait untouched.
- `test/fixtures/routing/fake-expect.sh` (§5.4): POSIX `sh`, writes the canned transcript to `$6`, `exit 2`. No executable bit required (DD-4).
- `test/routing-pty-evidence.test.js` (§7.3): skip on `win32` with a printed reason; install the shim into `<tmp>/bin/expect` (`chmod 0o755`); one `spawnSync(process.execPath, ["--test", "--test-reporter=tap", "test/routing-pty.test.js"])` with `PATH` prefixed and `AKILI_PTY_LOG_DIR=<tmp>/logs`; assert child status ≠ 0; extract the `not ok … pty FR-5: Ctrl-C at the host question` block (from that line to the next line matching `^(not )?ok \d|^# Subtest`) and assert it contains `<<AKILI-EVIDENCE-SENTINEL 7f3a>>`, `status 2`, `<<TIMEOUT: unmatched wait>>`; assert `<tmp>/logs` has a file matching `/pty-ctrl-c\.exp.*\.log$/`. Written **first** (`tdd`).

**Verification.**

| Field | Value |
|---|---|
| Command | `npm test` (macOS; system Node) → the six pty cases green, every case's transcript holds `<<TTY: … PG=n FG=n>>`, the evidence test green · `PATH=~/.nvm/versions/node/v18.20.8/bin:$PATH node --test test/routing-pty.test.js test/routing-pty-evidence.test.js` → same · Docker `node:22` loop (sh = dash): `pty-ctrl-c.exp`, `pty-empty-confirm.exp`, `pty-fallback.exp dumb` × 3 each → `RC=130` and `<<TTY:` every run (`scratchpad/dash/linux-loop.sh` shape) · `git diff --stat cabd04d..HEAD -- bin/ .claude/` → empty (NFR-1) |
| Red run | **Observed at `cabd04d`** (`scratchpad/baseline-red.tap`, shim on `PATH`, 1 s): the case-3 block reads `not ok 3 - pty FR-5: Ctrl-C at the host question …` / `error: \|-` / `Expected values to be strictly equal:` / `null !== 130` / `stack: … routing-pty.test.js:201:12` — **no sentinel, no `status 2`, no `<<TIMEOUT`** in that block; `ls $AKILI_PTY_LOG_DIR \| wc -l` → `0`. After T1 the same run must show the sentinel inside that block and ≥ 1 kept log |
| Falsifier | (1) Post-change: drop `logTail(run)` from `rcFailure` → the evidence test goes red on its sentinel assertion (quote the message); restore. (2) **Executed at baseline** (`lf-mut.exp`): reading `$?` *after* the `stty`/`ps` pipeline instead of saving it first → `<<RC=0>>` on `/bin/sh` and `/bin/dash` where `7` was set — the fixture mutation `__rc` removed must turn case 3's `RC=130` into `RC=0` and the case red; restore. (3) Post-change: remove `icrnl` from the required flag set and run with the flag mutated? — **not injectable on a healthy pty**; instead mutate the fixture's typed marker to `TTY=` (echo-unsafe) → on dash the wait matches the echo and `<<TTY:` carries the command text, `assertTtySane` red (P-7 observed shape); restore. (4) Post-change: make `withProject` skip the copy → the evidence test's kept-log assertion red; restore |
| Disqualifier | A sentinel found anywhere in the TAP is **not** evidence — at baseline it already appears 6× in the blocks of cases 4–6 because `assert.match` prints its whole input (`baseline-red.tap:96,112,147,163,198,214`); only the case-3 block counts. A green pty case whose transcript lacks `<<TTY:` means the probe never ran — `assertTtySane` must fail, never pass silently. Fewer than 3 Docker runs per fixture is inconclusive for the `\n` probe's timing. A 60 s `spawnSync` kill (status `null`) in the evidence test's child is a hang, not a red |
| Consumers | `test/routing-pty.test.js` (all six cases) · the four `.exp` fixtures · `test/routing-pty-evidence.test.js` (new) · `.github/workflows/ci.yml` (T2 reads `AKILI_PTY_LOG_DIR` and the shim path) · `AGENTS.md:13` (T2 names the env var) · `grep -rn "sttyEcho\|<<STTY" --include="*.js" --include="*.exp" --include="*.yml" --include="*.md" . \| grep -v node_modules \| grep -v docs/specs/archive` → must be 0 hits outside this spec folder after T1 |

**Done.** Six pty cases green on macOS (system Node and 18.20.8) and 9/9 in the Docker loop, each transcript with `<<TTY:` and `RC=`; the evidence test red at baseline (quoted above) and green at HEAD; falsifiers (1), (2), (3), (4) quoted in `execution.md`; `sttyEcho`/`<<STTY` gone; `bin/` diff empty.

---

### T2 — CI: dispatch inputs, versions, transcript artifact, failure injection; `AGENTS.md:13` clause

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~31 LOC: `ci.yml` ~30 · `AGENTS.md` 1) |
| Depends on | T1 |
| Requirements | FR-2 artifact half (`THEN` artifact on a red job; `BUT` not on green, not on Windows), FR-5 (scenario; `BUT` push/PR unchanged; versions printed), NFR-4 |
| Design refs | §5.5, §7.4, §9, DD-4, DD-5, P-2, P-3, **P-12 (`UNVERIFIED` — settled here, first step)** |
| Review | `checklist` — YAML plus one sentence; the proof is two CI runs the Reviewer reads by id |

**Scope.**

- `.github/workflows/ci.yml`: `on.workflow_dispatch.inputs.pty_loops` (number, default 1) and `pty_inject_failure` (boolean, default false); step *Toolchain versions (Linux)* `node -v && expect -v` after the expect install; step *Inject pty failure (dispatch)* `if: runner.os == 'Linux' && inputs.pty_inject_failure == true` — copy `test/fixtures/routing/fake-expect.sh` to `$RUNNER_TEMP/fake-bin/expect`, `chmod 755`, `echo "$RUNNER_TEMP/fake-bin" >> "$GITHUB_PATH"`; Unit tests step gains `env: AKILI_PTY_LOG_DIR: ${{ runner.temp }}/pty-transcripts`; step *pty loop (dispatch)* `if: runner.os == 'Linux' && inputs.pty_loops > 1` — run `node --test test/routing-pty.test.js` `pty_loops − 1` times with the same env, `continue-on-error: false`; step *Upload pty transcripts* `actions/upload-artifact@v4`, `if: failure() && runner.os == 'Linux'`, `name: pty-transcripts-${{ matrix.os }}-node${{ matrix.node }}`, `path: ${{ runner.temp }}/pty-transcripts`, `if-no-files-found: ignore`. Nothing else in the file moves.
- `AGENTS.md:13`: append the §9 clause after "absent on Windows where the suite skips with a printed reason" — one sentence, quote-checked at HEAD.
- **First step — settle P-12:** push T1 + T2, read the push run: six legs green, `gh api repos/JuankCadavid/akili-specs/actions/runs/<id>/artifacts` → `total_count: 0`; then `gh workflow run ci.yml -f pty_inject_failure=true` → the two Linux legs red at Unit tests, the artifact `pty-transcripts-ubuntu-latest-node22` listed and, downloaded, containing `<<AKILI-EVIDENCE-SENTINEL 7f3a>>`; macOS/Windows legs unaffected (no shim). Record both run ids in `execution.md`; if either reading differs, P-12 is refuted → Pivot Protocol, not a quiet YAML tweak.

**Verification.**

| Field | Value |
|---|---|
| Command | `gh workflow view CI` (parses) · push run id + `artifacts` query → `0` · inject dispatch run id → Linux red, artifact present with the sentinel · optional data run `gh workflow run ci.yml -f pty_loops=10` (outcome recorded, not required green) |
| Red run | n/a — CI configuration; the inject dispatch is the executed proof of the failure path |
| Falsifier | (1) The inject dispatch **is** the falsifier of `if: failure()`: a dispatch that stays green or lists no artifact means the step is wired wrong — executed, not predicted. (2) Post-change: set `if: success() && …` on the artifact step and dispatch again → no artifact (document, then restore) — run only if (1) raised doubt, to stay inside the 3-round budget |
| Disqualifier | A dispatch whose job never starts (YAML error) proves nothing about the artifact path; a red caused by the versions step or the inject step itself is not the Unit-tests red FR-5 names — read the failing step name. Windows legs must still print the evidence test's skip line and `# skipped` for the pty suite; a Windows red is a T1 regression, not T2 evidence |
| Consumers | `.github/workflows/ci.yml` (only consumer of the suite in CI) · `AGENTS.md:13` · `docs/release-checklist.md` — `grep -n "artifact\|pty" docs/release-checklist.md` run before closure; 0 hits expected, if any appear they are quote-checked |

**Done.** `ci.yml` and `AGENTS.md` committed; push run green with `total_count: 0` artifacts; inject dispatch red on Linux with the artifact and the sentinel inside; both ids and the `node -v`/`expect -v` lines from the Ubuntu legs recorded in `execution.md`; P-12 flipped to verified in `design.md` §12 with the run ids as citation.

## 3. Coverage Closure (scenario / clause → task)

| Requirement clause | Owner |
|---|---|
| FR-1 scenario — THEN `status 2` + markers + tail / AND `t.diagnostic` / BUT healthy run unchanged / AND IT MUST every site incl. `:153` | T1 (`rcFailure`, `assertShellRc`, ten sites; evidence test asserts the block) |
| FR-2 — THEN copied before removal / AND IT MUST unset → unchanged | T1 (`withProject` copy; evidence test kept-log assertion) |
| FR-2 — THEN artifact on red / BUT not on green, not on Windows | T2 (push run `0` artifacts · inject dispatch artifact · `runner.os == 'Linux'`) |
| FR-3 healthy — THEN `<<TTY:` + `RC` / AND four flags + `PG == FG` / echo-safe marker / BUT `$?` saved first / AND IT MUST `<<BACK-IN>>` untouched | T1 (probe line; `assertTtySane`; falsifiers 2, 3) |
| FR-3 raw-mode leak — THEN `\n` still executes, flag assertion red with `-icrnl` | T1 (`\n` probe; strict flag set) — **no injectable input on a healthy pty**: accepted gap, the Reviewer reads the probe line; H1 proves itself on the next CI red |
| FR-4 — THEN red at baseline on the assertion / AND green after / BUT no pty, `win32` skip / AND IT MUST shim via `PATH` only | T1 (evidence test; Red run quoted) |
| FR-5 — THEN inject red + artifact + sentinel / BUT push/PR unchanged / versions printed | T2 |
| NFR-1 · NFR-2 · NFR-3 | T1 |
| NFR-4 | T2 |

No clause is cleared by citing a different requirement. One recorded gap: FR-3's raw-mode scenario cannot be injected on a healthy pty (no product hook leaves the tty raw); it is covered by construction (`\n` + strict flags) and by the Reviewer's read.

## 4. PR Strategy

~190 LOC in two tasks on test and CI files: **one change set, direct to `master`** (this repo's flow). Review order: T1 evidence test → helpers → fixtures → T2 YAML → `AGENTS.md` sentence. Out of scope for the reviewer: anything under `bin/`, the flake's cause, the T6 wait budgets.

**After T2:** run `gh workflow run ci.yml -f pty_loops=10` once and leave it; the next Ubuntu red — in that loop or on a later push — carries `<<TTY:>>`, `status`, the tail and the artifact, which is the input of the follow-up Bug proposal (`bugfix/pty-ctrl-c-ubuntu-rc`, not yet opened).
