# Execution Log: changes/java-springboot-skill

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/java-springboot-skill` |
| Branch | `feat/java-springboot-skill` (local only; no push, PR, tag, release or publish: JC mandate) |
| Started | 2026-11-25 |
| Approval Mode | Routine gates auto-approved on JC's mandate (quoted in `tasks.md` Document Control). Exceptions stop: HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG`, destructive actions |
| Leader | Claude Opus 5.5 (session) |
| Implementer | `general-purpose` subagent on `sonnet`, seeded with `.agents/implementer.md`. No Step 8E wrapper exists in this repo |
| Reviewer | `general-purpose` subagent on `opus` (author ≠ auditor), seeded with `.agents/reviewer.md` |
| Model Routing registry | none in the repo `AGENTS.md`; the fallback pairing is above |
| Persona check | `node bin/akili.js doctor --agents --fix --allow-branch`: leader `primary-instructions` FIXED (was 2.42.0); `delegation` CUSTOM-EDITED, kept; `shared-file-discipline` INSERTED in leader and implementer (`--section`). Backup in `.agents/.backup/` |
| Budget (design §10) | 10 tasks · about 1,560 LOC · 20 review rounds |
| Baseline | `npm test` 2219 pass / 0 fail at `cb2416e` |

## Task Execution History

### T1: Hash gate before vendoring, PASS (2026-11-25)

| Field | Value |
|---|---|
| Requirements | FR-1 (*Hashes match*, *Hash differs*) |
| Attempts | 1 |
| Files changed | none in the repo; scratch only (`scratchpad/t1-fetch/`) |
| Skills / effort | none / `low` (mechanical) |
| Implementer verification | 7 `git hash-object` + `wc -c` against `requirements.md` §4: all equal. `git status --porcelain .claude/skills` empty |
| Falsifier (executed) | `SKILL.md` copy with one byte appended → `aefb19c4f30ce88438766225aa7a7c9b426a71b4`, not equal to `3729077eaf60…`: red observed |
| Evidence re-run | **VERIFIED**. Leader inline (non-author): same 7 hashes and sizes; `.claude/skills` clean (0 lines) |
| Reviewer | **PASS** (opus). Re-hashed independently; every FR-1 clause met |
| ADVISORY | (1) FR-1 says "six files" while §4 and T1 hash seven (`LICENSE`); recording seven covers both. (2) Cite the ratings' source and date. (3) Commit this record before T2 copies a byte. (4) §15's 12-character prefixes line up with the full hashes |
| spawns | Implementer 2 calls, 65,383 tokens, ended complete; Reviewer 4 calls, 72,595 tokens, ended complete |
| Running totals | tasks 1/10 · LOC 0 · review rounds 1/20 |

**FR-1 record (before any copy).**

| Pinned file at `93fc8b9ee3ef56b9b5e7261e6ce92d314cb2c1cf` | Bytes | Git blob SHA (fetched 2026-11-25) |
|---|---|---|
| `SKILL.md` | 4,433 | `3729077eaf60351e7d4d7a46464e6f5d2797bd74` |
| `references/aot-and-startup.md` | 5,475 | `bdebfab601c65bd14bcd6ba8ad1322197872d829` |
| `references/configuration.md` | 5,146 | `500624d3e2d0c42c186932658733e2469b7544e4` |
| `references/data.md` | 6,013 | `e66458facf39cb04df86210da94efef797143bbf` |
| `references/messaging-caching.md` | 7,391 | `ecfd728c0c1cd7498105e348610f2d082e983631` |
| `references/rest-api.md` | 9,174 | `69226559eebfd6823659a7ffbb356292d87c43e1` |
| repo-root `LICENSE` | 1,059 | `89bc5e962c9944cdb050887062afdaaf89be504a` |

- **Security pre-check:** verdict **PASS** (`proposal.md` §15). These are the bytes it reviewed: each hash begins with the 12-character prefix §15 lists.
- **Ratings, exactly as fetched** (`https://skills.sh/github/awesome-copilot/java-springboot` and its `/security/agent-trust-hub`, `/security/socket` and `/security/snyk` pages; fetched 2026-11-25, all HTTP 200, not re-fetched in T1; `proposal.md` P10):
  - **Gen Agent Trust Hub:** Pass, Risk Level SAFE, audited 2026-11-11. One finding, `INDIRECT_PROMPT_INJECTION`: the skill reads `pom.xml`, `build.gradle(.kts)` and `application.properties/yml` with no boundary markers.
  - **Socket:** Pass, audited 2026-11-18. The audited hash is `a607aad8679d`, not the AKILI pin.
  - **Snyk:** Pass, Risk LOW, "No issues detected".
- **Decisions:** the Implementer's *Not Done* note (it did not write `execution.md`) is the Leader's owned item by design, and this entry discharges it. No skill deviation.
- Phase gate: auto-approved (JC mandate).

