# Tasks: `/akili-audit` Phase→Tier Drift Detection

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/audit-phase-tier-drift` |
| Depth | Standard |
| Type | Change |
| Approval Mode | `gated` |
| Status | Draft — Phase 3 |
| Date | 2026-08-12 |
| Budget (design §9) | 4 tasks · ~55 LOC · 1 review round per task |
| Design review | Judgment Day `APPROVED` — see `judgment.md` |

## 2. Task Graph

```
T1 (new category: comparison, finding shape, degrade)
 ├─→ T2 (divergence record rule — same category block)
 └─────────────────────────┐
T3 (:59(c) structural persona check — independent)
                           ├─→ T4 (matrix row + mirror + CHANGELOG + closure sweep + HITL walkthrough)
```

T3 touches a different category than T1/T2 and is parallel-safe with both. T2 edits the block T1 creates, so it follows T1. No circular dependencies.

**Global verification caveat.** Every grep below is a **presence-assertion**: it proves the text landed, not that an agent following it behaves correctly. The behavioral gate is substituted per `requirements.md` §8 — the HITL walkthrough in T4. **A task may not report PASS on grep-green alone where its Done criteria name a walkthrough clause.**

---

### T1 — New Step 2 category: comparison, finding shape, and degrade

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | none |
| Requirements | FR-1 (both scenarios), FR-2 (all clauses), FR-4 (all clauses), NFR-1, NFR-2 (parts 1 and 3), NFR-4 |
| Design refs | §3 authority table, DD-1, DD-4, DD-5, DD-7 |

**Scope.** Add a twelfth drift category to `.claude/commands/akili-audit.md` Step 2, **placed after `Model Generation Drift` (the last bullet, `:59`)** so the `:55`–`:59` routing block stays contiguous and the line-range citations elsewhere in this spec remain valid (NFR-3). The category must carry:

- the comparison itself — every phase→tier assignment in the local registry against the packaged default — and the explicit statement that **mutual agreement between the local registry, its mirror, and the wrappers is not conformance** (FR-1's `AND IT MUST`);
- DD-1's three-step resolution **verbatim in substance**: packaged `docs/model-routing.md` probing `./node_modules/akili-specs/` then *both* `npm root -g` and `pnpm root -g`; then command-file Model checkpoints with roots **derived from `bin/akili.js`'s `TOOL_REGISTRY`** (home root *and* `--local` variant per host), not from a hand-written list; then the unevaluated degrade;
- the finding shape: phase, local tier, packaged tier, packaged rationale **cited by file and line** (FR-2), plus which resolution source answered and its confidence;
- DD-4's priority rule: upstream T1/T3 phases → High, others → Medium;
- the negative constraints: never edits (FR-1 `BUT`, NFR-1), never declares the project wrong (FR-2 `BUT`), never emits an "all good" entry into Identified Discrepancies (FR-1 second scenario `AND IT MUST NOT`), never silently skips when unresolvable (FR-4 `AND IT MUST NOT`).

**Verification.**
1. `grep -n "TOOL_REGISTRY\|pnpm root -g\|npm root -g" .claude/commands/akili-audit.md` — all three present.
2. `grep -c "^\* \*\*" ` over the Step 2 block — must return **12**.
3. `git diff --stat` — single file.

**Disqualifiers for the evidence.** Greps 1–2 are presence-assertions and prove nothing about behavior; they cannot show that the resolution order is followed, that the degrade fires, or that the finding carries a citation. If grep 2 returns 12 but the new bullet sits inside the `:55`–`:59` block, the count is green and NFR-3 is broken — **check placement, not just count.** If the diff touches any of the eleven pre-existing categories beyond adding the new one, stop: that is NFR-3 regression, report it rather than trimming silently.

**Done.** Category present after `Model Generation Drift`; all five content bullets above land; the eleven existing categories are byte-unchanged; verification run with disqualifiers applied.

**Skills:** `cognitive-doc-design`.

---

### T2 — Divergence record: marker, recognition, and the re-report rule

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Depends on | T1 |
| Requirements | FR-3 (both scenarios, all clauses), NFR-1, NFR-2 (part 2) |
| Design refs | DD-2, DD-5, DD-7 part 2 |

**Scope.** Inside the T1 category, state the accepted-divergence mechanism:

- the literal marker **exactly as DD-2 defines it — read it from `design.md` DD-2's fenced block, do not transcribe it from here**, and emit it into the command with *unescaped* backticks (a double-backtick span or a fenced block; never `\`` escapes, which have zero precedent in any shipped command file and are inert inside code spans per CommonMark):

  ```markdown
  > **Accepted divergence:** `<phase>` runs on `<tier>` instead of packaged `<packaged-tier>` — <reason>. (accepted <YYYY-MM-DD>)
  ```
