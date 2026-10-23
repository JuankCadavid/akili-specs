# Design: `/akili-marketing` — draft-only social marketing ops (LinkedIn, Instagram, Facebook)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-marketing` |
| Depth | Standard |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | see `requirements.md` §1 — design gate resolved as **Review Design** (judgment-day) by user mandate, 2026-10-23 |
| Status | Draft — under judgment-day |
| Date | 2026-10-23 |
| Verified at | `4613043` — every Premise Ledger reading was executed in this session and is quoted (KZ-changes--leader-brief-contract-2) |
| Scratch evidence | `$SCRATCH` = this session's scratchpad: `pkg/` (package copy at `b042b97` + stub `akili-marketing.md` + 4-file stub `social-marketing/`), `home/` (real `install --tool all` of `pkg/`) |
| Upstream clones | `/tmp/instagram-skills` @ `6a12448`, `/tmp/linkedin-skills` @ `c4447ea`, `/tmp/facebook-skills` @ `f3fb266` (untrusted downloads; only read) |
| Delegation | None — exploration inline |

## 2. Executive Summary

One new command file, one new skill directory (`SKILL.md`, `LICENSE`, 10 references), two new test files, count/fixture updates in two existing tests and one fixture, and docs. **No installer, routing, template or dependency change.** The command owns the modes, the artifact formats and — stated once, in its `## Invariants` section — the approval gate, the never-publish rule, the write boundary and the untrusted-content rule. The skill owns the method (voice, hooks, humanizer, planning, per-platform rules) and points to the command for the gate.

## 3. Architecture Overview

```text
/akili-marketing <mode> [args]                                  (anytime command, outside the spec lifecycle)
  │
  ├─ ## Invariants (stated once)  never publish · approval gate · write only docs/marketing/ · untrusted = data
  │                                                                          [FR-2, FR-7, FR-8, FR-11, DD-3]
  ├─ Step 0  Setup ─ model checkpoint · load `social-marketing` + provenance check [FR-2, DD-8]
  │           read docs/marketing/brand-voice.md (filled?) → offer `brand` or mark Voice: generic [FR-3]
  │
  ├─ brand      → brand-voice.md                                                 [FR-3]
  ├─ campaign   → campaigns/<slug>/brief.md + plan.md ── PLAN GATE (Approve/Adjust/Stop) [FR-4]
  ├─ calendar   → campaigns/<slug>/calendar.md | calendar-<YYYY-MM>.md (status read-only) [FR-5]
  ├─ post       → posts/<date>-<slug>.md  (section per platform, humanizer pass, limits check)
  │               └─ APPROVAL CARD → stop → explicit approval? → section approved → copy-paste block
  │               └─ --published <file> <platform> <url> → section published     [FR-6, FR-7, FR-8, FR-9]
  ├─ review     → findings only, no edit                                          [FR-10]
  └─ repurpose  → new draft post files                                            [FR-10]

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
test/install-cursor.test.js                          EDIT counts 12→13 commands, 27→28 dirs, 224→224+N files (P-6)
test/fixtures/doctor-codex-baseline.txt              EDIT two new OK lines (P-6)
docs/commands/akili-marketing.md                     NEW
docs/skills/social-marketing.md                      NEW
docs/skills/governance.md · docs/skills/README.md    EDIT core row
README.md · docs/README.md · docs/commands/README.md · docs/cli.md · AGENTS.md   EDIT (P-7, P-8)
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

Sections: *Status* (`filled: yes|no`, `source: interview|samples|template`, `updated: <date>`), *Voice fingerprint*, *Always / Never*, *Audience*, *Content pillars*, *CTA and primary link*, *Language*, *Timezone*, *Per-platform tone* (LinkedIn, Instagram, Facebook), *Signature examples*, *Story bank* (optional). Template lives in `references/brand-voice-template.md`; the command writes the filled copy.

### 5.2 Campaign files

- `brief.md`: goal, audience, platforms (subset of the three; others recorded "out of scope"), KPIs, start/end, offer, UTM scheme (`utm_source=<platform>&utm_medium=social&utm_campaign=<slug>`, editable), plan status (`draft|approved (<who>, <date>)`).
- `plan.md`: pillars, format mix per platform, numbered post list (`#`, working title, platform(s), format, target date).
- `calendar.md`: table `Date | Time (<TZ>) | Platform | Format | Post file | Status` + a *Flags* list (same-platform same-slot collision; missing post file; unrecognized status).

### 5.3 Post file `posts/<YYYY-MM-DD>-<slug>.md`

Header: campaign (or `none`), target slot, voice (`brand-voice.md` or `generic — no brand voice on file`), language. One `## <Platform>` section per platform, each with:

