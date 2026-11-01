# Execution — design-skill-routing

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/design-skill-routing` |
| Started | 2026-11-01 (UTC-5), branch `JuankCadavid/design-skill-routing`, base `c22f160` |
| Owner brief | JC, 2026-11-01 10:04 UTC-5, via Grok Bot (relayed): "termina specify (tasks.md) y sigue con /akili-execute, /akili-test, /akili-validate y /akili-archive, tomando tus opciones recomendadas solo en gates rutinarios. Presupuesto ~650 LOC. DETENTE y repórtame ante cualquier HALT, Pivot, tripwire de presupuesto, FATAL_FAIL, escalada, ítem HITL, aumento de alcance o enmienda de requisitos; no registres aprobaciones de JC que él no haya dado. Prohibido: push, PR, merge, tag, publish, borrar ramas, escrituras en AWS o GitHub." |
| Approval Mode | `pre-approved (JC, 2026-11-01 10:04 UTC-5, via Grok Bot)` — routine continue gates auto-pass and are logged `auto-approved (pre-approved mode)`; the exceptions above stop |
| Leader | `opus` (Opus 5.5), T1 |
| Workers | No Step 8E wrappers (`.claude/agents/` absent). Fallback sub-prompt workers read their persona from `.agents/`. Implementer: `sonnet` (T2). Reviewer: `opus` in a fresh context (a different model from the Implementer) |
| Personas | `.agents/` is gitignored (`.gitignore:9`) and was absent from this worktree; copied from `/Users/jcadavid/Development/sdd-jc-methodology/.agents`, then `node bin/akili.js doctor --agents --fix --allow-branch` on the local copy: leader `primary-instructions`, `test-harness`, reviewer `audit-checklist`, tester `prove-behavior` FIXED. Leader `delegation` CUSTOM-EDITED and implementer `shared-file-discipline` UNLOCATED left as the maintainer's call (same state as `changes/impeccable-hardening`) |
| Baseline | `npm test` → 1385 pass, 0 fail (at `ac1d0db`; spec-only commits since) |
| Budget (design §12) | 11 tasks · ~650 authored LOC · ~22 review rounds |
| Environment pre-check (Step 2.1) | No running stack needed (methodology text and `node:test` suites) |

## Task Execution History

### T1: Write the Design Routing Matrix — PASS (attempt 1)

| Field | Value |
|---|---|
| Date | 2026-11-01 |
| Attempts | 1 (Implementer `sonnet`, effort high; Reviewer `opus`, fresh context) |
| Files changed | `.claude/skills/impeccable-bridge/references/design-routing.md` (new, 119 lines) |
| Skills (Leader-selected) | `impeccable-bridge`, `cognitive-doc-design` (as the task lists) |
| Implementer verification | 9 card-evidence heading greps all hit (`impeccable/SKILL.md` `## Commands`, `## Modes`; bridge `## Roles`; `ui-ux-pro-max` `## AKILI-SPECS Integration`; `frontend-design` `## 8. Integration With Other Skills`; `stitch-design` `## Core Responsibilities`; `gsap-animation` `### Prefer GSAP over CSS animations when you need`; `tailwind-design-system` `## When to Use This Skill`; `shadcn-ui` `## When to Use`; `docs/skills/governance.md` `### Current assignment`); line-pointer grep → none; `grep -c '^\| \*\*'` → 8; vendored diff empty; `npm test` → 1383 pass, 2 fail |
| Reds | (1) `impeccable-bridge.test.js` bridge `.md` file list — owned by T2 (predicted). (2) **Not predicted:** `install-cursor.test.js` (cursor-install-target FR-2/FR-4): "expected 308 (247 + 58 upstream + 3 LICENSE/NOTICE/UPSTREAM.md) packaged skill files under .claude/skills; counted 309 instead". A consumer the design missed (design §4 / Premise Ledger P-11 list `install-cursor.test.js` only by name, not this count; the Step 2.2 consumer rule for adding a member of an enumerated set keys on the count). **Escalated to JC** — see *Escalation E-1* below |
| Evidence re-run | VERIFIED (Leader inline): `wc -l` 119; line-pointer grep empty; bold-row count 8; `npm test` 1383/2 — same as reported |
| Reviewer | `STATUS: PASS` — all FR-1–FR-9 / NFR clauses checked at the source; 9 card headings re-run; declared deviations (ENV-1 build-within-system names `new-work` "use build-new"; "same" cells written out; ENV-0 motion gsap note on the supporting line) accepted under FR-1 / W-1 |
| ADVISORY (recorded only) | Readability: "direction picker" is the spec's term, not Impeccable's (upstream: `new-work` decision page / direction round). Reliability: `new-work` is a reference, not a *Commands* row (`craft` is its deprecated alias), while §5.1 calls playbooks "commands". Reliability: step 5 does not repeat FR-6's explicit ban on the degraded inline pass. Risk: low |
| Requirements covered | FR-1 – FR-9 content (matrix side), NFR-1, NFR-4, NFR-5, NFR-7 |
| Decisions | Implementer deviations accepted (above) |
| spawns | Implementer 27 calls, 108,715 tokens, ended complete; Reviewer not reported by host |
| Running totals | tasks 1/11 · LOC 119/~650 · review rounds 1/~22 |
| Continue gate | **Not auto-passed** — stopped for Escalation E-1 (scope); resumed on JC's decision (E-1 below) |

