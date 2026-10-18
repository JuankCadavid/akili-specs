# Design: Video Deliverable Track

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-deliverable-track` |
| Depth | Standard (re-checked in §12) |
| Status | Draft — awaiting the specify gate |
| Date | 2026-10-18 |
| Verified at | `4a6ac65` (this repo); `01adadb9` (`heygen-com/hyperframes`, shallow clone, LFS off) |
| Skill name decision | `video-production` — confirmed (DD-2) |

## 2. Executive Summary

One new field, one new skill, one conditional branch per affected surface. `Deliverable` travels in the
proposal's Document Control; specify reads it directly; execute reaches it through per-task skill lists
plus the Leader rule; test and validate read it from the spec's Document Control. All video know-how lives
in `video-production`, which defers every HyperFrames detail to the installed HyperFrames skills.

## 3. Architecture Overview

| Surface | Reads `Deliverable` from | Video branch |
|---|---|---|
| `/akili-propose` Step 1 | request wording | writes `Deliverable` row; one shared classification question |
| `/akili-specify` | `proposal.md` Document Control | **Video Mode** block; Phase 2 conditional line; Step 3.2 skill derivation |
| `/akili-execute` Leader (`leader.md` skill rule) | task's skill list / `requirements.md` Document Control | assign `video-production` |
| `/akili-test` Phase 1 | `requirements.md` Document Control | render-evidence suite; missing HyperFrames = STOP |
| `/akili-validate` Phases 3 + 6 | `requirements.md` Document Control | `hyperframes check` as build gate; mandatory final look |
| `/akili-archive`, `/akili-audit`, `/akili-resume`, `/akili-quick`, `/akili-seo`, `/akili-constitution` (other than 8D) | — | **No branch — fall-through:** they never read `Type` today (P-1) and gain no `Deliverable` read; a video spec archives and audits like any spec (KZ-004) |

## 4. Extended Directory Structure

| Path | Change |
|---|---|
| `.claude/skills/video-production/SKILL.md` | new — availability gate, phase map, privacy defaults, concurrency note, deferral table |
| `.claude/skills/video-production/references/acceptance-criteria.md` | new — video requirement template + defect-class → gate table |
| `.claude/skills/video-production/references/render-evidence.md` | new — evidence contract for test/validate, Bug Mode regression shape |
| `.claude/commands/akili-propose.md`, `akili-specify.md`, `akili-test.md`, `akili-validate.md`, `akili-constitution.md` | edited (conditional text only) |
| `.claude/templates/leader.md` | edited — one clause in the skill-decision bullet |
| `docs/skills/governance.md`, `docs/skills/README.md`, `docs/skills/video-production.md` (new), `docs/flow.md`, `README.md`, `AGENTS.md`, `CHANGELOG.md` | docs |
| `test/install-cursor.test.js` | count fixtures |

## 5. Data Model

| Field | Location | Values | Default |
|---|---|---|---|
| `Deliverable` | Document Control of `proposal.md`, copied to `requirements.md` | `software`, `video` | `software` when absent |

No other persisted data. Video artifacts (`BRIEF.md`, `STORYBOARD.md`, `boards/`, compositions, renders)
live in the **user's** project as HyperFrames lays them out; render evidence lives under the spec folder.

## 6. API Design

n/a — no CLI flag, no installer behaviour, no exported symbol changes.

## 7. Backend Module Design

n/a — no `bin/` change. The installer already copies whole skill directories recursively (P-5), so the
new skill ships with no code change.

## 8. Frontend / UX Component Architecture

n/a — no UI. The *user's* video visual source (`frame.md` / `design.md`, storyboard board) is recorded
in the proposal's Visual Reference by the bridge's phase map.

## 9. Shared Contracts — the bridge's phase map

| HyperFrames artifact / gate | AKILI owner | Rule |
|---|---|---|
| Intent interview → `BRIEF.md` | propose + `requirements.md` | `BRIEF.md` is generated from approved requirements; the interview is not re-run |
| `STORYBOARD.md` plan (checkpoint gate) | specify design gate | the beat table lives in `design.md`; its approval *is* the storyboard approval |
| Sketch board `boards/storyboard.html` | first execute task | optional; its confirmation is recorded in `execution.md` |
| `check` → `snapshot` → preview | execute task Verification + test | per `render-evidence.md` |
| Final look → render on approval | validate | delivery render only after the final-look approval |

One HyperFrames gate = one AKILI gate; no gate is passed twice (proposal R2).

## 10. Design Decisions

| DD | Decision | Why / rejected alternative | Req |
|---|---|---|---|
| DD-1 | `Deliverable` is a separate field, not a 4th `Type` | Type is the risk track; a video can be Bug, Change or Trivial. Rejected: `Type: Video` (loses Bug Mode for broken renders) | FR-1 |
| DD-2 | Skill name `video-production` | Neutral, describes the work, no `hyperframes-` prefix (user constraint, Apache-2.0 §6). Considered `video-deliverable` (mirrors the field but names a value, not a capability) and `akili-video` (reads as a command) | FR-8 |
| DD-3 | Binding `conditional`, original-authorship variant, `license: MIT`, `inspired-by` credits HyperFrames by HeyGen (Apache-2.0) + repo URL | Nothing copied → no Apache redistribution duty, no NOTICE (upstream has none, P-7); credit is courtesy and accuracy | FR-8 |
| DD-4 | Detection is by requested deliverable, with the existing single question extended to cover deliverable | Mirrors upstream's router rule "match the requested deliverable"; keeps propose at ≤ 1 question | FR-1 |
| DD-5 | Execute is wired through `leader.md` + task skill lists, not `akili-execute.md` | Same path `gsap-animation` uses (P-3); avoids a second persona-drift surface | FR-3 |
| DD-6 | Missing HyperFrames = STOP with install hint, never fallback | A hand-built pipeline would bypass every render gate; matches test's "no infrastructure is a STOP" rule | FR-4, FR-6 |
| DD-7 | Governance gets one new clause (environment-provided skill may be named in command text only behind a recorded `Deliverable` selector + availability gate) and rule 2's sentence is narrowed, not removed | Keeps rule 1 (never vendor) intact; rule 2's guarantee still holds for every command and every software spec | FR-9 |
| DD-8 | AKILI text names only `check`, `snapshot`, `render`, `preview`, `skills` and `ffprobe` | Each verified at `01adadb9` (P-8); everything else defers to `hyperframes-cli` so upgrades need no AKILI release | NFR-2 |
| DD-9 | Telemetry off by env var per command; outward actions consent-gated | User decision at proposal gate; matches AKILI's confirm-before-outward rule | FR-5 |
| DD-10 | Live smoke run installs HyperFrames **project-scoped in a temp dir**, never globally | The user's global copy is stale (`hyperframes-media`) and must not be touched without consent | FR-4, NFR-5 |

**Reversion challenge (Step 2.3):** DD-7 narrows a delivered guarantee ("every command must still work
without it"). Challenge — *what does narrowing this break?* A teammate without HyperFrames opening a
video spec now stops instead of proceeding. That is the intended behaviour (FR-4); every command still
runs, and no software spec is affected. No other DD removes delivered behaviour.

## 11. Premise Ledger

Counts: 11 verified · 2 `UNVERIFIED` (1 High, 1 Low).
Blast-radius triggers: `consumer` fires (new Document Control field read by four surfaces; skill set and
counts consumed by tests); `live-path` and `shared-state` none apply — no user action dispatches through
code, and no shared runtime state changes.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | `Type` is read downstream only by specify (Bug Mode) and mentioned by quick | existence | `grep -n -E "Type: Bug\|\`Type\`\|Type: Change\|Bug Mode" .claude/commands/*.md .claude/templates/*.md` → hits only in `akili-quick.md:52`, `akili-propose.md`, `akili-specify.md` | `4a6ac65` | §3 fall-through rows wrong; more surfaces to edit (High) | — |
| P-2 | Governance forbids vendoring `hyperframes` and says every command must work without it | other | `docs/skills/governance.md:17-31` (rule 2 at :29) | `4a6ac65` | DD-7 unnecessary (Low) | — |
| P-3 | Conditional skills are wired by one specify line + the Leader skill rule | location | `akili-specify.md:220` (animation line), `:404` (skill derivation), `.claude/templates/leader.md:25` | `4a6ac65` | DD-5 wiring path changes (High) | — |
| P-4 | Fixtures assert 199 skill files, 24 skill dirs, 35 shared-root ops | data-env | `test/install-cursor.test.js:227,238,243-249`; `find .claude/skills -type f \| wc -l` → 199; `ls -d .claude/skills/*/ \| wc -l` → 24 | `4a6ac65` | T9 counts change (Low) | — |
| P-5 | Installer copies skill dirs recursively with no filter | location | `bin/akili.js:50` `copyTreeSync`, `:456` `listSkills`, `:638` `copyDirectoryContents` | `4a6ac65` | `references/` would not ship; installer task needed (High) | — |
| P-6 | The "works without it" rule is restated in three places | other | `grep -rn -i -E "work without\|without (it\|them)"` over governance, constitution, README, flow, AGENTS → `governance.md:29`, `README.md:151`; plus `akili-constitution.md` Step 8D item 3 "a teammate without that tool must still be able to run every command" (read at :727 region) | `4a6ac65` | FR-9 sweep misses a site (High) | — |
| P-7 | Upstream is Apache-2.0 with no NOTICE file | existence | upstream `LICENSE` header; `find . -maxdepth 2 -iname 'NOTICE*' -not -path './.git/*' \| wc -l` → 0 | `01adadb9` | NOTICE handling task needed if we ever redistribute (Low) | — |
| P-8 | Upstream gates: `check` (lint + runtime audit), `snapshot --at`, `render --quality`, `ffprobe` duration check, render only on approval | data-env | upstream `skills/hyperframes-cli/SKILL.md:24-29,59-70,81,112` | `01adadb9` | `render-evidence.md` names change (High) | — |
| P-9 | `HYPERFRAMES_NO_TELEMETRY=1` disables telemetry | data-env | upstream `skills/hyperframes-cli/references/upgrade-info-misc.md:108` | `01adadb9` | FR-5 mechanism changes (Low) | — |
| P-10 | `hyperframes-media` is gone upstream; media is `media-use` | existence | upstream `ls skills` (no `hyperframes-media`); `skills/hyperframes/SKILL.md` §5 table names `/media-use` | `01adadb9` | bridge names a dead skill (Low) | — |
| P-11 | `npx skills add` puts skills in each AKILI host's dir (Claude `.claude/skills`; OpenCode, Codex, Cursor, Antigravity `.agents/skills` project / own global dirs) | data-env | skills CLI **1.5.18** `package/dist` agent table (`antigravity` `globalSkillsDir: ~/.gemini/antigravity/skills`, etc.) | `skills@1.5.18` | install hints wrong (Low) | — |
| P-12 | Local runtime can render: Node 22.12.0, ffmpeg 8.1 (CLI needs Node ≥ 22) | data-env | `node -v`; `ffmpeg -version`; upstream `packages/cli/package.json:84-86` | `4a6ac65` / macOS | T10 cannot run locally (Low) | — |
| P-13 | Editing a clause inside `leader.md` item 3 keeps `agents-doctor` migratePersona extents green | other | `UNVERIFIED — confirm at source before relying on it` | — | T5 must restructure the edit or update fixtures (High) | T5 first step: `npm test` after the edit |
| P-14 | skills CLI **latest (1.7.2)** keeps the same host dirs as 1.5.18 | data-env | `UNVERIFIED — confirm at source before relying on it` | — | install hints need a version note (Low) | T10 (runs whatever `npx skills` resolves) |

Consumer rows → `Consumers` fields: P-1/§3 readers → T3, T4, T5, T6, T7; P-4 → T9; P-6 → T2, T8.

## 12. Budget (Step 2.4)

| Measure | Estimate |
|---|---|
| Tasks | 10 |
| LOC (mostly prose) | ~550 added / ~15 changed |
| Review rounds | ~17 (two per rules-text task T1–T7, one each for T8–T10) |

Depth check: matches Standard — ten bounded tasks, no code path. Tripwire for `/akili-execute`: stop and
escalate past 12 tasks, ~750 LOC, or 22 review rounds.
