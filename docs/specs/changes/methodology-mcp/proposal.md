# Proposal: AKILI-SPECS Methodology MCP Server

**Recommendation:** evaluated as the lead candidate, **AgentCore Gateway alone does not cover what the brief asks for**. Gateway can serve MCP prompts and resources only from an **MCP-server target**, which means a second MCP server hosted somewhere behind it. The "one small Lambda" target that makes Gateway-only cheap shows up as MCP **tools** only, so the 14 commands would stop being prompts (slash commands) and the methodology would arrive as tool output. It also needs a token in every client and a deploy on every release, and it cannot see the user's repository. So:

1. **Chunk 1 — local stdio MCP inside the `akili-specs` npm package** (`npx -y akili-specs mcp`, Option A). Real prompts and resources, project-aware tools, $0, no secrets, works offline, in sync with npm by construction.
2. **Chunk 2 — Gateway-only with one Lambda target** (Option G1) as the **remote, tools-only** channel for cloud agents (Bedrock/AgentCore) and users without Node, on the same core. About **$1/month or less** at 10k calls (estimate, §10.4). It is gated separately and only goes ahead when a concrete cloud consumer exists.
3. Gateway with an MCP-server target on AgentCore Runtime (G2/B) is used only if remote **prompts/resources** become a requirement. It is the most capable remote option, and also the most expensive to run.

