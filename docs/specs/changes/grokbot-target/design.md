# Design: Grok Bot install target (`--tool grokbot`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/grokbot-target` |
| Depth | Standard |
| Type | Change · Deliverable: software |
| Approval Mode | `gated` |
| Status | Draft — Phase 2, **amended after Judgment Day rounds 1 and 2** (J-1 … J-20, R-1 … R-9, see `judgment.md`); **Adjust 2026-10-21 (user): Q1 → "box only"** — staging flow removed (DD-12 rewritten, P-14 dropped), info items I-3 … I-6 applied, I-1/I-2/I-7 discarded as staging-only |
| Date | 2026-10-21 |
| Verified at | `f98ad57` (all `bin/akili.js` line numbers; file unchanged since `b5f5160`) |
| Requirements | `requirements.md` FR-1 … FR-8, NFR-1 … NFR-6 |
| Architecturally significant | No — one more data entry in the existing install-target registry; no new module, integration, persistence or topology. `software-architect` and `diagram-design` not loaded |

## 2. Executive Summary

Grokbot is a sixth `TOOL_REGISTRY` entry in the Cursor shape (`commands: []`, commands installed as skills, shared skills root, resources-only detection), plus **one new registry flag, `ownershipRecord`**, set only by grokbot. That flag switches on a per-entry policy at the three write sites (install, update, `doctor --fix`), a FOREIGN state in `doctor`, and grokbot-specific next steps. Every other target's code path and output stay the same. `ALL_TOOLS` keeps its meaning (the `--tool all` set); auto-detection reads a new, wider `DETECTABLE_TOOLS` list. The CLI is supported only when it runs on the box (DD-12); `--grokbot-target` only relocates the install on the box. There is no staging tree and no copy step.

## 3. Architecture Overview

| Layer | Change | Requirement |
|---|---|---|
| Defaults | `defaultPaths.grokbot` = `AKILI_GROKBOT_TARGET` (trimmed, non-blank, `~` expanded) or `/home/box/agent-data/workflows` | FR-2 |
| Arg parsing | New flags `--grokbot-target` (default `defaultPaths.grokbot`) and `--grokbot-resources-target` (no default); `grokbot` added to the `--tool` whitelist and its error text; `--local` base `./.grokbot/workflows`; `forceExplicit` = `--force` given on the `install` command only (DD-6) | FR-1, FR-2, FR-4 |
| Root resolution | Workflows root: `--target <p>` (tool grokbot) → `<p>/workflows`; explicit `--grokbot-target` → it; else the base (local or default). Resources root: explicit `--grokbot-resources-target`, else `dirname(workflows root)/akili` | FR-2 |
| Registry | `TOOL_REGISTRY.grokbot` and `TOOL_ROOT_ARGS.grokbot` (roots: `root` = resources root, `skillsRoot` = workflows root). Header and summary therefore print `<resources root> (skills → <workflows root>)` through the existing `toolTargetLabel` | FR-3 |
| Tool sets | `ALL_TOOLS` unchanged (five). New `DETECTABLE_TOOLS = ALL_TOOLS + grokbot`, used by `detectInstalledTools` and the sibling scan in `isToolInstalled` | FR-1, FR-6 |
| Ownership | Record read (three states, §5), entry classifier on `lstat`, record add-name write (atomic); an invalid record blocks every workflows-root write | FR-4 |
| Install / update | When `ownershipRecord`: classify each skill and command-skill entry before writing; apply the FR-4 table; record each name **before** its entry is written (takeover: move aside, then record, then copy, then delete — DD-11); takeover replaces the entry whole | FR-3, FR-4 |
| Doctor | When `ownershipRecord`: FOREIGN state, `foreign` count, row status INCOMPLETE on `missing + foreign > 0`, grokbot next-step lines with root flags | FR-5 |
| Next steps | Grokbot block in install and update: where Grok Bot reads skills; foreign-skip count and takeover command; a `doctor` hint carrying the run's root flags, replacing the generic grokbot verify hint; no copy, `rsync` or `ssh` step (DD-12) | FR-7 |
| Help / docs | Help lines; README, `docs/cli.md`, CHANGELOG, and every site of the target-count claim family (§9) | FR-8 |

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

Repository: `bin/akili.js` (all code), `test/install-grokbot.test.js` (new), env pinning added to the `test/install-cursor.test.js`, `test/agents-doctor-io.test.js`, `test/agents-doctor.test.js` and `scripts/ci/install-layout-regression.js` spawn helpers (NFR-3, I-3), `README.md`, `docs/cli.md`, `CHANGELOG.md`, `AGENTS.md`, `CONTRIBUTING.md`, `.claude/README.md`.

