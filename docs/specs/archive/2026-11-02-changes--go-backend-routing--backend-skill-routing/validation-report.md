# Validation Report — Backend Skill Routing

> **Verdict: PASS with 1 WARN. Ready to archive.** All 9 tasks are closed with a Reviewer PASS. Every FR scenario and every BUT / AND IT MUST clause has an owning task and evidence. The shipped matrix matches design §8 as amended (A-1..A-6). No shipped file misstates shipped behavior. The one WARN is a stale *Summary* block in `execution.md`, which was written before amendments A-5/A-6 and before `/akili-test`. A one-paragraph addendum fixes it (§11).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/backend-skill-routing` |
| Validated at | `4b50eb5` (branch `JuankCadavid/backend-skill-routing`, local, clean tree) |
| Range | `94215ce..HEAD`: 12 commits, all prefixed `[SPEC:changes/go-backend-routing/backend-skill-routing]` |
| Auditor | Independent validation agent, Claude Opus 5.5, fresh context. Implementers ran on `sonnet`; this audit is independent of the run's Reviewer |
| Baseline docs | `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` and `docs/specs/general-setup/` are **absent** in this repo (`ls` → `No such file or directory`). The design's format source is the archived `changes/design-skill-routing` spec |
| Inputs read | `CLAUDE.md`, `AGENTS.md`, `proposal.md`, `requirements.md` (rev. 2 + A-1, A-3), `design.md` (rev. 2 + A-2..A-6), `tasks.md`, `execution.md` (bounded sections), `test-report.md`, the shipped diff `git diff 94215ce..HEAD -- . ':!docs/specs'` |
| UI / design review | **Not applicable.** No UI surface (proposal §8: "Visual source: None") |

## 2. Summary

| Area | Result |
|---|---|
| Task completion (§3) | PASS: 9/9 `[x]`, each with a Reviewer PASS |
| File existence (§4) | PASS: 20 shipped files = design §4 table + the `/akili-test` coverage suite; nothing on the "Not touched" list moved |
| Build integrity (§5) | PASS: 1450/0/0; spec suites re-run 31/31 |
| Requirement coverage (§6) | PASS: FR-1..FR-9, NFR-1..NFR-7 and every BUT / AND IT MUST clause evidenced |
| Linting & code quality (§7) | PASS: 7 ADVISORY items (5 carried, 2 new), none blocking |
| Design conformance (§8) | **WARN**: shipped text conforms; one spec document carries stale figures |
| Test evidence (§9) | PASS |
| Constitution Impact (§10) | PASS: no block was owed |

**Tally:** 7 PASS · 1 WARN · 0 FAIL · 0 BLOCKED.

## 3. Task Completion

| Task | Status | Closing record (`execution.md`) | Result |
|---|---|---|---|
| T1 Matrix + count | `[x]` | PASS, attempt 2; 19 rows, 9 cards; R1 red quoted | PASS |
| T2 *Routing* row | `[x]` | PASS, attempt 1; diff = one row | PASS |
| T3 specify 2.1 / 3.2 | `[x]` | PASS, attempt 1; R3, R4 red; `binding: stack` list quoted, 0 hits | PASS |
| T4 Step 8D item 5 | `[x]` | PASS, attempt 1; R2 red; item 4 and its bullets unchanged | PASS |
| T5 Leader item 3 | `[x]` | PASS, attempt 2 (Scope gap closed from FR-5 text) | PASS |
| T6 `AGENTS.md` + CHANGELOG | `[x]` | PASS, attempt 2; A-3 raised → JC | PASS |
| T7 Docs | `[x]` | PASS, attempt 2; 10 files | PASS |
| T8 Contract tests | `[x]` | PASS, attempt 1; 14 tests, each falsifier red, baseline 0/14 | PASS |
| T9 Walkthrough (HITL) | `[x]` | PASS, evidence attempt 2; 0 mismatches; ambiguities A–E → JC | PASS |
| Amendments A-2..A-4, A-5/A-6 | — | PASS (attempt 1; attempt 2) with JC approvals quoted | PASS |

## 4. File Existence

| Design §4 path | Shipped at HEAD | Result |
|---|---|---|
| `.claude/skills/software-architect/references/backend-routing.md` (new) | present, 101 lines | PASS |
| `test/install-cursor.test.js` (+1 at five sites) | constant `247 + 58 + 3 + 1 + 8 + 1`; message `+ 1 backend-routing.md`; comments read 318 / `14 + 318 = 332`; no `317`/`331` remain | PASS |
| `.claude/skills/software-architect/SKILL.md` | `+1` line (the *Routing* row) | PASS |
| `.claude/commands/akili-specify.md` | Step 2.1 pointer; Step 3.2 inventory clause; *Preferred backend skill rule* at line 463, inside Step 3.2, before the UI rule | PASS |
| `.claude/commands/akili-constitution.md` | item 5 + one policy bullet; additions only | PASS |
| `.claude/templates/leader.md` | item 3 only (1/1) | PASS |
| `AGENTS.md` | `## Backend Skills` between `## Design Skills` and `## CodeGraph`; 0 removed lines | PASS |
| `CHANGELOG.md` | `## [Unreleased]` → `### Added` (5 bullets) + `### Notes` | PASS |
| Ten docs files (T7) | 10 changed: `docs/commands/{akili-constitution,akili-specify}.md`, `docs/flow.md`, `docs/overview.md`, `docs/skills/{README,ai-agent-development,aws-serverless,governance,nestjs-expert,software-architect}.md` | PASS |
| `test/backend-skill-routing.test.js` (new) | present, 229 LOC, 14 tests | PASS |
| *(not in §4; added by `/akili-test`)* `test/backend-skill-routing-coverage.test.js` | present, 291 LOC, 17 tests | PASS (expected test-phase output) |

