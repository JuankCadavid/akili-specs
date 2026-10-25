# Test Report: `changes/docs-overview`

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-overview` |
| Date | 2026-10-24 |
| Leader | Claude Code, `claude-opus-5-5` (T1) |
| Tester | `general-purpose` subagent on `opus`, a different model from the Implementer (`sonnet`): author ≠ tester |
| Base | branch `JuankCadavid/docs-overview` at `54f75d2` + the new test file |
| Runtime | Node v22.12.0, darwin |

## 2. Summary

**Status: PASS.** `npm test` → `# tests 844`, `# pass 844`, `# fail 0`. There are no product bugs. Every FR has either a machine check or a recorded human-judgment gap (§9).

| Item | Value |
|---|---|
| Suites | 1 delegated (doc-contract gap suite) + existing suites cited |
| Testers spawned | 1 (Standard depth, one substantial suite; nothing run inline) |
| New tests | 19 in `test/docs-overview-contract.test.js` |
| Author tests cited, not rewritten | `test/docs-overview.test.js` (13, T8 TDD); the four suites re-targeted at T5 |
| Mutations | 30 run by the Tester on a scratch copy; every one went red on its assertion, none on setup |
| Skills | `tdd` (Tester) |
| Lookup notes | The test header cites requirements.md "at spec commit 23baa72" as the source of its literals. That is a comment only; the file reads nothing under `docs/specs/` (KZ-changes--archify-diagrams-1) |

## 3. Backend Unit Tests

n/a. The spec changes no code. `bin/routing.js` is read only for the FR-14 fact `HOST_KEYS`.

## 4. Frontend Unit Tests

n/a. There is no UI.

## 5. Integration Tests (doc-contract, node:test)

| Command | Result |
|---|---|
| `node --test test/docs-overview-contract.test.js` | `# tests 19`, `# pass 19`, `# fail 0` |
| `node --test test/docs-overview.test.js` | 13 pass, 0 fail |
| `npm test` | `# tests 844`, `# pass 844`, `# fail 0` (825 before this phase, plus 19) |

**Mutation evidence: one red per FR, quoted from the Tester report.**

| FR | Mutation → red message |
|---|---|
| FR-3 | `opening paragraph has 4 sentences, expected <= 3` |
| FR-4 | `figure <img> has no alt text` |
| FR-5 | `## Install has Grok-specific instructions: … (run \`npx akili-specs install --tool grokbot\`)` |
| FR-6 | `## Your first spec contains a fenced block (sample document)` |
| FR-7 | `group label rows are ["**Every change**","**Anytime**"]`; `terminal rows are [… "routing","notifications"]` |
| FR-9 | `Supercharge heading present: ### Supercharge your AI assistant` |
| FR-13 | `akili-audit row links commands/akili-audits.md` |
| FR-14 | `bin/routing.js HOST_KEYS includes Grok: …, grokbot`; `a Grok Bot line makes a positive routing claim` |
| FR-17 | `## Roadmap has 2 bullets, expected 3`; `table 3 is labelled "x", expected **Conditional…**`; `links the dead anchor: cli.md#grok-bot-grokbot`; `## [Unreleased] still has the placeholder`; `## Dotfiles heading present` |
| NFR-5 | `docs/flow.md NFR-5: references docs/specs/changes/docs-overview` |
| NFR-6 | `files entry would ship dotfiles/: dotfiles` |

## 6. E2E Tests

