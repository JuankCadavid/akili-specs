# Tasks: Branch-Safe Kaizen & Shared-File Write Discipline

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branch-safe-kaizen` |
| Depth | Standard |
| Type | Change |
| Approval Mode | `gated` |
| Status | Draft — Phase 3 |
| Date | 2026-08-21 |
| Budget (design §9) | 6 tasks · ~260 LOC (prose) · 1 review round per task |
| Design review | Judgment Day round 1: 7 confirmed severe + 2 verified suspects **fixed** (user chose Fix only) — see `judgment.md` |

## 2. Task Graph

```
T1 (kaizen SKILL.md: two-phase contract, entry file, Apply Mode, Branch Context)
 ├─→ T2 (akili-archive.md: gated syncs, backlog offer, report states)
 ├─→ T3 (carve-outs ×4 sites + audit per-run path + resume footer)
 ├─→ T4 (constitution: scaffold + pin + rule; personas guardrail)
 │
 T2,T3,T4 ──→ T5 (mirrors + root docs + CHANGELOG)  ──→ T6 (closure sweep + walkthrough)
```

T2/T3/T4 are parallel-safe after T1 (they consume names T1 defines: Branch Context, entry-file schema, Apply Mode, pending-item Kinds). T5 mirrors final command text, so it follows T2–T4. T6 is the global gate. No circular dependencies.

**Global verification caveat.** Every grep below is a **presence-assertion**: it proves text landed, not that an agent following it behaves correctly. Prose executability has no automated check (accepted risk, `requirements.md` §8) — the behavioral substitute is T6's HITL walkthrough. **A task may not report PASS on grep-green alone where its Done criteria name a walkthrough clause.**

---

### T1 — Kaizen skill: two-phase loop, entry file, Apply Mode, Branch Context

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L |
| Depends on | none |
| Requirements | FR-1 (all scenarios + clauses), FR-2 (all four scenarios), FR-3 (Apply Mode definition, contradictory-edits scenario `AND IT MUST`), FR-4 (legacy-freeze scenario `BUT`), NFR-2, NFR-3, NFR-4 |
| Design refs | §3 Branch Context, §4–§5 entry file + Status semantics, DD-1..DD-5, DD-7, DD-8 |

**Scope.** Rewrite `.claude/skills/kaizen/SKILL.md`:

- **Frontmatter `description:` (:3)** gains Apply Mode trigger phrases ("apply pending kaizen standardizations", "kaizen apply", "aplicar estandarizaciones kaizen") — CS-3: this is the discovery field; the body alone is unreachable.
- **Activation Contract** adds Apply Mode: standalone, default-branch, no spec argument; on a spec branch it declines in one line naming the branch rule.
- **Branch Context** (Hard Rules): pin-first resolution per design §3 — `Default Branch:` pin → `origin/HEAD` → unique `main`/`master`; `init.defaultBranch` never consulted; unresolved ⇒ spec branch + one-line notice naming the pin as remedy.
- **Phases:** Measure's drift source → most recent report in `docs/specs/audits/` by `Date` header (legacy `drift-report.md` when no report files); Learn reads digest + `docs/specs/kaizen/` entry files incl. `Noted` sections; recurrence against an existing lesson (either ID grammar) becomes a `digest-update` pending item; Standardize gates on Branch Context (spec branch → record `pending`, present lessons anyway — gating moves the write, not the review; default branch → today's HITL menu, solo fast path); Record writes `docs/specs/kaizen/<safe-spec-slug>.md` (exact-name re-run check, no glob).
- **Entry-file schema** verbatim from design §5 with the five `Kind` values and the four Status values incl. `deferred` semantics (produced by Defer; stays in backlog; re-offered).
- **Apply loop:** group by Target (file or KZ-id); DD-8's three outcomes (merge digest-updates on same KZ-id / dedupe identical edits / decide on differing edits); items processed in entry-filename lexical order, ADR-bearing items numbered sequentially in that order (B-21 minimal rule); missing `docs/trd/trd.md` for a `trd-adr` item ⇒ item stays `pending` with a one-line note, never invents the file. Digest refresh in the same pass: apply `digest-update` merges first, then add new rows; if >10 rows, retire `Applied` rows institutionalized longest first, never `Deferred`/`pending`-linked rows (B-20 minimal rule).
- **Hard Rules** rewritten: writable set in branch terms; never-block — a declined menu or missing inputs yields a metrics-only/clean-run **entry file** (never `kaizen-log.md`, B-15); legacy log's `## Entries` frozen with pointer note added at first default-branch apply pass; digest path/columns byte-compatible.

