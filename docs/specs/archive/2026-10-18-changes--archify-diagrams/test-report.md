# Test Report: `diagram-design` — Interactive Methodology Diagrams via Archify

**Overall: PASS** — 272/272 tests green (13 new), no product bug; behavioural Archify evidence from T7 cited; 4 explicit gaps (§9).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/archify-diagrams` |
| Date | 2026-10-18 |
| Tested at | `eca545e` + new `test/diagram-design.test.js` (uncommitted at test time) |
| Leader | Claude Code session, Opus 5.5 |
| Tester | 1 Tester, `opus` (≠ Implementer `sonnet` — author ≠ tester), effort high; persona `.agents/tester.md` (fallback sub-prompt, no Step 8E wrapper) |
| Environment | macOS, Node v22.12.0; offline (no network, no install); Archify not run in this phase |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 1 — integration / static conformance + 5-host install (`node:test`) |
| Testers spawned | 1 (no parallel — single suite); no suite run inline |
| Tester inner loop | 2 attempts — attempt 1 test defect (FR-9 matcher hit the binding-definitions row instead of the assignment row), narrowed; attempt 2 green |
| Tester status | `STATUS: PASS` |
| Product bugs | 0 |
| Full suite | `npm test` → `# tests 272` · `# pass 272` · `# fail 0` (Leader re-run) |
| New file | `test/diagram-design.test.js` (504 lines, 13 tests, each named `@akili-spec changes/archify-diagrams <FR>`) |
| Leader re-run | `node --test test/diagram-design.test.js` 13/13; `npm run verify:cli` ok; `npm pack --dry-run` unpacked 4 507 765 B (+13 591 vs 4 494 174 pre-spec), 283 files; `install --tool all --dry-run` names `diagram-design` (7 hits); `git diff --check` clean |
| Lookup note | Tester: "TRD and UX design were both `none` and neither was read"; read only the spec slice + `execution.md` T7 entry |
| Skills | Tester: none assigned (static Node tests; no deviation to record) |

## 3. Backend Unit Tests

n/a — the change ships no executable product code (rules text, one skill, docs, one test literal/fixture).

## 4. Frontend Unit Tests

n/a — no UI.

## 5. Integration Tests

`node --test test/diagram-design.test.js` — 13/13 PASS.

| Test (FR) | Proves |
|---|---|
| FR-1 frontmatter | name, MIT, author, `binding: conditional`, version, `inspired-by` (Archify, tt-a1i, MIT, URL, C4, Mermaid); **BUT** no `adapted-by`/`adapted-for`/`source` |
| FR-1 No Archify file ships | skill dir = `SKILL.md` + `references/slot-catalog.md` only; `npm pack --dry-run --json --ignore-scripts --offline` list has 0 paths matching `archify.mjs\|renderers/\|\.schema\.json\|brand-marks\|THIRD_PARTY` |
| FR-2 slot catalog | 10 rows matched against the FR-2 table **read from `requirements.md` itself**; `trd-c4-context`/`trd-c4-container` condition `always`; "false condition leaves nothing" wording |
| FR-4 link line | §5.2 template byte-exact in design and SKILL; ` · browser check not run`; both path forms; "never timestamped copies"; 4 receipt `.gitignore` patterns |
| FR-7 guard-rails | 7 bullets inside `## 7. Guard-Rails` (body, not frontmatter); DD-5 negative: no `--quality\|--json\|--repo-root\|--out-dir\|finalize ` in the skill dir |
| FR-8 wiring | constitution: exactly 3 lines under Steps 3/4/5, each "whose condition holds"; specify: 1 line inside Step 2.1; archive: `11. Diagrams` in Step 2, Step 3 byte-identical to merge-base `1db53eb`; other 8 commands do not name `diagram-design`; views-documentation keeps "Mermaid is the default renderer in AKILI docs." |
| FR-8 BUT (enumeration-wide) | no file among all 11 `.claude/commands/*` names `archify` (case-insensitive) |
| FR-9 docs | governance conditional row + env-provided `archify`; `docs/skills/diagram-design.md`; skills README row; README `npx skills add tt-a1i/archify` with credit + MIT; `docs/cli.md` 25 (no `24 packaged`); CHANGELOG `[Unreleased]` names `diagram-design` |
| FR-10 install `--tool all` | scratch HOME, explicit target flags: both skill files land byte-identical (sha256) in Claude, OpenCode, Antigravity (3 roots), Codex+Cursor shared root |
| FR-10 `akili list` | names `diagram-design` |
| NFR-1 / NFR-5 | SKILL.md 5 989 B ≤ 8 192; dir 8 943 B ≤ 16 KB; no `model:` |
| NFR-3 | six host roots only in SKILL §4 item 1; none in the 5 wired command lines |
| NFR-4 | no `npx`/`npm install`/`curl`/`wget`/`fetch`/`skills add` in skill dir or wired lines |

