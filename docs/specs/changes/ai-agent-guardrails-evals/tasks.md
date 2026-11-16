# Tasks: Guardrails and Evals for AI Agents

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/ai-agent-guardrails-evals` |
| Depth | Standard |
| AI Agent | no |
| Tasks | 13 · est. ≈ 900 LOC (≈ 580 prose + ≈ 320 tests) · two stacked PRs recommended (see below); local commits only this cycle |
| Commit prefix | `[SPEC:changes/ai-agent-guardrails-evals]` |
| Status | Phase 3 approved by JC 2026-11-14 — ready for `/akili-execute` |
| Baseline | `43c3c97` (reds observed in a scratch copy of the tree, quoted per task) |

**Order:** (T1 ∥ T2) → T3 → (T4 ∥ T5 ∥ T6) → T7 → (T8 ∥ T9 ∥ T10) → T11 → T12 → T13. Tasks listed as parallel each edit different files. Run them in sequence in this one checkout unless they get separate worktrees (AGENTS.md *Concurrency*).

**Quiet-tree rule:** no `npm test` or `npm run …` while a delegated agent is active. A task's scoped test runs after its Implementer returns. The full suite runs at T13.

**Shared pre-review sweep (every rules-text task):** before the Reviewer, run the obligation's phrase-family grep over every in-scope file and read every hit (KZ-changes--kaizen-loop-closure-2). Quote-check every summary clause at HEAD (KZ-002).

**Falsifier convention (item 8):** a falsifier on text that does not exist yet is `predicted — greenfield artifact (observed in <task>)`. The named task quotes the observed red verbatim in `execution.md`. A grep that can only return 0 at baseline is labeled **precondition**, never a red run.

---

### T1 — Author `references/guardrails.md`

- **Status:** [x] · **Size:** M · **Depends on:** none
- **Requirements:** FR-1, all three scenarios and every clause: four layers in order; what each layer blocks, where it sits, and what it becomes in the spec; a phone example per layer; `AND IT MUST` no single layer suffices and instructions are not a guardrail; voice: identity verification, recording consent, escalation (triggers, context, fallback); `BUT` no statute, rule of law or jurisdiction, owned by counsel; `AND IT MUST` mark `> Unvalidated:`; sources pinned and dated; `Last verified:`; `BUT` vendor-neutral; `AND IT MUST` route vendor configuration through *Runtime Deferral*. Also NFR-2, NFR-3, NFR-4, NFR-5
- **Design:** §9.1, DD-3, DD-4, DD-5, DD-11; P-2, P-12, P-14
- **Scope:** new `.claude/skills/ai-agent-development/references/guardrails.md`. **First step:** settle P-14. Fetch each candidate source (Anthropic prompt-injection and jailbreak guidance, Amazon Bedrock Guardrails, OWASP Top 10 for LLM Applications, plus any other link used), record URL and fetch date, and drop or re-source any claim a page does not support
- **Tests / Verification:**
  1. Section walk against §9.1, every row present in order.
  2. `grep -c "> Unvalidated:"` ≥ 1, and every threshold or voice practice carries one.
  3. `wc -lc` ≤ 220 lines and ≤ 22,000 bytes.
  4. Legal-drift grep `grep -niE "\b(act|statute|law|section [0-9]|§|GDPR|HIPAA|TCPA|CCPA|wiretap|one-party|two-party|all-party)\b"` → every hit is a non-legal use or a counsel-owned framing, each one read.
  5. Every `## Sources` link was fetched this task, with its date in the file.
- **Falsifier:** after the change, append "Under the <statute name>, two-party consent is required" to the voice section → check 4 must flag it. Remove the `Last verified:` line → the §9.1 walk must fail. Observe, quote, revert
- **Red run:** predicted — greenfield artifact (observed in T1)
- **Disqualifier:** a source "verified" from memory or from a search snippet rather than a fetched page. A size measured with `du`
- **Consumers:** none (new file). Its router row lands in T3
- **Review:** `full` — new guidance whose claims users will build on
- **Done:** file exists; five checks and both falsifiers quoted in `execution.md`; P-14 outcome recorded
- **Skills:** `ai-agent-development`, `cognitive-doc-design`, `security-audit` (guidance mode, for the injection and least-privilege content)

