# Requirements: Grok Bot install target (`--tool grokbot`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/grokbot-target` |
| Depth | **Standard** — one new install target in `bin/akili.js` + tests + docs; no data, auth, API, routing or persona change |
| Type | Change |
| Deliverable | software |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Status | Draft — Phase 1 approved; **scope change 2026-10-21 (user): safe takeover — FR-4 *Explicit takeover*, *Interrupted install*;** **amended after Judgment Day rounds 1 and 2** (FR-3, FR-4, FR-5, FR-7, FR-8, NFR-3 — see `judgment.md`); **Adjust 2026-10-21 (user): Q1 changed to "box only"** — staging flow removed (FR-2 scenario, FR-4 intro, FR-7 rewritten, FR-8, glossary, stakeholders) |
| Date | 2026-10-21 |
| Source | `proposal.md` (approved 2026-10-21; Q1–Q6 answered; Release classification: **minor** — a new install target; Q1 later changed to "box only", see Status) |
| Format precedent | `docs/specs/archive/2026-10-01-changes--cursor-install-target/requirements.md` — this repo has no `docs/specs/general-setup/` |
| Deviations from proposal | (1) **Precedence of `--local` vs the env var.** The proposal ordered `AKILI_GROKBOT_TARGET` above `--local`. Every existing target does the opposite: the env var feeds the global default and `--local` replaces that default (`bin/akili.js:113-139` `defaultPaths`, `:294-297` `resolveToolTarget`, `:363-369` `base*`). FR-2 follows the existing convention. (2) **Resources root follows the skills root.** The proposal fixed the sibling at `/home/box/agent-data/akili`; FR-2 derives it as `<parent of the workflows root>/akili`, so one `--grokbot-target` override on the box relocates both roots together. The default resolves to the same `/home/box/agent-data/akili`. (3) **Ownership record (FR-4)** is new: it is what makes "skip and report a foreign folder" hold under `akili update`, which forces every write (`bin/akili.js:1013`) |

## 2. Executive Summary

On the Grok Bot box, `akili install --tool grokbot` writes the 27 packaged skills and the 12 AKILI commands, each as `<workflows>/<slug>/SKILL.md`, byte-identical to the source, into the workflows directory every bot shares (default `/home/box/agent-data/workflows`, created if missing). Helper resources go to a sibling `akili/` folder, never into the workflows directory. Because the directory is shared, AKILI records which folders it wrote: a same-name folder it did not write is **foreign** — skipped by install and update, reported by `doctor`, never touched by `--fix`. The CLI is supported only when it runs on the box itself (proposal Q1, changed 2026-10-21): there is no staging tree, no copy step and no built-in SSH; `--grokbot-target` only overrides where on the box the skills go. `--tool all` is unchanged.

## 3. Glossary

| Term | Meaning |
|---|---|
| **Box** | The remote Linux machine that runs Grok Bot. Not this Mac |
| **Workflows root** | The directory Grok Bot scans for skills, one `<kebab-slug>/SKILL.md` per folder. Default `/home/box/agent-data/workflows`. Shared by every bot on the box |
| **Resources root** | Where AKILI puts persona templates, `digests.json`, helper scripts, `.mcp.json.example` and the ownership record. Default `<parent of workflows root>/akili` |
| **Command-skill** | `akili-<name>.md` installed as `<workflows root>/akili-<name>/SKILL.md`, unchanged (same rule as Codex and Cursor) |
| **Owned folder** | A folder in the workflows root that AKILI wrote, as listed in the ownership record |
| **Foreign folder** | A folder in the workflows root whose name matches an AKILI skill or command but is not in the ownership record |
| **Ownership record** | A file in the resources root listing the owned folders |

## 4. System Context & Scope

