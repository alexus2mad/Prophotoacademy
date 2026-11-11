# Academy SEO and answer-engine audit

Audit date: 12 November 2026. Audience: prospective photography and content students in Kyiv and online learners throughout Ukraine. Implementation uses GPT 6.1 Sol. The approved Studio design, existing course URLs and enrollment policies remain authoritative.

## Evidence and limits

The baseline covers the 16 public production sitemap URLs, response headers, rendered HTML, canonicals, titles, descriptions, headings, structured data, image declarations, internal links and redirect paths. It also checks staging and public responses from private/review route families without signing in or exposing lesson content.

Google's public `site:prophotoacademy.com.ua` search visibly returned these five URLs on the audit date:

| URL | Required migration action |
| --- | --- |
| `/` | Keep the existing page and canonical origin |
| `/contacts` | Keep URL; improve Ukrainian title and description |
| `/reviews` | Keep URL and attributed reviews |
| `/individual-training` | Keep URL; improve discovery from Academy |
| `/food-product-photography` | Keep the historically indexed commercial-course URL |

These are observed search results, **not the complete Google index or a ranking report**. Search Console is unavailable. The connected analytics account does not expose an Academy property. Clicks, impressions, conversions, backlink counts and query volumes therefore remain unverified. Google's [site-operator documentation](https://developers.google.com/search/docs/monitor-debug/search-operators/all-search-site) explicitly says results can be incomplete.

The original Webflow site's current page inventory has 15 paths. The October migration archive supplies 12 captured HTML pages and an empty CMS-collection inventory. The current connector rejects its documented CMS read action, and the legacy redirect API requires an Enterprise plan the site does not have. These limits are recorded rather than treated as evidence that no other historical URL exists. The current site has no lost business-page destination in the inspected inventory. The unrelated Webflow accessibility demo is not Academy teaching content and receives no invented redirect.

Private audit evidence is under `.data/seo-2026/`: before/after crawl JSON, Google result URLs and screenshot, Webflow route inventory, content analysis and verification logs. The repeatable public-only crawler and reviewed route decisions are versioned under `scripts/seo-audit/`. Private teaching content and customer records are excluded.

## Findings and implemented scope

| Priority | Baseline finding | Resolution in this change |
| --- | --- | --- |
| P1 | `/courses` uses a temporary redirect; `/page-in-progress` takes two hops through it | Exact path matches in the application proxy issue direct 301s to `/academy`, preserving query parameters; one canonical index in both retained visual variants |
| P1 | Five public pages reuse a generic description; both legal pages have none | Page-specific Ukrainian metadata, a shared canonical helper and accurate Kyiv/online context |
| P1 | No shared Academy business/site identity; course markup has disconnected provider details | Truthful EducationalOrganization and WebSite identities, Course data and breadcrumbs where the visible page supports them |
| P1 | Staging is noindex at nginx but advertises a populated sitemap | Explicit environment indexing policy, empty staging discovery output and preserved nginx protection |
| P1 | Draft/public preview and reserved URL boundaries need stronger coverage | Explicit noindex handling and sitemap exclusions, with tests; authentication remains the protection for paid material |
| P2 | Individual/team detail pages and the complete student portfolio have weak internal discovery | Contextual links from the relevant existing Academy sections and course galleries; footer access to Academy background and legal pages |
| P2 | Generic format copy implies Kyiv practice for every course | Render the configured format per offer; keep unconfirmed food-course details inquiry-led |
| P2 | Kyiv and online workshop participation is not clear in the event announcement | Render the already-confirmed participation description; improve its text contrast |
| P2 | The initial homepage photograph competes with other eager carousel images | Give the first visible responsive picture high fetch priority without preloading the other slides or changing animation |

Baseline strengths: all 16 sitemap pages return 200, public documents use Ukrainian language metadata and one H1, image alt/dimensions are present, critical public content is server-rendered, and sampled Googlebot and OAI-SearchBot requests receive head metadata. The canonical hostname already redirects HTTP and `www` variants to HTTPS apex. Existing commerce and private-content boundaries remain separate from this work.

## Migration rules

Keep working legacy URLs with their existing intent. The indexed `/food-product-photography` path represents the commercial-content program; the newer `/food-photography` page represents the narrower food course. Renaming or merging them would obscure that distinction and risk existing links.

Only redirect when there is a genuine replacement. `/courses` and the historical course-placeholder path lead to `/academy`; retired utilities without relevant replacements retain proper noindex/404 behavior. Unknown URLs must return 404, not redirect to the homepage. Keep historical event pages useful as records and never imply that an ended event is bookable.

Retain permanent redirects for at least one year, preferably indefinitely while useful links exist. Internal navigation points straight to the final destination. Query preservation, final status and absence of loops are tested in both presentation variants. Google's [migration guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) recommends direct permanent redirects and monitoring throughout recrawling. A CMS/hosting change on the same domain does not require a domain Change of Address request.

When Search Console becomes available, reconcile its Page Indexing, performance landing pages and external links with the reviewed manifest. Add only evidence-backed old paths. Compare the previous 28 days with the following full 28-day period, accounting for closed course sales and event dates. The present audit cannot promise zero traffic fluctuation.

