# Validation Report — Guardrails and Evals for AI Agents

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/ai-agent-guardrails-evals` |
| Depth | Standard |
| Deliverable | software |
| AI Agent | `no`. This spec ships methodology text, not a runtime agent, so `/akili-validate` applies no agent eval gate (FR-6 non-agent scenario) |
| Date | 2026-11-16 |
| Branch / HEAD | `feat/ai-agent-guardrails-evals` at `fd14565`, clean tree, nothing new on `origin/dev` |
| Auditor | Opus 5.5 (`claude-opus-5-5`). The Implementer was `sonnet`, so author ≠ auditor. `AGENTS.md` has no `## Model Routing` registry; the `docs/model-routing.md` default T3 → `opus` matches |
| Constitutional baseline | This repo has no `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` or `docs/specs/general-setup/`. Root `CLAUDE.md` → `AGENTS.md` is the baseline |

## 2. Summary

**Verdict: PASS. W-1 (WARN) was fixed in this session with JC approval (see §11); re-validation in a fresh session is pending.**

| Area | Result |
|---|---|
| Tasks | 13/13 `[x]`, each closed on a Reviewer PASS with evidence in `execution.md` |
| Files | Every file in design §4 is present and changed. The only extra file is `test/ai-agent-references.test.js`, added by `/akili-test` |
| Build integrity | `npm test` 2012/2012 · `verify:cli` clean · `pack:dry-run` 429 files, with only the 2 new references added · `git diff --check` clean |
| Requirements | FR-1 to FR-8 and NFR-1 to NFR-6: PASS |
| Design conformance | PASS. DD-1 to DD-12 are implemented as decided |
| Findings | 0 FAIL · 1 WARN (W-1, fixed — see §11) · 10 advisory |

## 3. Task Completion

| Task | Status | Evidence in `execution.md` | Result |
|---|---|---|---|
| T1 guardrails.md | `[x]` | 5 checks, both falsifiers, P-14 sources fetched 2026-11-14 | PASS |
| T2 evals.md | `[x]` | Checks, falsifiers, sources re-fetched by the Reviewer | PASS |
| T3 Router and mapping | `[x]` | `## 4.` byte-identical, 6 router rows | PASS |
| T4 specify AI Agent Mode | `[x]` | 3 attempts (FAIL → MISMATCH → PASS); consumer tests green | PASS |
| T5 test eval suite | `[x]` | Clause walk, sweep, falsifier | PASS |
| T6 validate eval gate | `[x]` | Cell-by-cell ladder compare, falsifier | PASS |
| T7 Binding flip | `[x]` | Reds re-observed; 4 test files green; fixture untouched (P-15 settled) | PASS |
| T8 Docs and governance | `[x]` | 2 attempts; sweep quoted | PASS |
| T9 AGENTS.md and routing labels | `[x]` | Test green, falsifier | PASS |
| T10 Constitution ripple | `[x]` | grep plus P-6 tests | PASS |
| T11 Docs pages and CHANGELOG | `[x]` | Quote-check table | PASS |
| T12 Text-contract tests | `[x]` | 4 mutation reds quoted | PASS |
| T13 Walkthrough and verification | `[x]` | Cases a–d plus falsifier; all 4 commands | PASS |

Budget: about 827 LOC of about 900, and 15 of about 22 review rounds. No waived or skipped review.

## 4. File Existence

| Design §4 entry | Present at HEAD |
|---|---|
| `ai-agent-development/SKILL.md`, `references/{guardrails,evals}.md` (new), `akili-spec-mapping.md` | ✅ |
| `.claude/commands/akili-{specify,test,validate,constitution}.md` | ✅ |
| `akili-panel/hooks/flow.mjs`, `backend-routing.md`, `AGENTS.md` | ✅ |
| `docs/skills/{README,governance,ai-agent-development}.md`, `docs/overview.md`, `docs/commands/akili-{specify,test,validate,constitution}.md` | ✅ |
| `CHANGELOG.md` | ✅ |
| `test/ai-agent-guardrails-evals.test.js` (new), `test/akili-panel-flow.test.js`, `test/install-cursor.test.js` | ✅ |
| `test/fixtures/doctor-codex-baseline.txt` (P-15: must stay unchanged) | ✅ unchanged |

Extra file, not in §4 but expected: `test/ai-agent-references.test.js`, the `/akili-test` suite. `docs/specs/quick/quick-log.md` gained one line from the follow-up `quick/constitution-docs-agent-line`.

