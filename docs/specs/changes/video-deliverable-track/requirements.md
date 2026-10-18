# Requirements: Video Deliverable Track

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-deliverable-track` |
| Depth | Standard |
| Type | Change |
| Deliverable | software — this spec ships methodology text and one skill; it produces no video |
| Approval Mode | gated |
| Status | Draft — awaiting the specify gate |
| Date | 2026-10-18 |
| Proposal | `proposal.md` — approved 2026-10-18 by Juan Carlos Cadavid (Option B; bridge name must not start with `hyperframes-`; `HYPERFRAMES_NO_TELEMETRY=1`) |
| Phase gates | Phase 1 and Phase 2 pauses folded into one specify gate at the user's up-front instruction (2026-10-18: "specify y execute, cada uno con su aprobación"); `judgment-day` offered at that gate |
| Format source | No `docs/specs/general-setup/` in this repo — shape mirrors `archive/2026-08-10-changes--ai-agent-development-skill` |

## 2. Executive Summary

Teach AKILI that some changes deliver a **rendered video**, not software. `/akili-propose` records a new
`Deliverable: software | video` field next to `Type`; when it reads `video`, specify, the execute
Leader, test and validate each take one stated video branch, all driven by a new AKILI-authored
`conditional` skill, **`video-production`**, which loads the environment-provided HyperFrames skills
when they are installed and stops with an install hint when they are not. Nothing from HyperFrames is
copied into the package.

## 3. Glossary

| Term | Meaning |
|---|---|
| Deliverable | The kind of artifact a spec produces: `software` (default — code, config, docs) or `video` (a rendered video file or a HyperFrames composition rendered to one) |
| Video Mode | The specify branch taken when `Deliverable: video` — analogous to Bug Mode, orthogonal to it |
| Bridge skill | `video-production`: AKILI-authored, `conditional`; maps HyperFrames' production loop onto AKILI phases; contains no HyperFrames text |
| Environment-provided skill | A skill installed by a tool, referenced but never vendored (`docs/skills/governance.md`) |
| Render evidence | The proof set for a video: `hyperframes check` result, timed snapshots, `ffprobe` metadata, output file, final look |
| Final look | Human HITL or T6 Multimodal review of decoded frames against each acceptance criterion |
| Availability gate | The check that HyperFrames skills are installed before any video work starts |

## 4. System Context & Scope

Today (verified at `4a6ac65`, see `design.md` §11 Premise Ledger):

- `Type` is written by `/akili-propose` and read downstream only by `/akili-specify` Bug Mode (P-1).
- Specify wires conditional skills with one line per domain; execute reaches them through the Leader's
  skill rule in `.claude/templates/leader.md` (P-3).
- Governance already names `hyperframes` an environment-provided skill and forbids vendoring it; its
  rule 2 and two restatements say every command must work without such a skill (P-2, P-6).

**In scope:** the `Deliverable` field; Video Mode branches in propose, specify, the Leader rule, test and
validate; the `video-production` skill; the governance amendment and its restatements; docs, CHANGELOG
and the install-count fixtures.
**Out of scope:** any new command; installer logic; vendoring HyperFrames; other deliverable kinds
(decks, documents); cloud/Lambda/Cloud Run rendering; push, release, publish.

## 5. Stakeholders / Personas

| Persona | Interest |
|---|---|
| AKILI user making a video (explainer, demo, launch, captions) | The flow plans, builds and verifies a video, not a codebase |
| AKILI user making software | Zero change in behaviour or text paths for `Deliverable: software` |
| Teammate without HyperFrames | A clear stop and install hint, never a half-built video |
| Maintainer | Governance stays coherent; HyperFrames upgrades need no AKILI release |

## 6. Functional Requirements

### FR-1: Deliverable is detected and recorded at propose

`/akili-propose` SHALL record `Deliverable: software | video` in Document Control beside `Type`,
inferring it from the **requested deliverable**, not from a word mentioned in passing; ambiguity is
resolved inside the single classification question the command already allows.

#### Scenario: Video request

- GIVEN a request "make a 30-second launch video for our dashboard"
- WHEN `/akili-propose` classifies it
- THEN Document Control records `Type: Change` and `Deliverable: video`
- AND the Next Step names `/akili-specify <path>` (Video Mode applies there)

#### Scenario: Software request that mentions video

- GIVEN a request "fix the video player component in our React app"
- WHEN it is classified
- THEN `Deliverable: software` is recorded
- BUT it must NOT be classified `video` because the word appears

#### Scenario: Orthogonal to Type

- GIVEN a request "the rendered promo cuts the last second"
- WHEN it is classified
- THEN `Type: Bug` and `Deliverable: video` are both recorded
- AND IT MUST still ask at most one classification question in total

#### Scenario: Default

- GIVEN a proposal written before this change, or one with no `Deliverable` row
- WHEN any downstream command reads it
- THEN it is treated as `Deliverable: software`

### FR-2: Specify Video Mode

When `Deliverable: video`, `/akili-specify` SHALL load `video-production` and write requirements whose
acceptance criteria cover, testably: container/codec, resolution and aspect, fps, target duration with a
tolerance, the message (audience + message sentence), the beat list, captions (yes/no, language),
audio (voice-over / music / none), brand source, and delivery quality.

#### Scenario: Acceptance criteria present

- GIVEN a `Deliverable: video` proposal
- WHEN specify writes `requirements.md`
- THEN each listed criterion is stated with a measurable value or an explicit `n/a — <reason>`
- AND the defect-class table maps each video defect class (FR-6) to its gate

#### Scenario: Bug Mode on a video

- GIVEN `Type: Bug` and `Deliverable: video`
- WHEN specify plans the regression test
- THEN the regression is a frame or metadata check at the failing timestamp (snapshot or `ffprobe`) that is red before the fix and green after
- BUT it must NOT be replaced by a unit test of composition source alone

### FR-3: Execute uses the HyperFrames skills through the Leader

The `/akili-execute` Leader SHALL assign `video-production` to every task of a `Deliverable: video`
spec; `video-production` SHALL route to the HyperFrames router skill `hyperframes` and its domain
skills when they are installed.

#### Scenario: Skills assigned

- GIVEN a video spec task
- WHEN the Leader selects skills
- THEN `video-production` is assigned and the Implementer loads `hyperframes` first, per the bridge
- AND IT MUST record a deviation in `execution.md` if it assigns otherwise (existing Leader rule)

#### Scenario: Render is approval-gated and quiet-tree

- GIVEN a composition passes `hyperframes check`
- WHEN a delivery render is due
- THEN it happens only after the user approves the final look
- BUT it must NOT run while a delegated agent is active (AGENTS.md Concurrency rule — render is a measurement command)

### FR-4: Availability gate

`video-production` SHALL check, before any video work, that the HyperFrames skills are installed for
the host, and SHALL stop with the host-specific install hint when they are not.

#### Scenario: Not installed

- GIVEN a host with no `hyperframes` skill installed
- WHEN a video task starts
- THEN the agent stops and prints the install route for that host (plugin or `npx skills add heygen-com/hyperframes`)
- BUT it must NOT hand-write a video pipeline, vendor a copy, or install anything without consent

#### Scenario: Software unaffected

- GIVEN `Deliverable: software`
- WHEN any AKILI command runs without HyperFrames installed
- THEN it behaves exactly as before this change

### FR-5: Privacy and outward-action defaults

`video-production` SHALL set `HYPERFRAMES_NO_TELEMETRY=1` for every HyperFrames command unless the user
opts in, and SHALL treat `feedback`, `--file-issue`, `publish`, and `cloud` / `lambda` / `cloudrun`
renders as outward-facing actions that need explicit user consent each time.

#### Scenario: Default render

- GIVEN no telemetry opt-in recorded
- WHEN the agent runs a HyperFrames command
- THEN telemetry is disabled for that command
- AND a post-render feedback report is NOT sent

### FR-6: Test collects render evidence

When `Deliverable: video`, `/akili-test` SHALL plan a **render-evidence** suite in place of unit/E2E for
video tasks, collecting: `hyperframes check` exit status, snapshot stills at each beat time, `ffprobe`
format/stream metadata compared with the declared duration (and fps when specified), and a non-empty
output file.

#### Scenario: Duration drift

- GIVEN a composition declaring 30 s with a 0.5 s tolerance
- WHEN `ffprobe` reports 28.9 s
- THEN the suite reports FAIL citing both values
- BUT it must NOT pass because `check` exited 0

#### Scenario: HyperFrames missing at test time

- GIVEN the render-evidence suite has no HyperFrames install
- WHEN `/akili-test` plans suites
- THEN it treats the gap like missing test infrastructure — STOP and tell the user — not an improvised test

### FR-7: Validate ends in a final look

When `Deliverable: video`, `/akili-validate` SHALL use `hyperframes check` as the build-integrity gate and
SHALL require a final look (HITL or T6 Multimodal) of decoded frames against every acceptance criterion
before PASS.

#### Scenario: Plausible but wrong

- GIVEN every automated video gate is green
- WHEN a beat shows the wrong product screen
- THEN only the final look can catch it, and validate MUST NOT report PASS without it

### FR-8: Bridge skill passes governance

The package SHALL ship `.claude/skills/video-production/` as an original-authorship skill
(`author: Juan Carlos Cadavid — jcadavid.com`, `binding: conditional`, `license: MIT`) crediting
HyperFrames by HeyGen (Apache-2.0) in `inspired-by`, and SHALL pass all five governance checklist items.

#### Scenario: No third-party text

- GIVEN the packaged skill
- WHEN compared with the upstream repo at `01adadb9`
- THEN no upstream file or passage is copied
- BUT it must NOT be named `hyperframes-*` or present itself as a HeyGen product

### FR-9: Governance stays coherent

`docs/skills/governance.md` SHALL state when a command may name an environment-provided skill (only
behind a recorded `Deliverable` selector and the availability gate), and every restatement of "every
command works without it" SHALL be reconciled with the video stop.

#### Scenario: Restatements agree

- GIVEN the amended governance text
- WHEN the phrase family ("work without it", "run every command", "every command works without them") is grepped over governance, the constitution and README
- THEN each hit states the same rule: commands still run; only a spec whose `Deliverable` selects the skill stops at the availability gate

### FR-10: Docs, CHANGELOG, fixtures

The change SHALL add `docs/skills/video-production.md`, a truthful `docs/skills/README.md` row, the README
and `AGENTS.md` skill mentions, a `docs/flow.md` note, a `CHANGELOG.md` Unreleased entry, and SHALL update
the install-count fixtures to the measured new counts.

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Software path untouched:** every added sentence in a command or persona is conditional on `Deliverable: video` |
| NFR-2 | **Freshness:** AKILI text names only HyperFrames commands verified at `01adadb9` (`check`, `snapshot`, `render`, `preview`, `skills`) plus `ffprobe`; anything else defers to the installed `hyperframes-cli` skill |
| NFR-3 | **Size:** bridge skill ≤ 3 files and ≤ 20 KB |
| NFR-4 | **Host-agnostic:** install hints cover Claude Code, OpenCode, Codex, Cursor, Antigravity |
| NFR-5 | **Verification:** `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass |

