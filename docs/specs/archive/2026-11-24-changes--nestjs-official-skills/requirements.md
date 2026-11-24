# Requirements: Vendor the official NestJS skills and retire `nestjs-expert`

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/nestjs-official-skills` |
| Depth | **Standard**, upper end. It vendors six third-party skill folders, adds a sync script, extends two installer paths (ownership, legacy cleanup), adds one `doctor --agents` warning, and edits routing, governance, commands, docs and tests |
| Type | Change |
| Deliverable | `software` |
| AI Agent | no. This spec packages methodology text and installer behavior; no model decides at runtime inside what it ships |
| Approval Mode | `gated` |
| Status | Phase 1 approved 2026-11-21 by JC (Step 1.3 gate, gated mode). FR-8 persona bullet and scenario amended 2026-11-22 by the Judgment Day C-1 fix (Fix only, approved by JC) |
| Date | 2026-11-21 |
| Proposal | `proposal.md` at `fb15bab`, approved by JC 2026-11-21: Q1 retire `nestjs-expert` outright; Q2 vendor all 6; Q3 **minor**, with a `doctor` warning and a migration note; Q4 no soak |
| Source | Upstream `nestjs/agent-skills` (read-only clone in the session scratchpad, `HEAD` `7f05f49`, tag `v0.1.1` = `68e1d54`); npm `@nestjs/skills@0.1.1` |
| Format source | `docs/specs/archive/2026-10-31-changes--impeccable-hardening/requirements.md`. There is no `docs/specs/general-setup/` (`ls docs/specs/general-setup` → "No such file or directory", run 2026-11-21) |
| Verified at | AKILI `fb15bab`; upstream `68e1d54` |
| Release | **Minor** (Q3), recorded only. No push, PR, release or publish in this cycle |

## 2. Executive Summary

AKILI ships the six official NestJS skills unmodified and hash-locked at upstream `v0.1.1`: `nestjs`, `nestjs-feature`, `nestjs-auth`, `nestjs-data`, `nestjs-testing` and `nestjs-production` (MIT, Kamil Mysliwiec). Each folder carries its license, its notices and its pin.

- They become the NestJS stack skills of the backend routing matrix, and `nestjs-feature` leads `implement` on NestJS.
- `nestjs-expert` leaves the package. Installs drop AKILI's copy of it, and `akili doctor --agents` warns a project whose Skill Map still names it.
- The routing layer adds one guard: the upstream's Observe suggestions (link a project, add an MCP server, paid production rules) are always the user's decision.

## 3. Glossary

| Term | Meaning |
|---|---|
| Official set | The six folders under upstream `skills/`: `nestjs`, `nestjs-feature`, `nestjs-auth`, `nestjs-data`, `nestjs-testing`, `nestjs-production` |
| Upstream pin | The upstream git commit, tag and npm version (with npm shasum) the vendored bytes come from |
| Frontmatter block | The AKILI `metadata` keys added to each vendored `SKILL.md` frontmatter. They are the only modification, and each `NOTICE` declares them |
| Provenance files | `LICENSE`, `NOTICE` and `UPSTREAM.md`, written by AKILI beside the upstream files in each vendored folder |
| Retired skill | A skill name the package shipped before and no longer ships, together with the name that replaces it |
| Skill Map | The `## Skill Map` section of a project's root `AGENTS.md` or `CLAUDE.md`, written by `/akili-constitution` Step 8D |
| Outward action | An action whose effect leaves the repository: linking a project to a SaaS, registering an MCP server, or enabling a paid feature |

## 4. System Context & Scope

