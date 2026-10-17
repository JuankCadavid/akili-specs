# Validation Report — Keyboard multi-select for `akili routing` prompts

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/routing-keyboard-select` |
| Depth | Standard (compact) |
| Validated at | `5c3996a` (pushed 2026-10-16; CI run `38983739454`) |
| Validator | Claude Fable 5.1 (session) — author ≠ auditor: Implementers ran on `sonnet`/`opus`; this validator wrote no code |
| Date | 2026-10-16 |
| Inputs | `requirements.md` (FR-4 amended 2026-10-16), `design.md`, `tasks.md` (4/4 `[x]`), `execution.md` (4 PASS entries + §3 summary), `proposal.md`; no `test-report.md` (suites were written test-first inside the tasks) |
| Verdict | **NOT archive-ready — 1 FAIL (CI red on Node 22.23.3), 2 WARN; remediation is a spec clause + one test case (or one small product change, user's call)** |

## 2. Summary

| Level | Count | What |
|---|---|---|
| **FAIL** | 1 | **V-1** — CI red on `ubuntu-latest / Node 22` and `macos-latest / Node 22`: pty case 4 asserts comma-path Ctrl-C → `RC=0`; on Node 22.23.3 the exit is **1** with an `AbortError: Aborted with Ctrl+C` stack trace. Reproduced locally under 22.23.3 **at the baseline commit `dbdccea` too** — pre-existing Node behavior, not a regression; but FR-5's `AND IT MUST … exit 0` clause, premise P-5, and the test encode a Node-version-dependent value |
| **WARN** | 2 | **V-2** — pty case 2 returned `shellRc = null` once on `ubuntu-latest / Node 22` (a wait timed out; passes locally on 22.23.3 and 22.12.0 → flake candidate, needs 3/3 on a re-run). **V-3** — `design.md` §11 budget (~430 LOC) vs actual ~860 — all test code; recorded in `execution.md` §3, no tripwire fired at a gate |
| PASS | all else | Tasks, files, build, requirement clauses, design conformance, docs, validator probes (`--json` predicate member; keyboard pre-fill + order rule) |

## 3. Task Completion

| Task | Status | Evidence |
|---|---|---|
| T1 reducer + seam | PASS | `execution.md` entry: Reviewer PASS, 5 falsifiers red, 250/250 |
| T2 raw-mode plumbing | PASS | Reviewer PASS, 4 falsifiers red, pty `RC=130`/`stty echo`, 251/251 |
| T4 docs | PASS | FAIL → PASS (two KZ-002 clauses fixed), greps 3/0/12 |
| T3 pty suite + CI | PASS (local) / **see V-1, V-2** | Reviewer PASS, 5 falsifiers incl. 3×3 predicate enumeration, 6/6 on macOS 22.12 — CI reveals a Node-22.23 divergence in case 4 |

## 4. File Existence (design §4)

All 14 paths present: `bin/routing.js`, `bin/akili.js`, `test/routing.test.js`, `test/routing-io.test.js`, `test/routing-pty.test.js`, four `pty-*.exp` + `no-rawmode.js`, `.github/workflows/ci.yml`, `docs/cli.md`, `CHANGELOG.md`, `AGENTS.md`. Design §7 names resolve in code: `canKeySelect`/`keySelect`/`makeRoutingIo` (3), `keyToken`/`selectStep`/`selectLines`/`orderPicked` (4); `@akili-spec` markers at `bin/routing.js:938`, `bin/akili.js:2244`, `:2341`. `npm pack --dry-run` → 280 files, no `test/` content.

## 5. Build Integrity

| Check | Result |
|---|---|
| `node --check bin/akili.js bin/routing.js` | PASS |
| `npm test` (local, Node 22.12.0) | PASS — 258/258, 0 skipped |
| `npm run verify:cli` | PASS — 11 commands / 24 skills / 8 resources |
| `npm run pack:dry-run` | PASS — 2.2 MB, 280 files |
| `git diff --check` | PASS |
| `package.json` `dependencies` | PASS — key absent (NFR-1) |
| **CI `38983739454`** | **FAIL 2/6** — `ubuntu-latest/22` (cases 2 and 4), `macos-latest/22` (case 4); `ubuntu/18`, `macos/18`, `windows/18`, `windows/22` green. Windows: `# skipped 7` with printed reasons (NFR-3 as designed). Ubuntu installed `expect 5.45.4-3` via the new step — **P-10 settled** |

## 6. Requirement Coverage (clause level)

