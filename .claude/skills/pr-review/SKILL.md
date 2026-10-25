---
name: pr-review
description: "Trigger: pull request review scripts, review document validation, posting a PR review comment. Provisional: only the deterministic review scripts and the review schema ship so far; the /akili-review command and the review method arrive in a later release."
license: MIT
metadata:
  author: Juan Carlos Cadavid — jcadavid.com
  binding: core
  version: "0.1.0"
---

# PR Review (provisional)

Only the deterministic half ships so far. `/akili-review`, the review lenses, the references and the CI templates are not part of this skill yet; a later release replaces this body with the method.

## What ships

| File | Use |
|---|---|
| `review-schema.json` | Schema of a review document (`findings.json`) |
| `validate-review.cjs` | `node validate-review.cjs <doc> [--manifest <m>] [--threshold <0-100>]` checks a review document against the schema and its semantic rules; exit 0 valid, 1 invalid, 2 usage |
| `post-review.cjs` | Subcommands `prepare`, `check-skip`, `render` and `post`: prepares a diff, decides whether to skip, renders the review text, and posts it |

## Boundaries

- The scripts review only: they never edit, approve or block (the review event is always `COMMENT`; a failing exit happens only when the caller opts in with `--fail-on`), and posting happens only through `post-review.cjs post`.
- `prepare` and `render` never call `gh` or the network.
