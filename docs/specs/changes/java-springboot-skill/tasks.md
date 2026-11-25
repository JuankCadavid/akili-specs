# Tasks: Java / Spring Boot stack skill, stack detection, skills-by-stack page

> **The short version.** Ten serial tasks in order T1 → T10:
> - **T1:** the hash gate.
> - **T2:** vendor the skill.
> - **T3:** write the table.
> - **T4–T7:** command and script sites.
> - **T8:** routing.
> - **T9:** docs.
> - **T10:** count sweep, panel catalog, contract tests and full verification.
>
> T4–T9 depend on T3 only and could run in parallel. They run serially anyway, because they share `CHANGELOG.md` and the count tests, and AGENTS.md allows one session per checkout. No task is `skip-eligible`.

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/java-springboot-skill` |
| Depth | Standard |
| Approval Mode | gated through Phase 2. **From the Phase 3 gate on: routine gates auto-approved on JC's mandate** (2026-11-25): "Continue to Phase 3 (tasks.md). Then run /akili-execute through to the end of all tasks without stopping for my input; answer process gates with the recommended option. Commits local only: never push, PR, release, tag or publish. If a dangerous rm comes up, don't run it; rewrite it safely." Exceptions still stop: HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG`, destructive actions |
| Phase 3 gate | auto-approved (JC mandate above), 2026-11-25 |
| Budget (design §10) | 10 tasks · about 1,560 LOC · 20 review rounds |
| Baseline | `npm test` 2219 / 0 at `cb2416e` |

## Coverage (scenario and clause level)

