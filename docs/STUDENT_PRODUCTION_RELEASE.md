# Student area production promotion

This release starts from production `aa6f6aa4630be415d02d120732e5df795da6b5dd`
and promotes the reviewed student presentation from staging `46d0865`.
It includes the account dashboard, purchase history, profile form, lesson chrome,
collapsed lecture chapter lists and three-viewport image preloading.

Public pages, administration, login, marketing content, prices, enrollment rules,
authentication, invitations and package mappings remain on their production
versions. No database migration or runtime setting is required.
Saved lesson previews share the student's reading presentation so teaching
materials can be reviewed accurately without recording progress.

## Presentation boundaries

Only student workspaces, lesson players and saved lesson previews apply
`academyThemeClassName`. Administrator workspaces keep their existing root.
The theme defines black/neutral surfaces, Inter controls and workspace headings,
white primary actions and distinct semantic feedback. Source Sans 3 retains its
18px/1.7 lesson reading system and 42rem measure.

The owning learning, lesson-image and lesson-typography stylesheets keep two
mutually exclusive presentation variants. Existing selectors use
`:not(:where(.academy-theme, .academy-theme *))`; promoted selectors use
`:where(.academy-theme, .academy-theme *)`. These zero-specificity guards apply
to the subject before pseudo-elements, preserving each variant's internal
cascade. This prevents production admin/login styles leaking into the new
student layout while preserving those existing screens. Global modal body
scroll locks are shared. No marketing motion or public theme is introduced.

Course groups and lecture titles remain visible. The current lecture is bold;
its native disclosure starts closed and only student interaction opens its
chapter anchors. Inactive lectures remain direct links. Chapter navigation
closes the mobile drawer without changing completion rules.

Instructional images begin authorized loading within three viewport heights,
above or below the viewport. Pending observers adjust to resizing; each image
stops observing once admitted. Downloads begin immediately after authorization.
Media authorization, URL lifetime, gallery controls and quiz-only completion
are unchanged.

## Framework maintenance

The release also updates Next.js from 16.4.0 to 16.4.3, matching staging, in a
separate security commit. Other dependency versions remain unchanged. Version
16.4.1 patched the disclosed [Server Actions denial of service](https://github.com/advisories/GHSA-p3m5-59mp-jv5r),
[image optimization vulnerability](https://github.com/advisories/GHSA-2464-fhr4-w9xw)
and [typed-array cache vulnerability](https://github.com/advisories/GHSA-673q-mjm6-r5xr).
The application has no `use server` or `use cache` directives, and Next's resolved
Sharp is already 0.35.5, the documented image workaround. The patch removes the
framework's affected version rather than relying on those current conditions.

## Release checks

Build a fresh production artifact with production public URLs. Do not copy the
staging build output or runtime configuration. Verify a candidate on a spare
loopback port before switching the production symlink, and restore the captured
previous release on any restart or health failure. Keep exactly the active and
one previous verified application release after successful checks. Curriculum,
media, customer data, runtime files and booking are not part of release cleanup.
