# Tasks: branching flow — `dev` integration branch and `next` prereleases

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branching-flow-dev-next` |
| Depth | **Standard** |
| Status | **Approved** — Phase 3 gate: `auto-approved (pre-approved mode)`, 2026-10-19 |
| Budget (design §12) | **5 tasks · ~780 LOC · 8 review rounds**. `/akili-execute` stops and escalates past 6 tasks, ~1200 LOC (raised from ~1000 by the user at the T4 gate, 2026-10-19), or 11 rounds |
| Commit prefix | `[SPEC:changes/branching-flow-dev-next]`. Local commits only: no push, PR, tag, GitHub Release or `npm publish` — and **no test or verification may run the real `npm publish`, `git fetch`, or `npm run release:*` without `--dry-run`** |
| Format precedent | `docs/specs/archive/2026-10-19-bugfix--update-check-deadline/tasks.md` |
| Verified at | `15a3b61`. Baseline readings below were **executed** on 2026-10-19 and are quoted, not predicted |

## 2. Task Graph

```
T1 (release-next.js + tests) ──► T3 (workflows + static test)
T2 (release-status + release.js hints + tests) ─┐
T1 ─────────────────────────────────────────────┴─► T4 (AGENTS.md rules + pin) ──► T5 (CONTRIBUTING, checklist, README, CHANGELOG)
```

**`skip-eligible` tasks: none.** T3 is the smallest (two trigger lists + one syntax line), but it edits the files that produce the required-check names, so it keeps a `checklist` review.

**Skills:** `tdd` (T1, T2) · `error-handling-patterns` (T1 restore/signals) · `systematic-debugging` if a run disagrees with a baseline · `cognitive-doc-design` (T4, T5) · `caveman` (transient agent messages only).

---

### T1 — `scripts/release-next.js`, `release:next` script, `test/release-next.test.js`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~220 script + ~220 tests + 1 `package.json` line) |
| Depends on | none |
| Requirements | FR-2 (both scenarios; numeric `N`; ignore other bases/preids; `BUT` missing/unknown bump → exit 1 usage) · FR-3 (statement incl. unreadable facts fail their guard; six guards; scenario: exit 1 naming Branch, `AND IT MUST` bytes identical, `BUT` no publish) · FR-4 (statement: argv, `--otp` 6–8 digits, restore on success/failure/signal, restore failure → `git checkout -- package.json` + exit ≠ 0; success scenario: bytes identical, `AND IT MUST --tag next`, `BUT` no commit/tag/push/`latest` change; failure scenario) · FR-5 (statement + scenario: prints version and failed Branch guard, exit 1, `BUT` no write, no publish) · FR-8 · NFR-1, NFR-2, NFR-4 |
| Design refs | §5, §6, §7 *release-next.js*, DD-1–DD-7, DD-12, DD-13; P-5, P-7, P-15, P-16 |
| Consumers | none — new file. `package.json` `scripts` read by `npm run` only; `files` untouched (NFR-4) |
| Review | `full`: new maintainer tool that writes `package.json` and publishes |

**Scope (in this order; `tdd`).**

1. `test/release-next.test.js` first, against a `fakeExec` that records every `(cmd, args, opts)` and answers from a table, and a temp `root` holding a copy of a fixture `package.json` (never the repo's). Cases: version math (2.34.1 + minor → `2.35.0-next.1`; published `next.1`, `next.2` → `next.3`; `next.9`,`next.10` → `next.11`; other bases and `-rc.1` ignored; single-string `npm view` output); `parseArgs` (no bump, `foo`, unknown flag, `--otp=12ab`, `--otp=123456`); each guard failing alone (exit 1, the guard's name on stderr/stdout, no `npm publish` call, bytes identical); several failing at once (all named); `origin/dev` rev-parse throwing (In sync fails, run continues); pkg version `2.35.0-next.1` (Stable source fails, Base ahead "n/a"); stale base (`2.34.1` + patch while `2.34.2` published → Base ahead fails); `--dry-run` all-OK (exit 0, plan printed, no write, no publish) and off-`dev` (exit 1, `2.35.0-next.1` printed); success (publish argv exactly `["publish","--tag","next","--access","public","--registry=https://registry.npmjs.org/"]` + `--otp=…` when given, `{ inherit: true }`, bytes identical after, the transient write observed **inside** the fake publish as `version: "2.35.0-next.1"`); publish throws (exit 1, bytes identical); listeners added before the write and removed after (fake `signals` seam records order); restore failure (fake write fails on restore → `git checkout -- package.json` printed, exit 1). No `git commit|tag|push` call in any case.
2. `scripts/release-next.js` per design §7 until green. `require.main === module` entry; default runner mirrors `execCliSync`.
3. `package.json`: `"release:next": "node scripts/release-next.js"`.

**Verification.** `node --test test/release-next.test.js` · `npm test` · `node --check scripts/release-next.js` · `npm run release:next -- minor --dry-run` in this worktree → prints `Version: 2.35.0-next.1`, `GUARD Branch: FAIL`, exit 1, `git status --short` empty afterwards (this runs the real read-only `git fetch origin dev` and `npm view` — the only real commands allowed; no write) · `npm run pack:dry-run` lists no `scripts/release-next.js`.

| Verification field | Value |
|---|---|
| Falsifier | (1) Delete `"--tag", "next"` from the publish argv → the argv assertion red. (2) Skip the restore in `finally` → the success and publish-throws byte assertions red. (3) Register listeners after the write → the order assertion red. (4) Compare `N` as strings → the `next.10` case red (`next.9`+1 → `next.10` instead of `next.11`). Each executed post-change and quoted in the completion report |
| Red run | Tests written first; red at the **assertion** level requires a stub module exporting the functions (returning `null`/`1`) so `require` succeeds — a `Cannot find module` red is a setup red, not evidence |
| Disqualifier | Any test that touches the repo's own `package.json`, reaches the network, or calls a real `npm`/`git` — the green is void. A dry run that leaves `git status --short` non-empty |
| Consumers | none (new module) |

**Done.** All FR-2–FR-5 clauses above have a named test; four falsifiers executed red; `npm test` green; dry-run reading quoted.

---

### T2 — `release-status.js` prerelease partition + `release.js` next-step hints

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S–M (~50 release-status + ~10 release.js + ~120 tests) |
| Depends on | none |
| Requirements | FR-6 (statement; scenario: prerelease line, no drift; `AND IT MUST` stable drift still reported; `AND IT MUST` prerelease in `package.json` is drift naming `git checkout -- package.json`) · FR-9 (statement: PR-flow hints; `SHALL NOT` print `git tag`/`npm publish` as immediate steps; bump/CHANGELOG/notes/digests unchanged) · FR-8 · NFR-1, NFR-2 |
| Design refs | §7 *release-status.js*, §7 *release.js*, DD-8, DD-14; P-3, P-4, P-17 |
| Consumers | `.github/workflows/release-status.yml` runs `npm run release:status` (output only; exit semantics unchanged for stable versions). `grep -rn "release-status\|release:status\|Next steps" test/` → 0 hits at `15a3b61` |
| Review | `checklist`: small refactor behind a `require.main` guard plus hint text |

**Scope.**

1. `test/release-status.test.js` first: `partitionVersions` (`2.34.1`, `2.35.0-next.1`, `2.35.0-rc.1`); `releaseFailures` with a fake `check` — stable version missing artifacts → failure kept; prerelease never passed to `check`; `pkgVersion` prerelease → drift line containing `git checkout -- package.json`. Static read of `scripts/release.js`: the hint block (from `Next steps:` to the end of `main`) contains `release/v`, `PR into \`dev\``, `dev` → `master`, `docs/release-checklist.md`, and contains no line starting `  git tag` or `  npm publish`; the `git add` hint expression is unchanged.
2. `scripts/release-status.js`: exports + `require.main` guard + `releaseFailures` + prerelease lines in `main`.
3. `scripts/release.js`: replace lines 249–251 (`git tag`, `npm publish`) per design §7; nothing else.

