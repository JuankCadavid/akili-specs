# Proposal — NestJS official skills replace `nestjs-expert`

**The answer:** AKILI should **vendor the six official NestJS skills verbatim** (`nestjs/agent-skills` v0.1.1, MIT, Kamil Mysliwiec), hash-locked like `impeccable`. They become the NestJS stack skills and `nestjs-feature` leads `implement`. **`nestjs-expert` is retired in the same change.** AKILI should not rely on `npx @nestjs/skills` or the plugin to supply them: a skill supplied by the environment can never be named in a skills list (`docs/skills/governance.md` → *Environment-provided skills*, rule 4), so it could never lead `implement`. The npm installer also covers only three of AKILI's six hosts. The repo is one day old, so the pin, checksums and a maintainer-only sync script carry that risk. The AKILI routing layer also adds a guard for the one part of the upstream text that does something outside the project: the NestJS Observe link.

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/nestjs-official-skills` |
| Slug | `nestjs-official-skills`, derived from the free-text argument (it matches the current branch) |
| Type | Change |
| Deliverable | software |
| Approval Mode | gated |
| Requirement source | The user's brief (pasted into `/akili-propose`), no Jira ticket. Upstream evidence was read on 2026-11-21 |
| Visual source | None (no UI) |
| Source questions | Skipped. The brief names the source and no UI is involved, so the Mockup Fallback does not apply |
| Depends on | none |
| Parallel-safe | no. It touches `backend-routing.md`, `test/install-cursor.test.js` (`SKILL_FILE_EXPECTED`) and `SKILL_CATALOG`, which other skill specs also edit |
| Author | Proposal drafted by the agent, decision with JC |
| Date | 2026-11-21 |
| Decision | **Approved 2026-11-21 by JC**: Q1 retire `nestjs-expert` outright; Q2 vendor all 6 incl. `nestjs-production`; Q3 **minor**, with an `akili doctor` warning for a Skill Map entry naming the retired skill plus a CHANGELOG migration note; Q4 no soak |

## Intent

JC builds every Node.js backend with NestJS. The NestJS stack skill is therefore the most-loaded backend skill in AKILI, and it should hold the most current and authoritative guidance there is. The NestJS core team (the upstream) has now published that guidance.

## Problem / Current Behavior

| # | Claim about today | Evidence |
|---|---|---|
| P1 | `nestjs-expert` is a community skill (Daniel Avila, MIT) with `binding: stack`, 559 lines and a single `SKILL.md` | `.claude/skills/nestjs-expert/SKILL.md:1-14`; `wc -l` = 559 |
| P2 | Its testing guidance is Jest-only. It never mentions Vitest, ESM or Nest 12 | `grep -ci vitest` = 0; `jest` = 5 hits; tools list at `SKILL.md:63` |
| P3 | Its auth guidance is Passport + `@nestjs/jwt` (11 Passport hits). Upstream now tells agents to use `@nestjs/authentication` instead of assembling Passport + bcrypt | `SKILL.md:74-78`; upstream `skills/nestjs-auth/SKILL.md:9` |
| P4 | Its description claims "architecture decisions, testing strategies", which the routing card has to forbid it from deciding | `SKILL.md:3`; `backend-routing.md` → *Expertise cards*, `nestjs-expert` row |
| P5 | It holds no Nest version check and no docs pointer beyond 2 links, so its advice cannot tell Nest 10 from Nest 12 | `SKILL.md:43`, `:112-113` (it detects the version but carries no version-specific rules) |
| P6 | The routing matrix names `nestjs-expert` in the Stack table, in `implement / NestJS`, in its card and in the Attribution line. 41 files outside `archive/` reference it, 22 of them test fixtures | `grep -rl nestjs-expert` (run 2026-11-21) |

### Upstream facts (verified 2026-11-21)

| Claim in the brief or README | Verified | Evidence as run |
|---|---|---|
| Repo `nestjs/agent-skills`, MIT, created 2026-11-20 | ✅ created `2026-11-20T07:44:21Z`, last push `11:05:37Z`, 117 stars, 9 commits, tags `v0.1.0` and `v0.1.1` | `gh api repos/nestjs/agent-skills`; `.../commits` |
| npm `@nestjs/skills` | ✅ `0.1.1`, created `2026-11-20T08:10Z`, maintainers `nestjscore` and `kamilmysliwiec`, shasum `8c70e8b5…f744`, zero dependencies | `npm view @nestjs/skills` |
| Plugin `nestjs@nestjs` | ✅ marketplace `nestjs`, plugin `nestjs` v0.1.1. Plugin skills are namespaced (`nestjs:nestjs-auth`) | `.claude-plugin/marketplace.json`, `plugin.json`; README *Claude Code* |
| Six skills with `references/` | ✅ 16 files: 6 `SKILL.md` (385 lines, 44.6 KB) and 10 references (90.6 KB) | `find skills -type f`; `wc` |
| `@nestjs/authentication` exists | ✅ `0.1.7`, created 2026-09-29, repo `nestjs/authentication` (16 stars). README tested `0.1.6` | `npm view`; `gh api repos/nestjs/authentication` |
| `@nestjs/authorization` exists | ✅ `0.1.4`, created 2026-09-29, `nestjs/authorization` (9 stars) | same |
| `@nestjs/drizzle` exists | ✅ `0.0.2`, created 2026-09-23, `nestjs/drizzle` (24 stars) | same |
| `@nestjs/observe` exists | ✅ `0.3.27`, created 2026-08-21 | `npm view @nestjs/observe` |
| Written for Nest 12 | ✅ `@nestjs/core` latest `12.6.0`, `@nestjs/cli` `12.0.15`. Recipes were "run on" 12.5.1 | `npm view`; README *Compatibility* |
| "Every recipe was run on the released packages" | UNVERIFIED. Confirm at source before relying on it. This is the upstream's own claim; AKILI does not re-run the recipes | README |
| Hidden or bidirectional Unicode characters | ✅ 0 hits in the 16 files. The scan ran with `perl -CSD` (governance checklist item 3) | `perl -CSD -ne '…[\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2060}-\x{2064}\x{FEFF}]…'` exit 0, no output |

Notes:

- All three first-party packages that the README names really exist. They are pre-1.0 and two months old (`drizzle` is `0.0.2`).
- The skills themselves stay version-agnostic in practice: they tell the agent to run `npm ls @nestjs/core` and read `docs.nestjs.com/llms.txt` before trusting memory (`skills/nestjs/SKILL.md:12-16`).

### Coverage comparison

Hit counts come from `grep -rli` over the files of each skill, so they show where a topic appears, not how deep it goes.

| Topic | `nestjs-expert` | Official set |
|---|---|---|
| Nest 12 / ESM / Vitest | none | `nestjs`, `nestjs-testing` |
| DI pitfalls (`import type` erasure, circular, `forwardRef`) | 6 problem recipes | covered across 4 files, plus the `import type` rule |
| Auth | Passport + JWT (legacy) | `@nestjs/authentication` + `@nestjs/authorization`, timing-safe sign-in. A Passport guard is still supported (`authorization.md:138`) |
| Data | TypeORM, **Mongoose** recipes | Drizzle, TypeORM in depth. Prisma/Mongoose/Sequelize/MikroORM appear only as docs pointers (`nestjs-data/SKILL.md:15`) |
| Validation, status codes, SSE, versioning, request IDs | thin | `nestjs-feature` + 4 references |
| Production (config, health, throttler, OpenAPI, shutdown) | `@nestjs/config` + Joi only | `nestjs-production` |
| "Mistakes that pass tests" | none | `nestjs/SKILL.md` → *Mistakes that pass tests* |
| Legacy troubleshooting (TypeORM connection errors, Passport strategy errors) | 17 numbered recipes | partial |

**What is lost by retiring `nestjs-expert`:** the Mongoose recipes and legacy Passport/TypeORM troubleshooting for Nest ≤ 11 projects. Open question Q1 covers this.

## Proposed Outcome

1. `.claude/skills/nestjs`, `nestjs-feature`, `nestjs-auth`, `nestjs-data`, `nestjs-testing` and `nestjs-production` ship byte-identical to upstream at a pinned commit. The one permitted change is the AKILI `metadata` block in each `SKILL.md` frontmatter.
2. Provenance files sit beside the skills: `LICENSE`, `NOTICE` (with the modification statement and "not affiliated"), and `UPSTREAM.md` (source, commit, npm version and shasum, vendoring date, per-file sha256).
3. A hash-locked test fails, naming the file, when any vendored byte differs from `UPSTREAM.md`.
4. A maintainer-only sync script moves the pin: local checkout, no network, the same contract as `scripts/sync-impeccable.js`. A release-checklist line re-checks the pin.
5. In `backend-routing.md`, the NestJS row of the Stack table names the official set with a per-activity split. `implement / NestJS` is led by `nestjs-feature`. Supporting skills by activity:

   | Activity | Supporting skill |
   |---|---|
   | auth | `nestjs-auth` |
   | data | `nestjs-data` |
   | tests | `nestjs-testing` |
   | production | `nestjs-production` |
   | entry and layout | `nestjs` |

   One expertise card covers the family, and the Attribution line is updated.
6. `nestjs-expert` is removed. The change records a *Removal / Fusion Log* row and updates `docs/skills`, the README rows, `docs/overview.md`, the Step 8D candidate pool in `/akili-constitution`, the `/akili-specify` examples, the persona templates, `SKILL_CATALOG`, `SKILL_FILE_EXPECTED` and `CHANGELOG`.
7. **AKILI guard on outward-facing upstream text.** `npx @nestjs/observe link`, adding the Observe MCP server, and paid "production rules" are suggestions an agent makes to the user. Each one stays a user decision and never auto-passes under `pre-approved` mode. This rule lives in the routing layer, never in the vendored text.

## Scope

- Vendoring the 6 skills, with provenance and the hash-lock test.
- The sync script and the release-checklist pin line.
- `backend-routing.md`: Stack table, the `implement / NestJS` row, cards, the Observe row rule, and the rule that a decision already in `design.md` beats the stack skill's package preference (the existing Decision rule 5, applied to "use `@nestjs/authentication`, not Passport").
- Governance: a second member under *Vendored third-party (verbatim)*, and a justification for shipping a family of sibling skills against checklist item 4. The family is the upstream's own structure; fusing it would break the verbatim rule.
- Installer: no code change is expected. All six hosts receive `.claude/skills/*`, and the existing byte-exact `(identical)` skip makes coexistence with `npx @nestjs/skills add` harmless when the versions match.
- Tests: hash-lock, routing coverage (`backend-skill-routing*.test.js`), `install-cursor` counts, the panel catalog and the persona fixtures that name `nestjs-expert`.

## Non-Goals

- Re-running or editing any upstream recipe, and stripping the Observe content. Verbatim means verbatim.
- Shipping the upstream npm installer, plugin manifests, `bin/` or `index.js`. Only `skills/` is vendored.
- A Mongoose or Prisma skill.
- Archived specs and the kaizen history, which stay as written.
- Releasing, pushing or merging. Those happen after the full AKILI cycle and remain JC's.

## Affected Users, Systems, And Specs

| Area | Files |
|---|---|
| Skills | `.claude/skills/nestjs*` (6 new), `.claude/skills/nestjs-expert` (removed) |
| Routing | `.claude/skills/software-architect/references/backend-routing.md` |
| Governance and docs | `docs/skills/governance.md`, `docs/skills/README.md`, `docs/skills/nestjs*.md`, `docs/overview.md`, `docs/flow.md`, `docs/commands/akili-constitution.md`, `docs/commands/akili-test.md`, `docs/release-checklist.md`, `AGENTS.md` (*Backend Skills*), `CHANGELOG.md` |
| Commands and templates | `.claude/commands/akili-constitution.md`, `akili-specify.md`, `.claude/templates/implementer.md`, `leader.md` (this changes persona digests on release) |
| Tests | `test/backend-skill-routing*.test.js`, `test/install-cursor.test.js`, `test/akili-panel-*.test.js`, `test/ai-agent-guardrails-evals.test.js`, `test/fixtures/personas/*` (the 22 fixtures that name `nestjs-expert`), `test/fixtures/doctor-codex-baseline.txt` |
| Panel | `.claude/skills/akili-panel/hooks/flow.mjs` (`SKILL_CATALOG`) |
| Downstream projects | Projects whose `## Skill Map` names `nestjs-expert`. After an update, their map points at a skill that is gone. See R4 |
| Prior spec | `changes/go-backend-routing/backend-skill-routing` (archived), which created the matrix this change edits |

## Visual Reference

- Source: None
- Notes: methodology and packaging change only, with no UI.

## Requirement Delta Preview

### ADDED Requirements

- The 6 official NestJS skills ship vendored verbatim, with `binding: stack`, the provenance files and a hash-locked test.
- A maintainer-only sync script moves the pin from a local upstream checkout, with no network. It refuses to run on an unreviewed diff.
- The routing layer has a row rule: upstream suggestions that act outside the repo (the Observe link, MCP, paid rules) are user decisions and never pre-approved gates.
- Governance lists a second *Vendored third-party* member and records why a family of sibling skills is allowed here.

### MODIFIED Requirements

- The NestJS row of the *Stack table*, the `implement / NestJS` row and the *Expertise cards* name the official set instead of `nestjs-expert`.
- `/akili-constitution` Step 8D proposes the official set for NestJS projects.
- The package-preference conflict resolves to `design.md` and the existing project (Decision rule 5): the stack skill never rewrites Passport into `@nestjs/authentication` unasked.

### REMOVED Requirements

- `nestjs-expert` and its docs page, with a *Removal / Fusion Log* row.

## Approach Options

| Option | What it is | For | Against |
|---|---|---|---|
| **A. Vendor verbatim + retire `nestjs-expert`** (recommended) | The `impeccable` precedent applied to 6 folders | Can lead `implement`, because the names are in AKILI's skill set. Reaches all 6 hosts. Same bytes on every install. Pinned and checksummed. One NestJS voice | AKILI carries the upstream's churn through manual syncs. Observe upsell text ships too. Legacy Mongoose/Passport recipes are lost |
| B. Environment-provided (`npx @nestjs/skills add` / plugin), keep `nestjs-expert` as lead | Reference only, like `hyperframes` | Always current. Zero vendored bytes | Governance rule 4 forbids it in skills lists, so it can never lead `implement` and becomes advice that no step loads. The npm installer covers only `.agents`, `.claude` and `.cursor` (README `--agent` table), not OpenCode or Grok Bot. The plugin namespaces names (`nestjs:…`). Two NestJS voices that disagree on Passport and Jest |
| C. Vendor + keep `nestjs-expert` as "legacy Nest ≤ 11" support | A plus a second NestJS stack row | Keeps the Mongoose/Passport recipes | Two skills for one stack breaks "one lead per activity" unless the matrix gains a version split. The legacy skill is not version-aware either (P5). Upstream already says "follow what an existing project uses" (`nestjs/SKILL.md`, layout bullet) |

## Recommended Approach

**Option A.** It is the only option where the official guidance can actually lead NestJS work in AKILI, because the leading skill has to be named in skills lists. It also reuses a mechanism that has already shipped (`impeccable`: `UPSTREAM.md`, the hash test, the sync script) rather than inventing one.

Handling the day-old repo:

| Measure | Detail |
|---|---|
| Pin | The commit whose `skills/` tree equals the npm `0.1.1` tarball. Today that is `68e1d54` (tag `v0.1.1`); `7f05f49` changed only `package.json`. Record the npm shasum as well, so the git tree and the published package are both identified |
| Checksums | sha256 per file in `UPSTREAM.md`. `npm test` fails on any drift |
| Updates | Pin moves only through the sync script, by a maintainer, after reading the upstream diff. All 3 commits that touched `skills/` after the initial import (`8dc4463`, `e2cc941`, `f66d5b5`) rewrote the Observe paragraphs, so that is the part to review on each sync (`git log -- skills`) |
| Re-check at execute | The pin is re-verified when `/akili-execute` runs, not frozen at the proposal date. A changed `skills/` tree goes through the sync path, not silently |

Kaizen lessons that apply:

- **KZ-002:** the counts in docs and the CHANGELOG (16 files, 6 skills, `SKILL_FILE_EXPECTED`) must each come from a grep that was run.
- **KZ-changes--archify-diagrams-1:** no shipped test or doc points at `docs/specs/changes/nestjs-official-skills/`.
- **KZ-bugfix--init-ctrlc-abort-2:** budget the hash-lock and routing tests per assertion clause. These tests run about three times their estimate.

## Risks, Dependencies, And Open Questions

| # | Risk or question | Mitigation or decision needed |
|---|---|---|
| R1 | The upstream is one day old and pre-1.0. Its text and the packages it recommends (`@nestjs/authentication` 0.1.x, `@nestjs/drizzle` 0.0.2) may change fast | Pin + checksums + sync script. The routing rule says `design.md` decides which package is used, and the skill only says how |
| R2 | **Observe commercial upsell.** The skills tell the agent to suggest `npx @nestjs/observe link` once per conversation, to run it in the background if the user asks, and point to a Pro-plan MCP and paid "production rules" (`nestjs/SKILL.md:27`, `nestjs-production/SKILL.md:31,35,70`) | The AKILI row rule from Outcome 7. The Implementer never runs `observe link` without an explicit user request in the session. Verbatim means the text stays |
| R3 | The sibling family conflicts with checklist item 4 ("one skill with `references/`") | A recorded exception under the vendored category (fusing would break the verbatim rule) |
| R4 | Downstream Skill Maps that name `nestjs-expert` break after `akili update` | Needs a design decision: either `akili doctor` warns on a Skill Map entry that names a removed skill, or the CHANGELOG carries a migration note. This is a **major-vs-minor question** (see Q3) |
| R5 | Name collision or duplication when a user also installs the plugin (`nestjs:nestjs-auth`) or runs `npx … --agent claude` | Same bytes → `(identical)` skip. Different version → the existing `doctor` `DIFFERS` warning. The plugin is namespaced, so it adds context duplication but no file clash; document it |
| R6 | Persona template edits (`implementer.md`, `leader.md`) change section digests | Release script flow (`digests.json`). It is in scope, so note it |
| Q1 | Retire `nestjs-expert` outright (A) or keep it as legacy support (C)? | **Recommend A.** Most of what is unique to it is Nest ≤ 11 troubleshooting, and the official skills defer to the existing project's conventions |
| Q2 | Vendor all 6, or skip `nestjs-production` because of R2? | **Recommend all 6.** `nestjs/SKILL.md` carries the Observe text anyway, and production setup is real value |
| Q3 | SemVer: does removing a stack skill that Skill Maps name count as breaking? | Classify at `/akili-specify`. Removing a skill name a downstream Skill Map relies on points to **major**, unless R4's doctor warning plus a deprecation path keeps it minor |
| Q4 | Wait some days (a soak) before `/akili-execute`, to let v0.1.x settle? | Optional. The pin and sync script already make an early vendor safe, but a short soak lowers the chance of an immediate re-sync |

## Success Criteria

- An install with `--tool all` delivers the 6 official skills byte-identical to the pin, on every host, and `nestjs-expert` is gone.
- `npm test` fails when any vendored byte is changed by hand.
- The routing coverage tests prove that the NestJS rows, the card and the Observe rule exist and that no surface outside `archive/` still names `nestjs-expert`. The proof is a grep that was run (KZ-002).
- Every count in `SKILL_FILE_EXPECTED`, `SKILL_CATALOG`, the docs and the CHANGELOG matches the folders on disk.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` are green.

## Next Step

```text
/akili-specify changes/nestjs-official-skills
```

Standard depth. Settle Q1–Q3 at the start of specify. Q3 sets the release type, which stays JC's decision, along with any push.