| Surface | Current behavior (cited at `b5f5160`) |
|---|---|
| Target list | `--tool` accepts `claude, opencode, antigravity, codex, cursor, both, all` and fails on anything else (`bin/akili.js:354-355`). `selectedTools` and `ALL_TOOLS` list the same five (`:460-466`) |
| Target registry | One `TOOL_REGISTRY` entry per tool (`:148-202`) and one `TOOL_ROOT_ARGS` row (`:682-688`). Cursor's entry has `commands: []`, `commandsAsSkills`, `sharedSkillsRoot`, `detectByResourcesOnly` (`:188-202`) |
| Path resolution | `--target` (single tool) wins, then an explicit `--<tool>-target`, then the default; `--local` replaces the default (`:294-297`, `:363-369`, `:405-425`) |
| Install | Commands become `<skills>/<cmd>/SKILL.md` when `commandsAsSkills` (`:786-801`); existing entries are skipped unless `--force` (`:620-621`, `:659-660`); legacy cleanup never runs on a shared skills root (`:729`) |
| Update | Sets `force = true`, then reinstalls every auto-detected tool (`:1013-1014`) |
| Auto-detection | `isToolInstalled` with `detectByResourcesOnly` counts only a non-empty resources root (`:479-496`) |
| Doctor | OK/MISSING per command, skill and resource (`:1155-1290`); STALE scan skipped on a shared root (`:1221`); environment rows filtered by `appliesTo` (`:1353-1358`) |
| `all` / hints | `toolFlagFor` maps a set to `all` only when it equals `ALL_TOOLS` (`:562-567`) |
| Grok Bot | Skills are `<kebab-slug>/SKILL.md` folders with YAML `name` + `description` under `/home/box/agent-data/workflows/`, shared by all bots; the directory does not exist yet on the box. `UNVERIFIED — confirm at source before relying on it` (user-stated, 2026-10-21) |
| Grok Bot frontmatter tolerance | Whether Grok Bot accepts `license`, nested `metadata`, `allowed-tools` and the other extra keys, and runs the commands' `$ARGUMENTS` / `/akili-*` / subagent instructions. `UNVERIFIED — confirm at source before relying on it` |
| Out of scope | Running the CLI anywhere but the box: staging trees, copy commands, built-in SSH/SCP; `akili routing` hosts, model registry, agent wrappers; `doctor --agents`; rewriting command or skill content; `akili init` menu; changing the other five targets |

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| Box operator | One command on the box installs AKILI for every bot; a later `akili update` refreshes it; `--grokbot-target` relocates the install on the box when needed |
| Other bots' skill authors | A folder they own is never overwritten by AKILI without an explicit `--force` |
| Users of the five existing targets | No change in behavior or output |

## 6. Functional Requirements

### FR-1: `grokbot` is a selectable target

The CLI SHALL accept `--tool grokbot` for `install`, `update` and `doctor`, and SHALL list it in `--help`.

#### Scenario: Valid selection

- GIVEN any machine
- WHEN the user runs `akili doctor --tool grokbot --grokbot-target <tmp>/workflows`
- THEN the run checks the grokbot target and does not fail argument validation
- AND the `--tool` error message for an unknown name lists `grokbot` among the accepted values

#### Scenario: `all` and `both` unchanged

- GIVEN any machine
- WHEN the user runs `akili install --tool all --dry-run`
- THEN the tools acted on are exactly `claude, opencode, antigravity, codex, cursor`
- BUT it must NOT include `grokbot`, and `both` must NOT change
- AND IT MUST print `akili doctor --tool all` as its verify hint after a real (non-dry-run) install, as today (a dry run prints no verify hint — amended 2026-10-21 at validation)

### FR-2: Path resolution

The CLI SHALL resolve two grokbot roots.

| Root | Precedence, first match wins |
|---|---|
| Workflows root | `--target <p>` with `--tool grokbot` → `<p>/workflows` · `--grokbot-target <p>` → `<p>` · `--local` → `./.grokbot/workflows` · `AKILI_GROKBOT_TARGET` (non-blank) → its value · `/home/box/agent-data/workflows` |
| Resources root | `--grokbot-resources-target <p>` → `<p>` · otherwise `<parent of the resolved workflows root>/akili` |

`~` expands as for every other target.

#### Scenario: Default

