# Execution Log: Give Deployed Personas an Upgrade Path

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/persona-upgrade` |
| Approval Mode | `gated` through T2b (each continue gate answered by the user). **`pre-approved` from T3 on**: the user answered "pr-approved" at the T2b gate on 2026-09-30, to the question whether to continue, pause, or switch the spec to `pre-approved`. Exceptions still stop for the user: HALT, Pivot, budget tripwire, `FATAL_FAIL`, a `REVIEW_WAIVED` decision, the Leader-inline ask |
| Started | 2026-09-30, at `350c7eb` on `master` |
| Leader | This session. Command text: the installed `/akili-execute` |
| Workers | No Step 8E wrappers in this repository (`ls .claude/agents` → no such directory). Fallback path: a general-purpose worker told to load `.agents/<role>.md`. Implementer on `sonnet`, Reviewer on `opus` |
| Budget | 13 tasks · ~750 lines · 21 review rounds (`design.md` §9). **Amended 2026-09-30 at the T2 gate:** 14 tasks (T2b added) · ~1,700 lines excluding fixtures, fixture lines reported separately · 21 review rounds unchanged. Approved by the user, who delegated both open decisions to the Leader's stated recommendation ("lo que pienses que es mejor !"). **Amended again at the T3 gate (tripwire: 1,781 lines of ~1,700):** no line cap — lines reported only; **26 review rounds** (11 used at that point). The user: "continue !" |
| Measurement rule | No verification or measurement is run while a worker is active |
| Order | T1a runs alone, so its marker placement is reviewed before T1b–T1d copy it; the task graph allows T1a ∥ T1b |

## 2. Task Execution History

### T1a: Markers in `implementer.md` — PASS (2026-09-30)

| Field | Value |
|---|---|
| Final status | **PASS** on attempt 1 |
| Implementer attempts | 1 |
| Requirements covered | FR-1, FR-2; design §5.1, §5.2, DD-1, DD-2 |
| Files changed | `.claude/templates/implementer.md` (15 insertions, 0 deletions) |
| Evidence re-run | Leader-inline: **VERIFIED** |
| Review rounds used | 1 of 21 |
| Skills | None assigned. Deviation from the task's `cognitive-doc-design`: the work is marker insertion plus one sentence the brief fixed, so the skill had nothing to act on |
| Effort | Low to medium, steered in the brief (no per-spawn knob) |

**Attempt 1.**

| Item | Value |
|---|---|
| Files changed | `.claude/templates/implementer.md` |
| Implementer verification | Check 1: `grep -c` counts **6 / 6 / 1**. Check 2: marker-stripped diff against `HEAD` → `43d42` / `<     *   The project block below overrides any marked section.` and nothing else. Check 3: `wc -c` → 14,549 (growth 580, cap 650 over 13,969). Check 4: ids in order `context-alignment`, `scope-discipline`, `craft`, `verification`, `reporting`, `shared-file-discipline`. Check 5: `git diff --stat` → one file, 15 insertions |
| Falsifier | Executed on a scratch copy outside the tree: the first close marker deleted → check 1 reads **6 / 5** (red). The working-tree file re-counted afterwards: 6 |
| Red run | `n/a (no test gate)` |
| Whole-file read (Disqualifier) | Implementer listed the first and last line of each section's body: four item sections, two `##` sections, none holding a project fact. The Reviewer read the file whole and confirmed the placement |
| Evidence re-run | Leader-inline, after the worker reported and with no worker active. All five commands re-executed; outputs identical to the report. **VERIFIED** |
| Reviewer verdict | **PASS.** Summary: six sections in the listed order with `since=v2.30.0`; one empty project block after item 4's close marker; each body is exactly one item or one `##` section by the level rule; the `## 🎯 Primary Instructions` heading, `---` rules, title, intro, tier note and `## Authorship` stay unfenced; the precedence bullet is one sentence in the owned `context-alignment` section and resolves precedence in the project block's favor, as FR-2 states |
| runtime events | Implementer: spawn failure ×1 (`Could not determine current tmux pane/window`) → rung 1, immediate retry. No attempt consumed |

`spawns: implementer 20 calls, 122,260 tokens, ended complete; reviewer 7 calls, 72,116 tokens, ended complete`

**ADVISORY:** none (diff under 50 lines; the block is suppressed by the Reviewer's depth rule).

**Decisions made.**

| # | Decision | Reason |
|---|---|---|
| 1 | The precedence bullet reads `The project block below overrides any marked section.` (53 characters) in place of the task scope's phrase, "the project block below overrides any sentence in a marked section" (67 characters). The same sentence goes into T1b–T1d | The markers and project blocks of the four templates cost exactly 1,925 bytes (computed from the ids of design §5.2), which leaves 275 of T1d's 2,200-byte cap for four bullets. At the scope's wording the four bullets cost 301 bytes and the total is 2,226, 26 over. At the shortened wording they cost 245 and the total is 2,170. The brief may narrow; the requirement (FR-2: "the owned section SHALL say so in one sentence") is unchanged, and the Reviewer judged the shipped sentence against FR-2's text. No spec document was edited. **Reported to the user at the continue gate; confirmed by the user, 2026-09-30: "keep the shortened sentence"** |
| 2 | Placement conventions, tagged `[advisory-grade]` in the brief and audited as such: an open marker sits directly above the section's first line; a close marker directly after its last non-blank line; the project block's two lines directly after item 4's close marker, before the blank line and `---`; no blank line is added | Check 2 forbids any non-marker line change other than the bullet, and design §5.2 lists blank lines and `---` rules as unfenced. One convention across the four files keeps section bodies comparable for T2's parser and T5's digests |
| 3 | T1a ran alone rather than beside T1b | A placement defect found by the first review would otherwise cost one round per parallel file |

**Issues encountered.** One spawn failure before the worker started (above). The Implementer reported no contradiction between the new bullet and the rest of item 1 (Active Lesson KZ-changes--leader-brief-contract-1, read whole after the insertion).

**Forward pointers.**

| For | Pointer |
|---|---|
| T1b, T1c, T1d | Use the exact bullet of decision 1 and the conventions of decision 2; exemplar: `.claude/templates/implementer.md` as landed by this task |
| T1d | Running total after T1a: 72,221 + 580 = 72,801 bytes; cap 74,421 |

**Final verification.** Checks 1–5 green on the working tree, re-run by a non-author; Reviewer `PASS`.

### T1b: Markers in `reviewer.md` — PASS (2026-09-30)

| Field | Value |
|---|---|
| Final status | **PASS** on attempt 1 |
| Implementer attempts | 1 |
| Requirements covered | FR-1, FR-2; design §5.1, §5.2, DD-1, DD-2 |
| Files changed | `.claude/templates/reviewer.md` (15 insertions, 0 deletions) |
| Evidence re-run | Leader-inline: **VERIFIED** |
| Review rounds used | 2 of 21 |
| Skills | None assigned; same deviation and reason as T1a |
| Effort | Low to medium, steered in the brief |
| Parallel | Ran beside T1c (disjoint files, no build). Both re-runs were taken after both workers had reported |

**Attempt 1.**

| Item | Value |
|---|---|
| Files changed | `.claude/templates/reviewer.md` |
| Implementer verification | Check 1: counts **6 / 6 / 1**. Check 2: marker-stripped diff against `HEAD` → `31d30` / `<     *   The project block below overrides any marked section.` and nothing else. Check 3: `wc -c` → 12,314 (growth 581, cap 650 over 11,733). Check 4: ids in order `read-only-role`, `audit-checklist`, `structured-evaluation`, `lenses`, `depth-scaling`, `review-output`. Check 5: `git diff --stat` → `reviewer.md` 15 insertions, plus the Leader's uncommitted `execution.md` line (the user's confirmation), which is not this task's |
| Falsifier | Executed on a scratch copy outside the tree: the open marker of `review-output` deleted → check 1 reads **5 / 6** (red) |
| Red run | `n/a (no test gate)` |
| Whole-file read (Disqualifier) | `review-output` opens directly above `## 📝 Structured Review Output` and closes after Option C's closing code fence; the three `### Option` subsections are inside it; only a blank line and `---` stand between it and `## Authorship`. Confirmed by the Reviewer's own whole-file read |
| Evidence re-run | Leader-inline, no worker active. Outputs identical to the report. **VERIFIED** |
| Reviewer verdict | **PASS.** Summary: six sections fenced in file order with correct ids and `since=v2.30.0`; one empty project block directly after item 5's close marker; the precedence bullet is the last bullet of `read-only-role` and no sentence of item 1 contradicts it; zero removed lines; no marker inside a code fence (checked with a fence-tracking scan) |
| runtime events | none |

`spawns: implementer 21 calls, 106,460 tokens, ended complete; reviewer 7 calls, 69,493 tokens, ended complete`

**ADVISORY:** none (diff under 50 lines).

**Decisions made.** None new. The bullet wording and placement conventions are T1a's decisions 1 and 2; the user confirmed the shortened sentence before this task was dispatched.

**Issues encountered.** None.

**Final verification.** Checks 1–5 green on the working tree, re-run by a non-author; Reviewer `PASS`.

### T1c: Markers in `tester.md` — PASS (2026-09-30)

| Field | Value |
|---|---|
| Final status | **PASS** on attempt 1 |
| Implementer attempts | 1 |
| Requirements covered | FR-1, FR-2; design §5.1, §5.2, DD-1, DD-2 |
| Files changed | `.claude/templates/tester.md` (13 insertions, 0 deletions) |
| Evidence re-run | Leader-inline: **VERIFIED** |
| Review rounds used | 3 of 21 |
| Skills | None assigned; same deviation and reason as T1a |
| Effort | Low to medium, steered in the brief |
| Parallel | Ran beside T1b |

**Attempt 1.**

| Item | Value |
|---|---|
| Files changed | `.claude/templates/tester.md` |
| Implementer verification | Check 1: counts **5 / 5 / 1**. Check 2: marker-stripped diff against `HEAD` → `39d38` / `<     *   The project block below overrides any marked section.` and nothing else. Check 3: `wc -c` → 10,932 (growth 505, cap 550 over 10,427). Check 4: ids in order `context-alignment`, `prove-behavior`, `incremental-focus`, `bounded-loop`, `test-report`. Check 5: `git diff --stat` → `tester.md` 13 insertions, plus T1b's `reviewer.md` and the Leader's `execution.md`, neither this task's |
| Falsifier | Executed on a scratch copy outside the tree: one open marker duplicated → open **6**, close **5** (red) |
| Red run | `n/a (no test gate)` |
| Whole-file read (Disqualifier) | `test-report` runs from `## 📝 Structured Test Report Output` through Option C's closing code fence, its three `### Option` subsections inside. No section holds a project's test command: `bounded-loop` says only "Run your suite with the project's real test command", and the `COMMAND:` lines of the report shapes are placeholders. Confirmed by the Reviewer |
| Evidence re-run | Leader-inline, no worker active. Outputs identical to the report. **VERIFIED** |
| Reviewer verdict | **PASS.** Summary: five sections fenced in file order with `since=v2.30.0`, each exactly one item or one `##` section; one empty project block after item 4; the precedence bullet ends `context-alignment` and matches the sentence in the other two landed templates; no other character changed; no marker inside a code fence |
| runtime events | none |

`spawns: implementer 16 calls, 114,000 tokens, ended complete; reviewer 9 calls, 70,027 tokens, ended complete`

**ADVISORY:** none (diff under 50 lines).

**Decisions made.** None new.

**Issues encountered.** None. The Reviewer noted one concrete string inside `test-report`, the illustrative `npx vitest run src/loan` in Option A's example block, and judged it a format example in a stack-agnostic template, not a project's test command; this task may not change that text.

**Forward pointers.**

| For | Pointer |
|---|---|
| T1d | Running total after T1a–T1c: 14,549 + 12,314 + 10,932 + 36,092 (`leader.md`, unmarked) = 73,887 bytes. Cap 74,421, so `leader.md` may grow by at most 534; its own task cap is 550. Five sections, one project block and the bullet at the Leader's bullet prefix are computed at 504 |

**Final verification.** Checks 1–5 green on the working tree, re-run by a non-author; Reviewer `PASS`.

### T1d: Markers in `leader.md` — PASS (2026-09-30)

| Field | Value |
|---|---|
| Final status | **PASS** on attempt 1 |
| Implementer attempts | 1 |
| Requirements covered | FR-1, FR-2, NFR-3; design §5.1, §5.2, DD-1, DD-2 |
| Files changed | `.claude/templates/leader.md` (13 insertions, 0 deletions) |
| Evidence re-run | Leader-inline: **VERIFIED** |
| Review rounds used | 4 of 21 |
| Skills | None assigned; same deviation and reason as T1a |
| Effort | Medium, steered in the brief (a 36 KB file) |
| Gate | User: "continue" (2026-09-30), after the T1b/T1c gate |

**Attempt 1.**

| Item | Value |
|---|---|
| Files changed | `.claude/templates/leader.md` |
| Implementer verification | Check 1: counts **5 / 5 / 1**. Check 2: marker-stripped diff against `HEAD` → `37d36` / `<    * The project block below overrides any marked section.` and nothing else. Check 3: `wc -c` → 36,596 (growth 504, cap 550 over 36,092). Check 4: ids in order `primary-instructions`, `delegation`, `test-harness`, `reporting`, `shared-file-discipline`. Check 5: `git diff --stat` → one file, 13 insertions. Check 6: `wc -c` of the four templates → 14,549 + 12,314 + 10,932 + 36,596 = **74,391** (cap 74,421) |
| Falsifier | Executed on a scratch copy outside the tree: `delegation`'s close marker moved below `test-harness`'s open marker → the read shows `test-harness` opening at line 324 with `delegation`'s close at line 325, a section opening inside another. The counts on that copy still read 5 / 5 / 1, which is why the task's falsifier is a read and not a count |
| Red run | `n/a (no test gate)` |
| Whole-file read (Disqualifier) | `delegation` runs from `## 📏 Delegation Thresholds` to the last line of *Deferring a check* and closes before the `---` that precedes `## 🧪`. `grep -c '^### '` → **6**, all six inside the fence; none added or split. No removed line, so every hard wrap is unchanged |
| Evidence re-run | Leader-inline, no worker active. All six outputs identical to the report. **VERIFIED** |
| Reviewer verdict | **PASS.** Summary: five sections fenced in file order, none nested, each `since=v2.30.0`; `primary-instructions` holds items 1–4 and nothing else; one empty project block directly after it; the precedence bullet is the last bullet of item 4 and no sentence of items 1–4 contradicts it; unfenced text matches §5.2's allowed list; the file has no code fence; four-file growth against `1cc75a0` is 580 + 581 + 505 + 504 = 2,170 of 2,200 |
| runtime events | none |

`spawns: implementer 27 calls, 107,996 tokens, ended complete; reviewer 8 calls, 66,294 tokens, ended complete`

**ADVISORY:** none (diff under 50 lines).

**Decisions made.** None new.

**Issues encountered.**

| # | Issue | Handling |
|---|---|---|
| 1 | The task's Disqualifier says `delegation` "must hold all seven `###` subsections". The template has six, on the working tree and at the baseline `1cc75a0` (`grep -c '^### '` → 6 on both). The count in the task text was never run | The brief carried the Disqualifier verbatim plus the measured count and its command, and asked for the obligation (every `###` of the section inside the fence) to be checked. Implementer and Reviewer both re-counted six. `tasks.md` was not edited. A recurrence of Active Lesson KZ-changes--leader-brief-contract-2, for the retrospective |

**NFR-3 closed for the template tasks.** Four-file total 74,391 bytes; growth 2,170 of 2,200; 30 bytes of margin. Any later edit to a template in this spec must re-measure.

**Forward pointers.**

| For | Pointer |
|---|---|
| T2 | Shapes the parser and its fixtures meet in the marked templates: `leader.md` holds column-0 numbered items inside `##` sections (the steps of *Deferring a check*, the `test-harness` list, the `reporting` list), and `primary-instructions` is one fence around four column-0 items; `reviewer.md` and `tester.md` each hold a column-0 `1.  **` line inside a code fence in their output section; `leader.md` has no code fence. A marked persona is parsed by its markers, so these matter to the grammar check only |
| T4, T5 | Design §5.2 defines `primary-instructions` as "items 1–4 as one", while its level rule says an item section "runs to the next item at column 0". Cutting an **unmarked** `leader.md` (the migration, and the legacy digest seed) by the level rule alone would end that section at item 2. If the two readings cannot both be implemented, that is a design question for the user before code, not a choice for the brief |

