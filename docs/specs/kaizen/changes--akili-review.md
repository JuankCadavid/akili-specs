# Kaizen Entry — changes/akili-review

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-review` |
| Date | 2026-10-26 |
| Branch | feat/akili-review-pr2 (spec branch; `Integration Branch: dev` pinned → items await the apply phase on `dev`) |
| Archive Run | 1 |
| Approval Mode | gated (user mandate: commit locally only; process gates take the recommended option) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 14 of 15 (T1–T11 incl. T3b, T9a–T9c); T12 deferred, accepted by the user | tasks.md; execution.md |
| Reviewer FAIL rework attempts | 13 (T7 ×2; T2, T3, T3b, T4, T5, T6, T8, T9a, T9b, T9c, T11 ×1 each); only T1, T10 and R1 passed first time | execution.md task entries |
| HALTs / FATAL_FAILs | 1 HALT (review-round tripwire 25/25 before T11) / 0 | execution.md — *HALT — review-round tripwire before T11* |
| Budget amendments | 4 (T3b added; PR 2 + PR 3 merged; LOC tripwire ~5,700 → ~6,200; rounds 25 → 27) | tasks.md §1; execution.md |
| Pivots | 0 formal; spec tensions settled as amendments (T3b, PR strategy, `--input <dir>`) | execution.md |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 6 (C-1 to C-6) | judgment.md |
| Validation FAIL / WARN | 0 / 9 (8 closed before archive; W-5 ops) | validation-report.md §11, §13 |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 (no task skip-eligible) | execution.md |
| Escaped defects (§3) | 0 against skipped tasks (none skipped). Found after a Reviewer PASS: W-2/W-3 (FR-8/FR-11 clauses never shipped), W-7/W-8 (shipped-text overstatements), W-4 (stale CHANGELOG count) | validation-report.md |

## Lessons

- **KZ-changes--akili-review-1 — A PR split must be green at every PR head, and derived-count consumers travel with what they count.** (Methodology, High)
  - Root cause: the tasks-phase 3-PR split put the new command and skill in PR 1/PR 2, but the consumers whose tests derive totals from the packaged sets (install counts, docs-overview command rows, `docs/cli.md` totals) sat in PR 3. Neither PR 1 nor PR 2 could pass the required `CLI on <os> / Node <v>` checks, which cost two user stops, a new task (T3b), a merged PR and a raised LOC tripwire.
  - Evidence: execution.md — *PR 1 boundary* (3 red docs/count tests) and *T3b amendment*; *PR 2 boundary (T4–T8)* "PR 2 as split cannot pass the required CI checks"; *PR 2 + PR 3 amendment*.
  - Standardization: → P1 (upstream)
- **KZ-changes--akili-review-2 — Budget two review rounds for every task whose output restates shipped text (docs pages, rows, CHANGELOG).** (Methodology, Medium)
  - Root cause: design §11 budgeted one round for each `checklist` docs task (T9a, T9b, T10, T11). Every one except T10 failed once on a KZ-002 overstatement of the shipped command: the trivial-tier lens count, local-vs-CI posting, the `history: true` switch and the figure alt text. Rounds hit 25/25 and the run HALTed before T11.
  - Evidence: design.md §11 *Review rounds* "1 × (T1, T7, T9a, T9b, T10, T11, T12)"; execution.md — T9a/T9b/T9c/T11 attempt-1 FAILs; *HALT — review-round tripwire before T11*.
  - Standardization: → P2 (upstream)

## Noted, not a lesson

- The Ubuntu-only pty Ctrl-C harness flake failed PR #77 (and `dev` `dda3d5d`) on a different test each run. It is a known open bug outside this spec (the pty harness flake), and it feeds that bug's recurrence count.
- The review-round tripwire is counted per task, but parallel waves (T9a ∥ T10, T9b ∥ T9c) make the Leader's round arithmetic easy to get wrong. It was settled correctly here; no lesson.
- `@akili-spec changes/akili-review` traceability tags in shipped scripts and tests name the spec ID, not the folder path, so archiving breaks nothing (cf. KZ-changes--archify-diagrams-1). No lesson.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Step 3 (PR strategy): "A multi-PR split is valid only if `npm test` (the required checks) can be green at every PR head: each PR carries the consumers whose tests derive counts or lists from what that PR adds — install counts, docs command/skill rows, CLI totals — or the split is redrawn before the tasks gate." |
| Severity | High |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Budget (review rounds): "Budget 2 rounds, not 1, for any task whose output restates shipped text (docs pages, list rows, CHANGELOG) — quote-check FAILs (KZ-002) are the norm there, not the exception." |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add `changes/akili-review` as a source. Recurrence note: "recurred (changes/akili-review: T9a, T9b, T9c and T11 each failed once on a docs clause that overstated the shipped command — trivial-tier lens count, local-vs-CI posting, `history: true`, figure alt text; validation W-4 found the CHANGELOG test count stale after `/akili-test` added two suites, and W-8 found the command describing itself falsely, 'restates only the cap')". Severity stays High. |
| Severity | High |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--gate-falsifiability-2 |
| Edit | Add `changes/akili-review` as a source. Recurrence note: "recurred (changes/akili-review: FR-11 'the job summary reports the failure' and FR-8 'REVIEW.md … `$RUNNER_TEMP/akili-review` in CI' never shipped — design §7.1 already said `--ci` writes nothing — and passed every Reviewer; found at validation and settled as requirement corrections)". |
| Severity | High |
| Status | pending |

### P5

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--kaizen-loop-closure-2 |
| Edit | Add `changes/akili-review` as a source. Recurrence note: "recurred (changes/akili-review: T8 corrected 'neither agent has Bash' in `docs/ci/README.md`, but the same claim survived in `.claude/skills/pr-review/references/ci.md`'s trust table until validation W-7 — the fix was keyed on the file under review, not on the claim)". |
| Severity | High |
| Status | pending |

### P6

| Field | Value |
|---|---|
| Kind | guide-sync |
| Target | `AGENTS.md` (*Repository Purpose*) |
| Edit | Add: "- `docs/ci/` ships copy-in GitHub Actions templates for `/akili-review` (`akili-review.claude.yml`, `akili-review.codex.yml`) with `docs/ci/README.md`; they pin an exact `akili-specs` release, so each release that changes `/akili-review` re-checks the pin." |
| Severity | Low |
| Status | pending |

### Factual-claims sweep (Step 3 item 3)

The root `AGENTS.md` and `CLAUDE.md` were swept for command and skill counts, anytime-command lists and stage claims, and no claim was falsified by this cycle (`grep -nE "[0-9]+ (commands|skills|packaged)|anytime commands"` → no hits). No `factual-sweep` item. There is no `trd-adr` item either: this repo has no `docs/trd/trd.md`, and no TRD decision was overturned.
