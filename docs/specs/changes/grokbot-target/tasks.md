# Tasks: Grok Bot install target (`--tool grokbot`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/grokbot-target` |
| Depth | Standard |
| Type | Change · Deliverable: software |
| Approval Mode | `gated`. The user asked up front to continue from `tasks.md` straight into `/akili-execute` (2026-10-21, "sigue a tasks.md y a /akili-execute"); the tasks gate is logged as **approved in advance by the user** |
| Status | Phase 3 |
| Date | 2026-10-21 |
| Budget (design §12) | 5 tasks · ~790 LOC (`bin/akili.js` ~240, tests ~460, docs ~90) · 8 review rounds |
| Design review | Judgment Day: **APPROVED** after two rounds, followed by a user Adjust to Q1 "box only" (`judgment.md`) |
| Commit prefix | `[SPEC:changes/grokbot-target]` |
| Format precedent | `docs/specs/archive/2026-10-01-changes--cursor-install-target/tasks.md` |

## 2. Task Graph

```
T1 (target, flags, roots, registry, detection, help, env pins)
  └─→ T2 (ownership record + install/update policy)
        └─→ T3 (doctor FOREIGN / BLOCKED / summary / exit)
              └─→ T4 (next steps: install + update)
                    └─→ T5 (docs, claim-family sweep, CHANGELOG)
```

The tasks run in a strict sequence because all four code tasks edit `bin/akili.js` and `test/install-grokbot.test.js`. No cycles.

**Environment masking (every task that runs the CLI).** Spawn with `HOME`, `USERPROFILE`, `CODEX_HOME`, `CURSOR_CONFIG_DIR` and **`AKILI_GROKBOT_TARGET`** pinned to scratch paths. Pass the grokbot roots explicitly (`--grokbot-target`/`--target`). Never write under `/home/box`. A run that created anything under the real `/home/box/agent-data` or `~/.agents/skills` invalidates the evidence (check with `find <root> -newer <marker>`).

**Concurrency.** No `npm test`, `install --tool all` or doctor measurement runs while an Implementer is active (AGENTS.md).

**Not automatable (all tasks).** Two things have no automated check here:
- `akili update` itself, because it runs a real package-manager install (`test/install-cursor.test.js:44-57`). Its no-takeover rule is checked by the Reviewer reading the code (the `forceExplicit` data flow) and by hand on the box at `/akili-validate`.
- Whether Grok Bot loads the files (P-10, P-11). This is the NFR-6 live check at `/akili-validate`, owned by the user.

**`skip-eligible` tasks: none.** Every task gets a Reviewer.

---

## 3. Tasks

### T1 — Target, flags, roots, registry, detection, help

| Field | Value |
|---|---|
| Status | [ ] |
| Size | M (~90 LOC in `bin/akili.js`, ~150 LOC of tests, ~10 LOC of env pins) |
| Depends on | — |
| Requirements | FR-1 (both scenarios), FR-2 (all scenarios), FR-3 *First install on an empty box* except the record clause, FR-3 *Shared directory hygiene*, FR-6 (both scenarios), NFR-1, NFR-2, NFR-3 |
| Design | §3 rows Defaults, Arg parsing, Root resolution, Registry, Tool sets; §7 `defaultPaths.grokbot`, `getArgs`, `TOOL_REGISTRY.grokbot`/`TOOL_ROOT_ARGS.grokbot`, `DETECTABLE_TOOLS`, `printHelp`; DD-1 … DD-4, DD-8; P-1, P-3, P-4, P-9 |
| Skills | `tdd` |
| Review | `full` — new CLI surface and detection; the five existing targets must stay byte-identical |

