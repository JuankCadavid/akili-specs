---
name: seo-audit
description: When the user wants to audit, review, or diagnose SEO issues on their site. Also use when the user mentions "SEO audit," "technical SEO," "why am I not ranking," "SEO issues," "on-page SEO," "meta tags review," "SEO health check," "my traffic dropped," "lost rankings," "not showing up in Google," "site isn't ranking," "Google update hit me," "page speed," "core web vitals," "crawl errors," or "indexing issues." Also covers generative-engine visibility (GEO/AEO): "AI Overviews," "AI search," "not showing up in ChatGPT," "get cited by AI," "GEO," "answer engine optimization," "llms.txt," "AI crawlers," "GPTBot," or "ClaudeBot." Use this even if the user just says something vague like "my SEO is bad" or "help with SEO" — start with an audit. In AKILI-SPECS projects, /akili-seo loads this skill in its audit phase.
license: MIT
metadata:
  author: Corey Haines (coreyhaines31)
  source: https://github.com/coreyhaines31/marketingskills
  adapted-by: "Juan Carlos Cadavid — jcadavid.com"
  adapted-for: "AKILI-SPECS"
  binding: core
  version: 2.1.0
---

# SEO Audit

You are an expert in search engine optimization. Your goal is to identify SEO issues and provide actionable recommendations to improve organic search performance.

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Before auditing, understand:

1. **Site Context**
   - What type of site? (SaaS, e-commerce, blog, etc.)
   - What's the primary business goal for SEO?
   - What keywords/topics are priorities?

2. **Current State**
   - Any known issues or concerns?
   - Current organic traffic level?
   - Recent changes or migrations?

3. **Scope**
   - Full site audit or specific pages?
   - Technical + on-page, or one focus area?
   - Access to Search Console / analytics?

---

## Audit Framework

### Schema Markup Detection Limitation

**`web_fetch` and `curl` cannot reliably detect structured data / schema markup.**

Many CMS plugins (AIOSEO, Yoast, RankMath) inject JSON-LD via client-side JavaScript — it won't appear in static HTML or `web_fetch` output (which strips `<script>` tags during conversion).

**To accurately check for schema markup, use one of these methods:**
1. **Browser tool** — render the page and run: `document.querySelectorAll('script[type="application/ld+json"]')`
2. **Google Rich Results Test** — https://search.google.com/test/rich-results
3. **Screaming Frog export** — if the client provides one, use it (SF renders JavaScript)

Reporting "no schema found" based solely on `web_fetch` or `curl` leads to false audit findings — these tools can't see JS-injected schema.

### Priority Order
1. **Crawlability & Indexation** (can Google find and index it?)
2. **Technical Foundations** (is the site fast and functional?)
3. **On-Page Optimization** (is content optimized?)
4. **Content Quality** (does it deserve to rank?)
5. **Authority & Links** (does it have credibility?)

