# Generative Engine Optimization (GEO): Evidence & Sources

Visibility inside AI-generated answers (Google AI Overviews / AI Mode, ChatGPT, Claude, Perplexity)
rather than in a ranked list of links.

**Source tiers used below.** `[PRIMARY]` = peer-reviewed research or first-party vendor
documentation. `[INDUSTRY]` = vendor or agency analysis of observed data; directionally useful,
methodology usually undisclosed, treat magnitudes as indicative not exact. Do not present
`[INDUSTRY]` figures to a client as measured fact.

---

## GEO is not a replacement for SEO

`[INDUSTRY]` 76% of Google AI Overview citations come from pages already ranking in the top 10 —
classic ranking is the qualifying condition, not an alternative to it. A meaningful long tail exists
(46.5% of cited URLs rank outside the top 50), so ranking is strongly predictive but not required.

**Audit consequence:** never trade a classic SEO fix for a GEO fix. Run the standard audit priority
order first; GEO is an additional layer applied to pages that already rank or can.

- [CXL: Where Google AI Overviews cite from — 100-page study](https://cxl.com/blog/google-ai-overview-citation-sources/)

---

## What measurably improves generative visibility

`[PRIMARY]` The GEO study (Aggarwal, Murahari, Rajpurohit, Kalyan, Narasimhan, Deshpande — KDD
2024) built GEO-bench: ~10,000 queries across nine datasets, against a two-stage pipeline (Google
Search retrieves top-5 sources, then an LLM synthesizes a cited answer). It tested nine content
modifications and measured visibility change.

| Modification | Measured effect |
|---|---|
| Adding **verifiable statistics** | ~30–40% gain (position-adjusted word count) |
| Adding **credible quotations** | ~30–40% gain |
| **Citing reliable sources** | ~30–40% gain |
| Improving **fluency / readability** | ~15–30% gain |
| **Keyword stuffing** | negligible or **negative** |

Aggregate reported improvement across successful methods: **22–41%**.

**The Equalizer Effect.** `[PRIMARY]` Gains are largest for lower-ranked sources — up to **+115.1%**
visibility for content at position 5. GEO disproportionately benefits sites that are visible but not
dominant, which is precisely the audit population that most needs it.

**Audit consequence:** the three highest-yield GEO findings are all citation-and-evidence findings,
not markup findings. A page making unsourced claims is a GEO defect even when its technical SEO is
clean.

- [arXiv: GEO — Generative Engine Optimization (2311.09735)](https://arxiv.org/pdf/2311.09735)
- [dblp: KDD 2024 record](https://dblp.dagstuhl.de/rec/conf/kdd/AggarwalMRKND24.html)
- [Princeton: publication record](https://collaborate.princeton.edu/en/publications/geo-generative-engine-optimization/)
- [Blck Alpaca: methodology and critique of the Princeton GEO study](https://blckalpaca.at/en/knowledge-base/seo-geo/geo-generative-engine-optimization/the-princeton-geo-study-methodology-results-and-critique)

---

## Extraction happens at passage level, not page level

`[INDUSTRY]` Generative engines lift **short, self-contained passages**. Paragraphs that answer one
specific question are far more likely to be extracted than long blocks where the answer is diluted
across sentences. Content types cited most: direct answers to specific questions, comparison tables,
statistics attributed to named sources, and step-by-step instructions.

**Audit consequence — the self-containment test.** For each target passage, ask: *does this
paragraph still make sense lifted out of the page with no surrounding context?* Anaphora that
depends on the previous paragraph ("this approach", "as mentioned above", "the former") breaks
extraction. This is the single most common GEO defect on otherwise well-optimized pages, and it is
invisible to every classic on-page check.

**Definitional-sentence pattern.** For each term the page wants to own, include one sentence of the
form *"X is a Y that does Z."* at first use. That sentence is what gets quoted verbatim.

- [Contently: how to get cited in Google AI Overviews (2026)](https://contently.com/2026/02/25/how-to-get-cited-google-ai-overviews/)
- [CXL: Where Google AI Overviews cite from](https://cxl.com/blog/google-ai-overview-citation-sources/)

---

## Freshness is weighted heavily

`[INDUSTRY]` Content under three months old is reported as ~3x more likely to be cited in AI
Overviews.

**Audit consequence:** stale version numbers, undated articles, and missing `dateModified` are GEO
findings, not just hygiene. For tooling and documentation pages specifically, a visible version
number that lags the shipped release is a direct credibility signal against the page. Prefer reading
such values from a live source at build time over hardcoding them.

- [Heroic Rankings: Google AI Overview statistics 2026](https://heroicrankings.com/seo/managed/google-ai-overview-statistics-2026/)

---

## Structured data correlates with citation

`[INDUSTRY]` Reported: 65% of pages cited by Google AI Mode carry structured data markup; 71% of
pages cited by ChatGPT do. Figures span all schema types (`Article`, `Organization`, `Product`,
`Review`, `FAQPage`, `HowTo`).

**Read this as correlation, not proven causation** — pages with schema also tend to be better
maintained overall. It is still a cheap, low-risk intervention with a plausible mechanism
(machine-readable facts survive extraction better than prose).

Highest-value types for GEO:

| Type | Use for |
|---|---|
| `FAQPage` | Q&A blocks — the densest citable surface on most pages |
| `HowTo` | Step-by-step procedures |
| `TechArticle` / `Article` | Carries `dateModified`, feeding the freshness signal |
| `SoftwareApplication` | Tools and packages — carries `softwareVersion` |
| `Person` / `Organization` with `sameAs` | Entity resolution and author authority |

**Entity disambiguation.** State plainly, in one sentence, what the subject *is* and who made it.
Ambiguous brand names must be resolvable without inference. Bind the page to a `Person` or
`Organization` node with `sameAs` links to authoritative profiles.

- [Contently: 2026 AI Overview tactics](https://contently.com/2026/02/25/how-to-get-cited-google-ai-overviews/)
- [Digital Applied: content strategy for AI Overviews, post-I/O 2026](https://www.digitalapplied.com/blog/content-strategy-ai-overviews-post-io-guide-2026)

---

## AI crawler access control

`[PRIMARY]` The agents split by **purpose**, and that split is the whole point of auditing them:

| Vendor | Training | Search / retrieval | User-triggered |
|---|---|---|---|
| OpenAI | `GPTBot` | `OAI-SearchBot` | `ChatGPT-User` |
| Anthropic | `ClaudeBot` | `Claude-SearchBot` | `Claude-User` |
| Perplexity | — | `PerplexityBot` | `Perplexity-User` |
| Google | `Google-Extended` | (Googlebot) | — |

**The consequential audit finding:** a site that blanket-blocks AI bots to avoid training also
blocks the retrieval agents, and therefore removes itself from AI answers entirely. If the goal is
visibility without feeding training, allow the search and user agents and disallow only the training
agents.

**`Google-Extended` is a robots.txt token, not a user agent.** It never appears in server logs.
`Disallow: /` under `Google-Extended` opts out of Gemini training while leaving `Googlebot` — and
therefore Search and AI Overviews — unaffected. Auditing for it in logs will always produce a false
negative.

**robots.txt is a request, not enforcement.** `[INDUSTRY]` Cloudflare reported (2025-08-04)
observing Perplexity using undeclared crawlers that rotate user-agent, IP, and ASN to bypass
no-crawl directives. When a client's requirement is actually *prevention* rather than *preference*,
robots.txt is the wrong control — escalate to WAF/bot-management, and say so in the finding.

- [Anagram: AI crawlers explained — GPTBot, ClaudeBot, PerplexityBot (2026)](https://www.anagram.ai/blog/ai-crawlers-explained-gptbot-claudebot-perplexitybot-and-how-to-let-them-in-2026)
- [AuditAE: AI crawlers list 2026 — ClaudeBot, GPTBot, OAI-SearchBot](https://auditae.app/blog/ai-crawlers-explained)
- [Witscode: robots.txt strategy 2026 — managing AI crawlers](https://witscode.com/blogs/robots-txt-strategy-2026-managing-ai-crawlers)

---

## llms.txt: do not recommend it for AI search visibility

`[INDUSTRY]` The evidence is consistently negative, and this contradicts widespread advice:

- Adoption is ~8.7% of the top 1,000 domains (June 2026); ~10% in other samples.
- **39.6% of existing files are empty plugin stubs.**
- No major AI crawler has committed to consuming the format.
- Crawler-log analyses find GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot and Google-Extended
  **overwhelmingly skip `/llms.txt`** and crawl HTML directly.
- In one citation-frequency model, **removing the llms.txt variable improved prediction accuracy** —
  it contributed noise, not signal.

**Audit consequence:** do not raise "missing llms.txt" as a finding, and do not recommend building
one as a GEO tactic. If a client already has one, leave it. The format does have a real use —
**business-to-agent context for IDE agents and MCP servers** — which is a developer-experience
decision, not a search-visibility one. Recommend it on those grounds or not at all.

- [Rankability: llms.txt adoption data — 8.7% of the top 1,000 (June 2026)](https://www.rankability.com/data/llms-txt-adoption/)
- [aeo.press: the state of llms.txt in 2026](https://www.aeo.press/ai/the-state-of-llms-txt-in-2026)
- [OrganiKPI: llms.txt adoption and impact](https://organikpi.com/blog/distribution/llms-txt-adoption-impact/)

---

## What does not work

| Tactic | Status |
|---|---|
| Keyword stuffing | `[PRIMARY]` Negligible or **negative** effect on generative visibility |
| Unverifiable superlatives and performance claims | Dropped during extraction; adjacent verifiable claims lose credibility by association |
| `llms.txt` as a visibility play | `[INDUSTRY]` No measured effect; see above |
| Blanket-blocking all AI user agents | Removes the site from AI answers along with training corpora |
| Prose-only pages with no extractable passages | Structurally unciteable regardless of quality |

---

## Audit checklist

- [ ] Page already ranks (or can) for its target query — GEO layers on top of ranking, never replaces it
- [ ] Claims carry **verifiable statistics** with named sources (highest measured yield)
- [ ] **Credible quotations** present where the topic supports them
- [ ] **Outbound citations** to reliable sources present
- [ ] Every target passage passes the **self-containment test**
- [ ] Each ownable term has a **definitional sentence** at first use
- [ ] Q&A block present, question as heading, direct answer in the first sentence
- [ ] Entity resolvable in one sentence (what it is, who made it)
- [ ] `dateModified` exposed; visible version/date values not stale
- [ ] JSON-LD present and valid — `FAQPage` / `HowTo` / `Article` as applicable, plus `Person`/`Organization` with `sameAs`
- [ ] robots.txt distinguishes **training** agents from **retrieval** agents, and the split matches the client's stated intent
- [ ] No unverifiable numeric claims in `<title>`, meta description, or JSON-LD
- [ ] **Not** flagged: missing `llms.txt`
