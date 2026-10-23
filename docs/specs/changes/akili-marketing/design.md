# Design: `/akili-marketing` — draft-only social marketing ops (LinkedIn, Instagram, Facebook)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-marketing` |
| Depth | Standard |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | see `requirements.md` §1 — design gate resolved as **Review Design** (judgment-day) by user mandate, 2026-10-23 |
| Status | **JUDGMENT: APPROVED** (round 1 fixes + scoped re-judgment, `judgment.md`); Phase 2 gate resolved as Review Design → approved, by user mandate 2026-10-23 |
| Date | 2026-10-23 |
| Verified at | Rows carry their own commit (`b042b97` for repository reads — `4613043` and `dc4e2e1` differ from it only in this spec folder; upstream pins for upstream reads). Every reading was executed in this session and is quoted, except P-3 (read, not re-executed), P-1's host-side name resolution (not re-run; observed in T10 on Claude Code only), and the `UNVERIFIED` rows P-13, P-17 (KZ-changes--leader-brief-contract-2) |
| Scratch evidence | `$SCRATCH` = this session's scratchpad: `pkg/` (package copy at `b042b97` + stub `akili-marketing.md` + 4-file stub `social-marketing/`), `home/` (real `install --tool all` of `pkg/`), `gb/` (real `install --tool grokbot --target $SCRATCH/gb`) |
| Upstream clones | `/tmp/instagram-skills` @ `6a12448`, `/tmp/linkedin-skills` @ `c4447ea`, `/tmp/facebook-skills` @ `f3fb266` (untrusted downloads; only read) |
| Delegation | None — exploration inline |

## 2. Executive Summary

