# Academy homepage — October 2026

The central Academy frame in Figma file `CvY4dgmOevd9ehxk9Xsaqd`, page `724:216`, is the reference. Its annotations replace the repeated mockup labels with six directions and identify the first ecosystem banner as the studio. Hub and Shop remain separate destinations.

The homepage uses the design's KyivType Sans typography, wording, underwater opening, black canvas, square photographs, founder introduction, partner strip, testimonials and shop banner. Existing CMS testimonials replace duplicated placeholder quotes. Existing program slugs/catalog filters and the inquiry dialog supply functioning destinations. The camp is an inquiry, with no invented availability or payment.

## Image sources

`content/source/academy-home-photos.json` records the source and original dimensions for each photograph. Most are from the supplied Drive stock. The underwater original is 5760 × 3840; the largest delivered hero is 2400 pixels wide and below 150 KB. Responsive files use content hashes under the existing immutable `/images/hero/` cache policy. Only the opening photograph is preloaded; lower sections load lazily. Mobile requests a sufficiently large source for the tall crop.

`node scripts/prepare-academy-home.mjs` explicitly refreshes these committed variants from their recorded sources. Builds need no access to Google Drive. `home-images.json` contains presentation metadata and `prepared-home-images.json` feeds the shared image component. Review regenerated files before committing; old hashed assets can be removed only once no manifest references them.

Two mockup photographs could not be found in the supplied Drive folders: the dark-haired model beside a rock and the snowy forest with white fabric. Their positions use an original curly-haired black-and-white portrait and the red-fabric coastal photograph, respectively. The camp's empty image placeholder uses the same coastal series. The studio image comes from the existing Hub content; the shop light and nine partner logos come from the existing Webflow asset inventory. The mockup's unverified AllyProof logo is omitted. The founder remains a portrait: the annotation mentions video but supplies no matching video source. No nonfunctional play control is shown.

All new theme rules are scoped to the Academy homepage. Course-page stacks, customer accounts, learning, administration, payment behavior, CMS schemas and the Hub design are unchanged.
