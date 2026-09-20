# Execution: `AGENTS.md` as the Single Canonical Agent Guide

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/agents-md-canonical` |
| Depth | Lite |
| Approval Mode | `gated`; the user authorised the full execute run in advance (2026-09-20) and asked for a single report at the end |
| Started | 2026-09-20 |
| Budget (design §6) | 2 tasks · ~25 shipped lines · 3 review rounds |
| Baseline commit | `775dd53` |
| Harness | No Step 8E wrappers, so Implementer and Reviewer are persona-seeded subagents with an explicit model per spawn |
| Model routing | Implementer **T2 `sonnet`** (registry default, no tier escalation) · Reviewer **T3 `opus`** · `author ≠ auditor` holds |
| Command-version note | The `/akili-execute` text governing this run is the one loaded at session start. The spec executed immediately before this one (`changes/review-intensity-routing`) edited that command on disk, but the re-invocation served the already-loaded copy — so this run follows the **previous** rules, with no *Review intensity* block. Immaterial here: T1 is `full` and T2 is `checklist`, so both get a Reviewer under either version |

## 2. Task Execution History

### T1 — `/akili-constitution`: `AGENTS.md` becomes the mandated guide

| Field | Value |
|---|---|
| Status | **PASS** |
| Date | 2026-09-20 |
| Implementer attempts | **3 of 3** — passed on the last one |
| Review rounds | 3 (two `FAIL`, one `PASS`) — **the whole spec's budgeted allowance, spent on one task** |
| Shipped lines | 31 insertions / 15 deletions in one file (estimate was ~18) |
| Requirements covered | FR-1, FR-2, NFR-1, NFR-3, NFR-4 |

**Files changed:** `.claude/commands/akili-constitution.md`, and only that file, confirmed at every checkpoint.

#### The through-line: one defect class, found three times, by three different searches

Every attempt shipped correct text and still failed, because the *search* that declared the work complete was keyed on the wrong thing. That is the story of this task and it belongs at the top of its record.

| Attempt | Sweep used | What it missed |
|---|---|---|
| 1 | `grep -n "CLAUDE\.md"`, 18 hits read individually | `:346` — Step 8 still directed the full constitutional body into `CLAUDE.md` |
| 2 | the same, plus two new literal checks and a Leader write-imperative backstop | `:1128` — *"written to **both** root guides"*, which **never names `CLAUDE.md`** |
| 3 | **obligation-keyed**: `grep -nEi 'both\|root guides\|two guides'` | nothing — and a three-key Reviewer sweep confirmed it |

The Reviewer named the class precisely: **a both-files obligation stated in the collective noun.** A filename-keyed sweep is structurally blind to it, however carefully it is read.

#### Attempt 1 — Reviewer `FAIL`

*What landed:* the four briefed sites (`:41`, `:455`, `:579`, `:1146`) and the new block near Step 7 carrying the import rule, the prose-pointer prohibition **with its mechanism**, the symlink prohibition with both grounds, and the v2.1.277 floor with its four unavailability cases.

**The Implementer also fixed two sites the brief did not name** — `:57` (the baseline file list, which required `CLAUDE.md` unconditionally) and `:1163` (a **second** checklist item reading *"both root guides"*, two lines from its inverted twin) — and said so rather than doing it silently.

*Implementer verification, as reported and as independently re-run by the Leader:* `both files` **0** · ``AGENTS.md` **and** `CLAUDE.md`` **0** · `2.1.277` **1** · `@AGENTS.md` **7** · `symlink` **1** · frozen paths empty · one file. Baselines at `775dd53` executed: **1 / 2 / 0 / 0 / 0**, so every check genuinely failed on the pre-change text.

*Falsifier — executed on a scratch copy outside the working tree:* the "prose pointer is a defect" sentence was deleted and FR-2's scenario re-read; with it gone the heading survives as an unjustified assertion with no stated mechanism. Observed, discarded.

*Evidence re-run (Leader-inline):* **`VERIFIED`**.

*Reviewer verdict:* **`FAIL`**, one issue — and two rulings the Leader had asked for.

> **Q1 — the `:57` and `:1163` fixes STAND.** This is the sweep clause working as designed, not widening. `:57` made `CLAUDE.md` an unconditional baseline file, which violates FR-1's *"SHALL NOT require a root `CLAUDE.md` to exist"* on its face. `:1163` reads *"both root guides"* — the same mandate, in a phrasing no verification grep covers, sitting two lines from its inverted twin. Leaving either would be the surviving-neighbour failure.
>
> **Issue 1:** `:346`, Step 8 *"Update Root Agent Guides"*: *"Update root `CLAUDE.md` and `AGENTS.md` so they reference:"* followed by the constitutional content list. This mandates a second full policy body in `CLAUDE.md` and **directly contradicts the new block at `:79`, which cites Step 8 as a site scaffolding into `AGENTS.md` "and nowhere else"**. An agent reconciling the two will write the second copy and then report it.

The Leader verified the contradiction at the source before actioning it: the diff pointed at the step that refuted it.

*Runtime events:* none.

#### Attempt 2 — Reviewer `FAIL`

*What landed:* `:346` rewritten to `AGENTS.md` only in Step 8C/8D's form with the non-duplication sentence; `:75` retargeted from `CLAUDE.md` to `AGENTS.md`.

*On `:75` — a `Not Done` from attempt 1, resolved rather than carried.* The Implementer had flagged `:74`/`:75` as out of scope. The Leader read both and found them **not equivalent**: `:74` updates references in whichever guides exist (harmless), while `:75` *writes* the legacy-path mapping into `CLAUDE.md`. Put to the Reviewer with three outcomes open, it ruled **(b), an obligation this task owes**: *"Deferring `:75` while fixing `:57` under one clause is inconsistent… it is one word."*

*Two new checks added, aimed at the phrasings the literal greps had missed:* `both root guides` → 0 (baseline **1**) and ``Update root `CLAUDE.md` and `AGENTS.md`` `` → 0 (baseline **1**). Both baselines executed, so neither check was decorative.

