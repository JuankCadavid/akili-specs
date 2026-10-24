# Instagram

Adapted from: `ig-caption-writer`, `ig-carousel-planner`, `references/hashtag-strategy.md`, `references/algorithm-heuristics.md`, `references/media-workflow.md` (limits table only) of the upstream Instagram skill pack (pin `6a12448`), rewritten tool-neutral for AKILI-SPECS.
lastVerified: 2026-10-23

Read this before drafting or reviewing any Instagram copy. Every rule carries a label. Rows labelled as sourced limits cite Instagram's own Help Center page for the in-app experience, read on 2026-10-23; `heuristic` rows are community-measured or unsourced and may change without notice. If a label and a brand voice conflict, the brand voice wins on tone; a limit never yields.

## Limits

The *Limits check* lists every sourced row as value / limit. A `heuristic` cap (for example caption length) may be listed too, labelled `heuristic`; a draft over it is shortened or the overrun is reported on the card, never passed silently. A heuristic never blocks a user's explicit choice.

| Item | Figure | Label | Source (checked 2026-10-23) |
|---|---|---|---|
| Carousel items per post | up to 20 photos and videos in one post | hard limit | https://help.instagram.com/269314186824048 — "You can share a post with up to 20 photos and videos as a single post, also known as a carousel, to your Instagram feed." |
| Photos and videos in one carousel | may be mixed | hard limit | https://help.instagram.com/269314186824048 — the 20 items are "photos and videos" in one post |
| Carousel orientation | one orientation (square, portrait or landscape) for every item; it cannot differ per item | hard limit | https://help.instagram.com/269314186824048 — "the orientation you choose (square, portrait or landscape) affects all of the photos or videos in your post. You can't select a different orientation for each photo or video." |
| Hashtags per post | at most 5 | hard limit | https://help.instagram.com/351460621611097 — "You can use up to 5 tags on a post. If you include more than 5 tags on a single photo/video, your comment won't post." |
| Caption length | 2,200 characters | heuristic | No Help Center page read states a caption cap; 2,200 is the upstream value and is widely reported. Keep every caption at or under 2,200 and re-check in the app's counter |
| Image aspect ratio | 4:5 (portrait) to 1.91:1 (landscape) | heuristic | Upstream value; no official page found. 4:5 fills the most feed space |
| Reel length | up to 3 minutes; 5 to 90 seconds are eligible for the Reels tab | heuristic | Upstream value; no official page found |
| Media | every post needs at least one image or video; text-only is not possible | heuristic | Upstream value; no official page found |

## Formats

| Format | Use when | Notes |
|---|---|---|
| Single image | one strong visual and a short idea | Caption carries the message |
| Carousel | a list, framework, transformation or myth-buster | See *Carousel structure* |
| Reel | the hook lives in the video | Write a script brief and the supporting caption only; point to the `video-production` skill for production. Never draft the video itself |
| Story | keeping top of mind with existing followers | Not a reach format; one line plus a sticker idea |

## Fold behaviour

heuristic: only about the first 125 characters of a caption show before "more". The hook must land its payoff, number or tension inside them and make sense alone. Rewrite any hook that needs the second line.

Caption shape: hook, short body with white space between beats, one idea, one call to action (a specific save or send prompt or a real question, never "what do you think?"), hashtags last or in the first comment. Keep it under 2,200 characters (heuristic).

## Carousel structure

All rows heuristic (spine is upstream's; the item cap is in *Limits*).

| Slide | Role |
|---|---|
| 1 | The promise plus an open loop, never a bare title. Big text, one idea |
| 2-3 | The strongest value, front-loaded; swipe-through decays with depth |
| 4 to N-1 | One point per slide, readable in about 2 seconds, each able to stand alone |
| N | A one-slide summary worth saving, plus one ask (save or follow) |

- 6 to 10 slides suit a teaching carousel; fewer than 4 is usually a single image. Match the count to the real content and never pad to a round number.
- Design for a 4:5 portrait frame.
- The caption supports the carousel, restates the hook for the fold and carries the hashtags.
- Alt text: one per image.

## Hashtag sizing

The cap is 5 (see *Limits*); the sizing below is heuristic.

| Tier | Post count shown in the app's search | Count |
|---|---|---|
| Niche | under 50k | 2-3 |
| Mid | 50k to 500k | 1-2 |
| Broad | over 500k | 0-1 |

- Target 3-5 in total, never more than 5. Count caption and comment tags together.
- Every tag must describe the actual content. Skip generic engagement tags (`#like4like` and similar) and avoid one block repeated on every post; rotate sets per topic.
- Put tags at the end of the caption or in the first comment, never mid-sentence. No dot-and-line-break hiding.
- A campaign hashtag is worth one slot while the campaign runs.

## Timing and engagement heuristics

All heuristic; community-measured, not confirmed by Instagram. Use them to suggest a slot, never to refuse one.

| Topic | Guidance |
|---|---|
| Windows (audience local time) | US consumer: weekdays 11 AM-1 PM and 7-9 PM; B2B: Tue-Thu mid-morning and lunch; otherwise when the account's own insights show the audience online |
| Cadence | 3-5 strong posts a week with steady rhythm beats daily filler |
| Levers | Sends and saves outweigh likes. Lists, frameworks and how-tos earn saves; relatable truths, myth-busters and contrarian takes earn sends |
| Suppressors | Engagement bait ("comment YES", "tag 3 friends"), another app's watermark on a Reel, all-hashtag captions, mismatched tags |
| First hour | Replying to early comments keeps the conversation signal alive |

## Pre-draft checklist

- [ ] Hook stands alone
- [ ] One idea, one call to action, one primary goal (saves, shares, comments or follows)
- [ ] At most 5 hashtags; carousel at most 20 items with one orientation (the sourced rows in *Limits*)
- [ ] Caption at most 2,200 characters (heuristic); hook inside about 125 characters (heuristic)
- [ ] Media brief names the format, aspect ratio and what each image must show; alt text per image
- [ ] No engagement bait; no invented numbers, dates or names (take specifics from the user)
