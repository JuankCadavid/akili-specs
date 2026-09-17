# Archive Summary — changes/codex-install-target

**Outcome:** complete and shipped in **v2.24.0** (minor). OpenAI Codex CLI is the fourth install target: `akili install --tool codex` writes the 11 commands as `~/.agents/skills/akili-*/SKILL.md`, the 24 skills, and the resources under the Codex config home (`$CODEX_HOME`, default `~/.codex`); `doctor`/`update`/`init`/auto-detection treat Codex as first-class; the registry expresses every host as data (capability flags) and the Antigravity special case is gone; `/akili-constitution` Steps 8C/8E/8F/9, the execute/test/flow guidance, the model-routing registry, mirrors, root docs and CHANGELOG name Codex with dated pins; a CI regression gate proves the three shipping targets' layouts unchanged; live validation on codex-cli 0.154.0 confirmed skills, roster, the triad via `spawn_agent`, the Step 8F gate in both directions with the raw payload, tenants, and `/goal` semantics.

## Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/codex-install-target` |
| Archive Date | 2026-09-17 |
| Depth / Type | Standard / Change |
| Approval Mode | gated |
| Release | v2.24.0 (minor), published to npm and GitHub 2026-09-17 |
| Final spec commit | `a7ec0e9` on `master` (T7 close + final CI); release commit `a0cfa36` |

## Final Status

| Task | Status | Attempts | Notes |
|---|---|---|---|
| T1 installer (registry flags, codex target, doctor, init, help) | `[x]` | 2 | + user-approved `CODEX_HOME` delta after T7 (2 attempts) |
| T2 regression script + CI step | `[x]` | 2 | Pivot Record (FR-4 amended); first CI run failed (`npx` bin resolution on cold runners), second green |
| T3 constitution Steps 8C/8E/8F/9 | `[x]` | 3 | three gate-script bypasses closed at review; reopened after T7 (2 attempts) |
| T4 execute/test/flow per-host paragraphs | `[x]` | 2 | |
| T5 model-routing Codex column | `[x]` | 2 | |
| T6 mirrors, root docs, CHANGELOG, closure sweep | `[x]` | 2 | one Implementer retry after a usage-limit interruption |
| T7 live validation (codex-cli 0.154.0) | `[x]` | — | six items PASS/resolved; DD-12 reopen wave + `CODEX_HOME` delta |

## Requirements Delivered

| ID | Delivered by |
|---|---|
| FR-1 `codex` selectable target (all four scenarios) | T1, T2 (fixture), T6 (docs) |
| FR-2 Codex layout, skip-by-default, dry run, partial installs, `--target` single root | T1 |
| FR-3 doctor covers Codex (env row, legacy copies) | T1, T7 (real binary: `OK codex (codex-cli 0.154.0)`) |
| FR-4 registry generalisation, zero regression (amended: layout identity + source-equality) | T1, T2 (CI runs 35155777597, 35239991368 green) |
| FR-5 Step 8E Codex wrappers | T3, T7 (spawn observed, models per rollout, read-only sandbox) |
| FR-6 Step 8F gate on Codex | T3, T7 (deny + allow, raw payload, denial = stderr + exit 2) |
| FR-7 model-routing Codex column | T5, T7 (plan gating; effort enum) |
| FR-8 per-host guidance | T4, T7 (`/goal` pinned as not a condition loop) |
| FR-9 documentation coherence + pins | T6 (sweep log in `execution.md`) |
| FR-10 live validation | T7 |
| NFR-1..6 | cross-cutting; NFR-4 CI matrix green |

## Files Changed Summary (from `execution.md`)

| Surface | Change |
|---|---|
| `bin/akili.js` | 239+/67− (T1) + `CODEX_HOME` default (+9/−1) |
| `scripts/ci/install-layout-regression.js` (new), `.github/workflows/ci.yml` | ~500 lines; step on all six matrix legs; side A installed via isolated `npm install --prefix`; detection fixture pins `HOME`/`USERPROFILE`/`CODEX_HOME` |
| `.claude/commands/akili-constitution.md` | 255+/33− (T3) + reopen deltas |
| `.claude/commands/akili-execute.md`, `akili-test.md`, `docs/flow.md` | Codex spawn bullets, `/model` checkpoint, Unattended, tenant table (T4 + reopen) |
| `docs/model-routing.md` | Codex column, enforced-routing row, effort mapping, plan gating (T5 + reopen) |
| `docs/cli.md`, `docs/commands/*`, `README.md`, `docs/README.md`, `.claude/README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CHANGELOG.md` | four-target docs, mirrors at content parity, Unreleased entry (T6 + reopen) |

## Test Evidence Summary

No `test-report.md` (`/akili-test` not run): the installer has no unit harness; verification was T1's 11-check scripted matrix on temp roots (repeated by two lens Reviewers), the CI regression gate (three targets `LAYOUT-IDENTICAL` + detection fixture on six legs), and T7's live validation. Absence accepted at archive.

## Validation Summary

No `validation-report.md` (`/akili-validate` not run): FR-10 live validation served as the closing gate, with each requirement's live clauses recorded item by item in `execution.md` → T7. Absence accepted at archive.

## Accepted Warnings Or Follow-Ups

| Item | Disposition |
|---|---|
| Spec drift vs artifacts: `design.md` §5.3 `max`→`xhigh` (artifacts say `max`→`max`); FR-2/DD-2 name `~/.codex` where code honors `$CODEX_HOME`; `proposal.md` "byte-identical" superseded by Pivot Record T2 | Recorded; approved spec documents left unedited |
| `<CONFIRM SLUG>` on Codex T4/T6; `docs/cli.md` `~/.codex/skills` legacy-root claim `Unverified:` | Kept — no evidence gathered |
| Windows content leg of the regression gate near-blind (CRLF checkout makes side B ≠ LF tarball while equal to source) | Recorded; layout identity carries the gate; POSIX legs cover content |
| DD-9 skill-description truncation observed (descriptions shortened, all 35 visible) | Recorded; patch spec only if a real loss appears |
| Codex `.git/` protected under the default sandbox; hooks need `/hooks` trust | Documented in Step 8F / execute guidance |
| User's `~/.codex/config.toml` pin `gpt-5.1-codex` rejected by the account | User action |
| `T7-RUNBOOK.md` in the session scratchpad | Disposable |

## Historical Notes

- Proposal 2026-09-16; Judgment Day round 1 (5 severe + 3 suspects fixed, no re-judgment).
- Execution 2026-09-16/17 in waves: T1 ∥ T4 ∥ T5 → T2 ∥ T3 → T6 → T7. Budget 7 tasks / ~560 lines / 8 rounds → 7 (+2 deltas) / ~1,200 / 19.
- Pivot Record T2 (FR-4 identity clause) approved by the user; DD-12 reopen wave after T7; `CODEX_HOME` delta approved at the closing gate.
- Reviewer usage-limit interruptions ×3; model fallback (`fable`) preserved author ≠ auditor.
- Kaizen retrospective: `docs/specs/kaizen/changes--codex-install-target.md`.
