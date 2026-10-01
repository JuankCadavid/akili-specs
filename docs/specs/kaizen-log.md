# Kaizen Log

Continuous-improvement record for this project. The `## Active Lessons` digest below is
refreshed only by the `kaizen` skill's **Apply Mode**, on the default branch — that apply
phase is its single writer. Per-retrospective entries live in `docs/specs/kaizen/`, one file
per spec, written by `/akili-archive`'s Kaizen Retrospective on any branch. Other AKILI
commands read only the `## Active Lessons` table below — keep it at 10 rows or fewer.

## Active Lessons

| ID | Lesson | Source Spec | Severity | Target | Standardized In | Status |
|---|---|---|---|---|---|---|
| KZ-changes--gate-falsifiability-2 | Requirement content is dropped in shipping and passes a Reviewer that checks scenarios — walk each FR statement, table and every paragraph under it term by term; a missing obligation is never an ADVISORY — **recurred (changes/leader-brief-contract: FR-4's terminal-branches paragraph never shipped, PASSed "term for term", found at the closure gate, cost a Pivot) · **changes/agents-md-canonical: recurred in a consolidation rather than a shipping pass — a content-preservation check specified at `^## ` heading granularity reported green while the only copy of the `tdd` skill binding was deleted; two independent reads confirmed it clean) · changes/premise-ledger: recurred (T10) — a scope bullet naming three rows and a headline to update was never delivered and passed three Reviewer verdicts; found at validation. The dropped obligation sat in a task's Scope, not in an FR)** **recurred (changes/scoped-constitution-reads: three Reviewer FAILs on content held in a sentence or a table row; a fourth case, a clause of FR-3's state table, passed three Reviewers and a literal walk because the design's own cell had dropped it, was recorded twice as an ADVISORY, and was found at validation — specify-time root cause: KZ-changes--scoped-constitution-reads-1)** | changes/gate-falsifiability · changes/leader-brief-contract · changes/agents-md-canonical · changes/premise-ledger · changes/scoped-constitution-reads | **High** | Methodology | `.claude/templates/reviewer.md` Audit Checklist (Requirement Conformance) | **Applied** |
| KZ-changes--kaizen-loop-closure-2 | Before spawning the Reviewer on a rules-document edit, grep the file for the superseded phrasing and its paraphrases — a surviving in-file restatement is brief non-conformance, not a Reviewer round — **and key the sweep on the obligation, not on the identifier being removed** — **recurred (changes/agents-md-canonical: the paraphrase clause did not cover an obligation stated in a collective noun that never names the superseded identifier — `:1128`, "written to both root guides" — costing a second rework round)** **recurred (changes/scoped-constitution-reads: the Leader's own correction-closure sweep searched the exact cell wording and missed two abridged, lower-case sites in `closure.md`, costing a review round)** **recurred twice (changes/persona-upgrade: T7 found the Step 0 "Do not overwrite them" bullet in its sweep and kept it as "compatible" — a review round; T9 found `README.md`'s "preserves … non-destructively" cell and left it on a scope reading — a continuation. The sweep now finds the hit; the failure moved to judging it)** | changes/kaizen-loop-closure · changes/agents-md-canonical · changes/scoped-constitution-reads · changes/persona-upgrade | **High** | Methodology | `.claude/templates/leader.md` item 4 (pre-review restatement sweep) | **Applied** |
| KZ-004 | A presence-grep cannot see a fall-through branch — when an edit gives a command a new artifact type or folder role, enumerate the scan's existing terminal branches and state which one the new role lands in | changes/spec-family-ordering | Medium | Methodology | proposed: `.claude/templates/reviewer.md` (append 1–2 lines) | Deferred |
| KZ-005 | Never point at a rule by line number inside command prose — the pointer goes stale in the same diff that adds it; name the rule instead | changes/spec-family-ordering | Low | Methodology | proposed: `.claude/templates/implementer.md` (append 1 line) | Deferred |
| KZ-002 | Before writing an aggregate claim about a set of artifacts ("each file has X"), run the grep that would falsify it — summary surfaces (CHANGELOG, docs pages) inherit the artifacts' evidence bar — **recurred (changes/opus-5-5-rebaseline: a CHANGELOG entry described a doc state that never shipped and restated persona stop lists from memory, costing a rework round)** **recurred (changes/scoped-constitution-reads: a CHANGELOG sentence claimed silence on a topic while stating it; `closure.md` recorded an outcome the shipped text did not give and quoted design text as shipped; the Leader's execution summary stated three wrong totals)** **recurred (changes/subagent-context-budget: seven of eight FAIL findings on the CHANGELOG task were clauses that overstated or misquoted the shipped text — an exit condition, a file location, "kept whole", a rounded percentage, "per attempt" for a per-spawn line — each caught by quote-checking the clause at HEAD, none by a grep)** **recurred (changes/persona-upgrade T10: the closure recorded `EXIT: 0` for a command that exits 1 and said no missing item named a spec resource — both false at HEAD; three CHANGELOG clauses overstated the shipped text; FR-10 was misquoted and misattributed. Caught by the Leader re-run and by quote-checking each clause — recurrence 5)** | changes/ai-agent-development-skill · changes/opus-5-5-rebaseline · changes/scoped-constitution-reads · changes/subagent-context-budget · changes/persona-upgrade | **High** | Methodology | proposed: `.claude/templates/implementer.md` (append) | Deferred |
| KZ-changes--leader-brief-contract-2 | A `Falsifier`, verification count or expected outcome that states a present-tense reading is run or walked before it is written — three unexecuted readings cost two `tasks.md` amendments and pulled a closure walk to a false PASS — **recurred (changes/review-intensity-routing: three Leader-added brief checks (T2, T7, T8) asserted thresholds never run at baseline, which existing text already violated; the Implementer flagged each, so none cost an attempt)** **recurred (changes/persona-upgrade T1d: the task Disqualifier said `delegation` "must hold all seven `###` subsections"; the template has six at baseline and at HEAD — the count was never run; the brief carried the measured count and both workers re-counted, so no attempt was lost)** | changes/leader-brief-contract · changes/review-intensity-routing · changes/persona-upgrade | Medium | Methodology | `/akili-specify` Step 3.2 Falsifiability rule 1 | **Applied** |
| KZ-changes--scoped-constitution-reads-1 | A design table that restates a requirement's table keeps every cell's obligations — the design's S3 cell shortened "report that the brief named none" to "note it"; every Reviewer compared shipped text with the design, so the dropped clause passed three verdicts and a walk, and reopened a task after validation | changes/scoped-constitution-reads | Medium | Methodology | `/akili-specify` Step 2.2 *Guidelines* (after *A named mechanism is checked against the moment it must act*) | **Applied** |
| KZ-changes--persona-upgrade-1 | A rule that lives in a persona does not reach a worker whose deployed persona predates it, and the brief cannot substitute: 7 of 26 Implementer spawns ran past the 60-call checkpoint bound with every self-count lower than the host's — run `akili doctor --agents` before the first spawn and treat `outdated`/`unmarked`/`missing` as a stop | changes/persona-upgrade | Medium | Methodology | `/akili-execute` Step 0 prerequisites (after "If `.agents/` is missing…") | **Applied** |
| KZ-changes--persona-upgrade-2 | A red that is a throw is not a red — the rule already stood in `tdd` in words, and 4 of 4 code tasks still reported `TypeError`/`ENOENT`/stubbed throws as red (one round or continuation each); the red becomes a quoted artifact: each cited red is the assertion's own expected/actual output, by test name, and a failure before the assertion is written "not red" | changes/persona-upgrade | Medium | Methodology | `tdd` skill — AKILI-SPECS Integration, *Verification evidence* row | **Applied** |
| KZ-changes--persona-upgrade-3 | A spec tension — two approved clauses the code cannot both satisfy — is the lightest Pivot evidence and is settled at the next gate as a one-line amendment, never carried to closure: three carried tensions passed every Reviewer and became validation FAILs | changes/persona-upgrade | Medium | Methodology | `/akili-execute` Loop Rules, *Pivot Detection* | **Applied** |

