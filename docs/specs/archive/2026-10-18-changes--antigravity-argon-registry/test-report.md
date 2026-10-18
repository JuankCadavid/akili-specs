# Test Report: Antigravity registry refresh — Gemini 4 Argon

**Overall: PASS.** All 259 automated tests pass. Every requirement scenario has evidence, and the `BUT` / `AND IT MUST` clauses are included. Two checks need `agy`, which CI does not have, so they ran manually here and are recorded as accepted gaps. No product bugs.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/antigravity-argon-registry` |
| Depth | Lite |
| Tested at | `25a6238` (clean tree) |
| Date | 2026-10-18 |
| Runtime | Node v22.12.0 (system), macOS · `agy` 1.4.2 |
| Leader | Opus 5.5 (session). Deployment Rule: Lite → **inline**, no Tester spawned |

## 2. Summary

| Suite | Ran | Result |
|---|---|---|
| Unit (`npm test`: `node:test`, every file under `test/`) | 259 tests | **259 pass · 0 fail · 0 skipped** |
| Integration (CLI end-to-end in a scratch project + `agy plugin validate`) | 4 cases | **4 pass** |
| Manual roster / doc checks (need `agy` or prose) | 4 checks | **4 pass** |

- **Delegation:** 3 suites, all run inline by the Leader (Lite depth); 0 Testers spawned. No lookup notes.
- **No new tests were written.** The author's `tdd` coverage from T3 (`test/routing.test.js` 66, 69, 82, 134, 135 `(i)`, `(g)`, the empty-T4 test) and the existing `test/registry-drift.test.js` already prove every scenario that can be automated. They are **cited, not rewritten**.
- **Skills:** `cognitive-doc-design` for this report.

## 3. Backend Unit Tests

| Command | Result |
|---|---|
| `npm test` | `# tests 259` · `# pass 259` · `# fail 0` · `# skipped 0` |
| `node --test test/registry-drift.test.js` | `ok 1`–`ok 7`, `# pass 7` · `# fail 0` |
| `node --test test/routing.test.js` | `# tests 136` · `# pass 136` · `# fail 0` (136 titles, same as `186c6a0`) |
| FR-4 falsifier: T1 Antigravity cell → `` `gemini-9-bogus` ``, then the drift test (file restored afterwards) | `not ok 1 … error: 'antigravity T1: id \`gemini-9-bogus\` in the doc cell is not in models[]'` · `# fail 1` → the gate goes red as required |

## 4. Frontend Unit Tests

n/a — no UI surface.

## 5. Integration Tests

Scratch project outside the repo (`git init` + `AGENTS.md`), then `node <repo>/bin/akili.js routing --hosts antigravity --models antigravity=gemini-4-argon-high,gemini-3.8-flash-high,gemini-3.8-flash-medium,gemini-3.8-flash-low,claude-sonnet-5-5-high --cli antigravity=agy --wrappers yes --yes`.

| # | Case | Observed | Result |
|---|---|---|---|
| I1 | Fresh project, packaged ids | Exit 0. `created` only `akili-implementer` and `akili-tester`, both `model: flash`. Reports: `Antigravity Leader: no wrapper — \`gemini-4-argon-high\` has no Antigravity wrapper model (flash \| pro)`, and the same for the Reviewer. **No** `/agents … akili-leader` line. `AGENTS.md` T1 and T3 Antigravity cells are `gemini-4-argon-high`. The author ≠ auditor line reads `Implementer (T2) \`gemini-3.8-flash-medium\` ≠ Reviewer (T3) \`gemini-4-argon-high\``, and the file contains 0 `NOT satisfied` | PASS |
| I2 | `agy plugin validate --strict --json` on the rendered wrappers | `"agents": 2`, no findings: the host accepts every wrapper written | PASS |
| I3 | Same command again (idempotence) | `no changes`, exit 0 | PASS |
| I4 | A retired id passed explicitly (`gemini-3.1-pro-high`) | `ERROR: … id \`gemini-3.1-pro-high\` is not in the packaged Antigravity roster — add a placement …`, exit 1 (design P-15, as documented) | PASS |

## 6. E2E Tests

