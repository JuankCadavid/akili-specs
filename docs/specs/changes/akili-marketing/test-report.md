# Test Report: `changes/akili-marketing`

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-marketing` |
| Date | 2026-10-23 |
| Branch | `JuankCadavid/akili-marketing` (local; not pushed at report time) |
| Leader | Opus 5.5 (T1) |
| Tester | 1 delegated Tester, `opus` (Implementer ran on `sonnet` — author ≠ tester) |
| Status | **PASS** — automated suites 750/750; runtime behaviour (FR-2…FR-11) observed in the T10 dogfood, 12/12 steps as expected (2026-10-24) |

## 2. Summary

**`npm test` → 750 / 750 pass, 0 fail** (Node 22.12.0; Leader re-run). Baseline before this run: 735. This run added 15 tests in two new files.

- Suites: 2 gap suites (integration install, static docs/governance). The author's suites (80 tests) were cited and not rewritten.
- Spawns: 1 Tester, covering both suites sequentially. No suite ran inline. Skills: none beyond the persona. Effort: default.
- Product bugs: **0**.
- Lookup note (Tester): no reference documents beyond the slice. `docs/trd/trd.md` and `docs/ux-ui/design.md` do not exist in this repo: `none`.
- **Incident (test-side, not product):** the Tester's first exploratory `install --tool all` ran without a pinned `HOME`. It created 15 new paths in the user's real home: `akili-marketing` and `social-marketing` under `~/.claude`, `~/.config/opencode`, `~/.agents` and `~/.gemini/…`, all timestamped 2026-10-23 13:25:06. It overwrote nothing: every existing file reported `skip existing`. The content is byte-identical to the package source. The removal was left to the user. Every spawn in the committed tests pins `HOME`, `USERPROFILE`, `CODEX_HOME`, `CURSOR_CONFIG_DIR` and `AKILI_GROKBOT_TARGET`.

## 3. Backend Unit Tests

Not applicable. The change has no code path: no `bin/` diff (NFR-1).

## 4. Frontend Unit Tests

Not applicable. The change has no UI.

## 5. Integration Tests

| Test file | Tests | Result |
|---|---|---|
| `test/social-marketing-install.test.js` (new) | 3 | PASS |
| `test/social-marketing-skill.test.js` (author, cited) | 9 | PASS |
| `test/install-cursor.test.js`, `test/install-grokbot.test.js` (updated counts and doctor fixture in T6) | — | PASS |

Notes:

- **A1** checks 6 host skill roots after `--tool all`: the 12-file set must be present and byte-identical. A discovery cross-check fails if an unnamed skill root appears.
- **A2** checks the command in 5 command dirs and 4 command-as-skill roots, all byte-identical.
- **A3** covers Grok Bot, which is not part of `all`. It runs its own install and checks that no `commands/` dir is written.

## 6. E2E Tests

None automated. The behaviour of the agent running the command cannot be automated (requirements §8). The substitute is **T10**, a dogfood run at a HITL pause.

**T10 observed 2026-10-24: 12/12 steps PASS** in a fresh Claude Code session. The transcript and the three check outputs are recorded verbatim in `t10-dogfood.md`; the per-step verdicts are in `execution.md` → *T10 — Observation*. Final checks, re-run by the Leader:

| Check | Result |
|---|---|
| New commits in the scratch project | none |
| Fake-token grep | exit 1 (no match) |
| Files written | 7, all under `docs/marketing/` |

## 7. Coverage & Traceability

| Requirement | Scenario | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|
| FR-1 | Attribution survives install | Integration | `social-marketing-install.test.js` A1, A3; `social-marketing-skill.test.js` | PASS | — |
| FR-1 | Vendor paths and nudges are stripped | Static | `social-marketing-skill.test.js` | PASS | — |
| FR-1/FR-12 | Command lands on every host | Integration | A2, A3 | PASS | — |
| FR-2 | No or unknown mode; Write boundary | Text contract | `akili-marketing-command.test.js` | PASS (text) | Runtime: T10 PASS |
| FR-3 | Drafting without a brand voice; Language | Text contract | same | PASS (text) | Runtime: T10 PASS |
| FR-4 | Plan stops for review; Platform outside v1 | Text contract | same | PASS (text) | Runtime: T10 PASS |
| FR-5 | Status is read, never set | Text contract | same | PASS (text) | Runtime: T10 PASS |
| FR-6 | Limits enforced before the card | Text contract | same | PASS (text) | Runtime: T10 PASS |
| FR-7 | Ambiguous answer; Advance approval; Edit after approval | Text contract (with mutation checks) | same | PASS (text) | Runtime: T10 PASS |
| FR-8 | A posting tool is available; Credentials offered | Text contract | same | PASS (text) | Runtime: T10 PASS |
| FR-9 | Recording a draft as published; Lookalike host | Text contract | same | PASS (text) | Runtime: T10 PASS |
| FR-10 | Review edits nothing | Text contract | same | PASS (text) | Runtime: T10 PASS |
| FR-11 | Injected instruction in a pasted competitor post | Text contract | same | PASS (text) | Runtime: T10 PASS |
| DD-3 | Gate defined once; restatements agree | Text contract | same (3 tests) | PASS | — |
| FR-12 | Docs pages, governance/README rows, size statement, credit, CHANGELOG, lists, totals, no spec path shipped | Static | `akili-marketing-docs.test.js` B1–B9 | PASS | `docs/cli.md` states totals only, not names |
| NFR-6 | Dated; every limit row labelled; hard limits cite a source | Static | B10–B12 | PASS | — |
| NFR-1…NFR-5 | Measured in the T9 sweep (`execution.md`) | Command | `git diff`, `verify:cli`, `wc -l` | PASS | Windows CI legs `UNVERIFIED` until push |

**Mutation checks (new suite B):** 7 mutations were run on a scratch copy through `AMD_MUTATE_ROOT`.

- 6 were killed directly.
- M5 removed the first `/akili-marketing` mentions from the CHANGELOG. It survived, because other mentions remain in `## [Unreleased]`. With `## [Unreleased]` emptied, B6 killed it.
- Suite A was not mutation-tested: that would require editing `bin/`, which is out of scope. Its discovery cross-checks guard against stale coverage.

## 8. Remediation

No failures. One action is left to the user: delete the 15 stray paths from the real home (incident in §2), or keep them as a working install.

## 9. Accepted Gaps

| Gap | Reason | Substitute |
|---|---|---|
| Runtime agent behaviour (FR-2…FR-11) | A prompt's obedience is not testable by `node:test` | T10 dogfood, observed once, 12/12 steps (Claude Code only; FR-8 with a posting tool present not exercised) |
| Wrong platform hard limit | External facts | T4 citations, dated (NFR-6) |
| Copy quality | Not measurable | Human judgment at the approval card |
| Windows CI legs | Not pushed yet | PR CI |
