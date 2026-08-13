# Execution Log: `/akili-audit` Phase→Tier Drift Detection

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/audit-phase-tier-drift` |
| Depth | Standard |
| Approval Mode | `gated` |
| Budget (design §9) | 4 tasks · ~55 LOC · 1 review round per task |
| Harness | `.agents/` present (4 personas). **No Step 8E wrappers** in this repo, and **no `## Model Routing` registry** in the root guides — model bindings set explicitly per spawn by the Leader |
| Model bindings | Leader `opus` · Implementer `sonnet` (T2) · Reviewer `opus` (T3) — `author ≠ auditor` holds by distinct models |
| Design review | Judgment Day `APPROVED` (`judgment.md`) — 2 fix rounds, 1 scoped re-judgment, 5 blind judges |

### Leader decisions recorded at run start

1. **T3 executed sequentially, not in parallel with T1/T2 — correcting `tasks.md`.** The task graph declares T3 "parallel-safe with T1/T2 — different category". That is true at the category level and **false at the file level**: T1 and T3 both edit `.claude/commands/akili-audit.md`, so concurrent Implementers would collide on the write regardless of logical disjointness. Parallel-safety was reasoned about scope, not about the artifact. Execution order is document order.
2. **`caveman` not loaded** despite the command's instruction. Its scope is compressing transient agent output; loading it would spend the resource that is scarcest in this session. Brief compression applied by principle instead. Recorded rather than silently skipped.

## 2. Task Execution History

### T1 — New Step 2 category: comparison, finding shape, and degrade — PASS (attempt 1)

- **Date:** 2026-08-12
- **Attempts:** 1
- **Files changed:** `.claude/commands/akili-audit.md` (+1/−0)
- **What was done:** Twelfth Step 2 drift category `Phase→Tier Drift` added as a single bullet at `:60`, immediately after `Model Generation Drift` (`:59`) and before `### Step 3` (`:62`), leaving the `:55`–`:59` routing block contiguous. Content: the comparison plus FR-1's mutual-consistency clause naming registry + mirror + Step 8E wrappers; DD-1's three-step resolution with `(a)` packaged `docs/model-routing.md` probing `./node_modules/akili-specs/` then **both** `npm root -g` and `pnpm root -g`, `(b)` command-file Model checkpoints with roots **derived from `bin/akili.js`'s `TOOL_REGISTRY`** rather than enumerated, `(c)` the unevaluated degrade named in the Conformance Matrix; the four-value finding shape with the rationale cited by file and line plus which source answered and its confidence; DD-4's priority rule; and the four negative constraints.
- **Implementer verification:** three-token grep present; Step 2 bullet count = 12; `git diff --stat` single file. Disqualifiers applied — placement checked directly (bullet at `:60`, outside `:55`–`:59`), not inferred from the count.
- **Implementer assumptions (verbatim, both accepted by the Leader):** (1) *"I used lettered sub-clauses `(a)/(b)/(c)` inside the single bullet … mirroring the existing `Model Generation Drift` bullet's own `(a)/(b)/(c)` shape … Flagging in case the Leader wants a stricter flat-prose-only reading of the exemplar."* → **Accepted**: the exemplar itself uses that shape, so this follows it rather than breaking it, and it keeps the resolution order unambiguous. (2) *"I did not independently re-derive `TOOL_REGISTRY`'s current host list to hardcode into the bullet — by design … the bullet points at `TOOL_REGISTRY` as the authority."* → **Accepted**: that *is* DD-1. Hardcoding would have reintroduced the exact defect Judgment Day round 2 removed.
- **`Not Done / Assumptions`:** none for T1's scope.
- **Reviewer verdict:** `STATUS: PASS` — *"All five of T1's required content areas land in the single new `:60` bullet, DD-1's resolution order is reproduced faithfully (both package managers, roots derived from `TOOL_REGISTRY` rather than enumerated), and NFR-3 is structurally proven — `git diff --numstat` is `1 0`, so the eleven pre-existing categories are byte-unchanged and the `:55`–`:59` block is contiguous with the new bullet strictly after it."*
- **Reviewer independence note:** the Reviewer did not replicate the Implementer's count grep. It read `:45`–`:61` directly to verify placement and used `git diff --numstat` (`1 0`) as structural proof of non-regression — a stronger check than the count, since zero deletions makes changes to the existing eleven impossible.
- **ADVISORY:** none. Diff is 1 line; the reviewer contract's <50 LOC mode suppresses the lens block, and no lens finding rose to a spec violation.
- **Forward pointer raised by the Reviewer (not a T1 defect):** the category text does not yet say what happens when a phase is **present locally but absent upstream**, or the reverse. Correctly outside T1's gate — no FR-1/FR-2/FR-4 scenario covers it. **Already owned:** `tasks.md` T4's HITL walkthrough lists both branches explicitly, and its disqualifier requires any such gap to be fixed in-task. Recorded so T4 does not rediscover it late.
- **Requirements covered:** FR-1 (both scenarios, all clauses), FR-2 (all clauses), FR-4 (all clauses), NFR-1, NFR-2 (parts 1 and 3), NFR-3, NFR-4.
- **Issues encountered:** none.
- **Final verification result:** PASS — greps green with disqualifiers applied, placement verified independently by both roles.