**Final verification.** Checks 1–6 green on the working tree, re-run by a non-author; Reviewer `PASS`.

### T2: Parser, section states, report

Status while in rework: `[~]`. The closing table is written when the loop ends.

**Attempt 1 — FAIL** (2026-09-30). Effort `high`. Skills `tdd`, `error-handling-patterns`, as the task lists.

| Item | Value |
|---|---|
| Files changed | `bin/akili.js` (+97 −1), `bin/persona.js` (new, 265 lines), `package.json` (+1), `test/agents-doctor.test.js` (new, 177 lines), `test/fixtures/personas/` (new): `verbatim-marked.md`, `crlf.md`, `custom-edited.md`, `extra-section.md`, `missing-section.md`, `unlocated.md`, `two-project-blocks.md`, `unclosed-marker.md`, `pre-marker-old-scaffold.md`, `rewritten-star-style.md` |
| Implementer verification | Check 1: `npm test` → 19 tests, 19 pass. Check 2: verbatim copies of the four templates as `.agents/` in a temp dir → every section `CURRENT`, exit 0. Check 3: one body edited → `CUSTOM-EDITED craft`, exit 0. Check 4: one close marker deleted → `UNREADABLE section id=verification opens inside id=craft`, exit 1. Check 5: `doctor --tool claude` against the Leader's pre-edit baseline → empty diff. Check 6: `verify:cli` passes; `"dependencies"` count 0, unchanged. Check 7: `git diff --stat` → `bin/akili.js`, `package.json`; untracked `bin/persona.js`, `test/` |
| Falsifier | Executed: `if (pHash === currentHash)` → `if (true)`; the custom-edited and outdated tests went red (`expected: 'custom-edited', actual: 'current'`; `expected: 'outdated', actual: 'current'`), the other 17 stayed green |
| Red run | As reported: `sectionStates` stubbed to throw, a test helper catching the throw so the assertion fails; 12 of 19 red on `AssertionError`. **Found insufficient by the Reviewer (issue 2)** |
| Consumers | `grep -rn "doctor" scripts/ci .github` → hits read, none pins output text. `node scripts/ci/install-layout-regression.js` (installs into `mkdtemp` directories with `HOME` overridden, confirmed at source) → exit 0 |
| Evidence re-run | Leader-inline, no worker active. `npm test` 19/19; own temp dirs → all `CURRENT` exit 0, `CUSTOM-EDITED craft` exit 0, `UNREADABLE section id=incremental-focus opens inside id=prove-behavior` exit 1 (a different close marker deleted); check 5 diff empty; checks 6 and 7 identical. Also `npm run pack:dry-run` (lists `bin/persona.js`, no `test/`) and `git diff --check` (clean). **VERIFIED** |
| Reviewer verdict | **FAIL**, three issues (full report below) |
| runtime events | none |

