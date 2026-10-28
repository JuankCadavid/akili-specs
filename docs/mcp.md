# AKILI MCP server

Use the AKILI-SPECS commands, skills and templates from any MCP client that can sign in to a remote server, without installing anything. The server is read-only: it hands your assistant the text of a command, and the assistant follows it.

> **Not live yet.** No production endpoint exists today. `<gateway-url>` and `<client-id>` below are placeholders: this page gets the real values only after the owner's first production deploy. Until then, install AKILI the normal way ([README](../README.md)).

## Quick path

1. Add the server to Claude Code, replacing the two placeholders:

   ```bash
   claude mcp add --transport http --client-id <client-id> --callback-port 33418 akili <gateway-url>
   ```

2. Run `/mcp` in Claude Code, choose `akili` and sign in or sign up in your browser.
3. Ask for a command in plain words, for example: *"run akili-propose add-remember-me"*.

The callback port is fixed because the sign-in app accepts exactly one redirect, `http://localhost:33418/callback`.

## What the server gives you

Seven read-only tools. Your assistant calls them; you do not.

| Tool | Returns |
|---|---|
| `list_commands` | The 14 AKILI commands, with descriptions |
| `get_command` | One command's text, with your arguments filled in |
| `list_skills` | The packaged skills, with their binding level and files |
| `get_skill` | A skill's `SKILL.md`, or one of its other files |
| `get_template` | A persona or routing template (leader, implementer, reviewer, tester, model-registry, model-routing.section, digests) |
| `get_file` | Any other shipped file, by the path the other tools return |
| `search` | Words searched across commands, skills and templates |

Long text arrives in parts of at most 30,000 characters. Every result carries the AKILI version it came from, which, once the server is live, is the version deployed by the last stable release.

## Limits to know

| Limit | What it means |
|---|---|
| No slash commands | `/akili-propose` does not exist here. You ask in words, and the assistant calls `get_command` |
| CLI steps need Node | When a command says `akili <cli command>`, it runs on your machine as `npx -y akili-specs <cli command>`, so Node must be installed |
| Rate limits | 60 requests per minute per user, 20 requests per second across everyone |
| Cost brake, not a guarantee | See [Cost brakes](#cost-brakes) |
| Sign-up email cap | See [Sign-up email limit](#sign-up-email-limit) |

## Cost brakes

The owner runs this server on a $20 monthly budget. Three things hold the cost down: the rate limits above, a cap of 5 concurrent runs of the server function, and a budget alarm that switches the server off at 100 % of the budget and emails the owner.

These are cost brakes, not guarantees:

- The Gateway rate limits fail open on transient errors, so a limit can let calls through during a fault.
- AWS Budgets data is delayed. AWS documents it this way: "AWS Budgets information is updated up to three times a day. Updates typically occur 8–12 hours after the previous update." The budget switch therefore reacts in hours, not minutes.

## Sign-up email limit

Sign-up and password-reset emails come from Cognito's default sender. AWS documents the quota as 50 email messages a day per AWS account, for the default email feature only; the restriction "resets daily at 0900 UTC". The cap is per account, so it is shared with any other user pool in the same account that uses the default sender, and emails beyond it may not be delivered. Moving to Amazon SES is the later fix.

## Privacy

Signing up stores your email address in Amazon Cognito, the only profile attribute the sign-up asks for. The server keeps its logs for 14 days, and they contain no request content (no tool arguments, no returned text).

## Clients

Only Claude Code is the target of this setup. Every other client is unchecked: this page does not say it works until a vendor source or a recorded test says so.

| Client | Status |
|---|---|
| Claude Code | Setup above. Sign-in against this server is confirmed only after the owner's sandbox test |
| Claude Desktop | not verified |
| Cursor | not verified |
| OpenCode | not verified |
| Codex CLI | not verified |
| Antigravity | not verified |
| Grok Bot | not verified |

## Who runs it

The owner deploys the server. Once the deploy role exists, each stable npm release will redeploy exactly that release's published package. Operations (resources, kill switch, rollback) are in [Infrastructure](infrastructure.md).