No Bedrock **model** is needed in any option. The server serves files and runs deterministic code, so it makes no LLM calls.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/methodology-mcp` |
| Slug | `methodology-mcp` — given as the first token of the argument; the rest of the brief is proposal context |
| Type | **Change** |
| Deliverable | `software` |
| Approval Mode | `gated` — brief: *"Approval Mode: gated … stop at the approval gate"* |
| Requirement source | The `/akili-propose` brief of 2026-10-27 plus the owner's mid-run update the same day: *"leaning toward AgentCore Gateway alone as the MCP endpoint … Treat 'Gateway-only' as the lead candidate and evaluate it honestly"*. No Jira, no Figma |
| Scope of this run | `proposal.md` only. No specify, execute, push, or AWS resource creation (brief) |
| Depends on | none |
| Parallel-safe | **no** with any spec editing `bin/akili.js` dispatch (`:2911–2933`) or `package.json` `files` |
| Proposed chunking | Spec family of 2 children (§11.2). `family.md` is written **only after** approval (`/akili-propose` Step 1.1 *Scope Chunking*) |
| Baseline | `45f2500` on branch `JuankCadavid/methodology-mcp`, package `2.37.2` (`package.json:3`) |
| Target AWS account | As set by `docs/infrastructure.md` → *Rule: AWS target account* (owner constraint, 2026-10-27). No AWS command has been or may be run against it in this proposal. It applies to chunk 2 only |
| AWS docs | Read 2026-10-27 through the AWS documentation MCP (`aws-mcp` `search_documentation`); references §10.6 |
| Date | 2026-10-27 |
| Status | **Approved** (Juan Carlos Cadavid, 2026-10-27, as recommended: chunk 1 local stdio first, chunk 2 Gateway + Lambda `pending` until OQ-6 is a yes; OQ-1..OQ-8 accepted at their defaults) |

## 2. Intent

Let any MCP client use the AKILI-SPECS commands, skills, and persona templates through one MCP endpoint, without running `akili install` to copy files into each tool's config directory. The clients named in the brief are Claude Code, Cursor, Codex CLI, OpenCode, Antigravity, Grok Bot, and Bedrock/AgentCore agents.

## 3. Problem / Current Behavior

Citations run at `45f2500` on 2026-10-27.

| # | Claim | Evidence |
|---|---|---|
| 1 | The methodology reaches a tool only by copying files into its config directory with `akili install` | `bin/akili.js:1064` `installTool`; `README.md:70` lists the six supported tools |
| 2 | The package has no MCP server and no MCP entry point; its only MCP artifact is a sample config for a third-party GSC server | `grep -n "mcp" bin/akili.js` → only `SOURCE_MCP_EXAMPLE` (`:90`, `:1187`, `:1705`); `.mcp.json.example` configures `@mikusnuz/gsc-mcp` |
| 3 | CLI commands today: `install`, `update`, `doctor`, `routing`, `list`, `notifications`, `help`, `init`, `check-update` | `bin/akili.js:2890–2933` |
| 4 | The package has **zero runtime dependencies**; Node floor `>=18.0.0` | `grep -c '"dependencies"' package.json` → 0; `package.json` `engines` |
| 5 | Every command file carries YAML frontmatter with `name` and `description`, the two fields an MCP prompt or tool listing needs | `.claude/commands/akili-propose.md:1–7`; 14 files in `.claude/commands/` |
| 6 | Content size: 14 commands ≈ 463 KB (largest `akili-constitution.md` 122 KB); skills 2.4 MB in 244 files; largest single file `.claude/templates/digests.json` 453 KB | `wc -c`, `du -sh`, `ls -S` over `.claude/` |
| 7 | Some command text names files that exist only after an install (`akili/scripts/parse_tests.js`, `akili/templates/`) | `.claude/commands/akili-test.md:153`; `.claude/commands/akili-audit.md:60` |
| 8 | `digests.json` is versioned per release, ships in the package, and is read by `doctor --agents` | `.claude/templates/digests.json:2` (`"version": "2.37.2"`); AGENTS.md *Repository Purpose* |
| 9 | Cloud agents (Bedrock/AgentCore) have no local tool config directory, so a file install cannot reach them | `UNVERIFIED — confirm at source before relying on it` (not checked per agent framework) |

## 4. Proposed Outcome

| Who | Today | After chunk 1 (A) | After chunk 2 (G1) |
|---|---|---|---|
| Developer in an MCP client | `npx akili-specs install --tool <t>` | One MCP server entry (`npx -y akili-specs mcp`); commands as **prompts**, skills/templates as **resources**, 3 project tools | Same; or a remote URL + token giving **tools** that return the same content |
| Bedrock / AgentCore agent | No path | No path (no local process) | Gateway MCP endpoint with a JWT; tools such as `get_command`, `get_skill_file` |
| Maintainer | `release:*` → npm | Same; the MCP content is the tarball | Plus one gated Lambda deploy per release, built from the published tarball |

## 5. Scope

**This proposal (decision):** pick the hosting approach and the chunking.

**Chunk 1 — `changes/methodology-mcp/local-stdio` (proposed):**

- `akili mcp` subcommand: an MCP server over **stdio**.
- **Prompts:** one per `.claude/commands/*.md`; name and description come from the frontmatter, the body is the message, and `$ARGUMENTS` is one optional string argument.
- **Resources:** skills (`SKILL.md` + `references/`), persona templates, `digests.json`, `model-registry.json`, helper scripts. All are read-only text under a versioned URI (e.g. `akili://2.38.0/skills/kaizen/SKILL.md`; scheme fixed in design).
- **Tools (read-only):** `doctor_agents` (the `doctor --agents` logic, no `--fix`), `resolve_spec_path` (the `/akili-propose` path rules), `list_active_specs` (scans `docs/specs/` and honors the non-spec carve-outs).
- A **transport-free core** (`bin/mcp-core.js` or similar): catalog built from the package directory, plus content handlers. Chunk 2's Lambda reuses it unchanged.
- README + `docs/cli.md` client snippets; CHANGELOG entry.

**Chunk 2 — `changes/methodology-mcp/gateway-lambda` (proposed, separate gate):** one Node Lambda wrapping the same core's content handlers, one AgentCore Gateway (`protocolType MCP`, `CUSTOM_JWT` inbound with a Cognito M2M client), IaC, a per-release deploy step built from the published npm tarball, a Budgets alarm, and an `release:status` check of the deployed version. It is specified only after chunk 1 ships and OQ-6/OQ-7 are answered.

## 6. Non-Goals

- No Bedrock model invocation in any chunk (§10.1).
- No write tools. The server never creates or edits spec files, personas, or `AGENTS.md`, and the client's agent writes files with its own tools. `doctor --agents --fix` and `akili routing` stay CLI-only.
- No removal or deprecation of `akili install`.
- No AWS resources, accounts, or IaC in chunk 1.
- No AgentCore Runtime container in either planned chunk (kept as the G2 escalation path, §11.3).
- No paid/private methodology tier or per-user content.

## 7. Affected Users, Systems, And Specs

| Area | Chunk | Effect |
|---|---|---|
| `bin/akili.js` | 1 | New `mcp` case in dispatch (`:2911–2933`), help text (`:223`); no banner/update check on that path |
| New `bin/mcp-core.js` + stdio transport | 1 | Pure catalog/handler functions, tested like `bin/persona.js` / `bin/routing.js` |
| `bin/persona.js` | 1 | Reused, unchanged, by `doctor_agents` |
| `package.json` | 1 | `files` already ships `bin` and `.claude/*`; a dependency only if OQ-1 picks the SDK |
| `test/` | 1 | JSON-RPC framing, `initialize`, `prompts/*`, `resources/*`, `tools/*`, path-traversal rejection |
| New Lambda handler + IaC dir, release checklist, `scripts/release-status.js` | 2 | Remote channel; deploy step after `npm publish` |
| Docs | 1, 2 | `README.md`, `docs/cli.md`, `docs/release-checklist.md` (2), `CHANGELOG.md` |
| Specs | — | The only active spec (`changes/review-intensity-trial-terms`) edits command prose, not these files |

## 8. Visual Reference

- Source: None
- Location: n/a
- Notes: backend-only (brief). No UI surface; Mockup Fallback does not apply.

## 9. Requirement Delta Preview

### ADDED Requirements

- (1) `akili mcp` answers `initialize`, `prompts/list|get`, `resources/list|read`, `tools/list|call` over stdio. Every installable command is a prompt, every skill file and template is a resource, and the served version equals the running package version.
- (1) Three read-only project tools: `doctor_agents`, `resolve_spec_path`, `list_active_specs`.
- (1) `resources/read` rejects any URI outside the shipped content; stdout carries protocol frames only.
- (2) A remote MCP endpoint (Gateway) exposes stable content tools (`list_catalog`, `get_command`, `get_skill_file`, `get_template`) and requires a valid JWT. Each response names the package version it was built from.

### MODIFIED Requirements

- `akili help` / `README.md` list the subcommand and the per-client MCP setup.
- (2) The release flow gains a gated "deploy remote content" step after `npm publish`.

### REMOVED Requirements

- None.

## 10. Approach Options

### 10.1 Is a Bedrock model needed?

**No, in every option.** Serving prompts, resources, and content tools is file I/O, and the project tools are deterministic code. The LLM that interprets the methodology is the one the MCP client already runs. AgentCore bills Gateway calls and Runtime compute. Model inference is a separate charge that applies only if something calls a model [R9]. Neither Gateway nor Lambda nor Runtime requires enabling Bedrock model access for this server, and no part of the design calls one.

### 10.2 Gateway-only (lead candidate): what it actually takes

AgentCore Gateway is an MCP endpoint over **targets**. It hosts no content of its own, so "Gateway alone" always means Gateway plus at least one target [R6][R10]. Gateway can serve the methodology through two target shapes:

| | **G1 — Gateway + one Lambda target** | **G2 — Gateway + MCP-server target** |
|---|---|---|
| What sits behind Gateway | One small Node Lambda bundling the release's `.claude/` content (or reading it from S3 per version), with a fixed tool schema of ~4 tools | A full MCP server reachable over HTTPS. It must be hosted somewhere: AgentCore Runtime [R2], or a Lambda/HTTP host `UNVERIFIED — confirm at source before relying on it` (Lambda function URL as a Gateway MCP-server target not confirmed in the docs read) |
| MCP primitives exposed | **Tools only.** Lambda targets are defined by a tool schema, and Gateway presents target operations as MCP tools [R4][R7]. The Lambda receives only the tool's input properties plus a context naming the tool [R7]. No document read shows a Lambda target supplying prompts or resources | **Tools, prompts, resources, resource templates.** Gateway supports `prompts/list|get`, `resources/list|read`, `resources/templates/list` and caches them **from connected MCP server targets** [R5] |
| Commands appear as | Tool calls returning command text (e.g. `akili___get_command{name:"akili-propose"}`; prefix format per [R5][R7]) | Prompts, prefixed `targetName___` [R5]; resource URIs passed through unprefixed [R5] |
| Is it "Gateway alone"? | Yes, plus a Lambda | **No**: it is Option B behind a Gateway |
| Per-release sync | Fixed tool schema means only the Lambda code/content changes per release. Build the zip from the **published npm tarball** (bytes = npm), publish a Lambda version, move the alias. Update the target (implicit resync) only when the tool set changes [R5] | Deploy the server; then resync, because list calls are served from Gateway's cache, refreshed by Create/UpdateGatewayTarget or `SynchronizeGatewayTargets` [R5] |
| Size limits | Max tool-call payload 6 MB [R11]; largest file 453 KB (§3 #6). Fits | Same 6 MB [R11] |

**Inbound auth (both G1 and G2)** [R3][R12][R13]:

| Type | Fit for AKILI |
|---|---|
| `CUSTOM_JWT` (Cognito or any OIDC IdP; `allowedClients`/`allowedAudience`/`allowedScopes`) | **Recommended.** Cognito M2M client credentials. Clients send `Authorization: Bearer`. Friction: tokens expire, so a client configured with a static header needs a refresh routine, unless it speaks MCP OAuth discovery. Gateway can advertise OAuth protected-resource metadata [R13], but which of the six clients use it is `UNVERIFIED — confirm at source before relying on it` |
| `AWS_IAM` (SigV4) | Good for cloud agents that already hold IAM credentials (`bedrock-agentcore:InvokeGateway`) [R12]. IDE clients would need a local SigV4-signing proxy `UNVERIFIED — confirm at source before relying on it` |
| `AUTHENTICATE_ONLY` / `NONE` | `NONE` is documented for development and testing [R10]. Not for a public billable endpoint |

Outbound to the Lambda uses the gateway's execution role, so there is no secret on the target side [R10].

**Monthly cost, G1** (us-east-1-style list prices; Gateway figures from [R9], the rest `UNVERIFIED — confirm at source before relying on it`, from general AWS pricing, not fetched in this run):

| Item | 10k calls/month | 1M calls/month |
|---|---|---|
| Gateway invocations ($0.005 / 1,000, incl. list calls) [R9] | $0.05 | $5.00 |
| Gateway tool indexing (only if semantic search is on; $0.02 / 100 tools / month) [R9] | ≈ $0.00 (4 tools) | ≈ $0.00 |
| Lambda (256 MB, ~100–200 ms per call) | ≈ $0 (free tier) | ≈ $1–2 |
| Cognito M2M token requests | low; price per token request unverified | depends on token reuse |
| CloudWatch logs, S3/ECR storage | cents | ~$1 |
| **Total (estimate)** | **< $1** | **≈ $7–10** |

AgentCore Identity is free when used through Gateway or Runtime [R9]. **Accounts:** one AWS account, the one set by `docs/infrastructure.md`. AgentCore Gateway availability in that file's region is `UNVERIFIED — confirm at source before relying on it` (regional list not checked in this run); an IAM execution role; a Cognito user pool with an M2M app client; and AWS Budgets on the account.

**Honest verdict on Gateway-only:** G1 is the cheapest and simplest **remote** option, and a good fit for cloud agents, which consume tools anyway. It is a poor fit as the **only** channel for IDE users:

- They lose prompts (slash commands) and resources.
- They must manage a token.
- They lose offline use and the project-aware tools.
- Every release gets a second artifact to keep in sync.

G2 restores prompts and resources, but only by hosting an MCP server, at which point the Gateway is optional.

### 10.3 All options compared

| | **A — local stdio in npm package** | **G1 — Gateway + Lambda** (lead candidate) | **B / G2 — MCP server on AgentCore Runtime** (± Gateway in front) |
|---|---|---|---|
| Commands as prompts | Yes | **No** (tools) [R4][R7] | Yes [R2][R5] |
| Skills/templates as resources | Yes | No (tools return the text) | Yes |
| Project-aware tools (`doctor_agents`, `list_active_specs`) | Yes | No: no access to the user's checkout | No, same reason |
| Auth / secrets on client | None (local process) | JWT bearer or SigV4 per client | Same as G1 (Runtime also takes a Custom JWT authorizer [R3]) |
| Offline | Yes, once cached | No | No |
| Sync with npm | **By construction** | Second artifact; built from the published tarball; drift possible if the deploy step is skipped | Second artifact (ARM64 container image [R1]); plus Gateway resync if fronted [R5] |
| Monthly AWS cost | $0 | < $1 at 10k calls (§10.2) | Runtime $0.0895/vCPU-h + $0.00945/GB-h, billed on consumption [R9], plus ECR, logs, IdP; a few USD at low volume `UNVERIFIED — confirm at source before relying on it` (no calculator run) |
| Ops | npm release only | Lambda + Gateway + IdP + alarm | Container build/push, Runtime, IdP, alarm, optional Gateway |
| Serves cloud agents / no-Node users | No | **Yes** | Yes |
| Effort | Small | Medium (IaC + release step) | Large |

### 10.4 Phased hybrid on one core

A ships first. Its core exposes `buildCatalog(packageDir)` and content handlers with no transport. G1's Lambda imports the same handlers and maps them to four tools. Nothing project-aware runs remotely. If remote prompts are ever required, the same core gets a streamable-HTTP transport on Runtime (G2/B).

### 10.5 Option dropped from the original brief

The brief's Option C (Gateway with a Lambda/OpenAPI target only) is **G1**: it is evaluated above, not dropped. An OpenAPI target would add an API to host and maintain, with no gain over a Lambda target.

### 10.6 References

- [R1] [MCP protocol contract](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-mcp-protocol-contract.html): host `0.0.0.0`, port `8000`, ARM64 container.
- [R2] [Deploy MCP servers in AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-mcp.html): path `/mcp`, stateless (recommended) or stateful streamable HTTP, payload passed through.
- [R3] [Configure inbound JWT authorizer](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/inbound-jwt-authorizer.html): IdP-agnostic JWT validation for Runtime and Gateway.
- [R4] [MCP deployment patterns on AWS, Pattern 1](https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-deployment-patterns-on-aws/deployment-pattern-1-amazon-bedrock-agent-core.html): *"Gateway uses the configured Lambda tool schema or OpenAPI specification to present target operations as MCP tools"*; *"Use AgentCore Runtime only for custom MCP server implementations."*
- [R5] [Extending MCP support for AgentCore Gateway](https://aws.amazon.com/blogs/machine-learning/extending-mcp-support-for-amazon-bedrock-agentcore-gateway-2/): prompts/resources methods supported; *"discovers and caches tools, prompts, and resources from connected MCP server targets"*; `SynchronizeGatewayTargets`; `targetName___` prefix.
- [R6] [MCP targets](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-targets-mcp.html): aggregation mode across Lambda, API Gateway, OpenAPI, Smithy, MCP-server targets.
- [R7] [AWS Lambda function targets](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-add-target-lambda.html): event is the tool's input properties; context carries `bedrockAgentCoreToolName`.
- [R8] [AWS API MCP Server on AgentCore Runtime with Cognito](https://aws.amazon.com/blogs/machine-learning/integrating-aws-api-mcp-server-with-amazon-quick-suite-using-amazon-bedrock-agentcore-runtime/): Cognito M2M, bearer token.
- [R9] [Amazon Bedrock AgentCore pricing](https://aws.amazon.com/bedrock/agentcore/pricing/): Gateway $0.005/1k invocations, $0.025/1k search, $0.02/100 tools indexed/month; Runtime v1 $0.0895/vCPU-h, $0.00945/GB-h; Identity free via Runtime/Gateway. Also the [harness GA post](https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-harness-is-now-generally-available-go-from-idea-to-production-grade-agent-in-minutes/): model inference charged separately.
- [R10] [Gateway core concepts](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-core-concepts.html): inbound types JWT / IAM / authenticate-only / none (*"for development and testing"*); Lambda targets called with the gateway execution role.
- [R11] [Quotas for AgentCore](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/bedrock-agentcore-limits.html): max tool-call/list payload 6 MB; 15-minute invocation timeout; 1 MB inline schema; 200 TPS.
- [R12] [Authorization example with the AgentCore CLI](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-using-auth-ex-starter.html): omitting `--authorizer-type` yields `NONE`; `AWS_IAM` needs `bedrock-agentcore:InvokeGateway`.
- [R13] [Set up inbound authorization](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-inbound-auth.html) and [CustomJWTAuthorizerConfiguration](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-bedrock-agentcore-control-2023-06-05.html): `allowedClients`/`allowedAudience`/`allowedScopes`; advertised scopes in OAuth protected-resource metadata.

## 11. Recommended Approach

### 11.1 Choice

**A first, G1 second, Runtime only on demand.**

- **A is the smallest safe path:**
  - It needs no secrets, no account, and no spend, and opens no public endpoint.
  - Its content cannot drift from npm, which closes the `digests.json` sync risk for chunk 1.
  - It is the only option that keeps both real prompts and project-aware tools.
  - It is reversible.
- **G1 is the right remote shape when a remote one is needed.** It is the owner's lead candidate, and the evidence supports it for cloud agents. It costs under $1/month at low volume, adds no container, and needs no schema change per release.
- **Gateway-only is not recommended as the first or only channel.** The docs show its Lambda target serves tools, not prompts or resources [R4][R5][R7], so IDE users would get a weaker product than `akili install` gives them today, plus a token to manage.

### 11.2 Proposed spec family (written on approval)

| # | Spec Path | Delivers | Depends on | Parallel-safe | Release | MoSCoW |
|---|---|---|---|---|---|---|
| 1 | `changes/methodology-mcp/local-stdio` | Option A + shared core + docs | none | no (edits `bin/akili.js`) | minor (new command) | **Must** |
| 2 | `changes/methodology-mcp/gateway-lambda` | G1: Lambda on the core, Gateway (`CUSTOM_JWT`, Cognito M2M), IaC, release deploy step, Budgets alarm, `release:status` check | `changes/methodology-mcp/local-stdio` | no | minor + AWS rollout | **Should** if a cloud consumer exists (OQ-6), else **Could** |

MoSCoW rather than RICE: two chunks with a hard dependency, so the order is fixed.

### 11.3 Escalation path (not a planned chunk)

If remote **prompts/resources** become a requirement, add a streamable-HTTP transport on the same core, deploy it to AgentCore Runtime [R1][R2], and register it as a Gateway MCP-server target. Then call `SynchronizeGatewayTargets` on each release [R5]. This needs a new proposal row in `family.md` (closed-set rule).

## 12. Risks, Dependencies, And Open Questions

### Risks

| # | Risk | Applies to | Mitigation |
|---|---|---|---|
| R-1 | **Skills lose auto-triggering**: clients load native skills by description match, but an MCP resource or tool result is read only when asked for. Fidelity may be lower than `akili install`. `UNVERIFIED — confirm at source before relying on it` (per-client behavior not tested) | A, G1, B | Each command already names its skills; prompt/tool output lists the skill URIs or names; `akili install` stays the full-fidelity path |
| R-2 | **Install-layout paths in command text** (`akili/scripts/parse_tests.js`, `akili/templates/`) are absent for MCP-only users (§3 #7) | A, G1, B | OQ-3 |
| R-3 | **Uneven client support for MCP prompts/resources/remote auth**. Claude Code surfaces MCP prompts as slash commands; Cursor, Codex CLI, OpenCode, Antigravity, Grok Bot are `UNVERIFIED — confirm at source before relying on it` | A, G1 | Verify per client at specify; a support table in the docs; content tools as fallback in A |
| R-4 | **Stdout pollution breaks stdio framing**: banner (`bin/akili.js:303`), update check (`:2390`) | A | `mcp` path skips both; a test asserts stdout carries only frames |
| R-5 | **Path traversal** via resource URIs, tool `path` arguments, or the project-dir argument | A, G1 | Allow-list from the catalog, never a joined path; tests with `..`, absolute paths, symlinks |
| R-6 | **First runtime dependency** if the MCP SDK is used, ending the zero-dependency property (§3 #4) | A | OQ-1 |
| R-7 | **Secrets**: a Cognito client secret or bearer token ends up in client MCP configs, which get committed | G1, B | Env-var references in every doc snippet; never a secret in examples (AGENTS.md *Development Rules*); short token lifetime |
| R-8 | **Multi-tenant auth**: one shared M2M client cannot be revoked per user; per-user clients mean user management | G1, B | OQ-5: shared client + rotation for v1, or per-consumer app clients (`allowedClients` list [R13]) |
| R-9 | **Content/version drift**: deployed Lambda ≠ `npm latest`; remote `digests.json` must match the release a user's personas came from | G1, B | Build from the published tarball; version in every response; versioned tool argument; deploy step in `docs/release-checklist.md`; `release:status` flags a mismatch |
| R-10 | **Public exposure**: content is MIT and already public on npm/GitHub, so disclosure risk is low. The real exposure is a billable endpoint (abuse, cost) | G1, B | JWT required, never `NONE` [R10]; Gateway 200 TPS default quota [R11]; AWS Budgets alarm |
| R-11 | Token refresh friction makes the remote channel hard to use from IDE clients with static headers | G1, B | Target cloud agents first; document refresh; check MCP OAuth discovery support per client (R-3) |
| R-14 | **CI deploy dependency.** The target account's GitHub Actions OIDC deploy is reported broken (`UNVERIFIED — confirm at source before relying on it`; owner report, recorded in `docs/infrastructure.md`, not checked). A CI deploy step for chunk 2 cannot work until a working OIDC role exists in that account | G1, B | Chunk 2 entry prerequisite: a working OIDC role, scoped to this stack and trusted only for this repo/branch. Until then, deploys are manual and gated, with the profile `docs/infrastructure.md` names, and are never done by an agent |
| R-12 | Test budget under-estimated for a protocol harness | A | Budget test LOC per scenario clause, not per task: **KZ-bugfix--init-ctrlc-abort-2** |
| R-13 | Shipped tests must not read `docs/specs/<active spec>` for `list_active_specs` fixtures | A | Fixture trees under `test/fixtures/`: **KZ-changes--archify-diagrams-1** |

### Open questions

| # | Question | Default if unanswered |
|---|---|---|
| OQ-1 | Hand-roll stdio JSON-RPC (zero deps) or depend on `@modelcontextprotocol/sdk`? | Hand-roll: seven methods over newline-delimited JSON; check the SDK's Node floor vs `>=18` at specify (`UNVERIFIED`) |
| OQ-2 | Prompt arguments: one free-text string or typed per command? | One string, matching `$ARGUMENTS` |
| OQ-3 | Install-layout paths in command text: rewrite at serve time, add resource URIs, or document? | Leave the text unchanged; document that helpers are resources and that `akili install` provides them |
| OQ-4 | Should `akili install` also write the MCP entry into each tool's config? | No in chunk 1 |
| OQ-5 | (2) One shared Cognito M2M client, or one app client per consumer? | One per consumer, listed in `allowedClients` |
| OQ-6 | (2) Is there a concrete cloud-agent consumer today? | Without one, chunk 2 stays `pending` and is not specified |
| OQ-7 | (2) Account and region are **decided** by `docs/infrastructure.md`. Still open: the IaC tool (CDK vs SAM). Sharing an account with a live site also calls for resource tagging, a separate Budgets alarm, and least-privilege roles scoped to this stack | CDK, matching the existing stacks; tag `project=akili-mcp` |
| OQ-8 | (2) Bundle content in the Lambda zip per release, or one Lambda reading `s3://…/<version>/` for multi-version serving? | Bundle per release (simplest, immutable Lambda versions); revisit if old-version serving is needed |

## 13. Success Criteria

- From a clean machine with Node ≥18 and no `akili install`, one MCP entry in Claude Code makes all 14 commands available as prompts and any skill file readable.
- `prompts/list` and `resources/list` match the files in the published tarball for that version, file for file.
- `doctor_agents` returns the same section states as `akili doctor --agents` on the same project.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass on all six CI legs.
- Chunk 1 creates no AWS resource and requires no secret.
- (2) A cloud agent with a valid JWT lists the content tools and fetches `akili-propose` byte-identical to the npm tarball. A request without a JWT is rejected. Monthly spend stays under the Budgets threshold.

## 14. Next Step

On approval, write `docs/specs/changes/methodology-mcp/family.md` (two rows, §11.2, both `Status: pending`). Then create the chunk 1 folder with its own `proposal.md` (`Parent Spec: changes/methodology-mcp`), and run:

```text
/akili-specify changes/methodology-mcp/local-stdio
```

Chunk 2 is specified only once OQ-6 is a yes.
