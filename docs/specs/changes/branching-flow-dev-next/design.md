# Design: branching flow — `dev` integration branch and `next` prereleases

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branching-flow-dev-next` |
| Depth | **Standard** (re-checked §12) |
| Status | **Approved** — judgment-day `JUDGMENT: APPROVED ✅` (`judgment.md`: 0 dual-confirmed severe; 2 single-judge severe citation errors settled at source and corrected; 8 warnings applied as architect amendments). Phase 2 gate: `auto-approved (pre-approved mode)`, 2026-10-19 |
| Requirements | `requirements.md` (FR-1–FR-9, NFR-1–NFR-4) |
| Verified at | `e28e106` (judged target); amendments re-cited at the same commit |
| Skills applied | `software-architect` / `diagram-design` not loaded — no new module, service, data flow or NFR shift (one CLI helper beside two existing ones); `error-handling-patterns` informs DD-4, DD-12 |

## 2. Executive Summary

Add `scripts/release-next.js`: a pure core plus an injected command runner, so tests drive it end to end offline. It writes the prerelease version into `package.json` only for the publish and restores the original bytes in `finally`, with SIGINT/SIGTERM/SIGHUP listeners registered **before** the write so an interrupted run also restores. `release-status.js` gains a prerelease partition, a pure failure collector and a `require.main` guard. `release.js` only changes its printed next steps. Two workflow trigger lists gain `dev`. Four docs and `AGENTS.md` get one flow (with a `sync/master-into-dev` resync and merge-commit rule), and `AGENTS.md` gets the `Integration Branch: dev` pin.

## 3. Architecture Overview

```mermaid
flowchart LR
  A[npm run release:next -- bump] --> B[parseArgs]
  B --> C[gather facts, each try/catch → null]
  C --> D[computeBase + nextN, null-safe]
  D --> E{every guard holds?}
  E -- no --> F[print plan + all failures, exit 1, no write]
  E -- yes, --dry-run --> G[print plan, exit 0]
  E -- yes --> H[listen SIGINT/TERM/HUP, then write package.json]
  H --> I[npm publish --tag next ...]
  I --> J[finally: restore bytes, remove listeners]
```

Every command goes through one `exec(cmd, args, opts)` seam; `runReleaseNext` takes `{ argv, root, exec, log, error, signals }` and returns an exit code.

## 4. Extended Directory Structure

| Path | Change |
|---|---|
| `scripts/release-next.js` | **new** — pure functions + `runReleaseNext` + `require.main` entry; default runner mirrors `bin/akili.js` `execCliSync` |
| `scripts/release-status.js` | `isPrerelease`, `partitionVersions`, `releaseFailures`, `module.exports`, `require.main` guard; `main` prints prerelease lines |
| `scripts/release.js` | next-step hint lines only (FR-9) |
| `package.json` | `scripts["release:next"] = "node scripts/release-next.js"`; `files` unchanged (NFR-4) |
| `.github/workflows/ci.yml` | `push.branches: [master, dev]`; syntax step adds `node --check scripts/release-next.js` |
| `.github/workflows/release-status.yml` | `push.branches` adds `dev` |
| `test/release-next.test.js` | **new** — FR-2–FR-5, FR-8 |
| `test/release-status.test.js` | **new** — FR-6 |
| `test/branching-flow.test.js` | **new** — FR-1 workflows, FR-7 pin + phrase checks, FR-9 hints (static reads of real files) |
| `AGENTS.md`, `CONTRIBUTING.md`, `docs/release-checklist.md`, `README.md`, `CHANGELOG.md` | docs (FR-7) |

## 5. Data Model

Only `package.json`'s `version`, written transiently. Stable: `^\d+\.\d+\.\d+$`. Prerelease of a base: the string starts with `<base>-next.` and the remainder is all digits — prefix + split parsing, no regex built from the version (dots never need escaping). `isPrerelease(v)` in `release-status.js` = the version contains `-` (any preid; a hand-published `-rc.1` is also exempt from stable drift checks).

## 6. API Design (CLI contract)

| Invocation | Effect | Exit |
|---|---|---|
| no bump / unknown bump / unknown flag / `--otp` not 6–8 digits | usage on stderr | 1 |
| `release:next <bump> --dry-run` | facts + guards + plan printed; no write, no publish | 1 if any guard fails, else 0 |
| `release:next <bump> [--otp=<code>]` | guards; on pass: listen → write → publish → restore | 0 on publish success; 1 on guard failure, publish failure, or restore failure |

Plan lines: `Version: <X.Y.Z-next.N | n/a>`, `Dist-tag: next`, `Publish: npm publish --tag next --access public --registry=https://registry.npmjs.org/` (the `--otp` value never printed), one `GUARD <name>: OK|FAIL — <reason>` per guard, and `If interrupted: git checkout -- package.json`. On success: `npx akili-specs@next list`, `npm view akili-specs dist-tags`.

