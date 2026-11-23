## Implementation and verification

- [x] 1. Route editor data and image validation to the designated marketing project, enforce the staging guard and verify configuration and image boundaries with regression tests.
- [x] 2. Update the operator guidance and validate the specification, formatting, architecture and types.
- [x] 3. Configure and seed the separate staging marketing project, release to staging, and verify real text and image editing, draft privacy, publication, restoration and production isolation.

## Staging verification, 23 November 2026

- Release `4d6409c` connects the site editor to `3k86g5dt/production`. The project contains one public marketing dataset. The first import created all 18 existing pages and a second pass preserved all 18. Private lesson settings and the production service were verified against the pre-release configuration.
- A signed-in administrator edited the About introduction heading in place, chose a different Academy portrait from the page canvas, saved and reopened the draft. A signed-out request still returned the original heading and responsive portrait.
- After publication through the editor, an anonymous visitor received the edited heading and decoded both tested replacement image sizes from the new project. Republishing the original content restored the heading, original image bytes and responsive sources. The Sanity workspace had no pending draft afterward.
- All 714 application tests, the staging isolation tests, strict OpenSpec, TypeScript and architecture checks, the Linux production build and the 58-page synthetic review export passed.
