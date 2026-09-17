# Kaizen Entry — changes/codex-install-target

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/codex-install-target` |
| Date | 2026-09-17 |
| Branch | master (default branch — unique `main`/`master` rule; no `Default Branch:` pin) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 7 (+2 user-approved deltas: DD-12 reopen wave, `CODEX_HOME`) | tasks.md, execution.md |
| Reviewer FAIL rework attempts | 9 (T1 ×1, T2 ×1 via CI, T3 ×2, T4 ×1, T5 ×1, T6 ×1, reopen ×1, `CODEX_HOME` delta ×1) | execution.md task entries |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 1 (T2 — FR-4 byte-identity clause contradicted FR-5/FR-8; amended to layout identity + source-equality) | execution.md — ## Pivot Record: T2 |
| PRODUCT_BUGs | — (no test-report.md; no unit harness for the installer) | — |
| Judgment-day severe findings | 5 confirmed severe + 3 verified suspects, fixed at specify (round 1, no re-judgment) | judgment.md |
| Validation FAIL / WARN | — (no validation-report.md; FR-10 live validation was the closing gate) | — |
| Budget | 7 tasks / ~560 lines / 8 rounds → 7 (+2) / ~1,200 / 19 | execution.md §3 |
| Reviewer runtime failures | 3 usage-limit interruptions; model fallback (`fable`) preserved author ≠ auditor | execution.md T1/T1-delta entries |
| Drift attributable | none reported (no audit report under `docs/specs/audits/`) | — |

## Lessons

- **KZ-changes--codex-install-target-1 — Task independence must count a task's *inputs*, not only the files it edits.** (Methodology, Medium)
  - Root cause: the Leader paired T2 (regression script, whose verification installs from the whole `.claude/` tree) with T3 (editing `.claude/commands/akili-constitution.md`) on the "disjoint files" test alone; T2's measurement ran on T3's mid-edit file. `.claude/templates/leader.md` names build output, ports and dependency trees as hidden shared state, but not *read inputs* — a task whose check consumes a tree another task is writing is not independent.
  - Evidence: execution.md — ## Pivot Record: T2, row "Second finding (Leader error, recorded for kaizen)".
  - Standardization: → P1

- **KZ-changes--codex-install-target-2 — A verification that resolves a tool by name must mask every path that could satisfy it without the artifact under test.** (Methodology, Medium)
  - Root cause: T2's disqualifier named one shadow (`npx` resolving a local link) but the machine's **global install** of `akili-specs` satisfied `npx akili-specs@2.23.2 …` by putting an `akili` bin on PATH; every local run passed against the wrong artifact, and the CI cold runner was the first honest run (`sh: akili: not found`, all six legs). `/akili-specify` Step 3.2 asks for "the input that would make the check fail" but not for the environment paths that could make it pass for the wrong reason.
  - Evidence: execution.md — T2 CI evidence (run 35154662410) and T2 attempt 2 root cause.
  - Standardization: → P2

- **Recurrence — KZ-001 (read the pinned source past the section you came for; a claim must state what the source states).** Three first-attempt FAILs in one spec were pin/quotation defects: T4 tenant claim asserted a negative the page is silent on; T5 "names no second flagship" overstated the page; the reopen wave fused two page sentences inside quotation marks. Root cause unchanged from KZ-001 — recorded as `digest-update` (severity → High, this spec added) plus the deferred KZ-001 edit finally proposed for application → P3, P4.

## Noted, not a lesson

- The Step 8F gate script needed three review rounds (multi-file `apply_patch`, CRLF header, `+`-bullet extraction): each was a real silent-allow bypass caught by a Reviewer who *executed* the script rather than reading it — positive evidence for "run the artifact" reviews on security guards; below the lesson bar because the Reviewer persona already says so.
- `CODEX_HOME` appeared in the requirements glossary ("config home `$CODEX_HOME`, default `~/.codex`") but no task clause required honoring it; discovered only in live validation. Sub-threshold: a glossary term that names an environment variable should generate a requirement clause — feeds recurrence.
- Windows content leg of the regression gate is near-blind (CRLF checkout): layout identity carries the gate. Recorded in execution.md; no rule yet.
- Reviewer usage-limit interruptions ×3: the runtime-failure fallback (retry once, then a different model) worked as written.
- Directional cross-references and stale sibling sentences (CHANGELOG `npx` phrase; "best of the three") recurred with the model-routing spec — recurrence feed.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/leader.md` — *Delegation Thresholds*, paragraph "**Disjoint source files are necessary but not sufficient.**"; same edit in `.agents/leader.md` (deployed copy) |
| Edit | Append one sentence: "**Inputs count too:** a task whose verification *reads* a tree another task is editing (an installer or build that consumes `.claude/`, a test that loads fixtures being rewritten) shares state with it — measure after the writer lands, or serialize." |
| Severity | Medium |
| Status | applied (2026-09-17) |

### P2

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — Step 3.2 task quality rules, bullet "**name the input that would make the check fail.**" |
| Edit | Append: "Name also the **environment path that could make it pass for the wrong reason** — a global install shadowing the artifact under test, a warm cache, a binary already on PATH — and have the task mask it; a local green that a cold runner cannot reproduce was never evidence." |
| Severity | Medium |
| Status | applied (2026-09-17) |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | `KZ-001` |
| Edit | Severity Medium → **High**; add `changes/codex-install-target` as a source spec; recurrence note "3 first-attempt pin/quotation FAILs (T4, T5, reopen wave)". |
| Severity | High |
| Status | applied (2026-09-17) |

### P4

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/implementer.md` — Primary Instructions, append one bullet under *Verification Rigor* (the deferred KZ-001 home); same edit in `.agents/implementer.md` |
| Edit | Append: "**A quotation is a claim of byte identity.** Before pinning or quoting a source, re-open it and read past the section you came for; quote only text that appears verbatim, mark a negative the source is silent on as `Unverified:`, and never fuse two sentences inside one pair of quotation marks." |
| Severity | High |
| Status | applied (2026-09-17) |

## Apply pass (2026-09-17, default branch)

Backlog at this pass: only this file's items (the other two entry files were fully applied at the previous archive). "Apply all" approved. P1 → `.claude/templates/leader.md` + `.agents/leader.md` (Delegation Thresholds, "Inputs count too"); P2 → `.claude/commands/akili-specify.md` Step 3.2 (environment path that makes a check pass for the wrong reason) — no mirror site in `docs/commands/akili-specify.md`; P3 → digest `KZ-001` raised to High with this spec as a source (row count stays 10); P4 → `.claude/templates/implementer.md` + `.agents/implementer.md` (a quotation is a claim of byte identity — the deferred KZ-001 edit, now applied). Factual sweep (archive Step 3.3): root `CLAUDE.md` line 3 "reuse in Claude Code and OpenCode" → four hosts. Pre-existing template-vs-`.agents/` divergences (Shared-File Write Discipline section; leader idle-protocol caveats) observed, untouched — a `/akili-constitution` re-run refreshes the deployed copies.
