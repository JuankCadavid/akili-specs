# Archive Summary — `diagram-design` (Interactive Methodology Diagrams via Archify)

**Outcome: delivered and archive-ready.** The work shipped as one AKILI-authored `conditional` skill, `diagram-design`. It is wired into constitution, specify and archive. Mermaid stays the source of truth, and an interactive Archify HTML view is added only when the developer has Archify installed. Archify itself is credited (tt-a1i, MIT) but not vendored. Validation ended at 0 FAIL. Five WARNs were accepted by the user, and one advisory is a candidate for a separate spec.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/archify-diagrams` |
| Type / Depth | Change · Standard |
| Approval Mode | gated — every phase gate approved by Juan Carlos Cadavid on 2026-10-18 |
| Branch | `JuankCadavid/skill-archify` (spec branch; `Default Branch: master`) |
| Commits | 14 local commits, `854547f` … `efba497`, plus the archive commit. No push, release, tag or publish |
| Archive written by | Claude Code session, Opus 5.5 |

## 2. Original Spec Path

`docs/specs/changes/archify-diagrams/`

## 3. Archive Date

2026-10-18 → `docs/specs/archive/2026-10-18-changes--archify-diagrams/`

## 4. Final Status

| Gate | Result |
|---|---|
| Proposal | Approved (option C) |
| Specify | Approved (DD-3 and DD-6 as written) |
| Execute | 7/7 tasks PASS. 10 of 12 budgeted review rounds used; 3 FAILs, each fixed in one rework. No HALT, Pivot or waiver |
| Test | PASS, 272/272 (13 new tests in `test/diagram-design.test.js`) |
| Validate | First pass: 1 FAIL (F-1). After remediation: **0 FAIL**, 5 accepted WARN, 0 BLOCKED |

## 5. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | `.claude/skills/diagram-design/` is original authorship, binding `conditional`, `inspired-by` credits Archify (tt-a1i, MIT, URL), and the package ships no Archify file |
| FR-2 | `references/slot-catalog.md` defines 10 slots across PRD, UX/UI, TRD and spec `design.md`; C4 Context and Container are `always` |
| FR-3 | Each diagram is an inline Mermaid block with a legend; that block is canonical |
| FR-4 | Interactive view goes to `docs/diagrams/<slot-id>.{json,html}` or `docs/specs/<spec>/diagrams/`. The link line uses fixed wording, receipts are git-ignored, and views are re-rendered in place |
| FR-5 | If Archify is unavailable or fails, the Mermaid block stays and the phase is never blocked |
| FR-6 | If the Mermaid changes, the view is re-rendered, or the link and files are removed and the removal reported |
| FR-7 | Guard-rails: no explainer and no rules-file writes; no install or update; the update notice is shown at most once; no brand marks; no Archify flags |
| FR-8 | Wired into constitution Steps 3/4/5, specify Step 2.1, archive Step 2 item 11, and the `views-documentation.md` pointer. No command names `archify` |
| FR-9 | Governance, `docs/skills/diagram-design.md`, skills README row, README Archify note, CHANGELOG `[Unreleased]` |
| FR-10 | Install test pinned at 201 files; codex doctor fixture updated (amendment approved by the user); `npm test` green |
| NFR-1…5 | `SKILL.md` 5 989 B, dir 8 943 B; catalog in `references/`; host-agnostic command lines; no network; no `model:` |

## 6. Files Changed Summary

Shipped diff outside `docs/specs/` (`git diff --numstat 1db53eb..HEAD`): **+718 / −17** across 15 files. That is +176 / −17 excluding the 542-line test suite.

| Area | Files |
|---|---|
| New skill | `.claude/skills/diagram-design/SKILL.md` (+76), `references/slot-catalog.md` (+32) |
| Command wiring | `akili-constitution.md` (+6), `akili-specify.md` (+2), `akili-archive.md` (+1), `software-architect/references/views-documentation.md` (1 line) |
| Docs / governance | `CHANGELOG.md`, `README.md`, `docs/cli.md`, `docs/skills/README.md`, `docs/skills/diagram-design.md` (new), `docs/skills/governance.md` |
| Tests | `test/diagram-design.test.js` (new, +542), `test/install-cursor.test.js` (199→201), `test/fixtures/doctor-codex-baseline.txt` (`OK diagram-design`, `ok 44`) |
| Package | `npm pack` unpacked +13 588 B; 0 Archify files |

## 7. Test Evidence Summary

- `npm test` passes 272/272. It still passes 272/272 after simulating this archive move (validation F-1 fix).
- 13 conformance and 5-host install tests, with mutation evidence: the enumeration-wide `archify` ban, a missing install file, FR-2 literal and Step 3 `Kind` checks each went red when deliberately broken.
- Behavioural Archify evidence comes from T7, a live walkthrough with Archify `208acba` run under user authorization, offline. It covers four runs: (A) render with a browser, including a held-out lifecycle diagram; (B) no browser, exit 2 → "browser check not run"; (C) Archify absent → Mermaid only; (D) Mermaid edited → view removed. `~/.claude/CLAUDE.md` was untouched.

## 8. Validation Summary

| Pass | PASS | WARN | FAIL | BLOCKED |
|---|---|---|---|---|
| First (`3f084a7`) | 106 | 15 rows / 8 findings | 1 (F-1: test read the spec folder that archive moves) | 0 |
| Re-validation (`dcccc95`) | 111 | 11 rows / 5 findings | 0 | 0 |

Resolved in the remediation pass: F-1, W-3 (CHANGELOG "every filled slot"), W-5 (stale figures), W-6 (Draft statuses), A-10 (merge-base check).

## 9. Accepted Warnings Or Follow-Ups

The user accepted these on 2026-10-18 ("aceptando las 5 advertencias (W-1, W-2, W-4, W-7, W-8)").

| ID | Warning | Accepted because | Follow-up |
|---|---|---|---|
| W-1 | FR-2 behaviour ("TRD always carries both C4 slots, no placeholders") is only checked statically | No constitution run was in scope | The first real `/akili-constitution` run with the skill installed |
| W-2 | Untested paths: FR-5 "failed after Archify's repair limit" + its one-line report text; FR-7 update notice shown at most once | No failure occurred; network was forbidden | Optional live check later |
| W-4 | P-13 (the host lists `archify` as a skill) is still UNVERIFIED | Host route not exercisable from this worktree; the root-check fallback is proven | Live session with Archify in a scanned skills root |
| W-7 | Success criterion 1 (`/akili-constitution` with Archify → TRD with both C4 views) was never run end to end | Same as W-1 | Same as W-1 |
| W-8 | No `## Constitution Impact` block; root `AGENTS.md` Skill Usage list does not mention `diagram-design` | Spec branch: shared guides are not written here | Recorded as kaizen pending item `guide-sync` (P1 in `docs/specs/kaizen/changes--archify-diagrams.md`), applied on `master` |
| — | Advisory: after a browser check, Archify's `review-<n>` output folder could take a repaired HTML off the slot path (FR-4 reuse) | User decision 2026-10-18: keep as an advisory, do not reopen | **Candidate for a separate spec** |

## 10. Historical Notes

- **Option C** was chosen over vendoring (≈ +5.3 MB, daily upstream releases, `~/.agents/skills` name collision) and over reference-only (commands could not name slots).
- **DD-6** deviates from the proposal: `/akili-archive` Step 3 is untouched, and stale baseline slots are listed as follow-ups instead. The proposal records this.
- **Execute-time amendment** (user-approved): `test/fixtures/doctor-codex-baseline.txt` was added to FR-10, P-5 and T6. The original consumer grep keyed on count literals, not on skill names.
- **Runtime:** two workers (T2, T3) were cut off by an account session limit and resumed by message after the account switch. No attempt was lost.
- `.agents/` personas were copied (ignored by git) from the main checkout. This worktree has no Step 8E wrappers.