| Requirement / clause | Owner | Evidence | Result |
|---|---|---|---|
| FR-1 rows (↑/↓ wrap, space, `a`, Enter, Ctrl-C, other key ignored, redraw, result order) | T1, T2, T3 | reducer unit tests; pty `❯ [x] 5) Cursor`, raw `ESC[7A` in the host block | PASS |
| FR-1 *Hosts 1 and 5* incl. BUT no echo/second copy, AND no `>` line | T3 case 1 | byte-equal answers file vs flags run | PASS |
| FR-1 *Pre-checked kept by Enter* | T1 unit + **validator probe** | previous `hosts: ["cursor","claude"]` → list pre-marks rows 1 and 5; Enter → Cursor's roster asked first (order kept) | PASS |
| FR-1 *`a` toggles all, wrap* | T1 | unit | PASS |
| FR-2 keyboard (guidance, cleared on toggle, BUT not a retry) | T1, T3 case 2 | unit + pty guidance line | PASS (V-2 flake on one runner — WARN) |
| FR-2 comma (new text, `/nothing selected/` green) | T1 | unit | PASS |
| FR-3 (deep equality, 3 calls, BUT no single-choice, AND filtered preChecked) | T1 | `canonicalAnswers` equality; `selectCalls` 3; `[-1,0,9]→[0]` | PASS |
| FR-4 predicate — stdin pipe · no `setRawMode` · output not TTY · `TERM=dumb` | T2 lock, T3 cases 5/6/4 + **validator probe** | frozen stderr lock; 3×3 enumeration each member red only in its case; `--json` on a pty → keyboard list on stderr, `--json 2>file` → comma form (`comma=1 cursor=0`) | PASS |
| FR-4 (amended) byte-identical fallback except the FR-2 text | T3 cases 4–6 | comma prompts rendered | PASS |
| FR-5 restore on confirm / Ctrl-C / throw | T2, T3 case 3 | `RC=130`, `stty echo`; throw path = Reviewer-read gap (accepted in tasks §3) | PASS (accepted gap) |
| FR-5 *Ctrl-C aborts* — 130, nothing written, no stack trace | T3 case 3 | green on all 6 CI jobs where run | PASS |
| **FR-5 `AND IT MUST leave the comma path's Ctrl-C behavior as it is today (exit 0, nothing written)`** | T3 case 4 | **Node-dependent**: 22.12 / 18 → exit 0, no trace; **22.23.3 → exit 1 + `AbortError: Aborted with Ctrl+C` trace — at HEAD *and* at `dbdccea`**. "Nothing written" holds on both (tree `.git` only) | **FAIL (V-1)** — the clause pins an environment fact |
| FR-5 *Questions alternate* | T3 case 1 | typed `claude` echoes after two selects | PASS |
| FR-6 docs | T4 | quote-checked; KZ-002 pass on attempt 2 | PASS |
| NFR-1 no dependency | T2 | probe | PASS |
| NFR-2 non-TTY budget | T2 | 119/74/71 ms | PASS |
| NFR-3 cross-platform | T3 + CI | Linux `expect` installed; Windows skips with reason; **Node 22.23 divergence** | WARN → resolves with V-1 |
| NFR-4 pure reducer | T1 | unit | PASS |
| NFR-5 Node 18 | CI | 18.20.8 legs green | PASS |

## 7. Linting & Code Quality (4R, advisory — carried from `execution.md`)

| Lens | Finding | Status |
|---|---|---|
| Resilience | `ESC[nA` redraw assumes no soft-wrap (< ~60 cols leaves stale lines) | advisory, documented in `cli.md` |
| Reliability | `selectStep` with empty `options` → `NaN` cursor (no caller) · concurrent `select` unreachable · `skipReason` conflates missing `which` with missing `expect` | advisory |
| Risk | `apt-get` step ties Linux jobs to mirror health (`--no-install-recommends`, retries) | advisory |
| Readability | three reducer cases assert state without `selectLines`; tasks.md T3 scope says `a · Enter` where the fixture correctly does `a · ↑ · space` | advisory, recorded |
| **New (this validation)** | **`akili init` (`runInteractiveInit`) and every other `readline/promises` question in `bin/akili.js` share the Node ≥ 22.23 Ctrl-C behavior: `AbortError` trace + exit 1** — pre-existing, outside this spec | advisory → **follow-up bug proposal** |

## 8. Design Conformance

