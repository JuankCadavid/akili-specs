# Proposal — Re-baseline AKILI for Claude Opus 5.5

**Recommendation:** Option A. Rewrite the Opus-specific effort guidance for Opus 5.5 and mark the new starting points as vendor-measured but not yet measured by AKILI. Leave the cross-host role-default table alone. Add a bounded anti-premature-stop instruction to the unattended worker personas (Implementer, Tester), and to the Leader only under `pre-approved` mode. Record time-budget signals as a host-capability note rather than a persona change, because no supported host appends elapsed time to a worker's turn. One bounded spec, **patch** release.

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/opus-5-5-rebaseline` |
| Slug | `opus-5-5-rebaseline`, given by the user as the first token of the argument. The free text after it is proposal context |
| Type | Change |
| Approval Mode | gated |
| Status | **Approved** (user, 2026-09-29): Option A; open questions carried to specify with the recommended defaults |
| Date | 2026-09-29 |
| Author | /akili-propose (session model Opus 5.5, T1) |
| Source | [Prompting Claude Opus 5.5](https://platform.claude.com/docs/es/build-with-claude/prompt-engineering/prompting-claude-opus-5-5), fetched 2026-09-29 |
| Depends on | none |
| Parallel-safe | yes, with one caveat: the sibling chunk `untrusted-input-and-design-defaults` (not yet proposed) touches `/akili-propose`, `/akili-specify` and `frontend-design`, and none of those are in this scope. No shared files |
| Release Classification | **patch** (memory: *semver discipline*). It recalibrates guidance and adds a guardrail inside existing personas: no new command, install target or capability. The specify phase re-checks this if the Leader-side continuation rule (Open Question 3) ends up adding a new loop state |
| Scope Chunking | This is chunk 1 of 2, agreed with the user 2026-09-29. The two chunks share no files and no rationale, so there is no `family.md` |
| Depth hint for `/akili-specify` | **Standard**. The work is prose only, but it edits load-bearing rules in five-plus surfaces that restate each other, and that is where KZ-changes--kaizen-loop-closure-2 and KZ-changes--leader-brief-contract-1 recurred |

## Intent

Make AKILI's model guidance true for the model it now runs on. The session model and the `opus` alias now resolve to Opus 5.5. The vendor's own guidance for this generation contradicts several things AKILI still tells its Leader and workers: how to set effort, how an unattended worker should end its turn, and what makes a multi-agent run finish sooner.

## Problem / Current Behavior

| # | Current behavior | What Opus 5.5 guidance says |
|---|---|---|
| P1 | `docs/model-routing.md:401` "Opus specifics": *"start high and iterate **down** — more effort up front often reduces total turns and total cost"* | The default is `medium`. `medium` matches or beats Opus 5 at `high` on coding and knowledge evals. At a given level it thinks *more* per turn than Opus 5, especially at `xhigh`/`max`. "Reserve `xhigh` and `max` for work where you have measured a quality gain." Level names do not map to the same amount of thinking across models (source, *Calibra el esfuerzo*) |
| P2 | `docs/model-routing.md:363` cites the Opus 5 published starting points (*"`xhigh` for coding and agentic work, `high` elsewhere"*). `:103–104` and `:392` name Opus 5 as the generation the `opus` alias resolves to | Both are stale by one generation. The alias now resolves to Opus 5.5: see this session's environment (`claude-opus-5-5`) |
| P3 | Role defaults (`model-routing.md:352–355`): T1 Leader/specify `high`, T3 Reviewer `high`. These are restated in `akili-constitution.md` Step 8C (`:549–563`), `.claude/templates/leader.md:26`, `reviewer.md:7`, `akili-test.md:111,123` and `akili-execute.md:148,172` | Under Opus 5.5, `high` for T1/T3 buys more thinking than it did when these defaults were set. The table is **cross-host** (Codex, Antigravity, Sonnet), and the vendor data covers only Opus. Both points are UNVERIFIED for AKILI's shape; the re-baseline rule (`:360–375`) says *sweep, don't assume* |
| P4 | `implementer.md:24` forbids a false "done" and allows *"a truthful partial with a named blocker"*. No persona names the stops the Leader does **not** want: ending with a summary that announces the next step, offering to continue, or listing non-blocking decisions | On long multi-part tasks, Opus 5.5 ends some turns with a progress update and no tool call. An unattended loop that treats that as the end stops there. An instruction that names the four specific premature stops reduces them. It must **not** be used where a human is in the loop (source, *Ejecuciones agénticas desatendidas*) |
| P5 | `leader.md:148–165`, the *idle-without-report* protocol, covers a worker that finished but never sent its report. It does not cover a worker whose report lists open items and names no blocker | The source says to treat a text-only end of turn as a report, not as proof of completion. Name the open items in a short continuation message. Stop after 2–3 automatic continuations |
| P6 | `akili-execute.md:318` Unattended Mode relies on `/goal` (a small model checks the completion condition each turn) plus a `<N>`-turn cap | This already matches the source's "separate smaller model checks the stop condition" and "stop after 2–3 continuations". **No change needed**; it is the anchor the Leader-side rule plugs into |
| P7 | No time signal anywhere. The Budget Tripwire (`akili-execute.md:257`) measures tasks, LOC and review rounds | Opus 5.5 paces to an `elapsed Xs / Ys` line that the harness appends to every message, and parallel teams finish earlier with it. The line is harness-injected; a prompt cannot produce it. Under time pressure the model may search and verify less (source, *Señales de tiempo*) |

## Proposed Outcome

| Area | After the change |
|---|---|
| Effort guidance | "Opus specifics" states the Opus 5.5 starting point (`medium`), the reserve-`xhigh`/`max`-for-measured-gains rule, and "lower effort before prompting for less thinking". It is labelled **vendor-measured, not AKILI-measured**. Stale Opus 5 references are updated. The cross-host role table stays as is and gains a pointer to the family-specific notes |
| Sweep hook | The re-baseline rule names how the first specs executed on Opus 5.5 record effort against Reviewer outcome, so the sweep happens as a by-product of real work instead of as a separate experiment |
| Worker personas | `implementer.md` and `tester.md` carry a bounded anti-premature-stop rule. It names the unwanted stops, preserves the truthful-partial-with-blocker report, and never overrides destructive-action confirmation |
| Leader | Under `pre-approved` only: a worker report with open items and no named blocker gets a continuation message naming the items, capped at 2–3. Under `gated`, nothing changes |
| Time signals | `model-routing.md` documents them as a **host capability**: adopt where a custom harness can append elapsed/budget lines, never on the Reviewer, and not scaffolded into personas |

## Scope

| Surface | Edit |
|---|---|
| `docs/model-routing.md` | *Opus specifics* rewritten; *Re-baseline* bullets updated; stale Opus 5 references at `:103–104`, `:363` and `:392` corrected; time-signal note added |
| `.claude/commands/akili-constitution.md` Step 8C (`:549–563`) | The compact Effort-dial mirror stays in agreement with the packaged doc. Only the summary lines that change are touched |
| `.claude/templates/implementer.md`, `tester.md` | Anti-premature-stop rule |
| `.claude/templates/leader.md` + `.claude/commands/akili-execute.md` Unattended Mode | The `pre-approved`-only continuation rule and its bound |
| Restatement sweep | `leader.md:26`, `reviewer.md:7`, `akili-test.md:111,123`, `akili-execute.md:148,172`, **keyed on the obligation** ("T1/T3 default effort", "start high") and not on the literal strings (KZ-changes--agents-md-canonical-1) |
| `CHANGELOG.md` | An `Unreleased` entry |

## Non-Goals

- Changing the **cross-host** default-effort table values without an AKILI measurement.
- Codex, Antigravity, OpenCode or Sonnet effort guidance.
- The *Frontier escalation* pin `claude-fable-5` versus the current Fable 5.1. It is related generation drift, but it is a separate registry decision (Open Question 5).
- Chat-app recommendations: "treat earlier answers as done" is explicitly wrong for AKILI's agentic loops, where a later step reveals an earlier error, and there are no "think carefully" system-prompt lines to remove.
- Pasted-content marking, multi-app exploration and frontend defaults. These belong to sibling chunk 2.
- Building any harness. AKILI ships prompts, not a runtime.

## Affected Users, Systems, And Specs

- **Users:** anyone whose `/akili-execute`/`/akili-test` Leader runs on the `opus` alias, which is every Claude Code default install.
- **Downstream projects:** `.agents/*.md` are deployed copies. Safe Update never overwrites them, so existing projects pick up the persona rule only through `/akili-constitution`'s append-upgrade block. `/akili-audit` *Model Generation Drift (b)* already flags stale `Updated:` stamps.
- **Related archived spec:** `2026-09-17-changes--model-routing-cost-rebaseline` (the same document family, a registry refresh with the same patch shape).

## Visual Reference

- Source: None
- Notes: this is a prose-only methodology change with no UI surface.

## Requirement Delta Preview

### ADDED Requirements

- Worker personas name the premature-stop shapes to avoid and the stops that stay legitimate (nothing can move without the user; a protected blocker; a destructive-action confirmation).
- Under `pre-approved`, the Leader treats a worker report with open items and no blocker as partial, not complete, and continues it at most 2–3 times.
- `model-routing.md` documents time-budget signals as a harness capability, with the Reviewer excluded.

### MODIFIED Requirements

- Opus effort guidance: from "start high, iterate down" to "start at `medium`; `xhigh`/`max` only for measured gains; lower effort before prompting for less thinking".
- The re-baseline rule gains a lightweight recording hook for the first Opus 5.5 specs.

### REMOVED Requirements

- The Opus 5 published starting points as current guidance. They are kept only as history, if at all.

## Approach Options

| Option | What | Pros | Cons |
|---|---|---|---|
| **A: recalibrate the Opus notes, keep the cross-host table (recommended)** | The Proposed Outcome above | Honors *sweep, don't assume*, touches only family-specific text, and the sweep happens organically | T1/T3 in the role table keep reading `high` until a sweep lands, and on Opus 5.5 that overspends somewhat |
| B: A plus a dedicated sweep now | Replay one archived spec at `medium`/`high` on Opus 5.5 before editing the defaults | Changes the role table on AKILI evidence, not vendor evidence | Costly (a full execute triad ×2), and one spec is thin evidence anyway. It also delays the persona guardrails, which need no sweep |
| C: flip the role table to `medium` now | Trust the vendor data directly | Cheapest immediate saving | The table is cross-host, and the vendor data covers Opus only, so it would silently under-effort Sonnet/Codex/Antigravity Implementers and Reviewers. It violates the re-baseline rule |

**Why A:** it is the smallest path that makes every sentence true. Stale claims get fixed, the persona guardrail ships, and the only number AKILI cannot yet justify (the T1/T3 default on Opus 5.5) waits for evidence instead of being guessed.

## Risks, Dependencies, And Open Questions

| # | Item | Handling |
|---|---|---|
| R1 | Restatement drift: the effort defaults live in about eight places (KZ-changes--kaizen-loop-closure-2, KZ-changes--leader-brief-contract-1) | The sweep in Scope is keyed on the obligation, each paragraph that receives an insertion is read whole, and `/akili-specify` lists every surface in `tasks.md` |
| R2 | The anti-stop rule contradicts `implementer.md:24` (truthful partial with blocker) or the Pivot Protocol stops | The rule's "stops you do want" list must name blocker-partial, Pivot Detection and destructive-action confirmation explicitly. The Reviewer walks both paragraphs together |
| R3 | The anti-stop rule leaks into attended use | It is limited to worker personas (always unattended) and to the Leader under `pre-approved`. The vendor text says never in HITL apps |
| R4 | A continuation loop fights the 3-attempt rework ceiling or the `/goal` `<N>` cap | See Open Question 3 |
| R5 | Vendor claims age fast | Every quoted figure carries the source URL and the fetch date `2026-09-29`, and goes through the Premise Ledger at specify |
| OQ1 | Do you accept vendor data for the Opus *notes* now (A), or do you require an AKILI sweep first (B)? | Recommend A |
| OQ2 | Does Claude Code agent frontmatter accept an `effort` key, so that Step 8E wrappers could pin a per-role effort? This session's Agent tool exposes `model` and no effort parameter. `UNVERIFIED — confirm at source before relying on it` | Resolve at specify. If yes, it is a candidate, but a separate change, because it touches the installer-generated wrappers |
| OQ3 | Is a "report with open items, no blocker" continuation a new state? It is not a Reviewer FAIL and not a runtime event in the `akili-execute.md:62` enumeration | Recommend classifying it as a runtime event handled by `leader.md` (the idle-without-report neighbour) that never consumes a rework attempt. Decide at specify |
| OQ4 | Should the Reviewer persona also carry the anti-stop rule? It is spawned unattended too | Recommend no: it is a single-verdict role, and its partial-report failure mode is already covered by the output contract. Confirm |
| OQ5 | Is the Fable pin `claude-fable-5` superseded by Fable 5.1? | Out of scope. Flag it as a follow-up registry refresh |
| Evidence | Workers ending their turn before delivering what they owed is a **recurring AKILI incident**. `grep -rliE "idle-without-report\|poke" --include=execution.md docs/specs` hits 6 logs, for example `changes/review-intensity-routing/execution.md:56` (*"The Implementer twice ended its turn echoing an earlier report instead of delivering the contracted one"*) and `archive/2026-08-12-changes--goal-driven-execution/execution.md:57` (*"Both subagents initially went idle without sending their contracted reports"*). All of these are of the *idle-without-report* class. No log shows the specific vendor-described shape (a progress summary that announces the next step while work is still owed). `UNVERIFIED — confirm at source before relying on it` whether the anti-stop rule reduces the idle class too | Record both facts separately in the design's Premise Ledger. Do not claim that the rule fixes idle-without-report |

## Success Criteria

1. No sentence in the packaged docs, commands or templates still says Opus should start high and iterate down, or names Opus 5 as the current `opus` generation. A grep keyed on the obligation, run and quoted, proves it.
2. Every surface that restates effort defaults agrees with `docs/model-routing.md`, walked term by term.
3. `implementer.md` and `tester.md` carry the anti-stop rule, and its legitimate-stop list is consistent with `implementer.md:24` and the Pivot Protocol.
4. Under `gated`, the Leader's behavior is unchanged, verifiable by reading the edited paragraphs.
5. `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass.

## Next Step

```text
/akili-specify changes/opus-5-5-rebaseline
```
