---
name: akili-seo
description: Enhance pages and search engine optimization following SEO best practices.
license: MIT
metadata:
  author: Juan Carlos Cadavid (jcadavid.com)
---

# SEO Setup & Audit via Google Search Console

Provision Google Search Console access for a domain via a Google Cloud service account, then run a full SEO audit (index coverage, sitemaps, structured data, search analytics) and generate an audit report under the spec path, with an optional analytics phase (GA4, Microsoft Clarity) when the user opts in. Produces `seo-setup-report.md` and `seo-audit-report.md`.

## Usage

```
/akili-seo <site-domain>
```

**Examples:**

- `/akili-seo calismiledesign.com`
- `/akili-seo seo/calismiledesign.com`
- `/akili-seo agrosmartco.com`

## Arguments

- `$ARGUMENTS` — Either a bare apex domain (e.g. `example.com`) or a relative path under `docs/specs/` (e.g. `seo/example.com`). When a bare domain is given, the spec path defaults to `docs/specs/seo/<domain>/`.

## Prerequisites

The user must provide (or confirm) once per Google Cloud project:

1. A Google Cloud service account JSON key file, absolute path.
2. Three APIs enabled in that GCP project:
   - **Site Verification API** (`siteverification.googleapis.com`)
   - **Search Console API** (`searchconsole.googleapis.com`)
   - **Web Search Indexing API** is **NOT required** — Google only honors it for `JobPosting` and `BroadcastEvent` schemas; do not push users to enable it for generic content sites.
3. DNS provider access for the target domain (to add a TXT record).
4. The GSC MCP server configured in `~/.claude.json` or project `.mcp.json` with:
   ```json
   "gsc": {
     "command": "npx",
     "args": ["-y", "@mikusnuz/gsc-mcp"],
     "env": {
       "GSC_SERVICE_ACCOUNT_KEY_PATH": "<absolute path to JSON key>"
     }
   }
   ```
   If `GSC_SITE_URL` is set, prefer the `sc-domain:` form (e.g. `sc-domain:example.com`) over the URL-prefix form.
5. A local helper for the Site Verification API. The `gsc` MCP does **not** expose Site Verification endpoints (no `getToken`, no `verify`) — it only wraps the Search Console API. Use the bundled `scripts/gsc_verify.py` from `akili-specs` (depends on `google-auth` and `google-api-python-client`). Invoke it as:

   ```bash
   GSC_KEY_PATH=/abs/path/to/key.json python3 scripts/gsc_verify.py get <domain>
   GSC_KEY_PATH=/abs/path/to/key.json python3 scripts/gsc_verify.py verify <domain>
   ```

**Optional: analytics phase** (needed only when the user answers yes at Phase 0):

6. GA4: the Data API and Admin API enabled in the same GCP project, and the service-account email added as **Viewer** on the GA4 property. Or the official Google Analytics MCP, started **without `--allow-write`** (read-only: never call its write tools).
7. Clarity: a Data Export API token from a project admin, supplied at run time and never stored.

If any of prerequisites 1–5 is missing, stop and report exactly what is missing and how to obtain it. Items 6–7 never stop the run: a missing one skips only its part of Phase 2B.

## Tool Inventory

| Phase | Endpoint | Source |
|---|---|---|
| 1.1 Get TXT token | `siteVerification.webResource.getToken` | Site Verification API (helper script) |
| 1.3 Verify ownership | `siteVerification.webResource.insert` | Site Verification API (helper script) |
| 1.4 Add property | `sites_add` | `gsc` MCP |
| 1.5 Confirm | `sites_list` | `gsc` MCP |
| 2.1 Sitemaps | `sitemaps_list`, `sitemaps_submit` | `gsc` MCP |
| 2.2 Index coverage | `url_inspection_inspect` | `gsc` MCP |
| 2.4 Analytics | `search_analytics_query` | `gsc` MCP |
| 2.5 Render | raw `curl -A Googlebot/2.1` | shell |
| 2B.1 Detect | rendering fetch with network observation | browser tool or Playwright |
| 2B.2 Installation audit | rendering fetch; `properties.keyEvents.list` | browser tool or Playwright; Admin API |
| 2B.3 Data audit | `run_report` / `runReport`; Clarity `project-live-insights` | Analytics MCP or Data API; Clarity Data Export API |
| 2B.4 Search → Conversion | `search_analytics_query`; `run_report` / `runReport` | `gsc` MCP; Analytics MCP or Data API |

