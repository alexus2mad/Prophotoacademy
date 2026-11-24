- [x] Deliver a self-contained editor skill, project discovery for Codex and Claude Code, and a team installation guide.
- [x] Validate the skill metadata and portable distribution, and exercise the workflow against an isolated editor.
- [x] Independently check draft, conflict and publication decisions, then validate and archive the specification.

## Verification

- Extracted the distributable ZIP into an empty directory and validated its skill metadata. Checked that the Claude project entry resolves to the same instructions and that the ZIP contains only the portable skill and launcher metadata.
- In a disposable editor, a synthetic manager created «Світло в кадрі» from the article template, inserted a paragraph before the photograph, saved, and reopened the page through search. Preview widths of 390px and 1280px preserved the requested order. Anonymous reads returned 404 while it was a draft.
- A separate local publish run hit validation for the unfinished template. After completing its paragraph and selecting and describing a library photo, the editor confirmed publication. A fresh signed-out browser received HTTP 200 and saw the expected title and paragraph.
- An independent agent worked through a production reference URL, a preview request, another contributor’s draft, a stale revision and an inconsistent ticket price. Corrected the toolbar placement instructions and made the expected draft and offer handling explicit.
- Forty focused editor tests, TypeScript and architecture checks passed. Repository formatting passed with the Windows checkout’s native line endings; the default LF-only formatter flagged 235 existing CRLF files.
