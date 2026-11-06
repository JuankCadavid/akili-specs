# Requirements: akili-panel — a Claude Code side pane for the AKILI flow

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel` |
| Depth | **Standard**, with Full-depth risk and rollback notes for the installer (it touches the install path of all six targets). No data, API, auth or migration work |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `gated`. Every phase gate stops for JC. Not pre-approved |
| Status | Draft for JC's review. **Judgment-day closed `fixed, not re-judged`** (`judgment.md`): round 1 fixed J-1 … J-5; JC answered the review gate «Fix only» (2026-11-05 ~20:07 America/Bogota), so the same pass fixed A-1, A-2 and the warnings both judges raised (W-1 … W-14). No re-judgment. Proposal approved by JC 2026-11-05 ~19:08 America/Bogota (quote and decisions D1–D8 in `proposal.md` → *Decisions After Approval*). JC delegated the open decisions and authorized writing the full specify set; the Phase 1 gate is passed under that mandate and recorded here. The design / tasks gate: **Design / tasks approved by JC (Juan Carlos Cadavid), 2026-11-05 ~20:27 America/Bogota:** «Apruebo diseño y tasks, sigue con /akili-execute changes/akili-panel». Approval Mode stays `gated` |
| Date | 2026-11-05 |
| Proposal | `proposal.md`, Option A (plugin entry inside `.claude/skills/`) |
| Format source | `docs/specs/archive/2026-11-02-changes--go-backend-routing--backend-skill-routing/requirements.md`. There is no `docs/specs/general-setup/` in this repo (`ls docs/specs/general-setup` → `No such file or directory`, 2026-11-05) |
| Baseline docs | None in this repo: no `docs/prd.md`, `docs/ux-ui/design.md` or `docs/trd/trd.md` (`ls docs` at `7a697ba`). Root `AGENTS.md` is the reference |
| Verified at | `7a697ba` (`origin/dev`, after sync #121, 2.42.0 published). Runtime probes: Claude Code **2.1.318**, macOS, headless `claude -p` |
| Branch | `JuankCadavid/akili-panel` (worktree) |
| Release | **Minor** (new install artifact). Recorded only. No push, PR, merge, tag or publish in this phase |

## 2. Executive Summary

AKILI users in Claude Code get a side pane, **Akili**, opened with `/akili-panel`. It shows:

- where the active spec sits in the flow (constitution, then propose → specify → execute → test → validate → archive);
- the git branch;
- the session's token use;
- one **Next** button that runs the next `/akili-…` command.

The pane reads everything from disk, so it is right in a new session. It only **watches** the existing `/akili-*` commands: it never registers, answers, rewrites or blocks them.

It ships inside the npm package as a Claude Code plugin at `.claude/skills/akili-panel/`. `akili install --tool claude` installs it; the five other targets never receive it. `akili list`, `doctor` and `update` treat it as a plugin, not as a broken skill.

## 3. Glossary

| Term | Meaning |
|---|---|
| Plugin entry | A folder directly under `.claude/skills/` that holds `.claude-plugin/plugin.json` and no `SKILL.md`. It is not a skill (FR-13) |
| Pane | A Claude Code side area opened by a plugin with `$.ui.open`; its content is drawn by the plugin |
| Spec folder | A folder under `docs/specs/` that holds at least one **spec file** and is not a carve-out |
| Spec file | One of `proposal.md`, `requirements.md`, `design.md`, `tasks.md`, `execution.md`, `test-report.md`, `validation-report.md` |
| Carve-out | A folder under `docs/specs/` that is never a spec: `archive/`, `general-setup/`, `quick/`, `kaizen/`, `audits/`, `reviews/`, and a **family container** (a folder whose only spec-like file is `family.md`). Same list as `/akili-resume` Step 0 item 2 |
| Active spec | A spec folder that has not been archived |
| Displayed spec | The one spec the pane draws, chosen by FR-5 |
| Task status token | `[x]`, `[ ]` or `[~]` (case-insensitive `x`), optionally wrapped in backticks, counted only where it **leads** one of four places in `tasks.md`, trailing text allowed: (a) the value cell of a table row whose first cell is `Status` (bold allowed): `` `[x]` ``, `[x] PASS attempt 2`; (b) a list item: `- [x] …`; (c) the value after `**Status:**`: `- **Status:** [x] · …`; (d) the end of a task heading: `## T1: … [x]`. Lines under `## Document Control` are never read for tokens. Anywhere else, including prose, a bracket pair is not a token (J-4) |
| Mark | One of `✓` (done), `▶` (current), `○` (not reached) |
| Observed command | An `/akili-*` command the person typed, or one the model ran through the Skill tool |
| Spec-taking command | `akili-specify`, `akili-execute`, `akili-test`, `akili-validate`, `akili-archive`: their first argument is the spec path as written. `akili-propose` counts only in the two forms FR-5 names, because it also takes a bare slug or a sentence (`.claude/commands/akili-propose.md:32-38`, J-1) |