### T2 — Divergence record: marker, recognition, and the re-report rule — PASS (attempt 2 of 3)

- **Date:** 2026-08-13
- **Attempts:** 2
- **Files changed:** `.claude/commands/akili-audit.md` (line 60 extended, then its marker delimiter corrected)

#### Attempt 1 — FAIL

- **What was done:** appended the six required clauses to the `Phase→Tier Drift` bullet. All six landed and mapped cleanly to FR-3; T1's text preserved verbatim as prefix.
- **Reviewer verdict:** `STATUS: FAIL` — one issue, quoted verbatim:

  > **Discovered Issue: the marker as landed is NOT byte-identical to DD-2 — it carries six extra characters, and the Implementer's evidence hid this by unescaping before comparing.** … The Implementer's `MATCH: True` was produced *after* applying `.replace('\\`','`')`. That transform is the entire finding: the evidence normalized away the exact difference the disqualifier exists to catch, then reported a match. Per the reviewer contract, a check that structurally cannot observe the property has not evaluated it.
  >
  > **The agent reads raw bytes.** … The marker it reads contains backslashes; a maintainer following DD-2 writes plain backticks. Strict application of "exactly" yields a **false negative on a valid acceptance record** — which re-reports a deliberately accepted divergence. That is a direct FR-3 scenario-1 miss and an NFR-2 noise violation, in the one mechanism whose whole job is to prevent recurring findings on a healthy project.
  >
  > **The escaped form does not even render back to the marker.** CommonMark states backslash escapes are inert inside code spans … Neither the raw form nor the rendered form yields DD-2's marker.
  >
  > **Violated Rule:** `tasks.md` → T2 Done (*"marker byte-identical to DD-2"*); `tasks.md` → T2 Disqualifier; `design.md` → DD-2; downstream `requirements.md` FR-3 scenario 1, NFR-2.

- **Root cause — the work order, not the worker.** `tasks.md` T2 Scope bullet 1 quoted the marker in the escaped form while asserting it was *"quoted exactly as DD-2 defines it."* The Implementer followed the work order faithfully. The second source of truth predated the diff.

#### Leader correction between attempts (spec edit during execution — disclosed)

`tasks.md` T2 Scope bullet 1 was corrected to instruct reading the marker from **`design.md` DD-2's fenced block** and emitting it with unescaped backticks. **`design.md` was not edited** — it is authoritative, and T2's own disqualifier requires reporting a command↔design divergence rather than reconciling it by editing the design. Not treated as a Pivot: the design was never wrong, only its transcription into the work order, so intent, scope, and budget are unchanged.

#### Attempt 2 — PASS

