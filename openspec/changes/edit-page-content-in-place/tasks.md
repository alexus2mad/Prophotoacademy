## Implementation

- [x] 1. Identify editable rendered text and photographs safely across page families and test ambiguous matches.
- [x] 2. Connect in-place keyboard and pointer editing, image replacement and inspector state on desktop and mobile.
- [x] 3. Verify editing, draft isolation, publication and read-only behavior, and run the repository checks.
- [ ] 4. Update the editor guide and release the verified revision to staging. Record its storage mode and public parity.

## Verification

On 21 November 2026, a sandbox manager edited the About heading in place, replaced the photograph, reopened the saved draft and published. A signed-out browser retained the original heading and photograph until publication. The original content was restored afterward. The phone check at 390px covered keyboard cancellation and switching between the page and its fields. Additional checks covered multiline text, canceled and rejected image uploads, the read-only preview and bindings in eight page templates.

The application suite passed all 714 tests. TypeScript, the architecture check, formatting of the implementation and the synthetic export of 58 review pages passed.
