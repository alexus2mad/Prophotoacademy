# Pro Photo Academy — independent design and visitor-flow review

Reviewed 7 October 2026 at `http://127.0.0.1:3000` using CUA browser APIs. Viewports: desktop 1440×900, mobile 390×844, tablet 834×1112. Content width excludes the 15px scrollbar. Reviewed homepage, full catalog and class filter, Visual Content course, program/package inquiry, footer, student gallery/lightbox, and `/checkout?demo=1` through pending, declined, and successful states. All submitted data was synthetic and local.

**Latest recheck:** All six findings below have been addressed in the updated source. A source recheck and two minor residual findings are recorded at the end. The measurements and browser screenshots in the original review describe the earlier version, not the revised layout. CUA was unavailable in this agent’s surface during the recheck; the parent’s browser remained available for visual verification.

**Judgment:** Keep the palette and CTA shape. Dark green-black, warm white, and pale green form a coherent premium palette around the real photography. The remaining gap to exceptional quality is information scale and small conversion details. The site needs refinement rather than a new style.

## Prioritized findings

1. **P2 — Make actual courses visible in the catalog’s opening screen**
   - **Where:** `/courses`; `.page-heading`, `.filters`, `.course-image`, `.course-body`; `src/app/courses/page.tsx`, `src/components/course-card.tsx`.
   - **Evidence:** At 1440×900 the opening screen shows introduction, filters, and photographs but no course names. At 390×844 the first course title starts around document Y=1251px, after a four-line abstract heading, three filters, and a portrait image.
   - **Impact:** The catalog is slower than the homepage at explaining available offerings, contrary to the brief’s immediate understanding requirement.
   - **Fix:** Use “Усі програми” with one concise sentence. Reduce introduction space. Put course name and audience before the image, or use a compact photo/copy arrangement. On mobile, expose type and put secondary format/experience controls behind “Фільтри”. Preserve the excellent photos and intentional crops.

2. **P2 — Increase useful metadata size and improve tablet previews**
   - **Where:** `.preview-audience`, `.preview-meta`, `.selection-note`, `.other-programs`, `.program-facts`, `.mobile-enroll`, footer legal links.
   - **Evidence:** Audience/duration text is 10px; mobile fixed CTA is 10px and its price qualification 8px. Three homepage previews remain cramped at 834px, wrapping titles/audience while keeping facts microscopic.
   - **Impact:** Audience, delivery, price, and availability are decision information. High contrast does not compensate for microtype.
   - **Fix:** Use at least 12px/18px for useful metadata, preferably 13px where possible. Make mobile CTA labels 12–13px. Use two preview columns at tablet width. Keep 9–10px only for decorative numbering. Include “від” in the mobile starting price and use a readable qualifier.

3. **P2 — State catalog audience and availability explicitly**
   - **Where:** `.course-body .eyebrow`, `.badge`; `src/components/course-card.tsx`, status labels in `src/lib/format.ts`.
   - **Evidence:** Catalog poetic slogans replace the homepage’s useful audience labels. “Наступний набір” appears on courses with unconfirmed dates and on individual/corporate training. The class filter correctly labels the past event “Подія завершена”.
   - **Impact:** Visitors have to translate slogans into fit and may infer a cohort that is not confirmed.
   - **Fix:** Add a factual audience line using existing program data. Use “Уточнюємо набір” for unverified course intakes, “За вашим запитом” for custom training, and explicit archived-event labels. Do not invent dates, seats, or offerings.

4. **P2 — Add a concrete retry route after a declined/canceled order**
   - **Where:** `/thanks`; `src/components/order-status.tsx`.
   - **Evidence:** The local decline state says “Спробуйте інший спосіб…”, but only offers help and the catalog.
   - **Impact:** The interface describes a next step without providing it directly.
   - **Fix:** Add primary “Спробувати ще раз”, retaining offering/package; demo can return to `/checkout?demo=1`. Keep help secondary. Recheck availability before a real retry.

5. **P2 — Strengthen form boundaries and make errors specific**
   - **Where:** `.form-stack input`, `textarea`, selects, `.form-error`, inquiry validation response.
   - **Evidence:** Input border `#343b33` has about 1.63:1 contrast against `#101211`, 1.49:1 against the dialog surface. Invalid contact with valid name/consent yields “Перевірте ім’я, контакт і згоду з політикою”.
   - **Impact:** Fields are faint and the error asks visitors to inspect three inputs for one problem.
   - **Fix:** Give controls a stronger border targeting 3:1 against adjacent surfaces; decorative dividers can stay quiet. Return “Вкажіть email або телефон” and associate it with the contact field, preserving input.

