# Proposal: Growth Angles (foundations → angles → approaches) for `/akili-marketing`

**Answer first:** add the business foundations (ideal customer, ideal follower, offer, message) to `brand-voice.md`, add one new `/akili-marketing angles` mode that writes an approved angles map (`docs/marketing/angles.md`, 4 angle types per pillar), and make `campaign` and `post` *select* one approved angle plus one of five approaches instead of generating ideas from scratch. Facts about the customer live in one place: the PRD when a constitution exists, `brand-voice.md` otherwise, and each side reads the other instead of asking twice. Name SEO + Marketing a **growth track** in the docs only — no new command, no figure redraw in this spec. Release as minor **2.38.0**.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/growth-angles` |
| Type | Change |
| Deliverable | software (methodology prompts, skill references, docs) |
| Approval Mode | gated |
| Requested by | Juan Carlos Cadavid (maintainer), 2026-10-28 |
| Source | Brief pasted in session: adopt the structure of Nico Azero's content method ("Así creo 6.480 reels con Claude en 3h"). The video URL was **not** fetched, by instruction; the method is taken only from the brief's summary |
| Source questions | Requirement source and visual source both supplied by the brief (no Jira, no Figma); process gates answered with the recommended option per the brief |
| Visual | None — prompt/docs change; figure change deferred (D-5) |
| Reference input | Private draft angle map supplied by the maintainer (outside the repo, not approved); read for structure only, nothing copied — see §8 *Grounding* |
| Depends on | none |
| Parallel-safe | yes with `methodology-mcp` (different files) — **except** the shared release slot: both may target 2.38.0 (D-7) and both may touch `CHANGELOG.md` `Unreleased` |
| Branch | `JuankCadavid/growth-angles` (worktree), local commits only |

## 2. Intent

Make AKILI's marketing drafts come from the business, not from the model. Today a post starts from a request and a pillar; the method being adopted starts from written foundations, derives a bounded set of angles per pillar, and lets the human pick angle, approach and hook at each stage.

## 3. Problem / Current Behavior

| # | Current behavior | Citation |
|---|---|---|
| C1 | `brand-voice.md` records voice, always/never, a two-line *Audience* (who the account is, who reads it), pillars, CTA, language, timezone, per-platform tone and a story bank. It has no pains/desires/context of the customer, no ideal follower distinct from the customer, no offer (result + what makes it unique) and no positioning/narrative | `.claude/skills/social-marketing/references/brand-voice-template.md:43-48` (Audience, Content pillars) and the full template block |
| C2 | `/akili-marketing` has six modes: `brand`, `campaign`, `calendar`, `post`, `review`, `repurpose` | `.claude/commands/akili-marketing.md:19-26`, `:81` ("list the six modes") |
| C3 | A plan slot's angle is a one-line free text taken "from the user, the brief or the brand voice's story bank first"; a slot without material is `needs input` | `.claude/skills/social-marketing/references/planning-and-calendar.md:39-40` |
| C4 | Pillars default to job-shaped categories (Educational / Story / Engagement / Promotion) unless `brand-voice.md` names them | `planning-and-calendar.md:7-20` |
| C5 | `post` drafts one copy per platform with one hook; there is no step offering hook candidates | `.claude/commands/akili-marketing.md:106-128` |
| C6 | The command states it runs outside the spec lifecycle and needs no `docs/specs/` read or write; it reads no PRD | `.claude/commands/akili-marketing.md:11`; no `prd` mention in the file (`grep -n -i prd` → none) |
| C7 | The PRD's required structure has nine sections; customers appear only as *Target Personas* (jobs-to-be-done); there is no objections or beliefs section | `.claude/commands/akili-constitution.md:183-193`, `:161` |
| C8 | `/akili-constitution` Step 2 asks for personas and business context; it reads no `docs/marketing/` or SEO artifact | `.claude/commands/akili-constitution.md:129-146` |
| C9 | `/akili-seo` already has an opt-in *Growth Strategy Addendum* (topic clusters, pillar pages) in its report | `.claude/commands/akili-seo.md:331-339` |
| C10 | Docs and figure present SEO and Marketing as two of seven unrelated "Anytime" commands; the figure has three lanes and tests pin them | `docs/flow.md:21`; `test/flow-figure-contract.test.js:37`, `:84-94` |
| C11 | The archived marketing proposal already anticipated seeding campaign ICP from the PRD, "referenced, not duplicated" — never built | `docs/specs/archive/2026-10-24-changes--akili-marketing/proposal.md:168` |

## 4. Proposed Outcome

1. **Foundations.** `brand` interviews (or reads from the PRD) five foundations: ideal customer (pains, desires, context), ideal follower, offer (result + what makes it unique), 2–4 thematic pillars, message (positioning, tone, narrative). Pillars and tone already exist and are reused, not duplicated.
2. **Angles map.** `/akili-marketing angles [<pillar>]` writes `docs/marketing/angles.md`: per pillar, four distinct lists — problems, desires, objections, beliefs — up to 9 each. Each angle is one line with its **source** (foundation field, PRD section, story bank, user message). No source → `needs input`, never invented. Each pillar section is `draft` until approved through the **existing** approval gate (shown in full, explicit words, snapshot; bulk approval only for what was shown).
3. **Selection, not mass generation.** `campaign` slots and `post` requests pick one approved angle (`<pillar>/<type>-<n>`) and one of five approaches — expert, bridge, differentiator, social proof, connection. The post header records both. `social proof` requires a real proof from the story bank or brief.
4. **Three hooks.** `post` offers three hook candidates from `hook-formulas.md` for the chosen angle; the user picks one; only the chosen hook reaches the card. Card fields and the approval gate are unchanged.
5. **Ask once.** When `docs/prd.md` exists, `brand` and `angles` pre-fill customer, offer, objections and beliefs from it (cited) and ask only for gaps; when `brand-voice.md` (`filled: yes`) exists, `/akili-constitution` Step 2 offers its foundations as proposed defaults, recorded as cited Assumptions.
6. **Growth track (docs).** README, `docs/overview.md`, `docs/flow.md` group `/akili-seo` and `/akili-marketing` as the growth track, with the data flow between them and the baseline in one table.

## 5. Scope

- `.claude/commands/akili-marketing.md`: `angles` mode (seventh), foundations in `brand`, angle/approach selection in `campaign` and `post`, three-hook step, PRD read, error rows, next steps.
- `.claude/skills/social-marketing/`: `brand-voice-template.md` gains the foundation sections; new `references/angles-framework.md` (angle types, the five approaches, sourcing rule, attribution); `planning-and-calendar.md` slot shape gains Angle + Approach; `SKILL.md` integration table gains the `angles` row.
- `.claude/commands/akili-constitution.md`: optional PRD section *Customer Objections & Beliefs* (filled only from user-supplied material; thin-seed rules apply) and one Step 2 bullet reading `brand-voice.md` foundations as cited defaults.
- Docs: `docs/commands/akili-marketing.md`, `docs/skills/social-marketing.md`, `docs/overview.md`, `docs/flow.md` (growth-track paragraph + artifacts row for `angles.md`), `docs/README.md`, README (one line at most; README stays short).
- Tests: extend the existing marketing contract tests (`test/akili-marketing-command.test.js`, `test/social-marketing-skill.test.js`, `test/akili-marketing-docs.test.js`; "six modes" assertions become seven).
- `CHANGELOG.md` `Unreleased` entry.

## 6. Non-Goals

- Mass generation: no mode produces the full 4 × 9 × 5 matrix of posts or a "6,480 pieces" batch; the map holds angles, the human picks.
- No new command (`/akili-growth` or similar), no move or rename of `/akili-seo` / `/akili-marketing`.
- No change to the Never-publish, Approval-gate, Write-boundary or Untrusted-content invariants; `angles` writes only under `docs/marketing/`.
- No fetch of the source video or any URL.
- No new platforms; no video/reel production beyond today's script-brief pointer.
- No SEO behavior change: `/akili-seo` neither reads nor writes `angles.md` in this spec (D-4).
- No redraw of `assets/akili-flow.svg`, `assets/akili-flow-animated.svg` or the PNG in this spec (D-5).
- No forced migration of existing `brand-voice.md` files: a file without the new sections stays valid.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Users of `/akili-marketing` | New mode; `brand` asks more (once); posts carry angle + approach |
| Users of `/akili-constitution` | Optional PRD section; one extra default source in Step 2 |
| `social-marketing` skill (adapted, MIT, Sergey Bulaev) | New AKILI-authored reference; adaptation credits preserved |
| Archived spec `changes/akili-marketing` | Its invariants are the contract this spec must not weaken |
| Tests | Marketing command/skill/docs contract suites; constitution tests if any pin the PRD section list |
| Parallel worktree `methodology-mcp` | Not touched; shares only the release slot and `CHANGELOG.md` |

## 8. Visual Reference

- Source: None
- Location: —
- Notes: prompt and documentation change; no UI. The flow figure is out of scope here (D-5).

### Grounding: a real map built with this method

The maintainer supplied a private, unapproved draft angle map built with this method for a real business (outside the repo, Spanish). It was read for **structure only**. None of its business content, names or wording enters the repo; any example shipped must be generic and in English. What it shows:

| Observation from the reference | Consequence for this spec |
|---|---|
| Opens with a `Voice:` line, status `draft`, date, language, timezone, the owner's request quoted, the method credited, and the internal sources listed as data | `angles.md` header reuses the existing artifact header shape plus a `Sources` list; sources are data under the untrusted-content rule |
| A "rules this map respects" block: no invented figures or testimonials, a never-name list, naming a client needs permission | Already owned by `brand-voice.md` *Always / Never* and story bank *Names* / *Off limits*: `angles.md` points to them, never restates them |
| IDs are `<pillar letter>-<type letter><n>` (types P, D, O, B), e.g. `E-P1`; angles are phrased in the customer's own words | Adopt the ID scheme; post headers and plan slots reference IDs |
| One small pillar holds 24 angles, not 36; another pillar is marked "proposed, to confirm" | Supports **up to 9** (D-2) and a per-pillar status including proposed pillars (D-3) |
| A business-specific table of the five approaches, each with example angle IDs; social proof limited to verifiable, permitted facts | `angles.md` carries an *Approaches applied* table; `social proof` needs a story-bank fact marked free to use |
| A formats table (format, who makes it, realistic capacity per week) | Optional *Formats and capacity* block in `angles.md`; capacity feeds the plan's cadence (user's number outranks the heuristic) |
| Ideas table per slot: pillar, angle (sometimes two), approach, format · who, **3 hooks**, idea, concrete result, CTA | Plan slots gain Angle (primary, optional secondary), Approach, and 3 hook candidates; `post` picks one (D-8) |
| Applying ideas to an approved plan sends the plan back to `draft` | Already the plan-gate rule (`.claude/commands/akili-marketing.md`, *Plan gate*); restate nothing, point to it |
| Ends with open questions for the owner | `angles` ends with an *Open questions* list; unanswered items stay `needs input` |
| Built while `brand-voice.md` was `filled: no` | `angles` runs the Step 0 brand voice check; with `filled: no` it offers `brand` first, else records `Voice: generic` and marks foundation-dependent angles `needs input` |
| ~330 lines for 132 angles plus ideas | One card per pillar keeps approval readable; ideas stay in the plan, not in `angles.md` |

## 9. Requirement Delta Preview

### ADDED Requirements

- `angles` mode writing `docs/marketing/angles.md`, per pillar: problems, desires, objections, beliefs (kept distinct; up to 9 each), each angle sourced or `needs input`; per-pillar `Status` under the existing approval gate.
- Foundation sections in `brand-voice.md`: *Ideal customer* (pains, desires, context), *Ideal follower*, *Offer* (result, what makes it unique), *Message* (positioning, narrative; tone points at the existing fingerprint).
- `references/angles-framework.md` defining angle types, the five approaches (expert, bridge, differentiator, social proof, connection) with a "do not use when" column, the sourcing rule and attribution.
- `post`: three hook candidates for the chosen angle, user picks one before the card.
- PRD optional section *Customer Objections & Beliefs*; `brand`/`angles` read it and Target Personas when `docs/prd.md` exists.
- Constitution Step 2: foundations from a `filled: yes` brand voice offered as cited defaults.
- Docs: growth-track grouping and the data-flow table.

### MODIFIED Requirements

- `campaign` plan slot: `angle` becomes `Angle` (approved angle ID or `needs input`) + `Approach`; campaigns and posts may reference only angles from an **approved** pillar section, else refuse and name the missing approval (same pattern as the plan gate).
- `brand`: interview covers the foundations; asks only fields the PRD does not already answer.
- Step 0.1: seven modes.
- Statement "no `docs/specs/` read or write is needed" stays true; the command gains a read of `docs/prd.md` (outside `docs/specs/`), stated explicitly.

### REMOVED Requirements

- None.

## 10. Approach Options

| | A. Marketing-only | B. Marketing + one-source-of-truth bridge (**recommended**) | C. Growth family command |
|---|---|---|---|
| What | `angles` mode + foundations + selection; no PRD/constitution link | A + PRD optional section + two-way "ask once" reads + growth track named in docs | A + B + new `/akili-growth` umbrella (or re-homing SEO/marketing), figure redrawn with a growth lane |
| Ask-twice problem | Unsolved: constitution and brand interview the same customer | Solved by reading, not copying | Solved |
| Files touched | ~8 | ~14 | ~25 + figure assets and figure tests |
| Risk | Low | Medium: constitution is the most-tested, longest command; bridge text must stay optional | High: new command (install targets, docs, tests), lane change breaks `flow-figure-*` contracts |
| Version | minor | minor | minor (major if commands are renamed) |

## 11. Recommended Approach

**Option B.** It delivers the method's core (foundations → angles → approaches → hooks, human approval per stage) and fixes the ask-twice gap the maintainer named, while reusing every existing gate. The bridge is read-only and optional in both directions: marketing reads the PRD; constitution reads the brand voice only as *defaults recorded as cited Assumptions* — a draft marketing file never becomes binding constitution (the thin-seed rule, `.claude/commands/akili-constitution.md:148`). The growth track is named where readers look (docs) without the cost of a new command or a figure redraw; that redraw can follow as its own patch spec once the track proves itself.

## 12. Risks, Dependencies, And Open Questions

### Risks

| Risk | Mitigation |
|---|---|
| Fixed "9 per type" pushes the model to pad with invented angles | "Up to 9", sourced-or-`needs input`, mirroring "never pad to reach a count" (`planning-and-calendar.md:24`) — D-2 |
| Draft marketing content leaks into the binding PRD | Constitution reads only `filled: yes`, records as cited Assumptions, user confirms in Step 9 |
| Restated rules drift (approval gate copied into `angles`) | `angles` points to `## Invariants`; phrase-family sweep per **KZ-changes--kaizen-loop-closure-2** |
| Requirement content dropped in shipping (seven-mode list, refusal rows) | Walk each FR term by term — **KZ-changes--gate-falsifiability-2**; budget tests per clause — **KZ-bugfix--init-ctrlc-abort-2** |
| CHANGELOG/doc summaries overstate shipped text | Quote-check at HEAD — **KZ-002** |
| Version and CHANGELOG collision with `methodology-mcp` | D-7 |
| Attribution of a third-party method | Credit by name and title in `angles-framework.md`; structure only, own words, no transcript — D-6 |