**GEO is a layer, not a sixth priority.** Generative-engine visibility (AI Overviews, ChatGPT,
Perplexity) is applied *on top of* pages that already rank or can — roughly three quarters of AI
Overview citations come from pages already in the top 10. Never trade a fix from the list above for a
GEO fix. Run the priority order first, then apply the [GEO section](#generative-engine-optimization-geo).

---

## Technical SEO Audit

### Crawlability

**Robots.txt**
- Check for unintentional blocks
- Verify important pages allowed
- Check sitemap reference
- **`Disallow` is not `noindex`.** A disallowed URL can still be indexed (from external links) and will show as "Indexed, though blocked by robots.txt". To remove a page from the index you must let Google crawl it and serve `noindex` — blocking it prevents Google from ever seeing the directive. A `noindex` line inside `robots.txt` is unsupported and ignored.

**AI crawler directives** (see [GEO reference](references/geo.md) for the full agent table)
- Distinguish **training** agents (`GPTBot`, `ClaudeBot`, `Google-Extended`) from **retrieval** agents (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`) and user-triggered fetchers (`ChatGPT-User`, `Claude-User`, `Perplexity-User`)
- **High-impact finding:** a blanket AI-bot block removes the site from AI answers as well as from training corpora. Confirm the client's intent before treating either state as correct
- `Google-Extended` is a robots.txt token only — it never appears in logs, and blocking it does not affect `Googlebot`, Search, or AI Overviews
- Where the requirement is genuine prevention rather than preference, note that robots.txt is advisory and escalate to WAF/bot management

**XML Sitemap**
- Exists and accessible
- Submitted to Search Console
- Contains only canonical, indexable URLs
- Updated regularly
- Proper formatting

**Site Architecture**
- Important pages within 3 clicks of homepage
- Logical hierarchy
- Internal linking structure
- No orphan pages

**Crawl Budget Issues** (for large sites)
- Parameterized URLs under control
- Faceted navigation handled properly
- Infinite scroll with pagination fallback
- Session IDs not in URLs

### Indexation

**Index Status**
- site:domain.com check
- Search Console coverage report
- Compare indexed vs. expected

**Indexation Issues**
- Noindex tags on important pages
- Canonicals pointing wrong direction
- Redirect chains/loops
- Soft 404s
- Duplicate content without canonicals

**Canonicalization**
- All pages have canonical tags
- Self-referencing canonicals on unique pages
- HTTP → HTTPS canonicals
- www vs. non-www consistency
- Trailing slash consistency

### Site Speed & Core Web Vitals

**Core Web Vitals**
- LCP (Largest Contentful Paint): < 2.5s
- INP (Interaction to Next Paint): < 200ms
- CLS (Cumulative Layout Shift): < 0.1

**Speed Factors**
- Server response time (TTFB)
- Image optimization
- JavaScript execution
- CSS delivery
- Caching headers
- CDN usage
- Font loading

**Tools**
- PageSpeed Insights
- WebPageTest
- Chrome DevTools
- Search Console Core Web Vitals report

### Mobile-Friendliness

- Responsive design (not separate m. site)
- Tap target sizes
- Viewport configured
- No horizontal scroll
- Same content as desktop
- Mobile-first indexing readiness

### Security & HTTPS

- HTTPS across entire site
- Valid SSL certificate
- No mixed content
- HTTP → HTTPS redirects
- HSTS header (bonus)

### URL Structure

- Readable, descriptive URLs
- Keywords in URLs where natural
- Consistent structure
- No unnecessary parameters
- Lowercase and hyphen-separated

---

## International SEO & Localization

Check when the site serves multiple languages or regions. Misconfigurations can suppress indexing of entire locale variants or drag down site-wide quality signals. See [International SEO reference](references/international-seo.md) for evidence and source URLs.

### Hreflang

Three equivalent placement methods: HTML `<link>` in `<head>`, HTTP `Link` headers, XML sitemap `<xhtml:link>`. If using multiple, they must agree -- conflicting signals cause Google to drop that pair. For 10+ locales, prefer sitemap-based (no page weight, no per-request cost).

**Check for:**
- Self-referencing entry on every page (page must include itself in the hreflang set)
- Reciprocal links (if A points to B, B must point back to A -- or both are ignored)
- Valid codes: ISO 639-1 language + optional ISO 3166-1 Alpha 2 region (e.g., `en`, `en-GB` -- never `en-UK`)
- `x-default` present, pointing to fallback page (language selector or default locale)
- All target URLs return 200, are indexable, and match their canonical URL
- No duplicate language-region codes pointing to different URLs

**Common errors:** Missing self-referencing entry (all hreflang ignored). No return tag / one-directional (pair dropped). Invalid codes like `en-UK` (use `en-GB`). Hreflang target is non-canonical, 404, or blocked (cluster discarded). HTML and sitemap annotations disagree (conflicting pair dropped).

**At scale:** `<xhtml:link>` children don't count toward 50K URL sitemap limit, but the 50MB file size limit becomes the bottleneck (plan 2K-5K URLs per file with full hreflang). Focus hreflang on pages receiving wrong-language traffic -- not required on every page. For Bing: supplement with `<html lang>` and `<meta http-equiv="content-language">` (Bing treats hreflang as a weak signal).

### Canonicalization for Multilingual Sites

- Each locale page must self-canonical (e.g., `/ar/page` canonicals to `/ar/page`)
- Never cross-locale canonical (French to English) -- suppresses the non-canonical locale entirely
- Canonical URL must appear in the hreflang set -- if not, all hreflang is ignored
- Canonical overrides hreflang when they conflict
- Protocol/domain must be consistent across canonical, hreflang, and sitemap (`https` + same domain variant)
- Paginated locale pages: self-referencing canonical per page (never canonical page 2+ to page 1)

**Common mistakes:** all locales canonical to English (kills indexing), canonical URL not in hreflang set (silently ignored), protocol mismatch between canonical and hreflang, CMS setting deep page canonical to homepage.

### International Sitemaps

**Check for:**
- `xmlns:xhtml` namespace on `<urlset>`, each `<url>` includes `<xhtml:link>` for all locales including itself
- `x-default` alternate included; all URLs absolute (full protocol + domain)
- Sitemap index in Search Console and robots.txt; split by content type, not by locale

**Next.js caveat:** `alternates.languages` does NOT auto-include a self-referencing `<xhtml:link>` for the `<loc>` URL -- you must add the current locale explicitly.

### Locale URL Structure

**Recommended:** Subdirectories (`/en/`, `/ar/`). **Acceptable:** Subdomains or ccTLDs. **Not recommended:** URL parameters (`?lang=en`).

**Check for:**
- Consistent locale prefix strategy; all locales prefixed (hiding locale from URLs prevents Google from distinguishing versions)
- Root URL handled as `x-default` with redirect, or serves default locale content
- No IP/Accept-Language content negotiation (Googlebot: US IPs, no Accept-Language header)
- Trailing slash + case consistency across locale paths, canonicals, hreflang, and sitemaps
- 301 redirects from non-canonical format to canonical

**Note:** Google's International Targeting report in Search Console is deprecated. Geotargeting relies on hreflang, content signals, and linking patterns.

### Content Quality Across Locales

**Translation quality:**
- AI-translated content is not inherently spam (Google's 2025 stance), but scaled low-value translations can trigger scaled content abuse policy
- Google uses visible content to determine language -- translate ALL page content (title, description, headings, body), not just boilerplate
- Translating only template/nav while main content stays in original language creates duplicates

**Thin locale pages:**
- Helpful content system is site-wide -- many thin locale pages can suppress rankings for strong pages too
- Don't noindex thin locales (wastes crawl budget) or cross-locale canonical (conflicts with hreflang)
- Best approach: don't create locale pages you cannot make genuinely helpful

**Check for:**
- All locale pages have fully translated main content (not just UI chrome)
- No near-identical content across locales ("Duplicate, Google chose different canonical" in GSC)
- Hreflang only for locales with genuine content and search demand
- Localized signals: currency, phone format, addresses where applicable
- Broken hreflang links (404s, redirects) waste crawl budget AND invalidate hreflang clusters

---

## On-Page SEO Audit

### Title Tags

**Check for:**
- Unique titles for each page
- Primary keyword near beginning
- 50-60 characters (visible in SERP)
- Compelling and click-worthy
- Brand name placement (end, usually)

**Common issues:**
- Duplicate titles
- Too long (truncated)
- Too short (wasted opportunity)
- Keyword stuffing
- Missing entirely

### Meta Descriptions

**Check for:**
- Unique descriptions per page
- 150-160 characters
- Includes primary keyword
- Clear value proposition
- Call to action

**Common issues:**
- Duplicate descriptions
- Auto-generated garbage
- Too long/short
- No compelling reason to click

### Heading Structure

**Check for:**
- One H1 per page
- H1 contains primary keyword
- Logical hierarchy (H1 → H2 → H3)
- Headings describe content
- Not just for styling

**Common issues:**
- Multiple H1s
- Skip levels (H1 → H3)
- Headings used for styling only
- No H1 on page

### Content Optimization

**Primary Page Content**
- Keyword in first 100 words
- Related keywords naturally used
- Sufficient depth/length for topic
- Answers search intent
- Better than competitors

**Thin Content Issues**
- Pages with little unique content
- Tag/category pages with no value
- Doorway pages
- Duplicate or near-duplicate content

### Image Optimization

**Check for:**
- Descriptive file names
- Alt text on all images
- Alt text describes image
- Compressed file sizes
- Modern formats (WebP)
- Lazy loading implemented
- Responsive images

### Internal Linking

**Check for:**
- Important pages well-linked
- Descriptive anchor text
- Logical link relationships
- No broken internal links
- Reasonable link count per page

**Common issues:**
- Orphan pages (no internal links)
- Over-optimized anchor text
- Important pages buried
- Excessive footer/sidebar links

### Keyword Targeting

**Per Page**
- Clear primary keyword target
- Title, H1, URL aligned
- Content satisfies search intent
- Not competing with other pages (cannibalization)

**Site-Wide**
- Keyword mapping document
- No major gaps in coverage
- No keyword cannibalization
- Logical topical clusters

### Structured Data

Read the **Schema Markup Detection Limitation** above before auditing this — a static fetch cannot
see JS-injected JSON-LD, and reporting "no schema found" from `curl` output is a false finding.

**Check for:**
- Correct type for the page's purpose (`Article`/`TechArticle`, `Product`, `FAQPage`, `HowTo`, `BreadcrumbList`, `Organization`, `Person`, `SoftwareApplication`, `LocalBusiness`)
- Validates without errors in the Rich Results Test
- Markup matches **visible** page content — invisible or contradictory markup is a spam-policy violation, not an optimization
- `dateModified` present and truthful on content that changes
- Entity nodes (`Organization` / `Person`) carry `sameAs` links to authoritative profiles
- `@id` used consistently so nodes can reference each other instead of being duplicated
- One coherent graph per page rather than several disconnected islands

**Common issues:**
- Required properties missing, so the type is ineligible for rich results
- `FAQPage` markup on content that is not a genuine Q&A
- Schema describing content the user cannot see
- Stale `dateModified` auto-set to build time on unchanged pages
- Duplicate `Organization` nodes on every page with no shared `@id`

Structured data also has a measurable association with citation in generative answers — see the
[GEO section](#generative-engine-optimization-geo).

---

## Content Quality Assessment

### E-E-A-T Signals

**Experience**
- First-hand experience demonstrated
- Original insights/data
- Real examples and case studies

**Expertise**
- Author credentials visible
- Accurate, detailed information
- Properly sourced claims

**Authoritativeness**
- Recognized in the space
- Cited by others
- Industry credentials

**Trustworthiness**
- Accurate information
- Transparent about business
- Contact information available
- Privacy policy, terms
- Secure site (HTTPS)

### Content Depth

- Comprehensive coverage of topic
- Answers follow-up questions
- Better than top-ranking competitors
- Updated and current

### User Engagement Signals — diagnostic only, not ranking factors

**Google does not use analytics engagement metrics as ranking factors.** John Mueller: *"We don't use
bounce rate in search rankings."* Gary Illyes: *"we don't use analytics/bounce rate in search
ranking."* Google has denied this for roughly a decade.

Never write a finding that says "improve bounce rate to improve rankings" — it is a causal claim
Google has explicitly denied, and it damages the credibility of the correct findings next to it.

Use these metrics the other way round: as **diagnostics that localize a content problem**, whose fix
is the content itself.

| Metric | Read it as |
|---|---|
| High exit rate on a ranking page | Possible intent mismatch — the page ranks for a query it does not answer |
| Very low time on page for long-form content | Content may be unscannable, or the answer is buried |
| Pages per session | Internal linking and topical-cluster coverage signal |
| Return visits | Brand and content-quality signal (correlates with, does not cause, ranking) |

- Sources and exact quotes: [SEJ: Is bounce rate a Google ranking factor?](https://www.searchenginejournal.com/ranking-factors/bounce-rate/)

---

## Generative Engine Optimization (GEO)

Visibility inside AI-generated answers — Google AI Overviews / AI Mode, ChatGPT, Claude, Perplexity —
rather than in a ranked list of links. See the [GEO reference](references/geo.md) for the measured
evidence, source tiers, and the full AI-crawler agent table.

**GEO layers on top of ranking; it does not replace it.** Roughly three quarters of AI Overview
citations come from pages already in the top 10. Audit the priority order first.

### What measurably works

Peer-reviewed measurement (GEO-bench, KDD 2024: ~10,000 queries across nine datasets) found the
largest visibility gains come from **evidence, not markup**:

| Finding to raise | Measured effect |
|---|---|
| Claims lack **verifiable statistics** with named sources | ~30–40% gain when added |
| No **credible quotations** where the topic supports them | ~30–40% |
| No **outbound citations** to reliable sources | ~30–40% |
| Poor fluency / readability | ~15–30% |
| Keyword stuffing present | Negligible or **negative** — treat as a defect, not a tactic |

Gains are largest for content that is visible but not dominant (up to +115.1% at position 5), which
is most audit subjects.

### The self-containment test

Generative engines extract **passages**, not pages. For each passage the page wants cited, ask:
*does this paragraph still make sense lifted out with no surrounding context?*

Anaphora that depends on the previous paragraph ("this approach", "as mentioned above", "the former")
breaks extraction. This is the most common GEO defect on otherwise well-optimized pages, and **no
classic on-page check catches it**.

Also require: a **definitional sentence** (*"X is a Y that does Z."*) at first use of every term the
page wants to own, and a Q&A block with the question as the heading and the direct answer in the
first sentence.

### Checks

- [ ] Verifiable statistics, quotations, and outbound citations present
- [ ] Target passages pass the self-containment test
- [ ] Definitional sentence at first use of each ownable term
- [ ] Entity resolvable in one sentence (what it is, who made it); `Person`/`Organization` + `sameAs`
- [ ] `dateModified` exposed; no stale visible version numbers or dates (fresh content is cited far more often)
- [ ] JSON-LD present and valid (see Structured Data above)
- [ ] robots.txt separates training agents from retrieval agents, matching the client's stated intent
- [ ] No unverifiable numeric or superlative claims in `<title>`, meta description, or JSON-LD

### Do not raise these

- **Missing `llms.txt`.** Adoption is ~8.7% of the top 1,000 domains, ~40% of existing files are
  empty plugin stubs, no major AI crawler has committed to consuming it, crawler logs show the
  retrieval agents skip it, and in one citation model removing the variable *improved* accuracy. It
  has a legitimate use as business-to-agent context for IDE agents and MCP servers — recommend it on
  developer-experience grounds or not at all, never as a visibility tactic.
- **"Improve bounce rate to rank better."** See User Engagement Signals above.

---

## Common Issues by Site Type

### SaaS/Product Sites
- Product pages lack content depth
- Blog not integrated with product pages
- Missing comparison/alternative pages
- Feature pages thin on content
- No glossary/educational content

### E-commerce
- Thin category pages
- Duplicate product descriptions
- Missing product schema
- Faceted navigation creating duplicates
- Out-of-stock pages mishandled

### Content/Blog Sites
- Outdated content not refreshed
- Keyword cannibalization
- No topical clustering
- Poor internal linking
- Missing author pages

### Multilingual / Multi-Regional Sites
- Hreflang errors (missing return tags, invalid codes, no self-reference)
- Canonical conflicting with hreflang (cross-locale canonical suppresses indexing)
- Thin locale pages dragging down site-wide quality signal
- Only boilerplate translated, main content identical across locales
- No x-default fallback declared
- Sitemap missing hreflang alternates or missing reciprocal entries
- IP-based redirects hiding content from Googlebot
- Framework locale mode hiding locale from URLs

### Local Business
- Inconsistent NAP
- Missing local schema
- No Google Business Profile optimization
- Missing location pages
- No local content

---

## Output Format

### Audit Report Structure

**Executive Summary**
- Overall health assessment
- Top 3-5 priority issues
- Quick wins identified

**Technical SEO Findings**
For each issue:
- **Issue**: What's wrong
- **Impact**: SEO impact (High/Medium/Low)
- **Evidence**: How you found it
- **Fix**: Specific recommendation
- **Priority**: 1-5 or High/Medium/Low

**On-Page SEO Findings**
Same format as above

**Content Findings**
Same format as above

**Prioritized Action Plan**
1. Critical fixes (blocking indexation/ranking)
2. High-impact improvements
3. Quick wins (easy, immediate benefit)
4. Long-term recommendations

---

## References

- [AI Writing Detection](references/ai-writing-detection.md): Common AI writing patterns to avoid (em dashes, overused phrases, filler words)
- [International SEO](references/international-seo.md): Evidence and sources for hreflang, canonical + i18n, sitemaps, URL structure, and content quality across locales
- [GEO](references/geo.md): Evidence and sources for generative-engine visibility — the KDD 2024 measurement of what works, passage-level extraction, freshness, structured-data correlation, the AI-crawler agent table (training vs retrieval), and why `llms.txt` is not a visibility tactic

---

## Tools Referenced

**Free Tools**
- Google Search Console (essential)
- Google PageSpeed Insights
- Bing Webmaster Tools
- Rich Results Test (**use this for schema validation — it renders JavaScript**)
- Mobile-Friendly Test
- Schema Validator

> **Note on schema detection:** `web_fetch` strips `<script>` tags (including JSON-LD) and cannot detect JS-injected schema. Use the browser tool, Rich Results Test, or Screaming Frog instead — they render JavaScript and capture dynamically-injected markup. See the Schema Markup Detection Limitation section above.

**Paid Tools** (if available)
- Screaming Frog
- Ahrefs / Semrush
- Sitebulb
- ContentKing

---

## Task-Specific Questions

1. What pages/keywords matter most?
2. Do you have Search Console access?
3. Any recent changes or migrations?
4. Who are your top organic competitors?
5. What's your current organic traffic baseline?

---

## AKILI-SPECS Integration

| AKILI moment | How to use this skill |
|---|---|
| `/akili-seo` audit phase | Required skill — load before starting and apply throughout; the Audit Report Structure above is the finding format |
| `/akili-validate` | When validating pages with search-visibility requirements, apply the On-Page checklist to the affected routes |

Adaptation rules:

- Findings land in the AKILI report artifacts (`/akili-seo` output), using the Issue / Impact / Evidence / Fix / Priority shape.
- Fixes that exceed the trivial gate are routed through `/akili-propose` — never applied silently during the audit.
- GEO findings use the same Issue / Impact / Evidence / Fix / Priority shape. Label the source tier when citing a magnitude: the KDD 2024 figures are peer-reviewed, the AI Overview and crawler-behaviour figures are industry analyses. Never present an `[INDUSTRY]` number to a client as measured fact.
- Sibling skills mentioned by upstream versions of this skill (programmatic-seo, cro, analytics) are **not packaged** with AKILI-SPECS; when a finding needs them, note the gap in the report instead of loading them. The upstream `schema` and `ai-seo` gaps are now covered in-skill by the **Structured Data** and **GEO** sections.
