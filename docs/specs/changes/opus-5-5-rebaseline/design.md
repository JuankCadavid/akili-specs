# Design: Re-baseline AKILI for Claude Opus 5.5

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/opus-5-5-rebaseline` |
| Depth | **Standard** (re-checked in §9) |
| Status | **Approved** (user, 2026-09-29) after Judgment Day round 1 (fix only; see `judgment.md`) |
| Date | 2026-09-29 |
| Source | `requirements.md` (FR-1..FR-7, NFR-1..5), approved 2026-09-29 |
| Premise Ledger | §10: **13 verified · 0 UNVERIFIED** |
| Reversion challenge (Step 2.3) | **Run** for DD-1 and DD-4 (one `sonnet` challenger, read-only). **Three findings, all absorbed into the design**: two in DD-1/DD-2, one in DD-4 |
| Delegation record | One reversion challenger (background, `sonnet`, read-only). All other exploration inline, under the *Delegation Thresholds* (targeted reads and greps, no full-file sweeps) |

## 2. Executive Summary

Four files change, plus the CHANGELOG. This is a prose-only change: no code, data, API or installer surface.

| # | Change | Where |
|---|---|---|
| 1 | Opus guidance recalibrated for 5.5; stale current-generation claims fixed; role table untouched but pointed at family notes | `docs/model-routing.md` |
| 2 | Time signals documented as a harness capability | `docs/model-routing.md` |
| 3 | A "don't stop short" rule for unattended workers | `implementer.md`, `tester.md` |
| 4 | `Not Done` handling split three ways and bounded under `pre-approved` | `akili-execute.md` Step 2.3 item 0 |

## 3. Architecture Overview

AKILI's routing has three layers. This spec touches the first two and leaves the third alone:

| Layer | Holds | Edited here |
|---|---|---|
| **Family notes** (*Sonnet specifics*, *Opus specifics*) | How one model family deviates from the defaults | **Yes**: Opus rewritten |
| **Cross-host role defaults** | One starting effort per role, for every host | **No**: values frozen (FR-3); gains a pointer to layer 1 |
| **Per-task flex** (Leader, *Delegation Discipline*) | The Leader's per-spawn choice | No |

The worker loop has two halves. Only the prevention half is new:

| Half | Existing | This spec |
|---|---|---|
| **Prevention** (the worker does not stop short) | `implementer.md:22–24` covers narrowing scope and false completion only | Adds the four premature-stop shapes and the legitimate stops |
| **Recovery** (the Leader handles a short report) | `akili-execute.md:223` item 0, unbounded; `leader.md` idle-without-report | Splits item 0 by content and bounds it under `pre-approved` |

## 4. Extended Directory Structure

No new files. All edited surfaces already exist:

| File | Section |
|---|---|
| `docs/model-routing.md` | *Model registry* worked example (`:103`); *Re-baseline* paragraph (`:360–375`); *Frontier escalation* (`:275`); *Tier ↔ effort* (`:392`); *Default effort by role* (`:350`); *Opus specifics* (`:401`); new *Time signals* subsection placed before `## Review intensity` (`:408`) |
| `.claude/templates/implementer.md` | Item 2 *Scope Discipline (Both Directions)*, a new bullet after *"Report completion only when it is actually complete"* (`:24`) |
| `.claude/templates/tester.md` | Item 4 *Execution & Bounded Self-Correction Inner Loop*, a new closing bullet |
| `.claude/commands/akili-execute.md` | Step 2.3 item 0 (`:223`); Step 5 *Unattended Mode* `<N>` formula (`:322`) |
| `CHANGELOG.md` | `Unreleased` |

## 5. Data Model

One additive line in the `execution.md` task entry: `continuations: <n> (<items named>)`, written only when a continuation fires (DD-4). Nothing parses `execution.md` by field (P-10), so no reader changes.

## 6. API Design / Backend / Frontend

Not applicable: methodology prose only.

## 7. Shared Contracts

