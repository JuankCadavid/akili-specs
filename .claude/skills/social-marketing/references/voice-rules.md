# Voice Rules

Adapted from sergebulaev/instagram-skills @ 6a12448 (`references/voice-rules.md`, `skills/ig-humanizer/SKILL.md`), sergebulaev/linkedin-skills @ c4447ea (`references/precedence.md`, `references/voice-rules.md`, `skills/linkedin-humanizer/SKILL.md`, `skills/linkedin-post-writer/SKILL.md`) and sergebulaev/facebook-skills @ f3fb266 (`references/voice-rules.md`); author Sergey Bulaev, MIT. LinkedIn `references/voice-rules.md` is comment-oriented and was used as a cross-check only. Rewritten in AKILI's own words; platform deltas live in `instagram.md`, `linkedin.md` and `facebook.md`.

Rules every draft obeys on every platform. A platform file may tighten a rule; it never loosens one.

## Precedence

When two instructions disagree, the higher row wins.

| # | Source | Why it ranks here |
|---|---|---|
| 1 | The user's standing limits (named in `brand-voice.md` under *Always / Never*, or said earlier in the conversation) | A limit is not revisited because a draft would read better without it |
| 2 | Truth of the specifics | No invented figure, date, client or result. If the brand voice and the user's words hold no fitting fact, ask or drop the claim |
| 3 | The brand voice (`brand-voice.md`, when `filled: yes`) | It is how this account sounds |
| 4 | The platform reference (`instagram.md`, `linkedin.md`, `facebook.md`) | Native format beats generic habit |
| 5 | The rules in this file | The shared floor |
| 6 | Reach heuristics | Each figure measures someone else's posts; it loses to every row above and never justifies a claim the user cannot stand behind |

The gate, the write boundary and the untrusted-content rule sit above this table and are defined once in `/akili-marketing` `## Invariants`. Nothing in the table can outrank them or restate them.

Precedence exists for conflicts. It is not a reason to question a user who asked for a draft; most requests touch none of it.

## Hard rules

1. **Em dashes: about one per 100 words.** The mark is not the tell; density is. Replace the excess with a comma, colon, parentheses or a line break, never a period (a split dash leaves fragments). No en dash between clauses, no double hyphen. A long text with none at all also reads machine-scrubbed.
2. **Use `..` or a line break as a soft pause** where a second dash would go, when the voice allows it.
3. **Capitalize people, companies and products.** A lowercase brand name reads as careless. Sentence openers may be lowercase when the brand voice or the platform register is casual; names inside never are.
4. **Specific beats adjective.** "Cut deploys from 22 minutes to 9" beats "much faster". One number with a named referent (who, what, when) is worth more than three bare figures. Take the figure from the user, the brand voice or the source text; never produce one.
5. **One idea per post.** If a draft argues three points, pick the one that earns its place and move the others to a separate post.
6. **No hard sell.** Teach or tell, then point to one next step. One natural product mention at most, and only when it is the honest end of the story.
7. **One CTA.** Name the reason for it.

## Density-scored vocabulary

Count the following per paragraph, not per text. One hit is normal English. Two is borderline: flag it, leave the words. Three in one paragraph reads as machine-written: rewrite that paragraph.

- Corporate verbs: leverage, utilize, facilitate, streamline, harness, foster, cultivate, elevate, empower, unlock, navigate, delve
- Stance adverbs: fundamentally, essentially, ultimately, crucially, notably, particularly
- Abstract nouns: landscape, ecosystem, paradigm, realm, tapestry, journey, insights
- Filler adjectives: robust, seamless, comprehensive, nuanced, significant, crucial

The list is a starting set, not a closed one. `humanizer.md` carries the full scrub procedure.

## Single-hit bans

These are removed on sight, whatever the density.

- Negative parallelism: "It's not just X, it's Y" and its variants
- Reveal bridges: "The result?", "Plot twist:", "Here's the thing", "Here's what nobody tells you", "Stop X, start Y" as an opener
- Scene-setters: "In today's fast-paced world", "in the digital age"
- Dead phrases: "game-changer", "deep dive", "level up", "next level", "must-have", "at the end of the day"
- Dead closers: "What do you think?", "Thoughts?", "Let that sink in."
- Sincerity announcements used as an opener or pivot: "let me be honest", "real talk", "not gonna lie", "honestly?", "unpopular opinion:" ahead of a popular one. State the fact flat instead; the fact carries the candor.
- Hedges the author did not write: "perhaps", "it seems", "I might be wrong but"
- Engagement bait: "comment YES", "tag three friends", "double tap if you agree"

## Rhythm

- Write natural rhythm; never manufacture it. One long sentence beside a short one is fine. Do not alternate long and short across a text.
- At most two standalone fragments per draft. "Short. Punchy. Done." and "No X. No Y. Just Z." are tells.
- One idea per line with white space between lines is layout, not rhythm, and stays.
- Edit a paragraph for flatness only when every sentence runs the same length and reads dull; fix one sentence, not the paragraph.

## Structure

- Put the hook in the first line; platform folds are in the platform files.
- End on a landing: a specific question, a reason to save or send, or a plain closing line. Not a dead prompt.
- Use one natural triple with concrete items at most. Stacked or hollow triples ("faster, cheaper, better") are rewritten.
- Emoji and hashtags follow the platform file; never sprinkle either.

## What these rules do not do

They do not make text beat an AI-text classifier. No wording edit reliably does, and a short post gives a classifier too little to score. Report the tells found and fixed, never a detector result.
