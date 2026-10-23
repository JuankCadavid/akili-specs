# Proposal — `/akili-marketing`: draft-only social marketing ops (LinkedIn, Instagram, Facebook)

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-marketing` |
| Slug | `akili-marketing` — derived from free-text argument (the request named the command `/akili-marketing`) |
| Type | **Change** |
| Deliverable | `software` (a command prompt + a packaged skill; the *outputs* it produces for users are marketing documents — copies, plans, calendars — noted here as the deliverable kind of the command, not of this spec) |
| Approval Mode | gated (the user asked to stop at the propose gate) |
| Date | 2026-10-23 |
| Author | AKILI session (proposer) |
| Status | **Draft — awaiting decision** (Juan Carlos Cadavid) |
| Related | `/akili-seo` (domain-command precedent, GA4 Phase 2B), `/akili-security` (vendored-skill precedent), `docs/skills/governance.md` |
| Upstream sources (reviewed) | `sergebulaev/instagram-skills` @ `6a124481d0ebe9b6d3ac1323ed2a2abc40c7e1d7` (2026-10-15, cloned and read); `sergebulaev/linkedin-skills` @ `c4447ead7723aa0b65bbfb5d9281784b20dce75a` (2026-10-22) and `sergebulaev/facebook-skills` @ `f3fb266c0b984cf5e9e9e3a6a57021373f3ced68` (2026-10-15) — license and skill list read via `gh api`, contents **not yet read** (specify Phase 1 reads them) |
| Depends on | none |
| Parallel-safe | **no** — adds a command (13th) and a skill, so it edits the `test/install-cursor.test.js` count assertions, `docs/skills/governance.md`, README and CHANGELOG shared with any spec that adds a command or skill |
| Worktree / release | `akili-marketing` worktree only; local `[SPEC:changes/akili-marketing]` commits; **no push, no release, no npm publish** in this cycle |

## Answer first — the decisions this proposal asks you to make

**Feasibility verdict: YES, implementable — in draft-only scope (option A).** Publishing by API (B) is feasible technically but not as a reusable, model-agnostic methodology command: it needs per-company app registration, platform app review and secret handling that AKILI cannot ship. Third-party publishing (C) is feasible but makes a commercial service a dependency. Both stay out of v1; A leaves a clean hand-off point for them.

| # | Decision | Recommendation | One-line reason |
|---|---|---|---|
| D1 | Publishing scope | **A — draft-only** (copies, plans, calendar, media briefs, image prompts; the human publishes) | Zero credentials, zero ToS exposure, works in all six install targets; "never publish without OK" is guaranteed structurally, not by a prompt |
| D2 | Approval gate | Every draft carries `Status: draft → approved (<who>, <date>) → published (<url>, <date>)`; `approved` is set **only by the user's own words in the conversation**, and **pre-approved mode never auto-passes it** (classed with the exception gates) | The gate must survive `Approval Mode: pre-approved`; a mark the agent can self-set is not a gate |
| D3 | Skill packaging | **One new packaged skill `social-marketing`, adapted (not vendored verbatim)** from the three MIT repos, with per-platform `references/` | Upstream IG alone is ~8.6k lines incl. a Codex mirror and Python lib; AKILI needs the voice/hook/humanizer/planning knowledge, not the publish clients |
| D4 | Skill binding | **`core`** (hard-wired to `/akili-marketing`) | The command is wrong without it (governance *core* rule) |
| D5 | Where outputs live | `docs/marketing/` in the target project (`brand-voice.md`, `campaigns/<slug>/{brief,plan,calendar}.md`, `posts/<date>-<slug>.md`) — **not** `docs/specs/` | Marketing content is not a spec; keeps the spec scanners' carve-out list untouched |
| D6 | Platforms in v1 | **LinkedIn, Instagram, Facebook** (as requested); X/Threads/TikTok/YouTube are non-goals | Bounded scope; the reference structure makes adding one later a `references/` file |
| D7 | Command shape | One command, **modes**: `brand`, `campaign`, `post`, `calendar`, `review` (humanizer audit), `repurpose` | Mirrors `/akili-seo`'s phased command; one entry point is easier to discover than six commands |
| D8 | Model routing row | **Defer** (same as `/akili-security`): no edit to `model-routing.section.md`; the command's model checkpoint states its tier | Editing that template makes `akili routing` refuse existing fences — the open template-evolution bug (`CHANGELOG.md:121`) |
| D9 | Release class | **minor** (new command) | Semver discipline: new command = minor |

## Intent

Give AKILI projects a disciplined way to **operate a company's social marketing** — campaign planning, post requests, platform-native copies, and a content calendar for LinkedIn, Instagram and Facebook — with the same properties the rest of AKILI has: a reviewable artifact per step, a written brand voice instead of re-explaining it every session, and a human approval gate that no automation can bypass.

## Problem / Current Behavior

- AKILI ships 12 commands and none covers marketing content — `ls .claude/commands | wc -l` → `12` (as run 2026-10-23); `grep -rln "LinkedIn\|Instagram\|Meta" .claude/commands .claude/skills` returns no file (as run 2026-10-23).
- The nearest command, `/akili-seo`, audits and fixes **pages** for search; its optional Phase 2B reads GA4/Clarity (`.claude/commands/akili-seo.md`, `### Phase 2B: Analytics & Conversion (optional)`). It produces no social copy, plan or calendar.
- `product-manager-toolkit` covers go-to-market strategy at PRD level (its description: "…discovery frameworks, and go-to-market strategies"), not post-level copy or scheduling.
- Today a user asking an AKILI agent for "a week of LinkedIn posts" gets free-form output: no stored voice, no platform constraints (IG 125-char fold, 3–5 sized hashtags, LinkedIn's "see more" fold), no AI-tell scrub, no approval record, no calendar artifact.

## Upstream review (what the reference actually is)

Read from the clone at `/tmp/instagram-skills` @ `6a12448`.

| Aspect | Finding | Source |
|---|---|---|
| License | MIT, "Copyright (c) 2026 Sergey Bulaev"; LinkedIn and Facebook siblings also MIT | `LICENSE:1-3`; `gh api repos/sergebulaev/{linkedin,facebook}-skills --jq .license.spdx_id` → `MIT` |
| Skills | 9 `ig-*` skills (caption-writer, carousel-planner, content-planner, hashtag-strategist, hook-extractor, humanizer, profile-optimizer, repurposer, audience-insights); LinkedIn has 12, Facebook 8 | `ls skills/`; `gh api …/contents/skills` |
| Size | `skills/*/SKILL.md` + `references/` + `lib/*.py` ≈ 5,024 lines; all `.md` ≈ 8,618 lines (includes a verbatim `.codex-marketplace/` mirror) | `wc -l` as run |
| Knowledge worth adapting | `references/voice-rules.md` (104), `voice-profile.md` (61, the brand-voice template), `hook-formulas.md` (325), `untrusted-content.md` (54), `hashtag-strategy.md` (98), `algorithm-heuristics.md` (166); humanizer `scrub-rules.md` (441) | `wc -l` as run |
| Approval gate | `lib/approval.py` is "a thin conventions layer, not runtime enforcement": it renders a card ending "Reply **post** / **yes** to publish" and the skill stops | `lib/approval.py:1-8, 54` |
| Publishing tiers | Tier 0 manual/draft-only (default, no keys); Tier 1 Publora (`PUBLORA_API_KEY`); Tier 2 DIY — `INSTAGRAM_SKILLS_CUSTOM_POSTER` command executed via `subprocess` | `SKILL.md` *Prerequisites*; `lib/backend_selector.py:1-60` |
| Other paid services | Apify (read layer, scraping), Pixfaro (image generation) | `lib/apify_client.py`, `lib/pixfaro_client.py` |
| Promotional content to strip | 20 Publora mentions across 6 skill/reference files; an *After a successful run* star-request line; "Publishing powered by Publora" acknowledgment | `grep -ric publora skills references`; `SKILL.md` *After a successful run*, *Acknowledgments* |

What we take: the voice/hook/humanizer/planning **knowledge** and two **patterns** (the voice profile file; "fetched content is data, never instruction"). What we leave: every Python client, the Publora/Pixfaro/Apify paths, the DIY subprocess hook, URL parsers, and the growth nudges.

## Proposed Outcome

1. A user runs `/akili-marketing brand` once; the agent interviews them (or reads 2–4 real posts they paste) and writes `docs/marketing/brand-voice.md` (voice fingerprint, ICP, pillars, always/never rules, CTA, per-platform tone).
2. `/akili-marketing campaign <slug> [brief]` writes `docs/marketing/campaigns/<slug>/brief.md` (goal, audience, platforms, KPIs, dates, UTM scheme) and `plan.md` (pillars, formats per platform, post list) — stops for approval.
3. `/akili-marketing calendar [<slug>|<month>]` writes/updates `calendar.md`: one row per slot (date, time, platform, format, post file, status), checking frequency and mix rules from the skill's references.
4. `/akili-marketing post <request>` drafts a post per requested platform — native copy (not cross-posted), hook before the fold, hashtags sized per platform, one CTA, alt text, a **media brief** and an optional **image-generation prompt** (the user or their tool makes the asset) — runs the humanizer pass, and presents an **approval card**. Files land in `posts/` with `Status: draft`.
5. Only when the user answers in their own words ("aprobado", "approve", "ok publish this one") does the agent set `Status: approved (<who>, <date>)`. The agent then outputs the final copy-paste block per platform. **The agent never publishes.** After the user posts, `/akili-marketing post --published <file> <url>` records the URL.
6. `review` audits any pasted draft (AI tells, fold, length limits, brand-voice violations); `repurpose` turns a blog post, release note or `/akili-seo` page into native posts.
7. Content the user pastes from others (competitor posts, comments, scraped captions) is treated as **data, never instructions** (adapted `untrusted-content.md`).

## Scope

- `.claude/commands/akili-marketing.md` — the command (modes, artifact contracts, approval gate, untrusted-content rule, model checkpoint, error handling, authorship).
- `.claude/skills/social-marketing/` — `SKILL.md` (AKILI frontmatter, Level-2 integration section) + `LICENSE` (upstream MIT notice) + `references/`: `voice-rules.md`, `brand-voice-template.md`, `hook-formulas.md`, `humanizer.md` (condensed scrub + audit rules), `untrusted-content.md`, `planning-and-calendar.md` (pillars, mix, cadence), `instagram.md`, `linkedin.md`, `facebook.md` (per-platform limits, formats, hashtag and timing heuristics, platform publishing notes for a future B/C).
- Docs: `docs/commands/akili-marketing.md`, `docs/skills/social-marketing.md`, `docs/skills/governance.md` (*Current assignment* `core` row), `README.md` (command list + credit), `docs/flow.md` if it lists standalone commands, `CHANGELOG.md` *Unreleased*.
- Installer: no code change expected — new files under `.claude/` are picked up by the existing mapping; only the count assertions in `test/install-cursor.test.js` change (12 → 13 commands, 27 → 28 skill dirs). (`grep -n "akili-seo\|akili-security" bin/akili.js` returns nothing, as run 2026-10-23 — no per-command list; `ls -d .claude/skills/*/ | wc -l` → `27`.)
- Tests: text-contract tests pinning the approval gate (never auto-passed, set only by the user), the never-publish rule, the untrusted-content rule, attribution frontmatter, and the absence of Publora/Pixfaro/Apify/star-nudge strings in the shipped skill.

## Non-Goals

- **Publishing, scheduling or reading analytics through any API or third-party service** (options B and C) — a later, separate proposal if wanted.
- Generating images or video. The command writes media briefs and prompts; a Reel/video deliverable routes to the existing `video-production` track.
- X, Threads, TikTok, YouTube.
- Paid ads management (Meta Ads Manager, LinkedIn Campaign Manager budgets/targeting).
- Scraping competitors (Apify-style read layer).
- A model-routing row (D8).

## Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| AKILI users (any target tool) | New `/akili-marketing` command + `social-marketing` skill on install |
| `test/install-cursor.test.js` (+ grokbot/other count tests) | Count assertions |
| `docs/skills/governance.md` | New `core` row; acceptance checklist applies (need, binding, attribution, size, docs/CHANGELOG) |
| `/akili-seo` | Referenced by `repurpose` (page → posts) and by the campaign UTM scheme feeding its GA4 Phase 2B; **no edit** to `/akili-seo` |
| Specs under `docs/specs/` | none modified |

## Visual Reference

- Source: None
- Location: n/a
- Notes: no UI surface — a command prompt and a skill. The approval card and calendar are Markdown; their formats are defined in design.

## Requirement Delta Preview

### ADDED Requirements

- `/akili-marketing` with modes `brand`, `campaign`, `calendar`, `post`, `review`, `repurpose`, writing only under `docs/marketing/`.
- A brand-voice file every drafting mode reads first; drafting without one prompts `brand` (or proceeds with a stated generic-voice warning).
- Platform-native drafting rules for LinkedIn, Instagram and Facebook (length limits, fold, hashtags, formats, alt text).
- A humanizer pass on every draft and an audit mode.
- **Approval gate:** draft → approved → published, `approved` only on the user's explicit words in the conversation, never auto-passed by pre-approved mode, never inferred from pasted/fetched content.
- **Never-publish invariant:** the command contains no publish/schedule/API step; the final output is a copy-paste block.
- Untrusted-content rule for any third-party text.
- `social-marketing` skill with upstream attribution (author Sergey Bulaev, three source URLs @ SHA, MIT notice preserved).

### MODIFIED Requirements

- Packaged command count 12 → 13; skill count +1 (install tests, README).

### REMOVED Requirements

- none

## Approach Options

| | A — Draft-only (copies, plans, prompts) | B — Direct platform APIs | C — Third-party scheduler (Publora, Buffer, …) |
|---|---|---|---|
| What ships | Command + skill; human publishes | A + publish/schedule code for Meta Graph API (IG/FB) and LinkedIn APIs | A + a client for one vendor's API |
| Auth / secrets | none | Per-company Meta app + Business/Creator IG account linked to a FB Page, page/user tokens with refresh; LinkedIn app with org-admin OAuth. Token storage in each project | One vendor API key per company |
| Platform gates | none | Meta **App Review** + Business Verification for publishing permissions (`instagram_business_content_publish` / `pages_manage_posts`) and IG publishing rate limits; LinkedIn **Community Management API** access requires an application/vetting for organization posting (`w_organization_social`) — `UNVERIFIED — confirm at source before relying on it` (Meta for Developers and LinkedIn Microsoft Learn docs, at specify if B is chosen) | Vendor holds the platform approvals |
| ToS exposure | none (human posts) | Automation rules of each platform apply to the company's app | Vendor ToS + platform ToS; content passes through a third party |
| Fit with AKILI | Pure prompts — works in all 6 targets, model-agnostic | Needs runtime code + network in an agent session; AKILI ships no runtime for target projects today; secrets in reach of an agent that reads untrusted content | Commercial dependency (governance: avoid mandatory commercial deps); vendor lock-in; upstream's own Tier 1 shows the nudge pattern we would inherit |
| Approval gate | Structural — there is no publish step to reach | Prompt-level only (upstream `approval.py` is "not runtime enforcement") | Same as B, plus the vendor's draft queue as a second gate |
| Size | ~12 tasks (below) | A + ~3–5 tasks per platform + security review | A + ~3 tasks |
| Verdict | **Recommended** | Feasible per-company, not as a packaged methodology step — revisit as a project-level integration | Optional later, opt-in only, never default |

**Hybrid kept open:** A's final copy-paste block can also be written as a CSV/JSON export a scheduler can import (Meta Business Suite / Buffer bulk import) — still human-gated, no credentials. Proposed as open question Q2, not in scope by default.

### Pros and cons of the recommended option (A)

| Pros | Cons |
|---|---|
| No credentials, app review, or platform ToS for AKILI or the user | The human still copies, attaches media and posts — no automation of the last step |
| "Never publish without OK" holds by construction | No performance feedback loop (reach, saves) unless the user pastes metrics |
| Stays model- and tool-agnostic (six install targets) | Platform heuristics (algorithm, hashtags, timing) age fast; references need a `lastVerified` and refresh with releases |
| Brand voice + calendar become versioned, reviewable artifacts in the repo | Marketing teams may not work in a git repo; the artifacts are Markdown, not a SaaS calendar |
| Reuses a well-structured MIT knowledge base with clear attribution | Adapting three repos into one skill is editorial work (budgeted) and loses upstream's per-skill granularity |

## Recommended Approach

**Option A**, as one command + one `core` skill, with these adaptation rules:

1. **Adapt, do not vendor.** Merge the platform-agnostic knowledge (voice rules, hook formulas, humanizer, untrusted content, planning) into shared references; put platform limits/formats/heuristics into `instagram.md`, `linkedin.md`, `facebook.md`. Strip all Publora/Pixfaro/Apify paths, Python, the DIY subprocess hook, star nudges and acknowledgments. Size target: `SKILL.md` ≤ ~200 lines, references ≤ ~1,000 lines total (governance *size* check).
2. **Attribution.** Skill frontmatter `license: MIT`, `metadata.author: "Sergey Bulaev"`, `metadata.source:` the three repo URLs @ SHA, `adapted-by: "Juan Carlos Cadavid — jcadavid.com"`, `adapted-for: "AKILI-SPECS"`, `binding: core`; `LICENSE` in the skill directory carrying the upstream copyright and permission notice; a per-reference "Adapted from …" line; credit in `docs/skills/social-marketing.md` and README. MIT → MIT, compatible with akili-specs (MIT); the only obligation is preserving the notice, which the `LICENSE` copy satisfies.
3. **Gate wording** borrows upstream's approval card, but the agent's own approval prompt names the exact file and platform, and the command states the gate is outside pre-approved mode (matches the AKILI rule "pre-approval covers routine progress, never exceptions": publication is outward-facing and irreversible).
4. **Hand-off for B/C later:** each per-platform reference ends with a short "Publishing notes" section (account type needed, API family, review requirement) marked `lastVerified`, so a future spec starts from recorded facts.

### Relationship to existing skills

| Skill | Relationship |
|---|---|
| `cognitive-doc-design` | Governs the **documents** (brief, plan, calendar, reports); **not** the post copy, whose voice comes from `brand-voice.md` + `social-marketing` voice rules |
| `product-manager-toolkit` | Campaign goals/ICP can be seeded from the PRD and its GTM frameworks; RICE/MoSCoW to prioritize campaign ideas — referenced, not duplicated |
| `seo-audit` / `/akili-seo` | `repurpose` turns audited pages into posts; campaign UTM scheme lines up with `/akili-seo` Phase 2B GA4 reading. No edit to either |
| `brainstorming` | Used in `campaign` to clarify goal and audience |
| `video-production` | Reels/video requests route there (`Deliverable: video`); `/akili-marketing` only writes the script brief |
| `stitch-design` / `frontend-design` | Optional for visual briefs (carousel slide layout); conditional mention only |
| `caveman` | Not applicable (no multi-agent harness here) |

### Scope and budget

| Task (preview) | Est. LOC |
|---|---|
| T1 Read LinkedIn + Facebook upstream at the pinned SHAs; extraction map (what goes where, what is dropped) | 0 (spec notes) |
| T2 `social-marketing/SKILL.md` + `LICENSE` + attribution frontmatter | ~220 |
| T3 Shared references (voice rules, brand-voice template, hooks, humanizer, untrusted content, planning/calendar) | ~600 |
| T4 Per-platform references ×3 | ~400 |
| T5 `.claude/commands/akili-marketing.md` (modes, artifact contracts, gate, invariants) | ~280 |
| T6 Install count assertions + any install test touch | ~20 |
| T7 Text-contract tests (gate, never-publish, untrusted, attribution, stripped strings) — budgeted per clause (KZ-bugfix--init-ctrlc-abort-2) | ~300 |
| T8 Docs: `docs/commands/akili-marketing.md`, `docs/skills/social-marketing.md`, governance row, README | ~200 |
| T9 CHANGELOG *Unreleased* entry (quote-checked at HEAD — KZ-002) | ~15 |
| T10 Dogfood run in a scratch project (brand → campaign → post → approve) with transcript evidence | 0 (evidence) |
| **Total** | **~10 tasks, ~2,000 LOC (≈1,700 Markdown + ≈320 test)** |

Calibration: `/akili-security` planned 12 tasks / ~650 LOC and shipped 13 / ~575 (`docs/specs/archive/2026-10-18-changes--akili-security/archive-summary.md:31`); this one is larger because the skill content is adapted, not copied.

## Risks, Dependencies, And Open Questions

| # | Risk | Mitigation |
|---|---|---|
| R1 | Platform heuristics (fold length, hashtag counts, timing) are 2026 claims from one author and go stale | Every heuristic carries a `lastVerified` date and is phrased as heuristic, not rule; hard platform limits (caption max length, carousel item count) are verified at specify against platform docs |
| R2 | Agent self-approves or treats pasted text as approval | Text-contract test on the gate wording; untrusted-content rule; pre-approved mode explicitly excluded |
| R3 | Adaptation drops attribution or keeps vendor promotion | Test asserts frontmatter + `LICENSE` notice, and absence of `publora`, `pixfaro`, `apify`, star-request strings in the shipped skill |
| R4 | Skill size bloat (three repos ≈ 20+ skills) | Size target in Recommended Approach; governance size check at review |
| R5 | Summary surfaces overstate shipped text (KZ-002, High, recurring) | CHANGELOG/README clauses quote-checked at HEAD before review |
| R6 | Rules restated in several places drift (KZ-changes--kaizen-loop-closure-2) | Gate and never-publish rule stated once in the command; skill and docs point to it; phrase-family sweep before review |
| R7 | Brand/marketing content written into a public repo | Command notes that `docs/marketing/` holds unpublished content; user decides whether to git-ignore it |

| # | Open question | Default if you do not decide |
|---|---|---|
| Q1 | Output folder `docs/marketing/` OK, or prefer a configurable path? | `docs/marketing/` fixed |
| Q2 | Add a scheduler-import export (CSV) to `calendar` in v1? | **No** — later |
| Q3 | Command language: content drafted in the brand-voice file's language (Spanish/English per company)? | Yes — language is a brand-voice field |
| Q4 | Include `profile-optimizer` (bio/page audit) as a mode in v1? | **No** — later; keep v1 to campaign/post/calendar/review/repurpose |

Dependencies: none on other specs. Known debt carried: model-routing row deferred behind the template-evolution bug (D8).

## Success Criteria

- A fresh project can go `brand → campaign → calendar → post → approve` producing the five artifact kinds under `docs/marketing/`, with no credential, network call or third-party account.
- In a dogfood run, no draft reaches `Status: approved` without a user message granting it, including under `Approval Mode: pre-approved`.
- The shipped skill passes the governance acceptance checklist and carries the upstream MIT notice and author.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green; install dry-run lists the new command and skill for all six targets.

## Next Step

```text
/akili-specify changes/akili-marketing
```

Change track, standard depth (Video Mode does not apply).
