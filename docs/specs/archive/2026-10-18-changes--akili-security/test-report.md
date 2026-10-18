# Test Report: `/akili-security` — repository security audit on Cloudflare's `security-audit` skill

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security` |
| Date | 2026-10-18 |
| Source ref | `466dbca` (execution complete, 13/13 tasks) + new `test/akili-security-command.test.js` |
| Leader | Claude Opus 5.5 |
| Tester | 1 delegated (`opus`, suite S2; the Implementers were `sonnet` — author ≠ tester) |
| Status | **PASS** — 325/325 on Node 22.12.0 and 18.20.8; no `PRODUCT_BUG` |

## 2. Summary

**Overall: PASS.** Every functional requirement has test evidence, either automated or from the T8 dogfood run. The gaps are explicit: the runtime branches the dogfood did not exercise (§9), and Windows CI (P-13).

| Suite | Kind | Who | Result |
|---|---|---|---|
| S1 — vendored skill + install payload | Unit/integration (existing) | Cited, not rewritten: T1's red-first `test/security-audit-skill.test.js` (6) and T4's counts in `test/install-cursor.test.js` + `test/fixtures/doctor-codex-baseline.txt` | PASS |
| S2 — command text contract + reader scoping | Integration (text-contract regression guard) | 1 Tester, new `test/akili-security-command.test.js` (60) | PASS |
| S3 — runtime behaviour of the command | E2E (manual, HITL) | T8 dogfood run, cited from `execution.md` | PASS on the exercised branches; unexercised branches in §9 |

- Suites: 3. Testers spawned: 1 (S2). S1 and S3 are cited evidence, so no inline authoring was needed.
- Skill selection: none was required for S2 — the product already existed, so `tdd` red-first did not apply. Effort `high`, because S2 is a regression guard over safety-gate text.
- Tester lookup note: none.

| Command | Result |
|---|---|
| `node --test test/akili-security-command.test.js` | `# tests 60 · # pass 60 · # fail 0` |
| `npm test` (Node 22.12.0) | `# tests 325 · # pass 325 · # fail 0 · # skipped 0` |
| `~/.nvm/versions/node/v18.20.8/bin/node --test` | `# tests 325 · # pass 325 · # fail 0` |

The counts above are the Leader's re-run after the Tester reported. The baseline was 265 before S2.

## 3. Backend Unit Tests

| File | Tests | Requirement | Origin |
|---|---|---|---|
| `test/security-audit-skill.test.js` | 6 | FR-1 (file set without `*.test.cjs`, attribution, licence, install payload), FR-7 (validator exit-code smoke), NFR-2 | T1, written red first; falsifiers executed in `execution.md` → T1 |
| `test/install-cursor.test.js` (counts) + `test/fixtures/doctor-codex-baseline.txt` | (existing suite) | FR-1 *Install on every host*, NFR-1 | T4; falsifiers executed in `execution.md` → T4 |

## 4. Frontend Unit Tests

Not applicable — no UI in this change.

## 5. Integration Tests — S2 text-contract suite

`test/akili-security-command.test.js` — 60 tests. Each expected wording is a literal regex taken from the requirement and anchored inside the block that owns the obligation: the named Step, a table row, or the Step 2 addendum blockquote. A keyword elsewhere in the file therefore cannot satisfy a test. The default Records allowlist uses an exact `assert.equal`.

**Falsifiers executed by the Tester** on scratch copies, with the tracked files untouched:

| Mutation | Red assertion (quoted) |
|---|---|
| Delete the FR-4 "sandboxed or not" sentence | `FR-4 'sandboxed or not' install/network/endpoint prohibition missing` |
| Restore "both gates (Step 1, Step 5) stop on every run." | `plan gate 'stops on every run' / no pre-approved mode missing`; `T7a routing-gate wording missing`; `pre-T7a 'both gates ... stop on every run' wording is back` |
| Insert `title` into the default Records row | `default Records allowlist changed: opaque id \`S-n\` · title · verdict · severity (confirmed only) · routing status (\`open\`)` |
| Remove `drift-*` from the archive reader | `.claude/commands/akili-archive.md: most-recent read no longer scoped to drift-*.md`; `.claude/commands/akili-archive.md: security-*.md exclusion missing` |

## 6. E2E Tests — S3 (manual, T8 dogfood)

`/akili-security --profile quick --budget 15` ran on this repository. Scope was adjusted at the plan gate to `bin/ scripts/ .claude/ test/`, the policy was static-only, and `--out` pointed to the session scratchpad. Evidence: `execution.md` → T8, verified against the session transcript by an independent Reviewer (PASS, attempt 2).

