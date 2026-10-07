# Migration evidence

Source site: https://www.prophotoacademy.com.ua/ · Webflow site `694a5cc146bb9192fcdbb5ac` · inspected October 7, 2026.

## Verified source inventory

Webflow MCP was used to inspect site metadata, page inventory, assets and forms. The site had 14 page definitions and 287 asset records. The final successful `get_collection_list` returned `collections: []`; the raw response is retained in `content/source/webflow-collections.json`. Initial CMS calls failed at connector validation, and the action-wrapper shape was subsequently resolved. The empty CMS conclusion comes from the successful API response, not from inspecting HTML wrappers.

Twelve public HTML snapshots are retained in `content/source/pages/`: homepage, three course pages, Pro Photo Lab, academy, contacts, reviews, public offer, privacy policy, thank-you page and the in-progress utility page. Asset metadata is retained in `content/source/webflow-assets.json`. Existing form definitions were reviewed for functional patterns; private submissions were not migrated.

The useful content is normalized into `content/academy.json`. The source snapshots remain the full audit record; course modules, audience and outcome copy were deliberately condensed into clearer editorial summaries. The migration does not claim to reproduce every repeated promotional block or custom-code script.

## Decisions requiring editorial confirmation

| Program | Source conflict or stale state | Implemented behavior |
| --- | --- | --- |
| Visual content | March 13, 2026 intake has passed; a new intake was not confirmed | Show program and last package information; inquire about the next intake |
| Commercial content | Homepage said September 26/from 6,000 UAH; detailed course page said November 6/BASE 9,600 UAH. Overall 7–13 weeks differs from package durations | Detailed page takes precedence; expose date as source information; block checkout until verified |
| Instagram | October 2, 2026 has passed; EXPERT sold out; promotional price freshness unconfirmed | Show next-intake inquiry; preserve package distinction and source price |
| Pro Photo Lab | September event has finished; ticket-price groups ambiguous | Archived event with next-event inquiry; no invented purchasable tickets |
| Individual/team training | Scope and price depend on the request | Direct program routes and contextual inquiry |

The importer retains source notes in intake documents. Dates do not automatically become future dates. Availability, discounts, seats and testimonials are never fabricated. Payment gating also checks dates at request time.

## Media selection and identity

The supplied Drive library is the source of the selected images and logos. Fifteen photo records retain the original Drive file ID, credit, alt text and dimensions. Six student photographs retain natural proportions in the gallery. Where a student's name was not supplied, credit remains “Робота студента академії”. Phone/camera labels come from the source organization.

The photographic roles are intentional: underwater work is retained for the general academy opening; gold fabric introduces foundations; the lemon splash demonstrates commercial technique; red fabric illustrates mobile visual content; genuine teaching photos show practice; the founder portrait supports trust. Student objects, food and portrait work demonstrate range.

`content/source/brand/` retains the downloaded study logo, main logo and KyivType font exports. `scripts/prepare-brand.mjs` creates web display SVGs by trimming only unused artboard margins. `public/brand/prophoto-study-trimmed.svg` is the actual combined logo used in both navigation and footer, with inversion for dark surfaces. The original SVG is retained alongside it.

Student quotations and academy-written case stories are distinguished in the content model. The homepage selects direct quotations; the review page labels both kinds. Text preserves its source attribution and links to the source page.

## Import behavior

`pnpm content:migrate` writes a dry-run NDJSON and manifest. It checks all document and asset references. `--write` requires configured credentials, uploads selected media and creates documents only when their stable IDs do not already exist. This preserves subsequent editor changes. The project has not been deployed, and Webflow has not been modified.

The production backend is Sanity. Webflow supplies migration evidence only. The local fixture is an explicit review mode, not an unannounced production fallback.

## Editorial priority update

The user identified Інста, яка продає as the current main course. The normalized fixture selects it through `settings.primaryProgramId`; the importer converts that ID to the Sanity `primaryProgram` reference. An optional program-level homepage introduction supports concise course-led copy. This is an editorial decision following migration, not a claim inherited from Webflow. Source dates, prices, availability and testimonial attribution are preserved. Existing cloud documents remain protected by the importer’s create-if-missing behavior; editors can choose the primary course directly in Studio.

## ProPhoto Hub extension

The ecosystem migration adds 4 room photographs, 3 studio-room documents, Hub settings and one planned practice session: 63 documents and 19 images in total. Sources are the public Wix room pages and existing Plainstack embed inspected on 7 October 2026. The dry run preserves rate provenance and renovation notices. No live booking API, cloud data or domain settings were changed. See ECOSYSTEM.md for the editorial gate and production setup.
