# Public photograph restoration — 12 November 2026

Staging and production run source `c616755d446ceddc2656df635eecfdde30790cb1`.
The Academy and course lecturer sections share the supplied 1920px Olena
portrait used on the homepage. The release restores 40 crops across 54 asset
mappings using 38 WebPs and regenerates 10 related Open Graph JPEGs.

The source audit covered 319 Drive images, 214 original Webflow rasters, and
local originals and design exports. It compared actual source pixels with the
displayed crop across 48 route and viewport combinations. Before-and-after
inspection included six staging captures covering the mobile hero and founder,
Academy lecturers, the Instagram course hero, and two homepage gallery photos.
See [the image quality audit](../IMAGE_QUALITY.md) for the photos that still
need larger or matching originals.

| Environment | Build ID |
| --- | --- |
| Staging | `ibe_xC2t0TsszwLe2f7mQ` |
| Production | `rHjcTWftKxc8S0B_rHcaB` |

Both Linux builds completed. Candidate and live HTTP checks verified the exact
bytes of all 48 changed assets, seven public pages, the shared Olena portrait
references, and site health. The staging social preview gallery returned 200
with `noindex`. Runtime configuration matched the previous release in both
environments. No full automated test suite was run.

Both environments retain this release and the previous verified release
`72461f56cd132ba9fbd93e2f4393d500cd94fcf8`. Cleanup removed the obsolete
`72f961c` builds, the isolated builder's 18 temporary paths and four temporary
deployment archives. Release receipts are under `.data/image-quality-release/`
and the image audit evidence is under `.data/image-quality-audit/`.
