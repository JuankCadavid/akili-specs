# Tasks: Spec Family Ordering (Parent→Child Control)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/spec-family-ordering` |
| Depth | Standard |
| Type | Change |
| Approval Mode | gated |
| Status | Draft — Phase 3 |
| Date | 2026-08-12 |
| Budget (from design §11) | 6 tasks · ~110–150 LOC · 1 review round |

## 2. Task Graph

```
T1 (constitution: canonical schema)
 ├─→ T2 (propose + flow.md)   ─┐
 ├─→ T3 (specify)             ─┤
 ├─→ T4 (resume)              ─┼─→ T6 (mirrors + CHANGELOG + closure sweep)
 └─→ T5 (archive)             ─┘
```

T2–T5 touch disjoint files and are parallel-safe after T1. No circular dependencies.

**Global verification caveat (applies to every task):** all greps below are **presence-assertions** — they prove the text landed, not that an agent following the command will behave correctly. The behavioral check is substituted per `requirements.md` §8: HITL walkthrough at the T6 gate, residual risk accepted until a real project exercises a split.

---

### T1 — Canonical `family.md` template in `/akili-constitution`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | none |
| Requirements | FR-1 (all clauses except the `akili-specify.md:85` and `docs/flow.md:145` enumeration hits — owned by T3/T2); NFR-2, NFR-3 |
| Design refs | §5 (schema), §7 row 1, DD-2, DD-3 |

**Scope:** `.claude/commands/akili-constitution.md` only. Add `family.md` as 4th item in Step 7's template list (`:303-305`) defining the full §5 schema (Document Control block, five child-table columns, `pending/active/done/blocked` vocabulary) **and the closed-set rule inside the template text**. Add `family.md` to the enumerations at `:37`, `:49-51`, `:325`, `:851`.

**Negative constraints owned:** BUT no packaged file / no `bin/akili.js` edit (DD-2); AND IT MUST use "spec family" in all new prose (model-family collision).

**Verification:** `grep -n "family" .claude/commands/akili-constitution.md` — every **new** hit reads "spec family" or `family.md`; the 4 enumeration sites each hit; `git diff --stat` shows only this file. *Disqualifier:* a hit count alone is not evidence — each enumeration hit must be inside its enumeration (human read of the diff); pre-existing model-family hits (`:458`, `:526`, `:557`) must be unchanged.

**Done:** schema defined once, all in-file enumerations updated, no other file touched.

**Skills:** `cognitive-doc-design`.

---

### T2 — `/akili-propose` chunking writes the manifest + `docs/flow.md` consumes it

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-2 (both scenarios, all clauses); FR-6 (scenario + no-re-derive clause); FR-1's `docs/flow.md:145` enumeration clause; NFR-3 |
| Design refs | §7 rows 2 & 6, DD-6 |

**Scope:** Both sides of the circular reference, edited together. `akili-propose.md`: manifest write inserted before folder creation (`:144`), seeded with RICE/MoSCoW order + `Depends on` + `Parallel-safe` + `Status: pending`; `Parent Spec:` row in child Document Control (`:152` structure note + `:143` bullet); closed-set rule + late-addition-requires-HITL-row rule; Greenfield track (`:107`) inherits by reference. `docs/flow.md`: precondition 1 (`:249-251`) reads independence/order from `family.md`, wording becomes "decided at decomposition time, persisted in `family.md`"; waves (`:267`) cite manifest order; general-setup table (`:145`) gains the `family.md` row.

**Negative constraints owned:** BUT no child folder created without a prior manifest row; BUT no folder creation before the approved row exists (late addition); AND IT MUST keep the existing `:143` per-child fields with the manifest as aggregate authority; BUT flow.md must NOT re-derive independence at dispatch time.

**Verification:** `grep -n "family.md" .claude/commands/akili-propose.md docs/flow.md` — hits at chunking, Greenfield-adjacent, flow precondition, and `:145` table; `grep -n "Parent Spec" .claude/commands/akili-propose.md` ≥ 1; `grep -n "specify time" docs/flow.md` → 0 hits in the fleet preconditions (DD-6 reconciliation). *Disqualifier:* schema restatement — if the diff redefines table columns instead of referencing the constitution template, NFR-3 is violated regardless of green greps.

**Done:** split flow cannot reach folder creation without the manifest step; flow.md names the manifest as the independence source.

**Skills:** `cognitive-doc-design`.

---

### T3 — `/akili-specify` mirrors the contract and reads the parent manifest

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Depends on | T1 |
| Requirements | FR-3 (scenario + warn-not-block + no-sibling clauses); FR-1's `akili-specify.md:85` enumeration clause; NFR-3 |
| Design refs | §7 row 3 |

