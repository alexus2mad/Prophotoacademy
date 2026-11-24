## Context

The canonical skill contains instructions and Codex display metadata. Both agents can load its SKILL.md. A manager may have either or both agents installed independently of this project.

## Decisions

- Build a ZIP and a self-contained npm tarball from an explicit list of canonical files. Normalize text to LF and archive with fixed timestamps. Publish the SHA-256 digests alongside the downloads.
- Use a pinned HTTPS tarball and one executable, invoked by npx. Include no registry dependencies or lifecycle scripts. The installer validates the bundled skill before writing into the current user's skill directories. It checks all selected targets before updating managed files and records the installed digests for future updates.
- Serve a stable installation page and ZIP on the staging origin. Serve versioned CLI payloads immutably, update the public files together and verify before activation. Keep staging downloads independent of application releases.

## Verification and recovery

Compare the ZIP and installed files with the canonical skill, exercise an isolated clean install and rerun, and check anonymous staging delivery. Preserve custom files when a local installation differs. A bad static release can be rolled back independently of the application.