| Requirement clause | Owner |
|---|---|
| FR-1 *Hashes match* (THEN, AND, BUT no copy before record, AND IT MUST ratings as fetched); *Hash differs* (Pivot) | T1 |
| FR-2 *Upstream body kept* (THEN, AND appended lines, BUT no upstream line changed, AND IT MUST schema fields); *License and notice* (THEN, AND `NOTICE` content) | T2 |
| FR-3 *Pools list it* (THEN, BUT no load-direct) | T4 (constitution pools + docs summary), T5 (specify pool), T10 (load-direct sweep test) |
| FR-4 *Rows cover every shipped stack* (THEN, AND, AND IT MUST markers); *AWS CDK* (THEN, AND IT MUST `aws-cdk-lib` stated); *Java without Spring Boot* (THEN + ask, BUT no route); *Several manifests*; *Manifests are data* (THEN, AND not read, BUT no build/install/git except the carve-out); *No row matches* | T3 |
| FR-5 *Constitution* (THEN modes, AND *Applies To*) | T4 |
| FR-5 *Constitution project setup* (THEN, BUT never invent) | T4 |
| FR-5 *Specify fallback* (THEN, AND list completeness) | T5 |
| FR-5 *Propose* | T5 |
| FR-5 *Audit* (THEN drift, BUT report-only) | T5 |
| FR-5 *Review filters* (THEN, AND IT MUST parity, BUT no other filter change) | T6 |
| FR-5 *Stack-aware review* (THEN references-only, AND base tree and new-manifest line, BUT lens rules unchanged) | T7 |
| FR-5 *Security reconnaissance* (THEN, AND read rules and no git before Run, BUT no vendored edit and no scope narrowing) | T7 |
| FR-5 *The set is checked* (THEN design enumeration, AND unchanged list) | T3 (the table's *Readers* list), T10 (test: every named reader points to the table) |
| FR-6 *Matrix rows* (THEN, AND row rules, BUT no lead change) | T8 |
| FR-7 *Page content* (THEN, AND any-stack, AND gsap/impeccable line, AND no-skill list, AND IT MUST exactness); *Linked* | T9 (page and links), T10 (exactness test) |
| FR-8 *Docs updated* (THEN, AND rows, AND 38, AND CHANGELOG, AND IT MUST sibling note, BUT no extra security claim) | T9 (docs), T10 (count sweep) |
| FR-9 *Every target* (THEN, AND tests, BUT no installer code) | T10 |
| NFR-1 size · NFR-2 no siblings | T2 |
| NFR-3 one definition | T3 (table), T10 (no-restatement test) |
| NFR-4 no spec-path reads | T10 (test greps new tests) |
| NFR-5 green gates | T10 |
| Defect class "agent misapplies the table" (walkthrough substitute) | T10 |

## T1: Hash gate before vendoring (FR-1)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Dependencies | none |
| Requirements | FR-1 (both scenarios, all clauses) |
| Design | §9 *FR-1 / FR-2 trace*; `proposal.md` §15 |
| Skills | `security-audit` (guidance mode; the verdict already exists, re-read only) |
| Review | `checklist`: an evidence record; the Reviewer re-runs the hashes |

**Scope:** Re-fetch the six files and `LICENSE` at `93fc8b9ee3ef56b9b5e7261e6ce92d314cb2c1cf` into a fresh scratchpad directory. Hash each with `git hash-object` and compare it to `requirements.md` §4. Write an `execution.md` T1 entry with the seven hashes, the comparison, the pre-check verdict pointer, and the ratings exactly as fetched (Trust Hub Pass/SAFE plus `INDIRECT_PROMPT_INJECTION`; Socket Pass, audited hash `a607aad8679d`; Snyk Pass/LOW). Copy nothing into `.claude/skills/`.

**Tests:** n/a (evidence task).

| Verification field | Value |
|---|---|
| Verification | `git hash-object <scratch>/<file>` ×7 equals §4; `git status --porcelain .claude/skills` is empty after T1 |
| Falsifier | Flip one byte in a scratch copy, and its hash no longer equals §4 (observed in T1) |
| Red run | predicted — greenfield artifact (observed in T1) |
| Disqualifier | A hash computed from a file that is not the freshly fetched copy (an older scratch path) is not evidence |
| Consumers | none |

**Done:** the seven hashes are recorded and equal; the ratings are quoted; `.claude/skills/java-springboot` does not exist yet. Any mismatch → Pivot Protocol (stop for JC).

## T2: Vendor `java-springboot` with provenance (FR-2, NFR-1, NFR-2)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Dependencies | T1 = all hashes equal |
| Requirements | FR-2 (both scenarios), NFR-1, NFR-2 |
| Design | §4 row 1, §9 frontmatter, `NOTICE` and `.gitattributes` rows, DD-2, DD-3, DD-12 |
| Skills | none beyond the repo conventions (`tdd` not assigned: a byte contract, not logic) |
| Review | `full`: third-party text enters the package |

**Scope:** Create `.claude/skills/java-springboot/` from T1's verified copies. Append, before the closing `---`, the exact frontmatter lines from design §9. Copy `LICENSE` unchanged. Write `NOTICE` per §9. Add `.claude/skills/java-springboot/** -text` to `.gitattributes`. Create `test/java-springboot-skill.test.js` (hash-lock part) in the `test/golang-skill.test.js` pattern:
- each reference and `LICENSE` raw-byte blob SHA equals §4;
- `SKILL.md` with the appended lines removed equals the pinned blob;
- frontmatter keys;
- `NOTICE` facts;
- the `.gitattributes` line;
- folder size under 50 KB;
- no sibling folder name (`spring-boot-testing`, …) under `.claude/skills/`.

**Tests:** the new hash-lock tests.

| Verification field | Value |
|---|---|
| Verification | `node --test test/java-springboot-skill.test.js`; `du -sk .claude/skills/java-springboot` |
| Falsifier | Change one byte of `references/data.md` → the blob test goes red. Delete the `version: "1.0"` line → the frontmatter test goes red |
| Red run | predicted — greenfield artifact (observed in T2): the test runs before the folder exists, giving `ENOENT` or a hash mismatch, to be quoted |
| Disqualifier | A hash taken after git normalization (`git hash-object` on a CRLF checkout) instead of raw bytes, or a test that strips both sides before comparing |
| Consumers | `test/install-cursor.test.js:259` (`SKILL_FILE_EXPECTED`) and the 37-count tests. They go red here and are fixed in T10; expected interim red, record it |

**Done:** 8 files; tests green for the new file; the interim count reds are listed in `execution.md`.

## T3: The stack-detection table (FR-4, FR-5 set, NFR-3)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Dependencies | none |
| Requirements | FR-4 (all six scenarios), FR-5 *The set is checked* (reader list), NFR-3 |
| Design | §5 (a)–(d), §7 (site list), DD-1, DD-4, DD-5, DD-7 |
| Skills | `software-architect` (the folder's conventions), `cognitive-doc-design` |
| Review | `full`: the single definition eight readers rely on |

**Scope:** Write `.claude/skills/software-architect/references/stack-detection.md`, containing:
- the §5(a) rows with the precise markers, including version catalogs, XML comment stripping, `<exclusions>`, the BOM import, `react-dom`/`next`, the Serverless formats not read, and CDK by `cdk.json` with the `aws-cdk-lib` reason;
- the §5(b) any-stack row;
- the §5(c) read rules for the three modes;
- the §5(d) outcomes, including ask-before-`no packaged skill` for Java;
- a *Readers* list: the eight sites S1–S8 by step name, plus the stated unchanged set and its reasons;
- an attribution footer in the `backend-routing.md` style.

Add one router row in `software-architect/SKILL.md`. Start `test/stack-detection.test.js`:
- each stack-specific `stack` skill appears in a row;
- the Java row names `org.springframework.boot`, `libs.versions.toml` and `<exclusions>`;
- the React row names `react-dom`;
- the CDK row exists, and its `aws-cdk-lib` reason is stated;
- "no packaged skill" and the ask-the-user line exist;
- the read rules name the `git show` carve-out and the no-git rule.

**Tests:** the new table tests.

| Verification field | Value |
|---|---|
| Verification | `node --test test/stack-detection.test.js` |
| Falsifier | Delete the `libs.versions.toml` marker, or change `react-dom` to `react`, and the matching assertion goes red. Run each mutation |
| Red run | predicted — greenfield artifact (observed in T3) |
| Disqualifier | A test that only greps for skill names anywhere in the file (it would pass with the names in a prose sentence and no row) |
| Consumers | `.claude/skills/software-architect/SKILL.md` router tests, if any (`grep -rln "software-architect/SKILL.md\|references/backend-routing.md" test/` → the routing tests read the router; run and list them) |

**Done:** the table is complete; the mutations were observed red; the router row is present.

## T4: Constitution sites S1–S3 (FR-3, FR-5 Constitution, project setup)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Dependencies | T3 |
| Requirements | FR-3 (constitution pools + `docs/commands/akili-constitution.md`), FR-5 *Constitution*, FR-5 *Constitution project setup* |
| Design | §7 S1, S2, S3; DD-9 |
| Skills | `cognitive-doc-design` |
| Review | `full`: command text agents execute (2 rounds budgeted) |

**Scope:** `.claude/commands/akili-constitution.md`:
- **Step 5:** a pointer sentence to `software-architect` → `references/stack-detection.md`, and `java-springboot` and `react-doctor` added to the list.
- **Step 8D item 1:** candidates gain `java-springboot`. *Mode-specific policy*: Discovery applies the table, Seed maps the declared stack through its rows, Safe Update proposes only newly detected rows, and the *Applies To* cell names the manifest path.
- **Run contract (Legacy / Active):** each detected row's *Commands read from* cell names the source; never invent.

`docs/commands/akili-constitution.md`: add `java-springboot` to the stack line. Name the table by its file and never restate a marker.

**Tests:** extend `test/stack-detection.test.js` with a reader check for these three constitution sites.

| Verification field | Value |
|---|---|
| Verification | `node --test test/stack-detection.test.js test/golang-skill.test.js`; `grep -c "stack-detection.md" .claude/commands/akili-constitution.md` ≥ 3 |
| Falsifier | Remove the Step 8D pointer → the reader test goes red. Paste a marker string (`org.springframework.boot`) into the command → the no-restatement test goes red |
| Red run | `grep -c "stack-detection.md" .claude/commands/akili-constitution.md` → `0` at baseline (to be quoted at T4 start) |
| Disqualifier | A pointer that names the table but not what the step does with the result |
| Consumers | `test/golang-skill.test.js:126-137` (pool regexes); `test/backend-skill-routing.test.js` `item5` |

**Done:** three sites edited; pools complete; tests green.

## T5: Specify, propose, audit sites S4–S6 (FR-3, FR-5)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Dependencies | T3 |
| Requirements | FR-3 (specify pool), FR-5 *Specify fallback*, *Propose*, *Audit* |
| Design | §7 S4, S5, S6; DD-9 |
| Skills | `cognitive-doc-design` |
| Review | `full`: three command files (2 rounds budgeted) |

**Scope:**
- **`akili-specify.md` Step 2.1:** apply the table, then pick; the list grows by the 7 skills (design S4).
- **`akili-propose.md`:** a Step 0 item to apply the table and record `Stack (detected)`, and the Step 2 item 1 list names that row.
- **`akili-audit.md`:** Step 1 area 4 applies the table. Step 2 reports *Skill Map drift* both ways, report-only.

Extend the reader test.

**Tests:** reader checks for S4–S6, plus a fallback-list completeness check: every skill in a table row is in the specify list.

| Verification field | Value |
|---|---|
| Verification | `node --test test/stack-detection.test.js test/golang-skill.test.js test/backend-skill-routing.test.js` |
| Falsifier | Drop `react-doctor` from the specify list → the completeness assertion goes red |
| Red run | completeness against the baseline list → missing `java-springboot, nestjs, nestjs-auth, nestjs-data, nestjs-testing, nestjs-production, react-doctor` (to be quoted) |
| Disqualifier | A completeness check that reads its skill set from the specify list itself |
| Consumers | `test/backend-skill-routing.test.js` (`specifyExplore`, `specifyRule`), `test/golang-skill.test.js:133-134` |

**Done:** the three files are edited and the tests are green.

## T6: `pr-review` filter and version (FR-5 Review filters)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Dependencies | T3 |
| Requirements | FR-5 *Review filters* (THEN, AND IT MUST parity, BUT no other change) |
| Design | §9 `SENSITIVE_GLOBS`, `large-prs.md`, version rows; DD-6, DD-8 |
| Skills | `tdd` (a classification change; the red is a sensitive-path test) |
| Review | `full`: shared script behavior |

**Scope:**
- **`post-review.cjs`:** append the five globs to `SENSITIVE_GLOBS`.
- **`large-prs.md`:** an *Infrastructure as code* row, the over-match note and the `components.json` exception sentence.
- **Version:** `pr-review/SKILL.md` `metadata.version` → `1.1.0`, with `akili-review.md` Step 0.1, `docs/skills/pr-review.md` and `docs/commands/akili-review.md` if it states the version.
- **Tests:**
  - prepare-level positive tests for each glob, and a negative test for `templates/page.yml` and for `components.json`;
  - a parity test: every table manifest is in `SENSITIVE_GLOBS` or is the stated exception;
  - the sensitive-areas test retitled to ten, with the new area asserted.

**Tests:** as above, in `test/pr-review-scripts*.test.js` (pick the file holding the sensitive tests) and `test/akili-review-command.test.js`.

| Verification field | Value |
|---|---|
| Verification | `node --test test/pr-review-scripts.test.js test/pr-review-scripts-coverage.test.js test/akili-review-command.test.js test/stack-detection.test.js` |
| Falsifier | Remove `**/cdk.json` from the globs → its positive test goes red, with tier `lite` instead of `full` |
| Red run | Write the positive test first; at baseline it is expected to fail on the tier/`sensitive` assertion (to be quoted verbatim) |
| Disqualifier | A test that asserts the glob string exists in the source instead of calling the exported classification |
| Consumers | `grep -rn "SENSITIVE_GLOBS\|Dependency manifests" test/` → `test/akili-review-command.test.js` (run and list it); `docs/ci/*.yml` pin (release note only, P-17) |

**Done:** classification tests are red then green; the parity test is green; the version moved everywhere it is stated.

## T7: Review and security sites S7–S8 (FR-5)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Dependencies | T3, T6 |
| Requirements | FR-5 *Stack-aware review* (all clauses), *Security reconnaissance* (all clauses) |
| Design | §7 S7, S8; §5(c) review modes; DD-7 |
| Skills | `cognitive-doc-design`, `security-audit` (guidance: trust-boundary wording) |
| Review | `full`: trust-boundary text (2 rounds budgeted) |

**Scope:**
- **`akili-review.md` Step 2:** the lens brief names the stacks matched on the base tree (local carve-out or CI Glob/Read, by pointer to the table), the nearest-manifest mapping, references-only with nothing run, the new-manifest line, the addendum kept, and the BUT clause.
- **`akili-security.md` Step 2:** after **Run**, the reconnaissance brief carries the detected stacks and paths under the table's default rules, plus the BUT clauses (no vendored edit, no scope narrowing).
- **`docs/commands/akili-review.md`** and **`akili-security.md`:** a one-line mention.

**Tests:** reader checks for S7 and S8; S7 says "base", "nothing … run" and "new manifest"; S8 says "after **Run**" and "never narrows".

| Verification field | Value |
|---|---|
| Verification | `node --test test/stack-detection.test.js test/akili-review-command.test.js test/akili-security-command.test.js` |
| Falsifier | Change "base" to "head" in S7 → the assertion goes red |
| Red run | the reader test at baseline → `akili-review.md` lacks `stack-detection.md` (to be quoted) |
| Disqualifier | The text mentions the table, but the BUT clauses are missing (check each clause by name) |
| Consumers | `test/akili-review-command.test.js`, `test/akili-security-command.test.js` (existing text pins in those steps; run them) |

**Done:** both sites edited; existing command tests still green.

## T8: Backend routing for Java / Spring Boot (FR-6)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Dependencies | T2 |
| Requirements | FR-6 (THEN, AND, BUT no lead change) |
| Design | §4 backend-routing row; P-8 |
| Skills | `software-architect` |
| Review | `checklist`: rows in an existing schema |

**Scope:**
- **`backend-routing.md`:** *Backend route line* stack values add `Java / Spring Boot`; a Stack table row (`java-springboot`, its idiom); a matrix row `implement | Java / Spring Boot | java-springboot | method skills as constraints already in design.md | No decision recorded in design.md is reopened`; an expertise card (expert at, supports, must not decide (architecture style, adding infrastructure, Boot upgrades), evidence).
- **`AGENTS.md` *Backend Skills*:** a `java-springboot` bullet.
- **Routing tests:** counts 19→20 rows, 9→10 cards, 5→6 stacks, plus the skill lists (`NINE`, `AGENTS_LISTED`, `STACK`), and a check that no existing lead changed (diff the other rows).

**Tests:** as above.

| Verification field | Value |
|---|---|
| Verification | `node --test test/backend-skill-routing.test.js test/backend-skill-routing-coverage.test.js` |
| Falsifier | Give the new row two leads → the one-lead assertion goes red |
| Red run | the updated counts against the baseline file → `expected 20, got 19` (to be quoted) |
| Disqualifier | Count updates without a content assertion on the new row |
| Consumers | `test/backend-skill-routing*.test.js` (P-8) |

**Done:** rows present; tests green.

## T9: Docs pages, links, governance, CHANGELOG (FR-7, FR-8)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Dependencies | T2–T8 |
| Requirements | FR-7 (both scenarios), FR-8 (all clauses) |
| Design | §8, §9 `NOTICE` facts; DD-4, DD-10, DD-12 |
| Skills | `cognitive-doc-design` |
| Review | `full`: aggregate claims (KZ-002) |

**Scope:**
- **`docs/skills/java-springboot.md`:** author, license, binding, coverage, the pin, Boot 4.1.1 / 3.5.16, the Spring-marker rule, the sibling note (the seven names, optional, the `npx skills add` command, the docs fallback, never vendored), and the verdict and ratings as fetched.
- **`docs/skills/by-stack.md`:** per design §8.
- **Rows in** `docs/skills/README.md` (plus by-stack link), `docs/overview.md` (row + link), `docs/README.md` (link), README *Learn more* (row), `docs/skills/governance.md` *Current assignment* `stack` row, and `docs/flow.md` stack list.
- **`CHANGELOG.md` `Unreleased`:** the skill, the table and its readers, the review filter, `pr-review 1.1.0`, `akili-panel 1.1.3`, the page, and a release note to re-check the `docs/ci` pin.
- Run the KZ-002 falsifying greps for each aggregate claim before writing it.

**Tests:** in `test/stack-detection.test.js`, the by-stack exactness test (§8) and the four link checks.

| Verification field | Value |
|---|---|
| Verification | `node --test test/stack-detection.test.js test/docs-overview.test.js` |
| Falsifier | Remove `shadcn-ui` from by-stack → the exactness test goes red. Add `tdd` to a stack section → red |
| Red run | predicted — greenfield artifact (observed in T9) |
| Disqualifier | An exactness test whose expected set is parsed from the page itself |
| Consumers | `test/docs-overview.test.js` (inventory), `test/golang-skill.test.js:140-165` (governance row, docs page pattern) |

**Done:** pages and links are in, the CHANGELOG entry is written, and the KZ-002 greps are recorded.

## T10: Count sweep, panel catalog, contract tests, full verification, walkthrough (FR-3 sweep, FR-5 set, FR-9, NFR-3–5)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L |
| Dependencies | T1–T9 |
| Requirements | FR-9, FR-3 BUT (load-direct sweep), FR-5 *The set is checked* (test), NFR-3, NFR-4, NFR-5; the walkthrough defect class |
| Design | §11 P-9, P-15, P-18; §12; DD-11 |
| Skills | none extra |
| Review | `full` |

**Scope:**
- **Panel:** `flow.mjs` `SKILL_CATALOG` gets the entry; `plugin.json` and `README.md` move to `1.1.3`.
- **Counts:** update every P-9 and P-15 reader: 37→38, stack 15→16, 51→52, `SKILL_FILE_EXPECTED` +9, `SKILL_NAMES.stack`, the `doctor-codex-baseline.txt` line in sorted position, `docs/cli.md`, `docs/flow.md`. Re-run the P-9 grep afterwards; the expected output is no stale `37` in a skill context.
- **Tests:**
  - every S1–S8 reader names `stack-detection.md`;
  - no command restates a marker string (`org.springframework.boot`, `react-dom`, `AWS::Serverless-2016-10-31`);
  - no command load-directs `java-springboot` outside the pools;
  - no new test reads `docs/specs/changes/`.
- **Commands:** run `node bin/akili.js install --tool all --dry-run` and `node bin/akili.js doctor --tool all` against a temporary HOME. Expect `java-springboot` on every target, with no installer diff (`git diff --stat bin/`).
- **Full gates:** `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check`.
- **Walkthrough:** build three throwaway fixture repos in the scratchpad: (1) Spring Boot with a Gradle catalog plus Angular; (2) Quarkus `pom.xml`; (3) a Python CDK app (held out). Write the expected report lines first, then walk the table and record the actual lines in `execution.md`. JC's human check of this walkthrough is at the end of execution (mandate: no stop).

**Tests:** as above.

| Verification field | Value |
|---|---|
| Verification | the four gates; the install/doctor commands; the P-9 grep re-run |
| Falsifier | Leave one `37` in `install-akili-panel.test.js` → `npm test` goes red there. Remove the `SKILL_CATALOG` entry → `akili-panel-catalog.test.js` goes red |
| Red run | `npm test` after T2 and before T10 → the count tests are red (to be quoted from T2's interim list) |
| Disqualifier | A green run with a global `akili-specs` on PATH shadowing the local `bin/akili.js`: call `node bin/akili.js` explicitly. A doctor run against the real HOME |
| Consumers | all of P-9, P-15, P-18 |

**Done:** all four gates are green, the walkthrough is recorded, and the panel entry is in.

## Requirement ID Index

| ID | Tasks |
|---|---|
| FR-1 | T1 |
| FR-2 | T2 |
| FR-3 | T4, T5, T10 |
| FR-4 | T3 |
| FR-5 | T3, T4, T5, T6, T7, T10 |
| FR-6 | T8 |
| FR-7 | T9, T10 |
| FR-8 | T9, T10 |
| FR-9 | T10 |
| NFR-1, NFR-2 | T2 |
| NFR-3 | T3, T10 |
| NFR-4, NFR-5 | T10 |

**Estimated LOC:** about 1,560. **PR strategy:** one PR into `dev` when JC asks. It is above 400 LOC, but about 1,100 of it is tests and 8 files are vendored bytes. Reviewers should read in this order: `stack-detection.md`, then the six command diffs, then `post-review.cjs`, then the vendored folder last. **skip-eligible:** none.
