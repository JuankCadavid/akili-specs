# Test Report: Backend Skill Routing — one owner per backend decision

**Overall: PASS.** 1450 tests, 1450 pass, 0 fail, 0 skipped. 31 of them are this spec's (14 author contract tests + 17 Tester coverage tests); every one was shown red under an executed falsifier. No product bugs. Two accepted gaps (judgment, not text).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/backend-skill-routing` |
| Date | 2026-11-02 |
| Code under test | `3f91969` (branch `JuankCadavid/backend-skill-routing`, local) + `test/backend-skill-routing-coverage.test.js` (new in this phase) |
| Leader | Claude Opus 5.5 |
| Tester | 1 subagent, `opus` — author ≠ tester: every Implementer in `execution.md` ran on `sonnet`, no escalation recorded |
| Persona drift | `.agents/tester.md` `context-alignment` OUTDATED (only delta: example skill name `ui-ux-pro-max` → `impeccable-bridge`); not fixed, no effect on this suite |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 1 — backend unit (text contracts over the shipped rules text; the change has no runtime code, UI or service) |
| Testers | 1 spawned (Standard depth, one substantial suite); none inline |
| Author coverage cited, not rewritten | `test/backend-skill-routing.test.js` (T8, 14 tests) |
| New tests | `test/backend-skill-routing-coverage.test.js` — 17 tests |
| Skills | `tdd`, `systematic-debugging`; effort `high` |
| Leader rework of the suite | 1 round: the first draft (20 tests) pinned three tests to commit `94215ce` permanently (byte-unchanged checks for routed skills, `architecture-styles.md`, `## Design Skills`) and a negative assertion that `architecture-styles.md` never mentions `golang-pro`. Those are this change's scope limits, not permanent invariants: they would turn red on any legitimate future edit (re-vendoring, the recorded Go-layering follow-up) and skip silently under CI's depth-1 checkout. Moved to one-time evidence (§7.2); the suite now has no git dependency |
| Lookup note | `docs/trd/trd.md` and `docs/ux-ui/design.md` absent; slices carried `none` |

**Commands (Leader re-run, 2026-11-02):**

| Command | Result |
|---|---|
| `node --test test/backend-skill-routing.test.js test/backend-skill-routing-coverage.test.js` | 31 pass, 0 fail |
| `npm test` | 1450 tests, 1450 pass, 0 fail, 0 skipped |
| `npm run verify:cli` | "14 commands \| 32 skills \| 8 resources (akili-specs v2.41.0)" |
| `npm run pack:dry-run` | total files: 419 |
| `git diff --check` | clean |

## 3. Backend Unit Tests

### Author suite (T8) — cited

`test/backend-skill-routing.test.js`, 14 tests: held once · skill set · activities · one lead · stack lead closed · card evidence · no line pointers · wiring · governance · legacy task · names only · `tdd` switch · absent file · no install advice. Falsifiers executed at T8 (`execution.md` → T8).

### Tester suite — new

`test/backend-skill-routing-coverage.test.js`, 17 tests, each tagged `@akili-spec changes/go-backend-routing/backend-skill-routing <ID>`, never reading `docs/specs/`.

| # | Test | Asserts | Falsifier red (executed) |
|---|---|---|---|
| 1 | FR-2 decision rule | *Decision rule* is the first section, 8 rules; rule 1 verbatim; rule 2 "one lead", "inputs, not rules" | "rule 2: supports give inputs, not rules" |
| 2 | FR-2 Go + `tdd` | `test-first` led by `tdd`; values/seams from `requirements.md`/`design.md`; coverage target never overrides; `golang-pro` card must not decide coverage | "BUT coverage target never overrides" |
| 3 | FR-2/FR-3 NestJS bug | `bug-diagnosis` led by `systematic-debugging`, "Nest DI graph" support, "No fix before root cause"; rule 3 Bug track | "BUT no fix before root cause" |
| 4 | FR-3 not significant | 4 not-significant rows, each led by *existing design*; "No new style is introduced" | `expected 'existing design' actual '`software-architect`'` |
| 5 | FR-3 stack absent | `other` support `none — project conventions`; no install recommended; specify rule writes the none support | `expected 'none — project conventions' actual '`golang-pro`'` |
| 6 | FR-5/FR-6 expected routes | architecture/significant → `software-architect`; api-contract → `api-design-principles`; implement/Go → `golang-pro` | `expected '`api-design-principles`' actual '`golang-pro`'` |
| 7 | FR-6 route line | format string, four fields, list ⇔ line in matrix and specify rule | "specify: list ⇔ line" |
| 8 | FR-7 item 5 | server-side condition; "no server-side code gets no block"; evidence path; Skill Map or none; pointer; no matrix rows | "no backend → no block" |
| 9 | FR-7 Safe Update | one `**Active AKILI-SPECS (Safe Update):**` bullet; backend bullet after it, without that label, "preserved and only newly detected evidence proposed" | `expected 1 actual 2` |
| 10 | FR-7/NFR-4 siblings | item 4 (design) before item 5 (backend); item 4 keeps its pointer | "item 4 keeps its matrix pointer" |
| 11 | FR-8 docs | `docs/skills/software-architect.md` names `backend-routing.md` + sections; `governance.md` names the backend matrix, held once | "governance names the backend matrix" |
| 12 | FR-9 Go layering | route to `golang-pro` → `references/project-structure.md`; module-design support | "Go layering route" |
| 13 | A-3/A-5 rule 4 | three named sources in order; "the row decides" sentence | "A-5 sentence" |
| 14 | A-6/FR-4 retry | error-model row + card name retry; card cites *When to Use This Skill*, whose body states retry; no "backoff" | "backoff appears nowhere in the matrix" |
| 15 | A-4/NFR-1 spec IDs | no `DD-`/`KZ-`/`FR-`/`NFR-`/`B-J-`/`A-n`/`P-n` in the matrix | "spec IDs in the matrix: KZ-005" |
| 16 | NFR-6 install | real `install --tool all` + `--tool grokbot` into a scratch HOME; matrix byte-identical under every root | "matrix installed under .claude/skills" |
| 17 | NFR-7 schema | *Decision rule* (first), *Matrix*, *Expertise cards*, *Attribution* (last) shared with the design matrix; card headers identical | "backend matrix has ## Attribution" |