**Verification.** `node --test test/release-status.test.js` · `npm test` · `node --check scripts/release-status.js scripts/release.js` · `npm run release:status` (read-only; exit code and stable sections as before, plus `npm next: none`, `npm prereleases: none`) · `git diff scripts/release.js` touches only `console.log` lines.

| Verification field | Value |
|---|---|
| Falsifier | (1) `partitionVersions` returns everything as stable → the `releaseFailures` prerelease test red (fake `check` called with `2.35.0-next.1`). (2) Drop the `pkgVersion` prerelease branch → its drift test red. (3) Restore the `git tag v${nextVersion}` hint line → the static hint test red. Baseline: `grep -n 'git tag\|npm publish' scripts/release.js` → `:97` (release-notes body, out of scope), `:250`, `:251` |
| Red run | Assertion-level: stub exports before the refactor so `require` succeeds without running `main()` (today `release-status.js:211` runs `main()` on load — requiring it unguarded would hit the network) |
| Disqualifier | A test that requires `release.js` (runs `main()`, writes `package.json`); `npm run release:status` exit code differing from its pre-change run for reasons other than this change |
| Consumers | `release-status.yml` (P-3) |

**Done.** FR-6 and FR-9 clauses each have a test; three falsifiers red; `release:status` before/after outputs quoted.

---

