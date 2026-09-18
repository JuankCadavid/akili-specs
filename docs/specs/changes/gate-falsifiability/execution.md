# Execution Log: Gate Falsifiability

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/gate-falsifiability` |
| Depth | Standard |
| Approval Mode | `gated` (inherited from `proposal.md`) — continue/pause gate asks the user after each task; the user may switch to `pre-approved` at any gate |
| Started | 2026-09-18 |
| Leader model | Fable 5.1 (session model; no `## Model Routing` registry in this repo's root guides — packaged default T1 = `opus` alias, session model stronger, passed silently) |
| Implementer model | `sonnet` (T2, packaged default) — fallback sub-prompt path seeded by pointer to `.agents/implementer.md` (no Step 8E wrappers in this repo) |
| Reviewer model | `opus` (T3, packaged default) — fallback sub-prompt path seeded by pointer to `.agents/reviewer.md`; author ≠ auditor held by model |
| Budget (design §11) | 6 tasks (5 at design + T6 from the T5 Pivot, 2026-09-18) · ~126 lines (prose) · 1 review round per task — trip on the second FAIL of any one task |
| Commit prefix | `[SPEC:changes/gate-falsifiability]` |
| Wave plan | Wave 1: T1 ∥ T2 ∥ T3 (disjoint files; prose only). Wave 2: T4. Wave 3: T5 (closing gate) |
| Parallel spec | `changes/leader-brief-contract` is being specified concurrently in an isolated worktree; it owns `/akili-execute`, `leader.md`, `reviewer.md` — this run never touches them (NFR-4) |
| Brief discipline | Reports open with `STATUS:` and stay under ~600 words; verification runs foreground; the Leader greps each edited file for in-file restatements of a changed rule before spawning the Reviewer (KZ-changes--kaizen-loop-closure-2) |

## 2. Task Execution History

### T3 — `/akili-constitution`: `task.md` template description names the fields

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1 of 3) |
| Date | 2026-09-18 |
| Implementer | `sonnet`, effort `low`; skills: `cognitive-doc-design` |
| Reviewer | `opus`, effort `high` (checklist mode, 1−/1+) |

**Attempt 1** — files: `.claude/commands/akili-constitution.md` (Step 7 item 3, one line). Implementer verification: `Falsifier` exactly one hit inside Step 7 item 3; one hunk 1−/1+; `git diff --check` clean; item names all four fields and both absent values, cites the Falsifiability block by name.

Reviewer verdict: **PASS.** "The single-line edit to Step 7 item 3 names all four Verification fields, cites `/akili-specify` Step 3.2's Falsifiability block by name (KZ-005, no rule restated), and carries both absent values verbatim from design.md §5 and FR-7 … plus 'no field ever left blank' covering the scenario's `BUT NOT` omit-a-field clause." Reviewer re-ran the greps independently and checked the citation target against the working tree.

| Field | Value |
|---|---|
| Requirements covered | FR-7 (constitution half; "Non-test gate" scenario incl. `BUT NOT`), NFR-3 |
| Issues | none |
| Final verification | greps 1–3 green (Implementer + Reviewer) |
| Continue gate | gated — presented to the user when wave 1 lands (T1, T2 still in flight) |

### T2 — `tdd` skill: two anti-patterns, red on the assertion, evidence row

| Field | Value |
|---|---|
| Status | **IN PROGRESS** — attempt 1 FAIL, attempt 2 dispatched |
| Date | 2026-09-18 |
| Implementer | `sonnet`, effort `medium` (attempt 1) → `high` (attempt 2); skills: `cognitive-doc-design` |
| Reviewer | `opus`, effort `high` (checklist mode, 4+/2−) |

**Attempt 1** — files: `.claude/skills/tdd/SKILL.md` (three hunks: +2 anti-patterns; "Red before green" clause; evidence row). Implementer verification: 5 anti-pattern bullets; grep hits in three sections (**against the brief's pattern, not the task's — see below**); `description:` diff zero; `git diff --check` clean.

Reviewer verdict: **FAIL** (1 issue), verbatim:

1. **Discovered Issue:** Verification 2's grep returns three hits — SKILL.md:39, :40 (Anti-patterns) and :60 (AKILI Integration). Nothing in Rules of the loop matches. Line 44 reads "The red must fail on the behavioral assertion", so neither `fails on the behavioral assertion` nor `failed on` matches. The completion report states hits in all three sections; that claim does not hold.
   - **Violated Rule:** tasks.md, T2 Verification 2 — "`grep -n "Inert fixture\|Plumbing test\|fails on the behavioral assertion\|failed on" .claude/skills/tdd/SKILL.md` — hits in Anti-patterns, Rules of the loop, and the AKILI Integration table."
   - **Remediation Suggestion:** Cheapest fix is the shipped wording: "The red fails on the behavioral assertion — a red from setup, …", which makes the specified pattern hit line 44 with no change of meaning. Alternatively, correct the evidence to say the Rules-of-the-loop clause is confirmed by reading line 44, and record the grep as two-site, not three.

Verified clean by the Reviewer: 5 bullets; inert fixture distinct from tautological; loop clause, evidence row and FR-2 agree; zero framework names; description, existing anti-patterns, seam section and other rows byte-identical.

**Leader adjudication (root cause is the brief, not the Implementer):** the Leader's brief transcribed verification 2 with the pattern `behavioral assertion` instead of the task's `fails on the behavioral assertion`; the Implementer's "three sections" claim was true against the brief's grep and false against the task's. This is the brief-contract defect class the parallel spec `changes/leader-brief-contract` addresses (a brief that alters the task's governing text) — recorded here as evidence for that spec and for this retrospective. Remedy: the Reviewer's first option (wording "The red fails on…"), one word, no change of meaning; the attempt is consumed because the task's verification is the binding one. Effort bumped to `high`.

**Runtime event (2026-09-18, ~16:54 local):** the provider session limit killed three workers at once — the T1 Implementer (after delivering its pre-review correction), the T2 Reviewer (before its attempt-2 verdict), and the parallel worktree agent drafting `changes/leader-brief-contract`. Per the runtime-failure rule this consumes **no rework attempt**; workers were resumed by message once the limit reset (context intact where it survived). Recorded as field evidence for `changes/leader-brief-contract` item (c) — runtime events as first-class loop events.

**T1 attempt 1 — Leader pre-review catch (KZ-005):** the field list and the constitution template cite "the Falsifiability block" by name, but the block's intro carried no name. Returned to the Implementer as brief/task conformance (not a Reviewer round); fixed — the intro now opens "**Falsifiability** — this rule is necessary and not sufficient…". Two Implementer flags adjudicated: (a) T1 verification 2's `grep -c` counted lines (3) where the intent was occurrences (9) — **`tasks.md` amended** to `grep -o … | wc -l ≥ 6`, a verification-wording correction, not a scope change; (b) the Step 1.2 "Situation" table is the defect-class table — correct home.

**T2 — Attempt 2** — files: `.claude/skills/tdd/SKILL.md` (one word: "must fail" → "fails" in "Red before green"). Implementer verification run exactly as `tasks.md` states: anti-pattern bullets 5; V2 hits at lines 39, 40 (Anti-patterns), 44 (Rules of the loop), 60 (AKILI Integration); description diff zero; `git diff --check` clean.

Reviewer verdict: **PASS.** "Verification 2, run with the literal pattern from tasks.md T2, now returns four hits across all three required sections… Nothing else moved since attempt 1… That change does not alter the rule's meaning and keeps the loop clause in agreement with the evidence row and with FR-2." (Reviewer resumed after the provider-limit interruption; context intact.)

