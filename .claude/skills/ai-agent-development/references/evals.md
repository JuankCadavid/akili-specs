# Evals for AI Agents — Offline, Regression, Judge, Online, Voice

Last verified: 2026-11-14

Read this when a spec delivers an AI agent (`AI Agent: yes`) and you must design the evals that gate it. `references/akili-spec-mapping.md` §3 owns the **task shape** (case sets, verification command, pass condition, no-pass clause); this file owns **how to design and run the evals** across the agent's lifecycle. No runner is prescribed: the project names its own (the eval gate runs whatever the project already uses). One running example throughout: the **phone agent**, which answers inbound calls, identifies the caller, helps with a bounded task (here: a billing question), and escalates to a human agent.

## The rule

**Expected values come from the approved `requirements.md` scenarios, never from the agent's own output.** Do not label a case set by running the agent and accepting what it produced: the eval becomes tautological and can only agree with the code. Guardrails get their own negative case sets (`references/guardrails.md`), and the tolerated violation count is **zero**.

Anthropic's guidance supports the same shape: design evals that "mirror your real-world task distribution," include edge cases, and automate grading where you can [1]. LangSmith frames an example as "a test input, reference output pair" [2]; in AKILI the reference output is written from the scenario, not captured from a run.

## Decision index

| Eval kind | Runs when | Answers | Needs |
|---|---|---|---|
| Offline | Before release, over fixed sets | Does it meet each approved scenario? | Labeled sets from scenarios |
| Regression | On every change to prompt, model, tools, guardrails or knowledge | Did the change make anything worse? | Recorded baseline, frozen set |
| LLM-as-judge | Where output is free-generated and code cannot score it | Does it meet a rubric? | Pinned rubric and judge, human calibration |
| Online | In production, continuously or by sample | Is the live agent still within bounds? | Sampling, metrics, threshold, owner |
| Voice metrics | Offline and online | Is the call experience acceptable? | Defined interval, percentiles |

## 1. Offline evals

LangSmith: offline evaluations run on curated datasets before deployment, "curated test cases with reference outputs," so they can check correctness against expected answers [2].

| Set | Source of expected values | Why it exists |
|---|---|---|
| Scenario set | One or more cases per `requirements.md` scenario | Proves each approved behavior |
| Negative (guardrail) set | The `BUT it must NOT` clauses | Zero violations tolerated; never averaged into another score |
| Edge-case set | Scenario boundaries and known-hard inputs | Mirrors the real task distribution [1] |
| Held-out set | Cases the prompt author has not seen | Detects tuning to the visible set |

Practical rules:

- **Label from the spec first, run second.** Write the case and its expected value; only then run the agent. A case the agent fails is a finding, not a label to edit.
- **Keep the held-out set out of prompt iteration.** If it is read while tuning, it is no longer held out; draw a new one.
- **Volume over polish.** Anthropic prefers more automatically graded questions to fewer hand-graded ones [1]. Hand-label only what code and judge cannot score.
- **Score deterministically where possible.** Exact match, string or schema checks, tool-call assertions. Use a judge (section 3) only for what code cannot score.

**Phone agent.** Billing-intent calls, in two forms: transcripts (text in, agent reply scored) and audio (synthetic or recorded calls through the real speech pipeline). Expected values come from the scenario: for the duplicate-charge scenario, the agent identifies the caller, states the next step, and does not promise a refund. The audio form is separate because speech recognition errors change what the agent hears; a transcript-only pass says nothing about them.

> Unvalidated: the set-size guidance and the split between text and audio cases are a starting hypothesis, not measured on a shipped phone agent. Start from a handful of cases per scenario, grow the set when a failure reaches production, and derive your own sizes.

## 2. Regression

LangSmith: regression testing ensures "new versions don't degrade quality" and can assert that a new version "must outperform baseline versions on relevant metrics" [2].

| Trigger | Re-run before the change ships |
|---|---|
| Prompt edit | Every offline set |
| Model change, including a provider upgrade | Every offline set, including audio |
| Tool added, removed or its contract changed | Scenario set and the tool-permission negative set |
| Guardrail change | Every negative set, then the scenario set (a stricter guardrail can break a valid path) |
| Knowledge change (documents, policies, prices) | Cases whose expected values depend on it |

How to run it:

1. **Record a baseline**: the scores of the last released version on the same sets, stored with the commit, model identifier, prompt, judge and rubric versions.
2. **Freeze one set** that is never edited, so score movement means the agent changed, not the cases.
3. **Compare against the baseline, not against a threshold alone.** A pass condition names both the absolute threshold and the allowed movement.
4. **Re-score the baseline** whenever the judge, rubric or scoring code changes; otherwise the comparison mixes two scales (see section 7).

**Phone agent.** A model upgrade re-runs every set, text and audio, before release. The negative sets are compared exactly: one new violation fails the run regardless of the aggregate.

> Unvalidated: the allowed score movement between baseline and candidate is project-specific. No figure is recommended here; derive it from the variance you observe when the unchanged agent is run repeatedly.

## 3. LLM-as-judge

Use a judge where output is free-generated and a code check cannot score it (tone, clarity, completeness). Anthropic lists LLM-graded Likert and binary scoring among the grading methods for nuanced aspects such as empathy or professionalism [1]. LangSmith cautions that "LLM-as-judge evaluators require careful review of scores and prompt tuning" [2]. Treat a judge as an instrument that must be validated, not as ground truth.