| Check | Result |
|---|---|
| §7.1 / §7.2 function tables vs code | PASS — names, signatures, per-question `readline`, `restore()` on all paths, tagged abort |
| DD-2 order rule end-to-end | PASS — validator probe (Cursor-first roster after Enter on `[cursor, claude]`) |
| DD-3 four members incl. stderr under `--json` | PASS — validator probe |
| DD-5 typed-path Ctrl-C "unchanged" | PASS as stated (HEAD ≡ baseline on each Node) — but "unchanged" = exit 1 + trace on Node ≥ 22.23 (V-1) |
| §6 table / FR-4 amendment alignment | PASS |
| §11 budget vs actual | WARN (V-3) — ~860 vs ~430, test code only; product 179 ≈ ~140 estimate |
| §12 Premise Ledger | **P-5** ("Ctrl-C today exits 0") was true on Node 22.12 only — needs a Node-version qualifier (V-1 remediation). **P-10** settled by CI run `38983739454`: Ubuntu needed and got `apt-get install expect`; Windows skipped 7 with reasons — write `Verified at 5c3996a / Settled by run 38983739454` |
| Proposal alignment | PASS — Option A delivered; non-goals respected; success criteria met except "`TERM=dumb` … uses the comma form" (met) and the implicit "no behavior change on the comma path" which Node 22.23 reinterprets (V-1) |
| Cross-document figures | Budget figures consistent (design §11 ↔ tasks §1); `execution.md` §3 records the LOC overrun honestly |

## 9. Test Evidence Summary

| Suite | Local (22.12.0) | CI 18.20.8 | CI 22.23.3 |
|---|---|---|---|
| `test/routing.test.js` (unit, 136) | 136/136 | ✓ | ✓ |
| `test/routing-io.test.js` (subprocess) | ✓ | ✓ | ✓ |
| `test/routing-pty.test.js` (6 cases) | 6/6 | ✓ ubuntu/macos; Windows skip 7 | **case 4 red** (ubuntu, macos); case 2 red once (ubuntu) |
| Local under 22.23.3 (nvm) | 5/6 — case 4 `1 !== 0`; case 2 green | — | — |

## 10. Agent Guide / Constitution Impact

No `## Constitution Impact` block (no module created or reshaped). `AGENTS.md:12` already names the reducer (T4). No child guides. CodeGraph re-index pending for `/akili-archive`.

## 11. Remediation

| # | Finding | Options | Recommendation |
|---|---|---|---|
| **V-1** | FR-5 pins comma-path Ctrl-C to exit 0; Node ≥ 22.23 gives exit 1 + stack trace at baseline and HEAD; CI red on both Node 22 jobs | **(A) Spec + test correction, no product change:** amend the FR-5 clause to "unchanged relative to the baseline on the same Node — never the keyboard abort path (never 130), nothing written"; add a Node-version note to P-5; case 4 asserts `RC !== 130` + tree unchanged + no `❯`, reporting the observed RC via `t.diagnostic`. Ships the documented Node 22.23 stack trace as-is. **(B) Product fix (scope growth — needs approval; Pivot-style amendment):** in `makeRoutingIo.ask`, catch `readline`'s `AbortError` (`code === "ABORT_ERR"`) and rethrow it tagged `AKILI_SELECT_ABORT` → every Ctrl-C in `akili routing` exits **130 cleanly, no trace, on every Node**; FR-5 clause flips to "either path exits 130, nothing written"; case 4 asserts `RC=130`; ~8 LOC + 1 assertion; `akili init` stays a separate follow-up | **(B)** — (A) documents a stack trace as the contract; (B) makes the behavior uniform and is the smaller user-facing surprise. Either way re-run CI |
| **V-2** | case 2 `shellRc = null` once on ubuntu/22 | Re-run the failed jobs (`gh run rerun --failed`); if it recurs, raise the fixture's per-wait timeouts toward the 30 s `spawnSync` ceiling | Re-run after V-1 lands |
| **V-3** | LOC budget overrun (test code) | None for this spec; kaizen lesson at archive: budget pty harnesses at ~70 LOC per case including its fixture | Accept |
| adv. | `akili init` Ctrl-C trace on Node ≥ 22.23 | `/akili-propose` as a Bug (pre-existing) | Follow-up |

## 12. Archive Readiness Recommendation

**Not yet.** Resolve V-1 (A or B), re-run CI to six green (also clears V-2 or confirms it), write P-10's settlement into `design.md` §12, then `/akili-archive changes/routing-keyboard-select`. Everything else is archive-ready: 4/4 tasks with Reviewer PASS, clause-level coverage closed, validator probes green, docs quote-checked, no dependency added.
