# Requirements: `/akili-seo` optional analytics phase — GA4 + Microsoft Clarity

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/seo-analytics` |
| Depth | **Standard**: rules text for an existing command and skill, plus one new reference file and one text-contract test. No installer or runtime code |
| Type | Change |
| Deliverable | software |
| Approval Mode | `gated`: one pause per specify phase (user, 2026-10-21: "Detente en los gates") |
| Status | **Phase 1 approved** 2026-10-22 (Juan Carlos Cadavid): requirements as written, D-1 approved; the Clarity consent-enforcement fact stays a premise to confirm (design P-9) |
| Date | 2026-10-21 |
| Proposal | `proposal.md`, **Approved** 2026-10-21 (Juan Carlos Cadavid): option A, Q1–Q8 take the recommended answers |
| Format source | `docs/specs/archive/2026-10-19-changes--akili-security-followup/`. This repo has no `docs/specs/general-setup/` (`ls docs/specs/general-setup` → `No such file or directory`, as run 2026-10-21 at `9f27fe2`) |
| Deviation from proposal (**approved** 2026-10-22) | **D-1:** the proposal said analytics findings "never outrank blocking crawl/index fixes". This spec puts them in their own **Measurement & Compliance** group in the Remediation Plan instead (FR-12). A consent violation is a legal exposure, not an SEO priority, so ranking it on the SEO scale would either bury it or let it displace a crawl fix |
| Release | **Minor**: new optional behavior in an existing command. Recorded only; **no release, push or publish in this cycle** |

## 2. Executive Summary

`/akili-seo` gains an **optional Phase 2B**. It is asked once at Phase 0 and skipped with a note when declined, absent or inaccessible. When it runs, it:

- audits **how** GA4 and Clarity are installed: tag, consent under Ley 1581 + GDPR + Consent Mode v2, key events for form and WhatsApp, the GA4 ↔ Search Console link, Clarity masking, and loading cost;
- audits **what** their data shows, using the same Issue / Impact / Evidence / Fix / Priority findings;
- **crosses** Search Console queries and pages with GA4 conversions per landing page.

One rule is hard: behavior metrics serve conversion and UX findings and never ranking findings. The method lives in a new `seo-audit/references/analytics.md`, which uses GEO's `[PRIMARY]` / `[INDUSTRY]` source tiers.

## 3. Glossary

| Term | Meaning |
|---|---|
| Phase 2B | The new optional analytics phase of `/akili-seo`, after Step 2.8 (GEO) and before Phase 3 (report) |
| Installation audit | Checks of what the site loads and sends (tag, consent, events, masking, loading). Needs a rendering browser, not API access |
| Data audit | Checks of what GA4 and Clarity have recorded. Needs API access |
| Key event | GA4's name for what it called a "conversion" before 2024 (Data API metric `keyEvents`, Admin API resource `properties.keyEvents`) |
| Conversion action | A visible way for a visitor to convert on the site: a form submission, or a click on a WhatsApp link (`wa.me/…`, `api.whatsapp.com/…`, `whatsapp://…`) |
| Behavior metric | Any measure of what visitors do on the page: GA4 bounce rate, engagement rate, session duration, scroll; Clarity heatmaps, recordings, scroll depth, engagement time, dead/rage/quickback/error clicks |
| Rendering fetch | Loading the page in a real browser (the browser tool or Playwright) and observing the DOM and network requests. `curl` and `web_fetch` are static fetches |
| `not determined` | The recorded state of a check that the audit could not settle from evidence. Never a pass |
| Source tiers | `[PRIMARY]` (peer-reviewed research, first-party vendor documentation, official legal text) and `[INDUSTRY]` (vendor or agency analysis), as defined in `references/geo.md:6-9` |

## 4. System Context & Scope

Today (citations as run at `9f27fe2`):

- The Tool Inventory has no analytics source. "2.4 Analytics" means GSC `search_analytics_query` (`.claude/commands/akili-seo.md:59-70`).
- Phase 0 asks no optional-phase question (`:76-88`).
- The report has twelve required sections, none about measurement or consent (`:239-252`).
- The engagement-metrics ban lives in the skill (`.claude/skills/seo-audit/SKILL.md:412-431`, `:491`), in command Step 2.8 (`:228-229`) and in the command checklist (`:303`). It names bounce rate and time on page. It does not name heatmaps, recordings or engagement rate.
- The skill states that the upstream `analytics` sibling is not packaged (`SKILL.md:618`).
- Source tiers are defined only in `references/geo.md:6-9`.
- No test pins `/akili-seo` or `seo-audit` text: `grep -rln 'akili-seo\|seo-audit' test/` returns only `test/fixtures/doctor-codex-baseline.txt` (a skill-name listing).
- Vendor facts this spec depends on are recorded as design premises (Premise Ledger, design §11). Among them: the GA4 Admin API exposes **no** Search Console link resource, and the Clarity Data Export API is limited to the last 1–3 days and 10 requests per project per day.

