# Proposal: Video Deliverable Track (HyperFrames)

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-deliverable-track` |
| Slug | `video-deliverable-track` — derived from free-text argument (HyperFrames skill request; core intent: "a video request is a video deliverable, not software") |
| Type | Change |
| Approval Mode | gated |
| Requested by | Juan Carlos Cadavid, 2026-10-18 |
| Depends on | none |
| Parallel-safe | yes — touches command prompts, one persona template, governance docs and one new skill; no installer code path, no `bin/routing.js`, no persona section hashes beyond the one template edit |
| Branch / worktree | `JuankCadavid/skill-hyperframes` (this worktree only); local commits only — no push, release or publish in this cycle |
| Upstream examined | `heygen-com/hyperframes` @ `01adadb9` (2026-10-18), shallow clone, LFS smudge disabled |

## 1. Intent

When someone runs `/akili-propose` to make a **video**, the methodology should recognise that the
deliverable is a rendered video file, not software — and carry that through `/akili-specify`,
`/akili-execute`, `/akili-test` and `/akili-validate`, using the HyperFrames skill family to do the
production work and HyperFrames' own verification tools as the evidence.

**Answer up front:** do this **without vendoring HyperFrames**. Add a `Deliverable: software | video`
field beside `Type`, ship one thin AKILI-authored bridge skill that maps HyperFrames' production loop
onto the AKILI phases, and reference the HyperFrames skills as environment-provided — which is what
the package's own governance already requires.

## 2. Problem / Current Behavior

| # | Today | Evidence |
|---|---|---|
| P1 | `/akili-propose` classifies only by **risk track** — Bug / Change / Trivial. There is no notion of *what kind of artifact* the work produces. | `.claude/commands/akili-propose.md` Step 1 table (cited as read 2026-10-18) |
| P2 | `Type` is consumed downstream only by `/akili-specify` (Bug Mode). `/akili-execute`, `/akili-test` and `/akili-validate` never read it, although propose says specify **and** execute inherit it. | Explore report: `akili-specify.md:54`, `:431`, `:489`; no `Type` read in execute/test/validate — `UNVERIFIED — confirm at source before relying on it` (subagent grep, not re-run by the author) |
| P3 | Test and validate assume a software deliverable: suite types are backend unit / frontend unit / integration / E2E; validate runs build / type-check / lint and API + design-token conformance. A video has none of those. | Explore report: `akili-test.md:107,151-155`; `akili-validate.md:83-89,117-125` — `UNVERIFIED — confirm at source before relying on it` |
| P4 | The only existing hook for rendered output is specify's defect-class rule: rendered/visual output needs a human HITL check or a T6 Multimodal review because no automated checker sees it. | `.claude/commands/akili-specify.md` "Name the defect classes…" paragraph (cited as read 2026-10-18) |
| P5 | HyperFrames is already named in governance as an **environment-provided** skill family: "Never copy one into `.claude/skills/`"; "Availability is per-developer, not per-project"; "Attribution stays with the author… the acceptance checklist below applies only to skills we ship." | `docs/skills/governance.md` *Environment-provided skills* block (cited as read 2026-10-18) |
| P6 | A previous request to bundle `orchestration`, `playwright-cli` and `hyperframes` into the package was **declined** under that rule; HyperFrames' only mechanism today is an optional Skill Map row `/akili-constitution` Step 8D offers "when the project's work includes producing explainer, demo, or launch-video content". | `CHANGELOG.md` `akili doctor now surfaces playwright-cli…` entry; `.claude/commands/akili-constitution.md` Step 8D item 3 (both cited as read 2026-10-18) |
| P7 | Net effect: a video request today falls into the Change track, specify writes software-shaped requirements, and the Leader has no rule that routes it to `hyperframes` (the leader skill-decision rule names UI, animation and `tdd` only). | `.claude/templates/leader.md:25` (cited as read 2026-10-18) |

## 3. Proposed Outcome

1. `/akili-propose` detects a video deliverable from the request ("make a video / promo / explainer /
   captions / motion graphic / render an MP4") and records `Deliverable: video` in Document Control,
   independent of `Type` (a new video is a Change; a broken render is a Bug; a typo in an on-screen
   title can still be Trivial).
2. `/akili-specify` in **Video Mode** writes video acceptance criteria (format, duration, fps,
   aspect, message/beats, captions, audio, brand) and plans production tasks around the HyperFrames
   artifacts instead of code modules.
3. `/akili-execute`'s Leader assigns the HyperFrames skills (router `hyperframes` first, then the
   domain skills) and the bridge skill; the render is gated by user approval.
4. `/akili-test` and `/akili-validate` collect **render evidence** — `hyperframes check`, timed
   snapshots, `ffprobe` metadata vs. the composition's declared duration, decoded-frame inspection —
   and validate ends with a human / T6 multimodal final look.
5. Teammates without HyperFrames installed get a clear install hint and a stop, never a silent
   fallback to hand-written video code.

## 4. Scope

| In | Out |
|---|---|
| `Deliverable` field: detection signals + Document Control row in `/akili-propose` | Any new command (governance: no per-type command) |
| Video Mode sections in `/akili-specify`, `/akili-execute` (via `leader.md` skill rule), `/akili-test`, `/akili-validate` | Vendoring any HyperFrames skill, asset, font or script |
| One new AKILI-authored bridge skill (working name `video-production`, binding `conditional`) with progressive-disclosure `references/` | Changing the installer copy logic or host target dirs |
| Governance amendment: how an environment-provided skill may be named in command text when a recorded `Deliverable` selects it | Rendering infrastructure (Lambda / Cloud Run / HeyGen cloud) |
| `docs/skills/<bridge>.md`, `docs/skills/README.md` row, `docs/flow.md` note, README mention, CHANGELOG `Unreleased` entry | Push, release, npm publish (explicitly excluded this cycle) |
| Test count fixtures that the new skill moves (`test/install-cursor.test.js` `SKILL_FILE_COUNT`/skill-dir counts) | Other deliverable kinds (slide decks, documents) — the field is designed to admit them later, none added now |

## 5. Non-Goals

- Not a fork, mirror or adaptation of HyperFrames content; AKILI ships no third-party text from it.
- Not a replacement for HyperFrames' own intent interview, storyboard and review loop — AKILI maps
  onto them and avoids double-gating; it does not re-implement them.
- Not a 4th `Type`. Risk track and deliverable kind are orthogonal and stay separate fields.
- Not bundling the upstream repo-internal skills under `.claude/skills/` (`captions-overlay`,
  `changelog-video`, `motion-doctrine`, `cut-the-curve`, `seam-craft`, `oversized-cursor`) — see §12 R3.

## 6. Affected Users, Systems, And Specs

| Area | Impact |
|---|---|
| `.claude/commands/akili-propose.md` | Step 1: deliverable detection + Document Control row; Step 2 structure unchanged except a Video note in Requirement Delta Preview |
| `.claude/commands/akili-specify.md` | Video Mode: acceptance-criteria shape, defect classes for rendered output, task shapes, Bug Mode regression = frame/metadata regression |
| `.claude/commands/akili-execute.md` + `.claude/templates/leader.md` | Skill rule "video → `hyperframes` + bridge"; render as an approval-gated step; render is a *measurement* command under the Concurrency rule (never while a delegated agent is active) |
| `.claude/commands/akili-test.md` / `akili-validate.md` | Render-evidence suite replaces unit/E2E for video tasks; final look via HITL or T6 Multimodal |
| `.claude/skills/<bridge>/` (new) | AKILI-authored; `metadata.binding: conditional` |
| `docs/skills/governance.md`, `docs/skills/README.md`, `docs/flow.md`, `README.md`, `CHANGELOG.md` | Docs + attribution |
| `.claude/templates/digests.json` / persona drift | `leader.md` section edit changes its section hash → `doctor --agents` sees deployed copies as outdated after release; handled by the normal release flow, not this cycle |
| Users | AKILI users producing explainer, demo, launch or captioned videos; all 5 hosts |

## 7. Visual Reference

- Source: None
- Location: n/a
- Notes: methodology/prompt change with no UI surface. The *video deliverable* a user later produces
  gets its visual reference from HyperFrames' own artifacts (`frame.md` / `design.md`,
  `STORYBOARD.md`, `boards/storyboard.html`), which the bridge skill maps into the proposal's Visual
  Reference section.

## 8. Requirement Delta Preview

### ADDED Requirements

- **Deliverable detection.** Propose records `Deliverable: software | video` (default `software`);
  ambiguous wording gets one question, folded into the existing type question.
- **Video acceptance criteria (specify).** Each video spec states, testably: output container/codec,
  resolution + aspect, fps, target duration ± tolerance, the message ("This video tells [audience]
  that [message]" — HyperFrames' own story-spine shape), beat list, captions yes/no + language,
  audio (VO / BGM / none), brand source, and delivery quality (`draft` / `looks` / `delivery`).
- **Video defect classes (specify).** At least: composition invalid (lint/runtime), layout/contrast
  findings, mount defects in sub-compositions, timing drift (rendered duration ≠ declared
  `data-duration`), wrong frame content at a beat, caption/audio sync, and *plausible-but-wrong*
  visuals that only a human/multimodal look catches — each mapped to the command that catches it.
- **Render evidence contract (test).** `npx hyperframes check` exit 0 (`--strict` when the spec says
  so), `snapshot --at <beat times>` stills kept under the spec, `ffprobe -show_format -show_streams`
  compared with the declared duration/fps, and the output file present and non-empty.
- **Final look (validate).** Human HITL or T6 Multimodal review of decoded frames against each
  acceptance criterion; render to `delivery` quality only after that approval.
- **Availability gate.** If `hyperframes` is not installed on the host, stop with the install hint
  (`npx skills add heygen-com/hyperframes` / the host plugin), never improvise.
- **Privacy defaults.** The bridge instructs `HYPERFRAMES_NO_TELEMETRY=1` unless the user opts in,
  and treats `feedback`, `--file-issue`, `publish` and any `cloud`/`lambda`/`cloudrun` render as
  outward-facing actions that need explicit user consent.

### MODIFIED Requirements

- Leader skill-decision rule gains "video deliverable → `hyperframes` + bridge".
- Bug Mode's mandatory regression test, for a video, becomes a frame/metadata regression: a snapshot
  or `ffprobe` check at the failing timestamp that is red before the fix and green after.
- Governance *Environment-provided skills*: add the rule for referencing one from command text when
  a recorded `Deliverable` selects it (availability-checked, never assumed).

### REMOVED Requirements

- None.

## 9. Upstream Analysis (HyperFrames)

### 9.1 What it is

| Fact | Value | Source (as read) |
|---|---|---|
| Purpose | Render HTML/CSS + seekable animation to deterministic MP4 (headless Chrome + FFmpeg) | upstream `README.md` |
| License | Apache-2.0; **no NOTICE file** in the repo | `LICENSE` header; `find -iname 'NOTICE*'` → 0 |
| CLI | `@hyperframes/cli` 0.8.171, `engines.node >=22`; FFmpeg required; Chrome via `@puppeteer/browsers` | `packages/cli/package.json` |
| Churn | Pre-1.0, PR #5845 on the examined day | `git log -1` |
| Published skills | 21 under `skills/` (core set: `hyperframes`, `hyperframes-*`, `media-use`; workflows lazily installed) | `skills-manifest.json`, `skill-lifecycle.md` |
| Size | `skills/` ≈ 18 MB (largest: `music-to-video` 6.4 MB, `embedded-captions` 3.7 MB) | `du` |
| Repo-internal skills | 6 under `.claude/skills/` + `.agents/skills/`, all `metadata.internal: true`, "NOT part of the marketplace-distributed plugin" | upstream `.claude/skills/README.md` |

### 9.2 Names in the request vs. upstream today

| Requested | Upstream @ `01adadb9` |
|---|---|
| `hyperframes`, `hyperframes-animation`, `hyperframes-cli`, `hyperframes-core`, `hyperframes-creative` | present |
| `hyperframes-media` | **absent** — media is now `media-use` (the copy installed locally in June still says `hyperframes-media`) |
| `captions-overlay` | repo-internal, house doctrine layered on `embedded-captions`; not published |
| also exist | `hyperframes-audio`, `-keyframes`, `-registry`, `-studio`, `figma`, 10 workflow skills |

The rename is direct evidence for governance rule 1: a copy vendored in June would now instruct
agents to load a skill that no longer exists.

### 9.3 How it installs on AKILI's 5 hosts

| Host | Upstream mechanism | Skills dir used by `npx skills add` (skills CLI 1.5.18) |
|---|---|---|
| Claude Code | `claude plugin install hyperframes@hyperframes` or standalone | `~/.claude/skills` |
| OpenCode | standalone skills | `~/.config/opencode/skills` |
| Codex | Codex plugin or standalone | `$CODEX_HOME/skills` (project `.agents/skills`) |
| Cursor | Cursor plugin or standalone | `~/.cursor/skills` (project `.agents/skills`) |
| Antigravity | standalone skills (Gemini CLI has an extension) | `~/.gemini/antigravity/skills` |

HyperFrames keeps itself current: `npx hyperframes skills update` refreshes the core set and
**prunes unpublished skills**, and plugin installs forbid running it. A vendored AKILI copy would
fight both mechanisms — and in the shared `~/.agents/skills` root used by AKILI's Codex/Cursor
targets it would collide by name (`akili install` skips existing dirs; `--force` would clobber the
user's HyperFrames copy).

### 9.4 Upstream's own process (what AKILI maps onto)

| HyperFrames artifact / gate | AKILI phase it maps to |
|---|---|
| Intent interview → `BRIEF.md` (the only routing artifact) | `/akili-propose` + requirements (the brief is generated from approved requirements, not re-interviewed) |
| `STORYBOARD.md` plan in chat (checkpoint gate) | `/akili-specify` design approval |
| Sketch board `boards/storyboard.html` (checkpoint gate) | specify design visual reference, or first execute task |
| `check` → `snapshot` → preview → **render only on approval** | execute + test evidence |
| `ffprobe` duration/fps vs. `data-duration`, decoded-frame inspection | test + validate |
| Final look in Studio preview | `/akili-validate` HITL / T6 |

### 9.5 Risks found in the upstream

| Risk | Detail | Mitigation in this proposal |
|---|---|---|
| Telemetry on by default | anonymous counters; skill attribution stamped on renders | bridge sets `HYPERFRAMES_NO_TELEMETRY=1` unless the user opts in |
| Public feedback channel | skills instruct sending a feedback report after renders; `--file-issue` publishes a repro publicly | treated as outward-facing → explicit consent only |
| Credential reads | `hyperframes usage --json` reads the harness login to report quota | disclosed in the bridge; optional, never required by AKILI |
| Third-party uploads | cloud render uploads to HeyGen (200 MB limit); TTS via HeyGen / ElevenLabs | consent-gated; local render is the default |
| Non-redistributable assets | upstream-internal `changelog-video` ships commercial fonts (TT Norms Pro, ABC Solar Display) and HeyGen house BGM/VO | not bundled (Non-Goals) |
| Trademarks | Apache-2.0 §6 grants no trademark rights | bridge is not named `hyperframes-*`; HyperFrames named only descriptively |
| Runtime floor | Node ≥ 22 (AKILI CLI supports ≥ 18), FFmpeg, Chrome | documented as a per-developer prerequisite of Video Mode only |

## 10. Approach Options

| | A — Vendor the skills | **B — Reference + bridge skill + `Deliverable` axis** (recommended) | C — Skill Map row + docs only |
|---|---|---|---|
| What ships | Copies of 6–21 upstream skills + Apache LICENSE/NOTICE text | One AKILI-authored skill (~3–4 short references), command/persona edits, governance amendment | Docs page; existing Step 8D row |
| Governance | **Violates** rule 1 and the prior declined request | Compliant; amends the environment-provided rule with one bounded clause | Compliant |
| Freshness | Stale on day one (`hyperframes-media` rename) | Upstream stays the source of truth | Same as B |
| Size | +18 MB (skills only) | ~tens of KB | 0 |
| Host collision | Yes, in `~/.agents/skills` | No | No |
| Meets the goal ("propose understands video; execute uses the skill") | Partly — still no deliverable axis | **Yes** | **No** — nothing in propose/specify/test/validate changes |
| Apache-2.0 obligations | Must carry LICENSE, mark modified files (§4b), keep notices | None triggered (nothing redistributed); attribution given as courtesy | None |

## 11. Recommended Approach

**Option B**, as the smallest path that meets the goal and keeps the governance rule intact.

1. **Classification:** keep `Type` (risk track) and add `Deliverable: software | video` (artifact
   kind). Detect from deliverable signals, not from a word mentioned in passing — the same rule
   HyperFrames' router uses ("match the requested deliverable"). Applying **KZ-004**, specify must
   enumerate every downstream branch that reads the new field (propose, specify, leader, test,
   validate, archive/audit) and state which branch a `video` spec lands in.
2. **Bridge skill** (working name `video-production`, `conditional`, AKILI-authored, `inspired-by`
   HyperFrames with link + Apache-2.0 attribution line): availability check + install hints per host;
   the phase map of §9.4; the acceptance-criteria template; the render-evidence contract; privacy
   defaults; the "render is a measurement command" concurrency note.
3. **Command wiring:** one conditional line per affected command ("if `Deliverable: video`, load the
   bridge; it loads `hyperframes` when present, otherwise stop with the install hint"), plus the
   `leader.md` skill rule.
4. **Governance amendment:** an environment-provided skill may be named in command text only behind
   a recorded `Deliverable` selector and an availability check, never as an unconditional load.
5. **Licensing:** no NOTICE file is needed — AKILI redistributes nothing, and upstream has no NOTICE
   to propagate. The bridge's frontmatter and `docs/skills/<bridge>.md` credit "HyperFrames by
   HeyGen, Apache-2.0" with the repo link; the README Origin column follows the same format.

Depth recommendation for `/akili-specify`: **Standard** (multi-command edit + one new skill + a
governance rule change; no installer code).

## 12. Risks, Dependencies, And Open Questions

### Risks

| ID | Risk | Mitigation |
|---|---|---|
| R1 | Restating HyperFrames flags in AKILI text recreates the staleness problem | Bridge names only stable concepts and the few commands its own skill marks as the gate (`check`, `snapshot`, `render`, `ffprobe`); everything else defers to the installed `hyperframes-cli` skill |
| R2 | Double HITL: AKILI gates + HyperFrames' plan/board/final-look gates | Phase map makes each HyperFrames gate *be* the AKILI gate; specify decides storyboard-in-design vs. first-task |
| R3 | User expectation that `captions-overlay` is installed by AKILI | It is HeyGen house doctrine marked internal and unpublished; the bridge points to the published `embedded-captions` workflow instead |
| R4 | `leader.md` edit drifts deployed personas | Expected; resolved by `doctor --agents --fix` after a future release |
| R5 | Rendered output passes every automated gate while wrong | Specify's existing defect-class rule + mandatory final look (HITL/T6) |
| R6 | CHANGELOG/doc overstatement (**KZ-002**, High, recurring) | Every aggregate claim quote-checked at HEAD before the Reviewer |
| R7 | Quoting upstream text from memory (**KZ-changes--cursor-install-target-1**) | Any upstream quotation in briefs raw-verified against the pinned commit `01adadb9` |
| R8 | Skill-count fixtures break (`SKILL_FILE_COUNT === 199`, 24 skill dirs in `test/install-cursor.test.js`) | Planned task; counts re-measured, not predicted (**KZ-changes--leader-brief-contract-2**) |

### Open Questions (for approval)

1. **Governance amendment** — OK to amend the *Environment-provided skills* rule as in §11.4, or do
   you want `hyperframes` kept strictly in the Skill Map (then the bridge alone carries the routing)?
2. **Bridge skill name** — `video-production` (recommended; neutral, no trademark use) or another?
3. **`akili doctor`** — add a non-blocking *Environment* probe for HyperFrames skills in each host's
   skills dir (scope +1 small installer task), or leave it out of this cycle (recommended: out)?
4. **Spec artifacts language** — proposal/spec documents in English to match the repo; conversation
   in Spanish. Confirm.

### Dependencies

- None on other specs. Runtime for *users* of Video Mode: Node ≥ 22, FFmpeg, HyperFrames skills
  installed on their host.

## 13. Success Criteria

- A video request run through `/akili-propose` yields `Type: Change` + `Deliverable: video`, and a
  software request is unaffected (`Deliverable: software`, all current text paths unchanged).
- Specify, Leader, test and validate each have exactly one stated branch for `Deliverable: video`,
  enumerated and checked (KZ-004).
- No HyperFrames file exists under `.claude/skills/`; `npm run pack:dry-run` shows only the AKILI
  bridge skill added.
- The bridge passes the governance acceptance checklist (need, binding, attribution, size, docs +
  CHANGELOG) and `docs/skills/README.md` shows a truthful row.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` all pass.
- With HyperFrames absent, the video path stops with an install hint; with it present, a smoke
  composition reaches `hyperframes check` exit 0 and a rendered MP4 whose `ffprobe` duration matches
  the declared one (manual validation evidence, recorded in `execution.md`).

## 14. Next Step

```text
/akili-specify changes/video-deliverable-track
```
