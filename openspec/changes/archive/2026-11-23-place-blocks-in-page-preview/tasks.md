## Implementation
- [x] Verify persisted page-scoped positions, identity preservation, backward compatibility, invalid destinations and no-op moves.
- [x] Render stable native section locations and verify signed-out HTML order plus existing page parity.
- [x] Implement preview insertion, pointer drag, keyboard and touch alternatives and cancel behavior. Verify in the browser.
- [x] Validate structure, types, formatting, tests, builds and Pages review. Deploy to staging and verify draft/save/publication, restoration and release retention.

## Verification evidence

- The browser inserted blocks between native sections and between neighboring custom blocks. Chromium mouse input reordered them in the scaled preview, including across a long section using edge scrolling. Escape canceled a drag. Keyboard selection restored focus to the moved block.
- At 390px, Chromium touch emulation exercised dragging, gesture cancellation, tapping a destination, and adding another block immediately after dropping. The drag handle measured at least 44 screen pixels. The first insertion point on the homepage and a custom landing was hit-testable at both 390px and 1440px with the public header present.
- Server-rendered route tests cover all 18 managed marketing pages, new and legacy landings, default end placement, and retired locations. Local browser publication confirmed the order in signed-out HTML with JavaScript disabled. The maintained sandbox regression is documented in `docs/site-content-editor.md`.
- All 759 tests passed, along with TypeScript, architecture and changed-file formatting checks. The Linux deployment build generated 67 routes. The synthetic export passed its 58-page review check.

## Staging release

On 23 November 2026, staging activated `121dfd203a4e096cab09df0e1a0464a56740dc28`. The staging authoring services saved and reopened a private block before the figures on the About page, moved it before the team, then restored the original workspace. The published About revision stayed unchanged throughout.

A temporary staging landing exercised publication through the dedicated marketing Sanity project. Two publications placed the same block in different positions. An anonymous HTTP reader saw it exactly once, in the expected order relative to native sections. After cleanup the temporary URL returned 404. All 18 pre-existing publications and public-page content comparisons matched their release baselines. Production stayed on its previous release.

After these checks the staging host retained the active release and one rollback, `07e0c1b`. The temporary build and transfer files were removed.