## 4. System Context & Scope

### 4.1 Today

| Fact | Evidence (as run, `7a697ba` unless stated) |
|---|---|
| Phase is rebuilt by a model turn and lost when the turn ends | `.claude/commands/akili-resume.md:30-38` (scan), `:44` (phase order) |
| The next-command map exists only as prose | `.claude/commands/akili-resume.md:135-140` |
| The installer copies every entry under `.claude/skills/` to every tool | `bin/akili.js:1259` `copyDirectoryContents(SOURCE_SKILLS, …)` |
| `doctor` reports a skill present only when `SKILL.md` exists | `bin/akili.js:1643-1650` |
| `update` reinstalls through the same path as `install` | `bin/akili.js:1477-1478` (`args.force = true; runInstall(args)`) |
| No plugin concept exists in the installer or tests | `grep -n -i plugin bin/akili.js` → 1 hit, `:84` `"gsap-plugins"` (a legacy skill name); `find . -name .claude-plugin -not -path "*/node_modules/*"` → 0 |
| Claude Code raises `command.run` for a project markdown command, with its arguments | Probe (2.1.318, `-p`): `/akili-probe changes/demo-spec` logged `command.run akili-probe args="changes/demo-spec" origin={"kind":"sdk"}` |
| A Skill-tool run raises no `command.run`, but raises `tool.call` with `skill` and `args` | Probe: the log held `tool.call Skill input={"skill":"akili-probe","args":"changes/via-skill",…}` and no `command.run` line |
| `/akili-propose` resolves a bare kebab-case first token to `changes/<name>` and derives a slug from a sentence; the other spec-taking commands take a spec path | `.claude/commands/akili-propose.md:32-38` |
| `akili update` reinstalls with the installer code already loaded, i.e. the **old** version's | `bin/akili.js:1467-1478`; comment `:1481` "The running process still has the old code loaded" |
| `doctor --fix` writes only absent entries; a present entry whose bytes differ is reported and never written | `bin/akili.js:1666`, `:1677-1679` (comments above `reportPresent`) |
| Claude Code loads a plugin auto-placed in a skills folder (`~/.claude/skills/<name>`, project `.claude/skills/<name>`) | `UNVERIFIED — confirm at source before relying on it`. The plugin-authoring reference says so; a headless `-p` run in an untrusted temp project did **not** adopt one. Settled by T1 (design P-24) |

### 4.2 Scope

**In scope:** the plugin (pane, `/akili-panel`, observers, Next button), the installer changes for install / `list` / `doctor` / `update`, the governance carve-out, the root marketplace file, docs, and tests.

**Out of scope (Non-Goals):**

- Registering, renaming, wrapping or replacing any `/akili-*` command in `.claude/commands/`.
- Writing to any file in the project, including `docs/specs/`.
- Panes for OpenCode, Codex, Cursor, Antigravity or Grok Bot.
- Spec families, `/akili-quick` entries, audits, reviews or kaizen as phases.
- Token totals per spec across sessions (D6, follow-up).
- Budget alerts or enforcement on token use.
- Any language other than English in the UI (D7).
- Release, tag, push, PR, merge or npm publish.

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| AKILI user on Claude Code | See where the spec stands and run the next step without spending a model turn |
| AKILI user on another target | Nothing changes: no new folder, no new `doctor` row |
| AKILI maintainer (JC) | The plugin stays separate from skill governance and from the five other targets, with tests that fail when it leaks |
| Agents running `/akili-*` commands | Their commands run exactly as before |

