# Ecosystem verification · 7 October 2026

- 39 tests passed, covering existing payments and inquiries plus domains, rewrite recursion, practice publication, private activity import, identity merging, marketing preferences, cancellations, attribution and metrics
- Production build passed with 32 generated routes; TypeScript passed
- Fixture validation passed: 6 programs, 6 intakes, 19 photographs, 3 rooms, one planned practice session
- Actual Sanity GROQ verified against 63 migration documents, including native-ID room/session references
- Production Hub mode smoke check: root, room, selected-room booking, sitemap, robots and logo return 200; private operations API remains disabled without a secret
- Local guided-practice inquiry verified in the browser and database; selected session/site retained, announcements preference false, no purchase created; synthetic record removed
- Private customer overview verified using an isolated synthetic database and temporary localhost-only server; subsequent booking and contribution margin were correct; test server/database removed
- Cross-site campaign transfer verified through an actual Academy → Hub navigation
- Hub rates visible at widths 360/390/768, with last-rate bottoms 677/654/557px respectively; no horizontal overflow
- Academy flagship title and main course CTA retained; mobile CTA bottom 633px at 390×844
- Hub booking action bottom 672px at the default 1280×720 desktop viewport
- Native focus/dialog behavior retained; booking and enrollment omit ecosystem offers; photographs respect reduced motion
- Development SSR cache mismatch resolved by restarting the preview; final browser review has no new console errors

Screenshots: screenshots/ecosystem-academy-desktop.png, ecosystem-academy-mobile.png, ecosystem-hub-desktop.png, ecosystem-hub-mobile.png. Temporary viewport override reset. Local Hub preview retained for review.

Live deployment, Sanity writes, GA property configuration, booking/attendance event feed and actual guided-practice delivery remain unconfigured. See ../ECOSYSTEM.md.
