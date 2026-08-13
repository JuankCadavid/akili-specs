# Judgment Day Ledger — `changes/audit-phase-tier-drift`

| Field | Value |
|---|---|
| Target | `proposal.md` + `requirements.md` + `design.md` (under judgment) + `.claude/commands/akili-audit.md` |
| Mode | `judgment_day` — blind dual judge |
| Round | 1 |
| Judges | `judge-b`, `judge-c` (both `sonnet`; design authored on `opus` — author ≠ auditor honored) |
| Confirmed severe | 4 |
| Suspect (single judge) | 7 |
| Contradictions | 0 |
| Correction scope | **Bounded fix of the 4 confirmed only** (user decision) |
| Rounds used | 2 fix rounds, 1 scoped re-judgment (ceiling: 2 and 2) |
| Status | **Closed — `JUDGMENT: APPROVED`** |

## Round 2 — scoped re-judgment and final fix

**Re-judgment judges:** `judge-d`, `judge-e` — **identical criteria** this round, correcting the round-1 protocol deviation. Both delivered; `judge-d` required one poke.

| Finding | `judge-d` | `judge-e` | Outcome |
|---|---|---|---|
| C1 count | RESOLVED | RESOLVED | ✅ Closed |
| C2 record format | RESOLVED | RESOLVED | ✅ Closed — malformed-record handling explicitly verified by both |
| C3 NFR owners | RESOLVED (DD-8 thinner) | RESOLVED (DD-8 thinner) | ✅ Closed — both flagged the same asymmetry; DD-7 is mechanism, DD-8 is enforcement riding an existing gate |
| C4 authority resolution | **NOT FULLY RESOLVED** | **PARTIALLY RESOLVED** | ⚠️ Survived round 1 → final fix round |

**C4 residual (both judges, independently):** the round-1 correction hand-listed five host paths and (a) named 1 of Antigravity's 3 command roots, (b) omitted every `--local` Antigravity variant while including local variants for the other two hosts, and (c) probed only `npm root -g`, missing pnpm's separate global tree. `judge-d` and `judge-e` both classed this as **the original C4 defect recurring inside its own fix**.

**Orchestrator verification:** confirmed against source — `TOOL_REGISTRY.antigravity` writes 3 command roots (`bin/akili.js`); `baseAntigravity` swaps to `process.cwd()/.gemini` under `--local`; `bin/akili.js` states in its own comment *"pnpm keeps its own global tree, so each manager must be probed separately."*

**Round-2 fix.** DD-1 step 2 now **derives** the roots from `TOOL_REGISTRY` instead of enumerating them, with the current list kept as a reader's anchor — the same structural-rule-with-anchors shape as DD-3, and the same reasoning FR-5 applies to the audit's own guardrail list. Step 1 probes npm *and* pnpm global roots. §9 reconciles the budget against DD-7/DD-8 (raised by both judges as non-blocking).

**Root cause of the recurrence, recorded:** a hand-written enumeration in a document that ships separately from the artifact it describes. The design was detecting that defect class in the audit while committing it itself.

**Final verification (orchestrator, direct):** all 3 Antigravity command roots present in DD-1; `pnpm root -g` present; `--local` variants covered by the both-forms clause; authority is `TOOL_REGISTRY`, not the list. **C4 closed.**

## Terminal receipt

| Field | Value |
|---|---|
| Confirmed severe | 4 — **all resolved** |
| Suspect (`info`, unfixed by user scope decision) | 7 — JB-4, JB-6, JB-7, JB-8, F4, F5, F6 |
| Contradictions between judges | 0 |
| Correction work units | 2 fix rounds, 8 edits across `design.md` + `proposal.md` |
| Scoped re-judgment | 1 of 2 permitted — C1–C3 passed, C4 failed and took the final fix round |
| Fix-caused defects found | 3 — 2 caught by the orchestrator's own closure sweep (duplicated paragraph, stale "two prose edits" count), 1 by both judges (C4 path list) |
| Artifacts | `judgment.md` (this ledger), `design.md`, `proposal.md` |
| Skill resolution | `judgment-day` (AKILI integration profile); reference files unavailable, contract followed from SKILL.md alone |

**JUDGMENT: APPROVED ✅**

## Protocol deviations (disclosed)

1. **Judges received non-identical criterion 5.** `judge-a`/`judge-c` were scoped to DD-1 feasibility, `judge-b` to DD-2/FR-3 interaction. The skill's hard rule requires identical scope and criteria. Consequence: findings in those two areas could not be cross-corroborated by construction, so single-judge status there reflects the orchestrator's error, not weak evidence. Mitigated by the orchestrator independently verifying C1 and C4 with direct commands rather than relying on vote count.
2. **`judge-a` never delivered.** It went idle twice — once after a poke-once retry — without emitting findings. Replaced by `judge-c` with an explicit delivery contract in the prompt. Recurrence of KZ-003 (4th observed instance); the poke-once protocol failed here for the first time.

