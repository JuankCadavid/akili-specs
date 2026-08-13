# Requirements: `/akili-audit` Phase→Tier Drift Detection

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/audit-phase-tier-drift` |
| Depth | **Standard** |
| Type | Change |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Status | Draft — Phase 1 |
| Date | 2026-08-12 |
| Source | `proposal.md` (approved intent) |
| Format precedent | `docs/specs/archive/2026-08-12-changes--spec-family-ordering/requirements.md` — this repo has no `docs/specs/general-setup/` (it packages the methodology rather than consuming it) |

## 2. Executive Summary

`/akili-audit` must gain one drift category: compare the project's **phase → tier mapping** against the packaged `docs/model-routing.md` and report every difference with enough context to judge *deliberate* from *stale*. Today five routing categories exist and all five passed on a live misconfiguration (STAR's `/akili-execute` Leader pinned to `haiku` for weeks) because the mistake was internally consistent and only wrong relative to upstream. A second, smaller change replaces a hardcoded two-item guardrail list with a structural persona comparison so the check stops rotting with every future template change.

## 3. Glossary

| Term | Meaning |
|---|---|
| **Packaged default** | The `docs/model-routing.md` shipped by the AKILI methodology — the upstream authority for phase→tier mapping |
| **Local registry** | The project's own `docs/model-routing.md` plus its `## Model Routing` mirror in root `AGENTS.md`/`CLAUDE.md` |
| **Phase→tier mapping** | The assignment of an AKILI phase (e.g. `/akili-execute` → Leader) to a capability tier (T1–T6) |
| **Wrapper** | A Step 8E tool-native agent definition (`.claude/agents/akili-*.md`) carrying an enforced `model:` binding |
| **Accepted divergence** | A phase→tier difference the project has deliberately chosen and recorded, which subsequent audits must not re-report |
| **Report-only** | The audit's standing posture: it writes `drift-report.md` and nothing else |

## 4. System Context & Scope

**In scope:** `.claude/commands/akili-audit.md` Step 2 (one new category, one amended category), its `docs/commands/` mirror, and a `CHANGELOG.md` entry.

**Out of scope:** the tier definitions and the packaged mapping itself; any auto-fix; any change to `/akili-constitution`'s scaffolding or Safe Update contract; the five existing routing categories; installer, hooks, or new commands.

**The gap being closed, stated precisely.** `akili-audit.md:55` does compare against the packaged default — but only for *"missing tiers or the author ≠ auditor note."* `:58` compares models against tier **definitions** (*is `haiku` right for T5?*). Neither asks *is this phase at the right tier?* That question has no owner today.

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| Project maintainer running `/akili-audit` | Learns that a project constituted N releases ago is running a phase on the wrong tier |
| The auditing agent (T4 scan / T3 judging) | Needs an unambiguous procedure, including for the cases where the comparison cannot be made |
| Methodology maintainer | Gains a feedback path from installed projects back to upstream corrections |

## 6. Functional Requirements

### FR-1: Phase→tier comparison against the packaged default

`/akili-audit` Step 2 SHALL carry a drift category that compares **every** phase→tier assignment in the local registry against the packaged `docs/model-routing.md` and reports each difference.

#### Scenario: The STAR replay (the case that motivated this spec)

- GIVEN a project whose local registry maps `/akili-execute` → Leader to **T5**, whose `## Model Routing` mirror says `execute-Leader T5`, and whose `akili-leader.md` wrapper declares `model: haiku`
- AND the packaged `docs/model-routing.md` maps that phase to **T1** and states *"The Leader runs on the deep-reasoning tier (T1), not a cheap one"*
- WHEN `/akili-audit` runs
- THEN the report contains a finding naming the phase, the local tier, the packaged tier, and the packaged rationale
- AND IT MUST report the difference even though the local registry, its mirror, and the wrapper are **mutually consistent** — internal agreement is not conformance
- BUT it must NOT edit the registry, the mirror, or the wrapper

#### Scenario: A conformant project stays quiet

