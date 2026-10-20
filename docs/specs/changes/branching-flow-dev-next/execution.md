# Execution Log: branching flow — `dev` integration branch and `next` prereleases

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branching-flow-dev-next` |
| Depth | **Standard** |
| Approval Mode | `pre-approved (user, 2026-10-19)` (from `requirements.md`; local commits only — no push, PR, tag, release or `npm publish`) |
| Started | 2026-10-19 |
| Started at | `3d8c123` (clean tree) |
| Budget (design §12) | 5 tasks · ~780 LOC · 8 review rounds — tripwire at 6 tasks / ~1000 LOC / 11 rounds, compared at every finalize |
| Leader | Claude Code session model Opus 5.5 (`claude-opus-5-5`). This repo's `AGENTS.md` has no `## Model Routing` section; `docs/model-routing.md` maps T1 → `opus`. Session model matches → pass silently |
| Spawn path | No Step 8E wrappers (`.claude/agents/` absent) → fallback sub-prompt path; workers read their persona from `.agents/`. `.agents/` is gitignored and was absent in this worktree; copied from the main checkout (precedent: `bugfix/update-check-deadline`). `akili doctor --agents`: `reviewer audit-checklist` and `tester prove-behavior` OUTDATED (2.30.0) → `doctor --agents --fix --allow-branch` (local gitignored copy) → FIXED. Remaining: `leader delegation` CUSTOM-EDITED, `shared-file-discipline` UNLOCATED (leader, implementer) — maintainer's call, no stop |
| Models | Implementer `sonnet` (T2), Reviewer `opus` (T3 ≠ T2) |
| Environment pre-check | No running stack. Node v22.12.0, npm 10.9.0. Real commands allowed in verification: read-only `git fetch origin dev`, `npm view`, `npm run release:next -- <bump> --dry-run`, `npm run release:status` |
| Concurrency | T1 ∥ T2 (disjoint files: T1 `scripts/release-next.js`, `test/release-next.test.js`, `package.json`; T2 `scripts/release-status.js`, `scripts/release.js`, `test/release-status.test.js`). Workers run only their own test files; the Leader runs `npm test` after both land |

## 2. Task Execution History

### T1 — `scripts/release-next.js`, `release:next` script, `test/release-next.test.js`

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 2) |
| Date | 2026-10-19 |
| Attempts | 2 |
| Requirements covered | FR-2, FR-3, FR-4, FR-5, FR-8, NFR-1, NFR-2, NFR-4 |
| Skills | `tdd`, `error-handling-patterns` (as `tasks.md` lists; `systematic-debugging` not needed) |
| Effort | attempt 1 `high`, attempt 2 `xhigh` (bumped after FAIL) |
| spawns | Implementer 11 calls, 99770 tokens, ended complete; Reviewer 9 calls, 78515 tokens, ended complete (FAIL); Implementer 8 calls, 59405 tokens, ended complete; Reviewer 4 calls, 66422 tokens, ended complete (PASS) |

**Attempt 1.** Files: `scripts/release-next.js` (new), `test/release-next.test.js` (new, 26 tests), `package.json` (+`release:next`). Red run at assertion level against a stub (`expected '2.35.0-next.1' actual ~`, exit-code asserts `expected 1 actual ~`). Verification: 26/26; `node --check` 0; `npm run release:next -- minor --dry-run` exit 1 — `Version: 2.35.0-next.1`, `GUARD Branch: FAIL — on "JuankCadavid/branching-flow", not dev`, Clean FAIL, In sync FAIL, Stable source/Source published/Base ahead OK, `ERROR: refusing to publish; failed guards: Branch, Clean, In sync`; `pack:dry-run` lists no `release-next`. Falsifiers executed red: (1) no `--tag next` → test 21 argv deepEqual + test 19 regex `:271`; (2) no restore → `:308`, `:323` byte asserts; (3) listeners after write → `:330` events deepEqual; (4) string `N` → `:130` `expected '2.35.0-next.11' actual '2.35.0-next.10'`. Evidence re-run (Leader inline): **VERIFIED** (26/26, dry-run exit 1, `package.json` diff = one scripts line). Reviewer (opus): **FAIL** —

