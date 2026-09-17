# `/akili-test`

Run or create tests for a spec path and produce requirement-level evidence, using the AKILI **Leader → Tester(s)** multi-agent harness.

## Usage

```text
/akili-test <spec-path>
```

## Use When

- Implementation tasks are complete or ready for verification.
- You need a requirement-to-test matrix.
- Manual gaps must be documented explicitly.

## Multi-Agent Harness

The main session acts as the **Leader** (orchestrator). It partitions testing into suites (backend unit, frontend unit, integration, E2E) and delegates each to a focused **Tester** subagent defined in `.agents/tester.md`, then aggregates the structured reports.

- **Deployment Rule (token-aware):** Lite depth or a single trivial suite runs **inline** (no spawn); Standard/Full or multiple independent suites get **one Tester per suite**, spawned **in parallel** when they touch different files. Suites that share files run sequentially. The Leader picks the fewest spawns that keep each context small.
- **Thin context per Tester:** each Tester gets only its suite's requirements, scenarios, and test command — never the full spec set — and its context is discarded on completion, so per-suite contexts never accumulate.
- **Author ≠ tester:** Testers prefer a different model than the Implementer that wrote the code, reducing confirmation bias.
- Each Tester reports one status — `PASS`, `FAIL`, or `PRODUCT_BUG` — plus a per-scenario coverage slice. A `PRODUCT_BUG` keeps a correct test red instead of rewriting it to pass.

If `.agents/tester.md` is missing, run `/akili-constitution` first to scaffold it.

**Cross-tool spawn:** Claude Code / OpenCode spawn the Step 8E `akili-tester` wrapper when present; Google Antigravity uses `invoke_subagent`; **Codex**, if `.codex/agents/akili-tester.toml` exists, has the Leader request the named `akili-tester` role by name with the suite's context slice — Codex spawns it, routes the work, and waits. Without wrappers, every host falls back to a sub-prompt seeded with `tester.md`. **Observed live 2026-09-17 (codex-cli 0.154.0), per the model-driven-orchestration note in `/akili-execute`:** the Leader calls a `spawn_agent` tool with the wrapper's name as `agent_type`; the subagent's report returns to the Leader, inspectable with `/subagents`.

**Model checkpoint:** the Leader runs best on **T1**; Testers route through their Step 8E wrapper (T2) when present. Switch with `/model` in Claude Code, the OpenCode model selector, or `/model` in Codex (also sets reasoning effort when available — no separate `/reasoning` command; `Last verified: 2026-09-17` — <https://learn.chatgpt.com/docs/cli/slash-commands>). The registry is a floor, not a ceiling: a stronger session model than the registry entry means the registry is stale, not that you should downgrade.

## Inputs

Reads:

- `docs/specs/<spec-path>/requirements.md`
- `docs/specs/<spec-path>/design.md`
- `docs/specs/<spec-path>/tasks.md`
- `.agents/tester.md`
- project-level constitution docs and agent guidance

## Outputs

Creates or updates:

```text
docs/specs/<spec-path>/test-report.md
```

The report includes:

- commands run and results
- backend unit test evidence
- frontend unit test evidence
- integration test evidence
- E2E test evidence
- requirement-to-test matrix
- scenario coverage status
- failures and remediation
- accepted gaps with reasons

## Skills Commonly Used

- `nestjs-expert`
- `systematic-debugging`
- `vercel-react-best-practices`
- `react-doctor`
- `ui-ux-pro-max`
- `frontend-design`

## Key Rule

Testing must prove the behavior promised in `requirements.md`, not only increase test count.

## Next Step

After test evidence is recorded:

```text
/akili-validate <spec-path>
```