| Fact | Evidence (as run) |
|---|---|
| `nestjs-expert` is the only NestJS skill, `binding: stack`, 559 lines | `.claude/skills/nestjs-expert/SKILL.md:12`; `wc -l` = 559 |
| The routing matrix names it in the Stack table, in `implement / NestJS`, in its card and in Attribution | `backend-routing.md:23`, `:46`, `:67`, `:101` |
| Live surfaces that name it: 34 lines in 20 files (the skill itself included) | `grep -rn nestjs-expert . --exclude-dir={node_modules,archive,.git,fixtures,kaizen} \| grep -v "docs/specs/changes/nestjs-official-skills\|CHANGELOG.md\|releases/\|kaizen-log"` → `wc -l` 34, unique files 20 (run 2026-11-21 at `fb15bab`) |
| Two vendoring precedents exist: `impeccable` (`UPSTREAM.md`, sha256 lines, `scripts/sync-impeccable.js`, `test/impeccable-vendor.test.js`) and `golang-pro` (`LICENSE` + `NOTICE`, git-blob hashes inlined in `test/golang-skill.test.js`) | `ls .claude/skills/impeccable`; `ls -R .claude/skills/golang-pro`; `test/golang-skill.test.js:17-28` |
| The installer judges ownership for one entry only: `impeccable` is AKILI's when its folder holds `UPSTREAM.md`; every other name passes through | `bin/akili.js:903-925` (`makeImpeccableForeignPolicy`) |
| Removed skills are cleaned through `LEGACY_SKILLS` (the 8 `gsap-*` names), and its STALE/REMOVED messages hard-code "replaced by gsap-animation". The scan never runs on a shared skills root | `bin/akili.js:77-88`, `:2033-2051` |
| `doctor --agents` runs in the project directory and reads `.agents/`. No code reads a Skill Map today | `bin/akili.js:2445-2460`; `grep -n "Skill Map" bin/*.js` → 1 hit, a `why:` string at `:2139` |
| The upstream `npx` installer marks each folder it writes with `.nestjs-skills` and replaces only marked folders unless `--force` | upstream `README.md` → *Any agent, with npm* |
| Vendored trees are byte-exact on Windows via `-text` lines | `.gitattributes` (`impeccable/**`, `golang-pro/**`) |
| Between `v0.1.1` and `HEAD` only `package.json` differs; the 3 post-import commits touching `skills/` all rewrote Observe text | `git diff --stat v0.1.1 HEAD`; `git log -- skills` (upstream clone) |

In scope: the official set, its provenance and sync, installer ownership and legacy cleanup for it, the `doctor --agents` Skill Map warning, routing, governance, docs, commands, panel catalog, tests and CHANGELOG.

Out of scope: upstream text edits, the upstream installer, plugin manifests, `bin/` and `index.js`, a Mongoose or Prisma skill, archived specs and kaizen history, release.

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| JC (NestJS on every Node backend) | Current, authoritative NestJS guidance leading every NestJS task |
| Agent on a NestJS task | One lead skill per activity, named in its skills list, and a clear rule for Observe suggestions |
| Project owner upgrading AKILI | A visible warning when the Skill Map names a retired skill, and a migration note |
| Developer who also ran `npx @nestjs/skills add` | Their copy is neither overwritten nor duplicated silently |
| Maintainer | A safe, reviewable way to move the pin |

## 6. Functional Requirements

### FR-1: Vendored official set, verbatim

The package SHALL ship `.claude/skills/<name>/` for each of the six names in the official set. Each folder contains the upstream files at the pin plus three provenance files:

| File | Content |
|---|---|
| `LICENSE` | Upstream's MIT `LICENSE`, unaltered |
| `NOTICE` | Vendored from `https://github.com/nestjs/agent-skills` at `<commit>` (`v<version>`). The only modification is the frontmatter block, with its keys listed. AKILI-SPECS is not affiliated with the NestJS project |
| `UPSTREAM.md` | Source URL, commit, tag, npm version and npm shasum, vendor date, the sync script's name, and one `sha256  path` line per upstream file of that folder |

- Each vendored `SKILL.md` SHALL keep every upstream frontmatter key and value (`name`, `description`, `license`, and `compatibility` where present) and add a `metadata` block: `author: Kamil Mysliwiec (NestJS)`, `source`, `adapted-by`, `adapted-for: AKILI-SPECS`, `binding: stack`.
- No other byte of an upstream file SHALL differ from the pin.
- Upstream `bin/`, `index.js`, `index.d.ts`, `package.json`, `scripts/`, `test/` and `.claude-plugin/` SHALL NOT be shipped.

#### Scenario: Verbatim check

- GIVEN the shipped package
- WHEN each file listed in a folder's `UPSTREAM.md` is hashed (for `SKILL.md`, after removing the frontmatter block)
- THEN every hash matches its line
- BUT it must NOT contain, in any of the six folders, a file that is neither listed in that folder's `UPSTREAM.md` nor one of the three provenance files
- AND IT MUST hold 16 listed upstream files across the six folders, and a `LICENSE` in each whose text begins with "(The MIT License)"

