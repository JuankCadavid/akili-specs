# Kaizen Log

Continuous-improvement record for this project, updated automatically by
`/akili-archive` (Kaizen Retrospective, powered by the `kaizen` skill).
Other AKILI commands read only the `## Active Lessons` table below —
keep it at 10 rows or fewer.

## Active Lessons

| ID | Lesson | Source Spec | Severity | Target | Standardized In | Status |
|---|---|---|---|---|---|---|
| KZ-004 | A presence-grep cannot see a fall-through branch — when an edit gives a command a new artifact type or folder role, enumerate the scan's existing terminal branches and state which one the new role lands in | changes/spec-family-ordering | Medium | Methodology | proposed: `.claude/templates/reviewer.md` (append 1–2 lines) | Deferred |
| KZ-005 | Never point at a rule by line number inside command prose — the pointer goes stale in the same diff that adds it; name the rule instead | changes/spec-family-ordering | Low | Methodology | proposed: `.claude/templates/implementer.md` (append 1 line) | Deferred |
| KZ-003 | A fallback-spawned worker's brief must state report delivery as the turn's terminating action — workers reliably do the work and unreliably mail it; idle-without-report recurs otherwise | changes/goal-driven-execution | Medium | Methodology | proposed: `.claude/commands/akili-execute.md` Steps 2.2/2.3 (append 1–2 lines) | Deferred |
| KZ-001 | When pinning a source, read it past the section you came for — the costliest review FAIL class is a claim contradicted elsewhere in its own pinned source | changes/ai-agent-development-skill | Medium | Methodology | proposed: `.claude/templates/implementer.md` (append) | Deferred |
| KZ-002 | Before writing an aggregate claim about a set of artifacts ("each file has X"), run the grep that would falsify it — summary surfaces (CHANGELOG, docs pages) inherit the artifacts' evidence bar | changes/ai-agent-development-skill | Medium | Methodology | proposed: `.claude/templates/implementer.md` (append) | Deferred |

## Entries

### 2026-08-12 — changes/spec-family-ordering

**Metrics**

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 6 (all PASS, attempt 1) | tasks.md |
| Reviewer FAIL rework attempts | 0 | execution.md — T1–T6 |
| HALTs / FATAL_FAILs / Pivots | 0 | execution.md |
| PRODUCT_BUGs | n/a (guidance-only; test-report absence accepted at archive) | archive-summary.md §4 |
| Validation FAIL / WARN | n/a (validation-report absence accepted at archive) | archive-summary.md §5 |
| Reviewer advisories raised / discharged | 3 / 3 | execution.md — T2, T4, T5 advisories; T6 closure |
| Defects found by the HITL walkthrough that all 5 grep gates passed | 1 blocking + 1 confirmed advisory | execution.md — T6 gate 4 |
| Budget | 6/6 tasks; 68 added lines vs ~110–150; 1 review round per task | execution.md — T6 gate 5 |

**Lessons**

- **KZ-004 — Presence-greps went green on prose whose fall-through branch was wrong.** (Methodology, Medium)
  - Root cause (5W1H): T4 gave `/akili-resume` a new artifact (`family.md`) and a new folder role (the family container), and amended every branch it was *thinking about* — the manifest read, the dashboard, the recommendation, the pending-child error case. It never asked which existing terminal branch the new folder role would fall into. The container holds only `family.md`, matches no phase file, and landed in the "incomplete spec → suggest `/akili-specify`" branch — the exact action FR-4's `BUT` clause forbids. Every task in this spec verified itself with presence-assertions (declared up front in `tasks.md` §2), and a presence-assertion is structurally blind to a fall-through: the text it greps for is present and correct; the defect is in the text it does not grep for. The gap survived T4's own PASS review and four of the five §8 closure gates. Only the walkthrough — following the prose as a literal agent would — surfaced it.
  - Evidence: execution.md — T6 gate 4, finding 1; tasks.md §2 global verification caveat; `.claude/commands/akili-resume.md` Step 0 item 2 vs Error Handling.
  - Standardization: append 1–2 lines to `.claude/templates/reviewer.md` — when a diff introduces a new artifact type or folder role into a command that scans a directory, the Reviewer enumerates the scan's terminal branches and requires the diff to say which one the new role lands in; grep-green is not a verdict on branches the diff did not touch. → **Deferred 2026-08-12 (user choice)**

- **KZ-005 — Two independent implementers hardcoded line-number pointers that their own diffs made stale.** (Methodology, Low)
  - Root cause (5W1H): T2 wrote `` (`:143`) `` and T5 wrote `` `:186` `` to point at a related rule site in the same command file. Both pointers were stale on arrival — the insertions that added them shifted the very lines they named. Neither implementer was careless; both reached for a line number because command prose offers no other way to say "the rule over there," and no standing rule forbids it. Recurrence within a single spec is the signal: two authors, same reflex, independently.
  - Evidence: execution.md — T2 ADVISORY, T5 ADVISORY; both removed in T6 under user approval at the wave gates.
  - Standardization: append 1 line to `.claude/templates/implementer.md` — refer to rules in command prose by name or section ("the Error Handling write-constraint bullet"), never by line number; a line pointer written into a diff is stale by the time the diff lands. → **Deferred 2026-08-12 (user choice)**

**Jidoka note:** the T6 disqualifier ("report the gap, do not pass on grep-green alone") is this methodology's stop-the-line rule for the prose-executability defect class, and it fired exactly as designed — the gap was fixed in-task rather than deferred past the archive.

### 2026-08-12 — changes/goal-driven-execution

**Metrics**

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 1 (PASS attempt 1) | tasks.md |
| Reviewer FAIL rework attempts | 0 | execution.md — T1 |
| HALTs / FATAL_FAILs / Pivots | 0 | execution.md |
| PRODUCT_BUGs | n/a (docs-only; test-report absence accepted at archive) | archive-summary.md §4 |
| Validation FAIL / WARN | n/a (validation-report absence accepted at archive) | archive-summary.md §5 |
| Budget | 1/1 tasks; 12 added lines vs ~35–40; 1/1 review rounds | execution.md §2 |

**Lessons**

- **KZ-003 — Fallback-spawn briefs omit the report-as-terminating-action clause; workers idle without mailing their report.** (Methodology, Medium — recurrence)
  - Root cause (5W1H): `.claude/templates/leader.md` carries the prevention rule ("state the report as the turn's terminating action") inside the cross-host dispatch section, but `/akili-execute` Steps 2.2/2.3's brief checklists never list it — so Leaders compose briefs from the checklist and drop the clause. Second consecutive spec with the symptom (4 idle turns in `ai-agent-development-skill`, noted-not-minted; 2 of 2 workers here). Poke-once protocol recovered every case — treatment exists, prevention isn't wired where briefs are written.
  - Evidence: execution.md — T1 Issues encountered; kaizen-log 2026-08-10 entry ("Noted, not a lesson").
  - Standardization: append 1–2 lines to the Step 2.2 (and 2.3) brief lists in `.claude/commands/akili-execute.md` (+ CHANGELOG line, package-affecting). → **Deferred 2026-08-12 (user choice)**

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