### T2: Vendor `java-springboot` with provenance, PASS (2026-11-25)

| Field | Value |
|---|---|
| Requirements | FR-2 (both scenarios), NFR-1, NFR-2 |
| Attempts | 1 |
| Files changed | `.claude/skills/java-springboot/` (new: `SKILL.md`, `LICENSE`, `NOTICE`, `references/{aot-and-startup,configuration,data,messaging-caching,rest-api}.md`); `.gitattributes`; `test/java-springboot-skill.test.js` (new, 13 tests) |
| Skills / effort | none / `medium` |
| Red run (observed) | Before the folder existed: `not ok 1 … folder holds exactly 8 files: 'java-springboot folder is missing'`; `not ok 2 … ENOENT … references/aot-and-startup.md` |
| Falsifier (executed) | One byte appended to `references/data.md` → `not ok 4 … data.md equals its pinned blob SHA`. `version: "1.0"` removed → `not ok 8`, `not ok 9`. Both restored |
| Implementer verification | `node --test test/java-springboot-skill.test.js` → 13 pass / 0 fail; byte total 41,502 B (< 50 KB) |
| Evidence re-run | **VERIFIED**. Leader inline: 13 / 0; `git hash-object` of the 5 references and `LICENSE` equal §4; 8 files |
| Reviewer | **PASS** (opus). Raw-byte hashes re-checked with `--no-filters`. The `SKILL.md` strip reproduces `3729077e…`. Every FR-2 clause is met. `NOTICE` is complete and claims nothing beyond the verdict and the ratings |
| ADVISORY | (1) Consumers understated: list every interim red (below). (2) The `.gitattributes` comment cites "NFR-3" but should trace to FR-2 only (fix when T10 next touches the file). (3) `NOTICE` verdict check `/PASS/` could be anchored to its row |
| Interim reds (expected; T10 owns them) | `npm test` 2185 pass / 47 fail: `akili-panel-catalog` 2, `akili-panel-cli-coverage` 8, `docs-overview` 3, `install-akili-panel` 31, `install-cursor` 2 (`SKILL_FILE_EXPECTED` 359 → 367 here, +9 once `stack-detection.md` lands; codex baseline), `install-grokbot` 1 (codex baseline). Sum 47; per-file run |
| Implementer assumptions (verbatim) | "The NOTICE has no 'field left out' item, because all the frontmatter fields with a true value are present." "NOTICE also records that the `author` line is an AKILI addition, since upstream declares none." "The NOTICE 'Handling' row says manifests the skill reads are project data, never instructions." Leader: accepted; the Reviewer judged all three true |
| spawns | Implementer 7 calls, 90,091 tokens, ended complete; Reviewer 13 calls, 92,284 tokens, ended complete |
| Running totals | tasks 2/10 · LOC about 300 (test about 190, `NOTICE` about 50, attributes 8; vendored bytes not counted) · review rounds 2/20 |

### T3: The stack-detection table, PASS (2026-11-25)

| Field | Value |
|---|---|
| Requirements | FR-4 (all six scenarios), FR-5 *The set is checked* (Readers list), NFR-3, NFR-4 |
| Attempts | 1 |
| Files changed | `.claude/skills/software-architect/references/stack-detection.md` (new); `.claude/skills/software-architect/SKILL.md` (one router row); `test/stack-detection.test.js` (new, 9 tests) |
| Skills / effort | `software-architect`, `cognitive-doc-design` / `high` |
| Red run (observed) | With the file absent, every test failed: `ENOENT: no such file or directory, open '…/software-architect/references/stack-detection.md'` |
| Falsifier (executed) | `gradle/libs.versions.toml` removed from the Java marker cell → `not ok 3 … 'Java marker cell lacks libs.versions.toml'`. `react-dom` → `react` → `not ok 4 … 'react-dom marker'`. Both restored byte-identical |
| Implementer verification | `node --test test/stack-detection.test.js` 9 / 0; consumers (`backend-skill-routing`, `-coverage`, `ai-agent-references`, `diagram-design`, `nestjs-official-skills-contracts`) 125 / 0 |
| Evidence re-run | **VERIFIED**. Leader inline: the six suites together 134 / 0 |
| Reviewer | **PASS** (opus). Every FR-4 clause is carried by the text; Readers match S1–S8; the governance `stack` set is covered (14 in rows, 2 in any-stack) |
| ADVISORY | (1) FR-4 text still said `react` against J-8. Applied as an execute-time factual correction, below. (2) The test's skill list is hard-coded; deriving it from `binding: stack` frontmatter would self-maintain. (3) Wording nits in *Outcomes* ("reports" before the ask) |
| Implementer assumptions (verbatim) | "The Java and React markers sit in the marker cell, so the test checks that cell specifically." "I added `serverless.ts/.js/.json` as a note under the rows table rather than in the manifest cell." "I added an 'Absent file' section, mirroring `backend-routing.md`." "Readers cite steps by name only." Leader: accepted (the Reviewer judged the Absent-file section narrowing only) |
| Decisions | **Execute-time spec edit:** `requirements.md` FR-4 *Rows cover every shipped stack*, React clause `react` or `next` → `next` or `react-dom` (`react` alone does not match). Reason: carries judgment J-8, which JC approved and which design §5(a) already holds; the meaning matches the approved design. Correction Closure: `grep -rn` for `` `react` or `next` `` over the spec folder → no remaining hit. Carried into the T4 Reviewer brief as a named conformance check |
| spawns | Implementer 9 calls, 102,463 tokens, ended complete; Reviewer 6 calls, 87,165 tokens, ended complete |
| Running totals | tasks 3/10 · LOC about 520 · review rounds 3/20 |

