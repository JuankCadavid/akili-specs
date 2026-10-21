# Execution Log: Grok Bot install target (`--tool grokbot`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/grokbot-target` |
| Branch | `feat/grokbot-target` (worktree; commits local only, never pushed) |
| Approval Mode | `gated`. The user asked up front to continue into execute; task gates are still presented |
| Leader | Claude Code session, `opus` (T1) |
| Workers | No Step 8E wrappers in this repo (`.claude/agents/` absent). Fallback sub-prompt workers read their persona from `.agents/`. Implementer: `sonnet` (T2). Reviewer: `opus` (a different model from the Implementer) |
| Personas | `.agents/` is gitignored and was absent from this worktree. It was copied from the main checkout, then `akili doctor --agents --fix --allow-branch` was run on that local, ignored copy: leader `primary-instructions`, reviewer `audit-checklist` and tester `prove-behavior` were fixed (backups under `.agents/.backup/`); custom-edited/unlocated sections were left as the maintainer's call. `--allow-branch` was needed because the branch guard refuses on `feat/*`; the files are untracked, so nothing lands in a commit |
| Budget (design §12) | 5 tasks · ~790 LOC · 8 review rounds |

## 2. Task Execution History

### T1 — Target, flags, roots, registry, detection, help

#### Attempt 1 — FAIL
- **Files changed:** `bin/akili.js`, `test/install-grokbot.test.js` (new), `test/install-cursor.test.js`, `test/agents-doctor-io.test.js`, `test/agents-doctor.test.js`, `scripts/ci/install-layout-regression.js`
- **Implementer verification:**
  - 4 suites: 86/86 pass.
  - Regression script: exit 0.
  - `install --tool all --dry-run`: byte-identical to the baseline.
  - `git diff --check`: clean.
  - `npm test`: 517/517.
  - Red run at baseline: whitelist assertion "expected the error text to list grokbot".
  - Falsifiers 1–3 all went red and were reverted: `--local` path, `detect()` true→false, and the verify-hint regex.
- **Implementer Not Done / Assumptions (verbatim summary):** `diagram-design`/`video-production` tests not pinned (they always pass an explicit `--tool`); init has no grokbot roots (P-3); the "Default" test uses `AKILI_GROKBOT_TARGET="   "`; DD-2 explicit-equals-default quirk. These are assumptions, not owed items, so no continuation.
- **Evidence re-run (Leader inline):** VERIFIED.
  - 86/86 on the 4 suites.
  - Regression: exit 0.
  - `install --tool all --dry-run` is byte-identical between HEAD's `bin/akili.js` and the changed one (scratch HOME, 494 lines).
  - `git diff --check`: clean.
  - `/home/box` absent before and after.
- **Reviewer (opus):** FAIL. Issue 1: `scratchEnv(home)` defaults `AKILI_GROKBOT_TARGET` to `"   "`, which reads as unset, so the spawns in the new suite that write (FR-3 first-install, hygiene install) are unpinned. That violates NFR-3 and the task Disqualifier. Remediation: default the pin to a scratch path, and keep the blank value only in the FR-2 *Default* dry-run test, with a comment.
- **ADVISORY:**
  - The Default test asserts the header, not "would write" lines.
  - The FR-6 negatives pass vacuously if the banner wording changes.
  - The FR-1 "`both` unchanged" behavior has no new test.
  - DD-2 quirk: one line for `docs/cli.md` (T5).
  - The byte-identity loop does not catch extra installed files.
- **spawns:** Implementer — not reported by host; Reviewer — not reported by host.

#### Attempt 2 — PASS
- **Files changed:** `test/install-grokbot.test.js`. `scratchEnv` now defaults the pin to `<home>/.grokbot-env-unused/workflows`; the blank value remains only in the FR-2 *Default* dry-run test, with a comment.
- **Implementer verification:**
  - 4 suites: 86/86.
  - Regression: exit 0.
  - `git diff --check`: clean.
  - `npm test`: 517/517.
  - Pin proof: with `--grokbot-target` removed, the install landed under the scratch env path and `/home/box` stayed absent. Reverted; 11/11.
- **Evidence re-run (Leader inline):** VERIFIED. 86/86, `diff --check` clean, and the only blank pin is at `test/install-grokbot.test.js:165`.
- **Reviewer (opus):** PASS. Issue 1 resolved; nothing regressed (11/11 on the Reviewer's own re-run).
- **ADVISORY (still open, recorded only):**
  - The Default test asserts header roots, not "would write" lines.
  - The FR-6 negatives can pass vacuously.
  - Byte-identity walks source files only.
- **spawns:** Implementer (resumed by message) — not reported by host; Reviewer (resumed) — not reported by host.

**T1 final: PASS** (2 attempts) · 2026-10-21
- **Requirements covered:**
  - FR-1 (both scenarios)
  - FR-2 (all scenarios)
  - FR-3 *First install* (except the record) and *Shared directory hygiene* (T1 part)
  - FR-6
  - NFR-1, NFR-2, NFR-3
- **Decisions:**
  - Skill: `tdd`, as listed.
  - Effort: high → xhigh on rework.
  - The pin was not added to `diagram-design`/`video-production` tests: they always pass an explicit `--tool`, so detection is never reached.
- **Issues:** none open.
- **Running totals vs budget:**
  - Tasks: 1/5.
  - LOC: ~395/~790 (`bin/akili.js` +70/−10 against ~90 budgeted; new test file 315 lines against ~150 budgeted for T1; pins 10).
  - Review rounds: 2/8.
  - The test LOC is running ahead of the T1 estimate. The total stays within budget, and I'm watching it at each gate.
