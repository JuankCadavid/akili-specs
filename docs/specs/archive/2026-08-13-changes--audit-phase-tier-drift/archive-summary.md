# Archive Summary: `/akili-audit` Phase→Tier Drift Detection

**Outcome:** delivered complete. `/akili-audit` now detects configuration that is coherent with itself and wrong against the methodology — the failure no consistency check could see, and the one that let a real project run its `/akili-execute` Leader on `haiku` for weeks while five routing categories passed. 4/4 tasks PASS, no HALTs.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `docs/specs/changes/audit-phase-tier-drift` |
| Archive Date | 2026-08-13 |
| Final Status | **Complete** — every requirement clause discharged, confirmed by a full-spec closure sweep at the final gate |
| Depth / Type | Standard / Change |
| Approval Mode | `gated` |
| Release classification | **minor** (new methodology behavior; no installer, hook, or new command) |
| Commits | `ea4300f` (spec) · `92cc060` (T1) · `a976898` (T2) · `5a83e79` (T3) · `2bb3ec6` (T4) |
| Design review | Judgment Day `APPROVED` — see `judgment.md` |

## 2. Requirements Delivered

| ID | Requirement | Delivered in |
|---|---|---|
| FR-1 | Phase→tier comparison against the packaged default | T1 |
| FR-2 | Finding carries phase, local tier, packaged tier, rationale cited by file+line | T1 |
| FR-3 | Accepted-divergence record silences only what it named | T2 (+ T4's both-values fix) |
| FR-4 | Packaged-default resolution with an explicit `unevaluated` degrade | T1 (+ T4's Matrix value) |
| FR-5 | Structural persona drift replacing the hardcoded guardrail list | T3 |
| FR-6 | Report surface, priority rule, report-only posture | T1, T4 |
| FR-7 | Mirror + CHANGELOG | T4 |
| NFR-1…NFR-4 | Report-only · zero noise · non-regression · guidance-only | All tasks; verified at the final gate |
| NFR-5 | Bounded size | **Exceeded — escalated and accepted** (see §9) |

## 3. Files Changed Summary

| File | Change |
|---|---|
| `.claude/commands/akili-audit.md` | New twelfth Step 2 category `Phase→Tier Drift` (`:60`); `:59(c)` persona check made structural; Conformance Matrix row with `Unevaluated` (`:105`); Verification Checklist reconciliation (`:127`–`:128`) |
| `docs/commands/akili-audit.md` | Summary-level mirror bullet |
| `CHANGELOG.md` | `Unreleased` → `Added`, classified minor |

## 4. Test Evidence Summary

**None, and the absence is accepted.** The spec ships prose that instructs agents — no executable code, no harness that can assert an LLM follows it. `requirements.md` §8 substitutes a HITL walkthrough, executed at the T4 gate across nine branches (five of them fall-throughs no earlier gate had exercised). Two genuine gaps were found and closed by that walkthrough.

## 5. Validation Summary

**No `validation-report.md`, and the absence is accepted (user choice).** Substituted by the final Reviewer's full-spec closure sweep, which walked every clause of FR-1…FR-7 and NFR-1…NFR-4 and reported **no requirement clause left undischarged by the spec as a whole**.

## 6. Historical Notes — one defect family, five times

Five of the six FAIL/pivot findings in this spec were the same shape: **a claim about the world, verified by a method structurally incapable of falsifying it.**

| # | The claim | The check that could not fail |
|---|---|---|
| 1 | *"Installed commands are always present in an AKILI project"* (Judgment Day C4) | Evidence gathered in this repo, where the path exists by construction |
| 2 | The DD-2 marker *"is byte-identical"* (T2) | A comparison that unescaped both sides before comparing |
| 3 | *"Resolved per Step 8B"* covers `--local` (T3) | Step 8B has zero `--local` mentions |
| 4 | *"Budget satisfied"* (T4) | Reported in git lines, the one unit under which a prose-density budget cannot fail |
| 5 | A record acquits its phase (T4) | Compared one of the two values the record stores |

None was caught by a grep, and none by its author. Every one was caught by a Reviewer that **re-derived the claim from source** — `bin/akili.js`, `commonmark.js`, the raw bytes, the estimator's own arithmetic.

**A Leader error of the same family, recorded.** The T2 Reviewer raised the local-tier branch; the Leader recorded it in `execution.md` as owned by T4, then composed T4's walkthrough with the *packaged*-tier branch instead — already covered — and the real one never reached the brief. Noting a finding does not transport it.

## 7. Pivot

One, in T3. `requirements.md` FR-5 itself named `.claude/templates/` as the packaged persona source — a path that exists in no consuming project, since the installer reads *from* it and writes to `<config-root>/akili/templates/`. Had it shipped, every persona in every project would have hit the "no packaged template → unscored" branch and the sub-check would have emitted nothing, permanently and silently. Spec corrected, two-direction sweep run, user-approved. Full record in `execution.md` → `## Pivot Record: T3`.

## 8. Design Review

Judgment Day: **APPROVED** after 2 bounded fix rounds and 1 scoped re-judgment across 5 blind judges. 4 confirmed severe findings, all resolved; 7 single-judge findings recorded as `info` by user scope decision. Two protocol deviations disclosed in `judgment.md` — non-identical criteria in round 1, and one judge that never delivered.

## 9. Accepted Warnings & Follow-Ups

| Item | Disposition |
|---|---|
| **NFR-5 budget: ~89 prose-lines vs ~60 ceiling (~48% over)** | **Escalated at the T4 gate and accepted by the user.** Assessed as an estimating error, not scope creep — `tasks.md` §4 budgeted T4 at ~12 lines and never accounted for a house-style CHANGELOG paragraph. NFR-5 is a `SHOULD` |
| `design.md` §7 calls its 6-surface table "the closed set" but the change also touches two Verification Checklist bullets | Advisory. Both mandated by T4's scope; a stale design table, not scope creep. One-line reconciliation worth making if the design is ever revisited |
| The Matrix row fuses two independent checks into one cell | Advisory. A mixed state (phase→tier aligned, persona root unresolvable) must be carried in Notes or it disappears. No requirement mandates separate rows |
| `docs/commands/akili-audit.md` says "six categories"; the command has twelve | Advisory. Pre-existing mirror staleness (it listed five of eleven before this spec); FR-7 asks only for a summary-level mention |
| Residual risk: prose executability | **Accepted and recorded** per `requirements.md` §8. Real proof arrives when an audit runs against a live project |
| Release not yet published | CHANGELOG classified **minor**; `npm run release:minor` remains |
