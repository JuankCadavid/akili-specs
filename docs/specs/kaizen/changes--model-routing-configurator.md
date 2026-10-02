# Kaizen Entry — changes/model-routing-configurator

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/model-routing-configurator` |
| Date | 2026-10-02 |
| Branch | master (apply-capable — `Default Branch: master`, no integration pin) |
| Archive Run | 1 |
| Approval Mode | gated (routine gates auto-passed after T1 at the user's instruction) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 13 (8 planned + T9/T10/T11 from FR-11 + T12 from validation + T13 from CI) | tasks.md |
| Reviewer FAIL rework attempts | 2 (T7 ×2 — same write-target phrase) | execution.md — T7 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 4 (T8 ×2 — fixed notes on user ids; unreachable older-binary branch · validation — FR-3 wrapperModel collapse · CI — Windows EOL fixtures) | execution.md — `## Pivot Record` 1–4 |
| PRODUCT_BUGs | n/a — no `/akili-test` run (absence accepted by the user at archive) | — |
| Judgment-day severe findings | 15 confirmed severe + 3 split (Fix only, no re-judgment) | design.md Document Control / judgment.md |
| Validation FAIL / WARN | 1 / 7 → 0 / 6 after T12 and T13 | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 in skipped tasks (none skipped); 3 design-conformant defects escaped every Reviewer and surfaced only live (FR-11 ×2, validation ×1) | execution.md, validation-report.md |
| Review rounds | 16 of 18 budgeted | execution.md §3 |
| Runtime events | 3 (T1 spawn failure → rung 1; T7 Reviewer provider limit → rung 1; T13 Implementer provider limit → rung 4 on `sonnet`) | execution.md |
| Budget | tasks 8 → 13; LOC ~1,550 → ~4,130 (tripwire fired after T3, revised to ~3,400 by the user); rounds 18 → 16 | execution.md — Budget Tripwire, §3 |
| Drift attributable to this spec | none in `docs/specs/drift-report.md` (legacy fallback; no `docs/specs/audits/` report) | drift-report.md |

## Lessons

- **KZ-changes--model-routing-configurator-1 — A negative constraint over a closed set needs an enumeration-wide falsifier.** (Methodology — this repository *is* the methodology, so the local edit is the upstream; High)
  - Root cause: FR-3's "must NOT write a Reviewer wrapper whose model equals the Implementer's — on any host, in any mode" was implemented and reviewed as id-inequality (design §5.3 step 4); on Antigravity the wrapper binds `wrapperModel`, so two flash effort-variants collapsed to `flash`/`flash`. No task falsifier enumerated hosts × placement modes; the packaged default never triggers it. Eleven Reviewers audited the rule as designed; eleven live cases never placed a flash variant on T3; one validator probe did.
  - Evidence: validation-report.md §2/§11 (FR-3 FAIL); execution.md — `## Pivot Record 3: validation`; T12 entry (tests (f)–(j)).
  - Standardization: → P1

Two further root causes recurred rather than being new — recorded as digest-updates with their own standardization edits (P2–P5 below), per the skill's recurrence rule.

## Noted, not a lesson

