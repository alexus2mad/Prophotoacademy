## Why

Flash without fear starts payment before Academy collects buyer contacts.

## What Changes

- Open Academy checkout from every ticket action, preselecting the chosen format.
- Require consent and save buyer contacts before opening payment. Preserve the configured prices and environment payment modes.
- Publish the requested cover facts in staging and production through the existing inspector.

## Capabilities

### Modified Capabilities

- `checkout-and-fulfillment`: Require buyer identification for new workshop orders.
- `public-programs`: Route authored workshop tickets through Academy checkout.

## Impact

Workshop ticket links, checkout order creation and the published Flash page in both environments.
