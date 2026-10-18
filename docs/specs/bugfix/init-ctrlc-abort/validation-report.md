# Validation Report — akili init Ctrl-C exits 130

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/init-ctrlc-abort` |
| Depth | Lite (Bug Mode) |
| Run | **2** — supersedes run 1 (validated at `22dc7ed`, verdict NOT READY on V-1). **V-1 was resolved by the Pivot Protocol** (`execution.md` → *Pivot Record: V-1*, user decision "Accept, amend docs", amendments `e9838e9`, pinned by T2 `2759215`) |
| Validated at | `3568dd4` (branch `JuankCadavid/init-ctrlc-bug`; `git status --porcelain` = only this untracked report, before and after every probe) |
| Validator | `fable` (Claude Fable 5.1, T3 Auditor). Author ≠ auditor: T1 Implementer `opus` / Reviewer `sonnet`; T2 Implementer `sonnet` / Reviewer `opus`. This validator edited nothing but this file; the one mutation probe was restored from a scratch copy and `cmp`-checked byte-exact |
| Date | 2026-10-18 |
| Inputs | `proposal.md`, `requirements.md`, `design.md`, `tasks.md` (T1, T2 `[x]`), `execution.md` (T1 PASS a1, T2 PASS a2, Pivot Record V-1), `test-report.md` (PASS, refreshed at `2759215`; its §7 matrix reused as primary coverage evidence and cross-checked), run-1 `validation-report.md`; `git diff ad7022a..HEAD -- bin/ test/ docs/cli.md CHANGELOG.md` (+432/−46 net; per-commit sum +433/−47) |
| Absent in this repo | `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/specs/general-setup/` (confirmed by `ls`, not searched) |
| Persona | `.agents/reviewer.md` (4R lenses, advisory layer) |
| Node / tools | `~/.nvm/versions/node/v{22.23.3,22.12.0,18.20.8}/bin/node` (bin first on `PATH` for `npm test`; `process.version` diagnostics in every TAP match the binary); `expect` at `/usr/bin/expect`. Measurements run sequentially |
| Verdict | **ARCHIVE-READY** — 0 FAIL, 0 BLOCKED, 3 WARN (all doc-only or CI-settled by design). The product change, the four-case regression gate, the pivot closure and every quoted doc clause check out |

## 2. Summary

| Level | Count | What |
|---|---|---|
| FAIL | 0 | — |
| BLOCKED | 0 | — |
| **WARN** | 3 | **V-2** (carried): P-4 Node 18 leg, Windows skip branch, Ubuntu flake signature settle on CI at the first push (accepted by requirements §4 / test-report §9). **V-3** (new): a committed whitespace fault — `tasks.md:122` "new blank line at EOF", introduced by `e9838e9`; `git diff --check ad7022a..HEAD` exits 2 (the working-tree `git diff --check` that `AGENTS.md` names is clean, so the executors' "clean" claims hold for that form). **V-4** (new): post-pivot stale text — `tasks.md:20–25` *Task Graph* still reads "One task, no dependencies" and lists T1 only; `execution.md:83` names "stdin EOF before an answer" as a follow-up (only the exit-2 question remains one); `design.md:32` §4 and `test-report.md:20` say "three pty cases" / "1 suite (pty)" without case (d). None misstates delivered behavior; §11 |
| PASS | all else | §3–§10 |

**V-1 closure (run 1's FAIL):** resolved. The forward sweep (§8) finds every "unchanged" / "every other path" / "silent exit 0" / "EOF" / "out of scope" site either amended with a dated Pivot V-1 note or still true; my own EOF probes at HEAD read `rc=130`, 0 trace lines, nothing installed, offline, for `</dev/null` and piped `1\n1\n` on 22.23.3 and 22.12.0; case (d) pins it in the suite and fails correctly under falsifier (7).

## 3. Task Completion

| Item | Evidence | Result |
|---|---|---|
| T1 `[x]` | `tasks.md` T1 Status `[x]`; all 7 *Done* boxes `[x]` | PASS |
| T1 execution evidence | `execution.md` T1: red run quoted per version (22.23.3 `RC=1` + trace; 22.12.0 `RC=0`), green 3/3 ×2, F1/F2/F4/F5/F6 red + restored, F3 known-inert, non-author evidence re-run VERIFIED, Reviewer `STATUS: PASS` attempt 1; 4 advisories recorded, none promoted to tasks | PASS |
| T2 `[x]` | `tasks.md` T2 Status `[x]`; all 4 *Done* boxes `[x]`; "No change to `bin/`" — `2759215` numstat touches `CHANGELOG.md` 1/1, `docs/cli.md` 1/0, `test/init-pty.test.js` 40/0, spec docs only | PASS |
| T2 execution evidence | red run at baseline (`ad7022a`'s `bin/akili.js` swapped in, restored `cmp`-exact): `not ok 4 … FR-4: status 130 (read 0)`, status check only; falsifier (7) red on status + trace; evidence re-run VERIFIED on both attempts; Reviewer `STATUS: FAIL` a1 (CHANGELOG "It" scope sentence) → `STATUS: PASS` a2 | PASS |
| Closing record | `execution.md` §3: tasks 2/2, review rounds 3 (budget 2, round 3 user-approved), LOC ≈+433/−47, `Next` = re-test → re-validate → archive | PASS |
| Pivot Record V-1 | Date, raiser, blocker, 3 alternatives, user decision "(a) Accept, amend docs", amendment list, correction closure, re-budget (2 tasks · 2 rounds), ADR n/a — present | PASS |
| Commits | `fb27fcc`, `22dc7ed`, `e9838e9`, `2759215`, `3568dd4` — all `[SPEC:bugfix/init-ctrlc-abort]`; not pushed | PASS |
| Budget tripwires | T1 LOC overrun (≈373 vs ~230) escalated → "Accept and review"; T2 round 3 vs 2 escalated → "Approve round 3". Both recorded with the user decision | PASS |

## 4. File Existence (design §4 + T2)

| Path | Design | Shipped at `3568dd4` | Result |
|---|---|---|---|
| `bin/akili.js` | helper + two call sites | `questionOrAbort` `:2334–2356` above `makeRoutingIo` `:2360`; call sites init `:2051`, `:2073`, routing `:2366`; marker `@akili-spec bugfix/init-ctrlc-abort` `:2331`; +70/−44 vs `ad7022a`, untouched by T2 | PASS |
| `test/init-pty.test.js` | new: three pty cases (DD-3) + non-pty case (DD-6/T2) | 257 lines, 4 `test(`: (a) `:196`, (b) `:198`, (c) `:200`, (d) `:229` (no `SKIP` guard on (d)) | PASS |
| `test/fixtures/init/pty-init.exp` | new; modes `q1 \| q2 \| answer` | 84 lines; `argv: node bin home cwd log mode`; `expect_after` after `spawn`; CSI-tolerant `wait_prompt`; two-stage `ctrl_c_to_shell` | PASS |
| `test/fixtures/init/no-network.js` | new; `--require` preload | 16 lines; wraps `https.get`/`https.request`, appends to `$AKILI_NET_MARKER` | PASS |
| `docs/cli.md` | one line (DD-5) + one line (T2) | `:17` Ctrl-C line, `:18` end-of-input line | PASS |
| `CHANGELOG.md` | patch entry + EOF clause | `## [Unreleased]` → `### Fixed`, one entry (`:11`) | PASS |
| Not exported (§7) | — | `grep module.exports bin/akili.js` → 0 | PASS |
| `package.json` | unchanged (NFR-3) | `git diff --stat ad7022a..HEAD -- package.json` empty; no `dependencies` key | PASS |

## 5. Build Integrity

| Check | Result |
|---|---|
| `npm test` on v22.23.3 | PASS — **264/264**, 0 skipped; `init-pty` TAP 66–69 ok (incl. 69 `init FR-4 (d)`); `routing-pty` 110–115 ok (6/6), incl. 113 `TERM=dumb … Ctrl-C on the comma path exits 130 too` (FR-3) |
| `npm test` on v22.12.0 | PASS — 264/264, same cases |
| `node --test test/init-pty.test.js` on v18.20.8 (supplementary, P-4) | PASS — 4/4, `process.version v18.20.8` |
| `npm run verify:cli` | PASS — exit 0, `11 commands \| 24 skills \| 8 resources (akili-specs v2.32.2)` |
| `npm run pack:dry-run` | PASS — exit 0, 280 files, **0 `test/` entries**; no `.tgz` left in the tree |
| `git diff --check` (working tree) | PASS — exit 0 |
| `git diff --check ad7022a..HEAD` | **WARN V-3** — `docs/specs/bugfix/init-ctrlc-abort/tasks.md:122: new blank line at EOF` (exit 2). Per-commit: `fb27fcc`, `22dc7ed`, `2759215`, `3568dd4` clean; **`e9838e9` introduces it** (`tail -c` shows `…quote-checked.\n\n`) |
| `AKILI_PTY_LOG_DIR` copy (v22.12.0, 4/4) | PASS — three transcripts `akili-init-pty-*-pty-init-{q1,q2,answer}.log` landed; (d) writes none (no pty), as the CHANGELOG now says |

## 6. Requirement Coverage

Clause-level. `test-report.md` §7 is the primary matrix; each row below is cross-checked against `requirements.md` and the shipped test. **(V)** = validator probe this run.

| Requirement / clause (quoted) | Owner | Evidence | Result |
|---|---|---|---|
| FR-1 statement: "end the process with exit code `130` when the user presses Ctrl-C at either wizard question" | T1 | (a) `q1`, (b) `q2`: `FR-1: RC=130`; green on 22.23.3, 22.12.0 **(V)**, 18.20.8 **(V)** | PASS |
| FR-1: "after writing one newline" | T1 + `/akili-test` | `out.write("\n")` `:2340`; `shellPromptOnOwnLine` + `exactlyOneNewline` (`lines[at-1] === "> "`); F6 and TF1 red | PASS |
| FR-1: "No trace lines and no install targets" | T1 | `!/^\s+at /m`, `!includes("AbortError")`, `noInstallTarget` over `.claude .config .gemini .codex .cursor .agents` in `home` and `cwd` | PASS |
| FR-1 scenario 1 (Node ≥ 22.23, tool question): "THEN the shell reads exit code `130`" / "BUT it must NOT print `AbortError` or any trace line" / "AND IT MUST create no install target" | T1 | (a) on 22.23.3; baseline red `RC=1` + trace; three checks above | PASS |
| FR-1 scenario 2 (Node ≤ 22.12, scope question): "THEN … `130`, not `0`" / "AND IT MUST create no install target" | T1 | (b) on 22.12.0; baseline red `RC=0`; F2 (race removed) red on 22.12.0 only; DD-2 returns before `isLocal` `:2092` | PASS |
| FR-1: "Each scenario SHALL also pass with the question and the Node version swapped" | T1 | (a) and (b) both run under 22.23.3 and 22.12.0 (TAP 66/67 in each `npm test` **(V)**) and 18.20.8 **(V)** | PASS |
| FR-1: "each runtime in the CI matrix runs it" | CI | `ci.yml:30–31` `os × node: [18, 22]`; not pushed | WARN (V-2) |
| FR-2 statement: "keep the two prompts' text and the answer → install mapping unchanged (`1–7` → tool, `2` → local, anything else → `claude` / global)" | T1 | diff: prompt strings re-indented only; `let tool = "claude"` default, `if/else if` chain, `isLocal = scopeAnswer.trim() === "2"` unchanged | PASS |
| FR-2 scenario: "answered `1` … `1` … runs the global Claude Code install … exits `0`" / "BUT it must NOT add any prompt, default marker or trailing text" | T1 + `/akili-test` | (c): `RC=0`, `HOME/.claude/commands`, empty `cwd`; 9 option lines verbatim (F5 red); `promptLinesExact` (TF2b red) | PASS |
| FR-3 statement: "keep `akili routing`'s typed-question Ctrl-C at exit `130`, with nothing written and no trace, on every supported Node" | T1 | `makeRoutingIo.ask` keeps `createInterface` + `finally { rl.close() }`; prompt string `def ? … : …` byte-identical; `runRouting` catch `:2410` untouched | PASS |
| FR-3 scenario: "`pty-fallback.exp` … passes with `RC=130`" | T1 | TAP 113 ok on both 22.x **(V)**; F2 made it red on 22.12.0 | PASS |
| **FR-4** statement: "end the process with exit code `130` when stdin reaches end-of-input before the wizard has an answer" | T2 | (d): `stdio: ["ignore", …]` (null device), `status === 130`; green 22.23.3, 22.12.0, 18.20.8 **(V)**; baseline red `read 0` | PASS |
| FR-4: "(`</dev/null`, or a closed pipe)" | T2 (+V) | (d) covers the null device; **(V)** `</dev/null` and piped `1\n1\n` both `rc=130` on 22.23.3 and 22.12.0 (the pipe variant is validator evidence only; see A8) | PASS |
| FR-4: "No trace lines and no install targets" | T2 | (d): `!/^\s+at /m` and `!AbortError` over stdout+stderr, `noInstallTarget` | PASS |
| FR-4: "This is the same abort path as FR-1: the interface closes before an answer" | T2 | `rl.once("close", onClose)` `:2346` → `abort()`; **(V)** falsifier (7) (catch removed) → (d) `FR-4: status 130 (read 1); FR-4: zero trace lines` red, restored `cmp` ok, 4/4 green after | PASS |
| FR-4: "It replaces the old silent exit `0`" | T2 | T2 red run at `ad7022a` read `0`; DD-6 probe | PASS |
| FR-4: "Whether non-interactive `init` should be a usage error (exit `2`) instead remains proposal Follow-up 1" | — | `proposal.md:127` Follow-up 1 present, unchanged in substance | PASS |
| FR-4 scenario: "GIVEN … `/dev/null` and a scratch `HOME` / WHEN the wizard reaches its first question / THEN … `130` / BUT … no `AbortError` or trace / AND IT MUST create no install target" | T2 | `withScratch` + `HOME`/`USERPROFILE` env; **(V)** output (785 B) contains the `Which tool` prompt; the four checks | PASS |
| NFR-1: "MUST make no network call … seeded with a fresh update cache … byte-identical after the run" | T1, T2 | `offlineChecks` in all four cases (`net.log` absent + `Buffer.equals`); preload via `NODE_OPTIONS=--require` in both the `.exp` and (d); F4 red (`net.log holds get`); **(V)** `netlog=absent seed_same=yes` in every probe | PASS |
| NFR-2: "runs on a real pty through `expect`" / "MUST skip on Windows with a printed reason" / "MUST copy its transcripts to `AKILI_PTY_LOG_DIR`" / "MUST live in its own test and fixture files" | T1 | `spawn /bin/sh` in the fixture; `skipReason()` `:39–44` → `t.skip("win32: no pty")` on (a)–(c) only (run 1 executed the no-`expect` branch); copy executed **(V)** §5; own files, `routing-pty.test.js` untouched | PASS (win32 leg → V-2) |
| NFR-3: "`package.json` keeps declaring no `dependencies`" | T1, T2 | diff empty; no key | PASS |
| Gate rows §7: FR-1 / one-branch / FR-2 / FR-3 / NFR-1 / **FR-4 (non-pty, T2)** / Ubuntu flake (accepted risk) | — | each owned and evidenced above | PASS (flake row → V-2) |

## 7. Linting & Code Quality (4R — advisory)

All items are **advisory** (no spec violation); none gates archive.

| # | Lens | Finding | Status |
|---|---|---|---|
| A1, A2 | Reliability / Readability | one-newline and prompt-line strictness | Closed by `/akili-test` (`22dc7ed`) |
| A3 | Reliability | A non-abort exception inside init's `try` rethrows (`:2089`) without `rl.close()` — pre-existing shape; belongs to proposal Follow-up 2 (`main().catch`) | Open, carried |
| A4 | Resilience | The `closed` promise (`:2343`) relies on `Promise.race` for its rejection handler; run 1 showed removing only the race turns it into an unhandled rejection (`RC=1`). A one-line comment would help | Open, carried |
| A5 | Readability | `questionOrAbort`'s comment `:2335` still cites `FR-5 / DD-5 (Pivot B)` — IDs from `changes/routing-keyboard-select` — under the `@akili-spec bugfix/init-ctrlc-abort` marker `:2331`, whose own spec has a different DD-5 and now a DD-6. Suggest naming the source spec | Open, carried (`/akili-quick` copy-edit candidate) |
| A6 | Readability | CHANGELOG: "`docs/cli.md` → *Init* states the Ctrl-C contract" now understates — `docs/cli.md:18` also states the end-of-input contract. Not false (T2 Reviewer advisory) | Open, new |
| A7 | Readability | `test/init-pty.test.js:3–9` header: "T1 — … (requirements FR-1, FR-2, NFR-1..3; design DD-3, DD-4) … Skips with a printed reason on win32…" — the file now also holds FR-4 / DD-6 case (d), which never skips. The per-case comment `:219–220` is correct | Open, new |
| A8 | Reliability | Case (d) covers the null device only; the "closed pipe" wording in FR-4 is evidenced by validator probes (run 1 and this run), not by a test. Also (d) does not assert the first prompt was printed (the scenario's WHEN); the trace/`AbortError` checks make an earlier crash fail anyway | Note only |
| — | Risk | `no-network.js` wraps `https` only; `getLatestVersion` uses `https.get` `:1874`, the only live path | Note only |

Structural: no new dependency; no `process.exit()` (DD-2); helper removes its listener in `finally` and never closes `rl`; unrelated code preserved (the only non-helper hunks are the two prompts re-indented into one `try`).

## 8. Design Conformance

| Item | Shipped | Result |
|---|---|---|
| §3 `questionOrAbort(rl, prompt, out)` just above `makeRoutingIo`; races `rl.question` vs `close`; maps `ABORT_ERR`/`AbortError`; one `\n`; removes its listener; never closes `rl` | `:2334–2356` exactly so | PASS |
| §3 `makeRoutingIo.ask` keeps `createInterface` + `finally { rl.close() }`; output and errors byte-identical | `:2363–2370`; moved comment's "runRouting" → "the caller" is the only textual change | PASS |
| §3 `runInteractiveInit` both questions through the helper with `process.stdout`; abort → `rl.close()`, `exitCode = 130`, return before any install argument | `:2051`, `:2073`, catch `:2083–2088`; `isLocal` `:2092` after the `try` | PASS |
| §3 `runRouting` catch unchanged | `:2408–2412` not in the diff | PASS |
| §6 (amended): Ctrl-C → 130; "End-of-input before an answer also exits **130** (was 0)"; "Prompts, answers and the exit codes of every other path are unchanged" | Ctrl-C and EOF both 130 **(V)**; answered path `RC=0` (c) | PASS |
| §9: `AKILI_SELECT_ABORT` produced by three sites, consumed by two | producers `:2303`, `:2341` (via `:2366` and `:2051`/`:2073`); consumers `:2084`, `:2410`; `git grep` outside `docs/specs` → `bin/akili.js` only | PASS |
| DD-1 verbatim extraction; SIGINT / `main().catch` rejected | logic verbatim; no SIGINT listener; no top-level catch | PASS |
| DD-2 one interface, no `process.exit()` | one `createInterface` `:2040`; `exitCode` only | PASS |
| DD-3 cases (a)(b)(c), own helpers, skip rule, `\n` probe, transcript tail, 7 + 2 option lines | all present; `TOOL_OPTIONS` 7, `SCOPE_OPTIONS` 2 | PASS |
| DD-4 seed `{checkedAt, latest}`, `NODE_OPTIONS=--require`, `AKILI_NET_MARKER=<root>/net.log`, marker absent + byte-identical | `withScratch`, `.exp:19–22`, (d) env `:238–244`, `offlineChecks` | PASS |
| DD-5 `docs/cli.md` sentence; CHANGELOG names both old behaviors | `docs/cli.md:17` verbatim; CHANGELOG "observed on 22.23.3 … `AbortError` … exited `1`; … 22.12.0 … exited `0` silently" | PASS |
| **DD-6** no code change; non-pty test pins status 130 / no trace / nothing installed; CHANGELOG + `docs/cli.md` state it | `2759215` touches no `bin/`; (d); CHANGELOG EOF clause; `docs/cli.md:18` | PASS |
| Reversion challenge | n/a holds; the EOF exit-code change is now a listed decision (DD-6), not an unlisted one | PASS |

**Premise ledger**

| P | Status at `3568dd4` |
|---|---|
| P-1, P-2, P-3, P-5, P-6, P-7, P-8, P-9 | Verified at spec time; nothing in the diff contradicts them (P-6 re-exercised by all four cases' `offlineChecks` and my probes; P-9 by `init-pty` as TAP 66–69 in both `npm test` runs) |
| P-4 (Node 18 closes without settling) | **Open to CI** as approved. Supplementary: Node 18.20.8 `init-pty` 4/4 this run (3/3 by `/akili-test` and run 1) — consistent, not the formal settlement |

**V-1 correction closure (validator's own sweep)**

`grep -n -i -E "unchanged|every other path|silent exit 0|silently|EOF|out of scope"` over the six spec documents, `CHANGELOG.md`, `docs/cli.md`:

| Site | State |
|---|---|
| `proposal.md:13` Status, `:38` Proposed Outcome EOF row, `:49` Non-Goals bullet | Amended, dated "Pivot V-1", original text quoted |
| `proposal.md:37` "Normal answers … unchanged", `:135` "normal `init` flow is unchanged" | Still true (answered path, (c)) |
| `proposal.md:114` Option C "silent exit 0", `:26`/`:36` old behavior | Historical statements of the baseline — still true |
| `proposal.md:127` Follow-up 1 "out of scope" | Still valid: only the exit-2 usage-error question |
| `requirements.md:36` §4 out-of-scope bullet | Amended; FR-4 `:89–100`, gate row `:118`, index `:131` added |
| `requirements.md:70`, `:79`, `:127` "unchanged" (FR-2, FR-3) | Still true |
| `design.md:43` §6 | Amended; `:66` DD-6 added; `:25`/`:62` "Unchanged" (`runRouting`) still true |
| `tasks.md:46` `<<EOF>>` marker, `:76` "times out silently" | Unrelated uses |
| `execution.md:83` "Follow-ups … stdin EOF before an answer" | **Stale wording** (V-4): after the pivot only the exit-2 question is a follow-up |
| `CHANGELOG.md:11` | EOF clause present ("now also exits `130` … where it was a silent `0` on the baseline") |
| `docs/cli.md:17–18` | Both contracts stated; `docs/cli.md:402+` "unchanged" hits belong to `akili routing` wrapper tokens |

Backward: no document cites `design.md` §6 by anchor except T2's "Design refs" (intended). The pivot `git diff` (`e9838e9`) removed exactly six lines, each replaced in place: proposal Status row, EOF row, Non-Goals bullet opening, requirements §4 bullet, design §6 sentence, tasks budget row — the Pivot Record lists five of them (omits the Status row; all six intended). EOF probes re-run at HEAD: §2.

**Cross-document figure check**

| Figure | requirements | design | tasks | execution | test-report | CHANGELOG | Shipped / probe | Result |
|---|---|---|---|---|---|---|---|---|
| Tasks | — | 1 (+1 by pivot, DD-6) | 2 (Doc Control); **"One task" at `:23`** | 2/2 | — | — | T1, T2 | WARN V-4 (`tasks.md` §2 stale) |
| LOC | — | ~180 (tripwire ~230) | T1 ~180, T2 ~30 | ≈+433/−47 (T2 ≈+42/−1) | +18 | — | per-commit 373/46 + 18/0 + 42/1 = 433/47; net 432/46 | PASS |
| `bin/akili.js` delta | — | ±25 | ±25 | +70/−44 | — | — | +70/−44; T2 0 | PASS |
| Review rounds | — | 2 | 2 (pivot: "2 total") | 3 (round 3 user-approved) | — | — | — | PASS (recorded) |
| Cases | — | "three pty cases" §4; non-pty in DD-6 | 3 + (d) | 3/3 → 4/4 | 4/4 | "three cases" (pty) + "A fourth case, which needs no pty" | 4 `test(` (3 pty + 1 non-pty) | PASS (design §4 wording → V-4) |
| Suite total | — | — | — | 263 → 264 | 263 → 264 | — | 264/264 ×2 **(V)** | PASS |
| `routing-pty` | — | — | 6/6 | 6/6 | 6/6 | "passes as before" | TAP 110–115 (109 is `routing-pty-evidence`) | PASS |
| Falsifiers | — | — | (1)–(6), (7) | F1–F6, (7) | TF1, TF2, TF2b | — | (7) reproduced **(V)** | PASS |
| Node versions | 22.23.3, 22.12.0, 18 via CI | same | same | same | +18.20.8 supplementary | "observed on 22.23.3", "22.12.0" | 18.20.8 4/4 **(V)** | PASS |
| `skipReason` ref | — | — | — | — | `:39–45` | — | `:39–44` + `SKIP` `:45` | PASS |
| Exit codes documented | Ctrl-C 130, EOF 130 (FR-4) | §6 both | — | — | — | both | both **(V)** | PASS (V-1 closed) |

**Quote check — CHANGELOG `[Unreleased]` and `docs/cli.md` (KZ-002):** every clause was checked against `3568dd4`: "writes one newline" (`:2340`), "exits with code `130`" (`:2086`), "nothing is installed" (return before `isLocal`), "bare `rl.question`" (baseline), both old behaviors (T1 red run), "shared helper … extracted verbatim" (logic verbatim; comment wording edited), "before any install argument is built" ✓, "Prompt text and the answer → install mapping are unchanged" ✓, "`akili routing`'s Ctrl-C is unchanged … same helper … `test/routing-pty.test.js` passes as before" ✓ (TAP 113), "in three cases" ✓ (three pty `test(`), assertion lists for the Ctrl-C and answered cases ✓, "A fourth case, which needs no pty, runs `akili init` with stdin on the null device and asserts exit `130` with no trace line, no `AbortError` and no install target" ✓ (`:233–251`), "end-of-input before an answer (`</dev/null` or a closed pipe) now also exits `130` with nothing installed, where it was a silent `0` on the baseline" ✓ (V), "It runs offline …" ✓ (all four cases), "The three pty cases skip on Windows, or when `expect` is not on `PATH`, with a printed reason, and copy their transcripts to `AKILI_PTY_LOG_DIR` when that is set; the end-of-input case runs on every OS" ✓ (`SKIP` guard on (a)–(c) only; copy executed), "`docs/cli.md` → *Init* states the Ctrl-C contract" ✓ but understates (A6), "No new dependency; nothing under `test/` enters the package tarball" ✓ (V). `docs/cli.md:17` and `:18` ✓ (V). **No overstatement, no omission.**

**Proposal alignment (as amended):** Intent ✓; Proposed Outcome rows ✓ incl. the amended EOF row; Scope bullets ✓; Non-Goals: EOF exit code in scope (amended) ✓, exit-2 usage error still out of scope ✓ (Follow-up 1 untouched; no `isTTY` guard, no exit 2 anywhere in the diff), `main().catch` untouched ✓, no wizard redesign ✓; Success criteria ✓.

## 9. Test Evidence Summary

| Source | What it proves | Reused / re-run |
|---|---|---|
| `execution.md` T1 red run, F1–F6 | (a)/(b) red on RC at baseline on both 22.x; catch, race, seed, prompt text, newline load-bearing | Reused (F2 reproduced by run 1) |
| `execution.md` T2 red run, falsifier (7) | (d) red on status only at `ad7022a`; catch load-bearing on the EOF path | **(7) reproduced this run** on 22.23.3: `status 130 (read 1)` + trace; restored `cmp`-exact; 4/4 after |
| `test-report.md` §5, §7 | 4/4 on 22.23.3 / 22.12.0; 264/264 ×3 Node; TF1/TF2b; log-dir copy | `npm test` 264/264 re-run on both 22.x; `init-pty` 4/4 on 18.20.8; log-dir copy re-run |
| Validator-only probes | EOF (`</dev/null`) and piped `1\n1\n` at HEAD → `rc=130`, 0 trace, nothing installed, `net.log` absent, seed identical, on both 22.x (first attempt discarded: my subshell expanded `$PWD` after `cd`, so Node reported a missing module with `rc=1` — the same probe-fault class the Pivot Record notes) | New evidence; basis of V-1 closure |
| Not executed anywhere yet | Windows `win32` skip branch, Ubuntu CI leg, Node 18 CI leg | V-2 (accepted, first push) |

## 10. Agent Guide / Constitution Impact

`execution.md` carries no `## Constitution Impact` block. **Correct.** T1 added an internal, unexported helper inside `bin/akili.js` (design §7: no `module.exports`) and a test fixture directory following the existing `test/fixtures/routing/` convention; T2 added one test case and two doc lines. No module was created or reshaped; `AGENTS.md`'s `bin/akili.js` and `test/` bullets remain accurate; no child guide or `## Module Guides` index change is owed.

## 11. Remediation

| ID | Level | Finding | Remediation | Owner |
|---|---|---|---|---|
| V-1 | **Resolved** | EOF/piped exit code 0 → 130 was undocumented (run 1) | Pivot Protocol: amended `e9838e9`, pinned by T2 `2759215`, verified closed this run | — |
| V-2 | WARN (accepted) | P-4 Node 18 leg, Windows skip branch, Ubuntu flake signature settle only on CI at the first push | None before archive; record the CI run id in the archive note. A red Node 18 leg is a Pivot (`tasks.md` T1 *Done*) | Juan Carlos (push) |
| V-3 | WARN | `tasks.md:122` trailing blank line at EOF (`e9838e9`); `git diff --check ad7022a..HEAD` exits 2 while the working-tree form is clean | Delete the last blank line of `tasks.md` (one-byte doc edit) — fold into the `/akili-archive` commit or a `[SPEC:…]` doc commit; then `git diff --check ad7022a..HEAD` exits 0 | archive session |
| V-4 | WARN | Post-pivot stale text: `tasks.md:20–25` Task Graph "One task, no dependencies" + T1-only Skills line (T2 absent); `execution.md:83` "Follow-ups … stdin EOF before an answer"; `design.md:32` "three pty cases" without (d); `test-report.md:20` "Suites 1 (pty…)" | Doc-only: add `T1 → T2` to the graph and "Two tasks; T2 depends on T1"; reword `execution.md:83` to "non-interactive `init` as a usage error (exit 2)"; add a "(d) non-pty, DD-6" note to `design.md` §4 and `test-report.md` §2. Can ride the archive commit; does not change any delivered behavior | archive session |
| A3–A8 | advisory | §7 | None required; A5/A6/A7 are `/akili-quick` copy-edit candidates | — |

## 12. Archive Readiness Recommendation

**ARCHIVE-READY.** The fix is correct, complete and independently evidenced: Ctrl-C and end-of-input both exit 130 with one newline, no trace and nothing installed on 22.23.3 and 22.12.0 (and 18.20.8 supplementary); `akili routing` is behavior-identical through the shared helper; every FR-1..FR-4 and NFR-1..3 clause is owned by T1 or T2 and backed by a test that a falsifier turns red; builds are clean (264/264 ×2, `verify:cli`, `pack:dry-run` with 0 `test/` entries, working-tree `git diff --check`); CHANGELOG and `docs/cli.md` contain no overstatement or omission. Run 1's V-1 is closed by the Pivot and verified by this validator's own probes and sweep. The three WARNs are non-blocking: V-2 settles on CI at the first push, V-3 and V-4 are one-line documentation cleanups best folded into the `/akili-archive` commit.
