# Proposal: Scope the Worker Personas' Constitution Read

**Recommendation:** the Implementer and Tester personas should read the TRD and UX/UI design **by the sections the Leader's brief names**, not as four full documents per spawn. Measured in STAR, the current mandate loads ~29k tokens into every worker before it reads a line of its own task — and upfront context is not a one-time cost: this session's own telemetry shows a **17× cache re-read ratio**, so every token loaded at spawn is paid on every turn of that worker's life.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/scoped-constitution-reads` |
| Slug | `scoped-constitution-reads` — derived from the free-text argument ("scope the mandatory constitution read in the Implementer and Tester personas…"); the full text is proposal context, not a directory name |
| Type | **Change** |
| Approval Mode | `gated` (no up-front end-to-end mandate given) |
| Depends on | none |
| Parallel-safe | yes |
| Date | 2026-08-12 |
| Status | Draft — awaiting approval |

## 2. Intent

Make the worker personas obey the same token economy the rest of `/akili-execute` already enforces — pointer briefs, bounded reads, CodeGraph-over-full-reads — instead of contradicting it with an unconditional four-document load.

## 3. Problem / Current Behavior

`.claude/templates/implementer.md:14` and `.claude/templates/tester.md:14` both state, without condition:

> *"To maximize prompt caching, **FIRST** consult the project constitution (`CLAUDE.md`, `AGENTS.md`, `docs/trd/trd.md`, `docs/ux-ui/design.md`) in a consistent order before reading task-specific files."*

Three problems, in order of confidence:

| # | Problem | Evidence |
|---|---|---|
| 1 | **It contradicts the command that spawns it.** `akili-execute.md:151` mandates pointer briefs — *"name paths and sections; copy only what the list says to copy"* — and `leader.md:14` bounds the Leader's own reads. The worker is told the opposite. | Same repo, same run |
| 2 | **The stated rationale does not hold.** Prompt caching keys on exact prefix. Sibling subagents have different briefs → different prefixes → **no shared cache**. The consistent order buys nothing *across* workers; it only makes each worker's own oversized prefix re-read every turn. | Session telemetry: 3.3M cache read vs 194.6k cache write ≈ **17×** |
| 3 | **The asymmetry marks it as legacy.** `reviewer.md` carries no such mandate. `leader.md` carries a bounded one. Only Implementer and Tester load everything. | `grep -n "constitution" .claude/templates/*.md` |

**Measured cost (STAR, `alliance-research-indicators-main`):**

| Document | Size |
|---|---|
| `CLAUDE.md` | 16K |
| `AGENTS.md` | 16K |
| `docs/trd/trd.md` | 44K |
| `docs/ux-ui/design.md` | 40K |
| **Total per Implementer/Tester spawn** | **116K ≈ ~29k tokens** |

At the observed re-read ratio that is roughly **500k cache-read tokens per worker**, before task-specific reading. It scales with spawns × turns × tasks.

## 4. Proposed Outcome

A worker loads the **behavioral** constitution in full (root `CLAUDE.md` / `AGENTS.md` — the rules that always bind, and the smaller pair) and reads the **reference** documents (`docs/trd/trd.md`, `docs/ux-ui/design.md`) only at the sections the Leader's brief names — with a stated fallback for the case the brief names none.

## 5. Scope

| Surface | Change |
|---|---|
| `.claude/templates/implementer.md` | Rewrite the item-14 read rule (scoped reads + fallback); drop the incorrect caching rationale |
| `.claude/templates/tester.md` | Same rewrite, tester-shaped |
| `.claude/commands/akili-execute.md` | The Step 2.2/2.3 brief lists gain one item: **the TRD/design sections this task touches** |
| `docs/commands/akili-execute.md` | Summary-level mirror |
| `CHANGELOG.md` | `Unreleased` entry, classification decided at specify time |

## 6. Non-Goals

- **No change to the Reviewer.** It has no mandate today; adding or removing one is out of scope.
- **No change to the Leader's own load order** (`leader.md:14` is already bounded).
- **No model-tier or wrapper changes.** STAR's `haiku` Leader was a separate, already-corrected staleness bug — related symptom, unrelated cause.
- **No installer, hook, or new-command change.** Guidance only.
- **No change to CodeGraph guidance**, which already does the right thing.