| Field | Content |
|---|---|
| Status | `draft` \| `approved` \| `published` |
| Approval | `—` \| `approved — <who>, <YYYY-MM-DD>, "<quoted approving message>"` \| reset note `reset to draft <date>: <what changed>` |
| Copy | fenced block, exactly what will be posted |
| Hashtags | per platform reference sizing |
| CTA | one |
| Alt text | one per image |
| Media brief | what the asset must show, format, aspect ratio |
| Image prompt | optional |
| Limits check | each hard limit: value / limit |
| Humanizer | pass result (tells found and fixed) |
| Published | `—` \| `<url>, <YYYY-MM-DD>` |

### 5.4 Status rule (every state the field can hold)

| Section `Status` read | Action of any mode |
|---|---|
| `draft` | May be edited; may be shown on an approval card |
| `approved` | Editing any of Copy, Hashtags, CTA, platform or slot sets `draft` + reset note; `--published` allowed |
| `published` | Read-only; a change request creates a new post file |
| missing, empty, or any other value (incl. a hand-written `approved` with no Approval record) | Treated as `draft`; reported in one line |

### 5.5 Approval card

`## Approval card — <file>` → per section: platform, the Copy block verbatim, Limits check, Media brief, current Status. Ends with the question naming the file and platform(s): approve this exact text, request changes, or stop. Approval accepted only per FR-7: explicit, after the card, naming or unambiguously answering the card; ambiguous reply → confirm; advance/bulk approval of unseen posts refused once with the reason.

## 6. API Design

None. The command calls no API (FR-8).

## 7. Backend Module Design

### 7.1 Command file structure (`.claude/commands/akili-marketing.md`, target ≤ ~280 lines — NFR-5)

