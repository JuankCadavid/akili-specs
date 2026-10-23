---
name: video-production
description: "Trigger: video, motion video, explainer, product video, social clip, render to mp4, HyperFrames composition, Deliverable: video. Bridge between AKILI-SPECS phases and the installed HyperFrames skills: availability gate, phase map, privacy and render rules; defers every HyperFrames detail to the installed skills."
license: MIT
metadata:
  author: Juan Carlos Cadavid — jcadavid.com
  inspired-by: "HyperFrames by HeyGen (Apache-2.0) — https://github.com/heygen-com/hyperframes"
  binding: conditional
  version: "1.0"
---

# Video Production — AKILI Bridge

Use this skill when a spec's `Deliverable` is `video`. It decides **where each video activity lives in the AKILI flow and what may run when**. It teaches no composition syntax: HyperFrames' own installed skills own that, and they are always read first.

## Step 0 — Availability gate (before any video work)

The gate passes when the router skill is loadable under either name: `hyperframes` (standalone install) or a plugin-namespaced router such as `/hyperframes:hyperframes`.

| Result | Action |
|---|---|
| Router found | Load it first; it picks the workflow and points to its domain skills. If the project has `skills-lock.json`, list the skills it lists that are not installed under the host's project skill directory, and the installed skills it does not list; report both as a warning and record it in `execution.md`. Never pass silently on the router alone when a lock file exists. Continue |
| Router missing | **STOP.** Print the install routes below and wait. Do not hand-write a video pipeline, do not copy HyperFrames text into the repo, do not install anything without the user's consent |

Install routes (print all; the user picks):

