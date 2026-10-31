# Tasks: Make `install` and `doctor` tell a stale skill from a current one

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/install-stale-skills` |
| Status | **Approved**: tasks gate `auto-approved (pre-approved mode)`, 2026-10-31 |
| Requirements / Design | `requirements.md` (FR-1–FR-5, NFR-1–NFR-5); `design.md` rev 2 (`judgment.md`) |
| Baseline | `d5018e3` (spec docs committed after it). `npm test` → `# tests 1345 # pass 1345 # fail 0` |
| Baseline readings | `grep -n 'skip existing' bin/akili.js` → `:969`, `:1034`, `:1223`; `grep -c 'DIFFERS' bin/akili.js` → 0; `ls bin/install-compare.js` → No such file |
| Commit prefix | `[SPEC:changes/impeccable-audit-fixes/install-stale-skills]`. Local commits only |
| Budget (design §12) | **4 tasks · ~650 LOC · ~7 review rounds.** JC's standing rule: stop if a tripwire exceeds the budget by more than ~20 % (~780 LOC) |
| PR strategy | PR 1 = T1 + T2, PR 2 = T3 + T4 (proposed only; no PR in this cycle) |
| `skip-eligible` tasks | None: every task changes a shared contract or output that tests parse |

## Dependency graph

```text
T1 ──► T2 ──► T3 ──► T4
```

## Shared rules for every task

- **Test first.** Write the task's tests, run them red (quote the red), then implement.
- **Real CLI.** CLI tests drive `node bin/akili.js` as a subprocess with `HOME`/`USERPROFILE` and `cwd` pinned to a `fs.mkdtempSync` scratch dir, removed in `t.after`. Mimic `test/install-impeccable-foreign.test.js` (`mkHome`, `install`, `stripAnsi`).
- **Snapshot.** Every test that runs install without `--force` snapshots the target tree before and after, and asserts it is unchanged (NFR-1).
- **Mutation check.** For each new assertion, apply the named mutation, observe the red, quote it, restore.
- **Consumers.** Run the suites named in the task's `Consumers` field, then `npm test`.
- **No spec-path reads** in tests; the `// @akili-spec changes/impeccable-audit-fixes/install-stale-skills` header comment is the only spec reference.
- **Line pointers** are for the Implementer only.

---

### T1: `bin/install-compare.js` (FR-1)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~60 code, ~120 tests) |
| Depends on | — |
| Requirements | FR-1 (5 SHALL bullets; scenario 1 THEN/AND IT MUST via the pure function; scenario 2 THEN/BUT); NFR-3, NFR-5 |
| Design | §5 row 1, §7.1, §9; DD-1, DD-3, DD-4, DD-6; P-4, P-5 |
| Scope | New `bin/install-compare.js` (`"use strict"`, CommonJS, the `@akili-spec` header; exports `compareEntry`, `formatDiffers`). New `test/install-compare.test.js` |
| Tests (≈12) | File identical; file differs (one byte); file target is a directory; file target is a symlink; dir identical; dir with one differing nested file (relative path with `/`); dir missing a package file; dir with an extra target file → `identical`; dir target is a file; dir target is a symlink; sorted output; `formatDiffers` with 3, 5 and 8 names (`+3 more`); a source-side missing path throws |
| Falsifier | (1) Make the dir walk also visit target-only files → the extra-file test goes red. (2) Normalize `\r\n` before comparing → a CRLF-vs-LF fixture test goes red. (3) Follow symlinks (`stat` instead of `lstat`) → the symlink tests go red. Executed and quoted |
| Red run | `predicted — greenfield artifact (observed in T1)`; `execution.md` quotes the first run failing on assertions (`Cannot find module` is setup, not a red: write a stub export first) |
| Disqualifier | A test that builds the expected class by calling the same comparison code; fixtures written without `t.after` cleanup; a symlink test that does not skip with a reason where symlinks cannot be created (Windows without privilege) |
| Consumers | none (new module) |
| Review | `full`: a shared contract (FR-1 semantics) every later task consumes |
| Done criteria | Tests green with mutation reds quoted; `npm test` green |
| Skills | `tdd` |

