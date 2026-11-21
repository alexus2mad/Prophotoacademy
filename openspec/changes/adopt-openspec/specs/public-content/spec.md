## Purpose

Publish the Academy's reviewed marketing material and let visitors use attributable student work, contact details and contextual inquiries.

## ADDED Requirements

### Requirement: Public content delivery

Public pages SHALL resolve requested slugs and content references to the appropriate program, editorial page, offering, work or image.

#### Scenario: Published program and legal content
- **WHEN** a public slug is requested
- **THEN** a matching program renders its detail page, an editorial page renders its title and rich text, and an unknown slug receives the missing-page experience.

### Requirement: About, work, reviews and contact

The Academy SHALL provide separate destinations for founder and team information, student work, source-attributed reviews, contact methods and legal terms.

#### Scenario: Reading evidence
- **WHEN** a visitor opens student work or reviews
- **THEN** work opens in its gallery and reviews link to the supplied originals. The reviews index distinguishes editorial stories from direct quotations.

#### Scenario: Choosing a contact
- **WHEN** a visitor opens Academy contacts
- **THEN** they can use the Academy's phone and email, see its configured address, and request a consultation. Hub contact details belong to the studio surface.

### Requirement: Contextual inquiries

The public inquiry flow SHALL collect a valid contact and required privacy consent, preserve the selected inquiry context, and keep optional marketing consent distinct.

#### Scenario: Asking about a package
- **WHEN** a visitor submits an inquiry for a program, offering and package that belong together
- **THEN** the inquiry retains that selection and contact preference without creating an order or booking.

#### Scenario: Invalid inquiry
- **WHEN** the contact or consent is invalid or the package belongs to another offering
- **THEN** the submission fails and no valid inquiry is recorded. The form lets the visitor correct actionable errors.

#### Scenario: Demo or local capture
- **WHEN** the form runs in static review or in local notification mode
- **THEN** static review disables submission, and a successful local capture identifies that it was stored locally.

### Requirement: Recoverable public navigation

Unrecognized public resources and unexpected rendering errors SHALL offer a recoverable visitor-facing state.

#### Scenario: Failed page load
- **WHEN** the application error boundary is shown
- **THEN** the visitor sees a retry control and a contact option rather than private error details.

### Requirement: Cross-business attribution and consent

The public ecosystem SHALL carry approved campaign dimensions on marked cross-business links and only activate configured analytics after the visitor opts in.

#### Scenario: Attributed cross-site link
- **WHEN** a visitor follows a marked ecosystem link whose incoming URL had campaign parameters
- **THEN** the destination retains its own parameters and can receive source business and sanitized campaign source, medium and name. Arbitrary incoming query values are not copied.

#### Scenario: Analytics preference
- **WHEN** configured analytics has no stored permission or the visitor declines it
- **THEN** the Google Analytics script is not loaded by the consent controller. Visitors can reopen their analytics preferences.
