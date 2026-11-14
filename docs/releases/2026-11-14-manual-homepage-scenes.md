# Manual homepage scenes — 14 November 2026

Source `b307caca4d219537c2b3408af1ecf9d9360a8f8a` restores the homepage's
Studio / Academy / Shop selector and original scene transitions. Academy is
selected initially; only an explicit tab click or keyboard activation changes
the brand. There is no timed brand cycling or swipe-to-switch handler.
Academy's existing portrait rotation stays within Academy.

The Studio panorama and gentle photograph motion are restored. An outgoing
image keeps its pose until its opacity reaches zero. Mode selection updates
the hero copy/action and the existing room-card presentation without moving
exposure scroll state back into the parent. Studio booking CTAs point to the
public Hub booking page; Shop CTAs keep the confirmed Instagram destination.

Architecture, TypeScript, changed-file formatting and 31 focused tests passed.
Separate Linux builds passed for staging and production. Browser checks at
390px and 1440px passed locally and on both deployed sites. The checks include
14.5 seconds on Academy, 13.2 seconds on Studio and 8.2 seconds on Shop without
selection changes; manual keyboard activation; native mobile swipe/scroll
stability; external CTA targets; rapid switching; measured pose retention during
crossfades; reduced motion; offscreen pause; room-card counts and partner-rail
autoplay. Screenshots and measurements are under `.data/manual-hero-qa`.
No forms were submitted and no external booking or shopping destination opened.

Staging build `dk3CbukPtzoyGps8aw-c5` and production build
`Z9ghxFyg3_0Tj1yn-NcZB` are active. Both passed health and content checks with
their runtime settings unchanged. The separate staging social gallery is
preserved. Each environment retains `7df00527d2e1743b3956aeb112223b3df425d1c7`
as its single rollback release. Obsolete releases and the reviewed temporary
builder and transfer files were removed.
