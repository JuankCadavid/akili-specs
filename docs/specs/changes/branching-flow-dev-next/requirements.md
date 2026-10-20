# Requirements: branching flow — `dev` integration branch and `next` prereleases

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branching-flow-dev-next` |
| Depth | **Standard** |
| Type | Change |
| Deliverable | software |
| Approval Mode | `pre-approved (user, 2026-10-19)` — "Sigue el ciclo AKILI completo hasta archivar y detente en decisiones reales de producto"; re-stated after Q1/Q2: "Continúa el ciclo hasta archivar, solo commits locales". Escalations (HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG`, destructive actions) still stop |
| Status | **Approved** — Phase 1 gate: `auto-approved (pre-approved mode)`, 2026-10-19 |
| Date | 2026-10-19 |
| Source | `proposal.md` (commit `b458cf4`): Option A; user decisions Q1 = ephemeral prerelease version (never committed to `dev`), Q2 = pin `Integration Branch: dev` |
| Execution limits | Local commits only: no push, PR, tag, GitHub Release, or `npm publish` |
| Format precedent | `docs/specs/archive/2026-10-19-bugfix--update-check-deadline/requirements.md`. No `docs/specs/general-setup/`, `docs/prd.md` or `docs/trd/` in this repo (`ls docs docs/specs`, as run 2026-10-19) |
| Verified at | `b458cf4` |
| Deviations from proposal | none in intent. Judgment-day amendments (`judgment.md`, 2026-10-19): FR-3 guard *Base ahead* replaces *Base unpublished*; FR-4 restores on SIGINT/SIGTERM/SIGHUP and validates `--otp`; FR-6 flags a prerelease left in `package.json`; FR-7 resync goes through a `sync/*` branch; FR-9 added (`release.js` hints) |

## 2. Executive Summary

The repo's tooling and docs SHALL match the branch model live on GitHub since 2026-10-19: CI and Release Status run on pushes to `dev`; a new `npm run release:next` publishes `X.Y.Z-next.N` under the `next` dist-tag from an up-to-date `dev` checkout without committing the version or touching `latest`; `release:status` stops reading prereleases as drift; contributor, release and agent docs describe one flow (`feat/*`/`fix/*` → `dev` → `master`) and this repo pins `Integration Branch: dev`.

## 3. Glossary

| Term | Meaning |
|---|---|
| Stable version | `X.Y.Z` with no prerelease suffix; published under `latest` |
| Prerelease | `X.Y.Z-next.N`, `N` ≥ 1; published under the `next` dist-tag only |
| Base | The `X.Y.Z` a prerelease previews: the stable `package.json` version bumped by `patch`/`minor`/`major` |
| Ephemeral bump | The prerelease version is written to `package.json` only for the duration of the publish and restored afterwards; it is never committed |
| Up-to-date `dev` | Current branch `dev`, clean working tree, `HEAD` equal to `origin/dev` after a fetch |
| Required checks | The six status contexts `CLI on <ubuntu\|macos\|windows>-latest / Node <18\|22>` that protect `dev` and `master` |

## 4. System Context & Scope

- `dev` and `master` require a PR, 0 approvals, the six required checks, `strict` (up-to-date), `enforce_admins` (`gh api repos/JuankCadavid/akili-specs/branches/{dev,master}/protection`, as run 2026-10-19 19:10 -05).
- `ci.yml` and `release-status.yml` trigger on `push` to `master` only, plus every `pull_request` and `workflow_dispatch` (`.github/workflows/ci.yml:9-10`, `release-status.yml:3-8`).
- `release.js` accepts only `X.Y.Z` (`scripts/release.js` `bumpVersion`); `release-status.js` requires CHANGELOG section, release notes, remote tag and GitHub Release for every npm version (`scripts/release-status.js` `main` → `checkVersion(version, true)`); both call `main()` on load.
- npm dist-tags: `{ "latest": "2.34.1" }` (`npm view akili-specs dist-tags --json`, as run 2026-10-19 19:10 -05). Published metadata already records `gitHead` (`npm view akili-specs@2.34.1 gitHead` → `b04e03f…`).
- **Out of scope:** pushing, PRs, tags, publishing, GitHub settings; the update-check banner and `akili update` for `@next` users; GitHub Releases or CHANGELOG sections for prereleases; CI-driven publishing; `release.js` stable bump semantics; moving the `next` tag after a stable release.

## 5. Stakeholders / Personas

| Who | Needs |
|---|---|
| Maintainer | Publish a preview from `dev` in one command, without a PR per preview and without risk to `latest` |
| Contributor | Know that PRs target `dev` and branch from it |
| AKILI agents working in this repo | Rules that never tell them to commit or push to `master`/`dev` directly; Kaizen Apply Mode on `dev` |
| Early adopter | `npm i akili-specs@next` installs the newest preview |