**Scope**
- `defaultPaths.grokbot`: `AKILI_GROKBOT_TARGET` (trimmed, non-blank, `~` expanded), else `/home/box/agent-data/workflows`.
- Flags `--grokbot-target` and `--grokbot-resources-target`; `grokbot` in the `--tool` whitelist and its error text; `--local` base `./.grokbot/workflows`; `--target` with `--tool grokbot` gives `<p>/workflows` + `<p>/akili`; resources default `dirname(workflows)/akili`; `forceExplicit` = `--force` given on the `install` command only (consumed in T2).
- Registry entry: Cursor shape plus `ownershipRecord: true`. `TOOL_ROOT_ARGS.grokbot` → `{ root: resources, skillsRoot: workflows }`, with `resources` = `roots.root`.
- `DETECTABLE_TOOLS`, used by `detectInstalledTools` and the sibling scan. `ALL_TOOLS`, `selectedTools("all")` and `toolFlagFor` stay unchanged.
- Help: flag lines, examples, and `all` reworded to "all five desktop targets (not grokbot)".
- Add the `AKILI_GROKBOT_TARGET` scratch pin to the spawn env in `test/install-cursor.test.js`, `test/agents-doctor-io.test.js`, `test/agents-doctor.test.js` and `scripts/ci/install-layout-regression.js`.
- New `test/install-grokbot.test.js`, using the `install-cursor` subprocess pattern, covering:
  - the whitelist and error text;
  - each FR-2 precedence row, with a blank env var;
  - `--tool all --dry-run` acting on exactly the five tools, with hint `akili doctor --tool all`;
  - first install into a non-existent root: one folder per skill and command, every file byte-identical to its source, nothing but skill/command folders inside the workflows root, and nothing written outside the two roots (file listing of the scratch tree);
  - a pre-existing unrelated folder left byte-identical, with no legacy cleanup or STALE run;
  - detection positive (populated resources root), detection negative (none), and a workflows root without a resources root not detected.

**Verification:** `node --test test/install-grokbot.test.js test/install-cursor.test.js test/agents-doctor-io.test.js test/agents-doctor.test.js`; `node scripts/ci/install-layout-regression.js`; `node bin/akili.js install --tool all --dry-run` (tool list and hint unchanged); `git diff --check`.

| Verification field | Value |
|---|---|
| Falsifier | (1) Swap `--local` and env precedence → the precedence test asserting `./.grokbot/workflows` goes red. (2) Remove `grokbot` from `DETECTABLE_TOOLS` → the detection-positive test goes red. (3) Add `grokbot` to `ALL_TOOLS` → the `--tool all` test goes red (six tools, and the hint changes). Each is executed on the post-change code and its red quoted. |
| Red run | Baseline at `270916f`: `node bin/akili.js install --tool grokbot --dry-run` printed `ERROR: --tool must be one of: claude, opencode, antigravity, codex, cursor, both, all`, exit 1. `node bin/akili.js install --grokbot-target /tmp/x --dry-run` printed `ERROR: Unknown option '--grokbot-target'…`. The new suite must fail on its whitelist assertion at baseline, not on setup. |
| Disqualifier | Any test expectation written as a literal `/home/box/...` instead of `path.resolve(...)` (P-9: Windows adds a drive). Any spawn without the `AKILI_GROKBOT_TARGET` pin. A byte-identity check that normalizes line endings or reads through a string transform. |
| Consumers | Existing tests and scripts listed in P-4 (`test/install-cursor.test.js`, `test/agents-doctor-io.test.js`, `test/agents-doctor.test.js`, `scripts/ci/install-layout-regression.js`, `.github/workflows/ci.yml` `--tool all` steps); `test/fixtures/doctor-codex-baseline.txt` must still match. |

**Done when:** all four falsifiers have been executed and observed red, and the existing suite and the Codex baseline are unchanged and green.

---

### T2 — Ownership record and install/update policy

| Field | Value |
|---|---|
| Status | [ ] |
| Size | L (~90 LOC in `bin/akili.js`, ~170 LOC of tests) |
| Depends on | T1 |
| Requirements | FR-3 *First install* (the record clause), FR-3 *Dry run and partial installs*, FR-4 (table rows for install, install `--force` and update; scenarios *Foreign `tdd` survives update*, *Explicit takeover*, *Ownership record missing or unreadable* for install/update, *Interrupted install*; the invalid-record footnote), NFR-4 |
| Design | §5 entirely, §6 Install output, §7 copy-helper contract, `installTool`, `runUpdate`; DD-5, DD-6, DD-7, DD-10, DD-11; P-5, P-6, P-8, P-12, P-13 |
| Skills | `tdd` |
| Review | `full` — data safety in a shared directory |

**Scope**
- Ownership helpers: read with three states (absent, valid, invalid with a warning), an `lstat` classifier, an atomic add-name write, and no-follow removal.
- Optional per-entry policy callback for `copyDirectoryContents`. Its result gains `foreignSkipped` and the names written. Without the callback, behavior is byte-identical. Command-skills run the same policy before `copySingleFile`.
- `installTool` with `ownershipRecord`:
  - **absent:** record, then write;
  - **owned:** skip, or overwrite under `force`;
  - **foreign:** skip and label it, or with `forceExplicit` remove, then record, then copy;
  - **invalid record:** no workflows-root writes, `blocked` lines plus recovery text, exit 1, resources still installed.
