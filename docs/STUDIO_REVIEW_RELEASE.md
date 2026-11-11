# Studio review fixes — release record

## Current staging release — stable student-work gallery

Active application: `cd34ab020b9797f9c98e4091c3f19dd66aa87f87`. Previous verified rollback: `dc094139404298bc65e5c4c2f8efc1447d568b4f`. Released on 11 November 2026 (Europe/Kyiv) to [staging](https://staging.prophotoacademy.com.ua/).

Student-work popups now reserve their frame from the viewport instead of each photograph's aspect ratio. Images remain uncropped inside the available area; a fixed 80px caption row keeps navigation stationary. Close, previous and next actions share `IconButton` and remain 44px square, including hover and pressed states. Long captions have an independently scrollable, keyboard-focusable center column. Native closed dialogs remain hidden.

- Architecture: **695 modules**; TypeScript, scoped formatting and whitespace checks passed. Full suite: **504/504 tests** across 68 files. Linux production build generated **65 pages**; synthetic Pages export validated **58 pages**, without republishing GitHub Pages.
- Local checks covered 360×800, 390×844, 844×390 landscape and 1440×900. Fifteen consecutive photos preserved frame and button geometry. The shared `/student-work` gallery also preserved geometry. Caption keyboard focus, arrow navigation, Escape dismissal and focus return passed.
- On staging at 390×844, “Біла фактура” (17/24) and “Шоколад і спеції” (18/24) both measured **343×812px at x=16, y=16**; all three controls had identical positions and **44×44px** dimensions. Desktop switching also produced zero geometry changes. No dialog overflow or browser console errors were observed. Physical touch, OS text enlargement and Safari were not tested.
- Read-only HTTPS smoke: **428/428 passed**. Production release/process, both runtime configuration fingerprints and staging mock-payment mode remained unchanged. The scheduled email worker reports success.
- Retention keeps only this release and `dc09413`; obsolete `bcb6510` and disposable remote build/transfer files were removed after verification.

| Input/output | SHA-256 |
| --- | --- |
| Committed source archive | `b437e19bda531125643f8a48e53d5a31ce853462ded8d8acbd18b2868ec72711` |
| Public staging build settings | `7a4c41c23c8cfa8e5c6034a954f37afea24fbb524236d5547ae245bfaefe4605` |
| Linux runtime artifact | `eb9e46de0a3ab30bb5920061f788baba4be8298a9b01fb44fc97b94641e3cd5d` |

Private evidence under `.data/design-review/`: `gallery-stable-tests.log`, `gallery-stable-pages.log`, `gallery-stable-linux-build.log`, `gallery-stable-staging-activation.log`, `gallery-stable-staging-smoke.log`, `gallery-fixed-responsive.json`, `staging-gallery-stable-measurements.json`, `staging-gallery-stable-portrait.png`, `staging-gallery-stable-square.png` and `staging-gallery-stable-desktop.png`. The later documentation commit does not change the running application SHA.

## Historical release — artifact mobile exposure restoration

Active application: `dc094139404298bc65e5c4c2f8efc1447d568b4f`. Previous verified rollback: `bcb65104790b8ce7a228ab94d1dcdc736540ef65`. Released on 11 November 2026 (Europe/Kyiv) to [staging](https://staging.prophotoacademy.com.ua/).

The explicit mobile change request restores the live artifact's compact, photo-free exposure treatment at widths up to 760px. Direct scroll changes the section and following directions background from black to paper, fades and blurs the complete title, fills the meter white then red from left to right, and reveals the next heading. Labels sit beneath the bars; the value rises from 0 to +3 EV. Desktop keeps its sticky photograph, slower scroll runway and eased word morph. Unused desktop word layers are hidden on mobile to prevent overflow after resizing.

- Architecture: **695 modules**; TypeScript, scoped formatting and whitespace checks passed. Full suite: **504/504 tests** across 68 files, including **42 exposure tests**.
- Linux production build passed and generated **65 pages**. Synthetic Pages export validated **58 review pages**, without republishing GitHub Pages.
- Browser checks covered 360, 390, 760, 768 and 1440px, forward/reverse mobile scrolling and breakpoint changes. At 390px the compact section measures **283.359375px**, matching the artifact, with 40px top/16px side padding and 32px/1.04 heading text. The page has no horizontal overflow. Desktop photo and final word morph remain functional after resizing from mobile.
- Live staging checks confirmed the photo is hidden on mobile, the meter reaches +3 EV, both backgrounds reach `#fbfbfb`, the following heading is fully visible, and desktop restores the 300svh section and sticky photograph. Browser console inspection returned no warnings or errors. Reduced motion is covered by geometry/hook tests and CSS review; physical touch and OS-level reduced-motion checks are not claimed.
- Read-only HTTPS smoke: **428/428 passed**. Both runtime configuration fingerprints, production release and production process remained unchanged. Staging remains mock-only; the scheduled email worker reports success.
- Retention keeps exactly the active release and `bcb6510`. Obsolete `554eafd` and this task's remote build/transfer artifacts were removed after verification.

| Input/output | SHA-256 |
| --- | --- |
| Committed source archive | `7a96093817c1ec92b8f43b9b08e8916adc5f9a39cdfce3f582d964ef12dbbf6b` |
| Public staging build settings | `7a4c41c23c8cfa8e5c6034a954f37afea24fbb524236d5547ae245bfaefe4605` |
| Linux runtime artifact | `a3db23190897033816c41485a0ca442cb9c6b37c8eb5da649a6c17864be1fb16` |

Private evidence under `.data/design-review/`: `artifact-compact-exposure-mobile.png`, `compact-exposure-local-mobile-start.png`, `compact-exposure-local-mobile-middle.png`, `compact-exposure-desktop-morph.png`, `compact-exposure-pages.log`, `compact-exposure-linux-build.log`, `compact-exposure-staging-activation.log`, `compact-exposure-staging-smoke.log`, `staging-compact-exposure-mobile.png` and `staging-compact-exposure-end.png`. The later documentation commit does not change the running application SHA.

## Historical release — browsing rails and mobile media alignment

Active application: `bcb65104790b8ce7a228ab94d1dcdc736540ef65`. Previous verified rollback: `554eafdded8225100434fc130c195b9cd3ede50e`. Released on 11 November 2026 (Europe/Kyiv) to [staging](https://staging.prophotoacademy.com.ua/).

Homepage direction cards keep their two-row mobile layout and photographic motion, with bounded native overflow, proximity snapping and opt-in mouse dragging. Dragging suppresses accidental card activation; normal clicks, inquiry dialogs, keyboard access and native touch/trackpad scrolling remain available. The same mouse controller serves partner logos. Their 42-second autoplay now uses native scrolling instead of a separate transformed track, pauses for interaction, focus, visibility and reduced motion, and resumes from the visitor's position. Disposal prevents queued observer callbacks from restarting an old animation loop.

Removed the asymmetric 17px mobile inset from homepage and program student-work grids. Their photographs now meet both media edges while headings retain their text gutters; program columns use the actual rail width and retain the 2px gap.

- Changes committed independently: direction cards `0fa3262`, partner strip `b18da96`, student-work alignment `bcb6510`.
- Architecture: **695 modules**; TypeScript and scoped formatting passed. Full regression suite: **494/494 tests** across 68 files, including 18 drag and 9 marquee tests.
- Production builds passed; the exact Linux release generated 65 pages. Final synthetic Pages export validated **58 review pages**, without republishing GitHub Pages.
- Browser checks at 360, 390 and 1440px covered native horizontal scrolling, mouse dragging in both directions, final Academy/Studio cards, drag-click suppression, subsequent inquiry activation, keyboard access, preserved card zoom and desktop card navigation. Mobile-sized Chromium was used; a physical touch device was not available.
- On staging, the direction rail reached its 124px end position; the paused partner strip moved from 0 to 375px with native horizontal scrolling and then to 605px by dragging. Homepage and course photographs align at x=0 and the viewport's content edge, with no page overflow.
- Read-only HTTPS smoke: **428/428 passed**. Production release/process and both runtime configuration fingerprints remained unchanged; staging remains mock-only.
- Retention leaves only the active release and `554eafd`; obsolete `9eb7067` and disposable remote build/transfer files were removed after verification.

| Input/output | SHA-256 |
| --- | --- |
| Committed source archive | `741d897848a9e737faa1905c821513af9e6f67418e7997407e4da3f3da4fef4e` |
| Public staging build settings | `7a4c41c23c8cfa8e5c6034a954f37afea24fbb524236d5547ae245bfaefe4605` |
| Linux runtime artifact | `56afcac65717fc38339ca488c515b1e2964f2252b6c1780e0d7dbeffdff3994c` |

Private evidence: `.data/design-review/rails-final-tests.log`, `rails-final-pages.log`, `rails-linux-build.log`, `rails-staging-activation.log`, `rails-staging-smoke.log`, `staging-rails-cards-mobile.png`, `staging-rails-partners-mobile.png`, `staging-student-work-mobile-aligned.png` and `staging-course-work-mobile-aligned.png`. The later documentation commit does not change the running application SHA.

## Historical release — confirmed offers and shared checkout

Active application: `554eafdded8225100434fc130c195b9cd3ede50e`. Previous verified rollback: `9eb70673e3b7e1217113d83e0d17fdb66e455739`. Released on 11 November 2026 (Europe/Kyiv) to [staging](https://staging.prophotoacademy.com.ua/).

AI Artwork now offers separate offline (3,900 UAH) and online (3,000 UAH) tickets for 22 November 2026, 11:00–16:00 Kyiv time. Both use the existing checkout and verified WayForPay payment flow, without course entitlements. Shared event scheduling closes sales at the published local end time. Commercial Content's 6 November cohort remains open across all three packages and is explicitly labeled as ongoing. Separate Food Photography remains inquiry-only.

The owner explicitly selected test-only staging, preparing real checkout for the later production release. Staging stays `PAYMENT_MODE=mock`: no charge, ticket confirmation, learning grant or financial record. The production release, process, credentials and historical callback routing remain unchanged. Mock order status uses the shared database adapter and rejects real-payment orders. The focused checkout header also retains its dark logo when entered from a dark hero. Both Academy design variants retain their own AI page, and the sitemap/export resolve that route only once.

- Architecture: **688 modules**; TypeScript, content validation and scoped formatting passed.
- Full suite: **467/467 tests** across 66 files, including product payment/no-grant behavior, mock isolation, event cutoff/DST, exact prices, ongoing cohort and dedicated-route behavior.
- Local and isolated Linux production builds passed; Linux generated 65 pages. Synthetic Pages export validated **58 review pages** and was not republished.
- Desktop 1440px and mobile 390px checks verified ticket selection, exact checkout prices, schedule, ticket terms, Commercial GOLD, white-on-red actions, light-header contrast and no horizontal overflow. Staging browser navigation back to the format selector worked; console inspection returned no warnings/errors. No real payments or invitation emails were initiated.
- Read-only staging HTTPS smoke: **428/428 passed**, including all Commercial tiers, both tickets, event schedule, protected-route boundaries and assets.
- Both runtime fingerprints, production release `5ae3eca` and PID `1047` remained unchanged. The scheduled staging email worker reported success; no manual job was triggered.
- Release retention keeps only the active application and rollback above, removing `3ffb7b2`. Temporary remote build and transfer artifacts were removed after verification.

| Input/output | SHA-256 |
| --- | --- |
| Committed source archive | `c9f84e490dc78ab1bc2cc36cb259467421bcd984cbb7f222f6386fd2b9776635` |
| Public staging build settings | `7a4c41c23c8cfa8e5c6034a954f37afea24fbb524236d5547ae245bfaefe4605` |
| Linux runtime artifact | `3d34f77bc7f9f77c0b147a5552c092a0c050739c0df214a1f7f7201a8f1c5973` |

Private evidence lives under `.data/design-review/`: `confirmed-offers-tests.log`, `confirmed-offers-build.log`, `confirmed-offers-pages.log`, `staging-confirmed-offers-linux-build.log`, `staging-activation-confirmed-offers.log`, `staging-confirmed-offers-smoke.log`, `staging-smoke.json`, `staging-ai-ticket-selection.png`, `staging-ai-ticket-selection-mobile.png` and `staging-ai-checkout-mobile.png`. The later documentation commit does not change the running application SHA. See [checkout operations](COURSE_CHECKOUT.md) for confirmed offer identities and the production activation boundary.

## Historical release — card actions and eased exposure

Active application: `9eb70673e3b7e1217113d83e0d17fdb66e455739`. Previous verified rollback: `3ffb7b2efad946e7e7669f3e8377931a7664c4c7`. Released on 11 November 2026 (Europe/Kyiv) to [staging](https://staging.prophotoacademy.com.ua/).

Single-destination homepage and Academy cards now expose their native action
across the entire card. Red primary CTAs share white labels in default, hover
and pressed states, without overriding outline variants. Exposure now has one
120ms smoothed progress value for the photograph, text and meter, with quintic
easing inside the existing word-morph phases. Mobile toolbar resizing no longer
snaps an in-flight transition. The approved card zoom and title motion remain.

- Architecture: 677 modules; TypeScript, scoped formatting and whitespace checks passed.
- All 408 tests across 61 files passed, including 32 exposure tests. The restricted full run passed 407 tests; the loopback-denied sandbox case passed in the permitted rerun of its four-test suite.
- Linux production build: compilation, TypeScript and all 65 generated pages passed. The synthetic export validated 58 review pages. Its initial restricted Turbopack process stalled; the unchanged normal build passed with permitted worker processes. GitHub Pages was not republished.
- Browser verification covered desktop title/photo/corner click targets, inquiry context, keyboard activation and focus return, and mobile rail scrolling without unintended navigation. All 48 red CTAs sampled across eight public page types had white labels, including their text spans. Live desktop/mobile checks confirmed the final and reversed exposure states, no document overflow and no console errors. Physical touch hardware and 200% system text enlargement are not claimed.
- Staging HTTPS smoke: **378/378 passed**. The private smoke helper's old exact CSS-selector assertion was updated to the new shared primary selector, with additional hover and pressed checks.
- Both runtime fingerprints, the production application release and its process identity remained unchanged. The scheduled staging email worker and builder backup service report success; no manual email job was triggered.
- Retention kept exactly the active and rollback releases above, removing `93e645b`. Temporary remote build directories, artifacts and transfer helpers were removed.

| Input/output                  | SHA-256                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| Committed source archive      | `0cbd383fbdd736a96325a1b46c427aa24645e77adb998e5f8b00c74de3c2cd2c` |
| Public staging build settings | `7a4c41c23c8cfa8e5c6034a954f37afea24fbb524236d5547ae245bfaefe4605` |
| Linux runtime artifact        | `a349953dd98018a5e96f596985de8114a0b709dc2be823816438d36c10d937ef` |

Private evidence is under `.data/design-review/`: `card-motion-linux-build.log`,
`card-motion-pages-elevated.log`, `staging-activation-card-motion.log`,
`staging-card-motion-smoke.log`, `staging-smoke.json` and
`staging-card-motion-{exposure,inquiry,mobile}.png`. The later documentation
commit does not change the running application SHA.

## Historical release — mobile exposure correction

Active application: `3ffb7b2efad946e7e7669f3e8377931a7664c4c7`. Previous verified rollback: `93e645be8bca8d1eff196b388e5c7131b53d0608`. Released on 10 November 2026 to [staging](https://staging.prophotoacademy.com.ua/).

Restored the mobile exposure photograph, unified its scroll/title/meter timeline with desktop, removed header-dependent mobile tone switching, preserved fractional motion precision and shifted the second/third Academy hero portraits left on phones. This supersedes the compact mobile presentation in the historical release below.

- Architecture: 675 modules; TypeScript and scoped formatting passed.
- All 395 tests passed: 394 in the restricted full run, with the loopback-denied sandbox test passing in a focused rerun with local networking. Twenty-two exposure tests were also independently reviewed and run.
- Linux production build: successful compilation, TypeScript and 65 generated pages. Synthetic review: 58 pages validated; GitHub Pages was not republished.
- Responsive native-scroll checks: 104 phase samples at 360, 390, 768 and 1440px, with no word-line-box collisions, overflow or moving meter/stage. Browser screenshots confirm the portrait crops and restored photo. Physical mobile hardware and 200% system text enlargement are not claimed.
- Staging HTTPS smoke: **376/376 passed**. Live mobile verification confirmed the loaded photo, final phrase, reverse restoration, correct header contrast over the next section, deployed portrait crops and no browser console errors.
- Both runtime configuration fingerprints and the production release/process stayed unchanged. The scheduled email worker reports success; no manual email job was triggered.
- Cleanup retained exactly the active release and rollback above, removing `37b5740`. The isolated temporary build and transfer artifacts were removed; the builder's backup service remains successful.

| Input/output                  | SHA-256                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| Committed source archive      | `fec346851f7b2ae53a78a69df21ddf85ef98307c3cdf8433a86084362b696935` |
| Public staging build settings | `7a4c41c23c8cfa8e5c6034a954f37afea24fbb524236d5547ae245bfaefe4605` |
| Linux runtime artifact        | `a94ef265981a803c780adf5d4b3cea00a84f280cf3da91d2c149bf26e4d3f828` |

Private evidence is under `.data/design-review/`: `mobile-scene-measurements.json`, `staging-mobile-exposure-final.png`, `mobile-hero-*.png`, `staging-activation-mobile.log` and `staging-mobile-smoke.log`. The later documentation commit does not change the running application SHA.

## Historical release — initial motion review

Deployed to [staging](https://staging.prophotoacademy.com.ua/) on 10 November 2026. The release implements the [independent UI/UX review](STUDIO_DESIGN_REVIEW.md), recovered exposure script, the approved card choreography and the user's subsequent hero/exposure refinements. Production is unchanged.

Deployed application: `93e645be8bca8d1eff196b388e5c7131b53d0608`. Card trigger correction is independently committed as `ffe7238`; hero continuity and exposure pacing are committed as `e3d12c4`; the final word morph is committed as `93e645b`. The earlier `5eeef8f` build was stopped before producing an artifact. `e3d12c4` built successfully but was superseded by the user's word-morph refinement. Neither intermediate build was activated.

### Previous verification

- Architecture: 675 modules passed.
- TypeScript passed.
- Final full suite: 394 tests across 59 files passed with two workers. The suite includes 26 card-policy tests, six hero-retention tests and 21 exposure tests. Local boundary-test servers used the permitted local-network test run.
- Changed files pass formatting and whitespace checks. The repository-wide formatter reports pre-existing drift in unrelated files; it is not reported as a passing global check.
- Final synthetic export validated all 58 pages after the card, hero and exposure corrections. GitHub Pages is not republished by this staging release.
- Independent visual checks and local interaction evidence are described in the review. Browser zoom shortcuts did not alter the in-app browser's fixed viewport, so a physical 200% zoom check is not claimed. Reduced-motion formulas and CSS were checked; physical system-preference switching was not performed.

Real local-browser checks verified exclusive desktop hover, keyboard handoff, horizontal and vertical mobile card selection, stationary frame geometry, outgoing hero pose retention and rapid tab returns. Sixteen native 90px scroll steps cover the new 1440px desktop exposure journey at a 900px viewport. The final title keeps the full sentence through halfway, fades only the unwanted words, then aligns and brings the survivors into two centered lines. All original text returns on reverse scrolling. Forty-one desktop and 21 mobile phase samples found no word collisions; the desktop meter stayed fixed. Source/copy glyph alignment measured zero drift, and final centering was within 0.008px at 360, 768, 1024 and 1920px. Mobile retains its compact exposure section without document overflow.

### Previous deployment

- Active application: `93e645be8bca8d1eff196b388e5c7131b53d0608`.
- Previous verified release: `37b574059e023ede22f0b596feee97464435421e`.
- Linux compilation, TypeScript and all 65 production-build pages passed.
- Post-deployment HTTPS smoke: **376/376 passed**, including public routes, assets, image optimization, preview restrictions and protected-route denials.
- Actual staging browser checks confirmed exclusive desktop hover, mobile first/middle/last card handoffs, constant Studio width/pose during its outgoing fade, and the final desktop/mobile word morph without console errors or horizontal overflow. At 1440×900, 0/4/8/12/16 native 90px scroll steps produced exposure progress 0/0.25/0.5/0.75/1.
- Both runtime-configuration fingerprints, the production release and production process identity remained unchanged. One scheduled email-worker attempt coincided with the staging restart and received a loopback connection refusal; the next scheduled attempt recovered successfully at 02:35 UTC. No manual email job was triggered.
- Guarded retention removed the two obsolete staging releases, leaving exactly the active and previous verified builds. All four temporary build candidates and their transfer files were removed. The temporary builder's scheduled backup remained successful.

Build provenance:

| Input/output                  | SHA-256                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| Committed source archive      | `65968ab5ce1e31423f18bb45bcb3145ba9af0abdceea7edf83c2c1d4c50e8d21` |
| Public staging build settings | `7a4c41c23c8cfa8e5c6034a954f37afea24fbb524236d5547ae245bfaefe4605` |
| Linux runtime artifact        | `faf48262044d35a629dc5bd69af0c0a8820b52d642dcc56b683bbfc10bf579fb` |

Private evidence remains under `.data/design-review/`, including `staging-smoke.json`, `staging-activation-word-morph.log`, `staging-exposure-wheel.json` and the `staging-title-morph-*.png` screenshots. A subsequent documentation commit does not change the running application identity.
