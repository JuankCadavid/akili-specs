# Archive Summary — `ai-agent-development` Stack Skill

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/ai-agent-development-skill` |
| Archive Date | 2026-08-10 |
| Final Status | **Complete — validated READY (0 FAIL, 4 WARN accepted/resolved)** |
| Depth / Type | Standard / Change |
| Release Classification | **minor** (new skill = new capability) — `npm run release:minor` pending, user-triggered |

## 2. Outcome

Shipped the `ai-agent-development` stack skill — the decision layer for AI-agent development (framework/runtime selection, agent architecture, AKILI spec mapping; runtime detail deferred outward) — wired into the two command candidate pools and closed across all six inventory surfaces, per governance.

## 3. Requirements Delivered

FR-1…FR-6 and NFR-1…NFR-2, all PASS at clause level — see `validation-report.md` §6. Every factual claim fetch-verified against pinned official docs by the authoring Implementer and independently re-fetched by a different-model Reviewer.

## 4. Files Changed (from `execution.md`)

| Commit | Content |
|---|---|
| `040180c` | T1: `SKILL.md` (68 ln) + spec docs committed |
| `1a09635` | T4: `references/akili-spec-mapping.md` (147 ln) |
| `cdd6491` | T2: `references/framework-selection.md` (102 ln) |
| `583252e` | User-approved design §7 correction (CrewAI durability claim, source-contradicted) |
| `507dd90` | T3: `references/langgraph-patterns.md` (163 ln) |
| `34ebc50` | T5: `references/aws-deployment.md` (65 ln) — PASS attempt 2 |
| `050dcb5` | T6: wiring (3 insertion points) + 6 doc surfaces + CHANGELOG minor — PASS attempt 2 |
| `b717c70` | Validation remediation: `!docs/specs` npm packaging exclusion |

## 5. Test Evidence

No `test-report.md` — **absence accepted by user at validation** (docs-only spec). Executable gates (greps, `test -f`, `wc -l`, `verify:cli`, `pack:dry-run`) ran three times: in-loop, per-task Reviewer re-run, and fresh at validation. The dominant defect class (prose misinformation) is human-gated by design; that gate caught the T5 and T6 FAILs and the T2/design correction.

## 6. Validation

`validation-report.md` (2026-08-10): 0 FAIL, 4 WARN — WARN-1 fixed (`b717c70`), WARN-2 fixed (proposal status flip), WARN-3 accepted (test-report absence), WARN-4 open follow-up (user HITL frontmatter glance).

## 7. Accepted Warnings / Follow-Ups

| Item | Owner | Route |
|---|---|---|
| HITL frontmatter glance vs governance schema (T1 Done criterion) | User | 2-minute check |
| `SKILL.md:60` "AgentCore *Harness*" → "*Runtime*" (advisory, flagged twice) | User | `/akili-quick` candidate |
| Re-pin the 301-redirecting Anthropic URL in `akili-spec-mapping.md`; `langgraph-patterns.md` is the highest-churn file for future revalidation | Next revision | Kaizen note |
| Release `npm run release:minor` + publish + smoke test | User | Repo release flow |

## 8. Historical Notes

- First spec executed in this repo under the full Leader → Implementer → Reviewer triad; personas served from `.claude/templates/` via a session-scaffolded `.agents/` (left untracked).
- Two rework loops, both caught by the independent Reviewer: T5 (Lambda Durable Functions omitted from the file's own pinned sources) and T6 (CHANGELOG/docs over-claim vs shipped artifacts).
- One mid-execution spec correction, user-approved with a two-direction sweep: design §7's CrewAI durability claim was contradicted by the pinned CrewAI Flows docs.
- Budget: 6/6 tasks, ~586 new lines (budget ~600–730), review rounds exceeded budget by 2 (escalated at gates; causes recorded).
- Validation surfaced a repo-level packaging leak (spec docs shipping in the npm tarball) — fixed before archive.
