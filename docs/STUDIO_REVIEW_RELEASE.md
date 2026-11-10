# Studio review fixes — release record

Deployed to [staging](https://staging.prophotoacademy.com.ua/) on 10 November 2026. The release implements the [independent UI/UX review](STUDIO_DESIGN_REVIEW.md), recovered exposure script, the approved card choreography and the user's subsequent hero/exposure refinements. Production is unchanged.

Deployed application: `93e645be8bca8d1eff196b388e5c7131b53d0608`. Card trigger correction is independently committed as `ffe7238`; hero continuity and exposure pacing are committed as `e3d12c4`; the final word morph is committed as `93e645b`. The earlier `5eeef8f` build was stopped before producing an artifact. `e3d12c4` built successfully but was superseded by the user's word-morph refinement. Neither intermediate build was activated.

## Verification

- Architecture: 675 modules passed.
- TypeScript passed.
- Final full suite: 394 tests across 59 files passed with two workers. The suite includes 26 card-policy tests, six hero-retention tests and 21 exposure tests. Local boundary-test servers used the permitted local-network test run.
- Changed files pass formatting and whitespace checks. The repository-wide formatter reports pre-existing drift in unrelated files; it is not reported as a passing global check.
- Final synthetic export validated all 58 pages after the card, hero and exposure corrections. GitHub Pages is not republished by this staging release.
- Independent visual checks and local interaction evidence are described in the review. Browser zoom shortcuts did not alter the in-app browser's fixed viewport, so a physical 200% zoom check is not claimed. Reduced-motion formulas and CSS were checked; physical system-preference switching was not performed.

Real local-browser checks verified exclusive desktop hover, keyboard handoff, horizontal and vertical mobile card selection, stationary frame geometry, outgoing hero pose retention and rapid tab returns. Sixteen native 90px scroll steps cover the new 1440px desktop exposure journey at a 900px viewport. The final title keeps the full sentence through halfway, fades only the unwanted words, then aligns and brings the survivors into two centered lines. All original text returns on reverse scrolling. Forty-one desktop and 21 mobile phase samples found no word collisions; the desktop meter stayed fixed. Source/copy glyph alignment measured zero drift, and final centering was within 0.008px at 360, 768, 1024 and 1920px. Mobile retains its compact exposure section without document overflow.

## Deployed release

- Active application: `93e645be8bca8d1eff196b388e5c7131b53d0608`.
- Previous verified release: `37b574059e023ede22f0b596feee97464435421e`.
- Linux compilation, TypeScript and all 65 production-build pages passed.
- Post-deployment HTTPS smoke: **376/376 passed**, including public routes, assets, image optimization, preview restrictions and protected-route denials.
- Actual staging browser checks confirmed exclusive desktop hover, mobile first/middle/last card handoffs, constant Studio width/pose during its outgoing fade, and the final desktop/mobile word morph without console errors or horizontal overflow. At 1440×900, 0/4/8/12/16 native 90px scroll steps produced exposure progress 0/0.25/0.5/0.75/1.
- Both runtime-configuration fingerprints, the production release and production process identity remained unchanged. One scheduled email-worker attempt coincided with the staging restart and received a loopback connection refusal; the next scheduled attempt recovered successfully at 02:35 UTC. No manual email job was triggered.
- Guarded retention removed the two obsolete staging releases, leaving exactly the active and previous verified builds. All four temporary build candidates and their transfer files were removed. The temporary builder's scheduled backup remained successful.

Build provenance:

| Input/output | SHA-256 |
| --- | --- |
| Committed source archive | `65968ab5ce1e31423f18bb45bcb3145ba9af0abdceea7edf83c2c1d4c50e8d21` |
| Public staging build settings | `7a4c41c23c8cfa8e5c6034a954f37afea24fbb524236d5547ae245bfaefe4605` |
| Linux runtime artifact | `faf48262044d35a629dc5bd69af0c0a8820b52d642dcc56b683bbfc10bf579fb` |

Private evidence remains under `.data/design-review/`, including `staging-smoke.json`, `staging-activation-word-morph.log`, `staging-exposure-wheel.json` and the `staging-title-morph-*.png` screenshots. A subsequent documentation commit does not change the running application identity.

