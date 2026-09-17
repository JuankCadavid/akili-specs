# Execution Log: Kaizen Loop Closure

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/kaizen-loop-closure` |
| Depth | Standard |
| Approval Mode | `pre-approved (user, 2026-09-17 — "execute yolo mode")` — routine continue gates auto-pass and are logged; HALT, Pivot, budget tripwire, FATAL_FAIL still stop |
| Started | 2026-09-17 |
| Leader model | Fable 5.1 (session model; no `## Model Routing` registry in this repo's root guides — packaged default `docs/model-routing.md` T1 = `opus` alias, session model stronger, passed silently) |
| Implementer model | `sonnet` (T2, packaged default) — fallback sub-prompt path seeded by pointer to `.agents/implementer.md` (no Step 8E wrappers in this repo) |
| Reviewer model | `opus` (T3, packaged default) — fallback sub-prompt path seeded by pointer to `.agents/reviewer.md`; author ≠ auditor held by model |
| Budget (design §12) | 6 tasks · ~230 lines (prose) · 1 review round per task — trip on the second FAIL of any one task |
| Commit prefix | `[SPEC:changes/kaizen-loop-closure]` |
| Wave plan | Wave 1: T1. Wave 2: T2 ∥ T3 ∥ T4 (disjoint files; no shared build output — prose only). Wave 3: T5. Wave 4: T6 (closing gate) |
| Brief discipline | Reports open with `STATUS:` and stay under ~600 words (field lesson from the evidence corpus: the harness caps a worker's returned result and the verdict line was the one lost); verification runs foreground |

## 2. Task Execution History

### T1 — Kaizen skill: three-context Branch Context, exclusive writer, re-verify, upstream report

| Field | Value |
|---|---|
| Status | **IN PROGRESS** — attempt 1 FAIL, attempt 2 dispatched |
| Date | 2026-09-17 |
| Implementer | `sonnet`, effort `high` (attempt 1) → `xhigh` (attempt 2); skills: `cognitive-doc-design` (task default, kept) |
| Reviewer | `opus`, effort `high` |

**Attempt 1** — files: `.claude/skills/kaizen/SKILL.md` (50+/23−). Implementer verification: greps 1–5 green (description untouched; 6 `Integration Branch` hits none adjacent to git heuristics; 6 `superseded|upstreamed|upstream-` lines, `upstream-` only in step 4b; zero "only on the default branch"; zero union phrases); `git diff --check` clean; disqualifier re-reads confirmed (3b forbids investigation; Standardize table has three rows; no Kind/Status row removed; digest cap/columns intact). Implementer declared a judgment call: four adjacent restatements of the reachability rule aligned beyond the task's literal section list (Standardize menu line + closing paragraph, Record item 4, Kaizen Log Format boilerplate). **Leader adjudication:** in scope — T1 owns the whole file and KZ-001 binds restatements to the changed rule; not scope owed.

Reviewer verdict: **FAIL** (1 issue), verbatim:

1. **Discovered Issue:** Step 2 now reads "Group by `Target` — a file path, a `KZ-id` for `digest-update` items, or the literal `methodology` for `upstream` items", but the three grouping cases under it are unchanged and were written for file targets. A backlog with several `upstream` items shares one `Target` (`methodology`) with differing `Edit` text, which reaches case 3: "Differing `Edit` text targeting the same file | **Decide**: quote both proposals side by side … and let the user choose. Never apply both silently". That forces the user to pick one upstream item, so only that one survives to step 4b. The competing reading — `methodology` is not a file, so cases 2 and 3 do not apply and upstream items pass through to step 4 — is equally available from the shipped text. Two sentences can be read to disagree on the spec's headline scenario.
   - **Violated Rule:** `requirements.md` FR-5, "Scenario: Apply pass with Methodology lessons in the backlog" — "GIVEN 25 `upstream` items across 20 entry files on the integration branch / WHEN Apply Mode runs / THEN one report file is written listing all 25, each item flips to `upstreamed`". Scope note: `design.md` §7 row 7 confines the Apply Mode edit to "Apply Mode, opening paragraph + step 1", and `tasks.md` T1's Apply Mode bullet lists opening sentence, step 1, 3b, 4b, step 5, step 6 — step 2 is not among them, so this surface was not adjudicated with the four restatement edits.
   - **Remediation Suggestion:** Add one clause to step 2, e.g. "`upstream` items are never merged, deduped, or decided among here — they group under `methodology` and are collected whole in step 4b." Reverting the step-2 addition is the alternative and returns the surface to design row 7's scope, but leaves `methodology` absent from the grouping-key list.

Reviewer's DD-9/FR-8 reading (left to the Leader): keeping `description:` byte-identical is correct under T1 verification 1 as written; the surviving clause "then apply the pending backlog on the default branch" matches none of FR-8's grep phrases but is the file's only remaining where-apply-runs claim that is false in a pinned project (all 17 other `default branch` hits checked: pin, fallback, non-writing row, or accepted residual).

**Leader decisions (attempt 1 → 2):**
- Issue 1 stands: FR-5 scenario is the spec's headline; fix per remediation (add the clause; keep `methodology` in the key list). Effort bumped to `xhigh`.
- DD-9 vs FR-8 adjudicated for FR-8: DD-9's intent is *unchanged triggers* (the discovery field), not an unchanged line. The trailing clause is rewritten to "on the apply-capable branch" with every trigger phrase byte-identical. **T1 verification 1 amended in `tasks.md`** (recorded inline there with this date) to check trigger identity instead of line identity. Not a pivot — a verification-wording correction within FR-8's existing requirement.
- ADVISORY (recorded, no rework): READABILITY — the predicate's gloss is restated in three places (Standardize row 3, Apply Mode opening, Writable set row 2); all agree; left as is, the Standardize gloss is task-mandated. RELIABILITY — the decline line's "by its pinned name" has no referent in a no-pin legacy project, and the Standardize spec-branch row says "the apply-capable branch" without naming it. **Leader-adopted into the attempt-2 brief as a conformance refinement of FR-7/FR-3** (legacy no-pin behavior must be byte-equivalent and the decline must name a branch that exists): the decline names the apply-capable branch — its pinned name, or the resolved default branch when no pin exists. Recorded here as a Leader decision so it is not mistaken for advisory-driven scope growth.

**Attempt 2** — files: `.claude/skills/kaizen/SKILL.md` (51+/24−). Edits: step 2 lead-in scoped (Merge → `KZ-id`; Dedupe/Decide → file targets; `upstream` exempt, collected whole in 4b); `description:` trailing clause → "apply-capable branch" (8 trigger phrases byte-identical, amended verification 1 green); decline sentence names the apply-capable branch with the no-pin fallback. Leader pre-review catch: the first attempt-2 wording said "the three outcomes apply only to file targets", contradicting case 1 (`KZ-id`) — returned to the Implementer as brief non-conformance (not a Reviewer round), corrected before review. Implementer verification: greps 1 (amended)–5 green, `git diff --check` clean, disqualifier re-reads unchanged.

Reviewer verdict: **FAIL** (1 issue) — all three changed regions confirmed correct; the issue is a pre-existing gap in an unchanged region made unambiguous by the step-2 fix. Verbatim:

1. **Discovered Issue:** Step 3b applies to "each item the user approved" with no `Kind` carve-out, and its first clause is "confirm the `Target` still exists at HEAD". An `upstream` item's `Target` is the literal `methodology` (Kind table), which is not a path in the project, so that clause cannot succeed. 3b permits "Three outcomes only", none of which fits: the refuted branch closes every upstream item as `superseded (reason)`, after which 4b's "If no `upstream` items were approved this pass, skip this step and write no file" produces no report at all; the unverifiable branch instead sends every upstream item to the user as unverifiable. The shipped text affirmatively routes them through 3b — step 4 says "`upstream` — handled in step 4b" and 4b's precondition reads "every approved and re-verified `upstream` item" — so the ambiguity is closed in the wrong direction.
   - **Violated Rule:** `requirements.md` FR-5: "Apply Mode SHALL collect every `pending`/`deferred` `upstream` item into one **upstream report**"; scenario "Apply pass with Methodology lessons in the backlog" — "GIVEN 25 `upstream` items across 20 entry files on the integration branch / WHEN Apply Mode runs / THEN one report file is written listing all 25, each item flips to `upstreamed`". Under either 3b outcome, zero are listed. Note also that 4b's "approved and re-verified" is narrower than FR-5's "every `pending`/`deferred`".
   - **Remediation Suggestion:** One clause in 3b, e.g. "`upstream` items are exempt: their `Target` is the literal `methodology`, not a path, and their `Edit` names no fact in this repository — they pass to step 4b unprobed." Same-surface alternative: restate 4b's precondition as "every approved `upstream` item". Whether the HITL menu still gates the report write is your call; the skill's "every edit outside the entry file requires this approval" rule argues for keeping it, and FR-5 does not forbid it.

ADVISORY (recorded): READABILITY — `tasks.md` T1 Scope bullet "Frontmatter `description:` — untouched (DD-9)" contradicts the amended verification 1. **Leader action:** scope bullet amended in `tasks.md` in the same pass (work-order coherence, Leader-owned document).

## Budget tripwire: T1 (2026-09-17)

| Field | Value |
|---|---|
| Budget line tripped | `design.md` §12 "Review rounds: 1 per task — trip on the second FAIL of any one task" |
| Actual | T1: 2 Reviewer FAILs (attempts 1 and 2); other budget lines unaffected (tasks 6/6 planned; skill delta 51+/24− vs ~110 estimated) |
| Cause (Leader hypothesis) | Both FAILs are the same class: the new `Kind: upstream` interacts with **pre-existing** Apply Mode steps (step 2 grouping cases; step 3b's path-based probe) that `design.md` §7 rows 7–9 did not enumerate per Kind. The design named the steps to add (3b, 4b, 5.0) but never walked the existing steps against the new Kind — the KZ-004 fall-through class applied to a design rather than a scan. Neither FAIL is a wrong requirement; FR-5 is unambiguous and the fix is one clause in 3b plus one word in 4b's precondition. Not a Pivot |
| Remaining ceiling | 1 rework attempt (attempt 3 of 3) before HALT |
| Leader recommendation | Proceed to attempt 3 with the Reviewer's remediation (3b carve-out for `upstream`: `Target` is `methodology`, no fact in this repo, pass to 4b unprobed; 4b precondition "every approved `upstream` item" — HITL approval kept per the skill's standing rule); then re-review. Record the per-Kind walk of existing steps as a Methodology kaizen candidate at archive |
| Decision | **Awaiting user** (pre-approved mode never covers a tripwire) |

**Tripwire decision (user, 2026-09-17):** proceed to attempt 3 with the Reviewer's remediation; on a third FAIL, HALT per Step 4. Effort stays `xhigh` (already at the ceiling for T2).

**Attempt 3** — files: `.claude/skills/kaizen/SKILL.md` (53+/24−). Edits: 3b gains a trailing carve-out (`upstream` items exempt from the probe — `Target` is the literal `methodology`, no fact in this repo — pass to 4b unprobed); 4b precondition "every approved and re-verified" → "every approved". HITL gate kept for `upstream` (Leader decision: a write outside the entry file needs approval per the standing rule). Implementer verification: greps 1 (amended)–5 green; `git diff --check` clean; removed-line count 25 unchanged (no row deleted); per-step walk of an `upstream` item through Apply Mode steps 1–6 recorded in the report (collect → group under `methodology`, exempt → menu → 3b exempt → 4 routes to 4b → 4b report + `upstreamed` → 5 no digest row → 6 status named).

Reviewer verdict: **PASS.** "The 3b carve-out and the narrowed 4b precondition close the FR-5 gap. Every approved `upstream` item now reaches step 4b on a single unambiguous path, the probe is untouched and still bounded for every other `Kind`, and no new contradiction appears among 3b, 4, 4b and the Standing rules. All five verifications reproduce green at repo root and the declared invariants are intact." Reviewer re-ran the greps independently (7 / 7 with `upstream-` only in 4b / 0 / 0; `Kind` 6 rows, `Status` 6 rows; digest columns and cap untouched). Non-gating wording tension noted and rejected: step 4's heading "approved **and re-verified**" while `upstream` arrives unprobed — routing is unambiguous, no behavior turns on the heading.

**Forward pointer → T6 (walkthrough input, Reviewer):** a `digest-update` item's `Target` is a `KZ-id`, not a path; what "the `Target` still exists at HEAD" means for it in 3b is reader-decided (most naturally: the digest row with that ID). Predates this spec; the fixture's digest-update case must record which reading the walkthrough took and whether two sentences could disagree.

| Field | Value |
|---|---|
| **Final status** | **PASS** (attempt 3 of 3) |
| Requirements covered | FR-2 (skill side), FR-3 (normalize, reachability), FR-4, FR-5, FR-6 (Kind/Status, Collect/Stamp), NFR-3..NFR-7 |
| Decisions | Restatement edits in-scope (KZ-001); FR-8 over literal verification 1 (DD-9 = triggers unchanged); RELIABILITY advisory adopted as FR-7 refinement; HITL gate kept for upstream report; tripwire escalated → user chose attempt 3 |
| Issues | Two FAILs, same class — new `Kind` vs. pre-existing Apply Mode steps not walked per Kind at design time. **Kaizen candidate (Methodology):** when a design adds a value to an enumerated type (Kind, Status, context), the surface table must walk every existing consumer step against the new value — the KZ-004 fall-through rule applied to designs, not scans |
| Final verification | greps 1–5 green (Implementer + Reviewer independently); `git diff --check` clean |
| Continue gate | auto-approved (pre-approved mode) |

### T3 — `/akili-resume`: footer names the pinned branch, counts only `pending`/`deferred`

| Field | Value |
|---|---|
| Status | **IN PROGRESS** — attempt 1 FAIL, attempt 2 dispatched |
| Date | 2026-09-17 |
| Implementer | `sonnet`, effort `medium` (attempt 1) → `high` (attempt 2); skills: `cognitive-doc-design` |
| Reviewer | `opus`, effort `high` (checklist mode, diff < 50 LOC) |

**Attempt 1** — files: `.claude/commands/akili-resume.md` (2+/2−, one hunk). Implementer verification: `superseded` in the exclusion list (1 hit); old example phrase zero; diff confined to the footer; `git diff --check` clean; `Kaizen: N active lessons` line and read-only sentence byte-identical.

Reviewer verdict: **FAIL** (1 issue), verbatim:

1. **Discovered Issue:** The footer resolves the branch name from two sources only, the `Integration Branch:` pin and then the `Default Branch:` pin, and in the same sentence forbids both a skill load and a git resolution procedure. In a legacy project with neither pin, an agent reading only the shipped text has no name to print and no permitted way to obtain one. The superseded wording, "on the default branch to work them", named the branch without any pin. This is a reachable regression for the population FR-7 protects, and T6's fixture keeps `Default Branch: master` in its no-pin walk, so the walkthrough will not exercise it either.
   - **Violated Rule:** `requirements.md` FR-7: "A project with neither pin SHALL keep the existing fallback resolution and defer-on-failure default." Also `tasks.md` §3 coverage: "No gap is discharged by citing a different requirement." T6 owns the FR-7 walk, but a walkthrough can only report the gap, not supply the missing clause.
   - **Remediation Suggestion:** Append one clause to the same sentence covering the neither-pin case, without adding a git procedure. For example: "and when neither pin exists, the footer recommends the invocation without naming a branch, since the apply-capable branch is resolved by the skill's existing fallback at apply time." Nothing else in the paragraph needs to move.

**Leader decisions (attempt 1 → 2):** issue stands. Remediation chosen: when neither pin exists, the footer says "the default branch" in place of a name (that is what the skill's fallback resolves without pins; no git procedure added). **Forward pointer → T6:** the fixture's no-pin walk must also remove `Default Branch:` (neither pin), not only the integration pin — the Reviewer is right that the planned fixture would not exercise this.

**Attempt 2** — files: `.claude/commands/akili-resume.md` (2+/2−, one hunk). Edit: one clause appended to the footer sentence — when neither pin exists, say "the default branch" in place of a name (the population the skill's Branch Context fallback resolves; no git procedure, no skill load). Implementer verification 1–3 green; `git diff --check` clean.

Reviewer verdict: **PASS.** "The appended clause closes the gap I raised. All three populations now have a stated output, the clause cannot fire when a pin exists, and the earlier checks still hold at the source." Reviewer re-ran: old example phrase 0 hits; FR-8 default-only patterns 0 in this file; one file 2+/2−; active-lessons line and read-only sentence byte-identical.

**Forward pointer → T5:** the new clause contains the bare words "the default branch" (fallback-resolution sentence — an FR-8 sanctioned form); enumerate it in T5's sanctioned-hit list rather than rewriting it.

| Field | Value |
|---|---|
| **Final status** | **PASS** (attempt 2 of 3) |
| Requirements covered | FR-3 resume scenario (all clauses), FR-6 footer enumeration, FR-7 neither-pin population, NFR-1 |
| Decisions | Neither-pin output = the generic phrase "the default branch" (not "no branch named") — matches what the skill's fallback resolves |
| Issues | 1 FAIL: the FR-7 neither-pin population had no reading — same lesson class as T1 (a new value walked against the pinned cases, not against the no-pin legacy case) |
| Final verification | greps 1–3 green (Implementer + Reviewer); `git diff --check` clean |
| Continue gate | auto-approved (pre-approved mode) |

### T4 — `/akili-constitution`: `Integration Branch:` pin; persona guardrail phrase

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1 of 3) |
| Date | 2026-09-17 |
| Implementer | `sonnet`, effort `high`; skills: `cognitive-doc-design` |
| Reviewer | `opus`, effort `high` (checklist mode, diff < 50 LOC) |

**Attempt 1** — files: `.claude/commands/akili-constitution.md` (8+/1− — new Step 8 bullet with seven sub-bullets after the `Default Branch:` bullet; discipline bullet reworded), `.claude/templates/leader.md` (1−/1+), `.claude/templates/implementer.md` (1−/1+). Implementer verification: grep 1 → 8 `Integration Branch` hits, all in Step 8, one "confirm", one "trunk", none with a git heuristic; grep 2 → zero "applied on the default branch" across the three files; grep 3 → two template files, one hunk each; `git diff --check` clean. Two declared readings, **Leader-adjudicated as satisfied**: (a) verification 3's "≤3 changed lines total" met as 2 changed lines (4 diff rows, 1−/1+ per file); (b) the Safe Update clause describes the old phrase instead of quoting it, to avoid self-tripping grep 2.

Reviewer verdict: **PASS.** "T4's constitution bullet and the two template phrase swaps satisfy FR-1, FR-8, and design rows 20–22 as an executable scaffolding procedure. All three verifications reproduce clean at the source, no contradiction with the `Default Branch:` bullet above it, and no path by which an agent writes or infers the pin unprompted." Reviewer confirmed: bullet immediately after `Default Branch:`; detection is a question with the git heuristic explicitly refused; assertion sentence verbatim per FR-1; when-to / when-not-to; one name ≠ default; Safe Update's three halves present and consistent with the command's existing persona contract (DD-7); templates match FR-8 wording plus FR-2 exclusivity; union-semantics grep zero over the three files; `implementer.md` one hunk, item 14 untouched.

**Forward pointer → T6 (Reviewer, noted not an issue):** the pin's ask is phrased as a yes/no and does not separately instruct collecting the branch name (implied by surrounding clauses) — walk the FR-1 release-cadence scenario and record whether the shipped text yields the name unambiguously.

| Field | Value |
|---|---|
| Requirements covered | FR-1 (both scenarios, all clauses, Safe Update clause), FR-8 (constitution bullet + two templates) |
| Decisions | Verification 3 read as changed source lines; old phrase described, not quoted |
| Issues | none |
| Final verification | greps 1–3 green (Implementer + Reviewer); `git diff --check` clean |
| Continue gate | auto-approved (pre-approved mode) |

### T2 — `/akili-archive`: gates on the apply-capable predicate, upstream clause, five-state report

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1 of 3) |
| Date | 2026-09-17 |
| Implementer | `sonnet`, effort `high`; skills: `cognitive-doc-design` |
| Reviewer | `opus`, effort `high` (full four-lens sweep) |

**Attempt 1** — files: `.claude/commands/akili-archive.md` (10+/10−, 5 hunks). Five scoped sites edited (Step 3 gate; Step 4.3 upstream clause; Step 4.4 offer + note; Step 6 item 7 five statuses + report path; Error Handling writable set). **Leader pre-review catches (brief conformance under KZ-001, not Reviewer rounds):** five restatements in the same file still asserted the superseded rule — Step 3 item 4 heading and its ADR-numbering clause, Step 4.3 menu paragraph, Step 4.4 Record paragraph, Error Handling never-block bullet; returned to the Implementer, who fixed four, flagged the fifth (item 4 body) as outside the named list rather than widening, and applied it on the Leader's go-ahead. Implementer verification: greps 1–4 green; banned-phrase grep zero; `git diff --check` clean; remaining `default branch` hits enumerated with reasons; Step 5 move and Step 3 item 5 flip untouched.

Reviewer verdict: **PASS.** "All five T2 sites land in apply-capable terms, the Step 3 gate cites the skill's predicate by name without restating a git procedure, and the FR-2 hotfix path (default branch + integration pin) is closed at every write site: items 2–4 record pending, ADR allocation is unreachable, the 4.4 offer stays silent and names the pinned branch." Reviewer re-ran greps 1–4 and the union-semantics grep (zero); five surviving `default branch` hits all sanctioned (predicate gloss, non-writing row, quoted banned phrase).

**ADVISORY (recorded, no rework, no task):** READABILITY — Step 3 items 2–4's sub-clauses still say "On a spec branch:" alone (the line-131 umbrella covers default-while-pinned; silence, not disagreement); Step 6 item 6 reports "on a spec branch" only (reporting side, no write consequence). **Forward pointer → T6:** the walkthrough's hotfix-on-default step lands on those narrower sub-clauses after the umbrella — record whether a literal reader could disagree; if so it is a T6 INCONCLUSIVE, not a T5 edit.

| Field | Value |
|---|---|
| Requirements covered | FR-2 hotfix scenario (archive side, all clauses), FR-3 offer/note, FR-5 spec-branch scenario, FR-6 archive-report scenario, NFR-4 |
| Decisions | Five in-file restatements aligned as brief conformance before review (KZ-001) |
| Issues | none at review; the restatement class recurred (T1 → T2) — Kaizen candidate strengthened |
| Final verification | greps 1–4 green (Implementer + Reviewer); union grep zero; `git diff --check` clean |
| Continue gate | auto-approved (pre-approved mode) |

### T5 — Mirrors, root docs, CHANGELOG

| Field | Value |
|---|---|
| Status | **IN PROGRESS** — attempt 1 FAIL, attempt 2 dispatched |
| Date | 2026-09-17 |
| Implementer | `sonnet`, effort `high` (attempt 1) → `xhigh` (attempt 2); skills: `cognitive-doc-design` |
| Reviewer | `opus`, effort `high` (full sweep, 10 files 56+/37−) |

**Attempt 1** — files: `AGENTS.md`, `CHANGELOG.md`, `README.md`, `docs/README.md`, `docs/commands/akili-archive.md`, `docs/commands/akili-constitution.md`, `docs/commands/akili-resume.md`, `docs/flow.md`, `docs/skills/README.md`, `docs/skills/kaizen.md`. Implementer verification: FR-8 phrase grep zero; union grep zero; consumer diff empty; `git diff --check` clean; per-file parity statements; CHANGELOG bullets checked against `git log --stat -4`. Declared assumption, **Leader-adjudicated correct:** this repo's `CLAUDE.md` has no Kaizen Loop bullet (verified by grep) — nothing to rewrite.

Reviewer verdict: **FAIL** (2 issues) — greps clean, NFR-1 intact, eight of ten files at parity. Verbatim:

1. **Discovered Issue:** `docs/commands/akili-constitution.md:59` still reads "carries **two rules** that bind every command:" while the diff added a third bullet under it (`Default Branch:` pin, `Integration Branch:` pin, shared-file write discipline). The miscount is introduced by this diff.
   - **Violated Rule:** `tasks.md` T5 Scope — the mirrors must reach "parity with its rewritten command sections"; `requirements.md` FR-8: "Mirrors SHALL reach parity with their commands in the rewritten sections". `CLAUDE.md` also binds `cognitive-doc-design` for human-facing docs.
   - **Remediation Suggestion:** Change "two rules" to "three rules" at `docs/commands/akili-constitution.md:59`.
2. **Discovered Issue:** `docs/flow.md:445-447` still reads "Lessons target **either** the **Product** (this project) **or** the **Methodology** itself — Methodology lessons are flagged for upstreaming to the AKILI repository". The shipped skill overturns exactly that: `.claude/skills/kaizen/SKILL.md:100` — "**Dual (Product + Methodology) lessons:** both, not either" — and `:99` — "record a `Kind: upstream` pending item ... it is collected into one upstream report". Every sibling surface was rewritten this pass: `AGENTS.md:30`, `docs/commands/akili-archive.md:71` and `docs/skills/kaizen.md:25` (both "the **Methodology** (recorded as a `Kind: upstream` pending item), or both"). `docs/flow.md` §8 is the one that kept the superseded binary. This is the case T5's own Disqualifier names: "Grep 1 finds phrases, not contradictions".
   - **Violated Rule:** `tasks.md` T5 Scope — "`docs/flow.md` artifact-table row for `kaizen-log.md` and **§8 Kaizen Loop**"; Disqualifiers — "per-surface parity read (command vs mirror) for the rewritten sections". `requirements.md` FR-8 parity clause.
   - **Remediation Suggestion:** Rewrite `docs/flow.md:445-447` to the sibling wording: lessons target the Product, the Methodology (recorded as a `Kind: upstream` pending item on any branch, collected into one upstream report at apply time and flipped to `upstreamed`), or both.

ADVISORY (recorded): README "flagged for upstreaming" lags the new vocabulary; `docs/flow.md` artifact table has no row for the new `upstream-<date>.md` artifact (outside T5 scope — **not added; recorded for the kaizen retrospective as a docs gap**); `.claude/commands/akili-archive.md` Step 6 item 6 "on a spec branch" (T2 residual, already recorded); `docs/commands/akili-archive.md` "either branch" vs command's "any branch"; `docs/skills/kaizen.md` "now has three rows" changelog voice.

**Leader decisions (attempt 1 → 2):** both issues stand. Three advisories **adopted into the attempt-2 brief as parity refinements within T5's own surfaces** (README upstream clause; "either branch" → "any branch" in the archive mirror, matching the command; drop "now" in the kaizen mirror) — recorded here as Leader decisions, not advisory-driven scope growth. The `upstream-<date>.md` artifact-table row is **not** adopted: a new row is scope T5 does not own; it goes to the retrospective. Effort bumped to `xhigh`. This is T5's first FAIL — no tripwire.

**Attempt 2** — files: the same ten plus nothing new. Edits: "two rules" → "three rules" (constitution mirror); `docs/flow.md` §8 closing sentence rewritten to the dual-lesson / `Kind: upstream` / upstream-report / `upstreamed` wording; `README.md` Kaizen closing sentence likewise; archive mirror "either branch" → "any branch"; kaizen mirror "now has" → "has". Implementer verification: greps 1–3 clean; `git diff --check` clean; full re-read of each rewritten section against its shipped source.

Reviewer verdict: **PASS.** "Both issues are closed and the three adopted refinements land without over-claiming." Reviewer re-ran both closure greps (zero each), the consumer diff (empty), `git diff --check` (clean); semantics of the two upstream sentences checked against the skill's dual-lesson rule and step 4b (recording on any branch; report at apply time; "or both"); parity confirmed on attempt 1 unchanged for the other files. ADVISORY: none new.

| Field | Value |
|---|---|
| **Final status** | **PASS** (attempt 2 of 3) |
| Requirements covered | FR-8 (closure set outside command/skill/template files; post-sweep scenario), NFR-1 |
| Decisions | Three advisories adopted as in-surface parity refinements (recorded above); `upstream-<date>.md` artifact row deferred to the retrospective as a docs gap |
| Issues | 1 FAIL: two contradictions the phrase grep cannot see (a falsified count; a surviving either/or) — the T5 Disqualifier's own warning, realized |
| Final verification | FR-8 phrase grep zero; union grep zero; consumer diff empty; `git diff --check` clean (Implementer + Reviewer) |
| Continue gate | auto-approved (pre-approved mode) |
