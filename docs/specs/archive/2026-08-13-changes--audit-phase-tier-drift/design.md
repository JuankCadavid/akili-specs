# Design: `/akili-audit` Phase→Tier Drift Detection

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/audit-phase-tier-drift` |
| Depth | Standard |
| Status | Draft — Phase 2 |
| Date | 2026-08-12 |
| Requirements | `requirements.md` FR-1…FR-7, NFR-1…NFR-5 |
| Architecturally significant | No — prose in one existing command. `software-architect` not loaded: no new module, integration, persistence, or topology change |
| Reversion challenge (Step 2.3) | Run **inline** — session constraint forbids spawning agents unless the user asks. Outcome recorded in §6, and it changed the design |

## 2. Executive Summary

The change is four prose edits inside `.claude/commands/akili-audit.md` (three in Step 2, one in Step 3), plus a mirror line and a CHANGELOG entry — six surfaces across three files, enumerated in §7. The only real design question is **what counts as the upstream authority** for a phase→tier mapping in a project that has drifted — because the project's own `docs/model-routing.md` is a scaffold-time copy and therefore exactly the artifact under suspicion. The answer is a two-source resolution with an explicit degrade path (DD-1), and it is what makes FR-1 executable rather than aspirational.

## 3. Architecture Overview

`/akili-audit` is a five-step prose command: read baseline → scan codebase → **compare (Step 2, eleven drift categories at `:49`–`:59`)** → write `drift-report.md` → report. All eleven are prose judged by a T3 model; none is code. This change adds a **twelfth** category and amends sub-item (c) of the **eleventh** (Model Generation Drift). No mechanism is introduced, which is deliberate — Option B from the proposal (a comparison script) was rejected precisely to avoid putting an executable into a guidance-only command.

**Where the authority lives — the crux.** Three candidate sources exist, and none of them is unconditionally available in the project tree:

| Source | Where it actually lives | Refreshed by `akili update`? | Usable as authority |
|---|---|---|---|
| Project `docs/model-routing.md` + `## Model Routing` mirror | The project tree | **No** — written once by `/akili-constitution` | ❌ This *is* the artifact under audit |
| Packaged `docs/model-routing.md` | Inside the npm package only. `package.json`'s `files` ships `docs` (minus `docs/specs`), so it exists at the package root; `bin/akili.js` never copies `docs/` into a project | n/a — it *is* the package | ✅ Primary, when the package is locatable |
| Installed command files' Model checkpoints | A **host-specific root, `os.homedir()`-based by default** — `~/.claude/commands`, `~/.config/opencode/commands`, `~/.gemini/antigravity/global_workflows` (+2 more). Only `--local` puts them in the project tree | **Yes** — force-reinstalled on update | ⚠️ Fallback only — present somewhere on the host, **not** reliably in the project |

**Correction of record (Judgment Day C4).** An earlier draft claimed the installed commands are *"always present in an AKILI project"* and built DD-1 on it. That is false: `bin/akili.js`'s `TOOL_REGISTRY` targets home-directory roots unless `--local` is passed, and a project installed for OpenCode or Antigravity alone never creates `.claude/commands/` at all. The claim was generalized from evidence gathered in *this* repository — the methodology source, where the path exists by construction — the one sample incapable of falsifying it. DD-1 below treats source 2 as a fallback with an explicit search order, never as a guarantee.

## 4. Extended Directory Structure

No new files. Changes confined to:

```text
.claude/commands/akili-audit.md      # Step 2: +1 category, ~1 amended category
docs/commands/akili-audit.md         # mirror, summary level
CHANGELOG.md                         # Unreleased → Added
```

## 5. Data Model · API Design · Backend · Frontend · Shared Contracts

**Not applicable.** Guidance-only change: no data, no endpoints, no modules, no UI, no shared packages. Recorded explicitly rather than omitted, so the absence reads as a decision instead of a gap.

## 6. Reversion Challenge (Step 2.3)

**Trigger:** FR-5 removes the two named guardrails (`leader.md` Delegation Ceiling, `implementer.md` Scope Discipline) from `akili-audit.md:59(c)` and replaces them with a structural comparison. Removing named content from shipped prose is a reversion.

**Question:** what does removing the named guardrails break?

**Answer — and it changed the design.** The two names are not just examples; they are the highest-signal instances of the check, and they steer the auditing model toward the guardrails that matter most. A bare instruction to "compare structurally" is measurably vaguer: an agent given a concrete anchor produces concrete findings, and one given only an abstraction produces an abstraction. Removing them would trade a rot problem for a quality problem — the same shape as Option A rejected in the proposal.

**Design consequence (DD-3):** make the rule structural **and keep the two names as illustrative anchors**, phrased so they cannot be read as the closed set. Structural comparison is the rule; the names are the worked example. This satisfies FR-5's `AND IT MUST` clause (a future guardrail is caught without being named) without discarding the steering value.

