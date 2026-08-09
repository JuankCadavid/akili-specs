# AKILI Spec Mapping for Agent Features

Read this when an agent feature has to become `requirements.md`, `design.md`, and `tasks.md`. It maps agent artifacts onto the three documents and fixes the one rule that makes agent specs different from ordinary feature specs:

**An agent's output is nondeterministic, so its acceptance gate is an eval threshold with a stated no-pass clause — never a bare exit-0 test.** A green command proves the harness ran. It does not prove the agent is good enough.

## The mapping at a glance

| Agent artifact | Document | Shape it takes there |
|---|---|---|
| Intended behavior — what the agent must do, decide, or refuse | `requirements.md` | `GIVEN` / `WHEN` / `THEN` scenario over agent conduct |
| Guardrail — what it must never do or say | `requirements.md` | `BUT it must NOT …` clause on the scenario it constrains |
| Quality bar for generated output | `requirements.md` | `AND IT MUST …` clause naming case set, metric, threshold |
| Graph topology, state, tools, memory, HITL points | `design.md` | Design-decision rows + data model |
| Eval sets, runner, and the gate itself | `tasks.md` | Task with verification command **and** no-pass clause |

## 1. Behaviors and evals → `requirements.md`

Write **conduct**, not construction. If a scenario names a graph node, a prompt, a framework, or a model, it has drifted into `design.md`.

Three clause types carry the agent-specific load:

| Clause | Carries | Example |
|---|---|---|
| `THEN` | The observable decision or output | `THEN it assigns queue billing and priority P2` |
| `BUT it must NOT` | A guardrail — a prohibited action, claim, or disclosure | `BUT it must NOT state or imply that a refund will be issued` |
| `AND IT MUST` | The measurable bar, because the `THEN` cannot be judged on one run | `AND IT MUST hold ≥ 0.90 queue accuracy on the 120-case labeled set` |

**Pick the assertion type from the output's determinism**, not from convenience:

| Output kind | Assertion | Threshold needed? |
|---|---|---|
| Tool or route selection from a closed set | Exact match on the chosen name and arguments | Yes — aggregate accuracy over a case set |
| Structured extraction (fields, enums, IDs) | Field-by-field exact match against labeled cases | Yes |
| Free-generated text | Rubric scored by a human or an LLM judge | Yes — plus the judge's rubric pinned as an artifact |
| Guardrail violation | Negative case set, violations counted | **No threshold to trade against — the tolerated count is zero** |

Guardrails are the exception worth stating twice: an accuracy metric averages failures away, and a guardrail failure is not average-able. Give guardrails their own case set and their own clause.

## 2. Architecture → `design.md`

Every axis below is a decision the spec must record, with the alternative rejected and why. These are the decisions an implementer would otherwise re-derive — or invent.

| Axis | What the design must state |
|---|---|
| Topology | Prebuilt agent loop, an authored graph, or multiple agents — and what forced it |
| State | Every field, who writes it, what survives a restart, what is discarded |
| Tools | Per tool: inputs, side effects, whether a retry is safe, behavior on failure |
| **Memory** | What persists within a thread versus across sessions; what is written and read; retention and any personal data in it. "No memory" is a decision — record it |
| **HITL points** | Where execution pauses, what the human is shown, and what happens on approve, reject, edit, and timeout |
| Model routing | Which model runs which step, and the fallback when it is unavailable |
| Eval seam | The public interface evals call. Evals that reach into nodes are implementation-coupled and break on every graph edit |

Memory and HITL points are the two axes most often left implicit, and both are expensive to retrofit: memory decides the data-retention surface, and a HITL pause decides whether the runtime must survive waiting for a human at all. Framework-specific mechanics for either belong to `references/langgraph-patterns.md`; where the workload runs belongs to `references/aws-deployment.md`.

## 3. Eval work → `tasks.md`

An eval task is only a gate if it carries four things:

1. **Case sets** — how many cases, where they live, and who produced the expected values.
2. **A verification command** — one an agent or CI can run unattended, that scores the sets and writes a report artifact.
3. **A pass condition** — thresholds checked by the runner, not eyeballed from output.
4. **A no-pass clause** — the conditions under which a green run is reported **inconclusive** rather than passing.

**Expected values come from the approved scenarios, never from the system under test.** Labeling a case set by running the agent and blessing what it produced makes the eval tautological: it can only ever agree with the code. Same rule as test-first work — the spec supplies the expected values, the design supplies the seam.

### Writing the no-pass clause

The clause names what would make the number untrustworthy. Reach for these:

- Fewer cases actually scored than the set contains — agent errors silently counted as skips.
- The judge model, its prompt, or its rubric changed since the baseline, without re-scoring the baseline.
- The threshold met only on a re-run of the same set.
- Any guardrail violation at all, regardless of the aggregate score.

Without such a clause the task has a criterion for passing and none for doubt, which makes passing the default reading of any output the runner produces.

## 4. Worked example — support-ticket triage

One behavior traced through all three documents: *the agent reads an inbound ticket, assigns a queue and a priority, and never promises a refund.*

> Unvalidated: the threshold values, set sizes, and runner flags below are illustrative shapes, not figures measured from a shipped triage build. Use the structure; derive your own numbers.

**In `requirements.md`:**

```markdown
### FR-2: Ticket triage classification

The agent SHALL assign every inbound ticket a queue and a priority.

#### Scenario: Duplicate-charge ticket reaches the billing queue

- GIVEN an inbound ticket whose body describes a duplicate charge
- WHEN the triage agent processes it
- THEN it assigns queue `billing` and priority `P2`
- AND it records which ticket fields drove the decision
- BUT it must NOT state or imply that a refund will be issued
- AND IT MUST hold ≥ 0.90 queue accuracy and ≥ 0.80 priority exact-match over
  the 120-case labeled set, with zero refund-promise violations over the
  30-case guardrail set
```

**In `design.md`** (decision rows, abbreviated):

| ID | Decision | Rejected | Rationale |
|---|---|---|---|
| DD-3 | Two steps — classify, then validate against the closed queue list | Prebuilt tool-calling loop | The queue set is small and closed; a loop buys nothing and widens the output space |
| DD-4 | Memory: none across tickets. Customer history is a tool call at decision time | Long-term store keyed by customer | Avoids stale context and a personal-data retention surface; history is authoritative when read |
| DD-5 | HITL: pause before any `P1`; human confirms or downgrades. Reject returns to classify with the human's note in state | Auto-assign `P1` | A wrong `P1` wakes an on-call human; the pause is cheaper than the page |
| DD-6 | Eval seam: `triage(ticket) -> TriageResult`. Evals call only this | Asserting on internal steps | Step-level assertions break on every topology edit without behavior changing |

**In `tasks.md`:**

```markdown
### T7 — Triage eval gate

Requirements: FR-2 (scenario + BUT + AND IT MUST). Design: DD-3…DD-6.

**Scope:** the 120-case labeled set, the 30-case guardrail set, and the runner
that scores both at the `triage()` seam.

**Verification:**
- `<runner> eval triage --set labeled-120 --report out/triage.json`
  → queue accuracy ≥ 0.90 AND priority exact-match ≥ 0.80
- `<runner> eval triage --set guardrail-30 --report out/guardrail.json`
  → refund-promise violations = 0 (one violation fails the gate; there is no
  aggregate score to trade it against)
- *No-pass clause:* report the run **inconclusive**, not passing, if any of:
  (a) fewer than 120 / 30 cases were actually scored — agent errors counted as
  skips hide failures; (b) the judge model or rubric changed since the recorded
  baseline without re-scoring that baseline; (c) a threshold was met only after
  re-running the same set. **Exit code 0 is not the gate** — it says the runner
  finished, not that the agent cleared the bar.

**Done:** both commands run clean, thresholds met on a first run, report
artifacts committed, and no no-pass condition triggered.
```

Substitute your own runner; what must survive the substitution is the shape — a named case set, thresholds the runner checks, a written report artifact, and a clause that can turn a green run into an inconclusive one.

## Sources

Internal AKILI conventions used above — scenario shape (`GIVEN`/`WHEN`/`THEN`/`BUT`/`AND IT MUST`), task shape, and coverage at clause granularity — are defined by this repository's `/akili-specify` command and need no external source. The external claims pin to:

- Measurable success criteria and LLM-graded evaluation, including rubric design and preferring automated grading over unstructured qualitative review — Anthropic, *Define success criteria and build evaluations*: https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests (verified 2026-08-09)
- The evaluation vocabulary borrowed here — dataset, evaluator, LLM-as-judge, offline versus online evaluation — LangSmith, *Evaluation concepts*: https://docs.langchain.com/langsmith/evaluation-concepts (verified 2026-08-09)
- Human-in-the-loop as a real pause/resume mechanism an architecture can depend on (approve or reject, review and edit state) — LangChain, *Interrupts*: https://docs.langchain.com/oss/python/langgraph/interrupts (verified 2026-08-09)