### T3 — Workflows run on `dev`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | XS (~4 YAML lines + ~40 test) |
| Depends on | T1 (syntax step names `scripts/release-next.js`) |
| Requirements | FR-1 (statement; scenario; `AND IT MUST` job name + matrix byte-identical; `BUT` keep `pull_request`, `workflow_dispatch`, inputs) · NFR-3 |
| Design refs | §4, §9, DD-11; P-2, P-12 |
| Consumers | GitHub branch protection required contexts (P-1, P-12) — job `name:` template untouched |
| Review | `checklist`: trigger lists only, but they feed the required checks |

**Scope.** `ci.yml:10` `branches: [master]` → `[master, dev]`; syntax step `+ node --check scripts/release-next.js`. `release-status.yml` list `- master` + `- dev`. New `test/branching-flow.test.js`: for each workflow, the `on.push.branches` block names `master` and `dev`; `ci.yml` still has `pull_request:`, `workflow_dispatch:`, `pty_loops`, `pty_inject_failure`, the exact line `    name: CLI on ${{ matrix.os }} / Node ${{ matrix.node }}`, `os: [ubuntu-latest, macos-latest, windows-latest]`, `node: [18, 22]`; the syntax step lists every `scripts/*.js` that CI checks today plus `release-next.js`.

**Verification.** `node --test test/branching-flow.test.js` · `npm test` · `git diff .github/` limited to the three lines. Real GitHub behavior on a `dev` push: **no local check** (requirements §8 accepted gap).

| Verification field | Value |
|---|---|
| Falsifier | (1) Revert `ci.yml:10` to `[master]` → push-branches assertion red. (2) Rename the job to `CLI ${{ matrix.os }}` → name assertion red. Baseline: `grep -n branches .github/workflows/*.yml` → `ci.yml:10 branches: [master]`, `release-status.yml:5 branches:` + `- master` |
| Red run | The test written first fails on the `dev` assertions against the unedited workflows |
| Disqualifier | A YAML dependency added (NFR-1); an assertion that matches anywhere in the file instead of inside the `push:` block |
| Consumers | branch protection contexts (P-12) |

---

### T4 — `AGENTS.md`: branch model, release rules, `Integration Branch: dev`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~40 lines + ~30 test) |
| Depends on | T1, T2 (names `release:next`, `--dry-run`, the new `release.js` hints) |
| Requirements | FR-7 (flow table rows Work, Preview, Stable prep, Stable ship, Resync; `AND IT MUST` pin line after `Default Branch: master` in `- Key: value` form; `AND IT MUST` no direct push to `dev`/`master`, admins included; `AND IT MUST` merge commit for `dev` → `master` and resync; `BUT` no surviving direct-to-`master` release instruction) |
| Design refs | DD-9, DD-10, §9; P-1, P-8, P-10 |
| Consumers | Pin readers (P-8): `bin/akili.js:1460-1461`, `kaizen` skill, `/akili-archive`, `/akili-resume`. `CLAUDE.md` imports `AGENTS.md` (`@AGENTS.md`). Tests: `agents-doctor`, `routing*` use their own temp `AGENTS.md` (P-9) |
| Review | `full`: rules document agents execute (two rounds budgeted) |

**Scope.** `- Integration Branch: dev` on the line after `- Default Branch: master`. *Release Rules*: the numbered flow rewritten to FR-7's table (release branch → PR `dev` → PR `dev`→`master` merge commit → tag/push tag/publish/verify dist-tags/`gh release create` on `master` → `sync/master-into-dev`), plus a prerelease subsection (`npm run release:next -- <bump> --dry-run` then without, from an up-to-date `dev`, never committed). *Development Rules*: one bullet — `master` and `dev` are protected (PR-only, six checks, up to date, admins included); `feat/*`/`fix/*` from `dev`; agents never commit to or push `dev`/`master` directly. Extend `test/branching-flow.test.js`: pin line position and form; Release Rules contain `release:next`, `--tag next`, `sync/master-into-dev`, `merge commit`.

**Verification.** `node --test test/branching-flow.test.js` · `npm test` · phrase-family sweep (KZ-changes--kaizen-loop-closure-2, keyed on the obligation, not the identifier): `grep -n -i "commit the release\|git tag\|publish\|push\|directly\|master" AGENTS.md` — read every hit; each describes the new flow or is unrelated (quote the hit list in the report).

| Verification field | Value |
|---|---|
| Falsifier | (1) Put the pin before `Default Branch:` → position assertion red. (2) Delete `sync/master-into-dev` → assertion red. Baseline: `grep -n "Integration Branch" AGENTS.md` → 0 hits; `AGENTS.md:17` `- Default Branch: master` |
| Red run | Test first: pin assertions red against the unedited `AGENTS.md` |
| Disqualifier | A sweep that greps only `master` (misses "commit the release version update" phrasing); a hit judged "compatible" without quoting it |
| Consumers | as above |

---