**Scope:** `.claude/commands/akili-specify.md`. Step 1.1 chunking (`:113-115`) gains the same manifest contract as propose (by reference, not restatement — today it records no dependency fields at all); Step 0 gains: when the target path is listed in a parent `family.md`, read it and inform the spec; `:85` general-setup enumeration gains `family.md`.

**Negative constraints owned:** AND IT MUST warn (not block) when a `Depends on` child is not `done`; BUT it must NOT create sibling folders outside the closed set.

**Verification:** `grep -n "family.md" .claude/commands/akili-specify.md` — hits at Step 0, Step 1.1, and `:85`; human read confirms the dependency check is worded as a warning, not a gate. *Disqualifier:* a Step 1.1 edit that restates the column schema (NFR-3).

**Done:** specify's chunking asymmetry with propose is closed; child-targeted specify reads the parent manifest.

**Skills:** `cognitive-doc-design`.

---

### T4 — `/akili-resume` family-aware scan, dashboard, and recommendation

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-4 (scenario + all four clauses); NFR-1 |
| Design refs | §7 row 4, DD-4, reversion challenge 1 |

**Scope:** `.claude/commands/akili-resume.md`. Step 0: new item **before** the flat listing — read every `family.md` under `docs/specs/` first. Step 2: family-grouped dashboard block (order, status, blocked-by), modeled on the `:87` Kaizen-footer conditional-augmentation pattern; flat specs render exactly as today. Step 4: when a family exists, recommend the next non-`done` child with satisfied dependencies, by manifest order. Error handling `:132`: qualified — manifest-listed `pending` children are "pending by family order"; **unlisted** file-less folders keep the existing `/akili-specify` suggestion verbatim (reversion challenge 1).

**Negative constraints owned:** BUT it must NOT recommend activities absent from the manifest; AND IT MUST verify listed folders exist and report mismatches as drift (KZ-002), never reconcile; AND IT MUST remain read-only (`:117-119` Output contract untouched); NFR-1: zero added steps when no `family.md` exists.

**Verification:** `grep -n "family" .claude/commands/akili-resume.md` — hits in Steps 0, 2, 4, and Error Handling; `grep -n "No files are created or modified" .claude/commands/akili-resume.md` → still present; human read: `:132` replacement preserves the unconditional suggestion for unlisted folders. *Disqualifier:* any wording that has resume *writing* or *fixing* the manifest — green greps do not excuse a read-only violation.

**Done:** a fresh session's resume on a split family presents manifest order and recommends the correct next child without conversation memory.

**Skills:** `cognitive-doc-design`.

---

### T5 — `/akili-archive` row flip, parent gate, and `:186` carve-out

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-5 (both scenarios, all clauses) |
| Design refs | §7 row 5, DD-5, reversion challenge 2 |

**Scope:** `.claude/commands/akili-archive.md`. Step 1 (`:89-95`): new readiness bullet — archiving a **parent** requires every child row `done`; failure names the non-terminal children; `:97` stop-and-ask remains the override. Step 3 (`:122-134`): new item (before the Step 5 move) — flip the archived child's row to `done` in the parent `family.md`; precedent style: `:129` index refresh / `:133` status flip. Step 6 (`:168-174`): report line for the manifest update. Error Handling: companion bullet near `:183`; amend `:186` with the DD-5 carve-out — "except the archived child's row in the parent `family.md` (Step 3)".

**Negative constraints owned:** BUT it must NOT move the parent folder when the gate fails; AND IT MUST preserve the explicit-override path; carve-out must be scoped to **one row of one file** (reversion challenge 2).

**Verification:** `grep -n "family.md" .claude/commands/akili-archive.md` — hits in Steps 1, 3, 6, and Error Handling; human read of the amended `:186` bullet confirms the exception names only the child-row flip and the absolute rule survives for everything else. *Disqualifier:* a carve-out worded broader than the single row (e.g. "may update family.md") — that licenses overreach and fails DD-5 even though the grep is green.

**Done:** child archive maintains the manifest before the folder moves; premature parent archive is blocked with a clear message.

**Skills:** `cognitive-doc-design`.

---

### T6 — Mirrors, CHANGELOG, and closure sweep

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Depends on | T2, T3, T4, T5 |
| Requirements | FR-7; NFR-1, NFR-3, NFR-4 final checks; `requirements.md` §8 gate execution |
| Design refs | §7 rows 7–8 |

