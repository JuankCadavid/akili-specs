# Design: Grok Bot install target (`--tool grokbot`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/grokbot-target` |
| Depth | Standard |
| Type | Change · Deliverable: software |
| Approval Mode | `gated` |
| Status | Draft — Phase 2 |
| Date | 2026-10-21 |
| Verified at | `6e50d20` (all `bin/akili.js` line numbers) |
| Requirements | `requirements.md` FR-1 … FR-8, NFR-1 … NFR-6 |
| Architecturally significant | No — one more data entry in the existing install-target registry; no new module, integration, persistence or topology. `software-architect` and `diagram-design` not loaded |

## 2. Executive Summary

Grokbot is a sixth `TOOL_REGISTRY` entry in the Cursor shape (`commands: []`, commands installed as skills, shared skills root, resources-only detection), plus **one new registry flag, `ownershipRecord`**, that only grokbot sets. That flag switches on a per-folder policy at the three write sites (install, update, `doctor --fix`) and a FOREIGN state in `doctor`. Every other target's code path stays the same. `ALL_TOOLS` keeps its meaning (the `--tool all` set). Auto-detection reads a new, wider `DETECTABLE_TOOLS` list.

## 3. Architecture Overview

| Layer | Change | Requirement |
|---|---|---|
| Defaults | `defaultPaths.grokbot` = `AKILI_GROKBOT_TARGET` (trimmed, non-blank, `~` expanded) or `/home/box/agent-data/workflows` | FR-2 |
| Arg parsing | New flags `--grokbot-target` (default `defaultPaths.grokbot`) and `--grokbot-resources-target` (no default); `grokbot` added to the `--tool` whitelist and its error text; `--local` base `./.grokbot/workflows` | FR-1, FR-2 |
| Root resolution | Workflows root: `--target <p>` (tool grokbot) → `<p>/workflows`; explicit `--grokbot-target` → it; else the base (local or default). Resources root: explicit `--grokbot-resources-target`, else `dirname(workflows root)/akili` | FR-2 |
| Registry | `TOOL_REGISTRY.grokbot` and `TOOL_ROOT_ARGS.grokbot` (roots: `root` = parent of the workflows root, `skillsRoot` = workflows root, `resourcesRoot` = resources root) | FR-3 |
| Tool sets | `ALL_TOOLS` unchanged (five). New `DETECTABLE_TOOLS = ALL_TOOLS + grokbot`, used by `detectInstalledTools` and the sibling scan in `isToolInstalled` | FR-1, FR-6 |
| Ownership | Read/merge/write helpers for the ownership record; a folder classifier (`absent` / `owned` / `foreign`) | FR-4 |
| Install / update | When `ownershipRecord`: classify each skill and command-skill folder before writing; apply the FR-4 table; after a non-dry run, write the merged record | FR-3, FR-4 |
| Doctor | When `ownershipRecord`: FOREIGN state, a `foreign` count per result, exit 1 on `missing + foreign > 0`, a FOREIGN-specific next step | FR-5 |
| Next steps | Grokbot block: where Grok Bot reads skills; off-default roots → `rsync` lines + a `doctor` hint carrying the same root flags | FR-7 |
| Help / docs | Help lines; README, `docs/cli.md`, CHANGELOG, the four "five install targets" sites | FR-8 |

## 4. Extended Directory Structure

Installed layout on the box (defaults):

| Path | Content |
|---|---|
| `/home/box/agent-data/workflows/<skill>/` | 27 packaged skill folders, copied whole |
| `/home/box/agent-data/workflows/akili-<cmd>/SKILL.md` | 12 command-skills, verbatim |
| `/home/box/agent-data/akili/templates/` | 4 personas + `digests.json` |
| `/home/box/agent-data/akili/scripts/` | `gsc_verify.py`, `parse_tests.js` |
| `/home/box/agent-data/akili/.mcp.json.example` | as for other targets |
| `/home/box/agent-data/akili/grokbot-owned.json` | ownership record (§5) |

Repository: `bin/akili.js` (all code), `test/install-grokbot.test.js` (new), `README.md`, `docs/cli.md`, `CHANGELOG.md`, `AGENTS.md`, `CONTRIBUTING.md`, `.claude/README.md`.

## 5. Data Model

