# Kaizen Entry — changes/archify-diagrams

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/archify-diagrams` |
| Date | 2026-10-18 |
| Branch | JuankCadavid/skill-archify (spec branch: `Default Branch: master`, no integration pin) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 7 | tasks.md |
| Reviewer FAIL rework attempts | 3 (T1 ×1 path template ambiguity; T2 ×1 dropped "whose condition holds"; T6 ×1 CHANGELOG claimed a directory-count pin that does not exist) | execution.md — T1, T2, T6 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0. One execute-time amendment (user-approved): consumer `test/fixtures/doctor-codex-baseline.txt` missing from P-5 | execution.md — *Spec amendment* |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 0 (Review Design not requested) | — |
| Validation FAIL / WARN | 1 / 8 → 0 / 5 accepted after remediation | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 (T5's `skip-eligible` claim not earned → reviewed) | execution.md — T5 |
| Escaped defects (§3) | 1, not in a skipped task: F-1, a test authored at `/akili-test` reads the spec folder that `/akili-archive` moves; found at validate | validation-report.md F-1 |
| Review rounds | 10 of 12 budgeted | execution.md §3 |
| Runtime events | 2 provider-limit deaths (T2, T3) → rung 3 resume-by-message | execution.md — T2, T3 |
| Drift attributable to this spec | none (no `docs/specs/audits/` report) | — |

## Lessons

- **KZ-changes--archify-diagrams-1 — A test written at `/akili-test` read its own spec folder, which `/akili-archive` then moves.** (Methodology: this repository *is* the methodology; Medium)
  - Root cause: The Tester was told to read the expected values "from `requirements.md` itself" to avoid drift. Nothing in `/akili-test` or `tester.md` says that a test in the shipped suite must not depend on `docs/specs/<active spec path>`. Archive relocates that path by design, so the suite was green on the branch and would have gone red on master after archive.
  - Evidence: validation-report.md F-1 (`test/diagram-design.test.js:57` `SPEC_DIR`; simulated move → `# pass 11 # fail 2`); test-report.md *Addendum* (literals pinned at `47bdc9b`, 272/272 after move).
  - Standardization: → P2

- **KZ-changes--archify-diagrams-2 — A consumer search for a set change grepped the count, not a member name, and missed a fixture that enumerates the members.** (Methodology; Medium)
  - Root cause: P-5's `consumer` row searched for the count literals (`24|199|210|35`) of the packaged skill set. `test/fixtures/doctor-codex-baseline.txt` pins the set by listing every member (`OK stitch-design` … `ok 43`), which a count pattern cannot see. Premise Ledger trigger `consumer` asks for "every reader found by a search over the whole repository" but gives no rule for *how to key the search* when the change adds a member to an enumerated set.
  - Evidence: design.md §10 P-5 (amended 2026-10-18); execution.md — *Spec amendment*, T3 entry ("test 75 … codex doctor baseline fixture"); test 75 diff `+ '  OK diagram-design'`, `ok 43 → 44`.
  - Standardization: → P3

**Recurrence** (digest-update, not a new lesson): T6 attempt 1 shipped a CHANGELOG clause stating a test pin that did not exist ("pins … 25 skill directories"), and validation W-3 found another overstatement ("Every diagram slot … is filled"). Both were caught only by quote-checking at HEAD. This is the KZ-002 class, recurrence 7. → P4.

**Recurrence** (digest-update): T2 attempt 1 shipped the Step 5 wiring line without the design §6 contract clause "whose condition holds". The design cell's obligation was dropped in shipping, which is the KZ-changes--gate-falsifiability-2 class. → P5.

## Noted, not a lesson

- T1 FAIL: a path template `<doc>-<slot>` combined with already-prefixed slot ids gave a doubled-prefix reading. Fixed in one round; below the lesson bar.
- T5 `skip-eligible`: the plan named a consumer (`software-architect/SKILL.md:65`) in its own `Consumers` field, so predicate condition 3 could never hold. The Leader caught it. A specify-time check "skip-eligible ⇒ Consumers = none" would have prevented the bad classification. First occurrence.
- T7: Archify `review-<n>` out-dir after a browser check could take a repaired HTML off the slot path. Not exercised; the user chose a separate spec.
- Two workers died on an account session limit mid-verification. Rung 3 resume-by-message after the account switch preserved their context, so no attempt was lost.
- `.agents/` is gitignored and absent in new worktrees. The Leader copied personas from the main checkout, and nothing flags this at `/akili-execute` Step 0 beyond `doctor --agents` reporting ABSENT.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | guide-sync |
| Target | `AGENTS.md` — `## Skill Usage` list, after the `software-architect` bullet |
| Edit | `- Use \`diagram-design\` when a baseline doc (PRD, UX/UI design, TRD) or an architecturally significant \`design.md\` carries diagram slots: inline Mermaid is canonical, and an Archify interactive view is linked only when the \`archify\` skill is installed; \`/akili-constitution\` Steps 3–5, \`/akili-specify\` Step 2.1, and \`/akili-archive\` Step 2 load it.` |
| Severity | Low |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/tester.md` — append one line to the Tester's test-authoring rules (append-only) |
| Edit | `A test you add to the shipped suite never reads \`docs/specs/<active spec path>\` at runtime — \`/akili-archive\` moves that folder; inline the expected values as literals and cite the spec commit they were copied from (\`changes/archify-diagrams\` F-1).` |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — Step 2.2 *Premise Ledger* → *Blast-radius triggers*, `consumer` row, append one sentence to "The row must contain" |
| Edit | `When the change adds or removes a member of an enumerated set (a packaged skill, a command, a host), the search keys on an existing member's name as well as on the set's count, because a fixture or listing that enumerates the members pins the set without ever stating its size (\`changes/archify-diagrams\` P-5).` |
| Severity | Medium |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Severity | High (unchanged) |
| Edit | Add `changes/archify-diagrams` as a source; recurrence note: "**recurred (changes/archify-diagrams, recurrence 7: a T6 CHANGELOG clause claimed `install-cursor.test.js` pins '25 skill directories' — only the file count is asserted; validation W-3 found 'Every diagram slot … is filled' against the skill's 'Every filled slot'. Both caught only by quote-checking at HEAD)**" |
| Status | pending |

### P5

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--gate-falsifiability-2 |
| Severity | High (unchanged) |
| Edit | Add `changes/archify-diagrams` as a source; recurrence note: "**recurred (changes/archify-diagrams T2: the Step 5 wiring line shipped without design §6's 'whose condition holds' clause; the Reviewer walked the cell term by term and failed it, so one round was lost)**" |
| Status | pending |
