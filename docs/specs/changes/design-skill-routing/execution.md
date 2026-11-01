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
| Continue gate | **Not auto-passed** — stopped for Escalation E-1 (scope) |

## Escalation E-1 (2026-11-01): missed consumer — packaged skill-file count

- **What:** adding any file under `.claude/skills/` turns `test/install-cursor.test.js` red (`SKILL_FILE_EXPECTED = 247 + 58 + 3` → now 309; `SHARED_ROOT_FILE_COUNT` comment 322 → 323). The test's own message: "if the packaged skill set changed, this count (and the shared-root fixtures below) must be updated". Precedent: `changes/impeccable-hardening` T8 updated the same counts (`2823ea0`).
- **Why it stops:** fixing it edits a test file no approved task lists — a scope increase under JC's brief ("DETENTE … ante … aumento de alcance").
- **Proposed one-line amendment:** add to T2's Scope "`test/install-cursor.test.js`: packaged skill-file count 308 → 309 (one new reference file), and any shared-root fixture the count drives", plus a Premise Ledger `consumer` row for it. No requirement changes.