| Observed | Requirement |
|---|---|
| Preflight checked provenance (`adapted-for`, pin) and `node --version`, and the plan gate stopped before any agent was spawned or any run directory existed | FR-2, FR-3 |
| No target-controlled build, test, install or network ran; `run-metadata.json` has `akili_execution: "static-only"` | FR-4 (default run) |
| All 10 delegated prompts carried the addendum verbatim | FR-5 |
| Run directory outside the target; the only repository write was the index | FR-6, FR-12 |
| Both validators exited 0 after seeding, after consolidation, and before Phase 6 | FR-7 |
| Index written with allowlisted fields only, `Date of Audit`, and `<external>/run-1`; forbidden-string grep clean | FR-8 |
| Sub-agents available, so a full run was allowed | FR-9 |
| Routing gate reached with nothing to route; the user's commit decision is recorded | FR-10 |
| First run: run-1, prior runs 0 | FR-11 |

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test type | Test file or command | Result | Gap or notes |
|---|---|---|---|---|---|
| FR-1 | Install on every host; `BUT` no `*.test.cjs`; `AND IT MUST` `diff -r` | Unit/integration | `security-audit-skill.test.js`, `install-cursor.test.js`; T1 Reviewer's `diff -r` on six roots | PASS | Windows `UNVERIFIED` (P-13) |
| FR-1 | Upstream fidelity; body unchanged | Unit + walk | T1 checksum walk + body gate (`execution.md`) | PASS | — |
| FR-2 | Foreign copy (+ `BUT` never silent); No Node.js (+ `BUT`) | Text contract | S2 (5 tests) | PASS | Runtime foreign-copy and no-Node branches not exercised (§9) |
| FR-3 | Nothing before approval; `AND IT MUST` every run, no pre-approved mode | Text contract + E2E | S2 (3) + T8 | PASS | — |
| FR-4 | Default run (+ `BUT`, `AND IT MUST NOT`); control unconfirmed; *who*; `akili_execution`; expected yield | Text contract + E2E | S2 (9) + T8 | PASS | Sandboxed branch not exercised (§9) |
| FR-5 | Injected instruction (+ `AND IT MUST` eligible as finding) | Text contract + E2E | S2 (3) + T8 addendum check | PASS | No injected text was encountered in the run (§9) |
| FR-6 | In-repo output not ignored (+ `BUT` except the index) | Text contract + E2E | S2 (3) + T8 | PASS | Refusal branch not exercised (§9) |
| FR-7 | Validator fails (+ `BUT` not complete) | Text contract + unit + E2E | S2 (3) + T1 smoke + T8 | PASS | Failure branch not exercised at runtime (§9) |
| FR-8 | Default index (+ `BUT` forbidden list, `AND IT MUST` `Date of Audit`); location forms | Text contract + E2E | S2 (7) + T8 index | PASS | **Redaction unexercised** — zero records (§9) |
| FR-9 | Host without sub-agents (+ `BUT`) | Text contract | S2 (3) | PASS | Guidance-review branch not exercised (§9) |
| FR-10 | Selection (+ both `BUT`s, `AND IT MUST`) | Text contract + E2E | S2 (6) + T8 | PASS | Selection with confirmed records not exercised (§9) |
| FR-11 | Additive re-runs | Text contract + E2E | S2 (1) + T8 | PASS | Re-run with prior runs not exercised (§9) |
| FR-12 | Report-only; tracked write = index | Text contract + E2E | S2 (2) + T8 | PASS | — |
| FR-13 | Only a security index present (+ `BUT` not read as drift) | Text contract | S2 (10: 3 readers × 3 clauses + README) | PASS | — |
| FR-14 | Governance, docs, CHANGELOG | Review | T5a/T5b/T6/T7 Reviewer quote-checks | PASS | Not test-automatable |
| NFR-1, NFR-2, NFR-6 | No `bin/`, dependency, or template change | Command | `git diff 6d1e152 -- bin/ .claude/templates/ docs/model-routing.md package.json` → empty (T7) | PASS | — |
| NFR-3 | CI matrix | Command | Node 18.20.8 / 22.12.0 / 22.23.3 → 325/0; Linux `node:18`/`node:22` → T4 record (pre-existing `jq` gap) | PASS locally | Windows `UNVERIFIED` (P-13) |
| NFR-4 | Package growth ≤ 320 KB | Command | `pack:dry-run` +291,842 B (T7) | PASS | — |
| NFR-5 | Command ≤ 230 lines; no `model:` | Text contract | S2 (3); 173 lines | PASS | — |

## 8. Remediation

No failures. No `PRODUCT_BUG`.

## 9. Accepted Gaps

| Gap | Why it is not automated | How it closes |
|---|---|---|
| Runtime branches not exercised by the dogfood: foreign skill copy, no Node.js, sandboxed execution approval, control-unconfirmed re-show, in-repo `--out` refusal, validator failure, Guidance review, a routing selection with confirmed records, detailed-index opt-in, a re-run with prior runs | These are behaviours of an agent following the command text. The text obligations are guarded by S2; the behaviour needs agent runs set up to hit each branch | Future dogfood runs, e.g. on a fixture repository with a planted defect and an injected instruction |
| **Redaction unexercised** | Zero `confirmed`/`needs_validation` records in run-1 | A run that yields at least one record (tasks.md T8 Disqualifier) |
| Windows CI legs (P-13) | Not available locally | First CI run after the user's push |
| Linux bare-image `jq` gap in `tasks-gate.test.js` | Pre-existing; reproduces at `6d1e152` | CI installs `jq`; unrelated to this change |
| Coverage of the audit itself | `quick` + scoped run; 4 units deferred (D-1…D-4 in `execution.md`) | A later `standard` run |