## 7. Backend Module Design

### `scripts/release-next.js`

| Function | Pure? | Contract |
|---|---|---|
| `parseArgs(argv)` | yes | `{ bump, dryRun, otp }` or `{ error }`; `--otp=` must match six to eight digits |
| `bumpStable(version, bump)` | yes | stable → bumped stable; returns `null` for non-stable input (never throws) |
| `nextPrereleaseVersion(base, versions)` | yes | `base-next.(max N + 1)` over versions with prefix `base-next.` and an all-digit rest, numeric max |
| `maxStable(versions)` | yes | highest stable by numeric triple compare, or `null` |
| `evaluateGuards(facts)` | yes | facts `{ branch, porcelain, fetchError, head, originDev, pkgVersion, versions, base }` (any may be `null`) → `[{ name, ok, reason }]` in FR-3 order: Branch, Clean, In sync, Stable source, Source published, Base ahead. A `null` fact fails its guard with "unreadable: <first error line>"; `base: null` fails Base ahead with "n/a — no stable source" |
| `runReleaseNext({ argv, root, exec, log, error, signals })` | no | gathers facts, prints plan, writes/publishes/restores; returns exit code |

Facts (each in its own try/catch, via `exec`): `git rev-parse --abbrev-ref HEAD`, `git status --porcelain`, `git fetch origin dev` (error → `fetchError`, In sync fails), `git rev-parse HEAD`, `git rev-parse origin/dev` (missing ref → `null`), `npm view akili-specs versions --json --registry=…` (array, or a bare string for one version, normalized as in `release-status.js` `getNpmMetadata`; failure → `versions: null`, Source published and Base ahead fail "unreadable").

Write/publish/restore (DD-3, DD-4, DD-12): read the original bytes as a Buffer; register no-op listeners for `SIGINT`, `SIGTERM`, `SIGHUP` through the `signals` seam (default `process`); then write `JSON.stringify({ ...pkg, version }, null, 2) + "\n"` atomically (wx temp + rename, mirroring `release.js` `atomicWriteFileSync`); `exec("npm", ["publish", "--tag", "next", "--access", "public", "--registry=…", ...otp], { inherit: true })`; `finally`: restore the Buffer atomically, remove the listeners; a restore failure prints `git checkout -- package.json` and makes the exit 1.

Default runner: `execFileSync` without a shell on POSIX; on Windows `npm.cmd` with `shell: true`, the same rule as `bin/akili.js` `execCliSync` — safe only because every argument is a literal or the validated `--otp` (DD-13).

### `scripts/release-status.js`

`partitionVersions(versions)` → `{ stable, prerelease }`. `releaseFailures({ pkgVersion, stablePublished, check })` → failures: `check(v)` result for every stable published version (the four-artifact rule, unchanged), plus a drift line when `pkgVersion` is a prerelease ("package.json holds prerelease X — run `git checkout -- package.json`"). `main` keeps its network/git reads, prints `npm next: <dist-tags.next || none>` and `npm prereleases: <list || none>`, and calls `releaseFailures`. CLI output for stable versions is unchanged.

### `scripts/release.js` (FR-9)

Only the `console.log` lines after `Prepared vX.Y.Z.` change: verify commands, `git add …` (same KZ-004 write set), `git commit -m "chore(release): vX.Y.Z"` on the `release/vX.Y.Z` branch, then "open a PR into `dev`, then a PR `dev` → `master` (merge commit); after it merges, on `master`: `git tag vX.Y.Z`, `git push origin vX.Y.Z`, `npm publish …`, `gh release create` — see docs/release-checklist.md".

## 8. Frontend / UX Component Architecture

