# Execution Log: Premise Ledger

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/premise-ledger` |
| Depth | Standard |
| Approval Mode | `gated` (inherited from `proposal.md`). **Run condition:** the user launched `/akili-execute` and is not present at the gates. Following the precedent run (`changes/leader-brief-contract`), the Leader continues past a continue/pause gate **only after a PASS**, logging each as `gate not answered — continued (unattended run)`; every exception (HALT, Pivot, budget tripwire, `FATAL_FAIL`, waiver, Leader-inline ask) stops for the user as the mode requires. One commit per task keeps every step revertible |
| Started | 2026-09-19 |
| Base commit | `571edaf` (proposal commit; `requirements.md`, `design.md`, `tasks.md` were approved 2026-09-19 and uncommitted at run start — committed with T1) |
| Leader model | Fable 5.1 (session model; no `## Model Routing` registry in this repo's root guides — packaged default T1, session model stronger, passed silently) |
| Implementer model | `opus` (T2 for a Size-L prose task, chosen over the `sonnet` default because every clause is audited term by term) — fallback sub-prompt path seeded by pointer to `.agents/implementer.md` (no Step 8E wrappers in this repo) |
| Reviewer model | `fable` (session model, T3) — fallback sub-prompt path seeded by pointer to `.agents/reviewer.md`; author ≠ auditor held by model |
| Budget (design §13) | 7 tasks · ~150 shipped lines · 9 review rounds — trip on the 10th Reviewer verdict or when shipped lines exceed ~150 by a task's worth |
| Commit prefix | `[SPEC:changes/premise-ledger]` |
| Wave plan | T1 → T2 (same file, sequential) ∥ T3 ∥ T4 ∥ T5 (waves of 2) → T6 → T7 (closing gate) |
| Brief discipline | Verification commands copied byte-for-byte from `tasks.md`; Falsifier / Red run / Consumers / Disqualifier copied beside them; held-out slugs named only as slugs to avoid; reports open with `STATUS:` (Reviewer) or the four persona fields (Implementer) and stay under ~600 words; the Leader runs each task's pre-review sweep before spawning the Reviewer |

## 2. Task Execution History

### T1 — `/akili-specify` Step 2.2: *Minimum content* item and the Premise Ledger block

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1 of 3) |
| Date | 2026-09-19 |
| Implementer | `opus`, effort `high`; skills: `cognitive-doc-design` (as the task lists) |
| Reviewer | `fable`, effort `high` (lens checklist, 56+/0−, one file) |

**Attempt 1** — files changed: `.claude/commands/akili-specify.md` (two pure-insertion hunks: `11. Premise Ledger` appended to Step 2.2 *Minimum content*; the 55-line **Premise Ledger** block in Step 2.2 *Guidelines* between *New enumerated values walk their consumers* and *Code Suppression*). Implementer verification, run as `tasks.md` states it: check 1 `Premise Ledger` 6 lines, `^11\. Premise Ledger` 1 hit; check 2 marker count 1, `diff` of the two `grep -o` outputs against `akili-execute.md` empty, `od -c` shows the em dash; check 3 backticked `location` 1 · `existence` 1 · `data-env` 1 · `other` 2 · `live-path` 2 · `shared-state` 2 · `consumer` 3; check 4 `none apply` 2 · `Premise Ledger: none` 1 · `user-stated` 1 · `dependence test` 6; check 5 Falsifiability range 8 lines from `571edaf` and from the working file, `diff` empty; check 6 Step 2.2 list diff vs `571edaf` = `12a13 > 11. Premise Ledger` only; check 7 held-out slug grep = 1 hit, the pre-existing `programme-results-created-by-filter`, none of the seven slugs. Falsifier for check 5 **executed** on a scratch copy (one character changed inside rule 3 → `diff` red on that line; copy discarded). Disqualifier read: trigger table's third column states what each row must contain; hand-off carries "All other classes have no hand-off"; Bug Mode no-Blast-Radius branch present; severity-vocabulary grep over the block = 0 (DD-8). `git diff --numstat` = `56 0`, one file. Pre-review sweep (Leader re-ran): every `ledger` hit reads "Premise Ledger"; both neighbour bullets byte-identical to `571edaf`. `Not Done / Assumptions`: two judgment calls, no gap (below). Runtime events: none.

Reviewer verdict: **PASS.** "The block carries every FR-1..FR-4 obligation, table, bullet, and scenario clause term for term, in the order tasks.md T1 prescribes, with the marker byte-identical to `/akili-execute` line 179, items 1–10 and the Falsifiability block untouched, no severities, no bare "ledger", no held-out slug, and every corpus name inside a parenthetical." The Reviewer re-ran every check at source (marker diff empty; Falsifiability block identical; list diff append-only; 0 removed lines; corpus slugs 11 tokens all at parenthesis depth ≥ 1 and all cited by FR-1..FR-4 scenarios; product/framework names none) and walked FR-1..FR-4 statement, tables, bullets and every `AND IT MUST` / `BUT NOT` clause against the block, plus design §5.5's four hand-off cases and the Bug Mode branch.

Judgment calls put to the Reviewer, both adjudicated **conforming**: (1) the marker string is written once, in the row-shape table's Absent-value cell, and the `UNVERIFIED` bullet refers to that cell — FR-1 places the marker there, NFR-6 requires identity not repetition, and T7 gate (c) is satisfied by one string; (2) the Bug Mode bullet names the four checks in a parenthetical with "defined in `/akili-propose`" — check names are FR-9 vocabulary outside NFR-3's reserved set (row shape, classes, triggers, citation rules), and the parenthetical cites the owner rather than restating.

ADVISORY (4R, recorded, not acted on): **Readability** — the block's rule (c) falsifier lists component name, comment, and field-list resemblance but not "label" (FR-3(c) names it); the obligation holds through rule (d), which classes a UI label as secondary. **Risk** — the Bug Mode parenthetical (`already fixed · live path · siblings · consumers`) is a second short enumeration of FR-9's check set before T4 ships; keep T4's check names aligned with it. → **Forward pointer for T4's brief:** name the four checks exactly as the block's parenthetical does.

| Field | Value |
|---|---|
| **T1 final status** | **PASS** (attempt 1 of 3) |
| Requirements covered | FR-1 (statement, row-shape table, three bullets, scenarios *sibling as target*, *prose-only*, *trivia*); FR-2 (class table, four bullets, scenarios *shared lifecycle hook*, *versioned path*, *changed DOM hook*, *backend-only*); FR-3 (a)–(e) and its four scenarios; FR-4 four bullets and scenarios *unreachable environment*, *consumer row reaches the task*; NFR-3, NFR-4, NFR-6 (marker bytes) |
| Decisions | Implementer on `opus` rather than the `sonnet` T2 default (Size-L prose audited term by term); Reviewer on `fable` (session model) — author ≠ auditor held. The two Implementer judgment calls stand as adjudicated (marker once; four check names in a parenthetical citing `/akili-propose`). The uncommitted spec documents (`requirements.md`, `design.md`, `tasks.md`) are committed with this task |
| Issues | none. One dispatch slip: the Leader's follow-up asking for the truncated report tail first reached a stale agent from an earlier session (`rev-T1`, kaizen-loop-closure) because of a near-identical name; re-sent to `rev-t1-3`. No attempt or round consumed |
| Execute-time spec edits | none |
| Final verification | checks 1–7 green as written (Implementer, re-run by the Reviewer); sweep 0 non-conforming; check-5 falsifier executed red on a scratch copy |
| Budget | review rounds used: 1 of 9; shipped lines: 56 of ~150 (T1 estimate ~45) |
| Continue gate | gate not answered — continued (unattended run); PASS on attempt 1 |