### T6: `pr-review` filter and version, PASS (2026-11-25)

| Field | Value |
|---|---|
| Requirements | FR-5 *Review filters* (THEN, AND IT MUST parity, BUT no other change) |
| Attempts | 1 (plus one Leader decision relayed to the live worker; not a FAIL, no attempt consumed) |
| Files changed | `.claude/skills/pr-review/post-review.cjs`; `.claude/skills/pr-review/references/large-prs.md`; `.claude/skills/pr-review/SKILL.md` (`1.1.0`); `.claude/commands/akili-review.md` (Step 0.1 `1.1.0`); `docs/skills/pr-review.md` (`1.1.0`); `test/pr-review-scripts.test.js`; `test/akili-review-command.test.js` |
| Skills / effort | `tdd` / `medium` |
| Parallelism | Wave with T4 (disjoint files, no shared build output) |
| Red run (observed) | Before the glob change: `cdk.json tier 'trivial' !== 'full'`; `template.yaml is neither sensitive nor a stated exception 'trivial' !== 'full'`; later `gradle/libs.versions.toml tier 'trivial' !== 'full'` |
| Falsifier (executed) | `**/cdk.json` removed → positive test `'trivial' !== 'full'` and parity `cdk.json is neither sensitive nor a stated exception`. Restored |
| Implementer verification | `node --test test/pr-review-scripts.test.js test/pr-review-scripts-coverage.test.js test/akili-review-command.test.js` 217 / 0 |
| Evidence re-run | **VERIFIED**. Leader inline: 217 / 0 |
| Reviewer | **PASS** (opus). Only two `SENSITIVE_GLOBS` lines changed. `large-prs.md` row, note and exception per §9. Version moved at all 3 sites. Tests call the real `prepare` CLI. Parity test is falsifiable |
| ADVISORY | (1) The T6 Falsifier field predicted tier `lite`; observed `trivial` (a 1-line fixture). Recorded as the observed value. (2) CHANGELOG note for the globs and `pr-review 1.1.0`, plus the `docs/ci` pin re-check, are owed. T9 owns the CHANGELOG |
| Decisions | **Execute-time design edit:** `design.md` §9 `SENSITIVE_GLOBS` row now adds `**/libs.versions.toml` to *Dependency manifests*. Reason: the J-5 version catalog joined the table after §9 was written, and FR-5 *Review filters* THEN requires every table manifest to be sensitive; requirement meaning unchanged. The parity test parses every table row, and `components.json` is the only exception. Carried to the next Reviewer brief (T4 attempt 2) |
| spawns | Implementer 11 calls, 177,810 tokens (two turns), ended complete; Reviewer 5 calls, 78,621 tokens, ended complete |
| Running totals | tasks 4/10 (T4 in rework) · LOC about 900 · review rounds 6/20 (T1, T2, T3, T4a1, T6, T4a2 pending) |

### T4: Constitution sites S1–S3, PASS on attempt 2 (2026-11-25)

| Field | Value |
|---|---|
| Requirements | FR-3 (constitution pools + `docs/commands/akili-constitution.md`), FR-5 *Constitution*, FR-5 *Constitution project setup* |
| Attempts | 2 |
| Files changed | `.claude/commands/akili-constitution.md`; `docs/commands/akili-constitution.md`; `test/stack-detection.test.js` |
| Skills / effort | `cognitive-doc-design` / attempt 1 `medium`, attempt 2 `high` (bump per the rework rule) |

