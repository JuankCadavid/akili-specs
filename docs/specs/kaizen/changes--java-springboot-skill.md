# Kaizen Entry — changes/java-springboot-skill

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/java-springboot-skill` |
| Date | 2026-11-26 |
| Branch | feat/java-springboot-skill (spec branch; apply-capable branch is `dev`) |
| Archive Run | 1 |
| Approval Mode | gated through Phase 2; routine gates auto-approved on JC's mandate from Phase 3 on |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 10 | tasks.md |
| Reviewer FAIL rework attempts | 5 (T4 ×1, T5 ×2, T7 ×1, T3 ×1), plus 1 post-PASS consumer regression (T5 attempt 3) | execution.md — Summary *Reworked* |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 | execution.md |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 4 confirmed (J-1 … J-4) + 2 severity splits | judgment.md — Counts |
| Validation FAIL / WARN | 0 / 2 | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 (no `REVIEW_SKIPPED` task) | test-report.md / validation-report.md |
| Drift attributable | none recorded | docs/specs/drift-report.md (legacy; no `drift-*.md` under audits/) |

## Lessons

No new lesson. Both root causes with evidence already exist and are recorded as recurrences (P1, P2).

## Noted, not a lesson

- **The held-out walkthrough earned its place.** It found the Gradle catalog-alias double report (one module reported as Java / Spring Boot and as "ask the user") that 9 text-contract tests missed (execution.md — T3 reopened, T10 *Walkthrough* fixture 1). This confirms KZ-changes--gate-falsifiability-1 rather than adding a root cause.
- **FR-1 count drift.** FR-1 said "six hashes" while §4 listed seven (`LICENSE`). The T1 Reviewer flagged it as an ADVISORY on day 1, and it was corrected only at validate (validation-report R-1). Single occurrence: an ADVISORY naming a spec-text defect could be fixed at once as a factual correction.
- **A tautological test was shipped.** `stack-detection-readers` › *byte-unchanged vs HEAD* compares the tree to itself after commit (test-report §8). Single occurrence.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-004 |
| Edit | Add source `changes/java-springboot-skill`. Recurrence note: "recurred ×3 in one spec (changes/java-springboot-skill: T4, T5, T7 first attempts failed on pointer sentences whose inputs × outcomes were not enumerated)". The row is `Deferred` while it keeps recurring: re-offer its standardization at this apply pass. |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--archify-diagrams-2 |
| Edit | Add source `changes/java-springboot-skill`. Recurrence note: "recurred after Applied (changes/java-springboot-skill: judgment-day J-1 missed `SKILL_CATALOG`, J-4 missed 5 count consumers; T5 attempt 3 reworded a phrase a test still grepped for, i.e. the consumer search must also key on removed phrases)". The applied standardization did not prevent it, so the apply pass should re-examine where it lives. |
| Severity | Medium |
| Status | pending |