## Confirmed severe (both judges)

### C1 — False category count, propagated across two documents
- **Judges:** `judge-b` JB-1, `judge-c` F1
- **Claim:** `design.md` §3 — *"Step 2, nine drift categories … adds a tenth category and amends part of the ninth"*; `proposal.md:102` — *"nine categories today"*
- **Reality:** `.claude/commands/akili-audit.md` Step 2 has **11** top-level categories (`:49`–`:59`). The new one would be the **12th**; the amended one (Model Generation Drift) is the **11th**.
- **Orchestrator verification:** direct count — 11 bullets enumerated.
- **Why it matters:** a false factual claim about the very file being edited, and both spec documents agreed with each other while both were wrong — the cross-document corroboration failure the judge brief warns against (KZ-002 class).

### C2 — DD-2 gives no recognizable format for the divergence record
- **Judges:** `judge-b` JB-2 (SEVERE), `judge-c` F3 (WARNING)
- **Claim:** the record lives in the project's `## Model Routing` section, naming phase, chosen tier, packaged tier accepted against, and reason.
- **Defect:** no syntax, marker, or template is given. The record lives in the *same section* FR-1 scans, so an auditing agent has no stated way to tell a record from an ordinary assignment, nor to extract the "packaged tier accepted against" that FR-3's re-report rule needs.
- **Why it matters:** FR-3 is not executable as written — the "prose agents cannot execute" class that `requirements.md` §8 names as this spec's own primary risk.

### C3 — NFR-2 and NFR-3 have no design owner
- **Judges:** `judge-b` JB-3 (SEVERE), `judge-c` F7 (SUGGESTION)
- **Defect:** NFR-1→DD-5, NFR-4→§3, NFR-5→§9 each have a named owner. NFR-2 (zero findings on a conformant project) and NFR-3 (non-regression of the existing categories) have none; zero-noise behavior was assumed from "compares and reports each difference" rather than designed.
- **Why it matters:** `proposal.md` names the cry-wolf risk explicitly, and the design meant to answer it does not.

### C4 — DD-1's authority resolution is both under-specified and factually wrong
- **Judges:** `judge-b` JB-5 (no resolution procedure), `judge-c` F2 (the named path is not universal)
- **Claim:** *"Installed `.claude/commands/*.md` Model checkpoints … Always present in an AKILI project"* — described in DD-1 as what makes the design work.
- **Reality:** `bin/akili.js` `TOOL_REGISTRY` installs to `os.homedir()`-based roots by default — `~/.claude/commands`, `~/.config/opencode/commands`, `~/.gemini/antigravity/global_workflows` — and only reaches the project tree with `--local`. An OpenCode-only or Antigravity-only project never creates `.claude/commands/` at all.
- **Orchestrator verification:** read `bin/akili.js:76–106`; confirmed.
- **Root cause of the error:** the "11 commands carry checkpoints" evidence was gathered by grepping *this* repository — the methodology source, where `.claude/commands/` exists by construction. Generalized from the one sample incapable of falsifying the claim (KZ-002 class).

## Suspect — single judge, recorded as `info`, not fixed this round

| ID | Judge | Finding |
|---|---|---|
| JB-4 | b | DD-2 never answers what happens when `/akili-constitution` rewrites the `## Model Routing` section the record lives in |
| JB-6 | b | Design conflates "not copied into the project" with "not packaged"; never cites `package.json`'s `files` field, which is what makes source 1 resolvable |
| JB-7 | b | Surface Table states no insertion point for the new category; an implementer could invalidate the `:55-59` citations this spec relies on |
| JB-8 | b | `akili-audit.md:125` requires categories with no findings to be "reported as clean"; FR-1 forbids an informational "all good" entry. Tension unresolved in the design |
| F4 | c | DD-2's passive "is recorded" could be read as license for the audit itself to write the note, violating NFR-1. DD-5 extends report-only to FR-5 explicitly but not to DD-2 |
| F5 | c | FR-2 requires citing the packaged rationale "by location"; no DD fixes the citation format |
| F6 | c | DD-1 implies sub-role tier naming is distinctive to `/akili-execute`; `akili-test.md` names its Leader/Tester tiers the same way |

## Verified accurate by the judges (no defect)

- `:59(c)` is correctly the sub-item (c) of Model Generation Drift.
- "Five routing categories (`:55`–`:59`)" — exactly 5 bullets span those lines.
- All 11 commands carry exactly one Model checkpoint each, and `akili update` force-reinstalls them.
- The 6-surfaces-across-3-files table is internally consistent with the proposal's scope.
