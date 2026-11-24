## 1. Implement and verify

- [x] 1.1 Route each ticket action to the existing contact form, validate eligibility server-side and retire anonymous order creation.
- [x] 1.2 Run checkout regression tests, repository checks and build validation. All 853 tests passed, including both contact-bearing payment requests, mock approval, legacy callbacks and ineligible orders. Architecture, TypeScript, changed-file formatting and the 58-page review export passed.

## 2. Rollout

- [x] 2.1 Deploy the same revision to staging and production using their separate settings. Both Linux candidates and the public HTTPS checks passed at `9de62bee7d3ecac725fbd36ac1ad2397d67919c9`. Both formats route to Academy checkout with their catalog prices and required contact fields. Staging uses the simulator and production uses WayForPay. Live verification stopped at the checkout forms.
- [x] 2.2 Publish and verify the requested facts on both hosts. The cover reads «6 годин / 3 моделі / кількість місць обмежена» and the date and venue are still shown in the announcement.
