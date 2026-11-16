# Archive Summary — Guardrails and Evals for AI Agents

**Outcome: PASS, archived.** 13/13 tasks done, 0 FAIL, the one WARN (W-1) fixed and re-validated, 2012/2012 tests green.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/ai-agent-guardrails-evals` |
| Type | Change |
| Deliverable | software (methodology text) |
| AI Agent | no |
| Branch | `feat/ai-agent-guardrails-evals` (cut from `dev` at `c2339a1`) |
| Archive HEAD | `1bf7e7c` |
| Approval Mode | gated |

## 2. Original Spec Path

`docs/specs/changes/ai-agent-guardrails-evals/`

## 3. Archive Date

2026-11-16

## 4. Final Status

| Gate | Result |
|---|---|
| Tasks | 13/13 `[x]`, each on a Reviewer PASS; no `REVIEW_WAIVED` / `REVIEW_SKIPPED` |
| Test report | PASS — 62 new tests, 7 mutation reds, 0 `PRODUCT_BUG` |
| Validation | PASS (re-validated at `1eb4dc8` after the W-1 fix) |
| Budget | ≈ 827 / ≈ 900 LOC · 15 / ≈ 22 review rounds |

## 5. Requirements Delivered

| Req | Delivered |
|---|---|
| FR-1 | `references/guardrails.md`: four layers (input, output, tool permissions, human handoff) plus a voice section |
| FR-2 | `references/evals.md`: offline, online, regression, LLM-as-judge with pinned rubrics, voice metrics |
| FR-3 | Router rows, `version: "1.1"`, mapping pointers in `ai-agent-development` |
| FR-4 | `/akili-specify` **AI Agent Mode**: `AI Agent: yes/no` row on every spec, per-phase gates |
| FR-5 | `/akili-test` agent eval suite (Agent Evals section; exit 0 is not the gate) |
| FR-6 | `/akili-validate` agent eval gate ladder (FAIL / BLOCKED never PASS) |
| FR-7 | Binding `stack` → `conditional` across 9 surfaces, constitution ripple (DD-9) |
| FR-8 | Command docs pages, CHANGELOG, two text-contract test files |
| NFR-1…6 | Non-agent path untouched; sources dated; size caps; vendor-neutral; full verification |

## 6. Files Changed Summary

| Area | Files |
|---|---|
| Skill | `ai-agent-development/SKILL.md`, `references/guardrails.md` (new), `references/evals.md` (new), `references/akili-spec-mapping.md` |
| Commands | `.claude/commands/akili-{specify,test,validate,constitution}.md` |
| Routing / plugin | `software-architect/references/backend-routing.md`, `akili-panel/hooks/flow.mjs`, `AGENTS.md` |
| Docs | `docs/skills/{README,governance,ai-agent-development}.md`, `docs/overview.md`, `docs/commands/akili-{specify,test,validate,constitution}.md`, `CHANGELOG.md` |
| Tests | `test/ai-agent-guardrails-evals.test.js` (new), `test/ai-agent-references.test.js` (new), `test/akili-panel-flow.test.js`, `test/install-cursor.test.js` |

Follow-up quick change landed on the branch: `quick/constitution-docs-agent-line` (`696e98e`).

## 7. Test Evidence Summary

- `npm test` 2012/2012 · `verify:cli` clean · `pack:dry-run` 429 files · `git diff --check` clean.
- Prompt behavior has no automated check; the T13 held-out walkthrough (cases a–d plus falsifier) substitutes.
- 3 partial-automation gaps, each with a recorded manual check (no-statute regex, CHANGELOG quote-check, voice-metrics example).

## 8. Validation Summary

PASS. FR-1 to FR-8 and NFR-1 to NFR-6 each have code and test evidence. W-1 (phase-gate wording unsatisfiable at Phase 1) was fixed in `dbd8e20` with JC's approval and verified at all four sites.

## 9. Accepted Warnings Or Follow-Ups

| ID | Follow-up | Route |
|---|---|---|
| A-1, A-2, A-4, A-11 | Copy-level fixes (`Last verified` list, judge/rubric/prompt list mismatch, stale test comments, §9.3 typo) | `/akili-quick` candidates |
| A-3, A-5, A-6, A-8, A-10 | Naming, matcher guard, docs omissions, routing label, missing `Unvalidated` marker | Advisory, recorded only |
| A-7 | Detection counts any runtime model output shown to a person as an agent | Later `/akili-propose` question |
| A-9 | Premise Ledger P-14 / P-15 still `UNVERIFIED` | **Synced at archive** (`design.md` §11) |
| — | CodeGraph re-index | Recommended |
| — | Push + PR into `dev`, then a minor release | JC |

## 10. Historical Notes

- T4 took 3 attempts: Reviewer FAIL (the intro's condition also covered item 1), then an evidence MISMATCH (a scripted replace hit Video Mode `:70`, out of scope), then PASS.
- T8 took 2 attempts: the Reviewer FAILed a docs-page bullet still naming "the Step 8D Skill Map".
- W-1 came from FR-4's `BUT` clause, which shipped verbatim: one gate sentence covered three phases whose artifacts do not exist at Phase 1.

## 11. Diagrams

None. The spec has no `diagrams/` folder and filled no baseline diagram slot.