## 6. Functional Requirements

### FR-1: CI and Release Status run on pushes to `dev`

`ci.yml` and `release-status.yml` SHALL trigger on `push` to `master` and to `dev`, keeping their `pull_request` and `workflow_dispatch` triggers.

#### Scenario: Push to `dev`

- GIVEN a commit pushed (merged) to `dev`
- WHEN GitHub evaluates workflow triggers
- THEN both `CI` and `Release Status` run
- AND IT MUST keep the CI job name template `CLI on ${{ matrix.os }} / Node ${{ matrix.node }}` and the matrix `os: [ubuntu-latest, macos-latest, windows-latest]`, `node: [18, 22]` byte-identical, because those names are the required checks
- BUT it must NOT drop the `pull_request` or `workflow_dispatch` triggers or the dispatch inputs

### FR-2: `release:next` computes the prerelease version

`npm run release:next -- <patch|minor|major>` SHALL compute `base` = bump of the stable `package.json` version and `N` = 1 + the highest `N` among published `base-next.N` versions (1 when none).

#### Scenario: First preview of a minor

- GIVEN `package.json` at `2.34.1` and no published `2.35.0-next.*`
- WHEN `release:next minor` runs
- THEN the version is `2.35.0-next.1`

#### Scenario: Next preview

- GIVEN published `2.35.0-next.1` and `2.35.0-next.2`
- WHEN `release:next minor` runs
- THEN the version is `2.35.0-next.3`
- AND IT MUST compare `N` numerically (`next.10` > `next.9`) and ignore other bases and other preids
- BUT it must NOT accept a missing or unknown bump argument (exit 1, usage message)

### FR-3: `release:next` refuses unless every guard holds

Before writing or publishing, the script SHALL evaluate every guard below — a fact that cannot be read (no `origin/dev`, a failed fetch, a non-stable version) fails its guard with a reason rather than aborting the run — and refuse with exit 1 naming every failed guard:

| Guard | Holds when |
|---|---|
| Branch | current branch is `dev` |
| Clean | `git status --porcelain` is empty |
| In sync | after `git fetch origin dev`, `HEAD` equals `origin/dev` |
| Stable source | `package.json` version is a stable `X.Y.Z` |
| Source published | the `package.json` version is published on npm (a stable release in progress must finish first) |
| Base ahead | `base` is greater than every published stable version (so an already-published base, or a stale `dev` behind npm, refuses) |

#### Scenario: Not on `dev`

- GIVEN the current branch is `feat/x`
- WHEN `release:next minor` runs
- THEN it exits 1 naming the Branch guard
- AND IT MUST leave `package.json` byte-identical
- BUT it must NOT run `npm publish`

### FR-4: `release:next` publishes under `next` and restores `package.json`

With all guards holding, the script SHALL write the prerelease version into `package.json`, run `npm publish --tag next --access public --registry=https://registry.npmjs.org/` (forwarding a given `--otp=<code>`, accepted only as 6–8 digits), and restore `package.json` to its original bytes whether the publish succeeds, fails, or the run receives SIGINT, SIGTERM or SIGHUP. If the restore itself fails, it SHALL print the recovery command `git checkout -- package.json` and exit non-zero.

#### Scenario: Successful publish

- GIVEN an up-to-date `dev` and computed version `2.35.0-next.1`
- WHEN the publish command exits 0
- THEN `package.json` is byte-identical to before and the tree is clean
- AND IT MUST pass `--tag next` in the publish argv
- BUT it must NOT run `git commit`, `git tag`, `git push`, or any command that changes the `latest` dist-tag

#### Scenario: Failed publish

- GIVEN the publish command exits non-zero
- WHEN the script ends
- THEN it exits non-zero and `package.json` is byte-identical to before

### FR-5: `--dry-run` publishes nothing

`release:next <bump> --dry-run` SHALL evaluate every guard, print the computed version, the dist-tag and the publish command, and SHALL neither write `package.json` nor run `npm publish`; it exits 1 when any guard fails and 0 otherwise.

#### Scenario: Dry run off `dev`

- GIVEN this worktree on `JuankCadavid/branching-flow` with `package.json` `2.34.1`
- WHEN `npm run release:next -- minor --dry-run` runs
- THEN it prints `2.35.0-next.1` and the failed Branch guard, exits 1
- BUT it must NOT write any file or run `npm publish`

### FR-6: `release:status` treats prereleases as prereleases

`release:status` SHALL list published prerelease versions (any version with a `-` suffix) separately with the `next` dist-tag, and SHALL NOT require a CHANGELOG section, release notes, tag or GitHub Release for them.

