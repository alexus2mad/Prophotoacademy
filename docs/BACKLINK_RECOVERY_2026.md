# Academy backlink recovery

On 12 November 2026, public search and direct source inspection verified 14 links from 13 public source pages or posts to five exact Academy destinations. The sample includes 113 public ProPhotoClub posts across 12 archive pages and the founder's public YouTube channel link. These observations describe the sources we could verify. Search Console's site-wide reports were still processing.

| Linked Academy destination                                | Links | Finding                                                                                                                                                        |
| --------------------------------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `https://prophotoacademy.com.ua/#education-id`            |     1 | The homepage returned 200 before the repair, but its HTML had lost the linked education anchor. [Telegram post, 19 March 2026](https://t.me/prophotoclub/321)  |
| `https://prophotoacademy.com.ua/visual-content`           |     8 | The course returned a self-canonical 200. [Example Telegram post](https://t.me/prophotoclub/303)                                                               |
| `https://www.prophotoacademy.com.ua/course-smm-instagram` |     3 | The existing HTTPS hostname redirect returned 301 directly to the canonical course, which returned 200. [Example Telegram post](https://t.me/prophotoclub/395) |
| `https://prophotoacademy.com.ua/course-smm-instagram`     |     1 | The course returned a self-canonical 200. [Telegram post](https://t.me/prophotoclub/367)                                                                       |
| `https://prophotoacademy.com.ua/`                         |     1 | The homepage returned a self-canonical 200. [YouTube About](https://www.youtube.com/@olenapopova-prophoto/about)                                               |

## Homepage anchor repair

The October Webflow capture identifies `education-id` as the original ProPhoto Education section. Both current homepage designs now render a native `education-id` target in their existing learning directions. Studio uses the section and legacy uses its heading inside the existing `#courses` section. Browsers scroll directly to the target on the homepage because HTTP request targets exclude fragments. Local browser checks at 390 and 1440 px confirmed one matching ID, the homepage canonical, and correct scrolling with JavaScript enabled and disabled. The checks also confirmed query preservation and legacy `/#courses` behavior. [HTTP fragment semantics](https://www.rfc-editor.org/rfc/rfc9110.html#section-7.1)

The 12 local Webflow captures and five Academy URLs in the sampled April 2026 Wayback index supplied historical context. No additional obsolete Academy HTTP path surfaced in the checked sources. The existing direct 301s from `/courses` and `/page-in-progress` to `/academy` remain the applicable historical route mappings. [Reviewed migration map](../scripts/seo-audit/migration-2026-11-12.json)

## Other referring sites

- The Webflow showcase has two live-site links to `https://pro-photo-academy.webflow.io`. That hostname returned HTTP 200 with the old Academy homepage. The Webflow project listed zero custom domains. An Academy server redirect cannot receive traffic addressed to the Webflow preview. Fixing that referral requires updating the showcase link or redirecting the preview at Webflow. [Webflow showcase](https://webflow.com/made-in-webflow/website/pro-photo-academy) · [Historical preview](https://pro-photo-academy.webflow.io/)
- Search Console listed a Behance design gallery as a referring page for the homepage. The gallery returned HTTP 403 during this audit. The Dribbble project returned 202 without usable project HTML, and Instagram blocked the public fetch. Their current outgoing Academy links remain unverified. [Behance gallery](https://www.behance.net/gallery/244553479/Website-Design-for-Photography-School-Webflow) · [Dribbble project](https://dribbble.com/shots/27504683-Web-site-Pro-photo-academy-Photography-Course)
- The reviewed founder references confirm Olena Popova's photography and teaching work. The Inweb interview links the school name to Instagram. Kyiv-Mohyla credits both Academy educators. Vseosvita links to a live ProPhotoStudy webinar through its outbound interstitial. All 50 URLs in the Study sitemap returned 200, and the owner confirmed that Study should stay active. [Inweb interview](https://theinweb.media/intervyu-olena-popova/) · [Kyiv-Mohyla training](https://pro.ukma.edu.ua/trainings/training-visual-content) · [Vseosvita reference](https://vseosvita.ua/library/fotohrafiya-yak-instrument-zberezhennya-istorychnoi-spadshchyny-v-ivent-industrii-976465.html) · [Study sitemap](https://prophotostudy.com.ua/sitemap.xml)

The link inventory, archive records, HTTP chains and browser evidence are stored locally under `.data/backlinks-2026-11-12/`.

The repair is live on staging and production from commit `8425340`. Both environments passed their read-only checks with unchanged runtime configuration. [Deployment and verification record](releases/2026-11-12-legacy-course-links.md)

## Verified public referral inventory

| Exact Academy destination                                 | Links | Public source                                                                                  |
| --------------------------------------------------------- | ----: | ---------------------------------------------------------------------------------------------- |
| `https://prophotoacademy.com.ua/visual-content`           |     1 | [t.me/prophotoclub/283](https://t.me/prophotoclub/283)                                         |
| `https://prophotoacademy.com.ua/visual-content`           |     1 | [t.me/prophotoclub/293](https://t.me/prophotoclub/293)                                         |
| `https://prophotoacademy.com.ua/visual-content`           |     1 | [t.me/prophotoclub/303](https://t.me/prophotoclub/303)                                         |
| `https://prophotoacademy.com.ua/visual-content`           |     2 | [t.me/prophotoclub/313](https://t.me/prophotoclub/313)                                         |
| `https://prophotoacademy.com.ua/visual-content`           |     1 | [t.me/prophotoclub/320](https://t.me/prophotoclub/320)                                         |
| `https://prophotoacademy.com.ua/#education-id`            |     1 | [t.me/prophotoclub/321](https://t.me/prophotoclub/321)                                         |
| `https://prophotoacademy.com.ua/visual-content`           |     1 | [t.me/prophotoclub/322](https://t.me/prophotoclub/322)                                         |
| `https://prophotoacademy.com.ua/visual-content`           |     1 | [t.me/prophotoclub/333](https://t.me/prophotoclub/333)                                         |
| `https://prophotoacademy.com.ua/course-smm-instagram`     |     1 | [t.me/prophotoclub/367](https://t.me/prophotoclub/367)                                         |
| `https://www.prophotoacademy.com.ua/course-smm-instagram` |     1 | [t.me/prophotoclub/383](https://t.me/prophotoclub/383)                                         |
| `https://www.prophotoacademy.com.ua/course-smm-instagram` |     1 | [t.me/prophotoclub/384](https://t.me/prophotoclub/384)                                         |
| `https://www.prophotoacademy.com.ua/course-smm-instagram` |     1 | [t.me/prophotoclub/395](https://t.me/prophotoclub/395)                                         |
| `https://prophotoacademy.com.ua/`                         |     1 | [youtube.com/@olenapopova-prophoto/about](https://www.youtube.com/@olenapopova-prophoto/about) |
