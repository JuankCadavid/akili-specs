# Test Report: Video Deliverable Track

**Overall: FAIL — 3 ambiguity findings in shipped prompt text (F1–F3); all automated tests green.**

| Signal | Result |
|---|---|
| Automated suite (`npm test`) | **275 / 275 pass**, 0 fail, 0 skipped (exit 0) — includes 16 new tests in `test/video-production.test.js` |
| Packaging | `verify:cli` → `11 commands \| 25 skills \| 8 resources (akili-specs v2.32.2)`; `git diff --check` clean |
| Held-out prompt walkthrough | **32 cases: 29 PASS, 3 FAIL** (F1, F2, F3) — `test-walkthrough.md` |
| Live render evidence | Cited from T12 (`t12-smoke-evidence.md`), not re-run (would re-download ~200 MB; consent-gated) |
| Product bugs | 0 classified `PRODUCT_BUG`; F1 is the strongest candidate (see §8) |

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-deliverable-track` |
| Depth | Standard |
| Date | 2026-10-18 |
| Tested at | `e78d4c6` + untracked test artifacts |
| Leader | Claude Code, Opus 5.5 |
| Testers | 2, in parallel, both `opus` (Implementers were `sonnet` — author ≠ tester) |
| Spawn path | No `akili-tester` wrapper → fallback sub-prompt; each Tester read `.agents/tester.md` |

## 2. Summary

- **Suites:** 2 — Suite 1 static contract tests (`node:test`, automated); Suite 2 held-out prompt-behaviour walkthrough (manual — `requirements.md` §8 names a walkthrough the substitute for "prompt behaviour — no automated check"). No suite run inline.
- **Deployment:** independent suites (one writes `test/`, the other one spec-folder markdown) → 2 Testers in parallel. Full `npm test` and `verify:cli` re-run by the Leader after both reported (quiet tree).
- **Runtime event:** Suite 2's Tester died on a provider session limit (HTTP 429) after writing its complete `test-walkthrough.md` but before reporting. Tree probed (file present, 30,853 B); recovered by resume-by-message (rung 3); the worker confirmed the file complete and sent its report. No attempt consumed.
- **Skills:** Suite 1 — defaults (no deviation); Suite 2 — defaults. Effort: medium / high.
- **Lookup note (Suite 1):** P-22 records 2 test-command hits plus `:193`; the working tree has 3, matching the lower bound used.

## 3. Backend Unit Tests

n/a — no runtime code changed (`bin/` untouched, design §7).

## 4. Frontend Unit Tests

n/a — no UI (design §8).

## 5. Integration Tests — Suite 1 (`test/video-production.test.js`, new)

`node --test test/video-production.test.js` → 16 / 16 pass (Tester and Leader re-run). Text tests read the shipped files; `VIDEO_PRODUCTION_TEST_ROOT` (test-only env hook) points them at a scratch copy for mutation runs.

| # | Test | Requirement |
|---|---|---|
| 1 | Frontmatter is the original-authorship variant | FR-8 |
| 2 | `heygen` only on inspired-by, install-route and Attribution lines | FR-8 `BUT` |
| 3 | Exactly 3 files, ≤ 20,000 B (`statSync`) | NFR-3 |
| 4 | Every `npx hyperframes <sub>` ∈ verified set; outward names only on the consent line | NFR-2, DD-8 |
| 5 | Telemetry off; consent each time; post-render report off | FR-5 |
| 6 | Gate accepts `hyperframes` and `/hyperframes:hyperframes`; missing router → STOP, no pipeline, no copy, no install | FR-4 Not installed |
| 7 | Core route has no `-g`/`--global`; `skills update` labelled global + consent | FR-4, DD-10, P-24 |
| 8 | First-render row: browser download, `~/.cache/hyperframes`, `~/.hyperframes`, network, consent, caches ≠ skill install | FR-4 (A3) |
| 9 | `skills check` global-only; `skills-lock.json` for project installs | FR-4 (A3) |
| 10 | Host dirs: `.claude/skills` / `.agents/skills` | NFR-4 |
| 11 | Duration table: target ± tolerance (default ± 0.1 s) and `data-duration`; FAIL if either; `check` exit never offsets | FR-6, DD-12 |
| 12 | `Deliverable: video` ≥ 5 (specify), ≥ 3 (test), ≥ 4 (validate) | NFR-1, P-22 |
| 13 | Specify Video Mode: absent row = software | FR-1 Default |
| 14 | Governance rule 4: load-direct only behind selector + gate; illustrative / Skill Map-builder exempt | FR-9 |
| 15 | Governance rule 2: no unconditional "every command must still work without it" | FR-9 |
| 16 | `install --tool all --dry-run` (temp `HOME`): all 5 targets list `skills/video-production`; `HOME` stays empty | FR-10, P-5 |

**Mutation runs (red → green, on a scratch copy; tree never edited):** test 4 — appended `npx hyperframes publish` → `not ok 4`, `references/render-evidence.md:45 instructs unverified subcommand "npx hyperframes publish"`; test 11 — check-offset sentence removed → `not ok 11`, `FR-6 BUT: must NOT pass because check exited 0`; test 15 — old rule-2 sentence restored → `not ok 15`; test 14 — "load-direct" → "name" → `not ok 14`. Each mutated run 15 pass / 1 fail; unmutated copy 16/16.

## 6. E2E Tests

| Evidence | Source | Result |
|---|---|---|
| Project-scoped install, `check`, `snapshot --at`, `render --quality draft`, `ffprobe` (5.000000 s, h264 1920x1080 30/1) | T12, `t12-smoke-evidence.md` | PASS (cited, not re-run) |
| Duration falsifiers A (target) and B (`data-duration`) | T12 | FAIL as required |

**Suite 2 — held-out walkthrough** (`test-walkthrough.md`): 32 cases, none reusing an execute-time case; each case's wording grepped over the shipped text — none cited as an example (disqualifier clear).

## 7. Coverage & Traceability

| Requirement | Scenario | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|
| FR-1 | Video / mentions video `BUT` / orthogonal `AND IT MUST` ≤ 1 question | walkthrough | C1, C2, C3, C9 | PASS | |
| FR-1 | Trivial × video (propose) / Neither kind / Default / Reaches every reader | walkthrough + unit | C5, C4, C7, C8; test 13 | PASS | |
| FR-1 | Trivial × video: direct `/akili-quick` escalates (`AND`, `BUT`) | walkthrough | C6 | **FAIL** | F1 |
| FR-2 | Criteria present; Bug × video regression `BUT` | walkthrough | C10, C11 | PASS | |
| FR-3 | Skills assigned + deviation recorded | walkthrough | C12, C13 | PASS | |
| FR-3 | Delivery render approval-gated; quiet tree at execute | walkthrough | C14, C16 | PASS | |
| FR-3 | Quiet tree (`BUT`) with parallel `/akili-test` suites | walkthrough | C15 | **FAIL** | F2 |
| FR-4 | Not installed (`AND IT MUST` both names, `BUT`) | unit + walkthrough | tests 6, 7; C17, C18 | PASS | |
| FR-4 | First render fetches a browser (A3); freshness scope (A3) | unit + walkthrough | tests 8, 9; C19, C20 | PASS | |
| FR-4 | Validate BLOCKED; software unaffected | walkthrough + unit | C21, C22; tests 12, 13 | PASS | text gating only — no runtime to execute |
| FR-5 | Telemetry off, no feedback | unit + live | test 5; T12 (0 feedback matches in logs) | PASS | suppression source-read (`policy.ts:31-55`), not network-observed |
| FR-6 | Duration drift `BUT`; stated tolerance; outside default; HyperFrames missing STOP | unit + walkthrough + live | test 11; C23, C25, C26; T12 | PASS | |
| FR-6 | Inside default tolerance vs `data-duration` | walkthrough | C24 | **FAIL** | F3 |
| FR-7 | No PASS without final look; delivery render after approval | walkthrough | C27, C28 | PASS | |
| FR-8 | Frontmatter, name `BUT`, HeyGen sites | unit | tests 1, 2 | PASS | "no upstream passage copied" covered at T1 (7 sentences `grep -F` → 0), not re-automated (needs the upstream clone) |
| FR-9 | Load-direct rule; rule 2 reconciled | unit | tests 14, 15 | PASS | README / `flow.md` / `AGENTS.md` restatements covered by T10's phrase-family sweep, not automated |
| FR-10 | Installer reach; fixtures; docs | unit + suite | test 16; `npm test` 275/275 | PASS | |
| NFR-1 | Software path untouched | unit + walkthrough | test 12, 13; C29 | PASS | |
| NFR-2 · NFR-3 · NFR-4 | Command set · size · host dirs | unit | tests 4, 3, 10 | PASS | NFR-4 live run on Claude Code / macOS only (accepted, design §8) |
| NFR-5 | `npm test`, `verify:cli`, `pack:dry-run`, `git diff --check` | suite | Leader re-run | PASS | `pack:dry-run` last run at T11/A3 (4 new packaged files); test files are not packaged |
| Design §3 | archive / audit / resume fall-throughs | walkthrough | C30, C31, C32 | PASS | |

## 8. Remediation

| ID | Finding (verbatim evidence) | Requirement | Fix | Route |
|---|---|---|---|---|
| F1 | `akili-quick.md:49` "If the change fails **any** gate criterion, do **not** fast-track it" — none of the five criteria names video; `:52` lets a cosmetic typo stay in quick; `:55` "…so it is never fast-tracked" sits in the escalation list. Reading A: quick edits the composition (violates FR-1 `AND`/`BUT`). Reading B: escalates. Same observation the T9 Reviewer recorded | FR-1 Trivial × video | Make "not a video composition" a gate criterion, or open `:55` with "Regardless of the criteria above" | Rework of T9 (shipped text) — strongest `PRODUCT_BUG` candidate |
| F2 | `akili-test.md` Deployment Rule "Spawn **one Tester per suite, in parallel**"; `render-evidence.md:3` "run the quiet-tree rule first"; nothing makes the render suite run alone — a draft render can run beside a sibling Tester | FR-3 `BUT` (quiet tree) | Add to the render-evidence suite line: run it alone, after any other Tester's report | Rework of T7 |
| F3 | `render-evidence.md:24` applies the ± 0.1 s default to the target comparison only; `:25` (`data-duration`) states no tolerance; `:27` FAIL "if either comparison fails" — 12.08 s vs `data-duration="12"` fails read exactly, passes with the default | FR-6 | State the tolerance for the `data-duration` comparison | **Requirement amendment** — FR-6 itself is silent (Pivot Protocol) |

## 9. Accepted Gaps

| Gap | Reason |
|---|---|
| Live render not re-run at test time | Re-running would re-download the ~200 MB browser the user had deleted; T12 evidence (same commit line, unchanged render path) is cited instead |
| FR-8 "no upstream passage copied" not automated | Needs the upstream clone; executed at T1 (7 sentences, 0 hits) |
| Prompt behaviour on hosts other than Claude Code | NFR-4 accepted risk (design §8) |
| Walkthrough advisories A1–A5 (`test-walkthrough.md`) | Recorded only — advisories never become tasks; e.g. A1 specify without a proposal never enters Video Mode, A2 propose Bug Track may run HyperFrames before the bridge loads, A5 no Tester status for "awaiting consent" |
