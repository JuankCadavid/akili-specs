# Validation Report — Model Routing Configurator (`akili routing`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/model-routing-configurator` |
| Validated at | `3470c73` (`master`, 2026-10-02) — 11 / 11 tasks `[x]`; **re-validated after T12** (FR-3 remediation, same day) |
| Validator | `/akili-validate` — session model `claude-fable-5-1` (T3); clause-level walk by a fresh-context auditor on the same model; every Implementer ran on `opus` → author ≠ auditor holds |
| Evidence reused | `execution.md` (14 Reviewer PASSes, two Pivot Records, §3 Summary), `t8-validation-evidence.md`, `t8-validation-evidence-tty-and-constitution.md`; **no `test-report.md`** (no `/akili-test` run) — coverage derived from the three suites and live probes |
| Clause matrix | `validation-matrix.md` (same folder — one table per FR/NFR: clause · owner task · code evidence · test/live evidence · verdict) |

## 2. Summary

**Verdict (re-validated after T12): archive-ready once CI is green — 0 FAIL, 7 WARN, 0 BLOCKED.** The first pass found one hard-negative FAIL, which a validation probe (not any Reviewer, not FR-11's eleven cases) exposed; the user chose *fix critical only*, T12 shipped the fix through the normal Implementer → Reviewer loop, and the probe now passes:

> **FR-3 — was FAIL, now PASS (T12).** "BUT it must NOT write a Reviewer wrapper whose model equals the Implementer's — on any host, in any mode." Before T12, on Antigravity, `--models antigravity=gemini-3.8-flash-medium,gemini-3.8-flash-high@T3` yields `authorAuditor: ok` and **both** `akili-implementer/agent.md` and `akili-reviewer/agent.md` with `model: flash`. `deriveTiers` compares registry ids; `planWrapper` binds the entry's `wrapperModel`, and two flash effort-variants collapsed to one wrapper model. Reproduced by the validator. **After T12** (`boundModel` equality in step 4 and the adjust loop; `buildPlan` belt-and-braces): the same probe → `authorAuditor: {"antigravity":"unsatisfiable"}`, Reviewer `skipped (author ≠ auditor unsatisfiable)`, no reviewer file; packaged default → `flash`/`pro`; `npm test` 231/231; Reviewer PASS with each new test pinning exactly one guard.

Everything else holds: 226/226 tests; `install`/`doctor`/`list` byte-identical to the pre-spec baseline; every FR-9 doc site present; the two FR-11 pivots closed; design deviations all explained in `design.md`/`execution.md`.

| Level | Count | Items |
|---|---|---|
| FAIL | 0 | FR-3 Antigravity `wrapperModel` collapse — **fixed by T12**, re-probed PASS |
| WARN | 7 | NFR-4 CI not run on this spec's 18 commits · FR-8 Branch B not re-walked after T10 · FR-11 / requirements §8 "Real-host acceptance" overclaim · NFR-6 report-line budget · F3 `placeholdersByColumn` misreports a filled Cursor column · proposal "≤ 6 prompts" vs FR-1 "≤ 8" with "Deviations: none" · Constitution Impact (`bin/routing.js` absent from `AGENTS.md`) |
| Advisory | 24 | §7 below |

## 3. Task Completion

| Task | Status | Evidence in `execution.md` |
|---|---|---|
| T1–T6, T9–T11 | `[x]` | one entry each: Implementer verification, Leader re-run VERIFIED, Reviewer PASS (different model), spawn counts |
| T7 | `[x]` | three attempts (two FAILs on one surviving phrase), one continuation, one Reviewer runtime event recovered at rung 1 |
| T8 | `[x]` | eleven cases, verbatim evidence in two files; closing Reviewer PASS over the derived record; two Pivot Records |

**PASS** — every `[x]` has a closing Reviewer PASS written before the checkbox; 0 `REVIEW_WAIVED`, 0 `REVIEW_SKIPPED`.

## 4. File Existence

Design §4 tree — all present: `bin/akili.js` (+flags, `runRouting`…), `bin/routing.js` (new), `bin/persona.js` (+2 exports), `.claude/templates/model-registry.json`, `.claude/templates/model-routing.section.md`, `test/routing.test.js`, `test/routing-io.test.js`, `test/registry-drift.test.js`, `test/fixtures/routing/` (9), `docs/cli.md`, `docs/model-routing.md`, `docs/flow.md`, `docs/commands/akili-constitution.md`, `README.md`, `AGENTS.md`, `CHANGELOG.md`, `.claude/commands/akili-constitution.md`, `.claude/commands/akili-audit.md`, `docs/release-checklist.md`. **PASS.** (`docs/commands/akili-constitution.md` is a summary page, not a mirror — corrected at the T6 gate.)

## 5. Build Integrity

| Check | Result |
|---|---|
| `node --check bin/akili.js bin/routing.js` | PASS |
| `npm test` | PASS — `# tests 226 # pass 226 # fail 0` (baseline 94) |
| `npm run verify:cli` | PASS — `11 commands | 24 skills | 8 resources (akili-specs v2.31.0)`, unchanged |
| `npm run pack:dry-run` | PASS — ships `bin/routing.js`, `templates/model-registry.json`, `templates/model-routing.section.md` |
| `git diff --check` | PASS |
| FR-10 byte identity vs `8eb0227` (fixture `HOME`, `--tool all` explicit) | PASS — `install --dry-run` 458 lines identical; `doctor --tool all` 292 lines identical; `list` identical |
| Lint / type-check | **WARN (gap)** — the repo defines no lint or type-check script. Smallest useful addition: `"lint": "node --check bin/*.js scripts/*.js"` (or eslint) |
| CI matrix (NFR-4) | **WARN** — `master…origin/master [ahead 18]`: no commit of this spec has run the ubuntu/windows × Node 18/22 matrix; last green CI is `e270428` (v2.31.0). Windows-sensitive spots: `readline/promises`, `path.posix` for the OpenCode dir, CRLF handling |
| Environment boot smoke | n/a — CLI package, no `docs/infrastructure.md` contract needed |

## 6. Requirement Coverage

Clause-level matrix in `validation-matrix.md`. Worst clause per requirement:

| Req | Verdict | Basis |
|---|---|---|
| FR-1 | PASS | four scenarios + negatives: unit (T4 ordered-list tests), T8 pty cases 1–2, validator probes (no-TTY exit 1 in 102 ms; no wrappers for unselected hosts; dry-run tree clean). The ≤ 8 clause holds for its stated condition (every id packaged → 7) |
| FR-2 | PASS | every listed validation input tested (T2); validate-before-write proven live (bad `--models` with valid `--hosts` → 0 paths) |
| FR-3 | PASS (after T12) | the Antigravity `wrapperModel` collapse fixed — `boundModel` equality + belt-and-braces; validator probe re-run → `unsatisfiable`, no Reviewer wrapper; (i) proves Reviewer ≠ Implementer wrapper model for every host from the shipped registry |
| FR-4 | PASS | six states incl. (b) TTY adopt prompt (driven with `expect`: diff shown, `a` → `adopted`, outside bytes kept); `CLAUDE.md` never written (report line printed, `git diff -- CLAUDE.md` empty); CLI row `<CONFIRM>` for unconfirmed hosts |
| FR-5 | PASS | per-host snapshot tests; no hardcoded Antigravity tool names (`grep view_file\|grep_search bin/` → 0); skip / drift / `--force` proven |
| FR-6 | PASS | idempotence live (`no changes`, porcelain 0); no run results in the file; `Updated:` from `updatedAt` incl. the month-boundary test |
| FR-7 | PASS | validator mutations on a HEAD extract: JSON id change → `# fail 1`; doc id change → `# fail 2` |
| FR-8 | WARN | text conformant (probe-before-compose, Fallback, item 5 prohibitions verbatim, Step 9 from JSON); **Branch B not re-walked live after T10** — component-verified only (two-shim probe + Reviewer text read) |
| FR-9 | PASS | all seven SHALL sites present (`akili.js:210,237-250`; `cli.md:82,120-132,315+`; `model-routing.md:772,814-817`; README `:53,439,896`; `akili-audit.md:56`; `AGENTS.md:37`; CHANGELOG minor) |
| FR-10 | PASS | §5 |
| FR-11 | WARN | eleven cases with verbatim output; **requirements §8 row "Real-host acceptance" claims Claude Code coverage "by FR-11's scratch run"** — no case loads the generated `.claude/agents/akili-reviewer.md` in a Claude Code session |
| NFR-1 · 2 · 3 · 5 · 7 · 8 | PASS | no `dependencies`; 95–210 ms exit 1 nothing written; writes confined to the fence / five wrapper dirs / answers file; pure module; pins in JSON + `docs/cli.md`; fence regexes accept the written markers |
| NFR-4 | WARN | CI not run (§5) |
| NFR-6 | WARN (low) | report lines exceed "1 per host" (Cursor 2, Antigravity 3) — design §7 `reports[]` explains; the NFR text was never amended |

Negative constraints explicitly verified: FR-1 no wrappers for unselected hosts · never blocks · never `CLAUDE.md`; FR-2 never a partial write; FR-5 no doc-copied `tools:`; FR-6 no run results; FR-8 never a terminal. **FR-3's "on any host, in any mode" failed on the first pass and passes after T12.**

## 7. Linting & Code Quality

No lint tooling in the repo (§5 gap). **4R advisories** — none is a spec violation; all inform follow-ups:

- **Carried from `execution.md`** (recorded there; none resolved): F3 `placeholdersByColumn` counts the host's Fallback-column placeholders (a filled Cursor column still reports 6 — Step 9's "placeholder count per column" misreads it → also a WARN above) · F5 Fallback `since=` source when the binary is absent · F6 Step 8E exact frontmatter only for Implementer/Reviewer (hand-written Leader/Tester → `skipped (exists)`) · F8 diff printed after `overwritten` · `DATE_STAMP_RE` treats any 8-digit run as a date · `detectEol` duplicated from `persona.js` · composite `cliSuggestion` prose in the JSON · README `:55/:890/:904` + `docs/README.md` hub lines · Step 9 "may share" → "shares" (Tester always binds the Implementer's model) · recorded cross-host dispatch has no wizard clearing path · Codex roster without Luna → `unsatisfiable` with no hint · `generatedBy` in the canonical form → a package upgrade lands the fence in (a′) · `checkPreviousRoster` skips `reason` on a dated previous entry · `--t3-cross-host` applied even when T3 is locally satisfiable · `askValid` hard-errors on a second invalid reply · io-test `git()` uses the real `HOME` · `unifiedDiff` prints `+` before `−`, one hunk · `no changes` printed beside `skipped (unfenced…)` · `appearsIn` substring label match in the drift test · `tableParts` computed twice.
- **New (validator):** Risk — `wrapperModel` collapse (promoted to the FR-3 FAIL) · Readability — design §7 still lists `deriveTiers(roster, hostRegistry, crossHostChoice, selectedHosts, hostKey)` (shipped: `(roster, hostRegistry, opts)`) and omits `parseModels`'s `opts` · Reliability — changing `--opencode-agent-dir` orphans old wrappers unreported · Resilience — invalid answers JSON → `fail()` with no recovery hint beyond deleting the file.

## 8. Design Conformance

**Explained deviations (PASS):** §5.3 step 2 placeholders kept · step 4 "Ids only" · step 6 registry membership (T9 → T11) · §5.6 (a′) byte-equal → `unchanged` · §5.7 `--pin-reason` scope · §7 `renderRegistryTable` / `buildPlan` signatures + `reports[]` · §5.4 stale rule excludes user ids · DD-6 probe-before-compose · §10 budget 8 → 9 → 11, LOC ~1,550 → ~3,400 → ~4,010 · CLI-invocation default = leading binary token. Two Pivot Records with two-direction sweeps. §8 consumer rows all verified present.

**Unexplained (advisory):** §7 `deriveTiers` / `parseModels` signatures stale; `tasks.md` §4 still says "~1,550 lines".

**Cross-document figure check:**

| Figure | Documents | Result |
|---|---|---|
| 10 placeholders (1/1/2/6) | requirements §4 · doc table (awk 0/1/1/2/6) · `tierPreference` · default-column test | agree |
| 12 new flags / 13 option rows | FR-2 · CHANGELOG · `akili help` · design §8 · `cli.md` | agree |
| six states (a, a′, b–f) | FR-4 · §5.6 · `cli.md` | agree |
| eight placeholders | template · `sectionContext` · T1 test | agree |
| 11 JSON keys | case 10 A · validator probe | agree |
| `npm test` 94 → 226 | requirements §4 · execution §3 · run | agree |
| budget 8 → 9 → 11 tasks, 14 / 18 rounds, ~4,010 LOC | design §10 · execution §3 | agree (`tasks.md` §4 stale) |
| **prompt count** | proposal success criterion "≤ 6 prompts" · FR-1 "≤ 8 (= 7)" · T4 test 7 | **contradict** — requirements govern (judgment round added the invocation and wrapper questions), but requirements §1 says "Deviations from proposal: none" → WARN, fix the §1 row at archive |

**Proposal alignment:** non-goals respected — no `doctor --routing`; the answers file is not the canonical registry; no live roster probing (`routing.js` has no `child_process`); `install`/`update`/`doctor`/`list` byte-identical; `model:` in commands 0; no dependency. Success criterion "Constitution smaller" was never measured by any task (advisory).

## 9. Test Evidence Summary

| Suite | Tests | Covers |
|---|---|---|
| `test/registry-drift.test.js` | 7 | FR-7 (header-anchored, cell grammar, placeholders, template set) |
| `test/routing.test.js` | 112 | FR-2 grammar, FR-3 derivation (every host's packaged column, unsatisfiable, cross-host, T6 variants, notes), FR-4 six states + CRLF + bytes outside the fence, FR-5 five host snapshots, FR-6 `Updated:`/idempotence/month boundary, FR-1/FR-2 prompt order + deep-equality through a scripted `io`, T9/T11 note rules |
| `test/routing-io.test.js` | 13 | FR-1 non-TTY + dry-run, FR-2 fully specified + validate-before-write, FR-4 (a′)/(b)/(d) tokens + exit codes, FR-5 skip/force/drift, FR-6 idempotence (`git status --porcelain` empty), FR-8 `--json` shape, NFR-2 timing |
| T8 live evidence (two files) | 11 cases | FR-11; FR-1 interactive on a pty; FR-8 proxy walk (Branch A full; Branch B pre-T10) |
| Validator probes | 6 | FR-1 no-TTY, FR-2 partial write, FR-4 (b) adopt prompt + `CLAUDE.md`, FR-7 two mutations, FR-10 byte identity, **FR-3 wrapperModel collapse** |

No `test-report.md`; `/akili-test` was not run — the spec's gates were test-first throughout.

## 10. Agent Guide / Constitution Impact

`execution.md` carries **no** `## Constitution Impact` block, yet T2 created a new module (`bin/routing.js`, 1,390 lines) and T3 added two exports to `bin/persona.js`. `AGENTS.md` → *Repository Purpose* names `bin/akili.js` and `bin/persona.js` but not `bin/routing.js`; no `## Module Guides` index exists (none needed for this repo's shape). **WARN** — root guide stale; pending for `/akili-archive` (Constitution & Graph Sync: add the `bin/routing.js` bullet; CodeGraph re-index — the graph predates this spec's files).

## 11. Remediation

| # | Level | Finding | Remediation | Owner |
|---|---|---|---|---|
| 1 | ~~FAIL~~ → **PASS** | FR-3: Antigravity Reviewer wrapper = Implementer wrapper (`flash`/`flash`) when a flash effort-variant is placed on T3 — **resolved by T12** (Pivot Record 3; Reviewer PASS; probe re-run) | ~10 LOC + 1 test: in `deriveTiers` step 4 (or `buildPlan`), for hosts whose `models[]` carry `wrapperModel`, treat a T3 candidate whose `wrapperModel` equals T2's as equal (skip; none left → `unsatisfiable`); `promptTierAdjust` rejects it with the same one-line reason; a unit case `antigravity: flash-medium + flash-high@T3 → unsatisfiable` and a wrapper-level assertion `reviewer.model ≠ implementer.model` for every host snapshot. Route: **T12 via the Pivot Protocol** (amend design §5.3 step 4 + §5.5), or a user-accepted gap recorded in requirements §8 with this probe as its falsifier | `/akili-execute` (T12) |
| 2 | WARN | NFR-4: CI matrix not run on this spec | `git push`, wait for the `CI` workflow (ubuntu/windows × Node 18/22) to go green before archive/release | user |
| 3 | WARN | FR-8 Branch B not re-walked after T10 | one live re-walk with the `8eb0227` shim (probe → fallback) — or accept component verification; record either way | archive follow-up |
| 4 | WARN | requirements §8 "Real-host acceptance" overclaims Claude Code coverage | re-word the row at archive ("not exercised; relies on the Step 8E pin") | `/akili-archive` |
| 5 | WARN | F3 `placeholdersByColumn` counts the host's Fallback-column placeholders | count host-column cells only (or split the key); Step 9 reads it as "per column" | follow-up proposal |
| 6 | WARN | proposal "≤ 6 prompts" vs FR-1 "≤ 8"; requirements §1 "Deviations from proposal: none" | amend the §1 row to name the deviation (judgment added the invocation + wrapper questions) | `/akili-archive` |
| 7 | WARN | NFR-6 report-line budget exceeded per host | amend NFR-6 to "+ reports" or accept | `/akili-archive` |
| 8 | WARN | Constitution Impact: `bin/routing.js` absent from `AGENTS.md`; CodeGraph stale | Constitution & Graph Sync at archive | `/akili-archive` |
| 9 | WARN (gap) | no lint/type-check script | add `"lint": "node --check bin/*.js scripts/*.js"` | follow-up |
| — | advisory | §7 stale signatures; `tasks.md` §4 LOC; 24 4R items | archive retrospective / follow-up proposals | — |

## 12. Archive Readiness Recommendation

**Ready once CI is green.** FAIL #1 is resolved (T12). One condition still gates `/akili-archive changes/model-routing-configurator`:

1. **Push and get a green CI matrix** (WARN #2) — the only evidence for NFR-4 lives in CI, and none of this spec's commits has run it (pushed at re-validation; see the run result recorded by the Leader in the chat / `execution.md`).

WARNs #3–#9 are acceptable with the follow-ups named above and can be carried into the archive's Kaizen Retrospective and the `### T8` / §8 re-wordings.