- **What was done:** single-backtick span with escaped inner backticks replaced by a **double-backtick span** around the unescaped marker. No other prose change.
- **Implementer verification:** raw `repr()` comparison of both strings with no normalization of any kind — `True` on raw bytes.
- **Implementer assumptions (both accepted):** (1) double-backtick span over a fenced block — keeps the sentence flowing as prose like every other inline reference in the bullet; both forms were sanctioned. (2) *"No leading/trailing spaces inside the delimiters: CommonMark only requires them when the span's content starts or ends with a backtick … adding them would have padded the extracted span with whitespace the raw comparison would then have to normalize away, defeating the point."* — the worker generalized the actual lesson of the FAIL rather than patching its surface.
- **Reviewer verdict:** `STATUS: PASS` — *"The double-backtick span carries DD-2's marker byte-identically (127 chars, `==` True with zero normalization applied on my side), renders back to it exactly under CommonMark, and leaves T1's text intact as a strict prefix. All six T2 clauses land against FR-3, NFR-1, NFR-2."*
- **Reviewer method note:** the render check was run empirically through `commonmark.js 0.31.2`, not reasoned about — 12 `<code>` spans, exactly one carrying the marker, 0 backticks outside spans, 6 inside (the three literal pairs). T1 non-regression proven by **prefix comparison** against `92cc060` (longest common prefix = 2073 chars = full length of the old line, so `old` is a strict prefix of `new`), not by the diff stat, which cannot distinguish an append from a reword inside the same line.
- **ADVISORY:** none (diff <50 LOC; reviewer contract suppresses the lens block).
- **Requirements covered:** FR-3 (both scenarios, all clauses), NFR-1, NFR-2 (part 2).
- **Forward pointer for T4 (raised by the Reviewer, not gating T2):** the text compares only the record's stated *packaged* tier. A record whose stated **local** `<tier>` no longer matches the project's current local tier would still silence the phase, though it now acquits a difference it never named — DD-2's *"the record acquits the difference it named; nothing more"* reads broader than a packaged-tier-only comparison. Correctly outside T2's clause list. **Add as a branch to T4's HITL walkthrough**, whose disqualifier requires fixing such a gap in-task.
- **Final verification result:** PASS — raw byte identity and render both verified independently by the Reviewer, with no normalization on either side.

#### Lesson observed this task

The attempt-1 Implementer did not misreport: it compared, got `True`, and said `True`. The defect was **normalizing the data before measuring it** — applying the same transform to both sides of a comparison that existed to detect that exact difference. A verification that transforms the property it evaluates always passes. This is the KZ-002/KZ-004 family in its purest form, and it is why attempt 2's brief forbade any normalization step and why the Reviewer was told the same prohibition applied to its own check.

### T3 — `:59(c)` structural persona check — PASS (attempt 3 of 3, after a pivot)

- **Date:** 2026-08-13
- **Attempts:** 3 — attempt 1 triggered a pivot; attempts 2 and 3 were rework against the corrected spec. **The 3-attempt ceiling was reached; a FAIL on attempt 3 would have HALTed the task.**
- **Status:** `[x]` — pivot approved by the user 2026-08-13, both subsequent attempts reviewed
- **What was done (attempt 1):** sub-item (c) rewritten as a structural comparison, with `leader.md`'s Delegation Ceiling and `implementer.md`'s Scope Discipline retained as explicitly non-exhaustive anchors per DD-3, both KZ-004 fall-through branches named, and the no-overwrite remediation clause added.
- **Implementer assumptions (both accepted):** (1) did **not** claim FR-5's behavioral `AND IT MUST` clause was proven, correctly deferring it to T4's walkthrough. (2) Flagged that the "preserve the existing no-overwrite language" instruction in the work order was imprecise — that clause lived in the sibling bullet at `:54`, not in (c) — and introduced it into (c) on the strength of the coverage map (`FR-5 BUT → T3`). The Leader accepted: the brief was wrong, the reading was right.
- **Reviewer verdict:** `STATUS: FAIL`, one issue. It confirmed DD-3 satisfied in both directions (*"the enumeration is gone and the names now sit downstream of the rule as illustration"*), the `BUT` clause correct, the one-directional comparison correct (a bidirectional rule would fire on every healthy project, violating NFR-2), and NFR-3 isolation verified byte-level against `a976898`.

## Pivot Record: T3

**Blocker.** `akili-audit.md:59(c)` as landed points the auditing agent at `.claude/templates/` as the packaged persona source. **That path exists in no consuming project.**