### FR-2: Pin and sync

The repository SHALL contain a maintainer-only sync script for the official set. It is not in `package.json` `files`.

- Given a local upstream checkout and a commit, it copies `skills/<name>/` for the six names, applies the frontmatter block, and writes the three provenance files in each folder.
- It SHALL refuse when the checkout is dirty, when the commit is not checked out, or when a folder of the official set is missing upstream.
- It SHALL NOT download anything.
- It SHALL print the per-file diff summary against the current pin, so the maintainer reviews the change (Observe text first) before committing.
- The first pin SHALL be tag `v0.1.1` (`68e1d54`), re-verified when `/akili-execute` starts. If the upstream `skills/` tree has moved by then, the new commit goes through this script and is recorded as a deviation, never silently.
- `docs/release-checklist.md` SHALL gain one step: compare the pin with upstream's latest tag and record "current" or the decision to sync or defer.

#### Scenario: Local edit creeps in

- GIVEN a contributor edits a vendored `references/*.md` by hand
- WHEN `npm test` runs
- THEN the vendor test fails, naming the folder and the file whose hash differs

#### Scenario: Dirty upstream checkout

- GIVEN an upstream checkout with an uncommitted edit under `skills/`
- WHEN the sync script runs
- THEN it exits non-zero and writes nothing
- BUT it must NOT leave any vendored folder partly rewritten

### FR-3: Delivery and ownership on every target

`akili install` SHALL deliver the six folders to all six targets wherever the target receives skills.

- On a target with no ownership record (Claude Code, OpenCode, Antigravity, Codex, Cursor), an existing folder with one of the six names is AKILI's only when it holds `UPSTREAM.md`. Otherwise it is **foreign**: it is skipped whole and reported, and the report includes the `.nestjs-skills` marker when present. `install --force` takes it over whole, under the rule `impeccable` uses today.
- `akili doctor` SHALL count the six like any other packaged skill.

#### Scenario: Developer already ran the upstream installer

- GIVEN `~/.claude/skills/nestjs-auth/` written by `npx @nestjs/skills add --agent claude --global` (holds `.nestjs-skills`, no `UPSTREAM.md`)
- WHEN `akili install --tool claude` runs without `--force`
- THEN that folder is untouched and the install output names it as foreign
- AND the other five folders are written
- BUT it must NOT merge files into the foreign folder

### FR-4: `nestjs-expert` retired from the package and from installs

- `.claude/skills/nestjs-expert/` and `docs/skills/nestjs-expert.md` SHALL be removed.
- The installer SHALL treat `nestjs-expert` as a retired skill whose replacement is the official set. `install`, `update` and `doctor --fix` remove an existing `nestjs-expert` folder from a target, under the same rules the `gsap-*` legacy names follow today, including never scanning a shared skills root.
- Every STALE and REMOVED message SHALL name the replacement for the retired name it reports; the `gsap-*` messages keep naming `gsap-animation`.
- `docs/skills/governance.md` → *Removal / Fusion Log* SHALL gain a dated row.

#### Scenario: Upgrade over an older install

- GIVEN `~/.claude/skills/nestjs-expert/` from an earlier AKILI install
- WHEN `akili doctor --tool claude` runs
- THEN it reports `STALE nestjs-expert` naming the official set as its replacement
- AND `akili doctor --tool claude --fix` removes the folder and reports `REMOVED`
- BUT it must NOT remove a `nestjs-expert` folder under a shared skills root (`~/.agents/skills`)

### FR-5: `doctor --agents` warns on a retired skill in the Skill Map

When `akili doctor --agents` runs in a project, it SHALL read the `## Skill Map` section of the project's root `AGENTS.md` and `CLAUDE.md` (each when present) and report every retired skill name found there.

- Each hit prints one `RETIRED` line: the file, the line number, the retired name and its replacement.
- It SHALL NOT edit the Skill Map, with or without `--fix`. The Skill Map is project content; `/akili-constitution` Step 8D rewrites it.
- The warning alone SHALL NOT change the exit status.
- A name found outside the `## Skill Map` section is not reported.

#### Scenario: Project still maps NestJS to `nestjs-expert`

