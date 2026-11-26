# Test Report: changes/java-springboot-skill

> **Status: PASS.** `npm test` gives **2303 pass, 0 fail** (2292 before this run, plus 11 new acceptance tests). Every automatable clause of FR-2 to FR-9 and NFR-1 to NFR-5 has a passing test. FR-1 is evidence by record. Agent runtime behavior is covered by the T10 walkthrough. No product bugs found.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/java-springboot-skill` |
| Date | 2026-11-26 |
| Branch | `feat/java-springboot-skill` (local only) |
| Approval Mode | Routine gates auto-approved on JC's mandate (2026-11-26): run test → validate → archive, picking the recommended option at process gates; commits local only |
| Leader | Claude Opus 5.5 (session) |
| Tester | `general-purpose` subagent on `opus`, seeded with `.agents/tester.md`. No `akili-tester` wrapper exists; the Implementer model was `sonnet`, so author ≠ tester holds |
| Model Routing registry | none in the repo `AGENTS.md` |

## 2. Summary

| Item | Result |
|---|---|
| Suites | 2: integration (FR-9, Leader inline, commands only) · contract / text (FR-1 to FR-8, NFR; 1 Tester) |
| Testers spawned | 1, sequential (FR-9 ran first, before the spawn, while the tree was quiet) |
| Skills / effort | Tester: `caveman` (report style only) / default. No deviation from defaults |
| Baseline | 2292 / 0 (the execute-time final gate) |
| Final | `npm test` **2303 / 0** · `verify:cli` 0 (14 commands, 38 skills, 1 plugin, 8 resources) · `pack:dry-run` 0 · `git diff --check` clean |
| Re-run by Leader (non-author) | `node --test test/java-springboot-acceptance.test.js` 11 / 0; `npm test` 2303 / 0; `git diff --check` clean |
| New file | `test/java-springboot-acceptance.test.js` (11 tests; reads no `docs/specs/`, runs no git) |
| Product bugs | 0 |
| Lookup note | The Tester read requirements §6–§8 at the source and did not need design.md, tasks.md or execution.md |

## 3. Backend Unit Tests

Not applicable as a separate suite. The deliverable is methodology text, a vendored skill and one script filter change (`pr-review` `prepare`). That filter is covered by `test/pr-review-scripts.test.js` (author tests, cited in §7).

## 4. Frontend Unit Tests

Not applicable: no UI. The `akili-panel` catalog entry is a data line, covered by `test/akili-panel-flow.test.js` and `akili-panel-catalog`.

## 5. Integration Tests (FR-9, Leader inline)

These ran in a temporary HOME under the scratchpad, using `node bin/akili.js` explicitly.

| Command | Result |
|---|---|
| `install --tool all --dry-run` | `java-springboot` planned on 7 lines (claude, opencode, antigravity ×3, codex, cursor) |
| `install --tool grokbot --dry-run` | `java-springboot` planned |
| `install --tool all` then `doctor --tool all` | `OK java-springboot` on all 5 targets. All HEALTHY: CLAUDE ok 61; OPENCODE, ANTIGRAVITY, CODEX and CURSOR ok 60 each; missing 0 |
| `git diff --stat cb2416e -- bin/` | empty (FR-9 BUT: no installer code changed) |

Author tests stay green after their count and fixture updates: `install-cursor`, `install-grokbot`, `install-akili-panel`, `fixtures/doctor-codex-baseline.txt`.

## 6. E2E Tests

Not applicable. The §8 defect class "an agent misapplies the table at runtime" is not automatable. Its substitute is the three-fixture walkthrough recorded in `execution.md` (T10), which also produced the T3 attempt-2 fix. JC's human check of that walkthrough is still open (§9).

## 7. Coverage & Traceability

Short names for the test files:
- JS = `java-springboot-skill`
- SD = `stack-detection`
- SDR = `stack-detection-readers`
- PRS = `pr-review-scripts`
- BSR = `backend-skill-routing`
- ACC = `java-springboot-acceptance` (new in this run)

| Requirement | Scenario / clause | Test type | Test | Result | Gap or notes |
|---|---|---|---|---|---|
| FR-1 | *Hashes match*, *Hash differs* | record | `execution.md` T1 FR-1 record | evidence by record | NFR-4 forbids shipped tests reading the spec folder. The shipped bytes are held by the JS hash tests |
| FR-2 | *Upstream body kept*: THEN hashes | contract | JS › `FR-2: <file> equals its pinned blob SHA` ×6 | PASS | |
| FR-2 | AND appended lines · BUT no upstream line changed | contract | JS › `FR-2 DD-2: the appended lines sit before the closing ---…` (strips the appended lines, then matches the SHA) | PASS | |
| FR-2 | AND IT MUST schema fields | contract | JS › `FR-2: SKILL.md frontmatter carries the schema keys` | PASS | No field is left out |
| FR-2 | *License and notice* | contract | JS › `LICENSE equals its pinned blob SHA`, `.gitattributes declares the tree byte-exact`, `FR-2: NOTICE carries the provenance facts` | PASS | |
| FR-3 | THEN four pools | contract | SD › constitution Step 5, Step 8D, specify fallback, `docs/commands/akili-constitution.md` | PASS | |
| FR-3 | BUT no load-direct | contract | SDR › `no command load-directs java-springboot outside the stack pools` | PASS | |
| FR-4 | *Rows cover every shipped stack* | contract | SD › every stack-specific skill in a row, any-stack method rows, Java Spring markers, React `next`/`react-dom`; ACC › `FR-4 THEN + AND IT MUST: each row names its manifest…` | PASS | |
| FR-4 | *AWS CDK in any language* | contract | SD › `CDK row keyed on cdk.json alone…`; ACC › Java-without-Spring test (Java CDK app reports both rows) | PASS | The `aws-cdk-lib` reason lives in design.md (record) |
| FR-4 | *Java without Spring Boot*: THEN ask · BUT no route | contract | SD › `no-match outcomes and the ask-the-user rule`; ACC › `FR-4 Java without Spring Boot BUT: it never routes java-springboot…` | PASS | |
| FR-4 | *Several manifests* | contract | ACC › `FR-4 Several manifests THEN: every matching row applies…` | PASS | New |
| FR-4 | *Manifests are data*: THEN · AND not read · BUT no build/install/git, one `git show` carve-out | contract | SD › read rules + git carve-out; ACC › `FR-4 Manifests are data THEN + AND + BUT…` | PASS | |
| FR-4 | *No row matches* | contract | SD › no-match outcomes; `requirements.txt is a no-row example…` | PASS | |
| FR-5 | *Constitution* | contract | SD › Step 8D names the table; *Applies To* scoped per row kind; Discovery rows only from the table | PASS | |
| FR-5 | *Constitution project setup*: THEN · BUT never invent | contract | SD › `Constitution run contract names the table's commands column` (incl. `/Do not invent commands/`); ACC › `FR-5 Constitution project setup THEN…` | PASS | |
| FR-5 | *Specify fallback* | contract | SD › fallback applies the table; fallback holds every table skill | PASS | |
| FR-5 | *Propose* | contract | SD › Propose Step 0 applies the table; records unread manifests | PASS | |
| FR-5 | *Audit*: THEN drift both ways · BUT report-only | contract | SD › `Audit applies the table and reports Skill Map drift both ways, report-only` | PASS | Text contract |
| FR-5 | *Review filters*: THEN sensitive | unit (script) | PRS › IaC manifests sensitive; Gradle version catalog sensitive | PASS | |
| FR-5 | AND IT MUST parity | unit + contract | PRS › `FR-5 parity…` (script side); ACC › `FR-5 Review filters AND IT MUST: large-prs.md and the script hold the same sensitive globs…` | PASS | The doc ↔ script direction was a gap before ACC |
| FR-5 | BUT no other filter change | contract | ACC › `FR-5 Review filters BUT: the change only adds the table's manifest globs…`; PRS tier, chunk and threshold tests still green | PASS | |
| FR-5 | *Stack-aware review* | contract | SDR › S7 ×7 | PASS | |
| FR-5 | *Security reconnaissance*: THEN · AND read rules, no git before Run | contract | SDR › S8 tests | PASS | |
| FR-5 | BUT no vendored edit, no scope narrowing | contract | SDR › `S8 BUT clauses…`; ACC › `FR-5 Security reconnaissance BUT: no vendored security-audit file carries stack-detection text` | PASS | Byte-unchanged checked by hand: `git diff --stat cb2416e HEAD -- .claude/skills/security-audit` is empty |
| FR-5 | *The set is checked* | contract + record | SD › `Readers names the six commands…` (the table's *Unchanged, with reason* list) | PASS (partial automation) | The design.md enumeration is evidence by record |
| FR-6 | *Matrix rows*: THEN · AND row rules · BUT no lead changed | contract | BSR › `implement / Java / Spring Boot has exactly one lead…`, `the java-springboot card must not decide…`, `FR-6 BUT: every pre-existing matrix row keeps…` | PASS | |
| FR-7 | *Page content* | contract | SD › sections match table stack groups; skills equal the governance stack row; any-stack; gsap/impeccable line; ACC › `FR-7 Page content THEN: each stack section's Detected-by line names every manifest…` | PASS | |
| FR-7 | *Linked* | contract | SD › `overview, README Learn more, docs hub and skills README link by-stack` | PASS | |
| FR-8 | *Docs updated*: page facts · rows · governance 16 · AGENTS.md · 38 · CHANGELOG | contract | SD › FR-8 page facts; docs-overview (a)(c)(d); install-akili-panel; akili-panel-flow `Skills (38)`; install-cursor; ACC › `FR-8 THEN: governance lists 16 stack skills…; CHANGELOG has an entry…` | PASS | |
| FR-8 | AND IT MUST sibling note | contract | SD › FR-8 test (names + command); ACC › `FR-8 AND IT MUST: the sibling note says user-installed, optional…` | PASS | |
| FR-8 | BUT no security claim beyond the verdict | contract + review | SD › FR-8 test (no `secure`/`safe` outside "Risk Level SAFE") | PASS | Wording is left to the validate-time quote-check |
| FR-9 | *Every target* | integration | §5 | PASS | |
| NFR-1 | under 50 KB | contract | JS › `NFR-1: folder stays under 50 KB` | PASS | |
| NFR-2 | no sibling files | contract | JS › `NFR-2: no sibling skill folder…`, `FR-2: folder holds exactly 8 files` | PASS | |
| NFR-3 | one definition, no restatement | contract | SD › `NFR-3…` ×3; SDR › no command restates a table marker | PASS | |
| NFR-4 | no spec-folder reads | contract | SDR › `no test file reads this spec's folder…` | PASS | ACC complies |
| NFR-5 | green gates | gate | §2 Final | PASS | |

### Falsifiers (new tests)

All 11 ACC tests went red when their target text was broken, and the bytes were restored exactly afterwards. One example: test #7 went red when `**/auth/**` was removed from the script, and the parity test #6 went red with it, as expected. The anchor guard also fails red on a renamed heading. The inner loop took 2 attempts. Attempt 1 had one test defect: a `.git` skip directory matched the git-command regex. The fix tightened the regex to git commands only. No product defect was found.

## 8. Remediation

None needed. These advisories are recorded only; none of them is a task (scope grows only through approval):
1. **Tautological HEAD test.** `test/stack-detection-readers.test.js` › `the verbatim brief addenda are byte-unchanged vs HEAD` compares against `git show HEAD:`. After a commit it compares the tree to itself, so it only catches uncommitted edits.
2. **Wrong labels.** Tests in the same file under the `P9` prefix are labelled "FR-9" but prove FR-3, NFR-3 and NFR-4.
3. **"Seven" vs "six".** NOTICE and `docs/skills/java-springboot.md` say "seven pinned files", while FR-1/FR-2 say "six" (`LICENSE` is the seventh). This is for the validate quote-check.

## 9. Accepted Gaps

| Gap | Reason |
|---|---|
| FR-1 (both scenarios) | A process record in `execution.md`; NFR-4 forbids shipped tests reading it |
| The design.md halves of FR-4 CDK and FR-5 *set is checked* | They live in the spec folder (NFR-4); the table's *Readers* and *Unchanged* sections stand in |
| How an agent applies the table at runtime (FR-4, FR-5) | Command prose is run by agents. The substitute is the T10 walkthrough; JC's human check of it is still open |
| FR-5 Security: vendored files byte-unchanged | Needs git against a base commit, which shipped tests cannot rely on. Covered by an invariant test plus a manual diff (empty) |
| Overstated doc or CHANGELOG claims | Needs a Reviewer quote-check at HEAD (KZ-002): this belongs to `/akili-validate` |
