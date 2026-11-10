# Designer resolutions — staging release, 10 November 2026

Staging runs `9730d095c15e6493588773719599b6dac8b8cbf4` at
<https://staging.prophotoacademy.com.ua>. The previous verified release is
`73c97ffca507291a6c381c040a169bb718403401`. The guarded cleanup removed
`d5c3fb87216758f57dc9dd8f98801a2c82cea33b`; exactly active and rollback remain.

## Applied decisions

The [source difference register](FIGMA_ARTIFACT_DIFFERENCES.md) records the
designer's numbered decisions and additional content directions. Roboto
Condensed and Figma's KyivType weights remain authoritative. Secondary desktop
heroes use the artifact's metrics. Former red sections use paper backgrounds;
primary buttons retain white text on red. Contacts and Academy section rhythm
retain the specified Figma dimensions.

Studio uses the actual studio photograph. Academy presents four distinct main
courses and eleven attributed reviews. The homepage keeps six Academy cards
and three Studio cards in the corresponding tab states, with its original eight
reviews. Contact details use Kyiv, Saksahanskoho 24/25 throughout.

The fourth course, `/food-photography`, uses source-backed editorial content
and the artifact's table/laptop/studio photograph. It is inquiry-only until an
offering is configured. No price, intake, package, purchase entitlement or
learning record was invented. Existing commercial course IDs, routes and
packages remain unchanged. Shared public content gains the course/address;
legacy component code and styles remain executable through the inactive
`legacy` presentation setting.

## Verification

- Architecture: 645 modules; TypeScript and changed-source formatting passed.
- Full suite: 339 tests across 50 files passed. One initial unconstrained run
  exceeded the sandbox database startup test's five-second timeout; the full
  suite passed with two workers, without changing tests or timeout thresholds.
- Source content validation passed: seven programs and six configured offerings.
- The final Linux production build passed compilation, TypeScript and all 65
  generated pages. The synthetic review export validated all 58 pages; GitHub
  Pages was not republished.
- Live read-only HTTP checks: 361/361 passed, including the four-course order,
  inquiry-only fourth course, eleven reviews, address, white sections, CTA
  colors, media/fonts, existing enrollment eligibility, mock checkout, private
  route denial and both environments' health.
- Local responsive checks covered 360, 390, 768, 1024 and 1440px. Live desktop
  and 390px checks confirmed six/three homepage card groups, Studio photography,
  the review carousel's final position/disabled next control, mobile inquiry
  context, Escape dismissal/focus restoration and no horizontal overflow.
  No browser errors were recorded in the final checked journey.
- No test inquiry, order, email or student mutation was submitted. The normal
  scheduled staging email worker ran successfully after activation.

Private screenshots, metrics, test logs and the 361-check report are under
ignored `.data/designer-decisions/`. Representative captures include
`staging-studio-desktop.png`, `staging-home-studio.png`,
`staging-reviews-last.png`, `staging-white-form.png` and
`staging-food-inquiry-mobile.png`. These checks do not replace the source
geometry caveats in the historical difference register with an unconditional
two-pixel conformity claim.

## Build provenance and isolation

The owner-authorized OVH host produced an isolated Linux build from committed
source and reviewed public build settings only. The transient unit used a
2,700 MB RAM / 2,048 MB swap cap after capacity verification. No old website,
worker or backup configuration was changed; the nightly backup timer remains
active. Temporary candidate, dependencies, artifacts and transfer files were
removed following successful verification.

| Input/output | SHA-256 |
| --- | --- |
| Committed source archive | `a4d001ea860b8634d27949155b27b2161d19b959cb3bc58047236ef533176bb2` |
| Reviewed public build settings | `7a4c41c23c8cfa8e5c6034a954f37afea24fbb524236d5547ae245bfaefe4605` |
| Linux runtime artifact | `b8c6f61f6fc50691cce915680db1d0288dee9668dca23dd9c7fbb7c1ff7bfbce` |

Activation verified archive checksums and contained pnpm links, required runtime
files including the email worker, staging identity and database health. Its
wrapper restores the previous staging release on any activation failure,
including restart failures. Neither runtime configuration changed.

Production remains on `5ae3eca80dbb9e8eb1bb1203343be16d99ba591a` with its original
process (PID 1047) and runtime fingerprint. Staging retains `studio` presentation,
its isolated Supabase/Sanity projects, `mock` payment mode and noindex headers.
No production, booking, DNS, mail-forwarding, database or CMS changes were made.