*Evidence re-run (Leader-inline):* **`VERIFIED`**, including a Leader-built write-imperative backstop over the surviving `CLAUDE.md` hits.

*Reviewer verdict:* **`FAIL`**, one issue — the third mandate, and the sharpest ruling of the run.

> **`:1128`** — in the *"Report to the user"* list: *"The `## Model Routing` registry (Step 8C): that it was written to **both** root guides…"* It is **not a description — it is the summary contract an agent executing `/akili-constitution` reads as a statement of what it must have done**, with "both" in bold.
>
> **Q3 — my concern survives, and `:1128` is the proof.** Every sweep so far … was keyed on the literal `CLAUDE.md`. This mandate is invisible to all of them. The two new checks … close yesterday's misses, not the class. The class is: **a both-files obligation stated in the collective noun.** The sweep that closes it is keyed on the obligation, not the filename.

*Runtime events:* none.

#### Attempt 3 — Reviewer `PASS`

**The Leader changed method rather than repeating it.** With one attempt left before HALT, re-running a search that had already missed twice was the wrong move: the Leader ran the obligation-keyed sweep itself, classified **all 15 hits**, and handed the Implementer the finished list with a fix/leave ruling on each. The Implementer's job became two edits, not another discovery pass.

*Two sites fixed:* `:1128` (the Reviewer's issue) and **`:1173`** — *"The root guides must also carry a `## Model Routing` registry … and a `## Skill Map`"*.

**The Leader overruled the Reviewer's tiering, upward.** The Reviewer had filed `:1173` as `ADVISORY` because it lacks a bolded "both" and reads as *whichever guides exist*. The Leader ruled it in scope on a different test — **it names both sections FR-1 governs**, and leaving it while fixing `:1128` would be the surviving-neighbour failure for the third consecutive attempt. The Reviewer accepted the correction explicitly: *"I tiered it on the absence of a bolded 'both', you tiered it on the sections FR-1 governs, and yours is the better test."*

*One site deliberately left:* `:387` — *"The root guides must carry a `## Module Guides` index"* — the same collective-noun shape, but `## Module Guides` is **not** a section FR-1 names and is not in the design's Surface Table. The Leader ruled it out of scope and asked the Reviewer to overturn that call if it disagreed.

*Implementer verification, as reported and as independently re-run by the Leader:* checks 1–8 green, plus check 9 — `grep -nEi 'root guides (must|should)'` returns **only `:387`**, where the baseline at `775dd53` returned **two** lines. Frozen paths empty; one file; 31 insertions / 15 deletions cumulative.

*Evidence re-run (Leader-inline):* **`VERIFIED`**.

*Reviewer verdict:* **`PASS`**, no issues.

> SUMMARY: `:1128` and `:1173` conform, no fourth mandate survives an independent three-key sweep, and the disqualifier's two halves hold in the shipped text — the new block states the *mechanism* … and both inverted checklist items carry the non-duplication half.

It swept on **three independent keys rather than trusting the count**: the filename (18 hits), the obligation collective (14), and a catch-all `guides?\b` over the whole file (21). Every hit classified; the unrelated `both`s confirmed unrelated by reading.

On `:387` it upheld the Leader's scope line, and explained *why* fixing it would have been widening rather than completion: doing so **would require deciding something the spec never asked** — whether a kept `CLAUDE.md` shim carries its own index or inherits one through the import. *"That is a design decision, not an edit. Making that call on attempt three would be widening."*

#### `ADVISORY` — recorded, and going no further

| Lens | Finding |
|---|---|
| Readability | `:476`, inside the amended Step 8C: *"Mirror its content into the project guides…"* — the same collective plural, and the only residue left in the file. **Bounded**, because *"Never write this section into `CLAUDE.md`"* sits three lines above at `:470`, so a reader arrives with the constraint in hand. A one-word fix if `:387` is ever picked up |
| Readability (attempt 1) | `:469`'s pointer *"the rule after Step 0's file list"* resolves correctly; the block's placement satisfies design surface 5. No change owed |

#### Carried out of this spec — not fixed, and named properly

**`:387` is a live NFR-4 exposure in the letter, not a stylistic plural.** The Reviewer refined the Leader's recording without reversing the decision: in a project that keeps a `CLAUDE.md`, `:387` still mandates the `## Module Guides` index in both, and **Step 8's prohibition at `:354` does not reach it** — *"Never write **this content**"* scopes to the reference list immediately above, not to the nested-inheritance sub-block below. Recorded here naming **NFR-4** explicitly so the deferral is visible to whoever picks it up, and so it is not mistaken for a wording preference. It goes to the user as a candidate spec gap, never as a task widened inside this run.

#### Decisions made

| Decision | Reason |
|---|---|
| **Attempt 3 changed method, not just content** — the Leader ran the obligation-keyed sweep itself and handed over a finished classification | One attempt remained before HALT. Re-running a search that had already missed twice would have spent the last attempt on the same blind spot. The Implementer's failure was never depth; it was the key the search was on |
| **The Leader overruled the Reviewer's `ADVISORY` tiering on `:1173`, upward** | Advisories may not be actioned inside the spec that produced them — but this was not an advisory being promoted into scope. It was already in FR-1's scope (it names both governed sections) and had been tiered on the wrong test. The Reviewer agreed on being shown the better test |
| **`:387` left, and escalated rather than fixed** | `## Module Guides` is outside FR-1. Fixing it needs a design decision the spec never made, which on the last attempt would be widening under the weakest evidence |
| Implementer stayed on **T2 `sonnet`** for all three attempts, no tier escalation; effort `high` → `xhigh` → `xhigh` | The registry default and FR-7's discipline. Escalating to `opus` would also have collided with the `opus` Reviewer and broken `author ≠ auditor`. The failures were search-coverage failures, which a heavier model does not fix — a better-keyed sweep does |

#### Final verification result

Nine checks green, re-run independently by the Leader after every attempt (`VERIFIED` all three times). Baselines executed at `775dd53` for every check, including the two added mid-run. The falsifier executed on a scratch copy with its result observed. Disqualifier read rather than counted, by the Implementer, the Reviewer, and the Leader. Reviewer `PASS` on attempt 3 after a three-key independent sweep.

---

### T2 — This repository carries one policy body

| Field | Value |
|---|---|
| Status | **PASS** |
| Date | 2026-09-20 |
| Implementer attempts | 2 |
| Review rounds | 2 (one `FAIL`, one `PASS`) — **final total for the spec: 5** |
| Shipped lines | 5 insertions / 78 deletions across two files (estimate was ~7 net) |
| Requirements covered | FR-3, NFR-1, NFR-2, NFR-4 |

**Files changed:** root `CLAUDE.md` and root `AGENTS.md` — the two the task permits, and no others.

#### Attempt 1 — Reviewer `FAIL`: a rule died

*What landed:* `CLAUDE.md` reduced from 76 lines to **exactly one, `@AGENTS.md`** (11 bytes), and `AGENTS.md` absorbed one bullet that existed only in `CLAUDE.md` — a `README.md` pointer with no counterpart anywhere in the file.

**The Implementer corrected the Leader's own coverage analysis.** The brief handed it four `CLAUDE.md`-only headings with the Leader's reading that all four were covered, explicitly marked *"a finding to VERIFY, not a fact to trust"*. It verified line by line and found the Leader had missed one: *"Read `README.md` for installation and methodology usage"* had **no counterpart** (`grep -n "README" AGENTS.md` → no hits pre-edit). It absorbed the line rather than dropping it. That is the brief's source-or-verify clause working exactly as intended.

*Implementer verification, as reported and as independently re-run by the Leader:* `head -1 CLAUDE.md` → `@AGENTS.md`, 1 line · identical lines **0** (baseline **27**) · duplicate headings **0** (baseline **2**) · two files touched · `AGENTS.md` diff exactly **+1 line**, confirmed absent at `709cc4b`.

*Evidence re-run (Leader-inline):* **`VERIFIED`** — including a per-heading loss check across all six former sections.

*Reviewer verdict:* **`FAIL`**, one issue — and it is the failure this task's Disqualifier exists to name.

> One rule died in this diff. `CLAUDE.md:25` at `709cc4b` was the repository's **only** copy of the `tdd` skill binding; it is absent from `AGENTS.md` before and after the change, **so it now exists nowhere**. … This is exactly the Disqualifier's "worse failure", and it slipped past two reads because both checked heading presence, not bullet inventory.

**Why two independent reads missed it — the finding worth keeping.** The task's stated check 4 compares `^## ` heading sets. `## Skill Usage` exists in **both** files, so a bullet lost *under a surviving heading* is **structurally invisible** to it. The check reported green on a real deletion. The Implementer had already found the comparator inert in a second way — deleting a heading from *both* files makes it vanish from the "missing" list — and had substituted a manual inventory; the Reviewer found the deeper inertness the substitution still did not cover.

*Runtime events:* none.

#### Attempt 2 — Reviewer `PASS`

*Three lines absorbed into `AGENTS.md`:*

1. **The `tdd` bullet — the FAIL.** Restored **byte-identical**, copied from `git show 709cc4b:CLAUDE.md` rather than retyped; the Leader verified with `diff` rather than by eye. A reworded copy is how the rule's specifics (expected values from `requirements.md` scenarios, seams from `design.md`) would have quietly gone.
2. `` - `scripts/` contains helper scripts, including `scripts/release.js`, which prepares controlled npm package releases. ``
3. `` - Read `docs/release-checklist.md` before preparing or publishing a package release. `` — the operative half restored.

Items 2 and 3 were the Reviewer's two *"would absorb, doesn't block"* narrowings, authorised by the Leader as the **same class** rather than as extras: both are statements that existed only in `CLAUDE.md`, which is exactly what T2's scope sentence permits `AGENTS.md` to take on.

**The check was fixed, not just the content.** The brief replaced heading-set comparison with a **bullet-level** comparator and required a falsifier proving it detects a deletion *from the surviving file*. The Implementer ran it — removing the `systematic-debugging` bullet from a scratch `AGENTS.md` made it appear in the output. The comparator over-reports by design (exact strings, so surviving paraphrases show up); the Implementer walked every returned line and named each one's counterpart.

*Evidence re-run (Leader-inline):* **`VERIFIED`** — `tdd` byte-identical to the original; the orphan list down from **11** to **9**, with `tdd` no longer in it.

*Reviewer verdict:* **`PASS`**.

> No tenth loss. I walked the orphan set myself — **not the 9 bullets only, but every non-blank line** of `709cc4b:CLAUDE.md` that is not byte-identical to a line in the current `AGENTS.md` (**24 entries** once headings and prose are included) — and located a counterpart at the source for each.

Its four rulings:

| Question | Ruling |
|---|---|
| The `scripts/` rewrite | **Faithful, not re-narrowed** — it restores the general claim *and* keeps the specific one. "A merge, not a substitution" |
| The release-checklist line | **The operative half is the right half.** The obligation implies the description; the reverse was the narrowing |
| Absorbing the two non-blocking items | **Correct scope, and the Reviewer's own call.** T2's scope sentence authorises it; *Scope only grows through approval* is not engaged, because this is the task's mandate being executed rather than an advisory promoted into work. Recording them instead *"would have left two rules in one file each, which is the condition T2 exists to end"* |
| The README mood asymmetry | **Does not matter, and levelling it would be worse.** The two lines differ in kind: the checklist carries a **precondition on a risky action** (*before* publishing), so losing its imperative lost a gate; the README line has no trigger and sits in `## Repository Purpose`, whose register is descriptive |

*`ADVISORY`:* none.

*Runtime events:* none.

#### Decisions made

| Decision | Reason |
|---|---|
| The Leader's coverage analysis was handed over **marked as a finding to verify, not a fact** | It was wrong in one place, and the Implementer caught it. A Leader analysis passed as settled fact is a premise nobody re-reads — the P-7 failure mode, one layer up |
| The two "non-blocking" narrowings were **absorbed, not recorded** | Both met T2's scope sentence verbatim. The Reviewer confirmed this is the task's mandate rather than advisory promotion |
| Check 4 is recorded as **mis-specified in the spec**, twice over | It is inert against a same-pair deletion *and* against a bullet lost under a surviving heading. A content-preservation check must compare lines **within** the former sections, not heading sets. Carried out of this spec below |

#### Final verification result

Six checks green, re-run independently by the Leader after both attempts (`VERIFIED` twice). The `tdd` restoration verified **byte-identical by `diff`**, not by reading. The corrected bullet-level comparator carries an **executed falsifier** proving it detects a deletion from the surviving file. The Reviewer independently walked all 24 non-identical lines of the pre-change file. `CLAUDE.md` is exactly `@AGENTS.md`; no policy section is maintained twice; no rule from the old file exists in neither.

---

## 3. Summary — all tasks complete

| Measure | Budgeted (`design.md` §6) | Actual | Delta |
|---|---|---|---|
| Tasks | 2 | **2** | — |
| Shipped lines | ~25 | **36 insertions / 93 deletions** across three files | over on insertions |
| Review rounds | 3 | **5** | **+2** |
| Implementer attempts | — | 5 across 2 tasks | |

**Final status: 2 of 2 `[x]`.** Both tasks closed on a Reviewer `PASS` from an independent context on a different model — Implementer at T2 `sonnet` throughout with **no tier escalation**, Reviewer at T3 `opus`. No `REVIEW_WAIVED` record was written.

**The budget tripwire fired and was reported rather than absorbed.** It fired on both dimensions at the end of T1, which alone consumed the spec's entire 3-round allowance. The user had pre-authorised completing both tasks and asked for a single report, so the overrun was surfaced at the T1 gate and the run continued — the rule's own caution is against continuing *on an assumption*, and here the instruction was on record.

**Why it overran, in one sentence:** the spec was scoped from a `grep` that found three sites, and the file held **six**, three of which no filename-keyed search could reach.

| Miss | Found by | Invisible to |
|---|---|---|
| `:346` Step 8 | reading all 18 `CLAUDE.md` hits | the four briefed sites |
| `:1128` "both root guides" | the obligation-keyed sweep | every `CLAUDE.md` grep — it never names the file |
| the `tdd` bullet | a bullet-level inventory | heading-set comparison — `## Skill Usage` survives in both files |

Each was found only by changing **what the search was keyed on**. That is the generalisable lesson of this run, and it is worth more than either task's output.

**Open items carried out of this spec** — none may be absorbed by a task here:

1. **`akili-constitution.md:387`** — *"The root guides must carry a `## Module Guides` index"*, the same collective-noun shape, left because `## Module Guides` is not a section FR-1 names. **It is a live NFR-4 exposure in the letter**, not a stylistic plural: in a project keeping a `CLAUDE.md` it still mandates the index in both, and Step 8's prohibition at `:354` does not reach it (*"Never write **this content**"* scopes to the list above it). Fixing it needs a design decision the spec never made — whether a kept shim carries its own index or inherits one through the import.
2. **`akili-constitution.md:476`** — *"Mirror its content into the project guides…"*, the last collective-plural residue. Bounded, because the prohibition sits three lines above. A one-word fix if `:387` is ever picked up.
3. **T2's check 4 is mis-specified in `tasks.md`** — heading-set comparison cannot see a bullet lost under a surviving heading. The corrected form is the bullet-level comparator with its deletion falsifier.
4. **The `/akili-execute` command text governing this run was the session-start copy**, not the version the immediately preceding spec shipped to disk. Worth confirming which version a fresh session loads before relying on the *Review intensity* block.
5. **Kaizen candidate, named by the Reviewer:** *"the obligation-keyed sweep found in one pass what two filename-keyed sweeps missed — sweep on the obligation, not on the filename."*