| Requirement | Rule |
|---|---|
| Rubric pinned | The rubric text is a versioned artifact in the repo, referenced by the eval task |
| Judge model pinned | The judge model identifier is recorded; a floating alias is re-pinned at each baseline |
| Calibrated before gating | Score human-labeled cases first; the judge's scores gate nothing until agreement with the human labels is measured and accepted by the owner |
| Never grades its own output | Use a different model from the one that generated the output; Anthropic's examples carry the comment that this is "generally best practice" [1] |
| Parseable output | Constrain the judge to a score or a yes/no so the runner can threshold it |
| Spot-checked | A human re-reads a sample of judged cases on a schedule; LangSmith notes human feedback is most valuable for subjective dimensions [2] |

**Phone agent.** Rubric for "explained the next step clearly": the agent states one concrete next action, says who performs it, and states when the caller can expect it. The judge answers yes or no per criterion; a human labels a calibration set from real transcripts first.

> Unvalidated: the agreement measure and the agreement level required before a judge may gate are not fixed here. Choose them with the owner, record them next to the rubric, and treat a judge that cannot reach the level as advisory only.

## 4. Online evals

LangSmith: online evaluations "run on runs and threads from production traffic" and rely on reference-free checks such as quality heuristics and safety checks, since no expected answer exists [2].

**AKILI records the plan and never runs it.** The spec states the plan; the operations team runs it. The plan has four parts:

| Part | What the plan states |
|---|---|
| Sampling | What fraction or which slice of live traffic is reviewed, and how it is drawn |
| Metrics | Which scores are computed (judge scores, guardrail trip counts, voice metrics of section 5) |
| Alert threshold | The value that pages a person, and what they do |
| Owner | A named role accountable for reviewing the sample and acting on alerts |

An online plan with no owner is a dashboard nobody reads. Feed production failures back as new offline cases, labeled from the scenario they violate, so the offline set grows from real calls.

**Privacy.** Sampled calls contain personal data. The plan states retention and who may listen, consistent with the guardrail spec.

**Phone agent.** A weekly sample of calls, reviewed by a named owner, scored on the rubric of section 3 and on escalation and completion (section 5).

> Unvalidated: a sample rate such as 2% of calls per week and any alert threshold are illustrative shapes. Size the sample to your call volume and the rarest failure you must detect.

## 5. Voice metrics

Every metric ships with its definition; a number without a defined interval is not comparable across runs.

| Metric | Definition | Report as |
|---|---|---|
| Response latency | Time from the end of caller speech (as detected by the pipeline's end-of-speech signal) to the first audio the agent emits | Percentiles p50 and p95, never the mean alone |
| Escalation rate | Calls handed to a human agent divided by calls handled, split into expected escalations (scenario says escalate) and unexpected ones | A rate per period, with both parts |
| Task completion | Calls where the scenario's end state was reached (for example, the caller's billing question answered and the next step stated) divided by calls attempted | A rate per scenario, judged against the scenario's THEN clause |

Notes:

- **Name the clock.** State which component timestamps the two ends of the latency interval; the end-of-speech detector and the first-audio emission can sit in different services.
- **Percentiles need volume.** A p95 from a handful of calls is noise; report the call count beside it.
- **Escalation rate has no good direction by itself.** Too low can mean the agent keeps calls it should hand off; too high can mean it gives up. Read it with completion.
- **Completion is scored against the scenario**, not against whether the caller hung up politely.

> Unvalidated: the choice of p50 and p95 as the reported percentiles, any latency target (for example a p95 bound), escalation band or completion floor is illustrative. Voice targets depend on the telephony stack, language and task; measure your baseline before setting one.

## 6. Putting it in the spec

| Spec document | What to write |
|---|---|
| `requirements.md` | Scenarios with GIVEN/WHEN/THEN, including `BUT it must NOT` clauses; these are the expected-value source |
| `design.md` | The eval seam (what is scored, where), the judge and rubric artifacts, the online plan |
| `tasks.md` | An eval gate task with case sets, verification command, pass condition and no-pass clause (`akili-spec-mapping.md` §3) |

## 7. No-pass clauses

The base list lives in `references/akili-spec-mapping.md` §3 ("Writing the no-pass clause"); do not copy it into the task, point to it. This guide adds two conditions that a green run must report **inconclusive**:

- **A changed judge, rubric or prompt without re-scoring the baseline.** The new scores are on a different scale from the baseline, so the comparison is meaningless until the baseline is re-scored under the same judge, rubric and prompt.
- **Audio-pipeline evidence missing or not comparable.** The audio set was not run, ran against a different speech-recognition or end-of-speech configuration than the baseline, or only transcript cases were scored for a phone-agent gate.

## Sources

Fetched live 2026-11-14.

1. Anthropic, Define success criteria and build evaluations (task-specific evals, automate grading, volume over polish, LLM-graded Likert and binary methods, different-model grader comment in the examples) — https://platform.claude.com/docs/en/test-and-evaluate/develop-tests (the pinned `docs.anthropic.com/en/docs/test-and-evaluate/develop-tests` returns a 301 to this address). Only the first part of the page was read; claims are limited to what it showed.
2. LangSmith, Evaluation concepts (offline versus online evaluation, regression testing against baselines, LLM-as-judge review caveat, human feedback, datasets as input and reference-output pairs) — https://docs.langchain.com/langsmith/evaluation-concepts. The page does not describe judge calibration in detail; the calibration rule here is an AKILI requirement, not a claim about this source.
