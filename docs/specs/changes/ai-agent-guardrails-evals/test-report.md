# Test Report: Guardrails and Evals for AI Agents

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/ai-agent-guardrails-evals` |
| Depth | Standard |
| AI Agent | no (this spec ships methodology text, so no Agent Evals suite applies) |
| Date | 2026-11-16 |
| Branch / HEAD | `feat/ai-agent-guardrails-evals` at `696e98e` (plus the new `test/ai-agent-references.test.js`, committed afterwards in `fd14565`) |
| Leader | Opus 5.5 (`claude-opus-5-5`) |
| Tester | `opus`, which differs from the Implementer model `sonnet` (author ≠ tester). No `akili-tester` wrapper exists, so this is a per-spawn model choice (rule step 2) |

## 2. Summary

**Overall: PASS.** All 2012 tests pass, and every FR and NFR has automated evidence. No product bugs. There are three partial-automation gaps, each with a manual check recorded in §9.

| Item | Result |
|---|---|
| `npm test` | 2012 / 2012 pass, 0 fail |
| `npm run verify:cli` | OK: 14 commands, 32 skills, 1 plugin, 8 resources |
| `npm run pack:dry-run` | 429 files; `guardrails.md` and `evals.md` are packed under `ai-agent-development/references/` |
| `git diff --check` | clean |
| New suite `test/ai-agent-references.test.js` | 62 / 62 pass; 7 mutations, each red |
| Author suite `test/ai-agent-guardrails-evals.test.js` (T12) | cited, not rewritten; green inside `npm test` |
| PRODUCT_BUG | none |

**Delegation:**
- One suite ran, with one Tester and no parallel spawn. Nothing ran inline.
- The Tester got the skills from the persona and the `section()` scoping pattern. Effort was default. Nothing deviated from the task skill lists.
- The work split this way:
  - The author's T12 tests already cover FR-4, FR-5, FR-6, NFR-1 and the FR-8 pins.
  - The Tester covered what was left: the content of the two references (FR-1, FR-2), the mapping (FR-3), the binding restatements (FR-7), docs and CHANGELOG (FR-8), and NFR-4 and NFR-5.
- There was no CodeGraph lookup. The files under test are prose that this spec changed, so the working tree is the source of truth.

## 3. Backend Unit Tests

None apply. The spec ships Markdown methodology with no runtime code. Its tests are text contracts (`node:test`) that assert each rule sits inside the section where an agent reads it.

## 4. Frontend Unit Tests

None apply: there is no UI.

## 5. Integration Tests (text contracts)

| Suite | Command | Result |
|---|---|---|
| References content + governance (new) | `node --test test/ai-agent-references.test.js` | `# tests 62` `# pass 62` `# fail 0` |
| Command branches (author T12, cited) | `node --test test/ai-agent-guardrails-evals.test.js` | green (part of `npm test`) |
| Panel catalog binding (T7, cited) | `test/akili-panel-flow.test.js`, `test/akili-panel-catalog.test.js` | green; the Tester re-ran author + panel-flow: `# tests 284` `# pass 284` |

**Mutation reds.** Each mutation ran on a scratch copy through `AI_AGENT_REFS_TEST_ROOT`. The working tree was never mutated.

| # | Mutation | Red |
|---|---|---|
| 1 | Swap Layer 1 and Layer 2 headings in `guardrails.md` | `not ok 1 - FR-1 THEN: four layers in order …` (tests 3 and 18 also red) |
| 2 | Delete `Last verified:` from `evals.md` | `not ok 36 - FR-2 Sources THEN: …` |
| 3 | Revert `AGENTS.md` to "stack skill" | `not ok 48 - FR-7 THEN: AGENTS.md *Backend Skills* lists it as a conditional skill` |
| 4 | Add "two-party consent states under the TCPA" to the voice section | `not ok 14 - FR-1 Voice BUT it must NOT: no statute, rule of law or jurisdiction named in the voice section (pattern grep)` |
| 5 | Restate "p95" in the mapping's evals pointer | `not ok 43` and `not ok 44 - FR-3 No restatement BUT it must NOT: …` |
| 6 | Unpin the judge rubric | `not ok 34 - FR-2 Judge THEN/AND: …` |
| 7 | Append an "only through the project `## Skill Map`" sentence to the skill page | `not ok 57 - FR-7 BUT it must NOT: …` |

## 6. E2E Tests

None apply. Prompt behavior has no automated check (requirements §8). Its substitute is the T13 held-out walkthrough recorded in `execution.md` (cases a–d plus a falsifier). This command did not re-run it.

## 7. Coverage & Traceability

