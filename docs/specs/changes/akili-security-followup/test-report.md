# Test Report: `/akili-security` follow-up — pin literal, five safety advisories, Windows decision

**Overall: PASS** — 408/408 `npm test` (Node 22); both spec suites green on Node 18, 20 and 22; 0 product bugs; 9/9 mutations of the new doc tests went red. Gaps are the accepted ones (run-time adherence, Windows CI legs before push) plus three minor, recorded below.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security-followup` |
| Depth | Standard (compact) |
| Date | 2026-10-19 |
| Tested at | `4e566ba` + new `test/akili-security-docs.test.js` |
| Leader | Claude Opus 5.5 (session) |
| Tester | 1 subagent, `opus` (Implementer was `sonnet`: author ≠ tester), effort high |
| Persona | `.agents/tester.md` (no Step 8E wrapper; read by the Tester by pointer) |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 2 — (1) author TDD text-contract tests, cited not rewritten; (2) new doc-restatement contract |
| Testers spawned | 1 (sequential; both suites share the doc/command files) |
| Inline | Leader non-author re-run of suite 2 and `npm test` |
| Tests | 96 author (89 command + 7 skill) · 19 new · 408 total |
| Product bugs | 0 |
| Tester inner loop | 1 test defect (FR-9 negative regex matched the prohibition sentence itself), fixed at attempt 2 |
| Skill/effort deviations | None |
| Lookup note | CodeGraph not used — every file under test is markdown changed by this spec (working tree wins) |

## 3. Backend Unit Tests

Not applicable — no runtime code.

## 4. Frontend Unit Tests

Not applicable — no UI.

## 5. Integration Tests (text contract)

| Command | Node | Result |
|---|---|---|
| `node --test test/akili-security-command.test.js test/security-audit-skill.test.js` | v18.20.8 | `# tests 96 / # pass 96 / # fail 0` |
| same | v20.20.1 | `# tests 96 / # pass 96 / # fail 0` |
| same | v22.12.0 | `# tests 96 / # pass 96 / # fail 0` |
| `node --test test/akili-security-docs.test.js` | v18.20.8 / v20.20.1 / v22.12.0 | `# tests 19 / # pass 19 / # fail 0` each |
| `npm test` (Leader re-run) | v22.12.0 | `# tests 408 / # pass 408 / # fail 0` |
| `git diff --check` | — | exit 0 |
| NFR-2: `git diff --quiet 5c944d0 -- .claude/skills/security-audit ':!*SKILL.md'` | — | exit 0 |
| NFR-2: `git diff -U0 5c944d0 -- …/SKILL.md \| grep '^@@'` | — | one hunk `@@ -207 +207 @@` (below `## AKILI-SPECS Integration` at `:202`) |

**Mutation check of the new tests** (each restored; `git diff --quiet -- <file>` exit 0 after each):

| # | Mutation | Red |
|---|---|---|
| M1 | `docs/flow.md:292` slug → `-s<n>` | `docs/flow.md has no routing slug of the form bugfix/security-<date>-r<N>-s<n>` |
| M2 | drop "and toolchain" in the command doc | `command page dropped, truncated or paraphrased an upstream control …` |
| M3 | README:589 re-adds "or an ignored in-target directory" | `not ok 4 - FR-7 / FR-10 BUT: no restatement keeps an in-target run-directory option` |
| M4 | delete "the command's Step 0.1 pin" | `re-sync pin-update step no longer names "the command's Step 0.1 pin"` |
| M5 | R-B weakened to "sufficient" | `skill doc no longer says the provenance check is necessary but not sufficient` |
| M6 | `git rev-parse HEAD` added to the Preflight row | `docs/commands/akili-security.md tells the agent to run a git command in the target` |
| M7 | drop the destination containment term | `Preflight restatement dropped a containment term …` |
| M8 | drop "sockets" from the exposure rule | `command page lost or altered upstream's exposure rule …` |
| M9 | Windows gate → "one Windows CI leg" | `Windows gate no longer lifts the stop only on both Windows CI legs passing` |

## 6. E2E Tests

Not applicable — the command's run-time behaviour is agent adherence to text (requirements §8: no automated check).

## 7. Coverage & Traceability

`cmd` = `test/akili-security-command.test.js`, `skill` = `test/security-audit-skill.test.js`, `docs` = `test/akili-security-docs.test.js`. Author test titles use the earlier spec's FR ids; mapping is by content.

