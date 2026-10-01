# Tasks: Give Deployed Personas an Upgrade Path

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/persona-upgrade` |
| Depth | **Full** |
| Approval Mode | `gated`. **Changed to `pre-approved` by the user on 2026-09-30, at the T2b gate, from T3 on** (`execution.md` Document Control) |
| Status | **Approved** — user chose **Continue** at the Step 3.3 gate, 2026-09-30 |
| Date | 2026-09-30 |
| Source | `requirements.md` (FR-1..FR-10, NFR-1..7, amended: its §10), `design.md` (budget §9: 13 tasks · ~750 lines · 21 review rounds), `judgment.md` (corrected, not re-judged) |
| Commit prefix | `[SPEC:changes/persona-upgrade]` |

**Baselines.** Every reading was run at `1cc75a0` before it was written. T = `.claude/templates`, C = `.claude/commands`.

| ID | Command | Reading |
|---|---|---|
| B1 | `grep -c '<!-- akili' T/{implementer,reviewer,tester,leader}.md` | 0 / 0 / 0 / 0 |
| B2 | `wc -c` of the four templates | 13,969 / 11,733 / 10,427 / 36,092 — total 72,221; cap after markers 74,421 |
| B3 | `ls T` | four `.md` files, no `digests.json` |
| B4 | `npm test` | "Missing script" |
| B5 | `grep -c 'digests.json' bin/akili.js scripts/release.js scripts/ci/install-layout-regression.js` | 0 / 0 / 0 |
| B6 | `grep -c -- '--agents\|allow-branch' bin/akili.js` | 0 |
| B7 | `grep -c -i 'append a minimal upgrade block\|append minimal upgrade blocks\|append only the minimal upgrade blocks'` in `C/akili-constitution.md`, `docs/commands/akili-constitution.md`, `docs/flow.md`, `README.md` | 1 / 1 / 1 / 0 |
| B8 | `grep -c 'never an overwrite' C/akili-audit.md` | 2 |
| B9 | `grep -c 'until re-scaffolded'` in `C/akili-constitution.md`, `docs/commands/akili-constitution.md` | 1 / 1 |
| B10 | `grep -c 'akili:section\|doctor --agents'` in `docs/cli.md`, `README.md`, `CHANGELOG.md` | 0 / 0 / 0 |
| B11 | `grep -c 'npm test' .github/workflows/ci.yml` | 0 |

## 2. Task Graph

```
T1a implementer.md ─┐
T1b reviewer.md    ─┤
T1c tester.md      ─┼─→ T2 parser · states · report ─→ T3 fix · guards · backup ─→ T4 migration ─→ T5 digests · release step · install ─→ T6 I/O test · CI
T1d leader.md      ─┘                                                                                   │
                                                          T7 /akili-constitution ─┐                     │
                                                          T8 /akili-audit        ─┼─ (after T3: they name the CLI's flags) ─→ T9 mirrors · docs/cli.md ─→ T10 CHANGELOG · closure
```

T1a–T1d touch disjoint files and are **parallel-safe** (at most two at a time). T2–T6 are sequential: one module. T7 and T8 are parallel-safe with each other and with T4–T6 (disjoint files). The Leader measures only when no worker is active.

**Scope discipline (every task).** Zero hunks in `.claude/skills/`, `.agents/`, `.claude/commands/` other than the two named, `docs/specs/archive/`, and `package.json` beyond the `test` script. No new dependency (NFR-2). No rule of any persona changes meaning: the template tasks add markers, a project block and one precedence bullet, nothing else.

**One rule for every task.** No shipped prose points at a rule by line number (NFR-7); line numbers here locate edits only.

**`skip-eligible` tasks:** none. Template and command tasks edit text other agents execute (override a); code tasks add a CLI contract and a file format (override b).

---

### T1a: Markers in `implementer.md`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Review | `full`: persona text re-read on every spawn; defines a file format other tools parse (overrides a, b) |
| Depends on | none |
| Requirements | FR-1 (every owned block fenced; ids stable, kebab-case, unique; `since`; invisible when rendered; unfenced text limited to the allowed list; *AND IT MUST read exactly as the unmarked template did*); FR-2 (exactly one project block, empty, after the primary instructions; the precedence sentence inside an owned section; *BUT the replaced section must NOT hold a test command of its own*) |
| Design refs | §5.1, §5.2 (row `implementer.md`), DD-1, DD-2 |

**Scope.** `.claude/templates/implementer.md`: six sections fenced in file order — `context-alignment`, `scope-discipline`, `craft`, `verification`, `reporting`, `shared-file-discipline` — each `since=v2.30.0`; one empty project block between item 4 and `## 📝 Reporting Completion`; one bullet appended to `context-alignment`: the project block below overrides any sentence in a marked section. No other character changes.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c '<!-- akili:section id=' T/implementer.md` → **6**; `grep -c '<!-- /akili:section -->'` → **6**; `grep -c '<!-- akili:project -->'` → **1** (B1 = 0). **2.** Marker-stripped identity: `grep -v '^<!-- /\?akili' T/implementer.md \| diff - <(git show HEAD:.claude/templates/implementer.md)` → the only difference is the added precedence bullet. **3.** `wc -c` → growth ≤ 650 bytes over 13,969. **4.** ids as listed, in order: `grep -o 'id=[a-z-]*' T/implementer.md`. **5.** `git diff --stat` → one file |
| Falsifier | Check 1 fails at `1cc75a0` (B1). **Executed:** on a scratch copy delete one close marker → check 1 reads 6/5 (red) |
| Red run | `n/a (no test gate)` |
| Disqualifier | A count proves presence, not placement. **Read the file whole**: each section's body must be exactly one item or one `##` section by §5.2's level rule; the `## 🎯 Primary Instructions` heading and `---` rules stay outside; no section contains a project fact |
| Consumers | T2's parser and fixtures read this format; the installer copies the file unchanged; Step 8E wrappers load it by path — **hold** (P-9) |

**Done.** Checks 1–5 quoted; the falsifier red recorded; the file read whole against §5.2.

**Skills:** `cognitive-doc-design`.

---

### T1b: Markers in `reviewer.md`

As T1a, for `.claude/templates/reviewer.md`. Sections: `read-only-role`, `audit-checklist`, `structured-evaluation`, `lenses`, `depth-scaling`, `review-output` (the `## 📝 Structured Review Output` section with all three `### Option` subsections). Project block after item 5. Precedence bullet in `read-only-role`.

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Review | `full` (overrides a, b) |
| Depends on | none |
| Requirements | FR-1, FR-2 (same clauses as T1a) |
| Design refs | §5.1, §5.2 (row `reviewer.md`), DD-1, DD-2 |
| Command | Counts **6 / 6 / 1**; marker-stripped diff shows only the precedence bullet; growth ≤ 650 bytes over 11,733; ids in order; one file |
| Falsifier | Check 1 fails at `1cc75a0`. **Executed:** delete the open marker of `review-output` on a scratch copy → counts read 5/6 (red) |
| Red run | `n/a (no test gate)` |
| Disqualifier | Read whole: `review-output` must run to `## Authorship`, its `###` subsections inside it |
| Consumers | As T1a |

**Done.** As T1a. **Skills:** `cognitive-doc-design`.

---

### T1c: Markers in `tester.md`

As T1a, for `.claude/templates/tester.md`. Sections: `context-alignment`, `prove-behavior`, `incremental-focus`, `bounded-loop`, `test-report`. Project block after item 4. Precedence bullet in `context-alignment`.

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Review | `full` (overrides a, b) |
| Depends on | none |
| Requirements | FR-1, FR-2 |
| Design refs | §5.1, §5.2 (row `tester.md`), DD-1, DD-2 |
| Command | Counts **5 / 5 / 1**; marker-stripped diff shows only the precedence bullet; growth ≤ 550 bytes over 10,427; ids in order; one file |
| Falsifier | Check 1 fails at `1cc75a0`. **Executed:** duplicate one open marker on a scratch copy → open count 6, close 5 (red) |
| Red run | `n/a (no test gate)` |
| Disqualifier | Read whole: `test-report` includes its `### Option` subsections; no section holds the test command |
| Consumers | As T1a |

**Done.** As T1a. **Skills:** `cognitive-doc-design`.

---

### T1d: Markers in `leader.md`

As T1a, for `.claude/templates/leader.md`. Sections: `primary-instructions` (items 1–4 as one block), `delegation` (`## 📏 Delegation Thresholds` through the end of *Deferring a check*), `test-harness`, `reporting`, `shared-file-discipline`. Project block after `primary-instructions`. Precedence bullet at the end of `primary-instructions`.

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Review | `full` (overrides a, b) |
| Depends on | none |
| Requirements | FR-1, FR-2; NFR-3 (the four files together ≤ 2,200 bytes of growth: this task reports the running total) |
| Design refs | §5.1, §5.2 (row `leader.md`), DD-1, DD-2 |
| Command | Counts **5 / 5 / 1**; marker-stripped diff shows only the precedence bullet; growth ≤ 550 bytes over 36,092; ids in order; one file; **total of the four templates ≤ 74,421 bytes** once T1a–c have landed |
| Falsifier | Check 1 fails at `1cc75a0`. **Executed:** nest `test-harness` inside `delegation` on a scratch copy (move one close marker down) → the file read shows a section opening inside another; record the two line numbers |
| Red run | `n/a (no test gate)` |
| Disqualifier | Read whole: `delegation` must hold all seven `###` subsections and end before `## 🧪`; hard-wrapped lines keep their wrap |
| Consumers | As T1a; `/akili-execute` and `/akili-test` cite the Leader's sections by title — **hold** (titles unchanged) |

**Done.** As T1a, plus the four-file total. **Skills:** `cognitive-doc-design`.

---

### T2: Parser, section states, report

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L |
| Review | `full`: adds a CLI contract and the code every later task builds on (override b) |
| Depends on | T1a–T1d |
| Requirements | FR-3 (every state of the table as amended; `absent`; `.agents/` absent; exit code rule; the report names the CLI release and the tool root; *BUT it must NOT report any section as `custom-edited`* for a verbatim older persona; *AND IT MUST give the same states whichever `--tool` is passed*); FR-9 (`npm test` with `node:test`; fixtures; red before green); NFR-1, NFR-2 |
| Design refs | §5.1, §5.4, §6, §7, DD-9; P-1, P-2, P-3, P-12 |

**Scope.** New `bin/persona.js` (pure: `parsePersona`, `normalizeBody`, `hashBody`, `sectionStates`); `bin/akili.js` gains `agents`, `section`, `allow-branch` in the options literal and mapping, `runAgentsDoctor` in report-only form, and the dispatch from `doctor`; `package.json` gains `"test": "node --test"`; `test/agents-doctor.test.js` and fixtures: verbatim marked, custom-edited section, missing section, unclosed marker, two project blocks (held-out), CRLF. Until T5 lands, tests pass a fixture digest table to `sectionStates`.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `npm test` → all pass. **2.** `node bin/akili.js doctor --agents` in a temp dir holding a verbatim copy of the four templates as `.agents/` → every section `current`, exit 0. **3.** Same with one section's body edited → that section `custom-edited`, exit 0. **4.** Same with one close marker deleted → `unreadable`, exit 1. **5.** `node bin/akili.js doctor --tool claude` (no `--agents`) → output identical to `git stash`-ed baseline (run before the edit and saved). **6.** `npm run verify:cli`; `grep -c '"dependencies"' package.json` unchanged. **7.** `git diff --stat` → `bin/akili.js`, `bin/persona.js`, `package.json`, `test/` |
| Falsifier | **Executed:** in `sectionStates`, make the hash comparison ignore the body (return `current` always) → the custom-edited and outdated tests go red on their state assertion |
| Red run | Each test observed failing **on its state assertion** with `sectionStates` stubbed to throw, before the implementation — recorded per test name. A red from a missing file or a syntax error is not a red |
| Disqualifier | A green suite whose fixtures never differ on the asserted axis is an inert fixture: each fixture must produce a state the verbatim fixture does not. The baseline for check 5 must be captured before any edit to `bin/akili.js` |
| Consumers | `scripts/ci/install-layout-regression.js` exercises `install`/`doctor` layouts (T5 edits it); no test pins `doctor`'s output text: `grep -rn "doctor" scripts/ci .github` read and quoted |

**Done.** Checks 1–7 quoted; red runs listed per test; falsifier red; check 5's before/after identical.

**Skills:** `tdd`, `error-handling-patterns`.

---

### T2b: Fixture line endings are pinned

Added at execute time, 2026-09-30, to close a spec gap found in T2 (`execution.md` → *Spec gap record: fixture line endings*). Approved by the user at the T2 gate.

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Review | `checklist`: one configuration file, no contract changes |
| Depends on | T2 |
| Requirements | FR-9 (fixtures SHALL include a persona with CRLF line endings; tests SHALL assert that a CRLF persona stays CRLF; the project's CI SHALL run the test script) — the fixtures must reach every checkout byte for byte |
| Design refs | §4 (`test/fixtures/personas/*.md`), DD-9 |

**Scope.** New file `test/fixtures/personas/.gitattributes` holding one line, `*.md -text -whitespace`. No fixture, test or code file changes.

| Field | Value |
|---|---|
| Command | **1.** `git check-attr text whitespace -- test/fixtures/personas/crlf.md` → `text: unset`, `whitespace: unset` (baseline at `ec78ee4`: both `unspecified`). **2.** With the file staged: `git diff --cached --check`; then `git diff --check acd119c -- test/fixtures` → exit **0** (baseline at `ec78ee4`: `git diff --check acd119c HEAD -- test/fixtures` → exit 2). **3.** `git ls-files --eol test/fixtures/personas/crlf.md test/fixtures/personas/verbatim-marked.md` → `i/crlf w/crlf attr/-text` and `i/lf w/lf attr/-text`. **4.** `npm test` → 22 pass. **5.** `git status --short` → the one new file |
| Falsifier | Checks 1–3 fail at `ec78ee4` (readings above, run before this task was written). **Executed:** in a scratch clone holding the file, delete it → check 2 reads exit 2 again |
| Red run | `n/a (no test gate)` |
| Disqualifier | The readings prove what git does on this machine. Whether the Windows CI runner converts line endings without the file stays `UNVERIFIED`; the file makes the question moot, it does not answer it |
| Consumers | `none (no shared symbol changed)` — `test/` is not in `package.json` `files` |

**Done.** Checks 1–5 quoted; the falsifier red recorded. **Skills:** none.

---

### T3: Fix, guards, backup

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L |
| Review | `full`: writes files a project owns (overrides b, f — data loss surface) |
| Depends on | T2 |
| Requirements | FR-4 (replace, insert, install `absent`; backup before write; `custom-edited` and `unlocated` only with `--section`; `extra` untouched; project space byte-identical; both guards with their overrides and named reasons; kaizen resolution, unresolved refuses; idempotence, exit 0; `--dry-run` writes nothing; *BUT the file must NOT be written before its backup exists*; *AND IT MUST report no section as `outdated` or `missing`* on the second run); FR-10 (reversible from the backup; report says where); NFR-4 |
| Design refs | §5.4 (`--fix` column), §6, DD-4, DD-5, DD-12; P-16 |

**Scope.** `bin/persona.js`: `applyFix`; `bin/akili.js`: `resolveBranchContext`, the dirty guard, backup, atomic write, `--dry-run`, `--section`, `--allow-branch`, `--force`, the `--fix` rows; tests: byte identity of project space across `applyFix` on every fixture; insertion positions (preceding present / next present / before project block); idempotence; guard matrix (pinned apply-capable, pinned other branch, no pin + `origin/HEAD`, unresolved, not a git repo; clean, dirty, dirty only by `.backup/`).

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `npm test` → all pass. **2.** In a temp git repo on a non-default branch with a `Default Branch: main` pin: `doctor --agents --fix` → `REFUSED (branch)`, no file changed (`git status --porcelain` empty); with `--allow-branch` → proceeds. **3.** `--fix --dry-run` → plan printed, `find .agents -newer <marker>` empty. **4.** After a real `--fix`: `.agents/.backup/` holds one file per rewritten persona; a second `doctor --agents` exits 0. **5.** `git diff --stat` → `bin/`, `test/` |
| Falsifier | **Executed:** make `applyFix` rebuild the file from segments while dropping `text` segments → the byte-identity test goes red |
| Red run | Each new test observed failing on its assertion before the implementation; recorded per test name |
| Disqualifier | Byte identity must be asserted on the concatenation of every project-space segment, not on line counts. A guard test that stubs `git` must stub it for the *refusing* case too, or it proves only the pass path |
| Consumers | `none (no shared symbol changed)` — `bin/persona.js` exports are new; T4 and T5 consume them |

**Done.** Checks 1–5 quoted; red runs listed; falsifier red.

**Skills:** `tdd`, `error-handling-patterns`.

---

### T4: Migration of unmarked personas

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L |
| Review | `full` (overrides b, f) |
| Depends on | T3 |
| Requirements | FR-5 (exact then heading + opening sentence, normalized; heading alone never fences; extent by level; not located reported and recorded; front matter and unfenced lines in place; one project block at the stated position; the record before the project block; the three printed outcomes; *BUT it must NOT delete, move or reorder any line*; *AND IT MUST keep the front matter as the first bytes of the file*) |
| Design refs | §5.1 (migration record), §5.2 (levels), DD-6, DD-13; P-11, P-13, P-14, P-17 |

**First step — settle P-13 and P-14.** Re-run the judge's survey: list the downstream `.agents/implementer.md` files reachable on this machine, count those with two-space items, one-space items, neither; note any third shape and any scaffold-release record. A third shape is reported to the Leader before any code: it may be a Pivot.

**Scope.** `bin/persona.js`: `migratePersona`; wiring into `--fix`; fixtures: an older tagged template copied verbatim (no markers), and a rewritten persona modelled on STAR's (front matter, renamed role, one-space items, two retitled items, a custom `##` section, no authorship section); tests for each location outcome, the extent rule on a `##` section with `###` inside, the project-block position in both shapes, the record line, no-reorder (line multiset and order preserved outside inserted markers).

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `npm test`. **2.** On a **copy** of this repository's `.agents/implementer.md` in a temp dir (with the T5 legacy table, or a fixture table until T5): `doctor --agents --fix --dry-run` → the plan; report the counts of `FENCED (exact)`, `FENCED (heading)`, `NOT LOCATED`. **3.** Same on a copy of STAR's `implementer.md`. **4.** For both copies, after a real `--fix` in the temp dir: `diff` of the file with all marker lines removed against the original → **empty**. **5.** `git diff --stat` → `bin/`, `test/` |
| Falsifier | **Executed:** change the extent rule to stop at any heading → the `##`-with-`###` test goes red (the section is cut at `### Option A`) |
| Red run | Each new test observed failing on its assertion before the implementation |
| Disqualifier | Checks 2–3 are readings, not pass/fail: a run that fences nothing is a finding for the Leader, not a success. Check 4 is the gate: any non-empty diff voids the task. The real `.agents/` folders are never written — copies only |
| Consumers | `none (no shared symbol changed)` |

**Done.** P-13/P-14 settled and recorded; checks 1–5 quoted with the counts; red runs; falsifier red.

**Skills:** `tdd`, `error-handling-patterns`.

---

### T5: Digest table, release step, resource install

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Review | `full`: changes the release script and what the installer ships (override b) |
| Depends on | T4 |
| Requirements | FR-3 (a digest of every section at every release and every earlier tagged release, installed beside the templates; no match → `custom-edited`); FR-8 (the release names section ids — the step makes them available); NFR-1 |
| Design refs | §5.3, DD-3, DD-11; P-5, P-7, P-15 |

**Scope.** `.claude/templates/digests.json`: `legacy` seeded from every tag whose tree holds the templates, by a one-off generator that becomes a function in `bin/persona.js`; `releases` empty. `scripts/release.js`: after the notes are written, append this release's 22 hashes, rewrite `since=` for changed sections, stage-hint every file written. `bin/akili.js`: `templates/digests.json` in the resource copy list and `doctorTool`'s checks. `scripts/ci/install-layout-regression.js`: expected list. `scripts/release-status.js`: a `digests.json` whose `version` differs from `package.json` once `releases` is non-empty is drift.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `npm test` (adds: `legacy` has an entry for `implementer.verification` at `v2.29.0`; hashing the v2.29.0 template's item 4 by the level rule gives that hash). **2.** `node bin/akili.js install --tool all --dry-run` → lists `templates/digests.json`. **3.** `node scripts/ci/install-layout-regression.js` → passes. **4.** Release step on a scratch clone: `node scripts/release.js patch` → `digests.json` gains one `releases` key with 22 hashes; `git status --short` lists every file the hint names. **5.** `npm run pack:dry-run` → includes `digests.json`. **6.** T4's check 2 re-run with the real table |
| Falsifier | **Executed:** hash the body without normalization → the v2.29.0 test goes red (trailing whitespace differs) |
| Red run | The new tests observed failing on their assertion before the generator exists |
| Disqualifier | The release step must never be run in the working checkout: scratch clone only. A `legacy` table built from `HEAD` instead of tags is not a legacy table — the test must name a tag |
| Consumers | `scripts/release-status.js` and the `Release Status` workflow read release files; `scripts/notify-slack.js` reads the notes — **holds**. `install-layout-regression.js` pins the template list (this task) |

**Done.** Checks 1–6 quoted; red runs; falsifier red.

**Skills:** `tdd`.

---

### T6: I/O test and CI

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Review | `checklist`: a test file and one workflow line; no contract changes |
| Depends on | T5 |
| Requirements | FR-9 (backup exists before the write, an I/O test in a temp dir; CI runs the tests; a CRLF persona stays CRLF) |
| Design refs | DD-9; P-19 |

**Scope.** `test/agents-doctor-io.test.js`: temp dir, fixture copy, `runAgentsDoctor` with a read-only persona → backup exists, persona unchanged, non-zero exit; writable → persona upgraded, backup present; CRLF fixture round-trip. `.github/workflows/ci.yml`: `npm test`.

| Field | Value |
|---|---|
| Command | `npm test`; `grep -c 'npm test' .github/workflows/ci.yml` → **1** (B11 = 0) |
| Falsifier | **Executed:** swap the backup and the write in `runAgentsDoctor` → the read-only test goes red (no backup) |
| Red run | Observed failing on the backup assertion before T3's ordering is exercised by this test |
| Disqualifier | A temp dir on a filesystem that ignores read-only bits makes the test inert: the test must assert the write was actually refused |
| Consumers | `none (no shared symbol changed)` |

**Done.** Command quoted; red run; falsifier red. **Skills:** `tdd`.

---

### T7: `/akili-constitution` replaces instead of appending

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Review | `full`: **removes delivered behavior** (DD-7, reversion challenge run) and edits a step every scaffold executes (overrides a, d) |
| Depends on | T3 (names the CLI's flags) |
| Requirements | FR-6 (migrate when unmarked; replace `outdated`; insert `missing`; report `custom-edited`; no appended block for a rule an owned section covers; injections only into the project block and never duplicated; prefer the CLI, else the same steps from the installed templates and digests; *BUT it must NOT rewrite the project block*); FR-2 (the *Injection scope* table names the project block); FR-8 (inline-draft path drafts with markers; the sentences that turn false); FR-10 ("run `akili update` first") |
| Design refs | DD-2, DD-7; §7 surfaces 10–11; §12 |

**Scope.** `.claude/commands/akili-constitution.md`, five sites: the Safe Update bullet of Step 8B; the *Injection scope* lead sentence; the inline-draft sentence; Step 8C's "until re-scaffolded" sentence; the checklist item on customization.

| Field | Value |
|---|---|
| Command | **1.** `grep -c -i 'append a minimal upgrade block' C/akili-constitution.md` → **0** (B7 = 1). **2.** `grep -c 'doctor --agents' C/akili-constitution.md` → **≥ 2**. **3.** `grep -c 'until re-scaffolded' C/akili-constitution.md` → **0** (B9 = 1). **4.** `grep -c 'akili:project' C/akili-constitution.md` → **≥ 2**. **5.** `git diff --stat` → one file |
| Falsifier | Checks 1–4 fail at `1cc75a0`. **Executed walk**, on a scratch copy: delete the "never inject what the persona already carries" clause → walk a persona whose `custom-edited` item holds the test command: the literal reading now writes a second copy |
| Red run | `n/a (no test gate)` |
| Disqualifier | **Read Step 8B whole.** Void if a surviving sentence still says append, if the by-hand fallback restates a state's definition (it cites `docs/cli.md`), or if any row of *Injection scope* can be read as writing into an item |
| Consumers | `docs/commands/akili-constitution.md` mirrors these sentences (T9); `/akili-audit` cites Step 8B's *Injection scope* (T8 re-reads it) |

**Pre-review sweep.** `grep -n -i "append\|overwrite\|upgrade block\|preserv" C/akili-constitution.md`: every hit read.

**Done.** Checks quoted; walk recorded; Step 8B read whole. **Skills:** `cognitive-doc-design`.

---

### T8: `/akili-audit` reports section states

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Review | `full` (override a) |
| Depends on | T3 |
| Requirements | FR-7 (the existing structural check reports `outdated`, `missing`, `unmarked` with the fixing command; the two "never an overwrite" sentences rewritten) |
| Design refs | DD-8; P-18 |

**Scope.** `.claude/commands/akili-audit.md`, four sites: item (c) of *Model Generation Drift*; the injection-bleed remediation sentence; the structural-check remediation sentence; the summary-table row that cites item (c) by a line pointer.

| Field | Value |
|---|---|
| Command | **1.** `grep -c 'never an overwrite' C/akili-audit.md` → **0** (B8 = 2). **2.** `grep -c 'doctor --agents' C/akili-audit.md` → **≥ 1**. **3.** `grep -c ':59(c)' C/akili-audit.md` → **0**. **4.** one file |
| Falsifier | Checks 1–3 fail at `1cc75a0`. The input that would fail check 1 after the edit: a remediation sentence that still forbids an overwrite for drift |
| Red run | `n/a (no test gate)` |
| Disqualifier | Read the persona checks whole: injection bleed keeps a manual trim; drift names the CLI; no state is redefined here |
| Consumers | `docs/commands/akili-audit.md` if it mirrors these sentences (T9 greps it) |

**Done.** Checks quoted; the checks read whole. **Skills:** `cognitive-doc-design`.

---

### T9: Mirrors and `docs/cli.md`

| Field | Value |
|---|---|
| Status | `[~]` |
| Size | M |
| Review | `full`: `docs/cli.md` is the one home of the marker grammar and the states (NFR-6); summary surfaces inherit the evidence bar (KZ-002) |
| Depends on | T5, T7, T8 |
| Requirements | FR-8 (`docs/cli.md`, mirrors, `README.md`; the sweep list); NFR-6, NFR-7 |
| Design refs | §5.1, §5.4, §6; §7 surfaces 13–14; P-20 |

**Scope.** `docs/cli.md`: the mode, flags, marker grammar, states table, exit codes, guards. `docs/commands/akili-constitution.md` (two sentences), `docs/commands/akili-audit.md` (where it mirrors T8), `docs/flow.md` (one row), `README.md` (one bullet and the CLI section).

| Field | Value |
|---|---|
| Command | **1.** B7's grep over the three mirror files → **0 / 0 / 0**. **2.** `grep -c 'until re-scaffolded' docs/commands/akili-constitution.md` → **0**. **3.** `grep -c 'akili:section' docs/cli.md` → **≥ 1**; `grep -c 'doctor --agents' docs/cli.md README.md` → **≥ 1 each** (B10 = 0). **4.** Each state name of §5.4 appears in `docs/cli.md`: loop over the eight names. **5.** `node bin/akili.js doctor --help` flags ⊆ flags documented in `docs/cli.md` |
| Falsifier | Checks 1–4 fail at `1cc75a0`. **Executed:** remove `unlocated` from a scratch copy of `docs/cli.md` → check 4 reads 0 for it |
| Red run | `n/a (no test gate)` |
| Disqualifier | Every sentence in `docs/cli.md` about a state or an exit code is checked against `bin/persona.js` as shipped, not against the design |
| Consumers | `/akili-constitution` and `/akili-audit` cite `docs/cli.md` for the states (T7, T8): the names must match byte for byte |

**Done.** Checks quoted; the state table compared with the code. **Skills:** `cognitive-doc-design`.

---

### T10: CHANGELOG and closure walks

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Review | `full`: derived evidence a closure gate consumes (override c) |
| Depends on | all |
| Requirements | FR-8 (entry, classification, the convention); FR-10 (rollout, rollback stated); requirements §8, every gate |
| Design refs | DD-10; §11 |

**Scope.** `CHANGELOG.md` `Unreleased`; `docs/specs/changes/persona-upgrade/closure.md`.

**Walks**, against shipped text and code, judged on the general rule:

| Walk | Cases |
|---|---|
| Section states | The ten rows of §5.4, plus **held-out H1**: a marked persona whose project block was deleted by hand |
| Fix safety | Every `--fix` row of §5.4 against the guards, plus **held-out H2**: `--fix --section verification` on a persona where that section is `current` |
| Migration | FR-5's two scenarios on the real copies (T4 checks 2–4), plus **held-out H3**: a persona that is only front matter and free prose, no heading the templates know |
| Safe Update | FR-6's scenario, plus **held-out H4**: no CLI on PATH and no installed `digests.json` |
| Requirement text | FR-1…FR-10 term by term |

| Field | Value |
|---|---|
| Command | `npm test`; `npm run verify:cli`; `npm run pack:dry-run`; `node bin/akili.js doctor --tool all`; `git diff --check`; `wc -c` of the four templates vs 74,421; `git diff --stat 1cc75a0 -- .claude/skills .agents` → empty; each CHANGELOG clause quote-checked at HEAD |
| Falsifier | **Executed** for the states walk: in a scratch copy of `bin/persona.js`, remove the `unreadable` branch → H1 must now fall into another state; record which |
| Red run | `n/a (no test gate)` |
| Disqualifier | A walk is void if a case was judged by finding its own citation, or an outcome adjusted to match what shipped |
| Consumers | `scripts/release.js` reads `Unreleased`; `scripts/notify-slack.js` digests each bullet's bold headline |

**Done.** Entry lands; walks recorded case by case; commands quoted.

**Skills:** `cognitive-doc-design`.

---

## 3. Coverage

| Requirement | Clause | Owner |
|---|---|---|
| FR-1 | *A persona is rendered*: "AND IT MUST read exactly as the unmarked template did" | T1a–T1d (check 2) |
| FR-2 | *An upgrade meets an injected test command*: "BUT the replaced section must NOT hold a test command of its own" | T1a, T1c (read whole); T3 (byte identity) |
| FR-3 | *A v2.29.0 persona…*: "BUT it must NOT report any section as `custom-edited`" | T2; with the real table, T5 check 6 |
| FR-3 | *Two tools installed*: "AND IT MUST give the same states whichever `--tool` is passed" | T2 |
| FR-4 | *A hand-edited section*: "BUT the file must NOT be written before its backup exists" | T3; T6 (I/O) |
| FR-4 | *Idempotence*: "AND IT MUST report no section as `outdated` or `missing`" | T3 |
| FR-5 | *An older scaffold* | T4 check 2; T5 check 6 |
| FR-5 | *A rewritten persona*: "BUT it must NOT delete, move or reorder any line"; "AND IT MUST keep the front matter as the first bytes of the file" | T4 (check 4, tests) |
| FR-6 | *Safe Update on a marked persona*: "BUT it must NOT rewrite the project block" | T7 |
| FR-7 | No scenario | T8 |
| FR-8 | No scenario; six bullets | T7 (inline draft, sentences), T9 (mirrors, `docs/cli.md`), T10 (CHANGELOG) |
| FR-9 | No scenario | T2–T6 |
| FR-10 | No scenario; four bullets | T3 (reversible, report), T7 ("run `akili update` first"), T10 (stated) |
| NFR-1…7 | Measures | T2 (1, 2), T1d (3), T3 (4), T9 (5, 6, 7), T10 (totals) |

## 4. Estimate and PR Strategy

| | Value |
|---|---|
| Tasks | 13 |
| Estimated lines | ~750 (CLI ~400, tests ~230, templates ~70, release/CI ~20, prose ~50) |
| Review rounds budgeted | 21 |
| PR strategy | Over 400 lines: **two change sets** if a PR flow is used — (1) T1a–T6: format, CLI, tests; (2) T7–T10: commands, docs, CHANGELOG. This repository has committed specs straight to `master`; either way the boundary holds as a review order: read (1) first, since (2) only describes it |
| First task | T1a (or T1a ∥ T1b) |

## 5. Amendments at Execute Time

| Date | Amendment | Approved by | Where |
|---|---|---|---|
| 2026-09-30 | Task **T2b** added (14 tasks). Line budget raised from ~750 to **~1,700 excluding fixtures**; fixture lines are reported separately. Review rounds stay at 21 | The user at the T2 gate, delegating both open decisions to the Leader's stated recommendation | §2 (T2b); `execution.md` Document Control and *Spec gap record* |
| 2026-09-30 | **Budget tripwire at the T3 gate (lines 1,781 of ~1,700):** the line cap is removed — lines are reported, not capped; review rounds raised from 21 to **26** (11 used; T4 2, T5 1, T6 1, T7 3, T8 2, T9 3, T10 3). Two design clarifications for T4/T5 recorded in `design.md` §5.2 (extent of `primary-instructions`) and §5.3 (digest entry shape `{body, head, open}`) | The user ("continue !"), to the Leader's stated proposal | `design.md` §5.2, §5.3; `execution.md` Document Control |
