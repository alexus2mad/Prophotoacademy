# Public photograph quality audit — 12 November 2026

The public Academy pages were inspected at 390px/DPR3, 1440px/DPR2 and
1920px/DPR2, including the homepage, Academy, course pages, About, student work,
reviews, contacts and the unlinked Studio/Shop previews. Gallery checks included
all 16 homepage photographs, 42 student works, 24 commercial-course works and
four AI Artwork images. The audit compared actual source pixels with the
displayed photograph after `object-fit`, rather than treating a large image
element or a density-adjusted `naturalWidth` as proof of sufficient resolution.

The source search covered all 319 images in the supplied Google Drive folder,
including files beyond the initial 50-item listings, the existing local original
photographs, raw design exports and 214 original Webflow raster assets. Exact
photographic matches and crops were checked visually. Downloads and working
contact sheets stay in ignored `.data/image-quality-audit/`.

## Changes

- The Academy and course lecturer sections now share the sharp 1920px Olena
  portrait already used on the homepage. About's existing responsive portrait
  was already made from that original. Her distinct white-suit photograph is
  retained as a separate photograph.
- Forty exported crops were restored across 54 design asset mappings using 38
  deduplicated WebPs. These include the Academy hero, gold photograph, instructor
  portraits, mobile cards, student gallery photographs, winter portrait and
  narrow Studio/Shop banners.
- Exports retain the reviewed framing and color treatment. Mobile files are
  bounded to their display needs; full-width desktop heroes have a 3200px
  ceiling. Smaller originals are not enlarged. Original camera files and
  metadata are not added to the release.
- Lecturer image size hints account for the actual mobile width and the taller
  cropped tablet slots. The page layout, galleries and motion remain unchanged.
- Related Open Graph artwork is regenerated from the restored sources using the
  existing layouts and fingerprinted image URLs.

`content/source/studio-image-restoration.json` records the original file or
public source, hash, native dimensions, crop, color adjustment and output size.
It also records unchanged and unmatched design rasters. The original Figma keys
remain the component contract; their values can point to better photographs.

## Remaining source limits

| Photograph | Available detail | Result |
| --- | --- | --- |
| AI Artwork rose hero | The 1500px-wide original yields the same 1500×731 approved crop | A larger original is still needed for large desktop displays |
| Food-course podcast/tabletop | 808×1197 export; the available larger room photographs have different perspectives | Retained the approved shot; needs its exact original |
| Curly-haired exposure/alternate hero | Exact Drive original is 1200×800 | Retained current rendering; a larger export cannot create more detail |
| Mobile Studio hero | The 2600px panorama contains only 710px across the approved mobile crop | Retained the crop; needs a higher-resolution panorama |
| Individual-training practice | Original crop is 853×683; alternate frame has no additional cropped detail | Retained |
| Teaching/workshop photograph | Original is 1235×823; an alternate export is only 1280×853 | Retained; no meaningful high-density improvement |
| Desktop softbox | A larger frame contains effectively the same narrow crop; Webflow source gives only about 9% extra detail | Retained; mobile banners were improved separately |
| Remaining student-work files | Most Drive originals are already the 1280–1471px-tall files used by the site | Retained at their actual native resolution |
| Other unmatched design photos | No exact better source found in the inspected library | Retained; individual records are in the provenance JSON |

These limitations are not hidden by artificial enlargement or substituted
photographs. Future replacements should use the exact original, preserve the
crop and attribution, generate bounded WebPs with new content hashes, and update
the relevant provenance and social-image fingerprint.

No automated test suite was run for this asset-focused change. Source/dimension
checks and before/after visual inspection were performed; release compilation
and HTTP checks are recorded separately in the deployment note.