**Attempt 1: FAIL.**
- *Implementer:* pointers added at Step 5, Step 8D item 1 and mode policy, and the run contract. `java-springboot` and `react-doctor` added to the Step 5 list and the docs line.
- *Red:* pre-edit `grep -c` → `0`; new tests 10–14 red (`'at least three pointers'`).
- *Falsifiers:* removing the 8D pointer → `'item 1 names the table'`; appending `org.springframework.boot` → `'marker restated: org.springframework.boot'`.
- *Verification:* 45 / 0. *Evidence re-run:* VERIFIED (45 / 0, `grep -c` 6, `git diff --check` clean).
- *Reviewer FAIL, verbatim summary of issues:*
  1. Step 8D *Applies To* "names the manifest path that matched" covered Seed, any-stack and environment-provided rows that have no manifest (FR-5 *Constitution* AND; KZ-004).
  2. The Step 5 pointer had no Seed branch and dropped any-stack skills (FR-5 *Constitution*; KZ-004).
  3. The Discovery bullet kept scan evidence as a competing source for packaged-skill rows (FR-5; NFR-3).

  Advisory: derive test 13's forbidden markers from the table; bound the mode regex per bullet.

**Attempt 2: PASS.**
- *Fix:* *Applies To* now follows the row kind (manifest path / declared stack / design condition / tooling condition; "Never invent a manifest path"). Step 5 gains the Seed branch and "plus the any-stack skills the design calls for". Discovery now reads "Packaged stack-skill rows come only from the table", with scan evidence feeding only the routing blocks and the `no packaged skill` stacks.
- *Red:* reverting only the three fixes → tests 15, 16 and 17 red (`# pass 14 # fail 3`).
- *[advisory-grade] test changes:* test 13 derives its forbidden markers from the table (falsifier: `@nestjs/core` appended → `'marker restated: @nestjs/core'`); assertions are bounded per bullet.
- *Verification:* 48 / 0. *Evidence re-run:* VERIFIED (48 / 0).
- *Reviewer:* **PASS** (opus). All three issues closed; edited paragraphs read whole; no markers, no line numbers.

| Field | Value |
|---|---|
| ADVISORY (final) | The line-number guard window is 40 characters; `bulletOf` assumes no blank lines inside a bullet; design §7 S3 says "*Commands read from*" where the table column is "*Run and build commands read from*" (optional sync at archive) |
| Implementer assumption (verbatim) | "The tests are keyword-pinned prose checks, so they do not validate semantics beyond the phrases they match." Leader: accepted. Semantic use is covered by the T10 walkthrough |
| spawns | Implementer 13 calls, 175,716 tokens (two turns), ended complete; Reviewer a1 7 calls, 83,157 tokens, ended complete (FAIL); Reviewer a2 5 calls, 81,690 tokens, ended complete |
| Running totals | tasks 5/10 · LOC about 1,000 · review rounds 7/20 |

### T8: Backend routing for Java / Spring Boot, PASS (2026-11-25)