One new command file, one new skill directory (`SKILL.md`, `LICENSE`, 10 references — 12 files), two new test files, count updates in two existing tests (`install-cursor`, `diagram-design`), one regenerated fixture that turns a third (`install-grokbot`) green, and docs. **No installer, routing, template or dependency change.** The command owns the modes, the artifact formats and — stated once, in its `## Invariants` section — the approval gate, the never-publish rule, the write boundary and the untrusted-content rule. The skill owns the method (voice, hooks, humanizer, planning, per-platform rules), carries one standalone line (drafts only, never publishes, approval only in the user's own words — defined by `/akili-marketing`), and points to the command for the gate.

## 3. Architecture Overview

```text
/akili-marketing <mode> [args]                                  (anytime command, outside the spec lifecycle)
  │
  ├─ ## Invariants (stated once)  never publish · approval gate · write only docs/marketing/, no git write,
  │                              no source edit, no URL fetch · untrusted = data   [FR-2, FR-7, FR-8, FR-11, DD-3]
  ├─ Step 0  Setup ─ model checkpoint · load `social-marketing` + provenance check [FR-2, DD-8]
  │           read docs/marketing/brand-voice.md (filled?) → offer `brand` or mark Voice: generic [FR-3]
  │
  ├─ brand      → brand-voice.md                                                 [FR-3]
  ├─ campaign   → campaigns/<slug>/brief.md + plan.md ── PLAN GATE (Approve/Adjust/Stop; existing folder → show changes, ask) [FR-4]
  ├─ calendar   → <slug>: campaigns/<slug>/calendar.md · [<YYYY-MM>]: derived month view calendar-<YYYY-MM>.md (status read-only) [FR-5]
  ├─ post       → posts/<date>-<slug>[-N].md  (refuses if campaign plan not approved; never overwrites;
  │               `post --revise <file> [<platform>] <change>` is the only in-place edit — approved → draft;
  │               section per platform, humanizer pass, limits check)
  │               └─ APPROVAL CARD → stop → explicit approval? → section approved → copy-paste block
  │               └─ --published <file> <platform> <url> (user-supplied, https, host check, no fetch) → section published [FR-6…FR-9]
  ├─ review     → findings only, no edit                                          [FR-10]
  └─ repurpose  → new draft post files from pasted/local source (data, never fetched); refuses if the campaign plan is not approved [FR-4, FR-10, FR-11]

skill social-marketing/  SKILL.md (+ AKILI-SPECS Integration: mode → references)
                         references/: voice-rules · brand-voice-template · hook-formulas · humanizer ·
                                      untrusted-content · planning-and-calendar · repurposing ·
                                      instagram · linkedin · facebook
```

## 4. Extended Directory Structure

```text
.claude/commands/akili-marketing.md                  NEW  (FR-2…FR-11)
.claude/skills/social-marketing/SKILL.md             NEW  (FR-1)
.claude/skills/social-marketing/LICENSE              NEW  upstream MIT notice (FR-1)
.claude/skills/social-marketing/references/*.md      NEW  10 files (§7.2)
test/social-marketing-skill.test.js                  NEW  attribution, file set, stripped strings, install payload
test/akili-marketing-command.test.js                 NEW  text contract for FR-2…FR-11
test/install-cursor.test.js                          EDIT counts 12→13 commands, 27→28 dirs, 224→236 skill files, 236→249 shared-root files, 39→41 operations (P-6)
test/install-grokbot.test.js                         (goes green with the regenerated fixture; no edit expected — P-6)
test/diagram-design.test.js                          EDIT `/27 packaged skills/` → 28, same task as the docs/cli.md edit (P-6)
test/fixtures/doctor-codex-baseline.txt              EDIT two new OK lines (P-6)
docs/commands/akili-marketing.md                     NEW
docs/skills/social-marketing.md                      NEW
docs/skills/governance.md · docs/skills/README.md    EDIT core row
README.md · docs/README.md · docs/commands/README.md · docs/cli.md · docs/flow.md · AGENTS.md   EDIT (P-7, P-8; per-site decisions in §9.1)
CHANGELOG.md                                         EDIT Unreleased
```

Target-project layout the command writes (never in this repo):

```text
docs/marketing/brand-voice.md
docs/marketing/campaigns/<slug>/{brief,plan,calendar}.md
docs/marketing/calendar-<YYYY-MM>.md                 (month view across campaigns)
docs/marketing/posts/<YYYY-MM-DD>-<slug>.md
```

## 5. Data Model

### 5.1 `brand-voice.md`

Sections: *Status* (`filled: yes|no`, `source: interview|samples|template`, `updated: <date>`; any other or missing value reads as `filled: no`), *Voice fingerprint*, *Always / Never*, *Audience*, *Content pillars*, *CTA and primary link*, *Language*, *Timezone*, *Per-platform tone* (LinkedIn, Instagram, Facebook), *Signature examples*, *Story bank* (optional). Template lives in `references/brand-voice-template.md`; the command writes the filled copy.

### 5.2 Campaign files

Every campaign file opens with a `Voice:` line (`brand-voice.md` or `generic — no brand voice on file`) — FR-3.

- `brief.md`: goal, audience, platforms (subset of the three; others recorded "out of scope"), KPIs, start/end, offer, UTM scheme (`utm_source=<platform>&utm_medium=social&utm_campaign=<slug>`, editable), plan status (`draft` | `approved — <who>, <date>`, set only by the user's explicit words after the plan was shown — FR-4; any edit to `brief.md` goals/platforms/dates or to `plan.md` after approval sets it back to `draft` with a note; any other value reads as `draft`).
- `plan.md`: pillars, format mix per platform, numbered post list (`#`, working title, platform(s), format, target date, post file once drafted).
- `calendar.md`: table `Date | Time (<TZ>) | Platform | Format | Post file | Status` + a *Flags* list (same-platform same-slot collision; `missing` post file; unrecognized status shown raw; `UTC` used because no timezone is on file).
- `calendar-<YYYY-MM>.md` (marketing root): the same table across every campaign calendar and campaign-less post for that month — derived, fully regenerated on each run, never hand-edited; the campaign `calendar.md` stays the source for campaign rows.

### 5.3 Post file `posts/<YYYY-MM-DD>-<slug>.md`

File name `<YYYY-MM-DD>-<slug>.md`, suffixed `-2`, `-3` … on collision — `post` never overwrites (FR-6). Header: campaign (or `none`), target slot, voice (`brand-voice.md` or `generic — no brand voice on file`), language. A slot change resets every section (§5.4) and keeps the file name. One `## <Platform>` section per platform, each with:

| Field | Content |
|---|---|
| Status | `draft` \| `approved` \| `published` |
| Approval | `—` \| `approved — <who>, <YYYY-MM-DD>, "<approving message, quoted up to 200 chars>"` + **Approved snapshot** (the card fields verbatim as approved) \| reset note `reset to draft <date>: <what changed>` |
| Copy | fenced block, exactly what will be posted |
| Hashtags | per platform reference sizing |
| CTA | one |
| Alt text | one per image |
| Media brief | what the asset must show, format, aspect ratio |
| Image prompt | optional |
| Limits check | each hard limit: value / limit |
| Humanizer | pass result (tells found and fixed) |
| Published | `—` \| `<url>, <YYYY-MM-DD>` (+ `previously: <url>` after a correction) |

### 5.4 Status rule (every state the field can hold)

**Card fields** = every field that reaches the copy-paste block: Copy, Hashtags, CTA, Alt text, Media brief. Limits check, Humanizer and Image prompt are not posted and are not card fields.

| Section `Status` read | Action of any mode |
|---|---|
| `draft` | May be edited; may be shown on an approval card; `--published` refused, naming the missing approval |
| `approved`, card fields equal the Approved snapshot | Editing any card field, the platform or the slot sets `draft` + reset note; `--published` allowed |
| `approved`, card fields differ from the snapshot (e.g. a hand edit), or the Approval record or snapshot missing/malformed | Treated as `draft` for every transition; reported in one line; a writing mode (`post`, `repurpose`) records the reset (`Status: draft` + reset note); `calendar`, which never writes a status, shows `approved — invalid` with a flag |
| `published` | Read-only; `--published` again replaces the URL and keeps the previous one; any other change request creates a new post file |
| missing, empty, or any other value | Treated as `draft` for every transition; reported in one line; `calendar` shows the raw value with a flag |

### 5.5 Approval card

`## Approval card — <file>` → per section: platform, every card field verbatim (Copy, Hashtags, CTA, Alt text, Media brief), Limits check, current Status. Ends with the question naming the file and platform(s): approve this exact text, request changes, or stop. Approval accepted only per FR-7: explicit, after the card, naming or unambiguously answering the card; ambiguous reply → confirm; advance/bulk approval of unseen posts refused once with the reason. The quoted approving message must be a user message of this conversation; it is the only evidence of approval (residual risk: prompt-level, DD-5).

### 5.6 `--published`

Inputs from the user's own invoking message only. Refuse unless the section reads `approved` (§5.4). URL: scheme `https`; parsed host equals `linkedin.com` / `instagram.com` / `facebook.com` / `fb.com` for the named platform (Facebook accepts both) or ends with `.` + that domain; anything else refused naming the expected host. Never fetched.

## 6. API Design

None. The command calls no API (FR-8).

## 7. Backend Module Design

### 7.1 Command file structure (`.claude/commands/akili-marketing.md`, target ≤ ~280 lines — NFR-5)

Frontmatter (`name`, `description`, `license: MIT`, `metadata.author`) as `akili-seo.md:1-7` (P-14) → Usage → Arguments (modes table) → **`## Invariants`** (never publish, incl. available posting or image-generation tools and credentials; approval gate per §5.4–5.6 and FR-7's refusal list, outside every Approval Mode; write boundary — only `docs/marketing/`, no `git` write, no source edit, no URL fetch; untrusted content, repurpose sources included) → Step 0 Setup (model checkpoint: T1 Architect for `brand`/`campaign`/`post`/`repurpose`, T3 Auditor for `review`, T5 Fast-Cheap for `calendar`; load skill + provenance; brand voice check; one-time `docs/marketing/` unpublished-content / git-ignore note — proposal R7) → one `###` per mode → `--published` → Artifact formats (§5, compact) → Error handling (unknown mode, missing campaign, posting request, credential offered, injected instruction) → Next steps → Authorship.

### 7.2 Skill (`.claude/skills/social-marketing/`)

`SKILL.md` (≤ ~200 lines): frontmatter per FR-1; when-to-use; the standalone line (FR-1: drafts only, never publishes, approval only in the user's own words as `/akili-marketing` defines it); core pattern (brief → brand voice → draft native per platform → humanizer → card → human approval → copy-paste; **the gate itself is defined in `/akili-marketing` `## Invariants`, not here** — DD-3); voice rules summary; precedence (brand voice > platform reference > generic rules); `## AKILI-SPECS Integration` table: mode → references loaded.

| Reference | Adapted from (upstream @ pins) | Holds |
|---|---|---|
| `voice-rules.md` | `references/voice-rules.md` (IG, LI, FB); LI `references/precedence.md` | Shared voice rules; precedence |
| `brand-voice-template.md` | `references/voice-profile.md` (IG, LI, FB); LI `references/story-bank.md`; LI `skills/linkedin-interviewer` | §5.1 template + interview questions + AKILI fields (language, timezone, per-platform tone) |
| `hook-formulas.md` | `references/hook-formulas.md` (IG, LI, FB) | Shared formulas; per-platform fold notes point to platform files |
| `humanizer.md` | `skills/*-humanizer` + IG `scrub-rules.md`, `audit-checklist.md` | Condensed scrub rules + the `review` audit checklist, in AKILI's own words; credits Wikipedia's "Signs of AI writing" as upstream's basis and quotes no Wikipedia text (P-17); cross-links `seo-audit`'s page-content counterpart (P-12) |
| `untrusted-content.md` | `references/untrusted-content.md` (IG) | Rules 1–5 generalized; no tool- or env-var-specific text |
| `planning-and-calendar.md` | `skills/*-content-planner` + IG `pillars-framework.md`, `example-week.md` | Pillars, mix, cadence, calendar conflict rules |
| `repurposing.md` | `skills/*-repurposer` | Source → native post rules |
| `instagram.md` | IG `ig-caption-writer`, `ig-carousel-planner`, `references/hashtag-strategy.md`, `algorithm-heuristics.md`, `media-workflow.md` (limits only) | Hard limits (native-app surface), formats, fold, hashtags, timing heuristics — `lastVerified` |
| `linkedin.md` | LI `linkedin-post-writer`, `references/algorithm-heuristics.md`, `hook-formulas.md` (LI section) | Same shape |
| `facebook.md` | FB `fb-post-writer`, `references/algorithm-heuristics.md` | Same shape |

No reference carries publishing, API or scheduling instructions (proposal hand-off item dropped — judgment-day J-16: unverified facts and publishing vocabulary inside a never-publish skill). Dropped upstream material (recorded in T1's extraction map): all `lib/*.py`, `scripts/`, `.codex-marketplace/`, plugin manifests, `mcp-read-layer.md`, audience-insights, hook-extractor, profile/page optimizer (Q4), comment/reply/engagement drafters, thread monitor, employee advocacy, engager analytics, industry benchmarks, founder topics, every Publora/Pixfaro/Apify passage, *After a successful run* star request, *Acknowledgments*.

### 7.3 Provenance check (DD-8)

Step 0: the loaded `social-marketing` must carry `adapted-for: "AKILI-SPECS"`; otherwise the command names the resolved path, **stops**, and tells the user to run `akili install --force` themselves (running it would write outside the marketing root — FR-2). The field can be forged; the check catches an accidental foreign copy, not a hostile one.

## 8. Frontend / UX Component Architecture

No UI. The conversational surfaces are the plan gate (§5.2), the approval card (§5.5) and the copy-paste block.

## 9. Shared Contracts or Package Extensions

| Contract | Change |
|---|---|
| Packaged command set | +1 (`akili-marketing`) — consumers P-6, P-7, P-8; live path P-1 |
| Packaged skill set | +1 (`social-marketing`, `core`) — same consumers |
| `docs/specs/` carve-outs | Unchanged — output lives in `docs/marketing/` (P-4) |
| `docs/` generic readers | `/akili-constitution` step 8 reads product docs under `docs/` (P-16) — accepted: brand voice and briefs are legitimate product context; posts are drafts it may skim. No edit to the constitution |

### 9.1 Enumerating sites — per-site decision (P-8)

| Site | Decision |
|---|---|
| `README.md:65` capability sentence, `:69` capability table, `:98-99` command files, `:118` skills list, `:567` "Five anytime commands" → six, `:601-602` outputs table, `:813-815` command list, `:861-862` lifecycle bullets | Edit |
| `docs/commands/README.md:19-20`, `:36`, `:52-53` | Edit |
| `docs/README.md:36-40` | Edit (one line) |
| `docs/flow.md:157` artifacts table, `:294` anytime-command sections (new `### 2c`), `:466-470` core binding list (`social-marketing` in `/akili-marketing`) | Edit |
| `docs/cli.md:125, 191, 192, 203, 204, 225, 242` totals | Edit (13 / 28) |
| `docs/skills/README.md`, `docs/skills/governance.md` *Current assignment* | Edit (core row) |
| `AGENTS.md:62-63` *Skill Usage* | Edit (one line) |
| `README.md:49`, `docs/flow.md:7` figure alt text; `assets/akili-flow.png`, `assets/akili-flow.svg` | **Not edited** — the alt text describes the figure as drawn; known debt (DD-12) |
| `docs/openspec-comparison.md:29`, `docs/model-routing.md`, `.claude/templates/model-routing.section.md` | Not edited (DD-15, DD-9) |
| Model routing | Unchanged (DD-9) |

## 10. Design Decisions

| DD | Decision | Why / rejected alternative | Lesson |
|---|---|---|---|
| DD-1 | Draft-only command (proposal option A) | Approved 2026-10-23. Rejected: direct APIs (B), third-party scheduler (C) | — |
| DD-2 | **Adapt** three upstream repos into one skill with 10 references; T1 writes the extraction map before any content | Upstream is ~7.8k lines of `SKILL.md` + top-level references alone across 29 skills (P-11), with vendor paths in 46 places (P-10). Rejected: byte-faithful vendor (ships promotion and Python), three skills (governance *size*: one skill with `references/`) | — |
| DD-3 | Gate, never-publish, write boundary and untrusted rule are **stated once** in the command's `## Invariants`; the skill, docs and README point to it; the docs page's one gate sentence is pinned by a restatement test | A rule restated in several places drifts (KZ-changes--kaizen-loop-closure-2: restatement test with mutation checks closed the recurrence) | KZ-changes--kaizen-loop-closure-2 |
| DD-4 | Status lives per platform section | A two-platform post can be approved for one and not the other; one status would force approving both | — |
| DD-5 | Approval binds to the card fields (§5.4) and keeps an Approved snapshot; any edit, or a read-time mismatch with the snapshot, resets to `draft`; ambiguous, advance and unseen-bulk approvals refused | The only thing a human can approve is what they saw; the snapshot makes hand edits outside the command detectable on the next read. Residual: the agent writes the record, so the gate is prompt-level — the quote must be a user message of this conversation, and the dogfood run (T10) observes it. Rejected: a hash (needs a shell on every host) | — |
| DD-6 | The command runs outside any spec, has no Approval Mode, and its approval gate is never auto-passed | Publication is an outward-facing, irreversible act — the class AKILI says pre-approval never covers (P-5) | — |
| DD-7 | Output root fixed at `docs/marketing/` (Q1) | No command names it (P-4), so no carve-out list changes; the one generic `docs/` reader (P-16) is accepted (§9). Rejected: `docs/specs/marketing/` (would need every scanner's carve-out list edited — KZ-004) | KZ-004 |
| DD-8 | Provenance check on the loaded skill | Skip-existing installs keep a foreign copy of the same name in shared roots (same mechanism as `/akili-security` DD-8) | — |
| DD-9 | No model-routing row; the command's model checkpoint states its tiers | Template edit refuses existing fences (P-3) | — |
| DD-10 | Platform **hard limits** are verified by T4 against each platform's official documentation for the **native-app** posting surface (users post by hand), URL + date in the reference; API-only figures are not used; everything else is labelled `heuristic`; each platform file carries `lastVerified` | Upstream's figures are one author's 2026 claims, partly API-surface (carousel 2–10 via API vs 20 in-app) or sourced only from dropped Python (LinkedIn 3,000) — P-13 | — |
| DD-11 | Skill name `social-marketing` | Merged content has no single upstream name; upstream names stay in `metadata.source` | — |
| DD-12 | Enumerating sites edited per §9.1; `assets/akili-flow.png`, `assets/akili-flow.svg` and their alt text (`README.md:49`, `docs/flow.md:7`) are **not** changed — the alt text describes the image as drawn | Regenerating the figure is out of scope; recorded as known debt in CHANGELOG | KZ-002 (no claim beyond what ships) |
| DD-13 | Video requests get a script brief and a pointer to `video-production`; images get a prompt only | Non-goal: generation | — |
| DD-14 | Two new tests: skill test (`tdd`, red first) and command text-contract test (literal per clause, anchored to its section, each with a mutation check), both reading files through a CRLF-normalizing reader (`test/akili-security-command.test.js:25-27`); the restatement test also pins the skill's standalone line and the docs page's gate sentence. No shipped file — tests, docs, CHANGELOG — references `docs/specs/changes/akili-marketing/` | Product is agent-instruction text (precedent `test/akili-security-command.test.js:1-16`, P-14); test LOC budgeted per clause (KZ-bugfix--init-ctrlc-abort-2); the active spec path moves at archive (KZ-changes--archify-diagrams-1) | KZ-bugfix--init-ctrlc-abort-2, KZ-changes--archify-diagrams-1 |
| DD-16 | One `LICENSE` file carries the upstream notice for all three sources | The three upstream `LICENSE` files are byte-identical (P-18) | — |
| DD-15 | `AGENTS.md` *Skill Usage* gains one `social-marketing` line; `docs/openspec-comparison.md` is not edited | AGENTS lists every core skill with its command (`AGENTS.md:62-63`, P-8); the comparison page is a feature table with no per-command completeness claim | — |

**Reversion challenge (Step 2.3).** No DD removes, disables or inverts delivered behaviour — every change is additive (new files, count updates, list rows). Not run.

## 11. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Measure | Estimate | Basis |
|---|---|---|
| Tasks | **12** (T1, T2, T3, T4, T5, T6, T7, T8a, T8b, T8c, T9, T10) — amended at the tasks phase from 11: the docs task was split in three because its sites span a rules document (`AGENTS.md`) and more than ~8 sites (`/akili-specify` Step 3.2) | `tasks.md` |
| LOC authored | **~2,600** — shared references ~650 · platform references ~450 · `SKILL.md` + `LICENSE` ~200 · command ~280 · skill test ~150 · command test ~520 (≈ 37 clauses — `grep -cE "^- (THEN|BUT|AND)" requirements.md` → 30 at `06d71a3`, plus the scenario added after re-judgment, 4 FR-7 table rows and the FR-9 host rule — × ~14 lines incl. anchoring and mutation checks; precedent `test/akili-security-command.test.js` = 673 lines for a 187-line command) · counts/fixture ~30 · docs ~300 · CHANGELOG ~20 | §4, §7; KZ-bugfix--init-ctrlc-abort-2 |
| Review rounds | **17** — 2 × rules-text tasks (T2, T3, T4, T5, T8c — agent-read text) = 10 + 1 × others (T1, T6, T7, T8a, T8b, T9, T10) = 7 | Step 2.4 rules-document rule |

Depth check: Standard fits (no code path, additive). The LOC is mostly Markdown content. References are sized at ~1,100 lines against the proposal's ~1,000 target (NFR-5 states ~1,200). `/akili-execute` stops and escalates past **13 tasks, ~3,100 LOC, or 20 rounds**.

## 12. Premise Ledger

**Count:** 17 rows — 15 verified, 2 `UNVERIFIED` (1 High, 1 Low).
**Blast-radius triggers:** `live-path` (the design names the user action `/akili-marketing` → load `social-marketing`, on six install targets) — P-1, P-2; `shared-state` (the design adds files under `docs/`, a folder `/akili-constitution` reads generically) — P-16; `consumer` (the packaged command and skill sets are enumerated by tests, a fixture and docs; searched by count **and** by an existing member's name) — P-6, P-7, P-8.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | `/akili-marketing` reaches the command text on all six targets, and that text's skill load resolves `social-marketing` by name from the same host's skill root | live-path | Dispatch: host invocation → command file (`.claude/commands/`, `.config/opencode/commands/`, Antigravity workflow dirs) or command-as-skill `akili-marketing/SKILL.md` (Antigravity, Codex, Cursor, Grok Bot — `commandsAsSkills: true` at `bin/akili.js:183`, `:191`, `:202`, `:216`; re-judgment RA-1/RB-1) → Step 0 "load the `social-marketing` skill" → host skill root (same mechanism as `/akili-seo` naming `seo-audit`, `.claude/commands/akili-seo.md:215`). Enumeration: `bin/akili.js:504` (`entry.name.endsWith(".md")`). Executed: `HOME=$SCRATCH/home node bin/akili.js install --tool all` of `$SCRATCH/pkg` → exit 0, `akili-marketing` at `.claude/commands/`, `.config/opencode/commands/`, 3 Antigravity workflow dirs, 3 Antigravity skill dirs, `.agents/skills/akili-marketing/SKILL.md`; `--tool all` is the five desktop targets, not Grok Bot (`bin/akili.js` help: "\"all\" = all five desktop targets (not grokbot)"), so also `HOME=$SCRATCH/home3 node bin/akili.js install --tool grokbot --target $SCRATCH/gb` → exit 0, `gb/workflows/akili-marketing/SKILL.md` and `gb/workflows/social-marketing/SKILL.md` present. Host-side name resolution at runtime: not re-run (it is each host's behaviour, observed in T10 on Claude Code only) | `b042b97` | Installer task added (High) | — |
| P-2 | Skill directories are copied as trees into every skill root | location | `copyDirectoryContents` `bin/akili.js:907`; the `--tool all` install above: `social-marketing/SKILL.md` in `.agents`, `.claude`, `.config/opencode`, `.gemini/antigravity-cli`, `.gemini/config`, `.gemini` skill roots, `diff -r` source vs `.agents/skills/social-marketing` → identical; Grok Bot: `gb/workflows/social-marketing/` | `b042b97` | Installer task (High) | — |
| P-3 | Editing the routing section template makes `akili routing` refuse existing fences | other | `bin/routing.js:431-436` (old body compared with `expectedBody` rendered from the current template; mismatch without `--force` → `TOKEN_REFUSED_EDIT`) — **read, not re-executed this session**; executed 2026-10-18 in `changes/akili-security` design P-8 | `b042b97` | DD-9 could add the row (Low) | — |
| P-4 | No command or doc names `docs/marketing/`, and no command handles LinkedIn/Instagram content | existence | `grep -rn 'docs/marketing' . --include='*.md' --include='*.js' \| grep -v -E 'node_modules\|docs/specs/changes/akili-marketing' \| wc -l` → `0`; `grep -rln "LinkedIn\|Instagram" .claude/commands` → no file; `grep -rln "LinkedIn\|Instagram" .claude/skills` → `.claude/skills/ui-ux-pro-max/data/products.csv` only (product-category data, unrelated). **Corrected after judgment-day J-2** (the first draft reported "none" for both roots). Generic readers of `docs/` are P-16 | `b042b97` | DD-7 needs a reader scoping task (High) | — |
| P-5 | AKILI's pre-approval never covers irreversible actions | other | `.claude/commands/akili-propose.md:106` ("destructive or irreversible actions … always stop for the user regardless of mode") | `b042b97` | DD-6 reason changes; decision stands (Low) | — |
| P-6 | The tests that pin the packaged sets are exactly: three red on adding the files, one more red on the docs-count edit | consumer | `npm test` in `$SCRATCH/pkg` (Node 22.12.0): baseline `# tests 655 · pass 655`; with stubs `# pass 652 · fail 3` — `not ok 234` (`install-cursor.test.js`, "expected 224 packaged skill files … counted 228"), `not ok 244` (`install-cursor.test.js`, Codex doctor vs `test/fixtures/doctor-codex-baseline.txt`), `not ok 289` (`install-grokbot.test.js`, same fixture). Pinned counts: `install-cursor.test.js:228` (`12 + 224 = 236`), `:239` (`12 + 27 = 39`), `:247`, `:250` (`COMMAND_COUNT, 12`), `:341`, `:388`; fixture members `doctor-codex-baseline.txt:18` (`OK akili-security.md`), `:41` (`OK security-audit`). **Added after judgment-day J-1:** `grep -rnE '27 packaged' test/` → `test/diagram-design.test.js:416` (`assert.match(cli, /27 packaged skills/)` on `docs/cli.md`) — red once `docs/cli.md` says 28 | `b042b97` | More consumers in T6/T8b (Low) | — |
| P-7 | Docs state the 12/27 totals at exactly these sites | consumer | `grep -nE "\b(12\|27)\b" docs/cli.md README.md docs/README.md docs/commands/README.md docs/skills/README.md \| grep -iE "command\|skill"` → `docs/cli.md:125, 191, 192, 203, 204, 225, 242`; no hit in the other four files. Tests pinning those docs: P-6 (`diagram-design.test.js:416`) | `b042b97` | T8b list grows (Low) | — |
| P-8 | Lists that enumerate commands or core skills, found by existing members' names | consumer | `grep -rln 'akili-seo' . --include='*.md' --include='*.js' --include='*.json' --include='*.txt' --include='*.toml' --include='*.yml'` minus `node_modules`, `docs/specs/`, `.codegraph`, `CHANGELOG`, `releases/` → `README.md`, `AGENTS.md`, `docs/README.md`, `docs/flow.md`, `docs/cli.md`, `docs/model-routing.md`, `docs/openspec-comparison.md`, `docs/commands/README.md`, `docs/commands/akili-seo.md`, `docs/skills/{README,seo-audit,systematic-debugging}.md`, `.claude/templates/model-routing.section.md`, test files, the fixture, seo-owned skill files. **Widened after judgment-day J-20:** `grep -c akili-security assets/akili-flow.svg` → `4`; `docs/flow.md:466-470` core-binding list (names `seo-audit` in `/akili-seo`); `README.md:65` ("Three capabilities sit beside the core spec loop"). Per-site decisions: §9.1 | `b042b97` | T8a/T8b list grows (Low) | — |
| P-9 | All three upstreams are MIT, "Copyright (c) 2026 Sergey Bulaev" | other | `head -3 LICENSE` in each clone → `MIT License` / `Copyright (c) 2026 Sergey Bulaev`; `gh api repos/sergebulaev/{instagram,linkedin,facebook}-skills --jq .license.spdx_id` → `MIT` | `6a12448` / `c4447ea` / `f3fb266` | Licence task / proposal reopens (High) | — |
| P-10 | Vendor references to strip: Publora mentions IG 20, LI 14, FB 12 in `skills/` + `references/` | data-env | `grep -ric publora skills references \| awk -F: '{s+=$2} END {print s}'` per clone → `20`, `14`, `12` | same pins | Strip effort differs (Low) | — |
| P-11 | Upstream source size on one basis: `cat skills/*/SKILL.md references/*.md \| wc -l` → IG 2,244 · LI 3,436 · FB 2,096 (= 7,776), plus per-skill `references/` and IG `lib/*.py` not counted | data-env | That command, run in each clone. **Corrected after judgment-day J-14** (the first draft summed three different bases) | same pins | NFR-5 size targets revisited (Low) | — |
| P-12 | `seo-audit` already ships an AI-writing-tells reference for page content | existence | `.claude/skills/seo-audit/references/ai-writing-detection.md:1-3` | `b042b97` | `humanizer.md` cross-link dropped; scope unchanged (Low) | — |
| P-13 | Platform hard limits for **native-app** posting (caption/post length per platform, carousel item counts, hashtag caps) are current | data-env | `UNVERIFIED — confirm at source before relying on it`. Only secondary claims exist: IG caption 2,200 (`/tmp/instagram-skills/lib/approval.py:27`, corrected from `:28` after J-17); carousel "2-10 (API; the native app allows 20)" (IG `SKILL.md` *Known gotchas*); LinkedIn 3,000 has no primary source upstream: `grep -rnE "3,?000" /tmp/linkedin-skills` → 11 hits in 7 files, all in material not adapted — `.codex-marketplace/…/*.py`, `tests/*.py`, `tests/fixtures/publora_platform_limits.json:9` (`"standard": 3000`) — or unrelated (`references/mcp-read-layer.md:122`, a read-limit cap) (re-judgment RA-2/RB-2) | — | Wrong limits in `instagram.md`/`linkedin.md`/`facebook.md` → posts rejected (High) | T4 first step (owner T4): each limit against the platform's official help/docs for the native posting surface, URL + date recorded |
| P-14 | Command frontmatter shape and text-contract test precedent exist | other | `.claude/commands/akili-seo.md:1-7` (`name`, `description`, `license: MIT`, `metadata.author`); `test/akili-security-command.test.js:1-40` (literal-per-obligation, anchored `block()` helper; CRLF-normalizing `read()` at `:25-27`) | `b042b97` | T5/T7 shape changes (Low) | — |
| P-16 | `/akili-constitution` reads product docs anywhere under `docs/`, so it may read `docs/marketing/` | shared-state | `.claude/commands/akili-constitution.md:99` ("Any architecture, infrastructure, setup, or product docs already present under `docs/`"); the only other generic `docs/` mention in commands is `:35` (`grep -nE '\`docs/\`' .claude/commands/*.md`) | `b042b97` | — the read is accepted (§9); if constitution must not read drafts, a carve-out task is added (Low) | — |
| P-17 | Upstream humanizers draw on Wikipedia's "Signs of AI writing" (CC BY-SA) but do not reproduce its text, so adapting them carries no share-alike obligation | other | `UNVERIFIED — confirm at source before relying on it`. Basis named at `/tmp/instagram-skills/skills/ig-humanizer/SKILL.md:9-10`; `grep -rln Wikipedia` over the three `skills/` trees → 6 files (IG, FB humanizer `SKILL.md`; LI humanizer `SKILL.md`, `references/tier-rationale.md`, `references/rules-explainer.md`, `sub-skills/rules-explainer.md`) | — | `humanizer.md` must avoid any verbatim passage and credit the source (already the design — §7.2); T2 adjusts (Low) | T1 (owner T1): compare the cited passages with the Wikipedia page; record verbatim overlap, if any, in the extraction map |
| P-18 | The three upstream `LICENSE` files are byte-identical | other | `diff /tmp/instagram-skills/LICENSE /tmp/linkedin-skills/LICENSE && diff /tmp/instagram-skills/LICENSE /tmp/facebook-skills/LICENSE` → no output, exit 0 | same pins | DD-16: three notices needed (Low) | — |

P-15 (no deployed `.agents/` in this repo) was removed after judgment-day J-18: it fails the dependence test — no design decision depends on it. The execute-time persona check it pointed to is recorded in `tasks.md` Document Control.