## Escalation E-1 (2026-11-01): missed consumer — packaged skill-file count

- **What:** adding any file under `.claude/skills/` turns `test/install-cursor.test.js` red (`SKILL_FILE_EXPECTED = 247 + 58 + 3` → now 309; `SHARED_ROOT_FILE_COUNT` comment 322 → 323). The test's own message: "if the packaged skill set changed, this count (and the shared-root fixtures below) must be updated". Precedent: `changes/impeccable-hardening` T8 updated the same counts (`2823ea0`).
- **Why it stops:** fixing it edits a test file no approved task lists — a scope increase under JC's brief ("DETENTE … ante … aumento de alcance").
- **Proposed one-line amendment:** add to T2's Scope "`test/install-cursor.test.js`: packaged skill-file count 308 → 309 (one new reference file), and any shared-root fixture the count drives", plus a Premise Ledger `consumer` row for it. No requirement changes.
- **Decision:** approved — JC, 2026-11-01 10:41 AM UTC-5, vía Grok Bot: "Sí, aprueba la corrección del conteo a 309 y que siga hasta el archive". Applied: T2 Scope amended in `tasks.md`; Premise Ledger row P-19 added in `design.md` §11 (execute-time spec edit; carried as a named conformance check in the T2 and T3 Reviewer briefs).

### Wave 1 (parallel, disjoint files): T2, T6, T7 — 2026-11-01

Evidence re-run for all three (Leader inline, after every Implementer finished; tree quiet): `npm test` → **1385 pass, 0 fail**; `git diff --check` clean; `git diff --stat -- .claude/skills/impeccable` empty; superseded greps 0; `design-routing` in bridge 3, in each adapted skill 1 — **VERIFIED**.

### T2: Point the bridge at the matrix (+ pinned assertions, + E-1 count) — PASS (attempt 1)

