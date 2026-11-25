## 1. Implement and verify

- [x] 1.1 Share the checkout modal between direct access and program or workshop navigation. Remove the checkout-specific return-to-programs control.
- [x] 1.2 Link Flash package selectors and top prices to the lower ticket cards with unique, corresponding targets.
- [x] 1.3 Verify keyboard and touch behavior, direct and in-page checkout, payment handoff, anchors, and repository checks. Desktop and phone browser checks exercised cross, Escape, browser Back, scroll and focus restoration, direct checkout dismissal and repeated opening. The phone check also reloaded at the ticket group and used the same anchor again, verifying scroll, URL and history. A local fake payment widget verified cancellation and decline without creating a live order.

## 2. Release

- [x] 2.1 Deploy the verified revision on staging and production and check both public checkout formats and anchor targets. Both environments run `8330a9733d30a145b3c98d583880a5d9e349c605`. Candidate and HTTPS checks verified the offline and online forms, required buyer details, and unique ticket targets. Browser checks on staging and production exercised the ticket anchors, the repeated phone package jump after reload, and checkout dismissal. Live verification stopped at the form.
