# Archive Summary — Keyboard multi-select for `akili routing` prompts

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/routing-keyboard-select` |
| Archive Date | 2026-10-16 |
| Archived at | `b1fa927` (master) |
| Depth / Type / Mode | Standard (compact) · Change · `gated` |
| Final Status | **Complete — archive-ready** (validation re-run at `973e801`: 0 FAIL, 2 accepted WARN) |
| Release class | patch (CHANGELOG entry under Unreleased) |

## 2. Outcome

`akili routing`'s two multi-select questions take keyboard input on a capable terminal (↑/↓ wrap, space, `a`, Enter; guidance line on an empty Enter; in-place redraw), behind a new `io.select` seam and a four-member capable-terminal predicate; everywhere else the comma form runs as before (empty-reply error text now carries guidance). Ctrl-C ends every question — keyboard or typed — with exit 130, nothing written, no stack trace, on Node 18 / 22.12 / 22.23 (Pivot B). No runtime dependency added.

## 3. Requirements Delivered

| ID | Delivered by | Evidence |
|---|---|---|
| FR-1 keyboard multi-select | T1 (pure reducer), T2 (raw-mode plumbing), T3 (pty) | unit + pty suites; CI six green |
| FR-2 guidance on empty confirm (both forms) | T1, T3 | unit; pty case 2 |
| FR-3 `io.select` seam, identical answers | T1 | `canonicalAnswers` deep-equality |
| FR-4 predicate + fallback (amended ×2: FR-2 text, Ctrl-C) | T2, T3 | frozen stderr lock; pty cases 4–6; 3×3 enumeration falsifier; validator probes (`--json`, pre-fill) |
| FR-5 restore + Ctrl-C 130 (amended by Pivot B to both forms) | T2, T3, T5 | pty cases 3–4 on three Nodes |
| FR-6 docs | T4 (2 attempts), T5 | KZ-002 quote-checks |
| NFR-1…5 | T2, T3, T6, CI | no `dependencies`; non-TTY < 2 s; six-job matrix; pure reducer; Node 18 legs |

## 4. Files Changed (from `execution.md`)

| Area | Files |
|---|---|
| Product | `bin/routing.js` (+71/−2) · `bin/akili.js` (+108/−6, then T5 `ask` race +~20) |
| Tests | `test/routing.test.js` (+218) · `test/routing-io.test.js` (+23) · `test/routing-pty.test.js` (new) · `test/fixtures/routing/pty-{keyboard,empty-confirm,ctrl-c,fallback}.exp`, `no-rawmode.js` (new) |
| CI / docs | `.github/workflows/ci.yml` (+7 Linux `expect` step) · `docs/cli.md` *Routing* · `CHANGELOG.md` Unreleased · `AGENTS.md:12` |

## 5. Test Evidence

| Suite | Result |
|---|---|
| `npm test` (unit + subprocess + pty) | 258/258 locally on 22.12.0; pty 6/6 also on 18.20.8 and 22.23.3 |
| CI `38987129273` (`8e246b5`) | six green, attempts 1 and 2; Ubuntu `<<BACK-IN 2–11 ms>>`; Windows skips 7 with printed reasons |
| Falsifiers | every task's executed and quoted (T1 5, T2 4, T3 5 incl. 3×3, T4 quote-check, T5 3 with one corrected as inert-by-construction, T6 2) |
| `test-report.md` | absent — accepted: suites were written test-first inside the tasks |

## 6. Validation

| Finding | Outcome |
|---|---|
| V-1 Node ≥ 22.23 `readline/promises` AbortError on comma-path Ctrl-C (pre-existing at baseline; FR-5 pinned a Node-dependent value) | **Resolved** — Pivot B / T5; CI six green ×2 |
| V-2 Ubuntu-only pty flake at the second question | **Accepted WARN** — T6 diagnostics live; 10 executions, 2 pre-T6 failures, 0 since |
| V-3 LOC budget ~430 vs ~860 (test code) | Accepted; kaizen input |
| P-10 Linux `expect` | Settled by CI run `38983739454` |

## 7. Accepted Warnings / Follow-ups

- V-2 flake: a future `<<NO-PROMPT-AFTER-CTRL-C>>` / `<<HUNG>>` marker in CI → Bug proposal with the log.
- `akili init` (`runInteractiveInit`) still prints the AbortError trace on Node ≥ 22.23 — queued Bug proposal (out of scope).
- Reviewer advisories recorded, not acted on: soft-wrap below ~60 cols; `apt-get` retries; triplicated `ctrl_c_to_shell` proc; EOF (Ctrl-D) now exits 130 on typed questions (undocumented); `e.g. 1,3` text on single-choice empty replies.

## 8. Historical Notes

- 2026-10-02: specified (Standard, re-based from Lite), T1/T2/T4 executed; T3's Implementer died with the session.
- 2026-10-16: T3 recovered at ladder rung 4; FR-4 amended (FR-2 exception); validate → V-1; Pivot B (T5) user-approved; T6 added for V-2; CI six green ×2; re-validated archive-ready.
- Models: Implementers `sonnet` (T1, T4) / `opus` (T2, T3, T5, T6); Reviewers `opus` (T1, T4) / `fable` (T2, T3, T5, T6). Review rounds 8 of 8 budgeted (T1 1, T2 1, T3 1, T4 2, T5 1, T6 1 — the two added tasks absorbed the margin).