n/a — no UI.

## 9. Shared Contracts or Package Extensions

- Required-check names come from `ci.yml`'s job `name:` template; it is not edited (FR-1).
- `AGENTS.md` pin line `- Integration Branch: dev`, read by `bin/akili.js` `/Integration Branch:\s*(\S+)/` (P-8) and by the `kaizen` skill's Branch Context.

## 10. Design Decisions

| ID | Decision | Rationale / rejected alternatives | Req |
|---|---|---|---|
| DD-1 | Ephemeral version in `package.json` (user Q1) | Committing needs a PR per preview on protected `dev`; `npm version` creates commit + tag | FR-4 |
| DD-2 | `N` from the registry, not git tags | npm is the authority (duplicates rejected); traceability via published `gitHead` (P-6) | FR-2 |
| DD-3 | Restore original **bytes** (Buffer) | Re-serializing could reformat; byte identity is testable | FR-4 |
| DD-4 | No-op SIGINT/SIGTERM/SIGHUP listeners registered **before** the write | Without them a signal kills Node before `finally` (P-7); registering after the write leaves a window (judge B F-4). SIGKILL is uncoverable: the Clean and Stable-source guards catch the leftover on the next run, and `release:status` flags it (FR-6) | FR-4, FR-6 |
| DD-5 | All guards evaluated and reported; `--dry-run` evaluates them too; unreadable facts fail their guard | One run shows every blocker; FR-5 dry run works off `dev` and with no `origin/dev` (P-15) | FR-3, FR-5 |
| DD-6 | Source-published guard | After a `release/vX.Y.Z` PR lands on `dev`, `package.json` holds an unpublished stable | FR-3 |
| DD-7 | Own `bumpStable`, not `require("./release.js")` | `release.js` runs `main()` on load (P-4) | FR-2 |
| DD-8 | `release-status.js`: `require.main` guard + exports + pure `releaseFailures` | Tests reach the drift path, not only the partition, without network | FR-6 |
| DD-9 | Merge commit for `dev` → `master` **and** for the resync; resync is a `sync/master-into-dev` branch cut from `dev` with `origin/master` merged in, PR'd into `dev` | Under `strict` a PR head must contain the base tip (P-10). A `master` → `dev` PR whose head is `master` deadlocks once `dev` advances, because updating it means pushing to protected `master` (both judges). Squash/rebase on either PR leaves `master`'s merge commit outside `dev` | FR-7 |
| DD-10 | Remove the direct-to-`master` release instructions; pin `Integration Branch: dev` (user Q2) | Protection forbids the old flow; reversion challenge below | FR-7 |
| DD-11 | Static tests read the real workflow files, `AGENTS.md` and `release.js` | Real-artifact lock; a YAML parser would be a new dependency (NFR-1), so trigger lines are matched textually | FR-1, FR-7, FR-9 |
| DD-12 | `Base ahead` (base > max published stable) replaces "base unpublished" | Also refuses a stale `dev` whose `package.json` is behind npm (both judges, suggestion) | FR-3 |
| DD-13 | Windows-safe default runner + `--otp` digit validation | `npm` is `npm.cmd` on Windows (P-16); with `shell: true` an unvalidated argument would reach a shell | FR-4 |
| DD-15 | Kaizen Apply Mode lands through `kaizen/apply-<YYYY-MM-DD>` + PR into `dev` (one sentence in `AGENTS.md`, owned by T5) | User decision 2026-10-19 at the T4 gate; the T4 Reviewer found the *Kaizen Loop* rule and the *Branch model* rule could not both be followed. Switching branches after the edits (not before) keeps the skill's apply-capable check on `dev` | FR-7 |
| DD-14 | `release.js` hint lines follow the PR flow; behavior untouched | Its old hints (`git tag`, `npm publish` right after the bump) would tag a release-branch commit (both judges) | FR-9 |

### Reversion challenge (Step 2.3) — DD-10, DD-14

*What does removing the direct-to-`master` flow / making `master` non-writing for Kaizen break?*

