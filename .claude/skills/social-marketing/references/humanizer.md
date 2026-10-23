# Humanizer

Adapted from sergebulaev/instagram-skills @ 6a12448 (`skills/ig-humanizer/SKILL.md`, `skills/ig-humanizer/references/scrub-rules.md`, `skills/ig-humanizer/references/audit-checklist.md`, `skills/ig-humanizer/sub-skills/post-audit.md`), sergebulaev/linkedin-skills @ c4447ea (`skills/linkedin-humanizer/SKILL.md`, `skills/linkedin-humanizer/references/scrub-rules.md`, `skills/linkedin-humanizer/references/audit-checklist.md`, `skills/linkedin-humanizer/sub-skills/post-audit.md`) and sergebulaev/facebook-skills @ f3fb266 (`skills/fb-humanizer/SKILL.md`, `skills/fb-humanizer/references/scrub-rules.md`, `skills/fb-humanizer/references/audit-checklist.md`, `skills/fb-humanizer/sub-skills/post-audit.md`); author Sergey Bulaev, MIT. Condensed and rewritten in AKILI's own words.

Two uses: a **scrub** pass that every draft goes through, and the **audit** checklist that the `review` mode applies without editing. The scrub removes the patterns readers react to; it does not try to defeat detectors.

## Basis and boundaries

- Upstream states that its tell taxonomy builds on Wikipedia's article *Signs of AI writing* (`https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing`, CC BY-SA). This file credits that source by name and URL and reproduces no wording, list or example from it; the rules below are AKILI's own phrasing of common editorial practice.
- Do not claim, in the text or in a report, that a rewrite passes a classifier. Short posts give classifiers too little to score, and light mechanical rewriting does not make text harder to detect. The reported result is the tells found and fixed.
- For page and article copy, use the longer word-and-phrase catalog in `.claude/skills/seo-audit/references/ai-writing-detection.md` (installed as `../../seo-audit/references/ai-writing-detection.md`). This file covers short social copy only; the two overlap on vocabulary and differ on length and register.

## Scrub: four passes

Judge by paragraph (or slide), not by word. Edits are proportional: a clean draft gets two or three touches, never a quota.

### 1. Scrub

**Forensic tier (always on).** Leakage no person types: tool-citation markers and placeholder blanks (`[Your Name]`), knowledge-cutoff disclaimers ("as of my last update"), and em dashes above the density cap in `voice-rules.md`.

**Strict tier (default on).** What readers react to:

| Class | Treatment |
|---|---|
| Density-scored vocabulary and grammar markers (nominalizations, sentence-opening "-ing" clauses) | Count per paragraph; at three, rewrite the paragraph; at one or two, leave it unless it is also a single-hit class |
| Model idiom ("quietly", "X matters.", "let that sink in", "built different") | Same density scoring |
| Reveal bridges and "Stop X, start Y" openers | Delete the bridge; the next sentence was the point |
| Negative parallelism ("it's not X, it's Y") | Rewrite as a plain statement of what is true |
| Stacked, perfectly parallel or hollow triples; any third triple | Keep one natural triple with concrete items |
| Dead phrases and dead closers | Replace with a landing or a specific ask |
| Emoji storms and signature runs | Cut to the platform limit |

### 2. Rhythm: a guard, not a tactic

Fix only a paragraph whose sentences all run the same length and read flat, and change one sentence. Never add variance on purpose: forced long-short alternation, one-word dramatic lines and "The X? Y." reveals are what humanizing tools leave behind. Layout (one idea per line) is not rhythm. Keep standalone fragments to two per draft.

### 3. Specifics

Where the facts exist in the brief, brand voice or the user's message, a draft should carry: one figure with a named referent, one named entity, one first-person concrete detail, and where the voice calls for candor, one dated, uncomfortable fact stated flat with no frame around it. If a slot has no fact, ask or leave it empty. Never add a hedge, a confession frame or a sincerity opener the author did not write: performed hesitancy is itself a tell.

### 4. Self-check (over-correction)

Re-read the result and answer:

- Did pass 2 create staccato stacks, reveal bridges, one-word lines or a seesaw?
- Did pass 3 add a framed confession or hedge?
- Did scrubbing flatten the voice: no reaction, no detail, every dash, triple and emoji gone from a voice that uses them, a casual lowercase register capitalized?

Any yes means dial back, not scrub harder. When unsure whether a pattern is the author's or a model's, leave it.

## Rules for the scrub

- Scrubbing is always in scope for a draft, including one the user wrote, one they like, and one they are in a hurry over. If a constraint forbids touching the text, say so and list each tell left in.
- Preserve the user's claim and meaning. "Preserve their voice" covers quirks (lowercase openers, `..` pauses, one dash, one natural triple), not reveal bridges, staccato stacks or a three-marker paragraph.
- Introduce no fact that was not in the input.
- Respect the container: do not turn slide text into one caption, or the reverse, without saying so.

## Audit checklist (`review` mode)

Read-only. The audit reports findings by blocker or warning and edits nothing; changes go through `post --revise`. Thresholds that belong to a platform (length, fold, hashtag count, media rules, `Limits check`) are read from that platform's file and are not repeated here.

### Blockers

- [ ] Em dashes at or under the density cap; no en dash between clauses, no double hyphen
- [ ] The hook finishes before the platform's fold
- [ ] Every platform hard limit holds (value and limit recorded)
- [ ] Hashtags and emoji within the platform file's sizing
- [ ] No engagement bait
- [ ] No scene-setter, reveal-bridge or sincerity-announcement opener
- [ ] No dead closer
- [ ] No paragraph with three or more vocabulary or grammar markers; no negative parallelism; no reveal bridge
- [ ] No invented specific: every figure, name and date traces to the brief, the brand voice or the user
- [ ] No brand-voice violation (*Always / Never*, off-limits subjects, named-entity limits)
- [ ] Copy is in the language the brand voice states, unless the request names another

### Warnings

- [ ] A figure with a referent where the claim allows one
- [ ] At least one named entity
- [ ] At most one natural triple; none stacked or hollow
- [ ] No staccato run, no more than two standalone fragments, no seesaw
- [ ] No hedging stack, no framed confession (a flat dated fact is fine)
- [ ] No machine-flat paragraph (flag that paragraph only)
- [ ] One CTA, with a reason
- [ ] When auditing a rewrite against its original: the author's tone, quirks and intentional emoji survived

### Result

| Findings | Result |
|---|---|
| Any blocker | FAIL: list each with the fix and the offending text |
| Warnings only | PASS with warnings: list each with a fix |
| None | PASS |

Report per paragraph: vocabulary markers, dashes per 100 words, fragments and triples. State the source of each hard-limit figure from the platform file. Do not estimate a detector score.