### T2 — Author `references/evals.md`

- **Status:** [x] · **Size:** M · **Depends on:** none (shares the P-14 source fetch with T1. Whichever runs first records the fetch, and the other reuses it)
- **Requirements:** FR-2, all four scenarios and every clause:
  - offline, online (sampling, metrics, alert threshold, owner), regression on every change against a baseline, LLM-as-judge;
  - voice metrics: latency with the interval defined, as percentiles; escalation rate; task completion;
  - a phone example per kind;
  - expected values from approved scenarios, and `BUT` never labeled from agent output;
  - `AND IT MUST` guardrail sets with zero tolerance;
  - judge: rubric and model pinned, calibrated, and `AND IT MUST` a changed judge without re-scoring is a no-pass condition;
  - sources pinned and dated, `Last verified:`;
  - `AND IT MUST` `> Unvalidated:` on thresholds, set sizes and voice targets.

  Also NFR-2…NFR-5
- **Design:** §9.2, DD-3, DD-4, DD-10, DD-11; P-12, P-14
- **Scope:** new `.claude/skills/ai-agent-development/references/evals.md`. First step: confirm the eval-source links (Anthropic *Define success criteria and build evaluations*, LangSmith *Evaluation concepts*), fetched and dated
- **Tests / Verification:**
  1. Section walk against §9.2.
  2. Every number in the file (thresholds, sample rates, percentiles, set sizes) sits under or inside a `> Unvalidated:` marker, checked by `grep -nE "[0-9]+(%|\s?ms|\s?s\b| cases)"` with each hit read.
  3. `wc -lc` ≤ 220 lines and ≤ 22,000 bytes.
  4. No-pass list includes the judge-change condition.
  5. Sources fetched this task.
- **Falsifier:** after the change, delete the sentence that forbids labeling from agent output → the FR-2 clause walk must fail at that clause. Add "p95 latency under 800 ms" outside any marker → check 2 must flag it. Observe, quote, revert
- **Red run:** predicted — greenfield artifact (observed in T2)
- **Disqualifier:** a voice metric written without its measured interval. A threshold stated as a recommendation without the marker
- **Consumers:** none (new file)
- **Review:** `full`
- **Done:** file exists; checks and falsifiers quoted
- **Skills:** `ai-agent-development`, `cognitive-doc-design`

### T3 — Router rows, version, mapping pointers

- **Status:** [x] · **Size:** S · **Depends on:** T1, T2
- **Requirements:** FR-3, both scenarios: two router rows; bumped `version`; mapping points to the guides; `BUT` no restatement, and the triage example unchanged. The `binding:` line is **not** changed here (T7 flips it with its consumers so the suite stays green)
- **Design:** §4, DD-3, DD-4
- **Scope:** `SKILL.md` *References — load per task* (+2 rows) and `metadata.version` 1.0 → 1.1. `references/akili-spec-mapping.md`: one pointer sentence where §1 discusses guardrails and one where §3 discusses eval work (3 sites across 2 files of one skill)
- **Tests / Verification:**
  1. `git diff --stat` shows only these two files.
  2. The triage section `## 4.` is byte-identical: `git diff` shows no hunk inside `## 4.`.
  3. The router table has 6 rows.
- **Falsifier:** after the change, paste a guardrail-layer paragraph from T1 into the mapping file → the no-restatement check (`grep -F` of 3 distinctive T1 sentences in `akili-spec-mapping.md` → must be 0) goes to ≥ 1. Observe, quote, revert
- **Red run:** baseline router rows at `43c3c97`: 4 (`SKILL.md:57-60`). Precondition `grep -c "guardrails.md\|evals.md" .claude/skills/ai-agent-development/SKILL.md` → 0
- **Disqualifier:** a diff inside `## 4.`
- **Consumers:** `docs/skills/ai-agent-development.md` *References* table (T8)
- **Review:** `checklist`
- **Done:** checks quoted
- **Skills:** `ai-agent-development`, `cognitive-doc-design`