## 5. Data Model

**Ownership record** — `<resources root>/grokbot-owned.json`, a JSON object with a format `version` (1) and `folders`: a sorted, de-duplicated array of entry **names** (never paths), so the record stays valid if the operator moves both roots together on the box.

| Record state | Reading | Writes allowed |
|---|---|---|
| Absent | Empty set | Yes — created on the first recorded name |
| Present, valid | The set of owned names | Yes |
| Present, unparsable or wrong shape | Empty set, plus a warning naming the file and the recovery: restore it; or run `doctor` to see which same-name entries are other authors', then delete it and run `install --force` knowing every AKILI-named entry is replaced (I-6) | **No** — the record is left byte-identical, and **no run writes anything into the workflows root** while it is invalid: absent entries are not written (they would be unrecordable, so foreign forever) and takeover is refused. Install and update report the block and exit 1; `doctor --fix` fixes nothing there (J-2, R-3) |

**Entry classification** — one AKILI skill or command name against the workflows root, using `lstat` (never `existsSync`, which follows links — J-7):

| State | Condition |
|---|---|
| `absent` | `lstat` finds nothing (a dangling symlink is **not** absent) |
| `owned` | Entry exists and the name is in a valid record |
| `foreign` | Entry exists — directory, plain file, or symlink (live or dangling), with or without a `SKILL.md` — and the name is not in the record (or the record is invalid) |

Classification keys on the entry's existence, not on `SKILL.md`: the current `doctor --fix` writes a skill whenever `<folder>/SKILL.md` is missing (`bin/akili.js:1199-1206`).

**Record writes (J-4, J-16):** for an `absent` entry the name is added to the record **before** the entry is written (intent first): a run that dies mid-entry leaves a partial **owned** entry, which the next `update` (or `install --force`) repairs, instead of an unrecorded entry that would read foreign forever. `doctor --fix` repairs such an entry only when its `SKILL.md` is missing; a partial entry that already has its `SKILL.md` reads OK — accepted limit, `update` is the repair (R-4). The record may therefore list a name whose write failed; it lists every name AKILI wrote **or began writing**. Each add is an atomic rewrite of the whole record. The write is independent of `shouldInclude("resources")` and creates the resources root when needed, so `--skills-only` / `--commands-only` still record. No write under `--dry-run`. `doctor --fix` records the names it restores.

**Takeover (J-1, J-7, R-2; safe takeover, user-approved 2026-10-21):** an explicit `install --force` on a `foreign` entry, with a valid or absent record, runs in this order: (1) **move the entry aside** — `rename` it (the entry itself, never following a link) to a unique name under `<resources root>/.takeover/` (`<name>-<timestamp>`), an atomic step that cannot partly delete anything; (2) record the name; (3) copy AKILI's folder into the now-empty path; (4) remove the moved-aside entry (no-follow). A failure in (1) — including `EXDEV` when the resources root is on another filesystem — stops the run with the error, records nothing, and leaves the foreign entry whole in place. A failure in (2) restores the entry to its original path (rename back) and stops the run; if that restore fails too, the error names the moved-aside path. A failure in (4) is a warning naming the leftover path: the takeover stands, and whatever remains of the foreign data stays in AKILI's own directory, never in the bot-visible workflows root (a recursive delete can fail part-way; amended 2026-10-21, T2b review). No file of the foreign entry remains in the workflows root.

**Accepted limit (J-18):** ownership is by name. If another author deletes AKILI's folder and recreates one with the same name while the record still lists it, `update` overwrites it. Documented in `docs/cli.md`.

## 6. API Design (CLI surface)

