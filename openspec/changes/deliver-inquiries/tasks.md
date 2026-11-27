## 1. Telegram delivery

- [x] 1.1 Add an inquiry route to Make scenario 4539028 posting to the «Реєстрація на курс» group. The three payment routes are unchanged.
- [x] 1.2 Requeue the production inquiries already accepted without routing and confirm the Telegram posts. The 14 and 23 November inquiries were requeued and delivered; both Make runs used the webhook and Telegram modules.

## 2. Application

- [x] 2.1 Report forwarded inquiries as received and keep the demonstration copy for local capture only.
- [x] 2.2 Deliver queued inquiries immediately after the response.
- [x] 2.3 Add the administrator inquiry list.
- [x] 2.4 Test and run the repository checks. TypeScript, architecture and formatting passed; the full suite passed, with five database-heavy files that timed out under parallel load passing serially (68 tests).

## 3. Release

- [ ] 3.1 Release to production and staging and verify the inquiry flow.