**Evidence (verified by the Leader against source, not taken from the Reviewer):**

| Fact | Source |
|---|---|
| `.claude/templates/` is what the installer reads **from** | `bin/akili.js:35` — `SOURCE_TEMPLATES = path.join(SOURCE_CLAUDE, "templates")` |
| Templates are written **to** `<resources>/templates/` | `bin/akili.js:561, 941` — `path.join(paths.resources, "templates", name)` |
| `resources` resolves to `<root>/akili` (Claude, OpenCode) and `<root>/config/akili` (Antigravity) | `bin/akili.js:85, 91, 105` — `TOOL_REGISTRY` |
| The authority already states this | `akili-constitution.md:387-391` — *"The packaged methodology ships default personas under `akili/templates/` inside the active tool's config directory"*, naming all three roots |

**Why this is a pivot and not a rework.** The wrong path originates in **`requirements.md` FR-5 itself** (lines 114 and 118 as written). The Implementer transcribed the requirement faithfully; three rework attempts against an unchanged requirement would all reproduce it. Per the Pivot Protocol, a broken spec does not consume rework attempts.

**Consequence had it shipped.** Combined with (c)'s own fall-through — *"a persona with no packaged template to compare against, left unscored rather than counted as drift"* — every persona in every consuming project hits the unscored branch, and the sub-check emits nothing, permanently and silently. FR-5's scenario (*"THEN the persona is reported as drifted from its packaged source"*) would never fire. The check would appear healthy and be inert.

**Third instance of one defect class in this spec.** Judgment Day C4 ruled on it verbatim: *"The claim was generalized from evidence gathered in **this** repository — the methodology source, where the path exists by construction — the one sample incapable of falsifying it."* That was DD-1's authority claim. The round-2 residual was the hand-listed host paths. This is the same error a third time, in a requirement written after both rulings.

**Revised direction (spec amended, awaiting approval):**

1. `requirements.md` FR-5 — packaged source redefined as `akili/templates/` inside the active tool's config root, resolved per `/akili-constitution` Step 8B; the `.claude/templates/` trap named explicitly so it cannot be reintroduced; a new `AND IT MUST` binding resolution to the config-root convention.
2. `requirements.md` FR-5 — **new scenario** *"The packaged template root cannot be resolved"*: report **unevaluated**, with a `BUT` forbidding the failure from collapsing into the "unscored" branch (the third fall-through the Reviewer identified).
3. `tasks.md` T3 scope — path corrected, unresolvable-root degrade added.
4. `proposal.md` — both mentions corrected, marked as pivot-corrected.
5. `design.md` — **not amended**: DD-3 never asserted a path, and §7 row 3 describes the change without one. Verified by sweep.

**Correction closure (two-direction sweep, run):** forward — `grep -rn "claude/templates"` across the spec folder now returns only the three deliberate warning mentions in `requirements.md` and `tasks.md`. Backward — every referrer to FR-5 and DD-3 re-read; the coverage map, the NFR-2/NFR-3 rows, and DD-3 remain true under the corrected wording.

**Working tree.** T3's attempt-1 edit is left in place, uncommitted. The Reviewer validated everything in it except the path phrase and the missing degrade, so attempt 2 is two phrase-level edits rather than a rewrite. Not rolled back — rollback is the HALT path, and this is a pivot.

**Budget impact.** None material: T3 was budgeted at ~5 lines and the correction stays inside its scope. `requirements.md` grew by one scenario, which is spec prose and does not count against NFR-5's shipped-surface budget.

**Awaiting: explicit user approval of this pivot before execution resumes.**

### T3 — attempts 2 and 3 (post-pivot rework)

**User approved the pivot 2026-08-13.** Execution resumed against the corrected `requirements.md` FR-5.

#### Attempt 2 — FAIL

