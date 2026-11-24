## ADDED Requirements

### Requirement: Sell an authored workshop ticket
A workshop connected to an eligible ticket SHALL start a server-priced ticket order and open the hosted payment directly on activation, without an Academy inquiry or contact form. Staging SHALL use the payment simulator. A published workshop SHALL appear once in the Academy workshop list.

#### Scenario: Purchase the studio flash intensive
- **WHEN** a visitor follows the purchase action on the published Flash without fear workshop
- **THEN** checkout identifies one ₴4,200 workshop ticket, uses the configured environment payment provider, and the verified payment follows the normal ticket confirmation and notification policy without granting course access.
