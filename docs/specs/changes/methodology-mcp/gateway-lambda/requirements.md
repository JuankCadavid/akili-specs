# Requirements: remote AKILI MCP on AgentCore Gateway + Lambda

> **Answer first.** A Claude Code user adds one remote MCP server, signs in once in the browser, and can then run every AKILI command and read every skill, template and helper file, with nothing installed.
>
> - **Surface:** seven read-only tools: `list_commands`, `get_command`, `list_skills`, `get_skill`, `get_template`, `get_file`, `search`. There are no MCP prompts or resources, because a Lambda target exposes tools only.
> - **Content:** the deployed Lambda **is** the published npm tarball. Every result carries `akiliVersion`, and long text comes back in numbered parts.
> - **Access:** open self sign-up with email verification (D-1), one pre-registered public client (D-2), per-user and global rate limits (D-3), and a $20/month budget with an automatic block at 100 % (D-4).
> - **Sync:** every stable GitHub Release deploys the same version from npm after an npm-wait and an integrity check, then smoke-tests it and rolls back on a mismatch.
> - **Gates:** no AWS resource exists until the owner's three separate OKs (D-8): sandbox spike, then the OIDC deploy role, then production. The agent runs no AWS command at any point.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/methodology-mcp/gateway-lambda` |
| Parent Spec | `changes/methodology-mcp` (`family.md` row 1, **Must**, `active`; depends on none) |
| Depth | **Full** (auth, public endpoint, cost, CI deploy; re-checked in design §10) |
| Type | Change |
| Deliverable | software |
| Approval Mode | `gated` for the final spec approval. Owner mandate, 2026-10-27 7:05 PM: *"Answer process gates yourself with the recommended option. Rules: local commits only, NO push, NO AWS commands of any kind (no deploy, no sts, nothing), never write the AWS account ID or role ARNs into the repo, docs in English."* |
| Proposal | `proposal.md`, approved 2026-10-27 7:05 PM with every recommended default for D-0..D-9 (§12 *Decision record*) |
| Target AWS account | `docs/infrastructure.md` → *Rule: AWS target account*. The account ID and role ARNs are never written in this repo |
| Release | minor (new shipped modules `bin/mcp-core.js`, `bin/mcp-lambda.js`, and `docs/mcp.md`), prepared later under the Release Rules. Production rollout (T7) needs a published release that contains the handler |
| Format source | `docs/specs/general-setup/` does not exist in this repository (`ls docs/specs/general-setup` → no such directory). The format follows the sibling `local-stdio` spec |
| Evidence baseline | `138f531`, Node `v22.12.0` locally; CI matrix Node 18 and 22 on Ubuntu, macOS, Windows (`.github/workflows/ci.yml` `matrix`) |
| Status | Phase 1 gate: `auto-approved (owner mandate: recommended option "Continue")`, 2026-10-27 |

## 2. Executive Summary

The methodology reaches a tool today only through `akili install`. This spec adds a hosted channel: an AgentCore Gateway with `CUSTOM_JWT` inbound auth in front of one Node Lambda, which serves the package's own files as tools. The Lambda's code is the npm tarball itself, so remote content cannot drift from npm. A GitHub Actions job keeps it current on every stable release. Cost stays near zero at the expected scale, and rate limits plus a budget kill switch bound the abuse case. The spec writes code, CDK, a workflow and docs; all AWS work is a human-gated task run by or with the owner.

## 3. Glossary

| Term | Meaning |
|---|---|
| Gateway | The AgentCore Gateway (`protocolType MCP`) that is the public MCP endpoint |
| Target | The Gateway's Lambda target `akili`; Gateway names its tools `akili___<tool>` |
| Handler | The Lambda entry point shipped in the npm package |
| Core | The transport-free module that builds the catalog and implements the seven tools; `local-stdio` reuses it later |
| Catalog | The map from catalog key to shipped file, built from the package directory the code runs from |
| Catalog key | `<area>/<path>`, with `<area>` one of `commands`, `skills`, `templates`, `scripts`, and `/` as separator on every OS |
| Shipped content | The files under `.claude/commands/`, `.claude/skills/`, `.claude/templates/`, plus the helper scripts the installer ships (`bin/akili.js:76` `RESOURCE_SCRIPTS`: `gsc_verify.py`, `parse_tests.js`) |
| Part | One slice of a file's text of at most 30,000 characters, numbered `part` of `parts` |
| Stable release | A GitHub Release with `prerelease: false` whose tag is `vX.Y.Z` |
| Kill switch | The automatic or manual action that blocks all traffic (design §7.5) |
| Spike | A temporary sandbox stack that proves sign-in and the Lambda response mapping end to end, deleted afterwards |