**Ownership record** — `<resources root>/grokbot-owned.json`, JSON object with a format `version` (1) and `folders`: a sorted, de-duplicated array of folder **names** (never paths), so a record staged on the Mac stays valid after `rsync` to the box.

| Record state | Reading |
|---|---|
| Absent | Empty set — every existing same-name folder is foreign |
| Present, valid | The set of owned names |
| Present, unparsable or wrong shape | Empty set, plus a one-line warning naming the file; never a crash |

**Folder classification** (one AKILI skill or command name, against the workflows root):

| State | Condition |
|---|---|
| `absent` | No entry of that name |
| `owned` | Entry exists and the name is in the record |
| `foreign` | Entry exists (directory, file or symlink — with or without a `SKILL.md`) and the name is not in the record |

Classification keys on the **folder's existence**, not on `SKILL.md`: the current `doctor --fix` writes a skill whenever `<folder>/SKILL.md` is missing (`bin/akili.js:1197-1206`), so a foreign folder without a `SKILL.md` would otherwise be written into.

**Record writes:** merge = previous set ∪ names written (installed or overwritten) this run. Folders skipped as owned stay; skipped-foreign are never added. Written atomically with the existing atomic-copy convention. No write under `--dry-run`. `doctor --fix` merges the names it restores.

## 6. API Design (CLI surface)

| Surface | Contract |
|---|---|
| `--tool grokbot` | Accepted by install, update, doctor; listed in the whitelist error and `--help` |
| `--grokbot-target <dir>` | Workflows root |
| `--grokbot-resources-target <dir>` | Resources root override |
| `AKILI_GROKBOT_TARGET` | Global default for the workflows root (below `--local`, per DD-2) |
| `--target <p>` + `--tool grokbot` | Sandbox: `<p>/workflows` + `<p>/akili` |
| Install output | Per-entry lines as today, plus `skip foreign <path>` for a protected folder |
| Doctor output | `OK` / `MISSING` / `FOREIGN` per command and skill; summary row for grokbot adds `foreign N`; other tools' rows unchanged |
| Exit status | doctor: 1 when any tool has `missing + foreign > 0`, else 0 |

## 7. Backend Module Design (`bin/akili.js`)

| Unit | Responsibility |
|---|---|
| `defaultPaths.grokbot` | Env-or-literal default |
| `getArgs` | Two flags; whitelist; `grokbotTarget`, `grokbotResourcesTarget`; `forceExplicit` = the user's `--force` |
| `runUpdate` | Unchanged except that it leaves `forceExplicit` false while setting `force = true` (`bin/akili.js:1013`) |
| `TOOL_REGISTRY.grokbot` / `TOOL_ROOT_ARGS.grokbot` | Data only; `resources` comes from `roots.resourcesRoot` |
| `DETECTABLE_TOOLS` | Detection list; `toolFlagFor`, `selectedTools` keep `ALL_TOOLS` |
| Ownership helpers | Read (tolerant), classify, merge-and-write |
| `installTool` | When `paths.ownershipRecord`: per-folder pre-check before the existing skill and command-skill copies; foreign → skip unless `forceExplicit`; collect written names; write record at the end |
| `doctorTool` | When `paths.ownershipRecord`: classify before the existing OK/MISSING check; FOREIGN counted in a new `foreign` field; `--fix` acts only on `absent` and on owned folders missing their `SKILL.md` |
| `runDoctor` | Exit and next-steps use `missing + foreign`; FOREIGN hint names `akili install --tool grokbot --force` as explicit takeover and "restore `grokbot-owned.json`" for a lost record |
| `runInstall` next steps | Grokbot lines (FR-7) |
| `printHelp` | New flag lines and examples |

## 8. Frontend / UX Component Architecture

n/a — CLI only. Output wording is in §6.

## 9. Shared Contracts or Package Extensions

- `package.json` `files` already ships `bin/` and `.claude/`; no new packaged file. `grokbot-owned.json` is created at install time, never shipped.
- Not in scope: `bin/routing.js` hosts, `bin/persona.js`, `.claude/templates/*`, `scripts/ci/install-layout-regression.js` (`SHIPPING_TARGETS` stays the three published targets).

## 10. Design Decisions

