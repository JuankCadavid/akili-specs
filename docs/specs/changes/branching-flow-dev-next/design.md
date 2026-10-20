# Design: branching flow — `dev` integration branch and `next` prereleases

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branching-flow-dev-next` |
| Depth | **Standard** (re-checked §12) |
| Status | **Approved** — Phase 2 gate: `auto-approved (pre-approved mode)`, 2026-10-19, after judgment-day (`judgment.md`) |
| Requirements | `requirements.md` (FR-1–FR-8, NFR-1–NFR-4) |
| Verified at | `b458cf4` |
| Skills applied | `software-architect` not loaded — no new module, service, data flow or NFR shift (one CLI helper script beside two existing ones); `diagram-design` not loaded for the same reason; `error-handling-patterns` informs DD-4 |

## 2. Executive Summary

Add one maintainer script, `scripts/release-next.js`, built as a pure core plus an injected command runner, so tests drive it end to end offline. It writes the prerelease version into `package.json` only for the publish and restores the original bytes in `finally`, with a SIGINT listener so Ctrl-C also restores. `release-status.js` gains a prerelease partition and a `require.main` guard so it can be tested. Two workflow trigger lists gain `dev`. Four docs and `AGENTS.md` get one flow, and `AGENTS.md` gets the `Integration Branch: dev` pin.

## 3. Architecture Overview

```mermaid
flowchart LR
  A[npm run release:next -- bump] --> B[parseArgs]
  B --> C[gather: git branch / status / fetch / rev-parse, npm view versions]
  C --> D[computeVersion: bumpStable + nextN]
  D --> E{guards all hold?}
  E -- no --> F[print failures, exit 1, no write]
  E -- yes, --dry-run --> G[print plan, exit 0]
  E -- yes --> H[write package.json prerelease]
  H --> I[npm publish --tag next ...]
  I --> J[finally: restore original bytes]
```

Every arrow from C onward goes through one `exec(cmd, args, opts)` seam; `runReleaseNext` takes `{ argv, root, exec, log, error }` and returns an exit code.

## 4. Extended Directory Structure

| Path | Change |
|---|---|
| `scripts/release-next.js` | **new** — pure functions + `runReleaseNext` + `require.main` entry |
| `scripts/release-status.js` | `isPrerelease`, `partitionVersions`, `module.exports`, `require.main` guard; `main` prints a prerelease line |
| `package.json` | `scripts["release:next"] = "node scripts/release-next.js"`; `files` unchanged (NFR-4) |
| `.github/workflows/ci.yml` | `push.branches: [master, dev]`; syntax step adds `node --check scripts/release-next.js` |
| `.github/workflows/release-status.yml` | `push.branches` adds `dev` |
| `test/release-next.test.js` | **new** — FR-2–FR-5, FR-8 |
| `test/release-status.test.js` | **new** — FR-6 |
| `test/branching-flow.test.js` | **new** — FR-1 static read of both workflows; FR-7 pin + phrase-family checks |
| `AGENTS.md`, `CONTRIBUTING.md`, `docs/release-checklist.md`, `README.md`, `CHANGELOG.md` | docs (FR-7) |

## 5. Data Model

Only `package.json`'s `version` field, written transiently. Version grammar: stable `^\d+\.\d+\.\d+$`; prerelease `^<base>-next\.(\d+)$`. `isPrerelease(v)` in `release-status.js` = the version contains `-` (any preid, so a hand-published `-rc.1` is also exempt from stable drift checks).

## 6. API Design (CLI contract)

| Invocation | Effect | Exit |
|---|---|---|
| `release:next` (no bump) / unknown bump / unknown flag | usage on stderr | 1 |
| `release:next <bump> --dry-run` | guards + plan printed; no write, no publish | 1 if any guard fails, else 0 |
| `release:next <bump> [--otp=<code>]` | guards; on pass: write → publish → restore | publish's outcome (0 / 1); 1 on any guard failure |

Plan lines: `Version: X.Y.Z-next.N`, `Dist-tag: next`, `Publish: npm publish --tag next --access public --registry=https://registry.npmjs.org/` (the `--otp` value is never printed), and one `GUARD <name>: OK|FAIL — <reason>` per guard. On success: smoke hint `npx akili-specs@next list` and `npm view akili-specs dist-tags`.

## 7. Backend Module Design (`scripts/release-next.js`)

| Function | Pure? | Contract |
|---|---|---|
| `parseArgs(argv)` | yes | `{ bump, dryRun, otp }` or `{ error }` |
| `bumpStable(version, bump)` | yes | `X.Y.Z` → bumped `X.Y.Z`; throws on non-stable input |
| `nextPrereleaseVersion(base, versions)` | yes | `base-next.(max N + 1)`, numeric max over `^base-next\.(\d+)$` only |
| `evaluateGuards(facts)` | yes | facts `{ branch, porcelain, fetchOk, head, originDev, pkgVersion, versions, base }` → `[{ name, ok, reason }]` in FR-3's order |
| `runReleaseNext({ argv, root, exec, log, error })` | no | gathers facts via `exec`, prints plan, writes/publishes/restores; returns exit code |

