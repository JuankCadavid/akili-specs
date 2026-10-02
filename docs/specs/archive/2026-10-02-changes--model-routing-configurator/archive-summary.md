# Archive Summary — Model Routing Configurator (`akili routing`)

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `docs/specs/changes/model-routing-configurator/` |
| Archive Date | 2026-10-02 |
| Archived from | `master` at `b25591f` (CI-green code commit `aa4b080`) |
| Type · Depth · Mode | Change · Standard · `gated` (routine gates auto-passed after T1 at the user's instruction) |
| Release class | **minor** — `CHANGELOG.md` Unreleased carries the entry |

## 2. Final Status

**Complete and validated.** 13 / 13 tasks `[x]` — 8 planned + T9/T10/T11 (two pivots from FR-11's live validation) + T12 (from `/akili-validate`, FR-3 FAIL) + T13 (from the first CI run, Windows EOL). 16 review rounds of 18; every task closed on a Reviewer PASS from a different model than its Implementer; 0 `REVIEW_WAIVED`, 0 `REVIEW_SKIPPED`, 0 HALT. `npm test` 94 → **231**; CI matrix green on all six jobs (run `37025903452`).

## 3. Requirements Delivered

| Requirement | Delivered by | Validation |
|---|---|---|
| FR-1 interactive wizard | T4 (seam), T5 (io), T8 cases 1–2 (pty) | PASS |
| FR-2 non-interactive form | T2, T4, T5 | PASS |
| FR-3 deterministic derivation incl. author ≠ auditor | T2, T9, T11, **T12** | PASS (after T12) |
| FR-4 section writer, six states, `CLAUDE.md` never written | T3, T5, T8 | PASS |
| FR-5 Step 8E wrappers, five hosts | T3, T5, T12 | PASS |
| FR-6 answers file, idempotence | T3, T5, T8 case 3 | PASS |
| FR-7 packaged roster + drift test | T1 | PASS |
| FR-8 constitution delegates | T6, **T10** | WARN (Branch B not re-walked live after T10 — component-verified) |
| FR-9 docs, audit signal, root rule | T7 (3 attempts) | PASS |
| FR-10 zero regression | T5, T7 | PASS |
| FR-11 closing validation | T8 (eleven cases, two evidence files) | WARN (§8 "Real-host acceptance" re-worded) |
| NFR-1…8 | T1–T5, **T13** (NFR-4) | PASS (NFR-6 wording aligned at archive) |

## 4. Files Changed Summary (from `execution.md`)

| Area | Files |
|---|---|
| CLI | `bin/routing.js` (new, ~1,420 lines — pure: parse, derive, render, fence, wrappers, plan, prompt seam) · `bin/akili.js` (+~220: 12 flags, `case "routing"`, `runRouting`/`takeSnapshot`/`applyPlan`/`checkRoutingPaths`, summary + `--json`, help) · `bin/persona.js` (+2 exports) |
| Packaged data | `.claude/templates/model-registry.json` · `.claude/templates/model-routing.section.md` |
| Tests | `test/registry-drift.test.js` (7) · `test/routing.test.js` (117) · `test/routing-io.test.js` (13) · `test/fixtures/routing/` (9) · `.gitattributes` (`test/fixtures/** -text`) |
| Methodology | `.claude/commands/akili-constitution.md` (Step 8C delegation + probe-first branches + inline Fallback; 8E; 9; checklist) · `.claude/commands/akili-audit.md` (third drift signal) · `docs/commands/akili-constitution.md` |
| Docs | `docs/cli.md` (Routing section, 13 option rows) · `docs/model-routing.md` · `docs/flow.md` · `README.md` · `docs/release-checklist.md` · `AGENTS.md:37` · `CHANGELOG.md` |

## 5. Test Evidence Summary

No `test-report.md` — `/akili-test` was not run; the user accepted its absence at archive. Every code task was test-first (`tdd`) with executed falsifiers quoted in `execution.md`; coverage was audited at clause level by `/akili-validate` (`validation-matrix.md`). Live validation: `t8-validation-evidence.md` (cases 3–9) and `t8-validation-evidence-tty-and-constitution.md` (cases 1, 2, 11 via `expect`; case 10 as a proxy Step 8C walk).

## 6. Validation Summary

`validation-report.md`: first pass 1 FAIL (FR-3 — Antigravity flash effort-variants collapsed to one `wrapperModel` for Implementer and Reviewer; found by a validator probe, missed by eleven Reviewers and eleven live cases) + 7 WARN → T12 fixed the FAIL → first CI run red on Windows → T13 → **ARCHIVE-READY: 0 FAIL, 6 WARN accepted**.

## 7. Accepted Warnings / Follow-Ups

| Item | Disposition |
|---|---|
| Step 8C Branch B not re-walked live after T10 | accepted — component-verified (two-shim probe + Reviewer text read); follow-up: one live re-walk |
| `placeholdersByColumn` counts the host's Fallback-column placeholders (F3) | follow-up proposal |
| requirements §8 / §1 / NFR-6, design §7, tasks §4 wording | **done at archive** (this folder) |
| `bin/routing.js` absent from `AGENTS.md`; CodeGraph stale | **done at archive** (Constitution & Graph Sync) / re-index recommended |
| No lint script | follow-up: `"lint": "node --check bin/*.js scripts/*.js"` |
| 24 advisories (F5, F6, F8, `DATE_STAMP_RE`, `detectEol` duplicate, composite `cliSuggestion`, README hub lines, Step 9 "shares", cross-host clearing, Codex-without-Luna hint, `--opencode-agent-dir` orphans, invalid-JSON recovery, …) | recorded in `validation-report.md` §7; candidates for a follow-up proposal |
| `master` ruleset wants PRs; the two pushes used bypass | surfaced to the user; governance decision pending |

## 8. Historical Notes

- Budget: 8 tasks / ~1,550 LOC / 18 rounds estimated → 13 tasks / ~4,130 LOC / 16 rounds. The LOC tripwire fired after T3 (per-task size, not scope) and the user revised it to ~3,400; it was crossed again by approved fixes.
- Fifteen execute-time spec clarifications and four Pivot Records — all recorded in `execution.md` with two-direction sweeps.
- Both FR-11 pivots and the validation FAIL were **design-conformant defects**: every Reviewer passed them because the design said so. Live validation and a placement probe found them. That is the spec's chief lesson (kaizen entry `docs/specs/kaizen/changes--model-routing-configurator.md`).
- Runtime events: T1 spawn failure (rung 1), T7 Reviewer fable session limit (rung 1), T13 Implementer opus session limit (rung 4 → `sonnet`, the registry's T2).