- The record write is independent of `shouldInclude("resources")`, and nothing is written under `--dry-run`.
- `runInstall` stashes `args.foreignSkipped` (T4 consumes it).
- Tests:
  - the record exists and lists every name after the first install;
  - `--dry-run` writes no record;
  - `--skills-only` / `--commands-only` record only their own set, and the record is created even though resources are skipped;
  - a foreign `tdd` (directory) stays byte-identical after a plain install and is not recorded;
  - a foreign dangling symlink and a foreign plain file named like a command are both classified foreign and left untouched;
  - `install --force` takeover leaves no foreign file behind (`notes.md` is gone), removes a foreign symlink without touching its target, and records the name;
  - an invalid record leaves the record byte-identical, writes nothing into the workflows root, and exits 1;
  - *Interrupted* (Unix, non-root; skipped with a printed reason otherwise): a workflows root made read-only after creation gives EACCES, after which the record lists the name begun and that name is not foreign;
  - a takeover whose removal fails (a foreign subdirectory chmod 0555 with a file inside) records nothing for that name.

**Verification:** `node --test test/install-grokbot.test.js`, plus T1's command set again (NFR-1).

| Verification field | Value |
|---|---|
| Falsifier | (1) Classify with `existsSync` instead of `lstat` → the dangling-symlink test goes red (the entry is overwritten). (2) Merge on takeover instead of remove-first → `notes.md` survives and the test goes red. (3) Record before removal in takeover → the failed-removal test sees `tdd` in the record and goes red. (4) Write the record while it is invalid → the byte-identity assertion goes red. (5) Treat `force` as `forceExplicit` → no CLI test can see this, because `update` cannot be spawned safely. **Gap:** the Reviewer traces `forceExplicit` from `getArgs` to the policy, and the box check at `/akili-validate` covers the behavior. |
| Red run | At T1's HEAD (registry present, no policy), the foreign-`tdd` test must go red on its byte-identity assertion, and the record-exists test on its existence assertion. A red from a missing directory or a spawn error does not count. |
| Disqualifier | A permission-based test that "passes" when running as root (chmod has no effect) is not evidence; the test must detect root and skip with a printed reason. A foreign-folder assertion that compares only `SKILL.md`: every file in the fixture must be compared. |
| Consumers | `copyDirectoryContents` / `copySingleFile` callers in `bin/akili.js` (`installTool`, `doctorTool --fix`) must stay byte-identical without the callback. Covered by T1's existing-suite run and the Codex baseline. |

**Done when:** falsifiers 1–4 have been executed and observed red, and gap 5 is recorded in `execution.md`.

---

### T3 — Doctor: FOREIGN, BLOCKED, summary and exit

| Field | Value |
|---|---|
| Status | [ ] |
| Size | M (~40 LOC in `bin/akili.js`, ~80 LOC of tests) |
| Depends on | T2 |
| Requirements | FR-4 (doctor and doctor `--fix` columns, the invalid-record footnote for doctor, and the *Ownership record missing or unreadable* scenario for doctor), FR-5 (both scenarios), NFR-1 |
| Design | §5 classification, §6 Doctor output / exit, §7 `doctorTool`, `runDoctor`; DD-7, DD-9; P-6, P-7 |
| Skills | `tdd` |
| Review | `full` — changes the shared doctor summary and exit contract |

**Scope**
- `doctorTool` with `ownershipRecord`: classify each entry before the OK/MISSING check, and count FOREIGN in a new `foreign` field.
- `--fix` repairs only absent entries and owned entries whose `SKILL.md` is missing, and records what it repairs.
- While the record is invalid: no writes, and each absent entry prints `BLOCKED` (never `FIXED`) and stays MISSING.
- Every tool's result carries `foreign`, which is 0 for the other five.
- `runDoctor` changes:
  - the grokbot row adds `foreign N` and reads INCOMPLETE when `missing + foreign > 0`;
  - exit status and the final line use `missing + foreign`;
  - the generic `--fix` line keeps its text and counts `missing` only;
  - a grokbot line names `akili install --tool grokbot [root flags] --force` as the takeover, plus the record-recovery text.
- Tests:
  - a healthy install gives all OK and exit 0, and no environment binary row applies to grokbot;
  - a foreign folder gives FOREIGN, an INCOMPLETE row, no "All checks passed", exit 1, a takeover hint carrying the run's `--grokbot-target`, and `--fix` leaves the folder byte-identical;
  - an owned entry with `SKILL.md` deleted gives MISSING, and `--fix` restores it;
  - an invalid record gives FOREIGN for the existing AKILI folders, `--fix` prints BLOCKED for an absent entry and never FIXED, and nothing is written;
  - `doctor --tool codex` output still matches `test/fixtures/doctor-codex-baseline.txt`.