The **anchor phrase** for FR-4 is **"Don't stop short"**. It is the bullet's lead-in in both personas, so one grep proves presence where the rule belongs and absence where it must not go (`reviewer.md`, `leader.md`).

## 8. Design Decisions

### DD-1: Rewrite *Opus specifics* in place; don't touch the role table *(replaces delivered guidance, challenged below)*

The paragraph at `:401` is the only place that says "start high" (P-1). It is rewritten to carry, in this order:

1. the Opus 5.5 starting point (`medium`) and the vendor comparison (`medium` ≈ Opus 5 `high`);
2. reserve `xhigh`/`max` for measured gains, since at the same level 5.5 thinks more per turn than 5;
3. lower effort before prompting for less thinking;
4. level names are not portable across generations;
5. the `max_tokens` headroom note;
6. the vendor source URL and fetch date;
7. an **AKILI-measured status line**: `AKILI-measured: none yet (2026-09-29) — update after the first sweep per the re-baseline rule`.

The surviving points of the old paragraph are **kept**: (a) the rework bump is the cheapest place to spend effort, and (b) `max` is for correctness-critical, latency-insensitive work. Neither depends on "start high" (P-11).

**Why not change the role table:** it is cross-host (P-3), and the vendor data covers Opus only. FR-3 instead adds one pointer sentence under the table: *family deviations live in the family notes below*.

**Rejected:** (i) adding a new *Opus 5.5 specifics* section beside the old one, which would leave "start high" live and contradict it (KZ-changes--leader-brief-contract-1); (ii) editing the role table (Option C, rejected at the proposal).

**Reversion challenge: "what does removing 'start high' break?"** Two contradictions, both closed in DD-2:

1. `:275` *Frontier escalation* says *"try the current `opus` at `xhigh` or `max` first"*. Read beside "reserve `xhigh`/`max` for measured gains", this could look like a conflict. It is not one, but it reads two ways. Resolution: `:275` gains a clause saying that this trial **is** the measurement the new rule asks for. It stays at `xhigh`/`max`.
2. `:374–375`, the under-specified-task rule (*"closer to the vendor's open-ended case. Start it at `high`/`xhigh`"*), derives its justification from the Opus 5 vendor numbers at `:363`. Resolution: the rule stands on its own ground (thin context means more thinking is owed) and keeps its values. Only its justification is re-anchored off the stale vendor citation.

Confirmed unaffected: the rework bump (`:384–386`) already starts at `medium`, and the role table is a role default, not an Opus claim (P-11).

### DD-2: Current-generation claims become history-labelled, not deleted

| Site | Today | After |
|---|---|---|
| `:103–104` worked example | "the Opus 5 release required zero edits" | Kept (true), plus one clause: the same held for Opus 5.5 |
| `:363` | Opus 5 starting points given as the vendor's current guidance | Opus 5.5's (`medium`) as current; Opus 5's named as the previous generation |
| `:392` | "(the current `opus` alias resolves to Opus 5)" | "…resolves to Opus 5.5" |
| `:188`, `:272` | Historical facts about Opus 5 (quota pool; closing the gap to Fable) | Kept: past tense, and still true |
| `:275` | *"try the current `opus` at `xhigh` or `max` first"* | Values kept, plus a clause: this trial is the measured-gain case (reversion finding 1) |
| `:374–375` | Under-specified tasks start at `high`/`xhigh` because they are "closer to the vendor's open-ended case" | Values kept; the justification is restated without the Opus 5 vendor numbers (reversion finding 2) |

**The zero-edits claim for Opus 5.5 is itself a premise (P-9):** the registry table names aliases only, so the claim holds.

### DD-3: The worker rule is a sibling bullet, not an edit of `:24`

It is inserted as a new bullet **after** `implementer.md:24`, and it names `:24`'s truthful-partial report as a legitimate stop. `:24` itself is not edited. The same applies in `tester.md`: a closing bullet in item 4 names the Tester's own terminal outcomes as legitimate stops: a `PRODUCT_BUG`, a `FAIL` carrying `AUTOMATION_DEFERRED`, and the exhaustion of the bounded 3-attempt inner loop. It names nothing outside the Tester's `PASS`/`FAIL`/`PRODUCT_BUG` contract (`FATAL_FAIL` is an Implementer status and is not named here; judgment JD-2).

