## MODIFIED Requirements

### Requirement: Isolated staging marketing access
The Academy staging editor SHALL publish only to its designated public dataset in a marketing-only staging project with a dedicated server-side credential. Public staging page reads SHALL use anonymous access to that dataset. Static review builds SHALL exclude the credential.

#### Scenario: Staging editor is enabled
- **WHEN** an operator configures a staging marketing target or credential that is missing, shared with learning, generic, or points outside the designated project and dataset
- **THEN** the staging validation rejects activation and the application cannot write with those settings.

#### Scenario: A staging administrator publishes a page and replaces its photo
- **WHEN** a staging administrator saves and publishes text and a replacement photograph
- **THEN** the public page reads the published revision and image from the marketing project, the saved draft stays private until publication and private learning continues using its original project.

#### Scenario: A non-staging installation already has a configured marketing writer
- **WHEN** that installation runs with its existing marketing token
- **THEN** the editor continues to use that configuration and keeps private learning data separate.