| Field | Value |
|---|---|
| Requirements | FR-6 (THEN, AND row rules, BUT no lead change) |
| Attempts | 1 |
| Files changed | `.claude/skills/software-architect/references/backend-routing.md` (route-line stack value, Stack row, matrix row, card, attribution); `AGENTS.md` (*Backend Skills* bullet); `test/backend-skill-routing.test.js` |
| Skills / effort | `software-architect`, `java-springboot` (read-only, for idiom fidelity) / `medium` |
| Parallelism | Wave with T5 (disjoint files; each worker skipped the other's suites, and the Leader ran all four afterwards) |
| Red run (observed) | Counts updated before the content: `not ok 19 … expected: 20 actual: 19`; `not ok 22 … one implement row per stack expected: 6 actual: 5`; `not ok 34 … FR-6: implement / Java / Spring Boot … expected: 1 actual: 0` (also 20, 24, 35) |
| Falsifier (executed) | Two leads on the Java row → `not ok 5 - every Lead cell holds exactly one lead`, `not ok 16 - FR-6 … exactly one lead`. Restored |
| Implementer verification | `node --test test/backend-skill-routing.test.js test/backend-skill-routing-coverage.test.js` 36 / 0 (the coverage file needed no change) |
| Evidence re-run | **VERIFIED**. Leader inline: the routing, stack-detection and golang suites together 75 / 0; `git diff --check` clean |
| Reviewer | **PASS** (opus). Idiom and card are faithful to `java-springboot/SKILL.md`. The 19 baseline rows match HEAD exactly. Tests assert content, not only counts |
| ADVISORY | (1) The card's *Must not decide* could also name "installing a sibling skill" (already covered by rule 9 and the existing no-install test). (2) The attribution line "names their headings only" could read "names their headings and paraphrases their idiom" |
| Implementer assumptions (verbatim) | "My card test failed once, because I checked 'architecture style' against capitalised card text. I fixed the assertion to compare case-insensitively." "The card's Evidence cites … → *Router*." Leader: accepted |
| spawns | Implementer 11 calls, 92,326 tokens, ended complete; Reviewer 6 calls, 83,908 tokens, ended complete |
| Running totals | tasks 6/10 · LOC about 1,180 · review rounds 9/20 (T5 review pending) |

### T5: Specify, propose, audit sites S4–S6, PASS on attempt 2 (2026-11-25)

| Field | Value |
|---|---|
| Requirements | FR-3 (specify pool), FR-4 *No row matches*, FR-5 *Specify fallback*, *Propose*, *Audit* |
| Attempts | 2 |
| Files changed | `.claude/commands/akili-specify.md`; `.claude/commands/akili-propose.md`; `.claude/commands/akili-audit.md`; `test/stack-detection.test.js` |
| Skills / effort | `cognitive-doc-design` / attempt 1 `high`, attempt 2 `xhigh` |
| Parallelism | Attempt 1 ran in a wave with T8; attempt 2 ran in a wave with T7 (disjoint files; T7's tests in a separate file) |

**Attempt 1: FAIL.**
- *Implementer:* S4 pointer plus 7 list additions; S5 Step 0 item 6 and the Step 2 row; S6 area 4 plus the Skill Map drift bullet.
- *Red:* `specify fallback list lacks: java-springboot, nestjs, nestjs-auth, nestjs-data, nestjs-testing, nestjs-production, react-doctor`.
- *Falsifier:* `react-doctor` dropped → `specify fallback list lacks: react-doctor`.
- *Verification:* 39 / 0. *Evidence re-run:* VERIFIED (75 / 0 together with the routing suites).
- *Reviewer FAIL (issue 1, verbatim gist):* specify Step 2.1's declared-stack branch had no outcome when the declared stack matches no row (FR-4 *No row matches*; KZ-004). Advisories: table-absent outcome in specify and audit; audit first direction limited to stacks with packaged skills; propose records `not read:` lines; propose template uses the table's report line.

**Attempt 2: PASS.**
- *Fix:* the outcome is stated for every input, as the Reviewer's table above lays out (manifest or declared stack, match or no row, neither, not read, table absent). Advisories 1–4 applied as [advisory-grade].
- *Red:* `not ok 24 … Specify fallback states an outcome for a declared stack that matches no row`, `not ok 25`, `not ok 26`, `not ok 27` (`# pass 23 # fail 4`).
- *Verification:* 61 / 0. *Evidence re-run:* VERIFIED (61 / 0).
- *Reviewer:* **PASS** (opus).

| Field | Value |
|---|---|
| ADVISORY (final) | (1) Outcome lists do not mention the table's ask-before-`Java — no packaged skill` rule (consistent with NFR-3; a pointer to *Outcomes* would help). (2) Audit with no Skill Map reports no-packaged-skill stacks as unmapped, against its own first-direction rule. (3) Propose's no-row line omits the path; the template alternative lists only `none detected`. (4) Propose's `not evaluated` row for an absent table goes slightly beyond "as before". (5) Stage only T5 files |
| Implementer assumptions (verbatim) | "Specify's 'not read' outcome is 'treated as no match, line noted'. The spec does not say what to do there, so this is my reading." "Propose's greenfield case never records the PRD stack as detected." Leader: accepted |
| spawns | Implementer 16 calls, 206,875 tokens (two turns), ended complete; Reviewer a1 6 calls, 88,264 tokens, ended complete (FAIL); Reviewer a2 7 calls, 87,288 tokens, ended complete |
| Running totals | tasks 7/10 · LOC about 1,380 · review rounds 11/20 (T7 review pending) |

### T7: Review and security sites S7–S8, PASS on attempt 2 (2026-11-25)

| Field | Value |
|---|---|
| Requirements | FR-5 *Stack-aware review*, *Security reconnaissance* (J-2 and J-6 amendments), FR-4 *Manifests are data* |
| Attempts | 2 |
| Files changed | `.claude/commands/akili-review.md` (Step 2 *Stack context*); `.claude/commands/akili-security.md` (Step 2 *Stack context*); `docs/commands/akili-review.md`; `docs/commands/akili-security.md`; `test/stack-detection-readers.test.js` (new, 14 tests) |
| Skills / effort | `cognitive-doc-design`, `security-audit` (guidance) / attempt 1 `high`, attempt 2 `xhigh` |
| Decisions | **Leader narrowed the test location:** `test/stack-detection-readers.test.js` instead of `test/stack-detection.test.js`, to avoid a conflict with parallel T5. Same assertions. The T7 Verification command as run was `node --test test/stack-detection-readers.test.js test/akili-review-command.test.js test/akili-security-command.test.js` |

**Attempt 1: FAIL.**
- *Red:* 8 failures incl. `'names the table'`.
- *Falsifier:* `**base**` → `**head**` → `not ok 1 … names the table and the base tree`.
- *Verification:* 134 / 0. *Evidence re-run:* VERIFIED (134 / 0).
- *Reviewer FAIL:* S7 did not say the named skills come from the installed package, never from the diff (FR-5 *Stack-aware review* AND, J-2). A PR adding its own skill in the head tree could have become an "idiom reference".

**Attempt 2: PASS.**
- *Fix:* "The skills named are read from the installed package (in CI, the installed copy in HOME), never from the diff or `head/`". [advisory-grade] S8 now carries the `not read:` line, and a Java build with no Spring marker is carried as "unconfirmed — no Spring marker found", never asked inside a delegated run. Advisory 3 (S7's no-row → no stack line) kept as defensible.
- *Red:* `not ok 3 … S7 trust boundary …`, `not ok 10 … S8 states the not-read line and the unconfirmed Java outcome …` (12 / 2).
- *Verification:* 136 / 0. *Evidence re-run:* VERIFIED (136 / 0).
- *Reviewer:* **PASS** (opus). Addenda byte-unchanged; `.claude/skills` untouched.

| Field | Value |
|---|---|
| ADVISORY (final) | (1) The `docs/commands/akili-review.md` one-liner omits the installed-package boundary. (2) Record the test-location narrowing (done above). (3) S8's absent-table sentence lacks "in the report" |
| spawns | Implementer 12 calls, 202,028 tokens (two turns), ended complete; Reviewer a1 4 calls, 80,703 tokens, ended complete (FAIL); Reviewer a2 4 calls, 77,296 tokens, ended complete |
| Running totals | tasks 8/10 · LOC 1,141 (`git diff --shortstat cb2416e` excluding spec docs and vendored bytes, plus T7) · review rounds 13/20 |

### T5 (reopened): attempt 3, post-PASS regression fix, PASS (2026-11-25)

| Field | Value |
|---|---|
| Trigger | While landing T9, the Leader found `test/ai-agent-guardrails-evals.test.js:196-208` red: `expected the 'otherwise pick from:' lead-in in Step 2.1`. T5's committed rewording had replaced the lead-in with `Skills:`. The T5 Consumers field and both T5 Reviewers missed this consumer, because the phrase anchor belongs to another spec's test |
| Attempt | 3 of 3 (effort held at `xhigh`, the ceiling) |
| Files changed | `.claude/commands/akili-specify.md` (one line: `Skills:` → `With no Skill Map, otherwise pick from:`) |
| Red run (observed) | test 14 `expected the 'otherwise pick from:' lead-in in Step 2.1` (fail 1) |
| Falsifier (executed) | Line reverted → same red; restored |
| Implementer verification | `ai-agent-guardrails-evals`, `stack-detection`, `golang-skill`, `backend-skill-routing`, `nestjs-official-skills-contracts`: 133 / 0. Sweep `grep -rn "pick from" test/*.js` → only the guardrails file |
| Evidence re-run | **VERIFIED**. Leader inline 133 / 0 |
| Reviewer | **PASS** (opus). FR-5 meaning unchanged. Every test file reading specify Step 2.1 ran 579 / 0. No test depends on list order |
| ADVISORY | The lead-in labels the list as a fallback only, while the paragraph above also picks matched rows' skills from it; "Packaged stack skills — otherwise pick from:" would cover both |
| Lesson candidate (for kaizen) | A Consumers sweep for rewording command prose must grep the tests for the **removed phrases**, not only for the skill names: KZ-changes--archify-diagrams-2 class, phrase form |
| spawns | Implementer 3 calls, 61,459 tokens, ended complete; Reviewer 4 calls, 65,595 tokens, ended complete |
| Running totals | tasks 8/10 · LOC about 1,145 · review rounds 14/20 (T9 review pending) |

### T9: Docs pages, links, governance, CHANGELOG, PASS (2026-11-25)

| Field | Value |
|---|---|
| Requirements | FR-7 (both scenarios), FR-8 (docs clauses; the 38 total and the panel are T10's) |
| Attempts | 1 |
| Files changed | `docs/skills/java-springboot.md` (new); `docs/skills/by-stack.md` (new); `docs/skills/README.md`; `docs/overview.md`; `docs/README.md`; `README.md` (*Learn more*); `docs/skills/governance.md` (`stack` row, 16); `docs/flow.md` (stack line: `java-springboot`, plus the missing `golang-pro`); `CHANGELOG.md` (`[Unreleased]`); `test/stack-detection.test.js` (6 tests) |
| Skills / effort | `cognitive-doc-design` / `medium` |
| Decisions | Leader narrowing: the `akili-panel` CHANGELOG line moves to T10, where the bump is made, so the claim is true when written (KZ-002). Adding `golang-pro` to the `docs/flow.md` stack line is a correction to the line the task edits (the Reviewer accepted it) |
| KZ-002 greps (Implementer) | `grep -L stack-detection.md` over the six commands → none missing; `pr-review` `version` `"1.1.0"`; IaC + catalog globs at `large-prs.md:64`, `post-review.cjs:86`; link resolution over both new pages → no broken link; no `37`/`38` in new text |
| Red run (observed) | Before the pages: `not ok 28..33` (27 / 6) |
| Falsifier (executed) | `shadcn-ui` link replaced with "none" → `not ok 28` (exactness); `tdd` added to the Go section → `not ok 28`. Restored |
| Implementer verification | `node --test test/stack-detection.test.js test/docs-overview.test.js test/golang-skill.test.js` → 61 / 1. The one red is `(d) every '<N> commands\|skills' claim equals the derived total` (T10's count). The two `java-springboot` row checks from T2's interim list are now green |
| Evidence re-run | **VERIFIED**. Leader inline: 61 / 1, the same single expected red |
| Side finding | The Implementer's full `npm test` surfaced the T5 Step 2.1 anchor regression; fixed as T5 attempt 3 above |
| Reviewer | **PASS** (opus). Exactness test sourced from governance and the table; facts match `NOTICE` and `SKILL.md`; CHANGELOG claims re-grepped true at HEAD |
| ADVISORY | (1) The duplicate assertion in the exactness test is tautological. (2) Skills named in plain backticks inside a stack section escape the check. (3) `java-springboot.md` quotes `Java - no packaged skill` with a hyphen; the table uses an em dash. (4) CHANGELOG "instead of keeping their own lists" overstates (the pools remain by DD-9): "their own manifest and marker lists". Leader: (1), (3) and (4) are carried into T10 as [advisory-grade], since T10 edits the same test file and CHANGELOG; (2) is recorded only |
| spawns | Implementer 19 calls, 109,806 tokens, ended complete; Reviewer 12 calls, 96,565 tokens, ended complete |
| Running totals | tasks 9/10 · LOC about 1,390 · review rounds 15/20 |

### T3 (reopened): attempt 2, catalog-alias gap found by the T10 walkthrough, PASS (2026-11-25)

| Field | Value |
|---|---|
| Trigger | The T10 walkthrough (requirements §8 substitute gate) found that a Gradle module declaring Spring Boot through `alias(libs.plugins.spring.boot)` could be reported twice: as Java / Spring Boot through its catalog, and as `Java — no packaged skill` (ask the user) through its build file |
| Attempt | 2 of 3 (effort `high`) |
| Files changed | `.claude/skills/software-architect/references/stack-detection.md` (*Outcomes*: "A catalog match covers its build file"; the ask rule now reads "no Spring marker in the file **or** in its catalog"; `requirements.txt` added to the no-row examples; `<stack> — no packaged skill` stated as the short form of the report line); `test/stack-detection.test.js` (2 assertions) |
| Red run (observed) | `not ok 7` (catalog covers build file), `not ok 8` (`requirements.txt` + short form) (33 / 2) |
| Falsifier (executed) | New bullet removed → `not ok … a catalog match covers its sibling Gradle build file`; restored |
| Verification | `stack-detection`, `stack-detection-readers`, `pr-review-scripts` → 224 / 0. Readers grep for `no packaged skill`: consistent; no reader edited |
| Evidence re-run | **VERIFIED** inside the T10 full-gate re-run below |
| Reviewer | **PASS** (opus). FR-4 *Java without Spring Boot* and *Several manifests* not contradicted |
| ADVISORY | (1) A root catalog shared by several modules can yield identical lines (cosmetic). (2) "the module's own `gradle/` directory" holds only for an included build; "of the same Gradle build" already narrows it. (3) The pre-existing CDK note omits the ask-first rule; *Outcomes* governs |
| spawns | Implementer 7 calls, 75,503 tokens, ended complete; Reviewer 2 calls, 68,486 tokens, ended complete |

### T10: Count sweep, panel catalog, contract tests, full verification, walkthrough, PASS (2026-11-25)

| Field | Value |
|---|---|
| Requirements | FR-9, FR-3 BUT (load-direct sweep), FR-5 *The set is checked*, NFR-3, NFR-4, NFR-5; the §8 walkthrough defect class |
| Attempts | 1 |
| Files changed | Panel: `.claude/skills/akili-panel/hooks/flow.mjs` (`SKILL_CATALOG` + `java-springboot`, `stack`), `.claude-plugin/plugin.json` and `README.md` (`1.1.3`). Counts: `docs/cli.md` (4 lines, 38), `.gitattributes` (comment traces FR-2 only), `test/akili-marketing-docs.test.js`, `test/akili-panel-cli-coverage.test.js`, `test/akili-panel-flow.test.js` (Skills 38, stack 16, `SKILL_NAMES.stack`), `test/diagram-design.test.js`, `test/install-akili-panel.test.js`, `test/install-cursor.test.js` (`SKILL_FILE_EXPECTED` +9, 51 → 52), `test/fixtures/doctor-codex-baseline.txt` (`OK java-springboot`, ok 59 → 60). `CHANGELOG.md` (panel 1.1.3 line; "manifest and marker lists"). `docs/skills/java-springboot.md` (em dash). Tests: `test/stack-detection-readers.test.js` (+4 contract tests), `test/stack-detection.test.js` (duplicate assert fixed) |
| Skills / effort | none extra / `high` |
| Red run (observed) | Before fixes: `akili-panel-catalog` 2, `akili-panel-cli-coverage` 8, `docs-overview` 1, `install-akili-panel` 31, `install-cursor` 2, `install-grokbot` 1 (reconciles with the T2 interim list; T9 cleared 2 docs-overview reds) |
| Falsifier (executed) | One `37` left in `install-akili-panel` → 14 / 29. `SKILL_CATALOG` entry removed → `akili-panel-catalog` `not ok 1`, `not ok 3`. Restored → 49 / 49 |
| Sweep | Two misses caught by the first full run and fixed (a 37+1 hybrid count → 39; a 37−1 count → 37). Remaining `37` hits are version strings, a "37 columns" width, and `Skills (37)` = 38 minus `kaizen`. `golang-pro` enumerators: only `install-cursor` and the codex doctor baseline, both updated |
| Install / doctor (FR-9) | Temp HOME, explicit `node bin/akili.js`: `install --tool all --dry-run` plans `java-springboot` for claude, opencode, antigravity (3 paths), codex and cursor; `--tool grokbot --dry-run` plans it too. After a real install, `doctor --tool all` → `OK java-springboot` on all 5, all HEALTHY (ok 61/60/60/60/60). `git diff --stat cb2416e -- bin/` empty |
| Gates (Implementer) | `npm test` 2290 / 0; `npm run verify:cli` 0; `npm run pack:dry-run` 0 (485 files; 8 `java-springboot` + `stack-detection.md`); `git diff --check` clean |
| Evidence re-run | **VERIFIED**. Leader inline, after T3 attempt 2: `npm test` **2292 / 0** (exit 0); `verify:cli` 0; pack lists the new files (10 matching lines); `git diff --check` clean; `bin/` diff empty |
| Reviewer | **PASS** (opus). Every count reader is correct; the fixture is byte-correct; the panel pins and CHANGELOG line are true; the load-direct test is real (exactly 4 allowed hits) |
| ADVISORY | (1) The NFR-4 guard matches the literal path only; a `path.join` read would pass. NFR-4 holds today by grep. (2) Leader narrowing recorded: the no-spec-path test is scoped to this spec's folder, because 9 older tests hold `docs/specs/changes/...` strings as synthetic fixtures. (3) The FR-9 marker test spot-checks 2 of the markers by name |
| spawns | Implementer 26 calls, 115,625 tokens, ended complete; Reviewer 8 calls, 86,687 tokens, ended complete |

**Walkthrough (requirements §8 substitute gate).** Fixtures live in `scratchpad/walk.eXf1/{mono,quarkus,cdk}`. The Implementer wrote the expected lines before walking the table by hand. Fixture 3 is held out: the text does not cite it.

| Fixture | Expected (written first) | Actual (table walked) |
|---|---|---|
| 1. Monorepo: `api/build.gradle.kts` with `alias(libs.plugins.spring.boot)`, `api/gradle/libs.versions.toml` with `id = "org.springframework.boot"`, `web/package.json` with `@angular/core` | `Java / Spring Boot (api/gradle/libs.versions.toml) → java-springboot`; `Angular (web/package.json) → angular-developer` | Same lines. **Ambiguity found:** the build file could also read as markerless → ask. Fixed by T3 attempt 2 ("A catalog match covers its build file") |
| 2. Quarkus `pom.xml` (`io.quarkus`, no Spring) | `Java — no packaged skill`, after asking the user | Same: no Spring marker, ask the user, never routes `java-springboot` |
| 3. Python CDK app (held out): `cdk.json`, `requirements.txt` with `aws-cdk-lib` | `AWS serverless: CDK (cdk.json) → aws-serverless`; `Python (requirements.txt) — no packaged skill` | Same. **Ambiguities found:** two no-row line forms; `requirements.txt` not among the no-row examples. Both fixed by T3 attempt 2 |

JC's human check of this walkthrough is deferred to the end of execution (mandate: no stop).

**Running totals (final):** tasks 10/10 · LOC **1,376** changed (`git diff --shortstat cb2416e` excluding spec docs and vendored bytes: 1,292 +, 84 −), against a budget of about 1,560 · review rounds **17/20**. The tripwire did not fire.
