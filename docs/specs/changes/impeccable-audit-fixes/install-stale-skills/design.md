# Design: Make `install` and `doctor` tell a stale skill from a current one

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/install-stale-skills` |
| Requirements | `requirements.md` (Phase 1 gate `auto-approved (pre-approved mode)`, 2026-10-31; FR-2 to FR-5 sharpened after judgment-day) |
| Revision | 4: judgment-day rounds 1 and 2 applied, then JC's resolution of the escalation, "Simplify both" (2026-10-31; `judgment.md`) |
| Status | Phase 2 gate: see `judgment.md` |
| Approval Mode | `pre-approved (JC, 2026-10-31)` |
| Verified at | `d5018e3` |
| Deviation from proposal | The proposal's labels `skip identical <path>` / `skip differs <path>` become `skip existing <path> (identical)` / `(differs: …)` (DD-2). The proposal's intent, "every skip reads `identical` or `differs`", holds, and five test assertions plus any user grep keep working |

## 2. Executive Summary

A new pure module, `bin/install-compare.js`, classifies a target entry against its package source. It sits beside `bin/persona.js` and `bin/routing.js`, the other pure modules `bin/akili.js` requires. The installer's three skip sites and the doctor's checks call it at every location the install writes to. Results thread through the existing count objects into the two summaries. No write path changes, the exit code does not change, and a summary row with no differing entries prints exactly as it does today.

## 3. Architecture Overview

| Layer | Change |
|---|---|
| `bin/install-compare.js` (new, pure) | `compareEntry(sourcePath, targetPath)` returns the class and the differing relative paths. `formatDiffers(names)` returns up to 5 names, then `+N more` |
| `bin/akili.js` install | The skip branches of `copySingleFile` and `copyDirectoryContents`, and the command-as-skill non-directory skip. Counts gain `identical` and `differs`. `summaryCounts`, the next-steps line with roots, and a `Home:` line for default global roots |
| `bin/akili.js` doctor | `doctorTool` (commands, skills, resources, `checkOwnedEntry`), with the foreign-`impeccable` exclusion. `runDoctor` adds a conditional `differs` column, a hint outside the exit block, and a closing line |
| `docs/cli.md`, `CHANGELOG.md` | FR-5 (§7.4) |
| Tests | `test/install-compare.test.js` (pure, new); `test/install-stale-skills.test.js` (CLI, new); `test/design-eval-contract-coverage.test.js:56` (pin) |

## 4. Extended Directory Structure

New files: `bin/install-compare.js`, `test/install-compare.test.js` and `test/install-stale-skills.test.js`. `bin/` already ships (P-6).

## 5. Data Model

| Object | Before | After |
|---|---|---|
| `compareEntry` result | — | `{ state: "identical" \| "differs", differing: [sorted relative paths] }`. A wrong-kind target lists the entry's own name |
| Copy results (`copySingleFile`, `copyDirectoryContents`) | `{ installed, overwritten, skipped, … }` | Adds `identical` and `differs`. For non-foreign skips, `skipped = identical + differs` |
| `installTool` result and `runInstall` totals | `skipped` | Add `identical` and `differs`. This covers the direct `skipped += 1` in the command-as-skill branch, which bypasses `add()` |
| `doctorTool` result | `{ ok, missing, fixed, foreign, … }` | Adds `differs`. `ok` counts `identical` entries only |

## 6. API Design

CLI output only:

| Where | Line |
|---|---|
| Install skip | `skip existing <path> (identical)` · `skip existing <path> (differs: <names>)` |
| Install summary, per tool and TOTAL | `installed X \| overwritten Y \| skipped N (identical I, differs D)`. The parenthesis prints only when N > 0 |
| Next steps, D > 0 | `- D existing entr(y\|ies) differ from the package (stale or locally edited): run <update cmd> or <install --force cmd> to replace them.` The line ends: `(with the same --tool, --local and --target flags as this run)`. No flags are rebuilt (DD-9) |
| Next steps, D = 0 and N > 0 | `- N existing entr(y\|ies) already match the package.` |
| Install summary, home-derived root | `Home: <os.homedir()>`, printed once, when `!args.local` and some printed `rootPath` lies under `os.homedir()` (path-prefix check on resolved paths). The root is printed beside it, so an env-overridden root under home is still shown truthfully (P-12) |
| Doctor entry | `DIFFERS <label> (<names>)` |
| Doctor summary row | Today's row, with ` \| differs N` appended only when N > 0 |
| Doctor, D > 0 | A `Next steps:` hint `- N entr(y\|ies) differ from the package: run <update cmd> to replace them (local edits are overwritten).`, printed **outside** the `missing + foreign` block, so `process.exitCode` is untouched. Closing-line precedence: (1) missing or foreign → today's block, exit 1, plus the differs hint; (2) else fixed > 0 → "All issues repaired: …", then `N entr(y\|ies) differ from the package (see above).` when N > 0; (3) else N > 0 → `No missing files. N entr(y\|ies) differ from the package (see above).`; (4) else "All checks passed…", unchanged |

## 7. Backend Module Design

### 7.1 `compareEntry` (FR-1)

- `lstat` the target. The callers ask only about present targets.
- **Source is a file.** The target must be a regular file, not a symlink, and `Buffer.equals` must hold on the full contents. Otherwise the result is `differs`, naming the base name.
- **Source is a directory.** The target must be a real directory, not a symlink. Walk the source recursively. For each regular file, the target file at the same relative path must be a regular file with equal bytes. Each failure adds its relative path, with `/` separators. Extra target files are never visited (FR-1 bullet 3). Source symlinks are skipped: there are none today (`find .claude/skills .claude/commands .claude/templates scripts -type l` → none, run by judge B).
- **Errors.** A read error on the target side counts as `differs` with that path. A source-side error throws: the package is broken, and hiding it would report a false class.
- The relative paths are sorted, so the output is deterministic.

### 7.2 Install (FR-2, FR-4)

| Site | Change |
|---|---|
| `copySingleFile` skip | Classify, print the suffix, and return `identical` or `differs` |
| `copyDirectoryContents` skip (non-foreign, non-takeover) | The same |
| Command-as-skill owned non-directory skip (`installTool`, Grok Bot) | A non-directory where a skill directory belongs is `differs` by construction. Print `(differs: SKILL.md)` and count it under `differs` without calling the comparison |
| `add()`, the direct `skipped += 1`, and the `runInstall` reduce | Thread `identical` and `differs` through |
| `summaryCounts` (per tool and TOTAL) | Append `(identical I, differs D)` when `skipped > 0` |
| Next steps | The D > 0 and D = 0 lines (§6) replace the "preserved" line. Neither prints under `--force`, as today |
| Home line | Printed once after the rows, under the P-12 rule |

`--dry-run` reaches the same skip branches, and classification only reads (NFR-1). `update` forces, so it never reaches a skip branch and prints no class or differs hint. Its Install Summary is the same summary as install, so it gains the `Home:` line under FR-4 like any install summary (P-9; execute-time edit 2026-10-31 after T2 Reviewer advisory).

### 7.3 Doctor (FR-3)

| Site | Change |
|---|---|
| Commands (no ownership record) | Classify every present install location of the command: each raw `commands` dir file, and each `<skills>/<name>/SKILL.md` for a commands-as-skills tool. The result is `DIFFERS` if any location differs; the names are prefixed with the location's index when there is more than one |
| Skills (no ownership record) | Classify `<skills>/<skill>` in every skills dir that holds it (Antigravity has 3). Skip the comparison for an entry that `makeImpeccableForeignPolicy` would treat as foreign: `impeccable/` without `UPSTREAM.md`. It keeps today's `OK` line, with ` (not AKILI's copy; not compared)` appended (P-10) |
| Resources | Classify each `check.dest` against `check.src` |
| `checkOwnedEntry` (Grok Bot) | An owned entry with `SKILL.md` present is classified: a skill against its directory, a command-as-skill entry's `SKILL.md` against the command file. `FOREIGN` is unchanged |
| `runDoctor` | Conditional ` \| differs N` on the row; the hint and the closing line as in §6. `status` and `process.exitCode` are untouched |
| `--fix` | Unchanged: it writes only what is missing, never a `DIFFERS` entry |

### 7.4 Docs (FR-5)

| Site | Change |
|---|---|
| `docs/cli.md:216` (install summary) | Skip classes and the split counts |
| `docs/cli.md:217` (doctor summary) | Add the `differs` count and the `DIFFERS` state |
| `docs/cli.md` Grok Bot ownership table, row "Owned, present" | `OK` / `DIFFERS` |
| `docs/cli.md:413` (exit rule) | `DIFFERS` warns and never fails |
| `docs/cli.md:426` (accepted limits: a partial entry "reads OK") | It now reads `DIFFERS`, naming the missing files |
| `docs/cli.md:431`, `:486` (skip by default) | The classification, plus `--local` as the per-checkout and per-worktree route |
| `CHANGELOG.md:11` | The sentence "A separate change, not yet shipped, will handle the installer item…" is reworded; its pin at `test/design-eval-contract-coverage.test.js:56` moves with it |
| `CHANGELOG.md` `Unreleased` | New entry |

## 8. Frontend / UX Component Architecture

n/a: CLI only.

## 9. Shared Contracts or Package Extensions

`bin/install-compare.js` exports `compareEntry` and `formatDiffers`. The only consumers are `bin/akili.js` and its tests.

## 10. Design Decisions

| ID | Decision | Rejected | Reason |
|---|---|---|---|
| DD-1 | Byte comparison at skip time, in a pure module | A hash manifest (proposal Option B); inline code in `akili.js` | No new on-disk state (NFR-3). Unit-testable without a subprocess, as `persona.js` is |
| DD-2 | Keep the `skip existing ` prefix and append the class | `skip identical` / `skip differs` | Five assertions and users' greps keep working (P-7) |
| DD-3 | Ignore extra target files | Count them | `--force` and `update` do not delete them, so such a `differs` could never clear (P-4) |
| DD-4 | No line-ending normalization | Normalize CRLF | The installer copies bytes unchanged, so an unedited entry is byte-equal on any OS (P-5, which settles P-8). Normalizing would hide a real edit |
| DD-5 | `DIFFERS` warns: exit 0, status unchanged, `--fix` does not overwrite it | Exit 1; `--fix` replaces | JC's Q1. A local edit is legitimate. `--fix` overwriting would bypass `--force` |
| DD-6 | A symlinked target reads `differs` | Follow it | The installer writes real files and removes symlinks on overwrite |
| DD-7 | Only print the doctor `differs` column when N > 0 | Always print it | `test/fixtures/doctor-codex-baseline.txt` is compared byte for byte with a healthy run (P-7) |
| DD-8 | Do not compare a foreign `impeccable/` | Compare it | Neither `install` nor `update` replaces it (`forceExplicit` is install-only), so a `DIFFERS` there could never clear (P-10) |
| DD-9 | Replace hints name the command and tell the user to repeat this run's `--tool`, `--local` and `--target` flags; no flag reconstruction | A `rootArgsFor` builder (rev 3) | JC's decision after the judgment-day escalation: rebuilding flags had three uncovered cases (bare `--target`, the Grok Bot resources root, multi-tool runs; P-11). The plain instruction is correct for every run, and the existing Grok Bot foreign hint (`grokbotCommand`) is unchanged |

**Reversion challenge (Step 2.3).** DD-2 replaces the "preserved … Re-run with --force" line. *What does removing it break?* The `--force` hint survives in the D > 0 line, which is now precise. `grep -rn "were preserved" test/` → 0 hits. `test/install-grokbot.test.js` holds one `doesNotMatch(next, /preserved/)`, and that stays true (judge A, J-6). The old "All checks passed" line is kept for every run without `DIFFERS`, and `test/install-grokbot.test.js:770` pins it for a healthy run. Answer recorded; no change.

## 11. Premise Ledger

Count: 12 rows, all verified.
Blast-radius triggers: `consumer` fires (the skip line, the summary rows and the closing line are parsed by tests and a fixture). `shared-state` fires (the count objects and the doctor exit block are shared across tools). `live-path` does not apply: the only branch point is the tool registry, which P-3 covers.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | The three skip sites are `copySingleFile` (`:968-970`), `copyDirectoryContents` (`:1033-1036`) and the command-as-skill owned non-directory branch (`:1222-1224`) | `location` | `grep -n 'skip existing' bin/akili.js` → `:969`, `:1034`, `:1223` (re-run by both judges) | `d5018e3` | A skip site stays unclassified (High) | — |
| P-2 | Doctor's presence checks are `hasInstalledCommand`, `hasInstalledSkill` (both loop every dir), `checkOwnedEntry`, and the resources `existsSync` | `location` | `bin/akili.js:1594-1615`, `:1642-1665`, `:1804` | `d5018e3` | A doctor site stays presence-only (High) | — |
| P-3 | All six tools reach these sites. Antigravity, Codex, Cursor and Grok Bot set `commandsAsSkills`. Claude Code and OpenCode use a raw `commands` dir. Grok Bot alone sets `ownershipRecord`. Antigravity has 3 commands dirs and 3 skills dirs, and install writes all of them | `shared-state` | `grep -n 'commandsAsSkills: true\|ownershipRecord: true' bin/akili.js` → `:183`, `:191`, `:202`, `:216`, `:219`; `bin/akili.js:166-182` (antigravity arrays); install loops at `:1189-1197`, `:1238-1245`. Count aggregators: `add()`, the direct `skipped += 1` at `:1224`, the `runInstall` reduce (`:1507-1517`), `summaryCounts` (rows and TOTAL) | `d5018e3` | A location or a count misses the split (High) | — |
| P-4 | `--force` merges a directory without deleting extra target files | `existence` | `copyTreeSync` (`bin/akili.js:50-66`) has no removal pass | `d5018e3` | DD-3 changes (High) | — |
| P-5 | The installer writes source bytes unchanged | `existence` | `atomicCopyFileSync` (`bin/akili.js:32-48`); no transform on the install path | `d5018e3` | DD-4 changes (High) | — |
| P-6 | `bin/` ships whole | `data-env` | `require('./package.json').files` includes `"bin"` | `d5018e3` | Packaging change (Low) | — |
| P-7 | These consumers parse the changed output | `consumer` | `grep -rnE "skip existing\|were preserved\|skipped \(\|Install Summary\|All checks passed\|HEALTHY" test/*.js test/fixtures` → `install-cursor.test.js:202` (`skipped (\d+)`), `:281` (split on `\nInstall Summary`), `:297`, `:314`, `:405`, `:563` (`row.skipped` = operation count), `:847-880` (byte-compare with `test/fixtures/doctor-codex-baseline.txt`); `install-impeccable-foreign.test.js:111`, `:125`; `install-grokbot.test.js:561`, `:770-771` (`^HEALTHY\b.*\bforeign 0\b`, the all-clear line), and one `doesNotMatch(/preserved/)`. Docs: `docs/cli.md:216`, `:217`, `:413`, `:426`, `:431`, `:486`, the ownership table row. `README.md` → 0 hits | `d5018e3` | A test or doc breaks unplanned (Low) | Copied into T2–T4 `Consumers` |
| P-8 | An unedited entry is byte-equal on Windows | `data-env` | Settled by P-5: both sides are the same bytes, copied unchanged (both judges) | `d5018e3` | — | — |
| P-9 | `update` never reaches a skip branch, and reads only `foreignSkipped` from the totals | `shared-state` | `bin/akili.js:1479` (reinstalled with `--force`); `runUpdate` reads `args.foreignSkipped` | `d5018e3` | `update` output changes (Low) | — |
| P-11 | `doctorHintFor` carries roots only for Grok Bot; the target flags default to `defaultPaths`, so a non-default value marks an explicit flag | `location` | `bin/akili.js:653-656` (`if (h !== "grokbot") return h;`); `:332-340` (flag defaults); `:410` (the `!== defaultPaths.grokbot` idiom) | `d5018e3` | DD-9 changes (High) | — |
| P-12 | Three default roots can come from env overrides: `CODEX_HOME`, `CURSOR_CONFIG_DIR`, `AKILI_GROKBOT_TARGET` | `data-env` | `bin/akili.js:119-142` | `d5018e3` | The `Home:` line misleads (Low) | — |
| P-10 | `update` never replaces a foreign `impeccable/` | `existence` | `bin/akili.js:433` (`forceExplicit: values.force && command === "install"`); `:891` (`if (!args.forceExplicit) return "foreign"`) | `d5018e3` | DD-8 changes (High) | — |

## 12. Budget (Step 2.4)

| Measure | Estimate |
|---|---|
| Tasks | 4 |
| Authored LOC | ~650: code ~200 (module ~60, install ~60, doctor ~80), tests ~400, docs and CHANGELOG ~50 |
| Review rounds | ~7: 2 each for T1–T3 (code with consumers), 1 for T4 |

Depth: Standard. PR strategy if a PR is opened: PR 1 = T1 + T2 (module + install), PR 2 = T3 + T4 (doctor + docs). Proposed only.