**Verification.**
1. `grep -n "apply pending" .claude/skills/kaizen/SKILL.md` — hit in **line 3** (frontmatter) AND in the body. Falsifying input: phrase present only in the body — fails (CS-3 regression).
2. `grep -n "init.defaultBranch" .claude/skills/kaizen/SKILL.md` — the only sanctioned hit form is the prohibition ("never consulted"); a hit inside a resolution step fails.
3. `grep -c "digest-update\|guide-sync\|factual-sweep\|trd-adr" .claude/skills/kaizen/SKILL.md` — ≥4 (all Kinds defined). Falsifier: a Kind named in archive (T2) but absent here.
4. `grep -n "kaizen-log" .claude/skills/kaizen/SKILL.md` — every hit must be digest-read, freeze-note, or single-writer rule; any write-instruction hit fails.

**Disqualifiers.** All four are presence-assertions; none proves the loop is executable. If grep 1 passes but the description's trigger list dropped an existing trigger (kaizen, retrospective, mejora continua), the skill loses today's activations — diff the description against its current value; any removed trigger fails. Grep 4 green while the never-block paragraph still names the log as fallback target = B-15 regression — read that paragraph, don't count hits.

**Done.** All scope bullets land; existing loop bounds unchanged (≤3 lessons, 1–3-line edits, ≤10-row digest, never-block); verification run with disqualifiers; behavioral clauses queued for T6 walkthrough.

**Skills:** `cognitive-doc-design`.

---

### T2 — `/akili-archive`: branch-gated syncs, backlog offer, report states

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-5 (both scenarios, all clauses incl. Step 0.4 + Step 6 contracts), FR-2 solo-fast-path scenario (archive side), FR-3 (auto-offer on default branch), NFR-4 |
| Design refs | Surface rows 5–9, DD-1, DD-4, DD-7 |

**Scope.** Edit `.claude/commands/akili-archive.md`: Step 0.4 read list → digest + `docs/specs/kaizen/` entries + most recent `audits/` report (legacy fallbacks named); Step 3 items 2–4 (guide sync, factual sweep, TRD & ADR sync) gated on Branch Context (pin comparison — no skill dependency) with spec-branch fallback to typed pending items, **ADR items number-free**; family flip (item 5) and CodeGraph (item 6) explicitly branch-side; Step 4.3–4.4 delegate to the skill's two-phase contract, and a default-branch run auto-offers the whole pending backlog after its own retrospective; Step 6 item 7 reports `applied, deferred, or pending (awaiting the default-branch apply phase)`; Error Handling: writable set in branch terms, metrics-only fallback targets the **entry file**.

**Verification.**
1. `grep -n "pending" .claude/commands/akili-archive.md` — hits in Steps 0.4/3/4/6 and Error Handling. Falsifier: Step 6 lacking the third state.
2. `grep -n "kaizen-log" .claude/commands/akili-archive.md` — sanctioned hits only (digest read, single-writer statement); a fallback-write hit fails (B-15).
3. `grep -n "ADR-MMM\|next free" .claude/commands/akili-archive.md` — allocation language only inside the default-branch/apply context; an allocation instruction in the spec-branch path fails.

**Disqualifiers.** Grep 1 counts words, not gating: read Step 3's gate sentence — if the gate names a git procedure instead of the pin/Branch Context reference, DD-1 is violated even though every grep passes. If the diff touches Step 5's folder move or Step 3 item 5's family flip semantics, stop — those are declared branch-side invariants (FR-5), report instead of proceeding.

**Done.** All five sites edited; never-block preserved verbatim in behavior; verification + disqualifiers run.

**Skills:** `cognitive-doc-design`.

---

### T3 — Carve-outs at all four scan sites; audit per-run path; resume footer

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-6 (scenario + all clauses), FR-8 (scenario + all clauses), FR-3 (resume surfacing scenario, `BUT` no-write clause), NFR-1 (resume additive-only) |
| Design refs | Surface rows 10–12, DD-5, DD-9, DD-1 (audit unpinned default: add slug) |

**Scope.** Four files, one identical carve-out list (`archive/`, `general-setup/`, `quick/`, `kaizen/`, `audits/`, + family container): `.claude/commands/akili-resume.md` Step 0.2; `akili-propose.md` related-spec read; `akili-specify.md` nearby-spec read; `akili-audit.md` Step 0 item 4. Audit Step 3 → `docs/specs/audits/drift-<YYYY-MM-DD>[-<safe-branch>][-N].md` with the FR-6 ordering rule (`Date` header, lexical tie-break), branch slug added when off-default **or unresolved**; audit's Verification Checklist asserts the new path; legacy file untouched. Resume kaizen footer: pending count + highest severity + exact Apply Mode phrase; no file writes.

