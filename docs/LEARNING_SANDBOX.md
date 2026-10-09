# Local learning walkthrough

Run `pnpm sandbox:learning` from the Academy `web` directory. Open [the walkthrough](http://127.0.0.1:3200/sandbox).

The runner expects the existing ps-booking checkout at `../ps-booking-integration`. For another checkout, set `SANDBOX_BOOKING_ROOT` to its absolute path. Install that repository's dependencies first. Both applications need Node 22.12 or later. The runner never loads either repository's `.env` file.

| Destination | Address |
| --- | --- |
| Guide and accounts | http://127.0.0.1:3200/sandbox |
| Academy course editor | http://127.0.0.1:3200/admin/courses |
| ps-booking student management | http://127.0.0.1:3201/academy.html |
| Student dashboard | http://127.0.0.1:3200/account |

The fixed local code is **123456**. Request a code before entering it; it is single-use and valid for ten minutes. No email is sent.

| Email | Purpose |
| --- | --- |
| `manager@example.test` | Administrator bootstrapped on verified local sign-in |
| `student@example.test` | Student in the walkthrough |
| `guest@example.test` | Unenrolled account for authorization checks |

## Manager to student flow

1. Sign in as the manager in Academy. Create a draft for **Тестова контент-практика**. This synthetic public program seeds one module and one lesson.
2. Add required text and a PDF block. `public/demo-media/workbook.pdf` is a disposable example workbook. Save, then publish and confirm. Publishing creates an immutable curriculum version.
3. In ps-booking, sign in with the same manager email/code. Open **Студенти → Надати доступ за email**. Enter the student email, choose the course version and lessons, and record the package and reason. No purchase is created.
4. Sign out of Academy and sign in as the student. The verified email claims the pending enrollment. Open the lesson, read its text, inspect PDF pages and check saved progress. **Я опрацював матеріал** records student-confirmed completion separately from automatic tracking.
5. In ps-booking, reopen the student. Check course and lesson progress. Cancel access with a reason, refresh the student's lesson, then restore access. Progress must remain intact.
6. Add or edit material in the manager's draft and publish a new version. Existing students retain the previously assigned version until explicitly transferred in ps-booking. New package rules can be configured against a published version; checkout remains disabled.

The browser shares Academy cookies between tabs. Use **Вийти** before switching Academy identities. ps-booking keeps its own separate manager session.

## Persistence and isolation

- Generated application: `.learning-sandbox/app`, rebuilt on each launch from the production source. Do not edit it.
- Saved data: `.data/learning-sandbox/academy`, `booking`, `documents.json`, and `media`. It survives restarts. These files and screenshots are ignored by Git.
- Stop with Ctrl+C. Restarting expires local email-login sessions; sign in again. A runtime lock prevents opening the same embedded databases twice. Ports 3200–3202 must be available.
- The actual course, entitlement, publication, progress, audit and signed ps-booking bridge services run unchanged. PostgreSQL-compatible PGlite, local code verification, a document store with revision checks and temporary media links replace external providers.
- Only loopback hosts are accepted. SQL/document RPC requires an ephemeral server secret and rejects browser origins. Payment, callback, scheduler, inquiry and booking mutations are disabled. Real service credentials are not passed to the generated Next process.
- Local media uploads accept PDF, JPEG, PNG, WebP and MP4, up to 50 MB. MP4 duration needs `ffprobe` at `D:/ffmpeg/bin/ffprobe.exe`, or `SANDBOX_FFPROBE` set to its installed executable. This does not test Mux processing or signed Mux playback.
- Production source has no sandbox-login switch. Production and GitHub Pages do not serve the generated sandbox. This is a local development tool, not a hosted staging environment.

## Verification and evidence

Run `pnpm test` for database, identity, access and sandbox boundary tests. After creating the course/workbook in the UI, run `node scripts/sandbox/verify.mjs` to check disabled payment endpoints, anonymous/wrong-user media denial and denied student authoring. Results are saved in `.data/learning-sandbox/verification.json`.

Walkthrough screenshots are saved in `.data/learning-sandbox/screenshots/`. The screenshot index at `.data/learning-sandbox/walkthrough.html` documents the observed sequence. Keep synthetic evidence local; do not include real customer data or credentials.

This rehearsal covers draft creation, text/PDF upload and publication, pending email access, student login, protected reading, completion, manager statistics, revocation/restoration, mobile curriculum and responsive widths. Live email delivery, real purchases, Sanity permissions, Mux processing, production storage, video playback, image upload and Zoom attendance require separate provider-backed verification before activation.
