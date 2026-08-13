# Proposal: `/akili-audit` Detects Phase→Tier Drift Against the Packaged Default

**Recommendation:** add one drift category to `/akili-audit` Step 2 — compare the project's **phase → tier mapping** against the packaged `docs/model-routing.md`, not just its tiers, models, and wrapper consistency. A real project (STAR) ran its `/akili-execute` Leader on `haiku` for weeks while every existing audit check passed, because the misconfiguration was *internally consistent* and only wrong relative to upstream.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/audit-phase-tier-drift` |
| Slug | `audit-phase-tier-drift` — derived from free-text intent ("si hacemos un `/akili-audit` deberíamos validar que esto esté aplicado") |
| Type | **Change** |
| Approval Mode | `gated` |
| Depends on | none |
| Parallel-safe | yes (touches `.claude/commands/akili-audit.md`; disjoint from `changes/scoped-constitution-reads`) |
| Date | 2026-08-12 |
| Status | Draft — awaiting approval |

## 2. Intent

Make the drift audit catch configuration that is **coherent with itself and wrong against the methodology** — the failure mode no consistency check can see.

## 3. Problem / Current Behavior

`/akili-audit` Step 2 already carries five routing-related categories (`akili-audit.md:55–59`). They are good, and they all passed on a live misconfiguration.

**The worked example (STAR, `alliance-research-indicators-main`, found 2026-08-12):**

`.claude/agents/akili-leader.md` declared `model: haiku`. The methodology's canonical registry states the opposite in plain text:

> `docs/model-routing.md:65` — *"The **Leader runs on the deep-reasoning tier (T1)**, not a cheap one"*
> `docs/model-routing.md:82` — `/akili-execute` → Leader = **T1**

Why every existing check passed:

| Check | Verdict on STAR | Why |
|---|---|---|
| Wrappers contradict the registry (`:55`) | ✅ pass | They agreed. STAR's mirror said `execute-Leader T5`; T5 = `haiku`; wrapper = `haiku` |
| Missing tiers / author ≠ auditor vs packaged default (`:55`) | ✅ pass | Nothing was missing — the comparison is scoped to tiers and that one note |
| Tier/model mismatch (`:58`) | ✅ pass | Asks *"is `haiku` right for T5?"* — it is. Never asks *"should the Leader be at T5?"* |
| Model generation drift (`:59`) | ✅ pass | Aliases were current |

**Root cause of the misconfiguration itself:** STAR was constituted before the methodology promoted the Leader T5 → T1. `CHANGELOG.md:303` records that correction and names the reasoning — *"the same category error as the old T5 Leader"*: treating *not writing code* as *not requiring reasoning*. STAR simply froze at the old mapping, in three places at once (`docs/model-routing.md:38,41`, the `CLAUDE.md`/`AGENTS.md` mirror, and the wrapper), each consistent with the others.

**Why it matters beyond one project:** the Leader writes every brief, selects each Implementer's skills, and adjudicates Reviewer FAILs. A weak Leader raises rework, and rework re-spawns both the Implementer and the Reviewer — the most expensive thing in the loop. A cheap Leader can cost more than an expensive one.

**A second, smaller gap in the same area.** `akili-audit.md:59(c)` flags `.agents/*.md` personas missing guardrails the packaged templates have gained since — but as a **hardcoded list of two** (`leader.md` Delegation Ceiling, `implementer.md` Scope Discipline). Every future template guardrail must be remembered and appended here, or the check silently stops covering it. This is the CS-2 stale-enumeration class, already recorded in this project's history.

## 4. Proposed Outcome

An audit run in any AKILI project reports, without editing anything:

1. Any **phase → tier assignment** that differs from the packaged `docs/model-routing.md`, naming both values and the packaged rationale — so the user can tell a deliberate local choice from frozen staleness.
2. Any `.agents/*.md` persona that has **drifted from its `.claude/templates/` source**, detected structurally rather than from a named list of guardrails.

## 5. Scope

| Surface | Change |
|---|---|
| `.claude/commands/akili-audit.md` | New Step 2 category: **Phase→Tier Drift**. Amend `:59(c)` so the persona-staleness check is structural, not an enumeration |
| `docs/commands/akili-audit.md` | Summary-level mirror |
| `CHANGELOG.md` | `Unreleased` entry |

## 6. Non-Goals

