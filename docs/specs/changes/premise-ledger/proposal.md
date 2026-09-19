# Proposal: Premise Ledger

**Recommendation:** give `design.md` a **Premise Ledger** — every statement the design makes about the *existing* system is a row with a citation that can be re-run (file:line, or the command and its scope as run), or it is marked `UNVERIFIED` and routed to the first check that can settle it. `judgment-day` attacks the ledger before anything else, and the Bug Track adds a four-question **blast radius** block. In the evidence corpus, 40 of 110 retrospectives (36%) trace rework to a premise nobody checked: 9 Pivots, 3 HALTs, ~28 Reviewer FAIL rounds, 2 specs whose entire output was discarded, 4 shipped defects.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/premise-ledger` |
| Slug | `premise-ledger` — first token of the argument; the free text after it is proposal context, not a directory name |
| Type | **Change** |
| Approval Mode | `gated` (no up-front end-to-end mandate given) |
| Depends on | none open — `changes/gate-falsifiability` and `changes/leader-brief-contract` shipped in v2.25.0; this spec reuses their vocabulary (`Consumers`, `UNVERIFIED — confirm at source…`) |
| Parallel-safe | **yes** with `changes/scoped-constitution-reads` (it owns `implementer.md` / `tester.md`; this spec does not touch them). Both add a `CHANGELOG.md` `Unreleased` entry — merge serially |
| Series | Third of five tier 2–3 specs from the 2026-09-17 kaizen-corpus analysis; next: `hitl-row-schema`, `budget-and-concurrency` |
| Evidence | `/Users/jcadavid/orca/workspaces/onecgiar_pr/qa-development-2026/docs/specs/kaizen/` — 110 entry files read in full by a scout (2026-09-19); every citation below names the entry file; five quotes re-verified at the source by the author (KZ-001) |
| Date | 2026-09-19 |
| Status | Draft — awaiting approval |

## 2. Intent

Make a design's claims about the code it builds on **checkable before tasks exist**. The triad audits what the Implementer writes; nothing audits what the architect *assumed*. A false premise is not caught by a FAIL — it is implemented correctly, reviewed, PASSed, and discovered at HITL, in production, or never.

## 3. Problem / Current Behavior

`/akili-specify` Phase 2 asks the design to "use current repo paths" and "extend existing architecture". It has no place where a claim about the existing system is stated, cited, and marked verified or not. Step 2.3 challenges decisions that *revert* behavior; nothing challenges what the design *takes as given*. `judgment-day` judges contrast figures across the in-scope documents — and its own Hard Rules warn that "documents agreeing with each other is not corroboration" — but no rule sends a judge to the source. `/akili-propose`'s Bug Track requires a confirmed root cause and an impact note; it does not ask whether the bug is already fixed elsewhere, or whether the code to be patched is on the live path. The methodology text contains no premise concept at all (`grep -rni premise .claude/commands .claude/skills/judgment-day .claude/templates` → two unrelated hits in `akili-constitution.md`).

What that costs, by premise class (scout sweep, 47 lessons in 40 entry files):

| Class | Lessons | Representative entry (file · lesson) | Cost recorded there |
|---|---|---|---|
| Wrong location / wrong owner | 9 | `changes--kp-report-modal-auto-create.md` · KZ-…-1 — the design named the sibling form "with matching fields"; the URL mounts another component | Pivot before T-1 + design rewrite |
| Code not on the live path | 5 | `bugfix--evidence-storage-link-validation.md` · KZ-EVL-1 — fix scoped to a function reachable only via API v1; the portfolio routes to v2 | Two implemented, PASSed, green tasks reverted — "a fully-reviewed, fully-green fix shipped no functional value" |
| Already fixed / already exists | 5 | `bugfix--innovation-dev-p25-save-500.md` · KZ-IDEV-1 — same ticket closed by a teammate's commit one day before the proposal | Entire spec discarded — "all of it wasted effort" |
| Siblings on shared state | 11 | `changes--realtime-section-completion.md` · KZ-…-3 — "no section has a save side effect"; two of eleven email on save | 1 HALT, 2 Pivots, 4 FAIL attempts, all autosave work discarded |
| Downstream consumers of a contract | 4 | `changes--sidebar-toggle-consolidation.md` · KZ-STC-1 — design asserted no E2E coverage existed; a suite written the day before pins the selector | Pivot on a fully green run; 3 of 5 E2E tests silently broken |
| Data / environment | 6 | `changes--my-work-board.md` · KZ-…-1 — a table unwritten since 2023, a five-value vocabulary that has eight, server-side filtering that is client-side — "None was checked against a writer/reader in code" | Design and six tasks built on them; 8 severe judgment findings |
| Fact from a secondary source | 3 | `changes--result-indicator-back-link.md` · KZ-…-1 — the design inferred a response field from a label the UI already paints | Pivot + FAIL |
| Asserted, never verified (other) | 4 | `bilateral--overview-redesign.md` · KZ-BOR-1 — design contradicted a hard rule landed a week earlier | Shipped debt found at archive |

Three findings shape the proposal:

1. **Judges do not grep unless told to.** `changes--bilateral-review-ux-polish.md`: "three Leader-written premises survived two blind judges because they read as plausible and no one grepped" — each then cost a FAIL round. Where judges *did* go to source they paid for themselves before any code existed (`changes--my-work-board.md`, `bugfix--other-fields-toc-visibility.md`, `changes--kp-cgspace-browse.md`).
2. **The corpus already converged on the fix.** 25 entries propose a local standardization; four independently propose the same sentence in different words — a premise without a re-runnable citation is not a premise (`…bilateral-review-ux-polish` P1, `…my-work-board` P1, `…sp-bilateral-review-tab` P2, `…clear-filters` P1: "A 'verified absent' claim is only as true as the search pattern"). Those fixes live in one project's templates; none has reached the methodology.
3. **The check is cheap when it is done.** `changes--partner-role-separator.md`: checking the "sibling" components before speccing turned four components of scope into one. `changes--my-work-board.md`: each premise took the Leader "~10 minutes — the same check that would have taken 10 minutes at propose time."

This repo's own record agrees: in `changes/leader-brief-contract` two verification baselines and one expected outcome were written as present-tense facts and never run (KZ-changes--leader-brief-contract-2, applied 2026-09-19 to `tasks.md` authoring). The ledger is the same discipline one phase earlier.

## 4. Proposed Outcome

| Where | Behavior after this change |
|---|---|
| `design.md` | Carries a **Premise Ledger**: one row per claim about the existing system the design depends on — the claim, its class, the citation **as run** (file:line, or command + scope + the hit), the commit it was verified at, and what breaks if it is false. A claim with no citation is written `UNVERIFIED` with the check that will settle it and the task or review that owns that check — visible, never silent |
| Class-conditional rows | Blast-radius rows are required **only when their trigger applies** (the design changes shared state, a shared contract, or names a live user path) — the same "only when" shape as the rendered-measurement checklist, so a backend-only or prose-only design is not taxed |
| `judgment-day` | Judges **attack the ledger first**: re-run each cited command at the source, grep for each `UNVERIFIED` row, and treat a premise the source contradicts as a severe finding. An empty or absent ledger on a design that names existing code is itself a finding |
| Step 2.5 (no judgment-day) | The design summary shows the ledger's counts (verified / `UNVERIFIED`) so the user sees what the design rests on before approving; `UNVERIFIED` rows on a High-impact premise recommend **Review Design** |
| `/akili-propose` Bug Track | The Bug Diagnosis gains a **Blast Radius** block of four recorded checks: already fixed? (`git log --all` on the target files and the ticket ID) · live path? (the dispatch chain the reproduction actually travels) · siblings on the same state · downstream consumers |
| Tasks | Ledger rows of the consumer class feed the task's existing `Consumers` field; an `UNVERIFIED` row names the task that settles it first — no new task field |

## 5. Scope

| Surface | Change |
|---|---|
| `.claude/commands/akili-specify.md` | Phase 2: Step 2.1 (verify while exploring), Step 2.2 (ledger in *Minimum content* + one guideline block defining rows, classes, triggers, the `UNVERIFIED` absent-value), Step 2.5 (counts in the summary; recommendation rule); Verification Checklist items. Step 1.2: the requirements' context claims point at the ledger rather than restating it |
| `.claude/skills/judgment-day/SKILL.md` | One Hard Rule (ledger first, at the source) + the AKILI Integration table — which today points at "`/akili-specify` Step 2.3 — Review Design"; that option lives in **Step 2.5** (stale pointer, KZ-005 class) |
| `.claude/commands/akili-propose.md` | Bug Track + the Bug Diagnosis template: the Blast Radius block; Step 3 "Problem / Current Behavior" claims carry a citation or `UNVERIFIED` |
| `.claude/commands/akili-constitution.md` | Step 7: the `design.md` template description names the ledger (consumer of the new section) |
| Mirrors, CHANGELOG | `docs/commands/akili-specify.md`, `akili-propose.md`, `akili-constitution.md`; `docs/skills/judgment-day.md`; `CHANGELOG.md` `Unreleased` |

## 6. Non-Goals

- **No tool.** No script that re-runs ledger commands, no hook, no installer change — text first; the "citation as run" format keeps a checker possible later.
- **No re-verification at execute time.** A cited premise can rot between specify and execute (`bugfix--emerging-result-contributor-catalog.md`: a "user-confirmed" reachability claim had been false since a sibling spec moved the flow). That is `/akili-execute` Step 0/2.1 territory and belongs with `budget-and-concurrency`'s foreign-change check — recorded as its input, not done here.
- **No change to the triad personas**, `/akili-execute`, `/akili-test`, `tdd`, or Step 3.2's Falsifiability block (shipped in v2.25.0; the ledger feeds it, it is not reopened).
- **No second Consumer Sweep.** Step 3.2 rule 5 stays the task-level sweep over tests; the ledger records the *design-time* consumers (other apps, reports, siblings) and hands them to that field.
- **No migration.** Existing `design.md` files stay valid; the ledger is required of designs written after the change.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| The architect running `/akili-specify` | ~10 minutes of verification per design, front-loaded; fewer Pivots |
| Judges in `judgment-day` | A fixed first target instead of reading for plausibility |
| Bug reporters via `/akili-propose` | Four recorded checks before a fix is proposed |
| The user at Step 2.5 | Sees what is verified and what is assumed before approving |
| `changes/scoped-constitution-reads` (active) | Disjoint files; CHANGELOG merge only |
| Archived `changes/gate-falsifiability`, `changes/leader-brief-contract` | Vocabulary reused by name; no edit |
| Active Lessons cited | **KZ-001** (read the pinned source past the section you came for — the ledger is its design-phase form), **KZ-002** (run the grep that would falsify an aggregate claim), **KZ-changes--leader-brief-contract-2** (present-tense readings are run before written), **KZ-changes--gate-falsifiability-1** (this spec's closure walkthrough names held-out cases) |

## 8. Visual Reference

- Source: None
- Location: —
- Notes: methodology prose only; no UI surface.

## 9. Requirement Delta Preview

### ADDED Requirements

- A `design.md` Premise Ledger with a defined row shape, a closed set of premise classes, and the `UNVERIFIED` absent-value (never a blank or an omitted row).
- Class triggers: shared-state and contract-consumer rows required only when the design changes such a surface; live-path row required when the design names a user action or a branch point (portfolio, API version, flag).
- A negative-existence claim ("no X exists") quotes the command, its pattern and its scope verbatim as run.
- A parity claim ("same contract as the sibling") names the sibling's mechanism at file:line — a comment or a component name is not evidence.
- `judgment-day`: ledger-first Hard Rule; a source-contradicted premise is severe.
- `/akili-propose` Bug Diagnosis: Blast Radius block (already fixed · live path · siblings · consumers), each with its recorded check.

### MODIFIED Requirements

- `/akili-specify` Step 2.2 *Minimum content* and guidelines; Step 2.5 summary and recommendation; Verification Checklist.
- `judgment-day` AKILI Integration row: Step 2.3 → Step 2.5.
- `/akili-propose` "Problem / Current Behavior": claims about current behavior cite or mark.
- `/akili-constitution` Step 7 `design.md` template description.

### REMOVED Requirements

- None.

## 10. Approach Options

| Option | What | Trade-off |
|---|---|---|
| **A — Guideline bullets only** | Add "verify premises, cite file:line" sentences to Step 2.2 and the judge prompt | Cheapest. It is what the corpus already had in spirit ("use current repo paths") — an unstructured exhortation leaves nothing for a judge to attack and nothing for the user to count; the four converging corpus fixes all ask for a *table* |
| **B — Premise Ledger section + ledger-first judging + Bug Track blast radius** *(recommended)* | A defined section with row shape, classes, triggers and an absent-value; one Hard Rule in `judgment-day`; a four-check block in the Bug Diagnosis | ~4 files + mirrors, prose only. Costs the architect minutes per design; bounded by class triggers. Gives the judge a target, the user a count, and tasks a source for `Consumers` |
| **C — B plus a premise re-runner** | A script that parses the ledger and re-runs each recorded command at specify, judge, and execute time | Closes premise rot mechanically. Installer and CI scope, a parser for free-form commands, host-specific — disproportionate before the ledger format has been used once |

## 11. Recommended Approach

**Option B.** It is the smallest change that turns a premise from prose into an auditable object. Three design choices keep it cheap and honest:

1. **Defined once, in the command.** The ledger's row shape, classes and triggers live in `/akili-specify` Step 2.2; `judgment-day`, `/akili-propose` and the constitution template cite it by name (KZ-005), never restate it.
2. **An absent-value, not a gate.** `UNVERIFIED` is allowed — some premises need a running stack or a PROD account to settle. What is not allowed is silence. The row names who settles it and when, which is how `changes--cognito-email-otp-login.md`'s open PROD question ("stayed open through two design revisions") would have stayed visible.
3. **Reuse, do not mint.** The marker text matches the brief contract's `UNVERIFIED — confirm at source before relying on it`; consumer rows land in the task's existing `Consumers` field; the rendered-measurement checklist's "only when" trigger shape bounds the cost.

Expected depth at `/akili-specify`: **Standard** (one new section with three readers is not Lite; no data, API or auth surface pushes it to Full).

## 12. Risks, Dependencies, And Open Questions

| # | Risk or question | Handling |
|---|---|---|
| R1 | **Ceremony** — the ledger becomes a form filled with trivia | Rows are limited to claims the design *depends on* (a false row changes a DD or a task); class triggers gate the blast-radius rows; the spec's own walkthrough measures ledger size on retro-fitted corpus designs |
| R2 | **False comfort** — a cited premise reads as true forever | The row records the commit it was verified at; rot is named as the accepted residual and handed to `budget-and-concurrency` (§6) |
| R3 | **Judges run commands** — `judgment-day` judges are read-only | Read-only is not no-`grep`: the rule is "re-derive at the source", which a read-only judge can do; the spec must check the judge tool contract and state it |
| R4 | **A ledger can be written from memory too** | The "as run" rule (command + scope + hit) is what a judge re-runs; a citation that does not reproduce is itself a severe finding |
| R5 | Overlap with Step 3.2 rule 5 (Consumer Sweep) | Non-goal stated; the spec walks both rules side by side and keeps one owner per sweep |
| Q1 | Does the ledger live only in `design.md`, or do `requirements.md` context claims get their own rows? Four corpus fixes target the requirements template | Proposed: one ledger, in `design.md`; requirements' context claims reference ledger rows. Decide at specify Phase 1 |
| Q2 | Should Lite depth carry the ledger? | Proposed: yes, but only the rows its triggers require — a Lite bug fix is exactly where "already fixed" and "live path" pay (both wasted specs in the corpus were bug fixes) |
| Q3 | Should an `UNVERIFIED` High-impact row *block* Step 2.5 approval, or only recommend Review Design? | Proposed: recommend, never block — the user may hold knowledge the repo does not; the row stays visible downstream |
| Q4 | Closure evidence | A retro-fit walkthrough over named corpus designs **plus held-out cases the shipped text does not cite**, judged with parentheticals stripped (KZ-changes--gate-falsifiability-1); expected outcomes derived from the shipped text before they are written into the task (KZ-changes--leader-brief-contract-2) |

## 13. Success Criteria

1. A literal reader of the shipped `/akili-specify` Step 2.2, given the design of `changes--kp-report-modal-auto-create`, `bugfix--evidence-storage-link-validation`, `changes--realtime-section-completion`, `changes--sidebar-toggle-consolidation` and `changes--my-work-board` as the entries describe them, is told by a quoted general sentence to write the row that would have exposed each false premise — and the same holds for at least two held-out entries the text does not cite.
2. A literal reader of the shipped `judgment-day` rule, given `changes--bilateral-review-ux-polish`'s three premises, re-runs them at the source instead of reading for plausibility.
3. A literal reader of the shipped Bug Diagnosis, given `bugfix--innovation-dev-p25-save-500`, runs the already-fixed check before proposing a fix.
4. A backend-only or prose-only design triggers no blast-radius row (cost bound holds).
5. Every cross-reference is by section name; `judgment-day`'s Integration row names Step 2.5; the mirrors agree; `npm run verify:cli`, `pack:dry-run`, `git diff --check` pass.
6. No hunk in `/akili-execute`, the personas, `tdd`, or Step 3.2's Falsifiability block.

## 14. Next Step

```text
/akili-specify changes/premise-ledger
```

Standard depth. Evidence is cited from the corpus entry files at the source, not from this proposal's summaries.
