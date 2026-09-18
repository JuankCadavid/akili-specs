# Proposal — Kaizen Loop Closure

**Recommendation:** let the kaizen apply phase run on a project's declared **integration branch**, not only on the default branch, and make the backlog it applies trustworthy — re-verified against HEAD, with `superseded` and `upstreamed` as first-class outcomes and a real sink for Methodology lessons. Measured on one consuming project, the current design has produced **105 retrospectives, 193 pending items, and zero applied standardizations in 22 days**, with the same defect recurring the same week it was diagnosed. Detection works; standardization never lands.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/kaizen-loop-closure` |
| Slug | `kaizen-loop-closure` — given as the argument |
| Type | **Change** |
| Approval Mode | `pre-approved (user, 2026-09-17 — "execute yolo mode")` — set at the end of `/akili-specify`; routine gates auto-pass and are logged; HALT, Pivot, budget tripwire, FATAL_FAIL, PRODUCT_BUG still stop |
| Depends on | none |
| Parallel-safe | yes — no file overlap with `changes/scoped-constitution-reads` (that spec touches `implementer.md`, `tester.md`, `/akili-execute`; this one touches the `kaizen` skill, `/akili-archive`, `/akili-resume`, `/akili-constitution`) |
| Date | 2026-09-17 |
| Author | /akili-propose (T1, session model `claude-fable-5-1`) |
| Release Classification | **proposed minor** — adds a constitution pin, new `Status`/`Kind` vocabulary, and a new reachability rule for Apply Mode; `changes/branch-safe-kaizen` was classified `patch` by user decision, so the user may override this at specify time |
| Status | Draft — awaiting approval |

## 2. Intent

Make the Standardize step of the kaizen loop actually reach the guides, templates, and personas it targets, in the workflow real teams use: long-lived integration branches that merge to the default branch on a release cadence measured in weeks.

`changes/branch-safe-kaizen` (archived 2026-08-22) made every shared-file write conflict-free by deferring it to the default branch. That solved the merge-conflict problem it was built for. It also assumed the default branch is reached often enough for the backlog to drain. It is not.

## 3. Problem / Current Behavior

### 3.1 Evidence — one consuming project, 2026-08-26 → 2026-09-16

Source: 105 entry files under `docs/specs/kaizen/` of the `onecgiar_pr` project (worktree `qa-development-2026`), read in full on 2026-09-17, cross-checked against the installed methodology (identical to this repo at v2.24.0).

| Signal | Value |
|---|---|
| Kaizen entry files | 105 |
| Pending items by `Status` | 193 `pending` · 1 `deferred` · **0 `applied`** |
| `docs/specs/kaizen-log.md` (digest) | absent on every branch |
| Constitution pin | `Default Branch: master` |
| Branch all 105 specs ran on | `qa-development-2026` — 2,039 commits ahead of `master`, no merge since 2026-08-12 |
| Kaizen entry files reachable from `master` | 0 |
| Explicit `Methodology` lessons recorded | ~25, every one `pending (upstream)` |

### 3.2 Four mechanisms, one outcome

| # | Mechanism | Where it lives today | Observed failure |
|---|---|---|---|
| 1 | **Apply Mode runs only on the default branch.** The pin is `master`; the team's whole cycle runs on an integration branch that reaches `master` on release cadence. | `kaizen` skill — Apply Mode, Hard Rules › Branch Context; `/akili-archive` Step 4.4; `/akili-constitution` Step 8 pin | Apply Mode has never been reachable. `/akili-resume`'s footer keeps recommending it "on the default branch", where the entry files do not exist. The branch-safe proposal listed *"pending standardizations pile up if nobody runs the apply step on main"* as a risk mitigated by that footer; the mitigation cannot fire. |
| 2 | **Recurrence has no canonical store.** The digest is written only by Apply Mode, so it does not exist; entries count recurrences by hand-editing sibling entry files. | `kaizen` skill phase 2 (`digest-update`), Apply Mode step 5 | The same lesson (`KZ-REH-1`, LOC budgeting) is simultaneously "5th recurrence" and "6th recurrence" in two entries five days apart, with divergent source chains. `digest-update` items target `KZ-id`s that exist in no digest. One entry writes a pending item whose `Target` is another entry file. |
| 3 | **Pending items are verbatim text with no re-verification between capture and apply.** | `kaizen` skill Apply Mode step 4 ("write the recorded 1–3 lines to the recorded target") | `KZ-STC-2` (Methodology, High, `changes--sidebar-toggle-consolidation`): a one-day-old `guide-sync` item would have written a description of a button the very next spec deleted — *"the precise failure mode the factual-claims sweep exists to prevent, arriving through the mechanism meant to fix it."* The spec docs got a Correction Closure sweep on that pivot; the kaizen backlog referencing the same fact did not, because nothing links a pivot to the pending items depending on it. |
| 4 | **Methodology lessons have no sink.** The skill rule is "no local edit — record the proposal and recommend upstreaming". | `kaizen` skill phase 3 (Methodology classification) | ~25 explicit Methodology lessons sit at `pending (upstream)` with no artifact, no status that can close them, and no intake on this repository's side. Seven entries state verbatim that they are refusing to act *"per the skill's own rule"*. |