- **The audit still never edits.** Every routing category in Step 2 is report-only; this one is too. No auto-fix, no wrapper rewrite.
- **No new command, no installer or hook change.** Guidance only.
- **No change to the tier definitions or the packaged mapping itself.**
- **No verdict on deliberate divergence.** A project may legitimately run a phase off-tier; the audit reports the difference and its upstream rationale, it does not rule the project wrong.
- **No coupling to `changes/scoped-constitution-reads`.** That spec's migration question is *informed* by this check, not blocked on it.

## 7. Affected Users, Systems, And Specs

Every project that runs `/akili-audit`. Highest value for projects constituted more than one methodology release ago — precisely the ones least likely to notice.

Soft relation to `changes/scoped-constitution-reads`: its open question ("how do already-constituted projects pick up changed personas?") is partly answered by the structural persona-drift check proposed here. Neither blocks the other.

## 8. Visual Reference

- Source: **None**
- Location: n/a
- Notes: methodology prose change, no UI surface.

## 9. Requirement Delta Preview

### ADDED

- Step 2 drift category comparing each phase→tier assignment against the packaged default, reporting: phase, local tier, packaged tier, packaged rationale.
- The report's Conformance Matrix gains a row for methodology conformance, so the score reflects it.

### MODIFIED

- `:59(c)` persona-guardrail check: from "missing these two named guardrails" to a structural comparison against `.claude/templates/`.

### REMOVED

- Nothing. All five existing routing categories stay — they catch defects this one does not.

## 10. Approach Options

| | Option | Trade-off |
|---|---|---|
| **A** | **One new Step 2 category, prose-only** ✅ | Fits the command's existing shape exactly (eleven categories today, all prose-defined, all report-only). Smallest change; no new mechanism to maintain. Depends on the auditing agent actually reading the packaged file — which every other category already assumes. |
| **B** | **Ship a comparison script** (`scripts/`) the audit invokes | Deterministic and cheap to re-run. But it introduces a packaged executable into a guidance-only command, needs its own installer surface and tests, and hardcodes a document format that is prose today. Large step for one check. |
| **C** | **Have `/akili-constitution` re-sync the mapping on every run** | Fixes rather than reports — and that is the objection: it would silently overwrite deliberate local choices, breaking Safe Update's never-overwrite contract. Wrong command, wrong posture. |

## 11. Recommended Approach

**Option A.** The audit's whole design is prose categories judged by a T3 model with a report-only posture; this check belongs in that shape. Option B may become right later if the packaged mapping ever becomes machine-readable — worth recording as a follow-up, not doing now.

## 12. Risks, Dependencies, And Open Questions

| Risk | Mitigation |
|---|---|
| **False positives on deliberate divergence.** A project that knowingly runs a phase off-tier gets flagged every audit, and a check that cries wolf gets ignored. | The finding must report the difference **and** the packaged rationale, and the spec should define how a project records an accepted divergence so subsequent audits stay quiet. This is the design question `/akili-specify` must answer, not a detail. |
| **KZ-004 recurrence — third instance in three days.** This class (an edit or check that covers the branches it thought about, never the one left out) has now produced the `/akili-resume` container gap, the STAR tier freeze, and this very audit blind spot. | The verification for this spec must itself walk the fall-through: what does the check do when the project's registry has a phase the packaged default does not, or vice versa? A presence-grep cannot see it. Recurrence should raise KZ-004's severity at the next retrospective. |
| The packaged default lives in the installed copy, whose location varies by host | Specify must state how the audit resolves the packaged `docs/model-routing.md`, and what it reports when it cannot find one (degrade and say so — never skip silently). |

**Open question:** should the phase→tier check also compare against the `Updated:` stamp already used by Model Generation Drift, so an old stamp raises the finding's priority? Likely yes; deferred to specify.

## 13. Success Criteria

1. Running `/akili-audit` against STAR **as it was before 2026-08-12** would report the `execute-Leader` T5-vs-T1 difference as a finding, citing `docs/model-routing.md:65`.
2. The finding names local tier, packaged tier, and the packaged rationale — enough for the user to judge deliberate vs stale without opening another file.
3. A project whose mapping matches the packaged default produces **no** finding in this category (no noise on healthy projects).
4. The persona-drift check no longer depends on a hardcoded guardrail list, and would flag a `.agents/implementer.md` that predates a future template change without that change being named in the audit text.
5. All five existing routing categories still behave as today.

## 14. Next Step

```text
/akili-specify changes/audit-phase-tier-drift
```