| Route | Command / action |
|---|---|
| Host plugin | the host's HyperFrames plugin (namespaced router afterwards) |
| Core set, non-interactive (the route for agents) | From the project root, **without `-g`** (project-scoped), with `<id>` from the host table: `npx skills add heygen-com/hyperframes --yes --agent <id> --skill hyperframes --skill hyperframes-cli --skill hyperframes-registry --skill media-use` (the eager core set, per the installed `hyperframes` skill's skill-lifecycle reference). Other skills are installed on demand by name |
| Interactive picker | `npx skills add heygen-com/hyperframes` — pick the core group, choose project scope |
| Global install (consent-gated) | `npx hyperframes skills update` always installs **globally**: it writes the user's home skill directories and mirrors into other agents' global directories. Run only with the user's explicit consent |

Project-scoped skill directories by host (never suggest a global directory, except the consent-gated global route above):

| Host | `--agent` id | Directory |
|---|---|---|
| Claude Code | `claude-code` | `.claude/skills` |
| OpenCode | `opencode` | `.agents/skills` |
| Codex | `codex` | `.agents/skills` |
| Cursor | `cursor` | `.agents/skills` |
| Antigravity | `antigravity` | `.agents/skills` |

A project `## Skill Map` row for `hyperframes` stays a per-developer availability note; this skill still owns the AKILI phase mapping.

## Phase map

| HyperFrames activity | AKILI owner | Rule |
|---|---|---|
| Intent interview, brief | `/akili-propose` + `requirements.md` | The brief is generated from approved requirements; do not re-run the interview |
| Storyboard plan | `/akili-specify` design gate | The beat table in `design.md` is the storyboard; its approval is the storyboard approval |
| Optional sketch board | First execute task | Confirmation recorded in `execution.md` |
| `check`, then `snapshot` | Each execute task's verification | Contract in `references/render-evidence.md` |
| Draft render, then `ffprobe` | `/akili-test` | Evidence only, never the deliverable |
| Final look, then delivery render | `/akili-validate` | Delivery render only after the final-look approval, unless Document Control records `Delivery: deferred`: then the final look is on the draft render, the deferral is recorded in the validation report, and no delivery render runs |
| `story.md` (films over about 15 s) | `/akili-propose` | The Deliverable Outline on the Change track, the Lite proposal's Intent on the Trivial track, the Bug Diagnosis's expected behavior on the Bug track; then `requirements.md`. The storyline pick is that proposal's approval; no second approval |
| `SPEC.md` | `design.md` (beat table and look) | Generated from the approved docs and stored at the composition root; regenerated, never approved on its own. A review that changes the film changes `design.md` first: a beat change is a Pivot, a look change is an Adjust at the next gate |
| `snapshot --review` and its `REVIEW.md` | Each execute task's verification | Run as `snapshot --review --describe false --output <spec>/evidence/review/<task>/` with `REVIEW.md` copied there; it creates no approval of its own |

Requirements criteria for a video are in `references/acceptance-criteria.md`.

## Commands this skill instructs

Only these. Everything else (flags, scaffolding, catalog, audio, captions, registry) is read from the installed skills, never recalled from here.

| Command | Use |
|---|---|
| `npx hyperframes check` | Build-integrity gate; runs lint first |
| `npx hyperframes snapshot --at <t1>,<t2> --describe false --output <spec>/evidence/stills/<task>-<label>/` | Stills at the beat times; one output folder per run, because each run clears its folder |
| `npx hyperframes snapshot --review --describe false --output <spec>/evidence/review/<task>/` | Review board for a film, with its `REVIEW.md` |
| `npx hyperframes render --quality draft --output <spec>/evidence/<name>.mp4` | Draft render for evidence |
| `npx hyperframes render --quality delivery --output <spec>/evidence/<name>.mp4` | Delivery render, after final-look approval only; not run when `Delivery: deferred` |
| `npx hyperframes preview` | Studio preview for the user's review |
| `npx hyperframes skills check` | Reads only the user's global skills directory; it never certifies a project install. Check a project install against its `skills-lock.json`, or reinstall with the project-scoped route; `skills update` is the consent-gated global route above |
| `ffprobe -v error -show_format -show_streams <file>` | Output metadata |

## Privacy and outward actions

1. Prefix every HyperFrames command with `HYPERFRAMES_NO_TELEMETRY=1` unless the user has opted in to telemetry for this project; the `skills` commands are included. Also prefix `check`, `snapshot`, `render`, `preview` and `init` with `HYPERFRAMES_SKIP_SKILLS=1`: without it `init` checks GitHub and refreshes skills. Never put it on `skills update` or bare `skills`: the variable turns them into a silent exit 0 (the installed skill-lifecycle reference). `skills check` carries only the telemetry variable. Record the opt-in (or its absence) in `execution.md`.
2. **Consent rule.** These are outward-facing: `feedback` (including `--file-issue`), `publish`, the hosted or cloud renders `cloud`, `lambda`, `cloudrun`, and `snapshot --describe` (reported in #6138 to send frames to a third-party model when `GEMINI_API_KEY` is set). Each use needs the user's explicit consent **each time**; earlier consent does not carry over. Without it, do not run them. The installed HyperFrames skills may suggest a post-render report; under AKILI that suggestion is **off** unless the consent rule is satisfied. Every `snapshot` passes `--describe false` unless the user consents to describe for that use; consent for one snapshot does not cover the next.
3. Reports and logs written to the spec folder use relative paths; never paste home-directory paths or user names. Sanitize evidence before `git add` per `references/render-evidence.md` *Evidence files*.

## Render rules

| Rule | Detail |
|---|---|
| Draft vs delivery | Draft renders feed evidence at test time. The delivery render is the deliverable and waits for the final-look approval; with `Delivery: deferred` it is not run and the final look uses the draft |
| Check is not approval | A passing `check` never justifies a delivery render |
| Quiet tree | No render, draft or delivery, while a delegated agent is active: a render is a measurement and competes for the browser, ports and build output. Render in the window after the completion report. A running tool daemon also breaks the quiet tree (a HyperFrames warm-check process was observed in the source run): wait for it to exit or stop it, and record which in `execution.md` |
| Environment | Video work runs in a dedicated worktree (an Orca-managed one when Orca is present, else `git worktree`), one render at a time: a second render, draft or delivery, waits for the first |
| Fonts | Every font family a composition uses is self-hosted: `@font-face` pointing at a local file, "bundled" families included (#6137 reports they may be fetched from Google Fonts at compile time). "Local only" is evidenced by a cold-font-cache `check` per `references/render-evidence.md` item 7; a warm-cache `check` is not evidence |
| First render on a machine | Before the first render, draft or delivery, tell the user that HyperFrames may download its own headless browser (~200 MB) into `~/.cache/hyperframes`, keeps run state in `~/.hyperframes`, and that rendering needs network (CDN scripts, web fonts); render only after the user consents. These home writes are the tool's runtime caches, not a skill install: the project-scoped rule governs skills only |
| Local only | Renders run on this machine; hosted or remote rendering falls under the consent rule |

## Routing within a task

1. Run the availability gate.
2. Load the router; follow it to the domain skills the task touches (composition, animation, creative direction, media, captions, CLI).
3. Do the task; run `check` then `snapshot` before reporting.
4. Report evidence per `references/render-evidence.md`. A video task's PASS is never "the render finished".

## Deferral table

| Question | Owner (installed skill) |
|---|---|
| Which workflow, which skill next | `hyperframes` |
| Composition rules, motion, visual direction, storyboard format, captions | `hyperframes` (router) and its references |
| CLI flags, render options, troubleshooting | `hyperframes-cli` |
| Sourcing images, audio, voice, media treatments | `media-use` |
| Registry and catalog | `hyperframes-registry` |
| Anything not listed here | The router `hyperframes` decides |

If an installed skill contradicts this file on a HyperFrames fact, the installed skill wins; on an AKILI rule (gates, consent, quiet tree), this file wins. Known open upstream doc conflicts (#6136 clip window, #6139 multi-mount host id): follow the router's contract and record the choice in `execution.md`.

## Attribution

Original AKILI-SPECS skill; no HyperFrames text is included. HyperFrames is a separate project by HeyGen under Apache-2.0, installed by the user, and referenced here by name only. This skill is not a HeyGen product.