- GIVEN no grokbot flag and no `AKILI_GROKBOT_TARGET`
- WHEN the user runs `akili install --tool grokbot --dry-run`
- THEN the planned writes land under `/home/box/agent-data/workflows/` and `/home/box/agent-data/akili/` (absolute form on the host OS)

#### Scenario: Override on the box

- GIVEN `--grokbot-target /srv/grok/workflows` on the box
- WHEN the user installs
- THEN skills land under `/srv/grok/workflows/` and resources under `/srv/grok/akili/`
- AND IT MUST NOT write anywhere outside those two roots

#### Scenario: Env var, `--local`, `--target`, explicit resources

- GIVEN `AKILI_GROKBOT_TARGET=<e>/workflows`, THEN the workflows root is `<e>/workflows` and resources `<e>/akili`
- GIVEN `--local` too, THEN the roots are `./.grokbot/workflows` and `./.grokbot/akili` (env var ignored)
- GIVEN `--tool grokbot --target <p>`, THEN the roots are `<p>/workflows` and `<p>/akili`
- GIVEN `--grokbot-resources-target <r>`, THEN resources land in `<r>` whatever the workflows root
- BUT a blank `AKILI_GROKBOT_TARGET` must NOT count as set

### FR-3: Install writes the full set, verbatim

`install --tool grokbot` SHALL write every packaged skill folder (`SKILL.md` and its supporting files) and every command as `<workflows root>/<cmd>/SKILL.md`, and the resources (persona templates, `digests.json`, scripts, `.mcp.json.example`) under the resources root, creating missing directories.

#### Scenario: First install on an empty box

- GIVEN the workflows root does not exist
- WHEN the user runs `akili install --tool grokbot` with that root
- THEN the root is created and holds one folder per packaged skill and per command, each with a `SKILL.md`
- AND every installed file is byte-identical to its source
- AND the resources root holds the resource files and the ownership record
- BUT nothing is written inside the workflows root other than skill and command folders

#### Scenario: Dry run and partial installs

- WHEN `--dry-run` is passed, THEN nothing is written, the ownership record included
- WHEN `--skills-only` or `--commands-only` is passed, THEN only that set is written, and the ownership record lists only entries AKILI wrote or began writing (union with what it already listed)

#### Scenario: Shared directory hygiene

- GIVEN the workflows root holds folders that are not AKILI's (any name)
- WHEN the user installs, updates or runs `doctor --fix`
- THEN those folders are left byte-identical
- BUT it must NOT run the legacy cleanup or the STALE scan in the workflows root

### FR-4: Foreign folders are protected

AKILI SHALL record the entries it writes in the workflows root, and SHALL treat a same-name entry (directory, file or symlink, dangling included) absent from that record as foreign.

| Situation | install | install `--force` | update | doctor | doctor `--fix` |
|---|---|---|---|---|---|
| Entry absent | record, write | record, write | record, write | MISSING | record, write |
| Owned entry present | skip | overwrite | overwrite | OK (MISSING if its `SKILL.md` is gone) | restore a missing `SKILL.md` |
| Foreign entry present | skip, labelled foreign | replace whole, record (explicit consent) | skip, labelled foreign — also with `update --force` | FOREIGN | leave untouched |

*Invalid record:* while the ownership record is present but unreadable, every column writes nothing into the workflows root — absent entries are not written (they stay MISSING; `doctor --fix` reports them BLOCKED, never FIXED) and takeover is refused; `install` and `update` exit non-zero (scenario below).

#### Scenario: Foreign `tdd` survives update

- GIVEN `<workflows>/tdd/SKILL.md` was created by another bot's author before any AKILI install
- WHEN the user runs `akili install --tool grokbot` and then `akili update`
- THEN `<workflows>/tdd/SKILL.md` is byte-identical to before both runs
- AND both runs say `tdd` was skipped as foreign
- AND IT MUST NOT add `tdd` to the ownership record

#### Scenario: Explicit takeover

