---
name: judgment-day
description: "Trigger: judgment day, dual review, adversarial review, juzgar. Run explicit blind dual review with at most two scoped fix/re-judgment rounds."
license: Apache-2.0
metadata:
  author: gentleman-programming
  adapted-by: "Juan Carlos Cadavid — jcadavid.com"
  adapted-for: "AKILI-SPECS"
  binding: core
  version: "1.8"
---

## Activation Contract

Load only when the user explicitly requests Judgment Day or equivalent dual/adversarial review for a concrete target. Judgment Day replaces ordinary 4R for that target; never run both.

## Hard Rules

- Resolve matching project skills before starting and pass the same paths to both judges and any fix actor.
- Build one complete immutable target, then launch two blind read-only judges in parallel with identical scope and criteria.
- Each judge returns one neutral findings result and terminates. Wait for both; never accept a partial judgment.
- Never launch `review-refuter`; two-judge agreement is the corroboration mechanism.
- Only the parent orchestrator merges/persists findings, launches the fix actor, launches scoped re-judgment, and updates native counters.
- Fix only severe findings confirmed by both judges. WARNING/SUGGESTION rows remain `info`.
- Judges must contrast every count, total, and quantity the target asserts against the prose of the other in-scope documents. Documents agreeing with each other is not corroboration — it is often one wrong idea copied forward; a figure contradicted by any in-scope document's own prose is a finding.
- Before any other reading, judges attack the design's Premise Ledger at its source: re-run or re-read every citation, try to refute every `UNVERIFIED` row with their own search, and look for premises the design depends on that carry no row. A premise is never accepted because the requirements and the design agree on it — only the source settles it. Row shape, classes, and triggers are defined in `/akili-specify` Step 2.2 — *Premise Ledger* block and are not restated here; this rule sets only what a bad row costs.

  | Judge finds | Severity |
  |---|---|
  | The source contradicts a premise | **severe** |
  | A citation does not reproduce at its verified-at commit | **severe** |
  | The design names existing code and has no Premise Ledger, or a false stated-empty line | **severe** |
  | A triggered class with no row | **severe** |
  | A depended-on premise with no row | finding, severity by Impact |
  | A premise confirmed | not a finding |

  **Read-only is not no-search.** A read-only judge writes nothing. Within that contract it may read and search the repository, and read its history where the host allows (the packaged judge tool set searches but has no shell). A judge that cannot run a cited command re-derives from the cited files where feasible and reports that row `not re-run` — never as confirmed. **The protocol is unchanged:** two-judge confirmation still gates auto-fix, and a premise contradiction reported by one judge is recorded as suspect **with its command as run**, so the architect settles it with a single re-run.

- Permit at most two fix rounds and two scoped re-judgments. Re-judgment sees only the frozen ledger plus fix delta and may record fix-caused defects.
- Terminal transaction states are only `approved | escalated`; never reset or extend an exhausted lineage.

## Decision Gates

| Condition | Action |
|---|---|
| Target unclear | Ask one scope question and stop. |
| Both judges confirm severe finding | Ask before round-one correction; then use the bounded fix actor. |
| One judge reports it | Record suspect; do not auto-fix. |
| Judges contradict | Escalate for explicit human decision. |
| Scoped re-judgment fails before round two | Parent may launch the final bounded fix round. |
| Any issue remains after round two | Escalate and stop. |

## Execution Steps

1. Start `review/start(target, mode=judgment_day)` and persist the transaction.
2. Launch both read-only judges against the same immutable target.
3. Merge findings into the frozen ledger and persist it through the selected artifact store.
4. Ask before round-one correction; run the fix actor only for confirmed severe IDs.
5. Run both judges again only over the frozen ledger plus immutable fix delta.
6. Repeat once at most, then run independent final verification and emit the terminal receipt.

## Output Contract

Return target identity, round, confirmed/suspect/contradiction/INFO counts, correction work units, scoped re-judgment result, artifact references, skill resolution, and exactly one final `JUDGMENT: APPROVED ✅` or `JUDGMENT: ESCALATED ⚠️`.

## References

- [../_shared/review-ledger-contract.md](../_shared/review-ledger-contract.md) — canonical transaction, ledger, persistence, and lifecycle contract.
- [references/prompts-and-formats.md](references/prompts-and-formats.md) — compact judge/fix prompts and verdict shape.

These reference files are not packaged with AKILI-SPECS. When they are unavailable, proceed with the contract described in this document alone: persist the findings ledger inside the spec folder (see below) and derive judge prompts from the Hard Rules and Output Contract.

## AKILI-SPECS Integration

| AKILI moment | How to use this skill |
|---|---|
| `/akili-specify` Step 2.5 — *Present & Approve*, **Review Design** option | The user-selected blind dual review of `design.md` before tasks are written; the target is the approved requirements + draft design, and judges attack the Premise Ledger first |
| `/akili-archive` Kaizen Measure | Severe confirmed findings from Judgment Day runs are a signal row in the `kaizen` retrospective |

Adaptation rules:

- Persist the findings ledger as `docs/specs/<spec-path>/judgment.md` so `/akili-archive` can read it as evidence.
- The two-judge blind protocol, the two-round fix ceiling, and the `APPROVED`/`ESCALATED` terminal states apply unchanged.
- Prefer running the two judges on a model different from the one that authored the design (author ≠ auditor, per AKILI model routing).