**Verification:** `node --test test/install-grokbot.test.js test/install-cursor.test.js`, `node bin/akili.js doctor --tool all` (in a scratch HOME).

| Verification field | Value |
|---|---|
| Falsifier | (1) Leave the row status keyed on `missing` only → the foreign test's INCOMPLETE assertion goes red. (2) Have `--fix` call the existing copy for a foreign entry → the byte-identity assertion goes red. (3) Print `foreign` on every row → the Codex baseline test goes red. (4) Print `FIXED` under an invalid record → the BLOCKED assertion goes red. |
| Red run | At T2's HEAD, the foreign test must go red on the `FOREIGN` assertion (doctor prints `OK`, because `SKILL.md` exists). |
| Disqualifier | An exit-code assertion read from a spawn that crashed with a stack trace. Assert that stderr has no `TypeError`/`ReferenceError` and that the summary line was printed. |
| Consumers | `runDoctor` summary/exit used by every tool; `test/fixtures/doctor-codex-baseline.txt`; `test/install-cursor.test.js` doctor tests; `doctor --agents` (`bin/akili.js:1635-1639`, prints only the tool roots). |

**Done when:** all four falsifiers have been executed and observed red, and the Codex baseline is unchanged.

---

### T4 — Next steps: install and update

| Field | Value |
|---|---|
| Status | [ ] |
| Size | S (~20 LOC in `bin/akili.js`, ~50 LOC of tests) |
| Depends on | T3 |
| Requirements | FR-7 (*Install with an override*, including its BUT clause), FR-4 *Foreign `tdd` survives update* ("both runs say `tdd` was skipped as foreign"; the update half is gapped per §2), NFR-1 |
| Design | §6 Install next steps, Update summary; §7 `runInstall` next steps, `runUpdate`; DD-12; J-14 |
| Skills | — |
| Review | `checklist` — output wording on a contract already fixed by T2/T3 |

**Scope**
- Grokbot next-steps block, printed only for non-dry-run grokbot:
  - the directory Grok Bot reads;
  - the foreign-skip count and the takeover command with the run's root flags;
  - a `doctor` hint with root flags in place of the generic `akili doctor --tool grokbot`, when either root is not the default.
- The generic "N existing file(s) were preserved" line counts non-foreign skips only.
- The `runUpdate` `Files:` line appends `(<n> foreign skipped for grokbot)` from `args.foreignSkipped`.
- No copy, `rsync` or `ssh` text anywhere.
- Tests:
  - an override install with one foreign folder: the exact lines from the FR-7 scenario, and none of `rsync`, `ssh` or `scp` in stdout;
  - a default-root dry run prints no grokbot next-steps block;
  - `--tool all --dry-run` next steps unchanged.

**Verification:** `node --test test/install-grokbot.test.js`; `grep -n "rsync\|ssh " bin/akili.js` → 0 hits.

| Verification field | Value |
|---|---|
| Falsifier | (1) Count foreign skips in the generic "preserved" total → the test asserting that line is absent when the only skip is foreign goes red. (2) Print the generic `akili doctor --tool grokbot` → the flagged-hint assertion goes red. |
| Red run | At T3's HEAD, the FR-7 test must go red on its "Grok Bot reads skills from" assertion. |
| Disqualifier | A regex that matches the hint with or without the root flags. Assert the full flagged command string. |
| Consumers | `verifyHints` / `toolFlagFor` users (`runInstall`, `runUpdate`); `test/install-cursor.test.js` next-steps assertions (if any: grep `Next steps` in that file before editing). |

**Done when:** both falsifiers have been executed and observed red, and the `update` half is recorded as a gap in `execution.md`.

---

### T5 — Documentation, claim-family sweep, CHANGELOG

| Field | Value |
|---|---|
| Status | [ ] |
| Size | M (~90 LOC of prose) |
| Depends on | T4 |
| Requirements | FR-8 (statement + *Count claims* scenario) |
| Design | §9 claim-family rule and known sites; §6 surface; DD-12 (box only) |
| Skills | `cognitive-doc-design` |
| Review | `full` — `AGENTS.md` and `CONTRIBUTING.md` are read by agents; KZ-002 and KZ-changes--kaizen-loop-closure-2 apply |

