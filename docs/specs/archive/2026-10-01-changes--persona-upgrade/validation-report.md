# Validation Report — Give Deployed Personas an Upgrade Path

**Verdict: archive-ready.** 14/14 tasks `[x]` with Reviewer `PASS`; `npm test` 69/69; every FR clause has code or prose evidence. The one FAIL found (FR-4's literal "any byte" vs design §5.1's majority-EOL writer, reproduced on a mixed-EOL persona) was **resolved at this gate by the user's choice: requirements amendment A10** with correction closure (`requirements.md`, `docs/cli.md`, `CHANGELOG.md`). A second spec-internal conflict found while exercising the §8 gate (FR-4 "twice" vs FR-5's `outdated`-after-migration scenario) was closed the same way (**A11**; `design.md` §5.4, `docs/cli.md`). Seven WARNs remain, each with a named route; none blocks.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/persona-upgrade` |
| Validated at | `00ccaee` (HEAD, `master`, 20 commits ahead of `origin/master`, tree clean), 2026-10-01 |
| Validator model | Fable 5.1 (T3 Auditor). Implementer ran on `sonnet`, Reviewers on `opus` — author ≠ auditor holds. No `## Model Routing` registry exists in this repo's `AGENTS.md`; nothing to compare |
| Inputs | `proposal.md`, `requirements.md`, `design.md`, `tasks.md`, `execution.md`, `closure.md`, `judgment.md`. **No `test-report.md`** — `/akili-test` was not run (execution.md §3: FR-9's own suite is the gate); coverage was verified directly from `npm test` and the closure walks |
| Constitutional docs | Root `AGENTS.md` / `CLAUDE.md` only. This repo has no `docs/prd.md`, `docs/trd/`, `docs/ux-ui/`, `docs/specs/general-setup/` (as `requirements.md` Document Control states) |
| Method | Every closure claim re-run or spot-checked on this checkout; every open item reproduced in a temp dir; obligation-keyed greps re-run; nothing in `.agents/` or `bin/` written |

## 2. Summary

| Area | Result | Note |
|---|---|---|
| Task completion | **PASS** | 14/14 `[x]`, each with a closing record, Reviewer `PASS`, Leader re-run `VERIFIED` |
| File existence | **PASS** | Every file in design §4/§7 exists; three extras (`persona-digests.test.js`, 21 fixtures vs "seven") are additive |
| Build integrity | **PASS** | `npm test` 69/69 · `verify:cli` ok · `pack:dry-run` ok (277 files) · `git diff --check` clean. No lint/type-check script exists (gap noted) |
| Requirement coverage | **0 FAIL (1 found, resolved by A10) · 4 WARN · rest PASS** | Resolved: FR-4/NFR-4 "any byte" vs majority-EOL writer (A10); FR-4 "twice" vs FR-5 migration scenario (A11). WARNs: FR-4 untracked-tree guard, FR-10 bullet 1 vs DD-11, FR-9 CI legs unrun, FR-6 Step 8B digests-absent fallback |
| Quality audit | **PASS** (advisories) | 4R sweep: 3 advisory notes; 11 execution advisories carried forward |
| Design conformance | **PASS** with 2 WARN | Code follows the design everywhere; the two WARNs are design-vs-requirement conflicts the spec itself never resolved |
| Constitution impact | **WARN** | T2/T5 impact notes not yet synced into `AGENTS.md` — pending for `/akili-archive` as the log says |

Counts at report time: **1 FAIL · 8 WARN · 0 BLOCKED**. After the gate: **0 FAIL · 7 WARN** (R1 resolved by A10, R8 executed, R10 found and resolved by A11). Remediation items: 10 (§11).

## 3. Task Completion

| Task | Status | Attempts | Reviewer | Leader re-run | Result |
|---|---|---|---|---|---|
| T1a implementer.md markers | `[x]` | 1 | PASS | VERIFIED | **PASS** |
| T1b reviewer.md markers | `[x]` | 1 | PASS | VERIFIED | **PASS** |
| T1c tester.md markers | `[x]` | 1 | PASS | VERIFIED | **PASS** |
| T1d leader.md markers (+NFR-3 total) | `[x]` | 1 | PASS | VERIFIED | **PASS** |
| T2 parser · states · report | `[x]` | 3 of 3 | PASS | VERIFIED ×3 | **PASS** |
| T2b fixture `.gitattributes` (execute-time) | `[x]` | 1 | PASS | VERIFIED | **PASS** |
| T3 fix · guards · backup | `[x]` | 2 (+1 continuation) | PASS | VERIFIED ×2 | **PASS** |
| T4 migration | `[x]` | 3 of 3 | PASS | VERIFIED ×2, MISMATCH ×1 (caught) | **PASS** |
| T5 digests · release step · install | `[x]` | 2 (+1 continuation) | PASS | VERIFIED ×2 | **PASS** |
| T6 I/O test · CI | `[x]` | 1 | PASS | VERIFIED | **PASS** |
| T7 `/akili-constitution` | `[x]` | 2 | PASS | VERIFIED ×2 | **PASS** |
| T8 `/akili-audit` | `[x]` | 1 | PASS | VERIFIED | **PASS** |
| T9 mirrors · `docs/cli.md` | `[x]` | 2 (+1 continuation) | PASS | VERIFIED ×2 | **PASS** |
| T10 CHANGELOG · closure walks | `[x]` | 3 of 3 | PASS | MISMATCH ×1 (caught), VERIFIED ×2 | **PASS** |

Harness discipline held: no `REVIEW_WAIVED`, no `REVIEW_SKIPPED`, no HALT, no Pivot; 25 of 26 review rounds; 17 `[SPEC:changes/persona-upgrade]` commits. Three Leader MISMATCHes caught defects no Reviewer had blocked on (a test reading a gitignored file; a false `EXIT: 0` claim; a worker writing to the live `.agents/`, recovered from its own backups).

## 4. File Existence

| Design §4 / §7 expectation | On disk | Result |
|---|---|---|
| `.claude/templates/{leader,implementer,reviewer,tester}.md` marked | 5/6/6/5 open+close pairs, 1 project block each; ids in §5.2 order | PASS |
| `.claude/templates/digests.json` | present, 347 kB, `version` 2.29.0, `releases {}`, `legacy` 4 roles (5/6/6/5 sections) | PASS |
| `bin/persona.js` (pure module) | present, 39 kB | PASS |
| `bin/akili.js` `doctor --agents` | present (`runAgentsDoctor`, guards, backup) | PASS |
| `scripts/release.js` digest step + `since=` rewrite | present (`writeReleaseDigests`, `assertPreBumpInvariants`) | PASS |
| `scripts/release-status.js` version drift | present | PASS |
| `scripts/ci/install-layout-regression.js` expects `digests.json` | present (`TEMPLATE_RESOURCE_NAMES`) | PASS |
| `.github/workflows/ci.yml` runs `npm test` | line 41 | PASS |
| `test/agents-doctor.test.js`, `test/agents-doctor-io.test.js` | present | PASS |
| `test/fixtures/personas/*.md` "seven fixtures" | **21** fixtures + `.gitattributes` | PASS (figure drift, see §8) |
| `package.json` `"test": "node --test"`, no dependency | present; `dependencies` `{}` | PASS |
| Not shipped: `test/` | absent from `files`; `pack:dry-run` lists no `test/` | PASS |

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | **69 pass, 0 fail**, 3.3 s |
| `npm run verify:cli` | ok — 11 commands · 24 skills · 8 resources (`templates/digests.json` listed) |
| `npm run pack:dry-run` | ok — 277 files, 2.2 MB packed / 4.3 MB unpacked; `digests.json` 347 kB, `bin/persona.js` 39 kB |
| `git diff --check` | clean |
| `node bin/akili.js doctor --tool all` | exit 1 on this machine: `digests.json` missing under three pre-existing roots (DD-11 consequence, documented in CHANGELOG); Codex root gaps pre-existing. Not a defect; see FR-10 WARN |
| Lint / type-check | **None exists** in `package.json`. Gap: recommend `"lint": "node --check bin/akili.js bin/persona.js scripts/*.js"` as the smallest useful addition (the release step already runs `node --check` on two scripts) |
| Environment boot smoke | n/a — no `docs/infrastructure.md`; CLI-only change |

## 6. Requirement Coverage

Scenario- and clause-level; every row names the evidence re-checked this validation, not only the closure's citation.

| Req | Clause / scenario | Owner | Evidence (re-checked) | Result |
|---|---|---|---|---|
| FR-1 | every owned block fenced; ids stable kebab-case unique; `since` | T1a–d | 22 `id=` across 4 files, no duplicate; `parsePersona` flags dup ids | PASS |
| FR-1 | *A persona is rendered* — "AND IT MUST read exactly as the unmarked template did" | T1a–d | marker-stripped diffs recorded per task (only the one precedence bullet, itself FR-2's requirement) | PASS |
| FR-1 / NFR-3 | growth ≤ 2,200 bytes | T1d | `wc -c` → 74,391 (72,221 + 2,170; cap 74,421) | PASS |
| FR-2 | one project block per template, after primary instructions | T1a–d | 1 open marker per file, positioned after items | PASS |
| FR-2 | *Injection scope* names the block for every injection | T7 | `akili-constitution.md:426` lead sentence | PASS |
| FR-2 | *Injected test command* — "BUT the replaced section must NOT hold a test command of its own" | T1a/T1c, T3 | T1c whole-file read; Walk 2 project-block preservation case | PASS |
| FR-3 | nine section states + `.agents/` absent; exit-code rule | T2 | Walk 1 11/11 incl. held-out H1; `EXIT_ZERO_STATES` in code | PASS |
| FR-3 | *v2.29.0 persona* — "BUT it must NOT report any section as `custom-edited`" | T2, T5 | `pre-marker-old-scaffold` → all `UNMARKED`; `v2.29.0-template-verbatim.md` fixture is `cmp`-identical to the tag | PASS |
| FR-3 | *Two tools* — "AND IT MUST give the same states whichever `--tool`" | T2 | CLI test 18 compares 22 stripped rows per run (red recorded on `deepEqual` under a tool-dependent mutation) | PASS |
| FR-3 | digest of every section at every release and every tagged release | T5 | 1,199 legacy entries, 73/73/48/73 tags; Reviewer regenerated the table from tags identically | PASS |
| FR-4 | replace `outdated`, insert `missing`, migrate `unmarked`, install `absent` | T3, T4 | Walk 2 16/16; my temp-dir run: `outdated` fixture → `FIXED`, second run exit 0 | PASS |
| FR-4 | *Hand-edited* — "BUT the file must NOT be written before its backup exists" | T3, T6 | I/O test with read-only target: backup exists, persona unchanged, exit ≠ 0; red recorded under swapped order | PASS |
| FR-4 | *Idempotence* — "AND IT MUST report no section as `outdated` or `missing`" | T3 | second run exit 0 in Walk 2 and in my run | PASS |
| FR-4 | `--dry-run` runs every guard, prints plan, writes nothing | T3 | Walk 2; T3 attempt 2 (both `REFUSED` rows under dry-run) | PASS |
| FR-4 | branch guard (kaizen resolution; unresolved refuses) | T3 | guard-matrix tests on real git, both directions; Walk 2 `feature-x` refused | PASS |
| FR-4 | **"SHALL NOT change any byte of project space"** | T3 | **Reproduced this validation:** LF-majority persona with a CRLF project block (3 CR bytes) → after `--fix` 0 CR bytes. Design §5.1 sanctions the majority-EOL writer; FR-4's literal text forbade it. `projectSpaceOf` in the test joins split lines, so no test can see it | **FAIL → resolved** by A10 (user chose the amendment; R1) |
| FR-4 | "Running it twice SHALL leave the second run with nothing to do" | T3, T4 | **Observed on this repo's `.agents/` (R8):** run 1 migrated (fenced 19 sections to older releases), run 2 replaced 14 `OUTDATED`, run 3 clean. FR-5's own scenario requires `outdated` after migration, so the two clauses contradicted each other; code follows FR-5 | **FAIL → resolved** by A11 (R10) |
| FR-4 | dirty-tree guard "when `.agents/` is git-tracked with uncommitted changes" | T3 | **Reproduced:** an *untracked* `.agents/` is `REFUSED (dirty tree…)`. Conservative direction, `--force` overrides; DD-12's literal `git status --porcelain` does this by construction | WARN (R2) |
| FR-5 | exact → heading+opening-sentence; heading alone never fences; extent by level | T4 | 60-test suite; `review-output` extent test; STAR case 2 heading / 4 not located | PASS |
| FR-5 | *Older scaffold* — fenced by exact match, reported `outdated` | T4, T5 | Walk 3: 5× `OUTDATED` with named releases + 1× `UNLOCATED` | PASS |
| FR-5 | *Rewritten persona* — "BUT it must NOT delete, move or reorder any line"; "AND IT MUST keep the front matter as the first bytes" | T4 | no-reorder test compares full line array; marker-stripped diff empty on both real copies | PASS |
| FR-5 | project block position; migration record before it | T4 | H3 and STAR: record at 59, block 60–61 of 61 | PASS |
| FR-6 | Safe Update: migrate / replace / insert / report; no append; injections once | T7 | `akili-constitution.md:424`, `:426` read in full | PASS |
| FR-6 | *Marked persona* — "BUT it must NOT rewrite the project block" | T7 | same bullet: "never rewrite the project block or any other project space" | PASS |
| FR-6 | by-hand fallback "from the installed templates and their digests" | T7 | present; says nothing for *digests absent* (H4). CLI degrades to `custom-edited` safely; prose does not say so | WARN (R7) |
| FR-7 | audit item (c) reports `outdated`/`missing`/`unmarked` with the fixing command | T8 | `akili-audit.md:60` read in full; `never an overwrite` → 0; `:59(c)` → 0 | PASS |
| FR-8 | CHANGELOG entry; ids named; no hand recipe; classification | T10 | entry read; 22 ids listed; `minor` | PASS |
| FR-8 | sweep: no surviving "append"/"never overwrite" sentence | T7, T9 | my sweep: 2 hits, both negations of the old rule (`:424`, `docs/cli.md:254`) | PASS |
| FR-8 | inline-draft path drafts with markers + project block | T7 | `akili-constitution.md:418` | PASS |
| FR-8 | `docs/cli.md` is the one home of grammar + states | T9 | 9 state names present; mirrors cite the page | PASS |
| FR-9 | `npm test` with `node:test`, no dependency | T2 | `package.json`; `dependencies {}` | PASS |
| FR-9 | seven fixture kinds | T2–T4 | all seven kinds present among 21 fixtures | PASS |
| FR-9 | red before green per test | T2–T6 | recorded per task after rework (T2 r1, T3 spawn 1, T4 r1, T5 spawn 1 each lost a round on this; closed) | PASS |
| FR-9 | CI runs the script | T6 | `ci.yml:41`; **20 commits unpushed — no CI run yet**; `node --test` discovery on Node 18 `UNVERIFIED` | WARN (R5) |
| FR-10 | project that never runs the command is unaffected; `doctor` without `--agents` unchanged | T10 | code path unchanged; **reported outcome changed** by DD-11 (pre-existing install → `INCOMPLETE` until `akili update`). Documented in CHANGELOG; spec text not amended | WARN (R6) |
| FR-10 | reversible from backup; report names it | T3 | every write prints `BACKUP <path>` | PASS |
| NFR-1 deterministic | — | sha256 compares; no network in path | PASS |
| NFR-2 no dependency | — | `git diff 1cc75a0 HEAD -- package.json` → only `test` script | PASS |
| NFR-4 never destructive | — | backup `wx` before atomic write; **mixed-EOL case above is the one exception** | see FR-4 FAIL |
| NFR-5 tool-agnostic | — | four roots supported; states independent of `--tool` | PASS |
| NFR-6 defined once | — | grammar/states only in `docs/cli.md` (Reviewer check 2) | PASS |
| NFR-7 no line pointers in shipped prose | — | `grep -E '\.md:[0-9]+'` over the four prose surfaces → 0 | PASS |

**Requirements §8 accepted-risk gate** — "the first Safe Update run on this repository's own `.agents/` after the change" — **exercised at this gate (R8, 2026-10-01)** on the user's instruction. `--dry-run` → `--fix` → `--fix` → report: run 1 fenced 19 sections (18 exact, `delegation` by heading) and recorded `shared-file-discipline` ×2 as not located; run 2 replaced 14 `OUTDATED` (matched releases v0.7.0–v2.25.0) and skipped `delegation` (`custom-edited`) and the two `unlocated`; run 3 → 19 `CURRENT`, 1 `CUSTOM-EDITED`, 2 `UNLOCATED`, exit 0. Backups at `.agents/.backup/*.20261001-064420` and `*.20261001-064509`; `.agents/.gitignore` created; `.agents/` stays gitignored. Nothing appended, no project space touched. Maintainer follow-ups (not owed by this spec): `--section shared-file-discipline` to insert the missing guardrail in `leader.md`/`implementer.md`; review `leader.md`'s heading-fenced `delegation`. **PASS.**

## 7. Linting & Code Quality

No lint or type-check script exists (§5). `node --check` passes on `scripts/release.js` and `scripts/notify-slack.js` (closure, re-run by Leader).

**4R lens sweep — advisory only (not spec violations):**

| Lens | Finding | Advisory |
|---|---|---|
| Reliability | A migrated persona with nothing fenced ends without a trailing newline (`tail -c 1` → `>`). Reproduced this validation. Replacement on a marked persona keeps the newline. No original byte is lost (the original trailing `\n` precedes the record); the new file simply lacks a final newline | Add `eol` after the appended project block in the nothing-fenced branch (R9) |
| Readability | `docs/cli.md:324` and `:326` begin paragraphs with the literal word "Advisory:" — review vocabulary leaked from the Leader's brief tag | One-word edit via `/akili-quick` (R4) |
| Readability | `akili doctor --help` lists none of `--agents`, `--section`, `--allow-branch` | Static help text, ≤ 20 LOC — `/akili-quick` eligible (R3) |
| Risk | `digests.json` is 347 kB — the largest single packaged file (package 2.2 MB packed). Dense object entries grow it ~22 × 3 hashes per release | Efficiency note only; no action owed |
| Risk | Guards fail open when `git` itself errors (`tryGit` → null → "not a git checkout") | Carried from T3 advisories; backup still protects |

**Unresolved `ADVISORY` findings carried from `execution.md`** (none became work, per the scope rule): role-scoped digest slice comment (closed by T5); strict marker regex treats malformed `<!-- akili:` lines as text (open); `readConstitutionPins` regex unanchored (open); monorepo `.agents/` in a subdirectory trips the dirty guard (open); same-second backup `EEXIST` crashes uncaught (open); `--section` on an id that is `current`/unknown is silently ignored (open); `loadTemplates` silent fallback (documented in `docs/cli.md`); top Options table of `docs/cli.md` stale for this mode (open); "22 section ids" counts per-template ids — 19 distinct (open).

## 8. Design Conformance

| Design element | Implementation | Result |
|---|---|---|
| §5.1 grammar; `unreadable` causes | `parsePersona` flags every cause incl. project-block nesting/order (T2 r2 Reviewer walked all orderings) | PASS |
| §5.2 ids and extents; `primary-instructions` as one block | `extentLevelFor` override; leader test `fenced (exact)` all five | PASS |
| §5.3 `{body, head, open}` entries in both tables | 1,199 object entries; `sectionDigestEntry` single builder | PASS |
| §5.4 state → action table | one branch per row; unknown state throws | PASS |
| §6 CLI surface | all flags present; `--help` text not updated (R3) | PASS / advisory |
| §7 functions in `bin/persona.js` | all present + `migratePersona`, `seedLegacySections`, `extentLevelFor` | PASS |
| DD-3 release step | dense entry, `since=` rewrite with `v` prefix (fixed T5 r2), hint = write set, pre-bump asserts | PASS |
| DD-5 backup name `<role>.md.<YYYYMMDD-HHMMSS>` | fixed in T3 continuation | PASS |
| DD-11 `digests.json` as resource | installer, `doctorTool`, `list`, layout check | PASS |
| DD-12 kaizen branch resolution | `resolveBranchContext`; unresolved refuses | PASS |
| **§5.1 "majority line ending" vs FR-4 "any byte"** | code follows §5.1 | conflict → FR-4 amended (A10, R1) |
| **§5.4 "second run exits 0" vs FR-5 `outdated` after migration** | code follows FR-5 | conflict → FR-4 and §5.4 amended (A11, R10) |
| **§6 "Byte-for-byte the old behavior" + FR-10 bullet 1 vs DD-11** | code follows DD-11 | **conflict → WARN (R6)** |
| Proposal alignment | Option B delivered; §11 defaults honored (HTML comments, item granularity, project block, backup + `--section`, migration inside `--fix`, CHANGELOG convention). Non-goals respected: no persona rule changed (`git diff --stat 1cc75a0 -- .claude/skills .agents` empty; template diffs are markers + one bullet) | PASS |
| Success criteria 1–5 | 1: FR-3/FR-4 scenarios ✓ · 2: STAR copy fences 2, reports 4, changes nothing outside fences ✓ · 3: Step 8B text ✓ (first real run on this repo pending, R8) · 4: audit item (c) ✓ · 5: CHANGELOG names ids, no recipe ✓ | PASS |

**Cross-document figure check** (numbers contrasted across documents, not copied):

| Figure | Documents | Finding |
|---|---|---|
| Marker growth 2,170 of 2,200 | execution T1d, closure, CHANGELOG 74,391 | consistent; re-measured |
| Fixtures "seven" | design §4 | shipped **21** — additive, kinds all present; design figure is a floor stated as a count (advisory) |
| Budget 13 tasks · ~750 lines · 21 rounds | design §9 | actual 14 · 3,118 (+2,012 fixture lines) · 25 of 26 — amended twice at gates, recorded in `tasks.md` §5; not drift |
| Legacy tags 73/73/48/73, 1,199 entries | execution T5, closure, CHANGELOG | consistent; Reviewer regenerated from tags |
| `digests.json` "104.9 kB" | execution T5 spawn 1 | superseded by 347.1 kB after object entries — later rows say so; the earlier figure is history, not a live claim |
| "22 section ids" | CHANGELOG, closure | 22 per-template sections, **19 distinct ids** — advisory wording |
| Design §3 key order `role → id → release` vs §5.3 `release → role → id` | design | §3 is a sketch; §5.3 and code agree on `release → role → id` (advisory) |

## 9. Test Evidence Summary

| Source | Evidence |
|---|---|
| `npm test` (this validation) | 69/69 pass across `agents-doctor.test.js`, `agents-doctor-io.test.js`, `persona-digests.test.js` |
| Tagged coverage | test names cite FR-4 ×10, FR-3 ×3, FR-9 ×3, FR-5 ×1, NFR-4 ×1, DD-3/5/12/13, §5.1/§5.2; 41 tests untagged but named by behavior |
| Closure walks (re-spot-checked) | Walk 1 states 11/11 · Walk 2 fix safety 16/16 · Walk 3 migration 3/3 · Walk 4 Safe Update 2/2 · Walk 5 FR text term by term; three held-out cases (H1–H3) plus H4 |
| Falsifiers executed | every task; T10's `unreadable`-guard removal → H1 silently `current` (load-bearing confirmed) |
| Red-before-green | recorded per test after rework rounds; honest gaps named and closed in T2 r2, T3 continuation, T4 r2, T5 continuation |
| `test-report.md` | **absent** — `/akili-test` not run; FR-9's suite is the spec's own gate (execution §3). Acceptable for a CLI-only change whose tests are a requirement; noted, not a WARN |
| CI | `ci.yml` runs `npm test` on push to `master` and PRs; **no run yet** (20 commits unpushed) |

## 10. Agent Guide / Constitution Impact

`execution.md` carries two `## Constitution Impact` notes:

| Note | Expected sync | Status |
|---|---|---|
| T2: `bin/persona.js` module, `test/` folder, `npm test` | Root `AGENTS.md` *Repository Purpose* (names `bin/akili.js` only) and *Verification* (three commands, no `npm test`) | **Not synced** — `grep persona.js\|npm test AGENTS.md` → 0 |
| T5: `digests.json` written by the release step; `git add` hint grows | Root `AGENTS.md` *Release Rules* step 5; `docs/release-checklist.md`; the release-flow memory | **Not synced** |
| CodeGraph | re-index pending for `bin/persona.js`, `test/` | pending |

No child guide is needed (one module, no divergent conventions). **WARN** — pending work for `/akili-archive` (Constitution & Graph Sync), exactly as the log scheduled it.

## 11. Remediation

| # | Finding | Level | Fix | Owner / route |
|---|---|---|---|---|
| R1 | Mixed-EOL persona: `--fix` rewrites minority line endings inside project space (FR-4 "any byte", NFR-4) — design §5.1 sanctions it | **FAIL → RESOLVED** | User chose the amendment (Option A). **A10** applied to FR-2, FR-4, NFR-4; correction closure: forward grep "any byte" / "byte of project space" over the spec folder, `docs/cli.md`, `CHANGELOG.md`, Step 8B, README → `docs/cli.md` (*Persona Drift* intro) and the CHANGELOG clause reworded; execution/closure mentions are history and stay. Backward: no document cited the old sentence as a premise | done at this gate |
| R10 | FR-4 "twice" vs FR-5 `outdated`-after-migration (found while running R8) | **FAIL → RESOLVED** | **A11** in FR-4; `design.md` §5.4 exit-code paragraph; `docs/cli.md` *Migration* paragraph gains the three-run explanation. Forward grep "twice / second run / nothing to do" → only these sites | done at this gate |
| R2 | Untracked `.agents/` refused by the dirty guard though FR-4 scopes it to "git-tracked" | WARN | Amend FR-4 to "`.agents/` has uncommitted or untracked changes" (matches DD-12 and the conservative behavior) | archive doc edit |
| R3 | `doctor --help` omits `--agents`, `--section`, `--allow-branch` | WARN | add three help lines in `printHelp` | `/akili-quick` |
| R4 | Literal "Advisory:" at `docs/cli.md:324`, `:326` | WARN | replace with "Note:" | `/akili-quick` |
| R5 | CI (`windows-latest`, Node 18) has never run `npm test` | WARN | `git push`; watch the first run | user, after archive |
| R6 | FR-10 bullet 1 / design §6 "byte-for-byte" vs DD-11 outcome | WARN | Amend FR-10 bullet 1 to "the persona code path of `doctor` without `--agents` is unchanged; a pre-existing install reports `digests.json` missing until `akili update`" | archive doc edit |
| R7 | Step 8B by-hand fallback silent on "no CLI and no `digests.json`" | WARN | one clause: "when the digests are also absent, treat every non-identical section as `custom-edited`" | `/akili-quick` or next constitution spec |
| R8 | Requirements §8 gate — first Safe Update / `--fix` on this repo's own `.agents/` — not exercised (4 personas `UNMARKED`) | **DONE** | Executed at this gate (§6): two `--fix` runs, final report 19 `CURRENT` · 1 `CUSTOM-EDITED` · 2 `UNLOCATED`, exit 0; backups kept. Surfaced R10 | done |
| R9 | Nothing-fenced migration drops the final newline | WARN (advisory-grade) | append `eol` after the project block in that branch + one assertion | follow-up `/akili-quick` or Bug Track |

## 12. Archive Readiness Recommendation

**Ready to archive.** R1 and R10 are closed by spec amendment (A10, A11) with correction closure; R8 is executed. Everything else is either scheduled for the archive's Constitution & Graph Sync (R2, R6, guide sync), a `/akili-quick`-sized follow-up (R3, R4, R7, R9), or pending external evidence (R5).

Checklist against the archive guidance:

| Criterion | Status |
|---|---|
| All required tasks `[x]` | yes, 14/14 |
| No FAIL unresolved | yes — R1 and R10 resolved by A10/A11 at this gate |
| WARN findings accepted or have follow-up | all seven remaining have a named route above |
| Tests cover key requirements and scenarios | yes — 69 tests + 5 closure walks with held-out cases |
| Drift reflected in spec docs or execution notes | yes — every amendment recorded (`tasks.md` §5, `design.md` §5.2/§5.3/§10, `execution.md`); the two spec-internal conflicts are the open amendments R1/R6 |
| User has reviewed the summary | pending |

Next command: `/akili-archive changes/persona-upgrade`.