### T5 — `CONTRIBUTING.md`, `docs/release-checklist.md`, `README.md` release section, `CHANGELOG.md`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~130 lines) |
| Depends on | T4 (same flow wording) |
| Requirements | FR-7 (same flow in each file; no direct-to-`master` release instruction survives; *amended at the T4 gate:* the Kaizen `AND IT MUST` — one sentence in `AGENTS.md`'s *Kaizen Loop* bullet, DD-15) · R1 note (P-11): `@next` users install `@latest` to leave the channel; the update banner compares with `latest` only |
| Design refs | DD-9, DD-10; P-1, P-10, P-11 |
| Consumers | `test/akili-security-docs.test.js:34` and `test/diagram-design.test.js:409` read `README.md` (P-9) — both in `npm test` |
| Review | `full`: user-facing docs + CHANGELOG (KZ-002: quote-check every clause at HEAD; re-run P-1 before writing protection facts) |

**Scope.** `CONTRIBUTING.md` *Ground Rules* + *Development Workflow*: branch from `dev`, PR into `dev`, the six checks, up-to-date rule, admins included; new *Branches and Releases* section (FR-7 table, prerelease channel, resync). `docs/release-checklist.md`: *Release Policy* (Release Status runs on `master` and `dev` pushes), new *Prerelease (`next`)* section, *Verify Locally* starts on `release/vX.Y.Z` from `dev`, *Publish* after the `dev` → `master` merge on `master`, tag push, dist-tag verification before `gh release create` (existing Slack order kept), *Resync*. `README.md:410-446` "Controlled release flow" rewritten to the same flow (short, pointing at the checklist). `AGENTS.md` *Kaizen Loop* bullet: one sentence per DD-15 (Apply Mode runs on an up-to-date `dev` checkout; `git switch -c kaizen/apply-<YYYY-MM-DD>` before committing; PR into `dev`), plus a `test/branching-flow.test.js` assertion that the bullet names `kaizen/apply-` and `PR into \`dev\``. `CHANGELOG.md` `Unreleased` → `### Added` `release:next` and `### Changed` CI on `dev`, `release:status` prereleases, `release.js` hints, docs, pin — every clause quote-checked against HEAD (KZ-002); no link to this spec's active path (KZ-changes--archify-diagrams-1).

**Verification.** `npm test` · `git diff --check` · phrase-family sweep over the three docs: `grep -n -i "git tag\|npm publish\|push\|directly\|master" CONTRIBUTING.md docs/release-checklist.md README.md` — every hit read and quoted as new-flow or unrelated · `gh api repos/JuankCadavid/akili-specs/branches/dev/protection --jq …` re-run immediately before writing protection facts, time recorded (KZ-002).

| Verification field | Value |
|---|---|
| Falsifier | The sweep is the gate: a surviving `git tag vX.Y.Z` directly after `git commit` on the release prep in README (baseline `README.md:434`) makes it fail. Baseline hits: `CONTRIBUTING.md:7` ("Direct pushes to `master` are not accepted"), `README.md:434` (`git tag vX.Y.Z`), `docs/release-checklist.md:25` (Release Status "on pushes") |
| Red run | n/a — prose task; the sweep's baseline hits above are the pre-change reading |
| Disqualifier | A CHANGELOG clause not found verbatim-in-substance at HEAD; protection facts written from the 19:10 reading without the re-run |
| Consumers | as above |

---

## 3. Coverage Closure

| Clause | Task |
|---|---|
| FR-1 statement, scenario, `AND IT MUST`, `BUT` | T3 |
| FR-2 scenarios, numeric `N`, ignore others, `BUT` usage | T1 |
| FR-3 statement (unreadable facts), six guards, scenario + `AND IT MUST` + `BUT` | T1 |
| FR-4 statement (argv, otp, signals, restore failure), both scenarios, `AND IT MUST`, `BUT` | T1 |
| FR-5 statement, scenario, `BUT` | T1 |
| FR-6 statement, scenario, both `AND IT MUST` | T2 |
| FR-7 table rows, merge-commit `AND IT MUST`, pin `AND IT MUST`, no-direct-push `AND IT MUST`, `BUT` | T4 (AGENTS.md), T5 (other three docs) |
| FR-8 | T1, T2 (fake runner / pure functions; no real publish) |
| FR-9 statement, `SHALL NOT`, unchanged behavior | T2 |
| NFR-1 | T1, T2, T3 (no dependency) |
| NFR-2 | T1–T4 (`npm test`) |
| NFR-3 | T3 |
| NFR-4 | T1 (`pack:dry-run`) |

## 4. Estimate And PR Strategy

~780 LOC. One PR (from a `feat/` branch into `dev`) is reviewable: scripts + tests first, then workflows, then docs. The user opens it; this run makes local commits only.