**Mutation evidence (executed, then reverted; repo never mutated):**

| # | Mutation | Red (at the assertion) | Reverted |
|---|---|---|---|
| M1 | Scratch copy of `.claude/commands/` with ``Load the `Archify` skill here.`` appended to `akili-test.md` (an unwired command), via test seam `DD_MUTATE_COMMANDS_DIR` | `not ok 1 … enumeration-wide` — deepEqual `+ [ 'akili-test.md' ]  - []` | `ok 1` |
| M2 | `DD_MUTATE_EXPECT=references/missing.md` | `not ok 1 … install --tool all …` — `'expected claude: claude-home/skills/diagram-design/references/missing.md to be installed'` | `ok 1` |

Both seams are inert unless their env var is set (documented in the file header).

## 6. E2E Tests

No automated E2E. The end-to-end behaviour (an agent following the skill against real Archify) was executed in **T7** and is cited here, not re-run: `execution.md` → *T7* — Runs A (Archify + Chrome, cited C4 Container + held-out lifecycle), B (browser-less, exit 2 `skipped`), C (Archify absent), D (Mermaid edited, Archify absent). Leader-verified on disk; Reviewer PASS.

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|
| FR-1 | Frontmatter + BUT + AND | integration | `test/diagram-design.test.js` FR-1 | PASS | — |
| FR-1 | No Archify file ships | integration | FR-1 pack test | PASS | — |
| FR-2 | Catalog rows / C4 `always` | integration (static) | FR-2 test | PASS | **Behaviour** "TRD always carries both C4 slots, no placeholders" not executed (gap 3) |
| FR-3 | Slot without Archify | E2E (manual, T7) | T7 Run C | PASS | cited |
| FR-4 | Successful render | E2E (T7) + static | T7 Run A; FR-4 test | PASS | — |
| FR-4 | BUT receipts not committed | E2E (T7) | `git check-ignore` 8/8 | PASS | — |
| FR-4 | MUST reuse slot paths | E2E (T7) | Run B re-render, no duplicates | PASS | — |
| FR-4 | Rendered without browser gate | E2E (T7) | T7 Run B | PASS | — |
| FR-5 | Archify unavailable → Mermaid only, continue | E2E (T7) | T7 Run C | PASS | one-line report text not captured verbatim |
| FR-5 | Failed after repair limit; BUT no retry beyond it | — | — | **GAP** | not exercisable offline; Reviewer-walk clause (gap 2) |
| FR-6 | Mermaid edited, Archify gone → remove + report | E2E (T7) | T7 Run D | PASS | report line captured verbatim |
| FR-7 | Guard-rail wording | integration | FR-7 test | PASS | — |
| FR-7 | Explainer suppressed; BUT no user config/env change | E2E (T7) | no offer; `~/.claude/CLAUDE.md` sha1 unchanged | PASS | — |
| FR-7 | Update notice relayed at most once | — | — | **GAP** | update check disabled by user rule (gap 2) |
| FR-8 | Rows 1–5 + THEN | integration | FR-8 test | PASS | — |
| FR-8 | BUT no command names `archify` | integration | FR-8 enumeration-wide (M1) | PASS | — |
| FR-8 | MUST leave archive Step 3 unchanged | integration | FR-8 byte-identity vs `1db53eb` | PASS | — |
| FR-9 | All bullets | integration | FR-9 test | PASS | CHANGELOG clause quote-check is Reviewer territory (done in T6) |
| FR-10 | Install all 5 hosts; list; tests pass | integration | FR-10 tests; `npm test` 272/272 | PASS | — |
| FR-10 | Pack growth ≤ 20 KB | integration + command | FR-1 pack test (approx.); Leader `npm pack` +13 591 B | PASS | test sums added files only (gap 4); Leader measured the real delta |
| NFR-1…5 | Size, disclosure, host-agnostic, no network, no `model:` | integration | NFR tests | PASS | NFR-2 by structure (catalog in `references/`) |