Frontmatter (`name`, `description`, `license: MIT`, `metadata.author`) as `akili-seo.md:1-7` (P-14) → Usage → Arguments (modes table) → **`## Invariants`** (never publish incl. available posting tools and credentials; approval gate per §5.4–5.5 and FR-7's refusal list, outside every Approval Mode; write boundary; untrusted content) → Step 0 Setup (model checkpoint: T1 Architect for `brand`/`campaign`/`post`/`repurpose`, T5 Fast-Cheap for `calendar`; load skill + provenance; brand voice check) → one `###` per mode → `--published` → Artifact formats (§5, compact) → Error handling (unknown mode, missing campaign, posting request, credential offered, injected instruction) → Next steps → Authorship.

### 7.2 Skill (`.claude/skills/social-marketing/`)

`SKILL.md` (≤ ~200 lines): frontmatter per FR-1; when-to-use; core pattern (brief → brand voice → draft native per platform → humanizer → card → human approval → copy-paste; **the gate itself is defined in `/akili-marketing` `## Invariants`, not here** — DD-3); voice rules summary; precedence (brand voice > platform reference > generic rules); `## AKILI-SPECS Integration` table: mode → references loaded.

| Reference | Adapted from (upstream @ pins) | Holds |
|---|---|---|
| `voice-rules.md` | `references/voice-rules.md` (IG, LI, FB); LI `references/precedence.md` | Shared voice rules; precedence |
| `brand-voice-template.md` | `references/voice-profile.md` (IG, LI, FB); LI `references/story-bank.md`; LI `skills/linkedin-interviewer` | §5.1 template + interview questions + AKILI fields (language, timezone, per-platform tone) |
| `hook-formulas.md` | `references/hook-formulas.md` (IG, LI, FB) | Shared formulas; per-platform fold notes point to platform files |
| `humanizer.md` | `skills/*-humanizer` + IG `scrub-rules.md`, `audit-checklist.md` | Condensed scrub rules + the `review` audit checklist |
| `untrusted-content.md` | `references/untrusted-content.md` (IG) | Rules 1–5 generalized; no tool- or env-var-specific text |
| `planning-and-calendar.md` | `skills/*-content-planner` + IG `pillars-framework.md`, `example-week.md` | Pillars, mix, cadence, calendar conflict rules |
| `repurposing.md` | `skills/*-repurposer` | Source → native post rules |
| `instagram.md` | IG `ig-caption-writer`, `ig-carousel-planner`, `references/hashtag-strategy.md`, `algorithm-heuristics.md`, `media-workflow.md` (limits only) | Hard limits, formats, fold, hashtags, timing heuristics, *Publishing notes* — `lastVerified` |
| `linkedin.md` | LI `linkedin-post-writer`, `references/algorithm-heuristics.md`, `hook-formulas.md` (LI section) | Same shape |
| `facebook.md` | FB `fb-post-writer`, `references/algorithm-heuristics.md` | Same shape |

Dropped upstream material (recorded in T1's extraction map): all `lib/*.py`, `scripts/`, `.codex-marketplace/`, plugin manifests, `mcp-read-layer.md`, audience-insights, hook-extractor, profile/page optimizer (Q4), comment/reply/engagement drafters, thread monitor, employee advocacy, engager analytics, industry benchmarks, founder topics, every Publora/Pixfaro/Apify passage, *After a successful run* star request, *Acknowledgments*.

### 7.3 Provenance check (DD-8)

Step 0: the loaded `social-marketing` must carry `adapted-for: "AKILI-SPECS"`; otherwise name the resolved path, offer continue-with-that-copy or `akili install --force`.

## 8. Frontend / UX Component Architecture

No UI. The conversational surfaces are the plan gate (§5.2), the approval card (§5.5) and the copy-paste block.

## 9. Shared Contracts or Package Extensions

| Contract | Change |
|---|---|
| Packaged command set | +1 (`akili-marketing`) — consumers P-6, P-7, P-8 |
| Packaged skill set | +1 (`social-marketing`, `core`) — same consumers |
| `docs/specs/` carve-outs | Unchanged — output lives in `docs/marketing/` (P-4) |
| Model routing | Unchanged (DD-9) |

## 10. Design Decisions

| DD | Decision | Why / rejected alternative | Lesson |
|---|---|---|---|
| DD-1 | Draft-only command (proposal option A) | Approved 2026-10-23. Rejected: direct APIs (B), third-party scheduler (C) | — |
| DD-2 | **Adapt** three upstream repos into one skill with 10 references; T1 writes the extraction map before any content | Upstream is ~10.5k lines of SKILL+refs across 29 skills (P-11), with vendor paths in 46 places (P-10). Rejected: byte-faithful vendor (ships promotion and Python), three skills (governance *size*: one skill with `references/`) | — |
| DD-3 | Gate, never-publish, write boundary and untrusted rule are **stated once** in the command's `## Invariants`; the skill, docs and README point to it; the docs page's one gate sentence is pinned by a restatement test | A rule restated in several places drifts (KZ-changes--kaizen-loop-closure-2: restatement test with mutation checks closed the recurrence) | KZ-changes--kaizen-loop-closure-2 |
| DD-4 | Status lives per platform section | A two-platform post can be approved for one and not the other; one status would force approving both | — |
| DD-5 | Approval binds to the exact text on the card; any edit resets; ambiguous, advance and unseen-bulk approvals refused | The only thing a human can approve is what they saw. Hand edits made by the user outside the command are the user's own act and are not detected (documented in the docs page) | — |
| DD-6 | The command runs outside any spec, has no Approval Mode, and its approval gate is never auto-passed | Publication is an outward-facing, irreversible act — the class AKILI says pre-approval never covers (P-5) | — |
| DD-7 | Output root fixed at `docs/marketing/` (Q1) | No reader exists (P-4), so no carve-out list changes. Rejected: `docs/specs/marketing/` (would need every scanner's carve-out list edited — KZ-004) | KZ-004 |
| DD-8 | Provenance check on the loaded skill | Skip-existing installs keep a foreign copy of the same name in shared roots (same mechanism as `/akili-security` DD-8) | — |
| DD-9 | No model-routing row; the command's model checkpoint states its tiers | Template edit refuses existing fences (P-3) | — |
| DD-10 | Platform **hard limits** are verified by T4 against each platform's official documentation (URL + date in the reference); everything else is labelled `heuristic`; each platform file carries `lastVerified` | Upstream's figures are one author's 2026 claims; a wrong hard limit produces a rejected post (P-13) | — |
| DD-11 | Skill name `social-marketing` | Merged content has no single upstream name; upstream names stay in `metadata.source` | — |
| DD-12 | README line 567 ("Five anytime commands") and lists are updated; `assets/akili-flow.png` and its alt text (`README.md:49`, `docs/flow.md:7`) are **not** changed — the alt text describes the image as drawn | Regenerating the figure is out of scope; recorded as known debt in CHANGELOG | KZ-002 (no claim beyond what ships) |
| DD-13 | Video requests get a script brief and a pointer to `video-production`; images get a prompt only | Non-goal: generation | — |
| DD-14 | Two new tests: skill test (`tdd`, red first) and command text-contract test (literal per clause, anchored to its section, each with a mutation check) | Product is agent-instruction text (precedent `test/akili-security-command.test.js:1-16`, P-14); test LOC budgeted per clause (KZ-bugfix--init-ctrlc-abort-2) | KZ-bugfix--init-ctrlc-abort-2 |
| DD-15 | `AGENTS.md` *Skill Usage* gains one `social-marketing` line; `docs/openspec-comparison.md` is not edited | AGENTS lists every core skill with its command (`AGENTS.md:62-63`, P-8); the comparison page is a feature table with no per-command completeness claim | — |

**Reversion challenge (Step 2.3).** No DD removes, disables or inverts delivered behaviour — every change is additive (new files, count updates, list rows). Not run.

## 11. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Measure | Estimate | Basis |
|---|---|---|
| Tasks | **11** (T1, T2, T3, T4, T5, T6, T7, T8a, T8b, T9, T10) | `tasks.md` |
| LOC authored | **~2,250** — shared references ~650 · platform references ~450 · `SKILL.md` + `LICENSE` ~200 · command ~280 · skill test ~120 · command test ~280 · counts/fixture ~25 · docs ~230 · CHANGELOG ~20 | §4, §7 |
| Review rounds | **16** — 2 × rules-text tasks (T2, T3, T4, T5, T8b — agent-read text) = 10 + 1 × others (T1, T6, T7, T8a, T9, T10) = 6 | Step 2.4 rules-document rule |

Depth check: Standard fits (no code path, additive). The LOC is mostly Markdown content. `/akili-execute` stops and escalates past **12 tasks, ~2,700 LOC, or 19 rounds**.

## 12. Premise Ledger

**Count:** 15 rows — 14 verified, 1 `UNVERIFIED` (1 High, 0 Low).
**Blast-radius triggers:** `live-path` (the design names the user action `/akili-marketing` → load skill on every host) — P-1, P-2; `consumer` (the packaged command and skill sets are enumerated by tests, a fixture and docs; searched by count **and** by an existing member's name) — P-6, P-7, P-8. `shared-state`: none apply — the design changes no state, service or lifecycle another component reads; `docs/marketing/` has no reader (P-4).

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | Commands install by enumerating `*.md` in `.claude/commands/` on every host | live-path | `bin/akili.js:504` (`entry.name.endsWith(".md")`); real `HOME=$SCRATCH/home node bin/akili.js install --tool all` of `$SCRATCH/pkg` → exit 0, `akili-marketing` present at `.claude/commands/`, `.config/opencode/commands/`, 3 Antigravity workflow dirs, 3 Antigravity skill dirs, `.agents/skills/akili-marketing/SKILL.md` (`find . -path '*akili-marketing*'`) | `b042b97` | Installer task added (High) | — |
| P-2 | Skill directories are copied as trees into all six skill roots | location | `copyDirectoryContents` `bin/akili.js:907`; same install: `social-marketing/SKILL.md` in `.agents`, `.claude`, `.config/opencode`, `.gemini/antigravity-cli`, `.gemini/config`, `.gemini` skill roots; `diff -r` source vs `.agents/skills/social-marketing` → identical | `b042b97` | Installer task (High) | — |
| P-3 | Editing the routing section template makes `akili routing` refuse existing fences | other | `bin/routing.js:431-436` (old body compared with `expectedBody` rendered from the current template; mismatch without `--force` → `TOKEN_REFUSED_EDIT`) — read, not re-executed this session; executed 2026-10-18 in `changes/akili-security` design P-8 | `b042b97` | DD-9 could add the row (Low) | — |
| P-4 | Nothing in the package reads or writes `docs/marketing/` | existence | `grep -rn 'docs/marketing' . --include='*.md' --include='*.js' \| grep -v -E 'node_modules\|docs/specs/changes/akili-marketing' \| wc -l` → `0` (alternate names: `marketing/` appears in no command — `grep -rln "LinkedIn\|Instagram" .claude/commands .claude/skills` → none) | `b042b97` | DD-7 needs a reader scoping task (High) | — |
| P-5 | AKILI's pre-approval never covers irreversible actions | other | `.claude/commands/akili-propose.md:106` ("destructive or irreversible actions … always stop for the user regardless of mode") | `b042b97` | DD-6 reason changes; decision stands (Low) | — |
| P-6 | Adding one command and one skill turns exactly three tests red | consumer | `npm test` in `$SCRATCH/pkg` (Node 22.12.0): baseline `# tests 655 · pass 655`; with stubs `# pass 652 · fail 3` — `not ok 234` (`install-cursor.test.js`, "expected 224 packaged skill files … counted 228"), `not ok 244` (`install-cursor.test.js`, Codex doctor vs `test/fixtures/doctor-codex-baseline.txt`), `not ok 289` (`install-grokbot.test.js`, same fixture). Further pinned counts read: `install-cursor.test.js:228` (`12 + 224 = 236`), `:239` (`12 + 27 = 39`), `:247`, `:250` (`COMMAND_COUNT, 12`), `:341`, `:388`; fixture lists members (`doctor-codex-baseline.txt:18` `OK akili-security.md`, `:41` `OK security-audit`) | `b042b97` | More consumers in T6 (Low) | — |
| P-7 | Docs state the 12/27 totals at exactly these sites | consumer | `grep -nE "\b(12\|27)\b" docs/cli.md README.md docs/README.md docs/commands/README.md docs/skills/README.md \| grep -iE "command\|skill"` → `docs/cli.md:125, 191, 192, 203, 204, 225, 242`; no hit in the other four files | `b042b97` | T8b list grows (Low) | — |
| P-8 | Lists that enumerate commands or core skills, found by an existing member's name | consumer | `grep -rln 'akili-seo' . --include='*.md' --include='*.js' --include='*.json' --include='*.txt' --include='*.toml' --include='*.yml'` minus `node_modules`, `docs/specs/`, `.codegraph`, `CHANGELOG`, `releases/` → `README.md`, `AGENTS.md`, `docs/README.md`, `docs/flow.md`, `docs/cli.md`, `docs/model-routing.md`, `docs/openspec-comparison.md`, `docs/commands/README.md`, `docs/commands/akili-seo.md`, `docs/skills/{README,seo-audit,systematic-debugging}.md`, `.claude/templates/model-routing.section.md`, test files, the fixture, and seo-owned skill files. Enumerating sites: `README.md:49` (figure alt), `:69`, `:98-99`, `:118`, `:567`, `:601-602`, `:813-815`, `:861-862`; `docs/commands/README.md:19-20, 36, 52-53`; `docs/README.md:36-40`; `docs/flow.md:7` (figure alt), `:294` (`### 2b` anytime-command section); `docs/skills/README.md:35-36` (rows); `AGENTS.md:62-63` | `b042b97` | T8a/T8b list grows (Low) | — |
| P-9 | All three upstreams are MIT, "Copyright (c) 2026 Sergey Bulaev" | other | `head -3 LICENSE` in each clone → `MIT License` / `Copyright (c) 2026 Sergey Bulaev`; `gh api repos/sergebulaev/{instagram,linkedin,facebook}-skills --jq .license.spdx_id` → `MIT` | `6a12448` / `c4447ea` / `f3fb266` | Licence task / proposal reopens (High) | — |
| P-10 | Vendor references to strip: Publora mentions IG 20, LI 14, FB 12 in `skills/` + `references/` | data-env | `grep -ric publora skills references \| awk -F: '{s+=$2} END {print s}'` per clone → `20`, `14`, `12` | same pins | Strip effort differs (Low) | — |
| P-11 | Upstream size: IG `skills/*/SKILL.md` + `references/` + `lib/*.py` + skill references ≈ 5,024 lines; LI SKILL + refs 3,436; FB 2,096 | data-env | `wc -l` as run in each clone | same pins | Size targets (NFR-5) revisited (Low) | — |
| P-12 | `seo-audit` already ships an AI-writing-tells reference for page content | existence | `.claude/skills/seo-audit/references/ai-writing-detection.md:1-3` | `b042b97` | `humanizer.md` could reuse it; scope unchanged (Low) | — |
| P-13 | Platform hard limits (e.g. Instagram caption 2,200 chars — upstream `lib/approval.py:28`; LinkedIn and Facebook post lengths; carousel item counts; hashtag caps) are current | data-env | `UNVERIFIED — confirm at source before relying on it` (the only citation is upstream's secondary claim) | — | Wrong limits in `instagram.md`/`linkedin.md`/`facebook.md` → posts rejected (High) | T4 first step (owner T4): each limit against the platform's official docs, URL + date recorded |
| P-14 | Command frontmatter shape and text-contract test precedent exist | other | `.claude/commands/akili-seo.md:1-7` (`name`, `description`, `license: MIT`, `metadata.author`); `test/akili-security-command.test.js:1-40` (literal-per-obligation, anchored `block()` helper) | `b042b97` | T5/T7 shape changes (Low) | — |
| P-15 | This repo has no deployed `.agents/` personas | data-env | `ls .agents` → `No such file or directory` | `b042b97` | — | `/akili-execute` Step 0 (owner: the executing session): `akili doctor --agents` / persona deploy before the first spawn (KZ-changes--persona-upgrade-1) — (Low) |

P-15's citation is verified; its *Settled by* names the execute-time action it triggers, not an open fact.