**"Not touched" list (design §4):** `git diff --stat 94215ce..HEAD` over the eight other routed skills, `impeccable-bridge/`, `impeccable/`, `architecture-styles.md`, `digests.json`, `bin/`, `scripts/` and `akili-execute.md` → **empty**. **PASS.**

## 5. Build Integrity

| Command | Result | Source |
|---|---|---|
| `npm test` | 1450 pass / 0 fail / 0 skipped | Leader at `4b50eb5` (no change since) |
| `npm run verify:cli` | "14 commands \| 32 skills \| 8 resources (akili-specs v2.41.0)" | Leader |
| `npm run pack:dry-run` | 419 files | Leader |
| `git diff --check` | clean | Leader |
| `node --test test/backend-skill-routing.test.js test/backend-skill-routing-coverage.test.js` | **31 pass, 0 fail** | re-run by this audit |

**PASS.**

## 6. Requirement Coverage

Coverage is checked at scenario and clause level against the amended text: requirements Glossary *Lead* (A-1, A-3) and design §5.1 and §8 (A-2..A-6). Evidence column: "AT" = author test (T8), "Tn" = Tester test n (`test-report.md` §7.1), "Text" = the shipped clause, quoted.

| Requirement / clause | Owner | Evidence | Result |
|---|---|---|---|
| FR-1 every skill placed, one card each | T1, T8 | AT *skill set*; 9 cards, each skill in ≥ 1 row (counted) | PASS |
| FR-1 BUT "must NOT name two leads … nor leave a row without a lead" | T1, T8 | AT *one lead*; Text: "Each Lead cell names exactly one lead"; rule 4 (A-5): "where more than one could apply, the row decides" | PASS |
| FR-1 AND IT MUST "name a stack skill … as lead only for **implement** and **framework-selection**" | T1, T8, T9 | AT *stack lead closed*; T9 0 mismatches | PASS |
| FR-1 *Held once* · BUT "must NOT restate a matrix row, nor point at it by line number" | T1–T8 | AT *held once*, *no line pointers*; T15 | PASS (see ADVISORY Q-6) |
| FR-2 rule | T1 | T1; Text rule 1 verbatim | PASS |
| FR-2 Go + `tdd` · BUT "`golang-pro`'s coverage target must NOT override" | T1, T9 | T2; Text: "a stack coverage target never overrides them or the Done criteria" | PASS |
| FR-2 NestJS bug · BUT "no fix is proposed before the root cause is confirmed" | T1, T9 | T3; Text: "No fix before root cause" | PASS |
| FR-3 context selects variant | T1 | rows keyed by context; T4 | PASS |
| FR-3 not significant · BUT "stack skill must NOT introduce a new architecture style" | T1, T3 | T4; Text: "No new style is introduced" | PASS |
| FR-3 stack absent · AND IT MUST NOT "recommend installing a skill" | T1, T3, T8 | T5; AT *no install advice*; Text: "No skill is recommended for install" | PASS |
| FR-4 card evidence resolves · BUT "no line number … nor claim a capability its cited text does not state" | T1, T8 | AT *card evidence*; T14 (retry); Reviewer quote-checks in T1 and A-6 | PASS |
| FR-5 collision → lead in brief | T5, T9 | AT *wiring*; T6; Text: "two backend skills claiming one decision → the lead … names" | PASS |
| FR-5 BUT "must NOT pass the matrix itself" | T5, T8 | AT *names only*; Text: "The brief carries only the lead and support names, never the matrix" | PASS |
| FR-5 legacy task · BUT "must NOT fail, block or re-open" | T5, T8 | AT *legacy task*; Text: "a task with no `Backend route:` line runs as today" | PASS |
| FR-5 "record any deviation" | T5 (attempt 2) | Text: "like naming a lead other than the matrix's, is a deviation, recorded by the one-line reason" | PASS |
| FR-6 Step 2.1 pointer, Step 3.2 line | T3, T8 | AT *wiring*; T7 | PASS |
| FR-6 AND "skills list … names … every skill the line names" | T3, T5 | T7; Text: "its skills list names exactly the routed backend skills that line names" | PASS |
| FR-6 BUT "must NOT load-direct a stack skill" | T3, T8 | AT *governance* (computed from frontmatter) | PASS |
| FR-7 block for backend projects | T4 | T8; AT *wiring* | PASS |
| FR-7 Django · AND IT MUST NOT "name an uninstalled skill" | T4 | Text: "named only from the Skill Map just built, or `none — project conventions`" | PASS |
| FR-7 no backend → no block | T4 | T8; Text: "A project with no server-side code gets no block." | PASS |
| FR-7 Safe Update · BUT "must NOT restate matrix rows" | T4 | T9; Text: "The block holds **no matrix rows**" | PASS |
| FR-7 coexists · BUT "`### Design routing` text must NOT change" | T4 | T10; §7.2 one-time evidence "Step 8D item 4 identical: true" | PASS |
| FR-8 `## Backend Skills` same set · BUT no rows | T6, T8 | AT *skill set* (nine) | PASS |
| FR-8 `software-architect.md`, `governance.md` name the matrix; other pages "SHALL not contradict" | T7 | T11; test-report accepted gap 3 (Reviewer read) | PASS (ADVISORY Q-5) |
| FR-9 *Routing* row; Go layering → `project-structure.md` · BUT `architecture-styles.md` unchanged | T1, T2 | AT *wiring*; T12; diff over `architecture-styles.md` empty | PASS |
| NFR-1..NFR-7 | per tasks.md | test-report §7.1 rows NFR-1..7 (NFR-2/NFR-4 via one-time evidence and the `golang-skill` hash lock) | PASS |
| requirements §8 "agents do not follow the routing" | T9 | walkthrough: 0 mismatches | PASS (accepted residual risk) |