n/a. There is no user journey to automate. Rendering on GitHub (anchors P-13, P-14) is checked in the PR preview (§9).

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|
| FR-1 | Heading list, levels, no other headings, fence-aware | doc-contract | `docs-overview.test.js` (e) | PASS | Author (T8) |
| FR-2 | ≤ 200 lines, install ≤ 90, no `<details>` | doc-contract | `docs-overview.test.js` (f) | PASS | No packed lines: human gap (§9) |
| FR-3 | ≤ 3 sentences; marketing named; 5 bullets + overview link; 4 glossary rows | doc-contract | `docs-overview-contract.test.js` FR-3; `docs-overview.test.js` (j) | PASS | BUT "no unshipped capability": human gap |
| FR-4 | Figure kept, centered, linked; alt text present; old jargon gone | doc-contract | `docs-overview-contract.test.js` FR-4; (j) | PASS | `assets/` untouched: NFR-3 diff-stat (T9) |
| FR-5 | One install, one check, `docs/cli.md` link; BUT no tables / per-tool doctor; Grok Bot only named | doc-contract | `docs-overview-contract.test.js` FR-5; (j) | PASS | — |
| FR-6 | 5 steps; quick and resume lines; `#practical-example` resolves; BUT no sample document | doc-contract | `docs-overview-contract.test.js` FR-6; (i) | PASS | Effect wording: human gap |
| FR-7 | New command fails; links exist; 2 groups; Windows note; 8 CLI rows | doc-contract | (b), (i); `docs-overview-contract.test.js` FR-7 ×2 | PASS | BUT "no claim the page lacks": T6 Reviewer quote-check |
| FR-8 | Targets exist; overview first | doc-contract | (i), (j) | PASS | — |
| FR-9 | 3 shields; tools + OS line; BUT no `### Supercharge` | doc-contract | (j); `docs-overview-contract.test.js` FR-9 | PASS | — |
| FR-10 | Unexplained `harness` fails; banned `Reviewer` fails; whole word, plural, case-insensitive | doc-contract | (g) | PASS | Author mutations at T8 |
| FR-11 | Skill added; two groups; wrong binding; row membership; Grok cells + code check | doc-contract | (a), (h) | PASS | — |
| FR-12 | Practical Example in flow; link resolves; BUT no heading-only "already in" | doc-contract + review | (i); T1–T6 Reviewer walks of the move ledger | PASS | Ledger completeness: human gap (the ledger is a spec artifact a shipped test must not read) |
| FR-13 | First link overview; governance in both; anytime table command · use it to · link | doc-contract | (j); `docs-overview-contract.test.js` FR-13 | PASS | The link column was found missing at T7 review; now tested |
| FR-14 | One line; BUT no behavior `bin/routing.js` lacks | doc-contract | (j); `docs-overview-contract.test.js` FR-14 | PASS | Covers the host list and wrappers only |
| FR-15 | README guards fail; overview slug / Archify / marketing removal fails; no regex change; only S1–S4 | doc-contract | `akili-security-docs`, `branching-flow`, `diagram-design`, `akili-marketing-docs` | PASS | 6 mutations at T5, 9 by the T5 Reviewer |
| FR-16 | (a)–(j); marketing lands; stale `12 commands` fails | doc-contract | `docs-overview.test.js` | PASS | 17 mutations by the T8 Reviewer |
| FR-17 | Roadmap, dotfiles, CONTRIBUTING, cli prerequisites and local install, Grok anchor, governance item 5, diagram-design pointer, CHANGELOG; release-flow scenario; BUT no Dotfiles/nvim | doc-contract | `docs-overview-contract.test.js` FR-17 ×6 + BUT | PASS | `SKILL.md:76` accepted Low risk (out of scope) |
| NFR-1 | All four commands pass | command | `npm test`, `verify:cli`, `pack:dry-run`, `git diff --check` | PASS | Run at T9 and again here (`npm test`) |
| NFR-2 | English only | grep + review | per-task NFR-2 grep; Reviewers | PASS | Heuristic |
| NFR-3 | No `.claude`/`bin`/`package.json`/`assets` change | command | `git diff --stat dbc9275 -- …` (T9) | PASS | Not a shipped test: `dbc9275` stops being an ancestor after merge |
| NFR-4 | Commit prefix | command | `git log … \| grep -vc` → 0 (T9) | PASS | — |
| NFR-5 | No active-spec link in shipped docs | doc-contract | `docs-overview-contract.test.js` NFR-5 | PASS | — |
| NFR-6 | `dotfiles/` not shipped | doc-contract + command | `docs-overview-contract.test.js` NFR-6; `pack:dry-run` (T9) | PASS | — |

## 8. Remediation

None. Every suite passes and there are no product bugs.

## 9. Accepted Gaps

| Gap | Why it is not automated | Covered by |
|---|---|---|
| Plain language (FR-3, FR-4 alt text) and packed lines (FR-2 AND IT MUST) | Plainness is a judgment. A sentence count can be gamed by packing | T6 Reviewer's whole-README reading (PASS); PR review |
| FR-3 BUT (no unshipped capability), FR-7 BUT (no claim the page lacks), FR-6 effect wording | Meaning-level quote-checks | T4/T6 Reviewer quote-checks (KZ-002) |
| FR-12 ledger completeness | The move ledger lives in the spec folder, which `/akili-archive` moves, so a shipped test must not read it | T1–T6 Reviewer walks; the ledger is fully quoted |
| P-13/P-14 rendered anchors (`#practical-example`, `#grok-bot---tool-grokbot`) | The in-test slugger applies GitHub's rule, but no rendered page was fetched | PR preview (the user) |
| NFR-3 scope diff | It is pinned to the base commit `dbc9275` | Task verification at T9 |
