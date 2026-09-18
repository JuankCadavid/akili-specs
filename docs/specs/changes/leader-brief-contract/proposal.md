# Proposal — Leader Brief Contract

**Recommendation:** make the four texts the `/akili-execute` triad runs on — the Implementer brief, the Reviewer brief, the Reviewer report, and the `execution.md` record — carry explicit contracts, and treat a runtime or quota failure as a first-class loop event instead of an anomaly the Leader improvises around. Measured on one consuming project (104 kaizen entries, 2026-08-26 → 2026-09-16), the largest single class of Reviewer rework traces to **brief content, not Implementer error**; six of eleven verdicts in one run needed a re-send because the harness cut the report before its `STATUS:` line; 21 entries record a worker killed by a provider limit, ten record tasks closed by a Leader-inline audit, and no record type exists that distinguishes "0 FAILs from an exercised gate" from "0 FAILs because no gate ran". The HALT rollback (`git restore . && git clean -fd`) would have destroyed nine PASSed, uncommitted tasks the one time it was literally due.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/leader-brief-contract` |
| Slug | `leader-brief-contract` — given as the argument |
| Type | **Change** |
| Approval Mode | `gated` |
| Depends on | none |
| Parallel-safe | **yes** — no file overlap with `changes/gate-falsifiability`, which owns `/akili-specify` Step 3.2, the `tdd` skill, and the task template (`docs/specs/general-setup/task.md`). This spec owns `/akili-execute`, `.claude/templates/leader.md`, `.claude/templates/reviewer.md`, and their `docs/` mirrors |
| Cross-spec hand-off | One Reviewer audit-checklist item (Scope row *reviewer.md — red-run / mutation trace*) is delivered **here** on behalf of `changes/gate-falsifiability`, which must not touch `reviewer.md`. Recorded so both specs stay parallel-safe; `gate-falsifiability` cites this spec for that item instead of editing the file |
| Date | 2026-09-18 |
| Author | /akili-propose (T1, session model `claude-fable-5-1`) |
| Release Classification | **proposed patch** — no new command, target, or artifact file; new `execution.md` record type and brief/report rules inside existing commands and personas. User may reclassify at specify time |
| Status | Draft — awaiting approval |

## 2. Intent

Make every text the Leader hands a worker — and every text a worker hands back — a contract with a known shape and known limits, so that a rework round is spent on a defect in the code, never on a defect in the brief, a report the Leader could not read, or a gate that silently did not run.

`/akili-execute` already defines the loop (3 attempts, `author ≠ auditor`, evidence-before-checkbox) and a per-role **runtime-failure fallback** table (Step 2 preamble: retry once, then degrade by role; Reviewer never inline). This spec **extends** those — it does not replace the loop, the ceiling, or the fallback table.

## 3. Problem / Current Behavior

### 3.1 Evidence — one consuming project, 104 kaizen entries

Source: `docs/specs/kaizen/` of the `onecgiar_pr` project (worktree `qa-development-2026`), read 2026-09-18. Counts are files matching the named grep; entries cited by file name.

| Finding | Files | Cited entries |
|---|---|---|
| Brief **widened** the task or **omitted** a governing convention file → Reviewer FAIL | 4 (`widen`) · 12 (`convention`) | `changes--aow-identity-column-starvation.md` (KZ-AIS-1: *"three of the run's three rework rounds trace to brief content"* — one fallback the task lacked, one unnamed `COMPONENT-DOCS.md` cap) · `bugfix--reporting-table-actions-clipped.md` (**4th recorded recurrence**, ≥5 specs, ≥2 doc files: 2 of 3 rounds on the sha stamp + 120-line cap, the CSS fix untouched) · `bugfix--emerging-contribution-not-required.md`, `bugfix--phase-filter-missing-phases-prod.md`, `bugfix--toc-hlo-outcome-locked.md` (one rework each, every one a folder-`CLAUDE.md` convention the brief never named) |
| Brief **asserted** an infrastructure fact with no source → Reviewer FAIL | 1 | `changes--cognito-email-otp-login.md` (KZ-OTP-3: two FAILs from Leader-asserted env-var / API-key semantics; P4 asks for `file:line` or `UNVERIFIED`) |
| **Leader-added items** invited FAILs; **execute-time spec edits** reached no Reviewer | 3 | `bilateral--center-overview-tab.md` (KZ-COV-2: a `design.md` clarification written at spawn time surfaced its own gap only through a volunteered advisory; T-5 round-2 FAIL on a Leader-added test item, adjudicated non-spec — *"briefs should mark Leader-added items as advisory-grade explicitly"*) · `changes--reporting-entry-hub.md` (2 amendments during execution, Leader-adjudicated) · `changes--reporting-favorite-indicators.md` (1 design clarification during execution) |
| Reviewer report **truncated** by the harness result cap | 4 (`truncat`) | `bugfix--kpi-count-reconciliation.md` (KZ-KCR-1: T-1 lost `ADVISORY`, T-2 lost `STATUS`; briefs asking `STATUS` first + ≤600–700 words were never cut) · `changes--sp-shell-app-viewport.md` (**6 of 11 verdicts** needed a re-send) · `changes--indicator-reported-results.md` (did not recur once every brief carried the rule) · `bilateral--center-overview-tab.md` (Reviewer pointed at a scratchpad diff file on every round > 300 lines — *"candidate tweak to §2.3's 'always inline' wording"*) |
| Worker **killed by a provider / session limit** or **spawn failure** | 21 (`limit|429|quota`) · 18 (`spawn`) | `changes--mass-reporting-flow.md` (3 deaths; degraded pair opus/Fable kept `author ≠ auditor`) · `bilateral--center-overview-tab.md` (4 deaths, two quotas in one run, rotation) · `changes--cognito-email-otp-login.md` (4 deaths on HTTP 429; one same-model Reviewer waiver) · `changes--indicator-reported-results.md` (**7 spawn failures**, pane timeouts; *"the escalation menu could carry a 'retry after N minutes' default, since the runtime recovered on its own"*) · `bugfix--kpi-count-reconciliation.md` (spawn died before its first tool call; retry on another model worked) |
| **Resume by message** with the worker's context intact | 3 (`SendMessage`) | `changes--reporting-favorite-indicators.md` (killed mid-T-2, resumed via `SendMessage`, no work redone) · `changes--overview-aow-progress-hero.md` (2 drops resumed in place — *"3rd spec in a row where the resume pattern held"*) · `changes--overview-chart-view-toggle.md` (briefs must name the return channel) |
| Tasks closed **without an independent Reviewer**, reported as **0 FAILs** | 10 (`Leader-inline`) · 2 (`waiver`) · 0 (`REVIEW_WAIVED`) | `changes--emerging-result-cta-placement.md` (T-3..T-5 ran with no Reviewer after a quota block; Metrics row reads *"Reviewer FAIL rework attempts: 0"*) · `changes--my-work-editing-reorder.md` (*"0 (Leader spec audit substitute; no FAIL)"*) · `bilateral--manual-create-drawer.md` (7/7 tasks Leader-inline audits — *"author ≠ auditor was not enforced by model"*) · `bilateral--shell-sp-alignment.md`, `bilateral--ai-drafts-redesign.md`, `bilateral--result-rail-alignment.md`, `bugfix--bilateral-w3-editing-route.md`, `changes--kp-cgspace-browse.md`, `changes--sp-guided-tour-driverjs.md`, `bugfix--w12-overview-phase-origin-alignment.md` (owner-waived review, *"recorded, not silent"*) |
| HALT **rollback** would destroy other PASSed uncommitted work | 3 (`rollback`) | `changes--unsaved-changes-alert.md` (KZ-UCA-2: literal rollback would have deleted **9 PASSed tasks**; Leader deviated under time pressure; P2 targets `/akili-execute` Step 4) · `changes--result-sidebar-collapse-mobile.md` (same condition; rollback skipped, judged "no gap" — i.e. the deviation is now the norm) · `bugfix--reporting-table-actions-clipped.md` (near-miss: a claimed FAIL that was never produced; rollback averted only by re-checking the verdict existed) |
| Attempt **not consumed** when the failure was not a fix failure — already practiced, not written | 2 | `bugfix--reporting-table-actions-clipped.md` (Pivot-Detection block *"correctly routed … rather than burned as a failed attempt"*) · `changes--result-sidebar-collapse-mobile.md` (backend outage *"distinguished from a fix failure rather than counted against the attempt budget"*) |

### 3.2 Mechanisms, and where each lives today

| # | Mechanism | Surface today | Gap |
|---|---|---|---|
| 1 | **The brief is law to the worker.** Whatever the Leader adds (a fallback, an "honest alternative") or drops (a folder-guide cap) is executed faithfully — into a FAIL. | `/akili-execute` 2.2 lists brief *contents*; `leader.md` Delegation Discipline covers skills/effort. Neither bounds what a brief may add or requires the convention files to be named. `AGENTS.md`'s *Scope only grows through approval* binds advisories, not briefs. | No narrow-never-widen rule; no convention-file enumeration; no source/`UNVERIFIED` rule for asserted facts. |
| 2 | **Execute-time spec edits are unreviewed spec text.** A Leader clarification in `design.md` is what the Reviewer conforms *to*, so it can never fail it. | Pivot Protocol step 4 re-issues briefs after a Pivot (KZ-changes--model-routing-cost-rebaseline-2, **Applied**). Nothing covers the smaller, far more frequent in-place clarification. | No rule carrying Leader edits since the last PASS into the Reviewer brief as checks; no advisory-grade marking of Leader-added items. |
| 3 | **The harness caps a worker's returned result; the persona puts `STATUS:` last.** | `reviewer.md` orders *audit → adjudication → STATUS → ADVISORY*; `/akili-execute` 2.3 fixes the three statuses but no order or length; 2.3 also says the diff is "always inline, the one payload that can never become a pointer". | Verdict lost first; large diffs cost output tokens the Reviewer's `Read` tool makes unnecessary. |
| 4 | **Quota death is neither a FAIL nor a runtime failure the table anticipates.** The table covers "the harness cannot spawn" (retry once → degrade by role). A worker killed mid-task on 429, a pane timeout that clears itself in minutes, and a worker whose context survives are three different events with three different cheapest recoveries. | `/akili-execute` Step 2 preamble table; `leader.md` idle-without-report protocol (KZ-003) — which is about *idle*, not *dead*. | Attempt accounting undefined (does a dead attempt count?); no resume-by-message recipe; no retry-after-N before the Leader-inline ask; no record when a task closes without an independent Reviewer. |
| 5 | **"0 FAILs" cannot be read.** A run with no Reviewer produces the same metrics row as a run whose Reviewer passed everything. | Execution Log Format lists what each task entry records; there is no waiver record type. `REVIEW_WAIVED` appears in 0 of 104 corpus files. | Kaizen Measure step, `/akili-resume`, and `/akili-archive` all consume a number that means two things. |
| 6 | **Step 4 rollback assumes per-task commits.** Under a no-auto-commit preference or a multi-task wave, the tree holds other PASSed work. | Step 4 item 1: `git restore .` + `git clean -fd`. | No branch on tree state; no pathspec scoping. Field practice already deviates (2 of 3 cases). |

### 3.3 What already works, in the field and in this repo

- The **2026-09-17 run of `changes/kaizen-loop-closure`** in this repository applied (b) de facto: its `execution.md` Document Control carries *"Reports open with `STATUS:` and stay under ~600 words"* and all **11 Reviewer verdicts landed intact, zero re-sends**. This spec writes down a rule this repo already runs on.
- The **runtime-failure fallback table** in `/akili-execute` Step 2 is the right shape (per-role, never improvise). This spec adds rows and precision to it; it does not replace it.
- **Attempt-not-consumed** and **rollback-skipped** are already the Leader's judgment calls in three entries. This spec makes them the written rule so the next Leader does not have to deviate under pressure.

## 4. Proposed Outcome

1. **A brief may narrow a task but never widen it.** It adds no fallback, option, or alternative the task text lacks; it names every convention file governing the target (folder-guide caps, payload contracts, style rules); every infrastructure or third-party fact it states cites a source the worker can read or carries `UNVERIFIED`; anything the Leader adds beyond the task text is marked **advisory-grade** so a Reviewer cannot FAIL on it.
2. **Execute-time spec edits reach the Reviewer as checks.** If the Leader edited `requirements.md` / `design.md` since the previous PASS, the Reviewer brief lists the edited sections as explicit conformance checks; the next task's Reviewer re-checks them once.
3. **A Reviewer report has a fixed order and a ceiling:** `STATUS:` first, then summary, issues, `ADVISORY`; ≤ ~600 words. A diff above a stated size is written to a file the Reviewer `Read`s, pointed at by path; small diffs stay inline.
4. **Runtime and quota events are first-class:** a spawn failure or provider-limit death **never consumes a rework attempt**; the Leader first tries **resume-by-message** when the worker's context survives; a **retry-after-N** default precedes any Leader-inline ask; every task that closes without an independent Reviewer writes a **`REVIEW_WAIVED`** record (flag: `inline` / `same-model` / `degraded-pair`) into `execution.md`, so "0 FAILs" is never read as an exercised gate.
5. **HALT rollback is scoped** to the halted task's pathspec whenever the working tree holds other PASSed, uncommitted work; the blanket `git restore .` remains the rule for a clean tree.

## 5. Scope

| Surface | Change |
|---|---|
| `.claude/commands/akili-execute.md` — Step 2.2 | **Brief contract** block: narrow-never-widen; convention-file enumeration (with the check that produces it — the target's folder guide chain and the constitution's `## Module Guides`); source-or-`UNVERIFIED` for asserted facts; Leader-added items tagged advisory-grade |
| `.claude/commands/akili-execute.md` — Step 2.3 | **Reviewer brief**: execute-time spec edits since the last PASS listed as explicit checks; diff-delivery rule amended (inline below a size threshold, file path + `Read` above it — the "never a pointer" sentence is narrowed, not removed, because the wrapper-restricted Reviewer keeps `Read`). **Reviewer report contract**: `STATUS:` first, order, ~600-word ceiling |
| `.claude/commands/akili-execute.md` — Step 2 runtime-failure table + 2.4 | Table gains the event vocabulary (spawn failure · provider-limit death · pane timeout · idle-without-report, pointing at `leader.md` for the last) and the rule *runtime event ≠ attempt*; a **retry-after-N** default row before the Implementer's Leader-inline ask; **resume-by-message** recipe (probe the tree for partial edits → `SendMessage` the worker with the contracted report as the terminating act → fresh worker audits the partial diff only if the context is gone); `REVIEW_WAIVED` as the recorded outcome of the Reviewer row's waiver option |
| `.claude/commands/akili-execute.md` — Step 4 | Rollback branches on tree state: clean tree → today's blanket restore; tree holds other PASSed uncommitted work → `git restore -- <pathspec>` / `git clean -fd -- <pathspec>` scoped to the halted task's files as recorded in its attempt entries, and the HALT block names the pathspec used |
| `.claude/commands/akili-execute.md` — Execution Log Format | New record type `## REVIEW_WAIVED: <Task ID>` with `flag`, cause, who approved, and what verification stood in; the per-task entry's Reviewer field may read `WAIVED (flag)`; runtime events logged per attempt |
| `.claude/templates/leader.md` — Delegation Discipline | One paragraph mirroring the brief contract (narrow-never-widen, convention files, advisory-grade, carry execute-time edits) — the persona statement; the operational text stays in the command, per the file's existing division |
| `.claude/templates/reviewer.md` — Structured Review Output | Report order and ceiling restated where the three options are defined; the ≤ 50 LOC / 50–200 / > 200 table gains the diff-delivery note |
| `.claude/templates/reviewer.md` — Audit Checklist (**hand-off from `changes/gate-falsifiability`**) | One item: *verify the recorded red run failed on the behavioral assertion, and trace the named mutation through the fixture — a test **named** after a mutation is not evidence it exercises it* (evidence: `changes--reporting-favorite-indicators.md` KZ-3 — AC-8 pinned every row so pre/post sets coincided; `changes--toc-center-guard.md` KZ-2 — one "Other" center made the correct and the naive formula numerically identical). Delivered here because that spec owns no Reviewer surface |
| `docs/commands/akili-execute.md` | Summary-level mirror of the four Step changes |
| `docs/flow.md`, `README.md` | The one-line mentions of HALT rollback and the triad's report contract, where they exist (grep at specify — KZ-002) |
| `CHANGELOG.md` | `Unreleased` entry |

