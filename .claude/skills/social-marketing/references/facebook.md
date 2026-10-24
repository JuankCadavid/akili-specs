# Facebook

Adapted from: `fb-post-writer`, `references/algorithm-heuristics.md` (signals, short-post, suppressors, amplifiers, post types, timing) of the upstream Facebook skill pack (pin `f3fb266`), rewritten tool-neutral for AKILI-SPECS.
lastVerified: 2026-10-23

Read this before drafting or reviewing any Facebook Page post. Every rule carries a label. On 2026-10-23 the Facebook Help Center pages searched for posting (https://www.facebook.com/help/174641285926169 and https://www.facebook.com/help/214757948549570) state no figure for post length, photos per post or hashtags, so this file carries no sourced limit and every figure in it is labelled `heuristic`. Treat them as sizing guidance, re-check in the composer, and never refuse a user's choice on a heuristic alone.

## Limits

This file has no sourced limit. Its under-80 row is a target, not a cap: a longer post is not an overrun and is not reported.

| Item | Figure | Label | Note |
|---|---|---|---|
| Short-post sweet spot | under 80 characters | heuristic | Reported roughly 66% more engagement; community-measured, not confirmed by Meta |

## Formats

| Format | Use when | Notes |
|---|---|---|
| Text only | an opinion, a number, a question, a tip | Fully supported on Pages and often the best performer; the under-80 shape lives here |
| Photo or album | a moment, a product, behind the scenes | Out-reaches a bare link post; one strong image plus a short line is the workhorse |
| Native video or Reel | demos, stories | Write a script brief only and point to the `video-production` skill; never draft the video. Upload natively, do not link out; keep the first 3 seconds strong |
| Link post | traffic off the platform | heuristic: lower organic reach; write framing text above the link, never a bare URL |
| Story post | a true narrative, a launch, a spotlight | A deliberate choice, not the default |

## Fold behaviour

heuristic: longer posts fold behind "See more", so the first line must carry the post on its own. Default to short: land the whole point under 80 characters when it is one opinion, number, question or moment. When going long, the first line still has to earn the tap. One idea per post; line breaks as beats.

## Hashtags

heuristic: 0-2, none on a serious take. Five or more reads as spam and does nothing for discovery. Place at the end, never mid-sentence. No official per-post cap was found, so this is a sizing choice, not a limit.

## Copy rules that travel

All heuristic.

- A specific number beats an adjective ("4 minutes" beats "fast"), taken only from what the user supplied.
- Never open with "We are thrilled / excited / delighted to announce" or any corporate auto-pilot opener.
- 0-2 emoji, each earning its place.
- Do not beg for engagement ("like and share if you agree", "comment YES", "tag 3 friends"); earn the share or comment with the post itself.
- Design for a share or a real comment, not a passive Like. A share re-injects the post into a new network.
- Avoid near-duplicate rewordings of one post; they trip a similarity penalty.

## Timing and engagement heuristics

All heuristic; community-measured, not confirmed by Meta.

| Topic | Guidance |
|---|---|
| Windows (audience local time) | Consumer Page: weekdays 9-11 AM and 1-3 PM; professional Page: Tue-Thu mid-morning; mixed: weekday early afternoon. Weekends suit lighter, community content |
| Cadence | One strong post a day, or 4-7 a week, beats bursts |
| Signals | Shares and real comment threads weigh most; reactions beyond a plain Like weigh a little more; hiding or reporting weighs heavily against |
| First 60-90 minutes | A Page reply to early comments keeps the conversation alive and can earn a second distribution test |
| Suppressors | Engagement bait, bare external links, repeated near-duplicates, many hashtags, corporate openers |

## Pre-draft checklist

- [ ] First line carries the post; whole point under 80 characters where possible
- [ ] One idea, one primary goal (shares, comments or reactions)
- [ ] 0-2 hashtags, 0-2 emoji; no engagement bait; no corporate opener
- [ ] Any link has framing text above it
- [ ] Media brief names the format; alt text per image; nothing invented