**In scope:**

- `.claude/commands/akili-seo.md`
- `.claude/skills/seo-audit/SKILL.md`
- `.claude/skills/seo-audit/references/analytics.md` (new)
- `.claude/skills/seo-audit/evals/evals.json`
- `docs/commands/akili-seo.md`
- `docs/skills/seo-audit.md`
- `README.md` (the `/akili-seo` summary at `:801`; added at design, P-3)
- one new test file
- `CHANGELOG.md` (`[Unreleased]`)

**Out of scope:**

- `bin/`, `package.json`, `scripts/` (Q1 = c: no helper script)
- model routing
- new commands or skills
- any write to a GA4, GTM or Clarity property
- jurisdictions other than Colombia and the EU (Q5)
- Universal Analytics, Matomo, Hotjar, Meta Pixel and other tools (named as not audited when detected)

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Auditor (agency running `/akili-seo` for a client) | One run that covers ranking, measurement and conversion, with findings the client can act on |
| Site owner (e.g. Colombian SMB with a WhatsApp CTA) | To know whether organic traffic converts and whether tracking is lawful |
| Property admin (GA4 / Clarity) | To grant read-only access only: Viewer for the service account, a Data Export token |
| Maintainer of `akili-specs` | One place for the method (`references/analytics.md`), restatements that stay consistent |

## 6. Functional Requirements

### FR-1: The analytics phase is opt-in, asked once at Phase 0

Phase 0 SHALL ask **one** question: whether to run the optional analytics phase (GA4 and/or Clarity). The answer is recorded in the report.

#### Scenario: User declines or does not answer

- GIVEN `/akili-seo example.com` starts
- WHEN Phase 0 asks the analytics question and the user says no, or gives no answer
- THEN Phase 2B does not run, and the report's analytics section reads `Analytics: not run — declined at Phase 0`
- BUT it must NOT ask again later in the run
- AND IT MUST complete Phases 1–5 exactly as without this change

#### Scenario: User accepts