- **only exact-marker lines count** — an approximate line is ordinary text, so a malformed record surfaces as an unexplained divergence rather than silently acquitting one (this is the clause that makes the mechanism fail-loud);
- the re-report rule: compare the record's stated `<packaged-tier>` against the current packaged tier; on mismatch the record is stale and the divergence is re-reported (FR-3 second scenario);
- unrecorded divergences are **never** treated as accepted because a prior audit reported them (FR-3 `BUT`);
- other phases still report normally (FR-3 `AND IT MUST`);
- **the maintainer writes the record, never the audit** (NFR-1; DD-5 extends to this mechanism exactly as it extends to FR-5).

**Verification.** `grep -n "Accepted divergence" .claude/commands/akili-audit.md` — marker present and byte-identical to DD-2's definition.

**Disqualifier.** Marker presence proves the token exists, not that the recognition and re-report procedure is executable. Both are walkthrough clauses in T4 — **do not report PASS on this grep alone.** If the marker as written differs from DD-2 by even one character, the design and command have diverged and the spec has a second source of truth: report it, do not reconcile by editing the design.

**Done.** All six clauses land; marker byte-identical to DD-2; disqualifier applied.

**Skills:** `cognitive-doc-design`.

---

### T3 — `:59(c)` structural persona check with retained anchors

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Depends on | none (parallel-safe with T1/T2 — different category) |
| Requirements | FR-5 (all clauses), NFR-1, NFR-3 |
| Design refs | DD-3, DD-5, §6 reversion challenge |

**Scope.** Amend sub-item (c) of `Model Generation Drift` so persona staleness is detected by **structural comparison of `.agents/*.md` against their `.claude/templates/` sources**, not by checking for a fixed list of named guardrails. Per DD-3 (the reversion-challenge outcome), **keep `leader.md`'s Delegation Ceiling and `implementer.md`'s Scope Discipline as illustrative anchors**, phrased so they cannot be read as the closed set. Preserve the existing no-overwrite remediation language (FR-5 `BUT`; Safe Update never overwrites).

**Verification.**
1. `grep -n "Delegation Ceiling\|Scope Discipline" .claude/commands/akili-audit.md` — both still present.
2. `git diff` on `:59` — the structural rule is added and the two names survive as examples.

**Disqualifier.** Grep 1 passing proves the names survived; it cannot show the rule reads as structural rather than as an enumeration. The FR-5 `AND IT MUST` clause — *a future guardrail is caught without being named anywhere in `akili-audit.md`* — is behavioral and belongs to T4's walkthrough. If the amended text still reads as "check for these two," the reversion challenge's finding was not applied: report it.

**Done.** Structural rule present; both anchors retained as examples; no-overwrite language unchanged.

**Skills:** `cognitive-doc-design`.

---

### T4 — Matrix row, mirror, CHANGELOG, closure sweep, HITL walkthrough

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1, T2, T3 |
| Requirements | FR-6 (all clauses), FR-7; NFR-2, NFR-3, NFR-4, NFR-5 final checks; `requirements.md` §8 gate execution |
| Design refs | §7 surface table, DD-7 part 3, DD-8, §9 budget |

**Scope.** Step 3's Conformance Matrix gains a methodology-conformance row (FR-6). Summary-level mention in `docs/commands/akili-audit.md`. `CHANGELOG.md` `Unreleased` entry with its classification stated. Then the gates.

**Resolve the `:125` tension explicitly (per DD-7 part 3).** The command's existing Verification Checklist requires categories with no findings to be *"reported as clean rather than omitted"*; FR-1 forbids an informational "all good" entry in Identified Discrepancies. The reconciliation is that **"clean" is reported in the Conformance Matrix row, and Identified Discrepancies stays silent** — state it, do not leave it to inference.

