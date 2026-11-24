## ADDED Requirements

### Requirement: Publish staging pages to production from the editor

The production editor SHALL let an administrator review published staging pages that are new on production or differ from it, and publish a chosen page to production. The staging editor SHALL hand a published page over to that production confirmation. Staging SHALL NOT receive production credentials, and a sync SHALL NOT change either environment's payment configuration.

#### Scenario: Review differences before syncing

- **WHEN** an administrator opens **Зміни зі staging** in the production editor
- **THEN** it lists each new or changed staging page with its changed blocks, the photos to copy, any production draft that publication would replace and any ticket that will sell through production checkout, and it reports how many pages already match.

#### Scenario: Publish a staging page to production

- **WHEN** the administrator confirms publication of a listed page
- **THEN** its photos are copied into the production marketing project, its staging image and link addresses become production addresses, the page passes production validation and becomes publicly visible on production, and the list no longer shows it as different.

#### Scenario: Start from the staging editor

- **WHEN** an administrator chooses **Опублікувати на проді** for a published staging page without unsaved changes or an unpublished draft
- **THEN** the production editor opens that page's confirmation, under the administrator's production session, and nothing is published until they confirm there.

#### Scenario: Content changes after review

- **WHEN** the staging page or the production page has changed since the list was loaded
- **THEN** the sync stops with a conflict and nothing is published, and the refreshed list shows the current difference.

#### Scenario: Keep payment settings per environment

- **WHEN** a workshop page bound to a ticket is synced
- **THEN** production sells the ticket through its own live WayForPay checkout, staging stays in mock payment mode, and synced content containing payment provider or staging addresses is rejected.

#### Scenario: Deny sync outside production administration

- **WHEN** a signed-out user, a non-administrator, a staging installation or an unconfigured editor requests the sync list or a sync
- **THEN** the request is refused without reading or writing production content, and production pages that exist only on production are never deleted.
