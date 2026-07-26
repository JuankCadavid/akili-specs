# `seo-audit`

## Purpose

Provides an expert SEO audit framework: crawlability and indexation, technical foundations (Core Web Vitals, mobile, HTTPS), on-page optimization (titles, metas, headings, images, internal linking), structured data, international SEO (hreflang, locale canonicals, locale sitemaps), content quality (E-E-A-T), **generative-engine visibility (GEO)**, and a standard finding format.

AKILI-adapted: findings use the Issue/Impact/Evidence/Fix/Priority shape inside `/akili-seo` artifacts, non-trivial fixes escalate to `/akili-propose`, and dangling references to unpackaged sibling skills were removed. Binding: `core`.

AKILI-original additions (not in the upstream skill): the **GEO** section and `references/geo.md`; the **Structured Data** audit section; AI-crawler directive auditing; the `Disallow` ≠ `noindex` correction; and the rewrite of engagement metrics from ranking factors to diagnostics.

## Use When

- Auditing, reviewing, or diagnosing SEO issues on a site.
- Rankings or organic traffic dropped and the cause is unknown.
- Reviewing meta tags, structured data, page speed, or indexing issues.
- The site is absent from AI answers (AI Overviews, ChatGPT, Perplexity), or AI-crawler access needs a decision.
- Running the audit phase of `/akili-seo`.

## Core Rules

- Findings follow the **Issue / Impact / Evidence / Fix / Priority** structure.
- Findings are weighted by priority order: crawlability → technical → on-page → content quality → authority.
- **GEO is a layer, not a sixth priority** — ~3/4 of AI Overview citations come from pages already in the top 10, so a GEO fix never displaces a classic-SEO fix.
- **Source tiers are carried into findings.** Peer-reviewed magnitudes (KDD 2024 GEO study) and industry analyses are labelled differently; an industry figure is never presented to a client as measured fact.
- Static fetches (`curl`, `web_fetch`) cannot detect JS-injected JSON-LD; structured data must be validated with a rendering tool or Search Console URL inspection.
- **Two findings are explicitly banned:** "missing `llms.txt`" (no measured visibility effect) and any claim that engagement metrics such as bounce rate affect rankings (Google has denied this for a decade).

## Best Paired Commands

- `/akili-seo` for the audit phase (index coverage, structured data, render, on-page checks).
- `/akili-validate` when a spec includes SEO acceptance criteria.

## References (progressive disclosure)

- `references/geo.md` — generative-engine visibility: the KDD 2024 measurement of what works, passage-level extraction, freshness, structured-data correlation, the AI-crawler agent table (training vs retrieval), and the negative evidence on `llms.txt`. Claims carry `[PRIMARY]` / `[INDUSTRY]` source tiers.
- `references/international-seo.md` — hreflang, canonical + i18n, locale sitemaps, URL structure, cross-locale content quality.
- `references/ai-writing-detection.md` — AI writing patterns to avoid.

## Source

- `../../.claude/skills/seo-audit/SKILL.md`
