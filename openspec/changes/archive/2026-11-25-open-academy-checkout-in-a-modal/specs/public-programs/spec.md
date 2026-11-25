## MODIFIED Requirements

### Requirement: Sell an authored workshop ticket

A workshop connected to an eligible ticket SHALL open Academy checkout for the selected package. A published workshop SHALL appear once in the Academy workshop list.

#### Scenario: Purchase the studio flash intensive

- **WHEN** a visitor selects a purchase action in the lower ticket cards on the published Flash without fear workshop
- **THEN** the Academy checkout dialog shows that format and its current catalog amount, ₴3,700 for offline or ₴2,500 for online, and asks for buyer details before payment.

#### Scenario: Navigate to the Flash ticket cards

- **WHEN** a visitor chooses a top price or an «Обрати пакет» selector on the published Flash without fear workshop
- **THEN** the top price links to the matching lower ticket card, and the package selector links to the lower card group. Every fragment resolves to one existing target on desktop and mobile.