- GIVEN the same foreign `tdd`
- WHEN the user runs `akili install --tool grokbot --force`
- THEN `tdd` is replaced whole by AKILI's copy and recorded as owned
- AND IT MUST leave no file of the foreign `tdd` behind in the workflows root, and remove a foreign symlink without touching its target
- AND IT MUST move the foreign entry aside before deleting anything: a takeover that fails before the copy leaves the foreign entry whole in place, and a failure to delete the moved-aside copy leaves whatever remains of it outside the workflows root, with a warning naming its path

#### Scenario: Ownership record missing or unreadable

- GIVEN AKILI skill folders exist but the ownership record is absent or not valid
- WHEN the user runs `doctor`, `install` or `update`
- THEN those folders are treated as FOREIGN and the output says how to recover: restore the record; or run `doctor` first to see which same-name entries belong to other authors, then delete the record and run `install --force` knowing that every AKILI-named entry will be replaced
- AND IT MUST leave an invalid record byte-identical — no run writes over it
- AND while the record is invalid, `install` (with or without `--force`), `update` and `doctor --fix` MUST write nothing into the workflows root, and `install`/`update` exit non-zero
- BUT the run must NOT crash

#### Scenario: Interrupted install

- GIVEN an install that stops with an error part-way through the workflows root
- WHEN the user runs `akili update` (or `akili install --tool grokbot --force`) afterwards
- THEN every entry AKILI started writing is treated as owned and repaired, never as foreign
- AND a takeover whose move-aside failed MUST NOT leave the foreign entry recorded as owned, nor partly deleted
- BUT `doctor --fix` is only required to restore an owned entry whose `SKILL.md` is missing

### FR-5: Doctor reports grokbot health

`doctor --tool grokbot` SHALL report each command and skill as OK, MISSING or FOREIGN, and each resource as OK or MISSING, and SHALL exit non-zero when any item is MISSING or FOREIGN.

#### Scenario: Healthy install

- GIVEN a completed `install --tool grokbot` into `<tmp>`
- WHEN `doctor --tool grokbot` runs on the same roots
- THEN every item is OK and the exit status is 0
- AND no environment binary row applies to grokbot (the generic rows still print)

#### Scenario: Foreign folder