## 7. Linting & Code Quality (4R advisory)

These items are **ADVISORY**. They are recorded here and do not become tasks in this spec (AGENTS.md: *Scope only grows through approval*).

| ID | R | Finding | Origin |
|---|---|---|---|
| Q-1 | Reliability | `bare()` in the card-evidence test is unnecessary | carried (T8) |
| Q-2 | Readability | The governance regex matches `binding: stack` anywhere in `SKILL.md`, not only in the frontmatter | carried (T8) |
| Q-3 | Readability | `AGENTS.md` `## Backend Skills` does not mention the named-source leads | carried (T6) |
| Q-4 | Readability | `AGENTS.md` `error-handling-patterns` bullet lists a subset without "retry" (A-6). It is still true | carried (A-5/A-6 sweep) |
| Q-5 | Risk | `docs/skills/golang-pro.md` Purpose says "Guides … microservices over gRPC or REST" with no routing qualifier. T7's P-13 grep did not cover it. It does not contradict the matrix, but it is the same shape as the `ai-agent-development` gap that T7 fixed | **new** |
| Q-6 | Readability | FR-1 *Held once* says "by file and section name". Most pointers (leader item 3, specify 2.1, `AGENTS.md`) name the file only. `governance.md` reads this as "a section where it points into one", and the design-routing precedent does the same. Consider aligning the FR-1 wording at the next revision | **new** |
| Q-7 | Risk | Follow-ups B, D, E (implement support token; stack across rule 6; idempotency/SQS) are recorded for a separate proposal. Persona drift in `.agents/leader.md` and `tester.md` (untracked) is still open | carried |

