# Kaizen Entry — changes/impeccable-audit-fixes/install-stale-skills

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/install-stale-skills` |
| Date | 2026-10-31 |
| Branch | `JuankCadavid/impeccable-audit-fixes` (Branch Context: **spec**; apply-capable branch is `dev`) |
| Archive Run | 1 |
| Approval Mode | `pre-approved (JC, 2026-10-31 14:23)` |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 4 | tasks.md |
| Reviewer FAIL rework attempts | 1 (T4: two doc overclaims) | execution.md |
| HALTs / FATAL_FAILs / Pivots | 0 / 0 / 0 | execution.md |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day | ESCALATED after round 2 (severe R2-1, R2-2, R2-4); closed by JC's "Simplify both" | judgment.md |
| Validation FAIL / WARN | 0 / 3 | validation-report.md |
| `REVIEW_WAIVED` / `REVIEW_SKIPPED` | 0 / 0 | execution.md |
| Escaped defects | 0 | validation-report.md |
| Budget | 752 LOC vs ~650 (+16 %, tests 572 vs ~400); tripwire stop after T3; 5 rounds vs ~7 | execution.md |

## Lessons

### L1 — An approval relayed by a driver was recorded as the owner's

- **Root cause:** under `pre-approved`, the Leader logged "accepted by JC" from a driver's message before JC had decided. Nothing in the approval-mode rules says how to attribute a relayed or delegated decision, so the record named the wrong decider.
- **Evidence:** `a9793af` (design-eval-followup *Correction: provenance of the tripwire approval*); `1a593d4` (this spec's provenance notes); `execution.md` *Budget Tripwire* decision line, which records a delegated decision as "delegated by JC, option chosen by JC's assistant".
- **Target:** Methodology.

## Noted, not a lesson

- **Test LOC overran again** (572 vs ~400). This is a recurrence of an existing digest lesson, recorded as P2, not a new lesson.
- **Judgment-day escalated on refinements added at specify, not on the proposal's core.** Both judges found FR-1's core clean; every open item came from two additions (flag-rebuilding hints, the `Home:` rule). Simplifying them closed the lineage. One occurrence; it stays a note.
- **The T4 Reviewer caught two doc overclaims** (KZ-002 working at its gate).

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | `.claude/commands/akili-propose.md` Step 1 *Approval Mode* |
| Edit | "Record an approval as the owner's only when the message transmits the owner's own words and time; a decision relayed or delegated through someone else is recorded with who relayed or chose it, the owner's verbatim words, and the time." |
| Severity | High |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-bugfix--init-ctrlc-abort-2 |
| Edit | Add the source `changes/impeccable-audit-fixes/install-stale-skills` with a recurrence note: "**recurred (install-stale-skills: CLI subprocess tests estimated ~400 LOC, 572 shipped; the tripwire stopped the run after T3)**". Raise the severity |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | factual-sweep |
| Target | `AGENTS.md` *Repository Purpose* |
| Edit | After the `bin/persona.js` bullet, add: "- `bin/install-compare.js` is the pure byte-exact comparison behind `install`'s `(identical)` / `(differs: …)` skip classes and `doctor`'s `DIFFERS` warning; `bin/akili.js` requires it." |
| Severity | Low |
| Status | pending |