#### Scenario: A `next` version is published

- GIVEN npm versions `…, 2.34.1, 2.35.0-next.1`
- WHEN `release:status` runs
- THEN `2.35.0-next.1` appears in a prerelease line and produces no drift failure
- AND IT MUST still report drift for a stable version missing any of the four artifacts
- AND IT MUST report drift when the local `package.json` version is itself a prerelease (an interrupted `release:next`), naming `git checkout -- package.json`

### FR-7: Docs and agent rules describe one flow

`CONTRIBUTING.md`, `docs/release-checklist.md`, the `README.md` release section and `AGENTS.md` SHALL describe the same flow:

| Step | Flow |
|---|---|
| Work | `feat/<name>` / `fix/<name>` branch from `dev` → PR into `dev` (six checks green, branch up to date) |
| Preview | From an up-to-date `dev`: `npm run release:next -- <bump>` (dry run first) → `npm i akili-specs@next` |
| Stable prep | `release/vX.Y.Z` branch from `dev` → `npm run release:<bump>` → PR into `dev` |
| Stable ship | PR `dev` → `master` (merge commit) → after merge, on `master`: tag `vX.Y.Z`, push the tag, `npm publish` (latest), verify dist-tags, `gh release create` |
| Resync | Branch `sync/master-into-dev` from `dev`, `git merge origin/master`, PR into `dev`; merged with a merge commit, so the next `dev` → `master` PR is up to date |

- AND IT MUST name the merge method: **merge commit** for `dev` → `master` and for the resync PR (squash or rebase there would leave `master`'s merge commit outside `dev`)

- AND IT MUST add `Integration Branch: dev` to `AGENTS.md`, on the line after `Default Branch: master`, in the same `- Key: value` form
- AND IT MUST state that no one (admins included) pushes directly to `dev` or `master`
- BUT no surviving sentence in those four files may instruct committing or pushing a release directly to `master`

### FR-8: Tests run the prerelease flow without publishing

`npm test` SHALL cover FR-2–FR-6 through an injected command runner; no test may invoke the real `npm publish`, `git fetch`, or write the repository's own `package.json`.

### FR-9: `release.js` next-step hints follow the PR flow

`npm run release:<bump>` SHALL print next steps that match FR-7 (commit on the `release/vX.Y.Z` branch, PR into `dev`, then PR `dev` → `master`, and tag/publish/`gh release create` on `master` after the merge), and SHALL NOT print `git tag` or `npm publish` as steps to run right after the bump. Its bump, CHANGELOG, release-notes and digests behavior is unchanged.

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | No new dependencies; Node ≥ 18 (`engines`) |
| NFR-2 | The test suite passes on all six CI legs (fake runner, temp dirs) |
| NFR-3 | `scripts/release-next.js` passes `node --check` in CI's syntax step |
| NFR-4 | The new script is not shipped in the npm package (`files` unchanged) |

## 8. Defect Classes → Gate

| Defect class | Gate |
|---|---|
| Wrong version / `N` | Unit tests on the pure computation (FR-2), with numeric-ordering fixture |
| Publish without `--tag next` (moves `latest`) | Test asserting the publish argv; falsifier removes `--tag next` |
| `package.json` left modified | Tests on success and failure paths comparing bytes in a temp root; the failure path is what a signal produces (the child dies, the sync call throws). The real signal path is probed manually (design P-7) — **no automated check**, accepted |
| `npm` not spawnable on Windows | Default runner mirrors `execCliSync`; `--otp` validated before it reaches a shell. **No automated check** (fake runner in tests) — accepted; maintainer runs macOS |
| `release.js` hints contradict the flow | Static read of `scripts/release.js` hint lines in a test |
| Guard bypass | One test per guard, asserting exit 1 and no publish call |
| `release:status` false drift / missed drift | Tests on the version partition |
| Workflow triggers wrong or required-check names changed | Static read of the real workflow files in a test |
| Docs disagree or keep direct-to-`master` phrasing | Phrase-family grep over the four files (task verification); text-contract test for the pin |
| Real GitHub behavior on a `dev` push | **No local check** — accepted gap; the user confirms on the first push to `dev` |
| Real npm publish under `next` | **No local check** (user rule) — accepted gap; first real `release:next` by the maintainer, checked with `npm view akili-specs dist-tags` |

## 9. Requirement ID Index

FR-1 CI triggers · FR-2 version · FR-3 guards · FR-4 publish + restore · FR-5 dry run · FR-6 release:status · FR-7 docs + pin · FR-8 tests · FR-9 `release.js` hints · NFR-1–NFR-4
