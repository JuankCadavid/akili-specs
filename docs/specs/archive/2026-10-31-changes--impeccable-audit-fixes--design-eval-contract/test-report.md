# Test Report: Close the design-evaluation gaps found in the 2.40.0 audit

**Overall: PASS.** Every SHALL, THEN, `BUT it must NOT` and `AND IT MUST` clause in FR-1 to FR-16, and every NFR, has test evidence or a recorded manual check. No product defect was found. `npm test` passes 1315 of 1315.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-contract` |
| Date | 2026-10-31 |
| Tested at | `0a006aa` (execution complete) plus the new, uncommitted `test/design-eval-contract-coverage.test.js` |
| Approval Mode | `gated` in the spec. JC mandate for this run: take the recommended option at each gate; local commits only |
| Leader | Claude Opus 5.5 (T1) |
| Tester | `opus`, one spawn. The Implementer model was `sonnet` (no escalations recorded in `execution.md`), so author ≠ tester holds |

## 2. Summary

| Measure | Value |
|---|---|
| Suites planned | 1: integration, as text contracts over the shipped rules text. There is no code, no UI and no E2E in this spec |
| Testers spawned | 1, delegated (not inline), not parallel |
| Author tests cited | 72 in `test/design-eval-contract.test.js`, written red→green with executed mutations during `/akili-execute` |
| New tests (Tester) | 10 in `test/design-eval-contract-coverage.test.js`: 9 clause tests and 1 guard |
| Coverage gaps found | 9. All were missing tests; the shipped text was complete. All 9 are closed |
| Product bugs | 0 |
| Manual checks | FR-15 (`upstream-request.md` is not shipped, per DD-10); FR-16 `docs/skills/impeccable.md` (it has no restatement site) |
| Tester inner loop | 1 of 3 attempts used. The first guard contained the literal it forbids; it was rebuilt from fragments. This was a test defect, not a product defect |
| Lookup note | The TRD and UX/UI reference sections were `none`: the repository has neither, and the spec has no UI |
| Skills | `tdd` (Tester). The design-detector suite is not applicable, because the repository has no UI to scan |

## 3. Backend Unit Tests

Not applicable. The spec changes rules text and tests only; there is no backend code.

## 4. Frontend Unit Tests

Not applicable. There is no UI in this repository.

## 5. Integration Tests (text contracts)

| Command | Result |
|---|---|
| `npm test` | `# tests 1315 / # pass 1315 / # fail 0` (1305 after execute, plus 10) |
| `node --test test/design-eval-contract.test.js test/design-eval-contract-coverage.test.js test/impeccable-bridge.test.js test/impeccable-vendor.test.js` | 115 / 115 pass |
| `git diff --stat -- .claude/skills/impeccable/` | empty (NFR-1) |
| `npm run verify:cli` | exit 0, "14 commands \| 31 skills \| 8 resources (akili-specs v2.40.0)" |
| `npm run pack:dry-run` | exit 0, 407 files |
| `git diff --check` | clean |

**New tests and their executed reds.** Each shipped sentence was edited, the test was run (fail=1), and the file was restored with `git checkout -- <file>`.

| Test | Shipped edit | Failure message |
|---|---|---|
| FR-3: without automation, every first-visit viewport reads `Unevaluated (no browser automation)` | Bridge: "at every first-visit viewport" changed to "at the two scan-matrix viewports" | `missing: read \`Unevaluated (no browser automation)\` at every first-visit viewport` |
| FR-4: `CTA not visible` also applies to a zero-size box | Bridge: ", or its box has zero size" removed | `missing: (b) computed style hides it, or its box has zero size: …` |
| FR-12: more screens only on request | Reference: " More screens only on request." removed | `missing: More screens only on request.` |
| FR-13 (THEN): `Report location: <path> (directed by <who>)` | Template: " (directed by <who>)" removed | `missing: - **Report location:** default \| <path> (directed by <who>)` |
| FR-13 (BUT): no copy under the audits folder | E6 changed to "written at that path and copied under the default" | `missing: A user-directed path replaces the default; the report is written once, …` |
| FR-16: the CHANGELOG counts 14 gaps | "14 gaps" changed to "15 gaps" | `missing: address 14 gaps found in the first \`/akili-audit design\` run on 2.40.0` |
| FR-16: the bridge doc restates the first-visit priority | The waiver clause weakened to "unless a waiver covers it" | `missing: \`covered\` and \`below fold\` are a P1 … unless a \`first-visit\` waiver covers that screen …` |
| FR-16: the `/akili-audit` doc restates the user-directed path | ", or the user-directed path," removed | `missing: , or the user-directed path,` |
| NFR-3: nothing installs without a yes, in every approval mode | Bridge: ", in every approval mode" removed | `missing: Nothing downloads or installs the engine, Lighthouse or a browser without an explicit yes, in every approval mode.` |

The new file reads nothing under the spec folder. Its guard test asserts that the file contains no spec-folder path and no spec path (KZ-changes--archify-diagrams-1).

