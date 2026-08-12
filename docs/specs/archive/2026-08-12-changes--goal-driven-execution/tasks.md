# Tasks: Goal-Driven Unattended Execution

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/goal-driven-execution` |
| Depth | Lite |
| Status | Draft — Phase 3 |
| Date | 2026-08-12 |
| Budget (from design §6) | 1 task · ~35–40 added lines · 1 review round |

## 2. Task List

### T1 — Write the unattended-mode guidance across all four surfaces

| Field | Value |
|---|---|
| Status | `[x]` complete — PASS attempt 1, 2026-08-12 (evidence: `execution.md` §2 T1) |
| Size | S |
| Dependencies | none |
| Requirements | FR-1 (scenario + both BUTs + both AND IT MUSTs), FR-2 (scenario + BUT + AND IT MUST), FR-3, NFR-1, NFR-2 |
| Design | §3 all four surfaces, §4 template, DD-1…DD-4 |
| Skills | `cognitive-doc-design` |

**Scope:** the 4 edits from design §3 — Unattended Mode block in `.claude/commands/akili-execute.md` (inside the Step 5 pre-approved context, per DD-1), per-host launch extension in `docs/flow.md` fleet precondition 2 (referencing, not duplicating, the template — DD-2), one capability sentence in `docs/commands/akili-execute.md` (DD-3), CHANGELOG `### Added` entry classified **minor**.

**Verification:**
- `grep -n "goal" .claude/commands/akili-execute.md` — every hit inside the Unattended Mode block adjacent to the Approval Mode paragraph. *Disqualifier:* any hit outside that block fails FR-1 BUT regardless of its wording.
- Template present verbatim once (surface 1); `grep -c` the template's first clause in `docs/flow.md` = 0 (reference only, DD-2). *Disqualifier:* a second copy is drift, not coverage.
- `grep -n "Antigravity" docs/flow.md` — the launch lines state artifact-based, user-verified completion. *Disqualifier:* any phrasing implying Antigravity platform-evaluates a condition is misinformation (FR-2 BUT) — remove, don't soften.
- Both pinned URLs present (`code.claude.com/docs/en/goal.md`, `antigravity.google/blog/...`) at the claims they back (NFR-1). *Disqualifier:* a claim not stated by its pinned source — omit or fix, never keep.
- `git diff --stat` total added ≤ ~40 lines (NFR-2); 4 surfaces consistent (FR-3) — grep each for contradiction.
- *Presence-assertion limit:* greps prove placement and wording, not that the condition template actually drives a run to completion — that behavioral proof is out of scope for a docs change and recorded as accepted (the template's mechanics follow the pinned doc).

**Done:** all greps pass with zero disqualifiers; human gate confirms context and claim truthfulness.

## 3. Coverage Map (clause level)

| Requirement clause | Owner |
|---|---|
| FR-1 scenario + BUT (no `/goal` outside pre-approved) + BUT (exception disjunction never optional) + AND IT MUST (turn bound aligned) + AND IT MUST (optionality stated) | T1 |
| FR-2 scenario + BUT (Antigravity truthfulness) + AND IT MUST (no OpenCode claim) | T1 |
| FR-3 (mirror line + CHANGELOG minor, consistent) | T1 |
| NFR-1 (pinned claims — KZ-001) · NFR-2 (≤ ~40 lines) | T1 |

No orphan clauses.

## 4. Estimate & Delivery

~35–40 added lines, single commit, direct-to-master per repo flow. Single PR-equivalent — no split needed.
