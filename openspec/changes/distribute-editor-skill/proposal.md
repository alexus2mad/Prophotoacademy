## Why

Designers and content managers need to install the visual editor skill on their own machines. Checking out Academy source code is unnecessary for working in the browser editor.

## What Changes

- Publish a Ukrainian installation page, a manual download and a versioned CLI package on staging.
- Provide one cross-platform command to install the same skill for Codex and Claude Code. Allow installation for a single agent.
- Verify installed content, repeat installations and public downloads against the repository skill.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `site-page-editing` gains a public staging distribution channel for the editor skill.

## Impact

The change affects skill packaging, staging static-file delivery and the editor guide. Existing editor authorization governs all subsequent editing.
