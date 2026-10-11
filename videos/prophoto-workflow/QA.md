# Film verification

Verified on 11 October 2026. This is a product film using actual local application screenshots with synthetic records. It is not a screen recording or a production-launch announcement.

## Observed customer journey

- Manager opened the existing test course outline, selected the composition lesson and inspected its text preview in Academy.
- Manager granted the synthetic guest account access to four lessons through ps-booking. The assignment confirmation was captured.
- Student signed in with the local test flow and immediately saw the assigned course.
- Student opened the first lesson, inspected the photography lesson and used the integrated PDF viewer.
- Returning to the account displayed two completed lessons and a resume action. Progress was also visible in the manager's student card.
- Test payments remained disabled. Production customer records and teaching content were not changed.

The original captures are in `capture/screenshots/`, with source descriptions in `capture/extracted/asset-descriptions.md`. The film uses cropped captures, without inventing controls, payment results, or enrollment statistics. The manager confirmation is enlarged 1.5 times for legibility. Other captures use native or smaller display sizes.

## Automated and visual checks

- Repository architecture check passed: 359 modules, no runtime dependency cycles.
- TypeScript check passed.
- Repository formatting check passed.
- HyperFrames 0.8.148 final check passed: no lint errors, no browser runtime errors, no layout errors, 22 of 22 sampled contrast checks passed. Three layout warnings describe intentional clipping of the manager and student dashboard screenshots.
- Seven advisory lint warnings remain: caption track density, editable IDs on a few container elements and repeated logo source discovery. Sampled frames were reviewed visually; these are not runtime failures. No motion assertion sidecar is configured.
- All six scene midpoints, the student handoff, workbook, resume state and closing CTA were inspected. Text and controls remain within the picture area, above the subtitle band.
- Narration uses a 0.75 track gain to leave headroom for the generated music bed. Music has an authored fade and level envelope.
- Exported audio measures -17.3 LUFS integrated, 3.7 LU loudness range and -3.1 dBFS true peak, without clipping.
- Local HyperFrames Studio returned HTTP 200 and loaded the complete 54.5-second timeline.
- Reviewing exact cut frames caught two initial-visibility flashes in the first encode. The opening screenshot states were fixed in CSS and the relevant boundaries rechecked before the final encode.

## Output

`renders/prophoto-next-frame.mp4`: 54.5 seconds, 1920 × 1080, 30 fps, H.264 picture and 48 kHz stereo AAC audio. `captions.uk.srt` is supplied separately in addition to the visible subtitles. `review/contact-sheet.jpg` contains frames extracted from the encoded MP4.

## Review boundaries

The test course is labeled as a test course in the real UI. Its PDF contains demonstration text. This draft does not claim that paid teaching content, video hosting or live checkout are available. The closing public Academy address leads to the existing marketing website; the staging address is not promoted.

The editable source and captured screenshots belong in Git. Generated MP4 files, render caches and preview thumbnails are kept locally and ignored by Git.
