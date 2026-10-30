# Stage 2 offer evidence

The current public authority is `content/academy.json`, or the equivalent published Sanity documents when `CONTENT_MODE=sanity`. Prices, package IDs, names, availability, `verificationRequired`, `openAfterStart`, purchase eligibility and private lesson access rules remain unchanged. New comparison facts describe the offer and never grant access.

## Source trail

- `content/academy.json`: programs and offerings; owner decisions dated 27 October 2026 are retained in `sourceNotes`.
- `content/source/pages/visual-content.html`, `food-product-photography.html`, `course-smm-instagram.html`: locally saved original public pages, inspected read-only. These ignored source files are not copied into this document or committed. Package evidence comes from `.pricing_format-card`; delivery evidence from `.stages-text` and overview copy; Visual qualifications from `.faq-tile`.
- Instagram's original `.package-comparison-smm-insta__services` table names BASE and PLATINUM EXPERT. Its cells explicitly use `icon-done-includes` and `icon-close-access`; this is affirmative exclusion evidence, unlike an omitted item in a package list.
- `content/source/webflow-collections.json` and `content/generated/migration-manifest.json` record that Webflow had no CMS collections on 7 October 2026; the migration used public static pages and assets.
- `src/lib/content.ts` projects the authored program, offering and package fields with object spreads. The optional fields are available in both fixture and Sanity modes.

Historical source prices and sold-out labels do not override the current content. The original pages contain stale and duplicated copy. Only specific, corroborated learning details were carried forward.

## Program positioning

| Program | Confirmed audience and task | Equipment | Online and Kyiv |
| --- | --- | --- | --- |
| Візуальний контент | Beginners, bloggers, business owners; light, composition, portraits, products, food, events, photo and video | Phone or camera. Source FAQ recommends choosing additional equipment after the first lectures | Lectures online. GOLD has one group workshop, delivery method unconfirmed. PLATINUM explicitly has offline-online workshops; the overview identifies Kyiv for offline workshops |
| Комерційний контент | Photographers, creators, SMM specialists, business owners; product and food images and video for brands | Source explicitly teaches phone photography; additional professional-camera teaching is in PLATINUM | Lectures online. Offering is hybrid with location Kyiv. The exact delivery method of its GOLD/PLATINUM workshops is not stated |
| Інста, яка продає | Experts, bloggers and people running their own Instagram; positioning, visual content, planning and account work | Phone photo and video in the curriculum | Online offering. Feedback is confirmed for current GOLD; new PLATINUM is unconfirmed |

The hero statement covers the academy's range without promising every discipline or Kyiv practice in every program: «Курси фотографії, відео та створення контенту на телефон або камеру. Онлайн-навчання та практика в Києві — залежно від програми й пакета.»

## Package facts

“Unconfirmed” means the available evidence does not establish the feature; it never means excluded. All six comparison dimensions are authored: learning, instructor support, homework review, practice, access duration, limits/requirements. A missing dimension also displays «Не уточнено» without parsing free text or inheriting a higher/lower tier.

| Package | Current price | Confirmed learning and practice | Confirmed support | Access |
| --- | ---: | --- | --- | --- |
| Visual BASE | 7,500 UAH | Independent; 8 weeks, 2 lectures/week | Homework review, chat and consultation unconfirmed | 3 months |
| Visual GOLD | 25,500 UAH | 8 weeks, 2 lectures/week; 1 group workshop, delivery unconfirmed | Homework review, chat and consultation unconfirmed | 6 months |
| Visual PLATINUM | 63,900 UAH | 11 weeks, 3 lectures/week; 2 group workshops of 3 hours, offline in Kyiv or online; commercial block | Chat, homework review, 1 individual consultation | Lifetime |
| Commercial BASE | 9,600 UAH | Independent; 17 lectures, 2/week | Homework review, chat and consultation unconfirmed | 6 months |
| Commercial GOLD | 29,900 UAH | 17 lectures over 8 weeks; 2 workshops, delivery unconfirmed | Homework review, chat and consultation unconfirmed | 1 year |
| Commercial PLATINUM | 79,900 UAH | 12 weeks, 3 lectures/week; 4 workshops, 2 masterminds, first-order production; camera, Photoshop, AI, SMM, targeting | Chat and homework review in original package copy; 1 individual consultation | Lifetime |
| Instagram BASE | 4,200 UAH (previous 7,000) | Independent; current authority says 14 lectures; practice assignments | Original comparison explicitly excludes support chat, individual call, detailed homework feedback/review | 5 months |
| Instagram GOLD (`instagram-expert`) | 11,900 UAH | 18 lectures; account practice and a brand-development mastermind | Chat, individual work, task review and an individual call | Lifetime |
| Instagram PLATINUM | 29,900 UAH | Unconfirmed | Unconfirmed | Unconfirmed |