## 5. Build Integrity

Run by the auditor on 2026-11-16 at `fd14565`, with no delegated agent active:

| Command | Output |
|---|---|
| `npm test` | `# tests 2012` `# pass 2012` `# fail 0` `# skipped 0` |
| `npm run verify:cli` | `Summary: 14 commands \| 32 skills \| 1 plugin \| 8 resources (akili-specs v2.44.0)` |
| `npm run pack:dry-run` | `total files: 429`; `evals.md` 12.8kB and `guardrails.md` 12.3kB under `ai-agent-development/references/` |
| `git diff --check c2339a1..HEAD` | clean |

There is no runtime stack, so the environment boot smoke does not apply.

## 6. Requirement Coverage

The primary evidence is `test-report.md` (PASS, 0 `PRODUCT_BUG`, 3 partial-automation gaps each with a manual check recorded). The auditor cross-checked its matrix against `requirements.md` and re-read the shipped text for every `BUT` / `AND IT MUST` clause.

| Req | Owning task(s) | Code evidence (HEAD) | Test evidence | Result |
|---|---|---|---|---|
| FR-1 Guardrails guide | T1 | `guardrails.md`: Layers 1–4 in order; "No single layer is sufficient on its own, and model instructions alone are not a guardrail"; voice section is counsel-owned (statute grep: 0 legal hits; one hit is the verb "act" in an example clause); 7 `> Unvalidated:`; `Last verified: 2026-11-14`; 3 dated sources; OWASP labeled a standard | `ai-agent-references.test.js` FR-1 ×3 scenarios | PASS |
| FR-2 Evals guide | T2 | `evals.md` §1–§5 lifecycle plus voice; "never from the agent's own output"; judge pinned, calibrated, and "Never grades its own output"; §7 no-pass lists the changed judge, rubric or prompt; 5 markers | FR-2 ×4 scenarios | PASS |
| FR-3 Router and mapping | T3, T7 | `SKILL.md` +2 rows, `binding: conditional`, `version: "1.1"`; mapping has 2 pointer sentences; the `## 4.` hash is pinned | author FR-8 router test; references FR-3 | PASS |
| FR-4 specify | T4 | `akili-specify.md` `### AI Agent Mode` items 1–6; checklist row; removed from the Step 2.1 list | author FR-4; T13 cases a, b, c | PASS (W-1 fixed, §11) |
| FR-5 test | T5 | `akili-test.md:117` bullet (exit 0 is not the gate; no Tester edits; online out of reach); STOP `:121`; Agent Evals `:173`; suite-types `:215` | author FR-5 | PASS |
| FR-6 validate | T6 | `akili-validate.md` ladder matches FR-6 cell by cell and in order; MUST NOT PASS while FAIL or BLOCKED; violation always FAIL; non-agent gets no entry | author FR-6; T13 case d plus falsifier | PASS |
| FR-7 Governance | T7–T10 | All 9 surfaces read `conditional`. Constitution Step 5 conditional line; not in Step 8D or the docs stack list; Best Paired lists the selector-gated steps. Remaining `stack` / Skill Map hits next to the name are routing roles (`backend-routing.md:25`, `:36`, `:48`) or the docs line that says "not a Skill Map candidate" | references FR-7; panel catalog and flow tests | PASS |
| FR-8 Docs, CHANGELOG, tests | T11, T12 | 3 command docs pages describe the branch; CHANGELOG clauses quote-checked; `grep docs/specs` in both new test files → 0 | references FR-8; manual quote-check | PASS |
| NFR-1 Non-agent path untouched | T4–T6, T12 | Every added command sentence is under `AI Agent: yes`, except the specify detection item (the allowed carve-out) | author NFR-1 | PASS |
| NFR-2 / NFR-3 | T1, T2 | Sources pinned and dated; marker greppable | references Sources tests | PASS |
| NFR-4 Size | T1, T2 | 133 lines / 12,277 B and 145 lines / 12,761 B, both within the ≤ 220 / ≤ 22,000 cap | NFR-4 ×2 | PASS |
| NFR-5 Vendor-neutral | T1, T2 | Vendor appears only as an example ([2] Bedrock) | NFR-5 ×2 | PASS |
| NFR-6 Verification | T13 | §5 above | §5 above | PASS |