## 7. Surface Table

| # | Surface | Change | Requirements |
|---|---|---|---|
| 1 | `.claude/commands/akili-audit.md` Step 2 | New category **Phase→Tier Drift** | FR-1, FR-2, FR-4, FR-6 |
| 2 | `.claude/commands/akili-audit.md` Step 2 | Divergence-record rule inside the same category | FR-3 |
| 3 | `.claude/commands/akili-audit.md:59(c)` | Structural persona comparison + retained anchors | FR-5 |
| 4 | `.claude/commands/akili-audit.md` Step 3 | Conformance Matrix gains a methodology-conformance row | FR-6 |
| 5 | `docs/commands/akili-audit.md` | Summary-level mirror | FR-7 |
| 6 | `CHANGELOG.md` | `Unreleased` → `Added`, classification stated | FR-7 |

**Expected total: 6 surfaces across 3 files.** Any hit outside this table in the closure sweep is scope creep; any surface with zero hits is a missed mirror (CS-2).

## 8. Design Decisions

### DD-1 — Two-source authority resolution, with a stated degrade

**Decision.** The category resolves the upstream mapping by walking this ordered search, stopping at the first hit and recording which source answered:

1. **Packaged `docs/model-routing.md`** — the complete tabular mapping. Probe `./node_modules/akili-specs/docs/model-routing.md`, then **each package manager's global root separately** (`npm root -g` *and* `pnpm root -g`). Probing only npm is a defect: `bin/akili.js` says so in its own comment — *"pnpm keeps its own global tree, so each manager must be probed separately"* — and `detectInstallType()` probes both for exactly that reason.
2. **Installed command files' Model checkpoints** — fallback when step 1 finds nothing. **Derive the roots from `bin/akili.js`'s `TOOL_REGISTRY` rather than from a list written here**, and probe, for every configured host, *both* the home-directory root and its `--local` project variant (`values.local` swaps the base to `process.cwd()`). At the time of writing that resolves to: `.claude/commands/`; `.config/opencode/commands/`; and **all three** Antigravity command roots — `.gemini/antigravity/global_workflows/`, `.gemini/antigravity-cli/global_workflows/`, `.gemini/antigravity-cli/workflows/` — each in both `./` and `~/` form. Each command file states its own tier in its Model checkpoint; `/akili-execute` and `/akili-test` additionally name their sub-role tiers (Leader/Implementer/Reviewer, Leader/Tester) in prose.

**Why derived, not enumerated (Judgment Day round 2).** The first correction of this decision hand-listed five paths and undercounted Antigravity's command roots two-to-three, omitted every `--local` variant of them, and missed pnpm's global tree — reproducing the original C4 defect at smaller scale inside its own fix. A hand-written path list in a document that ships separately from the installer will drift from it; the list above is an **anchor for a reader**, and `TOOL_REGISTRY` is the authority. This is the same structural-rule-with-illustrative-anchors shape as DD-3, and the same reasoning FR-5 applies to the audit's own guardrail list — a design that enumerates what it could derive is the defect it was written to detect.
3. **Neither resolvable** → the category reports itself **unevaluated** with the reason, and the Conformance Matrix carries that state (FR-4).

**The two sources are not peers, and the report must say which answered.** Source 1 is a table; source 2 is prose with inconsistent phrasing (`"runs best on **T5 Fast-Cheap**"` vs `"As Leader you run best on **T1**"`) and covers sub-roles only in narrative, so a source-2 answer has lower confidence and may be silent on sub-roles a source-1 table would cover. This mirrors the command's existing `Code Graph Used` posture: the report names the evidence basis because the same finding carries different weight depending on it.

**Rejected:** restating the canonical mapping inside `akili-audit.md`. It would create a second definition of a table that already has one home, guaranteeing exactly the divergence this spec exists to detect — the audit would rot into the thing it audits.

### DD-2 — The divergence record lives in the project's own registry, not a new file

**Decision.** An accepted divergence is recorded **in the project's `## Model Routing` section**, as a blockquote line carrying a fixed leading marker. No new file.

```markdown
> **Accepted divergence:** `<phase>` runs on `<tier>` instead of packaged `<packaged-tier>` — <reason>. (accepted <YYYY-MM-DD>)
```

**The literal marker is the load-bearing part (Judgment Day C2).** The record lives in the same section FR-1 scans, so without a fixed token an auditing agent cannot tell a record from a fresh assignment to test, and cannot extract the accepted-against tier that FR-3's re-report rule compares. `> **Accepted divergence:**` is that token: greppable, unambiguous, and outside the tier-mapping prose it sits beside. A line that is *almost* this shape is not a record — the audit treats only exact-marker lines as acceptances, and an approximate one as ordinary text (so a malformed record fails loudly as an unexplained divergence, rather than silently acquitting one).

