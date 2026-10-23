# Tasks: `/akili-seo` optional analytics phase — GA4 + Microsoft Clarity

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/seo-analytics` |
| Depth | Standard |
| Type / Deliverable | Change / software |
| Approval Mode | `gated` |
| Status | **Approved** 2026-10-22 (Phase 3 gate; user: "tasks.md aprobado (commit ee28a03). Sigue con /akili-execute") |
| Date | 2026-10-22 |
| Budget (design §11, the tripwire) | **7 tasks · ~790 LOC · 14 review rounds**. This plan uses 6 tasks. `/akili-execute` stops and escalates past 7 tasks, ~900 LOC or 14 rounds |
| Commit prefix | `[SPEC:changes/seo-analytics]`, local commits only; **no push, tag, release or publish** |
| Verified at | `84765ff`. The baseline readings below were executed on 2026-10-22 and are quoted (KZ-changes--leader-brief-contract-2) |
| Baseline suite | `npm test` → `ℹ tests 506 · ℹ pass 506 · ℹ fail 0` (Node v25.2.1 local). The CI matrix is Node 18/22, and its legs are `UNVERIFIED` this cycle (no push) |
| Baseline literals | `grep -c -i` on `.claude/commands/akili-seo.md` / `SKILL.md` / `docs/skills/seo-audit.md`, each → `0/0/0` for: `Phase 2B`, `Measurement & Compliance`, `not legal advice`, `Other jurisdictions: not audited`, `declined at Phase 0`, `measurement ID`, `heatmap`, `behavior metric`, `conversion and UX`. `ls .claude/skills/seo-audit/references/analytics.md` → `No such file or directory`. `:57` reads "If any prerequisite is missing, stop and report exactly what is missing and how to obtain it." `grep -c -i analytics docs/skills/README.md` → `0` |

## 2. Task Graph

```text
T1 (references/analytics.md + test file: reference group)
 ├─▶ T2 (command: intro, prerequisites + :57, inventory, Phase 0, Phase 2 bullet, 2.8, Phase 2B + tests)
 │     └─▶ T3 (command: Phase 3/4/5, checklist, Error Handling + tests)
 └─▶ T4 (SKILL.md + tests)
