# Validation Report — Public docs refresh for 2.34.1

**Verdict: PASS — archive-ready.** 0 FAIL, 0 BLOCKED. 4 WARN found by the independent audit: 2 corrected during validation (A-1, A-2), 2 accepted and carried to the archive summary (F-1, F-2).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-refresh-2-34` |
| Date | 2026-10-19 |
| Validated at | `a91f9c9` + validation corrections (next commit) |
| Auditor | Independent fresh-context auditor, `opus` (T3); Implementers were `sonnet` — author ≠ auditor. Report assembled by the Leader (Opus 5.5) |
| Approval Mode | `pre-approved` — report gate `auto-approved (pre-approved mode)` |
| Evidence reused | `test-report.md` (acceptance 35/35, `npm test` 413/413, `verify:cli`, `pack:dry-run`, `git diff --check`) |

## 2. Summary

| Area | Result |
|---|---|
| Task completion | PASS — 4/4 `[x]`, each with a Reviewer PASS in `execution.md` |
| File existence | PASS |
| Build integrity | PASS |
| Requirement coverage | PASS — every scenario and clause owned and evidenced |
| Factual accuracy | PASS after correction (A-1, A-2 fixed) |
| Design conformance | PASS — drifts explained in `execution.md` |
| Cross-document figures | WARN — F-1, F-2 (accepted) |
| Constitution impact | PASS — none owed |

## 3. Task Completion

| Task | Status | Evidence |
|---|---|---|
| T1 Figure | PASS | `execution.md` T1: P-5 settled, falsifier 11/12, user decision on the font floor, Reviewer PASS |
| T2 README | PASS | Reviewer PASS, attempt 1 |
| T3 Docs hub + flow | PASS | Reviewer PASS, attempt 1 |
| T4 Command pages, index, CHANGELOG | PASS | Reviewer FAIL → PASS on attempt 2 |

## 4. File Existence

Design §3 surfaces all changed as planned: `assets/akili-flow.{svg,png}`, `README.md`, `docs/README.md`, `docs/flow.md`, `docs/commands/akili-{constitution,specify,archive}.md`, `docs/skills/README.md`, `CHANGELOG.md`. `docs/commands/README.md` untouched by design (P-11). No Archify file tracked (`git ls-files` archify set identical to base).

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` (after validation corrections) | 413 pass, 0 fail |
| `npm run verify:cli` | 12 commands \| 27 skills \| 8 resources |
| `npm run pack:dry-run` | both assets packed (403.9 kB, 132.9 kB → SVG now one phrase longer) |
| `git diff --check` | clean |
| acceptance suite (after corrections) | 35/35 |

## 6. Requirement Coverage

| Requirement | Result | Clause-level evidence |
|---|---|---|
| FR-1 | PASS | 12/12 commands drawn; video + diagram labels; PNG 1800 wide; font floor 5.74 ≥ 5.5 and labels 8.08 ≥ 8 (as amended by the user); BUT clauses checked; full-size link. "No clipped text" by visual review (test-report GAP-1) |
| FR-2 | PASS | alt byte-identical at `README.md:48`, `docs/flow.md:7` and the SVG `<desc>` — still identical after A-1; "no claim the figure lacks" by Reviewer walk (GAP-2), re-checked for A-1 |
| FR-3 | PASS | section before *Install*, three linked rows, native-Windows statement, *Start Here* hand-off; restatement tests green |
| FR-4 | PASS | *Contents* 12 = 12, 27 = 27 |
| FR-5 | PASS | caveat `README.md:30`, badge kept `:27` |
| FR-6 | PASS | hub, lifecycle pair, §10, §11, link rule |
| FR-7 | PASS | three anchors with conditions (constitution `:122` "whose condition holds" after the T4 rework) |
| FR-8 | PASS | index sorted; `[Unreleased]` `### Changed`, npm vs `master` wording, compatible with `scripts/release.js:75-91` |
| NFR-1…4 | PASS | commands above; NFR-2 diff empty; all commits `[SPEC:changes/docs-refresh-2-34]`, none pushed; caps met |

