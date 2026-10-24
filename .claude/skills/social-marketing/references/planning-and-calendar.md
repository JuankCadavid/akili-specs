# Planning and Calendar

Adapted from sergebulaev/instagram-skills @ 6a12448 (`skills/ig-content-planner/SKILL.md`, `skills/ig-content-planner/references/pillars-framework.md`, `skills/ig-content-planner/references/example-week.md`), sergebulaev/linkedin-skills @ c4447ea (`skills/linkedin-content-planner/SKILL.md`, `skills/linkedin-content-planner/references/pillars-framework.md`, `skills/linkedin-content-planner/references/example-plan-week.md`) and sergebulaev/facebook-skills @ f3fb266 (`skills/fb-content-planner/SKILL.md`, `skills/fb-content-planner/references/pillars-framework.md`, `skills/fb-content-planner/references/example-week.md`); author Sergey Bulaev, MIT. Rewritten in AKILI's own words; the calendar conflict rules and the status reading are AKILI additions, matching `/akili-marketing`.

Used by `campaign` (the plan) and `calendar` (the table). Plan statuses, post statuses and what each mode may write are defined in `/akili-marketing`; this file says how to plan and how to read.

## Pillars

A pillar is a recurring theme that gives the account an identity and makes a week of planning mechanical. Take pillars from `brand-voice.md` (*Content pillars*); when it is empty, propose two to four and mark them as proposals for the user to change.

| Pillar | Default share | Job | Primary goal |
|---|---|---|---|
| Educational / authority | 40% | Teach what the account is known for | Saves, shares |
| Story / narrative | 30% | First-person wins, losses and turning points | Follows, comments |
| Engagement / community | 20% | Relatable moments, questions, gratitude | Comments, shares |
| Promotion | 10% | The offer and the next step | Follows, the CTA |

- Shares are defaults; adjust to the account. They must sum to 100%, and no pillar goes above about 50% of a week.
- Keep promotion to one or two posts a week. Overuse buries the rest.
- A pillar names a job, not a topic. "Educational" with no named skill is a label, not a pillar.

## Cadence (heuristics)

Consistency beats frequency: fewer good posts beat daily filler. Never pad to reach a count.

| Platform | Starting cadence | Notes |
|---|---|---|
| LinkedIn | 3 to 4 posts a week on weekdays | Mid-week mornings are the usual starting guess |
| Instagram | 4 to 5 feed posts a week | Stories run beside the feed; video can run more often than carousels |
| Facebook | 5 to 7 short posts a week | Lead short; story posts are the exception |

These are starting guesses from upstream, label `heuristic`. The user's own analytics outrank them; a posting time is a suggestion in the brand-voice timezone and is the user's to move.

## Planning a week or a campaign

1. Read `brand-voice.md` first (voice, language, timezone, pillars). Without one, record `Voice: generic — no brand voice on file`.
2. Gather the goal, audience, platforms (only LinkedIn, Instagram and Facebook; record any other as out of scope), dates and the offer, if any.
3. Validate the pillar mix: sums to 100%, none above about 50%.
4. For each slot choose: platform, format, pillar, hook formula (`hook-formulas.md`, not repeated more than twice in a week), a one-line angle, a goal, and a target date and time.
5. Take angles from the user, the brief or the brand voice's story bank first. A slot with no real material is marked `needs input`, not filled with an invented anecdote.
6. Run the balance check, then show the plan.

### Balance check

- [ ] Goals are spread across saves, shares, comments and follows; a week of one goal reads as engineered
- [ ] At least one first-person story post a week
- [ ] No pillar above about 50%; promotion at most one or two
- [ ] No formula repeated more than twice
- [ ] Each platform's slots respect its cadence guess, or the user's own number
- [ ] Every slot has a pillar, a goal and a source for its angle

### Plan shape

`plan.md` holds: pillars with their share, the format mix per platform, and a numbered list (`#`, working title, platform or platforms, format, target date, post file once drafted). The weekly goal is a saves-plus-shares or comments target, named in the plan; likes are not a plan target.

## Calendar rules

`calendar.md` (per campaign) and the month view share one row shape: `Date | Time (<TZ>) | Platform | Format | Post file | Status`.

| Rule | Behavior |
|---|---|
| Time zone | Use the brand voice's *Timezone*; when none is on file, use `UTC` and add a flag |
| Status column | Read from that platform's section of the post file and shown exactly as it is held; the calendar never writes or changes a status |
| Missing post file | Status `missing`, flagged |
| Unrecognized or empty status | Shown raw, flagged |
| A section reading `approved` that fails the validity check defined in `/akili-marketing` | Shown as `approved — invalid`, flagged |
| Same platform, same date and time | Flag the collision; never move either row on your own |
| Month view | Derived: regenerated each run from every campaign calendar and every campaign-less post, never hand-edited; campaign rows come from the campaign `calendar.md` |

Recognized status values are `draft`, `approved` and `published`; any other value is unrecognized.

### Flags list

Each calendar ends with a `Flags` list: same-slot collisions, missing post files, unrecognized statuses, invalid approval records, and `UTC` used because no timezone is on file. An empty list says `none`.

## Worked shape (one week, LinkedIn and Instagram)

| Day | Platform | Format | Pillar | Formula | Angle | Goal |
|---|---|---|---|---|---|---|
| Tue | LinkedIn | Text | Educational | H1 | `{result the user supplied}` | Saves |
| Wed | Instagram | Carousel | Educational | H5 | `{list from the brief}` | Saves |
| Thu | LinkedIn | Text | Story | H4 | `{dated moment from the story bank}` | Comments |
| Fri | Instagram | Single image | Engagement | H3 | `{shared moment}` | Comments |
| Sat | Instagram | Video brief | Story | H6 | `{before/after from the user}` | Follows |

Slots in braces are filled only from user material.
