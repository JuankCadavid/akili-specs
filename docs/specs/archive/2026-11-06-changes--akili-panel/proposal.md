# Proposal: akili-panel — a Claude Code side pane for the AKILI flow

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel` (literal path from the argument) |
| Type | Change |
| Deliverable | software |
| Approval Mode | `gated` (default). The brief says: *"There is NO end-to-end pre-approval mandate. Do NOT mark gates pre-approved."* Unchanged by the approval below |
| Status | **Approved** by JC (Juan Carlos Cadavid), 2026-11-05 ~19:08 America/Bogota: «solo funciona para claude si no estoy mal y tu eres el experto en la metodologia entonces adelante con la decisiones, en ingles». English sense: Claude-only; the methodology owner (the specifying agent) takes the open decisions; UI and docs in English. Decisions recorded in *Decisions After Approval* below. Next phase: `/akili-specify` (requirements, design, tasks) |
| Requirement source | Owner brief (JC), relayed by the Methodology agent: "Add a Claude Code mod — a plugin with a hooks module — called **akili-panel**" |
| Visual source | None. This is a pane inside Claude Code (terminal, desktop, VS Code, mobile surfaces), not a website |
| Source questions | Answered by the brief (requirement source and visual source are both stated there) |
| Author skill | `plugin-authoring` (Claude Code bundled skill, build 2.1.318): **exists**, loaded for this proposal |
| Date | 2026-11-05 |
| Branch | `JuankCadavid/akili-panel` (worktree, based on `origin/dev` at `7a697ba`) |
| Depends on | none |
| Parallel-safe | yes. It touches `bin/akili.js` install/doctor/list paths; no other spec is open on those paths |
| Release intent | `release:minor` after JC's explicit OK and a working mod (new install artifact). **Not in this phase** |

## Intent

Give AKILI users a pane beside the chat in Claude Code. The pane shows:

- where the active spec sits in the methodology flow;
- the current git branch;
- how many tokens the session has used.

It also has one button that runs the next `/akili-…` command. The panel **watches** the existing commands and never replaces them.

## Problem / Current Behavior

| # | Today | Evidence |
|---|---|---|
| P1 | To see a spec's phase, you run `/akili-resume`. It spends a model turn rebuilding the picture from files, and the picture is gone when the turn ends. | `.claude/commands/akili-resume.md` Step 0 item 3 and Step 1 (phase derived from artifact presence) |
| P2 | Nothing in the UI shows which command comes next. The mapping exists only as prose. | `.claude/commands/akili-resume.md` Step 4 (*PROPOSE → /akili-specify …*) |
| P3 | Branch and token use are spread around: the git prompt, `/cost`, `/context`. Nothing ties them to the spec being worked on. | UNVERIFIED — confirm at source before relying on it (depends on each user's status-line setup) |
| P4 | The installer treats every folder under `.claude/skills/` as a skill. It copies each one to every tool. `doctor` reports a skill present only when `SKILL.md` exists. So a folder without `SKILL.md` would show `MISSING` on every run. | `bin/akili.js:508` `listSkills()` = every directory; `bin/akili.js:1259` copies all of `SOURCE_SKILLS` to every tool's skills dirs; `bin/akili.js:1643-1650` `hasInstalledSkill` checks `<dir>/<skill>/SKILL.md` |
| P5 | There is no `akili check` subcommand. The brief's "`list`, `doctor`, and `check`" maps to `list`, `doctor` and `update` (`update` also copies skills). | `bin/akili.js:3094-3121` dispatch: `install`, `update`, `doctor`, `routing`, `list`, `notifications`, `help` (+ `init`) |

## Proposed Outcome

1. `akili install --tool claude` puts `akili-panel` in `~/.claude/skills/akili-panel/` (or `.claude/skills/` with `--local`). Claude Code auto-loads it from there as a plugin. Source: plugin-authoring `reference.md` → *Developing one*: "a plugin auto-loaded from a skills folder (`~/.claude/skills/<name>`, the project's `.claude/skills/<name>`)".
2. `/akili-panel` opens a pane titled **Akili**:

   ```text
   Akili · changes/akili-panel · ⎇ JuankCadavid/akili-panel
   01 Constitution      ✓
   02 propose           ✓
      specify           ▶
      execute           ○
      test              ○
      validate          ○
      archive           ○
   Tokens: ctx 41% (82k/200k) · session 1.2M in / 38k out · $3.10
   [ Next: /akili-specify changes/akili-panel ]
   ```

3. The panel reads its state from the spec files on disk, so it is correct in a new session. Watching `command.run` only makes it refresh sooner.
4. Codex, Cursor, Antigravity, Grok Bot and OpenCode never receive the folder. `list` and `doctor` treat it as a plugin, not a broken skill.

## Scope

| In scope | Detail |
|---|---|
| Mod files | `.claude/skills/akili-panel/`: `.claude-plugin/plugin.json`, `hooks/hooks.json`, `hooks/register.tsx`, `types/index.d.ts` (the plugin keeps `$.state` atoms), `README.md` |
| Pane | Flow (01 Constitution; 02 propose → specify → execute → test → validate → archive), ✓/▶/○ marks, active spec name, git branch, token/usage line, one **Next** button |
| Command | `/akili-panel` registered with `$.command.register` in `session.start` and answered by its own `command.run` hook that calls `$.ui.open` |
| Observer | One `command.run` hook for `akili-*` names that always calls `next(e)` and never blocks. After the command runs, it re-reads the files on disk |
| Language | Button label `Next: /akili-…` / `Siguiente: /akili-…`. How the language is chosen is open question Q6 |
| Installer | Exclude the plugin entry for every non-Claude target. `list` shows it under its own heading. `doctor` and `update` check `plugin.json` instead of `SKILL.md`, and only for Claude |
| Tests | New `node:test` file(s) under `test/`, plus updates to existing tests that count skill folders (see Risks R4) |
| Docs | `README.md`, `CHANGELOG.md` → `Unreleased`, `docs/cli.md`, `docs/skills/governance.md` (a plugin carve-out), a `docs/skills/akili-panel.md` page |
| Optional (Q7) | Root `.claude-plugin/marketplace.json` so `/plugin install akili-panel --marketplace JuankCadavid/akili-specs` works (the remote is `github.com/JuankCadavid/akili-specs`) |

## Non-Goals

- Registering, renaming, wrapping or replacing any `/akili-*` command in `.claude/commands/*.md`. The only command the plugin registers is `akili-panel`.
- Writing to any spec artifact. The panel is read-only toward `docs/specs/`.
- Panes for OpenCode, Codex, Cursor, Antigravity or Grok Bot. None of them loads Claude Code plugins.
- Showing spec families, `/akili-quick` log entries, audits or reviews as phases. They are observed, not drawn as cycle steps.
- Budget enforcement or alerts on token use. The panel only displays it.
- Release, tag, push, PR, merge or npm publish in this phase.

## Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Claude Code users of AKILI | Get the pane after `akili install --tool claude` or `update` |
| Users of the other five targets | No change. This must be proven by tests |
| `bin/akili.js` | `installTool` skills copy (`:1254-1261`), `runList` (`:1609`), `doctorTool` skills loop (`:1775-1812`), `hasInstalledSkill` (`:1643`), `runUpdate` |
| `test/` | `install-cursor.test.js` (`SKILL_DIR_COUNT`, `:225`, and the "no `akili-*` dir under `--skills-only`" assertion `:645`), `install-grokbot*.test.js` (`SKILL_NAMES` from every source dir), `docs-overview.test.js` (skills list), `backend-skill-routing-coverage.test.js` (skill roots) |
| Skill governance | `docs/skills/governance.md`: "Every skill declares `metadata.binding` in its `SKILL.md` frontmatter". A plugin folder has no `SKILL.md` and needs an explicit carve-out |
| This repo's own sessions | Once the folder exists, Claude Code auto-loads it in every session opened in this repo (dogfooding; see R6) |
| Related specs | `changes/cursor-install-target`, `changes/grokbot-target`, `changes/codex-install-target` (archived). Their per-tool skill roots are what the exclusion must respect |

## Visual Reference

- Source: None
- Location: n/a
- Notes: a terminal-first pane drawn with the surface's own elements (`Box`, `Text`, `Button` from `$.ui.resolve(e)`). The ASCII sketch in *Proposed Outcome* is the intended layout. `/akili-specify` may tighten it; no mockup is needed.

## Requirement Delta Preview

### ADDED Requirements

- A Claude Code plugin `akili-panel` ships in the package and is installed only for `--tool claude`.
- `/akili-panel` opens (or refocuses) a pane with id `akili` and title **Akili**.
- The pane derives each phase mark from the disk state of the active spec (rules below), the constitution mark from project baseline signals (Q3), and shows the active spec path (Q2).
- The pane shows the current git branch, or `(no git)` / `detached @<sha>`.
- The pane shows token use: context fill (`$.session.usage().context`), session token totals summed from `turn.complete`'s `e.usage`, and cost in USD when present.
- A **Next** button runs the recommended command through `$.command.run({ command, args })`. The recommendation uses the same phase→command map as `/akili-resume` Step 4.
- An observer on `command.run` for `akili-*` commands calls `next(e)` first and refreshes after. It never answers, rewrites or blocks a command.
- `akili list` shows plugins under their own heading. `doctor` and `update` check `.claude-plugin/plugin.json` for plugin entries, and only for Claude.

Phase rules from disk (they mirror `/akili-resume` Step 0 item 3; `/akili-specify` confirms them):

| Phase | ✓ done when | ▶ current when |
|---|---|---|
| propose | `proposal.md` exists | spec folder exists, no `proposal.md` |
| specify | `requirements.md`, `design.md`, `tasks.md` all exist | `proposal.md` exists, the specify set incomplete |
| execute | every task in `tasks.md` is `[x]` | any `[ ]` or `[~]` task remains |
| test | `test-report.md` exists | execute done, no `test-report.md` |
| validate | `validation-report.md` exists | test done, no `validation-report.md` |
| archive | the folder has moved to `docs/specs/archive/YYYY-MM-DD-<safe-name>/` | validate done, folder still active |

Spec discovery skips the folders `/akili-resume` excludes: `archive/`, `general-setup/`, `quick/`, `kaizen/`, `audits/`, `reviews/`, and family containers (a folder whose only spec file is `family.md`).

### MODIFIED Requirements

- `install` copies the skills tree to every tool's skills dirs. It now skips plugin entries for every tool except `claude`.
- `doctor`'s skill presence check, `SKILL.md` exists, is replaced for plugin entries by a check that `.claude-plugin/plugin.json` exists.
- Skill governance gains a carve-out: a plugin entry under `.claude/skills/` is not a skill. It declares author, license and binding in `plugin.json` / its README instead of `SKILL.md` frontmatter.

### REMOVED Requirements

- None.

## Approach Options

| | A. Plugin entry inside `.claude/skills/` (brief's option A) | B. Separate `plugins/` source tree | C. Marketplace only |
|---|---|---|---|
| Where it lives | `.claude/skills/akili-panel/` | `plugins/akili-panel/` (new top-level source) | `plugins/akili-panel/` + root `.claude-plugin/marketplace.json` |
| How users get it | `akili install --tool claude` copies it to `~/.claude/skills/akili-panel/`, auto-loaded there | `akili install --tool claude` copies the new `plugins` category into `~/.claude/skills/akili-panel/` | Each user runs `/plugin install akili-panel --marketplace JuankCadavid/akili-specs` |
| Installer change | One `isPluginEntry(dir)` predicate (`.claude-plugin/plugin.json` exists, no `SKILL.md`), used by install (skip for non-Claude), `list` (own heading), `doctor`/`update` (probe `plugin.json`) | A new category beside commands/skills/resources: its own copy loop, `--plugins-only`?, a `doctor` section, a `package.json` `files` entry | None |
| Skill governance | Needs a written carve-out: the folder sits under `skills/` without `SKILL.md` | Untouched: `skills/` stays SKILL.md-only | Untouched |
| Existing tests | Several count every source skill dir and need the plugin filtered out (R4) | Mostly untouched | Untouched |
| Dogfooding | Auto-loads in every session in this repo (R6) | Run with `claude --plugin-dir plugins/akili-panel` | Same as B |
| Meets "automatic on install/update" release intent | Yes | Yes | **No**: users must opt in by hand |
| Size | Smallest installer change that meets the intent | Medium | Smallest code, misses the intent |

## Recommended Approach

**Option A, with one predicate.** Keep the brief's location (`.claude/skills/akili-panel/`). Add a single `isPluginEntry()` helper in `bin/akili.js`, and make install, `list`, `doctor` and `update` branch on it. The governance carve-out goes in `docs/skills/governance.md`. All existing skill-counting tests filter through the same predicate.

Why this is the smallest safe path:

- It is the only option the brief prefers that also meets the release intent. With C, the mod would not arrive automatically on `akili install`/`update`.
- Claude Code already auto-loads plugins from `~/.claude/skills/<name>`, so the installer needs no new destination, only an exclusion.
- One predicate, not a new category, keeps the diff to a branch inside four existing loops. KZ-004 asks exactly this: when a folder takes on a new role, name which branch of each scan it lands in.

Plugin design inside A (all APIs verified against the build-2.1.318 type file `plugin-authoring/types/claude-code.d.ts`):

| Need | API used | Verified at |
|---|---|---|
| Open the pane | `$.ui.open({ id: 'akili', title: 'Akili' })` + `on('ui.render', { component: 'Pane', requestId: 'akili' }, …)` | types `:2518-2541`; example `examples/pane.tsx` |
| `/akili-panel` | `$.command.register({ name: 'akili-panel', description })` in `session.start`; `on('command.run', { command: 'akili-panel' }, …)` returns `{ text }` | types `:3220-3234`; `examples/pane.tsx` |
| Observe `/akili-*` | `on('command.run', …)` → `await next(e)`, then refresh. `e.command`, `e.args`, `e.origin` | `CommandRunInput` types `:1828-1855` |
| Next button | `<Button onPress={…}>` → `$.command.run({ command: 'akili-specify', args: '<spec-path>' })`. It runs "as if the person typed `/command args`", queued until the session is idle | types `:3207-3219`, `ButtonProps` `:1086-1166` |
| Read specs | `$.fs.list`, `$.fs.read`, `$.fs.exists`, `$.fs.stat` (paths relative to cwd or absolute; 4 MiB cap per read) | types `:3369-3468` |
| Project root | `$.session.root()` / `$.session.cwd()` | types `:2874-2888` |
| Git branch | `$.process.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'])`. Fallback: parse `.git/HEAD` with `$.fs`, following the `gitdir:` file in worktrees | types `:3644-3661` |
| Context / cost | `$.session.usage()` → `context.tokens/window/percent`, `rateLimits[].percentUsed`, `cost.usd`. `session.measure` fires when they change | `SessionUsage` types (search `export type SessionUsage`), `SessionMeasureInput` |
| Token totals | `on('turn.complete', …)` → `e.usage` (`input_tokens`, `output_tokens`, `cache_*`), summed into a `$.state` atom | `TurnUsage`/`ModelUsage` types `:14545`, `:14908` |
| Values a drawing reads | `atom` / `read` / `update` declared in `types/index.d.ts` under `interface PluginState` | plugin-authoring SKILL.md; `examples/pane-state.d.ts` |

## Risks, Dependencies, And Open Questions

### APIs checked against the brief

| Brief term | Status | Note |
|---|---|---|
| `plugin-authoring` skill | **Exists** | Bundled with Claude Code 2.1.318 |
| Pane | **Exists** | `$.ui.open` + `ui.render` on `Pane`. Unasked panes need ≥144 columns; an asked (`/akili-panel`) pane is placed at any width |
| `$.command.run` | **Exists** | Rejects when called inside a hook the turn waits on. A button press is fine; a `command.run` observer must not call it |
| `on('command.run')` + `next(e)` | **Exists** | Fires for a typed `/name`. Whether it fires for `user`-source markdown commands (`.claude/commands/*.md`) is UNVERIFIED — confirm at source before relying on it. `CommandSource` includes `'user'`, which suggests yes |
| `$.fs` | **Exists** | Read, write, list, exists, stat, ancestors |
| `$.state` | **Exists** | Session-scoped. `$.store` persists across sessions |
| Token/usage data | **Exists, partly** | Context fill, rate limits and USD cost come from `$.session.usage()`. Cumulative session tokens have no single getter: they are summed from `turn.complete` usage, from the moment the plugin loaded |
| Git branch | **No dedicated API** | Via `$.process.run` (git) or `.git/HEAD` through `$.fs` |
| `claude plugin validate` / `claude plugin test` | **Exist** | `claude plugin --help` lists `validate` and `test` |
| `akili check` | **Does not exist** | See P5. Read it as `doctor` + `update` |

### Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | When the agent invokes an `/akili-*` command through the Skill tool, it may not raise `command.run`. UNVERIFIED — confirm at source before relying on it | The panel's state comes from disk, so it stays correct and only refreshes later. Optionally also watch `tool.call` on `{ tool: 'Skill' }`. Decide at specify after a probe |
| R2 | The API is early access ("moves between releases", plugin-authoring `reference.md`) | Pin the target build in the README, run `claude plugin validate` in tests when `claude` is on PATH (skip otherwise), and keep the module to verified calls |
| R3 | The observer could block an `/akili-*` command if it threw before `next` | Call `next(e)` first, refresh after, and wrap with `.catch(($, e, next) => next.called ? undefined : next(e))` so it fails open |
| R4 | Existing tests count every source skill dir (`install-cursor` `SKILL_DIR_COUNT`, the "no `akili-*` dir" check, `install-grokbot` `SKILL_NAMES`, `docs-overview`). The name `akili-panel` also collides with the `akili-*` naming of command-skills in shared roots | Filter through `isPluginEntry()` in those tests. The exclusion keeps the name out of shared roots. Budget tests at ~3× the first estimate (KZ-bugfix--init-ctrlc-abort-2) |
| R5 | The engine writes generated types into `<plugin>/.claude-plugin/types/` once it loads a plugin it hot-reloads. In this repo they could get committed, packed into npm, or copied to users | `.gitignore` the folder, exclude it from `package.json` `files`, and make `copyDirectoryContents` skip it. Whether the skills-folder auto-load writes them is UNVERIFIED — confirm at source before relying on it |
| R6 | Dogfooding: every Claude Code session in this repo auto-loads the in-progress plugin, so a broken build affects them | A broken hook is skipped alone, with a dim transcript line (plugin-authoring SKILL.md). Develop with `claude plugin validate` before each save |
| R7 | `$.process.run` for git may need a permission prompt, or may fail where git is missing. UNVERIFIED — confirm at source before relying on it | Fall back to reading `.git/HEAD` with `$.fs` |
| R8 | Running `$.process` / `$.fs` on every redraw is costly | Cache in atoms. Refresh on `session.start`, the observed `command.run`, `turn.complete` and `session.measure`, plus a `$.clock` timer of ≤30 s for edits made outside the session |
| R9 | Tests must not read `docs/specs/<active spec>`: `/akili-archive` moves it (KZ-changes--archify-diagrams-1) | Use fixture spec trees under `test/fixtures/akili-panel/` |
| R10 | Aggregate claims like "every target excludes it" are drawn from one tool (KZ-002) | One install test per target, each asserting the folder is absent |

### Open questions for JC

| # | Question | Proposed default |
|---|---|---|
| Q1 | Exclude for **OpenCode** too? The brief names codex/cursor/antigravity/grokbot only, but OpenCode cannot load Claude Code plugins either | Yes: install for `claude` only |
| Q2 | When several specs are active, which is "the" active one? | 1) the spec in the last observed `/akili-*` args (kept in `$.store` per project); 2) the folder whose slug matches the git branch's last segment; 3) the most recently modified spec. Show `(n more active)` |
| Q3 | What marks **01 Constitution** ✓? This repo has no `docs/prd.md` and no committed `.agents/` | ✓ when root `AGENTS.md`/`CLAUDE.md` exists and at least one of these exists: `docs/prd.md`, `docs/trd/trd.md`, `.agents/leader.md` |
| Q4 | Show a blocked state (`[~]` tasks) beyond ✓/▶/○? | Add `▶ (blocked)` beside the current phase, not a fourth glyph |
| Q5 | Token scope: per session only, or also summed per spec across sessions? | Per session in v1; per-spec totals are a follow-up |
| Q6 | Button language: from what? | `Siguiente` when `$.config`/the locale is Spanish, `Next` otherwise. Or a `userConfig` option `language: en|es` |
| Q7 | Ship the optional root `.claude-plugin/marketplace.json` in this spec? | Yes, it is one small file. Out if you want the installer to be the only channel |

### Dependencies

- Claude Code ≥ 2.1.318 (the build whose types were verified). Older builds may lack the function-hooks plugin API.
- Governance carve-out approval: Skill Governance is a repo rule in `AGENTS.md`.

## Success Criteria

1. `claude plugin validate .claude/skills/akili-panel` reports no refusals, and `claude plugin test .claude/skills/akili-panel` passes against fixture spec trees.
2. `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass.
3. `node bin/akili.js install --tool <t> --dry-run` lists `akili-panel` for `claude` only. Each of `opencode`, `antigravity`, `codex`, `cursor` and `grokbot` has a test that asserts it is absent.
4. `akili doctor --tool all` reports no `MISSING akili-panel` after a clean install. `akili list` shows it under a plugins heading.
5. Manual: `claude --plugin-dir .claude/skills/akili-panel`, then `/akili-panel`, opens the pane. It shows the correct spec, phase marks, branch and token line. **Next** runs the shown command. An `/akili-*` command typed by hand still runs unchanged.
6. `.claude/commands/` is byte-identical before and after. The module registers no command but `akili-panel`, checked by a test over `register.tsx`.

## Decisions After Approval

JC's approval delegated the open questions to the methodology owner («adelante con las decisiones»). The mandate that carried it numbers them `D1`–`D8` below; the proposal's own question IDs are in the second column.

| ID | Proposal question | Decision | Provenance |
|---|---|---|---|
| D1 | — | Proposal **approved** | JC, 2026-11-05 ~19:08 America/Bogota, quote in Document Control |
| D2 | Q1 | **Claude only.** OpenCode is excluded too, with Codex, Cursor, Antigravity and Grok Bot | JC: «solo funciona para claude»; methodology owner confirms the OpenCode exclusion |
| D3 | Q2 | Active spec order: (1) the spec in the last observed `/akili-*` arguments, kept in `$.store` per project; (2) the folder whose slug matches the git branch's last segment; (3) the most recently modified active spec. Show `(n more active)` | Delegated; proposal default adopted |
| D4 | Q3 | **01 Constitution** is ✓ when the files `/akili-constitution` declares as its baseline exist. The set is read from `.claude/commands/akili-constitution.md:46-61` and recorded in `requirements.md` FR-6 | Delegated; the specifying agent picks the file set from the command text |
| D5 | Q4 | Blocked shows as `▶ (blocked)` beside the current phase, not as a fourth glyph | Delegated; proposal default adopted |
| D6 | Q5 | Token figures are **per session** in v1. Per-spec totals across sessions are a follow-up, out of scope | Delegated; proposal default adopted |
| D7 | Q6 | **All UI text in English**: pane title, phase labels, the Next button, empty and error states. No Spanish strings in v1, so no language setting | JC: «en ingles». This replaces the proposal's `Next` / `Siguiente` scope line |
| D8 | Q7 | Root `.claude-plugin/marketplace.json` **is in scope** | Delegated; proposal default adopted |

## Next Step

After JC approves:

```text
/akili-specify changes/akili-panel
```
