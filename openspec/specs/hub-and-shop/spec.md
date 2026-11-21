# hub-and-shop Specification

## Purpose

Connect visitors to studio rental, guided practice and equipment selection while preserving each business's location and transaction boundaries.

## Requirements

### Requirement: Ecosystem destinations

The Studio design SHALL offer dedicated Studio and Shop landing pages. Booking actions shall lead to the public Hub booking page and Shop destination actions to the configured ProPhoto Shop Instagram profile.

#### Scenario: Dedicated brand page
- **WHEN** a visitor follows the Academy footer's Studio or Shop link
- **THEN** they reach the corresponding in-site landing. Studio room and booking links and Shop equipment links provide the onward handoff.

#### Scenario: Legacy compatibility
- **WHEN** a visitor requests the dedicated Studio or Shop route using the legacy presentation
- **THEN** the Studio route redirects to Hub and the Shop route redirects to Academy contacts.

#### Scenario: Equipment selection
- **WHEN** a visitor selects equipment categories on the Shop panel
- **THEN** the selection contributes to the equipment inquiry and can be changed before submission.

### Requirement: Hub host and identity

Hub SHALL serve its own marketing and booking surface, contacts, arrival details and canonical URLs, with the student account on the configured Academy origin.

#### Scenario: Requesting Hub content on the appropriate host
- **WHEN** a visitor opens an eligible Hub-host marketing route
- **THEN** the Hub page is rendered at its public path. A request to an account page on that host is redirected to the configured HTTPS Academy origin with path and query.

#### Scenario: Academy preview compatibility
- **WHEN** the Hub route prefix is requested on an Academy host with an HTTPS Hub origin configured
- **THEN** the redirect goes to the corresponding Hub path and retains its search parameters.

### Requirement: Room rental and booking

Hub SHALL describe its rooms, hourly rates, minimum hire and available features. Availability and reservations shall be handled by the configured booking provider.

#### Scenario: Booking from a room detail
- **WHEN** a visitor selects a room's availability action
- **THEN** Hub opens its booking page with the known room key and offers the provider calendar, a direct calendar link, and a telephone fallback. Unknown room keys lead to general booking.

#### Scenario: Static review
- **WHEN** a visitor opens the review booking page
- **THEN** the review identifies the external booking destination instead of taking a reservation in the static site.

### Requirement: Guided practice

Hub SHALL distinguish an interest-stage practice session from a complete, verified upcoming session. Paused or unknown sessions shall be unavailable.

#### Scenario: Session under preparation
- **WHEN** a non-paused session lacks confirmed scheduling, capacity, price, equipment, preparation or deliverables
- **THEN** the page invites interest and distinguishes its provisional details from a confirmed booking.

#### Scenario: Ready practice
- **WHEN** the verified open session has the required logistics and a current or future date
- **THEN** its detail page can show the confirmed terms and, where a matching enrollment offer exists, its package options.