- GIVEN a project whose phase→tier mapping matches the packaged default at every phase
- WHEN `/akili-audit` runs
- THEN this category produces **no** finding
- AND IT MUST NOT emit an informational "checked, all good" entry in the Identified Discrepancies sections — a drift report lists drift

### FR-2: Finding content sufficient to judge deliberate vs stale

Each finding SHALL carry the phase, local tier, packaged tier, and the packaged rationale for the packaged tier.

#### Scenario: Judging without opening another file

- GIVEN a reported phase→tier difference
- WHEN the maintainer reads the finding
- THEN it states all four values
- AND IT MUST cite the packaged rationale by location so the claim is checkable
- BUT it must NOT declare the project wrong — the finding reports a difference and its upstream reasoning; the verdict is the maintainer's

### FR-3: Accepted divergence silences subsequent audits

The methodology SHALL define how a project records a deliberate phase→tier divergence, and the category SHALL NOT re-report a divergence so recorded.

#### Scenario: A deliberate off-tier choice

- GIVEN a project that deliberately runs a phase off the packaged tier and has recorded that decision in the form this spec defines
- WHEN `/akili-audit` runs
- THEN this category produces no finding for that phase
- AND IT MUST still report **other** phases that diverge without a record
- BUT it must NOT treat an unrecorded divergence as accepted merely because a previous audit reported it

#### Scenario: A recorded divergence whose packaged tier later changes

- GIVEN a recorded divergence written against packaged tier `T5`
- WHEN the packaged default later maps that phase to `T1`
- THEN the recorded divergence no longer matches what it was written against
- AND IT MUST be re-reported rather than silently honored — a record acquits the difference it named, not every future difference

### FR-4: Packaged-default resolution, and degrading when it cannot be found

The category SHALL state how the packaged `docs/model-routing.md` is located, and SHALL report an explicit gap when it cannot be resolved.

#### Scenario: No packaged default reachable

- GIVEN a host where the installed methodology copy cannot be located
- WHEN `/akili-audit` runs
- THEN the report records that this category could not be evaluated, and why
- AND IT MUST NOT silently skip the category or let its absence read as a pass
- AND IT MUST leave the `Code Graph Used`-style confidence signalling of the report intact by naming the unevaluated category in the Conformance Matrix

### FR-5: Structural persona drift, replacing the hardcoded guardrail list

`akili-audit.md:59(c)` SHALL detect `.agents/*.md` personas that have drifted structurally from their **packaged template sources**, rather than by checking for a fixed list of named guardrails.

**Packaged template source (pivot-corrected — see `execution.md` → `## Pivot Record: T3`).** The deployed templates live under `akili/templates/` inside the **active tool's config root**, per `/akili-constitution` Step 8B — `~/.claude/`, `~/.config/opencode/`, `~/.gemini/config/`, or their `--local` project variants. **`.claude/templates/` is the methodology source tree and the npm tarball layout — what `bin/akili.js` reads *from*, never what it writes *to*, and therefore a path that exists in no consuming project.**

#### Scenario: A guardrail added upstream after this spec ships

- GIVEN a future methodology release that adds a new guardrail to the packaged `implementer.md` template
- AND a project whose deployed `.agents/implementer.md` predates it
- WHEN `/akili-audit` runs
- THEN the persona is reported as drifted from its packaged source
- AND IT MUST work without that new guardrail being named anywhere in `akili-audit.md` — the whole point of the change
- AND IT MUST resolve the packaged template root through the config-root convention above, never through a project-relative `.claude/templates/` path

#### Scenario: The packaged template root cannot be resolved

- GIVEN a host where no `akili/templates/` root can be located
- WHEN `/akili-audit` runs
- THEN the sub-check reports itself **unevaluated**, naming the reason
- BUT it must NOT absorb the failure into the "persona with no packaged template → left unscored" branch — an unresolvable root silences every persona at once, which is indistinguishable from a clean result
- BUT it must NOT recommend overwriting the persona: Safe Update never overwrites, and remediation stays a manual trim or merge

