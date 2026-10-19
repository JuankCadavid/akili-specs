# Kaizen Entry — changes/akili-security-followup

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security-followup` |
| Date | 2026-10-19 |
| Branch | JuankCadavid/security-followup (spec branch — `Default Branch: master`, no `Integration Branch:` pin) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 5 | tasks.md |
| Reviewer FAIL rework attempts | 6 — T2 ×1 (safety lens: Step 4 imported a git-running rule), T3 ×2 (R-B sentence inverted; CI-evidence overclaim twice), T4 ×2 (control paraphrase, stale naming source, dropped containment term; then "or its resolved path" dropped), T5 ×1 (six CHANGELOG clauses) | execution.md — T2–T5 entries |
| HALTs / FATAL_FAILs | 0 / 0 | execution.md |
| Pivots | 0 — two execute-time design edits (§7 row 4; §11 budget revision, user-approved) | execution.md — T2, *Budget gate* |
| Budget | LOC tripwire fired after T2 (~395 vs ~350; tests ~340 vs ~100 estimated); revised to ~520, closed at ~496; review rounds 13/14 | design.md §11; execution.md |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 2 confirmed severe (J-1 `.git` read as data with no hostile-input rules; J-3 no byte-identity test) + J-2 severity contested; APPROVED round 2 | judgment.md |
| Validation FAIL / WARN | 0 / 2 (+1 correction: CHANGELOG test count stale after `/akili-test`) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 against a skip record | — |
| Drift attributable | None — `docs/specs/audits/` holds no `drift-*.md`; legacy `docs/specs/drift-report.md` predates this spec | docs/specs/audits/ |

## Lessons

- **KZ-changes--akili-security-followup-1 — A prohibition checked by grepping the file's literal text missed the forbidden action imported by reference.** (Methodology — this repository *is* the methodology; Medium)
  - Root cause: FR-6 forbids git in Steps 4–5, and every task verified it with the shared grep for `` `git `` invocations in the command. Step 4 said "Name the date, branch-suffix and collision rules by `/akili-audit` Step 3 … the same table applies", and that table resolves the branch with `git rev-parse --abbrev-ref HEAD` (`.claude/commands/akili-audit.md:76`) and hands the default-branch fallback to the kaizen chain, which also runs git. Neither the design §7 row 4 nor the task's Falsifier walked cross-references out of the forbidden steps, so the grep stayed at 0 while the action was still required.
  - Evidence: execution.md — T2 attempt 1, safety-lens FAIL (verbatim "The shared grep cannot catch this because the invocation is imported by reference"); design.md §7 row 4 amendment 2026-10-19.
  - Standardization: → P1

**Recurrence** (digest-update, not new lessons):

- KZ-002 — T5 attempt 1: six CHANGELOG clauses claimed something other than what shipped (mechanism slot placed in `run-metadata.json`, "always outside" in the Disclosure row, a mixed test-count unit, …), caught only by the full Reviewer's quote-check; validation then found `npm test passes 389 cases` stale after `/akili-test` added 19 cases. → P2.
- KZ-changes--kaizen-loop-closure-2 — T4 attempt 1: the work order's sweep pattern had no term for control wording, naming source or containment terms, so three restatements that weakened the command passed the sweep (Reviewer: "neither the falsifier nor the sweep can catch issues 1–3"); attempt 2 then dropped "or its resolved path". `/akili-test` closed the class with an executable restatement contract (`test/akili-security-docs.test.js`, 9/9 mutations red). → P3.
- KZ-changes--archify-diagrams-1 — a shipped doc (`docs/skills/security-audit.md:57`) and the CHANGELOG pointed at `docs/specs/changes/akili-security-followup/upstream-request.md`, the active spec path archive moves (validation WARN-1; repointed at archive). Same root as the test that read its own spec folder, now in a doc. → P4.
- KZ-bugfix--init-ctrlc-abort-2 — test tasks budgeted at roughly a third of what ships, again: design §11 estimated tests at ~100 LOC; one assertion per THEN/BUT/AND IT MUST clause produced ~340 by T2 and fired the LOC tripwire. → P5.

## Noted, not a lesson

- T3 attempt 1 wrote the R-B sentence with the opposite meaning ("It proves the installed copy is the pinned one"); attempts 1–2 claimed CI-log contents no one had read. Both caught by the checklist Reviewer; KZ-changes--cursor-install-target-1 neighbourhood (claims beyond the evidence), not counted as a recurrence.
- `.agents/` again absent in a new worktree (gitignored); personas copied from the main checkout and fixed with `doctor --agents --fix --allow-branch` — second occurrence after `changes/archify-diagrams`.
- `docs/commands/akili-security.md:48` paraphrases upstream's lead clause ("providing" vs "that provides"); not weaker, the command is byte-pinned.
- The Implementer did not record loading `cognitive-doc-design` in T3 and T4.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/reviewer.md` — append one line to the Reviewer's conformance checks (append-only) |
| Edit | `When a requirement forbids an action in named steps ("never run X in Steps 4–5"), a grep for X is not the check: follow every cross-reference out of those steps ("as <command> Step N", "the same table applies") and confirm the referenced procedure does not perform X (changes/akili-security-followup T2).` |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Severity | High (unchanged) |
| Edit | Add `changes/akili-security-followup` as a source; recurrence note: "**recurred (changes/akili-security-followup: six T5 CHANGELOG clauses overstated or misplaced the shipped text, caught only by the full Reviewer's quote-check; validation found the test count stale after `/akili-test` added a suite — re-run the counts a summary states after every phase that adds tests)**" |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--kaizen-loop-closure-2 |
| Severity | Medium (unchanged) |
| Edit | Add `changes/akili-security-followup` as a source; recurrence note: "**recurred (changes/akili-security-followup T4: a literal-keyed sweep passed three weakened restatements — control wording, naming source, containment term — over two rounds; an executable restatement contract test with mutation checks closed it at `/akili-test`: when an FR requires restatements to match a source, make the restatement check a test in the task)**" |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--archify-diagrams-1 |
| Severity | Medium (unchanged) |
| Edit | Add `changes/akili-security-followup` as a source; recurrence note: "**recurred (changes/akili-security-followup: a shipped doc and the CHANGELOG pointed at `docs/specs/changes/<spec>/upstream-request.md`; the rule covers any shipped file, not only tests — cite the archive path or repoint in the archive commit)**" |
| Status | pending |

### P5

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-bugfix--init-ctrlc-abort-2 |
| Severity | Medium (unchanged) |
| Edit | Add `changes/akili-security-followup` as a source; recurrence note: "**recurred (changes/akili-security-followup: text-contract tests estimated ~100 LOC, ~340 shipped — one assertion per THEN/BUT/AND IT MUST clause; budget test LOC per clause, not per task)**" |
| Status | pending |
