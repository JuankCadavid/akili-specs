# Proposal: Grok Bot install target (`--tool grokbot`)

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/grokbot-target` |
| Type | Change |
| Deliverable | software |
| Approval Mode | gated |
| Branch | `feat/grokbot-target` → PR into `dev` |
| Depends on | none |
| Parallel-safe | yes — touches `bin/akili.js` install paths, docs and a new test file; no routing or persona code |
| Status | **Approved** 2026-10-21 by the user (Q5 sibling, configurable, confirmed) |
| Date | 2026-10-21 |

## Intent

`akili install --tool grokbot` puts the AKILI skills — and the 12 commands mapped to skills — into the Grok Bot workflows directory, so every Grok Bot on that machine can use the methodology. `update` and `doctor` support the same target.

## Problem / Current Behavior

- The CLI knows exactly five targets. `--tool` accepts `claude, opencode, antigravity, codex, cursor, both, all` and fails on anything else (`bin/akili.js:356-358`); `ALL_TOOLS` and `selectedTools` list the same five (`bin/akili.js:460-466`).
- Each target is a `TOOL_REGISTRY` entry (`bin/akili.js:148-202`) plus a `TOOL_ROOT_ARGS` row (`bin/akili.js:682-688`) plus a `--<tool>-target` flag resolved by `resolveToolTarget` (`bin/akili.js:294-297`, `:405-417`). Codex and Cursor already install commands as skills (`commandsAsSkills: true`) into a shared root, and Cursor detects itself by its resources root only (`detectByResourcesOnly`, `bin/akili.js:194-202`, `:493`).
- Commands are copied verbatim as `<root>/<cmd>/SKILL.md` (`bin/akili.js:791-805`); their frontmatter already has `name` + `description` and every `name` matches its folder/file slug (checked across all 27 skills and 12 commands, `awk` over the frontmatter, 0 mismatches).
- Skills carry fields beyond `name`/`description`: `license` (24), `metadata` (27, nested `author`, `adapted-by`, `adapted-for`, `source`, `binding`), `allowed-tools` (2), and one each of `version`, `displayName`, `category`, `color` (frontmatter key census over `.claude/skills/*/SKILL.md`).
- Skill folder names are generic — `brainstorming`, `tdd`, `kaizen`, `caveman`, … — only the commands are `akili-*` (`ls .claude/skills`). Command bodies name skills by bare name (53 backticked references to nine of them — `tdd`, `kaizen`, `caveman`, … — across `.claude/commands/*.md`, `grep -oE` count).
- Grok Bot layout: skills are folders `<kebab-slug>/SKILL.md` with YAML `name` + `description` under `/home/box/agent-data/workflows/`, on a remote Linux machine, shared by all bots. **UNVERIFIED — confirm at source before relying on it** (stated by the user; no Grok Bot documentation or box access in this session). Whether Grok Bot tolerates extra frontmatter keys, slash-style `/akili-*` references, `$ARGUMENTS`, or subagent spawning is also **UNVERIFIED — confirm at source before relying on it**.

## Proposed Outcome

| Command | Behavior |
|---|---|
| `akili install --tool grokbot` | 27 skills + 12 command-skills land in `<grokbot-target>/<slug>/SKILL.md`; resources (personas, `digests.json`, scripts, `.mcp.json.example`) land outside the workflows dir (Q5) |
| `akili install --tool grokbot --grokbot-target <dir>` / `AKILI_GROKBOT_TARGET=<dir>` | Same, into `<dir>` — also the staging path for a remote box (Q1) |
| `akili doctor --tool grokbot [--fix]` | OK / MISSING per skill and command, and reports a same-name folder that is not AKILI's as a collision (Q3) |
| `akili update` | Refreshes grokbot when it is auto-detected (resources root populated, Cursor rule) |
| `akili install --tool all` | Unchanged — still the five desktop tools (Q2) |

## Scope

- `grokbot` registry entry, `--grokbot-target` flag, `AKILI_GROKBOT_TARGET` env default, `--local` mapping, `--tool` validation and help text.
- Detection by resources root only (reuse `detectByResourcesOnly`), and `sharedSkillsRoot` semantics (no legacy cleanup or STALE scan in a directory shared by every bot).
- Collision handling for generic skill names (Q3) and frontmatter compatibility (Q4).
- `docs/cli.md`, `README.md` install table, `CHANGELOG.md` Unreleased, a `test/install-grokbot.test.js` suite modeled on `test/install-cursor.test.js`.

## Non-Goals

- Built-in SSH/SCP transport from the Mac to the box (see Q1).
- `akili routing` host / model registry entry or agent wrappers for Grok Bot (no Grok Bot model-selection surface is known).
- Rewriting command bodies for Grok Bot semantics (slash syntax, `$ARGUMENTS`, subagents) — commands ship verbatim, as for Codex/Cursor, unless Q6 says otherwise.
- `doctor --agents` / persona deployment changes.

## Affected Users, Systems, And Specs

- Users running AKILI from Grok Bot; maintainers of `bin/akili.js`.
- Related archived specs: `changes/cursor-install-target` (closest precedent: shared skills root, resources-only detection), `changes/codex-install-target`.
- Kaizen: **KZ-002** (aggregate claims in CHANGELOG/docs — quote-check every count such as "27 skills + 12 commands" at HEAD) and **KZ-changes--leader-brief-contract-2** (falsifiers executed, not predicted) apply to the test and docs tasks.

## Visual Reference

- Source: None
- Notes: CLI-only change; no UI surface.

## Requirement Delta Preview

### ADDED Requirements

- `--tool grokbot` installs, updates and doctors the skill set + command-skills into the resolved Grok Bot target.
- Target resolution: `--target` (single tool) > `--grokbot-target` > `AKILI_GROKBOT_TARGET` > `--local` (`./.grokbot/workflows`) > `/home/box/agent-data/workflows`.
- Auto-detection keyed on the grokbot resources root only.
- Collision rule for a pre-existing foreign skill folder with an AKILI skill's name (Q3).

### MODIFIED Requirements

- `--tool` validation and help list six names; `all` keeps its current five-tool meaning (Q2).

### REMOVED Requirements

- None.

## Approach Options

| Option | What | Pros | Cons |
|---|---|---|---|
| **A. Registry entry, verbatim copy** | New `grokbot` row shaped like Cursor (`commandsAsSkills`, `sharedSkillsRoot`, `detectByResourcesOnly`); files copied as-is; run on the box or stage + `rsync` | Smallest diff, reuses every install/doctor/update path; no new transport | Relies on Grok Bot tolerating AKILI frontmatter and generic names coexisting |
| B. A + install-time transform | Same entry, plus frontmatter normalization (strip to `name`/`description`, keep attribution in a body footer) and/or `akili-` prefix with body reference rewrite | Robust if Grok Bot's parser is strict or names collide | New transform code path on every SKILL.md; prefixing rewrites 53+ cross-references in commands alone — a large, error-prone surface |
| C. A + built-in remote install | `--grokbot-host user@box` that stages locally then shells out to `rsync`/`scp` | One command from the Mac | New external-process + credential surface, OS-specific tooling, hard to test in CI; scope grows a lot |

## Recommended Approach

**Option A**, with two guards decided in specify: a collision report in `doctor` (and a `skip existing` on install, the installer default) for foreign same-name folders, and resources placed **beside** the workflows dir (`/home/box/agent-data/akili`) so no non-skill folder appears in the directory every bot scans. Remote installs are "run the CLI on the box" (`npx akili-specs install --tool grokbot`) or "stage with `--grokbot-target ./staging` and `rsync` it" — documented, not built in. Escalate to B only if Q4 shows Grok Bot rejects AKILI frontmatter.

## Risks, Dependencies, And Open Questions

| # | Question | Decision |
|---|---|---|
| Q1 | Remote install: only on the box, also staged-on-Mac + `rsync`, or built-in SSH? | ~~box or staging + rsync~~ → **Changed 2026-10-21 (user): box only** — no staging, no copy step, no SSH; `--grokbot-target` is an on-box path override |
| Q2 | Does `--tool all` include grokbot? | **Answered:** no — `all` stays five tools |
| Q3 | Generic names (`tdd`, `kaizen`, …) in a dir shared by all bots: keep names + collision report, or prefix `akili-`? | **Answered:** keep names; install skips, `doctor` reports collisions |
| Q4 | Does Grok Bot accept extra frontmatter keys (`license`, nested `metadata`, `allowed-tools`)? | **Answered:** unknown — verbatim; live box check at validate; Option B only if it fails |
| Q5 | Resources location: sibling `/home/box/agent-data/akili`, or inside the workflows dir? | Default taken: sibling, overridable via `--grokbot-resources-target` |
| Q6 | Can Grok Bot run the commands as written (file edits, shell/git, subagents)? Install all 12, a subset, or skills only? | **Answered:** all 12, documented as best-effort |

- **Risk:** every Grok Bot fact above is unverified in this session; a live check on the box (`ls /home/box/agent-data/workflows`, one installed skill loaded by a bot) is the validation gate.
- **User context (2026-10-21):** `/home/box/agent-data/workflows/` does not exist on the box yet (no user skills created) — the path is a configurable default, verified at `/akili-validate`; the installer must create it (no collision expected on first install).
- **Risk:** a shared directory means `--force` overwrites a folder another bot owner may rely on — `doctor` must name collisions before anyone forces.

## Success Criteria

- `akili install --tool grokbot --grokbot-target <tmp>` writes 27 + 12 `SKILL.md` folders and the resources, and `akili doctor --tool grokbot --grokbot-target <tmp>` reports 0 MISSING.
- `--tool all` output is byte-identical to today's (if Q2 = no).
- A foreign same-name folder is skipped on install and reported by `doctor`.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green; one live load of an AKILI skill by a Grok Bot on the box.

## Next Step

```text
/akili-specify changes/grokbot-target
```
