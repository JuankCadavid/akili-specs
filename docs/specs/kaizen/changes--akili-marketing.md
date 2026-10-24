# Kaizen Entry — changes/akili-marketing

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-marketing` |
| Date | 2026-10-24 |
| Branch | JuankCadavid/akili-marketing (spec branch: `Default Branch: master`, `Integration Branch: dev`) |
| Archive Run | 1 |
| Approval Mode | gated (specify gates auto-approved by user mandate) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 12 (T8 split into T8a, T8b, T8c) | tasks.md |
| Reviewer FAIL rework attempts | 8 in total. T1 ×1: kept ranges contained vendor hits. T2 ×1: nonexistent `Adapted from` paths. T4 ×2: FB rows came from a dropped range, then "never reported" let an over-cap caption pass silently. T5 ×1: the `--published` correction path was blocked and the overrun rule covered hard limits only. T8a ×2: overstatements, then a Leader-added `[advisory-grade]` edit narrowed `--published`. T8b ×1: a padding paragraph written to meet an unexecuted ≥ 7 count. | execution.md |
| HALTs / FATAL_FAILs | 0 / 0 | execution.md |
| Pivots | 1, withdrawn. The user deferred T10 (`6c8c8a3`) and reversed the deferral before closing; the dogfood ran. | execution.md *T10 — Pivot*, *T10 — Observation* |
| Budget | 12/12 tasks · ~2,017 of ~2,600 LOC · review rounds 20 of 20, the cap, plus 1 round the user authorized for observation only (21) | execution.md running totals |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 6 (J-1…J-6), all fixed before approval | judgment.md |
| Validation FAIL / WARN | 0 / 2 (NFR-3 Windows CI not run; single-run T10). One stale figure was corrected during validation: requirements §4, 224 → 228 is the stub count. | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` / `REVIEW_SKIPPED` | 0 / 0 | execution.md |
| Escaped defects | 0 product defects. One test-side incident: the `/akili-test` Tester wrote 15 paths into the real HOME, and the T10 session then loaded the skill from that stray copy. | test-report.md §2; t10-dogfood.md |
| Drift attributable | None. `docs/specs/audits/` holds no `drift-*.md`. | — |

## Lessons

### KZ-changes--akili-marketing-1 — Exploratory installer runs pin HOME too

| Field | Value |
|---|---|
| Root cause | The Tester slice and persona require hermetic *tests*, and every committed test spawn pins `HOME`, `USERPROFILE`, `CODEX_HOME`, `CURSOR_CONFIG_DIR` and `AKILI_GROKBOT_TARGET`. Nothing covers the *exploratory* runs a Tester makes to learn a CLI's layout before it writes a test. The first `install --tool all` therefore ran against the real HOME. It created 15 new paths, which the permission classifier then stopped the Tester from removing. A later fresh session (T10) loaded `social-marketing` from that stray `~/.claude/skills` copy. |
| Evidence | `test-report.md` §2 (incident, 15 paths, timestamp 13:25:06); `t10-dogfood.md` (the session reports loading the skill "from your global copy at …/.claude/skills/social-marketing") |
| Target | Methodology (the `/akili-test` Tester contract and its slice). This repo is the methodology, so this is an upstream item. |
| Severity | Medium |

### KZ-changes--akili-marketing-2 — `[advisory-grade]` brief items edited a gate sentence

| Field | Value |
|---|---|
| Root cause | The Leader tagged a brief item `[advisory-grade]`, and the tag reads as a lower verification bar. The item edited a sentence that restates a gate (`--published` step 1) and narrowed it. The Reviewer failed it. Verification depends on what an edit touches, not on the source of the brief item. |
| Evidence | `execution.md` T8a attempt 2 → FAIL, attempt 3 → PASS (the Leader's own lesson line: "advisory-grade brief items need the same quote-check bar") |
| Target | Methodology (`/akili-execute` brief convention) → upstream |
| Severity | Medium |

## Noted, not a lesson

- The 12-step T10 script and its Disqualifier (expectations kept out of the observed session) worked as designed. The observer also edited the snapshot side of an approved section by accident, and the mismatch check caught it all the same.
- Running the dogfood as `claude -p --continue` gave the agent no shell to count characters with. Limit counts are hand estimates whenever the host runs without shell permission.
- Text-contract suites with a mutate-root hook (`AM_MUTATE_ROOT`, `AMD_MUTATE_ROOT`) again proved cheaper than rewriting files in place. This matches the `SEO_ROOT` note in `changes--seo-analytics`.
- Root-guide factual sweep: `AGENTS.md` and `CLAUDE.md` state no command or skill totals. The *Skill Usage* line for `social-marketing` was added in T8c. Nothing was falsified, so no `factual-sweep` item was recorded. No module was created, so no `guide-sync` item. No TRD exists in this repo, so no `trd-adr` item.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | `/akili-test` Phase 2 (Tester rules) and `.claude/templates/tester.md` |
| Edit | Append to the Tester rules: "Any exploratory run of a command that writes outside the repo — an installer, a `doctor --fix`, a config writer — pins the same environment as the tests (`HOME`/`USERPROFILE` and every tool-specific target variable) to a scratch directory, from the first invocation. Learning the layout is not an exemption." |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | upstream |
| Target | `/akili-execute` brief contract (the `[advisory-grade]` marker) |
| Edit | Append where the marker is defined: "`[advisory-grade]` labels where an item came from, never how hard it is checked. An item that touches a gate, invariant or restated rule carries the same quote-check and falsifier bar as any scoped item." |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--leader-brief-contract-2 |
| Edit | Add `changes/akili-marketing` as a source spec with the recurrence note "recurred (changes/akili-marketing: T8b verification predicted 'README ≥ 7' without running the count; the Implementer added a padding paragraph to meet it, the Reviewer failed it, and the count was amended to ≥ 6)" |
| Severity | High |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add `changes/akili-marketing` as a source spec with the recurrence note "recurred (changes/akili-marketing: T8a attempt 1 overstated the session-tool scope and the limits scope on the docs page; a requirements §4 stub figure (224 → 228) survived to validation beside the shipped 236)" |
| Severity | High |
| Status | pending |

### P5

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--scoped-constitution-reads-2 |
| Edit | Add `changes/akili-marketing` as a source spec with the recurrence note "recurred (changes/akili-marketing: 20 rounds for 12 tasks hit the cap at T10 exactly; the HITL observation task needed a user-authorized 21st round — budget a HITL observation task's round explicitly)" |
| Severity | Medium |
| Status | pending |
