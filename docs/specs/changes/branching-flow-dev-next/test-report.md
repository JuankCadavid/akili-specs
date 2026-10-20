# Test Report: branching flow — `dev` integration branch and `next` prereleases

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branching-flow-dev-next` |
| Overall status | **PASS** — 505/505 (`npm test`, Node v22.12.0); new suites 91/91 on Node v18.20.8; 0 product bugs |
| Date | 2026-10-19 |
| Tested at | `d64225a` + this phase's test files |
| Approval Mode | `pre-approved (user, 2026-10-19)` |
| Leader | Opus 5.5; Testers `sonnet` (T2; the Implementers were also `sonnet` — distinct spawns, fresh context; recorded as a same-model tester pairing) |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 2 delegated (A: CLI integration, B: FR-7 docs contract) + author unit suites cited, not rewritten |
| Testers | 2 spawned **in parallel** (disjoint files: A new files only; B `test/branching-flow.test.js`); none inline |
| New tests | A: 16 (`test/release-next-cli.test.js` 12, `test/release-status-cli.test.js` 4) + harness `test/release-cli-harness.js`; B: 30 added to `test/branching-flow.test.js` (42 total) |
| Full suite | `npm test` → tests 505, pass 505, fail 0, skipped 0 (was 458 after execute: +16 Suite A, +30 Suite B, +1 because `node --test` also loads `test/release-cli-harness.js` as a passing file — figures corrected at validation W-4) |
| Node 18 | `node --test` of the five spec test files on v18.20.8 → 91/91 |
| Flake check | Suite A run 3× by its Tester: 16/16 each (5296, 5205, 5318 ms); signal tests poll a "started" marker, no blind sleeps |
| Other gates | `npm run verify:cli` OK; `npm run pack:dry-run` ships no `scripts/release-*.js` and no `test/`; `git diff --check` clean |
| Product bugs | none |
| Lookup notes | none |

## 3. Backend Unit Tests (author TDD, cited)

| File | Tests | Proves |
|---|---|---|
| `test/release-next.test.js` | 26 | FR-2 version math (numeric `N`, other bases/preids ignored, string `npm view`), `parseArgs` incl. `--otp`, FR-3 each guard alone and together + unreadable facts, FR-4 argv/restore/listener order/restore failure, FR-5 dry run — fake exec, temp root (T1, red→green in `execution.md`) |
| `test/release-status.test.js` | 7 | FR-6 `partitionVersions`, `releaseFailures` (prerelease never checked, leftover prerelease is drift), FR-9 hint text (T2) |
| `test/branching-flow.test.js` (T3/T4/T5 part) | 12 | FR-1 workflow triggers + job name + matrix + syntax step; FR-7 `AGENTS.md` pin, Release Rules phrases, Kaizen bullet |

## 4. Frontend Unit Tests

n/a — no UI.

## 5. Integration Tests

### Suite A — CLI (real child processes, temp git repo + bare origin, fake `npm`/`gh` first on `PATH`; win32 skipped with a printed reason)

| Test | Result |
|---|---|
| FR-4 successful publish: exact argv `publish --tag next --access public --registry=https://registry.npmjs.org/`; on-disk version during publish `2.35.0-next.1`; afterwards bytes identical (fixture with unusual key order / indent / trailing spaces), tree clean, HEAD, rev-list count, tags and origin refs unchanged | PASS |
| FR-4 `--otp` forwarded; malformed otp refused before any publish | PASS |
| FR-4 failed publish → non-zero, bytes identical, tree clean | PASS |
| FR-3 not on `dev` → exit 1 naming Branch, no publish, bytes identical | PASS |
| FR-3 In sync: unpushed local commit (real `git fetch` + `rev-parse`) → refuses | PASS |
| FR-3 Clean: stray file → refuses | PASS |
| FR-5 `--dry-run` on a valid `dev` → `Version: 2.35.0-next.1`, exit 0, nothing written or published | PASS |
| FR-5 `--dry-run` off `dev` → version + failed Branch guard, exit 1 | PASS |
| FR-2 `N` past `next.1`, `next.2` → publishes `2.35.0-next.3` | PASS |
| DD-4 SIGINT / SIGTERM / SIGHUP to the process group mid-publish → non-zero exit with `signal === null` (handled), bytes identical, tree clean | PASS ×3 |
| FR-6 published `next` version listed (`npm next:`, `npm prereleases:`), exit 0, `gh` never asked about a `next` tag | PASS |
| FR-6 stable drift still reported (remote tag removed → `2.34.1: missing remote tag`; missing notes + GitHub Release) | PASS ×2 |
| FR-6 prerelease left in `package.json` → exit 1, line naming `git checkout -- package.json` | PASS |

Mutations executed on the copied scripts (real scripts untouched): no `--tag next` → FR-4 success + FR-5 dry-run red; no signal listeners → all three DD-4 tests red (the script dies, `package.json` left modified); no restore → 6 tests red; `main` passing all versions instead of `stable` → both FR-6 listing/drift tests red.