## 6. E2E Tests

Not applicable. The behaviour these rules govern runs in projects that install AKILI. Whether an agent can follow the rules is checked by the `/akili-validate` walkthrough (see Accepted Gaps).

## 7. Coverage & Traceability

"Author" means `test/design-eval-contract.test.js` (`/akili-execute`). "New" means `test/design-eval-contract-coverage.test.js` (this run).

| Requirement | Clauses | Test type | Evidence | Result |
|---|---|---|---|---|
| FR-1 | 4 SHALL bullets; THEN; BUT; AND IT MUST | Text contract | Author: 8 tests (the pin, isolation note, exclusion, inside-home, one-call home change, inline prefix, BUT, AND) | PASS |
| FR-2 | 3 SHALL bullets; the modified copy leads; THEN; BUT; AND IT MUST | Text contract | Author: 7 tests (hash rule, values, Copy/Home, any copy, other copies, BUT, AND) plus the template `Home:` line | PASS |
| FR-3 | `WxH`/`incomplete`; two passes; short-height pair; no-automation reading; validate fold check; THEN; BUT; AND IT MUST | Text contract | Author: 6 tests. New: no-automation at every first-visit viewport | PASS |
| FR-4 | CTA order; measurement; five outcomes; the zero-size case; P1/FAIL plus waiver; THEN; BUT; AND IT MUST | Text contract | Author: 7 tests. New: the zero-size box | PASS |
| FR-5 | 3 SHALL bullets; THEN; BUT; AND IT MUST | Text contract | Author: 5 tests | PASS |
| FR-6 | Mapping; one P1; priority note; BUT no P0 | Text contract | Author: 3 tests | PASS |
| FR-7 | Suppressed list; isolation; inline placement; THEN; BUT; AND IT MUST | Text contract | Author: 4 tests | PASS |
| FR-8 | Brief items; parent compare; BUT | Text contract | Author: 3 tests | PASS |
| FR-9 | `npm ci` conditions; run validity; BUT; AND IT MUST; failure state | Text contract | Author: 4 tests | PASS |
| FR-10 | Load and dev servers; BUT `none` | Text contract | Author: 2 tests | PASS |
| FR-11 | Clause IDs; waiver citation; E1 routing; `§ l.` fallback; BUT nothing written | Text contract | Author: 4 tests | PASS |
| FR-12 | Template coverage; more screens only on request; BUT field never empty | Text contract | Author: 2 tests. New: on request | PASS |
| FR-13 | Step 5 and checklist accept E6; THEN; BUT no copy | Text contract | Author: 2 tests and FR-16 pattern 7. New: THEN, BUT | PASS |
| FR-14 | Value; closed list; never P1–P3; exit `2` reading; BUT `low-contrast`; AND evidence | Text contract | Author: 6 tests | PASS |
| FR-15 | Three reproducible items; draft, not filed | Manual (DD-10: not shipped) | `upstream-request.md`: title "DRAFT, not filed", "Nothing has been filed"; sections M1, M5b and M14 each have Repro, Observed vs Expected, Citation and Proposed fix. M5b and M14 mark their observed behaviour `UNVERIFIED` | PASS |
| FR-16 | Restatements match; retired phrases gone; CHANGELOG count | Text contract and manual | Author: sweep patterns 1–7 and walker reach. New: CHANGELOG, bridge doc, audit doc. Manual: `docs/skills/impeccable.md` has no restatement site | PASS |
| NFR-1 | No vendored byte changes | Test and command | `impeccable-vendor.test.js`; the vendored diff is empty | PASS |
| NFR-2 | Single owner; no bridge strings in commands | Text contract | `impeccable-bridge.test.js` (commands carry no bridge strings) | PASS |
| NFR-3 | No install without consent, in any mode | Text contract | Author: FR-9 consent tests. New: NFR-3 | PASS |
| NFR-4 | One assertion per clause, each shown red | Process | Author mutations recorded in `execution.md`; new reds in §5 | PASS |
| NFR-5 | `npm test`, `verify:cli`, `pack:dry-run`, `diff --check` | Commands | §5 | PASS |

## 8. Remediation

None needed. No test failed and no product defect was found.

## 9. Accepted Gaps

| Gap | Why it is not automated | Where it is covered |
|---|---|---|
| Whether an agent can follow the rules and reach the intended verdict (requirements §7, *Defect classes*) | No automated check exists for agent behaviour on rules text | `/akili-validate`: a walkthrough of the 2.40.0 audit scenarios against the shipped text, plus one held-out case, at the HITL pause |
| P-16: the CTA order picks the hero CTA on a real Persuade page | It needs a live page (`akili.com.co /es/`), and its owner is JC | `/akili-validate` HITL walkthrough |
| M5b custom-banner behaviour and the M14 96-hit count in `upstream-request.md` | They need a fixture scan with the engine; the draft marks them `UNVERIFIED` | Upstream filing (JC), outside this spec |
