## MODIFIED Requirements

### Requirement: Program discovery

The Studio Academy index SHALL separate main courses from workshops, individual and corporate formats, camp and lecturers. The legacy catalog shall use authored categories and configured priority.

#### Scenario: Choosing a course or workshop

- **WHEN** a visitor browses the Studio index
- **THEN** the course list prioritizes Food, Commercial, Visual and Instagram programs that are present, and AI Artwork is linked in workshops.

#### Scenario: Filtering the legacy catalog

- **WHEN** the visitor selects or clears an authored category
- **THEN** the URL reflects the selection, preserving unrelated campaign parameters, and the visible programs retain their configured priority and order.

## ADDED Requirements

### Requirement: Closed course available in recordings

A closed course offering MAY be marked as available in recordings. Such an offering SHALL remain unpurchasable and SHALL present «Доступно в записі» wherever other closed offerings present «Набір закрито».

#### Scenario: Viewing a recorded closed course

- **WHEN** a visitor views the catalog entry, course page, packages or checkout of a closed offering marked as available in recordings
- **THEN** the status reads «Доступно в записі», no purchase link is offered, and an inquiry remains available.

#### Scenario: Other closed courses

- **WHEN** a closed offering has no recordings marker
- **THEN** its status continues to read «Набір закрито».