**Verification.**
1. `for f in akili-resume akili-propose akili-specify akili-audit; do grep -c "general-setup/\|kaizen/\|audits/" .claude/commands/$f.md; done` — every file ≥1 hit at its enumeration site. Falsifier: any of the four sites still enumerating bare "directories under docs/specs/".
2. `grep -n "drift-report" .claude/commands/akili-audit.md` — hits only as legacy-read fallback; a write instruction or the old checklist assertion fails.
3. `grep -n "No files are created or modified" .claude/commands/akili-resume.md` — still present, byte-identical (NFR-1/FR-3 `BUT`).

**Disqualifiers.** Grep 1 proves presence at file level, not that the list sits **at the enumeration site** — read each site; a carve-out list in a different section passes the grep and fails the requirement (KZ-004: name the terminal branch each folder lands in). The four lists must be textually identical — diff them against each other; drift between sites fails even with all greps green.

**Done.** Four identical lists at the four sites; audit path + ordering + checklist landed; resume footer additive; disqualifiers applied.

**Skills:** `cognitive-doc-design`.

---

### T4 — Constitution scaffold + `Default Branch:` pin; persona guardrails

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Depends on | T1 |
| Requirements | FR-7 (scenario + all clauses), FR-2 (pin as primary source), NFR-3 |
| Design refs | Surface rows 13–14, DD-1, DD-6 |

**Scope.** `.claude/commands/akili-constitution.md`: Step 0 foundation dirs add `docs/specs/kaizen/` + `docs/specs/audits/` (one-line README each; READMEs never count as entries/reports); Step 8 root-guide summary gains the `Default Branch: <name>` pin (detected once at constitution time, user-confirmed) and the shared-file write rule; the command's own Verification Checklist gains the two new dirs (ledger W-7). Personas `.claude/templates/leader.md` + `implementer.md`: append the side-effect guardrail with the own-deliverable exemption (DD-6) — an addition, not a rewrite, in a different region than `changes/scoped-constitution-reads`' item-14 edit; the constitution's inline-draft persona fallback sentence names the guardrail among what an inline draft must include (ledger B-27).

**Verification.**
1. `grep -n "Default Branch" .claude/commands/akili-constitution.md` — present in the Step 8 summary block. Falsifier: pin only in this spec's docs, absent from the command.
2. `grep -n "kaizen/\|audits/" .claude/commands/akili-constitution.md` — hits in Step 0 dirs AND the Verification Checklist. Falsifier: checklist unchanged (the exact parallel gap the audit checklist fix closed).
3. `grep -c "deliverable" .claude/templates/leader.md .claude/templates/implementer.md` — ≥1 each.

