# `/akili-seo`

Provision Google Search Console ownership for a domain, run a technical SEO audit, and write reports under a spec path.

## Usage

```text
/akili-seo <site-domain>
```

Examples:

```text
/akili-seo example.com
/akili-seo seo/example.com
```

## Path Rules

Bare domains default to:

```text
docs/specs/seo/<domain>/
```

Paths containing `/` are treated as explicit spec paths under `docs/specs/`.

## Prerequisites

- Google Cloud service account JSON key stored outside the repo.
- Site Verification API enabled.
- Search Console API enabled.
- DNS provider access for the target domain.
- `gsc` MCP configured from `.mcp.json.example`.
- Python dependencies for the bundled verification helper: `google-auth` and `google-api-python-client`.

Optional, only if you opt in to the analytics phase (a missing item skips only its part of Phase 2B, never the run):

- GA4: the Data API and Admin API enabled with the service account as **Viewer** on the property, or the official Google Analytics MCP started without `--allow-write`.
- Clarity: a Data Export API token from a project admin, supplied at run time and never stored.

The Web Search Indexing API is not required for generic sites. Google only honors it for `JobPosting` and `BroadcastEvent` schemas.

## Outputs

Creates or updates:

```text
docs/specs/<spec-path>/seo-setup-report.md
docs/specs/<spec-path>/seo-audit-report.md
```

## Audit Areas

- DNS TXT verification and property ownership
- Search Console property visibility
- sitemap submission and sitemap URL inventory
- URL inspection and index coverage
- structured data warnings and errors
- search analytics by query, page, country, and device
- server-rendered content checks with Googlebot user agent
- internal linking quick check
- on-page audit (titles, metas, headings, canonicals, hreflang) via the `seo-audit` skill
- optional Phase 2B, GA4 and Microsoft Clarity: installation, consent signals, conversion events, GSC link, data checks, and the Search → Conversion join; asked once at Phase 0, read-only, skipped with a note when neither tool is detected
- prioritized remediation plan, with analytics findings in a separate Measurement & Compliance group
- implementation prompt for high-severity fixes

## Skills

The audit phase loads the packaged [`seo-audit`](../skills/seo-audit.md) skill: findings follow its Issue / Impact / Evidence / Fix / Priority format and are weighted by its priority order (crawlability → technical → on-page → content → authority). In Phase 2B the skill's Analytics & Conversion Measurement section and `references/analytics.md` apply: behavior metrics (e.g. bounce or engagement rate, heatmaps, recordings) feed conversion and UX findings and are never claimed to affect Google or Bing ranking; consent checks are compliance signals, not legal advice, and `Other jurisdictions: not audited`. `systematic-debugging` applies when index data is inconsistent with site reality.

## Helper Resources

| Resource | Purpose |
|---|---|
| `scripts/gsc_verify.py` | Calls Site Verification API for token and verify operations |
| `.mcp.json.example` | Reference MCP config for `@mikusnuz/gsc-mcp` |

## When To Run

Run after deployment, after major content changes, after schema changes, or when Search Console ownership needs to be provisioned for a service account.