| ID | Decision | Rejected alternative | Why | Req |
|---|---|---|---|---|
| DD-1 | Grokbot in the Cursor shape (`commands: []`, `commandsAsSkills`, `sharedSkillsRoot`, `detectByResourcesOnly`) | A new install code path | Reuses install/doctor/update; shared-root guards already skip legacy cleanup and STALE (`:729`, `:1221`) | FR-3, FR-6 |
| DD-2 | `--local` above `AKILI_GROKBOT_TARGET` | Env above `--local` (proposal order) | Same as `CODEX_HOME`/`CURSOR_CONFIG_DIR` (P-1); one rule for all six targets | FR-2 |
| DD-3 | Resources root = `dirname(workflows root)/akili` unless overridden | Fixed `/home/box/agent-data/akili` | A staged tree is one directory; default stays the approved sibling | FR-2, FR-7 |
| DD-4 | `ALL_TOOLS` stays five; new `DETECTABLE_TOOLS` | Add grokbot to `ALL_TOOLS` | `ALL_TOOLS` also defines `--tool all` hints (`:566`); detection needs the wider list (P-3, P-4) | FR-1, FR-6 |
| DD-5 | Ownership record of folder names in the resources root | (a) content comparison with the packaged source; (b) a marker file inside each skill folder | (a) flags user edits and old AKILI versions as foreign; (b) puts a non-skill file in every bot-visible folder. A name list in AKILI's own directory survives `rsync` and touches nothing shared | FR-4 |
| DD-6 | Foreign takeover requires the user's own `--force`; `update`'s implied force never takes over | Force means force | `update` forces every write (P-5); without the split, FR-4's update row cannot hold | FR-4 |
| DD-7 | Classify by folder existence, not `SKILL.md` | Reuse `hasInstalledSkill` | Closes the `doctor --fix` write-into-foreign path (P-6) | FR-4, FR-5 |
| DD-8 | `ownershipRecord` registry flag, set only by grokbot | Apply to Codex/Cursor's shared root too | NFR-1: no behavior change for the five targets. Extending is a later spec | NFR-1 |
| DD-9 | Doctor `foreign` is a separate count; only grokbot rows print it | Fold into `missing` | The existing "run `--fix` to repair N missing" line would be false for foreign; other rows stay byte-identical (Codex baseline fixture) | FR-5, NFR-1 |
| DD-10 | No transport: print `rsync` lines and a flag-carrying `doctor` hint | `--grokbot-host` | Proposal Q1 | FR-7 |

**Reversion challenge (Step 2.3):** no DD removes, disables or inverts shipped behavior. DD-6 narrows what `force` does, but only for the new `ownershipRecord` target; for the five existing targets `update` still overwrites everything. No challenge triggered.

## 11. Premise Ledger

