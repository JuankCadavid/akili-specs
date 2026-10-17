# Kaizen Entry — changes/routing-keyboard-select

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/routing-keyboard-select` |
| Date | 2026-10-16 |
| Branch | master (apply-capable — `Default Branch: master`, no integration pin) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 6 (4 planned + T5 from validation Pivot B + T6 from validation V-2) | tasks.md |
| Reviewer FAIL rework attempts | 1 (T4 — two KZ-002 "same / byte-identical" clauses) | execution.md — T4 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 1 (Pivot B — typed-question Ctrl-C: premise P-5 refuted on Node ≥ 22.23) | execution.md — ## Pivot Record: T5 |
| PRODUCT_BUGs | n/a — no `/akili-test` run (absence accepted at archive) | — |
| Judgment-day severe findings | 0 (Review Design not requested) | design.md Document Control |
| Validation FAIL / WARN | 1 / 2 → 0 / 2 (accepted) after T5, T6 | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 in skipped tasks (none skipped); 1 design-conformant defect escaped every Reviewer and surfaced only on CI (V-1 — environment-dependent premise) | validation-report.md §2 |
| Review rounds | 8 of 8 budgeted | execution.md §3, T5, T6 |
| Runtime events | 2 (T1 spawn failure → rung 1; T3 worker died with the session → rung 4) | execution.md |
| Budget | tasks 4 → 6; LOC ~430 → ~900 (test code: the pty harness ~440 vs ~120 budgeted); the Leader recorded the overrun in §3 instead of stopping at the T3 gate | execution.md §3 |
| Drift attributable to this spec | none (no `docs/specs/audits/` report; legacy drift-report silent) | — |

## Lessons

- **KZ-changes--routing-keyboard-select-1 — A `data-env` premise about runtime behaviour is only as portable as the runtime it was observed on.** (Methodology — this repository *is* the methodology; High)
  - Root cause: P-5 ("Ctrl-C during a typed question today exits 0") was verified by one expect probe on the session's Node 22.12.0 and written without a version column; FR-5's `AND IT MUST … exit 0` and T3 case 4 inherited it. The CI matrix resolves `node: 22` to the newest 22.x (22.23.3), whose `readline/promises` rejects the pending question with an `AbortError` — the premise was false there at the baseline commit, surfaced only on CI, and cost a Pivot. The Premise Ledger's citation rules (a)–(e) check *how* a fact was read, not *where*: nothing asks whether the environment the design will be verified in matches the one the citation ran in.
  - Evidence: design.md §12 P-5 (refuted); validation-report.md §2 V-1; execution.md — ## Pivot Record: T5; CI run `38983739454` (`node: v22.23.3`) vs local `v22.12.0`.
  - Standardization: → P1

- **KZ-changes--routing-keyboard-select-2 — The Budget Tripwire compares at the summary, so an overrun that lands in the last task never stops the run.** (Methodology; Medium)
  - Root cause: `/akili-execute`'s Budget Tripwire says "when actual execution exceeds it, stop and escalate", but the Leader only tallied LOC in the §3 summary; T3's landing took the running total from ~411 to ~850 against a ~520 tripwire and the Leader recorded it rather than stopping. The rule names the condition and the action but not the *moment* — there is no per-gate running total, so the first time the number is computed is the time it can no longer act.
  - Evidence: execution.md §3 Summary (LOC row: "no tripwire event at the time"); design.md §11 budget; tasks.md T3 Size (~120 LOC) vs shipped ~440.
  - Standardization: → P2

Recurrence (digest-update, not a new lesson): the T5 Falsifier (1) written at Pivot time — "remove the `ABORT_ERR` mapping → red" — was a prediction never run at baseline; the Implementer found it inert (Node closes before rejecting), exactly the KZ-changes--leader-brief-contract-2 class. → P3.

## Noted, not a lesson

- T3's Implementer died with the session; recovery at ladder rung 4 (fresh worker audits the partial) worked as designed — the partial was 6/6 green and lacked only the report. First field use of rung 4 across a session boundary.
- `timeout` / `gtimeout` are absent on macOS; Leader-side probes relied on the tool's own timeout. Minor friction.
- Ubuntu-only pty flake at the second question (2 of 10 executions, both pre-T6, different cases); T6 diagnostics now record `<<BACK-IN n ms>>` (2–11 ms observed). Not a lesson until a marker fires.
- Two Reviewer advisories on the same spot — T1 "the `e.g. 1,3` text also shows on single-choice empty replies" and T4's note — were pre-recorded in design §9; recording an accepted side effect in the design kept it from being read as drift twice.
- The spec's task text said roster `a · Enter` where the fixture needed `a · ↑ · space`; caught by the Implementer, recorded in the T3 entry. Below the lesson bar.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — Step 2.2 *Premise Ledger* → *Citation rules*, after rule (e) |
| Edit | `- **(f) Runtime-bound.** A \`data-env\` row about runtime behaviour (an exit code, a signal, an API's rejection) names the runtime and version the citation ran on, and, when the project's CI matrix spans versions of that runtime, is verified on the matrix's newest member too — or the design asserts a version-invariant property instead. **Falsifier:** a row citing one local probe for behaviour the CI matrix exercises on a different major or minor (\`changes/routing-keyboard-select\` P-5: exit 0 on Node 22.12, AbortError on 22.23).` |
| Severity | High |
| Status | applied (2026-10-16) |

### P2

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-execute.md` — Step 2.4 *Loop Guardrails* → *Budget Tripwire* bullet, append one sentence |
| Edit | `The comparison runs at every task's Step 3 finalize — the Leader writes the running totals (tasks, LOC, review rounds) into that task's \`execution.md\` entry — so an overrun stops the run at the gate where it appears, never at the closing summary (\`changes/routing-keyboard-select\`: ~850 LOC against a ~520 tripwire, noticed only in §3).` |
| Severity | Medium |
| Status | applied (2026-10-16) |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--leader-brief-contract-2 |
| Severity | High (unchanged) |
| Edit | Add `changes/routing-keyboard-select` as a source; recurrence note: "**recurred (changes/routing-keyboard-select T5: a Pivot-time Falsifier (1) predicted 'mapping removed → red' without a baseline run; inert by Node's close-before-reject ordering; the Implementer executed it, found it green, and substituted the combined mutation — no attempt lost)**" |
| Status | applied (2026-10-16) |