T2, T3, T4 ─▶ T5 (docs pages, docs/skills/README.md, README.md:801, evals.json + docs test)
T5 ─▶ T6 (CHANGELOG, full verification, phrase-family sweep, FR-11 falsification)
```

Every task edits `test/seo-analytics.test.js`, so tasks run **sequentially**: T1 → T2 → T3 → T4 → T5 → T6. T4 could follow T1 directly, but sharing one test file makes them unsafe to run in parallel.

**Test-file conventions (all tasks).**
- Extract each surface by heading with a `section()` helper, as in `test/akili-security-docs.test.js`.
- Normalize CRLF.
- Copy expected literals as constants from `requirements.md` and the design §5.2 vocabulary. Never read them from the file under test or from `docs/specs/` (KZ-changes--archify-diagrams-1).
- Write each new assertion first and observe it red on the pre-edit file. The red must come from the `assert.match` message, not from a missing helper.

**Pattern convention:** inside table cells, `\|` is the markdown escape for `|`. Run every pattern with a plain `|`.

| Task | Size | Review | Skills |
|---|---|---|---|
| T1 | M | `lenses`: *factual/legal accuracy* (every vendor and legal sentence against its source) + *requirement conformance* | `seo-audit`, `cognitive-doc-design`, `tdd` |
| T2 | M | `lenses`: *requirement conformance* + *privacy/safety* (FR-5 no real submissions, FR-13, NFR-6 read-only) | `seo-audit`, `cognitive-doc-design`, `tdd` |
| T3 | S | `full`: rules text an agent executes; report contract | `seo-audit`, `cognitive-doc-design`, `tdd` |
| T4 | S | `full`: the skill is `core`-bound; the ranking rule's main restatement | `seo-audit`, `cognitive-doc-design`, `tdd` |
| T5 | S | `checklist`: user-facing restatements | `cognitive-doc-design`, `tdd` |
| T6 | S | `full`: summary surface (KZ-002) and closure gate | `cognitive-doc-design` |

**No task is `skip-eligible`.**

---

### T1 — `references/analytics.md` + test file (reference group)

| Field | Value |
|---|---|
| Status | `[x]` |
| Depends on | none |
| Requirements | FR-4: the legal table, all five rows of the requirements table, the not-legal-advice sentence, `Other jurisdictions: not audited`, and the "BUT must NOT assert … violates" phrase "inconsistent with the consent requirement under …"; the Consent Mode `AND IT MUST record which of the four parameters are missing`. FR-11 (a) and (b) in reference §2, and the metric coverage. FR-13 (reference half). NFR-4. NFR-6 (MCP read-only, reference §3). Reference halves of FR-2 (detection signals, static-fetch limitation, no-renderer `not determined`), FR-3 (ID consistency, no unmeasured ms claim, tier on magnitudes), FR-5 (WhatsApp patterns, intercepted click, no real submission, test-traffic disclosure), FR-6 (probe order, evidence suffix), FR-7 (unmask check, mode owner-confirmed, mask on personal-data pages, inputs masked in all modes), FR-9 (GA4 reads, Clarity window, quota, truncation), FR-10 (normalization, unmatched rows, caveats, no causal wording) |
| Design refs | §9.1 items 1–9; §5.2; §6; DD-3…DD-7, DD-9, DD-11, DD-12; P-4…P-14, P-21…P-23, P-26, P-27 |
| Scope | **First step:** settle the three `UNVERIFIED` rows before writing anything that rests on them, and record the outcomes in this task's Done line and in `execution.md`. P-21: find a primary record of Google's statements, otherwise cite them as `[INDUSTRY]`. P-23: fetch Decreto 1074/2015 from Función Pública and quote the Ley 1581 authorization articles. P-27: re-read the Data API dimensions for `hostName` and `sessionSource`, otherwise use the design's fallback. Then create `.claude/skills/seo-audit/references/analytics.md` (~220 lines; outline §9.1) and create `test/seo-analytics.test.js` with the reference group |
| Tests | Reference group, **17** assertions: FR-11 §2 both halves (2); metric coverage in §2 (8: `bounce`, `engagement rate`, `session duration`, `scroll`, `heatmap`, `recording`, `rage click`, `dead click`); FR-4 `not legal advice` + `Other jurisdictions: not audited` (2); Ley 1581 Art. 3, 9 and 12 (1 grouped assertion, three matches); the four Consent Mode parameters (1 grouped); the `datos personales` qualifier (1); FR-13 (1); NFR-4, every line under `## Sources` with `[PRIMARY]` or `[INDUSTRY]` and `checked 20` (1) |

| Verification | Value |
|---|---|
| Command | `node --test test/seo-analytics.test.js` · `npm test` · `wc -l .claude/skills/seo-audit/references/analytics.md` · **source walk:** every vendor and legal sentence quoted beside its source line in `execution.md` (Ley 1581 from Función Pública; GDPR/ePrivacy from EUR-Lex or legislation.gov.uk; Google and Microsoft pages), each with its check date |
| Red run | Baseline: the reference file does not exist (`ls` → `No such file or directory`). The Implementer quotes each new assertion failing on its `assert.match` message against an empty-stub reference, written and then replaced |
| Falsifier | (1) Delete "never" from the §2 ranking sentence → the FR-11 (a) assertion goes red. (2) Delete `heatmap` from the §2 list → that metric-coverage assertion goes red. (3) Remove `ad_user_data` → the Consent Mode assertion goes red. (4) Remove `checked 2026` from one Sources line → the NFR-4 assertion goes red. (5) Remove "datos personales" from the Ley 1581 row → the qualifier assertion goes red. Each one is executed post-change, its red quoted, then reverted |
| Disqualifier | A test that reads its expected literal from `analytics.md` is a tautology. A Sources check that passes on an empty Sources section is inert: assert ≥ 8 source lines first. A legal sentence checked only for presence proves nothing about its correctness. The source walk is the substitute, and the Reviewer re-checks Ley 1581 Art. 9 and ePrivacy Art. 5(3) against the source itself (author ≠ auditor) |
| Consumers | none. New file (P-16: no test pins `seo-audit` text). **Execute-time correction:** `test/install-cursor.test.js` pins the packaged skill-file count (223 → 224), updated in T1 |
| Done | P-21, P-23 and P-27 settled and recorded. The test file is green. Falsifiers 1–5 executed and quoted. The source walk is in `execution.md`. No sentence says that a site "violates" a law, that Ley 1581 mandates a cookie banner, or that a behavior metric affects ranking |

