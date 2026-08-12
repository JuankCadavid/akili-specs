# Proposal: Goal-Driven Unattended Execution

## 1. Document Control

| Field | Value |
|---|---|
| Type | Change |
| Spec Path | `changes/goal-driven-execution` |
| Slug | `goal-driven-execution` — derived from free-text argument ("goal-driven unattended execution") |
| Approval Mode | gated |
| Status | Approved 2026-08-12 — delivered & archived 2026-08-12 |
| Date | 2026-08-12 |
| Author | Juan Carlos Cadavid (intent) / agent (draft) |

## 2. Intent

Wire Claude Code's `/goal` primitive into AKILI as the **completion driver for unattended runs**: when a spec runs under `Approval Mode: pre-approved`, a goal condition keeps the Leader turning until the spec completes or an exception fires — instead of the session silently stopping at the end of a model turn. Guidance-only: no installer change, no new command, never a prerequisite.

## 3. Problem / Current Behavior

- `pre-approved` mode auto-passes routine gates, but nothing **re-launches the next turn**: a Leader that ends its turn mid-spec just stops, and "unattended" execution is only half real. The human returns to a session that quietly halted three tasks in.
- The fleet pattern (`docs/flow.md` → *Multi-Spec Parallel Execution*; `leader.md` → fleet section) already warns that *"a gated session in an unwatched terminal waits forever"* and requires `pre-approved` children — but names no mechanism that actually drives a child session to completion. The missing primitive now exists.
- `/goal` (Claude Code v2.1.139+) is exactly that mechanism: a session-scoped completion condition checked by a lightweight evaluator model after each turn; if unmet, the next turn starts automatically. Launchable non-interactively: `claude -p "/goal <condition>"`. Docs: https://code.claude.com/docs/en/goal.md

## 4. Proposed Outcome

- `/akili-execute` gains a short **Unattended Mode** note (host-conditional, like existing `/model` phrasing): under `pre-approved` in Claude Code, recommend launching with `/goal` and provide the **canonical condition template**. AKILI is unusually well-suited: spec state is external and grep-verifiable (`tasks.md` checkboxes + `execution.md` PASS evidence — the *evidence-before-checkbox* rule was designed for mechanical verification).
- The condition template **hard-codes the exception disjunction** so the evaluator can never push past a human gate:
  > *"Every task in `docs/specs/<path>/tasks.md` is `[x]` with matching PASS evidence in `execution.md`, **or** a HALT / Pivot Record / budget-tripwire block exists in `execution.md`, **or** a question is pending for the user. Stop after N turns."*
- `docs/flow.md` fleet section gains the child-launch command (`claude -p "/goal <condition>"` per worktree), closing its documented gap.
- The turn bound (`stop after N turns`) is stated as **aligned with the 3-attempt rework ceiling** so the two brakes never conflict.
- Explicit negative guidance: `/goal` is **wrong under `gated` mode** (it would erode the HITL identity) and irrelevant to dialogue commands (`propose`, `specify`) and `/akili-quick`.
- **Per-host mapping (goal-driven ≠ Claude Code-only, but the mechanism differs per host):**

