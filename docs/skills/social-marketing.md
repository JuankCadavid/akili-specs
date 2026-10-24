# `social-marketing`

**Binding `core`** — loaded by `/akili-marketing` in its setup step, with only the references each mode needs. Adapted from three MIT skill packs by Sergey Bulaev.

## Purpose

Write native, human-sounding drafts for LinkedIn, Instagram and Facebook from a user's brief and brand voice. The output is text the user reads, edits and posts themselves. The skill supplies how to write; the command owns the modes, files, statuses and the gate, defined in `## Invariants` of [`/akili-marketing`](../commands/akili-marketing.md).

| Use it for | Do not use it for |
|---|---|
| A brand voice file, a campaign plan, a calendar, one post per platform, a review of a draft, a rewrite of owned content for another platform | Page or article SEO copy (use `seo-audit`), paid-ad copy, replies and comments on other people's posts, profile or page optimization |

## AKILI Integration

`/akili-marketing` loads references per mode and reads a platform file only for platforms in scope. Paths are under `.claude/skills/social-marketing/references/`.

| Mode | References loaded |
|---|---|
| `brand` | `brand-voice-template.md`, `voice-rules.md`, `untrusted-content.md` |
| `campaign` | `planning-and-calendar.md`, `brand-voice-template.md`, `voice-rules.md`, platform files in scope |
| `calendar` | `planning-and-calendar.md` |
| `post` | `voice-rules.md`, `hook-formulas.md`, `humanizer.md`, `brand-voice-template.md`, `untrusted-content.md`, platform files in scope |
| `review` | `humanizer.md`, `voice-rules.md`, `untrusted-content.md`, platform files in scope |
| `repurpose` | `repurposing.md`, `hook-formulas.md`, `humanizer.md`, `voice-rules.md`, `untrusted-content.md`, platform files in scope |

The command checks that the loaded copy's frontmatter carries `adapted-for: "AKILI-SPECS"`. A foreign copy of the same name stops the command, which names the resolved path and tells you to run `akili install --force` yourself.

## References

`.claude/skills/social-marketing/`: `SKILL.md`, `LICENSE` and ten files under `references/`.

| Group | Files |
|---|---|
| Voice and writing | `brand-voice-template.md`, `voice-rules.md`, `hook-formulas.md`, `humanizer.md` |
| Planning and reuse | `planning-and-calendar.md`, `repurposing.md` |
| Platforms | `instagram.md`, `linkedin.md`, `facebook.md` |
| Safety | `untrusted-content.md` |

Every rule in a platform file is a `hard limit` or a `heuristic`, and each file carries `lastVerified:`. Instagram has four sourced hard limits and LinkedIn has six, each citing the platform's own Help Center; Facebook has none, so all of its figures are `heuristic`.

## Size

**Size justified.** Three upstream packs are merged into one skill: `SKILL.md` is 73 lines and the ten references total 777 (547 across the seven voice, planning, reuse and safety files, 230 across the three platform files). The body stays a short core pattern and an integration table; detail lives in `references/`, which the command loads per mode, so a run reads only what its mode names. Nothing is carried that no mode loads.

## Attribution and licence

| Item | Value |
|---|---|
| Author | Sergey Bulaev |
| Sources | `https://github.com/sergebulaev/instagram-skills` @ `6a124481d0ebe9b6d3ac1323ed2a2abc40c7e1d7`; `https://github.com/sergebulaev/linkedin-skills` @ `c4447ead7723aa0b65bbfb5d9281784b20dce75a`; `https://github.com/sergebulaev/facebook-skills` @ `f3fb266c0b984cf5e9e9e3a6a57021373f3ced68` |
| Licence | MIT, one `LICENSE` file at `.claude/skills/social-marketing/LICENSE` ("Copyright (c) 2026 Sergey Bulaev") |
| Adapted by | Juan Carlos Cadavid — jcadavid.com, for AKILI-SPECS |

The three packs are merged and rewritten tool-neutral, not vendored: every file under `references/` names what it was adapted from.

## What was dropped

- All Python (`lib/*.py`), `scripts/`, the marketplace folder and plugin manifests.
- The MCP read layer, audience insights, the hook extractor, the profile and page optimizer, the comment and reply drafters, thread monitoring, employee advocacy, engager analytics, industry benchmarks and founder topics.
- Every third-party publishing-service, scraping-service and vendor-promotion passage, the star request that follows a successful run, and the acknowledgments.

No reference carries publishing, API or scheduling instructions.

## Source

- `../../.claude/skills/social-marketing/SKILL.md`
