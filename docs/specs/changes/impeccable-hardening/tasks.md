# Tasks: Ship Impeccable inside AKILI, and harden its design gates

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-hardening` |
| Status | **Approved** by Juan Carlos Cadavid, 2026-10-30 11:28 (UTC-5), with the two-PR strategy. Spec complete; ready for `/akili-execute` |
| Requirements / Design | `requirements.md` rev 2 (approved 11:02), `design.md` (approved 11:19, no Review Design), 2026-10-30 UTC-5 |
| Baseline | AKILI `89457ba`; upstream `df3a4ab`. `npm test` → 1201 pass, 0 fail (archive run, `b6575d8`) |
| Commit prefix | `[SPEC:changes/impeccable-hardening]`. Local commits only: no push, PR, tag or publish |
| Baseline readings (run 2026-10-30, `grep -rnF <p> .claude docs README.md --exclude-dir=specs \| wc -l`) | `npx impeccable detect` → **6**; `Unevaluated (Impeccable absent)` → **3**; `skill only` → **9**; `never copies Impeccable` → **1**; `390x844` → 0; `no-consent-hiding` → 0; `Proposed waiver` → 0; `engine-probe` → 0; `ls .claude/skills/impeccable` → `No such file or directory` |
| Budget (design §12) | 11 tasks · ~1,365 authored LOC · ~19 review rounds (+T3b, P-13 option (ii) (amended 2026-10-30, P-13 option (ii), approved by JC 12:13 UTC-5)); before that 10 tasks · ~1,350 authored LOC · ~18 review rounds (was 9 · ~1,250 · ~16; +T2b (amended 2026-10-30, Pivot P-7, Option A approved by JC 11:56 UTC-5)). `/akili-execute` stops and escalates when actuals exceed it |
| PR strategy | **PR 1** (T1, T2, T8 counts part): the vendored skill and its locks. **PR 2** (T3–T7, T8 rest, T9): the AKILI layer, commands, docs and release notes. Both target `dev` (proposed only; no PR opened in this cycle) |

## Dependency graph

```text
T1 ──► T2b ──► T2 ──► T8 ──► T9
T1 ──► T3 ──► T4
T3 ──► T3b ──► T8
        T3 ──► T5
        T3 ──► T6