- GIVEN the user answers yes
- WHEN Phase 0 continues
- THEN it lists the prerequisites for each tool (FR-2) and asks only for the ones not already present
- AND IT MUST NOT block the classic audit on a missing analytics prerequisite (missing ones are handled by FR-2's skip rules)

### FR-2: Detection and access decide what runs

When opted in, Phase 2B SHALL first detect, per tool, whether it is installed (rendering fetch) and whether data access exists. It SHALL then run only the parts that the evidence supports.

| GA4 / Clarity state | Installation audit (FR-3…FR-7) | Data audit (FR-9) | Cross (FR-10) |
|---|---|---|---|
| Installed, access OK | runs | runs | runs (GA4 + GSC data present) |
| Installed, no access | runs | skipped, with the reason (e.g. `GA4: no Viewer access for <sa-email>`) | skipped, with the reason |
| Not detected | skipped | skipped | skipped; FR-8 applies |
| Detection impossible (no rendering tool) | each check `not determined` | per access | per access |

- GA4 access: the official Google Analytics MCP when configured (preferred); otherwise Data API and Admin API calls with the same Google service account, described in the command. The prerequisites are the Data API and Admin API enabled in the same GCP project, and the service-account email added as **Viewer** on the GA4 property.
- Clarity access: a project Data Export API token, supplied by the user at run time.

#### Scenario: GTM-injected tag

- GIVEN a site that loads GA4 only through a GTM container
- WHEN detection runs
- THEN GA4 is detected from the rendering fetch (network requests to the GA4 collection endpoint, or the measurement ID in the rendered DOM)
- BUT it must NOT report "GA4 not installed" from a static fetch alone (the same limitation as JS-injected JSON-LD, `SKILL.md` Schema Markup Detection Limitation)

#### Scenario: Partial access

- GIVEN GA4 is accessible and Clarity is installed with no token supplied
- WHEN Phase 2B runs
- THEN the GA4 data audit and the cross run, the Clarity installation audit runs, and the Clarity data audit is recorded as skipped with its reason
- AND IT MUST name, for each skipped part, the missing prerequisite and how to obtain it

### FR-3: Tag and loading audit

The installation audit SHALL check, for each detected tool:

- **One tag per measurement ID.** No duplicate GA4 hits for the same page view, for example gtag.js and a GTM tag both sending to one ID.
- **Measurement ID consistency** with the GA4 property audited, when access exists.
- **Loading strategy:** the scripts load asynchronously or deferred, and the tags do not block rendering.
- **CWV cost** is stated only from a measurement (PageSpeed/Lighthouse or Search Console CWV) taken in this run.

#### Scenario: Unmeasured performance claim

- GIVEN no CWV measurement was taken in this run
- WHEN a loading finding is written
- THEN it describes the loading pattern observed (e.g. "Clarity loaded synchronously in `<head>`") and recommends deferred loading
- BUT it must NOT state a millisecond or score impact
- AND IT MUST label any cited magnitude with its source tier

### FR-4: Consent audit — Ley 1581, GDPR, Consent Mode v2, Clarity consent

The installation audit SHALL check observable consent signals and record each one as a finding or a pass. It SHALL state that this is a compliance-signal audit, **not legal advice**, and SHALL include the line `Other jurisdictions: not audited`.

| Check | Basis (cited in `references/analytics.md`) |
|---|---|
| A consent mechanism is shown before analytics cookies are set or analytics hits are sent for visitors whose jurisdiction requires prior consent | GDPR/ePrivacy; Ley 1581 Art. 3(a) "consentimiento previo, expreso e informado" |
| The consent notice informs purpose and rights | Ley 1581 Art. 12 (deber de informar) |
| Consent is obtained by a means that "pueda ser objeto de consulta posterior" (a consultable record exists, e.g. a CMP log) | Ley 1581 Art. 9. Usually `not determined` from outside; recorded as owner-confirmed or `not determined` |
| Consent Mode v2 default is set **before** any measurement command, with all four parameters `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization` | Google tag consent guide |
| Clarity receives a consent signal (Consent API v2) for EEA/UK/CH visits | Microsoft Clarity consent enforcement since 2025-10-31 |

#### Scenario: Tag fires before consent

- GIVEN a rendering fetch with no consent interaction
- WHEN network requests show a GA4 or Clarity collection hit that sets storage before the banner is answered
- THEN a finding is raised with the observed request as Evidence
- BUT it must NOT assert that the site "violates" Ley 1581 or GDPR (phrase: "signal inconsistent with prior consent under …")
- AND IT MUST name which rule the signal relates to and cite it with its tier

#### Scenario: Banner present, Consent Mode absent

- GIVEN a consent banner and no `gtag('consent','default', …)` before the first measurement command
- WHEN the audit runs
- THEN a finding states that GA4 does not receive the consent state
- AND IT MUST record which of the four parameters are missing when a default exists but is incomplete

### FR-5: Conversion events — form and WhatsApp

For each conversion action present on the sampled pages, the audit SHALL check that an event is sent when the action happens and, with Admin API access, that the event is marked as a key event.

#### Scenario: WhatsApp click not tracked

- GIVEN a page with a `wa.me` link
- WHEN the auditor clicks it in the rendering fetch (without completing the external navigation)
- THEN, when no GA4 event hit follows the click, a finding is raised
- AND, when an event is sent but `properties.keyEvents` does not list it, a separate finding says the event is not a key event
- BUT it must NOT submit a real form with real data; form checks use the page's own validation path or are recorded as `not determined`

#### Scenario: No conversion action on the site

- GIVEN neither a form nor a WhatsApp link on the sampled pages
- WHEN FR-5 runs
- THEN it records `Conversion events: n/a — no form or WhatsApp CTA found on sampled pages`

### FR-6: GA4 ↔ Search Console link

The audit SHALL determine whether the GA4 property is linked to the Search Console property audited, using the strongest available evidence in this order:

1. a Data API request for a Search Console metric (these metrics "require an active Search Console link") that returns data;
2. owner confirmation;
3. otherwise `not determined`.

#### Scenario: No API resource for the link

- GIVEN GA4 access
- WHEN the link check runs
- THEN it does not call an Admin API "Search Console link" resource, because none exists (design P-4)
- AND IT MUST record which evidence settled the state

### FR-7: Clarity masking of forms and sensitive data

The audit SHALL check that Clarity cannot capture personal data shown on the page:

- `data-clarity-unmask` is not set on elements that contain forms or personal data (names, emails, phone numbers, document IDs);
- the project masking mode is owner-confirmed (Strict or Balanced), or recorded as `not determined`, because the mode is a project setting that no API used here exposes;
- pages that display personal data as text (confirmation or account pages) carry `data-clarity-mask` or a mask-by-element rule, or the mode is Strict.

#### Scenario: Unmasked container around a form

- GIVEN a `<form>` inside an element with `data-clarity-unmask="true"`
- WHEN the masking check runs
- THEN a finding is raised with the element as Evidence
- AND IT MUST note that input values are masked in all modes (vendor documentation) while surrounding text is not

### FR-8: No analytics installed

When opted in and neither GA4 nor Clarity is detected, Phase 2B SHALL be skipped with the note `Analytics: skipped — no GA4 or Clarity detected`. When the sampled pages contain a conversion action, the audit SHALL also raise **one** finding with Priority **Low**: "conversions are not measured".

#### Scenario: Site with WhatsApp CTA and no analytics

- GIVEN no analytics detected and a `wa.me` link on the homepage
- WHEN Phase 2B ends
- THEN the report carries the skip note and exactly one Low finding
- BUT it must NOT raise more than one finding for the absence
- AND IT MUST NOT raise the finding when no conversion action exists (note only)

### FR-9: Data audit

With access, the audit SHALL read aggregate data and record findings in the Issue / Impact / Evidence / Fix / Priority format:

- **GA4, last 28 days:** organic sessions by landing page; share of `(not set)` landing pages; key events by event name; self-referral or payment-gateway referrals in the source list; key events with zero count over the period.
- **Clarity, within its 1–3-day window and 10-requests-per-day quota:** dead clicks, rage clicks, quickback clicks, script errors and scroll depth on the landing pages that carry a conversion action.

#### Scenario: Clarity quota

- GIVEN a Clarity token
- WHEN the data audit plans its calls
- THEN it uses at most the requests it states in the report, and never more than the documented daily quota
- AND IT MUST state the data window (e.g. "last 72 hours") next to every Clarity figure

#### Scenario: Behavior metric in a finding

- GIVEN a landing page with high rage clicks on the CTA
- WHEN the finding is written
- THEN its Impact is stated in conversion/UX terms ("visitors fail to reach WhatsApp")
- BUT it must NOT state or imply any ranking effect (FR-11)

### FR-10: Search → Conversion cross

When GSC data and GA4 access both exist, the report SHALL include a table that joins, per landing page:

- GSC clicks and impressions, with the top queries for that page;
- GA4 organic sessions (`sessionDefaultChannelGroup` = Organic Search) and key events.

#### Scenario: Join and caveats

- GIVEN GSC page rows and GA4 landing-page rows over the same date range
- WHEN the table is built
- THEN URLs are normalized to one form (host, trailing slash, query string stripped) before joining, and unmatched rows are listed, not dropped silently
- AND IT MUST print the caveats: GSC clicks ≠ GA4 sessions; consent choices and data thresholds reduce GA4 counts; date ranges and time zones differ
- BUT it must NOT describe a query as "causing" conversions; the wording is "landing pages reached from these queries"

### FR-11: Behavior metrics serve conversion and UX, never ranking

Every surface that restates the engagement-metrics rule SHALL cover all behavior metrics (Glossary) and SHALL carry both halves of the rule:

- (a) never claim they affect Google or Bing ranking;
- (b) use them for conversion and UX findings.

Magnitudes and legal statements carry GEO's two source tiers.

#### Scenario: Restatements agree

- GIVEN the skill's *User Engagement Signals* section, its *Do not raise these* list, command Step 2.8 and Phase 2B, the command checklist, `references/analytics.md` and `docs/skills/seo-audit.md`
- WHEN `npm test` runs
- THEN a test fails when any of them lacks the ranking prohibition or the conversion/UX use
- AND IT MUST be falsified by deleting the clause from one surface (red), then restoring it (green)

### FR-12: Report sections and remediation grouping

`seo-audit-report.md` SHALL gain these sections, after GEO Findings:

- **Analytics Installation Findings**
- **Analytics Data Findings**
- **Search → Conversion**

Each holds findings, a skip note, or `not run — declined at Phase 0`.

- The Remediation Plan SHALL list analytics findings in a separate **Measurement & Compliance** group (D-1). The classic-SEO ordering is unchanged.
- The Implementation Prompt SHALL include the High analytics findings.

#### Scenario: Ranking order preserved

- GIVEN a High crawl finding and a High consent finding
- WHEN the Remediation Plan is written
- THEN the crawl finding stays in the SEO priority list, and the consent finding is in Measurement & Compliance
- BUT neither displaces the other's position

### FR-13: Secrets and personal data stay out of the report

- The Clarity token, the service-account key path contents and any OAuth credential SHALL NOT appear in the report or in the repository.
- Data SHALL be aggregate: no user IDs, client IDs, IP addresses, session-recording URLs or raw event payloads.

#### Scenario: Token handling

- GIVEN the user pastes a Clarity token
- WHEN the run writes reports
- THEN the token is absent from every written file
- AND IT MUST be used only in request headers for the run

### FR-14: Docs, evals and CHANGELOG follow the command

`docs/commands/akili-seo.md`, `docs/skills/seo-audit.md`, `SKILL.md`'s *AKILI-SPECS Integration* and references list, and `evals.json` SHALL describe Phase 2B consistently. `SKILL.md:618`'s "`analytics` not packaged" line is updated to point at the in-skill Analytics section. `CHANGELOG.md` `[Unreleased]` SHALL describe only what ships.

#### Scenario: CHANGELOG quote-check

- GIVEN the CHANGELOG entry
- WHEN the task closes
- THEN every clause is quote-checked against HEAD (KZ-002)

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | No change to `bin/`, `package.json`, `scripts/`, `docs/model-routing.md` or `.claude/templates/`. No new command and no new skill directory |
| NFR-2 | `.claude/commands/akili-seo.md` stays ≤ 440 lines (322 today); detail lives in `references/analytics.md` |
| NFR-3 | `SKILL.md` grows ≤ 40 lines (618 today) |
| NFR-4 | Every vendor or legal fact in `references/analytics.md` carries a source link, a tier and the date it was checked |
| NFR-5 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green |
| NFR-6 | The phase is read-only toward GA4, GTM and Clarity (no write scope, no MCP write tools) |

## 8. Defect Classes and Their Gates

| Defect class | Gate |
|---|---|
| A requirement clause dropped from the command or reference | Clause walk in `execution.md` + text-contract assertions per clause (KZ-changes--gate-falsifiability-2) |
| A restatement of the ranking rule loses a half or a metric | New text-contract test (FR-11) + phrase-family grep keyed on the obligation (KZ-changes--kaizen-loop-closure-2) |
| A vendor fact wrong or stale (API limits, Consent Mode parameters, Clarity enforcement, key-events naming) | Premise Ledger rows with primary sources, re-checked before the CHANGELOG is written (KZ-002). **No automated check:** the vendor docs are external |
| A legal statement misquoted | Quote-check against the official text (Función Pública for Ley 1581; EUR-Lex for GDPR/ePrivacy). Human check at the execute HITL pause |
| CHANGELOG overstates | Quote-check each clause against HEAD (KZ-002) |
| A shipped file points at `docs/specs/changes/seo-analytics/` | Grep in the closing task (KZ-changes--archify-diagrams-1) |
| The agent ignores a rule at run time (e.g. claims a ranking effect anyway) | **No automated check**: rules text cannot be machine-enforced. Partial substitute: the `evals.json` cases (not run by CI). Accepted risk, as for GEO |
| The phase is never exercised end to end on a real property in this cycle | **Accepted risk:** no live GA4/Clarity property is available to the agent. The first real `/akili-seo` run with analytics is the check |

## 9. Requirement ID Index

| ID | Source (proposal) | Tasks |
|---|---|---|
| FR-1 | Q2 | assigned at Phase 3 |
| FR-2 | access, Q1 | " |
| FR-3 | tag, deferred loading | " |
| FR-4 | consent, Q5 | " |
| FR-5 | conversion events | " |
| FR-6 | GA4 ↔ GSC link | " |
| FR-7 | Clarity masking | " |
| FR-8 | no analytics, Q6 | " |
| FR-9 | data audit | " |
| FR-10 | cross | " |
| FR-11 | ranking rule, Q7 | " |
| FR-12 | report fit, Q3, D-1 | " |
| FR-13 | privacy (proposal Risks) | " |
| FR-14 | docs, Q4 | " |
| NFR-1…6 | — | " |
