# Analytics & Conversion Measurement: Method & Sources

Method for the optional analytics phase of `/akili-seo` (Phase 2B): how GA4 and Microsoft Clarity are
installed, what their data shows, and how Search Console traffic maps to conversions. The command
holds the steps; this file holds the checklists and the sources. Findings use the Issue / Impact /
Evidence / Fix / Priority shape plus **Basis** (the rule or vendor document, with its tier) on
consent and vendor-fact findings only.

---

## 1. Scope and source tiers

Covers **GA4** and **Microsoft Clarity**. Any other tool detected (Universal Analytics, Matomo,
Hotjar, Meta Pixel) is named as `not audited`. The phase is read-only toward GA4, GTM and Clarity.

**Source tiers**, as defined in [GEO reference](geo.md): `[PRIMARY]` = peer-reviewed research or
first-party vendor documentation. `[INDUSTRY]` = vendor or agency analysis of observed data;
directionally useful, methodology usually undisclosed, treat magnitudes as indicative not exact.
This file adds one rule: **official legal text is `[PRIMARY]`**. Do not present an `[INDUSTRY]`
statement to a client as measured fact. Every vendor or legal fact below links its source in
section 9 with the date it was checked.

---

## 2. The hard rule

Behavior metrics are: GA4 bounce rate, engagement rate, session duration and engagement time,
scroll depth; Clarity heatmaps, recordings, dead clicks, rage clicks, quickback clicks and error
clicks. **Never claim that any behavior metric affects Google or Bing ranking.**
Use behavior metrics for conversion and UX findings only; the fix is the page, never "improve the metric to rank".

The rule is a **prohibition on claiming an effect**. It is not an assertion about how either engine
ranks. Bing is not asserted either way. GA4 and Clarity data belong to the site owner; the rule does
not describe any interaction signal a search engine collects on its own.

`[INDUSTRY]` Google staff have said publicly that Analytics bounce rate is not used in ranking. As
reported by Search Engine Journal (not re-checked against the original recordings): Matt Cutts, 2
February 2010: "Google Analytics is not used in search quality in any way for our rankings."; Gary
Illyes, 13 May 2015: "…we don’t use analytics/bounce rate in search ranking."; John Mueller, in a
webmaster hangout (SEJ dates it 12 June 2022; SERoundtable reported the same remark on 16 June 2020,
and the two sources disagree on the year): "I think there’s a bit of misconception here that we’re
looking at things like the analytics bounce rate…". No Google Search Central text page stating this was found; the originals are a video,
a tweet and an office-hours recording, so the tier is `[INDUSTRY]`.

| Metric | Read it as (conversion / UX) |
|---|---|
| Rage clicks or dead clicks on a CTA | A conversion blocker: visitors try and fail to reach the action |
| Quickback clicks on a landing page | Visitors return at once: the page may not match what the link promised |
| Scroll depth that ends above the CTA | The CTA is placed where most visitors never arrive |
| Error clicks, script errors | A broken element on the path to conversion |
| Low engagement rate on a landing page | A prompt to compare that page with a better-converting one |
| Short session duration on a long page | The answer may be buried or the page unscannable |

---

## 3. Access

| Need | Route |
|---|---|
| GA4, preferred | The official Google Analytics MCP, started **without `--allow-write`**. Tools used: `get_account_summaries`, `get_property_details`, `run_report`. `create_property_annotation` is its write tool and is never called |
| GA4, fallback | Data API `properties.runReport`; Admin API `properties.get`, `properties.dataStreams.list`, `properties.keyEvents.list` |
| GA4 grant | Data API and Admin API enabled in one GCP project; the service-account email added as **Viewer** on the GA4 property. Scope `analytics.readonly` only |
| Clarity | A Data Export API token that a project admin generates under Settings, Data Export; supplied by the user at run time |

The MCP is experimental and uses Application Default Credentials. Credentials stay out of every output: the Clarity token, the service-account key file contents and any OAuth credential are never written to the report, a file or the repository.
The Clarity token is used only in the `Authorization: Bearer` header and is never written to the report either.