**Scope**
- Document the grokbot target in `README.md` (target table and `--tool` value list) and `docs/cli.md` (flags, roots and precedence, foreign rule, invalid-record recovery with `doctor` first, accepted limits J-18 and the `doctor --fix` partial-entry limit, box-only operation, exclusion from `all`, commands installed verbatim and best-effort).
- `CHANGELOG.md` Unreleased entry (minor).
- Run the §9 grep: `grep -n -i "codex.*cursor\|cursor.*codex\|\bfive\b" README.md docs/*.md AGENTS.md CONTRIBUTING.md .claude/README.md bin/akili.js`. Classify **every** hit (a)–(d) in a table in `execution.md`, then apply the treatment.
- Quote-check every count the new text states (27 skills, 12 commands, six targets) against HEAD.

**Verification:** re-run the §9 grep after the edits; every hit carries a classification and no class-(a)/(b) hit is missing Grok Bot. Run `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check`, `node bin/akili.js install --tool all --dry-run` and `node bin/akili.js doctor --tool all` (scratch HOME). Read every CHANGELOG clause against the shipped code at HEAD.

| Verification field | Value |
|---|---|
| Falsifier | The baseline grep ran at `4f628a9` and returned 76 hits (§9). After the edit, a class-(a) site left as "five" fails the sweep; e.g. `AGENTS.md:7` ("canonical source for all five install targets") must change. |
| Red run | At baseline, `grep -c "grokbot\|Grok Bot" README.md docs/cli.md AGENTS.md` → 0 per file. |
| Disqualifier | A sweep that greps only the literal "five install targets". A CHANGELOG count copied from this spec rather than counted at HEAD (KZ-002). |
| Consumers | Every file in the §9 grep scope; `docs/README.md`, `docs/flow.md` (class-(d) candidates). |

**Done when:** the classification table is in `execution.md`, the full verification set is green, and no CHANGELOG clause overstates the shipped text.

---

## 4. Coverage (scenario and clause level)

| Requirement clause | Task |
|---|---|
| FR-1 *Valid selection* (accept, error lists grokbot) | T1 |
| FR-1 *`all` and `both` unchanged*, BUT not grokbot, MUST print `--tool all` hint | T1 |
| FR-2 *Default* | T1 (dry-run planned paths via `path.resolve`) |
| FR-2 *Override on the box*, MUST NOT write outside the two roots | T1 |
| FR-2 *Env var, `--local`, `--target`, explicit resources*, BUT blank env | T1 |
| FR-3 *First install*: root created, byte-identical, BUT only skill/command folders inside | T1 |
| FR-3 *First install*: record present | T2 |
| FR-3 *Dry run and partial installs* | T2 |
| FR-3 *Shared directory hygiene* (no cleanup or STALE; foreign untouched by install/update/`--fix`) | T1 (cleanup/STALE), T2 (install), T3 (`--fix`), update gapped per §2 |
| FR-4 table: install / install `--force` columns | T2 |
| FR-4 table: update column (incl. `update --force`) | T2 (code), gap → Reviewer trace + `/akili-validate` |
| FR-4 table: doctor / doctor `--fix` columns | T3 |
| FR-4 invalid-record footnote | T2 (install/update), T3 (doctor, BLOCKED) |
| FR-4 *Foreign `tdd` survives update* (install half, "skipped as foreign", MUST NOT record) | T2, T4 (message) |
| FR-4 *Explicit takeover*, MUST leave no file, symlink target untouched | T2 |
| FR-4 *Ownership record missing or unreadable*, MUST leave byte-identical, MUST write nothing, BUT no crash | T2, T3 |
| FR-4 *Interrupted install*, MUST NOT record a failed-removal takeover, BUT `--fix` limit | T2 |
| FR-5 *Healthy install* (OK, exit 0, no env row) | T3 |
| FR-5 *Foreign folder* (FOREIGN, hint, INCOMPLETE, exit, BUT `--fix` untouched) | T3 |
| FR-6 *Detected on the box* / *Not detected elsewhere*, BUT workflows-only not an install | T1 |
| FR-7 *Install with an override*, BUT no copy/rsync/ssh, no network | T4 |
| FR-8 statement and *Count claims* | T5 |
| NFR-1 | T1–T4 (existing suite + Codex baseline), T5 (full set) |
| NFR-2 | T1 (byte identity) |
| NFR-3 | T1 (pins), every task (masking rule) |
| NFR-4 | T2 |
| NFR-5 | T5 |
| NFR-6 | `/akili-validate` (user) |

## 5. Premise hand-off

- P-10, P-11 (`UNVERIFIED`, High): settled at `/akili-validate` by the user on the box. No task builds on them beyond the default path constant.
- P-4 (consumer) is copied into the `Consumers` fields of T1 and T3.