- GIVEN one foreign folder named like an AKILI skill
- WHEN `doctor --tool grokbot` runs, with or without `--fix`
- THEN that item is FOREIGN with a hint naming `akili install --tool grokbot --force` (with the run's root flags) as the explicit takeover
- AND the grokbot summary row reads INCOMPLETE, the final line does not say all checks passed, and the exit status is non-zero
- BUT `--fix` must NOT change the foreign folder

### FR-6: Auto-detection and update

A grokbot install SHALL be detected by a non-empty resources root only, so a bare `akili update` / `akili doctor` on the box includes it.

#### Scenario: Detected on the box

- GIVEN a populated grokbot resources root at the resolved location
- WHEN the user runs `akili doctor` with no `--tool`
- THEN the auto-detected list includes `grokbot`

#### Scenario: Not detected elsewhere

- GIVEN a machine with no grokbot resources root (e.g. a Mac with Claude Code installed)
- WHEN the user runs `akili doctor` with no `--tool`
- THEN `grokbot` is not detected, and the output for the other tools is unchanged
- BUT a workflows root holding folders, without a resources root, must NOT count as an install

### FR-7: Grokbot next steps

After a non-dry-run grokbot install or update, the next-steps block SHALL say where Grok Bot reads the skills and how many foreign entries were skipped (with the explicit takeover command), and SHALL give a `doctor` hint that reproduces the run's roots.

#### Scenario: Install with an override

- GIVEN `--grokbot-target /srv/grok/workflows` and one foreign entry
- WHEN the install finishes
- THEN the next steps name `/srv/grok/workflows` as the directory Grok Bot must read, report `1` foreign entry skipped, and name `akili install --tool grokbot --grokbot-target /srv/grok/workflows --force` as the explicit takeover
- AND they print `akili doctor --tool grokbot --grokbot-target /srv/grok/workflows` in place of the generic `akili doctor --tool grokbot`
- BUT the CLI must NOT print or run any copy, `rsync` or `ssh` step, and no copy or transfer step may open a network connection (the existing npm update check is unaffected — amended 2026-10-21, T4 review)

### FR-8: Documentation

`README.md`, `docs/cli.md`, the CLI help and `CHANGELOG.md` (Unreleased) SHALL document the grokbot target: roots and precedence, foreign-folder rule, that the CLI runs on the box only (from another machine, open a shell on the box and run it there), the exclusion from `all`, and that commands are installed verbatim and best-effort (Grok Bot has no slash commands; `$ARGUMENTS` and subagent steps may not apply). Every site of the target-count claim family SHALL be true after the change — the list and treatment are in `design.md` §9 (from `AGENTS.md:3,7,11`, `README.md:74,192`, `CONTRIBUTING.md:14`, `.claude/README.md:3,5-11`, `docs/cli.md:21,23,243`, `bin/akili.js:217`).

#### Scenario: Count claims

- GIVEN the shipped docs
- WHEN a reader greps for the claim family — `five`, `all five`, `five-tool`, `five hosts`, and enumerations `Codex.*Cursor` that list the install targets
- THEN every hit is either true with grokbot counted or explicitly scoped to the five desktop tools / `--tool all`

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | The five existing targets behave and print exactly as before: `install --tool all --dry-run`, the Codex doctor baseline (`test/fixtures/doctor-codex-baseline.txt`) and the existing suite pass unchanged |
| NFR-2 | No content fork: no transformation of any `SKILL.md` or command body (proposal Q4) |
| NFR-3 | Tests never touch `/home/box` or the real home: every spawn in the new suite pins `HOME`, `USERPROFILE`, `AKILI_GROKBOT_TARGET` to scratch dirs, and the existing spawns that resolve tools without `--tool` (`test/install-cursor.test.js`, `test/agents-doctor-io.test.js`, `test/agents-doctor.test.js`, `scripts/ci/install-layout-regression.js`) gain the same `AKILI_GROKBOT_TARGET` pin; the suite passes on macOS, Linux and Windows CI legs |
| NFR-4 | Installer safety holds: skip existing by default, overwrite only with `--force` (AGENTS.md *Development Rules*) |
| NFR-5 | Gate: `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check`, plus `node bin/akili.js install --tool all --dry-run` and `node bin/akili.js doctor --tool all` |
| NFR-6 | Live check on the box at `/akili-validate` (HITL): install into the real default, then confirm a Grok Bot lists and loads one AKILI skill and one command-skill. Settles both `UNVERIFIED` rows in §4 |

### Defect classes and their gates

| Defect class | Gate |
|---|---|
| Wrong root / precedence | `node:test` subprocess cases per FR-2 row, asserting written paths |
| Write outside the declared roots | Test lists every file under the scratch tree after install; any file outside the two roots fails |
| Foreign folder overwritten or recorded | FR-4 tests: byte comparison of the foreign `SKILL.md` before/after install, update-path (force without consent) and `doctor --fix` |
| Regression on the five targets | Existing suite + NFR-1 dry-run comparison |
| Content fork | Byte-identity test over every installed file |
| Docs claim false (counts, flags) | Phrase-family grep at T-docs (KZ-002, KZ-changes--kaizen-loop-closure-2) |
| Grok Bot rejects the format or never loads the folder | **No automated check possible from this repo** — substitute: NFR-6 live check at the `/akili-validate` HITL pause. If it fails, the proposal's Option B (frontmatter normalization) becomes a follow-up spec |
| `update` path (package-manager step) | Not automatable (`update` runs a real package-manager install — `test/install-cursor.test.js:44-57`). Substitute: test the install path with the update's force mode directly; `update` itself checked by hand at validate. Accepted risk otherwise |

## 8. Requirement ID Index

| ID | Title |
|---|---|
| FR-1 | `grokbot` is a selectable target |
| FR-2 | Path resolution |
| FR-3 | Install writes the full set, verbatim |
| FR-4 | Foreign folders are protected |
| FR-5 | Doctor reports grokbot health |
| FR-6 | Auto-detection and update |
| FR-7 | Grokbot next steps |
| FR-8 | Documentation |
| NFR-1 … NFR-6 | See §7 |
