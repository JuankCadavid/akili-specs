# Infrastructure: AKILI-SPECS

AKILI-SPECS is an npm package with no hosted runtime today. This page records the rules for any cloud infrastructure the project adds, starting with the methodology MCP server (`docs/specs/changes/methodology-mcp/`).

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
