# Archive Summary — Video Deliverable Track

**Outcome: complete — validated ARCHIVE-READY (0 FAIL, 0 open WARN). Local commits only; not pushed, not released.**

## 1. Document Control

| Field | Value |
|---|---|
| Spec | Video Deliverable Track |
| Branch | `JuankCadavid/skill-hyperframes` (worktree `skill-hyperframes`) — spec branch; default `master` |
| Commits | `4a6ac65` (proposal) … `f701490` (validate) — all `[SPEC:changes/video-deliverable-track]` |
| Release | none — package change awaits a release (CHANGELOG `[Unreleased]` carries it) |

## 2. Original Spec Path

`docs/specs/changes/video-deliverable-track/`

## 3. Archive Date

2026-10-18

## 4. Final Status

| Gate | Result |
|---|---|
| `/akili-execute` | 12 / 12 tasks `[x]` + pivot tasks A3, A4 `[x]` |
| `/akili-test` | PASS after rework A4 (first run FAIL: F1–F3) — `npm test` 275/275, walkthrough 32/32 |
| `/akili-validate` | ARCHIVE-READY — 59 PASS, 3 WARN (resolved via V1), 0 FAIL |

## 5. Requirements Delivered

| ID | Delivered as |
|---|---|
| FR-1 | `/akili-propose` records `Deliverable: software \| video`; Trivial × video stays a Lite proposal; `/akili-quick` gate criterion "Not a video composition" |
| FR-2 | `/akili-specify` Video Mode: criteria via `acceptance-criteria.md`, storyboard in `design.md`, Bug × video frame/metadata regression |
| FR-3 | Every video task lists `video-production`; Leader template example; render approval-gated and quiet-tree |
| FR-4 | Availability gate (`hyperframes` or `/hyperframes:hyperframes`), project-scoped install route, `skills update` labelled global; first-render consent; `skills check` global-only |
| FR-5 | `HYPERFRAMES_NO_TELEMETRY=1`; outward actions consent-gated each time |
| FR-6 | `/akili-test` render-evidence suite (runs alone); duration vs target and `data-duration`, same tolerance, default ± 0.1 s |
| FR-7 | `/akili-validate` final look before PASS; delivery render after approval |
| FR-8 | `.claude/skills/video-production/` — original authorship, MIT, `conditional`, 3 files, 12,250 B |
| FR-9 | Governance rule 4 (load-direct only behind selector + gate), rule 2 narrowed; constitution Step 8D |
| FR-10 | Docs, README, `AGENTS.md`, `docs/flow.md`, `docs/cli.md` (25 skills), CHANGELOG, fixtures |
| NFR-1…5 | Met — `validation-report.md` §6 |

## 6. Files Changed Summary

| Area | Files |
|---|---|
| New skill | `.claude/skills/video-production/SKILL.md`, `references/acceptance-criteria.md`, `references/render-evidence.md` |
| Commands | `.claude/commands/akili-{propose,specify,test,validate,quick,constitution}.md` |
| Template | `.claude/templates/leader.md` (one example clause) |
| Docs | `docs/skills/{governance,README,video-production}.md`, `docs/commands/akili-{propose,specify,test,validate,quick}.md`, `docs/flow.md`, `docs/cli.md`, `README.md`, `AGENTS.md`, `CHANGELOG.md` |
| Tests | `test/install-cursor.test.js`, `test/fixtures/doctor-codex-baseline.txt`, new `test/video-production.test.js` (16 tests) |

No `bin/` change; `.claude/templates/digests.json` is refreshed by the next release (P-17).

## 7. Test Evidence Summary

`npm test` 275/275 · `verify:cli` 11 commands / 25 skills / 8 resources · `pack:dry-run` 284 files (4 new packaged) · `install --tool all --dry-run` lists the skill for all 5 targets · held-out walkthrough 32/32 · live smoke T12 (project-scoped install, draft render 5.000 s, duration falsifiers FAIL as required).

## 8. Validation Summary

Independent auditor (opus, fresh context): 59 PASS · 3 WARN · 0 FAIL · 0 BLOCKED; scenario- and clause-level coverage complete; no contradicting figure across documents. WARNs (amendment-ID clash, stale status cells, uncommitted edits) resolved and committed.

## 9. Accepted Warnings Or Follow-Ups

| Item | Disposition |
|---|---|
| 15 execute advisories `(b)`–`(p)` and walkthrough A1–A5 | Advisory only — never tasks; candidates for a follow-up proposal (e.g. captions/voice routing in the deferral table, detecting "first render", specify without proposal never enters Video Mode) |
| `~/.hyperframes/config.json` updated by T12 | Prior state unverifiable; left as is. `~/.cache/hyperframes/` deleted at the user's order |
| Hosts other than Claude Code / macOS | NFR-4 accepted risk — not exercised live |
| Release | Package-affecting; needs `npm run release:minor` (new skill + behaviour) after merge — not done this cycle |

## 10. Historical Notes

- **Amendments:** T1 Pivot (P-24: `npx hyperframes skills update` always installs globally → project-scoped `npx skills add … --skill … --yes`), A2 (FR-9 scoped to load-directing mentions), A3 (T12 findings S1–S5: first-render consent, home caches, network, `skills check` scope, default tolerance), A4 (`/akili-test` F1–F3), V1 (validate: NFR-1 wording, quick-gate restatements).
- **Review rounds:** 20 of 20 (tripwire "stop past 20" reached, not exceeded; user had pre-approved exceeding it for A4).
- **Runtime:** one Tester died on a provider session limit; recovered by resume-by-message with no lost work. T12's worker missed a STOP condition (download outside scratch) — recorded as a deviation.