> 1. **Discovered Issue:** The test "restore failure: recovery command printed, exit 1" (`test/release-next.test.js:342-355`) cannot fail on the obligation it is named after. It matches `/git checkout -- package\.json/` against `r.out`, which always contains the plan line `If interrupted: git checkout -- package.json` (`release-next.js:210`). I ran a mutation on a scratchpad copy that removed `Run: git checkout -- package.json` from the restore-failure message at `release-next.js:240`. The suite still passed 26/26. **Violated Rule:** FR-4 + FR-8; reviewer persona §3 (presence ≠ behaviour). **Remediation:** assert on `r.errors.join("\n")` with a restore-failure-specific regex; re-run the mutation.

ADVISORY (attempt 1): Windows `defaultExec` appended `.cmd` to `git` too (design §7 prescribes `npm.cmd` only — carried into attempt 2 as design conformance, not new scope); null-fact reasons use fixed labels rather than `<first error line>` (FR-3 satisfied; design §7 wording drift — fix design text at archive); no test for the first write throwing (code handles it); a throwing `log()` after publish would report failure (theoretical); `makeRoot()` temp dirs not cleaned; SIGTERM to the parent alone lets publish continue (DD-4 intent).

**Attempt 2.** Files: `test/release-next.test.js` (assert on `r.errors`, `/could not restore package\.json.*git checkout -- package\.json/` at `:354`), `scripts/release-next.js` (`win = process.platform === "win32" && cmd === "npm"`). Mutation (remove the recovery command from `:240`) → `not ok 26`, actual `'ERROR: could not restore package.json (EACCES).'`; reverted → 26/26. Evidence re-run (Leader inline): **VERIFIED** (26/26, dry-run exit 1). Reviewer (opus): **PASS** — FAIL closed; independent mutation red; Windows runner matches design §7; regression sweep of all attempt-1 clauses intact. ADVISORY: restore-failure test does not assert the leftover bytes (acceptable).

**Decisions.** T1 ∥ T2 with disjoint files; workers ran only their own test files. Design §7 null-fact wording drift recorded for archive sync.
**Running totals (tripwire):** tasks 1/5 · LOC ~625 (script 269 + test ~356 + 1) / ~780 · review rounds 2/8. Within budget.
**Final verification:** `node --test test/release-next.test.js` 26/26; dry-run exit 1 as specified.
**Gate:** `auto-approved (pre-approved mode)`.

### T3 — Workflows run on `dev`

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 1) |
| Date | 2026-10-19 |
| Attempts | 1 |
| Requirements covered | FR-1, NFR-1, NFR-3 |
| Skills | `tdd` (as listed) |
| Effort | `low` (mechanical) |
| spawns | Implementer 7 calls, 59790 tokens, ended complete; Reviewer not reported by host at write time, ended complete (PASS) |

**Attempt 1.** Files: `.github/workflows/ci.yml` (`branches: [master, dev]`; `+ node --check scripts/release-next.js`), `.github/workflows/release-status.yml` (`+ - dev`), `test/branching-flow.test.js` (new, 5 tests). Red run before the workflow edits: `not ok 1 … actual: '    branches: [master]'`, `not ok 2` (dev), `not ok 5` (release-next syntax check). Green 5/5. Falsifiers executed red: (1) `[master]` → `not ok 1 … actual: '    branches: [master]'`; (2) job renamed → `not ok 3 … 'job name line changed'`. Evidence re-run (Leader inline): **VERIFIED** (5/5; `git diff .github/` = the three lines). Reviewer (opus, `checklist`): **PASS** — scoping mutations (`dev` only under `pull_request` in each file) went red, so the push-block check is scoped.

ADVISORY: the push-block match can be fooled by a comment or a `dev-old`/`branches-ignore` entry inside the push block itself; test 4 checks release-status triggers with whole-file `includes`.

**Running totals (tripwire):** tasks 2/5 closed (T2 awaiting its `release:status` comparison) · LOC ~730 (T1 ~625 + T3 ~105) / ~780 · review rounds 3/8 (+ T2's 1 pending record). LOC will pass ~780 with T2, T4, T5 still to land; the tripwire is ~1000 — re-checked at each finalize.
**Gate:** `auto-approved (pre-approved mode)`.
