# Design: Leader Brief Contract

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/leader-brief-contract` |
| Depth | Standard (re-checked against this design in §12 — holds) |
| Status | Approved — batch approval by the user, 2026-09-18 (drafted by a worktree agent on the Leader's behalf) |
| Date | 2026-09-18 |
| Source | `requirements.md` (FR-1..FR-9, NFR-1..8); `proposal.md` Option B |
| Reviewers | Step 2.3 reversion challenge **run inline** by the drafting agent (one adversarial question per reverting DD): two DDs revert delivered behavior (DD-3 diff delivery, DD-6 rollback); both challenges named a real breakage; both closed in the DD text (§11). `judgment-day` not run (draft mode; the user may request it at approval) |
| Consumer walk (KZ-changes--kaizen-loop-closure-1) | Three new enumerated sets — runtime-event kinds, `REVIEW_WAIVED` flags, brief-contract markers — each walked through **every existing consumer step** in §7, with "changes" or "holds" per row |
| Cross-spec hand-offs | Carried from `changes/gate-falsifiability` (design §7, DD-6): the `reviewer.md` red-run / mutation-trace item (surface row 14) and the Step 2.2 copied `Falsifier` / `Red run` / `Consumers` fields (surface row 3). Neither line is reworded here beyond the absent-value clause |
| Format precedent | `docs/specs/archive/2026-09-18-changes--kaizen-loop-closure/design.md` |
| Worktree note | Drafted in a worktree predating commit `02ed0e9`; rows cite main's section names (`leader.md` item 4 already holds the *pre-review restatement sweep* on main) |

## 2. Executive Summary

Nothing structural changes in the loop. Four texts gain a **shape**: the Implementer brief gets a five-clause contract block in Step 2.2; the Reviewer brief gets an "edits since last PASS" list and a size-gated diff; the Reviewer report gets a fixed order and a ceiling; `execution.md` gets one new record type. One **event lane** is added beside the existing FAIL lane: a runtime event never touches the attempt counter and is recovered by a fixed per-role ladder whose last rung is the user stop the table already had. The HALT rollback becomes a three-branch decision on tree state. Every addition is placed next to the rule it extends and cites it by name (KZ-005); the invariants the proposal lists as non-goals are byte-preserved (NFR-8).

## 3. Architecture Overview

```
                 Step 2 loop — two lanes, one counter
 ┌────────────────────────────────────────────────────────────────────────────┐
 │  spawn Implementer ──brief contract (2.2)──► report ──diff──► spawn Reviewer│
 │        │                                                     brief (2.3):  │
 │        │  ◄─── FAIL lane ─── STATUS: FAIL (report contract) ◄─ edits since  │
 │        │       attempt += 1                                  last PASS,    │
 │        │                                                     diff ≤300     │
 │        │  ◄─── EVENT lane ── spawn failure / provider-limit  inline else   │
 │        │       attempt unchanged   death / pane timeout      file+Read     │
 │        │       recovery ladder     (idle → leader.md)                      │
 │        ▼                                                                   │
 │  PASS ──► Step 3: execution.md entry → [x] → commit                        │
 │  ladder exhausted (Reviewer) ──► user stop ──► ## REVIEW_WAIVED ──► [x]    │
 │  3 FAILs ──► Step 4 HALT: tree state? clean │ other PASSed │ unattributed  │
 └────────────────────────────────────────────────────────────────────────────┘