| Surface | Contract |
|---|---|
| `--tool grokbot` | Accepted by install, update, doctor; listed in the whitelist error and `--help` |
| `--grokbot-target <dir>` | Workflows root |
| `--grokbot-resources-target <dir>` | Resources root override |
| `AKILI_GROKBOT_TARGET` | Global default for the workflows root (below `--local`, DD-2) |
| `--target <p>` + `--tool grokbot` | Sandbox: `<p>/workflows` + `<p>/akili` |
| Install output | Per-entry lines as today; `skip foreign <path>` for a protected entry; `replace foreign <path>` for a takeover; `blocked (invalid ownership record) <path>` plus the recovery text, and exit 1, while the record is invalid |
| Install next steps | The generic "N existing file(s) were preserved. Re-run with `--force`" line counts only non-foreign skips; a separate grokbot line reports foreign skips and names `akili install --tool grokbot --force` (plus root flags) as the explicit takeover |
| Doctor output | `OK` / `MISSING` / `FOREIGN` per command and skill; grokbot summary row adds `foreign N` and reads INCOMPLETE when `missing + foreign > 0`; other tools' rows unchanged |
| Doctor exit / final line | Exit 1 when `missing + foreign > 0` over all rows; "All checks passed" / "All issues repaired" only when both are 0 |
| Update summary | The `Files:` line appends `(<n> foreign skipped for grokbot)` when `n > 0`; `runInstall` stashes the total on `args.foreignSkipped`, which `runUpdate` reads (R-8) |

## 7. Backend Module Design (`bin/akili.js`)

| Unit | Responsibility |
|---|---|
| `defaultPaths.grokbot` | Env-or-literal default |
| `getArgs` | Two flags; whitelist; `grokbotTarget`, `grokbotResourcesTarget`; `forceExplicit` = `values.force && command === "install"` (so `akili update --force` never takes over — J-13) |
| `runUpdate` | Unchanged: sets `force = true` (`bin/akili.js:1013`) and leaves `forceExplicit` as parsed (false for `update`); `Files:` line gains the foreign count from `args.foreignSkipped` |
| `TOOL_REGISTRY.grokbot` / `TOOL_ROOT_ARGS.grokbot` | Data only; `resources` = `roots.root` |
| `DETECTABLE_TOOLS` | Detection list; `toolFlagFor`, `selectedTools` keep `ALL_TOOLS` |
| Ownership helpers | `readOwnership` (absent / valid / invalid), `classifyEntry` (`lstat`), `recordOwned` (never called while invalid), `removeEntryNoFollow` |
| Copy helper contract (J-15) | `copyDirectoryContents` gains an optional per-entry policy callback (entry name → write / skip-owned / skip-foreign / takeover) and its result gains `foreignSkipped` and the list of written names; without the callback it behaves byte-identically. Command-skills call the same policy before `copySingleFile` |
| `installTool` | When `paths.ownershipRecord`: an invalid record blocks every workflows-root write (resources still install); otherwise pass the policy (FR-4 table, takeover only with `forceExplicit`, order move aside → record → copy → delete moved-aside (DD-11); absent: record → write); result carries `foreignSkipped` and `blocked` |
| `doctorTool` | When `paths.ownershipRecord`: classify before the OK/MISSING check; FOREIGN counted in `foreign`; `--fix` acts only on `absent` and on owned entries missing their `SKILL.md`. While the record is invalid, `--fix` writes nothing in the workflows root and prints `BLOCKED` (never `FIXED`) for each absent entry, which stays counted as MISSING (I-4). Every tool's result carries `foreign` (0 for the other five — J-5) |
| `runDoctor` | Row status, exit and final line use `missing + foreign`; the existing generic `--fix` line keeps its text and counts `missing` only; a grokbot line with the resolved roots names the takeover and the record recovery (J-6) |
| `runInstall` next steps | Grokbot block (FR-7, J-14); the verify hint for grokbot carries root flags when either root is not the default; stashes `foreignSkipped` on `args`; exit 1 when `blocked` |
| `printHelp` | New flag lines and examples; `all` line reads "all five desktop targets (not grokbot)" |

Hints are built from the resolved tool and its roots, never from `args.tool` (`bin/akili.js:1830` uses `args.tool`, which is `claude` on an auto-detected run). The generic line keeps that behavior for the five existing tools (NFR-1); fixing it for them is out of scope.

## 8. Frontend / UX Component Architecture

n/a — CLI only. Output wording is in §6.

## 9. Shared Contracts or Package Extensions

