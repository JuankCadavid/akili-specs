# Proposal: Branching Flow — `dev` Integration + `next` Prereleases

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branching-flow-dev-next` |
| Slug | `branching-flow-dev-next` — first token of the argument |
| Type | Change |
| Deliverable | software |
| Approval Mode | pre-approved (user, 2026-10-19) — "Sigue el ciclo AKILI completo hasta archivar y detente en decisiones reales de producto" |
| Execution limits (user) | Local commits only: no push, PR, tag, release, or `npm publish` |
| Depends on | none |
| Parallel-safe | yes |
| Status | Approved 2026-10-19 (user; Q1 = A ephemeral, Q2 = pin `dev`) |

## Intent

Align the repository's CI, release tooling, and docs with the branch model that has been live on GitHub since 2026-10-19: `master` and `dev` are protected, change only through PRs, and `dev` becomes the integration branch from which `next` prereleases ship.

## Problem / Current Behavior

| Today | Evidence |
|---|---|
| Both branches require a PR, 0 approvals, the six `CLI on <os> / Node <18\|22>` checks, an up-to-date branch (`strict`), and `enforce_admins` | `gh api repos/JuankCadavid/akili-specs/branches/{dev,master}/protection` run 2026-10-19 19:10 -05 → `strict: true`, six contexts, `required_approving_review_count: 0`, `enforce_admins: true` |
| `CI` runs on `push` to `master` only (plus every `pull_request`) | `.github/workflows/ci.yml:9-10` |
| `Release Status` runs on `push` to `master` only (plus every `pull_request`) | `.github/workflows/release-status.yml:3-8` |
| The only release scripts are `release:patch|minor|major`; there is no prerelease path | `package.json` `scripts` |
| `release.js` bumps only `X.Y.Z`; a prerelease string fails its parser | `scripts/release.js` `bumpVersion` — `split(".")` must yield exactly 3 numeric parts |
| `release-status.js` demands a CHANGELOG section, release notes, a remote tag and a GitHub Release for **every** published npm version — a `-next.N` publish would read as drift | `scripts/release-status.js` `main` → `checkVersion(version, true)` for each `npmMetadata.versions` entry |
| `npm` dist-tags today: only `latest` (`2.34.1`) | `npm view akili-specs dist-tags --json` run 2026-10-19 19:10 -05 |
| Docs describe a direct-to-`master` flow: `README.md` "Controlled release flow", `docs/release-checklist.md`, `AGENTS.md` *Release Rules*; `CONTRIBUTING.md` says "Direct pushes to `master` are not accepted" but never names `dev` | `README.md:410-446`, `docs/release-checklist.md`, `AGENTS.md:80-108`, `CONTRIBUTING.md` *Ground Rules* |
| Repo allows merge, squash and rebase merges | `gh api repos/JuankCadavid/akili-specs` → all three `true` |

## Proposed Outcome

1. CI and Release Status also run on pushes to `dev`.
2. `npm run release:next -- <patch|minor|major>` publishes `X.Y.Z-next.N` under the `next` dist-tag from an up-to-date `dev` checkout, never touching `latest`; `--dry-run` prints the plan and publishes nothing.
3. `release:status` understands prereleases (no false drift for `-next.N` versions).
4. One documented flow: `feat/*`, `fix/*` → PR → `dev`; `dev` → PR → `master`; after the merge, tag + `npm publish` (latest) + `gh release create`; then sync `master` back into `dev`.
5. Tests cover the prerelease script with no real publish.

## Scope

- `.github/workflows/ci.yml`, `.github/workflows/release-status.yml` — `push.branches: [master, dev]`; CI's syntax-check step also covers the new script.
- New `scripts/release-next.js` (+ `release:next` in `package.json`), pure core + injectable `exec` seam.
- `scripts/release-status.js` — classify `-next.N` versions as prereleases.
- `test/release-next.test.js` (+ a release-status prerelease case).
- Docs: `CONTRIBUTING.md`, `docs/release-checklist.md`, `README.md` release section, `AGENTS.md` *Release Rules* / *Development Rules* (`CLAUDE.md` only imports `AGENTS.md`).
- `AGENTS.md`: `Integration Branch: dev` pin immediately after `Default Branch: master` (Q2).
- `CHANGELOG.md` `Unreleased` note.

## Non-Goals

- Pushing, opening PRs, tagging, publishing, or changing GitHub settings (user rule).
- Changing `akili update` / the update-check banner for users who installed `@next` (they compare against `latest` only — see Risks).
- GitHub Releases or CHANGELOG sections for prereleases.
- Automating publish from CI (publish stays a maintainer's local command).
- Changing `release.js`'s stable bump semantics.

## Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Maintainer | New prerelease command; stable release now crosses two PRs |
| Contributors | PRs target `dev`, not `master` |
| AKILI agents in this repo | `AGENTS.md` rules change: no direct commits to `master`/`dev`; release flow via PR |
| Kaizen Apply Mode (dogfooding) | Apply-capable branch follows the `Integration Branch:` pin (see Open Question Q2) |
| Memory note *Release flow (direct-to-master)* | Becomes obsolete — refreshed at archive |

## Visual Reference

- Source: None
- Location: —
- Notes: CLI/CI/docs change; no UI surface.

## Requirement Delta Preview

### ADDED Requirements

- `release:next <patch|minor|major> [--dry-run]`: base = bump of the stable `package.json` version; `N` = 1 + highest published `base-next.*` on npm (else 1); publishes with `--tag next`; refuses unless on `dev`, clean tree, and `HEAD` equals `origin/dev`; refuses unless `base` is greater than every published stable *(amended at judgment-day J11)*.
- `release:status` lists prerelease versions separately and does not require CHANGELOG/notes/tag/GitHub Release for them.
- CI + Release Status trigger on `push` to `dev`.

### MODIFIED Requirements

- Release flow: stable release prepared on a `release/vX.Y.Z` branch from `dev` → PR to `dev` → PR `dev` → `master` (merge commit) → tag on `master`, `npm publish`, `gh release create` → resync via a `sync/master-into-dev` branch from `dev` (merge `origin/master`) PR'd into `dev` with a merge commit *(amended at judgment-day, `judgment.md` J3)*.
- Contribution flow: `feat/*` and `fix/*` branch from `dev` and PR into `dev`.

### REMOVED Requirements

- Direct commit/push of release commits to `master`.

## Approach Options

| | A. Ephemeral prerelease version (recommended) | B. Committed prerelease version | C. `npm version prerelease` wrapper |
|---|---|---|---|
| How | Script writes `X.Y.Z-next.N` into `package.json`, publishes, restores the file in `finally`; `N` comes from the registry | Script bumps `package.json`, commits; maintainer opens a PR into `dev` before publishing | Thin wrapper over `npm version --preid next` |
| PRs per prerelease | 0 | 1 (protected `dev` forbids pushing the bump) | 1 |
| Stable release afterwards | `release.js` unchanged (`package.json` stays stable) | `release.js` must learn `X.Y.Z-next.N` → `X.Y.Z` | Same as B |
| Traceability | Published `gitHead` + optional local tag hint | Commit in history | Commit + tag (tag on unmerged commit) |
| Risk | Interrupted run leaves a dirty `package.json` (detectable; restored in `finally`) | PR churn; prerelease published from a commit not yet on `dev` | `npm version` creates commit+tag, conflicts with protected-branch flow |

## Recommended Approach

**Option A.** It is the only option that publishes from exactly what is on `origin/dev` without a PR per prerelease, and it leaves `release.js` and `digests.json` untouched (a prerelease writes no digest entry, so `release:status`'s digest-drift check stays green). `N` is derived from the registry, so two maintainers cannot reuse a number silently (npm rejects duplicates anyway). The publish/fetch calls go through one injectable `exec` seam so tests run the whole plan offline.

Stable flow uses a merge commit for `dev` → `master` and a `master` → `dev` resync PR so `strict` (up-to-date) checks keep passing on the next `dev` → `master` PR.

## Risks, Dependencies, And Open Questions

| # | Item | Handling |
|---|---|---|
| R1 | Users on `@next` never see the update banner for the stable release (`isNewerVersion` compares against `latest`; `"2.35.0".localeCompare("2.35.0-next.1", …)` < 0) | Non-goal; documented in `CONTRIBUTING.md` (install `@latest` to leave the channel) |
| R2 | Protection settings are mutable external state | Cited with run time; re-run before writing shipped notes (KZ-002) |
| R3 | Rules docs keep stale "direct-to-master" phrasing | Phrase-family sweep keyed on the obligation (KZ-changes--kaizen-loop-closure-2) |
| R4 | Shipped docs must not cite this spec's active path | Cite archive path or none (KZ-changes--archify-diagrams-1) |
| R5 | `release-status` job is not a required check | Informational only; unchanged |
| Q1 | Prerelease version: ephemeral (A) or committed via PR (B)? | **Decided (user, 2026-10-19): A — ephemeral; the `X.Y.Z-next.N` bump is never committed to `dev`** |
| Q2 | Pin `Integration Branch: dev` in `AGENTS.md` so Kaizen Apply Mode writes on `dev` (and `master` becomes non-writing)? | **Decided (user, 2026-10-19): yes — pin `Integration Branch: dev`** (in Scope) |

## Success Criteria

- `ci.yml` and `release-status.yml` list `dev` under `push.branches`.
- `npm run release:next -- minor --dry-run` on this repo prints `2.35.0-next.1` (no `2.35.0-next.*` published yet) and publishes nothing.
- Tests prove: version computation, `N` increment, branch/clean/sync guards, stable-collision refusal, `--tag next` in the publish argv, `package.json` restored on success and on failure — all with a fake `exec`.
- `release:status` reports `-next.N` versions as prereleases, not drift.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass.
- No surviving instruction to push/commit releases directly to `master` in `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `docs/release-checklist.md`.

## Next Step

```text
/akili-specify changes/branching-flow-dev-next
```
