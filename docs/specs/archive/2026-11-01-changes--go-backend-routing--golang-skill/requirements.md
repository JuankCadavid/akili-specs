# Requirements: Go stack skill (`golang-pro`)

> **Answer first.** Five behaviors: a security verdict before any upstream byte enters the package (FR-1); the six upstream files vendored unchanged except for added frontmatter, with `LICENSE` and `NOTICE` (FR-2); `golang-pro` offered in every stack-skill candidate pool, never load-directed (FR-3); docs and counts that tell the truth (FR-4); install and doctor carry the new skill on every target (FR-5). `samber/cc-skills-golang` is documented as an optional install and never copied (FR-4, NFR-2).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/golang-skill` |
| Parent Spec | `changes/go-backend-routing` |
| Type | Change |
| Deliverable | software |
| Depth | Lite |
| Approval Mode | pre-approved (JC, 2026-11-01 9:56 UTC-5) — mandate quoted in `proposal.md` Document Control |
| Source | `proposal.md` (approved, Option A, minor) |
| Baseline | `7067fe9`; `npm test` 1233 pass / 0 fail (run 2026-11-01) |
| Upstream pin | `Jeffallan/claude-skills` `078a25cc5bfd8011459be7b91d004e900c1d02d3`, path `skills/golang-pro/` |
| Phase 1 gate | auto-approved (pre-approved mode), 2026-11-01 |

## 2. Executive Summary

Go projects get a stack skill on the same terms as NestJS and Angular projects. The skill is third-party, so it enters only after a recorded security review of the exact files at the pin.

## 3. Glossary

| Term | Meaning |
|---|---|
| Pin | The upstream commit above and the seven git blob SHAs in §4 (six skill files + repo-root `LICENSE`) |
| Upstream body | Every byte of a pinned file except, for `SKILL.md`, the added `metadata` keys |
| Candidate pool | A list in command text of stack skills an agent may pick from (constitution Step 5, Step 8D; specify Step 2.1) |
| Load-direct | A command step telling the agent to load a named skill (`docs/skills/governance.md` → *Rules of thumb*) |

## 4. System Context & Scope

| Pinned file | Size (B) | Git blob SHA |
|---|---|---|
| `SKILL.md` | 5,208 | `99ef50f7eba4c884af255a061143bbcf3c7f65e7` |
| `references/concurrency.md` | 7,438 | `d14ef44263c7b76460150b65df980ace9c60dbb0` |
| `references/generics.md` | 8,741 | `4e6165937bbca2782a1b98bb346f176706fb2a18` |
| `references/interfaces.md` | 8,361 | `41856f9cacc67e1648925e8cb6b75fc49ef3c41a` |
| `references/project-structure.md` | 10,430 | `eb599b949a04b640100614d84ce123efafffcdb5` |
| `references/testing.md` | 9,461 | `3696a2ceab70841b17a3f836f2404c204166d3e5` |
| Repo-root `LICENSE` (copied beside the skill) | 1,056 | `b77bf2ab726c6e7cb5a81a9d3b7dc38266ebfd3d` |

Source: `gh api "repos/Jeffallan/claude-skills/git/trees/078a25cc5bfd:skills/golang-pro?recursive=1"` and `gh api "repos/Jeffallan/claude-skills/contents/LICENSE?ref=078a25cc5bfd8011459be7b91d004e900c1d02d3"` (run 2026-11-01).

Current behavior: no packaged Go skill (`ls -d .claude/skills/*/ | wc -l` → 31, none Go; run 2026-11-01). Stack skills reach agents through the candidate pools and the project `## Skill Map` (`docs/skills/governance.md` → *Binding Taxonomy*, `stack` row).

Out of scope: the routing matrix (`changes/go-backend-routing/backend-skill-routing`), any `samber/cc-skills-golang` byte, edits to the upstream body.

## 5. Stakeholders

| Who | Needs |
|---|---|
| Teams with a Go backend | Idiomatic Go guidance assigned per task |
| JC (maintainer) | Third-party text admitted only after review; attribution intact |
| Installers on six targets | The new folder installs and reports `OK` like every other skill |

## 6. Functional Requirements

### FR-1: Security verdict before vendoring

The package SHALL admit the pinned files only after a recorded security review of those exact bytes returns `PASS`.

#### Scenario: Review passes

- GIVEN the six skill files and the repo-root `LICENSE` fetched at the pin, each matching its blob SHA
- WHEN they are reviewed for prompt injection, instructions to fetch or run remote content, credential handling, destructive commands, and hidden or encoded content
- THEN the verdict, the checks run, the hits found and their classification are recorded in `execution.md`
- AND vendoring may proceed
- BUT it must NOT copy any byte into `.claude/skills/` before the verdict is recorded
- AND IT MUST record the skills.sh "Gen Agent Trust Hub: Fail" label as settled (reason found) or open (reason not found), never as resolved by silence

#### Scenario: Review fails

- GIVEN any finding the review classifies as unsafe
- WHEN the verdict is `FAIL`
- THEN nothing is copied, and the run stops for JC through the Pivot Protocol

### FR-2: Vendored folder with provenance

`.claude/skills/golang-pro/` SHALL hold the six pinned files plus `LICENSE` and `NOTICE`.

#### Scenario: Upstream body kept

- GIVEN the vendored folder
- WHEN each reference file's raw bytes are hashed as a git blob (SHA-1 of `blob <len>\0<bytes>`)
- THEN each hash equals its blob SHA in §4
- AND `SKILL.md` differs from its pinned bytes only by added `metadata` keys: `source`, `adapted-by`, `adapted-for`, `binding: stack`
- BUT it must NOT change, remove, or reorder any upstream line, the `license`, `author`, or `version` values included
- AND IT MUST pass the `docs/skills/governance.md` *Frontmatter Schema*: `name`, `description`, `license`, `metadata.author`, `source`, `adapted-by`, `adapted-for`, `binding`, `version`

#### Scenario: License and notice

- GIVEN the upstream `LICENSE` at the pin
- WHEN the folder ships
- THEN `LICENSE` is that file, byte-identical (blob `b77bf2ab…` in §4), on every CI platform
- AND `NOTICE` names the copyright holder (Jeffallan), the source URL, the pinned commit, the frontmatter-only modification, and that AKILI is not affiliated with the upstream
- AND IT MUST state where the holder's name comes from, since the upstream `LICENSE` names none

### FR-3: Offered as a stack skill, never load-directed

`golang-pro` SHALL appear in every stack-skill candidate pool: `akili-constitution` Step 5, Step 8D candidates, `akili-specify` Step 2.1 no-map fallback, and the summary in `docs/commands/akili-constitution.md`.

#### Scenario: Pools list it

- GIVEN the four pools
- WHEN each is read
- THEN each lists `golang-pro` next to the other stack skills
- BUT no command step tells the agent to load `golang-pro` outside a pool that defers to the Skill Map or is the Skill Map builder (governance carve-outs 1–3)

### FR-4: Truthful docs and counts

The package docs SHALL describe the skill and the new inventory.

#### Scenario: Docs updated

- GIVEN the vendored skill
- WHEN the docs are read
- THEN `docs/skills/golang-pro.md` exists, with author, license, binding, what it covers, the pin, and the samber note
- AND `docs/skills/README.md` and `docs/overview.md` carry a `golang-pro` row; `docs/skills/governance.md` *Current assignment* lists it under `stack`
- AND every statement of the packaged-skill total reads 32 (`docs/cli.md` and any other)
- AND `CHANGELOG.md` `Unreleased` has an entry
- AND IT MUST state, in the samber note: optional, installed by the user with samber's own installer, upstream advice to install the general-purpose skills together, never vendored by AKILI
- BUT it must NOT claim a security property of `golang-pro` beyond the recorded FR-1 verdict

### FR-5: Install and doctor carry it

#### Scenario: Every target

- GIVEN a clean temporary home
- WHEN `node bin/akili.js install --tool all --dry-run` and `doctor --tool all` run
- THEN `golang-pro` is planned for every target and doctor reports `OK golang-pro` where it reports skills
- AND the existing install and doctor tests pass after their counts and fixtures are updated to the new inventory
- BUT it must NOT change installer code

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | The vendored folder stays under 60 KB (pinned files total 49,639 B) |
| NFR-2 | No file from `samber/cc-skills-golang` enters the repository |
| NFR-3 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green |

## 8. Defect classes and gates

| Defect class | Gate | Automated? |
|---|---|---|
| Unsafe upstream content | FR-1 review (T1) + Reviewer re-read of the verdict | No — agent review; residual risk accepted and stated in `docs/skills/golang-pro.md` as "reviewed at the pin", nothing more |
| Upstream body drifted (hand edit, or CRLF on Windows checkout) | Contract test on raw bytes: each reference and `LICENSE` equal their §4 blob SHA; `SKILL.md` minus added keys equals the pinned bytes | Yes |
| Attribution or license missing | Contract test on frontmatter keys, `LICENSE`, `NOTICE` | Yes |
| Missing from a pool | Contract test over the four pools | Yes |
| Stale skill count or fixture | `npm test` (`docs-overview`, `install-cursor`, `install-grokbot`, count tests) | Yes |
| Overstated doc or CHANGELOG claim | Reviewer quote-check at HEAD (KZ-002) | No — human/Reviewer check |

## 9. Requirement ID Index

| ID | Title | Tasks |
|---|---|---|
| FR-1 | Security verdict before vendoring | T1 |
| FR-2 | Vendored folder with provenance | T2, T4 |
| FR-3 | Offered as a stack skill | T3, T4 |
| FR-4 | Truthful docs and counts | T3, T4 |
| FR-5 | Install and doctor | T4 |
| NFR-1–3 | Size, no samber, green gates | T2, T4 |
