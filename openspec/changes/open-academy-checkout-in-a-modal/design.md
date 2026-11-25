## Decisions

- Put the existing server-priced checkout form and summary in a shared native dialog. Use an Academy parallel route to show it over the originating page on client navigation, and use the same dialog on direct entry. Browser back closes the intercepted dialog. A direct visit closes to the associated public program or workshop where available.
- Keep checkout form styles and payment processing. Temporarily close the Academy dialog while the external payment widget is active, then restore it if the buyer cancels or payment is declined. [WayForPay widget documentation](https://wiki.wayforpay.com/en/view/852091)
- Derive the canonical lower ticket location from the first authored offer section. The top prices link by package ID to the corresponding lower cards, and package selector buttons link to the card group. The links focus their targets and preserve router history. Workshops with no lower offer retain a working top purchase action.