6. **P2 — Simplify mobile conversion screens**
   - **Where:** `.mobile-enroll`, `.program-hero-actions`, `.checkout-summary`.
   - **Evidence:** Course opening view shows header course CTA, hero inquiry CTA, and fixed inquiry CTA together. Mobile checkout summary is about 492px high; first form input begins around Y=916px.
   - **Impact:** Repetition adds visual pressure; a tall checkout summary delays the action already selected.
   - **Fix:** Reveal the fixed bar after the hero CTA leaves view. Compact mobile checkout into thumbnail, program/package, and price so the first field is visible earlier.

## Visual judgment

- **Palette:** Keep it. Token contrast: primary text/canvas ≈16.37:1; secondary/surface ≈8.79:1; muted/surface ≈5.80:1; primary CTA ≈13.12:1. Improve control boundaries rather than changing accent color. The cream consultation section provides a welcome rhythm change.
- **CTAs:** Keep pale green primary, outline secondary, text-link tertiary, and pill shape. Desktop 48px primaries are appropriate. “Дізнатися про набір” and “Уточнити умови пакета” accurately describe inquiry. Refine mobile sizes and repeated visibility. A saturated accent or new shape would add noise without fixing the observed problems.
- **Typography:** Neutral display headings support photography. Checked headings have no terminal periods. Balance the oversized catalog copy against undersized facts before changing font families.
- **Photography:** Underwater hero, gold fabric, lemon photograph, student work, and teaching imagery establish a distinctive photographic identity. Natural gallery proportions and lightbox presentation are strong. Compact homepage thumbnails reasonably trade image detail for rapid choice. Do not replace these with generic imagery.
- **Rhythm:** Open teaching/founder layouts and natural gallery are good. Optional editorial refinement: show short exact testimonial excerpts on the homepage, retaining originals on the reviews page. This is a taste/reading-load suggestion, not broken UX.
- **Logo/footer:** Actual logo images appear in both header and footer. Footer contact/navigation grouping is clear; increase legal-link size.

## Defects repaired during review

- **Dialog placement:** Original inquiry/gallery/menu were pinned to the top-left after margin reset. Parent added `margin:auto`. Desktop inquiry now measures x=432.5, y=70.25, width=560, height≈759.5 at 1440×900. Centered gallery and mobile inquiry were verified.
- **Preview origin:** Original `127.0.0.1` submissions were rejected before validation. Parent repaired development-origin handling. Valid synthetic inquiry now succeeds with explicit local-save confirmation; invalid contact is rejected.
- **Package context:** Original submit lost the selected package. Parent added offering/package context. PLATINUM-specific inquiry now opens with its title and submits successfully. Synthetic local record: `design-package-qa@example.com`, message “Synthetic PLATINUM inquiry verification”; parent can verify persisted package fields in the ledger.

## Verification and evidence

Passed visitor flows: homepage → catalog; type filter → completed event; catalog → Visual Content; generic/package inquiries; gallery next-photo and Escape-close; demo checkout → pending; decline; second demo checkout → success. No horizontal overflow observed in inspected 390px/834px views. These were viewport tests, not physical-device keyboard tests.

Screenshots were captured and emitted in the CUA tool trace for desktop/mobile/tablet homepage, catalog, course, original/repaired inquiry, gallery, footer, checkout, decline, and success. The exposed screenshot API returns bytes without a documented file-save method, so no screenshot files were written. Geometry and token measurements above are reproducible evidence.

## Recheck of the revised implementation

Independent source review completed after the six fixes and latest pricing/numbering adjustments. Existing browser handle failed; inventory exposed no browsers, and one fresh IAB attempt also failed. Per parent direction, this recheck continued with source inspection rather than another browser-control method. No new UI submissions or viewport screenshots were possible, and no new geometry claims are made.

| Original finding | Recheck result |
| --- | --- |
| 1. Catalog visibility | Addressed in source: factual “Усі програми”, compact introduction, audience/title preceding 4:3 images, mobile secondary-filter disclosure with expanded/active state |
| 2. Metadata/tablet readability | Addressed in source: metadata 12px/18px, tablet two-column previews, mobile CTA 12px, readable starting-price link with “від” |
| 3. Audience/availability | Addressed for catalog: `audienceLabel` and `programStatusLabel` expose factual audiences, unconfirmed cohorts, custom requests, and archived events |
| 4. Checkout retry | Addressed in source: declined/canceled states render “Повторити оформлення”; status endpoint supplies the original offering/package URL or `/checkout?demo=1` for the demo |
| 5. Boundaries/errors | Addressed in source: control border `#6f7a6a` gives ≈4.18:1 against canvas and ≈3.82:1 against surface. Inputs receive field-specific error text, `aria-invalid`, `aria-describedby`, and focus on the first failed field |
| 6. Mobile conversion | Addressed in source: IntersectionObserver hides fixed enrollment while hero actions are in view; mobile checkout summary uses a 60×80 thumbnail and compact copy/price |