- **What was done:** the two pivot fixes — `.claude/templates/` replaced by a pointer to the templates under `akili/templates/` in the active tool's config root *"resolved per `/akili-constitution` Step 8B"*, plus a fourth branch reporting **unevaluated** when the root cannot be resolved.
- **Implementer judgment (accepted by the Leader, then independently upheld by the Reviewer):** omitted the three-host-root parenthetical the previous Reviewer had included in its illustrative remediation, reasoning that hardcoding a host list would repeat the defect class the Pivot Record names three prior instances of. The Reviewer's verdict endorsed the omission explicitly — *"Omitting the three-root parenthetical was the correct call and I do not want it added back"* — and gave the reason the Implementer had not: `~/.gemini/config/akili/templates/` is **not** derivable from "the active tool's config root" alone, so Step 8B's enumeration is doing real work that a duplicated list would only risk contradicting.
- **Reviewer verdict:** `STATUS: FAIL`, one issue:

  > The landed text resolves the root … *"resolved per `/akili-constitution` Step 8B"* — but **`grep -c -- "--local" .claude/commands/akili-constitution.md` returns `0`**. The entire constitution has no `--local` mention … An agent following the pointer literally probes home roots only. … A `--local`-only project resolves nothing → degrades to **unevaluated** on a host that *does* carry templates … A project with a current `--local` install *and* a stale home install compares its personas against the **wrong** templates → false drift findings (NFR-2 noise) or missed real drift. … **Sub-item (c) drops the half its own neighbour keeps** [`:60` already carries *"probe both its home-directory root and its `--local` project-root variant"*].

- **Leader verification:** confirmed independently — `akili-constitution.md` contains zero `--local` mentions, `:60` covers the variant, and pivot-corrected FR-5 requires it. FAIL upheld.

#### Attempt 3 — PASS (effort `max`)