- **FR-11 found what Reviewers could not (positive):** all three escaped defects were design-conformant; a closing live-validation task with a Reviewer over its *derived record* caught two, a validator placement probe the third. Not a lesson yet — `/akili-specify` already mandates closing validation at Standard depth; watch whether T8-style evidence files become the norm.
- T6's obligation-sweep script was blind to fragments < 25 chars; the task's falsifier caught it before the real walk — a sweep's own filter needs its falsifier run first.
- Pivot Record 2's two-direction sweep listed `design.md:88` as amended when only `:120` was — a sweep row written before the edit it describes.
- P-9 missed three `## Model Routing` sites; the "`docs/commands/*.md` is a mirror" premise was never verified; `--pin-reason`, §5.3 step 2 and §5.6 (a′) contradicted requirement scenarios once data existed — six execute-time clarifications before T4.
- A Leader brief that restates a rule in two forms (T9: "packaged id or placeholder" beside "never a user id") hands the worker a contradiction — state it once, by pointer.
- Host-reported tool calls exceeded every spawn's self-count (T7 attempt 1: 61 vs 41) — feeds KZ-changes--persona-upgrade-1 / KZ-changes--cursor-install-target-2 (the cursor entry's P2, still deferred: its template edit needs the persona fixtures regenerated).
- **Kaizen Apply Mode's re-verify probe is one grep wide; a template edit's blast radius (fixtures that are byte copies of the template) is not in it** — one probe candidate for the skill: when the target is under `.claude/templates/`, also run `npm test` before stamping `applied`.
- `master` carries a ruleset requiring PRs; both pushes bypassed it under the documented direct-to-master flow — a governance question, not a kaizen.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — Step 3.2 Falsifiability block, new item 7 |
| Edit | "**Enumeration-wide falsifier** — a negative constraint phrased over a closed set (\"on any host, in any mode\", \"for every column\") names a falsifier that runs the mutation on *every* member of that set and in every mode the task text names, never only the packaged or default path: in `changes/model-routing-configurator` FR-3's MUST held for the registry id but not the value the wrapper binds, passed eleven Reviewers and eleven live cases, and fell to one validator probe that placed an id on one host." |
| Severity | High |
| Status | applied (2026-10-02) |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | `KZ-changes--kaizen-loop-closure-2` |
| Edit | Add `changes/model-routing-configurator` as a source spec; recurrence — T7: the same write-target phrase survived two attempts at the start of sentences edited at their end. Severity stays High; standardized-in gains the leader template's *Phrase-family sweep* sentence. |
| Severity | High |
| Status | applied (2026-10-02) |

### P3

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/leader.md` — Primary Instructions item 4, *Pre-review restatement sweep* bullet, appended sentence |
| Edit | "**Phrase-family sweep:** when the obligation is \"X is no longer the place or the way\", the brief carries one mechanical grep for the *phrase family* — the identifier, its slash/dash variants, its paraphrases — over **every** file in scope, run by the Implementer before it reports; a list of sites is not a sweep: two tasks in `changes/model-routing-configurator` fixed the sites they were pointed at and left the same phrase at the start of a sentence whose end they had edited (two review rounds)." |
| Severity | High |
| Status | applied (2026-10-02) |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | `KZ-changes--leader-brief-contract-2` |
| Edit | Add `changes/model-routing-configurator` as a source spec; recurrence ×4 in one spec (T2, T5, T8, T13 — predictions never run). Raise Medium → **High** (merged with the cursor entry's P4 on the same ID). |
| Severity | High |
| Status | applied (2026-10-02) |

### P5

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — Step 3.2 Falsifiability block, new item 8 |
| Edit | "**Executed, not predicted** — a falsifier's expected red is observed at baseline and quoted in the task before the tasks gate, never written as a prediction (\"→ goes red\", \"→ times out\"); four predictions in `changes/model-routing-configurator` (T2, T5, T8, T13) were wrong, each caught only because the Implementer executed it and reported the discrepancy." |
| Severity | High |
| Status | applied (2026-10-02) |

**Standardize menu (apply-capable branch, 2026-10-02):** user chose **Apply all**; P1, P3, P5 written, P2/P4 merged into the digest; a new digest row for KZ-changes--model-routing-configurator-1. **Backlog apply (same pass):** the user accepted — `changes--cursor-install-target.md` P1, P3, P4, P5 applied; **P2 reverted and left deferred** (its implementer-template edit turns six `agents-doctor` tests red because `test/fixtures/personas/*` are byte copies of that template — regenerating them is a task, not an archive-time edit). The leader-template edits change its section hashes — the next `scripts/release.js` run writes the new digests; until then `akili doctor --agents` reports those sections as outdated on deployed copies, by design.