- `package.json` `files` already ships `bin/` and `.claude/`; no new packaged file. `grokbot-owned.json` is created at install time, never shipped. `package.json` `description` names no target count (`package.json:4`) — no edit.
- **Target-count claim family (J-8, R-5)** — swept by claim, not by one string. **The rule is authoritative, the table below is the known starting set:** T5 runs `grep -n -i "codex.*cursor\|cursor.*codex\|\bfive\b" README.md docs/*.md AGENTS.md CONTRIBUTING.md .claude/README.md bin/akili.js` (76 hits at `4f628a9`) and classifies **every** hit as (a) an install-target list or count → add Grok Bot; (b) a `--tool` value list → add `grokbot`; (c) scoped to `--tool all` / the five desktop tools → keep, scope stated; (d) a routing-host list, or unrelated → no edit. The classification table goes into `execution.md`. Known sites:

  | Site | Treatment |
  |---|---|
  | `AGENTS.md:3`, `:7`, `:11`; `README.md:74`; `CONTRIBUTING.md:14`; `.claude/README.md:3` and its target table (`:5-11`) | Add Grok Bot (six targets) |
  | `README.md:192` ("All five paths"), `docs/cli.md:21`, `:23`, `:243` | True for `--tool all`; keep, scoped explicitly to `all` / the five desktop tools |
  | `bin/akili.js:217` help | Reword to "all five desktop targets (not grokbot)" |
  | `README.md:14`, `:43`, `:154`, `:269`, `:273`, `:565`, `:882`; `docs/cli.md:3`, `:42`, `:108`, `:205-219`; `docs/README.md:3`; `docs/flow.md:357` | Classify per the rule — install-target lists gain Grok Bot; routing-host lists unchanged |
  | `README.md:473-474`, `docs/cli.md:605-606` (`--tool` value lists) | Add `grokbot` |
  | `bin/akili.js:559` comment, `:2073` init menu "All five", `:2176` (routing hosts) | Still true — `all` stays five, init excludes grokbot, routing hosts unchanged. No edit |

- Not in scope: `bin/routing.js` hosts, `bin/persona.js`, `.claude/templates/*`, `akili init` menu, `scripts/ci/install-layout-regression.js` `SHIPPING_TARGETS` (only its env pinning changes).

## 10. Design Decisions

| ID | Decision | Rejected alternative | Why | Req |
|---|---|---|---|---|
| DD-1 | Grokbot in the Cursor shape (`commands: []`, `commandsAsSkills`, `sharedSkillsRoot`, `detectByResourcesOnly`) | A new install code path | Reuses install/doctor/update; shared-root guards already skip legacy cleanup and STALE (`:729`, `:1221`) | FR-3, FR-6 |
| DD-2 | `--local` above `AKILI_GROKBOT_TARGET` | Env above `--local` (proposal order) | Same as `CODEX_HOME`/`CURSOR_CONFIG_DIR` (P-1). Accepted shared quirk: an explicit flag equal to the default reads as not given (`:296`, J-10) | FR-2 |
| DD-3 | Resources root = `dirname(workflows root)/akili` unless overridden | Fixed `/home/box/agent-data/akili` | One `--grokbot-target` override on the box relocates both roots together; the default stays the approved sibling | FR-2 |
| DD-4 | `ALL_TOOLS` stays five; new `DETECTABLE_TOOLS` | Add grokbot to `ALL_TOOLS` | `ALL_TOOLS` also defines `--tool all` hints (`:566`). Grokbot in the sibling scan is inert unless a user points it at `~/.agents/skills`; then Codex/Cursor entries read foreign to grokbot — documented, not prevented (J-11) | FR-1, FR-6 |
| DD-5 | Ownership record of entry names in the resources root | (a) content comparison with the packaged source; (b) a marker file inside each skill folder | (a) flags user edits and old AKILI versions as foreign; (b) puts a non-skill file in every bot-visible folder | FR-4 |
| DD-6 | Takeover only with `--force` on `install`; `update` (with or without `--force`) never takes over | Force means force | `update` forces every write (P-5); without the split FR-4's update row cannot hold (J-13) | FR-4 |
| DD-7 | Classify by `lstat` existence, not `SKILL.md` or `existsSync` | Reuse `hasInstalledSkill` | Closes the `doctor --fix` write-into-foreign path (P-6) and the dangling-symlink path (P-13) | FR-4, FR-5 |
| DD-8 | `ownershipRecord` registry flag, set only by grokbot | Apply to Codex/Cursor's shared root too | NFR-1: no behavior change for the five targets | NFR-1 |
| DD-9 | Doctor `foreign` is a separate count; only grokbot rows print it | Fold into `missing` | The generic "run `--fix` to repair N missing" line would be false for foreign; other rows stay byte-identical (Codex baseline fixture) | FR-5, NFR-1 |
| DD-10 | Record name **before** writing an absent entry; for takeover move aside → record → copy → delete; an invalid record is never written and blocks every workflows-root write | Write at end; overwrite an invalid record with the merge; write absent entries unrecorded | End-write loses names on a throw (J-4); merging over an invalid record destroys the owned set (J-2); an unrecordable write is foreign forever, and recording before a failed removal marks a foreign entry owned (R-2, R-3) | FR-4 |
| DD-11 | Takeover replaces the entry whole: move aside (atomic rename into `<resources root>/.takeover/`), record, copy, then remove the moved-aside entry | Merge into the foreign folder | `copyTreeSync` never deletes extra files (P-12), so a merge keeps foreign files inside a folder recorded as owned (J-1) | FR-4 |
| DD-12 | **Box only.** The CLI is supported only when it runs on the box; it prints and runs no copy, `rsync` or `ssh` step, and `--grokbot-target` is an on-box path override, nothing more | Staging tree + precondition-guarded `rsync` (judgment rounds 1–2); `--grokbot-host` | User decision 2026-10-21 (proposal Q1 changed). Removes the whole off-box failure class (J-3, R-1, I-1, I-2): FR-4 is enforced by the same process that writes the entries | FR-7 |

