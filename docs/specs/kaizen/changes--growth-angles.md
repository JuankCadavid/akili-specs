# Kaizen Entry: changes/growth-angles

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/growth-angles` |
| Date | 2026-10-28 |
| Branch | `JuankCadavid/growth-angles`. Branch Context: **spec**. The `Integration Branch: dev` pin exists, so the apply-capable branch is `dev` |
| Archive Run | 1 |
| Approval Mode | pre-approved (maintainer mandate, 2026-10-28 6:21/6:30 PM Bogota: process gates take the recommended option) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 9 | tasks.md |
| Reviewer FAIL rework attempts | 6: T1 ×2, T2, T3, T5, T7 | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0. Two execute-time spec amendments (P-3 refuted at T1; byte-size test re-pointed at T8) | execution.md T1, T8 |
| PRODUCT_BUGs | n/a — `/akili-test` not run (accepted gap) | archive-summary.md §4 |
| Judgment-day severe findings | none recorded | — |
| Validation FAIL / WARN | n/a — `/akili-validate` not run (accepted gap) | archive-summary.md §4 |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| HITL observation waived | T9 dogfood, by the maintainer | execution.md T9 |
| Escaped defects | 1. An unplanned generated file (`assets/akili-flow.svg.nodes`) passed T8 review and was committed; found at T9 from the CHANGELOG claim, removed at the maintainer's decision (`7d18c97`) | execution.md T8, T9 |

## Lessons

- **KZ-changes--growth-angles-1: a Reviewer that audits the content of the declared files does not see an undeclared file in the diff.** (Methodology, Medium)
  - Root cause: Archify's export wrote a node-id sidecar next to the SVG; the Implementer staged `assets/` and its report listed only the three planned assets. The Reviewer persona's *Structured Evaluation* compares changes "with the active task's specification files" but never asks for the diff's file set (`git diff --name-status`, plus untracked files) to be checked against the task scope and the Implementer's file list, so the extra file — shipped in the npm package — passed a Reviewer PASS and the Leader's evidence re-run.
  - Evidence: `execution.md` T8 attempt 1 (file list without the sidecar; Reviewer PASS); T9 *Open for the maintainer* (1) and its decision; `npm run pack:dry-run` 343 → 342 files after removal.
  - Standardization: → P1 (upstream)
- **KZ-changes--growth-angles-2: a test that reads a value from a released CHANGELOG section by its exact version cannot follow a regenerated asset and breaks at the next release cut.** (Product, Medium)
  - Root cause: `test/flow-figure-animated-contract.test.js` (from `changes/flow-diagram-animated`) read the byte size from the dated `[2.37.2]` section and excluded only that one heading from "no released section mentions the figure". The first regeneration of the asset made the byte-size test unpassable, and a dated 2.38.0 section would have turned both tests red; neither design anticipated a later spec touching the same asset.
  - Evidence: `execution.md` T8 *Decisions* (1)–(3); T9 attempt 1 (release-cut simulation: HEAD's tests 2 red, fixed tests 140/140).
  - Standardization: → P2

## Noted, not a lesson

- **Shadowed dogfood — recurrence, see P3.** The maintainer's T9 dogfood ran the globally installed 2.37.0 `~/.claude/commands/akili-marketing.md`, which shadowed the scratch project's local install; the handoff's "check seven modes first" step caught it, but the T9 plan named no isolation. Same root cause as KZ-changes--codex-install-target-2 (a global install satisfies the check in place of the artifact under test).
- **KZ-002 recurrence — see P4.** T7 failed because the docs said `campaign` and `post` select "one approved angle, one of five approaches and one of three hooks", more than the command ships; the T9 Reviewer's non-gating notes found two more loose wordings ("up to 9 … beliefs" read as a total, "once").
- **Unanchored test literals.** T1 attempt 2 and T5 attempt 1 failed because literals matched the whole file (the worked example, other sections) instead of the owning section; fixed with section-scoped literals and move mutations. This is the anchoring half of KZ-changes--gate-falsifiability-2, applied late rather than missing; no new item.
- **Accepted process gaps.** `/akili-test` and `/akili-validate` were skipped at the maintainer's direction to release 2.38.0 directly; recorded, not a lesson.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology — `.claude/templates/reviewer.md`, section `structured-evaluation` (and `digests.json` at release) |
| Edit | Add a bullet: "**Check the diff's file set, not only its content.** Run `git diff --name-status <base>` and `git status --short`; every path outside the task's scope and the Implementer's file list — a tool's sidecar, a cache, a stray export — is a FAIL issue unless the brief justifies it." |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `AGENTS.md`, *Repository Purpose*, the `test/` bullet |
| Edit | Append: "A test that checks `CHANGELOG.md` text reads the newest section that states the value (document order, `[Unreleased]` first) and bounds any 'released sections untouched' check by version (older than X), never by one excluded heading, so it survives both a later spec and the release cut." |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--codex-install-target-2 |
| Edit | Recurrence note: "recurred (changes/growth-angles: the T9 dogfood ran the global `~/.claude` 2.37.0 command, which shadowed the scratch project's local install; a hands-on dogfood of a changed command needs an isolated config dir or a version check as its first step)". Promote to the `## Active Lessons` digest if absent. |
| Severity | Medium |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add `changes/growth-angles` as a source. Recurrence note: "recurred (changes/growth-angles: T7 docs claimed selection the command does not ship — 'one of five approaches and one of three hooks' — and the T9 CHANGELOG needed two post-review wording fixes)". Severity stays High. |
| Severity | High |
| Status | pending |
