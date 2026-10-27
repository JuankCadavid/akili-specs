# Judgment Day: `changes/flow-diagram-animated` design

| Field | Value |
|---|---|
| Target | `design.md` (draft of 2026-10-27), judged against `requirements.md` and `proposal.md`; repo at `4ff00a9` |
| Mode | `judgment_day`, round 1. Two blind read-only judges (A, B) on `sonnet`; the design was authored on `opus` (author ≠ auditor) |
| Skills resolved | `judgment-day` (packaged; its `references/` are not shipped, so the ledger lives here) |
| Approval Mode | pre-approved. A severe finding confirmed by both judges still stops for the user (`/akili-specify` *Approval Mode*) |

## Premise Ledger attack

| Row | Judge A | Judge B | Merged |
|---|---|---|---|
| P-1 | confirmed | confirmed | confirmed |
| P-2 | confirmed; also notes the `svg[data-animation="trace"]` rule (custom properties only) | same | confirmed; wording widened (L-3) |
| P-3 | confirmed (fresh `curl -sI`) | confirmed | confirmed |
| P-4 | not re-run; probe is a toy `fill` animation | confirmed for what ran; too narrow | confirmed as written; narrowness → F-1 |
| P-5 | not re-run | confirmed (frame files read) | confirmed |
| P-6 | UNVERIFIED-still | UNVERIFIED-still (`RenderCompositorSWGL failed mapping default framebuffer`) | UNVERIFIED |
| P-7 | UNVERIFIED-still | UNVERIFIED-still | UNVERIFIED (High) |
| P-8 | confirmed | confirmed | confirmed |
| P-9 | confirmed | confirmed | confirmed |
| P-10 | confirmed by reading | confirmed by reading | confirmed |
| P-11 | UNVERIFIED-still | UNVERIFIED-still; also `<source media>` survival unproven | UNVERIFIED (High) |

## Findings ledger (frozen, round 1)

| ID | Judges | Severity | Finding | Settled by the architect (re-run) |
|---|---|---|---|---|
| F-1 | A-2 + B-1 | **severe, confirmed by both** | The design depends on mechanisms that no probe tested, and they have no ledger row: CSS animation overriding `opacity="0"`, `pathLength="1"` with `stroke-dashoffset`, `calc(var(--i)*0.9s)` delays, and a `var()` stroke inside an `<img>` | Spike `probe/spike.js` builds this overlay on the real figure. Chromium 149.0.7827.55: 7 frames differ from the static render by 2,226–4,037 px. WebKit 26.5: 6 of 7 differ by 474–2,268 px; the frame at 7.9 s is 0, which falls in the trace/glow gap before the Bug Track pulse. Chromium with `--force-prefers-reduced-motion`: animated vs static, each alone on a page, AE = **0**. `rsvg-convert` 2.62.0 (no CSS animation): AE = **0**. The mechanisms hold in both engines; Firefox remains P-6 |
| F-2 | A-1 | severe, single judge → suspect | The overlay, painted last, would draw the `s1` pulse over the "confirmed finding → Bug Track" label | **Confirmed by re-run.** The label `<text x="173" y="396">` sits inside a `<g data-edge-from>` label group after the node groups, and `s1` runs at x = 173 from y 460 to 332. Fix: insert edge traces right after the last static edge path and node glows right after the last node group, both before the label groups |
| F-3 | A-3 | severe, single judge → suspect | FR-2's "threshold set in design" is not set | **Confirmed** (`grep -i threshold design.md` → none). The spike measured AE = 0, so the threshold is **0 differing pixels**, same engine, image alone on the page |
| F-4 | A-4 + B-4 | warning | The node glow starts when the highlight leaves, not when it arrives; constitution has no inbound edge; propose's second arrival (via e8) is undefined | Fix: glow delay = arrival time; constitution glows at cycle start; propose glows on e1 only |
| F-5 | A-5 | warning | `s1`/`s2` at `--step` 8 and 9 contradict the 7.4–8.4 s window; the draw, hold and fade times do not fit in 0.9 s | Fix: a fixed shared delay for `s1`/`s2`; slot = 0.6 s draw + 0.3 s fade, no hold |
| F-6 | A-6 + B-6 | warning | The LOC budget does not sum (357, not 420) | Fix: ~360 LOC |
| F-7 | A-9 + B-9 | suggestion → adopted | Overlay elements must carry no static class, `data-edge-*`, `data-node-*` or `data-animate`. `.akili-motion *` misses the group itself | Fix: generator contract and test assertion; selector covers the group |
| F-8 | B-2 | warning | `stroke-dasharray: 1` and `stroke-linecap: butt` are unstated | Fix: stated in §7 |
| F-9 | B-8 + A-2 note | suggestion → adopted | Colour via `var()` belongs in CSS, not in presentation attributes | Fix: stated in §7 |
| F-10 | B-3 | warning | The in-SVG reduced-motion rule is verified under a browser-level setting in Chromium only; R-2 named only Firefox | Fix: R-2 covers Firefox and Safari/WebKit |
| F-11 | A-7 | warning | WCAG 2.2.2 (Pause, Stop, Hide): an infinite animation longer than 5 s, and only the media query stops it in `docs/flow.md` | **User decision 2026-10-27: 3 cycles, then rest.** FR-1 amended; DD-11, R-5 |
| F-12 | B-5 | warning | The proposal's "one sentence pointing to the static SVG" for `docs/flow.md` was dropped by FR-5 without a record | Fix: recorded as a deliberate drop (DD-7 note) |
| F-13 | A-8 | warning | The proposal promised an Option B probe row; "needs Archify reinstalled" is unchecked | Fix: row P-13 cites `grep -o "flow-len"` → 17, all `var(--flow-len, 0px)`; the reinstall clause is dropped |
| F-14 | B-7 | info | "T6 visual review" was read as a task | Not a defect: T6 is the Multimodal model tier. Fix: worded "tier-T6" |