**Who writes it: the maintainer, never the audit.** DD-5's report-only constraint covers this mechanism exactly as it covers the FR-5 persona check — the passive "is recorded" describes a human action, and NFR-1 forbids the audit from writing the note itself even when the acceptance is obvious.

**Why.** The registry is where a maintainer already looks to answer "what model runs this phase," and `/akili-constitution` already owns that section. A separate divergence file would be a fourth artifact to keep in sync with three that already drift.

**The re-report rule (FR-3, second scenario) falls out of the shape:** because the record names *the packaged tier it was accepted against*, a later upstream change makes the record self-evidently stale — the audit compares the record's stated packaged tier to the current one, and re-reports on mismatch. The record acquits the difference it named; nothing more. This is the clause that keeps DD-2 from becoming a permanent silencer.

### DD-3 — Structural rule, retained anchors

Per the §6 challenge. The rule is structural; `leader.md`'s Delegation Ceiling and `implementer.md`'s Scope Discipline stay as named examples, phrased as illustrations and not as the set.

### DD-4 — Priority follows the affected tier, not a fixed level

A phase→tier difference is classified by what the packaged tier implies: differences on deep-reasoning phases (T1/T3 upstream) land **High** — those phases gate downstream quality, which is precisely the STAR case — while others land **Medium**. Rejected: a fixed priority for the whole category, which would either drown real findings among cosmetic ones or overstate the cosmetic ones.

### DD-5 — Report-only, no exceptions (NFR-1)

The category writes nothing but `drift-report.md`. Notably it does **not** flip a wrapper's `model:`, even when the fix is unambiguous — the audit's whole contract is that it observes. Remediation is the user's, or a later `/akili-constitution` run. Applies equally to the FR-5 persona check, which must not recommend an overwrite (Safe Update never overwrites).

### DD-6 — KZ-004 applied to this spec's own verification

`KZ-004` (a presence-grep is blind to a fall-through branch) shaped the gate design in `requirements.md` §8 rather than any prose in the command: the walkthrough must exercise the branches the happy path never touches. Recorded here because the lesson changed a design artifact, per the kaizen citation rule.

### DD-7 — Zero-noise is a designed property, not an assumed one (owns NFR-2)

**Decision.** A conformant project produces no finding because three things hold together, each of which the implementation must carry explicitly:

1. **Emission is difference-only.** The category text instructs reporting *differences*; a phase whose local tier equals the packaged tier produces nothing. Not an optimization — the category has no "confirm match" output at all.
2. **Deliberate choices are absorbed by DD-2.** A recorded acceptance removes the only legitimate source of recurring findings on a healthy project. Without DD-2 this NFR is unreachable, which is why FR-3 is a MUST and not a nicety.
3. **"Evaluated and clean" is reported in the Conformance Matrix, not in Identified Discrepancies.** The category's health signal has a home that is not the findings list, so silence in the findings list is unambiguous rather than indistinguishable from "not run".

**Why this needed a decision at all (Judgment Day C3).** The first draft assumed zero-noise fell out of "compares and reports each difference." It does not: without (2) a deliberate divergence fires on every audit forever, and without (3) the category cannot be both silent and demonstrably evaluated. `proposal.md` names the cry-wolf risk; this is the mechanism that answers it.

### DD-8 — The eleven existing categories are read-only for this change (owns NFR-3)

**Decision.** The new category is **additive**, and the only edit inside an existing category is the FR-5 amendment to sub-item (c) of Model Generation Drift. The five routing categories at `:55`–`:59` keep their wording; the other six are untouched entirely.

**Enforcement:** the §7 Surface Table is the closed set. The closure sweep reconciles every hit against it — a diff touching any category not listed there is scope creep, and the five routing categories' current text is the baseline that sweep compares against. Recorded as a decision rather than left implicit, because "we only added things" is precisely the claim that goes unverified.

## 9. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Metric | Expected |
|---|---|
| Tasks | **4** |
| Added lines | **~55** (NFR-5 target ≤ ~60) |
| Review rounds | **1 per task** |

The estimate matches the declared **Standard** depth on its small side. It does not warrant dropping to Lite: Lite is one focused task, and this resolves to four with real design decisions (DD-1, DD-2) and a HITL walkthrough gate. Exceeding any number is information — `/akili-execute` stops and escalates rather than continuing.

**Budget reconciled after Judgment Day (both rounds).** The review added DD-7 and DD-8 and rewrote DD-1/DD-2, and the numbers are unchanged deliberately: DD-7 constrains the *content* of the category prose already planned as Surface Table row 1, and DD-8 is a verification directive riding the CS-2 closure sweep that `requirements.md` §8 already mandates. Neither adds a surface, so neither adds a task. The ~55-line figure counts **shipped surfaces**, not this document's prose. Recorded because both judges asked whether the fix silently broke the budget — silence would have been the wrong answer either way.