1. **Kaizen pending items recorded "for master"** (several archived specs) are now applied on `dev` by Apply Mode — the skill resolves the pin, so the backlog is not lost and `/akili-resume` names `dev`. `AGENTS.md`'s *Kaizen Loop* bullet is pin-generic ("the default branch, or the pinned integration branch when one exists"). *Amended 2026-10-19 at the T4 gate:* it does need one sentence — with `dev` protected, Apply Mode's edits cannot be committed on `dev`; they move to a `kaizen/apply-<YYYY-MM-DD>` branch before the commit and land through a PR into `dev` (DD-15). The `kaizen` skill is unchanged: Apply Mode still runs on the `dev` checkout, so the Branch Context resolves it as apply-capable.
2. **`doctor --agents --fix` branch guard** in this repo now resolves to `dev` (P-8); this repo has no `.agents/` (`ls -d .agents` → absent), so no current run changes.
3. **`release-notify.yml`** fires on `release: published` — unchanged; the stable flow still ends with `gh release create`.
4. **`release.js` hints** (DD-14) — nothing parses them (`grep -rn "Next steps" test/ scripts/ bin/` → `scripts/release.js:241` plus two unrelated `bin/akili.js` install/doctor hints; no test hit).

No unaddressed breakage.

## 11. Premise Ledger