```

**Where each contract lives (the file's existing division, proposal Option B):**

| Text | Operational rule (command) | Principle (persona) |
|---|---|---|
| Implementer brief | `/akili-execute` Step 2.2 *Brief contract* block | `leader.md` Delegation Discipline, one paragraph |
| Reviewer brief | Step 2.3 items (edits since last PASS; diff by size) | — |
| Reviewer report | Step 2.3 report contract paragraph | `reviewer.md` Structured Review Output (restated where the three options are) |
| `execution.md` | Execution Log Format (`REVIEW_WAIVED`, per-attempt events, execute-time edits) | — |
| Event handling | Step 2 preamble table + loop pseudocode + 2.4 clause | `leader.md` item 4, one clause |
| HALT rollback | Step 4 item 1, three branches | `leader.md` item 4, "by tree state" |

## 4. Extended Directory Structure

No new files. Changed files only:

```
.claude/commands/akili-execute.md      Step 2 preamble table · loop pseudocode · 2.2 · 2.3 · 2.4 · Step 3 · Step 4 · Step 5 · Execution Log Format
.claude/templates/leader.md            Delegation Discipline (+1 paragraph) · item 4 (+2 clauses)
.claude/templates/reviewer.md          Audit Checklist (+1 item) · 4R section (+1 clause) · mode table (+1 note) · Structured Review Output (+1 paragraph)
.claude/commands/akili-resume.md       Step 1 Last Action / Blocked (+1 clause)            ─┐
.claude/skills/kaizen/SKILL.md         Measure table (+1 row) · clean-run sentence · Metrics example (+1 row)  ├ FR-8, one clause each
.claude/commands/akili-archive.md      Step 4.1 signal list (+1 phrase)                    ─┘
docs/commands/akili-execute.md         mirror (loop · Reviewer output contract · Outputs · Guardrails)
docs/flow.md · README.md               only if the FR-9 grep turns a sentence false (expected: none)
docs/skills/kaizen.md                  only if it enumerates Measure signals
CHANGELOG.md                           Unreleased
```

## 5. Data Model — the contracts, defined once

### 5.1 Brief contract (Step 2.2 block; `leader.md` restates the principle)

| Clause | Rule | Falsifier (KZ-006) |
|---|---|---|
| (a) narrow-never-widen | No fallback / option / alternative / deliverable the task text lacks | A brief line offering "record it as not measurable" for a task that requires the measurement |
| (b) convention files by lookup | Walk target folder → repo root, list guides + guide-named cap/contract files; add `## Module Guides` entries prefixing the target; add files the task/design cites. One listing per level; deeper ⇒ scout. Empty ⇒ `convention files: none found by lookup` | Zero convention files named for a target whose folder holds a `CLAUDE.md` |
| (c) source-or-`UNVERIFIED` | Every infra / third-party fact cites file + section or a command output, or carries `UNVERIFIED — confirm at source before relying on it` | A bare "the env var means X" |
| (d) advisory-grade | Leader additions tagged `[advisory-grade]` ⇒ Reviewer audits as `ADVISORY`. **Stated in the same paragraph:** the tag lowers, never licenses; (a) still binds | A brief whose Leader-added test item is untagged and reads "closed as described and tested" |
| (e) copied fields (hand-off) | `Falsifier`, `Red run`, `Consumers` copied beside the verification command; absent ⇒ `no Falsifier / Red run / Consumers fields in this task` | A brief that copies the command alone for a task that carries the fields |

### 5.2 Reviewer brief additions (Step 2.3)

| Item | Rule |
|---|---|
| Edits since last PASS | Each `requirements.md` / `design.md` section the Leader edited since the previous PASS, as a named conformance check; carried once more by the next task's Reviewer brief; recorded in the current entry's *decisions made* at edit time. Boundary: a meaning-changing edit is a Pivot (existing protocol), not an edit-carry |
| Diff delivery | ≤ 300 lines inline; > 300 lines ⇒ the Leader writes **the diff it extracted** to a scratchpad file outside the working tree, brief names the path + `Read`. Non-host Reviewer ⇒ inline at any size |

### 5.3 Reviewer report contract (Step 2.3; `reviewer.md`)

| Position | Content | Limit |
|---|---|---|
| Line 1 | `STATUS: PASS` / `FAIL` / `FATAL_FAIL` — nothing before it | — |
| 2 | `SUMMARY:` 1–2 sentences; on overflow adds `ISSUES: <n> — <k> inline, <n−k> in <path>` | — |
| 3 | `ISSUES:` (FAIL only) — Discovered Issue / Violated Rule / Remediation Suggestion | Whole message ≤ ~600 words; overflow issues to a scratchpad file the Leader reads by path |
| 4 | `ADVISORY:` optional (suppressed under 50 LOC per the existing mode table) | — |

