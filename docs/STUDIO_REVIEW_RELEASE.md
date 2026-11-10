# Studio review fixes — release record

## Current staging release — card actions and eased exposure

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