**Count:** 16 verified · 1 `UNVERIFIED` (by Impact: Low 1, High 0).
**Blast-radius triggers:** `consumer` (pin line, workflow job names, `release-status.js` output, `release.js` hints, `package.json` scripts) and `shared-state` (`package.json` version written by two scripts). `live-path`: none apply — no user action dispatches to changed runtime code; `bin/akili.js` is not edited.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | `dev`/`master`: PR required, 0 approvals, six checks, `strict`, `enforce_admins`, conversation resolution required, `required_linear_history: false`, no force push | data-env | `gh api …/branches/{dev,master}/protection`, 2026-10-19 19:10 -05; linear-history and conversation fields re-read by both judges | `e28e106` | Docs (T4, T5) describe wrong gates; merge-commit flow (DD-9) blocked if linear history were on — High | — |
| P-2 | Both workflows push-trigger on `master` only | location | `.github/workflows/ci.yml:9-10`, `release-status.yml:3-8` (`cat -n`) | `e28e106` | T3 unnecessary — Low | — |
| P-3 | `release-status.js` requires 4 artifacts for every npm version | location | `scripts/release-status.js` `main` loop over `npmMetadata.versions` → `checkVersion(version, true)` | `e28e106` | T2 unnecessary — High | — |
| P-4 | `release.js` and `release-status.js` call `main()` at load | existence | `release.js:254`, `release-status.js:211`; `test/persona-digests.test.js:154-160` | `e28e106` | DD-7/DD-8 unnecessary — Low | — |
| P-5 | `npm view … versions --json` returns an array (string for one version) | data-env | `npm view akili-specs versions --json` → array ending `"2.34.1"` (npm 10.9.0); string branch in `release-status.js` `getNpmMetadata` | `e28e106` | Input normalization — Low | — |
| P-6 | Published metadata records `gitHead` | data-env | `npm view akili-specs@2.34.1 gitHead` → `b04e03f…` | `e28e106` | DD-2 needs tags — Low | — |
| P-7 | With no-op listeners, SIGINT (pty Ctrl-C), SIGTERM (to Node) and SIGHUP (pty close) during `execFileSync` let `finally` run; with none, SIGINT kills Node before `finally` | data-env | scratchpad `sig.js`/`sig2.js` via `expect`, Node v22.12.0 macOS: listener → `fin-h`, `f2-term`, `f2-hup` written; no listener → `CHILDKILLED SIGINT`, no `fin-n`. Maintainer-local; CI never runs the real publish; Windows not probed | `e28e106` | DD-4 — Low | — |
| P-8 | Pin read as `/Integration Branch:\s*(\S+)/`; consumers: `doctor --agents --fix` guard, `kaizen` Branch Context, `/akili-archive`, `/akili-resume`, leader/implementer templates | consumer | `bin/akili.js:1460-1461`; `grep -rln "ntegration [Bb]ranch" .claude docs/*.md bin` → `leader.md`, `implementer.md`, `akili-resume.md`, `akili-archive.md`, `akili-constitution.md`, `kaizen/SKILL.md`, `docs/flow.md`, `docs/README.md`, `docs/cli.md`, `bin/akili.js`. The `docs/` hits describe the pin generically for target projects; none restates this repo's flow, so none is in the FR-7 sweep | `e28e106` | Pin form must change — Low | — |
| P-9 | Tests reading this repo's root docs: `akili-security-docs.test.js:34` (README), `diagram-design.test.js:409` (README; `:400` reads `docs/skills/README.md`), `akili-security-command.test.js:614` (test title only, reads command frontmatter); `agents-doctor`, `routing-io`, `routing` use temp or fixture `AGENTS.md` | consumer | `grep -rn "CONTRIBUTING\|release-checklist\|README.md" test/*.js`; `grep -rn "AGENTS.md" test/*.js` | `e28e106` | T4/T5 could break them — Low (`npm test` in both) | — |
| P-10 | Under `strict`, a PR head must contain the base tip; after a `dev` → `master` merge commit `M`, `dev` lacks `M`, so `dev` must re-absorb `master` before the next `dev` → `master` PR | other | `UNVERIFIED — confirm at source before relying on it`. Basis: ancestry (M's parents are `master`'s old tip and `dev`'s tip) + GitHub's documented `strict` semantics; both judges tried to refute it by reasoning and could not; no live PR was run (user rule) | — | The resync step is unnecessary but harmless; the `sync/*` branch shape (DD-9) is needed either way to avoid pushing to `master` — Low | User, at the first stable release under the new flow |
| P-11 | Update check reads only `dist-tags.latest`; `akili update` installs `@latest` | location | `bin/akili.js:1883-1903`, `:997-1001` | `e28e106` | R1 note in CONTRIBUTING wrong — Low | — |
| P-12 | Required-check names come from `name: CLI on ${{ matrix.os }} / Node ${{ matrix.node }}` | consumer | `ci.yml` job `cli` `name:`; contexts in P-1 | `e28e106` | FR-1 `AND IT MUST` — Low | — |
| P-13 | This repo's `package.json` version is written by `release.js` (`:226-231`) and read at runtime by `bin/akili.js:1843`; `bin/akili.js:893` reads an *installed copy's* `package.json` (`update`), not the repo's | shared-state | `grep -n "pkg.version\|require(\"../package.json\")" scripts/release.js bin/akili.js`; `sed -n 885,895p bin/akili.js` | `e28e106` | None runs during the publish window; `npm publish` packs the transient version — Low | — |
| P-14 | A prerelease tarball ships `digests.json` with the stable `version`; `doctor --agents --fix` passes `currentVersion` to `migratePersona`, so `release || table.version` uses the prerelease string, and `MIGRATION_RECORD_RE` (`\S+`) accepts it | data-env | `bin/akili.js:1710`; `bin/persona.js:781`, `:14` | `e28e106` | A `@next` user's migration marker would carry the stable version — Low | — |
| P-15 | `origin/dev` may be absent locally (this worktree) | data-env | `git branch -a` → only `remotes/origin/master` (judge A); `git rev-parse origin/dev` → `fatal: ambiguous argument` | `e28e106` | DD-5 null-safe facts unnecessary — Low | — |
| P-16 | On Windows `npm` is a `.cmd` shim needing `shell: true` under CVE-2024-27980 | data-env | `bin/akili.js:12-20` `execCliSync` and its comment | `e28e106` | DD-13 unnecessary — Low | — |
| P-17 | `release.js` has no branch guard (only `assertCleanGit`), so running it on `release/vX.Y.Z` works | existence | `scripts/release.js:43-48`, `main` | `e28e106` | Flow step "release:<bump> on release/*" would need a flag — Low | — |

## 12. Budget (Step 2.4)

| Measure | Estimate |
|---|---|
| Tasks | 5 |
| LOC | ~780 (release-next ~220, tests ~340, release-status ~50, release.js hints ~10, workflows ~4, docs ~160) |
| Review rounds | 8 (T1 2, T2 1, T3 1, T4 2 — rules doc, T5 2 — docs + CHANGELOG under KZ-002) |

Matches Standard. `/akili-execute` stops and escalates past 6 tasks, ~1000 LOC, or 11 review rounds. *Amended 2026-10-19 at the T4 gate (user): LOC tripwire raised to ~1200* — actuals ~950 after T4, T5 projected ~130; the overrun is test LOC (KZ-bugfix--init-ctrlc-abort-2), not scope.