**Clarity quota.** At most 10 requests per project per day, last 1 to 3 days only, at most 3
dimensions, at most 1,000 rows, no pagination. Budget for one run: **3 requests** (URL with
`numOfDays=3`; URL by Device; one spare), which leaves the owner 7 of the day's 10. A response of
exactly 1,000 rows is reported as truncated. Responses are UTC.

---

## 4. Detection

Detection needs a **rendering fetch**: a browser that observes the DOM and network requests. `curl`
and `web_fetch` are static fetches and cannot see a tag injected by GTM or other JavaScript. **Never
report "GA4 not installed" or "Clarity not installed" from a static fetch alone** (the same
limitation as JS-injected JSON-LD). When no rendering tool can observe network requests, record each
installation check as `not determined`.

| Tool | Signals in the rendered page |
|---|---|
| GA4 | A request to `googletagmanager.com/gtag/js?id=<ID>`; GA4 collection hits (observed as `collect` requests; vendor docs checked do not name the path); the measurement ID in the rendered DOM; a GTM container ID (`GTM-…`) in the DOM or in a `googletagmanager.com` request |
| Clarity | A `clarity.ms/tag/<project ID>` script in `<head>` or injected by GTM; POST requests to `https://www.clarity.ms/collect` while interacting with the page |

The GA4 collection path, the `GTM-` form and the `clarity.ms/tag/` script URL are observed patterns, not vendor-stated; confirm them in the
network log and record what was seen as Evidence.

---

## 5. Installation checklist

### Tag, loading and IDs

- **One tag per measurement ID.** No duplicate GA4 hits for one page view (gtag.js and a GTM tag both sending to one ID).
- **Measurement-ID consistency** with the property audited, when access exists.
- **Loading.** Scripts async or deferred, not blocking render. Describe the pattern observed (for example "Clarity loaded synchronously in `<head>`") and recommend deferred loading.
- **No millisecond claim without a measurement.** State a Core Web Vitals cost only from a PageSpeed, Lighthouse or Search Console measurement taken in this run, and label any cited magnitude with its tier.

### Consent

This is a compliance-signal audit, **not legal advice**. `Other jurisdictions: not audited`. Each
check is a signal with a **Basis**; the audit never issues a "compliant" verdict.

| Rule | Reading used by the audit | Tier |
|---|---|---|
| Ley 1581 applies to analytics only where the processing involves datos personales (Art. 3(c)) | Art. 3(c): "Dato personal: Cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables". The law has no cookie-specific provision and is never cited as a cookie-banner mandate | `[PRIMARY]` |
| Ley 1581 Art. 3(a) | "Autorización: Consentimiento previo, expreso e informado del Titular para llevar a cabo el Tratamiento de datos personales" | `[PRIMARY]` |
| Ley 1581 Art. 9 | Opens "Sin perjuicio de las excepciones previstas en la ley"; authorization "deberá ser obtenida por cualquier medio que pueda ser objeto de consulta posterior". Usually `not determined` from outside; record owner-confirmed or `not determined` | `[PRIMARY]` |
| Ley 1581 Art. 12 | "Deber de informar al Titular": at the time of asking, inform the treatment and its purpose, the Titular's rights, and who the Responsable is | `[PRIMARY]` |
| Decreto 1377/2013 | Regulates the authorization (Arts. 5, 7, 8). Compiled into Decreto Único Reglamentario 1074/2015 as Arts. 2.2.2.25.2.2, 2.2.2.25.2.4 and 2.2.2.25.2.5 (the compilation mapping is as printed by a government normograma; confirm the numbering in Decreto 1074 before citing it by number) | `[PRIMARY]` |
| ePrivacy Directive Art. 5(3) | Storing or gaining access to information on a user's terminal "is only allowed on condition that the subscriber or user concerned has given his or her consent", after clear and comprehensive information, with an exception for what is strictly necessary for a service the user requested | `[PRIMARY]` |
| GDPR Art. 4(11), 7(1), 7(3) | Consent is a "freely given, specific, informed and unambiguous indication"; the controller must be able to demonstrate it; "It shall be as easy to withdraw as to give consent" | `[PRIMARY]` |

Checks and their wording:

- **Consent before storage.** A GA4 or Clarity hit that sets storage before the banner is answered is a finding with the observed request as Evidence. Write it as "signal inconsistent with the consent requirement under <rule>", name the rule and its tier. Never write a verdict that the site is unlawful.
- **Notice content.** The notice informs purpose and rights (Ley 1581 Art. 12).
- **Consultable record** (Ley 1581 Art. 9). Owner-confirmed or `not determined`.
- **Consent Mode v2.** `gtag('consent','default', …)` runs on every page "before any commands that send measurement data", with all four parameters: `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`. Google lists the last two as sent "in addition to" the first pair. A banner with no default means GA4 does not receive the consent state. **The finding records which of the four parameters are missing** when a default exists but is incomplete. A missing parameter is a signal, not a verdict; the `ad_*` pair matters for advertising features. `wait_for_update` holds data for an asynchronous banner.
- **Clarity `consentv2`**, where the project is configured to require cookie consent: `window.clarity('consentv2', {ad_Storage, analytics_Storage})`, both required. Clarity enforces consent signals for EEA, UK and CH visits from 2025-10-31. Without consent it assigns a unique ID per page view and does not use cookies to persist session data.

### Conversion events

- **Form and WhatsApp.** WhatsApp patterns: `wa.me/…`, `api.whatsapp.com/…`, `whatsapp://…`. Check that an event is sent when the action happens and, with Admin API access, that `properties.keyEvents` lists it (GA4 says "key events"; `conversionEvents` is deprecated).
- **Intercepted click.** Click the link in the rendering fetch and intercept it before the external navigation. A click with no GA4 hit is one finding; a hit that is not a key event is a separate finding.
- **No real submission.** Never submit a form with real data. Use the page's own validation path or record `not determined`.
- **Test-traffic disclosure.** Page views and the WhatsApp click generate hits in the client's property. State the date, time and pages in one line in the Installation Findings so the owner can filter them.

### GA4 and Search Console link

No Admin API link resource exists for Search Console. Probe order, strongest first: (1) a Data API
`runReport` for a Search Console metric such as `organicGoogleSearchClicks`, which "requires an
active Search Console link", returns data; (2) owner confirmation; (3) `not determined`. Record the
evidence with the state: `linked (Data API probe)`, `linked (owner-confirmed)`, `not linked
(owner-confirmed)` or `not determined`.

### Clarity masking

- **Unmask check.** `data-clarity-unmask="true"` on an element that contains a form or personal data (names, emails, phone numbers, document IDs) is a finding with the element as Evidence. Note that input boxes and dropdowns are masked in all modes, while surrounding text is not.
- **Mode.** Strict, Balanced (default) or Relaxed is a project setting (Settings, Masking) that no API used here exposes. Owner-confirmed Strict or Balanced passes; owner-confirmed Relaxed is a finding (it masks only input boxes and dropdowns, not personal data shown as text); otherwise `not determined`.
- **Personal data as text.** Pages that display it (confirmation, account) carry `data-clarity-mask` or a mask-by-element rule, or the mode is Strict. Masking changes are not retroactive.

---

## 6. Data checklist

**GA4, last 28 days**, read-only, dimensions `landingPage`, `hostName`, `sessionDefaultChannelGroup`, `sessionSource`, `eventName`; metrics `sessions`, `keyEvents`.

- Organic sessions by landing page (`sessionDefaultChannelGroup` = `Organic Search`).
- Share of `(not set)` landing pages: a placeholder Analytics uses when it received no information for a dimension.
- Key events by `eventName`, and key events with a zero count over the period.
- Self-referral and payment-gateway sources in `sessionSource`.
- Data thresholds apply to GA4 reports; note it when a count looks low.

**Clarity**, inside the 1 to 3 day window and the quota of section 3: dead clicks, rage clicks,
quickback clicks, script errors and scroll depth on landing pages that carry a conversion action.
State the window ("last 72 hours") next to every Clarity figure. Report a 1,000-row response as
truncated. State the number of requests used.

Write each finding's Impact in conversion or UX terms ("visitors fail to reach WhatsApp"), never as
a ranking effect.

---