Facts gathered (all via `exec`): `git rev-parse --abbrev-ref HEAD`, `git status --porcelain`, `git fetch origin dev` (a throw → `fetchOk: false`, the In-sync guard fails with the error's first line), `git rev-parse HEAD`, `git rev-parse origin/dev`, `npm view akili-specs versions --json --registry=…` (array, or a bare string for one version — normalized like `release-status.js` `getNpmMetadata`). An `npm view` failure fails the run before guards (exit 1, "unable to read npm versions").

Write/publish/restore (DD-3, DD-4): read original bytes as a Buffer; write `JSON.stringify({...pkg, version}, null, 2) + "\n"` atomically (wx temp + rename, mirroring `release.js` `atomicWriteFileSync`); register a no-op `SIGINT` listener; `exec("npm", ["publish", "--tag", "next", "--access", "public", "--registry=…", ...otp], { inherit: true })`; in `finally` restore the Buffer atomically and remove the listener.

`release-status.js`: `partitionVersions(versions)` → `{ stable, prerelease }`; `main` runs `checkVersion(v, true)` over `stable` only and prints `npm next: <dist-tags.next || none>` and `npm prereleases: <list || none>`.

## 8. Frontend / UX Component Architecture

n/a — no UI.

## 9. Shared Contracts or Package Extensions

- Required-check names come from `ci.yml`'s job `name:` template; it is not edited (FR-1).
- `AGENTS.md` pin line `- Integration Branch: dev`, read by `bin/akili.js` `/Integration Branch:\s*(\S+)/` (P-8) and by the `kaizen` skill's Branch Context.

## 10. Design Decisions

| ID | Decision | Rationale / rejected alternatives | Req |
|---|---|---|---|
| DD-1 | Ephemeral version in `package.json` (user Q1) | Committing needs a PR per preview on protected `dev`; `npm version` creates commit+tag | FR-4 |
| DD-2 | `N` from the registry, not from git tags | No prerelease tags exist or are required; registry is the source npm itself enforces (duplicates rejected). Traceability via published `gitHead` (P-6) | FR-2 |
| DD-3 | Restore original **bytes** (Buffer), not a re-serialized object | Re-serializing could reformat `package.json`; byte-identity is testable | FR-4 |
| DD-4 | No-op `SIGINT` listener during publish | Without it Ctrl-C kills Node before `finally` (P-7); with it the child dies, `execFileSync` throws, `finally` restores | FR-4 |
| DD-5 | Guards evaluated all at once and all reported; `--dry-run` still evaluates them | One run shows every blocker; lets the dry run be checked on a non-`dev` checkout (FR-5 scenario) | FR-3, FR-5 |
| DD-6 | Source-published guard | After a `release/vX.Y.Z` PR lands on `dev`, `package.json` holds an unpublished stable; bumping it would preview the wrong base | FR-3 |
| DD-7 | Own `bumpStable`, not `require("./release.js")` | `release.js` runs `main()` on load (P-4); changing it is out of scope | FR-2 |
| DD-8 | `release-status.js` gets `require.main === module` + exports | Needed to test `partitionVersions` without network (FR-8); the CLI behavior is unchanged | FR-6 |
| DD-9 | `dev` → `master` by merge commit, then a `master` → `dev` resync PR | With `strict`, the next `dev` → `master` PR must contain `master`'s tip (P-10); squash would diverge histories | FR-7 |
| DD-10 | Remove the direct-to-`master` release instructions; pin `Integration Branch: dev` (user Q2) | Protection forbids the old flow; see §11 reversion challenge | FR-7 |
| DD-11 | Static tests read the real workflow files and `AGENTS.md` | Real-artifact lock for FR-1 and the pin; a YAML parser is a new dependency (NFR-1), so the test matches the trigger lines textually | FR-1, FR-7 |

### Reversion challenge (Step 2.3) — DD-10

*What does removing the direct-to-`master` flow / making `master` non-writing for Kaizen break?*

1. **Kaizen pending items recorded "for master"** (several archived specs) are now applied on `dev` by Apply Mode — the skill resolves the pin, so the backlog is not lost and `/akili-resume` names `dev`. `AGENTS.md`'s *Kaizen Loop* bullet is already pin-generic ("the default branch, or the pinned integration branch when one exists"), so it needs no edit beyond the pin itself.
2. **`doctor --agents --fix` branch guard** in this repo now resolves to `dev` (P-8) — consistent with the model; this repo has no `.agents/` (`ls -d .agents` → absent), so no current run changes.
3. **`release-notify.yml`** fires on `release: published` — unchanged; the stable flow still ends with `gh release create`.

No unaddressed breakage.

## 11. Premise Ledger

**Count:** 12 verified · 1 `UNVERIFIED` (Low: 1, High: 0).
**Blast-radius triggers:** `consumer` (pin line, workflow job names, `release-status.js` CLI output, `package.json` scripts) and `shared-state` (`package.json` version written by two scripts). `live-path`: none apply — no user action dispatches to changed runtime code; `bin/akili.js` is not edited.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | `dev`/`master` require PR, 6 checks, strict, admins enforced | data-env | `gh api …/branches/{dev,master}/protection`, 2026-10-19 19:10 -05 | `b458cf4` | Docs (T4, T5) describe wrong gates — Low | — |
| P-2 | Both workflows push-trigger on `master` only | location | `.github/workflows/ci.yml:12-14`, `release-status.yml:3-8` | `b458cf4` | T3 unnecessary — Low | — |
| P-3 | `release-status.js` requires 4 artifacts for every npm version | location | `scripts/release-status.js` `main` loop over `npmMetadata.versions` → `checkVersion(version, true)` | `b458cf4` | T2 unnecessary — High | — |
| P-4 | `release.js` and `release-status.js` call `main()` at load | existence | last line `main();` in both files; `test/persona-digests.test.js:154-160` comment on why `release.js` is never required | `b458cf4` | DD-7/DD-8 unnecessary — Low | — |
| P-5 | `npm view … versions --json` returns a JSON array (string for one version) | data-env | `npm view akili-specs versions --json` → array ending `"2.34.1"` (npm 10.9.0); single-version string branch in `release-status.js` `getNpmMetadata` | `b458cf4` | `nextPrereleaseVersion` input normalization — Low | — |
| P-6 | Published metadata records `gitHead` | data-env | `npm view akili-specs@2.34.1 gitHead` → `b04e03f…` | `b458cf4` | DD-2 traceability needs tags — Low | — |
| P-7 | With a SIGINT listener, Ctrl-C during `execFileSync` throws and `finally` runs; without one, Node dies before `finally` | data-env | scratchpad `sig.js` driven by `expect` on a pty, Node v22.12.0 macOS: listener → `caught-h`=`SIGINT`, `fin-h` written; none → `CHILDKILLED SIGINT`, no `fin-n`. Maintainer-local behavior; CI never runs the real publish | `b458cf4` | DD-4 — Low | — |
| P-8 | Pin read as `/Integration Branch:\s*(\S+)/`; consumers: `doctor --agents --fix` guard, `kaizen` Branch Context, `/akili-archive`, `/akili-resume`, leader/implementer templates | consumer | `bin/akili.js:1460-1461`; `grep -rln "ntegration [Bb]ranch" .claude docs/*.md bin` → `leader.md`, `implementer.md`, `akili-resume.md`, `akili-archive.md`, `akili-constitution.md`, `kaizen/SKILL.md`, `docs/flow.md`, `docs/README.md`, `docs/cli.md`, `bin/akili.js` | `b458cf4` | Pin form must change — Low | — |
| P-9 | Tests that read this repo's root docs: `akili-security-docs.test.js` (README `/akili-security` lines), `diagram-design.test.js` (README); `agents-doctor`/`routing-io` write their own temp `AGENTS.md` | consumer | `grep -rn "CONTRIBUTING\|release-checklist\|README.md" test/*.js`; `grep -rln "AGENTS.md" test/*.js` | `b458cf4` | T4/T5 could break them — Low (run `npm test`) | — |
| P-10 | GitHub `strict` requires the PR head to contain the base tip, so a `dev` → `master` merge commit forces a `master` → `dev` resync | other | `UNVERIFIED — confirm at source before relying on it` | — | DD-9 resync step is superfluous (harmless) — Low | User, at the first stable release under the new flow |
| P-11 | Update check reads only `dist-tags.latest`; `akili update` installs `@latest` | location | `bin/akili.js:1883-1903` (`.latest`), `:997-1001` (`akili-specs@latest`) | `b458cf4` | R1 note in CONTRIBUTING wrong — Low | — |
| P-12 | Required-check names are produced by `name: CLI on ${{ matrix.os }} / Node ${{ matrix.node }}` | consumer | `ci.yml` job `cli` `name:`; protection contexts in P-1 | `b458cf4` | FR-1 `AND IT MUST` — Low | — |
| P-13 | `package.json` version is written by `release.js` and read at runtime by `bin/akili.js` (`:893`, `:1843`) | shared-state | `grep -n "pkg.version\|require(\"../package.json\")" scripts/release.js bin/akili.js` | `b458cf4` | None of them run during the publish window; `npm publish` packs the transient version — Low | — |

## 12. Budget (Step 2.4)

| Measure | Estimate |
|---|---|
| Tasks | 5 |
| LOC | ~700 (script ~190, tests ~300, release-status ~35, workflows ~4, docs ~170) |
| Review rounds | ~8 (T1 2, T2 1, T3 1, T4 2 — rules doc, T5 2 — docs + CHANGELOG, KZ-002) |

Matches Standard. `/akili-execute` stops and escalates past 6 tasks, ~900 LOC, or 11 review rounds.