The current `sourceNotes` explicitly says PLATINUM EXPERT was renamed GOLD while preserving its ID and conditions. Its original table therefore supports the GOLD homework review, individual call and mastermind. It provides no evidence for the newly created PLATINUM. That package keeps its original empty inclusions, open availability and purchase action.

Short package descriptions now express buyer needs: independent study for BASE; one/two workshops for Visual/Commercial GOLD; feedback and practice for their PLATINUM tiers; personal-brand feedback for Instagram GOLD; «Склад і умови пакета уточнюються» for Instagram PLATINUM.

Specific source qualifications retained:

- Visual PLATINUM: «2 групових 3-годинних воркшопи в офлайн-онлайн форматі» and «диплом про закінчення за умови здачі дипломної роботи». Its optional Kyiv internship is not newly advertised.
- Commercial PLATINUM: «12 тижнів навчання з повною підтримкою в чаті та перевіркою домашніх робіт»; diploma requires mandatory assignments and the final project within the stated deadlines. Camera teaching does not mean supplied equipment.
- Instagram source comparison explicitly includes practice assignments for BASE, excludes reviewed assignments and support, and includes those features for the former EXPERT tier. The source's “24/7” wording is not repeated as a response-time promise.

## Delivery state versus sales eligibility

`Offering.learningState` is optional (`recorded`, `selfPaced`, `ongoing`) and independent from `openAfterStart`. `joiningOpen` is an optional, explicit confirmation that an ongoing cohort accepts new learners. Neither field changes checkout authorization.

Only Visual receives `learningState: recorded`: its current source note explicitly says «Курс доступний у записі після старту 13.03.2026». No `joiningOpen` values are authored. Instagram's permission to sell after 2 October does not prove that an active cohort accepts late joining or establish a new intake. Sanity's `openAfterStart` description now describes sales eligibility alone.

## Unresolved facts and source conflicts

1. Commercial overall duration says 7–13 weeks, while GOLD is 8 and PLATINUM 12. The original overview also says 8–13 and 40 lectures. Retain current authoritative durations; the offering source note already requests editorial verification.
2. Instagram BASE has 14 lectures in the current model and one source block, 18 in a duplicated mobile block, and unrelated 8-week/3-month Visual copy in another block. Current 14 lectures and 5 months remain authoritative.
3. Source prices for Visual GOLD/PLATINUM and Commercial GOLD/PLATINUM are old. Current owner-approved values in the table above remain unchanged. Historical sold-out labels also do not override current owner approval.
4. New Instagram PLATINUM's curriculum, learning volume, support, practice, requirements, and access duration are all unconfirmed. Higher price or tier name supplies no evidence.
5. Visual/Commercial BASE and GOLD homework review, chat and instructor consultation are unconfirmed. Missing inclusion text is not exclusion evidence.
6. Visual GOLD and all Commercial workshop delivery modes, exact dates, remote alternatives, booking process and usage deadlines are unconfirmed. A hybrid offering does not make travel mandatory for online lectures.
7. Access periods are known for eight packages, but the start of the clock (payment, activation or cohort start) is not established. No immediate or automatic access promise is added.
8. Exact phone/camera specifications, required accessories or paid applications, and availability of supplied equipment are unconfirmed. “Camera teaching” is curriculum, not a hardware benefit.
9. Instructor response times, consultation duration, individual-work limits and mastermind count for Instagram GOLD are unconfirmed.
10. Instagram next intake and delivery state remain unconfirmed despite its unchanged permission to sell after the old start date. Commercial future start is retained from the current offering; it must not remain future wording once the business day passes.

Copied generic equipment FAQs on Commercial and Instagram now describe their own curriculum. The descriptions do not add prerequisites, guaranteed outcomes, revenue claims or a promise that every course is for beginners.

## Verification scope

Focused comparison tests cover missing evidence, explicit exclusions, the EXPERT-to-GOLD mapping, unknown new PLATINUM facts, equal comparison dimensions and unchanged package purchase URLs. Existing pricing/enrollment tests cover prices, names, status and purchase restrictions. Whole-application architecture, typing, formatting, production/static builds and responsive checks are recorded in the main Stage 2 handoff.