**Scope:** One summary-level mention in each of `docs/commands/akili-propose.md`, `akili-specify.md`, `akili-resume.md`, `akili-archive.md`, `akili-constitution.md`, consistent with the final command text (mirrors are hand-written summaries — match each mirror's own structure, don't paste command text). `CHANGELOG.md` `Unreleased` entry, classified **minor**. Then run the full closure sweep.

**Verification (the §8 gates, executed here):**
1. `grep -rn "family.md" .claude/commands/ docs/ CHANGELOG.md` — reconcile every hit against the design §7 surface table: **13 files expected** (6 sources incl. flow.md, 5 mirrors, CHANGELOG, plus this spec folder); any surface with zero hits is a missed mirror (CS-2 class); any hit in an unlisted file is scope creep.
2. Schema divergence: `grep -rn "Parallel-safe" .claude/commands/` — column lists appear only as references/excerpts; the sole full schema definition lives in constitution Step 7.
3. Naming: `grep -n "family" .claude/commands/akili-constitution.md docs/model-routing.md` — no new bare-"family" prose ambiguous with model families.
4. **HITL walkthrough (behavioral substitute):** walk the FR-4 scenario (STAR `bilateral/` shape: 3 children, child 1 done) against the final resume text and confirm the dashboard/recommendation the prose produces. *Disqualifier:* if the walkthrough requires assumptions the text doesn't state, the prose is not executable — report the gap, do not pass on grep-green alone.
5. NFR-4: `git diff --stat` total added lines ≤ ~150; if exceeded, stop and escalate (budget tripwire), do not trim silently.

**Done:** all §8 gates green or their failures reported; CHANGELOG classified minor; mirrors consistent.

**Skills:** `cognitive-doc-design`.

---

## 3. Coverage Map (scenario/clause granularity)

| Requirement · scenario/clause | Owned by |
|---|---|
| FR-1 scenario "Template scaffolded" (Step 7 + in-file enumerations) | T1 |
| FR-1 clause: `akili-specify.md:85` enumeration | T3 |
| FR-1 clause: `docs/flow.md:145` enumeration | T2 |
| FR-1 BUT not packaged / no installer clause | T1 (verified again in T6 sweep 1) |
| FR-1 AND IT MUST "spec family" naming | T1 + T6 sweep 3 |
| FR-2 scenario "Epic split" (manifest before folders, `Parent Spec:`, seeded order) | T2 |
| FR-2 BUT no child without row (closed set) | T2 |
| FR-2 AND IT MUST keep `:143` fields, manifest as authority | T2 |
| FR-2 scenario "Late child addition" (HITL row first; BUT no folder before row) | T2 |
| FR-3 scenario "Specify on a child after `/clear`" | T3 |
| FR-3 AND IT MUST warn-not-block on unmet deps | T3 |
| FR-3 BUT no sibling creation outside the set | T3 |
| FR-4 scenario "Resume after `/clear`" (grouping + order + next child) | T4 |
| FR-4 BUT no invented activities | T4 |
| FR-4 AND IT MUST verify folders exist (KZ-002 drift report) | T4 |
| FR-4 AND IT MUST remain read-only | T4 |
| FR-5 scenario "Archiving a child" (Step 3 flip before move + Step 6 report) | T5 |
| FR-5 scenario "Archiving the parent too early" (gate + message) | T5 |
| FR-5 BUT no parent move on gate failure | T5 |
| FR-5 AND IT MUST preserve the override path | T5 |
| FR-5 clause: `:186` carve-out scoped to one row | T5 |
| FR-6 scenario "Coordinator dispatches a wave" | T2 |
| FR-6 BUT no re-derivation at dispatch time | T2 |
| FR-7 mirrors ×5 + CHANGELOG minor | T6 |
| NFR-1 zero flat-spec overhead | T4 (resume path) + T6 walkthrough |
| NFR-2 guidance-only | T1 (DD-2) + T6 sweep 1 (no unlisted files) |
| NFR-3 single canonical schema | T1 (definition) + T2/T3 disqualifiers + T6 sweep 2 |
| NFR-4 bounded size | T6 sweep 5 (budget tripwire) |

Closure check: every scenario and every `BUT`/`AND IT MUST` clause above has a named owner; no gap is discharged by citing a different requirement.

## 4. Estimated LOC & PR Strategy

- **Estimated LOC:** ~110–150 added markdown lines across 13 files (within budget).
- **PR strategy:** single PR / direct-to-master commit series with `[SPEC:changes/spec-family-ordering]` prefixes — docs-only, well under the 400-LOC split threshold. Suggested commit grouping: T1 → T2–T5 (one commit each or combined) → T6 closure.
- **Recommended first task:** T1 (everything references its schema).