### T5 — `/akili-constitution` Step 7: the `design.md` template description names the ledger

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1 of 3) |
| Date | 2026-09-19 |
| Implementer | `sonnet`, effort `low` (mechanical, one line); skills: `cognitive-doc-design` |
| Reviewer | `fable`, effort `high` scaled to the < 50 LOC band (1+/1−; ADVISORY suppressed) |
| Wave | ran in parallel with T2, T3, T4 (disjoint files, no shared build output) |

**Attempt 1** — files changed: `.claude/commands/akili-constitution.md` (Step 7 item 2, one line replaced: the `design.md` template description gains "including the Premise Ledger section named in `/akili-specify` Step 2.2's *Premise Ledger* block, with its row shape and absent-values inherited from that block and never redefined here"). Implementer verification, run as `tasks.md` states it: check 1 `Premise Ledger` count 1, first hit on the Step 7 item 2 line; check 2 `git diff --numstat 571edaf` = `1 1`; check 3 backticked class-token grep = 0. Disqualifier read: names the block, copies no columns. `Not Done / Assumptions`: none. Runtime events: none.

Reviewer verdict: **PASS.** "Step 7 item 2 now names the Premise Ledger as a section of the `design.md` template and cites `/akili-specify` Step 2.2's *Premise Ledger* block for its definition, in item 3's … shape; row shape and absent-values are declared inherited from that block, and no class, trigger, or column is restated locally, satisfying FR-10 and the scenario's BUT NOT (NFR-3, DD-1, §7.1 row 15)." Re-ran checks 1–3 (file line count 1163 at both `571edaf` and the working tree) and confirmed the cited block exists at `617ee1b`.

ADVISORY: none (suppressed by band).

| Field | Value |
|---|---|
| **T5 final status** | **PASS** (attempt 1 of 3) |
| Requirements covered | FR-10 statement and scenario *new project constitution* (`BUT NOT` redefine classes or triggers locally); NFR-3 |
| Decisions | `sonnet` at `low` effort for a one-line mechanical change |
| Issues | none |
| Execute-time spec edits | none |
| Final verification | checks 1–3 green as written (Implementer, re-run by the Reviewer) |
| Budget | review rounds used: 2 of 9; shipped lines: 57 of ~150 |
| Continue gate | gate not answered — continued (unattended run); PASS on attempt 1 |

### T3 — `judgment-day`: ledger-first Hard Rule, Integration row, version

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1 of 3) |
| Date | 2026-09-19 |
| Implementer | `opus`, effort `high`; skills: `cognitive-doc-design`, `judgment-day` read as the artifact under edit |
| Reviewer | `fable`, effort `high` (15+/2−, < 50 LOC band with a full FR-7 term-by-term walk because the edit is protocol-sensitive) |
| Wave | ran in parallel with T2, T4, T5 |

**Attempt 1** — files changed: `.claude/skills/judgment-day/SKILL.md` (frontmatter `version` 1.7 → 1.8; one Hard Rule inserted directly after the count-contrast rule — three actions, six-row severity table, read-only clarification and `not re-run` inside the same bullet, protocol-unchanged sentence with the one-judge contradiction recorded as suspect with its command as run; AKILI-SPECS Integration row 1 retargeted to `/akili-specify` Step 2.5 — *Present & Approve*, **Review Design** option, usage cell gains "judges attack the Premise Ledger first"). Implementer verification, run as `tasks.md` states it: check 1 `Step 2\.3` = 0, `Step 2\.5` = 1; check 2 six pre-existing ledger lines byte-identical to `571edaf`, three added hits all "Premise Ledger"; check 3 `not re-run` = 1; check 4 backticked class tokens = 0 (all seven checked); check 5 only two `-` lines (frontmatter, Integration row), none in Decision Gates / Execution Steps / Output Contract; check 6 `version: "1.8"` = 1; held-out slugs 0; no corpus entry named; baselines re-run at `571edaf` (1 / 0 and 0). `git diff --numstat` = `15 2`. Pre-review sweep (Leader re-ran the ledger grep): six old hits unchanged, three new all "Premise Ledger"; Hard Rules list read whole — the new rule and the count-contrast rule agree that cross-document agreement is not corroboration. `Not Done / Assumptions`: one judgment call (capability wording rendered as prose, semicolon → comma). Runtime events: none.

Reviewer verdict: **PASS.** "The T3 diff satisfies FR-7 term by term, FR-8 first and third bullets, NFR-3/5/6, DD-7/DD-8 and design §5.7/§7.1 rows 8–10; all six T3 verification checks re-run green on the working tree and the Decision Gates protocol is untouched." Severity table byte-matches FR-7 cell for cell; `\bthe ledger\b` = 0; the Integration row's target verified to exist at both `571edaf` and the working tree. Judgment call adjudicated ACCEPT: design §5.7 gives the capability wording as content, not a mandated string; all three capabilities and the "where the host allows" qualifier survive, and "no-search" is the host-neutral rendering NFR-5 asks for.

ADVISORY: none.

| Field | Value |
|---|---|
| **T3 final status** | **PASS** (attempt 1 of 3) |
| Requirements covered | FR-7 (three actions, six severity rows, three bullets, scenarios *plausible premises* and *judge without a shell*); FR-8 first and third bullets; NFR-5, NFR-6 |
| Decisions | none beyond the adjudicated wording call |
| Issues | none |
| Execute-time spec edits | none |
| Final verification | checks 1–6 green as written (Implementer, re-run by the Reviewer) |
| Budget | review rounds used: 3 of 9; shipped lines: 72 of ~150 |
| Continue gate | gate not answered — continued (unattended run); PASS on attempt 1 |

### T2 — `/akili-specify`: Step 1.2, Step 2.1, Step 2.3 pointer, Step 2.5, Verification Checklist

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1 of 3) |
| Date | 2026-09-19 |
| Implementer | `opus`, effort `high`; skills: `cognitive-doc-design` |
| Reviewer | `fable`, effort `high` (9+/2− lines of long prose, treated as the 50–200 band) |
| Wave | ran in parallel with T3, T4, T5 (sequential after T1 on the same file) |