---

### T2 — Command part A: setup, prerequisites, Phase 0, Step 2.8, Phase 2B (+ tests)

| Field | Value |
|---|---|
| Status | `[x]` |
| Depends on | T1 |
| Requirements | **FR-1**, both scenarios: declined state, "must NOT ask again", Phases 1–5 unchanged, prerequisites listed only on yes, "MUST NOT block the classic audit". **FR-2**: the state table; GTM scenario incl. "BUT must NOT report 'GA4 not installed' from a static fetch alone"; partial-access scenario incl. "AND IT MUST name … the missing prerequisite and how to obtain it". **FR-3**: one tag per ID, ID consistency, loading, CWV only from a measurement; scenario "BUT must NOT state a millisecond or score impact" and "AND IT MUST label any cited magnitude with its source tier". **FR-4**: command half; scenario 1 incl. both clauses; scenario 2 incl. "AND IT MUST record which of the four parameters are missing". **FR-5**: both scenarios incl. "BUT must NOT submit a real form" and `n/a — no form or WhatsApp CTA found on sampled pages`. **FR-6**: probe order, "does not call an Admin API 'Search Console link' resource", "AND IT MUST record which evidence settled the state". **FR-7**: three bullets and the scenario incl. the inputs-masked note. **FR-8**: skip note, exactly one Low, "BUT must NOT raise more than one", "AND IT MUST NOT raise … when no conversion action exists". **FR-9**: both scenarios (quota, data window, conversion/UX impact). **FR-10**: join, normalization, unmatched rows, caveats, "BUT must NOT describe a query as 'causing' conversions". **FR-11**: Step 2.8 and Phase 2B surfaces. **FR-13**: scenario, command half. **NFR-2**. **NFR-6** (prerequisites: MCP without `--allow-write`) |
| Design refs | §7 rows `:11`, Prerequisites, Tool Inventory, Phase 0, Phase 2 bullets, Step 2.8, Phase 2B; §5.1 disclosure; §5.2; §6; DD-2, DD-4…DD-7, DD-9…DD-13; P-1, P-24, P-25 |
| Scope | `.claude/commands/akili-seo.md`, 7 sites: `:11`; Prerequisites items 6–7 and the `:57` rescope to items 1–5; Tool Inventory (+4 rows); Phase 0 item 5; Phase 2 skill bullets (+1); Step 2.8 *Do not raise* (`:228-229`); **Phase 2B** (≤ 70 lines). Line budget: design §7 (≤ +97 for these sites). Tests: the command-A group |
| Tests | 24 assertions. FR-1: declined state in Phase 0, "asked once", Phase 2B position after Step 2.8 and before Phase 3, `:57` scoped to items 1–5 (4). FR-2: static-fetch rule in 2B.1, `obtain:` suffix (2). FR-3: measurement-ID consistency, no ms claim (2). FR-4: `not legal advice`, `Other jurisdictions: not audited` (2). FR-5: intercepted click, test-traffic disclosure (2). FR-6: no Admin link resource, probe, evidence suffix (3). FR-8: skip string, "exactly one" Low (2). FR-13 (1). FR-11: Step 2.8 both halves (2), Phase 2B both halves (2). NFR-2 (1). NFR-6: `--allow-write` prohibition (1) |