## 6. Functional Requirements

### FR-1: Claude-only installation

`akili install --tool claude` SHALL install the plugin entry `akili-panel` into the Claude skills directory (`~/.claude/skills/akili-panel/`, or `./.claude/skills/akili-panel/` with `--local`). Every other tool (`opencode`, `antigravity`, `codex`, `cursor`, `grokbot`) SHALL NOT receive it, in any of its skills directories.

#### Scenario: Claude install

- GIVEN a clean temporary home
- WHEN `akili install --tool claude` runs
- THEN `<home>/.claude/skills/akili-panel/.claude-plugin/plugin.json` exists
- AND the installed plugin's files equal the packaged ones byte for byte
- AND IT MUST behave the same with `--local` (under `./.claude/skills/`) and with `--skills-only`
- AND the README states that a plugin under a project's `.claude/skills/` may load only once the person trusts that project (W-13)

#### Scenario: Every other target

- GIVEN a clean temporary home
- WHEN `akili install --tool <t>` runs for each `t` in `opencode`, `antigravity`, `codex`, `cursor`, `grokbot`
- THEN no directory named `akili-panel` exists in any skills directory of `t`
- BUT the install MUST NOT change what `t` receives otherwise (same skills, commands and resources as before this change)

#### Scenario: `--tool all`

- GIVEN a clean temporary home
- WHEN `akili install --tool all` runs
- THEN `akili-panel` exists only under the Claude skills directory

#### Scenario: Existing files

- GIVEN `akili-panel` is already installed for Claude
- WHEN `akili install --tool claude` runs without `--force`
- THEN the existing files are skipped, as for any skill
- AND with `--force` they are overwritten

### FR-2: `update` keeps the same rule, and leaked copies are removed