### 3.3 Cost, in the project's own words

- `toc-center-guard` → `toc-science-program-guard`: the same counting-rule ambiguity, two days apart. The lesson from the first was `pending`.
- `reporting-entry-hub` T-3 wrote the `aria-disabled` rule; T-5 of the **same run** re-introduced `[disabled]`. *"The rule lived in one spec, not in the constitution, so each new surface re-decides it."*
- `overview-aow-cross-filter` on `KZ-OAH-1`: *"third occurrence, same component… diagnosed correctly three times and never reached the code."*

## 4. Proposed Outcome

1. **Apply Mode is reachable where the team works.** A project may pin an `Integration Branch: <name>` beside `Default Branch:`; Apply Mode and `/akili-archive`'s backlog offer treat that branch as an apply-capable context. Branches that are neither remain spec branches with today's behavior. Projects without the new pin behave exactly as today.
2. **The backlog is re-verified before it is written.** Apply Mode checks each item's `Target` and the fact its `Edit` asserts against current HEAD before writing; an item whose premise no longer holds becomes `superseded (reason)` instead of being applied.
3. **Methodology lessons close.** Apply Mode emits one consolidated upstream report from all `Methodology` / dual lessons and flips them to `upstreamed (date)`; the report is the hand-off artifact to this repository.
4. **The digest exists as soon as the first apply pass runs on the integration branch**, so `digest-update` items have a real target and recurrence counting stops living in sibling entry files.

## 5. Scope

| Surface | Change |
|---|---|
| `.claude/skills/kaizen/SKILL.md` | Branch Context gains a third context, **integration branch**, resolved from the new pin; Apply Mode's reachability rule names it; Apply Mode gains a **re-verify** step before step 4 and the `superseded` / `upstreamed` outcomes; the writable-set table gains the integration-branch row; the Standing rule "digest has one writer" is restated as *one writer per project, on the apply-capable branch*; the upstream report format is defined once here |
| `.claude/commands/akili-archive.md` | Step 3 branch gate and Step 4.4 backlog offer accept the integration-branch context; the one-line spec-branch note names the apply-capable branch by its pinned name instead of "the default branch" |
| `.claude/commands/akili-resume.md` | Backlog footer recommends the invocation on the pinned apply-capable branch by name; counts `superseded`/`upstreamed` as closed |
| `.claude/commands/akili-constitution.md` | Step 8 summary block: optional `Integration Branch: <name>` pin, detected and **confirmed with the user** like `Default Branch:`; guidance on when to set it (release-cadence merges to default) and when not to (trunk-based teams) |
| `docs/commands/akili-archive.md`, `akili-resume.md`, `akili-constitution.md`, `docs/skills/kaizen.md` | Summary-level mirrors |
| `AGENTS.md`, `CLAUDE.md` (this repo) | The Kaizen Loop bullet's "runs only on the default branch" becomes "on the apply-capable branch (default, or the pinned integration branch)" |
| `CHANGELOG.md` | `Unreleased` entry; classification decided at specify time |

## 6. Non-Goals

