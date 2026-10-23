# Proposal — `/akili-seo`: optional analytics phase (GA4 + Microsoft Clarity)

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/seo-analytics` |
| Slug | `seo-analytics` — given by the user |
| Type | **Change** |
| Deliverable | software (methodology text: command prompt, skill, reference file, docs, tests) |
| Approval Mode | gated (the user asked to stop at the proposal's questions) |
| Date | 2026-10-21 |
| Author | AKILI session (proposer) |
| Status | **Approved** — 2026-10-21 (Juan Carlos Cadavid): option A; all eight open questions take the recommended answer (see *Decisions*) |
| Related | `/akili-seo` (`.claude/commands/akili-seo.md`), `seo-audit` skill (`.claude/skills/seo-audit/`), `docs/commands/akili-seo.md`, `docs/skills/seo-audit.md` |
| Depends on | none |
| Parallel-safe | **yes** — touches only the `/akili-seo` command, the `seo-audit` skill, their docs pages and `CHANGELOG.md`; no installer, routing or command-count change (unless Q1 picks a new helper script, see Risks) |
| Branch / release | `feat/seo-analytics` from `origin/dev` @ `4886a1c`; local `[SPEC:changes/seo-analytics]` commits only; **no push, tag, release or publish** in this cycle. Release class when it ships: **minor** (new optional behavior in an existing command) |

## Answer first

| Decision | Recommendation | One-line reason |
|---|---|---|
| Where does analytics live? | **New optional Phase 2B inside `/akili-seo`**, not a new command | It reuses the same domain, service account, finding format and report; the GSC × GA4 cross only works if both sit in one run |
| Where does the method live? | **New `seo-audit/references/analytics.md`** + a short *Analytics* section in `SKILL.md` | Mirrors how GEO was added (`references/geo.md`): progressive disclosure, `SKILL.md` stays lean |
| Opt-in trigger | **Asked once at Phase 0**, auto-skipped with a note when nothing is installed | Optional by contract; never blocks the classic audit |
| Report | **New sections in the existing `seo-audit-report.md`** (Analytics Installation, Analytics Data, Search → Conversion) | One report per audit; the remediation plan ranks everything together |
| Ranking claims | **Hard rule, extended:** behavior metrics (bounce/engagement rate, time, scroll, heatmaps, recordings) serve conversion/UX only — never ranking | The skill already bans this for bounce rate; analytics makes the temptation much larger |

## Intent

Let `/akili-seo` answer the question SEO alone cannot: **does organic traffic convert, and is the measurement trustworthy and lawful?** Add an optional analytics phase that audits the *installation* of Google Analytics 4 and Microsoft Clarity, audits the *data* with the same Issue / Impact / Evidence / Fix / Priority findings, and crosses Search Console queries with GA4 conversions (landing page → conversion) — grounded in a cited methodology reference with source tiers, as GEO is.

## Problem / Current Behavior

- `/akili-seo` reads Search Console only: its Tool Inventory lists Site Verification, `gsc` MCP endpoints and `curl` — no analytics source (`.claude/commands/akili-seo.md:59-70`).
- "Analytics" in the command means GSC Search Analytics (`.claude/commands/akili-seo.md:69`, Step 2.4).
- The report has twelve required sections, none about measurement, consent or conversions (`.claude/commands/akili-seo.md:239-252`).
- The skill treats engagement metrics as diagnostics, never ranking factors, with cited quotes (`.claude/skills/seo-audit/SKILL.md:412-431`); the command restates the ban in Step 2.8 and its checklist (`.claude/commands/akili-seo.md:228-229`, `:303`). Heatmaps, recordings and GA4 engagement rate are not named.
- The skill explicitly says the upstream `analytics` sibling skill is **not packaged** and gaps are noted in the report instead (`.claude/skills/seo-audit/SKILL.md:618`).
- The skill asks "Access to Search Console / analytics?" at intake but never uses the answer (`.claude/skills/seo-audit/SKILL.md:38`).
- Source tiers `[PRIMARY]` / `[INDUSTRY]` exist only in `references/geo.md` (`.claude/skills/seo-audit/references/geo.md:6-9`).
- Access today is one Google service account JSON key used by `scripts/gsc_verify.py` and the `gsc` MCP (`.claude/commands/akili-seo.md:31-53`); the installer ships `gsc_verify.py` as a resource script (`bin/akili.js:76`, `package.json` `files`).

Consequence: a client site can rank well while its GA4 tag fires before consent, its WhatsApp clicks are not tracked, or Clarity records form fields in clear — and the audit says nothing.

## Proposed Outcome

When the user opts in and analytics exists on the site, `/akili-seo` produces, in the same report:

1. **Installation findings** — tag (gtag.js vs GTM, duplicates, measurement ID), consent (Colombia Ley 1581/2012 + Decreto 1377/2013, GDPR/ePrivacy, Google Consent Mode v2 defaults *before* tags fire, Clarity consent signal), conversion events (form submit, WhatsApp click → key events), GA4 ↔ Search Console link, Clarity masking of forms/sensitive data, and loading strategy (async/deferred, CWV cost).
2. **Data findings** — tracking gaps, (not set) landing pages, self-referrals, missing key events, consent-driven data loss, Clarity rage/dead clicks on conversion pages — same finding shape.
3. **Search → Conversion table** — GSC query/page clicks joined to GA4 organic sessions and key events per landing page, with caveats (consent loss, thresholds, URL normalization) and *correlation, not causation* wording.

When analytics is absent or inaccessible, the phase is **skipped with an explicit note** and the rest of the audit is unchanged.

## Scope

- `.claude/commands/akili-seo.md`: opt-in question at Phase 0; prerequisites for GA4 (Data API + Admin API on the same GCP project, service account granted Viewer on the GA4 property) and Clarity (project API token for the Data Export API); Tool Inventory rows; **Phase 2B** (2B.1 detection & skip rule, 2B.2 installation audit, 2B.3 data audit, 2B.4 Search → Conversion cross); new report sections; Verification Checklist and Error Handling rows; the behavior-metrics rule extended.
- `.claude/skills/seo-audit/references/analytics.md` (new): evidence and sources with `[PRIMARY]` / `[INDUSTRY]` tiers (Google Analytics / Consent Mode / Clarity docs, Ley 1581 and Decreto 1377 text, GDPR/ePrivacy, Google statements on ranking), the installation checklist, the data checklist, the join method and its caveats.
- `.claude/skills/seo-audit/SKILL.md`: short *Analytics* section pointing at the reference; *User Engagement Signals* extended to Clarity/GA4 behavior data; *AKILI-SPECS Integration* updated (the `analytics` gap line, Phase 2B row); `references` list.
- `docs/commands/akili-seo.md`, `docs/skills/seo-audit.md`, `CHANGELOG.md` (Unreleased).
- Tests: a text-contract test that the ranking ban and the source-tier rule are restated consistently across command, skill and reference (see KZ-changes--kaizen-loop-closure-2).

## Non-Goals

- No new command, no new packaged skill (unless Q4 says otherwise), no installer change unless Q1 picks a helper script.
- No GA4/GTM/Clarity **configuration changes** on the client property — the audit is read-only; fixes go to the Implementation Prompt like every other finding.
- No legal opinion: the phase checks observable compliance signals against cited rules and says so ("not legal advice").
- No Universal Analytics, Adobe, Matomo, Hotjar, Meta Pixel audit (noted as out of scope if detected).
- No claim, anywhere, that behavior metrics affect Google or Bing ranking.
- No storing of Clarity tokens, service-account keys or any user-level data in the report.

## Affected Users, Systems, And Specs

| Who / what | Effect |
|---|---|
| `/akili-seo` users (agencies auditing client sites, e.g. Colombian SMBs with WhatsApp CTAs) | Optional new phase and report sections |
| GCP project behind the service account | Two more APIs to enable (`analyticsdata`, `analyticsadmin`) when opted in |
| GA4 property owner | Must grant the service account email Viewer access |
| Clarity project owner | Must generate a Data Export API token |
| `seo-audit` skill | New reference file + section edits (binding stays `core`) |
| Related archived spec | none for SEO since GEO landed (GEO precedent lives in the skill, not in an archived spec) |

## Visual Reference

- Source: None
- Location: n/a
- Notes: methodology-text change with no UI surface; the report is Markdown.

## Requirement Delta Preview

### ADDED Requirements

- Phase 0 asks once whether to run the analytics phase; default **no** when the user gives no answer.
- Phase 2B.1 detects GA4 (gtag/GTM) and Clarity with a **rendering** fetch (GTM-injected tags are invisible to `curl`, the same limitation as JS-injected JSON-LD), then checks API access; nothing installed or no access → phase skipped, report states which and why.
- Phase 2B.2 installation audit: tag, consent (Ley 1581 + GDPR + Consent Mode v2 + Clarity consent), key events (form, WhatsApp click), GA4 ↔ GSC link, Clarity masking, deferred/async loading vs CWV.
- Phase 2B.3 data audit via GA4 Data API (and Admin API for configuration) and Clarity Data Export API, findings in Issue / Impact / Evidence / Fix / Priority.
- Phase 2B.4 Search → Conversion table joining GSC query+page to GA4 landing page → key events, with stated caveats.
- `references/analytics.md` with `[PRIMARY]` / `[INDUSTRY]` tiers; legal claims cite primary legal text.
- New report sections and checklist items; analytics findings never outrank blocking crawl/index fixes.

### MODIFIED Requirements

- The engagement-metrics ban (skill *User Engagement Signals*, command Step 2.8 and checklist) widens to all behavior data — GA4 engagement/bounce rate, session duration, scroll, Clarity heatmaps, recordings, rage/dead clicks — and adds the positive rule: these serve **conversion and UX** findings.
- Skill *AKILI-SPECS Integration*: the "`analytics` not packaged" line changes to point at the in-skill Analytics section.

### REMOVED Requirements

- None.

## Approach Options

| Option | What | Pros | Cons |
|---|---|---|---|
| **A — Phase 2B in `/akili-seo` + `references/analytics.md`** (recommended) | Optional phase, same report, method in the existing skill | Smallest surface; reuses SA, finding format, report and remediation ranking; the GSC × GA4 join is natural | `akili-seo.md` grows (~322 → ~420 lines); skill scope widens beyond pure SEO |
| B — New `/akili-analytics` command | Separate command and report | Clean separation; can run without GSC | New command = command-count edits in routing/docs/tests; duplicates setup; the cross needs both runs' data |
| C — New packaged skill (e.g. adapt upstream `analytics-tracking` from coreyhaines31/marketingskills) | Vendor a skill, bind it `conditional` | Broader analytics guidance | Governance checklist, attribution, size; upstream content is generic marketing and does not carry the ranking ban or Colombian consent law |

## Recommended Approach

**Option A.** It is the GEO precedent applied again: one reference file with tiered evidence, a short section in `SKILL.md`, one new step block in the command, and report sections — no installer, routing or count changes. Access stays one service account for Google (GSC + GA4) plus one Clarity token, both read-only.

Data access mechanics (to be fixed at `/akili-specify` via the Premise Ledger, all `UNVERIFIED — confirm at source before relying on it`):

| Source | Endpoint | Auth | Known limits |
|---|---|---|---|
| GA4 Data API | `analyticsdata.googleapis.com` `properties.runReport` | same SA, Viewer on property | data thresholds, consent-modeled data |
| GA4 Admin API | `analyticsadmin.googleapis.com` (properties, data streams, key events, links) | same SA | whether a Search Console link is listable via public API — unknown |
| Clarity Data Export API | `project-live-insights` | project API token (Bearer) | ~last 1–3 days only, small daily request quota |

## Risks, Dependencies, And Open Questions

### Risks

| Risk | Mitigation |
|---|---|
| Legal statements about Ley 1581 / GDPR / cookies stated wrongly | Cite primary text only (Ley 1581/2012, Decreto 1377/2013, SIC guidance, GDPR/ePrivacy); phrase as "compliance signals", "not legal advice"; legal claims get their own Premise Ledger rows |
| Mutable vendor facts (Consent Mode v2 parameters, Clarity consent enforcement, API limits, "conversions" → "key events" rename) go stale | Each carries source + date in `references/analytics.md`; re-run before the CHANGELOG note (**KZ-002**: aggregate and mutable-state claims quote-checked at HEAD) |
| The widened ranking ban survives in one site and not another (skill, command 2.8, checklist, docs page, reference) | Phrase-family sweep keyed on the obligation, plus an executable restatement contract test (**KZ-changes--kaizen-loop-closure-2**) |
| Dropped obligations in a long phase (WhatsApp, masking, GSC link…) | Reviewer walks each FR term by term (**KZ-changes--gate-falsifiability-2**) |
| Text-contract test budget underestimated | Budget test LOC per clause (**KZ-bugfix--init-ctrlc-abort-2**) |
| Tests or shipped docs pointing at `docs/specs/changes/seo-analytics/` | Forbidden; cite archive path (**KZ-changes--archify-diagrams-1**) |
| Rendering dependency for detection (GTM, consent banners) | Reuse whatever renderer `/akili-seo` already allows (browser tool / Playwright); if none, mark installation checks `not determined` rather than guessing |
| Privacy of report data committed to a client repo | Aggregates only; no user IDs, IPs, session-recording URLs or tokens |

### Open Questions (please answer)

1. **GA4 access mechanism.** (a) Google's official Analytics MCP server if available, (b) a bundled read-only helper `scripts/ga4_query.py` like `gsc_verify.py` (installer change: one more resource script → touches `bin/akili.js` `RESOURCE_SCRIPTS`, `package.json` `files`, install tests), or (c) agent-run ad-hoc calls described in the command with no shipped code. **Recommended: (c) for this spec, documenting MCP as preferred when configured** — keeps it installer-free; a helper can follow.
2. **Opt-in trigger.** Ask once at Phase 0 (recommended), or a flag (`/akili-seo <domain> --analytics`), or both?
3. **Report shape.** Sections inside `seo-audit-report.md` (recommended) or a separate `seo-analytics-report.md`?
4. **Packaging.** Keep it inside `seo-audit` (recommended) or vendor a separate analytics skill (Option C)?
5. **Legal scope.** Colombia Ley 1581 + GDPR only, as you asked, or also leave a hook for other jurisdictions (e.g. LGPD Brazil, CCPA) as a single "other jurisdictions: not audited" line? **Recommended: the hook line only.**
6. **Missing analytics.** When nothing is installed: skip with a note only, or also raise one Low "no conversion measurement" finding in the remediation plan? **Recommended: note + one Low finding when the site has a clear conversion action (form/WhatsApp).**
7. **Source tiers.** Reuse GEO's two tiers (`[PRIMARY]` covers legal text and vendor docs) — recommended — or add a third `[LEGAL]` tier?
8. **Chunking.** One spec (recommended), or split into (i) installation audit (no API access needed) and (ii) data audit + Search → Conversion?

### Decisions (approved 2026-10-21, Juan Carlos Cadavid)

| Q | Decision |
|---|---|
| 1 | **(c)** GA4/Clarity calls are described in the command, no shipped code; Google's official Analytics MCP is the preferred route when configured. No installer change |
| 2 | Opt-in is **one question at Phase 0** (no flag) |
| 3 | **Sections inside `seo-audit-report.md`** — no separate report |
| 4 | **Inside `seo-audit`** — no new packaged skill |
| 5 | **Ley 1581 + GDPR only**, plus one line "other jurisdictions: not audited" |
| 6 | Nothing installed → **skip note + one Low finding** when the site has a form or a WhatsApp CTA |
| 7 | **Reuse GEO's two tiers** (`[PRIMARY]` covers legal text and vendor docs) — no `[LEGAL]` tier |
| 8 | **One spec** |

## Success Criteria

- A run with analytics opted in and installed yields Installation, Data and Search → Conversion sections, every finding in Issue / Impact / Evidence / Fix / Priority.
- A run with nothing installed or no access completes the classic audit and records the skip and its reason.
- No shipped text — command, skill, reference, docs — claims a behavior metric affects ranking; a test enforces it.
- Every magnitude or legal statement in `references/analytics.md` carries a source and tier.
- No new command, no installer change (under Q1 = c), `npm test`, `verify:cli`, `pack:dry-run`, `git diff --check` green.

## Next Step

```text
/akili-specify changes/seo-analytics
```
