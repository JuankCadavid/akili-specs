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
