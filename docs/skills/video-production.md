# `video-production`

## Purpose

AKILI-authored **bridge** between AKILI-SPECS phases and the HyperFrames skills installed in the developer's environment. It decides where each video activity lives in the AKILI flow and what may run when. It teaches no composition syntax: HyperFrames' own installed skills own that, and are always read first.

Original AKILI-SPECS skill by Juan Carlos Cadavid — jcadavid.com (MIT). Inspired by HyperFrames by HeyGen (Apache-2.0); no HyperFrames text is included, and the skill is not a HeyGen product.

## Use When

- A spec's Document Control records `Deliverable: video` (an absent row means software, and this skill never loads).
- The work is producing, changing, or repairing a rendered video or a composition that renders to one.

## Binding

`conditional` — loaded when the spec's `Deliverable` is `video`: `/akili-specify` (Video Mode) and `/akili-validate` load it, `/akili-test` plans its render evidence suite per it, and `/akili-specify` lists it on every task of such a spec. Specs without the selector, including every software spec, never reach it.

## What It Routes To

HyperFrames is **environment-provided**: the skill routes to the installed `hyperframes` router (standalone, or a plugin-namespaced router such as `/hyperframes:hyperframes`) and defers every HyperFrames detail to the installed skills. It is never copied into this repository. **AKILI does not install HyperFrames.**

## Availability Gate

Step 0 of the skill. If the router is missing, the skill **STOPs**, prints the install routes, and waits: no hand-written video pipeline, no copied HyperFrames text, no install without the user's consent.

| Route | Scope |
|---|---|
| Host plugin | The host's HyperFrames plugin |
| `npx skills add heygen-com/hyperframes --yes --skill …` (core set, non-interactive) | Project-scoped, run from the project root **without `-g`** |
| `npx skills add heygen-com/hyperframes` (interactive picker) | Pick the core group, choose project scope |
| `npx hyperframes skills update` | Always installs **globally**; run only with the user's explicit consent |

The exact `--skill` list is in the skill's `SKILL.md`.

## Privacy Defaults

- Every HyperFrames command is prefixed with `HYPERFRAMES_NO_TELEMETRY=1` unless the user opted in to telemetry for the project; the opt-in (or its absence) is recorded in `execution.md`.
- `feedback` (including `--file-issue`), `publish`, and the hosted or cloud renders `cloud`, `lambda`, `cloudrun` need the user's explicit consent **each time**.

## Draft vs Delivery Render

| Render | Owner | Role |
|---|---|---|
| Draft (`--quality draft`) | `/akili-test` | Evidence only, never the deliverable |
| Delivery (`--quality delivery`) | `/akili-validate` | The deliverable, run only after the final-look approval |

A passing `check` never justifies a delivery render. No render, draft or delivery, runs while a delegated agent is active.

## Best Paired Commands

- `/akili-propose` records `Deliverable: video` beside `Type`.
- `/akili-specify` Video Mode copies the row into `requirements.md` and writes the storyboard beat table into `design.md`.
- `/akili-test` plans the render evidence suite.
- `/akili-validate` requires the final look before PASS, then the delivery render.

## Source

- `../../.claude/skills/video-production/SKILL.md`
- `../../.claude/skills/video-production/references/acceptance-criteria.md`
- `../../.claude/skills/video-production/references/render-evidence.md`