n/a — a CLI/registry change. The integration cases above drive the real CLI.

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test type | Test file or command | Result | Gap or notes |
|---|---|---|---|---|---|
| FR-1 | Retired ids gone (0 hits) | Manual grep | `grep -rn "gemini-3.1-pro-high\|claude-sonnet-4-6" .claude/templates docs/model-routing.md bin .claude/commands` → rc=1 | PASS | One-off migration check, not a lasting rule — no test added |
| FR-1 | `models[]` has Argon + Sonnet 5.5 High, `alias:false`, `dated:false` | Unit + manual | `registry-drift` ok 1/5; JSON read | PASS | — |
| FR-1 | `BUT` no unrouted roster ids | Unit | `registry-drift` ok 5 (each `tierPreference` entry is in `models[]`) + JSON read: exactly 5 entries, all routed | PASS | — |
| FR-1 | `AND IT MUST` labels byte-equal to `agy models` | Manual | Python diff of `agy models` rows vs `models[]` → 5/5 `served`, `label-ok` | PASS | **Accepted gap A** — CI has no `agy` |
| FR-2 | Derivation T1/T3 → Argon, T2 Flash Medium | Unit + integration | `routing.test.js` `(i)`, 134; I1 `AGENTS.md` cells | PASS | — |
| FR-2 | author ≠ auditor satisfied | Unit + integration | `(g)`, 134; I1 author ≠ auditor line | PASS | — |
| FR-2 | `BUT` no other host changed | Manual | Python: every non-Antigravity `hosts.*` and `crossHost` equal to `6e802a5` → `True` | PASS | — |
| FR-3 | Implementer/Tester `flash`; Leader/Reviewer skipped naming `gemini-4-argon-high` | Unit + integration | `routing.test.js` 66, 82, 135 `(i)`; I1 | PASS | — |
| FR-3 | `BUT` no `model:` outside `inherit`/`flash`/`pro` | Unit + integration | 66 / `(i)` wrapper contents; I1 `model: flash` ×2; I2 host accepts both | PASS | — |
| FR-3 | `AND IT MUST` documented with the C-Q1 date | Manual read + grep | `docs/model-routing.md` "Argon is not a wrapper tier" (2026-10-18); constitution Step 8E row and example (T2/T4); `docs/cli.md:448`; T4 grep → only the 2 correct `model: pro` hits | PASS | Prose — read by the Reviewers of T1, T2 and T4 |
| FR-4 | `lastVerified` / pins / *Registry updated* dated | Manual grep + JSON | `:104` `2026-10`; `:135` Antigravity `2026-10-18`; `:237` `2026-10-18`; JSON `2026-10-18` | PASS | **Accepted gap B** — the dates have no automated check |
| FR-4 | Drift test passes | Unit | `registry-drift` 7/7 | PASS | — |
| FR-4 | `AND IT MUST` falsifier still red | Unit (mutation) | §3 falsifier row | PASS | — |
| FR-5 | Suite green | Unit | `npm test` 259/0 | PASS | — |
| FR-5 | `BUT` no deleted or weakened test | Review evidence | T3 Reviewer: 136 → 136 titles, assertions 383 → 391, `deepEqual` 120 → 121, none loosened | PASS | — |
| NFR-1 | `verify:cli`, `pack:dry-run`, `diff --check` | Command | `execution.md` T3/T4: OK, 280 files, clean | PASS | — |
| NFR-2 | CHANGELOG quote-checked | Review evidence | T3/T4 Reviewers quote-checked every clause | PASS | — |
| NFR-3 | Local commits only, prefixed | Git | `git log` → every spec commit `[SPEC:changes/antigravity-argon-registry]`; nothing pushed | PASS | — |
| A1 (P-10) | `/agents` line only with a Leader wrapper | Unit + integration | 82 (absence assertion, TDD red quoted in `execution.md`); I1 | PASS | — |
| A3 (P-15) | Retired id passed explicitly fails fast | Integration | I4 | PASS | The silent degrade itself (P-14) is a known, out-of-scope defect, not tested here |

## 8. Remediation

None. No failure and no `PRODUCT_BUG`.

## 9. Accepted Gaps

| # | Gap | Why not automated | Substitute |
|---|---|---|---|
| A | Roster membership and byte-equal labels against the live `agy models` | CI cannot run `agy`, which needs an authenticated host | Manual Python diff, run here at `25a6238`; re-run at each registry refresh, as `docs/model-routing.md` instructs |
| B | `lastVerified` and doc dates | A test pinning today's date would only fail at the next refresh | Manual grep, run here |
| C | Which model `model: pro` runs on (design P-4, DD-4) | Needs a live subagent dispatch; blocked by the permission classifier during specify | The user's live probe, after this spec |
| D | `.claude/templates/model-routing.section.md:48` still names Gemini 3.1 Pro | Out of scope (design A2): editing the template refuses existing fences | Recorded as known debt in the CHANGELOG; fixed by the template-evolution Bug |
| E | Silent degrade when an existing project re-runs from its answers file (P-14) | Defect predates this spec (A3) | Upgrade path documented in the CHANGELOG and `docs/model-routing.md`; separate Bug proposal |