### FR-6: Report surface and report-only posture

Findings SHALL appear in `drift-report.md` under the existing priority sections, and the Conformance Matrix SHALL gain a row covering methodology conformance.

#### Scenario: Priority assignment

- GIVEN a phase→tier difference on a phase the packaged default marks as deep-reasoning (T1 or T3)
- WHEN the finding is written
- THEN it is classified at a priority reflecting that the affected phase gates downstream quality
- AND IT MUST keep the audit's report-only posture: no file outside `drift-report.md` is written

### FR-7: Mirror and CHANGELOG

`docs/commands/akili-audit.md` SHALL gain a summary-level mention of the new category, and `CHANGELOG.md` an `Unreleased` entry with its release classification stated.

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| **NFR-1 (Report-only)** | The audit MUST NOT edit the registry, mirrors, wrappers, or personas. This holds for both changed categories. |
| **NFR-2 (No noise)** | A conformant project MUST produce zero findings from FR-1 and FR-5. A check that fires on healthy projects gets ignored, which costs more than the gap it closed. |
| **NFR-3 (Non-regression)** | The five existing routing categories (`:55`–`:59`) MUST keep their current behavior and wording except for the `:59(c)` amendment FR-5 defines. |
| **NFR-4 (Guidance only)** | No installer, hook, packaged script, or new command. Prose in an existing command plus its mirror and CHANGELOG. |
| **NFR-5 (Bounded size)** | Target ≤ ~60 added lines across all surfaces; final budget set in `design.md`. |

## 8. Defect Classes → Gates

| Defect class | Gate |
|---|---|
| **Prose that agents cannot execute** (present but ambiguous — the class that produced this spec's own subject) | **No automated harness exists for LLM command-following.** Substitute: HITL walkthrough at the Phase 3 gate, replaying the STAR pre-fix values (local T5 / packaged T1 / wrapper `haiku`) against the final category text and confirming the finding it produces. Residual risk accepted: real proof arrives when an audit runs on a live project. |
| **Fall-through blindness** (KZ-004, three recorded instances) | The walkthrough MUST cover the branches the happy path does not: a phase present locally but absent from the packaged default; present upstream but absent locally; the packaged file unreachable (FR-4); a recorded divergence that no longer matches (FR-3). **A gap found here is a spec defect, not a note** — this is the exact class this spec exists to close, and passing it on grep-green would be self-refuting. |
| **False-positive noise** (NFR-2) | Walkthrough of a conformant project against the final text: the category must produce nothing. |
| **Stale enumeration / missed mirror** (CS-2) | `grep -rn` for the new category name across `.claude/commands/`, `docs/commands/`, `CHANGELOG.md` — reconciled against the surface list fixed in `tasks.md`. |
| **Contradiction with the five existing categories** | No automated check can judge semantic overlap. Substitute: human read of `:55`–`:59` alongside the new category at the HITL gate, confirming the new one closes the stated gap without duplicating an existing check. |
| **Presence-assertion mistaken for proof** | Every grep in `tasks.md` is declared a presence-assertion up front; each task must name what its grep cannot prove. |

## 9. Requirement ID Index

| ID | Name | Priority |
|---|---|---|
| FR-1 | Phase→tier comparison against the packaged default | MUST |
| FR-2 | Finding content sufficient to judge deliberate vs stale | MUST |
| FR-3 | Accepted divergence silences subsequent audits | MUST |
| FR-4 | Packaged-default resolution and explicit degradation | MUST |
| FR-5 | Structural persona drift replacing the guardrail list | MUST |
| FR-6 | Report surface and report-only posture | MUST |
| FR-7 | Mirror and CHANGELOG | SHOULD |
| NFR-1 | Report-only | MUST |
| NFR-2 | No noise on conformant projects | MUST |
| NFR-3 | Non-regression of existing categories | MUST |
| NFR-4 | Guidance only | MUST |
| NFR-5 | Bounded size | SHOULD |