| Verification | Value |
|---|---|
| Command | `node --test test/seo-analytics.test.js` · `npm test` · `wc -l .claude/commands/akili-seo.md` (≤ 419 after T2, leaving T3 its +16 under 440 per design §7; quote the figure) · **clause walk:** every clause in *Requirements* quoted against the shipped sentence in `execution.md` (KZ-changes--gate-falsifiability-2) · **opt-out walk:** read Phases 1–5 as a declined run and confirm that no new sentence runs or reports analytics (P-25 readers) |
| Red run | Baseline counts `0` for `Phase 2B`, `declined at Phase 0`, `not legal advice`, `Other jurisdictions: not audited`, `measurement ID` (executed 2026-10-22); `:57` unscoped. Each new assertion is quoted red on its message before the edit |
| Falsifier | (1) Restore `:57` to "If any prerequisite is missing, stop" → the scope assertion goes red. (2) Move the Phase 2B heading above Step 2.8 → the position assertion goes red. (3) Delete "from a static fetch alone" → the FR-2 assertion goes red. (4) Delete "exactly one" → the FR-8 assertion goes red. (5) Delete "conversion and UX" from Step 2.8 → the FR-11 (b) assertion goes red. (6) Delete `--allow-write` from the prerequisites → the NFR-6 assertion goes red. Each one is executed post-change, its red quoted, then reverted |
| Disqualifier | A position assertion that matches the string "Phase 2B" anywhere passes on a mention in Phase 0. Anchor it on the `### Phase 2B` heading index. A whole-file match for FR-11 cannot detect a surface losing its clause. Run-time compliance (the agent actually skipping when declined) has no automated check (requirements §8); the opt-out walk is the substitute |
| Consumers | none in tests (P-16). Readers of the changed text: P-25 list (all new) |
| Done | Clause walk PASS. Opt-out walk recorded. Tests green. Falsifiers 1–6 quoted. Line count quoted |

---

### T3 — Command part B: report, Phase 4/5, checklist, Error Handling (+ tests)

| Field | Value |
|---|---|
| Status | `[x]` |
| Depends on | T2 |
| Requirements | **FR-12**: sections 11–13 and their contents (findings, skip note, or `not run — declined at Phase 0`); the Measurement & Compliance group; the Implementation Prompt covering High analytics findings; scenario "BUT neither displaces the other's position". **FR-11**: checklist surface, both halves, `:303` rewritten with the behavior-metric list. FR-1, FR-4, FR-10 and FR-13 checklist items. FR-2, FR-6 and FR-9 Error Handling rows (GA4 403; Clarity 400/401/403/429; probe error → `not determined`). Phase 5 summary (FR-12). NFR-2 |
| Design refs | §5.1; §7 rows Phase 3, Phase 4, Phase 5, Verification Checklist, Error Handling; DD-8 |
| Scope | `.claude/commands/akili-seo.md`, 5 sites: the Phase 3 report list (insert 11–13, renumber to 14–15, group in 14); Phase 4 (+1); Phase 5 (+1); Verification Checklist (`:303` rewritten, +4 items); Error Handling (+5). Tests: the command-B group |
| Tests | 6 assertions: items 11–15 in order (1); "Measurement & Compliance" in item 14 and in Phase 4 (2); checklist both halves (2); NFR-2 final ≤ 440 (1, the shared assertion from T2 re-run) |