**Content obligations (FR-4), not wording:**

- the lead-in "Don't stop short" (§7);
- the premise: the worker's final message **is** its report to the Leader, and the turn does not resume without new input (P-8);
- the four premature-stop shapes;
- status notes travel with the next action;
- the legitimate stops;
- the destructive-action carve-out.

**Why here:** item 2 already has "Don't widen" / "Don't narrow either". "Don't stop short" completes the same axis, the scope the worker actually delivers. It also keeps clear of `changes/scoped-constitution-reads`, which rewrites the read rule at `:14` of both files (P-7, NFR-3).

**Rejected:** the vendor paragraph pasted verbatim. It is written for a user-facing agent ("the user has seen you…"), while here the counterpart is the Leader, and the vendor itself says to adapt it.

### DD-4: Item 0 splits `Not Done` content three ways; the bound applies only under `pre-approved` *(constrains delivered behavior, challenged below)*

The `Not Done / Assumptions` field carries three different things (P-5). Today item 0 treats them all alike:

| Content class | Action (both modes, unless stated) |
|---|---|
| **Owed work with a named blocker** | `[~]` and escalate, as today |
| **Owed work with no named blocker** | `gated`: unchanged (re-spawn or escalate, the Leader's call). `pre-approved`: re-spawn naming the owed items; **at most 2 continuations per task**; a third such report → `[~]` and escalate |
| **Assumptions only, or an inconclusive verification** (no owed item) | Never a continuation, because re-spawning cannot resolve a judgment call or noisy evidence. Handled as today: the text goes to `execution.md` and the task does not reach `[x]` on its own |

**Mixed content: precedence (judgment JD-3).** The field routinely carries owed work *and* judgment calls together (P-5). The rows are therefore applied in precedence order, not matched as exclusive classes:

1. **Any named blocker** → `[~]` and escalate, whatever else the field holds.
2. Otherwise, **any owed item without a blocker** → continuation-eligible (under `pre-approved`). The continuation brief names **only the owed items**. The assumptions in the same field are carried into `execution.md` verbatim, as today, and are not re-sent as work.
3. Otherwise (**no owed item**) → never a continuation.

**Accounting:** a continuation is **neither** a rework attempt (the Accounting rule names only Reviewer `FAIL` and Implementer-reported verification failure, P-4) **nor** a runtime event (that enumeration is closed, and item 0 sits outside it). It is counted on its own line (§5). It adds no Reviewer round to the Budget Tripwire, which counts Reviewer verdicts only (P-6).

**Why 2:** the vendor says "two or three". AKILI picks the lower bound because each continuation is a full Implementer spawn, and the `/goal` `<N>` formula already budgets up to 6 triad round-trips per task.

**Rejected:** (i) bounding `gated` too, which would break Success Criterion 4 (the user is present at every continue gate anyway); (ii) making the continuation a runtime-ladder rung, which would reopen a closed enumeration for a non-runtime cause.

**Unattended turn budget:** the `/goal` `<N>` formula (`akili-execute.md:322`, *"tasks remaining × up to 6 triad round-trips + margin"*) does not name continuations. It gains **+ 2 continuations per task**, so the cap and the turn bound never fight. The cap still triggers `[~]` first, and the escalation satisfies the stop condition.

**Reversion challenge: "what does bounding re-spawn break?"** No conflict with the Accounting rule, the runtime ladder (rung 4 has a different trigger), Maximum Retries, the Budget Tripwire or idle-without-report (orthogonal: that one has no report at all). One gap: the `/goal` formula above. It is closed by that formula line and adds one surface to T3.

### DD-5: Time signals live only in `model-routing.md`

A short subsection, *Time signals (harness capability, optional)*, before `## Review intensity`. It covers: the line format; that the harness injects it; that the budget is advisory and a hard stop needs a harness timeout; that the Reviewer is excluded because verification quality drops under time pressure; the fallback sentence for harnesses that can show elapsed time but can't predict a budget; and the vendor source. No persona or command references it (FR-6).

**Why here:** it is a routing-adjacent control (like effort), and every host-capability note already lives in this doc.

### DD-6: Non-changes

`reviewer.md`, `leader.md`, the role-default values, `akili-constitution.md` (the Step 8C mirror restates the role values and the generic re-baseline rule, neither of which changes, P-3), `docs/commands/akili-constitution.md:96` (the Codex role-effort row, values frozen, P-3), `bin/akili.js`, the `docs/commands/` mirrors (none restates an edited sentence, P-10), and `README.md`.

## 9. Budget (Step 2.4, tripwire for `/akili-execute`)

| Measure | Estimate |
|---|---|
| Tasks | **4**: T1 `model-routing.md` (FR-1, 2, 3, 6); T2 personas (FR-4); T3 item 0 (FR-5); T4 CHANGELOG + closure sweep (FR-7, NFR-1..5) |
| Shipped lines | **~75** (T1 ≈ 38, T2 ≈ 16, T3 ≈ 14, T4 ≈ 7) |
| Review rounds | **6**: one per task, plus two rework rounds (history: restatement drift cost a rework round in 3 of the last 4 specs) |

Four tasks at ~75 lines matches **Standard**. It is not Lite, because three surfaces carry load-bearing rules with live neighbours. It is not Full: there is no data, API, auth or migration.

## 10. Premise Ledger

`Premise Ledger: 13 verified · 0 UNVERIFIED (0 High, 0 Low)`. Verified 2026-09-29 at `31b6d31`, commands run from the repository root.

`Blast-radius triggers:` **consumer** fires, because DD-4 adds a line to `execution.md` entries. Walked in P-10. **shared-state** fires, because item 0 is read by both the `gated` and `pre-approved` paths. Walked in DD-4's table. **live-path**: none apply, since the design names no user action or branch point beyond the Approval Mode split, which DD-4 enumerates.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | "Start high" lives only at `model-routing.md:401` among the packaged surfaces | `existence` | `grep -rnE 'iterate \**down\|start high\|starts higher\|sweep down' --include='*.md' .` minus `docs/specs/`: hits at `docs/model-routing.md:363` ("starts higher", the vendor-context sentence, edited by DD-2), `:401`, plus `CHANGELOG.md:383` and `releases/v2.14.0.md:13` (history) | `31b6d31` | DD-1's single-site rewrite misses a copy: **High** | — |
| P-2 | Opus 5 is presented as current at `:363` and `:392` only; `:103`, `:188` and `:272` are history | `existence` | `grep -rnE 'Opus 5([^.0-9]\|$)' --include='*.md' .` minus `docs/specs/`, `CHANGELOG`: `model-routing.md:103,104,188,272,363,392` + `releases/*` (history), each read | `31b6d31` | DD-2's site table is incomplete: Low | — |
| P-3 | T1/T3 `high` defaults are restated at `model-routing.md:354,356`, `akili-constitution.md:554` and `reviewer.md:7`. `akili-constitution.md:779` and its mirror `docs/commands/akili-constitution.md:96` are the Codex `model_reasoning_effort` row | `other` | `grep -rnE 'default effort \`high\`\|effort \`high\`\|Leader \`high\`\|Reviewer \`high\`\|\`high\` \(\`xhigh\` if\|\`high\` \(auditor' --include='*.md' .claude docs README.md \| grep -v '^docs/specs/'` → **6** hits: `reviewer.md:7`, `akili-constitution.md:554,779`, `docs/model-routing.md:354,356`, `docs/commands/akili-constitution.md:96`. Without the `docs/specs/` exclusion it returns 70, mostly archived `execution.md` lines (judgment JD-1: the earlier citation omitted the exclusion and two patterns) | `31b6d31` | Freezing the table would leave a stale copy: **High** (it doesn't, since the values don't change) | — |
| P-4 | An attempt is consumed only by a Reviewer `FAIL` or an Implementer-reported verification failure | `other` | `akili-execute.md:64`: *"an attempt is consumed by a Reviewer `FAIL` or an Implementer-reported verification failure, and by nothing else"* | `31b6d31` | DD-4's "no attempt consumed" needs an explicit carve-out: **High** | — |
| P-5 | `Not Done / Assumptions` carries owed work **and** judgment calls; inconclusive evidence also routes there | `data-env` | `implementer.md:44`: *"list what you did not deliver and why, plus any judgment call you made"*; `implementer.md:33`: *"say so in `Not Done / Assumptions`"* | `31b6d31` | DD-4's three-way split is unnecessary: **High** | — |
| P-6 | The Budget Tripwire counts Reviewer verdicts only | `other` | `akili-execute.md:257`: *"Review rounds count Reviewer verdicts only"* | `31b6d31` | Continuations would trip the budget: Low | — |
| P-7 | `changes/scoped-constitution-reads` targets only the item-1 read rule of `implementer.md`/`tester.md` | `existence` | `grep -nE 'implementer\.md\|tester\.md' docs/specs/changes/scoped-constitution-reads/*.md` → `:24` (*"`implementer.md:14` and `tester.md:14`"*), `:56–57` (*"Rewrite the item-14 read rule"*) | `31b6d31` | The two specs collide textually, and NFR-3 needs sequencing: Low | — |
| P-8 | A subagent's final message is its report to the parent, and it does not continue without new input | `data-env` | This session's Agent tool contract: *"Use SendMessage with the agent's ID or name to continue a previously spawned agent"*; `leader.md:152`: *"An idle worker's turn has **ended**: nothing further arrives without new input"* | `31b6d31` | DD-3's premise sentence is wrong for Claude Code: **High** | — |
| P-9 | The registry names aliases only for Claude Code, so Opus 5.5 needed zero registry edits | `existence` | `model-routing.md:109–111` alias-first rule; this session's model `claude-opus-5-5` reached via the `opus` alias with no registry change (`git log -1 --format=%h -- docs/model-routing.md` shows no 5.5 edit) | `31b6d31` | DD-2's added clause is false: Low | — |
| P-10 | No command or skill parses `execution.md` by field name; no `docs/commands/` mirror restates item 0 | `consumer` | `grep -rnE 'runtime events\|execution\.md' .claude/skills/kaizen/SKILL.md .claude/commands/akili-resume.md .claude/commands/akili-archive.md`: prose reads only ("most recent entry", "last 3 entries", Measure rows keyed on FAIL/HALT/Pivot/WAIVED/SKIPPED blocks); `grep -n "Not Done\|re-spawn for the remainder" docs/commands/akili-execute.md` → 0 | `31b6d31` | A reader breaks on the new line: Low | — |
| P-11 | The rework-bump and `max`-for-critical points do not depend on "start high" | `other` | `model-routing.md:384–386` states the rework bump's own rationale (*"it targets the usual cause (under-thinking)"*); `:404–406` reason (2) stands alone | `31b6d31` | DD-1 must drop or rewrite them: Low | — (confirmed by the reversion challenge) |
| P-12 | The frontier-escalation trial and the under-specified-task rule both prescribe high effort; the latter justifies it with Opus 5 vendor numbers | `other` | `model-routing.md:275`: *"try the current `opus` at `xhigh` or `max` first"*; `:374–375`: *"closer to the vendor's open-ended case. Start it at `high`/`xhigh`"* | `31b6d31` | DD-2 leaves two sentences readable two ways: **High** | — |
| P-13 | The `/goal` turn bound names triad round-trips only | `other` | `akili-execute.md:322`: *"Set `<N>` to tasks remaining × up to 6 triad round-trips + margin"* | `31b6d31` | Unattended runs under-provision turns once continuations exist: Low | — |