**Pricing burden:** The new `ProgramPackages` section immediately follows the hero introduction in DOM order. At ≤767px, flex ordering places it before the hero photograph and before curriculum/outcomes. This directly addresses the user’s complaint about reaching prices too late. Prices, package names, availability, short descriptions, and actions remain visible; includes collapse into “Що входить у пакет”. Desktop uses three columns with expanded inclusions. The hero’s redundant secondary pricing link is removed. This is the right information hierarchy; final scrolling/viewport fit needs the parent’s active browser check.

**Decorative numbering:** Source confirms section-marker counters, hero “01 /” prefix, and preview indices were removed. Numbered learning/outcome/module sequences remain meaningful ordered content, consistent with the parent’s interpretation of the user’s request.

**Residual P3 — Check duplicate anchor offsets:** `html` has `scroll-padding-top:112px` (88px mobile), while `.program-packages` also has `scroll-margin-top:112px` (88px mobile). These combine when navigating to `#packages`, potentially leaving the section approximately 224px/176px below the viewport top. The original concern was reaching prices quickly, so use one sticky-header offset if the parent’s browser confirms excessive empty space. This is source-derived; updated target geometry was not independently measured.

**Residual P3 — Custom-training hero uses cohort language:** `/individual-training` and `/corporate-training` receive correct request-based catalog badges and CTAs, but `ProgramPage` still renders generic hero facts “Найближчий старт / Уточнюємо набір”. For `isCustom`, use “Початок / Узгодимо з вами” to keep custom scheduling consistent throughout the flow. Evidence is the shared hero facts conditional in `src/components/program-page.tsx` and the custom fixtures with no cohort date.

Palette and CTA judgment remains unchanged: retain the established colors and shapes. The revisions improve clarity rather than diluting the photographic identity. No further redesign is justified by the inspected source.

## Parent implementation verification — October 7, 2026

The source recheck's two residuals are resolved. Anchors now use only the global sticky-header offset; the settled package target is Y=87.75px at 360px width, with a 72px header. Custom training reads “Початок / Узгодимо з вами”. Module titles also lose decorative numbering; actual learning and outcome lists retain sequence numbers.

Browser checks on the updated implementation:

- Mobile catalog's first course title moved from approximately Y=1251px to Y=516.5px at the inspected 390×844 surface; desktop title is Y=472.7px at 1440×900.
- Homepage course names remain in the initial view: Y=641px mobile, Y=691px desktop, Y=687px at 1024px width.
- Course pricing follows the introduction before the photo and curriculum on mobile. At the inspected mobile opening it starts around Y=628.5px; starting price is visible in the introduction. The redundant introductory pricing link is absent.
- Mobile sticky action is hidden at the opening and visible after the hero action leaves. At 360px the header action remains on one line with 44px controls.
- Mock checkout's empty inclusions disclosure is omitted. Its compact summary measures 233.25px; the first input starts at Y=687.25px at 390×844. Real packages with inclusions retain the expandable summary.
- Invalid inquiry contact preserves values, focuses `inquiry-contact`, sets `aria-invalid=true`, associates the specific message via `aria-describedby`, and avoids repeating it below the form.
- Local mock checkout succeeds, its decline state offers a concrete retry, and that link returns to `/checkout?demo=1` retaining the demo selection. No real payment or external inquiry was sent.
- No horizontal overflow in inspected 360, 390, 768, 1024 and 1440px layouts. The Node/browser currency-symbol hydration discrepancy is fixed with consistent formatting.

Production build and TypeScript passed. All 17 automated flow tests passed. Content validation passed for 6 programs, 6 offerings, 15 images, 2 legal pages and 16 reviews/case stories. The 54-document migration dry run and actual GROQ projection checks passed, including new documents and absent optional nested lists. Live Sanity/payment/notification credentials remain an explicit connection step documented in README.md; the local fixture and mock modes remain enabled.

Parent saved screenshot evidence in `reports/screenshots/home-desktop.jpg`, `course-mobile.jpg` and `checkout-mobile.jpg`. The original independent findings above are retained as the review history; this section records implementation and parent verification.