### T4 — `/akili-specify` AI Agent Mode

- **Status:** [x] · **Size:** M · **Depends on:** T3
- **Requirements:** FR-4, all three scenarios and every clause:
  - detection definition; row written `yes`/`no`; one question when unclear;
  - `AND IT MUST` absent means `no`;
  - load the skill with its three references;
  - Guardrails section (per-guardrail `BUT`, own negative set, zero tolerance, layers covered or `n/a — <reason>`);
  - Evals section (offline sets, thresholds, regression trigger, rubric);
  - `design.md` monitoring plan (metrics, sampling, alert threshold, owner) and eval seam;
  - eval-gate task with four parts;
  - `ai-agent-development` on every task;
  - `BUT` no Phase 1/2/3 gate passes while any is missing;
  - non-agent output unchanged.

  Also NFR-1. Design §3 terminal branches for specify: absent → `no`; unrecognized → `no`, reported at the next gate
- **Design:** §3, §9.3, DD-1, DD-2, DD-9 (Step 2.1 list); P-3, P-9
- **Scope:** `.claude/commands/akili-specify.md`. (a) New `### AI Agent Mode` block after `### Video Mode`, items 1–6 of §9.3. (b) One Verification Checklist row. (c) Remove `ai-agent-development` from the Step 2.1 no-map list (`:252`). 3 sites, 1 file
- **Tests / Verification:**
  1. FR-4 clause walk, term by term, against the block.
  2. `grep -n "AI Agent" .claude/commands/akili-specify.md` → every hit is inside the block, the checklist row, or the detection item (NFR-1 carve-out).
  3. `npm test -- --test-name-pattern "binding-stack|stack skill"` stays green (P-6).
- **Falsifier:** after the change, delete item 6 (the gate refusal) → the clause walk must fail at FR-4 `BUT`. T12 then pins it in code. Observe, quote, revert
- **Red run:** precondition (observed at `43c3c97`): `grep -c "AI Agent" .claude/commands/akili-specify.md` → `0`
- **Disqualifier:** an added agent sentence outside the block that is not conditioned on `AI Agent: yes`
- **Consumers:** `test/video-production.test.js:269-273` and `test/command-contracts.test.js:238` read `### Video Mode` by heading. The new block must start with its own `###` heading so `section()` stops before it. Re-run both files
- **Review:** `full` — rules text other agents execute
- **Done:** checks and falsifier quoted; both consumer test files green
- **Skills:** `ai-agent-development`, `cognitive-doc-design`

### T5 — `/akili-test` agent eval suite

- **Status:** [x] · **Size:** S · **Depends on:** T3
- **Requirements:** FR-5, all three scenarios and every clause:
  - eval suite planned when `yes`, over the offline, regression and guardrail sets;
  - Agent Evals section with five fields per set;
  - `BUT` exit 0 is not the gate;
  - `AND` a Tester must not change expected values, thresholds or rubric (a mismatch is `FAIL`/`PRODUCT_BUG`);
  - `AND IT MUST` online evals are recorded as out of reach;
  - no runner → existing STOP, with no improvised eval;
  - non-agent: no suite and no section.

  Also NFR-1. Design §3 terminal branches for test
- **Design:** §3, §5, §9.4; P-3, P-13
- **Scope:** `.claude/commands/akili-test.md`. Phase 1 item 1 bullet; Phase 1 item 2 STOP bullet; Phase 4 Agent Evals paragraph; the `:211` suite-types sentence. 4 sites, 1 file
- **Tests / Verification:** FR-5 clause walk. Phrase-family grep for "four software suite types|suite type" over the file and `docs/commands/akili-test.md`, every hit agreeing
- **Falsifier:** after the change, delete the "must not change expected values" clause → the walk fails at FR-5 `AND`. T12 pins it. Observe, quote, revert
- **Red run:** precondition (observed at `43c3c97`): `grep -c "AI Agent" .claude/commands/akili-test.md` → `0`. `:211` reads "four software suite types (backend unit, frontend unit, integration, E2E; the `Deliverable: video` render evidence suite is separate)"
- **Disqualifier:** an eval-suite sentence not conditioned on `AI Agent: yes`
- **Consumers:** `docs/commands/akili-test.md:28`, `:59` (T11)
- **Review:** `full`
- **Done:** walk, sweep and falsifier quoted
- **Skills:** `ai-agent-development`, `cognitive-doc-design`