### T2: Install classification, split counts, next steps, `Home:` (FR-2, FR-4)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~60 code, ~140 tests) |
| Depends on | T1 |
| Requirements | FR-2 (6 SHALL bullets; both scenarios' THEN/BUT/AND IT MUST); FR-4 (the summary line; scenario THEN; the `--local` negative); FR-1 scenario 1 end-to-end; NFR-1, NFR-2, NFR-4 |
| Design | §5 rows 2–3, §6 install rows, §7.2; DD-2, DD-9; P-1, P-3, P-7, P-9 |
| Scope | `bin/akili.js`: `copySingleFile` skip, `copyDirectoryContents` skip, command-as-skill non-dir skip, `add()` + direct `skipped += 1`, `runInstall` reduce, `summaryCounts`, next-steps lines (the plain "same flags as this run" wording, DD-9), `Home:` line (FR-4 rule). `bin/akili.js` requires `./install-compare.js`. New `test/install-stale-skills.test.js` (install half) |
| Tests (≈10) | Claude `--local`: second install → every skip `(identical)`, `differs 0`, "already match", no replace hint, tree unchanged. Edited `impeccable-bridge/SKILL.md` → `skip existing …impeccable-bridge (differs: SKILL.md)`, `differs 1`, hint names `akili update` and `install --force` and says "with the same --tool, --local and --target flags as this run", exit 0, file unchanged. Extra `notes.txt` in `tdd` → `(identical)`. `--dry-run` classifies and writes nothing. `--force` prints no class and no hint. Codex `--local` (commands as skills): an edited command `SKILL.md` → `differs`. Grok Bot: an owned entry replaced by a file → `(differs: SKILL.md)`. Arithmetic `identical + differs = skipped` on the summary row. `Home:` printed for a run without `--local` whose root lies under `HOME=<scratch>`, and absent for `--local` |
| Falsifier | (1) Drop the suffix in `copyDirectoryContents` → the edited-skill test goes red. (2) Count `differs` into `identical` → the arithmetic test goes red. (3) Print `Home:` unconditionally → the `--local` negative goes red. Executed and quoted |
| Red run | Baseline: `grep -c '(identical)' bin/akili.js` → 0. New tests red on their assertions before the change, quoted |
| Disqualifier | Any write without `--force` (snapshot differs); a consumer suite red; a test that installs into the real `HOME` |
| Consumers | `test/install-cursor.test.js` (`:202`, `:281`, `:297`, `:314`, `:405`, `:563`), `test/install-impeccable-foreign.test.js` (`:111`, `:125`), `test/install-grokbot.test.js` (`:561`, the `/preserved/` negative), `test/install-grokbot-edge.test.js`, `test/social-marketing-install.test.js` — all must stay green |
| Review | `full`: install output other tools and tests parse |
| Done criteria | Tests green with reds quoted; all consumers green; `node bin/akili.js install --tool all --dry-run` (scratch `HOME`) runs clean; `npm test` green |
| Skills | `tdd`, `error-handling-patterns` |

### T3: Doctor `DIFFERS` (FR-3)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~80 code, ~110 tests) |
| Depends on | T2 |
| Requirements | FR-3 (7 SHALL bullets; scenario THEN/BUT/AND IT MUST); NFR-1, NFR-2 |
| Design | §5 row 4, §6 doctor rows, §7.3; DD-5, DD-7, DD-8, DD-9; P-2, P-3, P-7, P-10 |
| Scope | `bin/akili.js` `doctorTool` (commands: every location; skills: every dir, foreign-`impeccable` exclusion; resources; `checkOwnedEntry`) and `runDoctor` (conditional column, hint outside the exit block with tool + roots, closing line). Doctor half of `test/install-stale-skills.test.js` |
| Tests (≈9) | Edited `impeccable-bridge` → `DIFFERS impeccable-bridge (SKILL.md)`, row `differs 1`, hint, exit 0, status `HEALTHY`, no "All checks passed". Clean install → output identical to today's shape (no `differs` column, "All checks passed"). `--fix` leaves the edited file unchanged and exit 0. Antigravity `--local`: edit the 2nd skills dir's copy only → `DIFFERS`. A foreign `impeccable/` (no `UPSTREAM.md`) with changed content → no `DIFFERS`, ` (not AKILI's copy; not compared)`. Grok Bot owned entry edited → `DIFFERS`, foreign still `FOREIGN` and exit 1 as today. An edited resource → `DIFFERS`. A missing file plus a differing file → exit 1 (missing), both reported |
| Falsifier | (1) Put the hint inside the `missing + foreign` block → the `DIFFERS`-only exit-0 test goes red. (2) Compare only `skillDirs[0]` → the Antigravity test goes red. (3) Always print `differs N` → the codex baseline fixture test (`install-cursor.test.js:847-880`) goes red. Executed and quoted |
| Red run | Baseline `grep -c 'DIFFERS' bin/akili.js` → 0; new tests red, quoted |
| Disqualifier | `--fix` writes a `DIFFERS` entry; any exit-code change for a run without missing/foreign; the codex baseline fixture edited to make a test pass |
| Consumers | `test/install-cursor.test.js:847-880` + `test/fixtures/doctor-codex-baseline.txt` (unchanged), `test/install-grokbot.test.js:770-771`, `test/install-impeccable-foreign.test.js`, `test/agents-doctor*.test.js` (doctor `--agents` untouched) |
| Review | `full`: exit-code and status contract |
| Done criteria | Tests green with reds quoted; consumers green; `node bin/akili.js doctor --tool all` (scratch `HOME`) behaves as before apart from labels; `npm test` green |
| Skills | `tdd` |

### T4: Docs, CHANGELOG, pin (FR-5)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~50 docs, ~30 tests) |
| Depends on | T3 |
| Requirements | FR-5 (every listed site); FR-4 docs half (`--local` per worktree); NFR-4 |
| Design | §7.4 (all eight rows); P-7 |
| Scope | `docs/cli.md` (`:216`, `:217`, the ownership table row, `:413`, `:426`, `:431`, `:486`), `CHANGELOG.md` (`:11` reworded, new `Unreleased` entry), `test/design-eval-contract-coverage.test.js:56` pin; text assertions appended to `test/install-stale-skills.test.js` |
| Tests (≈5) | `docs/cli.md` names `(identical)`/`(differs`, `DIFFERS`, the exit rule, `--local` per worktree; the ownership row; CHANGELOG new entry; the reworded sentence; no shipped file keeps "existing file(s) were preserved" |
| Falsifier | Restore the old "partial entry … reads OK" line → its assertion goes red. Executed and quoted |
| Red run | Baseline: `grep -c 'DIFFERS' docs/cli.md` → 0 |
| Disqualifier | A doc clause that claims more than the code (KZ-002: quote each against `bin/akili.js`) |
| Consumers | `test/design-eval-contract-coverage.test.js:53-57`, `test/docs-overview*.test.js` |
| Review | `checklist` |
| Done criteria | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green; measured LOC recorded |
| Skills | `cognitive-doc-design` |

## Coverage

| Clause | Task |
|---|---|
| FR-1 bullets 1–5; S1 (pure) ; S2 | T1 |
| FR-1 S1 end-to-end; FR-2 all; FR-4 summary | T2 |
| FR-3 all | T3 |
| FR-4 docs; FR-5 all | T4 |
| NFR-1 | T2, T3 (snapshots, `--fix`) |
| NFR-2 | T2 (claude, codex, grokbot), T3 (antigravity, grokbot) |
| NFR-3 | T1 (no state written) |
| NFR-4 | T2, T3, T4 |
| NFR-5 | every task |