**Verification — the §8 gates, executed here.**
1. **Surface sweep:** `grep -rn "Phase→Tier\|phase→tier" .claude/commands/ docs/commands/ CHANGELOG.md` reconciled against design §7: **6 surfaces across 3 files**. Zero hits on a listed surface is a missed mirror (CS-2); a hit in an unlisted file is scope creep.
2. **NFR-3 non-regression (DD-8):** `git diff` shows the eleven pre-existing categories unchanged except `:59(c)`.
3. **NFR-5 budget:** total added lines ≤ ~60. If exceeded, **stop and escalate** — do not trim silently.
4. **HITL walkthrough (the behavioral substitute).** Walk the final text as a literal agent, covering the happy path *and* the fall-through branches KZ-004 names:
   - **STAR replay:** local `execute-Leader T5`, packaged T1, wrapper `haiku`, all three mutually consistent → confirm a finding is produced with all four values, a location citation, and High priority.
   - **Conformant project** → confirm zero findings and a clean Conformance Matrix row (NFR-2, and the `:125` reconciliation above).
   - **Phase present locally, absent upstream**, and **present upstream, absent locally** → confirm the text says what happens.
   - **Packaged file unreachable and no command roots found** → confirm "unevaluated" with reason, not silence.
   - **Malformed divergence record** → confirm it surfaces as an unexplained divergence.
   - **Recorded divergence whose packaged tier later changed** → confirm re-report.
   - **Future guardrail not named anywhere** → confirm T3's rule still catches it.

   *Disqualifier:* if any branch requires an assumption the text does not state, **the prose is not executable — report the gap and fix it in-task.** This spec exists because a check covered the branches it thought of and not the one left out; passing it on grep-green would be self-refuting.

**Done.** All gates green or their failures reported; CHANGELOG classified; mirror consistent; the `:125` reconciliation stated in the command text.

**Skills:** `cognitive-doc-design`.

---

## 3. Coverage Map (scenario and clause granularity)

| Requirement · scenario/clause | Owned by |
|---|---|
| FR-1 scenario "STAR replay" (four values + citation) | T1 |
| FR-1 `AND IT MUST` — report despite mutual consistency | T1 (text) + T4 walkthrough (behavior) |
| FR-1 `BUT` — never edits registry/mirror/wrapper | T1 |
| FR-1 scenario "conformant project stays quiet" | T1 (no confirm-match output) + T4 walkthrough |
| FR-1 `AND IT MUST NOT` — no "all good" in Identified Discrepancies | T4 (`:125` reconciliation) |
| FR-2 scenario "judging without opening another file" | T1 |
| FR-2 `AND IT MUST` — cite rationale by location | T1 |
| FR-2 `BUT` — never declares the project wrong | T1 |
| FR-3 scenario "deliberate off-tier choice" | T2 |
| FR-3 `AND IT MUST` — other phases still reported | T2 |
| FR-3 `BUT` — unrecorded ≠ accepted | T2 |
| FR-3 scenario "packaged tier later changes" (re-report) | T2 + T4 walkthrough |
| FR-4 scenario "no packaged default reachable" | T1 |
| FR-4 `AND IT MUST NOT` — no silent skip | T1 + T4 walkthrough |
| FR-4 `AND IT MUST` — named in Conformance Matrix | T4 |
| FR-5 scenario "guardrail added upstream later" | T3 |
| FR-5 `AND IT MUST` — works without the guardrail being named | T3 (text) + T4 walkthrough (behavior) |
| FR-5 `BUT` — never recommends overwriting | T3 |
| FR-6 scenario "priority assignment" | T1 (DD-4 rule) |
| FR-6 `AND IT MUST` — report-only, nothing outside `drift-report.md` | T1 + T3 |
| FR-6 Conformance Matrix row | T4 |
| FR-7 mirror + CHANGELOG | T4 |
| NFR-1 report-only | T1, T2, T3 (each states it for its own surface) |
| NFR-2 zero noise | T1 (parts 1, 3) + T2 (part 2) + T4 walkthrough |
| NFR-3 non-regression | T1 (placement) + T3 (scoped amendment) + T4 sweep 2 |
| NFR-4 guidance only | T1 disqualifier (single file) + T4 sweep 1 |
| NFR-5 bounded size | T4 sweep 3 (budget tripwire) |

**Closure check:** every scenario and every `BUT` / `AND IT MUST` clause has a named owner. No gap is discharged by citing a different requirement.

## 4. Estimated LOC & PR Strategy

| Task | Added lines |
|---|---|
| T1 | ~28 |
| T2 | ~10 |
| T3 | ~5 |
| T4 | ~12 (matrix row + mirror + CHANGELOG) |
| **Total** | **~55** — against the NFR-5 target of ≤ ~60 |

**PR strategy: a single PR.** ~55 lines across 3 files, well under the ~400-line split threshold, and the surfaces are interdependent — the mirror and CHANGELOG describe the category T1/T2 create, so splitting would produce a PR describing text that does not exist yet.
