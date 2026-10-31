# Stage 2 offer presentation

## Delivery and verification

Implemented locally on 30 October 2026 and deployed to staging on 31 October 2026 as `d5c3fb87216758f57dc9dd8f98801a2c82cea33b`. Staging uses fixture content and mock checkout, so the reviewed metadata ships with the application archive; no remote CMS mutation was needed. Production and GitHub Pages were not deployed. See [the staging deployment record](STAGING_ISOLATION.md#stage-2-offer-presentation-deployment--31-october-2026). A future Sanity-backed deployment must publish the reviewed metadata to its own marketing dataset; absent facts remain unconfirmed rather than being inferred from old source notes or package names.

Validation: 331 tests in 47 files passed; architecture checked 538 modules; TypeScript, repository formatting, content validation, production build and synthetic Pages build passed. The Pages validator checked 53 pages for prefixed assets, noindex, review notices and excluded private endpoints. The built static review correctly filters three courses after hydration and prevents checkout.

Browser checks covered desktop 1440px and phones at 390px and 360px: homepage explanation and CTA fit the first screen; all three program introductions and catalog rows have no horizontal overflow; all nine package purchase destinations remain; comparison selection, Escape/focus return, mobile menu, filter clearing/history/refresh and contextual GOLD inquiry work. Inquiry consent remains unchecked. No real inquiry or purchase was submitted. Screenshots are saved locally in `.data/stage2-offers/` and excluded from Git.

The live catalog is rendered per request; its server fallback retains requested filters and campaign parameters before hydration. One serialized timestamp prevents a Kyiv-midnight mismatch, then refreshes after mounting. Static review program introductions are build-time snapshots; they are illustrative, never a checkout source. Production program introductions and checkout render at request time.

## Final visitor copy

Hero: «Курси фотографії, відео та створення контенту на телефон або камеру. Онлайн-навчання та практика в Києві — залежно від програми й пакета.»

Program positioning, shared by catalog and introduction:

- **Візуальний контент:** «Для тих, хто опановує фото й відео: від світла та композиції до портретів, предметів і власних візуальних історій.» Телефон або фотокамера; лекції онлайн, воркшопи за пакетом. Підтверджений формат PLATINUM — Київ або онлайн.
- **Комерційний контент:** «Для кріейторів і власників бізнесу: предметні та фуд-фото й відео для брендів — від композиції до готового контенту.» Телефон; навчання на фотокамеру додатково у PLATINUM. Лекції онлайн; формат воркшопів потребує уточнення.
- **Інста, яка продає:** «Для експертів і тих, хто веде Instagram самостійно: позиціонування, фото й відео на телефон та планування контенту.» Телефон; онлайн, підтримка й перевірка робіт підтверджені у GOLD.

| Програма | BASE | GOLD | PLATINUM |
| --- | --- | --- | --- |
| Візуальний контент | Для самостійного навчання фото й відео | Для навчання з одним груповим воркшопом | Для практики зі зворотним зв’язком і консультацією |
| Комерційний контент | Для самостійного опанування предметної та фуд-зйомки | Для навчання з двома практичними воркшопами | Для практики з перевіркою робіт і підготовкою першого замовлення |
| Інста, яка продає | Для самостійної роботи над Instagram | Для роботи над власним брендом зі зворотним зв’язком | Склад і умови пакета уточнюються |

Detailed source evidence and unresolved questions are in [STAGE2_OFFER_EVIDENCE.md](STAGE2_OFFER_EVIDENCE.md).

## Date and status rules

`src/lib/program-schedule.ts` owns the shared visitor-facing schedule. Its `label`,
`value` and optional `date` describe the relevant timing; `status`, optional
`explanation` and `inquirySuggested` clarify the learning offer. It uses the current
calendar day in `Europe/Kyiv` and the existing Ukrainian date formatter.

The precedence is explicit archived availability, bespoke scheduling, confirmed
recorded/self-paced learning, confirmed ongoing learning, future or same-day
dates, then historical or missing dates. Archived events retain their event date
and next-event inquiry. Recorded/self-paced offers show package access conditions
instead of presenting their old cohort date as the next start. They do not promise
immediate access. Joining an ongoing cohort is advertised only when
`joiningOpen: true` and the unchanged purchase policy both permit it.

An authored future date without explicit verification is labelled as requiring
confirmation. A past date without a confirmed learning state is labelled
“Попередня дата старту”; a missing date is “Дату уточнюємо”. Neither establishes an
ongoing cohort, recorded course or new intake. When buying remains permitted, the
explanation says that packages can be purchased while the learning format and next
intake need clarification. `openAfterStart` remains a purchase-policy flag and is
never treated as evidence of a learning lifecycle.

These presentation rules do not change availability fields, `canEnroll`,
`canTestEnroll`, runtime enrollment options, prices, discounts, payment modes,
package mappings, access grants or checkout authorization. Mock and disabled-mode
notices continue to describe their existing behavior separately.

## Confirmed facts and unresolved details

- Visual's source note explicitly confirms recorded learning after 13 March 2026.
  Its historical date is not a new intake. Automatic access depends on the
  published package mapping; other packages receive access from the team. No
  universal immediate-access time is established by the marketing content.
- Instagram's source note authorizes purchasing after 2 October 2026. It does not
  confirm whether current study is recorded, self-paced or an ongoing cohort, nor
  whether joining a cohort is possible. The next intake date is unconfirmed.
- Commercial has an explicitly verified 6 November 2026 start. The existing
  duration conflict remains: 7–13 weeks overall versus 8/12-week package details.
  This stage does not invent a reconciled duration.
- Pro Photo Lab is explicitly archived, dated 26 September 2026. A next event is
  not announced in the current offering.
- Exact access activation can depend on the package's server-owned `startsAt`
  mapping or a team grant. A recorded/self-paced label alone does not establish
  when the buyer can access every lesson.
- Instagram PLATINUM's inclusions remain unconfirmed. Missing inclusions must not
  be presented as included support, practice or access duration.
