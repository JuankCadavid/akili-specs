# Kaizen Entry — changes/go-backend-routing/golang-skill

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/golang-skill` |
| Date | 2026-11-01 |
| Branch | `JuankCadavid/go-backend-routing` (spec branch; `Integration Branch: dev` pinned, so items await Apply Mode on `dev`) |
| Archive Run | 1 |
| Approval Mode | pre-approved (JC 2026-11-01 9:56) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 5 | tasks.md |
| Reviewer FAIL rework attempts | 4 (T1 ×1, T2 ×1, T3b ×1, T4 ×1) | execution.md |
| HALTs / FATAL_FAILs | 0 / 0 | execution.md |
| Pivots | 0 | execution.md |
| Budget tripwire | fired twice (6 → 8 → 9 rounds; ~260 → ~330 LOC), raised by JC | execution.md — Budget Tripwire, JC decisions 10:44, 11:08 |
| HITL stops | 1 (T1 scanner-flagged link; JC Option A) | execution.md — T1 |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 2 confirmed (F1 CRLF/`.gitattributes`, F2 governance row) | judgment.md |
| Validation FAIL / WARN | 0 / 3 | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 (2 spec-doc figure contradictions corrected at validate; not task defects) | validation-report.md §8 |

## Lessons

- **KZ-changes--go-backend-routing--golang-skill-1 — A bounded-section test helper that falls back to end-of-file turns a dead anchor into a silent file-tail check.** (Product + Methodology, Medium)
  - Root cause: `test/golang-skill.test.js` `section(text, startRe, endRe)` defaulted `end = lines.length` when `endRe` never matched. The Step 2.1 bound `/^- \`cognitive-doc-design\`/` matches no line in `akili-specify.md`, so the "anchored" pool assertion read from line 241 to EOF. It passed, and its falsifier went red, only by coincidence. Nothing in the authoring rules says a range helper must fail on a missing end bound.
  - Evidence: execution.md — T4 attempt 1, Reviewer FAIL (verbatim); T4 attempt 2 guard proof `section end not found: /^#### Step 9\.9 nope/`. Cost: review round 9 and the second budget raise.
  - Standardization: → P1 (local test-authoring rule), P2 (upstream)

- **KZ-changes--go-backend-routing--golang-skill-2 — A scan battery that reads a tool error as "0 hits" certifies nothing.** (Product + Methodology, Medium)
  - Root cause: the T1 security battery ran `grep -P` under `/bin/bash` on macOS. `/usr/bin/grep` rejects `-P` (exit 2), and `wc -l` reported `HITS=0`, so C1/C1b, the hidden-character checks, were green from an error. No rule asks a negative-existence check to distinguish exit 2 from exit 1.
  - Evidence: execution.md — T1 attempt 1 Reviewer FAIL, "macOS `/usr/bin/grep` rejects `-P` … both print `HITS=0` from an error", reproduced by the Leader. Cost: one review round.
  - Standardization: → P3 (local), P4 (upstream)

## Noted, not a lesson

- **KZ-002 recurrence ×3 in one spec**, all on summary surfaces: NOTICE "Finding | One:" (T2), the README row cloned from `nestjs-expert` keeping "persona examples" (T3b), and CHANGELOG "on one finding" (T4, caught by the Leader sweep before review). New facet: **a row cloned from a sibling inherits the sibling's claims cell by cell**. Recorded as P5 (digest-update), not a new lesson.
- T2's predicted-red list in `tasks.md` named 4 tests and omitted the 2 doctor-fixture readers that design P-2 already listed. The prediction was derived from the test names, not from the P-2 consumer set. Sub-threshold: no attempt lost.
- T2's verification used `du -sk` (allocated blocks, 72) for a bytes requirement (52,775 B). The wrong instrument was chosen at specify. Sub-threshold.
- The Leader ran `npm test` beside an active Reviewer, against the existing concurrency rule. It produced a non-evidence `fail 1`; a quiet re-run gave 0. The rule exists; this is an adherence slip, not a gap.
- `.agents/` was absent from the worktree, again. Same as `changes/impeccable-hardening`: personas copied from the main checkout and `--fix`ed. This is the second occurrence; watch for a third.
- Summary-heavy tasks (NOTICE, docs page, CHANGELOG) took 2 review rounds each against 1 budgeted. This feeds `KZ-bugfix--init-ctrlc-abort-2`-style budgeting: budget wording-heavy tasks like rules tasks.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/tester.md` (test-authoring rules; same home as `KZ-changes--archify-diagrams-1`) |
| Edit | A helper that bounds a text range by start/end anchors fails the test when either anchor is not found — never falls back to the end of the file; prove the guard once by pointing an anchor at a string that does not exist. |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Step 3.2 Falsifiability, item 3 (*Real-artifact lock*), append: "A section-scoped assertion needs a guarded bound: a range helper that falls back to end-of-file on a missing end anchor turns the section check into a file-tail check that its own falsifier cannot distinguish." |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `docs/skills/governance.md` → *Acceptance Checklist for New Skills*, item 3 (Attribution) or a new third-party review note |
| Edit | A third-party skill's admission review quotes its scan commands verbatim and treats a scanner exit status of 2 (tool error) as "not run", never as 0 hits; hidden-character checks use a tool that supports the pattern on the host (perl, not BSD `grep -P`). |
| Severity | Medium |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Step 2.2 Premise Ledger, citation rule (b) *Negative existence*, append: "…and the command's exit status, since an error exit read as zero hits is a false negative (`grep -P` on BSD grep exits 2)." |
| Severity | Medium |
| Status | pending |

### P5

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add source `changes/go-backend-routing/golang-skill`. Recurrence note: "**recurred ×3 (changes/go-backend-routing/golang-skill: NOTICE 'Finding \| One:' (T2), a README row cloned from `nestjs-expert` kept 'persona examples' (T3b), CHANGELOG 'on one finding' (T4 pre-review); a row cloned from a sibling inherits its claims cell by cell — re-verify every cell, not only the name)**". Severity stays High |
| Severity | High |
| Status | pending |

Step 3 (constitution sync) recorded no `guide-sync`, `factual-sweep` or `trd-adr` item. There is no Constitution Impact block. The root-guide factual sweep found no falsified claim (`grep` over `AGENTS.md`, `CLAUDE.md`, `README.md` for skill counts and Go mentions → none). No TRD exists in this repository.
