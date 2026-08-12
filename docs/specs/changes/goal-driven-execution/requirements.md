# Requirements: Goal-Driven Unattended Execution

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/goal-driven-execution` |
| Depth | Lite |
| Type | Change |
| Approval Mode | gated |
| Status | Draft — Phase 1 |
| Date | 2026-08-12 |
| Proposal | `proposal.md` (approved 2026-08-12; per-host mapping amendment included) |

## 2. Executive Summary

Add guidance-only text (~25–40 lines total) wiring goal-driven unattended execution into AKILI: an **Unattended Mode** note with a canonical `/goal` condition template in `/akili-execute` (Claude Code + `pre-approved` only), the child-session launch mechanism in `docs/flow.md`'s fleet section, and closure surfaces (mirror line, CHANGELOG). No installer, hooks, or new commands.

## 3. Functional Requirements

### FR-1: Unattended Mode guidance in `/akili-execute`

`.claude/commands/akili-execute.md` SHALL gain an Unattended Mode note adjacent to the Step 5 Approval Mode paragraph (line ~253), applying only when host = Claude Code AND `Approval Mode: pre-approved`.

#### Scenario: Canonical condition template

- GIVEN a pre-approved spec run in Claude Code
- WHEN the Leader reads the Unattended Mode note
- THEN it can recommend launching with `/goal` using the canonical template: all tasks `[x]` with PASS evidence in `execution.md`, OR an exception block (HALT / Pivot Record / budget tripwire) exists, OR a question is pending for the user — plus a turn bound
- AND IT MUST state the turn bound as aligned with the 3-attempt rework ceiling
- AND IT MUST state optionality (trusted workspace required; dead under `disableAllHooks`; never a prerequisite — every run remains completable without it)
- BUT it must NOT suggest `/goal` under `gated` mode or outside the pre-approved context (the guidance lives entirely inside the pre-approved block)
- BUT it must NOT present the exception disjunction as optional — it is part of the template, never an add-on

### FR-2: Fleet launch mechanism in `docs/flow.md`

The *Multi-Spec Parallel Execution* section SHALL name the concrete child-launch mechanism per host at its `pre-approved` precondition (line ~252).

#### Scenario: Dispatcher can launch children without inventing mechanics

- GIVEN a coordinator dispatching independent specs to worktrees
- WHEN it reads the fleet preconditions
- THEN Claude Code children launch via `claude -p "/goal <condition>"` with the FR-1 template
- AND Antigravity children receive the spec-completion goal + exception contract in the dispatch brief (native goal dispatch)
- BUT it must NOT describe Antigravity as platform-evaluating a completion condition (its completion is user-verified via artifacts)
- AND IT MUST make no equivalent claim for OpenCode

### FR-3: Documentation closure

The change SHALL update `docs/commands/akili-execute.md` (one line noting the unattended-mode capability) and `CHANGELOG.md` (Unreleased, classified **minor**), consistent with FR-1/FR-2 content.

## 4. Non-Functional Requirements

- **NFR-1 (Verifiability — KZ-001):** every factual claim about `/goal` or Antigravity MUST be backed by its pinned source (https://code.claude.com/docs/en/goal.md; https://antigravity.google/blog/introducing-google-antigravity); undocumented behavior (e.g. `/compact` survival) is omitted, never asserted.
- **NFR-2 (Brevity):** total addition ≤ ~40 lines across all surfaces.

## 5. Defect Classes → Gates

| Defect class | Gate |
|---|---|
| Gate-bypass implication (`/goal` suggested outside pre-approved) | `grep -n "goal" .claude/commands/akili-execute.md` — every hit inside the Unattended Mode block; human read confirms context |
| Host-feature misinformation | No automated check — substituted: claims pinned to the two sources (NFR-1) + human review at the HITL gate |
| Surface drift (mirror/CHANGELOG contradicting command text) | grep all 4 surfaces for consistency |
| Broken links | URL presence check; both pins fetched during proposal (2026-08-12) |

## 6. Requirement ID Index

| ID | Name | Priority |
|---|---|---|
| FR-1 | Unattended Mode guidance | MUST |
| FR-2 | Fleet launch mechanism | MUST |
| FR-3 | Documentation closure | MUST |
| NFR-1 | Claim verifiability (KZ-001) | MUST |
| NFR-2 | Brevity | SHOULD |