T1,T3 ─► T7
T4,T5,T6,T7 ─► T8
```

There are no cycles. T5, T6 and T7 are parallel-safe after T3: each edits disjoint files.

---

### T1: Vendor Impeccable with the sync script

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~200 LOC script + generated tree) |
| Depends on | — |
| Requirements | FR-1 (all clauses, both scenarios), FR-2 (script clauses, "refuse dirty", "no download"), FR-3 (exec bit at source), NFR-2, NFR-4 |
| Design | §4, §5.1, §5.2, §7.3, DD-1, DD-2, DD-3, DD-6, DD-7; P-2, P-8, P-11 |
| Scope | `scripts/sync-impeccable.js` (new); run it with `--from <scratch clone> --commit df3a4abe7d0840d5f60324812c432e00b66a4e75` to create `.claude/skills/impeccable/` (58 upstream files + `LICENSE`, `NOTICE`, `UPSTREAM.md`); add `.claude/skills/impeccable/** -text` to `.gitattributes`. The clone is made by the maintainer/agent into the session scratchpad with `git clone --depth 1`, and the script never fetches |
| Tests | Covered by T2. Here: run the script twice and get identical output (idempotence) |
| Falsifier | Edit one byte of the scratch clone's `reference/audit.md` and re-run → the T2 hash test fails naming `reference/audit.md`. Dirty the clone → the script exits non-zero with "dirty". Pass `--commit` ≠ HEAD → it exits non-zero |
| Red run | `predicted — greenfield artifact (observed in T1)`: before the run, `ls .claude/skills/impeccable` → `No such file or directory` (observed at baseline); the script's refusal reds are observed and quoted in `execution.md` |
| Disqualifier | The tree was produced by any means other than the script (a hand copy); `git diff --stat` shows any file outside `.claude/skills/impeccable/`, `scripts/sync-impeccable.js` or `.gitattributes`; `scripts/bin/` exists; the `.cmd` loses CRLF in `git show :…/impeccable.cmd \| file -` |
| Consumers | `package.json` `files` (must not ship the script: the list is explicit and has no `scripts/sync-*`); P-9 count tests (red until T8) |
| Review | `full`: a supply-chain boundary and licensing text |
| Done criteria | Tree present; `git ls-files -s …/scripts/impeccable` → `100755`; `UPSTREAM.md` lists 58 hashes; the second run produces no diff; the refusal reds are quoted in `execution.md` |
| Skills | `software-architect` (dependency boundary) |

### T2b: Installer foreign rule for `impeccable` on targets without an ownership record

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S–M (~60 LOC code + ~40 LOC tests) |
| Origin | Pivot P-7, Option A, approved by JC 2026-10-30 11:56 (UTC-5) |
| Depends on | T1 |
| Requirements | FR-3 (foreign clause, the five-target bullet, the "Developer already has Impeccable" scenario); NFR-1 |
| Design | §7.4 *Installer (T2b)* row; P-7 (as amended) |
| Scope | `bin/akili.js` only: in `installTool`, when the target has no ownership record, pass `copyDirectoryContents(SOURCE_SKILLS, …)` a policy that judges only the `impeccable` entry (owned = existing folder holds `UPSTREAM.md`; foreign = skip whole, `skip foreign <path>` plus the version from its `SKILL.md` frontmatter when readable; takeover on `install --force` = move aside, copy, delete the aside copy, restoring it on a failed copy). Every other entry and every target with an ownership record keep today's behavior. Tests go in a new `test/install-impeccable-foreign.test.js` |
| Tests | Claude Code `--local`: (1) foreign `impeccable/` (no `UPSTREAM.md`, `version: 4.9.0`) → bytes unchanged, no file added, output `skip foreign … 4.9.0`; (2) same with `--force` → folder equals the vendored tree, no developer-only file left; (3) an AKILI copy (holds `UPSTREAM.md`) → today's `skip existing`; (4) another skill's existing folder → today's behavior unchanged |
| Falsifier | Remove the policy from the no-ownership-record path → tests (1) and (2) go red: a file is added to the foreign folder, and a developer-only file survives `--force` |
| Red run | Run tests (1) and (2) against `62d999f` (before T2b) and quote the failing assertions |
| Disqualifier | Any other skill's or target's install output or written bytes change (run the existing install suites: `install-cursor`, `install-grokbot*`, `install-codex*` as present); the policy matches a name other than `impeccable` |
| Consumers | `test/install-*.test.js` suites (must stay green except the T8-owned counts); the doctor-codex baseline fixture (T8) |
| Review | `full` (installer safety, data-loss surface) |
| Done criteria | Tests (1)–(4) green; red run quoted; the existing install suites show no new failure |
| Skills | `tdd` |

### T2: Vendor and install locks (`test/impeccable-vendor.test.js`)

| Field | Value |
|---|---|
| Status | `[~]` (Pivot P-7 settled: Option A; resumes after T2b) |
| Size | M (~220 LOC test) |
| Depends on | T1, T2b (amended 2026-10-30, Pivot P-7, Option A approved by JC 11:56 UTC-5) |
| Requirements | FR-1 "Verbatim check" scenario (BUT no unlisted file; AND IT MUST Apache header); FR-2 "Local edit creeps in" scenario; FR-3 delivery to six targets + exec bit + doctor count; NFR-2, NFR-4, NFR-6 (script not shipped) |
| Design | §7.4 row 1 and the install row; DD-3, DD-6; P-6, P-7, P-11, P-15 |
| Scope | New test file: hash every `UPSTREAM.md` line (`SKILL.md` with the metadata block removed); unlisted-file check; no `scripts/bin/`; `LICENSE` starts with `Apache License` and `Version 2.0`; `NOTICE` has `ehmo`, the commit and `not affiliated`; frontmatter keeps the 6 upstream keys plus `binding: conditional`; file count = `UPSTREAM.md` lines + 3; launcher mode `0755` (skip on win32 with a printed reason); `.cmd` contains `\r\n`; `install --tool <t> --local` into a temp dir for all six targets → `impeccable/{SKILL.md,LICENSE,UPSTREAM.md}` present and the launcher executable (POSIX); a pre-seeded foreign `impeccable/` on Grok Bot **and on Claude Code** is untouched and reported as foreign without `--force`, and replaced whole with `--force` (amended 2026-10-30, Pivot P-7, Option A approved by JC 11:56 UTC-5) |
| Tests | This task *is* the test; run `node --test test/impeccable-vendor.test.js` |
| Falsifier | (a) Append a space to vendored `reference/polish.md` → the hash assertion names it. (b) Add `.claude/skills/impeccable/extra.md` → the unlisted-file assertion fails. (c) `chmod 644` the launcher → the mode and install assertions fail. (d) Delete `metadata.binding` → the frontmatter assertion fails. Each mutation is executed against the post-T1 tree and reverted |
| Red run | `predicted — greenfield artifact (observed in T2)`: run the new test before T1's tree exists (on a stash of T1) and quote the first failing assertion verbatim in `execution.md` |
| Disqualifier | The test passes while any falsifier (a)–(d) is applied; the install loop covers fewer than six targets; the hash is computed over a normalized (CRLF→LF) buffer, so it is blind to the `.cmd` |
| Consumers | none (new file) |
| Review | `full` |
| Done criteria | Green on the T1 tree; reds (a)–(d) quoted; **P-15 HITL check**: the maintainer confirms Claude Code lists `impeccable` from a scratch install (recorded in `execution.md`, owner T2) |
| Skills | `tdd` |

### T3: Rewrite `impeccable-bridge/SKILL.md` as the AKILI layer

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~200 LOC prose) |
| Depends on | T1 |
| Requirements | FR-4 (both state tables, the "Cached npm CLI only" scenario + its BUT), FR-5 (all clauses, pre-approved stop, "Consent declined" scenario), FR-6, FR-7 (table, stderr line, exit-1 findings), FR-8, FR-9 (steps 1–3, capture conditions, D-2, flag rejection, both scenarios), FR-12 (row shape, matching, `unused`, Proposed, D-3, scenario), FR-14 bridge clause |
| Design | §3, §7.1, §7.2 (whole table), DD-4, DD-5, DD-8, DD-10; P-3, P-4, P-5, P-14 |
| Scope | `.claude/skills/impeccable-bridge/SKILL.md` only: *Roles* (vendored `impeccable` leads); *Step 0* → skill source + engine probe/consent (the §7.1 order, the `IMPECCABLE_BIN` pin, the consent fields with "about 17 MB (darwin-arm64; other platforms similar)", P-14); the §7.2 consumer table; the detector gate (launcher form, `DO_NOT_TRACK=1`, scan matrix, first-visit pass, FR-7 table); Design Waivers; privacy (direct `/impeccable` disclosure, R1); install routes reworded as optional; *Fallback* keyed to `missing`; attribution updated (vendored copy, Apache-2.0, not affiliated); frontmatter `description` updated; `version` bumped to `2.0` |
| Tests | T8 amends `impeccable-bridge.test.js` |
| Falsifier | Reorder the gate so `context` may run before consent → T8's ordering assertion fails; delete the `declined` row → T8's state assertion fails; replace the launcher form with `npx impeccable detect` → the negative sweep fails |
| Red run | Baseline observed: `grep -c "engine-probe" .claude/skills/impeccable-bridge/SKILL.md` → `0`; `grep -c "skill only" …/SKILL.md` → `1` (pre-change, run 2026-10-30) |
| Disqualifier | A §7.2 row present in the design but absent here (checked cell by cell, per the "design table keeps every cell's obligations" rule); any rule restated with a different wording in a command after T5/T6; any line-number pointer (KZ-005) |
| Consumers | `test/impeccable-bridge.test.js` (pins current wording: amended in T8); the commands of T5/T6 (they point here) |
| Review | `full` (rules document, two rounds budgeted) |
| Done criteria | Every FR/clause listed above is quoted to its sentence in `execution.md`; the falsifiers run after T8 |
| Skills | `impeccable-bridge`, `cognitive-doc-design` |

### T3b: Switch off the engine update check in every AKILI launcher run

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | XS (~10 LOC prose) |
| Origin | P-13 settled false at T7; option (ii) approved by JC 2026-10-30 12:13 (UTC-5) |
| Depends on | T3 |
| Requirements | FR-6 (as amended: `IMPECCABLE_NO_UPDATE_CHECK=1` beside `DO_NOT_TRACK=1` on the detector and on every other launcher run, including Setup's `context`); NFR-1 |
| Design | §11 P-13 (settled) |
| Scope | `.claude/skills/impeccable-bridge/SKILL.md` (the *Launcher form* command block and the *Privacy and consent* prefix rule; Windows wording for setting both variables); `docs/skills/impeccable.md` (the *Consequence* sentence: AKILI runs set the switch). No other file |
| Tests | T8 asserts the prefix in the bridge |
| Falsifier | Drop `IMPECCABLE_NO_UPDATE_CHECK=1` from the bridge's launcher form → T8's launcher-form assertion fails |
| Red run | Baseline observed 2026-10-30: `grep -c "IMPECCABLE_NO_UPDATE_CHECK" .claude/skills/impeccable-bridge/SKILL.md` → `0` |
| Disqualifier | A launcher example or prefix rule in the bridge that still carries `DO_NOT_TRACK=1` alone; the docs claiming the update check is off without naming the switch |
| Consumers | `test/impeccable-bridge.test.js` (T8); the commands point at the launcher form and restate no command string |
| Review | `checklist` |
| Done criteria | `IMPECCABLE_NO_UPDATE_CHECK` present in both bridge sites and in the docs sentence; no `DO_NOT_TRACK=1`-only launcher form left |
| Skills | `impeccable-bridge` |

### T4: Extend `references/design-evaluation.md`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S–M (~120 LOC prose) |
| Depends on | T3 |
| Requirements | FR-10 (resolution order, ≥3 runs, median/range, spread clause, concurrency, Q2, "Bimodal score" scenario + BUT), FR-11 (items 1–3, non-git, "Redesign after the baseline" scenario), FR-13 (every row of the field table, user-directed location in the checklist), FR-14 reference clause |
| Design | §5.4, §7.2 audit row; DD-9 |
| Scope | E-steps: E0 (skill source + engine gate), E1 (baseline checks), E3 (scan matrix + first-visit by pointer to the bridge), new performance step, E6 (location override); report template fields and tables; checklist |
| Tests | T8 |
| Falsifier | Remove the `Unevaluated (Lighthouse unavailable)` clause → T8 assertion fails; replace "at least 3" with "a" → T8 fails |
| Red run | Baseline observed: `grep -c "median" …/design-evaluation.md` → `0`; `grep -c "Score source" …` → `0` (run 2026-10-30) |
| Disqualifier | A field of the FR-13 table missing from the template; the performance step can run with a delegated agent active; any restatement of a bridge rule instead of a pointer |
| Consumers | `test/impeccable-bridge.test.js` (paths and template assertions); `docs/commands/akili-audit.md` (T7) |
| Review | `full` |
| Done criteria | Clause-to-sentence map in `execution.md` |
| Skills | `impeccable-bridge`, `cognitive-doc-design` |

### T5: Wire validate, test and audit commands

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~60 LOC prose, 3 files) |
| Depends on | T3 |
| Requirements | FR-4 consumers clause (validate, test, audit rows); FR-6 (no `npx` form); FR-8 (validate + test passes); FR-9 (validate, D-2 HITL fold check + `WARN`); FR-10 Q2 (validate gains no performance gate); FR-14 "point, don't restate" |
| Design | §7.2 rows test/validate/audit; DD-9 |
| Scope | `.claude/commands/akili-validate.md` (*UI design review*), `akili-test.md` (detector suite bullet), `akili-audit.md` (*Design Evaluation Mode* items 1 and 4, verification checklist) |
| Tests | T8 |
| Falsifier | Leave `npx impeccable detect` in `akili-test.md` → the negative sweep fails; drop the D-2 `WARN` from validate → T8 fails |
| Red run | Baseline observed: `npx impeccable detect` → 3 hits across these three files; `Unevaluated (Impeccable absent)` → 2 hits (`akili-audit.md`, `akili-validate.md`) (run 2026-10-30) |
| Disqualifier | Any state value of §7.2 with no stated consequence in a step that branches on it (KZ-004); a restated command string |
| Consumers | `test/impeccable-bridge.test.js` (regex `Exit \`0\` passes; exit \`2\` is \*\*FAIL\*\*` on validate: amended in T8) |
| Review | `checklist` (three short edits against a fixed table) |
| Done criteria | The sweep for these three files reads 0/0; the per-row map is in `execution.md` |
| Skills | `impeccable-bridge` |

### T6: Wire constitution, specify, propose and the fallback skills

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~50 LOC prose, 5 files) |
| Depends on | T3 |
| Requirements | FR-4 consumers clause (constitution, specify, execute-via-tasks rows); FR-12 constitution writes the row shape; FR-14 point-not-restate; DD-10 |
| Design | §7.2 rows constitution/specify/propose/execute; DD-10 |
| Scope | `akili-constitution.md` (*Lead design skill* bullets, Design Waivers row shape), `akili-specify.md` (Step 2.1 bullets), `akili-propose.md` (Mockup Fallback + Visual Reference wording), `.claude/skills/ui-ux-pro-max/SKILL.md` and `frontend-design/SKILL.md` ("installed/absent" → skill source `missing`) |
| Tests | T8 |
| Falsifier | Keep "`installed` or `skill only`" in specify → the negative sweep fails |
| Red run | Baseline observed: `grep -c "skill only" .claude/commands/akili-{constitution,specify}.md` → `1` each (run 2026-10-30) |
| Disqualifier | A step left with three-state wording; the waiver row shape differing from FR-12's five columns |
| Consumers | `test/impeccable-bridge.test.js` ("ui-ux-pro-max no longer leads" assertion on constitution: kept green) |
| Review | `checklist` |
| Done criteria | The sweep for these five files reads 0; the map is in `execution.md` |
| Skills | `impeccable-bridge` |

### T7: Governance, docs, README and counts

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~170 LOC prose, ~10 files) |
| Depends on | T1, T3 |
| Requirements | FR-14 governance, attribution and disclosure clauses; FR-2 release-checklist step; NFR-2 (no implied affiliation); NFR-7 |
| Design | §9; DD-1, DD-7; P-9, P-10, P-13 |
| Scope | `docs/skills/governance.md` (new category; move Impeccable; supersession note; current-assignment row); new `docs/skills/impeccable.md`; `docs/skills/{README,impeccable-bridge,ui-ux-pro-max,frontend-design}.md`; `docs/overview.md` (skills table + the environment row); `docs/commands/akili-audit.md`; `docs/cli.md` (4 × "30 packaged skills" → 31); `README.md` (third-party component line); `docs/release-checklist.md` (upstream pin step). **P-13 settled here**: read upstream `docs/` for update-check/telemetry behavior and cite it in `docs/skills/impeccable.md`, or keep the row `UNVERIFIED` with that disclosure |
| Tests | T8 (docs-overview inventory, cli count, negative sweep) |
| Falsifier | Omit `impeccable` from `docs/overview.md` → `docs-overview.test.js` (a) fails; leave one "30 packaged skills" → `akili-marketing-docs.test.js` fails after T8 |
| Red run | Baseline observed: `grep -c "30 packaged skills" docs/cli.md` → `4` (lines 327, 339, 360, 377; run 2026-10-30) |
| Disqualifier | An aggregate claim ("31 skills", "every target") not falsified by a grep run in the same session (KZ-002); attribution naming AKILI as the author of Impeccable |
| Consumers | `test/docs-overview.test.js`, `test/akili-marketing-docs.test.js` |
| Review | `full` (governance is a rules document) |
| Done criteria | All docs tests green after T8; the P-13 outcome recorded |
| Skills | `cognitive-doc-design` |

### T8: Test amendments and the negative sweep

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~280 LOC tests + fixture) |
| Depends on | T2, T3b, T4, T5, T6, T7 |
| Requirements | FR-11 scenario "No surviving old phrasing" (FR-14 version: four patterns, zero hits); FR-4 consumer clause; FR-7; FR-8/FR-9 presence; FR-12 D-3; NFR-5, NFR-6 |
| Design | §7.4 rows 2 and 4; DD-9; P-9 |
| Scope | `test/impeccable-bridge.test.js` (replace the FR-3/FR-4 detection test; add the gate-order, exit-table, matrix, D-2, D-3 assertions; per-command engine-consequence assertions; a negative sweep over `.claude/` + `docs/` + `README.md`, excluding `docs/specs/` and `.claude/skills/impeccable/`, for `npx impeccable detect`, `Unevaluated (Impeccable absent)`, `skill only`, `never copies Impeccable`); `test/install-cursor.test.js` (247 → computed 308, i.e. 247 + 58 + 3; 30 → 31; comments); `test/akili-marketing-docs.test.js` (30 → 31); `test/fixtures/doctor-codex-baseline.txt` (+ `OK impeccable` in sorted position) |
| Tests | `npm test` |
| Falsifier | Re-insert `npx impeccable detect` into `akili-test.md` → the sweep names the file and line; set the cursor count back to 247 → `install-cursor` fails |
| Red run | Observed at baseline: the sweep patterns hit 6 / 3 / 9 / 1 (Document Control). The new sweep assertion is run against the pre-T5 tree and its failure message quoted in `execution.md` |
| Disqualifier | A sweep whose exclusion list hides a consumer (e.g. excluding all of `docs/`); a count updated to a literal without the computing comment; a test reading `docs/specs/changes/…` |
| Consumers | All P-9 files (listed in Scope) |
| Review | `checklist` |
| Done criteria | `npm test` green; every pattern at 0 outside the exclusions |
| Skills | `tdd` |

### T9: CHANGELOG, full verification and the re-walk

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~40 LOC + verification) |
| Depends on | T8 |
| Requirements | NFR-6 (all four commands + `install --tool all --dry-run`), NFR-4 (measure the size), NFR-1, requirements §8 substitute: the re-walk plus one held-out case |
| Design | §12 budget comparison |
| Scope | `CHANGELOG.md` `Unreleased` (minor-level entry: vendored Impeccable 4.8.0 with license, engine consent gate, gates and fields, governance change, supersession of the `impeccable-design` NFR-1, the R1 disclosure); run `npm test`, `npm run verify:cli`, `npm run pack:dry-run` (record unpacked size delta ≤ +2.5 MB), `git diff --check`, `node bin/akili.js install --tool all --dry-run` (lists `impeccable`), `node bin/akili.js doctor --tool all`. **Re-walk**: walk the 2026-10-30 run against the shipped text, step by step, plus the held-out case (a `user-installed` skill on a project with no `design.md`), each judged against the general sentence with examples stripped |
| Tests | the suite |
| Falsifier | The pack delta exceeds +2.5 MB → NFR-4 fails and is reported as such, never rounded; a re-walk step that needs a rule the text does not hold → a Pivot, not a pass |
| Red run | n/a: verification task; the reds live in T1–T8 |
| Disqualifier | Measurement run while a delegated agent is active (AGENTS.md *Concurrency*); a re-walk that cites only cases named in the text |
| Consumers | none |
| Review | `full` (the re-walk is judgment) |
| Done criteria | All commands green with outputs quoted; budget actuals vs §12 recorded; the re-walk verdict at the HITL pause |
| Skills | `cognitive-doc-design` |

## Coverage map (clause level)

| Requirement clause | Owner |
|---|---|
| FR-1 tree, 3 AKILI files, frontmatter keys, no `scripts/bin/`, Verbatim scenario + BUT + AND IT MUST | T1 (produce), T2 (lock) |
| FR-2 script behavior, refusals, no download | T1; "Local edit" scenario T2; release-checklist step T7 |
| FR-3 six targets, exec bit, foreign skip, doctor count, "Developer already has Impeccable" scenario | T2 (presence/mode/six targets); foreign behavior: T2b (installer, five targets without an ownership record) and the existing policy (Grok Bot), asserted by T2 with a pre-seeded foreign `impeccable/` on Grok Bot and on Claude Code (amended 2026-10-30, Pivot P-7, Option A approved by JC 11:56 UTC-5) |
| FR-4 tables, consumers clause, not persisted, scenario + BUT | T3 (bridge), T5/T6 (consumers), T8 (assertions) |
| FR-5 all clauses, pre-approved, scenario | T3, T8 |
| FR-6 launcher form, no `npx` without `--no-install`, routes as advice | T3, T5, T8 sweep |
| FR-7 table, stderr, exit-1 findings | T3, T8 |
| FR-8 two passes, test suite, `design.md` override, source single pass | T3, T5 |
| FR-9 steps 1–3, capture, D-2 HITL + WARN, flag rejection, both scenarios + BUT | T3, T5 (validate), T4 (audit pointer) |
| FR-10 all clauses + scenario + BUT | T4; Q2 in T5 |
| FR-11 items 1–3, non-git, scenario | T4 |
| FR-12 row shape (constitution), matching, `unused`, Proposed, D-3, scenario + BUT + AND IT MUST | T3, T6 (constitution), T4 (template header) |
| FR-13 every field, location in checklist | T4 |
| FR-14 bridge, reference, commands, governance, attribution, disclosure, scenario | T3, T4, T5, T6, T7, T8 |
| NFR-1 | T3 (gate), T9 (verification) |
| NFR-2 | T1, T2, T7 |
| NFR-3 | T3 (flag-rejection text) |
| NFR-4 | T2 (file count), T9 (size) |
| NFR-5 | Disqualifier in T3–T7 |
| NFR-6 | T8, T9 |
| NFR-7 | T7, T9 |
| Requirements §8 substitute (re-walk + held-out) | T9 |