- GIVEN a project whose `AGENTS.md` Skill Map has a row naming `nestjs-expert` on line 140
- WHEN `akili doctor --agents` runs in it
- THEN the output has `RETIRED nestjs-expert (AGENTS.md:140)`, naming `nestjs-feature` and the official set as the replacement
- AND the exit status is the one the persona checks alone would give
- BUT it must NOT change a byte of `AGENTS.md`, even with `--fix`

#### Scenario: Name in prose, not in the map

- GIVEN `nestjs-expert` appears only in a `## History` section
- WHEN `akili doctor --agents` runs
- THEN no `RETIRED` line is printed

### FR-6: Backend routing names the official set

`software-architect` → `references/backend-routing.md` SHALL:

- name the official set in the NestJS row of the *Stack table*, with the idiom each skill supplies;
- make `nestjs-feature` the lead of `implement / NestJS`;
- state the per-activity support on NestJS: auth → `nestjs-auth`, persistence → `nestjs-data`, tests → `nestjs-testing`, production setup → `nestjs-production`, project start, layout and docs lookup → `nestjs`;
- replace the `nestjs-expert` card with one card for the official set. Its *Must not decide* names architecture, framework choice, API contract policy, and a package choice already recorded in `design.md`. Its *Evidence* cites exact headings of the vendored files;
- state that a package preference in a stack skill ("use `@nestjs/authentication` rather than Passport") never overrides a decision in `design.md` or the stack the project already uses (Decision rule 5);
- update the *Attribution* line.

#### Scenario: Existing Passport project

- GIVEN a NestJS project whose `design.md` records Passport + `@nestjs/jwt` for auth
- WHEN a task touching auth is routed
- THEN its `Backend route:` line names `nestjs-feature` as `implement` lead with `nestjs-auth` in support
- BUT the route must NOT reopen the Passport decision; a conflict is a spec gap for the Pivot Protocol

### FR-7: Outward actions in upstream text are the user's decision

The routing layer SHALL state that every outward action the official set suggests (`npx @nestjs/observe link`, registering the Observe MCP server, enabling paid Observe production rules) is a user decision.

- An agent MAY relay the suggestion to the user.
- An agent SHALL NOT run such an action unless the user asks for it in the current session.
- Under `Approval Mode: pre-approved`, such an action is never auto-passed.
- The rule SHALL live outside the vendored folders (FR-1).

#### Scenario: Pre-approved run on an unlinked project

- GIVEN a spec in `pre-approved` mode and a NestJS project with no `OBSERVE_APP_KEY`
- WHEN the Implementer finishes a task while `nestjs-production` is loaded
- THEN at most one sentence suggests the link to the user
- BUT the agent must NOT run `npx @nestjs/observe link`, and must NOT add an MCP server

### FR-8: Governance, commands, docs and panel

- `docs/skills/governance.md` SHALL list the official set as a member of *Vendored third-party (verbatim)*, record why a family of six sibling folders is accepted against checklist item 4 (fusing them would break the verbatim rule), and replace `nestjs-expert` in the `stack` row of *Current assignment*.
- Each of the six SHALL have a `docs/skills/<name>.md` page, a row in `docs/skills/README.md` (author Kamil Mysliwiec, MIT) and a row in `docs/overview.md`.
- `/akili-constitution` (Step 5 candidates and Step 8D pool), `/akili-specify` (Step 2.1 no-map list), `docs/commands/akili-constitution.md`, `docs/commands/akili-test.md`, `docs/flow.md` and `AGENTS.md` (*Skill Usage*, *Backend Skills*) SHALL name the official set where they named `nestjs-expert`. A no-map fallback list names one entry, `nestjs-feature`, unless its context needs another.
- The persona example in `.claude/templates/leader.md` SHALL stop naming `nestjs-expert`. `implementer.md` keeps its example list in this spec: live-template persona fixtures pin it (amended 2026-11-22, Judgment Day C-1, design DD-12).
- `SKILL_CATALOG` in `.claude/skills/akili-panel/hooks/flow.mjs` SHALL match the folders on disk.

#### Scenario: No live surface names the retired skill

- GIVEN the finished change
- WHEN `grep -rn nestjs-expert` runs over the repository, excluding `docs/specs/archive/`, `docs/specs/kaizen/`, `docs/specs/kaizen-log.md`, `releases/`, `test/fixtures/` and the spec folder
- THEN every hit is one of: the CHANGELOG entry, the governance *Removal / Fusion Log* row, the installer's retired-name table, a test asserting retirement, or the example list at `.claude/templates/implementer.md` (C-1)
- BUT it must NOT find `nestjs-expert` in a command, a template, the routing matrix, a skill, or a docs page