| Verification | Value |
|---|---|
| Command | `node --test test/seo-analytics.test.js` · `npm test` · `wc -l .claude/commands/akili-seo.md` ≤ 440 (expected ≤ 427) · clause walk in `execution.md` · `grep -n 'Remediation Plan\|Re-audit Schedule' .claude/commands/akili-seo.md` read, and every reference to their numbers updated |
| Red run | Baseline: the report list ends at `12. Re-audit Schedule` (`:252`); `Measurement & Compliance` count `0`; `:303` names only "bounce rate, time on page". Assertions are quoted red before the edit |
| Falsifier | (1) Swap items 12 and 13 → the order assertion goes red. (2) Delete "Measurement & Compliance" from Phase 4 → that assertion goes red. (3) Restore the old `:303` → the checklist assertions go red. Each one is executed post-change, quoted, then reverted |
| Disqualifier | An order assertion matching only the item titles, without their numbers, passes on a renumbering error. Assert `N. Title` pairs |
| Consumers | none in tests. `docs/commands/akili-seo.md` restates the outputs only (P-3), owned by T5 |
| Done | Clause walk PASS. Tests green. Falsifiers quoted. Final line count quoted |

---

### T4 — `SKILL.md` (+ tests)

| Field | Value |
|---|---|
| Status | `[x]` |
| Depends on | T1 |
| Requirements | **FR-11**: three skill surfaces (User Engagement Signals, Do not raise these, the new Analytics section), both halves each, and the full Glossary metric list in User Engagement Signals. **FR-14**: `:618` rewritten (`analytics` points at the new section; `programmatic-seo`, `cro` stay not packaged), References list, Tools Referenced, a Phase 2B row in AKILI-SPECS Integration. **FR-4**: the Analytics section says "not legal advice". **NFR-3** |
| Design refs | §9.2; P-2 |
| Scope | `.claude/skills/seo-audit/SKILL.md`, 6 sites: `:412-431` (heading anchor kept; paragraph, positive sentence and table row); the `:491` bullet; new `## Analytics & Conversion Measurement (optional)` after GEO (`:435`) and before `## Common Issues by Site Type` (`:495`), ≤ 15 lines; References (`:568`); Tools Referenced (`:576`); AKILI-SPECS Integration (`:606`, `:618`). Tests: the skill group |
| Tests | 15 assertions: FR-11 three surfaces × 2 (6); metric coverage in User Engagement Signals (8); NFR-3 ≤ 658 lines (1) |

| Verification | Value |
|---|---|
| Command | `node --test test/seo-analytics.test.js` · `npm test` · `wc -l .claude/skills/seo-audit/SKILL.md` ≤ 658 · `grep -n 'not packaged' .claude/skills/seo-audit/SKILL.md` read · frontmatter unchanged (`git diff -U0 84765ff -- .claude/skills/seo-audit/SKILL.md` shows no hunk in lines 1–12) · clause walk |
| Red run | Baseline: `heatmap` `0`, `behavior metric` `0`, `conversion and UX` `0` in `SKILL.md`; `:618` names `analytics` as not packaged. Assertions are quoted red before the edit |
| Falsifier | (1) Delete "never" from User Engagement Signals → its (a) assertion goes red. (2) Restore the old `:491` bullet → its (b) assertion goes red. (3) Delete `rage click` from the list → that coverage assertion goes red. Executed, quoted, reverted |
| Disqualifier | A section extractor that stops at the next `###` will read User Engagement Signals correctly. One that stops at the next `##` reads into GEO and passes on GEO's words. Assert the extracted section does not contain `## Generative` |
| Consumers | `test/fixtures/doctor-codex-baseline.txt:42` (skill name only; unaffected, P-16) |
| Done | Clause walk PASS. Tests green. Falsifiers quoted. Line count quoted. Frontmatter untouched |

---

### T5 — Docs, README, evals (+ docs test)