## 6. Non-Goals

- **No gate or test-falsifiability rules** beyond the single hand-off item above — recorded red runs, fixture divergence, Consumer Sweep, rendered-measurement checklist belong to `changes/gate-falsifiability` (`/akili-specify` Step 3.2, `tdd`, task template).
- **No HITL row schema, capability probe, or first-UI-task look** — `changes/hitl-row-schema`.
- **No budget, LOC, review-round, or worktree-concurrency rules** — `changes/budget-and-concurrency`. This spec's pathspec rollback is a HALT rule, not a commit-discipline rule.
- **No installer, hook, or CI change.** `REVIEW_WAIVED` is a text record; the Step 8F tasks-gate hook is not extended to check it.
- **No model-budget or quota-forecasting rule** ("model budget per spec", noted in `changes--cognito-email-otp-login.md`) — the event handling here is reactive by design.
- **No change to the 3-attempt ceiling, `FATAL_FAIL`, the Pivot Protocol, the Delegation Ceiling, or the idle-without-report protocol (KZ-003)** — this spec references them and adds the missing event class beside them.
- **No `/akili-test` changes.** The Tester row of the runtime table already points at the Deployment Rule; whether a `TEST_WAIVED` twin is wanted is a later decision.

## 7. Affected Users, Systems, And Specs