| Requirement | Scenario / clause | Test | Result | Gap or Notes |
|---|---|---|---|---|
| FR-1 | Stale copy: THEN, BUT (*a* commit), AND (40-char literal) | cmd "FR-1 Stale AKILI copy…", "FR-2 Foreign copy: preflight checks adapted-for…" | PASS | — |
| FR-1 | Pin sites agree: THEN | skill "pin sites agree…" | PASS | Falsified at execute |
| FR-1 | Pin sites agree: AND (re-sync names Step 0.1 pin) | docs "FR-1 Pin sites agree AND…" | PASS | New |
| FR-2 | Offer continue / restore / stop | cmd "FR-2 Foreign copy: the offer is…" | PASS | — |
| FR-2 | Restore offered: THEN, BUT (no `--force`/`npx`), AND (no move without restore) | cmd "FR-2 Restore offered…", "…BUT: never --force…" | PASS | "ask which install owns the root" unpinned (G-3) |
| FR-2 | After restore: THEN, BUT, AND (non-zero) | cmd "FR-2 After restore…" | PASS | — |
| FR-2 | Copy inside the target | cmd "FR-2 Copy inside the target…" | PASS | — |
| FR-2 / FR-10 | Doc restatement: three containment terms, no `--force` | docs ×2 | PASS | New |
| FR-3 | Plan *Skill copy*; index `pinned` / `foreign — continued by <approver>`, no path | cmd ×2 | PASS | — |
| FR-4 | THEN (static-only); AND lead clause; AND four bullets byte for byte; AND exposure rule; BUT no paraphrase | cmd ×4 + Checklist FR-4 | PASS | — |
| FR-4 / FR-10 | Doc control list verbatim; exposure rule; no "all four controls" | docs ×4 | PASS | Lead clause paraphrased in doc (G-4) |
| FR-5 | Mechanism named; none under static-only | cmd "FR-5 Sandboxed run…" | PASS | — |
| FR-6 | Hostile config: BUT no git (whole command), *Target* field, AND `not determined` never clean | cmd ×4 | PASS | "program never runs" is run-time (G-1) |
| FR-6 | Hostile content: `.git` symlink/`gitdir:`, real-path containment, no outside content in metadata/index, hex/charset admission | cmd ×4 | PASS | Per-case (traversal, `packed-refs`, oversize) covered by the generic rules, not one test each (G-5) |
| FR-6 / FR-10 | Docs: no git instruction; ref read without git, dirty asked | docs ×2 | PASS | New |
| FR-7 | `--out` inside: THEN, BUT (ignore rule), AND (repo-relative gone) | cmd ×3 | PASS | — |
| FR-7 | Contains target / HOME inside | cmd "FR-7 Run directory contains the target…" | PASS | — |
| FR-7 / FR-10 | Docs: no in-target option; always outside; two forms | docs ×3 | PASS | New |
| FR-8 | Two runs: THEN, AND (charset/inputs), BUT (no target text) | cmd ×3 | PASS | — |
| FR-8 / FR-10 | Slug restated: every site `-r<N>-s<n>`, every `-s<n>` hit enumerated, no extra suffix | docs ×3 | PASS | New |
| FR-9 | Stop unchanged | cmd "FR-2 Native Windows…" | PASS | — |
| FR-9 | AND candidate branch on both legs; BUT no wrapper/shim/patch; AND not filed by agent | docs ×2 | PASS | Windows CI legs unverified (G-2) |
| FR-10 | R-B necessary-not-sufficient; BUT no "sufficient" claim | docs ×2 | PASS | New |
| FR-10 | CHANGELOG `[Unreleased]` | T5 full-review quote-check (execution.md) | PASS | Not automatable |
| NFR-1 | ≤ 230 lines | cmd "NFR-5: the command stays a thin wrapper" | PASS | 187 lines |
| NFR-2 | Vendored bytes | Manual gate (§5) | PASS | No byte test (judgment J-3) |
| NFR-3 | No `bin/`, `package.json`, routing change | T5 gate (execution.md) | PASS | — |
| NFR-4 | `npm test`, `verify:cli`, `pack:dry-run`, `git diff --check` | §5 + T5 | PASS | — |

## 8. Remediation

None required — no failure, no product bug.

## 9. Accepted Gaps

| ID | Gap | Reason / route |
|---|---|---|
| G-1 | Agent run-time adherence (no git, gates honoured, fsmonitor never runs) | Rules text cannot be machine-enforced — requirements §8, accepted |
| G-2 | Windows CI legs (Node 18/22) | `UNVERIFIED` — no push this cycle; the user's first push is the check (§8) |
| G-3 | FR-2 "asks the user which install owns the root when it is not a known default" has no pinning test | Minor; candidate for the advisory follow-up proposal, not added here |
| G-4 | `docs/commands/akili-security.md:48` paraphrases the lead clause ("providing" vs upstream "that provides") | Not weaker; the command quotes it verbatim and is byte-pinned. Recorded as advisory |
| G-5 | FR-6 hostile-content cases pinned through the generic rules only | The execute fixture walk (a)–(e) plus an independent Reviewer re-walk are the substitute (execution.md T1) |
| G-6 | `docs/skills/security-audit.md:57` points to `docs/specs/changes/akili-security-followup/upstream-request.md`, which moves at archive | Must be repointed by `/akili-archive` |