`akili update` SHALL refresh the plugin for Claude and SHALL NOT add it to any other target. Because `update` reinstalls with the code already loaded, the first update from 2.42.0 or earlier runs the old installer, which copies `akili-panel/` everywhere (A-1). So `akili install --tool <t>` (and `update`'s reinstall on the new code) for any `t` other than `claude` SHALL remove a **leaked copy**. A leaked copy is a folder named `akili-panel` in one of `t`'s skills dirs that holds `.claude-plugin/plugin.json` with `name` `akili-panel` and has no `SKILL.md`. Removal also drops the name from Grok Bot's ownership record. `CHANGELOG.md` SHALL tell upgraders to run `akili install --tool all` (and `--tool grokbot` where used) once after updating.

#### Scenario: Update

- GIVEN an older Claude install without `akili-panel`
- WHEN `akili update` reaches its reinstall step
- THEN `akili-panel` is installed for Claude
- AND no other target gains it

#### Scenario: Upgrade from an old installer

- GIVEN a home where `akili-panel/` (with its `plugin.json`) sits in the Cursor/Codex shared root, the OpenCode and Antigravity skills dirs and the Grok Bot root, and Grok Bot's ownership record lists it, as the old installer leaves them
- WHEN `akili install --tool <t>` runs for each of those tools
- THEN each copy is removed with a `REMOVED akili-panel` line, and the ownership record no longer lists it
- BUT a folder named `akili-panel` without that `plugin.json` (or with `SKILL.md`) MUST NOT be removed

### FR-3: `list` shows plugins apart

`akili list` SHALL print plugin entries under their own `Plugins:` heading, and SHALL NOT print them under `Skills:`. The summary line SHALL count skills without plugin entries and SHALL add a plugin count.

#### Scenario: List

- WHEN `node bin/akili.js list` runs
- THEN `akili-panel` appears under `Plugins:`
- AND it does not appear under `Skills:`
- AND the summary reads `… | 32 skills | 1 plugin | …`, where 32 is the count of skill directories at `7a697ba`; with several plugins it reads `<n> plugins` (W-9)

### FR-4: `doctor` checks plugins by their manifest, for Claude only

`akili doctor` SHALL check a plugin entry only for Claude, and SHALL report it present when `<claude skills dir>/akili-panel/.claude-plugin/plugin.json` exists. It SHALL NOT report the plugin for any other tool. As for a skill, `--fix` SHALL restore a **missing** plugin for Claude, and a plugin whose bytes differ SHALL be reported `DIFFERS` and never written (J-2).

#### Scenario: Healthy after install

- GIVEN a clean install with `--tool all`
- WHEN `akili doctor --tool all` runs
- THEN no line reads `MISSING akili-panel`
- AND the Claude section shows `akili-panel` as present

#### Scenario: Missing plugin

- GIVEN a Claude install where `akili-panel/` was deleted
- WHEN `akili doctor --tool claude` runs
- THEN it reports `akili-panel` as missing
- AND `akili doctor --tool claude --fix` restores it

#### Scenario: Differing plugin

- GIVEN a Claude install where one file of `akili-panel/` was edited
- WHEN `akili doctor --tool claude --fix` runs
- THEN it reports `DIFFERS akili-panel`
- BUT it MUST NOT overwrite the edited file

#### Scenario: Other tools

- WHEN `akili doctor --tool <t>` runs for any `t` other than `claude`, with no leaked copy present
- THEN its output names no `akili-panel`
- BUT it MUST NOT count the plugin as a missing skill

#### Scenario: Leaked copy

- GIVEN a leaked copy (FR-2) in a non-Claude skills dir
- WHEN `akili doctor --tool <t>` runs
- THEN it reports `LEAKED akili-panel` and counts a problem
- AND with `--fix` it removes the copy

### FR-5: Which spec the pane shows

The pane SHALL show one displayed spec, chosen in this order (D3):

1. The spec named by the last observed **spec-taking command** in this project, kept across sessions, if that folder still exists under `docs/specs/` or has been archived. For `akili-specify` … `akili-archive` the spec is the first argument as written. For `akili-propose` it is the first argument when it contains `/`, or `changes/<first argument>` when the first argument is kebab-case with at least one hyphen (`add-remember-me`); any other `/akili-propose` run keeps nothing (J-1).
2. Else the active spec whose last path segment equals the git branch's last segment (`JuankCadavid/akili-panel` → `akili-panel`). With several, the most recently modified.
3. Else the most recently modified active spec (latest modification time of its spec files).

When other active specs exist, the header SHALL add `(n more active)`, `n` being the count of active specs minus the displayed one.

#### Scenario: Last observed command wins

- GIVEN active specs `changes/a` and `changes/b`, branch `feat/b`
- AND the person last ran `/akili-execute changes/a` in this project
- WHEN the pane draws
- THEN it shows `changes/a` and `(1 more active)`

#### Scenario: Branch match

- GIVEN no observed command for this project, active specs `changes/a` and `bugfix/b`, branch `fix/b`
- WHEN the pane draws
- THEN it shows `bugfix/b`

#### Scenario: Most recent

- GIVEN no observed command and no branch match
- WHEN the pane draws
- THEN it shows the spec whose spec files were modified last

#### Scenario: Unsafe argument

- GIVEN the person runs `/akili-execute ../../etc` or `/akili-execute /tmp/x`
- WHEN the observer records it
- THEN the argument is not kept
- AND IT MUST accept only relative paths of segments made of letters, digits, `.`, `_`, `-`, with no `.` or `..` segment

#### Scenario: Propose arguments

- GIVEN the person runs `/akili-propose add-remember-me keep users signed in`
- THEN the kept spec becomes `changes/add-remember-me`
- AND `/akili-propose bugfix/login-loop` keeps `bugfix/login-loop`
- BUT `/akili-propose Add dark mode to settings` and `/akili-propose loan` MUST NOT change the kept spec

#### Scenario: Not a spec-taking command

- GIVEN the person runs `/akili-resume` or `/akili-quick fix the typo`
- THEN the kept spec does not change

### FR-6: Phase marks

The pane SHALL draw two blocks:

**01 Constitution**, from these 13 files, read from the baseline list in `.claude/commands/akili-constitution.md:46-61` (D4; the optional `CLAUDE.md` is left out):

| # | File | Also accepted (legacy path) |
|---|---|---|
| 1 | `docs/prd.md` | — |
| 2 | `docs/ux-ui/design.md` | `docs/system-design/design.md` |
| 3 | `docs/trd/trd.md` | `docs/detailed-design/detailed-design.md` |
| 4 | `docs/infrastructure.md` | — |
| 5–8 | `docs/specs/general-setup/requirements.md`, `design.md`, `task.md`, `family.md` | — |
| 9 | `AGENTS.md` | — |
| 10–13 | `.agents/leader.md`, `implementer.md`, `reviewer.md`, `tester.md` | — |

`✓` when all 13 exist; `○` when none exists; `▶ (k/13)` otherwise, `k` the count present.

**02 Spec flow**, for the displayed spec, in the order propose → specify → execute → test → validate → archive:

| Phase | Done when |
|---|---|
| propose | `proposal.md`, `requirements.md`, `design.md` or `tasks.md` exists (a spec specified without a proposal counts as past propose) |
| specify | `requirements.md`, `design.md` and `tasks.md` all exist |
| execute | `tasks.md` has at least one task status token, and every one is `[x]`. A `tasks.md` with no token at all is not done and reads `▶ (no task status)` |
| test | `test-report.md` exists |
| validate | `validation-report.md` exists |
| archive | the spec has been archived: its folder is gone and `docs/specs/archive/` holds a folder named `YYYY-MM-DD-<safe-name>`, `<safe-name>` being the spec path with `/` replaced by `--` |

The **current phase** is the first phase not done. Phases before it are `✓`, the current one `▶`, later ones `○`. When `tasks.md` holds a `[~]` token, the current phase reads `▶ (blocked)` (D5). An archived spec shows every phase `✓` and the word `archived`.

#### Scenario: Specify in progress

- GIVEN `changes/x` holds `proposal.md` and `requirements.md`
- THEN propose is `✓`, specify `▶`, and execute through archive `○`

#### Scenario: Prose is not a status

- GIVEN `tasks.md` has every `Status` cell `[x]`, and a paragraph that says "use `[~]` for blocked tasks"
- THEN execute is `✓`
- AND the pane MUST NOT show `(blocked)`

#### Scenario: Blocked

- GIVEN `tasks.md` has one `Status` cell `[~]`
- THEN execute reads `▶ (blocked)`

#### Scenario: Out-of-order file

- GIVEN `test-report.md` exists while a task is still `[ ]`
- THEN execute is `▶` and test `○`
- BUT the pane MUST NOT mark test `✓` past an unfinished phase

#### Scenario: Real status formats

- GIVEN `tasks.md` files written in each of the four token places, with and without backticks and with trailing text (`` `[x]` — PASS ``), and a `## Document Control` table whose `Status` reads `Draft — Phase 3`
- THEN each counts exactly its task tokens
- AND a file with CRLF line endings counts the same as with LF

#### Scenario: No status at all

- GIVEN `requirements.md`, `design.md` and a `tasks.md` with no token
- THEN execute reads `▶ (no task status)`
- BUT the pane MUST NOT mark execute `✓`

#### Scenario: Legacy baseline

- GIVEN a project with `docs/system-design/design.md` and no `docs/ux-ui/design.md`
- THEN that file counts as present for the constitution

### FR-7: Next button

The pane SHALL show one button, `Next: /<command> <args>`, built from the current phase. It gives the same next command as `/akili-resume` Step 4 (`.claude/commands/akili-resume.md:135-140`), keyed differently: resume keys on the last phase reached, the pane on the first phase not done, and the outcomes agree (resume's PROPOSE → `/akili-specify` is the pane's "current phase specify"). One row has no resume counterpart: `propose`, which is current only when the displayed spec's folder exists with no spec file yet, i.e. a `/akili-propose` still writing its proposal (W-1):

| State | Button |
|---|---|
| No `docs/specs/` and constitution not `✓` | `Next: /akili-constitution` |
| No active spec, constitution `✓` | `Next: /akili-propose` |
| No active spec, constitution not `✓` | `Next: /akili-constitution` |
| Current phase propose | `Next: /akili-propose <spec>` |
| Current phase specify | `Next: /akili-specify <spec>` |
| Current phase execute (blocked or not) | `Next: /akili-execute <spec>` |
| Current phase test | `Next: /akili-test <spec>` |
| Current phase validate | `Next: /akili-validate <spec>` |
| Current phase archive | `Next: /akili-archive <spec>` |
| Displayed spec archived, other active specs exist | `Next: /akili-resume` |
| Displayed spec archived, none other active | `Next: /akili-propose` |

Pressing it SHALL run that command as if the person typed it.

#### Scenario: Press

- GIVEN the button reads `Next: /akili-specify changes/akili-panel`
- WHEN the person presses it
- THEN Claude Code runs `/akili-specify changes/akili-panel`, queued until the session is idle
- AND the command's own text is what runs; the plugin adds nothing to it

#### Scenario: Run refused

- GIVEN Claude Code refuses the run (an unknown command, a host limit)
- WHEN the person presses the button
- THEN a short message says the command could not run, with the reason
- BUT the pane MUST NOT close or lose its state

#### Scenario: Double press

- GIVEN the person presses the button twice before the first run starts
- THEN only one run is queued

### FR-8: `/akili-panel` opens the pane

The plugin SHALL register exactly one slash command, `/akili-panel`. Running it SHALL open the pane with id `akili` and title `Akili`, or bring it back if it is already open, and print `Akili pane opened.`; when Claude Code does not place the pane, it SHALL print `Akili pane not shown: <reason>` instead (W-10). The plugin SHALL NOT open the pane unasked.

#### Scenario: Open

- WHEN the person types `/akili-panel`
- THEN the Akili pane opens

#### Scenario: One command only

- WHEN the plugin's hooks module is read
- THEN the only command it registers is `akili-panel`
- AND IT MUST NOT register, rename or answer any other `/akili-*` command

### FR-9: Watch, never interfere

When an `/akili-*` command is typed, or run by the model through the Skill tool, the plugin SHALL let it run unchanged and refresh the pane afterwards.

#### Scenario: Typed command

- GIVEN the person types `/akili-execute changes/a`
- THEN the command runs with the same name, arguments and result as without the plugin
- AND the pane refreshes after it

#### Scenario: Skill-tool run

- GIVEN the model runs `akili-test` through the Skill tool with arguments `changes/a`
- THEN the tool call runs unchanged
- AND the kept spec becomes `changes/a`

#### Scenario: Plugin failure

- GIVEN the plugin's observer throws or times out
- THEN the command still runs
- BUT it MUST NOT be blocked, delayed past the plugin's own budget, or changed

### FR-10: Read-only toward the project

The plugin SHALL NOT write, move or delete any file in the project. It keeps its own data only in Claude Code's per-plugin store and session state.

#### Scenario: No writes

- WHEN the hooks module is read
- THEN it calls no file-writing operation
- AND `git status` in a project shows no change caused by the pane

### FR-11: Branch

The header SHALL show the current git branch, read from the nearest `.git` at or above the project root (a folder, or a worktree's file holding `gitdir: <dir>`, relative paths resolved against that file's folder) and its `HEAD` file, **without running a process** (J-3). `ref: refs/heads/<name>` shows `<name>`; a bare commit id shows `detached @<first 7 characters>`; no `.git` found, or an unreadable `HEAD`, shows `(no git)`.

#### Scenario: Worktree

- GIVEN the project is a git worktree on `JuankCadavid/akili-panel`
- THEN the header shows `⎇ JuankCadavid/akili-panel`

#### Scenario: No git

- GIVEN the project is not a git repository
- THEN the header shows `(no git)`

#### Scenario: Subfolder and detached

- GIVEN the session started in `repo/packages/app` and `repo/.git/HEAD` holds a commit id
- THEN the header shows `detached @` and the id's first 7 characters

### FR-12: Token line

The pane SHALL show one line, `Tokens: ctx <p>% (<used>/<window>) · session <in> in / <out> out · $<usd>` (D6, session only):

| Part | Source | When missing |
|---|---|---|
| `ctx` | the live context fill Claude Code reports | `ctx —` before the first response |
| `session … in / … out` | summed from every finished turn in this session, subagents' turns included; `in` = input + cache-read + cache-write tokens, `out` = output tokens | `session 0 in / 0 out` |
| `$<usd>` | the session cost Claude Code reports, two decimals | the part is left out |

Numbers SHALL be shortened: below 1,000 as is, then `k` (one decimal under 10k), then `M` (one decimal).

#### Scenario: Fresh session

- GIVEN no response yet
- THEN the line reads `Tokens: ctx — · session 0 in / 0 out` followed by ` · $0.00` when the cost is reported

#### Scenario: After `/clear` or a resume

- WHEN the person runs `/clear`, or the session is resumed
- THEN the session figures start again from 0
- AND the `$` part stays Claude Code's own total, which for a resumed session counts from its first launch (W-12)

### FR-13: Governance carve-out

`docs/skills/governance.md` SHALL state that a plugin entry under `.claude/skills/` is not a skill: it carries no `SKILL.md` and no `metadata.binding`, declares author and license in its `plugin.json`, and is documented outside the skill inventory. Skill counts in docs and tests SHALL exclude plugin entries.

#### Scenario: Skill inventory unchanged

- WHEN the docs-overview tests run
- THEN the skill count stays 32 and no row for `akili-panel` is required in the skill tables

### FR-14: Marketplace file (D8)

The repo SHALL hold `.claude-plugin/marketplace.json` that lists `akili-panel` with its source at `./.claude/skills/akili-panel`, so `/plugin install akili-panel --marketplace JuankCadavid/akili-specs` can install it. The npm package SHALL NOT include the root `.claude-plugin/` folder.

#### Scenario: Validate

- WHEN `claude plugin validate .` runs at the repo root
- THEN it reads the marketplace file with no error

### FR-15: Package hygiene

Files Claude Code generates inside a loaded plugin (`.claude-plugin/types/`) SHALL NOT be committed, packed into npm, or copied by the installer.

#### Scenario: Generated types present

- GIVEN a **temporary copy** of the package in which `.claude/skills/akili-panel/.claude-plugin/types/` exists (never the live tree: other tests count `.claude/skills` in parallel, W-3)
- WHEN `npm pack --dry-run` and `akili install --tool claude` run from that copy
- THEN neither lists nor copies that folder
- AND `git status` does not show it as untracked

### FR-16: Empty and error states

All pane text SHALL be English (D7). The pane SHALL show:

| Situation | Text |
|---|---|
| No `docs/specs/` folder | `No docs/specs/ folder yet.` |
| `docs/specs/` with no active spec | `No active spec.` |
| A read fails | `Could not read <path>: <reason>` on one line, the rest of the pane still drawn |
| The pane is narrower than the header | the spec path is shortened in the middle with `…`; no line wraps past the pane's width |

#### Scenario: New project

- GIVEN a project with no `docs/specs/`
- THEN the pane shows `No docs/specs/ folder yet.`, the constitution mark, and `Next: /akili-constitution` (or `/akili-propose` when the constitution is `✓`)

## 7. Non-Functional Requirements

| ID | Requirement | Measure |
|---|---|---|
| NFR-1 | Drawing never touches disk or runs a process | The `ui.render` hook reads only session state; checked by the static contract test |
| NFR-2 | A refresh is bounded | Per refresh: **0** processes; `list` calls ≤ the folders visited under `docs/specs/` (never inside `archive/`) + 1 (the `archive/` listing, only when the kept spec's folder is missing); `exists` calls ≤ 15 (13 baseline + 2 legacy) + 20 (`.git` search, one per ancestor, at most 20 levels); `read` calls ≤ 3 (`tasks.md`, a `.git` file, `HEAD`). The pure-logic tests count calls on fixtures and fail past each ceiling (J-3) |
| NFR-3 | The pane is never stale by more than 30 s for edits made outside the session | A timer refresh every 30 s while the pane is up |
| NFR-8 | No cost while the pane is not up | When `/akili-panel` has not placed the pane, or the pane was closed, no refresh reads the disk; only the kept spec and the token sums are recorded (W-10) |
| NFR-4 | Fail open | Any plugin error leaves every command and tool call unchanged (FR-9) |
| NFR-5 | Every surface | The pane draws with elements every surface has (terminal, desktop, VS Code, mobile); the plugin tests mount it on at least `terminal` and `desktop` |
| NFR-6 | Claude Code version | Built and verified against Claude Code **2.1.318**; the README states it. Older builds may not load the plugin, which leaves the rest of AKILI unaffected |
| NFR-7 | CI | The installer and pure-logic tests run under `node --test` on the CI matrix (ubuntu, macOS, Windows × Node 18, 22; `.github/workflows/ci.yml:30-37`) |

## 8. Defect Classes and Gates

| # | Defect class this spec can produce | Gate that catches it |
|---|---|---|
| D-1 | Wrong phase, mark, spec choice or Next command | `node --test` over the pure logic with fixture spec trees under `test/fixtures/akili-panel/` (never the live `docs/specs/<this spec>`, KZ-changes--archify-diagrams-1) |
| D-2 | Plugin leaks into a non-Claude target, a leaked copy from an old `update` survives, a foreign folder is removed, or a target loses something | `node --test` install tests, one per target, plus `--tool all` and seeded leaked / foreign copies (KZ-002: one test per target, never an aggregate). The old-code `update` run itself cannot be tested in this repo; its effect is seeded |
| D-3 | `doctor` / `list` misreport (MISSING plugin, wrong counts) | `node --test` doctor and list tests, and the updated existing tests |
| D-4 | Observer blocks, delays or alters an `/akili-*` command | `claude plugin test` with the engine's own kit (local only: CI has no `claude`) **and** the static contract test in CI. Substitute for the live path: the manual check in T9 |
| D-5 | Claude Code refuses the module or the drawing (bad manifest, element, prop) | `claude plugin validate` and `claude plugin test` mounting the pane on `terminal` and `desktop` (local only) |
| D-6 | Layout: lines too wide, unreadable glyphs, wrong look on a real surface | **No automated check** can see the painted pane. Substitute: a human check at the T9 HITL pause in a real terminal session, at two widths |
| D-7 | Generated types or the root marketplace folder end up in npm | `npm run pack:dry-run` output grep |
| D-8 | Docs claim wrong counts or stale paths | `docs-overview` tests and a grep sweep in the docs task |
| D-9 | Token figures double-count subagent turns | Settled by the T1 probe; if unsettled, an **accepted risk**: the line is labelled as the sum of turns, not as the bill (the `$` part is Claude Code's own figure) |
| D-10 | API drift in a later Claude Code build | **Accepted risk**: the README pins 2.1.318; `claude plugin validate` is re-run on upgrade |

## 9. Requirement ID Index

| ID | Title | Decisions |
|---|---|---|
| FR-1 | Claude-only installation | D2 |
| FR-2 | `update` keeps the same rule, and leaked copies are removed | D2, A-1 |
| FR-3 | `list` shows plugins apart | — |
| FR-4 | `doctor` checks plugins by their manifest | D2 |
| FR-5 | Which spec the pane shows | D3 |
| FR-6 | Phase marks | D4, D5 |
| FR-7 | Next button | — |
| FR-8 | `/akili-panel` opens the pane | — |
| FR-9 | Watch, never interfere | — |
| FR-10 | Read-only toward the project | — |
| FR-11 | Branch | — |
| FR-12 | Token line | D6 |
| FR-13 | Governance carve-out | — |
| FR-14 | Marketplace file | D8 |
| FR-15 | Package hygiene | — |
| FR-16 | Empty and error states | D7 |
| NFR-1 … NFR-8 | Section 7 | — |
