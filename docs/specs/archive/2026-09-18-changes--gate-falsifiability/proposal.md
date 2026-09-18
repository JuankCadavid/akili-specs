# Proposal — Gate Falsifiability

**Recommendation:** make every test gate in a `tasks.md` carry its own falsifier *and its observed red run*, and give `/akili-specify` five concrete rules for the gate classes that produced the most Reviewer rework in the field: inert fixtures, presence-only assertions, compiler-blind runners, unswept consumers, and layout gates that measure the wrong thing. The methodology already says "name the input that would make the check fail" (KZ-006); the evidence shows that rule is necessary and not sufficient — a named input that the fixture cannot produce, a red that fails on a timeout instead of the assertion, and a green suite under a compiler that never ran all passed KZ-006 as written.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/gate-falsifiability` |
| Slug | `gate-falsifiability` — given as the argument |
| Type | **Change** |
| Approval Mode | `gated` (no up-front end-to-end mandate given for this spec) |
| Depends on | none (`changes/kaizen-loop-closure` archived 2026-09-18) |
| Parallel-safe | **yes** with `changes/leader-brief-contract` — file ownership is disjoint by agreement: this spec owns `/akili-specify`, the `tdd` skill, `/akili-constitution` Step 7's `task.md` template description, and their `docs/` mirrors; `leader-brief-contract` owns `/akili-execute`, `leader.md`, `reviewer.md` and their mirrors. The one Reviewer-side line this spec needs (below, §12) is handed to that spec rather than edited here |
| Date | 2026-09-18 |
| Author | /akili-propose (T1, session model `claude-fable-5-1`) |
| Release Classification | **proposed patch** — refines existing command guidance and an existing skill; no new command, target, or vocabulary that other commands consume (per `versioning-semver-discipline`; user may override) |
| Status | Draft — awaiting approval |

## 2. Intent

Turn the most frequent Reviewer-FAIL class in the field — *the gate could not see the defect* — into something `/akili-specify` catches at authoring time, by requiring each gate to prove it can fail before it is allowed to certify.

## 3. Problem / Current Behavior

### 3.1 What the methodology already requires (verified at the source, 2026-09-18)

`/akili-specify` Step 3.2 already carries four gate rules: the **disqualifier** ("state what disqualifies the evidence"), the **falsifying input** (KZ-006: "name the input that would make the check fail… if you cannot name one, the check is not evidence"), the **presence-assertion** rule ("a CSS class in the markup… proves presence, not effect"), and the **environment path** clause (a global install, a warm cache). Step 1.2 maps defect classes to gates. The `tdd` skill names three anti-patterns (implementation-coupled, tautological, horizontal slicing) and requires red before green.

### 3.2 What the field shows those rules did not catch

Source: 105 kaizen entries of one consuming project (`/Users/jcadavid/orca/workspaces/onecgiar_pr/qa-development-2026/docs/specs/kaizen/`, 2026-08-26 → 2026-09-16), read in full on 2026-09-17. Every row below passed a Reviewer at least once or shipped.

| Defect class | Files (examples) | What the current rule missed |
|---|---|---|
| **Inert fixture** — the correct and the most plausible wrong formula produce the same reading; a named mutation the fixture cannot express | ≥7: `changes--toc-center-guard` (KZ-2: one "Other" center makes `length === 1` indistinguishable from a naive count), `changes--reporting-favorite-indicators` (KZ-3: every row pinned, so the pipeline-order mutation produced identical output), `changes--overview-toc-map`, `changes--kp-cgspace-search-retry`, `bilateral--review-center-strip-and-phase` (`phaseId: undefined` vs cold-boot `null`) | KZ-006 asks for a *named* falsifying input; it does not ask whether the fixture can *produce a different reading* under it. The field lesson: *"'Name the input that would make the check fail' only works if the fixture can actually produce a different reading under that input."* |
| **Presence or plumbing test** — a fragment authored inside the spec, a class/attribute check, `be.visible` on a clipped element, `toEqual` by object identity | ≥8: `changes--sp-shell-app-viewport` (KZ-3: deleting `[scrollHost]` from the real template left 210 tests green), `bugfix--reporting-table-actions-clipped` (KZ-RTA-2: `be.visible` passed on a 76 %-clipped popover), `bilateral--center-overview-tab` (99 class-presence assertions passed a broken cascade), `changes--kp-multi-repository-browse`, `bugfix--other-fields-toc-visibility`, `bugfix--innovation-geo-other-areas` | The presence rule names the class but leaves the substitute open; nothing requires a **static source lock over the real artifact** or a **geometry comparison** where visibility is the property |
| **Red for the wrong reason** — the pre-fix run fails on a timeout, an intercept, or setup, never on the behavioral assertion | `bugfix--confirm-submission-title-and-disclaimer`, `bugfix--phase-filter-missing-phases-prod` (synchronous `of()` mocks hide a race) | "Red before green" is satisfied by *any* red; the corpus shows reds that never reached the assertion |
| **Compiler-blind runner** — `ts-jest` green while `ng build` fails | 2 (High): `bugfix--lead-center-full-catalog` (169/169 green, Reviewer PASS ×5, code never compiled), `changes--bilateral-review-hierarchy-ux` (453 green tests hid a non-compiling component) | No rule says: when the project's compiler is stricter than its test runner, the build/typecheck command is part of the gate |
| **Unswept consumers** — a shared exported symbol or DOM contract extended; a sibling spec or a CI-excluded E2E suite pinned it | ≥4: `result-framework-reporting--programme-results-created-by-filter` (KZ-1: `dashboard-lab.scope.spec.ts` pinned the exhaustive key list), `changes--sidebar-toggle-consolidation` (KZ-STC-1, High: a token-gated Cypress suite broke silently), `results--expand-split-innovation-picker` (~78 call sites), `changes--reporting-by-aow-tabular-consistency` | Nothing asks specify to grep `*.spec.ts` / `*.cy.ts` / `cypress/e2e/**` for consumers of what a task changes — the Implementer "could not have seen the FAIL without leaving the work order" |
| **Layout gate measuring the wrong thing** — zero-overflow asserted on a swipe strip; fonts not loaded in the harness; one viewport; container height instead of row geometry; literal px under host zoom | ≥10: `bilateral--ai-processing-feedback` (L1: baseline `scrollWidth 468 > 375` *before* the change), `changes--aow-identity-column-starvation` (KZ-2: missing icon font produced a false red), `bugfix--evidence-modal-sticky-actions` (one viewport height), `changes--overview-aow-cross-filter` (six measurement variants), `changes--sp-shell-app-viewport` (Orca zoom ×1.2 made 800×1100 ACs INCONCLUSIVE, second occurrence), `changes--bilateral-review-hierarchy-ux` (gate measured an `overflow-hidden` ancestor) | The presence rule says jsdom cannot measure layout and routes to a real browser; it says nothing about **how** a real-browser gate must be written, and every one of these was a real-browser gate |

Across the corpus: ~139 Reviewer rework rounds; the three batch analyses independently ranked "gates that cannot fail" as the largest FAIL bucket, ahead of false premises and brief defects.

## 4. Proposed Outcome

1. A task's test gate is not accepted at `/akili-specify` until it names its falsifier **and the fixture can express it** (the mutation changes the reading), and the task's Done criteria require the **observed red run** (assertion-level, not setup-level) as evidence.
2. Presence and opt-in claims are gated against the **real artifact** (static source lock, geometry comparison), never a fragment or a class list.
3. When the project's compiler is stricter than its test runner, the **build/typecheck command is part of the verification** of any task that assigns into a typed contract.
4. Tasks that extend a shared exported symbol or DOM contract carry a **Consumer Sweep** — the list of `*.spec.ts` / `*.cy.ts` / E2E files that pin it, including CI-excluded suites — in their Verification.
5. Layout and responsive gates follow a **rendered-measurement checklist**: baseline measured before an overflow assert, production fonts loaded in the harness, geometry not classes, at least two viewports including the squeeze band, ACs expressed in effective CSS px, clip containment where a scroll boundary is near.
6. The `tdd` skill names the two anti-patterns the corpus adds (**inert fixture**, **plumbing test**) and requires the red to fail on the assertion.

## 5. Scope

| Surface | Change |
|---|---|
| `.claude/commands/akili-specify.md` — Step 3.2 task quality rules | One consolidated **Falsifiability** block extending KZ-006: fixture must express the falsifier; red run recorded at assertion level; real-artifact lock for presence/opt-in claims; compile gate when the compiler is stricter than the runner; Consumer Sweep for shared symbols/contracts; rendered-measurement checklist for layout gates. 1–3 lines per rule, each with its falsifying example from the corpus |
| `.claude/commands/akili-specify.md` — Step 1.2 defect-class table | Two rows: *compiler-only defect* (gate: the build/typecheck command) and *layout/geometry defect* (gate: a rendered measurement per the checklist, never class presence) |
| `.claude/skills/tdd/SKILL.md` | Anti-patterns +2 (inert fixture; plumbing/fragment test); Rules of the loop: "red must fail on the assertion, not on setup"; AKILI Integration row: the red run is cited with what it failed *on* |
| `.claude/commands/akili-constitution.md` — Step 7 item 3 (`task.md` template description) | The template's Verification block gains named fields: `Falsifier`, `Red run`, `Disqualifier`, `Consumers` — so every scaffolded project's tasks carry them |
| `docs/commands/akili-specify.md`, `docs/skills/tdd.md`, `docs/commands/akili-constitution.md` | Summary-level mirrors |
| `CHANGELOG.md` | Unreleased entry; classification per user decision |

## 6. Non-Goals

- **No edit to `reviewer.md` or `/akili-execute`** — owned by `changes/leader-brief-contract`. The one Reviewer-side sentence this spec implies ("verify the recorded red run and trace the mutation; a test *named* after a mutation is not evidence it exercises it") is handed to that spec (§12) so the two stay parallel-safe.
- **No HITL row schema, capability probe, or "first UI task ends with a real look"** — `changes/hitl-row-schema`.
- **No framework-specific rules** (Cypress `be.visible`, Angular `styleUrls`, Tailwind breakpoints). The methodology states the defect *class* with one example; the framework-specific gotchas belong in consuming projects' guides, where the corpus already put them.
- **No change to `/akili-test`'s suite partitioning or Deployment Rule**; Testers inherit the same gate fields through `tasks.md`.
- **No new skill.** A `gate-design` skill was considered (§10 C) and deferred: skill governance requires a binding and a home, and the rules are small enough to live where the gates are authored.
- No installer, hooks, CI.

## 7. Affected Users, Systems, And Specs

- **Users:** every project running `/akili-specify` — the rules bite at authoring time; Implementers and Reviewers see them through `tasks.md`. Projects scaffolded before this change keep their `task.md` template until re-scaffolded (same migration posture as the predecessor's pin).
- **Systems:** `/akili-specify` (Steps 1.2, 3.2), `tdd` skill, `/akili-constitution` Step 7 template description; mirrors.
- **Specs:** `changes/leader-brief-contract` (parallel; receives the Reviewer-side line); `changes/hitl-row-schema` (later; consumes the "route to a real browser" substitute this spec sharpens); `changes/kaizen-loop-closure` (archived — its KZ-…-1 lesson, *walk every existing consumer step against a new value*, is the design-time sibling of the Consumer Sweep proposed here).

## 8. Visual Reference

- Source: **None**
- Location: n/a
- Notes: methodology prose change, no UI surface.

## 9. Requirement Delta Preview

### ADDED Requirements

- A gate's falsifier must be **expressible by its fixture**: the task states the mutation and the fixture row(s) on which the reading diverges.
- The **red run is recorded evidence**, and it must fail on the behavioral assertion, not on setup, an intercept, or a timeout.
- **Real-artifact lock** for presence/opt-in claims (static source read or rendered geometry), never a spec-authored fragment or a class list.
- **Compile gate**: when the compiler is stricter than the test runner, the build/typecheck command is in the Verification of any task assigning into a typed contract.
- **Consumer Sweep**: tasks extending a shared exported symbol or DOM contract list every test file that pins it, including CI-excluded suites, in their Verification.
- **Rendered-measurement checklist** for layout gates (baseline, fonts, geometry, ≥2 viewports, effective CSS px, clip containment).
- `tdd`: two new anti-patterns; red must fail on the assertion.
- `task.md` template: `Falsifier`, `Red run`, `Disqualifier`, `Consumers` fields.

### MODIFIED Requirements

- KZ-006's rule ("name the input that would make the check fail") is extended, not replaced: name it **and show the fixture can produce a different reading under it**.
- Step 1.2's defect-class table gains two rows.

### REMOVED Requirements

- None.

## 10. Approach Options

| | Option | Trade-off |
|---|---|---|
| **A** | **Rules in Step 3.2 prose only** | Smallest diff. But the corpus shows prose rules reach tasks unevenly: KZ-006 was in force and three of the six classes above still passed. A rule that is not a *field* in the task is easy to satisfy by omission. |
| **B** | **Rules in Step 3.2 + named fields in the task template + `tdd` anti-patterns** ✅ | The fields make each task carry its falsifier, red run, disqualifier, and consumers as **artifacts the Reviewer can check for absence**; the `tdd` skill catches the inert-fixture and plumbing patterns inside the Implementer's loop where the red run happens. Three surfaces, all already owned by the methodology. |
| **C** | **B + a new `gate-design` skill loaded by specify** | Cleanest home for the rendered-measurement checklist, but adds a skill that needs a binding, docs, and governance review, and duplicates rules Step 3.2 must state anyway. Defer until the checklist outgrows three lines. |

## 11. Recommended Approach

**Option B.** It is the smallest change that turns "the gate should be falsifiable" from advice into a per-task artifact, and it lands the two loop-level anti-patterns where the loop runs. It stays framework-agnostic by stating classes and citing one corpus example each, and it leaves the Reviewer-side enforcement to the spec that owns the Reviewer persona.

## 12. Risks, Dependencies, And Open Questions

| Item | Kind | Handling |
|---|---|---|
| **Step 3.2 is already long; six more rules make it a wall.** | Risk | One consolidated *Falsifiability* block with sub-bullets, each 1–3 lines, replacing nothing; the existing KZ-006 bullet becomes the block's lead. Specify's Step 2.4 budget must count the added prose. |
| **Over-fitting to the evidence project's stack** (Angular, Cypress, Tailwind). | Risk | Each rule states the class and names the general mechanism (a compiler stricter than the runner; a clipping ancestor; a swipe container's baseline); framework names appear only inside the parenthetical example. Reviewer checks the rules read correctly against a non-Angular project. |
| **Consumer Sweep cost at specify time** (grep per touched symbol). | Risk | Bounded: one grep per exported symbol / DOM hook the task changes, over `*.spec.ts`, `*.cy.ts`, `cypress/e2e/**`; the result is pasted into the task, not re-derived at execute. |
| **Reviewer-side enforcement lives in a file this spec does not own.** | Dependency | Hand-off to `changes/leader-brief-contract`: one line in `reviewer.md`'s audit checklist — *verify the recorded red run failed on the assertion and trace the named mutation through the fixture; a test named after a mutation is not evidence it exercises it.* Recorded in that spec's proposal; if that spec does not ship, this line becomes a follow-up here. |
| **Interaction with KZ-changes--kaizen-loop-closure-1** (design walks consumers of a new enumerated value). | Note | Same shape, different artifact: that lesson is about design steps, the Consumer Sweep is about test files. Both cite KZ-004's fall-through class. State the kinship once in the design, do not merge them. |
| **Should the red run be required for every gate, or only for gates on logic-heavy tasks (where `tdd` is assigned)?** | Open question | Recommend: every *test* gate records its red; non-test verifications (a grep, a build) record their falsifying input as today. Decide at specify. |
| **Should the rendered-measurement checklist be mandatory or "when the task asserts geometry"?** | Open question | Recommend the latter — it applies only to gates that assert size, overflow, visibility, or position. |

**Active Lessons applied:** KZ-006 (extended — this spec is its second-order correction), KZ-004 and KZ-changes--kaizen-loop-closure-1 (enumerate consumers; the Consumer Sweep is their test-file sibling), KZ-005 (rules named, never line-pointed), KZ-002 (the "every mirror updated" claim is grepped), KZ-changes--kaizen-loop-closure-2 (Leader pre-review restatement sweep — Step 3.2 restates gate rules in Step 1.2 and the Verification Checklist; all three must agree).

## 13. Success Criteria

1. `/akili-specify` Step 3.2 carries the Falsifiability block with all six rules, each with a named falsifying example; Step 1.2's table has the two new rows; the Verification Checklist references them.
2. The `tdd` skill lists the inert-fixture and plumbing-test anti-patterns and requires the red to fail on the assertion.
3. `/akili-constitution` Step 7's `task.md` description names the four new Verification fields.
4. **Retro-fit check:** applied as a literal reader to three corpus cases — `changes--toc-center-guard` KZ-2 (inert fixture), `changes--sp-shell-app-viewport` KZ-3 (plumbing test), `bugfix--lead-center-full-catalog` KZ-1 (compiler-blind) — the new rules flag each gate at specify time, with the sentence that flags it quoted.
5. No rule names a framework outside a parenthetical example; the rules read correctly against a project with no Angular, Cypress, or Tailwind.
6. Mirrors at parity; `/akili-execute`, `reviewer.md`, `leader.md` untouched (parallel-safety with `changes/leader-brief-contract`).

## 14. Next Step

```text
/akili-specify changes/gate-falsifiability
```
