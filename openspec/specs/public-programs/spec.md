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

### Requirement: Editorial copy agrees with package conditions

Package descriptions and editorial introductions SHALL distinguish known delivery and support levels.

#### Scenario: Compare Commercial tiers and Instagram BASE
- **WHEN** a visitor reads Commercial course delivery information or compares Instagram BASE
- **THEN** Commercial BASE is described as self-paced, workshop and lecture conditions are qualified by package, and excluded comparison facts do not describe the excluded service as included.

### Requirement: Food photography editorial course landing

The Studio Food and Product Photography landing SHALL present its own responsive editorial story, work collection and package comparison using its managed content and actual offers.

#### Scenario: Browse on a phone or desktop
- **WHEN** a visitor opens the Food course
- **THEN** the responsive hero, ten browsable benefits, two-row 31-photo gallery, curriculum, format and reviews follow the designer’s order, and keyboard and touch users can reach the final items.

#### Scenario: Compare and select a package
- **WHEN** a visitor compares the three packages
- **THEN** each price, summary and eligible purchase action is visible with details closed, and opening details reveals that package’s inclusions and eligible installment information without triggering checkout.

#### Scenario: Edit Food content or visit another course
- **WHEN** an administrator edits Food content or a visitor opens a different program
- **THEN** supported editorial fields and block placements survive, Food-specific presentation stays scoped, and existing program, payment and accessibility rules hold.

### Requirement: Sell an authored workshop ticket

A workshop connected to an eligible ticket SHALL open Academy checkout for the selected package. A published workshop SHALL appear once in the Academy workshop list.

#### Scenario: Purchase the studio flash intensive

- **WHEN** a visitor selects a purchase action in the lower ticket cards on the published Flash without fear workshop
- **THEN** the Academy checkout dialog shows that format and its current catalog amount, ₴3,700 for offline or ₴2,500 for online, and asks for buyer details before payment.

#### Scenario: Navigate to the Flash ticket cards

- **WHEN** a visitor chooses a top price or an «Обрати пакет» selector on the published Flash without fear workshop
- **THEN** the top price links to the matching lower ticket card, and the package selector links to the lower card group. Every fragment resolves to one existing target on desktop and mobile.

### Requirement: Consistent published workshop entries
The Academy workshop listing SHALL present published editor-created workshops with the same title hierarchy, details action, separators and responsive layout as the existing featured workshop.

#### Scenario: Browse workshops from the homepage
- **WHEN** a visitor follows the Workshops direction on the Academy homepage
- **THEN** the published workshop appears once in the workshop list, and its row opens the workshop at its own public URL on desktop and mobile.

### Requirement: Food photography video and gallery action

The Food and Product Photography course SHALL place its approved course video immediately beneath the CTA in the first pricing section and its primary course action immediately beneath the student-work gallery.

#### Scenario: Watch the course video

- **WHEN** a visitor reaches the early price section on a phone or desktop
- **THEN** the video appears below the packages CTA, fits the available width at its appropriate aspect ratio, and can be played inline using its controls.

#### Scenario: Continue after browsing student work

- **WHEN** a visitor finishes browsing the Food gallery
- **THEN** the visible CTA under its navigation leads to the Food package cards for an open offer or opens the applicable inquiry for a closed offer.