Resilience: the absent-file fallback ("proceed as today and say so once") is in the specify pointer, the Leader item and the matrix. The CHANGELOG note covers `--force` for older installs. **PASS.**

## 8. Design Conformance

### 8.1 Shipped text vs design

The design §8.1–§8.4 tables were diffed against `backend-routing.md`. The only differences are the A-4 strips: `(A-2)` and `(A-6)` were removed from card evidence, and "fall-through in §7.1" became "falls through, below". Rule 4 carries the A-5 sentence verbatim. The error-model row and the card carry "retry" (A-6). There is no "backoff". DD-5 placement (rule before the UI rule) and DD-6 placement (item 5 before `**Mode-specific policy`; the new bullet does not use the Safe Update label) hold. **PASS.**

### 8.2 Proposal alignment

Intent (one owner per backend decision; method decides what and why, stack decides how) is met. Proposal §6 non-goals: the design-routing files are untouched; there is no merged routing file; no third-party skill bodies were edited; no skill was added, removed or re-bound; `architecture-styles.md` is unchanged; frontend skills are not routed. Docs scope grew from 3 to 10 pages through approved design C-5. **PASS.**

### 8.3 Cross-document figure check

| Figure | Asserted in | HEAD | Result |
|---|---|---|---|
| 19 rows | design §2, tasks T1, execution T1 | 19 | PASS |
| 9 cards | design §2, tasks T1 | 9 | PASS |
| 10 activities | requirements Glossary, design §5.1 | 10 distinct in *Matrix* | PASS |
| 4 not-significant rows | test-report T4 | 4 | PASS |
| "ten docs files" | design §2, tasks T7 | 10 | PASS |
| `## Backend Skills` "nine" | CHANGELOG, design DD-12 | 9 bullets | PASS |
| "three named sources" | matrix rule 4 and route-line table, CHANGELOG, `docs/skills/software-architect.md`, design §5.1 | 3 | PASS (DD-4's "Two named sources" is historical and carries the A-3 note) |
| 317→318, 331→332 | design §4/§7.2, tasks T1 | 318 / 332; no 317/331 | PASS |
| Seven third-party skills | requirements NFR-2 | matrix *Attribution* names 7 | PASS |
| LOC ~650 (design §12) | design, tasks | 398 / 17 across 19 files at execute (execution *Summary*); 689 / 17 across 20 with the coverage suite | PASS (within estimate) |
| "one new contract test file" | design §2, DD-13 | 1 at execute; the 2nd file comes from `/akili-test` | PASS (scope note) |
| Test counts 1419 / 1433 / 1450 | tasks (baseline), execution (T8, *Summary*), test-report | 1450 at HEAD | see W-1 |
| Review rounds, open items | execution *Summary* | "15"; "Open for JC: … A … C …" | **WARN W-1** |

**W-1 (WARN, spec document).** The `execution.md` *Summary* was written before *Amendments A-5, A-6* and before `/akili-test`. Read as current, it has four stale points:

- review rounds are "15", but the A-5/A-6 block records "17 / ~18";
- *Amendments* lists only A-2..A-4;
- "Open for JC" lists ambiguities A and C, which A-6 and A-5 closed;
- final verification is "1433", but HEAD has 1450.

No shipped file is affected.

### 8.4 CHANGELOG `## [Unreleased]` quote check (KZ-002)

| Clause | HEAD evidence | Result |
|---|---|---|
| "maps each backend activity and context to one lead (a skill, or a named source: *existing design*, *the spec's scenarios* or *project conventions*) … one expertise card per backend skill" | rule 4; 19 single-lead rows; 9 cards | PASS |
| "`software-architect` gains a *Routing* row that points to it" | SKILL.md `+1` row | PASS |
| "`/akili-specify` Step 2.1 points to the matrix and Step 3.2 adds the *Preferred backend skill rule*" | `akili-specify.md` Step 2.1 sentence; rule at line 463 inside `#### Step 3.2` | PASS |
| "Step 8D scaffolds a `### Backend routing` block … for projects with server-side code" | item 5 | PASS |
| "The Leader persona … resolves backend skill collisions from the matrix, in its skill-decision item 3" | `leader.md` item 3 | PASS |
| "`## Backend Skills` section naming the nine backend skills and pointing at the matrix" | 9 bullets + pointer | PASS |
| Note: "older `software-architect` folder … lacks `backend-routing.md`; run `install --force`" | `bin/akili.js` skip policy (design P-20) | PASS |

## 9. Test Evidence Summary

| Suite | Tests | Falsified | Result |
|---|---|---|---|
| `test/backend-skill-routing.test.js` (T8, author) | 14 | each red on an executed falsifier; baseline worktree 0/14 | PASS |
| `test/backend-skill-routing-coverage.test.js` (Tester) | 17 | each red on an executed falsifier (test-report §3) | PASS |
| Existing consumers (`design-skill-routing*`, `golang-skill` hash lock, `install-cursor`, `persona-digests`, `agents-doctor`, `docs-overview`) | green within 1450 | — | PASS |
| One-time scope evidence (test-report §7.2) | routed skills, `architecture-styles.md`, design sections unchanged vs `94215ce` | confirmed again by this audit's `git diff --stat` | PASS |

Accepted gaps (test-report §9): behavioral routing is covered by the T9 walkthrough; cell judgment by judgment-day and JC; "do not contradict" for docs by Reviewer reading. These are reasonable for a text-only change.

## 10. Agent Guide / Constitution Impact

`execution.md` has no `## Constitution Impact` block. **None was owed. PASS.**

- No task created or reshaped a module. `backend-routing.md` is a new reference inside the existing `software-architect` skill, which keeps its layout and conventions. No child guide applies, and `AGENTS.md` has no `## Module Guides` index.
- The root-guide change (`AGENTS.md` `## Backend Skills`) *was* the T6 deliverable. It was made, reviewed and tested in-spec, so `/akili-archive` has no guide edit left to sync.
- For `/akili-archive`: re-index CodeGraph. The Leader persona's `primary-instructions` body changed, so `scripts/release.js` will write the new digest and `since=` at release.

## 11. Remediation

| ID | Severity | Where | Exact remediation |
|---|---|---|---|
| W-1 | WARN | `execution.md` → `## Summary` | Append under the Summary: "**Addendum (post A-5/A-6 and `/akili-test`):** review rounds 17 / ~18; amendments A-2 – A-6 approved by JC; ambiguities A and C closed by A-6 and A-5, B, D, E moved to *Follow-up proposal candidates*; `/akili-test` added `test/backend-skill-routing-coverage.test.js` (17 tests) → `npm test` 1450 pass / 0 fail; shipped diff 689 / 17 across 20 files." Leave the historical lines as written. |

No FAIL and no BLOCKED items.

## 12. Archive Readiness Recommendation

**Ready for `/akili-archive`.** W-1 is a spec-document wording fix and can be applied as the first step of archive. Carry these into the archive and Kaizen record:

- ADVISORY items Q-1..Q-7.
- Follow-up candidates B, D, E.
- The T5 Scope gap and the T7 P-13 premise gap.
- Q-5 (`golang-pro.md` Purpose), as the same premise-gap class as the T7 P-13 gap.

Release class stays **minor**. There is no push, PR, merge or publish in this cycle.
