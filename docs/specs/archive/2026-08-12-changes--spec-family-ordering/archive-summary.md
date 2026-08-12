# Archive Summary: Spec Family Ordering (Parent→Child Control)

**Outcome:** delivered complete. A parent proposal that gets split now writes a `family.md` manifest that survives `/clear` — order, dependencies, parallel-safety, and per-child status are read by resume, honored by specify, and maintained by archive. 6/6 tasks PASS on first attempt, 68 added lines against a ~110–150 budget.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `docs/specs/changes/spec-family-ordering` |
| Archive Date | 2026-08-12 |
| Final Status | **Complete** — all tasks PASS, all §8 gates green |
| Depth / Type | Standard / Change |
| Approval Mode | gated |
| Release classification | **minor** (new methodology behavior; no installer, hook, or new command) |
| Commits | `9659723` (T1) · `e6a9dd9` (T2) · `d898545` (T3) · `ba9a2b0` (T4) · `f53d645` (T5) · `e0165f0` (T6) |

## 2. Requirements Delivered

| ID | Requirement | Delivered in |
|---|---|---|
| FR-1 | `family.md` template defined once, in `/akili-constitution` Step 7 | T1 (+ enumeration clauses in T2/T3) |
| FR-2 | Manifest written at propose-time chunking, before any child folder; `Parent Spec:` on each child | T2 |
| FR-3 | `/akili-specify` mirrors the contract by reference and reads the parent manifest | T3 |
| FR-4 | `/akili-resume` family-aware scan, grouped dashboard, manifest-order recommendation | T4 (+ 3 gate-4 corrections in T6) |
| FR-5 | `/akili-archive` flips the child row to `done`, gates the parent, carves out the write constraint | T5 |
| FR-6 | `docs/flow.md` fleet preconditions read independence from the manifest | T2 |
| FR-7 | Five docs mirrors + CHANGELOG entry | T6 |
| NFR-1 | Zero overhead for flat-spec projects | Verified at every consuming site |
| NFR-2 | Guidance only — no installer, no hook, no new command | T1 + T6 sweep 1 |
| NFR-3 | Single canonical schema | `akili-constitution.md:317`, sole definition site |
| NFR-4 | Bounded size (~150 line tripwire) | 68 insertions |

## 3. Files Changed Summary

| File | Change |
|---|---|
| `.claude/commands/akili-constitution.md` | +18/−3 — `family.md` as 4th general-setup template; canonical schema; 4 enumerations |
| `.claude/commands/akili-propose.md` | +4/−2 — manifest write at chunking, closed-set + late-addition rules, `Parent Spec:` row |
| `.claude/commands/akili-specify.md` | +6/−5 — Step 0 family-membership item, chunking contract by reference, `:85` enumeration |
| `.claude/commands/akili-resume.md` | +20/−3 — manifest read before the flat scan, grouped dashboard, order-based recommendation |
| `.claude/commands/akili-archive.md` | +6/−2 — Step 3 row flip, parent gate, write-constraint carve-out |
| `docs/flow.md` | +3/−3 — fleet preconditions read the manifest instead of re-deriving at dispatch |
| `docs/commands/` ×5 | +8 — summary-level mirrors |
| `CHANGELOG.md` | +2 — `Unreleased` → `Added`, classified minor |

## 4. Test Evidence Summary

**None, and the absence is accepted.** The spec ships prose that instructs agents — no executable code, no harness that can assert an LLM follows it. `requirements.md` §8 substitutes a HITL walkthrough for the "prose agents cannot execute" defect class; that walkthrough ran at the T6 gate (§6 below).

## 5. Validation Summary

**No `validation-report.md`, and the absence is accepted (user choice at archive time).** Validation here would re-run the same greps T6's closure sweep already executed with recorded results:

| Gate | Result |
|---|---|
| Surface completeness (13 expected) | ✅ exact, no creep |
| Single canonical schema | ✅ one definition site |
| Model-family naming collision | ✅ new hits all qualified; pre-existing hits untouched |
| HITL walkthrough (FR-4) | ✅ after 3 corrections (§6) |
| NFR-4 budget | ✅ 68 / ~150 |

## 6. Historical Notes — the walkthrough earned its keep

Every task in this spec verified itself with **presence-assertions** (`grep` proves the text landed, not that an agent following it behaves correctly) — stated up front as a global caveat in `tasks.md` §2. Five grep gates went green. The T6 HITL walkthrough of the FR-4 `bilateral/` scenario then found a defect none of them could see:

> The family container folder holds only `family.md`, matches no phase file, and fell through Step 0 to the "incomplete spec" error branch — whose carve-out covered only manifest-listed *children*. A literal follower would have recommended `/akili-specify bilateral/`, the exact action FR-4's `BUT` clause forbids.

Fixed in T6, along with the confirmed T4 dashboard-counting advisory (a spec family is now explicitly **one** entry in the header count and top-level numbering) and an Output-contract ambiguity ("report as drift" → "on screen … or writing a drift report").

Both stale line-number self-pointers raised as advisories (`:143` in propose, `:186` in archive) were removed under user approval at the wave gates. The Advisory-Never-Grows queue closed empty.

## 7. Accepted Warnings & Follow-Ups

| Item | Disposition |
|---|---|
| Residual risk: prose executability | **Accepted and recorded** per `requirements.md` §8 — real proof arrives when a project exercises an actual split. First real split is the natural re-test. |
| `test-report.md` absent | Accepted — guidance-only spec |
| `validation-report.md` absent | Accepted — user choice; closure-sweep evidence substituted (§5) |
| Release not yet published | `CHANGELOG.md` entry classified **minor**; `npm run release:minor` remains to be run separately |