**Agent eval gate:** none applies, because `requirements.md` records `AI Agent: no` (FR-6 non-agent scenario).

## 7. Linting & Code Quality

No linter is configured for Markdown. `git diff --check` is clean, and the `node:test` suites act as the text contracts.

### Finding (gating)

| ID | Level | Finding | Location |
|---|---|---|---|
| W-1 | **WARN → fixed** | **Phase-gate wording can be read as impossible to satisfy.** Item 6 says "The Phase 1, 2 and 3 gates do not pass an `AI Agent: yes` spec while any item above is missing." Items 4–5 (the `design.md` monitoring plan and the eval-gate task) do not exist yet at the Phase 1 gate. Read literally, an agent spec can never clear Phase 1. The shipped text copies FR-4's `BUT` clause word for word, so this is a spec-level ambiguity, not drift. A sensible agent reads it phase by phase, but rules text other agents execute should not depend on that. The T13 walkthrough did not exercise per-phase gating | `.claude/commands/akili-specify.md:83`; `requirements.md` FR-4 S2 `BUT`; `docs/commands/akili-specify.md:80` |

### 4R advisory findings (do not gate)

| # | Lens | Finding | Source |
|---|---|---|---|
| A-1 | Readability | `docs/skills/ai-agent-development.md:22` names only three references as carrying `Last verified:`. The two new references carry it too | test-report A-1 |
| A-2 | Reliability | `evals.md:62` re-scores on a changed "judge, rubric or scoring code", but the §7 no-pass bullet (`:137`) says "judge, rubric or prompt". The two lists disagree | T2 Reviewer |
| A-3 | Readability | `test/backend-skill-routing.test.js:137` local array `STACK` holds `ai-agent-development` as a stack *lead*. That is correct, but the name could mislead a later binding sweep | test-report A-2 |
| A-4 | Readability | Comments at `test/install-cursor.test.js:234`, `:250` and `:355` still say 318/332; the totals are now 320/334 | T7 |
| A-5 | Reliability | The NFR-1 detector in `ai-agent-guardrails-evals.test.js` has no check that its pattern matched at least one line, so a broken pattern would pass with nothing checked | T12 Reviewer |
| A-6 | Readability | CHANGELOG test clause leaves out "or its runner is absent". The docs pages leave out the unrecognized-value branch, the "every task lists the skill" rule and "a mismatch is a `FAIL` or a `PRODUCT_BUG`". The new `### Changed` bullet is followed by a blank line, which makes the list loose | T11 Reviewer 1–5 |
| A-7 | Risk | The detection definition counts any runtime model output shown to a person as an agent, so a one-shot LLM summary triggers full enforcement. This breadth may be intended; changing it is a question for a later proposal | T13 |
| A-8 | Readability | `backend-routing.md:25` routing-matrix cell (table headed "Stack skill") names `ai-agent-development (decisions)`. That is a routing role, not the binding | T9 |
| A-9 | Readability | `design.md` §11 still shows P-14 and P-15 as `UNVERIFIED`. Both were settled during execution (sources fetched in T1/T2; fixture unchanged in T7). Archive can sync the ledger | auditor |
| A-10 | Readability | `guardrails.md:85` "Always honored; never argue the caller out of it" states a product stance as settled practice, with no `> Unvalidated:` marker | T1 Reviewer |

## 8. Design Conformance

| Check | Result |
|---|---|
| §3 reader table: every reader's yes / no / absent / unrecognized branch is present in the shipped text | PASS (T13 terminal-branch table re-read at HEAD) |
| §9.1 / §9.2 section order of both references | PASS |
| §9.3 AI Agent Mode placed after Video Mode, items 1–6 in order; checklist row; Step 2.1 list | PASS |
| §9.4 test: 4 sites; §9.5 validate: 3 sites, no new report section (DD-6) | PASS |
| DD-7 inconclusive → BLOCKED (Q4), and the CHANGELOG says BLOCKED | PASS |
| DD-9 constitution ripple, plus its docs-page follow-up (`quick/constitution-docs-agent-line`, `696e98e`) | PASS |
| Proposal intent, scope and non-goals: no runner, no online run, no legal advice, no new command or skill, `Deliverable` unchanged | PASS |
| Cross-document figures: 13 tasks; 318 → 320 skill files; ledger 13 + 2 = 15 rows; 1950 + 62 = 2012 tests; 429 packed files; reference sizes. All agree across requirements, design, tasks, execution and test-report | PASS |

