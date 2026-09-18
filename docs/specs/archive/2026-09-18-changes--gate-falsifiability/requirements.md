# Requirements: Gate Falsifiability

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/gate-falsifiability` |
| Depth | **Standard** |
| Type | Change |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Status | Draft — Phase 1 |
| Date | 2026-09-18 |
| Source | `proposal.md` (approved 2026-09-18, "ok ambos"; Release Classification: **patch** proposed, user may override) |
| Format precedent | `docs/specs/archive/2026-09-18-changes--kaizen-loop-closure/requirements.md` — this repo has no `docs/specs/general-setup/` (it packages the methodology rather than consuming it) |
| Parallel spec | `changes/leader-brief-contract` (proposal approved the same day) owns `/akili-execute`, `leader.md`, `reviewer.md`; this spec never edits them (NFR-4) |

## 2. Executive Summary

`/akili-specify` already requires a falsifying input for every check (KZ-006), a disqualifier, and a warning that presence is not effect. The field corpus (105 kaizen entries of one consuming project) shows six gate classes that satisfied those rules as written and still certified defects: fixtures that cannot express their own falsifier, reds that fail on setup instead of the assertion, presence tests over spec-authored fragments, test runners blind to the project's compiler, consumers nobody grepped, and layout gates measuring the wrong quantity. This spec makes each gate carry **an expressible falsifier and its observed red run** as task-level artifacts, adds a compile gate, a Consumer Sweep, and a rendered-measurement checklist to Step 3.2, extends the `tdd` skill's anti-patterns, and names the new fields in the scaffolded `task.md` template. It states defect *classes* with one corpus example each and names no framework outside a parenthetical.

## 3. Glossary

| Term | Meaning |
|---|---|
| **Gate** | A task's verification: an automated check, a test, a build, or a named manual check whose result decides PASS |
| **Falsifier** | The concrete input or mutation that would make a gate report FAIL (KZ-006). This spec adds: the fixture must be able to **express** it — produce a different reading under it |
| **Inert fixture** | A fixture on which the correct implementation and the most plausible wrong one yield the same reading, so the gate cannot discriminate |
| **Red run** | The observed failing run of a test before the change, cited as evidence. **Assertion-level** when it fails on the behavioral assertion; not a red when it fails on setup, an intercept, a timeout, or a missing dependency |
| **Plumbing test** | A test that renders or exercises a fragment authored inside the spec (a copied template, a hand-built DOM) and therefore proves the test's own plumbing, not that the real artifact opts in |
| **Real-artifact lock** | A check bound to the shipped artifact: a static read of the real template/config, or a rendered measurement of the real element — never a fragment or a class list |
| **Compile gate** | The project's build or type-check command included in a task's Verification when that compiler is stricter than the test runner (a runner that erases or loosens types is the field case) |
| **Consumer Sweep** | The list of test files (unit, component, E2E — including CI-excluded or token-gated suites) that pin a shared exported symbol, DOM hook, selector, or event the task changes; produced by a grep at specify time and run as part of the task's Verification |
| **Rendered-measurement gate** | A gate that asserts size, overflow, visibility, position, or containment of a rendered element; only a real browser or component-test harness can evaluate it |
| **Effective CSS px** | A viewport dimension stated after the host's zoom factor is applied (a host at ×1.2 renders a requested 900 px as ~750 effective px) |

## 4. System Context & Scope

**In scope:**

| Surface | Change |
|---|---|
| `.claude/commands/akili-specify.md` — Step 3.2 task quality rules | One consolidated **Falsifiability** block, led by the existing KZ-006 bullet, adding: expressible falsifier; assertion-level red run; real-artifact lock; compile gate; Consumer Sweep; rendered-measurement checklist. Each rule 1–3 lines with one corpus example in a parenthetical |
| `.claude/commands/akili-specify.md` — Step 3.2 "Each task should include" list | Four named Verification fields: `Falsifier`, `Red run`, `Disqualifier`, `Consumers` |
| `.claude/commands/akili-specify.md` — Step 1.2 defect-class table | Two rows: *compiler-only defect*; *layout/geometry defect* |
| `.claude/commands/akili-specify.md` — Verification Checklist | Two items restating the new gate artifacts (checklist and Step 3.2 must agree — KZ-changes--kaizen-loop-closure-2) |
| `.claude/skills/tdd/SKILL.md` | Anti-patterns +2 (inert fixture; plumbing test); Rules of the loop: red fails on the assertion; AKILI Integration "Verification evidence" row cites what the red failed on |
| `.claude/commands/akili-constitution.md` — Step 7 item 3 | The `task.md` template description names the four Verification fields so scaffolded projects carry them |
| Mirrors | `docs/commands/akili-specify.md`, `docs/skills/tdd.md`, `docs/commands/akili-constitution.md` |
| Release | `CHANGELOG.md` Unreleased |

**Out of scope (non-goals):**

- `reviewer.md`, `leader.md`, `/akili-execute` — owned by `changes/leader-brief-contract`, which carries the Reviewer-side line (verify the recorded red run; trace the mutation) on this spec's behalf.
- HITL row schema, capability probe, "first UI task ends with a real look" — `changes/hitl-row-schema`.
- Framework-specific gotchas (a component-test harness's visibility heuristic, a framework's style emission order, a CSS utility's breakpoint semantics) — consuming projects' guides.
- `/akili-test` suite partitioning and Deployment Rule; Testers inherit the fields through `tasks.md`.
- A new skill; installer, hooks, CI.

**Grep hazard (binding on every verification below):** exclude `.claude/worktrees/`, `docs/specs/archive/`, and this spec's own folder, which quotes the superseded and the new phrasings verbatim.

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| Spec author (`/akili-specify` session) | Concrete, short rules that make a gate's blind spot visible at authoring time, not two rework rounds later |
| Implementer | A task whose Verification says what red to produce, on which fixture rows, with which build command, and which sibling suites to run |
| Reviewer (via the parallel spec) | Named artifacts (`Falsifier`, `Red run`, `Consumers`) it can check for absence instead of inferring |
| Consuming projects with a compiler stricter than their runner, or a browser-tested UI | The two defect classes that produced the corpus's High-severity misses get a named gate |
| Methodology maintainer | Rules stated by class, not by framework, so they survive a stack change |

## 6. Functional Requirements

### FR-1: A gate's falsifier must be expressible by its fixture

Every test gate in `tasks.md` SHALL name its falsifier (the mutation or input that produces FAIL — KZ-006) **and** the fixture row(s) on which the correct and the mutated implementation produce different readings. A fixture on which the named mutation leaves the reading unchanged SHALL be treated as no gate: the task is not accepted until the fixture diverges on the axis the mutation moves. The fixture MAY be rows or programmed stub behavior — the rule is about the reading, not the data's shape. And the task's Done criteria SHALL require the falsifier **executed against the post-change code**: revert the change or apply the named mutation and observe the gate go red. Naming the diverging rows is necessary; running the mutation is what proves the gate is attached to the behavior — a gate that stays green under its own falsifier asserts nothing *(added by the T5 Pivot, 2026-09-18)*.

#### Scenario: Counting formula with a single-element fixture

- GIVEN a task whose gate proves a count that combines two sources, and a fixture with one element in the second source
- WHEN `/akili-specify` writes the task's `Falsifier`
- THEN it states the mutation ("drop the cascade term") and observes that with one element the correct and the naive count coincide, so the fixture gains a second element before the task is accepted
- BUT it must NOT accept "the mutation is named" as sufficient when the fixture cannot express it (`changes--toc-center-guard` KZ-2)
- AND IT MUST record the diverging row(s) in the task, not only the mutation

#### Scenario: Every row pinned

- GIVEN a gate over an ordered pipeline and a fixture where every row is already pinned, so the pre- and post-change sets coincide
- WHEN the task's `Falsifier` is written
- THEN the task requires at least one unpinned row so the pipeline-order mutation produces a different output (`changes--reporting-favorite-indicators` KZ-3)

#### Scenario: Selector that matches nothing *(added by the T5 Pivot, 2026-09-18)*

- GIVEN a regression test that selects an element by an attribute the fix converts into a property binding, so after the fix the selector silently matches nothing
- WHEN the task's `Falsifier` is executed against the post-change code (the fix reverted)
- THEN the test stays green — it reads the same on the buggy and the fixed code — and the task rejects it as no gate, requiring a selector bound to something the change does not move (`bugfix--other-fields-toc-visibility` KZ-OTV-2)
- BUT it must NOT accept an assertion-level pre-change red as sufficient on its own: a test can be red before the change for one reason and green after it for another

### FR-2: The red run is recorded evidence and fails on the assertion

For every test gate, the task's Done criteria SHALL require the **observed red run** as evidence — the test seen failing before the change — and SHALL state that a red counts only when it fails on the behavioral assertion. A red produced by a timeout, an unmatched intercept, a missing fixture, or a synchronous mock that never exercises the timing under test is NOT a red; the task names the assertion the red must reach.

#### Scenario: Red on an intercept timeout

- GIVEN a bug whose pre-fix code never issues the request the test intercepts
- WHEN the regression test runs against the pre-fix code
- THEN it fails on the intercept timeout, never reaching the dialog-title assertion — and the task's `Red run` field rejects it, requiring a test shape that reaches the assertion (`bugfix--confirm-submission-title-and-disclaimer`)
- BUT it must NOT let "the test was red" satisfy Bug Mode's "red before the fix"

#### Scenario: Race hidden by synchronous mocks

- GIVEN a timing bug in an async load path and unit tests whose mocks resolve synchronously during first change detection
- WHEN the task's `Red run` is specified
- THEN it requires deferred observables (or the harness's equivalent) so the race is actually exercised, and states that a green under synchronous mocks is not evidence for this defect class (`bugfix--phase-filter-missing-phases-prod`)

### FR-3: Presence and opt-in claims are locked to the real artifact

When a gate's claim is that the real artifact contains, opts into, or renders something (a binding in a template, a directive on an element, a visible control), the task SHALL bind the check to the **real artifact**: a static source lock (a read of the shipped file) or a rendered measurement of the shipped element. A test that renders a fragment authored inside the spec, or asserts class/attribute presence, SHALL be recorded as proving plumbing only, and the task SHALL name the real-artifact check beside it. Where the property is visibility or reachability near a clipping ancestor, the gate SHALL compare the element's geometry against the clipping ancestor's bounds — a visibility heuristic is not containment.

#### Scenario: Fragment mirrored from the template

- GIVEN a wiring claim ("the page opts in with `[scrollHost]`") proven by a test that renders a fragment copied into the spec file
- WHEN the task is written
- THEN it pairs the fragment test with a static source lock over the real template and names the falsifier "delete the binding from the real file → red" (`changes--sp-shell-app-viewport` KZ-3)
- BUT it must NOT count 210 green tests as evidence the real template opts in

#### Scenario: Visible but clipped

- GIVEN a popover inside an ancestor with `overflow: hidden` and a gate asserting it is visible
- WHEN the task is written
- THEN the gate compares the popover's bounding rect against the ancestor's client bounds, and the task records that the harness's visibility heuristic checks paintability, not clip containment (`bugfix--reporting-table-actions-clipped` KZ-RTA-2)

### FR-4: Compile gate when the compiler is stricter than the runner

When the project's build or type-check is stricter than its test runner, any task that assigns into a typed contract (a DTO/model field, a typed store, a typed API payload) SHALL include the build/type-check command in its Verification, and the task SHALL name the defect class it catches. The spec's Step 1.2 defect-class table SHALL carry a *compiler-only defect* row whenever the project's constitution names such a runner/compiler pair.

#### Scenario: Green tests, broken build

- GIVEN a runner that erases type-only imports and a task that pushes a light object into a field typed with the full row shape
- WHEN the task's Verification lists only the test and lint commands
- THEN `/akili-specify` rejects it and adds the build command, citing the class (`bugfix--lead-center-full-catalog` KZ-1: 169/169 green, five Reviewer PASSes, code never compiled)
- AND IT MUST name the falsifier: "assign a value of the wrong shape → build red, tests still green"

### FR-5: Consumer Sweep for shared symbols and contracts

When a task extends or changes a shared exported symbol (a map, a constant, a type), a DOM contract (a `data-*` hook, a structural selector), or an emitted event, `/akili-specify` SHALL run one grep per changed symbol over the project's test files — unit, component, and E2E, including suites excluded from CI or gated by a token — and list every file that pins it in the task's `Consumers` field. Those files SHALL be part of the task's Verification.

#### Scenario: Sibling suite pins the exhaustive key list

- GIVEN a task adding a key to an exported query-param map, and a sibling suite that pins the map's exact key list with `toEqual`
- WHEN the task is written
- THEN its `Consumers` field lists the sibling suite and its Verification runs it (`result-framework-reporting--programme-results-created-by-filter` KZ-1)
- BUT it must NOT limit Verification to the owner suites because "the change is local"

#### Scenario: Token-gated E2E suite

- GIVEN a task changing a shared DOM contract, and an E2E suite on that surface that CI skips when a token is absent
- WHEN `/akili-specify` sweeps consumers
- THEN the skipped suite is listed and the task states that a green CI run is not evidence it was checked (`changes--sidebar-toggle-consolidation` KZ-STC-1)
- AND IT MUST NOT assert "no automated coverage exists for this surface" without the grep in hand

### FR-6: Rendered-measurement checklist for layout gates

When a gate asserts size, overflow, visibility, position, or containment of a rendered element, the task SHALL satisfy a six-item checklist: (1) the **baseline** reading of the pre-existing element is measured before any zero-overflow assertion (a container that is a swipe strip by design already overflows); (2) the harness has the production **fonts** (text and icon faces) loaded before measuring, or self-hosts them; (3) the assertion reads **geometry** (bounding rects, scroll metrics, computed style), never class presence; (4) at least **two viewports that differ on the dimension the gate depends on** — a second width including the squeeze band where columns starve, or a second, shorter height that forces the intended scrolling ancestor *(axis named by the T5 Pivot, 2026-09-18)*; (5) viewport ACs are stated in **effective CSS px** with the host zoom named; (6) where a scroll boundary is near, **clip containment** per FR-3. Gates that assert none of those properties are exempt.

#### Scenario: Zero overflow asserted on a swipe strip

- GIVEN a tab strip designed as a horizontal scroller (`scrollWidth 468 > 375` before the change) and a gate demanding `scrollWidth <= clientWidth` at 375 px
- WHEN the task is written
- THEN item (1) requires the baseline first, and the gate becomes "the new chip is within the viewport" instead of "the container does not overflow" (`bilateral--ai-processing-feedback` L1 — that gate cost a Pivot)

#### Scenario: Missing icon font inflates a cell

- GIVEN a component-test harness whose index page lacks the icon font link and has no network route to fetch it
- WHEN a width gate runs
- THEN the ligature renders as text and produces a false red; item (2) requires the font status to be asserted loaded (or the face self-hosted) before the measurement counts (`changes--aow-identity-column-starvation` KZ-2)
- BUT it must NOT let a cold-vs-warm font timing difference pass as a layout regression

#### Scenario: One viewport height

- GIVEN a sticky-actions gate checked at a single desktop height
- WHEN the task is written
- THEN item (4) requires a second, shorter height that forces the intended scrolling ancestor (`bugfix--evidence-modal-sticky-actions`) and item (5) states the heights in effective CSS px under the host's zoom (`changes--sp-shell-app-viewport`: ×1.2 zoom made literal 800×1100 ACs INCONCLUSIVE, twice)

### FR-7: Task template fields

`/akili-specify` Step 3.2's "Each task should include" list SHALL name four Verification fields — `Falsifier`, `Red run`, `Disqualifier`, `Consumers` — and `/akili-constitution` Step 7 item 3's description of the `task.md` template SHALL name the same four fields, so projects scaffolded after this change carry them. A task whose gate is a test SHALL fill `Falsifier` and `Red run`; a task whose gate is a grep, build, or manual check SHALL fill `Falsifier` and `Disqualifier`; `Consumers` is filled when FR-5 applies and reads `none (no shared symbol changed)` otherwise — never left blank.

#### Scenario: Non-test gate

- GIVEN a task whose only gate is a grep over documentation
- WHEN the task is written
- THEN `Falsifier` and `Disqualifier` are filled, `Red run` reads `n/a (no test gate)`, and `Consumers` reads `none`
- BUT it must NOT omit a field — an omitted field is indistinguishable from a forgotten one (KZ-004)

### FR-8: `tdd` skill extended

The `tdd` skill SHALL add two anti-patterns — **inert fixture** (the correct and the plausible wrong implementation read the same; the tell: mutate the logic and the test stays green) and **plumbing test** (a fragment authored in the test file stands in for the real artifact; the tell: delete the feature from the real file and the test stays green) — SHALL state in Rules of the loop that the red must fail on the assertion, not on setup, and SHALL extend the AKILI Integration "Verification evidence" row so the cited red run names what it failed on.

#### Scenario: Implementer reports a red

- GIVEN a logic-heavy task with `tdd` assigned
- WHEN the Implementer's completion report cites the red → green history
- THEN each red names the assertion it failed on; a red that failed in setup is reported as "not a red" rather than implied as TDD evidence
- AND IT MUST keep the existing three anti-patterns and the seam rules unchanged

### FR-9: Defect-class table rows

Step 1.2's defect-class table SHALL gain two rows: *compiler-only defect* (gate: the project's build/type-check command; substitute: none — it is automated) and *layout/geometry defect* (gate: a rendered measurement per FR-6 in a real browser or component-test harness; substitute when unavailable: a human check at a HITL pause or a T6 visual review — the existing row's language).

### FR-10: Coherence and framework neutrality

Step 3.2's Falsifiability block, Step 1.2's table, the Verification Checklist, the `tdd` skill, and the three mirrors SHALL agree; no rule in the shipped text SHALL name a framework, library, or tool outside a parenthetical example (the class is the rule; the example is the corpus). The existing KZ-006 bullet SHALL remain the block's lead sentence, extended, not replaced.

#### Scenario: Post-edit sweep

- GIVEN the edits are complete
- WHEN the framework-name grep (§8) runs over the changed files
- THEN every hit sits inside a parenthetical example, and the block/table/checklist restate the same four artifacts with the same names
- BUT no sentence may still read that naming the falsifying input alone makes a check evidence

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Bounded authoring cost.** The Consumer Sweep is one grep per changed symbol; the rendered-measurement checklist applies only to gates asserting geometry; the Falsifiability block adds at most ~25 lines to Step 3.2. |
| NFR-2 | **Framework-agnostic.** Rules are stated by defect class; framework names appear only inside parenthetical examples; the rules read correctly against a project with none of the corpus's stack. |
| NFR-3 | **Backward compatible.** Existing `tasks.md` files remain valid; the new fields are required of specs authored after this change. No template migration. |
| NFR-4 | **Parallel safety.** `reviewer.md`, `leader.md`, `/akili-execute` and their mirrors are untouched; a diff there is a defect of this spec. |
| NFR-5 | **KZ-006 preserved.** The falsifying-input rule keeps its wording and position; this spec appends to it. |
| NFR-6 | **Accepted residual.** Prose executability has no automated check; the substitute is the retro-fit walkthrough (§8), which proves the rules flag the corpus cases when read literally — not that every future author will apply them. |

## 8. Defect Classes → Gates

| Defect class this spec can produce | Gate that catches it | Falsifying input |
|---|---|---|
| A rule without a falsifying example (the block preaches, does not bite) | Manual enumeration: each of the six rules in the Falsifiability block carries one parenthetical corpus example and one falsifier; a rule with neither fails | The pre-change presence-assertion bullet's second half ("record what that assertion cannot prove") — it names no input that would make a task fail the rule |
| A framework named as a rule | `grep -nE "Angular|Cypress|Tailwind|Jest|ts-jest|jsdom|ng build" .claude/commands/akili-specify.md .claude/skills/tdd/SKILL.md .claude/commands/akili-constitution.md` — every hit inside `(...)` or an existing sentence not touched by this spec; enumerated | A rule reading "run `ng build`" instead of "run the project's build command when its compiler is stricter than its runner" |
| Contradiction between Step 3.2, Step 1.2, the Verification Checklist, and the `tdd` skill (KZ-changes--kaizen-loop-closure-2) | `grep -n "falsif\|Red run\|Consumers\|Disqualifier" .claude/commands/akili-specify.md .claude/skills/tdd/SKILL.md` — every site names the same four artifacts; a site naming a fifth or omitting one fails | The Verification Checklist still saying only "verification guidance that accounts for the negative scenarios" |
| Mirror drift | Parity read per file (command vs mirror) at review; `docs/commands/akili-specify.md` and `docs/skills/tdd.md` name the four fields and the two anti-patterns | A mirror still listing three `tdd` anti-patterns |
| Parallel-safety breach | `git diff --stat -- .claude/commands/akili-execute.md .claude/templates/ docs/commands/akili-execute.md` empty | Any hunk there |
| Packaging regression | `npm run verify:cli && npm run pack:dry-run` | A renamed packaged file |
| Prose that reads green but does not bite (procedure ambiguity) | **No automated check** — substituted by the **retro-fit walkthrough**: a literal reader applies the shipped rules to `changes--toc-center-guard` KZ-2, `changes--sp-shell-app-viewport` KZ-3, `bugfix--lead-center-full-catalog` KZ-1, `result-framework-reporting--programme-results-created-by-filter` KZ-1, and `bilateral--ai-processing-feedback` L1, quoting the sentence that flags each gate; a case no sentence flags is INCONCLUSIVE | A case where the rule's wording admits the corpus gate as valid |

## 9. Requirement ID Index

| ID | Name | Gate |
|---|---|---|
| FR-1 | Expressible falsifier | rule-example enumeration + retro-fit (toc-center-guard) |
| FR-2 | Assertion-level red run | rule-example enumeration + `tdd` parity |
| FR-3 | Real-artifact lock | retro-fit (sp-shell-app-viewport) |
| FR-4 | Compile gate | retro-fit (lead-center-full-catalog) |
| FR-5 | Consumer Sweep | retro-fit (programme-results-created-by-filter) |
| FR-6 | Rendered-measurement checklist | retro-fit (ai-processing-feedback) |
| FR-7 | Template fields | artifact grep (four names) in specify + constitution |
| FR-8 | `tdd` extended | parity read; anti-pattern count = 5 |
| FR-9 | Defect-class rows | table read |
| FR-10 | Coherence + neutrality | framework grep; contradiction grep |
| NFR-1..6 | Cost / agnostic / compat / parallel / KZ-006 / residual | diff review + parity read |
