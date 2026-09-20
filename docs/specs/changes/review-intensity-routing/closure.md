# Closure: Review Intensity and Model Routing by Proven Verification

**Verdict.** No refutation. No inert predicate. All seven global gates pass, one (d) with a documented wording discrepancy between `requirements.md` and `tasks.md` that resolves in the spec's favor under the governing document. The held-out evidence base is **12 records, not 14** — P-15 and DD-11 overstated it, and this document corrects that. The predicate qualified **0 of 12** held-out records. The mutation falsifier was executed and produced **no flip** — a genuine, executed finding explained in §5, not a skipped step.

| Check | Result |
|---|---|
| Refutation test (NFR-6) | **PASS** — no held-out task with a real Reviewer FAIL qualifies |
| Inert test (NFR-6) | **PASS** — 0/12 qualify, not 12/12 |
| Global gates (a)–(g) | **PASS** — (d) carries a discrepancy, resolved by the governing document; see §2 |
| Held-out record count | **12**, corrected from the shipped "14" (§1) |
| Mutation falsifier | Executed; no flip observed on the two eligible records (§5) |

---

## 1. Held-out record count — established, not inherited

`design.md` DD-11 and `requirements.md` P-15 assert 14 (6 + 8). Established here by running `grep -c "^### T" tasks.md` on both held-out specs' `tasks.md` — the file FR-1's fields (`Falsifier`, `Disqualifier`, `Consumers`) actually live in — and cross-checking against `execution.md`.

| Spec | `tasks.md` task headers | `execution.md` `### T` headers | Reconciled |
|---|---|---|---|
| `gate-falsifiability` | 6 (T1–T6) | 6 | 6 usable records |
| `leader-brief-contract` | 6 (T1–T6) | **8** | **6** usable records |

**The two extra `leader-brief-contract` execution entries are not independent task records:**

```
### T2 (re-opened) — owed clause: Entry rungs and the mid-climb rule
### T6 — attempt 2 (after the Pivot and T2's owed clause)
```

Both are Pivot-driven re-executions of tasks **T2** and **T6**, triggered by the `T6 Pivot (2026-09-19)` recorded in that spec's own execution log. Neither corresponds to a distinct `### T` header in `tasks.md`, and neither carries its own `Review` field or task-level `Falsifier`/`Disqualifier`/`Consumers` block in `tasks.md` — the fields FR-1's predicate reads. (The T2 owed clause *does* carry its own inline `Falsifier`/`Disqualifier`/`Consumers` sub-block inside T2's `tasks.md` section, but it decides the same way T2's main record does — see §3 note — so folding it in changes no verdict.)

**True count: 6 + 6 = 12.** DD-11 and P-15 should read 12, not 14; `requirements.md` P-15 is corrected from `verified` to **`refuted`** by this task, on the same evidentiary footing P-7 was corrected earlier in this run.

---

## 2. Global gates (a)–(g)