## 8. Defect Classes and Gates

| Defect class this spec can produce | Gate |
|---|---|
| Dropped obligation — an FR clause never ships (KZ-changes--gate-falsifiability-2) | Reviewer term-by-term walk of each FR clause against the diff |
| Superseded phrasing survives (KZ-changes--kaizen-loop-closure-2) | Phrase-family grep over all in-scope files before review (FR-9) |
| Software path altered (NFR-1) | Diff review: every added command/persona line sits under a `Deliverable: video` condition |
| Count fixtures break | `npm test` |
| Package carries unintended files | `npm run pack:dry-run` — only `video-production/` added under `.claude/skills` |
| Frontmatter non-compliant | Walk against the governance schema (original-authorship variant) |
| Stale or invented HyperFrames claim (KZ-changes--cursor-install-target-1) | Raw check of each named command/env var against the clone at `01adadb9` |
| Overstated CHANGELOG/doc claim (KZ-002) | Quote-check each clause at HEAD before review |
| Prompt behaviour (detection, gates) wrong in practice | **No automated check** — substitute: walkthrough with held-out cases (T3) and the live smoke run (T10) |
| HyperFrames render pipeline fails on a real host | Live smoke run (T10); accepted risk on hosts not exercised (only Claude Code on macOS is run) |

## 9. Requirement ID Index

| ID | Title |
|---|---|
| FR-1 | Deliverable detected and recorded |
| FR-2 | Specify Video Mode |
| FR-3 | Execute uses HyperFrames via the Leader |
| FR-4 | Availability gate |
| FR-5 | Privacy and outward-action defaults |
| FR-6 | Test collects render evidence |
| FR-7 | Validate ends in a final look |
| FR-8 | Bridge skill passes governance |
| FR-9 | Governance stays coherent |
| FR-10 | Docs, CHANGELOG, fixtures |
| NFR-1…5 | §7 |
