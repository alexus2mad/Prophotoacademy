## MODIFIED Requirements

### Requirement: Hosted payment for a published workshop ticket

For an editor-authored workshop bound to an eligible catalog ticket offer, the Academy SHALL validate and record the buyer's name, email, phone and consent through Academy checkout before starting payment for the selected server-priced package. Each environment SHALL use its own provider settings.

#### Scenario: Direct purchase and retry

- **WHEN** a visitor submits valid contact details and consent for an eligible workshop ticket, or retries the same interrupted submission
- **THEN** the API records one order with those contacts and the catalog amount and currency, and a duplicate request reuses the order.

#### Scenario: Choose one of several formats

- **WHEN** a visitor submits Academy checkout for the online ticket
- **THEN** the order records the online package at its current catalog price.

#### Scenario: Ineligible or unpublished ticket

- **WHEN** mandatory contact or consent is missing, the offer is closed, the ticket is unbound, the page exists only as a draft, or the package does not belong to the offer
- **THEN** the request cannot create an order.

#### Scenario: Verified ticket confirmation

- **WHEN** WayForPay verifies payment for a workshop order
- **THEN** the purchase is accounted for once, normal ticket notifications use the recorded checkout contacts, and the order grants no course entitlement. Previously issued hosted orders still use their existing callback and contact handling.

#### Scenario: Staging purchase

- **WHEN** a visitor completes a workshop order in the staging simulator
- **THEN** the visitor can exercise the successful outcome without a real charge, ticket issuance, confirmation email, or live financial effects.