## Audience and landing-page ownership

The queries below express intent, not measured search volumes or guaranteed rankings.

| Intent | Ukrainian query examples | Primary destination |
| --- | --- | --- |
| School in Kyiv; online choice nationwide | фотошкола Київ; курси фотографії Київ; онлайн курси фотографії | `/academy` |
| Beginner photography on phone or camera | курс фотографії з нуля; курс мобільної фотографії | `/visual-content` |
| Commercial photo/video for brands | курс комерційної зйомки; курс контент-кріейтора | `/food-product-photography` |
| Food and product stills | курс фуд фотографії; курс предметної зйомки | `/food-photography` |
| Expert brand and Instagram content | курс створення контенту для Instagram | `/course-smm-instagram` |
| Personal or team instruction | індивідуальні уроки фотографії; корпоративне навчання контенту | `/individual-training`, `/corporate-training` |
| Named practical AI event | AI Artwork; майстер-клас Photoshop Firefly Київ | `/ai-artwork` |
| Trust, location and real outcomes | ProPhoto Academy контакти; відгуки; роботи студентів | `/contacts`, `/reviews`, `/student-work` |

Keep one useful destination for each intent. Do not create near-duplicate city pages, translated URLs without translations, or generic AI articles for every keyword. Existing programs should answer audience, device, format, syllabus, instructor, package differences and current enrollment status in visible text. Unknown dates, venue details and benefits stay explicitly unconfirmed.

## Kyiv identity and factual boundaries

The owner confirmed **Київ, вул. Саксаганського, 24/25** on 12 November 2026. This agrees with the current site and designer decision. Older indexed content still mentions Введенська, 32; do not restore that address from a stale search snippet.

Academy, Hub and Shop remain distinct customer journeys. Do not imply every course or the AI workshop takes place at the contact address. No guessed geocoordinates, postcode, opening hours or event venue are added. Academy social links associated with a named founder must not silently become organization identity claims.

The next external local-search task is reconciling an eligible, owned Google Business Profile and legitimate listings with the confirmed address, actual visiting hours and appropriate school category. Verify signage and customer-facing arrangements before creating or merging a profile. No profile edits, paid listings or messages to third parties are performed here. [Google local ranking guidance](https://support.google.com/business/answer/7091)

## Answer-engine work grounded in 2026 guidance

Google's May 2026 [generative AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) continues to emphasize helpful original content, accessible pages and clear business facts. This release improves those foundations. It does not add special AI markup, hidden keyword paragraphs or an `llms.txt` file as a claimed Google ranking factor.

[Bing's webmaster guidelines](https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a) likewise connect discovery, canonical URLs and accessible content with eligibility for Bing Search and Copilot grounding. Verify the production domain in Bing Webmaster Tools before using its reports; no IndexNow submission is made as part of this release.

Next serves complete head metadata on the first response to the documented [OpenAI search and user fetchers](https://developers.openai.com/api/docs/bots) and [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers). This only changes delivery of public page metadata; it does not change crawl permissions, authentication or training policies.

The existing native FAQs remain useful answers for visitors. Google retired FAQ rich results from May 2026; FAQ markup is not a promised search enhancement. Google's current [Course list documentation](https://developers.google.com/search/docs/appearance/structured-data/course) limits that rich result to English. Ukrainian Course markup is used to describe the real program, not to promise a course carousel. No fabricated review stars, ratings or unsupported offers are added. [Documentation updates](https://developers.google.com/search/updates)

Prioritize instructor-approved first-hand material next: a real lighting exercise with setup and results, an explained student before/after, and a factual AI Artwork recap after the event. Publish only cleared images with attribution. Useful instructor experience and actual learning outcomes offer more substance than generated generic advice.

Search and user-request fetchers receive metadata in the initial document head. OAI-SearchBot and PerplexityBot are search crawlers; ChatGPT-User and Perplexity-User serve user requests. This rendering compatibility does not authenticate those agents, weaken access control, or change model-training permissions. [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots) · [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)

When property access returns, check ordinary Google Search performance for Ukraine and Kyiv-intent queries, and the 2026 Generative AI performance report where available. Measure inquiries and confirmed purchases alongside visibility; clicks on cross-site links are not completed sales. Generative AI impressions and citation observations are separate from conversions. [Search Console report documentation](https://support.google.com/webmasters/answer/16984139)

## Verification and remaining measurement

Run architecture, TypeScript, formatting, content validation, relevant tests, the full suite, Linux production builds and the synthetic Pages export. Validate canonical output and 301 behavior in actual builds, including the legacy presentation. Crawl staging and production after activation from the same source revision. Keep staging payments simulated and production merchant/notification configuration intact. Keep active plus one previous verified application release.

The unauthenticated PageSpeed Insights endpoint returned 429 during the baseline. No field Core Web Vitals score or speed improvement is claimed. Image loading declarations are code/HTML observations, not real-user LCP measurements. Obtain origin/page CrUX or Search Console field data when available, then prioritize measured LCP, INP and CLS failures.

Release outcomes, exact test counts and residual findings belong in the accompanying release record after verification, rather than being inferred from edits alone.
