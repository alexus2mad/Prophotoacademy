# Local learning walkthrough

Run `pnpm sandbox:learning` from the Academy `web` directory. Open [the walkthrough](http://127.0.0.1:3200/sandbox).

The runner expects the existing ps-booking checkout at `../ps-booking-integration`. For another checkout, set `SANDBOX_BOOKING_ROOT` to its absolute path. Install that repository's dependencies first. Both applications need Node 22.12 or later. The runner never loads either repository's `.env` file.

| Destination | Address |
| --- | --- |
| Guide and accounts | http://127.0.0.1:3200/sandbox |
| Academy course editor | http://127.0.0.1:3200/admin/courses |
| Students & team (Academy admin) | http://127.0.0.1:3200/admin/students |
| ps-booking customer-card bridge | http://127.0.0.1:3201/academy.html |
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
3. In Academy admin, open **Студенти → Надати доступ за email**. Enter the student email, choose the course version and lessons, and record the package and reason. No purchase is created.
4. Sign out of Academy and sign in as the student. The verified email claims the pending enrollment. Open the lesson, read its text, inspect PDF pages and check saved progress. **Я опрацював матеріал** records student-confirmed completion separately from automatic tracking.
5. In Academy admin → Студенти, reopen the student. Check course and lesson progress. Cancel access with a reason, refresh the student's lesson, then restore access. Progress must remain intact.
6. Add or edit material in the manager's draft and publish a new version. Existing students retain the previously assigned version until explicitly transferred in Academy admin → Студенти. Configure a package against a published version, then test its zero-charge checkout from the course landing page. Provider payments remain disabled; the real enrollment service creates synthetic access. See `COURSE_CHECKOUT.md`.

The browser shares Academy cookies between tabs. Use **Вийти** before switching Academy identities. ps-booking keeps its own separate manager session for its customer-card panel.

## Multi-lesson rehearsal

The additional **Контент для бренду — тестовий курс** program seeds two modules and four lessons: **Мета й аудиторія**, **Композиція та світло**, **План зйомки**, and **Розбір контенту**. It preserves the original single-lesson course.

Create and save this draft in the editor. Add articles to the first three lessons and a Zoom block to the fourth. `node scripts/sandbox/add-course-media.mjs` optionally adds the existing sample image and two-page workbook through authenticated upload APIs. It is restricted to this synthetic program and skips material kinds already present. Reload the editor after running it, then publish and configure the package through the UI.

Grant the student all four lessons in Academy admin → Студенти. Test navigation, protected images, PDF pagination and text access, manual completion, revocation/restoration, and attendance. The saved rehearsal contains an upcoming synthetic Zoom meeting on 11 October 2026 at 18:00 Kyiv time and a past one on 9 October. Repeatedly saving the newly created past session must update the same record. Confirming its attendance (Студенти → Зустрічі or the course's Zoom panel) brings the course from 75% to 100%. Never join the placeholder Zoom link.

After that exact fixture has been exercised, `node scripts/sandbox/verify-course-flow.mjs` checks persisted grants/completion, media boundaries, disabled payments, meeting deduplication and calendar export. It is an assertion script for the saved walkthrough, not a general course seeder. Results and screenshots belong in `.data/learning-sandbox/multi-lesson/`. Build their local gallery with `node scripts/sandbox/course-flow-evidence.mjs`.

Email-code requests retain the production rate limit of three requests per address in ten minutes, including across sandbox restarts. Wait for the window to expire if switching accounts repeatedly; do not disable this protection for testing.

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

The rehearsals cover draft creation, publication, pending email access, student login, protected text/image/PDF reading, completion, manager statistics, revocation/restoration, Zoom scheduling and attendance, mobile curriculum and responsive widths. Live email delivery, real purchases, Sanity permissions, Mux processing, production storage and video playback require separate provider-backed verification before activation. Browser manual-completion checks do not substitute for automatic coverage-tracking tests.
