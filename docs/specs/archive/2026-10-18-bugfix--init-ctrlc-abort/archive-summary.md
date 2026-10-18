# Archive Summary — `akili init` Ctrl-C exits 130

**Outcome: delivered.** Ctrl-C at either `akili init` question, and end-of-input before an answer, now write one newline and exit `130` with nothing installed and no stack trace. This holds on Node 22.23.3, 22.12.0 and 18.20.8 (local). Validation run 2 is archive-ready: 0 FAIL, 3 WARN. V-3 and V-4 were fixed in the archive commit, and V-2 settles on CI.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/init-ctrlc-abort` |
| Depth / Type | Lite · Bug Mode |
| Approval Mode | `gated` |
| Branch | `JuankCadavid/init-ctrlc-bug` (spec branch; `Default Branch: master`). Local commits only: no push, merge, release, tag or publish |
| Archive authorized by | Methodology, by delegation from Juan Carlos (2026-10-18) |

## 2. Original Spec Path

`docs/specs/bugfix/init-ctrlc-abort/`

## 3. Archive Date

2026-10-18 → `docs/specs/archive/2026-10-18-bugfix--init-ctrlc-abort/`

## 4. Final Status

| Phase | Result | Commit |
|---|---|---|
| Proposal → tasks | Approved (Option A; EOF and `main().catch` deferred) | `2e6de45` … `ad7022a` |
| T1 — shared `questionOrAbort`, init exit 130, pty regression test | PASS, attempt 1 | `fb27fcc` |
| `/akili-test` | PASS: 2 strict checks added (one newline, exact prompt line) | `22dc7ed` |
| `/akili-validate` run 1 | Not ready: **V-1 FAIL** (EOF exit 0 → 130, contradicting a declared non-goal) | — |
| Pivot V-1 | User: "Accept, amend docs": FR-4, DD-6, T2 | `e9838e9` |
| T2 — pin EOF → 130 | PASS, attempt 2 (attempt 1 FAIL on a CHANGELOG sentence's scope) | `2759215` |
| Re-test | test-report refreshed (264/264) | `3568dd4` |
| `/akili-validate` run 2 | **Archive-ready**: 0 FAIL, 3 WARN | `1a0dda7` |

## 5. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | Ctrl-C at either question: one newline, exit 130, no trace, nothing installed, on Node ≥ 22.23 and ≤ 22.12 |
| FR-2 | Answered wizard unchanged: prompts and mapping verbatim, exact `> 1` prompt lines |
| FR-3 | `akili routing` typed-question Ctrl-C still 130 (`routing-pty` 6/6) |
| FR-4 | End-of-input before an answer: exit 130, nothing installed (added by Pivot V-1) |
| NFR-1..3 | Offline test (seeded cache + `https` preload), real-pty harness in its own files with Windows/no-`expect` skip and `AKILI_PTY_LOG_DIR` copy, no new dependency |

## 6. Files Changed Summary

| File | Change |
|---|---|
| `bin/akili.js` | New `questionOrAbort` helper above `makeRoutingIo` (logic moved from `makeRoutingIo.ask`). `runInteractiveInit` routes both questions through it; an abort sets `exitCode = 130` before any install. Comment re-scoped at archive (A5) |
| `test/init-pty.test.js` | **New.** Cases (a)–(c) run on a pty; case (d), added in T2, runs without a pty. Header re-scoped at archive (A7) |
| `test/fixtures/init/pty-init.exp`, `no-network.js` | **New.** `expect` driver and the offline preload |
| `docs/cli.md`, `CHANGELOG.md` | Ctrl-C and end-of-input contract; `[Unreleased]` `### Fixed` patch entry |

Totals: about +433 / −47 lines across T1, `/akili-test` and T2 (budget ~180; the T1 overrun was accepted by the user).

## 7. Test Evidence Summary

| Evidence | Result |
|---|---|
| `npm test` | 264/264 on Node 22.23.3, 22.12.0 and 18.20.8 (re-run after the archive fixes: 264/264 on both 22.x) |
| Regression reds at baseline | T1: (a)/(b) red on RC (22.23.3: 1 + trace; 22.12.0: 0). T2: (d) red on status (0) |
| Falsifiers | T1 F1–F6 (F3 known-inert) · `/akili-test` TF1, TF2b · T2 (7). All observed red, then restored green |
| Product bugs | 0 |

## 8. Validation Summary

Run 2 (`fable`, HEAD `3568dd4`): **archive-ready**, 0 FAIL, 3 WARN, 0 BLOCKED. Run 1's V-1 was resolved by the pivot; the validator's own correction-closure sweep and EOF probes confirmed it.

## 9. Accepted Warnings Or Follow-Ups

| Item | Status |
|---|---|
| V-2: P-4 (Node 18 CI leg), Windows skip branch, Ubuntu pty flake signature | **Open → CI at Juan Carlos's first push.** A red Node 18 leg is a Pivot, not a follow-up edit |
| V-3: `tasks.md` trailing blank line | Fixed in the archive commit |
| V-4: pre-pivot wording (`tasks.md` graph, `execution.md` follow-ups/next, `design.md` §4, `test-report.md` suites) | Fixed in the archive commit |
| A5: `questionOrAbort` comment cited only routing's FR-5/DD-5 | Fixed in the archive commit (now also FR-1/DD-1 and FR-4/DD-6) |
| A7: test header described T1 only | Fixed in the archive commit |
| A3: non-abort exception in init's `try` rethrows without `rl.close()` (pre-existing) | Open: proposal follow-up `main().catch` |
| A4: comment on `closed` promise relying on `Promise.race` for its handler | Open: advisory |
| A6: CHANGELOG "states the Ctrl-C contract" understates `docs/cli.md` (it also states EOF) | Open: advisory, not false |
| A8: "closed pipe" variant evidenced by probes, not by the test | Open: advisory |
| Proposal Follow-up 1: non-interactive `init` as a usage error (exit 2) | Open: separate proposal |
| Proposal follow-up: top-level `main().catch` | Open: separate proposal |

## 10. Historical Notes

- **Pivot V-1.** Extracting routing's close-race into a shared helper also turned end-of-input into an abort. The proposal had declared that path "unchanged", and no Reviewer caught it; the independent validator found it with one `</dev/null` probe. The user accepted the new behavior and the docs were amended. See kaizen lesson KZ-bugfix--init-ctrlc-abort-1.
- **Budget.** Tasks went from 1 to 2 (pivot), review rounds from 2 to 3 (round 3 user-approved), and LOC from ~180 to ~433, mostly test harness (KZ-bugfix--init-ctrlc-abort-2).
- **Runtime event.** Validation run 2's first validator died on a provider session limit before writing anything. A fresh `fable` validator re-ran the audit after the session restarted (runtime ladder rung 4).
- **Personas.** `.agents/` is gitignored, so it was copied from the main checkout into this worktree (same precedent as `changes/antigravity-argon-registry`).
