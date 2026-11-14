# Studio and Shop navigation — 14 November 2026

Source `7df00527d2e1743b3956aeb112223b3df425d1c7` restores the existing Studio
and Shop introductions to header, menu, footer and homepage brand navigation.
Studio room links open the relevant section on `/photo-studio`. Booking actions
use the public Hub booking page; Shop actions use the explicitly reconfirmed
Instagram destination. The homepage remains focused on Academy.

Architecture checks, TypeScript, formatting of changed files and 21 focused
tests passed. Separate Linux production builds succeeded for each environment.
Browser checks at 390px and 1440px passed locally, on staging and on production:
internal navigation, menu and room anchors, active states, external CTA URLs,
Shop selection chips, images and overflow. No forms were submitted or external
booking/shopping destinations opened. Screenshots and results are retained in
`.data/ecosystem-pages-qa`.

Staging build `EL_-twFi8dr8_nGEU4pIp` and production build
`wOsjewzSH6PJD7dUkbPxH` are active. Health and content checks passed, runtime
settings are byte-identical to their pre-release state, and the staging social
preview gallery is preserved. The existing noindex policy for the Studio and
Shop introductions remains in place.

Both environments retain `a773714f823f59d1dd3806bbde947b4cd08e05b6` as their
single rollback release. Older application releases and reviewed temporary
builder files were removed. Deployment receipts remain in the private release
journals.
