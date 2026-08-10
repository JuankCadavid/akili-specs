# Kaizen Log

Continuous-improvement record for this project, updated automatically by
`/akili-archive` (Kaizen Retrospective, powered by the `kaizen` skill).
Other AKILI commands read only the `## Active Lessons` table below —
keep it at 10 rows or fewer.

## Active Lessons

| ID | Lesson | Source Spec | Severity | Target | Standardized In | Status |
|---|---|---|---|---|---|---|
| KZ-001 | When pinning a source, read it past the section you came for — the costliest review FAIL class is a claim contradicted elsewhere in its own pinned source | changes/ai-agent-development-skill | Medium | Methodology | proposed: `.claude/templates/implementer.md` (append) | Deferred |
| KZ-002 | Before writing an aggregate claim about a set of artifacts ("each file has X"), run the grep that would falsify it — summary surfaces (CHANGELOG, docs pages) inherit the artifacts' evidence bar | changes/ai-agent-development-skill | Medium | Methodology | proposed: `.claude/templates/implementer.md` (append) | Deferred |

## Entries

### 2026-08-10 — changes/ai-agent-development-skill

**Metrics**

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 6 (all PASS) | tasks.md |
| Reviewer FAIL rework attempts | 2 (T5 ×1 — Lambda Durable Functions omission; T6 ×1 — summary-surface over-claim) | execution.md — T5/T6 attempt histories |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 (1 user-approved Spec Correction: design §7 CrewAI durability claim, source-contradicted; two-direction sweep run) | execution.md — T2 Spec Correction |
| PRODUCT_BUGs | n/a (docs-only spec; test-report absence accepted at validation) | validation-report.md §9 |
| Validation FAIL / WARN | 0 / 4 (WARN-1 packaging fixed `b717c70`; WARN-2 fixed; WARN-3 accepted; WARN-4 open follow-up) | validation-report.md §11 |
| Budget | tasks 6/6; ~586 new lines vs ~600–730; review rounds +2 over budget (escalated at gates) | execution.md §3 Summary |

**Lessons**

- **KZ-001 — Pinned sources are read selectively; claims get contradicted by their own citations.** (Methodology, Medium)
  - Root cause (5W1H): authors verify "does the source state my claim," never "does this source contradict my frame" — T5's Lambda column omitted the third compute shape documented in its own pinned pages [9]/[10]; design §7 asserted a CrewAI durability loss the pinned CrewAI Flows docs refute. Both caught only by the Reviewer reading past the cited sections (the substituted human gate for the misinformation defect class).
  - Evidence: execution.md — T5 attempt 1 (Violated Rule: requirements.md §7 NFR-2 + §8); execution.md — T2 Spec Correction.
  - Standardization: 1–2 line append to `.claude/templates/implementer.md`. → **Deferred 2026-08-10 (user choice; this repo is the methodology source, so the local edit is the upstream)**

- **KZ-002 — Aggregate claims on summary surfaces are written from intention, not from the artifacts.** (Methodology, Medium)
  - Root cause (5W1H): T6's CHANGELOG and skill-page clause "each reference carries a `Last verified:` date" described the intended shape of the artifact set, not its grep-verifiable state; one grep falsified it, and the identical clause had already propagated to a second surface.
  - Evidence: execution.md — T6 attempt 1 (Violated Rule: requirements.md §6.6 FR-6 "truthful entry").
  - Standardization: 1–2 line append to `.claude/templates/implementer.md`. → **Deferred 2026-08-10**

**Noted, not a lesson (existing standard already covers it):** 4 worker turns ended idle without the contracted report; `.claude/templates/leader.md`'s poke-once protocol recovered every one. Recurrence of an already-standardized pattern — no new rule minted.
