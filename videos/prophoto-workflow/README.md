# До вашого наступного кадру

A 54.5-second Ukrainian ProPhoto product film. Original brand photography anchors a real manager-to-student handoff: prepare a lesson, grant access in ps-booking, begin learning, use course materials, resume with saved progress.

## Sources

Screenshots captured from the actual local test Academy and ps-booking apps. All accounts are synthetic, payments disabled. Capture provenance and exact crop recommendations are in `capture/extracted/asset-descriptions.md`. The original websites, staging course content and production customers were not modified for filming.

Narration: ElevenLabs Anton, Ukrainian, `eleven_v3`. Six generated takes and real character alignment. Music: an original 55-second ElevenLabs `music_v2` instrumental, sparse felt piano and analog pulse. Source prompts live in the creative brief/script; no credentials are stored in this project.

## Edit and reproduce

The project is separate from the Next.js application. HyperFrames CLI is pinned in package.json. Requires Node 22+, FFmpeg and a supported Chrome runtime.

- `SCRIPT.md`: final spoken words, voice and direction
- `STORYBOARD.md`: six scene plans and durations
- `frame.md`: ProPhoto-specific art direction and exact tokens
- `compositions/frames/`: one seek-safe scene per file
- `assets/`: frozen source media and generated audio
- `captions.uk.srt`: timed Ukrainian subtitles
- `scripts/prepare-media.mjs`: stage source assets, pad narration, derive caption timing
- `scripts/finish-index.mjs`: add captions/disclosure/music envelope after workflow assembly
- `scripts/build.mjs`: assemble the six scenes and apply the finishing pass
- `QA.md`: capture evidence, verification results and review limitations

After editing scene HTML or caption timing, run `node scripts/build.mjs`. This uses the installed product-launch-video workflow scripts; override their location with `HYPERFRAMES_WORKFLOW_SCRIPTS` when needed. The checked-in `index.html`, scene files, fonts and audio are sufficient to preview or render without regenerating assets or using an ElevenLabs key.

Preview: `npx hyperframes@0.8.148 preview --background`

Check: `npm run check`

Render: `npm run render -- --quality delivery --fps 30 --output renders/prophoto-next-frame.mp4`

Regenerating narration uses existing ElevenLabs credits and is opt-in: set ELEVENLABS_API_KEY outside the project, then run `pwsh -File scripts/generate-narration.ps1`. Existing audio is reused. Do not commit keys, auth sessions, customer records or real production screenshots.

The film demonstrates existing UI using test data; it does not announce that payments, Mux video, or real course teaching content have launched.