| Field | Value |
|---|---|
| **T2 final status** | **PASS** (attempt 2 of 3) |
| Requirements covered | FR-8 (scenario + `AND IT MUST` existing anti-patterns/seams kept), FR-2 (loop half), FR-10 (`tdd` agrees with the block's names) |
| Decisions | Attempt consumed although the root cause was the Leader's brief paraphrasing the task's grep — the task's verification is binding; recorded as brief-defect evidence |
| Issues | 1 FAIL — evidence discrepancy from a brief transcription error (Leader) |
| Final verification | V1–V4 green as written (Implementer + Reviewer) |
| Continue gate | gated — presented to the user when wave 1 lands |

### T1 — `/akili-specify`: Falsifiability block, fields, defect-class rows, checklist

| Field | Value |
|---|---|
| Status | **IN PROGRESS** — Reviewer PASS on attempt 1; one clause-level gap adjudicated as owed before `[x]` |
| Date | 2026-09-18 |
| Implementer | `sonnet`, effort `high`; skills: `cognitive-doc-design` |
| Reviewer | `opus`, effort `high` (full sweep; read all eight corpus citations at the source) |

**Attempt 1** — files: `.claude/commands/akili-specify.md` (16+ lines, 4 hunks, five named sites). Implementer verification: KZ-006 bullet byte-identical; occurrences 9 at three sites; framework grep — only pre-existing `jsdom` plus new names inside parentheticals; ≤ 30 added lines; `git diff --check` clean. Leader pre-review catch (KZ-005: unnamed block) fixed before review.

Reviewer verdict: **PASS.** "All five sites land at the sections T1 names, four hunks, nothing outside them. KZ-006 is byte-identical and keeps its position… I read all eight corpus citations at the source and every falsifier matches what the entry reports… FR-10 holds: no sentence claims a named input alone makes a check evidence." NFR-1/NFR-2/NFR-5 confirmed; rule 6's length carved out by design §3's checklist exception.

ADVISORY (verbatim summary): READABILITY — rule 2's parenthetical is bare spec names with no falsifier text. RELIABILITY — FR-2's second scenario also asks for the positive obligation (deferred observables or the harness's equivalent) and "a green under synchronous mocks is not evidence"; rule 2 carries only the negative form, and T5's walkthrough does not use that entry. READABILITY — Step 1.2's column header reads "Situation". FYI — DD-5's cross-citation by name (rules 1 and 3 naming inert fixture / plumbing test) unmet in this direction.

**Leader adjudication:** the RELIABILITY item is a **clause-level coverage gap, not an advisory** — FR-2's "Race hidden by synchronous mocks" scenario is owned by T1 in the coverage table, and its THEN carries the positive obligation the shipped rule omits. Per the rule that a task with an outstanding gap never reaches `[x]` even on a PASS, T1 stays open for one clause. Folded into the same touch as Leader-adopted refinements within T1's own surface: rule 2's parenthetical gains the falsifier text; rules 1 and 3 name the `tdd` anti-patterns (inert fixture, plumbing test) for FR-10/DD-5 coherence. The "Situation" header is left as is (content matches design row 1; renaming a pre-existing header is outside T1). The Reviewer is asked to confirm the touched lines only.

**T1 owed-clause touch (post-PASS, Leader-adjudicated):** three lines in the block — rule 1 names the `tdd` *inert fixture*; rule 2 gains FR-2's positive obligation (deferred timing so the race is exercised; a green under synchronous mocks is not evidence for the class) and falsifier text in its parenthetical; rule 3 names the `tdd` *plumbing test*. Implementer verification: KZ-006 lead unchanged; framework grep unchanged; 16 added lines; `git diff --check` clean.

Reviewer confirm-only: **PASS holds.** "FR-2 second scenario now fully carried… DD-5 cross-citations resolve: the tdd skill at HEAD carries *Inert fixture* (line 39) and *Plumbing test* (line 40) under exactly those labels. Framework grep unchanged." Note (non-gating): rule 2 wraps past four lines on a narrow terminal, still shorter than rule 6.

| Field | Value |
|---|---|
| **T1 final status** | **PASS** (attempt 1 of 3 + one Leader-adjudicated owed-clause touch, Reviewer-confirmed) |
| Requirements covered | FR-1..FR-7 (specify half), FR-9, FR-10, NFR-1, NFR-2, NFR-5 |
| Decisions | Pre-review catch: block named (KZ-005); verification 2 amended to count occurrences; "Situation" table accepted as the defect-class home (header left as is); RELIABILITY advisory treated as an owed FR-2 clause, not an advisory |
| Issues | none at review |
| Final verification | greps 1–5 green (Implementer + Reviewer, eight corpus citations read at the source) |
| Continue gate | gated — presented to the user now (wave 1 landed) |

### T4 — Mirrors and CHANGELOG

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1 of 3) |
| Date | 2026-09-18 |
| Implementer | `sonnet`, effort `high`; skills: `cognitive-doc-design` |
| Reviewer | `opus`, effort `high` (checklist mode, 23+/3− across four files) |

**Attempt 1** — files: `docs/commands/akili-specify.md` (+10: two defect-class gates, four fields, six-rule Falsifiability sub-list, checklist items), `docs/skills/tdd.md` (five anti-patterns with tells, red-on-assertion clause, evidence extension), `docs/commands/akili-constitution.md` (task.md entry names the four fields and absent values), `CHANGELOG.md` (+2: Added bullet, patch-classification Note). Implementer verification: greps 1–5 green; per-file parity read; CHANGELOG surfaces matched to commits f6aaefa / d6d728d / 12f437b; a first-draft drop of "testing expectations" in the constitution mirror caught by the Implementer on comparison and fixed before reporting.

Reviewer verdict: **PASS.** "T4 mirrors are at parity with the shipped HEAD text; no over-claim found, and the under-claims are summary-altitude compressions the task itself sanctions… CHANGELOG claims all trace to surfaces T1-T3 actually changed. Verified per file against the source, not by grep alone." Reviewer's readings recorded: rule 2's and rule 5's mirror lines omit the positive timing obligation and the CI-skipped/token-gated clause — acceptable compression (FR-10 asks the mirror to agree, not enumerate; FR-2/FR-5 are owned by T1/T5); the mirror has no presence-assertion bullet, so T1's trailing clause has no mirror target.

| Field | Value |
|---|---|
| Requirements covered | FR-10 (mirrors agree; neutrality), NFR-4 |
| Issues | none |
| Final verification | greps 1–5 green (Implementer + Reviewer); NFR-4 diff empty |
| Continue gate | gated — presented to the user before T5 |

### T5 — Closure gate: greps, parallel-safety diff, retro-fit walkthrough, packaging

| Field | Value |
|---|---|
| Status | **IN PROGRESS** |
| Date | 2026-09-18 |
| Implementer | `sonnet`, effort `xhigh`; skills: `cognitive-doc-design` |
| Reviewer | `opus`, effort `high` |

**Runtime event (2026-09-18, ~19:20 local):** the T5 Implementer died on an expired login right after starting part (a) — no repo file written, no attempt consumed. The user re-authenticated; the worker was resumed by message. The session scratchpad announced earlier became unavailable in the same event, so the record's destination changed: the Implementer returns the walkthrough record in its report and the Leader persists it as `t5-walkthrough.md` in this spec folder (the task's "no repo file written by this task" still holds for the worker). Second runtime interruption of this run (first: provider session limit during wave 1) — both recorded as evidence for `changes/leader-brief-contract` item (c).