| Field | Value |
|---|---|
| Status | `[x]` |
| Depends on | T2, T3, T4 |
| Requirements | **FR-14**: `docs/commands/akili-seo.md` (prerequisites, outputs, audit areas, skills: Phase 2B described), `docs/skills/seo-audit.md` (`:26` Core Rules widened with both halves; purpose and references mention analytics), `docs/skills/README.md:36`, `README.md:801`, `evals.json` (ids 10 and 11 added; case 9 at `:139` widened from "engagement metrics" to behavior metrics). **FR-11**: the docs surface, both halves |
| Design refs | §2; §4; P-2; P-3 |
| Scope | The five files above. `docs/skills/seo-audit.md:9` (history line) stays. Every other P-3 hit stays true and is not edited |
| Tests | 2 assertions: `docs/skills/seo-audit.md` *Core Rules* both halves. `evals.json` parses as JSON with ids 1–11 unique (1 more assertion, so 3 in total) |

| Verification | Value |
|---|---|
| Command | `node --test test/seo-analytics.test.js` · `npm test` · `node -e "JSON.parse(require('fs').readFileSync('.claude/skills/seo-audit/evals/evals.json','utf8'))"` · `grep -c -i analytics docs/skills/README.md` ≥ 1 (baseline `0`) · re-run the P-3 grep and confirm each hit is still true |
| Red run | Baseline: `docs/skills/seo-audit.md` `conversion and UX` `0`; `evals.json` has 9 ids. Quoted red before the edit |
| Falsifier | (1) Delete the conversion/UX half from `:26` → red. (2) Duplicate id 10 → the uniqueness assertion goes red. Executed, quoted, reverted |
| Disqualifier | The eval cases are not run by CI (P-19). Their presence proves nothing about agent behavior (requirements §8, accepted risk) |
| Consumers | P-3 list (README, docs). No test reads these docs today (P-16) |
| Done | Tests green. JSON valid. P-3 re-check recorded |

---

### T6 — CHANGELOG, full verification, sweeps, falsification

| Field | Value |
|---|---|
| Status | `[ ]` |
| Depends on | T5 |
| Requirements | **FR-14** (CHANGELOG scenario: every clause quote-checked against HEAD). **FR-11** scenario: "falsified by deleting the clause from one surface (red), then restoring it (green)". **NFR-1**, **NFR-5**. Requirements §8: phrase-family sweep, spec-path grep |
| Design refs | §9.3 falsification; §11 |
| Scope | `CHANGELOG.md` `[Unreleased]` (replace "No unreleased changes yet."): one entry, release class **minor** noted. Then the closing checks below. No other file changes; a failure goes back to its owning task as rework |
| Tests | none new. The full suite runs. The assertion total is re-counted and quoted against design §9.3's ~67 (KZ-002: re-run counts after every phase) |

