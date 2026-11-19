# Kaizen Entry — changes/modern-web-guidance

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/modern-web-guidance` |
| Date | 2026-11-18 |
| Branch | `feat/modern-web-guidance` (spec branch; apply-capable branch: `dev`) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 14 | tasks.md |
| Reviewer FAIL rework attempts | 6 (T1 ×1, T2 ×1, T10 ×1, T11 ×1, T14 ×2) | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 | execution.md |
| Budget tripwires | 2 LOC stops (T12: ~1,191 vs ~1,120; `/akili-test` end: ~1,469 vs ~1,400), plus validate Q-1 on the count's measure | execution.md, validation-report.md §13.6 |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 8 severe, 9 warnings (round 1) | judgment.md |
| Validation FAIL / WARN | 0 / 2 (W-1, W-2; both resolved) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 (W-1 escaped a reviewed task, T2; not a §3 case) | validation-report.md |

## Lessons

- **KZ-changes--modern-web-guidance-1 — The LOC budget had no defined measure, so two counts disagreed at the gate.** (Methodology, Medium)
  - Root cause: `/akili-execute`'s budget tripwire names a LOC figure but not how it is counted. `execution.md` summed per-task figures (reworked lines counted twice, ~1,500), while validation counted branch additions (`git diff --numstat`, 1,467). The same divergence was noted, not yet a lesson, in `changes/antigravity-argon-registry` ("per-commit sums (151) and the net diff (149) differ … Reported totals should say which one they are").
  - Evidence: validation-report.md §13.5–§13.6 (Q-1); execution.md — *`/akili-validate` remediation*, Budget paragraph; `docs/specs/kaizen/changes--antigravity-argon-registry.md` — Noted, not a lesson.
  - Standardization: → P1 (upstream)

- **KZ-changes--modern-web-guidance-2 — A Leader restored a falsifier mutation with `git checkout`, reverting a worker's uncommitted edit.** (Product + Methodology, Medium)
  - Root cause: no persona rule says how to undo an in-place mutation while the tree holds uncommitted task edits. The Leader ran `git checkout -- docs/cli.md`, which also discarded the Implementer's `docs/cli.md` row. It had to be re-applied from the subagent transcript and confirmed byte-identical by the Reviewer. `changes/seo-analytics` noted the same hazard (in-place mutation and restore) without a lesson.
  - Evidence: execution.md — T12, *Incident* and *Issues encountered*; `docs/specs/kaizen/changes--seo-analytics.md` — Noted, not a lesson ("Falsifier hygiene").
  - Standardization: → P2 (local persona), P3 (upstream)

- **KZ-changes--modern-web-guidance-3 — The design paraphrased an upstream workflow and dropped where its step sat relative to implementation.** (Methodology, Medium)
  - Root cause: upstream MWG *Step 3* is a post-implementation check. `design.md` §*In a task* compressed it to "retrieve the matches, then check the code against them", and FR-7 AND reads "searches and retrieves the guides … before UI edits, then checks the code against them", which does not say the check waits for the edits. T2 shipped the check before the edits and passed review. Found only at validate (W-1); the fix needed a remediation commit, 2 tests and a re-validation.
  - Evidence: design.md — `modern-web.md` contents table, *In a task* row (line 109); requirements.md FR-7 AND (line 200); validation-report.md W-1.
  - Standardization: → P4 (upstream)

## Noted, not a lesson

- Stale summary figures after later phases (test-report 2109 vs 2111 after validate added tests; the execution summary's ~1,391 LOC and "local and unpushed" PR 2). Recurs KZ-002 → P5.
- CI flake: `test/update-check.test.js` "healthy registry is unchanged and exits promptly" failed once on macOS / Node 22 at `973c12c` (`exited 35032 ms after the request reached the server`) and passed on a rerun of that job. The commit touched no update-check code. Feeds the recurrence check for timing-sensitive CLI tests.
- FR-9 wording ("use when present") diverged from the shipped Step 8D row because DD-15 had already narrowed it; amended at validate (W-2). Single occurrence.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-execute` Step 2.4 budget tripwire: "LOC means lines added on the branch outside `docs/specs/` (`git diff --numstat <spec base> -- . ':!docs/specs'`). Per-task figures are estimates for the running log; the tripwire and the closing total use the branch count." |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.agents/leader.md` (append, project block) |
| Edit | "Undo an in-place mutation (falsifier, red-run check) only from a byte backup taken just before it (`cp` then `cmp`), or run it on a scratch copy. Never `git checkout`/`git restore` a path while the tree holds uncommitted task edits." |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `.claude/templates/leader.md` and `implementer.md` (and the Tester for red runs): the same rule as P2 — restore a mutated file only from a byte backup or work on a scratch copy; never `git checkout`/`git restore` a path that holds uncommitted task edits. |
| Severity | Medium |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` design guidance: "When a design adapts an external workflow, quote each step's name and number and state whether it runs before or after implementation; never compress steps into a paraphrase that drops that boundary." |
| Severity | Medium |
| Status | pending |

### P5

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add `changes/modern-web-guidance` as a source. Recurrence note: "recurred (changes/modern-web-guidance: test-report.md kept 2109 after the validate remediation added 2 tests; the execution summary kept ~1,391 LOC and 'PR 2 local and unpushed' after the budget raise and the push — refreshed at archive)". Severity stays High. |
| Severity | High |
| Status | pending |

Step 3 (constitution sync) recorded no `guide-sync`, `factual-sweep` or `trd-adr` item. `execution.md` has no `## Constitution Impact` block; the spec created no module. The root-guide sweep found no falsified claim: `AGENTS.md` already lists `modern-web-guidance` under *Design Skills* (shipped by this spec), and its *Drift Auditing* line names no mode count. This repository has no TRD.
