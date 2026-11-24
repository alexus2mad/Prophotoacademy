## ADDED Requirements

### Requirement: Manage staging content from the production admin

When it holds a dedicated staging marketing writer, the production editor SHALL let an administrator choose Staging or Prod for each page. Reading, saving, publishing, page creation, photo upload and the photo library SHALL act only on the chosen environment's marketing project. Content SHALL reach production from staging only through the confirmed sync. Staging SHALL NOT receive production credentials, and payment configuration SHALL stay per environment.

#### Scenario: Publish a page to staging from the production admin

- **WHEN** an administrator edits a page with Staging selected, saves and publishes it
- **THEN** the staging site shows the new version, the production page is unchanged, and photos uploaded meanwhile are stored in the staging marketing project.

#### Scenario: Promote a staging page to production

- **WHEN** the administrator publishes the staging version to Prod and confirms
- **THEN** the existing sync copies its photos, rewrites staging addresses and publishes it on production; staging keeps mock payments and production keeps live WayForPay.

#### Scenario: Staging target is unavailable

- **WHEN** the production runtime lacks the staging writer, the writer is shared with another credential, or the request comes from a non-production installation or a non-administrator
- **THEN** the Staging switch is not offered, staging requests are refused, and the production editor keeps working on production content.

#### Scenario: Unreleased staging features

- **WHEN** an administrator opens the staging editor
- **THEN** it keeps working against the staging project and shows a link to the same page in the main production admin.

### Requirement: Browse pages in a grouped list with live preview

The editor's page list SHALL group pages by site section and show each page's state, and on production its state on both environments. Selecting a page SHALL show its address, type, states, last change, actions and a live preview without opening the editor.

#### Scenario: Find a page and see what needs attention

- **WHEN** an administrator opens Сторінки сайту
- **THEN** pages appear under their site sections with a state for each environment: published, saved draft, different from staging or only on staging, and search filters the list by title or address.

#### Scenario: Preview a page in either environment

- **WHEN** the administrator selects a page and switches between Комп’ютер and Телефон, Чернетка and Опубліковано, or Staging and Prod
- **THEN** the preview renders that version with the site's templates, purchase controls stay inert, and nothing is saved or published.

#### Scenario: Use the list on a phone

- **WHEN** the list is used at phone width
- **THEN** the list appears first, selecting a page shows its details full width with a way back, and no content overflows horizontally.
