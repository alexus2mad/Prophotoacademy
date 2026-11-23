- [x] Bind the production editor to its own marketing project and verify isolation and compatibility.
- [x] Seed approved pages and verify a private draft and a public publication.
- [x] Promote the verified release with live settings, verify checkout and protected routes, and retain one previous release.

Staging and production serve `75b7828` from separate environment builds. Production uses `qy8emt0h/production`. All 18 seed pages matched the approved content. A saved private draft reopened correctly, the anonymous reader saw the published version, and publishing the approved copy succeeded. Production browser checks covered 390px and 1440px, the three Food package destinations, checkout rendering and the signed-out editor boundary. The release preserved payment and notification settings and retained production `b081a5d` and staging `121dfd2` for rollback.
