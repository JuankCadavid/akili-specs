# Kaizen Entry — changes/opus-5-5-rebaseline

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/opus-5-5-rebaseline` |
| Date | 2026-09-29 |
| Branch | `master` |
| Branch Context | **`default`, apply-capable**. No `Integration Branch:` pin exists, and **no `Default Branch:` pin exists either**. The branch resolved through the skill's step 4 (unique `main`/`master`: `master` locally and `origin/master`, no `main`); `origin/HEAD` is unset. This is the second consecutive run to rely on the fallback (see L2) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 4 | tasks.md |
| Implementer attempts | 6 (T1 ×1, T2 ×2, T3 ×1, T4 ×2) | execution.md |
| Reviewer FAIL rework attempts | **2** (T2 ×1, T4 ×1) | execution.md: T2 attempt 1, T4 attempt 1 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 | execution.md |
| PRODUCT_BUGs | — | no `test-report.md`; absence accepted (prose only) |
| Judgment-day severe findings | 3 (JD-1..3, all fixed before approval) | judgment.md |
| Validation FAIL / WARN | 0 / 3 (resolved via `quick/model-routing-history-wording`) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` | 0 | execution.md |
| Escaped defects (§3) | 0 (no skipped tasks). The 3 validation WARNs escaped the T1 Reviewer's PASS, which was not a skip | validation-report.md |
| Budget delta | lines **~90 vs ~75**; review rounds **7 vs 6**. Both tripwires fired and the user accepted both | design.md §9 vs execution.md |
| Drift attributable | — | `docs/specs/audits/` holds no report |

## Lessons

- **KZ-changes--opus-5-5-rebaseline-1 — A list a requirement ports into a role's persona is written from the wrong role's authority.** (Methodology, **Medium**)
  - **Root cause.** FR-4 ordered the worker personas to "name the legitimate stops (Glossary)". The Glossary defines them from the **Leader's** side ("a stop the Leader *does* want"). Copied into the Implementer, one item (Pivot-Detection) became a stop the worker has no authority to take, contradicting the neighbouring bullet ("still deliver the task as written; the Pivot is the Leader's call"). Made exhaustive for the Tester ("own contract's outcomes **only**"), the list dropped the success terminal `PASS`. Both FAIL issues come from one root: the list was never re-derived from the receiving role's contract. The spec itself flagged the risk and did not close it: judgment JD-5 noted that the placement next to the Pivot-deferral bullet was unspecified, and JD-2 caught a *different* wrong Tester outcome (`FATAL_FAIL`) in the same list.
  - **Evidence.** `execution.md` — T2 attempt 1 Reviewer FAIL, Issues 1–2; `requirements.md` §3 Glossary *Legitimate stop*; `judgment.md` JD-2, JD-5.
  - **Why it is not a duplicate.** KZ-changes--leader-brief-contract-1 (read the paragraph that receives an insertion whole) was in the brief and did catch the symptom, but only at review. It does not say to re-derive a ported list from the receiver's authority, which is where both defects entered, at specify time.
  - **Standardization:** → P1.

- **KZ-changes--opus-5-5-rebaseline-2 — This repo's constitution carries no `Default Branch:` pin.** (Product, Low)
  - **Root cause.** Branch Context resolved only through the step-4 `main`/`master` fallback, for the second archive in a row (`changes--agents-md-canonical.md` → *Noted, not a lesson*, first occurrence). A clone with a `main` branch, or with `origin/HEAD` set differently, resolves *unresolved*, and Apply Mode silently defers. Recurring, so it now meets the bar.
  - **Evidence.** `git symbolic-ref refs/remotes/origin/HEAD` → `not a symbolic ref`; `grep -nE "(Default|Integration) Branch" CLAUDE.md AGENTS.md` → 0 hits.
  - **Standardization:** → P2.

## Noted, not a lesson

- **A summary surface was paraphrased from memory** (T4 attempt 1: a "historical note" that never shipped; stop lists misstated; an Implementer count reported as 5 instead of 6). This is a recurrence of KZ-002 → P3.
- **The neighbour-contradiction symptom recurred at T2** even though KZ-changes--leader-brief-contract-1 was copied into the brief. The Reviewer walk caught it (the gate worked), so it is recorded as a recurrence → P4.
- **Adding a restrictive rule without sweeping for existing prescriptions it now restricts.** *Opus specifics* now reserves `xhigh`/`max` for measured gains, while four unmeasured `xhigh` prescriptions remain in the same *Effort dial*. DD-1's reversion challenge asked "what does removing the old rule break", not "what does the new rule contradict". It caused no rework and was only an advisory, so it stays below the bar. It is a candidate for a forward-contradiction sweep lesson if it recurs.
- **The T1 line estimate ignored hard wrapping** (~1.8× over). A single occurrence.
- **Item 0 has no next action for a no-owed-item `Not Done`** (T3 Reviewer note). This is a spec-content gap and belongs in a follow-up proposal, not a process lesson.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.claude/commands/akili-specify.md` — Step 3.2 task-quality rules (beside the obligation-keyed sweep rule) |
| Edit | **A list a requirement ports into another role's persona is re-derived from that role's contract, not copied.** Walk each item against the receiving role's authority and its output contract: drop an item only the source role can take, and when the list is exhaustive ("only"), confirm it still names the role's success terminal. |
| Severity | Medium |
| Status | `applied (2026-09-29)` |

### P2

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `AGENTS.md` — `## Repository Purpose` (the constitution summary block) |
| Edit | Append the bullet: `- Default Branch: master` |
| Severity | Low |
| Status | `applied (2026-09-29)` |

### P3

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-002` |
| Edit | Add `changes/opus-5-5-rebaseline` as a source spec and append the recurrence note: *"recurred: a CHANGELOG entry described a doc state that never shipped and restated persona stop lists from memory, costing a rework round (T4 attempt 1)."* Severity stays **Medium**. The row's `Deferred` target (`implementer.md` append) is unchanged |
| Severity | Medium |
| Status | `applied (2026-09-29)` |

### P4

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-changes--leader-brief-contract-1` |
| Edit | Add `changes/opus-5-5-rebaseline` as a source spec and append: *"recurred (T2): the contradicted neighbour was one the design's judgment flagged (JD-5), and the rule was in the brief; the Reviewer walk caught it, so the gate holds. Root cause at specify time: see KZ-changes--opus-5-5-rebaseline-1."* |
| Severity | Medium |
| Status | `applied (2026-09-29)` |

## Apply Pass (2026-09-29)

The user chose **Apply all** on `master` (Branch Context `default`, apply-capable). All four probes held: the P1 target rule exists, the P2 pin was absent, and the P3/P4 digest rows exist.
- P1 and P2 were written.
- P3 and P4 were merged into the digest.
- New digest rows were added for L1 and L2.

To stay at 10 rows, the digest retired `KZ-changes--kaizen-loop-closure-1` (2026-09-18) and `KZ-changes--gate-falsifiability-1` (2026-09-19). Both are single-occurrence rules already standardized in `/akili-specify`. The skill's "institutionalized longest first" rule would have retired `KZ-changes--kaizen-loop-closure-2` second (also 2026-09-18). It was kept because it is High and recurred as recently as 2026-09-20, so the tie-break was recurrence. No upstream items, so no upstream report was written.