### T6 — `/akili-validate` agent eval gate

- **Status:** [x] · **Size:** S · **Depends on:** T3
- **Requirements:** FR-6, both scenarios and every clause:
  - ladder rows verbatim and in order (no gate or no results → FAIL; violation → FAIL; threshold → FAIL; no monitoring plan → FAIL; no-pass → BLOCKED; else passes);
  - the report records the verdict and the deciding row;
  - `BUT` no spec PASS while the gate is FAIL or BLOCKED;
  - `AND IT MUST` a violation is FAIL whatever the aggregate;
  - non-agent: no gate and no entry.

  Also NFR-1. Design §3 (unrecognized → WARN)
- **Design:** §3, §5, §9.5, DD-6, DD-7; P-3
- **Scope:** `.claude/commands/akili-validate.md`. Phase 0 load bullet; Phase 4 *Agent eval gate* paragraph and ladder; report section 6 sentence. 3 sites, 1 file
- **Tests / Verification:**
  1. Cell-by-cell comparison of the shipped ladder with `requirements.md` FR-6 (the restate rule in Step 2.2).
  2. FR-6 clause walk.
  3. The report section list still has 12 items.
- **Falsifier:** after the change, swap the BLOCKED row to FAIL → the cell comparison must flag it. Observe, quote, revert
- **Red run:** precondition (observed at `43c3c97`): `grep -c "AI Agent" .claude/commands/akili-validate.md` → `0`
- **Disqualifier:** a ladder that drops the monitoring-plan row or reorders rows
- **Consumers:** `docs/commands/akili-validate.md:59` (T11)
- **Review:** `full`
- **Done:** comparison, walk and falsifier quoted
- **Skills:** `ai-agent-development`, `cognitive-doc-design`

### T7 — Binding flip with its code and test consumers

- **Status:** [x] · **Size:** S · **Depends on:** T1, T2 (file count), T3
- **Requirements:** FR-7 (`SKILL.md`, panel `SKILL_CATALOG`, panel test binding list, `docs/overview.md`), FR-8 (fixtures)
- **Design:** DD-8; P-5, P-7, P-8, P-15
- **Scope:**
  - `SKILL.md` `binding: stack` → `conditional`.
  - `flow.mjs:634`: move the entry into the conditional block, keeping the catalog order the panel tests require.
  - `test/akili-panel-flow.test.js:1436`: move the name into `SKILL_NAMES.conditional`, alphabetical.
  - `docs/overview.md:78`: binding cell.
  - `test/install-cursor.test.js`: `SKILL_FILE_EXPECTED` gains `+ 2` with its comment.
  - P-15: run `npm test` and confirm `doctor-codex-baseline.txt` is untouched.
- **Tests / Verification:** `node --test test/akili-panel-catalog.test.js test/akili-panel-flow.test.js test/docs-overview.test.js test/install-cursor.test.js` → all green
- **Falsifier:** the observed reds below are the falsifier. Re-run each after the change with the matching edit reverted, and quote the red
- **Red run (observed at `43c3c97`, scratch copy):**
  - SKILL.md flip alone → `skills with a different binding: ai-agent-development: catalog stack, SKILL.md conditional` and `skill ai-agent-development: binding cell "stack", SKILL.md declares "conditional"` (3 tests fail).
  - Plus the catalog flip without test or catalog reorder → 6 failures in `akili-panel-flow.test.js`, including `not ok 198 - FR-3 the catalog is stored in alphabetical order`.
  - Two new reference files → `expected 318 (…) packaged skill files under .claude/skills; counted 320 instead`.