### FR-9: CHANGELOG with migration note

`CHANGELOG.md` > `Unreleased` SHALL describe the change and carry a migration note:

- the six skills added and `nestjs-expert` removed;
- what `akili update` does to an existing `nestjs-expert` folder;
- the `doctor --agents` `RETIRED` warning, and the fix: re-run `/akili-constitution` Step 8D or edit the Skill Map row to the official set;
- the coexistence rule with `npx @nestjs/skills` and the `nestjs@nestjs` plugin (foreign folders are skipped; plugin skills are namespaced).

#### Scenario: Release reader

- GIVEN the `Unreleased` section
- WHEN a project owner reads it
- THEN they find the three migration facts above without opening another file

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Verbatim.** No upstream byte is edited; the vendor test proves it (FR-1) |
| NFR-2 | **No network.** Neither the tests nor the sync script fetch anything |
| NFR-3 | **Cross-platform.** The six vendored folders get a `-text` line in `.gitattributes` in the same change; the vendor test passes on the `windows-latest` legs |
| NFR-4 | **Counts are run, not written.** Every count in `SKILL_FILE_EXPECTED`, `SKILL_CATALOG`, docs and CHANGELOG comes from a command run on the final tree (KZ-002) |
| NFR-5 | **No active spec path in shipped files.** No shipped test or doc reads or cites `docs/specs/changes/nestjs-official-skills/` (KZ-changes--archify-diagrams-1) |
| NFR-6 | **Historical text untouched.** Files under `docs/specs/archive/`, `docs/specs/kaizen/`, `releases/` and released CHANGELOG sections are byte-unchanged |
| NFR-7 | **Verification green.** `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check`, `node bin/akili.js install --tool all --dry-run` and `node bin/akili.js doctor --tool all` pass |
| NFR-8 | **SemVer.** Minor (Q3). The `RETIRED` warning (FR-5) and the migration note (FR-9) are the conditions for minor; if either is dropped, the release type is reopened |

## 8. Defect Classes and Gates

| Defect class | Gate | Automated |
|---|---|---|
| Vendored byte drift, a file added or missing | Vendor hash test (FR-1, FR-2) | yes |
| CRLF rewrite on Windows checkout | Vendor test on the `windows-latest` CI legs + `.gitattributes` assertion | yes (CI) |
| Foreign folder overwritten or merged | Installer test with a temp target holding a `.nestjs-skills` folder (FR-3) | yes |
| Retired folder left behind, or removed from a shared root | Installer/doctor test with temp targets (FR-4) | yes |
| Skill Map warning missing, false positive, or writes the file | `doctor --agents` test with fixture projects (FR-5) | yes |
| Routing row, card or rule missing or contradicting | Text-contract tests in the backend routing suites (FR-6, FR-7) | yes |
| Stale surface still naming `nestjs-expert` | Repository-wide grep test (FR-8 scenario) | yes |
| Wrong count in a test, docs or CHANGELOG | Count tests (`install-cursor`, panel catalog) + a run grep for docs/CHANGELOG (NFR-4) | partly. Prose counts are checked by the Reviewer against the quoted command |
| An FR-7 rule that agents ignore at runtime | none. No automated check can observe agent behavior across hosts | **accepted risk**: the rule is text; the Reviewer checks that it exists and where it lives |
| The upstream recipes being wrong | none in this repo | **accepted risk**: AKILI does not re-run upstream recipes (proposal, UNVERIFIED row) |

## 9. Requirement ID Index

| ID | Title |
|---|---|
| FR-1 | Vendored official set, verbatim |
| FR-2 | Pin and sync |
| FR-3 | Delivery and ownership on every target |
| FR-4 | `nestjs-expert` retired from the package and from installs |
| FR-5 | `doctor --agents` warns on a retired skill in the Skill Map |
| FR-6 | Backend routing names the official set |
| FR-7 | Outward actions in upstream text are the user's decision |
| FR-8 | Governance, commands, docs and panel |
| FR-9 | CHANGELOG with migration note |
| NFR-1 … NFR-8 | Section 7 |
