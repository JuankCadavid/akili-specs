# `/sdd-seo`

Provision Google Search Console ownership for a domain, run a technical SEO audit, and write reports under a spec path.

## Usage

```text
/sdd-seo <site-domain>
```

Examples:

```text
/sdd-seo example.com
/sdd-seo seo/example.com
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
- prioritized remediation plan
- implementation prompt for high-severity fixes

## Helper Resources

| Resource | Purpose |
|---|---|
| `scripts/gsc_verify.py` | Calls Site Verification API for token and verify operations |
| `.mcp.json.example` | Reference MCP config for `@mikusnuz/gsc-mcp` |

## When To Run

Run after deployment, after major content changes, after schema changes, or when Search Console ownership needs to be provisioned for a service account.
