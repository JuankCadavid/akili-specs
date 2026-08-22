# Kaizen Entry — changes/branch-safe-kaizen

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branch-safe-kaizen` |
| Date | 2026-08-22 |
| Branch | master (default — solo fast path) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 6 | tasks.md |
| Reviewer FAIL rework attempts | 0 | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 | execution.md |
| Judgment-day severe findings | 7 confirmed + 2 verified suspects — all fixed pre-execution | judgment.md |
| Runtime interruptions | 1 (T5 connection drop; recovered with one poke, 0 attempts consumed) | execution.md — T5 |
| Leader↔worker message crossings | 1 (no damage; worker's idempotency check prevented a double-apply) | execution.md — T5 |

## Lessons

- **KZ-changes--branch-safe-kaizen-1 — Verify the working tree before re-instructing an idle worker.** (Methodology, Low)
  - Root cause: a Leader poke cited grep evidence captured before the worker's writes had landed; the worker's report was queued in flight, not missing. The leader persona's idle protocol checks the work artifact only *after* the poke.
  - Evidence: execution.md — T5, Runtime note.
  - Standardization: → P1

- **KZ-changes--branch-safe-kaizen-2 — A Correction Closure sweep must grep the superseded concept's paraphrases, not only its literal strings.** (Methodology, Medium)
  - Root cause: the judgment fix round's forward sweep matched literal superseded values, so design DD-5 survived by paraphrasing them ("date-prefixed … globs by slug suffix") — the same blindness class as CS-5/KZ-006, caught by T1's Implementer instead of the sweep.
  - Evidence: execution.md — T1, Leader actions.
  - Standardization: → P2

## Noted, not a lesson

- Judgment Day's blind two-judge panel invalidated three load-bearing mechanisms (re-run glob, branch resolution, apply entry point) before any implementation token was spent — the falsifying-input rules (KZ-006 lineage) working as designed. Nothing to change; recorded as evidence the gate pays for itself.
- The installed `~/.claude` command copies (npm v2.23.0) predate this spec; harness-loaded command text diverges from the repo's until the next publish/install refresh.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/leader.md` (+ mirror parity where applicable) |
| Edit | In the idle-without-report protocol, reorder: check the worker's artifact/working tree **before** the single poke — a poke citing stale evidence invites a double-apply. |
| Severity | Low |
| Status | deferred |

### P2

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — Correction Closure (+ `docs/commands/akili-specify.md` mirror) |
| Edit | Add: the forward sweep greps the superseded concept's paraphrase terms as well as its literal strings — a paraphrase that survives the literal grep is the KZ-006 blindness in sweep form. |
| Severity | Medium |
| Status | deferred |