**Reversion challenge (Step 2.3):** no DD removes, disables or inverts shipped behavior for the five existing targets. DD-6 and DD-11 change what `force` does only for the new `ownershipRecord` target. No challenge triggered.

## 11. Premise Ledger

Count: 13 rows — 11 verified, 2 `UNVERIFIED` (2 High, 0 Low).
Blast-radius triggers: `shared-state` (the detection scan reads every tool's registry entry; the doctor summary/exit is shared by all tools), `consumer` (the `--tool` whitelist, `ALL_TOOLS`, the copy-helper return shape and the doctor result shape are read elsewhere). `live-path`: none applies — no branch point beyond the `--tool` value, which P-3/P-5 trace.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | `--local` replaces the env-fed default for every target; `resolveToolTarget` returns `--target`, then an explicit flag, then the base | location | `bin/akili.js:113-139`, `:294-297`, `:363-369` | `f98ad57` | DD-2 order changes (Low) | — |
| P-2 | No existing code, test or doc outside `docs/specs/` names `grokbot` or `AKILI_GROKBOT_TARGET` | existence | `git grep -n -i grokbot -- . ':!docs/specs'` → 0 hits; `grep -o 'AKILI_[A-Z_]*' bin/akili.js` → only `AKILI_SELECT_ABORT` | `f98ad57` | Rename (Low) | — |
| P-3 | `isToolInstalled`'s sibling scan calls `getToolRegistryInfo` for every tool in its list before testing `sharedSkillsRoot`, so every `args` reaching detection must carry grokbot roots. Detection runs only from `resolveTools` when `--tool` is not explicit (`:542-554`); the two `args` producers are `getArgs` (`:299-428`) and `runInteractiveInit` (`:2108`, `toolExplicit: true`, never detects) | shared-state | `bin/akili.js:502-516`, `:532-533`, `:547`; `grep -n 'detectInstalledTools\|isToolInstalled(' bin/akili.js` → `:479`, `:532-533`, `:547` | `f98ad57` | Init would need grokbot roots, or the scan would crash (High) | — |
| P-4 | Consumers of `ALL_TOOLS`: sibling scan `:502`, detection `:533`, `toolFlagFor` `:566`; `selectedTools("all")` is a separate literal `:462`. Tests and scripts that enumerate install targets or run bare-`doctor` detection: `test/install-cursor.test.js` (spawn env pins `HOME`, `USERPROFILE`, `CODEX_HOME`, `CURSOR_CONFIG_DIR`; detection test at `:655-656`), `scripts/ci/install-layout-regression.js:510-536` (detection fixture env), `test/agents-doctor-io.test.js` and `test/agents-doctor.test.js` (`doctor --agents` without `--tool` prints one `Tool root` line per resolved tool via `resolveTools`, `bin/akili.js:1635-1639`; no test asserts that line today), `.github/workflows/ci.yml` (`--tool all`). `test/routing.test.js:34,69,117` and `test/registry-drift.test.js:27,131` pin the **routing host** list, a different set | consumer | `grep -n 'ALL_TOOLS\|selectedTools\|toolFlagFor' bin/akili.js`; `grep -rn '"cursor"' test scripts .github` (non-routing hits listed); `grep -rln 'must be one of: claude' test scripts` → 0 | `f98ad57` | A pinned five-tool list would break; an unpinned grokbot default would leak into detection tests run on the box (Low) | — |
| P-5 | `runUpdate` sets `args.force = true` then calls `runInstall(args)`; `update` runs the code already loaded, so new install rules take effect one version late | location | `bin/akili.js:1013-1014`; comment `:1016-1018` (`:1017`: "the running process still has the old code loaded") | `f98ad57` | DD-6 unneeded (Low) | — |
| P-6 | `doctor --fix` restores a skill by copying into `<root>/<skill>` whenever `<root>/<skill>/SKILL.md` is absent | location | `bin/akili.js:1146-1153` (`hasInstalledSkill`), `:1199-1206` | `f98ad57` | DD-7 unneeded (Low) | — |
| P-7 | Doctor's row status (`missing>0 ? INCOMPLETE : fixed>0 ? REPAIRED : HEALTHY`), exit status, "run `--fix`" next step (built from `args.tool`) and final "All checks passed" line key on `missing` only; `doctorTool` returns `{rootPath, ok, missing, fixed}` | consumer | `bin/akili.js:1302`, `:1812-1837` | `f98ad57` | DD-9 shape changes (Low) | — |
| P-8 | Skip-by-default is per top-level entry for skills and per file for command-skills; both helpers return counts only | location | `bin/akili.js:608-636` (`copySingleFile`, returns at `:633-635`), `:638-676` (`copyDirectoryContents`), `:786-801` | `f98ad57` | Helper contract changes (Low) | — |
| P-9 | On Windows, `/home/box/agent-data/workflows` resolves to a drive-rooted path, so tests compute expectations with `path.resolve`, never a literal | data-env | `node -e 'path.win32.resolve(...)'` on Node v22.12.0 (macOS) → `\home\box\agent-data\workflows`; the property (resolve adds the current drive) is version-invariant | `f98ad57` | Windows CI leg red (Low) | — |
| P-10 | Grok Bot loads skills from `/home/box/agent-data/workflows/<kebab-slug>/SKILL.md` with YAML `name` + `description`, shared by all bots; the directory does not exist yet | data-env | `UNVERIFIED — confirm at source before relying on it` | — | Default path or layout wrong → DD-3 / FR-2 default change (High) | user-stated; NFR-6 live check at the `/akili-validate` HITL pause, owner: the user |
| P-11 | Grok Bot tolerates AKILI's extra frontmatter keys and loads the command-skills | data-env | `UNVERIFIED — confirm at source before relying on it` | — | NFR-2 verbatim copy fails → proposal Option B as a follow-up spec (High) | NFR-6 live check at `/akili-validate`, owner: the user |
| P-12 | `copyTreeSync` merges: it replaces a non-directory squatting at a directory path and writes files, but never deletes extra files already inside a destination directory | location | `bin/akili.js:50-66` | `f98ad57` | DD-11 unneeded (Low) | — |
| P-13 | `hasInstalledSkill` / `hasInstalledCommand` use `fs.existsSync` (follows links: a dangling link reads absent); the copy helpers use `lstatSync` | location | `bin/akili.js:1131-1153`; `:613`, `:652` | `f98ad57` | DD-7 classifier choice changes (Low) | — |

## 12. Budget (Step 2.4)

| Measure | Estimate |
|---|---|
| Tasks | 6 — T1 target, flags, roots, detection, help · T2 ownership record + install/update policy · T2b safe takeover (move aside, then delete) · T3 doctor FOREIGN, summary, exit · T4 next steps (install, update) · T5 docs, claim-family sweep, CHANGELOG |
| LOC | **~1,300 (raised from ~790 by the user on 2026-10-21 after the T2 budget tripwire; see `execution.md`)**; original estimate ~790 (`bin/akili.js` ~240, `test/install-grokbot.test.js` ~450 plus ~10 of env pinning in four existing files, docs ~90). Test LOC budgeted per scenario clause (KZ-bugfix--init-ctrlc-abort-2) |
| Review rounds | 8 (T1–T4 1–2 each; T5 2, per the rules-text guidance) |

The estimate fits Standard depth.

## 13. Kaizen lessons applied

- **KZ-002** — every count in docs and CHANGELOG ("27 skills", "12 commands", "six targets") is checked against HEAD in T5, not written from memory.
- **KZ-changes--kaizen-loop-closure-2** — the target-count sweep (§9) is keyed on the claim family, not on one string.
- **KZ-changes--leader-brief-contract-2** — task falsifiers are run at baseline before the tasks gate.
- **KZ-changes--archify-diagrams-1** — no shipped test reads `docs/specs/changes/grokbot-target/`.
