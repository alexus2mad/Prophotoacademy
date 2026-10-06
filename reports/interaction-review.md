# Interaction refinement verification

Verified locally on 7 October 2026 in the Codex in-app browser.

## Implemented behavior

- Course outcome numbers sit beside their text in compact rows. Desktop keeps the two-column list; mobile uses one column.
- Photographs pan subtly with scroll and pointer movement and zoom on hover or focus. Work is limited to visible frames, with no idle animation loop.
- Course and package cards, buttons, text links, form fields and gallery controls have coordinated hover, focus and press feedback. Unavailable packages retain a restrained treatment.
- Package comparison shows all tiers on desktop and two selectable tiers on mobile. The existing direct package actions remain available.
- Native disclosures animate where supported. Gallery changes have a short transition and an explicit enlargement affordance.
- Reduced-motion preferences disable photographic movement, lifts and disclosure transitions. The preference listener handles changes while the page is open.

## Verification

- Production build passed, including TypeScript and prerendering of 19 routes.
- Desktop comparison displayed all three tiers with their source prices, inclusions and availability.
- The PLATINUM inquiry action opened the existing inquiry with the selected course and package context. No inquiry was submitted.
- At 390px, the comparison used two readable columns and labeled selectors. Switching the second tier to GOLD displayed its price and unavailable state. Escape restored focus to the comparison trigger.
- Course outcomes at 390px placed each number beside its copy; the measured single-line rows were approximately 40px high. Desktop rows were approximately 45px high.
- Scrolling updated the visible course photograph's translation. Hovering an available package card produced the specified 5px lift and border feedback.
- Gallery opening, ArrowRight navigation and Escape dismissal worked. Escape returned focus to the originating photograph button.
- No captured browser warnings or errors remained in the final gallery check.
- Temporary viewport overrides were reset after testing.

Reduced motion was verified in the implementation, not through an operating-system preference change. Mobile checks used browser viewport emulation, not a physical device.

## Evidence

- [Compact desktop outcomes](screenshots/outcomes-desktop.jpg)
- [Desktop package comparison](screenshots/comparison-desktop.jpg)
- [Mobile package comparison](screenshots/comparison-mobile.jpg)