**Attempt 1** — files changed: `.claude/commands/akili-specify.md` (five hunks: Step 1.2 *claims about current behavior cite or mark* bullet after *numbers from images are not sources*; Step 2.1 *Verify premises while the code is open* paragraph with the scout rule and the Bug Mode no-Blast-Radius branch; Step 2.3 phrase swap "the opt-in Step 2.4 pass" → "the **Review Design** option of Step 2.5 — *Present & Approve*"; Step 2.5 summary sentence gains the count line, every `UNVERIFIED` row in full, the **Review Design** recommendation that "does not gate the menu, and **Continue** stays available", and the `pre-approved` no-stop clause; four Verification Checklist items). Implementer verification, run as `tasks.md` states it: check 1 `opt-in Step 2.4 pass` = 0; check 2 Step 2.5 hit at line 326 inside the Step 2.3 paragraph with **Review Design**; check 3 `Premise Ledger` = 11 (up 5 from T1's 6), hits at 142, 211, 348, 463, 464; check 4 both menus vs `571edaf` diff empty, 5 lines each; check 5 Falsifiability range diff empty, 8 lines; check 6 Step 2.3 hunk `@@ -267 +326 @@`, one line in, one out. Falsifiers for 4 and 6 executed on scratch copies (reflow → three changed lines; sixth menu option → diff non-empty). Held-out slugs 0; marker byte-identical. `git diff --numstat` = `9 2`. Pre-review sweep (Leader re-ran): seven `Step 2.[345]` hits, each naming its own step; Step 2.3 and 2.5 paragraphs read whole. `Not Done / Assumptions`: no gap; one note on check 4 (below). Runtime events: none.

Reviewer verdict: **PASS.** "All five T2 sites land as FR-5, FR-6, FR-8, FR-4 (fourth bullet), NFR-3 and NFR-6 specify them; every check the Implementer reported was re-run independently from the working tree and 571edaf and reproduced, and the disqualifier read finds no "requires" / "blocks until" wording in Step 2.5 and no restated citation rule in Step 1.2." Gate-by-gate walk recorded by the Reviewer: Step 1.2 (FR-6 bullets 1–2, NFR-3), Step 2.1 (FR-5 bullet 1, design §5.5 — matches the T1 block's Bug Mode sentence in substance), Step 2.3 (FR-8 bullets 2–3, §7.1 row 5), Step 2.5 (FR-5 bullets 2–4, scenario `AND` / `BUT NOT`, DD-11, agrees with the Approval Mode paragraph), checklist (FR-5 last bullet, FR-4 bullet 3, DD-6); Falsifiability block and Step 2.2 untouched; hunks at 142, 211, 326, 348, 463 only; coherence: no surviving sentence contradicts an insertion.

ADVISORY (recorded, not acted on): **Readability** — Step 2.5 prints the count line but not the trigger line; FR-5 does not ask for it. **Risk** — Step 2.1 and the T1 block say the four checks are "defined in `/akili-propose`", which lands with T4; T6/T7's parity read should confirm T4's names match `already fixed · live path · siblings · consumers` (T4's brief already carries this pointer; T4 shipped FR-9's names, each containing the short form).

| Field | Value |
|---|---|
| **T2 final status** | **PASS** (attempt 1 of 3) |
| Requirements covered | FR-5 five bullets and scenario *open High-impact premise*; FR-6 specify half; FR-8 second and third bullets; FR-4 fourth bullet (checklist item; Falsifiability block untouched) |
| Decisions | none beyond the brief |
| Issues | none. **Note for T7 (Implementer finding, verified by reading `tasks.md` T2):** check 4's `sed` range as written ends at option 5, so its own falsifier (a sixth option) leaves the diff empty; the Implementer compared to the closing blank line of each menu block instead, which fires. T7's gate reads should use the closing-blank-line form. Not a spec edit — `tasks.md` is left as approved; recorded here for the closure task and the retrospective |
| Execute-time spec edits | none |
| Final verification | checks 1–6 green as written (Implementer, re-run by the Reviewer); sweep 0 |
| Budget | review rounds used: 4 of 9; shipped lines: 81 of ~150 |
| Continue gate | gate not answered — continued (unattended run); PASS on attempt 1 |

### T4 — `/akili-propose`: Bug Track run order, Blast Radius section, cite-or-mark, checklist, report

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1 of 3) |
| Date | 2026-09-19 |
| Implementer | `opus`, effort `high`; skills: `cognitive-doc-design`, `systematic-debugging` (read for vocabulary, not run) |
| Reviewer | `fable`, effort `high` (17+/4− lines of long prose, 50–200 band) |
| Wave | ran in parallel with T2, T3, T5 |

**Attempt 1** — files changed: `.claude/commands/akili-propose.md` (four sites: the Bug Track *impact/scope* bullet → the **Blast Radius** bullet with the four checks under FR-9's names, the run order, and both stop outcomes; Step 2 gains the *Claims about current behavior cite or mark — every track* sentence citing the block; the Bug Diagnosis template's `### Impact & Scope` → `### Blast Radius` with the four-check table, the `n/a — <reason>` / never-`n/a` bullet, and the surviving data-integrity/security line beneath; a Review Checklist bug item; *Report To User* item 4 names the Blast Radius result). Implementer verification, run as `tasks.md` states it: check 1 `Impact & Scope` 0 / `impact/scope` 0 (baseline 1 / 1); check 2 four "blast radius" hits (Bug Track, heading, checklist, report), all naming the one section; check 3 `already fixed` 4 lines, the Bug Track line reads "runs **first**, before any root-cause work"; check 4 two marker occurrences, both byte-identical to `akili-execute.md`'s, no near-miss; check 5 `Premise Ledger` 2, both citing the block; check 6 `data integrity` 1 hit (line 215, inside the Blast Radius section); "impact" sweep 0 hits; held-out slugs 0; no backticked class tokens; falsifiers for checks 4 and 6 executed on a discarded scratch copy. `git diff --numstat` = `17 4`. Pre-review sweep (Leader re-ran): "impact" 0 hits; four "blast radius" hits, one section. `Not Done / Assumptions`: no gap; three judgment calls (below). Runtime events: none.

Reviewer verdict: **PASS.** "The diff fulfils every FR-9 table cell, all four bullets, both scenarios' `AND`/`BUT NOT` clauses, the FR-6 propose half with its scenario, and design §5.8 / §7.1 rows 11–14; all six verification checks re-run green at source and the disqualifiers (no "current branch only" history query, no restatement of citation rules (a)–(e)) are clear." Also re-run: frozen-path `git diff --stat` empty (NFR-1), `git diff --check` clean, the Bug Track paragraph read whole (symptom → reproduction → root cause → Blast Radius → fix strategy, the run-order sentence contradicting none), and the check names match the T1 block's Bug Mode shorthand (the forward pointer from T1's Reviewer, closed). Line 270's bare `` `UNVERIFIED` `` is a reference to the marker, not an instance, and does not trip T7 gate (c).

Judgment calls, all adjudicated conforming: (1) the surviving data-integrity line drops "blast radius;" because the heading now owns the name; (2) the template's marker "naming the owner who will settle it" matches FR-9 bullet 2 and the Glossary's *Settling check*; (3) check 4 passes under both the deduplicated and the per-instance reading.

ADVISORY (recorded, not acted on): **Readability** — the Bug Track bullet says each check is written "with its citation as run and its result", omitting the `UNVERIFIED` alternative the template and checklist carry. **Readability** — the Step 2 sentence paraphrases the dependence test as "the claims a design decision depends on", narrower than the block's decision / task / scope; harmless because the block governs at Phase 2.

| Field | Value |
|---|---|
| **T4 final status** | **PASS** (attempt 1 of 3) |
| Requirements covered | FR-9 (four-check table, four bullets, scenarios *ticket closed by a teammate* and *cosmetic bug*); FR-6 propose half and scenario *proposal states current behavior* |
| Decisions | none beyond the adjudicated calls; T1's forward pointer (check names aligned with the block's parenthetical) carried in the brief and confirmed closed by the Reviewer |
| Issues | none |
| Execute-time spec edits | none |
| Final verification | checks 1–6 green as written (Implementer, re-run by the Reviewer); sweep 0 |
| Budget | review rounds used: 5 of 9; shipped lines: 98 of ~150 |
| Continue gate | gate not answered — continued (unattended run); PASS on attempt 1 |

### T6 — Mirrors, `docs/flow.md`, README check, CHANGELOG

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1 of 3) |
| Date | 2026-09-19 |
| Implementer | `opus`, effort `high`; skills: `cognitive-doc-design` |
| Reviewer | `fable`, effort `high` (28+/5− across six files, 50–200 band; parity read is the gate) |

