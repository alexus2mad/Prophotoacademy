## MODIFIED Requirements

### Requirement: Hosted payment for a published workshop ticket

For an editor-authored workshop bound to an eligible catalog ticket offer, the Academy SHALL create a server-priced ticket order on an intentional purchase action for the package the visitor chose. An offer MAY define several packages, such as offline and online participation. The configured live provider SHALL collect buyer contact information. Each environment SHALL use its own provider settings.

#### Scenario: Direct purchase and retry

- **WHEN** a visitor activates a published workshop’s ticket button or retries the same interrupted request
- **THEN** the action opens the configured hosted payment for a single order with the catalog amount and currency, and a duplicate request reuses the order

#### Scenario: Choose one of several formats

- **WHEN** a workshop offers offline and online tickets and the visitor activates the online ticket
- **THEN** the order records the online package and charges its catalog amount, not the offline amount or a displayed previous price

#### Scenario: Ineligible or unpublished ticket

- **WHEN** the offer is closed, the ticket is unbound, the page exists only as a draft, or the requested package is not one of the offer's packages
- **THEN** the payment endpoint rejects the request before creating an order

#### Scenario: Verified ticket confirmation

- **WHEN** WayForPay confirms the order with the valid merchant signature and order-bound callback proof
- **THEN** the purchase is accounted for once, the normal ticket notifications use the available provider contact details, and the order grants no course entitlement

#### Scenario: Staging purchase

- **WHEN** a visitor purchases a workshop ticket in the staging simulator
- **THEN** the visitor can exercise the successful outcome without a real charge, ticket issuance, confirmation email, or live financial effects