## 7. Search → Conversion join

GSC side: `search_analytics_query` grouped by `page` (limit 250) and by `query,page` (limit 1,000),
over GA4's date range. Pages beyond 250 are counted, not joined.

- **Normalize** before joining: GA4 `hostName` + `landingPage` against GSC `page`; one host form, trailing slash, query string stripped.
- **Unmatched rows** are listed, not dropped silently.
- **Caveats printed with the table:** GSC clicks are not GA4 sessions; consent choices and data thresholds reduce GA4 counts; date ranges and time zones differ.
- **Wording:** "landing pages reached from these queries". A query never "causes" conversions.

---

## 8. Do not raise

- A ranking claim made from behavior data (section 2).
- A millisecond or score cost for a tag without a measurement from this run.
- A legal verdict: write "signal inconsistent with the consent requirement under <rule>" and stop. Ley 1581 is never cited as a cookie-banner mandate.
- Aggregate data only: no user IDs, client IDs, IP addresses, session-recording URLs or raw event payloads appear in a finding or the report.
- A write to a GA4, GTM or Clarity property.

---

## 9. Sources

All checked 2026-10-22.

- `[PRIMARY]` [Ley 1581 de 2012, Función Pública (Arts. 3, 9, 12)](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981), checked 2026-10-22
- `[PRIMARY]` [Decreto 1377 de 2013, Función Pública (Arts. 5, 7, 8)](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=53646), checked 2026-10-22
- `[PRIMARY]` [Decreto 1377 de 2013 with compilation notes into Decreto 1074 de 2015 (Cancillería normograma)](https://cancilleria.gov.co/sites/default/files/Normograma/docs/decreto_1377_2013.htm), checked 2026-10-22
- `[PRIMARY]` [ePrivacy Directive 2002/58/EC Art. 5(3), legislation.gov.uk reproduction](https://www.legislation.gov.uk/eudr/2002/58/article/5), checked 2026-10-22
- `[PRIMARY]` [GDPR Art. 4(11), legislation.gov.uk reproduction](https://www.legislation.gov.uk/eur/2016/679/article/4), checked 2026-10-22
- `[PRIMARY]` [GDPR Art. 7, legislation.gov.uk reproduction](https://www.legislation.gov.uk/eur/2016/679/article/7), checked 2026-10-22
- `[PRIMARY]` [Google tag: consent mode guide](https://developers.google.com/tag-platform/security/guides/consent), checked 2026-10-22
- `[PRIMARY]` [Google tag: install gtag.js](https://developers.google.com/tag-platform/gtagjs/install), checked 2026-10-22
- `[PRIMARY]` [GA4 Data API: dimensions and metrics schema](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema), checked 2026-10-22
- `[PRIMARY]` [GA4 Admin API REST reference](https://developers.google.com/analytics/devguides/config/admin/v1/rest), checked 2026-10-22
- `[PRIMARY]` [Google Analytics MCP server (experimental)](https://github.com/googleanalytics/google-analytics-mcp), checked 2026-10-22
- `[PRIMARY]` [Analytics Help: what (not set) means](https://support.google.com/analytics/answer/13504892), checked 2026-10-22
- `[PRIMARY]` [Analytics Help: about data thresholds](https://support.google.com/analytics/answer/9383630), checked 2026-10-22
- `[PRIMARY]` [Clarity Data Export API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-data-export-api), checked 2026-10-22
- `[PRIMARY]` [Clarity consent API v2](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2), checked 2026-10-22
- `[PRIMARY]` [Clarity masking](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking), checked 2026-10-22
- `[PRIMARY]` [Clarity manual setup and verification](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup), checked 2026-10-22
- `[INDUSTRY]` [SEJ: Is bounce rate a Google ranking factor? (Cutts, Illyes, Mueller statements as reported)](https://www.searchenginejournal.com/ranking-factors/bounce-rate/), checked 2026-10-22
- `[INDUSTRY]` [SERoundtable: Google again, no Analytics bounce rate for ranking (Mueller, 2020, as reported)](https://www.seroundtable.com/google-analytics-bounce-rates-for-ranking-29622.html), checked 2026-10-22