**T5 — Attempt 1** — no repo file written by the worker. Greps 1–3 clean (one sanctioned pre-existing `jsdom` hit); walkthrough 5/5 rejected by a quoted shipped sentence; packaging green. Full record: `t5-walkthrough.md` (persisted by the Leader).

**Leader challenge before accepting the gate (the spec's own rule 1, applied to its closure gate):** all five walked cases are cited by name inside the rules' parentheticals — the walkthrough was at risk of being an inert fixture. The Reviewer was asked to (1) strip the parenthetical and judge the general sentence, and (2) walk three held-out corpus gates the block does not cite.

Reviewer verdict: **PASS** on the task's gate — "all five named cases survive the strip-the-parenthetical test — each is rejected by a class-level sentence that stands without its corpus citation, so the gate is not an inert fixture." Greps re-run independently; parallel-safety diff also empty over the full T1–T4 range.

**HELD-OUT findings (Leader adjudication pending with the user):**
- (a) REJECTED — rule 1 / `tdd` inert fixture. Advisory: "fixture row(s)" reads tabular; a programmed stub is not a row.
- (b) **INCONCLUSIVE** — a class FR-1/FR-3 claim: an always-false-negative selector passes rules 1–3 because nothing obliges executing the mutation against the post-change code. **Spec gap** (no requirement asks for it). Compounded by a **T1 under-delivery**: shipped rule 3 says "a class list"; FR-3 says "class/attribute presence".
- (c) REJECTED weakly — **T1 under-delivery** against FR-6 scenario 3: "two viewports" names no axis; the requirement's "second, shorter height that forces the intended scrolling ancestor" was dropped.

T5's checkbox is held until the user decides how to close these (gated mode; one item is a requirement amendment, which is Pivot territory).

## Pivot Record: T5 (2026-09-18)

| Field | Value |
|---|---|
| Trigger | T5's gate PASSed (5/5), but the Leader's held-out challenge found one INCONCLUSIVE case in a class FR-1/FR-3 claim to cover, plus two shipped-text under-deliveries against approved requirements |
| Blocker | (1) **Spec gap:** nothing requires the falsifier to be *executed* against the post-change code, so a test that is red before the change for one reason and green after it for another passes rules 1–3 (`bugfix--other-fields-toc-visibility` KZ-OTV-2). (2) **T1 under-delivery:** shipped rule 3 says "a class list"; FR-3 says "class/attribute presence". (3) **T1 under-delivery:** shipped rule 6 says "two viewports" with no axis; FR-6 scenario 3 requires a second, shorter height. (4) Advisory adopted: "fixture row(s)" does not cover programmed stub behavior |
| Alternatives | (a) close as is, four follow-ups — rejected by the user; (b) fix only the two under-deliveries — rejected: leaves the class the spec exists to close open; (c) **bounded Pivot: amend FR-1 (+scenario) and FR-6 item 4 wording, add T6 (four clauses, two files), re-run the closure on the touched rules and held-out (b), (c)** — chosen |
| ADR impact | none |
| Spec amendments | `requirements.md`: FR-1 statement (stub behavior; executed falsifier) + scenario "Selector that matches nothing"; FR-6 item 4 names the axis. `design.md`: §7 rows 12–15, DD-9, budget 5 → 6 tasks / ~126 LOC / 15 rows. `tasks.md`: T6 added; T5 depends on T4 + T6 and is `[~]` pending re-run; coverage rows added |
| Correction Closure | Forward: grep of the spec folder for "5 tasks", "~120", "11 surface", "Eleven surface" — updated in `tasks.md`, `design.md`, `execution.md` Document Control; `proposal.md` hits are sanctioned history. Backward: `t5-walkthrough.md` cites rule text that T6 changes — it is a dated record of HEAD `c3c7918` and stays as is; the re-run appends to it |
| Briefs to re-issue | None outstanding — T1–T4 closed; T6 gets a fresh brief; T5's re-run brief carries the amended FR text |
| User decision | **Pivot acotado + T6** (2026-09-18) |

### T6 — Pivot closures: executed falsifier, attribute, viewport axis, stub behavior

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1 of 3) |
| Date | 2026-09-18 |
| Implementer | `sonnet`, effort `high`; skills: `cognitive-doc-design`; briefed to run the verification exactly as `tasks.md` states it (lesson from T2) |
| Reviewer | `opus`, effort `high` — the T5 Reviewer, context intact, who had found the gaps |