## 4. System Context & Scope

Current state, with evidence run at `138f531` on 2026-10-27:

- No hosted runtime exists (`docs/infrastructure.md:3`), and no MCP server code exists in `bin/` (`grep -rln "mcp-core\|mcp-lambda" bin test scripts` → no hits).
- The package has no `dependencies` or `devDependencies` key (`node -e` over `package.json` → both `undefined`), requires Node `>=18.0.0`, and ships `bin`, `docs` (minus `docs/specs`), `.claude/commands|skills|templates` and the two helper scripts through its `files` whitelist (`package.json` `files`). A folder `infra/` would not ship.
- Shipped content is 265 files, about 2.98 M characters; no dotfiles and no symlinks (`find .claude -type l` → none; Node walk over the three areas, run 2026-10-27). The largest are `templates/digests.json` (453,378 chars → 16 parts of 30,000) and `commands/akili-constitution.md` (121,578 chars → 5 parts).
- 14 command files; 9 contain `$ARGUMENTS` and 5 do not (`grep -c '$ARGUMENTS' .claude/commands/*.md`: audit, constitution, resume, review, security → 0).
- Command text names an install-layout path once: `akili/scripts/parse_tests.js` (`grep -rhoE 'akili/(scripts|templates)/…' .claude/commands`). It calls the `akili` CLI in five commands (proposal §3 #4).
- A Gateway Lambda target receives the tool's input properties as the event, and `context.clientContext.custom.bedrockAgentCoreToolName` in the form `<target>___<tool>`. Input schemas support `string`, `number`, `integer`, `boolean`, `array` and `object`. The Lambda *"must return a valid JSON response that can be parsed by the gateway"* ([AWS: Lambda function targets](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-add-target-lambda.html), read 2026-10-27). How Gateway maps that JSON to the MCP tool result is `UNVERIFIED — confirm at source before relying on it` (spike, T6).
- Releases: the maintainer publishes to npm, then runs `gh release create`, which fires `release: published` (`.github/workflows/release-notify.yml:6-8`; `AGENTS.md` *Release Rules* step 4).
- The target account's OIDC deploy role is reported broken: `UNVERIFIED — confirm at source before relying on it` (`docs/infrastructure.md:17`, owner report).

**In scope:** the core and handler (shipped), the CDK app in `infra/mcp-gateway/` (not shipped), the deploy guard script and workflow, docs, tests, and the owner-run spike and rollout checklists.
**Out of scope:** proposal §5 *Leaves out* and §6 *Non-Goals*: MCP prompts/resources, write tools, project-aware tools, rewriting command text, prerelease deploys (D-9), WAF and DCR (D-2), federation (D-5), a custom domain (D-6), any Bedrock model call, and `local-stdio`.

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Claude Code user (public, D-1) | Add the server, sign in, run any AKILI command by asking for it |
| Agent inside the client | Fetch the command, then each skill, template or file it names, without guessing paths |
| Maintainer | Release as today; remote content follows with no manual deploy, and a failed deploy is loud |
| Owner (cost, account) | A bounded bill, a kill switch, and no resource created without an explicit OK |

## 6. Functional Requirements

### FR-1: Catalog of shipped content

The core SHALL build, once per process, a catalog of every shipped-content file keyed by catalog key, from the package directory it runs from.

#### Scenario: Catalog equals the tarball

- GIVEN the package at version `V`
- WHEN the catalog is built
- THEN its `commands/`, `skills/` and `templates/` keys equal, file for file, the `.claude/commands/`, `.claude/skills/`, `.claude/templates/` entries of `npm pack --dry-run --json` for the same tree, and its `scripts/` keys are exactly `scripts/gsc_verify.py` and `scripts/parse_tests.js`
- AND `akiliVersion` equals `version` in the package's own `package.json`
- BUT it must NOT include a symlink, a dotfile, or any file outside the four areas (`package.json`, `bin/…`, `docs/…`)
- AND IT MUST build file metadata only; content is read when a tool asks for it

#### Scenario: Keys are the only way in

- GIVEN a running core
- WHEN a tool receives a path or name that is not an exact catalog key — a `..` segment, `%2e%2e`, an absolute path, a backslash, a drive letter, an empty string, or a real package file outside the catalog (`package.json`, `bin/akili.js`)
- THEN the tool returns a `not_found` error and reads no file
- BUT it must NOT resolve input by joining it onto a filesystem path

### FR-2: Seven read-only tools with a fixed schema

The core SHALL define exactly seven tools, and the handler SHALL serve them. Every tool definition SHALL use only the input types the Lambda target schema supports, and the definitions SHALL change only when the tool set changes.

| Tool | Input | Result fields besides `akiliVersion` |
|---|---|---|
| `list_commands` | — | `commands: [{ name, description, parts }]`, 14 entries sorted by name |
| `get_command` | `name` (string, required), `arguments` (string), `part` (integer, 1-based) | `name, part, parts, skills, text`, plus `usage` on part 1 |
| `list_skills` | — | `skills: [{ name, description, binding, files }]`, sorted by name |
| `get_skill` | `name` (required), `file` (default `SKILL.md`), `part` | `name, file, part, parts, text` |
| `get_template` | `name` (required: `leader`, `implementer`, `reviewer`, `tester`, `model-registry`, `model-routing.section`, `digests`), `part` | `name, path, part, parts, text` |
| `get_file` | `path` (required, a catalog key), `part` | `path, part, parts, text` |
| `search` | `query` (required), `limit` (integer, default 10, at most 20) | `results: [{ path, title, snippet, score }]` |

#### Scenario: Command text rendered

- GIVEN `get_command` with `name: "akili-propose"`, `arguments: "add-remember-me"`
- THEN `text` (all parts joined) is the file's body after the frontmatter block with every `$ARGUMENTS` replaced by `add-remember-me`
- AND with no `arguments`, every `$ARGUMENTS` is replaced by the empty string
- AND for a command whose body has no `$ARGUMENTS` and a non-empty `arguments`, the joined text ends with one appended line `ARGUMENTS: <arguments>`
- AND `skills` lists every packaged skill name the body names, sorted, each once
- AND part 1 carries `usage`: how to follow the text, to fetch each named skill with `get_skill`, the path map (`akili/scripts/…` → `get_file scripts/…`, `akili/templates/…` → `get_template`), and that `akili <cli command>` runs as `npx -y akili-specs <cli command>` and needs Node
- BUT the body must NOT be altered in any other way (parent OQ-3)

#### Scenario: Paging

- GIVEN any text result
- THEN `text` holds at most 30,000 characters, `1 ≤ part ≤ parts`, and joining parts `1..parts` in order reproduces the full text exactly
- AND a part ends at a line break unless a single line is longer than the limit
- AND IT MUST keep every serialized tool result of every catalog file and part at or under 40,000 characters, below Claude Code's 50,000-character file-save threshold (Claude Code MCP docs, *MCP output limits*)
- AND `part` omitted means 1; a `part` outside `1..parts` returns an `invalid_argument` error naming `parts`

#### Scenario: Lists and lookups

- GIVEN the package catalog
- THEN `list_commands` returns 14 entries, with `name` and `description` from each file's frontmatter and `parts` of the rendered body with no arguments
- AND `list_skills` returns one entry per directory under `.claude/skills/`, with `name`, `description` and `metadata.binding` from its `SKILL.md` frontmatter (`null` when absent) and `files` as catalog keys
- AND `get_skill` with an unknown `file` returns `not_found` and lists that skill's files
- AND `get_template` accepts exactly the seven names in the table above, mapped to `templates/<file>`
- AND `get_file` serves any catalog key, the same text the specific tool would return
- AND IT MUST answer an unknown command, skill or template name with `not_found` and the list of valid names

#### Scenario: Search

- GIVEN `search` with `query: "regression test"`
- THEN `results` holds at most `limit` entries, each a catalog key with a `title` (frontmatter `name` or first heading), a `snippet` of at most 200 characters around the first match, and a `score`, sorted by score then key
- AND the same query on the same version always returns the same results
- AND an empty or whitespace query returns `invalid_argument`; `limit` above 20 is clamped to 20
- BUT search must NOT call any external service

#### Scenario: Errors and the version stamp

- GIVEN any tool call, valid or not
- THEN the result is a JSON object carrying `akiliVersion`
- AND an error result carries `error: { code, message }`, with `code` one of `not_found`, `invalid_argument`, `unknown_tool`, `internal`
- AND a wrong argument type, a missing required argument or an unknown argument returns `invalid_argument` naming it
- AND an unknown tool name, or a tool name without the `___` prefix delimiter, returns `unknown_tool`
- BUT the handler must NOT throw for any of these inputs, and must NOT put a stack trace or a filesystem path in a result

### FR-3: The Lambda handler

The handler SHALL take a Gateway Lambda-target event and context, strip the target prefix from `bedrockAgentCoreToolName`, call the core, and return a JSON result.

#### Scenario: Gateway-shaped invocation

- GIVEN an event `{ "name": "akili-propose", "arguments": "x" }` and a context whose `clientContext.custom.bedrockAgentCoreToolName` is `akili___get_command`
- WHEN the handler runs
- THEN it returns the `get_command` result for those inputs
- AND it builds the catalog once per process, not per call
- AND it logs one line per call to stderr/CloudWatch: tool name, part, outcome code, duration, and the Gateway request ID. BUT it must NOT log the event, `arguments`, `query`, or any result text (D-7)
- AND a missing `clientContext` returns `unknown_tool`, not a crash

#### Scenario: Direct smoke invocation

- GIVEN a direct invocation (no Gateway) whose context carries `bedrockAgentCoreToolName: "akili___list_commands"`
- THEN the result is the same `list_commands` JSON, so the deploy smoke test needs no Gateway token

### FR-4: Infrastructure as code (synth only in this spec)

`infra/mcp-gateway/` SHALL hold a CDK app with its own `package.json` that synthesizes the stack below from a package directory and a version given at synth time. The root package SHALL gain no dependency.

#### Scenario: Stack contents

- GIVEN `cdk synth` with a packed `akili-specs` directory and its version
- THEN the template holds:
  - one Lambda function whose code is that directory unchanged, Node 22 runtime, handler `bin/mcp-lambda.handler`, reserved concurrency **5** (D-3), and a published version plus an alias `live`;
  - a log group for it with **14-day** retention (D-7);
  - a Cognito user pool with self sign-up, email as the only sign-in alias and attribute, email verification required, no federation (D-1, D-5), and a managed-login domain;
  - one **public** app client: no secret, authorization-code grant with PKCE, callback `http://localhost:<fixed port>/callback`, `openid` and `email` scopes (D-2);
  - an AgentCore Gateway, `protocolType MCP`, `CUSTOM_JWT` with the user pool's OIDC discovery URL and `allowedClients` = that client;
  - a Lambda target named `akili` on the `live` alias, with the core's seven tool definitions inline;
  - Gateway rate limits of **60 requests/minute per `$.context.jwt.sub`** and **20 requests/second** global (D-3);
  - a monthly cost budget of **$20** filtered to the `project=akili-mcp` cost-allocation tag, with an email alert at **80 %** and, at **100 %**, a notification that triggers the kill switch (D-4);
  - the tag `project=akili-mcp` on every taggable resource, and resource names prefixed `akili-mcp` (R-9)
- AND the owner's alert email and any account-specific value come from synth-time context or environment, never from a committed file
- BUT the template must NOT contain an account ID, a role ARN, a secret, or `authorizerType` `NONE`
- AND IT MUST synthesize a separate spike stage (`stage=spike`) with distinct stack and resource names, so a spike can never touch production names

#### Scenario: Deploy role stack

- GIVEN the same app
- THEN it also synthesizes, as its own stack, the GitHub OIDC deploy role: trusted only for this repository's `aws-mcp` environment (`token.actions.githubusercontent.com:sub`), allowed only to assume the CDK bootstrap roles and to read, invoke and update the alias of the `akili-mcp` function
- BUT it must NOT grant `*` actions or resources outside those, and must NOT be deployed by CI itself

### FR-5: Deploy on every stable release

`.github/workflows/mcp-deploy.yml` SHALL deploy, on every stable release, exactly the npm tarball of that version.

#### Scenario: Stable release deploys

- GIVEN `release: published` for tag `vX.Y.Z` with `prerelease: false`, and the `aws-mcp` environment holding the role ARN variable
- WHEN the job runs
- THEN it waits until `npm view akili-specs@X.Y.Z version` returns `X.Y.Z`, polling for at most 10 minutes
- AND it downloads that tarball and compares its sha512 integrity with `npm view akili-specs@X.Y.Z dist.integrity`
- AND it deploys the unpacked tarball with CDK using OIDC credentials, then invokes the `live` alias with `list_commands`
- AND it passes only when the smoke result has `akiliVersion == "X.Y.Z"` and 14 commands, writing the deployed version to the job summary

#### Scenario: Guards fail red and keep the previous version

- WHEN npm does not show the version within 10 minutes → THEN the job fails before any AWS call
- WHEN the integrity differs → THEN the job fails before any AWS call
- WHEN the smoke version or count is wrong → THEN the job moves `live` back to the version it pointed to before the deploy and fails
- BUT a prerelease, or a tag that is not `vX.Y.Z` (`-next.N` included), must NOT deploy (D-9)
- AND IT MUST skip with a green summary note, never fail, when the role ARN variable is not set, so releases before D-8(ii) stay quiet

#### Scenario: Manual redeploy or rollback

- GIVEN `workflow_dispatch` with `version: X.Y.Z`
- THEN the same guards and steps run for that version
- AND IT MUST reject a version that does not match `^\d+\.\d+\.\d+$`

### FR-6: Abuse and cost controls work as specified

#### Scenario: Limits and kill switch

- GIVEN the production stack
- WHEN one user exceeds 60 requests in a minute → THEN further requests are throttled for that user only
- WHEN the budget reaches 100 % → THEN the kill switch sets the global Gateway rate to 0 and the Lambda reserved concurrency to 0, and emails the owner
- WHEN the owner runs the documented manual kill switch → THEN all tool calls are refused within one minute
- AND the documented reset restores the D-3 values
- BUT these are cost brakes, not guarantees: Gateway limits fail open on transient errors, and AWS Budgets data is delayed. The docs MUST say so

### FR-7: Documentation

#### Scenario: Docs

- GIVEN the change is merged
- THEN a new `docs/mcp.md` gives the Claude Code setup (`claude mcp add --transport http --client-id <id> --callback-port <port> akili <url>`, then `/mcp`), the example request *"run akili-propose add-remember-me"*, the seven tools, the facts that there are no slash commands and that CLI steps need Node, a privacy paragraph (email stored in Cognito; logs kept 14 days without request content), and a client table where every non-Claude-Code row reads `not verified`
- AND `docs/infrastructure.md` gains the resource list, the kill switch and reset runbook, the rollback runbook, the cost-allocation-tag activation step, and the rule that only the owner deploys outside CI
- AND `docs/release-checklist.md` gains "confirm the `MCP Deploy` run for vX.Y.Z is green" after `gh release create`
- AND the README gains one row linking `docs/mcp.md`, and `CHANGELOG.md` `Unreleased` describes the shipped modules
- AND until T7 records the production URL and client ID, `docs/mcp.md` shows placeholders and says the endpoint is not live yet
- BUT no doc may contain the account ID, a role ARN or a secret, and no doc may claim a client works without a cited vendor source or the spike's result

### FR-8: AWS work is owner-gated

#### Scenario: Gated rollout

- GIVEN this spec's tasks
- THEN no task executed by an agent runs an AWS CLI, CDK deploy, `sts` or AWS SDK call against any account
- AND the spike (D-8 i), the deploy role (D-8 ii) and production (D-8 iii) each start only after the owner's explicit OK for that step, recorded in `execution.md` with date and wording
- AND the spike stack is destroyed after its checks, and its outcome is recorded before production starts

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | The root `package.json` gains no `dependencies` or `devDependencies`. Shipped modules use Node built-ins only, valid on Node 18 and 22. CDK dependencies live only in `infra/mcp-gateway/package.json` |
| NFR-2 | Warm tool call ≤ 100 ms of handler time for any non-search call; cold start to first result ≤ 1 s at 256 MB (measured in the spike, T6). Catalog build reads metadata only |
| NFR-3 | The handler writes no file, makes no network call and spawns no process |
| NFR-4 | `npm pack --dry-run` includes `bin/mcp-core.js`, `bin/mcp-lambda.js` and `docs/mcp.md`, and nothing under `infra/`, `scripts/mcp-deploy-guard.js` or `test/` |
| NFR-5 | No shipped file or test cites `docs/specs/changes/methodology-mcp/` (KZ-changes--archify-diagrams-1) |
| NFR-6 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass on the six CI legs; the root `npm test` does not run, and does not fail because of, the infra checks |
| NFR-7 | No account ID, role ARN, secret or personal email in any committed file; checked by a test over tracked files for a 12-digit account-ID pattern in ARN or account context |
| NFR-8 | Cost at the D-3 limits stays within the D-4 budget for one abusive user: 60/min × 43,200 min ≈ 2.6 M calls ≈ $13 of Gateway fees (pricing in proposal §10.5) |
| NFR-9 | Docs English, `cognitive-doc-design` |

### Defect classes and gates

| Defect class | Gate |
|---|---|
| Catalog drift from the tarball | Test comparing catalog keys with `npm pack --dry-run --json` (automated) |
| Path escape or non-catalog read | One test per FR-1 hostile form, with a read spy asserting no file read (automated) |
| Wrong rendering (`$ARGUMENTS`, appended line, frontmatter strip) | Unit tests per FR-2 clause on real command files and fixtures (automated) |
| Paging loss, overlap or oversize | Test over **every** catalog file: parts rejoin byte-exact, each `text` ≤ 30,000, each serialized result ≤ 40,000 (automated) |
| Schema the Gateway rejects (unsupported type, `enum`) | Test that every tool definition uses only the documented types (automated); acceptance by Gateway: **spike (T6)** |
| Gateway result mapping differs from the design (e.g. needs another shape, or drops `isError`) | **No local check.** Spike T6 reads real `tools/call` output; refuted → Pivot |
| Handler crash or leak (stack trace, path, logged arguments) | Fuzz-style table test over bad inputs plus a log-capture test (automated) |
| Claude Code ↔ Gateway ↔ Cognito sign-in fails | **No local check.** Spike T6 run by the owner; refuted → Pivot to the proposal §10.2 fallback |
| Stack misses a control (limits, retention, budget, tags, client shape) or leaks an ID/ARN | `infra` synth assertions per FR-4 clause (automated, CI `infra` job), plus NFR-7 scan |
| Rate limits not supported by the CDK version | T3's first step settles it (construct or custom resource); synth assertion pins the result |
| Workflow guards wrong (npm-wait, integrity, smoke, prerelease, missing role) | Unit tests of `scripts/mcp-deploy-guard.js` with stubbed npm and invoke output (automated); workflow wiring: text-contract test (presence only, see T4); real run: T7 |
| Kill switch does not block, or rejected calls are still billed | **No local check.** T6 measures the manual switch; budget-triggered path and billing are checked at T7 with the owner; accepted risk until then (R-8) |
| Node 18 or Windows differences in core/handler | The six CI legs. Locally only Node 22.12: **gap until CI runs** |
| Docs over-claim (clients, URLs, "live") | Reviewer quote-check against cited sources and the T6 record (KZ-002) |

## 8. Requirement ID Index

| ID | Title | Tasks |
|---|---|---|
| FR-1 | Catalog | T1 |
| FR-2 | Seven tools | T1 (paging, render, lists), T2 (lookups, search, errors) |
| FR-3 | Handler | T2 |
| FR-4 | CDK app | T3 |
| FR-5 | Deploy workflow | T4 (guards, workflow), T7 (real run) |
| FR-6 | Abuse and cost controls | T3 (resources), T5 (runbook), T6 (manual switch), T7 (budget path) |
| FR-7 | Docs | T5 (T7 fills URL and client ID) |
| FR-8 | Owner-gated AWS work | T6, T7 |
| NFR-1..9 | Non-functional | see `tasks.md` coverage |
