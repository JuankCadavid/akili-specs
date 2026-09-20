# Kaizen Entry — changes/agents-md-canonical

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/agents-md-canonical` |
| Date | 2026-09-20 |
| Branch | `master` |
| Branch Context | **`default`, and apply-capable** — no `Integration Branch:` pin exists, and the default branch resolved through the skill's step 4 (unique `main`/`master` rule: `master` local, `origin/master` remote, no `main` anywhere). **Note:** neither root guide carries the `Default Branch:` pin `/akili-constitution` is meant to write, so this resolution came from the fallback rather than the pin — see `## Noted, not a lesson` |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 2 | tasks.md |
| Implementer attempts | 5 (T1 ×3, T2 ×2) | execution.md |
| Reviewer FAIL rework attempts | **3** (T1 ×2, T2 ×1) | execution.md — T1 attempts 1–2, T2 attempt 1 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 | execution.md |
| PRODUCT_BUGs | — | no `test-report.md`; absence accepted (no test gate) |
| Judgment-day severe findings | — | not run (Lite depth) |
| Validation FAIL / WARN | — | no `validation-report.md`; absence accepted |
| Tasks closed under `REVIEW_WAIVED` | 0 | execution.md |
| Drift attributable to this spec | — | `docs/specs/audits/` holds no report |
| Budget delta | review rounds **5 vs 3**; insertions **36 vs ~25** | design.md §6 vs execution.md |

## Lessons

- **KZ-changes--agents-md-canonical-1 — A removal sweep keyed on the identifier being removed cannot see an obligation stated in a collective noun.** (Product, **Medium**)
  - **Root cause.** T1's pre-review sweep was specified as `grep -n "CLAUDE\.md"` — keyed on the *filename being removed*. Two separate sweeps ran it and read every hit individually, and both were structurally blind to `:1128`, *"the registry … was written to **both** root guides"*, because that line **never names `CLAUDE.md`**. The obligation survived in the collective noun. The Reviewer closed it in one pass with `grep -nEi 'both|root guides|two guides'` — keyed on the **obligation**, not the identifier.
  - **Evidence.** `execution.md` — T1 attempt 2 Reviewer `FAIL`, Issue 1 and ruling Q3: *"Every sweep so far … was keyed on the literal `CLAUDE.md`. This mandate is invisible to all of them … The class is: a both-files obligation stated in the collective noun."*
  - **Why it is not a duplicate.** The digest already carries *"grep the file for the superseded phrasing **and its paraphrases**"* (KZ-changes--kaizen-loop-closure-2) and *"walk each FR statement … term by term"* (KZ-changes--gate-falsifiability-2). Neither says **what to key the sweep on** when the obligation never contains the identifier — and both were in the digest while this failure happened twice.
  - **Standardization:** → P1.

## Noted, not a lesson

- **The `Default Branch:` pin is missing from both root guides.** Branch Context resolved to apply-capable here only through the skill's unique-`main`/`master` fallback. A repository that later gains a `main` branch, or is cloned where both exist, would resolve *unresolved* and silently lose Apply Mode — the failure mode where a kaizen backlog grows and never applies. Below the lesson bar because nothing in this run was lost by it; recorded as the recurrence feed. Remedy is one line: pin `Default Branch: master` in the constitution summary.
- T2's stated check 4 is mis-specified in `tasks.md` (heading granularity). Captured as follow-up #3 in the archive summary rather than as a lesson, because the corrected form is already written into `execution.md`.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.claude/commands/akili-specify.md` — Step 3.2 task-quality rules |
| Edit | **A removal or rename sweep is keyed on the obligation, not on the identifier being removed.** A rule that mandates the thing you are deleting may never name it — *"written to both root guides"* survives every `grep` for the filename. Specify the sweep on what the rule *obliges* (`both`, `each`, the collective plural), and read every hit. |
| Severity | Medium |
| Status | `applied (2026-09-20)` |

### P2

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-changes--kaizen-loop-closure-2` |
| Edit | Add `changes/agents-md-canonical` as a source spec; raise severity **Medium → High**; append the recurrence note: *"recurred — the paraphrase clause did not cover an obligation stated in a collective noun that never names the superseded identifier (`:1128`, 'both root guides'), costing a second rework round."* |
| Severity | High |
| Status | `applied (2026-09-20)` |

### P3

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-changes--gate-falsifiability-2` |
| Edit | Add `changes/agents-md-canonical` as a source spec; append the recurrence note: *"recurred in a consolidation rather than a shipping pass — a content-preservation check specified at `^## ` heading granularity reported green while the only copy of the `tdd` skill binding was deleted; two independent reads confirmed it clean."* |
| Severity | High (already) |
| Status | `applied (2026-09-20)` |