| Host | Mechanism | Completion check |
|---|---|---|
| Claude Code | `/goal <condition>` — session Stop-hook; evaluator model judges the condition after each turn and auto-continues (https://code.claude.com/docs/en/goal.md) | Platform-evaluated per turn |
| Google Antigravity | Native goal dispatch: the agent pursues a high-level mission autonomously across surfaces, producing artifacts (task lists, walkthroughs, recordings) as verification (https://antigravity.google/blog/introducing-google-antigravity) | **User-verified via artifacts — the platform evaluates no completion condition**; the spec-completion goal + exception contract go in the dispatch brief |
| OpenCode | No verified equivalent | Guidance makes no claim |

## 5. Scope

| Deliverable | Location |
|---|---|
| Unattended Mode note + condition template (pre-approved only) | `.claude/commands/akili-execute.md` |
| Child-session launch mechanism in the fleet pattern | `docs/flow.md` (*Multi-Spec Parallel Execution*) |
| Docs mirror update if an execute mirror exists | `docs/commands/akili-execute.md` (verify at specify) |
| CHANGELOG entry (Unreleased) | `CHANGELOG.md` |

## 6. Non-Goals

- **No hard dependency**: every AKILI run must remain completable without `/goal` (same precedent as Step 8F hooks and CodeGraph — host-specific, optional, never prerequisite). OpenCode gets no equivalent claim; Antigravity's mapping is its native goal dispatch, not a `/goal` command.
- **No pretending Antigravity self-certifies**: its docs describe artifact-based, user-verified completion — the guidance must not project Claude Code's evaluator semantics onto it.
- **No installer or hook shipping**: we describe the launch pattern; we do not scaffold Stop hooks or write goal files.
- **No change to gate semantics**: exceptions (HALT, Pivot, tripwire, `FATAL_FAIL`, `PRODUCT_BUG`) stop for the user in every mode, exactly as today. `/goal` drives *continuation*, never *approval*.
- **No goal-as-state**: `tasks.md`/`execution.md` stay the only source of truth; the goal condition reads them, never replaces them.

## 7. Affected Users, Systems, And Specs

- **Users:** anyone running pre-approved specs unattended (overnight runs, fleet dispatch); fleet coordinators.
- **Systems:** one command file, one flow doc, possibly one mirror, CHANGELOG. No code.
- **Specs:** none active; complements the archived fleet/pre-approved machinery.

## 8. Visual Reference

- Source: None
- Location: —
- Notes: methodology-text-only change; no UI surface.

## 9. Requirement Delta Preview

### ADDED Requirements

- `/akili-execute` documents Unattended Mode: when host = Claude Code **and** `Approval Mode: pre-approved`, recommend `/goal` with the canonical condition template (completion ∨ exception ∨ pending-question, plus a turn bound aligned to the rework ceiling).
- `docs/flow.md` fleet dispatch names the concrete child-launch command per worktree.
- The guidance states verifiability requirements: conditions must be checkable from conversation output (the Leader already reports task state at each gate; greps are quotable).

### MODIFIED Requirements

- The fleet pattern's precondition list ("pre-approved children") gains the launch mechanism it currently lacks.

### REMOVED Requirements

- None.

## 10. Approach Options

| Option | Shape | Trade-off |
|---|---|---|
| **A (recommended)** | Guidance-only: note + template in `akili-execute`, launch command in `flow.md`, mirror + CHANGELOG | Smallest safe path; host-optional by construction; zero install risk; provable by grep |
| B | A + `/akili-constitution` step scaffolding a per-project goal-condition file / Stop-hook config | Automates launch but ships host-specific config from a tool-agnostic installer — the exact thing Model Routing's "no `model:` in frontmatter" rule exists to prevent. Defer until A proves out |
| C | Use `/loop` instead of `/goal` | `/loop` repeats on a timer with no completion judgment; `/goal` evaluates the end state per turn — the right primitive. Rejected |

## 11. Recommended Approach

**Option A.** It codifies a working pattern in ~15–25 lines of guidance across two primary files, honors the never-a-prerequisite rule, and leaves automation (Option B) as a later chunk if real usage demands it.

## 12. Risks, Dependencies, And Open Questions

| Item | Kind | Mitigation |
|---|---|---|
| Evaluator (default Haiku) misjudges completion from conversation output | Risk | Condition template quotes grep-verifiable state; Leader already prints task state at each gate; turn bound caps runaway |
| `/goal` semantics churn (young feature, v2.1.139+) | Risk | **KZ-001 applies:** pin https://code.claude.com/docs/en/goal.md in the written guidance; claims not in the doc (e.g. `/compact` survival is undocumented) are omitted or marked, never asserted |
| Guidance drifts into implying `/goal` bypasses gates | Risk | Exception disjunction is part of the canonical template, not an optional add-on; negative guidance for `gated` mode stated in the same block |
| Requires trusted workspace; dead under `disableAllHooks` | Dependency | Framed as optional enhancement; a sentence names the requirements |
| Does an execute docs mirror exist that enumerates mode behavior? | Open question | Verify at `/akili-specify` (mirror drift is a known FR-6-class defect — see archived spec's judgment CS-2) |

## 13. Success Criteria

- `grep -n "goal" .claude/commands/akili-execute.md` shows the guidance **only** inside the pre-approved/unattended context — zero suggestions of `/goal` under gated mode.
- The canonical condition template appears verbatim with the exception disjunction and turn bound.
- `docs/flow.md` fleet section names the child-launch command; a reader can dispatch a fleet without inventing the mechanics.
- Every factual claim about `/goal` is backed by the pinned doc (KZ-001); no undocumented behavior asserted. Per-host claims each pin their own source (Claude Code doc; Antigravity official blog/docs); Antigravity is never described as platform-evaluating a completion condition.
- CHANGELOG Unreleased entry present; release classified **minor** (new documented capability).

## 14. Next Step

```text
/akili-specify changes/goal-driven-execution
```