- **Disqualifier:** a test edited to accept both bindings, or the count assertion loosened rather than set to 320
- **Consumers:** the four test files above; `test/fixtures/doctor-codex-baseline.txt:27`
- **Review:** `checklist` — the suite is the gate
- **Done:** all four files green; each red re-observed and quoted
- **Skills:** `cognitive-doc-design`

### T8 — Docs and governance restatements

- **Status:** [x] · **Size:** S · **Depends on:** T7
- **Requirements:** FR-7: `docs/skills/governance.md` *Current assignment*, `docs/skills/README.md`, `docs/skills/ai-agent-development.md` (binding, *Best Paired Commands* naming the selector-gated steps, *References* table +2 rows); `BUT` no sentence saying the skill reaches agents only through the Skill Map
- **Design:** DD-8; P-4, P-11
- **Scope:** 3 docs files, about 5 sites: move the name from the `stack` row to the `conditional` row with "(AI agent specs)"; README binding cell and *Wired into* cell; skill page header, *Best Paired Commands* and *References*
- **Tests / Verification:** phrase-family sweep `grep -rnE "ai-agent-development[^|]*\|? *stack|stack[^.]*ai-agent-development|Skill Map[^.]*ai-agent-development" docs/ .claude/ AGENTS.md README.md` → every remaining hit is intended (for example `backend-routing.md` stack-lead rows, which concern routing leads, not binding) and read
- **Falsifier:** after the change, revert the governance row only → the sweep must show the `stack` row hit. Observe, quote, revert
- **Red run:** baseline (observed at `43c3c97`): `docs/skills/governance.md:70` lists it under `stack`; `docs/skills/README.md:21` cell `stack`
- **Disqualifier:** a sweep keyed only on the exact string "binding: stack"
- **Consumers:** `test/docs-overview.test.js` (tests the overview, not these files)
- **Review:** `checklist`
- **Done:** sweep output quoted
- **Skills:** `cognitive-doc-design`

### T9 — Guide and routing labels

- **Status:** [x] · **Size:** XS · **Depends on:** T7
- **Requirements:** FR-7 (`AGENTS.md` *Backend Skills*, `backend-routing.md`)
- **Design:** DD-8; P-4
- **Scope:** `AGENTS.md:95` "stack skill:" → "conditional skill:". `backend-routing.md:70` "(stack)" → "(conditional)". Two single-token sites in two rules documents. The per-file split rule is waived because each site is one token, so the Reviewer reads both whole
- **Tests / Verification:** `npm test -- --test-name-pattern "backend-skill-routing"` green (the stack-lead tests at `backend-skill-routing.test.js:136-147` key on the lead cell, not the label)
- **Falsifier:** after the change, revert `:70` → `grep -n "ai-agent-development\` (stack)" backend-routing.md` → 1 hit. Observe, quote, revert
- **Red run:** baseline (observed at `43c3c97`): `backend-routing.md:70` "| `ai-agent-development` (stack) |"; `AGENTS.md:95` "— stack skill:"
- **Disqualifier:** a change to any routing lead cell
- **Consumers:** `test/backend-skill-routing.test.js:43`, `:137`
- **Review:** `checklist`
- **Done:** test green; falsifier quoted
- **Skills:** `cognitive-doc-design`

### T10 — Constitution ripple (DD-9)

- **Status:** [x] · **Size:** XS · **Depends on:** T7
- **Requirements:** FR-7 second `AND` (Step 5 conditional line; out of Step 8D candidates; out of the docs page stack list)
- **Design:** DD-9 and its reversion challenge
- **Scope:**
  - `.claude/commands/akili-constitution.md:264`: remove from the stack list and add one conditional line after the list ("When the product includes an AI agent, load `ai-agent-development`").
  - `:729`: remove from the Step 8D candidates.
  - `docs/commands/akili-constitution.md:123`: remove from the stack list.
  - 3 sites; one rules document plus its docs page.
