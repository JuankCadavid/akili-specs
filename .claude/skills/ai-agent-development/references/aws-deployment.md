# AWS Hosting Decision for Agent Workloads

Last verified: 2026-08-10

**Decision content only** — where an agent workload runs, not how to operate or build it. No configuration, no APIs, no IaC. Bracketed numbers resolve in `## Sources`; every factual claim carries one. All three options changed shape recently, so re-check the date above before trusting a comparison.

Hand-offs, per the skill's deferral table:

- **Operating** Bedrock / AgentCore — Harness setup, Memory, Gateway, guardrails → `amazon-bedrock` *(when present; official AWS Bedrock docs otherwise)*.
- **Implementing** the hosting you picked — Lambda functions, ECS task definitions, API Gateway, deployment tooling → `aws-serverless` *(when present; official AWS docs otherwise)*.

## Read the columns correctly

Hosting is a separate question from framework: AgentCore Runtime "works with custom frameworks and any open-source framework" [1], so picking it does not pick your orchestration library — see `framework-selection.md`. Two distinctions sit inside the columns below and are easy to conflate:

| Variant | What it changes |
|---|---|
| **AgentCore Harness** vs plain Runtime | Harness is the managed agent loop — you declare model, tools, and instructions instead of authoring a loop; it runs on "isolated microVM per session (backed by AgentCore runtime)" [6]. Choosing Harness is choosing the AgentCore column *and* giving up loop authorship, so it answers the framework question too. |
| **Lambda is three shapes**, not one | *Standard functions* — stateless, 900-second ceiling [8][9]. *Durable functions* — "execute for up to one year", checkpointed, with waits that "suspend execution without incurring compute charges" and a Resume phase that "restarts from last checkpoint" [10][18]. *MicroVMs* — stateful, session-affine, preserving memory and disk for up to 8 hours [11][12]. The Lambda column below is read three ways; a claim about "Lambda" that names no shape is usually wrong about two of them. |

AgentCore Runtime also offers an **Instances** compute type (EC2-backed) whose sessions run up to 14 days and retain persistent volumes across stops [3] — reach for it only when 8 hours is the binding constraint.

## Comparison

| Dimension | AgentCore Runtime | Lambda | ECS (Fargate) |
|---|---|---|---|
| **State persistence** | Dedicated microVM per session with isolated CPU, memory, filesystem; context preserved across invocations in the session, but "session state is ephemeral" — durability belongs to AgentCore Memory [2] | Standard functions: "For **standard** Lambda functions, you should assume that the environment exists only for a single invocation" — commit durable state externally [9]. Durable functions: state is checkpointed and recovered by replay that skips completed work [18]. MicroVMs: memory and disk survive suspend/resume for the session [11][12] | Task-local only. Tasks are replaced on deploys and scheduled retirements (default 7-day wait, configurable to 14) [15], so agent state must live in a store outside the task |
| **Execution duration** | Session up to 8 hours, terminated after 15 minutes idle; both adjustable via `maxLifetime` and `idleRuntimeSessionTimeout` [2][4]. Async background work is first-class [5] | Standard functions: hard 900-second (15-minute) maximum [8]. **Durable functions: up to one year** [10][18]. MicroVMs: up to 8 hours of preserved session state [12] | No service-imposed limit; a task runs until stopped, replaced, or retired [15] |
| **Cold start** | Idle sessions stay provisioned, so a returning caller usually skips the penalty; a terminated session provisions a fresh environment on the next invocation [2][4] | Standard functions: cold starts occur "in under 1% of invocations", "under 100 ms to over 1 second" [10]. MicroVMs: resume is snapshot-restored and adds latency only to the first request after suspend [11] | Paid at task launch — billing runs "from the time your container images are pulled" [14]. A running service is already warm; the trade is that you pay for it while it waits [14] |
| **Cost shape** | Per-second on *actual* CPU consumed plus peak memory, 1-second minimum, 128 MB memory floor; I/O wait costs no CPU [7]. Instances bill EC2 cost plus a management fee [7] | Standard functions: per request plus GB-seconds of duration [13]. Durable functions: waits cost no compute — "you pay only for actual processing time, not idle waiting" [18]. MicroVMs: per instance-second, dropping to snapshot storage only while suspended [11][13] | Per second on the vCPU and memory you *requested*, from image pull to task exit, one-minute minimum [14] — you pay for idle |
| **HITL wait** | Harness exposes an `inline_function` tool type that emits a tool-use event and waits for your response, documented for "human-in-the-loop approvals" [16] | Two documented routes, neither of which blocks a billed process. **Durable functions** wait in code: waits "suspend execution without incurring compute charges", named for "human-in-the-loop workflows", resuming from the last checkpoint [18][10]. **Step Functions** callbacks pause on a task token up to the one-year execution quota [17]. Only blocking a *standard* function is the anti-pattern — you pay for the wait and hit 15 minutes anyway [8] | A blocking wait is affordable in wall-clock terms but the task can be retired mid-wait [15]; persist the pending decision outside the task |

