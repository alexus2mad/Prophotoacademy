- [x] Reproduce the reported gallery and workshop listing issues.
- [x] Correct the gallery interaction and check drag, release, photo selection and responsive behavior.
- [x] Share the Academy workshop row styling and verify publication discovery, links and responsive layout.
- [x] Run repository checks, verify the staging experience and archive the change.

## Verification

- On staging, Chrome recorded a 116px reversal after a single desktop drag as the workshop rail restored mandatory snapping. The drag controller now hands control directly to momentum and the workshop uses the same free-scrolling mouse behavior as other photographic rails. Touch retains native snapping.
- The homepage’s Workshops direction leads to `/academy#workshops`. The added workshop previously used a generic link and description. The linked workshop rows now share heading, divider, full-row action and responsive layout. The published cover title and destination come from the workshop document.
- All 815 tests passed, alongside TypeScript, the 944-module architecture check and formatting of the affected files. The synthetic export built and validated 58 review pages.
- Deployed Linux application revision `715cfea` to staging. Chrome checks at 1440px and 390px followed the homepage card to the workshop list and landing, and found zero backward scroll frames or accidental dialogs. A deliberate photo selection opened the expected work; previous, next and Escape passed. With reduced motion the desktop rail stopped at its 140px release position. The last mobile photo aligned within 0.25px of the right edge.
- Staging retains `9d5431d` for rollback. Production remained on `75b7828`.
