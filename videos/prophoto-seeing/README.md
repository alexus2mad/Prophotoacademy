# ProPhoto — Щоб аж йой

A 35-second Ukrainian workflow advertisement. The story follows a fictional potato photography exercise through the actual Academy course editor, ps-booking access management, Academy learning player, and the manager's saved progress record

## Deliverables

- `renders/prophoto-workflow-yoi.mp4` — 1920 × 1080, 30 fps, Ukrainian narration and captions
- `renders/prophoto-workflow-yoi.uk.srt` — separate Ukrainian subtitles
- `capture/` — original screenshots saved during the real local workflow
- `snapshots/` — composed frame checks
- `index.html` and `compositions/frames/` — editable HyperFrames project

Open the running editor at http://localhost:3211/#project/prophoto-seeing

## What the film shows

The same lesson was prepared and published as curriculum version 2. Its required video and photograph were uploaded through the sandbox's authorized media API. In ps-booking, the existing synthetic guest account was moved to that curriculum and given all four lessons. The student played the eight-second lighting study, inspected the exercise and image, then used the explicit student-confirmation action. Both dashboard and manager record show the resulting 69 percent total course progress

The 69 percent includes earlier test activity. The manager correctly attributes the potato lesson's confirmation to the student. No claim is made that watching the ad or simply downloading a file completes a lesson. The film uses animated, cropped screenshots of observed application states; it is not presented as an uninterrupted screen recording

The synthetic address initially used for a pending grant (`muse@example.test`) cannot log in because the local identity adapter supports only three fixed accounts. The filmed journey therefore uses the existing `guest@example.test` identity. The pending grant is retained as a local test record; its screenshots are unused in the edit

Payment and external email are disabled. No production course, account, payment, or customer record was modified

## Media provenance

- UI: captured from the actual local Academy and ps-booking applications on 11 October 2026
- Logo and fonts: supplied ProPhoto brand assets already used by the application
- Dashboard photography: original Academy image rendered by the existing application
- Potato campaign images: generated for this approved concept; fictional advertising subjects, never attributed to students or teachers
- Lesson video: an eight-second before/after lighting exercise assembled from the generated campaign photographs
- Narration: ElevenLabs Voice Design, fresh native Ukrainian female performance in the approved Voice 3 style, selected take 3. No existing saved voice was removed or changed
- Music and shutter signature: generated with ElevenLabs. Prompts and response metadata live alongside the audio
- `ui-focus-zoom`: official HyperFrames registry component, installed as a reference; its one-wrapper camera approach was adapted to precise screenshot crops

Unused earlier auditions and source photographs are retained locally for editing history, but the current edit uses only the assets referenced from its compositions

## Rebuild

Use Node 22+, FFmpeg on PATH, and the pinned HyperFrames 0.8.149 CLI. Audio generation requires an existing ElevenLabs key in the environment and is not part of normal rebuilds

```powershell
npm ci
node scripts/build-film.mjs
node "$env:USERPROFILE/.agents/skills/hyperframes-audio/scripts/carve.mjs" --comp index.html --bed music --strength 0.6
npx hyperframes@0.8.149 check --snapshots
npx hyperframes@0.8.149 preview --background --port 3211
npx hyperframes@0.8.149 render --fps 30 --quality delivery --output renders/prophoto-workflow-yoi.mp4 --skill general-video
```

Rebuilding HTML resets the music carve; rerun the carve after each build. It resolves the `voiceover` group and excludes the `sfx` group. Voice, music and shutter tracks are separate and editable. The delivery master has a −3 dBTP true-peak ceiling

The older rejected advertisement remains in `../prophoto-workflow` and is not overwritten
