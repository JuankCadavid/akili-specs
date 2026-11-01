# Archive Summary — Design Skill Routing

**Outcome: delivered and validated (PASS after the fix round).** AKILI now has one Design Routing Matrix (`impeccable-bridge/references/design-routing.md`): Impeccable builds UI code-led with a named playbook, craft floor and `polish`, every design skill has a stated job by environment (ENV-0–ENV-3) and activity, and projects with a UI get a resolved `### Design routing` block. Release class: **minor** (JC, 2026-11-01 12:02). Nothing pushed.

## 1. Document Control

| Field | Value |
|---|---|
| Spec | `changes/design-skill-routing` |
| Type / Deliverable / Depth | Change / software / Standard |
| Approval Mode | `gated` → `pre-approved (JC, 2026-11-01 10:04 UTC-5, via Grok Bot)` |
| Branch | `JuankCadavid/design-skill-routing` (spec branch; `Integration Branch: dev`) |
| Final commit before archive | `93f2224` |

## 2. Original Spec Path

`docs/specs/changes/design-skill-routing/`

## 3. Archive Date

2026-11-01

## 4. Final Status

| Gate | Result |
|---|---|
| Proposal | Approved by JC 09:41 (Option B; D1–D5) |
| Requirements | Approved by JC 10:04; FR-10 amended at execute (E-2, JC 11:08) |
| Design | judgment-day round 1: 4 confirmed severe + 1 disputed → **fixed, not re-judged** (JC 10:04) |
| Tasks | 11/11 `[x]` |
| Tests | PASS — `npm test` 1403/0, 0 product bugs |
| Validation | WARN (1 minor FAIL, 3 WARN) → fix round R-1–R-5 (JC 12:02) → **PASS** |

## 5. Requirements Delivered

FR-1 – FR-14 and NFR-1 – NFR-7 (NFR-4 token economy and NFR-7 consent are prose obligations, accepted as untestable). Highlights: single matrix held once; expertise cards with resolvable evidence; ENV ladder; code-led build route, no finish review in execute; `polish` full/light (AKILI scope limit); motion split (Impeccable `animate` decides, project library implements, GSAP only by recorded decision); mockup picker first, Stitch on request; Step 8D block for UI projects only; repo `AGENTS.md` `## Design Skills`.

## 6. Files Changed Summary

| Area | Files |
|---|---|
| New | `.claude/skills/impeccable-bridge/references/design-routing.md`, `test/design-skill-routing.test.js`, `test/design-skill-routing-coverage.test.js` |
| Skills | `impeccable-bridge/SKILL.md` (v2.1), `ui-ux-pro-max`, `gsap-animation`, `frontend-design` (AKILI sections) |
| Commands | `akili-specify`, `akili-propose`, `akili-seo`, `akili-constitution` (Step 8D) |
| Personas | `.claude/templates/leader.md`, `tester.md` (one example line each) |
| Repo guide & docs | `AGENTS.md`, `CHANGELOG.md`, `docs/flow.md`, `docs/overview.md`, `docs/skills/*` (8), `docs/commands/*` (3) |
| Tests updated | `test/impeccable-bridge.test.js` (version, file list), `test/install-cursor.test.js` (309/323, E-1) |
| Untouched (verified) | `.claude/skills/impeccable/**` (vendored), `bin/`, `scripts/`, `akili-execute.md`, `akili-validate.md`, `digests.json` |

Authored LOC ≈ 654 (461 execute + fix round, 193 `/akili-test` coverage) against a ~650 budget — exceedance accepted by JC 12:02. Review rounds: 15.

## 7. Test Evidence Summary

18 contract tests for this spec (9 author, 9 Tester), every falsifier executed with an assertion-level red; T10 held-out walkthrough (haiku) matched ENV, mockup and GSAP calls on all three profiles.

## 8. Validation Summary

Independent `opus` auditor. Original: FR-13 FAIL (minor), FR-6/FR-14 WARN, figure WARNs, release-class conflict. Fix round resolved all; re-validation PASS.

## 9. Accepted Warnings Or Follow-Ups

| Item | Owner / route |
|---|---|
| **M-1 – M-5** (activity definitions; `onboard` at ENV-3; page-mode decision pointer; platform-motion value in `Design route:`; one over-specified walkthrough cell) | **Separate proposal** (JC 12:02) |
| A-1 / A-2: ENV-0 pair wording without naming the lead in seven surfaces; bridge `description:` order | Same follow-up proposal |
| NFR-4, NFR-7 untestable | Accepted |
| Success criterion 1 (a real UI task showing playbook → craft floor → polish) | Residual risk until the next UI spec runs through `/akili-execute` |
| Release: minor; persona `digests.json` refresh and `since=` markers at `release.js`; existing installs need `akili install --force` for the new bridge folder | Release prep (JC) |
| Push + PR into `dev` | JC |

## 10. Historical Notes

- Brief premise corrected at proposal: Impeccable already led direction and evaluation; the gap was build time and environment routing.
- E-1 (missed consumer: packaged skill-file count) and E-2 (FR-10 UI-only) stopped the run and were decided by JC; no HALT, Pivot or FATAL_FAIL.
- `.agents/` was copied into the worktree (gitignored) and upgraded with `doctor --agents --fix`, as in `changes/impeccable-hardening`.

## 11. Diagrams

One inline Mermaid diagram in `design.md` §3 (routing delivery path). No `diagrams/` folder; no baseline diagram slot made stale (the repo has no TRD/UX baseline).