| Gate | Command / method | Output | Verdict |
|---|---|---|---|
| **(a)** Frozen paths | `git diff --stat c87187f -- .claude/templates/implementer.md .claude/templates/tester.md .claude/skills/tdd bin scripts package.json` | empty | **PASS** |
| **(a)** Falsifiability-block identity | `awk '/\*\*Falsifiability\*\* —/{f=1} /^- \*\*a presence-assertion/{f=0} f'` on `git show c87187f:.claude/commands/akili-specify.md` vs. the working file | 8 lines each side, `diff` empty | **PASS** |
| **(b)** Defined once | `grep -rln "deterministic"` repo-wide (excl. `worktrees`/`archive`/this spec's folder) | Only `.claude/commands/akili-execute.md:197` carries the condition text. `:373` restates it as a **record field label** (`REVIEW_SKIPPED`'s "deterministic-verification basis"), which is FR-4's record, not a restatement of FR-1's rule. All other hits (`kaizen/SKILL.md`, `software-architect`/`ai-agent-development` reference docs) are pre-existing, unrelated content ("one deterministic order", "deterministic code decides the flow"). **One exception:** `CHANGELOG.md:11` restates all four conditions in prose — flagged by T8's own ADVISORY as "the one place the predicate now exists twice," accepted because a release note that only cited the block by name would be useless. Not a live "citing surface" (frozen release history, `!docs/specs` — packaged but never re-read operationally) | **PASS**, one accepted, pre-recorded exception |
| **(c)** Records distinct | `grep -rc "REVIEW_SKIPPED"` / `"REVIEW_WAIVED"` per file; scan for co-occurring lines | Both greppable in every citing file; the distinctness sentence exists verbatim at `akili-execute.md:378` ("counting 'tasks without a Reviewer `PASS`' conflates them and answers no real question"); no surface sums them — every co-occurrence lists them side by side, never combined into one count | **PASS** |
| **(d)** Held-out discipline | `grep -rn "gate-falsifiability\|leader-brief-contract"` over shipped paths (`.claude`, `docs` excl. `docs/specs`, `README.md`, `CHANGELOG.md`) | 2 hits: `akili-specify.md:309` (`KZ-changes--leader-brief-contract-2`, a kaizen-lesson ID) and `akili-execute.md:177` (`hand-off from \`changes/gate-falsifiability\``, a dependency parenthetical). Both confirmed **byte-identical / untouched** at `c87187f` (line 177 moved 171→177 by this spec's own insertions but the text is byte-for-byte the same; line 309's paragraph is outside this spec's diff entirely). `git diff c87187f -- .claude/commands/akili-execute.md \| grep -E "^[-+].*(gate-falsifiability\|leader-brief-contract\|premise-ledger)"` → empty — this spec added or removed no such line | **See discrepancy below** |
| **(e)** Rules by mechanism | `grep` for framework/product names (`Angular\|Cypress\|Tailwind\|Jest\|sonnet\|opus\|Claude\|...`) in added lines of shipped paths only (excl. `docs/specs`) | 0 hits anywhere in `.claude/commands`, `.claude/templates`, `.claude/skills`, `docs/commands`, `docs/skills`, `docs/model-routing.md`, `docs/flow.md`, `README.md`, `CHANGELOG.md`. (Hits inside `tasks.md`/`execution.md` are spec-local and excluded by `!docs/specs`.) `docs/model-routing.md`'s new *Review intensity* section names no product — it routes by mechanism and explicitly declines to restate the predicate | **PASS** |
| **(f)** Backward compatibility | Walked, not asserted: read the **Applicability** bullet (`akili-execute.md:201`), the closure-rule's final sentence (`:380`), and `akili-specify.md`'s absent-value clause | `:201` — "a `tasks.md` with no `Review` field predates this change and is out of scope for it entirely — every one of its tasks gets a conformance Reviewer, exactly as today, regardless of what the conditions above would find" (FR-10 bullet 1). `:380` — "An `execution.md` written before these records existed carries neither block — their absence reads as 'no skip or waiver recorded', never as an inferred PASS" (FR-10 bullet 2). Closure states, `/goal` condition and `akili-specify`'s field list all default to today's behavior when the field is absent (FR-10 bullet 3) | **PASS** |
| **(g)** Packaging | `npm run verify:cli && npm run pack:dry-run && git diff --check`, run alone with the tree quiet | `verify:cli` → 11 commands / 24 skills / 7 resources, exit 0. `pack:dry-run` → 275 files, 2.1 MB package / 3.8 MB unpacked, exit 0. `git diff --check` → exit 0, no whitespace errors. `git status --porcelain` after → empty | **PASS** |

### Gate (d) — the discrepancy, stated as instructed

`requirements.md` §1 and `tasks.md` §2 do not say the same thing:

| Document | Wording |
|---|---|
| `requirements.md` §1 (governs) | *"the shipped text may cite `premise-ledger` tasks only; every other spec's **tasks** are reserved for the closure walkthrough and must never be named in shipped text"* |
| `tasks.md` §2 (implements) | *"**No shipped file may name either spec** or any of its tasks."* |

`requirements.md` restricts naming a held-out spec's **task records**; `tasks.md` restricts naming the **spec itself**, a stricter rule its own author added when translating the requirement into a task-level constraint. Neither of the two hits found names a task record of `gate-falsifiability` or `leader-brief-contract` — one cites a kaizen-lesson ID, the other a dependency hand-off, both predating this spec. **Applying `requirements.md`'s governing wording, gate (d) is a clean PASS.** Applying `tasks.md`'s stricter wording, both hits would read as violations — but neither was introduced or touched by any task in this spec, so even under the stricter reading, no *task in this spec* violated the discipline; the pre-existing lines simply fall outside what `tasks.md`'s own wording would permit if applied retroactively. This is a **tasks-document overreach**, not a defect this spec introduced, consistent with the identical finding already recorded in T2's execution entry (`execution.md:196-211`) about the same two documents.

---

## 3. The predicate walk — 12 held-out records

FR-1's four conditions and FR-2's seven overrides, applied to each record using only its own `tasks.md` fields and its `execution.md` record.

| Task | `Consumers` | Deciding factor | Qualifies? |
|---|---|---|---|
| gf T1 | not `none` (3 consumers named) | Cond. 3 fails; Disqualifier reads "read each sub-rule" (cond. 2 fails); override (a) — defines the block every later task cites | **NO** |
| gf T2 | not `none` (`docs/skills/tdd.md` mirror) | Cond. 3 fails; Disqualifier reads "read the two new bullets" (cond. 2 fails) | **NO** |
| gf T3 | not `none` (mirror + scaffolded projects) | Cond. 3 fails; Disqualifier reads "read the item" (cond. 2 fails) | **NO** |
| gf T4 | "none beyond the mirrors themselves" — not the literal absent-value string | Cond. 3 ambiguous, but moot: Disqualifier requires "per-file read of each mirrored section" (cond. 2 fails) | **NO** |
| gf T5 | `none` (literal) | Override (c) fires — this task **is** the closure-gate walkthrough; Disqualifier requires reading source at "KZ-001" (cond. 2 fails) | **NO** |
| gf T6 | not `none` (2 consumers named) | Cond. 3 fails | **NO** |
| lbc T1 | `none (no shared symbol changed)` | Disqualifier: "read the Brief contract block" (cond. 2 fails); override (a) — defines the brief contract T3 restates | **NO** |
| lbc T2 (+ owed clause) | `none (no shared symbol changed)` | Disqualifier: "read the Log Format" (cond. 2 fails); override (a) and (b) — defines `REVIEW_WAIVED` and the closure-state enumeration, a closed enumeration other commands read. Owed-clause sub-block decides identically (its own Disqualifier: "read the paragraph...") | **NO** |
| lbc T3 | `none (no shared symbol changed)` | Disqualifier: "read it" (cond. 2 fails); override (a) — the audit item T3 ships is what the Reviewer persona executes | **NO** |
| lbc T4 | `none (no shared symbol changed)` | Disqualifier: "read the bullet" / "read the row" (cond. 2 fails); override (a) — the clean-run predicate clause is an obligation `kaizen` executes on every future run | **NO** |
| lbc T5 | `none (no shared symbol changed)` | Disqualifier: "per-surface parity read" (cond. 2 fails); override (c) plausible (CHANGELOG is an aggregated claim) | **NO** |
| lbc T6 | `none (no shared symbol changed)` | Override (c) fires — this task **is** the closure-gate walkthrough; Disqualifier: "quote the sentence, not paraphrase" (cond. 2 fails — Case 2's genuine two-reading ambiguity is itself the judgment condition 2 excludes) | **NO** |

**Summary: 0 of 12 qualify.** Condition 2 (the Disqualifier names no read or judgment) is the dominant disqualifier — it fails on **every** record, because every held-out task's Disqualifier instructs a reader to "read," "re-read," or "quote, not paraphrase" something. Condition 3 (`Consumers: none`) independently fails 5 of 12. Overrides (a), (b), or (c) independently fire on at least 8 of 12. No record depends on a single condition; most fail on two or three independent grounds.

**Note on the literal-`none` question (gf T4).** `gf T4`'s `Consumers` field reads *"none beyond the mirrors themselves"* — not the bare word `none`, and not the `none (no shared symbol changed)` convention `gate-falsifiability` itself established elsewhere. A strict literal reader could read this as already failing condition 3 on the string alone. It is recorded as ambiguous here because it does not change the verdict (condition 2 fails independently), but it is worth flagging: a spec author writing a qualified `none` value muddies the one condition meant to be a pure string check.

---

## 4. Inert and refutation tests (NFR-6)

**Inert test: PASS.** 0 of 12 held-out records qualify — not 12 of 12. The predicate is not worthless; it is, on this evidence, very strict (see §3's note that condition 2 fails universally in this corpus).

**Refutation test: PASS — no refutation.** Held-out tasks whose Reviewer returned a real, gate-blocking finding:

| Task | What the Reviewer caught | Predicate's verdict | Consistent? |
|---|---|---|---|
| gf T2 | Attempt 1 `FAIL` — Implementer's verification claim did not hold against the task's own grep (brief-transcription root cause, but a genuine FAIL verdict) | Does not qualify (§3) | Yes |
| gf T5 | Not a formal `FAIL` verdict, but the Leader's held-out challenge found one `INCONCLUSIVE` case and two under-deliveries, triggering the T5→T6 Pivot | Does not qualify (§3 — override c fires; this task *is* the walkthrough that found the gap) | Yes |
| lbc T1 | Attempt 1 `FAIL` — a surviving verb contradicted the inserted first-line rule | Does not qualify (§3) | Yes |
| lbc T6 | Attempt 1 `FAIL` — Case 2 `INCONCLUSIVE`, triggering a Pivot that re-opened T2 and re-ran T6 | Does not qualify (§3 — override c fires and is the clearest case in the whole corpus: the predicate excludes the exact task whose review caught a real, Pivot-triggering defect) | Yes |

No held-out task with a real Reviewer finding qualifies under the predicate. The clearest single data point is **lbc T6**: it is both a closure-gate walkthrough (override c) and the one task in the entire 12-record corpus whose review demonstrably caught a defect serious enough to trigger a Pivot — and the predicate correctly excludes it on two independent grounds.

---

## 5. The mutation falsifier — executed, and its actual result

Per `tasks.md` T9's Falsifier cell: on a scratch copy of the shipped Step 2.3 block, delete override (c) — *derived evidence* — and re-walk the held-out records that produce reports or counts; the expectation stated there is that their decision **must flip** from *review required* to *qualifies*.

**Executed** in `/private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/d38b2907-0bda-47c9-b25a-bfdbe95a90fa/scratchpad/` (never the working tree; copy discarded after use). The two records in the 12-record corpus that fire override (c) are **gf T5** and **lbc T6** — both closure-gate walkthroughs, the only "produces a report/count" records in the held-out set.

**Result: no flip on either record.** Re-walking all four conditions against the mutated block (override c removed):

| Record | Cond. 1 | Cond. 2 | Cond. 3 | Cond. 4 (no override) | Verdict under mutation |
|---|---|---|---|---|---|
| gf T5 | (unaffected by the mutation) | **still fails** — Disqualifier: "must be read at the source" | `none` (passes) | now clears (c removed) | **Still does not qualify** |
| lbc T6 | (unaffected) | **still fails** — Disqualifier: "quote the sentence, not paraphrase," and Case 2's real two-reading ambiguity | `none` (passes) | now clears (c removed) | **Still does not qualify** |

**Why no flip:** for both records, condition 2 (the Disqualifier names no read or judgment) fails **independently** of override (c), for the same underlying reason override (c) exists — producing a walkthrough or a report is structurally not a "command with a pass/fail result"; it requires a reader to judge whether a shipped sentence rejects a case. Removing override (c) alone does not touch condition 2, and condition 2 alone is sufficient to keep both records at *review required*.

**This is reported as a genuine finding, not a skipped step.** `tasks.md` T9's Falsifier cell asserts the flip as the expected outcome; the actual held-out corpus does not produce it, because conditions 2 and (c) are not independent on this task class — they are two mechanisms pointed at the same failure mode (a walkthrough is neither deterministic nor consumer-free) and either alone is sufficient to exclude it. The predicate is, if anything, **more robust** than a single-override read would suggest for this task class, but the specific mutation `tasks.md` prescribes does not isolate override (c)'s marginal contribution on the evidence available. No held-out record in the corpus has override (c) as its *sole* disqualifying factor — every candidate also independently fails condition 2. This is recorded for the retrospective as a limitation of the mutation-falsifier's design against the actual corpus, not as a defect in the predicate itself: the predicate still correctly excludes both records before and after the mutation.

---

## 6. The trial's terms — recorded verbatim (FR-9, DD-10)

| Term | Value |
|---|---|
| Extent | **3 complete specs.** The skip runs end to end across the next three specs — roughly 20–30 task records — after which the trial is reviewed and the behavior is confirmed, amended, or reverted |
| Abort criterion | **One escaped defect reverts the change.** A single defect escaping a task that closed under `REVIEW_SKIPPED` — found at `/akili-test`, `/akili-validate`, a later task, the closure gate, or HITL — aborts the trial |

---

## 7. Budget actuals against `design.md` §13

| Measure | Budgeted | Actual | Delta |
|---|---|---|---|
| Tasks | 9 | 9 | 0 |
| Shipped lines | ~120 | `git diff --stat c87187f..HEAD -- . ':!docs/specs'` → **136 insertions / 40 deletions, 17 files** (re-verified) | +16 / +40 |
| Review rounds | 10 | **12** | +2 |

**Cause, on record.** Three of the first five reviewed tasks needed rework (T1, T2, T3), and two of those `FAIL`s were defects in the **approved documents**, not the implementation: FR-10 bullet 1 was undelivered by the shipped text alone (T2 attempt 1), and FR-5's own wording had named a mechanism (the Verification Checklist) that runs *after* the gate it was meant to guard (T5 attempt 1). The tripwire fired mid-run (during T3); the user was presented the delta and chose to continue and accept the overrun.

**Two scope additions made during execution, with the user's approval:**
- The Step 3.3 presentation-list mechanism (T5) — corrected FR-5's delivery site after the ordering defect was found.
- Surface 15b, `/akili-archive`'s Step 3 signal list (T8) — added after P-7's "cites rather than restates" reading was refuted during T7.

---

## 8. This run's own dogfooding — T6

**T6 was this spec's only `skip-eligible` task, and the predicate refused it.** Condition 1 passed (falsifier executed, red observed) and condition 3 passed (`Consumers: none`), but **condition 2 failed** — T6's own `Disqualifier` says *"read it to confirm the citation"*, and FR-1 condition 2 excludes exactly that. A Reviewer was spawned, no `REVIEW_SKIPPED` record was written, and the mismatch was reported at the continue gate per DD-12 (`execution.md:549-628`).

**So the spec predicted one skip in nine tasks and delivered zero.** This is the single most useful data point this run produced about the predicate's real-world yield: even the one task its own author judged simplest enough to claim `skip-eligible` failed the predicate on the same condition that dominates the held-out walk in §3. The pattern is consistent across both the dogfooding run and the 12-record held-out corpus — condition 2 is strict by construction, and that strictness is doing most of the predicate's work.

---

## 9. Remaining gaps and assumptions

- **P-15 / DD-11 correction owed.** The shipped design and requirements documents state the held-out base as 14; it is **12**. This does not change any shipped rule (the count lives only in spec documents, excluded from the npm package by `!docs/specs`), but it should be corrected the next time either document is touched, so a future reader does not inherit "14" the way this task was warned not to.
- **The `requirements.md` §1 / `tasks.md` §2 discrepancy on held-out wording (§2, gate d)** is unresolved as a matter of documentation hygiene — both documents are spec-local and frozen, so no task in this spec may edit them, but the discrepancy should be named to the user as a small methodology finding: a `tasks.md` should never impose a *stricter* prohibition than the requirement it implements without saying so.
- **`CHANGELOG.md` restates the predicate in full (§2, gate b).** Accepted as an intentional exception (a release note that only cited the block by name would be useless to a reader without the source open), but it is the one place a future predicate edit would leave a stale restatement behind — already flagged as a T8 ADVISORY, not repeated as a new finding here.
- **The Reviewer's Step 3.2 authoring-check suggestion** (a one-line check tying `skip-eligible` classification to the `Disqualifier`'s content, offered during T6's review) was correctly declined under *Advisory Never Becomes A Task* and goes to the user as a candidate proposal outside this spec, not fixed here.
- **No other gap or assumption.** The predicate walk used only the 12 records' own `tasks.md` fields and `execution.md` outcomes; no corpus task's field was reconstructed or inferred.