**Disqualifiers.** Grep 3 cannot distinguish the exemption from a bare prohibition — read the appended lines: a guardrail without the own-deliverable exemption re-creates the self-contradiction the judgment flagged (this repo's specs would violate it). CHANGELOG note (T5) must mention the expected one-time audit drift flag on deployed personas (ledger W-1) — if T5's entry lacks it, reopen here.

**Done.** Scaffold + pin + rule + checklist + both personas + inline-fallback mention; disqualifiers applied.

**Skills:** `cognitive-doc-design`.

---

### T5 — Mirrors, root docs, CHANGELOG

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T2, T3, T4 |
| Requirements | FR-9 (all), FR-4 digest-contract statements, NFR-2 |
| Design refs | Surface rows 15–17 |

**Scope.** Mirrors: `docs/commands/akili-archive.md` (**correction to parity** — its Step 3 summary predates the factual sweep and TRD/ADR sync — then the new behavior), `akili-audit.md`, `akili-resume.md`, `akili-constitution.md`, `docs/commands/README.md` rows, `docs/skills/kaizen.md`, `docs/skills/README.md` kaizen row (trigger column gains Apply Mode). Root docs: `AGENTS.md` Kaizen Loop rule rewritten two-phase (keep "no separate kaizen command"); `README.md` command-table rows, Kaizen diagram caption + bullets, auxiliary audit bullet; `docs/README.md`; `docs/flow.md` pipeline diagram, artifact table, §2 drift prose, §8 Kaizen Loop; this repo's own `docs/specs/kaizen-log.md` header note (updated-by wording). `docs/openspec-comparison.md:30` assessed: stays true (digest read survives) — record "assessed, unchanged" in the completion report, do not edit. CHANGELOG under Unreleased: patch entry (user-decided classification, per Document Control) including the expected one-time persona-drift audit flag note (W-1).

**Verification.**
1. Path grep from `requirements.md` §8 row 1 (both patterns, stated exclusions) — every hit sanctioned against the Surface Table.
2. `grep -n "factual-claims sweep\|TRD" docs/commands/akili-archive.md` — parity content present (the pre-existing staleness is corrected, not preserved).
3. `grep -n "Unreleased" -A6 CHANGELOG.md` — entry present, says patch, mentions the persona-drift note.

**Disqualifiers.** Grep 1's sanction list is the evidence — an "all clear" without the enumerated hit-by-hit disposition is not a pass (KZ-002: run the grep that would falsify the aggregate claim, then show the hits). A mirror that paraphrases the command into different behavior passes every grep — spot-read each mirror section against its command section (T6 re-checks).

**Done.** All rows 15–17 sites landed or explicitly "assessed, unchanged"; CHANGELOG entry present; disqualifiers applied.

**Skills:** `cognitive-doc-design`.

---

### T6 — Closure sweep, consumer-contract diff, walkthrough, packaging

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Depends on | T1–T5 |
| Requirements | FR-4 consumer scenario (`AND IT MUST` zero-consumer-diff), FR-9 gate, NFR-1, NFR-2, §8 all rows |
| Design refs | requirements §8, judgment.md fix record |

**Scope.** The global gate, run after everything lands:

1. Both §8 greps with the stated exclusions; produce the hit-by-hit sanction table in the completion report.
2. Consumer-contract diff: `git diff` over `akili-propose.md`, `akili-specify.md`, `akili-execute.md` kaizen-read lines — **must be empty**; `akili-resume.md` diff limited to carve-outs + footer. Falsifier: any changed consumer digest-read line.
3. KZ-004 enumeration check: read the four scan sites' terminal branches; each of the five folder names lands in a named branch.
4. `npm run verify:cli && npm run pack:dry-run && git diff --check` — packaging gate.
5. **HITL walkthrough** (the substitute for the unautomatable prose gate, accepted risk in §8): walk the user through FR-2's four scenarios + FR-3's contradictory-edit scenario against the final text, reading the actual steps an agent would follow. An inconclusive walkthrough is reportable as inconclusive — never collapsed into a pass because the greps exited 0.

**Disqualifiers.** Steps 1–4 are all machine-checkable but blind to prose executability — only step 5 covers the dominant defect class (a procedure that reads green and cannot be executed). If any walkthrough step requires information the text doesn't provide (e.g. "which file do I write the pending item to?" answered nowhere), that is a FAIL routed back to the owning task, not a note.

**Done.** All five gates run; sanction table + walkthrough outcome in the completion report; packaging green.

**Skills:** `cognitive-doc-design`, `systematic-debugging` (if any gate fails unexpectedly).

---

## 3. Coverage Closure (scenario/clause → owning task)

| Requirement item | Owner |
|---|---|
| FR-1 parallel-branches scenario (incl. `BUT` no log write, `AND IT MUST` slug filename) | T1 (text) + T6.1 (gate) |
| FR-1 re-run scenario | T1 (exact-name check) |
| FR-1 digest-update / Noted / Learn-reads clauses | T1 |
| FR-2 High-on-branch scenario (`BUT` no edits, `AND IT MUST` review visible) | T1 + T6.5 |
| FR-2 detection-fails scenario | T1 + T6.5 |
| FR-2 solo-fast-path scenario | T1 (skill side) + T2 (archive side) + T6.5 |
| FR-3 Apply Mode reachability clauses | T1 (frontmatter + activation) |
| FR-3 pending-surfaces scenario (`BUT` resume no-write) | T3 + T6.2 |
| FR-3 contradictory-edits scenario (`AND IT MUST` never auto-pick) | T1 (apply loop) + T6.5 |
| FR-4 consumer scenario (`AND IT MUST` zero diff) | T6.2 |
| FR-4 legacy-freeze scenario (`BUT` no migration) | T1 |
| FR-5 pivot-ADR scenario (`BUT` no TRD edit from branch) | T2 |
| FR-5 error-handling scenario (`AND IT MUST` never-block) | T2 |
| FR-5 Step 0.4 + Step 6 contracts | T2 |
| FR-6 two-branches scenario (`BUT` no overwrite) + ordering clauses | T3 |
| FR-7 new-project scenario (`AND IT MUST` text-only) + pin + checklist + inline-fallback | T4 |
| FR-8 dashboard scenario (`BUT` no misclassification) + four sites | T3 + T6.3 |
| FR-9 sweep incl. stale-mirror correction | T5 + T6.1 |
| NFR-1 | T3 (additive-only) + T6.2 |
| NFR-2 | T1/T2/T3 fallbacks + T6.4 |
| NFR-3 | T1 (plain git wording) |
| NFR-4 | T1 + T2 |

No scenario or `BUT`/`AND IT MUST` clause is unowned; no gap is discharged by citing a different requirement.

## 4. Estimated LOC & PR Strategy

**~260 changed lines** (prose), matching the design budget. **Single PR / single change-set** recommended: prose-only, one coherent concept, under the ~400-LOC split threshold; this repo's flow is direct-to-master with `[SPEC:changes/branch-safe-kaizen]`-prefixed commits per task.