### Suite B — FR-7 docs contract (static reads of shipped files, section-scoped)

| Test group | Result |
|---|---|
| CONTRIBUTING, release checklist, README *Releasing Package Updates* each name `dev`, `feat/<name>` / `fix/<name>`, `release:next`, `release/v`, `` `dev` → `master` ``, `merge commit`, `sync/master-into-dev` (21) | PASS |
| Checklist verifies dist-tags before `gh release create` | PASS |
| Checklist `git tag` / `npm publish` only after the "Only after the `dev` → `master` merge" anchor | PASS |
| BUT: no `git commit -m "chore(release)` → `git tag v` block in AGENTS, CONTRIBUTING, checklist, README section (detector self-tested on the `3d8c123` README shape) (4) | PASS |
| Checklist guard sentence matches the six `evaluateGuards` names; contains "bumped base version is ahead of every published stable version", not "dev is ahead of the base" | PASS |
| CHANGELOG `[Unreleased]` names `release:next`, `Integration Branch: dev`, `kaizen/apply-` | PASS |

Mutations executed (each restored byte-exact): README reverted to `3d8c123` → 8 red; guard phrase inverted → red; `gh release create` before dist-tags → red; anchor removed → red; `sync/master-into-dev` renamed in CONTRIBUTING → red; a direct-release block appended to AGENTS → red; `kaizen/apply-` renamed in CHANGELOG → red.

## 6. E2E Tests

n/a — the end-to-end path (a real `npm publish --tag next`, a real push to `dev`) is excluded by the user's rule; see §9.

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test type | Test file | Result | Gap or notes |
|---|---|---|---|---|---|
| FR-1 | push to `dev` triggers both workflows; job name + matrix byte-identical; PR/dispatch kept | static | `branching-flow.test.js` | PASS | Real GitHub trigger — §9 |
| FR-2 | first preview; next preview; numeric `N`; ignore others; bad bump → usage | unit + integration | `release-next.test.js`, `release-next-cli.test.js` | PASS | — |
| FR-3 | six guards; unreadable facts; "Not on dev" scenario (exit 1, Branch, bytes identical, no publish) | unit + integration (real git) | both | PASS | — |
| FR-4 | argv `--tag next`; otp validation; restore on success / failure / SIGINT / SIGTERM / SIGHUP; restore failure → recovery command, exit ≠ 0; BUT no commit/tag/push/`latest` | unit + integration (real signals) | both | PASS | Real registry — §9 |
| FR-5 | dry run prints plan, writes nothing, exit 1 on failed guard / 0 otherwise | unit + integration | both | PASS | — |
| FR-6 | prereleases listed, never artifact-checked; stable drift still reported; leftover prerelease is drift | unit + integration | `release-status.test.js`, `release-status-cli.test.js` | PASS | Edge case §8 |
| FR-7 | flow rows in four docs; pin; no direct push (admins); merge commit ×2; Kaizen landing; BUT | static | `branching-flow.test.js` | PASS | Admins clause asserted in AGENTS/CONTRIBUTING by review, not by test |
| FR-8 | tests offline, no real publish/fetch on the repo | all | — | PASS | Suite A uses a temp bare origin; no network |
| FR-9 | PR-flow hints; no standalone `git tag`/`npm publish`; behavior unchanged | static | `release-status.test.js` | PASS | — |
| NFR-1 | no new dependency | review | `package.json` diff | PASS | — |
| NFR-2 | six CI legs | local: macOS Node 22 + Node 18 | — | PASS locally | Linux/Windows legs run on the user's first push; Suite A skips on win32 with a printed reason |
| NFR-3 | `node --check scripts/release-next.js` in CI | static | `branching-flow.test.js` | PASS | — |
| NFR-4 | not shipped | `pack:dry-run` | — | PASS | — |

## 8. Remediation

None required. Observation carried from T2 advisory and Suite A (not a defect against FR-6's scenarios): when `package.json` holds a prerelease **that is also published**, `release:status` additionally reports the four missing artifacts for it — still drift, still names `git checkout -- package.json`. Recorded for `/akili-validate`.

## 9. Accepted Gaps

| Gap | Why | Substitute |
|---|---|---|
| GitHub running CI / Release Status on a real `dev` push | User rule: no push | Static workflow tests; the user confirms on the first push to `dev` |
| A real `npm publish --tag next` | User rule: no publish | Fake-`npm` integration proves argv, version and restore; the maintainer's first real run checks `npm view akili-specs dist-tags` |
| P-10 (`strict` + merge commit → resync needed) | Needs a live PR | User, at the first stable release |
| Windows behavior of the default runner (`npm.cmd` + shell) and of signals | No Windows host; Suite A skips on win32 | Code review (T1 attempt 2); unit tests run on the Windows CI legs |