Count: 11 rows — 9 verified, 2 `UNVERIFIED` (2 High, 0 Low).
Blast-radius triggers: `shared-state` (the detection scan reads every tool's registry entry), `consumer` (the `--tool` whitelist, `ALL_TOOLS` and the doctor summary/exit contract are read elsewhere). `live-path`: none applies — no branch point beyond the `--tool` value, which P-3/P-5 trace.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | `--local` replaces the env-fed default for every target; `resolveToolTarget` returns `--target`, then an explicit flag, then the base | location | `bin/akili.js:113-139`, `:294-297`, `:363-369` | `6e50d20` | DD-2 order changes (Low) | — |
| P-2 | No existing CLI env var or flag named `AKILI_GROKBOT_TARGET` / `grokbot` | existence | `grep -rn -i 'AKILI_GROKBOT\|grokbot' . --exclude-dir=docs` (excluding `.git`, `node_modules`) → 0 code hits; `grep -o 'AKILI_[A-Z_]*' bin/akili.js` → only `AKILI_SELECT_ABORT` | `6e50d20` | Rename (Low) | — |
| P-3 | `isToolInstalled`'s sibling scan calls `getToolRegistryInfo` for every tool in its list before testing `sharedSkillsRoot`, so every `args` reaching detection must carry grokbot roots. Detection runs only from `resolveTools` when `--tool` is not explicit (`:542-554`); the two `args` producers are `getArgs` (`:299-428`) and `runInteractiveInit` (`:2108`, `toolExplicit: true`, never detects) | shared-state | `bin/akili.js:502-516`, `:532-533`, `:547`; `grep -n 'detectInstalledTools\|isToolInstalled(' bin/akili.js` → `:479`, `:532-533`, `:547` | `6e50d20` | Init would need grokbot roots, or the scan would crash (High) | — |
| P-4 | Consumers of `ALL_TOOLS`: sibling scan `:502`, detection `:533`, `toolFlagFor` `:566`; `selectedTools("all")` is a separate literal `:462`. Tests and scripts that enumerate the install-target set: `test/install-cursor.test.js` (cursor-only cases), `scripts/ci/install-layout-regression.js` (`SHIPPING_TARGETS`, detection fixture), `.github/workflows/ci.yml` (`--tool all`); `test/routing.test.js:34,69,117` and `test/registry-drift.test.js:27,131` pin the **routing host** list, a different set | consumer | `grep -n 'ALL_TOOLS\|selectedTools\|toolFlagFor' bin/akili.js`; `grep -rn '"cursor"' test scripts .github` (non-routing hits listed); `grep -rln 'must be one of: claude' test scripts` → 0 | `6e50d20` | A pinned five-tool list would break (Low) | — |
| P-5 | `runUpdate` sets `args.force = true` then calls `runInstall(args)` | location | `bin/akili.js:1013-1014` | `6e50d20` | DD-6 unneeded (Low) | — |
| P-6 | `doctor --fix` restores a skill by copying into `<root>/<skill>` whenever `<root>/<skill>/SKILL.md` is absent | location | `bin/akili.js:1146-1153` (`hasInstalledSkill`), `:1199-1206` | `6e50d20` | DD-7 unneeded (Low) | — |
| P-7 | Doctor's exit status and "run `--fix`" next step key on `missing` only | consumer | `bin/akili.js:1812-1832` (`missingTotal`, `process.exitCode = 1`) | `6e50d20` | DD-9 shape changes (Low) | — |
| P-8 | Skip-by-default is per top-level entry for skills and per file for command-skills | location | `bin/akili.js:608-621` (`copySingleFile`), `:638-664` (`copyDirectoryContents`), `:786-801` | `6e50d20` | Pre-check placement changes (Low) | — |
| P-9 | On Windows, `/home/box/agent-data/workflows` resolves to a drive-rooted path, so tests compute expectations with `path.resolve`, never a literal | data-env | `node -e 'path.win32.resolve(...)'` on Node v22.12.0 (macOS) → `\home\box\agent-data\workflows`; the property (resolve adds the current drive) is version-invariant | `6e50d20` | Windows CI leg red (Low) | — |
| P-10 | Grok Bot loads skills from `/home/box/agent-data/workflows/<kebab-slug>/SKILL.md` with YAML `name` + `description`, shared by all bots; the directory does not exist yet | data-env | `UNVERIFIED — confirm at source before relying on it` | — | Default path or layout wrong → DD-3 / FR-2 default change (High) | user-stated; NFR-6 live check at the `/akili-validate` HITL pause, owner: the user |
| P-11 | Grok Bot tolerates AKILI's extra frontmatter keys and loads the command-skills | data-env | `UNVERIFIED — confirm at source before relying on it` | — | NFR-2 verbatim copy fails → proposal Option B as a follow-up spec (High) | NFR-6 live check at `/akili-validate`, owner: the user |

## 12. Budget (Step 2.4)

| Measure | Estimate |
|---|---|
| Tasks | 5 |
| LOC | ~720 (`bin/akili.js` ~180, `test/install-grokbot.test.js` ~450 — test LOC budgeted per scenario clause (KZ-bugfix--init-ctrlc-abort-2), docs ~90) |
| Review rounds | 8 (code tasks 1–2 each; docs task 2, per the rules-text guidance) |

The estimate fits Standard depth.

## 13. Kaizen lessons applied

- **KZ-002** — every count in docs and CHANGELOG ("27 skills", "12 commands", "six targets") is checked against HEAD in the docs task, not written from memory.
- **KZ-changes--kaizen-loop-closure-2** — the "five install targets" sweep is keyed on the claim (count words, "all five", "five tools/hosts"), not on one string.
- **KZ-changes--leader-brief-contract-2** — task falsifiers are run at baseline before the tasks gate.
- **KZ-changes--archify-diagrams-1** — no shipped test reads `docs/specs/changes/grokbot-target/`.