- **Tests / Verification:** `npm test -- --test-name-pattern "Step 8D|stack skill"` green (P-6). `grep -n "ai-agent-development" .claude/commands/akili-constitution.md` → exactly the conditional line
- **Falsifier:** after the change, re-add the name to the `:729` list → the grep returns 2 hits. Observe, quote, revert
- **Red run:** baseline (observed at `43c3c97`): `grep -n "ai-agent-development" .claude/commands/akili-constitution.md` → `264`, `729`
- **Disqualifier:** a conditional line not keyed on the product including an AI agent
- **Consumers:** `test/backend-skill-routing.test.js:191-199` (Step 8D item 5), `test/design-skill-routing.test.js:207-218`
- **Review:** `checklist`
- **Done:** grep and tests quoted
- **Skills:** `cognitive-doc-design`

### T11 — Command docs pages and CHANGELOG

- **Status:** [ ] · **Size:** S · **Depends on:** T4, T5, T6, T8, T9, T10
- **Requirements:** FR-8 first two `AND`s (docs pages describe the branch; CHANGELOG clauses match HEAD)
- **Design:** §4
- **Scope:** `docs/commands/akili-specify.md` (an AI Agent Mode bullet beside Video Mode at `:79`), `docs/commands/akili-test.md` (`:28`, `:59`), `docs/commands/akili-validate.md` (`:59`), and a `CHANGELOG.md` → `Unreleased` entry
- **Tests / Verification:** quote-check every CHANGELOG and docs clause against the shipped text at HEAD (KZ-002). The sentences around each insertion are re-read
- **Falsifier:** after the change, add "validate FAILs inconclusive runs" to the CHANGELOG → the quote-check must flag it against FR-6/T6 text (BLOCKED). Observe, quote, revert
- **Red run:** precondition (observed at `43c3c97`): `grep -c "AI Agent" docs/commands/akili-{specify,test,validate}.md` → `0` each
- **Disqualifier:** a figure (file count, test count) stated in the CHANGELOG that is not re-run after T12
- **Consumers:** `test/docs-overview.test.js` (d) number-claim check
- **Review:** `full` — summary surfaces (KZ-002, recurrence 7+)
- **Done:** quote-check table in `execution.md`
- **Skills:** `cognitive-doc-design`

### T12 — Text-contract tests