### Decisions for the maintainer

| ID | Decision | Recommended |
|---|---|---|
| D-1 | Option A, B or C | **B** |
| D-2 | Angles per type: exactly 9 or up to 9 | **Up to 9**, never padded |
| D-3 | Approval granularity for `angles.md`: per pillar section, or per angle | **Per pillar section** (one card per pillar, ≤ 36 lines) |
| D-4 | SEO ↔ angles link: none now; or `/akili-seo` Growth Strategy Addendum maps topic clusters to pillars | **None now**; docs note only; follow-up spec |
| D-5 | Flow figure: unchanged; or add a "growth" sub-group in the Anytime lane (both SVGs + PNG + figure tests) | **Unchanged here**; separate patch spec if wanted |
| D-6 | Attribution wording for Nico Azero's method (name, title, no link fetched) | "Structure adapted from Nico Azero's content method (video *Así creo 6.480 reels con Claude en 3h*); AKILI's own words" |
| D-7 | Release: this spec as 2.38.0 alone, or bundled with `methodology-mcp` in one minor | Whichever lands first takes 2.38.0; the other rebases its `Unreleased` notes |
| D-8 | Where the 3 hooks live: plan slot (candidates, as in the reference) or only in `post` | **Both**: plan slot lists 3 candidates, `post` confirms one; only the chosen hook reaches the card |
| D-9 | Shipped example: a generic English worked example of `angles.md` in `angles-framework.md`, or schema only | **Short generic example** (one pillar, a few angles per type, invented neutral business); never derived from the private reference |

### Open questions

- Should `angles` also seed from the story bank's *Positions* (beliefs) and *Scars* (objections), or only from foundations + PRD? Proposed: yes, as cited sources.
- Does any constitution test pin the nine PRD sections? Check at `/akili-specify` (premise to verify, not assumed).

## 13. Success Criteria

- `/akili-marketing angles` produces a per-pillar map whose every angle cites a source or reads `needs input`; no post can reference an angle from an unapproved pillar.
- On a project with `docs/prd.md` filled, `brand` asks no question the PRD already answers.
- Existing `brand-voice.md` files without the new sections still pass the brand-voice check.
- Every marketing invariant test still passes unchanged; seven-mode assertions are green.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass.

## 14. Next Step

```text
/akili-specify changes/growth-angles
```

Standard depth (Change track, software). Settle D-1 … D-9 at approval.
