## Implementation

- [x] Implement the Food hero, desktop/mobile introduction and editable text.
- [x] Implement and exercise the ten-card vertical/horizontal benefits stack.
- [x] Place the two-row works gallery and review copy, preserving editor and lightbox behavior.
- [x] Implement accessible package disclosures and selected curriculum/benefit emphasis.
- [x] Verify route/data compatibility, public and preview behavior, responsive layouts and interactions, tests and release builds.
- [x] Deploy and smoke-test on staging, reconcile managed Food copy and verify rollback retention.

Verified 360, 390, 768, 1024 and 1440px package layouts, native disclosure with JavaScript disabled, phone touch and desktop drag, keyboard movement, all 31 works, and signed-out checkout navigation. All 788 tests passed on Next.js 16.4.5 and 58 static review pages validated. Staging release `75b7828` retained `121dfd2` for rollback. The anonymous published Food and Commercial documents matched the reviewed seeds after reconciliation, with all 16 other page revisions preserved.