- **What was done:** one parenthetical added in place — *"(or its `--local` project-root variant, where that same config root sits under the project instead of the home directory)"*. Nothing else changed.
- **Reviewer verdict:** `STATUS: PASS` — *"The `--local` parenthetical closes attempt 2's sole gap with a derivation rule that matches `bin/akili.js:208-210` exactly for all three hosts, and everything attempt 2 cleared survives byte-identical — line 60 and sub-items (a)+(b) verified by `cmp` against `a976898`, with no host list and no `claude/templates` anywhere in the file."*
- **Reviewer method note:** verified the derivation rule against `bin/akili.js:208-210`, where `--local` is a pure `os.homedir()` → `process.cwd()` substitution of the identical relative path for all three hosts. It observed that this phrasing is *safer* than an enumeration would have been: **a hand-written list gets OpenCode wrong (`.config/opencode`, not `.opencode`), while "the same config root" is right by construction** — DD-1/DD-3's derive-don't-enumerate posture validating itself. Non-regression proven by `cmp` on line 60 and on line 59 truncated at `" and (c)"` (610 bytes identical), not by the diff stat.
- **ADVISORY:** none (diff <50 LOC).
- **Requirements covered:** FR-5 (both scenarios — the original and the pivot's new unresolvable-root scenario — and all `BUT` / `AND IT MUST` clauses except the behavioral one owned by T4), NFR-1, NFR-3.
- **Forward pointer for T4 (Reviewer, non-gating):** the parenthetical phrases the two roots as a **disjunction** (`or`), where `:60`'s sub-item (b) says probe **both**. FR-5 uses the same disjunctive wording and the fourth branch triggers only when the root *"cannot be resolved at all"*, which pushes an agent to exhaust both alternatives — so the requirement is discharged as written. **Recorded so T4's walkthrough exercises the `--local` install path deliberately.**
- **Final verification result:** PASS on the last available attempt.

#### Lesson observed this task

Three attempts, three different failure surfaces, one shared root: **claims about where files live in a consuming project, reasoned from the methodology source repo.** Attempt 1 used `.claude/templates/` (source-only path). Attempt 2 delegated to an authority silent on `--local`. Both were caught only by a reviewer that re-derived the paths from `bin/akili.js` rather than reading the prose for plausibility. The spec's own DD-1 already carried the rule that would have prevented all three — *derive from `TOOL_REGISTRY`, never enumerate* — and it took a pivot plus two rework rounds to apply it to a sibling sub-item. **A design principle recorded in one decision does not automatically reach the next one.**

### T4 — Matrix row, mirror, CHANGELOG, closure sweep, walkthrough — PASS (attempt 2 of 3)

- **Date:** 2026-08-13
- **Attempts:** 2
- **Files changed:** `.claude/commands/akili-audit.md` (`:59`, `:60`, `:105`, `:127`–`:128`), `docs/commands/akili-audit.md` (`:23`), `CHANGELOG.md` (`:13`)

#### Attempt 1 — FAIL (three issues), but with two real gaps found and closed

- **Surfaces written:** Conformance Matrix row at `:105` with **`Unevaluated`** added as a third status value (FR-4's degrade needs somewhere to be written); the `:125` reconciliation stated at `:127` — *clean is reported in the Matrix row, Identified Discrepancies stays silent* — plus `:128` extended so the checklist enforces its own new row; mirror bullet; `CHANGELOG.md` entry **classified minor** (new behavior in an existing command, guidance-only, matching both adjacent `Unreleased` entries — Reviewer confirmed against `AGENTS.md:99` / `docs/release-checklist.md:38`).
- **Two walkthrough gaps found and fixed in-task, disclosed prominently rather than folded in:**
  1. **Phase present in only one source** (branches 3/4) — `:60` said "report every difference" but never defined a difference when one side has no entry, while the finding shape demands four values that do not exist on the missing side. A literal agent had to invent behavior. Fixed by naming the case explicitly, including *"never guessing a tier value for the missing side"*.
  2. **`--local` precedence** — `:59(c)`'s disjunction gave no rule for a host carrying both a home install and a `--local` install. Fixed with a probe-both-plus-precedence rule.
- **Reviewer verdict:** `STATUS: FAIL`, three issues.

#### The three FAIL issues

**Issue 1 — a recorded divergence still silenced a phase after the *local* tier changed.** `:60` compared only the record's stated packaged tier. Walked: record states *T5 instead of packaged T1*; the project later moves the local tier to **T3**; packaged still T1 → record matches → **no finding**. A T3-vs-T1 divergence nobody accepted, silenced by a record that named T5. Violates DD-2's closing rule — *"The record acquits the difference it named; nothing more."*

> **Leader error, recorded.** The T2 Reviewer raised this branch and the Leader recorded it in this log as owned by T4. When composing T4's nine walkthrough branches, the Leader wrote branch 7 as the *packaged*-tier case — already covered — and the *local*-tier case never reached the brief. The Implementer walked nine branches faithfully; none was this one. **A finding noted for later is not carried by the note alone when the same person composes the later step without re-reading it.**

The Reviewer also named why no mechanical check would have caught it: *"it does not trip the disqualifier's literal wording (the agent guesses nothing; it follows the rule to a wrong result), which is why a grep-shaped or branch-list-shaped check misses it."*

**Issue 2 — attempt 1's own fix created the mirror-image asymmetry.** `:59(c)` gained a precedence rule (`--local` first) while `:60(b)` still enumerated home-first under "stopping at the first hit". Same host, same run, opposite precedence — the audit would compare personas against `--local` templates while resolving phase tiers from home-root command files, two upstream baselines in one report. The previous round FAILed `:59(c)` for having *less* than `:60`; this was the inverse.

**Issue 3 — NFR-5 budget reported satisfied in the one unit under which it cannot fail.** The Implementer reported `git numstat` (+4 net) after declining to reproduce the design's prose-density unit. The Reviewer recovered the unit — T1's `~28`-line estimate landed as **25.9 lines at 80 columns** — and measured the spec at **~89 against the ~60 ceiling, ~48% over**, dominated by a house-style CHANGELOG paragraph that `tasks.md` §4 budgeted at ~12 lines for all of T4. Its framing: *"Choosing the unit under which a gate cannot fail, having declined the one under which it might, is the same shape as the normalize-then-compare defect this spec's own log records"* — the third appearance of that family in this spec.

#### Budget escalation — raised to the user, ACCEPTED

Per `tasks.md` T4 gate 3 and `design.md` §9, the overage was **escalated, not trimmed**. The user accepted it. Assessment on record: an **estimating error, not scope creep** — `tasks.md` §4 never budgeted for a house-style CHANGELOG entry, and NFR-5 is a `SHOULD`. An escalated-and-accepted overage closes the gate; a silent pass would not have.

#### Attempt 2 — PASS (effort `xhigh`)

- **Fix 1:** the record comparison now checks **both** stored values — the record's `<tier>` against the project's current local tier, and its `<packaged-tier>` against the resolved packaged tier; a mismatch on **either** makes the record stale and the phase is re-reported.
- **Fix 2:** the tie-break was aligned **upward**, not dropped — `:60(b)` gained the same rule, in a **byte-identical** phrase (`grep -c` of the full sentence returns 2). The Implementer chose verbatim structural matching deliberately: *"the strongest guarantee the two sub-items can never re-diverge in future edits."*
- **Reviewer verdict:** `STATUS: PASS` — *"the both-values comparison re-reports a record whose local tier drifted while leaving a genuinely healthy record silent, making DD-2's 'acquits the difference it named' true of the text; the `--local`-first tie-break is now byte-identical in `:59(c)` and `:60(b)` and both resolve the same root on every input."*
- **Reviewer method note:** it tested the **converse** as well as the failing case — a healthy record where nothing changed still produces no finding, so the fix did not trade a silencing defect for an NFR-2 noise defect. It also proved `:49`–`:58` byte-identical by extracting both versions and diffing, and probed an ambiguity in *"a matching record"* (phase-name vs value match), finding both readings converge on the same output.

#### Full-spec closure sweep (Reviewer, final gate)

Every clause of FR-1…FR-7 and NFR-1…NFR-4 discharged; **no requirement clause left undischarged by the spec as a whole.** All walkthrough branches answerable from the text alone, including both fall-throughs. NFR-5 closed as an accepted overage.

#### ADVISORY (recorded, never gating — Advisory-Never-Grows: none becomes a task)

1. **`design.md` §7 calls its 6-surface table "the closed set", but the shipped change also touches the two Verification Checklist bullets at `:127`/`:128`.** Both are mandated by `tasks.md` T4 (*"state it, do not leave it to inference"*) and serve FR-6 — a stale design table rather than scope creep. Worth a one-line reconciliation in §7 at archive time so the next closure sweep does not flag it.
2. **The Matrix row fuses two independent checks** (`Phase→Tier Drift` + the `:59(c)` persona check) into one Aligned/Drifted/Unevaluated cell. A mixed state — phase→tier aligned, persona root unresolvable — must be carried in Notes or it disappears; a soft echo of FR-5's own *"indistinguishable from a clean result"* concern. No requirement mandates separate rows.
3. **The mirror now says "six categories" while the command has twelve** — pre-existing staleness (it listed five of eleven before this spec), made internally consistent with the bullet added. FR-7 asks only for a summary-level mention; the Reviewer confirmed the scope call was right.

- **Requirements covered:** FR-6 (all clauses), FR-7; NFR-2, NFR-3, NFR-4 final checks; NFR-5 escalated and accepted; `requirements.md` §8 gates executed.
- **Final verification result:** PASS.

---

## 3. Execution Summary

**All 4 tasks complete.** T1 and T2 landed the new category and its divergence-record mechanism; T3 replaced the hardcoded guardrail list with a structural persona check; T4 closed the surfaces and executed the §8 gates.

| Metric | Value |
|---|---|
| Tasks | 4/4 PASS |
| Reviewer FAIL rework rounds | 4 (T2 ×1, T3 ×2, T4 ×1) |
| Pivots | 1 (T3 — `requirements.md` FR-5 named a path that exists in no consuming project) |
| HALTs / FATAL_FAILs | 0 |
| Budget | ~89 prose-lines vs ~60 ceiling — **escalated and accepted** |
| Advisories | 3, all recorded, none promoted to a task |

**The through-line worth carrying to the retrospective:** five of the six FAIL/pivot findings in this spec were the same defect family — **a claim about the world verified by a method structurally incapable of falsifying it.** A path that exists only in the repo where it was written. A byte-comparison that normalized away the bytes it was comparing. An authority cited for a fact it does not contain. A budget reported in the one unit under which it cannot fail. A record checked against one of the two values it stores. Every one passed its own check and failed the world.

Only reviewers who **re-derived the claim from source** caught them — never the greps, and never the author.
