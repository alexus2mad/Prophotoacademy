# Studio review fixes — release record

The candidate implements the [independent UI/UX review](STUDIO_DESIGN_REVIEW.md), recovered exposure script and restored approved card zoom. Staging activation is pending; production is outside this release.

## Candidate verification

- Architecture: 663 modules passed.
- TypeScript passed.
- Full suite: 364 tests across 55 files passed with two workers. The initial sandboxed run could not connect to its local boundary-test server; the permitted local-network rerun passed without changing the test.
- Changed files pass formatting and whitespace checks. The repository-wide formatter reports pre-existing drift in unrelated files; it is not reported as a passing global check.
- Final synthetic export validated all 58 pages after the card-motion correction. GitHub Pages is not republished by this staging release.
- Independent visual checks and local interaction evidence are described in the review. Browser zoom shortcuts did not alter the in-app browser's fixed viewport, so a physical 200% zoom check is not claimed. Reduced-motion formulas and CSS were checked; physical system-preference switching was not performed.

The final Linux build, deployed SHA, smoke results and release retention will be recorded after verified activation.
