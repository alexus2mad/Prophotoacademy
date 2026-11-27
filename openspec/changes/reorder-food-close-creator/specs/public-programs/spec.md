## MODIFIED Requirements

### Requirement: Program discovery

The Studio Academy index SHALL separate main courses from workshops, individual and corporate formats, camp and lecturers. The legacy catalog shall use authored categories and configured priority.

#### Scenario: Choosing a course or workshop

- **WHEN** a visitor browses the Studio index
- **THEN** the course list prioritizes Food, Commercial, Visual and Instagram programs that are present and listed, and AI Artwork is linked in workshops.

#### Scenario: Filtering the legacy catalog

- **WHEN** the visitor selects or clears an authored category
- **THEN** the URL reflects the selection, preserving unrelated campaign parameters, and the visible programs retain their configured priority and order.

## ADDED Requirements

### Requirement: Archived programs

A program MAY be archived. An archived program SHALL be omitted from public course lists, the catalog, the sitemap and the page editor, and its page SHALL not render. Its content, offering and packages SHALL remain stored so administrators, enrolled students and a later restoration keep them.

#### Scenario: Visiting an archived course

- **WHEN** a visitor opens the address of the archived Content Creator course
- **THEN** a temporary redirect takes them to the homepage, and no course list or sitemap links to it.

#### Scenario: Restoring a course

- **WHEN** an administrator clears the archive flag and the redirect
- **THEN** the course reappears in lists and its page renders from the retained content.

### Requirement: Closed course available in recordings

A closed course SHALL remain unpurchasable and SHALL present «Доступно в записі» wherever a closed offering previously presented «Набір закрито».

#### Scenario: Viewing a closed course

- **WHEN** a visitor views the catalog entry, course page, packages or checkout of a closed course
- **THEN** the status reads «Доступно в записі», no purchase link is offered, and an inquiry about access remains available.

#### Scenario: Closed non-course program

- **WHEN** a closed offering belongs to a program other than a course
- **THEN** its status continues to read «Набір закрито».