## Entries

> **Frozen.** The entries below are historical. New retrospectives write one file per spec
> under `docs/specs/kaizen/`. Nothing here is rewritten, renumbered, or deleted.

### 2026-08-13 — changes/audit-phase-tier-drift

**Metrics**

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 4 (all PASS) | tasks.md |
| Reviewer FAIL rework rounds | 4 (T2 x1, T3 x2, T4 x1) | execution.md |
| Pivots | **1** (T3 — FR-5 named a path existing in no consuming project) | execution.md — ## Pivot Record: T3 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Judgment-day severe findings | 4 confirmed, all resolved; 7 suspect recorded as info | judgment.md |
| Validation FAIL / WARN | n/a (validation-report absence accepted; closure sweep substituted) | archive-summary.md §5 |
| Budget | ~89 prose-lines vs ~60 ceiling — **escalated at the T4 gate and accepted** | execution.md — T4 issue 3 |
| Agent delivery failures | 6 idle-without-report; poke-once recovered 5, 1 required replacement | execution.md, judgment.md |

**Lessons**

- **KZ-006 — Five findings in one spec were the same defect: a claim verified by a method structurally incapable of falsifying it.** (Methodology, **High**)
  - Root cause (5W1H): the verification was chosen from the same frame as the claim, so no input could produce a failure. Instances: a path claim evidenced only in the repo where the path exists by construction (Judgment Day C4); a byte-comparison that unescaped both sides before comparing (T2); an authority cited for a fact it does not contain — Step 8B has zero `--local` mentions (T3); a prose-density budget reported in git lines, the one unit under which it cannot fail (T4); a record compared against one of the two values it stores (T4). **`/akili-specify` Step 3.2 already mandates a disqualifier**, and it fired on none of these — because a disqualifier asks *when a produced reading is worthless*, a different question from *whether any input could make this check fail*. Every instance was caught only by a Reviewer that re-derived the claim from source (`bin/akili.js`, `commonmark.js`, raw bytes, the estimator's own arithmetic); never by a grep, never by the author. Generalizes KZ-004 (4th recurrence of its fall-through form) and KZ-002.
  - Evidence: judgment.md C4; execution.md — T2 attempt 1 FAIL, T3 attempts 1–2, T4 attempt 1 issues 1 and 3.
  - Standardization: append 2 lines to `/akili-specify` Step 3.2's verification rules — next to each verification, name the input that would make it fail; a check no input can fail is not evidence, however green it reports. → **Applied 2026-08-13 (user-approved: "apply all")**

- **KZ-007 — A forward pointer recorded against a future task was not carried into that task's brief by the person who recorded it.** (Methodology, Medium)
  - Root cause (5W1H): the T2 Reviewer raised the local-tier staleness branch; the Leader recorded it in `execution.md` as owned by T4; when composing T4's nine walkthrough branches the Leader wrote the *packaged*-tier case — already covered — and the real branch never reached the brief. The Implementer walked nine branches faithfully; none was the one that mattered. Recording created the appearance of ownership without the mechanism of transfer, and the same agent that filed the note composed the later step without re-reading it.
  - Evidence: execution.md — T2 forward pointer vs T4 walkthrough branch 7; T4 attempt 1 issue 1.
  - Standardization: append 1 line to `/akili-execute` Step 2.2's brief list — include any forward pointers recorded in `execution.md` against this task, copied. → **Applied 2026-08-13 (user-approved: "apply all")**

- **KZ-003 — Reformulated on its 6th recurrence: the standardization this lesson proposed does not prevent the defect it names.** (Methodology, Medium → **High**)
  - Root cause (5W1H): the lesson proposed adding a brief line declaring the report the turn's terminating action. That line was applied to **6** spawns this session (judges, reviewers) and **failed twice** — `judge-d` and `rev-t3b` both carried it and went idle without delivering. What did work, consistently, was the Leader's **poke-once** protocol: 5 of 6 recovered on one poke; the 6th (`judge-a`) stayed idle through a poke and had to be replaced. A standardization that does not prevent what it claims to prevent is worse than none — it closes the lesson falsely and teaches the next Leader to stop watching for idle workers.
  - Evidence: judgment.md protocol deviations; execution.md — T3 `rev-t3b` poke; this session's six spawn-delivery failures.
  - Standardization (revised): name **replace-on-second-idle** as the escalation after poke-once in `.claude/templates/leader.md`, and drop the brief-line proposal as unsupported. → **Applied 2026-08-13 (user-approved: "apply all")**

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