`Not Done / Assumptions` (verbatim from the Implementer's report; assumptions only, no owed item, so not a continuation):

> - `sectionStates`'s digest parameter, when empty (no `digests.json` until T5), is hard-coded as `AGENTS_DIGESTS = {releases:{}, legacy:{}}` in `bin/akili.js` rather than reading a file — per the brief's own note this is correct for T2; `loadTemplates()` (T5) will replace the constant.
> - The "STAR-modelled" fixture (`rewritten-star-style.md`) is a synthetic persona built to match the requirements/design description (front matter, renamed role, one-space items, two retitled items, no `## Authorship`) — I do not have access to the actual downstream STAR repo, so it is modelled, not copied.
> - Report row formatting (colors, `Tool root (info only):` lines, section state labels) is my own design within design §6's stated constraints (row style, states named, CLI release + tool root printed) — no exact string was mandated beyond that, and no consumer pins it (confirmed by the grep above).
> - `--fix`, guards, backup, and migration are untouched (T3/T4 scope) — `runAgentsDoctor` is report-only as scoped; `args.section`/`args.allowBranch` are parsed and mapped but not yet consumed anywhere, as instructed.

**Reviewer report, attempt 1 (verbatim).**

```text
STATUS: FAIL
ISSUES: 3. The §5.4 state logic, the exit-code rule, the `--tool` invariance, the `.agents/` absent line, the release/tool-root header and the `doctor` dispatch all conform (`--tool` only feeds the printed root; states always use `SOURCE_TEMPLATES`). The failures are one parser gap and two test/evidence gaps.

1. **Discovered Issue:** `parsePersona` only counts project-block markers. Two cases therefore parse as readable:
   - A project close that comes before its open (counts 1/1).
   - A project block inside an owned section (section open → project open → project close → section close). The project block becomes part of the section body, so a later T3 `--fix` replacing that body would delete project space (NFR-4).
   - **Violated Rule:** design §5.1: "Nesting is not allowed. A persona is `unreadable` when an open has no close, a close has no open, a section opens inside another…"; FR-3 table `unreadable`: "A marker is malformed: unclosed, nested…".
   - **Remediation Suggestion:** Track project-block state in the same scan loop:
     - A project close with no project open → `unreadable`.
     - A project open while a section is open, or a section open while the project block is open → `unreadable` (nested).
     - Add a fixture for each case and see each one red on its `status` assertion first.

2. **Discovered Issue:** The red-run evidence does not meet the task's own Red run field ("Each test observed failing **on its state assertion**…").
   - (a) Tests 5 (crlf), 7 (outdated) and 17 (absent) call `sectionStates` directly, not through `computeStates`. With the stub throwing, they go red on the thrown error, not on an assertion. That is the case the Leader's narrowing excluded, and it contradicts the claim "each on `AssertionError`".
   - (b) Seven tests (1–3, 15, 16, 18, 19) were never seen red at all.
   - **Violated Rule:** FR-9: "Each test SHALL be observed red on its assertion before the code that makes it green exists"; task Red run field (quoted above).
   - **Remediation Suggestion:**
     - Route tests 5, 7 and 17 through `computeStates`, or catch the error in them, and re-record their reds.
     - For the parser and normalization tests, stub `parsePersona` / `normalizeBody` / `hashBody` (for example, to return the input unchanged or an empty structure) and record each red by test name.

3. **Discovered Issue:** Test 18 ("same states whichever `--tool` is passed") calls `computeStates` twice with identical inputs and no tool involved. It cannot go red under any implementation: it stayed green even with the stub throwing, because both error objects were equal. It claims coverage of an FR-3 scenario it cannot evaluate. This is the Disqualifier's inert case: the two runs never differ on the axis being asserted.
   - **Violated Rule:** FR-3 scenario "AND IT MUST give the same states whichever `--tool` is passed" (named in the Requirements field); task Disqualifier ("A green suite whose fixtures never differ on the asserted axis is an inert fixture").
   - **Remediation Suggestion:** Replace it with a CLI-level test:
     - Spawn `node bin/akili.js doctor --agents --tool claude` and `--tool opencode` in a temp dir with `.agents/` from the fixtures and HOME overridden.
     - Assert the state rows are identical and the exit codes match.
     - Assert that a missing `.agents/` gives one line and exit 1 (that path currently has no test and no recorded evidence).
     - If that is out of scope, delete the claim and record the gap explicitly.

ADVISORY
- RELIABILITY: `sectionStates` expects a role-scoped table (`releases[r][id]`, `legacy[id][tag]`), but design §5.3 is keyed by role first (`releases[r][role][id]`, `legacy[role][id]`). `runAgentsDoctor` passes `AGENTS_DIGESTS` unscoped; that only works because the table is empty. T5 must pass the per-role slice, or every outdated section silently becomes `custom-edited`. A short comment at the call site would prevent this.
- RELIABILITY: A marker line with trailing whitespace, an uppercase id, or a malformed `since` does not match the strict regexes and is treated as plain text. The persona then reports `missing` or `unmarked` instead of `unreadable`. Consider trimming trailing whitespace on candidate lines, and treating any `<!-- akili:` line that fails the grammar as `unreadable`.
- READABILITY: Test 19's name says front matter is "never scanned for markers", but it only asserts that `frontMatter` exists. Add a marker inside the front matter and assert it is ignored.
- RISK: `pre-marker-old-scaffold.md` is not a verbatim copy of any tag. The closest is v2.18.0, with one line removed. The FR-3 "verbatim older persona" scenario is covered only structurally, since unmarked handling ignores content. T4's own fixture should come from `git show <tag>:` byte for byte.
- SCOPE: The four extra fixtures (`extra-section`, `unlocated`, `pre-marker-old-scaffold`, `rewritten-star-style`) are justified by "every FR-3 state". Scope discipline does not exclude them, and they touch no banned path. `package.json` gains only the `test` script; no dependency is added.
- READABILITY: `resultExitCode` returns 0 for an unmarked result with zero sections. That path can't happen, because every template has sections; it can be removed.
```

**Leader adjudication, attempt 1.** All three issues are in scope for T2: issue 1 is design §5.1's nesting rule; issues 2 and 3 are FR-9 and an FR-3 scenario the task's Requirements field names. Issue 3's alternative ("delete the claim and record the gap") is not available, because the coverage table assigns that scenario to T2. The advisories are recorded here and are not work items. Attempt 2 runs at effort `xhigh` with this report relayed unchanged.

`spawns (attempt 1): implementer 74 calls, 220,573 tokens, ended complete; reviewer 11 calls, 96,927 tokens, ended complete`

**Issues encountered, attempt 1.** The Implementer made 74 tool calls against the 60-call bound stated in its brief and did not checkpoint. The deployed `.agents/implementer.md` in this repository predates the bound (it is the older scaffold this spec's FR-5 scenario names), so the bound reached the worker through the brief alone.

**Decisions made, attempt 1.**

| # | Decision | Reason |
|---|---|---|
| 1 | The check 5 baseline was captured by the Leader before the spawn (`node bin/akili.js doctor --tool claude`, exit 0, 67 lines, at `acd119c`, stable across two runs), in place of the task's "`git stash`-ed baseline" | A stash by the worker would hide its own work; the Disqualifier's condition (captured before any edit to `bin/akili.js`) holds |
| 2 | The brief narrowed the Red run field: the red that counts is the assertion failing, not a throw that pre-empts it | The field says both "on its state assertion" and "stubbed to throw"; a throwing stub can end a test before its assertion. The Reviewer applied this narrowing in issue 2(a) |

**Attempt 2 — FAIL** (2026-09-30). Effort `xhigh`. Same skills. Feedback: the attempt-1 Reviewer report, verbatim, plus the adjudication above and a one-line Attempt History.

| Item | Value |
|---|---|
| Files changed | `bin/persona.js` (project-block order and nesting tracked in `parsePersona`; now 284 lines), `test/agents-doctor.test.js` (three tests rerouted through `computeStates`, the inert test removed, four tests added; now 243 lines, 22 tests), `test/fixtures/personas/project-close-before-open.md` and `project-nested-in-section.md` (new). `bin/akili.js` and `package.json` unchanged from attempt 1 |
| Implementer verification | Check 1: `npm test` → 22 tests, 22 pass. Checks 2–4: all `CURRENT` exit 0; `CUSTOM-EDITED craft` exit 0; `UNREADABLE section id=verification opens inside id=craft` exit 1. Check 5: diff against the baseline empty. Check 6: `verify:cli` exit 0; `"dependencies"` count 0. Check 7: only `bin/akili.js`, `bin/persona.js`, `package.json`, `test/` beside the Leader's two spec files. Consumer suite `node scripts/ci/install-layout-regression.js` → exit 0 |
| Falsifier | Re-executed on the reworked code: hash comparison forced true → tests 6 and 7 red (`'current' !== 'custom-edited'`, `'current' !== 'outdated'`), the other 20 green; reverted |
| Red run | A red recorded for every test, each an assertion failure: stubs of `normalizeBody`, `hashBody`, `parsePersona` for the parser tests; `sectionStates` throwing behind `computeStates` for the state tests; the two new parser tests red against the unfixed parser (`false !== true`); the CLI `--tool` test red on `1 !== 0` (exit codes); the CLI missing-`.agents/` test red on `0 !== 1` with the `ABSENT` line removed. **The `--tool` test's red was found not to be on its row comparison (Reviewer issue 1)** |
| Evidence re-run | Leader-inline, no worker active. `npm test` 22/22; own temp dirs → 22 `CURRENT` exit 0, `CUSTOM-EDITED craft` exit 0, `UNREADABLE section id=verification opens inside id=craft` exit 1; check 5 diff empty; checks 6–7 identical; the `bin/akili.js` hunk hashes equal to attempt 1's (no stub left). Leader probes: nested-project fixture → `UNREADABLE project block opens inside section id=craft`, exit 1; close-before-open fixture → `UNREADABLE project block close with no open at line 98`, exit 1; no `.agents/` → one `ABSENT … does not exist` line, exit 1. **VERIFIED** |
| Reviewer verdict | **FAIL**, one issue (full report below). Attempt 1's issues 1 and 2 closed; issue 3 partly |
| runtime events | none |

**Reviewer report, attempt 2 (verbatim).**

```text
STATUS: FAIL
ISSUES: 1. Issues 1 and 2 from attempt 1 are fixed. Issue 3 is only partly fixed: the new CLI `--tool` test compares state rows that its own filter always drops, so the "same states" check passes on two empty lists.

**Check 1 (issue 1): fixed.** I walked every cause in the §5.1 `unreadable` sentence through the scan loop, plus the orderings between them. Each cause now reaches a flag:
- Open with no close: `unclosed section` for a section; the count-mismatch check for the project block.
- Close with no open: `close marker with no open` for a section; the new `projectIsOpen` guard for the project block.
- Section inside section, project inside section, section inside project: each has its own flag.
- Duplicate id, project count ≠ 1, and two migration records: each flagged.
- A project block opened twice (open, open, close, close) is caught by the count check.
- The `unmarked` exception holds, because `anyMarker` gates every flag.

I found no marker ordering that still parses as readable. Both new fixtures differ from the verbatim one on the asserted axis: close at line 99 before open at 100; project block at lines 58–59 inside `craft`.

**Check 2 (issue 2): fixed.** All 22 tests have a recorded red, and each red is an assertion failure, not a thrown error. Tests 5, 7 and 17 now go through `computeStates` or parse directly. The one exception is test 18: its red came from the absolute `exitCode === 0` assertion, never from the row comparison (see issue 1 below).

**Checks 4 and 5: pass.** Every §5.4 row maps to exactly one branch and the exit-code rule is unchanged. `doctor` without `--agents` still dispatches to `runDoctor`.

1. **Discovered Issue:** Test 18 ("CLI: … same section states … whichever --tool is passed") cannot detect a difference in states.
   - `runAgentsDoctor` prints each row as `    ${color}${STATE}${colors.reset}  id`.
   - `colors` in `bin/akili.js` (line 99) is always ANSI; there is no TTY or `NO_COLOR` check.
   - So every row line is `    \x1b[32mCURRENT…`. The filter `/^\s+(CURRENT|…)\b/` never matches, because `\s` does not include `\x1b`.
   - Both `stateLines` arrays are therefore always `[]`, and `assert.deepEqual` compares two empty lists.
   - Only exit-code equality is actually tested. If `--tool opencode` reported `CUSTOM-EDITED` where `--tool claude` reported `CURRENT`, both runs would exit 0 and the test would stay green.
   - This matches the recorded red: it fired on `1 !== 0` (the exit-code check), never on the row comparison.
   - **Violated Rule:** FR-3 scenario "AND IT MUST give the same states whichever `--tool` is passed". Task Disqualifier: "A green suite whose fixtures never differ on the asserted axis is an inert fixture". FR-9: "Each test SHALL be observed red on its assertion before the code that makes it green exists". The Leader's adjudication of issue 3 requires "Assert the state rows are identical".
   - **Remediation Suggestion:**
     - Strip ANSI codes before filtering, e.g. `line.replace(/\x1b\[[0-9;]*m/g, "")`.
     - Assert the row count is non-vacuous: 22 rows, one per section across the four templates.
     - Record a red on the `deepEqual` itself. For example, stub `runAgentsDoctor` so the state depends on the tool (`--tool opencode` forces `custom-edited` on one section), then revert.

**Leader-observed `git diff --check` findings: not a T2 violation.** The CRLF lines in `crlf.md` are required by FR-9, which names a CRLF fixture. The trailing space on line 3 of the other fixtures is copied byte-for-byte from the template at HEAD. Neither T2's Requirements field nor its verification fields include `git diff --check`.

ADVISORY
- RISK (possible spec gap, for the user): the repo has no `.gitattributes`. If git converts line endings on a Windows checkout, the LF fixtures could become CRLF, and test 3's `eol === "\n"` would go red. `crlf.md` could also be normalized to LF at commit time on a machine with `core.autocrlf` set. This matters once T6 adds `npm test` to the three-OS CI matrix. Consider `test/fixtures/personas/** -text`. The same gap explains the `diff --check` noise.
- RELIABILITY: test 18 does not install templates under both tool roots, so it does not literally set up the scenario's GIVEN ("Claude Code and OpenCode templates both installed"). Installing templates that differ under the claude and opencode roots in the temp HOME would make the test prove that states ignore the installed copy.
```

**Leader adjudication, attempt 2.** The issue is real and in scope. Confirmed inline before spending the last attempt: `od -c` on a report row shows four spaces then `\033[32m` before `CURRENT`, and the test's filter is `/^\s+(CURRENT|…)\b/`, so it matches no row. Attempt 3 is the last of the ceiling; it carries this report unchanged. The two advisories are recorded and are not work items; the first is taken to the user as a possible spec gap (below).

`spawns (attempt 2): implementer 64 calls, 192,124 tokens, ended complete; reviewer 10 calls, 91,064 tokens, ended complete`

**Issues encountered, attempt 2.**

| # | Issue | Handling |
|---|---|---|
| 1 | The Implementer self-reported "~40 of the 60-call budget"; the host counted 64. Second spawn over the bound with no checkpoint, and this time with a wrong self-count | Information only. For the retrospective: the bound is not reaching workers whose deployed persona predates it |
| 2 | `git diff --check` flags the fixtures only: all 130 lines of `crlf.md` (CRLF by design) and line 3 of ten other fixtures (a trailing space the template has at `HEAD`). `bin/`, `package.json` and the test file are clean. The repository has no `.gitattributes`; CI runs on `ubuntu-latest`, `macos-latest`, `windows-latest` | Ruled not a T2 violation by the Reviewer. Root `AGENTS.md` lists `git diff --check` before committing package changes, and byte-exact fixtures may not survive a line-ending-converting checkout once T6 adds `npm test` to CI (`UNVERIFIED`: the Windows runner's setting). No approved task owns a `.gitattributes`: **a possible spec gap, raised to the user at the T2 gate** — never absorbed into a task by the Leader |

**Attempt 3 — PASS** (2026-09-30). Effort: maximum care on a small change, steered in the brief. Skill `tdd`. Feedback: the attempt-2 Reviewer report, verbatim, the adjudication, and an Attempt History.

| Item | Value |
|---|---|
| Files changed | `test/agents-doctor.test.js` only: a `stripAnsi` helper, the row filter applied after stripping, and two row-count assertions (22 each) before the `deepEqual`. `bin/akili.js`, `bin/persona.js`, `package.json` and the 12 fixtures byte-identical to attempt 2 (hashes recorded by the worker before and after; re-checked by the Leader) |
| Implementer verification | Check 1: `npm test` → 22 tests, 22 pass. Checks 2–4: all `CURRENT` exit 0; one `CUSTOM-EDITED` exit 0; `UNREADABLE section id=scope-discipline opens inside id=context-alignment` exit 1. Check 5: baseline diff empty. Check 6: `verify:cli` ok; `"dependencies"` count 0. Check 7: file set unchanged |
| Red run (the `--tool` test) | `runAgentsDoctor` temporarily mutated so `--tool opencode` reports the first section of each persona as `custom-edited`; both runs still exit 0; the test failed on its `deepEqual` (`+ '    CURRENT  primary-instructions'` / `- '    CUSTOM-EDITED  primary-instructions'`, `ERR_ASSERTION`). Rows per run: 22 and 22. Reverted; hashes identical |
| Falsifier | Re-executed on the final code: hash comparison forced true → tests 6 and 7 red on their state assertions, the other 20 green; reverted, hash identical |
| Consumers | Suite not re-run: production code did not change in this attempt (it ran green in attempts 1 and 2) |
| Evidence re-run | Leader-inline, no worker active. `npm test` 22/22; own temp dirs → 22 `CURRENT` exit 0, `CUSTOM-EDITED craft` exit 0, `UNREADABLE section id=audit-checklist opens inside id=read-only-role` exit 1; baseline diff empty; checks 6–7 identical. **Mutation reproduced independently on a scratch copy** of `bin/`, `test/` and the templates: `craft` printed as `CUSTOM-EDITED` only when the tool is `opencode` → 22 tests, 21 pass, 1 fail: `not ok 18 - CLI: doctor --agents gives the same section states and exit code whichever --tool is passed (FR-3)`, `operator: 'deepStrictEqual'`, `+ '    CURRENT  craft'` / `- '    CUSTOM-EDITED  craft'`. **VERIFIED** |
| Reviewer verdict | **PASS.** Summary: the `--tool` test now compares real state rows; the ANSI strip makes the filter match; the two 22-row assertions stop the comparison from passing on empty lists; the recorded red is an `ERR_ASSERTION` from the `deepEqual` itself. Nothing else changed, and the round-2 rulings on the parser, the other reds, the §5.4 rows and `doctor` without `--agents` stand. No new advisories |
| runtime events | none |

`Not Done / Assumptions` (verbatim, attempt 3; a judgment call, no owed item):

> - None on the assigned ISSUE. One judgment call: for verification check 4 I deleted the close marker preceding `scope-discipline`'s open (rather than, say, `context-alignment`'s own close) because removing any single close marker collapses two sections into one open span, which the parser correctly reports as nesting (`UNREADABLE ... opens inside ...`) — this is the same `unreadable` class the check asks for (a dropped close marker → unreadable, exit 1), just surfaced via the nesting branch rather than an "unclosed section" branch, since a `.md` template file needing that specific text edit isn't a fixture I'm allowed to modify (fixtures are frozen this attempt) and templates aren't listed as off-limits for this throwaway temp-dir copy, so I edited a copy in the temp dir, not the repo's `.claude/templates/`.

`spawns (attempt 3): implementer 39 calls, 107,772 tokens, ended complete; reviewer (the round-2 Reviewer, resumed) 3 calls, 95,279 tokens, ended complete`

**Decision, attempt 3.** The round-3 review went to the round-2 Reviewer, resumed by message, not to a fresh one: it raised the only open issue, 25 diff lines changed, and it had audited the rest of the task one round earlier. It remains a different model and context from the Implementer.

**T2 closing record — PASS (2026-09-30).**

| Field | Value |
|---|---|
| Final status | **PASS** on attempt 3 of 3 |
| Implementer attempts | 3 |
| Requirements covered | FR-3, FR-9 (the runner, the fixtures, red before green), NFR-1, NFR-2; design §5.1, §5.4, §6 (report-only), §7, DD-9 |
| Files changed | `bin/akili.js` (+97 −1), `bin/persona.js` (new, 284 lines), `package.json` (+1), `test/agents-doctor.test.js` (new, 22 tests), `test/fixtures/personas/` (new, 12 files) |
| Evidence re-run | Leader-inline on every attempt: **VERIFIED** ×3 |
| Review rounds used | 3 for this task; **7 of 21** in total |
| Skills | `tdd`, `error-handling-patterns` as the task lists (`tdd` alone on attempt 3) |
| Advisories | Recorded in the attempt-1 and attempt-2 reports above; none became work |
| Committer checks (root `AGENTS.md`) | `npm run verify:cli` ok; `npm run pack:dry-run` lists `bin/persona.js` and no `test/`; `git diff --check` clean on `bin/`, `package.json` and the test file, and flagging the fixtures only (attempt 2, issue 2) |

**Forward pointers.**

| For | Pointer |
|---|---|
| T3 | `parsePersona` flags a project block inside an owned section as `unreadable`; §5.4 makes `--fix` skip an unreadable file, which is what keeps a replaced body from ever holding project space (NFR-4) |
| T3, T5 | `sectionStates` takes a **role-scoped** digest slice (`releases[r][id]`, `legacy[id][tag]`), while design §5.3's file is keyed by role first. `runAgentsDoctor` passes a constant empty table today; the code that loads `digests.json` must pass the per-role slice, or every outdated section reads as `custom-edited` |
| T4 | `pre-marker-old-scaffold.md` is not a byte-for-byte copy of any tag (closest: v2.18.0 with one line removed), and `rewritten-star-style.md` is modelled, not copied. T4's scope names its own two fixtures; "an older tagged template copied verbatim" comes from `git show <tag>:` |
| T6 | The CLI test already spawns the real CLI in a `mkdtemp` directory; the missing-`.agents/` line has a test |

## Constitution Impact: T2

| Item | Value |
|---|---|
| Module created | `bin/persona.js` — pure persona functions, required by `bin/akili.js` and later by `scripts/release.js`. New `test/` folder and an `npm test` script (`node --test`) |
| Child guide needed | No; one module with no divergent conventions |
| Parent guide | Root `AGENTS.md`: *Repository Purpose* names `bin/akili.js` only, and *Verification* lists three commands without `npm test`. Both to be updated at `/akili-archive` |
| CodeGraph | Re-index pending: `bin/persona.js` and `test/` are not in the graph |

## Budget tripwire: lines (raised at the T2 gate, 2026-09-30)

| Number | Budget (`design.md` §9) | Actual after T2 | Note |
|---|---|---|---|
| Tasks | 13 | 5 done | — |
| Review rounds | 21 | 7 used | T2 was budgeted one round and took three; 14 rounds remain for 8 tasks budgeted at 12 |
| Lines | ~750 | **694** of code, tests and template lines; **2,094** with the fixtures | Templates 56 · `bin/` + `package.json` + test file 638 · fixtures 1,400 in 12 files |

**Cause.** The budget's basis ("CLI ~400, tests ~230, templates ~70, release/CI ~20, prose ~50") has no line for fixtures, and each fixture is a whole persona (about 130 lines). Counting them, the budget is exceeded now; without them, 56 lines remain for T3–T10, which include the fix, the guards and the migration. **Stopped for the user at the T2 gate** with this delta.

## Spec gap record: fixture line endings (T2 gate, 2026-09-30)

| Item | Value |
|---|---|
| Found by | The Leader's committer checks on T2 attempt 2; ruled "not a T2 violation" and raised as a possible spec gap by the round-2 Reviewer |
| Gap | The fixtures must stay byte-exact (one is CRLF by design), and no approved task pinned their line endings: no `.gitattributes` exists, `git diff --check` flags the fixtures, and CI runs on three operating systems |
| Options put to the user | Add a `.gitattributes` now as its own approved change (recommended) · fold it into T6 · leave it out |
| Decision | **Add it now**, as task **T2b** in `tasks.md`. The user delegated the choice to the Leader's recommendation |
| Readings run before the task was written | At `ec78ee4`: `git diff --check acd119c HEAD -- test/fixtures` → exit 2; attributes `unspecified`. In a scratch clone with `*.md -text -whitespace` committed: exit 0; `text: unset`, `whitespace: unset`; `i/crlf w/crlf attr/-text` for `crlf.md` |
| Line budget | Decided at the same gate: continue, cap raised to ~1,700 lines excluding fixtures (Document Control) |
| Spec documents amended | `tasks.md` only: T2b added, §5 *Amendments at Execute Time*. `requirements.md` and `design.md` unchanged: no requirement changes meaning |

### T2b: Fixture line endings are pinned — PASS (2026-09-30)

| Field | Value |
|---|---|
| Final status | **PASS** on attempt 1 |
| Implementer attempts | 1 |
| Requirements covered | FR-9 (the CRLF fixture and every other fixture reach a checkout byte for byte) |
| Files changed | `test/fixtures/personas/.gitattributes` (new, one line: `*.md -text -whitespace`) |
| Evidence re-run | Leader-inline: **VERIFIED** |
| Review rounds used | **8 of 21** |
| Skills | None, as the task lists |
| Effort | Low, steered in the brief |
| Gate | The task exists by the user's decision at the T2 gate (*Spec gap record*, above) |

**Attempt 1.**

| Item | Value |
|---|---|
| Files changed | `test/fixtures/personas/.gitattributes` |
| Implementer verification | Check 1: `git check-attr text whitespace -- test/fixtures/personas/crlf.md` → `text: unset`, `whitespace: unset`. Check 2, file staged: `git diff --cached --check` → exit 0; `git diff --check acd119c -- test/fixtures` → exit 0 (baseline exit 2). Check 3: `git ls-files --eol` → `i/crlf w/crlf attr/-text` for `crlf.md`, `i/lf w/lf attr/-text` for `verbatim-marked.md`. Check 4: `npm test` → 22 pass, 0 fail. Check 5: `git status --short` → `A  test/fixtures/personas/.gitattributes` only |
| Falsifier | Executed in a scratch clone: with the file, `git diff --check acd119c -- test/fixtures` → exit 0; file deleted → exit 2 with `trailing whitespace.` lines |
| Red run | `n/a (no test gate)` |
| Evidence re-run | Leader-inline, no worker active. All five outputs identical; the file is 23 bytes (`*.md -text -whitespace` and a newline). **VERIFIED** |
| Reviewer verdict | **PASS.** Summary: `-text` turns off end-of-line conversion for the fixtures on every checkout whatever the local setting; `-whitespace` takes them out of `git diff --check`; a nested `.gitattributes` covers only its own directory, so `bin/akili.js` and `README.md` stay `unspecified`; the new file is the only non-`.md` file under `test/fixtures`; `test/` is not in `package.json` `files`, so the package is unchanged |
| runtime events | none |

`spawns: implementer 8 calls, 72,834 tokens, ended complete; reviewer 3 calls, 58,091 tokens, ended complete`

**ADVISORY:** none.

**Issues encountered.** The Implementer's report says the file is "28 bytes"; its own `od` dump and the Leader's `wc -c` show 23. Report wording only. The Disqualifier stands: whether the Windows runner converts line endings without the file remains `UNVERIFIED`; the file makes the question moot.

**Final verification.** Checks 1–5 green, re-run by a non-author; Reviewer `PASS`. `git diff --check` is now clean across the spec's whole range (`acd119c` to the working tree).

### T3: Fix, guards, backup

Status while in progress: `[~]`. The closing table is written when the loop ends. Approval mode from this task on: `pre-approved`.

**Attempt 1, spawn 1 — report with owed items** (2026-09-30). Effort `xhigh`. Skills `tdd`, `error-handling-patterns`, as the task lists.

| Item | Value |
|---|---|
| Files changed | `bin/persona.js` (`segments` added to `parsePersona`'s return, `renderSegments`, `applyFix`), `bin/akili.js` (`resolveBranchContext`, `readConstitutionPins`, `tryGit`, `agentsDirtyStatus`, `evaluateFixGuards`, `ensureBackupGitignore`, `backupPersona`, `printFixRow`, `runAgentsDoctor` rewritten for guard → backup → write → re-report), `test/agents-doctor.test.js` (+22 tests), `test/fixtures/personas/missing-section-first.md`, `all-missing.md`, `crlf-missing.md` (new) |
| Implementer verification, as reported | Check 1: `npm test` → 44 pass. Check 2: temp git repo, `Default Branch: main` pin, on `other` → `REFUSED (branch: on "other", the apply-capable branch is "main" — pass --allow-branch to proceed anyway)`, exit 1, `git status --porcelain` empty; with `--allow-branch` exit 0. Check 3: `--fix --dry-run` → `INSERTED craft` and `(dry-run — no file written)`, exit 0, persona byte-identical, no `.agents/.backup/`. Check 4: one backup per rewritten persona, backup bytes equal the pre-fix bytes, second `doctor --agents` exit 0. Check 5: `git diff --stat` → `bin/akili.js`, `bin/persona.js`, `test/agents-doctor.test.js`; three new fixtures |
| Falsifier, as reported | Executed: the `text` branch of `renderSegments` dropped → `applyFix: project space is byte-identical across every fixture, changed or not (FR-4, NFR-4)` red on `assert.equal(projectSpaceOf(after), beforeSpace, …)` with `actual: ''`; reverted by the inverse edit; `shasum bin/persona.js` identical before and after |
| Evidence re-run, Reviewer | Not run on this report: both run on the completion report of the attempt's last spawn |
| runtime events | none |

`Not Done / Assumptions` (verbatim):

> - Per T2's own tests unchanged, digests remain the empty table (`AGENTS_DIGESTS`) — T5's job; `outdated` is untestable against the real CLI until then, only via pure-function tests with a fixture digest table (matches T2's precedent and the task's own note).
> - Exit-code semantics after `--fix`: I made an explicit judgment call, documented in code comments, that the reported exit code reflects the **post-fix** state (re-parsing the written file, or the hypothetical fixed text under `--dry-run`) rather than the pre-fix state — this is what makes idempotence and `--dry-run`'s "exit code" requirement coherent; design's function table says "re-report" but doesn't spell out the exact mechanics.
> - Backup filename timestamp uses `new Date().toISOString().replace(/[:.]/g,"-")` (e.g. `implementer.md.2026-09-30T14-29-50-313Z`) rather than a stricter `YYYYMMDD-HHMMSS` — satisfies FR-4's literal `.<timestamp>` suffix and guarantees monotonic uniqueness; flagging as a judgment call.
> - Per-test "observed red before green" evidence was not independently captured for every one of the 22 new tests (implementation and tests were written together, not strictly red-first per test) — the one falsifier-mandated red/revert cycle above **was** executed and is genuine; treat the other 21 as green-verified but not individually red-verified. This is an honest gap against FR-9/TDD discipline, named rather than glossed over.
> - Did not touch `test/agents-doctor-io.test.js` (explicitly T6's file) or `digests.json`/its loading (T5) — out of scope as instructed.

**Leader reading of the field.** No blocker. Two owed items, continuation-eligible under `pre-approved`: (1) the task's Red run field ("Each new test observed failing on its assertion before the implementation; recorded per test name") is unmet for 21 of 22 new tests; (2) the backup filename departs from design DD-5 (`.agents/.backup/<role>.md.<YYYYMMDD-HHMMSS>`), a knowing departure from a named design value, so it is undelivered scope and not a judgment call. The other three bullets are assumptions or judgment calls: recorded here, not re-sent as work; the exit-code reading goes to the Reviewer as evidence.

`continuations: 1 (red run per new test name; DD-5 backup filename)`

**Attempt 1, spawn 2 — continuation report** (2026-09-30). Effort `xhigh`. Skill `tdd`.

| Item | Value |
|---|---|
| Files changed | `bin/akili.js` (`backupPersona` timestamp → `YYYYMMDD-HHMMSS`, local time), `test/agents-doctor.test.js` (a backup-name test; a `no pin + origin/HEAD` guard-matrix test). `bin/persona.js` unchanged (hash `f98c2c6cb7ff…` before and after) |
| Owed item 1 | A red recorded for each of the other 21 new tests, all assertion failures, under one combined `applyFix` mutation (replace/insert made no-ops; skip branches made to act; `absent` → no change; `unreadable` → written): `deepEqual` missing ids, `true !== false` on `changed`, a hash mismatch, and `1 !== 0` exit codes for the nine CLI and guard-matrix tests, which went red through the mutated `applyFix` in the real pipeline (named by the worker) |
| Owed item 2 | New test `/^implementer\.md\.\d{8}-\d{6}$/`: red against the old format (`Input: 'implementer.md.2026-09-30T17-40-10-292Z'`), green after. Same-second fact, verified with two concurrent runs: the second `--fix` throws `EEXIST` from `flag: "wx"` **uncaught**, crashing with a stack trace and a non-zero exit before any persona write |
| Owed item 3 | Test `guard matrix: no pin, resolvable origin/HEAD` added: green against the real code; red when the `origin/HEAD` step is forced to `null`. No production change |
| Implementer verification | Check 1: 46 pass. Check 2: `REFUSED (branch: on "feature", the apply-capable branch is "main"…)`, exit 1, porcelain empty; `--allow-branch` exit 0. Check 3: plan printed, `(dry-run — no file written)`, exit 0, `find -newer` empty. Check 4: `BACKUP …/implementer.md.20260930-124311`, one file listed, second `doctor --agents` exit 0. Check 5: `bin/akili.js`, `bin/persona.js`, `test/agents-doctor.test.js` |
| Falsifier | Re-executed: `renderSegments` dropping `text` segments → the byte-identity test red (front matter and body missing from the rendered text); reverted, hash-checked |
| Evidence re-run | Leader-inline, no worker active. `npm test` 46/46; own temp git repo on `other` with a `Default Branch: main` pin → `REFUSED (branch: on "other", the apply-capable branch is "main" — pass --allow-branch to proceed anyway)`, exit 1, persona untouched; `--allow-branch` → `INSERTED craft`, `BACKUP …/implementer.md.20260930-124512`, `.agents/.gitignore` = `.backup/`, exit 0; second `doctor --agents` exit 0. `--dry-run` → `INSTALLED`, `(dry-run — no file written)`, exit 0, nothing newer than the marker, no `.backup`. Real `--fix` → `INSTALLED`, exit 0; second `doctor --agents` exit 0. Falsifier on a scratch copy → `not ok 23 - applyFix: project space is byte-identical across every fixture, changed or not (FR-4, NFR-4)`, `actual: ''`. `doctor --tool claude` byte-identical to the T2 baseline; `git diff --check` clean; `pack:dry-run` lists `bin/persona.js` (20.4 kB), no `test/`. **VERIFIED** |
| Review mode | **Parallel lens reviewers** (data-loss surface): RISK and RELIABILITY, each with baseline conformance. Both **FAIL** (reports below) |
| runtime events | none |

`Not Done / Assumptions` (verbatim, continuation; judgment calls only):

> local-time timezone choice for the backup timestamp is a judgment call, stated in-code and above, since DD-5/FR-4 are silent on it. The `assert.ok` red for "--section on unlocated inserts" names a falsy expression rather than an expected/actual pair (it's still a real `AssertionError` from the test's own assertion, not a thrown/setup error).

`spawns (attempt 1): implementer 59 calls, 285,153 tokens, ended partial; implementer (continuation) 56 calls, 179,390 tokens, ended complete; reviewer RISK 7 calls, 98,870 tokens, ended complete; reviewer RELIABILITY 13 calls, 120,523 tokens, ended complete`

**Reviewer report, attempt 1, RISK lens (verbatim).**

```text
STATUS: FAIL

SUMMARY: I audited T3 through the RISK lens plus baseline spec conformance. The write path is sound. Guards run before any I/O. The backup is written with `wx` before the one atomic write, and a throw at any step leaves that persona untouched, so no persona can be written without its backup existing first. `applyFix` only replaces or splices `owned` segments and skips `unreadable` and `unmarked` (NFR-4 holds). The branch resolution order matches DD-12 and kaizen Branch Context: an integration pin makes only that branch apply-capable, and an unresolved branch refuses. `--dry-run` writes no persona, no backup and no `.gitignore`. The diff touches only `bin/` and `test/` (scope clean). Two conformance defects remain, both small.

ISSUES:
1. **Discovered Issue:** Under `--dry-run`, a guard refusal returns before any plan is printed (`runAgentsDoctor`: `if (refusal) { … return; }` runs whatever `args.dryRun` is). A dry run on a spec branch shows only `REFUSED (branch…)` and never the plan. Also, when both guards would refuse, only the branch reason is named, because `evaluateFixGuards` sets the dirty reason only `if (!reason)`.
   * **Violated Rule:** requirements.md FR-4: "`--dry-run` SHALL run every guard and print the full plan and exit code, and write nothing." design.md DD-12: "`--dry-run` runs both guards and reports what they would do." §6: "Runs the guards and prints the full plan and exit code."
   * **Remediation Suggestion:** Under `--dry-run`, collect every refusal reason, still run the per-persona plan loop (it already writes nothing), then print one `REFUSED (<guard>)` row per refusing guard and exit 1. A real (non-dry) run can keep short-circuiting. Add one CLI test: dry-run on a non-apply-capable branch prints `INSERTED`, prints `REFUSED (branch`, exits 1, and leaves the tree unchanged.

2. **Discovered Issue:** The `insertionIndex` fallback ("neither present → before the project block") returns `findProjectIndex()`. In a migrated persona the segments end `[…, migration, project]`, so an inserted section lands between the migration record and the project block. This happens for a `missing` id in a persona where no template section was located, and for `--section` on an `unlocated` id there. The record is then no longer adjacent to the project block. The parser does not flag this, so the broken layout persists silently.
   * **Violated Rule:** design.md §5.1 Migration record: "Own line, at most one, placed **immediately before the project block's open marker**." DD-13: "The record line sits immediately before the project block (§5.1)."
   * **Remediation Suggestion:** In the fallback, when the segment just before the project block is `migration`, return that segment's index instead. Add an insertion-position test on a fixture with a record and no owned sections.

ADVISORY:
- RISK (item 4, ruling: ADVISORY, not a spec violation or spec gap). Two runs within the same second that both still change the same persona hit `EEXIST` from `wx`. The run then crashes with a raw stack trace and a non-zero exit, before that persona is written. No spec text covers collisions, and the failure is safe: `wx` protects the only copy of the original, and NFR-4 holds. It is hard to hit, because in a git checkout the dirty guard blocks the second run unless `--force` is passed. Suggestion: catch `EEXIST` and print `SKIPPED (backup <path> exists; retry)` with exit 1. This stays within FR-4's "skipped and why" and needs no change to DD-5's name format.
- RISK: `readConstitutionPins` matches `/Default Branch:\s*(\S+)/` anywhere in the file, and `\s*` can cross a newline. A prose mention or a backticked value would resolve a garbage branch. Anchor the match to a line (`/^[ \t]*(?:[-*][ \t]*)?Default Branch:[ \t]*`?([^\s`]+)/m`). The failure is safe (it refuses), but it is noisy.
- RISK: The guards fail open when git errors. `tryGit` returns null, so a checkout where git refuses to run (e.g. `safe.directory` "dubious ownership", or git missing) is classified as "not a git checkout" and both guards are skipped. `agentsDirtyStatus` also treats a null `git status` as clean. The backup still protects each persona.
- RISK: The dirty guard filters paths from `git status --porcelain`, which are relative to the repo root, while pins and `.agents` are read from `cwd`. Running from a subdirectory of the repo would count the fix's own `.gitignore` as dirty and refuse (safe direction). An untracked `.agents/` gives `?? .agents/` and refuses, although FR-4 scopes the guard to "git-tracked". DD-12's literal command does the same, so this is a spec tension, not a code defect.
- RISK (spec tension for the user): §5.1 says "writer emits the file's majority line ending". In a mixed-EOL persona, that rewrites minority-EOL lines inside project space, which conflicts with FR-4 "SHALL NOT change any byte of project space". `projectSpaceOf` joins lines that the parser already split on `\r\n|\n`, so the byte-identity test cannot see EOL changes. The CRLF test covers only uniform CRLF.
```

**Reviewer report, attempt 1, RELIABILITY lens (verbatim).**

```text
STATUS: FAIL

SUMMARY: I audited the RELIABILITY lens plus baseline spec conformance for T3, attempt 1. I read the diff, the working tree (`bin/persona.js`, `bin/akili.js` `runAgentsDoctor`, `atomicWriteFileSync`, arg plumbing) and the fixtures, and read at source FR-3, FR-4, FR-9, FR-10, NFR-4, §5.1, §5.4, §6, §7, DD-4, DD-5, DD-9, DD-12 and DD-13. Four things are sound:
- Every §5.4 row maps to exactly one `applyFix` branch.
- The backup is written before the atomic write.
- The guards follow DD-12, and the guard matrix uses real git and tests both directions.
- CRLF is kept for inserted sections and rewritten markers.

Three obligations are missing.

ISSUES:
1. **Discovered Issue:** The DD-5 closing line is missing from the report. After a real `--fix`, the rewritten personas make `.agents/` dirty, so the next `--fix` is refused. The report never tells the user to commit or pass `--force`. The summary only prints "Persona drift found." or "No persona drift blocking CI.".
   * **Violated Rule:** `design.md` DD-5: "the rewritten personas do, by design — the report ends with 'commit `.agents/` before the next `--fix`, or pass `--force`'". DD-5 is in T3's Design refs.
   * **Remediation Suggestion:** When at least one persona was written (not under `--dry-run`), end the report with that line. Add a CLI test that asserts the line appears after ANSI is stripped.

2. **Discovered Issue:** The DD-4 fallback "before the project block" breaks the migration-record placement rule. `insertionIndex` returns `findProjectIndex()`, so when a migration record sits just before the project block, the new owned section is spliced in between them. This is reachable on the DD-13 path: take a migrated persona with no fenced neighbour of the target id (for example one where nothing was located) and run `--section <unlocated-id>`. The same happens for a `missing` id with no neighbours in a migrated persona. The parser does not check the record's position, so the misplaced record goes unnoticed.
   * **Violated Rule:** `design.md` §5.1, Migration record row: "Own line, at most one, placed **immediately before the project block's open marker**."
   * **Remediation Suggestion:** In the fallback, insert before the migration segment when it directly precedes the project segment. Add a test with a fixture that has a record, a project block and no neighbouring section. It should assert that the record's line is still immediately before `<!-- akili:project -->` and that project space is byte-identical.

3. **Discovered Issue:** No test covers the `outdated` row, which replaces the body and rewrites `since=`. Every `applyFix` call in the tests passes `digests = {}`, so no section is ever `outdated`. The FR-4 "A hand-edited section" scenario is also untested: it needs `custom-edited` left alone *and* the other outdated sections replaced in the same run. The byte-identity test runs with default options, so it covers only the insertion path. Of its 8 fixtures, 4 are no-ops. It never covers replacement, the `--section` replace, or the `--section` insert that rewrites the record.
   * **Violated Rule:** `requirements.md` FR-4 scenario: "AND the other outdated sections are replaced". FR-9: "Tests SHALL assert … per FR-4, that project space is byte-identical before and after `--fix`". §5.4: `outdated` → "replace body; rewrite `since=`".
   * **Remediation Suggestion:** Pass a synthetic digests table, e.g. `{releases:{"2.29.0":{<id>: hashBody(oldBody)}}}`, over a fixture with one outdated section and a custom-edited `verification`. Assert:
     - a `FIXED` row
     - the body hash equals the template's
     - `since=` equals the template's
     - `verification` is untouched
     - project space is identical

     Also run the byte-identity loop with `{sections:[...]}` on `custom-edited.md` and `unlocated.md`. Record each test's red run.

ADVISORY:
- RELIABILITY: `git status --porcelain` prints paths relative to the repo root. When `.agents/` is in a subdirectory (monorepo), the entries show up as `sub/.agents/.gitignore`, the exclusions miss, and the fix's own `.gitignore` trips the guard. That goes against DD-5's "never trip it". The pins are also read from cwd rather than the repo root. Fix: strip the `git rev-parse --show-prefix` prefix, or use `-z` plus path normalization.
- RELIABILITY: `readConstitutionPins` uses a regex that is not anchored. A prose mention such as "the `Default Branch: <name>` pin" can come before the literal pin line and be captured. The failure is safe (it refuses), but the pin is wrong. Anchor it to the start of the line (with `m`) and allow an optional bullet.
- RELIABILITY: Mixed-EOL files are rewritten to the majority EOL. §5.1 sanctions this, but it changes bytes of project space, which conflicts with FR-4's "any byte". `projectSpaceOf` joins lines with `\n`, so the byte-identity test cannot see EOL changes.
- RELIABILITY: `--section` with an id the template lacks, or an id that is `current`, is silently ignored. FR-4 says to print what was skipped and why. Emit a `SKIPPED (<id>: not custom-edited/unlocated)` row.
- Test validity:
  - The test named "the backup is written before the persona file" only checks the backup's content, not the order of writes. The order is proven by code inspection and by T6's forced-failure I/O test (DD-9). Rename the test or note the gap.
  - The CLI idempotence test filters for failing rows over output that could be empty. Assert that `CURRENT` rows appear, per the T2 lesson.
  - `initGitRepo` never checks git's exit status. A global `commit.gpgsign` would make the guard tests fail noisily rather than falsely pass.
- READABILITY: An inserted section is placed straight after the preceding close marker, with no blank line between them. This is cosmetic.
- The same-second `EEXIST` crash belongs to the RISK lens. My lens adds only one point: when it happens mid-loop, earlier personas are already written, and their `BACKUP` rows are printed.
```

**Leader adjudication, attempt 1.** Four distinct issues, every one in scope for T3 and cited to FR-4, §5.1, DD-4, DD-5 or DD-12: (A) `--dry-run` must run every guard and still print the plan (RISK 1); (B) the "before the project block" insertion fallback must keep the migration record adjacent to the block (RISK 2 = RELIABILITY 2); (C) the DD-5 closing line after a writing run (RELIABILITY 1); (D) tests for the `outdated` replacement, the FR-4 hand-edited scenario, and byte identity on the replace and `--section` paths (RELIABILITY 3). One rework attempt is consumed for the pair of verdicts. The advisories are recorded and are not work; two of them the Reviewers themselves call spec tensions (majority-EOL rewriting versus "any byte" of project space; an untracked `.agents/` refused although FR-4 says "git-tracked") — **carried to the user in the task's closing summary as possible spec gaps**, not absorbed. Effort: the dial is already at `xhigh` for the tier; the next rung would move the Implementer to the T3 model and break the author ≠ auditor pairing at this tier, so attempt 2 stays on the T2 model with the brief steering maximum care on four named, small fixes.

**Attempt 2 — PASS** (2026-09-30). Effort: maximum care on four named fixes (the tier's dial was already at `xhigh`). Skills `tdd`, `error-handling-patterns`. Feedback: both attempt-1 reports verbatim, the adjudication, an Attempt History.

| Item | Value |
|---|---|
| Files changed | `bin/akili.js` (`evaluateFixGuards` returns every refusal; `runAgentsDoctor` runs the plan loop under `--dry-run` before printing one `REFUSED` row per guard and exiting 1; `wroteAtLeastOne` → the DD-5 closing line), `bin/persona.js` (`insertionIndex` inserts before a migration record that directly precedes the project block), `test/agents-doctor.test.js` (53 tests: +5 for A–C, +2 for D), fixtures `all-unlocated.md`, `outdated-and-custom-edited.md` (new) |
| Red runs | (A) two CLI tests red on their plan/second-guard assertions before the fix; (B) red on `1 !== 2` (the insert landed between record and block); (C) red on the last line being `No persona drift blocking CI. …`; (D) red under a mutation disabling the `outdated` replace (`false !== true`) and under the falsifier (`actual ''`); every mutation reverted by inverse edit, hashes checked |
| Implementer verification | Check 1: 53 pass. Check 2: `REFUSED (branch: on "feature", the apply-capable branch is "main" — …)`, exit 1, porcelain empty; `--allow-branch` exit 0. Check 3: clean dry-run → plan, nothing newer, exit 0; dry-run on the refused branch → full plan then `REFUSED`, exit 1, nothing written. Check 4: one backup `implementer.md.20260930-130517`; second `doctor --agents` exit 0; last line `commit \`.agents/\` before the next \`--fix\`, or pass \`--force\``. Check 5: `bin/`, `test/` |
| Falsifier | Re-executed on the final code: tests 23, 52, 53 red; reverted, hash-checked |
| Evidence re-run | Leader-inline, no worker active. 53/53; own temp repo on `other` with a `Default Branch: main` pin → `REFUSED (branch: …)`, exit 1, porcelain 0; `--dry-run` there → `INSERTED  craft`, `(dry-run — no file written)`, `REFUSED (branch: …)`, exit 1, nothing newer than a marker; tree also dirty → two rows, `REFUSED (branch: …)` and `REFUSED (dirty tree: …)`, exit 1; `--allow-branch` → `INSERTED  craft`, `BACKUP …/implementer.md.20260930-130756`, last line the DD-5 sentence, exit 0; second `doctor --agents` exit 0; clean dry-run → nothing newer, no DD-5 line. Falsifier on a scratch copy → `not ok 23`, `not ok 52`, `not ok 53`. `doctor --tool claude` byte-identical to the T2 baseline; `git diff --check` clean. **VERIFIED** |
| Reviewer verdict | **PASS** (single Reviewer, both lenses in one pass — Leader's choice for a rework of four named fixes after the parallel round). Summary: (A) every refusal collected, plan printed under `--dry-run`, exit 1, a real run still stops before any I/O; (B) the fallback returns the index before the record, adjacency asserted before and after; (C) the DD-5 line printed word for word only after a real write; (D) the hand-edited scenario in one run, byte identity on both `--section` paths, `projectSpaceOf` concatenates segments. Baseline: every §5.4 row maps to one branch and an unknown state throws; backup with `wx` before the atomic write; `BACKUP` row names the path; guard matrix on real git in both directions; scope clean |
| runtime events | none |

**ADVISORY (attempt 2, recorded, not work):** RELIABILITY — on a real (non-dry) run with both guards refusing only the first reason is printed; `evaluateFixGuards` already holds both. READABILITY — under a refused `--dry-run` the `REFUSED` rows print after the green summary line.

`spawns (attempt 2): implementer 65 calls, 223,869 tokens, ended complete; reviewer 11 calls, 109,759 tokens, ended complete`

**Issues encountered, attempt 2.** The Implementer self-reported "~57" tool calls; the host counted 65 — the fourth spawn of this spec over the 60-call bound with no checkpoint, each with a self-count under the bound (74/·, 64/"~40", 59/·, 65/"~57"). For the retrospective: the bound stated in a brief is not being honored by workers whose deployed persona predates it.

**T3 closing record — PASS (2026-09-30).**

| Field | Value |
|---|---|
| Final status | **PASS** on attempt 2 of 3 |
| Implementer attempts | 2 (attempt 1 had one continuation) |
| Requirements covered | FR-4 (all eight bullets and both scenarios), FR-10, NFR-4; design §5.4 (`--fix` column), §6, DD-4, DD-5, DD-12, DD-13 |
| Files changed | `bin/akili.js` (+~330), `bin/persona.js` (+~260), `test/agents-doctor.test.js` (+~470, 53 tests), five new fixtures |
| Evidence re-run | Leader-inline on both completion reports: **VERIFIED** ×2 |
| Review rounds used | 3 verdicts for this task (two parallel lenses, then one); **11 of 21** in total |
| Skills | `tdd`, `error-handling-patterns`, as the task lists |
| Continuations | `continuations: 1 (red run per new test name; DD-5 backup filename; the origin/HEAD guard-matrix row)` |
| Advisories | Eleven across the three reports, recorded above; none became work. Two are **possible spec gaps carried to the user**: (1) design §5.1 "the writer emits the file's majority line ending" versus FR-4 "SHALL NOT change any byte of project space" in a mixed-EOL persona; (2) an untracked `.agents/` trips the dirty guard (`?? .agents/`) although FR-4 scopes it to "git-tracked with uncommitted changes" — DD-12's literal command behaves the same |
| Committer checks | `npm run verify:cli` ok; `npm run pack:dry-run` lists `bin/persona.js`, no `test/`; `git diff --check` clean |
| Gate | `auto-approved (pre-approved mode)` |

**Forward pointers.**

| For | Pointer |
|---|---|
| T4 | `applyFix` already skips an `unmarked` persona with a row saying the migration is not this fix; T4 wires `migratePersona` into that branch. Insertion keeps a migration record adjacent to the project block; the record grammar is §5.1's. Fixture `all-unlocated.md` (a record naming every id, no owned sections) exists |
| T5 | `runAgentsDoctor` passes a constant empty table (`AGENTS_DIGESTS`); `sectionStates`/`applyFix` take a role-scoped slice. The `outdated` path is exercised only by pure tests with a synthetic table until the file lands |
| T6 | The write order (backup with `wx`, then `atomicWriteFileSync`) is proven by inspection and by the content comparison; T6's read-only-target test proves it by behavior. The CLI-spawn helper and temp-repo helpers live in `test/agents-doctor.test.js` |
| T9 | Report rows as shipped: `FIXED`, `INSERTED`, `INSTALLED`, `SKIPPED (custom-edited; use --section)`, `BACKUP <path>`, `REFUSED (branch: …)`, `REFUSED (dirty tree: …)`, `(dry-run — no file written)`, the DD-5 closing line; backup name `<role>.md.<YYYYMMDD-HHMMSS>` in local time |

## Budget tripwire: lines, second firing (T3 gate, 2026-09-30)

| Number | Budget | Actual after T3 | Decision |
|---|---|---|---|
| Lines (no fixtures) | ~1,700 | 1,781 (`git diff --stat 350c7eb HEAD` over `bin`, `package.json`, the test file, templates, `.gitattributes`) | Cap removed; reported at each closing record |
| Review rounds | 21 | 11 used; 10 left against 11 budgeted for T4–T10 | Raised to **26** |
| Fixtures | — | 1,781 lines, 17 files | Reported separately |

**Cause.** T2 and T3 needed far more test code than the design's ~230 lines for the whole spec (T3 alone added ~470, most of it demanded by review), and the CLI grew past ~400 with the guard and write paths. Presented to the user with the delta; the user answered "continue !" to the Leader's proposal.

## Execute-time design clarifications (before T4, 2026-09-30)

| # | Edit | Why | Carried as a named conformance check in |
|---|---|---|---|
| 1 | `design.md` §5.2, level paragraph: `leader.md`'s `primary-instructions` runs from item 1 to the next `##` (the row governs its extent) | The generic item rule would end it at item 2; T1d fenced items 1–4 as one, as the row says. Presented to the user at the T3 gate; accepted with "continue !" | T4 and T5 Reviewer briefs |
| 2 | `design.md` §5.3: each digest entry is `{ "body", "head", "open" }` (three sha256 values); a bare string reads as `body` | DD-6's heading match compares a persona line with each release's first line and opening sentence, and FR-3 forbids shipping old texts; the two extra hashes make the match possible. No requirement changes meaning | T4 and T5 Reviewer briefs |

**Spec tensions carried, not absorbed** (from T3's reviews; to close at T10 unless the user reopens the spec sooner): (1) design §5.1 majority-EOL writer vs. FR-4 "any byte" of project space in a mixed-EOL persona; (2) an untracked `.agents/` refused by the dirty guard vs. FR-4 "git-tracked".

### T7: `/akili-constitution` replaces instead of appending

Status while in rework: `[~]`. Ran in parallel with T4 (disjoint files). Approval mode `pre-approved`.

**Attempt 1 — FAIL** (2026-09-30). Effort `high`. Skill `cognitive-doc-design`, as the task lists.

| Item | Value |
|---|---|
| Files changed | `.claude/commands/akili-constitution.md` (5 insertions, 5 deletions: the five named sites) |
| Implementer verification | Check 1: `grep -c -i 'append a minimal upgrade block'` → 0. Check 2: `grep -c 'doctor --agents'` → 3. Check 3: `grep -c 'until re-scaffolded'` → 0. Check 4: `grep -c 'akili:project'` → 2. Check 5: one file |
| Falsifier | Executed walk on a scratch copy: with the "only when the persona does not already carry it anywhere…" clause deleted from the *Injection scope* lead, the table still sends the test command into the project block unconditionally, so a persona whose `custom-edited` item 4 holds it ends with two copies — the clause is load-bearing |
| Red run | `n/a (no test gate)` |
| Pre-review sweep | 20 hits read; five sites changed; the rest kept as other obligations (registry, Skill Map, child guides, hooks, wrappers) or as "compatible" (lines 31, 67, 1127) — **line 67 was wrong to keep (Reviewer issue 1)** |
| Evidence re-run | Leader-inline: greps 0 / 3 / 0 / 2; one file in the stat; `git diff --check` clean. **VERIFIED** |
| Reviewer verdict | **FAIL**, one issue (report below). FR-6 term by term, FR-2, FR-8's inline draft, the Disqualifier inside Step 8B, the Step 8C sentence and the checklist item all pass; lines 31 and 1127 ruled conformant |
| runtime events | none |

`spawns (attempt 1): implementer 27 calls, 129,574 tokens, ended complete; reviewer 7 calls, 72,171 tokens, ended complete`

**Reviewer report, attempt 1 (verbatim).**

```text
STATUS: FAIL

ISSUES:
1. **Discovered Issue:** Line 67 (Step 0, *Mode-specific drafting policy*, Active AKILI-SPECS bullet) still says: "read existing files and any custom subagent rules. **Do not overwrite them.** Upgrade only weak sections, fill in missing files, and extend `.agents/` … while preserving custom instructions." "Them" means the existing files, so an agent following this literally is told not to overwrite existing persona files. That is the obligation this task removes. The new Safe Update bullet (line 424) replaces `outdated` sections in those same files, so the two lines contradict each other in a document that agents execute literally. "Extend `.agents/`" also still points toward adding text beside the old rules, which is the "append" reading.
   - **Violated Rule:** design.md §7 surface 10 lists "the mode-table row" as part of this surface, and the diff does not touch any mode-table row. requirements.md FR-8: "the sentences that say Safe Update appends or never overwrites SHALL be updated." Active Lesson KZ-changes--kaizen-loop-closure-2: a surviving restatement of the superseded obligation is non-conformance. The Implementer's reason for keeping it ("compatible with the new mechanism") does not hold: "Do not overwrite them" is exactly a "never overwrites" sentence.
   - **Remediation Suggestion:** Rewrite the line 67 bullet to match DD-7. Suggested text: read existing files and custom subagent rules; never change project space (the project block and any text outside owned sections) or `custom-edited` sections; upgrade `.agents/` by replacing owned sections per Step 8B's Safe Update bullet (cite it, do not restate it); fill in missing files. Remove "extend". Then run the pre-review sweep again (`grep -n -i "append\|overwrite\|upgrade block\|preserv"`).

**Named checks:**
- **Check 1 (FR-6 against the Safe Update bullet at line 424):** passes. The bullet covers every term:
  - migrate when unmarked
  - replace `outdated`
  - insert `missing`
  - report `custom-edited` and leave it
  - no appended block
  - never rewrite the project block
  - `akili update` first, then `akili doctor --agents --fix`
  - by-hand fallback from the installed templates and their digests
  The rules on injecting only into the project block, not duplicating, and reporting a copy found in a `custom-edited` section as a move are in the lead sentence of *Injection scope*. The bullet points to that table, so it binds.
- **Check 2 (FR-2):** passes. The lead sentence names the `akili:project` block and says injections never go into an owned section. No row cell names an item or a section number.
- **Check 3 (FR-8, inline draft):** passes. The inline-draft sentence adds markers and one empty project block after the primary instructions.
- **Check 4 (Disqualifier):** passes within Step 8B, the section it scopes. No surviving "append" there (the only remaining hits are the hook and `execution.md` lines, which are other obligations). The by-hand fallback cites `docs/cli.md` rather than restating state definitions. No row reads as writing into an item. The line 67 survivor sits outside Step 8B and fails on FR-8 and surface 10 instead.
- **Falsifier:** confirmed, the clause is load-bearing.
- **Step 8C sentence and checklist item:** both correct. The checklist wording matches surface 10.

**Rulings on the three survivors:**
- **Line 67:** non-conformant, issue 1 above.
- **Line 31** ("upgrade weak sections without overwriting customizations"): conforms. Customizations here means `custom-edited` sections and project space, which the new mechanism also leaves untouched.
- **Line 1127** ("preserved with upgrades"): conforms. It only describes the outcome and does not state or imply appending.

**Not T7's defect:** `docs/cli.md` does not yet define the states (0 hits for `outdated` or `custom-edited`). The citation at line 424 only holds once surface 14 lands, so whoever owns surface 14 must deliver that.
```

**Leader adjudication, attempt 1.** In scope: FR-8's sweep bullet and design surface 10's "mode-table row" both name this sentence class. A recurrence of Active Lesson KZ-changes--kaizen-loop-closure-2 — the sweep found the hit and misjudged it. Attempt 2 at effort `xhigh`, report relayed unchanged. Forward pointer for T9: the `docs/cli.md` citation in the Safe Update bullet holds only once surface 14 lands.

**Attempt 2 — PASS** (2026-09-30). Effort `xhigh`. Skill `cognitive-doc-design`. Feedback: the attempt-1 report verbatim, the adjudication, an Attempt History.

| Item | Value |
|---|---|
| Files changed | `.claude/commands/akili-constitution.md`: the Step 0 "Active AKILI-SPECS" drafting-policy bullet rewritten — old: "read existing files and any custom subagent rules. **Do not overwrite them.** Upgrade only weak sections, fill in missing files, and extend `.agents/` to support the multi-agent loop while preserving custom instructions." — new: "read existing files and any custom subagent rules; never change project space (the project block and any text outside owned sections) or a `custom-edited` section. Upgrade `.agents/` by replacing owned sections per Step 8B's Safe Update bullet, and fill in missing files." |
| Implementer verification | Greps 0 / 3 / 0 / 2; `do not overwrite them` → 0; one file. Full sweep with `extend` added: every hit dispositioned, none restating the persona rule |
| Evidence re-run | Leader-inline: greps 0 / 3 / 0 / 2 / 0; `git diff --stat` one file, 6 insertions, 6 deletions; `git diff --check` clean. **VERIFIED** |
| Reviewer verdict | **PASS** (the attempt-1 Reviewer, resumed). Summary: the bullet forbids changing only project space and `custom-edited` sections, sends replacement to Step 8B by name, restates no state definition, fits its neighbours; the sweep dispositions hold on spot-check (L379 is about the root guides; L388 child guides; L570/631/842 registry, Skill Map, wrappers; L970 and the hook lines other artifacts) |
| runtime events | none |

`spawns (attempt 2): implementer 11 calls, 78,495 tokens, ended complete; reviewer (resumed) 2 calls, 75,791 tokens, ended complete`

**T7 closing record — PASS (2026-09-30).**

| Field | Value |
|---|---|
| Final status | **PASS** on attempt 2 of 3 |
| Implementer attempts | 2 |
| Requirements covered | FR-6 (four bullets and the scenario), FR-2 (the *Injection scope* lead names the project block), FR-8 (inline draft with markers; the sentences that turned false), FR-10 ("run `akili update` first"); design DD-2, DD-7, §7 surfaces 10–11 |
| Files changed | `.claude/commands/akili-constitution.md` (six sentences: the five named sites plus the Step 0 policy bullet) |
| Evidence re-run | Leader-inline on both attempts: **VERIFIED** ×2 |
| Review rounds used | 2 for this task; **13 of 26** in total |
| Skills | `cognitive-doc-design`, as the task lists |
| Advisories | none |
| Gate | `auto-approved (pre-approved mode)` |
| Lines | 6 changed; spec total (no fixtures) 1,787 |

**Forward pointers.**

| For | Pointer |
|---|---|
| T8 | Step 8B's *Injection scope* lead now reads: "every injection below is written into the persona's `<!-- akili:project -->` … `<!-- /akili:project -->` block, never into an owned section, and only when the persona does not already carry it anywhere — one already living inside a `custom-edited` section is reported as a move to make by hand, never duplicated." The audit's injection-bleed check keeps a manual trim; drift names the CLI (DD-8) |
| T9 | Mirror sentences in `docs/commands/akili-constitution.md`: line 27 ("Never overwrite existing personas — only append minimal upgrade blocks") and line 62 ("until re-scaffolded"). The Safe Update bullet cites `docs/cli.md` for the state names; that page must define `current`, `outdated`, `custom-edited`, `missing`, `unlocated`, `extra`, `unreadable`, `unmarked`, `absent` byte for byte |

### T8: `/akili-audit` reports section states — PASS (2026-09-30)

| Field | Value |
|---|---|
| Final status | **PASS** on attempt 1 |
| Implementer attempts | 1 |
| Requirements covered | FR-7; design DD-8, P-18, §12 point (4) |
| Files changed | `.claude/commands/akili-audit.md` (4 insertions, 4 deletions): item (c) of *Model Generation Drift* now names `akili doctor --agents`, the three states and `--fix`; the injection-bleed causal clause and remediation; item (c)'s remediation; the summary-table row and the checklist echo lose the `:59(c)` pointer |
| Evidence re-run | Leader-inline: **VERIFIED** |
| Review rounds used | **14 of 26** |
| Skills | `cognitive-doc-design`, as the task lists |
| Effort | High, steered in the brief |
| Parallel | Ran beside T4 (disjoint files) |
| Gate | `auto-approved (pre-approved mode)` |
| Lines | 4 changed; spec total (no fixtures) 1,791 |

**Attempt 1.**

| Item | Value |
|---|---|
| Implementer verification | Check 1: `grep -c 'never an overwrite'` → 0 (baseline 2). Check 2: `grep -c 'doctor --agents'` → 2. Check 3: `grep -c ':59(c)'` → 0. Check 4: one file of its own (T4's `bin/` changes present in the tree, untouched) |
| Falsifier | The sentence that now covers drift: "Remediation is `akili doctor --agents --fix`." — no remediation sentence forbids an overwrite |
| Red run | `n/a (no test gate)` |
| Sweep | `grep -n -i "overwrite\|append\|re-scaffold\|never"`: 15 lines read; L55 and L60 restated the superseded obligation and were rewritten; the rest are unrelated "never"s (CodeGraph, registry, wrappers, report filenames, the legacy drift-report file, checklist) |
| Evidence re-run | Leader-inline: greps 0 / 2 / 0; one file, 4/4; `git diff --check` clean. **VERIFIED** |
| Reviewer verdict | **PASS.** Summary: FR-7 term by term met; the injection-bleed causal clause ("Because Safe Update never rewrites the project block…") is true under T7's Step 8B and "`--fix` does not touch the project block" agrees with FR-4; no state redefined, `docs/cli.md` cited (forward reference expected); file-wide `:<digits>` → 0 (NFR-7); the checklist edit beyond the four sites accepted under Scope discipline (same file, same purpose, declared); no second table row (W11) |
| runtime events | none |

`spawns: implementer 16 calls, 148,747 tokens, ended complete; reviewer 5 calls, 69,183 tokens, ended complete`

**ADVISORY:** none.

**Decisions made.** The Implementer's sixth edit (the checklist line's `:59(c)` echo) is accepted: check 3 is file-wide and NFR-7 forbids the pointer; declared in its report as a judgment call.

**Forward pointers.** T9: `docs/commands/akili-audit.md` carries no sentence to mirror for this task (0 hits for "never an overwrite" / "drifted structurally"); `docs/cli.md` must define the states both commands now cite.

### T4: Migration of unmarked personas

Status while in rework: `[~]`. Ran in parallel with T7 and T8 (disjoint files). Approval mode `pre-approved`.

**P-13 / P-14 settled (first step, 2026-09-30).** Survey re-run over the 13 `.agents/implementer.md` files reachable at `~/Development` (depth 3): **10** with two-space items, **3** with one-space items, **no third shape** (one file mixes only because a custom `##` section carries its own one-space list), **no scaffold-release record** in any (`grep -c -i 'release\|scaffolded'` → 0 ×13). The judge's survey had 9/4; the shapes are the two DD-6 already handles. STAR = `alliance-research-indicators-main/.agents/implementer.md` (front matter, role renamed, seven one-space items, no `## Authorship`). No Pivot. The design's P-13/P-14 rows are settled by this reading (ledger update at the task's closing record).

**Attempt 1 — FAIL** (2026-09-30). Effort `xhigh`. Skills `tdd`, `error-handling-patterns`, as the task lists.

| Item | Value |
|---|---|
| Files changed | `bin/persona.js` (+257: `hashHead`, `hashOpen`, `migratePersona`, `signaturesFor`, `extentEnd`, `trimTrailingGap`), `bin/akili.js` (+35 −12: the `unmarked` branch of `--fix` calls `migratePersona`; `fenced` / `not located` rows), `test/agents-doctor.test.js` (+154; five new tests, 58 total), fixtures `v2.29.0-template-verbatim.md` (byte-for-byte `git show v2.29.0:…`, confirmed by the Reviewer with `cmp`) and `star-modeled-rewrite.md` (new) |
| Implementer verification | Check 1: 58 pass. Check 2 (copy of this repo's persona, empty table): 3 `FENCED (heading)`, 0 exact, 3 `NOT LOCATED`. Check 3 (copy of STAR's): 6 `NOT LOCATED`. Check 4: marker-stripped diff vs original empty on both copies (after fixing a stray blank line in the nothing-fenced branch). Check 5: `bin/`, `test/` |
| Falsifier | Executed: `HEADING_RE` widened to `###` → the extent test red (`'heading' !== 'exact'`, cut at `### Option A`); reverted, hash-checked |
| Red run, as reported | Every new test "failed (`TypeError: migratePersona is not a function`)" before the export existed; two later failed on real assertions. **Ruled insufficient by the Reviewer (issue 2)** |
| Evidence re-run | Leader-inline, no worker active. 58/58; own copies → 3 `FENCED` + 3 `NOT LOCATED` (repo), 6 `NOT LOCATED` (STAR); real `--fix` on both, marker-stripped diff empty, front matter first, record immediately before the project block at the end of STAR's copy; the real `.agents/` untouched; falsifier on a scratch copy → `not ok 57 - migratePersona: the extent rule cuts a \`##\` section at the next \`##\`, never at a \`###\` inside it`. **VERIFIED** |
| Reviewer verdict | **FAIL**, three issues (report below). Rulings on the Leader's questions: the record's `2.29.0` form is not a spec defect (§5.1 says `<release>`; only `since=` mandates `v`); the current packaged template counts as "any release … text"; heading match requires both hashes; project-block position holds in both shapes; the no-reorder test compares the full line array |
| runtime events | none |

`spawns (attempt 1): implementer 90 calls, 273,641 tokens, ended complete; reviewer 14 calls, 101,632 tokens, ended complete`

**Reviewer report, attempt 1 (verbatim).**

```text
STATUS: FAIL

ISSUES:
1. **Discovered Issue:** Named check (i) fails. `levelOf(tSec.body)` classes `leader.md`'s `primary-instructions` as `item`, because its body starts `1. **Source-of-truth…`. `extentEnd` then cuts an item at the next candidate, which is item 2. On an unmarked `leader.md`, the exact hash therefore never matches: the candidate span is item 1 only, and the template body is items 1–4. The heading match then fences item 1 alone and leaves items 2–4 unfenced. Even a verbatim current Leader template with its markers stripped would come out wrong, and it would then read `custom-edited`. No test covers `leader.md`.
   * **Violated Rule:** design.md §5.2, execute-time clarification: *"for `leader.md`'s `primary-instructions` the row governs the extent — the section runs from item 1 to the next `##`, as T1d fenced it — so the migration (DD-6) and the legacy seed (DD-3) cut it as one block"*. The §5.2 table gives `leader.md` level `##`. FR-5: *"A located section SHALL extend to the next section start of the same or higher level"*.
   * **Remediation Suggestion:** Take the extent from the §5.2 row, not from the first line. For example, a template item section whose body holds more than one column-0 item runs to the next `##`; or `primary-instructions` gets an explicit `##` extent. Add a test on `stripMarkerLines(leader.md)`: `primary-instructions` is `fenced (exact)`, its body contains item 4, and lines are not reordered.

2. **Discovered Issue:** Red run. The diff adds 5 tests (53 → 58), not the 6 reported. A `TypeError` from the missing export pre-empts every assertion. The only reds on an assertion were `'heading' !== 'exact'`, which occurs only in the v2.29.0-fixture test and the `review-output` extent test. Three tests were never observed red on their assertion:
   * the STAR-fixture test
   * the heading-alone negative
   * `hashHead/hashOpen`
   * **Violated Rule:** FR-9: *"Each test SHALL be observed red on its assertion before the code that makes it green exists."* T4's Red run field: *"Each new test observed failing on its assertion before the implementation"*.
   * **Remediation Suggestion:** Record a red on the assertion for each of the three, by test name, using a mutation or stub, as T3 did. Suggested mutations:
     * Heading-alone test: drop the `open` requirement from the heading match.
     * `hashHead/hashOpen`: remove the list-number or emoji strip.
     * STAR test: stop skipping the front matter, or accept retitled heads.

3. **Discovered Issue:** Check 2 ran with an empty digest table. The command requires *"with the T5 legacy table, or a fixture table until T5"*. As a result, FR-5's first scenario (an older scaffold) is never exercised: 0 `FENCED (exact)` on this repo's scaffold. Every unit test passes `{}`, so no test reaches the `releases`/`legacy` branches of `signaturesFor`: the object `{body, head, open}` entry and the bare-string-as-`body` case from named check (ii). By reading, `head`/`open` follow §5.3 (DD-6 normalization; first 40 normalized characters), and a bare string feeds the exact set only. That is correct, but it is untested.
   * **Violated Rule:** T4 Verification, Command 2 (above). FR-5 Scenario *"An older scaffold … THEN each item whose text is some tagged release's is fenced by exact match"*.
   * **Remediation Suggestion:** Build a fixture table with one legacy object entry and one bare string, taken from an older tag's text. Add a unit test that locates a section by `exact` only through that table. Re-run check 2 with the table and quote the counts.

**Rulings on the Leader's questions:**
- **Q2, the record reads `2.29.0`:** not a spec defect. §5.1's grammar says `<release>`, not `<vX.Y.Z>` (only `since=` mandates the `v`), and §5.3's `version` is `"2.30.0"`. See the advisory below.
- **Q3, matching sources:** the current packaged template is the text of a release, so it falls within DD-6's *"in any release or legacy text"*. The heading match requires both hashes to agree: `relevantPairs` filters on `head` and the `open` hash must come from the same pair, scanning at most 3 non-blank lines. Heading alone never fences.
- **Q4, project-block position:**
  * v2.29.0 fixture: the record comes right after the last close marker, then the project block, then `## Authorship`, as asserted.
  * STAR fixture: the block is last in the file.
  * The Leader's STAR CLI run confirms the nothing-fenced, end-of-file branch.
  * DD-6 steps 5–6 and DD-13 hold.
- **Q5, no-reorder:** yes. `assert.deepEqual(withoutMarkerLines(out), original.split("\n"))` compares the full line array, so it checks both the multiset and the order.
- **Fixture bytes:** `git show v2.29.0:.claude/templates/implementer.md | cmp` → identical.
- **Scope:** `git status` shows only `bin/` and `test/`.

**ADVISORY:**
- **READABILITY:** The record's release form is inconsistent. The CLI emits `2.29.0`; the tests and the existing `unlocated.md`/`all-unlocated.md` fixtures use `v2.30.0`. Pick one form, preferably `v`-prefixed to match `since=`, and assert it in the CLI path.
- **RELIABILITY:** The nothing-fenced branches have no unit test: end of file (including the trailing-`""` drop) and before `## Authorship`. Only the Leader's CLI check covers the end-of-file branch.
- **RISK:** P-13/P-14 still read `UNVERIFIED` in design.md §10. The re-run survey found 10/3, not the ledger's 9/4, with no scaffold record. Record the settled rows (Done: *"P-13/P-14 settled and recorded"*).
- **RELIABILITY:** Matching is cursor-ordered. A persona whose sections were reordered gets the later sections `not located`. That is safe, since nothing is moved, but it is worth a line in `docs/cli.md`.
- **READABILITY:** The "opening sentence" definition (first non-blank line after the head, sliced to 40 characters) is now a contract T5's generator must reuse. Export or document it as one function, so the generator cannot diverge.
```

**Leader adjudication, attempt 1.** All three issues in scope: (1) the §5.2 clarification, carried as a named check; (2) FR-9 and the task's Red run field — the same class T2 round 1 and T3's continuation already established in this spec; (3) the task's own check 2 text and FR-5's first scenario. Attempt 2 carries the report unchanged. The advisories are recorded: the P-13/P-14 ledger rows are the Leader's to settle (spec document edit at the closing record); the `v`-prefix advisory and the `docs/cli.md` line go to T9 as forward pointers. Fifth spawn of this spec over the 60-call bound (90 counted by the host, "~85" self-reported).

**Attempt 2 — implicit FAIL (Leader's evidence re-run)** (2026-09-30). Effort: maximum care on three named fixes. Skills `tdd`, `error-handling-patterns`. Feedback: the attempt-1 report verbatim, the adjudication, an Attempt History.

| Item | Value |
|---|---|
| Files changed | `bin/persona.js` (`extentLevelFor`; `extentEnd(idx, extentLevel)`), `test/agents-doctor.test.js` (60 tests: a `leader.md` extent test; a fixture-table test with `FIXTURE_LEGACY_DIGESTS` from tag v2.27.0 — an object entry and a bare string). `bin/akili.js` unchanged. A stray `bin/persona.js.orig`, identical to the final file, was left in the tree and removed by the Leader |
| Implementer verification | Check 1: 60 pass. Check 2: CLI reading 0 / 3 / 3; fixture-table reading through `migratePersona` **2 exact / 2 heading / 2 not located** (tag v2.27.0 matched items 1 and 4 of this repo's persona). Check 3: 0 / 0 / 6. Check 4: empty on both copies. Check 5: `bin/`, `test/` |
| Red runs | `leader.md` test red on `'heading' !== 'exact'`; STAR test red under an `ITEM_RE` mutation (`expected: 'fenced', actual: 'not located'`); heading-alone negative red with the opening-sentence loop dropped; `hashHead`/`hashOpen` red with the emoji strip removed (a weaker first mutation stayed green, declared and superseded); fixture-table test red with the legacy lookup zeroed. All reverted by inverse edit, hash-checked |
| Falsifier | Re-executed on the final code → red on the `review-output` extent test; reverted, hash-checked |
| Evidence re-run | Leader-inline, no worker active. 60/60 in the repo; copies of this repo's persona → 3 `FENCED (heading)` + 3 `NOT LOCATED`; STAR's → 6 `NOT LOCATED`; `leader.md` with its markers stripped → all five sections `FENCED (exact)`; real `--fix` on all three, marker-stripped diff empty on all three; second `doctor --agents` exit 0 (16 `CURRENT` + 3 `CUSTOM-EDITED` + 3 `UNLOCATED`; 16 + 6 `UNLOCATED`; 22 `CURRENT`); the real `.agents/` untouched. Falsifier on a scratch copy → `not ok 57`, `not ok 58`. **Then, prompted by the Reviewer's first advisory: `node --test` on a copy of `bin/`, `test/`, the templates and `package.json` with no `.agents/` folder → 59 pass, 1 fail: `not ok 58 - migratePersona: a fixture legacy digest table …` with `ENOENT: no such file or directory, open '…/.agents/implementer.md'`.** The test reads the live `.agents/implementer.md`, which `.gitignore` line 8 ignores in this repository: check 1 holds only where that untracked file exists, and fails in every clean checkout, including CI. **MISMATCH on check 1 as a claim about the suite — implicit FAIL** |
| Reviewer verdict | **PASS** (the attempt-1 Reviewer, resumed), with the fragility above as an ADVISORY: "The new fixture-table test reads the live `.agents/implementer.md` instead of a file under `test/fixtures/`… DD-9 says *fixtures as files*. Copy the current bytes into `test/fixtures/personas/` … and point the test there." Second advisory: export `extentLevelFor` (or a table) so T5's legacy generator shares the override. The PASS is recorded; the Leader's re-run overrides it on evidence, not on judgment |
| runtime events | none |

`spawns (attempt 2): implementer 120 calls, 214,032 tokens, ended complete; reviewer (resumed) 2 calls, 108,836 tokens, ended complete`

**Leader adjudication, attempt 2.** The evidence re-run is never waived and a mismatch is an implicit FAIL: a suite that passes only beside a gitignored file does not satisfy FR-9 ("The project's CI SHALL run the test script") or DD-9 ("fixtures as files"). Attempt 3 — the last — copies the persona's bytes into a fixture file and points the test there; nothing else. The second advisory (sharing `extentLevelFor` with T5's generator) is a forward pointer for T5, not work here.

**Attempt 3 — PASS** (2026-09-30). One change: the fixture-table test reads a checked-in file.

| Item | Value |
|---|---|
| Files changed | `test/fixtures/personas/older-scaffold-v2.27.0.md` (new; a byte-for-byte copy of this repo's `.agents/implementer.md`, 6,918 bytes, `cmp` identical), `test/agents-doctor.test.js` line 981: `fs.readFileSync(path.join(__dirname, "..", ".agents", "implementer.md"), "utf8")` → `loadFixture("older-scaffold-v2.27.0.md")`. `bin/` unchanged (hashes `2db9e516908f`, `faadadf8b99a`) |
| Implementer verification | Clean copy (no `.agents/`) before the edit → 59 pass, 1 fail (`ENOENT`); after → 60 pass. Repo `npm test` 60 pass. 14 tool calls (host count) |
| Evidence re-run | Leader-inline: `cmp` identical; no `"..", ".agents"` read left in the test file; repo 60/60; a copy of `bin/`, `test/`, the templates and `package.json` with no `.agents/` → 60/60; `bin/` hashes unchanged; the round-2→round-3 diff is that one line. **VERIFIED** |
| Reviewer verdict | **PASS** (the same Reviewer, resumed): the test proves the same thing from a checked-in, not-gitignored file; FR-9 and DD-9 satisfied; no other line changed; no new violation |
| runtime events | none |

`spawns (attempt 3): implementer 14 calls, 71,029 tokens, ended complete; reviewer (resumed) 2 calls, 110,907 tokens, ended complete`

**T4 closing record — PASS (2026-09-30).**

| Field | Value |
|---|---|
| Final status | **PASS** on attempt 3 of 3 |
| Implementer attempts | 3 |
| Requirements covered | FR-5 (seven bullets, both scenarios), FR-9 (fixtures as files; reds on the assertion); design §5.1, §5.2 (as clarified), §5.3 (as clarified), §5.4 `unmarked` → migrate, DD-6, DD-13; P-11, P-13, P-14, P-17 |
| Files changed | `bin/persona.js` (`hashHead`, `hashOpen`, `migratePersona`, `signaturesFor`, `extentEnd`, `extentLevelFor`, `trimTrailingGap`), `bin/akili.js` (the `unmarked` branch of `--fix`; `fenced`/`not located` rows), `test/agents-doctor.test.js` (60 tests), fixtures `v2.29.0-template-verbatim.md`, `star-modeled-rewrite.md`, `older-scaffold-v2.27.0.md` |
| Evidence re-run | Leader-inline on every attempt: **VERIFIED** ×2, **MISMATCH** ×1 (attempt 2: the suite needed a gitignored file) |
| Review rounds used | 3 for this task; **17 of 26** in total |
| Skills | `tdd`, `error-handling-patterns`, as the task lists |
| P-13 / P-14 | Settled (above); `design.md` §10 rows updated by the Leader at this record (an execute-time ledger edit, no requirement changed) |
| Advisories | Seven across the three rounds, recorded above; none became work. Forward: the migration record's release form (`2.29.0`, no `v`) and cursor-ordered matching → T9's `docs/cli.md`; `extentLevelFor` shared with the legacy generator → T5 |
| Committer checks | `git diff --check` clean; `pack:dry-run` after commit |
| Gate | `auto-approved (pre-approved mode)` |
| Lines | spec total (no fixtures) after T4: see the commit stat |

**Forward pointers.**

| For | Pointer |
|---|---|
| T5 | The legacy generator must cut every tag's template by the same rules `migratePersona` uses — `extentLevelFor` (the `primary-instructions` override) and `hashHead`/`hashOpen` (the `head`/`open` definitions: first line normalized; first non-blank line after it, normalized, first 40 characters, scanned up to three non-blank lines in) — reuse the exported functions, never a second implementation. Entry shape per §5.3 as clarified. The fixture table in the test file (`FIXTURE_LEGACY_DIGESTS`, tag v2.27.0) shows the shape. T5's check 6 re-runs T4's check 2 with the real table: expect this repo's persona to gain exact matches for items 1 and 4 at least |
| T9 | `docs/cli.md`: the three migration outcomes (`FENCED (exact)`, `FENCED (heading)`, `NOT LOCATED`), the record grammar with its bare release form, cursor-ordered matching (a reordered persona gets later sections `not located`; nothing is moved) |

### T5: Digest table, release step, resource install

Status while in progress: `[~]`. Approval mode `pre-approved`.

**Attempt 1, spawn 1 — report with owed items** (2026-09-30). Effort `xhigh`. Skill `tdd`, as the task lists.

| Item | Value |
|---|---|
| Files changed | `bin/persona.js` (`seedLegacySections` exported; `extentLevelFor`/`extentEnd` exported), `bin/akili.js` (`loadTemplates`, `digestsForRole`; `digests.json` in the copy loop, `runList`, `doctorTool`), `scripts/release.js` (DD-3 step and pre-bump assertions), `scripts/release-status.js` (version drift once `releases` is non-empty), `scripts/ci/install-layout-regression.js` (expected-diff classification for `templates/digests.json`), `.claude/templates/digests.json` (new, 104.9 kB; `version` 2.29.0; `releases` empty; `legacy` for four roles from every tag — 73 tags hold leader/implementer/reviewer, 48 hold tester), `test/persona-digests.test.js` (new, 4 tests; 64 in all) |
| Mapping rule declared | Item-level ids by ordinal among the item candidates between a tag's first item and the next heading after it (the role's own Primary Instructions block); `##` ids by heading equality (`hashHead`) anywhere in the tag; extents by the exported `extentLevelFor`/`extentEnd`; no match → no entry. Seeding summary: leader 35 tags 2/5, 1 tag 3/5, 29 tags 4/5, 8 tags 5/5; implementer 65 tags 5/6, 8 tags 6/6; reviewer 36 tags 4/6, 9 tags 5/6, 28 tags 6/6; tester 48 tags 5/5 |
| Implementer verification, as reported | Check 1: 64 pass. Check 2: `install --tool all --dry-run` lists `templates/digests.json` for the four tools. Check 3: layout regression exit 0, `EXPECTED-DIFF … digests.json`, `LAYOUT-IDENTICAL` ×3. Check 4 (scratch clone): hint `git add package.json CHANGELOG.md releases/v2.29.1.md .claude/templates/digests.json`; `git status --short` the same four paths; `releases["2.29.1"]` with 22 hashes; a second patch run exercised the previous-table branch; no `since=` rewritten (nothing changed); the working checkout untouched. Check 5: `pack:dry-run` lists `digests.json` (104.9 kB). Check 6: copy of this repo's persona with the real table → **5 `FENCED (exact)`, 0 heading, 1 `NOT LOCATED`** (`shared-file-discipline`, which predates the persona) |
| Falsifier, as reported | `normalizeBody` removed from `hashBody` → the file-vs-generator test red (two digests differ); reverted, hash-checked |
| Red run, as reported | Three tests red on `expected <hash> got undefined` with the generator stubbed; the file-vs-generator test "`ENOENT` before the file existed" — **not a red on the assertion (owed item 2)** |
| Evidence re-run, Reviewer | Not yet: both run on the continuation's completion report |
| runtime events | none |

`Not Done / Assumptions` (verbatim):

> `releases.<version>.<role>.<id>` entries are bare-string body hashes (not `{body,head,open}` objects) — §5.3 explicitly permits this shape and it matches the "22 hashes per release" figure exactly; objects would make it 66. `scripts/release-status.js`'s real execution and `npm run release:status` were not run (network/npm/gh) per the Disqualifier; logic verified via an isolated copy instead. **Tool-call count:** I did not track this live during the work; a careful retrospective count of this transcript puts it at roughly 95-100 — over the 60-call bound. I did not stop at 60 because I didn't notice crossing it in time; by the point I would reconstruct this, all 6 verification checks were already green and the task was complete, so I finished and am reporting the overage honestly here rather than fabricating a checkpoint on finished work.

**Leader reading of the field.** No blocker. Owed items, continuation-eligible: (1) design §5.3 as clarified says "`releases` and `legacy` both carry the object" `{ "body", "head", "open" }` — the bare-string reading is a knowing departure from a named design value, and the Leader's inspection of the generated file shows the **`legacy`** entries are bare strings too (`legacy.implementer.verification["v2.9.0"]` is a string), so the migration's heading match has no legacy `head`/`open` to consult; (2) the file-vs-generator test needs a red on its assertion. The `release-status.js` offline verification is accepted as an assumption (network). Host-reported tool calls: **135** (self-estimate "95–100"); the seventh spawn of this spec over the bound.

`continuations: 1 (object entries in both tables; a red on the assertion for the file-vs-generator test)`

**Attempt 1, spawn 2 — continuation report** (2026-09-30). Effort `xhigh`. Skill `tdd`.

| Item | Value |
|---|---|
| Files changed | `bin/persona.js` (`sectionDigestEntry` — the one builder of `{body, head, open}`, shared by the seed, the release step and `signaturesFor`; `entryBodyHash`; `sectionStates` fixed to read object entries — it compared the entry directly and would have broken on objects), `scripts/release.js` (object entries; `since=` comparison on `body`), `.claude/templates/digests.json` regenerated (1,199 object entries; body hashes unchanged from the string table), `test/persona-digests.test.js` (6 tests; 66 in all) |
| Owed item 1 | Object entries in both tables; test red against the string entries (`expected: {body,head,open}` vs a string), green after |
| Owed item 2 | File-vs-generator test red with one hex digit of a shipped `body` flipped (`expected.body '…c55'`, `actual.body '…c56'`); reverted, sha256 identical |
| Implementer verification | Checks 1–6 re-run: 66 pass; dry-run install lists the file ×4; layout exit 0; clone release `Prepared v2.29.1.`, hint and status identical, 22 object entries; `pack` lists `digests.json` 347.1 kB; check 6 → 5/0/1 (repo), 0/2/4 (STAR — heading matches now fire against legacy `head`/`open`) |
| Falsifier | Re-executed: `hashBody` without `normalizeBody` → the packaged-digest test red; reverted, 66/66 |
| Evidence re-run | Leader-inline, no worker active. 66/66; `digests.json`: `version` 2.29.0, `releases` empty, 1,199 legacy entries, 0 non-object, 73 tags for `implementer.verification`; dry-run install ×4; layout exit 0, `LAYOUT-IDENTICAL` ×3; own scratch clone: `release.js patch` exit 0, hint = `git status --short` (four paths), `releases["2.29.1"]` 22 entries of shape `body,head,open`, no template `.md` changed, a second patch → `['2.29.1','2.29.2']`, the working checkout still 2.29.0; `pack` lists the file; check 6 → 5/0/1 and 0/2/4; falsifier on a scratch copy → 3 red (`hashBody` stability, the T4 fixture-table test, the packaged-digest test); `git diff --check` clean. **VERIFIED** |
| Reviewer verdict | **FAIL**, one issue (report below). Verified by the Reviewer itself: the legacy table regenerates identically from the tags (read-only `node -e`); the mapping rule is deterministic, commented, and attaches no wrong id across the tags it listed; DD-3 term by term holds except the `since=` rewrite; slice shape, resource wiring, drift check and scope hold |
| runtime events | none |

`spawns (attempt 1): implementer 135 calls, 256,979 tokens, ended partial; implementer (continuation) 85 calls, 164,821 tokens, ended complete; reviewer 14 calls, 107,000 tokens, ended complete`

**Reviewer report, attempt 1 (verbatim).**

```text
STATUS: FAIL

I found one blocking defect: the release step writes `since=` values without the `v` prefix. Everything else conforms. Mode: full four-lens sweep, single reviewer, read-only. I ran no tests; I did one read-only `node -e` regeneration, described below.

**Verified**
- **Legacy table is reproducible from tags.** I regenerated `legacy` from `git show <tag>:.claude/templates/<role>.md` over all 79 tags with `seedLegacySections` and compared it to the shipped `digests.json`. All four roles match exactly. That is 1,199 entries, with the template present at 73/73/48/73 tags (implementer/reviewer/tester/leader). `version` is 2.29.0 and `releases` is `{}`.
- **The test names a tag.** `test/fixtures/personas/v2.29.0-template-verbatim.md` is byte-identical to `git show v2.29.0:.claude/templates/implementer.md`, and the test asserts the `legacy…verification["v2.29.0"]` key. The disqualifier is cleared.
- **Mapping rule.** It is deterministic and declared in a code comment on `seedLegacySections`. It reuses the shared `buildCandidates`, `extentEnd`, `extentLevelFor` and `sectionDigestEntry`, so there is no second implementation and the leader's `primary-instructions` is cut as one block. I listed the item titles at every tag and found no wrong attachment. Reviewer and tester items keep their order. Leader has a single block. Implementer item 2 was "Incremental Focus" before v2.14.0 and becomes `scope-discipline`: same slot, predecessor text, which is the upgrade FR-5 wants.
- **(1) DD-3, term by term.**
  - Dense entry of 22 object entries per release: yes.
  - `legacy` passed through untouched: yes (`legacy: digestsBefore.legacy`).
  - Before the bump: every template is checked to parse (not unreadable, not unmarked, sections > 0) and the previous release's table is checked: yes.
  - Hint = write set (KZ-004): yes, built from `writtenFiles`.
  - No drift test in `npm test`: yes.
  - `since=` rewrite: defective, see the issue.
- **(2) First dense release.** Comparing `body` against the latest `releases` key, and rewriting nothing when there is none, fits DD-3, because T1 already set every `since=v2.30.0`.
- **(3) Slice shape.** `digestsForRole` produces `releases[r][id]` and `legacy[id][tag]`, which is what `sectionStates` and `signaturesFor` read. A missing or unparsable file falls back to an empty table, so unmatched sections read `custom-edited`. That is FR-3's rule, deterministic, with no network call (NFR-1).
- **(4) Resource wiring.** `install`, `doctorTool`, `list` and `resourceCount` all count the file. It goes under `<resources>/templates/` for every tool, and `files` already includes `.claude/templates` (DD-11).
- **(5) Drift check** runs only once `releases` is non-empty, as the scope says.
- **(6) Scope.** Zero hunks in the four template `.md` files, `package.json`, skills, commands, `.agents/` and the archive.

ISSUES:
1. **Discovered Issue:** `writeReleaseDigests` sets `since: nextVersion`, and `nextVersion` comes from `bumpVersion` without a `v` (the hint itself prints `v${nextVersion}`). The first changed section would therefore be written as `since=2.30.1`. The templates use `since=v2.30.0`. The guard `sec.since !== nextVersion` compares `v2.30.0` with `2.30.0`, so it can never short-circuit. This branch never ran: the worker's and the Leader's scratch releases changed no section, so the evidence only proves the step exists, not that the rewrite works.
   - **Violated Rule:** design.md §5.1, which gives the section open as "`<!-- akili:section id=<id> since=<vX.Y.Z> -->` … `since` a release tag". DD-3 says the step "rewrites `since=` only where the hash changed", which means rewriting it to a valid tag.
   - **Remediation Suggestion:** Write `since: \`v${nextVersion}\`` and compare against the same string. Then run the branch in a scratch clone: change one section body in one template, commit, run `release.js patch`, and confirm three things:
     - only that section's open marker now reads `since=v<next>`;
     - the template is otherwise byte-identical;
     - that template's path appears in both the hint and `git status --short`.

ADVISORY:
- RELIABILITY: The pre-bump "previous table intact" check accepts an empty or partial previous entry. Asserting that each role in the previous entry carries exactly the current template's ids would catch a truncated table.
- RELIABILITY: `loadTemplates` falls back silently when `digests.json` is missing or corrupt, so outdated sections read `custom-edited` and the user gets no hint why. A one-line warning would help without breaking FR-3 or NFR-1.
- RISK: A patch release cut before v2.30.0 (the evidence's 2.29.1) leaves `since=v2.30.0` pointing at a future release. Harmless if v2.30.0 is the next real release, as DD-10's "minor" classification implies.
- READABILITY: `loadTemplates` only loads the digests; the §7 name suggests it also loads the templates. Consider `loadDigests` or a comment.
- RISK: `classifyToolDiff` now treats any side-B-only path that resolves to its source and matches it byte-for-byte as expected, not just `digests.json`. That is safe today because `resolveSource` is closed-list, but it is broader than the comment says.
- The tag-iterating driver behind the seed is not committed; only the per-tag function is. My regeneration shows the seed is reproducible, so this is a documentation note, not a defect.
```

**Leader adjudication, attempt 1.** One issue, in scope (§5.1's `since=<vX.Y.Z>`; DD-3's rewrite). Attempt 2 fixes the prefix and the comparison and exercises the rewrite branch in a scratch clone, as the remediation says; report relayed unchanged. The advisories are recorded; the third (a patch cut before v2.30.0 leaves `since=v2.30.0` ahead of the real release) is a forward pointer for T10's CHANGELOG classification (`minor`, DD-10). Eighth spawn over the bound (85 counted, 73 self-reported).

**Attempt 2 — PASS** (2026-09-30). Effort `high`. Skill `tdd`. Feedback: the attempt-1 issue verbatim, the adjudication.

| Item | Value |
|---|---|
| Files changed | `scripts/release.js` only: `nextSinceTag = \`v${nextVersion}\`` used for the guard and the rewrite (a three-line delta) |
| Red / green | On a scratch clone with the unfixed code, two patches with one word changed in `implementer.md`'s `craft` between them → `since=2.29.2` (the defect reproduced); on a fresh clone with the fix → only `craft` reads `since=v2.29.2`, the template differs from its snapshot by two lines, hint = status (five paths), `releases` entries differ in `implementer.craft` only |
| Implementer verification | Checks 1–6 re-run: 66 pass; install ×4; layout exit 0; pack 347.1 kB; check 6 → 5/0/1. Falsifier re-executed → red; reverted, sha256 identical. 27 tool calls self-reported (host: 53) |
| Evidence re-run | Leader-inline, no worker active. In the Leader's own clone (already at 2.29.2 from round 1): fixed script copied, one word changed in `reviewer.md`'s `read-only-role`, `patch` → `Prepared v2.29.3.`, hint = `git status --short` (five paths), `grep -n since=` → only line 13 `since=v2.29.3`, two-line template diff, `releases` differ in `reviewer.read-only-role` only. Working checkout: 66/66, install ×4, layout exit 0, pack lists the file, check 6 → 5/0/1, `git diff --check` clean, version still 2.29.0. **VERIFIED** |
| Reviewer verdict | **PASS** (the same Reviewer, resumed): §5.1's `since=<vX.Y.Z>` met; DD-3's rewrite exercised twice, each time one marker moved and the hint matched the written files; no new violation |
| runtime events | none |

`spawns (attempt 2): implementer 53 calls, 113,957 tokens, ended complete; reviewer (resumed) 2 calls, 109,074 tokens, ended complete`

**T5 closing record — PASS (2026-09-30).**

| Field | Value |
|---|---|
| Final status | **PASS** on attempt 2 of 3 |
| Implementer attempts | 2 (attempt 1 had one continuation) |
| Requirements covered | FR-3 (a digest of every section at every release and every tagged release, installed beside the templates; no match → `custom-edited`), FR-8 (the step makes the ids available), FR-10 (the report prints the CLI release), NFR-1; design §5.3 (as clarified), DD-3 (ADR), DD-11, §7 `loadTemplates`, §4 |
| Files changed | `bin/persona.js` (`sectionDigestEntry`, `entryBodyHash`, `seedLegacySections`, exports; `sectionStates` reads object entries), `bin/akili.js` (`loadTemplates`, `digestsForRole`, the resource wiring), `scripts/release.js`, `scripts/release-status.js`, `scripts/ci/install-layout-regression.js`, `.claude/templates/digests.json` (new, 347 kB: 1,199 legacy entries from 73/73/48/73 tags), `test/persona-digests.test.js` (new) |
| Evidence re-run | Leader-inline on both completion reports: **VERIFIED** ×2 |
| Review rounds used | 2 for this task; **19 of 26** in total |
| Skills | `tdd`, as the task lists |
| Continuations | `continuations: 1 (object entries in both tables; a red on the assertion for the file-vs-generator test)` |
| Decisions | The mapping rule from an old template's blocks to today's ids (ordinal for items within the role's Primary Instructions; heading equality for `##` sections) — a design gap settled by the worker, declared in a code comment, validated tag by tag by the Reviewer. `digests.json` `version` seeded as 2.29.0 with `releases` empty; the release step writes the first dense entry |
| Advisories | Six in round 1, recorded; none became work. Forward: a patch cut before v2.30.0 would leave `since=v2.30.0` ahead of the real release → T10 (DD-10 classifies this change `minor`, which makes v2.30.0 the next release); `loadTemplates` falls back silently on a missing file → T9 documents the behavior |
| Committer checks | `verify:cli`, `pack:dry-run` (lists `digests.json`), `git diff --check` clean |
| Gate | `auto-approved (pre-approved mode)` |

## Constitution Impact: T5

| Item | Value |
|---|---|
| Module reshaped | `.claude/templates/` gains a non-persona resource file, `digests.json`, written by the release step and copied by the installer beside the four templates; `scripts/release.js` now writes it and the templates' `since=` markers |
| Parent guide | Root `AGENTS.md` *Release Rules* step 5 ("Commit the release version update") and the release-flow memory assume `package.json`, `CHANGELOG.md` and the notes; the step's `git add` hint now also names `.claude/templates/digests.json` and any template whose `since=` moved. To be updated at `/akili-archive`, with `docs/release-checklist.md` |
| CodeGraph | Re-index pending |

**Forward pointers.**

| For | Pointer |
|---|---|
| T6 | `npm test` runs 66 tests in ~3 s; the CRLF fixture and `.gitattributes` are in place; the CI matrix is ubuntu/macos/windows × Node 18/22 — `node --test` with no path argument on Node 18 (P-12: experimental there) is T6's to confirm |
| T9 | `docs/cli.md`: `digests.json` (what it holds, where it is installed, the `version` field, silent fallback to an empty table when missing); the release step's hint; `release:status` drift |
| T10 | The CHANGELOG names the section ids (FR-8) — the 22 ids of §5.2 — and classifies `minor` (DD-10); the "seeded legacy table" line: 73 tags for leader/implementer/reviewer, 48 for tester |

### T9: Mirrors and `docs/cli.md`

Status while in progress: `[~]`. Ran in parallel with T6 (disjoint files). Approval mode `pre-approved`.

**Attempt 1, spawn 1 — report with an owed item** (2026-09-30). Effort `high`. Skill `cognitive-doc-design`, as the task lists.

| Item | Value |
|---|---|
| Files changed | `docs/cli.md` (new section *Persona Drift (doctor --agents)*: marker grammar, flags, states with exit codes, `--fix` rows, guards, backup, migration — each fact checked against `bin/persona.js` and `bin/akili.js` as shipped), `docs/commands/akili-constitution.md` (the two sentences), `docs/flow.md` (the Safe Update row), `README.md` (the Safe Update bullet; a `doctor --agents` row and example in the CLI section). `docs/commands/akili-audit.md` not edited (0 hits to mirror, re-grepped) |
| Implementer verification, as reported | Check 1: B7 grep 0 / 0 / 0. Check 2: 0. Check 3: `akili:section` 2; `doctor --agents` 2 (`docs/cli.md`), 3 (`README.md`). Check 4: the nine state names present (1–5 hits each). Check 5: `doctor --help` lists only the pre-existing flags, all documented → the subset holds; `--agents`, `--section`, `--allow-branch` are documented but absent from `printHelp` (not in any task's scope) |
| Falsifier | Executed: `unlocated` removed from a scratch copy → check 4 reads 0 for it |
| Sweep | Obligation-keyed over the five files; every hit dispositioned. **`README.md` line 875 — "Preserves customized `.agents/` files in place and only upgrades or fills gaps non-destructively" — found and left**, on the ground that the scope names "one bullet and the CLI section" |
| Evidence re-run, Reviewer | Not yet: both run on the continuation's completion report |
| runtime events | none |

`Not Done / Assumptions` (verbatim):

> `bin/akili.js`'s `printHelp` does not list `--agents`, `--section`, or `--allow-branch` (check 5 still passes as a subset test, per the task's own note) — flagged, not fixed, since `printHelp` is explicitly out of T9's scope. `README.md:875` left as a residual, lower-priority restatement outside the task's named edit locations (see sweep).

**Leader reading of the field.** One owed item: FR-8's sweep is keyed on the obligation ("the sentences that say Safe Update appends or never overwrites SHALL be updated"), and the task's own Scope line for `README.md` locates edits, it does not cap them; a mode-table row that says Safe Update "preserves … in place" and "fills gaps non-destructively" states the superseded rule — the same class T7 lost a round to. Continuation-eligible under `pre-approved`. The `printHelp` gap is real and owned by no task: **a spec gap for the user at the T10 gate** (one line in `bin/akili.js`), not absorbed here.

`continuations: 1 (README.md line 875 and any sibling restatement the obligation-keyed sweep finds)`

### T6: I/O test and CI — PASS (2026-09-30)

| Field | Value |
|---|---|
| Final status | **PASS** on attempt 1 |
| Implementer attempts | 1 |
| Requirements covered | FR-9 (backup exists before the write, an I/O test in a temp dir; CI runs the tests; a CRLF persona stays CRLF); FR-4's first scenario; design DD-9, DD-4, DD-5, §4, P-12, P-19 |
| Files changed | `test/agents-doctor-io.test.js` (new, 3 tests; 69 in all), `.github/workflows/ci.yml` (+3 lines: `Unit tests (node:test)` → `npm test`, after `verify:cli`) |
| Evidence re-run | Leader-inline: **VERIFIED** |
| Review rounds used | **20 of 26** |
| Skills | `tdd`, as the task lists |
| Effort | High, steered in the brief |
| Parallel | Ran beside T9 (disjoint files) |
| Gate | `auto-approved (pre-approved mode)` |

**Attempt 1.**

| Item | Value |
|---|---|
| Forced write failure | `.agents/.backup/` pre-created and `.agents/.gitignore` pre-seeded (so the backup and the ignore write succeed), the three other personas copied current, then `chmod 0o555` on `.agents/` and `0o444` on `implementer.md`: POSIX refuses the temp-file creation (`EACCES … implementer.md.<hex>.tmp`); the error escapes `main()`, exit non-zero. The test asserts unchanged bytes, exactly one backup holding the original bytes, exit ≠ 0 and `EACCES|EPERM` on stderr (the Disqualifier's guard). Permissions restored in `finally` |
| Red runs | Read-only test under the backup/write swap → `expected exactly one backup for implementer.md — 0 !== 1`; writable test under a no-op write → its exit-code assertion `1 !== 0`; CRLF test under `renderSegments(segments, "\n")` → `expected every line ending to be CRLF, none bare LF — true !== false` (only that test red). All on a scratch copy |
| Falsifier | The swap above (the read-only test red); scratch copy discarded |
| Implementer verification | `npm test` → 69 pass; `grep -c 'npm test' .github/workflows/ci.yml` → 1 (baseline 0); `node --check` ok; the file alone 3/3 |
| Evidence re-run | Leader-inline: 69/69; grep → 1; `node --check` ok; the file alone 3/3; the workflow diff is the two quoted lines; falsifier on a scratch copy (write moved before backup) → the read-only test red on `expected exactly one backup for implementer.md`. **VERIFIED** |
| Reviewer verdict | **PASS.** Ordering proven by the swap; writable and CRLF tests prove their claims end to end (the fixture is `i/crlf` with `-text`, the assertion covers every line); the Disqualifier satisfied (stderr code, unchanged bytes, backup bytes); no CI leg fails by construction (`HOME` and `USERPROFILE` set, `path.join`, `process.execPath`, temp dirs outside any checkout, CRLF-normalized templates still hash equal); ANSI stripped; the workflow step in the file's style |
| runtime events | none |

`spawns: implementer 57 calls, 139,525 tokens, ended complete; reviewer 8 calls, 80,662 tokens, ended complete`

**ADVISORY (recorded, not work).** Two declared `UNVERIFIED` items: Windows' refusal to rename over a read-only file (expected `EPERM`; the `windows-latest` CI leg is the proof) and Node 18's `node --test` discovery (the `node: 18` legs). RESILIENCE: the read-only test pins the current failure mode (an unhandled `EACCES`) through its stderr regex — a later friendly error message must update the regex. READABILITY: `stripAnsi`/`runFix` duplicated from the other test file.

**Issues encountered.** **Disqualifier breach, recovered.** The worker's first manual repro ran `--fix` without `cwd` against this repository's own `.agents/` (gitignored), rewrote the four personas, then restored them byte-for-byte from the backups the CLI had just written and removed the stray `.backup/` and `.gitignore`; it reported the incident itself. Leader's check: `.agents/implementer.md` identical to the fixture copy taken this morning (`cmp`), the other three at their session-start line counts (338/87/84), no markers, no `.backup/`, no `.gitignore`. For the retrospective: the task's "copies only" rule reached the worker through the brief and was still breached once; the backup-before-write rule the task tests is what made the recovery possible.

**Forward pointers.** T10: FR-9's CI bullet is proven only when the first `windows-latest` and `node: 18` runs are green — state it in the CHANGELOG's rollout line as "CI runs the suite" without claiming those legs passed before they have.
