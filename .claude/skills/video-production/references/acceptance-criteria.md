# Video Acceptance Criteria

Load in `/akili-specify` Video Mode. Every row becomes a requirement with a **measurable value** or an explicit `n/a — <reason>`.

## Criteria template

| # | Criterion | Value to state | Checked by |
|---|---|---|---|
| 1 | Container and codec | e.g. container, video codec, audio codec | `ffprobe` streams |
| 2 | Resolution and aspect | width x height, aspect ratio | `ffprobe` stream |
| 3 | Frame rate | fps, or `n/a — <reason>` | `ffprobe` stream |
| 4 | Target duration and tolerance | seconds plus a tolerance in seconds | `ffprobe` `format.duration` |
| 5 | Message | one sentence naming audience and the message they should take away | Final look |
| 6 | Beat list | each beat: start time, on-screen content, intent | Snapshots + final look |
| 7 | Captions | yes/no; language | Snapshots + final look |
| 8 | Audio | voice-over, music, or none; level expectations if any | `ffprobe` streams + final look |
| 9 | Brand source | where colors, fonts, logo come from | Final look |
| 10 | Delivery quality | the quality setting for the delivery render | Delivery render command |

The beat list from row 6 is the storyboard: it lives in `design.md` and its approval is the storyboard approval.

## Defect class to gate

| Defect class | Gate |
|---|---|
| Composition does not pass static or runtime audit | `check` exit status |
| Duration differs from target or from the composition | Duration comparison in `references/render-evidence.md` |
| Wrong resolution, fps, codec, or missing stream | `ffprobe` metadata vs rows 1-3, 8 |
| Output file missing or empty | Non-empty file test |
| A beat shows the wrong content, or text/layout is broken in pixels | Snapshots at beat times, then final look |
| Captions missing, wrong language, unreadable | Snapshots + final look |
| Plausible but wrong overall | Final look only; nothing automated replaces it |

## Bug on a video

When `Type: Bug` and `Deliverable: video`, the regression test is a frame or metadata check **at the failing timestamp** (a snapshot at that time, or an `ffprobe` field), red before the fix and green after. A unit test of composition source alone does not qualify.
