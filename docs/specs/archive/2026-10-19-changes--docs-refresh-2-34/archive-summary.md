# Archive Summary — Public docs refresh for 2.34.1

**Outcome: delivered and validated (PASS).** The README (GitHub + npm), docs hub, flow page, command pages and skills index now cover `/akili-security`, video deliverables and diagram slots; the lifecycle figure was regenerated with Archify; inventories match the package (12 commands, 27 skills).

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/docs-refresh-2-34` |
| Archive Date | 2026-10-19 |
| Archive Path | `docs/specs/archive/2026-10-19-changes--docs-refresh-2-34/` |
| Branch | `JuankCadavid/docs-refresh` (spec branch; `Default Branch: master`) |
| Commits | 7 shipped-work commits after `9be733a` (T1 `1937974`, T2 `4a7aa8d`, T3 `637cb7a`, T4 `a731f60`, test `a91f9c9`, validate `39992c5`, + execute log `62b27e7`), all `[SPEC:changes/docs-refresh-2-34]`, **local only — no push, tag, release or publish** |
| Final Status | **PASS** — 0 FAIL, 4 WARN (2 fixed in validation, 2 accepted) |

## 2. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | Archify `workflow` figure, 5 lanes, all 12 commands, video track, diagram slots, `/akili-security` → Bug Track; README links the full-size PNG; font floor **amended by the user** to ≥ 5.5 px (labels ≥ 8 px) at 900 px |
| FR-2 | One alt text, byte-identical at `README.md:48`, `docs/flow.md:7` and the SVG `<desc>` |
| FR-3 / FR-5 | `## What AKILI Covers` table; *Start Here* anytime paragraph; native-Windows caveat, Windows badge kept |
| FR-4 | README *Contents* = 12 commands, 27 skills |
| FR-6 | Hub names every command; flow lifecycle pair for `/akili-security`; flow §10 *Video Deliverables*, §11 *Diagram Slots* |
| FR-7 | Constitution / specify / archive pages name `diagram-design` with step and condition |
| FR-8 | Skills index alphabetical; CHANGELOG `[Unreleased]` `### Changed` note |
| NFR-1…4 | `npm test` 413/413, `verify:cli`, `pack:dry-run`, diff-check; file scope held; local commits; PNG 403,861 B, SVG ~133 KB |

## 3. Files Changed Summary

| File | Change |
|---|---|
| `assets/akili-flow.svg` | 6,449 B → ~133 KB (Archify `svg-light` export, latin font subset only, FR-2 `<title>`/`<desc>`) |
| `assets/akili-flow.png` | 1800×1200 → 1800×1610, 403,861 B |
| `README.md` | +19/−1 |
| `docs/flow.md` | +21/−1 |
| `docs/README.md` | +8 |
| `docs/commands/akili-{archive,constitution,specify}.md` | +2, +1, +1 |
| `docs/skills/README.md` | `tdd` row moved |
| `CHANGELOG.md` | placeholder → `### Changed` bullet |

Markdown total vs base: **+55/−5 (60 lines)**, measured with `git diff --numstat 9be733a HEAD` — supersedes the "58" in `execution.md` (F-2). Budget: 4/4 tasks, 60/~180 LOC, max 2 review rounds (T4).

## 4. Test Evidence Summary

`test-report.md`: acceptance suite 35/35 (22 FAIL at base — discriminates), `npm test` 413/413, `verify:cli` 12 | 27 | 8, pack lists both assets. Gaps GAP-1…3 (visual legibility, semantic alt truth, live github/npm render) accepted with substitutes.

## 5. Validation Summary

`validation-report.md`: PASS by an independent `opus` auditor. A-1 (alt text said archive *fills* diagram slots — it links them) and A-2 (missing "whose condition holds") fixed during validation at all sites.

## 6. Accepted Warnings Or Follow-Ups

| Item | Disposition |
|---|---|
| F-1 | Spec documents cite `README.md:46`; the image is at `:48` after T2's caveat line — citations are pinned to their verified-at commits |
| F-2 | LOC actual is 60 (above), not 58 |
| Release | Not done by rule. The README text reaches npm only at the next publish; the figure (raw `master` URL) appears once this branch merges to `master`. Classify as **patch** (docs only) |
| Advisories (no task) | NFR-4 "400 KB" = KiB; stale six-subset CSS comment in the SVG; Bug Track pill on the lane border; ~200 px empty band at the figure bottom; librsvg cannot render the SVG (browsers can); the alt text lives at three sites |
| Archify install | Installed by `npx skills add` into the session scratchpad only (the CLI ignored `--help` and installed project-scoped there); nothing in the repo or global config |

## 7. Historical Notes

- User decisions: generate the figure with Archify (proposal); accept the Archify figure and amend the font floor (T1).
- judgment-day: 13 ledger rows, three confirmed by both judges with a severity split (warning vs severe), all fixed; round 2 APPROVED.
- `.agents/` copied from the main checkout (gitignored); three persona sections fixed locally with `doctor --agents --fix --allow-branch`.

## 8. Diagrams

n/a — the spec has no `diagrams/` folder or diagram slot (the figure is a README asset, design §1); `diagram-design` not loaded. No baseline diagram slot made stale.

## 9. Post-archive fix (2026-10-19)

**Decision (Juan Carlos Cadavid):** remove the video (HyperFrames) and diagram (Archify) lanes from the lifecycle figure; keep `/akili-constitution`, the per-spec loop with Kaizen, and the anytime commands with `/akili-security`'s hand-off to the Bug Track. README *What AKILI Covers* is deliberately unchanged — it still documents both capabilities.

| Item | Change |
|---|---|
| `assets/akili-flow.svg` | Re-generated from the T1 Archify candidate minus the `video` and `diagram` lanes (3 lanes, 13 nodes, 9 edges); `finalize` → validate/deliver/check/browser-check pass; `svg-light` export, latin subset only, `<title>`/`<desc>` set, trailing spaces stripped; 121,568 B; viewBox 1005 → min font 6.6 px = 5.91 px at 900 (FR-1 amended floor ≥ 5.5 holds); Chromium decodes `1005x654` |
| `assets/akili-flow.png` | 1800×1311, 285,229 B |
| Alt text | New text at `README.md:48`, `docs/flow.md:7` and the SVG `<desc>` (byte-identical): the video and diagram sentence removed |
| `CHANGELOG.md` `[Unreleased]` | Figure clause now reads "three lanes: `/akili-constitution`, the per-spec loop with Kaizen, and the anytime commands with `/akili-security`'s hand-off to the Bug Track" |
| `acceptance-check.py` | FR-1 video/diagram-label check replaced by "no video or diagram lane drawn" + "three lanes"; FR-2 alt check no longer requires video/diagram terms |

Supersedes, for the figure only: FR-1's video-track and diagram-slot elements, design §3 *Figure content* rows for those lanes, and the related validation/Reviewer statements above (kept as history). Verification: acceptance `TOTAL 36 FAIL 0`; `npm test` 413/413; `verify:cli` 12 | 27 | 8; `git diff --check` clean. No test under `test/` depends on the figure (`grep -rln akili-flow test bin scripts .github` → none).