- **Users:** every Leader running `/akili-execute`, on every host. Reviewer report order affects Claude Code, OpenCode, Codex, and Antigravity equally; the resume-by-message recipe is written host-neutrally (the harness's message primitive, `SendMessage` in Claude Code) and degrades to "fresh worker audits the partial diff" where none exists.
- **Systems:** `/akili-execute` and the two personas; `/akili-resume` and the `kaizen` skill's Measure step **read** the new record type (each gains one enumerated branch, KZ-004 — a `REVIEW_WAIVED` block must land in a named case of every `execution.md` scan, never fall through as an unknown heading). `/akili-archive`'s Kaizen Metrics row *Reviewer FAIL rework* gains the waived count beside it.
- **Specs:** `changes/gate-falsifiability` (parallel; hand-off recorded above). `changes/scoped-constitution-reads` (proposal only) touches `implementer.md` / `tester.md` / `/akili-execute` Step 0 read order — disjoint sections of the same command file; serialize the merge, not the work. `changes/kaizen-loop-closure` (archived 2026-09-18) is the predecessor that made Methodology lessons reach this repo; this spec closes eight of them (`AIS-1`, `RTA` digest #3, `COV-2`, `KCR-1`, `OTP-3`, `UCA-2`, `MRF` P4 family, `IRR` retry-after note).
- **Consuming projects:** personas are copied to `.agents/` by `/akili-constitution`; already-scaffolded projects pick the change up on their next `--force` install or by hand. Old `execution.md` files without `REVIEW_WAIVED` are read as "no waiver recorded", which is the honest state.

## 8. Visual Reference

- Source: **None**
- Location: n/a
- Notes: methodology prose change; no UI surface.

## 9. Requirement Delta Preview

### ADDED Requirements

- **Brief contract** (Step 2.2 + `leader.md`): narrow-never-widen; convention-file enumeration with the lookup that produces the list; source-or-`UNVERIFIED` on asserted facts; Leader-added items marked advisory-grade.
- **Execute-time edit carry** (Step 2.3): Leader edits to `requirements.md` / `design.md` since the last PASS become named Reviewer checks; re-checked once by the next task's Reviewer.
- **Reviewer report contract** (Step 2.3 + `reviewer.md`): `STATUS:` first; order; ~600-word ceiling; diff by file above a size threshold.
- **Runtime event class** (Step 2 table + 2.4): spawn failure / provider-limit death / pane timeout never consume an attempt; retry-after-N default; resume-by-message recipe; fresh-worker partial-diff audit as the fallback.
- **`REVIEW_WAIVED` record** (Execution Log Format): flags `inline` / `same-model` / `degraded-pair`; mandatory whenever a task reaches `[x]` without an independent Reviewer on a different model.
- **Reviewer audit item** (hand-off): red run failed on the behavioral assertion; mutation traced through the fixture.

### MODIFIED Requirements

- Step 2.3 *"the git diff — always inline, the one payload that can never become a pointer"* → inline below a threshold; above it, a file the Reviewer `Read`s (the Reviewer keeps `Read`; only `Bash` is withheld).
- Step 4 item 1 *"Run `git restore .` and `git clean -fd`"* → branch on tree state; scoped pathspec when other PASSed work is uncommitted.
- Runtime-failure table Implementer row *"retry once, then ask the user to approve Leader-inline"* → retry once → retry-after-N → resume-by-message if context survives → then the Leader-inline ask. Reviewer row's *"explicit recorded waiver"* → the waiver **is** a `REVIEW_WAIVED` record.
- `reviewer.md` output order → `STATUS:` first (today the persona's prose order puts it after the audit detail).

### REMOVED Requirements

- None. The blanket rollback, the inline diff, and the current fallback rows survive as the clean-tree / small-diff / first-retry cases of the new rules.

## 10. Approach Options

| | Option | Trade-off |
|---|---|---|
| **A** | **Persona-only: put every rule in `leader.md` / `reviewer.md`, leave `/akili-execute` untouched** | Smallest diff, but the personas are copied into projects at constitution time and go stale; the command is what every session re-reads. The corpus's two direct upstream requests (`AIS-1` P1, `COV-2` P2) both name `/akili-execute` §2.2/§2.3 as the target for exactly this reason. Also cannot change Step 4 or the log format, which are command-owned. Rejected. |
| **B** | **Command owns the operational text; personas restate the principle; log format gains `REVIEW_WAIVED`; runtime table extended in place** ✅ | Matches the file's existing division (`leader.md` Delegation Discipline: *"spawn mechanics … are defined operationally in `/akili-execute` Steps 2.2–2.3 … follow it, do not re-derive it"*). One record type, one table extended, four Step edits, two persona paragraphs. Every rule lands where the Leader reads it at the moment it applies. |
| **C** | **B plus enforcement: a Step 8F-style hook that blocks `[x]` unless `execution.md` holds either a PASS or a `REVIEW_WAIVED` for the task; a diff-size check that auto-writes the diff file** | Makes the waiver machine-checkable and closes the "0 FAILs" reading by construction. But it is Claude-Code-only, touches the installer and the constitution's hook step (out of scope here and in the fleet plan), and the evidence base for *waiver-without-record* is 10 entries under quota pressure — a text rule the Leader must write to close a task is the proportionate first step. Defer; revisit if `REVIEW_WAIVED` is skipped in the field. |

## 11. Recommended Approach

**Option B.** It is the smallest change that puts each rule at its point of use, respects the division the personas already declare, and adds exactly one new artifact type (`REVIEW_WAIVED`) that three readers (`/akili-resume`, `kaizen` Measure, `/akili-archive` Metrics) can consume with one enumerated branch each. The failure mode is safe in every direction: a Leader that ignores the brief contract is where it is today; a report that overruns 600 words is where it is today; a tree with no other PASSed work rolls back exactly as it does today.

Two design constraints for specify:

- **Attempt accounting must be stated as a rule, not an example.** *An attempt is consumed by a Reviewer `FAIL` or an Implementer-reported verification failure, and by nothing else.* Runtime death, pane timeout, idle-without-report, Pivot-Detection block, environment outage — none of them count. The corpus already practices this in three entries; the rule makes it the default.
- **`REVIEW_WAIVED` is written at close time, by the Leader, before `[x]`** — the same evidence-before-checkbox order Step 3 already enforces for PASS. A task with neither a PASS nor a `REVIEW_WAIVED` in `execution.md` is not closable.

## 12. Risks, Dependencies, And Open Questions

| Item | Kind | Handling |
|---|---|---|
| **"Name every convention file" becomes an open-ended research task** inside the brief step, breaching the Delegation Thresholds (4+ full reads → scout). | Risk | The rule names the *lookup*, not a search: the target folder's `CLAUDE.md` chain up to the module root, the constitution's `## Module Guides` index, and any file the task or design already cites. One `ls`/`Grep` per level; a scout only if the chain is genuinely deep. Specify writes the lookup as a two-line procedure with its falsifying case (KZ-006). |
| **Advisory-grade marking becomes a laundering path** — the Leader adds real scope, tags it advisory, and the Reviewer never gates it. | Risk | The tag only lowers a Leader addition to the Reviewer's ADVISORY tier; it does not license the addition. Narrow-never-widen still forbids new scope, and `AGENTS.md`'s *Scope only grows through approval* binds unchanged. State both halves next to each other in 2.2. |
| **The 600-word ceiling truncates a legitimately long FAIL** (three issues with verbatim Violated Rules). | Risk | Ceiling applies to the *returned* report; issues beyond the ceiling go to a file the Leader reads by path, with the count in the summary line — same mechanism as the diff-by-file rule, in the other direction. The Structured Feedback rule (pass the full report verbatim to the next Implementer) then relays the file, not a paraphrase. |
| **Pathspec rollback misses a file the halted task touched** (a file its attempt entries did not list). | Risk | The pathspec is derived from the attempt entries' *files changed* lines, which the Execution Log Format already requires per attempt; the HALT block names the pathspec used, and the Leader runs `git status` after the restore and reports anything left. Residual: a file the Implementer changed and did not report — the same hole the format already has, now visible. |
| **`REVIEW_WAIVED` under `pre-approved` mode** — can a waiver auto-pass? | Open question | Recommend **no**: a waiver is an exception on the list `AGENTS.md` already says pre-approval never covers (it removes the correctness gate). The Reviewer row's *"offer the user"* stays a stop. Confirm at specify. |
| **Retry-after-N: what N, and is it a foreground wait?** | Open question | Field evidence: pane timeouts and 429s cleared in minutes (`IRR`, `RFI`); provider daily limits did not (`OTP`). Recommend N as a one-line default (e.g. 2–5 min, one retry) run per `leader.md` → *never block your turn on a wait you can background*; a second failure escalates. Specify pins N and the wait mechanism. |
| **Diff-size threshold for file delivery** — LOC or bytes? | Open question | `sp-shell-app-viewport` measured the cut at ~4 KB; `center-overview-tab` switched at > 300 lines. Recommend lines (the Reviewer's mode table is already in LOC) with the byte figure as the reason in prose. |
| **Should `same-model` be a waiver at all**, given the runtime table's Reviewer row already offers "a different model" and cross-host dispatch first? | Open question | Yes — it records the case where those were tried and the only remaining model equalled the Implementer's (`OTP` recorded exactly this). The flag exists so the metric can say *how* independence was lost, not to make it acceptable. |
| **Parallel spec touches the same command file.** `changes/scoped-constitution-reads` (proposal) edits `/akili-execute` Step 0. | Dependency | Disjoint sections; `Parallel-safe: yes` holds for work, merge serially. `changes/gate-falsifiability`'s hand-off is delivered here, so it never edits `reviewer.md`. |

**Active Lessons applied:** KZ-changes--model-routing-cost-rebaseline-2 (brief re-issue after amendment — extended from Pivot to every execute-time edit), KZ-003 (idle ≠ dead: the new event class sits beside the idle protocol, never replaces it), KZ-004 (`REVIEW_WAIVED` lands in an enumerated branch of every `execution.md` scan — `/akili-resume`, `kaizen` Measure), KZ-005 (rules referenced by name — *Runtime-failure fallback*, *Structured Feedback* — never by line), KZ-006 (each new rule states its falsifying case: a brief that names zero convention files for a target whose folder has a `CLAUDE.md` is a violation; a report whose first line is not `STATUS:` is a violation), KZ-002 (the "every mirror updated" claim is grepped at specify, not asserted), KZ-001 (read `leader.md` past Delegation Discipline before appending — the idle-without-report and *Winding down* sections already define the wait and poke mechanics the resume recipe must reuse, not duplicate).

## 13. Success Criteria

1. `/akili-execute` Step 2.2 states, in one block, that a brief may narrow but never widen a task, names the convention-file lookup, requires a source or `UNVERIFIED` on asserted facts, and marks Leader-added items advisory-grade; `leader.md` restates the principle in Delegation Discipline without re-deriving the mechanics.
2. Step 2.3 lists execute-time `requirements.md` / `design.md` edits since the last PASS as explicit Reviewer checks, and defines the report as `STATUS:` first, ordered, ≤ ~600 words, with diff-by-file above a stated threshold; `reviewer.md`'s three output options open with `STATUS:` and its audit checklist carries the red-run / mutation-trace item.
3. The Step 2 runtime-failure table names spawn failure, provider-limit death, and pane timeout; states that none consume an attempt; and orders the Implementer recovery retry → retry-after-N → resume-by-message → fresh-worker partial audit → Leader-inline ask. The Reviewer row's waiver resolves to a `REVIEW_WAIVED` record.
4. The Execution Log Format defines `## REVIEW_WAIVED: <Task ID>` with flags `inline` / `same-model` / `degraded-pair`; a task may not reach `[x]` without a PASS or a `REVIEW_WAIVED` in `execution.md`; `/akili-resume` and the `kaizen` skill's Measure step each name the branch that reads it.
5. Step 4 branches the rollback on tree state and scopes it to the halted task's pathspec when other PASSed, uncommitted work exists; the HALT block records the pathspec.
6. A fixture walkthrough of the four corpus cases — `AIS-T-1` (widened brief), `KCR-T-2` (truncated verdict), `ERC-T-3..5` (no Reviewer, "0 FAILs"), `UCA-T-9` (HALT with 9 PASSed uncommitted tasks) — ends with the new text producing a different, recorded outcome in each, with zero `INCONCLUSIVE`.
7. `docs/commands/akili-execute.md` and every root-guide or `docs/flow.md` / `README.md` mention of the HALT rollback or the report contract are updated, verified by grep, and `CHANGELOG.md` `Unreleased` carries the entry. `changes/gate-falsifiability` contains no edit to `reviewer.md`.

## 14. Next Step

```text
/akili-specify changes/leader-brief-contract
```