**Attempt 1** — files: `.claude/commands/akili-specify.md` (rules 1, 3, 6 — 3−/3+), `docs/commands/akili-specify.md` (two sub-list lines — 2−/2+). Implementer verification: T6 checks 1–5 green as written; restatement grep clean ("class list" gone everywhere); CHANGELOG Unreleased bullet re-read — holds.

Reviewer verdict: **PASS.** "Both held-out gaps I raised are now closed by general sentences that stand without their parentheticals." Held-out (b) rejected by "The Done criteria require the falsifier **executed against the post-change code**… a gate that stays green under its own falsifier asserts nothing"; held-out (c) rejected by "two viewports that differ on the dimension the gate depends on… or a second, shorter height that forces the intended scrolling ancestor". FR-3's "attribute" and FR-1's "stub behavior" carried; rules 2, 4, 5 byte-identical; KZ-OTV-2 correctly characterized inside the inert-fixture parenthetical.

ADVISORY (recorded, out of T6's scope): the `tdd` skill's *Inert fixture* bullet prescribes "the fix is a fixture row on which the readings diverge" — the wrong remedy for a broken-selector instance; follow-up.

| Field | Value |
|---|---|
| Requirements covered | FR-1 amended statement + "Selector that matches nothing" scenario; FR-3 attribute presence; FR-6 item 4 axis |
| Issues | none |
| Final verification | checks 1–5 green (Implementer + Reviewer) |
| Continue gate | covered by the user's Pivot approval (T6, then re-run the closure) |

**T5 — Attempt 2 (after the Pivot, HEAD `83029ff`)** — greps 1–3 clean over the full T1–T6 range; re-walk of the three rules T6 touched: no regression; held-out (b) and (c) both rejected by general sentences; packaging green; tree clean. Record appended to `t5-walkthrough.md`.

Reviewer confirm-only: **PASS.** "All five quoted sentences exist verbatim at HEAD `83029ff`… No regression… Nothing withholds PASS… On (b), I judged the general sentence alone. 'A gate that stays green under its own falsifier asserts nothing' rejects the attribute-selector case without the parenthetical."

ADVISORY (recorded, follow-up): the `tdd` skill's *Inert fixture* bullet prescribes "a fixture row on which the readings diverge" as the fix — the wrong remedy when the instance is a broken selector rather than thin data.

| Field | Value |
|---|---|
| **T5 final status** | **PASS** (attempt 2 of 3 — attempt 1 PASSed its own gate; the Leader's held-out challenge triggered the Pivot) |
| Requirements covered | FR-1..FR-6 retro-fit walked (five named + three held-out cases); FR-10 post-edit scenario; NFR-2, NFR-4, NFR-6 |
| Decisions | Walkthrough strengthened with strip-the-parenthetical + held-out cases (the spec's own rule 1 applied to its gate); record returned inline after the scratchpad became unavailable, persisted by the Leader as `t5-walkthrough.md` |
| Issues | 1 runtime interruption (expired login) — no attempt consumed |
| Final verification | 0 INCONCLUSIVE; greps clean; packaging green; tree clean |
| Continue gate | gated — no eligible task remains |

## 3. Summary

| Field | Value |
|---|---|
| Tasks | 6 / 6 `[x]` (T1–T5 as designed; T6 added by the T5 Pivot) |
| Reviewer rounds | T1 ×1 (+ one Reviewer-confirmed owed-clause touch), T2 ×2, T3 ×1, T4 ×1, T5 ×1 + confirm (+ the held-out challenge), T6 ×1 — 9 verdicts, 1 FAIL |
| Leader pre-review catches | 1 (T1: the block carried no name while two surfaces cited it — KZ-005) |
| Pivots | 1 (T5 → T6: executed falsifier; attribute presence; viewport axis; stub behavior; FR-1/FR-6 amended; DD-9) |
| HALTs / FATAL_FAILs / tripwires | 0 / 0 / 0 |
| Runtime interruptions | 2 (provider session limit — 3 workers; expired login — 1 worker); none consumed an attempt; all resumed by message |
| Budget | tasks 5 → 6 (Pivot); LOC ~126 est. vs ~55 shipped lines across 7 files; review rounds 1/task budgeted, T2 exceeded by one |
| Commits | 9 on `master`, all `[SPEC:changes/gate-falsifiability]` |
| Kaizen candidates (Methodology) | (1) **A retro-fit walkthrough over cases the rules cite is an inert fixture** — the strip-the-parenthetical test plus held-out cases found a real spec gap and two under-deliveries a 5/5 PASS had hidden; (2) **a Leader brief that paraphrases a task's verification command changes the gate** (T2's only FAIL) — corroborates `changes/leader-brief-contract`; (3) **under-delivery of requirement nouns** ("attribute", the viewport axis) passed a full Reviewer sweep — a clause-by-clause noun check of each FR statement against the shipped sentence would have caught both at T1; (4) follow-up: `tdd` *Inert fixture* remedy wording |
| Hand-offs owed by `changes/leader-brief-contract` | `/akili-execute` Step 2.2 brief copies `Falsifier`, `Red run`, `Consumers`; `reviewer.md` verifies the recorded red run and traces the mutation |
| Next | `/akili-archive changes/gate-falsifiability` (prose-only; the walkthrough record is the behavioral evidence) |
