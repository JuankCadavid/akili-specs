# Slack Release Notifications

Publishing a GitHub Release posts a summary of the changes to a Slack channel. This page covers
creating the webhook, storing it, rotating it, and pointing notifications at a different or
additional channel.

Setup is **one-time**. After the secret exists, every release notifies with no extra step.

## Quick path

1. Create a Slack incoming webhook for the target channel (steps below).
2. Store it as a repository secret:
   ```bash
   gh secret set SLACK_WEBHOOK_URL --repo JuankCadavid/akili-specs
   ```
3. Confirm it works before relying on it:
   ```bash
   gh workflow run "Release Notify" --repo JuankCadavid/akili-specs -f version=<last-version>
   ```

## How it fires

| | |
|---|---|
| Trigger | `release: published` — the GitHub Release, which is the **last** step of the release flow, after `npm publish` |
| Why not the tag push | A tag can exist for a release that never reached npm (an expired npm login is enough). Notifying on the tag would announce releases that do not exist |
| Content source | `releases/vX.Y.Z.md` — the same notes attached to the GitHub Release, so Slack cannot disagree with what shipped |
| Summary shape | Each `### Added` / `### Changed` / `### Fixed` section, digested to the **bold headline** of every bullet, plus links out |
| Workflow | `.github/workflows/release-notify.yml` |
| Script | `scripts/notify-slack.js` |

A **draft** release does not fire the workflow. `release: published` fires when the release becomes
public — so `gh release create --draft` notifies only once you publish it.

---

## Create the webhook

1. Go to the [Slack API Apps](https://api.slack.com/apps) site and sign in.
2. Click **Create New App** and choose **From scratch**.
3. Name the app (e.g. `Akili`) and select your Slack workspace.
4. In the left menu, select **Incoming Webhooks**.
5. Turn **Activate Incoming Webhooks** to **On**.
6. Click **Add New Webhook to Workspace** at the bottom.
7. Choose the channel the app will post to and click **Allow**.
8. Copy the **Webhook URL** shown on screen.

The webhook URL is a **bearer credential** — anyone holding it can post to that channel. Treat it
like a password: never commit it, never paste it into a chat, never pass it as a shell argument
where it lands in history.

## Store it

```bash
gh secret set SLACK_WEBHOOK_URL --repo JuankCadavid/akili-specs
```

`gh` prompts for the value and reads it without writing it to your shell history.

> **Do not use `--body "https://hooks.slack.com/..."`.** That puts the credential in your shell
> history in plaintext. For the same reason, do not type the URL as a positional argument — a
> mistyped `gh secret set <url>` sends the credential to the GitHub API as a URL path and it ends up
> in request logs.

Verify it registered:

```bash
gh secret list --repo JuankCadavid/akili-specs
```

This confirms a secret with that **name** exists and when it was written. It cannot confirm the
**value** is correct — GitHub never returns secret values. Only a test run proves that.

## Rotate or replace the webhook

Rotate whenever the URL may have been exposed (committed, pasted, logged, or shared).

1. In the Slack app config → **Incoming Webhooks**, remove the old webhook and add a new one for the
   same channel.
2. Re-run `gh secret set SLACK_WEBHOOK_URL --repo JuankCadavid/akili-specs` with the new URL.
   Setting an existing secret overwrites it; there is nothing to delete first.
3. Re-run the test dispatch below.

Revoking in Slack is what actually invalidates the old URL. Overwriting the secret alone leaves the
old webhook live for anyone who has it.

## Point at a different channel

Create a new webhook for the new channel and overwrite the same secret. Nothing in the repo changes
— the channel is baked into the webhook URL, not into the code.

## Add a second channel

The script posts to exactly one webhook today. Two ways to extend it, both small:

**Option A — one secret, several URLs.** Keep a single secret holding a comma-separated list, and
loop in `scripts/notify-slack.js` → `main()`, where it currently reads:

```js
const webhook = process.env.SLACK_WEBHOOK_URL;
```

Split on `,`, filter empties, and `await` a POST per URL. Fewest moving parts, but every channel gets
the identical message and one bad URL fails the run for all of them.

**Option B — one secret per channel.** Add e.g. `SLACK_WEBHOOK_URL_RELEASES` and
`SLACK_WEBHOOK_URL_DEV`, then pass both in the workflow's `env:` block in
`.github/workflows/release-notify.yml` and read them in the script. More verbose, but each channel
can be rotated independently and you can vary the message per channel later.

Prefer **A** for "same message, more places"; prefer **B** when the channels have different owners or
different lifecycles.

---

## Test and preview

Preview the exact payload without sending anything or needing the secret:

```bash
npm run notify:slack -- --dry-run            # current package.json version
npm run notify:slack -- 2.15.0 --dry-run     # a specific version
```

Send a real message from CI without cutting a release:

```bash
gh workflow run "Release Notify" --repo JuankCadavid/akili-specs -f version=2.15.0
gh run list --workflow="Release Notify" --repo JuankCadavid/akili-specs --limit 3
```

Send manually from your machine (avoid — it puts the URL in your shell history):

```bash
SLACK_WEBHOOK_URL=... npm run notify:slack -- 2.15.0
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| **Run is green but no Slack message** | `SLACK_WEBHOOK_URL` is unset or empty. The script exits `0` in that case **by design**, so forks and unconfigured clones do not get failed release runs | Re-run `gh secret set`. A green run is not proof the message arrived |
| Run fails, Slack returned `404` | The webhook was revoked or the URL is malformed — common when a rotated webhook was never re-stored, or the old one was pasted | Create a fresh webhook and re-store it |
| Run fails, Slack returned `400` | Malformed payload — usually a release-notes file the parser could not read | Run `npm run notify:slack -- <version> --dry-run` locally to see the payload |
| `release notes not found: releases/vX.Y.Z.md` | The version has no notes file, or the workflow checked out a ref that predates it | Confirm the tag points at the release commit that added the notes |
| Nothing fires after `gh release create` | The release was created as a **draft** | Publish it — `release: published` does not fire for drafts |
| Message arrives but sections look truncated | A section exceeded the character budget | Expected: long releases are digested and link out. Shorten the changelog headlines if it reads badly |

## Security notes

- The webhook lives **only** in GitHub repository secrets. It is never committed and never written to
  a file in the repo.
- `scripts/notify-slack.js` and the workflow are repo tooling and are excluded from the npm package
  (`files[]` in `package.json` does not include them), so nothing ships to consumers.
- The workflow runs with `permissions: contents: read`.
- If a webhook is ever exposed, **revoke it in Slack** — overwriting the GitHub secret does not
  invalidate the leaked URL.
