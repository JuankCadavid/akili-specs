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