Counts: 1 confirmed severe (F-1); 2 single-judge severe (F-2, F-3), both confirmed by the architect's re-run; 0 contradictions; 11 warnings, suggestions or info.

## Reversion challenge (Step 2.3), both judges

- **DD-6** (README `<img src>`, PNG → animated SVG). The breakage: any viewer that fails on the SVG and drops `<picture>` shows a broken image, because the PNG was the universal default (P-7, P-11). Views on branches other than `master` show a broken image until `master` has the asset (R-4). Five test pins move.
- **DD-7** (`docs/flow.md`, static → animated SVG). The breakage: reduced-motion readers there rely only on the in-SVG rule, which is unproven in Firefox and Safari. No doc embeds the static SVG any more. There is a WCAG 2.2.2 exposure (F-11).

## Status

Round 1 closed with the findings above. The user chose **Fix and re-judge** and **3 cycles, then rest** (2026-10-27). F-1..F-14 were applied.

## Round 2: scoped re-judgment (fix delta only)

| Judge | Fixes applied | New findings | Verdict |
|---|---|---|---|
| A | F-1..F-14 all applied; timeline arithmetic checked (last motion 25.4–26.4 s) | RA-1 (P-12 frame counts need `-fuzz 2%`, same-page baseline 1,167 px), RA-2 (FR-1 frame-pair clause unreliable after the gaps or the rest), RA-3 (3-iteration rest unprobed): all warnings | approve |
| B | F-1..F-14 all applied; arithmetic correct | RB-1 = RA-1; RB-2 (the 7.9 s WebKit 0 sits inside the spike's pulse, so fuzz may hide it); RB-3 = RA-3; RB-4 = RA-2; RB-5 (class wording); RB-6 (this file stale): warnings and suggestions | approve |

All round-2 warnings were applied as info edits, not as a fix round. P-12 states the fuzz, the same-page baseline and the RB-2 caveat. New row P-14 (`UNVERIFIED`, owner T2) covers the 3-iteration rest. FR-1's frame clause is scoped to the first 25 s and to two different slots. The §7 isolation wording is fixed.

Counts: 1 confirmed severe (F-1), 2 suspect severe confirmed by the architect's re-run (F-2, F-3), 0 contradictions, fixes applied in round 1, re-judgment clean on severity.

JUDGMENT: APPROVED ✅