- **Status:** [ ] · **Size:** M · **Depends on:** T1–T11
- **Requirements:** FR-8 third `AND` and `BUT` (pin selector wording in the three commands, both references' presence, `## Sources`, `> Unvalidated:` markers; no read of the active spec path). Plus one assertion per shipped `THEN`/`BUT`/`AND IT MUST` clause of FR-4, FR-5, FR-6, and NFR-1 (every added command line sits under the condition)
- **Design:** DD-12; P-3
- **Scope:** new `test/ai-agent-guardrails-evals.test.js`, with a `*_TEST_ROOT` env hook for mutation runs (precedent: `test/video-production.test.js:13-26`)
- **Tests / Verification:** `node --test test/ai-agent-guardrails-evals.test.js` green. `grep -n "docs/specs/changes" test/ai-agent-guardrails-evals.test.js` → 0
- **Falsifier:** in a scratch copy via the env hook:
  - delete specify AI Agent Mode item 6 → its test red;
  - swap the validate BLOCKED row → its test red;
  - delete the Tester expected-value clause → its test red;
  - remove every `> Unvalidated:` from `evals.md` → its test red.

  Each red is quoted
- **Red run:** predicted — greenfield artifact (observed in T12)
- **Disqualifier:** an assertion that only checks a word occurs anywhere in the file rather than inside the named section. A mutation that goes red on a setup assertion instead of the target (KZ-changes--leader-brief-contract-2)
- **Consumers:** none
- **Review:** `checklist`
- **Done:** file green; four mutation reds quoted
- **Skills:** `tdd`, `cognitive-doc-design`

### T13 — Held-out walkthrough and full verification

- **Status:** [ ] · **Size:** S · **Depends on:** T12
- **Requirements:** §8 defect class "prompt behavior" (no automated check, so a walkthrough substitutes); NFR-6
- **Design:** §3 (every terminal branch)
- **Scope:** walk the three command edits against four held-out cases the text does not cite, each judged against the general sentence with examples stripped:
  - (a) an inbound-SMS support bot with a refund tool → `yes`, full enforcement;
  - (b) a report generator with no model → `no`, no change;
  - (c) a spec whose proposal says "add AI summaries to the dashboard" → unclear, one question;
  - (d) an agent spec missing its monitoring plan → validate FAIL at the monitoring row.

  Then run the full verification
- **Tests / Verification:** `npm test`, `npm run verify:cli`, `npm run pack:dry-run` (two new files under `ai-agent-development/references/`, nothing else new), `git diff --check`
- **Falsifier:** case (d) against a copy of validate with the monitoring row deleted → the walk must reach "eval gate passes", showing the walk can fail. Observe, quote
- **Red run:** n/a — a walkthrough over shipped text, with no automated red
- **Disqualifier:** a case judged by its citation in the text rather than by the general sentence
- **Consumers:** none
- **Review:** `checklist`
- **Done:** walkthrough table and all four command outputs quoted in `execution.md`
- **Skills:** `ai-agent-development`

---

## Coverage — clause to task

| Requirement clause | Task |
|---|---|
| FR-1 S1 (layers, per-layer content, examples, `AND IT MUST` not sufficient alone) · S2 (voice ×3, `BUT` no law, `AND IT MUST` marker) · S3 (sources, `Last verified:`, `BUT` vendor-neutral, `AND IT MUST` deferral) | T1 |
| FR-2 S1 (lifecycle, voice metrics, examples) · S2 (`THEN` from scenarios, `BUT` not from output, `AND IT MUST` zero tolerance) · S3 (pinned, calibrated, `AND IT MUST` no-pass) · S4 (sources, `AND IT MUST` marker) | T2 |
| FR-3 S1 (rows; version) · S2 (pointers; `BUT` no restatement) | T3 · binding in S1 → T7 |
| FR-4 S1 (row, one question, `AND IT MUST` absent = no) · S2 (load, Guardrails, Evals, monitoring plan, gate task, skill on every task, `BUT` gates refuse) · S3 (non-agent unchanged) | T4 (text) · T12 (pins) · T13 (walk a, b, c) |
| FR-5 S1 (suite, section, `BUT` exit 0, `AND` no Tester edits, `AND IT MUST` online out of reach) · S2 (STOP) · S3 (non-agent) | T5 · T12 |
| FR-6 S1 (ladder, report, `BUT` no PASS, `AND IT MUST` violation FAIL) · S2 (non-agent) | T6 · T12 · T13 (walk d) |
| FR-7 S1 (`THEN` restatements: SKILL.md, catalog, panel test, overview → T7; governance, README, skill page → T8; AGENTS.md, backend-routing → T9) · (`AND` constitution → T10) · (`AND` Best Paired → T8) · (`BUT` no Skill-Map-only sentence → T8 sweep) | T7, T8, T9, T10 |
| FR-8 (`THEN` docs pages, `AND` CHANGELOG → T11) · (`AND` tests → T12) · (`BUT` no spec-path read → T12) | T11, T12 |
| NFR-1 → T4/T5/T6 disqualifiers + T12 · NFR-2/3 → T1/T2 · NFR-4 → T1/T2 check 3 · NFR-5 → T1/T2 walk · NFR-6 → T13 | — |

## Skip-eligible tasks

None. Every task gets at least a `checklist` Reviewer.

## PR strategy

≈ 900 LOC exceeds ~400, so two stacked PRs into `dev` (opened only on JC's instruction):

- **PR 1 — skill content:** T1, T2, T3. Review first; standalone guidance with no enforcement.
- **PR 2 — enforcement and governance:** T4–T13, stacked on PR 1. Review the three commands first (T4–T6), then the binding ripple.