Structured Feedback relays report **and** overflow file verbatim.

### 5.4 Runtime events — kinds, per-role ladders, terminal branches (KZ-004)

| Event | What it is | Partial work? | Context survives? | Enters ladder at |
|---|---|---|---|---|
| Spawn failure | Harness could not start the worker | no | n/a | rung 1 |
| Provider-limit death | Worker killed mid-task (quota / rate / session limit) | maybe — **probe the tree first** | maybe | rung 1 (probe) → 3 if context survives, else 4 |
| Pane / terminal timeout | Transient host failure | rarely | n/a | rungs 1–2 |
| Idle-without-report | Worker's turn ended without its report | maybe | yes | **not this table** — `leader.md` protocol (artifact check → poke once → replace on second idle); "replace" is a fresh spawn |
| *Not events* (closing the enumeration) | Implementer-reported verification failure (implicit FAIL — attempt consumed); Reviewer FAIL; FATAL_FAIL; Pivot-Detection stop; project-stack outage (Step 2.1 pre-check + `leader.md` *Deferring a check*) | — | — | existing rules, unchanged |

**Accounting rule (stated once in the table, cited in 2.4 and `leader.md` item 4):** *an attempt is consumed by a Reviewer `FAIL` or an Implementer-reported verification failure, and by nothing else.* Review rounds (budget tripwire) count Reviewer verdicts only.

| Rung | Implementer | Reviewer |
|---|---|---|
| 1 | Retry once immediately (after the tree probe for a death) | Retry once |
| 2 | Retry-after-N — N = 3 min, one retry, **background** wait, announced | Same |
| 3 | Resume-by-message when context survives: message the worker; the contracted report is the terminating act; verify delivery per `leader.md` | A different model (`/model`) or the registry's cross-host dispatch |
| 4 | Fresh worker audits the partial diff and continues (brief carries the partial diff as starting state) | **Waiver = `REVIEW_WAIVED` record** — user stop; never inline without it |
| 5 | Existing Leader-inline ask — user stop; no-code rule stands | — |
| Tester | Unchanged pointer to the `/akili-test` Deployment Rule | |

Per attempt, `execution.md` records `runtime events: <kind> ×n → <rung that recovered>`.

