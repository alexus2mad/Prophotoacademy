# public-navigation Specification

## Purpose

Help visitors find the appropriate ProPhoto destination across Academy marketing pages, homepage tabs and historic catalog links.

## Requirements

### Requirement: Explicit marketing presentation

The Academy SHALL use the configured Studio or legacy marketing design. An omitted setting selects legacy. An unknown value fails configuration.

#### Scenario: Opening the same program in each design
- **WHEN** a visitor follows a program URL under either supported design
- **THEN** the applicable presentation uses the same program and offering identities.

### Requirement: Manually selected homepage

The Studio homepage SHALL start in Academy for an ordinary visit and display the selected brand's hero and body together on desktop and mobile.

#### Scenario: Changing brand
- **WHEN** the visitor selects Studio or Shop using the hero tabs or the matching header link
- **THEN** the fragment identifies the selected brand, only its body content is mounted, and the tab and panel expose their relationship to assistive technology.

#### Scenario: Returning to a brand
- **WHEN** the visitor opens a brand fragment directly or uses browser history
- **THEN** the homepage shows the corresponding brand. Time spent on the page alone never changes that selection.

### Requirement: Direct section navigation

Brand and section links SHALL lead to the appropriate visible content, including when opened from another page. Section targets shall account for fixed navigation.

#### Scenario: Deep link into a brand
- **WHEN** a visitor opens the homepage at `#equipment-selection` or `#spaces`
- **THEN** the matching Shop or Studio panel is selected so the destination can be reached.

#### Scenario: Opening a course curriculum
- **WHEN** the Program link on an editorial course landing is activated
- **THEN** the curriculum disclosure opens and the target is positioned below the page's sticky navigation.

### Requirement: Academy index and legacy entry points

The public Academy program index SHALL be available at `/academy`. Live Academy requests to `/courses` and `/page-in-progress` shall permanently redirect there with their query parameters.

#### Scenario: Old attributed catalog URL
- **WHEN** a Studio-design visitor opens `/courses?category=course&utm_source=example`
- **THEN** the response is a 301 to the Academy index retaining the query and targeting the courses section.

#### Scenario: Legacy static export bookmark
- **WHEN** a reader opens the old catalog URL in the GitHub Pages review
- **THEN** they can read the Academy index at that URL without requiring server redirects.

### Requirement: Accessible destination controls

The Studio header SHALL offer the three brand destinations, contacts, account entry and a keyboard-operable menu. The footer shall expose the dedicated ecosystem pages, Academy social profiles and legal links.

#### Scenario: Choosing a business from navigation
- **WHEN** a visitor uses a main header brand link
- **THEN** it leads to the corresponding homepage fragment. The dedicated Studio and Shop pages remain reachable from the footer.

#### Scenario: Activating a direction card
- **WHEN** a visitor activates any part of a homepage direction card
- **THEN** its single named action follows its destination or opens its contextual inquiry dialog.