## 8. Remediation

None required — no FAIL, no `PRODUCT_BUG`.

## 9. Accepted Gaps

| # | Gap | Why | Remediation / owner |
|---|---|---|---|
| 1 | FR-3/4/5/6 behaviour rests on T7, not on an automated suite | Needs a live agent + Archify + Chrome; T7 executed it under user authorization | `/akili-validate` may re-walk; no CI automation planned |
| 2 | FR-5 "failed after Archify's repair limit" and FR-7 update-notice relay not exercised | No failure occurred; network forbidden by the user | Reviewer walk of SKILL §5/§7 text (done in T1); live check optional later |
| 3 | FR-2 behavioural "TRD always carries both C4 slots" not executed | No constitution run in scope; T7's toy TRD is explicitly not FR-2 evidence | `/akili-validate` walkthrough, or a first real `/akili-constitution` run |
| 4 | Pack-growth assertion in the test is approximate | Sums added files, not a before/after tarball | Leader's real `npm pack` delta (+13 591 B) recorded above |
| — | Advisory (from T7): Archify `review-<n>` out-dir after a browser-check could move a repaired HTML off the slot path | Not exercised; user decision 2026-10-18: keep as advisory, candidate for a separate spec | Separate proposal if the user chooses |

## Addendum — remediation pass after validation (2026-10-18)

**Overall: PASS** — `npm test` 272/272 before **and after** a simulated `/akili-archive` folder move.

| Finding | Fix | Evidence |
|---|---|---|
| F-1 (FAIL) — FR-2/FR-4 tests read `docs/specs/changes/archify-diagrams/` at runtime | `SPEC_DIR` removed; `FR2_SLOTS` (10 rows) and `LINK_LINE_TEMPLATE`/`LINK_LINE_SUFFIX` inlined as literals, checked byte-exact against `git show 47bdc9b:` copies ("FR-2 rows byte-exact: 10 / 10"; "template in design.md: true  suffix: true") | Tester: scratch export with the spec folder moved to `docs/specs/archive/2026-10-18-changes--archify-diagrams` → 13/13. Leader re-run: full working tree copied, folder moved → `npm test` 272/272 |
| A-10 (advisory) — Step 3 compared to `git merge-base master HEAD` | Replaced by a content check: Step 3 `doesNotMatch(/diagram/i)` and names no `Kind` outside `guide-sync`, `factual-sweep`, `trd-adr` (set quoted from Step 3 at `47bdc9b`); `DD_MUTATE_COMMANDS_DIR` seam extended to `akili-archive.md` | Falsifiers executed and reverted: (a) `C4 Container` `always`→`sometimes` → `not ok 3 … FR-2` (`# fail 1`); (b) `- Kind: diagram-sync` in Step 3 → `not ok 6` "must stay diagram-free"; (b2) `- Kind: cache-sync` → `not ok 6` "got cache-sync, factual-sweep, guide-sync, trd-adr" |
| W-3 | `CHANGELOG.md:11` → "Every filled diagram slot … is an inline Mermaid block" (Leader inline) | matches `SKILL.md:36` |

Leader re-run after all fixes: `npm test` `# tests 272` `# pass 272` `# fail 0`; pack unpacked 4 507 762 B (+13 588 B vs pre-spec); `git diff --check` clean. Tester: 1 spawn (`opus`), `STATUS: PASS`, 96-line change to `test/diagram-design.test.js`, no product file touched.