**Mid-climb rule** *(T6 Pivot, 2026-09-19 — DD-12)*: the "Enters ladder at" column ships in the command as one *Entry rungs* sentence. A later event in the same attempt, of any kind, continues the climb from the rung already reached — or from its own entry rung when that is higher (the climb never moves backwards, and a death with a surviving context never detours through rung 2's fresh spawn); a spent rung is never re-run; a rung whose condition does not hold is skipped. One `runtime events:` line per attempt names every event and the single recovering rung.

### 5.5 `REVIEW_WAIVED` record (Execution Log Format)

```
## REVIEW_WAIVED: <Task ID>
| flag | inline · same-model · degraded-pair |
| cause | events and rungs exhausted, in order |
| approved by | the user (never the Leader alone) — message / time |
| verification that stood in | command · exit status · who ran it |
| models | Implementer / auditor (if any) |
```

| Flag | Property of the gate lost | Task entry Reviewer field | Consumers read it as |
|---|---|---|---|
| `inline` | No independent context | `WAIVED (inline)` | no exercised gate |
| `same-model` | Independent context, same weights | `WAIVED (same-model)` | no exercised gate |
| `degraded-pair` | Independent context, different weights, **below the registry's tier or outside it**; a PASS was issued and stands | `PASS (degraded-pair: <impl>/<rev>)` | exercised gate, noted |

Written by the Leader at close time, **before `[x]`**. Closability: PASS or `REVIEW_WAIVED` in `execution.md`, never neither. Under `pre-approved` the waiver is a stop.

### 5.6 HALT tree-state branches (Step 4 item 1)

| Tree state at HALT | Action | HALT block records |
|---|---|---|
| Clean (only the halted task's changes) | `git restore .` + `git clean -fd` — today's rule | "clean tree — blanket restore" |
| Holds other PASSed, uncommitted work | Pathspec = explicit file paths from the halted task's attempt entries' *files changed*; `git restore -- <paths>` (tracked), `git clean -f -- <paths>` (listed untracked); **never a directory glob** | the pathspec; post-restore `git status --porcelain` |
| Holds unattributed changes | Pathspec restore as above; unattributed paths **never restored**; escalate | the unattributed list under "not restored" |

Residual (stated in the command): a file the Implementer changed and did not report is outside the pathspec — visible in the post-restore status.

## 6. API Design

Not applicable. The contracts are text shapes consumed by string: the `STATUS:` first line, the `## REVIEW_WAIVED:` heading, the `[advisory-grade]` and `UNVERIFIED` markers, the `runtime events:` attempt line. All cited by name (KZ-005).

## 7. Backend Module Design — Surface Table and Consumer Walk

Sites by section, never by line (KZ-005). T-numbers assigned in `tasks.md`.

| # | File | Section | Change |
|---|---|---|---|
| 1 | `.claude/commands/akili-execute.md` | Step 2 preamble, *Runtime-failure fallback* paragraph + table | Event vocabulary (§5.4) **incl. the *Entry rungs* sentence and the mid-climb rule (DD-12, T6 Pivot)**; accounting rule sentence; Implementer row → five rungs; Reviewer row → four rungs, waiver **is** `REVIEW_WAIVED`; Tester row unchanged; idle-without-report row = pointer to `leader.md` |
| 2 | 〃 | Step 2 loop pseudocode | One branch after "receive Implementer report" / "receive Reviewer verdict": `on runtime event: recover per the runtime table; attempt unchanged` |
| 3 | 〃 | Step 2.2, after the "verification command (copied)" bullet | +1 bullet: copied `Falsifier` / `Red run` / `Consumers` with the absent-value line (hand-off) |
| 4 | 〃 | Step 2.2, new **Brief contract** block after the bullet list | Clauses (a)–(e) per §5.1, each with its falsifier; (d)'s two halves in one paragraph |
| 5 | 〃 | Step 2.3 item 2, diff bullet | "always inline, the one payload that can never become a pointer" → size rule (§5.2), scratchpad file, non-host exception |
| 6 | 〃 | Step 2.3 item 2, new bullet | Edits since last PASS as named checks; carried once by the next task; Pivot boundary sentence |
| 7 | 〃 | Step 2.3, "The Reviewer is read-only. It must conclude with…" | Becomes the **report contract** paragraph (§5.3): order, ceiling, overflow file, Structured Feedback relays both |
| 8 | 〃 | Step 2.4 *Maximum Retries* + *Budget Tripwire* | +1 clause each: attempts consumed only by FAIL / verification failure; review rounds = Reviewer verdicts |
| 9 | 〃 | Step 3 opening line | "Only after a Reviewer `PASS`" → "Only after a Reviewer `PASS` — or, when the Reviewer ladder was exhausted, after the `REVIEW_WAIVED` record is written —"; evidence-before-checkbox applies to both |
| 10 | 〃 | Step 4 item 1 | Three-branch table (§5.6); post-restore status; residual sentence |
| 11 | 〃 | Step 5 *Approval Mode* paragraph + `/goal` canonical condition | +1 stop: the waiver decision and the Leader-inline ask never auto-pass; condition reads "matching PASS or `REVIEW_WAIVED` evidence" |
| 12 | 〃 | Execution Log Format | Per-attempt `runtime events:` line; *decisions made* gains "execute-time spec edits (file + section + reason)"; final-status vocabulary `PASS / WAIVED (flag) / HALT / pivot`; new record type `## REVIEW_WAIVED` (§5.5) with the closability sentence |
| 13 | `.claude/templates/leader.md` | Delegation Discipline, new bullet after the spawn-mechanics bullet | Principle paragraph: narrow-never-widen, convention files by lookup, source-or-`UNVERIFIED`, advisory-grade (both halves), carry execute-time edits — "mechanics in `/akili-execute` 2.2–2.3; follow, do not re-derive" |
| 14 | 〃 | item 4 *Rework Loop*, first bullet | +"runtime events never consume an attempt (the command's runtime table is canonical)"; "HALT + Automatic Rollback after 3" → "HALT + rollback **by tree state** after 3" |
| 15 | `.claude/templates/reviewer.md` | Audit Checklist | +1 item: red run failed on the behavioral assertion; mutation traced through the fixture; skipped-and-said when `Red run` is absent / `n/a` (hand-off) |
| 16 | 〃 | 4R section | +1 clause: a brief item tagged `[advisory-grade]` is audited in `ADVISORY` only |
| 17 | 〃 | Item 5 mode table | +1 note under the table: a diff delivered as a file path is `Read` first, then sized |
| 18 | 〃 | Structured Review Output, lead paragraph | Report contract: `STATUS:` is the first line of the returned message, order, ~600-word ceiling, overflow file |
| 19 | `.claude/commands/akili-resume.md` | Step 1 *Last Action* / *Blocked* | +1 clause: a `## REVIEW_WAIVED` block is a closed task's last action, reported with its flag; not a *Blocked* item |
| 20 | `.claude/skills/kaizen/SKILL.md` | Measure table; clean-run sentence; Metrics example | +1 row *Tasks closed under `REVIEW_WAIVED` (by flag)*; clean-run adds "and no `inline` / `same-model` waiver"; example row |
| 21 | `.claude/commands/akili-archive.md` | Step 4.1 | +1 phrase in the signal list |
| 22 | `docs/commands/akili-execute.md` | Per-task loop; Reviewer output contract; Outputs; Guardrails | Summary-level parity with rows 1–12 |
| 23 | `docs/flow.md`, `README.md`, `docs/skills/kaizen.md` | Only sentences the FR-9 grep turns false | Expected none (loop diagrams show the happy path; README's Git cell still true); any hit enumerated |
| 24 | `CHANGELOG.md` | Unreleased | Added / Changed; classification per user (patch proposed) |

**Consumer walk A — runtime-event kinds through every existing consumer step:**

| Consumer step | Outcome |
|---|---|
| Runtime-failure table (Step 2 preamble) | **changes** — rows 1 |
| Loop pseudocode | **changes** — row 2 |
| 2.4 *Maximum Retries* | **changes** — attempt clause (row 8) |
| 2.4 *Budget Tripwire* (review rounds) | **changes** — verdicts-only clause (row 8) |
| 2.4 *Escalation on HALT*, *Fail-Fast*, *Pivot Detection*, *Structured Feedback*, *Advisory* rules | **hold** — HALT is three FAILs; events do not reach it |
| 2.4 *Wind Down* / `leader.md` *Winding down* | **holds** — a retry-after-N wait is the background wait it already mandates; cited |
| `leader.md` idle-without-report protocol | **holds** — the table points at it; nothing restated (KZ-003, KZ-005) |
| `leader.md` item 4 | **changes** — row 14 |
| Execution Log Format per-attempt fields | **changes** — row 12 |
| Step 5 *Approval Mode* | **changes** — the two user stops (row 11) |
| Step 5 `/goal` condition, "a question is pending" clause | **holds** for the stops; **changes** for the PASS clause (row 11) |
| `docs/flow.md` Multi-Spec escalation rule (HALT / Pivot / tripwire) | **holds** — a child's waiver or inline ask is a pending question the child stops on; the coordinator's "exceptions reach the human" rule already covers it |
| `/akili-test` Tester row | **holds** — non-goal, pointer unchanged |
| Error Handling "verification fails inside the Implementer ⇒ implicit FAIL" | **holds** — that is the one non-Reviewer way an attempt is consumed; the accounting rule names it |

**Consumer walk B — `REVIEW_WAIVED` record and flags through every reader of `execution.md`:**

| Consumer | Outcome |
|---|---|
| Execution Log Format | **changes** — row 12 |
| Step 3 *Finalize on PASS* (opening line; evidence-before-checkbox table) | **changes** — row 9; the table's two orders apply to the waiver identically |
| Step 2.3 item 0 (`Not Done / Assumptions` blocks `[x]` even on PASS) | **holds** — applies to a waiver; stated in row 12's closability sentence |
| Step 5 `/goal` canonical condition | **changes** — row 11 (a waived task would otherwise never satisfy "matching PASS evidence") |
| Step 8F tasks-gate hook (not owned) | **holds by non-goal; interaction recorded** — file-level `grep -q "PASS"`; a first-task waiver in a fresh `execution.md` is blocked and stays `[~]` (DD-7) |
| `/akili-resume` Step 1 | **changes** — row 19 |
| `/akili-resume` Step 3 *Execution Trail* (last 3 entries) | **holds** — the block is an entry |
| kaizen Measure table | **changes** — row 20 |
| kaizen clean-run predicate | **changes** — row 20 (a waived run would read as clean today — the walk's load-bearing find) |
| kaizen severity rule | **holds** — a waiver is a signal, not a lesson severity |
| `/akili-archive` Step 4.1 | **changes** — row 21 |
| `/akili-archive` Step 2 *Files Changed Summary*, Step 6 item 7 Kaizen summary | **hold** — metrics captured by reference |
| `/akili-validate` | **holds** — reads `## Constitution Impact` and `ADVISORY` only |
| `/akili-test` (cites red→green files from task entries) | **holds** |
| `docs/commands/akili-execute.md` Outputs (final status) | **changes** — row 22 |

**Consumer walk C — brief markers (`[advisory-grade]`, `UNVERIFIED`, convention list, copied fields):**

| Consumer | Outcome |
|---|---|
| Reviewer 4R / *Advisory Never Gates* | **changes** — row 16 (the tag routes to the tier the rule already defines) |
| `implementer.md` (not owned) | **holds** — the `UNVERIFIED` marker carries its own instruction ("confirm at source before relying on it"); the persona's verbatim-at-source rule already covers it |
| `leader.md` non-host self-contained brief | **holds** — the contract governs content, not delivery form |
| Pivot Protocol step 4 (re-issue briefs after a Pivot) | **holds** — cited as the sibling of the edit-carry rule; boundary stated |
| `/akili-specify` Correction Closure | **holds** — a Pivot's sweep; an edit-carry is below that threshold |

## 8. Frontend / UX Component Architecture

Not applicable.

## 9. Shared Contracts

| Contract | Before | After |
|---|---|---|
| Implementer brief | content list | content list + five-clause contract (§5.1) |
| Reviewer brief diff | always inline | ≤ 300 lines inline; else scratchpad file + `Read`; non-host inline |
| Reviewer report | three statuses, no order or length | `STATUS:` first, fixed order, ~600 words, overflow by file |
| Runtime-failure table | 3 rows, "retry once then degrade" | event vocabulary + accounting rule + per-role ladders |
| Attempt | implicit | consumed by FAIL / verification failure only |
| `execution.md` record types | task entry · `## Constitution Impact` · `## Pivot Record` · `## HALT` | + `## REVIEW_WAIVED` |
| Task final status | PASS / HALT / pivot | PASS / `WAIVED (flag)` / HALT / pivot |
| HALT rollback | blanket | three tree-state branches |
| `/goal` condition | PASS evidence | PASS or `REVIEW_WAIVED` evidence |

## 10. Design Decisions

### DD-1 — Command owns the mechanics; personas restate the principle (proposal Option B)
`leader.md` already says the spawn mechanics "are defined operationally in `/akili-execute` Steps 2.2–2.3 … follow it, do not re-derive it". Every new rule follows that division: one paragraph of principle in the persona, the executable text in the command. Rejected: persona-only (goes stale in deployed `.agents/`; cannot touch Step 4 or the log format) and a hook (Claude-Code-only, installer scope, ten entries of evidence — proportionate first step is text). KZ-005: every cross-reference by section name.

### DD-2 — The convention-file rule names a lookup, not a search (NFR-6)
"Name every convention file" is unbounded as written; the proposal's risk table flagged it. The rule is two steps with one listing per level and a scout beyond the Delegation Thresholds, and its falsifier is the one the corpus paid for four times (a folder `CLAUDE.md` unnamed). An empty result is a stated line (KZ-004), never an omission.

### DD-3 — Diff by size, file outside the tree, non-host exception (reverts "always inline" — challenged, §11)
The Reviewer keeps `Read`; only `Bash` is withheld, so a path is resolvable and the "never a pointer" reason ("cannot regenerate it") is answered by the Leader writing the file it extracted. 300 lines matches the mode table's unit and the field switch point. The file lives in the session scratchpad so it never enters `git status`, a later diff, or a HALT pathspec. **Challenge outcome:** the rule breaks a non-host Reviewer (cross-host dispatch cannot resolve project or scratchpad paths) — closed by keeping inline at any size for non-host workers, the exception Step 2.2 already names.

### DD-4 — `STATUS:` first is stated as a message-order rule, not a template change
`reviewer.md`'s option blocks already begin with `STATUS:`; the corpus loss came from prose before the block. So the rule is about the **returned message's first line**, stated in the command and where the options are defined, plus the ceiling and overflow file. This repo's own 2026-09-17 run applied it de facto (11 verdicts intact) — the spec writes down a rule already running.

### DD-5 — One accounting rule, stated once, cited twice (KZ-004, KZ-003)
"Does a dead attempt count?" is answered by a single sentence in the table (attempts = FAIL or verification failure, nothing else) and cited in 2.4 and `leader.md` item 4. The event enumeration closes with its **non-events** so a reader cannot file a Pivot stop or a stack outage under the ladder. Idle-without-report stays in `leader.md`: the table points, never restates (KZ-001 — the poke and replace mechanics were read past Delegation Discipline before this design, and reuse them). Retry-after-N reuses the background-wait rule already in *Winding down*.

### DD-6 — Rollback branches on tree state; pathspec from attempt entries; unattributed paths untouched (reverts the blanket restore — challenged, §11)
The attempt entries' *files changed* lines are the only record that can tell the halted task's files from a sibling PASSed task's — `git status` cannot. **Challenge outcome:** two real breakages named and closed: `git clean -fd -- <dir>` on a directory pathspec would delete other tasks' untracked files in the same folder ⇒ explicit file paths, never globs, and `git clean -f` only on listed untracked paths; and changes no entry accounts for (another session, the user) would be either destroyed or silently kept ⇒ a third named branch that never restores them and escalates. The clean-tree case keeps today's blanket restore byte-identical.

### DD-7 — `REVIEW_WAIVED` is a record with a flag taxonomy; the hook interaction is recorded, not fixed (NFR-5)
Three flags name *which property of the gate was lost*, so kaizen can count `inline` / `same-model` as "no exercised gate" and `degraded-pair` as a noted PASS — the metric answers the question the corpus could not. The Step 8F hook greps `PASS` file-wide: a waived first task in a fresh `execution.md` stays `[~]`; the rule "never work around the hook" binds, and extending the hook is out of scope. Rejected: wording the record to satisfy the hook — laundering.

### DD-8 — Consumers gain one clause each, inside this spec (proposal §7, success criterion 4)
The walk in §7 found one load-bearing consumer defect: the kaizen clean-run predicate would file a waived run as clean — the exact misreading the record exists to prevent. The proposal's §5 scope table omitted these files while §7 and §13.4 required them; this design resolves toward §13.4 with a one-clause bound per file (NFR-1) and flags the call for the user. Rejected: a follow-up spec (ships the record with the misreading live).

### DD-9 — Waiver and inline ask are stops under `pre-approved` (open question 1)
Both remove or replace the correctness gate; `AGENTS.md` already lists exceptions pre-approval never covers. The `/goal` condition's "question pending" clause already holds the loop, so no new mechanism is needed — only the stop stated (KZ-changes--kaizen-loop-closure-1: the existing `pre-approved` step walked against the new outcome).

### DD-10 — Execute-time edit carry sits beside the Pivot rule with a stated boundary
KZ-changes--model-routing-cost-rebaseline-2 covers the Pivot; the frequent case is smaller. The boundary is meaning: a clarification is carried as a Reviewer check for two tasks and recorded in *decisions made*; a meaning change is a Pivot and stops the loop. Without the boundary sentence, a Leader could carry a Pivot as an "edit" and skip the sign-off.

### DD-11 — Rules by class; corpus names in parentheticals (NFR-4)
The evidence project's stack, harness, and file names appear only inside `(...)` as examples. The FR-9 framework grep is the gate.

### DD-12 — Entry rungs ship with the ladder; a mid-climb event continues the climb *(added by the T6 Pivot, 2026-09-19)*
T6's closure walkthrough found Case 2 undecidable: §5.4's "Enters ladder at" column and FR-4's terminal-branches paragraph never reached the command (T2 under-delivery), and nothing approved said whether a second event of a different kind re-enters the ladder or continues it (spec gap). The user chose **continue the climb** (2026-09-19): it bounds the ladder per attempt (at most rungs 1, 2, 4 of spawning, then the user stop), needs no re-entry cap, and keeps one recovering rung per attempt line. Rejected: re-entry by kind — unbounded on a flapping host without a new counter. Consequence, accepted with the decision: T6 Case 2's expected outcome, written before the rule existed, was not derivable from either reading (rung 2's one retry is spent when the pane timeout arrives); it is amended to `→ fresh worker` (rung 4).

## 11. Reversion Challenge (Step 2.3) — outcomes

| DD | Reverted behavior | Question asked | Answer | Closed by |
|---|---|---|---|---|
| DD-3 | "git diff — always inline, the one payload that can never become a pointer" | *What does removing "always inline" break?* | A **non-host** Reviewer (cross-host dispatch) cannot resolve a path — the file rule breaks it silently; a file inside the working tree would pollute `git status`, later diffs, and a HALT pathspec | Non-host ⇒ inline at any size; file in the scratchpad, written from the Leader's own extraction |
| DD-6 | Unconditional `git restore .` + `git clean -fd` | *What does removing the blanket restore break?* | (i) a directory pathspec under `git clean -fd` deletes sibling tasks' untracked files; (ii) unattributed changes have no branch — destroyed or silently kept | Explicit file paths only, `git clean -f` on listed paths; third branch "unattributed — never restored, escalate"; clean tree keeps today's rule |
| DD-4, DD-5, DD-10 | — | not triggered: additions or made-explicit rules, nothing removed | — | recorded, not skipped |

## 12. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Metric | Expected |
|---|---|
| Tasks | **6** |
| Changed/added lines | **~210** across 24 surface rows (prose; no code) — `akili-execute.md` ~125, `leader.md` ~10, `reviewer.md` ~20, three consumers ~8, `docs/commands` mirror ~30, flow/README ~0–4, CHANGELOG ~12 |
| Review rounds | **1 per task** — trip on the second FAIL of any one task. *(T6 Pivot, 2026-09-19: T2 re-opened for one owed clause and T6 re-run for Cases 2–3 — one extra round each, approved by the user; tasks stay at 6)* |

Depth re-check: **Standard holds.** Twenty-four surface rows, one new record type with three readers, and two reverting DDs is not Lite; no data, API, or auth surface pushes it to Full. The predecessor of the same shape (`changes/kaizen-loop-closure`) shipped 28 rows at ~236 lines in 7 tasks.