- **No change to the Retrospective phase's bounds** (≤3 lessons, 1–3-line edits, one entry file, never block the archive) or to the entry-file schema beyond the two new `Status` values and the `upstream` kind.
- **No retroactive normalization of the 105 existing entries** in the consuming project — five template generations coexist there; migrating them is a project-side task, and the apply pass must tolerate every generation it meets (see Risks).
- **No metrics-comparability work** — waiver reasons for skipped `/akili-test` / `/akili-validate`, a mandatory harness-failure metrics row, the "third occurrence promotes to a lesson" rule, strict template enforcement. Real findings from the same corpus, but they change what the Retrospective *measures*, not whether Standardize *lands*. They are the natural next spec once this one has made lessons reach the guides.
- **No gate, brief, HITL, or test-falsifiability rules** (the corpus's other ~10 lesson families). Every one of them would become another pending item under today's loop; this spec is the prerequisite.
- **No git hooks, CI, or installer changes** — discipline stays in command and skill text, as every AKILI guardrail does.
- **No intake automation on this repository's side.** The upstream report is a document the maintainer reads; turning it into `/akili-propose` input is a later decision.

## 7. Affected Users, Systems, And Specs

- **Users:** teams that integrate on a long-lived branch and release to `main`/`master` on cadence (the consuming project is one). Trunk-based teams and solo developers on `main` see no change — the pin is optional and the default-branch path is untouched.
- **Systems:** the `kaizen` skill and three commands above; `/akili-propose`, `/akili-specify`, `/akili-execute` keep reading only the `## Active Lessons` digest, unchanged in path and columns.
- **Specs:** `changes/branch-safe-kaizen` (archived) is the direct predecessor — its DD-1 (pin first, procedure second) is extended, not reversed; its success criterion 2 ("applied on main through the HITL menu") is what this spec makes reachable. `changes/scoped-constitution-reads` (proposal only) shares no file.
- **Consuming projects:** existing pins keep working. A project adds `Integration Branch:` by re-running `/akili-constitution` or editing the summary by hand; the first apply pass on that branch creates the digest.

## 8. Visual Reference

- Source: **None**
- Location: n/a
- Notes: methodology prose change, no UI surface.

## 9. Requirement Delta Preview

### ADDED Requirements

- An optional `Integration Branch: <name>` pin in the constitution summary, written and confirmed by `/akili-constitution`.
- A third Branch Context value, **integration branch**, that is apply-capable for Apply Mode, `/akili-archive` Step 3 items 2–4, and the Step 4.4 backlog offer.
- A **re-verify** step in Apply Mode: before writing, confirm the `Target` exists and the fact the `Edit` asserts still holds at HEAD (KZ-006 discipline — name what would make the item stale, then check it).
- Two `Status` values: `superseded (reason)` (premise no longer true at apply time) and `upstreamed (date)` (Methodology lesson handed off).
- A `Kind: upstream` pending item and a consolidated **upstream report** emitted by Apply Mode.

### MODIFIED Requirements

- "Apply Mode runs only on the default branch" → "runs on the apply-capable branch: the default branch, or the pinned integration branch".
- `/akili-resume` footer and `/akili-archive` spec-branch note name the pinned apply-capable branch instead of the literal phrase "the default branch".
- The digest's single-writer rule keeps one writer per project; the writer's branch is the apply-capable branch.

### REMOVED Requirements

- The implicit requirement that a project's default branch is reached within the kaizen loop's useful window. Nothing else is removed; the default-branch-only behavior remains the behavior of every project without the new pin.

## 10. Approach Options

| | Option | Trade-off |
|---|---|---|
| **A** | **Allow Apply Mode on any branch, HITL-gated** | Reaches the backlog everywhere, and reintroduces exactly the conflict class `branch-safe-kaizen` removed: two spec branches apply divergent edits to the same persona and git merges them textually. Rejected — it trades one structural failure for the previous one. |
| **B** | **One optional `Integration Branch:` pin; apply-capable = default ∪ integration** ✅ | Smallest change that reaches the backlog where the work is. Keeps the invariant that matters — *one serialized writer per project* — because the pin names exactly one branch and the team already treats it as the integration point. Costs one pin, one Branch Context value, one row in the writable-set table. Fails safe: no pin, no change. |
| **C** | **Keep default-only; add a "kaizen PR" workflow that cherry-picks entry files to `main` for apply** | Preserves the letter of the current rule at the price of a git choreography no command can drive from text, a second copy of every entry file, and an apply pass that edits guides on `main` the integration branch will not see until the next merge — so the next spec still re-decides the rule. Heavier and slower to close the loop than B. |

Independent of the branch decision, **re-verify + `superseded`** and **`upstreamed` + upstream report** are included in every option; they fix mechanisms 3 and 4, which would keep the backlog untrustworthy even once it is reachable.

## 11. Recommended Approach

**Option B.** It extends `branch-safe-kaizen`'s DD-1 rather than reversing it: the pin was introduced so commands compare against a name they already load; a second pinned name is the same mechanism. The write-discipline principle — *on a spec branch, write only files unique to that branch* — is untouched, because an integration branch is by the team's own definition not a spec branch. And the failure mode is asymmetric in the safe direction: a project that never sets the pin keeps today's behavior byte for byte.

## 12. Risks, Dependencies, And Open Questions

| Item | Kind | Handling |
|---|---|---|
| **A team pins a branch that is not actually serialized** (two developers integrate on it concurrently) and two apply passes race on the same persona. | Risk | The pin is confirmed with the user at constitution time with a one-line statement of what it asserts ("this branch is the single integration point; apply passes run here serially"). Apply Mode's existing Decide case (differing edits, same target) already surfaces a race that reached the file. Accept the residual: it is the same exposure the team already has for every other shared file on that branch. |
| **Re-verify becomes a full audit and Apply Mode stops being bounded.** | Risk | Re-verify is one check per item — the `Target` path exists, and the specific fact the `Edit` names is greppable at HEAD — never a re-read of the spec. Specify must state the check as one falsifying probe per item (KZ-006), not a procedure. |
| **Five entry-file template generations coexist in the consuming project**: three `Status` encodings, three lesson-ID grammars, YAML and table pending blocks, two spellings of the same template target (`general-setup/task.md` vs `tasks.md`). | Risk | Apply Mode must tolerate what it meets: an item it cannot parse is reported and left `pending` with a one-line note, never silently skipped or half-applied (KZ-004 — enumerate the collect step's terminal branches; the unparseable case is one of them). Normalizing the corpus is out of scope. |
| **Two pins can disagree with git reality** (integration branch renamed, pin stale). | Risk | Same handling as the `Default Branch:` pin today: the pin is the primary source; `/akili-audit` already reports constitution drift and gains one line for this pin. |
| **`upstreamed` closes a lesson on the project side that never lands on the methodology side.** | Open question | The report is the hand-off; whether this repository records receipt (a `docs/specs/kaizen/upstream-intake.md`, or reading the report as `/akili-propose` context) is deferred. Decide at specify whether the status should be `upstreamed` or the more honest `handed-off`. |
| **Should `Integration Branch:` accept more than one name?** | Open question | Recommend **no** in this spec: one name keeps the single-writer invariant checkable by eye. Multi-branch integration is a different risk profile and a different spec. |
| **Retire the `/akili-resume` wording "on the default branch" everywhere, or only in the footer?** | Open question | Grep at specify (KZ-002 — run the grep that falsifies "every mention was updated"); the `docs/commands/` mirrors and both root guides carry the phrase. |

**Active Lessons applied:** KZ-004 (new `Status`/`Kind` values → enumerate every scan's terminal branches in Apply Mode collect and `/akili-resume` count), KZ-005 (reference the Branch Context rule by name, never by line), KZ-006 (each re-verify check names its falsifying probe), KZ-002 (the "every mention updated" claim is grepped, not asserted), KZ-001 (read the branch-safe design past DD-1 before extending it — DD-7 makes legacy fallbacks permanent, which this spec must honor).

## 13. Success Criteria

1. In a project pinned `Default Branch: master` and `Integration Branch: qa-development-2026`, an Apply Mode invocation on `qa-development-2026` collects the backlog, fires the HITL menu, applies approved edits, creates or refreshes `docs/specs/kaizen-log.md`, and stamps statuses — with no edit to any shared file from a branch that is neither pin.
2. In a project with only `Default Branch:` pinned, every command's behavior is byte-identical to v2.24.0 (verified by walking Branch Context with the pin absent, present, and the current branch equal to it).
3. A pending item whose `Target` no longer exists at HEAD, or whose asserted fact a one-line grep refutes, ends the pass as `superseded (reason)` and is never written.
4. Every `Methodology` or dual lesson in the backlog appears once in the upstream report and ends the pass as `upstreamed (date)`; the report cites each lesson's ID, source entry file, and proposed upstream edit.
5. `/akili-resume` on the integration branch recommends the invocation by the pinned branch name and does not count `superseded` or `upstreamed` items as pending.
6. No requirement in this spec contradicts a `branch-safe-kaizen` design decision without naming it and stating what supersedes it (DD-1 extended, DD-7 honored).

## 14. Next Step

```text
/akili-specify changes/kaizen-loop-closure
```

## 15. Amendments

| Date | Phase | Change |
|---|---|---|
| 2026-09-17 | `/akili-specify` Step 2.3 reversion challenge | **Option B's "apply-capable = default ∪ integration" is superseded.** The challenge showed the union creates two writer branches (a hotfix archived on the default branch applies live while the integration branch applies its own backlog; the two merge textually, re-allocate the same `ADR-MMM`, and both bootstrap the digest). The invariant `branch-safe-kaizen` established is *one writer branch*, not *the default branch*. Current rule (requirements FR-2): the integration branch is the **sole** apply-capable branch when pinned; the default branch then records pending and defers to it. §4 item 1, §9 ADDED item 2, and §10–§11 read with this substitution; §13 criterion 1 stands. |
