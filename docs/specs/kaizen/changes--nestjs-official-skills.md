# Kaizen Entry — changes/nestjs-official-skills

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/nestjs-official-skills` |
| Date | 2026-11-24 |
| Branch | changes/nestjs-official-skills |
| Archive Run | 1 |
| Approval Mode | gated (T6–T11 run continuously with JC's approval) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 11 | tasks.md |
| Reviewer FAIL rework attempts | 7 (T2, T3, T5, T6, T8, T9, T10, one each; all PASS on attempt 2) | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 | execution.md |
| Budget | ≈2,011 / ~2,050 LOC; 18 / 18 review rounds (margin fully spent) | execution.md, design.md §10.2 |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | C-1 (FR-8 persona bullet amended, DD-12) | judgment.md, requirements.md Document Control |
| Validation FAIL / WARN | 0 / 3 | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 (no task carried `REVIEW_SKIPPED`) | test-report.md / validation-report.md |
| Execute-time factual corrections (no gate) | 4 | execution.md (T8, T9, T10, T11) |

## Lessons

- **KZ-changes--nestjs-official-skills-1 — An execute-time factual correction that changes shipped text away from `design.md` left the design stale until validation.** (Methodology, Low)
  - Root cause: `/akili-execute` lets the Leader apply a single-answer factual correction without a gate and log it in `execution.md`, but no step makes it correct the spec document the shipped text now contradicts. Correction Closure is defined for `/akili-specify` and `/akili-validate` only. T4 shipped `RETIRED … -> replace with <replacement>` and the label `nestjs-feature plus the official set (…)`; design §5/§6 kept `— replaced by` and `the official NestJS skills (…)` through T9 (which logged the wording difference) and T10–T11.
  - Evidence: execution.md — T9 *Factual correction (no gate, logged; from Reviewer advisory 1)*; validation-report.md §8, rows *Design §6 `RETIRED` line* and *Design §5 `RETIRED_SKILLS` replacement label* (WARN, corrected at validate).
  - Standardization: → P1

## Recurrences

- **KZ-changes--gate-falsifiability-2** (FR content dropped in shipping): two FR-8 obligations were dropped at implement. T8 left out bullet 1's "fusing them would break the verbatim rule" reason, and T6 left out bullet 3's "name the official set" at `/akili-constitution` Step 5, writing `nestjs-feature` alone. This time the Reviewer caught both, but they cost two of the seven rework rounds and the run ended at 18/18. → P2
- **KZ-002** (claims written from intention): the spec's T11 Scope and design §7.3 gave one hand-delete path (`~/.agents/skills/nestjs-expert/`) for Codex, Cursor and Grok Bot without resolving Grok Bot's skills root (`bin/akili.js:245`, the workflows root). The CHANGELOG migration note would have inherited it; it was corrected at T11. → P3
- **KZ-changes--archify-diagrams-2** (how to key a consumer search): P-10 keyed on counts and the member name. It missed `test/modern-web-guidance.test.js:444`, which pins the *prose* of the governance line being edited ("Current member: `impeccable`"), and the T10 count consumers (`install-akili-panel`, `akili-marketing-docs`, `diagram-design`, `docs/cli.md`) broke at 38 → 37. → P4

## Noted, not a lesson

- In 4 of 7 FAILs, a rule that applied to a whole set was applied to a single instance: the official set vs `nestjs-feature` (T6); the whole-file vs line-level allowlist (T10); a hard-coded `AGENTS.md` vs `<file>` (T9); the Passport BUT half left untested (T5). This overlaps KZ-changes--gate-falsifiability-2 and is not a separate root cause yet.
- One Implementer spawn (T9) skipped reading its persona, and one (T5) opened an accidental `git checkout -p`; nothing was lost. Single occurrences.
- The review-round estimate was 18 with a +2 margin, and 7 tasks needed two rounds against the 5 the budget assumed. Rules-text tasks run about one round over the estimate; watch for recurrence before re-sizing.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-execute.md` — the factual-correction (no gate) rule, append 1 line (+ `docs/commands/akili-execute.md` mirror if it restates the rule) |
| Edit | A factual correction that makes shipped text differ from `requirements.md` or `design.md` also corrects that spec document in the same task commit, with the Correction Closure sweep (`/akili-specify` → *Correction Closure*) — logging it in `execution.md` alone leaves the spec stating the superseded value. |
| Severity | Low |
| Status | applied (2026-11-24) — `.claude/commands/akili-execute.md` Execution Log Format, *decisions made* bullet; `docs/commands/akili-execute.md` does not restate the rule, so it needs no mirror |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--gate-falsifiability-2 |
| Edit | Add source `changes/nestjs-official-skills`. Recurrence note: "**recurred (changes/nestjs-official-skills: FR-8 bullet 1's reason and bullet 3's 'official set' at Step 5 were dropped at implement; caught by the Reviewer this time, at a cost of 2 of 7 rework rounds, and the run closed at 18/18 review rounds)**". Severity stays Medium. |
| Severity | Medium |
| Status | applied (2026-11-24) — digest row updated; severity stays **High**, the row's existing value (the highest wins), not Medium as proposed |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add source `changes/nestjs-official-skills`. Recurrence note: "**recurred (changes/nestjs-official-skills: the spec gave one hand-delete path for three tools without resolving Grok Bot's skills root; the CHANGELOG migration note would have inherited it, corrected at T11)**". |
| Severity | Low |
| Status | applied (2026-11-24) — digest row updated; the row keeps its `Deferred` status |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--archify-diagrams-2 |
| Edit | Add source `changes/nestjs-official-skills`. Recurrence note: "**recurred (changes/nestjs-official-skills: P-10 keyed on counts and the member name and missed a test pinning the prose of the edited governance line, plus four count consumers of the 38 → 37 change). Key the search also on the sentence being edited, not only on members and counts**". |
| Severity | Low |
| Status | applied (2026-11-24) — the lesson was not in the digest, so a row was added; to keep the 10-row cap, `KZ-changes--kaizen-loop-closure-2` was retired: it is the Applied row institutionalized longest (2026-09-18) with no pending item linked, and its lesson stays in `changes--kaizen-loop-closure.md` |

### P5

| Field | Value |
|---|---|
| Kind | guide-sync |
| Target | `AGENTS.md` → `## Repository Purpose`, after the `bin/install-compare.js` bullet |
| Edit | `- \`bin/skill-map.js\` is the pure module behind the retired-skill table (\`RETIRED_SKILLS\`, read by the \`install\`/\`update\` cleanup and \`doctor\` STALE loops) and the \`doctor --agents\` Skill Map scan that prints \`RETIRED\`; \`bin/akili.js\` requires it.` |
| Severity | Low |
| Status | applied (2026-11-24) — `AGENTS.md` → *Repository Purpose*, after the `bin/install-compare.js` bullet |