Full falsifier log: Tester scratchpad (`falsifier-log.txt`); test 12 re-falsified after the rework.

## 4. Frontend Unit Tests

Not applicable — no frontend code in this change.

## 5. Integration Tests

Not applicable as a separate suite — the only cross-module behavior (the installer shipping the matrix to six targets) is exercised by test 16 above through the real CLI.

## 6. E2E Tests

Not applicable — no user journey; agent behavior is covered by the T9 walkthrough (accepted gap 1).

## 7. Coverage & Traceability

### 7.1 Requirement matrix

| Requirement | Scenario / clause | Test | Result |
|---|---|---|---|
| FR-1 | every skill placed; one lead; stack lead only `implement` / `framework-selection` | author: skill set, one lead, stack lead closed | PASS |
| FR-1 | held once; BUT no restated row, no line pointer | author: held once, no line pointers; Tester 15 | PASS |
| FR-2 | rule; Go + `tdd`; NestJS bug | Tester 1, 2, 3, 13 | PASS |
| FR-3 | not significant (BUT no new style); stack absent (AND no install advice) | Tester 4, 5; author: no install advice | PASS |
| FR-4 | card evidence resolves; BUT no line number, no over-claim | author: card evidence, no line pointers; Tester 14 (retry claim) | PASS (over-claim check automated for the retry claim only; the other cards were quote-checked by Reviewers in T1/A-6) |
| FR-5 | collision; BUT names only; legacy task | Tester 6; author: wiring, names only, legacy task | PASS |
| FR-6 | `Backend route:` line; AND list ⇔ line; BUT no stack load-direction | Tester 6, 7; author: wiring, governance, `tdd` switch, absent file | PASS |
| FR-7 | Django no-skill; no backend; Safe Update; coexists | Tester 8, 9, 10; author: governance, no install advice | PASS |
| FR-8 | `## Backend Skills` same set; docs name the matrix | author: skill set; Tester 11 | PASS; "other pages do not contradict" — see gap 3 |
| FR-9 | *Routing* row; Go layering route | author: wiring; Tester 12 | PASS |
| FR-9 BUT | `architecture-styles.md` unchanged | one-time evidence (§7.2) | PASS |
| NFR-1 | held once | author; Tester 15 | PASS |
| NFR-2 | routed skills untouched | one-time evidence (§7.2) + existing `golang-skill.test.js` hash lock | PASS |
| NFR-3 | governance | author: governance | PASS |
| NFR-4 | design spec untouched | one-time evidence (§7.2); Tester 10 | PASS |
| NFR-5 | names only | author: names only | PASS |
| NFR-6 | ships to all targets | Tester 16 | PASS |
| NFR-7 | same schema | Tester 17 | PASS |
| Amendments A-2..A-6 | GraphQL evidence; three sources; IDs stripped; row decides; retry | author: card evidence (A-2); Tester 13, 14, 15 | PASS |

### 7.2 One-time scope evidence (run 2026-11-02 against `94215ce`, the commit that closed specify)

| Check | Output |
|---|---|
| `git diff --stat 94215ce -- .claude/skills/{impeccable-bridge,impeccable,api-design-principles,error-handling-patterns,tdd,systematic-debugging,nestjs-expert,golang-pro,aws-serverless,ai-agent-development} .claude/skills/software-architect/references/architecture-styles.md` | empty, exit 0 (Tester and Leader) |
| `git diff 94215ce -- .claude/skills/software-architect/SKILL.md \| grep -c '^+[^+]'` | `1` (the *Routing* row) |
| `AGENTS.md` `## Design Skills`, Step 8D item 4, design Safe Update bullet vs `94215ce` | "AGENTS.md ## Design Skills identical: true" · "Step 8D item 4 identical: true" · "Design Safe Update bullet identical: true" |

## 8. Remediation

None — no failures, no product bugs.

## 9. Accepted Gaps

| # | Gap | Why not automated | Substitute evidence |
|---|---|---|---|
| 1 | Agents follow the routing in practice (requirements §8) | Behavioral, model-dependent | T9 held-out walkthrough (`execution.md` → T9): all expected leads matched; ambiguities A, C fixed by A-6, A-5; B, D, E recorded as follow-up proposal candidates |
| 2 | A routing cell is wrong judgment (requirements §8) | Judgment | judgment-day (`judgment.md`); JC approvals at the design gate and amendments A-1..A-6 |
| 3 | FR-8 "every other doc page … SHALL not contradict" the matrix | Contradiction is a reading, not a string | T7 Reviewer read (two rounds, fixed the `ai-agent-development` Purpose sentence); P-13 role-claim grep in T7 |
