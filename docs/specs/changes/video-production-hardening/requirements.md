# Requirements: Video Production Hardening

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-production-hardening` |
| Depth | Standard |
| Type | Change |
| Deliverable | software — methodology text, one skill, `bin/routing.js`, `bin/akili.js`; no video is produced |
| Approval Mode | pre-approved (Juan Carlos Cadavid, 2026-10-23); exceptions still stop |
| Date | 2026-10-23 |
| Proposal | `proposal.md` (c14bdcd), auto-approved (pre-approved mode). Scope S1–S17, Option A |
| Format source | No `docs/specs/general-setup/` in this repo; the shape mirrors `archive/2026-10-18-changes--video-deliverable-track` |
| Phase 1 gate | auto-approved (pre-approved mode), 2026-10-23 |

## 2. Executive Summary

The first video run logged its friction in the source log the proposal cites. This spec turns each friction point into a stated rule, in the place an agent reads it:

| Area | What changes |
|---|---|
| `video-production` skill | Privacy, evidence, install, phase map, fonts, environment, motion defects |
| Commands | Five commands: deferred delivery, a video proposal outline, video test-report sections, a greenfield red exception, budget wording, an effort-ceiling rung, first-token argument parsing, pre-approved clarifications |
| `bin/routing.js` | Never binds a Tester to the Implementer's model |
| `bin/akili.js` | Learns `--version` |

## 3. Glossary

| Term | Meaning |
|---|---|
| Evidence folder | `docs/specs/<spec-path>/evidence/` — where every committed render/snapshot/log artifact of a video spec lives |
| Sanitize | Replace every absolute path (home directory, tool caches, temp dirs) in an evidence file with a relative path or a placeholder before it is committed |
| Delivery deferral | `Delivery: deferred` in Document Control: the cycle ends on draft evidence and the final look; the delivery render happens outside the cycle |
| Deliverable Outline | The proposal section for a video Change: beats, assets, constraints. It replaces the Requirement Delta Preview |
| Greenfield artifact | A file a task creates that does not exist when `/akili-specify` runs, so no baseline red can be observed then |
| Effort ceiling | The highest effort rung allowed on a tier: `xhigh` on T2 (`max` is barred on a cheaper tier, `.claude/templates/leader.md:27`) |
| First token | The leading run of non-whitespace characters of `$ARGUMENTS`, ended by a space, tab, or newline |
| Tool daemon | A process a tool leaves running after its command returns (e.g. HyperFrames' warm-check helper) |

## 4. System Context & Scope

Current behavior is cited in `proposal.md` §2 (P1–P21, citations as run at 8679e25); this document does not restate it. In scope: proposal S1–S17. Out of scope: proposal §5, plus the `$ARGUMENTS` interpolation in `akili-archive.md` (6 occurrences), `akili-seo.md` (2) and `akili-quick.md` (1). These counts come from `grep -c '\$ARGUMENTS' .claude/commands/*.md` at 8679e25. The owner's Quick 1 scope names specify, execute, test, validate and propose only, so those files are a recorded residual for a follow-up.

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Video-spec author (any host) | Rules that do not leak frames, paths, or home directories, and that let a cycle finish without a delivery render |
| Every AKILI user | Commands that accept a spec path plus a brief; a Tester that never shares the author's model; a defined step at the effort ceiling |
| `akili routing` user | Wrappers that satisfy author ≠ tester, with a visible report when a host cannot |
| CLI user | `akili --version` |

## 6. Functional Requirements

### FR-1: `snapshot --describe` is an outward action (S1)

The `video-production` consent rule SHALL name `snapshot --describe`. Every `snapshot` command the skill instructs SHALL carry `--describe false` unless the user consents to describe, per use.

#### Scenario: Default snapshot sends nothing

- GIVEN a video task at its verification step
- WHEN the skill's `snapshot` command is run as written
- THEN the command line carries `--describe false`
- BUT it must NOT omit the flag on any `snapshot` line the skill or its references instruct
- AND IT MUST name `snapshot --describe` on the consent-rule line, citing that it can send frames to a third-party model when `GEMINI_API_KEY` is set (heygen-com/hyperframes upstream issue cited, not restated)

#### Scenario: Consent is per use

- GIVEN the user consented to describe for one snapshot
- WHEN a later snapshot runs
- THEN it carries `--describe false` again
- BUT it must NOT treat earlier consent as carrying over

### FR-2: Evidence location, sanitizing and file type (S2, S12)

Every committed video evidence artifact SHALL live under the evidence folder, be written there by the command's own output flag, carry no absolute path, and use the `.txt` extension for captured logs.

#### Scenario: Output flag is mandatory

- GIVEN a `render` or `snapshot` command in the evidence set
- WHEN it is written into the skill or its references
- THEN it carries an output flag pointing under `<spec>/evidence/`
- BUT it must NOT rely on the tool's default (`renders/` in the project, `.hyperframes/artifacts/`)

#### Scenario: Sanitize before commit

- GIVEN a captured `check --json` report or compiler stderr that embeds absolute paths
- WHEN it is committed as evidence
- THEN every absolute path (the home directory, `~/.cache/...`, temp dirs) is replaced by a relative path or a placeholder
- AND IT MUST state the check that proves it: a grep for the home-directory prefix over the evidence folder returns no hit
- BUT it must NOT commit a file before that grep runs

#### Scenario: Logs are `.txt`

- GIVEN a render or check log saved as evidence
- WHEN it is written
- THEN its extension is `.txt`
- BUT it must NOT require a `.gitignore` change in the target project

#### Scenario: Skill refresh is disabled during evidence runs

- GIVEN any HyperFrames command run by the skill
- WHEN the skill names its environment prefix
- THEN it names `HYPERFRAMES_SKIP_SKILLS=1` beside `HYPERFRAMES_NO_TELEMETRY=1`, stating that without it `init`/`skills` commands may refresh skills from GitHub

### FR-3: Install route and availability gate (S3)

The install route SHALL name exactly the upstream eager core set (`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`). It SHALL carry `--agent <id>`, with each host-table row naming its agent id. The availability gate SHALL compare installed skills against `skills-lock.json` when the project has one.

#### Scenario: Route per host

- GIVEN the host table (Claude Code; OpenCode; Codex; Cursor; Antigravity)
- WHEN a user reads the non-interactive route
- THEN each host row names its `--agent` id (`claude-code`, `opencode`, `codex`, `cursor`, `antigravity`)
- AND the route stays project-scoped
- BUT it must NOT carry `-g`/`--global`

#### Scenario: Lock mismatch is reported, not silently passed

- GIVEN a project with `skills-lock.json` listing skills not installed under the host's project skill directory
- WHEN the gate runs
- THEN it reports each skill the lock file lists that is not installed, and each installed skill the lock file does not list
- AND IT MUST still pass on a found router; the mismatch is a reported warning, recorded in `execution.md`
- BUT it must NOT pass silently on the router alone when a lock file exists

#### Scenario: No stale skill names

- GIVEN the deferral table
- WHEN it names an owner skill
- THEN every named skill is one of the core four, or the table states it is installed on demand
- BUT it must NOT name `hyperframes-core`, `hyperframes-animation`, or `hyperframes-creative` as a required owner

### FR-4: Phase map covers HyperFrames' film artifacts (S4)

The phase map SHALL say where `story.md`, `SPEC.md`, `snapshot --review` and its `REVIEW.md` live in the AKILI flow. The acceptance criteria SHALL state the music-bed expectation for films over about 15 s.

#### Scenario: Film artifacts are mapped

- GIVEN a film over about 15 s
- WHEN the router asks for `story.md`, `SPEC.md`, and `snapshot --review`/`REVIEW.md`
- THEN the phase map names the AKILI owner and where each artifact is stored
- BUT it must NOT create a second approval for any artifact an AKILI gate already approves (the storyboard rule holds)

#### Scenario: Music bed

- GIVEN acceptance criterion 8 (Audio) for a film over about 15 s
- WHEN requirements are written
- THEN the criterion states the music bed, or `n/a — <reason>` naming why the film has none

### FR-5: Fonts are self-hosted and proven local (S5)

The skill SHALL require every font family a composition uses to be self-hosted (`@font-face` pointing at a local file). A claim that the render is "local only" SHALL be evidenced by a `check` run with a cold font cache.

#### Scenario: Bundled is not local

- GIVEN a composition naming a family HyperFrames calls bundled
- WHEN the font rule is applied
- THEN the family is still self-hosted
- AND the skill notes that "bundled" families may be fetched from Google Fonts at compile time (upstream issue cited)
- BUT it must NOT accept a warm-cache `check` as evidence of "local only"

#### Scenario: Brand source names files

- GIVEN acceptance criterion 9 (Brand source)
- WHEN it is written
- THEN it names the font files used, with their location

### FR-6: Delivery render can be deferred (S6)

A video spec MAY record `Delivery: deferred` in Document Control. When it does, `/akili-validate` SHALL do the final look on the draft render only, SHALL record the deferral in the validation report, and SHALL NOT run the delivery render.

#### Scenario: Deferred

- GIVEN `requirements.md` records `Deliverable: video` and `Delivery: deferred`
- WHEN `/akili-validate` reaches the delivery-render step
- THEN it skips the render and records `Delivery: deferred — final look on draft render <path>`
- AND IT MUST still require the final look and its approval
- BUT it must NOT report the delivery render as done

#### Scenario: Default

- GIVEN no `Delivery` row
- WHEN validate runs
- THEN the delivery render runs after final-look approval, as today

#### Scenario: Recorded where downstream reads it

- GIVEN a proposal records `Delivery: deferred`
- WHEN specify writes `requirements.md`
- THEN the row is copied into its Document Control beside `Deliverable`

### FR-7: Video proposals carry a Deliverable Outline (S7)

For `Deliverable: video` on the Change track, `/akili-propose` SHALL write a **Deliverable Outline** (beats, assets, constraints) in place of the Requirement Delta Preview. `/akili-specify` SHALL convert it.

#### Scenario: Outline replaces the delta

- GIVEN a Change request with `Deliverable: video`
- WHEN the proposal is written
- THEN section 9 is the Deliverable Outline with three parts: beats (time, content, intent), assets (source, license/owner), constraints (duration, format, brand, delivery)
- BUT it must NOT also carry an ADDED/MODIFIED/REMOVED preview
- AND the Bug track keeps the Bug Diagnosis, unchanged

#### Scenario: Specify converts it

- GIVEN a proposal with a Deliverable Outline
- WHEN specify Phase 1 runs
- THEN beats feed acceptance criterion 6 and the design's beat table, assets feed criterion 9 and the evidence plan, and constraints feed criteria 1–4, 10 and the `Delivery` row

### FR-8: Video test reports have video sections (S8)

When `Deliverable: video`, `test-report.md` SHALL use these sections in place of Backend Unit, Frontend Unit, Integration, E2E: **Render Evidence**, **Final-look pending**, and **Deferred suspicions**.

#### Scenario: No n/a software sections

- GIVEN a video spec with a render-evidence suite only
- WHEN the report is written
- THEN it carries Render Evidence (the evidence-set table), Final-look pending (what only the final look can decide), and Deferred suspicions (a Tester's suspected visual issues, each with timestamp and still path)
- BUT it must NOT carry Backend Unit / Frontend Unit / Integration / E2E sections marked n/a
- AND a video spec that also has software suites keeps those suites' sections

### FR-9: Greenfield red exception (S9)

Falsifiability item 8 SHALL allow, for a greenfield artifact only, a falsifier whose expected red is written as a prediction at specify time. That prediction SHALL be marked as such, and the first task that creates the artifact SHALL observe the red and quote it verbatim in `execution.md`.

#### Scenario: Greenfield

- GIVEN a falsifier whose target file does not exist at specify time
- WHEN tasks are written
- THEN the falsifier carries `predicted — greenfield artifact` and names the task that will observe it
- AND IT MUST be observed and quoted in that task's `execution.md` entry before the task closes; a red that differs from the prediction is recorded as the observed value
- BUT it must NOT apply to any falsifier whose target exists at specify time

### FR-10: Render environment (S10)

The skill SHALL require a dedicated worktree for video work (an Orca-managed worktree when Orca is present, else `git worktree`), one render at a time, and SHALL count a running tool daemon as breaking the quiet tree.

#### Scenario: Daemon present

- GIVEN a HyperFrames warm-check daemon still running from an earlier command
- WHEN a render or measurement is about to start
- THEN the tree is not quiet; wait for the daemon to exit, or stop it, and record which
- BUT it must NOT start the render beside it

#### Scenario: One render

- GIVEN a render in progress
- WHEN another render (draft or delivery) is requested
- THEN it waits for the first to finish

### FR-11: Tester model differs from the Implementer's (S11)

The Tester SHALL run on a model different from the Implementer's model, both in the Step 8E wrappers that `akili routing` writes and in `/akili-test`'s spawns.

#### Scenario: Wrapper derivation

- GIVEN any host and any answers `akili routing` accepts
- WHEN it plans the Tester wrapper
- THEN the wrapper's rendered `model` differs from the Implementer wrapper's rendered `model`
- AND the run reports the Tester's model and the Implementer's model on one line
- BUT it must NOT write a Tester wrapper whose model equals the Implementer's on any host, in any mode (interactive, `--yes`, `--json`, `--force`)

#### Scenario: No distinct model on a host

- GIVEN a host where no model distinct from the Implementer's has a wrapper value
- WHEN the plan is built
- THEN the Tester wrapper is not written, and the run reports `Tester: no wrapper — …` naming the reason
- AND the other wrappers are unaffected

#### Scenario: Runtime spawn

- GIVEN `/akili-test` spawning a Tester
- WHEN the Implementer models that wrote the code under test are known (`execution.md` spawn lines, or the registry T2 plus any recorded escalation)
- THEN the Tester runs on a model that is none of them; when the host offers none, the registry's cross-host dispatch is used
- AND IT MUST stop for the user when neither is possible; this is an exception, not auto-passed under `pre-approved`
- BUT it must NOT run a Leader-inline suite when the Leader's own model wrote code under test

#### Scenario: Rule text

- GIVEN `/akili-constitution` Step 8E Rule 1, `/akili-test`, and the docs that restate the Tester rule
- WHEN they state the Tester's model
- THEN they state it as a MUST
- BUT none of them still calls it a preference or "not a hard rule", except surfaces recorded in `design.md` as intentionally kept

### FR-12: Budget decisions (S13)

The tripwire SHALL stop the run regardless of any owner mandate. For `Deliverable: video`, specify SHALL multiply the first estimate of guard/gate code by 2–3 and record the factor.

#### Scenario: Owner mandate

- GIVEN `Approval Mode: pre-approved` from a brief that says "never stop" or "treat every gate as approved"
- WHEN the budget tripwire fires
- THEN the run stops for the user
- AND the stop quotes the rule that no mandate can pre-approve an exception
- BUT it must NOT log the tripwire as `auto-approved`

#### Scenario: Video gate multiplier

- GIVEN `Deliverable: video` at specify Step 2.4
- WHEN the budget is written
- THEN guard/gate code (check scripts, falsifier harnesses, parity tools) is estimated at 2–3× its first estimate, with the factor recorded beside the number
- BUT it must NOT apply the factor to a `software` spec

### FR-13: Effort ceiling rung (S14)

When a rework retry would raise the Implementer's effort past its tier's ceiling, the loop SHALL take a defined next step instead of improvising.

#### Scenario: Ceiling with a distinct Reviewer model available

- GIVEN attempt 2 failed with the Implementer at `xhigh` on T2
- WHEN attempt 3 starts and a Reviewer model distinct from the next-tier Implementer model exists (registry T3 fallback or cross-host dispatch)
- THEN the Implementer moves one tier up at `xhigh`, the Reviewer moves to that distinct model, and both are recorded
- BUT it must NOT run `max` on T2

#### Scenario: No distinct Reviewer model

- GIVEN the same failure and no such Reviewer model
- WHEN attempt 3 starts
- THEN the Implementer stays on T2 at `xhigh`, as a fresh spawn with the full Attempt History, and the entry records `effort ceiling: held xhigh`
- BUT it must NOT let the Implementer and Reviewer share a model
- AND IT MUST leave the 3-attempt ceiling unchanged

### FR-14: Motion needs stills (S15)

The defect-class table SHALL map motion defects (a missing or wrong entry/exit transition) to stills at each transition's boundaries, plus the final look. It SHALL state that `check --at-transitions` checks overlap and layout at tween boundaries only, not motion.

#### Scenario: Missing exit fade

- GIVEN a scene whose exit fade is missing
- WHEN the gates run
- THEN the defect class "motion" points at stills just before and after each transition, not at `check`

### FR-15: First token is the spec path (S16a)

`/akili-specify`, `/akili-execute`, `/akili-test` and `/akili-validate` SHALL each state, in their Arguments section, that the first whitespace- or newline-delimited token of `$ARGUMENTS` is the spec path and everything after it is context that is never interpolated into a path. Every path in their bodies SHALL use a spec-path name, not `$ARGUMENTS`.

#### Scenario: Multi-line brief

- GIVEN `/akili-execute changes/x` followed by a newline and a 40-line brief
- WHEN the command body is rendered
- THEN every `docs/specs/…` path reads the spec-path name, and the brief appears once (in the Arguments section)
- BUT it must NOT appear inside any `docs/specs/…` path

### FR-16: Propose under a brief (S16b, S16c)

`/akili-propose` SHALL honor a literal spec path that the brief mandates for a bare slug, and SHALL skip the Jira/Figma questions under `pre-approved` when the brief supplies the source.

#### Scenario: Literal path mandated

- GIVEN a bare slug and a brief that mandates `docs/specs/<slug>/`
- WHEN the path is resolved
- THEN the mandated path is used and Document Control records `Spec Path: <path> — literal path mandated by the brief`

#### Scenario: Source supplied

- GIVEN `pre-approved` and a brief that names the requirement source and the visual source (or says there is none)
- WHEN Step 1.1 runs
- THEN the two questions are skipped and Document Control logs `source questions skipped — supplied by the brief (pre-approved mode)`
- BUT it must NOT skip them under `gated`, or when the brief is silent on a source

### FR-17: Judgment-day under pre-approved (S16d)

Under `pre-approved`, judgment-day SHALL run at the design gate. A design corrected with **Fix only** (no re-judgment) SHALL NOT be recorded as `JUDGMENT: APPROVED`.

#### Scenario: Fix only

- GIVEN confirmed findings and the **Fix only** choice
- WHEN `judgment.md` is closed
- THEN its terminal reads `fixed, not re-judged` with the fixed IDs
- BUT it must NOT read `APPROVED`

### FR-18: `akili --version` (S17)

`akili --version` and `akili -v` SHALL print the package version and exit 0.

#### Scenario: Version

- GIVEN the packaged CLI
- WHEN `akili --version` (or `-v`) runs, alone or with a command
- THEN stdout is exactly the `package.json` version and a newline; exit 0; no command runs, nothing is written, and no network call is made
- BUT it must NOT print `Unknown option`

### FR-19: Docs, CHANGELOG, tests, upstream citations

Every package-affecting item SHALL have a CHANGELOG `Unreleased` note. `docs/cli.md` and `README.md` SHALL document `--version` and the Tester rule. The skill SHALL cite heygen-com/hyperframes#6136–#6139 where its text responds to them, without restating their content. New behavior SHALL be pinned by `node:test` tests.

#### Scenario: Summary surfaces match HEAD

- GIVEN the CHANGELOG entry
- WHEN each clause is quote-checked against the shipped text (KZ-002)
- THEN every clause holds

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | A spec with no `Deliverable` row, or `Deliverable: software`, sees no change from FR-1–FR-8, FR-10, FR-14, or FR-12's video multiplier (FR-9 applies to any spec with a greenfield artifact) |
| NFR-2 | The bridge skill stays at 3 files. Its byte cap is re-measured at design (Step 2.4 cap rule); any raise is recorded with the measured size |
| NFR-3 | No HyperFrames text is copied; upstream behavior is cited by issue, never restated as fact |
| NFR-4 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass |
| NFR-5 | Tool-agnostic wording: host-specific values live in tables (host table, Step 8E bullets) |
| NFR-6 | No test reads `docs/specs/changes/...` (KZ-changes--archify-diagrams-1) |

## 8. Defect Classes and Gates

| Defect class | Gate |
|---|---|
| A rule is missing or misplaced (stated where the agent does not read it) | Text-contract test asserting the rule on its line, row or section (`test/video-production.test.js` style) |
| A restatement contradicts the new rule (e.g. "prefer" Tester) | Phrase-family sweep keyed on the obligation, run before review (KZ-changes--kaizen-loop-closure-2), plus a test over the known restatement files |
| Wrapper derivation lets Tester = Implementer on some host or mode | Enumeration-wide test over all five hosts × packaged and user rosters, cross-host and unsatisfiable paths (Falsifiability item 7) |
| `$ARGUMENTS` survives in a path | Test: in the four commands, `$ARGUMENTS` occurs only in the Arguments section |
| `--version` regresses | CLI test spawning `bin/akili.js --version` / `-v` |
| Summary overstates shipped text | Reviewer quote-check at HEAD (KZ-002); no automated substitute — accepted |
| An agent misreads a rule (prose ambiguity) | No automated check. Substitute: judgment-day on the design, Reviewer read. Residual risk accepted |

## 9. Requirement ID Index

| ID | Scope item | Primary file(s) |
|---|---|---|
| FR-1 | S1 | `SKILL.md`, `render-evidence.md` |
| FR-2 | S2, S12 | `render-evidence.md`, `SKILL.md` |
| FR-3 | S3 | `SKILL.md` |
| FR-4 | S4 | `SKILL.md`, `acceptance-criteria.md` |
| FR-5 | S5 | `SKILL.md`, `render-evidence.md`, `acceptance-criteria.md` |
| FR-6 | S6 | `akili-validate.md`, `SKILL.md`, `render-evidence.md`, `akili-propose.md`, `akili-specify.md` |
| FR-7 | S7 | `akili-propose.md`, `akili-specify.md` |
| FR-8 | S8 | `akili-test.md` |
| FR-9 | S9 | `akili-specify.md` |
| FR-10 | S10 | `SKILL.md` |
| FR-11 | S11 | `bin/routing.js`, tests, `akili-constitution.md`, `akili-test.md`, docs |
| FR-12 | S13 | `akili-propose.md`, `akili-execute.md`, `akili-specify.md` |
| FR-13 | S14 | `akili-execute.md`, `.claude/templates/leader.md` |
| FR-14 | S15 | `acceptance-criteria.md` |
| FR-15 | S16a | four commands |
| FR-16 | S16b, S16c | `akili-propose.md` |
| FR-17 | S16d | `akili-specify.md`, `judgment-day` integration note |
| FR-18 | S17 | `bin/akili.js` |
| FR-19 | — | `CHANGELOG.md`, `docs/cli.md`, `README.md`, tests |
