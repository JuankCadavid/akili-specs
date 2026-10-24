# LinkedIn

Adapted from: `linkedin-post-writer`, `references/algorithm-heuristics.md`, `references/hook-formulas.md` (LinkedIn fold and opener notes only) of the upstream LinkedIn skill pack (pin `c4447ea`), rewritten tool-neutral for AKILI-SPECS.
lastVerified: 2026-10-23

Read this before drafting or reviewing any LinkedIn post. Every rule carries a label. Rows labelled as sourced limits cite LinkedIn's own Help Center, read on 2026-10-23; `heuristic` rows are vendor-reported or unsourced, change without notice, and never block a user's explicit choice (an overrun of a heuristic cap is still reported).

## Limits

The *Limits check* lists every sourced row as value / limit. A `heuristic` cap (for example caption length) may be listed too, labelled `heuristic`; a draft over it is shortened or the overrun is reported on the card, never passed silently. A heuristic never blocks a user's explicit choice.

| Item | Figure | Label | Source (checked 2026-10-23) |
|---|---|---|---|
| Post length | 3,000 characters | hard limit | https://www.linkedin.com/help/linkedin/answer/a528176 — "Posts can contain up to 3,000 characters." Over that, the page points to an article instead |
| Article length | 125,000 characters | hard limit | https://www.linkedin.com/help/linkedin/answer/a522483 — "Articles are typically longer than posts and are limited to 125,000 characters." |
| Images in a multi-photo post | 20 | hard limit | https://www.linkedin.com/help/linkedin/answer/a527229 — "You can upload a maximum of 20 photos in a multi-photo post." |
| Document (carousel PDF) size and pages | 100 MB and 300 pages | hard limit | https://www.linkedin.com/help/linkedin/answer/a518909 — "The file size cannot exceed 100MB and 300 pages." |
| Document file types | PPT, PPTX, DOC, DOCX, PDF | hard limit | https://www.linkedin.com/help/linkedin/answer/a518909 — "The following file types are supported: PPT, PPTX, DOC, DOCX, and PDF." Prefer PDF |
| Documents per post | one | hard limit | https://www.linkedin.com/help/linkedin/answer/a518909 — both upload flows say "(choose one)" |
| Native video length | 30 to 90 seconds | heuristic | Upstream value; no official page read states a recommendation |

## Formats

| Format | Use when | Notes |
|---|---|---|
| Text post | a story, a take or a build log | Strong default; 900-1,300 characters is the usual target (heuristic) |
| Document / carousel PDF | a framework, checklist or step list | heuristic: 6-9 slides, under about 12 words a slide; slide 1 is the hook |
| Multi-image | a few real photos with a story | Up to 20; alt text per image |
| Poll | a real question with short answers | Low effort, modest reach |
| Native video | the hook lives in the video | Write a script brief only and point to the `video-production` skill; never draft the video. heuristic: 30-90 seconds, captioned, vertical, uploaded natively |
| Article | evergreen reference, not a timely take | Over 3,000 characters only |

A single image alone is the weakest format reported for 2026 (heuristic).

## Fold behaviour

heuristic: the feed cuts a post at "see more". Reported cut-offs are about 210 characters on desktop and about 140 on mobile, so write for the shorter one and treat the rest as a bonus.

- Line 1 is a statement or a number. Never open with a question; move the question to the close (vendor data, labelled heuristic).
- Prefer a number-first line with a specific, user-supplied figure.
- Never an all-caps first line; never "Here's what" or "Stop X, start Y" as the opener.
- The gap a hook opens must pay off inside two lines, before the fold.

## Length and layout

All heuristic.

| Choice | Guidance |
|---|---|
| Default | 900-1,300 characters when the user states no preference |
| User's target wins | Short (300-500), medium (900-1,300) or long (1,500-1,900): write the length asked for, never trim toward the default |
| Paragraphs | One or two sentences, a blank line between ideas; one contrast and one list of three per post at most |
| Close | A specific question that names the topic, or a clean landing; a one-line P.S. only when there is a real follow-up |
| Links | Keep external links out of the body and say the link is in the first comment |
| Tone | One real moment of stakes or vulnerability; never frame LinkedIn itself as inferior |

## Hashtags

heuristic: 0-3 niche tags at the end; zero performs about as well as five. Five or more reads as spam. Never mid-sentence. The help page https://www.linkedin.com/help/linkedin/answer/a528176 names no per-post number, so this is a sizing choice.

## Timing and engagement heuristics

All heuristic; vendor-reported, not confirmed by LinkedIn.

| Topic | Guidance |
|---|---|
| Windows (audience local time) | US B2B: Tue-Wed mornings; EU: Tue-Wed 07:00-08:30; mixed: Tue-Thu 07:30-09:00. Avoid Monday early, Friday late and weekends for B2B |
| Cadence | At most one post a day; two or more a day cannibalise each other |
| Signals | Saves and in-depth comments outweigh likes; replies to early comments in the first hour extend reach |
| Edits | Heavy rewrites in the first hours restart distribution; fix typos, not structure |
| Suppressors | Comment-gate phrasing ("comment X to get Y"), engagement-bait closers, coordinated comment groups, external links in the body |

## Pre-draft checklist

- [ ] Hook in the first 140 characters (heuristic), statement or number, not a question
- [ ] Post, image and document sizes within the sourced rows in *Limits*
- [ ] 0-3 hashtags at the end (heuristic); no external link in the body
- [ ] At least one specific, user-supplied number or named detail; nothing invented
- [ ] Media brief names the format; alt text per image