| Requirement | Scenario | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|
| FR-1 | Four layers, each traced to the spec (order, blocks/where/becomes, phone example, AND IT MUST no single layer) | text contract | `test/ai-agent-references.test.js` `FR-1 THEN/AND/AND IT MUST …` | PASS | — |
| FR-1 | Voice specifics (identity, consent, escalation; BUT counsel-owned; Unvalidated) | text contract | same, `FR-1 Voice …` | PASS | The no-statute check is a pattern grep, so it is partial (§9) |
| FR-1 | Sources and maturity (`Last verified:`, dated sources, vendor as example, Runtime Deferral) | text contract | same, `FR-1 Sources …` | PASS | — |
| FR-2 | Lifecycle coverage plus voice metrics and phone examples | text contract | same, `FR-2 THEN/AND …` | PASS | The voice-metrics example is checked as definitions over calls (§9) |
| FR-2 | Expected values come from approved scenarios (BUT not self-labeled; zero tolerance) | text contract | same, `FR-2 Expected values …` | PASS | — |
| FR-2 | Judge integrity (pinned, calibrated, no-pass on unscored change) | text contract | same, `FR-2 Judge …` | PASS | — |
| FR-2 | Sources and maturity | text contract | same, `FR-2 Sources …` | PASS | — |
| FR-3 | Router rows | text contract | `test/ai-agent-guardrails-evals.test.js` `FR-8: SKILL.md router lists …` | PASS | cited (author) |
| FR-3 | `binding: conditional` plus bumped version | text contract | `test/ai-agent-references.test.js` `FR-3 AND …` | PASS | — |
| FR-3 | No restatement (pointers; BUT no restated content; triage example unchanged, sha256 pinned) | text contract | same, `FR-3 No restatement …` | PASS | — |
| FR-4 | Detected/recorded, enforcement, non-agent unchanged | text contract | `test/ai-agent-guardrails-evals.test.js` `FR-4 …` | PASS | cited (author); prompt behavior was walked in T13 |
| FR-5 | Eval suite, no runner STOP, non-agent unchanged | text contract | same, `FR-5 …` | PASS | cited (author) |
| FR-6 | Verdict ladder, non-agent unchanged | text contract | same, `FR-6 …` | PASS | cited (author) |
| FR-7 | Restatements read conditional (7 surfaces) | text contract | `test/ai-agent-references.test.js` `FR-7 THEN …` | PASS | — |
| FR-7 | Panel `SKILL_CATALOG` | text contract | `test/akili-panel-flow.test.js`, `test/akili-panel-catalog.test.js` | PASS | cited (T7) |
| FR-7 | Constitution Step 5 conditional; absent from Step 8D and from the docs stack list; specify Step 2.1 | text contract | `FR-7 AND …` and the author's `FR-4 / DD-9 …` | PASS | — |
| FR-7 | Best Paired Commands; BUT no "only through Skill Map" sentence | text contract | `FR-7 AND/BUT …` | PASS | Covers prose only; JSON and `.mjs` are covered by the panel tests |
| FR-8 | Docs pages for specify, test and validate | text contract | `FR-8 THEN …` ×3 | PASS | — |
| FR-8 | CHANGELOG `Unreleased` entry matches HEAD | text contract + manual | `FR-8 AND …` | PASS | Partial automation; remaining clauses quote-checked by hand (§9) |
| FR-8 | Selector/presence/Sources/Unvalidated pins; BUT no spec-path read | text contract | author file plus `FR-8 BUT …` in both files | PASS | `grep -c docs/specs` → 0 in both |
| NFR-1 | Non-agent path untouched | text contract | author `NFR-1 …` | PASS | cited |
| NFR-2 / NFR-3 | Pinned sources, `> Unvalidated:` marker | text contract | `FR-1/FR-2 Sources …` | PASS | — |
| NFR-4 | ≤ 220 lines and ≤ 22,000 B per reference | text contract | `NFR-4 …` ×2 | PASS | guardrails 133 lines / 12,277 B; evals 145 lines / 12,761 B |
| NFR-5 | Vendor-neutral | text contract | `NFR-5 …` ×2 | PASS | — |
| NFR-6 | Verification commands | command | `npm test`, `verify:cli`, `pack:dry-run`, `git diff --check` | PASS | — |

## 8. Remediation

No failures, so nothing needs remediation.

**Advisory findings.** These are recorded only. They are not tasks and do not grow scope (AGENTS.md *Scope only grows through approval*).

| # | Finding |
|---|---|
| A-1 | `docs/skills/ai-agent-development.md:22` (Core Rules) lists only framework-selection, LangGraph-patterns and AWS-hosting as carrying `Last verified:`. The two new references carry one too, so the sentence is incomplete |
| A-2 | `test/backend-skill-routing.test.js:137` has a local array `STACK` that includes `ai-agent-development`. Here it means "stack lead" on routing rows, not binding, but the name could mislead a later binding sweep |

## 9. Accepted Gaps

| Gap | Reason | Manual check done |
|---|---|---|
| FR-1 BUT (no statute, rule of law or jurisdiction) is only partly automated | A regex cannot catch a paraphrased rule of law. Requirements §8 already accepts this residual risk | The Tester widened the grep over all of `guardrails.md` and read every hit: `:87` is a risk-keyword list, and `:105` and `:110` treat consent as a policy mechanism. No statute or jurisdiction appears. `:100` states "This guide does not say what any rule requires or where" |
| FR-8 CHANGELOG clause-by-clause match is partial | Prose claims are not fully machine-checkable | Clauses quote-checked against `akili-validate.md:119-124`, `akili-test.md:121` and the governance, AGENTS.md and backend-routing statements. All match |
| FR-2 voice-metrics phone example | The voice section has no labeled `**Phone agent.**` paragraph. Instead it defines its metrics on calls, with the completion example "caller's billing question answered" | The test asserts the call-based definitions |
| Prompt behavior (detection, enforcement) | No automated check is possible (requirements §8) | T13 held-out walkthrough in `execution.md` |
| Online evals | Out of AKILI's reach by design | n/a |