## Decision rules

Apply in order; the first rule that decides, decides.

1. **A human or an external system gates the run → make the wait survivable first, then pick compute.** This constraint outlives every process. Three documented options survive the compute dying: Harness's `inline_function` [16], a durable function's wait [18], or a Step Functions callback [17]. An in-process `sleep` does not, and it bills. Between the latter two, AWS's own chooser splits on scope: workflow logic living in code beside the business logic → durable functions; orchestration across many AWS services → Step Functions [19].
2. **Duration sets the floor.** Under 15 minutes, stateless, request/response → standard Lambda functions [8]. Multi-hour or session-shaped → AgentCore Runtime or Lambda MicroVMs [4][12]. Beyond 8 hours → Lambda durable functions to one year [18], AgentCore Runtime Instances to 14 days [3], or ECS.
3. **Session identity is the strongest signal for AgentCore.** If a run is "one user's conversation with its own filesystem", the per-session microVM with an idle timeout [2] is the shape you would otherwise build by hand on ECS.
4. **Bursty and idle-heavy favors consumption billing; steady and saturated favors provisioned.** Agent runs sit in I/O wait for much of their wall-clock time, and AgentCore bills CPU only when it is consumed [7], where Fargate bills the reservation throughout [14].
   > Unvalidated: no official source compares total cost *across* these services, and AWS's own I/O-wait savings framing is vendor-published [7]. Treat the ordering as a hypothesis to price against your real traffic, not a settled result.
5. **Pick ECS when the constraint is the container, not the agent** — a sidecar, a custom kernel dependency, an existing service the agent joins, or a workload already on the cluster. Otherwise its always-on cost buys nothing an agent needs.
6. **Choosing is not building.** Once the column is picked, this file is done: hand to `amazon-bedrock` for AgentCore operation and `aws-serverless` for Lambda/ECS/API Gateway implementation.

## Sources

1. What is Amazon Bedrock AgentCore — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html
2. AgentCore Runtime, how it works (sessions, microVMs, isolation, ephemerality) — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-how-it-works.html
3. AgentCore Runtime Instances (14-day sessions, persistent volumes) — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-instances-how-it-works.html
4. Quotas for Amazon Bedrock AgentCore (idle timeout, max session duration) — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/bedrock-agentcore-limits.html
5. Handle asynchronous and long running agents with AgentCore Runtime — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-long-run.html
6. AgentCore harness (managed agent loop, microVM per session) — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/harness.html
7. Amazon Bedrock AgentCore pricing (consumption billing, Instances fee) — https://aws.amazon.com/bedrock/agentcore/pricing/
8. Configure Lambda function timeout (900-second maximum) — https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html
9. Designing Lambda applications (implement statelessness in functions) — https://docs.aws.amazon.com/lambda/latest/dg/concepts-application-design.html
10. Understanding the Lambda execution environment lifecycle (cold starts) — https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html
11. Running and using Lambda MicroVMs (suspend, resume, billing while suspended) — https://docs.aws.amazon.com/lambda/latest/dg/microvms-launching.html
12. AWS Lambda FAQs (MicroVM state preserved up to 8 hours) — https://aws.amazon.com/lambda/faqs/
13. AWS Lambda pricing (requests + GB-seconds; MicroVMs per instance-second) — https://aws.amazon.com/lambda/pricing/
14. Amazon ECS pricing (Fargate per-second billing, one-minute minimum) — https://aws.amazon.com/ecs/pricing/
15. Task retirement and maintenance for AWS Fargate on Amazon ECS — https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-maintenance.html
16. AgentCore harness GA announcement (`inline_function` for human-in-the-loop approvals) — https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-harness-is-now-generally-available-go-from-idea-to-production-grade-agent-in-minutes/
17. Discover service integration patterns in Step Functions (callback with task token) — https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html
18. Lambda durable functions (one-year executions, checkpoint/replay, waits without compute charges) — https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html
19. Durable functions or Step Functions (chooser between the two orchestration routes) — https://docs.aws.amazon.com/lambda/latest/dg/durable-step-functions.html
