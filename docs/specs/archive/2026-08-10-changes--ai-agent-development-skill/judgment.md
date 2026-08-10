# Judgment Day Ledger — `changes/ai-agent-development-skill`

| Field | Value |
|---|---|
| Target | `design.md` (context: `requirements.md`, `proposal.md`; criteria: `docs/skills/governance.md`) |
| Mode | judgment_day (blind dual review) |
| Round | 1 |
| Judges | A: `general-purpose`/opus (JA-1..13) · B: `general-purpose`/opus (JB-1..14) — authored on Fable (author ≠ auditor) |
| Date | 2026-08-09 |
| State | round-1 fixes applied — **fix-only** (user declined re-judgment); terminal state: approved-with-fixes by user decision |
| Fixed | CS-1, CS-2, CW-1…CW-6, S-1, S-2, S-3, JA-10…13, JB-11, JB-13, JB-14 — applied to `design.md` (rewrite) and `requirements.md` (FR-6 mirror surface); correction closure sweep ran forward+backward, superseded values remain only in this frozen ledger and in `proposal.md` (historical intent; supersession recorded in design DD-3/§8) |

## Confirmed SEVERE (both judges — eligible for fix actor)

| Ledger ID | Judge IDs | Finding |
|---|---|---|
| CS-1 | JA-1 + JB-2 | `metadata.version: 0.1` violates the governance frontmatter schema (`version: "<preserved or 1.0>"`); no schema amendment is planned, so the skill ships a guaranteed FR-1 gate failure. Fix: `version: "1.0"` + DD-5 maturity note in the body, or amend governance schema in the same change. |
| CS-2 | JB-1 (SEVERE) + JA-3 (WARNING — same defect, lower grade) | `docs/commands/akili-constitution.md:82` carries a **closed** enumeration of the packaged stack skills and is missing from the design's edited-surface set — executing the design as written ships a stale docs mirror (FR-6's own "inventory drift" defect class). Both judges independently found it; graded severe by escalation-conservative reading. |

## Corroborated WARNINGS (both judges — remain `info` per protocol; factual, cheap to fold into the same Adjust round)

| Ledger ID | Judge IDs | Finding |
|---|---|---|
| CW-1 | JA-2 + JB-3 | Surface-count chaos: design §2 says "four documentation surfaces", design's own tables total five, requirements FR-6 enumerates five but twice says "six". With CS-2's mirror the true count is six — reconcile everywhere (correction closure sweep). |
| CW-2 | JA-5 + JB-4 | Design §3 says "two candidate-pool mentions" then enumerates three; FR-5 mandates three. Also "per the three governance carve-outs" overclaims — only carve-outs (1) and (2) are exercised. |
| CW-3 | JA-4 + JB-5 | Budget arithmetic: §4 table caps new content at ≤750 lines; §10 claims ~800–900. Internally contradictory. |
| CW-4 | JA-7 + JB-6 | NFR-2 (every framework claim pinned to official docs — the substituted gate for the dominant defect class) has no owning design element; pinned links mentioned only for one of four references. |
| CW-5 | JA-6 + JB-7 | FR-3 silently narrowed: **memory** and **HITL points** dropped from the design-side mapping; **verification commands** dropped from the tasks-side. FR-3 is a MUST. |
| CW-6 | JA-9 + JB-10 | FR-6's checkable obligations collapsed: the **minor** release classification and the `docs/skills/README.md` row's real column set (Binding/Origin/Use For/Wired In) appear nowhere in design.md. |

## Suspects (one judge — recorded, not auto-fixed)

| Ledger ID | Judge ID | Finding |
|---|---|---|
| S-1 | JB-8 | `aws-deployment.md` ("AgentCore Harness vs Lambda vs ECS") overlaps content owned by packaged `aws-serverless` and environment `amazon-bedrock`; deferral table has no `aws-serverless` row — vendoring-drift risk. |
| S-2 | JB-9 | Trigger contract "must NOT fire for plain LLM API calls" is unenforceable; `claude-api`'s own trigger claims agent-shaped tasks — a precedence/composition rule is needed, not a prohibition. |
| S-3 | JA-8 | DD-3 mischaracterizes its rejected alternative (proposal was also a 4-file split; the real change is a rename/rescope + deferral-table promotion). |

## Suggestions (info)

JA-10 (description must be "trigger keywords + what it does", uniform `Trigger:` opening) · JA-11 (doc page ~60 lines vs 21–41 precedent) · JA-12 (DD-3 "most-consulted" is an empirical claim with no possible data; §6 availability qualifier asymmetric) · JA-13 (≤150 cap stricter than the cited gsap precedent at 183 lines — state it) · JB-11 (DD-4 should state the load-time/task-time reconciliation for `akili-spec-mapping.md`) · JB-13 (DD-5 inline-flag has no marker convention) · JB-14 (§5 omits FR-1's negative constraint — the likely authoring path is copy-paste from an adapted sibling).

## Verdicts

- Judge A: `FAIL — 1 SEVERE`
- Judge B: `FAIL — 2 SEVERE`
- Contradictions requiring escalation: none (CS-2 severity grade differs; substance agrees).
