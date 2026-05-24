---
description: Enhance pages and search engine optimization following SEO best practices.
---

# SEO Setup & Audit via Google Search Console

Provision Google Search Console access for a domain via a Google Cloud service account, then run a full SEO audit (index coverage, sitemaps, structured data, search analytics) and generate an audit report under the spec path. Produces `seo-setup-report.md` and `seo-audit-report.md`.

## Usage

```
/sdd-seo <site-domain>
```

**Examples:**

- `/sdd-seo calismiledesign.com`
- `/sdd-seo seo/calismiledesign.com`
- `/sdd-seo agrosmartco.com`

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
5. A local helper for the Site Verification API. The `gsc` MCP does **not** expose Site Verification endpoints (no `getToken`, no `verify`) — it only wraps the Search Console API. Use the bundled `scripts/gsc_verify.py` from `sdd-jc-methodology` (depends on `google-auth` and `google-api-python-client`). Invoke it as:

   ```bash
   GSC_KEY_PATH=/abs/path/to/key.json python3 scripts/gsc_verify.py get <domain>
   GSC_KEY_PATH=/abs/path/to/key.json python3 scripts/gsc_verify.py verify <domain>
   ```

If any prerequisite is missing, stop and report exactly what is missing and how to obtain it.

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

---

## Behavior

### Phase 0: Setup

1. Resolve the spec path. If `$ARGUMENTS` is a bare domain, set `SPEC_PATH = seo/<domain>`. Otherwise treat `$ARGUMENTS` as the literal spec path.
2. Create directory `docs/specs/$SPEC_PATH/` if it does not exist.
3. Read the constitutional templates and project context as defined in `sdd-specify`:
   - `docs/specs/general-setup/`
   - `docs/prd.md`
   - `docs/system-design/design.md` or `docs/system-design.md`
   - `docs/detailed-design/detailed-design.md` or `docs/detailed-design.md`
   - Root `CLAUDE.md`
4. Confirm the GSC MCP is reachable. If not, stop and report.

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

---

### Phase 3: Write `seo-audit-report.md`

Generate `docs/specs/$SPEC_PATH/seo-audit-report.md` using `docs/specs/general-setup/validation-report.md` as the format source where it fits.

Required sections:

1. Document Control
2. Executive Summary — one-paragraph verdict + 3–5 bullet headline findings.
3. Index Coverage Table — every audited URL with its bucket and last crawl time.
4. Sitemap Status
5. Structured Data Findings — exact broken JSON-LD blocks with corrected versions.
6. Search Analytics Summary — top queries / pages / devices / countries, or an explicit "no data yet" note.
7. Render Audit
8. Internal Linking Findings
9. Remediation Plan — prioritized (High / Medium / Low) actionable items, each scoped enough that an implementer can execute it without further discovery.
10. Re-audit Schedule — when to run `/sdd-seo <domain>` again.

The report title must be `# SEO Audit Report — <domain>`.

---

### Phase 4: Generate a Fix Prompt

Append to the audit report a section titled `## Implementation Prompt` containing a fenced, copy-paste prompt that can be handed to Claude Code (or any engineer) inside the site's codebase to fix every High-severity finding. The prompt must:

- Reference each finding by ID from the remediation plan.
- Include exact JSON-LD before/after snippets where structured data is broken.
- Include exact URL pairs for hreflang corrections.
- End with "Show me a diff of every change before applying. Do not deploy until I approve."

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
- [ ] The implementation prompt is self-contained and would not require this conversation to execute.

---

## Error Handling

- If the Site Verification API returns `failedVerification`, do not retry blindly — surface the underlying reason (TXT not visible, wrong record, DNSSEC lag) and stop.
- If `sites_add` fails with 403, the service account is not yet a verified owner — return to Phase 1.
- If `sites_list` returns empty after a successful `sites_add`, the MCP cached an old session — instruct the user to restart Claude Code or the `gsc` MCP and retry.
- If `search_analytics_query` returns no rows for a newly verified property, this is expected. Do not mark as failure.
- If the Indexing API is suggested as a fix, decline it for non-`JobPosting`/`BroadcastEvent` content and explain why.
- If a skill is unavailable, fall back to the next documented skill and note it in the report.