Factual correction applied during validation: `test-report.md` Document Control said `test/ai-agent-references.test.js` was uncommitted, but `fd14565` commits it. The row now says so. The forward sweep found no other "uncommitted" claim in the spec folder; the backward sweep found no document citing that row.

There is no UI, so the Design Review (impeccable-bridge) does not apply.

## 9. Test Evidence Summary

| Source | Evidence |
|---|---|
| `test-report.md` | PASS; 62 new tests and 7 mutation reds; 0 `PRODUCT_BUG`; 3 accepted partial-automation gaps, each with a manual check (no-statute regex, CHANGELOG quote-check, voice-metrics example) |
| Author suite (T12) | FR-4, FR-5, FR-6 and NFR-1 clauses pinned; 4 mutation reds quoted |
| Prompt behavior | No automated check is possible (requirements §8). The T13 held-out walkthrough (cases a–d plus falsifier) substitutes |
| Auditor re-run | §5: 2012/2012 |

## 10. Agent Guide / Constitution Impact

`execution.md` has no `## Constitution Impact` notes: no module was created or reshaped. The one root-guide edit (`AGENTS.md` *Backend Skills* line → "conditional skill") is part of the spec scope (T9) and matches `SKILL.md`. **Pending for `/akili-archive`:** a CodeGraph re-index, as usual. No guide sync is owed.

## 11. Remediation

| ID | Level | Recommendation | Route |
|---|---|---|---|
| W-1 | WARN → **fixed** | Make each gate check only what its phase produces. Phase 1: the row plus the Guardrails and Evals sections. Phase 2: the eval seam and monitoring plan. Phase 3: the eval-gate task and the skill on every task | JC approved the in-spec fix on 2026-11-16. See *W-1 fix record* below |
| A-1…A-10 | Advisory | Recorded only. They never become tasks in this spec (*Scope only grows through approval*). A-1, A-2 and A-4 are copy-level candidates for `/akili-quick`; A-7 is a proposal question | Kaizen or later quick/proposal |

### W-1 fix record (2026-11-16, approved by JC)

| Item | Detail |
|---|---|
| Rule | Per-phase gating. Phase 1 checks the `AI Agent` row and the Guardrails and Evals sections. Phase 2 checks the eval seam and the online monitoring plan in `design.md`. Phase 3 checks the eval-gate task and `ai-agent-development` on every task |
| Edits (one line each) | `.claude/commands/akili-specify.md:83` (item 6, now **Gates, per phase.**); `docs/commands/akili-specify.md:80`; `requirements.md` FR-4 S2 `BUT`; `test/ai-agent-guardrails-evals.test.js` test 10 (one pin per phase inside item 6, plus a guard against the old "any item above is missing" wording) |
| Correction closure | Forward: grep for "Phase 1, 2 and 3", "Phase 1, 2 or 3", "Phase 1/2/3" and "any item above is missing" across the spec folder, `.claude/`, `docs/`, `CHANGELOG.md` and `test/`. The sweep found and fixed `design.md` §9.3 item 6 and `tasks.md` T4. Backward: the Verification Checklist row (`akili-specify.md:541`) runs after all three gates, so it stays true. The CHANGELOG entry does not mention phase gates and is unchanged |
| Red before the fix | `not ok 10 - FR-4 BUT: item 6 gates per phase, …` with `expected text "**Gates, per phase.**" in: 6. **Gates.** The Phase 1, 2 and 3 gates do not pass …` |
| Mutation after the fix | Deleting the Phase 2 sentence in a scratch copy (`AI_AGENT_EVALS_TEST_ROOT`) → `not ok 10`, `FR-4 BUT Phase 2: expected text …`. Only the target test went red |
| Reviewer (`sonnet`, which differs from the fix author `opus`) | **PASS**, with no blocking issues. Advisory: the docs bullet has no test pin. The checklist row could say "that phase's items" |
| Verification | `npm test` `# tests 2012` `# pass 2012` `# fail 0`; `verify:cli` clean; `git diff --check` clean |

## 12. Archive Readiness Recommendation

**Ready to archive after re-validation.** W-1 is fixed (§11, *W-1 fix record*). All 13 tasks are done, there are no FAILs, every requirement and NFR has evidence, and the build is green. Because the fix changed rules text after this audit, run a fresh validation before archiving:

```text
/akili-validate changes/ai-agent-guardrails-evals
```
