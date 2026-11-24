## ADDED Requirements

### Requirement: Install the visual editor skill from staging
Staging SHALL provide a public installation page with a single cross-platform terminal command and a manual ZIP download containing the canonical visual editor skill. Downloading the skill SHALL require neither a repository checkout nor an Academy account.

#### Scenario: Install on a manager's machine
- **WHEN** the manager runs the advertised command with a supported Node.js and npm installation
- **THEN** the skill is installed for the current user's Codex and Claude Code, or only the agent explicitly selected, and starting an agent session makes it available to invoke.

#### Scenario: Repeat or update safely
- **WHEN** a manager installs again or installs a newer release
- **THEN** matching files remain usable, managed files can be updated, and local edits are reported and preserved.

#### Scenario: Download the same skill across application releases
- **WHEN** someone follows the staging download link or uses a previously published versioned CLI URL after an application update
- **THEN** the download remains available, the CLI version retains its original bytes, and using the installed skill to edit a page still requires the usual editor session and privileges.