## 7. Affected Users, Systems, And Specs

Every project that ran `/akili-constitution` — the personas are copied into each project's `.agents/`. Existing projects keep their current copies until re-scaffolded, so the change is forward-looking unless the user re-runs constitution or edits `.agents/` by hand. That migration question belongs in `/akili-specify`.

## 8. Visual Reference

- Source: **None**
- Location: n/a
- Notes: methodology prose change, no UI surface.

## 9. Requirement Delta Preview

### ADDED

- The Leader's Implementer/Tester brief must name the TRD and design **sections** the task touches.
- A stated fallback for when the brief names no section (the worker must not silently skip design tokens).

### MODIFIED

- Implementer and Tester constitution read: four full documents → root guides in full + reference documents by named section.

### REMOVED

- The "to maximize prompt caching" justification as currently worded — it is incorrect for sibling subagent contexts and, left in place, invites the next author to restore the full read.

## 10. Approach Options

| | Option | Trade-off |
|---|---|---|
| **A** | **Delete the constitution read; the brief carries everything** | Smallest context, worst failure mode. Conventions and design tokens are exactly what a worker must not improvise; this trades a token problem for a quality problem. Also pushes the payload into the Leader's *output*, the most expensive tokens in the loop (`akili-execute.md:151`). |
| **B** | **Root guides in full + TRD/design by named section** ✅ | Cuts the STAR load from ~29k to roughly ~10–12k while keeping every always-binding rule. Costs one new brief item and one fallback clause. Consistent with the pointer-brief economy already in force. |
| **C** | **Tier the read by task size** (full for complex, scoped for small) | Adds a per-spawn judgment call and a new way to get it wrong. The Leader already sets effort; another dial with fuzzy boundaries is more prose and more failure modes for less benefit than B. |

## 11. Recommended Approach

**Option B.** It is the smallest change that removes the contradiction, and it fails safe: the rules that must always bind stay fully loaded, and only the large reference documents become pointer-driven — which is precisely what the Leader's brief is already designed to do.

## 12. Risks, Dependencies, And Open Questions

| Risk | Mitigation |
|---|---|
| **A worker skips design tokens because the brief named no section, and ships off-token UI.** This is the reason the mandate exists; removing it carelessly trades tokens for rework. | The fallback clause is not optional in this change — it is the load-bearing part. `/akili-specify` must make it a testable requirement, not a note. |
| **KZ-004 recurrence.** This edit changes a *read rule* other steps depend on. The last spec's blocking defect was exactly this: an edit that amended the branches it was thinking about and never asked which existing branch the new case falls into. | Verification must walk the fall-through explicitly: brief names sections → ok; brief names none → ? ; task is UI but brief is backend-shaped → ? A presence-grep cannot see any of these. |
| Existing projects keep stale `.agents/` copies | Open question for specify: is a migration note enough, or does this need a `/akili-constitution` re-scaffold path? |
| Benefit is asserted from one project's measurements | STAR numbers are real but single-source. Specify should state the expected reduction as a range, not a promise. |

**Open question:** should `AGENTS.md`/`CLAUDE.md` also become section-scoped in very large projects? Deferred — they are the always-binding rules and the smaller pair; scoping them is a different risk profile.

## 13. Success Criteria

1. Implementer and Tester personas no longer instruct an unconditional full read of `docs/trd/trd.md` and `docs/ux-ui/design.md`.
2. The Leader's brief lists in `/akili-execute` require the task's TRD/design sections.
3. The fallback for a section-less brief is stated and its behavior is unambiguous when walked as a literal agent would.
4. Measured on STAR's document sizes, the mandated upfront load drops from ~29k tokens to **under ~12k**.
5. No regression in convention conformance: Reviewer FAILs citing constitution or design-token violations do not increase over the next two specs.

## 14. Next Step

```text
/akili-specify changes/scoped-constitution-reads
```
