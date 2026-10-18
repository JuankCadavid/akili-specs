# Test Report: `akili init` — Ctrl-C exits 130, cleanly, on every Node

**Overall: PASS.** Every requirement has test evidence, including FR-4 (added by Pivot V-1 and pinned by T2's case (d)). 0 product bugs. 264/264 tests pass on Node 22.23.3, 22.12.0 and 18.20.8. Two strict assertions were added to close the gaps the T1 Reviewer flagged: "exactly one newline" (FR-1) and "no trailing text on the prompt" (FR-2). Each was proved by a mutation that turns it red. The one accepted gap is the Windows skip path, which this macOS host cannot run.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/init-ctrlc-abort` |
| Depth | **Lite** (Bug Mode) |
| Date | 2026-10-18 |
| Tested at | `fb27fcc` + the test-report commit (`test/init-pty.test.js` +18). **Refreshed at `2759215`** after Pivot V-1 / T2 added case (d) (FR-4) |
| Authorized by | Juan Carlos: "AUTORIZA /akili-test … commits locales, sin push ni release" |
| Host | macOS (Darwin 27.0.0), `expect` at `/usr/bin/expect`, Node via `~/.nvm/versions/node/v<v>/bin/node` |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 1 (pty regression/integration). No backend unit, frontend or E2E suite applies |
| Testers spawned | 0. **Run inline by the Leader** per the Deployment Rule (Lite depth, single bugfix suite) |
| Author TDD coverage | `test/init-pty.test.js` (T1, red → green in `execution.md`): **cited, not rewritten** |
| Added by this run | 2 strict checks in the same file: `exactlyOneNewline` (FR-1) and `promptLinesExact` (FR-2 `BUT`). Both close the Reviewer's advisories (1) and (2) from T1 |
| Skills | `tdd` falsifier discipline, applied inline. No deviation recorded: the Tester persona's skills are not needed for an 18-line assertion addition |
| Results | `init-pty` 4/4 on 22.23.3 and 22.12.0 (3/3 pty cases on 18.20.8 before T2) · `npm test` 264/264 on each of the three versions at `2759215` (263/263 before T2) · `verify:cli` exit 0 · `pack:dry-run` 0 `test/` entries · `git diff --check` clean · `package.json` unchanged |
| Product bugs | **0** |
| Lookup note | `docs/prd.md`, `docs/trd/trd.md` and `docs/ux-ui/design.md` are absent in this repo. The reference-section entry is `none` for both reference documents (no UI) |

## 3. Backend Unit Tests

n/a. The fix is a CLI interaction path that only a real pty exercises. `bin/akili.js` has no exports (design §7).

## 4. Frontend Unit Tests

n/a. No UI.

## 5. Integration Tests (real pty via `expect`)

| Command | Node | Result |
|---|---|---|
| `<node> --test --test-reporter=tap test/init-pty.test.js` | v22.23.3 | 3/3 ok, `process.version` diagnostic matches the binary |
| same | v22.12.0 | 3/3 ok |
| same | v18.20.8 | 3/3 ok (**supplementary**, see §9) |
| `PATH=<node bin>:$PATH npm test` | 22.23.3 / 22.12.0 / 18.20.8 | 264/264 each at `2759215`, including case (d); `routing-pty` 6/6 included (FR-3) |
| `AKILI_PTY_LOG_DIR=<dir> node --test test/init-pty.test.js` | v22.12.0 | 3 transcripts copied (`…-pty-init-{q1,q2,answer}.log`). NFR-2 copy observed |

**Strict-check falsifiers (this run, each restored and re-run green on both 22.x versions):**

| # | Mutation in `bin/akili.js` | Observed |
|---|---|---|
| TF1 | Helper's abort writes `"\n\n"` | (a)/(b) red on **only** `FR-1: exactly one newline (the line before SH> is the bare \`> \`)`, on both versions. The pre-existing "SH> on its own line" check stayed green, which is the gap this check closes |
| TF2 | Prompt `> ` → `> [1] ` (default marker) | All 3 red under `harness: … <<TIMEOUT: unmatched wait>>`: the fixture's CSI-tolerant prompt wait already refuses text after `>`. The drift is caught, but at the harness layer, so the new check is not exercised. TF2b replaces it |
| TF2b | Prompt `> ` → `>  ` (trailing text that still passes the prompt wait) | (c) red on `FR-2: prompt lines read exactly \`> 1\` (no default marker or trailing text)`; (a)/(b) red on the one-newline check; both versions |

## 6. E2E Tests

n/a. The pty integration cases above drive the complete user journey: launch, answer or Ctrl-C, exit code read by the shell.

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|
| FR-1 | Ctrl-C at tool question, Node ≥ 22.23: `RC=130` | pty | `init-pty` case (a) on 22.23.3 | PASS | Red at baseline: `RC=1` + trace (`execution.md` T1) |
| FR-1 | `BUT` no `AbortError` or trace line | pty | (a)/(b): `!/^\s+at /m`, `!includes("AbortError")` | PASS | Red at baseline on 22.23.3 |
| FR-1 | Ctrl-C at scope question, Node ≤ 22.12: `RC=130`, not 0 | pty | case (b) on 22.12.0 | PASS | Red at baseline: `RC=0` |
| FR-1 | Swapped question × version | pty | (a) and (b) each on both 22.x versions (+18.20.8) | PASS | — |
| FR-1 | "after writing one newline" | pty | `shellPromptOnOwnLine` (author) + `exactlyOneNewline` (this run) | PASS | TF1 / T1 F6 red |
| FR-1 | `AND IT MUST` create no install target (HOME and cwd) | pty | `noInstallTarget` in (a)/(b) | PASS | `.config` checked whole (stricter than `.config/opencode`) |
| FR-2 | Answered `1`/`1` → global Claude install, exit 0 | pty | case (c): `RC=0`, `HOME/.claude/commands`, empty cwd | PASS | — |
| FR-2 | Prompt text unchanged | pty | (c): 9 option lines verbatim | PASS | T1 F5 red |
| FR-2 | `BUT` no added prompt, default marker or trailing text | pty | (c): `promptLinesExact` (exactly two `>` lines, each `> 1`) | PASS | TF2b red |
| FR-3 | Routing typed-question Ctrl-C stays `RC=130` | pty | `test/routing-pty.test.js` `pty-fallback.exp dumb` case, inside `npm test` | PASS (3 Node versions) | T1 F2 red on 22.12.0 |
| FR-4 | `init` with stdin at EOF exits `130` | non-pty (`spawnSync`, stdin = null device) | `init-pty` case (d), all OSes (no `SKIP`) | PASS (22.23.3, 22.12.0; 18.20.8 via `npm test`) | Red at baseline: `status 130 (read 0)`; falsifier (7) red. T2 in `execution.md` |
| FR-4 | `BUT` no `AbortError` or trace line; `AND IT MUST` no install target | non-pty | (d): trace/`AbortError` over stdout+stderr, `noInstallTarget` | PASS | — |
| NFR-1 | No network call; seed byte-identical | pty + non-pty | `offlineChecks` in all 4 cases (`net.log` absent + `Buffer.equals`) | PASS | T1 F4 red (`net.log holds get`) |
| NFR-2 | Real pty via `expect`, own files | pty | `test/init-pty.test.js` + `test/fixtures/init/*` | PASS | — |
| NFR-2 | Transcript copy to `AKILI_PTY_LOG_DIR` | command | env-var run in §5 | PASS | — |
| NFR-2 | Skip with a printed reason on win32 / no `expect` | code read | `skipReason()` `:39–45` → `t.skip(SKIP)` | **Not executed** | Accepted gap §9; the CI `windows-latest` leg exercises it at push |
| NFR-3 | No new dependency | command | `git diff --stat dd23554.. -- package.json` → empty | PASS | — |

## 8. Remediation

None. No failures, no product bugs.

## 9. Accepted Gaps

| Gap | Why | Covered by |
|---|---|---|
| Windows skip path (NFR-2) never executed here | macOS host. A `win32` branch cannot be faked without editing `process.platform` | CI matrix `os: [ubuntu-latest, macos-latest, windows-latest]` (`.github/workflows/ci.yml:30`) at the first push; Juan Carlos owns the push |
| P-4 (Node 18) formal settlement | The approved spec routes it to the CI `node: [18, 22]` leg. **Supplementary local evidence:** Node 18.20.8 → `init-pty` 3/3 and `npm test` 263/263 on macOS. That points toward P-4 holding, but CI's Linux/Windows legs remain the gate | CI at the first push |
| Ubuntu pty flake signature | Open in `bugfix/pty-harness-ubuntu-flake` (accepted risk in requirements §7). A red Ubuntu CI leg is read from the transcript artifact first | — |
