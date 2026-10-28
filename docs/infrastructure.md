# Infrastructure: AKILI-SPECS

AKILI-SPECS is an npm package. Its one hosted runtime is the methodology MCP server ([docs/mcp.md](mcp.md)), not live until the owner's first production deploy. This page records the rules for cloud infrastructure the project adds, and the runbooks for that server.

## Rule: AWS target account

All AWS infrastructure for AKILI-SPECS (for example AgentCore Gateway, its Lambda targets, Cognito and S3) deploys to **one** AWS account: the same account that hosts the paolachicue site.

| Aspect | Value |
|---|---|
| AWS CLI profile | `CREDINOVA` (on the maintainer's machine) |
| Region | `us-east-1` |
| Account ID | Resolve it from the profile (`aws sts get-caller-identity --profile CREDINOVA`); it is not written in this public repo |

- Use `--profile CREDINOVA` (or `AWS_PROFILE=CREDINOVA`) for every AWS CLI, CDK and AgentCore command. Never deploy AKILI resources with a default or other profile.
- Agents never create, change or delete AWS resources without the maintainer's explicit OK, and never commit credentials, access keys or role ARNs.
- CI deploys, if added, use a GitHub Actions OIDC role in this account. The paolachicue repo's OIDC deploy (secret `AWS_ROLE_ARN`) was reported broken on 2026-10-25, so verify a working role before relying on CI.

## Only the owner deploys outside CI

- The owner runs every AWS command on this page with `--profile CREDINOVA --region us-east-1`. Agents prepare commands and read pasted output; they never run them.
- The one CI path is the `MCP Deploy` workflow (`.github/workflows/mcp-deploy.yml`). It runs on a stable release, or by hand with a version, and deploys only the `akili-mcp-service` stack.
- The deploy-role stack (`akili-mcp-deploy-role`) is deployed once, by the owner. CI never deploys it.
- Replace `<gateway-url>`, `<client-id>` and `<gateway-id>` below from your own stack outputs or console. None of them is written in this repo.

## MCP server resources

Source: `infra/mcp-gateway/` (CDK, JavaScript). Every number the owner chose lives in `infra/mcp-gateway/config.json`. Prod names shown; the sandbox spike stack uses an `akili-mcp-spike` prefix.

| Resource | Name and settings |
|---|---|
| Stacks | `akili-mcp-service`, `akili-mcp-deploy-role` (spike: `akili-mcp-spike-service`) |
| Lambda | `akili-mcp-content`: `nodejs22.x`, 256 MB, 10 s, reserved concurrency 5, alias `live`; code is the unpacked npm tarball |
| Log groups | `/aws/lambda/akili-mcp-content` and `/aws/lambda/akili-mcp-kill-switch`, kept 14 days |
| Cognito user pool | `akili-mcp-users`: self sign-up, email sign-in, Essentials plan, default Cognito email sender, deletion protection on in prod |
| Cognito domain | Prefix `akili-mcp-<suffix>`, managed login |
| App client | `akili-mcp-client`: no secret, authorization-code grant, callback `http://localhost:33418/callback`, scopes `openid` and `email`, access token 60 min, refresh token 30 days. Sign-in goes only through managed login: `ExplicitAuthFlows` allows token refresh and nothing else |
| Gateway | `akili-mcp`: protocol MCP, `CUSTOM_JWT` against the pool, allowed client = the app client |
| Gateway target | `akili`: the Lambda on the `live` alias, seven tools |
| Rate limits | `akili-mcp-per-user`: 60 per minute per `sub`. `akili-mcp-global`: 20 per second, keyed on the target |
| Kill switch | SNS topic `akili-mcp-budget` triggers Lambda `akili-mcp-kill-switch` |
| Budget | `akili-mcp-monthly`: $20, filtered on the cost-allocation tag `user:project$akili-mcp`. Email at 80 %; email plus kill switch at 100 % |
| Deploy role | `akili-mcp-deploy`: GitHub OIDC, environment `aws-mcp`; may assume the CDK bootstrap roles, and invoke, read and repoint the `live` alias of `akili-mcp-content*` |
| Tags | `project=akili-mcp`, `stage=prod` (or `spike`) |

Stack outputs give the gateway URL, the client ID and the Cognito domain. Only the first two ever go into `docs/mcp.md`.

## Cost brakes and how fast they react

| Brake | Reaction |
|---|---|
| Per-user and global rate limits | Immediate, and fail open on transient errors |
| Lambda reserved concurrency 5 | Immediate cap on parallel runs |
| Budget at 100 % | Kill switch plus email. AWS documents Budgets data as "updated up to three times a day. Updates typically occur 8–12 hours after the previous update", so this brake reacts in hours, not minutes |

Bounds at the configured limits, at the Gateway price of $0.005 per 1,000 invocations (AgentCore pricing page, read 2026-10-27):

| Case | Bound |
|---|---|
| One user at 60 per minute, all month | about 2.6 million calls, about $13 |
| Everyone together at 20 per second, all month | about 51.8 million calls, about $259, or about $8.6 a day |

Whether Gateway bills rate-limited or unauthenticated calls is not confirmed. A cost brake, not a guarantee.

Cognito's default email sender allows 50 email messages a day per AWS account and "resets daily at 0900 UTC" (Cognito quotas page). It is shared with every other pool in the account on the default sender. Amazon SES is the later fix.

## Runbook: manual kill switch

Use it when you see abuse or a cost spike and do not want to wait for the budget. Two independent brakes; run both.

```bash
aws lambda put-function-concurrency --function-name akili-mcp-content \
  --reserved-concurrent-executions 0 --profile CREDINOVA --region us-east-1

aws bedrock-agentcore-control update-gateway-rate-limit \
  --gateway-identifier <gateway-id> --rate-limit-id akili-mcp-global \
  --entries '[{"dimensions":{"targetName":"akili"},"requests":[{"period":"second","rate":0}]}]' \
  --profile CREDINOVA --region us-east-1
```

Shortcut: invoke the same function the budget triggers, which sets both.

```bash
aws lambda invoke --function-name akili-mcp-kill-switch \
  --profile CREDINOVA --region us-east-1 /dev/null
```

The goal is that all tool calls are refused within one minute. That time is measured in the sandbox spike, not yet. Find `<gateway-id>` (the gateway named `akili-mcp`) in the output of:

```bash
aws bedrock-agentcore-control list-gateways --profile CREDINOVA --region us-east-1
```

## Runbook: reset after the kill switch

Restore the values in `infra/mcp-gateway/config.json` (reserved concurrency 5, global rate 20 per second). Do it only once you know why it tripped.

```bash
aws lambda put-function-concurrency --function-name akili-mcp-content \
  --reserved-concurrent-executions 5 --profile CREDINOVA --region us-east-1

aws bedrock-agentcore-control update-gateway-rate-limit \
  --gateway-identifier <gateway-id> --rate-limit-id akili-mcp-global \
  --entries '[{"dimensions":{"targetName":"akili"},"requests":[{"period":"second","rate":20}]}]' \
  --profile CREDINOVA --region us-east-1
```

Then call `list_commands` once through your MCP client to confirm the server answers.

## Runbook: roll back the live alias

The `MCP Deploy` workflow already moves `live` back to the previous version when its smoke check fails. To roll back by hand:

Preferred, through the same guards as a normal deploy: run the workflow with an older version.

```bash
gh workflow run "MCP Deploy" -f version=<X.Y.Z>
```

Emergency, directly on the alias:

```bash
aws lambda list-versions-by-function --function-name akili-mcp-content \
  --profile CREDINOVA --region us-east-1
aws lambda update-alias --function-name akili-mcp-content --name live \
  --function-version <N> --profile CREDINOVA --region us-east-1
```

Full removal is `cdk destroy`, by the owner only, from `infra/mcp-gateway/`. The synth inputs are the same as a deploy's (`AKILI_MCP_ALERT_EMAIL` in the environment, the `packageDir` and `version` context for any one published version). The deploy-role stack is a separate, later destroy.

```bash
npx cdk destroy akili-mcp-service --profile CREDINOVA --region us-east-1 \
  -c packageDir=<unpacked-tarball-dir> -c version=<X.Y.Z> -c stage=prod
npx cdk destroy akili-mcp-deploy-role --profile CREDINOVA --region us-east-1 \
  -c packageDir=<unpacked-tarball-dir> -c version=<X.Y.Z> -c stage=prod
```

In prod the Cognito user pool has a retain removal policy and deletion protection, so removing it is a separate, deliberate step.

## Cost-allocation tag activation

The budget filters on `user:project$akili-mcp`. AWS documents that "User-defined tag keys must use the `user:` prefix" (Budgets filters page). Activate the `project` tag as a cost-allocation tag, once, in the account that hosts the stack.

AWS documents the timing: "After you create and apply user-defined tags to your resources, it can take up to 24 hours for the tag keys to appear on your cost allocation tags page for activation." and "It can then take up to 24 hours for tag keys to activate." (Billing user guide, *Activating user-defined cost allocation tags*). So the order is: deploy, wait for the `project` key to appear, activate. Until the key is active, the budget may not see the stack's cost, which can last up to about 48 hours after the first deploy.

```bash
aws ce update-cost-allocation-tags-status \
  --cost-allocation-tags-status TagKey=project,Status=Active \
  --profile CREDINOVA --region us-east-1
```

Or in the console: Billing and Cost Management, Cost allocation tags, User-defined cost allocation tags, select `project`, Activate.
