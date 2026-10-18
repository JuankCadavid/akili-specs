# Render Evidence

Load in `/akili-test` (render-evidence suite) and `/akili-validate`. Evidence lives under the spec folder; run the quiet-tree rule first (no delegated agent active).

## Evidence set (draft render)

| # | Item | How | Pass condition |
|---|---|---|---|
| 1 | Build integrity | `npx hyperframes check` | Exit status 0 |
| 2 | Beat stills | `npx hyperframes snapshot --at <beat times>` | One still per beat in the design's beat table |
| 3 | Draft render | `npx hyperframes render --quality draft --output <path>` | Exits 0 |
| 4 | Output present | `test -s <path>` | Non-empty file |
| 5 | Metadata | `ffprobe -v error -show_format -show_streams <path>` | Matches the requirement's resolution, fps (when specified), streams |
| 6 | Duration | see below | Both comparisons hold |

All HyperFrames commands carry `HYPERFRAMES_NO_TELEMETRY=1` (see `SKILL.md`).

## Duration comparison

Compare `format.duration` from `ffprobe` with **both**:

| Compared with | Catches |
|---|---|
| The requirement's target duration, within its stated tolerance | A composition built to the wrong length |
| The composition's root `data-duration` | A render defect (truncation, extra tail) |

Report FAIL citing both values and the tolerance if either comparison fails. A zero exit from `check` never offsets a duration failure.

## Missing install

If HyperFrames is not installed when the suite is planned, treat it as missing test infrastructure: STOP and tell the user (install routes in `SKILL.md`). Do not improvise a substitute test.

## Final look (validate)

1. Decode frames from the **draft render** at each beat time (and any timestamp a bug names).
2. A human (HITL), or a tier-T6 multimodal reviewer, compares each frame to every acceptance criterion and records the verdict per beat.
3. No PASS without it, even when every automated item is green.
4. Only after the approval, run the delivery render and re-run items 4-6 on its output.
5. `npx hyperframes preview` may be offered to the user to review the assembled timeline.

## Bug regression shape

Red before the fix and green after, at the failing timestamp: a snapshot at that time, or the `ffprobe` field that was wrong. Record the red output verbatim in `execution.md`.
