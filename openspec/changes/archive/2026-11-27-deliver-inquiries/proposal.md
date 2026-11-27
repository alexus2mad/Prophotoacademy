## Why

Contact-form inquiries are stored and forwarded to Make.com, but the Make scenario only routes payment events, so inquiries never reach the team's Telegram group. Production visitors are also told their inquiry was saved in a demonstration mode and not sent, inquiries wait up to five minutes for the timer, and no admin page lists them.

## What Changes

- Add an inquiry route to the Make scenario that posts each inquiry to the «Реєстрація на курс» Telegram group, and resend the production inquiries that Make previously accepted without routing.
- Report a forwarded inquiry to the visitor as received whenever a notification webhook is configured; show the demonstration text only where inquiries are captured locally.
- Deliver a queued inquiry right after the response, keeping the timer for retries.
- Add an administrator inquiry list with the stored context and delivery state.

## Capabilities

### Modified Capabilities

- `notifications-and-integrations`: Inquiries reach the team notification channel promptly, and the visitor sees the actual delivery state.
- `student-administration`: Administrators can review inquiries.

## Impact

Make scenario 4539028, `src/app/api/inquiries`, inquiry dialog copy, admin navigation and a new admin page, production outbox rows for the two earlier inquiries. Requires a release to staging and production.
