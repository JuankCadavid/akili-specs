# Archive Summary — Cursor as a Fifth Install Target

**Outcome:** shipped. `akili install --tool cursor` is a fifth target (shared `~/.agents/skills` root with Codex, resources at `$CURSOR_CONFIG_DIR`/`~/.cursor/akili`, symmetric auto-detection, `cursor-agent` doctor row); `/akili-constitution` Steps 7/8C/8E/8F/9, the Model Routing registry, and the per-host guidance name Cursor; the Step 8F gate was **observed live on the Cursor CLI** denying a `[x]` write without PASS and allowing it with PASS on both the imported and the native `failClosed: true` entry — the latter only after a live finding forced the design's planned contingency (`cursor_version`-gated allow output). Release classification: **minor** (v2.31.0).

## Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/cursor-install-target` |
| Archive Date | 2026-10-01 |
| Archived By | `/akili-archive` (Leader session, Fable 5.1) |
| Base → Head | `7cd681a` → `4522274` (8 `[SPEC:…]` commits on `master`) |
| Depth / Type / Mode | Standard / Change / gated → user mandate "continue with all tasks" after wave 1 |

## Final Status

| Item | Status |
|---|---|
| Tasks | 8 / 8 `[x]` — T1, T2, T4, T5, T6 PASS; T7, T3 PASS on attempt 2; T8 closed under `REVIEW_WAIVED (inline)` after the 3-attempt ceiling, with the live mechanics PASSed by rounds 17–18 and one Leader-corrected pin line |
| Review rounds | **18 of 16** budgeted — tripwire fired twice; both over-budget rounds explicitly approved by the user; HALT on T8 resolved by the user's option B |
| `test-report.md` | absent — `/akili-test` **skipped by the user's decision** ("ok archive y despues release"); the spec's own suites: `test/install-cursor.test.js` (12), `test/tasks-gate.test.js` (13), `npm test` 94/94 |
| `validation-report.md` | absent — `/akili-validate` **skipped by the user's decision**; the closure evidence is the per-task Reviewer record and the live validation in `execution.md` |
| Judgment Day | round 1: 8 confirmed severe + 2 settled contradictions, Fix only (`judgment.md`) |
| Live validation (FR-10) | CLI half done; **IDE half deferred** (FR-10 amended with the user's sign-off) |

## Requirements Delivered

| FR | Delivered by | Note |
|---|---|---|
| FR-1 selectable target | T1 · T2 | symmetric detection (DD-2) — a Codex `--skills-only` install beside Cursor resources is not auto-detected (accepted) |
| FR-2 layout, shared root | T1 · T2 | counter wording amended (operations vs files) |
| FR-3 doctor + `cursor-agent` row | T1 · T2 | |
| FR-4 zero regression, fixtures | T2 | four-state detection fixture in CI; normalized Codex doctor baseline |
| FR-5 Step 8E wrappers | T3 | Reviewer `readonly: true` = Cursor "ask mode" (stricter than stated — harmless) |
| FR-6 gate on Cursor | T7 · T3 · T8 | `Write` arm reads `content` then `new_content`, fail-closed on empty; allow output `{"permission":"allow"}` gated on `cursor_version`; honesty note "enforced on the Cursor CLI; IDE unverified" |
| FR-7 registry column + Step 8C | T4 · T3 | `/model` CLI pinned; IDE `UNVERIFIED` (amended) |
| FR-8 per-host guidance | T5 · T3 | |
| FR-9 docs, pins, sweep | T6 | baseline 53 lines / 18 files → 0 unjustified survivors |
| FR-10 live validation | T8 | CLI half; IDE half deferred |
| NFR-1..7 | — | NFR-6 held (no registry refactor); NFR-7 red set amended (F1 was a baseline) |

## Files Changed Summary (from `execution.md`)

| Area | Files |
|---|---|
| Installer | `bin/akili.js` (+~105/−12: `cursor` entry, detection guard, flags, env row, init, help; two comments) |
| Tests / CI | `test/install-cursor.test.js` (new), `test/tasks-gate.test.js` (new, 13 fixtures), `test/fixtures/doctor-codex-baseline.txt` (new), `scripts/ci/install-layout-regression.js` (four-state fixture) |
| Constitution | `.claude/commands/akili-constitution.md` (Step 7 list, 8C, 8E Cursor bullet, 8F script + host row + Cursor sub-step + honesty note, Step 9, checklist) |
| Commands / flow | `.claude/commands/akili-execute.md`, `.claude/commands/akili-test.md`, `docs/flow.md` |
| Registry | `docs/model-routing.md` (Cursor column, enforced-routing row, effort mapping, invocation row) |
| Docs | `docs/cli.md`, `docs/commands/*.md`, `README.md`, `docs/README.md`, `.claude/README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `CHANGELOG.md` (Unreleased, minor) |
| Real machine | `~/.cursor/akili` installed (live validation) |

## Test Evidence Summary

`npm test` 94 / 94 at HEAD. Gate fixtures: F1–F10 (Claude Code / Codex / Cursor payload shapes; F2/F3 observed red before T3, green after), F11–F13 (Cursor `cursor_version` allow output; Claude Code payload gets no stdout — observed red before the DD-12 reopen, green after). Installer tests: shared-root pair, byte identity vs Codex, skip/foreign, dry-run/partials, four detection states incl. the `claude` fallback, doctor healthy/absent/`appliesTo`, Codex doctor baseline (normalized for Windows/CRLF/version). CI regression script: `LAYOUT-IDENTICAL` ×3 + `FIXTURE OK`.

## Validation Summary

`/akili-validate` not run (user decision). Substitute evidence: every task carries a Reviewer PASS (T8: PASS in substance per round 18 + waiver for one line); live CLI validation settled P-6, P-12, P-16, P-17 (refuted-then-closed), P-18, P-19, P-20; retained `UNVERIFIED`: IDE `/model`, `cursor-agent` on other installs, the `.claude/agents/` alias case, IDE picker / Third-Party Imports toggle.

## Accepted Warnings Or Follow-Ups

| Item | Disposition |
|---|---|
| **IDE half of FR-10** (picker, toggle state, `/model` in the IDE, alias case) | Deferred by the user — follow-up; markers stay `UNVERIFIED` |
| **`akili update --dry-run` runs the package-manager step before honoring `--dry-run`** (observed: a real `npm install -g akili-specs@latest`) | Pre-existing CLI defect, out of scope — candidate `/akili-propose` (Bug) |
| Codex auto-detect suppressed on machines where `CODEX_HOME` points elsewhere while Cursor resources exist | Accepted DD-2 trade-off, observed live; documented in `docs/cli.md` |
| Real `claude` target's `MISSING digests.json` doctor row on this machine | Pre-existing (persona-upgrade follow-up), noted |
| T7 header comment still quotes the pre-amendment NFR-7 wording | Advisory, not approved for change — cosmetic |
| `docs/cli.md:19` "from v2.31.0" assumes `release:minor` | Confirm at release |
| Reviewer advisories recorded only (stale `:530` alias over-read in the constitution, `:1247` "non-2 exit code" wording; `module.exports` in `install-cursor.test.js` runs the suite when required; long CHANGELOG bullets) | Not actioned |
| Cursor's `readonly: true` blocks shell commands entirely ("ask mode") | Stricter than the design assumed; the Reviewer needs none — recorded |

## Historical Notes

- Proposal 2026-10-01; Judgment Day round 1 (Fix only) overturned the proposal's hook design: Cursor imports `.claude/settings.json` hooks, and the hooks page documents no `preToolUse` Write payload — `new_content` had been a summarizer artifact.
- Execution 2026-10-01 in waves: T1 ∥ T7 → T4 ∥ T5 → T2 → T3 → T6 → T8. Budget 8 / ~700 / 16 → actual 8 / ~1,100 lines / 18 rounds.
- Runtime events: spawn failures ×2 (harness tmux pane, wave 1), provider-limit death ×1 (Opus 429, T8 Reviewer → `fable`), T8 checkpoints ×2 (harness stops) → CLI half closed Leader-inline.
- Execute-time spec amendments: NFR-7 red set (F1 baseline), FR-2/FR-4 counters, FR-7 IDE `/model` → `UNVERIFIED`, DD-8 "plan-gated" dropped, FR-10 IDE half deferred.
- Four Leader-caused review rounds (summarizer/paraphrase quotations relayed as verbatim: T4 ×2, T5 ×1, T8 ×1) — the spec's main kaizen signal.
- Kaizen retrospective: `docs/specs/kaizen/changes--cursor-install-target.md`.
