# public-programs Specification

## Purpose

Give prospective students a navigable Academy catalog, course and workshop details, and an accurate next step for the offer they selected.

## Requirements

### Requirement: Program discovery

The Studio Academy index SHALL separate main courses from workshops, individual and corporate formats, camp and lecturers. The legacy catalog shall use authored categories and configured priority.

#### Scenario: Choosing a course or workshop
- **WHEN** a visitor browses the Studio index
- **THEN** the course list prioritizes Commercial, Visual, Instagram and Food programs that are present, and AI Artwork is linked in workshops.

#### Scenario: Filtering the legacy catalog
- **WHEN** the visitor selects or clears an authored category
- **THEN** the URL reflects the selection, preserving unrelated campaign parameters, and the visible programs retain their configured priority and order.

### Requirement: Program detail and purchase eligibility

A program SHALL use its own public curriculum, offer, cohort status and package rights. Buyable states shall link to server-authorized offering and package IDs. Unavailable or inquiry-led states shall explain the applicable next step.

#### Scenario: Available package
- **WHEN** a package is eligible for checkout
- **THEN** the package action links to checkout with its offering and package IDs, shows the configured amount and eligible installment notice, and does not send a price as authority.

#### Scenario: Closed or sold out
- **WHEN** enrollment is closed, a package is sold out, or checkout eligibility is absent
- **THEN** the page omits its purchase link and displays the applicable status or inquiry action. Availability copy alone does not enable checkout.

#### Scenario: Test access
- **WHEN** a course package allows explicitly configured test access to specified lessons
- **THEN** its action identifies the access flow and explains the supplied lesson scope.

### Requirement: Course and comparison details

Program pages SHALL derive schedule statements from their offering, represent unknown comparison facts explicitly, and present course-specific materials and instructors where supplied.

#### Scenario: Unknown package fact
- **WHEN** a comparison includes a benefit for which no inclusion or exclusion is established
- **THEN** the corresponding cell reports that it is unspecified.

#### Scenario: Course-specific editorial layouts
- **WHEN** a visitor opens a Studio Commercial Content or Food course
- **THEN** the editorial landing provides its own curriculum, examples, package grid and work selections. Food uses its own weekly sequence, defaults to phone work and omits the lecturer section.

### Requirement: Ticket formats

The AI Artwork workshop SHALL present each eligible ticket format as a single linked price card. The event shall use configured ticket prices, eligibility and availability.

#### Scenario: Selecting a ticket
- **WHEN** online and offline tickets are both buyable
- **THEN** each entire price card links to its own checkout and identifies format and amount in its accessible name.

#### Scenario: Unavailable event or format
- **WHEN** a format is sold out or no verified sale is configured
- **THEN** unavailable cards have no checkout link. The page shows the applicable status or inquiry and distinguishes test checkout when enabled.

### Requirement: Custom, archived and unannounced offers

The Academy SHALL keep individual and corporate training inquiry-led and distinguish unannounced programs and past events from currently sellable offers.

#### Scenario: Custom training
- **WHEN** a visitor selects individual or corporate training on the Studio Academy index
- **THEN** the program title links to details and a separate contextual action opens the relevant inquiry.

#### Scenario: Camp request
- **WHEN** a visitor asks about an unannounced camp
- **THEN** the site offers an inquiry without creating a ticket or representing dates as confirmed.

### Requirement: Dates and availability

The Academy SHALL distinguish confirmed future starts, confirmed ongoing intakes, past events, and unresolved schedules. Schedule copy shall use the authored timezone and remain separate from purchase authorization.

#### Scenario: Past start with unconfirmed ongoing admission
- **WHEN** a cohort's start has passed and ongoing admission has not been confirmed
- **THEN** the page does not advertise a next start or imply permission to join the cohort simply from its historical date.

#### Scenario: Timed event
- **WHEN** the event has an authored local start and end time
- **THEN** the event summary and checkout preserve the event's local schedule, including daylight-saving differences.
