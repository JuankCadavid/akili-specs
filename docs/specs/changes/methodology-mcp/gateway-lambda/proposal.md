# Proposal: Remote AKILI MCP on AgentCore Gateway + Lambda

**Recommendation:** one AgentCore Gateway (`protocolType MCP`, `CUSTOM_JWT` inbound), backed by one Node Lambda target that serves seven read-only tools over the methodology content. The Lambda bundle **is the published npm tarball**: a GitHub Actions job on `release: published` downloads `akili-specs@<version>` from npm, verifies its integrity, and deploys it with CDK through an OIDC role in the account named by `docs/infrastructure.md`. Every tool response carries `akiliVersion`.

- **Setup:** a user adds the server once with `claude mcp add --transport http …`, signs in through the browser, and then asks Claude to run any AKILI command. Claude finds the tools through Claude Code's tool search and follows the command text that `get_command` returns.
- **Cost:** with no WAF, estimated **under $2/month** up to about 1,000 active users. Worst-case abuse is capped by Gateway rate limits plus a budget kill switch.
- **Slash commands:** none. A Lambda target exposes MCP tools only, never prompts (parent §10.2).

**Five decisions are Juan Carlos's, in §12:**

1. who may connect;
2. how clients register;
3. the rate limits;
4. the budget cap and kill switch;
5. the go-ahead to create AWS resources: first a sandbox spike, then production.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/methodology-mcp/gateway-lambda` |
| Parent Spec | `changes/methodology-mcp` (`family.md` row 1, **Must**, `active`) |
| Type | **Change** |
| Deliverable | `software` (Lambda handler + content core in the npm package; CDK app and deploy workflow in the repo) |
| Approval Mode | `gated` for the final spec approval. Owner mandate, 2026-10-27 7:05 PM: *"Answer process gates yourself with the recommended option. Rules: local commits only, NO push, NO AWS commands of any kind (no deploy, no sts, nothing), never write the AWS account ID or role ARNs into the repo, docs in English."* Routine process gates are logged as `auto-approved (owner mandate)` |
| Requirement source | Owner direction of 2026-10-27, quoted in the parent proposal's amendment; parent §10.2–§10.6 evidence. No Jira, no Figma |
| Target AWS account | As set by `docs/infrastructure.md` → *Rule: AWS target account* (profile and region there; the account ID is never written in this public repo) |
| Depends on | none. This chunk owns the shared content core (`family.md`, *Why row 1 stands alone*) |
| Parallel-safe | no |
| Release | minor (new shipped modules), plus the first AWS rollout after an explicit owner OK |
| Evidence | AWS docs via the `aws-mcp` documentation tools, and Claude Code docs at `code.claude.com/docs/en/mcp`, both read 2026-10-27; repo citations at `5b6c4f3` |
| Date | 2026-10-27 |
| Status | **Approved** by Juan Carlos, 2026-10-27 7:05 PM, with **all recommended defaults for D-0..D-9** (§12, *Decision record*) |

## 2. Intent

Anyone with Claude Code, and later other MCP clients, can use every AKILI command and skill by adding one remote MCP server, with nothing installed. The content they get always equals the latest npm release, with no manual deploy.

## 3. Problem / Current Behavior

Citations run at `5b6c4f3`.

| # | Claim | Evidence |
|---|---|---|
| 1 | The methodology reaches a tool only through `akili install`; there is no hosted channel | parent §3 #1–#2; `docs/infrastructure.md` (*"no hosted runtime today"*) |
| 2 | Releases publish to npm by hand, then `gh release create` fires `release: published`, which an existing workflow already listens to | `AGENTS.md` *Release Rules* step 4 (publish, then `gh release create`); `.github/workflows/release-notify.yml:6-8` |
| 3 | The content is 14 commands (largest `akili-constitution.md`, 122,411 chars), 29 skills in 244 files, 7 templates (`digests.json` 453 KB). The tarball is 2.7 MB packed, 5.7 MB unpacked | parent §3 #6; `npm pack --dry-run` → *package size 2.7 MB, unpacked size 5.7 MB, total files 342* |
| 4 | Command text calls the `akili` CLI in places: `akili-constitution.md` 21 hits, `akili-audit.md` 3, `akili-execute.md`, `akili-marketing.md`, `akili-security.md` 1 each | `grep -c "akili routing\|akili doctor\|npx akili\|akili install" .claude/commands/*.md` |
| 5 | The account's GitHub Actions OIDC deploy is reported broken | `docs/infrastructure.md` (owner report); `UNVERIFIED — confirm at source before relying on it` |
| 6 | A release was twice made public before its npm publish finished | owner's release memory (v2.29.0, v2.30.0); `UNVERIFIED — confirm at source before relying on it` against the GitHub release history |

## 4. Proposed Outcome

| Who | After this chunk |
|---|---|
| Claude Code user | Runs `claude mcp add --transport http --client-id <public id> --callback-port <port> akili <gateway-url>` once (§10.3), then `/mcp` to sign in. After that, *"run akili-propose add-remember-me"* makes Claude call `get_command` and follow the methodology |
| Maintainer | Publishes to npm and runs `gh release create` as today. The deploy job updates the Lambda to the same version and fails loudly if it can't |
| Owner (cost) | A monthly AWS bill bounded by rate limits and a budget kill switch |

## 5. Scope

**Delivers:**

1. **Content core** in the npm package (shared with `local-stdio` later):
   - a catalog of shipped files;
   - frontmatter parsing;
   - `$ARGUMENTS` rendering;
   - an exact-key path guard;
   - paging;
   - a keyword search index.

   Pure Node, zero dependencies, which keeps parent NFR-1.
2. **Lambda handler** in the npm package (e.g. `bin/mcp-lambda.js`). It is shipped so that the deployed bundle is the tarball byte for byte (DD-c, §11).
3. **Tool surface** (§10.1): seven read-only tools with a fixed schema.
4. **CDK app** in the repo, not shipped (e.g. `infra/mcp-gateway/`, with its own `package.json` so the package keeps zero dependencies). It holds:
   - the Gateway, the Lambda and its alias, and reserved concurrency;
   - the Cognito user pool, the app client and the managed-login domain;
   - Gateway rate limits;
   - CloudWatch log retention;
   - an AWS Budgets alarm and kill switch;
   - tags `project=akili-mcp`.
5. **Deploy workflow** `.github/workflows/mcp-deploy.yml` (§10.4), and the OIDC deploy role it needs (created once, with the owner's OK).
6. **Docs:**
   - user setup for Claude Code, with other clients `not verified` until checked;
   - `docs/infrastructure.md` additions (resources, kill switch, rollback);
   - a `docs/release-checklist.md` step "confirm the MCP deploy job is green";
   - a CHANGELOG entry.
7. **A sandbox spike first** (§10.3), proving the Claude Code ↔ Gateway ↔ Cognito sign-in end to end before production. It needs the owner's OK to create resources.

**Leaves out:**

- MCP prompts and resources: they would need an MCP-server target on Runtime (parent §11.3).
- Write tools, and project-aware tools (the Lambda can't see the user's repo).
- Rewriting command text.
- Deploying prereleases (`next`), unless D-9 says otherwise.
- `local-stdio` (held).

## 6. Non-Goals

- No Bedrock model calls (parent §10.1).
- No paid tier or per-user content. The content is MIT and public on npm/GitHub; auth exists for abuse and cost control, not secrecy.
- No AWS commands, and no resource creation, in this proposal or in `/akili-specify`.
- No change to the npm release steps beyond a checklist line.

## 7. Affected Users, Systems, And Specs

| Area | Effect |
|---|---|
| npm package `bin/` | New content core + Lambda handler (shipped; tested by `npm test` on the six CI legs) |
| `infra/mcp-gateway/` (new, not shipped) | CDK app; `package.json` `files` already excludes it (the `files` whitelist, parent P-3) |
| `.github/workflows/mcp-deploy.yml` (new) | Runs on `release: published` (non-prerelease) and `workflow_dispatch(version)` |
| AWS account (`docs/infrastructure.md`) | The resources in §5 item 4 and one OIDC deploy role |
| Docs | `docs/cli.md` or a new `docs/mcp.md` (design decides), `docs/infrastructure.md`, `docs/release-checklist.md`, README one row, CHANGELOG |
| Specs | `local-stdio` later reuses the core (its Adjust round, `family.md`) |

## 8. Visual Reference

- Source: None
- Location: n/a
- Notes: backend/infrastructure. The only UI is Cognito's managed login page, used as AWS ships it.

## 9. Requirement Delta Preview

### ADDED Requirements

- A remote MCP endpoint lists exactly the §10.1 tools. Each tool result carries `akiliVersion` equal to the npm version the Lambda was built from.
- `get_command(name, arguments?, part?)` returns the command text with `$ARGUMENTS` rendered, in parts of at most 32,000 characters, each part saying *n of m*.
- Unauthenticated requests are rejected, and the 401 points to the Gateway's protected-resource metadata, so Claude Code can start sign-in.
- On every non-prerelease `release: published`, the deploy job:
  1. waits for `npm view akili-specs@<v>`, up to a bound;
  2. verifies the tarball integrity against the registry;
  3. deploys exactly that tarball;
  4. smoke-tests the deployed version;
  5. fails red on any mismatch.
- Per-user and global rate limits, and a budget kill switch, are in force from the first deploy.

### MODIFIED Requirements

- `docs/release-checklist.md` gains "MCP deploy green for vX.Y.Z" after `gh release create`.

### REMOVED Requirements

- None.

## 10. Approach

### 10.1 Tool surface (Lambda target, fixed schema)

Gateway prefixes tools with the target name (`akili___get_command`; parent R5/R7). In Claude Code the full name is `mcp__akili__akili___get_command`, well under its 128-character tool-name limit (Claude Code MCP docs).

| Tool | Input | Returns |
|---|---|---|
| `list_commands` | — | `[{ name, description, parts }]` for the 14 commands |
| `get_command` | `name`, `arguments?` (string), `part?` (1-based) | The command body after the frontmatter, `$ARGUMENTS` rendered, one part. Also: the skills the text names, and a *how to use* header (below) |
| `list_skills` | — | `[{ name, description, binding, files: [paths] }]` |
| `get_skill` | `name`, `file?` (default `SKILL.md`), `part?` | One skill file |
| `get_template` | `name` (`leader`, `implementer`, `reviewer`, `tester`, `model-registry`, `model-routing.section`, `digests`), `part?` | One template |
| `get_file` | `path` (a catalog path such as `scripts/parse_tests.js`), `part?` | Any other shipped file. The fallback for paths that command text names |
| `search` | `query`, `limit?` (≤ 20) | `[{ path, title, snippet, score }]` over names, descriptions, headings and body text |

**Contract shared by all seven tools:**

- Every result is JSON `{ akiliVersion, …, part, parts, text? }`. Errors use `isError` (parent R5).
- Paths are exact catalog keys, never joined onto the filesystem (the `local-stdio` DD-5 rule, moved into the core).
- **Paging** keeps each result under Claude Code's limits. Claude Code warns above 10,000 tokens, caps at 25,000 by default, and saves text results over 50,000 characters to a file (Claude Code MCP docs, *MCP output limits*). A 32,000-character part stays clear of all three. `akili-constitution.md` takes 4 parts, and `digests.json` about 15.
- A server can raise a tool's limit with `_meta["anthropic/maxResultSizeChars"]`, up to 500,000 (Claude Code MCP docs). Whether a Gateway Lambda target's tool schema passes `_meta` through to clients is `UNVERIFIED — confirm at source before relying on it`, so paging does not depend on it.

**How a Claude Code user runs a command:**

1. The user types a request in plain words.
2. Claude Code's tool search loads matching tools on demand. It is on by default and matches against the tool description, up to 16,384 characters for a deferred tool (Claude Code MCP docs, *Scale with MCP tool search*).
3. Claude calls `get_command` and follows the text.

The descriptions of `list_commands` and `get_command` start with the trigger words: *"AKILI-SPECS methodology commands (akili-propose, akili-specify, …). When the user asks to run an AKILI command or phase, call get_command and follow the returned instructions exactly; fetch every skill they name with get_skill."*

The `get_command` header also maps install-layout paths for the agent:

| Path in command text | Read it with |
|---|---|
| `akili/scripts/…`, `akili/templates/…` | `get_file` / `get_template` |
| a skill named by the command | `get_skill` |
| `akili <cli command>` | run `npx -y akili-specs <cli command>` (needs Node; §3 #4) |

Gateway's own server `instructions` are not under our control for a Lambda target (`UNVERIFIED — confirm at source before relying on it`), so the tool descriptions carry this guidance.

### 10.2 Inbound auth: what is verified, what is not

| Step | Status | Evidence |
|---|---|---|
| A Gateway with `CUSTOM_JWT` answers an unauthenticated MCP request with HTTP 401 and `www-authenticate: Bearer resource_metadata=".../.well-known/oauth-protected-resource"`. That metadata names the IdP's discovery URL | Documented | [AWS blog: secure auth code flow with AgentCore Gateway and MCP clients](https://aws.amazon.com/blogs/machine-learning/building-a-secure-auth-code-flow-setup-using-agentcore-gateway-with-mcp-clients/), §2.4 and *inbound authorization code flow* steps 2–3 |
| The Gateway validates tokens however they were obtained (signature, `exp`, `iss`, audience, `allowedClients`/`allowedScopes`, custom claims) | Documented | same blog §2.3; [CustomJWTAuthorizerConfiguration](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-bedrock-agentcore-control-2023-06-05.html) |
| Claude Code checks RFC 9728 protected-resource metadata first, then RFC 8414. It supports DCR, CIMD, or a pre-registered `--client-id` (`--client-secret` optional) with `--callback-port`, and `claude mcp login <name>` | Documented | [Claude Code MCP docs](https://code.claude.com/docs/en/mcp), *Authenticate with remote MCP servers* |
| Cognito user pools support **dynamic client registration**: open registration (no initial token), or authenticated. Available on the Essentials and Plus plans. AWS advises attaching WAF with a rate-based rule for open registration | Documented | [Cognito: Dynamic client registration](https://docs.aws.amazon.com/help-panel/cognito/latest/console/hp-dynamic-client-registration.html) |
| **End to end: Claude Code ↔ Gateway PRM ↔ Cognito (OIDC discovery, PKCE, refresh) with no proxy** | `UNVERIFIED — confirm at source before relying on it` | The AWS blog's tested client (Kiro) used the `mcp-remote` proxy *"to bridge the gap of spec standardization"*. Open points: does Claude Code accept a Cognito `openid-configuration` as the authorization server; does Cognito tolerate the RFC 8707 `resource` parameter; does token refresh work. **The sandbox spike (§5 item 7) settles this before any production resource is created** |

**Design consequence for D-2:**

| Registration | User's setup | How the Gateway accepts tokens |
|---|---|---|
| Pre-registered **public** app client (no secret, PKCE, `http://localhost:<port>/callback`) | `--client-id` and `--callback-port` | `allowedClients = [id]` |
| Cognito open DCR | Zero-config setup (`claude mcp add --transport http akili <url>`) | `allowedScopes` (a custom resource-server scope such as `akili/read`), because each registered client has its own ID. Needs WAF |

**Fallback if the spike fails:** document the `mcp-remote` proxy route (it needs Node via `npx`, which weakens "nothing installed"), or move to an IdP the spike proves.

### 10.3 Client setup (Claude Code)

The spike confirms the exact form; D-2 picks the variant.

1. `claude mcp add --transport http --client-id <public-client-id> --callback-port <port> akili https://<gateway-id>.gateway.bedrock-agentcore.<region>.amazonaws.com/mcp`. The URL shape is `UNVERIFIED — confirm at source before relying on it`; the spike reads the real one. The client ID is public and is not a secret.
2. `/mcp` → *Authenticate* → browser → Cognito managed login (sign up or sign in, per D-1) → back to Claude Code.
3. Ask *"list the AKILI commands"* → `list_commands`.

**Other clients** (Cursor, Codex CLI, OpenCode, Antigravity, Grok Bot) are listed `not verified` until checked at the vendor's docs.

### 10.4 Auto-sync on every release

`.github/workflows/mcp-deploy.yml`:

| Step | Detail |
|---|---|
| Trigger | `release: published` with `!github.event.release.prerelease`, and `workflow_dispatch` with a `version` input (redeploy or rollback). GitHub environment `aws-mcp`, with deployment protection limited to `v*` tags |
| Wait for npm | Loop on `npm view akili-specs@<v> version` until it matches, bounded at about 10 minutes, then fail red. This guards the "release flipped before publish" case (§3 #6) |
| Fetch and verify | `npm pack akili-specs@<v>`, then compare the tarball's sha512 with `npm view akili-specs@<v> dist.integrity`. A mismatch fails red |
| Build | Unpack. The Lambda asset is the unpacked package as published, so handler and content come from npm, not from the checkout. Only the CDK app comes from the tagged checkout |
| Credentials | `aws-actions/configure-aws-credentials` with OIDC. The role trust is limited to `token.actions.githubusercontent.com:sub` = this repo's `aws-mcp` environment ([IAM: role for GitHub OIDC](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html)). The role ARN is a GitHub environment variable, never committed (`docs/infrastructure.md`) |
| Deploy | `cdk deploy` of the stack with `version=<v>`: publish a new Lambda version and move the `live` alias the Gateway target points to. The tool schema is fixed, so the target only changes when the tool set changes (parent R5) |
| Smoke | Invoke the Lambda alias directly (IAM) with `list_commands` and check `akiliVersion == <v>` and 14 commands. A red smoke moves the alias back to the previous version and fails the job |
| Report | Write the deployed version to the job summary. `release:status` can later read the last green run (design decides) |

Prerequisite: a working OIDC deploy role in the target account (§3 #5; risk R-6).

### 10.5 Cost (monthly, estimate)

Gateway figures are from [AgentCore pricing](https://aws.amazon.com/bedrock/agentcore/pricing/), read 2026-10-27: $0.005 per 1,000 invocations, list calls included. All other figures are `UNVERIFIED — confirm at source before relying on it` (general AWS list prices, not fetched in this run).

| Scenario | Calls/month | Gateway | Lambda (256 MB, ~150 ms) | Cognito (Essentials) | Logs, S3, budgets | WAF (only with open DCR / sign-up, D-2) | Total |
|---|---|---|---|---|---|---|---|
| 10 users | 2k | $0.01 | free tier | free tier | < $0.50 | ($5–8) | **< $1** (≈ $7 with WAF) |
| 100 users | 20k | $0.10 | free tier | free tier | < $0.50 | ($5–8) | **< $1** (≈ $7) |
| 1,000 users | 300k | $1.50 | ≈ $0 | free tier | ≈ $1 | ($5–8) | **≈ $2–3** (≈ $9) |
| Abuse at the default service ceiling (200 TPS, parent R11) | ~518M | ~$2,600 | capped by reserved concurrency | — | — | — | **why D-3/D-4 exist** |

**Abuse and cost controls:**

| Layer | Control |
|---|---|
| Per user | A Gateway rate limit keyed on `$.context.jwt.sub` (e.g. 60 requests/minute) |
| Global | A wildcard limit (e.g. 20 requests/second) |
| Emergency | Setting `rate=0` blocks a user or everyone. Changes propagate in about 30 s ([AgentCore release notes: configurable rate limits](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/release-notes.html)). Limits **fail open** on transient errors, so they are a cost brake, not a guarantee |
| Lambda | Reserved concurrency (e.g. 5), so concurrent compute stays bounded |
| Budget | An AWS Budgets alarm at the D-4 cap → SNS → a small Lambda sets the global rate to 0 (kill switch), and emails the owner |
| Sign-up | Email verification; WAF rate rule on the Cognito endpoints if registration is open |
| Logs | 14-day retention, no request bodies |

**Accounts:** none new. Everything lands in the `docs/infrastructure.md` account, tagged. Whether CDK is bootstrapped in that account and region is `UNVERIFIED — confirm at source before relying on it`; the paolachicue CDK stacks suggest it.

## 11. Recommended Approach

**DD-a — Stand alone, owning the content core** (`family.md`). The Must chunk is not blocked on an unapproved spec.

**DD-b — Seven tools with a fixed schema and paging.** That is the user's suggested set plus `get_file`, which covers helper scripts and any path command text names. A fixed schema means a release never needs a Gateway target update.

**DD-c — The Lambda bundle is the published tarball, handler included.** It is the only design where "the Lambda equals npm" holds by construction and is checked by integrity, rather than rebuilt from a checkout that could differ.

**DD-d — `CUSTOM_JWT` + Cognito user sign-in (auth code + PKCE), pending the spike.** `NONE` inbound is documented for development and testing only (parent R10), and an open billable endpoint is the abuse case.

**DD-e — Spike before production, both gated.** One sandbox gateway proves §10.2's open row. It is deleted after, and needs the owner's OK.

**Proposed task outline for `/akili-specify`:**

| Task | Content |
|---|---|
| T1 | Content core + paging + search (unit-tested) |
| T2 | Lambda handler (unit-tested with a Gateway-shaped event and context, parent R7) |
| T3 | CDK app, `cdk synth` only and snapshot-tested, no deploy |
| T4 | Deploy workflow, with the npm-wait and integrity guards tested via a dry-run mode |
| T5 | Docs and checklist |
| T6 | **HITL:** spike, then production rollout, run by or with the owner's OK |

## 12. Risks, Dependencies, And Decisions

### Decisions only Juan Carlos can make

| # | Decision | Options | Recommended default |
|---|---|---|---|
| D-0 | Family structure | (a) `gateway-lambda` stands alone and owns the core; `local-stdio` reuses it later · (b) `local-stdio` stays the core and `gateway-lambda` depends on it (blocked behind its approval) | **(a)** |
| D-1 | **Who may connect** | **Open:** self sign-up with email verification · **Sign-up + approval:** self sign-up, an admin confirms each user · **Invite-only:** admin creates users. (`NONE` inbound is not offered: documented for dev/test only) | **Open self sign-up**: the content is already public (MIT, npm); auth only buys abuse control |
| D-2 | **Client registration** | Pre-registered public client (users pass `--client-id`, `--callback-port`; no WAF) · Cognito open DCR (zero-config `claude mcp add`; WAF ≈ $5–8/month) | **Pre-registered public client** for v1; DCR once the spike proves it |
| D-3 | **Rate limits** | Per user (requests/minute), global (requests/second), Lambda reserved concurrency | 60/min per user · 20/s global · concurrency 5 |
| D-4 | **Budget cap and kill switch** | Monthly USD alarm; auto-block (rate 0) at the cap, or alarm-only | **$20/month alarm at 80 %, auto-block at 100 %** |
| D-5 | Sign-in methods | Email + password only · plus Google/GitHub federation | Email only for v1 |
| D-6 | Public name | Gateway default URL · a custom domain (Gateway support `UNVERIFIED`) | Default URL for v1 |
| D-7 | Privacy | Store emails (needs a short privacy note on the docs page) · log retention days | Emails in Cognito only; logs 14 days without bodies; one privacy paragraph in the docs |
| D-8 | **Go-ahead to create AWS resources** | (i) sandbox spike; (ii) the OIDC deploy role (fixing or replacing the reported-broken one); (iii) production stack | Each a separate explicit OK, in that order |
| D-9 | Prereleases (`next`) | Not deployed · a separate `next` gateway | Not deployed |

### Decision record (owner, 2026-10-27 7:05 PM)

Juan Carlos approved this proposal with every recommended default above:

| # | Decided |
|---|---|
| D-0 | (a) `gateway-lambda` stands alone and owns the content core |
| D-1 | Open self sign-up with email verification |
| D-2 | Pre-registered public client ID for v1 (no WAF); DCR only after the spike proves it, by a later decision |
| D-3 | 60 requests/minute per user · 20 requests/second global · Lambda reserved concurrency 5 |
| D-4 | $20/month budget: alarm at 80 %, automatic block (global rate 0) at 100 % |
| D-5 | Email + password only |
| D-6 | Gateway default URL |
| D-7 | Emails in Cognito only; logs 14 days without request bodies; one privacy paragraph in the docs |
| D-8 | Separate explicit OKs, in order: (i) sandbox spike → (ii) OIDC deploy role → (iii) production stack |
| D-9 | Prereleases are not deployed |

### Risks

| # | Risk | Mitigation |
|---|---|---|
| R-1 | Claude Code ↔ Cognito sign-in does not work without a proxy (§10.2 open row) | Spike first (DD-e); fallbacks documented in §10.2 |
| R-2 | No slash commands: users must ask in words, and tool search must find the tools | Trigger words at the start of the descriptions (§10.1); a README line with the example phrase; the Runtime route (parent §11.3) if prompts become required |
| R-3 | Skills no longer auto-trigger; the agent reads only what the command names (parent R-1) | The `get_command` header lists the named skills and tells the agent to fetch them |
| R-4 | Commands that run the `akili` CLI (`akili-constitution` Step 8C `akili routing`, `doctor --agents`; §3 #4) still need Node | The header maps them to `npx -y akili-specs …`; docs say plainly that those steps need Node. Everything else is content only |
| R-5 | Large results are truncated or saved to file by the client | 32,000-character paging (§10.1) |
| R-6 | The OIDC deploy role in the target account is reported broken (§3 #5) | D-8(ii): a new role limited to this repo's `aws-mcp` environment; until then, deploys are manual with the `docs/infrastructure.md` profile, by the owner, never by an agent |
| R-7 | Deploying a version before npm has it, or a tarball other than npm's | npm-wait loop + integrity check + version smoke (§10.4) |
| R-8 | Cost runaway from abuse or a bug loop | Rate limits (fail open), reserved concurrency, budget kill switch (§10.5) |
| R-9 | The shared account also hosts the paolachicue site, so a mistake can touch the wrong stack | A separate CDK stack name, tags, a deploy role scoped to `akili-mcp*` resources (least privilege) |
| R-10 | Secrets: none are needed client-side (public client + PKCE). The role ARN and any Cognito IDs live in GitHub environment variables and stack outputs, never committed | `docs/infrastructure.md` rule; a review check |
| R-11 | A public sign-up page collects emails (personal data) | D-7 privacy note; minimal attributes |
| R-12 | Lambda payload limits | Largest part 32,000 chars ≪ the 6 MB Gateway payload quota (parent R11) |
| R-13 | Test budget under-estimated (handler + workflow guards) | Budget test LOC per scenario clause: **KZ-bugfix--init-ctrlc-abort-2** |
| R-14 | Tests reading the active spec folder | Fixtures under `test/fixtures/`: **KZ-changes--archify-diagrams-1** |

### Open questions for `/akili-specify` (design-level, not owner decisions)

- Docs home: a `docs/cli.md` section or a new `docs/mcp.md`.
- Whether `release:status` reads the last green `mcp-deploy` run.
- CDK construct availability for Gateway rate limits; if missing, a custom resource. The `aws-cdk-lib` `aws_bedrockagentcore` `Gateway`/`GatewayTarget.forLambda` constructs exist ([CDK reference: GatewayTarget](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_bedrockagentcore.GatewayTarget.html)); rate-limit constructs are `UNVERIFIED — confirm at source before relying on it`.
- The exact Lambda response shape that Gateway maps to tool `content`. The examples return `{ statusCode, body }` ([CDK GatewayTarget example](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_bedrockagentcore.GatewayTarget.html)); the mapping is `UNVERIFIED — confirm at source before relying on it` and is settled in the spike.

## 13. Success Criteria

- In a fresh Claude Code with nothing AKILI installed, a user who adds the server and signs in can run every one of the 14 commands end to end through the tools, including multi-part `akili-constitution`.
- After `gh release create vX.Y.Z`, the deploy job goes green, and `list_commands` reports `akiliVersion: X.Y.Z` within 30 minutes. A tampered or missing npm version turns the job red and leaves the previous version live.
- An unauthenticated request gets 401 with the protected-resource metadata header.
- A user above the per-user limit is throttled, and the kill switch blocks all traffic within a minute of being set.
- No secret, account ID or role ARN is committed. `npm test` passes on the six CI legs, and the package still has zero runtime dependencies.

## 14. Next Step

On approval, with D-0..D-9 answered or at their defaults:

```text
/akili-specify changes/methodology-mcp/gateway-lambda
```

No AWS resource is created until D-8's separate OKs.