## 7. Linting & Code Quality

No lint applies to Markdown in this repo beyond `git diff --check` (clean).

**Corrected during validation (factual, single-answer — applied and logged):**

| ID | Finding | Correction |
|---|---|---|
| A-1 | Alt text / SVG `<desc>` said diagram slots are "filled at … archive", and the README row said slots are drawn "at … `/akili-archive` Step 2". Archive **fills nothing**: it links the spec's views and lists stale baseline slots as follow-ups (`.claude/skills/diagram-design/SKILL.md:26`, `.claude/commands/akili-archive.md:124`) | Three alt sites (README `:48`, flow `:7`, SVG `<desc>`) → "filled at constitution and specify and linked at archive", kept byte-identical; README *What AKILI Covers* diagrams row reworded; flow §11 archive bullet says it fills none |
| A-2 | flow §11 (and README row) named constitution Steps 3–5 without "whose condition holds" (source `:163/:208/:245`) — reads as every slot, always | flow §11 constitution bullet carries the condition and the always-filled C4 views; README row says "Diagram slots whose condition holds" |

Correction closure: forward grep of `filled at constitution, specify and archive` over README, docs, assets, `.claude` and the spec folder → 0 hits after the edit; backward: the acceptance suite's alt-identity check and the T2/T3 Reviewer records refer to the alt by identity, not wording — still true (35/35).

**4R advisory (carried forward, no task):** NFR-4 "400 KB" holds only as KiB; the SVG's CSS comment still lists six font subsets; the Bug Track pill sits on the loop-lane border; librsvg cannot render the SVG (browsers can); a ~200 px empty band at the bottom of the figure; video nodes only approximately aligned under specify/test/validate; the alt text now lives byte-identical at three sites, so any future wording change must touch all three; the README figure is invisible until it reaches `master` (documented in CHANGELOG).

## 8. Design Conformance

PASS. Explained drifts (`execution.md` T1): export already carried `role`/`<title>`/`<desc>`; 5 of 6 font subsets stripped for the 150 KiB cap; NFR-4 aligned to the byte caps of `tasks.md`; FR-1 font floor amended by the user. Proposal alignment: intent, scope and non-goals hold; deviations — PNG 1800×1610 (not 1800×1200), Archify 1081×906 viewBox and Archify styling (not the former 900×600 hand style), PNG exported by Archify (not `rsvg-convert`) — all follow from the user's Archify decision.

## 9. Test Evidence Summary

`test-report.md`: PASS. Acceptance suite discriminates (22 FAIL at base `9be733a`, 0 at HEAD). Gaps GAP-1…3 accepted with substitutes (visual reviews; Chromium render; push forbidden).

## 10. Agent Guide / Constitution Impact

None — no module created or reshaped; `AGENTS.md`/`CLAUDE.md` untouched; no `## Constitution Impact` notes.

## 11. Remediation

| ID | Level | Item | Disposition |
|---|---|---|---|
| A-1 | WARN | archive "fills" diagram slots | **Fixed** in validation |
| A-2 | WARN | Steps 3–5 condition missing on flow §11 / README | **Fixed** in validation |
| F-1 | WARN | `requirements.md`, `design.md`, `tasks.md`, `proposal.md` cite `README.md:46`; the image is at `:48` after T2's caveat line | Accepted — premise citations are pinned to their verified-at commits; recorded in the archive summary |
| F-2 | WARN | `execution.md` budget line says 58 Markdown LOC; `git diff --numstat` over the shipped docs gave +55/−5 = 60 (before validation's +6/−6) | Accepted — budget unaffected; measured figure recorded in the archive summary |

## 12. Archive Readiness Recommendation

**Ready.** All tasks `[x]`, no FAIL, WARNs fixed or accepted, tests cover every clause, drift recorded.

```text
/akili-archive changes/docs-refresh-2-34
```
