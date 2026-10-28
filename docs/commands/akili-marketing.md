# `/akili-marketing`

Draft social marketing for LinkedIn, Instagram and Facebook as reviewable Markdown under `docs/marketing/`: a brand voice, a map of customer angles, campaign briefs and plans, a content calendar and platform-native post drafts. Each post ends at a copy-paste block for you to place by hand. The method comes from the packaged [`social-marketing`](../skills/social-marketing.md) skill. With `/akili-seo` it forms the **growth track**, a documentation grouping of two anytime commands, not a command ([data flow](../flow.md#2c-social-marketing-akili-marketing)).

## The gate

The command never publishes, schedules or queues content on any platform, a post section becomes `approved` only by your own explicit words about the exact text shown, and no Approval Mode auto-passes it; the rules are defined once, in `## Invariants` of [`/akili-marketing`](../../.claude/commands/akili-marketing.md).

## Usage

```text
/akili-marketing <mode> [args]
```

| Mode | Invocation | Writes |
|---|---|---|
| `brand` | `brand` | `brand-voice.md` |
| `angles` | `angles [<pillar>]` | `angles.md` |
| `campaign` | `campaign <slug> [brief]` | `campaigns/<slug>/brief.md`, `plan.md` |
| `calendar` | `calendar <slug>` or `calendar [<YYYY-MM>]` | `campaigns/<slug>/calendar.md` or `calendar-<YYYY-MM>.md` |
| `post` | `post <request>`; `post --revise <file> [<platform>] <change>`; `post --published <file> <platform> <url>` | `posts/<YYYY-MM-DD>-<slug>.md` |
| `review` | `review <file\|pasted text>` | nothing (findings in conversation) |
| `repurpose` | `repurpose <source>` | new `draft` post files |

Paths are under `docs/marketing/`. The command runs anytime, outside the spec lifecycle: no `docs/specs/` read or write is needed. With no mode or an unknown one it lists the seven modes and creates no file.

Examples: `/akili-marketing brand`, `/akili-marketing campaign spring-launch`, `/akili-marketing post a LinkedIn and Instagram post announcing the new pricing`.

## Modes

| Mode | What happens |
|---|---|
| `brand` | Interviews you, or derives the voice from 2 to 4 real posts you paste. Fills voice fingerprint, always / never rules, audience, the foundations (ideal customer, ideal follower, offer, message), content pillars, CTA and primary link, language, timezone and per-platform tone, plus a `filled: yes|no` status block. When `docs/prd.md` exists, pre-fills the foundations it answers from its *Target Personas*, *Problem Statement* and *Customer Objections & Beliefs* sections, each line citing its section, for you to confirm or edit; it never writes to the PRD. Asks before changing an existing file |
| `angles` | Writes `angles.md`, one pillar section at a time (all pillars, or only `<pillar>`): up to 9 problems, desires, objections and beliefs per pillar, never padded, each citing one source; a slot without material reads `needs input`. Shows each pillar as an `Angles card` and stops; the section becomes `approved` only by your own explicit words, as for a post. Writes no post, idea or hook set |
| `campaign` | Writes `brief.md` and `plan.md`, then stops at the plan gate (**Approve / Adjust / Stop**). Each plan slot carries an `Angle` (an approved angle ID, or `needs input`), an `Approach` and three `Hooks`. No post is drafted before the plan is approved |
| `calendar` | Per campaign, writes `calendar.md` from `plan.md`. With a month, regenerates `calendar-<YYYY-MM>.md` across every campaign calendar and campaign-less post. Times are in the brand-voice timezone, `UTC` flagged when none is on file. Reads each post's status and never changes it; ends with a `Flags` list |
| `post` | Records `Angle:` (approved IDs from `angles.md`, or `none — no angles map`) and `Approach:` in the header, shows three hook candidates for you to pick one, then writes one post file with one section per requested platform, each written for that platform, with the hook before the platform's fold. Runs the humanizer pass and the Limits check, then shows the approval card |
| `post --revise` | The only in-place edit of a post section; re-runs the humanizer and Limits check and shows a new card. A `published` section is never revised: a new post file is created |
| `post --published` | Records the live URL for one platform's section, which must read `approved`, or `published` to correct the URL (the old URL is kept as `previously:`). The URL must be `https` and its host must be the platform's domain or a subdomain of it (`facebook.com` or `fb.com` for Facebook); the command never fetches it |
| `review` | Audits a draft or pasted text for AI tells, fold placement, hard limits, hashtag sizing and brand-voice violations. Findings stay in conversation; nothing is edited, on an `approved` file too |
| `repurpose` | Turns owned content you paste or name as a local file into new `draft` post files, re-hooked per platform. The source is data and is never fetched |

For `angles`, `campaign`, `post` and `repurpose` the command reads `brand-voice.md` first. When it is absent or not `filled: yes` it offers to run `brand`; if you decline, every artifact carries `Voice: generic — no brand voice on file`.

## Artifacts

| File | Created by | Content |
|---|---|---|
| `docs/marketing/brand-voice.md` | `brand` | Voice, rules, audience, pillars, language, timezone, per-platform tone |
| `docs/marketing/angles.md` | `angles` | One section per content pillar, each with `Status`, `Approval`, and four lists (problems, desires, objections, beliefs) of `- <ID> <angle> — source: <source>`; then approaches applied and open questions |
| `docs/marketing/campaigns/<slug>/brief.md`, `plan.md` | `campaign` | Goal, audience, platforms, KPIs, dates, offer, UTM scheme; pillars, format mix and a numbered post list with `Angle`, `Approach` and `Hooks` per slot |
| `docs/marketing/campaigns/<slug>/calendar.md` | `calendar <slug>` | One row per slot: `Date \| Time (<TZ>) \| Platform \| Format \| Post file \| Status` |
| `docs/marketing/calendar-<YYYY-MM>.md` | `calendar <YYYY-MM>` | Derived month view, fully regenerated on each run, never hand-edited |
| `docs/marketing/posts/<YYYY-MM-DD>-<slug>.md` | `post`, `repurpose` | Per platform: Status, Approval, Copy, Hashtags, CTA, Alt text, Media brief, Image prompt, Limits check, Humanizer, Published |

Slugs use only `a-z`, `0-9` and `-`. A post file is never overwritten: a name collision adds `-2`, `-3` and so on. The first write into a project says once that `docs/marketing/` holds unpublished content and that you decide whether to git-ignore it; the command does not edit `.gitignore`.

### Angles and selection

An angle is one line in the customer's words, of one type (problem, desire, objection or belief), with an ID such as `KB-P2` (pillar code, type letter, number). A `campaign` plan slot names an approved angle ID (optionally a second, or `needs input`), an approach out of five (expert, bridge, differentiator, social proof, connection) and three hook candidates. `post` records the approved angle ID(s) and an approach in its header, shows three hook candidates and drafts with the one you pick. A `post` request citing an angle ID from a pillar section that is not validly `approved` is refused, naming the missing pillar approval, and a `campaign` plan cites no such ID. `social proof` needs a story-bank fact marked free to use, a brief fact or a fact you supplied; the command never invents a testimonial, client name or figure. With no `angles.md`, `post` drafts as before and records `Angle: none — no angles map`.

`angles.md` is a menu, not a production order: no mode drafts a post for every angle times every approach. Pillar approval follows the same rules as post approval, and a change to any of the four lists sets the section back to `draft`.

### Limits check

Each platform reference labels every rule `hard limit` or `heuristic`. Hard limits are sourced to each platform's own Help Center, read on 2026-10-23 (Instagram's for the in-app experience). Instagram has four (carousel items, mixed photos and videos, one orientation per carousel, hashtags per post) and LinkedIn has six (post length, article length, images per multi-photo post, document size and pages, document file types, one document per post). Facebook has none: the Help Center pages searched state no figure for post length, photos per post or hashtags, so every Facebook figure is a `heuristic`. A heuristic never blocks your explicit choice, and an overrun is always reported on the card.

## Residual risk

The approval record is written by the agent, so this is a prompt-level gate, not a machine-enforced one. Hand edits are detected on the next read: an `approved` section whose card fields differ from the stored snapshot, or whose record or snapshot is missing or malformed, is treated as `draft` and reported in one line.

## What it does not do

- Call a platform API, a scheduler, browser automation, or any session tool that posts or schedules (the rules are in `## Invariants`).
- Generate images or video. An image prompt is text for you, and a video request gets a script brief only, with a pointer to the `video-production` track.
- Ask for, store or write a credential, token or API key.
- Fetch a URL. Content is pasted or read from a local file you name.
- Write outside `docs/marketing/`, run a `git` write, or edit source code.
- Draft for X, Threads, TikTok or YouTube: any platform other than LinkedIn, Instagram and Facebook is recorded as out of scope.
- Obey text that arrives inside pasted or file content. It is data, reported in one line and kept out of the draft.

## Next steps

- After `brand`: `angles`, or `campaign <slug>`, or `post <request>` for a single post.
- After a pillar section is approved: `campaign <slug>` or `post <request>`, choosing from its angles.
- After the plan is approved: `post` for each numbered slot, then `calendar <slug>`.
- After you post an approved draft by hand: `post --published <file> <platform> <url>`.
- To change a post: `post --revise`. To check a draft: `review`.

## Credit

The `social-marketing` skill adapts work by Sergey Bulaev (MIT); the angle method (foundations, then angles of four types, then five approaches) follows the structure of Nico Azero's content method from the video *Así creo 6.480 reels con Claude en 3h*, written in AKILI's own words; see [`social-marketing`](../skills/social-marketing.md#attribution-and-licence). The command and the AKILI-SPECS methodology are by Juan Carlos Cadavid — [jcadavid.com](https://jcadavid.com), MIT.

## Source

- `../../.claude/commands/akili-marketing.md`