| Field | Value |
|---|---|
| Files changed | `.claude/skills/impeccable-bridge/SKILL.md` (+7/−4), `test/impeccable-bridge.test.js` (2 assertions), `test/install-cursor.test.js` (count 308 → 309, message/comments, 322 → 323) |
| Skills | `impeccable-bridge` |
| Red run (Implementer, before edits) | `impeccable-bridge.test.js` 9/1 at the file-list `deepStrictEqual` (extra `references/design-routing.md`; the version assertion follows it in the same test and was not reached); `install-cursor.test.js` 11/1 "expected 308 … counted 309 … 309 !== 308" |
| Verification | superseded greps 0; `design-routing` 3; the two suites 22/22; `npm test` 1385/0; no fixture holds 308/322 |
| Reviewer (`opus`) | `STATUS: PASS` — Roles / Who does what / Phase map / frontmatter as scoped, no matrix row restated; exactly two `impeccable-bridge.test.js` assertions changed; E-1 count per P-19; Reviewer re-ran the two suites 22/0. Named conformance check P-19 / T2 amendment: conforms |
| ADVISORY (recorded only) | FR-9 says stack skills reach agents "only through the project `## Skill Map` and task skill lists"; the bridge line omits "only" and "task skill lists" (not a violation). Risk: *Held once* is guarded only by review until T9 |
| Requirements covered | FR-1 *Held once*, FR-4 (execute row), FR-13 (bridge hits), NFR-1; E-1 |
| spawns | Implementer 8 calls, 79,289 tokens, ended complete; Reviewer not reported by host |

### T6: Persona skill examples — PASS (attempt 1)

| Field | Value |
|---|---|
| Files changed | `.claude/templates/leader.md` (1 line, *primary-instructions*), `.claude/templates/tester.md` (1 line, *context-alignment*) |
| Red run | ``grep -cF 'UI → `ui-ux-pro-max`' .claude/templates/leader.md`` → 1 before, 0 after |
| Verification | diff −2/+2, no `akili:section` change; `persona-digests` + `agents-doctor` 66/0; `npm test` 1385/0 (an earlier run during sibling edits showed 3 reds attributed to in-flight T2/T7 files; Leader quiet-tree re-run 1385/0) |
| Reviewer (`opus`) | `STATUS: PASS` — only the two example lines; wording consistent with the matrix *Motion* and *evaluate* rows; `grep -nE 'ui-ux-pro-max\|gsap-animation\|frontend-design' .claude/templates/*.md` → none |
| ADVISORY (recorded only) | Nested parenthesis in the Leader line (cosmetic); `digests.json` refresh is a release-step item |
| Requirements covered | NFR-6 (rev. 2), FR-7, FR-13 (persona hits) |
| spawns | Implementer 7 calls, 60,602 tokens, ended complete; Reviewer 5 calls, 66,220 tokens |

### T7: Adapted skills point at the matrix — PASS (attempt 1)

| Field | Value |
|---|---|
| Files changed | `ui-ux-pro-max/SKILL.md`, `gsap-animation/SKILL.md`, `frontend-design/SKILL.md` — AKILI sections only (+4/−4) |
| Red run / falsifier | `design-routing` grep 0 each before, 1 each after; falsifier executed: removing `impeccable-bridge` from `frontend-design` → `impeccable-bridge.test.js` "FR-12/FR-13" red; restored → 0 fail |
| Not Done / Assumptions (verbatim) | "The falsifier turned red on test 8, not on a test named after `frontend-design`. The `frontend-design` assertion appears to live inside that test." / "The ENV-0 wording uses the term as the brief gave it. I did not re-check its definition in the matrix's *Environment classification* section." — assumptions only, no owed item (not a continuation); the Reviewer checked ENV-0 against the matrix: matches |
| Reviewer (`opus`) | `STATUS: PASS` — FR-14 pointers, ENV-0 consistent, GSAP criterion consistent with §8.5, upstream "recommend GSAP as the default" tension resolved for AKILI agents by the AKILI section |
| Requirements covered | FR-14, FR-7, FR-3 |
| spawns | Implementer 10 calls, 75,649 tokens, ended partial (assumptions only); Reviewer 5 calls, 69,290 tokens |

Running totals (after wave 1): tasks 4/11 · LOC ~141/~650 (119 + 22 insertions) · review rounds 4/~22. Continue gate: auto-approved (pre-approved mode).
