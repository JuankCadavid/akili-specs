# Archive Summary — changes/model-routing-cost-rebaseline

**Outcome:** complete. The packaged default Model Routing registry is re-baselined on requests-per-month at each model's own OpenCode Go limit (DeepSeek across all OpenCode tiers), Antigravity defaults to Gemini 3.8 Flash with the effort in the ID and Gemini 3.1 Pro as auditor, Codex defaults to Terra/Luna with Sol as the plan-permitting upgrade; the constitution's Step 8C/8E defaults, the mirror and the CHANGELOG follow. Two tasks, both Reviewer PASS on attempt 2; one approved data pivot; CI green on six legs.

## Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/model-routing-cost-rebaseline` |
| Archive Date | 2026-09-17 |
| Depth / Type | Lite / Change |
| Approval Mode | gated |
| Release Classification | patch (rides in the same release as `changes/codex-install-target`, minor) |
| Final commit | `0556b31` on `master` |

## Final Status

| Task | Status | Attempts |
|---|---|---|
| T1 `docs/model-routing.md` (table, prose, effort map, examples, runbook, cross-host) | `[x]` | 2 |
| T2 constitution Step 8C/8E defaults, mirror parity, CHANGELOG | `[x]` | 2 |

## Requirements Delivered

| ID | Delivered by |
|---|---|
| FR-1 OpenCode column on monthly quota per model (amended by Pivot Record T1) | T1 |
| FR-2 Antigravity family + effort ID, Gemini 3.1 Pro auditor, dial → ID map, `agy models` confirmation | T1 (registry), T2 (Step 8C) |
| FR-3 Codex Terra/Luna/Sol, Astra removed from defaults | T1 |
| FR-4 pinned-or-removed prose | T1 |
| FR-5 constitution defaults, mirror parity, CHANGELOG, old-pick sweep | T2 |
| NFR-1..5 | T1/T2; NFR-3 by proxy (hand-scaffolded Step 8C table, zero cell differences, Reviewer-verified cell by cell; executed scratch check declined by the user) |

## Files Changed Summary (from `execution.md`)

| File | Change |
|---|---|
| `docs/model-routing.md` | 122+/68− — registry table, *Why these models* rewritten around the pinned metric, effort-dial map, example slugs, runbook example, cross-host vision line, Codex paragraph |
| `.claude/commands/akili-constitution.md` | 18+/10− — Step 8C Antigravity wording + `agy models`, Step 8E OpenCode default slugs + R7 clause |
| `docs/commands/akili-constitution.md` | 4+/2− — mirror parity |
| `CHANGELOG.md` | 6+/1− — Unreleased → Changed (patch) entry; "superseded above" pointer on the Codex live-validation sentence |

## Test Evidence Summary

No `test-report.md`: documentation-only spec, no executable surface. Absence accepted at archive; verification was the task-level check matrices (source fetches, `agy models` roster, greps with falsifiers, byte-identity diff of untouched paragraphs), two independent Reviewer runs, and the CI matrix (run 35249366761, six legs green).

## Validation Summary

No `validation-report.md` (`/akili-validate` not run): the requirements are claim-accuracy scenarios whose gates ran inside the Reviewer audits (every slug/ID/figure re-fetched and compared by the Reviewer). Absence accepted at archive.

## Accepted Warnings Or Follow-Ups

| Item | Disposition |
|---|---|
| Pivot Record T1 — proposal/design figures were the plan page's per-5-hour column; monthly figures adopted, picks unchanged | Closed in-spec (approved) |
| NFR-3 executed check (scratch project Step 8C + `/akili-audit`) | Declined by the user; the first project that re-runs Step 8C is the live drift check |
| `/akili-audit` will report Model Registry Drift on registries scaffolded before this release until Step 8C is re-run | Intended; stated in CHANGELOG |
| `<CONFIRM>` on OpenCode T4 context window and Antigravity/Codex T6 vision | Kept — no pinned evidence |
| DeepSeek V4.1 Flash 4× promo ($60 / 130,000) ends 2026-09-20 | Noted separately from the $15 baseline so the doc does not stale-date |
| Reviewer advisory: three wrapped lines short of the file's column width | Cosmetic; fold on next touch |

## Historical Notes

- Proposal approved 2026-09-17 (Option A + A1; the "$60 limit" decision was later retired by Pivot T1 once the monthly column was read).
- Design ran the Step 2.3 reversion challenge (one `sonnet` reviewer, seven reversions): two real contradictions found and fixed before tasks (DD-8; cross-host vision line), four stale sites added to the surface table. Judgment-day not run (user chose Continue).
- Budget: 2 tasks / ~160 lines / 3 review rounds → 2 / ~190 / 4.
- Kaizen retrospective: `docs/specs/kaizen/changes--model-routing-cost-rebaseline.md`.