---

## Behavior

### Phase 0: Setup

**Model checkpoint:** This phase runs best on **T3 Auditor** for audit findings and **T5 Fast-Cheap** for setup/formatting. If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps that tier to a model different from the current session model, check the direction first — the registry is a floor, not a ceiling: if the session model is the stronger one (e.g. a newer generation than a stale entry), pass silently and flag the registry entry for update instead of recommending a downgrade. Only when the registry model is stronger for this tier, tell the user in one line — e.g. *"The audit phase is T3 — the registry recommends `/model opus`; you are on haiku"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode) at the first approval pause. Never block on this; continuing on the current model is always allowed.

1. Resolve the spec path. If `$ARGUMENTS` is a bare domain, set `SPEC_PATH = seo/<domain>`. Otherwise treat `$ARGUMENTS` as the literal spec path.
2. Create directory `docs/specs/$SPEC_PATH/` if it does not exist.
3. Read the constitutional templates and project context as defined in `akili-specify`:
   - `docs/specs/general-setup/`
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy: `docs/system-design/design.md` or `docs/system-design.md`)
   - `docs/trd/trd.md` (legacy: `docs/detailed-design/detailed-design.md` or `docs/detailed-design.md`)
   - Root `CLAUDE.md`
4. Confirm the GSC MCP is reachable. If not, stop and report.
5. Ask once whether to run the optional analytics phase (GA4 and/or Microsoft Clarity). The question is asked once and never repeated in the run. No answer or no: record `Analytics: not run — declined at Phase 0`, skip Phase 2B, and complete Phases 1–5 as without it. Yes: list the analytics prerequisites (items 6–7) and ask only for those not already present; a missing one never blocks Phase 1 or Phase 2.

---

### Phase 1: Verify & Add Property

**Role:** SEO Engineer — register the service account as a verified owner of the domain in Google Search Console.

#### Step 1.1 — Generate the DNS TXT token

Call the Site Verification API to obtain the verification token for `sc-domain:<domain>`. Present the user with the exact TXT record to add:

```
Type:  TXT
Host:  @  (root of <domain>)
Value: google-site-verification=<token>
```

#### Step 1.2 — Wait for DNS propagation

Ask the user to confirm the TXT record is live, then verify with a DNS lookup before proceeding. Do not loop silently — fail clearly if propagation has not happened after a reasonable check.

#### Step 1.3 — Verify ownership

Call the Site Verification API `verify` endpoint. On success, the service account becomes an owner of the property.

#### Step 1.4 — Add the property to Search Console

Verification alone does not add the property to Search Console for the service account. Explicitly call `sites_add` with `sc-domain:<domain>` so the property appears in `sites_list` with `permissionLevel: siteOwner`.

#### Step 1.5 — Write `seo-setup-report.md`

Produce `docs/specs/$SPEC_PATH/seo-setup-report.md` documenting:

1. Document Control (date, domain, service account email, GCP project)
2. Prerequisites checked
3. DNS TXT record value installed
4. Verification result
5. `sites_list` confirmation output
6. Notes / caveats

---

### Phase 2: Audit

**Role:** Technical SEO Auditor — measure the state of the domain in Google's index.

**Required skill:** load `seo-audit` before starting this phase and apply it throughout:

- Sequence and weight findings by its priority order: crawlability & indexation → technical foundations → on-page → content quality → authority.
- Record every finding with its structure: **Issue / Impact / Evidence / Fix / Priority**.
- Respect its schema-detection limitation: static fetches (`curl`, `web_fetch`) cannot see JS-injected JSON-LD. Validate structured data via `url_inspection_inspect.richResultsResult` or a rendering tool, never via static HTML alone.
- Apply its International SEO checklist (hreflang reciprocity, self-reference, `x-default`, cross-locale canonicals, locale sitemaps) whenever the site serves multiple languages or regions.
- Apply its **GEO** section (Step 2.8) for generative-engine visibility. GEO is a layer on top of ranking, never a substitute — run the priority order first. When citing a magnitude, carry the skill's source tier: the KDD 2024 figures are peer-reviewed; AI Overview and crawler-behaviour figures are industry analyses and must not be presented as measured fact.
- Apply its **Analytics** section in Phase 2B, only when the user opted in at Phase 0.

Use `systematic-debugging` when results are inconsistent with site reality.

Skill preference for any UX/UI recommendations:

- `ui-ux-pro-max` if available
- otherwise `frontend-design`

#### Step 2.1 — Sitemap audit

1. List submitted sitemaps via `sitemaps_list`.
2. If none submitted but `https://<domain>/sitemap.xml` or `/sitemap-index.xml` exists, propose submission with `sitemaps_submit` and ask before submitting.
3. Fetch each sitemap with `curl -sL` and enumerate URLs.

#### Step 2.2 — Index coverage

For every URL in the sitemap (cap at 25 for cost; sample evenly across locales and sections), call `url_inspection_inspect`. Bucket each URL into:

- `PASS` — Submitted and indexed
- `NEUTRAL` — Discovered – currently not indexed
- `NEUTRAL` — URL is unknown to Google
- `NEUTRAL` — Page with redirect
- `FAIL` — anything else (e.g. blocked, server error, soft 404)

Record `googleCanonical`, `userCanonical`, `pageFetchState`, `crawledAs`, `lastCrawlTime` for each.

#### Step 2.3 — Structured data audit

From `url_inspection_inspect.richResultsResult`, collect every rich-result item flagged with `WARNING` or `ERROR`. For each, fetch the page with a Googlebot user agent and extract the offending JSON-LD block so the report can show the exact bad value and the exact corrected value.

Common findings to surface:

- `VideoObject.uploadDate` missing time or timezone (use ISO 8601 `YYYY-MM-DDTHH:MM:SS±HH:MM`)
- `Product`, `Review`, `Organization` missing required fields

#### Step 2.4 — Search analytics

Call `search_analytics_query` for the last 28 days (or last 90 if available), grouped by:

- `query` (top 25)
- `page` (top 25)
- `country` (top 10)
- `device` (all)

If the property is newly verified and returns no rows, record that explicitly and note that data typically appears within 2–7 days.

#### Step 2.5 — Render audit

For 2–3 sampled pages, fetch them with `curl -sL -A "Googlebot/2.1"` and measure:

- HTML size in bytes
- Visible text length in characters and word count
- Whether the main content is present in server-rendered HTML (vs JS-only)

This separates "thin content" failures from "JS render" failures.

#### Step 2.6 — Internal linking quick check

Fetch the homepage and count anchor links to each sitemap URL. URLs with zero internal links from the homepage are flagged as orphan-like.

#### Step 2.7 — On-page audit (`seo-audit` framework)

For the pages sampled in Step 2.5, apply the on-page checklist from the `seo-audit` skill:

- Title tags: unique per page, ~50–60 characters, primary keyword near the beginning.
- Meta descriptions: unique per page, ~150–160 characters, clear value proposition.
- Heading structure: exactly one H1, no skipped levels, headings describe content.
- Image alt text present and descriptive; internal anchor text descriptive (no bare "click here").
- Canonical tags: self-referencing on unique pages, consistent protocol/host/trailing-slash.
- Multilingual sites: hreflang set includes a self-reference and reciprocal return links, `x-default` declared, each locale self-canonical (never cross-locale).

Record each failure as a finding using the skill's Issue / Impact / Evidence / Fix / Priority structure.

#### Step 2.8 — GEO audit (generative-engine visibility)

For the same sampled pages, apply the `seo-audit` skill's **GEO** section (evidence and sources in its
`references/geo.md`). Highest-yield checks first — the measured gains come from evidence, not markup:

- **Evidence density:** claims carry verifiable statistics with named sources; credible quotations where the topic supports them; outbound citations to reliable sources.
- **Self-containment test:** for each passage the page wants cited, confirm it still makes sense lifted out with no surrounding context. Flag anaphora that depends on the previous paragraph ("this approach", "as mentioned above"). No on-page check above catches this.
- **Definitional sentences:** each term the page wants to own has a *"X is a Y that does Z."* sentence at first use.
- **Entity resolution:** the page states in one sentence what the subject is and who made it; `Person`/`Organization` node with `sameAs`.
- **Freshness:** `dateModified` exposed and truthful; no stale visible version numbers or dates.
- **AI crawler directives:** `robots.txt` separates training agents (`GPTBot`, `ClaudeBot`, `Google-Extended`) from retrieval agents (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`). A blanket AI-bot block removes the site from AI answers too — confirm the owner's intent before calling either state correct.
- **Unverifiable claims:** flag numeric or superlative claims in `<title>`, meta description, or JSON-LD that no source supports.

**Do not raise:** a missing `llms.txt` (no measured visibility effect — see the skill), or any finding that asserts a behavior metric (bounce or engagement rate, session duration or engagement time, scroll depth, heatmaps, recordings, dead/rage/quickback/error clicks) affects rankings; behavior metrics serve conversion and UX findings.

Record each failure in the same Issue / Impact / Evidence / Fix / Priority format.

---

### Phase 2B: Analytics & Conversion (optional)

**Role:** Measurement Auditor: how GA4 and Microsoft Clarity are installed, what their data shows, and how Search Console traffic converts. Runs only when the user opted in at Phase 0; when declined, skip this phase and do not ask again. Read-only toward GA4, GTM and Clarity. This phase holds the steps and skip rules; checklists and sources are in the `seo-audit` skill's `references/analytics.md`.

#### 2B.1 — Detect and check access

Detect GA4 and Clarity separately with a **rendering fetch** (browser tool or Playwright observing DOM and network requests): GA4 collection requests, the measurement ID, a GTM container, the Clarity tag. Never report a tool absent from a static fetch alone (`curl`, `web_fetch`): GTM-injected tags are invisible to it, as with JS-injected JSON-LD. With no rendering tool, record each installation check as `not determined`.

Then check access: GA4 through the official Google Analytics MCP when configured (preferred), else Data API and Admin API calls with the service account; Clarity through the Data Export token supplied at run time. Run only what the evidence supports:

| State | Installation audit (2B.2) | Data audit (2B.3) | Cross (2B.4) |
|---|---|---|---|
| Installed, access OK | runs | runs | runs when GA4 and GSC data exist |
| Installed, no access | runs | skipped, with the reason | skipped, with the reason |
| Not detected | skipped | skipped | skipped |
| Detection impossible | `not determined` | per access | per access |

For each skipped part, name the missing prerequisite and how to obtain it: `<Tool>: data audit skipped — <missing prerequisite>; obtain: <action>`. Use only these states: a check the evidence cannot settle is `not determined`, one that does not apply is `n/a — <reason>`, and neither is ever a pass.

**Nothing detected:** skip 2B.2–2B.4 with `Analytics: skipped — no GA4 or Clarity detected`. When the sampled pages carry a conversion action (a form, or a WhatsApp link `wa.me/…`, `api.whatsapp.com/…`, `whatsapp://…`), raise exactly one finding, Priority Low: "conversions are not measured". Never raise more than one for the absence, and none when no conversion action exists (note only).

#### 2B.2 — Installation audit

On the pages sampled in Step 2.5, per detected tool (detail in the reference's installation checklist). Findings use the Issue / Impact / Evidence / Fix / Priority format, plus **Basis** (rule or vendor document, with its tier) on consent findings.

- **Tag and IDs.** One tag per measurement ID (no duplicate hits, such as gtag.js and a GTM tag both sending to one ID). Measurement ID consistency with the GA4 property audited, when access exists.
- **Loading.** Scripts async or deferred, not blocking render. Describe the pattern observed and recommend deferred loading; never state a millisecond or score impact without a PageSpeed, Lighthouse or Search Console CWV measurement taken in this run, and label any magnitude cited with its source tier.
- **Consent.** These are compliance signals, not legal advice. `Other jurisdictions: not audited`. Record each consent check as a finding or a pass, never as a "compliant" verdict. A GA4 or Clarity hit that sets storage before the banner is answered, for visitors whose jurisdiction requires consent first, is a finding written "signal inconsistent with the consent requirement under <rule>", naming the rule and its tier; never write that a site "violates" a law. Ley 1581 applies only where the analytics processing involves datos personales (Art. 3(c)) and is never a cookie-banner mandate. Also check: no `gtag('consent','default', …)` before the first measurement command means GA4 does not receive the consent state, and the finding names which of the four Consent Mode parameters are missing when a default is incomplete; the notice informs purpose and rights; the consultable record is owner-confirmed or `not determined`; Clarity receives a consent signal (Consent API v2) where the project requires cookie consent.
- **Conversion events.** For each form or WhatsApp action, check that an event is sent when it happens and, with Admin API access, that `properties.keyEvents` lists it. A click with no event hit is one finding; an event that is not a key event is a separate one. Click the WhatsApp link in the rendering fetch and intercept it before the external navigation completes. Never submit a form with real data: use the page's own validation path or record `not determined`. With neither: `Conversion events: n/a — no form or WhatsApp CTA found on sampled pages`. The hits this audit generates in the client's property get a one-line **test-traffic disclosure** (date, time, pages) in the installation findings so the owner can filter them.
- **GSC link.** No Admin API Search Console link resource exists; never call one. Probe in order: a Data API request for a Search Console metric such as `organicGoogleSearchClicks` that returns data, then owner confirmation, then `not determined`. Record the evidence that settled the state: `GSC link: linked (Data API probe)`, `linked (owner-confirmed)`, `not linked (owner-confirmed)` or `not determined`.
- **Clarity masking.** `data-clarity-unmask` on an element containing a form or personal data is a finding with the element as Evidence; input values are masked in all modes, surrounding text is not. The masking mode (Strict, Balanced, Relaxed) is a project setting no API used here exposes: owner-confirmed Strict or Balanced passes, owner-confirmed Relaxed is a finding, otherwise `not determined`. Pages that display personal data as text (confirmation, account) must carry `data-clarity-mask` or a mask-by-element rule, or the mode is Strict.

#### 2B.3 — Data audit

With access, read aggregate data only and record findings in the same format.

- **GA4, last 28 days:** organic sessions by landing page; share of `(not set)` landing pages; key events by event name, and those with zero count; self-referral or payment-gateway sources.
- **Clarity:** dead, rage and quickback clicks, script errors and scroll depth on the landing pages that carry a conversion action. The window is the last 1–3 days and the quota is 10 requests per project per day: use at most 3 requests, state the number used in the report, state the data window next to every figure, and report a 1,000-row response as truncated.

State each Impact in conversion or UX terms ("visitors fail to reach WhatsApp").

#### 2B.4 — Search → Conversion

When GSC data and GA4 access both exist, issue this step's own `gsc` calls (Step 2.4 never groups by `query,page`): `search_analytics_query` grouped by `page` (limit 250) and by `query,page` (limit 1,000), over GA4's date range; pages beyond 250 are counted, not joined. Join per landing page: GSC clicks, impressions and top queries, with GA4 organic sessions (`sessionDefaultChannelGroup` = Organic Search) and key events. Normalize URLs (host, trailing slash, query string stripped) before joining and list unmatched rows. Print the caveats: GSC clicks are not GA4 sessions; consent choices and data thresholds reduce GA4 counts; date ranges and time zones differ. Say "landing pages reached from these queries"; never describe a query as "causing" conversions.

**Hard rule.** Never claim that any behavior metric (bounce or engagement rate, session duration or engagement time, scroll depth, heatmaps, recordings, dead/rage/quickback/error clicks) affects Google or Bing ranking; use behavior metrics for conversion and UX findings only. **Privacy.** The Clarity token is used only in request headers and is never written to the report or the repository, nor are service-account key contents or OAuth credentials; data stays aggregate: no user IDs, client IDs, IP addresses, session-recording URLs or raw event payloads.

---

### Phase 3: Write `seo-audit-report.md`

Generate `docs/specs/$SPEC_PATH/seo-audit-report.md` using `docs/specs/general-setup/validation-report.md` as the format source where it fits, writing per `cognitive-doc-design` (lead with the verdict, tables over prose).

Required sections:

1. Document Control
2. Executive Summary — one-paragraph verdict + 3–5 bullet headline findings.
3. Index Coverage Table — every audited URL with its bucket and last crawl time.
4. Sitemap Status
5. Structured Data Findings — exact broken JSON-LD blocks with corrected versions.
6. Search Analytics Summary — top queries / pages / devices / countries, or an explicit "no data yet" note.
7. Render Audit
8. Internal Linking Findings
9. On-Page SEO Findings — Step 2.7 results, each in the `seo-audit` Issue / Impact / Evidence / Fix / Priority format.
10. GEO Findings — Step 2.8 results, same format. State the source tier next to any magnitude cited, and keep GEO items ranked below blocking classic-SEO fixes in the remediation plan (GEO layers on ranking, it does not substitute for it).
11. Remediation Plan — prioritized (High / Medium / Low) actionable items, each scoped enough that an implementer can execute it without further discovery.
12. Re-audit Schedule — when to run `/akili-seo <domain>` again.

The report title must be `# SEO Audit Report — <domain>`.

---

### Phase 4: Generate a Fix Prompt

Append to the audit report a section titled `## Implementation Prompt` containing a fenced, copy-paste prompt that can be handed to Claude Code (or any engineer) inside the site's codebase to fix every High-severity finding. The prompt must:

- Reference each finding by ID from the remediation plan.
- Include exact JSON-LD before/after snippets where structured data is broken.
- Include exact URL pairs for hreflang corrections.
- End with "Show me a diff of every change before applying. Do not deploy until I approve."

#### 4.1 — Growth Strategy Addendum (opt-in)

The audit diagnoses what is broken; this addendum prescribes what to *build*. After the fix prompt, offer the user a `## Growth Strategy` section for the report — **opt-in, and only when the audit surfaced content/visibility gaps** (thin content, orphan-like pages, weak topical coverage, a local business with no presence data). Skip it entirely for purely technical audits. When accepted, cover only the lenses that apply:

- **Keyword & topic strategy.** Derive candidate topics from what the audit already read (the site's actual pages, GSC queries when the MCP is connected — real impression data beats guessed volume). Recommend **topic clusters**: one pillar page per core offering, supporting pages targeting long-tail intents, interlinked hub-and-spoke. Never prescribe keyword densities or word counts — matching the *intent* better than the current ranking pages is the target; mechanical quotas are stale advice that reads as spam to modern ranking systems and to GEO engines alike.
- **Featured snippets & answer surfaces.** For queries where the site ranks page 1 but below the snippet: add a 40–60 word direct answer immediately under the matching heading, use question-form H2/H3s, and structure comparisons/steps as tables and ordered lists. This same shape is what generative engines quote — it compounds with the GEO findings from Phase 2, so cross-reference them rather than writing a separate plan.
- **Local SEO** (only when the audit shows a business with physical presence or service areas): Google Business Profile completeness (categories, hours, photos, posts), `LocalBusiness` JSON-LD consistent with the GBP listing, NAP (name/address/phone) consistency across pages, and location-specific landing pages when multiple areas are served — distinct content per location, never templated near-duplicates (Phase 2's duplicate-content check applies to these too).

Each recommendation lands in the report with the same discipline as audit findings: tied to evidence (a page, a query, a gap the audit measured), with an effort estimate, **never a generic checklist**. If the user declines, note "Growth Strategy: offered and declined" in the report and move on.

---

### Phase 5: Present & Approve

Present a short summary of:

- Setup status (Phase 1 outcome).
- Audit headline findings and counts per bucket.
- The number of High / Medium / Low remediation items.
- Paths to the two generated reports.

Ask the user whether to also run the same flow against any other properties under the same service account.

---

## Verification Checklist

After the command completes, verify:

- [ ] `docs/specs/$SPEC_PATH/seo-setup-report.md` exists and references the actual TXT token used.
- [ ] `docs/specs/$SPEC_PATH/seo-audit-report.md` exists with all required sections.
- [ ] `sites_list` shows the property with `permissionLevel: siteOwner`.
- [ ] Every URL in the sitemap is either audited or explicitly excluded with a reason.
- [ ] Every structured-data warning is reproduced with the exact bad value and the exact fix.
- [ ] On-page findings from Step 2.7 use the `seo-audit` Issue / Impact / Evidence / Fix / Priority format.
- [ ] GEO findings from Step 2.8 are present, carry their source tier where a magnitude is cited, and rank below blocking classic-SEO fixes in the remediation plan.
- [ ] No finding claims engagement metrics (bounce rate, time on page) affect rankings, and none flags a missing `llms.txt`.
- [ ] The implementation prompt is self-contained and would not require this conversation to execute.
- [ ] The Growth Strategy addendum was **offered when the audit surfaced content/visibility gaps** and its state is named in the report (included / offered and declined / not applicable for a purely technical audit). When included, every recommendation cites audit evidence and none prescribes keyword densities or word counts.

---

## Error Handling

- If the Site Verification API returns `failedVerification`, do not retry blindly — surface the underlying reason (TXT not visible, wrong record, DNSSEC lag) and stop.
- If `sites_add` fails with 403, the service account is not yet a verified owner — return to Phase 1.
- If `sites_list` returns empty after a successful `sites_add`, the MCP cached an old session — instruct the user to restart Claude Code or the `gsc` MCP and retry.
- If `search_analytics_query` returns no rows for a newly verified property, this is expected. Do not mark as failure.
- If the Indexing API is suggested as a fix, decline it for non-`JobPosting`/`BroadcastEvent` content and explain why.
- If a skill is unavailable, fall back to the next documented skill and note it in the report.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