| Verification | Value |
|---|---|
| Command | `npm test` (count quoted) · `npm run verify:cli` · `npm run pack:dry-run` (confirm `references/analytics.md` is listed) · `git diff --check` · `git diff --stat 84765ff -- bin package.json scripts docs/model-routing.md .claude/templates` → empty (NFR-1) · **phrase-family sweep** keyed on the obligation (KZ-changes--kaizen-loop-closure-2): `grep -rn -i -E 'bounce|engagement (rate|metric)|time on page|heatmap|recording|rank' .claude/commands/akili-seo.md .claude/skills/seo-audit docs/commands/akili-seo.md docs/skills/seo-audit.md docs/skills/README.md README.md`, every hit read and dispositioned · `grep -rn 'docs/specs/changes/seo-analytics' . --include=*.md --include=*.js --include=*.json \| grep -v '^./docs/specs/'` → 0 (KZ-changes--archify-diagrams-1) · **FR-11 falsification:** for each of the 8 surfaces in turn, delete its prohibition in a scratch copy and observe the named assertion red, then restore and see green (8 reds quoted in `execution.md`) · CHANGELOG quote-check: every clause beside the shipped line it describes, at HEAD |
| Red run | n/a: no new assertions. The FR-11 falsification is this task's red evidence |
| Falsifier | A CHANGELOG clause naming a section, count or file that is not at HEAD fails the quote-check (KZ-002). The sweep fails on any hit that asserts a ranking effect |
| Disqualifier | A green suite on Node 25 is not CI evidence for Node 18/22 (`UNVERIFIED`; the user's first push is the check). A sweep that greps only literal strings misses paraphrases; read every hit of the family pattern |
| Consumers | n/a |
| Done | All four verification commands green and quoted. NFR-1 diff empty. Sweep dispositioned. 8 falsification reds quoted. CHANGELOG quote-check PASS. Assertion total quoted |

---

## 3. Coverage — scenario and clause level

| Requirement clause | Owner |
|---|---|
| FR-1 S1 (declined state; BUT never asked again; MUST complete Phases 1–5 unchanged) · S2 (lists missing prerequisites only; MUST NOT block) | T2 (+T3 Phase 5 state) |
| FR-2 table · GTM S (BUT no static-fetch verdict) · partial S (MUST name prerequisite + how to obtain) | T2 (command), T1 (reference §3–4) |
| FR-3 four bullets · S (BUT no ms/score; MUST tier magnitudes) | T2, T1 |
| FR-4 table rows 1–5 · not legal advice · other jurisdictions · S1 (BUT no "violates"; MUST name rule + tier) · S2 (MUST list missing parameters) | T1 (legal table, sources), T2 (command), T3 (checklist item), T4 (skill: not legal advice) |
| FR-5 S1 (no-event finding; not-key-event finding; BUT no real submission) · S2 (n/a string) | T2, T1 |
| FR-6 probe order · S (no Admin link resource; MUST record evidence) | T2, T1 |
| FR-7 three bullets · S (MUST note inputs masked) | T2, T1 |
| FR-8 skip note · S (one Low; BUT not more than one; MUST NOT without conversion action) | T2 |
| FR-9 GA4 + Clarity reads · quota S (MUST state window) · behavior S (BUT no ranking) | T2, T1 |
| FR-10 join · S (normalize, unmatched listed; MUST print caveats; BUT no causal wording) | T2, T1, T3 (checklist item) |
| FR-11 (a) + (b) per surface · metric coverage · S (test fails per surface; MUST be falsified red then green) | T1 (ref §2), T2 (2.8, 2B), T3 (checklist), T4 (3 skill surfaces), T5 (docs), T6 (falsification) |
| FR-12 sections 11–13 · group (D-1) · Implementation Prompt · S (BUT neither displaces) | T3 |
| FR-13 · S (token absent; MUST only in headers) | T2, T1, T3 (checklist item) |
| FR-14 docs, `:618`, evals · CHANGELOG S | T4 (`:618`), T5 (docs, evals), T6 (CHANGELOG) |
| NFR-1 | T6 |
| NFR-2 | T2, T3 |
| NFR-3 | T4 |
| NFR-4 | T1 |
| NFR-5 | T6 |
| NFR-6 | T2 (prerequisites), T1 (reference §3) |

Assertion plan: T1 17 + T2 24 + T3 6 + T4 15 + T5 3 = **65**, against design §9.3's ~67. The design counted the three Ley 1581 articles and the four Consent Mode parameters as 7 single assertions; T1 groups them into 2 (−5). T2 adds the NFR-6 `--allow-write` assertion (+1) and T5 the JSON-uniqueness check (+1); the remaining +1 is T3's re-run of the shared NFR-2 cap. Every match the design listed is still asserted. T6 re-counts at HEAD.

## 4. Estimate and PR strategy

- **LOC:** ~790 (reference ~220, command ~105, `SKILL.md` ~35, docs/README/evals ~65, test ~350, CHANGELOG ~15).
- **PR:** **one PR** `feat/seo-analytics` → `dev` (the user opens it; no push in this cycle). It is over 400 LOC, but ~350 of that is one test file and ~220 one new reference. Suggested review order in the PR description: `references/analytics.md` → command → `SKILL.md` → test → docs.
