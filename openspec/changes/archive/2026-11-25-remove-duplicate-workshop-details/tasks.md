## 1. Remove the duplicate details

- [x] 1.1 Keep the introduction copy and action while avoiding the automatic price summary when the announcement shows prices.
- [x] 1.2 Verify the published and editor renderers for workshops with and without an announcement. All 854 tests, TypeScript, architecture, changed-file formatting and the 58-page review validation passed. Staging desktop and phone previews show the introduction copy without the duplicate summary.
- [x] 1.3 Publish the facts removal and deploy the updated renderer to staging and production. Both Linux candidates and both public pages passed at `80e177b6d724287a3905d2443d2bbe5c46292f93`. The introduction omits the duplicated facts and prices. The announcement shows the date, venue, prices and both checkout links.