**Attempt 1** — files changed: `docs/commands/akili-specify.md` (Key Rules gains a **Premise Ledger** bullet — the only mirror that names the seven classes — and the approval bullet gains the count line / open rows / Review Design recommendation with Continue available); `docs/commands/akili-propose.md` (cite-or-mark paragraph after the structure list; Bug Track paragraph's "impact/scope" → "a **Blast Radius**" plus a four-item ordered list with run order, stop outcomes, and the `n/a` exception); `docs/commands/akili-constitution.md` (`general-setup/design.md` line gains the item-2 parenthetical in item 3's shape); `docs/skills/judgment-day.md` (one Core Rules line, ledger-first); `docs/flow.md:111` ("impact/scope" → "blast radius"); `CHANGELOG.md` `Unreleased` (three Added bullets — Premise Ledger, ledger-first judging, Blast Radius — one Fixed bullet for the two stale pointers, and the Notes line stating the proposed classification **minor** with its reasoning); `README.md` **no change**, falsifying grep run first (KZ-002): `grep -n -i "impact/scope\|impact & scope\|Step 2\.[345]\|premise" README.md` → no output, exit 1. Implementer verification, run as `tasks.md` states it: check 1 literal sweep = 0 (2 at HEAD before the edit); check 2 `Premise Ledger` per mirror 2 / 1 / 1 / 1; check 3 `No unreleased changes yet` = 0, `premise-ledger` = 4 hits on lines 11–17 inside `Unreleased`; check 4 held-out slugs 0; check 5 parity read recorded per mirror (specify PASS; propose PASS after two self-corrections during the read — an owner obligation the command does not state for *Problem / Current Behavior* removed, "do not run together" softened to the command's "do not all run at this point"; constitution PASS; judgment-day PASS); scope guard over `.claude bin scripts package.json` = 0 lines; `git diff --check` clean. Forward pointers walked: (a) the T1 block's Bug Mode parenthetical and T4's check names are the same four checks in the same order, short form vs FR-9's full names, with the parenthetical citing `/akili-propose` as the definition; (b) neither mirror names a step number for Review Design, so neither can go stale. `git diff --numstat`: CHANGELOG 11/1 · constitution mirror 1/1 · propose mirror 12/1 · specify mirror 2/1 · flow 1/1 · judgment-day mirror 1/0. Pre-review sweep (Leader re-ran check 1): 0. `Not Done / Assumptions`: no gap; one judgment call — class names and column names kept out of `CHANGELOG.md` under the strict reading of "nowhere else outside the command" (the Leader agrees: the changelog is a summary surface and the scope bullet names only the specify mirror as the exception). Runtime events: none.

Reviewer verdict: **PASS.** "All six T6 hunks conform to FR-11, NFR-3, NFR-6 and NFR-8; the parity read (FR-11 *post-sweep read*) finds no mirror sentence describing the Bug Diagnosis, the design contents, or the Review Design step differently from its command at HEAD." Reviewer's own parity read, per mirror: specify PASS (bullet matches block lines 263–311 and Step 2.5 line 348; class names appear on this line only across docs/, README, CHANGELOG); propose PASS (list matches command lines 101–103; on the Leader's question, "run after the diagnosis" and the command's "run after that" name the same moment — both texts use lowercase "the diagnosis" for the root-cause work); constitution PASS (matches command line 308); judgment-day PASS (clause for clause against SKILL.md line 26); flow PASS (numstat 1/1); CHANGELOG PASS (every factual claim checked against HEAD and `571edaf`, including the two old pointer phrases present at base and gone at HEAD; classification reasoning matches requirements §1). All Implementer checks reproduced; corpus-slug grep over the six files = 0.

ADVISORY (recorded, not acted on): **Readability** — the CHANGELOG judgment-day bullet twice says bare "ledger" ("puts the ledger before any other reading", "has no ledger"); NFR-6's gate is scoped to `SKILL.md`, and the T6 directive itself says "ledger-first judging". **Readability** — "run after the diagnosis" (propose mirror item 3, CHANGELOG Blast Radius bullet) is one capital away from a false reading; "after the root cause is confirmed" would remove the ambiguity if a later pass touches these lines.

| Field | Value |
|---|---|
| **T6 final status** | **PASS** (attempt 1 of 3) |
| Requirements covered | FR-11 three bullets and scenario *post-sweep read*; NFR-3 (mirrors cite, never redefine); NFR-8 (CHANGELOG entry written; `changes/scoped-constitution-reads` has not yet written its own — merge serially) |
| Decisions | README recorded "no change" on the falsifying grep's empty output (FR-11 bullet 2, KZ-002); class names confined to the specify mirror |
| Issues | none |
| Execute-time spec edits | none |
| Final verification | checks 1–5 green as written (Implementer, re-run by the Reviewer); parity read recorded twice (Implementer and Reviewer) |
| Budget | review rounds used: 6 of 9; shipped lines: 126 of ~150 |
| Continue gate | gate not answered — continued (unattended run); PASS on attempt 1 |

### T7 — Closure gate: global greps, literal-reader walkthrough, packaging

| Field | Value |
|---|---|
| Status | **pivot** — see `## Pivot Record: T7` below; task parked `[~]` |
| Date | 2026-09-19 |
| Delegation shape | Five workers, by design of the task: (1) gates runner (`opus`, effort `high`) ran gates (a)–(g) and the gate (b) falsifier and wrote `walkthrough.md` §1–§2; (2) a card-preparer scout (`opus`, `high`) read the 14 corpus entries and wrote 16 situation cards without lesson or outcome text plus an assembler-only key; (3) fresh-context literal reader A (`fable`) walked all 16 cards against the shipped block, judge rule, and Blast Radius text only; (4) fresh-context literal reader B (`fable`) walked Case 2 only against a scratch copy of the block with the `shared-state` trigger row deleted (the Leader made the copy; `diff` = one deleted line, shipped line 300); (5) assembler (`opus`, `high` → `xhigh` on rework) wrote §3–§6 from the verdicts, the key, and the falsifier file. Readers never saw `docs/specs/`, the corpus, the key, or each other's output (tasks.md T7 Disqualifier); the Reviewer re-verified isolation from the verdicts file's own header and grepped the cards for outcome tokens (0 hits) |
| Reviewer | `fable`, effort `high`, full sweep of the 517-line closure document by path |

**Gates (a)–(g)** — all green with command and output recorded in `walkthrough.md` §2: (a) frozen-path diffstat empty, Falsifiability block identical (8 lines); (b) the three class tokens in exactly two files; (c) one marker string, em dash confirmed, 0 near-misses; (d) held-out slugs 0; (e) 0 product hits, 23 corpus slugs all inside parentheticals; (f) 24 of 24 class × reader cells filled — observation recorded: at the Step 2.5 reader the classes are indistinguishable because the count line is indexed by status and Impact (matches design §7.2 and FR-5); (g) `verify:cli` / `pack:dry-run` / `git diff --check` exit 0/0/0, 275 files, no new packaged file. Gate (b) falsifier executed: class list pasted into a scratch copy of the judge rule → gate red (third file listed); copy deleted. Tooling note recorded: `--` before the pattern makes `--exclude-dir` parse as filenames and would have produced a false red; every gate uses `/usr/bin/grep` because the shell `grep` is a `ugrep` wrapper.

**Walkthrough (reader A, shipped text)** — case-level verdict on the key premise, scored by the assembler against the key and re-verified by the Reviewer: Cases 1, 3, 4, 6, 7, 8, 9, 10 (block), 13 (Blast Radius) **DEMANDED**; Case 5 (known-hard) **DEMANDED** with the authorship caveat (the card presented the selector as a design claim; the key locates it in a task-authored Cypress spec, outside the block's stated reach); Case 14 (held out, Blast Radius) DEMANDED on the primary bullet, **NOT DEMANDED** on the supporting bullet (no check compares deployed revisions); Case 2 (held out, block) DEMANDED on the supporting bullet, **INCONCLUSIVE** on the primary bullet; Cases 11 (cited) and 12 (held out), both judge rule, **INCONCLUSIVE** on every key premise. Controls: A 0 rows with the stated-empty line; B 2 rows, `none apply` line, 0 blast-radius rows. Row counts per retro-fitted design 6–8 against this spec's 13. **Falsifier (reader B, mutated block):** Case 2 supporting bullet DEMANDED → INCONCLUSIVE, primary bullet INCONCLUSIVE → NOT DEMANDED; reader B named the missing `shared-state` trigger row as its reason on both — the verdict moved under the mutation, meeting the literal "flips to NOT DEMANDED" criterion on one of the two bullets. **Disqualifier fires:** key-premise INCONCLUSIVEs (Cases 2, 11, 12) and a held-out NOT DEMANDED beyond the known-hard case (Case 14) → T7 fails its gate and routes to the user as a spec gap. Twelve findings recorded (`walkthrough.md` §3 F1–F12); the four that caused case failures: **F1** the judge rule's three actions do not reach an uncited row that carries no `UNVERIFIED` marker; **F2** a document-cited premise gets a demanded re-read of the document with no stated fallback past it; **F3** the `shared-state` trigger is worded for runtime state / service / base class / lifecycle hook and does not fire on a template conditional keyed off shared state; **F9** no Blast Radius check compares the deployed revision with the one in hand.

**Attempt 1 (assembler)** — files changed: `docs/specs/changes/premise-ledger/walkthrough.md` (§3–§6 + top verdict paragraph). Implementer verification: 16 rows present; 26/26 quoted sentences byte-exact substrings of the verdicts file; `git status --porcelain` shows only the untracked closure document. Runtime events: none.

Reviewer verdict: **FAIL** (4 issues), verbatim:

1. **Discovered Issue:** §3 Case 2 "Other-claim readings" says `1 D · 2 ND · 1 INC. Both ND are statements about the edit's effect`. That is reader B's mutated-block distribution (claims 1 D, 2 ND, 3 INC, 6 ND). Reader A on the shipped text gave claim 2 INCONCLUSIVE, claim 3 DEMANDED, claim 6 NOT DEMANDED → `2 D · 1 ND · 1 INC`; the document's own §4 table shows those values. Likewise F6 files claim 6 under "prediction about the edit's effect" (reader B's reason); reader A's reason for claim 6 was "Q-LP demands naming each branch point and the branch taken — only the branch the reproduction takes; nothing demanded traces the mapped branch", which is a distinct gap the findings list dropped. Case 3's `3 D · 0 ND · 1 INC` also does not reconcile with the verdicts file (4 D · 0 ND · 1 INC unless the key's parenthetical server-side bullet is counted as key, which the key column does not show).
   * **Violated Rule:** tasks.md T7 Disqualifier: the walkthrough "must see the shipped files and the pre-defect situation only" — §3 is the shipped-text record; `t7-reader-verdicts.md` Case 2 Step 3 and Summary table row 2 (`3 / 1 / 2`).
   * **Remediation:** correct Case 2's column to `2 D · 1 ND · 1 INC` and the sentence; add the mapped-branch gap (F6 or a new F13) quoting reader A; fix or explain Case 3's count.
2. **Discovered Issue:** NFR-7 is nowhere in the document. tasks.md T7 Requirements lists NFR-7 and "proposal success criteria 1–6"; the coverage table assigns "NFR-7 | T7 — read: no shipped sentence makes a command fail on a design without the section". No such read is recorded.
   * **Violated Rule:** tasks.md `### T7` Requirements row; tasks.md §3 row NFR-7; requirements.md §7 NFR-7.
   * **Remediation:** add a short NFR-7 read naming the sentences examined (Step 2.5 "SHALL NOT block", judge FR-7 report path, Bug Mode branch) with its result, and a success-criteria 1–6 mapping row.
3. **Discovered Issue:** §1 Document Control is stale scaffolding: "Task | T7 — closure gate (part 1 of 2: global gates)", "Scope of this part | Global gates (a)–(g)", "Not in this part | The 16-row literal-reader walkthrough and its block-mutation falsifier", and "Requirements covered" omits NFR-2, NFR-7 and the §8 rows — all contradicted by §3–§6 in the same file. It is the first table the user reads.
   * **Violated Rule:** tasks.md T7 Scope: "Produce `docs/specs/changes/premise-ledger/walkthrough.md`" as one closure document; `cognitive-doc-design` (lead with the answer).
   * **Remediation:** rewrite the three rows and the requirements list to describe the whole document.
4. **Discovered Issue:** Case 2's key order is inverted against the key. `t7-key.md` names "consequences contained" as the card bullet and "Other(s) auto-activates" as supporting; the document labels them (b) and (a) and lets (a) carry the case under scoring rule 1, which yields the "12 of 14" headline. On the key's primary bullet Case 2 does not reach → 11 of 14. The failure is still recorded, so this softens the headline, not the verdict. Case 13 handles its supporting bullet the opposite way (in the other-claims column).
   * **Violated Rule:** tasks.md T7 Disqualifier ("never patched", failures reported as found); `t7-key.md` Case 2 "Card bullet ... (supported by ...)".
   * **Remediation:** follow the key's primary/supporting order in Cases 2, 13, 14 and state both counts ("11 of 14 on the primary key bullet; 12 of 14 counting either bullet").

Verified by the Reviewer with no issue: gates (a)–(e) reproduced; the one-line mutation diff (`299a300`, the `shared-state` row); cards clean of outcome tokens; reader isolation; all 14 key verdicts against the key and the verdicts file; every quoted sentence byte-exact with no parenthetical content; §5 and §6 figures; reader B quotes; the confound named; the criterion reported as partially met. ADVISORY: §6 rounds/rework figures to update after this FAIL; §4 bold outcome line to lead with the stricter reading; gate (g) evidence rule to say it records exit codes and decisive lines.

**Leader adjudication:** all four issues are record-fidelity defects in the closure document, none about the gate outcome, and each is in T7's scope (tasks.md T7 Requirements names NFR-7 and the success criteria; the Disqualifier binds the record to the shipped-text reader). Attempt consumed (Reviewer FAIL). The assembler's context survived, so attempt 2 is delivered by message with the report verbatim, an Attempt History line, and effort bumped `high` → `xhigh`. Budget: review rounds now 7 of 9; attempt 2's review will be the 8th.

**Attempt 2 (assembler, same context, effort `xhigh`)** — files changed: `docs/specs/changes/premise-ledger/walkthrough.md` (Case 2 other-claim column corrected to reader A's `2 D · 1 ND · 1 INC`; new finding F13 — the `live-path` row names only the branch taken, nothing traces the mapped branch — quoting reader A; F6 narrowed to claim 2; Case 3 reconciled by showing both key bullets; Case 13 column corrected; new §7 with the NFR-7 read — 26 hits in 9 files, the four sentences that could bind an existing design bind the design being authored or a judge finding, the Bug Mode branch handles an older proposal, `premise` absent from the other eight commands: **NFR-7 holds** — and the proposal success-criteria mapping — 1, 3, 4, 5, 6 met, **2 not met** (judge rule vs bilateral-review's three premises); §1 Document Control rewritten for the whole document with the gate (g) recording exception stated; Cases 2, 13, 14 relabelled primary/supporting per the key; headline "11 of 14 on the primary key bullet, 12 of 14 counting either"; §6 review rounds 8, rework consumed 1; §4 lead line reordered). Implementer verification: 0 ragged tables, 16 case rows, 556 lines, 7 sections, changed quotes re-checked byte-exact; `git status --porcelain` = `M execution.md` (the Leader's log write) + `?? walkthrough.md`. Runtime events: none.

Reviewer verdict (confirm-only, same Reviewer, context intact): **PASS** on the document. "All four issues are closed with the reader files as source and nothing regressed; the document is now a faithful record. PASS is on the document only — the T7 gate result it records is still FAIL, routed to the user as a spec gap." Re-run by the Reviewer: NFR-7 grep (26 hits / 9 files) and the `premise` grep (0) reproduced; the four cited lines verified; Case 2/3/13 arithmetic reconciled; disqualifier tally restated as six key-premise INCONCLUSIVE plus one held-out NOT DEMANDED across four cases (Case 11: 3, Case 12: 2, Case 2: 1; Case 14: 1). No packaged file changed.

| Field | Value |
|---|---|
| **T7 final status** | **pivot** — the closure document is complete and Reviewer-PASSed as a record; the gate it records **fails** per T7's Disqualifier; task parked `[~]` pending the user's decision on the Pivot Record below |
| Requirements covered | NFR-1, NFR-3, NFR-4, NFR-6 (gates a–e); NFR-2 (row counts, controls); NFR-7 (§7 read — holds); FR-2 last bullet (gate f); `requirements.md` §8 rows *rule a literal reader cannot execute* (the walkthrough — **fires** on F1/F2/F3) and *ceremony* (row counts 6–8 vs 13 — no signal); proposal success criteria 1, 3–6 met, 2 not met |
| Decisions | Walkthrough structured as card-preparer + two isolated fresh readers + assembler so the reader never sees lesson text, the key, or the spec (T7 Disqualifier); the falsifier used a second fresh reader because one reader cannot un-see the shipped text (confound recorded). Scoring rule: the case verdict is the reader's verdict on the key's primary bullet; distractor claims (design decisions, new-behavior specs, mixed statements) are reported separately and never soften or harden a case. Kaizen lesson KZ-005 applied by the card scout (slug headers kept; the leak grep's single hit is the substring "later" inside "bilateral") |
| Issues | 1 Reviewer FAIL on record fidelity (four issues, all closed on attempt 2). The gate failure itself is the spec gap recorded in the Pivot Record |
| Execute-time spec edits | none — approved documents untouched pending the user's decision |
| Final verification | gates (a)–(g) green with outputs; walkthrough 16/16 rows with quoted sentences; falsifier executed (partial flip, recorded); row counts reported; budget actuals compared |
| Budget | review rounds used: **8 of 9** (T1–T6 one each, T7 two); shipped lines 126 of ~150; rework attempts consumed 1 of 2 estimated. Option B of the Pivot Record would exceed the review-round budget — flagged there as a tripwire the user approves with the pivot |
| Continue gate | **stopped for the user** — a Pivot is an exception the unattended run condition never absorbs |

## Pivot Record: T7

**Trigger.** T7's own Disqualifier (`tasks.md`): "Any `INCONCLUSIVE` or any held-out `NOT DEMANDED` other than the known-hard case **fails this task** and goes to the user as a spec gap (Pivot Protocol), never patched by widening a task." The fresh-context walkthrough (`walkthrough.md` §3) returned key-premise `INCONCLUSIVE` on Cases 2, 11, 12 and a held-out `NOT DEMANDED` on Case 14's supporting bullet. The rework loop is stopped with one attempt consumed; T7 is parked `[~]`. Everything shipped in T1–T6 stays committed and Reviewer-PASSed — the gap is in what the approved text *demands*, not in how it was implemented.

**Blocker — what the shipped text does not literally demand** (from `walkthrough.md` §3 Findings; the reader's words are quoted there):

| # | Gap | Where the wording lives | Case(s) |
|---|---|---|---|
| F1 | The judge rule's three actions (re-run every citation · refute every `UNVERIFIED` row · look for premises with no row) do not reach a row whose citation cell holds neither a citation nor the marker. The severity table still yields *severe*, but no re-derivation is demanded | `requirements.md` FR-7 (the three numbered actions) → `judgment-day/SKILL.md` Hard Rule (T3) | 11 (cited), 12 (held out) |
| F2 | A premise cited to a document gets a demanded re-read of the document, which tests the document, not the system; the `not re-run` degrade branch is written for a cited command | FR-7 bullets (read-only clarification) → the same Hard Rule | 11, 12 |
| F3 | The `shared-state` trigger — "changes state, a service, a base class, or a lifecycle hook that more than one component uses" — does not fire on a template conditional keyed off the same underlying state | `requirements.md` FR-2 class table → the block's trigger table (T1) → the specify mirror (T6) | 2 (held out) |
| F9 | No Blast Radius check compares the revision each environment runs; *Already fixed?* looks for a fix in history, not for what is deployed | `requirements.md` FR-9 four-check table → `akili-propose.md` (T4) | 14 (held out, supporting bullet only — the primary bullet was DEMANDED) |

All four sit in the **approved requirements**, so each is a spec gap rather than an implementation drift: the shipped text mirrors FR-7, FR-2, and FR-9 faithfully, and the Reviewer PASSed T1, T3, T4 term for term against them. This is the outcome the closure gate exists to produce (DD-13, KZ-changes--gate-falsifiability-1) — it surfaced at the gate instead of in a consuming project's next `judgment-day` run.

**What held.** Gates (a)–(g) green; 12 of 14 cases DEMANDED counting either key bullet (11 of 14 on the primary bullet alone); both negative controls at zero blast-radius rows; the known-hard case reached; the block-mutation falsifier moved the verdict under the mutation. Row counts on the retro-fitted designs are 6–8 against this spec's 13 (NFR-2 read: no ceremony signal).

**Alternatives.**

| Option | What changes | Cost | Consequence |
|---|---|---|---|
| **A — Accept as known limits.** The user amends T7's Disqualifier to exempt F1/F2/F3/F9, T7 closes on the walkthrough as evidence, the four findings enter the kaizen retrospective and the next proposal's input | `tasks.md` T7 only; no shipped text | 0 shipped lines; 1 review round to close T7 (9 of 9) | The judge rule ships knowing a literal judge skips uncited-unmarked rows and document citations. A conforming ledger never contains such rows (the block forbids blanks and classes documents as secondary), so the exposure is limited to nonconforming ledgers — which are exactly what judges exist to catch |
| **B — Amend FR-7 and FR-2, reopen T3 and T1's trigger row, re-walk the three cases** *(recommended)* | `requirements.md` FR-7 gains one action or clause: a row whose citation cell holds neither a citation as run nor the marker, or whose citation points at a secondary source (block rule (d)), is treated as `UNVERIFIED` — the judge tries to refute it at the primary source, or reports it `not re-run`. FR-2's `shared-state` trigger gains "or a condition or signal that more than one template block or component reads". `design.md` §5.2/§5.7 and §11 P-rows updated; T3's Hard Rule and T1's trigger row re-edited; T6's specify mirror and CHANGELOG touched; T7 re-runs gates (a)–(g) and re-walks Cases 2, 11, 12 with fresh readers | ~4–6 shipped lines; T1, T3, T6 reopened as scoped amendments; ~3 review rounds → **budget tripwire: 9 estimated, ~11 actual** — the user approves the overrun with the pivot | Closes F1–F3 at their source with two clauses; F9 stays out (below) |
| **C — Defer F1–F3 to a follow-up spec** (`hitl-row-schema` is next in the series; or a `premise-ledger-2` proposal) and close T7 as in A | as A, plus a proposal stub | as A | Same exposure as A until the follow-up ships; keeps this spec's budget intact |

**F9 in every option:** recorded as an input to the series, not amended here. A deployed-revision comparison is an environment fact, outside FR-9's "code premise" framing; the case's primary bullet ("no change on any branch") *was* DEMANDED by *Already fixed?* across all branches, which is what would have found the merged fix on `staging`.

**Recommended direction: B.** The two FR-7 clauses are exactly the kind of one-sentence, mechanism-phrased rule the block already carries for the author (rule (d)); the judge needs the mirror of it. The `shared-state` wording fix is one clause. The overrun is two review rounds on a nine-round budget, spent on the finding the closure gate was built to produce.

**ADR impact:** none — this repository has no TRD.

**Held until the user decides:** no approved document (`requirements.md`, `design.md`, `tasks.md`) has been edited. On approval of B the Leader amends them, runs the two-direction Correction Closure sweep across the spec folder, records each edit in this log, and **re-issues the T1 and T3 briefs with the amended text** before any Implementer is spawned (Pivot Protocol step 4). On A or C the Leader amends `tasks.md` T7 as the user directs and closes T7 on the existing walkthrough.

### Pivot resolution — Option B approved

| Field | Value |
|---|---|
| Date | 2026-09-19 |
| Decision | The user was presented with the Pivot Record's three options and answered *"lo que pienses que es mejor para nuestra metodología"* — the choice delegated to the Leader, which the Leader exercises as **Option B**, the recommendation it had already put in writing. The budget overrun named in Option B is approved with it |
| Spec edits made by the Leader (Pivot Protocol step 3) | `requirements.md`: FR-2's `shared-state` trigger row gains "or a condition or signal more than one block or component reads"; its sibling bullet defines a sibling by *reading* rather than ownership; a new scenario *sibling block on the same condition*. FR-7 gains the bullet *A row the citations cannot settle is attacked, not merely scored* and two scenarios, *premise with no citation at all* and *premise cited to a document*. Document Control gains a **Pivot amendment** row; the §9 index rows for FR-2 and FR-7 name the new scenarios. `design.md`: §5.3's trigger row and §5.7's rule contents amended; **DD-14** (the judge rule reaches a row its citations cannot settle) and **DD-15** (the trigger is worded by what is read, not by what holds it) added rather than rewriting DD-7/DD-8 in place; §7.1 gains surface rows 20–22; §13 re-sized to 10 tasks · ~160 lines · 12 rounds with the overrun stated. `tasks.md`: §2b added with **T8**, **T9**, **T10**, their graph, the held-out restatement for the re-walk, four coverage rows, and three estimate rows |
| Held out, still | `bugfix--toc-unmapped-orange-notes` and `changes--kp-cgspace-browse` are re-walked in T10, so neither is named in the amended requirements or in any shipped file. The new FR-7 scenarios cite only `changes--bilateral-review-ux-polish`, already cited before the pivot; the new FR-2 scenario is generic |
| Not amended | **F9** (no deployed-revision comparison in the Blast Radius) — an environment fact outside FR-9's code-premise framing, recorded as an input to the series. F4–F8 and F10–F13 stay as recorded findings; none caused a case failure |
| Correction Closure sweep (two directions) | **Forward** — `grep -rn "a base class, or a lifecycle hook"` over the spec folder: 6 hits. The two live rule sites (`requirements.md` FR-2 table, `design.md` §5.3) carry the amended wording; the remaining four are historical records that must keep the superseded text — `execution.md` F3, `walkthrough.md` F3 and F11 (the reader's own words), and `walkthrough.md` §4's quotation of the base trigger row. `grep -rn "three actions"`: every live site amended, the rest historical or T8's own scope. **Backward** — `grep -rn "FR-7"` and the §5.3/§5.7 references: `design.md` §7.1 rows 8–9 and §11 P-11 re-read, both still true; `tasks.md` T3's Requirements row describes what T3 shipped and is superseded by T8, which the §2b note states |
| Briefs to re-issue (Pivot Protocol step 4) | none outstanding — no Implementer brief was in flight when the gate fired |

### T8 — `judgment-day`: the reach clause in the ledger-first Hard Rule

| Field | Value |
|---|---|
| Status | **PASS (degraded-pair: opus/sonnet)** (attempt 1 of 3) |
| Date | 2026-09-19 |
| Implementer | `opus`, effort `high`; skills: `cognitive-doc-design`, `judgment-day` read as the artifact under edit |
| Reviewer | `sonnet`, effort `high` — see the runtime events line and `## REVIEW_WAIVED: T8` below |
| Wave | ran in parallel with T9 (disjoint files) |

**Attempt 1** — files changed: `.claude/skills/judgment-day/SKILL.md` (the reach clause inserted between the three actions and the severity table, inside the same bullet per DD-7; `version` 1.8 → 1.9). `docs/skills/judgment-day.md` recorded **no change** on the falsifying grep (KZ-002): `grep -n -i "unverified\|citation\|secondary" docs/skills/judgment-day.md` returned one line, the Core Rules summary, which is abbreviated rather than false. Implementer verification, run as `tasks.md` states it: check 1 `secondary source` = 1; check 2 `not re-run` = 2; check 3 `version: "1.9"` 1 hit and `1.8` = 0; check 4 ordering ascending — action sentence 26, clause 28, severity table header 30; check 5 backticked class tokens 0, only "rule (d)" named; check 6 two hunks only, no `-` line in Decision Gates, Execution Steps, or Output Contract. `git diff --numstat` = `3 1`. Pre-review sweep (Leader re-ran, Hard Rules list read whole): the reach clause routes both row states into action 2 and adds no action; it does not contradict the count-contrast rule. `Not Done / Assumptions`: one judgment call (below). **runtime events: provider-limit death ×1 → rung 3 (different model).**

Reviewer verdict: **PASS.** "The inserted clause names both fallen-through row states (empty citation cell; secondary-source citation), routes both into action 2 exactly as DD-14 specifies, imposes an explicit search duty … and for the document branch explicitly sends the judge past the document to the primary source." All six checks reproduced; no held-out slug, corpus name, or class token leaked — which the Reviewer was asked to weigh especially, because T10 re-walks two of those cases against this exact text.

Judgment call adjudicated **sound**: the surviving sentence "this rule sets only what a bad row costs" bounds the rule against the Premise Ledger block, which owns row shape and classes, not against the rule's own search actions — actions 1–3 already required search before this amendment, so the clause extends action 2 rather than widening what the rule is for. Mirror "no change" adjudicated **sound**: the mirror's line is a high-level summary that already omits the severity table and the round ceiling, and "try to refute every `UNVERIFIED` row by its own search" remains true and claims no exclusivity.

ADVISORY: none (suppressed by band).

## REVIEW_WAIVED: T8

| Field | Content |
|---|---|
| `flag` | `degraded-pair` |
| cause | The Reviewer spawned for this task on `fable` (the session model at the time, standing in for T3) died mid-task: *"You're out of usage credits. Run /usage-credits to keep using Fable 5.1 or /model to switch models."* That is a **provider-limit death**, a runtime event — no attempt consumed. The Reviewer ladder was climbed to **rung 3, a different model**: rungs 1 and 2 (retry, retry-after-N) were skipped because an exhausted credit balance is deterministic rather than transient, and the ladder's entry rule sends a provider-limit death past a retry that cannot succeed. Rung 4, the waiver, was **not** reached — an independent context on a different model did audit the diff |
| approved by | Not a user stop. The correctness gate was **kept**, not removed: `author ≠ auditor` holds (Implementer `opus`, Reviewer `sonnet`, independent context, diff-only brief). This record exists because the auditor sat **below** the packaged T3 tier, so the metric stays honest; the user is told in the run report |
| verification that stood in | None stood in — the full audit ran. The Reviewer independently reproduced checks 1–6, the held-out and class-token greps, and both judgment calls |
| models | Implementer `opus` / auditor `sonnet` |

| Field | Value |
|---|---|
| **T8 final status** | **PASS (degraded-pair: opus/sonnet)** (attempt 1 of 3) |
| Requirements covered | FR-7's amended bullet *A row the citations cannot settle is attacked, not merely scored* and both new scenarios, *premise with no citation at all* (`AND IT MUST` report what the search returns · `BUT NOT` discharged by recording the severity alone) and *premise cited to a document* (`BUT NOT` count the document's agreement as confirmation); NFR-3, NFR-5, NFR-6 |
| Decisions | The clause routes both row states into action 2 rather than adding a fourth action (DD-14). Reviewer moved from `fable` to `sonnet` on the provider-limit death, preserving author ≠ auditor over restoring the tier — the alternative, `opus`, would have made author and auditor the same model, which is the property the gate exists for |
| Issues | none |
| Execute-time spec edits | none |
| Final verification | checks 1–6 green as written (Implementer, reproduced by the Reviewer); mirror "no change" recorded with its grep |
| Budget | review rounds used: **9 of 12** (re-sized at the pivot); shipped lines 130 of ~160 |
| Continue gate | gate not answered — continued (unattended run); PASS on attempt 1 |

### T9 — `/akili-specify`: the `shared-state` trigger reaches a shared condition

| Field | Value |
|---|---|
| Status | **PASS** (attempt 2 of 3) |
| Date | 2026-09-19 |
| Implementer | `sonnet`, effort `medium` (attempt 1) → `high` (attempt 2); skills: `cognitive-doc-design` |
| Reviewer | `opus`, effort `high` (1+/1−, < 50 LOC band with a term-by-term FR-2 walk) — author ≠ auditor held by model |
| Wave | ran in parallel with T8 (disjoint files) |

**Attempt 1** — files changed: `.claude/commands/akili-specify.md` (the `shared-state` trigger row of the Step 2.2 block: trigger widened with "or a condition or signal more than one block or component reads", *must contain* cell gains a sibling definition). `docs/commands/akili-specify.md` recorded **no change** on the falsifying grep (KZ-002): one hit, line 62, which cites the block by name and lists the seven classes without wording any trigger. Implementer verification: check 1 `condition or signal` = 1; check 2 `more than one component uses` = 1; check 3 `git diff --numstat 178ce97` = `1 1`; check 4 class-table line 291 byte-identical; check 5 Falsifiability-block diff empty; check 6 held-out slug grep = 1 hit, the pre-existing one. Runtime events: none.

Reviewer verdict: **FAIL** (1 issue), verbatim:

1. **Discovered Issue:** The trigger fires on "a condition or signal more than one block or component reads", but the *must contain* cell defines a sibling as "any reader of that **state or condition**". The word *signal* is dropped. A literal reader whose trigger fired on a signal has no definition telling them a signal reader is a sibling, so the enumeration obligation has no subject on that branch. Under NFR-3 this block is the only place the definition ships, so the term is absent everywhere.
   * **Violated Rule:** `requirements.md` FR-2, the sibling bullet: "A **sibling** is any reader of the same state, condition, or signal — including another conditional block in the same template — not only a component that owns it." `design.md` §5.3 as amended carries the same two-term drop, so the divergence originates upstream of this diff, not in the Implementer's transcription.
   * **Remediation Suggestion:** In `.claude/commands/akili-specify.md:300`, read "a sibling is any reader of that state, condition, or signal, a conditional block in the same template included". Align `design.md` §5.3's row to the same three terms so the design and the shipped line stay byte-comparable for T10's gate (a)–(g) re-run.

**Leader adjudication:** the issue stands, and the Reviewer's upstream trace is correct — **the defect originated in the Leader's own pivot edit to `design.md` §5.3**, which dropped a term the approved FR-2 bullet carries; the Implementer transcribed the design faithfully. Attempt consumed (Reviewer FAIL). Before re-briefing, the Leader corrected `design.md` §5.3 and extended DD-15 to state the alignment over all three read-targets — an **execute-time spec edit** that restores conformance to an approved requirement rather than changing its meaning, so it is an edit and not a Pivot (recorded here at the moment it was made, and carried into the Reviewer brief as a named conformance check). Attempt 2 delivered by message to the same Implementer with the report verbatim, an Attempt History line, and effort bumped `medium` → `high`.

**Attempt 2** — files changed: the same one line, now reading "a sibling is any reader of that state, condition, or signal, a conditional block in the same template included". Implementer re-ran all six checks plus the mirror grep and the sweep: unchanged readings, `1  1`, class table and Falsifiability block identical, sweep shows two `shared-state` hits with *sibling* defined once. Leader re-ran the term-for-term comparison between the shipped line and `design.md` §5.3: identical. `Not Done / Assumptions`: none. **runtime events: provider-limit death ×1 (session limit), idle-without-report ×1 → recovered at the original auditor after the limit reset; a fresh replacement Reviewer had been dispatched on the same tier and is redundant.**

Reviewer verdict (same Reviewer, context intact): **PASS.** "The sibling definition now spans the same three read-targets the trigger names, so no branch of the widened trigger reaches a row whose definition does not, and the closed set of seven classes and three triggers survives untouched." Eight confirmations re-run at source: same three read-targets on both sides; `1  1`; class-table line 291 diffs empty; the Falsifiability block begins at line 406 and the only changed line is 300, so it cannot have moved; *sibling* defined once; seven class rows and three trigger rows with `other` still the stated fall-through; zero held-out slugs; design and shipped line agree term for term, so T10's comparison has a clean match. Mirror "no change" adjudicated **correct** under FR-11.

ADVISORY: none (suppressed by band).

| Field | Value |
|---|---|
| **T9 final status** | **PASS** (attempt 2 of 3) |
| Requirements covered | FR-2's amended `shared-state` trigger row, its amended sibling bullet, and the scenario *sibling block on the same condition* (`AND IT MUST` include blocks whose gate resolves to the same state · `BUT NOT` read as untriggered because no service, base class, or lifecycle hook changed); NFR-3, NFR-4 |
| Decisions | The amendment widens the third trigger rather than adding a fourth or an eighth class, so §7.2's class × reader enumeration stays true (DD-15) |
| Issues | 1 FAIL — a dropped term between the trigger and its definition, **originating in the Leader's spec edit**, not the implementation. Noted for the retrospective: the pivot amendment was written into `design.md` without re-reading the approved FR-2 bullet term by term, which is the same class of defect KZ-changes--gate-falsifiability-2 names, one level upstream |
| Execute-time spec edits | `design.md` §5.3 row and DD-15 — aligned to FR-2's three read-targets (state, condition, signal), made before attempt 2 and carried into the Reviewer brief as a named conformance check |
| Final verification | checks 1–6 green as written (Implementer, reproduced by the Reviewer); mirror "no change" recorded with its grep; shipped line and `design.md` §5.3 agree term for term |
| Budget | review rounds used: **11 of 12** (re-sized at the pivot); shipped lines 130 of ~160 |
| Continue gate | gate not answered — continued (unattended run); PASS on attempt 2 |
