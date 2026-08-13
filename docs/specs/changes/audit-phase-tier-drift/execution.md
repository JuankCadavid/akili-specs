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
